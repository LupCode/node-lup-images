import ImageOptimizer from "./ImageOptimizer";
import ImageRequestHandler from "./ImageRequestHandler";
import OptimizedImage from "./OptimizedImage";

export {
    ImageOptimizer,
    ImageRequestHandler,
    OptimizedImage,
}

export let DEFAULT_HTTP_CACHE_SEC = 3600; // 1 day
export let DEFAULT_CACHE_DIRECTORY_PATH = "./cache";
export let DEFAULT_MAX_CACHE_SIZE_MB = 1000; // 1GB
export let DEFAULT_MIN_IMAGE_WIDTH = 32;
export let DEFAULT_MAX_IMAGE_WIDTH = 4096; // 4K
export let DEFAULT_SCALE_FACTOR = 1.5;

export let FILE_EXTENSION_TO_MIME_TYPE: {[key: string]: string} = {
    "avif": "image/avif",
    "jpg": "image/jpeg",
    "webp": "image/webp",
    "png": "image/png",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "tiff": "image/tiff",
    "tif": "image/tiff",
    "heif": "image/heif",
};
export let FILE_EXTENSION_TO_ALTERNATIVES: {[key: string]: string[]} = {
    "avif": ["webp", "png"],
    "jpg": ["avif", "webp"],
    "webp": ["avif", "png"],
    "png": ["avif", "webp"],
    "gif": [],
    "svg": [],
    "ico": ["avif", "webp", "png"],
    "tiff": ["avif", "webp", "png"],
    "tif": ["avif", "webp", "png"],
};

const LupImage = {
    DEFAULT_HTTP_CACHE_SEC,
    DEFAULT_CACHE_DIRECTORY_PATH,
    DEFAULT_MAX_CACHE_SIZE_MB,
    DEFAULT_MIN_IMAGE_WIDTH,
    DEFAULT_MAX_IMAGE_WIDTH,
    DEFAULT_SCALE_FACTOR,
    FILE_EXTENSION_TO_MIME_TYPE,
    FILE_EXTENSION_TO_ALTERNATIVES,

    ImageOptimizer,
    ImageRequestHandler,
    OptimizedImage,
};
export default LupImage;