## User Story 1: Account Creation

**As a** user  
**I want** to securely create an account  
**So that** I can access personalized features and manage my information with confidence

### Acceptance Criteria

- [ ] **Given** the user provides a valid email address and a password meeting complexity requirements,  
      **When** they submit the account creation form,  
      **Then** the system should send a verification email with a unique link to activate the account.

---

## User Story 2: User Login

**As a** user  
**I want** to securely log into my account  
**So that** I can access personalized features and manage my information

### Acceptance Criteria

- [ ] **Given** the user has an activated account with a valid email address and password,  
      **When** they submit the login form with their credentials,  
      **Then** the system should authenticate the user and grant access to their account.

---

## User Story 3: User Logout

**As a** user  
**I want** to be able to log out of my account  
**So that** I can securely end my session and protect my personal information

### Acceptance Criteria

- [ ] **Given** the user is logged into their account,  
      **When** they click the “logout” button,  
      **Then** the system should log the user out and redirect them to the login page or a public view.

---

## User Story 4: Account Deletion

**As a** user  
**I want** to be able to delete my account and all data associated with it  
**So that** I can maintain control over my personal information and ensure my privacy is respected

### Acceptance Criteria

- [ ] **Given** that the user wants to delete their account,  
      **When** the user presses the confirm button after reviewing a warning message about the consequences of account deletion,  
      **Then** the system should:
  - Prompt the user to confirm their identity by entering their password.
  - Permanently delete the user's account and all associated data from the system.
  - Display a confirmation message indicating successful deletion.
  - Send an email notification to the user confirming the account has been deleted.

## User Story 5: AI Assistant - Retrieve Course Information

**As a** user  
**I want** the assistant to retrieve comprehensive course information, including prerequisites, offerings, and recommendations  
**So that** I can quickly and easily find the solutions I need

### Acceptance Criteria

- [ ] **Given** that the user wants to retrieve information for a specific course,  
      **When** the user asks for details about the course,  
      **Then** the AI assistant should:
  - Retrieve and present all relevant course information, including:
    - Prerequisites / Exclusions.
    - Semester offerings.
    - Recommendations (e.g., related courses or advice for success in the course).
    - Course Description.
  - Present the information in an elegant, user-friendly format, such as:
    - Clear headings for each section (e.g., "Prerequisites," "Offered In," "Recommendations").
    - Bullet points or short paragraphs for easy readability.
    - Conforming to user needs (e.g., “Tell me about CSCC01 in less than 50 words”).
  - Handle ambiguous course names or codes by asking clarifying questions to the user if needed (e.g., clarifying if the user is asking for MATC01 or CSCC01 if the user asks “Tell me about C01”).

---

## User Story 6: AI Assistant - Retrieve Graduation Requirements

**As a** user  
**I want** to request important details about graduation requirements, such as POST and other criteria  
**So that** I can avoid navigating multiple links to find the answers

### Acceptance Criteria

- [ ] **Given** that the user wants to retrieve graduation requirements for a specific program,  
      **When** the user asks for details about the program,  
      **Then** the AI assistant should:
  - Retrieve and present all relevant graduation requirements, including:
    - POSt requirements (e.g., program entry prerequisites).
    - Credit requirements (e.g., total credits, required courses, elective options).
    - Minimum grade thresholds for program-specific courses.
    - Any additional criteria, such as co-op work terms.
  - Format the response in a clear, organized layout with sections like:
    - Program Entry Requirements.
    - Graduation Credit Breakdown.
    - Additional Criteria or Recommendations.
  - Handle ambiguous program names by prompting the user to clarify (e.g., "Did you mean Computer Science Specialist or Computer Science Major?").
  - Provide quick links to official resources for more detailed program policies, if applicable.
  - Notify the user if information is incomplete or unavailable and offer further assistance (e.g., "Would you like help navigating the official website?").

---

## User Story 7: AI Assistant - Generate Timetable

**As a** user  
**I want** to create a timetable directly through the assistant chatbot  
**So that** I can save time and streamline the process

