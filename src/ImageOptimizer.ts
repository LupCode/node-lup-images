import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ROOT } from "lup-root";
import { Stats } from "fs";
import { DEFAULT_CACHE_DIRECTORY_PATH, DEFAULT_MAX_CACHE_SIZE_MB, DEFAULT_MAX_IMAGE_WIDTH, DEFAULT_MIN_IMAGE_WIDTH, FILE_EXTENSION_TO_MIME_TYPE } from ".";

export type OptimizedImageInfo = {
    imageData: Buffer,
    format: string,
    mimeType: string
};


export type ImageOptimizerOptions = {
    /** Path relative to project root where scaled images should be stored.
     * If null scaled images won't be cached.
     * Defaults to './cache'
     */
    cacheDir?: string | null,

    /**
     * Maximum size of the cache directory in MB.
     * If max size is reached and a new image is about to be stored, the longest unused image will be deleted.
     * Defaults to 1000 (1GB), zero or negative numbers disable the cache size limit.
     */
    cacheSize?: number,

    /** Minimum pixel width of image to generate / cache.
     * Defaults to 32.
     */
    minImageWidth?: number,

    /** Maxmimum pixel width of image to generate / cache.
     * Defaults to 4096 (4K).
     */
    maxImageWidth?: number,
};

class ImageOptimizer {
    readonly #cacheDir: string | null;
    readonly #cacheSize: number; // byte size
    readonly #minImageWidth: number;
    readonly #maxImageWidth: number;

    constructor(options: ImageOptimizerOptions = {}){
        this.#cacheDir = options.cacheDir != null ? path.resolve(ROOT, options.cacheDir || DEFAULT_CACHE_DIRECTORY_PATH) : null;
        this.#cacheSize = (options.cacheSize || DEFAULT_MAX_CACHE_SIZE_MB) * 1000000;
        this.#minImageWidth = options.minImageWidth || DEFAULT_MIN_IMAGE_WIDTH;
        this.#maxImageWidth = options.maxImageWidth || DEFAULT_MAX_IMAGE_WIDTH;
    }

    /**
     * Manually enforces cache cleanup.
     * In particular, this is useful if cache was manipulated manually.
     * By default this is called automatically when a new image is stored in the cache.
     */
    async cleanUpCache(){
        if(!this.#cacheDir) return;
        const promises: Promise<void>[] = [];
        const oldestFiles: {[key: number]: {filePath: string, size: number}} = {};
        let dirSize = 0;
        fs.readdir(this.#cacheDir).then(async (files: string[]) => {
            for(const file of files){
                const filePath = path.resolve(this.#cacheDir as string, file);
                promises.push(fs.stat(filePath).then((stats: Stats) => {
                    let time = stats.atimeMs; // access time
                    while(oldestFiles[time]) time++;
                    oldestFiles[time] = {filePath, size: stats.size};
                    dirSize = dirSize + stats.size;
                }));
            }
            // wait for all files being read
            await Promise.all(promises);
    
            // delete files until cache size is under limit again
            const keys = Object.keys(oldestFiles).sort();
            while(dirSize > this.#cacheSize && keys.length > 0){
                const key = keys.splice(0, 1)[0];
                const {filePath, size} = oldestFiles[key as any];
                dirSize = dirSize - size;
                fs.rm(filePath, {force: true});
            }
        }).catch();
    }

    /**
     * Loads an image from the given file path, resizes it to the given width and converts it to the given format.
     * Automatically caches the optimized image if caching is enabled.
     * @param filePath Path to image file.
     * @param width Width in pixels of available space for image.
     * @param format Format of returned image.
     * @returns Promise that resolves to an object containing the image data, format and mime type.
     */
    async optimizedImage(filePath: string, width: number, format: 'avif' | 'webp' | 'jpg' | 'png' | 'gif' | 'heif' | 'tiff' | 'tif'): Promise<OptimizedImageInfo> {
        width = Math.max(this.#minImageWidth, Math.min(width, this.#maxImageWidth));

        let cacheFile = '';
        if(this.#cacheDir){
            cacheFile = path.resolve(
                this.#cacheDir, 
                filePath.substring(ROOT.length+1).replaceAll('\\', '--').replaceAll('/', '--')+'-'+width+'w.'+format
            );

            // look in cache for image
            try {
                const imageData = await fs.readFile(cacheFile);
                return {imageData, format, mimeType: (FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/'+format) };
            } catch (ex){ }
        }
        
    
        // generate optimized image
        return fs.stat(filePath).then(async () => {
            let info: OptimizedImageInfo | null = null;
            let img = sharp(filePath).rotate(); // fix EXIF rotation
            const meta = await img.metadata().catch(() => null);
            const needResize = !meta || !meta.width || meta.width > width;
            img = needResize ? img.resize(width) : img; // resize
            
            switch(format){

                case 'avif':
                    info = await img.avif().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/avif'} as OptimizedImageInfo;
                    });
                    break;

                case 'webp':
                    info = await img.webp().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/jpg'} as OptimizedImageInfo;
                    });
                    break;

                case 'jpg':
                    info = await img.jpeg().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/jpg'} as OptimizedImageInfo;
                    });
                    break;
                
                case 'png':
                    info = await img.png().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/png'} as OptimizedImageInfo;
                    });
                    break;

                case 'gif':
                    info = await img.gif().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/gif'} as OptimizedImageInfo;
                    });
                    break;

                case 'heif':
                    info = await img.heif().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/gif'} as OptimizedImageInfo;
                    });
                    break;

                case 'tiff':
                case 'tif':
                    info = await img.tiff().toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/gif'} as OptimizedImageInfo;
                    });
                    break;
                
                default:
                    info = await img.toBuffer().then((imageData: Buffer) => {
                        return {imageData, format, mimeType: 'image/'+format} as OptimizedImageInfo;
                    });
            }
            
            if(!info) throw new Error("Image could not be optimized");
    
            // store optimized image in cache
            if(this.#cacheDir){
                await fs.mkdir(this.#cacheDir, {recursive: true}).then(() => fs.writeFile(cacheFile, info?.imageData || Buffer.alloc(0)));
                this.cleanUpCache();
            }
            
            return info;
        });
    }
}
export default ImageOptimizer;