const Choice = require('./Choice');


class CommandOptions {
  /**
   *
   * @param data
   */
  constructor(data) {
    if (data !== undefined) {
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
      if (data.type !== undefined) {
        /**
         *
         * @type {number}
         */
        this.type = data.type ?? 0;
      }
      if (data.required !== undefined) {
        /**
         *
         * @type {boolean}
         */
        this.required = data.required ?? false;
      }
      if (data.choices !== undefined) {
        /**
         *
         * @type {Choice|Choice[]}
         */
        this.choices = [];
        for (const choicesKey of data.choices) {
          this.choices.push(new Choice(choicesKey).toJSON);
        }
      }
      if (data.options !== undefined) {
        /**
         *
         * @type {CommandOptions|*[]}
         */
        this.options = [];
        for (const optionsKey of data.options) {
          this.options.push(new CommandOptions(optionsKey).toJSON());
        }
      }
      if (data.autocomplete != undefined) {
        /**
          * @type boolean
          */
        this.autocomplete = data.autocomplete;
      }
    } else {
      this.options = [];
      this.choices = [];
    }

  }



  /**
   *
   * @param choice
   * @returns {CommandOptions}
   */
  addChoices(...choice) {
    for (const choiceElement of choice) {
      if (choiceElement instanceof Choice) {
        this.choices.push(choiceElement);
      }
    }
    return this;
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
  /***
   *
   * @returns {CommandOptions}
   */
  isRequired() {
    this.required = true;
    return this;
  }
  /**
   * @description `choices` cannot be present when this is true
   * @returns {CommandOptions}
   */
  setAutocomplete() {
    if (this.autocomplete !== undefined) {
      if (!this.autocomplete) {
        this.autocomplete = true;
      } else {
        Error('AutoComplete is already enabled!');
      }
    } else {
      this.autocomplete = true;
    }
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
    if (typeof translations !== 'object') {
      throw Error('Method called setDescriptionLocalizations is entering wrong call argument. Correct argument would be a object input.');
    }
    this.descriptionLocalizations = translations;
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



























  /**
   *
   * @param type
   * @returns {CommandOptions}
   *
   * | Name              | Value | Note                                    |
   * |-------------------|-------|-----------------------------------------|
   * | SUB_COMMAND       | 1     |                                         |
   * | SUB_COMMAND_GROUP | 2     |                                         |
   * | STRING            | 3     |                                         |
   * | INTEGER           | 4     | Any integer between -2^53 and 2^53      |
   * | BOOLEAN           | 5     |                                         |
   * | USER              | 6     |                                         |
   * | CHANNEL           | 7     | Includes all channel types + categories |
   * | ROLE              | 8     |                                         |
   * | MENTIONABLE       | 9     | Includes users and roles                |
   * | NUMBER            | 10    | Any double between -2^53 and 2^53       |
   */
  setType(type) {
    this.type = type;
    return this;
  }










  /**
   * @returns {{name, options: (CommandOptions), description, type, choices: (Choice[]), required: (*|boolean), autocomplete: boolean}}
   */
  toJSON() {
    const data = {
      type: this.type,
      name: this.name,
      description: this.description ?? 'no-description',
      required: this.required ?? false
    };
    if (this.nameLocalizations !== undefined) {
      data.name_localizations = this.nameLocalizations;
    }
    if (this.descriptionLocalizations !== undefined) {
      data.description_localizations = this.descriptionLocalizations;
    }
    if (this.autocomplete !== undefined) {
      data.autocomplete = this.autocomplete;
    }
    if (this.choices !== undefined) {
      if (!(this.choices.length === 0)) {
        data.choices = this.choices;
      }
    }
    if (this.options !== undefined) {
      if (!(this.options.length === 0)) {
        data.options = this.options;
      }
    }
    return data;
  }


}

module.exports = CommandOptions;
