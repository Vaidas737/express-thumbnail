# Express Thumbnail

Express thumbnail is a [Express framework](http://expressjs.com/) middleware for creation of thumbnails on the fly. 
It automatically creates a thumbnails by adding query parameters onto a image url.

## Overview

This module use [lwip](https://github.com/EyalAr/lwip), which didn't require external runtime dependencies for image 
processing. It means you don't have to install anything else on your system.


## Install
  
    $ npm install express-thumbnail

## Examples

```js
var express = require('express');
var expressThumbnail = require('express-thumbnail');
var app = express();
...
app.use(expressThumbnail.register(__dirname + '/images'));
```

```html
<img src="foo.png?thumb=50x50">
```

## Docs.

### expressThumbnail.register(rootDir, [options])

`rootDir` path to images root directory.

`options` (optional) an object of options. Available options:

* `cacheDir` The location where converted images will be stored. Default is `[rootDir]/.thumb`.
