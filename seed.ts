import db from './server/db.ts';
import bcrypt from 'bcryptjs';

const email = 'admin@school.com';
const password = 'adminpassword';

const hashedPassword = bcrypt.hashSync(password, 10);

try {
  // Create Admin User
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!existing) {
    db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hashedPassword, 'admin');
    console.log("Admin user created successfully.");
  }

  const now = new Date().toISOString();

  // Add Sample Notices
  const noticesCount = db.prepare("SELECT COUNT(*) as count FROM notices").get() as { count: number };
  if (noticesCount.count === 0) {
    const sampleNotices = [
      { title: 'Admission Open for 2026-27', content: 'Admissions are now open for classes 9th to 12th. Visit the school office for more details.', isImportant: 1 },
      { title: 'Annual Sports Day', content: 'The Annual Sports Day will be held on March 25th. All students are encouraged to participate.', isImportant: 0 },
      { title: 'Holiday Notice', content: 'The school will remain closed on Friday for Holi celebrations.', isImportant: 0 }
    ];
    const insertNotice = db.prepare("INSERT INTO notices (title, content, isImportant, createdAt) VALUES (?, ?, ?, ?)");
    sampleNotices.forEach(n => insertNotice.run(n.title, n.content, n.isImportant, now));
    console.log("Sample notices added.");
  }

  // Add Sample Gallery Items
  const galleryCount = db.prepare("SELECT COUNT(*) as count FROM gallery").get() as { count: number };
  if (galleryCount.count === 0) {
    const sampleGallery = [
      { imageUrl: 'https://picsum.photos/seed/school1/800/600', caption: 'Main School Building', category: 'Campus' },
      { imageUrl: 'https://picsum.photos/seed/school2/800/600', caption: 'Science Exhibition 2025', category: 'Events' },
      { imageUrl: 'https://picsum.photos/seed/school3/800/600', caption: 'Annual Sports Meet', category: 'Sports' },
      { imageUrl: 'https://picsum.photos/seed/school4/800/600', caption: 'Cultural Program', category: 'Celebrations' }
    ];
    const insertGallery = db.prepare("INSERT INTO gallery (imageUrl, caption, category, createdAt) VALUES (?, ?, ?, ?)");
    sampleGallery.forEach(g => insertGallery.run(g.imageUrl, g.caption, g.category, now));
    console.log("Sample gallery items added.");
  }

  // Add Sample About Sections
  const aboutCount = db.prepare("SELECT COUNT(*) as count FROM about_sections").get() as { count: number };
  if (aboutCount.count === 0) {
    const sampleAbout = [
      { title: 'Our Mission', content: 'To provide quality education and nurture young minds for a better future.', iconName: 'Target' },
      { title: 'Our Vision', content: 'To be a leading institution known for academic excellence and holistic development.', iconName: 'Eye' },
      { title: 'Our Values', content: 'Integrity, Respect, Excellence, and Community Service.', iconName: 'Heart' }
    ];
    const insertAbout = db.prepare("INSERT INTO about_sections (title, content, iconName, createdAt) VALUES (?, ?, ?, ?)");
    sampleAbout.forEach(a => insertAbout.run(a.title, a.content, a.iconName, now));
    console.log("Sample about sections added.");
  }

  // Add Sample Infrastructure
  const infraCount = db.prepare("SELECT COUNT(*) as count FROM infrastructure").get() as { count: number };
  if (infraCount.count === 0) {
    const sampleInfra = [
      { title: 'Modern Classrooms', description: 'Spacious and well-ventilated classrooms equipped with smart boards.' },
      { title: 'Science Labs', description: 'Fully equipped Physics, Chemistry, and Biology laboratories.' },
      { title: 'Computer Lab', description: 'High-speed internet and latest computers for digital learning.' },
      { title: 'Library', description: 'A vast collection of books, journals, and digital resources.' }
    ];
    const insertInfra = db.prepare("INSERT INTO infrastructure (title, description, createdAt) VALUES (?, ?, ?)");
    sampleInfra.forEach(i => insertInfra.run(i.title, i.description, now));
    console.log("Sample infrastructure items added.");
  }

  // Add Sample Academic Streams
  const streamsCount = db.prepare("SELECT COUNT(*) as count FROM academic_streams").get() as { count: number };
  if (streamsCount.count === 0) {
    const sampleStreams = [
      { title: 'Science', description: 'Focus on Physics, Chemistry, Biology, and Mathematics.', subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English']) },
      { title: 'Commerce', description: 'Focus on Accountancy, Business Studies, and Economics.', subjects: JSON.stringify(['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English']) },
      { title: 'Humanities', description: 'Focus on History, Geography, and Political Science.', subjects: JSON.stringify(['History', 'Geography', 'Political Science', 'Sociology', 'English']) }
    ];
    const insertStream = db.prepare("INSERT INTO academic_streams (title, description, subjects, createdAt) VALUES (?, ?, ?, ?)");
    sampleStreams.forEach(s => insertStream.run(s.title, s.description, s.subjects, now));
    console.log("Sample academic streams added.");
  }

  // Add Sample Academic Levels
  const levelsCount = db.prepare("SELECT COUNT(*) as count FROM academic_levels").get() as { count: number };
  if (levelsCount.count === 0) {
    const sampleLevels = [
      { title: 'Primary School', classes: 'Class 1st to 5th', focus: 'Foundational learning and basic skills.' },
      { title: 'Middle School', classes: 'Class 6th to 8th', focus: 'Broadening horizons and subject exploration.' },
      { title: 'High School', classes: 'Class 9th & 10th', focus: 'Preparation for board examinations.' },
      { title: 'Senior Secondary', classes: 'Class 11th & 12th', focus: 'Specialized streams and career guidance.' }
    ];
    const insertLevel = db.prepare("INSERT INTO academic_levels (title, classes, focus, createdAt) VALUES (?, ?, ?, ?)");
    sampleLevels.forEach(l => insertLevel.run(l.title, l.classes, l.focus, now));
    console.log("Sample academic levels added.");
  }

  // Add Sample Admission Steps
  const stepsCount = db.prepare("SELECT COUNT(*) as count FROM admission_steps").get() as { count: number };
  if (stepsCount.count === 0) {
    const sampleSteps = [
      { title: 'Registration', description: 'Fill out the online registration form or visit the school office.', orderIndex: 1 },
      { title: 'Entrance Test', description: 'Students appear for a basic assessment test.', orderIndex: 2 },
      { title: 'Interview', description: 'Interaction with the Principal and faculty.', orderIndex: 3 },
      { title: 'Fee Payment', description: 'Submit the required documents and pay the admission fee.', orderIndex: 4 }
    ];
    const insertStep = db.prepare("INSERT INTO admission_steps (title, description, orderIndex, createdAt) VALUES (?, ?, ?, ?)");
    sampleSteps.forEach(s => insertStep.run(s.title, s.description, s.orderIndex, now));
    console.log("Sample admission steps added.");
  }

  // Add Sample Admission Documents
  const docsCount = db.prepare("SELECT COUNT(*) as count FROM admission_documents").get() as { count: number };
  if (docsCount.count === 0) {
    const sampleDocs = [
      { name: 'Birth Certificate' },
      { name: 'Transfer Certificate' },
      { name: 'Previous Year Report Card' },
      { name: 'Passport Size Photographs' },
      { name: 'Aadhar Card Copy' }
    ];
    const insertDoc = db.prepare("INSERT INTO admission_documents (name, createdAt) VALUES (?, ?)");
    sampleDocs.forEach(d => insertDoc.run(d.name, now));
    console.log("Sample admission documents added.");
  }

  // Add Sample Home Highlights
  const highlightsCount = db.prepare("SELECT COUNT(*) as count FROM home_highlights").get() as { count: number };
  if (highlightsCount.count === 0) {
    const sampleHighlights = [
      { title: '1000+', description: 'Happy Students', iconName: 'Users' },
      { title: '50+', description: 'Expert Faculty', iconName: 'BookOpen' },
      { title: '100%', description: 'Board Results', iconName: 'Award' },
      { title: '20+', description: 'Sports Activities', iconName: 'Trophy' }
    ];
    const insertHighlight = db.prepare("INSERT INTO home_highlights (title, description, iconName, createdAt) VALUES (?, ?, ?, ?)");
    sampleHighlights.forEach(h => insertHighlight.run(h.title, h.description, h.iconName, now));
    console.log("Sample home highlights added.");
  }

  // Add Sample Faculty
  const facultyCount = db.prepare("SELECT COUNT(*) as count FROM faculty").get() as { count: number };
  if (facultyCount.count === 0) {
    const sampleFaculty = [
      { name: 'Dr. Rajesh Kumar', subject: 'Physics', qualification: 'Ph.D. in Physics', photo: 'https://i.pravatar.cc/150?u=rajesh' },
      { name: 'Mrs. Sunita Devi', subject: 'Mathematics', qualification: 'M.Sc., B.Ed.', photo: 'https://i.pravatar.cc/150?u=sunita' },
      { name: 'Mr. Amit Singh', subject: 'Chemistry', qualification: 'M.Sc., M.Phil.', photo: 'https://i.pravatar.cc/150?u=amit' },
      { name: 'Ms. Priya Sharma', subject: 'English', qualification: 'M.A., B.Ed.', photo: 'https://i.pravatar.cc/150?u=priya' }
    ];
    const insertFaculty = db.prepare("INSERT INTO faculty (name, subject, qualification, photo, createdAt) VALUES (?, ?, ?, ?, ?)");
    sampleFaculty.forEach(f => insertFaculty.run(f.name, f.subject, f.qualification, f.photo, now));
    console.log("Sample faculty added.");
  }

  console.log("Database seeding completed.");
  console.log("Admin Email: " + email);
  console.log("Admin Password: " + password);
} catch (err) {
  console.error("Error seeding database:", err);
}
