import { parseArgs } from "@std/cli";
import { load } from "@std/dotenv";
import { walk } from "@std/fs";
import { basename, extname, join, resolve } from "@std/path";
import type { Cast, MediaInfo } from "./types/tmdb.types.ts";

const env = await load({
  envPath: "./env/.env",
  examplePath: "./env/.env.template",
});
const TMDB_API_KEY = env["TMDB_API_KEY"] || Deno.env.get("TMDB_API_KEY");
const TMDB_API_BASE = "https://api.themoviedb.org/3";
if (!TMDB_API_KEY) {
  console.error(
    "TMDB_API_KEY not found in environment variables. Please set it in your .env file.",
  );
  Deno.exit(1);
}

async function getDirector(movieId: number): Promise<string> {
  const creditsUrl =
    `${TMDB_API_BASE}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
  const response = await fetch(creditsUrl);
  const data = await response.json();
  const director = data.crew.find((person: Cast) => person.job === "Director");
  return director ? director.name : "Unknown";
}

async function searchTMDB(
  query: string,
  type: "movie" | "tv",
): Promise<MediaInfo | null> {
  const searchUrl =
    `${TMDB_API_BASE}/search/${type}?api_key=${TMDB_API_KEY}&query=${
      encodeURIComponent(query)
    }`;
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const result = data.results[0];
    if (type === "movie") {
      const director = await getDirector(result.id);
      return {
        title: result.title,
        year: result.release_date.split("-")[0],
        director: director,
      };
    } else {
      return {
        title: result.name,
        year: result.first_air_date.split("-")[0],
      };
    }
  }
  return null;
}

function parseFileName(
  fileName: string,
): { name: string; type: "movie" | "tv" } {
  // TODO: Implement logic to guess if it's a movie or TV show based on file name

  // Remove the file extension
  const nameWithoutExtension = fileName.slice(0, -extname(fileName).length);

  if (
    nameWithoutExtension.toLowerCase().includes("s0") &&
    nameWithoutExtension.toLowerCase().includes("e0")
  ) {
    return { name: nameWithoutExtension.split("S0")[0].trim(), type: "tv" };
  }
  return { name: nameWithoutExtension, type: "movie" };
}

async function renameFile(filePath: string): Promise<void> {
  const originalName = basename(filePath);
  const { name, type } = parseFileName(originalName);

  const mediaInfo = await searchTMDB(name, type);
  if (!mediaInfo) {
    console.log(`Could not find information for: ${originalName}`);
    return;
  }

  let newName = "";
  if (type === "movie") {
    newName = `${mediaInfo.title} (${mediaInfo.year}) ${mediaInfo.director}${
      extname(filePath)
    }`;
  } else {
    // TODO: For TV shows, you'll need to implement episode-specific naming
    newName = `${mediaInfo.title} - S01E01 - Episode Name${extname(filePath)}`;
  }

  const newPath = join(Deno.cwd(), newName);
  await Deno.rename(filePath, newPath);
  console.log(`Renamed: ${originalName} -> ${newName}`);
}

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
