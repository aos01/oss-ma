# 1. Context

Date: {{date}}

## Status

Accepted

## Context

This project was bootstrapped with [@oss-ma/tpl](https://www.npmjs.com/package/@oss-ma/tpl) using the `react-next` template.

Stack:
- Next.js 15 with App Router
- TypeScript
- React 19{{#if state}}
- Zustand for state management{{/if}}{{#if fetching}}
- TanStack Query for data fetching{{/if}}

## Decision

We use Next.js App Router for its server component architecture, built-in routing, and excellent DX.

## Consequences

**Positive:**
- Server components by default → better performance
- File-system based routing → no react-router needed
- Built-in API routes and server actions
- Excellent TypeScript support

**Negative:**
- Learning curve for developers new to App Router
- Some third-party libraries may not support React Server Components yet