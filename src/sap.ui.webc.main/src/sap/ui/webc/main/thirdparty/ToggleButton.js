sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "./Button", "./generated/templates/ToggleButtonTemplate.lit", "./generated/themes/ToggleButton.css"], function (_exports, _Keys, _Device, _Button, _ToggleButtonTemplate, _ToggleButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Button = _interopRequireDefault(_Button);
  _ToggleButtonTemplate = _interopRequireDefault(_ToggleButtonTemplate);
  _ToggleButton = _interopRequireDefault(_ToggleButton);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-toggle-button",
    altTag: "ui5-togglebutton",
    properties:
    /** @lends sap.ui.webcomponents.main.ToggleButton.prototype */
    {
      /**
       * Determines whether the component is displayed as pressed.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      pressed: {
        type: Boolean
      }
    }
  };
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
   * @alias sap.ui.webcomponents.main.ToggleButton
   * @extends Button
   * @tagname ui5-toggle-button
   * @public
   */

  class ToggleButton extends _Button.default {
    static get metadata() {
      return metadata;
    }

    static get template() {
      return _ToggleButtonTemplate.default;
    }

    static get styles() {
      return [_Button.default.styles, _ToggleButton.default];
    }

    _onclick() {
      this.pressed = !this.pressed;

      if ((0, _Device.isSafari)()) {
        this.getDomRef().focus();
      }
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpaceShift)(event)) {
        event.preventDefault();
        return;
      }

      super._onkeyup(event);
    }

  }

  ToggleButton.define();
  var _default = ToggleButton;
  _exports.default = _default;
});