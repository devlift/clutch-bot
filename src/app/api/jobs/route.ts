import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: jobs, error } = await supabase
      .from('Job')
      .select(`
        *,
        employer:Employer(
          id,
          companyName,
          logo,
          website,
          location,
          contactEmail,
          phone,
          industry
        )
      `)
      .order('createdTime', { ascending: false })

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Raw jobs data:', JSON.stringify(jobs, null, 2));

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      createdTime: job.createdTime,
      employerId: job.employerId,
      title: job.title,
      description: job.description,
      tags: job.tags || [],
      wage: job.wage || 0,
      wageType: job.wageType || 'per year',
      location: job.location || 'Remote',
      jobType: job.jobType || 'Full time',
      schedule: job.schedule,
      hours: job.hours,
      startDate: job.startDate,
      benefits: job.benefits || [],
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      howToApply: job.howToApply,
      advertiseUntil: job.advertiseUntil,
      jobBankId: job.jobBankId,
      status: job.status,
      employer: job.employer ? {
        id: job.employer.id,
        companyName: job.employer.companyName,
        logo: job.employer.logo || '/images/logo/default-company.png',
        website: job.employer.website,
        location: job.employer.location,
        contactEmail: job.employer.contactEmail,
        phone: job.employer.phone,
        industry: job.employer.industry
      } : undefined
    }));

    console.log('Formatted jobs:', JSON.stringify(formattedJobs, null, 2));

    return NextResponse.json({ jobs: formattedJobs })
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 