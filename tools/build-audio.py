"""
THE LAST WITNESS — audio pipeline
---------------------------------
Procedurally synthesises every sound cue used by the experience (no external
audio downloads, no broken URLs) and encodes them to compact MP3 files.

Run:  python3 tools/build-audio.py
"""
import os
import subprocess
import tempfile
import wave
import numpy as np
import imageio_ffmpeg

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "assets", "audio")
os.makedirs(OUT, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
rng = np.random.default_rng(20261124)


# ------------------------------------------------------------------ helpers
def tt(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR), dtype=np.float64) / SR


def noise(dur: float) -> np.ndarray:
    return rng.normal(0, 1, int(dur * SR))


def sine(freq, dur: float, phase: float = 0.0) -> np.ndarray:
    f = np.full(int(dur * SR), float(freq)) if np.isscalar(freq) else np.asarray(freq, dtype=float)
    ph = 2 * np.pi * np.cumsum(f) / SR + phase
    return np.sin(ph)


def saw(freq, dur: float, detune: float = 0.0) -> np.ndarray:
    f = np.full(int(dur * SR), float(freq) + detune)
    ph = np.cumsum(f) / SR
    return 2 * (ph % 1.0) - 1


def env_ad(n: int, attack: float, decay: float, curve: float = 3.0) -> np.ndarray:
    a = max(1, int(attack * SR))
    d = max(1, n - a)
    e = np.concatenate([np.linspace(0, 1, a) ** 0.6, np.linspace(1, 0, d) ** curve])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def fade(sig: np.ndarray, fin: float, fout: float) -> np.ndarray:
    n = len(sig)
    a, b = int(fin * SR), int(fout * SR)
    out = sig.copy()
    if a > 0:
        out[:a] *= np.linspace(0, 1, a) ** 0.8
    if b > 0:
        out[-b:] *= np.linspace(1, 0, b) ** 0.8
    return out


def one_pole_lp(x: np.ndarray, cutoff: float) -> np.ndarray:
    dt = 1.0 / SR
    rc = 1.0 / (2 * np.pi * cutoff)
    alpha = dt / (rc + dt)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def biquad(x: np.ndarray, kind: str, f0: float, q: float = 0.7, gain_db: float = 0.0) -> np.ndarray:
    """RBJ audio EQ cookbook biquad, vectorised with scipy-free lfilter loop."""
    w0 = 2 * np.pi * f0 / SR
    cw, sw = np.cos(w0), np.sin(w0)
    alpha = sw / (2 * q)
    A = 10 ** (gain_db / 40)
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "bp":
        b = [alpha, 0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "peak":
        b = [1 + alpha * A, -2 * cw, 1 - alpha * A]
        a = [1 + alpha / A, -2 * cw, 1 - alpha / A]
    else:
        raise ValueError(kind)
    b0, b1, b2 = (v / a[0] for v in b)
    a1, a2 = a[1] / a[0], a[2] / a[0]
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        xi = x[i]
        yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1 = x1, xi
        y2, y1 = y1, yi
        y[i] = yi
    return y


def fftconv(x: np.ndarray, h: np.ndarray) -> np.ndarray:
    n = len(x) + len(h) - 1
    m = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)
    return y[: len(x) + len(h) - 1]


def impulse_response(dur: float, decay: float, tone: float = 0.5) -> np.ndarray:
    n = int(dur * SR)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (SR * decay))
    ir = one_pole_lp(ir, 1800 + tone * 5000)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / (np.abs(ir).max() + 1e-9)


IR_PLATE = impulse_response(2.6, 0.55)
IR_ROOM = impulse_response(3.6, 0.9, 0.2)


def reverb(x: np.ndarray, mix: float = 0.35, ir: np.ndarray = IR_ROOM) -> np.ndarray:
    wet = fftconv(x, ir)[: len(x) + int(1.2 * SR)]
    dry = np.pad(x, (0, max(0, len(wet) - len(x))))
    return dry * (1 - mix) + wet * mix


def loopify(sig: np.ndarray, xfade: float = 1.5) -> np.ndarray:
    """Crossfade the tail into the head so the file loops without a click."""
    n = int(xfade * SR)
    if len(sig) < 2 * n:
        return sig
    head, tail = sig[:n].copy(), sig[-n:].copy()
    mix = np.linspace(0, 1, n) ** 0.5
    body = sig[n:-n].copy()
    return np.concatenate([head * mix + tail * (1 - mix), body])


