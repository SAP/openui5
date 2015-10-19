/*!
 * ${copyright}
 */

// Provides element sap.m.FlexItemData
sap.ui.define(['jquery.sap.global', './FlexBoxStylingHelper', './library', 'sap/ui/core/LayoutData'],
	function(jQuery, FlexBoxStylingHelper, library, LayoutData) {
	"use strict";

	/**
	 * Constructor for a new FlexItemData.
	 *
	 * @param {string} [sId] id for the new element, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new element
	 *
	 * @class
	 * Holds layout data for a FlexBox|HBox|VBox
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FlexItemData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexItemData = LayoutData.extend("sap.m.FlexItemData", /** @lends sap.m.FlexItemData.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Determines cross-axis alignment of individual element (not currently supported in Internet Explorer)
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#align-items-property
			 */
			alignSelf : {type : "sap.m.FlexAlignSelf", group : "Misc", defaultValue : sap.m.FlexAlignSelf.Auto},

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
			 * <b>Note:</b> This property is not supported in Internet Explorer 9, Android Native Browser/Webview <4.4, and Safari <7.
			 * @since 1.24
			 */
			shrinkFactor : {type : "float", group : "Misc", defaultValue : 1},

			/**
			 * The base size is the initial main size of the item for the flex algorithm. If set to "auto", this will be the computed size of the item.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-basis-property
			 *
			 * @since 1.32
			 */
			baseSize : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "auto"},

			/**
			 * The minimum height of the flex item.
			 * @since 1.36
			 */
			minHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * The maximum height of the flex item.
			 * @since 1.36
			 */
			maxHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * The minimum height of the flex item.
			 * @since 1.36
			 */
			minWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * The maximum height of the flex item.
			 * @since 1.36
			 */
			maxWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * The style class will be applied to the flex item and can be used for CSS selectors
			 */
			styleClass : {type : "string", group : "Misc", defaultValue : ''}
		}
	}});

	FlexItemData.prototype.setAlignSelf = function(sValue) {
		var sOldValue = this.getAlignSelf();
		this.setProperty("alignSelf", sValue, true);
		this.$().removeClass("sapMFlexItemAlign" + sOldValue).addClass("sapMFlexItemAlign" + this.getAlignSelf());

		return this;
	};

	FlexItemData.prototype.setOrder = function(sValue) {
		this.setProperty("order", sValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "order", this.getOrder());

		return this;
	};

	FlexItemData.prototype.setGrowFactor = function(sValue) {
		this.setProperty("growFactor", sValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-grow", this.getGrowFactor());

		return this;
	};

	FlexItemData.prototype.setShrinkFactor = function(sValue) {
		this.setProperty("shrinkFactor", sValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-shrink", this.getShrinkFactor());

		return this;
	};

	FlexItemData.prototype.setBaseSize = function(sValue) {
		this.setProperty("baseSize", sValue, true);
		FlexBoxStylingHelper.setStyle(null, this, "flex-basis", this.getBaseSize());

		return this;
	};

	FlexItemData.prototype.setMinHeight = function(sValue) {
		this.setProperty("minHeight", sValue, true);
		this.$().css("min-height", this.getMinHeight());

		return this;
	};

	FlexItemData.prototype.setMaxHeight = function(sValue) {
		this.setProperty("maxHeight", sValue, true);
		this.$().css("max-height", this.getMaxHeight());

		return this;
	};

	FlexItemData.prototype.setMinWidth = function(sValue) {
		this.setProperty("minWidth", sValue, true);
		this.$().css("min-width", this.getMinWidth());

		return this;
	};

	FlexItemData.prototype.setMaxWidth = function(sValue) {
		this.setProperty("maxWidth", sValue, true);
		this.$().css("max-width", this.getMaxWidth());

		return this;
	};

	return FlexItemData;

}, /* bExport= */ true);
