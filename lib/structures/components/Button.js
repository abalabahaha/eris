


class Button {
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

            if (data?.emoji?.name !== undefined) {
                this.emoji.name = data.emoji.name
            }

            if (data?.emoji?.id !== undefined) {
                this.emoji.id = data.emoji.id
            }

            if (data?.emoji?.animated !== undefined) {
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
    }

    
    setType(type) {
        this.type = type
        return this
    }

    setStyle(style) {
        this.style = style
        return this
    }

    setLabel(label) {
        this.label = label
        return this
    }

    setCustomID(customid) {
        this.custom_id = customid
        return this
    }

}

module.exports = Button