# Product Context

> **Purpose**: Help AI agents understand the product domain, user needs, and business rules. Update this as the product evolves.
> **Status do arquivo:** vazio — preencha as seções `<!-- TODO -->` com os dados reais do produto antes de usar com agentes. Sem estas informações o planner não consegue gerar specs nem planos alinhados ao domínio.

## Product Overview

**Product name**: [Your Product Name]
**Tagline**: [One sentence value proposition]
**Stage**: [Idea / MVP / Growth / Scale]

<!-- TODO: 2-3 sentences describing what the product is and does -->

## Target Users

### Primary User
- **Who**: [Role / persona name]
- **Goal**: [What they're trying to accomplish]
- **Pain point**: [What problem this solves for them]
- **Technical level**: [Non-technical / Technical / Developer]

### Secondary User (if any)
- **Who**: [Role / persona name]
- **Goal**: [What they're trying to accomplish]

## Core Features

<!-- TODO: List the main features of the product -->

| Feature | Description | Status |
|---------|-------------|--------|
| [Feature 1] | [Description] | Planned / In Progress / Live |
| [Feature 2] | [Description] | |

## Business Rules

> Critical business logic that AI agents must never violate. These are non-negotiable constraints.

<!-- TODO: Document business rules here. Examples: -->
- [Rule 1]: e.g., "A user can only belong to one organization at a time"
- [Rule 2]: e.g., "Invoices cannot be deleted, only voided"
- [Rule 3]: e.g., "Free tier is limited to 5 projects"

## Domain Glossary

> Use these terms consistently in code, documentation, and conversations.

| Term | Definition |
|------|-----------|
| [Term 1] | [Definition — be precise] |
| [Term 2] | [Definition] |
| [Term 3] | [Definition] |

## User Journeys

### Journey 1: [Name — e.g., "New User Onboarding"]
```
1. User signs up with email
2. Receives verification email
3. Completes profile setup
4. Creates first [entity]
5. Invites team members
```

### Journey 2: [Name — e.g., "Core Value Loop"]
```
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

## Metrics & Success Criteria

<!-- TODO: What does success look like? -->
- **Primary metric**: [e.g., Weekly Active Users]
- **Secondary metrics**: [e.g., Activation rate, Retention D7]
- **Current targets**: [e.g., 1000 MAU by Q3]

## Out of Scope

> Features or behaviors explicitly NOT part of this product (prevents scope creep).

- [What this product does NOT do]
- [What should NOT be built]

## Competitive Context

<!-- TODO: Optional — useful for AI to understand positioning -->
- **Similar products**: [List competitors or alternatives]
- **Our differentiation**: [What makes this different]

## Roadmap (High Level)

| Quarter | Theme | Key Deliverables |
|---------|-------|-----------------|
| Q[N] | [Theme] | [Feature list] |
| Q[N+1] | [Theme] | [Feature list] |
