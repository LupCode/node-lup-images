import fs from "fs/promises";
import sharp from "sharp";
import { OptimizerSettings } from "./index";
import { ImageStorage } from "./ImageStorage";
import path from "path";

export type ImageInfo = {
    imageData: Buffer,
    format: string,
    mimeType: string,
};

export type PrerenderOptions = {
    /** Subdirectories to prerender (relative to srcDir) [Defaults to '.' to render all whole srcDir] */
    subDirs?: string | string[],

    /** Factor to scale images by (multiplier applied to width and height for each step) [Defaults to 1.5] */
    scaleFactor?: number,
    
    /** If subdirectories should be recursively prerendered too (Defaults to true) */
    recursive?: boolean,

    /** List of relative path prefixes starting inside srcDir that should not be optimized.
     * Subdirectories starting with underscore '_' won't be optimized.
     * Defaults to ["./favicons"].
     */
    exlucePrefixes?: string[],

    /** If true, the start and end of the pre-rendering process will be logged (because takes up high hardware utilization).
     * Defaults to true.
     */
    message?: boolean,
};

type FileInfo = {
    filePath: string,
    altExts: string[],
};


export type ImageConverterOptions = {
    /** Minimum pixel width of image to generate / cache.
     * Defaults to 32.
     */
    minImageWidth?: number,

    /** Maxmimum pixel width of image to generate / cache.
     * Defaults to 4096 (4K).
     */
    maxImageWidth?: number,
};

export class ImageConverter {
    readonly minImageWidth: number;
    readonly maxImageWidth: number;

    constructor(options: ImageConverterOptions = {}){
        this.minImageWidth = options.minImageWidth || OptimizerSettings.DEFAULT_MIN_IMAGE_WIDTH;
        this.maxImageWidth = options.maxImageWidth || OptimizerSettings.DEFAULT_MAX_IMAGE_WIDTH;
    }

    /**
     * Loads an image from the given file path, resizes it to the given width and converts it to the given format.
     * @param filePath Path to image file.
     * @param width Width in pixels of available space for image.
     * @param format Format of returned image.
     * @returns Promise that resolves to an object containing the image data, format and mime type.
     */
    async convertImage(filePath: string, width: number, format: 'avif' | 'webp' | 'jpg' | 'png' | 'gif' | 'heif' | 'tiff' | 'tif'): Promise<ImageInfo> {
        width = Math.max(this.minImageWidth, Math.min(width, this.maxImageWidth));

        // generate optimized image
        let info: ImageInfo | null = null;
        let img = sharp(filePath).rotate(); // fix EXIF rotation
        const meta = await img.metadata().catch(() => null);
        const needResize = !meta || !meta.width || meta.width > width;
        img = needResize ? img.resize(width) : img; // resize
        
        switch(format){

            case 'avif':
                info = await img.avif().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/avif'} as ImageInfo;
                });
                break;

