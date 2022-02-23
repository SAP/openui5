sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/common/thirdparty/icons/background', './types/MediaGalleryItemLayout', './generated/templates/MediaGalleryItemTemplate.lit', './generated/themes/MediaGalleryItem.css'], function (UI5Element, litRender, Keys, Device, Icon, background, MediaGalleryItemLayout, MediaGalleryItemTemplate_lit, MediaGalleryItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);

	const metadata = {
		tag: "ui5-media-gallery-item",
		managedSlots: true,
		properties:  {
			selected: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			layout: {
				type: MediaGalleryItemLayout,
				defaultValue: MediaGalleryItemLayout.Square,
			},
			_interactive: {
				type: Boolean,
			},
			_square: {
				type: Boolean,
			},
			_contentImageNotFound: {
				type: Boolean,
			},
			_thumbnailNotFound: {
				type: Boolean,
			},
			_thumbnailDesign: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: undefined,
			},
			contentHeight: {
				type: String,
				noAttribute: true,
				defaultValue: "",
			},
		},
		slots:  {
			 "default": {
				propertyName: "content",
				type: HTMLElement,
			},
			 "thumbnail": {
				type: HTMLElement,
			},
		},
	};
	class MediaGalleryItem extends UI5Element__default {
		constructor() {
			super();
			this._monitoredContent = null;
			this._monitoredThumbnail = null;
		}
		onEnterDOM() {
			this._thumbnailDesign = !Device.isPhone();
			this._interactive = !Device.isPhone();
			this._square = true;
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return MediaGalleryItem_css;
		}
		static get template() {
			return MediaGalleryItemTemplate_lit;
		}
		get _thumbnail() {
			return this.thumbnail.length && this.thumbnail[0];
		}
		get _content() {
			return this.content.length && this.content[0];
		}
		get _isThubmnailAvailable() {
			return this._thumbnail && !this._thumbnailNotFound;
		}
		get _isContentAvailable() {
			return this._content && !this._contentImageNotFound;
		}
		get _useThumbnail() {
			return this._thumbnailDesign && this._isThubmnailAvailable;
		}
		get _useContent() {
			return !this._useThumbnail && this._isContentAvailable;
		}
		get tabIndex() {
			return this.disabled ? undefined : this._tabIndex;
		}
		get _showBackgroundIcon() {
			return this._thumbnailNotFound || this._contentImageNotFound;
		}
		get styles() {
			return {
				wrapper: {
					height: this.contentHeight,
				},
			};
		}
		get _role() {
			return this._interactive ? "button" : undefined;
		}
		onBeforeRendering() {
			this._monitorLoadingError();
		}
		_monitorLoadingError() {
			let callback,
				success;
			if (this._thumbnailDesign && this.thumbnail.length && (this._monitoredThumbnail !== this._thumbnail)) {
				this._thumbnailNotFound = undefined;
				callback = this._updateThumbnailLoaded;
				success = this._attachListeners(this._thumbnail, callback);
				success && (this._monitoredThumbnail = this._thumbnail);
			}
			if (!this._useThumbnail && this.content.length && (this._monitoredContent !== this._content)) {
				this._contentImageNotFound = undefined;
				callback = this._updateContentImageLoaded;
				success = this._attachListeners(this._content, callback);
				success && (this._monitoredContent = this._content);
			}
		}
		_attachListeners(element, callback) {
			const isImg = element.tagName === "IMG",
				img = isImg ? element : element.querySelector("img");
			if (img) {
				callback.call(this, img);
				img.addEventListener("error", () => {
					if (this.contains(img)) {
						callback.call(this, img);
					}
				});
				img.addEventListener("load", () => {
					if (this.contains(img)) {
						callback.call(this, img);
					}
				});
				return true;
			}
		}
		_updateContentImageLoaded(image) {
			this._contentImageNotFound = image.naturalHeight === 0 && image.naturalWidth === 0;
		}
		_updateThumbnailLoaded(image) {
			this._thumbnailNotFound = image.naturalHeight === 0 && image.naturalWidth === 0;
		}
		_onkeydown(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
			if (Keys.isEnter(event)) {
				this._fireItemClick();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this._fireItemClick();
			}
		}
		_onfocusout() {
			this.focused = false;
		}
		_onfocusin() {
			this.focused = true;
		}
		_fireItemClick() {
			this.fireEvent("click", { item: this });
		}
		static get dependencies() {
			return [
				Icon__default,
			];
		}
	}
	MediaGalleryItem.define();

	return MediaGalleryItem;

});
