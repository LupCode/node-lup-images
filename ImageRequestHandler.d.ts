import { NextFunction, Request, Response } from "express";
import { ImageConverterOptions } from "./ImageConverter";
export type ImageRequestHandlerOptions = PrerenderImagesOptions & {
    /** URI prefix */
    uriPrefix: string;
    /** Pulblic HTTP cache time in seconds.
     * Can be undefined or null to disable public HTTP caching.
     * Defaults to 3600 (1 hour).
     */
    httpCacheTime?: number | null;
    /** Path to directory relative to project root where images should be cached.
     * Leave empty to disable caching.
     * Defaults to "./cache"
     */
    cacheDir?: string;
    /** Maximum cache size in MB.
     * Defaults to 1000 MB.
     */
    cacheSize?: number;
    /** If true, images will be pre-rendered on startup
     * which can take a while and uses more storage but will speed up requests.
     * (subdirectories starting with underscore '_' won't be optimized)
     * Defaults to true.
     */
    prerender?: boolean;
};
/**
 * Returns a request handler (req, res, next) => void that will serve optimized images.
 * It supports different search parameters:
 * - w: width in pixels of available space for image (default: 1024)
 * - f: format of returned image (jpg, png, webp, etc.)
 * @param options Options for image optimization
 * @returns Request handler that can be passed e.g. to express
 */
export declare function ImageRequestHandler(options: ImageRequestHandlerOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type PrerenderImagesOptions = ImageConverterOptions & {
    /** Path relative to project root where images are located (subdirectories starting with underscore '_' won't be optimized) */
    srcDir: string;
    /** Factor to scale images by (multiplier applied to width and height for each step) [Defaults to 1.5] */
    scaleFactor?: number;
    /** Path relative to project root where pre-rendered images should be stored.
     * If empty, images will be pre-rendered in place where original image is locaded (uses a subdirectory per original image).
     * Defaults to "./.prerendered"
     */
    prerenderOutputDir?: string;
    /** If true, the start and end of the pre-rendering process will be logged (because takes up high hardware utilization).
     * Defaults to true.
     */
    prerenderMessage?: boolean;
    /** List of path prefixes starting inside srcDir that should not be optimized.
     * Subdirectories starting with underscore '_' won't be optimized.
     * Defaults to ["./favicons"].
     */
    exludePrefix?: string[];
};
/**
 * Takes same input as ImageRequestHandler but pre-renders all images.
 * @param options Options of request handler (see ImageRequestHandler).
 * @returns Promise that resolves when pre-rendering is finished
 */
export declare function PrerenderImages(options: PrerenderImagesOptions): Promise<void>;
