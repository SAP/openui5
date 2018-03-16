/*!
 * ${copyright}
 */

/**
 * Contains functionality that is used in sap.m.IconTabBar Drag&Drop
 */
sap.ui.define([],
	function() {
		"use strict";

		var IconTabBarDragAndDropUtil = {

			/**
			 * Handles drop event.
			 * @param {String} sDropPosition comes from drop event, it can be "Before" or "After"
			 * @param {object} oDraggedControl control that is being dragged
			 * @param {object} oDroppedControl control that the dragged control will be dropped on
			 */
			handleDrop: function (sDropPosition, oDraggedControl, oDroppedControl) {
				var iBeginDragIndex = this.indexOfItem(oDraggedControl),
					iDropIndex = this.indexOfItem(oDroppedControl),
					$DraggedItem = oDraggedControl.$(),
					$itemAfter = oDroppedControl.$(),
					iAggregationDropIndex = 0,
					bRtl = sap.ui.getCore().getConfiguration().getRTL();

				if (bRtl) {
					if (sDropPosition === "Before") {
						$DraggedItem.insertAfter($itemAfter);
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex : iDropIndex + 1;
					} else {
						$DraggedItem.insertBefore($itemAfter);
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex - 1 : iDropIndex;
					}
				} else {
					if (sDropPosition === "Before") {
						$DraggedItem.insertBefore($itemAfter);
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex - 1 : iDropIndex;
					} else {
						$DraggedItem.insertAfter($itemAfter);
						iAggregationDropIndex = iBeginDragIndex < iDropIndex ? iDropIndex : iDropIndex + 1;
					}
				}

				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(this, oDraggedControl, iAggregationDropIndex);
			},

			/**
			 * Recalculates and sets the correct aria-posinset attribute value.
			 * @private
			 */
			_updateAccessibilityInfo: function () {
				var oIconTabHeaderItems = this.getAggregation("items"),
					iAriaPointSet = 1,
					oItemDom;

				oIconTabHeaderItems.forEach(function (oItem) {
					oItemDom = oItem.getDomRef();
					if (oItemDom && oItemDom.getAttribute("aria-posinset") !== null) {
						oItemDom.setAttribute("aria-posinset", iAriaPointSet++);
					}
				});
			},

			_handleConfigurationAfterDragAndDrop: function (oItemToBeMoved, iAggregationDropIndex) {
				this.removeAggregation('items', oItemToBeMoved, true);
				this.insertAggregation('items', oItemToBeMoved, iAggregationDropIndex, true);
				IconTabBarDragAndDropUtil._updateAccessibilityInfo.call(this);
			},

			/**
			 * Moves an item by a specific key code
			 *
			 * @param {object} oItem The event object
			 * @param {number} iKeyCode The key code
			 * @returns {boolean} returns true is scrolling will be needed
			 */
			moveItem: function (oItem, iKeyCode) {
				var $item = oItem.$(),
					aItems = this.getAggregation("items"),
					iBeginDragIndex = this.indexOfItem(oItem),
					bRtl = sap.ui.getCore().getConfiguration().getRTL(),
					iNewDropIndex;

				switch (iKeyCode) {
					//Handles Ctrl + Home
					case 36:
						iNewDropIndex = 0;
						break;
					//Handles Ctrl + End
					case  35:
						iNewDropIndex = aItems.length - 1;
						break;
					// Handles Ctrl + Left Arrow
					case 37:
						if (bRtl) {
							if (iBeginDragIndex === aItems.length - 1) {
								return;
							}
							iNewDropIndex = iBeginDragIndex + 1;
						} else {
							if (iBeginDragIndex === 0) {
								return;
							}
							iNewDropIndex = iBeginDragIndex - 1;
						}
						break;
					// Handles Ctrl + Right Arrow
					case 39:
						if (bRtl) {
							if (iBeginDragIndex === 0) {
								return;
							}
							iNewDropIndex = iBeginDragIndex - 1;
						} else {
							if (iBeginDragIndex === aItems.length - 1) {
								return;
							}
							iNewDropIndex = iBeginDragIndex + 1;
						}
						break;
					// Handles	Ctrl + Arrow Down
					case 40:
						if (iBeginDragIndex === aItems.length - 1) {
							return;
						}
						iNewDropIndex = iBeginDragIndex + 1;
						break;
					// Handles Ctrl + Arrow Up
					case 38:
						if (iBeginDragIndex === 0) {
							return;
						}
						iNewDropIndex = iBeginDragIndex - 1;
						break;
					default:
						return;
				}

				var $itemToBeReplaced = jQuery.sap.byId(aItems[iNewDropIndex].sId);
				// Handles Ctrl + Left Arrow || Ctrl + Arrow Up || Ctrl + Home
				if (iKeyCode === 37 || iKeyCode === 38 || iKeyCode === 36) {
					if (bRtl && iKeyCode !== 38) {
						$item.insertAfter($itemToBeReplaced);
					} else {
						$item.insertBefore($itemToBeReplaced);
					}
					// Handles Ctrl + Right Arrow || Ctrl + Arrow Down || Ctrl + End
				} else if (iKeyCode === 39 || iKeyCode === 40 || iKeyCode === 35) {
					if (bRtl && iKeyCode !== 40) {
						$item.insertBefore($itemToBeReplaced);
					} else {
						$item.insertAfter($itemToBeReplaced);
					}
				}

				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(this, oItem, iNewDropIndex);

				return true;
			}
		};

		return IconTabBarDragAndDropUtil;
	});