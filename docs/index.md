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
</style>

# The snake library

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



## Demo

Make display similar to yours. And then customize snake.

<svg id="demo" width="100%" height="128"></svg>
<form onchange="redraw(this)" onsubmit="return false;">
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
    <label>Text: <input name="digitsText" type="text"> <button>show</button></label>
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

And here is your constructor:

{:#constructor}
```cpp
Snake snake(ledControl);
```

<script>
    window.start = function(Display, Snake) {
        const config = {};
        window.display = new Display('svg#demo', config);
        window.snake = new Snake(display, display.digitsCount);
        window.timerId = setInterval(() => snake.tick(), 50);

        window.redraw = function(form) {
            const svg = document.querySelector('svg#demo');
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
            
            params = params.map(text => ({class: text === +text ? 'mi' : 'n', text}));
            
            const tags = [
                {class: 'n', text: 'Sanke'},
                {text: ' '},
                {class: 'n', text: 'sanke'},
                {class: 'p', text: '('},
                ...params.reduce((a, b) => [...a, {class: 'p', text: ', '}, b], [params.shift()]),
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
    document.write('Please, use browser that supports JS modules');
</script>

 

## Video of real usage

<center><iframe width="320" height="179" src="https://www.youtube.com/embed/Ws4qPjABhV8" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>