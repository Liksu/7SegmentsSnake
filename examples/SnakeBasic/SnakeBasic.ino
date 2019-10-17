#include <LedControl.h>
#include <Snake.h>

// connect display with LedControl
// LedControl(dataPin, clockPin, csPin, numDevices)
LedControl ledControl = LedControl(12, 11, 10, 1);

// create Snake instance
// parameters: ledControl (required), digitsCount = 4, delay = 400 ms
Snake snake(ledControl);

void setup() {
    // prepare display
    ledControl.shutdown(0, false);
    ledControl.setIntensity(0, 15);
    ledControl.clearDisplay(0);

    // start serial for debug
    Serial.begin(9600);

    // make random more random
    randomSeed(analogRead(A7));

    // start snake
    snake.start();
}

void loop() {
    // move snake
    snake.tick();

    // add some commands via serial
    String input;
    while (Serial.available()) {
        input = Serial.readString();
        if (input.startsWith(F("stop"))) snake.stop();
        if (input.startsWith(F("pause"))) snake.stop(false);
        if (input.startsWith(F("continue"))) snake.start(false);
        if (input.startsWith(F("go"))) snake.start(false);
        if (input.startsWith(F("restart"))) {
            ledControl.clearDisplay(0);
            snake.start();
        }
        if (input.startsWith(F("start"))) snake.start();
    }
}
