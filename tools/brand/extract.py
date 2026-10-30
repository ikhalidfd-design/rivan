"""Extract exact logo mark geometry from the original image."""
import cv2
import numpy as np

img = cv2.imread('logo_original.jpg')
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
h, w = img_rgb.shape[:2]

# Non-white mask (the whole logo)
nonwhite = (img_rgb.sum(axis=2) < 720).astype(np.uint8)
ys, xs = np.where(nonwhite > 0)
print('logo bbox: x', xs.min(), xs.max(), 'y', ys.min(), ys.max())

# Isolate the MARK (above the text): find rows histogram to locate gap between mark and wordmark
rowsum = nonwhite.sum(axis=1)
# print row ranges with content
gaps = []
in_run = False
for y in range(h):
    if rowsum[y] > 3 and not in_run:
        start = y; in_run = True
    elif rowsum[y] <= 3 and in_run:
        gaps.append((start, y)); in_run = False
if in_run: gaps.append((start, h))
print('content row bands:', gaps)

# Dominant colors via kmeans on non-white pixels
pts = img_rgb[nonwhite > 0].astype(np.float32)
criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
_, labels, centers = cv2.kmeans(pts, 4, None, criteria, 6, cv2.KMEANS_PP_CENTERS)
counts = np.bincount(labels.flatten())
order = np.argsort(-counts)
for i in order:
    c = centers[i].astype(int)
    print(f'cluster {i}: color #{c[0]:02X}{c[1]:02X}{c[2]:02X}  pixels={counts[i]}')
