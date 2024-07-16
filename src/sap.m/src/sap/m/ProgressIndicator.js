/*!
 * ${copyright}
 */

// Provides control sap.m.ProgressIndicator.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Icon',
	"sap/ui/core/Lib",
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/library',
	'./ProgressIndicatorRenderer',
	"sap/base/Log",
	"sap/m/Popover",
	"sap/m/Text"
],
	function(
		library,
		Control,
		Icon,
		Library,
		ResizeHandler,
		ValueStateSupport,
		coreLibrary,
		ProgressIndicatorRenderer,
		Log,
		Popover,
		Text
	) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

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
	 */
	var ProgressIndicator = Control.extend("sap.m.ProgressIndicator", /** @lends sap.m.ProgressIndicator.prototype */ {
		metadata : {

			interfaces : ["sap.ui.core.IFormContent"],
			library : "sap.m",
			properties : {
				/**
				 * Switches enabled state of the control. Disabled fields have different colors, and cannot be focused.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Specifies the state of the bar. Enumeration sap.ui.core.ValueState provides Error, Warning, Success, Information, None (default value).
				 * The color for each state depends on the theme.
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
				displayOnly : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Determines whether a percentage change is displayed with animation.
				 * @since 1.73
				 */
				displayAnimation : {type : "boolean", group : "Behavior", defaultValue : true}
			},
			aggregations: {
				_popover: {type: "sap.m.Popover", multiple: false, visibility: "hidden"}
			},
			associations : {
				/**
				 * Association to controls / IDs which describe this control (see WAI-ARIA attribute aria-describedby).
				 * @since 1.69
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledBy).
				 * @since 1.69
				 */
				ariaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			designtime: "sap/m/designtime/ProgressIndicator.designtime"
		},

		renderer: ProgressIndicatorRenderer
	});

	ProgressIndicator.RESIZE_HANDLER_ID = {
		SELF: "_sResizeHandlerId"
	};

	ProgressIndicator.prototype.init = function () {
		this._bIEBrowser = false;

		// The difference between the old and new values, used to calulate the animation duration
		this._fPercentValueDiff = 0;
	};

	ProgressIndicator.prototype.onBeforeRendering = function () {
		this._deRegisterResizeHandler(ProgressIndicator.RESIZE_HANDLER_ID.SELF);
	};

	ProgressIndicator.prototype.onAfterRendering = function () {
		this._updateHoverableScenario();
		this._registerResizeHandler(ProgressIndicator.RESIZE_HANDLER_ID.SELF, this, this._onResize.bind(this));
	};

	ProgressIndicator.prototype.exit = function () {
		if (this._oPopoverText) {
			this._oPopoverText.destroy();
			this._oPopoverText = null;
		}

		this._deRegisterResizeHandler(ProgressIndicator.RESIZE_HANDLER_ID.SELF);
	};

	/**
	 * Registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @param {Object} oObject
	 * @param {Function} fnHandler
	 * @private
	 */
	ProgressIndicator.prototype._registerResizeHandler = function (sHandler, oObject, fnHandler) {
		if (!this[sHandler]) {
			this[sHandler] = ResizeHandler.register(oObject, fnHandler);
		}
	};

	/**
	 * De-registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @private
	 */
	ProgressIndicator.prototype._deRegisterResizeHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}
	};

	/**
	 * Handles the resize event of the <code>ProgressIndicator</code>.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ProgressIndicator.prototype._onResize = function (oEvent) {
		this._updateHoverableScenario();
	};

	/**
	 * Handles the start of <code>ProgressIndicator</code> press event and marks the event as handled
	 * by <code>ProgressIndicator</code> to prevent event bubbling when the information popover should be opened.
	 * @param {jQuery.Event} oEvent The <code>tap</code> event object
	 * @private
	 */
	ProgressIndicator.prototype.ontouchstart = function (oEvent) {
		if (this._isHoverable()) {
			oEvent.setMarked();
		}
	};

	/**
	 * Handles the <code>ProgressIndicator</code> press event.
	 * @param {jQuery.Event} oEvent The <code>tap</code> event object
	 */
	ProgressIndicator.prototype.ontap = function (oEvent) {
		var oPopover;

		// By UX in ordeer to open the helper popover, we should have
		// displayValue text and the text should be truncated (hoverable scenario).
		if (this._isHoverable()) {
			oPopover = this._getPopover();
			if (oPopover.isOpen()) {
				oPopover.close();
			} else {
				oPopover.openBy(this);
			}
		}
	};

	ProgressIndicator.prototype.setShowValue = function (bShowValue) {
		this.toggleStyleClass("sapMPINoValue", !bShowValue);

		return this.setProperty("showValue", bShowValue);
	};

	/**
	 * Updates the hoverable scenario.
	 * If we have a hoverable scenario we toggle on the "sapMPIHoverable" CSS class and vice-versa.
	 * @private
	 */
	ProgressIndicator.prototype._updateHoverableScenario = function () {
		var oDOMPIDisplayValueText = this.$(this.getPercentValue() > 50 ? "textLeft" : "textRight")[0],
			iOffsetWidth = oDOMPIDisplayValueText && oDOMPIDisplayValueText.offsetWidth,
			iScrollWidth = oDOMPIDisplayValueText && oDOMPIDisplayValueText.scrollWidth;

		// TODO: IE specific code - adding 1px tolerance, because of a know issue with difference b/w offsetWidth and scrollWidth
		if (this._bIEBrowser) {
			iOffsetWidth += 1;
		}

		// By VD if we have displayValue text and the text is truncated, we
		// need to change the cursor of the ProgressIndicator to "pointer" on hover.
		this.toggleStyleClass("sapMPIHoverable", this.getDisplayValue() !== "" && iOffsetWidth < iScrollWidth);
	};

	/**
	 * Whether or not the ProgressIndicator is hoverable.
	 * @returns {boolean} True if ProgressIndicator has "sapMPIHoverable" CSS class.
	 * @private
	 */
	ProgressIndicator.prototype._isHoverable = function () {
		return this.hasStyleClass("sapMPIHoverable");
	};

	/**
	 * Lazy loader for the popover.
	 * @returns {sap.m.Popover}
	 * @private
	 */
	ProgressIndicator.prototype._getPopover = function () {
		var oPopover;

		if (!this.getAggregation("_popover")) {
			this._oPopoverText = new Text({
				text: this.getDisplayValue()
			});
			// Create the Popover
			oPopover = new Popover(this.getId() + "-popover", {
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [this._oPopoverText,
					new Icon({
						src: "sap-icon://decline",
						press: this._onPopoverCloseIconPress.bind(this)
					})
				]
			}).addStyleClass('sapMPIPopover');

			this.setAggregation("_popover", oPopover, true);
		}

		return this.getAggregation("_popover");
	};

	ProgressIndicator.prototype._onPopoverCloseIconPress = function() {
		this._getPopover().close();
	};

	ProgressIndicator.prototype.setDisplayValue = function(sDisplayValue) {
		this.setProperty("displayValue", sDisplayValue);

		if (this._oPopoverText) {
			this._oPopoverText.setText(sDisplayValue);
		}

		return this;
	};

	ProgressIndicator.prototype.setPercentValue = function(fPercentValue) {
		var that = this,
			oProgressIndicatorDomRef = this.getDomRef(),
			fOriginalValue = fPercentValue;

		fPercentValue = parseFloat(fPercentValue);

		if (!isValidPercentValue(fPercentValue)) {
			if (fPercentValue > 100) {
				fPercentValue = 100;
			} else if (fPercentValue < 0) {
				fPercentValue = 0;
			} else {
				Log.warning(this + ": percentValue (" + fOriginalValue + ") is not a valid number! The provided value will not be set!");
				return this;
			}
			Log.warning(this + ": percentValue (" + fOriginalValue + ") is not correct! Setting the percentValue to " + fPercentValue);
		}

		if (this.getPercentValue() !== fPercentValue) {
			this._fPercentValueDiff = this.getPercentValue() - fPercentValue;
			this.setProperty("percentValue", fPercentValue);

			["sapMPIValueMax", "sapMPIValueMin", "sapMPIValueNormal", "sapMPIValueGreaterHalf"].forEach(function (sClass){
				that.removeStyleClass(sClass);
			});

			this.addStyleClass(this._getCSSClassByPercentValue(fPercentValue).join(" "));

			if (!oProgressIndicatorDomRef) {
				return this;
			}

			oProgressIndicatorDomRef.setAttribute("aria-valuenow", fPercentValue);
			oProgressIndicatorDomRef.setAttribute("aria-valuetext", this._getAriaValueText({fPercent: fPercentValue}));

			this._setText();
		}

		return this;
	};

	ProgressIndicator.prototype._setText = function() {
		this.toggleStyleClass("sapMPIValueGreaterHalf", this.getPercentValue() > 50);
		return this;
	};

	/**
	 * Determines the CSS class, which should be applied to the <code>ProgressIndicator</code>
	 * for the given <code>percentValue</code>.
	 * @param {number} fPercentValue
	 * @return {string} the CSS class
	 * @since 1.44
	 * @private
	 */
	ProgressIndicator.prototype._getCSSClassByPercentValue = function(fPercentValue) {
		if (fPercentValue === 100) {
			return ["sapMPIValueMax", "sapMPIValueGreaterHalf"];
		}

		if (fPercentValue === 0) {
			return ["sapMPIValueMin"];
		}

		if (fPercentValue <= 50) {
			return ["sapMPIValueNormal"];
		}

		return ["sapMPIValueNormal", "sapMPIValueGreaterHalf"];
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
		return this.getEnabled() ? ValueStateSupport.getAdditionalText(this.getState()) : "";
	};

	/**
	 * Returns the <code>sap.m.ProgressIndicator</code> accessibility information.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {sap.ui.core.AccessibilityInfo}
	 * The object contains the accessibility information of <code>sap.m.ProgressIndicator</code>
	 */
	ProgressIndicator.prototype.getAccessibilityInfo = function() {
		var oBundle = Library.getResourceBundleFor("sap.m"),
			sDisplayValue = this.getDisplayValue(),
			sDescription = sDisplayValue ? sDisplayValue : oBundle.getText("ACC_CTR_STATE_PROGRESS", [this.getPercentValue()]);

		return {
			role: "progressbar",
			type: oBundle.getText("ACC_CTR_TYPE_PROGRESS"),
			description: sDescription,
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
	};

	function isValidPercentValue(value) {
		return !isNaN(value) && value >= 0 && value <= 100;
	}

	return ProgressIndicator;

});