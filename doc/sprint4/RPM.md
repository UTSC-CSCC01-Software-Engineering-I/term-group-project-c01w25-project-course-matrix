# Release Plan

## Release Name: Course_Matrix_V1.5.0

## 1. Release Objectives for Sprint 4

### 1.1 Goals

- Refine timetable features

  - Enhance timetable UI
  - Resolve any known bugs
  - Timetable share
  - Timetable compare
  - Cap number of user timetables
  - Timetable favourites
  - Fix timetable generation flow

- Build upon AI-powered assistant:

  - AI Chatbot can various timetable functions
  - AI Chatbot refinement.
  - Resolve any potential bugs in chatbot.

- Project Deployment:
  - Project has a usable dockerfile
  - Project is running on a VM instance
  - Project on update is automatically tested
  - Project auto redeploys on update
- Unit Testing:
  - Project functions (frontend and backend) will have and pass unit/integration tests written for them

### 1.2 Metrics for Measurement

- **Timetable Management**

  - Users can generate, create, modify, and delete timetables and event entries without errors.
  - Timetable UI has been enhanced with newest design
  - Timetables can be shared between users
  - Timetables can be compared to one another
  - Cap number of times tables per user
  - Timetables can be favourited
  - Timetable generate will not have overlapping timetable entries

- **AI Assistant Features**

  - AI can be queried to generate timetables, delete timetables, show user timetables and more.

- **Deployment Features**
  - Project when deployed is deployed using a docker image
  - Project when deployed is accessible online on a virtual Machine
  - Project when updated is automatically unit tested
  - Project when updated and passing unit tests is auto-redeployed
- **Unit Testing**
- Project functions are unit/integration tested so that their behaviour is clear and potential bugs are caught
- Project functions passes unit/integration tests so bug free functionality is ensured

## 2. Release Scope

- **Timetable Management**

  - Share your timetable with other users
  - Favourite timetables for quick access
  - Compare your timetable with other timetables
  - Update and refine timetable UI

- **AI Assistant**

  - AI-Powered timetable generation, deletion, and queries

- **Deployment**

  - Project runs on a docker image
  - Project is accessible on the web while running on a VM instance
  - Project on update is automatically tested
  - Project auto redeploys on update that passes tests

- **Unit Testing**
  - Project functions (frontend and backend) are unit/integration tested

### 2.2 Excluded Features

- Currently no excluded features this sprint

### 2.3 Bug Fixes

- Fix text highlight on edit username
- Creating timetable with same name causes user to be stuck in loading screen
- Semester button non functional
- Timetable generation sometimes doesn’t generate all meeting sections (and no error msg)
- Generate flow cannot edit manually after generation
- Timetable only generate partially
- Fix time strings sent to timetable generate
- Timetable title max char limit
- Reading week inclusion
- AI hallucinating courses
- Favourite not functional
- Last edited not being updated properly
- Hide restriction config for manual flow & prevent modification of restrictions in edit flow
- Add select all button
- Fix misc. Bugs in generation flow
- Hotfix 1.0.5 Restriction form type toggle persists old values
- Deployment timezone being incorrect
- Fix frontend unit test mocking

### 2.4 Non-Functional Requirements

- **Testing**

  - Further integration and unit tests need to be added for both our frontend and backend

- **CI/CD Workflow**
  - We need a CI/CD pipeline for our application so that only the latest functional version of our application is running at all times.

### 2.5 Dependencies and Limitations

- The AI assistant relies on querying an external vector database and OpenAI. Bothe of these are online resources so if they are down our feature will be down as well.
- The Timetable relies solely on the internal course database and installed dependencies. It does not fetch web-based content.
- Unit testing relies solely on internal functions and installed dependencies. It does not fetch any web-based content.
- The deployment relies on fetching the latest project version from github and (if it passes all unit tests) deploys the latest version on our google cloud virtual machine instance using docker hub storing the various images of our application.
