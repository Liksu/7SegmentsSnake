//
// Created by Petro Borshchahivskyi on 2019-08-29.
//

#include "Snake.h"

Snake::Snake(LedControl &ledControl, uint8_t digits, uint16_t delay_ms) {
    this->ledControl = &ledControl;
    this->digitsCount = digits;
    this->delay = delay_ms;
}

uint8_t Snake::getFirst() {
    uint8_t segment = random(7);
    bool isHorizontal = !(segment % 3);
    uint8_t direction = random(2);
    direction = direction << 1 | (direction ^ isHorizontal);

    return (direction << 6) | (random(digitsCount) << 3) | (segment + 1);
}

uint8_t Snake::getNext(uint8_t position) {
    uint8_t prefix = ((position >> 6) & 3) << 3 | (position & 7);
    uint8_t shift = 7;
    uint8_t digit = (position >> 3) & 7;
    if (digit == 0) {
        prefix = prefix << 1;
        shift--;
        if (digitsCount == 1) {
            prefix = prefix << 1;
            shift--;
        }
    } else if (digit == (digitsCount - 1)) {
        prefix = prefix << 2;
        shift -= 2;
    }

    uint8_t found = -1;
    uint16_t temp;
    for (uint8_t i = 0; i < SNAKE_STEPS_COUNT; i++) {
        if (prefix == (steps[i] >> shift) || (shift == 5 && digitsCount > 1 && (prefix | 3) == (steps[i] >> shift))) {
            found++;
            temp = steps[i];
            steps[i] = steps[found];
            steps[found] = temp;
        }
    }

    if (found == -1) return 0b01000001;

    temp = found == 0 ? steps[0] : steps[random(found + 1)];

    return ((temp & 3) << 6) | ((digit + (bitRead(temp, 6) ? -1 : 1) * bitRead(temp, 5)) << 3) | ((temp >> 2) & 7);
}

void Snake::drawSeg(uint8_t pos, bool show) {
    ledControl->setLed(0, (pos >> 3) & 7, pos & 7, show);
}

void Snake::move() {
    drawSeg(tail2, false);

    tail2 = tail1;
    tail1 = head;
    head = getNext(head);

    drawSeg(head, true);
}

void Snake::tick() {
    if (enabled && millis() - timer > delay) {
        timer = millis();
        move();
    }
}

void Snake::stop(bool hide = true) {
    enabled = false;
    if (hide) {
        drawSeg(head, false);
        drawSeg(tail1, false);
        drawSeg(tail2, false);
    }
}

void Snake::start(bool resetHead = true) {
    if (resetHead) head = getFirst();

    drawSeg(head);
    timer = millis();
    enabled = true;
}
