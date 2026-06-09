import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Gauge,
  Mail,
  Printer,
  Rocket,
  Settings2,
  WalletCards,
} from 'lucide-react'
import './App.css'

type Tier = 'starter' | 'growth' | 'scale'

type DealInput = {
  agencyName: string
  clientName: string
  clientIndustry: string
  offerName: string
  corePain: string
  targetOutcome: string
  tier: Tier
  setupFee: number
  monthlyRetainer: number
  deliveryHours: number
  hourlyCost: number
  toolCost: number
  monthlyLeads: number
  closeRate: number
  averageDealValue: number
  expectedLift: number
  salesCycleDays: number
  adBudget: number
  includeAds: boolean
  includeGuarantee: boolean
}

type TierProfile = {
  label: string
  multiplier: number
  promise: string
  scope: string[]
}

type NumberFieldProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
  onChange: (value: number) => void
}

const STORAGE_KEY = 'profitpilot-deal-v1'

const initialDeal: DealInput = {
  agencyName: 'Northstar Growth Studio',
  clientName: 'Atlas Dental Group',
  clientIndustry: 'local healthcare',
  offerName: 'missed-lead recovery system',
  corePain: 'paid leads go cold before the front desk can follow up',
  targetOutcome: 'more booked consultations from the same traffic',
  tier: 'growth',
  setupFee: 4500,
  monthlyRetainer: 3200,
  deliveryHours: 28,
  hourlyCost: 65,
  toolCost: 420,
  monthlyLeads: 180,
  closeRate: 14,
  averageDealValue: 1800,
  expectedLift: 22,
  salesCycleDays: 18,
  adBudget: 2500,
  includeAds: false,
  includeGuarantee: true,
}

const tierProfiles: Record<Tier, TierProfile> = {
  starter: {
    label: 'Starter',
    multiplier: 0.78,
    promise: 'Launch a narrow, profitable first workflow.',
    scope: [
      'One revenue workflow',
      'Lead response script',
      'Weekly scorecard',
      '30 day optimization window',
    ],
  },
  growth: {
    label: 'Growth',
    multiplier: 1,
    promise: 'Install the core system and improve conversion speed.',
    scope: [
      'Two revenue workflows',
      'CRM and inbox routing',
      'Conversion dashboard',
      'Four weekly iteration calls',
    ],
  },
  scale: {
    label: 'Scale',
    multiplier: 1.42,
    promise: 'Turn the offer into an operating system for the sales team.',
    scope: [
      'Four revenue workflows',
      'Manager playbook',
      'Team training session',
      '90 day optimization window',
    ],
  },
}

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactMoneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
})

