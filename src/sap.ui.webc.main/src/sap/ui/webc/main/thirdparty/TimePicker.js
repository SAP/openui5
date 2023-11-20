sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "./TimePickerBase", "./generated/i18n/i18n-defaults"], function (_exports, _getLocale, _getCachedLocaleDataInstance, _property, _customElement, _TimePickerBase, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getLocale = _interopRequireDefault(_getLocale);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _TimePickerBase = _interopRequireDefault(_TimePickerBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TimePicker_1;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-time-picker</code> component provides an input field with assigned clocks which are opened on user action.
   * The <code>ui5-time-picker</code> allows users to select a localized time using touch, mouse, or keyboard input.
   * It consists of two parts: the time input field and the clocks.
   *
   * <h3>Usage</h3>
   * The user can enter a time by:
   * <ul>
   * <li>Using the clocks that are displayed in a popup</li>
   * <li>Typing it in directly in the input field</li>
   * </ul>
   * <br><br>
   * When the user makes an entry and chooses the enter key, the clocks show the corresponding time (hours, minutes and seconds separately).
   * When the user directly triggers the clocks display, the actual time is displayed.
   * For the <code>ui5-time-picker</code>
   *
   * <h3>Formatting</h3>
   *
   * If a time is entered by typing it into
   * the input field, it must fit to the used time format.
   * <br><br>
   * Supported format options are pattern-based on Unicode LDML Date Format notation.
   * For more information, see <ui5-link target="_blank" href="http://unicode.org/reports/tr35/#Date_Field_Symbol_Table">UTS #35: Unicode Locale Data Markup Language</ui5-link>.
   * <br><br>
   * For example, if the <code>format-pattern</code> is "HH:mm:ss",
   * a valid value string is "11:42:35" and the same is displayed in the input.
   *
   * <h3>Keyboard handling</h3>
   * [F4], [ALT]+[UP], [ALT]+[DOWN] Open/Close picker dialog and move focus to it.
   * <br>
   * When closed:
   * <ul>
   * <li>[PAGEUP] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.</li>
   * <li>[PAGEDOWN] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.</li>
   * <li>[SHIFT]+[PAGEUP] - Increments minutes by 1.</li>
   * <li>[SHIFT]+[PAGEDOWN] - Decrements minutes by 1.</li>
   * <li>[SHIFT]+[CTRL]+[PAGEUP] - Increments seconds by 1.</li>
   * <li>[SHIFT]+[CTRL]+[PAGEDOWN] - Decrements seconds by 1.</li>
   * <li>
   * </ul>
   * When opened:
   * <ul>
   * <li>[PAGEUP] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.</li>
   * <li>[PAGEDOWN] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.</li>
   * <li>[SHIFT]+[PAGEUP] - Increments minutes by 1.</li>
   * <li>[SHIFT]+[PAGEDOWN] - Decrements minutes by 1.</li>
   * <li>[SHIFT]+[CTRL]+[PAGEUP] - Increments seconds by 1.</li>
   * <li>[SHIFT]+[CTRL]+[PAGEDOWN] - Decrements seconds by 1.</li>
   * <li>[A] or [P] - Selects AM or PM respectively.</li>
   * <li>[0]-[9] - Allows direct time selecting (hours/minutes/seconds).</li>
   * <li>[:] - Allows switching between hours/minutes/seconds clocks. If the last clock is displayed and [:] is pressed, the first clock is beind displayed.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/TimePicker.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TimePicker
   * @extends sap.ui.webc.main.TimePickerBase
   * @tagname ui5-time-picker
   * @public
   * @since 1.0.0-rc.6
   */
  let TimePicker = TimePicker_1 = class TimePicker extends _TimePickerBase.default {
    onBeforeRendering() {
      this.value = this.normalizeValue(this.value) || this.value;
    }
    get _formatPattern() {
      const hasHours = !!this.formatPattern.match(/H/i);
      const fallback = !this.formatPattern || !hasHours;
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      return fallback ? localeData.getTimePattern("medium") : this.formatPattern;
    }
    get _displayFormat() {
      // @ts-ignore oFormatOptions is a private API of DateFormat
      return this.getFormat().oFormatOptions.pattern;
    }
    get _placeholder() {
      return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
    }
    /**
     * Currently selected time represented as JavaScript Date instance
     *
     * @readonly
     * @type {Date}
     * @public
     * @name sap.ui.webc.main.TimePicker.prototype.dateValue
     */
    get dateValue() {
      return this.getFormat().parse(this._effectiveValue);
    }
    get accInfo() {
      return {
        "ariaRoledescription": this.dateAriaDescription,
        "ariaHasPopup": "dialog",
        "ariaAutoComplete": "none",
        "ariaControls": `${this._id}-responsive-popover`
      };
    }
    get dateAriaDescription() {
      return TimePicker_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_INPUT_DESCRIPTION);
    }
  };
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], TimePicker.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)()], TimePicker.prototype, "formatPattern", void 0);
  TimePicker = TimePicker_1 = __decorate([(0, _customElement.default)("ui5-time-picker")], TimePicker);
  TimePicker.define();
  var _default = TimePicker;
  _exports.default = _default;
});