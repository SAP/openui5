/*!
 * ${copyright}
 */

/**
 * Contains functionality that is used in sap.m.IconTabBar Drag&Drop
 */
sap.ui.define([
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo',
	"sap/ui/events/KeyCodes"
],
	function(DragInfo, DropInfo, KeyCodes) {
		"use strict";

		var INSERT_POSITION_BEFORE = "Before",
			INSERT_BEFORE = "insertBefore",
			INSERT_AFTER = "insertAfter",
			sInsertAfterBeforePosition,
			DRAG_DROP_GROUP_NAME = "IconTabReorder";

		var IconTabBarDragAndDropUtil = {


			/**
			 * Inserts control at correct place in the DOM.
			 * @param {String} sInsertAfterBeforePosition comes from drop event, it can be "Before" or "After"
			 * @param {object} $DraggedControl control that is being dragged
			 * @param {object} $DroppedControl control that the dragged control will be dropped on
			 */
			_insertControl: function(sInsertAfterBeforePosition, $DraggedControl, $DroppedControl)  {
				if (sInsertAfterBeforePosition === INSERT_AFTER) {
					$DraggedControl.insertAfter($DroppedControl);
				} else {
					$DraggedControl.insertBefore($DroppedControl);
				}
			},

			/**
			 * Handles drop event.
			 * @param {object} context from which context function is called (sap.m.IconTabHeader or sap.m.IconTabSelectList)
			 * @param {String} sDropPosition comes from drop event, it can be "Before" or "After"
			 * @param {object} oDraggedControl control that is being dragged
			 * @param {object} oDroppedControl control that the dragged control will be dropped on
			 * @param {boolean} bIgnoreRTL should RTL configuration be ignored for drag and drop logic
			 */
			handleDrop: function (context, sDropPosition, oDraggedControl, oDroppedControl, bIgnoreRTL) {
				var iBeginDragIndex = context.indexOfItem(oDraggedControl),
					iDropIndex = context.indexOfItem(oDroppedControl),
					$DraggedControl = oDraggedControl.$(),
					$DroppedControl = oDroppedControl.$(),
					iAggregationDropIndex = 0,
					bRtl = sap.ui.getCore().getConfiguration().getRTL(),
					bIsDropPositionBefore = sDropPosition === INSERT_POSITION_BEFORE;

				if (bRtl && !bIgnoreRTL) {
					if (bIsDropPositionBefore) {
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex : iDropIndex + 1;
						sInsertAfterBeforePosition = INSERT_AFTER;
					} else {
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex - 1 : iDropIndex;
						sInsertAfterBeforePosition = INSERT_BEFORE;
					}
				} else {
					if (bIsDropPositionBefore) {
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex - 1 : iDropIndex;
						sInsertAfterBeforePosition = INSERT_BEFORE;
					} else {
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex : iDropIndex + 1;
						sInsertAfterBeforePosition = INSERT_AFTER;
					}
				}

				IconTabBarDragAndDropUtil._insertControl(sInsertAfterBeforePosition, $DraggedControl, $DroppedControl);
				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(context, oDraggedControl, iAggregationDropIndex);
			},

			/**
			 * Recalculates and sets the correct aria-posinset attribute value.
			 * @private
			 */
			_updateAccessibilityInfo: function () {
				var oIconTabHeaderItems = this.getItems(),
					iAriaPointSet = 1,
					oItemDom;

				oIconTabHeaderItems.forEach(function (oItem) {
					oItemDom = oItem.getDomRef();
					if (oItemDom && oItemDom.getAttribute("aria-posinset") !== null) {
						oItemDom.setAttribute("aria-posinset", iAriaPointSet++);
					}
				});
			},

			/**
			 * Handles aggregation of control after drag and drop.
			 * @param {object}  oDraggedControl Dragged control
			 * @param {number}  iDropIndex Drop index
			 * @private
			 */
			_handleConfigurationAfterDragAndDrop: function (oDraggedControl, iDropIndex) {
				this.removeAggregation('items', oDraggedControl, true);
				this.insertAggregation('items', oDraggedControl, iDropIndex, true);
				IconTabBarDragAndDropUtil._updateAccessibilityInfo.call(this);
			},

			/**
			 * Decreases the drop index.
			 * @param iBeginDragIndex Index of dragged control
			 * @private
			 */
			_decreaseDropIndex: function (iBeginDragIndex) {
				if (iBeginDragIndex === 0) {
					sInsertAfterBeforePosition = INSERT_AFTER;
					return iBeginDragIndex;
				}
				sInsertAfterBeforePosition = INSERT_BEFORE;
				return iBeginDragIndex - 1;
			},

			/**
			 * Increases the drop index.
			 * @param {number} iBeginDragIndex Index of dragged control
			 * @param {number} iControlCount Number of controls
			 * @private
			 */
			_increaseDropIndex: function (iBeginDragIndex, iControlCount) {
				if (iBeginDragIndex === iControlCount - 1) {
					sInsertAfterBeforePosition = INSERT_BEFORE;
					return iBeginDragIndex;
				}
				sInsertAfterBeforePosition = INSERT_AFTER;
				return iBeginDragIndex + 1;
			},

			/**
			 * Moves focused control depending on the combinations of pressed keys.
			 *
			 * @param {object} oDraggedControl Control that is going to be moved
			 * @param {number} iKeyCode Key code
			 * @returns {boolean} returns true is scrolling will be needed
			 */
			moveItem: function (oDraggedControl, iKeyCode) {
				var $DraggedControl = oDraggedControl.$(),
					aItems = this.getItems(),
					iBeginDragIndex = this.indexOfItem(oDraggedControl),
					bRtl = sap.ui.getCore().getConfiguration().getRTL(),
					iNewDropIndex,
					$DroppedControl,
					oKeyCodes = KeyCodes;

				switch (iKeyCode) {
					//Handles Ctrl + Home
					case oKeyCodes.HOME:
						iNewDropIndex = 0;
						sInsertAfterBeforePosition = INSERT_BEFORE;
						break;
					//Handles Ctrl + End
					case  oKeyCodes.END:
						iNewDropIndex = aItems.length - 1;
						sInsertAfterBeforePosition = INSERT_AFTER;
						break;
					// Handles Ctrl + Left Arrow
					case oKeyCodes.ARROW_LEFT:
						if (bRtl) {
							iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems.length);
						} else {
							iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex);
						}
						break;
					// Handles Ctrl + Right Arrow
					case oKeyCodes.ARROW_RIGHT:
						if (bRtl) {
							iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex);
						} else {
							iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems.length);
						}
						break;
					// Handles	Ctrl + Arrow Down
					case oKeyCodes.ARROW_DOWN:
						iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems.length);
						break;
					// Handles Ctrl + Arrow Up
					case oKeyCodes.ARROW_UP:
						iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex);
						break;
					default:
						return;
				}

				$DroppedControl = aItems[iNewDropIndex].$();
				IconTabBarDragAndDropUtil._insertControl(sInsertAfterBeforePosition, $DraggedControl, $DroppedControl);
				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(this, oDraggedControl, iNewDropIndex);

				return true;
			},

			/**
			 * Retrieves drag and drop controls from sap.m.IconTabBarSelectList context.
			 * @param {array} aItems items of sap.m.IconTabBarSelectList
			 * @param {object} oDraggedControl item that is dragged
			 * @param {object} oDroppedControl item that the dragged control will be dropped on
			 */
			getDraggedDroppedItemsFromList: function (aItems, oDraggedControl, oDroppedControl) {
				var oDroppedListControl,
					oDraggedListControl,
					sItemId,
					sDraggedControlId = oDraggedControl.getId(),
					sDroppedControlId = oDroppedControl.getId();

				if (!aItems && !oDraggedControl && !oDroppedControl) {
					return null;
				}

				aItems.forEach(function (oItem) {
					sItemId = oItem.getId();
					if (!sItemId) {
						return;
					}
					if (sItemId === sDroppedControlId) {
						oDroppedListControl = oItem;
					}
					if (sItemId === sDraggedControlId) {
						oDraggedListControl = oItem;
					}
				});

				return {
					oDraggedControlFromList: oDraggedListControl,
					oDroppedControlFromList: oDroppedListControl
				};
			},

			/**
			 * Adding aggregations for  drag and drop.
			 * @param {object} context from which context function is called (sap.m.IconTabHeader or sap.m.IconTabSelectList)
			 * @param {string} sDropLayout Depending on the control we are dragging in, it could be Vertical or Horizontal
			 */
			setDragDropAggregations: function (context, sDropLayout) {
				var oIconTabHeader = context._oIconTabHeader ? context._oIconTabHeader : context;
				var sIconTabHeaderId = oIconTabHeader.getId();
				//Adding Drag&Drop configuration to the dragDropConfig aggregation if needed
				context.addDragDropConfig(new DragInfo({
					sourceAggregation: "items",
					groupName: DRAG_DROP_GROUP_NAME + sIconTabHeaderId
				}));
				context.addDragDropConfig(new DropInfo({
					targetAggregation: "items",
					dropPosition: "Between",
					dropLayout: sDropLayout,
					drop: context._handleDragAndDrop.bind(context),
					groupName: DRAG_DROP_GROUP_NAME + sIconTabHeaderId
				}));
			}
		};

		return IconTabBarDragAndDropUtil;
	});