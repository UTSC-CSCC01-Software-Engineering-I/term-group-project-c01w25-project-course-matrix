# Release Plan

## Release Name: Course_Matrix_V1.0.0

## Release Objectives for Sprint 1
#### Goals
- Build database schemas to store course information, course offerings and user accounts by Feb 9th 2025
  - **Course schema**: 
    - Course information: Course code, name, breadth requirements, description, prerequisite, exclusion
    - Offering information: Meeting Section, Session Offering, Day of Week, Start-End time, location, Number of current enrollments, Max number of enrollments
  - **Account schema**:
    - User information: userId, username, password
    - Event: Title, Description, Date, Month, Year, Days of Week, Time 
- Import course information and course offerings for the Winter, Summer and Fall semesters of 2024 from the UTSC timetable archive by Feb 9th 2025
- Build basic software features for the first TA demo by Feb 13th 2025 including: 
  - Account registration, login, logout and deletion
  - Display all available courses with filtering options: Department(s), Course Code, Session(s), Course Level(s), Time(s), Day(s) of Week, Course Title, Course Section, Breadth Requirements, Prerequisites, Exclusions
  - Display courses and course offerings information: Course Description, Meeting Section, Offering, Days of Week, Time, Location
  - Basic calendar table that allows students to add, update and delete events  
#### Metrics for Measurement
- Database schema
  - Include 
Identify metrics or KPIs that will measure the success of each objective.
Make sure these metrics are quantifiable and trackable.

## Release Scope
Outline what is included in and excluded from the release, detailing key features or improvements, bug fixes, non-functional requirements, etc.
#### Included Features
- Account management: Allows users to create and manage their personal events and course information
  - Registration
  - Login
  - Logout
  - Deletion
- Course Display: Allows users to access up-to-date courses and course offerings information for timetable generation
  - Course description information
  - Course offering information
- Calendar/Timetable: Allows users to customize their timetable with both academic and non-academic events freely
  - Users can add, update or delete events on a calendar table
#### Excluded Features
- Automatic timetable generating algorithm
- Personal AI assistant features:
  - Chat prompt
  - Retrieve courses and course offerings information
  - Retrieve program requirements
  - Generate timetable
- Customize the personal calendar with colour coding
- Overlay course options over the user's current calendar
- Email notification
- Timetable comparison, exportation and sharing

These features will be developed in future sprints
#### Bug Fixes
None
#### Non-Functional Requirements
- Account management:
  - Password must be hash-protected
  - Events information must be hash-protected
- Course and Course Offering information must be large enough with bolded critical information (listed above) for visibility
##### Dependencies and Limitations
- None
