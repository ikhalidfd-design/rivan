"""Median color per shape."""
import cv2
import numpy as np

img = cv2.cvtColor(cv2.imread('logo_original.jpg'), cv2.COLOR_BGR2RGB)
sub = img[160:790, :]
# erode masks to avoid JPEG edge blending
COLORS = {'dark': (0x0B,0x3B,0x43), 'teal': (0x20,0x62,0x63), 'gold': (0xBA,0x9D,0x70)}
for name, c in COLORS.items():
    m = (np.abs(sub.astype(int) - np.array(c)).sum(axis=2) < 40).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7,7), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    mm = (lab == big).astype(np.uint8)
    mm = cv2.erode(mm, np.ones((9,9), np.uint8))
    px = sub[mm > 0]
    med = np.median(px, axis=0).astype(int)
    print(name, '#%02X%02X%02X' % tuple(med))

# background corner color
print('bg', '#%02X%02X%02X' % tuple(np.median(sub[:40,:40].reshape(-1,3),axis=0).astype(int)))
