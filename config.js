import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution,
    getConfigState,
    refreshDisplay
} from "./viewer.js";

const twitch = window.Twitch.ext;
const RADIUS_INCREMENT = 5;

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

    if(parsedMessage.type === "grimoire") {
        updateGrimoireState(parsedMessage.grimoire);
    }
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

    const dummyGrimoire = {
        players: [
            {role: "imp"},
            {role: "soldier"},
            {role: "recluse"},
            {role: "sailor"},
            {role: "flowergirl"}
        ]};
    updateGrimoireState(dummyGrimoire);
    updateDisplayResolution("845x480");
});


/**
 * Update the Twitch Config Service with the current values in state
 */
function saveConfig() {
    const config = getConfigState();

    // set config in twitch service
    twitch.configuration.set("broadcaster", "1", JSON.stringify(config));

    // send updates to active viewers
    twitch.send("broadcast", "application/json", {type: "config", settings: config});
}

function handleClickUp() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y - 1});
}
document.getElementById("button-up").addEventListener("click", handleClickUp);

function handleClickDown() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y + 1});
}
document
    .getElementById("button-down")
    .addEventListener("click", handleClickDown);

function handleClickLeft() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x - 1});
}
document
    .getElementById("button-left")
    .addEventListener("click", handleClickLeft);

function handleClickRight() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x + 1});
}
document
    .getElementById("button-right")
    .addEventListener("click", handleClickRight);


function handleBiggerToken() {
    const prevState = getConfigState();
    updateConfigState({tokenSize: prevState.tokenSize + 1});
}
document
    .getElementById("button-bigger")
    .addEventListener("click", handleBiggerToken);

function handleSmallerToken() {
    const prevState = getConfigState();
    updateConfigState({tokenSize: prevState.tokenSize - 1});
}
document
    .getElementById("button-smaller")
    .addEventListener("click", handleSmallerToken);

function handleIncreaseRadius() {
    const prevState = getConfigState();
    updateConfigState({radius: prevState.radius + RADIUS_INCREMENT});
}
document
    .getElementById("button-expand")
    .addEventListener("click", handleIncreaseRadius);

function handleDecreaseRadius() {
    const prevState = getConfigState();
    updateConfigState({radius: prevState.radius - RADIUS_INCREMENT});
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
document.getElementById("button-save").addEventListener("click", saveConfig);

// Setup initial overlay
// createOverlay(state.players, state.radius);
