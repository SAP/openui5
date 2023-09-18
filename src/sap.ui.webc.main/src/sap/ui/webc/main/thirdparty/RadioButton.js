sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/Keys", "./Label", "./RadioButtonGroup", "./types/WrappingType", "./generated/templates/RadioButtonTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/RadioButton.css"], function (_exports, _Device, _FeaturesRegistry, _UI5Element, _property, _customElement, _slot, _event, _LitRenderer, _i18nBundle, _ValueState, _AriaLabelHelper, _Keys, _Label, _RadioButtonGroup, _WrappingType, _RadioButtonTemplate, _i18nDefaults, _RadioButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Label = _interopRequireDefault(_Label);
  _RadioButtonGroup = _interopRequireDefault(_RadioButtonGroup);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _RadioButtonTemplate = _interopRequireDefault(_RadioButtonTemplate);
  _RadioButton = _interopRequireDefault(_RadioButton);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var RadioButton_1;

  // Template

  // i18n

  // Styles

  let isGlobalHandlerAttached = false;
  let activeRadio;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-radio-button</code> component enables users to select a single option from a set of options.
   * When a <code>ui5-radio-button</code> is selected by the user, the
   * <code>change</code> event is fired.
   * When a <code>ui5-radio-button</code> that is within a group is selected, the one
   * that was previously selected gets automatically deselected. You can group radio buttons by using the <code>name</code> property.
   * <br>
   * <b>Note:</b> If <code>ui5-radio-button</code> is not part of a group, it can be selected once, but can not be deselected back.
   *
   * <h3>Keyboard Handling</h3>
   *
   * Once the <code>ui5-radio-button</code> is on focus, it might be selected by pressing the Space and Enter keys.
   * <br>
   * The Arrow Down/Arrow Up and Arrow Left/Arrow Right keys can be used to change selection between next/previous radio buttons in one group,
   * while TAB and SHIFT + TAB can be used to enter or leave the radio button group.
   * <br>
   * <b>Note:</b> On entering radio button group, the focus goes to the currently selected radio button.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/RadioButton";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.RadioButton
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-radio-button
   * @public
   */
  let RadioButton = RadioButton_1 = class RadioButton extends _UI5Element.default {
    static get formAssociated() {
      return true;
    }
    constructor() {
      super();
      this._internals = this.attachInternals();
      this._deactivate = () => {
        if (activeRadio) {
          activeRadio.active = false;
        }
      };
      if (!isGlobalHandlerAttached) {
        document.addEventListener("mouseup", this._deactivate);
        isGlobalHandlerAttached = true;
      }
    }
    static async onDefine() {
      RadioButton_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    onBeforeRendering() {
      this.syncGroup();
      this._enableFormSupport();
    }
    onExitDOM() {
      this.syncGroup(true);
    }
    syncGroup(forceRemove) {
      const oldGroup = this._name;
      const currentGroup = this.name;
      const oldChecked = this._checked;
      const currentChecked = this.checked;
      if (forceRemove) {
        _RadioButtonGroup.default.removeFromGroup(this, oldGroup);
      }
      if (currentGroup !== oldGroup) {
        if (oldGroup) {
          // remove the control from the previous group
          _RadioButtonGroup.default.removeFromGroup(this, oldGroup);
        }
        if (currentGroup) {
          // add the control to the existing group
          _RadioButtonGroup.default.addToGroup(this, currentGroup);
        }
      } else if (currentGroup) {
        _RadioButtonGroup.default.enforceSingleSelection(this, currentGroup);
      }
      if (this.name && currentChecked !== oldChecked) {
        _RadioButtonGroup.default.updateTabOrder(this.name);
      }
      this._name = this.name;
      this._checked = this.checked;
    }
    _enableFormSupport() {
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport) {
        this._setFormValue();
      } else if (this.value) {
        console.warn(`In order for the "value" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _setFormValue() {
      this._internals.setFormValue(this.checked ? this.value : null);
    }
    _resetFormValidity() {
      this._internals.setValidity({});
    }
    _invalidateForm() {
      this._internals.setValidity({
        valueMissing: true
      }, this.radioButtonGroupRequiredText, this.shadowRoot.firstElementChild);
    }
    _onclick() {
      return this.toggle();
    }
    _handleDown(e) {
      const currentGroup = this.name;
      if (!currentGroup) {
        return;
      }
      e.preventDefault();
      _RadioButtonGroup.default.selectNextItem(this, currentGroup);
    }
    _handleUp(e) {
      const currentGroup = this.name;
      if (!currentGroup) {
        return;
      }
      e.preventDefault();
      _RadioButtonGroup.default.selectPreviousItem(this, currentGroup);
    }
    _onkeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        this.active = true;
        return e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this.active = true;
        return this.toggle();
      }
      const isRTL = this.effectiveDir === "rtl";
      if ((0, _Keys.isDown)(e) || !isRTL && (0, _Keys.isRight)(e) || isRTL && (0, _Keys.isLeft)(e)) {
        this._handleDown(e);
      }
      if ((0, _Keys.isUp)(e) || !isRTL && (0, _Keys.isLeft)(e) || isRTL && (0, _Keys.isRight)(e)) {
        this._handleUp(e);
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this.toggle();
      }
      this.active = false;
    }
    _onmousedown() {
      this.active = true;
      activeRadio = this; // eslint-disable-line
    }

    _onmouseup() {
      this.active = false;
    }
    _onfocusout() {
      this.active = false;
    }
    toggle() {
      if (!this.canToggle()) {
        return this;
      }
      if (!this.name) {
        this.checked = !this.checked;
        this.fireEvent("change");
        return this;
      }
      _RadioButtonGroup.default.selectItem(this, this.name);
      return this;
    }
    canToggle() {
      return !(this.disabled || this.readonly || this.checked);
    }
    get classes() {
      return {
        inner: {
          "ui5-radio-inner--hoverable": !this.disabled && !this.readonly && (0, _Device.isDesktop)()
        }
      };
    }
    get effectiveAriaDisabled() {
      return this.disabled ? "true" : null;
    }
    get ariaLabelText() {
      return [(0, _AriaLabelHelper.getEffectiveAriaLabelText)(this), this.text].filter(Boolean).join(" ");
    }
    get effectiveAriaDescribedBy() {
      return this.hasValueState ? `${this._id}-descr` : undefined;
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get valueStateText() {
      switch (this.valueState) {
        case _ValueState.default.Error:
          return RadioButton_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR);
        case _ValueState.default.Warning:
          return RadioButton_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING);
        case _ValueState.default.Success:
          return RadioButton_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS);
        case _ValueState.default.Information:
          return RadioButton_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION);
        default:
          return "";
      }
    }
    get radioButtonGroupRequiredText() {
      return RadioButton_1.i18nBundle.getText(_i18nDefaults.RADIO_BUTTON_GROUP_REQUIRED);
    }
    get effectiveTabIndex() {
      const tabindex = this.getAttribute("tabindex");
      if (this.disabled) {
        return "-1";
      }
      if (this.name) {
        return this._tabIndex;
      }
      return tabindex || "0";
    }
    get strokeWidth() {
      return this.valueState === "None" ? "1" : "2";
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], RadioButton.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RadioButton.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RadioButton.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RadioButton.prototype, "checked", void 0);
  __decorate([(0, _property.default)()], RadioButton.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], RadioButton.prototype, "valueState", void 0);
  __decorate([(0, _property.default)()], RadioButton.prototype, "name", void 0);
  __decorate([(0, _property.default)()], RadioButton.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], RadioButton.prototype, "wrappingType", void 0);
  __decorate([(0, _property.default)()], RadioButton.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], RadioButton.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], RadioButton.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RadioButton.prototype, "active", void 0);
  __decorate([(0, _slot.default)()], RadioButton.prototype, "formSupport", void 0);
  RadioButton = RadioButton_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-radio-button",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _RadioButtonTemplate.default,
    styles: _RadioButton.default,
    dependencies: [_Label.default]
  })
  /**
   * Fired when the component checked state changes.
   *
   * @event sap.ui.webc.main.RadioButton#change
   * @public
   * @since 1.0.0-rc.15
   */, (0, _event.default)("change")], RadioButton);
  RadioButton.define();
  var _default = RadioButton;
  _exports.default = _default;
});