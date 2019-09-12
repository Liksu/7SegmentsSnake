//
// Created by Petro Borshchahivskyi on 2019-09-09.
//

const steps = [
    0b010010100101,
    0b010010001000,
    0b011110111101,
    0b011110001011,
    0b011110001100,
    0b011000110001,
    0b011000001111,
    0b100011100110,
    0b100010011000,
    0b101111111110,
    0b101110010100,
    0b101110011011,
    0b101001110010,
    0b101000010111,
    0b000100001100,
    0b000100011110,
    0b000100111101,
    0b000110010010,
    0b000110110001,
    0b001010010001,
    0b001011110010,
    0b001100011101,
    0b001100010100,
    0b001101111110,
    0b110100000110,
    0b110100100101,
    0b110110011110,
    0b110110001011,
    0b110110111101,
    0b111010011101,
    0b111010011011,
    0b111011111110,
    0b111100000101,
    0b111101100110
];


export default class Snake {
    constructor(display, digits = 4, delay_ms = 400) {
        this.display = display;
        this.digitsCount = digits;
        this.delay = delay_ms;

        this.tail1 = null;
        this.tail2 = null;
        this.enabled = false;
        this.timer = 0;
    }

    getFirst() {
        let segment = random(7);
        let magic = +!(segment % 3);
        let direction = random(2);
        direction = direction << 1 | (direction ^ magic);

        return (direction << 6) | (random(this.digitsCount) << 3) | (segment + 1);
    }
    
    getNext(position) {
        let prefix = ((position >> 6) & 3) << 3 | (position & 7);
        let shift = 7;
        const digit = (position >> 3) & 7;
        if (digit === 0) {
            prefix = prefix << 1;
            shift--;
            if (this.digitsCount < 2) {
                prefix = prefix << 1;
                shift--;
            }
        } else if (digit === (this.digitsCount - 1)) {
            prefix = prefix << 2;
            shift -= 2;
        }

        let found = -1;
        let temp;
        for (let i = 0; i < steps.length; i++) {
            if (prefix === (steps[i] >> shift) || (shift === 5 && this.digitsCount > 1 && (prefix | 3) === (steps[i] >> shift))) {
                found++;
                temp = steps[i];
                steps[i] = steps[found];
                steps[found] = temp;
            }
        }

        if (found === -1) return 0b01000001;

        temp = found === 0 ? steps[0] : steps[random(found + 1)];

        return ((temp & 3) << 6) | ((digit + (bitRead(temp, 6) ? -1 : 1) * bitRead(temp, 5)) << 3) | ((temp >> 2) & 7);
    }

    drawSeg(pos, show = true) {
        if (pos !== null) this.display.setSegment((pos >> 3) & 7, pos & 7, show);
    }

    move() {
        this.drawSeg(this.tail2, false);

        this.tail2 = this.tail1;
        this.tail1 = this.head;
        this.head = this.getNext(this.head);

        this.drawSeg(this.head, true);
    }

    tick() {
        if (this.enabled && millis() - this.timer > this.delay) {
            this.timer = millis();
            this.move();
        }
    }

    stop(hide = true) {
        this.enabled = false;
        if (hide) this.display.clear();
    }

    start(resetHead = true) {
        if (resetHead) {
            this.head = this.getFirst();
            this.tail1 = null;
            this.tail2 = null;
        }

        this.drawSeg(this.head);
        this.timer = millis();
        this.enabled = true;
    }
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function bitRead(n, i) {
    return Boolean(n >> i & 1);
}

function millis() {
    return Date.now();
}