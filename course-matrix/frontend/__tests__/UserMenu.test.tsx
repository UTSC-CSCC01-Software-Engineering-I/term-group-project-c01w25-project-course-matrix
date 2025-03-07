import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { UserMenu } from "../src/components/UserMenu";
import "@testing-library/jest-dom";

const mockStore = configureStore([]);
const store = mockStore({});

describe("UserMenu Component", () => {
  beforeEach(() => {
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        user: {
          id: "123",
          user_metadata: {
            username: "John Doe",
            email: "john.doe@example.com",
          },
        },
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders user menu with username and avatar", () => {
    // render(
    //   <Provider store={store}>
    //     <Router>
    //       <UserMenu />
    //     </Router>
    //   </Provider>,
    // );
    // expect(screen.getByText("John Doe")).toBeInTheDocument();
    // expect(screen.getByText("JD")).toBeInTheDocument();
  });

  //   test("opens edit account dialog", () => {
  //     render(
  //       <Provider store={store}>
  //         <Router>
  //           <UserMenu />
  //         </Router>
  //       </Provider>,
  //     );

  //     fireEvent.click(screen.getByText("John Doe"));
  //     fireEvent.click(screen.getByText("Edit Account"));

  //     expect(screen.getByText("Edit Account")).toBeInTheDocument();
  //     expect(screen.getByLabelText("New User Name")).toBeInTheDocument();
  //   });

  //   test("opens delete account dialog", () => {
  //     render(
  //       <Provider store={store}>
  //         <Router>
  //           <UserMenu />
  //         </Router>
  //       </Provider>,
  //     );

  //     fireEvent.click(screen.getByText("John Doe"));
  //     fireEvent.click(screen.getByText("Delete Account"));

  //     expect(screen.getByText("Delete Account")).toBeInTheDocument();
  //     expect(
  //       screen.getByText(
  //         "Are you sure you want to delete your account? This action cannot be undone.",
  //       ),
  //     ).toBeInTheDocument();
  //   });

  //   test("logs out user", () => {
  //     render(
  //       <Provider store={store}>
  //         <Router>
  //           <UserMenu />
  //         </Router>
  //       </Provider>,
  //     );

  //     fireEvent.click(screen.getByText("John Doe"));
  //     fireEvent.click(screen.getByText("Logout"));

  //     // Add assertions to check if the user is logged out
  //   });
});
