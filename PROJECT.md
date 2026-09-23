# Project

This document is the entry point for project-specific context.

## Overview

**Purpose:**
Echo is a prompt library for storing, organizing, finding, inspecting, and quickly copying reusable prompts across multiple prompt types (text, code, image, and video).

**Users:**
Single-user local prompt engineer, developer, or creator who needs quick access to structured prompts.

**Summary:**
A local-first web application built with React and Atlas Design System backed by persistent database storage, allowing rapid prompt creation, organization via collections and tags, full-text search, multi-criteria filtering, and one-click raw prompt copying.

## Scope

### In Scope

* Creating, editing, and soft-deleting prompts.
* Browsing all prompts, uncollected prompts, or prompts by collection.
* Default ordering: newest created first.
* Prompt attributes: Title, raw Prompt text, optional description, optional usage description, optional collection, optional category, and optional tags.
* Duplicate prompts support.
* Copying exact raw prompt text without modification.
* Managing collections: creating, renaming, and deleting collections (deleting a collection uncollects prompts without deleting them).
* Inline collection creation during prompt creation and editing.
* Initial extensible categories: Text, Code, Image, Video.
* Multi-tagging prompts.
* Search matching Title, Description, and Tags.
* Filtering by Collection, Category, and Tags.
* Fast-browsing prompt cards with title, short description, category, tags, and quick-copy action.
* Prompt detail modal exposing complete information and actions (Copy, Edit, Delete) while preserving browse/filter/search context.
* Soft-deletion: Prompts are soft-deleted in the database and completely excluded from normal application behavior (no trash UI).
* Persistent database storage (browser local storage is not the primary data store).
* Integration with the Atlas design system (`@atlas/ds`).

### Out of Scope

* Authentication, registration, and user accounts.
* Multi-user permissions, sharing, collaboration, and public profiles.
* Media uploads, example images, generated-result previews, thumbnails, and attachments.
* Prompt variables, templating, and prompt transformations.
* Duplicate detection.
* Trash / restore UI.
* Advanced sorting controls.
* Production cloud deployment.

## Core Requirements

* **Atlas Design System:** The frontend is built in React using Atlas (`@atlas/ds`) components, patterns, tokens, and styling. Gaps in Atlas follow the fallback policy (Atlas issue + local fallback + Echo tracking issue).
* **Copy Fidelity:** Copying a prompt copies the exact raw prompt text without modification or trimming.
* **Non-Destructive Collection Deletion:** Deleting a collection moves its prompts to Uncollected; prompts are never deleted when their parent collection is deleted.
* **Context Preservation:** Opening and closing prompt detail modals preserves all active search queries, selected filters, and collection views.
* **Lightweight Creation:** Prompt creation and editing remains lightweight and accessible without heavy/overengineered editor abstractions.
* **Soft Deletion:** Prompts are marked with `deleted_at` in the database and excluded from all UI queries and counts.

## Technical Context

* **Application type:** Local-first Web Application (React frontend + lightweight backend/API).
* **Primary stack:** React, TypeScript, Node.js / Express, SQLite (better-sqlite3 / Prisma / drizzle / sql), Atlas Design System (`@atlas/ds`).
* **External services:** None (local-only MVP).
* **Design system:** Atlas (`https://github.com/gumelartresnadwinanda/atlas`).

## Project-Specific Instructions

* When Atlas design system components are available, use them directly with proper tokens and themes. If a general-purpose component is missing, create an upstream issue in Atlas, implement a clean local fallback in Echo, and file a tracking issue in Echo.
* Maintain strict database persistence (SQLite) for all prompts, collections, categories, and tags.

## Verification

Before delivery, verify the project using:

* Automated unit, API, and integration tests verifying all core CRUD, collection cascade, search, filtering, and soft-delete behaviors.
* End-to-end user flow verification:
  1. Create and persist a prompt (with tags, category, collection).
  2. Verify newest-first default ordering.
  3. Search title, description, and tags.
  4. Filter by collection, category, and tags.
  5. Open and close prompt details without losing browsing context.
  6. Copy exact raw prompt text to clipboard.
  7. Edit and persist prompt changes.
  8. Delete prompt and verify immediate exclusion from all queries.
  9. Create, rename, and delete collections; verify collection deletion moves prompts to Uncollected.
* Type-check, lint, and build validation.

## Project Documentation

None currently required beyond `PROJECT.md`.

## Current State

Project foundation, persistent SQLite storage, and complete Collection Management (create, rename, delete with uncollect cascade, and sidebar navigation) implemented. React + TypeScript + Vite frontend integrated with Atlas Design System (`@atlas/ds`).
