import React from "react";
import { OptimizerSettings } from "../OptimizerSettings";

export type OptimizedImageProps = {
    src: string,

    /** Width of the original image or max width image should be. */
    width: number | string,
    height?: number | string,
    alt?: string,
    draggable?: boolean,
    title?: string,
    loading?: "lazy" | "eager",
    fetchPriority?: "high" | "low" | "auto",
    className?: string,
    style?: React.CSSProperties,

    /** 
     * The image is automatically scaled based on the device pixel ratio (DPR) of the device.
     * However if your image e.g. an ultra wide image and you you set object-fit cover e.g. the 
     * image may seem blurry on high resolution devices. In this case you can set this prop to true
     * which will serve images always with a bit higher resolution.
     */
    extraHighResolution?: boolean,

    /** 
     * Min width the scaled image data should always have (image is provided in multiple widths for different devices).
     * Default value is 64 (DEFAULT_MIN_IMAGE_WIDTH)
     */
    minWidth?: number,

    /** 
     * Factor for scaling image alternatives 
     * e.g scaling factor = 1.5, original image has 3600px, then next has 3600 / 1.5 = 2400px and so on 
     * until minWidth value is reached.
     * Default values is 1.5 (DEFAULT_SCALE_FACTOR)
     */
    scaleFactor?: number,

    /** 
     * Image can also be transformed into different formats e.g. avif, webp, etc.
     * By default image is transformed based on its file extension into good alternative formats (see FILE_EXTENSION_TO_ALTERNATIVES).
     * However by specifiying this prop as array of file extensions, you can override default behaviour.
     */
    alternativeFileExtensions?: string[],
};

export function OptimizedImage(props: OptimizedImageProps){
    if(!props.src) throw new Error("src must be provided");
    const width = parseInt(props.width as string || "0", 10);
    if(!width) throw new Error("width must be provided as pixel value");
    
    const minWidth = props.minWidth || OptimizerSettings.DEFAULT_MIN_IMAGE_WIDTH;

    let scaleFactor = props.scaleFactor || OptimizerSettings.DEFAULT_SCALE_FACTOR; 
    scaleFactor = scaleFactor > 1.0 ? scaleFactor : ((scaleFactor == 1.0 || scaleFactor == 0.0) ? 1.5 : 1.0/scaleFactor); // same as in ImageRequestHandler

    const endIdx = props.src.lastIndexOf('?');
    const srcPath = props.src.substring(0, endIdx < 0 ? props.src.length : endIdx); // src without query

    const fileExtension = srcPath.substring(srcPath.lastIndexOf('.')+1);
    const fileExtensions = props.alternativeFileExtensions || OptimizerSettings.FILE_EXTENSION_TO_ALTERNATIVES[fileExtension] || [];
    if(!fileExtensions.includes(fileExtension)) fileExtensions.push(fileExtension);
    
    const sources: React.ReactNode[] = [];
    let w = width || 0;
    while(w >= minWidth) {
        console.log(w, ' -> ', w / scaleFactor, ' -> ', Math.round(w / scaleFactor)); // TODO REMOVE
        const nextW = Math.round(w / scaleFactor);

        const isLast = nextW < minWidth;
        for(const fe of fileExtensions) sources.push(
            <source key={w+fe} type={OptimizerSettings.FILE_EXTENSION_TO_MIME_TYPE[fe] || 'image/'+fe} 
                    srcSet={srcPath+'?w='+w+'&f='+fe} 
                    media={isLast ? undefined : '(min-width: '+(props.extraHighResolution ? w/2 : w)+'px)'} />
        );
        w = nextW;
    }

    // fetchPriority is not supported by TSX yet
    const tags: any = {};
    if(props.fetchPriority) tags.fetchpriority = props.fetchPriority;

    return <picture>
        {sources}
        <img className={props.className} style={props.style} {...tags}
                src={props.src} width={props.width} height={props.height || "auto"} 
                alt={props.alt} draggable={props.draggable} title={props.title} loading={props.loading} />
    </picture>;
}