### Acceptance Criteria

- **Input Processing**

  - [ ] **Given** that the user wants to generate a timetable,
  - [ ] **When** the user provides details such as:
    - A list of desired courses.
    - Time constraints (e.g., exclusions like "no classes after 5 PM" or inclusions like "prefer mornings").
    - Specific days to exclude or prioritize.
    - Maximum or minimum break times between classes.
  - [ ] **Then** the assistant should:
    - Parse and validate the input.
    - Ask clarifying questions if necessary.
    - Confirm that the gathered parameters are correct with a summary (e.g., "You’ve requested: Course A, B, C; no classes after 5 PM; and at least one-hour breaks between classes. Is this correct?").

- **Timetable Generation**

  - [ ] **Given** that the parameters are validated and confirmed by the user,  
        **When** the assistant processes the information,  
        **Then** it should:
    - Pass the parameters to the timetable generation function (via a custom programmed algorithm).
    - Display a loading message (e.g., "Generating your timetable...").

- **Timetable Presentation**

  - [ ] **Given** the function successfully generates the timetable,  
        **When** the assistant receives the response,  
        **Then** it should:
    - Present a link to the list of generated timetables.

- **Error Handling**
  - [ ] **Given** that the user’s constraints cannot be met,  
        **When** no suitable schedules can be generated,  
        **Then** the assistant should:
    - Notify the user (e.g., "Based on your constraints, no feasible timetable could be generated. Would you like to modify some conditions?").
    - Suggest modifications (e.g., "Consider extending your availability or reducing course preferences.").

---

## User Story 8: AI Assistant - Create New Chat Log

**As a** user  
**I want** to be able to create new chat logs with the assistant  
**So that** my interactions are organized and separated by topic or purpose

### Acceptance Criteria

- [ ] **Given** that the user wants to create a new chat log,  
      **When** the “create new chat” button is pressed,  
      **Then** the system should:
  - Open a new chat window or session, allowing the user to start a fresh conversation.
  - Automatically assign a new session identifier or title (e.g., "Chat 1," "Chat with Assistant - 01/28/2025").

---

## User Story 9: AI Assistant - Export, Rename, and Delete Chat Logs

**As a** user  
**I want** to be able to export, rename, and delete past chat logs  
**So that** I can manage my personal data and retain control over my interaction history

### Acceptance Criteria

- **Export**

  - [ ] **Given** that the user wants to export the chat log,  
        **When** the “export” button is pressed,  
        **Then** a formatted .txt file will be downloaded containing all messages of the chat log.
    - Prompt the user to select a file format (e.g., .txt, .pdf, or .json).
    - Generate a file containing all messages from the selected chat log in the chosen format.
    - Ensure the file includes:
      - Time Stamped messages.
      - User and assistant labels for clarity.
    - Trigger a download for the file with a default name like <Chat*Title>*<Date>.txt.

- **Rename**

  - [ ] **Given** that the user wants to rename a chat log,  
        **When** the “rename” button is pressed,  
        **Then** the system should:
    - Provide an editable text field to input the new name.
    - Validate the new name to ensure it’s not empty or overly long.
    - Save and display the updated chat name immediately.

- **Delete**
  - [ ] **Given** that the user wants to delete a chat log,  
        **When** the “delete” button is pressed,  
        **Then** the system should:
    - Prompt the user with a confirmation message (e.g., “Are you sure you want to delete this chat log? This action cannot be undone.”).
    - Permanently delete the chat log upon confirmation.
    - Notify the user of successful deletion (e.g., “Chat log deleted successfully”).

## User Story 10: Course Database - Course Listing

**As a** student  
**I want** a list of available courses to be displayed based on my filter options  
**So that** I can potentially analyze them and add them to my schedule

### Acceptance Criteria

- [ ] **Given** that the student is building their timetable,  
      **When** they open the course browsing feature,  
      **Then** the system should:
  - Display a comprehensive list of all available courses, organized by:
    - Department or program.
    - Year level (e.g., 1st-year, 2nd-year).
    - Availability (e.g., Fall, Winter, Summer).
  - Allow students to filter the list by:
    - Course code or name.
    - Time for availability.
    - Credit weight (e.g., half-credit, full-credit).

