/*!
 * ${copyright}
 */

// Provides control sap.m.ProgressIndicator.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new ProgressIndicator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Shows the progress of a process in a graphical way. To indicate the progress, the inside of the ProgressIndicator is filled with a color.
	 * Additionally, a user defined string can be displayed on the ProgressIndicator.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.13.1
	 * @alias sap.m.ProgressIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProgressIndicator = Control.extend("sap.m.ProgressIndicator", /** @lends sap.m.ProgressIndicator.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Invisible controls are not rendered
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * Switches enabled state of the control. Disabled fields have different colors, and can not be focused.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * The state of the bar. Enumeration sap.ui.core.ValueState provides Error (red), Warning (yellow), Success (green), None (blue) (default value).
			 */
			state : {type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * The text value to be displayed in the bar.
			 */
			displayValue : {type : "string", group : "Appearance", defaultValue : '0%'},
	
			/**
			 * The numerical value for the displayed length of the progress bar.
			 */
			percentValue : {type : "float", group : "Data", defaultValue : 0},
	
			/**
			 * Specifies whether the current value shall be rendered inside the bar.
			 */
			showValue : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * The width of the control.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
	
			/**
			 * The height of the control. The default value depends on the theme. Suggested size for normal use is 2.5rem (40px). Suggested size for small size (like for use in ObjectHeader) is 1.375rem (22px).
			 * @since 1.15.0
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	//sap.m.ProgressIndicator.prototype.init = function(){
	//   // do something for initialization...
	//};
	
	ProgressIndicator.prototype.onAfterRendering = function() {
		//if the user sets a height, this wins against everything else, therefore the styles have to be calculated and set here
		if (!!this.getHeight()) {
			var lineHeightText = this.$().height();
			this.$("textRight").css("line-height", lineHeightText + "px");
			this.$("textLeft").css("line-height", lineHeightText + "px");
		}
	};
	
	ProgressIndicator.prototype.setPercentValue = function(fPercentValue) {
	
		var that = this;
	
		// validation of fPercentValue
		if (typeof (fPercentValue) == "number") {
			if (!((fPercentValue >= 0) && (fPercentValue <= 100))) {
				jQuery.sap.log.error(this + ": percentValue (" + fPercentValue + ") is not correct! It has to be between 0-100.");
				return this;
			}
		}
	
		if (that.getPercentValue() != fPercentValue) {
			// animation without rerendering
			this.$().addClass("sapMPIAnimate");
			var time = Math.abs(that.getPercentValue() - fPercentValue) * 20;
			this.setProperty("percentValue", fPercentValue, true);
			var $Bar = this.$("bar");
			$Bar.animate({
				width : fPercentValue + "%"
			}, time, "linear", function() {
				that._setText.apply(that);
				that.$().removeClass("sapMPIAnimate");
			});
		}
	
		return this;
	};
	
	ProgressIndicator.prototype._setText = function() {
	
		this.$().toggleClass("sapMPIValueGreaterHalf", this.getPercentValue() > 50);
	
		return this;
	};
	
	ProgressIndicator.prototype.setDisplayValue = function(sDisplayValue) {
	
		// change of value without rerendering
		this.setProperty("displayValue", sDisplayValue, true);
		var $textLeft = this.$("textLeft");
		var $textRight = this.$("textRight");
		$textLeft.text(sDisplayValue);
		$textRight.text(sDisplayValue);
	
		return this;
	};

	return ProgressIndicator;

}, /* bExport= */ true);
