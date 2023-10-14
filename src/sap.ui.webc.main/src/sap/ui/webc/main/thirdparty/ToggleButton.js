sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "./Button", "./generated/templates/ToggleButtonTemplate.lit", "./generated/themes/ToggleButton.css"], function (_exports, _customElement, _property, _Keys, _Device, _Button, _ToggleButtonTemplate, _ToggleButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _Button = _interopRequireDefault(_Button);
  _ToggleButtonTemplate = _interopRequireDefault(_ToggleButtonTemplate);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-toggle-button</code> component is an enhanced <code>ui5-button</code>
   * that can be toggled between pressed and normal states.
   * Users can use the <code>ui5-toggle-button</code> as a switch to turn a setting on or off.
   * It can also be used to represent an independent choice similar to a check box.
   * <br><br>
   * Clicking or tapping on a <code>ui5-toggle-button</code> changes its state to <code>pressed</code>. The button returns to
   * its initial state when the user clicks or taps on it again.
   * By applying additional custom CSS-styling classes, apps can give a different style to any <code>ui5-toggle-button</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/ToggleButton";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToggleButton
   * @extends sap.ui.webc.main.Button
   * @tagname ui5-toggle-button
   * @public
   */
  let ToggleButton = class ToggleButton extends _Button.default {
    _onclick() {
      this.pressed = !this.pressed;
      if ((0, _Device.isSafari)()) {
        this.getDomRef().focus();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpaceShift)(e)) {
        e.preventDefault();
        return;
      }
      super._onkeyup(e);
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToggleButton.prototype, "pressed", void 0);
  ToggleButton = __decorate([(0, _customElement.default)({
    tag: "ui5-toggle-button",
    template: _ToggleButtonTemplate.default,
    styles: [_Button.default.styles, _ToggleButton.default]
  })], ToggleButton);
  ToggleButton.define();
  var _default = ToggleButton;
  _exports.default = _default;
});