---

## User Story 11: Course Database - Course Details

**As a** student  
**I want** to access detailed and comprehensive information about a selected course  
**So that** I can effectively analyze and evaluate it

### Acceptance Criteria

- [ ] **Given** that the student selects a course from the list,  
      **When** they click on the course,  
      **Then** the system should display detailed information regarding the course.

## User Story 12: Course Scheduler - Build Timetable

**As a** student  
**I want** to build a set of timetables to manage my lecture time, homework time, and leisure time  
**So that** I can effectively balance my schedule and stay organized

### Acceptance Criteria

- [ ] **Given** that the student wants to build a timetable,  
      **When** they add new entries to the timetable,  
      **Then** the system should display a timetable reflecting the student’s entries.

---

## User Story 13: Course Scheduler - Edit and Delete Entries

**As a** student  
**I want** to edit and delete entries in my timetable (both courses and custom entries)  
**So that** it always remains accurate and up-to-date

### Acceptance Criteria

#### Edit

- [ ] **Given** that the student wants to modify an existing timetable entry,  
      **When** they select an entry and choose the "Edit" option,  
      **Then** the system should allow them to update details such as time, duration, or notes.

- [ ] **Given** that the student modifies a course entry,  
      **When** they save the changes,  
      **Then** the system should immediately reflect the changes in the timetable.

#### Delete

- [ ] **Given** that the student wants to remove a course or custom entry,  
      **When** they select the entry and choose the "Delete" option,  
      **Then** the system should prompt them for confirmation before proceeding.

- [ ] **Given** that the student confirms the deletion,  
      **When** the system processes the request,  
      **Then** the entry should be permanently removed from the timetable.

---

## User Story 14: Course Scheduler - Visualize Schedule

**As a** student  
**I want** to visualize my schedule as I hover over courses and their sections  
**So that** I can easily identify any gaps in my schedule

### Acceptance Criteria

- [ ] **Given** that I am adding courses to my schedule,  
      **When** I hover over a course’s lecture, tutorial, or lab section,  
      **Then** a semi-transparent preview of the entry should be displayed on the timetable, indicating where it would be placed.

- [ ] **Given** that a course section conflicts with an existing entry,  
      **When** I hover over that section,  
      **Then** the preview should highlight the conflict with a red outline indicator, signifying the conflict.

- [ ] **Given** that I stop hovering over the course section,  
      **When** I move my cursor away,  
      **Then** the preview should disappear without affecting the existing schedule.

- [ ] **Given** that I select a course section after hovering,  
      **When** I click to add it to my schedule,  
      **Then** the section should be permanently placed on the timetable.

---

## User Story 15: Course Scheduler - Custom Colour for Entries

**As a** student  
**I want** to be able to customize the colour of each of my calendar entries  
**So that** the schedule looks visually appealing and easier to navigate

### Acceptance Criteria

- [ ] **Given** that I want to change the colour of a calendar entry,  
      **When** I select an entry and open the colour customization option,  
      **Then** a colour palette should be displayed, allowing me to choose a new colour.

- [ ] **Given** that I select a new colour for an entry,  
      **When** I confirm the selection,  
      **Then** the updated colour should immediately apply to the calendar entry and be saved automatically.

---

## User Story 16: Course Generation - Input Courses

**As a** student  
**I want** to input a list of courses I want to take into the scheduler  
**So that** it can generate a timetable with the relevant courses included

### Acceptance Criteria

- [ ] **Given** that I want to include specific courses,  
      **When** I press the course selection button,  
      **Then** the scheduler should display the selected course and consider it in the timetable generation algorithm.

- [ ] **Given** that I have selected multiple courses,  
      **When** I finalize my course selection,  
      **Then** the scheduler should generate a timetable that includes all the chosen courses while avoiding conflicts.

---

## User Story 17: Course Generation - Custom Rules and Restrictions

