import { readFile } from "node:fs/promises";
import path from "node:path";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const specPath = path.join(process.cwd(), "../../docs/openapi.yaml");
  let spec = "";
  try {
    spec = await readFile(specPath, "utf8");
  } catch {
    spec = "# OpenAPI spec not found\n\nSee docs/openapi.yaml in the repository root.";
  }

  return (
    <>
      <Nav />
      <main className="container">
        <div className="section-header">
          <h1>API 文档 · API Docs</h1>
          <a
            href="https://api.vibeking.dev/api/v1"
            className="btn btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            Live API
          </a>
        </div>
        <p className="lead">
          OpenAPI 3.1 contract for agents and the{" "}
          <code>npx skills add vibeking/skill</code> package.
        </p>
        <section className="card docs-spec">
          <pre>{spec}</pre>
        </section>
        <section className="section card">
          <h2>Quick start · 快速开始</h2>
          <ol className="docs-steps">
            <li>
              Install skill:{" "}
              <code>npx skills add vibeking/skill --skill vibeking-wish -g</code>
            </li>
            <li>
              Set <code>VIBEKING_API_KEY=vk_...</code> or use{" "}
              <code>~/.vibeking/credentials</code>
            </li>
            <li>
              Run <code>packages/skill/scripts/list-wishes.sh</code> to browse open wishes
            </li>
          </ol>
        </section>
      </main>
    </>
  );
}