def fit(a: np.ndarray, n: int) -> np.ndarray:
    """Pad or trim a signal to exactly n samples."""
    if len(a) >= n:
        return a[:n]
    return np.pad(a, (0, n - len(a)))


def norm(sig: np.ndarray, peak: float = 0.86) -> np.ndarray:
    m = np.abs(sig).max()
    return sig * (peak / m) if m > 1e-9 else sig


def encode(name: str, sig: np.ndarray, mono: bool = True) -> None:
    sig = np.nan_to_num(sig)
    sig = np.clip(norm(sig, 0.9), -1, 1)
    data = (sig * 32767).astype("<i2")
    if not mono and data.ndim == 1:
        data = np.stack([data, data], axis=1).reshape(-1)
    channels = 1 if mono else 2
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    out = os.path.join(OUT, f"{name}.mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", wav_path, "-codec:a", "libmp3lame",
         "-b:a", "96k", "-ar", "44100", out],
        check=True,
    )
    os.unlink(wav_path)
    print(f"  {name}.mp3  {os.path.getsize(out)/1024:.0f} KB")


# ------------------------------------------------------------------ sounds
def ambience_room():
    dur = 52.0
    rumble = one_pole_lp(noise(dur), 75) * 3.2
    hum = (sine(50, dur) * 0.5 + sine(100, dur) * 0.28 + sine(150, dur) * 0.12)
    hum *= 1 + 0.12 * np.sin(2 * np.pi * 0.31 * tt(dur))
    air = biquad(noise(dur), "bp", 2600, 0.6) * 0.05
    seine = one_pole_lp(noise(dur), 220) * 0.5 * (0.4 + 0.6 * np.sin(2 * np.pi * 0.07 * tt(dur)) ** 2)
    sig = rumble * 0.5 + hum * 0.16 + air + seine * 0.25
    # a single distant metal tick, far away
    tick = np.zeros_like(sig)
    pos = int(23.5 * SR)
    length = int(1.4 * SR)
    tck = noise(1.4) * env_ad(length, 0.002, 1.4, 4.5)
    tck = biquad(tck, "bp", 1450, 4) * 0.5
    tick[pos:pos + length] += tck[: len(tick) - pos]
    sig = reverb(sig, 0.3, IR_ROOM) + reverb(tick, 0.85, IR_ROOM) * 0.5
    encode("ambience-room", loopify(fade(sig, 3, 3)))


def drone_tension():
    dur = 62.0
    t = tt(dur)
    base = saw(55, dur) * 0.35 + saw(55, dur, 0.7) * 0.25
    sub = sine(27.5, dur) * 0.5
    dis = sine(77.8, dur) * 0.12 + sine(116.5, dur) * 0.05
    lfo = 0.55 + 0.45 * np.sin(2 * np.pi * 0.045 * t + 1.2)
    body = one_pole_lp(base, 320) * lfo
    high = biquad(noise(dur), "bp", 3200, 1.6) * 0.035 * (0.4 + 0.6 * np.sin(2 * np.pi * 0.09 * t) ** 2)
    sig = body * 0.9 + sub * 0.55 + dis * (0.6 + 0.4 * np.sin(2 * np.pi * 0.021 * t)) + high
    encode("drone-tension", loopify(fade(reverb(sig, 0.28, IR_PLATE), 4, 4)))


def static_noise():
    dur = 6.0
    s = biquad(noise(dur), "hp", 900, 0.7) * 0.55
    s += biquad(noise(dur), "bp", 2400, 0.9) * 0.3
    crackle = np.zeros_like(s)
    for _ in range(90):
        p = rng.integers(0, len(s) - 400)
        crackle[p:p + 120] += rng.normal(0, 1, 120) * rng.uniform(0.2, 1.0)
    gate = (rng.random(len(s)) > 0.02).astype(float)
    sig = (s + crackle * 1.6) * gate
    encode("static", loopify(fade(sig, 0.4, 0.4, ) if False else fade(sig, 0.4, 0.4), 0.6))


def impact():
    dur = 3.4
    t = tt(dur)
    f = 68 * np.exp(-t * 1.4) + 26
    boom = sine(f, dur) * env_ad(len(t), 0.004, 3.4, 2.6)
    burst = one_pole_lp(noise(dur), 420) * env_ad(len(t), 0.002, 0.35, 3.0) * 0.8
    ring = (sine(190, dur) * 0.5 + sine(287, dur) * 0.3) * env_ad(len(t), 0.01, 2.0, 3.4) * 0.12
    sig = boom * 0.9 + burst + ring
    encode("impact", reverb(sig, 0.4, IR_ROOM))


