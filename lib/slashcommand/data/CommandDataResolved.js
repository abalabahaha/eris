const CategoryChannel = require('../../structures/CategoryChannel');
const Channel = require('../../structures/Channel');
const GroupChannel = require('../../structures/GroupChannel');
const Member = require('../../structures/Member');
const Message = require('../../structures/Message');
const NewsChannel = require('../../structures/NewsChannel');
const PrivateChannel = require('../../structures/PrivateChannel');
const StageChannel = require('../../structures/StageChannel');
const ThreadChannel = require('../../structures/ThreadChannel');
const User = require('../../structures/User');
const VoiceChannel = require('../../structures/VoiceChannel');

class CommandDataResolved {
  constructor(data, client) {
    if (data?.users !== undefined) {
      this.users = new Array();
      this.addUsers(data?.users, client);
    }
    if (data?.members !== undefined) {
      this.members = new Array();
      this.addMembers(data?.members, client);
    }
    if (data?.roles !== undefined) {
      this.roles = new Array();
      this.addRoles(data?.roles, client);
    }
    if (data?.channels !== undefined) {
      this.channels = new Array();
      this.addChannels(data?.channels, client);
    }
    if (data?.messages !== undefined) {
      this.messages = new Array();
      this.addMessages(data?.messages, client);
    }
    if (data?.attachments !== undefined) {
      this.attachments = new Array();
      this.addAttachments(data?.attachments, client);
    }
  }
  addAttachments(attachments, client) {
    if (attachments === undefined) {
      throw 'Missing data attachment';
    }
    if (client === undefined) {
      throw 'Missing client';
    }
    if (Array.isArray(attachments)) {
      for (const attachment of attachments) {
        this.attachments.push(attachment);
      }
    } else {
      this.attachments.push(attachments);
    }
  }
  addChannels(channels, client) {
    if (channels === undefined) {
      throw 'Missing data channels';
    }
    if (client === undefined) {
      throw 'Missing client';
    }
    if (Array.isArray(channels)) {
      for (const channel of channels) {
        switch (channel.type) {
          case 0: {
            try {
              this.channels.push(new Channel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 1: {
            try {
              this.channels.push(new PrivateChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 2: {
            try {
              this.channels.push(new VoiceChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 3: {
            try {
              this.channels.push(new GroupChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 4: {
            try {
              this.channels.push(new CategoryChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 5: {
            try {
              this.channels.push(new NewsChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 10:
          case 11:
          case 12: {
            try {
              this.channels.push(new ThreadChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          case 13: {
            try {
              this.channels.push(new StageChannel(channel, client));
            } catch (_) {
              this.channels.push(channel);
            }
          }
            break;
          default:
            this.channels.push(channel);

        }

      }
    } else {
      this.channels.push(channels);
    }
  }

  addMembers(members, client) {
    if (members === undefined) {
      throw 'Missing data members';
    }
    if (client === undefined) {
      throw 'Missing client';
    }
    if (Array.isArray(members)) {
      for (const member of members) {
        try {
          this.members.push(new Member(member, client));
        } catch (_) {
          this.members.push(member);
        }
      }
    } else {
      try {
        this.members.push(new Member(members, client));
      } catch (_) {
        this.members.push(members);
      }
    }
  }
  addMessages(messages, client) {
    if (messages === undefined) {
      throw 'Missing data messages';
    }
    if (client === undefined) {
      throw 'Missing client';
    }
    if (Array.isArray(messages)) {
      for (const message of messages) {
        try {
          this.messages.push(new Message(message, client));
        } catch (_) {
          this.messages.push(message);
        }
      }
    } else {
      try {
        this.messages.push(new Message(messages, client));
      } catch (_) {
        this.messages.push(messages);
      }
    }
  }



  addUsers(users, client) {
    if (users === undefined) {
      throw 'Missing data users';
    }
    if (client === undefined) {
      throw 'Missing client';
    }
    if (Array.isArray(users)) {
      for (const user of users) {
        try {
          this.users.push(new User(user, client));
        } catch (_) {
          this.users.push(user);
        }
      }
    } else {
      try {
        this.users.push(new User(users, client));
      } catch (_) {
        this.users.push(users);
      }
    }

  }


}
module.exports = CommandDataResolved;
