import { 
    handleReceiveConfigUpdate, 
    updateConfigState, 
    updateGrimoireState,
    updateDisplayResolution 
} from "./viewer.js";

const twitch = window.Twitch.ext;

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