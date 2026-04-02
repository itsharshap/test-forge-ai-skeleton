---
applyTo: "**"
---

# MCP Context Rules — Confluence & Jira Integration

You have access to two MCP servers: **Confluence** and **Jira**.
These are your primary source of truth for GEMS requirements.

## MANDATORY: Pre-Generation Lookup

Before generating ANY of the following artifacts, you MUST query the Confluence MCP server:
- Feature files (`tests/features/*.feature`)
- Step definitions (`tests/steps/*.steps.ts`)
- Page Objects (`src/pages/*.page.ts`)
- Test data fixtures (`data/**/*.json`)

**Do not generate tests based on assumptions or prior training data.**
GEMS business rules change frequently. Always fetch the latest acceptance criteria.

## How to Use the Confluence MCP Server

1. **Find the relevant Confluence space**: GEMS documentation lives in the `GEMS` space.
2. **Search for acceptance criteria**: Use the MCP `search` tool with terms like:
   - `"wire transfer acceptance criteria"`
   - `"FX trade GEMS requirements"`
   - `"payment approval workflow GEMS"`
3. **Read the page content**: Use the MCP `get-page` tool with the page ID returned from search.
4. **Extract Given/When/Then scenarios** directly from the AC tables in Confluence.

## How to Use the Jira MCP Server

- Look up Jira tickets linked to the feature you are implementing for additional context.
- Use the `GEMS` project key when searching.
- Check the ticket's `Acceptance Criteria` field and any attached Figma links.

## Figma Specifications
- If a Confluence page or Jira ticket references a Figma link, retrieve the design spec before
  creating any `getByTestId()` or `getByRole()` locators to ensure alignment with the actual DOM.

## Configuration
MCP server credentials are stored as environment variables. See `.ai-config/mcp-servers.example.json`
for the required variable names. Copy this file to `.ai-config/mcp-servers.json` and populate your
`.env` file with the actual values. **Never commit real credentials.**
