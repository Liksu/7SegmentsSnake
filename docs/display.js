/**
 * @typedef {Object} config
 * @property {Boolean} showDP = true - show digital points
 * @property {Boolean} showDots = true - show semicolon (clock's middle dots)
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
        let x = 0;
        for (let i = 0; i < this.digitsCount; i++) {
            this.digits.push(this.makeDigit(x));
            x += this.size.digitWidth + this.size.margin;

            const reverseI = this.digitsCount - i;
            if (this.showDots && reverseI % 2 && reverseI > 2) {
                this.makeSemicolon(x + this.size.radius);
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

    makeSemicolon(x) {
        const group = document.createElementNS(xmlns, 'g');
        group.setAttributeNS(null, 'name', 'semicolon');

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
}