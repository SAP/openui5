/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayUtil.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/OverlayRegistry'	
],
function(jQuery, OverlayRegistry) {
	"use strict";

	/**
	 * Class for OverlayUtil.
	 * 
	 * @class
	 * Utility functionality to work with controls, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var OverlayUtil = {};

	OverlayUtil.getClosestOverlay = function(oElement) {
		var oParent = oElement.getParent();
		var oParentOverlay = OverlayRegistry.getOverlay(oParent);
		while (oParent && !oParentOverlay) {
			oParent = oParent.getParent();
			oParentOverlay = OverlayRegistry.getOverlay(oParent);
		}

		return oParentOverlay;
	};

	return OverlayUtil;
}, /* bExport= */ true);
