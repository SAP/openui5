/*!
 * ${copyright}
 */
sap.ui.define([], function() {
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

	var GridKeyboardDnD = {};

	function createDragSession(oEvent, oDraggedControl, oDroppedControl, sDropPosition) {
		// provide only a minimal set of sap.ui.core.dnd.DragSession capabilities, in order to make internal calculations
		return {
			/**
			 * Defines the visual configuration of the drop indicator for the current <code>DropInfo</code>.
			 *
			 * @param {object} mConfig Custom styles of the drop indicator.
			 * @protected
			 */
			setIndicatorConfig: function() {},

			/**
			 * Returns the dragged control, if available within the same UI5 application frame.
			 *
			 * @returns {sap.ui.core.Element|null}
			 * @protected
			 */
			getDragControl: function() {
				return oDraggedControl;
			},

			/**
			 * Returns the control over which we drop.
			 *
			 * @returns {sap.ui.core.Element|null}
			 * @protected
			 */
			getDropControl: function() {
				return oDroppedControl;
			},

			/**
			 * Returns the drop position - "Before" or "After"
			 *
			 * @returns {string}
			 * @protected
			 */
			getDropPosition: function() {
				return sDropPosition;
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

	GridKeyboardDnD._filterDragInfos = function (aValidDragInfos, oEvent) {
		return aValidDragInfos.filter(function(oDragInfo) {
			return oDragInfo.fireDragStart(oEvent);
		});
	};

	GridKeyboardDnD._filterDropInfos = function (aValidDropInfos, oEvent) {
		return aValidDropInfos.filter(function(oDropInfo) {
			return oDropInfo.fireDragEnter(oEvent);
		});
	};

	GridKeyboardDnD._fireDrop = function (aDropInfos, oEvent) {
		aDropInfos.forEach(function (oDropInfo) {
			oDropInfo.fireDrop(oEvent);
		});
	};

	GridKeyboardDnD.fireDnD = function (oDraggedControl, aConfigs, oEvent) {
		var aValidDragInfos = getValidDragInfos(oDraggedControl);

		if (!aValidDragInfos.length) {
			return;
		}

		for (var i = 0; i < aConfigs.length; i++) {
			oEvent.dragSession = createDragSession(
				oEvent,
				oDraggedControl,
				aConfigs[i].item,
				aConfigs[i].dropPosition
			);

			// fire dragstart event of valid DragInfos and filter if preventDefault is called
			aValidDragInfos = oEvent.isMarked("NonDraggable") ? [] : this._filterDragInfos(aValidDragInfos, oEvent);

			// check whether drag is possible
			if (!aValidDragInfos.length) {
				continue;
			}

			// check if we can drop into that container
			var aValidDropInfos = getValidDropInfos(aConfigs[i].grid, aValidDragInfos, oEvent);

			// fire dragenter event of valid DropInfos and filter if preventDefault is called
			aValidDropInfos = this._filterDropInfos(aValidDropInfos, oEvent);

			if (aValidDropInfos.length > 0) {
				this._fireDrop(aValidDropInfos, oEvent);
				break;
			}
		}
	};

	return GridKeyboardDnD;
}, /* bExport= */ true);