# AI-Powered Course and Timetable Planner / c01w25-project-course-matrix

## I. Product Features
Course Matrix is an innovative website-based AI-powered agent designed to transform academic and daily planning for undergraduate students at UTSC. It combines an advanced course database with a dynamic AI assistant to provide students with a centralized, intuitive, and efficient scheduling tool. The platform's intelligent algorithm traverses the extensive course catalogue at UTSC and analyzes user preferences to generate personalized timetables. Instead of spending hours navigating various platforms, students can now input their requirements and preferences and receive tailored scheduling recommendations in minutes.
By consolidating the course database and AI features into a single tool, Course Matrix offers a one-stop solution that eliminates the inefficiencies of traditional planning methods.
Key features include:
- **AI-Powered Assistance**:
  - Retrieve comprehensive course information such as prerequisites, exclusion, offerings, and degree requirements.
  - Make course recommendations tailored to user questions, preferences and academic goals.
  - Generate timetables based on user-provided constraints, preferences and needs.
  - Organize and manage AI chat logs by topic with options to edit, delete, or export them for future reference.
- **Dynamic Scheduling**:
  - Create and customize timetables with colour-coded daily activity blocks such as lectures, assignments, leisure, etc.
  - Overlay course options onto the existing timetable for a clear, visual representation of how it will affect the user's schedule.
  - Automatic timetable suggestions based on user-provided information such as course preferences, and restrictions.
  - Compare suggested timetables side by side to choose the best option.
- **Comprehensive Course Database**:
  - Search and filter courses by department, level, prerequisites or degree requirements.
  - Access a centralized repository of credible and updated course data
- **Collaboration & Sharing**:
  - Share timetables with internal and external users via the platform's internal sharing system or export as PDFs, and calendar links.
  - Compare schedules side by side for better coordination and synchronization.
- **Notification & Alerts**:
  - Opt-in for email reminders about critical events such as deadlines or exams.
  - Tag and favourite specific timetables for quick access.

## II. Target Users
Course Matrix primarily aims at providing UTSC undergraduate students with a 4-year companion, particularly those who may feel overwhelmed by managing multiple platforms and balancing between coursework and daily life:
- First-year Students: Who are stepping into the university environment for the first time and need guidance in navigating the new environments, campus logistics and course planning.
- International Students: Those who face numerous academic restrictions, and financial strains and must plan ahead to avoid prolonged academic journeys while fulfilling permit requirements.

[User Personas](Personas.pdf)

## III. Why should User Choose This Product
### 1. Time Saving and Convenience
Currently, UTSC students must navigate multiple platforms (e.g., the UTSC timetable, course description pages, and ACORN) to plan courses and confirm their availability. Course Matrix saves users time and streamlines the course research process by centralizing these functionalities into one location. Its AI assistant allows users to interact in normal English while still being able to fully utilise the help and tools provided with little to no instructions. Users can also manually customize their timetables and acquire academic information from a single location. Instead of spending a week gathering all the available course options and trying to fit them into a rigid timetable for visual representation of the next four months, users can easily communicate with the AI agent to receive numerous recommendations on how to effectively schedule different activities throughout the days within minutes.
### 2. Flexibility and Personalization
The time management tools currently provided by UTSC lack the flexibility and customization options that students often need. While third-party timetable providers offer more personalization features, they lack integration with the UTSC course database, leading to inefficiencies and a higher likelihood of errors.
Course Matrix addresses these challenges by bridging the gap with features that allow users to:
- Input key information into the course-generating algorithm to receive tailored timetable suggestions.
- Manually adjust schedules to align with personal preferences.
- Leverage an AI assistant for automated timetable creation.

By centralizing these functions, Course Matrix eliminates the need for students to juggle multiple websites and information sources, enabling them to manage both their academic and personal lives through a single, cohesive timetable. Additionally, robust personalization options allow users to customize the visual layout of their schedules for clarity and practicality, making the platform more intuitive and user-friendly.
### 3. Error Reduction
A centralized database helps users avoid critical errors, such as overlooking courses with limited availability or missing essential academic details often buried in traditional platforms. Consolidating information in one place eliminates the need to manually transfer data between pages, reducing the risk of human errors like incorrect lecture times or course codes.
### 4. Enhanced Coordination
Sharing and comparing schedules is often cumbersome with existing tools. Course Matrix simplifies this by offering:
- Seamless timetables sharing via internal system or external links.
- Easier group project coordination as users' schedules can be compared side-by-side.

## IV. Product Acceptance Criteria
A fully realized Course Matrix will include the following features and development standards:

**Functionalities & User Interface**:
- **Secure User Authorization**: Comprehensive account management and robust data privacy features that ensure users maintain full control over their accounts and information.
- **AI Personal Assistant**: Interactive and accurate, capable of providing detailed course information and generating tailored timetables.
- **Course Generating Algorithm**: Processes user inputs to produce optimized timetable suggestions customized to their needs.
- **Comprehensive Course Database**: Enables filtering by key criteria, such as prerequisites, exclusions, and department, for efficient course selection.
- **Timetable Management Tools**: Allows users to create customizable schedules, share timetables, and access advanced visualization features for clarity and ease of use.
- **Email Notification System**: Provides timely alerts for important academic events and deadlines.
- **Intuitive User Interface**: A seamless and user-friendly design ensures users can easily navigate and utilize the platform without requiring extensive instructions.

**Development Standards**:
- **Rigorous Testing**: All code is thoroughly tested to address potential bugs and ensure functionality across all use cases.
- **Feature Integration and Code Review**: New features are reviewed by at least two team members to ensure quality and consistency before being merged into the production environment, adhering to a structured code review process.

## V. Product Discussion Highlight
### 1. Identifying the Problem
Our team identified several key challenges UTSC students encounter when managing their academic schedules:
- **Inefficiency**:  Students often spend hours, particularly at the start of each semester, navigating multiple websites to research course details, availability, and alignment with degree requirements. Moreover, platforms like ACORN lack features such as overlaid course visualization, requiring students to switch between tabs to explore options before seeing how they fit into their timetables.
- **Course Selection and Academic Journey Planning**: UTSC offers a diverse range of courses with varying prerequisites and requirements, making it challenging for students to identify suitable options. This complexity increases the risk of students overlooking courses that align with their academic goals, interests, or preferences.
- **Limited Time Management Tools**: The current UTSC timetable system only displays enrolled courses and lacks options for adding additional activities or customizing the layout to suit individual preferences. This rigidity reduces its practicality. Furthermore, the absence of functionality to test different course combinations makes it difficult for students to explore and choose the most effective schedule.
### 2. Brainstorming Solution
We explored various solutions to address these challenges and identified the need for a centralized platform equipped with interactive tools that empower students to create personalized schedules efficiently.
One alternative considered was developing an Outlook-style timetable, where users could block time slots for activities or events and overlay their schedules with team members to identify mutual availability for group meetings. However, this approach lacked integration with the UTSC course database, limiting its utility. Users would still need to manually search for available courses and their details, rather than benefiting from automated recommendations or a visual preview of how selected courses fit into their existing schedules.
The Course Matrix platform addresses these gaps by offering immediate, practical solutions that simplify academic planning and decision-making. Designed to be a smart and reliable companion, it helps students navigate their academic journeys more effectively throughout their time at UTSC.
### 3. Team organization
Effective communication is central to our team's strategy for collaboration. We schedule meetings three times a week (Tuesday, Friday, and Sunday) to maintain momentum, discuss progress, and ensure alignment across tasks.
