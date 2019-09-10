# hi

<style>
    text {font-family: sans-serif; font-size: 2em; fill: silver; alignment-baseline: middle; text-anchor: middle}
    text.small {font-size: 0.8em; fill: darkgray}
    svg {margin: 0 auto; display: block}
</style>

<script type="module">
    import Display from "./display.js";
    import Snake from "./snake.js";

    const config = {
        size: {width: '100%'}
    };

    const urlParams = new URLSearchParams(window.location.search);
    const params = Array.from(urlParams).reduce((obj, [k, v]) => (obj[k] = v || true, obj), {});
    if (params.hideDP) config.showDP = false;
    if (params.hideDots) config.showDots = false;
    if (params.debug) config.showText = true;
    if (params.digits) config.digitsCount = parseInt(params.digits);

    window.display = new Display(undefined, config);
    window.snake = new Snake(display, display.digitsCount);

    snake.start();
    window.timerId = setInterval(() => snake.tick(), 50);
</script>
<script nomodule>
    document.write('Please, use browser that supports JS modules');
</script>