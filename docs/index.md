---
title: Snake.h
---

<link rel="shortcut icon" type="image/gif" href="./favicon.ico"/>
<script>
    var link = document.querySelector("link[rel*='icon']");
    document.getElementsByTagName('head')[0].appendChild(link);
</script>

<style>
    text {font-family: sans-serif; font-size: 2em; fill: silver; alignment-baseline: middle; text-anchor: middle}
    text.small {font-size: 0.8em; fill: darkgray}
    svg {margin: 0 auto; display: block}
    fieldset {width: 80%; margin: 2em auto}
    fieldset input {vertical-align: middle}
    label {display: block}
    fieldset > legend {padding: 0 1em}
    .hidden {display: none}
</style>

# The Arduino snake library

This library allows to run snake on 7-segments display driven by [LedControl](http://wayoda.github.io/LedControl/).
It was made as 'screen saver' for idle mode in our product.

## Install

Library available in the [library manager](http://arduino.cc/en/pmwiki.php?n=Guide/Libraries).<br>
Also, you can find the latest version on github [project release page](https://github.com/Liksu/7SegmentsSnake/releases).


## Example

```cpp
#include <LedControl.h>
#include <Snake.h>

// connect display with LedControl
LedControl ledControl = LedControl(12, 11, 10, 1);

// create Snake instance
// parameters: ledControl (required), digitsCount = 4, delay = 400 ms
Snake snake(ledControl);

void setup() {
    // start snake
    snake.start();
}

void loop() {
    // move snake
    snake.tick();
}
```

 

## Usage

### Initialization

Make sure that you have LedControl and it was added to your project.

#### Add snake library to your project:

```cpp
#include <Snake.h>
```

#### Create snake variable:

```cpp
Snake snake(ledControl);
```

First parameter is required and should be the LedControl instance.<br>
Also there are two optional parameters that you can pass to Snake constructor:

* `digitsCount` — numbers of digits on your display, 4 by default
* `delay` — the minimum delay in milliseconds between snake movement, 400 ms by default

Like this:
```cpp
Snake snake(ledControl);
Snake snake(ledControl, 2);
Snake snake(ledControl, 8, 100);
```

Snake library does not use real `delay()` call, so pause between movements are not blocking.

#### Prepare to start:

```cpp
snake.start();
```

This command initialize position of snake's head (put it to te display in random place) and make some other preparation before run.

### Movements

You can choose two ways to move the snake. The first is to call `snake.tick()` on each iteration of main `loop`:

```cpp
void loop() {
    snake.tick();
}
```

In this case, the snake will be automatically moved when delay will over.

The second way is to move snake manually via calling the `snake.move()` manually, when you need it.

## Available methods

### snake.start

```cpp
void start(bool resetHead = true);
```

Prepares snake to move.<br>
Parameter `resetHead` defines do library need to re-generate head position or use existing.
Using it as `false` allows to implement `continue after pause` behavior instead of restart.

### snake.stop

```cpp
void stop(bool hide = true);
```

Stops snake on display.
If parameter `hide` will be true (default behavior), segments of the snake will be switched off.
Otherwise, it just stops movements (exclude manually) and allows to implement `pause`. 

### snake.move

```cpp
void move();
```

Manually moves snake on display.<br>
Do not use `snake.enabled` flag.

### snake.tick

```cpp
void tick();
```

Allows to check time and move snake in main sketch's `loop`.

### property snake.enabled

Type `bool`, represent state of snake.<br>
if `false`, snake wont move on tick calls.<br>
Managed by `snake.start` and `snake.stop` methods.

 

## Demo

Make display similar to yours. And then customize the snake:

<svg id="demoSVG" width="100%" height="128"></svg>

<form id="demoFORM" onchange="redraw(this)" onsubmit="return false;">
<fieldset>
    <legend>Display:</legend>
    <label><input type="checkbox" name="showDP" checked> show digital points</label>
    <label><input type="checkbox" name="showDots" checked> show colons</label>
    <label>
        <input type="range" id="digits" value="4" min="1" max="8" step="1" name="digits" oninput="digitsOutput.value = this.value">
        digits count:
        <output name="digitsOutput">4</output>
    </label>
    <hr>
    <label>Text: <input name="digitsText" type="text"> <button onclick="display.setWord(digitsText.value)">show</button></label>
    <p>
        <button onclick="digitsText.value = display.clear() || ''">clear</button>
    </p>
</fieldset>
<fieldset>
    <legend>Snake:</legend>
    <label>
        <input type="range" id="delay" value="400" min="50" max="1000" step="50" name="delay" oninput="snake.delay = delayOutput.value = this.value">
        delay:
        <output name="delayOutput">400</output>
        ms.
    </label>
    <p>
        <button onclick="snake.start()">start</button>
        <button onclick="snake.stop(false)">pause</button>
        <button onclick="snake.start(false)">continue</button>
        <button onclick="snake.stop()">stop</button>
    </p>
</fieldset>
</form>

{:#demoP}
And here is your constructor:

{:#constructor}
```cpp
Snake snake(ledControl);
```

{:#nomodule.hidden}
Please, use browser that supports JS modules

<script>
    window.start = function(Display, Snake) {
        const config = {};
        window.display = new Display('svg#demoSVG', config);
        window.snake = new Snake(display, display.digitsCount);
        window.timerId = setInterval(() => snake.tick(), 50);

        window.redraw = function(form) {
            const svg = document.querySelector('svg#demoSVG');
            svg.innerHTML = '';
            const config = {
                digitsCount: form.digits.value,
                showDP: form.showDP.checked,
                showDots: form.showDots.checked
            };

            snake.display = window.display = new Display(svg, config);
            if (form.digitsText.value) display.setWord(form.digitsText.value);
            
            if (snake.digitsCount != config.digitsCount) {
                snake.digitsCount = +config.digitsCount;
                if (snake.enabled) snake.start();
            }
            
            let params = [];
            if (form.delay.value != 400) params.push(form.delay.value);
            if (form.digits.value != 4 || params.length) params.unshift(form.digits.value);
            params.unshift('ledControl');
            
            params = params.map(text => ({class: isNaN(parseInt(text)) ? 'n' : 'mi', text}));
            
            const tags = [
                {class: 'n', text: 'Snake'},
                {text: ' '},
                {class: 'n', text: 'snake'},
                {class: 'p', text: '('},
                ...params.reduce((a, b) => [...a, {class: 'p', text: ','}, {text: ' '}, b], [params.shift()]),
                {class: 'p', text: ');'},
            ].map(tag => tag.class ? `<span class="${tag.class}">${tag.text}</span>` : tag.text);
            
            document.querySelector('#constructor code').innerHTML = tags.join('');
        };

        snake.start();
    };
</script>

<script type="module">
    import Display from "./display.js";
    import Snake from "./snake.js";
    window.start(Display, Snake);
</script>
<script nomodule>
    document.getElementById('nomodule').style.display = 'block';
    'demoSVG demoFORM demoP constructor'.split(' ').forEach(function(selector) {
        document.getElementById(selector).style.display = 'none';
    });
</script>

 

## Video of real usage

<center><iframe width="320" height="179" src="https://www.youtube.com/embed/Ws4qPjABhV8" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

 

## Feedback

If you find an error or have any other questions, please open issue on the [github project page](https://github.com/Liksu/7SegmentsSnake/issues).
Or you can contact me using e-mail: [dev@Liksu.com](mailto:dev@Liksu.com).

<hr>

© 2019 Petro Borshchahivskyi
