const warningMessages = {
    "eris:1": "addMessageReaction() was called without an \"@me\" `userID` argument",
    "eris:2": "createChannel() was called with a string `options` argument",
    "eris:3": "createChannel() was called with a string `reason` argument",
    "eris:4": "content.embed is deprecated. Use content.embeds instead",
    "eris:5": "content.messageReferenceID is deprecated. Use content.messageReference instead",
    "eris:6": "content.embed is deprecated. Use content.embeds instead",
    "eris:7": "getMessageReaction() was called with a `before` parameter. Discord no longer supports this parameter",
    "eris:8": "Member#permission is deprecated. Use Member#permissions instead",
    "eris:9": "removeMessageReaction() was called on a PrivateChannel with a `userID` argument"
};

const emittedCodes = [];

module.exports = function emitDeprecation(code) {
    if(emittedCodes.includes(code) ) {
        return;
    }
    emittedCodes.push(code);
    process.emitWarning(warningMessages[code], "DeprecationWarning", code);
};
