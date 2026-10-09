# duPont REGISTRY Select — lessons learned (for future projects)

## 1. The photography decides the ceiling
Forge-level sites rest on commissioned, low-key, art-directed photography. Our downloaded dR listing photos were
124/146 bright white-cyc studio, 21 daylight, 1 dark. Every rejected direction tried to make bright listing photos
behave like dark commissioned photography — and every render read as "rearranged inventory".
**Do first:** audit the photo base (tone, angles, resolution) BEFORE choosing a direction. Options: fetch the right
frames (dR listings have 80–90 photos each — interiors, details), make the studio light the aesthetic (ivory world),
cut cars out cleanly and stage them as objects, or ask the client for commissioned photography.

## 2. Build early; show the browser
Alex lost patience with rounds of static storyboards, concept reports and approval gates. The first positive reaction
("наконец начинает вырисовываться") came when a working V4 was rendering in the browser. Once direction is roughly set:
build, render, record, show. Keep reports short. Make reasonable decisions without asking per section.

## 3. Visual quality > technical complexity
Repeated failure: technically elaborate transitions on visually ordinary layouts. Gates (contrast, overflow, pixel-still
stops) passing proves competence, not quality. Judge the screenshot first; if the explanation is stronger than the render,
the render isn't ready.

## 4. White plates on dark = dR's marketplace
Rectangular white-studio photos floating on a dark page instantly read as dR listing cards. Integrate photos as scenes
(full-bleed crops), objects (clean cut-outs in a staged space), or legitimate windows (inventory rail cards) — never as
decoration plates.

## 5. Look at references visually, not as text
Claims of "reviewed the vault" were made from text fields; Alex caught it. Open the images/recordings (ffmpeg frames
for scroll sites) and analyse real frames before proposing.

## 6. Client requirements survive creativity
A brief-compliance audit mid-project found About+Locations, the iBuy map concept, Services section and footer cards had
been diluted by creative choices. Re-check the verbatim brief after every direction change.

## 7. Repetition of devices
The US map appeared ~4 times on one page — Alex flagged it. One device, one job, once.

## 8. Tools and environment
- Chrome MCP window on this machine is zoomed to 1536 CSS px — use Playwright (design_dna/node_modules/playwright) for
  true 1920 QA and recordings (+ local ffmpeg).
- No paid services; local, free tools only (ImageMagick, PIL, ffmpeg, Playwright).
- Subagents can't write .md report files in some modes — the orchestrator saves them.
