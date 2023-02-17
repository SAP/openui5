sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/templates/AvatarTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Avatar.css", "./Icon", "./types/AvatarSize", "./types/AvatarShape", "./types/AvatarColorScheme"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _Keys, _AvatarTemplate, _i18nDefaults, _Avatar, _Icon, _AvatarSize, _AvatarShape, _AvatarColorScheme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _AvatarTemplate = _interopRequireDefault(_AvatarTemplate);
  _Avatar = _interopRequireDefault(_Avatar);
  _Icon = _interopRequireDefault(_Icon);
  _AvatarSize = _interopRequireDefault(_AvatarSize);
  _AvatarShape = _interopRequireDefault(_AvatarShape);
  _AvatarColorScheme = _interopRequireDefault(_AvatarColorScheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Template

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-avatar",
    languageAware: true,
    managedSlots: true,
    properties: /** @lends sap.ui.webcomponents.main.Avatar.prototype */{
      /**
       * Defines if the avatar is interactive (focusable and pressable).
       * @type {boolean}
       * @defaultValue false
       * @public
       */
      interactive: {
        type: Boolean
      },
      /**
       * Indicates if the elements is on focus
       * @private
       */
      focused: {
        type: Boolean
      },
      /**
       * Defines the name of the UI5 Icon, that will be displayed.
       * <br>
       * <b>Note:</b> If <code>image</code> slot is provided, the property will be ignored.
       * <br>
       * <b>Note:</b> You should import the desired icon first, then use its name as "icon".
       * <br><br>
       * import "@ui5/webcomponents-icons/dist/{icon_name}.js"
       * <br>
       * <pre>&lt;ui5-avatar icon="employee"></pre>
       *
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },
      /**
       * Defines the displayed initials.
       * <br>
       * Up to two Latin letters can be displayed as initials.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      initials: {
        type: String
      },
      /**
       * Defines the shape of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Circle</code></li>
       * <li><code>Square</code></li>
       * </ul>
       * @type {AvatarShape}
       * @defaultvalue "Circle"
       * @public
       */
      shape: {
        type: _AvatarShape.default,
        defaultValue: _AvatarShape.default.Circle
      },
      /**
       * Defines predefined size of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>XS</code></li>
       * <li><code>S</code></li>
       * <li><code>M</code></li>
       * <li><code>L</code></li>
       * <li><code>XL</code></li>
       * </ul>
       * @type {AvatarSize}
       * @defaultvalue "S"
       * @public
       */
      size: {
        type: _AvatarSize.default,
        defaultValue: _AvatarSize.default.S
      },
      /**
       * @private
       */
      _size: {
        type: String,
        defaultValue: _AvatarSize.default.S
      },
      /**
       * Defines the background color of the desired image.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Accent1</code></li>
       * <li><code>Accent2</code></li>
       * <li><code>Accent3</code></li>
       * <li><code>Accent4</code></li>
       * <li><code>Accent5</code></li>
       * <li><code>Accent6</code></li>
       * <li><code>Accent7</code></li>
       * <li><code>Accent8</code></li>
       * <li><code>Accent9</code></li>
       * <li><code>Accent10</code></li>
       * <li><code>Placeholder</code></li>
       * </ul>
       * @type {AvatarColorScheme}
       * @defaultvalue "Accent6"
       * @public
       */
      colorScheme: {
        type: _AvatarColorScheme.default,
        defaultValue: _AvatarColorScheme.default.Accent6
      },
      /**
       * @private
       */
      _colorScheme: {
        type: String,
        defaultValue: _AvatarColorScheme.default.Accent6
      },
      /**
       * Defines the text alternative of the component.
       * If not provided a default text alternative will be set, if present.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.7
       */
      accessibleName: {
        type: String
      },
      /**
       * Defines the aria-haspopup value of the component when <code>interactive</code> property is <code>true</code>.
       * <br><br>
       * @type String
       * @since 1.0.0-rc.15
       * @protected
       */
      ariaHaspopup: {
        type: String
      },
      _tabIndex: {
        type: String,
        noAttribute: true
      },
      _hasImage: {
        type: Boolean
      }
    },
    slots: /** @lends sap.ui.webcomponents.main.Avatar.prototype */{
      /**
       * Receives the desired <code>&lt;img&gt;</code> tag
       *
       * <b>Note:</b> If you experience flickering of the provided image, you can hide the component until it is being defined with the following CSS:
       * <br /> <br />
       * <code>
       *		ui5-avatar:not(:defined) { <br />
       *			&nbsp;visibility: hidden; <br />
       *		} <br />
       * </code>
       * @type {HTMLElement}
       * @slot image
       * @public
       * @since 1.0.0-rc.15
       */
      "default": {
        propertyName: "image",
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.main.Avatar.prototype */{
      /**
      * Fired on mouseup, space and enter if avatar is interactive
      *
      * @event
      * @private
      * @since 1.0.0-rc.11
      */
      click: {}
    }
  };

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
   * @alias sap.ui.webcomponents.main.Avatar
   * @extends UI5Element
   * @tagname ui5-avatar
   * @since 1.0.0-rc.6
   * @implements sap.ui.webcomponents.main.IAvatar
   * @public
   */
  class Avatar extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _Avatar.default;
    }
    static get template() {
      return _AvatarTemplate.default;
    }
    static get dependencies() {
      return [_Icon.default];
    }
    static async onDefine() {
      Avatar.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get tabindex() {
      return this._tabIndex || (this.interactive ? "0" : "-1");
    }

    /**
     * Returns the effective avatar size.
     * @readonly
     * @type { String }
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
     * @type { String }
     * @defaultValue "Accent6"
     * @private
     */
    get _effectiveBackgroundColor() {
      // we read the attribute, because the "background-color" property will always have a default value
      return this.getAttribute("_color-scheme") || this._colorScheme;
    }
    get _role() {
      return this.interactive ? "button" : undefined;
    }
    get _ariaHasPopup() {
      return this._getAriaHasPopup();
    }
    get validInitials() {
      const validInitials = /^[a-zA-Z]{1,2}$/;
      if (this.initials && validInitials.test(this.initials)) {
        return this.initials;
      }
      return null;
    }
    get accessibleNameText() {
      if (this.accessibleName) {
        return this.accessibleName;
      }
      return Avatar.i18nBundle.getText(_i18nDefaults.AVATAR_TOOLTIP) || undefined;
    }
    get hasImage() {
      this._hasImage = !!this.image.length;
      return this._hasImage;
    }
    onBeforeRendering() {
      this._onclick = this.interactive ? this._onClickHandler.bind(this) : undefined;
    }
    _onClickHandler(event) {
      // prevent the native event and fire custom event to ensure the noConfict "ui5-click" is fired
      event.stopPropagation();
      this.fireEvent("click");
    }
    _onkeydown(event) {
      if (!this.interactive) {
        return;
      }
      if ((0, _Keys.isEnter)(event)) {
        this.fireEvent("click");
      }
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault(); // prevent scrolling
      }
    }

    _onkeyup(event) {
      if (this.interactive && !event.shiftKey && (0, _Keys.isSpace)(event)) {
        this.fireEvent("click");
      }
    }
    _onfocusout() {
      this.focused = false;
    }
    _onfocusin() {
      if (this.interactive) {
        this.focused = true;
      }
    }
    _getAriaHasPopup() {
      if (!this.interactive || this.ariaHaspopup === "") {
        return;
      }
      return this.ariaHaspopup;
    }
  }
  Avatar.define();
  var _default = Avatar;
  _exports.default = _default;
});