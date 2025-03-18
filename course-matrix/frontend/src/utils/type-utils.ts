// Declare any useful typescript types here

export type MakeOptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;

export type Event = {
  id: number;
  event_name: string;
  event_date: string;
  event_start: string;
  event_end: string;
  offering_id: number;
};

export type TimetableEvents = {
  courseEvents: Event[];
  userEvents: Event[];
};

export type Timetable = {
  id: number;
  created_at: Date;
  updated_at: Date;
  semester: string;
  timetable_title: string;
  user_id: string;
};

export type Restriction = {
  id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  type: string;
  days: string;
  start_time: string;
  end_time: string;
  disabled: boolean;
  num_days: number;
  calendar_id: number;
};
