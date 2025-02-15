# Release Plan

## Release Name: Course_Matrix_V1.0.0

## 1. Release Objectives for Sprint 1
### 1.1 Goals
- Build database schemas to store course information, course offerings and user accounts by Feb 9th 2025
  - **`course` schema**:
    - The `offerings` table should have columns for the Meeting Section, Session Offering, Day of Week, Start-End time, Location, Number of current enrollments, Max number of enrollments
    - The `courses` table should have columns for the course code, name, breadth requirements, description, prerequisites, corequisites, and exclusions
    - The `corequisites` table should have columns to map each course_id with their corresponding corequisite course_ids
    - The `prerequisites` table should have columns to map each course_id with their corresponding prerequisite course_ids
    - The `departments` table should have columns to map each department to their code name as shown in the course codes
  - **`account` schema**:
    - The `users` table should have columns to store user account information: username, password, user_id

- Import course information and course offerings for the Winter, Summer and Fall semesters of 2024 from the UTSC timetable archive by Feb 9th 2025
- Build basic software features for the first TA demo by Feb 13th 2025 including: 
  - Account registration, login, logout
  - Display all available courses with filtering options:
    - Semester
    - Breadth Requirement
    - Credit Weight
    - Department
    - Course Level
    
  - Display courses and course offerings information: Course Description, Meeting Section, Offering, Days of Week, Time, Location

### 1.2 Metrics for Measurement
- Database schema
  - Include all offerings offered in the Winter, Summer, and Fall semesters of 2024 as listed on the UTSC Course Timetable Archive
  - Include all the critical fields listed above (section 1.1) for user accounts, courses and course offerings information
  
- User account management
  - Registration:
    - Users must be able to create an account using email and password
    - Users' passwords must be hash-protected in the database
  - Login/Logout
    - Users must be able to login to their account using their email and password
    - User must be logged in a valid session to browse through different web pages
    - When a user is logged in or logged out of the system there will be a clear message on the screen

- Course display
  - A general course display table will be showcased on a webpage containing all the critical offering information (listed in section 1.1)
  - Each course entry contains a link to the course information page (listed in section 1.1)

## 2. Release Scope
### 2.1 Included Features
- Account management: Allows users to create and manage their personal events and program requirements
  - Registration
  - Login
  - Logout

- Course Display: Allows users to access up-to-date courses and course offerings information for timetable generation
  - Course offering information
  - Course description information

### 2.2 Excluded Features
- Automatic timetable generating algorithm
- Personal AI assistant features:
  - Chat prompt
  - Retrieve courses and course offerings information
  - Retrieve program requirements
  - Generate timetable

- Calendar customization features:
  - Add, update, and delete personal events from the user's calendar
  - Customize the personal calendar with colour-coding
  - Overlay course options over the user's current calendar

- Email notification
- Timetable comparison, exportation and sharing

Due to conflicts with other assignments and midterm tests, our team did not have enough time to develop these features. They will be developed in future sprints.

### 2.3 Bug Fixes
None

### 2.4 Non-Functional Requirements
- User-sensitive account information must be codified to ensure security
  - Users' passwords must be hash-protected
  - Users' events information (title, content) must be hash-protected

- Fast course query time
  - When users finish filling out the filtering options and click on the search button, the website should not take over 5 seconds to display all courses that fit the description

### 2.5 Dependencies and Limitations
- None
