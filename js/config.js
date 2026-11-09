/* ==========================================================================
   Edit the texts and the date here. Nothing else needs to change.
   TARGET: the exact moment the countdown ends, with its time zone offset.
   +01:00 is Tunisia / Berlin time in February (both are UTC+1 in winter).
   Everyone sees the same moment, wherever they open the page.
   ========================================================================== */
window.COUNTDOWN = {
  target: "2027-02-13T23:59:59+01:00",

  eyebrow: "A special day is coming",
  title: "Our journey begins in…",
  subtitle: "Every second brings me closer to you",
  labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },

  /* Shown when the countdown reaches zero */
  done: {
    script: "Happy Birthday",
    sub: "and Happy Valentine's Day",
    lines: ["Two special days…", "One amazing you."],
    note: "I love you ♥"
  }
};