            case 'webp':
                info = await img.webp().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/jpg'} as ImageInfo;
                });
                break;

            case 'jpg':
                info = await img.jpeg().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/jpg'} as ImageInfo;
                });
                break;
            
            case 'png':
                info = await img.png().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/png'} as ImageInfo;
                });
                break;

            case 'gif':
                info = await img.gif().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/gif'} as ImageInfo;
                });
                break;

            case 'heif':
                info = await img.heif().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/gif'} as ImageInfo;
                });
                break;

            case 'tiff':
            case 'tif':
                info = await img.tiff().toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/gif'} as ImageInfo;
                });
                break;
            
            default:
                info = await img.toBuffer().then((imageData: Buffer) => {
                    return {imageData, format, mimeType: 'image/'+format} as ImageInfo;
                });
        }
        
        if(!info) throw new Error("Image could not be optimized");
        return info;
    }

    private async _collectImagesToConvert(dirPath: string, excludeAbsolutePaths: string[], recursive: boolean, first: boolean): Promise<FileInfo[]> {
        // check if dirPath should be excluded
        for(let i=0; i < excludeAbsolutePaths.length; i++){
            if(dirPath.length >= excludeAbsolutePaths[i].length && dirPath.startsWith(excludeAbsolutePaths[i])) return [];
        }

        const stats = await fs.stat(dirPath); 
        if(stats.isDirectory()){
            // dirPath is directory
            if((!first && !recursive) || path.basename(dirPath).startsWith('_')) return Promise.resolve([]);
            
            return fs.readdir(dirPath).then(async (fileNames: string[]) => {

                const promises: Promise<FileInfo[]>[] = [];
                for(const fileName of fileNames){
                    const filePath = path.resolve(dirPath, fileName);
                    promises.push(this._collectImagesToConvert(filePath, excludeAbsolutePaths, recursive, false));
                }

                return Promise.all(promises).then((results: FileInfo[][]) => results.reduce((prev, curr) => prev.concat(curr), [])).catch(() => []);
            });

        } else {
            // dirPath is file
            const ext = path.extname(dirPath).substring(1); // subscript 1 to remove dot at beginning
            const altExts = OptimizerSettings.FILE_EXTENSION_TO_ALTERNATIVES[ext];
            if(!altExts) return Promise.resolve([]);

            const info: FileInfo = {
                filePath: dirPath,
                altExts,
            };
            return Promise.resolve([info]);
        }
    }

    private async _prerender(storage: ImageStorage, scaleFactor: number, dirPath: string, excludeAbsolutePaths: string[], recursive: boolean): Promise<void> {

        // collect images to convert
        const imagesToConvert = await this._collectImagesToConvert(dirPath, excludeAbsolutePaths, recursive, true);

        const promises: Promise<void>[] = [];
        for(let i=0; i < imagesToConvert.length; i++){
            const fileInfo = imagesToConvert[i];
            promises.push(fs.stat(fileInfo.filePath).then(async (stats) => {
                const originalLastModified = stats.mtimeMs;

                const localPromises: Promise<void>[] = [];
                const img = sharp(fileInfo.filePath).rotate(); // fix EXIF rotation
                const meta = await img.metadata().catch(() => null);
                let width = meta?.width || this.maxImageWidth;
                while(width >= this.minImageWidth){
                    if(width <= this.maxImageWidth){
                        for(let altExt of fileInfo.altExts){
                            const WIDTH = width;
                            const ALT_EXT = altExt as any;
                            localPromises.push(
                                storage.getLastModified(fileInfo.filePath, WIDTH, ALT_EXT).then(async (lastModified) => {

                                    if(lastModified == null || lastModified < originalLastModified){
                                        return this.convertImage(fileInfo.filePath, WIDTH, ALT_EXT).then((info: ImageInfo) => {
                                            return storage.putImage(fileInfo.filePath, WIDTH, ALT_EXT, info.imageData);
                                        });
                                    }

                                })
                            );
                        }
                    }
                    width = Math.round(width / scaleFactor);
                }
                
                return Promise.all(localPromises).then(() => {});
            }));
        }
        return Promise.all(promises).then(() => {});
    }

    /**
     * Pre-renders images in the given directory in all sizes and formats, 
     * and stores them in the given storage.
     * @param storage Storage to store images in.
     * @param srcDir Path to directory that contains the images.
     * @param options Options for pre-rendering.
     */
    async prerender(storage: ImageStorage, srcDir: string, options?: PrerenderOptions): Promise<void> {
        const subDirs = !(options?.subDirs) ? ['.'] : (Array.isArray(options?.subDirs) ? options?.subDirs : [options?.subDirs]);
        const scaleFactor = options?.scaleFactor || OptimizerSettings.DEFAULT_SCALE_FACTOR;
        const recursive = options?.recursive !== undefined ? options?.recursive : OptimizerSettings.DEFAULT_PRERENDER_RECURSIVELY;
        const excludeAbsolutePaths = (options?.exlucePrefixes || OptimizerSettings.DEFAULT_EXCLUDE_PREFIXES).map((p) => path.resolve(srcDir, p));
        const doMessage = options?.message !== undefined ? options?.message : OptimizerSettings.DEFAULT_PRERENDER_MESSAGE;

        const startTime = Date.now();
        if(doMessage) console.log("Start pre-rendering images in directory '"+srcDir+"'");

        const promises: Promise<void>[] = [];
        for(let i=0; i < subDirs.length; i++)
            if(!subDirs[i].startsWith('_'))
                promises.push(this._prerender(storage, scaleFactor, path.resolve(srcDir, subDirs[i]), excludeAbsolutePaths, recursive));
        await Promise.all(promises).then(() => {});

        if(doMessage) console.log("Finished pre-rendering images in directory '"+srcDir+"' after "+(Math.round((Date.now()-startTime) / 100)/10)+"s");
    }
}