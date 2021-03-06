var parseCSS = require('css');
var fs = require('fs');
var _ = require('lodash');
var cheerio = require('cheerio');
var cssmin = require('cssmin');

// init Basecss
var Basecss = function (options) {
    // our default options
    this.options = _.extend({
        cssFile:   '',
        htmlFile:  '',
        selectors: [
            // '[^x]small',
            // 'h1'
            // 'large'
        ],
        propertiesExclude: [
            'animation[\-a-z]*', 'transition[\-a-z]*',
            'cursor', 'nav[\-a-z]*', 'resize',
            'image[\-a-z]*'
        ],
        includeFontFace: true,
        minifyCSS:       true,
        overwriteCSS:    true, // if already present
        showLog:         true
    }, options);

    return this;
};

// get specific data from our css data
Basecss.prototype.getData = function (name) {
    return _.reject(this.cssData, function (n) {
        return n.type !== name;
    });
};

// get specific rules by selector
Basecss.prototype.fetchRulesBySelectors = function (selectorArray) {
    selectorArray = selectorArray || this.options.selectors;
    this.data = _.filter(this.getData('rule'), function (rule) {
        // filter from every rule in the css data
        var selectors = rule.selectors;
        // loop over every selector in this specific rule
        for (var i in selectors) {
            // loop over our selectors from the options
            for (var sel in selectorArray) {
                // do they match?
                if (selectors[i].search(selectorArray[sel]) !== -1) {
                    return true;
                }
            }
        }
    });

    // should we include @font-face rules? we better do...
    if (this.options.includeFontFace) {
        this.data = this.getData('font-face').concat(this.data);
    }

    return this;
};

Basecss.prototype.getRulesBySelectors = function (selectorArray) {
    this.fetchRulesBySelector(selectorArray);
    return this.data;
};

// return our data as perfect CSS-String
Basecss.prototype.toString = function (data) {
    return parseCSS.stringify(
        { stylesheet: { rules: data ? data : this.data } }
    );
};

// write or build css to the html file - inline!
Basecss.prototype.writeToHtmlFile = function () {
    // callback function this=self workaround
    var self = this;
    var file;
    var css;

    try {
        file = fs.readFileSync(this.options.htmlFile);
    } catch(err) {
        console.log(
            'File "' + this.options.htmlFile + '" doesn\'t exist!'
        );
        return false;
    }

    // we need jsdom to nicely traverse through our html code
    var $ = cheerio.load(file.toString('utf-8'));

    var csstag = $('style[data-id="base-css"]');
    var head = $('head');

    if (csstag.length === 0) {
        csstag = $('<style></style>');
        csstag.attr('data-id', 'base-css');
    }

    csstag.attr('type', 'text/css');


    if (self.options.overwriteCSS) {
        css = self.toString();
    } else {
        css = csstag.html() + '\n\n' + self.toString();
    }

    if (self.options.minifyCSS) css = cssmin(css);

    csstag.html(css);

    var firstStylesheet = head.find('link[rel="stylesheet"]');
    firstStylesheet.before(csstag);

    if (firstStylesheet.length === 0) {
        head.append(csstag);
    }


    fs.writeFileSync(
        self.options.htmlFile,
        $.html()
    );

    // yay!
    if (self.options.showLog) {
        console.log(
            'Successfully updated "' + self.options.htmlFile + '"!'
        );
    }
};

Basecss.prototype.filterRulesByProperties = function (propertyArray) {
    propertyArray = propertyArray || this.options.propertiesExclude;

    var rule;
    var properties;
    var search;

    for (var r in this.data) {
        rule = this.data[r];
        // filter from every rule in the css data
        properties = rule.declarations;

        // loop over every property in this specific rule
        for (var i in properties) {
            // loop over our properties from the options
            for (var prop in propertyArray) {
                // do they match?
                if (properties[i] && properties[i].property) {
                    search = properties[i]
                        .property
                        .search(propertyArray[prop]);

                    if (search !== -1) {
                        // remove this property!
                        properties.splice(i, 1);
                    }
                }
            }
        }
    }

    return this;
};

// shorthand function for the normal way
Basecss.prototype.run = function () {
    // read the css file and parse it
    this.cssData = parseCSS.parse(
        fs.readFileSync(this.options.cssFile).toString('utf-8'),
        { source: this.options.cssFile }
    ).stylesheet.rules;

    this.fetchRulesBySelectors().filterRulesByProperties().writeToHtmlFile();
    return this;
};

Basecss.prototype.process = function (str, options) {
    if (options) _.extend(this.options, options);

    // read the css file and parse it
    this.cssData = parseCSS.parse(str.toString('utf-8')).stylesheet.rules;

    this.fetchRulesBySelectors().filterRulesByProperties().writeToHtmlFile();
    return this;
};

module.exports = Basecss;
