const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const connectDB = require('../config/db');

/**
 * Generate a random date between two dates
 */
const randomDate = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

/**
 * Generate an array of dates spread across the last 12 months
 */
const getDistributedDate = (index, totalItems) => {
  const now = new Date();
  // Bucket into 12 months (from month 11 ago to current month 0)
  const monthOffset = (index % 12);
  const targetYear = now.getFullYear();
  const targetMonth = now.getMonth() - monthOffset;

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  // If this month, limit to current time
  const upperLimit = endOfMonth > now ? now : endOfMonth;
  return randomDate(startOfMonth, upperLimit);
};

const doctorsSeedData = [
  {
    name: 'Dr. Mohammad Rahman',
    specialization: 'Cardiology',
    hospital: 'Square Hospital',
    phone: '+880 1711-234567',
    email: 'm.rahman@squarehospital.com'
  },
  {
    name: 'Dr. Nusrat Jahan',
    specialization: 'Neurology',
    hospital: 'United Hospital',
    phone: '+880 1712-345678',
    email: 'nusrat.jahan@unitedhospital.com'
  },
  {
    name: 'Dr. Tanvir Ahmed',
    specialization: 'Orthopedics',
    hospital: 'Apollo Hospital',
    phone: '+880 1713-456789',
    email: 'tanvir.ahmed@apollohospital.com'
  },
  {
    name: 'Dr. Farhana Chowdhury',
    specialization: 'Pediatrics',
    hospital: 'Dhaka Medical College',
    phone: '+880 1714-567890',
    email: 'farhana.c@dmc.edu.bd'
  },
  {
    name: 'Dr. Shahriar Kabir',
    specialization: 'Dermatology',
    hospital: 'Evercare Hospital',
    phone: '+880 1715-678901',
    email: 'shahriar.kabir@evercarebd.com'
  },
  {
    name: 'Dr. Sadia Afrin',
    specialization: 'Ophthalmology',
    hospital: 'Bangladesh Specialized Hospital',
    phone: '+880 1716-789012',
    email: 'sadia.afrin@bdspecialized.com'
  },
  {
    name: 'Dr. Mahbubur Rashid',
    specialization: 'Gastroenterology',
    hospital: 'Square Hospital',
    phone: '+880 1717-890123',
    email: 'mahbubur.r@squarehospital.com'
  },
  {
    name: 'Dr. Tasnim Fatima',
    specialization: 'Psychiatry',
    hospital: 'United Hospital',
    phone: '+880 1718-901234',
    email: 'tasnim.fatima@unitedhospital.com'
  },
  {
    name: 'Dr. Anisur Zaman',
    specialization: 'Oncology',
    hospital: 'National Institute of Cancer Research',
    phone: '+880 1719-012345',
    email: 'anisur.zaman@nicrh.gov.bd'
  },
  {
    name: 'Dr. Sabina Yasmin',
    specialization: 'Endocrinology',
    hospital: 'Apollo Hospital',
    phone: '+880 1720-123456',
    email: 'sabina.yasmin@apollohospital.com'
  },
  {
    name: 'Dr. Kazi Arif Hassan',
    specialization: 'Nephrology',
    hospital: 'National Institute of Kidney Diseases',
    phone: '+880 1721-234567',
    email: 'arif.hassan@nikdu.gov.bd'
  },
  {
    name: 'Dr. Shahrina Sultana',
    specialization: 'Pulmonology',
    hospital: 'Square Hospital',
    phone: '+880 1722-345678',
    email: 'shahrina.s@squarehospital.com'
  },
  {
    name: 'Dr. Tariqul Islam',
    specialization: 'Cardiology',
    hospital: 'United Hospital',
    phone: '+880 1723-456789',
    email: 'tariqul.islam@unitedhospital.com'
  },
  {
    name: 'Dr. Mehnaz Parveen',
    specialization: 'Pediatrics',
    hospital: 'Apollo Hospital',
    phone: '+880 1724-567890',
    email: 'mehnaz.p@apollohospital.com'
  },
  {
    name: 'Dr. Rafiqul Haque',
    specialization: 'Orthopedics',
    hospital: 'Dhaka Medical College',
    phone: '+880 1725-678901',
    email: 'rafiqul.haque@dmc.edu.bd'
  },
  {
    name: 'Dr. Farzana Akhter',
    specialization: 'Dermatology',
    hospital: 'Square Hospital',
    phone: '+880 1726-789012',
    email: 'farzana.a@squarehospital.com'
  },
  {
    name: 'Dr. Imran Hossain',
    specialization: 'Neurology',
    hospital: 'Evercare Hospital',
    phone: '+880 1727-890123',
    email: 'imran.hossain@evercarebd.com'
  },
  {
    name: 'Dr. Nilufar Yasmin',
    specialization: 'Gastroenterology',
    hospital: 'Bangladesh Specialized Hospital',
    phone: '+880 1728-901234',
    email: 'nilufar.y@bdspecialized.com'
  }
];

