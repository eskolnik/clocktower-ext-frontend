// javascript: 
(
    () => {
        const extensionNodeId = "botcTwitchExtension";
        const configMenuNodeId = "botcTwitchExtensionConfig";

        const EBS_URL="EBS_PLACEHOLDER_URL";

        const localStorageKey = "twitchBotcExtensionLoaded";

        // Only load one instance of extension at a time
        if(document.getElementById(extensionNodeId) ) {
            return;
        }

        localStorage.setItem(localStorageKey, true);

        // initialize state
        let state = {
            session: "",
            playerId: null,
            isHost: false,
            players: [],
            bluffs: [],
            edition: {},
            roles: [],
            secretKey: "",
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
                roles: data.roles
            });
        }

        function wrappedFetch(url, body){
            return fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin", 
                headers: {
                    "Content-Type": "application/json"
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: body 
            });
        }

        function sendGrimoire(){
            const url = EBS_URL + "/grimoire/"+state.secretKey;

            const body = grimoireToJson(state);

            wrappedFetch(url, body).then(console.log); 
        }

        function sendSession() {
            const url = EBS_URL + "/session/" + state.secretKey;
            const { session, playerId, isExtensionActive } = state;
            const body = {session, playerId, isActive: isExtensionActive};

            wrappedFetch(url, JSON.stringify(body)).then(console.log); 
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
            paddingTop:"11px",
            transform:"translateX(calc(-100% - 3px)",
        };
        
        assignStyles(extensionNode, extensionStyles);
        
        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgNode.setAttribute("width", "40");
        svgNode.setAttribute("height", "40");
        svgNode.setAttribute("viewBox", "0 0 100 100");
        svgNode.innerHTML = "<path d=\"M5.7 0L1.4 10.985V55.88h15.284V64h8.597l8.12-8.12h12.418l16.716-16.716V0H5.7zm51.104 36.3L47.25 45.85H31.967l-8.12 8.12v-8.12H10.952V5.73h45.85V36.3zM47.25 16.716v16.716h-5.73V16.716h5.73zm-15.284 0v16.716h-5.73V16.716h5.73z\" fill=\"#6441a4\" fill-rule=\"evenodd\"></path>";
        extensionNode.appendChild(svgNode);
   
        // -------------------------------------------------------------------------
        //  CONFIG MENU
        // -------------------------------------------------------------------------
        
        const configMenuNode = document.createElement("div");
        configMenuNode.id = configMenuNodeId;
        const configMenuStyles = {
            width: "300px",
            height: "320px",
            background: "rgb(200, 181, 234",
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
        secretKeyInstructionsNode.innerHTML = "Paste the secret key you generated on the extension config page. If you're not streaming, you don't need to worry about this.";
        assignStyles(secretKeyInstructionsNode, {
            marginTop: "0px"
        });

        const secretKeyInputNode = document.createElement("input");
        secretKeyInputNode.type="password";
        secretKeyInputNode.id = "twitch-config-channelInput";

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

            sendSession();
        });

        const secretKeyRow = createConfigMenuRow(secretKeyLabelNode, secretKeyInputNode, secretKeyButtonNode);
        
        configMenuNode.appendChild(secretKeyInstructionsNode);
        configMenuNode.appendChild(secretKeyRow);
        
        // -----------------------------------------------------------------------------------
        //  ENABLE GRIMOIRE TRACKING
        // -----------------------------------------------------------------------------------
        const enableInstructionsNode = document.createElement("p");
        enableInstructionsNode.innerHTML = "Click the checkbox below to enable sending the grimoire to Twitch. Note that you must be in a live game sesion for this to work.";

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

        // Test if two grimoire states are equivalent
        // Currently we're just comparing the stringified objects,
        // which will be incorrect if the keys are in the wrong order
        // But realistically it's not worth a more robust solution
        function isGrimoireStateUpdated (nextState) { return grimoireToJson(state) !== grimoireToJson(nextState); }

        const intervalTimer = 5 * 1000;
        let intervalId = -1;

        function updateGrimoireState(shouldSendGrimoire = true) {
            
            const localSession = localStorage.getItem("session");
            
            const nextSession = localSession ? parseSession(localSession) : {session: null, isHost: false};
            const nextPlayers = parsePlayers(localStorage.getItem("players"));
            const nextEdition = parseEdition(localStorage.edition);
            const nextRoles = parseRoles(localStorage.roles);

            const nextState = {
                ...state, 
                session: nextSession.session,
                playerId: localStorage.getItem("playerId"),
                isHost: nextSession.isHost,
                players: nextPlayers,
                edition: nextEdition,
                roles: nextRoles
            };
            
            // compare grim to previous state
            if(isGrimoireStateUpdated(nextState)) {
            // if updated, save and update server
                state = nextState;

                if(shouldSendGrimoire) sendGrimoire();
            }
        }
        
        function startWatchingGrimoire () {
            state.isExtensionActive = true;
            sendSession();
            intervalId = setInterval(updateGrimoireState, intervalTimer);
        }
    
        function stopWatchingGrimoire() { 
            state.isExtensionActive = false;
            sendSession();
            clearInterval(intervalId);
            intervalId = -1;
        }

        svgNode.addEventListener("click", () => {
            toggleConfigMenu();
        });

        // Send stop message when page is closed
        window.addEventListener("beforeunload", () => {
            state.isExtensionActive = false;
            
            const url = EBS_URL + "/session/" + state.secretKey;

            const { session, playerId, players } = state;
            const body = {session, playerId, isActive: false, players};

            navigator.sendBeacon(url, JSON.stringify(body));

            localStorage.removeItem(localStorageKey);
        });

        // setup initial state without sending grimoire
        updateGrimoireState(false);
    }
)();