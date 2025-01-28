# Course Matrix: Your AI-Powered Academic Planner

## Overview

Course Matrix is an AI-powered platform designed to streamline the course selection and timetable creation process for undergraduate students at UTSC.

![alt text](CourseMatrixLogo.png)

By taking user preferences into consideration, Course Matrix is able to leverage AI to intelligently provide personalized course recommendations and generate optimized timetables.

## Motivation

At UTSC, students face challenges when it comes to managing their academic and personal schedules. The process of selecting the optimal courses and ensuring that course prerequisites are met can be time-consuming and overwhelming, especially for international and first-year students. The current systems for dealing with this problem are fragmented as they require students to check multiple websites. This leads to inefficiencies and potential errors in course selection.

Course Matrix addresses these problems by providing a centralized, user-friendly platform that integrates the course database with advanced AI features. Our goal is to help students reduce scheduling errors, save valuable time, and provide a flexible, personalized approach to course planning.

## Installation

[Kevin will do this part]

## Contribution

We use Jira as our ticketing website. Also, Course Matrix follows the git flow process. For more info, see the sections below for the [Branch Naming Rules](#branch-naming-rules) and the [Contribution Steps](#contribution-steps).

### Branch Naming Rules

1. The `main` branch holds the production-ready code.
2. The `develop` branch is the integration branch where new features and non-breaking fixes are added and tested.
3. Feature branches and bugfix branches are created off the `develop` branch and are merged back into it when complete. Both feature branches and bugfix branches follow the naming convention `{initials}/{jira-ticket-number}-{descriptive-title}` (e.g. `ax/scrum-2-add-login-ui` could be an example of a feature branch name and `ax/scrum-3-fix-unresponsive-login-button` could be an example of a bugfix branch name).
4. Release branches are created off the `develop` branch and are merged into the `develop` and `main` branches when complete. Release branches follow the naming convention `release/{version-number}` (e.g. `release/1.0`).
5. Hotfix branches are created off the `main` branch and are merged into the `develop` and `main` branches when complete. Hotfix branches follow the naming convention `hotfix/{version-number}` (e.g. `hotfix/1.0.1`).

### Contribution Steps

1. Create a Jira ticket detailing the task you plan to work on. Once you start working on it, set the status of the ticket to `In Progress` and create the associated branch on GitHub.
2. Commit and push the necessary changes for your branch.
3. Create a pull request (PR) for your branch:
   3.1. For hotfix or release branches, create one PR to merge it into the `main` branch and another one to merge it into the `develop` branch.
   3.2. For feature branches, create one PR to merge it into the `develop` branch.
4. Get a PR approval from at least one other team member.
5. Merge the PR (the general guideline we follow is a `Squash and merge`) and mark the associated Jira ticket with a status of `Done`.
