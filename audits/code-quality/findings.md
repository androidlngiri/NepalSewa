# Code Quality Audit — Findings

| ID   | Finding                                                             | Severity | Status |
|------|---------------------------------------------------------------------|----------|--------|
| CQ1  | Unused deps bloating node_modules (recharts, uuid, shadcn in deps)  | Low      | Done   |
| CQ2  | Missing @types/bcryptjs causing implicit-any on bcrypt imports      | Medium   | Done   |
| CQ4  | console.error used in 27 API/files — not production-safe            | Medium   | Done   |
| CQ8  | Missing stable keys in 17 files causing React re-render warnings    | Medium   | Done   |
| CQ9  | Duplicate SessionProvider.tsx file causing confusion                | Low      | Done   |
| CQ10 | Broken footer links pointing to non-existent pages                  | Medium   | Done   |
| CQ12 | Missing next.config.ts prevents custom image domains & headers      | Medium   | Done   |
