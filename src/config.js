import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution,
    getConfigState,
} from "./viewer.js";
import { EBS_CASTER, EBS_URL, PUBSUB_SEGMENT_VERSION, SECRET_LENGTH, COORDINATE_INCREMENT } from "./utils/constants.js";
import fs from "fs";

let twitch; 

twitch = window.Twitch?.ext || null;

const RADIUS_INCREMENT = 5;

let playerCount = 5;
const MAX_PLAYERS = 20;

let channelId;
let secretKey;
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
        ].slice(0, playerCount),
        isActive: true
    };
}

updateGrimoireState(makeGrimoire());

function initializeTwitchDataHandlers(twitch) {
    twitch.onContext((context, changed) => {
        if(changed.includes("displayResolution")){
            updateDisplayResolution(context.displayResolution);
        }
    });
   
    
    // Listen for pubsub messages
    twitch.listen("broadcast", (target, contentType, message) => {
        const parsedMessage = JSON.parse(message);
        if(parsedMessage.type === "config") {
            updateConfigState(parsedMessage.settings);
        }
    });
    
    // Update config once it's available
    twitch.configuration.onChanged(() => {
        if (twitch.configuration.broadcaster) {
            handleReceiveConfigUpdate(twitch.configuration.broadcaster.content);
        }
    
        // updateGrimoireState(dummyGrimoire);
        updateDisplayResolution("845x480");
    });


    twitch.onAuthorized(auth => {
        channelId = auth.channelId;
        jwt = auth.token;

        // fetch secretKey from backend if exists
        const ebsEndpointUrl = `${EBS_URL}/${EBS_CASTER}/${channelId}`;
        fetch( ebsEndpointUrl, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + jwt
            },
            redirect: "follow", 
            referrerPolicy: "no-referrer", 
        }).then(response => response.json())
            .then(data => {
                if(data.secretKey) {
                    secretKey = data.secretKey;
                    updateSecretKeyDisplay(secretKey);
                }
            });
    
    });
}

if(twitch) initializeTwitchDataHandlers(twitch); 

function sendSecretKey(secretKey) {
// Save secret key to backend
    const ebsEndpointUrl = `${EBS_URL}/${EBS_CASTER}`;
    const body = JSON.stringify({secretKey, channelId});

    fetch(ebsEndpointUrl, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
        body: body
    }).then(console.log); 
}

/**
 * Update the Twitch Config Service with the current values in state
 */
function saveConfig(twitch) {
    const config = getConfigState();
    // set config in twitch service
    twitch.configuration.set("broadcaster", PUBSUB_SEGMENT_VERSION, JSON.stringify(config));

    // send updates to active viewers
    twitch.send("broadcast", "application/json", {type: "config", settings: config});
}

// Move overlay up
function handleClickUp() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y - COORDINATE_INCREMENT});
}
document.getElementById("button-up").addEventListener("click", handleClickUp);

// Move overlay down
function handleClickDown() {
    const prevState = getConfigState();
    updateConfigState({y: prevState.y + COORDINATE_INCREMENT});
}
document
    .getElementById("button-down")
    .addEventListener("click", handleClickDown);

// Move overlay left
function handleClickLeft() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x - COORDINATE_INCREMENT});
}
document
    .getElementById("button-left")
    .addEventListener("click", handleClickLeft);

// Move overlay right
function handleClickRight() {
    const prevState = getConfigState();
    updateConfigState({x: prevState.x + COORDINATE_INCREMENT});
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

// Handle Secret Key
function getSecretKeyInput(){
    return document.getElementById("secretKeyInput");
}

function updateSecretKeyDisplay(newSecret) {
    const inputNode = getSecretKeyInput();

    if(inputNode && typeof newSecret === "string") {
        inputNode.value=newSecret;
    }
}

function generateSecret() {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = SECRET_LENGTH; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function handleSecretGenerateClick(event) {
    event.preventDefault();
    const newSecret = generateSecret();
    secretKey = newSecret;
    updateSecretKeyDisplay(newSecret);
}

function handleSaveSecretClick(event) {
    event.preventDefault();

    const secretKeyNode = getSecretKeyInput();

    if (!secretKeyNode) {
        return;
    }

    const secretKeyFromNode = secretKeyNode.value;
    if(!secretKey === secretKeyFromNode) {
        return;
    }

    sendSecretKey(secretKey);
}

document.getElementById("secretKeyGenerate").addEventListener("click", handleSecretGenerateClick);
document.getElementById("secretKeySave").addEventListener("click", handleSaveSecretClick);

// Create Bookmarklet click and drag 
const bookmarkletLink = document.getElementById("bookmarkletLink");

// prevent clicking on link
bookmarkletLink.addEventListener("click", (event) => {
    event.preventDefault();
});

// Construct bookmarklet js
const minifiedBookmarkletJs = fs.readFileSync(__dirname + "/bookmarklet/bookmarklet.min.js", "utf8");
const minifiedBookmarkletWithUrl = minifiedBookmarkletJs.replaceAll("EBS_PLACEHOLDER_URL", EBS_URL);
const wrappedBookmarklet = `javascript:${minifiedBookmarkletWithUrl}`;

bookmarkletLink.href = wrappedBookmarklet;