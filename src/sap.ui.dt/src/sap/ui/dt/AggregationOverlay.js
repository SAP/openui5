/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/ElementUtil'
],
function(jQuery, Control, DOMUtil, ElementUtil) {
	"use strict";


	/**
	 * Constructor for a new AggregationOverlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The AggregationOverlay allows to create an absolute positioned DIV above the associated
	 * control / element.
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
				aggregationName : {
					type : "string"
				},
				offset : {
					type : "object"
				},
				droppable : {
					type : "boolean",
					defaultValue : false
				}
			}, 
			aggregations : {
				children : {
					type : "sap.ui.dt.Overlay",
					multiple : true
				}
			},
			events : {
				droppableChange : {
					parameters : {
						droppable : "boolean"
					}
				}
			}
		}
	});

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.init = function() {
		this._mGeometry = null;
	};

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.exit = function() {
		this.removeAllChildren();
		this._mGeometry = null;
		this.setOffset(null);
	};

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getGeometry = function() {
		if (this._mGeometry) {
			return this._mGeometry;
		}

		var oOverlay = this.getParent();
		var oElement = oOverlay.getElementInstance();
		var sAggregationName = this.getAggregationName();
		var oElementGeometry = DOMUtil.getElementGeometry(oElement);
		var sCSSSelector;
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oAggregationMetadata = oDesignTimeMetadata.getAggregation(sAggregationName);
		if (oElementGeometry && oElementGeometry.domRef) {
			if (oAggregationMetadata.getAggregationDomRef) {
				sCSSSelector = oAggregationMetadata.getAggregationDomRef.call(oElement, sAggregationName);
			} else if (oAggregationMetadata.cssSelector) {
				sCSSSelector = oAggregationMetadata.cssSelector;
			}
			this._mGeometry = DOMUtil.getAggregationGeometryForCSSSelector(oElementGeometry.domRef, sCSSSelector);
		}

		if (!this._mGeometry) {
			var aAggregationElements = ElementUtil.getAggregation(oElement, sAggregationName);
			this._mGeometry = DOMUtil.getChildrenAreaGeometry(aAggregationElements);
		}

		return this._mGeometry;
	};

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.onBeforeRendering = function() {
		this._mGeometry = null;
	};

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.onAfterRendering = function() {
		this._attachScrollHandler();
	};

	/** 
	 * @private
	 */
	AggregationOverlay.prototype._attachScrollHandler = function() {
		var oAggregationDomRef = this.getGeometry().domRef;
		if (oAggregationDomRef) {
			var $this = this.$();
			$this.get(0).addEventListener("scroll", function(oEvent) {
				jQuery(oAggregationDomRef).scrollTop($this.scrollTop());
				jQuery(oAggregationDomRef).scrollLeft($this.scrollLeft());
			}, true);
		}
	};

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.setDroppable = function(bDroppable) {
		if (this.getDroppable() !== bDroppable) {
			this.setProperty("droppable", bDroppable);
			this.toggleStyleClass("sapUiDtAggregationOverlayDroppable", bDroppable);

			// TODO : cancelable
			this.fireDroppableChange({droppable : bDroppable});
		}
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getElementInstance = function() {
		var oElementOverlay = this.getParent();
		if (oElementOverlay) {
			return oElementOverlay.getElementInstance();
		}
	};	
	/** 
	 * @public
	 */
	AggregationOverlay.prototype.isDroppable = function() {
		return this.getDroppable();
	};	

	return AggregationOverlay;
}, /* bExport= */ true);