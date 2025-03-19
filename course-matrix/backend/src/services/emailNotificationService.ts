import {
  brevoApiInstance,
  brevoSendSmtpEmail,
} from "../config/setupEmailNotificationService";
import { TEST_NOTIFICATIONS } from "../constants/constants";
import { supabaseServersideClient } from "../db/setupDb";
import { isDateBetween } from "../utils/compareDates";

// Ensure offering is in current semester and current day of week
export function correctDay(offering: any): boolean {
  const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const semester = offering?.offering;
  const day = offering?.day;

  if (!semester || !day) return false;

  const now = new Date();

  let startDay;
  let endDay;

  if (semester === "Summer 2025") {
    startDay = new Date(2025, 5, 2);
    endDay = new Date(2025, 8, 7);
  } else if (semester === "Fall 2025") {
    startDay = new Date(2025, 9, 3);
    endDay = new Date(2025, 12, 3);
  } else {
    // Winter 2026
    startDay = new Date(2026, 1, 6);
    endDay = new Date(2026, 4, 4);
  }

  if (!isDateBetween(now, startDay, endDay)) {
    console.log(
      `${now.toDateString()} is not between ${startDay.toDateString()} and ${endDay.toDateString()}`,
    );
    return false;
  }

  if (weekdays[now.getDay()] !== day) {
    console.log(`${weekdays[now.getDay()]} is not equal to ${day}`);
    return false;
  }

  return true;
}

// Function to check for upcoming events and send notifications
export async function checkAndNotifyEvents() {
  console.log("Checking for upcoming events...");
  let now;
  if (TEST_NOTIFICATIONS) {
    now = new Date(2025, 7, 5, 18, 45, 1);
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
      .lte("event_end", formattedEndTime);

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
        console.error("Error fetching user: ", errorOffering);
        return;
      }

      if (!offerings || offerings.length === 0) {
        console.error("Error fetching offeirng: ", errorOffering);
        return;
      }

      // Ensure we are in the correct semester and day of week
      if (!correctDay(offerings[0])) {
        continue;
      }

      // Get user info
      const { data: users, error } = await supabaseServersideClient
        .schema("auth")
        .from("users")
        .select("*")
        .eq("id", event.user_id)
        .limit(1);

      if (error) {
        console.error("Error fetching user: ", error);
        return;
      }

      if (!users || users.length === 0) {
        console.error("User not found");
        return;
      }

      const user = users[0];
      const userEmail = user?.email;
      const userName = user?.raw_user_meta_data?.username;

      // Prepare email content
      brevoSendSmtpEmail.to = [{ email: userEmail, name: userName }];
      brevoSendSmtpEmail.sender = {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME || "Course Matrix Notifications",
      };
      brevoSendSmtpEmail.subject = `Reminder: ${event.event_name} starting soon`;
      brevoSendSmtpEmail.htmlContent = `
        <h2>Event Reminder</h2>
        <p>Hello ${userName},</p>
        <p>Your event "${
          event.event_name
        }" is starting in approximately 15 minutes.</p>
        <p><strong>Start time:</strong> ${new Date(
          event.event_start,
        ).toLocaleString()}</p>
        <p><strong>Description:</strong> ${
          event.event_description || "No description provided"
        }</p>
        <p>Thank you for using our calendar service!</p>
      `;

      // Send email
      try {
        const data =
          await brevoApiInstance.sendTransacEmail(brevoSendSmtpEmail);
        console.log(
          `Email sent to ${userEmail} for event ${event.id}. Message ID: ${data.messageId}`,
        );
      } catch (emailError) {
        console.error("Error sending email with Brevo:", emailError);
      }
    }
  } catch (err) {
    console.error("Error in notification process:", err);
  }
}
