# Course Matrix

## Iteration 03

- **Start date**: 03/8/2025
- **End date**: 03/21/2025

## 1. Process

### 1.1 Roles & Responsibilities

#### Epic 1: Scheduler

**Team Members:** Austin, Minh, and Thomas

- Develop a calendar interface that allows users to retrieve, add, modify, and delete timetables and events both user custom event entries and predefined course entries.
- Develop an algorithm that optimally schedules events based on user preferences and constraints.
- Develop an algorithm that emails notification its users based on upcoming timetable events
- Develop custom color customization so that users can select what colors they want for different courses
- Develop a calendar interface that allows users to export and share their timetables with other users
- Develop an algorithm that allows users to compare two different timetables together

#### Epic 2: AI Assistant

**Team Members:** Kevin

- Develop an AI-powered chat interface that takes a list of courses and a list of time constraints and generates a possible user timetable fulfilling the given requirements.
- Refine AI-powered chat interface so that querying for database information is more reliable and understandable

- **Note taking & Documentation**: Minh, Masahisa, and Thomas
  - Taking notes during stand-ups
  - Create sprint 2 documentation: iteration-plan-02, RPM, and sprint-02 review
  - Update System Design Document

In addition to their specific roles, all team members have a collective responsibility to support and assist other team members to ensure that the goals (listed in section 2.1) are achieved and develop a working prototype.

#### Epic 3: Deployment

**Team Members:** Masahisa 

- Create a dockerfile such that our application can be run on a docker image with application setup being done automatically.
- Ensure that our application’s docker image runs on a VM instance accessible on the web.
- Ensure that our deployed project automatically redeploys when a new version of our application is pushed that passes all unit testing.

#### Epic 4: Unit Testing

**Team Members:** Austin

- Create unit tests for our application functions (timetable, ai assistant, user stories, etc.) such that their functionality is clear and bug free.

#### 1.2 Events

- **Initial planning meeting**:

  - Location: Virtual
  - Time: 3/8/2025
  - Purposes:
    - Go over the sprint 3 requirements
    - Define tasks and responsibilities for each team member

- **Stand up meeting**:
  - Location: Online or in-person depending on members availability
  - Time: Every Tuesday from 12 pm to 1 pm, Thursday and Sunday from 9 pm to 10 pm
  - Purposes
    - Progress updates: What has each member done since the last stand-up
    - Determine the next steps and deadlines
    - Discuss current blockers and possible solutions

- **Final review meeting**
  - Location: Online
  - Time: 3/21/2025
  - Purposes:
    - Review features and deliverables implemented in sprint 3
    - Determine changes that need to be made in sprint 3

#### 1.3 Artifacts

- Our team will track the progress through Jira

  - Each user story will be uploaded to Jira as a ticket:

    - Categorized in the backlog by its epic, and execution sprint

    ![JIRA Backlog](./images/JIRA_Backlog.png)

    - Ticket details include: estimated story point to determine its priority, assignees

    ![Ticket Detail](./images/Ticket_Detail.png)

    - Tickets of large user stories will be broken down into smaller child issues

    ![Ticket Description and Child Issue](./images/Ticket_Description_and_Child_Issue.png)

    - Each ticket will also show:

      - Other tickets blocked by it

      ![Blocked tickets](./images/Blocked_ticket.png)

      - Other tickets blocking it

      ![Blocking tickets](./images/Blocking_tickets.png)

  - Additional tasks required during the development process will also be submitted as a task ticket on JIRA for tracking.
  - Students or groups of students will be assigned first to epic and then to the specific user story.
  - Workflow

  ![Ticket Workflow](./images/Ticket_Workflow.png)

 - Furthermore, we will implement a Burndown Chart, which will be included as `burndown.pdf` by the end of the sprint. This chart will also feature comments on the sprint's progress and a velocity comparison.
 - Below is an example Burndown Chart from Sprint 0:

  ![Burndown Chart](./images/Burndown.png)


## 2. Product

#### 2.1 Goal and Tasks

**1. Develop product features for the product demo:**

- _Epic 1: Scheduler_

  - Timetable Basics/Insertion: [SCRUM-46](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-46)
  - Entries Update/Delete: [SCRUM-47](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-47)
  - Timetable Generation: [SCRUM-52](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-52)
  - Entries Visualization: [SCRUM-50](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-50)
  - Entries Colour Customization: [SCRUM-51](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-51)
  - Timetable Favourite: [SCRUM-57](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-57)
  - Timetable Export/Share:
[SCRUM-58](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-58)

- _Epic 2: AI Assistant_
  - Timetable Generation via AI:
[SCRUM-31](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-31) 
  - Refine AI outputs:
[SCRUM-132]-(https://cscc01-course-matrix.atlassian.net/browse/SCRUM-132) 

-_Epic 3: Deployment
 - Project Deployment:
[SCRUM-130]-(https://cscc01-course-matrix.atlassian.net/browse/SCRUM-130) 

**3. Create sprint3 documentation:** 
[SCRUM-127]-(https://cscc01-course-matrix.atlassian.net/browse/SCRUM-127)

#### 2.2 Artifacts

### Pages/Features

#### Scheduler

- Timetable management: insertion, updating, and deletion of timetables and events (course entries and custom user entries).
- Algorithm for automated timetable generation.
- Hover effect: calendar highlights selected course entry.
- Custom colour selection for timetable entries.
- Option to favourite timetables for quick access.
- Option to share/export timetable to other users
- Option to compare two separate timetables
- Option to send email notifications on upcoming timetable events

#### AI Assistant

- Ability to generate an optimal timetable based on a list of courses and time restrictions
- Refined AI outputs so that all database information can be quickly obtained by the user
