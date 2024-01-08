import path from "path";
import { ROOT } from "lup-root";
import { NextFunction, Request, Response } from "express";
import { ImageOptimizer, ImageOptimizerOptions, OptimizedImageInfo } from "./ImageOptimizer";
import { OptimizerSettings } from "./index";


export type ImageRequestHandlerOptions = ImageOptimizerOptions & {

    /** Path relative to project root where images are located. */
    srcDir: string,
  
    /** URI prefix */
    uriPrefix: string,

    /** Pulblic HTTP cache time in seconds.
     * Can be undefined or null to disable public HTTP caching.
     * Defaults to 3600 (1 hour).
     */
    httpCacheTime?: number | null,
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
    const optimizer = new ImageOptimizer(options);
    const httpCacheSec = options.httpCacheTime != null ? options.httpCacheTime || OptimizerSettings.DEFAULT_HTTP_CACHE_SEC : null;

    return (req: Request, res: Response, next: NextFunction) => {
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

        optimizer.optimizedImage(filePath, width, format as any).then((info: OptimizedImageInfo) => {
            if(httpCacheSec && httpCacheSec > 0) res.set('Cache-control', 'public, max-age='+httpCacheSec);
            res.set('Content-type', info.mimeType);
            res.send(info.imageData);
        }).catch((err: any) => {
            console.error(err);
            next();
        });
    };
};