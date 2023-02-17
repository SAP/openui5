sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/config/Theme", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/sys-cancel", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./generated/i18n/i18n-defaults", "./Icon", "./generated/templates/TokenTemplate.lit", "./generated/themes/Token.css"], function (_exports, _UI5Element, _LitRenderer, _Theme, _Keys, _decline, _sysCancel, _i18nBundle, _i18nDefaults, _Icon, _TokenTemplate, _Token) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _TokenTemplate = _interopRequireDefault(_TokenTemplate);
  _Token = _interopRequireDefault(_Token);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-token",
    languageAware: true,
    managedSlots: true,
    properties: /** @lends sap.ui.webcomponents.main.Token.prototype */{
      /**
       * Defines the text of the token.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },
      /**
       * Defines whether the component is read-only.
       * <br><br>
       * <b>Note:</b> A read-only component can not be deleted or selected,
       * but still provides visual feedback upon user interaction.
       *
       * @type {boolean}
       * @public
       */
      readonly: {
        type: Boolean
      },
      /**
       * Set by the tokenizer when a token is in the "more" area (overflowing)
       * @type {boolean}
       * @private
       */
      overflows: {
        type: Boolean
      },
      /**
       * Defines whether the component is selected or not.
       *
       * @type {boolean}
       * @public
       */
      selected: {
        type: Boolean
      },
      /**
       * Defines whether the component is focused or not.
       *
       * @type {boolean}
       * @private
       */
      focused: {
        type: Boolean
      },
      /**
       * Defines the tabIndex of the component.
       * @type {string}
       * @private
       */
      _tabIndex: {
        type: String,
        defaultValue: "-1",
        noAttribute: true
      }
    },
    slots: /** @lends sap.ui.webcomponents.main.Token.prototype */{
      /**
       * Defines the close icon for the token. If nothing is provided to this slot, the default close icon will be used.
       * Accepts <code>ui5-icon</code>.
       *
       * @type {sap.ui.webcomponents.main.IIcon}
       * @slot
       * @public
       * @since 1.0.0-rc.9
       */
      closeIcon: {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.main.Token.prototype */{
      /**
       * Fired when the backspace, delete or close icon of the token is pressed
       *
       * @event
       * @param {boolean} backSpace indicates whether token is deleted by backspace key
       * @param {boolean} delete indicates whether token is deleted by delete key
       * @private
       */
      "delete": {
        detail: {
          "backSpace": {
            type: Boolean
          },
          "delete": {
            type: Boolean
          }
        }
      },
      /**
       * Fired when the the component is selected by user interaction with mouse or by clicking space.
       *
       * @event
       * @public
       */
      select: {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Tokens are small items of information (similar to tags) that mainly serve to visualize previously selected items.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Token.js";</code>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Token
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-token
   * @since 1.0.0-rc.9
   * @implements sap.ui.webcomponents.main.IToken
   * @public
   */
  class Token extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _TokenTemplate.default;
    }
    static get styles() {
      return _Token.default;
    }
    _handleSelect() {
      this.selected = !this.selected;
      this.fireEvent("select");
    }
    _focusin() {
      this.focused = true;
    }
    _focusout() {
      this.focused = !this.focused;
    }
    _delete() {
      this.fireEvent("delete");
    }
    _keydown(event) {
      const isBS = (0, _Keys.isBackSpace)(event);
      const isD = (0, _Keys.isDelete)(event);
      if (!this.readonly && (isBS || isD)) {
        event.preventDefault();
        this.fireEvent("delete", {
          backSpace: isBS,
          "delete": isD
        });
      }
      if ((0, _Keys.isSpace)(event) || (0, _Keys.isSpaceCtrl)(event)) {
        event.preventDefault();
        this._handleSelect();
      }
    }
    get tokenDeletableText() {
      return Token.i18nBundle.getText(_i18nDefaults.TOKEN_ARIA_DELETABLE);
    }
    get iconURI() {
      if ((0, _Theme.getTheme)().includes("sap_belize")) {
        return "sys-cancel";
      }
      return "decline";
    }
    static get dependencies() {
      return [_Icon.default];
    }
    static async onDefine() {
      Token.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  Token.define();
  var _default = Token;
  _exports.default = _default;
});