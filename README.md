# Medborgerskabsprøven – personal practice app

A small study app I use to prepare for the Danish **Medborgerskabsprøven** (the active citizenship test for permanent residence in Denmark).

**Open the app:** https://obaines.github.io/medborgerskabsproeven/

> **Personal, non-commercial project.** Made for my own exam preparation. It is not an official resource and is not affiliated with or endorsed by SIRI, danskogproever.dk or the Danish Ministry of Immigration and Integration. Nothing is sold, and no data is collected.

## What the app does
- **Practice questions:** about 960 multiple-choice questions in Danish (2–3 options, like the real test) covering all 26 *fakta-ark* in the official study material.
- **Explanations with sources:** after each answer it explains why, and shows the fact sheet, page number and the exact sentence from the official material, with a link to that page of the PDF.
- **Choose topics:** practise any combination of fact sheets or topic groups, or everything.
- **Spaced repetition:** questions you got wrong come back first, then ones you haven't seen. "Øv mine fejl" drills only your mistakes.
- **Mock exam:** 25 questions, 30-minute timer, pass at 20 correct, with answers shown at the end, as in the real test.
- **Progress tracking:** accuracy per fact sheet. Progress is stored only in your own browser, and you can save or load a backup file.
- **Official audio:** links to the official MP3 recordings of each fact sheet.
- **Works offline:** it can be installed on a phone's home screen (in Chrome, choose "Add to home screen").

## Which exams the content is valid for
All questions are based solely on ***Læremateriale til Medborgerskabsprøven – demokrati og hverdagsliv i Danmark*, August 2026 edition**. That is the official material for the **winter 2026 (November 2026) and summer 2027** sittings.

The study material is revised regularly. For any later exam, check which edition applies at [danskogproever.dk](https://danskogproever.dk). Some answers (e.g. about the current government or recent statistics) may no longer be correct. If the app and the official material ever disagree, the official material is right.

## Source material
The PDF included here (`laeremateriale.pdf`) is the official study material published by Styrelsen for International Rekruttering og Integration (SIRI), freely available from danskogproever.dk. It is included unchanged so the page links work offline. All rights to it belong to its publisher.

## How it was made
Built with **[Claude Code](https://claude.com/claude-code)** (Anthropic's AI coding assistant). It's plain HTML, CSS and JavaScript, with no frameworks, accounts or server, hosted for free on GitHub Pages.

The questions were written by Claude from the official PDF only. A script automatically checked that every quoted sentence really appears on the cited page. They have not been reviewed by any official body, so treat the app as a study aid, not as a guarantee of exam content.

## Files
| File | Purpose |
|---|---|
| `index.html`, `app.js`, `style.css` | The app |
| `questions/ark-01.js` … `ark-26.js` | Questions, one file per fact sheet |
| `sheets.js` | Fact-sheet names, page ranges, topic groups, audio links |
| `manifest.json`, `sw.js`, `icon-*.png` | Phone installation and offline support |
| `laeremateriale.pdf` | Official study material (August 2026 edition) |
