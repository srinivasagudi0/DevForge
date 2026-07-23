export type Framework = {
  id: string;
  name: string;
  category: string;
  icon: string;
  packageManagers: string[];
  databases: string[];
  auth: string[];
  styling: string[];
};

export type ProjectBrief = {
  projectName: string;
  description: string;
  frameworkId: string;
  features: string[];
  database: string;
  auth: string;
  packageManager: string;
  styling: string;
  testLevel: "unit" | "unit-integration";
  docker: boolean;
  ci: boolean;
};

export type GeneratedFile = {
  path: string;
  content: string;
};

export type Blueprint = {
  summary: string;
  architecture: string[];
  gettingStarted: string[];
  decisions: string[];
  nextSteps: string[];
};

export type GenerateResponse = {
  blueprint: Blueprint;
  files: GeneratedFile[];
  fileTree: string[];
  warnings: string[];
  generation: {
    aiStatus: "generated" | "fallback";
    model: string;
    fileCount: number;
    totalBytes: number;
  };
};
