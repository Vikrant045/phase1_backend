import prisma from '../src/utils/prisma.js';

/**
 * Database seeder: wipes the tasks table, then inserts realistic demo data.
 * Run with:  pnpm db:seed
 */

const tasks = [
  { title: 'Complete client onboarding flow', description: 'Walk the new client through setup and collect all sign-off documents.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-10-18T17:00:00.000Z' },
  { title: 'Prepare Q4 roadmap presentation', description: 'Draft slides for the Q4 roadmap review with leadership.', status: 'PENDING', priority: 'HIGH', dueDate: '2026-10-20T09:00:00.000Z' },
  { title: 'Fix login flow regression on staging', description: 'Investigate the auth redirect loop reported by QA.', status: 'COMPLETED', priority: 'HIGH', dueDate: '2026-10-10T12:00:00.000Z' },
  { title: 'Write unit tests for auth service', description: 'Target 80% coverage for the auth module.', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-10-22T18:00:00.000Z' },
  { title: 'Update API documentation for /tasks', description: 'Document request body, validation rules, and error codes.', status: 'PENDING', priority: 'MEDIUM', dueDate: '2026-10-25T10:00:00.000Z' },
  { title: 'Review pull request #142', description: 'Server-side pagination implementation review.', status: 'COMPLETED', priority: 'LOW', dueDate: '2026-10-05T15:00:00.000Z' },
  { title: 'Plan sprint 14 backlog', description: 'Groom backlog and estimate tickets for the next two weeks.', status: 'PENDING', priority: 'MEDIUM', dueDate: '2026-10-19T11:00:00.000Z' },
  { title: 'Migrate legacy data to new schema', description: 'Move 10k rows in batches and verify counts.', status: 'IN_PROGRESS', priority: 'HIGH' },
  { title: 'Set up CI pipeline for main branch', description: 'Add lint, typecheck, and test steps to the pipeline config.', status: 'COMPLETED', priority: 'MEDIUM', dueDate: '2026-10-02T09:00:00.000Z' },
  { title: 'Interview backend candidate round 3', description: 'Focus on database modeling and error handling questions.', status: 'PENDING', priority: 'HIGH', dueDate: '2026-10-28T14:00:00.000Z' },
  { title: 'Clean up unused dependencies', description: 'Audit package.json and remove anything unused.', status: 'PENDING', priority: 'LOW' },
  { title: 'Design task filter UI mockups', description: 'Sketch filter and pagination states for the frontend team.', status: 'COMPLETED', priority: 'LOW', dueDate: '2026-09-28T16:00:00.000Z' },
  { title: 'Onboard QA tooling to staging', description: 'Connect the QA test runner to the staging environment.', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-11-08T17:00:00.000Z' },
  { title: 'Draft phase 2 architecture proposal', description: 'Outline caching and rate limiting ideas for phase 2.', status: 'PENDING', priority: 'LOW', dueDate: '2026-12-01T09:00:00.000Z' },
  { title: 'Resolve security audit findings', description: 'Address the two high-severity items from last month audit.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-10-16T17:00:00.000Z' },
];

const seed = async (): Promise<void> => {
  console.log('Seeding database...');
  await prisma.task.deleteMany(); // idempotent: safe to run again
  await prisma.task.createMany({ data: tasks });
  const total = await prisma.task.count();
  console.log(`Done - ${total} tasks seeded.`);
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });