/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil'
],
function(jQuery, Overlay, DOMUtil, ElementUtil, OverlayUtil) {
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
	 * @extends sap.ui.core.Overlay
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
	var AggregationOverlay = Overlay.extend("sap.ui.dt.AggregationOverlay", /** @lends sap.ui.dt.AggregationOverlay.prototype */ {
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
				 * Whether the AggregationOverlay is e.g. a drop target
				 */
				targetZone : {
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
				},
				/**
				 * [designTimeMetadata description]
				 * @type {Object}
				 */
				designTimeMetadata : {
					type : "sap.ui.dt.AggregationDesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				/**
				 * Event fired when the property "targetZone" was changed
				 */
				targetZoneChange : {
					parameters : {
						targetZone : { type : "boolean" }
					}
				}
			}
		}
	});

	/**
	 * Returns a DOM representation for an aggregation, associated with this AggregationOverlay, if it can be found or undefined
	 * Representation is searched in DOM based on DesignTimeMetadata defined for the parent Overlay
	 * @return {Element} Associated with this AggregationOverlay DOM Element or null, if it can't be found
	 * @public
	 */
	AggregationOverlay.prototype.getAssociatedDomRef = function() {
		var oElement = this.getElementInstance();
		var sAggregationName = this.getAggregationName();

		var oElementDomRef = ElementUtil.getDomRef(oElement);
		if (oElementDomRef) {
			var oDesignTimeMetadata = this.getDesignTimeMetadata();
			var vAggregationDomRef = oDesignTimeMetadata.getDomRef();
			if (typeof vAggregationDomRef === "function") {
				return vAggregationDomRef.call(oElement, sAggregationName);
			} else if (typeof vAggregationDomRef === "string") {
				return DOMUtil.getDomRefForCSSSelector(oElementDomRef, vAggregationDomRef);
			}
		}
	};

	/**
	 * Sets a property "targetZone", toggles a CSS class for the DomRef based on a property's value and fires "targetZoneChange" event
	 * @param {boolean} bTargetZone state to set
	 * @returns {sap.ui.dt.AggregationOverlay} returns this
	 * @public
	 */
	AggregationOverlay.prototype.setTargetZone = function(bTargetZone) {
		if (this.getTargetZone() !== bTargetZone) {
			this.setProperty("targetZone", bTargetZone);
			this.toggleStyleClass("sapUiDtOverlayTargetZone", bTargetZone);

			this.fireTargetZoneChange({targetZone : bTargetZone});
		}

		return this;
	};

	/**
	 * Returns if the AggregationOverlay is a target zone
	 * @public
	 * @return {boolean} if the AggregationOverlay is a target zone
	 */
	AggregationOverlay.prototype.isTargetZone = function() {
		return this.getTargetZone();
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
