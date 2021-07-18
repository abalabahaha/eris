const StickerItem = require('./StickerItem');



class StickerPack {
  constructor(data) {
    this.id = data.id;

    if (data.stickers !== undefined) {
      this.stickers = [];
      for (sticker of data.stickers) {
        this.stickers.push(new StickerItem(sticker));
      }
    }

    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.sku_id !== undefined) {
      this.skuID = data.sku_id;
    }

    if (data.cover_sticker_id !== undefined) {
      this.coverStickerID = data.cover_sticker_id;
    }

    if (data.description !== undefined) {
      this.description = data.description;
    }

    if (data.banner_asset_id !== undefined) {
      this.bannerAssetID = data.banner_asset_id;
    }
  }
}

module.exports = StickerPack;
