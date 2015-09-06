(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', './resize-sensor', './css-rules-extractor'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('./resize-sensor'), require('./css-rules-extractor'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global.resizeSensor, global.cssRulesExtractor);
        global.cssQueriesResizableDirective = mod.exports;
    }
})(this, function (exports, module, _resizeSensor, _cssRulesExtractor) {
    'use strict';

    var queries = new _cssRulesExtractor.ElementQueries();
    var selectors = queries.init();

    /**
     *
     * @param element
     * @returns {Number}
     */
    function getEmSize(element) {
        if (!element) {
            element = document.documentElement;
        }
        var fontSize = getComputedStyle(element, 'fontSize');
        return parseFloat(fontSize) || 16;
    }

    /**
     *
     * @copyright https://github.com/Mr0grog/element-query/blob/master/LICENSE
     *
     * @param {HTMLElement} element
     * @param {*} value
     * @returns {*}
     */
    function convertToPx(element, value) {
        var units = value.replace(/[0-9]*/, '');
        value = parseFloat(value);
        switch (units) {
            case "px":
                return value;
            case "em":
                return value * getEmSize(element);
            case "rem":
                return value * getEmSize();
            // Viewport units!
            // According to http://quirksmode.org/mobile/tableViewport.html
            // documentElement.clientWidth/Height gets us the most reliable info
            case "vw":
                return value * document.documentElement.clientWidth / 100;
            case "vh":
                return value * document.documentElement.clientHeight / 100;
            case "vmin":
            case "vmax":
                var vw = document.documentElement.clientWidth / 100;
                var vh = document.documentElement.clientHeight / 100;
                var chooser = Math[units === "vmin" ? "min" : "max"];
                return value * chooser(vw, vh);
            default:
                return value;
            // for now, not supporting physical units (since they are just a set number of px)
            // or ex/ch (getting accurate measurements is hard)
        }
    }

    module.exports = function () {
        var attributes = ['min-width', 'min-height', 'max-width', 'max-height'];
        return {
            restrict: "A",
            link: function link(scope, elem, attrs) {
                var key,
                    option,
                    width = 0,
                    height = 0,
                    value,
                    actualValue,
                    attrValues,
                    attrValue,
                    attrName;
                var thisElementOptions = [].concat.apply([], Object.keys(selectors).filter(function (key) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = Array.from(elem[0].parentNode.querySelectorAll(key))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var matchingElement = _step.value;

                            if (matchingElement === elem[0]) {
                                return true;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    return false;
                }).map(function (key) {
                    return selectors[key];
                }));
                if (thisElementOptions.length === 0) {
                    return;
                }
                new _resizeSensor.ResizeSensor(elem[0], function () {
                    // extract current dimensions
                    width = elem[0].offsetWidth;
                    height = elem[0].offsetHeight;

                    console.log("on resize", width);

                    attrValues = {};

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = thisElementOptions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            option = _step2.value;

                            value = convertToPx(elem[0], option.value);

                            actualValue = option.property == 'width' ? width : height;
                            attrName = option.mode + '-' + option.property;
                            attrValue = '';

                            if (option.mode == 'min' && actualValue >= value) {
                                attrValue += option.value;
                            }

                            if (option.mode == 'max' && actualValue <= value) {
                                attrValue += option.value;
                            }

                            if (!attrValues[attrName]) attrValues[attrName] = '';
                            if (attrValue && -1 === (' ' + attrValues[attrName] + ' ').indexOf(' ' + attrValue + ' ')) {
                                attrValues[attrName] += ' ' + attrValue;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                _iterator2['return']();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    attributes.forEach(function (attr) {
                        if (attrValues[attr]) {
                            elem[0].setAttribute(attr, attrValues[attr].substr(1));
                        } else {
                            elem[0].removeAttribute(attr);
                        }
                    });
                });
            }
        };
    };
});