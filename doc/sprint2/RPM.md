# Release Plan

## Release Name: Course_Matrix_V1.1.0

## 1. Release Objectives for Sprint 2

### 1.1 Goals

- Part 2 of user registration and login:
  - User password change
  - User account deletion
  - Username + email display via dropdown menu

- Expand database schemas to support additional timetable customization and AI assistant interactions by February 28, 2025

  - **`timetable` schema**:
   - The `timetables` table should have columns for `id`, `created_at`, `timetable_title`, `user_id`, and `updated_at`.
   - The `course_events` table should have columns for `id`, `created_at`, `calendar_id`, `updated_at`, `event_name`, `event_date` , `event_start`, `event_end`, `event_description`, and `offering_id`.
   - The `user_events` table should have columns for `id`, `created_at`, `event_name`, `event_description`, `event_date` , `event_start`, `event_end`, `calendar_id`, and `updated_at`.

- Develop enhanced scheduling features for the demo by March 7th, 2025:
  - Ability to insert, update, and delete timetable and events entries (course events for offered lectures, tutorial, etc and user events for users’ personal events) .
  - Automatic and customized timetable generation based on user constraints.
  - Custom colour customization for timetable entries.
  - Favourite timetable functionality.

- Build AI-powered assistant features:
  - AI chatbot interface enabling users to create, rename, and delete chat logs.
  - Retrieval of course information and program requirements from the database.

### 1.2 Metrics for Measurement

- **Database Schema Expansion**
  - Ensure the `timetable` schema supports new features.
  - Verify referential integrity and indexing for efficient queries.

- **Timetable Management**
  - Users can create, modify, and delete timetables and event entries without errors.
  - Timetable generation respects user constraints (e.g., time preferences, course exclusions).
  - Custom colour selections persist across sessions.
  - Favourite timetables are stored and retrievable.

- **AI Assistant Features**
  - Users can create, rename, and delete chat logs.
  - AI fetches course details and program requirements exclusively from the internal vectorized database.
  - AI does not use web-based or non-course-related information.

## 2. Release Scope

- **Timetable Management**
  - Add, update, and delete timetables and event entries.
  - Generate an optimized schedule based on user preferences.
  - Customize timetable entry colours.
  - Favourite timetables for quick access.

- **AI Assistant**
  - AI-powered chatbot with interactive Q&A.
  - Retrieval of course and program requirement details.
  - Chat log creation, renaming, and deletion.

### 2.2 Excluded Features

- Multi-user timetable sharing.
- AI recommendations for schedule optimization.
- Push notifications for schedule changes.

### 2.3 Bug Fixes

Fix passwords having unlimited length
Fix Login session infinite loop bug
Fix auth middleware login to check for user session
Fix login not redirecting to dashboard if session already exists
Fix form deselect field option in filter panel

### 2.4 Non-Functional Requirements

- **Performance**
  - AI assistants should stream first response within 5 seconds of user query.
  - Timetable generation should not exceed 10 seconds under typical load.
  - Proper authorization for protected operations such as deleting/updating users

### 2.5 Dependencies and Limitations

- The AI assistant relies solely on the internal course database and does not fetch web-based content.

