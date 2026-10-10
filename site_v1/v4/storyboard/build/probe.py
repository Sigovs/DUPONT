import numpy as np
from PIL import Image
R="C:/____WORK/DU PONT REGESTRY/assets/source/"
cars={"ford":R+"628929_2006-ford-gt/07_2006-ford-gt-700073-837676577.jpg",
"f430":R+"624911_2007-ferrari-f430/08_2007-ferrari-f430-290071-1881447063.jpg",
"spec":R+"626613_2015-ferrari-458-speciale/09_2015-ferrari-458--speciale-1369075-60006421.jpg"}
for k,p in cars.items():
    a=np.asarray(Image.open(p).convert("RGB")).astype(int); L=a.mean(2)
    print("==",k)
    # top of car: first row where any pixel in x 600..1300 < 200
    for y in range(200,500):
        if (L[y,600:1320]<200).any(): print(" top y",y); break
    # left/right extents overall rows 400..1000 (exclude ring band +-20 using lum<150)
    for x0,x1 in ((380,560),(1380,1560)):
        # per column, last dark row (L<90) in y 800..1100
        rows=[]
        for x in range(x0,x1,10):
            ys=np.where(L[800:1100,x]<90)[0]
            rows.append((x, 800+ys.max() if len(ys) else None))
        print(" tyre zone",rows)
    # ring y at x 100, 300, 1620, 1820
    for x in (100,300,1620,1820):
        print(" ring@",x, 600+int(np.argmin(L[600:760,x])))
