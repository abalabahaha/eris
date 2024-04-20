const warningMessages = {
    CREATE_CHANNEL_OPTIONS: "Passing parentID or reason string arguments directly to createChannel() is deprecated. Use an options object instead.",
    CREATE_THREAD_WITHOUT_MESSAGE: "createThreadWithoutMessage() is deprecated. Use createThread() instead.",
    DEFAULT_PERMISSION: "Passing a defaultPermission for application commands is deprecated. Use defaultMemberPermissions instead.",
    DELETE_MESSAGE_DAYS: "Passing the deleteMessageDays parameter to banGuildMember is deprecated. Use an options object with deleteMessageSeconds instead.",
    DM_REACTION_REMOVE: "Passing a userID when using removeMessageReaction() in a DMChannel is deprecated. This behavior is no longer supported by Discord.",
    GET_REACTION_BEFORE: "Passing the before parameter to getMessageReaction() is deprecated. Discord no longer supports this parameter.",
    MEMBER_PERMISSION: "Member#permission is deprecated. Use Member#permissions instead.",
    MESSAGE_REFERENCE: "Passing the content.messageReferenceID option to createMessage() is deprecated. Use the content.messageReference option instead.",
    REACTION_USER: "Passing a userID other than \"@me\" to addMessageReaction() is deprecated. Discord no longer supports this parameter.",
    PRIVATE_CHANNEL: "Using PrivateChannel is deprecated. Use DMChannel instead, and rename all relevant properties to dmChannel or otherwise where necessary."
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
