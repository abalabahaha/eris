const warningMessages = {
    "eris:CREATE_CHANNEL_OPTIONS": "createChannel() was called with a string `options` argument",
    "eris:CREATE_CHANNEL_REASON": "createChannel() was called with a string `reason` argument",
    "eris:DM_REACTION_REMOVE": "removeMessageReaction() was called on a PrivateChannel with a `userID` argument",
    "eris:GET_REACTION_BEFORE": "getMessageReaction() was called with a `before` parameter. Discord no longer supports this parameter",
    "eris:MEMBER_PERMISSION": "Member#permission is deprecated. Use Member#permissions instead",
    "eris:MESSAGE_REFERENCE": "content.messageReferenceID is deprecated. Use content.messageReference instead",
    "eris:REACTION_USER": "addMessageReaction() was called without an \"@me\" `userID` argument",
    "eris:SINGLE_EMBED": "content.embed is deprecated. Use content.embeds instead"
};

const emittedCodes = [];

module.exports = function emitDeprecation(code) {
    if(emittedCodes.includes(code) ) {
        return;
    }
    emittedCodes.push(code);
    process.emitWarning(warningMessages[code], "DeprecationWarning", code);
};
