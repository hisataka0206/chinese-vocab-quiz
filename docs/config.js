// Runtime config for the static quiz site.
//
// NOTE: This file is served from GitHub Pages and is therefore PUBLIC.
// The shared secret below is only a spam deterrent, not real authentication.
// Anyone who views the site can read both values. Do not put anything you
// consider confidential here.
//
// Fill in both values below after deploying the Google Apps Script backend.
// Use the SAME sharedSecret value that you set in gas/Code.gs.
// Leaving gasUrl empty disables logging (the quiz still works locally).

window.QUIZ_CONFIG = {
  gasUrl: "https://script.google.com/macros/s/AKfycbwYVX4syOJ_K-B-hU_LtAOv4-Jkt8Pdo1sUQY1IYsQoJhphjBes1tk52Z6ZTtsr_x068A/exec",
  sharedSecret: "openssl rand -hex 16"
};
