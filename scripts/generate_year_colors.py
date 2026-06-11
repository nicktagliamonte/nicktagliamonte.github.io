#!/usr/bin/env python3
from pathlib import Path

def hsl_to_hex(h,s,l):
    # h: 0-360, s,l: 0-100
    s/=100.0
    l/=100.0
    c = (1-abs(2*l-1))*s
    x = c*(1-abs((h/60)%2-1))
    m = l - c/2
    if h < 60:
        r1,g1,b1 = c,x,0
    elif h < 120:
        r1,g1,b1 = x,c,0
    elif h < 180:
        r1,g1,b1 = 0,c,x
    elif h < 240:
        r1,g1,b1 = 0,x,c
    elif h < 300:
        r1,g1,b1 = x,0,c
    else:
        r1,g1,b1 = c,0,x
    r = int((r1+m)*255)
    g = int((g1+m)*255)
    b = int((b1+m)*255)
    return f"#{r:02x}{g:02x}{b:02x}"

out = []
out.append('/* Generated year color palette 2026-2064 (two-digit classes year-26 .. year-64) */')

start_year = 26
end_year = 64
count = end_year - start_year + 1
# We'll create a pleasing pastel sequence by rotating the hue across the spectrum, but
# biasing toward greens/blues initially.
start_hue = 110  # green
hue_step = 300.0 / max(1, count-1)  # span ~300 degrees

for i in range(count):
    yy = start_year + i
    cls = f"year-{yy:02d}"
    hue = (start_hue + i*hue_step) % 360
    base = hsl_to_hex(hue, 50, 82)  # pastel base: low-medium saturation, high lightness
    darker = hsl_to_hex(hue, 50, 76)  # slightly darker
    out.append(f"tbody tr.{cls} {{ background-color: {base}; }}")
    out.append(f"tbody tr.{cls}:nth-child(odd) {{ background-color: {darker}; }}")

p = Path(__file__).resolve().parent.parent / 'css' / 'year-colors.css'
p.write_text('\n'.join(out)+"\n")
print('Wrote', p)
