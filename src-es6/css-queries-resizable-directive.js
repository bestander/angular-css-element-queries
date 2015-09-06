import { ResizeSensor } from './resize-sensor';
import { ElementQueries } from './css-rules-extractor';

var queries = new ElementQueries();
var selectors = queries.init();

// TODO use a better resize detector https://github.com/wnr/element-resize-detector

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


export default function () {
    var attributes = ['min-width', 'min-height', 'max-width', 'max-height'];
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            var key, option, width = 0, height = 0, value, actualValue, attrValues, attrValue, attrName;
            var thisElementOptions = [].concat.apply([], Object.keys(selectors)
                .filter((key) => {
                    for (let matchingElement of Array.from(elem[0].parentNode.querySelectorAll(key))) {
                        if (matchingElement === elem[0]) {
                            return true;
                        }
                    }
                    return false;
                })
                .map(key => selectors[key]));
            if (thisElementOptions.length === 0) {
                return;
            }
            new ResizeSensor(elem[0], () => {
                // extract current dimensions
                width = elem[0].offsetWidth;
                height = elem[0].offsetHeight;

                console.log("on resize", width);

                attrValues = {};

                for (option of thisElementOptions) {

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

                attributes.forEach((attr) => {
                    if (attrValues[attr]) {
                        elem[0].setAttribute(attr, attrValues[attr].substr(1));
                    } else {
                        elem[0].removeAttribute(attr);
                    }
                });
            });
        }
    }
}
