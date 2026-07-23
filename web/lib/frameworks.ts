import catalog from "../../contracts/frameworks.json";
import type { Framework } from "./types";

export const frameworks = catalog.frameworks as Framework[];

export function getFramework(id: string): Framework {
  return frameworks.find((item) => item.id === id) ?? frameworks[0];
}

export function label(value: string): string {
  const labels: Record<string, string> = {
    none: "None",
    css: "Modern CSS",
    tailwind: "Tailwind CSS",
    sqlite: "SQLite",
    postgresql: "PostgreSQL",
    mysql: "MySQL",
    mongodb: "MongoDB",
    sqlserver: "SQL Server",
    h2: "H2",
    jwt: "JWT",
    session: "Session",
    pip: "pip",
    maven: "Maven",
    composer: "Composer",
    bundler: "Bundler",
    dotnet: ".NET CLI"
  };
  return labels[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}
