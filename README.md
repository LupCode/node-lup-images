![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-images)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-images)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/LupCode/node-lup-images/On%20Push)
![NPM](https://img.shields.io/npm/l/lup-images)

# lup-images
Node module for optimizing images in web applications.

## Example
```javascript
const { ImagesRequestHandler } = require('lup-images');
const express = require('express');

const app = express();

app.use('/images/*', ImagesRequestHandler());

app.listen();
```
