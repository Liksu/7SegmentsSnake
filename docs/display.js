//
// Created by Petro Borshchahivskyi on 2019-09-09.
//

/**
 * @typedef {Object} config
 * @property {Boolean} showDP = true - show digital points
 * @property {Boolean} showDots = true - show colon (clock's middle dots)
 * @property {Boolean} showText = false
 * @property {Number} digitsCount = 4
 * @property {Number} size.margin - distance between digits
 * @property {Number} size.segmentWidth - vertical segment width
 * @property {Number} size.segmentHeight - vertical segment height
 * @property {Number} size.radius - dot radius
 * @property {String} colors.normal - color of segment
 * @property {String} colors.active - color of active segment
 * @property {String} colors.dot - color of dots
 * calculated:
 * @property {Number} size.width - SVG width
 * @property {Number} size.height - SVG height
 * @property {Number} size.gap
 * @property {Number} size.gapH
 * @property {Number} size.digitWidth
 * @property {Number} size.digitHeight
 * @property {Number} size.dotsPlace
 */

const xmlns = 'http://www.w3.org/2000/svg';

const defaultOptions = {
    digitsCount: 4,
    showDots: true,
    showDP: true,
    showText: false
};
const defaultSizes = {
    segmentWidth: 16,
    segmentHeight: 64,
    margin: 10
};
const defaultColors = {
    normal: 'lightgray',
    active: 'red',
    dot: 'lightgray'
};


/**
 * class Display
 * @extends config
 */
export default class Display {
    /**
     * @param {Element|String} element - parent element or selector to add SVG container
     * @param {config} options
     */
    constructor(element, options = {}) {
        // store options
        Object.assign(this, {
            ...defaultOptions,
            ...options,
            size: {
                ...defaultSizes,
                ...options.size
            },
            colors: {
                ...defaultColors,
                ...options.colors
            }
        });

        this.svg = this.getSVG(element);
        let sizes = this.getSizesBySegment();

        this.svg.setAttributeNS(null, 'viewBox', `0 0 ${sizes.width} ${sizes.height}`);
        if (!this.givenSVG) {
            this.svg.setAttributeNS(null, 'width', this.size.width || sizes.width);
            this.svg.setAttributeNS(null, 'height', this.size.height || sizes.height);
        }

        Object.assign(this.size, sizes);
        this.polygonShifts = {
            true: Display.getHorizontalPolygonShifts(this.size.segmentWidth, this.size.segmentHeight),
            false: Display.getVerticalPolygonShifts(this.size.segmentWidth, this.size.segmentHeight)
        };
        
        this.draw();
    }
    
    draw() {
        this.digits = [];
        this.colons = [];
        let x = 0;
        for (let i = 0; i < this.digitsCount; i++) {
            this.digits.push(this.makeDigit(x));
            x += this.size.digitWidth + this.size.margin;

            const reverseI = this.digitsCount - i;
            if (this.showDots && reverseI % 2 && reverseI > 2) {
                this.colons.push(this.makeColon(x + this.size.radius));
                x += this.size.dotsPlace;
            }
        }
    }

    getSVG(element = document.body) {
        if (element === String(element)) {
            element = document.querySelector(element);
            if (!element) throw new Error(`Cannot find element "${arguments[0]}"`);
        }

        if (element instanceof SVGElement) {
            this.givenSVG = true;
            return element;
        }

        const svg = document.createElementNS(xmlns, 'svg');
        element.appendChild(svg);

        return svg;
    }

    getSizesBySegment() {
        const sW = this.size.segmentWidth;
        const sH = this.size.segmentHeight;

        const radius = this.size.radius || sW / 2;

        const gap = sW / 2 * Math.sqrt(2) / 4;
        const gapH = gap / Math.sqrt(2);

        const digitWidth = sW + 2 * gapH + sH + this.showDP * sW;
        const digitHeight = sW + 4 * gapH + 2 * sH;

        const dotsPlace = this.size.margin + sW + this.showDP * sW;

        const marginsCount = this.digitsCount - 1;
        const dotsCount = Math.ceil(this.digitsCount / 2) - 1;
        const width = this.digitsCount * digitWidth + this.size.margin * marginsCount + dotsPlace * dotsCount * this.showDots;

        return {radius, gap, gapH, digitWidth, digitHeight, dotsPlace, width, height: digitHeight};
    }

