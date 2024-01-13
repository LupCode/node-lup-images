/// <reference types="node" />
import { ImageInfo } from ".";
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
    cacheDir?: string | null;
    /**
     * Maximum size of the cache directory in MB.
     * If max size is reached and a new image is about to be stored, the longest unused image will be deleted.
     * Defaults to 1000 (1GB), zero or negative numbers disable the cache size limit.
     */
    cacheSize?: number;
};
/** Creates a directory with limited size containing the latest used formats. */
export declare class ImageCacheStorage implements ImageStorage {
    private readonly cacheDir;
    private readonly cacheSize;
    constructor(options: ImageCacheStorageProps);
    /**
     * Manually enforces cache cleanup.
     * In particular, this is useful if cache was manipulated manually.
     * By default this is called automatically when a new image is stored in the cache.
     */
    private cleanUpCache;
    private getCacheFilePath;
    getLastModified(filePath: string, width: number, format: string): Promise<number | null>;
    getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null>;
    putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void>;
}
export type ImageDirectoryStorageProps = {
    /** Path relative to project root where scaled images should be stored.*/
    dirPath: string;
};
export declare class ImageDirectoryStorage implements ImageStorage {
    private dirPath;
    constructor(options: ImageDirectoryStorageProps);
    private getStoreFilePath;
    getLastModified(filePath: string, width: number, format: string): Promise<number | null>;
    getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null>;
    putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void>;
}
/** For each image creates a subdirectory in place that will contain all the different formats. */
export declare class ImageInPlaceStorage implements ImageStorage {
    private _getStorageFilePath;
    getLastModified(filePath: string, width: number, format: string): Promise<number | null>;
    getImage(filePath: string, width: number, format: string): Promise<ImageInfo | null>;
    putImage(filePath: string, width: number, format: string, imageData: Buffer): Promise<void>;
}
