/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
/**
 *
 * @type {Function}
 * @constructor
 */
export var ElementQueries = function () {

    var regex = /,?([^,\n]*)\[[\s\t]*(min|max)-(width|height)[\s\t]*[~$\^]?=[\s\t]*"([^"]*)"[\s\t]*]([^\n\s\{]*)/mgi;

    /**
     * @param resizeRulesPerSelector - map of selector to rule
     * @param {String} selector
     * @param {String} mode min|max
     * @param {String} property width|height
     * @param {String} value
     */
    function storeSelector(resizeRulesPerSelector, selector, mode, property, value) {
        if (!resizeRulesPerSelector[selector]) {
            resizeRulesPerSelector[selector] = [];
        }
        resizeRulesPerSelector[selector].push({mode, property, value})
    }

    /**
     * @param resizeRulesPerSelector - map of selector to rule
     * @param {String} css
     */
    function extractQuery(resizeRulesPerSelector, css) {
        var match;
        css = css.replace(/'/g, '"');
        while (null !== (match = regex.exec(css))) {
            if (5 < match.length) {
                storeSelector(resizeRulesPerSelector, match[1] || match[5], match[2], match[3], match[4]);
            }
        }
    }

    /**
     * @param resizeRulesPerSelector - map of selector to rule
     * @param {CssRule[]|String} rules
     */
    function readRules(resizeRulesPerSelector, rules) {
        var selector = '';
        if (!rules) {
            return;
        }
        if ('string' === typeof rules) {
            rules = rules.toLowerCase();
            if (-1 !== rules.indexOf('min-width') || -1 !== rules.indexOf('max-width')) {
                extractQuery(resizeRulesPerSelector, rules);
            }
        } else {
            for (var i = 0, j = rules.length; i < j; i++) {
                if (1 === rules[i].type) {
                    selector = rules[i].selectorText || rules[i].cssText;
                    if (-1 !== selector.indexOf('min-height') || -1 !== selector.indexOf('max-height')) {
                        extractQuery(resizeRulesPerSelector, selector);
                    } else if (-1 !== selector.indexOf('min-width') || -1 !== selector.indexOf('max-width')) {
                        extractQuery(resizeRulesPerSelector, selector);
                    }
                } else if (4 === rules[i].type) {
                    readRules(resizeRulesPerSelector, rules[i].cssRules || rules[i].rules);
                }
            }
        }
    }

    /**
     * Searches all css rules and setups the event listener to all elements with element query rules..
     *
     */
    this.init = function () {
        var resizeRulesPerSelector = Object.create(null);

        for (var i = 0, j = document.styleSheets.length; i < j; i++) {
            try {
                readRules(resizeRulesPerSelector, document.styleSheets[i].cssText || document.styleSheets[i].cssRules || document.styleSheets[i].rules);
            } catch (e) {
                if (e.name !== 'SecurityError') {
                    throw e;
                }
            }
        }
        return resizeRulesPerSelector;
    };

};

ElementQueries.init = function () {
    if (!ElementQueries.instance) {
        ElementQueries.instance = new ElementQueries();
    }

    return ElementQueries.instance.init();
};

