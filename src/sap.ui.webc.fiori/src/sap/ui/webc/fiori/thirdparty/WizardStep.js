sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property"], function (_exports, _UI5Element, _customElement, _property) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
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
   *
   * A component that represents a logical step as part of the <code>ui5-wizard</code>.
   * It is meant to aggregate arbitrary HTML elements that form the content of a single step.
   *
   * <h3>Structure</h3>
   * <ul>
   * <li>Each wizard step has arbitrary content.</li>
   * <li>Each wizard step might have texts - defined by the <code>titleText</code> and <code>subtitleText</code> properties.</li>
   * <li>Each wizard step might have an icon - defined by the <code>icon</code> property.</li>
   * <li>Each wizard step might display a number in place of the <code>icon</code>, when it's missing.</li>
   * </ul>
   *
   * <h3>Usage</h3>
   * The <code>ui5-wizard-step</code> component should be used only as slot of the <code>ui5-wizard</code> component
   * and should not be used standalone.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.WizardStep
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-wizard-step
   * @since 1.0.0-rc.10
   * @implements sap.ui.webc.fiori.IWizardStep
   * @public
   */
  let WizardStep = class WizardStep extends _UI5Element.default {};
  __decorate([(0, _property.default)()], WizardStep.prototype, "titleText", void 0);
  __decorate([(0, _property.default)()], WizardStep.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)()], WizardStep.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardStep.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardStep.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], WizardStep.prototype, "branching", void 0);
  WizardStep = __decorate([(0, _customElement.default)("ui5-wizard-step")], WizardStep);
  WizardStep.define();
  var _default = WizardStep;
  _exports.default = _default;
});