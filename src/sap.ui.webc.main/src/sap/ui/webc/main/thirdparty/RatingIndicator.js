sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/Float", "./generated/i18n/i18n-defaults", "./generated/templates/RatingIndicatorTemplate.lit", "./Icon", "sap/ui/webc/common/thirdparty/icons/favorite", "sap/ui/webc/common/thirdparty/icons/unfavorite", "./generated/themes/RatingIndicator.css"], function (_exports, _customElement, _event, _property, _UI5Element, _LitRenderer, _Keys, _AriaLabelHelper, _i18nBundle, _Integer, _Float, _i18nDefaults, _RatingIndicatorTemplate, _Icon, _favorite, _unfavorite, _RatingIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _Float = _interopRequireDefault(_Float);
  _RatingIndicatorTemplate = _interopRequireDefault(_RatingIndicatorTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _RatingIndicator = _interopRequireDefault(_RatingIndicator);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var RatingIndicator_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The Rating Indicator is used to display a specific number of icons that are used to rate an item.
   * Additionally, it is also used to display the average and overall ratings.
   *
   * <h3>Usage</h3>
   * The recommended number of icons is between 5 and 7.
   *
   * <h3>Responsive Behavior</h3>
   * You can change the size of the Rating Indicator by changing its <code>font-size</code> CSS property.
   * <br>
   * Example: <code>&lt;ui5-rating-indicator style="font-size: 3rem;">&lt;/ui5-rating-indicator></code>
   *
   * <h3>Keyboard Handling</h3>
   * When the <code>ui5-rating-indicator</code> is focused, the user can change the rating
   * with the following keyboard shortcuts:
   * <br>
   *
   * <ul>
   * <li>[RIGHT/UP] - Increases the value of the rating by one step. If the highest value is reached, does nothing</li>
   * <li>[LEFT/DOWN] - Decreases the value of the rating by one step. If the lowest value is reached, does nothing.</li>
   * <li>[HOME] - Sets the lowest value.</li>
   * <li>[END] - Sets the highest value.</li>
   * <li>[SPACE/ENTER/RETURN] - Increases the value of the rating by one step. If the highest value is reached, sets the rating to the lowest value.</li>
   * <li>Any number - Changes value to the corresponding number. If typed number is larger than the number of values, sets the highest value.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/RatingIndicator.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.RatingIndicator
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-rating-indicator
   * @public
   * @since 1.0.0-rc.8
   */
  let RatingIndicator = RatingIndicator_1 = class RatingIndicator extends _UI5Element.default {
    static async onDefine() {
      RatingIndicator_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
    }
    onBeforeRendering() {
      this.calcState();
    }
    calcState() {
      this._stars = [];
      for (let i = 1; i < this.max + 1; i++) {
        const remainder = Math.round((this.value - Math.floor(this.value)) * 10);
        let halfStar = false,
          tempValue = this.value;
        if (Math.floor(this.value) + 1 === i && remainder > 2 && remainder < 8) {
          halfStar = true;
        } else if (remainder <= 2) {
          tempValue = Math.floor(this.value);
        } else if (remainder >= 8) {
          tempValue = Math.ceil(this.value);
        }
        this._stars.push({
          selected: i <= tempValue,
          index: i,
          halfStar
        });
      }
    }
    _onclick(e) {
      const target = e.target;
      if (!(target instanceof HTMLElement) || this.disabled || this.readonly) {
        return;
      }
      const targetValue = target.getAttribute("data-ui5-value");
      if (targetValue !== null) {
        this.value = parseInt(targetValue);
        if (this.value === 1 && this._liveValue === 1) {
          this.value = 0;
        }
        if (this._liveValue !== this.value) {
          this.fireEvent("change");
          this._liveValue = this.value;
        }
      }
    }
    _onkeydown(e) {
      if (this.disabled || this.readonly) {
        return;
      }
      const isDecrease = (0, _Keys.isDown)(e) || (0, _Keys.isLeft)(e);
      const isIncrease = (0, _Keys.isRight)(e) || (0, _Keys.isUp)(e);
      const isIncreaseWithReset = (0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e);
      const isMin = (0, _Keys.isHome)(e);
      const isMax = (0, _Keys.isEnd)(e);
      const isNumber = e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105;
      if (isDecrease || isIncrease || isIncreaseWithReset || isMin || isMax || isNumber) {
        e.preventDefault();
        if (isDecrease && this.value > 0) {
          this.value = Math.round(this.value - 1);
        } else if (isIncrease && this.value < this.max) {
          this.value = Math.round(this.value + 1);
        } else if (isIncreaseWithReset) {
          const proposedValue = Math.round(this.value + 1);
          this.value = proposedValue > this.max ? 0 : proposedValue;
        } else if (isMin) {
          this.value = 0;
        } else if (isMax) {
          this.value = this.max;
        } else if (isNumber) {
          const pressedNumber = parseInt(e.key);
          this.value = pressedNumber > this.max ? this.max : pressedNumber;
        }
        this.fireEvent("change");
      }
    }
    _onfocusin() {
      if (this.disabled) {
        return;
      }
      this._focused = true;
      this._liveValue = this.value;
    }
    _onfocusout() {
      this._focused = false;
    }
    get effectiveTabIndex() {
      const tabindex = this.getAttribute("tabindex");
      return this.disabled ? "-1" : tabindex || "0";
    }
    get tooltip() {
      return this.getAttribute("title") || this.defaultTooltip;
    }
    get defaultTooltip() {
      return RatingIndicator_1.i18nBundle.getText(_i18nDefaults.RATING_INDICATOR_TOOLTIP_TEXT);
    }
    get _ariaRoleDescription() {
      return RatingIndicator_1.i18nBundle.getText(_i18nDefaults.RATING_INDICATOR_TEXT);
    }
    get _ariaDisabled() {
      return this.disabled || undefined;
    }
    get _ariaLabel() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get _ariaDescription() {
      return this.required ? RatingIndicator_1.i18nBundle.getText(_i18nDefaults.RATING_INDICATOR_ARIA_DESCRIPTION) : undefined;
    }
    get ariaReadonly() {
      return this.readonly ? "true" : undefined;
    }
  };
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 0
  })], RatingIndicator.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 5
  })], RatingIndicator.prototype, "max", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RatingIndicator.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RatingIndicator.prototype, "readonly", void 0);
  __decorate([(0, _property.default)()], RatingIndicator.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], RatingIndicator.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RatingIndicator.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], RatingIndicator.prototype, "_stars", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RatingIndicator.prototype, "_focused", void 0);
  RatingIndicator = RatingIndicator_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-rating-indicator",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: _RatingIndicator.default,
    template: _RatingIndicatorTemplate.default,
    dependencies: [_Icon.default]
  })
  /**
   * The event is fired when the value changes.
   *
   * @event sap.ui.webc.main.RatingIndicator#change
   * @public
   */, (0, _event.default)("change")], RatingIndicator);
  RatingIndicator.define();
  var _default = RatingIndicator;
  _exports.default = _default;
});