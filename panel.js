const MAX_TOKEN_SIZE = 17;
const MIN_TOKEN_SIZE = 8;

const MAX_RADIUS = 400;
const MIN_RADIUS = 100;

const WINDOW_MAX = 100;

let state = {
    players: 12,
    radius: 210,
    x: 50,
    y: 50,
    tokenSize: 10,
};

const twitch = window.Twitch.ext;

twitch.onContext((context, changed) => {
    console.log(changed, context);
});


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



const log = (...args) => {
    console.log(...args);
    twitch.rig && twitch.rig.log(...args);
};

const configElements = ["players", "radius", "x", "y", "tokenSize"];

function display() {
    configElements.forEach(id => {
        const elt = document.getElementById(id);
        const value = state[id];

        elt.innerHTML=String(value);
    });
}

const updateStateFromConfig = (data) => {
    log("updating state:", data);
    try {
        let config = typeof data === "string" ? JSON.parse(data) : data;
        log("parsed config: ", config);

        if (typeof config === "object" && validateConfig(config)) {
            log("validated config");
            
            state = config;

            display();
        }
        else {
            log("Invalid Config", config);
        }
    } catch (err) {
        log("Unable to parse config", err);
    }
};

function handleReceivedGrimoire(grimoireData) { 
    let {players} = grimoireData;

    state.players = players;
    display();
}

let token, userId;
twitch.onAuthorized((auth) => {
    token= auth.token;
    userId = auth.userId;

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

// Listen for pubsub messages
twitch.listen("broadcast", (target, contentType, message) => {
    console.log(message);
    const parsedMessage = JSON.parse(message);
    if(parsedMessage.type === "config") {
        updateStateFromConfig(parsedMessage.settings);
        display();
    }
});


document.getElementById("fetch-grim").addEventListener("click", () => requestGrimoire("fishcat", token));
// setInterval(() => {
//     if(token) {
//         // console.log("token");
//         requestGrimoire("fishcat", token);
//     } else { 
//         console.log("no token");
//     }
// }, 5000);


const EBS_URL = "localhost:3000/grimoire";
// const EBS_URL = "3dbeea2505a9.ngrok.io/grimoire";

function requestGrimoire(channelId, token) {
    const url = `${location.protocol}//${EBS_URL}/${channelId}`;
    fetch(url, {
        headers: { "Authorization": "Bearer " + token}
    })
        .then(response => {
            if(!response.ok) {
            // debugger;
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        }).then(data => {
            handleReceivedGrimoire(data);
        });
}