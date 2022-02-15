
const MAX_TOKEN_SIZE = 40;
const MIN_TOKEN_SIZE = 8;

const MAX_RADIUS = 400;
const MIN_RADIUS = 100;
const RADIUS_INCREMENT = 10;

const WINDOW_MAX = 100;
const COORDINATE_INCREMENT = 0.5;

const TOKEN_CLASSNAME = "clockToken";
const DEV_TOKEN_CLASSNAME = "clockToken-dev";
const ABILITY_CLASSNAME = "ability";

// const EBS_URL = "https://www.paperweightclocktower.live";
const EBS_URL = "http://localhost:3000";
const EBS_GRIMOIRE = "grimoires";
const EBS_CASTER = "broadcasters";
const EBS_GAME_SESSION = "game_sessions";

const SECRET_LENGTH = 32;

const PUBSUB_SEGMENT_VERSION = "1";

export default {
    MAX_TOKEN_SIZE,
    MIN_TOKEN_SIZE,
    MAX_RADIUS,
    MIN_RADIUS,
    RADIUS_INCREMENT,
    WINDOW_MAX,
    COORDINATE_INCREMENT,
    TOKEN_CLASSNAME,
    ABILITY_CLASSNAME,
    EBS_URL,
    EBS_GRIMOIRE,
    EBS_CASTER,
    SECRET_LENGTH,
    PUBSUB_SEGMENT_VERSION
};

export { 
    MAX_TOKEN_SIZE,
    MIN_TOKEN_SIZE,
    MAX_RADIUS,
    MIN_RADIUS,
    RADIUS_INCREMENT,
    WINDOW_MAX,
    COORDINATE_INCREMENT,
    TOKEN_CLASSNAME,
    ABILITY_CLASSNAME,
    EBS_URL,
    EBS_GRIMOIRE,
    EBS_CASTER,
    EBS_GAME_SESSION,
    SECRET_LENGTH,
    PUBSUB_SEGMENT_VERSION
};