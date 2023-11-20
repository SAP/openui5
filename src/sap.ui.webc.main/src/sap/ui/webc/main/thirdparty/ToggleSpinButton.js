sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "./Button", "./ToggleButton", "./generated/templates/ToggleSpinButtonTemplate.lit"], function (_exports, _customElement, _property, _LitRenderer, _Integer, _Button, _ToggleButton, _ToggleSpinButtonTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _Button = _interopRequireDefault(_Button);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  _ToggleSpinButtonTemplate = _interopRequireDefault(_ToggleSpinButtonTemplate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * <code>ui5-toggle-spin-button</code> is explicitly used in the new design of <code>ui5-time-picker</code>.
   * It extends <code>ui5-toggle-button</code> with some specific accessibility-related properties in order to
   * have spin button look and feel from accessibility point of view. This component should not be used separately.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToggleSpinButton
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-toggle-spin-button
   * @since 1.15.0
   * @private
   */
  let ToggleSpinButton = class ToggleSpinButton extends _ToggleButton.default {
    /**
     * Override of the handler in order to prevent button toggle functionality
     */
    _onclick() {}
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], ToggleSpinButton.prototype, "valueMin", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], ToggleSpinButton.prototype, "valueMax", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], ToggleSpinButton.prototype, "valueNow", void 0);
  __decorate([(0, _property.default)()], ToggleSpinButton.prototype, "valueText", void 0);
  ToggleSpinButton = __decorate([(0, _customElement.default)({
    tag: "ui5-toggle-spin-button",
    renderer: _LitRenderer.default,
    styles: [_Button.default.styles, _ToggleButton.default.styles],
    template: _ToggleSpinButtonTemplate.default
  })], ToggleSpinButton);
  ToggleSpinButton.define();
  var _default = ToggleSpinButton;
  _exports.default = _default;
});