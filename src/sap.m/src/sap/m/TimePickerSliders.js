/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './TimePickerSlidersRenderer', './TimePickerSlider', './VisibleItem'],
	function (jQuery, Control, SlidersRenderer, TimePickerSlider, VisibleItem) {
		"use strict";

		/**
		 * Constructor for a new <code>TimePickerSliders</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker list container control used inside the {@link sap.m.TimePicker} to hold all the sliders.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.32
		 * @alias sap.m.TimePickerSliders
		 */
		var TimePickerSliders = Control.extend("sap.m.TimePickerSliders", /** @lends sap.m.TimePicker.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {

					/**
					 * Defines the time format.
					 *
					 * Corresponds to the <code>displayFormat</code> of the parent <code>sap.m.TimePicker</code> control.
					 */
					format: { name: "format", type: "string"},

					/**
					 * Defines the text of the picker label.
					 *
					 * It is read by screen readers. It is visible only on phone.
					 */
					labelText: {name: "labelText", type: "string"},

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
					 * Holds the inner sliders.
					 */
					_columns: { type: "sap.m.TimePickerSlider", multiple: true, visibility: "hidden" }
				},
				associations: {

					/**
					 * The time picker control that instantiated this sliders
					 */
					invokedBy: { type: "sap.m.TimePicker", multiple: false }
				}
			},
			renderer: SlidersRenderer.render
		});

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		TimePickerSliders.prototype.init = function () {
			//ToDo: //ToDo: This is inconsistent with the parent locale (if set). Add 'localeID' property to this control which will read its parent 'localeID' property
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				aPeriods = sap.ui.core.LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");

			this._fnLayoutChanged = jQuery.proxy(this._onOrientationChanged, this);
			sap.ui.Device.resize.attachHandler(this._fnLayoutChanged);

			this._sAM = aPeriods[0];
			this._sPM = aPeriods[1];
		};

		TimePickerSliders.prototype.exit = function () {
			this.$().off(!!sap.ui.Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			sap.ui.Device.resize.detachHandler(this._fnOrientationChanged);
		};

		TimePickerSliders.prototype.onAfterRendering = function() {
			this.$().off(!!sap.ui.Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			this.$().on(!!sap.ui.Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", jQuery.proxy(this._onmousewheel, this));

			if (!sap.ui.Device.browser.msie) {
				/* This method is called here prematurely to ensure slider loading on time.
				 * Make sure _the browser native focus_ is not actually set on the early call (the "true" param)
				 * because that fires events and results in unexpected behaviors */
				this._initFocus(true);
			}
		};

		/**
		 * Sets the <code>invokedBy</code> association, which is a link with the time picker that
		 * gives the display format.
		 *
		 * @param {string} sId The ID of the TimePicker control that owns this sliders
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 */
		TimePickerSliders.prototype.setInvokedBy = function(sId) {
			var oLocale,
				aPeriods,
				aColumns;

			this.setAssociation("invokedBy", sId);

			if (sap.ui.getCore().byId(sId)) {
				oLocale = new sap.ui.core.Locale(sap.ui.getCore().byId(sId).getLocaleId());
				aPeriods = sap.ui.core.LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");

				this._sAM = aPeriods[0];
				this._sPM = aPeriods[1];

				aColumns = this.getAggregation("_columns");

				if (aColumns) {
					this.destroyAggregation("_columns");
				}

				this._setupLists(this.getFormat());
			}

			return this;
		};

		/**
		 * Sets the text for the picker label.
		 *
		 * @param {string} sLabelText A text for the label
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setLabelText = function(sLabelText) {
			var $ContainerLabel;

			this.setProperty("labelText", sLabelText, true);

			if (!sap.ui.Device.system.desktop) {
				$ContainerLabel = jQuery(this.getDomRef("label"));
				if ($ContainerLabel) {
					$ContainerLabel.html(sLabelText);
				}
			}

			return this;
		};

		/**
		 * Sets the time format.
		 *
		 * @param {string} sFormat New display format
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setFormat = function (sFormat) {
			//ToDo add validation of the format before setting it
			this.setProperty("format", sFormat, true);
			var aColumns = this.getAggregation("_columns");

			if (aColumns) {
				this.destroyAggregation("_columns");
			}

			this._setupLists(sFormat);

			return this;
		};

		/**
		 * Sets the minutes slider step.
		 * @param iValue The step used to generate values for the minutes slider
		 * @returns {*} this
		 * @public
		 */
		TimePickerSliders.prototype.setMinutesStep = function(iValue) {
			this.setProperty("minutesStep", iValue, true);
			var aColumns = this.getAggregation("_columns");

			if (aColumns) {
				this.destroyAggregation("_columns");
			}

			this._setupLists(this.getFormat());

			return this;
		};

		/**
		 * Sets the seconds slider step.
		 * @param iValue The step used to generate values for the seconds slider
		 * @returns {*} this
		 * @public
		 */
		TimePickerSliders.prototype.setSecondsStep = function(iValue) {
			this.setProperty("secondsStep", iValue, true);
			var aColumns = this.getAggregation("_columns");

			if (aColumns) {
				this.destroyAggregation("_columns");
			}

			this._setupLists(this.getFormat());

			return this;
		};

		/**
		 * Gets the time values from the sliders, as a date object.
		 *
		 * @returns {Object} A JavaScript date object
		 * @public
		 */
		TimePickerSliders.prototype.getTimeValues = function () {
			var oCore = sap.ui.getCore(),
				oListHours = oCore.byId(this.getId() + "-listHours"),
				oListMinutes = oCore.byId(this.getId() + "-listMins"),
				oListSeconds = oCore.byId(this.getId() + "-listSecs"),
				oListAmPm = oCore.byId(this.getId() + "-listFormat"),
				iHours = null,
				sAmpm = null,
				oDateValue = new Date();

			if (oListHours) {
				iHours = parseInt(oListHours.getSelectedValue(), 10);
			}

			if (oListAmPm) {
				sAmpm = oListAmPm.getSelectedValue();
			}

			if (sAmpm === "am" && iHours === 12) {
				iHours = 0;
			} else if (sAmpm === "pm" && iHours !== 12) {
				iHours += 12;
			}

			if (iHours !== null) {
				oDateValue.setHours(iHours.toString());
			}

			if (oListMinutes) {
				oDateValue.setMinutes(oListMinutes.getSelectedValue());
			}

			if (oListSeconds) {
				oDateValue.setSeconds(oListSeconds.getSelectedValue());
			}

			return oDateValue;
		};

		/**
		 * Sets the values of the slider controls, given a JavaScript date object.
		 *
		 * @param {Object} oDate The date to use as a setting, if not provided the current date will be used
		 * @public
		 */
		TimePickerSliders.prototype.setTimeValues = function (oDate) {
			var oCore = sap.ui.getCore(),
				oListHours = oCore.byId(this.getId() + "-listHours"),
				oListMinutes = oCore.byId(this.getId() + "-listMins"),
				oListSeconds = oCore.byId(this.getId() + "-listSecs"),
				oListAmPm = oCore.byId(this.getId() + "-listFormat"),
				iHours,
				sAmPm = null;

			oDate = oDate || new Date();
			iHours = oDate.getHours();

			if (oListAmPm) {
				//ToDo: Replace this hardcoded values with their translated text in order to have UI API value consistency
				sAmPm = iHours >= 12 ? "pm" : "am";
				iHours = (iHours > 12) ? iHours - 12 : iHours;
				iHours = (iHours === 0 ? 12 : iHours);
			}

			oListHours && oListHours.setSelectedValue(iHours.toString());
			oListMinutes && oListMinutes._updateStepAndValue(oDate.getMinutes(), this.getMinutesStep());
			oListSeconds && oListSeconds._updateStepAndValue(oDate.getSeconds(), this.getSecondsStep());
			oListAmPm && oListAmPm.setSelectedValue(sAmPm);
		};

		/**
		 * Collapses all the slider controls.
		 *
		 * @public
		 */
		TimePickerSliders.prototype.collapseAll = function () {
			//collapse the expanded sliders
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for ( var iIndex = 0; iIndex < aSliders.length; iIndex++) {
					if (aSliders[iIndex].getIsExpanded()) {
						aSliders[iIndex].setIsExpanded(false);
					}
				}
			}
		};

		/**
		 * Updates the values of all slider controls.
		 *
		 * @public
		 */
		TimePickerSliders.prototype.updateSlidersValues = function () {
			//collapse the expanded slider
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for ( var iIndex = 0; iIndex < aSliders.length; iIndex++) {
					aSliders[iIndex]._updateScroll(); //updates scroll position if needed
				}
			}
		};

		/**
		 * Handles the home key event.
		 *
		 * Focuses the first slider control.
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerSliders.prototype.onsaphome = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				this.getAggregation("_columns")[0].focus();
			}
		};

		/**
		 * Handles the end key event.
		 *
		 * Focuses the last slider control.
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerSliders.prototype.onsapend = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				var aSliders = this.getAggregation("_columns");
				aSliders[aSliders.length - 1].focus();
			}
		};

		/**
		 * Handles the left arrow key event.
		 *
		 * Focuses the previous slider control.
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerSliders.prototype.onsapleft = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getAggregation("_columns");

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex > 0 ? iCurrentSliderIndex - 1 : aSliders.length - 1;
				aSliders[iNextIndex].focus();
			}
		};

		/**
		 * Handles the right arrow key event.
		 *
		 * Focuses the next slider control.
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerSliders.prototype.onsapright = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getAggregation("_columns");

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex < aSliders.length - 1 ? iCurrentSliderIndex + 1 : 0;
				aSliders[iNextIndex].focus();
			}
		};

		/**
		 * Handles the mouse scroll event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerSliders.prototype._onmousewheel = function(oEvent) {
			var currentSlider = this._getCurrentSlider();

			if (currentSlider) {
				currentSlider._onmousewheel(oEvent);
			}
		};

		/**
		 * Handles the orientation change event.
		 *
		 * @private
		 */
		TimePickerSliders.prototype._onOrientationChanged = function() {
			var aSliders = this.getAggregation("_columns");

			if (!aSliders) {
				return;
			}

			for ( var i = 0; i < aSliders.length; i++) {
				if (aSliders[i].getIsExpanded()) {
					aSliders[i]._updateSelectionFrameLayout();
				}
			}
		};

		/**
		 * Focuses the first slider control.
		 *
		 * @param {boolean} bSkipDesktopFocus Indicates whether the focus event is fired on the desktop platform
		 * @private
		 */
		TimePickerSliders.prototype._initFocus = function(bSkipDesktopFocus) {
			// the focus is supposed to trigger setIsExpanded(true) for the desktop
			if (sap.ui.Device.system.desktop && !bSkipDesktopFocus) {
				this.getAggregation("_columns")[0].focus();
			} else {
				this.getAggregation("_columns")[0].setIsExpanded(true);
			}
		};

		/**
		 * Generates the sliders' control values in the provided number range.
		 *
		 * @param {number} iFrom Starting number
		 * @param {number} iTo Ending number
		 * @param {number} bLeadingZeroes Whether to add leading zeroes to number values
		 * @returns {array} Array of key/value pairs
		 * @private
		 */
		TimePickerSliders.prototype._generatePickerListValues = function (iFrom, iTo, iStep, bLeadingZeroes) {
			var aValues = [],
				sText;

			for (var iIndex = iFrom; iIndex <= iTo; iIndex += 1) {
				if (iIndex < 10 && bLeadingZeroes) {
					sText = "0" + iIndex.toString();
				} else {
					sText = iIndex.toString();
				}

				var oItem = new VisibleItem({
					key: iIndex.toString(),
					text: sText
				});

				if (iIndex % iStep !== 0) {
					oItem.setVisible(false);
				}

				aValues.push(oItem);
			}

			return aValues;
		};

		/**
		 * Creates the sliders of the picker based on the <code>format</code>.
		 *
		 * @param {string} sFormat Display format
		 * @private
		 */
		TimePickerSliders.prototype._setupLists = function (sFormat) {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				sLabelHours = oRb.getText("TIMEPICKER_LBL_HOURS"),
				sLabelMinutes = oRb.getText("TIMEPICKER_LBL_MINUTES"),
				sLabelSeconds = oRb.getText("TIMEPICKER_LBL_SECONDS"),
				//ToDo This value will be always "AM/PM" due to bad translation string. Consider replacing it with something like this._sAM + / + this._sPM
				sLabelAMPM = oRb.getText("TIMEPICKER_LBL_AMPM"),
				iMinutesStep = this.getMinutesStep(),
				iSecondsStep = this.getSecondsStep();

			if (sFormat === undefined) {
				return;
			}

			var bHours = false, bHoursTrailingZero = false, iFrom, iTo;

			if (sFormat.indexOf("HH") !== -1) {
				bHours = true;
				iFrom = 0;
				iTo = 23;
				bHoursTrailingZero = true;
			} else if (sFormat.indexOf("H") !== -1) {
				bHours = true;
				iFrom = 0;
				iTo = 23;
			} else if (sFormat.indexOf("hh") !== -1) {
				bHours = true;
				iFrom = 1;
				iTo = 12;
				bHoursTrailingZero = true;
			} else if (sFormat.indexOf("h") !== -1) {
				bHours = true;
				iFrom = 1;
				iTo = 12;
			}

			if (bHours) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listHours", {
					items: this._generatePickerListValues(iFrom, iTo, 1, bHoursTrailingZero),
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelHours
				}));
			}

			if (sFormat.indexOf("m") !== -1) {
				var aValues = this._generatePickerListValues(0, 59, iMinutesStep, true);

				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listMins", {
					items: aValues,
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelMinutes
				}));
			}

			if (sFormat.indexOf("s") !== -1) {
				var aValues = this._generatePickerListValues(0, 59, iSecondsStep, true);
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listSecs", {
					items: aValues,
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelSeconds
				}));
			}

			if (sFormat.indexOf("a") !== -1) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listFormat", {
					items: [
						{ key: "am", text: this._sAM },
						{ key: "pm", text: this._sPM }
					],
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelAMPM,
					isCyclic: false
				}).addStyleClass("sapMTimePickerSliderShort"));
			}

			this.getAggregation("_columns")[0].setIsExpanded(true);

			/**
			 * Default expanded handler
			 * @param {jQuery.Event} oEvent  Event object
			 */
			function onSliderExpanded(oEvent) {
				var aSliders = this.getAggregation("_columns");

				for (var i = 0; i < aSliders.length; i++) {
					if (aSliders[i] !== oEvent.oSource && aSliders[i].getIsExpanded()) {
						aSliders[i].setIsExpanded(false);
					}
				}
			}
		};

		/**
		 * Gets the currently expanded slider control.
		 *
		 * @returns {sap.m.TimePickerSlider|null} Currently expanded slider control or null if there is none
		 */
		TimePickerSliders.prototype._getCurrentSlider = function() {
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for (var i = 0; i < aSliders.length; i++) {
					if (aSliders[i].getIsExpanded()) {
						return aSliders[i];
					}
				}
			}

			return null;
		};

		return TimePickerSliders;
	}, /* bExport= */ false);
