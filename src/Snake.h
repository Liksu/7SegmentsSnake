//
// Created by Petro Borshchahivskyi on 2019-08-29.
//

#ifndef SNAKE_H
#define SNAKE_H

#include <avr/pgmspace.h>

#ifndef LedControl
#include <LedControl.h>
#endif

#if (ARDUINO >= 100)
#include <Arduino.h>
#else
#include <WProgram.h>
#endif


#define SNAKE_STEPS_COUNT 34
static uint16_t steps[] = {
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
};

class Snake {
private:
    long timer;
    uint8_t digitsCount;
    uint16_t delay;

    LedControl* ledControl;

    uint8_t getFirst();
    uint8_t getNext(uint8_t position);

    void drawSeg(uint8_t pos, bool show = true);

public:
    uint8_t head;
    uint8_t tail1 = 0;
    uint8_t tail2 = 0;
    bool enabled = false;

    Snake(LedControl &ledControl, uint8_t digits = 4, uint16_t delay_ms = 400);

    void move();

    void tick();

    void stop(bool hide = true);

    void start(bool resetHead = true);
};


#endif //SNAKE_H