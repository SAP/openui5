/*!
 * ${copyright}
 */

// Provides control sap.m.TimePicker.
sap.ui.define(['jquery.sap.global', './InputBase', './ResponsivePopover', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/model/type/Time', './TimePickerSliders'],
	function(jQuery, InputBase, ResponsivePopover, EnabledPropagator, IconPool, TimeModel, TimePickerSliders) {
		"use strict";

		/**
		 * Constructor for a new TimePicker.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The TimePicker is an extension of the Input control and allows for time selection in a any device/browser supported by UI5.
		 * It enables users to fill time related input fields. For the TimePicker UI,
		 * you can define text, icon, or both. A time format must be specified,
		 * otherwise the default "HH:mm:ss a" will be used. The functionality is aligned with the
		 * sap.m.DatePicker control for consistent behavior.
		 * @extends sap.m.InputBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.32
		 * @alias sap.m.TimePicker
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var TimePicker = InputBase.extend("sap.m.TimePicker", /** @lends sap.m.TimePicker.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {
					/**
					 * Determines the format, displayed in the input field and the picker sliders.
					 * The default value is the browser's medium time format locale setting
					 * (https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.LocaleData.html#getTimePattern).
					 * If data binding with type sap.ui.model.type.Time is used for the value property,
					 * the displayFormat property is ignored as the information is provided from the binding itself.
					 */
					displayFormat : {type : "string", group : "Appearance", defaultValue : null},

					/**
					 * Determines the format of the value property.
					 * The default value is the browser's medium time format locale setting.
					 * If data binding with type sap.ui.model.type.Time is used for the value property,
					 * the valueFormat property is ignored as the information is provided from the binding itself.
					 */
					valueFormat : {type : "string", group : "Data", defaultValue : null},

					/**
					 * Defines the locale used to parse string values representing time.
					 * Determines the locale, used to interpret the string, supplied by the value property.
					 * Example: AM in the string "09:04 AM" is locale (language) dependent.
					 * The format comes form the browser language settings.
					 * Used in combination with valueFormat containing 'a' which stands for part of the day in 12 hour format.
					 * Default value is en-US.
					 */
					localeId: {type : "string", group: "Data", defaultValue : "en-US"},

					/**
					 * Defines the date/time, represented in the control, as a JavaScript Date Object.
					 * Used as an alternative to the value and valueFormat pair properties -
					 * recommended when the time is already in JavaScript format.
					 */
					dateValue : {type : "object", group : "Data", defaultValue : null},

					/**
					 * Displays the text of the general picker label and is read by screen readers. It is visible only on phone.
					 */
					title: {type: "string", group: "Misc", defaultValue: null}
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
			PICKER_CONTENT_HEIGHT = "25rem";

		/**
		 * Initializes the control
		 * @public
		 */
		TimePicker.prototype.init = function() {
			InputBase.prototype.init.apply(this, arguments);

			this.setDisplayFormat(getDefaultDisplayFormat());

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			// caches jQuery reference to the input field
			this._$Input = null;

			// marks if the value is valid or not
			this._bValid = false;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for the display
			 see @https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.LocaleData.html#getTimePattern */
			this._sUsedDisplayPattern = null;

			/*  stores the type of the used locale (e.g. 'medium', 'long') for inputting
				 see @https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.LocaleData.html#getTimePattern */
			this._sUsedValuePattern = null;

			this._iCursorPosition = null;
			this._oDisplayFormat = null;
			this._sValueFormat = null;
			this._sLastValue = null;
			this._oPopoverKeydownEventDelegate = null;

			// Indicates if the picker is currently in a process of opening
			this._bPickerOpening = false;
		};

		/**
		 * Exit function
		 * @public
		 */
		TimePicker.prototype.exit = function () {
			InputBase.prototype.exit.apply(this, arguments);

			this._removePickerEvents();

			this._oResourceBundle = null;
			this._$Input = null;
			this._bValid = false;
			this._sUsedDisplayPattern = null;
			this._oDisplayFormat = null;
			this._oPopoverKeydownEventDelegate = null;
			this._sLastValue = null;
			this._iCursorPosition = null;
			this._sUsedValuePattern = null;
			this._sValueFormat = null;
		};

		/**
		 * Called after the control is rendered
		 */
		TimePicker.prototype.onAfterRendering = function() {
			InputBase.prototype.onAfterRendering.apply(this, arguments);

			this._$Input = jQuery(this.getFocusDomRef());
		};

		/**
		 * Handles the click inside the input. Used to open the picker.
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onclick = function(oEvent) {
			var bIconClicked,
				bPickerOpened;

			if (!(this.getEditable() && this.getEnabled())) {
				return;
			}

			bIconClicked = jQuery(oEvent.target).hasClass("sapUiIcon");
			bPickerOpened = this._getPicker() && this._getPicker().isOpen();

			if (!bPickerOpened && (bIconClicked || !sap.ui.Device.system.desktop)) {
				this._openPicker();
			} else if (bIconClicked) {
				this._closePicker();
			}
		};

		/**
		 * Handler for focusout event, used to style the input
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onfocusout = function (oEvent) {
			var oPicker = this._getPicker();

			InputBase.prototype.onfocusout.apply(this, arguments);

			if (oPicker && !oPicker.isOpen() && !this._bPickerOpening) {
				this.$().removeClass("sapMTPInputActive");
			}
		};

		/***********************************************************************
		 **************************** Public methods ***************************
		 ***********************************************************************/

		/**
		 * Uses Popover#onBeforeOpen to set time values from the dateValue object.
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

			this._bPickerOpening = true;
		};

		/**
		 * Uses Popover#onAfterOpen to update the time values from the dateValue object.
		 * @override
		 * @public
		 */
		TimePicker.prototype.onAfterOpen = function() {
			var oSliders = this._getSliders();

			this._bPickerOpening = false;

			if (oSliders) {
				oSliders.updateSlidersValues();
				oSliders._initFocus();

				//WAI-ARIA region
				this._handleAriaOnExpandCollapse();
			}
		};

		/**
		 * Changes input style after close
		 * @override
		 * @public
		 */
		TimePicker.prototype.onAfterClose = function() {
			this.$().removeClass("sapMTPInputActive");

			//WAI-ARIA region
			this._handleAriaOnExpandCollapse();
		};

		/**
		 * Handles input change event
		 * @private
		 */
		TimePicker.prototype._handleInputChange = function () {
			var sValue = this._$Input.val(),
				sOldValue = this._formatValue(this.getDateValue()),
				oDate,
				oPicker;

			// don't do anything if the value hasn't changed
			if (sValue === sOldValue && this._bValid) {
				return;
			}

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

			if (this.isActive() && (this._$Input.val() !== sValue)) {
				this.updateDomValue(sValue);
				this._iCursorPosition = this._$Input.cursorPos();
				if (this._$label) {
					// because value property might not be updated between typing
					this._$label.css("display", sValue ? "none" : "inline");
				}
			}

			if (oDate) {
				// get the value in valueFormat
				sValue = this._formatValue(oDate, true);
			}

			// compare with the old known value
			if (sValue !== this._sLastValue) {
				//set the picker values if the picker is open
				oPicker = this._getPicker();

				this.setProperty("value", sValue, true); // no rerendering
				if (this._bValid) {
					this.setProperty("dateValue", oDate, true); // no rerendering
				}

				// remember the last value on change
				this._sLastValue = sValue;

				this.fireChangeEvent(sValue, {valid: this._bValid});

				if (oPicker) {
					oPicker.getContent()[0].setTimeValues(oDate);
				}
			}
		};

		/**
		 * Handles the input change event
		 * @override
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onChange = function(oEvent) {
			// don't call InputBase onChange because this calls setValue what would trigger a new formatting

			// check the control is editable or not
			if (this.getEditable() && this.getEnabled()) {
				this._handleInputChange();
			}
		};

		/**
		 * Updates the value of the input
		 * @override
		 * @param sValue {string} Value of the input field
		 * @returns {sap.m.TimePicker} Same instance for chaining
		 */
		TimePicker.prototype.updateDomValue = function(sValue) {
			var oDate;

			// dom value updated other than value property
			this._bCheckDomValue = true;

			sValue = (typeof sValue == "undefined") ? this._$Input.val() : sValue.toString();
			this._iCursorPosition = this._$Input.cursorPos();

			oDate = this._parseValue(sValue, true);
			sValue = this._formatValue(oDate);

			// update the DOM value when necessary
			// otherwise cursor can goto end of text unnecessarily
			if (this.isActive() && (this._$input.val() !== sValue)) {
				this._$Input.val(sValue);
				this._$Input.cursorPos(this._iCursorPosition);
			}

			// update placeholder visibility
			this._setLabelVisibility();

			return this;
		};

		TimePicker.prototype.setTitle = function(sTitle) {
			var oSliders = this._getSliders();

			if (oSliders) {
				oSliders.setLabelText(sTitle);
			}

			this.setProperty("title", sTitle, true);
		};

		/**
		 * Sets the valueFormat - the format of strings that are set as value to the control.
		 * @override
		 * @param sValueFormat {string} New format
		 * @returns {sap.m.TimePicker} Same instance for chaining
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
					}

					this._sLastValue = sValue;
				}
			}

			return this;
		};

		/**
		 * Sets the displayFormat - the formatted string inside the input
		 * @override
		 * @param sDisplayFormat {string} New display format
		 * @returns {sap.m.TimePicker} Same instance for chaining
		 */
		TimePicker.prototype.setDisplayFormat = function(sDisplayFormat) {
			var sOutputValue,
				oDateValue;

			// if displayFormat changes the value must be formatted again
			this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering
			oDateValue = this.getDateValue();

			if (!oDateValue) {
				return this;
			}

			sOutputValue = this._formatValue(oDateValue);

			if (this.isActive()) {
				this._synchronizeInput(sOutputValue);
			}

			this._sLastValue = sOutputValue;

			return this;
		};

		/**
		 * Sets the current value to whatever string was given if it cannot be parsed based on the current valueFormat.
		 * Recommended usage is when dateValue is not set as they are mutually exclusive.
		 * @override
		 * @param sValue {string} New input value
		 * @returns {sap.m.TimePicker} Same instance for chaining
		 */
		TimePicker.prototype.setValue = function(sValue) {
				var oDate,
				sOutputValue;

			// to convert null and undefined to ""
			sValue = this.validateProperty("value", sValue);

			this._sLastValue = sValue;

			// set the property in any case but check validity on output
			this.setProperty("value", sValue, true); // no rerendering
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
		 * Sets the dateValue JS date object. Recommended usage is when value is not set as they are mutually exclusive.
		 * @override
		 * @param oDate {date} New date value
		 * @returns {sap.m.TimePicker|Error} Same instance for chaining
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

			if (sValue !== this.getValue()) {
				this._sLastValue = sValue;
			}
			// set the property in any case but check validity on output
			this.setProperty("value", sValue, true); // no rerendering

			if (this.isActive()) {
				// convert to output
				sValue = this._formatValue(oDate);

				if (this._$Input.val() !== sValue) {
					this.updateDomValue(sValue);
					this._iCursorPosition = this._$Input.cursorPos();
				}
			}

			return this;
		};

		TimePicker.prototype.setLocaleId = function(sLocaleId) {
			var sCurrentValue = this.getValue();

			this.setProperty("localeId", sLocaleId, true);

			this._oDisplayFormat = null;
			this._sValueFormat = null;

			if (sCurrentValue) {
				this.setValue(sCurrentValue);
			}
		};

		/**
		 * Gets a placeholder string to be displayed in the input when it is empty
		 * @public
		 * @override
		 * @returns {string} The placeholder string
		 */
		TimePicker.prototype.getPlaceholder = function() {
			var sPlaceholder = this.getProperty("placeholder"),
				oBinding;

			if (!sPlaceholder) {
				oBinding = this.getBinding("value");

				if (oBinding && oBinding.oType && (oBinding.oType instanceof TimeModel)) {
					sPlaceholder = oBinding.oType.getOutputPattern();
				} else {
					sPlaceholder = this.getDisplayFormat();
				}

				if (!sPlaceholder) {
					sPlaceholder = TimeFormatStyles.Medium;
				}

				if (sPlaceholder === TimeFormatStyles.Short || sPlaceholder === TimeFormatStyles.Medium || sPlaceholder === TimeFormatStyles.Long) {
					sPlaceholder = getDefaultDisplayFormat();
				}
			}

			return sPlaceholder;
		};

		/***********************************************************************
		 **************************** Keyboard handling ************************
		 ***********************************************************************/

		/**
		 * Handles the pageup event - increases by one hour.
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onsappageup = function(oEvent) {
			//increase by one hour
			this._increaseTime(1, TimeParts.Hour);

			oEvent.preventDefault(); //do not move cursor
		};

		/**
		 * Handles the shift+pageup/ctrl+shift+pageup event - increases by one minute/second.
		 * @param oEvent {jQuery.Event} Event object
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
		 * Handles the pagedown event - decreases by one hour.
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onsappagedown = function(oEvent) {
			//decrease by one hour
			this._increaseTime(-1, TimeParts.Hour);

			oEvent.preventDefault(); // do not move cursor
		};

		/**
		 * Handles the shift+pagedown/ctrl+shift+pagedown event - decreases by one minute/second.
		 * @param oEvent {jQuery.Event} Event object
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
		 * Handles the keypress event - checks if the char is among the allowed chars.
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePicker.prototype.onkeypress = function(oEvent) {
			var oFormatter,
				sChar;

			if (!oEvent.charCode) {
				return;
			}

			oFormatter = this._getFormatter(true);
			sChar = String.fromCharCode(oEvent.charCode);

			if (sChar && oFormatter.sAllowedCharacters && oFormatter.sAllowedCharacters.indexOf(sChar) < 0) {
				oEvent.preventDefault();
			}
		};

		/**
		 * Handles the keydown event - opens the picker if specific key combinations are pressed.
		 *
		 * @param oEvent {jQuery.Event} Event object
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
			}
		};

		/***********************************************************************
		 **************************** Private methods **************************
		 ***********************************************************************/

		/**
		 * Gets the hidden picker aggregation
		 * @private
		 * @returns {sap.m.ResponsivePopover|undefined} Picker aggregation
		 */
		TimePicker.prototype._getPicker = function() {
			return this.getAggregation("_picker");
		};

		/**
		 * Detaches the picker from the keyboard events
		 * @private
		 */
		TimePicker.prototype._removePickerEvents = function() {
			var oPopover,
				oPicker = this._getPicker();

			if (oPicker) {
				oPopover = oPicker.getAggregation("_popup");
				if (this._oPopoverKeydownEventDelegate) {
					oPopover.removeEventDelegate(this._oPopoverKeydownEventDelegate);
				}
			}
		};

		/**
		 * Opens the time picker popover
		 * @private
		 * @returns {sap.m.ResponsivePopover} The opened popover control of the time picker for chaining
		 */
		TimePicker.prototype._openPicker = function () {
			var oPicker = this._getPicker();

			if (!oPicker) {
				oPicker = this._createPicker(this.getDisplayFormat());
			}

			oPicker.open();

			return oPicker;
		};

		/**
		 * Closes the time picker popover
		 * @private
		 * @returns {sap.m.ResponsivePopover|undefined}
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
		 * Updates the input with a given value if necessary
		 * @param sValue {string} A value to be synchronized with
		 * @private
		 */
		TimePicker.prototype._synchronizeInput = function(sValue) {
			if ((this._$Input.val() !== sValue)) {
				this.updateDomValue(sValue);
				this._iCursorPosition = this._$Input.cursorPos();
			}
		};

		/**
		 * Gets the input value based on the displayed value
		 * @private
		 * @override (InputBase.prototype._getInputValue to do the conversion there)
		 * @param sValue {string} Value of the input.
		 * @returns {string} Input value, formatted as expected to be passed in the setValue method
		 */
		TimePicker.prototype._getInputValue = function(sValue) {
			var oDate;

			sValue = InputBase.prototype._getInputValue.apply(this, arguments);

			oDate = this._parseValue(sValue, true);
			sValue = this._formatValue(oDate, true);

			return sValue;
		};

		/**
		 * Creates the responsive popover used as a _picker
		 * @private
		 * @param sFormat {string} Display format used for creating the UI of the picker.
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
					new TimePickerSliders(this.getId() + "-sliders", {
						format: sFormat,
						labelText: sTitle ? sTitle : ""
					})
				],
				contentHeight: PICKER_CONTENT_HEIGHT
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
		 * Handles the press event of the OK button
		 * @private
		 * @param oEvent {jQuery.Event} Event object.
		 */
		TimePicker.prototype._handleOkPress = function(oEvent) {
			var oDate = this._getSliders().getTimeValues(),
				sValue = this._formatValue(oDate);

			this.updateDomValue(sValue);
			this._handleInputChange();

			this._closePicker();
		};

		/**
		 * Handles the press event of the Cancel button
		 * @private
		 * @param oEvent {jQuery.Event} Event object.
		 */
		TimePicker.prototype._handleCancelPress = function(oEvent) {
			this._closePicker();
		};

		/**
		 * Parses a given string to a date object, based on either the displayFormat or the valueFormat.
		 * @private
		 * @param sValue {string} Value to be parsed.
		 * @param bDisplayFormat {boolean} Defines whether the string being parsed is in display format or in value format
		 * @returns {Object} A date object
		 */
		TimePicker.prototype._parseValue = function(sValue, bDisplayFormat) {
			var oFormat = this._getFormatter(bDisplayFormat);

			// convert to date object
			return oFormat.parse(sValue);
		};

		/**
		 * Converts the date to the output format. If bValueFormat is set, it converts it to the value format.
		 * @private
		 * @param oDate {date} A JS date object.
		 * @param bValueFormat Defines whether the result is in value format or display format
		 * @returns {string} Formatted value.
		 */
		TimePicker.prototype._formatValue = function(oDate, bValueFormat) {
			var sValue = "",
				oFormat;

			if (oDate) {
				oFormat = this._getFormatter(!bValueFormat);
				// convert to date object
				sValue = oFormat.format(oDate);
			}

			return sValue;

		};

		/**
		 * Handles the correct value for ARIA expanded attribute on the TimePicker input field
		 * @private
		 */
		TimePicker.prototype._handleAriaOnExpandCollapse = function () {
			this.getFocusDomRef().setAttribute("aria-expanded", this._getPicker().isOpen());
		};

		/**
		 * Changes the time value in the input field of TimePicker.
		 * @param iNumber {number} Number to be added to the existing value.
		 * @param sUnit {string} Unit to be changed.
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

				this._iCursorPosition = this._$Input.cursorPos();

				this.fireChangeEvent(this.getValue(), {valid: true});
			}
		};

		/**
		 * Gets or creates a formatter object used when formatting date objects to display or value format
		 * @param bDisplayFormat Defines whether the formatter object should format date objects to display format or to value format
		 * @returns {sap.ui.core.format.DateFormat} The formatter object
		 * @private
		 */
		TimePicker.prototype._getFormatter = function(bDisplayFormat) {
			var sPattern = "",
				bRelative = false,
				oFormat,
				oBinding = this.getBinding("value");

			if (oBinding && oBinding.oType && (oBinding.oType instanceof TimeModel)) {
				sPattern = oBinding.oType.getOutputPattern();
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

		/************************************************************************
		 **************************** Helpers ***********************************
		 ************************************************************************/

		function getDefaultDisplayFormat() {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);

			return oLocaleData.getTimePattern(TimeFormatStyles.Medium);
		}

		/**
		 * This event gets fired when the input operation has finished and the value has changed.
		 *
		 * @name sap.m.TimePicker#change
		 * @event
		 * @param {sap.ui.base.Event} oControlEvent
		 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
		 * @param {object} oControlEvent.getParameters
		 * @param {string} oControlEvent.getParameters.value The new value of the input.
		 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid time.
		 * @public
		 */

		/**
		 * Fire event change to attached listeners.
		 *
		 * Expects following event parameters:
		 * <ul>
		 * <li>'value' of type <code>string</code> The new value of the input.</li>
		 * <li>'valid' of type <code>boolean</code> Indicator for a valid time.</li>
		 * </ul>
		 *
		 * @param {Map} [mArguments] the arguments to pass along with the event.
		 * @return {sap.m.TimePicker} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.m.TimePicker#fireChange
		 * @function
		 */

		return TimePicker;

}, /* bExport= */ true);
