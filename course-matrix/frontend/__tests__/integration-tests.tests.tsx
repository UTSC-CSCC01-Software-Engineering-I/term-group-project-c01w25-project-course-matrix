import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from '@jest/globals';
import App from '../src/App';
import SignupPage from '../src/pages/Signup/SignUpPage';
import LoginPage from '../src/pages/Login/LoginPage';
import Dashboard from '../src/pages/Dashboard/Dashboard';
import TimetableBuilder from '../src/pages/TimetableBuilder/TimetableBuilder';
import Home from '../src/pages/Home/Home';

test('typical flow for creating an account and logging in', () => {
    render(<App />, { wrapper: MemoryRouter });
    render(<LoginPage />, { wrapper: MemoryRouter });
    render(<SignupPage />, { wrapper: MemoryRouter });
    render(<Dashboard />, { wrapper: MemoryRouter });

    // Going to login page
    expect(screen.getByText('Login')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Login'));

    // Logging in with invalid credentials
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Login invalid. Please check your email or password.')).toBeInTheDocument();

    // Going to signup page
    fireEvent.click(screen.getByText('Sign up!'));
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();

    // Creating an account
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByText('Account created successfully!')).toBeInTheDocument();

    // Logging in with valid credentials
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    // Check if user is redirected to home page
    expect(screen.getByText('Home Page')).toBeInTheDocument();
});

test('typical flow for creating a new timetable, adding courses, adding restrictions, saving the timetable, and editing the timetable', () => {
    render(<App />, { wrapper: MemoryRouter });
    render(<LoginPage />, { wrapper: MemoryRouter });
    render(<SignupPage />, { wrapper: MemoryRouter });
    render(<Dashboard />, { wrapper: MemoryRouter });
    render(<Home />, { wrapper: MemoryRouter });
    render(<TimetableBuilder />, { wrapper: MemoryRouter });

    expect(screen.getByText('My Timetables')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create New'));

    expect(screen.getByText('New Timetable')).toBeInTheDocument();

    // Adding courses
    fireEvent.click(screen.getByText('Choose meeting sections manually'));
    fireEvent.click(screen.getByText('Search'));
    fireEvent.click(screen.getByText('ACMB10H3'));
    fireEvent.click(screen.getByText('ACMC01H3'));
    fireEvent.click(screen.getByText('ACMD01H3'));
    screen.getAllByText('No LEC Selected').forEach((element) => {
        fireEvent.click(element);
        fireEvent.click(screen.getByText('LEC 01'));
    });

    // Adding a restriction
    fireEvent.click(screen.getByText('Add New'));
    fireEvent.click(screen.getByText('Select a type'));
    fireEvent.click(screen.getByText('Restrict Entire Day'));
    fireEvent.click(screen.getByText('Tuesday'));
    fireEvent.click(screen.getByText('Create'));

    // Saving the timetable
    fireEvent.click(screen.getByText('Create Timetable'));
    fireEvent.change(screen.getByLabelText('Timetable Name'), { target: { value: 'Test Timetable Name' } });
    fireEvent.click(screen.getByText('Save'));

    // Check if user is redirected to home page and timetable is saved
    expect(screen.getByText('My Timetables')).toBeInTheDocument();
    expect(screen.getByText('Test Timetable Name')).toBeInTheDocument();

    // Editing the timetable by resetting all courses and restrictions
    fireEvent.click(screen.getByText('Test Timetable Name'));
    expect(screen.getByText('Edit Timetable')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.queryByText('ACMB10H3')).toBeNull();
    expect(screen.queryByText('ACMC01H3')).toBeNull();
    expect(screen.queryByText('ACMD01H3')).toBeNull();
    expect(screen.queryByText('Tuesday')).toBeNull();
    fireEvent.click(screen.getByText('Update Timetable'));

    // Check if user is redirected to home page and timetable is updated
    expect(screen.getByText('My Timetables')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Test Timetable Name'));
    expect(screen.queryByText('ACMB10H3')).toBeNull();
    expect(screen.queryByText('ACMC01H3')).toBeNull();
    expect(screen.queryByText('ACMD01H3')).toBeNull();
    expect(screen.queryByText('Tuesday')).toBeNull();
});
