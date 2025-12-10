# Tasks: Docusaurus Textbook on Physical AI & Humanoid Robotics

**Input**: Design documents from `specs/001-docusaurus-textbook-physical/`

**Tests**: No explicit test tasks are included as this is a content-focused project. End-to-end functionality will be verified by the deployment and accessibility of the site.

## Phase 1: Setup

**Purpose**: Initialize the Docusaurus project and repository structure.

- [x] T001 Initialize a new Docusaurus project in the repository root.
- [x] T002 Configure basic site metadata in `docusaurus.config.js` (title, tagline, URL).
- [x] T003 [P] Set up Prettier for code formatting.
- [x] T004 Create a basic `.gitignore` file for Node.js projects.

---

## Phase 2: User Story 1 - Read the Textbook (Priority: P1) 🎯 MVP

**Goal**: Deploy a minimal, readable version of the textbook.

**Independent Test**: The Docusaurus site can be built and viewed locally, showing the initial content.

### Implementation for User Story 1

- [x] T005 [US1] Create an initial `intro.md` file in the `docs/` directory with placeholder content.
- [x] T006 [US1] Configure the sidebar in `sidebars.js` to display the introduction.
- [x] T007 [US1] Customize the homepage (src/pages/index.js) to be a welcoming landing page for the textbook.
- [x] T008 [US1] Configure the navbar in `docusaurus.config.js` with links to the documentation.
- [x] T009 [US1] Add basic styling customizations in `src/css/custom.css`.
- [x] T010 [US1] Verify that the site builds successfully using `npm run build`.

**Checkpoint**: At this point, a basic Docusaurus website with a single content page is functional.

---

## Phase 3: User Story 2 - Contribute Content (Priority: P2)

**Goal**: Establish a clear process for community contributions.

**Independent Test**: A contributor can follow documented steps to propose a content change.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create a `CONTRIBUTING.md` file in the root directory explaining the process for submitting pull requests.
- [x] T012 [P] [US2] Create a pull request template (`.github/pull_request_template.md`) to guide contributors.

**Checkpoint**: Contribution guidelines are in place.

---

## Phase 4: User Story 3 - Deploy Updates (Priority: P3)

**Goal**: Automate the deployment of the textbook to GitHub Pages.

**Independent Test**: Merging a pull request to the `main` branch triggers a successful deployment to the GitHub Pages URL.

### Implementation for User Story 3

- [x] T013 [US3] Create a new GitHub Actions workflow file at `.github/workflows/deploy.yml`.
- [x] T014 [US3] Configure the workflow to trigger on pushes to the `main` branch.
- [x] T015 [US3] Add steps to the workflow to check out the code, set up Node.js, install dependencies, and build the Docusaurus site.
- [x] T016 [US3] Add a step to the workflow to deploy the contents of the `build` directory to the `gh-pages` branch.
- [ ] T017 [US3] Configure the GitHub repository settings to serve the GitHub Pages site from the `gh-pages` branch.

**Checkpoint**: The deployment pipeline is fully automated.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improve the overall quality and user experience of the textbook.

- [x] T018 [P] Configure SEO settings in `docusaurus.config.js`.
- [x] T019 [P] Set up site search by configuring the Algolia plugin (or similar).
- [x] T020 [P] Add a `README.md` file to the project root with an overview and link to the live site.
- [x] T021 Run a Lighthouse audit and address any major performance or accessibility issues.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** must be completed before any other phase.
- **Phase 2 (User Story 1)** can start after Setup is complete. It is the core of the MVP.
- **Phase 3 (User Story 2)** and **Phase 4 (User Story 3)** can be worked on in parallel after Phase 1.
- **Phase 5 (Polish)** can be addressed after the core functionality (US1 and US3) is in place.

## Implementation Strategy

### MVP First (User Story 1 & 3)

1.  Complete **Phase 1: Setup**.
2.  Complete **Phase 2: User Story 1** to get the basic content structure in place.
3.  Complete **Phase 4: User Story 3** to automate deployment.
4.  **STOP and VALIDATE**: At this point, you have a functional, auto-deploying textbook website. This is the MVP.

### Incremental Delivery

1.  Deliver the MVP as described above.
2.  Add **Phase 3: User Story 2** to enable community contributions.
3.  Work on **Phase 5: Polish** tasks to improve the site over time.
