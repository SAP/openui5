/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/Utils',
	'sap/ui/dt/OverlayRegistry'
],
function(jQuery, Control, DOMUtil, Utils, OverlayRegistry) {
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
				}
			}, 
			aggregations : {
				children : {
					type : "sap.ui.dt.Overlay",
					multiple : true
				}
			}
		}
	});

	AggregationOverlay.prototype.init = function() {
		this._mGeometry = null;
	};


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
			var aAggregationElements = Utils.getAggregationValue(sAggregationName, oElement);
			this._mGeometry = DOMUtil.getChildrenAreaGeometry(aAggregationElements);
		}

		return this._mGeometry;
	};

	AggregationOverlay.prototype._syncChildrenOverlays = function() {
		var that = this;
		var oElement = this.getParent().getElementInstance();
		var sAggregationName = this.getAggregationName();
		var aAggregationElements = Utils.getAggregationValue(sAggregationName, oElement);

		jQuery.each(aAggregationElements, function(iIndex, oAggregationElement) {
			var oChildOverlay = OverlayRegistry.getOverlay(oAggregationElement);
			if (oChildOverlay) {
				that.addChild(oChildOverlay);
			}
		});
	};

	AggregationOverlay.prototype.onBeforeRendering = function() {
		this._mGeometry = null;
		this._syncChildrenOverlays();
	};

	AggregationOverlay.prototype.onAfterRendering = function() {
		var oAggregationDomRef = this.getGeometry().domRef;
		if (oAggregationDomRef) {
			var $this = this.$();
			$this[0].addEventListener("scroll", function(oEvent) {
				jQuery(oAggregationDomRef).scrollTop($this.scrollTop());
				jQuery(oAggregationDomRef).scrollLeft($this.scrollLeft());
			}, true);
		}
	};


	AggregationOverlay.prototype.exit = function() {
		this.removeAllChildren();
		this._mGeometry = null;
		this.setOffset(null);
	};

	return AggregationOverlay;
}, /* bExport= */ true);