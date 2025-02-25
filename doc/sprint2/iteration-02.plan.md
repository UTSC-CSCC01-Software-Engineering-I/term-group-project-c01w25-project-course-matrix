# Course Matrix

## Iteration 01

- **Start date**: 02/15/2025  
- **End date**: 03/07/2025  

---

## 1. Process  

### 1.1 Roles & Responsibilities  

#### **Epic 1: Scheduler**  
**Team Members:** Austin, Minh, Thomas  

- Develop a calendar interface that allows users to add, modify, and delete both custom entries and predefined course entries.  
- Implement an algorithm that optimally schedules events based on user preferences and constraints.  

#### **Epic 2: AI Assistant**  
**Team Members:** Kevin, Masa  

- Develop an AI-powered chat interface that enables direct Q&A interactions between users and the AI.  
- Ensure seamless integration with the scheduling system to provide intelligent recommendations and assistance.  

#### **Note Taking & Documentation**  
**Team Members:** Minh and Thomas  

- Take notes during stand-ups.  
- Create sprint 2 documentation: `iteration-plan-02`, `RPM`, and `sprint-02 review`.  
- Update the System Design Document.  

_All team members are collectively responsible for supporting each other to achieve the sprint goals and develop a working prototype._  

---

### 1.2 Events  

#### **Initial Planning Meeting**  
- **Location:** Virtual  
- **Time:** 2/16/2025  
- **Purpose:**  
  - Review sprint 2 requirements.  
  - Define tasks and responsibilities for each team member.  

#### **Stand-Up Meetings**  
- **Location:** Online or in-person (based on availability).  
- **Time:**  
  - Every **Tuesday** from **12 PM – 1 PM**  
  - **Friday & Sunday** from **9 PM – 10 PM**  
- **Purpose:**  
  - Progress updates: What has each member done since the last stand-up?  
  - Determine next steps and deadlines.  
  - Discuss blockers and possible solutions.  

#### **Final Review Meeting**  
- **Location:** Online  
- **Time:** 3/6/2025  
- **Purpose:**  
  - Review features and deliverables implemented in sprint 2.  
  - Identify changes for sprint 3.  

---

### 1.3 Artifacts  

#### **Product Backlog**  
- Updated backlog with completed and pending items.  

#### **Sprint Backlog**  
- Features and tasks completed during Sprint 2.  

#### **User Stories**  
- _Example:_ "As a user, I want to edit my account details so that I can update my information easily."  

#### **Burndown Chart**  
- Visual representation of progress.  

#### **Code Repository**  
- [Repository Link](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01w25-project-course-matrix) (Branches and commits related to Sprint 2).  

---

## 2. Product  

### 2.1 Goal and Tasks  

#### **1. Develop product features for the product demo:**  

- **Account Management**  
  - [_Account Editing_](https://cscc01-course-matrix.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog?selectedIssue=SCRUM-95)  
  - [_Account Deletion_](https://cscc01-course-matrix.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog?selectedIssue=SCRUM-28)  

- **Epic 1: Scheduler**  
  - [_Timetable Basics/Insertion_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-46)  
  - [_Entries Update/Delete_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-47)  
  - [_Timetable Generation_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-52)  
  - [_Entries Visualization_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-50)  
  - [_Entries Colour Customization_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-51)  
  - [_Timetable Favourite_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-57)  

- **Epic 2: AI Assistant**  
  - [_Creation of New Chats_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-36)  
  - [_Chatlog Export/Rename/Delete_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-37)  
  - [_Course Info Retrieval_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-29)  
  - [_Program Requirements Retrieval_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-30)  

#### **2. Create Sprint 2 Documentation**  
- [_Sprint 2 Documentation_](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-119)  

---

### 2.2 Artifacts  

#### **Pages/Features**  

##### **Registration/Login**  
- Dropdown menu displaying username and associated email.  
- Functional password reset and account deletion features.  

##### **Scheduler**  
- Home page for creating new timetables.  
- Timetable management:  
  - Insert, update, and delete both course entries and custom user entries.  
- Algorithm for automated timetable generation.  
- Hover effect: Calendar highlights selected course entry.  
- Custom colour selection for timetable entries.  
- Option to favourite timetables for quick access.  

##### **AI Assistant**  
- Functional AI chatbot interface with chat log creation, editing, and deletion.  
- AI retrieves relevant course information and program requirements from the course database.  
- AI strictly uses the internal course database without relying on external or irrelevant information.  
