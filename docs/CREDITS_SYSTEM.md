# RepoFuse Credits System

## Overview

The Credits System is a usage-based billing model that ensures profitability while providing flexibility to Pro users. Each Pro subscription includes 5,000 monthly credits that customers can use for analyses and scaffold generation.

## Economics

**Pricing Model:** $20/month per Pro subscription
**Target Profit Margin:** $15+ per customer (after $4 operational costs)

### Credit Allocation
- **Initial Grant:** 5,000 credits on Pro signup
- **Monthly Renewal:** 5,000 credits on each subscription renewal
- **Cost per Analysis:** 100 credits
- **Cost per Scaffold:** 250 credits

### Profitability Math
```
Revenue per customer: $20/month
Operational costs: ~$4/month (Claude API, infrastructure)
Target profit: $15-16/month

With 5,000 credits/month:
- 50 analyses at 100 credits each = 50 analyses/month
- Or 20 scaffold generations at 250 credits each
- Or any combination within the 5,000 credit budget

Claude API cost estimates:
- Analysis: ~$0.05-0.10 per analysis
- Scaffold: ~$0.30-0.50 per scaffold

With average usage, operational cost stays ~$2-3/month per user
```

## Credit Granting

### On Pro Signup
When a user purchases a Pro subscription through Stripe:

1. Webhook receives `checkout.session.completed` event
2. Initial 5,000 credits are granted immediately
3. Transaction logged with type: `grant`, reason: `Pro plan signup bonus`
4. User can start using analyses and scaffolds immediately

### On Monthly Renewal
When a subscription renews (payment succeeds):

1. Webhook receives `invoice.payment_succeeded` event
2. Only processes renewals (checks invoice number > 0001)
3. New 5,000 credits granted for the new billing period
4. Transaction logged with type: `renewal`
5. Previous month's unused credits do NOT roll over

## Credit Consumption

### Analysis Endpoint
- **Path:** `POST /api/analyses/[id]/analyze`
- **Credit Cost:** 100 credits
- **Pre-check:** Validates user has sufficient credits before processing
- **Error Response:** Returns 402 Payment Required if insufficient
- **On Success:** Deducts credits after analysis completes

### Scaffold Generation Endpoint
- **Path:** `POST /api/generate-scaffold`
- **Credit Cost:** 250 credits
- **Pre-check:** Validates user has sufficient credits before Claude call
- **Error Response:** Returns 402 Payment Required if insufficient
- **On Success:** Deducts credits after scaffold generates

## User Interface

### Billing Dashboard
Located at `/dashboard/billing` for Pro users:

- **Current Balance:** Large display of available credits
- **Usage Breakdown:** Shows analyses and scaffolds used this period
- **Usage Percentage:** Visual indicator of monthly credit consumption
- **Credit Costs:** Reference card showing cost per operation
- **Renewal Info:** Displays when next renewal is scheduled

### Credits Display Component
`<CreditsDisplay userId={userId} />`

Shows:
- Current balance in large typography with Zap icon
- Low balance warning badge when < 100 credits
- Breakdown by operation type
- Total granted vs. used this month
- Last renewal date
- Monthly renewal schedule explanation

## Database Schema

### user_credits Table
```sql
user_credits
├── id: UUID (Primary Key)
├── user_id: UUID (Foreign Key → users)
├── current_balance: BIGINT (current available credits)
├── total_granted: BIGINT (lifetime credits granted)
├── total_used: BIGINT (lifetime credits consumed)
├── last_renewal_date: TIMESTAMP (last time renewed)
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP (auto-updated)

Unique constraint: user_id (one record per user)
```

### credit_transactions Table
```sql
credit_transactions
├── id: UUID (Primary Key)
├── user_id: UUID (Foreign Key → users)
├── amount: BIGINT (positive for grants, negative for deductions)
├── transaction_type: VARCHAR (grant|analysis|scaffold|refund|renewal)
├── reason: TEXT (human-readable description)
├── metadata: JSONB (context-specific data)
├── balance_after: BIGINT (balance after transaction)
└── created_at: TIMESTAMP

Indexes:
  - user_id
  - transaction_type
  - created_at
```

## API Functions

### `getOrCreateUserCredits(userId: string)`
Returns existing user credits or creates new record with 0 balance.

### `getCreditBalance(userId: string)`
Returns current available credit balance for user.

### `grantCredits(userId, amount, reason, metadata?)`
Grants credits to user and records transaction.
- Updates `total_granted`
- Updates `current_balance`
- Sets `last_renewal_date`

### `deductCredits(userId, amount, type, metadata?)`
Attempts to deduct credits from user balance.
- Returns `{ success: true, transaction }` on success
- Returns `{ success: false, error: string }` if insufficient balance
- Updates `total_used` only on successful deduction

### `getCreditUsageSummary(userId)`
Returns object with:
- `total_granted`: Total credits given to user
- `total_used`: Total credits consumed
- `current_balance`: Credits remaining
- `analyses_used`: Number of analyses this month
- `scaffolds_used`: Number of scaffolds this month

### `getCreditTransactionHistory(userId, limit?)`
Returns transaction history sorted by newest first.

## Error Handling

### Insufficient Credits (402 Payment Required)
When a user attempts an action but lacks credits:

```json
{
  "error": "Insufficient credits",
  "required": 100,
  "available": 45,
  "message": "Upgrade to Pro to get unlimited analyses with 5,000 monthly credits."
}
```

Free users see this error and are encouraged to upgrade.

### Database Errors (500 Internal Server Error)
If credit transaction fails:
- Operation is NOT processed
- Error is logged with context
- User receives generic error message
- Admin can review logs for debugging

## Monitoring & Maintenance

### Regular Tasks
1. **Monthly:** Verify renewal credits were granted on cycle dates
2. **Weekly:** Review transaction logs for anomalies
3. **Real-time:** Monitor for failed deduction attempts

### Common Scenarios

**User reaches 0 credits:** They see "Insufficient credits" error and upgrade CTA

**User downgrades from Pro:** Credits are NOT refunded; they're only usable with Pro plan

**User re-upgrades:** They receive 5,000 new credits; old balance is not restored

**Payment fails:** Subscription moves to `past_due`; renewal credits are NOT granted until payment succeeds

## Testing

### Local Development
```typescript
// Grant test credits
await grantCredits(userId, 5000, 'Test grant')

// Deduct to test
await deductCredits(userId, 100, 'analysis')

// Check balance
const balance = await getCreditBalance(userId)
```

### Stripe Testing
1. Use Stripe test cards: 4242-4242-4242-4242
2. Webhook testing via Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Trigger test events: `stripe trigger charge.succeeded`

## Future Enhancements

Potential improvements:
- Credit marketplace (purchase additional credits)
- Team credit pools (share credits across team)
- Usage reports and analytics
- Credit expiration policy (e.g., expire unused credits after 12 months)
- Tiered usage discounts (bulk credit purchases)
