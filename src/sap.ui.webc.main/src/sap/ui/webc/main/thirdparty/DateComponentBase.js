sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/config/CalendarType", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates"], function (_exports, _UI5Element, _LitRenderer, _LocaleData, _i18nBundle, _CalendarType, _DateFormat, _getCachedLocaleDataInstance, _CalendarType2, _getLocale, _CalendarDate, _ExtremeDates) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _DateFormat = _interopRequireDefault(_DateFormat);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _CalendarType2 = _interopRequireDefault(_CalendarType2);
  _getLocale = _interopRequireDefault(_getLocale);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @public
   */
  const metadata = {
    languageAware: true,
    properties: /** @lends sap.ui.webcomponents.main.DateComponentBase.prototype */{
      /**
       * Sets a calendar type used for display.
       * If not set, the calendar type of the global configuration is used.
       * @type {CalendarType}
       * @public
       */
      primaryCalendarType: {
        type: _CalendarType2.default
      },
      /**
       * Defines the secondary calendar type.
       * If not set, the calendar will only show the primary calendar type.
       * @type {CalendarType}
       * @since 1.0.0-rc.16
       * @defaultvalue undefined
       * @public
       */
      secondaryCalendarType: {
        type: _CalendarType2.default
      },
      /**
       * Determines the minimum date available for selection.
       *
       * @type {string}
       * @defaultvalue ""
       * @since 1.0.0-rc.6
       * @public
       */
      minDate: {
        type: String
      },
      /**
       * Determines the maximum date available for selection.
       *
       * @type {string}
       * @defaultvalue ""
       * @since 1.0.0-rc.6
       * @public
       */
      maxDate: {
        type: String
      },
      /**
       * Determines the format, displayed in the input field.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      formatPattern: {
        type: String
      }
    }
  };

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
   * @alias sap.ui.webcomponents.main.DateComponentBase
   * @extends sap.ui.webcomponents.base.UI5Element
   * @public
   */
  class DateComponentBase extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    constructor() {
      super();
    }
    get _primaryCalendarType() {
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      return this.primaryCalendarType || (0, _CalendarType.getCalendarType)() || localeData.getPreferredCalendarType();
    }
    get _minDate() {
      return this.minDate && this.getFormat().parse(this.minDate) ? this._getCalendarDateFromString(this.minDate) : (0, _ExtremeDates.getMinCalendarDate)(this._primaryCalendarType);
    }
    get _maxDate() {
      return this.maxDate && this.getFormat().parse(this.maxDate) ? this._getCalendarDateFromString(this.maxDate) : (0, _ExtremeDates.getMaxCalendarDate)(this._primaryCalendarType);
    }
    get _formatPattern() {
      return this.formatPattern || "medium"; // get from config
    }

    get _isPattern() {
      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
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
      return this._isPattern ? _DateFormat.default.getInstance({
        strictParsing: true,
        pattern: this._formatPattern,
        calendarType: this._primaryCalendarType
      }) : _DateFormat.default.getInstance({
        strictParsing: true,
        style: this._formatPattern,
        calendarType: this._primaryCalendarType
      });
    }
    static async onDefine() {
      [DateComponentBase.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), (0, _LocaleData.fetchCldr)((0, _getLocale.default)().getLanguage(), (0, _getLocale.default)().getRegion(), (0, _getLocale.default)().getScript())]);
    }
  }
  var _default = DateComponentBase;
  _exports.default = _default;
});