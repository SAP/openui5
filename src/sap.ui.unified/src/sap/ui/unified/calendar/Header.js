/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/unified/library'],
	function(jQuery, Control, LocaleData, library) {
	"use strict";

	/**
	 * Constructor for a new MonthPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a calendar header
	 * This is used inside the calendar. Not for stand alone usage
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Header = Control.extend("sap.ui.unified.calendar.Header", /** @lends sap.ui.unified.calendar.Header.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Text of the first button (normally month)
			 */
			textButton1 : {type : "string", group : "Misc"},

			/**
			 * aria-label of the first button (normally month)
			 */
			ariaLabelButton1 : {type : "string", group : "Misc"},

			/**
			 * Text of the second button (normally year)
			 */
			textButton2 : {type : "string", group : "Misc"},

			/**
			 * aria-label of the second button (normally year)
			 */
			ariaLabelButton2 : {type : "string", group : "Misc"},

			/**
			 * enables the previous button
			 */
			enabledPrevious : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * enables the Next button
			 */
			enabledNext : {type : "boolean", group : "Misc", defaultValue : true}

		},
		events : {

			/**
			 * previous button pressed
			 */
			pressPrevious : {},

			/**
			 * next button pressed
			 */
			pressNext : {},

			/**
			 * first button pressed (normally month)
			 */
			pressButton1 : {},

			/**
			 * second button pressed (normally year)
			 */
			pressButton2 : {}

		}
	}});

	(function() {

		Header.prototype.onAfterRendering = function(){

//			var that = this;

		};

		Header.prototype.setTextButton1 = function(sText){

			this.setProperty("textButton1", sText, true);

			if (this.getDomRef()) {
				this.$("B1").text(sText);
			}

		};

		Header.prototype.setAriaLabelButton1 = function(sText){

			this.setProperty("ariaLabelButton1", sText, true);

			if (this.getDomRef()) {
				if (sText) {
					this.$("B1").attr("aria-label", sText);
				} else {
					this.$("B1").removeAttr("aria-label");
				}
			}

		};

		Header.prototype.setTextButton2 = function(sText){

			this.setProperty("textButton2", sText, true);

			if (this.getDomRef()) {
				this.$("B2").text(sText);
			}

		};

		Header.prototype.setAriaLabelButton2 = function(sText){

			this.setProperty("ariaLabelButton2", sText, true);

			if (this.getDomRef()) {
				if (sText) {
					this.$("B2").attr("aria-label", sText);
				} else {
					this.$("B2").removeAttr("aria-label");
				}
			}

		};

		Header.prototype.setEnabledPrevious = function(bEnabled){

			this.setProperty("enabledPrevious", bEnabled, true);

			if (this.getDomRef()) {
				if (bEnabled) {
					this.$("prev").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
				}else {
					this.$("prev").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
				}
			}

		};

		Header.prototype.setEnabledNext = function(bEnabled){

			this.setProperty("enabledNext", bEnabled, true);

			if (this.getDomRef()) {
				if (bEnabled) {
					this.$("next").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
				}else {
					this.$("next").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
				}
			}

		};

		Header.prototype.onclick = function(oEvent){

			if (oEvent.isMarked("delayedMouseEvent") ) {
				return;
			}

			if (jQuery.sap.containsOrEquals(this.getDomRef("prev"), oEvent.target) && this.getEnabledPrevious()) {
				this.firePressPrevious();
			}	else if (jQuery.sap.containsOrEquals(this.getDomRef("next"), oEvent.target) && this.getEnabledNext()){
				this.firePressNext();
			} else if (oEvent.target.id == this.getId() + "-B1"){
				this.firePressButton1();
			} else if (oEvent.target.id == this.getId() + "-B2"){
				this.firePressButton2();
			}

		};

		Header.prototype.onsapnext = function(oEvent){

			//prevent browser scrolling
			oEvent.preventDefault();

		};

	}());

	return Header;

}, /* bExport= */ true);
