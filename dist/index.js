"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakoyakiServer = void 0;
const ts = __importStar(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TakoyakiServer {
    constructor() { }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseDir = path_1.default.resolve("./", process.argv[2] || "");
                if (!fs_1.default.existsSync(baseDir)) {
                    console.error(`${baseDir} doesn't exists`);
                    process.exit(0);
                }
                const distDir = path_1.default.resolve(baseDir, "dist");
                const options = {
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
                options.compilerOptions.outDir = path_1.default.resolve(baseDir, "dist");
                options.compilerOptions.rootDir = path_1.default.resolve(baseDir);
                const host = ts.createCompilerHost(options);
                host.writeFile = (fileName, contents) => {
                    const targetPath = fileName.replace(baseDir, distDir);
                    const targetDir = path_1.default.dirname(targetPath);
                    if (!fs_1.default.existsSync(targetDir))
                        fs_1.default.mkdirSync(targetDir, { recursive: true });
                    fs_1.default.writeFileSync(targetPath, contents);
                };
                let program = ts.createProgram([path_1.default.resolve(baseDir, "index.ts")], options, host);
                let emitResult = program.emit();
                let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
                allDiagnostics.forEach((diagnostic) => {
                    if (diagnostic.file) {
                        let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                    }
                    else {
                        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
                    }
                });
                // load the script
                const indexJSPath = path_1.default.resolve(distDir, "index.js");
                if (!fs_1.default.existsSync(indexJSPath)) {
                    console.error("Compile failed");
                    process.exit(0);
                }
                const indesJS = yield Promise.resolve().then(() => __importStar(require(indexJSPath)));
                // run the script
                indesJS.default();
            }
            catch (e) {
                console.error(e);
            }
        });
    }
}
exports.TakoyakiServer = TakoyakiServer;
//# sourceMappingURL=index.js.map