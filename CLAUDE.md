# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev       # dev server with watch
npm run build           # compile TypeScript
npm run lint            # ESLint + auto-fix
npm run format          # Prettier format
npm run test            # unit tests (Jest)
npm run test:watch      # unit tests in watch mode
npm run test:e2e        # e2e tests
npm run test:cov        # coverage report
```

Run single test file:
```bash
npx jest src/users/users.service.spec.ts
```

## Environment Variables

Requires `.env` at project root. All vars typed in `src/env.model.ts`:

| Var | Description |
|-----|-------------|
| `PORT` | HTTP port |
| `DB_HOST` | Postgres host |
| `DB_PORT` | Postgres port |
| `DB_USER` | Postgres user |
| `DB_PASSWORD` | Postgres password |
| `DB_NAME` | Database name |

## Architecture

NestJS REST API backed by PostgreSQL via TypeORM. `synchronize: true` is active — schema auto-syncs from entities on start (dev only, not for production).

**Global setup** (`src/main.ts`): `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — all DTOs are strictly validated, extra fields rejected.

**Module structure** — feature modules own their entities, DTOs, service, and controller:

```
src/
  app.module.ts          # root: ConfigModule (global) + TypeOrmModule + feature modules
  env.model.ts           # typed Env interface for ConfigService
  users/
    entities/            # TypeORM entities (DB schema source of truth)
    dtos/                # class-validator DTOs (CreateUserDto, UpdateUserDto, etc.)
    models/              # plain TS models/interfaces (not DB entities)
    users.module.ts
    users.controller.ts  # REST endpoints
    users.service.ts     # business logic + repository access
```

**Data model**: `User` ↔ `Profile` one-to-one (`User` owns FK `profile_id`). Cascade create/delete flows from `User`. Passwords hashed with bcrypt (10 salt rounds) in service before persist.

**DTO pattern**: `CreateUserDto` uses `@ValidateNested` + `@Type` for nested `CreateProfileDto`. `UpdateUserDto` extends `PartialType(OmitType(CreateUserDto, ['profile']))` and adds optional `UpdateProfileDto`.

When adding a new feature module, register its entities in `TypeOrmModule.forFeature([...])` inside the feature module — `autoLoadEntities: true` in root picks them up automatically.
