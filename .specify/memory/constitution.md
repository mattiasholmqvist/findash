<!--
Sync Impact Report - Constitution Update
Version: 1.0.1 → 1.0.2
Modified Principles: V. TypeScript Everywhere (added kebab-case filename requirement)
Added Sections: None
Removed Sections: None
Templates Requiring Updates:
- ✅ plan-template.md (TypeScript compliance check updated)
- ✅ tasks-template.md (filename convention tasks aligned)
- ✅ CLAUDE.md (TypeScript standards updated with kebab-case requirement)
Follow-up TODOs: None - kebab-case requirement properly integrated
-->

# FinDash Constitution

## Core Principles

### I. Domain-Driven Design (NON-NEGOTIABLE)
All system design MUST start with the business domain model. Ubiquitous language MUST be used throughout code, documentation, and communication. Domain models MUST be the source of truth for business logic and rules. Boundaries between bounded contexts MUST be explicit and well-defined.

### II. CQRS Architecture
Command and Query operations MUST be separated at the service layer. Write models (commands) and read models (queries) MUST have distinct data representations optimized for their specific use cases. Commands MUST modify state through domain aggregates only. Queries MUST access optimized read models without side effects.

### III. Event Sourcing Implementation
Domain aggregates MUST persist state as an immutable sequence of domain events. Current state MUST be derived by replaying events from the event store. All business operations MUST emit domain events that capture business intent, not just data changes. Event schemas MUST be versioned and backward-compatible.

### IV. AWS Serverless-First
Backend services MUST use AWS managed services over self-managed infrastructure. Lambda functions MUST be stateless and follow single-responsibility principle. DynamoDB MUST be used for event storage with proper partition key design. API Gateway MUST handle HTTP routing and request validation.

### V. TypeScript Everywhere
All backend code MUST be written in TypeScript with strict type checking enabled. Domain models MUST have comprehensive type definitions. API contracts MUST be generated from TypeScript interfaces. No `any` types allowed in production code without explicit justification. All TypeScript filenames MUST use kebab-case naming convention (e.g., `user-aggregate.ts`, `payment-handler.ts`, `invoice-service.ts`).

## Architecture Standards

### Backend Architecture
All backend services MUST follow the hexagonal architecture pattern with clear separation of domain, application, and infrastructure layers. AWS Lambda functions MUST implement command or query handlers only. Event processing MUST be asynchronous using SQS/EventBridge. Database access MUST go through repository abstractions.

### Frontend Standards
React applications MUST use functional components with TypeScript interfaces. State management MUST use React Query for server state and React Context for local state. Component libraries MUST provide consistent UX patterns. Vite MUST be used for build tooling with proper code splitting.

### Testing Requirements
Vitest MUST be used for all frontend testing with component, integration, and unit test levels. Backend Lambda functions MUST have unit tests with mocked AWS services. Event sourcing replay tests MUST validate aggregate reconstruction. End-to-end tests MUST cover critical user journeys.

## Development Workflow

### Code Quality Gates
All code MUST pass TypeScript compilation with zero errors. ESLint rules MUST be configured for consistent code style. Automated tests MUST achieve 80% code coverage minimum. Domain events MUST have schema validation tests.

### Deployment Standards
Infrastructure MUST be defined as code using AWS CDK with TypeScript. Each bounded context MUST have independent deployment pipelines. Event schema changes MUST be deployed with backward compatibility validation. Frontend deployments MUST include performance budgets.

### Event Schema Management
All domain events MUST have versioned schemas stored in a schema registry. Event evolution MUST follow additive-only patterns. Event upcasting MUST be implemented for schema migrations. Event replay compatibility MUST be verified across versions.

### Version Control Standards
Feature branches MUST use numbered naming convention (`###-feature-name`). Commits MUST follow semantic commit structure with domain-specific types: `domain:`, `event:`, `infra:`, `cqrs:`. Commit scopes MUST reference bounded contexts, technical layers, or components. All commits MUST maintain constitutional compliance verification for affected principles.

## Governance

This constitution supersedes all other development practices and architectural decisions. All feature specifications and implementation plans MUST verify compliance with these principles before proceeding. Violations MUST be documented with explicit justification and approved through architectural review.

Code reviews MUST verify adherence to DDD principles and event sourcing patterns. Performance requirements MUST align with serverless constraints and cold start considerations. Complexity MUST be justified when deviating from standard AWS serverless patterns.

**Version**: 1.0.2 | **Ratified**: 2025-09-24 | **Last Amended**: 2025-09-24