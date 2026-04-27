import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getPlanById } from '@/lib/billing'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  try {
    const { planId } = (await request.json()) as { planId?: string }
    const plan = getPlanById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Unknown billing plan.' }, { status: 400 })
    }

    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable Checkout.' },
        { status: 503 },
      )
    }

    const baseUrl = getBaseUrl(request)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            recurring: { interval: plan.interval },
            unit_amount: plan.unitAmount,
            product_data: {
              name: plan.name,
              description: plan.description,
              metadata: {
                plan_id: plan.id,
              },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: plan.id,
      },
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error)
    return NextResponse.json({ error: 'Failed to create Checkout session.' }, { status: 500 })
  }
}