    /**
     * change segment state
     * @param {Number} digit - digit index [0..digitsCount)
     * @param {Number} segment - segment number [1..7]
     * @param {Boolean} show - state
     */
    setSegment(digit, segment, show) {
        this.fillSegment(this.digits[digit][segment - 1], show);
    }

    fillSegment(segment, status = false) {
        segment.setAttribute('fill', status ? this.colors.active : this.colors.normal);
    }

    clearDigit(digitIndex) {
        this.digits[digitIndex].forEach(segment => segment && this.fillSegment(segment, false));
    }

    clear() {
        this.digits.forEach((digit, i) => this.clearDigit(i));
        this.colons.forEach((colon, i) => this.setColon(i, false));
    }

    setChar(digitIndex, char, dot = false) {
        const charByte = Display.getCharByte(char) | dot;
        this.digits[digitIndex].forEach((segment, i) => {
            if (segment) this.fillSegment(segment, charByte >> (7 - i) & 1);
        });
    }

    setWord(word) {
        let char = 0;
        this.digits.forEach((_, i) => {
            const n = i + this.digitsCount % 2;
            if (this.showDots && i && !(n % 2) && word[char] === ':') {
                char++;
                this.setColon(Math.floor(n / 2) - 1, true);
            }
            this.setChar(i, word[char++] || ' ', Boolean(word[char] === '.' && char++));
        });
    }

    setColon(index, dotUp, dotDown = dotUp) {
        if (typeof index === 'boolean' && dotUp === undefined) {
            dotUp = dotDown = index;
            index = 0;
        }

        if (!this.showDots || index >= this.colons.length) return;

        this.fillSegment(this.colons[index].dotUp, dotUp);
        this.fillSegment(this.colons[index].dotDown, dotDown);
    }

    makeDigit(x = 0) {
        const index = this.digits.length;
        const group = document.createElementNS(xmlns, 'g');
        group.setAttributeNS(null, 'name', `digit${index}`);
        this.svg.appendChild(group);

        const {gapH, radius, segmentWidth: sW, segmentHeight: sH, digitWidth: dW, digitHeight: dH} = this.size;
        const shift = sW / 2 + gapH;

        const a = this.addSegment(group,'a', x + shift        , 0                     );
        const b = this.addSegment(group,'b', x + sH + gapH * 2, shift                 );
        const c = this.addSegment(group,'c', x + sH + gapH * 2, shift + sH + 2 * gapH );
        const d = this.addSegment(group,'d', x + shift        , dH - sW               );
        const e = this.addSegment(group,'e', x + 0            , shift + sH + 2 * gapH );
        const f = this.addSegment(group,'f', x + 0            , shift                 );
        const g = this.addSegment(group,'g', x + shift        , sH + 2 * gapH         );
        const dp = this.showDP ? this.addDot(group, x + dW - radius, dH - radius, 'dp') : null;
        if (this.showText) this.addText(group, x + shift + sH / 2, shift + sH / 2, index);

        return Object.assign([a, b, c, d, e, f, g, dp], {a, b, c, d, e, f, g, dp})
    }

    makeColon(x) {
        const group = document.createElementNS(xmlns, 'g');
        group.setAttributeNS(null, 'name', 'colon');

        const shift = this.size.segmentHeight - this.size.radius;

        const dotUp = document.createElementNS(xmlns, 'circle');
        dotUp.setAttribute('cx', x);
        dotUp.setAttribute('cy', shift);
        dotUp.setAttribute('r', this.size.radius);
        dotUp.setAttribute('fill', this.colors.dot);
        group.appendChild(dotUp);

        const dotDown = dotUp.cloneNode();
        dotDown.setAttribute('cy', this.size.digitHeight - shift);
        group.appendChild(dotDown);

        this.svg.appendChild(group);

        return Object.assign([dotUp, dotDown], {dotUp, dotDown});
    }

