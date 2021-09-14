const warningMessages = {
    CREATE_CHANNEL_OPTIONS: "createChannel() was called with a string `options` argument",
    CREATE_CHANNEL_REASON: "createChannel() was called with a string `reason` argument",
    DM_REACTION_REMOVE: "removeMessageReaction() was called on a PrivateChannel with a `userID` argument",
    GET_REACTION_BEFORE: "getMessageReaction() was called with a `before` parameter. Discord no longer supports this parameter",
    MEMBER_PERMISSION: "Member#permission is deprecated. Use Member#permissions instead",
    MESSAGE_REFERENCE: "content.messageReferenceID is deprecated. Use content.messageReference instead",
    REACTION_USER: "addMessageReaction() was called without an \"@me\" `userID` argument",
    SINGLE_EMBED: "content.embed is deprecated. Use content.embeds instead"
};

const emittedCodes = [];

module.exports = function emitDeprecation(code) {
    if(emittedCodes.includes(code) ) {
        return;
    }
    emittedCodes.push(code);
    process.emitWarning(warningMessages[code], "DeprecationWarning", `eris:${code}`);
};
