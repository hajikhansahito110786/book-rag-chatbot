# Contributing to the Docusaurus Textbook on Physical AI & Humanoid Robotics

We welcome contributions to this textbook! Please follow these guidelines to ensure a smooth and effective contribution process.

## How to Contribute

1.  **Fork the Repository**: Start by forking this repository to your GitHub account.
2.  **Clone Your Fork**: Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/<YOUR_USERNAME>/gemini.git
    cd gemini
    ```
3.  **Create a New Branch**: Create a new branch for your changes. Use a descriptive name that reflects the nature of your contribution (e.g., `feat/add-chapter-on-robot-kinematics`, `fix/typo-in-intro`).
    ```bash
    git checkout -b your-branch-name
    ```
4.  **Make Your Changes**:
    *   **Content**: For new chapters, sections, or significant edits, create new Markdown (`.md`) or MDX (`.mdx`) files in the `docs/` directory. Ensure your content adheres to the existing style and tone of the textbook.
    *   **Minor Edits/Typos**: For small corrections, you can directly edit the relevant files.
    *   **Code Examples**: If you're adding code, ensure it's well-commented and follows best practices.
5.  **Test Your Changes (Local Preview)**: Before submitting, always preview your changes locally to ensure everything renders correctly and looks as expected.
    ```bash
    npm install
    npm run start
    ```
    This will open the Docusaurus site in your browser at `http://localhost:3000`.
6.  **Commit Your Changes**: Commit your changes with a clear and concise commit message.
    ```bash
    git add .
    git commit -m "feat: Add new chapter on [topic]"
    ```
7.  **Push to Your Fork**: Push your new branch to your forked repository on GitHub:
    ```bash
    git push origin your-branch-name
    ```
8.  **Create a Pull Request (PR)**:
    *   Go to the original repository on GitHub.
    *   You should see a prompt to create a new pull request from your recently pushed branch.
    *   Fill out the pull request template, providing a detailed description of your changes, why they are necessary, and any relevant context.
    *   Link to any related issues if applicable.

## Pull Request Guidelines

*   **Descriptive Title**: Your PR title should be concise and clearly summarize the changes.
*   **Detailed Description**: Provide enough context for reviewers to understand your changes. Explain the problem you're solving, the approach you took, and any potential impacts.
*   **Screenshots/Demos**: If your changes involve UI updates or new features, include screenshots or GIFs to help reviewers visualize the changes.
*   **Single Purpose**: Each PR should ideally address a single, focused change or feature. If you have multiple unrelated changes, please split them into separate PRs.
*   **Review**: Your PR will be reviewed by maintainers. Please be responsive to feedback and be prepared to make further adjustments.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project, you agree to abide by its terms.

Thank you for contributing!
