sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/main/thirdparty/Icon", "./generated/templates/WizardTabTemplate.lit", "./generated/themes/WizardTab.css"], function (_exports, _UI5Element, _customElement, _property, _event, _LitRenderer, _Keys, _Icon, _WizardTabTemplate, _WizardTab) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _WizardTabTemplate = _interopRequireDefault(_WizardTabTemplate);
  _WizardTab = _interopRequireDefault(_WizardTab);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Private component, used internally by the <code>ui5-wizard</code>
   * to represent a "step" in the navigation header of the <code>ui5-wizard</code>.
   *
   * <h3>Usage</h3>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/WizardTab.js";</code> (imported with <ui5-wizard>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.WizardTab
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-wizard-tab
   * @private
   */
  let WizardTab = class WizardTab extends _UI5Element.default {
    _onclick() {
      if (!this.disabled) {
        this.fireEvent("selection-change-requested");
      }
    }
    _onkeyup(e) {
      if (this.disabled) {
        return;
      }
      if (((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) && !(0, _Keys.isSpaceShift)(e)) {
        e.preventDefault();
        this.fireEvent("selection-change-requested");
      }
    }
    _onfocusin() {
      this.fireEvent("focused");
    }
    get tabIndex() {
      return Number(this._tabIndex);
    }
    get hasTexts() {
      return this.titleText || this.subtitleText;
    }
    get accInfo() {
      return {
        "ariaSetsize": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaSetsize,
        "ariaPosinset": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaPosinset,
        "ariaLabel": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaLabel,
        "ariaCurrent": this.selected ? "true" : undefined,
        "ariaDisabled": this.disabled ? "true" : undefined
      };
    }
  };
  __decorate([(0, _property.default)()], WizardTab.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], WizardTab.prototype, "titleText", void 0);
  __decorate([(0, _property.default)()], WizardTab.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)()], WizardTab.prototype, "number", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardTab.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardTab.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardTab.prototype, "hideSeparator", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardTab.prototype, "activeSeparator", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardTab.prototype, "branchingSeparator", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1"
  })], WizardTab.prototype, "_tabIndex", void 0);
  WizardTab = __decorate([(0, _customElement.default)({
    tag: "ui5-wizard-tab",
    renderer: _LitRenderer.default,
    styles: _WizardTab.default,
    template: _WizardTabTemplate.default,
    dependencies: [_Icon.default]
  })
  /**
   * Fired when clicking on none disabled step.
   *
   * @event sap.ui.webc.fiori.WizardTab#selection-change-requested
   * @private
   */, (0, _event.default)("selection-change-requested")], WizardTab);
  WizardTab.define();
  var _default = WizardTab;
  _exports.default = _default;
});