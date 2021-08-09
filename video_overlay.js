// Control overlay position and role content

// TODO: Pull game state from live game
// we can pull this from localStorage.players on the host

// custom scripts can be parsed similarly from localStorage.edition
// and in fact, maybe we should just do this for all scripts? meh

const MAX_TOKEN_SIZE = 17
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
    tokenSize: 10
}

function validateConfig(config) {
    if(typeof config.players !== 'number' || config.players < 0) {
        return false
    }

    if(typeof config.radius !== 'number' || config.radius < MIN_RADIUS || config.radius > MAX_RADIUS) { 
        return false;
    }

    if(typeof config.tokenSize !== 'number' || config.tokenSize < MIN_TOKEN_SIZE || config.tokenSize > MAX_TOKEN_SIZE) {
        return false;
    }

    if(typeof config.x !== 'number' || config.x < 0 || config.x > WINDOW_MAX) { 
        return false;
    }

    if(typeof config.y !== 'number' || config.y < 0 || config.y > WINDOW_MAX) { 
        return false;
    }
    return true;
}

const twitch = window.Twitch.ext;

// Overwrite options with twitch config if present
if(twitch.configuration.broadcaster) {
    try {
        let config = JSON.parse(twitch.configuration.broadcaster.content);

        if(typeof config === 'object' && validateConfig(config)) {
            // overwrite default state with config from twitch
            state = config;
        } else {
            console.log('Invalid Config')
        }
    } catch (err) {
        console.log('Invalid Config')
    }
}

/**
 * Update values on change
 */
twitch.configuration.onChanged(() => {
    if(twitch.configuration.broadcaster) {
        try {
            let config = JSON.parse(twitch.configuration.broadcaster.content);
    
            if(typeof config === 'object' && validateConfig(config)) {
                // overwrite default state with config from twitch
                state = config;
                moveCenter();
                destroyOverlay();
                createOverlay();
            } else {
                console.log('Invalid Config')
            }
        } catch (err) {
            console.log('Invalid Config')
        }
    }
})

// Core positioning logic
function createOverlay() {

    new MoonMap("#center", {
        n: state.players,
        radius: state.radius,
        moonClass: `${MOON_CLASS} ${MOON_CLASS}-${state.tokenSize}`,
        content: (i) => `<div class="ability">Reminder text</div>`,
    });
}

function destroyOverlay() {
    let moons = Array.from(document.getElementsByClassName(MOON_CLASS))
    moons.forEach(moon => moon.parentNode.removeChild(moon))
}

function moveCenter() {
    const center = document.getElementById("center")
    center.style.top = `${state.y}%`
    center.style.left = `${state.x}%`

}

createOverlay(state.players, state.radius)


