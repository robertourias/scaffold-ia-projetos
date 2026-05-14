# Conventions

> Coding conventions and naming standards enforced across the entire codebase. Both frontend and backend agents must follow these consistently.

## Naming Conventions

### Files & Directories
```
kebab-case/          for directories
kebab-case.ts        for most files
PascalCase.tsx       for React components
kebab-case.spec.ts   for test files (backend)
PascalCase.test.tsx  for test files (frontend)
```

### TypeScript
```ts
PascalCase           for classes, interfaces, types, enums
camelCase            for variables, functions, methods, parameters
SCREAMING_SNAKE_CASE for constants and enum values
_prefixPrivate       for private class fields (when not using #private)
IPrefix              for interfaces (IUsersRepository) — domain layer only
```

### Database / ORM
```
snake_case           for table names and column names
plural_table_name    for tables (users, blog_posts, order_items)
entity_id            for foreign keys (user_id, order_id)
created_at, updated_at, deleted_at   for timestamp columns
```

### API Endpoints
```
/resources           plural nouns for collections
/resources/:id       for single resource
/resources/:id/sub   for nested resources
kebab-case           for multi-word paths (/user-profiles)

HTTP verbs:
GET    → read
POST   → create
PUT    → full replace
PATCH  → partial update
DELETE → remove
```

### React Components
```
PascalCase           component names and files (UserCard.tsx)
camelCase            props, hooks, handlers (onClick, useUserProfile)
use prefix           for all custom hooks (useAuth, useFormField)
on prefix            for event handler props (onSubmit, onClose)
is/has/can prefix    for boolean props (isLoading, hasError, canEdit)
```

## Code Style

### TypeScript Strictness
All projects run with `strict: true` in tsconfig:
- No implicit `any`
- No unused variables (error)
- Strict null checks
- No unchecked indexed access

### Imports Order
```ts
// 1. Node built-ins
import { readFile } from 'fs/promises'

// 2. External packages
import { Injectable } from '@nestjs/common'
import { z } from 'zod'

// 3. Internal packages (Turborepo — @packages/*)
import { Button } from '@packages/ui'

// 4. Internal application imports (absolute)
import { UsersModule } from '@/modules/users'

// 5. Relative imports
import { UserMapper } from './user.mapper'
import type { UserProps } from './user.types'
```

### Export Style
```ts
// ✅ Named exports preferred
export function calculateTotal() { ... }
export class UsersService { ... }
export type { UserDto }

// ✅ Default exports only for Next.js pages and layouts
export default function DashboardPage() { ... }
export default function RootLayout() { ... }
```

### Type Assertions
```ts
// ✅ Use type predicates for runtime narrowing
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'email' in value
}

// ❌ Avoid type casting with 'as' unless absolutely necessary
const user = data as User // avoid
```

## Git Conventions

### Branch Names
```
feat/short-description
fix/issue-description
chore/task-description
refactor/module-name
docs/what-was-updated
```

### Commit Messages (Conventional Commits)
```
feat: add user authentication with JWT
fix: resolve null pointer in order calculation
chore: update dependencies to latest patch versions
refactor: extract email validation to value object
docs: add API authentication guide
test: add integration tests for payment flow
```

### PR Size
- Keep PRs under 400 lines of changes when possible
- Split large features into multiple sequential PRs
- Always include a description of what changed and why

## Comments & Documentation

### When to comment
```ts
// ✅ Explain WHY, not WHAT (code shows what)
// Retrying once because the payment provider has transient failures on first attempt
await paymentGateway.charge(order, { retries: 1 })

// ✅ Document non-obvious business rules
// Orders older than 30 days cannot be refunded per policy 4.2
if (daysSinceOrder > 30) throw new RefundWindowExpiredError()

// ❌ Don't comment obvious code
// Increment counter by 1
counter++
```

### TSDoc for public APIs
```ts
/**
 * Creates a new user account and sends a verification email.
 * Throws {@link EmailAlreadyTakenError} if the email is already registered.
 *
 * @param input - User creation payload
 * @returns The newly created user (without sensitive fields)
 */
async function createUser(input: CreateUserInput): Promise<UserOutput>
```

## Linting & Formatting
- **ESLint**: configured in `packages/config/eslint`
- **Prettier**: configured in `packages/config/prettier`
- **Husky + lint-staged**: runs on commit to catch issues early
- CI blocks merges if lint or type-check fails

Never disable ESLint rules with `// eslint-disable` without a team-agreed comment explaining why.
