import path from "path";
import fs from "fs/promises";
import { ImageInfo, OptimizerSettings } from ".";
import { ROOT } from "lup-root";
import { Stats } from "fs";


export interface ImageStorage {

    /**
     * Returns the last modified time of the file.
     * @param filePath File path to original image.
     * @return Promise that resolves to last modified time or null if file could not be found.
     */
    getLastModified(filePath: string, width: number, format: string): Promise<number | null>;

    /**
     * Loads an image from storage.
     * @param filePath File path to original image.
     * @param width Width to scale image to.
     * @param format Format to convert image to.
     * @return Promise that resolves to image info or null if image with specified parameters could not be found.
     */
    getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null>;

    /**
     * Stores an image in storage.
     * @param filePath File path to original image.
     * @param width Width to scale image to.
     * @param format Format to convert image to.
     * @param imageData Image data to store.
     * @return Promise that resolves when image has been stored.
     */
    putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void>;

}


export type ImageCacheStorageProps = {

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

};

/** Creates a directory with limited size containing the latest used formats. */
export class ImageCacheStorage implements ImageStorage {
    private readonly cacheDir: string;
    private readonly cacheSize: number; // byte size

    constructor(options: ImageCacheStorageProps){
        this.cacheDir = path.resolve(ROOT, options.cacheDir || OptimizerSettings.DEFAULT_CACHE_DIRECTORY_PATH);
        this.cacheSize = (options.cacheSize || OptimizerSettings.DEFAULT_MAX_CACHE_SIZE_MB) * 1000000;
        this.cleanUpCache();
    }

    /**
     * Manually enforces cache cleanup.
     * In particular, this is useful if cache was manipulated manually.
     * By default this is called automatically when a new image is stored in the cache.
     */
    private async cleanUpCache(){
        const promises: Promise<void>[] = [];
        const oldestFiles: {[key: number]: {filePath: string, size: number}} = {};
        let dirSize = 0;
        fs.readdir(this.cacheDir).then(async (files: string[]) => {
            for(const file of files){
                const filePath = path.resolve(this.cacheDir as string, file);
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
            while(dirSize > this.cacheSize && keys.length > 0){
                const key = keys.splice(0, 1)[0];
                const {filePath, size} = oldestFiles[key as any];
                dirSize = dirSize - size;
                fs.rm(filePath, {force: true});
            }
        }).catch(() => {});
    }

    private getCacheFilePath(filePath: string, width: number, format: string): string {
        return path.resolve(
            this.cacheDir, 
            filePath.substring(ROOT.length+1).replaceAll('\\', '--').replaceAll('/', '--')+'-'+width+'w.'+format
        );
    }


    async getLastModified(filePath: string, width: number, format: string): Promise<number | null> {
        const cacheFile = this.getCacheFilePath(filePath, width, format);
        return fs.stat(cacheFile).then((stats: Stats) => stats.mtimeMs).catch(() => null);
    }


    async getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null> {
        const originalFileInfo = await fs.stat(filePath); // check if file exists and for caching get last modified time
        const cacheFile = this.getCacheFilePath(filePath, width, format);

        // look in cache for image
        try {
            const cachedFileInfo = await fs.stat(cacheFile);
            if(cachedFileInfo.mtime >= originalFileInfo.mtime){
                const imageData = await fs.readFile(cacheFile);
                return {imageData, format, mimeType: (OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/'+format) };
            }
        } catch (ex){ }

        return null;
    }


    async putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void> {
        const cacheFile = this.getCacheFilePath(filePath, width, format);
        await fs.mkdir(this.cacheDir, {recursive: true}).then(() => fs.writeFile(cacheFile, imageData || Buffer.alloc(0)));
        this.cleanUpCache();
    }

}





export type ImageDirectoryStorageProps = {
    /** Path relative to project root where scaled images should be stored.*/
    dirPath: string,
};

export class ImageDirectoryStorage implements ImageStorage {
    private dirPath: string;

    constructor(options: ImageDirectoryStorageProps){
        this.dirPath = path.resolve(ROOT, options.dirPath);
    }
    

    private async getStoreFilePath(filePath: string, width: number, format: string, create: boolean): Promise<string> {
        const relFilePath = filePath.substring(ROOT.length+1);
        const idx = relFilePath.length - path.extname(relFilePath).length;
        const absFilePath = path.resolve(this.dirPath, relFilePath.substring(0, idx)+'-'+width+'w.'+format);
        if(create) await fs.mkdir(absFilePath.substring(0, absFilePath.length - path.basename(absFilePath).length), {recursive: true}).catch((err: any) => { console.error(err); });
        return absFilePath;
    }


    async getLastModified(filePath: string, width: number, format: string): Promise<number | null> {
        const storedFile = await this.getStoreFilePath(filePath, width, format, false);
        return fs.stat(storedFile).then((stats: Stats) => stats.mtimeMs).catch(() => null);
    }


    async getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null> {
        const originalFileInfo = await fs.stat(filePath); // check if file exists and for caching get last modified time
        const storedFile = await this.getStoreFilePath(filePath, width, format, false);

        // look in cache for image
        try {
            const storeFileInfo = await fs.stat(storedFile);
            if(storeFileInfo.mtime >= originalFileInfo.mtime){
                const imageData = await fs.readFile(storedFile);
                return {imageData, format, mimeType: (OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/'+format) };
            }
        } catch (ex){ }

        return null;
    }


    async putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void> {
        const storeFile = await this.getStoreFilePath(filePath, width, format, true); // creates directories
        await fs.writeFile(storeFile, imageData || Buffer.alloc(0));
    }
}





/** For each image creates a subdirectory in place that will contain all the different formats. */
export class ImageInPlaceStorage implements ImageStorage {

    private async _getStorageFilePath(filePath: string, width: number, format: string, create: boolean): Promise<string> {
                                                            // /images/test.jpg                    
        const parentDir = path.resolve(filePath, '..');     // /images/
        const fileName = path.basename(filePath);           // test.jpg
        const extIdx = fileName.lastIndexOf('.');
        const dirName = '_'+((extIdx < 0 ? fileName : fileName.substring(0, extIdx)) || 'prerender'); // _test
        const dirPath = path.resolve(parentDir, dirName);   // /images/_test/
        if(create) await fs.mkdir(dirPath, {recursive: true}).catch((err: any) => { console.error(err); });
        return path.resolve(dirPath, Math.round(width)+'w.'+format);
    }

    async getLastModified(filePath: string, width: number, format: string): Promise<number | null> {
        const cacheFile = await this._getStorageFilePath(filePath, width, format, false);
        return fs.stat(cacheFile).then((stats: Stats) => stats.mtimeMs).catch(() => null);
    }

    async getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null> {
        const originalFileInfo = await fs.stat(filePath); // check if file exists and for caching get last modified time
        const cacheFile = await this._getStorageFilePath(filePath, width, format, false);

        // look in cache for image
        try {
            const cachedFileInfo = await fs.stat(cacheFile);
            if(cachedFileInfo.mtime >= originalFileInfo.mtime){
                const imageData = await fs.readFile(cacheFile);
                return {imageData, format, mimeType: (OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[format] || 'image/'+format) };
            }
        } catch (ex){ }

        return null;
    }

    async putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void> {
        const cacheFile = await this._getStorageFilePath(filePath, width, format, true); // creates directories
        await fs.writeFile(cacheFile, imageData || Buffer.alloc(0));
    }
}