"""Fit outer/inner circles of the teal arch via RANSAC."""
import cv2
import numpy as np
import random

img = cv2.imread('logo_original.jpg')
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
sub = img_rgb[160:790, :]

m = (np.abs(sub.astype(int) - np.array([0x20,0x62,0x63])).sum(axis=2) < 40).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7,7), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
mm = (lab == big).astype(np.uint8)
cnts, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cnt = max(cnts, key=cv2.contourArea).reshape(-1, 2).astype(float)

def circumcircle(p1, p2, p3):
    ax, ay = p1; bx, by = p2; cx, cy = p3
    d = 2 * (ax*(by-cy) + bx*(cy-ay) + cx*(ay-by))
    if abs(d) < 1e-6: return None
    ux = ((ax**2+ay**2)*(by-cy) + (bx**2+by**2)*(cy-ay) + (cx**2+cy**2)*(ay-by)) / d
    uy = ((ax**2+ay**2)*(cx-bx) + (bx**2+by**2)*(ax-cx) + (cx**2+cy**2)*(bx-ax)) / d
    return ux, uy, np.hypot(ax-ux, ay-uy)

def ransac_circle(pts, iters=4000, tol=3.0):
    best, best_in = None, 0
    random.seed(7)
    for _ in range(iters):
        s = random.sample(list(pts), 3)
        c = circumcircle(*s)
        if c is None: continue
        ux, uy, r = c
        if r < 60 or r > 400: continue
        d = np.abs(np.hypot(pts[:,0]-ux, pts[:,1]-uy) - r)
        inl = (d < tol).sum()
        if inl > best_in:
            best_in, best = inl, c
    ux, uy, r = best
    d = np.abs(np.hypot(pts[:,0]-ux, pts[:,1]-uy) - r)
    inliers = pts[d < tol]
    # least-squares refine on inliers
    A = np.c_[2*inliers[:,0], 2*inliers[:,1], np.ones(len(inliers))]
    b = (inliers**2).sum(axis=1)
    sol, *_ = np.linalg.lstsq(A, b, rcond=None)
    ux, uy = sol[0], sol[1]
    r = np.sqrt(sol[2] + ux**2 + uy**2)
    return (ux, uy, r), best_in, len(pts)

# Outer arc points: right/top side (x > 700 or y < 150); inner: the rest near inner edge
# Instead run RANSAC twice, removing first-circle inliers
c1, n1, tot = ransac_circle(cnt)
print(f'circle1: c=({c1[0]:.1f},{c1[1]:.1f}) r={c1[2]:.1f} inliers={n1}/{tot}')
rem = cnt[np.abs(np.hypot(cnt[:,0]-c1[0], cnt[:,1]-c1[1]) - c1[2]) > 6]
c2, n2, tot2 = ransac_circle(rem)
print(f'circle2: c=({c2[0]:.1f},{c2[1]:.1f}) r={c2[2]:.1f} inliers={n2}/{tot2}')

# angular extent of each circle's inliers
for (ux, uy, r), tag in ((c1,'c1'), (c2,'c2')):
    d = np.abs(np.hypot(cnt[:,0]-ux, cnt[:,1]-uy) - r)
    inl = cnt[d < 4]
    ang = np.degrees(np.arctan2(-(inl[:,1]-uy), inl[:,0]-ux))  # math convention
    print(f'{tag}: angle range {ang.min():.1f} .. {ang.max():.1f}  n={len(inl)}')
    # endpoints (extreme angles)
    i_min, i_max = ang.argmin(), ang.argmax()
    print(f'   endpoints: ({inl[i_min,0]:.0f},{inl[i_min,1]:.0f}) and ({inl[i_max,0]:.0f},{inl[i_max,1]:.0f})')

# normalization: mark bbox local
allm = (sub.sum(axis=2) < 720).astype(np.uint8)
ys, xs = np.where(allm > 0)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
W, H = x1-x0, y1-y0
print(f'\nmark bbox local: {x0},{x1},{y0},{y1} W={W} H={H}')
def normpt(p): return (round((p[0]-x0)/W*120,1), round((p[1]-y0)/H*120,1))
print('c1 norm:', normpt((c1[0],c1[1])), 'r_x=', round(c1[2]/W*120,1))
print('c2 norm:', normpt((c2[0],c2[1])), 'r_x=', round(c2[2]/W*120,1))
