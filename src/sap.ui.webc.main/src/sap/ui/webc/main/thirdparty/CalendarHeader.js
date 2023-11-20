sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "sap/ui/webc/common/thirdparty/icons/slim-arrow-left", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Icon", "./generated/templates/CalendarHeaderTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/CalendarHeader.css"], function (_exports, _UI5Element, _customElement, _property, _event, _LitRenderer, _Keys, _i18nBundle, _Integer, _CalendarType, _slimArrowLeft, _slimArrowRight, _Icon, _CalendarHeaderTemplate, _i18nDefaults, _CalendarHeader) {
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
  _Integer = _interopRequireDefault(_Integer);
  _CalendarType = _interopRequireDefault(_CalendarType);
  _Icon = _interopRequireDefault(_Icon);
  _CalendarHeaderTemplate = _interopRequireDefault(_CalendarHeaderTemplate);
  _CalendarHeader = _interopRequireDefault(_CalendarHeader);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var CalendarHeader_1;

  // Styles

  let CalendarHeader = CalendarHeader_1 = class CalendarHeader extends _UI5Element.default {
    static async onDefine() {
      CalendarHeader_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
    }
    onBeforeRendering() {
      this._prevButtonText = CalendarHeader_1.i18nBundle.getText(_i18nDefaults.CALENDAR_HEADER_PREVIOUS_BUTTON);
      this._nextButtonText = CalendarHeader_1.i18nBundle.getText(_i18nDefaults.CALENDAR_HEADER_NEXT_BUTTON);
      if (this.hasSecondaryCalendarType) {
        this._secondMonthButtonText = this.buttonTextForSecondaryCalendarType.monthButtonText;
        this._secondYearButtonText = this.buttonTextForSecondaryCalendarType.yearButtonText;
      }
    }
    onPrevButtonClick(e) {
      if (this.isPrevButtonDisabled) {
        e.preventDefault();
        return;
      }
      this.fireEvent("previous-press", e);
      e.preventDefault();
    }
    onNextButtonClick(e) {
      if (this.isNextButtonDisabled) {
        e.preventDefault();
        return;
      }
      this.fireEvent("next-press", e);
      e.preventDefault();
    }
    onMonthButtonClick(e) {
      this.fireEvent("show-month-press", e);
    }
    onMonthButtonKeyDown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this.fireEvent("show-month-press", e);
      }
    }
    onMonthButtonKeyUp(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        this.fireEvent("show-month-press", e);
      }
    }
    onYearButtonClick(e) {
      this.fireEvent("show-year-press", e);
    }
    onYearButtonKeyDown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this.fireEvent("show-year-press", e);
      }
    }
    onYearButtonKeyUp(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        this.fireEvent("show-year-press", e);
      }
    }
    get hasSecondaryCalendarType() {
      return !!this.secondaryCalendarType;
    }
    get classes() {
      return {
        prevButton: {
          "ui5-calheader-arrowbtn": true,
          "ui5-calheader-arrowbtn-disabled": this.isPrevButtonDisabled
        },
        nextButton: {
          "ui5-calheader-arrowbtn": true,
          "ui5-calheader-arrowbtn-disabled": this.isNextButtonDisabled
        }
      };
    }
    get accInfo() {
      return {
        ariaLabelMonthButton: this.hasSecondaryCalendarType ? `${this._monthButtonText}, ${this.buttonTextForSecondaryCalendarType.monthButtonInfo}` : `${this._monthButtonText}`
      };
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], CalendarHeader.prototype, "timestamp", void 0);
  __decorate([(0, _property.default)({
    type: _CalendarType.default
  })], CalendarHeader.prototype, "primaryCalendarType", void 0);
  __decorate([(0, _property.default)({
    type: _CalendarType.default
  })], CalendarHeader.prototype, "secondaryCalendarType", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], CalendarHeader.prototype, "buttonTextForSecondaryCalendarType", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], CalendarHeader.prototype, "isNextButtonDisabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], CalendarHeader.prototype, "isPrevButtonDisabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], CalendarHeader.prototype, "isMonthButtonHidden", void 0);
  __decorate([(0, _property.default)()], CalendarHeader.prototype, "_monthButtonText", void 0);
  __decorate([(0, _property.default)()], CalendarHeader.prototype, "_yearButtonText", void 0);
  __decorate([(0, _property.default)()], CalendarHeader.prototype, "_yearButtonTextSecType", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], CalendarHeader.prototype, "isYearButtonHidden", void 0);
  CalendarHeader = CalendarHeader_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-calendar-header",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _CalendarHeaderTemplate.default,
    styles: _CalendarHeader.default,
    dependencies: [_Icon.default]
  }), (0, _event.default)("next-press"), (0, _event.default)("previous-press"), (0, _event.default)("show-month-press"), (0, _event.default)("show-year-press")], CalendarHeader);
  CalendarHeader.define();
  var _default = CalendarHeader;
  _exports.default = _default;
});