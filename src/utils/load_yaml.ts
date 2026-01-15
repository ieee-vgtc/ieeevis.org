// src/utils/loadYaml.ts
import fs from "node:fs";
import yaml from "yaml";
import path from "node:path";

export function load_yaml(filePath: string) {
  const fullPath = path.resolve(filePath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const data = yaml.parse(fileContents);
  return data;
}
