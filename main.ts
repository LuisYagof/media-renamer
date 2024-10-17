import { renameFile } from "@/modules/file-manager.ts";
import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { resolve } from "@std/path";

async function main() {
  const args = parseArgs(Deno.args);
  const targetPath = args._[0] as string;

  if (!targetPath) {
    console.error("Please provide a file or directory path");
    Deno.exit(1);
  }

  const resolvedPath = resolve(targetPath);
  const fileInfo = await Deno.stat(resolvedPath);

  if (fileInfo.isDirectory) {
    for await (
      const entry of walk(resolvedPath, {
        exts: [".mp4", ".mkv", ".avi"],
      })
    ) {
      if (entry.isFile) {
        await renameFile(entry.path);
      }
    }
  } else if (fileInfo.isFile) {
    await renameFile(resolvedPath);
  } else {
    console.error("The provided path is neither a file nor a directory");
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
