export const OptimizerSettings: {
    DEFAULT_HTTP_CACHE_SEC: number;
    DEFAULT_CACHE_DIRECTORY_PATH: string;
    DEFAULT_MAX_CACHE_SIZE_MB: number;
    DEFAULT_MIN_IMAGE_WIDTH: number;
    DEFAULT_MAX_IMAGE_WIDTH: number;
    DEFAULT_SCALE_FACTOR: number;
    FILE_EXTENSION_TO_MIME_TYPE: {[key: string]: string},
    FILE_EXTENSION_TO_ALTERNATIVES: {[key: string]: string[]},
} = {
    
    DEFAULT_HTTP_CACHE_SEC: 3600,

    DEFAULT_CACHE_DIRECTORY_PATH: "./cache",

    DEFAULT_MAX_CACHE_SIZE_MB: 1000,

    DEFAULT_MIN_IMAGE_WIDTH: 32,

    DEFAULT_MAX_IMAGE_WIDTH: 4096,

    DEFAULT_SCALE_FACTOR: 1.5,

    FILE_EXTENSION_TO_MIME_TYPE: {
        "avif": "image/avif",
        "jpg": "image/jpeg",
        "webp": "image/webp",
        "png": "image/png",
        "ico": "image/x-icon",
        "tiff": "image/tiff",
        "tif": "image/tiff",
        "heif": "image/heif",
    },

    FILE_EXTENSION_TO_ALTERNATIVES: {
        "avif": ["webp", "png"],
        "jpg": ["avif", "webp"],
        "webp": ["avif", "png"],
        "png": ["avif", "webp"],
        "ico": ["avif", "webp", "png"],
        "tiff": ["avif", "webp", "png"],
        "tif": ["avif", "webp", "png"],
    },
};