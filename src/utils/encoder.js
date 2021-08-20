/**
 * converts a channelId to Base64
 * 
 * @param {string} channelId 
 * @returns {string} encoded channelId
 */
function encode(channelId) {
    return btoa(channelId);
}

/**
 * converts an encoded Base64 ChannelID to a string
 * @param {string} encodedString 
 * @returns {string} decoded channel ID as a string
 */
function decode(encodedString) {
    return atob(encodedString);
}

export {encode, decode};
export default {encode, decode};