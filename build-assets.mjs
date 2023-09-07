import { spawnSync } from "child_process";
import * as path from "path";

const blenderPath = process.argv[2];

const fileInWorkspace = (filename) =>
  path
    .normalize(
      path.join(path.dirname(new URL(import.meta.url).pathname), filename)
    )
    .slice(1);

process.chdir(blenderPath);

function runBlenderJpeg(sceneName, fileName) {
  spawnSync(
    "blender.exe",
    [
      "-b",
      fileInWorkspace("./assets.blend"),
      "-x",
      "0",
      "-o",
      `//assets/${fileName}_#.blender.png`,
      "-F",
      "PNG",
      "-S",
      sceneName,
      "-f",
      "1",
    ],
    {
      stdio: "inherit",
      shell: true,
    }
  );
}

runBlenderJpeg("d4", "d4");
runBlenderJpeg("d6", "d6");
runBlenderJpeg("d8", "d8");
runBlenderJpeg("d10", "d10");
runBlenderJpeg("d12", "d12");
runBlenderJpeg("d20", "d20");
