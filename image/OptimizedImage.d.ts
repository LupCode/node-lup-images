import React from "react";
export type OptimizedImageProps = {
    src: string;
    /** Width of the original image or max width image should be. */
    width: number | string;
    height?: number | string;
    alt?: string;
    draggable?: boolean;
    title?: string;
    loading?: "lazy" | "eager";
    fetchPriority?: "high" | "low" | "auto";
    className?: string;
    style?: React.CSSProperties;
    /**
     * The image is automatically scaled based on the device pixel ratio (DPR) of the device.
     * However if your image e.g. an ultra wide image and you you set object-fit cover e.g. the
     * image may seem blurry on high resolution devices. In this case you can set this prop to true
     * which will serve images always with a bit higher resolution.
     */
    extraHighResolution?: boolean;
    /**
     * Min width the scaled image data should always have (image is provided in multiple widths for different devices).
     * Default value is 64 (DEFAULT_MIN_IMAGE_WIDTH)
     */
    minWidth?: number;
    /**
     * Factor for scaling image alternatives
     * e.g scaling factor = 1.5, original image has 3600px, then next has 3600 / 1.5 = 2400px and so on
     * until minWidth value is reached.
     * Default values is 1.5 (DEFAULT_SCALE_FACTOR)
     */
    scaleFactor?: number;
    /**
     * Image can also be transformed into different formats e.g. avif, webp, etc.
     * By default image is transformed based on its file extension into good alternative formats (see FILE_EXTENSION_TO_ALTERNATIVES).
     * However by specifiying this prop as array of file extensions, you can override default behaviour.
     */
    alternativeFileExtensions?: string[];
};
export declare function OptimizedImage(props: OptimizedImageProps): React.JSX.Element;
