/*!
 * ${copyright}
 */

// Provides control sap.m.TimePicker.
sap.ui.define(['jquery.sap.global', './InputBase', './MaskInput', './MaskInputRule', './ResponsivePopover', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/model/type/Time', 'sap/ui/model/odata/type/Time', './TimePickerSliders'],
	function(jQuery, InputBase, MaskInput, MaskInputRule, ResponsivePopover, EnabledPropagator, IconPool, TimeModel, TimeODataModel, TimePickerSliders) {
		"use strict";

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
		 * The user can enter a date by:
		 *
		 * <ul><li>Using the <code>TimePicker</code> dropdown that opens in a popup</li>
		 * <li>Typing it in directly in the input field</li></ul>
		 *
		 * On app level, there are two options to provide value for the
		 * <code>TimePicker</code> - as a string to the <code>value</code> property or as a
		 * JavaScript Date object to the <code>dateValue</code> property (only one of these
		 * properties should be used at a time):
		 *
		 * <ul><li>Use the <code>value</code> property if you want to bind the
		 * <code>TimePicker</code> to a model using the
		 * <code>sap.ui.model.type.Time</code></li>
		 * <li>Use the <code>value</code> property if the date is provided as a string from
		 * the backend or inside the app (for example, as ABAP type DATS field)</li>
		 * <li>Use the <code>dateValue</code> property if the date is already provided as a
		 * JavaScript Date object or you want to work with a JavaScript Date object</li></ul>
		 *
		 * <h3>Formatting</h3>
		 *
		 * All formatting and parsing of values from and to strings is done using the
		 * {@link sap.ui.core.format.DateFormat}. If a value is entered by typing it into
		 * the input field, it must fit to the used time format and locale.
		 *
		 * Supported format options are pattern-based on Unicode LDML Date Format notation.
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
		 * @extends sap.m.MaskInput
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.32
		 * @alias sap.m.TimePicker
		 */
		var TimePicker = MaskInput.extend("sap.m.TimePicker", /** @lends sap.m.TimePicker.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {
					/**
					 * Determines the format, displayed in the input field and the picker sliders.
					 *
					 * The default value is the browser's medium time format locale setting
					 * {@link sap.ui.core.LocaleData#getTimePattern}.
					 * If data binding with type {@link sap.ui.model.type.Time} or {@link sap.ui.model.odata.type.Time}
					 * is used for the <code>value</code> property, the <code>displayFormat</code> property
					 * is ignored as the information is provided from the binding itself.
					 */
					displayFormat : {type : "string", group : "Appearance", defaultValue : null},

					/**
					 * Determines the format of the value property.
					 *
					 * The default value is the browser's medium time format locale setting
					 * {@link sap.ui.core.LocaleData#getTimePattern}.
					 * If data binding with type {@link sap.ui.model.type.Time} or {@link sap.ui.model.odata.type.Time}
					 * is used for the <code>value</code> property, the <code>valueFormat</code> property
					 * is ignored as the information is provided from the binding itself.
					 */
					valueFormat : {type : "string", group : "Data", defaultValue : null},

					/**
					 * Defines the locale used to parse string values representing time.
					 *
					 * Determines the locale, used to interpret the string, supplied by the
					 * <code>value</code> property.
					 * Example: AM in the string "09:04 AM" is locale (language) dependent.
					 * The format comes from the browser language settings if not set explicitly.
					 * Used in combination with 12 hour <code>valueFormat</code> containing 'a', which
					 * stands for day period string.
					 * Default value is taken from browser's locale setting.
					 */
					localeId: {type : "string", group: "Data"},

					/**
					 *  Holds a reference to a JavaScript Date Object. The <code>value</code> (string)
					 * property will be set according to it. Alternatively, if the <code>value</code>
					 * and <code>valueFormat</code> pair properties are supplied instead,
					 * the <code>dateValue</code> will be instantiated according to the parsed
					 * <code>value</code>.
					 */
					dateValue : {type : "object", group : "Data", defaultValue : null},

					/**
					 * Displays the text of the general picker label and is read by screen readers.
					 * It is visible only on phone.
					 */
					title: {type: "string", group: "Misc", defaultValue: null},

					/**
					 * Sets the minutes slider step.
					 * The minutes slider is populated only by multiples of the step.
					 * @since 1.40
					 */
					minutesStep: {type: "int", group: "Misc", defaultValue: 1},

					/**
					 * Sets the seconds slider step.
					 * The seconds slider is populated only by multiples of the step.
					 * @since 1.40
					 */
					secondsStep: {type: "int", group: "Misc", defaultValue: 1}
				},
				aggregations: {
					/**
					 * Internal aggregation that contains the inner _picker pop-up.
					 */
					_picker: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }
				}
		}});

		IconPool.insertFontFaceStyle();
		EnabledPropagator.call(TimePicker.prototype, true);

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

			MaskInput.prototype.init.apply(this, arguments);

			this.setDisplayFormat(getDefaultDisplayFormat());

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			// marks if the value is valid or not
			this._bValid = false;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for the display
			 see @https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.LocaleData.html#getTimePattern */
			this._sUsedDisplayPattern = null;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for inputting
				 see @https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.LocaleData.html#getTimePattern */
			this._sUsedValuePattern = null;

			this._oDisplayFormat = null;
			this._sValueFormat = null;
			this._oPopoverKeydownEventDelegate = null;

			this._rPlaceholderRegEx = new RegExp(PLACEHOLDER_SYMBOL, 'g');
			this._sLastChangeValue = null;
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

			MaskInput.prototype.exit.apply(this, arguments);

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
		 * Called before the control is rendered.
		 */
		TimePicker.prototype.onBeforeRendering = function() {
			MaskInput.prototype.onBeforeRendering.apply(this, arguments);
		};

		/**
		 * Handles tap inside the input.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.ontap = function(oEvent) {
			var bIconClicked,
				bPickerOpened;

			if (!(this.getEditable() && this.getEnabled())) {
				return;
			}

			bIconClicked = jQuery(oEvent.target).hasClass("sapUiIcon");
			bPickerOpened = this._getPicker() && this._getPicker().isOpen();

			if (!bPickerOpened && bIconClicked) {
				this._openPicker();
			} else if (bIconClicked && !sap.ui.Device.system.phone) {
				//phone check: it wont be possible to click the icon while the dialog is opened
				//but there is a bug that the event is triggered twice on Nokia Lumia 520 emulated in Chrome
				//which closes the picker immediately after opening
				//so check for phone just in case
				this._closePicker();
			}
		};

		/**
		 * Handles the focusin event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onfocusin = function (oEvent) {
			var oPicker = this._getPicker();
			var bIconClicked = jQuery(oEvent.target).hasClass("sapUiIcon");

			MaskInput.prototype.onfocusin.apply(this, arguments);

			if (oPicker && oPicker.isOpen() && !bIconClicked) {
				this._closePicker();
			}
		};

		/**
		 * Handler for oninput event
		 * @param {jQuery.Event} oEvent  Event object
		 */
		TimePicker.prototype.oninput = function (oEvent) {
			MaskInput.prototype.oninput.apply(this, arguments);
		};

		/**
		 * Handles the focusout event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePicker.prototype.onfocusout = function (oEvent) {
			MaskInput.prototype.onfocusout.apply(this, arguments);
		};

		/**
		 * Called before the picker appears.
		 *
		 * @override
		 * @public
		 */
		TimePicker.prototype.onBeforeOpen = function() {
			/* Set the timevalues of the picker here to prevent user from seeing it */
			var oSliders = this._getSliders();

			oSliders.setTimeValues(this.getDateValue());
			oSliders.collapseAll();

			/* Mark input as active */
			this.$().addClass("sapMTPInputActive");
		};

		/**
		 * Called after the picker appears.
		 *
		 * @override
		 * @public
		 */
		TimePicker.prototype.onAfterOpen = function() {
			var oSliders = this._getSliders();

			if (oSliders) {
				oSliders._initFocus();

				//WAI-ARIA region
				this._handleAriaOnExpandCollapse();
			}
		};

		/**
		 * Called after the picker closes.
		 *
		 * @override
		 * @public
		 */
		TimePicker.prototype.onAfterClose = function() {
			this.$().removeClass("sapMTPInputActive");

			//WAI-ARIA region
			this._handleAriaOnExpandCollapse();
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
			var oDate;

			sValue = sValue || this._$input.val();

			this._bValid = true;
			if (sValue !== "") {
				oDate = this._parseValue(sValue, true);
				if (!oDate) {
					this._bValid = false;
				} else {
					// check if Formatter changed the value (it corrects some wrong inputs or known patterns)
					sValue = this._formatValue(oDate);
				}
			}

			if (this.isActive() && (this._$input.val() !== sValue)) {
				this.updateDomValue(sValue);
				if (this.bShowLabelAsPlaceholder) {
					// because value property might not be updated between typing
					this.$("placeholder").css("display", sValue ? "none" : "inline");
				}
			}

			if (oDate) {
				// get the value in valueFormat
				sValue = this._formatValue(oDate, true);
			}

			this.setProperty("value", sValue, true); // no rerendering
			if (this._bValid) {
				this.setProperty("dateValue", oDate, true); // no rerendering
			}

			this.fireChangeEvent(sValue, {valid: this._bValid});

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
		 * Sets the minutes slider step.
		 * @param iStep The step used to generate values for the minutes slider
		 * @returns {*} this
		 * @public
		 */
		TimePicker.prototype.setMinutesStep = function(iStep) {
			var oSliders = this._getSliders();

			if (oSliders) {
				oSliders.setMinutesStep(iStep);
			}
			return this.setProperty("minutesStep", iStep, true);
		};

		/**
		 * Sets the seconds slider step.
		 * @param iStep The step used to generate values for the seconds slider
		 * @returns {*} this
		 * @public
		 */
		TimePicker.prototype.setSecondsStep = function(iStep) {
			var oSliders = this._getSliders();

			if (oSliders) {
				oSliders.setSecondsStep(iStep);
			}
			return this.setProperty("secondsStep", iStep, true);
		};

		/**
		 * Sets the title label inside the picker.
		 *
		 * @param {string} sTitle A title
		 */
		TimePicker.prototype.setTitle = function(sTitle) {
			var oSliders = this._getSliders();

			if (oSliders) {
				oSliders.setLabelText(sTitle);
			}

			this.setProperty("title", sTitle, true);

			return this;
		};

		/**
		 * Sets the <code>valueFormat</code> property.
		 *
		 * @override
		 * @param {string} sValueFormat The format of strings that are set as value to the control
		 * @returns {sap.m.TimePicker} this instance, used for chaining
		 * @public
		 */
		TimePicker.prototype.setValueFormat = function(sValueFormat) {
			var sValue = this.getValue(),
				oDate;

			this.setProperty("valueFormat", sValueFormat, true); // no rerendering

			if (sValue) {
				oDate = this._parseValue(sValue);
				if (!oDate) {
					this._bValid = false;
					jQuery.sap.log.warning("Value can not be converted to a valid date", this);
				} else {
					this._bValid = true;
					this.setProperty("dateValue", oDate, true); // no rerendering

					sValue = this._formatValue(oDate);

					if (this.isActive()) {
						this._synchronizeInput(sValue);
					} else {
						this.setProperty("value", sValue, true); // no rerendering
						this._sLastChangeValue = sValue;
					}
				}
			}

			return this;
		};

		/**
		 * Sets the <code>displayFormat</code>.
		 *
		 * @override
		 * @param {string} sDisplayFormat The format of the string inside the input
		 * @returns {sap.m.TimePicker} this instance, used for chaining
		 * @public
		 */
		TimePicker.prototype.setDisplayFormat = function(sDisplayFormat) {
			var sOutputValue,
				oDateValue;

			// if displayFormat changes the value must be formatted again
			this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering

			this._initMask();

			oDateValue = this.getDateValue();

			if (!oDateValue) {
				return this;
			}

			sOutputValue = this._formatValue(oDateValue);

			if (this.isActive()) {
				this._synchronizeInput(sOutputValue);
			}

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
		 * @returns {sap.m.TimePicker} this instance, used for chaining
		 * @public
		 */
		TimePicker.prototype.setValue = function(sValue) {
			var oDate,
				sOutputValue;

			sValue = this.validateProperty('value', sValue);

			this._initMask();

			MaskInput.prototype.setValue.call(this, sValue);
			this._sLastChangeValue = sValue;
			this._bValid = true;

			// convert to date object
			if (sValue) {
				oDate = this._parseValue(sValue);
				if (!oDate) {
					this._bValid = false;
					jQuery.sap.log.warning("Value can not be converted to a valid date", this);
				}
			}

			if (this._bValid) {
				this.setProperty("dateValue", oDate, true); // no rerendering
			}

			// convert to output
			if (oDate) {
				sOutputValue = this._formatValue(oDate);
			} else {
				sOutputValue = sValue;
			}

			// do not call InputBase.setValue because the displayed value and the output value might have different pattern
			if (this.isActive()) {
				this._synchronizeInput(sOutputValue);
			}

			return this;

		};

		/**
		 * Sets the <code>dateValue</code> JavaScript date object.
		 *
		 * Recommended usage is when <code>value</code> is not set, as they are mutually exclusive.
		 *
		 * @override
		 * @param {Date} oDate New date object
		 * @returns {sap.m.TimePicker|Error} this instance, used for chaining
		 * @public
		 */
		TimePicker.prototype.setDateValue = function(oDate) {
			var sValue;

			if (oDate && !(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			if (jQuery.sap.equal(this.getDateValue(), oDate)) {
				return this;
			}

			this._bValid = true;
			this.setProperty("dateValue", oDate, true); // no rerendering

			// convert date object to value
			sValue = this._formatValue(oDate, true);

			// set the property in any case but check validity on output
			this.setProperty("value", sValue, true); // no rerendering
			this._sLastChangeValue = sValue;

			if (this.isActive()) {
				// convert to output
				sValue = this._formatValue(oDate);

				if (this._$input.val() !== sValue) {
					this.updateDomValue(sValue);
				}
			}

			return this;
		};

		/**
		 * Sets the locale of the control.
		 *
		 * Used for parsing and formatting the time values in languages different than English.
		 * Necessary for translation and auto-complete of the day periods, such as AM and PM.
		 *
		 * @param {string} sLocaleId A locale identifier like 'en_US'
		 * @returns {sap.m.TimePicker} this instance, used for chaining
		 * @public
		 */
		TimePicker.prototype.setLocaleId = function(sLocaleId) {
			var sCurrentValue = this.getValue();

			this.setProperty("localeId", sLocaleId, true);
			this._initMask();

			this._oDisplayFormat = null;
			this._sValueFormat = null;

			if (sCurrentValue) {
				this.setValue(sCurrentValue);
			}

			return this;
		};

		/**
		 * Provides a placeholder string to be displayed inside the input, when it is empty.
		 *
		 * @override
		 * @returns {string} The placeholder string
		 * @public
		 */
		TimePicker.prototype.getPlaceholder = function() {
			var sPlaceholder = this.getProperty("placeholder");

			if (!sPlaceholder) {
				sPlaceholder =  this._getFormat();
			}
			return sPlaceholder;
		};

		/**
		 * Obtains time pattern
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
			var oKC = jQuery.sap.KeyCodes,
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
			} else {
				MaskInput.prototype.onkeydown.call(this, oEvent);
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
		 * Opens the picker.
		 *
		 * Creates the picker if necessary.
		 *
		 * @returns {sap.m.ResponsivePopover} The picker part as a control, used for chaining
		 * @private
		 */
		TimePicker.prototype._openPicker = function () {
			var oPicker = this._getPicker(),
				oSliders;

			if (!oPicker) {
				oPicker = this._createPicker(this._getDisplayFormatPattern());
			}

			oPicker.open();

			oSliders = this._getSliders();
			jQuery.sap.delayedCall(0, oSliders, oSliders.updateSlidersValues);

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
				oPicker.close();
			} else {
				jQuery.sap.log.warning("There is no picker to close.");
			}

			return oPicker;
		};

		/**
		 * Updates the input with a given value if necessary.
		 *
		 * @param {string} sValue A value to synchronized the input with
		 * @private
		 */
		TimePicker.prototype._synchronizeInput = function(sValue) {
			if ((this._$input.val() !== sValue)) {
				this.updateDomValue(sValue);
			}
		};

		/**
		 * Creates the picker.
		 *
		 * Uses {@link sap.m.ResponsivePopover} control for a picker.
		 *
		 * @param {string} sFormat Time format used for creating the sliders inside the picker
		 * @private
		 */
		TimePicker.prototype._createPicker = function(sFormat) {
			var that = this,
				oPopover,
				oPicker,
				oResourceBundle,
				sOKButtonText,
				sCancelButtonText,
				sTitle;

			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sOKButtonText = oResourceBundle.getText("TIMEPICKER_SET");
			sCancelButtonText = oResourceBundle.getText("TIMEPICKER_CANCEL");
			sTitle = this.getTitle();

			oPicker = new ResponsivePopover(that.getId() + "-RP", {
				showCloseButton: false,
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: false,
				placement: sap.m.PlacementType.VerticalPreferedBottom,
				beginButton: new sap.m.Button({ text: sOKButtonText, press: jQuery.proxy(this._handleOkPress, this) }),
				endButton: new sap.m.Button({ text: sCancelButtonText, press: jQuery.proxy(this._handleCancelPress, this) }),
				content: [
					//ToDo: This is inconsistent with the parent locale (if set). Add 'localeID' property to this control which will read its parent 'localeID' property
					new TimePickerSliders(this.getId() + "-sliders", {
						format: sFormat,
						labelText: sTitle ? sTitle : "",
						invokedBy: that.getId(),
						minutesStep: this.getMinutesStep(),
						secondsStep: this.getSecondsStep()
					})
				],
				contentHeight: TimePicker._PICKER_CONTENT_HEIGHT
			});

			oPopover = oPicker.getAggregation("_popup");
			// hide arrow in case of popover as dialog does not have an arrow
			if (oPopover.setShowArrow) {
				oPopover.setShowArrow(false);
			}

			oPopover.oPopup.setAutoCloseAreas([this.getDomRef("icon")]);

			oPicker.addStyleClass(this.getRenderer().CSS_CLASS + "DropDown")
				.attachBeforeOpen(this.onBeforeOpen, this)
				.attachAfterOpen(this.onAfterOpen, this)
				.attachAfterClose(this.onAfterClose, this);

			oPicker.open = function() {
				return this.openBy(that);
			};

			if (sap.ui.Device.system.desktop) {
				this._oPopoverKeydownEventDelegate = {
					onkeydown: function(oEvent) {
						var oKC = jQuery.sap.KeyCodes,
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
				//override popover callback - the best place to update content layout
				oPopover._afterAdjustPositionAndArrowHook = function() {
					that._getSliders()._onOrientationChanged();
				};
			}

			// define a parent-child relationship between the control's and the _picker pop-up
			this.setAggregation("_picker", oPicker, true);

			return oPicker;
		};

		/**
		 * Gets all attached sliders to this TimePicker instance.
		 * @private
		 * @returns {sap.m.TimePickerSliders|null} returns the content of the picker (The sliders control).
		 */
		TimePicker.prototype._getSliders = function () {
			var oPicker = this._getPicker();
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
			var oDate = this._getSliders().getTimeValues(),
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
		 * Parses a given string to a date object, based on either the <code>displayFormat</code>
		 * or the <code>valueFormat</code>.
		 *
		 * @param {string} sValue Value to be parsed
		 * @param {boolean} bDisplayFormat Defines whether the string being parsed is in <code>displayFormat</code> or in <code>valueFormat</code>
		 * @returns {Object} A date object
		 * @private
		 */
		TimePicker.prototype._parseValue = function(sValue, bDisplayFormat) {
			var oFormat = this._getFormatter(bDisplayFormat);

			//because of the leading space in formats without a leading zero
			if (bDisplayFormat) {
				sValue = this._oTimeSemanticMaskHelper.stripValueOfLeadingSpaces(sValue);
				//if the user input is not full and there are placeholder symbols left, they need to be removed in order
				//the value to be parsed to a valid fallback format
				sValue = sValue.replace(this._rPlaceholderRegEx,'');
			}

			// convert to date object
			return oFormat.parse(sValue);
		};

		/**
		 * Converts the time to the output format.
		 *
		 * If bValueFormat is set, it converts it to the <code>valueFormat</code>.
		 *
		 * @param {Date} oDate A JavaScript date object
		 * @param {boolean} bValueFormat Defines whether the result is in <code>valueFormat</code> or <code>displayFormat</code>
		 * @returns {string} Formatted value
		 * @private
		 */
		TimePicker.prototype._formatValue = function(oDate, bValueFormat) {
			var sValue = "",
				oFormat;

			if (oDate) {
				oFormat = this._getFormatter(!bValueFormat);
				// convert to date object
				sValue = oFormat.format(oDate);

				// in display format the formatter returns strings without the leading space
				// that we use in the mask - "9:15" instead of " 9:15"
				// that's because the mask is fixed length

				// this._oTimeSemanticMaskHelper will always exist if we have displayformat and localeId set
				// and they both have default values, but check just in case
				if (!bValueFormat && this._oTimeSemanticMaskHelper) {
					sValue = this._oTimeSemanticMaskHelper.formatValueWithLeadingTrailingSpaces(sValue);
				}
			}

			return sValue;

		};

		/**
		 * Handles the correct value for ARIA expanded attribute on the TimePicker's input field.
		 *
		 * @private
		 */
		TimePicker.prototype._handleAriaOnExpandCollapse = function () {
			this.getFocusDomRef().setAttribute("aria-expanded", this._getPicker().isOpen());
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
				oDate = new Date(oOldDate.getTime());

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
					oDate = new Date(oOldDate.getTime() + iNumber * iMsOffset);
				}

				this.setDateValue(oDate);

				this.fireChangeEvent(this.getValue(), {valid: true});
			}
		};

		/**
		 * Gets or creates a formatter object used when formatting date objects to or from
		 * <code>displayFormat</code> or <code>valueFormat</code> .
		 *
		 * @param {boolean} bDisplayFormat Defines whether the formatter object should format date objects to <code>displayFormat</code> or to <code>valueFormat</code>
		 * @returns {sap.ui.core.format.DateFormat} The formatter object
		 * @private
		 */
		TimePicker.prototype._getFormatter = function(bDisplayFormat) {
			var sPattern = this._getBoundValueTypePattern(),
				bRelative = false,
				oFormat,
				oBinding = this.getBinding("value");

			if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
				bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
			}

			/* eslint-disable no-lonely-if */
			if (!sPattern) {
				// not databinding is used -> use given format
				if (bDisplayFormat) {
					sPattern = ( this.getDisplayFormat() || TimeFormatStyles.Medium );
				} else {
					sPattern = ( this.getValueFormat() || TimeFormatStyles.Medium );
				}
			}

			if (bDisplayFormat) {
				if (sPattern === this._sUsedDisplayPattern) {
					oFormat = this._oDisplayFormat;
				}
			} else {
				if (sPattern === this._sUsedValuePattern) {
					oFormat = this._sValueFormat;
				}
			}

			if (oFormat) {
				return oFormat;
			}

			if (sPattern === TimeFormatStyles.Short || sPattern === TimeFormatStyles.Medium || sPattern === TimeFormatStyles.Long) {
				oFormat = sap.ui.core.format.DateFormat.getTimeInstance({style: sPattern, strictParsing: true, relative: bRelative}, new sap.ui.core.Locale(this.getLocaleId()));
			} else {
				oFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: sPattern, strictParsing: true, relative: bRelative}, new sap.ui.core.Locale(this.getLocaleId()));
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
		 * Fires the change event for the listeners
		 *
		 * @protected
		 * @param {String} sValue value of the input.
		 * @param {Object} [oParams] extra event parameters.
		 */
		TimePicker.prototype.fireChangeEvent = function(sValue, oParams) {
			if (sValue) {
				sValue = sValue.trim();
			}

			if (sValue !== this._sLastChangeValue) {
				this._sLastChangeValue = sValue;
				InputBase.prototype.fireChangeEvent.call(this, sValue, oParams);
			}
		};

		var TimeSemanticMaskHelper = function(oTimePicker) {
			var sDisplayFormat = oTimePicker._getDisplayFormatPattern(),
				sMask = sDisplayFormat,
				sAllowedHourChars,
				//Respect browser locale if no locale is explicitly set (BCP: 1670060658)
				sLocaleId = oTimePicker.getLocaleId() || sap.ui.getCore().getConfiguration().getFormatLocale(),
				oLocale  = new sap.ui.core.Locale(sLocaleId),
				i;

			// Set the localeId and prevent infinite loop by suppressing rendering
			oTimePicker.setProperty("localeId", sLocaleId, true);
			this._oTimePicker = oTimePicker;
			this.aOriginalAmPmValues = sap.ui.core.LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");
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
			sMask = sMask.replace(/hh/ig, "h").replace(/h/ig, "h9");
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
			sMask = sMask.replace(/mm/g, "59");
			this.iSecondNumber1Index = sMask.indexOf("ss");
			sMask = sMask.replace(/ss/g, "59");

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
				var iCorrectionIndexes = this.iAmPmValueMaxLength - "a".length;
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
					iEnd = b24H ? 23 : 12;

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
		 * Removes any whitespaces precedung the hours value (e.g. "<space>1:13:32" -> "1:13:32",
		 * "PM<space>1:13:32" -> "PM1:13:32").
		 * @param value
		 * @returns {*} the stripped value
		 */
		TimeSemanticMaskHelper.prototype.stripValueOfLeadingSpaces = function(value) {
			if (value[this.iHourNumber1Index] === " ") {
				value = [value.slice(0, this.iHourNumber1Index), value.slice(this.iHourNumber1Index + 1)].join('');
			}
			return value;
		};

		/**
		 * Shifts hours, minutes and seconds indexes if period ("a", see http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)
		 * is before corresponding hours, minutes & seconds fields.
		 * @param {Number} shiftValue the shift value
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
		 * Destroy internal data structures
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


		/**
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 * @protected
		 */
		TimePicker.prototype.getAccessibilityInfo = function() {
			var oRenderer = this.getRenderer();
			var oInfo = MaskInput.prototype.getAccessibilityInfo.apply(this, arguments);
			var sValue = this.getValue() || "";
			if (this._bValid) {
				var oDate = this.getDateValue();
				if (oDate) {
					sValue = this._formatValue(oDate);
				}
			}
			oInfo.role = "combobox";
			oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_TIMEINPUT");
			oInfo.description = [sValue, oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this)].join(" ").trim();
			return oInfo;
		};

		function getDefaultDisplayFormat() {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);

			return oLocaleData.getTimePattern(TimeFormatStyles.Medium);
		}

		TimePicker.prototype._getDisplayFormatPattern = function() {
			return this._getBoundValueTypePattern() || this.getDisplayFormat();
		};

		TimePicker.prototype._getBoundValueTypePattern = function() {
			var oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType();

			if (oBindingType instanceof TimeModel) {
				return oBindingType.getOutputPattern();
			}

			if (oBindingType instanceof TimeODataModel && oBindingType.oFormat) {
				return oBindingType.oFormat.oFormatOptions.pattern;
			}

			return undefined;
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
		 * @param {Map} [mArguments] The arguments to pass along with the event
		 * @return {sap.m.TimePicker} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.m.TimePicker#fireChange
		 * @function
		 */

		TimePicker._PICKER_CONTENT_HEIGHT = "25rem";

		return TimePicker;

	}, /* bExport= */ true);
