const CommandOptions = require('./CommandOptions');

class CommandBase {
  /**
   *
   * @param data
   */
  constructor(data) {
    if (data !== undefined) {
      if (data.id !== undefined) {
        /**
         *
         * @type {null|string}
         */
        this.id = data.id ?? null;
      }
      if (data.type !== undefined) {
        /**
         *
         * @type {null|number}
         */
        this.type = data.type ?? null;
      }

      if (data.application_id !== undefined) {
        /**
         *
         * @type {*|null|string}
         */
        this.applicationID = data.application_id ?? null;
      }
      if (data.default_permission !== undefined) {
        /**
         *
         * @type {*|boolean}
         */
        this.defaultPermission = data.default_permission ?? true;
      }
      if (data.name !== undefined) {
        /**
         *
         * @type {string}
         */
        this.name = data.name ?? '';
      }
      if (data.name_localizations !== undefined) {
        this.nameLocalizations = data.name_localizations;
      }
      if (data.description !== undefined) {
        /**
         *
         * @type {string|string}
         */
        this.description = data.description ?? '';
      }
      if (data.description_localizations !== undefined) {
        this.descriptionLocalizations = data.description_localizations;
      }
      if (data.options !== undefined) {
        /**
         *
         * @type {CommandOptions|*[]}
         */
        this.options = [];

        for (const dataKey of data.options) {
          this.options.push(new CommandOptions(dataKey).toJSON());
        }
        if (data?.channel_types !== undefined) {
          this.channelTypes = data.channel_types;
        }
        if (data?.min_value !== undefined) {
          this.minValue = data.min_value;
        }
        if (data?.max_value !== undefined) {
          this.maxValue = data.max_value;
        }
      }
    } else {
      this.options = [];

    }


  }


  /**
   *
   * @param options
   * @returns {CommandOptions}
   */
  addOptions(...options) {
    for (const optionsElement of options) {
      if (optionsElement instanceof CommandOptions) {
        this.options.push(optionsElement);
      }
    }
    return this;
  }
  /**
   *
   * @returns {{name: string, options: (CommandOptions|*[]), description: string}}
   */
  get data() {
    const data = {
      name: this.name,
      description: this.description
    };
    if (this.options !== undefined) {
      if (!(this.options.length === 0)) {
        data.options = this.options;
      }
    }
    return data;
  }
  setChannelType(type) {
    this.channelTypes = type;
    return this;
  }
  /**
   *
   * @param description
   * @returns {CommandOptions}
   */
  setDescription(description) {
    this.description = description;
    return this;
  }
  /**
   *
   * @param description
   * @returns {CommandOptions}
   * @example
   * ```js
   * .setDescriptionLocalizations({
   *  "en-US": "Hello!",
   *  "{locale}": "{new description}"
   * })
   * ```
   * @link https://discord.com/developers/docs/reference#locales
   */
  setDescriptionLocalizations(translations) {
    if (translations == undefined) {
      throw Error('Method called setDescriptionLocalizations must have an input argument');
    }
    if (typeof description !== 'object') {
      throw Error('Method called setDescriptionLocalizations is entering wrong call argument. Correct argument would be a object input.');
    }
    this.descriptionLocalizations = translations;
    return this;
  }



  setMaxValue(value) {
    this.maxValue = value;
    return this;
  }
  setMinValue(value) {
    this.minValue = value;
    return this;
  }
  /**
   *
   * @param name
   * @returns {CommandOptions}
   */
  setName(name) {
    this.name = name;
    return this;
  }
  /**
   *
   * @param translations
   * @returns {CommandOptions}
   * @example
   * ```js
   * .setNameLocalizations({
   *  "en-US": "Hello!",
   *  "{locale}": "{new description}"
   * })
   * ```
   * @link https://discord.com/developers/docs/reference#locales
   */
  setNameLocalizations(translations) {
    if (translations == undefined) {
      throw Error('Method called setNameLocalizations must have an input argument');
    }
    if (typeof translations !== 'object') {
      throw Error('Method called setNameLocalizations is entering wrong call argument. Correct argument would be a object input.');
    }
    this.nameLocalizations = translations;
    return this;
  }

  setType(type) {
    this.type = type;
    return this;
  }

  /**
   *
   * @returns {{default_permission: (*|boolean), name: string, options: (CommandOptions|*[]), description: string, id: (string|null), application_id: (*|string|null)}}
   */
  get toJSON() {
    const data = {
      id: this.id,
      application_id: this.applicationID,
      name: this.name,
      description: this.description,
      default_permission: this.defaultPermission
    };
    if (this.nameLocalizations !== undefined) {
      data.name_localizations = this.nameLocalizations;
    }
    if (this.descriptionLocalizations !== undefined) {
      data.description_localizations = this.descriptionLocalizations;
    }
    if (this.maxValue !== undefined) {
      data.max_value = this.maxValue;
    }
    if (this.maxValue !== undefined) {
      data.min_value = this.minValue;
    }
    if (this.channelTypes !== undefined) {
      data.channel_types = this.channelTypes;
    }
    if (this.options !== undefined) {
      if (!(this.options.length === 0)) {
        data.options = this.options;
      }
    }

    return data;
  }


}

module.exports = CommandBase;