def footsteps():
    dur = 12.0
    sig = np.zeros(int(dur * SR))
    tpos = 0.6
    amp = 0.9
    while tpos < dur - 1.0:
        n = int(0.22 * SR)
        step = noise(0.22) * env_ad(n, 0.004, 0.22, 5.0)
        step = one_pole_lp(step, 360) * 1.6 + biquad(step, "bp", 900, 1.2) * 0.25
        p = int(tpos * SR)
        sig[p:p + n] += step[: max(0, len(sig) - p)] * amp
        tpos += rng.uniform(0.62, 0.78)
        amp *= 0.965
    encode("footsteps", reverb(fade(sig, 0.2, 1.2), 0.62, IR_ROOM))


def door_metal():
    dur = 5.2
    t = tt(dur)
    scrape_n = noise(dur)
    mod = 0.5 + 0.5 * np.sin(2 * np.pi * 7.5 * t + 3 * np.sin(2 * np.pi * 0.7 * t))
    scrape = biquad(scrape_n, "bp", 1750, 3.2) * mod * np.linspace(0, 1, len(t)) ** 2
    scrape *= (t < 2.3)
    slam = np.zeros_like(t)
    p = int(2.45 * SR)
    n = len(t) - p
    tt2 = np.arange(n) / SR
    hit = sine(48 * np.exp(-tt2 * 2.0) + 22, n / SR) * env_ad(n, 0.003, 3.4, 2.4)
    hit += one_pole_lp(rng.normal(0, 1, n), 700) * env_ad(n, 0.002, 0.4, 3.2) * 0.9
    hit += (sine(233, n / SR) * 0.4 + sine(348, n / SR) * 0.25 + sine(517, n / SR) * 0.12) * env_ad(n, 0.004, 2.2, 3.6) * 0.3
    slam[p:] += hit
    sig = scrape * 0.55 + slam
    encode("door-metal", reverb(fade(sig, 0.05, 0.8), 0.5, IR_ROOM))


def reveal_score():
    dur = 58.0
    t = tt(dur)
    chords = [(55.0, [220, 261.6, 329.6, 440]),      # Am
              (48.9, [196, 233, 293.7, 392]),        # something darker
              (43.6, [174.6, 220, 261.6, 349.2]),    # F-ish
              (49.0, [196, 246.9, 293.7, 415.3])]    # E-ish
    sig = np.zeros(int(dur * SR))
    seg = dur / len(chords)
    for i, (root, notes) in enumerate(chords):
        s0 = int(i * seg * SR)
        s1 = min(len(sig), int((i + 1) * seg * SR) + int(3 * SR))
        n = s1 - s0
        local = np.zeros(n)
        for k, f in enumerate(notes):
            v = sine(f, n / SR, phase=rng.uniform(0, 6.3)) * 0.22
            v += saw(f * 1.002, n / SR) * 0.07
            v *= 1 + 0.25 * np.sin(2 * np.pi * (4.2 + k) * np.arange(n) / SR)
            local += one_pole_lp(v, 2400)
        local += sine(root, n / SR) * 0.5
        local *= np.concatenate([np.linspace(0, 1, int(1.6 * SR)) ** 1.4,
                                 np.ones(max(0, n - int(3.2 * SR))),
                                 np.linspace(1, 0.25, min(n, int(1.6 * SR)))])[:n]
        sig[s0:s1] += local[: s1 - s0]
    # heartbeat enters late
    hb = np.zeros_like(sig)
    beat = 0.0
    while beat < dur - 1:
        for off, amp in ((0.0, 1.0), (0.34, 0.62)):
            p = int((beat + off) * SR)
            n = int(0.4 * SR)
            if p + n < len(hb):
                tt3 = np.arange(n) / SR
                th = sine(52 * np.exp(-tt3 * 6) + 33, n / SR) * env_ad(n, 0.004, 0.4, 3.0)
                hb[p:p + n] += th * amp * min(1.0, beat / 30)
        beat += 1.05
    n = len(sig)
    sig = fit(reverb(sig, 0.42, IR_PLATE), n) + fit(hb, n) * 0.5
    # slow reverse swell at the very end for the cut
    sig[-int(2 * SR):] *= np.linspace(1, 0, int(2 * SR)) ** 0.7
    encode("reveal-score", fade(sig, 1.5, 2.0))


