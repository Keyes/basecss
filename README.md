# BaseCSS [![Build Status][ci-img]][ci]

NPM module which extracts basic CSS rules for inlining them in your index.html, similar to critical CSS.

[ci-img]:  https://travis-ci.org/Keyes/basecss.svg?branch=master
[ci]:      https://travis-ci.org/Keyes/basecss

## Installation

```
npm install basecss --save
```


## Usage

```js
var BaseCSS = require('basecss');

var options = {
    htmlFile: 'index.html',
    cssFile: 'styles.min.css',
    selectors: [
        '.col-',
        '.row',
        'h[1-6]'
    ]
};

new BaseCSS(options).run();

```

### Options

Default options:
```js
{
    cssFile:   '',
    htmlFile:  '',
    selectors: [
    ],
    propertiesExclude: [
        'animation[\-a-z]*', 'transition[\-a-z]*',
        'cursor', 'nav[\-a-z]*', 'resize',
        'image[\-a-z]*'
    ],
    includeFontFace: true,
    minifyCSS: true
}
```

#### options.cssFile
Only necessary of you use basecss standalone

#### options.htmlFile
File, in which the CSS should be included. Needs a head-Element.

#### options.selectors
Array of selectors for which should be looked. Can contain regular expressions.

For example:

```js
selectors: [
	'.base-',
    '.col-(sm,lg)-',
    'nav', 
    'article'
]
```

#### options.propertiesExclude
CSS properties that should be excluded. It's mostly good to leave the default value here, you mostly do not want animations to appear.

#### options.includeFontFace
Basecss includes by default all @font-face rules in the beginning of the css, so that your fonts get rendered properly. You may want to disable this.

#### options.minifyCSS
If the CSS should be minified before being inserted - you normally want this
