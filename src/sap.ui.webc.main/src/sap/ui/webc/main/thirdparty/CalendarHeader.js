sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "sap/ui/webc/common/thirdparty/icons/slim-arrow-left", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Icon", "./generated/templates/CalendarHeaderTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/CalendarHeader.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _i18nBundle, _Integer, _CalendarType, _slimArrowLeft, _slimArrowRight, _Icon, _CalendarHeaderTemplate, _i18nDefaults, _CalendarHeader) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _CalendarType = _interopRequireDefault(_CalendarType);
  _Icon = _interopRequireDefault(_Icon);
  _CalendarHeaderTemplate = _interopRequireDefault(_CalendarHeaderTemplate);
  _CalendarHeader = _interopRequireDefault(_CalendarHeader);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  const metadata = {
    tag: "ui5-calendar-header",
    languageAware: true,
    properties: {
      /**
       * Already normalized by Calendar
       * @type {Integer}
       * @public
       */
      timestamp: {
        type: _Integer.default
      },
      /**
       * Already normalized by Calendar
       * @type {CalendarType}
       * @public
       */
      primaryCalendarType: {
        type: _CalendarType.default
      },
      /**
       * Already normalized by Calendar
       * @sience 1.0.0-rc.16
       * @defaultvalue undefined
       * @type {CalendarType}
       * @public
       */
      secondaryCalendarType: {
        type: _CalendarType.default
      },
      /**
       * Stores information for month button for secondary calendar type
       * @type {Object}
       * @private
      */
      buttonTextForSecondaryCalendarType: {
        type: Object
      },
      isNextButtonDisabled: {
        type: Boolean
      },
      isPrevButtonDisabled: {
        type: Boolean
      },
      isMonthButtonHidden: {
        type: Boolean
      },
      _monthButtonText: {
        type: String
      },
      _yearButtonText: {
        type: String
      },
      isYearButtonHidden: {
        type: Boolean
      }
    },
    events: {
      "previous-press": {},
      "next-press": {},
      "show-month-press": {},
      "show-year-press": {}
    }
  };
  class CalendarHeader extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _CalendarHeaderTemplate.default;
    }
    static get styles() {
      return _CalendarHeader.default;
    }
    static get dependencies() {
      return [_Icon.default];
    }
    static async onDefine() {
      CalendarHeader.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
    }
    onBeforeRendering() {
      this._prevButtonText = CalendarHeader.i18nBundle.getText(_i18nDefaults.CALENDAR_HEADER_PREVIOUS_BUTTON);
      this._nextButtonText = CalendarHeader.i18nBundle.getText(_i18nDefaults.CALENDAR_HEADER_NEXT_BUTTON);
      if (this.hasSecondaryCalendarType) {
        this._secondMonthButtonText = this.buttonTextForSecondaryCalendarType.monthButtonText;
        this._secondYearButtonText = this.buttonTextForSecondaryCalendarType.yearButtonText;
      }
    }
    onPrevButtonClick(event) {
      this.fireEvent("previous-press", event);
    }
    onNextButtonClick(event) {
      this.fireEvent("next-press", event);
    }
    onMonthButtonClick(event) {
      this.fireEvent("show-month-press", event);
    }
    onMonthButtonKeyDown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
      if ((0, _Keys.isEnter)(event)) {
        this.fireEvent("show-month-press", event);
      }
    }
    onMonthButtonKeyUp(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this.fireEvent("show-month-press", event);
      }
    }
    onYearButtonClick(event) {
      this.fireEvent("show-year-press", event);
    }
    onYearButtonKeyDown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
      if ((0, _Keys.isEnter)(event)) {
        this.fireEvent("show-year-press", event);
      }
    }
    onYearButtonKeyUp(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this.fireEvent("show-year-press", event);
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
        ariaLabelMonthButton: this.hasSecondaryCalendarType ? `${this._monthButtonText}, ${this.buttonTextForSecondaryCalendarType.info}` : `${this._monthButtonText}`
      };
    }
  }
  CalendarHeader.define();
  var _default = CalendarHeader;
  _exports.default = _default;
});