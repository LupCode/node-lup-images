/// <reference types="node" />
import { ImageStorage } from "./ImageStorage";
export type ImageInfo = {
    imageData: Buffer;
    format: string;
    mimeType: string;
};
export type PrerenderOptions = {
    /** Subdirectories to prerender (relative to srcDir) [Defaults to '.' to render all whole srcDir] */
    subDirs?: string | string[];
    /** Factor to scale images by (multiplier applied to width and height for each step) [Defaults to 1.5] */
    scaleFactor?: number;
    /** If subdirectories should be recursively prerendered too (Defaults to true) */
    recursive?: boolean;
    /** List of relative path prefixes starting inside srcDir that should not be optimized.
     * Subdirectories starting with underscore '_' won't be optimized.
     * Defaults to ["./favicons"].
     */
    exlucePrefixes?: string[];
    /** If true, the start and end of the pre-rendering process will be logged (because takes up high hardware utilization).
     * Defaults to true.
     */
    message?: boolean;
};
export type ImageConverterOptions = {
    /** Minimum pixel width of image to generate / cache.
     * Defaults to 32.
     */
    minImageWidth?: number;
    /** Maxmimum pixel width of image to generate / cache.
     * Defaults to 4096 (4K).
     */
    maxImageWidth?: number;
};
export declare class ImageConverter {
    readonly minImageWidth: number;
    readonly maxImageWidth: number;
    constructor(options?: ImageConverterOptions);
    /**
     * Loads an image from the given file path, resizes it to the given width and converts it to the given format.
     * @param filePath Path to image file.
     * @param width Width in pixels of available space for image.
     * @param format Format of returned image.
     * @returns Promise that resolves to an object containing the image data, format and mime type.
     */
    convertImage(filePath: string, width: number, format: 'avif' | 'webp' | 'jpg' | 'png' | 'gif' | 'heif' | 'tiff' | 'tif'): Promise<ImageInfo>;
    private _collectImagesToConvert;
    private _prerender;
    /**
     * Pre-renders images in the given directory in all sizes and formats,
     * and stores them in the given storage.
     * @param storage Storage to store images in.
     * @param srcDir Path to directory that contains the images.
     * @param options Options for pre-rendering.
     */
    prerender(storage: ImageStorage, srcDir: string, options?: PrerenderOptions): Promise<void>;
}