    addSegment(parent = this.svg, name, x, y) {
        const isHorizontal = ['a', 'd', 'g'].includes(name);
        const points = this.getSegmentPolygon(x, y, isHorizontal);
        const polygon = document.createElementNS(xmlns, 'polygon');
        polygon.setAttribute('class', name);
        polygon.setAttribute('points', points.join(' '));
        polygon.setAttribute('fill', this.colors.normal);
        parent.appendChild(polygon);
        if (this.showText) {
            const shiftW = this.size.segmentWidth / 2;
            const shiftH = this.size.segmentHeight / 2;
            this.addText(parent, x + (isHorizontal ? shiftH : shiftW), y + (isHorizontal ? shiftW : shiftH), name, true);
        }
        return polygon;
    };

    addDot(parent = this.svg, x, y, name = 'dp') {
        const dot = document.createElementNS(xmlns, 'circle');
        dot.setAttribute('class', name);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', this.size.radius);
        dot.setAttribute('fill', this.colors.dot);
        parent.appendChild(dot);
        return dot;
    }

    addText(parent = this.svg, x, y, text, small = false) {
        const textElement = document.createElementNS(xmlns, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.innerHTML = text;
        if (small) textElement.setAttribute('class', 'small');
        parent.appendChild(textElement);
        return textElement;
    }

    getSegmentPolygon(x, y, isHorizontal) {
        return this.polygonShifts[isHorizontal].map(p => (p[0] + x) + ',' + (p[1] + y));
    }
    
    static getVerticalPolygonShifts(sWidth, sHeight) {
        const p = sWidth / 2;
        return [
            [p, 0],
            [sWidth, p],
            [sWidth, sHeight - p],
            [p, sHeight],
            [0, sHeight - p],
            [0, p]
        ];
    }

    static getHorizontalPolygonShifts(sWidth, sHeight) {
        const p = sWidth / 2;
        return [
            [0, p],
            [p, 0],
            [sHeight - p, 0],
            [sHeight, p],
            [sHeight - p, sWidth],
            [p, sWidth]
        ];
    }

    static getCharByte(char) {
        switch (char) {   //   ABCDEFGp           A
            case '0': return 0b11111100;   //    ---
            case '1': return 0b01100000;   //   |   |
            case '2': return 0b11011010;   // F |   | B
            case '3': return 0b11110010;   //   | G |
            case '4': return 0b01100110;   //    ---
            case '5': return 0b10110110;   //   |   |
            case '6': return 0b10111110;   // E |   | C
            case '7': return 0b11100000;   //   |   |
            case '8': return 0b11111110;   //    ---  (*) p
            case '9': return 0b11110110;   //     D

            case 'A':
            case 'a': return 0b11101110;
            case 'B':
            case 'b': return 0b00111110;
            case 'C': return 0b10011100;
            case 'c': return 0b00011010;
            case 'D':
            case 'd': return 0b01111010;
            case 'E':
            case 'e': return 0b10011110;
            case 'F':
            case 'f': return 0b10001110;
            case 'G':
            case 'g': return 0b10111100;
            case 'H': return 0b01101110;
            case 'h': return 0b00101110;
            case 'I':
            case 'i': return 0b00001100;
            case 'J':
            case 'j': return 0b01111000;
            case 'L':
            case 'l': return 0b00011100;
            case 'N':
            case 'n': return 0b00101010;
            case 'O': return 0b11111100;
            case 'o': return 0b00111010;
            case 'P':
            case 'p': return 0b11001110;
            case 'Q':
            case 'q': return 0b11100110;
            case 'R':
            case 'r': return 0b00001010;
            case 'S':
            case 's': return 0b10110110;
            case 'T':
            case 't': return 0b00011110;
            case 'U': return 0b01111100;
            case 'u': return 0b00111000;
            case 'Y':
            case 'y': return 0b01110110;

            case '_': return 0b00010000;
            case '-': return 0b00000010;
            case '°': return 0b11000110;
            case '?': return 0b11001010;

            case 'K':
            case 'k':
            case 'M':
            case 'm':
            case 'V':
            case 'v':
            case 'W':
            case 'w':
            case 'X':
            case 'x':
            case 'Z':
            case 'z':

            case ' ':
            case '':
            default:  return 0b00000000;
        }
    }
}