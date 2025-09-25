# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinDash is a modern bookkeeping system for the Swedish market, designed for high-volume operations and complex accounting scenarios. The system targets large enterprises and accounting firms requiring robust, scalable financial management solutions.

## Architecture Philosophy

This project follows strict architectural principles defined in `.specify/memory/constitution.md`:

### Core Architectural Patterns
- **Domain-Driven Design (NON-NEGOTIABLE)**: All system design starts with business domain models using ubiquitous language
- **CQRS Architecture**: Commands and queries are separated with distinct data representations
- **Event Sourcing**: Domain aggregates persist as immutable event sequences; current state derived by replay
- **AWS Serverless-First**: Backend uses Lambda functions, DynamoDB, EventBridge, API Gateway
- **TypeScript Everywhere**: Strict typing required throughout, no `any` types without justification, kebab-case filenames mandatory

### Project Structure Conventions
- **Hexagonal Architecture**: Clear separation of domain, application, and infrastructure layers
- **Bounded Contexts**: Explicit boundaries between different business domains
- **Event-Driven**: Asynchronous processing using SQS/EventBridge
- **Repository Pattern**: Database access through abstractions only

## Development Workflow

### Slash Commands (Specify Framework)
This repository uses a structured development workflow with these commands:
- `/specify` - Create feature specifications from natural language
- `/plan` - Generate implementation plans with constitutional compliance checks
- `/clarify` - Identify underspecified areas and ask targeted questions
- `/tasks` - Generate dependency-ordered task lists from design artifacts
- `/analyze` - Cross-artifact consistency analysis
- `/implement` - Execute implementation plans
- `/constitution` - Update project constitution and propagate changes

### Feature Development Process
1. Features are developed in numbered branches (`001-feature-name`)
2. Each feature gets a directory in `specs/###-feature-name/` containing:
   - `spec.md` - Business requirements and user scenarios
   - `plan.md` - Technical implementation plan
   - `research.md` - Technology decisions and rationale
   - `data-model.md` - Domain entities and relationships
   - `contracts/` - API specifications
   - `tasks.md` - Ordered implementation tasks

### Constitutional Compliance
All features must pass constitutional compliance checks verifying:
- Domain model identification and ubiquitous language usage
- CQRS command/query separation
- Event sourcing event identification and schema versioning
- Serverless Lambda function single responsibility
- TypeScript strict typing without `any` types

## Technology Stack Requirements

### Backend (AWS Serverless)
- **Runtime**: TypeScript with strict compilation
- **Compute**: AWS Lambda functions (stateless, single-responsibility)
- **Storage**: DynamoDB for event store (proper partition key design)
- **Integration**: EventBridge for event processing, SQS for queues
- **API**: API Gateway for HTTP routing and validation
- **Infrastructure**: AWS CDK with TypeScript

### Frontend (React/TypeScript)
- **Framework**: React with functional components only
- **Build Tool**: Vite with code splitting
- **Testing**: Vitest for all test levels
- **State Management**: React Query for server state, React Context for local state
- **Typing**: TypeScript interfaces throughout

### Testing Requirements
- **Coverage**: Minimum 80% code coverage required
- **Backend**: Unit tests with mocked AWS services
- **Frontend**: Component, integration, and unit tests with Vitest
- **Event Sourcing**: Replay tests validating aggregate reconstruction
- **End-to-End**: Critical user journey coverage

## Swedish Market Compliance

This system must support Swedish accounting standards:
- **BAS (Accounting Standards)**: Chart of accounts structure
- **K-regelverket**: Classification rules for companies
- **SRU**: Standardized business reporting format
- **Tax Regulations**: Swedish tax compliance requirements

## Event Schema Management

- All domain events must have versioned schemas in a registry
- Event evolution follows additive-only patterns
- Event upcasting required for schema migrations
- Event replay compatibility verified across versions

## Version Control Structure

### Branch Naming Convention
- **Feature branches**: `###-feature-name` (e.g., `001-user-management`, `002-invoice-processing`)
- **Main branch**: `main` - stable, production-ready code
- Each feature gets a sequential three-digit number prefix

### Semantic Commit Structure
Follow conventional commits specification with these types:

**Core Types:**
- `feat:` - New feature implementation
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code formatting, missing semicolons (no production code change)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks, dependency updates

**Domain-Specific Types:**
- `domain:` - Domain model changes (aggregates, entities, value objects)
- `event:` - Event schema changes or event sourcing modifications
- `infra:` - Infrastructure changes (CDK, AWS services configuration)
- `cqrs:` - Command or query handler modifications

**Examples:**
```
feat(accounting): add Swedish BAS chart of accounts support
fix(event-store): resolve DynamoDB partition key overflow
domain(invoice): add multi-currency support to invoice aggregate
event(payment): update PaymentProcessed schema to v2.1
infra(lambda): optimize memory allocation for high-volume handlers
cqrs(reporting): add consolidated balance sheet query
docs(constitution): update event sourcing compliance requirements
```

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Scope Guidelines:**
- Use bounded context names (accounting, invoicing, reporting, audit)
- Use technical layer names (domain, application, infrastructure)
- Use component names for frontend (dashboard, forms, charts)

### Constitutional Compliance in Commits
All commits must include constitutional compliance verification:
- Domain changes must reference affected aggregates
- Event changes must include schema version updates
- Infrastructure changes must maintain serverless-first principles
- TypeScript changes must maintain strict typing requirements

## Development Scripts

Key scripts available in `.specify/scripts/bash/`:
- `update-agent-context.sh claude` - Updates this CLAUDE.md file with current project context
- `create-new-feature.sh` - Sets up new feature directory structure
- `check-prerequisites.sh` - Validates development environment
- `setup-plan.sh` - Initializes implementation planning

## Performance Requirements

- **High Volume**: Handle thousands of daily transactions
- **Low Latency**: Sub-second response times for critical operations
- **Serverless Constraints**: Lambda cold start considerations
- **Scalability**: Automatic scaling with AWS managed services
