import baseRoles from "./baseRoles.js";
import CONSTANTS from "./utils/constants.js";
import validateConfig from "./utils/validateConfig.js";

const {
    TOKEN_CLASSNAME,
    ABILITY_CLASSNAME
} = CONSTANTS;


let state = {
    config: {
        radius: 140,
        x: 50,
        y: 50,
        tokenSize: 14,
    },
    grimoire: {
        players: [],
        edition: {}
    },
    context: {
        displayResolution: "1920x1080"
    }
};

// Exposed for config view
function getConfigState() {
    return {...state.config};
}


// *******************
// * DISPLAY METHODS *
// *******************

function createOverlay(players, radius, tokenSize, displayResolution) {
    players ||= state.grimoire.players;
    radius ||= state.config.radius;
    tokenSize ||= state.config.tokenSize;
    displayResolution ||= state.context.displayResolution;
    
    
    const centerNode = document.getElementById("center");
    console.log(players, displayResolution, centerNode);
    const playerCount = players.length;

    if(playerCount <= 0) {
        return;
    }
    
    const angleIncrement = 360 / playerCount;

    const [displayWidth, displayHeight] = displayResolution.split("x");
    
    const displayTokenSize = displayHeight * tokenSize * 0.01;
    const displayRadius = ((displayHeight) / 2) * radius/200;
    
    for(let i = 0; i < playerCount; i++) {
        const angle = angleIncrement * i;
        
        //set up token container div in circle
        const tokenContainer = document.createElement("div");
        tokenContainer.className = TOKEN_CLASSNAME;
        tokenContainer.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${displayRadius}px) rotate(-${angle}deg)`;

        // tokenElement.className=MOON_CLASS+"-14";
        tokenContainer.style.height = `${displayTokenSize}px`;
        tokenContainer.style.width = `${displayTokenSize}px`;

        const player = players[i];
        tokenContainer.appendChild(createReminder(player));

        centerNode.appendChild(tokenContainer);
    }
}

function destroyOverlay() {
    let tokenNodes = Array.from(document.getElementsByClassName(TOKEN_CLASSNAME));
    tokenNodes.forEach((tokenNode) => tokenNode.parentNode.removeChild(tokenNode));
}

function moveCenter(x, y) {
    const center = document.getElementById("center");
    center.style.top = `${y}%`;
    center.style.left = `${x}%`;
}

/**
 * Create a ability text div for the player at a given index
 * 
 * @param {Object} player the player object to create a reminder token for 
 * @returns {Element} ability node
 */
function createReminder(player) {
    const abilityNode = document.createElement("div");
    abilityNode.className = ABILITY_CLASSNAME;
    
    if(!player) {
        abilityNode.innerHTML = "PLAYER MISSING";
    } else {
        const role = player.role;
    
        const reminderText = getRoleReminder(role);
        abilityNode.innerHTML = reminderText;
    }

    return abilityNode;
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

function refreshDisplay() {
    console.log("display", state);
    moveCenter(state.config.x, state.config.y);
    destroyOverlay();
    createOverlay();
}


// *****************
// * STATE UPDATES *
// *****************

function handleReceiveConfigUpdate (newConfig) {
    try {
        const config = JSON.parse(newConfig);
        if (typeof config === "object") {
            updateConfigState(config);
        }
        else {
            console.log("Invalid Config", config);
        }
    } catch (err) {
        console.log("Unable to parse config", newConfig, err);
    }
}

function updateConfigState(config) {
    const nextConfig = {...state.config, ...config};

    if(!validateConfig(nextConfig)) {
        console.log("Invalid Config", config);
        return false;
    }
    
    state.config = nextConfig;   
    refreshDisplay();
    return true;
}


function updateGrimoireState(grimoire) {
    // validateGrimoire(grimoire); // TODO
    const {players, edition} = grimoire;

    state.grimoire.players = players;
    state.grimoire.edition = edition;
    
    refreshDisplay();
}

function updateDisplayResolution(resolution) {
    state.context.displayResolution = resolution;
    refreshDisplay();
}


export {refreshDisplay, handleReceiveConfigUpdate, updateConfigState, updateGrimoireState, updateDisplayResolution, getConfigState};