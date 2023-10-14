sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/config/CalendarType", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates"], function (_exports, _UI5Element, _LitRenderer, _customElement, _property, _LocaleData, _i18nBundle, _CalendarType, _DateFormat, _getCachedLocaleDataInstance, _CalendarType2, _getLocale, _CalendarDate, _ExtremeDates) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _DateFormat = _interopRequireDefault(_DateFormat);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _CalendarType2 = _interopRequireDefault(_CalendarType2);
  _getLocale = _interopRequireDefault(_getLocale);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var DateComponentBase_1;
  /**
   * @class
   *
   * Abstract class that provides common functionality for date-related components (day picker, month picker, year picker, calendar, date picker, date range picker, date time picker)
   * This includes:
   *  - "languageAware: true" metadata setting, CLDR fetch and i18n initialization
   *  - common properties (primaryCalendar, minDate, maxDate and formatPattern) declaration and methods that operate on them
   *  - additional common methods
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.DateComponentBase
   * @extends sap.ui.webc.base.UI5Element
   * @public
   */
  let DateComponentBase = DateComponentBase_1 = class DateComponentBase extends _UI5Element.default {
    constructor() {
      super();
    }
    get _primaryCalendarType() {
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      return this.primaryCalendarType || (0, _CalendarType.getCalendarType)() || localeData.getPreferredCalendarType();
    }
    get _secondaryCalendarType() {
      return this.secondaryCalendarType || (0, _CalendarType.getSecondaryCalendarType)();
    }
    get _minDate() {
      let minDate;
      if (this.minDate) {
        minDate = this._getMinMaxCalendarDateFromString(this.minDate);
      }
      return minDate || (0, _ExtremeDates.getMinCalendarDate)(this._primaryCalendarType);
    }
    get _maxDate() {
      let maxDate;
      if (this.maxDate) {
        maxDate = this._getMinMaxCalendarDateFromString(this.maxDate);
      }
      return maxDate || (0, _ExtremeDates.getMaxCalendarDate)(this._primaryCalendarType);
    }
    get _formatPattern() {
      return this.formatPattern || "medium"; // get from config
    }

    get _isPattern() {
      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
    }
    _getMinMaxCalendarDateFromString(date) {
      if (this.getFormat().parse(date)) {
        return this._getCalendarDateFromString(date);
      }
      const jsDate = this.getISOFormat().parse(date);
      if (jsDate) {
        return _CalendarDate.default.fromLocalJSDate(jsDate, this._primaryCalendarType);
      }
    }
    _getCalendarDateFromString(value) {
      const jsDate = this.getFormat().parse(value);
      if (jsDate) {
        return _CalendarDate.default.fromLocalJSDate(jsDate, this._primaryCalendarType);
      }
    }
    _getTimeStampFromString(value) {
      const calDate = this._getCalendarDateFromString(value);
      if (calDate) {
        return calDate.toUTCJSDate().valueOf();
      }
    }
    _getStringFromTimestamp(timestamp) {
      const localDate = new Date(timestamp);
      return this.getFormat().format(localDate, true);
    }
    getFormat() {
      return this._isPattern ? _DateFormat.default.getDateInstance({
        strictParsing: true,
        pattern: this._formatPattern,
        calendarType: this._primaryCalendarType
      }) : _DateFormat.default.getDateInstance({
        strictParsing: true,
        style: this._formatPattern,
        calendarType: this._primaryCalendarType
      });
    }
    getISOFormat() {
      if (!this._isoFormatInstance) {
        this._isoFormatInstance = _DateFormat.default.getDateInstance({
          strictParsing: true,
          pattern: "YYYY-MM-dd",
          calendarType: this._primaryCalendarType
        });
      }
      return this._isoFormatInstance;
    }
    static async onDefine() {
      [DateComponentBase_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), (0, _LocaleData.fetchCldr)((0, _getLocale.default)().getLanguage(), (0, _getLocale.default)().getRegion(), (0, _getLocale.default)().getScript())]);
    }
  };
  __decorate([(0, _property.default)({
    type: _CalendarType2.default
  })], DateComponentBase.prototype, "primaryCalendarType", void 0);
  __decorate([(0, _property.default)({
    type: _CalendarType2.default
  })], DateComponentBase.prototype, "secondaryCalendarType", void 0);
  __decorate([(0, _property.default)()], DateComponentBase.prototype, "formatPattern", void 0);
  __decorate([(0, _property.default)()], DateComponentBase.prototype, "minDate", void 0);
  __decorate([(0, _property.default)()], DateComponentBase.prototype, "maxDate", void 0);
  DateComponentBase = DateComponentBase_1 = __decorate([(0, _customElement.default)({
    languageAware: true,
    renderer: _LitRenderer.default
  })], DateComponentBase);
  var _default = DateComponentBase;
  _exports.default = _default;
});