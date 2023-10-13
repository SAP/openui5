sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "./types/ToastPlacement", "./generated/templates/ToastTemplate.lit", "./generated/themes/Toast.css"], function (_exports, _Integer, _UI5Element, _LitRenderer, _PopupUtils, _Keys, _Device, _customElement, _property, _ToastPlacement, _ToastTemplate, _Toast) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ToastPlacement = _interopRequireDefault(_ToastPlacement);
  _ToastTemplate = _interopRequireDefault(_ToastTemplate);
  _Toast = _interopRequireDefault(_Toast);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  // Styles

  // Constants
  const MIN_DURATION = 500;
  const MAX_DURATION = 1000;
  const openedToasts = [];
  let opener;
  const handleGlobalKeydown = e => {
    const isCtrl = e.metaKey || !(0, _Device.isMac)() && e.ctrlKey;
    const isMKey = e.key.toLowerCase() === "m";
    const isCombinationPressed = isCtrl && e.shiftKey && isMKey;
    const hasOpenToast = openedToasts.length;
    if (isCombinationPressed) {
      e.preventDefault();
      if (hasOpenToast) {
        openedToasts[0].focusable = true;
        if (openedToasts[0].focused) {
          openedToasts[0].focused = false;
          opener?.focus();
        } else {
          opener = document.activeElement;
          openedToasts[0].focus();
        }
      }
    }
  };
  document.addEventListener("keydown", handleGlobalKeydown);
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-toast</code> is a small, non-disruptive popup for success or information messages that
   * disappears automatically after a few seconds.
   *
   *
   * <h3>Usage</h3>
   *
   * <h4>When to use:</h4>
   * <ul>
   * <li>You want to display a short success or information message.</li>
   * <li>You do not want to interrupt users while they are performing an action.</li>
   * <li>You want to confirm a successful action.</li>
   * </ul>
   * <h4>When not to use:</h4>
   * <ul>
   * <li>You want to display error or warning message.</li>
   * <li>You want to interrupt users while they are performing an action.</li>
   * <li>You want to make sure that users read the message before they leave the page.</li>
   * <li>You want users to be able to copy some part of the message text.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Toast";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Toast
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-toast
   * @public
   * @since 1.0.0-rc.6
   */
  let Toast = class Toast extends _UI5Element.default {
    constructor() {
      super();
      this._reopen = false;
    }
    onAfterRendering() {
      if (this._reopen) {
        this._reopen = false;
        this._initiateOpening();
      }
    }
    /**
     * Shows the component.
     * @public
     */
    show() {
      if (this.open) {
        // If the Toast is already opened, we set the _reopen flag to true, in
        // order to trigger re-rendering after an animation frame
        // in the onAfterRendering hook.
        // This is needed for properly resetting the opacity transition.
        this._reopen = true;
        this.open = false;
      } else {
        this._initiateOpening();
      }
    }
    _onfocusin() {
      if (this.focusable) {
        this.focused = true;
      }
    }
    _onfocusout() {
      this.focused = false;
    }
    /**
     * If the minimum duration is lower than 500ms, we force
     * it to be 500ms, as described in the documentation.
     * @private
     * @returns {*}
     */
    get effectiveDuration() {
      return this.duration < MIN_DURATION ? MIN_DURATION : this.duration;
    }
    get styles() {
      // Transition duration (animation) should be a third of the duration
      // property, but not bigger than the maximum allowed (1000ms).
      const transitionDuration = Math.min(this.effectiveDuration / 3, MAX_DURATION);
      return {
        root: {
          "transition-duration": this.open ? `${transitionDuration}ms` : "",
          // Transition delay is the duration property minus the
          // transition duration (animation).
          "transition-delay": this.open ? `${this.effectiveDuration - transitionDuration}ms` : "",
          // We alter the opacity property, in order to trigger transition
          "opacity": this.open && !this.hover && !this.focused ? "0" : "",
          "z-index": (0, _PopupUtils.getNextZIndex)()
        }
      };
    }
    _initiateOpening() {
      this.domRendered = true;
      requestAnimationFrame(() => {
        this.open = true;
        openedToasts.pop();
        openedToasts.push(this);
      });
    }
    _ontransitionend() {
      if (this.hover || this.focused) {
        return;
      }
      this.domRendered = false;
      this.open = false;
      this.focusable = false;
      this.focused = false;
      openedToasts.pop();
    }
    _onmouseover() {
      this.hover = true;
    }
    _onmouseleave() {
      this.hover = false;
    }
    _onkeydown(e) {
      if ((0, _Keys.isEscape)(e)) {
        this.focused = false;
        opener?.focus();
      }
    }
    get _tabindex() {
      return this.focused ? "0" : "-1";
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 3000
  })], Toast.prototype, "duration", void 0);
  __decorate([(0, _property.default)({
    type: _ToastPlacement.default,
    defaultValue: _ToastPlacement.default.BottomCenter
  })], Toast.prototype, "placement", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toast.prototype, "open", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toast.prototype, "hover", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toast.prototype, "domRendered", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toast.prototype, "focusable", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toast.prototype, "focused", void 0);
  Toast = __decorate([(0, _customElement.default)({
    tag: "ui5-toast",
    renderer: _LitRenderer.default,
    styles: _Toast.default,
    template: _ToastTemplate.default
  })], Toast);
  Toast.define();
  var _default = Toast;
  _exports.default = _default;
});