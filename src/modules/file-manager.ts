import { searchTMDB } from "@/modules/tmdb.ts";
import { basename, dirname, extname, join } from "@std/path";

export async function renameFile(filePath: string): Promise<void> {
    const originalName = basename(filePath);
    const { name, type } = parseFileName(originalName);

    const mediaInfo = await searchTMDB(name, type);
    if (!mediaInfo) {
        console.log(`Could not find information for: ${originalName}`);
        return;
    }

    let newName = "";
    if (type === "movie") {
        newName =
            `${mediaInfo.title} (${mediaInfo.year}) ${mediaInfo.director}${
                extname(filePath)
            }`;
    } else {
        // TODO: For TV shows, you'll need to implement episode-specific naming
        newName = `${mediaInfo.title} - S01E01 - Episode Name${
            extname(filePath)
        }`;
    }

    const originalDirectory = dirname(filePath);
    const newPath = join(originalDirectory, newName);
    await Deno.rename(filePath, newPath);
    console.log(`Renamed: ${originalName} -> ${newName}`);
}

function parseFileName(
    fileName: string,
): { name: string; type: "movie" | "tv" } {
    // TODO: Implement logic to guess if it's a movie or TV show based on file name

    const nameWithoutExtension = fileName.slice(0, -extname(fileName).length);

    if (
        nameWithoutExtension.toLowerCase().includes("s0") &&
        nameWithoutExtension.toLowerCase().includes("e0")
    ) {
        return { name: nameWithoutExtension.split("S0")[0].trim(), type: "tv" };
    }
    return { name: nameWithoutExtension, type: "movie" };
}
