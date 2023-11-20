/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.layout.AbsoluteLayout.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    './PositionContainer',
    'sap/ui/commons/library',
    'sap/ui/core/Control',
    './AbsoluteLayoutRenderer',
    'sap/ui/core/library'
],
	function(jQuery, PositionContainer, library, Control, AbsoluteLayoutRenderer, coreLibrary) {
	"use strict";



	// shortcut for sap.ui.core.Scrolling
	var Scrolling = coreLibrary.Scrolling;



	/**
	 * Constructor for a new layout/AbsoluteLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * The Absolute Layout positions its child controls absolutely
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.commons.layout.AbsoluteLayout
	 */
	var AbsoluteLayout = Control.extend("sap.ui.commons.layout.AbsoluteLayout", /** @lends sap.ui.commons.layout.AbsoluteLayout.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.commons",
		properties : {
			/**
			 * The overall width of the control. When not set, 100% is automatically set.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

			/**
			 * The overall height of the control. When not set, 100% is automatically set.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

			/**
			 * 'Auto', 'Scroll', 'Hidden', and 'None' are the available values for setting the vertical scrolling mode.
			 */
			verticalScrolling : {type : "sap.ui.core.Scrolling", group : "Behavior", defaultValue : Scrolling.Hidden},

			/**
			 * 'Auto', 'Scroll', 'Hidden', and 'None' are the available values for setting the vertical scrolling mode.
			 */
			horizontalScrolling : {type : "sap.ui.core.Scrolling", group : "Behavior", defaultValue : Scrolling.Hidden}
		},
		defaultAggregation : "positions",
		aggregations : {

			/**
			 * Positioned child controls within the layout
			 */
			positions : {type : "sap.ui.commons.layout.PositionContainer", multiple : true, singularName : "position"}
		}
	}});


	//**** Overridden API Functions ****

	/**
	 * Sets the <code>width</code> property.
	 *
	 * @override
	 * @public
	 * @param {string} sWidth The passed width of the control.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.setWidth = function(sWidth) {
		return setProp(this, "width", sWidth, "LYT_SIZE");
	};


	/**
	 * Sets the <code>height</code> property.
	 *
	 * @override
	 * @public
	 * @param {string} sHeight The passed height of the control.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.setHeight = function(sHeight) {
		return setProp(this, "height", sHeight, "LYT_SIZE");
	};


	/**
	 * Sets the <code>verticalScrolling</code> property.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.Scrolling} oVerticalScrolling Object that contains settings for Vertical scrolling.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.setVerticalScrolling = function(oVerticalScrolling) {
		return setProp(this, "verticalScrolling", oVerticalScrolling, "LYT_SCROLL");
	};

	/**
	 * Sets the <code>horizontalScrolling</code> property.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.Scrolling} oHorizontalScrolling Object that contains settings for Horizontal scrolling.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.setHorizontalScrolling = function(oHorizontalScrolling) {
		return setProp(this, "horizontalScrolling", oHorizontalScrolling, "LYT_SCROLL");
	};

	/**
	 * Inserts element to the layout on a specific index.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.Control} oPosition Element which must be positioned in the layout.
	 * @param {int} iIndex Index of the element which is to be positioned.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.insertPosition = function(oPosition, iIndex) {
		var bHasDomRef = !!this.getDomRef();
		this.insertAggregation("positions", oPosition, iIndex, bHasDomRef);
		if (bHasDomRef && oPosition && oPosition.getControl()) {
			this.contentChanged(oPosition, "CTRL_ADD");
		}
		return this;
	};

	/**
	 * Adds element to the layout.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.Control} oPosition  Element which must be positioned in the layout.
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.addPosition = function(oPosition) {
		var bHasDomRef = !!this.getDomRef();
		this.addAggregation("positions", oPosition, bHasDomRef);
		if (bHasDomRef && oPosition && oPosition.getControl()) {
			this.contentChanged(oPosition, "CTRL_ADD");
		}
		return this;
	};

	/**
	 * Removes element from the layout.
	 *
	 * @override
	 * @public
	 * @param {any} vPosition  Element which must be removed from the positions element within the layout.
	 * @returns {sap.ui.core.Control} Removed element.
	 */
	AbsoluteLayout.prototype.removePosition = function(vPosition) {
		var bHasDomRef = !!this.getDomRef();
		var oRemovedPosition = this.removeAggregation("positions", vPosition, bHasDomRef);
		if (oRemovedPosition) {
			cleanup([oRemovedPosition]);
			this.contentChanged(oRemovedPosition, "CTRL_REMOVE");
		}
		return oRemovedPosition;
	};

	/**
	 * Removes all elements from the layout.
	 *
	 * @override
	 * @public
	 * @returns {sap.ui.core.Control[]} Removed elements.
	 */
	AbsoluteLayout.prototype.removeAllPositions = function() {
		cleanup(this.getPositions());
		var bHasDomRef = !!this.getDomRef();
		var aRemovedPositions = this.removeAllAggregation("positions", bHasDomRef);
		if (bHasDomRef) {
			this.contentChanged(aRemovedPositions, "CTRL_REMOVE_ALL");
		}
		return aRemovedPositions;
	};

	/**
	 * Destroys all elements from the layout.
	 *
	 * @override
	 * @public
	 * @returns {this} <code>this</code> Control reference for chaining.
	 */
	AbsoluteLayout.prototype.destroyPositions = function() {
		cleanup(this.getPositions());
		var bHasDomRef = !!this.getDomRef();
		this.destroyAggregation("positions", bHasDomRef);
		if (bHasDomRef) {
			this.contentChanged(null, "CTRL_REMOVE_ALL");
		}
		return this;
	};



	//**** Additional API Functions ****


	/**
	 * Returns an array of the controls contained in the aggregated position containers (might be empty).
	 *
	 * @type sap.ui.core.Control[]
	 * @public
	 */
	AbsoluteLayout.prototype.getContent = function() {
		var aControls = [];
		var aPositions = this.getPositions();
		for (var index = 0; index < aPositions.length; index++) {
			aControls.push(aPositions[index].getControl());
		}
		return aControls;
	};



	/**
	 * Adds the given control and a corresponding position container into the aggregation named 'positions'. Returns 'this' to allow method chaining.
	 *
	 * @param {sap.ui.core.Control} oContent
	 *         The content to add; if empty, nothing is inserted.
	 * @param {{left: string, right: string}} [oPos=\{left: "0px", right: "0px"\}]
	 *         JSON-like object which defines the position of the child control in the layout.
	 *         The object is expected to have one or more from the attribute set top, bottom, left, right; each with a value of type sap.ui.core.CSSSize.
	 * @type this
	 * @public
	 */
	AbsoluteLayout.prototype.addContent = function(oContent, oPos) {
		var oPosition = PositionContainer.createPosition(oContent, oPos);
		this.addPosition(oPosition);
		return this;
	};



	/**
	 * Inserts the given control and a corresponding position container into the aggregation named 'positions'. Returns 'this' to allow method chaining.
	 *
	 * @param {sap.ui.core.Control} oContent
	 *         The content to insert; if empty, nothing is inserted
	 * @param {int} iIndex
	 *         The '0'-based index where the content shall be inserted at. For a negative value of iIndex, the content is inserted at position '0';
	 *         for a value greater than the current size of the aggregation, the content is inserted at the last position.
	 * @param {{left: string, right: string}} [oPos=\{left: "0px", right: "0px"\}]
	 *         JSON-like object which defines the position of the child control in the layout.
	 *         The object is expected to have one or more from the attribute set top, bottom, left, right; each with a value of type sap.ui.core.CSSSize.
	 * @type this
	 * @public
	 */
	AbsoluteLayout.prototype.insertContent = function(oContent, iIndex, oPos) {
		var oPosition = PositionContainer.createPosition(oContent, oPos);
		this.insertPosition(oPosition, iIndex);
		return this;
	};



	/**
	 * Removes the given control and its corresponding position container from the aggregation named 'positions'.
	 *
	 * @param {string|sap.ui.core.Control} vContent
	 *         The content control to remove, its ID, or the index of the corresponding position container in the 'positions' aggregation.
	 * @type sap.ui.core.Control
	 * @public
	 */
	AbsoluteLayout.prototype.removeContent = function(vContent) {
		var iIndex = vContent;
		if (typeof (vContent) == "string") { // ID of the element is given
			vContent = sap.ui.getCore().byId(vContent);
		}
		if (typeof (vContent) == "object") { // the element itself is given or has just been retrieved
			iIndex = this.indexOfContent(vContent);
		}
		if (iIndex >= 0 && iIndex < this.getContent().length) {
			this.removePosition(iIndex);
			return vContent;
		}
		return null;
	};



	/**
	 * Removes all aggregated position containers. Returns an array of the controls contained in the removed position containers (might be empty).
	 *
	 * @type sap.ui.core.Control[]
	 * @public
	 */
	AbsoluteLayout.prototype.removeAllContent = function() {
		var aControls = this.getContent();
		this.removeAllPositions();
		return aControls;
	};



	/**
	 * Checks for the provided sap.ui.core.Control in the aggregated position containers, and returns the index of the container in the positions aggregation
	 * if found, or '-1' otherwise.
	 *
	 * @param {sap.ui.core.Control} oContent
	 *         The content of which the index is looked for
	 * @type int
	 * @public
	 */
	AbsoluteLayout.prototype.indexOfContent = function(oContent) {
		var aControls = this.getContent();
		for (var index = 0; index < aControls.length; index++) {
			if (oContent === aControls[index]) {
				return index;
			}
		}
		return -1;
	};



	/**
	 * Destroys all aggregated position containers and their child controls. Returns 'this' to allow method chaining.
	 *
	 * @type this
	 * @public
	 */
	AbsoluteLayout.prototype.destroyContent = function() {
		this.destroyPositions();
		return this;
	};



	/**
	 * Allows to set or change the position information of the given child control
	 *
	 * @param {sap.ui.core.Control} oControl
	 *         The child control for which to change the position information; if empty or not aggregated, nothing is changed
	 * @param {{left: string, right: string}} [oPos=\{left: "0px", right: "0px"\}]
	 *         JSON-like object which defines the position of the child control in the layout.
	 *         The object is expected to have one or more from the attribute set top, bottom, left, right; each with a value of type sap.ui.core.CSSSize.
	 * @type boolean
	 * @public
	 */
	AbsoluteLayout.prototype.setPositionOfChild = function(oControl, oPos) {
		var iIdx = this.indexOfContent(oControl);
		if (iIdx >= 0) {
			var oPosition = this.getPositions()[iIdx];
			oPosition.updatePosition(oPos);
			return true;
		}
		return false;
	};



	//**** Other Functions ****

	/**
	 * @see sap.ui.commons.layout.PositionContainer#getComputedPosition
	 *
	 * @private
	 */
	AbsoluteLayout.prototype.getPositionOfChild = function(oControl){
		var iIdx = this.indexOfContent(oControl);
		if (iIdx >= 0) {
			//Adapt when width/height attribute on control is set
			var oPosition = this.getPositions()[iIdx];
			return oPosition.getComputedPosition();
		}
		return {};
	};


	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	AbsoluteLayout.prototype.exit = function(){
		cleanup(this.getPositions());
	};


	/**
	 * Called by the Renderer before the control is rendered.
	 * Attention: Do not mix it up with onBeforeRendering!
	 *
	 * @private
	 */
	AbsoluteLayout.prototype.doBeforeRendering = function() {
		var aPositions = this.getPositions();
		if (!aPositions || aPositions.length == 0) {
			return;
		}

		for (var index = 0; index < aPositions.length; index++) {
			var oPosition = aPositions[index];
			oPosition.reinitializeEventHandlers(true);
			adaptChildControl(oPosition, true);
		}
	};


	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	AbsoluteLayout.prototype.onAfterRendering = function() {
		var aPositions = this.getPositions();
		if (!aPositions || aPositions.length == 0) {
			return;
		}

		for (var index = 0; index < aPositions.length; index++) {
			aPositions[index].reinitializeEventHandlers();
		}
	};


	/**
	 * Cleanup modifications of the given control.
	 *
	 * @private
	 */
	AbsoluteLayout.cleanUpControl = function(oControl) {
		if (oControl && oControl[SAVED_DELEGATOR]) {
			oControl.removeDelegate(oControl[SAVED_DELEGATOR]);
			oControl[SAVED_DELEGATOR] = undefined;
		}
	};


	/**
	 * Handles changes on an aggregated position container when it is already in the Dom.
	 *
	 * @private
	 */
	AbsoluteLayout.prototype.contentChanged = function(oPosition, sChangeType) {
		switch (sChangeType) {
			case "CTRL_POS":
				AbsoluteLayoutRenderer.updatePositionStyles(oPosition);
				adaptChildControl(oPosition);
				oPosition.reinitializeEventHandlers();
				break;
			case "CTRL_CHANGE":
				adaptChildControl(oPosition, true);
				AbsoluteLayoutRenderer.updatePositionedControl(oPosition);
				oPosition.reinitializeEventHandlers();
				break;
			case "CTRL_REMOVE":
				AbsoluteLayoutRenderer.removePosition(oPosition);
				oPosition.reinitializeEventHandlers(true);
				break;
			case "CTRL_REMOVE_ALL":
				AbsoluteLayoutRenderer.removeAllPositions(this);
				var aPositions = oPosition;
				if (aPositions) {
					for (var index = 0; index < aPositions.length; index++) {
						aPositions[index].reinitializeEventHandlers(true);
					}
				}
				break;
			case "CTRL_ADD":
				adaptChildControl(oPosition, true);
				AbsoluteLayoutRenderer.insertPosition(this, oPosition);
				oPosition.reinitializeEventHandlers();
				break;
			case "LYT_SCROLL":
				AbsoluteLayoutRenderer.updateLayoutScolling(this);
				break;
			case "LYT_SIZE":
				AbsoluteLayoutRenderer.updateLayoutSize(this);
				break;
		}
	};



	//**** Private Helper Functions ****

	//Constant which defines the "save location" for the used delegator object
	var SAVED_DELEGATOR = "__absolutelayout__delegator";

	/**
	 * Cleanup modifications of all child controls of the given positions.
	 *
	 * @private
	 */
	var cleanup = function(aPositions) {
		for (var index = 0; index < aPositions.length; index++) {
			var oPosition = aPositions[index];
			var oChildControl = oPosition.getControl();
			if (oChildControl) {
				AbsoluteLayout.cleanUpControl(oChildControl);
			}
		}
	};


	/**
	 * (Re-)Initialize listening to child rerendering
	 *
	 * @private
	 */
	var adaptChildControl = function(oPosition, bRegisterOnly) {
		var oChildControl = oPosition.getControl();
		if (oChildControl) {
			AbsoluteLayout.cleanUpControl(oChildControl);

			if (!bRegisterOnly) {
				adaptControlSize(oChildControl);
			}

			var oDelegate = (function(oControl) {
				return {
					onAfterRendering: function(){
						adaptControlSize(oControl);
					}
				};
			}(oChildControl));

			oChildControl[SAVED_DELEGATOR] = oDelegate;
			oChildControl.addDelegate(oDelegate, true);
		}
	};


	/**
	 * Adapt the sizes of controls if necessary.
	 *
	 * @private
	 */
	var adaptControlSize = function(oControl){
		var bAdapted = false;
		if (oControl.getParent() && oControl.getParent().getComputedPosition) {
			var oPos = oControl.getParent().getComputedPosition();
			if (oPos.top && oPos.bottom || oPos.height) {
				jQuery(oControl.getDomRef()).css("height", "100%");
				bAdapted = true;
			}
			if (oPos.left && oPos.right || oPos.width) {
				jQuery(oControl.getDomRef()).css("width", "100%");
				bAdapted = true;
			}
			if (bAdapted) {
				AbsoluteLayoutRenderer.updatePositionStyles(oControl.getParent());
			}
		}
		return bAdapted;
	};


	/**
	 * Sets the value of the given property and triggers Dom change if
	 * possible.
	 *
	 * @private
	 */
	var setProp = function(oThis, sProp, oValue, sChangeType) {
		var bHasDomRef = !!oThis.getDomRef();
		oThis.setProperty(sProp, oValue, bHasDomRef);
		if (bHasDomRef) {
			oThis.contentChanged(null, sChangeType);
		}
		return oThis;
	};


	// inject cleanUpControl into PositionContainer
	PositionContainer.cleanUpControl = AbsoluteLayout.cleanUpControl;

	return AbsoluteLayout;

});
