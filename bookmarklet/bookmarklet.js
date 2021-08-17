// javascript: 
(
    () => {
        const extensionNodeId = "botc-twitch-extension";

        // if extension is already loaded, quit
        if(document.getElementById(extensionNodeId)) {
            return;
        }

        // add extension icon
        const controlsNode = document.getElementById("controls");
        const extensionNode = document.createElement("div");
        extensionNode.id = extensionNodeId;
        extensionNode.style.position = "absolute";
        extensionNode.style.width="40px";
        extensionNode.style.height="40px";
        extensionNode.style.paddingTop="11px";
        extensionNode.style.transform="translateX(calc(-100% - 3px)";
    
        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgNode.setAttribute("width", "40");
        svgNode.setAttribute("height", "40");
        svgNode.setAttribute("viewBox", "0 0 100 100");
        svgNode.innerHTML = "<path d=\"M5.7 0L1.4 10.985V55.88h15.284V64h8.597l8.12-8.12h12.418l16.716-16.716V0H5.7zm51.104 36.3L47.25 45.85H31.967l-8.12 8.12v-8.12H10.952V5.73h45.85V36.3zM47.25 16.716v16.716h-5.73V16.716h5.73zm-15.284 0v16.716h-5.73V16.716h5.73z\" fill=\"#6441a4\" fill-rule=\"evenodd\"></path>";
        extensionNode.appendChild(svgNode);

        const configNode = document.createElement("div");
        configNode.id = "botc-twitch-extension-config";
        configNode.style.width = "300px";
        configNode.style.background = "white";
        configNode.style.border = "3px solid #6441a4";
        configNode.style.borderRadius = "10px";
        configNode.style.transform = "translateX(-100%)";
        configNode.style.display = "none";

        const chann = document.createElement("input");
        chann.type="password";
        chann.id = "twitch-config-password";  
        
        const passNode = document.createElement("input");
        passNode.type="password";
        passNode.id = "twitch-config-password";


        extensionNode.appendChild(configNode);

        let menuVisible = false;
        const toggleConfigMenu = () => {
            menuVisible = !menuVisible;
            configNode.style.display = menuVisible ? "block" : "none";  
        };

        controlsNode.prepend(extensionNode);
        
        // initialize state
        // channelId
        // include passphrase at some point?
        // any other settings that we need to configure
        let state = {
            players: [],
            edition: {},
        };

        // parse roles list
        const parsePlayers = (playersJson) => JSON.parse(playersJson).map(p => typeof p.role === "string" ? p.role : "");
        
        const arePlayersUpdated = (nextPlayers) => JSON.stringify(state.players) !== JSON.stringify(nextPlayers);

        const intervalTimer = 5 * 1000;
        let intervalId = -1;
        
        const startInterval = () => {
            console.log("watching grimoire");
            intervalId = setInterval(() => {
                const nextPlayers = parsePlayers(localStorage.players);
                // compare grim to previous
                if(arePlayersUpdated(nextPlayers)) {
                    // if updated, save and update server
                    state.players = nextPlayers;
                }
            }, intervalTimer );
        };
    

        const stopInterval = () => { 
            clearInterval(intervalId);
            intervalId = -1;
        };

        extensionNode.addEventListener("click", () => {
            // if(intervalId !== -1){
            //     stopInterval(); 
            // } else {
            //     startInterval();
            // }
            toggleConfigMenu();
        });
    })();