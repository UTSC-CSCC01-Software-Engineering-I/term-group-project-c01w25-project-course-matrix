# Course Matrix/term-group-project-c01w25-project-course-matrix

## Iteration 04 - Review & Retrospect

When: 4/04/2025 at 9:00 pm

Where: Online

## Process - Reflection

In Sprint 4, our team focused on finishing up any trailing features and then refining our application so that it has as few bugs as possible. Additionally, we refined our UI and added additional tests to resolve any potential bugs.
Our team successfully generated and implemented the following features:

- Refined timetable operations via AI
- Timetable compare
- Timetable share
- Timetable favourite
- Additional unit/integration testing our application

By the end of sprint 4 we were able to complete all of our features, with the majority of our time this sprint spent finding and resolving bugs or adding additional unit/integration tests.

Our timetable is now fully functional, now with additional features. Users can now share their timetables with other users using their emails. Additionally, users can favourite and compare their timetables.

Our AI assistant’s functionality has been expanded upon and refined. Now, when sensitive operations are performed by our AI, various safeguards have been added (e.g. when deleting a timetable a further confirmation must be done). Additionally, various queries that could potentially break the chatbot have been patched.

The setup for deploying our application has been completed, with the latest functional version of our application already deployed on google cloud with a CI/CD pipeline. Currently, if a new change is pushed to main and it passes all tests the application is then deployed on our google cloud virtual machine.

In conclusion, during sprint 4 our application has been finished and further refined.

### Decisions that turned out well

1. **Finishing User Stories**

One decision that turned out well for us was finishing as many user stories as possible in the previous sprints. By doing this we were able to focus the majority of our efforts this sprint in refining all our user stories making our application the best possible version of itself. We resolved countless bugs, pushed QOL features, and optimized our application greatly.

2. **Rehearsing our Presentation**

For our sprint 4 presentation, we decided to complete both the slides and the script ahead of time. This allowed us to rehearse our presentation multiple times and refine it to perfection. Due to this our presentation was excellent.

### Decisions that did not turn out as well as we hoped

1. **Leaving Sprint 4 Deliverables for Later**

During sprint 4 we left completing our deliverables for later (e.g. NFR). We thought that focusing on refining our application should come first. This meant that we had to scramble to complete our sprint 4 documentations near the end of the sprint. This led to potential oversights in our documentation.

2. **We didn’t use TDD**

We set up our tests for our application quite late into its development. This meant that almost all of our tests were redundant, with us discovering bugs manually and the tests only being useful in defining our application’s behaviour.

## Product - Review

#### Goals and/or tasks that were met/completed

- Fix text highlight on edit username [SCRUM-131](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-131)
- Project deployment [SCRUM-130](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-130)
- Timetable sharing [SCRUM–58](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-58)
- Timetable favourite [SCRUM-57](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-57)
- Timetable Compare [SCRUM-62](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-62)
- Timetable Frontend Enhancements [SCRUM-145](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-145)
- Fix creating Timetable with same name causes user to be stuck in loading screen [SCRUM-146](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-146)
- Fix semester button non-functional [SCRUM-147](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-147)
- Delete confirmation for chatbot [SCRUM-148](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-148)
- Prevent chatbot from creating more than 1 timetable in a single cmd [SCRUM-149](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-149)
- Fix timetable generate flow cannot edit manually after generation [SCRUM-150](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-150)
- Fix timetable generation only generate partially [SCRUM-153](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-153)
- Fix time strings sent to timetable generate [SCRUM-154](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-154)
- Timetable generation refinement [SCRUM-155](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-155)
- Timetable title max char limit [SCRUM-156](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-156)
- Reading week inclusion for timetable [SCRUM-157](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-157)
- Fix AI Hallucinating courses [SCRUM-158](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-158)
- Timetables limit [SCRUM-159](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-159)
- Fix favourite non functional [SCRUM-161](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-161)
- Assignment 2 Completion [SCRUM-163](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-163)
- Hide restriction config for manual flow & prevent modification of restrictions in edit flow [SCRUM-166](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-166)
- Comparing shared timetables [SCRUM–167](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-167)
- Add select all button [SCRUM-169](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-169)
- Clean UserMenu so there are no useless fields [SCRUM-170](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-170)
- Fix Misc. BUgs in Generation Flow [SCRUM-171](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-171)
- Image improvements + logo + frontend tweaks [SCRUM-168](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-168)
- Presentation [SCRUM-172](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-172)
- Fix Restriction for type toggle persists old values [SCRUM-173](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-173)
- Deployment Time Zone Hotfix [SCRUM-174](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-174)
- Refactor constants.ts [SCRUM-177](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-177)
- Finish auth.test.ts tests [SCRUM-178](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-178)
- Fix frontend unit test mocking [SCRUM-179](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-179)
- Add more frontend tests [SCRUM-175](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-175)
- Backend integration tests [SCRUM-180](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-180)
- Speed up test execution by running all tests serially in the current process [SCRUM-181](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-181)
- Add some more frontend integration tests [SCRUM-182](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-182)
- Organize backend tests into unit and integration tests [SCRUM-183](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-183)
- Update REAME setup [SCRUM–184](https://cscc01-course-matrix.atlassian.net/browse/SCRUM-184)

#### Goals and/or tasks that were planned but not met/completed

We completed everything and are the best team.

## Meeting Highlights

We have decided to do the following from here on out:

1. Study hard for our CSCC01 final exam.
