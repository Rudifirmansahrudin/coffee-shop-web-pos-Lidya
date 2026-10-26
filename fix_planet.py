from PIL import Image
from collections import deque
import shutil

p = "public/ornaments/planet-ring.png"
shutil.copy(p, "planet-ring.backup.png")

im = Image.open(p).convert("RGBA")
w, h = im.size
px = im.load()
seed = (w - 1, 0)
base = px[seed]
print("corner color:", base)


def near(c):
    return c[3] > 0 and sum(abs(c[i] - base[i]) for i in range(3)) < 60


seen = {seed}
q = deque([seed])
n = 0
while q:
    x, y = q.popleft()
    if not near(px[x, y]):
        continue
    px[x, y] = (0, 0, 0, 0)
    n += 1
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen:
            seen.add((nx, ny))
            q.append((nx, ny))

print(f"removed {n} px = {n / (w * h) * 100:.0f}% of image")
im.save(p)

bg = Image.new("RGBA", (w * 2, h * 2), (250, 247, 240, 255))
bg.alpha_composite(im.resize((w * 2, h * 2)))
bg.save("/tmp/planet-preview.png")
