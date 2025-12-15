<!--
---
Sync Impact Report
---
- Version change: 1.0.0 -> 1.0.1
- Added Principles: None
- Added Sections: None
- Removed Sections: None
- Templates requiring updates: None
- Follow-up TODOs: None
-->
# Gemini CLI Constitution

## Core Principles

### I. Spec-Driven Development
All development work MUST begin with a specification (`spec.md`). The spec defines the 'what' and the 'why', and must be approved before implementation begins. This ensures clarity, alignment, and a shared understanding of the goals.

### II. Atomic, Testable Tasks
Specifications are broken down into small, independently testable tasks (`tasks.md`). Each task must have clear acceptance criteria. Implementation follows a strict Red-Green-Refactor cycle based on these tasks.

### III. Agent-First Workflow
The primary user of this CLI is an AI agent. Workflows, commands, and outputs MUST be designed for programmatic use. This includes structured outputs (e.g., JSON, TOML), clear exit codes, and minimal human-centric interactive prompts unless explicitly required.

### IV. Immutable History
All significant actions, decisions, and user prompts are recorded in immutable history files (Prompt History Records and Architectural Decision Records). This provides a complete audit trail and context for future development.

### V. Convention Over Configuration
The project enforces a standardized structure for specs, tasks, prompts, and code. Adherence to these conventions is mandatory to ensure predictability and reduce cognitive overhead for both human and agent developers.

### VI. Self-Documenting System
The combination of specs, tasks, ADRs, and PHRs serves as the primary documentation. The system should be understandable from these artifacts without requiring separate, manually maintained documentation.

## Development Standards

Code MUST adhere to modern, idiomatic language conventions. All code requires peer review. The smallest viable change is preferred; unrelated refactoring in feature branches is prohibited.

## Quality Assurance

Automated testing is mandatory. Unit tests are required for all new logic. Integration tests are required for changes affecting inter-component communication or external contracts. All tests MUST pass before a change is merged.

## Governance

This Constitution is the authoritative source for project standards. Any proposed amendment requires an Architectural Decision Record (ADR) and approval from the project lead. All code reviews MUST validate compliance with these principles.

**Version**: 1.0.1 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-15