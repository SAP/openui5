sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "./types/BusyIndicatorSize", "./Label", "./generated/templates/BusyIndicatorTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/BusyIndicator.css"], function (_exports, _UI5Element, _customElement, _property, _LitRenderer, _i18nBundle, _Keys, _Integer, _BusyIndicatorSize, _Label, _BusyIndicatorTemplate, _i18nDefaults, _BusyIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _BusyIndicatorSize = _interopRequireDefault(_BusyIndicatorSize);
  _Label = _interopRequireDefault(_Label);
  _BusyIndicatorTemplate = _interopRequireDefault(_BusyIndicatorTemplate);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var BusyIndicator_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-busy-indicator</code> signals that some operation is going on and that the
   * user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
   * It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
   *
   * <h3>Usage</h3>
   * For the <code>ui5-busy-indicator</code> you can define the size, the text and whether it is shown or hidden.
   * In order to hide it, use the "active" property.
   * <br><br>
   * In order to show busy state over an HTML element, simply nest the HTML element in a <code>ui5-busy-indicator</code> instance.
   * <br>
   * <b>Note:</b> Since <code>ui5-busy-indicator</code> has <code>display: inline-block;</code> by default and no width of its own,
   * whenever you need to wrap a block-level element, you should set <code>display: block</code> to the busy indicator as well.
   *
   * <h4>When to use:</h4>
   * <ul>
   * <li>The user needs to be able to cancel the operation.</li>
   * <li>Only part of the application or a particular component is affected.</li>
   * </ul>
   *
   * <h4>When not to use:</h4>
   * <ul>
   * <li>The operation takes less than one second.</li>
   * <li>You need to block the screen and prevent the user from starting another activity.</li>
   * <li>Do not show multiple busy indicators at once.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/BusyIndicator";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.BusyIndicator
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-busy-indicator
   * @public
   * @since 0.12.0
   */
  let BusyIndicator = BusyIndicator_1 = class BusyIndicator extends _UI5Element.default {
    constructor() {
      super();
      this._keydownHandler = this._handleKeydown.bind(this);
      this._preventEventHandler = this._preventEvent.bind(this);
    }
    onEnterDOM() {
      this.addEventListener("keydown", this._keydownHandler, {
        capture: true
      });
      this.addEventListener("keyup", this._preventEventHandler, {
        capture: true
      });
    }
    onExitDOM() {
      if (this._busyTimeoutId) {
        clearTimeout(this._busyTimeoutId);
        delete this._busyTimeoutId;
      }
      this.removeEventListener("keydown", this._keydownHandler, true);
      this.removeEventListener("keyup", this._preventEventHandler, true);
    }
    static async onDefine() {
      BusyIndicator_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get ariaTitle() {
      return BusyIndicator_1.i18nBundle.getText(_i18nDefaults.BUSY_INDICATOR_TITLE);
    }
    get labelId() {
      return this.text ? `${this._id}-label` : undefined;
    }
    get classes() {
      return {
        root: {
          "ui5-busy-indicator-root": true
        }
      };
    }
    onBeforeRendering() {
      if (this.active) {
        if (!this._isBusy && !this._busyTimeoutId) {
          this._busyTimeoutId = setTimeout(() => {
            delete this._busyTimeoutId;
            this._isBusy = true;
          }, Math.max(0, this.delay));
        }
      } else {
        if (this._busyTimeoutId) {
          clearTimeout(this._busyTimeoutId);
          delete this._busyTimeoutId;
        }
        this._isBusy = false;
      }
    }
    _handleKeydown(e) {
      if (!this._isBusy) {
        return;
      }
      e.stopImmediatePropagation();
      // move the focus to the last element in this DOM and let TAB continue to the next focusable element
      if ((0, _Keys.isTabNext)(e)) {
        this.focusForward = true;
        this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
        this.focusForward = false;
      }
    }
    _preventEvent(e) {
      if (this._isBusy) {
        e.stopImmediatePropagation();
      }
    }
    /**
     * Moves the focus to busy area when coming with SHIFT + TAB
     */
    _redirectFocus(e) {
      if (this.focusForward) {
        return;
      }
      e.preventDefault();
      this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
    }
  };
  __decorate([(0, _property.default)()], BusyIndicator.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: _BusyIndicatorSize.default,
    defaultValue: _BusyIndicatorSize.default.Medium
  })], BusyIndicator.prototype, "size", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], BusyIndicator.prototype, "active", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], BusyIndicator.prototype, "delay", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], BusyIndicator.prototype, "_isBusy", void 0);
  BusyIndicator = BusyIndicator_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-busy-indicator",
    languageAware: true,
    styles: _BusyIndicator.default,
    renderer: _LitRenderer.default,
    template: _BusyIndicatorTemplate.default,
    dependencies: [_Label.default]
  })], BusyIndicator);
  BusyIndicator.define();
  var _default = BusyIndicator;
  _exports.default = _default;
});