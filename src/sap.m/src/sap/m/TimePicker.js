/*!
 * ${copyright}
 */

// Provides control sap.m.TimePicker.
sap.ui.define([
	'./InputBase',
	'./DateTimeField',
	'./MaskInputRule',
	'./Toolbar',
	'./ToolbarSpacer',
	'./Popover',
	'./ResponsivePopover',
	"sap/base/i18n/Formatting",
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'./TimePickerInternals',
	'./TimePickerClocks',
	'./TimePickerInputs',
	'./MaskEnabler',
	'sap/ui/Device',
	"sap/ui/core/Lib",
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/Locale',
	'sap/m/library',
	'sap/ui/core/LocaleData',
	'./TimePickerRenderer',
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/core/InvisibleText",
	'./Button',
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
],
function(
	InputBase,
	DateTimeField,
	MaskInputRule,
	Toolbar,
	ToolbarSpacer,
	Popover,
	ResponsivePopover,
	Formatting,
	EnabledPropagator,
	IconPool,
	TimePickerInternals,
	TimePickerClocks,
	TimePickerInputs,
	MaskEnabler,
	Device,
	Library,
	DateFormat,
	Locale,
	library,
	LocaleData,
	TimePickerRenderer,
	KeyCodes,
	Log,
	InvisibleText,
	Button,
	jQuery,
	UI5Date
) {
		"use strict";

		// shortcut for sap.m.PlacementType, sap.m.TimePickerMaskMode, sap.m.ButtonType and default step for minutes
		// and seconds
		var PlacementType = library.PlacementType,
			TimePickerMaskMode = library.TimePickerMaskMode,
			ButtonType = library.ButtonType,
			DEFAULT_STEP = 1;

		/**
		 * Constructor for a new <code>TimePicker</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A single-field input control that enables the users to fill time related input fields.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>TimePicker</code> control enables the users to fill time related input
		 * fields using touch, mouse, or keyboard input.
		 *
		 * <h3>Usage</h3>
		 *
		 * Use this control if you want the user to select a time. If you want the user to
		 * select a duration (1 hour), use the {@link sap.m.Select} control instead.
		 *
		 * The user can fill time by:
		 *
 		 * <ul><li>Using the time picker button that opens a popover with а time picker clock dial</li>
		 * <li>Using the time input field. On desktop - by changing the time directly via keyboard input.
		 * On mobile/touch device - in another input field that opens in a popup after tap.</li></ul>
		 *
		 * On app level, there are two options to provide value for the
		 * <code>TimePicker</code> - as a string to the <code>value</code> property or as a
		 * UI5Date or JavaScript Date object to the <code>dateValue</code> property (only one of these
		 * properties should be used at a time):
		 *
		 * <ul><li>Use the <code>value</code> property if you want to bind the
		 * <code>TimePicker</code> to a model using the
		 * <code>sap.ui.model.type.Time</code></li>
		 * <caption> binding the <code>value</code> property by using types </caption>
		 * <pre>
		 * new sap.ui.model.json.JSONModel({date: sap.ui.core.date.UI5Date.getInstance(2022,10,10,10,15,10)});
		 *
		 * new sap.m.TimePicker({
		 *     value: {
		 *         type: "sap.ui.model.type.Time",
		 *         path:"/date"
		 *     }
		 * });
		 * </pre>
		 * <li>Use the <code>value</code> property if the date is provided as a string from
		 * the backend or inside the app (for example, as ABAP type DATS field)</li>
		 * <caption> binding the <code>value</code> property by using types </caption>
		 * <pre>
		 * new sap.ui.model.json.JSONModel({date:"10:15:10"});
		 * new sap.m.TimePicker({
		 *     value: {
		 *         type: "sap.ui.model.type.Time",
		 *         path: "/date",
		 *         formatOptions: {
		 *             source: {
		 *                 pattern: "HH:mm:ss"
		 *             }
		 *         }
		 *     }
		 * });
		 * </pre>
		 * <b>Note:</b> There are multiple binding type choices, such as:
		 * sap.ui.model.type.Date
		 * sap.ui.model.odata.type.DateTime
		 * sap.ui.model.odata.type.DateTimeOffset
		 * See {@link sap.ui.model.type.Date}, {@link sap.ui.model.odata.type.DateTime} or {@link sap.ui.model.odata.type.DateTimeOffset}
		 *
		 * <li>Use the <code>dateValue</code> property if the date is already provided as a
		 * UI5Date or JavaScript Date object or you want to work with a UI5Date or JavaScript Date object.
		 * Use <code>dateValue</code> as a helper property to easily obtain the hours, minutes and seconds
		 * of the chosen time. Although possible to bind it, the recommendation is to not to do it.
		 * When binding is needed, use <code>value</code> property instead</li></ul>
		 *
		 * <h3>Formatting</h3>
		 *
		 * All formatting and parsing of values from and to strings is done using the
		 * {@link sap.ui.core.format.DateFormat}. If a value is entered by typing it into
		 * the input field, it must fit to the used time format and locale.
		 *
		 * Supported format options are pattern-based on Unicode LDML Date Format notation.
		 * The format pattern symbols supported in TimePicker are as follows:
		 * "h"/"H" (Hour), "m" (Minute), "s" (Second), and "a" (AM/PM).
		 *
		 * See {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
		 *
		 * A time format must be specified, otherwise the default "HH:mm:ss a" will be
		 * used. For example, if the <code>valueFormat</code> is "HH-mm-ss a", the
		 * <code>displayFormat</code> is "HH:mm:ss a", and the used locale is English, a
		 * valid value string is "10-30-15 AM", which leads to an output of "10:30:15 AM".
		 *
		 * If no placeholder is set to the <code>TimePicker</code>, the used
		 * <code>displayFormat</code> is displayed as a placeholder. If another placeholder
		 * is needed, it must be set.
		 *
		 * <b>Note:</b> If the string does NOT match the <code>displayFormat</code>
		 * (from user input) or the <code>valueFormat</code> (on app level), the
		 * {@link sap.ui.core.format.DateFormat} makes an attempt to parse it based on the
		 * locale settings. For more information, see the respective documentation in the
		 * API Reference.
		 *
		 * <h3>Responsive behavior</h3>
		 *
		 * The <code>TimePicker</code> is responsive and fully adapts to all device types.
		 * For larger screens, such as tablet or desktop, it opens as a popover. For
		 * mobile devices, it opens in full screen.
		 *
		 * @extends sap.m.DateTimeField
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.32
		 * @alias sap.m.TimePicker
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/time-picker/ Time Picker}
		 */
		var TimePicker = DateTimeField.extend("sap.m.TimePicker", /** @lends sap.m.TimePicker.prototype */ {
			metadata : {
				library : "sap.m",
				designtime: "sap/m/designtime/TimePicker.designtime",
				properties : {
					/**
					 * Defines the locale used to parse string values representing time.
					 *
					 * Determines the locale, used to interpret the string, supplied by the
					 * <code>value</code> property.
					 *
					 * Example: AM in the string "09:04 AM" is locale (language) dependent.
					 * The format comes from the browser language settings if not set explicitly.
					 * Used in combination with 12 hour <code>displayFormat</code> containing 'a', which
					 * stands for day period string.
					 */
					localeId: {type : "string", group: "Data"},

					/**
					 * Displays the text of the general picker label and is read by screen readers.
					 * It is visible only on phone.
					 */
					title: {type: "string", group: "Misc", defaultValue: null},

					/**
					 * Sets the minutes step. If step is less than 1, it will be automatically converted back to 1.
					 * The minutes clock is populated only by multiples of the step.
					 * @since 1.40
					 */
					minutesStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

					/**
					 * Sets the seconds step. If step is less than 1, it will be automatically converted back to 1.
					 * The seconds clock is populated only by multiples of the step.
					 * @since 1.40
					 */
					secondsStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

					/**
					 * Defines a placeholder symbol. Shown at the position where there is no user input yet.
					 */
					placeholderSymbol: {type: "string", group: "Misc", defaultValue: "_"},

					/**
					 * Mask defined by its characters type (respectively, by its length).
					 * You should consider the following important facts:
					 * 1. The mask characters normally correspond to an existing rule (one rule per unique char).
					 * Characters which don't, are considered immutable characters (for example, the mask '2099', where '9' corresponds to a rule
					 * for digits, has the characters '2' and '0' as immutable).
					 * 2. Adding a rule corresponding to the <code>placeholderSymbol</code> is not recommended and would lead to an unpredictable behavior.
					 * 3. You can use the special escape character '^' called "Caret" prepending a rule character to make it immutable.
					 * Use the double escape '^^' if you want to make use of the escape character as an immutable one.
					 */
					mask: {type: "string", group: "Misc", defaultValue: null},

					/**
					 * Defines the state of the mask. The available mask modes are:
					 * <code>On</code> - The mask is automatically enabled for fixed-length time formats, and disabled when the time format does not have a fixed length.
					 * <code>Off</code> - The mask is disabled. In this mode, there are no restrictions or validations for the user input.
					 * <code>Enforce</code> - The mask will always be enforced, regardless of the length of the time format.
					 *
					 * <b>Note:</b> The mask functions correctly only with fixed-length time formats.
					 * The mask is always disabled when using a mobile device
					 * Using the <code>Enforce</code> value with time formats that do not have a fixed length may lead to unpredictable behavior.
					 * Changing the mask mode does not reset any pre-set validation rules. These rules will be applied according to the selected mask mode.
					 * @since 1.54
					 */
					maskMode: {type: "sap.m.TimePickerMaskMode", group: "Misc", defaultValue: TimePickerMaskMode.On},

					/**
					 * Allows to set a value of 24:00, used to indicate the end of the day.
					 * Works only with HH or H formats. Don't use it together with am/pm.
					 * @since 1.54
					 *
					 * When this property is set to <code>true</code>, the clock can display either 24 or 00 as last hour.
					 * If you use the time picker clock dial, the change between 24 and 00 (and vice versa) can be done as follows:
					 *
					 * - on a desktop device: hold down the <code>Ctrl</code> key (this changes 24 to 00 and vice versa), and either
					 * click with mouse on the 00/24 number, or navigate to this value using Arrow keys/PageUp/PageDown and press
					 * <code>Space</code> key (Space key selects the highlighted value and switch to the next available clock).
					 *
					 * - on mobile/touch device: make a long touch on 24/00 value - this action toggles the value to the opposite one.
					 *
					 * - on both device types, if there is a keyboard attached: 24 or 00 can be typed directly.
					 */
					support2400: {type: "boolean", group: "Misc", defaultValue: false},

					/**
					 * Determines whether the input field of the picker is hidden or visible.
					 * When set to <code>true</code>, the input field becomes invisible and there is no way to open the picker popover.
					 * In that case it can be opened by another control through calling of picker's <code>openBy</code> method, and
					 * the opening control's DOM reference must be provided as parameter.
					 *
					 * Note: Since the picker is not responsible for accessibility attributes of the control which opens its popover,
					 * those attributes should be added by the application developer. The following is recommended to be added to the
					 * opening control: a text or tooltip that describes the action (example: "Open Time Picker"), and also aria-haspopup
					 * attribute with value of <code>sap.ui.core.aria.HasPopup.Dialog</code>.
					 *
					 * @since 1.97
					 */
					hideInput: { type: "boolean", group: "Misc", defaultValue: false },

					/**
					 * Determines whether there is a shortcut navigation to current time.
					 *
					 * @since 1.98
					 */
					showCurrentTimeButton : {type : "boolean", group : "Behavior", defaultValue : false}

				},
				aggregations: {

					/**
					 A list of validation rules (one rule per mask character).
					 */
					rules: {type: "sap.m.MaskInputRule", multiple: true, singularName: "rule"},

					/**
					 * Internal aggregation that contains the inner clock _picker pop-up.
					 */
					 _picker: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" },

					/**
					 * Internal aggregation that contains the inner numeric _picker pop-up.
					 */
					 _numPicker: { type: "sap.m.Popover", multiple: false, visibility: "hidden" }
				},
				events: {

					/**
					 * Fired when <code>value help</code> dialog opens.
					 * @since 1.102.0
					 */
					afterValueHelpOpen: {},

					/**
					 * Fired when <code>value help</code> dialog closes.
					 * @since 1.102.0
					 */
					afterValueHelpClose: {},

					/**
					 * Fired when the value of the <code>TimePicker</code> is changed by user interaction - each keystroke, delete, paste, etc.
					 *
					 * <b>Note:</b> Browsing autocomplete suggestions doesn't fire the event.
					 * @since 1.104.0
					 */
					liveChange: {
						parameters : {
							/**
							 * The current value of the input, after a live change event.
							 */
							value: {type : "string"},

							/**
						 	 * The previous value of the input, before the last user interaction.
							 */
							previousValue: {type : "string"}
						}
					}
				},

				dnd: { draggable: false, droppable: true }
		},

			renderer: TimePickerRenderer
		});

		/**
		 * Determines the format, displayed in the input field and the picker clocks/numeric inputs.
		 *
		 * The default value is the browser's medium time format locale setting
		 * {@link sap.ui.core.LocaleData#getTimePattern}.
		 * If data binding with type {@link sap.ui.model.type.Time} or {@link sap.ui.model.odata.type.Time}
		 * is used for the <code>value</code> property, the <code>displayFormat</code> property
		 * is ignored as the information is provided from the binding itself.
		 *
		 * @returns {string} the value of property <code>displayFormat</code>
		 * @public
		 * @name sap.m.TimePicker#getDisplayFormat
		 * @function
		 */

		/**
		 * Determines the format of the value property.
		 *
		 * The default value is the browser's medium time format locale setting
		 * {@link sap.ui.core.LocaleData#getTimePattern}.
		 * If data binding with type {@link sap.ui.model.type.Time} or {@link sap.ui.model.odata.type.Time}
		 * is used for the <code>value</code> property, the <code>valueFormat</code> property
		 * is ignored as the information is provided from the binding itself.
		 *
		 * @returns {string} the value of property <code>valueFormat</code>
		 * @public
		 * @name sap.m.TimePicker#getValueFormat
		 * @function
		 */

		/**
		 * Holds a reference to a UI5Date or JavaScript Date object. The <code>value</code> (string)
		 * property will be set according to it. Alternatively, if the <code>value</code>
		 * and <code>valueFormat</code> pair properties are supplied instead,
		 * the <code>dateValue</code> will be instantiated according to the parsed
		 * <code>value</code>.
		 *
		 * @returns {Date|module:sap/ui/core/date/UI5Date} the value of property <code>dateValue</code>
		 * @public
		 * @name sap.m.TimePicker#getDateValue
		 * @function
		 */

		IconPool.insertFontFaceStyle();
		EnabledPropagator.call(TimePicker.prototype, true);
		MaskEnabler.call(TimePicker.prototype);

		var TimeFormatStyles = {
				Short: "short",
				Medium: "medium",
				Long: "long"
			},
			TimeParts = {
				Hour: "hour",
				Minute: "minute",
				Second: "second"
			},
			PLACEHOLDER_SYMBOL = '-';

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		TimePicker.prototype.init = function() {
			DateTimeField.prototype.init.apply(this, arguments);

			MaskEnabler.init.apply(this, arguments);

			this.setDisplayFormat(getDefaultDisplayFormat());

			this._oResourceBundle = Library.getResourceBundleFor("sap.m");

			// marks if the value is valid or not
			this._bValid = false;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for the display
			 see https://sdk.openui5.org/api/sap.ui.core.LocaleData/methods/getTimePattern */
			this._sUsedDisplayPattern = null;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for inputting
				 see https://sdk.openui5.org/api/sap.ui.core.LocaleData/methods/getTimePattern */
			this._sUsedValuePattern = null;

			this._oDisplayFormat = null;
			this._sValueFormat = null;
			this._oPopoverKeydownEventDelegate = null;

			this._rPlaceholderRegEx = new RegExp(PLACEHOLDER_SYMBOL, 'g');
			this._sLastChangeValue = null;

			var oIcon = this.addEndIcon({
				id: this.getId() + "-icon",
				src: this.getIconSrc(),
				noTabStop: true,
				decorative: !Device.support.touch || Device.system.desktop ? true : false,
				useIconTooltip: false,
				alt: this._oResourceBundle.getText("OPEN_PICKER_TEXT")
			});

			// indicates whether the clock picker is still open
			this._bShouldClosePicker = false;

			// indicates whether the numeric picker is still open
			this._bShouldCloseNumericPicker = false;

			oIcon.addEventDelegate({
				onmousedown: function (oEvent) {
					// as the popup closes automatically on blur - we need to remember its state
					this._bShouldClosePicker = this.isOpen();
				}
			}, this);

			oIcon.attachPress(function () {
				this.toggleOpen(this._bShouldClosePicker);
			}, this);

			this._sMinutes = "00"; //needed for the support2400 scenario to store the minutes when changing hour to 24 and back
			this._sSeconds = "00"; //needed for the support2400 scenario to store the seconds when changing hour to 24 and back
		};

		/**
		 * Before rendering.
		 *
		 * @private
		 */
		 TimePicker.prototype.onBeforeRendering = function() {
			DateTimeField.prototype.onBeforeRendering.apply(this, arguments);

			var oValueHelpIcon = this._getValueHelpIcon();

			if (oValueHelpIcon) {
				oValueHelpIcon.setProperty("visible", this.getEditable());
			}
		};

		/**
		 * Called from parent if the control is destroyed.
		 *
		 * @private
		 */
		TimePicker.prototype.exit = function () {
			if (this._oTimeSemanticMaskHelper) {
				this._oTimeSemanticMaskHelper.destroy();
			}

			MaskEnabler.exit.apply(this, arguments);

			this._removePickerEvents();

			this._oResourceBundle = null;
			this._bValid = false;
			this._sUsedDisplayPattern = null;
			this._oDisplayFormat = null;
			this._oPopoverKeydownEventDelegate = null;
			this._sUsedValuePattern = null;
			this._sValueFormat = null;
			this._sLastChangeValue = null;
		};

		/**
		 * Returns the icon source.
		 *
		 * @private
		 * @returns {string} the URI of the icon
		 */
		 TimePicker.prototype.getIconSrc = function () {
			return IconPool.getIconURI("time-entry-request");
		};

		/**
		 * Returns whether the clock picker is open or not.
		 *
		 * @private
		 * @returns {boolean} true if the clock picker is open.
		 */
		 TimePicker.prototype.isOpen = function () {
			return this._getPicker() && this._getPicker().isOpen();
		};

		/**
		 * Toggle (open/close) the clock picker.
		 *
		 * @param {boolean} bOpen Whether the clock popover is open or not
		 * @private
		 */
		 TimePicker.prototype.toggleOpen = function (bOpen) {

			if (this.getEditable() && this.getEnabled()) {
				this[bOpen ? "_closePicker" : "_openPicker"]();
			}
		};

		/**
		 * Returns whether the numeric picker is open or not.
		 *
		 * @private
		 * @returns {boolean} true if the numeric popover is open.
		 */
		 TimePicker.prototype.isNumericOpen = function () {
			return this._getNumericPicker() && this._getNumericPicker().isOpen();
		};

		/**
		 * Toggle (open/close) the numeric picker.
		 *
		 * @param {boolean} bOpen Whether the clock popover is open or not
		 * @private
		 */
		 TimePicker.prototype.toggleNumericOpen = function (bOpen) {
			if (this.getEditable() && this.getEnabled()) {
				this[bOpen ? "_closeNumericPicker" : "_openNumericPicker"]();
				this._openByFocusIn = false;
				this._openByClick = false;
			}
		};

		/**
		 * Handles the focusin event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onfocusin = function (oEvent) {
			var oPicker = this._getPicker(),
				bIconClicked = this._isIconClicked(oEvent),
				oNumericPicker = this._getNumericPicker(),
				bOpen = oNumericPicker && oNumericPicker.isOpen();

			if (!this._isMobileDevice()) {
				DateTimeField.prototype.onfocusin.apply(this, arguments);
				MaskEnabler.onfocusin.apply(this, arguments);
			}
			if (oPicker && oPicker.isOpen() && !bIconClicked) {
				this._closePicker();
				return;
			}
			if (this._openByClick) {
				this._openByClick = false;
				return;
			}
			if (!this._isMobileDevice()) {
				return;
			}
			if (!bIconClicked) {
				this.toggleNumericOpen(bOpen);
			}
			this._openByFocusIn = true;
		};

		/**
		 * Onclick handler assures opening/closing of the numeric picker.
		 *
		 * @private
		 */
		 TimePicker.prototype.onclick = function (oEvent) {
			var bIconClicked = this._isIconClicked(oEvent),
				oPicker = this._getNumericPicker(),
				bOpen = oPicker && oPicker.isOpen();

			if (this._openByFocusIn) {
				this._openByFocusIn = false;
				return;
			}
			if (!this._isMobileDevice()) {
				return;
			}
			if (!bIconClicked) {
				this.toggleNumericOpen(bOpen);
			}
			this._openByClick = true;
		};

		/**
		 * Onmouseup handler assures moving of the cursor at the beginning of the input field
		 * if there is mask set and there is no entry in the input field.
		 *
		 * @private
		 */
		TimePicker.prototype.onmouseup = function() {
			if (this._isMaskEnabled() && this._isValueEmpty()) {
				this._setCursorPosition(0);
			}
		};

		/**
		 * Returns whether the icon for opening the clock picker is clicked or not.
		 *
		 * @private
		 * @returns {boolean} true if the icon is clicked.
		 */
		 TimePicker.prototype._isIconClicked = function (oEvent) {
			return jQuery(oEvent.target).hasClass("sapUiIcon") || jQuery(oEvent.target).hasClass("sapMInputBaseIconContainer")
				 || jQuery(oEvent.target).hasClass("sapUiIconTitle");
		};

		/**
		 * Called before the clock picker appears.
		 *
		 * @override
		 * @public
		 */
		TimePicker.prototype.onBeforeOpen = function() {
			/* Set the timevalues of the picker here to prevent user from seeing it */
			var oClocks = this._getClocks(),
				oDateValue = this.getDateValue(),
				sFormat = this._getFormatter(true).oFormatOptions.pattern,
				iIndexOfHH = sFormat.indexOf("HH"),
				iIndexOfH = sFormat.indexOf("H"),
				sInputValue = TimePickerInternals._isHoursValue24(this._$input.val(), iIndexOfHH, iIndexOfH) ?
					TimePickerInternals._replace24HoursWithZero(this._$input.val(), iIndexOfHH, iIndexOfH) : this._$input.val();

			var oCurrentDateValue = this._getFormatter(true).parse(sInputValue) || oDateValue;
			if (oCurrentDateValue) {
				var sDisplayFormattedValue = this._getFormatter(true).format(oCurrentDateValue);
				oClocks.setValue(sDisplayFormattedValue);
			}

			if (this._shouldSetInitialFocusedDateValue()) {
				oDateValue = this.getInitialFocusedDateValue() || oDateValue;
			}

			oClocks._setTimeValues(oDateValue, TimePickerInternals._isHoursValue24(this._$input.val(), iIndexOfHH, iIndexOfH));

			/* Mark input as active */
			this.$().addClass(InputBase.ICON_PRESSED_CSS_CLASS);
		};

		/**
		 * Called after the clock picker appears.
		 *
		 * @override
		 * @public
		 */
		TimePicker.prototype.onAfterOpen = function() {
			var oClocks = this._getClocks();

			if (oClocks) {
				oClocks.showFirstClock();
				oClocks._focusActiveButton();
			}
			this.fireAfterValueHelpOpen();
		};

		/**
		 * Called after the clock picker closes.
		 *
		 * @override
		 * @public
		 */
		 TimePicker.prototype.onAfterClose = function() {
			this.$().removeClass(InputBase.ICON_PRESSED_CSS_CLASS);
			this._getClocks().showFirstClock(); // prepare for the next opening
			this.fireAfterValueHelpClose();
		};

		/**
		 * Returns whether the device is mobile or not.
		 *
		 * @private
		 * @returns {boolean} true if the device is mobile.
		 */
		 TimePicker.prototype._isMobileDevice = function() {
			return !Device.system.desktop && (Device.system.phone || Device.system.tablet);
		};

		/**
		 * Called before the numeric picker appears.
		 *
		 * @private
		 */
		 TimePicker.prototype.onBeforeNumericOpen = function() {
			/* Set the timevalues of the picker here to prevent user from seeing it */
			var oInputs = this._getInputs(),
				oDateValue = this.getDateValue(),
				sInputValue = this._$input.val(),
				sFormat = this._getFormatter(true).oFormatOptions.pattern,
				iIndexOfHH = sFormat.indexOf("HH"),
				iIndexOfH = sFormat.indexOf("H");

			var oCurrentDateValue = this._getFormatter(true).parse(sInputValue) || oDateValue;
			var sDisplayFormattedValue = this._getFormatter(true).format(oCurrentDateValue);

			oInputs.setValue(sDisplayFormattedValue);

			if (this._shouldSetInitialFocusedDateValue()) {
				oDateValue = this.getInitialFocusedDateValue();
			}

			oInputs._setTimeValues(oDateValue, TimePickerInternals._isHoursValue24(sDisplayFormattedValue, iIndexOfHH, iIndexOfH));
		};

		/**
		 * Returns Value help icon.
		 *
		 * @private
		 * @returns {sap.ui.core.Icon} the icon on the right side of the Input.
		 */
		 TimePicker.prototype._getValueHelpIcon = function () {
			var oValueHelpIcon = this.getAggregation("_endIcon");

			return oValueHelpIcon && oValueHelpIcon[0];
		};

		/**
		 * Handles input's change event by synchronizing <code>value</code>,
		 * and <code>dateValue</code> properties with the input field.
		 *
		 * @param {string} sValue The string value to be synchronized with, if the input value is used
		 * @private
		 * @returns {boolean} true if <code>change</code> event was called, false otherwise.
		 */
		TimePicker.prototype._handleInputChange = function (sValue) {
			var oDate,
				sThatValue,
				bThatValue2400,
				bEnabled2400,
				sFormat = this.getValueFormat() || (this._sValueFormat && this._sValueFormat.oFormatOptions.pattern),
				iIndexOfHH,
				iIndexOfH;

			sFormat = sFormat ? sFormat : "";
			iIndexOfHH = sFormat.indexOf("HH");
			iIndexOfH = sFormat.indexOf("H");

			sValue = sValue || this._$input.val();
			sThatValue = sValue;
			bThatValue2400 = TimePickerInternals._isHoursValue24(sThatValue, iIndexOfHH, iIndexOfH);
			bEnabled2400 = this.getSupport2400() && bThatValue2400;
			this._bValid = true;
			if (sValue !== "") {
				//keep the oDate not changed by the 24 hrs
				oDate = this._parseValue(bThatValue2400 ? TimePickerInternals._replace24HoursWithZero(sValue, iIndexOfHH, iIndexOfH) : sValue, true);
				if (bEnabled2400) {
					// ih the hour is 24, the control "zeroes" the minutes and seconds, but not in this date object
					oDate.setMinutes(0, 0);
				}
				if (!oDate) {
					this._bValid = false;
				} else {
					// check if Formatter changed the value (it corrects some wrong inputs or known patterns)
					sValue = this._formatValue(oDate);
					// reset the mask as the value might be changed without firing focus out event,
					// which is unexpected behavior in regards to the MaskEnabler temporary value storage
					if (this.getMaskMode() && this.getMask()) {
						this._setupMaskVariables();
					}
				}
			}
			sThatValue = bEnabled2400 ? "24:" + sValue.replace(/[0-9]/g, "0").slice(0, -3) : sValue;
			//instead on key stroke zeroes could be added after entering '24'
			this.updateDomValue(sThatValue);

			if (oDate) {
				// get the value in valueFormat
				sThatValue = sValue = this._formatValue(oDate, true);
				if (bEnabled2400 && oDate && oDate.getHours() === 0) {
					// put back 24 as hour if needed
					sThatValue = sValue = TimePickerInternals._replaceZeroHoursWith24(sValue, iIndexOfHH, iIndexOfH);
				}
			}

			this.setProperty("value", sThatValue, true); // no rerendering
			this.setLastValue(sValue);
			if (this._bValid) {
				this.setProperty("dateValue", oDate, true); // no rerendering
			}

			this.fireChangeEvent(sThatValue, {valid: this._bValid});

			return true;
		};

		/**
		 * Handles the input change event.
		 *
		 * @override
		 * @param {jQuery.Event} oEvent Event object
		 * @returns {boolean} true if <code>change</code> event was called, false otherwise.
		 */
		TimePicker.prototype.onChange = function(oEvent) {
			// don't call InputBase onChange because this calls setValue what would trigger a new formatting

			var sValueParam = oEvent ? oEvent.value : null;

			// check the control is editable or not
			if (this.getEditable() && this.getEnabled()) {
				return this._handleInputChange(sValueParam);
			}
			return false;
		};

		/**
		 * Sets the minutes step of clocks and inputs.
		 *
		 * @param {int} step The step used to generate values for the minutes clock/input
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		TimePicker.prototype.setMinutesStep = function(step) {
			var oClocks = this._getClocks(),
				oInputs = this._getInputs();

			step = Math.max(DEFAULT_STEP, step || DEFAULT_STEP);

			if (oClocks) {
				oClocks.setMinutesStep(step);
			}
			if (oInputs) {
				oInputs.setMinutesStep(step);
			}
			return this.setProperty("minutesStep", step, true);
		};

		/**
		 * Sets the seconds step of clocks and inputs.
		 *
		 * @param {int} step The step used to generate values for the seconds clock/input
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		TimePicker.prototype.setSecondsStep = function(step) {
			var oClocks = this._getClocks(),
				oInputs = this._getInputs();

			step = Math.max(DEFAULT_STEP, step || DEFAULT_STEP);

			if (oClocks) {
				oClocks.setSecondsStep(step);
			}
			if (oInputs) {
				oInputs.setSecondsStep(step);
			}
			return this.setProperty("secondsStep", step, true);
		};

		/**
		 * Sets the title label inside the picker.
		 *
		 * @param {string} title A title
		 * @returns {this} Reference to <code>this</code> for method chaining
		 */
		TimePicker.prototype.setTitle = function(title) {
			var oClocks = this._getClocks();

			if (oClocks) {
				oClocks.setLabelText(title);
			}

			this.setProperty("title", title, true);

			return this;
		};

		/**
		 * Handles data validation.
		 *
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance
		 * @private
		 */
		 TimePicker.prototype._handleDateValidation = function (oDate) {

			if (!oDate) {
				this._bValid = false;
				Log.warning("Value can not be converted to a valid date", this);
			} else {
				this._bValid = true;
				this.setProperty("dateValue", oDate, true); // no rerendering

				var sValue = this._formatValue(oDate);

				if (this.isActive()) {
					this.updateDomValue(sValue);
				} else {
					this.setProperty("value", sValue, true); // no rerendering
					this.setLastValue(sValue);
					this._sLastChangeValue = sValue;
				}
			}
		};

		/**
		 * Sets <code>support2400</code> of the control.
		 *
		 * Allows the control to use 24-hour format.
		 * Recommended usage is to not use it with am/pm format.
		 *
		 * @param {boolean} bSupport2400
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		TimePicker.prototype.setSupport2400 = function (bSupport2400) {
			var oClocks = this._getClocks(),
				oInputs = this._getInputs();

			this.setProperty("support2400", bSupport2400, true); // no rerendering

			if (oClocks) {
				oClocks.setSupport2400(bSupport2400);
			}
			if (oInputs) {
				oInputs.setSupport2400(bSupport2400);
			}

			this._initMask();
			return this;
		};

		/**
		 * Sets the display format.
		 *
		 * @param {string} sDisplayFormat display format to set
		 * @public
		 * @returns {this} Reference to <code>this</code> for method chaining
		 */
		 TimePicker.prototype.setDisplayFormat = function (sDisplayFormat) {
			var oClocks = this._getClocks(),
				oInputs = this._getInputs();

			this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering

			this._initMask();

			if (oClocks) {
				oClocks.setValueFormat(sDisplayFormat);
				oClocks.setDisplayFormat(sDisplayFormat);
			}

			if (oInputs) {
				oInputs.setValueFormat(sDisplayFormat);
				oInputs.setDisplayFormat(sDisplayFormat);
			}

			var oDateValue = this.getDateValue();

			if (!oDateValue) {
				return this;
			}

			var sOutputValue = this._formatValue(oDateValue);
			this.updateDomValue(sOutputValue);
			this.setLastValue(sOutputValue);

			return this;
		};

		/**
		 * Sets the current <code>value</code> of the control.
		 *
		 * Sets to whatever string was given if it cannot be parsed based on the
		 * current <code>valueFormat</code>. Recommended usage is when <code>dateValue</code>
		 * is not set as they are mutually exclusive.
		 *
		 * @override
		 * @param {string} sValue New value
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		TimePicker.prototype.setValue = function(sValue) {
			if (sValue) {
				this._getFormatter(); // initialise DateFormatter
			}

			var oDate,
				sOutputValue,
				sFormat = this.getValueFormat() || (this._sValueFormat && this._sValueFormat.oFormatOptions.pattern),
				oClocks = this._getClocks(),
				oInputs = this._getInputs(),
				iIndexOfHH,
				iIndexOfH,
				bEmpty = false;

			sFormat = sFormat ? sFormat : "";
			iIndexOfHH = sFormat.indexOf("HH");
			iIndexOfH = sFormat.indexOf("H");

			sValue = this.validateProperty("value", sValue);

			this._initMask();

			// set last change value only if the new value is different than current one
			if (this.getValue() !== sValue) {
				this._sLastChangeValue = sValue;
			}

			if (this.getDomRef() && !this._getInputValue()) {
				bEmpty = true;
			}

			MaskEnabler.setValue.call(this, sValue);

			// Make sure that the input element is empty in case it was empty before calling the setter,
			// in order to enable the input field value selection, which is part of the prefered user interaction restricted API.
			// Later on the updateDomValue method will fill the input field element properly
			if (this.getDomRef() && this._bPreferUserInteraction && bEmpty) {
				this.getFocusDomRef().value = "";
			}

			// We need to reset the mask temporary value when using a setter
			// as the given value might not formatted according to mask value format
			if (this.getMask()) {
				this._setupMaskVariables();
			}

			this._bValid = true;

			// convert to date object
			if (sValue) {
				//date object have to be consistent, so if value is 2400, set oDate to 00
				oDate = this._parseValue(TimePickerInternals._isHoursValue24(sValue, iIndexOfHH, iIndexOfH) ?
					TimePickerInternals._replace24HoursWithZero(sValue, iIndexOfHH, iIndexOfH) : sValue);
				if (!oDate) {
					this._bValid = false;
						Log.warning("Value can not be converted to a valid date", this);
					}
				}

			if (this._bValid) {
				this.setProperty("dateValue", oDate, true); // no rerendering
			}

			// convert to output
			if (oDate && !this.getSupport2400()) {
				sOutputValue = this._formatValue(oDate);
			} else {
				sOutputValue = sValue;
			}

			if (oClocks) {
				oClocks.setValue(this._formatValue(oDate));
			}
			if (oInputs) {
				oInputs.setValue(this._formatValue(oDate));
			}

			// do not call InputBase.setValue because the displayed value and the output value might have different pattern
			this.updateDomValue(sOutputValue);
			this.setLastValue(sOutputValue);

			return this;

		};

		/**
		 * Sets the value of the date.
		 *
		 * @public
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
		 * @returns {this} Reference to <code>this</code> for method chaining
		 */
		 TimePicker.prototype.setDateValue = function(oDate) {
			this._initMask();
			return DateTimeField.prototype.setDateValue.apply(this, arguments);
		};

		/**
		 * Sets the locale of the control.
		 *
		 * Used for parsing and formatting the time values in languages different than English.
		 * Necessary for translation and auto-complete of the day periods, such as AM and PM.
		 *
		 * @param {string} sLocaleId A locale identifier like 'en_US'
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		TimePicker.prototype.setLocaleId = function(sLocaleId) {
			var sCurrentValue = this.getValue(),
				oClocks = this._getClocks(),
				oInputs = this._getInputs();

			this.setProperty("localeId", sLocaleId, true);
			this._initMask();

			this._oDisplayFormat = null;
			this._sValueFormat = null;

			if (sCurrentValue) {
				this.setValue(sCurrentValue);
			}

			if (oClocks) {
				oClocks.setLocaleId(sLocaleId);
			}
			if (oInputs) {
				oInputs.setLocaleId(sLocaleId);
			}

			return this;
		};

			TimePicker.prototype.setShowCurrentTimeButton = function(bShow) {
			var oClocks = this._getClocks(),
				oNumericPicker = this._getNumericPicker();

			oClocks && oClocks.setShowCurrentTimeButton(bShow);
			oNumericPicker && oNumericPicker.getContent()[0].setShowCurrentTimeButton(bShow);

			return this.setProperty("showCurrentTimeButton", bShow);
		};

		/**
		 * @private
		 * @returns {string} default display format style
		 */
		TimePicker.prototype._getDefaultDisplayStyle = function () {
			return TimeFormatStyles.Medium;
		};

		/**
		 * @private
		 * @returns {string} default value format style
		 */
		 TimePicker.prototype._getDefaultValueStyle = function () {
			return TimeFormatStyles.Medium;
		};

		/**
		 * if the user has set localeId, create Locale from it, if not get the locate from the FormatSettings.
		 *
		 * @private
		 * @returns {sap.ui.core.Locale} the locale instance
		 */
		TimePicker.prototype._getLocale = function () {
			var sLocaleId = this.getLocaleId();

			return sLocaleId ? new Locale(sLocaleId) : new Locale(Formatting.getLanguageTag());
		};

		/**
		 * @private
		 * @returns {object} the instance of the formatter
		 */
		 TimePicker.prototype._getFormatterInstance = function(oFormat, sPattern, bRelative, sCalendarType, bDisplayFormat) {
			var oLocale  = this._getLocale();

			if (sPattern === TimeFormatStyles.Short || sPattern === TimeFormatStyles.Medium || sPattern === TimeFormatStyles.Long) {
				oFormat = DateFormat.getTimeInstance({style: sPattern, strictParsing: true, relative: bRelative}, oLocale);
			} else {
				oFormat = DateFormat.getTimeInstance({pattern: sPattern, strictParsing: true, relative: bRelative}, oLocale);
			}

			if (bDisplayFormat) {
				this._sUsedDisplayPattern = sPattern;
				this._oDisplayFormat = oFormat;
			} else {
				this._sUsedValuePattern = sPattern;
				this._sValueFormat = oFormat;
			}

			return oFormat;
		};

		/**
		 * Obtains time pattern.
		 *
		 * @returns {*} the time pattern
		 * @private
		 */
		TimePicker.prototype._getFormat = function () {
			var sFormat = this._getDisplayFormatPattern();

			if (!sFormat) {
				sFormat = TimeFormatStyles.Medium;
			}

			if (Object.keys(TimeFormatStyles).indexOf(sFormat) !== -1) {
				sFormat = getDefaultDisplayFormat();
			}
			return sFormat;
		};

		/**
		 * Handles the pageup event.
		 *
		 * Increases time by one hour.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onsappageup = function(oEvent) {
			//increase by one hour
			this._increaseTime(1, TimeParts.Hour);

			oEvent.preventDefault(); //do not move cursor
		};

		/**
		 * Handles the shift + pageup and ctrl + shift + pageup events.
		 *
		 * Increases time by one minute or second.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onsappageupmodifiers = function(oEvent) {
			if (!(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift
				// increase by one minute
				this._increaseTime(1, TimeParts.Minute);
			}

			if (!oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift
				// increase by one second
				this._increaseTime(1, TimeParts.Second);
			}

			oEvent.preventDefault(); // do not move cursor
		};

		/**
		 * Handles the pagedown event.
		 *
		 * Decreases time by one hour.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onsappagedown = function(oEvent) {
			//decrease by one hour
			this._increaseTime(-1, TimeParts.Hour);

			oEvent.preventDefault(); // do not move cursor
		};

		/**
		 * Handle when escape is pressed. Escaping unsaved input will restore
		 * the last valid value. If the value cannot be parsed into a date,
		 * the input will be cleared.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		TimePicker.prototype.onsapescape = function(oEvent) {
			var oLastDate = this._parseValue(this.getLastValue(), true),
				oInputDate = this._parseValue(this._getInputValue(), true),
				sDisplayFormatLastDate = this._formatValue(oLastDate, false),
				sDisplayFormatInputDate = this._formatValue(oInputDate, false),
				sInputValue = this.getMaskMode() === "Off" ? this._getInputValue() : sDisplayFormatInputDate;

			if (sInputValue !== sDisplayFormatLastDate) {
				oEvent.setMarked();
				oEvent.preventDefault();

				this.updateDomValue(sDisplayFormatLastDate);
				this.onValueRevertedByEscape(sDisplayFormatLastDate, sDisplayFormatInputDate);
			}
			this._bCheckForLiveChange = true;
		};

		/**
		 * Handles the shift + pagedown and ctrl + shift + pagedown events.
		 *
		 * Decreases time by one minute or second.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePicker.prototype.onsappagedownmodifiers = function(oEvent) {
			if (!(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift
				// decrease by one minute
				this._increaseTime(-1, TimeParts.Minute);
			}

			if (!oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift
				// decrease by one second
				this._increaseTime(-1, TimeParts.Second);
			}

			oEvent.preventDefault(); // do not move cursor
		};

		/**
		 * Handles the keydown event.
		 *
		 * Opens or closes the picker if specific key combinations are pressed.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePicker.prototype.onkeydown = function(oEvent) {
			var oKC = KeyCodes,
				iKC = oEvent.which || oEvent.keyCode,
				bAlt = oEvent.altKey,
				bPickerOpened;

			// Popover should be opened when F4, ALT+UP or ALT+DOWN is pressed
			if (iKC === oKC.F4 || (bAlt && (iKC === oKC.ARROW_UP || iKC === oKC.ARROW_DOWN))) {
				bPickerOpened = this._getPicker() && this._getPicker().isOpen();

				if (!bPickerOpened) {
					this._openPicker();
				} else {
					this._closePicker();
				}

				oEvent.preventDefault(); //ie expands the address bar on F4
			} else if (!this._isMobileDevice()) {
				if (iKC !== oKC.ESCAPE) {
					MaskEnabler.onkeydown.call(this, oEvent);
				}
			} else {
				if (iKC === KeyCodes.ENTER || iKC === KeyCodes.SPACE) {
					this._openNumericPicker();
				}
			}
		};

		/**
		 * Gets the picker aggregation.
		 *
		 * @returns {sap.m.ResponsivePopover|undefined} The picker aggregation
		 * @private
		 */
		 TimePicker.prototype._getPicker = function() {
			return this.getAggregation("_picker");
		};

		/**
		 * Gets the numeric picker aggregation.
		 *
		 * @returns {sap.m.Popover|undefined} The picker aggregation
		 * @private
		 */
		 TimePicker.prototype._getNumericPicker = function() {
			return this.getAggregation("_numPicker");
		};

		/**
		 * Detaches the picker from the keyboard events.
		 *
		 * @private
		 */
		TimePicker.prototype._removePickerEvents = function() {
			var oPopover,
				oPicker = this._getPicker();

			if (oPicker) {
				oPopover = oPicker.getAggregation("_popup");
				if (typeof this._oPopoverKeydownEventDelegate === 'function') {
					oPopover.removeEventDelegate(this._oPopoverKeydownEventDelegate);
				}
			}
		};

		/**
		 * Opens the picker popover. The popover is positioned relatively to the control given as <code>oDomRef</code> parameter on tablet or desktop
		 * and is full screen on phone. Therefore the control parameter is only used on tablet or desktop and is ignored on phone.
		 *
		 * Note: use this method to open the picker popover only when the <code>hideInput</code> property is set to <code>true</code>. Please consider
		 * opening of the picker popover by another control only in scenarios that comply with Fiori guidelines. For example, opening the picker popover
		 * by another popover is not recommended.
		 * The application developer should implement the following accessibility attributes to the opening control: a text or tooltip that describes
		 * the action (example: "Open Time Picker"), and aria-haspopup attribute with value of <code>sap.ui.core.aria.HasPopup.Dialog</code>.
		 *
		 * @since 1.97
		 * @param {HTMLElement} oDomRef DOM reference of the opening control. On tablet or desktop, the popover is positioned relatively to this control.
		 * @public
		 */
		TimePicker.prototype.openBy = function(oDomRef) {
			this._openPicker(oDomRef);
		};

		/**
		 * Opens the picker.
		 *
		 * Creates the picker if necessary.
		 *
		 * @param {HTMLElement} oDomRef DOM reference of the opening control. On tablet or desktop, the TimePicker popover is positioned relative to this control.
		 * @returns {sap.m.ResponsivePopover} The picker part as a control, used for chaining
		 * @private
		 */
		TimePicker.prototype._openPicker = function (oDomRef) {
			var oPicker = this._getPicker();

			if (!oPicker) {
				oPicker = this._createPicker(this._getDisplayFormatPattern());
			}

			if (!oDomRef) {
				oDomRef = this.getDomRef();
			}

			oPicker.openBy(oDomRef);
			oPicker.getContent()[0]._sMinutes = this._sMinutes;
			oPicker.getContent()[0]._sSeconds = this._sSeconds;

			return oPicker;
		};

		/**
		 * Closes the TimePicker popover.
		 *
		 * @returns {sap.m.ResponsivePopover|undefined} The picker part as a control, used for chaining
		 * @private
		 */
		TimePicker.prototype._closePicker = function () {
			var oPicker = this._getPicker();

			if (oPicker) {
				this._sMinutes = oPicker.getContent()[0]._sMinutes;
				this._sSeconds = oPicker.getContent()[0]._sSeconds;
				oPicker.close();
			} else {
				Log.warning("There is no picker to close.");
			}

			return oPicker;
		};

		/**
		 * Opens the numeric picker.
		 *
		 * Creates the picker if necessary.
		 *
		 * @returns {sap.m.Popover} The picker part as a control, used for chaining
		 * @private
		 */
		 TimePicker.prototype._openNumericPicker = function () {
			var oPicker = this._getNumericPicker();

			if (!oPicker) {
				oPicker = this._createNumericPicker(this._getDisplayFormatPattern());
			}

			oPicker.open();
			oPicker.getContent()[0]._sMinutes = this._sMinutes;
			oPicker.getContent()[0]._sSeconds = this._sSeconds;

			return oPicker;
		};

		/**
		  Closes the numeric popover.
		 *
		 * @returns {sap.m.Popover|undefined} The picker part as a control, used for chaining
		 * @private
		 */
		TimePicker.prototype._closeNumericPicker = function () {
			var oPicker = this._getNumericPicker();

			if (oPicker) {
				this._sMinutes = oPicker.getContent()[0]._sMinutes;
				this._sSeconds = oPicker.getContent()[0]._sSeconds;
				oPicker.close();
				this.getDomRef("inner").select();
			} else {
				Log.warning("There is no picker to close.");
			}

			return oPicker;
		};

		/**
		 * Creates the picker.
		 *
		 * Uses {@link sap.m.ResponsivePopover} control for a picker.
		 *
		 * @param {string} sFormat Time format used for creating the clocks inside the picker
		 * @returns {sap.m.TimePicker} the sap.m.TimePicker
		 * @private
		 */
		TimePicker.prototype._createPicker = function(sFormat) {
			var that = this,
				oPopover,
				oPicker,
				oClocks,
				oResourceBundle,
				sOKButtonText,
				sCancelButtonText,
				sTitle,
				oIcon = this.getAggregation("_endIcon")[0],
				sLocaleId  = this._getLocale().getLanguage(),
				sArialabelledby,
				sLabelId,
				sLabel;

			oResourceBundle = Library.getResourceBundleFor("sap.m");
			sOKButtonText = oResourceBundle.getText("TIMEPICKER_SET");
			sCancelButtonText = oResourceBundle.getText("TIMEPICKER_CANCEL");
			sTitle = this._oResourceBundle.getText("TIMEPICKER_SET_TIME");

			oClocks = new TimePickerClocks(this.getId() + "-clocks", {
				support2400: this.getSupport2400(),
				displayFormat: sFormat,
				valueFormat: sFormat,
				localeId: sLocaleId,
				minutesStep: this.getMinutesStep(),
				secondsStep: this.getSecondsStep(),
				showCurrentTimeButton: this.getShowCurrentTimeButton()
			});
			oClocks._setAcceptCallback(this._handleOkPress.bind(this));

			var oHeader = this._getValueStateHeader();
			oPicker = new ResponsivePopover(that.getId() + "-RP", {
				showCloseButton: false,
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: true,
				title: sTitle,
				placement: PlacementType.VerticalPreferredBottom,
				contentWidth: "20rem",
				beginButton: new Button(this.getId() + "-OK", {
					text: sOKButtonText,
					type: ButtonType.Emphasized,
					press: this._handleOkPress.bind(this)
				}),
				endButton: new Button(this.getId() + "-Cancel", {
					text: sCancelButtonText,
					press: this._handleCancelPress.bind(this)
				}),
				content: [
					oHeader,
					oClocks
				],
				ariaLabelledBy: InvisibleText.getStaticId("sap.m", "TIMEPICKER_SET_TIME"),
				beforeOpen: this.onBeforeOpen.bind(this),
				afterOpen: this.onAfterOpen.bind(this),
				afterClose: this.onAfterClose.bind(this)
			});
			oHeader.setPopup(oPicker._oControl);

			oPopover = oPicker.getAggregation("_popup");
			// hide arrow in case of popover as dialog does not have an arrow
			if (oPopover.setShowArrow) {
				oPopover.setShowArrow(false);
			}

			oPopover.oPopup.setExtraContent([oIcon]);

			if (Device.system.phone) {
				sArialabelledby = this.$("inner").attr("aria-labelledby");
				sLabelId = sArialabelledby && sArialabelledby.split(" ")[0];
				sLabel = sLabelId ? document.getElementById(sLabelId).textContent : "";

				if (sLabel) {
					oPicker.setTitle(sLabel);
				}
				oPicker.setShowHeader(true);
			} else {
				this._oPopoverKeydownEventDelegate = {
					onkeydown: function(oEvent) {
						var oKC = KeyCodes,
							iKC = oEvent.which || oEvent.keyCode,
							bAlt = oEvent.altKey;

						// Popover should be closed when ESCAPE key or ATL+F4 is pressed
						if ((bAlt && (iKC === oKC.ARROW_UP || iKC === oKC.ARROW_DOWN)) || iKC === oKC.F4) {
							this._handleOkPress(oEvent);
							//focus the input
							this.focus();
							oEvent.preventDefault();
						}
					}
				};

				oPopover.addEventDelegate(this._oPopoverKeydownEventDelegate, this);
			}

			oPicker.addStyleClass(this.getRenderer().CSS_CLASS + "DropDown");
			oPicker.open = function() {
				return this.openBy(that);
			};

			// define a parent-child relationship between the control's and the _picker pop-up
			this.setAggregation("_picker", oPicker, true);

			return oPicker;
		};

		/**
		 * Creates the numeric picker (opens when click on input on mobile).
		 *
		 * @param {string} sFormat Time format used for creating the clocks inside the picker
		 * @returns {sap.m.TimePicker} the sap.m.TimePicker
		 * @private
		 */
		 TimePicker.prototype._createNumericPicker = function(sFormat) {
			var that = this,
				oPicker,
				oResourceBundle,
				sOKButtonText,
				sCancelButtonText,
				sLocaleId = this._getLocale().getLanguage(),
				oHeader = this._getValueStateHeader();

			oResourceBundle = Library.getResourceBundleFor("sap.m");
			sOKButtonText = oResourceBundle.getText("TIMEPICKER_SET");
			sCancelButtonText = oResourceBundle.getText("TIMEPICKER_CANCEL");

			oPicker = new Popover(that.getId() + "-NP", {
				showArrow: false,
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: false,
				placement: PlacementType.VerticalPreferredBottom,
				customHeader: [
					oHeader
				],
				content: [
					new TimePickerInputs(this.getId() + "-inputs", {
						support2400: this.getSupport2400(),
						displayFormat: sFormat,
						valueFormat: sFormat,
						localeId: sLocaleId,
						minutesStep: this.getMinutesStep(),
						secondsStep: this.getSecondsStep(),
						showCurrentTimeButton: this.getShowCurrentTimeButton()
					})
				],
				footer: [
					new Toolbar({
						content: [
							new ToolbarSpacer(),
							new Button(this.getId() + "-NumericOK", {
								text: sOKButtonText,
								type: ButtonType.Emphasized,
								press: this._handleNumericOkPress.bind(this)
							}),
							new Button(this.getId() + "-NumericCancel", {
								text: sCancelButtonText,
								press: this._handleNumericCancelPress.bind(this)
							})
						]
					})
				],

				ariaLabelledBy: InvisibleText.getStaticId("sap.m", "TIMEPICKER_SET_TIME"),
				beforeOpen: this.onBeforeNumericOpen.bind(this),
				afterOpen: function() {
					this.fireAfterValueHelpOpen();
				}.bind(this),
				afterClose: function() {
					this.fireAfterValueHelpClose();
				}.bind(this)
			});

			oPicker.open = function() {
				return this.openBy(that);
			};

			// define a parent-child relationship between the control's and the _numPicker pop-up
			this.setAggregation("_numPicker", oPicker, true);

			return oPicker;
		};

		/**
		 * Gets <code>TimePickerClocks</code> control attached to this <code>TimePicker</code> instance.
		 *
		 * @private
		 * @returns {sap.m.TimePickerClocks|null} returns the content of the picker (the <code>TimePickerClocks</code> control).
		 */
		 TimePicker.prototype._getClocks = function () {
			var oPicker = this._getPicker();
			if (!oPicker) {
				return null;
			}
			return oPicker.getContent()[1];
		};

		/**
		 * Gets <code>TimePickerInputs</code> control attached to this <code>TimePicker</code> instance.
		 *
		 * @private
		 * @returns {sap.m.TimePickerInputs|null} returns the content of the numeric picker (the <code>TimePickerInputs</code> control).
		 */
		 TimePicker.prototype._getInputs = function () {
			var oPicker = this._getNumericPicker();
			if (!oPicker) {
				return null;
			}
			return oPicker.getContent()[0];
		};

		/**
		 * Handles the press event of the OK button.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TimePicker.prototype._handleOkPress = function(oEvent) {
			var oDate = this._getClocks().getTimeValues(),
				sValue;

			this._isClockPicker = true;
			this._isNumericPicker = false;
			sValue = this._formatValue(oDate);

			this.updateDomValue(sValue);
			this._handleInputChange();

			this._closePicker();
		};

		/**
		 * Handles the press event of the Cancel button.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePicker.prototype._handleCancelPress = function(oEvent) {
			this._closePicker();
		};

		/**
		 * Handles the press event of the OK button of numeric popover.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		 TimePicker.prototype._handleNumericOkPress = function(oEvent) {
			var oDate = this._getInputs().getTimeValues(),
				sValue;

			this._isClockPicker = false;
			this._isNumericPicker = true;
			sValue = this._formatValue(oDate);

			this.updateDomValue(sValue);
			this._handleInputChange();

			this.getDomRef("inner").select();
			this._closeNumericPicker();
		};

		/**
		 * Handles the press event of the Cancel button of numeric popover.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePicker.prototype._handleNumericCancelPress = function(oEvent) {
			this._closeNumericPicker();
		};

		/**
		 * @private
		 */
		 TimePicker.prototype._getLocaleBasedPattern = function (sPlaceholder) {
			return LocaleData.getInstance(
				new Locale(Formatting.getLanguageTag())
			).getTimePattern(sPlaceholder);
		};

		/**
		 * Parses a given string to a date object, based on either the <code>displayFormat</code>
		 * or the <code>valueFormat</code>.
		 *
		 * @param {string} sValue Value to be parsed
		 * @param {boolean} bDisplayFormat Defines whether the string being parsed is in <code>displayFormat</code> or in <code>valueFormat</code>
		 * @returns {Object} A date object
		 * @private
		 */
		TimePicker.prototype._parseValue = function(sValue, bDisplayFormat) {
			//because of the leading space in formats without a leading zero
			if (bDisplayFormat) {
				sValue = this._oTimeSemanticMaskHelper.stripValueOfLeadingSpaces(sValue);
				//if the user input is not full and there are placeholder symbols left, they need to be removed in order
				//the value to be parsed to a valid fallback format
				sValue = sValue.replace(this._rPlaceholderRegEx,'');
			}

			// convert to date object
			return DateTimeField.prototype._parseValue.call(this, sValue, bDisplayFormat);
		};

		/**
		 * Converts the time to the output format.
		 *
		 * If bValueFormat is set, it converts it to the <code>valueFormat</code>.
		 *
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
		 * @param {boolean} bValueFormat Defines whether the result is in <code>valueFormat</code> or <code>displayFormat</code>
		 * @returns {string} Formatted value
		 * @private
		 */
		TimePicker.prototype._formatValue = function(oDate, bValueFormat) {
			var sValue = DateTimeField.prototype._formatValue.apply(this, arguments),
				sFormat = this.getValueFormat() || (this._sValueFormat && this._sValueFormat.oFormatOptions.pattern),
				iIndexOfHH,
				iIndexOfH,
				bFieldValueIs24;

			sFormat = sFormat ? sFormat : "";
			iIndexOfHH = sFormat.indexOf("HH");
			iIndexOfH = sFormat.indexOf("H");

			if (oDate) {
				// in display format the formatter returns strings without the leading space
				// that we use in the mask - "9:15" instead of " 9:15"
				// that's because the mask is fixed length

				// this._oTimeSemanticMaskHelper will always exist if we have displayformat and localeId set
				// and they both have default values, but check just in case
				if (!bValueFormat && this._oTimeSemanticMaskHelper) {
					sValue = this._oTimeSemanticMaskHelper.formatValueWithLeadingTrailingSpaces(sValue);
				}
			}

			if ((this._isNumericPicker && this.isNumericOpen() && this._getInputs() && this._getInputs()._getHoursInput() && this._getInputs()._getHoursInput().getValue() === "24") ||
				(this._isClockPicker && this.isOpen() && this._getClocks() && this._getClocks()._getHoursClock() && this._getClocks()._getHoursClock().getSelectedValue() === 24) ||
				(this._sLastChangeValue && this._sLastChangeValue.indexOf("24") > -1)) {
					bFieldValueIs24 = true;
			}

			//2400 scenario - be sure that the correct value will be set in all cases - when binding,
			//setting the value by clocks or only via setValue
			if (oDate && oDate.getHours() === 0 && this.getSupport2400() && bFieldValueIs24) {
				sValue = TimePickerInternals._replaceZeroHoursWith24(sValue, iIndexOfHH, iIndexOfH);
			}

			return sValue;

		};

		/**
		 * Changes the time value in the input field.
		 *
		 * @param {number} iNumber Number to be added to the existing value
		 * @param {string} sUnit Unit to be changed - minute, hour or second
		 * @private
		 */
		TimePicker.prototype._increaseTime = function(iNumber, sUnit) {
			var oOldDate = this.getDateValue(),
				oDate,
				iMsOffset;

			if (oOldDate && this.getEditable() && this.getEnabled()) {
				// use a new date object to have a real updated property
				oDate = UI5Date.getInstance(oOldDate.getTime());

				switch (sUnit) {
					case TimeParts.Hour:
						oDate.setHours(oDate.getHours() + iNumber);
						iMsOffset = 60 * 60 * 1000;
						break;
					case TimeParts.Minute:
						oDate.setMinutes(oDate.getMinutes() + iNumber);
						iMsOffset = 60 * 1000;
						break;
					case TimeParts.Second:
						iMsOffset = 1000;
						oDate.setSeconds(oDate.getSeconds() + iNumber);
				}

				// forward moving back from daylight saving doesn't introduce any issues
				// (because it will get into cycle), 3:00:00 + 00:00:01 === 3:00:01
				// but decreasing time when moving into daylignt saving has an issue (3:00:00 - 0:00:01 === 3:59:59)
				if (iNumber < 0 && oDate.getTime() - oOldDate.getTime() !== iNumber * iMsOffset) { //hour stays the same
					// so decrease it with the milliseconds offset
					// and let the hours adjust automatically
					oDate = UI5Date.getInstance(oOldDate.getTime() + iNumber * iMsOffset);
				}

				this.setDateValue(oDate);

				this.fireChangeEvent(this.getValue(), {valid: true});
			}
		};

		/**
		 * Sets the mask of the input based on the display format.
		 *
		 * @private
		 */
		TimePicker.prototype._initMask = function() {
			if (this._oTimeSemanticMaskHelper) {
				this._oTimeSemanticMaskHelper.destroy();
			}
			this._oTimeSemanticMaskHelper = new TimeSemanticMaskHelper(this);
		};

		/**
		 * Returns if the mask is enabled. If value is not valid we should set initialFocusedDateValue.
		 *
		 * @returns {boolean} Returns <code>True</code> when the mask can be used.
		 * @private
		 */
		TimePicker.prototype._isMaskEnabled = function () {
			if (this._isMobileDevice() || this.getMaskMode() === TimePickerMaskMode.Off) {
				return false;
			}

			if (this.getMaskMode() === TimePickerMaskMode.Enforce) {
				return true;
			}

			const sTrimmedPattern = this._getDisplayFormatPattern().replace(/hh|mm|ss/gi, "").replace(/a/i, "");

			return !/h|m|s|a|b/gi.test(sTrimmedPattern);
		};

		/**
		 * @private
		 */
		 TimePicker.prototype._shouldSetInitialFocusedDateValue = function () {
			if (!this._isValidValue()) {
				return true;
			}

			return !this.getValue() && !!this.getInitialFocusedDateValue();
		};

		/**
		 * @private
		 */
		TimePicker.prototype._isValidValue = function () {
			return this._bValid;
		};

		/**
		 * Fires the change event for the listeners.
		 *
		 * @protected
		 * @param {string} sValue value of the input.
		 * @param {object} [oParams] extra event parameters.
		 */
		TimePicker.prototype.fireChangeEvent = function(sValue, oParams) {
			if (sValue) {
				sValue = sValue.trim();
			}

			if (sValue !== this._sLastChangeValue) {
				this._sLastChangeValue = sValue;
				DateTimeField.prototype.fireChangeEvent.call(this, sValue, oParams);
			}
		};

		var TimeSemanticMaskHelper = function(oTimePicker) {
			var sDisplayFormat = oTimePicker._getDisplayFormatPattern(),
				sMask,
				sAllowedHourChars,
				oLocale  = oTimePicker._getLocale(),
				i;

			if (oTimePicker._checkStyle(sDisplayFormat)) {
				sMask = LocaleData.getInstance(oLocale).getTimePattern(sDisplayFormat);
			} else {
				sMask = sDisplayFormat
					.replace(/hh/ig, "h")
					.replace(/h(?!')/ig, "h9")
					.replace(/'h(?=')/ig, "'^h"); // add escape caret character for the mask before the hour character surrounded by single quotes
			}

			this._oTimePicker = oTimePicker;
			this.aOriginalAmPmValues = LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");
			this.aAmPmValues = this.aOriginalAmPmValues.slice(0);
			this.iAmPmValueMaxLength = Math.max(this.aAmPmValues[0].length, this.aAmPmValues[1].length);

			for (i = 0; i < this.aAmPmValues.length; i++) {
				while (this.aAmPmValues[i].length < this.iAmPmValueMaxLength) {
					this.aAmPmValues[i] += " ";
				}
			}

			this.b24H = sDisplayFormat.indexOf("H") !== -1;
			this.bLeadingZero = sDisplayFormat.indexOf("HH") !== -1 || sDisplayFormat.indexOf("hh") !== -1;
			this.sLeadingChar = this.bLeadingZero ? "0" : " ";
			this.sAlternativeLeadingChar = this.bLeadingZero ? " " : "0";
			this.sLeadingRegexChar = this.bLeadingZero ? "0" : "\\s";

			oTimePicker.setPlaceholderSymbol(PLACEHOLDER_SYMBOL);

			//set hours allowed chars in the mask
			if (this.b24H) {
				sAllowedHourChars = "[" + this.sLeadingRegexChar + "012]";
			} else {
				sAllowedHourChars = "[" + this.sLeadingRegexChar + "1]";
			}

			this._maskRuleHours = new MaskInputRule({
				maskFormatSymbol: "h",
				regex: sAllowedHourChars
			});
			oTimePicker.addRule(this._maskRuleHours);
			this.iHourNumber1Index = sMask.indexOf("h9");
			this.iHourNumber2Index = this.iHourNumber1Index !== -1 ? this.iHourNumber1Index + 1 : -1;

			//set minutes and seconds allowed chars in the mask
			this.iMinuteNumber1Index = sMask.indexOf("mm");
			this.iSecondNumber1Index = sMask.indexOf("ss");

			sMask = sMask
				.replace(/'mm(?=')/g, "'^mm")
				.replace(/mm(?!')/g, "59")
				.replace(/'ss(?=')/g, "'^ss")
				.replace(/ss(?!')/g, "59")
				.replace(/'/g, ""); // single quotes (like 'ч') are irrelevant for DateFormat, so they are for the mask

			this._maskRuleMinSec = new MaskInputRule({
				maskFormatSymbol: "5",
				regex: "[0-5]"
			});

			oTimePicker.addRule(this._maskRuleMinSec);

			this.aAllowedHours = genValidHourValues.call(this, this.b24H, this.sLeadingChar);
			this.aAllowedMinutesAndSeconds = genValidMinutesAndSecondsValues.call(this);

			this.iAmPmChar1Index = sMask.indexOf("a");
			this.iAfterAmPmValueIndex = -1;

			if (this.iAmPmChar1Index !== -1) {
				this.iAfterAmPmValueIndex = this.iAmPmChar1Index + this.iAmPmValueMaxLength;
				var iCorrectionIndexes = this.iAmPmValueMaxLength - 1;
				this.shiftIndexes(iCorrectionIndexes);

				//We start from capital A. Capital letters are not used to this point, so there should be enough of them
				var currentDefinitionSymbolCharCode = 65;
				var sAmPmRegex = "";
				var currentAllowedChars = "";
				var currentDefinitionSymbol = "";

				for (i = 0; i < this.iAmPmValueMaxLength; i++) {
					currentAllowedChars = "[";

					if (this.aAmPmValues[0][i]) {
						currentAllowedChars += this.aAmPmValues[0][i];
					} else {
						currentAllowedChars += "\\s";
					}

					if (this.aAmPmValues[1][i] !== this.aAmPmValues[0][i]) {
						if (this.aAmPmValues[1][i]) {
							currentAllowedChars += this.aAmPmValues[1][i];
						} else {
							currentAllowedChars += "\\s";
						}
					}

					currentAllowedChars += "]";

					currentDefinitionSymbol = String.fromCharCode(currentDefinitionSymbolCharCode++);
					sAmPmRegex += currentDefinitionSymbol;

					this._maskRuleChars = new MaskInputRule({
						maskFormatSymbol: currentDefinitionSymbol,
						regex: currentAllowedChars
					});
					oTimePicker.addRule(this._maskRuleChars);
				}

				sMask = sMask.replace(/a/g, sAmPmRegex);
			}

			oTimePicker.setMask(sMask);

			function genValues(iStart, iEnd, sLeadingChar) {
				var aResultValues = [],
					sCurrent,
					i;

				for (i = iStart; i <= iEnd; i++) {
					sCurrent = i.toString();
					if (i < 10) {
						sCurrent = sLeadingChar + sCurrent;
					}
					aResultValues.push(sCurrent);
				}

				return aResultValues;
			}

			//not too expensive to generate all values that are valid hour values
			function genValidHourValues(b24H, sLeadingChar) {
				var iStart = b24H ? 0 : 1,
					b2400 = this._oTimePicker.getSupport2400() ? 24 : 23, // if getSupport2400, the user could type 24 in the input
					iEnd = b24H ? b2400 : 12;

				return genValues(iStart, iEnd, sLeadingChar);
			}

			function genValidMinutesAndSecondsValues() {
				return genValues(0, 59, "0");
			}
		};

		TimeSemanticMaskHelper.prototype.replaceChar = function(sChar, iPlacePosition, sCurrentInputValue) {
			var iAmPmInsideValueIndex = iPlacePosition - this.iAmPmChar1Index,
					sCurrentAmPmBeforeValue,
					sAmPreceedingValue,
					sPmPreceedingValue,
					bSameAmAndPmPreceedingValue,
					sAmRemainingValue,
					sPmRemainingValue,
					i;

			// we type the first hour number, but it doesn't match the mask,
			// but it would have if we prefill the leading character
			if (iPlacePosition === this.iHourNumber1Index
					&& this.sAlternativeLeadingChar === sChar) {
				if (this.aAllowedHours.indexOf(this.sLeadingChar + sChar) !== -1) {
					return this.sLeadingChar + sChar;
				} else {
					return this.sLeadingChar;
				}
			} else if (iPlacePosition === this.iHourNumber1Index
					&& !this._oTimePicker._isCharAllowed(sChar, iPlacePosition)
					&& this.aAllowedHours.indexOf(this.sLeadingChar + sChar) !== -1) {
				return this.sLeadingChar + sChar;
			} else if (iPlacePosition === this.iHourNumber2Index && sCurrentInputValue[this.iHourNumber1Index] === PLACEHOLDER_SYMBOL) {
				// fill the first hour number with the leading character,
				// in order to enable setting the second hour number directly
				this._oTimePicker._oTempValue.setCharAt(this.sLeadingChar, this.iHourNumber1Index);
				return sChar;
			} else if (iPlacePosition === this.iHourNumber2Index //the second hour number
					&& this.aAllowedHours.indexOf(sCurrentInputValue[this.iHourNumber1Index] + sChar) === -1) { //allow it only if the whole hour string is a valid hour
				return ""; //which is invalid and won't pass the test
			} else if ((iPlacePosition === this.iMinuteNumber1Index || iPlacePosition === this.iSecondNumber1Index)
					&& !this._oTimePicker._isCharAllowed(sChar, iPlacePosition)
					&& this.aAllowedMinutesAndSeconds.indexOf("0" + sChar) !== -1) { //the 1st minute number
				return "0" + sChar;
			} else if (iAmPmInsideValueIndex >= 0 && iPlacePosition < this.iAfterAmPmValueIndex) {
				sCurrentAmPmBeforeValue = sCurrentInputValue.slice(this.iAmPmChar1Index, iPlacePosition);
				sAmPreceedingValue = this.aAmPmValues[0].slice(0, iAmPmInsideValueIndex);
				sPmPreceedingValue = this.aAmPmValues[1].slice(0, iAmPmInsideValueIndex);
				sAmRemainingValue = this.aAmPmValues[0].slice(iAmPmInsideValueIndex, this.iAfterAmPmValueIndex);
				sPmRemainingValue = this.aAmPmValues[1].slice(iAmPmInsideValueIndex, this.iAfterAmPmValueIndex);
				bSameAmAndPmPreceedingValue = (sAmPreceedingValue === sPmPreceedingValue);
				var sMatchValue = "";

				for (i = iAmPmInsideValueIndex; i < this.iAmPmValueMaxLength; i++) {
					if (this.aAmPmValues[0][i] === this.aAmPmValues[1][i]) {
						sMatchValue += this.aAmPmValues[0][i];
					} else {
						break;
					}
				}

				// we reached the end, so values are all the same to the end
				// OR there is some string that is the same, but to some point
				if (i === this.iAmPmValueMaxLength || i !== iAmPmInsideValueIndex) {
					return sMatchValue;
				} else { //no match at all - there is a different char right at iAmPmInsideValueIndex
					if (!bSameAmAndPmPreceedingValue) {
						if (sCurrentAmPmBeforeValue === sAmPreceedingValue) {
							return sAmRemainingValue;
						} else if (sCurrentAmPmBeforeValue === sPmPreceedingValue) {
							return sPmRemainingValue;
						} else { //there is the case where some invalid partial value stands in the beginning of the ampm string
							return sChar;
						}
					} else {
						if (this.aAmPmValues[0][iAmPmInsideValueIndex].toLowerCase() === sChar.toLowerCase() && this.aAmPmValues[0] === sCurrentAmPmBeforeValue + sAmRemainingValue) { //am value
							return sAmRemainingValue;
						} else if (this.aAmPmValues[1][iAmPmInsideValueIndex].toLowerCase() === sChar.toLowerCase() && this.aAmPmValues[1] === sCurrentAmPmBeforeValue + sPmRemainingValue) { //pm value
							return sPmRemainingValue;
						} else { //cannot decide unless one of the right characters is typed
							return sChar;
						}
					}
				}
			} else {
				return sChar;
			}
		};

		TimeSemanticMaskHelper.prototype.formatValueWithLeadingTrailingSpaces = function(value) {
			var iMaskLength = this._oTimePicker.getMask().length;

			if (this.aOriginalAmPmValues[0] !== this.aAmPmValues[0]) {
				value = value.replace(this.aOriginalAmPmValues[0], this.aAmPmValues[0]);
			}

			if (this.aOriginalAmPmValues[1] !== this.aAmPmValues[1]) {
				value = value.replace(this.aOriginalAmPmValues[1], this.aAmPmValues[1]);
			}

			while (iMaskLength > value.length) {
				//inserts space(s) before the hours position
				value = [value.slice(0, this.iHourNumber1Index), " ", value.slice(this.iHourNumber1Index)].join('');
			}

			return value;
		};

		/**
		 * Removes any whitespaces preceding the hours value (e.g. "<space>1:13:32" -> "1:13:32",
		 * "PM<space>1:13:32" -> "PM1:13:32").
		 *
		 * @param {string} value the value to be stripped
		 * @returns {*} the stripped value
		 */
		TimeSemanticMaskHelper.prototype.stripValueOfLeadingSpaces = function(value) {
			if (value[this.iHourNumber1Index] === " " && this._oTimePicker.getDisplayFormat().indexOf("B") === -1) {
				value = [value.slice(0, this.iHourNumber1Index), value.slice(this.iHourNumber1Index + 1)].join('');
			}
			return value;
		};

		/**
		 * Shifts hours, minutes and seconds indexes if period ("a", see http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)
		 * is before corresponding hours, minutes & seconds fields.
		 *
		 * @param {number} shiftValue the shift value
		 */
		TimeSemanticMaskHelper.prototype.shiftIndexes = function(shiftValue) {
			if (this.iAmPmChar1Index < this.iHourNumber1Index) { //both a and h,hh,H,HH exist in this case
				this.iHourNumber1Index += shiftValue;
				this.iHourNumber2Index += shiftValue;
			}
			if (this.iAmPmChar1Index < this.iMinuteNumber1Index) { //both a and mm exist in this case
				this.iMinuteNumber1Index += shiftValue;
			}
			if (this.iAmPmChar1Index < this.iSecondNumber1Index) { //both a and ss exist in this case
				this.iSecondNumber1Index += shiftValue;
			}
		};

		/**
		 * Destroy internal data structures.
		 */
		TimeSemanticMaskHelper.prototype.destroy = function() {
			if (this._maskRuleHours) {
				this._maskRuleHours.destroy();
				this._maskRuleHours = null;
			}

			if (this._maskRuleMinSec) {
				this._maskRuleMinSec.destroy();
				this._maskRuleMinSec = null;
			}

			if (this._maskRuleChars) {
				this._maskRuleChars.destroy();
				this._maskRuleChars = null;
			}
		};

		/**
		 * @override
		 * @private
		 */
		TimePicker.prototype._feedReplaceChar = function(sChar, iPlacePosition, sCurrentInputValue) {
			return this._oTimeSemanticMaskHelper.replaceChar(sChar, iPlacePosition, sCurrentInputValue);
		};

		//BCP: 002075129500004097892018
		/*
		 * This method is called by MaskEnabler just after the user input has completed(focusout, <enter>).
		 * MaskEnabler gives a chance to subclasses to early pre-alter the user-input value before the string is being
		 * set to the InputBase <value> property.
		 * At this point, MaskInput didn't propagate change to its subclasses (i.e. didn't call this.onChange)
		 *
		 * TimePicker uses it to workaround the issue with leading space or 0 at the beginning of the string & databinding,
		 * wheres the scenario is :
		 * - the user-input is about to be transmitted to InputBase#value including the leading space (e.g. " 8:00:00 AM",
		 * or respectively "08:00:00 AM" when mask is off)
		 *
		 * - since a property is updated, this triggers model update
		 *
		 * - model update uses property' binding type to get the external value.
		 *
		 * - in case of type=sap.ui.model.odata.type.Time, the format could be "h:mm:ss a" (i.e. no leading space nor 0),
		 *   so the external value would be "8:00:00 AM".
		 *
		 * - since the external value differs than the original ("8:00:00 AM" != " 8:00:00 AM", respectively
		 * "8:00:00 AM" != "08:00:00 AM"), the model re-sets the value to the external one (see ManagedObject.prototype#updateModelProperty)
		 *
		 * - this breaks TimePicker logic for previous and new value, by making the TimePicker wrongly "remember" new
		 * value (see this._oLastChangeValue).
		 *
		 * - The result is that TimePicker does not fire the change event.
		 *
		 * To solve it, the workaround here pre-formats the user-input value, so the value is the same as expected by used
		 * TimePicker formatter logic(includes binding type formatters) and this does not re-set back any value.
		 *
		 * @override
		 * @private
		 * @param {string} sValue
		 */
		TimePicker.prototype._getAlteredUserInputValue = function (sValue) {
			return sValue ? this._formatValue(this._parseValue(sValue, true), true) : sValue;
		};

		/**
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control.
		 * @protected
		 */
		TimePicker.prototype.getAccessibilityInfo = function() {
			var oRenderer = this.getRenderer();
			var oInfo = DateTimeField.prototype.getAccessibilityInfo.apply(this, arguments);
			var sValue = this.getValue() || "";
			var sRequired = this.getRequired() ? Library.getResourceBundleFor("sap.m").getText("ELEMENT_REQUIRED") : '';

			if (this._bValid) {
				var oDate = this.getDateValue();
				if (oDate) {
					sValue = this._formatValue(oDate);
				}
			}

			oInfo.role = oRenderer.getAriaRole(this);
			oInfo.type = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_TIMEINPUT");
			oInfo.description = [sValue || this._getPlaceholder(), oRenderer.getDescribedByAnnouncement(this), sRequired].join(" ").trim();
			oInfo.autocomplete = "none";
			oInfo.haspopup = true;

			return oInfo;
		};

		function getDefaultDisplayFormat() {
			var oLocale = new Locale(Formatting.getLanguageTag()),
				oLocaleData = LocaleData.getInstance(oLocale);

			return oLocaleData.getTimePattern(TimeFormatStyles.Medium);
		}

		TimePicker.prototype._revertKey = function(oKey, oSelection) {
			oSelection = oSelection || this._getTextSelection();

			var iBegin = oSelection.iFrom,
				iEnd = oSelection.iTo,
				iStart = iBegin,
				sPlaceholder,
				iLen;

			if (!oSelection.bHasSelection) {
				if (oKey.bBackspace) {
					iStart = iBegin = this._oRules.previousTo(iBegin);
				} else if (oKey.bDelete) {
					sPlaceholder = this.getPlaceholderSymbol();
					iLen = this._oTempValue._aContent.length;

					// find first character that is not a placeholder or separator character
					while ((this._oTempValue._aContent[iBegin] === sPlaceholder ||
							this._oTempValue._aInitial[iBegin] !== sPlaceholder) &&
							iBegin < iLen) {
						iBegin++;
					}
					iEnd = iBegin;
				}
			}

			if (oKey.bBackspace || (oKey.bDelete && oSelection.bHasSelection)) {
				iEnd = iEnd - 1;
			}

			this._resetTempValue(iBegin, iEnd);
			this._bCheckForLiveChange = true;
			this.updateDomValue(this._oTempValue.toString());
			this._setCursorPosition(Math.max(this._iUserInputStartPosition, iStart));
		};

		/**
		 * Fires when the input operation has finished and the value has changed.
		 *
		 * @name sap.m.TimePicker#change
		 * @event
		 * @param {sap.ui.base.Event} oControlEvent
		 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
		 * @param {object} oControlEvent.getParameters
		 * @param {string} oControlEvent.getParameters.value The new value of the input
		 * <b>Note:</b> If there is no data binding, the value is expected and updated in Gregorian calendar type. (Otherwise, the type of the binding is used.)
		 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid time
		 * @public
		 */

		/**
		 * Fires change event to attached listeners.
		 *
		 * Expects following event parameters:
		 * <ul>
		 * <li>value parameter of type <code>string</code> - the new value of the input</li>
		 * <li>valid parameter of type <code>boolean</code> - indicator for a valid time</li>
		 * </ul>
		 *
		 * @param {object} [mArguments] The arguments to pass along with the event
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @protected
		 * @name sap.m.TimePicker#fireChange
		 * @function
		 */

		TimePicker._PICKER_CONTENT_HEIGHT = "25rem";

		return TimePicker;
	});