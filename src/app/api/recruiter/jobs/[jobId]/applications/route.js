import { NextResponse } from 'next/server';
import db from '@/lib/db';
import CVMatcher from '@/lib/cv-matcher';
import { promises as fs } from 'fs';
import path from 'path';

const cvMatcher = new CVMatcher();

export async function GET(request, { params }) {
  let connection;
  
  try {
    const { jobId } = await params;
    connection = await db.getConnection();

    // Get job details
    const [jobCheck] = await connection.execute(
      `SELECT j_id, j_title, j_description, j_skills
       FROM jobs WHERE j_id = ?`,
      [parseInt(jobId)]
    );

    if (jobCheck.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobCheck[0];
    const jobDescription = `${job.j_title} ${job.j_description} ${job.j_skills || ''}`;

    // Get applications
    const [applications] = await connection.execute(
      `SELECT 
        ja.ja_id, ja.ja_jobid, ja.ja_applicantid, ja.ja_phone,
        ja.ja_expected_salary, ja.ja_cv, ja.ja_status, ja.ja_applyDate,
        au.au_first_name, au.au_last_name, au.au_email
       FROM job_application ja
       LEFT JOIN admin_user au ON ja.ja_applicantid = au.au_id
       WHERE ja.ja_jobid = ?`,
      [parseInt(jobId)]
    );

    console.log(`📊 Found ${applications.length} applications for job ${jobId}`);

    // Process applications with CV matching
    const applicationsWithMatching = await Promise.all(
      applications.map(async (app) => {
        try {
          let matchScore = 0;
          let cvParsed = false;
          
          // Parse CV and calculate match if CV exists
          if (app.ja_cv) {
            try {
              console.log(`🔍 Processing CV for applicant ${app.ja_id}: ${app.ja_cv}`);
              
              // Use the correct CV path
              const cvPath = path.join('F:', 'Sakib File', 'JobPost', 'Jobnova', 'Jobnova_NextJs', 'public', 'applicantsCV', app.ja_cv);
              
              console.log(`📁 Looking for CV at: ${cvPath}`);

              try {
                const fileBuffer = await fs.readFile(cvPath);
                console.log(`✅ CV found and readable: ${app.ja_cv}`);
                
                const cvText = await cvMatcher.parseCV(fileBuffer);
                console.log(`📄 CV text length: ${cvText.length} characters`);
                
                matchScore = cvMatcher.calculateMatch(jobDescription, cvText);
                cvParsed = true;
                console.log(`🎯 Match score for ${app.au_first_name}: ${matchScore}%`);
              } catch (fileError) {
                console.log(`❌ CV file error for ${app.ja_cv}:`, fileError.message);
                matchScore = 0;
              }
            } catch (error) {
              console.log(`❌ CV processing failed for ${app.ja_id}:`, error.message);
              matchScore = 0;
            }
          } else {
            console.log(`📭 No CV file for applicant ${app.ja_id}`);
            matchScore = 0;
          }

          // Map status (your existing logic)
          let mappedStatus = app.ja_status;
          if (app.ja_status === 1) mappedStatus = 2; // Accept -> Viewed
          if (app.ja_status === 2) mappedStatus = 4; // Reject -> Rejected  
          if (app.ja_status === 3) mappedStatus = 3; // ShortList -> Not Viewed

          return {
            ...app,
            ja_status: mappedStatus,
            ja_phone: app.ja_phone || 'Not provided',
            ja_expected_salary: app.ja_expected_salary || 0,
            au_first_name: app.au_first_name || 'Unknown',
            au_last_name: app.au_last_name || 'Applicant',
            au_email: app.au_email || 'No email provided',
            matchScore: matchScore,
            matchCategory: getMatchCategory(matchScore),
            cvParsed: cvParsed
          };
        } catch (error) {
          console.error(`❌ Error processing application ${app.ja_id}:`, error);
          return { 
            ...app, 
            matchScore: 0, 
            matchCategory: 'Analysis Failed',
            cvParsed: false,
            ja_phone: app.ja_phone || 'Not provided',
            ja_expected_salary: app.ja_expected_salary || 0,
            au_first_name: app.au_first_name || 'Unknown',
            au_last_name: app.au_last_name || 'Applicant',
            au_email: app.au_email || 'No email provided'
          };
        }
      })
    );

    // Sort by match score (highest first)
    applicationsWithMatching.sort((a, b) => b.matchScore - a.matchScore);

    const stats = {
      total: applicationsWithMatching.length,
      withCV: applicationsWithMatching.filter(app => app.cvParsed).length,
      averageScore: applicationsWithMatching.length > 0 ? 
        Math.round(applicationsWithMatching.reduce((sum, app) => sum + app.matchScore, 0) / applicationsWithMatching.length) : 0
    };

    console.log(`📈 Matching stats:`, stats);

    return NextResponse.json({
      success: true,
      applications: applicationsWithMatching,
      count: applicationsWithMatching.length,
      stats: stats,
      job: {
        id: job.j_id,
        title: job.j_title
      }
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

function getMatchCategory(score) {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 50) return 'Potential Match';
  if (score >= 30) return 'Weak Match';
  return 'Poor Match';
}