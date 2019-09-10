---
title: Snake.h
---

<style>
    text {font-family: sans-serif; font-size: 2em; fill: silver; alignment-baseline: middle; text-anchor: middle}
    text.small {font-size: 0.8em; fill: darkgray}
    svg {margin: 0 auto; display: block}
</style>

# Snake.h

### Demo

<svg id="demo" width="100%" height="128"></svg>

<script type="module">
    import Display from "./display.js";
    import Snake from "./snake.js";

    const config = {};

    const params = new URLSearchParams(window.location.search);
    if (params.has('hideDP')) config.showDP = false;
    if (params.has('hideDots')) config.showDots = false;
    if (params.has('debug')) config.showText = true;
    if (params.has('digits')) config.digitsCount = parseInt(params.get('digits'));

    window.display = new Display('svg#demo', config);
    window.snake = new Snake(display, display.digitsCount);

    snake.start();
    window.timerId = setInterval(() => snake.tick(), 50);
</script>
<script nomodule>
    document.write('Please, use browser that supports JS modules');
</script>