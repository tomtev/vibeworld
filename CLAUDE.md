# VibeWorld Codebase Guide

## Build & Development Commands
- Dev server: `pnpm dev` or `nuxt dev`
- Build: `pnpm build` or `nuxt build`  
- Preview: `npx nuxthub preview`
- Deploy: `npx nuxthub deploy`
- Lint: `pnpm lint` or `eslint .`
- Typecheck: `pnpm typecheck` or `nuxt typecheck`

## Code Style Guidelines
- **Components**: Use Vue 3 `<script setup lang="ts">` with TypeScript
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Vue imports first, third-party libs next, local imports last
- **Types**: Define explicit TypeScript interfaces/types for all props and data
- **Error Handling**: Use try/catch for async operations, show user-friendly errors
- **Component Structure**: Script first, template last
- **3D Rendering**: Use TresJS (Vue wrapper for Three.js) conventions
- **State Management**: Use Vue's reactivity (ref, computed) and provide/inject
- **Formatting**: 2-space indentation, single quotes, semicolons required
- **Comments**: Add JSDoc comments for complex functions or non-obvious logic

This project is a Nuxt 3 application with TresJS for 3D voxel rendering.