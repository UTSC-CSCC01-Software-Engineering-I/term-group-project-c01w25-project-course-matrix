# Release Plan

## Release Name: Course_Matrix_V1.3.0

## 1. Release Objectives for Sprint 3

### 1.1 Goals

- Develop enhanced scheduling features:
  - Ability to insert, update, and delete timetable and events entries (course events for offered lectures, tutorial, etc and user events for users’ personal events) .
  - Automatic and customized timetable generation based on user constraints.
  - Custom colour customization for timetable entries.
  - Favourite timetable functionality.
  - Timetable Export/Share 
  - Timetable compare
  - Email Notifications

- Build upon AI-powered assistant:
  - Timetable Generation via AI. 
  - AI Chatbot refinement. 

- Project Deployment:
  - Project has a usable dockerfile
  - Project is running on a VM instance
  - Project on update is automatically tested
  - Project auto redeploys on update 

- Unit Testing;
  - Project functions will have unit tests written for them
  - Project functions will pass unit tests written for them 


### 1.2 Metrics for Measurement

- **Timetable Management**
  - Users can create, modify, and delete timetables and event entries without errors.
  - Timetable generation respects user constraints (e.g., time preferences, course exclusions).
  - Custom colour selections persist across sessions.
  - Favourite timetables are stored and retrievable.
  - User generated timetables can be exported
  - Stored timetables can be compared to one another if the user has access to them. 
  - Email notifications are sent to user based on upcoming timetable events

- **AI Assistant Features**
  - AI can be queried to generate a timetable for the user based on a list of courses and a list of time restrictions

- **Deployment Features**
  - Project when deployed is deployed using a docker image
  - Project when deployed is accessible online on a virtual Machine
  - Project when updated is automatically unit tested
  - Project when updated and passing unit tests is auto-redeployed

– **Unit Testing**
  - Project functions are unit tested so that their behaviour is clear and potential bugs are caught
  - Project functions passes unit tests so bug free functionality is ensured

## 2. Release Scope

- **Timetable Management**
  - Add, update, and delete timetables and event entries.
  - Generate an optimized schedule based on user preferences.
  - Customize timetable entry colours.
  - Favourite timetables for quick access.
  - Export/Share timetables

- **AI Assistant**
  - AI-Powered timetable generation

- **Deployment**
  - Project runs on a docker image
  - Project is accessible on the web while running on a VM instance
  - Project on update is automatically tested
  - Project auto redeploys on update that passes tests

### 2.2 Excluded Features


### 2.3 Bug Fixes
- Fix module importing linting errors
- Fix Restriction creation bugs
- Fix text highlight on edit username

### 2.4 Non-Functional Requirements

- **Performance**
  - AI output refinement. The AI chatbot responses need to be more reliable and cover more cases (e.g. querying for the year level of courses).

### 2.5 Dependencies and Limitations

- The AI assistant relies on querying an external vector database and open AI. Bothe of these are online resources so if they are down our feature will be down as well.
- The Timetable relies solely on the internal course database and installed dependencies. It does not fetch web-based content.
- Unit testing relies solely on internal functions and installed dependencies. It does not fetch any web-based content.
- The deployment relies on fetching the latest project version from github and (if it passes all unit tests) deploys the latest version on our google cloud virtual machine instance.  
