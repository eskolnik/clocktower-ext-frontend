import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution,
    getConfigState,
} from "./viewer.js";
import { EBS_CASTER, EBS_URL } from "./utils/constants.js";

const twitch = window.Twitch.ext;
const RADIUS_INCREMENT = 5;

let playerCount = 5;
const MAX_PLAYERS = 20;

let channelId;
let jwt;

/**
 * Mock grimoire state to allow any number of tokens for config
 * 
 * @returns {Object} a mock grimoire with the correct number of players
 */
function makeGrimoire() {
    return {
        players: [
            {role: "washerwoman"},
            {role: "librarian"},
            {role: "investigator"},
            {role: "chef"},
            {role: "empath"},
            {role: "fortuneteller"},
            {role: "undertaker"},
            {role: "monk"},
            {role: "ravenkeeper"},
            {role: "virgin"},
            {role: "slayer"},
            {role: "soldier"},
            {role: "mayor"},
            {role: "butler"},
            {role: "drunk"},
            {role: "recluse"},
            {role: "saint"},
            {role: "imp"},
            {role: "baron"},
            {role: "spy"},
        ].slice(0, playerCount)
    };
}

updateGrimoireState(makeGrimoire());

twitch.onContext((context, changed) => {
    if(changed.includes("displayResolution")){
        updateDisplayResolution("845x480");
        // updateDisplayResolution(context.displayResolution);
    }
});
   
// Update config once it's available
twitch.configuration.onChanged(() => {
    if (twitch.configuration.broadcaster) {
        handleReceiveConfigUpdate(twitch.configuration.broadcaster.content);
    }
});

// Listen for pubsub messages
twitch.listen("broadcast", (target, contentType, message) => {
    const parsedMessage = JSON.parse(message);
    if(parsedMessage.type === "config") {
        updateConfigState(parsedMessage.settings);
    }

    // if(parsedMessage.type === "grimoire") {
    //     updateGrimoireState(parsedMessage.grimoire);
    // }
});


const log = (...args) => {
    console.log(...args);
    twitch.rig.log(...args);
};

twitch.configuration.onChanged(() => {
    log("config changed");
    if (twitch.configuration.broadcaster) {
        handleReceiveConfigUpdate(twitch.configuration.broadcaster.content);
    }


    // updateGrimoireState(dummyGrimoire);
    updateDisplayResolution("845x480");
});

twitch.onAuthorized(auth => {
    channelId = auth.channelId;
    jwt = auth.token;
});


/**
 * Update the Twitch Config Service with the current values in state
 */
function saveConfig() {
    const config = getConfigState();
    console.log(config);
    // set config in twitch service
    twitch.configuration.set("broadcaster", "1", JSON.stringify(config));

    // Save secret key to backend
    // const ebsEndpointUrl = path.join(EBS_URL, "broadcaster");
    const ebsEndpointUrl = `${EBS_URL}/${EBS_CASTER}`;
    const body = JSON.stringify({secretKey: "TESTKEY", channelId: channelId});

    console.log(ebsEndpointUrl);

    fetch(ebsEndpointUrl, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body
    }).then(console.log); 

    // send updates to active viewers
    twitch.send("broadcast", "application/json", {type: "config", settings: config});
}

// Move overlay up
function handleClickUp() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y - 1});
}
document.getElementById("button-up").addEventListener("click", handleClickUp);

// Move overlay down
function handleClickDown() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y + 1});
}
document
    .getElementById("button-down")
    .addEventListener("click", handleClickDown);

// Move overlay left
function handleClickLeft() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x - 1});
}
document
    .getElementById("button-left")
    .addEventListener("click", handleClickLeft);

// Move overlay right
function handleClickRight() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x + 1});
}
document
    .getElementById("button-right")
    .addEventListener("click", handleClickRight);

// Increase token size
function handleBiggerToken() {
    const prevState = getConfigState();
    updateConfigState({tokenSize: prevState.tokenSize + 1});
}
document
    .getElementById("button-bigger")
    .addEventListener("click", handleBiggerToken);

// Decrease token size
function handleSmallerToken() {
    const prevState = getConfigState();
    updateConfigState({tokenSize: prevState.tokenSize - 1});
}
document
    .getElementById("button-smaller")
    .addEventListener("click", handleSmallerToken);

// Increase circle radius
function handleIncreaseRadius() {
    const prevState = getConfigState();
    updateConfigState({radius: prevState.radius + RADIUS_INCREMENT});
}
document
    .getElementById("button-expand")
    .addEventListener("click", handleIncreaseRadius);

// Decrease circle radius
function handleDecreaseRadius() {
    const prevState = getConfigState();
    updateConfigState({radius: prevState.radius - RADIUS_INCREMENT});
}
document
    .getElementById("button-contract")
    .addEventListener("click", handleDecreaseRadius);

// Add a player. On this page only, NOT saved to global config.
function handleAddPlayer() {
    if (playerCount < MAX_PLAYERS){
        playerCount++;
    }
    updateGrimoireState(makeGrimoire());
}
document.getElementById("button-addPlayer").addEventListener("click", handleAddPlayer);

// Remove a player. On this page only, NOT saved to global config.
function handleRemovePlayer() {
    if (playerCount > 0){
        playerCount--;
    }
    updateGrimoireState(makeGrimoire());
}
document.getElementById("button-removePlayer").addEventListener("click", handleRemovePlayer);

let reader = new FileReader();
reader.addEventListener("load", (event) => {
    const bg = document.getElementById("bg");
    bg.src = reader.result;
});

function handleSetBackground(e) {
    var file = e.target.files[0];

    if (file) {
        reader.readAsDataURL(file);
    }
}

document
    .getElementById("button-background")
    .addEventListener("input", handleSetBackground);

// Handle saving settings
document.getElementById("button-save").addEventListener("click", saveConfig);
