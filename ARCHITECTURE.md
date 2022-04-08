# Overview
The extension consists of three components:
- A Twitch frontend (a viewer overlay view and a broadcaster configuration view)
- A backend server for storing game state
- A bookmarklet that injects state-monitoring scripts into the clocktower game page

This repository contains the frontend and bookmarklet code; the server code lives in [a separate repository](https://github.com/eskolnik/clocktower-ext-backend-rails)

## Frontend
The Twitch frontend uses two views: 
- The primary frontend view is the `video_overlay`, which will be displayed on top of a viewer's Twitch screen. 
- The `config` view is used by the broadcaster to position the overlay, and to set up a secret key for use with the bookmarklet.

Both views make use of the UI logic in `viewer.js`, which is designed to mimic the clocktower.online page. 

## Backend
The EBS (Extension Backend Service) is responsible for storing grimoire data collected by the bookmarklet, and displaying it to the 
correct broadcaster. 

## Bookmarklet
As part of the setup process, the broadcaster adds the bookmarklet to their bookmark bar, which will listen on their clocktower.online browser tab and send game data to the backend.

The bookmarklet code, in its human-readable form, lives in `src/bookmarklet.js`. That code is minified and injected into the config view.
