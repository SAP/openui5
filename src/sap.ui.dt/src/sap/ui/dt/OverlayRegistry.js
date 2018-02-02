/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Util"
],
function(
	ManagedObject,
	ElementUtil,
	Util
) {
	"use strict";

	/**
	 * Class for OverlayRegistry.
	 *
	 * @class
	 * Static registry for Overlays
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayRegistry
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var OverlayRegistry = {};

	var S_ELEMENTOVERLAY_NAME = 'sap.ui.dt.ElementOverlay';
	var S_AGGREGATIONOVERLAY_NAME = 'sap.ui.dt.AggregationOverlay';

	var mOverlays = {};
	var mAliases = {};

	/**
	 * Returns a registered Overlay by element instance or id
	 * @param {string|sap.ui.core.Element} vElementOrId element instance or id
	 * @return {sap.ui.dt.Overlay} found overlay or undefined
	 * @public
	 */
	OverlayRegistry.getOverlay = function(vElementOrId) {
		var sId = (
			typeof vElementOrId === "string"
			? vElementOrId
			: ElementUtil.getElementInstance(vElementOrId) && ElementUtil.getElementInstance(vElementOrId).getId()
		);

		return mOverlays[sId] || mAliases[sId];
	};

	OverlayRegistry.getOverlays = function () {
		return Util.objectValues(mOverlays);
	};

	/**
	 * Registers an overlay for the element or element's id
	 * @param {string|sap.ui.core.Element} vElementOrId element instance or id
	 * @param {sap.ui.dt.Overlay} oOverlay overlay to register
	 * @public
	 */
	OverlayRegistry.register = function(oOverlay) {
		if (!isOverlay(oOverlay)) {
			var sLocation = 'sap.ui.dt.OverlayRegistry#register';
			var oError = new Error(sLocation + ' / Attempt to register illegal overlay');
			oError.name = sLocation;
			throw oError;
		}

		mOverlays[oOverlay.getId()] = oOverlay;

		// create alias for ElementOverlay
		if (oOverlay.getMetadata().getName() === S_ELEMENTOVERLAY_NAME) {
			mAliases[oOverlay.getAssociation('element')] = oOverlay;
		}
	};

	/**
	 * Deregisters an overlay from registry
	 * @param {sap.ui.dt.Overlay} oOverlay overlay instance
	 * @public
	 */
	OverlayRegistry.deregister = function(oOverlay) {
		if (!isOverlay(oOverlay)) {
			var sLocation = 'sap.ui.dt.OverlayRegistry#deregister';
			var oError = new Error(sLocation + ' / Attempt to deregister illegal overlay');
			oError.name = sLocation;
			throw oError;
		}

		delete mOverlays[oOverlay.getId()];

		if (oOverlay.getMetadata().getName() === S_ELEMENTOVERLAY_NAME) {
			delete mAliases[oOverlay.getAssociation('element')];
		}
	};

	/**
	 * Returns whether any overlay is registered in registry
	 * @return {boolean} whether any overlay is registered in registry
	 * @public
	 */
	OverlayRegistry.hasOverlays = function() {
		return !jQuery.isEmptyObject(mOverlays);
	};

	function isOverlay(oOverlay) {
		return (
			oOverlay instanceof ManagedObject
			&& [S_ELEMENTOVERLAY_NAME, S_AGGREGATIONOVERLAY_NAME].indexOf(oOverlay.getMetadata().getName()) > -1
		);
	}

	return OverlayRegistry;
}, /* bExport= */ true);
