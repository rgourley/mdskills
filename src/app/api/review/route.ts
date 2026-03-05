import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSkillReview } from '@/lib/generate-review'

const QUALITY_THRESHOLD = 4.0
const MAX_REVIEW_ATTEMPTS = 3

/**
 * POST /api/review — Run Skill Advisor on submitted content before final submission.
 * Returns score + feedback. If score < threshold, submission is rejected with actionable feedback.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, artifactType, formatStandard, attempt = 1 } = body

    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Content must be at least 50 characters' },
        { status: 400 }
      )
    }

    if (attempt > MAX_REVIEW_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Maximum review attempts reached. Please contact support or revise substantially before trying again.' },
        { status: 429 }
      )
    }

    // Run the Skill Advisor
    const review = await generateSkillReview(
      content,
      null, // no readme for inline submissions
      undefined, // permissions auto-detected
      undefined, // use default API key
      artifactType || 'skill_pack',
      formatStandard || 'skill_md',
    )

    if (!review) {
      // Review generation failed — let them through rather than blocking
      return NextResponse.json({
        passed: true,
        score: null,
        message: 'Review service temporarily unavailable. Submission will be reviewed manually.',
      })
    }

    const passed = review.quality_score >= QUALITY_THRESHOLD

    return NextResponse.json({
      passed,
      score: review.quality_score,
      summary: review.summary,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
      threshold: QUALITY_THRESHOLD,
      attempt,
      maxAttempts: MAX_REVIEW_ATTEMPTS,
      ...(passed ? {} : {
        message: `Your submission scored ${review.quality_score.toFixed(1)}/10, which is below the minimum threshold of ${QUALITY_THRESHOLD.toFixed(1)}. Please address the feedback below and try again.`,
      }),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Review failed' },
      { status: 500 }
    )
  }
}
