#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { exit } from "node:process";

const filePaths = process.argv.slice(2);
let hasError = false;

for (const file of filePaths) {
  try {
    const content = readFileSync(file, "utf8");
    if (content.includes("<img ")) {
      if (
        file.includes(".docs/") ||
        file.toLowerCase().includes("icon") ||
        file.toLowerCase().includes("svg")
      ) {
        continue;
      }
      console.error(
        `Raw <img> tag detected in ${file}. Use <OptimisedPicture> or <Image> instead.`
      );
      hasError = true;
    }
  } catch (err) {
    console.error(`Could not read file ${file}:`, err);
    hasError = true;
  }
}

if (hasError) exit(1); 