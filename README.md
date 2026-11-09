# Countdown page

A countdown with seconds to **13 February 2027, 23:59:59** (Tunisia / Berlin time, UTC+1),
in the same night-rose style as the gift. When it reaches zero it switches to a
"Happy Birthday" celebration with fireworks and confetti.

## Change the date or texts
Open `js/config.js`. Edit `target` (keep the format `YYYY-MM-DDTHH:MM:SS+01:00`) and any text.

## Put it online (GitHub Pages)
1. Create a new repository on GitHub (hard-to-guess name).
2. Click **Add file → Upload files**, open this unzipped folder, select **everything inside it**
   (`index.html`, `css`, `js`, `README.md`) and drag it in. Commit.
3. **Settings → Pages → Deploy from a branch → main / (root) → Save.**
4. After about a minute it is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

`index.html` must be at the top of the repository, not inside another folder.

## Preview helpers (add to the address)
- `?test=8` counts down 8 seconds from now, so you can see the celebration.
- `?now=2027-02-13T23:59:50+01:00` pretends it is that moment.

The countdown uses the exact same moment for everyone and corrects itself if a phone sleeps.
