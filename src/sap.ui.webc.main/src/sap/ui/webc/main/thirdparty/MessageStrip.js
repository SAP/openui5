sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "./types/MessageStripDesign", "./generated/templates/MessageStripTemplate.lit", "./Icon", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/MessageStrip.css"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _decline, _information, _sysEnter, _error, _alert, _MessageStripDesign, _MessageStripTemplate, _Icon, _Button, _i18nDefaults, _MessageStrip) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _MessageStripDesign = _interopRequireDefault(_MessageStripDesign);
  _MessageStripTemplate = _interopRequireDefault(_MessageStripTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _MessageStrip = _interopRequireDefault(_MessageStrip);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-message-strip",
    altTag: "ui5-messagestrip",
    languageAware: true,
    fastNavigation: true,
    properties: /** @lends sap.ui.webcomponents.main.MessageStrip.prototype */{
      /**
       * Defines the component type.
       * <br><br>
       * <b>Note:</b> Available options are <code>"Information"</code>, <code>"Positive"</code>, <code>"Negative"</code>,
       * and <code>"Warning"</code>.
       *
       * @type {MessageStripDesign}
       * @defaultvalue "Information"
       * @public
       * @since 1.0.0-rc.15
       */
      design: {
        type: _MessageStripDesign.default,
        defaultValue: _MessageStripDesign.default.Information
      },
      /**
       * Defines whether the MessageStrip will show an icon in the beginning.
       * You can directly provide an icon with the <code>icon</code> slot. Otherwise, the default icon for the type will be used.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.15
       */
      hideIcon: {
        type: Boolean
      },
      /**
       * Defines whether the MessageStrip renders close button.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideCloseButton: {
        type: Boolean
      }
    },
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.main.MessageStrip.prototype */{
      /**
       * Defines the text of the component.
       * <br><br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      },
      /**
       * Defines the content to be displayed as graphical element within the component.
       * <br><br>
       * <b>Note:</b> If no icon is given, the default icon for the component type will be used.
       * The SAP-icons font provides numerous options.
       * <br><br>
       *
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {sap.ui.webcomponents.main.IIcon}
       * @slot
       * @public
       */
      "icon": {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.main.MessageStrip.prototype */{
      /**
       * Fired when the close button is pressed either with a
       * click/tap or by using the Enter or Space key.
       *
       * @event
       * @public
       */
      close: {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-message-strip</code> component enables the embedding of app-related messages.
   * It displays 4 designs of messages, each with corresponding semantic color and icon: Information, Positive, Warning and Negative.
   * Each message can have a Close button, so that it can be removed from the UI, if needed.
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-message-strip</code> component, you can define whether it displays
   * an icon in the beginning and a close button. Moreover, its size and background
   * can be controlled with CSS.
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/MessageStrip";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.MessageStrip
   * @extends UI5Element
   * @tagname ui5-message-strip
   * @public
   * @since 0.9.0
   */
  class MessageStrip extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _MessageStripTemplate.default;
    }
    static get styles() {
      return _MessageStrip.default;
    }
    constructor() {
      super();
    }
    _closeClick() {
      this.fireEvent("close", {});
    }
    static get dependencies() {
      return [_Icon.default, _Button.default];
    }
    static async onDefine() {
      MessageStrip.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    static designClassesMappings() {
      return {
        "Information": "ui5-message-strip-root--info",
        "Positive": "ui5-message-strip-root--positive",
        "Negative": "ui5-message-strip-root--negative",
        "Warning": "ui5-message-strip-root--warning"
      };
    }
    static iconMappings() {
      return {
        "Information": "information",
        "Positive": "sys-enter-2",
        "Negative": "error",
        "Warning": "alert"
      };
    }
    static designAnnouncementMappings() {
      return {
        "Information": MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_INFORMATION),
        "Positive": MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_SUCCESS),
        "Negative": MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_ERROR),
        "Warning": MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_WARNING)
      };
    }
    get hiddenText() {
      return `${MessageStrip.designAnnouncementMappings()[this.design]} ${this.hideCloseButton ? "" : this._closableText}`;
    }
    get _closeButtonText() {
      return MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_CLOSE_BUTTON);
    }
    get _closableText() {
      return MessageStrip.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_CLOSABLE);
    }
    get classes() {
      return {
        root: {
          "ui5-message-strip-root": true,
          "ui5-message-strip-root-hide-icon": this.hideIcon,
          "ui5-message-strip-root-hide-close-button": this.hideCloseButton,
          [this.designClasses]: true
        }
      };
    }
    get iconProvided() {
      return this.icon.length > 0;
    }
    get standardIconName() {
      return MessageStrip.iconMappings()[this.design];
    }
    get designClasses() {
      return MessageStrip.designClassesMappings()[this.design];
    }
  }
  MessageStrip.define();
  var _default = MessageStrip;
  _exports.default = _default;
});