sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/templates/AvatarTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Avatar.css", "./Icon", "./types/AvatarSize", "./types/AvatarShape", "./types/AvatarColorScheme", "sap/ui/webc/common/thirdparty/icons/employee", "sap/ui/webc/common/thirdparty/icons/alert"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _LitRenderer, _i18nBundle, _ResizeHandler, _Render, _Keys, _AvatarTemplate, _i18nDefaults, _Avatar, _Icon, _AvatarSize, _AvatarShape, _AvatarColorScheme, _employee, _alert) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _AvatarTemplate = _interopRequireDefault(_AvatarTemplate);
  _Avatar = _interopRequireDefault(_Avatar);
  _Icon = _interopRequireDefault(_Icon);
  _AvatarSize = _interopRequireDefault(_AvatarSize);
  _AvatarShape = _interopRequireDefault(_AvatarShape);
  _AvatarColorScheme = _interopRequireDefault(_AvatarColorScheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Avatar_1;

  // Template

  // Styles

  // Icon

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * An image-like component that has different display options for representing images and icons
   * in different shapes and sizes, depending on the use case.
   *
   * The shape can be circular or square. There are several predefined sizes, as well as an option to
   * set a custom size.
   *
   * <br><br>
   * <h3>Keyboard Handling</h3>
   *
   * <ul>
   * <li>[SPACE, ENTER, RETURN] - Fires the <code>click</code> event if the <code>interactive</code> property is set to true.</li>
   * <li>[SHIFT] - If [SPACE] is pressed, pressing [SHIFT] releases the component without triggering the click event.</li>
   * </ul>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Avatar.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Avatar
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-avatar
   * @since 1.0.0-rc.6
   * @implements sap.ui.webc.main.IAvatar
   * @public
   */
  let Avatar = Avatar_1 = class Avatar extends _UI5Element.default {
    constructor() {
      super();
      this._handleResizeBound = this.handleResize.bind(this);
    }
    static async onDefine() {
      Avatar_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get tabindex() {
      return this._tabIndex || (this._interactive ? "0" : "-1");
    }
    /**
     * Returns the effective avatar size.
     * @readonly
     * @type {string}
     * @defaultValue "S"
     * @private
     */
    get _effectiveSize() {
      // we read the attribute, because the "size" property will always have a default value
      return this.getAttribute("size") || this._size;
    }
    /**
     * Returns the effective background color.
     * @readonly
     * @type {string}
     * @defaultValue "Accent6"
     * @private
     */
    get _effectiveBackgroundColor() {
      // we read the attribute, because the "background-color" property will always have a default value
      return this.getAttribute("color-scheme") || this._colorScheme;
    }
    get _role() {
      return this._interactive ? "button" : undefined;
    }
    get _ariaHasPopup() {
      return this._getAriaHasPopup();
    }
    get _fallbackIcon() {
      if (this.fallbackIcon === "") {
        this.fallbackIcon = "employee";
      }
      return this.fallbackIcon;
    }
    get _interactive() {
      return this.interactive && !this.disabled;
    }
    get validInitials() {
      // initials should consist of only 1,2 or 3 latin letters
      const validInitials = /^[a-zA-Zà-üÀ-Ü]{1,3}$/,
        areInitialsValid = this.initials && validInitials.test(this.initials);
      if (areInitialsValid) {
        return this.initials;
      }
      return null;
    }
    get accessibleNameText() {
      if (this.accessibleName) {
        return this.accessibleName;
      }
      return Avatar_1.i18nBundle.getText(_i18nDefaults.AVATAR_TOOLTIP) || undefined;
    }
    get hasImage() {
      this._hasImage = !!this.image.length;
      return this._hasImage;
    }
    get initialsContainer() {
      return this.getDomRef().querySelector(".ui5-avatar-initials");
    }
    onBeforeRendering() {
      this._onclick = this._interactive ? this._onClickHandler.bind(this) : undefined;
    }
    async onAfterRendering() {
      await (0, _Render.renderFinished)();
      if (this.initials && !this.icon) {
        this._checkInitials();
      }
    }
    onEnterDOM() {
      this.initialsContainer && _ResizeHandler.default.register(this.initialsContainer, this._handleResizeBound);
    }
    onExitDOM() {
      this.initialsContainer && _ResizeHandler.default.deregister(this.initialsContainer, this._handleResizeBound);
    }
    handleResize() {
      if (this.initials && !this.icon) {
        this._checkInitials();
      }
    }
    _checkInitials() {
      const avatar = this.getDomRef(),
        avatarInitials = avatar.querySelector(".ui5-avatar-initials");
      // if there aren`t initalts set - the fallBack icon should be shown
      if (!this.validInitials) {
        avatarInitials.classList.add("ui5-avatar-initials-hidden");
        return;
      }
      // if initials` width is bigger than the avatar, an icon should be shown inside the avatar
      avatarInitials && avatarInitials.classList.remove("ui5-avatar-initials-hidden");
      if (this.initials && this.initials.length === 3) {
        if (avatarInitials && avatarInitials.scrollWidth > avatar.scrollWidth) {
          avatarInitials.classList.add("ui5-avatar-initials-hidden");
        }
      }
    }
    _onClickHandler(e) {
      // prevent the native event and fire custom event to ensure the noConfict "ui5-click" is fired
      e.stopPropagation();
      this._fireClick();
    }
    _onkeydown(e) {
      if (!this._interactive) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._fireClick();
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault(); // prevent scrolling
      }
    }

    _onkeyup(e) {
      if (this._interactive && !e.shiftKey && (0, _Keys.isSpace)(e)) {
        this._fireClick();
      }
    }
    _fireClick() {
      this.fireEvent("click");
      this.pressed = !this.pressed;
    }
    _onfocusout() {
      this.focused = false;
    }
    _onfocusin() {
      if (this._interactive) {
        this.focused = true;
      }
    }
    _getAriaHasPopup() {
      if (!this._interactive || this.ariaHaspopup === "") {
        return;
      }
      return this.ariaHaspopup;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], Avatar.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Avatar.prototype, "interactive", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Avatar.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Avatar.prototype, "pressed", void 0);
  __decorate([(0, _property.default)()], Avatar.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], Avatar.prototype, "fallbackIcon", void 0);
  __decorate([(0, _property.default)()], Avatar.prototype, "initials", void 0);
  __decorate([(0, _property.default)({
    type: _AvatarShape.default,
    defaultValue: _AvatarShape.default.Circle
  })], Avatar.prototype, "shape", void 0);
  __decorate([(0, _property.default)({
    type: _AvatarSize.default,
    defaultValue: _AvatarSize.default.S
  })], Avatar.prototype, "size", void 0);
  __decorate([(0, _property.default)({
    type: _AvatarSize.default,
    defaultValue: _AvatarSize.default.S
  })], Avatar.prototype, "_size", void 0);
  __decorate([(0, _property.default)({
    type: _AvatarColorScheme.default,
    defaultValue: _AvatarColorScheme.default.Accent6
  })], Avatar.prototype, "colorScheme", void 0);
  __decorate([(0, _property.default)({
    type: _AvatarColorScheme.default,
    defaultValue: _AvatarColorScheme.default.Accent6
  })], Avatar.prototype, "_colorScheme", void 0);
  __decorate([(0, _property.default)()], Avatar.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], Avatar.prototype, "ariaHaspopup", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], Avatar.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Avatar.prototype, "_hasImage", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], Avatar.prototype, "image", void 0);
  __decorate([(0, _slot.default)()], Avatar.prototype, "badge", void 0);
  Avatar = Avatar_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-avatar",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: _Avatar.default,
    template: _AvatarTemplate.default,
    dependencies: [_Icon.default]
  })
  /**
  * Fired on mouseup, space and enter if avatar is interactive
  * <b>Note:</b> The event will not be fired if the <code>disabled</code>
  * property is set to <code>true</code>.
  * @event
  * @private
  * @since 1.0.0-rc.11
  */, (0, _event.default)("click")], Avatar);
  Avatar.define();
  var _default = Avatar;
  _exports.default = _default;
});