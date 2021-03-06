// BOOKMARKLET
// This JS code is meant to be executed as a bookmarklet link against a clocktower.online browser tab. 
// As such, it should be prepended with "javascript:" 
// javascript: 
(
    () => {
        const extensionNodeId = "botcTwitchExtension";
        const configMenuNodeId = "botcTwitchExtensionConfig";

        // placeholder strings will be replaced with the real values during the build process
        const EBS_URL="EBS_URL_PLACEHOLDER";
        const VERSION="VERSION_PLACEHOLDER";

        const localStorageExtensionLoadedKey = "twitchBotcExtensionLoaded"; 
        const localStorageSecretKey = "twitchBotcExtensionSecret";

        // Only load one instance of extension at a time
        if(document.getElementById(extensionNodeId) ) {
            return;
        } else if (localStorage.getItem(localStorageExtensionLoadedKey) === "true") {
            const confirmation =  window.confirm("Extension already loaded in another tab. Using two instances at once may cause errors. Load extension on this page anyway?");
            if(!confirmation) {
                return;
            }
        }
        
        // Set the extension flag in localstorage to avoid loading the extension twice
        localStorage.setItem(localStorageExtensionLoadedKey, "true");

        // Check for secret in localstorage
        const secretKeyFromLocalStorage = localStorage.getItem(localStorageSecretKey);

        // Initialize state
        let state = {
            session: "",
            playerId: null,
            isHost: false,
            players: [],
            bluffs: [],
            edition: {},
            roles: [],
            fabled: [],
            secretKey: secretKeyFromLocalStorage || "",
            isExtensionActive: false,
            menuVisible: false
        };


        function grimoireToJson(data) {
            return JSON.stringify({
                session: data.session,
                playerId: data.playerId,
                isHost: data.isHost,
                players: data.players,
                bluffs: data.bluffs,
                edition: data.edition,
                roles: data.roles,
                fabled: data.fabled,
                secretKey: data.secretKey
            });
        }

        function wrappedFetch(url, body){
            return fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                    // "Content-Type": "text/plain"
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: body 
            });
        }

        function sendGrimoire(state){
            const url = `${EBS_URL}/grimoires/`;

            const body = grimoireToJson(state);

            wrappedFetch(url, body);
        }
        
        function sendSession(state) {
            const url = `${EBS_URL}/sessions/`;
            
            const { session, playerId, isExtensionActive, secretKey } = state;
            const body = {session, playerId, isActive: isExtensionActive, secretKey};

            wrappedFetch(url, JSON.stringify(body)); 
        }

        function assignStyles(node, styles) {
            Object.assign(node.style, styles);
        }
        
        // ----------------------------------------------------------------------------
        //  EXTENSION ICON
        // ----------------------------------------------------------------------------
        const controlsNode = document.getElementById("controls");
        const extensionNode = document.createElement("div");
        extensionNode.id = extensionNodeId;
        const extensionStyles = {
            position:  "absolute",
            width:"40px",
            height:"40px",
            border: "3px solid #6441a4",
            borderRadius: "25%",
            background: "white",
            transform:"translateX(calc(-100% - 3px)",
            cursor: "pointer"
        };
        
        assignStyles(extensionNode, extensionStyles);
        
        const iconNode = document.createElement("div");
        iconNode.innerHTML="CC";
        const iconStyles = {
            color: "#6441a4",
            fontSize: "larger",
            fontWeight: "bold",
            userSelect: "none"
        };
        assignStyles(iconNode, iconStyles);
        extensionNode.appendChild(iconNode);
   
        // -------------------------------------------------------------------------
        //  CONFIG MENU
        // -------------------------------------------------------------------------
        
        const configMenuNode = document.createElement("div");
        configMenuNode.id = configMenuNodeId;
        const configMenuStyles = {
            width: "300px",
            height: "300px",
            background: "rgb(200, 181, 234)",
            color: "black",
            fontSize: "16px",
            overflow: "wrap",
            padding: "10px",
            border: "10px solid #6441a4",
            borderRadius: "30px",
            transform: "translateX(-100%)",
            display: "none",
            textAlign: "left"
            
        };

        assignStyles(configMenuNode, configMenuStyles);

        const createConfigMenuRow = (...elements) => {
            const rowNode = document.createElement("div");
            const rowStyles = {
                display: "flex",
                flexDirection: "row",
                justifyContents: "space-between"
            };

            assignStyles(rowNode, rowStyles);

            rowNode.append(...elements);
            return rowNode;
        };

        // ---------------------------------------------------------------------------------
        //  SECRET KEY INPUT
        // ---------------------------------------------------------------------------------
        const secretKeyInstructionsNode = document.createElement("p");
        secretKeyInstructionsNode.innerHTML = "Paste the secret key you generated on the extension config page here.";
        assignStyles(secretKeyInstructionsNode, {
            marginTop: "0px"
        });

        const secretKeyInputNode = document.createElement("input");
        secretKeyInputNode.type="password";
        secretKeyInputNode.id = "twitch-config-channelInput";

        // set the secret input to the value from localstorage
        secretKeyInputNode.value = state.secretKey;

        const secretKeyInputStyle = {
            width: "50%",
            marginRight: "10px"
        };

        assignStyles(secretKeyInputNode, secretKeyInputStyle);
        
        const secretKeyLabelNode = document.createElement("label");
        secretKeyLabelNode.htmlFor="twitch-config-channelInput";
        secretKeyLabelNode.innerHTML="Secret Key:";
        const secretKeyLabelStyles = {
            color: "black",
            fontSize: "16px",
            paddingRight: "5px",
        };

        assignStyles(secretKeyLabelNode, secretKeyLabelStyles);


        const secretKeyButtonNode = document.createElement("button");
        secretKeyButtonNode.innerHTML="Save";

        secretKeyButtonNode.addEventListener("click", (event) => {
            event.preventDefault();

            state.secretKey = secretKeyInputNode.value;
            localStorage.setItem(localStorageSecretKey, secretKeyInputNode.value);

            sendSession(state);
        });

        const secretKeyRow = createConfigMenuRow(secretKeyLabelNode, secretKeyInputNode, secretKeyButtonNode);
        
        configMenuNode.appendChild(secretKeyInstructionsNode);
        configMenuNode.appendChild(secretKeyRow);
        
        // -----------------------------------------------------------------------------------
        // GRIMOIRE TRACKING CONTROLS
        // -----------------------------------------------------------------------------------
        const enableInstructionsNode = document.createElement("p");
        enableInstructionsNode.innerHTML = "Click the checkbox below to enable sending the grimoire to Twitch.";

        configMenuNode.appendChild(enableInstructionsNode);

        const toggleListenNode = document.createElement("input");
        toggleListenNode.id="twitch-config-listenToggle";
        toggleListenNode.type = "checkbox";
        const toggleListenNodeStyles = {
            transform: "translateX(50%) scale(2)"
        };

        assignStyles(toggleListenNode, toggleListenNodeStyles);

        toggleListenNode.addEventListener("change", e => {
            if(e.target.checked) {
                state.isExtensionActive = true;
                updateGrimoireState();
                startWatchingGrimoire();
            } else {
                state.isExtensionActive = false;
                stopWatchingGrimoire();
            }
        });

        const toggleListenLabel = document.createElement("label");
        toggleListenLabel.htmlFor="twitch-config-listenToggle";
        toggleListenLabel.style.color="black";
        toggleListenLabel.innerHTML="Enable: ";

        const closeButtonNode = document.createElement("button");
        closeButtonNode.innerHTML = "Close";
        assignStyles(closeButtonNode, {
            marginLeft: "auto",
            marginRight: "10px"
        });

        const activationRow = createConfigMenuRow(toggleListenLabel, toggleListenNode, closeButtonNode);

        configMenuNode.appendChild(activationRow);

        extensionNode.appendChild(configMenuNode);
        
        controlsNode.prepend(extensionNode);

        function toggleConfigMenu() {
            state.menuVisible = !state.menuVisible;
            const configMenu = document.getElementById(configMenuNodeId);
            configMenu.style.display = state.menuVisible ? "block" : "none";
        }

        closeButtonNode.addEventListener("click", toggleConfigMenu);

        // ------------------------------------------------------------------
        // VERSION INDICATOR
        // ------------------------------------------------------------------

        const versionIndicatorNode = document.createElement("p");
        versionIndicatorNode.innerHTML = `v${VERSION}`;

        assignStyles(versionIndicatorNode, {
            color: "#6441a4",
            margin: "20px 15px 5px 10px",
            textAlign: "right",
            fontWeight: "bold"
        });

        configMenuNode.appendChild(versionIndicatorNode);

        // ------------------------------------------------------------------
        // GRIMOIRE TRACKER
        // ------------------------------------------------------------------
        function mapPlayerToObject (player){
            return {
                role: typeof player.role === "string" ? player.role : "",
                name: player.name,
                id: player.id
            };
        }
        
        // Parse the bits of localstorage we care about
        function parsePlayers (playersJson) { 
            return JSON.parse(playersJson).map(mapPlayerToObject); 
        }
        function parseSession (sessionJson) {
            const s = JSON.parse(sessionJson);
            return {
                isHost: !s[0],
                session: s[1]
            };
        }
        function parseEdition(editionJson) {
            return JSON.parse(editionJson);

        }
        function parseRoles(rolesJson) {
            return JSON.parse(rolesJson);
        }
        function parseFabled(fabledJson) {
            return JSON.parse(fabledJson);
        }

        // Test if two grimoire states are equivalent
        // Currently we're just comparing the stringified objects,
        // which will be incorrect if the keys are in the wrong order
        // But realistically it's not worth a more robust solution
        function isGrimoireStateUpdated (nextState) { return grimoireToJson(state) !== grimoireToJson(nextState); }

        // Test if the session has changed
        function isNewSession (nextState) { return state.session !== nextState.session; }

        const intervalTimer = 5 * 1000;
        let intervalId = -1;

        function updateGrimoireState(shouldSendGrimoire = true) {
            
            const localSession = localStorage.getItem("session");
            const localEdition = localStorage.getItem("edition");
            const localPlayers = localStorage.getItem("players");
            const localRoles = localStorage.getItem("roles");
            const localBluffs = localStorage.getItem("bluffs");
            const localFabled = localStorage.getItem("fabled");
            
            const nextSession = localSession ? parseSession(localSession) : {session: null, isHost: false};
            const nextPlayers = localPlayers ? parsePlayers(localPlayers) : [];
            const nextEdition = localEdition ? parseEdition(localEdition) : {};
            const nextRoles = localRoles ? parseRoles(localRoles) : [];
            const nextBluffs = localBluffs ? parseRoles(localBluffs) : [];
            const nextFabled = localFabled ? parseFabled(localFabled) : [];

            const nextState = {
                ...state, 
                session: nextSession.session,
                playerId: localStorage.getItem("playerId"),
                isHost: nextSession.isHost,
                players: nextPlayers,
                edition: nextEdition,
                roles: nextRoles,
                bluffs: nextBluffs,
                fabled: nextFabled,
            };

            // If the session has changed, send an update
            if(isNewSession(nextState)) {
                sendSession(nextState);
            }

            // compare grim to previous state
            if(isGrimoireStateUpdated(nextState)) {
            // if updated, save and update server
                state = nextState;

                if(shouldSendGrimoire) sendGrimoire(state);
            }
        }
        
        function startWatchingGrimoire () {
            state.isExtensionActive = true;
            sendSession(state);
            sendGrimoire(state);
            intervalId = setInterval(updateGrimoireState, intervalTimer);
        }
    
        function stopWatchingGrimoire() { 
            state.isExtensionActive = false;
            sendSession(state);
            clearInterval(intervalId);
            intervalId = -1;
        }

        iconNode.addEventListener("click", () => {
            toggleConfigMenu();
        });

        // Send stop message when page is closed
        window.addEventListener("beforeunload", () => {
            state.isExtensionActive = false;
            
            const url = `${EBS_URL}/sessions`;
              
            const { session, playerId, isExtensionActive, secretKey } = state;
            const body = {session, playerId, isActive: isExtensionActive, secretKey};

            navigator.sendBeacon(url, JSON.stringify(body));

            localStorage.removeItem(localStorageExtensionLoadedKey);
        });

        // setup initial state without sending grimoire
        updateGrimoireState(false);
    }
)();