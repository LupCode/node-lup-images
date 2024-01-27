import path from "path";
import { ROOT } from "lup-root";
import { NextFunction, Request, Response } from "express";
import { ImageConverter, ImageConverterOptions, ImageInfo } from "./ImageConverter";
import { OptimizerSettings } from "./index";
import { ImageCacheStorage, ImageDirectoryStorage, ImageInPlaceStorage } from "./ImageStorage";


export type ImageRequestHandlerOptions = PrerenderImagesOptions & {
  
    /** URI prefix */
    uriPrefix: string,

    /** Pulblic HTTP cache time in seconds.
     * Can be undefined or null to disable public HTTP caching.
     * Defaults to 3600 (1 hour).
     */
    httpCacheTime?: number | null,

    /** Path to directory relative to project root where images should be cached.
     * Leave empty to disable caching.
     * Defaults to "./cache"
     */
    cacheDir?: string,

    /** Maximum cache size in MB.
     * Defaults to 1000 MB.
     */
    cacheSize?: number,

    /** If true, images will be pre-rendered on startup 
     * which can take a while and uses more storage but will speed up requests.
     * (subdirectories starting with underscore '_' won't be optimized)
     * Defaults to true.
     */
    prerender?: boolean,
};

/**
 * Returns a request handler (req, res, next) => void that will serve optimized images.
 * It supports different search parameters:
 * - w: width in pixels of available space for image (default: 1024)
 * - f: format of returned image (jpg, png, webp, etc.)
 * @param options Options for image optimization
 * @returns Request handler that can be passed e.g. to express
 */
export function ImageRequestHandler(options : ImageRequestHandlerOptions){
    let scaleFactor = options.scaleFactor || OptimizerSettings.DEFAULT_SCALE_FACTOR; 
    scaleFactor = scaleFactor > 1.0 ? scaleFactor : ((scaleFactor == 1.0 || scaleFactor == 0.0) ? 1.5 : 1.0/scaleFactor); // same as in OptimizedImage

    const httpCacheSec = options.httpCacheTime != null ? options.httpCacheTime || OptimizerSettings.DEFAULT_HTTP_CACHE_SEC : null;
    const optimizer = new ImageConverter(options);

    // storage for caching images
    const cacheStorage = options.cacheDir !== '' ? new ImageCacheStorage({
        cacheDir: options.cacheDir,
        cacheSize: options.cacheSize,
    }) : null;

    // storage for pre-rendered images
    const prerenderStorage = !options.prerender ? null : (options.prerenderOutputDir !== '' ? new ImageDirectoryStorage({
        dirPath: options.prerenderOutputDir || OptimizerSettings.DEFAULT_PREDENDER_OUTPUT_DIRECTORY,
    }) : new ImageInPlaceStorage());


    // prerender images
    if(prerenderStorage){
        optimizer.prerender(prerenderStorage, options.srcDir, {
            recursive: options.prerender,
            scaleFactor,
            message: options.prerenderMessage,
        });
    }

    return async (req: Request, res: Response, next: NextFunction) => {
        if(!req.query.f || !req.query.w){ next(); return; }

        let fileName = req.url.substring((options.uriPrefix || '').length+1);
        const searchIdx = fileName.indexOf('?');
        fileName = searchIdx >= 0 ? fileName.substring(0, searchIdx) : fileName;
        const filePath = path.resolve(ROOT, options.srcDir, fileName);
        const width = parseInt(req.query.w as string || '', 10) || 1024;
        const idx = fileName.lastIndexOf(".");
        const format = ((req.query.f as string).length > 0) ? req.query.f as string : 
                ((idx >= 0 && idx < fileName.length-1) ? fileName.substring(idx+1) : 'jpg');

        if(!OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format]){
            next();
            return;
        }

        let imageInfo: ImageInfo | null = null;

        // check if image is prerendered
        if(prerenderStorage) imageInfo = await prerenderStorage.getImage(filePath, width, format);

        // check if image is cached
        if(!imageInfo && cacheStorage) imageInfo = await cacheStorage.getImage(filePath, width, format);

        // generate image
        if(!imageInfo){
            imageInfo = await optimizer.convertImage(filePath, width, format as any);
            if(imageInfo && cacheStorage) cacheStorage.putImage(filePath, width, format, imageInfo.imageData);
        }

        // send image
        if(imageInfo){
            if(httpCacheSec && httpCacheSec > 0) res.set('Cache-control', 'public, max-age='+httpCacheSec);
            res.set('Content-type', imageInfo.mimeType);
            res.send(imageInfo.imageData);
        } else {
            next();
        }
    };
};




export type PrerenderImagesOptions = ImageConverterOptions & {

    /** Path relative to project root where images are located (subdirectories starting with underscore '_' won't be optimized) */
    srcDir: string,

    /** Factor to scale images by (multiplier applied to width and height for each step) [Defaults to 1.5] */
    scaleFactor?: number,

    /** Path relative to project root where pre-rendered images should be stored.
     * If empty, images will be pre-rendered in place where original image is locaded (uses a subdirectory per original image).
     * Defaults to "./.prerendered"
     */
    prerenderOutputDir?: string,

    /** If true, the start and end of the pre-rendering process will be logged (because takes up high hardware utilization).
     * Defaults to true.
     */
    prerenderMessage?: boolean,

    /** List of path prefixes starting inside srcDir that should not be optimized.
     * Subdirectories starting with underscore '_' won't be optimized.
     * Defaults to ["./favicons"].
     */
    exludePrefix?: string[],
};


/**
 * Takes same input as ImageRequestHandler but pre-renders all images.
 * @param options Options of request handler (see ImageRequestHandler).
 * @returns Promise that resolves when pre-rendering is finished
 */
export async function PrerenderImages(options: PrerenderImagesOptions): Promise<void> {
    const optimizer = new ImageConverter(options);
    const prerenderStorage = options.prerenderOutputDir !== '' ? new ImageDirectoryStorage({
        dirPath: options.prerenderOutputDir || OptimizerSettings.DEFAULT_PREDENDER_OUTPUT_DIRECTORY,
    }) : new ImageInPlaceStorage();

    return optimizer.prerender(prerenderStorage, options.srcDir, {
        recursive: true,
        scaleFactor: options.scaleFactor,
        message: options.prerenderMessage,
        exlucePrefixes: options.exludePrefix,
    });
}