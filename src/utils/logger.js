/**
 * Constructs a logger that combines an arbitrary number of transports
 * 
 * @param  {...Function} transports array of logger functions to call
 * @returns 
 */
function logger(...transports) {
    if (Array.isArray(transports)) {
        const validTransports = transports.filter(f => typeof f === "function");
        return (...args) => validTransports.forEach(t => t(...args));
    }
}

export default logger;