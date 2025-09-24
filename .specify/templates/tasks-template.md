# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.py
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T008 [P] Domain aggregate in src/domain/user-aggregate.ts
- [ ] T009 [P] Domain events in events/user-events.ts
- [ ] T010 [P] Command handlers in src/application/user-commands.ts
- [ ] T011 [P] Query handlers in src/application/user-queries.ts
- [ ] T012 [P] Event store repository in src/infrastructure/user-repository.ts
- [ ] T013 POST /api/users Lambda handler in src/handlers/create-user.ts
- [ ] T014 GET /api/users/{id} Lambda handler in src/handlers/get-user.ts
- [ ] T015 Input validation with TypeScript schemas
- [ ] T016 Error handling and structured logging

## Phase 3.4: Integration
- [ ] T017 DynamoDB event store setup with CDK
- [ ] T018 EventBridge configuration for event publishing
- [ ] T019 API Gateway integration with Lambda functions
- [ ] T020 Cognito authentication integration
- [ ] T021 CloudWatch logging and monitoring setup

## Phase 3.5: Polish
- [ ] T022 [P] Unit tests for domain aggregates in tests/unit/test-aggregates.ts
- [ ] T023 [P] Event sourcing replay tests in tests/integration/test-replay.ts
- [ ] T024 Performance tests for Lambda cold starts (<1000ms)
- [ ] T025 [P] Update OpenAPI documentation
- [ ] T026 Remove code duplication and optimize bundle size
- [ ] T027 Run end-to-end testing scenarios

## Dependencies
- Tests (T004-T007) before implementation (T008-T016)
- T008 (aggregates) blocks T010, T012 (command/query handlers)
- T009 (events) blocks T012 (event store repository)
- T017-T021 (infrastructure) before polish (T022-T027)
- Event store (T017) blocks handler integration (T019)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Domain Model**:
   - Each aggregate → domain aggregate task [P]
   - Domain events → event schema task [P]
   - Commands → command handler task [P]
   - Queries → query handler task [P]

2. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → Lambda handler task

3. **From Event Sourcing**:
   - Event store → repository implementation task
   - Event replay → integration test task [P]
   - Event schemas → validation task [P]

4. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → end-to-end test tasks

5. **Ordering**:
   - Setup → Tests → Domain → Application → Infrastructure → Handlers → Polish
   - Event sourcing dependencies: Aggregates → Events → Handlers → Store

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All domain aggregates have corresponding tests
- [ ] All domain events have schema validation tasks
- [ ] All command handlers have unit tests
- [ ] All query handlers have contract tests
- [ ] Event sourcing replay tests are included
- [ ] Lambda handlers have integration tests
- [ ] Infrastructure tasks include CDK deployment
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task