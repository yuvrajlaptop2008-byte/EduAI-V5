// =============================================================================
// MongoDB Initialization Script — Marks App / EduAI V5
// Handles: Question Bank Documents, CBT Test Attempts, LaTeX Content, Solutions
// =============================================================================

const dbName = process.env.MONGO_INITDB_DATABASE || 'marksapp_questions';
const db = db.getSiblingDB(dbName);

print(`--- Initializing MongoDB Collections for ${dbName} ---`);

// 1. Question Bank Collection with Schema Validator
db.createCollection('custom_questions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['subject', 'chapter', 'difficulty', 'text', 'options', 'correctAnswer', 'exam'],
      properties: {
        id: { bsonType: ['int', 'long', 'string'] },
        subject: { enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
        chapter: { bsonType: 'string' },
        topic: { bsonType: 'string' },
        difficulty: { enum: ['Easy', 'Medium', 'Hard'] },
        text: { bsonType: 'string', description: 'LaTeX/Markdown content' },
        options: {
          bsonType: 'array',
          minItems: 4,
          maxItems: 4,
          items: { bsonType: 'string' }
        },
        correctAnswer: { bsonType: 'int', minimum: 0, maximum: 3 },
        solution: { bsonType: 'string' },
        exam: { enum: ['JEE Main', 'JEE Advanced', 'NEET', 'BITSAT'] },
        year: { bsonType: ['int', 'null'] },
        language: { enum: ['en', 'hi', 'both'] },
        tags: { bsonType: 'array', items: { bsonType: 'string' } },
        status: { enum: ['active', 'pending', 'rejected'] },
        uploadedBy: { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes for Question Filtering & Full-Text Search
db.custom_questions.createIndex({ subject: 1, chapter: 1, difficulty: 1 });
db.custom_questions.createIndex({ exam: 1, year: -1 });
db.custom_questions.createIndex({ status: 1 });
db.custom_questions.createIndex({ text: 'text', topic: 'text', chapter: 'text' });

// 2. Group Tests Collection
db.createCollection('group_tests');
db.group_tests.createIndex({ instituteId: 1, isPublished: 1 });
db.group_tests.createIndex({ assignedGroupIds: 1 });
db.group_tests.createIndex({ scheduledAt: 1 });

// 3. Test Attempts Collection (High Volume)
db.createCollection('group_test_attempts');
db.group_test_attempts.createIndex({ testId: 1, score: -1, timeTakenSec: 1 });
db.group_test_attempts.createIndex({ studentId: 1, submittedAt: -1 });

// 4. Mistake Notebook Collection
db.createCollection('mistake_notebook');
db.mistake_notebook.createIndex({ userId: 1, nextReviewDate: 1 });
db.mistake_notebook.createIndex({ userId: 1, diagnosticReason: 1 });

// 5. Seed Initial Sample Questions
db.custom_questions.insertMany([
  {
    id: 101,
    subject: 'Physics',
    chapter: 'Electrostatics',
    topic: 'Electric Dipole',
    difficulty: 'Medium',
    text: 'An electric dipole of moment $\\vec{p}$ is placed in a uniform electric field $\\vec{E}$. The torque acting on the dipole is:',
    options: [
      '$\\vec{p} \\times \\vec{E}$',
      '$\\vec{p} \\cdot \\vec{E}$',
      '$-\\vec{p} \\times \\vec{E}$',
      'zero'
    ],
    correctAnswer: 0,
    solution: 'Torque on an electric dipole in uniform field is given by $\\vec{\\tau} = \\vec{p} \\times \\vec{E}$.',
    exam: 'JEE Main',
    year: 2024,
    language: 'en',
    tags: ['PYQ', 'NTA', 'Shift-1'],
    status: 'active',
    createdAt: new Date()
  },
  {
    id: 102,
    subject: 'Mathematics',
    chapter: 'Calculus',
    topic: 'Definite Integrals',
    difficulty: 'Medium',
    text: 'Evaluate: $$\\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$$',
    options: ['$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$', '$\\pi$', '0'],
    correctAnswer: 0,
    solution: "Using King's property: $2I = \\pi/2 \\implies I = \\pi/4$.",
    exam: 'JEE Main',
    year: 2023,
    language: 'en',
    tags: ['PYQ', 'Calculus'],
    status: 'active',
    createdAt: new Date()
  }
]);

print('--- MongoDB Initialization Completed Successfully ---');
