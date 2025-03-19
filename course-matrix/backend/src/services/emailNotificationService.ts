import { TEST_DATE_NOW, TEST_NOTIFICATIONS } from "../constants/constants";
import { supabaseServersideClient } from "../db/setupDb";
import { isDateBetween } from "../utils/compareDates";
import axios from "axios";

type EmaiLData = {
  sender: {
    email: string;
    name: string;
  };
  to: {
    email: string;
    name: string;
  }[];
  subject: string;
  htmlContent: string;
};

// Create a function to send emails via Brevo API
async function sendBrevoEmail(emailData: EmaiLData) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.brevo.com/v3/smtp/email",
      headers: {
        accept: "application/json",
        "Api-key": process.env.BREVO_API_KEY!,
        "content-type": "application/json",
      },
      data: emailData,
    });

    return response?.data;
  } catch (error: any) {
    console.error(
      "Error sending email:",
      error?.response ? error?.response?.data : error?.message
    );
    throw error;
  }
}

// Ensure offering is in current semester and current day of week
export function correctDay(offering: any): boolean {
  const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const semester = offering?.offering;
  const day = offering?.day;

  if (!semester || !day) return false;

  let now;
  if (TEST_NOTIFICATIONS) {
    now = TEST_DATE_NOW;
  } else {
    now = new Date();
  }

  let startDay;
  let endDay;

  // console.log(offering)

  if (semester === "Summer 2025") {
    startDay = new Date(2025, 4, 2);
    endDay = new Date(2025, 7, 7);
  } else if (semester === "Fall 2025") {
    startDay = new Date(2025, 8, 3);
    endDay = new Date(2025, 11, 3);
  } else {
    // Winter 2026
    startDay = new Date(2026, 0, 6);
    endDay = new Date(2026, 3, 4);
  }

  if (!isDateBetween(now, startDay, endDay)) {
    // console.log(`${now.toDateString()} is not between ${startDay.toDateString()} and ${endDay.toDateString()}`)
    return false;
  }

  if (weekdays[now.getDay()] !== day) {
    // console.log(`${weekdays[now.getDay()]} is not equal to ${day}`)
    return false;
  }

  return true;
}

// Function to check for upcoming events and send notifications
export async function checkAndNotifyEvents() {
  console.log("Checking for upcoming events...");
  let now;
  if (TEST_NOTIFICATIONS) {
    now = TEST_DATE_NOW;
  } else {
    now = new Date();
  }

  // Calculate time 15 minutes from now
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const formattedStartTime = now.toTimeString().slice(0, 8);
  const formattedEndTime = fifteenMinutesFromNow.toTimeString().slice(0, 8);

  try {
    // Get events that start between now and 15 minutes from now
    const { data: events, error } = await supabaseServersideClient
      .schema("timetable")
      .from("course_events")
      .select("*")
      .gte("event_start", formattedStartTime)
      .lte("event_start", formattedEndTime);

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    console.log(`Found ${events.length} events to notify users about`);

    // Send email notifications for each event
    for (const event of events) {
      // Get offering
      const { data: offerings, error: errorOffering } =
        await supabaseServersideClient
          .schema("course")
          .from("offerings")
          .select("*")
          .eq("id", event.offering_id)
          .limit(1);

      if (errorOffering) {
        console.error("Error fetching offering: ", errorOffering);
        return;
      }

      if (!offerings || offerings.length === 0) {
        console.error("Offering not found id:", event.offering_id);
        return;
      }

      // Ensure we are in the correct semester and day of week
      if (!correctDay(offerings[0])) {
        continue;
      }

      // Get user info
      const { data: userData, error } =
        await supabaseServersideClient.auth.admin.getUserById(event.user_id);

      if (error) {
        console.error("Error fetching user: ", error);
        return;
      }

      if (!userData) {
        console.error("User not found id:", event.user_id);
        return;
      }

      const user = userData?.user;
      const userEmail = user?.email;
      const userName = user?.user_metadata?.username;

      console.log(`Sending email to ${userEmail} for ${event.event_name}`);

      try {
        const email = {
          sender: {
            email: process.env.SENDER_EMAIL!,
            name: process.env.SENDER_NAME || "Course Matrix Notifications",
          },
          to: [{ email: userEmail!, name: userName }],
          subject: `Reminder: ${event.event_name} starting soon`,
          htmlContent: `
            <h2>Event Reminder</h2>
            <p>Hello ${userName},</p>
            <p>Your event "${event.event_name}" is starting soon</p>
            <p><strong>Start time:</strong> ${event.event_start}</p>
            <p><strong>Description:</strong> ${
              event.event_description || "No description provided"
            }</p>
            <p>Thank you for using our calendar service!</p>
          `,
        };

        const result = await sendBrevoEmail(email);
        console.log("Email sent successfully:", result);
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    }
  } catch (err) {
    console.error("Error in notification process:", err);
  }
}
