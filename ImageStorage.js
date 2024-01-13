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
exports.ImageInPlaceStorage = exports.ImageDirectoryStorage = exports.ImageCacheStorage = void 0;
var path_1 = __importDefault(require("path"));
var promises_1 = __importDefault(require("fs/promises"));
var _1 = require(".");
var lup_root_1 = require("lup-root");
/** Creates a directory with limited size containing the latest used formats. */
var ImageCacheStorage = /** @class */ (function () {
    function ImageCacheStorage(options) {
        this.cacheDir = path_1.default.resolve(lup_root_1.ROOT, options.cacheDir || _1.OptimizerSettings.DEFAULT_CACHE_DIRECTORY_PATH);
        this.cacheSize = (options.cacheSize || _1.OptimizerSettings.DEFAULT_MAX_CACHE_SIZE_MB) * 1000000;
        this.cleanUpCache();
    }
    /**
     * Manually enforces cache cleanup.
     * In particular, this is useful if cache was manipulated manually.
     * By default this is called automatically when a new image is stored in the cache.
     */
    ImageCacheStorage.prototype.cleanUpCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, oldestFiles, dirSize;
            var _this = this;
            return __generator(this, function (_a) {
                promises = [];
                oldestFiles = {};
                dirSize = 0;
                promises_1.default.readdir(this.cacheDir).then(function (files) { return __awaiter(_this, void 0, void 0, function () {
                    var _loop_1, this_1, _i, files_1, file, keys, key, _a, filePath, size;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _loop_1 = function (file) {
                                    var filePath = path_1.default.resolve(this_1.cacheDir, file);
                                    promises.push(promises_1.default.stat(filePath).then(function (stats) {
                                        var time = stats.atimeMs; // access time
                                        while (oldestFiles[time])
                                            time++;
                                        oldestFiles[time] = { filePath: filePath, size: stats.size };
                                        dirSize = dirSize + stats.size;
                                    }));
                                };
                                this_1 = this;
                                for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                    file = files_1[_i];
                                    _loop_1(file);
                                }
                                // wait for all files being read
                                return [4 /*yield*/, Promise.all(promises)];
                            case 1:
                                // wait for all files being read
                                _b.sent();
                                keys = Object.keys(oldestFiles).sort();
                                while (dirSize > this.cacheSize && keys.length > 0) {
                                    key = keys.splice(0, 1)[0];
                                    _a = oldestFiles[key], filePath = _a.filePath, size = _a.size;
                                    dirSize = dirSize - size;
                                    promises_1.default.rm(filePath, { force: true });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); }).catch(function () { });
                return [2 /*return*/];
            });
        });
    };
    ImageCacheStorage.prototype.getCacheFilePath = function (filePath, width, format) {
        return path_1.default.resolve(this.cacheDir, filePath.substring(lup_root_1.ROOT.length + 1).replaceAll('\\', '--').replaceAll('/', '--') + '-' + width + 'w.' + format);
    };
    ImageCacheStorage.prototype.getLastModified = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheFile;
            return __generator(this, function (_a) {
                cacheFile = this.getCacheFilePath(filePath, width, format);
                return [2 /*return*/, promises_1.default.stat(cacheFile).then(function (stats) { return stats.mtimeMs; }).catch(function () { return null; })];
            });
        });
    };
    ImageCacheStorage.prototype.getImage = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var originalFileInfo, cacheFile, cachedFileInfo, imageData, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.stat(filePath)];
                    case 1:
                        originalFileInfo = _a.sent();
                        cacheFile = this.getCacheFilePath(filePath, width, format);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, promises_1.default.stat(cacheFile)];
                    case 3:
                        cachedFileInfo = _a.sent();
                        if (!(cachedFileInfo.mtime >= originalFileInfo.mtime)) return [3 /*break*/, 5];
                        return [4 /*yield*/, promises_1.default.readFile(cacheFile)];
                    case 4:
                        imageData = _a.sent();
                        return [2 /*return*/, { imageData: imageData, format: format, mimeType: (_1.OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/' + format) }];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        ex_1 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, null];
                }
            });
        });
    };
    ImageCacheStorage.prototype.putImage = function (filePath, width, format, imageData) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheFile = this.getCacheFilePath(filePath, width, format);
                        return [4 /*yield*/, promises_1.default.mkdir(this.cacheDir, { recursive: true }).then(function () { return promises_1.default.writeFile(cacheFile, imageData || Buffer.alloc(0)); })];
                    case 1:
                        _a.sent();
                        this.cleanUpCache();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ImageCacheStorage;
}());
exports.ImageCacheStorage = ImageCacheStorage;
var ImageDirectoryStorage = /** @class */ (function () {
    function ImageDirectoryStorage(options) {
        this.dirPath = path_1.default.resolve(lup_root_1.ROOT, options.dirPath);
    }
    ImageDirectoryStorage.prototype.getStoreFilePath = function (filePath, width, format, create) {
        return __awaiter(this, void 0, void 0, function () {
            var relFilePath, idx, absFilePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        relFilePath = filePath.substring(lup_root_1.ROOT.length + 1);
                        idx = relFilePath.length - path_1.default.extname(relFilePath).length;
                        absFilePath = path_1.default.resolve(this.dirPath, relFilePath.substring(0, idx) + '-' + width + 'w.' + format);
                        if (!create) return [3 /*break*/, 2];
                        return [4 /*yield*/, promises_1.default.mkdir(absFilePath.substring(0, absFilePath.length - path_1.default.basename(absFilePath).length), { recursive: true }).catch(function (err) { console.error(err); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, absFilePath];
                }
            });
        });
    };
    ImageDirectoryStorage.prototype.getLastModified = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var storedFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStoreFilePath(filePath, width, format, false)];
                    case 1:
                        storedFile = _a.sent();
                        return [2 /*return*/, promises_1.default.stat(storedFile).then(function (stats) { return stats.mtimeMs; }).catch(function () { return null; })];
                }
            });
        });
    };
    ImageDirectoryStorage.prototype.getImage = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var originalFileInfo, storedFile, storeFileInfo, imageData, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.stat(filePath)];
                    case 1:
                        originalFileInfo = _a.sent();
                        return [4 /*yield*/, this.getStoreFilePath(filePath, width, format, false)];
                    case 2:
                        storedFile = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, promises_1.default.stat(storedFile)];
                    case 4:
                        storeFileInfo = _a.sent();
                        if (!(storeFileInfo.mtime >= originalFileInfo.mtime)) return [3 /*break*/, 6];
                        return [4 /*yield*/, promises_1.default.readFile(storedFile)];
                    case 5:
                        imageData = _a.sent();
                        return [2 /*return*/, { imageData: imageData, format: format, mimeType: (_1.OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/' + format) }];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        ex_2 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, null];
                }
            });
        });
    };
    ImageDirectoryStorage.prototype.putImage = function (filePath, width, format, imageData) {
        return __awaiter(this, void 0, void 0, function () {
            var storeFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStoreFilePath(filePath, width, format, true)];
                    case 1:
                        storeFile = _a.sent();
                        return [4 /*yield*/, promises_1.default.writeFile(storeFile, imageData || Buffer.alloc(0))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ImageDirectoryStorage;
}());
exports.ImageDirectoryStorage = ImageDirectoryStorage;
/** For each image creates a subdirectory in place that will contain all the different formats. */
var ImageInPlaceStorage = /** @class */ (function () {
    function ImageInPlaceStorage() {
    }
    ImageInPlaceStorage.prototype._getStorageFilePath = function (filePath, width, format, create) {
        return __awaiter(this, void 0, void 0, function () {
            var parentDir, fileName, extIdx, dirName, dirPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentDir = path_1.default.resolve(filePath, '..');
                        fileName = path_1.default.basename(filePath);
                        extIdx = fileName.lastIndexOf('.');
                        dirName = '_' + ((extIdx < 0 ? fileName : fileName.substring(0, extIdx)) || 'prerender');
                        dirPath = path_1.default.resolve(parentDir, dirName);
                        if (!create) return [3 /*break*/, 2];
                        return [4 /*yield*/, promises_1.default.mkdir(dirPath, { recursive: true }).catch(function (err) { console.error(err); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, path_1.default.resolve(dirPath, Math.round(width) + 'w.' + format)];
                }
            });
        });
    };
    ImageInPlaceStorage.prototype.getLastModified = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getStorageFilePath(filePath, width, format, false)];
                    case 1:
                        cacheFile = _a.sent();
                        return [2 /*return*/, promises_1.default.stat(cacheFile).then(function (stats) { return stats.mtimeMs; }).catch(function () { return null; })];
                }
            });
        });
    };
    ImageInPlaceStorage.prototype.getImage = function (filePath, width, format) {
        return __awaiter(this, void 0, void 0, function () {
            var originalFileInfo, cacheFile, cachedFileInfo, imageData, ex_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.stat(filePath)];
                    case 1:
                        originalFileInfo = _a.sent();
                        return [4 /*yield*/, this._getStorageFilePath(filePath, width, format, false)];
                    case 2:
                        cacheFile = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, promises_1.default.stat(cacheFile)];
                    case 4:
                        cachedFileInfo = _a.sent();
                        if (!(cachedFileInfo.mtime >= originalFileInfo.mtime)) return [3 /*break*/, 6];
                        return [4 /*yield*/, promises_1.default.readFile(cacheFile)];
                    case 5:
                        imageData = _a.sent();
                        return [2 /*return*/, { imageData: imageData, format: format, mimeType: (_1.OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/' + format) }];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        ex_3 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, null];
                }
            });
        });
    };
    ImageInPlaceStorage.prototype.putImage = function (filePath, width, format, imageData) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getStorageFilePath(filePath, width, format, true)];
                    case 1:
                        cacheFile = _a.sent();
                        return [4 /*yield*/, promises_1.default.writeFile(cacheFile, imageData || Buffer.alloc(0))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ImageInPlaceStorage;
}());
exports.ImageInPlaceStorage = ImageInPlaceStorage;
