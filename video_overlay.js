import { EBS_GRIMOIRE, EBS_URL } from "./utils/constants.js";
import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution 
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

    const ebsEndpointUrl = `${EBS_URL}/${EBS_GRIMOIRE}`;
    fetch(ebsEndpointUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
        .then(response => response.json())
        .then(data => {
            data.grimoire && updateGrimoireState(data.grimoire);
        })
        .catch(console.error); 
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