function formatMoney(value: number, compact = false) {
  return (compact ? compactMoneyFormatter : moneyFormatter).format(Math.round(value))
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function readInitialDeal() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return initialDeal
    }

    return { ...initialDeal, ...JSON.parse(stored) } as DealInput
  } catch {
    return initialDeal
  }
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  onChange,
}: NumberFieldProps) {
  const formattedValue = `${prefix ?? ''}${value.toLocaleString('en-US')}${suffix ?? ''}`

  return (
    <label className="field number-field">
      <span className="field-top">
        <span>{label}</span>
        <strong>{formattedValue}</strong>
      </span>
      <span className="numeric-row">
        <input
          className="range-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="number-box">
          {prefix ? <span>{prefix}</span> : null}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          {suffix ? <span>{suffix}</span> : null}
        </span>
      </span>
    </label>
  )
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  detail,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: 'blue' | 'green' | 'amber' | 'rose'
  detail: string
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function App() {
  const [deal, setDeal] = useState<DealInput>(readInitialDeal)
  const [copied, setCopied] = useState<'proposal' | 'email' | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deal))
  }, [deal])

  const tier = tierProfiles[deal.tier]

  const economics = useMemo(() => {
    const setupFee = Math.round(deal.setupFee * (0.86 + tier.multiplier * 0.14))
    const retainer = Math.round(deal.monthlyRetainer * tier.multiplier)
    const passThroughBudget = deal.includeAds ? deal.adBudget : 0
    const monthlyDeliveryCost = deal.deliveryHours * deal.hourlyCost + deal.toolCost
    const monthlyProfit = retainer - monthlyDeliveryCost
    const margin = retainer > 0 ? (monthlyProfit / retainer) * 100 : 0
    const currentMonthlyRevenue =
      deal.monthlyLeads * (deal.closeRate / 100) * deal.averageDealValue
    const clientUpside = currentMonthlyRevenue * (deal.expectedLift / 100)
    const monthOneInvestment = setupFee + retainer + passThroughBudget
    const ongoingInvestment = retainer + passThroughBudget
    const monthOneRoi = monthOneInvestment > 0 ? (clientUpside / monthOneInvestment) * 100 : 0
    const ongoingRoi = ongoingInvestment > 0 ? (clientUpside / ongoingInvestment) * 100 : 0
    const paybackDays =
      clientUpside > 0 ? Math.max(1, Math.ceil((ongoingInvestment / clientUpside) * 30)) : 0
    const dealScore = clamp(
      42 +
        (margin - 35) * 0.9 +
        Math.min(ongoingRoi, 350) * 0.11 +
        (deal.salesCycleDays <= 21 ? 8 : -4) +
        (deal.includeGuarantee ? 4 : 0),
      0,
      100,
    )

    return {
      setupFee,
      retainer,
      passThroughBudget,
      monthlyDeliveryCost,
      monthlyProfit,
      margin,
      currentMonthlyRevenue,
      clientUpside,
      monthOneInvestment,
      ongoingInvestment,
      monthOneRoi,
      ongoingRoi,
      paybackDays,
      dealScore,
    }
  }, [deal, tier])

  const proposalText = useMemo(() => {
    const guarantee = deal.includeGuarantee
      ? `\nGuarantee: if ${deal.clientName} does not see a measurable lift in ${deal.targetOutcome} inside 60 days, ${deal.agencyName} adds two optimization weeks at no extra fee.`
      : ''
    const passThrough = deal.includeAds
      ? `\nPass-through budget: ${formatMoney(economics.passThroughBudget)} per month for media or software usage.`
      : ''

    return `${deal.agencyName} proposal for ${deal.clientName}

Offer: ${tier.label} ${deal.offerName}
Industry: ${deal.clientIndustry}

Problem:
${deal.clientName} is losing revenue because ${deal.corePain}.

Outcome:
We will help create ${deal.targetOutcome}. Based on the current inputs, the upside estimate is ${formatMoney(economics.clientUpside)} per month.

Scope:
${tier.scope.map((item) => `- ${item}`).join('\n')}

Investment:
- Setup: ${formatMoney(economics.setupFee)}
- Monthly retainer: ${formatMoney(economics.retainer)}
- Estimated payback: ${economics.paybackDays} days after the system is active${passThrough}

Why this is worth doing:
The ongoing investment is ${formatMoney(economics.ongoingInvestment)} against an estimated monthly upside of ${formatMoney(economics.clientUpside)}, or ${formatPercent(economics.ongoingRoi)} projected ongoing ROI.${guarantee}

Next step:
Approve the ${tier.label} package and schedule the launch workshop.`
  }, [deal, economics, tier])

  const emailText = useMemo(() => {
    return `Subject: ${deal.clientName} - ${deal.targetOutcome}

Hi ${deal.clientName} team,

I mapped the numbers behind the ${deal.offerName}. With your current lead volume, even a ${formatPercent(
      deal.expectedLift,
    )} lift could be worth about ${formatMoney(economics.clientUpside)} per month.

The ${tier.label} plan would cost ${formatMoney(economics.setupFee)} to launch and ${formatMoney(
      economics.retainer,
    )}/mo after that. The projected payback window is ${economics.paybackDays} days once live.

Worth a short review this week?

${deal.agencyName}`
  }, [deal, economics, tier])

  function updateDeal<K extends keyof DealInput>(key: K, value: DealInput[K]) {
    setDeal((current) => ({ ...current, [key]: value }))
  }

  async function copyText(kind: 'proposal' | 'email', text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }

    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1600)
  }

  function downloadText(kind: string, text: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${kind}-${deal.clientName.toLowerCase().replace(/\s+/g, '-')}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const scoreStyle = {
    '--score': `${economics.dealScore * 3.6}deg`,
  } as CSSProperties

  const acquisitionScenarios = [
    { label: '50 studios', price: 79, customers: 50 },
    { label: '200 studios', price: 149, customers: 200 },
    { label: '1,000 studios', price: 249, customers: 1000 },
  ]

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <BriefcaseBusiness size={22} />
          </span>
          <div>
            <p>ProfitPilot</p>
            <span>Proposal economics for service businesses</span>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="ghost-button"
            type="button"
            title="Print proposal"
            onClick={() => window.print()}
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button
            className="primary-button"
            type="button"
            title="Copy proposal"
            onClick={() => copyText('proposal', proposalText)}
          >
            {copied === 'proposal' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            <span>{copied === 'proposal' ? 'Copied' : 'Copy proposal'}</span>
          </button>
        </div>
      </header>

      <main className="app-grid">
        <aside className="control-panel" aria-label="Deal inputs">
          <div className="panel-title">
            <Settings2 size={18} />
            <span>Deal inputs</span>
          </div>

          <div className="field-stack">
            <label className="field">
              <span>Seller</span>
              <input
                value={deal.agencyName}
                onChange={(event) => updateDeal('agencyName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Client</span>
              <input
                value={deal.clientName}
                onChange={(event) => updateDeal('clientName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Industry</span>
              <input
                value={deal.clientIndustry}
                onChange={(event) => updateDeal('clientIndustry', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Offer</span>
              <input
                value={deal.offerName}
                onChange={(event) => updateDeal('offerName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Core pain</span>
              <textarea
                value={deal.corePain}
                onChange={(event) => updateDeal('corePain', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Target outcome</span>
              <textarea
                value={deal.targetOutcome}
                onChange={(event) => updateDeal('targetOutcome', event.target.value)}
              />
            </label>
          </div>

          <div className="segmented-control" aria-label="Package tier">
            {(Object.keys(tierProfiles) as Tier[]).map((key) => (
              <button
                key={key}
                type="button"
                className={deal.tier === key ? 'active' : ''}
                onClick={() => updateDeal('tier', key)}
              >
                {tierProfiles[key].label}
              </button>
            ))}
          </div>

          <NumberField
            label="Setup fee"
            min={500}
            max={20000}
            step={250}
            prefix="$"
            value={deal.setupFee}
            onChange={(value) => updateDeal('setupFee', value)}
          />
          <NumberField
            label="Monthly retainer"
            min={500}
            max={25000}
            step={100}
            prefix="$"
            value={deal.monthlyRetainer}
            onChange={(value) => updateDeal('monthlyRetainer', value)}
          />
          <NumberField
            label="Delivery hours"
            min={4}
            max={120}
            step={1}
            suffix="h"
            value={deal.deliveryHours}
            onChange={(value) => updateDeal('deliveryHours', value)}
          />
          <NumberField
            label="Internal hourly cost"
            min={20}
            max={250}
            step={5}
            prefix="$"
            value={deal.hourlyCost}
            onChange={(value) => updateDeal('hourlyCost', value)}
          />
          <NumberField
            label="Software cost"
            min={0}
            max={5000}
            step={25}
            prefix="$"
            value={deal.toolCost}
            onChange={(value) => updateDeal('toolCost', value)}
          />

          <div className="toggle-list">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={deal.includeAds}
                onChange={(event) => updateDeal('includeAds', event.target.checked)}
              />
              <span>Include pass-through budget</span>
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={deal.includeGuarantee}
                onChange={(event) => updateDeal('includeGuarantee', event.target.checked)}
              />
              <span>Performance guarantee</span>
            </label>
          </div>

          {deal.includeAds ? (
            <NumberField
              label="Pass-through budget"
              min={250}
              max={30000}
              step={250}
              prefix="$"
              value={deal.adBudget}
              onChange={(value) => updateDeal('adBudget', value)}
            />
          ) : null}
        </aside>

        <section className="workspace" aria-label="Proposal workspace">
          <section className="metrics-grid" aria-label="Deal metrics">
            <MetricCard
              icon={<WalletCards size={20} />}
              label="Month one cash"
              value={formatMoney(economics.monthOneInvestment)}
              tone="blue"
              detail={`${formatMoney(economics.setupFee)} setup + first month`}
            />
            <MetricCard
              icon={<Calculator size={20} />}
              label="Monthly profit"
              value={formatMoney(economics.monthlyProfit)}
              tone="green"
              detail={`${formatPercent(economics.margin)} gross margin`}
            />
            <MetricCard
              icon={<ArrowUpRight size={20} />}
              label="Client upside"
              value={formatMoney(economics.clientUpside)}
              tone="amber"
              detail={`${formatPercent(deal.expectedLift)} lift on current revenue`}
            />
            <MetricCard
              icon={<Gauge size={20} />}
              label="Ongoing ROI"
              value={formatPercent(economics.ongoingRoi)}
              tone="rose"
              detail={`${economics.paybackDays} day estimated payback`}
            />
          </section>

          <div className="work-grid">
            <section className="proposal-panel">
              <div className="section-heading">
                <div>
                  <span>Commercial proposal</span>
                  <strong>{deal.clientName}</strong>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  title="Download proposal"
                  onClick={() => downloadText('proposal', proposalText)}
                >
                  <Download size={18} />
                </button>
              </div>

              <article className="proposal-paper">
                <div className="paper-kicker">{deal.agencyName}</div>
                <h1>{tier.label} {deal.offerName}</h1>
                <p className="paper-lede">{tier.promise}</p>

                <div className="paper-row">
                  <span>Client</span>
                  <strong>{deal.clientName}</strong>
                </div>
                <div className="paper-row">
                  <span>Industry</span>
                  <strong>{deal.clientIndustry}</strong>
                </div>
                <div className="paper-row">
                  <span>Target outcome</span>
                  <strong>{deal.targetOutcome}</strong>
                </div>

                <div className="paper-section">
                  <h2>Revenue case</h2>
                  <p>
                    The model estimates {formatMoney(economics.clientUpside)} in monthly upside
                    against {formatMoney(economics.ongoingInvestment)} in ongoing investment.
                  </p>
                </div>

                <div className="scope-list">
                  {tier.scope.map((item) => (
                    <div key={item}>
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="price-strip">
                  <div>
                    <span>Setup</span>
                    <strong>{formatMoney(economics.setupFee)}</strong>
                  </div>
                  <div>
                    <span>Monthly</span>
                    <strong>{formatMoney(economics.retainer)}</strong>
                  </div>
                  <div>
                    <span>Payback</span>
                    <strong>{economics.paybackDays} days</strong>
                  </div>
                </div>
              </article>
            </section>

            <aside className="insight-stack">
              <section className="score-panel">
                <div className="section-heading compact">
                  <div>
                    <span>Deal score</span>
                    <strong>{Math.round(economics.dealScore)} / 100</strong>
                  </div>
                  <Rocket size={20} />
                </div>
                <div className="score-gauge" style={scoreStyle}>
                  <strong>{Math.round(economics.dealScore)}</strong>
                  <span>score</span>
                </div>
                <div className="score-bars">
                  <div>
                    <span>Margin</span>
                    <i style={{ width: `${clamp(economics.margin, 0, 100)}%` }} />
                  </div>
                  <div>
                    <span>ROI</span>
                    <i style={{ width: `${clamp(economics.ongoingRoi / 4, 0, 100)}%` }} />
                  </div>
                  <div>
                    <span>Speed</span>
                    <i style={{ width: `${clamp(120 - deal.salesCycleDays * 3, 0, 100)}%` }} />
                  </div>
                </div>
              </section>

              <section className="driver-panel">
                <div className="section-heading compact">
                  <div>
                    <span>Client economics</span>
                    <strong>{formatMoney(economics.currentMonthlyRevenue)}</strong>
                  </div>
                  <Calculator size={20} />
                </div>
                <NumberField
                  label="Monthly leads"
                  min={10}
                  max={2000}
                  step={10}
                  value={deal.monthlyLeads}
                  onChange={(value) => updateDeal('monthlyLeads', value)}
                />
                <NumberField
                  label="Close rate"
                  min={1}
                  max={60}
                  step={1}
                  suffix="%"
                  value={deal.closeRate}
                  onChange={(value) => updateDeal('closeRate', value)}
                />
                <NumberField
                  label="Average deal value"
                  min={100}
                  max={50000}
                  step={100}
                  prefix="$"
                  value={deal.averageDealValue}
                  onChange={(value) => updateDeal('averageDealValue', value)}
                />
                <NumberField
                  label="Expected lift"
                  min={1}
                  max={120}
                  step={1}
                  suffix="%"
                  value={deal.expectedLift}
                  onChange={(value) => updateDeal('expectedLift', value)}
                />
                <NumberField
                  label="Sales cycle"
                  min={1}
                  max={90}
                  step={1}
                  suffix="d"
                  value={deal.salesCycleDays}
                  onChange={(value) => updateDeal('salesCycleDays', value)}
                />
              </section>

              <section className="email-panel">
                <div className="section-heading compact">
                  <div>
                    <span>Sales email</span>
                    <strong>{copied === 'email' ? 'Copied' : 'Ready'}</strong>
                  </div>
                  <button
                    className="icon-button"
                    type="button"
                    title="Copy email"
                    onClick={() => copyText('email', emailText)}
                  >
                    {copied === 'email' ? <CheckCircle2 size={18} /> : <Clipboard size={18} />}
                  </button>
                </div>
                <pre>{emailText}</pre>
              </section>
            </aside>
          </div>

          <section className="business-panel">
            <div className="section-heading">
              <div>
                <span>Business model</span>
                <strong>Turn ProfitPilot into a paid micro-SaaS</strong>
              </div>
              <Mail size={20} />
            </div>
            <div className="scenario-grid">
              {acquisitionScenarios.map((scenario) => (
                <article key={scenario.label} className="scenario-card">
                  <span>{scenario.label}</span>
                  <strong>{formatMoney(scenario.price * scenario.customers)}/mo</strong>
                  <small>
                    {formatMoney(scenario.price)}/seat, {formatMoney(scenario.price * scenario.customers * 12, true)} ARR
                  </small>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
