# Course Matrix/term-group-project-c01w25-project-course-matrix




## Iteration 03 - Review & Retrospect
When: 3/20/2025 at 9:00 pm

Where: Online




## Process - Reflection
In Sprint 3, our team focused on completing our most complex and difficult features needed to establish our software’s main functionality, which will be further tested and bug fixed in future sprints.
Our team successfully generated and implemented the following features:
- Timetable operations via AI
- Timetable Basics/Insertion
- Timetable generation
- Entries Update/Delete
- Email notifications
- Unit/Integration testing our application


By the end of sprint 3 we were able to have most of these features completed and for the features that weren’t completed either excellent progress had been made into completing them or they were deemed redundant. 


Our timetable is now fully functional. The user can create timetables with their chosen courses and their times will be displayed properly. The user can update timetables. All of the basic features are done. Additionally, the user can automatically generate a timetable that follows a list of courses and a list of time restrictions. 


Our AI assistant’s functionality has been expanded upon and refined. Now it can execute timetable functions when queried to by the user. For instance, the user can create, edit and delete a timetable from our AI chatbot. Additionally, various queries that could potentially break the chatbot have been patched.


The setup for deploying our application has been completed, a version of our application is already deployed on google cloud with a CI/CD pipeline. Currently, if a new change is pushed to develop and it passes all tests the application is then deployed on our google cloud virtual machine.


In conclusion, during sprint 3 excellent progress has been made in completing our software’s main features.


#### Decisions that turned out well
1. **Using Existing Developed Functions**
One decision that turned out well for us was when integrating our AI with our timetables. Normally, getting our AI trained well enough that it could properly interact with our timetable database would’ve taken far too long. By instead making our AI chatbot call existing functions (e.g. calling timetable generate to generate a timetable) we greatly simplified this process while also making it more reliable. 


2. **Google Cloud Virtual Machine**
When deploying our application with a proper CI/CD pipeline choosing google cloud was greatly beneficial to our group. Firstly, our group had experience working with google cloud thus we were able to have a robust environment setup to run our application well ahead of time. Due to this adding the CI/CD pipeline was all we had to do to get our application fully deployed.


#### Decisions that did not turn out as well as we hoped
1. **Timetable Database Bad Data**
During sprint 3 we had run into many technical difficulties with our timetable database. Due to a few key coding oversights made earlier in development we had to reset our database to fix corrupted entries filling it up. This cost our team valuable time.


2. **Incorrect Estimation of Bug Fix Difficulty**
During sprint 3 we underestimated the difficulty of fixing what seemed to be small bugs in our code. Most of our bugs were visual bugs whose origin were nested deeply in our dependencies. Due to this, fixing these bug issues often took as much time as developing a feature or were outright unfixable in the allotted time.


#### Planned Changes
**Reassessing Bugs**
Various bugs that were planned on being completed today were instead pushed back to be completed later. Their difficulty score will likely be increased as well. 


**Pushing Back/Scrapping Various User Stories**
There were a few user stories that we have decided to push back to sprint 4. Additionally, we considered scrapping some of the low priority features as we want to prioritize on refining existing features.


## Product - Review


#### Goals and/or tasks that were met/completed
- Timetable Operations via AI [SCRUM-31](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-31). From the AI chatbot we can use various of our timetable operations like for instance, generating a timetable using timetable generate.
- Timetable Basics/Insertion [Scrum-46](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-46). Basic timetable functionalities like insertion.
- Entries Update/Delete
[Scrum-47](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-47). Updating timetable entries and deleting them.
- Email Notifications [Scrum-56](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-56). Notifying users via email based on upcoming timetable events. 
- Fix restriction Creation Bugs [SCRUM-129](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-129)
- Fix module importing linting errors [SCRUM-125](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-125)
- Updated ReadMe file [SCRUM-126](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-126). Updated ReadMe file so that app setup is up to date.
- Sprint 3 Documentation
[SCRUM-127](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-127). Creating iteration-03.md and other required sprint 3 documents.
- Sprint 3 Retrospective
[SCRUM-128](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-128). Finishing sprint 3 retrospective documents (e.g. burndown.pdf).
- Refine AI Outputs (especially for year level) [SCRUM-132](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-132). Making sure AI output does not break a specified format
- Enhancement: Check timetable name duplicate [SCRUM-137](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-137)
- Add Backend Testing [SCRUM-138](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-138) 


#### Goals and/or tasks that were planned but not met/completed
- Timetable Export/Share [SCRUM-58](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-58). Sharing your timetable with others and exporting them to a copyable format. 
- Timetable Favorite [SCRUM-57](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-57). Being able to favorite a timetable.
- Fix text highlight on edit username [SCRUM-131](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-131)
- Project Deployment
[SCRUM-130](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-130). Making a CI/CD pipeline with all requirements defined by assignment 2.
 


## Meeting Highlights
We have decided to do the following from here on out:
1. Prioritize polishing existing features
2. Preparing our application for presentation
3. Scrapping few user stories that are deemed either redundant or unimportant


For the next meetings our development efforts will focus on:
1. Adding additional unit/integration tests to our program to ensure stability
2. Patching various bug fixes
3. Completing any unfinished user stories
