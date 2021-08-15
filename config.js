// Control overlay position and role content

// TODO: try allowing the streamer to upload a screencap of their stream as a background image for alignment

// import MoonMap from "./moonmap/moonMap";

const MAX_TOKEN_SIZE = 17;
const MIN_TOKEN_SIZE = 8;

const MAX_RADIUS = 400;
const MIN_RADIUS = 100;
const RADIUS_INCREMENT = 10;

const WINDOW_MAX = 100;

const MOON_CLASS = "clockToken";

let state = {
    players: 12,
    radius: 210,
    x: 50,
    y: 50,
    tokenSize: 10,
};

function validateConfig(config) {
    if (typeof config.players !== "number" || config.players < 0) {
        return false;
    }

    if (
        typeof config.radius !== "number" ||
    config.radius < MIN_RADIUS ||
    config.radius > MAX_RADIUS
    ) {
        return false;
    }

    if (
        typeof config.tokenSize !== "number" ||
        config.tokenSize < MIN_TOKEN_SIZE ||
        config.tokenSize > MAX_TOKEN_SIZE
    ) {
        return false;
    }

    if (typeof config.x !== "number" || config.x < 0 || config.x > WINDOW_MAX) {
        return false;
    }

    if (typeof config.y !== "number" || config.y < 0 || config.y > WINDOW_MAX) {
        return false;
    }
    return true;
}

const twitch = window.Twitch.ext;


const log = (...args) => {
    console.log(...args);
    twitch.rig.log(...args);
};

const updateStateFromConfig = (data) => {
    log(data);
    try {
        let config = JSON.parse(data);
        log("parsed config: ", config);

        if (typeof config === "object" && validateConfig(config)) {
            log("validated config");
            // overwrite default state with config from twitch
            state = config;
            moveCenter();
            destroyOverlay();
            createOverlay();
        }
        else {
            log("Invalid Config", config);
        }
    } catch (err) {
        log("Unable to parse config", err);
    }
};

twitch.onAuthorized((auth) => {
    let { token, userId } = auth;
    log("Auth: ", auth);
    log("initial config", twitch.configuration.broadcaster?.content);

    try {
        updateStateFromConfig(twitch.configuration.broadcaster.content);
    } catch (err) {
        log(err);
    }

    /**
   * Update values on change
   */
    twitch.configuration.onChanged(() => {
        log("config changed");
        if (twitch.configuration.broadcaster) {
            updateStateFromConfig(twitch.configuration.broadcaster.content);
        }
    });

});


/**
 * Update the Twitch Config Service with the current values in state
 */
function updateConfig() {
    twitch.configuration.set("broadcaster", "1", JSON.stringify(state));

    twitch.send("broadcast", "application/json", {type: "config", settings: state});
}

// Core positioning logic
function createOverlay() {
    new MoonMap("#center", {
        n: state.players,
        radius: state.radius,
        moonClass: `${MOON_CLASS} ${MOON_CLASS}-${state.tokenSize}`,
        content: (i) => "<div class=\"ability\">Reminder text</div>",
    });
}

function destroyOverlay() {
    let moons = Array.from(document.getElementsByClassName(MOON_CLASS));
    moons.forEach((moon) => moon.parentNode.removeChild(moon));
}

function moveCenter() {
    const center = document.getElementById("center");
    center.style.top = `${state.y}%`;
    center.style.left = `${state.x}%`;
}

function handleClickUp() {
    state.y = state.y <= 0 ? 0 : state.y - 1;
    moveCenter(state.x, state.y);
}
document.getElementById("button-up").addEventListener("click", handleClickUp);

function handleClickDown() {
    state.y += 1;
    moveCenter(state.x, state.y);
}
document
    .getElementById("button-down")
    .addEventListener("click", handleClickDown);

function handleClickLeft() {
    state.x = state.x <= 0 ? 0 : state.x - 1;
    moveCenter(state.x, state.y);
}
document
    .getElementById("button-left")
    .addEventListener("click", handleClickLeft);

function handleClickRight() {
    state.x += 1;
    moveCenter(state.x, state.y);
}
document
    .getElementById("button-right")
    .addEventListener("click", handleClickRight);

function handleAddPlayer() {
    state.players += 1;
    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-add")
    .addEventListener("click", handleAddPlayer);

function handleRemovePlayer() {
    state.players = state.players <= 0 ? 0 : state.players - 1;

    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-remove")
    .addEventListener("click", handleRemovePlayer);

function handleBiggerToken() {
    state.tokenSize =
    state.tokenSize >= MAX_TOKEN_SIZE ? MAX_TOKEN_SIZE : state.tokenSize + 1;

    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-bigger")
    .addEventListener("click", handleBiggerToken);

function handleSmallerToken() {
    state.tokenSize =
    state.tokenSize <= MIN_TOKEN_SIZE ? MIN_TOKEN_SIZE : state.tokenSize - 1;

    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-smaller")
    .addEventListener("click", handleSmallerToken);

function handleIncreaseRadius() {
    state.radius =
    state.radius >= MAX_RADIUS ? MAX_RADIUS : state.radius + RADIUS_INCREMENT;

    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-expand")
    .addEventListener("click", handleIncreaseRadius);

function handleDecreaseRadius() {
    state.radius =
    state.radius <= MIN_RADIUS ? MIN_RADIUS : state.radius - RADIUS_INCREMENT;

    destroyOverlay();
    createOverlay(state.players, state.radius);
}
document
    .getElementById("button-contract")
    .addEventListener("click", handleDecreaseRadius);

let reader = new FileReader();
reader.addEventListener("load", (event) => {
    const bg = document.getElementById("bg");
    bg.src = reader.result;
    // document.body.style.background = `url(${reader.result}) no-repeat center center fixed`
});

function handleSetBackground(e) {
    var file = e.target.files[0];

    if (file) {
        reader.readAsDataURL(file);
    } else {
        //do nothing
    }
}

document
    .getElementById("button-background")
    .addEventListener("input", handleSetBackground);

// Handle saving settings
document.getElementById("button-save").addEventListener("click", updateConfig);

// Setup initial overlay
createOverlay(state.players, state.radius);