**As a** student  
**I want** to specify rules—such as time slot restrictions, day restrictions, and the number of days per week  
**So that** I can customize a timetable that suits my needs

### Acceptance Criteria

- [ ] **Given** that I want to add rules and restrictions to my schedule,  
      **When** I input specific constraints (e.g., no classes before 10 AM, no classes on Fridays, or a maximum of three days per week),  
      **Then** the algorithm should incorporate these restrictions when generating my timetable.

- [ ] **Given** that my selected courses and restrictions make it impossible to generate a valid schedule,  
      **When** I attempt to generate a timetable,  
      **Then** the system should notify me and provide suggestions (e.g., relaxing certain constraints or prioritizing specific courses).

---

## User Story 18: Course Generation - Save Timetables

**As a** student  
**I want** the generated timetables to be saved in the system  
**So that** I can easily refer back to them later

### Acceptance Criteria

- [ ] **Given** that I have generated course schedules,  
      **When** I navigate to another page on the website,  
      **Then** my generated timetables should still be accessible unless I have explicitly deleted them.

- [ ] **Given** that I want to delete a generated timetable,  
      **When** I click the delete option for a specific timetable,  
      **Then** that timetable should be permanently removed from the system.

---

## User Story 19: Email Notifications

**As a** student  
**I want** to opt in/opt out of email notifications  
**So that** I could receive email notices of important events

### Acceptance Criteria

- [ ] **Given** that I want to opt in or opt out of email notifications,  
      **When** I toggle the email notification option in my settings,  
      **Then** my preference (opt-in or opt-out) should be saved, and I will start receiving or stop receiving email notifications accordingly.

---

## User Story 20: Favouriting Timetables

**As a** student  
**I want** to favourite timetables  
**So that** I can easily access and put them to practical use

### Acceptance Criteria

- [ ] **Given** that I want to favourite a timetable,  
      **When** I click the "Favourite" button next to the schedule,  
      **Then** the schedule will be marked as a favorite and displayed prominently at the top of the timetable list.

- [ ] **Given** that I want to remove a favorited timetable,  
      **When** I click the "Unfavourite" button next to the schedule,  
      **Then** the schedule will be unfavorited and displayed prominently at the top of the timetable list.

---

## User Story 21: Export Timetable

**As a** student  
**I want** to export my course schedule as a PDF or calendar  
**So that** I can reference it in other formats

### Acceptance Criteria

- [ ] **Given** that I want to export my schedule,  
      **When** I click the export button,  
      **Then** a prompt should show up about the export options, either in PDF or .ics file format.

---

## User Story 22: Compare Timetables

**As a** student  
**I want** to perform side-by-side comparisons with my schedules  
**So that** I can easily identify my preference

### Acceptance Criteria

- [ ] **Given** that I want to compare 2 of my schedules,  
      **When** I select the 2 schedules to compare,  
      **Then** the window should be split into 2 halves, one for each schedule, allowing easy side-by-side comparison.

- [ ] **Given** that I am comparing schedules,  
      **When** I hover over a course or event in one schedule,  
      **Then** the corresponding time slot in the other schedule should be highlighted if there is a conflict or overlap.

---

## User Story 23: Share Schedule

**As a** student  
**I want** to share my schedule with other users on the platform  
**So that** we can compare our schedules

### Acceptance Criteria

- [ ] **Given** that I am a registered user with a completed schedule on the platform,  
      **When** I choose to share my schedule,  
      **Then** the platform should provide an option to generate a shareable link or directly compare schedules with selected users.

- [ ] **Given** that another user has shared their schedule with me,  
      **When** I open the shared schedule,  
      **Then** I should be able to view their schedule in a readable format and compare it with mine.

---

## User Story 24: Share Schedule via Link

**As a** student  
**I want** to share my schedule via a link  
**So that** others can view it without needing to sign up for an account

### Acceptance Criteria

- [ ] **Given** that I want to share my schedule via a link,  
      **When** I click the “Generate Link” button,  
      **Then** a unique, shareable link should be created, granting view-only access to my schedule.
