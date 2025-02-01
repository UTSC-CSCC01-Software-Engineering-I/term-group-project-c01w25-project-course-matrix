# Course Matrix: Your AI-Powered Academic Planner

## Overview

Course Matrix is an AI-powered platform designed to streamline the course selection and timetable creation process for undergraduate students at UTSC.

![alt text](CourseMatrixLogo.png)

By taking user preferences into consideration, Course Matrix is able to leverage AI to intelligently provide personalized course recommendations and generate optimized timetables.

## Motivation

At UTSC, students face challenges when it comes to managing their academic and personal schedules. The process of selecting the optimal courses and ensuring that course prerequisites are met can be time-consuming and overwhelming, especially for international and first-year students. The current systems for dealing with this problem are fragmented as they require students to check multiple websites. This leads to inefficiencies and potential errors in course selection.

Course Matrix addresses these problems by providing a centralized, user-friendly platform that integrates the course database with advanced AI features. Our goal is to help students reduce scheduling errors, save valuable time, and provide a flexible, personalized approach to course planning.

## Installation

### Prerequisites

You will need to install the following prerequisites to get started:
[NodeJS version 20.10.0 or above](https://nodejs.org/en/download)

### Getting Started

Follow these steps to install this application

1. Clone this repo:

```
git clone https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01w25-project-course-matrix.git
```

2. Install npm packages

```
cd ./course-matrix
cd ./frontend
npm install
cd ../backend
npm install
```

3. Configure environment variables: Create a `.env` file in `/backend` and populate it with the following:

```
NODE_ENV="development"
PORT=8081
CLIENT_APP_URL="http://localhost:5173"
DATABASE_URL=[Insert Supabase Project URL]
DATABASE_KEY=[Insert Supabase Project API key]
```

The `DATABASE_URL` variable should contain your Supabase project url and the `DATABASE_KEY` should contain your Supabase project’s API key. To learn how to create a new Supabase project: see [here](https://medium.com/@heshramsis/building-a-crud-app-with-supabase-and-express-a-step-by-step-guide-for-junior-developers-81456b850910). Note that for the purposes of this project, we will provide the grader with all necessary API keys and URLs.

### Running the Application

To run the application locally:

1. Run backend:

```
cd ./backend
npm run dev
```

2. Run frontend

```
cd ../frontend
npm run dev
```

Navigate to the url given by the environment variable `CLIENT_APP_URL` in `.env` to access the frontend web page. This should be `http://localhost:5173` initially.

## Tech Stack and Software Architecture Pattern

- Tech Stack: We utilize the PERN tech stack (PostgreSQL, Express, React, and Node) tech stack
  - For the reasoning behind our tech stack, refer to this [Google Docs document](https://docs.google.com/document/d/1_1IzFID0PmKTuQVWqW7zK-3XHz6-uZcC5yZ2Ghcq10E/edit?usp=sharing)
- Software Architecture Pattern: 3 Tier architecture

## Contribution

We use Jira as our ticketing website. Also, Course Matrix follows the git flow process. For more info, see the sections below for the [Branch Naming Rules](#branch-naming-rules) and the [Contribution Steps](#contribution-steps).

### Branch Naming Rules

- The `main` branch holds the production-ready code.
- The `develop` branch is the integration branch where new features and non-breaking fixes are added and tested.
- Feature branches and bugfix branches are created off the `develop` branch and are merged back into it when complete. Both feature branches and bugfix branches follow the naming convention `{initials}/{jira-ticket-number}-{descriptive-title}` (e.g. `ax/scrum-2-add-login-ui` could be an example of a feature branch name and `ax/scrum-3-fix-unresponsive-login-button` could be an example of a bugfix branch name).
- Release branches are created off the `develop` branch and are merged into the `develop` and `main` branches when complete. Release branches follow the naming convention `release/{version-number}` (e.g. `release/1.0`).
- Hotfix branches are created off the `main` branch and are merged into the `develop` and `main` branches when complete. Hotfix branches follow the naming convention `hotfix/{version-number}` (e.g. `hotfix/1.0.1`).

### Contribution Steps

1. Once you start working on a Jira ticket, set the status of that ticket to `In Progress` and create the associated branch for that ticket on GitHub.
2. Commit and push the necessary changes for your branch.
3. Create a pull request (PR) for your branch:

   - For hotfix or release branches, create one PR to merge it into the `main` branch and another one to merge it into the `develop` branch.
   - For feature branches, create one PR to merge it into the `develop` branch.

4. Get a PR approval from at least one other team member.
5. Merge the PR and mark the associated Jira ticket with a status of `Done`.

   - _Just as a FYI, our GitHub repo is configured to strictly use the [Squash and merge option](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits) for PRs with the default commit message set as the PR title._
