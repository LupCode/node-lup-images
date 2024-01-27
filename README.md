![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-images)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-images)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/LupCode/node-lup-images/On%20Push)
![NPM](https://img.shields.io/npm/l/lup-images)

# lup-images
Node module for optimizing images in web applications.

## Example Server
```javascript
const { ImagesRequestHandler } = require('lup-images');
const express = require('express');

const app = express();

app.use('/images/*', ImagesRequestHandler());

app.listen();
```

## Example JSX
```jsx
<OptimizedImage src="https://picsum.photos/200/300" width={200} height={300} />
```

## For NextJS
To work with NextJS you need to add the following to your `next.config.js`:
```javascript
experimental: {
    serverComponentsExternalPackages: ["sharp"],
}
```


## Prerender Images before Deployment
Images can also be prerendered before deployment e.g. inside of a CI/CD pipeline.
Create a file that contains the following code:
```typescript
import { PrerenderImages } from 'lup-images';

// this wrapper is needed if you are in the main file of a node project
(async () => {

    // prerender images (provide same options as in the request handler)
    await PrerenderImages({ ... });

})();
````
In the CI/CD pipeline or wherever you want to prerender the images, run the file using node.