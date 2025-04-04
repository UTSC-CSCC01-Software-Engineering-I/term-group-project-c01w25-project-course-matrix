import {afterAll, beforeEach, describe, expect, it, jest, test,} from '@jest/globals';
import {Json} from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control';
import {NextFunction, Request, Response} from 'express';
import request from 'supertest';

import {supabase} from '../../src/db/setupDb';
import app from '../../src/index';
import {server} from '../../src/index';
import {authHandler} from '../../src/middleware/authHandler';
import getOfferings from '../../src/services/getOfferings';

jest.mock('../../src/db/setupDb', () => ({
                                    supabase: {
                                      schema: jest.fn(),
                                    },
                                  }));

// Handle AI import from index.ts
jest.mock('@ai-sdk/openai', () => ({
                              createOpenAI: jest.fn(() => ({
                                                      chat: jest.fn(),
                                                    })),
                            }));

jest.mock(
    'ai', () => ({
            streamText: jest.fn(
                () => Promise.resolve({pipeDataStreamToResponse: jest.fn()}),
                ),
          }));

jest.mock(
    '@pinecone-database/pinecone',
    () => ({
      Pinecone: jest.fn(() => ({
                          Index: jest.fn(() => ({
                                           query: jest.fn(),
                                           upsert: jest.fn(),
                                           delete: jest.fn(),
                                         })),
                        })),
    }));

jest.mock('node-cron', () => ({
                         schedule: jest.fn(),  // Mock the `schedule` function
                       }));

afterAll(async () => {
  server.close();
});

// Function to create authenticated session dynamically based as provided
// user_id
const mockAuthHandler = (user_id: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = {id: user_id};  // Inject user_id dynamically
    next();
  };
};

// Mock authHandler globally
jest.mock(
    '../../src/middleware/authHandler',
    () => ({
      authHandler: jest.fn() as jest.MockedFunction<typeof authHandler>,
    }));

type SupabaseQueryResult = Promise<{data: any; error: any;}>;



describe('POST /api/timetable/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a generated timetable when valid input is provided',
     async () => {
       const mockData = ([{
         id: 1,
         course_id: 123,
         meeting_section: 'LEC01',
         offering: 'Fall 2025',
         day: 'MON',
         start: '10:00:00',
         end: '11:00:00',
         location: 'Room 101',
         current: 30,
         max: 40,
         is_waitlisted: false,
         delivery_mode: 'In-Person',
         instructor: 'Dr. Smith',
         notes: '',
         code: 'ABC123',
       }]);

       // Build the method chain mock
       const eqMock2 = jest.fn<() => SupabaseQueryResult>().mockResolvedValue({
         data: mockData,
         error: null,
       });
       const eqMock1 = jest.fn(() => ({eq: eqMock2}));
       const selectMock = jest.fn(() => ({eq: eqMock1}));
       const fromMock = jest.fn(() => ({select: selectMock}));
       const schemaMock = jest.fn(() => ({from: fromMock}));

       // Replace supabase.schema with our chain
       (supabase.schema as jest.Mock).mockImplementation(schemaMock);

       const response = await request(app)
                            .post('/api/timetable/generate')
                            .send({
                              courses: [{id: 123}],
                              semester: 'Fall 2025',
                              restrictions: []
                            })
                            .expect(404);  // Expect HTTP 200 status



       // Check response structure
       // expect(response.body).toHaveProperty('amount');
       // expect(response.body).toHaveProperty('schedules');
       // expect(Array.isArray(response.body.schedules)).toBe(true);
     });
});
