const Options = require("./Options")

class SelectionMenu {
    constructor(data) {

        if (data?.type !== undefined) {
            this.type = data.type 
        }

        if (data?.style !== undefined) {
            this.style = data.style
        }

        if (data?.label !== undefined) {
            this.label = data.label
        }

        if (data?.value !== undefined) {
            this.value = data.value
        }

        if (data?.emoji !== undefined) {
            this.emoji = {}

            if (data.emoji?.name !== undefined) {
                this.emoji.name = data.emoji.name
            }

            if (data.emoji?.id !== undefined) {
                this.emoji.id = data.emoji.id
            }

            if (data.emoji?.animated !== undefined) {
                this.emoji.animated = data.emoji.animated
            }

        }
        if (data?.custom_id !== undefined) {
            this.custom_id = data.custom_id
        }
        if (data?.url !== undefined) {
            this.url = data.url
        }
        if (data?.disabled !== undefined) {
            this.disabled = data.disabled
        }

        if (data?.placeholder !== undefined) {
            this.placeholder = data.placeholder
        }

        
        if (data?.min_values !== undefined) {
            this.minValues = data.min_values
        }

        
        if (data?.max_values !== undefined) {
            this.maxValues = data.max_values
        }
        this.options = []
        if (data?.options !== undefined) {
            data?.option.forEach((option) => this.options.push(new Options(option)))
        }
    }


    setType(type) {
        this.type = type
        return this
    }

    setLabel(label) {
        this.label = label
        return this
    }


    setValue(value) {
        this.value = value
        return this
    }

    setStyle(style) {
        this.style = style
        return this
    }

    setCustomID(customid) {
        this.custom_id = customid
        return this
    }

    setOptions(...arrayOptions) {
        arrayOptions.forEach((options) => this.options.push(options))
        return this
    }

    setPlaceHolder(placeholder) {
        this.placeholder = placeholder
        return this
    }

    setMin(min) {
        this.minValues = min
        return this
    }

    setMax(max) {
        this.maxValues = max
        return this
    }


}


module.exports = SelectionMenu