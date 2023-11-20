sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/common/thirdparty/icons/background", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "./types/MediaGalleryItemLayout", "./generated/themes/MediaGalleryItem.css", "./generated/templates/MediaGalleryItemTemplate.lit"], function (_exports, _UI5Element, _LitRenderer, _Keys, _Device, _Icon, _background, _customElement, _property, _slot, _MediaGalleryItemLayout, _MediaGalleryItem, _MediaGalleryItemTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _MediaGalleryItemLayout = _interopRequireDefault(_MediaGalleryItemLayout);
  _MediaGalleryItem = _interopRequireDefault(_MediaGalleryItem);
  _MediaGalleryItemTemplate = _interopRequireDefault(_MediaGalleryItemTemplate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  // Template

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-media-gallery-item</code> web component represents the items displayed in the
   * <code>ui5-media-gallery</code> web component.
   * <br><br>
   * <b>Note:</b> <code>ui5-media-gallery-item</code> is not supported when used outside of <code>ui5-media-gallery</code>.
   * <br><br>
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-media-gallery</code> provides advanced keyboard handling.
   * When focused, the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   * <br>
   * <ul>
   * <li>[SPACE/ENTER/RETURN] - Trigger <code>ui5-click</code> event</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/MediaGalleryItem.js";</code> (comes with <code>ui5-media-gallery</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.MediaGalleryItem
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-media-gallery-item
   * @public
   * @implements sap.ui.webc.fiori.IMediaGalleryItem
   * @since 1.1.0
   */
  let MediaGalleryItem = class MediaGalleryItem extends _UI5Element.default {
    constructor() {
      super();
      this._monitoredContent = null;
      this._monitoredThumbnail = null;
    }
    onEnterDOM() {
      this._thumbnailDesign = !(0, _Device.isPhone)();
      this._interactive = !(0, _Device.isPhone)();
      this._square = true;
    }
    get _thumbnail() {
      return this.thumbnail.length ? this.thumbnail[0] : null;
    }
    get _content() {
      return this.content.length ? this.content[0] : null;
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
    get effectiveTabIndex() {
      return this.disabled ? undefined : this._tabIndex;
    }
    get _showBackgroundIcon() {
      return this._thumbnailNotFound || this._contentImageNotFound;
    }
    get styles() {
      return {
        wrapper: {
          height: this.contentHeight
        }
      };
    }
    get _role() {
      return this._interactive ? "button" : undefined;
    }
    onBeforeRendering() {
      this._monitorLoadingError();
    }
    _monitorLoadingError() {
      let callback, success;
      if (this._thumbnailDesign && this.thumbnail.length && this._monitoredThumbnail !== this._thumbnail) {
        this._thumbnailNotFound = false; // reset flag
        callback = this._updateThumbnailLoaded.bind(this);
        success = this._attachListeners(this._thumbnail, callback);
        success && (this._monitoredThumbnail = this._thumbnail);
      }
      if (!this._useThumbnail && this.content.length && this._monitoredContent !== this._content) {
        this._contentImageNotFound = false; // reset flag
        callback = this._updateContentImageLoaded.bind(this);
        success = this._attachListeners(this._content, callback);
        success && (this._monitoredContent = this._content);
      }
    }
    _attachListeners(element, callback) {
      const isImg = element.tagName === "IMG",
        img = isImg ? element : element.querySelector("img");
      if (img) {
        callback(img);
        img.addEventListener("error", () => {
          if (this.contains(img)) {
            // img still belongs to us
            callback(img);
          }
        });
        img.addEventListener("load", () => {
          if (this.contains(img)) {
            // img still belongs to us
            callback(img);
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
    _onkeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this._fireItemClick();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
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
      this.fireEvent("click", {
        item: this
      });
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: _MediaGalleryItemLayout.default,
    defaultValue: _MediaGalleryItemLayout.default.Square
  })], MediaGalleryItem.prototype, "layout", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "_interactive", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "_square", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "_contentImageNotFound", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "_thumbnailNotFound", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "_thumbnailDesign", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MediaGalleryItem.prototype, "focused", void 0);
  __decorate([(0, _property.default)()], MediaGalleryItem.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], MediaGalleryItem.prototype, "contentHeight", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], MediaGalleryItem.prototype, "content", void 0);
  __decorate([(0, _slot.default)()], MediaGalleryItem.prototype, "thumbnail", void 0);
  MediaGalleryItem = __decorate([(0, _customElement.default)({
    tag: "ui5-media-gallery-item",
    renderer: _LitRenderer.default,
    styles: _MediaGalleryItem.default,
    template: _MediaGalleryItemTemplate.default,
    dependencies: [_Icon.default]
  })], MediaGalleryItem);
  MediaGalleryItem.define();
  var _default = MediaGalleryItem;
  _exports.default = _default;
});