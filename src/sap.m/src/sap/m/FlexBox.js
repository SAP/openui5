/*!
 * ${copyright}
 */

// Provides control sap.m.FlexBox.
sap.ui.define([
	'jquery.sap.global',
	'./FlexBoxStylingHelper',
	'./FlexItemData',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/RenderManager',
	'./FlexBoxRenderer'
],
function(
	jQuery,
	FlexBoxStylingHelper,
	FlexItemData,
	library,
	Control,
	RenderManager,
	FlexBoxRenderer
) {
	"use strict";

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.FlexAlignContent
	var FlexAlignContent = library.FlexAlignContent;

	// shortcut for sap.m.FlexWrap
	var FlexWrap = library.FlexWrap;

	// shortcut for sap.m.FlexAlignItems
	var FlexAlignItems = library.FlexAlignItems;

	// shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = library.FlexJustifyContent;



	// shortcut for sap.m.FlexRendertype
	var FlexRendertype = library.FlexRendertype;

	// shortcut for sap.m.FlexDirection
	var FlexDirection = library.FlexDirection;



	/**
	 * Constructor for a new <code>sap.m.FlexBox</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.FlexBox</code> control builds the container for a flexible box layout.<br>
	 * <br>
	 * <b>Note:</b> Be sure to check the <code>renderType</code> setting to avoid issues due to browser inconsistencies.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.m.FlexBox
	 * @see https://www.w3.org/TR/css-flexbox-1/
	 * @see https://www.w3schools.com/css/css3_flexbox.asp
	 * @see {@link topic:674890e6d8534eaba2eaf63242e077eb Flex Box}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexBox = Control.extend("sap.m.FlexBox", /** @lends sap.m.FlexBox.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The height of the <code>sap.m.FlexBox</code>. Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
			 * @since 1.9.1
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * The width of the <code>sap.m.FlexBox</code>. Note that when a percentage is given, for the width to work as expected, the width of the surrounding container must be defined.
			 * @since 1.9.1
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * Determines whether the <code>sap.m.FlexBox</code> is in block or inline mode.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-containers
			 */
			displayInline : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines the direction of the layout of child elements.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-direction-property
			 */
			direction : {type : "sap.m.FlexDirection", group : "Appearance", defaultValue : FlexDirection.Row},

			/**
			 * Determines whether the <code>sap.m.FlexBox</code> will be sized to completely fill its container. If the <code>sap.m.FlexBox</code> is inserted into a Page, the property 'enableScrolling' of the Page needs to be set to 'false' for the FlexBox to fit the entire viewport.
			 */
			fitContainer : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines whether the layout is rendered as a series of divs or as an unordered list (ul).<br>
			 * <br>
			 * We recommend to use <code>Bare</code> in most cases to avoid layout issues due to browser inconsistencies.
			 */
			renderType : {type : "sap.m.FlexRendertype", group : "Misc", defaultValue : FlexRendertype.Div},

			/**
			 * Determines the layout behavior along the main axis.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#justify-content-property
			 */
			justifyContent : {type : "sap.m.FlexJustifyContent", group : "Appearance", defaultValue : FlexJustifyContent.Start},

			/**
			 * Determines the layout behavior of items along the cross-axis. "Baseline" is not supported in Internet Explorer 10.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#align-items-property
			 */
			alignItems : {type : "sap.m.FlexAlignItems", group : "Appearance", defaultValue : FlexAlignItems.Stretch},

			/**
			 * Determines the wrapping behavior of the flex container. This property has no effect in older browsers, e.g. Android Native 4.3 and below.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#flex-wrap-property
			 *
			 * @since 1.36.0
			 */
			wrap : {type : "sap.m.FlexWrap", group : "Appearance", defaultValue : FlexWrap.NoWrap},

			/**
			 * Determines the layout behavior of container lines when there's extra space along the cross-axis. This property has no effect in Internet Explorer 10.
			 *
			 * @see http://www.w3.org/TR/css-flexbox-1/#align-content-property
			 *
			 * @since 1.36.0
			 */
			alignContent : {type : "sap.m.FlexAlignContent", group : "Appearance", defaultValue : FlexAlignContent.Stretch},

			/**
			 * Defines the background style of the <code>sap.m.FlexBox</code>.
			 *
			 * @since 1.38.5
			 */
			backgroundDesign: {type: "sap.m.BackgroundDesign", group: "Appearance", defaultValue: BackgroundDesign.Transparent}
		},
		defaultAggregation : "items",
		aggregations : {

			/**
			 * Flex items within the flexible box layout
			 */
			items : {type : "sap.ui.core.Control", multiple : true, singularName : "item"}
		},
		designtime: "sap/m/designtime/FlexBox.designtime"
	}});

	/**
	 * Initializes the control.
	 *
	 * @public
	 */
	FlexBox.prototype.init = function() {
		// Make sure that HBox and VBox have a valid direction
		if (this instanceof sap.m.HBox && (this.getDirection() !== FlexDirection.Row || this.getDirection() !== FlexDirection.RowReverse)) {
			this.setDirection('Row');
		}
		if (this instanceof sap.m.VBox && (this.getDirection() !== FlexDirection.Column || this.getDirection() !== FlexDirection.ColumnReverse)) {
			this.setDirection('Column');
		}

		this._oItemDelegate = {
			onAfterRendering: this._onAfterItemRendering
		};
	};

	/**
	 * Adds item in the FlexBox.
	 *
	 * @public
	 * @param {object} oItem Added item.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem);
		this._onItemInserted(oItem);

		return this;
	};

	/**
	 * Inserts single item.
	 *
	 * @public
	 * @param {object} oItem Inserted item.
	 * @param {int} iIndex Index of the inserted item.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.insertItem = function(oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex);
		this._onItemInserted(oItem);

		return this;
	};

	/**
	 * Removes single item.
	 *
	 * @public
	 * @param {any} vItem Item to be removed.
	 * @returns {object} The removed item.
	 */
	FlexBox.prototype.removeItem = function(vItem) {
		var oItem = this.removeAggregation("items", vItem);

		this._onItemRemoved(oItem);

		return oItem;
	};

	/**
	 * Removes all items.
	 *
	 * @public
	 * @returns {object} The removed items from flexbox.
	 */
	FlexBox.prototype.removeAllItems = function() {
		var aItems = this.getItems();

		for (var i = 0; i < aItems.length; i++) {
			this._onItemRemoved(aItems[i]);
		}

		return this.removeAllAggregation("items");
	};

	/**
	 * Helper that gets called when new item is inserted into items aggregation.
	 *
	 * @private
	 * @param {object} oItem Inserted item.
	 */
	FlexBox.prototype._onItemInserted = function(oItem) {
		if (oItem && !(oItem instanceof FlexBox)) {
			oItem.attachEvent("_change", this._onItemChange, this);
			if (this.getRenderType() === FlexRendertype.Bare) {
				oItem.addEventDelegate(this._oItemDelegate, oItem);
			}
		}
	};

	/**
	 * Helper that gets called when an item is removed from items aggregation.
	 *
	 * @private
	 * @param {object} oItem Removed item.
	 */
	FlexBox.prototype._onItemRemoved = function(oItem) {
		if (oItem && !(oItem instanceof FlexBox)) {
			oItem.detachEvent("_change", this._onItemChange, this);
			if (this.getRenderType() === FlexRendertype.Bare) {
				oItem.removeEventDelegate(this._oItemDelegate, oItem);
			}
		}
	};

	/**
	 * Helper that gets called when an item is changed.
	 *
	 * @private
	 * @param {object} oControlEvent Onchange event.
	 */
	FlexBox.prototype._onItemChange = function(oControlEvent) {
		// Early return conditions
		if (oControlEvent.getParameter("name") !== "visible"
			|| (this.getRenderType() !== FlexRendertype.List && this.getRenderType() !== FlexRendertype.Div)) {
			return;
		}

		// Sync visibility of flex item wrapper, if visibility changes
		var oItem = sap.ui.getCore().byId(oControlEvent.getParameter("id")),
			oWrapper = null;

		if (oItem.getLayoutData()) {
			oWrapper = jQuery.sap.byId(oItem.getLayoutData().getId());
		} else {
			oWrapper = jQuery.sap.byId(RenderManager.createInvisiblePlaceholderId(oItem)).parent();
		}

		if (oControlEvent.getParameter("newValue")) {
			oWrapper.removeClass("sapUiHiddenPlaceholder").removeAttr("aria-hidden");
		} else {
			oWrapper.addClass("sapUiHiddenPlaceholder").attr("aria-hidden", "true");
		}
	};

	/**
	 * Gets called after an item is (re)rendered.
	 * Here <code>this</code> points to the control, not to the FlexBox.
	 *
	 * @private
	 */
	FlexBox.prototype._onAfterItemRendering = function() {
		var oLayoutData = this.getLayoutData();
		if (oLayoutData instanceof FlexItemData) {
			FlexBoxStylingHelper.setFlexItemStyles(null, oLayoutData);
		}
	};

	/**
	 * Sets the render type of the FlexBox.
	 *
	 * @public
	 * @param {string} sValue Render type in string format.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.setRenderType = function(sValue) {
		var sOldValue = this.getRenderType(),
			aItems = this.getItems();

		if (sValue === sOldValue) {
			return this;
		}

		this.setProperty("renderType", sValue);

		if (sOldValue === "Bare") {
			aItems.forEach(this._onItemRemoved, this);
		}

		if (sValue === "Bare") {
			aItems.forEach(this._onItemInserted, this);
		}

		return this;
	};

	/**
	 * Sets display inline for nested or contained FlexBox.
	 *
	 * @public
	 * @param {boolean} bInline Indication for display inline.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.setDisplayInline = function(bInline) {
		this.setProperty("displayInline", bInline, true);
		this.$().toggleClass("sapMFlexBoxInline", this.getDisplayInline());

		return this;
	};

	/**
	 * Sets direction for the FlexBox. It could be row, row-reverse, column or column-reverse.
	 *
	 * @public
	 * @param {string} sValue FlexBox direction in string format.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.setDirection = function(sValue) {
		this.setProperty("direction", sValue, true);
		if (this.getDirection() === FlexDirection.Column || this.getDirection() === FlexDirection.ColumnReverse) {
			this.$().removeClass("sapMHBox").addClass("sapMVBox");
		} else {
			this.$().removeClass("sapMVBox").addClass("sapMHBox");
		}

		if (this.getDirection() === FlexDirection.RowReverse || this.getDirection() === FlexDirection.ColumnReverse) {
			this.$().addClass("sapMFlexBoxReverse");
		} else {
			this.$().removeClass("sapMFlexBoxReverse");
		}

		return this;
	};

	/**
	 * Sets <code>fitContainer</code> so you can have nested FlexBox containers in columns or rows.
	 *
	 * @public
	 * @param {string} sValue Fit container in string format.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.setFitContainer = function(sValue) {
		this.setProperty("fitContainer", sValue, true);
		this.$().toggleClass("sapMFlexBoxFit", this.getFitContainer());

		return this;
	};

	/**
	 * Sets the wrapping.
	 *
	 * @public
	 * @param {string} sValue Wrapping in the flexbox.
	 * @returns {sap.m.FlexBox} <code>this</code> FlexBox reference for chaining.
	 */
	FlexBox.prototype.setWrap = function(sValue) {
		var sOldValue = this.getWrap();
		this.setProperty("wrap", sValue, true);
		this.$().removeClass("sapMFlexBoxWrap" + sOldValue).addClass("sapMFlexBoxWrap" + this.getWrap());

		return this;
	};

	/**
	 * Sets the <code>justifyContent</code> - it can be flex-start, flex-end, center, space-between, space-around, space-evenly.
	 *
	 * @public
	 * @param {string} sValue Justify content;
	 * @returns {sap.m.FlexBox} this FlexBox reference for chaining.
	 */
	FlexBox.prototype.setJustifyContent = function(sValue) {
		var sOldValue = this.getJustifyContent();
		this.setProperty("justifyContent", sValue, true);
		this.$().removeClass("sapMFlexBoxJustify" + sOldValue).addClass("sapMFlexBoxJustify" + this.getJustifyContent());

		return this;
	};

	/**
	 * Sets the alignment of items in the FlexBox.
	 *
	 * @public
	 * @param {string} sValue Align items.
	 * @returns {sap.m.FlexBox} this FlexBox reference for chaining.
	 */
	FlexBox.prototype.setAlignItems = function(sValue) {
		var sOldValue = this.getAlignItems();
		this.setProperty("alignItems", sValue, true);
		this.$().removeClass("sapMFlexBoxAlignItems" + sOldValue).addClass("sapMFlexBoxAlignItems" + this.getAlignItems());

		return this;
	};

	/**
	 * Sets the alignment of content in the FlexBox.
	 *
	 * @public
	 * @param {string} sValue Align content.
	 * @returns {sap.m.FlexBox} this FlexBox reference for chaining.
	 */
	FlexBox.prototype.setAlignContent = function(sValue) {
		var sOldValue = this.getAlignContent();
		this.setProperty("alignContent", sValue, true);
		this.$().removeClass("sapMFlexBoxAlignContent" + sOldValue).addClass("sapMFlexBoxAlignContent" + this.getAlignContent());

		return this;
	};

	/**
	 * Sets the FlexBox height.
	 *
	 * @public
	 * @param {string} sValue Height in string format.
	 * @returns {sap.m.FlexBox} this FlexBox reference for chaining.
	 */
	FlexBox.prototype.setHeight = function(sValue) {
		this.setProperty("height", sValue, true);
		this.$().css("height", this.getHeight());

		return this;
	};

	/**
	 * Sets the FlexBox width.
	 *
	 * @public
	 * @param {string} sValue Width in string format.
	 * @returns {sap.m.FlexBox} this FlexBox reference for chaining.
	 */
	FlexBox.prototype.setWidth = function(sValue) {
		this.setProperty("width", sValue, true);
		this.$().css("width", this.getWidth());

		return this;
	};

	/**
	 * Sets the background design.
	 *
	 * @public
	 * @param {string} sValue Background design in string format.
	 * @returns {sap.m.FlexBox} this FlexBox for reference chaining.
	 */
	FlexBox.prototype.setBackgroundDesign = function(sValue) {
		var sOldValue = this.getBackgroundDesign();
		this.setProperty("backgroundDesign", sValue, true);
		this.$().removeClass("sapMFlexBoxBG" + sOldValue).addClass("sapMFlexBoxBG" + this.getBackgroundDesign());

		return this;
	};

	/**
	 * Gets the accessibility information.
	 *
	 * @protected
	 * @returns {object} The accessibility information.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	FlexBox.prototype.getAccessibilityInfo = function() {
		return {children: this.getItems()};
	};

	return FlexBox;

});