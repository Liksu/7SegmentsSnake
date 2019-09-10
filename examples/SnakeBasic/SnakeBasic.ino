#include <LedControl.h>
#include "Snake.h"

LedControl ledControl = LedControl(11, 13, 10, 1);

Snake snake(ledControl);

void setup() {
    ledControl.shutdown(0, false);
    ledControl.setIntensity(0, 15);
    ledControl.clearDisplay(0);

    snake.start();
}

void loop() {
    snake.tick();
}