"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedImage = void 0;
var react_1 = __importDefault(require("react"));
var OptimizerSettings_1 = require("../OptimizerSettings");
function OptimizedImage(props) {
    if (!props.src)
        throw new Error("src must be provided");
    var width = parseInt(props.width || "0", 10);
    if (!width)
        throw new Error("width must be provided as pixel value");
    var minWidth = props.minWidth || OptimizerSettings_1.OptimizerSettings.DEFAULT_MIN_IMAGE_WIDTH;
    var scaleFactor = props.scaleFactor || OptimizerSettings_1.OptimizerSettings.DEFAULT_SCALE_FACTOR;
    scaleFactor = scaleFactor > 1.0 ? scaleFactor : ((scaleFactor == 1.0 || scaleFactor == 0.0) ? 1.5 : 1.0 / scaleFactor); // same as in ImageRequestHandler
    var endIdx = props.src.lastIndexOf('?');
    var srcPath = props.src.substring(0, endIdx < 0 ? props.src.length : endIdx); // src without query
    var fileExtension = srcPath.substring(srcPath.lastIndexOf('.') + 1);
    var fileExtensions = props.alternativeFileExtensions || OptimizerSettings_1.OptimizerSettings.FILE_EXTENSION_TO_ALTERNATIVES[fileExtension] || [];
    if (!fileExtensions.includes(fileExtension))
        fileExtensions.push(fileExtension);
    var sources = [];
    var w = width || 0;
    while (w >= minWidth) {
        var nextW = Math.round(w / scaleFactor);
        var isLast = nextW < minWidth;
        for (var _i = 0, fileExtensions_1 = fileExtensions; _i < fileExtensions_1.length; _i++) {
            var fe = fileExtensions_1[_i];
            sources.push(react_1.default.createElement("source", { key: w + fe, type: OptimizerSettings_1.OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[fe] || 'image/' + fe, srcSet: srcPath + '?w=' + w + '&f=' + fe, media: isLast ? undefined : '(min-width: ' + (props.extraHighResolution ? w / 2 : w) + 'px)' }));
        }
        w = nextW;
    }
    // fetchPriority is not supported by TSX yet
    var tags = {};
    if (props.fetchPriority)
        tags.fetchpriority = props.fetchPriority;
    return react_1.default.createElement("picture", null,
        sources,
        react_1.default.createElement("img", __assign({ className: props.className, style: props.style }, tags, { src: props.src, width: props.width, height: props.height || "auto", alt: props.alt, draggable: props.draggable, title: props.title, loading: props.loading })));
}
exports.OptimizedImage = OptimizedImage;
