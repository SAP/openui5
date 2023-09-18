sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/willShowContent", "./types/ButtonDesign", "./types/ButtonType", "./generated/templates/ButtonTemplate.lit", "./Icon", "./generated/i18n/i18n-defaults", "./generated/themes/Button.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _Keys, _AriaLabelHelper, _FeaturesRegistry, _i18nBundle, _MarkedEvents, _Icons, _Device, _willShowContent, _ButtonDesign, _ButtonType, _ButtonTemplate, _Icon, _i18nDefaults, _Button) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _willShowContent = _interopRequireDefault(_willShowContent);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _ButtonType = _interopRequireDefault(_ButtonType);
  _ButtonTemplate = _interopRequireDefault(_ButtonTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Button_1;

  // Styles

  let isGlobalHandlerAttached = false;
  let activeButton = null;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-button</code> component represents a simple push button.
   * It enables users to trigger actions by clicking or tapping the <code>ui5-button</code>, or by pressing
   * certain keyboard keys, such as Enter.
   *
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-button</code> UI, you can define text, icon, or both. You can also specify
   * whether the text or the icon is displayed first.
   * <br><br>
   * You can choose from a set of predefined types that offer different
   * styling to correspond to the triggered action.
   * <br><br>
   * You can set the <code>ui5-button</code> as enabled or disabled. An enabled
   * <code>ui5-button</code> can be pressed by clicking or tapping it. The button changes
   * its style to provide visual feedback to the user that it is pressed or hovered over with
   * the mouse cursor. A disabled <code>ui5-button</code> appears inactive and cannot be pressed.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-button</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>button - Used to style the native button element</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Button";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Button
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-button
   * @implements sap.ui.webc.main.IButton
   * @public
   */
  let Button = Button_1 = class Button extends _UI5Element.default {
    constructor() {
      super();
      this._deactivate = () => {
        if (activeButton) {
          activeButton.active = false;
        }
      };
      if (!isGlobalHandlerAttached) {
        document.addEventListener("mouseup", this._deactivate);
        isGlobalHandlerAttached = true;
      }
      const handleTouchStartEvent = e => {
        (0, _MarkedEvents.markEvent)(e, "button");
        if (this.nonInteractive) {
          return;
        }
        this.active = true;
      };
      this._ontouchstart = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }
    onEnterDOM() {
      this._isTouch = ((0, _Device.isPhone)() || (0, _Device.isTablet)()) && !(0, _Device.isCombi)();
    }
    async onBeforeRendering() {
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (this.type !== _ButtonType.default.Button && !formSupport) {
        console.warn(`In order for the "type" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }

      if (this.submits && !formSupport) {
        console.warn(`In order for the "submits" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }

      this.iconOnly = this.isIconOnly;
      this.hasIcon = !!this.icon;
      this.buttonTitle = this.tooltip || (await (0, _Icons.getIconAccessibleName)(this.icon));
    }
    _onclick(e) {
      if (this.nonInteractive) {
        return;
      }
      (0, _MarkedEvents.markEvent)(e, "button");
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport && this._isSubmit) {
        formSupport.triggerFormSubmit(this);
      }
      if (formSupport && this._isReset) {
        formSupport.triggerFormReset(this);
      }
      if ((0, _Device.isSafari)()) {
        this.getDomRef()?.focus();
      }
    }
    _onmousedown(e) {
      if (this.nonInteractive || this._isTouch) {
        return;
      }
      (0, _MarkedEvents.markEvent)(e, "button");
      this.active = true;
      activeButton = this; // eslint-disable-line
    }

    _ontouchend(e) {
      if (this.disabled) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.active = false;
      if (activeButton) {
        activeButton.active = false;
      }
    }
    _onmouseup(e) {
      (0, _MarkedEvents.markEvent)(e, "button");
    }
    _onkeydown(e) {
      (0, _MarkedEvents.markEvent)(e, "button");
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.active = true;
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.active = false;
      }
    }
    _onfocusout() {
      if (this.nonInteractive) {
        return;
      }
      this.active = false;
      if ((0, _Device.isDesktop)()) {
        this.focused = false;
      }
    }
    _onfocusin(e) {
      if (this.nonInteractive) {
        return;
      }
      (0, _MarkedEvents.markEvent)(e, "button");
      if ((0, _Device.isDesktop)()) {
        this.focused = true;
      }
    }
    get hasButtonType() {
      return this.design !== _ButtonDesign.default.Default && this.design !== _ButtonDesign.default.Transparent;
    }
    get iconRole() {
      if (!this.icon) {
        return "";
      }
      return "presentation";
    }
    get isIconOnly() {
      return !(0, _willShowContent.default)(this.text);
    }
    static typeTextMappings() {
      return {
        "Positive": _i18nDefaults.BUTTON_ARIA_TYPE_ACCEPT,
        "Negative": _i18nDefaults.BUTTON_ARIA_TYPE_REJECT,
        "Emphasized": _i18nDefaults.BUTTON_ARIA_TYPE_EMPHASIZED
      };
    }
    get buttonTypeText() {
      return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
    }
    get tabIndexValue() {
      const tabindex = this.getAttribute("tabindex");
      if (tabindex) {
        return tabindex;
      }
      return this.nonInteractive ? "-1" : this._tabIndex;
    }
    get showIconTooltip() {
      return this.iconOnly && !this.tooltip;
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get _isSubmit() {
      return this.type === _ButtonType.default.Submit || this.submits;
    }
    get _isReset() {
      return this.type === _ButtonType.default.Reset;
    }
    static async onDefine() {
      Button_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: _ButtonDesign.default,
    defaultValue: _ButtonDesign.default.Default
  })], Button.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], Button.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "iconEnd", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "submits", void 0);
  __decorate([(0, _property.default)()], Button.prototype, "tooltip", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], Button.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], Button.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Button.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)({
    type: _ButtonType.default,
    defaultValue: _ButtonType.default.Button
  })], Button.prototype, "type", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "active", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "iconOnly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "hasIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "nonInteractive", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], Button.prototype, "buttonTitle", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Button.prototype, "_iconSettings", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "0",
    noAttribute: true
  })], Button.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Button.prototype, "_isTouch", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], Button.prototype, "text", void 0);
  Button = Button_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-button",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _ButtonTemplate.default,
    styles: _Button.default,
    dependencies: [_Icon.default]
  })
  /**
   * Fired when the component is activated either with a
   * mouse/tap or by using the Enter or Space key.
   * <br><br>
   * <b>Note:</b> The event will not be fired if the <code>disabled</code>
   * property is set to <code>true</code>.
   *
   * @event sap.ui.webc.main.Button#click
   * @public
   * @native
   */, (0, _event.default)("click")], Button);
  Button.define();
  var _default = Button;
  _exports.default = _default;
});