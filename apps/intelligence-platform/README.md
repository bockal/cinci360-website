# Cinci360 Intelligence Platform

Multi-tenant building intelligence application for persistent digital-twin knowledge.

## Building 001

**BLDG-001 — Cincinnati Rowing Club**

Matterport SID: `qM1n2tF3CAQ`

CRC is the first reference building and product-development environment.

## Product architecture

- One platform at `app.cinci360.com`
- One customer account can own many buildings
- Each building has persistent spatial, visual, document, asset, and conversation data
- Cloudflare Worker serves UI and API
- D1 stores relational records
- R2 stores processed MatterPak data, spatial indexes, panoramas, documents, and reports
- OpenAI provides evidence-grounded reasoning and voice
- PWA delivery lets clients add the app to a phone without an app-store release

## Building lifecycle

1. Create customer and building record
2. Attach Matterport SID
3. Process MatterPak / OBJ
4. Build spatial index
5. Precompute visual observations
6. Store evidence in D1/R2
7. Mark building `ready`
8. Invite users
9. Users ask the building by text or voice

The browser should never need to "build visual index" for a production customer. Building intelligence is prepared during ingestion and served as persistent evidence.
