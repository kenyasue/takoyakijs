import * as ts from "typescript";
import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";

export class TakoyakiServer {
    constructor() {}

    async run() {
        try {
            const baseDir: string = path.resolve("./", process.argv[2] || "");

            if (!fs.existsSync(baseDir)) {
                console.error(`${baseDir} doesn't exists`);
                process.exit(0);
            }

            const distDir: string = path.resolve(baseDir, "dist");

            const options: any = {
                compilerOptions: {
                    target: "ES2015",
                    jsx: "react",
                    module: "commonjs",
                    moduleResolution: "node",
                    resolveJsonModule: true,
                    allowJs: true,
                    sourceMap: true,
                    outDir: "dist",
                    downlevelIteration: true,
                    isolatedModules: true,
                    allowSyntheticDefaultImports: true,
                    esModuleInterop: true,
                    forceConsistentCasingInFileNames: true,
                    strict: true,
                    strictNullChecks: false,
                    skipLibCheck: true,
                    rootDir: "./",
                },
                include: ["./**/*.ts"],
            };

            options.compilerOptions.outDir = path.resolve(baseDir, "dist");
            options.compilerOptions.rootDir = path.resolve(baseDir);

            const host = ts.createCompilerHost(options);
            host.writeFile = (fileName: string, contents: string) => {
                const targetPath = fileName.replace(baseDir, distDir);
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                fs.writeFileSync(targetPath, contents);
            };

            let program = ts.createProgram([path.resolve(baseDir, "index.ts")], options, host);
            let emitResult = program.emit();

            let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

            allDiagnostics.forEach((diagnostic) => {
                if (diagnostic.file) {
                    let { line, character } = ts.getLineAndCharacterOfPosition(
                        diagnostic.file,
                        diagnostic.start!
                    );
                    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                    console.log(
                        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
                    );
                } else {
                    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
                }
            });

            // load the script
            const indexJSPath = path.resolve(distDir, "index.js");
            if (!fs.existsSync(indexJSPath)) {
                console.error("Compile failed");
                process.exit(0);
            }

            const indesJS: { default: () => void } = await import(indexJSPath);

            // run the script
            indesJS.default();
        } catch (e) {
            console.error(e);
        }
    }
}
