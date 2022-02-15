import baseRoles from "./utils/baseRoles.js";
import CONSTANTS from "./utils/constants.js";
import validateConfig from "./utils/validateConfig.js";

console.log("env: ", process.env.NODE_ENV);

const {
    TOKEN_CLASSNAME,
    DEV_TOKEN_CLASSNAME,
    ABILITY_CLASSNAME
} = CONSTANTS;

let state = {
    config: {
        radius: 150,
        x: 50,
        y: 50,
        tokenSize: 14
    },
    grimoire: {
        players: [],
        edition: {},
        roles: []
    },
    context: {
        displayResolution: "1920x1080",
    },
    isActive: true
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
    const playerCount = players.length;

    if(playerCount <= 0) {
        return;
    }
    
    const angleIncrement = 360 / playerCount;

    const [displayWidth, displayHeight] = displayResolution.split("x");
    
    const displayTokenSize = displayHeight * tokenSize * 0.01;
    const displayRadius = ((displayHeight) / 2) * radius/200;

    const tokenClasses = [TOKEN_CLASSNAME];
    if (process.env.NODE_ENV === "development") {
        tokenClasses.push(DEV_TOKEN_CLASSNAME);
    }
    const tokenClassName = tokenClasses.join(" ");

    // console.log(players);
    for(let i = 0; i < playerCount; i++) {
        const angle = angleIncrement * i;
        
        //set up token container div in circle
        const tokenContainer = document.createElement("div");
        tokenContainer.className = tokenClassName;
        tokenContainer.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${displayRadius}px) rotate(-${angle}deg)`;

        tokenContainer.style.height = `${displayTokenSize}px`;
        tokenContainer.style.width = `${displayTokenSize}px`;

        const player = players[i];
        // console.log(player);
        const abilityNode = createAbilityReminder(player);  
        // console.log(abilityNode);
        
        tokenContainer.appendChild(abilityNode);

        centerNode.appendChild(tokenContainer);
    }
}

function destroyOverlay() {
    let tokenNodes = Array.from(document.getElementsByClassName(TOKEN_CLASSNAME));
    tokenNodes.forEach((tokenNode) => tokenNode.parentNode.removeChild(tokenNode));
}

function moveCenter(x, y) {
    const center = document.getElementById("center");
    center.style.transform = `translate(${x}%, ${y}%)`;
}

/**
 * Create a ability text div for the player at a given index
 * 
 * @param {Object} player the player object to create a reminder token for 
 * @returns {Element} ability node
 */
function createAbilityReminder(player) {
    
    if(!player) {
        return null;
    }
    const role = player.role;
    const reminderText = getRoleAbility(role);
    // console.log(role, reminderText);
    if(!reminderText) {
        return null;
    }

    const abilityNode = document.createElement("div");
    abilityNode.className = ABILITY_CLASSNAME;
    abilityNode.innerHTML = reminderText;
    
    return abilityNode;
}

/**
 * Get a character ability
 * 
 * @param {String} roleName 
 * @returns {String} Ability description
 */
function getRoleAbility(roleName) {
    // Look for role in base roles first, then in custom roles
    // console.log(state.grimoire.roles);
    const role = baseRoles.find(r => r.id === roleName) || state.grimoire.roles.find(r => r.id === roleName);
    if (!role) {
        return false;
    }
    return role.ability;
}

function refreshDisplay() {
    destroyOverlay();
    moveCenter(state.config.x, state.config.y);
    if(state.isActive) {
        createOverlay();
    }
}


// *****************
// * STATE UPDATES *
// *****************

function handleReceiveConfigUpdate (newConfig) {
    console.log("receieved new config", newConfig);
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
    const {x, y, tokenSize, radius} = config;

    let nextConfig = {...state.config};
    nextConfig.x = x || nextConfig.x;
    nextConfig.y = y || nextConfig.y;
    nextConfig.tokenSize = tokenSize || nextConfig.tokenSize;
    nextConfig.radius = radius || nextConfig.radius;

    if(!validateConfig(nextConfig)) {
        console.log("Invalid Config", config);
        return false;
    }
    
    state.config = nextConfig;   
    refreshDisplay();
    return true;
}

function updateOverlayActiveState(isActive) {
    if (typeof isActive === "boolean") state.isActive = isActive;
}


function updateGrimoireState(grimoire) {
    // validateGrimoire(grimoire); // TODO
    const {players, edition, roles} = grimoire;

    state.grimoire.players = players;
    state.grimoire.edition = edition;
    state.grimoire.roles = roles;

    refreshDisplay();
}

function updateDisplayResolution(resolution) {
    state.context.displayResolution = resolution;
    refreshDisplay();
}


export {
    refreshDisplay,
    handleReceiveConfigUpdate,
    updateConfigState,
    updateGrimoireState,
    updateDisplayResolution,
    updateOverlayActiveState,
    getConfigState
};