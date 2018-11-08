/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DragUtil
sap.ui.define([
	'sap/ui/dt/OverlayRegistry'
],
function(
	OverlayRegistry
) {
	"use strict";

	/**
	 * Class for Drag Utils.
	 *
	 * @class
	 * Utility functionality for Drag&Drop
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.54
	 * @alias sap.ui.dt.DragUtil
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DragUtil = {};

	function _getDragPlugin(oRta) {
		return oRta.getPlugins()["dragDrop"];
	}

	/**
	 * Creates an Overlay for the element and starts the drag process, as soon as it's ready
	 *
	 * @param {Object} oElement element that is being dragged
	 * @param {Object} oRta Runtime Authoring instance
	 * @param {Object} oEvent drag-event
	 * @returns {Promise} Returns a Promise which resolves when the drag has been started or rejects if there is no Drag Plugin in the designtime
	 */
	DragUtil.startDragWithElement = function(oElement, oRta, oEvent) {
		var oOutsideDragDropPlugin = _getDragPlugin(oRta);

		if (!oOutsideDragDropPlugin) {
			return Promise.reject(new Error("There is no DragDrop Plugin in the given designtime. This is needed to start Drag&Drop."));
		}

		return oRta._oDesignTime.createOverlay({
			element: oElement,
			root: true
		}).then(function(oOverlay) {
			oOverlay.placeInOverlayContainer();
			oOutsideDragDropPlugin.onDragStart(oOverlay, oEvent);
		});
	};

	/**
	 * Drops the Element and ends the drag process
	 *
	 * @param {Object} oElement element that is being dragged
	 * @param {Object} oRta Runtime authoring instance
	 */
	DragUtil.dropElement = function(oElement, oRta) {
		var oDragDropPlugin = _getDragPlugin(oRta);

		if (!oDragDropPlugin) {
			return;
		}

		var oDraggedOverlay = OverlayRegistry.getOverlay(oElement);
		oDragDropPlugin.onDragEnd(oDraggedOverlay);
	};

	return DragUtil;
}, /* bExport= */ true);