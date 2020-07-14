/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/**
	 * Contains classes and helpers related to drag and drop functionality for grids.
	 * Uses same logic as implemented in <code>sap.ui.core.dnd.DragAndDrop</code> to ensure consistent behavior.
	 *
	 * Note: This module is used only when doing keyboard drag and drop
	 *
	 * @name sap.f.dnd.GridDnD
	 * @namespace
	 * @private
	 * @since 1.81
	 */

	var GridDnD = {};

	function createDragSession(oEvent, oDraggedControl, oDroppedControl) {
		// provide only a minimal set of sap.ui.core.dnd.DragSession capabilities, in order to make internal calculations
		return {
			/**
			 * Defines the visual configuration of the drop indicator for the current <code>DropInfo</code>.
			 *
			 * @param {object} mConfig Custom styles of the drop indicator.
			 * @protected
			 */
			setIndicatorConfig: jQuery.noop,

			/**
			 * Returns the dragged control, if available within the same UI5 application frame.
			 *
			 * @returns {sap.ui.core.Element|null}
			 * @protected
			 */
			getDragControl: function() {
				return oDraggedControl;
			}
		};
	}

	function getDragDropConfigs(oControl) {
		var oParent = oControl.getParent(),
			aSelfConfigs = (oControl.getDragDropConfig) ? oControl.getDragDropConfig() : [],
			aParentConfigs = (oParent && oParent.getDragDropConfig) ? oParent.getDragDropConfig() : [];

		return aSelfConfigs.concat(aParentConfigs);
	}

	function getValidDragInfos(oDragControl) {
		var aDragDropConfigs = getDragDropConfigs(oDragControl);
		return aDragDropConfigs.filter(function(oDragOrDropInfo) {
			return oDragOrDropInfo.isDraggable(oDragControl);
		});
	}

	function getValidDropInfos(oDropControl, aDragInfos, oEvent) {
		var aDragDropConfigs = getDragDropConfigs(oDropControl);
		aDragInfos = aDragInfos || [];

		return aDragDropConfigs.filter(function(oDragOrDropInfo) {
			// DragDropInfo defined at the drop target is irrelevant we only need DropInfos
			return !oDragOrDropInfo.isA("sap.ui.core.dnd.IDragInfo");
		}).concat(aDragInfos).filter(function(oDropInfo) {
			if (!oDropInfo.isDroppable(oDropControl, oEvent)) {
				return false;
			}

			// master group matches always
			var sDropGroupName = oDropInfo.getGroupName();
			if (!sDropGroupName) {
				return true;
			}

			// group name matching
			return aDragInfos.some(function(oDragInfo) {
				return oDragInfo.getGroupName() == sDropGroupName;
			});
		});
	}

	GridDnD.fireDnDByKeyboard = function (oDraggedControl, oDroppedControl, sDropPosition, oEvent) {
		var aValidDragInfos = getValidDragInfos(oDraggedControl);

		oEvent.dragSession = createDragSession(oEvent, oDraggedControl, oDroppedControl);

		if (!aValidDragInfos.length) {
			return;
		}

		// fire dragstart event of valid DragInfos and filter if preventDefault is called
		aValidDragInfos = oEvent.isMarked("NonDraggable") ? [] : aValidDragInfos.filter(function(oDragInfo) {
			return oDragInfo.fireDragStart(oEvent);
		});

		// check whether drag is possible
		if (!aValidDragInfos.length) {
			return;
		}

		var aValidDropInfos = getValidDropInfos(oDroppedControl.getParent(), aValidDragInfos, oEvent);

		// fire dragenter event of valid DropInfos and filter if preventDefault is called
		aValidDropInfos = aValidDropInfos.filter(function(oDropInfo) {
			return oDropInfo.fireDragEnter(oEvent);
		});

		aValidDropInfos.forEach(function (oDropConfig) {
			oDropConfig.fireDropEvent(
				null,
				oEvent.originalEvent,
				sDropPosition,
				oDraggedControl,
				oDroppedControl
			);
		});
	};

	return GridDnD;
}, /* bExport= */ true);