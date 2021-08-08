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
        this.id = data.id || null;
      }

      if (data.application_id !== undefined) {
        /**
         *
         * @type {*|null|string}
         */
        this.applicationID = data.application_id || null;
      }
      if (data.default_permission !== undefined) {
        /**
         *
         * @type {*|boolean}
         */
        this.defaultPermission = data.default_permission || true;
      }
      if (data.name !== undefined) {
        /**
         *
         * @type {string}
         */
        this.name = data.name || '';
      }
      if (data.description !== undefined) {
        /**
         *
         * @type {string|string}
         */
        this.description = data.description || '';
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
   * @param description
   * @returns {CommandOptions}
   */
  setDescription(description) {
    this.description = description;
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
   * @returns {{name: string, options: (CommandOptions|*[]), description: string}}
   */
  get data() {
    return {
      name: this.name,
      description: this.description,
      options: this.options
    };
  }

  /**
   *
   * @returns {{default_permission: (*|boolean), name: string, options: (CommandOptions|*[]), description: string, id: (string|null), application_id: (*|string|null)}}
   */
  get toJSON() {
    return {
      id: this.id,
      application_id: this.applicationID,
      name: this.name,
      description: this.description,
      default_permission: this.defaultPermission,
      options: this.options
    };
  }


}

module.exports = CommandBase;
