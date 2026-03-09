/*
  Seed script for initial data (grades, units, lessons, exercises).
  Run: node scripts/seed.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const connectDb = require('../config/db');
const Grade = require('../models/Grade');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');

const seed = async () => {
  await connectDb();

  // Grades
  const gradesData = [
    { number: 4, name: '4th Grade' },
    { number: 5, name: '5th Grade' },
    { number: 6, name: '6th Grade' },
  ];
  await Grade.deleteMany({});
  await Grade.insertMany(gradesData);
  console.log('Inserted grades');

  // Units (only basic titles)
  const unitsData = [
    { grade: 4, number: 1, title: 'Entertaining Myself' },
    { grade: 4, number: 2, title: 'Keeping Fit' },
    { grade: 4, number: 3, title: 'Having Fun in the Seasons' },
    { grade: 4, number: 4, title: 'Caring' },
    { grade: 4, number: 5, title: 'Celebrations' },
    { grade: 4, number: 6, title: 'Going Shopping' },
    { grade: 5, number: 1, title: 'Entertaining Myself' },
    { grade: 5, number: 2, title: 'Keeping Fit' },
    { grade: 5, number: 3, title: 'Having Fun in the Seasons' },
    { grade: 5, number: 4, title: 'Caring' },
    { grade: 5, number: 5, title: 'Celebrations' },
    { grade: 5, number: 6, title: 'Going Shopping' },
    { grade: 6, number: 1, title: 'Entertaining Myself' },
    { grade: 6, number: 2, title: 'Keeping Fit' },
    { grade: 6, number: 3, title: 'Having Fun in the Seasons' },
    { grade: 6, number: 4, title: 'Caring' },
    { grade: 6, number: 5, title: 'Celebrations' },
    { grade: 6, number: 6, title: 'Going Shopping' },
  ];

  await Unit.deleteMany({});
  await Unit.insertMany(unitsData);
  console.log('Inserted units');

  // Lessons for Unit 1 (Entertaining Myself) — full example unit a student can complete.
  // Also keep Unit 5 (Celebrations) lessons for demo purposes.
  const lessonsData = [
    // Grade 4, Unit 1 (complete example unit)
    {
      grade: 4,
      unitNumber: 1,
      number: 1,
      title: 'My Favorite Game',
    },
    {
      grade: 4,
      unitNumber: 1,
      number: 2,
      title: 'A Day at the Park',
    },
    {
      grade: 4,
      unitNumber: 1,
      number: 3,
      title: 'Playing with Friends',
    },
    {
      grade: 4,
      unitNumber: 1,
      number: 4,
      title: 'My Hobby',
    },
    {
      grade: 4,
      unitNumber: 1,
      number: 5,
      title: 'Weekend Fun',
    },

    // Lessons for Unit V (Celebrations) - example for all grades
    {
      grade: 4,
      unitNumber: 5,
      number: 1,
      title: "Children's Day",
    },
    {
      grade: 4,
      unitNumber: 5,
      number: 2,
      title: "Mother's Day",
    },
    {
      grade: 4,
      unitNumber: 5,
      number: 3,
      title: 'Happy New Year',
    },
    {
      grade: 4,
      unitNumber: 5,
      number: 4,
      title: "Teacher's Day",
    },
    {
      grade: 4,
      unitNumber: 5,
      number: 5,
      title: 'End of School Year Party',
    },

    // Duplicate for grade 5 and 6 for demo
    {
      grade: 5,
      unitNumber: 5,
      number: 1,
      title: "Children's Day",
    },
    {
      grade: 5,
      unitNumber: 5,
      number: 2,
      title: "Mother's Day",
    },
    {
      grade: 5,
      unitNumber: 5,
      number: 3,
      title: 'Happy New Year',
    },
    {
      grade: 5,
      unitNumber: 5,
      number: 4,
      title: "Teacher's Day",
    },
    {
      grade: 5,
      unitNumber: 5,
      number: 5,
      title: 'End of School Year Party',
    },
    {
      grade: 6,
      unitNumber: 5,
      number: 1,
      title: "Children's Day",
    },
    {
      grade: 6,
      unitNumber: 5,
      number: 2,
      title: "Mother's Day",
    },
    {
      grade: 6,
      unitNumber: 5,
      number: 3,
      title: 'Happy New Year',
    },
    {
      grade: 6,
      unitNumber: 5,
      number: 4,
      title: "Teacher's Day",
    },
    {
      grade: 6,
      unitNumber: 5,
      number: 5,
      title: 'End of School Year Party',
    },
  ];

  await Lesson.deleteMany({});
  const createdLessons = await Lesson.insertMany(lessonsData);
  console.log(`Inserted ${createdLessons.length} lessons`);

  // Add sample exercises for the example units (grade 4 unit 1 and grade 5 unit 5).
  const missions = [];
  const targetLessons = createdLessons.filter(
    (l) => (l.grade === 4 && l.unitNumber === 1) || (l.grade === 5 && l.unitNumber === 5)
  );

  targetLessons.forEach((lesson) => {
    missions.push({
      lesson: lesson._id,
      type: 'sentence',
      prompt: `${lesson.title} – répète : "${lesson.title} is fun!"`,
      expected: `${lesson.title} is fun!`,
    });
    missions.push({
      lesson: lesson._id,
      type: 'word',
      prompt: `Dites le mot clé : "${lesson.title.split(' ')[0].toLowerCase()}"`,
      expected: lesson.title.split(' ')[0].toLowerCase(),
    });
  });

  await Exercise.deleteMany({});
  await Exercise.insertMany(missions);
  console.log(`Inserted ${missions.length} exercises`);

  // Update lessons to reference their exercises.
  const allLessons = await Lesson.find({});
  for (const lesson of allLessons) {
    const exercises = await Exercise.find({ lesson: lesson._id });
    lesson.exercises = exercises.map((e) => e._id);
    await lesson.save();
  }

  console.log('Lesson exercises linked');
  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed', err);
  process.exit(1);
});