const patientConditionsBySpecialization = {
  Cardiology: [
    'Hypertension Stage 2',
    'Coronary Artery Disease',
    'Atrial Fibrillation',
    'Congestive Heart Failure',
    'Angina Pectoris'
  ],
  Neurology: [
    'Migraine with Aura',
    'Epilepsy',
    'Peripheral Neuropathy',
    'Ischemic Stroke Recovery',
    'Parkinsons Disease'
  ],
  Orthopedics: [
    'Osteoarthritis of Knee',
    'Lumbar Disc Herniation',
    'ACL Ligament Tear',
    'Frozen Shoulder',
    'Carpal Tunnel Syndrome'
  ],
  Pediatrics: [
    'Acute Bronchiolitis',
    'Asthma Flare-up',
    'Viral Gastroenteritis',
    'Growth Delay Evaluation',
    'Atopic Dermatitis in Child'
  ],
  Dermatology: [
    'Chronic Plaque Psoriasis',
    'Severe Cystic Acne',
    'Eczematous Dermatitis',
    'Alopecia Areata',
    'Vitiligo'
  ],
  Ophthalmology: [
    'Senile Cataract',
    'Primary Open-Angle Glaucoma',
    'Diabetic Retinopathy',
    'Dry Eye Syndrome',
    'Allergic Conjunctivitis'
  ],
  Gastroenterology: [
    'Gastroesophageal Reflux Disease (GERD)',
    'Ulcerative Colitis',
    'Non-Alcoholic Fatty Liver Disease',
    'Peptic Ulcer Disease',
    'Irritable Bowel Syndrome'
  ],
  Psychiatry: [
    'Major Depressive Disorder',
    'Generalized Anxiety Disorder',
    'Panic Disorder',
    'Bipolar I Disorder',
    'Chronic Insomnia'
  ],
  Oncology: [
    'Colorectal Adenocarcinoma Stage II',
    'Hodgkins Lymphoma',
    'Breast Carcinoma Post-Op',
    'Multiple Myeloma',
    'Lung Carcinoma Stage III'
  ],
  Endocrinology: [
    'Type 2 Diabetes Mellitus',
    'Hashimotos Hypothyroidism',
    'Hyperthyroidism',
    'Metabolic Syndrome',
    'Gestational Diabetes'
  ],
  Nephrology: [
    'Chronic Kidney Disease Stage 3',
    'Nephrotic Syndrome',
    'Recurrent Nephrolithiasis',
    'Diabetic Nephropathy',
    'Polycystic Kidney Disease'
  ],
  Pulmonology: [
    'Chronic Obstructive Pulmonary Disease (COPD)',
    'Moderate Persistent Asthma',
    'Community-Acquired Pneumonia',
    'Obstructive Sleep Apnea',
    'Bronchiectasis'
  ]
};

