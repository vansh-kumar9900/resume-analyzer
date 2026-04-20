import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";

// Reads uploaded file into plain text and removes temp file
export async function fileToText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".txt") {
      return await fs.readFile(filePath, "utf8");
    }

    if (ext === ".pdf") {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    return "";
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
}
