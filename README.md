# SmartGrievance AI — Combined Project

This project combines the working grievance workflow and AI services from `SMART AI GREIVERANCE.zip` with the independent grievance safety rules and selected design/reference components from `pixel-perfect-replication-main.zip`.

## Integrated features
- Home, grievance registration, tracking and citizen dashboard.
- Citizen, officer, district administrator and super administrator login routes.
- Officer/admin overview dashboards, department directory, About and Help pages.
- Existing multilingual classification, urgency, duplicate detection, notifications and complaint history services.
- Independent cross-check from the first project's rule engine: if either classifier identifies a critical hazard, the priority is not downgraded and the case is marked for officer review.
- First project's route/component source is retained under `integration/first-project-reference/` for design provenance and future migration.

## Run locally
Requires Node.js 20+ and npm. From this folder:

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Important prototype limitations
The included complaint store and demo authentication use browser/local mock data. Do not use real personal data or deploy as a production government service until a secure backend database, server-side authentication/authorization, secure document storage, audit logging, and operational alerting are implemented. The AI is a rules-based prototype, not a validated trained NLP model. Human review is required for uncertain and critical recommendations.
