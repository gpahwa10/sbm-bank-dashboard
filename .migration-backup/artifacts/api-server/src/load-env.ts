import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Repo-root `.env` (works when running bundled `dist/index.mjs` — `import.meta.url` is that file).
const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(here, "../../../.env") });
