const { spawn } = require("node:child_process");

const nextBin = require.resolve("next/dist/bin/next");
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-next.cjs <dev|build|start> [...args]");
  process.exit(1);
}

const env = {
  ...process.env,
  BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
  BROWSERSLIST_IGNORE_OLD_DATA: "true",
};

const shouldFilterLine = (line) =>
  line.includes("[baseline-browser-mapping] The data in this module is over two months old.");

const pipeWithFilter = (stream, target) => {
  let pending = "";

  stream.on("data", (chunk) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? "";

    for (const line of lines) {
      if (!shouldFilterLine(line)) {
        target.write(line + "\n");
      }
    }
  });

  stream.on("end", () => {
    if (pending && !shouldFilterLine(pending)) {
      target.write(pending + "\n");
    }
  });
};

const child = spawn(process.execPath, [nextBin, ...args], {
  env,
  stdio: ["inherit", "pipe", "pipe"],
});

pipeWithFilter(child.stdout, process.stdout);
pipeWithFilter(child.stderr, process.stderr);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
