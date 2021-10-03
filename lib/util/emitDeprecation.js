const warningMessages = {
    CREATE_CHANNEL_OPTIONS: "Passing parentID or reason string arguments directly to createChannel() is deprecated. Use an options object instead.",
    DM_REACTION_REMOVE: "Passing a userID when using removeMessageReaction() in a PrivateChannel is deprecated. This behavior is no longer supported by Discord.",
    GET_REACTION_BEFORE: "Passing the before parameter to getMessageReaction() is deprecated. Discord no longer supports this parameter.",
    MEMBER_PERMISSION: "Member#permission is deprecated. Use Member#permissions instead.",
    MESSAGE_REFERENCE: "Passing the content.messageReferenceID option to createMessage() is deprecated. Use the content.messageReference option instead.",
    REACTION_USER: "Passing a userID other than \"@me\" to addMessageReaction() is deprecated. Discord no longer supports this parameter.",
    SINGLE_EMBED: "Passing the content.embed option to createMessage() or editMessage() is deprecated. Use the content.embeds option instead."
};
const unknownCodeMessage = "You have triggered a deprecated behavior whose warning was implemented improperly. Please report this issue.";

const emittedCodes = [];

module.exports = function emitDeprecation(code) {
    if(emittedCodes.includes(code) ) {
        return;
    }
    emittedCodes.push(code);
    process.emitWarning(warningMessages[code] || unknownCodeMessage, "DeprecationWarning", `eris:${code}`);
};
