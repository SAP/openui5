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

	function _getDragPlugin(oDesignTime) {
		var oDragDropPlugin;
		oDesignTime.getPlugins().some(function(oPlugin) {
			if (oPlugin instanceof sap.ui.dt.plugin.DragDrop) {
				oDragDropPlugin = oPlugin;
				return true;
			}
		});
		return oDragDropPlugin;
	}

	/**
	 * Creates an Overlay for the element and starts the drag process, as soon as it's ready
	 *
	 * @param {Object} oElement element that is being dragged
	 * @param {Object} oDesignTime designtime in which the overlay should be created
	 * @param {Object} oEvent drag-event
	 * @returns {Promise} Returns a Promise which resolves when the drag has been started or rejects if there is no Drag Plugin in the designtime
	 */
	DragUtil.startDragWithElement = function(oElement, oDesignTime, oEvent) {
		var oDragDropPlugin = _getDragPlugin(oDesignTime);

		if (!oDragDropPlugin) {
			return Promise.reject(new Error("There is no DragDrop Plugin in the given designtime. This is needed to start Drag&Drop."));
		}

		return oDesignTime.createOverlay({
			element: oElement,
			root: true
		}).then(function(oOverlay) {
			oOverlay.fromOutside = true;
			oOverlay.placeInOverlayContainer();
			oDragDropPlugin.startDrag(oOverlay, oEvent);
		});
	};

	/**
	 * Drops the Element and ends the drag process
	 *
	 * @param {Object} oElement element that is being dragged
	 * @param {Object} oDesignTime designtime which the elements overlay belongs to
	 */
	DragUtil.dropElement = function(oElement, oDesignTime) {
		var oDragDropPlugin = _getDragPlugin(oDesignTime);

		if (!oDragDropPlugin) {
			return;
		}

		var oDraggedOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oElement);
		oDragDropPlugin.endDrag(oDraggedOverlay);
	};

	return DragUtil;
}, /* bExport= */ true);