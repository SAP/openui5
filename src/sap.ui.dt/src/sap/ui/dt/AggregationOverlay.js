/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil'
],
function(jQuery, Control, DOMUtil, ElementUtil, OverlayUtil) {
	"use strict";


	/**
	 * Constructor for an AggregationOverlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The AggregationOverlay allows to create an absolute positioned DIV above the aggregation
	 * of an element.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.AggregationOverlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AggregationOverlay = Control.extend("sap.ui.dt.AggregationOverlay", /** @lends sap.ui.dt.AggregationOverlay.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				/** 
				 * Name of aggregation to create the AggregationOverlay for
				 */				
				aggregationName : {
					type : "string"
				},
				/** 
				 * Whether the AggregationOverlay and it's descendants should be visible on a screen
				 * We are overriding Control's property to prevent RenderManager from rendering the invisible placeholder
				 */	
				visible : {
					type : "boolean",
					defaultValue : true
				},
				/** 
				 * Whether the AggregationOverlay is a drop target
				 */
				droppable : {
					type : "boolean",
					defaultValue : false
				}
			}, 
			aggregations : {
				/**
				 * Overlays for the elements, which are public children of this aggregation
				 */
				children : {
					type : "sap.ui.dt.Overlay",
					multiple : true
				}
			},
			events : {
				/**
				 * Event fired when the property "droppable" was changed
				 */
				droppableChange : {
					parameters : {
						droppable : { type : "boolean" }
					}
				}
			}
		}
	});

	/** 
	 * Called when the AggregationOverlay is initialized	
	 * @protected
	 */
	AggregationOverlay.prototype.init = function() {
		this.attachBrowserEvent("scroll", this._onScroll, this);
	};

	/** 
	 * Called when the AggregationOverlay is destroyed		
	 * @protected
	 */
	AggregationOverlay.prototype.exit = function() {
		delete this._oDomRef;
		delete this._bScrollable;
	};	

	/** 
	 * Called after AggregationOverlay rendering phase
	 * @protected
	 */
	AggregationOverlay.prototype.onAfterRendering = function() {
		this._oDomRef = this.getDomRef();
		if (this._oDomRef) {
			this._updateDom();
		}
	};

	/** 
	 * @return {Element} The Element's DOM Element sub DOM Element or null
	 * @override
	 */
	AggregationOverlay.prototype.getDomRef = function() {
		return this._oDomRef || Control.prototype.getDomRef.apply(this, arguments);
	};


	/** 
	 * Returns a DOM representation for an aggregation, associated with this AggregationOverlay, if it can be found or undefined
	 * Representation is searched in DOM based on DesignTimeMetadata defined for the parent Overlay
	 * @return {Element} Associated with this AggregationOverlay DOM Element or null, if it can't be found
	 * @public
	 */
	AggregationOverlay.prototype.getAssociatedDomRef = function() {
		var oOverlay = this.getParent();
		var oElement = this.getElementInstance();
		var sAggregationName = this.getAggregationName();

		var oElementDomRef = ElementUtil.getDomRef(oElement);
		if (oElementDomRef) {
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			var vAggregationDomRef = oDesignTimeMetadata.getAggregationDomRef(sAggregationName);
			if (typeof vAggregationDomRef === "function") {
				return vAggregationDomRef.call(oElement, sAggregationName);
			} else if (typeof vAggregationDomRef === "string") {
				return DOMUtil.getDomRefForCSSSelector(oElementDomRef, vAggregationDomRef);
			}
		}
	};	

	/** 
	 * Sets a property "droppable", toggles a CSS class for the DomRef based on a property's value and fires "droppableChange" event
	 * @param {boolean} bDroppable state to set
	 * @returns {sap.ui.dt.AggregationOverlay} returns this	 	 
	 * @public
	 */
	AggregationOverlay.prototype.setDroppable = function(bDroppable) {
		if (this.getDroppable() !== bDroppable) {
			this.setProperty("droppable", bDroppable);
			this.toggleStyleClass("sapUiDtAggregationOverlayDroppable", bDroppable);

			this.fireDroppableChange({droppable : bDroppable});
		}

		return this;
	};		

	/**
	 * Calculate and update CSS styles for the AggregationOverlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child Overlay of this AggregationOverlay (cascade)
	 * @public
	 */
	AggregationOverlay.prototype.applyStyles = function() {
		var oAggregationGeometry = this.getGeometry();

		if (oAggregationGeometry) {
			var oElementOverlay = this.getParent();
			var mElementOffset = oElementOverlay ? oElementOverlay.$().offset() : null;
			var mPosition = DOMUtil.getOffsetFromParent(oAggregationGeometry.position, mElementOffset);

			var iZIndex = DOMUtil.getZIndex(oAggregationGeometry.domRef);
			var oOverflows = DOMUtil.getOverflows(oAggregationGeometry.domRef);

			var $aggregation = this.$();

			var mSize = oAggregationGeometry.size;
			$aggregation.css("width", mSize.width + "px");
			$aggregation.css("height", mSize.height + "px");
			$aggregation.css("top", mPosition.top + "px");
			$aggregation.css("left", mPosition.left + "px");
			if (iZIndex) {
				$aggregation.css("z-index", iZIndex);
			}
			if (oOverflows) {
				this._bScrollable = true;
				$aggregation.css("overflow-x", oOverflows.overflowX);
				$aggregation.css("overflow-y", oOverflows.overflowY);
			} else {
				this._bScrollable = false;
			}

			if (oAggregationGeometry.domRef && this._bScrollable ) {
				DOMUtil.syncScroll(oAggregationGeometry.domRef, this.$());
			}

			this.getChildren().forEach(function(oOverlay) {
				oOverlay.applyStyles();
			});
		}
	};

	/** 
	 * Returns an object, which describes the DOM geometry of the aggregation associated with this AggregationOverlay or null if it can't be found
	 * The geometry is calculated based on the associated aggregation's DOM reference, if it exists or based on this aggregation's public children
	 * Object may contain following fields: position - absolute position of aggregation in DOM; size - absolute size of aggregation in DOM
	 * Object may contain domRef field, when the associated aggregation's DOM can be found
	 * @return {object} geometry object describing the DOM of the aggregation associated with this AggregationOverlay 
	 * @public
	 */
	AggregationOverlay.prototype.getGeometry = function() {
		var oDomRef = this.getAssociatedDomRef();
		var mGeometry = DOMUtil.getGeometry(oDomRef);

		if (!mGeometry) {
			var aChildrenGeometry = [];
			this.getChildren().forEach(function(oOverlay) {
				aChildrenGeometry.push(oOverlay.getGeometry());
			});
			mGeometry = OverlayUtil.getGeometry(aChildrenGeometry);
		}

		return mGeometry;
	};

	/** 
	 * @private
	 */
	AggregationOverlay.prototype._updateDom = function() {
		var oAggregationGeometry = this.getGeometry();

		var oParent = this.getParent();
		if (oParent) {
			if (oParent.getDomRef) {
				this.$().appendTo(oParent.getDomRef());
			} else {
				this.$().appendTo(oParent.getRootNode());
			}
		}		
		if (oAggregationGeometry && this.isVisible()) {
			this.$().show();
		} else {
			this.$().hide();
		}

	};

	/** 
	 * @private
	 */
	AggregationOverlay.prototype._onScroll = function() {
		var oGeometry = this.getGeometry();
		var oAggregationDomRef = oGeometry ? oGeometry.domRef : null;
		if (oAggregationDomRef) {
			DOMUtil.syncScroll(this.$(), oAggregationDomRef);
		}
	};

	/**
	 * Returns the Element's instance, which aggregation is associated with this AggregationOverlay
	 * @return {sap.ui.core.Element} Element instance
	 * @public
	 */
	AggregationOverlay.prototype.getElementInstance = function() {
		var oElementOverlay = this.getParent();
		if (oElementOverlay) {
			return oElementOverlay.getElementInstance();
		}
	};	

	/** 
	 * Returns if the AggregationOverlay is scrollable
	 * @return {boolean} if the AggregationOverlay is scrollable
	 * @public
	 */
	AggregationOverlay.prototype.isScrollable = function() {
		return this._bScrollable;
	};	

	/** 
	 * Returns if the AggregationOverlay is droppable
	 * @public
	 * @return {boolean} if the AggregationOverlay is droppable
	 */
	AggregationOverlay.prototype.isDroppable = function() {
		return this.getDroppable();
	};	

	/** 
	 * Returns if the AggregationOverlay is visible
	 * @return {boolean} if the AggregationOverlay is visible
	 * @public
	 */
	AggregationOverlay.prototype.isVisible = function() {
		return this.getVisible();
	};	

	/** 
	 * Returns an array with Overlays for the public children of the aggregation, associated with this AggregationOverlay
	 * @return {sap.ui.dt.Overlay[]} children Overlays
	 * @public
	 */
	AggregationOverlay.prototype.getChildren = function() {
		return this.getAggregation("children") || [];
	};	

	return AggregationOverlay;
}, /* bExport= */ true);
