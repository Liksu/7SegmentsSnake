#include <LedControl.h>
#include "Snake.h"

// connect display with LedControl
LedControl ledControl = LedControl(12, 11, 10, 1);

// create Snake instance
// parameters: ledControl (required), digitsCount = 4, delay = 400 ms
Snake snake(ledControl);

void setup() {
    // prepare display
    ledControl.shutdown(0, false);
    ledControl.setIntensity(0, 15);
    ledControl.clearDisplay(0);

    // start snake
    snake.start();
}

void loop() {
    // move snake
    snake.tick();
}