const patientNames = [
  { name: 'Abdur Rahim', gender: 'Male', age: 52 },
  { name: 'Fatema Begum', gender: 'Female', age: 46 },
  { name: 'Kamal Hossain', gender: 'Male', age: 38 },
  { name: 'Nasreen Akhtar', gender: 'Female', age: 29 },
  { name: 'Zahirul Islam', gender: 'Male', age: 64 },
  { name: 'Rokeya Sultana', gender: 'Female', age: 58 },
  { name: 'Shahidul Alam', gender: 'Male', age: 41 },
  { name: 'Shirin Sharmin', gender: 'Female', age: 34 },
  { name: 'Mahmudul Hasan', gender: 'Male', age: 26 },
  { name: 'Salma Khatun', gender: 'Female', age: 67 },
  { name: 'Enamul Haque', gender: 'Male', age: 49 },
  { name: 'Ruma Chowdhury', gender: 'Female', age: 31 },
  { name: 'Ashraf Ali', gender: 'Male', age: 72 },
  { name: 'Shamima Nasrin', gender: 'Female', age: 39 },
  { name: 'Delwar Hossain', gender: 'Male', age: 55 },
  { name: 'Ayesha Siddiqua', gender: 'Female', age: 22 },
  { name: 'Mizanur Rahman', gender: 'Male', age: 44 },
  { name: 'Kohinoor Akhter', gender: 'Female', age: 61 },
  { name: 'Nazmul Huda', gender: 'Male', age: 35 },
  { name: 'Taslima Nasrin', gender: 'Female', age: 48 },
  { name: 'Golam Sarwar', gender: 'Male', age: 59 },
  { name: 'Laila Arjumand', gender: 'Female', age: 43 },
  { name: 'Jashim Uddin', gender: 'Male', age: 50 },
  { name: 'Sabera Banu', gender: 'Female', age: 68 },
  { name: 'Habibur Rahman', gender: 'Male', age: 33 },
  { name: 'Nazma Begum', gender: 'Female', age: 54 },
  { name: 'Saiful Islam', gender: 'Male', age: 28 },
  { name: 'Farida Yasmin', gender: 'Female', age: 47 },
  { name: 'Monirul Islam', gender: 'Male', age: 36 },
  { name: 'Rehana Parveen', gender: 'Female', age: 51 },
  { name: 'Anwar Hossain', gender: 'Male', age: 63 },
  { name: 'Hasina Momtaz', gender: 'Female', age: 40 },
  { name: 'Abdul Mannan', gender: 'Male', age: 70 },
  { name: 'Tahmina Akhter', gender: 'Female', age: 32 },
  { name: 'Sirajul Islam', gender: 'Male', age: 57 },
  { name: 'Nurjahan Begum', gender: 'Female', age: 65 },
  { name: 'Mustafizur Rahman', gender: 'Male', age: 27 },
  { name: 'Sultana Razia', gender: 'Female', age: 45 },
  { name: 'Kabir Ahmed', gender: 'Male', age: 53 },
  { name: 'Afroza Khanom', gender: 'Female', age: 37 },
  { name: 'Babul Chandra', gender: 'Male', age: 42 },
  { name: 'Rina Karmakar', gender: 'Female', age: 30 },
  { name: 'Subrata Roy', gender: 'Male', age: 46 },
  { name: 'Dipika Rani', gender: 'Female', age: 25 },
  { name: 'Nikhil Das', gender: 'Male', age: 60 },
  { name: 'Shila Sen', gender: 'Female', age: 53 },
  { name: 'Samir Ghosh', gender: 'Male', age: 34 },
  { name: 'Mita Das', gender: 'Female', age: 41 },
  { name: 'Alex Roy', gender: 'Other', age: 29 },
  { name: 'Pat Mendez', gender: 'Other', age: 35 },
  { name: 'Zubaida Khan', gender: 'Female', age: 62 },
  { name: 'Harun-or-Rashid', gender: 'Male', age: 66 },
  { name: 'Sharmin Jahan', gender: 'Female', age: 24 },
  { name: 'Fazlul Karim', gender: 'Male', age: 74 },
  { name: 'Tania Ahmed', gender: 'Female', age: 31 }
];

const seedDatabase = async () => {
  try {
    console.log('--- Starting Database Seeding ---');
    await connectDB();

    console.log('Clearing existing collections (Users, Doctors, Patients)...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({})
    ]);
    console.log('Collections cleared successfully.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@doctor-tracker.com',
      password: 'password123'
    });
    console.log(`Created admin user: ${adminUser.email}`);

    // 2. Create Doctors spread over the last 12 months
    const doctorDocs = doctorsSeedData.map((docData, index) => ({
      ...docData,
      createdAt: getDistributedDate(index, doctorsSeedData.length)
    }));

    const insertedDoctors = await Doctor.insertMany(doctorDocs);
    console.log(`Successfully created ${insertedDoctors.length} doctors.`);

    // 3. Create Patients distributed across doctors
    const patientDocs = patientNames.map((p, index) => {
      // Pick doctor in round-robin fashion
      const doctor = insertedDoctors[index % insertedDoctors.length];
      const conditions =
        patientConditionsBySpecialization[doctor.specialization] || ['General Consultation'];
      const condition = conditions[index % conditions.length];
      const phoneDigits = String(1000000 + index).padStart(7, '0');
      const sanitizedName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '.');

      // Date of patient registration spread over 12 months, usually after or around doctor createdAt
      const createdAt = getDistributedDate(index, patientNames.length);

      return {
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: `+880 18${phoneDigits.slice(0, 2)}-${phoneDigits.slice(2)}`,
        email: `${sanitizedName}@gmail.com`,
        condition,
        doctorId: doctor._id,
        createdAt
      };
    });

    const insertedPatients = await Patient.insertMany(patientDocs);
    console.log(`Successfully created ${insertedPatients.length} patients.`);

    console.log('\n=============================================');
    console.log('      DATABASE SEEDING COMPLETED             ');
    console.log('=============================================');
    console.log(`Admin User:`);
    console.log(`  Email:    admin@doctor-tracker.com`);
    console.log(`  Password: password123`);
    console.log(`Total Doctors:  ${insertedDoctors.length}`);
    console.log(`Total Patients: ${insertedPatients.length}`);
    console.log('=============================================\n');

    await mongoose.connection.close();
    console.log('MongoDB connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
