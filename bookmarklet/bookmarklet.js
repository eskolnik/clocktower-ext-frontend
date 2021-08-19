// javascript: 
(
    () => {
        const extensionNodeId = "botc-twitch-extension";
        const EBS_URL="http://localhost:3000";

        // Only load one instance of extension at a time
        if(document.getElementById(extensionNodeId)) {
            return;
        }

        // initialize state
        let state = {
            session: "",
            playerId: null,
            isHost: false,
            players: [],
            bluffs: [],
            edition: {},
            secretKey: "",
            isExtensionActive: false
        };

        function grimoireToJson(data) {
            return JSON.stringify({
                session: data.session,
                playerId: data.playerId,
                isHost: data.isHost,
                players: data.players,
                bluffs: data.bluffs,
                edition: data.edition
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
            // const { session, playerId, isHost, players } = req.body;

            const body = grimoireToJson(state);

            wrappedFetch(url, body).then(console.log); 
        }

        function sendSession() {
            const url = EBS_URL + "/" + state.secretKey;
            const { session, playerId, isExtensionActive, players } = state;
            const body = {session, playerId, isActive: isExtensionActive, players};

            wrappedFetch(url, body).then(console.log); 
        }

        function assignStyles(node, styles) {
            Object.assign(node.style, styles);
        }
        
        // ----------------
        //  EXTENSION ICON
        // ----------------
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
   
        // -------------
        //  CONFIG MENU
        // -------------
        
        const configMenuNode = document.createElement("div");
        configMenuNode.id = "botc-twitch-extension-config";
        const configMenuStyles = {
            width: "300px",
            height: "200px",
            background: "white",
            color: "black",
            fontSize: "16px",
            overflow: "wrap",
            padding: "5px",
            border: "3px solid #6441a4",
            borderRadius: "10px",
            transform: "translateX(-100%)",
            display: "none",
            
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
            console.log(rowNode);
            return rowNode;
        };

        // ---------------------
        //  SECRET KEY INPUT
        // ---------------------
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
        configMenuNode.appendChild(secretKeyRow);

        const secretKeyInstructionsNode = document.createElement("p");
        secretKeyInstructionsNode.innerHTML = "Paste the secret key you generated on the extension config page. If you're not streaming, you don't need to worry about this.";

        configMenuNode.appendChild(secretKeyInstructionsNode);

        // -----------------------
        //  LISTENER SETTINGS 
        // -----------------------
        const toggleListenNode = document.createElement("input");
        toggleListenNode.id="twitch-config-listenToggle";
        toggleListenNode.type = "checkbox";

        const toggleListenLabel = document.createElement("label");
        toggleListenLabel.htmlFor="twitch-config-listenToggle";
        toggleListenLabel.style.color="black";
        toggleListenLabel.innerHTML="Enable extension display:";

        const activationRow = createConfigMenuRow(toggleListenLabel, toggleListenNode);

        configMenuNode.appendChild(activationRow);

        extensionNode.appendChild(configMenuNode);
        
        controlsNode.prepend(extensionNode);

        let menuVisible = false;
        function toggleConfigMenu() {
            menuVisible = !menuVisible;
            configMenuNode.style.display = menuVisible ? "block" : "none";
        }

        // document.addEventListener("keydown", (event) => {
        //     if(menuVisible) {
        //         event.stopPropagation();
        //         console.log(event.code);
        //     }
        // });

        
        const mapPlayerToObject = player => ({
            role: typeof player.role === "string" ? player.role : "",
            name: player.name,
            id: player.id
        });
        
        // parse players list
        const parsePlayers = (playersJson) => JSON.parse(playersJson).map(mapPlayerToObject);
        const parseSession = (sessionJson) => {
            const s = JSON.parse(sessionJson);
            return {
                isHost: !s[0],
                session: s[1]
            };
        };

        // Test if two grimoire states are equivalent
        // Currently we're just comparing the stringified objects,
        // which will be incorrect if the keys are in the wrong order
        // But realistically it's not worth a more robust solution
        const isGrimoireStateUpdated = (nextState) => grimoireToJson(state) !== grimoireToJson(nextState);


        const intervalTimer = 5 * 1000;
        let intervalId = -1;

        const updateGrimoireState = () => {
            const nextSession = parseSession(localStorage.session);
            const nextPlayers = parsePlayers(localStorage.players);
            const nextEdition = {};

            const nextState = {
                ...state, 
                session: nextSession.session,
                playerId: localStorage.playerId,
                isHost: nextSession.isHost,
                players: nextPlayers,
                edition: nextEdition,
            };
            
            // compare grim to previous state
            if(isGrimoireStateUpdated(nextState)) {
                // if updated, save and update server
                state = nextState;

                sendGrimoire();
            }
        };
        
        const startWatchingGrimoire = () => {
            console.log("watching grimoire");
            intervalId = setInterval(updateGrimoireState, intervalTimer);
        };
    

        const stopWatchingGrimoire = () => { 
            clearInterval(intervalId);
            intervalId = -1;
        };


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

        svgNode.addEventListener("click", () => {
            toggleConfigMenu();
        });

        // Send stop message when page is closed
        window.addEventListener("beforeunload", () => {
            state.isExtensionActive = false;
            
            const url = EBS_URL + "/" + state.secretKey;
            const { session, playerId, players } = state;
            const body = {session, playerId, isActive: false, players};

            navigator.sendBeacon(url, JSON.stringify(body));
        });
          
    })();