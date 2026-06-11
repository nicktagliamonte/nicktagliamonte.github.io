#!/usr/bin/env python3
import csv
import re
import shutil
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
infile = repo_root / 'data' / 'books.csv'
backup = repo_root / 'data' / 'books.csv.bak'

date_re = re.compile(r'^\s*(\d{1,2})/(\d{1,2})/(\d{2,4})\s*$')

print('Reading', infile)
shutil.copy2(infile, backup)
print('Backup created at', backup)

rows = []
changed = 0
with infile.open(newline='') as f:
    reader = csv.reader(f)
    for row in reader:
        rows.append(row)

if not rows:
    print('Empty CSV, nothing to do')
    raise SystemExit(0)

header = rows[0]
# try to find the 'Anticipated Start Date' header
try:
    date_idx = header.index('Anticipated Start Date')
except ValueError:
    # fallback to 7th column (0-based index 7) if header not exactly matching
    date_idx = 7

for i in range(1, len(rows)):
    row = rows[i]
    if len(row) <= date_idx:
        continue
    val = row[date_idx].strip()
    if not val:
        continue
    m = date_re.match(val)
    if m:
        mm = int(m.group(1))
        dd = int(m.group(2))
        yy = m.group(3)
        mm_s = f"{mm:02d}"
        dd_s = f"{dd:02d}"
        if len(yy) == 4:
            yy_s = yy[-2:]
        else:
            yy_s = yy.zfill(2)
        new = f"{mm_s}/{dd_s}/{yy_s}"
        if new != val:
            rows[i][date_idx] = new
            changed += 1

# write back
with infile.open('w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f'Done. Updated {changed} date(s). Original file backed up to {backup}')
