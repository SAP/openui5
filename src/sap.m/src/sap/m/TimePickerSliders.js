/*!
/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './TimePickerSlidersRenderer', './TimePickerSlider'],
	function (jQuery, Control, SlidersRenderer, TimePickerSlider) {
		"use strict";

		/**
		 * Constructor for a new TimePickerSliders.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * TimePickerSliders is a picker list container control used inside the TimePicker to hold all the sliders
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.32
		 * @alias sap.m.TimePickerSlider
		 */
		var TimePickerSliders = Control.extend("sap.m.TimePickerSliders", /** @lends sap.m.TimePicker.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {

					/**
					 * This property corresponds to the displayFormat of the parent TimePicker control.
					 */
					format: { name: "format", type: "string"},

					/**
					 * This property displays the text of the general picker label and is read by screen readers.
					 * It is visible only on phone.
					 */
					labelText: {name: "labelText", type: "string"}
				},
				aggregations: {

					/**
					 * Internal aggregation to hold the inner sliders.
					 */
					_columns: { type: "sap.m.TimePickerSlider", multiple: true, visibility: "hidden" }
				}
			},
			renderer: SlidersRenderer.render
		});

		/**
		 * Initialize
		 * @public
		 */
		TimePickerSliders.prototype.init = function () {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				aPeriods = sap.ui.core.LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");

			this._fnOrientationChanged = jQuery.proxy(this._onOrientationChanged, this);
			sap.ui.Device.resize.attachHandler(this._fnOrientationChanged);

			this._sAM = aPeriods[0];
			this._sPM = aPeriods[1];
		};

		/**
		 * Exit function
		 * @public
		 */
		TimePickerSliders.prototype.exit = function () {
			sap.ui.Device.resize.detachHandler(this._fnOrientationChanged);
		};

		/**
		 * Handles the after rendering event
		 * @public
		 */
		TimePickerSliders.prototype.onAfterRendering = function() {
			if (sap.ui.Device.browser.name !== "ie") {
				/* This method is called here prematurely to ensure slider loading on time.
				 * Make sure _the browser native focus_ is not actually set on the early call (the "true" param)
				 * because that fires events and results in unexpected behaviors */
				this._initFocus(true);
			}
		};

		/***********************************************************************
		 **************************** Public methods ***************************
		 ***********************************************************************/

		TimePickerSliders.prototype.setLabelText = function(sLabelText) {
			var $ContainerLabel;

			this.setProperty("labelText", sLabelText, true);

			if (!sap.ui.Device.system.desktop) {
				$ContainerLabel = jQuery(this.getDomRef("label"));
				if ($ContainerLabel) {
					$ContainerLabel.html(sLabelText);
				}
			}
		};

		/**
		 * Overrides the format setter
		 * @param sFormat {string} New display format
		 */
		TimePickerSliders.prototype.setFormat = function (sFormat) {
			//ToDo add validation of the format before setting it
			this.setProperty("format", sFormat, true);
			var aColumns = this.getAggregation("_columns");

			if (aColumns) {
				this.destroyAggregation("_columns");
			}

			this._setupLists(sFormat);
		};

		/**
		 * Gets the time values from the TimePickerSlider controls
		 * @returns {Object} a JS date object
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
		 * Sets the values of the TimePickerSlider controls given a JS date object.
		 * @param oDate {Object} The date to use as a setting. If not provided the current date will be used.
		 * @public
		 */
		TimePickerSliders.prototype.setTimeValues = function (oDate) {
			var oCore = sap.ui.getCore(),
				oListHours = oCore.byId(this.getId() + "-listHours"),
				oListMinutes = oCore.byId(this.getId() + "-listMins"),
				oListSeconds = oCore.byId(this.getId() + "-listSecs"),
				oListAmPm = oCore.byId(this.getId() + "-listFormat"),
				iHours,
				sAmpm = null;

			oDate = oDate || new Date();
			iHours = oDate.getHours();

			if (oListAmPm) {
				sAmpm = iHours >= 12 ? "pm" : "am";
				iHours = (iHours > 12) ? iHours - 12 : iHours;
				iHours = (iHours === 0 ? 12 : iHours);
			}

			oListHours && oListHours.setSelectedValue(iHours.toString());
			oListMinutes && oListMinutes.setSelectedValue(oDate.getMinutes().toString());
			oListSeconds && oListSeconds.setSelectedValue(oDate.getSeconds().toString());
			oListAmPm && oListAmPm.setSelectedValue(sAmpm);
		};

		/**
		 * Collapses all TimePickerSlider controls
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
		 * Updates values of all TimePickerSlider controls
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

		/***********************************************************************
		 **************************** Keyboard handling ************************
		 ***********************************************************************/

		/**
		 * Handles home event - focuses the first TimePickerSlider control
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePickerSliders.prototype.onsaphome = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				this.getAggregation("_columns")[0].focus();
			}
		};

		/**
		 * Handles end event - focuses the last TimePickerSlider control
		 * @param oEvent {jQuery.Event} Event object
		 */
		TimePickerSliders.prototype.onsapend = function(oEvent) {
			var oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				var aSliders = this.getAggregation("_columns");
				aSliders[aSliders.length - 1].focus();
			}
		};

		/**
		 * Handles the left arrow event - focuses the previous TimePickerSlider control
		 * @param oEvent {jQuery.Event} Event object
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
		 * Handles the right arrow event - focuses the next TimePickerSlider control
		 * @param oEvent {jQuery.Event} Event object
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

		/************************************************************************
		 **************************** Private methods ***************************
		 ************************************************************************/

		/**
		 * Handles orientation change event
		 * @private
		 */
		TimePickerSliders.prototype._onOrientationChanged = function() {
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for ( var i = 0; i < aSliders.length; i++) {
					if (aSliders[i].getIsExpanded()) {
						aSliders[i]._updateSelectionFrameLayout();
					}
				}
			}
		};

		/**
		 * Initializes the focus to be on the first TimePickerSlider control
		 * @bSkipDesktopFocus {boolean} Should the focus event be fired on the desktop platform
		 *  @private
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
		 * Generates the TimePickerSlider control values in the provided number range.
		 * @private
		 * @param iFrom {number} Starting number
		 * @param iTo {number} Ending number
		 * @param bTrailingZeroes {number} Whether to add trailing zeroes to number values
		 * @returns {array} Item key/value pairs
		 */
		TimePickerSliders.prototype._generatePickerListValues = function (iFrom, iTo, bTrailingZeroes) {
			var aValues = [],
				sText;

			for (var iIndex = iFrom; iIndex <= iTo; iIndex++) {
				if (iIndex < 10 && bTrailingZeroes) {
					sText = "0" + iIndex.toString();
				} else {
					sText = iIndex.toString();
				}

				aValues.push({key: iIndex.toString(), text: sText});
			}

			return aValues;
		};

		/**
		 * Creates the UI of the picker based on its format.
		 * @private
		 * @param sFormat {string} Display format
		 */
		TimePickerSliders.prototype._setupLists = function (sFormat) {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				sLabelHours = oRb.getText("TIMEPICKER_LBL_HOURS"),
				sLabelMinutes = oRb.getText("TIMEPICKER_LBL_MINUTES"),
				sLabelSeconds = oRb.getText("TIMEPICKER_LBL_SECONDS"),
				sLabelAMPM = oRb.getText("TIMEPICKER_LBL_AMPM");

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
					items: this._generatePickerListValues(iFrom, iTo, bHoursTrailingZero),
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelHours
				}));
			}

			if (sFormat.indexOf("m") !== -1) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listMins", {
					items: this._generatePickerListValues(0, 59, true),
					expanded: jQuery.proxy(onSliderExpanded, this),
					label: sLabelMinutes
				}));
			}

			if (sFormat.indexOf("s") !== -1) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listSecs", {
					items: this._generatePickerListValues(0, 59, true),
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
			 * @param oEvent {jQuery.Event} Event object
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
		 * Gets the expanded TimePickerSlider control
		 * @returns {sap.m.TimePickerSlider|null} Currently expanded TimePickerSlider control
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
