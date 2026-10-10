import sys, numpy as np
from PIL import Image
R="C:/____WORK/DU PONT REGESTRY/assets/source/"
cars={"ford":R+"628929_2006-ford-gt/07_2006-ford-gt-700073-837676577.jpg",
"f430":R+"624911_2007-ferrari-f430/08_2007-ferrari-f430-290071-1881447063.jpg",
"spec":R+"626613_2015-ferrari-458-speciale/09_2015-ferrari-458--speciale-1369075-60006421.jpg"}
for k,p in cars.items():
    a=np.asarray(Image.open(p).convert("RGB")).astype(int); L=a.mean(2)
    print("==",k,a.shape)
    # ring: rows near left edge (x 0..60) darkest
    col=L[:,0:40].mean(1)
    r=np.argsort(col)[:12]; print(" ring rows @x0-40:",sorted(r.tolist()), "vals",col[sorted(r)].round(0).tolist()[:4])
    colR=L[:,-40:].mean(1); print(" ring rows @right:",sorted(np.argsort(colR)[:8].tolist()))
    print(" corners:",a[5,5],a[5,-5],a[-5,5],a[-5,-5]," floor mid-left y1000 x100:",a[1000,100], " y1250:",a[1250,960])
    # bbox of dark (L<200) excluding ring band
    m=L<190
    ys,xs=np.where(m[:, :])
    # column profile for car extent at row 800
    for y in (700,800,900,950):
        xx=np.where(L[y]<200)[0]; print(f"  row{y} dark x:",xx.min() if len(xx) else None, xx.max() if len(xx) else None)
    # vertical profile in centre column x=960 and tyre columns
    for x in (430,960,1500):
        print(f"  col{x} L y880..1120 step20:",L[880:1121:20,x].round(0).astype(int).tolist())
