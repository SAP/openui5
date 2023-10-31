/*!
 * ${copyright}
 */

// Provides element sap.m.FlexItemData
sap.ui.define(["./FlexBoxStylingHelper", "./library", "sap/ui/core/LayoutData"],
 function(FlexBoxStylingHelper, library, LayoutData) {
	"use strict";

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.FlexAlignSelf
	var FlexAlignSelf = library.FlexAlignSelf;

	/**
	 * Constructor for a new <code>sap.m.FlexItemData</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element.
	 *
	 * @class
	 * Holds layout data for a FlexBox / HBox / VBox.
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FlexItemData
	 */
	var FlexItemData = LayoutData.extend("sap.m.FlexItemData", /** @lends sap.m.FlexItemData.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Determines cross-axis alignment of individual element.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#align-items-property
			 */
			alignSelf : {type : "sap.m.FlexAlignSelf", group : "Misc", defaultValue : FlexAlignSelf.Auto},

			/**
			 * Determines the display order of flex items independent of their source code order.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#order-property
			 */
			order : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Determines the flexibility of the flex item when allocatable space is remaining.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-grow-property
			 */
			growFactor : {type : "float", group : "Misc", defaultValue : 0},

			/**
			 * The shrink factor determines how much the flex item will shrink relative to the rest of the flex items in the flex container when negative free space is distributed.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-shrink-property
			 *
			 * @since 1.24.0
			 */
			shrinkFactor : {type : "float", group : "Misc", defaultValue : 1},

			/**
			 * The base size is the initial main size of the item for the flex algorithm. If set to "auto", this will be the computed size of the item.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-basis-property
			 *
			 * @since 1.32.0
			 */
			baseSize : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "auto"},

			/**
			 * The minimum height of the flex item.
			 * @since 1.36.0
			 */
			minHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "auto"},

			/**
			 * The maximum height of the flex item.
			 * @since 1.36.0
			 */
			maxHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ""},

			/**
			 * The minimum width of the flex item.
			 * @since 1.36.0
			 */
			minWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "auto"},

			/**
			 * The maximum width of the flex item.
			 * @since 1.36.0
			 */
			maxWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ""},

			/**
			 * The style class will be applied to the flex item and can be used for CSS selectors.
			 */
			styleClass : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * Defines the background style of the flex item.
			 *
			 * @since 1.38.5
			 */
			backgroundDesign: {type: "sap.m.BackgroundDesign", group: "Appearance", defaultValue: BackgroundDesign.Transparent}
		}
	}});

	/**
	 * Sets the <code>alignSelf</code> property.
	 *
	 * @public
	 * @param {sap.m.FlexAlignSelf} sValue Align option.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setAlignSelf = function(sValue) {
		var sOldValue = this.getAlignSelf();
		this.setProperty("alignSelf", sValue, true);
		this.$().removeClass("sapMFlexItemAlign" + sOldValue).addClass("sapMFlexItemAlign" + this.getAlignSelf());

		return this;
	};

	/**
	 * Sets the order.
	 *
	 * @public
	 * @param {int} iValue Order in integer format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setOrder = function(iValue) {
		this.setProperty("order", iValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "order", this.getOrder());

		return this;
	};

	/**
	 * Sets the <code>growFactor</code> property.
	 *
	 * @public
	 * @param {float} fValue Grow factor as a number.
	 * @returns {this} this FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setGrowFactor = function(fValue) {
		this.setProperty("growFactor", fValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-grow", this.getGrowFactor());

		return this;
	};

	/**
	 * Sets the <code>shrinkFactor</code> property.
	 *
	 * @public
	 * @param {float} fValue Shrink factor as a number.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 * @see https://www.w3.org/TR/css-flexbox-1/#propdef-flex-shrink
	 */
	FlexItemData.prototype.setShrinkFactor = function(fValue) {
		this.setProperty("shrinkFactor", fValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-shrink", this.getShrinkFactor());

		return this;
	};

	/**
	 * Sets the base size for flex items.
	 *
	 * @public
	 * @param {sap.ui.core.CSSSize} sValue Base size in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setBaseSize = function(sValue) {
		this.setProperty("baseSize", sValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-basis", this.getBaseSize());

		return this;
	};

	/**
	 * Sets minimum height.
	 *
	 * @public
	 * @param {sap.ui.core.CSSSize} sValue Minimum height in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setMinHeight = function(sValue) {
		this.setProperty("minHeight", sValue, true);
		this.$().css("min-height", this.getMinHeight());

		return this;
	};

	/**
	 * Sets maximum height.
	 *
	 * @public
	 * @param {sap.ui.core.CSSSize} sValue Maximum height in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setMaxHeight = function(sValue) {
		this.setProperty("maxHeight", sValue, true);
		this.$().css("max-height", this.getMaxHeight());

		return this;
	};

	/**
	 * Sets minimum width.
	 *
	 * @public
	 * @param {sap.ui.core.CSSSize} sValue Minimum width in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setMinWidth = function(sValue) {
		this.setProperty("minWidth", sValue, true);
		this.$().css("min-width", this.getMinWidth());

		return this;
	};

	/**
	 * Sets maximum width.
	 *
	 * @public
	 * @param {sap.ui.core.CSSSize} sValue Maximum width in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setMaxWidth = function(sValue) {
		this.setProperty("maxWidth", sValue, true);
		this.$().css("max-width", this.getMaxWidth());

		return this;
	};

	/**
	 * Sets background design for flex items.
	 *
	 * @public
	 * @param {sap.m.BackgroundDesign} sValue Background design in string format.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setBackgroundDesign = function(sValue) {
		var sOldValue = this.getBackgroundDesign();
		this.setProperty("backgroundDesign", sValue, true);
		this.$().removeClass("sapMFlexBoxBG" + sOldValue).addClass("sapMFlexBoxBG" + this.getBackgroundDesign());

		return this;
	};

	/**
	 * Sets style class.
	 *
	 * @public
	 * @param {string} sValue Style class.
	 * @returns {this} <code>this</code> FlexItemData reference for chaining.
	 */
	FlexItemData.prototype.setStyleClass = function(sValue) {
		var sOldValue = this.getStyleClass();
		this.setProperty("styleClass", sValue, true);
		this.$().removeClass(sOldValue).addClass(this.getStyleClass());

		return this;
	};

	/**
	 * Returns the correct FlexBox item DOM reference.
	 *
	 * @param {string} [sSuffix] ID suffix to get the DOMRef for
	 * @return {Element|null} The Element's DOM Element, sub DOM Element or <code>null</code>
	 * @protected
	 */
	FlexItemData.prototype.getDomRef = function(sSuffix) {
		var oParent,
			oItemDomRef = LayoutData.prototype.getDomRef.call(this, sSuffix);

		if (oItemDomRef) {
			return oItemDomRef;
		}

		oParent = this.getParent();

		if (!oParent) {
			return null;
		}

		return oParent.getDomRef(sSuffix);
	};

	return FlexItemData;

});