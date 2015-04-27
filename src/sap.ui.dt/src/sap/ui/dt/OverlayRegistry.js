/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayRegistry.
sap.ui.define([
	"sap/ui/core/Element"
],
function(Element) {
	"use strict";

	/**
	 * Class for OverlayRegistry.
	 * 
	 * @class
	 * Registry for Overlays
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayRegistry
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var OverlayRegistry = {};

	var mOverlays = {};

	OverlayRegistry.getOverlay = function(vElementOrId) {
		var sId = getElementId(vElementOrId);
		return mOverlays[sId];
	};

	OverlayRegistry.register = function(vElementOrId, oOverlay) {
		var sId = getElementId(vElementOrId);
		mOverlays[sId] = oOverlay;
	};

	OverlayRegistry.deregister = function(vElementOrId) {
		var sId = getElementId(vElementOrId);
		delete mOverlays[sId];
	};

	OverlayRegistry.hasOverlays = function() {
		return !jQuery.isEmptyObject(mOverlays);
	};

	function getElementId (vElementOrId) {
		return (vElementOrId instanceof Element) ? vElementOrId.getId() : vElementOrId;
	}

	return OverlayRegistry;
}, /* bExport= */ true);
