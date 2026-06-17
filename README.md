# Egocentric Marketplace

POV video data marketplace for AI and robotics labs.

## Structure

```
apps/
  web/          Next.js marketplace frontend
  companion/    React Native craftsman app
  admin/        Admin dashboard
services/
  api/          Node.js / TypeScript API
  pipeline/     Python processing pipeline (redaction, enrichment)
packages/
  shared-types/ Shared TypeScript types
  db/           Database schema and migrations
infra/
  docker/       Docker configs
  terraform/    AWS infrastructure
```
