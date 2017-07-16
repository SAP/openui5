/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayRegistry.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/dt/ElementUtil"
],
function(Element, ElementUtil) {
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

	var mOverlays = {};

	/**
	 * Returns a registered Overlay by element instance or id
	 * @param {string|sap.ui.core.Element} vElementOrId element instance or id
	 * @return {sap.ui.dt.Overlay} found overlay or undefined
	 * @public
	 */
	OverlayRegistry.getOverlay = function(vElementOrId) {
		var oElement = ElementUtil.getElementInstance(vElementOrId);
		if (oElement) {
			oElement = ElementUtil.fixComponentContainerElement(oElement);
			oElement = ElementUtil.fixComponentParent(oElement);
			if (oElement) {
				var sId = oElement.getId();
				return mOverlays[sId];
			}
		}
	};

	/**
	 * Registers an overlay for the element or element's id
	 * @param {string|sap.ui.core.Element} vElementOrId element instance or id
	 * @param {sap.ui.dt.Overlay} oOverlay overlay to register
	 * @public
	 */
	OverlayRegistry.register = function(vElementOrId, oOverlay) {
		var sId = getElementId(vElementOrId);
		mOverlays[sId] = oOverlay;
	};

	/**
	 * Deregisters an overlay for the given element or element's id
	 * @param {string|sap.ui.core.Element} vElementOrId element instance or id
	 * @public
	 */
	OverlayRegistry.deregister = function(vElementOrId) {
		var sId = getElementId(vElementOrId);
		delete mOverlays[sId];
	};

	/**
	 * Returns whether any overlay is registered in registry
	 * @return {boolean} whether any overlay is registered in registry
	 * @public
	 */
	OverlayRegistry.hasOverlays = function() {
		return !jQuery.isEmptyObject(mOverlays);
	};

	function getElementId (vElementOrId) {
		return (vElementOrId instanceof Element) ? vElementOrId.getId() : vElementOrId;
	}

	return OverlayRegistry;
}, /* bExport= */ true);
