/*!
 * ${copyright}
 */

// Provides control sap.m.ProgressIndicator.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/library',
	'./ProgressIndicatorRenderer'
],
	function(
	jQuery,
	library,
	Control,
	ValueStateSupport,
	coreLibrary,
	ProgressIndicatorRenderer
	) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	/**
	 * Constructor for a new ProgressIndicator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Shows the progress of a process in a graphical way. To indicate the progress, the inside of the ProgressIndicator is filled with a color.
	 * Additionally, a user-defined string can be displayed on the ProgressIndicator.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/progress-indicator/ Progress Indicator}
	 *
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

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		properties : {
			/**
			 * Switches enabled state of the control. Disabled fields have different colors, and cannot be focused.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the state of the bar. Enumeration sap.ui.core.ValueState provides Error (red), Warning (yellow), Success (green), None (blue) (default value).
			 */
			state : {type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : ValueState.None},

			/**
			 * Specifies the text value to be displayed in the bar.
			 */
			displayValue : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Specifies the numerical value in percent for the length of the progress bar.
			 *
			 * <b>Note:</b> If a value greater than 100 is provided, the <code>percentValue</code> is set to 100.
			 * In other cases of invalid value, <code>percentValue</code> is set to its default of 0.
			 */
			percentValue : {type : "float", group : "Data", defaultValue : 0},

			/**
			 * Indicates whether the displayValue should be shown in the ProgressIndicator.
			 */
			showValue : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Specifies the width of the control.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

			/**
			 * Specifies the height of the control. The default value depends on the theme. Suggested size for normal use is 2.5rem (40px). Suggested size for small size (like for use in ObjectHeader) is 1.375rem (22px).
			 * @since 1.15.0
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Specifies the element's text directionality with enumerated options (RTL or LTR). By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Determines whether the control is in display-only state where the control has different visualization and cannot be focused.
			 * @since 1.50
			 */
			displayOnly : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		designtime: "sap/m/designtime/ProgressIndicator.designtime"
	}});

	var bUseAnimations = sap.ui.getCore().getConfiguration().getAnimation();

	ProgressIndicator.prototype.setPercentValue = function(fPercentValue) {
		var that = this,
			$progressBar,
			fPercentDiff,
			$progressIndicator = this.$(),
			fAnimationDuration,
			fNotValidValue;

		fPercentValue = this.validateProperty("percentValue", fPercentValue);

		if (!isValidPercentValue(fPercentValue)) {
			fNotValidValue = fPercentValue;
			fPercentValue = fPercentValue > 100 ? 100 : 0;
			jQuery.sap.log.warning(this + ": percentValue (" + fNotValidValue + ") is not correct! Setting the percentValue to " + fPercentValue);
		}

		if (this.getPercentValue() !== fPercentValue) {
			fPercentDiff = this.getPercentValue() - fPercentValue;
			this.setProperty("percentValue", fPercentValue, true);

			if (!$progressIndicator.length) {
				return this;
			}

			["sapMPIValueMax", "sapMPIValueMin", "sapMPIValueNormal", "sapMPIValueGreaterHalf"].forEach(function (sClass){
				$progressIndicator.removeClass(sClass);
			});

			$progressIndicator.addClass(this._getCSSClassByPercentValue(fPercentValue));
			$progressIndicator.addClass("sapMPIAnimate")
				.attr("aria-valuenow", fPercentValue)
				.attr("aria-valuetext", this._getAriaValueText({fPercent: fPercentValue}));

			fAnimationDuration = bUseAnimations ? Math.abs(fPercentDiff) * 20 : 0;
			$progressBar = this.$("bar");
			// Stop currently running animation and start new one.
			// In case of multiple setPercentValue calls all animations will run and it will take some time until the last value is animated,
			// which is the one, actually valuable.
			$progressBar.stop();
			$progressBar.animate({
				"flex-basis" : fPercentValue + "%"
			}, fAnimationDuration, "linear", function() {
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
		this.$().attr("aria-valuetext", this._getAriaValueText({sText: sDisplayValue}));

		return this;
	};

	ProgressIndicator.prototype.setDisplayOnly = function(bDisplayOnly) {
		// change of value without re-rendering
		this.setProperty("displayOnly", bDisplayOnly, true);
		if (this.getDomRef()) {
			this.$().toggleClass("sapMPIDisplayOnly", bDisplayOnly);
		}
		return this;
	};

	/**
	 * Determines the CSS class, which should be applied to the <code>ProgressIndicator</code>
	 * for the given <code>percentValue</code>.
	 * @param {Number} fPercentValue
	 * @return {String} the CSS class
	 * @since 1.44
	 * @private
	 */
	ProgressIndicator.prototype._getCSSClassByPercentValue = function(fPercentValue) {
		if (fPercentValue === 100) {
			return "sapMPIValueMax sapMPIValueGreaterHalf";
		}

		if (fPercentValue === 0) {
			return "sapMPIValueMin";
		}

		if (fPercentValue <= 50) {
			return "sapMPIValueNormal";
		}

		return "sapMPIValueNormal sapMPIValueGreaterHalf";
	};

	ProgressIndicator.prototype._getAriaValueText = function (oParams) {
		oParams.sText = oParams.sText || this.getDisplayValue();
		oParams.fPercent = oParams.fPercent || this.getPercentValue();
		oParams.sStateText = oParams.sStateText || this._getStateText();

		var sAriaValueText = oParams.sText || oParams.fPercent + "%";
		if (oParams.sStateText) {
			sAriaValueText += " " + oParams.sStateText;
		}

		return sAriaValueText;
	};

	ProgressIndicator.prototype._getStateText = function () {
		return ValueStateSupport.getAdditionalText(this.getState());
	};

	/**
	 * Returns the <code>sap.m.ProgressIndicator</code>  accessibility information.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {object} The <code>sap.m.ProgressIndicator</code> accessibility information
	 */
	ProgressIndicator.prototype.getAccessibilityInfo = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return {
			role: "progressbar",
			type: oBundle.getText("ACC_CTR_TYPE_PROGRESS"),
			description: oBundle.getText("ACC_CTR_STATE_PROGRESS", [this.getPercentValue()]),
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
	};

	function isValidPercentValue(value) {
		return value >= 0 && value <= 100;
	}

	return ProgressIndicator;

});