def heartbeat_loop():
    dur = 12.0
    sig = np.zeros(int(dur * SR))
    beat = 0.2
    while beat < dur - 0.6:
        for off, amp in ((0.0, 1.0), (0.33, 0.66)):
            p = int((beat + off) * SR)
            n = int(0.45 * SR)
            if p + n < len(sig):
                tt3 = np.arange(n) / SR
                th = sine(50 * np.exp(-tt3 * 6.5) + 31, n / SR) * env_ad(n, 0.005, 0.45, 3.0)
                sig[p:p + n] += th * amp
        beat += 1.0
    encode("heartbeat", loopify(reverb(sig, 0.25, IR_ROOM), 0.8))


def flicker():
    dur = 2.2
    t = tt(dur)
    gate = np.ones_like(t)
    for _ in range(9):
        p = rng.integers(0, len(t) - 2000)
        gate[p:p + rng.integers(600, 3000)] = rng.uniform(0.05, 0.4)
    buzz = saw(100, dur) * 0.5 + saw(200, dur) * 0.2
    buzz = biquad(buzz, "lp", 2600, 0.9)
    sig = buzz * gate * 0.5 + biquad(noise(dur), "bp", 5200, 2.0) * gate * 0.15
    encode("flicker", fade(sig, 0.05, 0.25))


def ui_select():
    dur = 0.5
    t = tt(dur)
    click = noise(dur) * env_ad(len(t), 0.001, 0.06, 5.0)
    click = biquad(click, "bp", 1500, 1.4) * 0.9
    tone = sine(320, dur) * env_ad(len(t), 0.002, 0.32, 4.0) * 0.15
    encode("ui-select", reverb(click + tone, 0.3, IR_PLATE))


def glitch():
    dur = 1.8
    sig = np.zeros(int(dur * SR))
    t = tt(dur)
    pattern = [0.0, 0.18, 0.19, 0.34, 0.5, 0.52, 0.53, 0.78, 1.0, 1.02, 1.3, 1.55]
    for i, p0 in enumerate(pattern[:-1]):
        p1 = pattern[i + 1]
        n = int((p1 - p0) * SR)
        if n <= 0:
            continue
        if rng.random() < 0.55:
            chunk = rng.normal(0, 1, n)
            chunk = np.round(chunk * 6) / 6  # bitcrush
            freq = 400 + 3000 * rng.random()
            chunk = biquad(chunk, "bp", freq, 0.8) * 0.7
        else:
            f = rng.uniform(180, 1600)
            chunk = saw(f, n / SR)[:n] * 0.35
            chunk = np.round(chunk * 4) / 4
        chunk *= np.linspace(0.2, 1, n)
        sig[int(p0 * SR):int(p0 * SR) + n] += chunk
    sig = np.tanh(sig * 1.4)
    encode("glitch", fade(sig, 0.01, 0.15))


def whisper():
    dur = 7.0
    sig = np.zeros(int(dur * SR))
    syllable_starts = [0.3, 1.1, 1.75, 2.9, 3.6, 4.4, 5.3, 5.9]
    for s0 in syllable_starts:
        ln = rng.uniform(0.35, 0.75)
        n = int(ln * SR)
        src = rng.normal(0, 1, n)
        f1 = rng.uniform(520, 900)
        f2 = rng.uniform(1500, 2400)
        band = biquad(src, "bp", f1, 3.0) * 0.9 + biquad(src, "bp", f2, 4.0) * 0.45
        band *= env_ad(n, 0.05, ln, 2.2)
        p = int(s0 * SR)
        if p + n < len(sig):
            sig[p:p + n] += band
    sig = reverb(sig, 0.6, IR_ROOM) * 0.8
    sig = biquad(sig, "hp", 320, 0.7)
    encode("whisper", fade(sig, 0.4, 1.0))


def ending_last_witness():
    dur = 34.0
    t = tt(dur)
    pad = (sine(110, dur) * 0.4 + sine(164.8, dur) * 0.3 + sine(220, dur) * 0.25 + sine(329.6, dur) * 0.12)
    pad *= 1 + 0.2 * np.sin(2 * np.pi * 0.06 * t)
    pad = one_pole_lp(pad, 1800)
    melody_notes = [(329.6, 2.0), (293.7, 7.0), (261.6, 12.0), (220.0, 17.0), (246.9, 22.0), (329.6, 27.0)]
    mel = np.zeros_like(pad)
    for f, st in melody_notes:
        n = int(3.2 * SR)
        p = int(st * SR)
        if p + n >= len(mel):
            n = len(mel) - p
        if n <= 0:
            continue
        tone = (sine(f, n / SR) * 0.5 + sine(f * 2.002, n / SR) * 0.14) * env_ad(n, 0.6, 3.2, 2.0)
        mel[p:p + n] += tone
    sub = sine(55, dur) * 0.35 * np.linspace(0.3, 1, len(t))
    sig = reverb(pad * 0.55 + mel * 0.35 + sub, 0.5, IR_PLATE)
    encode("ending-last-witness", fade(sig, 2.0, 4.0))


