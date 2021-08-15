import baseRoles from "./baseRoles.js";
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
const ABILITY_CLASSNAME = "ability";

let state = {
    players: 12,
    radius: 210,
    x: 50,
    y: 50,
    tokenSize: 10,
    grimoire: {
        players: [{name: "test", ability:"placeholder"}],
        edition: {}
    }
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
            state = {...state, ...config};
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

function updateGrimoire(grimoire) {
    // validateGrimoire(grimoire);

    const {players, edition} = grimoire;

    state.grimoire.players = players;
    state.grimoire.edition = edition;

    state.players = players.length;
    
    destroyOverlay();
    createOverlay();
}

twitch.onAuthorized((auth) => {
    let { token, userId } = auth;
    log("Auth: ", auth);

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

// Listen for pubsub messages
twitch.listen("broadcast", (target, contentType, message) => {
    const parsedMessage = JSON.parse(message);
    if(parsedMessage.type === "config") {
        updateStateFromConfig(JSON.stringify(parsedMessage.settings));
    }

    if(parsedMessage.type === "grimoire") {
        console.log("grimoire update: ", parsedMessage.grimoire);
        updateGrimoire(parsedMessage.grimoire);
    }

    if(parsedMessage.type === "test") {
        console.log("PUBSUB TEST (from EBS)", parsedMessage.content);
    }
});

/**
 * Create a ability text div for the player at a given index
 * 
 * @param {Number} playerIndex 
 * @returns {String} ability as HTML
 */
function createReminder(playerIndex) {
    const player = state.grimoire.players[playerIndex];
    if(!player) {
        return `<div class="${ABILITY_CLASSNAME}">PLAYER MISSING</div>`;
    }

    const role = player.role;

    const reminderText = getRoleReminder(role);

    return `<div class="${ABILITY_CLASSNAME}">${reminderText}</div>`;
}

/**
 * Get a character ability
 * 
 * @param {String} roleName 
 * @returns {String} Ability description
 */
function getRoleReminder(roleName) {
    const role = baseRoles.find(r => r.id === roleName);
    if (!role) {
        return "Unknown Ability";
    }
    return role.ability;
}


// Core positioning logic
function createOverlay() {
    new MoonMap("#center", {
        n: state.players,
        radius: state.radius,
        moonClass: `${MOON_CLASS} ${MOON_CLASS}-${state.tokenSize}`,
        content: (i) => createReminder(i),
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


// Setup initial overlay
createOverlay(state.players, state.radius);
