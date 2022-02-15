# Overview
The extension consists of three components:
- A Twitch frontend (a viewer overlay view and a broadcaster configuration view)
- A backend server for storing game state
- A bookmarklet that injects state-monitoring scripts into the clocktower game page.

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
As part of the setup process, the broadcaster adds the bookmarklet to their bookmark bar, which will scrape localStorage data on their clocktower.online browser tab and send it to the backend.

The bookmarklet currently requires the caster to input the secret key by hand each time it is opened. A major QoL improvement will be
to automatically fill this value in when the bookmarket is generated, and to persist it across sessions.