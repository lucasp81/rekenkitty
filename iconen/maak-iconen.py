# -*- coding: utf-8 -*-
"""Tekent de app-iconen voor Rekenkitty (zelfde poesje als in de app).

Draaien:  python iconen/maak-iconen.py
Nodig:    pillow  (pip install pillow)
Je hoeft dit alleen opnieuw te draaien als je het icoon wilt veranderen.
"""
from PIL import Image, ImageDraw

WIT = (255, 255, 255)
LIJN = (67, 38, 58)
ROZE = (255, 132, 179)
ROZE_DIEP = (194, 36, 88)
STRIK = (255, 77, 135)
WANG = (255, 196, 218)
ACHTERGROND = (255, 227, 239)


def teken(grootte, marge=1.0):
    """grootte in pixels; marge < 1 maakt het poesje kleiner (voor maskable)."""
    S = grootte * 4                      # 4x tekenen en daarna verkleinen = mooie randen
    img = Image.new("RGBA", (S, S), ACHTERGROND + (255,))
    d = ImageDraw.Draw(img)

    k = (S / 120.0) * marge              # het poesje is getekend in een vak van 120 x 100
    dx = S / 2 - 60 * k
    dy = S / 2 - 50 * k

    def p(x, y):
        return (dx + x * k, dy + y * k)

    def vak(x1, y1, x2, y2):
        return [p(x1, y1), p(x2, y2)]

    lw = max(2, int(3.5 * k))

    # oren
    d.polygon([p(18, 42), p(27, 7), p(54, 27)], fill=WIT, outline=LIJN, width=lw)
    d.polygon([p(102, 42), p(93, 7), p(66, 27)], fill=WIT, outline=LIJN, width=lw)
    d.polygon([p(27, 16), p(33, 15), p(44, 25)], fill=WANG)
    d.polygon([p(93, 16), p(87, 15), p(76, 25)], fill=WANG)

    # kop
    d.ellipse(vak(14, 24, 106, 96), fill=WIT, outline=LIJN, width=lw)

    # wangen
    d.ellipse(vak(22, 62.5, 40, 73.5), fill=WANG)
    d.ellipse(vak(80, 62.5, 98, 73.5), fill=WANG)

    # ogen
    d.ellipse(vak(39.5, 48.5, 50.5, 63.5), fill=LIJN)
    d.ellipse(vak(69.5, 48.5, 80.5, 63.5), fill=LIJN)
    d.ellipse(vak(44.8, 51, 48.8, 55), fill=WIT)
    d.ellipse(vak(74.8, 51, 78.8, 55), fill=WIT)

    # neus en mond
    d.ellipse(vak(53.5, 61.5, 66.5, 70.5), fill=ROZE)
    d.arc(vak(52, 66, 68, 82), 0, 180, fill=LIJN, width=lw)

    # snorharen
    for a, b in [((4, 52), (26, 56)), ((2, 63), (26, 63)), ((4, 74), (26, 70)),
                 ((116, 52), (94, 56)), ((118, 63), (94, 63)), ((116, 74), (94, 70))]:
        d.line([p(*a), p(*b)], fill=LIJN, width=lw)

    # strik op het rechteroor
    d.polygon([p(95, 24), p(78, 13), p(78, 35)], fill=STRIK, outline=ROZE_DIEP, width=lw)
    d.polygon([p(95, 24), p(112, 13), p(112, 35)], fill=STRIK, outline=ROZE_DIEP, width=lw)
    d.ellipse(vak(89, 18, 101, 30), fill=ROZE, outline=ROZE_DIEP, width=lw)

    return img.resize((grootte, grootte), Image.LANCZOS).convert("RGB")


if __name__ == "__main__":
    import os
    hier = os.path.dirname(os.path.abspath(__file__))
    for maat in (180, 192, 512):
        teken(maat).save(os.path.join(hier, "icoon-%d.png" % maat))
    teken(512, marge=0.72).save(os.path.join(hier, "icoon-512-maskable.png"))
    print("iconen klaar")