def ending_survivor():
    dur = 28.0
    t = tt(dur)
    pulse = np.zeros_like(t)
    for i in range(22):
        p = int((1.0 + i * 1.15) * SR)
        n = int(0.3 * SR)
        if p + n < len(pulse):
            tt3 = np.arange(n) / SR
            pulse[p:p + n] += sine(70 * np.exp(-tt3 * 3) + 40, n / SR) * env_ad(n, 0.003, 0.3, 3.5)
    whoosh = biquad(noise(dur), "bp", 900, 0.8) * np.linspace(0, 1, len(t)) ** 4 * 0.9
    air = biquad(noise(dur), "hp", 3000, 0.7) * 0.05
    pad = one_pole_lp(sine(196, dur) * 0.3 + sine(293.7, dur) * 0.18, 1400) * np.linspace(0.2, 1, len(t))
    # pad() name clash: keep local names distinct
    sig0 = reverb(pulse * 0.5 + pad + air, 0.35, IR_ROOM)
    n = len(whoosh)
    sig = fit(sig0, n) + fit(whoosh, n)
    encode("ending-survivor", fade(sig, 2.0, 4.0))


def ending_missing():
    dur = 32.0
    t = tt(dur)
    drift = 1 + 0.006 * np.sin(2 * np.pi * 0.42 * t)
    f = 130.8 * drift
    pad = (sine(f, dur) * 0.4 + sine(f * 1.5, dur) * 0.22 + sine(f * 2, dur) * 0.12)
    pad *= np.linspace(1, 0.15, len(t)) ** 0.8
    pad = one_pole_lp(pad, 1200)
    tape = biquad(noise(dur), "bp", 4000, 1.5) * 0.03 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * t))
    hb = np.zeros_like(t)
    beat = 0.5
    while beat < dur - 2:
        p = int(beat * SR)
        n = int(0.4 * SR)
        if p + n < len(hb):
            tt3 = np.arange(n) / SR
            hb[p:p + n] += sine(50 * np.exp(-tt3 * 6) + 30, n / SR) * env_ad(n, 0.005, 0.4, 3.0) * min(1, (dur - beat) / 14)
        beat += 1.12
    n = len(pad)
    sig = fit(reverb(pad + tape, 0.5, IR_PLATE), n) + fit(hb, n) * 0.45
    encode("ending-missing", fade(sig, 2.0, 5.0))


def ending_forbidden():
    dur = 32.0
    t = tt(dur)
    cluster = np.zeros_like(t)
    for f in (58.3, 61.7, 87.3, 116.5, 123.5, 174.6, 185.0, 246.9):
        v = (saw(f, dur) * 0.5 + sine(f, dur) * 0.5) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.05, 0.2) * t))
        cluster += v / len((58.3, 61.7, 87.3, 116.5, 123.5, 174.6, 185.0, 246.9)) * 0.9
    cluster = one_pole_lp(cluster, 1600)
    cluster *= np.linspace(0.25, 1, len(t))
    blast = np.zeros_like(t)
    p = int(9.5 * SR)
    n = len(t) - p
    tt2 = np.arange(n) / SR
    blast[p:] += sine(44 * np.exp(-tt2 * 1.2) + 22, n / SR) * env_ad(n, 0.004, 4.0, 2.2) * 1.1
    blast[p:] += one_pole_lp(rng.normal(0, 1, n), 300) * env_ad(n, 0.002, 0.5, 3.0) * 0.7
    rev = reverb(noise(8.0) * env_ad(int(8.0 * SR), 3.5, 8.0, 2.0), 0.7, IR_ROOM) * 0.35
    n = len(t)
    sig = fit(reverb(cluster, 0.4, IR_PLATE), n) * 0.8 + blast + fit(rev, n) * 0.6
    encode("ending-forbidden", fade(sig, 2.5, 4.0))


SOUNDS = [
    ambience_room, drone_tension, static_noise, impact, footsteps, door_metal,
    reveal_score, heartbeat_loop, flicker, ui_select, glitch, whisper,
    ending_last_witness, ending_survivor, ending_missing, ending_forbidden,
]

if __name__ == "__main__":
    print(f"ffmpeg: {FFMPEG}")
    for fn in SOUNDS:
        fn()
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"\ntotal audio: {total/1024/1024:.2f} MB in {OUT}")
