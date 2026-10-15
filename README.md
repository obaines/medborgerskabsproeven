# Medborgerskabsprøven – personal practice app

A small study app I use to prepare for the Danish **Medborgerskabsprøven** (the active citizenship test for permanent residence in Denmark).

**Open the app:** https://obaines.github.io/medborgerskabsproeven/

> **Personal, non-commercial project.** Made for my own exam preparation. It is not an official resource and is not affiliated with or endorsed by SIRI, danskogproever.dk or the Danish Ministry of Immigration and Integration. Nothing is sold, and no data is collected.

## What the app does
- **Practice questions:** about 1,300 multiple-choice questions in Danish (2–3 options, like the real test) covering every testable fact in all 26 *fakta-ark* of the official study material.
- **Explanations with sources:** after each answer it explains why, and shows the fact sheet, page number and the exact sentence from the official material, with a link to that page of the PDF.
- **Choose topics:** practise any combination of fact sheets or topic groups, or everything.
- **Spaced repetition:** questions you got wrong come back first, then ones you haven't seen. "Øv mine fejl" drills only your mistakes.
- **Mock exam:** 25 questions, 30-minute timer, pass at 20 correct, with answers shown at the end, as in the real test.
- **Real past papers, updated:** the 9 official papers from June 2022 to June 2026 (from danskogproever.dk), in their original order. Every answer was re-checked against the August 2026 material. 8 questions whose answer has changed (e.g. the king, the 2026 election, the current government) are updated and marked with a note.
- **Review your answers:** after practice or an exam, see your wrong answers, your right answers, or all of them, each with explanation and source.
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

**Known errors in the material:** fact sheet 15 (p. 83) contradicts other parts of the material in two places. It says 49 % of Folketinget are women (the 2026 election result was 86 of 179, i.e. 48 %, as fact sheet 10 says), and it says each regional council has 41 members (regionsloven § 8 now sets 25–47, as fact sheet 14 says). Questions on these topics follow the verified figures and point out the error. Fact sheet 4 also lists a section on parental leave that is missing from the text.

## Files
| File | Purpose |
|---|---|
| `index.html`, `app.js`, `style.css` | The app |
| `questions/ark-01.js` … `ark-26.js` | Questions, one file per fact sheet |
| `questions/exams.js` | The 9 real past papers, updated to the current material |
| `sheets.js` | Fact-sheet names, page ranges, topic groups, audio links |
| `manifest.json`, `sw.js`, `icon-*.png` | Phone installation and offline support |
| `laeremateriale.pdf` | Official study material (August 2026 edition) |
