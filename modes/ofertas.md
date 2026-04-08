# Mode: ofertas — Multi-Offer Comparison

Compare multiple offers side-by-side using a weighted scoring matrix.

## Input Sources

Offers can come from multiple sources. Check in this order:

1. **User provides offers directly** — JD text, URLs, or report references (e.g., "compare #12, #15, #23")
2. **Read from existing reports** — If the user says "compare my top offers" or similar, scan `reports/` and `data/applications.md` to find the best-scored evaluated offers
3. **Ask the user** — If no offers are provided and none found in tracker

### Auto-loading from tracker

When the user asks to compare without specifying offers:

1. Read `data/applications.md`
2. Filter entries with status `Evaluated` or `Applied` and score >= 3.5/5
3. Sort by score descending
4. Take top 5-8 offers (or all if fewer)
5. For each, read the full report from `reports/` to extract details
6. Present the comparison

If reports exist but no tracker entry matches, scan `reports/*.md` directly.

## Scoring Matrix (10 weighted dimensions)

| Dimension | Weight | Criteria 1-5 |
|-----------|--------|--------------|
| North Star Alignment | 25% | 5=exact target role, 1=unrelated |
| CV Match | 15% | 5=90%+ match, 1=<40% match |
| Level (senior+) | 15% | 5=staff+, 4=senior, 3=mid-senior, 2=mid, 1=junior |
| Estimated Comp | 10% | 5=top quartile, 1=below market |
| Growth Trajectory | 10% | 5=clear path to next level, 1=dead end |
| Remote Quality | 5% | 5=full remote async, 1=onsite only |
| Company Reputation | 5% | 5=top employer, 1=red flags |
| Tech Stack Modernity | 5% | 5=cutting edge AI/ML, 1=legacy |
| Time-to-Offer | 5% | 5=fast process (<2 weeks), 1=6+ months |
| Culture Signals | 5% | 5=builder culture, 1=bureaucratic |

## Output Format

For each offer, produce:
- Score in each dimension (1-5)
- Weighted total score
- Key strengths and risks

Then produce:
- **Ranking table** — all offers sorted by weighted total
- **Recommendation** — top 1-2 picks with reasoning
- **Time-to-offer consideration** — if a lower-ranked offer has a faster process, note the trade-off
- **Decision framework** — what new information would change the ranking

## Data Extraction from Reports

When reading existing reports, extract:

| Field | Where to find in report |
|-------|------------------------|
| Role & Company | Report header |
| Score | Block A or header |
| CV Match % | Block B |
| Comp range | Block C |
| Remote policy | Block A or C |
| Level | Block A |
| Growth | Block D |
| Tech stack | Block A (JD summary) |
| Culture | Block D or E |
| Archetype fit | Block A |
