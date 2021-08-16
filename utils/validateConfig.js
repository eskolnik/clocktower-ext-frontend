import CONSTANTS from "./constants.js";

const {
    MAX_TOKEN_SIZE,
    MIN_TOKEN_SIZE,
    MAX_RADIUS,
    MIN_RADIUS,
    WINDOW_MAX,
} = CONSTANTS;

function validateConfig(config) {
    if (typeof config.players !== "number" || config.players < 0) {
        return false;
    }

    if (
        typeof config.radius !== "number" ||
    config.radius < MIN_RADIUS ||
    config.radius > MAX_RADIUS
    ) {
        return false;
    }

    if (
        typeof config.tokenSize !== "number" ||
        config.tokenSize < MIN_TOKEN_SIZE ||
        config.tokenSize > MAX_TOKEN_SIZE
    ) {
        return false;
    }

    if (typeof config.x !== "number" || config.x < 0 || config.x > WINDOW_MAX) {
        return false;
    }

    if (typeof config.y !== "number" || config.y < 0 || config.y > WINDOW_MAX) {
        return false;
    }
    return true;
}

export default validateConfig;