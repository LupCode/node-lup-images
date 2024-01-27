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
exports.PrerenderImages = exports.ImageRequestHandler = void 0;
var path_1 = __importDefault(require("path"));
var lup_root_1 = require("lup-root");
var ImageConverter_1 = require("./ImageConverter");
var index_1 = require("./index");
var ImageStorage_1 = require("./ImageStorage");
/**
 * Returns a request handler (req, res, next) => void that will serve optimized images.
 * It supports different search parameters:
 * - w: width in pixels of available space for image (default: 1024)
 * - f: format of returned image (jpg, png, webp, etc.)
 * @param options Options for image optimization
 * @returns Request handler that can be passed e.g. to express
 */
function ImageRequestHandler(options) {
    var _this = this;
    var scaleFactor = options.scaleFactor || index_1.OptimizerSettings.DEFAULT_SCALE_FACTOR;
    scaleFactor = scaleFactor > 1.0 ? scaleFactor : ((scaleFactor == 1.0 || scaleFactor == 0.0) ? 1.5 : 1.0 / scaleFactor); // same as in OptimizedImage
    var httpCacheSec = options.httpCacheTime != null ? options.httpCacheTime || index_1.OptimizerSettings.DEFAULT_HTTP_CACHE_SEC : null;
    var optimizer = new ImageConverter_1.ImageConverter(options);
    // storage for caching images
    var cacheStorage = options.cacheDir !== '' ? new ImageStorage_1.ImageCacheStorage({
        cacheDir: options.cacheDir,
        cacheSize: options.cacheSize,
    }) : null;
    // storage for pre-rendered images
    var prerenderStorage = !options.prerender ? null : (options.prerenderOutputDir !== '' ? new ImageStorage_1.ImageDirectoryStorage({
        dirPath: options.prerenderOutputDir || index_1.OptimizerSettings.DEFAULT_PREDENDER_OUTPUT_DIRECTORY,
    }) : new ImageStorage_1.ImageInPlaceStorage());
    // prerender images
    if (prerenderStorage) {
        optimizer.prerender(prerenderStorage, options.srcDir, {
            recursive: options.prerender,
            scaleFactor: scaleFactor,
            message: options.prerenderMessage,
        });
    }
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var fileName, searchIdx, filePath, width, idx, format, imageInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.query.f || !req.query.w) {
                        next();
                        return [2 /*return*/];
                    }
                    fileName = req.url.substring((options.uriPrefix || '').length + 1);
                    searchIdx = fileName.indexOf('?');
                    fileName = searchIdx >= 0 ? fileName.substring(0, searchIdx) : fileName;
                    filePath = path_1.default.resolve(lup_root_1.ROOT, options.srcDir, fileName);
                    width = parseInt(req.query.w || '', 10) || 1024;
                    idx = fileName.lastIndexOf(".");
                    format = (req.query.f.length > 0) ? req.query.f :
                        ((idx >= 0 && idx < fileName.length - 1) ? fileName.substring(idx + 1) : 'jpg');
                    if (!index_1.OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format]) {
                        next();
                        return [2 /*return*/];
                    }
                    imageInfo = null;
                    if (!prerenderStorage) return [3 /*break*/, 2];
                    return [4 /*yield*/, prerenderStorage.getImage(filePath, width, format)];
                case 1:
                    imageInfo = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(!imageInfo && cacheStorage)) return [3 /*break*/, 4];
                    return [4 /*yield*/, cacheStorage.getImage(filePath, width, format)];
                case 3:
                    imageInfo = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!!imageInfo) return [3 /*break*/, 6];
                    return [4 /*yield*/, optimizer.convertImage(filePath, width, format)];
                case 5:
                    imageInfo = _a.sent();
                    if (imageInfo && cacheStorage)
                        cacheStorage.putImage(filePath, width, format, imageInfo.imageData);
                    _a.label = 6;
                case 6:
                    // send image
                    if (imageInfo) {
                        if (httpCacheSec && httpCacheSec > 0)
                            res.set('Cache-control', 'public, max-age=' + httpCacheSec);
                        res.set('Content-type', imageInfo.mimeType);
                        res.send(imageInfo.imageData);
                    }
                    else {
                        next();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.ImageRequestHandler = ImageRequestHandler;
;
/**
 * Takes same input as ImageRequestHandler but pre-renders all images.
 * @param options Options of request handler (see ImageRequestHandler).
 * @returns Promise that resolves when pre-rendering is finished
 */
function PrerenderImages(options) {
    return __awaiter(this, void 0, void 0, function () {
        var optimizer, prerenderStorage;
        return __generator(this, function (_a) {
            optimizer = new ImageConverter_1.ImageConverter(options);
            prerenderStorage = options.prerenderOutputDir !== '' ? new ImageStorage_1.ImageDirectoryStorage({
                dirPath: options.prerenderOutputDir || index_1.OptimizerSettings.DEFAULT_PREDENDER_OUTPUT_DIRECTORY,
            }) : new ImageStorage_1.ImageInPlaceStorage();
            return [2 /*return*/, optimizer.prerender(prerenderStorage, options.srcDir, {
                    recursive: options.prerender,
                    scaleFactor: options.scaleFactor,
                    message: options.prerenderMessage,
                })];
        });
    });
}
exports.PrerenderImages = PrerenderImages;
