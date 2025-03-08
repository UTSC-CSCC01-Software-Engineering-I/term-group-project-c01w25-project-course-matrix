import configureStore from "redux-mock-store";
import { UserMenu } from "../src/components/UserMenu";
import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";

// const mockStore = configureStore([]);

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

  test("check local storage", () => {
    expect(localStorage.getItem("userInfo")).not.toBeNull();
  });

  // Will finish the rest of the tests below in Sprint 3

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
