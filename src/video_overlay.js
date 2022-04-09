import { EBS_GRIMOIRE_PATH, EBS_URL } from "./utils/constants.js";
import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution, 
    updateOverlayActiveState
} from "./viewer.js";

const twitch = window.Twitch.ext;

let channelId;
let jwt;

twitch.onContext((context, changed) => {
    if(changed.includes("displayResolution")){
        updateDisplayResolution(context.displayResolution);
    }
});
   
// Update config once it's available
twitch.configuration.onChanged(() => {
    if (twitch.configuration.broadcaster) {
        handleReceiveConfigUpdate(twitch.configuration.broadcaster.content);
    }
});


twitch.onAuthorized(auth => {
    channelId = auth.channelId;
    jwt = auth.token;

    const ebsEndpointUrl = `${EBS_URL}/${EBS_GRIMOIRE_PATH}/${channelId}`;
    try {
        fetch(ebsEndpointUrl, {
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
        })
            .then(response => response.json())
            .then(data => {
                data.isActive && updateOverlayActiveState(data.isActive);
                data.grimoire && updateGrimoireState(data.grimoire);
            })
            .catch("Error fetching grimoire", console.error); 
    } catch (err) {
        console.error("Error fetching grimoire");
    }
});

// Listen for pubsub messages
twitch.listen("broadcast", (target, contentType, message) => {
    const parsedMessage = JSON.parse(message);
    if(parsedMessage.type === "config") {
        updateConfigState(parsedMessage.settings);
    }

    if(parsedMessage.type === "grimoire") {
        console.log("grimoire received", parsedMessage);
        updateOverlayActiveState(parsedMessage.isActive);
        updateGrimoireState(parsedMessage.grimoire);
    }
});