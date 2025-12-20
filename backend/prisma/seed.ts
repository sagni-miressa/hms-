/**
 * Database Seed Script
 * Create initial admin user and sample data
 */

import { PrismaClient, Role, ClearanceLevel, JobStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // ============================================================================
  // CREATE ADMIN USER
  // ============================================================================
  
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hiring-system.com' },
    update: {},
    create: {
      email: 'admin@hiring-system.com',
      username: 'admin',
      passwordHash: adminPassword,
      roles: [Role.SYSTEM_ADMIN],
      clearanceLevel: ClearanceLevel.RESTRICTED,
      isActive: true,
      isVerified: true,
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
  
  // ============================================================================
  // CREATE HR MANAGER
  // ============================================================================
  
  const hrPassword = await bcrypt.hash('HRManager@123', 12);
  
  const hrManager = await prisma.user.upsert({
    where: { email: 'hr@hiring-system.com' },
    update: {},
    create: {
      email: 'hr@hiring-system.com',
      username: 'hrmanager',
      passwordHash: hrPassword,
      roles: [Role.HR_MANAGER],
      clearanceLevel: ClearanceLevel.CONFIDENTIAL,
      department: 'Human Resources',
      isActive: true,
      isVerified: true,
    },
  });
  
  console.log('✅ HR Manager created:', hrManager.email);
  
  // ============================================================================
  // CREATE RECRUITER
  // ============================================================================
  
  const recruiterPassword = await bcrypt.hash('Recruiter@123', 12);
  
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@hiring-system.com' },
    update: {},
    create: {
      email: 'recruiter@hiring-system.com',
      username: 'recruiter',
      passwordHash: recruiterPassword,
      roles: [Role.RECRUITER],
      clearanceLevel: ClearanceLevel.INTERNAL,
      department: 'Engineering',
      isActive: true,
      isVerified: true,
    },
  });
  
  console.log('✅ Recruiter created:', recruiter.email);
  
  // ============================================================================
  // CREATE INTERVIEWER
  // ============================================================================
  
  const interviewerPassword = await bcrypt.hash('Interviewer@123', 12);
  
  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@hiring-system.com' },
    update: {},
    create: {
      email: 'interviewer@hiring-system.com',
      username: 'interviewer',
      passwordHash: interviewerPassword,
      roles: [Role.INTERVIEWER],
      clearanceLevel: ClearanceLevel.INTERNAL,
      department: 'Engineering',
      isActive: true,
      isVerified: true,
    },
  });
  
  console.log('✅ Interviewer created:', interviewer.email);
  
  // ============================================================================
  // CREATE SAMPLE APPLICANT
  // ============================================================================
  
  const applicantPassword = await bcrypt.hash('Applicant@123', 12);
  
  const applicant = await prisma.user.upsert({
    where: { email: 'applicant@example.com' },
    update: {},
    create: {
      email: 'applicant@example.com',
      username: 'johndoe',
      passwordHash: applicantPassword,
      roles: [Role.APPLICANT],
      clearanceLevel: ClearanceLevel.PUBLIC,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          fullName: 'John Doe',
          phone: '+1234567890',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          summary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        },
      },
    },
  });
  
  console.log('✅ Sample applicant created:', applicant.email);
  
  // ============================================================================
  // CREATE SAMPLE JOBS
  // ============================================================================
  
  const seniorDevJob = await prisma.job.create({
    data: {
      title: 'Senior Full-Stack Developer',
      description: 'We are seeking an experienced full-stack developer to join our engineering team. You will work on building scalable web applications using modern technologies.',
      requirements: '5+ years of experience with JavaScript/TypeScript, React, Node.js, and databases. Strong understanding of security best practices.',
      responsibilities: 'Design and implement new features, conduct code reviews, mentor junior developers, participate in architectural decisions.',
      benefits: 'Competitive salary, health insurance, 401k matching, remote work options, professional development budget.',
      category: 'Engineering',
      location: 'Remote / New York, NY',
      employmentType: 'FULL_TIME',
      department: 'Engineering',
      experienceLevel: 'SENIOR',
      salaryRange: '$120k-$180k',
      salaryMin: 120000,
      salaryMax: 180000,
      currency: 'USD',
      isRemote: true,
      openings: 2,
      status: JobStatus.OPEN,
      publishedAt: new Date(),
      ownerId: recruiter.id,
    },
  });
  
  console.log('✅ Job created:', seniorDevJob.title);
  
  const productManagerJob = await prisma.job.create({
    data: {
      title: 'Product Manager',
      description: 'Join our product team to drive the vision and strategy for our hiring platform. You will work closely with engineering, design, and stakeholders.',
      requirements: '3+ years of product management experience, excellent communication skills, data-driven decision making.',
      responsibilities: 'Define product roadmap, gather requirements, prioritize features, work with cross-functional teams.',
      benefits: 'Competitive compensation, equity, flexible work arrangements, health benefits.',
      category: 'Product',
      location: 'San Francisco, CA',
      employmentType: 'FULL_TIME',
      department: 'Product',
      experienceLevel: 'MID',
      salaryRange: '$110k-$150k',
      salaryMin: 110000,
      salaryMax: 150000,
      currency: 'USD',
      isRemote: false,
      openings: 1,
      status: JobStatus.OPEN,
      publishedAt: new Date(),
      ownerId: hrManager.id,
    },
  });
  
  console.log('✅ Job created:', productManagerJob.title);
  
  // ============================================================================
  // CREATE SAMPLE APPLICATION
  // ============================================================================
  
  const application = await prisma.application.create({
    data: {
      jobId: seniorDevJob.id,
      applicantId: applicant.id,
      coverLetter: 'I am excited to apply for the Senior Full-Stack Developer position. With over 5 years of experience building web applications, I believe I would be a great fit for your team.',
      status: ApplicationStatus.UNDER_REVIEW,
      rating: 4,
    },
  });
  
  console.log('✅ Sample application created');
  
  // ============================================================================
  // CREATE AUDIT LOGS
  // ============================================================================
  
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        username: admin.email,
        userRoles: admin.roles,
        action: 'LOGIN_SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script',
      },
      {
        userId: applicant.id,
        username: applicant.email,
        userRoles: applicant.roles,
        action: 'APPLICATION_SUBMITTED',
        resourceType: 'Application',
        resourceId: application.id,
        ipAddress: '127.0.0.1',
      },
    ],
  });
  
  console.log('✅ Audit logs created');
  
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:       admin@hiring-system.com / Admin@123456');
  console.log('HR Manager:  hr@hiring-system.com / HRManager@123');
  console.log('Recruiter:   recruiter@hiring-system.com / Recruiter@123');
  console.log('Interviewer: interviewer@hiring-system.com / Interviewer@123');
  console.log('Applicant:   applicant@example.com / Applicant@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

