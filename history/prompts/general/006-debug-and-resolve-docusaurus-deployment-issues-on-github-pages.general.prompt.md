---
id: 006
title: Debug and Resolve Docusaurus Deployment Issues on GitHub Pages
stage: general
date: 2025-12-07
surface: agent
model: claude-3-5-sonnet
feature: none
branch: main
user: 
command: |
  gemini please deploy pages of this folder site all chapter on github https://github.com/hajikhansahito110786/aiproject1.git
  https://hajikhansahito110786.github.io/aiproject1/   is live but can not see chapter and content doc folder data
  https://hajikhansahito110786.github.io/aiproject1/ not showing sidebar to see chapters link or see docs
labels: ["deployment", "docusaurus", "github-pages", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - docusaurus.config.ts
  - sidebars.ts
  - static/.nojekyll
tests_yaml: []
prompt_text: |-
  gemini please deploy pages of this folder site all chapter on github https://github.github.com/hajikhansahito110786/aiproject1.git
  https://hajikhansahito110786.github.io/aiproject1/   is live but can not see chapter and content doc folder data
  https://hajikhansahito110786.github.io/aiproject1/ not showing sidebar to see chapters link or see docs
response_text: "The deployment was successful and the Docusaurus site is now correctly displayed with the sidebar and chapters. The issue was resolved by correcting Docusaurus configuration, fixing git branch issues, disabling Jekyll on GitHub Pages, and finally, instructing the user to configure GitHub Pages to deploy from the 'gh-pages' branch."
outcome: success
evaluation: The Docusaurus site was successfully deployed to GitHub Pages and all reported issues (missing content, missing sidebar) were resolved through systematic debugging and configuration adjustments.
---

### Problem:
The user requested to deploy a Docusaurus site to GitHub Pages. After initial deployment, the user reported multiple issues:
1.  The deployed site was live but did not show chapter content from the `docs` folder.
2.  The deployed site did not show the sidebar with chapter links.

### Analysis & Debugging Steps:

**Initial Deployment Issues:**
1.  **Incorrect Docusaurus Configuration:** `docusaurus.config.ts` had incorrect `baseUrl`, `projectName`, and repository URLs (`physicalAIbook` instead of `aiproject1`).
2.  **PowerShell Execution Policy:** `npm install` failed due to PowerShell execution policy on Windows.
3.  **Empty `gh-pages` Branch:** The Docusaurus `deploy` command failed because the remote `gh-pages` branch did not exist or was completely empty, causing `git clone --branch gh-pages` and subsequent `git rm -rf .` commands to fail.

**Missing Content/Sidebar Issues:**
1.  **Sidebar Paths in `sidebars.ts`:** Initially, it was assumed that numeric prefixes were needed in `sidebars.ts` (e.g., `chapters/01-introduction/index`). However, Docusaurus generates document IDs without these prefixes. Attempting to add them caused a build failure (`Invalid sidebar file`).
2.  **GitHub Pages Serving Jekyll Site:** Inspection of the deployed site's HTML (`curl`) revealed it was being served as a Jekyll site (indicated by `generator" content="Jekyll v3.10.0"`), not the Docusaurus build output. This typically happens when GitHub Pages builds from source code instead of serving pre-built static files.
3.  **`.nojekyll` File:** Although a `.nojekyll` file was added to `static/.nojekyll` and pushed to the `main` branch (which should place it in the build root), the Jekyll behavior persisted.
4.  **GitHub Pages Branch Configuration:** The most critical issue was identified: GitHub Pages was configured to build and deploy from the `main` branch by default, instead of serving the static files already pushed to the `gh-pages` branch.

### Resolution:

1.  **Corrected `docusaurus.config.ts`:** Updated `baseUrl`, `projectName`, and all repository links to `aiproject1`.
2.  **Resolved PowerShell Policy:** Instructed the user to set their PowerShell execution policy to `RemoteSigned`, enabling `npm install`.
3.  **Initialized `gh-pages` Branch:**
    *   Deleted local `gh-pages` (if present).
    *   Created a new orphan `gh-pages` branch locally.
    *   Committed a minimal `index.html` to this branch.
    *   Pushed this `gh-pages` branch to the remote.
    *   Ensured local `main` was in sync with remote before re-attempting deploy.
4.  **Reverted `sidebars.ts` changes:** Reverted the incorrect additions of numeric prefixes in `sidebars.ts` to match Docusaurus's expected document IDs.
5.  **Added `.nojekyll`:** Created an empty `.nojekyll` file in the `static` directory, committed, and pushed it.
6.  **Instructed User on GitHub Pages Configuration:** Provided clear steps to the user to change their GitHub Pages source:
    *   Go to **Repository Settings -> Pages**.
    *   Set **Source** to "Deploy from a branch".
    *   Select **`gh-pages`** as the branch and **`/ (root)`** as the folder.
    *   Saved the changes.

After these steps, the Docusaurus site was successfully served from the `gh-pages` branch, displaying the correct content, sidebar, and chapter links.
