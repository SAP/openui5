sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "./types/MessageStripDesign", "./generated/templates/MessageStripTemplate.lit", "./Icon", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/MessageStrip.css"], function (_exports, _UI5Element, _property, _slot, _event, _customElement, _LitRenderer, _i18nBundle, _decline, _information, _sysEnter, _error, _alert, _MessageStripDesign, _MessageStripTemplate, _Icon, _Button, _i18nDefaults, _MessageStrip) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _MessageStripDesign = _interopRequireDefault(_MessageStripDesign);
  _MessageStripTemplate = _interopRequireDefault(_MessageStripTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _MessageStrip = _interopRequireDefault(_MessageStrip);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var MessageStrip_1;

  // Styles

  var DesignClassesMapping;
  (function (DesignClassesMapping) {
    DesignClassesMapping["Information"] = "ui5-message-strip-root--info";
    DesignClassesMapping["Positive"] = "ui5-message-strip-root--positive";
    DesignClassesMapping["Negative"] = "ui5-message-strip-root--negative";
    DesignClassesMapping["Warning"] = "ui5-message-strip-root--warning";
  })(DesignClassesMapping || (DesignClassesMapping = {}));
  var IconMapping;
  (function (IconMapping) {
    IconMapping["Information"] = "information";
    IconMapping["Positive"] = "sys-enter-2";
    IconMapping["Negative"] = "error";
    IconMapping["Warning"] = "alert";
  })(IconMapping || (IconMapping = {}));
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
   * @alias sap.ui.webc.main.MessageStrip
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-message-strip
   * @public
   * @since 0.9.0
   */
  let MessageStrip = MessageStrip_1 = class MessageStrip extends _UI5Element.default {
    _closeClick() {
      this.fireEvent("close");
    }
    static async onDefine() {
      MessageStrip_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    static designAnnouncementMappings() {
      const getTranslation = text => {
        return MessageStrip_1.i18nBundle.getText(text);
      };
      return {
        Information: getTranslation(_i18nDefaults.MESSAGE_STRIP_INFORMATION),
        Positive: getTranslation(_i18nDefaults.MESSAGE_STRIP_SUCCESS),
        Negative: getTranslation(_i18nDefaults.MESSAGE_STRIP_ERROR),
        Warning: getTranslation(_i18nDefaults.MESSAGE_STRIP_WARNING)
      };
    }
    get hiddenText() {
      return `${MessageStrip_1.designAnnouncementMappings()[this.design]} ${this.hideCloseButton ? "" : this._closableText}`;
    }
    get _closeButtonText() {
      return MessageStrip_1.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_CLOSE_BUTTON);
    }
    get _closableText() {
      return MessageStrip_1.i18nBundle.getText(_i18nDefaults.MESSAGE_STRIP_CLOSABLE);
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
      return IconMapping[this.design];
    }
    get designClasses() {
      return DesignClassesMapping[this.design];
    }
  };
  __decorate([(0, _property.default)({
    type: _MessageStripDesign.default,
    defaultValue: _MessageStripDesign.default.Information
  })], MessageStrip.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MessageStrip.prototype, "hideIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MessageStrip.prototype, "hideCloseButton", void 0);
  __decorate([(0, _slot.default)()], MessageStrip.prototype, "icon", void 0);
  MessageStrip = MessageStrip_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-message-strip",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _MessageStripTemplate.default,
    styles: _MessageStrip.default,
    dependencies: [_Icon.default, _Button.default]
  })
  /**
   * Fired when the close button is pressed either with a
   * click/tap or by using the Enter or Space key.
   *
   * @event sap.ui.webc.main.MessageStrip#close
   * @public
   */, (0, _event.default)("close")], MessageStrip);
  MessageStrip.define();
  var _default = MessageStrip;
  _exports.default = _default;
});