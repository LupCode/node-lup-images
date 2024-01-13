"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageConverter = void 0;
var promises_1 = __importDefault(require("fs/promises"));
var sharp_1 = __importDefault(require("sharp"));
var index_1 = require("./index");
var path_1 = __importDefault(require("path"));
var ImageConverter = /** @class */ (function () {
    function ImageConverter(options) {
        if (options === void 0) { options = {}; }
        this.minImageWidth = options.minImageWidth || index_1.OptimizerSettings.DEFAULT_MIN_IMAGE_WIDTH;
        this.maxImageWidth = options.maxImageWidth || index_1.OptimizerSettings.DEFAULT_MAX_IMAGE_WIDTH;
    }
    /**
     * Loads an image from the given file path, resizes it to the given width and converts it to the given format.
     * @param filePath Path to image file.
     * @param width Width in pixels of available space for image.
     * @param format Format of returned image.
     * @returns Promise that resolves to an object containing the image data, format and mime type.
     */
    ImageConverter.prototype.convertImage = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var info, img, meta, needResize, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        width = Math.max(this.minImageWidth, Math.min(width, this.maxImageWidth));
                        info = null;
                        img = (0, sharp_1.default)(filePath).rotate();
                        return [4 /*yield*/, img.metadata().catch(function () { return null; })];
                    case 1:
                        meta = _b.sent();
                        needResize = !meta || !meta.width || meta.width > width;
                        img = needResize ? img.resize(width) : img; // resize
                        _a = format;
                        switch (_a) {
                            case 'avif': return [3 /*break*/, 2];
                            case 'webp': return [3 /*break*/, 4];
                            case 'jpg': return [3 /*break*/, 6];
                            case 'png': return [3 /*break*/, 8];
                            case 'gif': return [3 /*break*/, 10];
                            case 'heif': return [3 /*break*/, 12];
                            case 'tiff': return [3 /*break*/, 14];
                            case 'tif': return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 16];
                    case 2: return [4 /*yield*/, img.avif().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/avif' };
                        })];
                    case 3:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 4: return [4 /*yield*/, img.webp().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/jpg' };
                        })];
                    case 5:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 6: return [4 /*yield*/, img.jpeg().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/jpg' };
                        })];
                    case 7:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 8: return [4 /*yield*/, img.png().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/png' };
                        })];
                    case 9:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 10: return [4 /*yield*/, img.gif().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/gif' };
                        })];
                    case 11:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 12: return [4 /*yield*/, img.heif().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/gif' };
                        })];
                    case 13:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 14: return [4 /*yield*/, img.tiff().toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/gif' };
                        })];
                    case 15:
                        info = _b.sent();
                        return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, img.toBuffer().then(function (imageData) {
                            return { imageData: imageData, format: format, mimeType: 'image/' + format };
                        })];
                    case 17:
                        info = _b.sent();
                        _b.label = 18;
                    case 18:
                        if (!info)
                            throw new Error("Image could not be optimized");
                        return [2 /*return*/, info];
                }
            });
        });
    };
    ImageConverter.prototype._collectImagesToConvert = function (dirPath, excludeAbsolutePaths, recursive, first) {
        return __awaiter(this, void 0, void 0, function () {
            var i, stats, ext, altExts, info;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // check if dirPath should be excluded
                        for (i = 0; i < excludeAbsolutePaths.length; i++) {
                            if (dirPath.length >= excludeAbsolutePaths[i].length && dirPath.startsWith(excludeAbsolutePaths[i]))
                                return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, promises_1.default.stat(dirPath)];
                    case 1:
                        stats = _a.sent();
                        if (stats.isDirectory()) {
                            // dirPath is directory
                            if ((!first && !recursive) || path_1.default.basename(dirPath).startsWith('_'))
                                return [2 /*return*/, Promise.resolve([])];
                            return [2 /*return*/, promises_1.default.readdir(dirPath).then(function (fileNames) { return __awaiter(_this, void 0, void 0, function () {
                                    var promises, _i, fileNames_1, fileName, filePath;
                                    return __generator(this, function (_a) {
                                        promises = [];
                                        for (_i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                                            fileName = fileNames_1[_i];
                                            filePath = path_1.default.resolve(dirPath, fileName);
                                            promises.push(this._collectImagesToConvert(filePath, excludeAbsolutePaths, recursive, false));
                                        }
                                        return [2 /*return*/, Promise.all(promises).then(function (results) { return results.reduce(function (prev, curr) { return prev.concat(curr); }, []); }).catch(function () { return []; })];
                                    });
                                }); })];
                        }
                        else {
                            ext = path_1.default.extname(dirPath).substring(1);
                            altExts = index_1.OptimizerSettings.FILE_EXTENSION_TO_ALTERNATIVES[ext];
                            if (!altExts)
                                return [2 /*return*/, Promise.resolve([])];
                            info = {
                                filePath: dirPath,
                                altExts: altExts,
                            };
                            return [2 /*return*/, Promise.resolve([info])];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageConverter.prototype._prerender = function (storage, scaleFactor, dirPath, excludeAbsolutePaths, recursive) {
        return __awaiter(this, void 0, void 0, function () {
            var imagesToConvert, promises, _loop_1, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._collectImagesToConvert(dirPath, excludeAbsolutePaths, recursive, true)];
                    case 1:
                        imagesToConvert = _a.sent();
                        promises = [];
                        _loop_1 = function (i) {
                            var fileInfo = imagesToConvert[i];
                            promises.push(promises_1.default.stat(fileInfo.filePath).then(function (stats) { return __awaiter(_this, void 0, void 0, function () {
                                var originalLastModified, localPromises, img, meta, width, _loop_2, _i, _a, altExt;
                                var _this = this;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            originalLastModified = stats.mtimeMs;
                                            localPromises = [];
                                            img = (0, sharp_1.default)(fileInfo.filePath).rotate();
                                            return [4 /*yield*/, img.metadata().catch(function () { return null; })];
                                        case 1:
                                            meta = _b.sent();
                                            width = (meta === null || meta === void 0 ? void 0 : meta.width) || this.maxImageWidth;
                                            while (width >= this.minImageWidth) {
                                                if (width <= this.maxImageWidth) {
                                                    _loop_2 = function (altExt) {
                                                        var WIDTH = width;
                                                        var ALT_EXT = altExt;
                                                        localPromises.push(storage.getLastModified(fileInfo.filePath, WIDTH, ALT_EXT).then(function (lastModified) { return __awaiter(_this, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                if (lastModified == null || lastModified < originalLastModified) {
                                                                    return [2 /*return*/, this.convertImage(fileInfo.filePath, WIDTH, ALT_EXT).then(function (info) {
                                                                            return storage.putImage(fileInfo.filePath, WIDTH, ALT_EXT, info.imageData);
                                                                        })];
                                                                }
                                                                return [2 /*return*/];
                                                            });
                                                        }); }));
                                                    };
                                                    for (_i = 0, _a = fileInfo.altExts; _i < _a.length; _i++) {
                                                        altExt = _a[_i];
                                                        _loop_2(altExt);
                                                    }
                                                }
                                                width = Math.round(width / scaleFactor);
                                            }
                                            return [2 /*return*/, Promise.all(localPromises).then(function () { })];
                                    }
                                });
                            }); }));
                        };
                        for (i = 0; i < imagesToConvert.length; i++) {
                            _loop_1(i);
                        }
                        return [2 /*return*/, Promise.all(promises).then(function () { })];
                }
            });
        });
    };
    /**
     * Pre-renders images in the given directory in all sizes and formats,
     * and stores them in the given storage.
     * @param storage Storage to store images in.
     * @param srcDir Path to directory that contains the images.
     * @param options Options for pre-rendering.
     */
    ImageConverter.prototype.prerender = function (storage, srcDir, options) {
        return __awaiter(this, void 0, void 0, function () {
            var subDirs, scaleFactor, recursive, excludeAbsolutePaths, doMessage, startTime, promises, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subDirs = !(options === null || options === void 0 ? void 0 : options.subDirs) ? ['.'] : (Array.isArray(options === null || options === void 0 ? void 0 : options.subDirs) ? options === null || options === void 0 ? void 0 : options.subDirs : [options === null || options === void 0 ? void 0 : options.subDirs]);
                        scaleFactor = (options === null || options === void 0 ? void 0 : options.scaleFactor) || index_1.OptimizerSettings.DEFAULT_SCALE_FACTOR;
                        recursive = (options === null || options === void 0 ? void 0 : options.recursive) !== undefined ? options === null || options === void 0 ? void 0 : options.recursive : index_1.OptimizerSettings.DEFAULT_PRERENDER_RECURSIVELY;
                        excludeAbsolutePaths = ((options === null || options === void 0 ? void 0 : options.exlucePrefixes) || index_1.OptimizerSettings.DEFAULT_EXCLUDE_PREFIXES).map(function (p) { return path_1.default.resolve(srcDir, p); });
                        doMessage = (options === null || options === void 0 ? void 0 : options.message) !== undefined ? options === null || options === void 0 ? void 0 : options.message : index_1.OptimizerSettings.DEFAULT_PRERENDER_MESSAGE;
                        startTime = Date.now();
                        if (doMessage)
                            console.log("Start pre-rendering images in directory '" + srcDir + "'");
                        promises = [];
                        for (i = 0; i < subDirs.length; i++)
                            if (!subDirs[i].startsWith('_'))
                                promises.push(this._prerender(storage, scaleFactor, path_1.default.resolve(srcDir, subDirs[i]), excludeAbsolutePaths, recursive));
                        return [4 /*yield*/, Promise.all(promises).then(function () { })];
                    case 1:
                        _a.sent();
                        if (doMessage)
                            console.log("Finished pre-rendering images in directory '" + srcDir + "' after " + (Math.round((Date.now() - startTime) / 100) / 10) + "s");
                        return [2 /*return*/];
                }
            });
        });
    };
    return ImageConverter;
}());
exports.ImageConverter = ImageConverter;
