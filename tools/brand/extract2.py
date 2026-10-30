"""Per-shape geometry extraction for the RUWAQ mark."""
import cv2
import numpy as np

img = cv2.imread('logo_original.jpg')
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
MARK_Y = (160, 790)  # mark band
sub = img_rgb[MARK_Y[0]:MARK_Y[1], :]

COLORS = {
    'dark': (0x0B, 0x3B, 0x43),
    'teal': (0x20, 0x62, 0x63),
    'gold': (0xBA, 0x9D, 0x70),
}

def mask_for(color, tol=40):
    d = np.abs(sub.astype(int) - np.array(color)).sum(axis=2)
    return (d < tol).astype(np.uint8)

# Mark local coords -> normalize to 0..120 x, 0..120 y later using mark bbox
all_mask = ((sub.sum(axis=2) < 720)).astype(np.uint8)

results = {}
for name, color in COLORS.items():
    m = mask_for(color)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    mm = (lab == big).astype(np.uint8)
    x, y, bw, bh, area = stats[big]
    print(f'--- {name}: bbox x={x}..{x+bw} y={y}..{y+bh} area={area}')
    results[name] = mm

    cnts, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnt = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(cnt)
    for eps in (0.02, 0.01):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        print(f'  approx eps={eps}: {ap.reshape(-1,2).tolist()}')

    # circle fit on all contour points
    (cx, cy), r = cv2.minEnclosingCircle(cnt)
    print(f'  minEnclosingCircle: c=({cx:.0f},{cy:.0f}) r={r:.0f}')

# Overall mark bbox in original coords
ys, xs = np.where(all_mask > 0)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
print('\nmark bbox (local):', x0, x1, y0, y1, 'w=', x1-x0, 'h=', y1-y0)
W, H = x1 - x0, y1 - y0

def norm(pt):
    return (round((pt[0]-x0)/W*120, 1), round((pt[1]-y0)/H*120, 1))

for name, mm in results.items():
    cnts, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnt = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(cnt)
    ap = cv2.approxPolyDP(hull, 0.008 * cv2.arcLength(hull, True), True)
    print(f'{name} normalized corners (120-grid): {[norm(p) for p in ap.reshape(-1,2)]}')
    (cx, cy), r = cv2.minEnclosingCircle(cnt)
    print(f'{name} enclosing circle norm: c={norm((cx,cy))} r={r/W*120:.1f} (x-scale)')
