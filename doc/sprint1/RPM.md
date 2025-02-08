# Release Plan

## Release Name: Course_Matrix_V1.0.0

## 1. Release Objectives for Sprint 1
### 1.1 Goals
- Build database schemas to store course information, course offerings and user accounts by Feb 9th 2025
  - **Course schema**:
    - Offering information: Meeting Section, Session Offering, Day of Week, Start-End time, location, Number of current enrollments, Max number of enrollments
    - Course information: Course code, name, breadth requirements, description, prerequisite, exclusion
  - **Account schema**:
    - User information: userId, username, password
    - Event: Title, Description, Date, Month, Year, Days of Week, Time 

- Import course information and course offerings for the Winter, Summer and Fall semesters of 2024 from the UTSC timetable archive by Feb 9th 2025
- Build basic software features for the first TA demo by Feb 13th 2025 including: 
  - Account registration, login, logout and deletion
  - Display all available courses with filtering options: Department(s), Course Code, Session(s), Course Level(s), Time(s), Day(s) of Week, Course Title, Course Section, Breadth Requirements, Prerequisites, Exclusions
  - Display courses and course offerings information: Course Description, Meeting Section, Offering, Days of Week, Time, Location
  - Basic calendar table that allows students to add, update and delete events  

### 1.2 Metrics for Measurement
- Database schema
  - Include all courses offered in the Winter, Summer and Fall semesters of 2024
  - Include all the critical fields listed above (section 1.1) for user accounts, courses and course offerings information
  
- User account management
  - Registration:
    - Users must be able to create an account using username and password
    - Users' passwords must be hash-protected in the database
  - Login/Logout
    - Users must be able to login to their account using their username and password
    - Each session has a limited time of ... hour to maintain security
    - User must be logged in a valid session to browse through different web pages
    - When a user is logged in or logged out of the system there will be a clear message on the screen

- Course display
  - A general course display table will be showcased on a webpage containing all the critical offering information (listed in section 1.1)
  - Each course entry contains a link to the course information page (listed in section 1.1)

- Calendar
  - Users can freely add, update or delete as many events per timeslot per day as needed

## 2. Release Scope
### 2.1 Included Features
- Account management: Allows users to create and manage their personal events and program requirements
  - Registration
  - Login
  - Logout
  - Deletion
  
- Course Display: Allows users to access up-to-date courses and course offerings information for timetable generation
  - Course offering information
  - Course description information


- Calendar/Timetable: Allows users to customize their timetable with both academic and non-academic events freely
  - Users can add, update or delete events on a calendar table

### 2.2 Excluded Features
- Automatic timetable generating algorithm
- Personal AI assistant features:
  - Chat prompt
  - Retrieve courses and course offerings information
  - Retrieve program requirements
  - Generate timetable

- Customize the personal calendar with colour-coding
- Overlay course options over the user's current calendar
- Email notification
- Timetable comparison, exportation and sharing

These features will be developed in future sprints.

### 2.3 Bug Fixes
None

### 2.4 Non-Functional Requirements
- Account management:
  - Password must be hash-protected
  - Events information must be hash-protected

- Course and Course Offering information must be large enough with critical information (listed in section 1.1) bolded for visibility

#### 2.5 Dependencies and Limitations
- None
