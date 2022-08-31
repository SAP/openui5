/*!
 * ${copyright}
 */

/**
 * Contains functionality that is used in sap.m.IconTabBar Drag&Drop
 */
sap.ui.define([
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo',
	"sap/ui/events/KeyCodes",
	'sap/ui/core/library',
	'sap/ui/core/Configuration'
],
	function(DragInfo, DropInfo, KeyCodes, coreLibrary, Configuration) {
		"use strict";

		// shortcut for sap.ui.core.dnd.DropPosition
		var DropPosition = coreLibrary.dnd.DropPosition;

		var INSERT_POSITION_BEFORE = "Before",
			INSERT_BEFORE = "insertBefore",
			INSERT_AFTER = "insertAfter",
			sInsertAfterBeforePosition,
			DRAG_DROP_GROUP_NAME = "IconTabReorder",
			DRAG_DIRECTION_FORWARD = "Forward",
			DRAG_DIRECTION_BACKWARD = "Backward";

		var IconTabBarDragAndDropUtil = {


			/**
			 * Inserts control at correct place in the DOM.
			 * @param {string} sInsertAfterBeforePosition comes from drop event, it can be "Before" or "After"
			 * @param {object} oDraggedControl control that is being dragged
			 * @param {object} oDroppedControl control that the dragged control will be dropped on
			 * @param {boolean} bIsOverflow
			 */
			_insertControl: function(sInsertAfterBeforePosition, oDraggedControl, oDroppedControl, bIsOverflow) {
				var $DraggedControl = oDraggedControl.$(),
					$DroppedControl = oDroppedControl.$(),
					aDraggedControlSubItems = [],
					aDroppedControlSubItems = [];

				if (oDraggedControl._getNestedLevel() > 1 && oDroppedControl._getNestedLevel() > 1) {

					aDraggedControlSubItems = oDraggedControl._getRootTab()._getSelectList().getItems().filter(function (oItem) {
						return oDraggedControl._getRealTab()._isParentOf(oItem._getRealTab());
					});

					aDroppedControlSubItems = oDroppedControl._getRootTab()._getSelectList().getItems().filter(function (oItem) {
						return oDroppedControl._getRealTab()._isParentOf(oItem._getRealTab());
					});
				}

				if (bIsOverflow) {
					var aOverflowSelectListItems = oDraggedControl._getRootTab().getParent()._getOverflow()._getSelectList().getItems();

					aDraggedControlSubItems = aOverflowSelectListItems.filter(function (oItem) {
						return oDraggedControl._getRealTab()._isParentOf(oItem._getRealTab());
					});

					aDroppedControlSubItems = aOverflowSelectListItems.filter(function (oItem) {
						return oDroppedControl._getRealTab()._isParentOf(oItem._getRealTab());
					});
				}

				if (sInsertAfterBeforePosition === INSERT_AFTER) {
					$DraggedControl.insertAfter($DroppedControl);
				} else {
					$DraggedControl.insertBefore($DroppedControl);
				}

				aDraggedControlSubItems.reverse().forEach(function (oChildItem) {
					oChildItem.$().insertAfter($DraggedControl);
				});
				aDroppedControlSubItems.reverse().forEach(function (oChildItem) {
					oChildItem.$().insertAfter($DroppedControl);
				});
			},

			/**
			 * Handles drop event.
			 * @param {object} oContext from which context function is called (sap.m.IconTabHeader or sap.m.IconTabSelectList)
			 * @param {string} sDropPosition comes from drop event, it can be "Before", "After", or "On"
			 * @param {object} oDraggedControl control that is being dragged
			 * @param {object} oDroppedControl control that the dragged control will be dropped on
			 * @param {boolean} bIgnoreRTL should RTL configuration be ignored for drag and drop logic
			 * @param {number} allowedNestingLevels allowed number of nesting tabs via drag and drop
			 */
			handleDrop: function (oContext, sDropPosition, oDraggedControl, oDroppedControl, bIgnoreRTL, allowedNestingLevels) {
				var iBeginDragIndex = oContext.indexOfItem(oDraggedControl),
					iDropIndex = oContext.indexOfItem(oDroppedControl),
					iAggregationDropIndex = 0,
					bRtl = Configuration.getRTL(),
					bIsDropPositionBefore = sDropPosition === INSERT_POSITION_BEFORE,
					//_getNestedLevel returns 1 there is no nesting
					currentNestedLevel = oDroppedControl._getNestedLevel() - 1;

				// Prevent cycle
				if (oDraggedControl._isParentOf(oDroppedControl)) {
					return;
				}

				if (currentNestedLevel === allowedNestingLevels && sDropPosition === DropPosition.On) {
					return;
				}

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

				if (oContext.isA("sap.m.IconTabFilter") || !oDraggedControl.getParent().isA("sap.m.IconTabHeader")){
					if (bIsDropPositionBefore) {
						iAggregationDropIndex = iDropIndex;
					} else {
						iAggregationDropIndex = iDropIndex + 1;
					}
				}

				IconTabBarDragAndDropUtil._insertControl(sInsertAfterBeforePosition, oDraggedControl, oDroppedControl);

				if (sDropPosition === DropPosition.On) {
					if (oDroppedControl === oDraggedControl) {
						return;
					}
					iAggregationDropIndex = oContext.getAggregation("items").length;
				}

				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(oContext, oDraggedControl, iAggregationDropIndex);
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

				var aDraggedControlSubItems = [],
					oIconTabHeader = this.isA("sap.m.IconTabHeader") ? this : this._getIconTabHeader();

				if (this.isA("sap.m.IconTabBarSelectList")) {
					aDraggedControlSubItems = this.getItems().filter(function (oItem) {
						return oDraggedControl._getRealTab()._isParentOf(oItem._getRealTab());
					});
				}

				oIconTabHeader._setPreserveSelection(true);

				this.removeAggregation('items', oDraggedControl, true);
				this.insertAggregation('items', oDraggedControl, iDropIndex, true);

				aDraggedControlSubItems.forEach(function (oItem) {
					this.removeAggregation('items', oItem, true);
				}.bind(this));

				var iNewDragIndex = 1 + this.indexOfAggregation('items', oDraggedControl);

				aDraggedControlSubItems.reverse().forEach(function (oItem) {
					this.insertAggregation('items', oItem, iNewDragIndex, true);
				}.bind(this));

				oIconTabHeader._setPreserveSelection(false);

				IconTabBarDragAndDropUtil._updateAccessibilityInfo.call(this);
			},

			/**
			 * Decreases the drop index.
			 * @param {int} iBeginDragIndex Index of dragged control
			 * @param {sap.m.IconTabFilter[]} aItems All items in the header/select list
			 * @returns {int} The new index of the item
			 * @private
			 */
			_decreaseDropIndex: function (iBeginDragIndex, aItems) {
				var iPrevIndex = iBeginDragIndex - 1;

				// Jump over invisible items and sub items
				while (iPrevIndex >= 0 &&
					(aItems[iBeginDragIndex]._getRealTab()._getNestedLevel() !== aItems[iPrevIndex]._getRealTab()._getNestedLevel() ||
						!aItems[iPrevIndex].getVisible() || (!aItems[iBeginDragIndex].$().hasClass("sapMITBFilterHidden") && aItems[iPrevIndex].$().hasClass("sapMITBFilterHidden")))) {

					iPrevIndex--;
				}

				if (iPrevIndex < 0) {
					sInsertAfterBeforePosition = INSERT_AFTER;
					return iBeginDragIndex;
				}

				sInsertAfterBeforePosition = INSERT_BEFORE;
				return iPrevIndex;
			},

			/**
			 * Increases the drop index.
			 * @param {int} iBeginDragIndex Index of dragged control
			 * @param {array} aItems All items in the header
			 * @param {int} iMaxIndex Maximum allowed index. For the header this is the end of the tab strip.
			 * @returns {int} The new index of the item
			 * @private
			 */
			_increaseDropIndex: function (iBeginDragIndex, aItems, iMaxIndex) {
				var iNextIndex = iBeginDragIndex + 1;
				// Jump over invisible items and sub items
				while (iNextIndex < aItems.length &&
					(aItems[iBeginDragIndex]._getRealTab()._getNestedLevel() !== aItems[iNextIndex]._getRealTab()._getNestedLevel() || !aItems[iNextIndex].getVisible())) {

					iNextIndex++;
				}

				if (iNextIndex > iMaxIndex) {
					sInsertAfterBeforePosition = INSERT_BEFORE;
					return iBeginDragIndex;
				}

				sInsertAfterBeforePosition = INSERT_AFTER;
				return iNextIndex;
			},

			/**
			 * Moves focused control depending on the combinations of pressed keys.
			 *
			 * @param {object} oDraggedControl Control that is going to be moved
			 * @param {number} iKeyCode Key code
			 * @param {int} iMaxIndex Maximum allowed index. For the header this is the end of the tab strip.
			 * @returns {boolean} returns true is scrolling will be needed
			 */
			moveItem: function (oDraggedControl, iKeyCode, iMaxIndex) {
				var aItems = this.getItems(),
					iBeginDragIndex = this.indexOfItem(oDraggedControl),
					bRtl = Configuration.getRTL(),
					iNewDropIndex,
					bPrevent;

				if (this.isA("sap.m.IconTabFilter")){
					aItems = this._getRealTab().getItems();
				}

				switch (iKeyCode) {
					//Handles Ctrl + Home
					case KeyCodes.HOME:
						iNewDropIndex = 0;
						sInsertAfterBeforePosition = INSERT_BEFORE;
						break;
					//Handles Ctrl + End
					case KeyCodes.END:
						iNewDropIndex = aItems.length - 1;
						sInsertAfterBeforePosition = INSERT_AFTER;
						break;
					// Handles Ctrl + Left Arrow
					case KeyCodes.ARROW_LEFT:
						if (bRtl) {
							bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_FORWARD, this);
							iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems, iMaxIndex);
						} else {
							bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_BACKWARD, this);
							iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex, aItems);
						}
						break;
					// Handles Ctrl + Right Arrow
					case KeyCodes.ARROW_RIGHT:
						if (bRtl) {
							bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_BACKWARD, this);
							iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex, aItems);
						} else {
							bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_FORWARD, this);
							iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems, iMaxIndex);
						}
						break;
					// Handles	Ctrl + Arrow Down
					case KeyCodes.ARROW_DOWN:
						bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_FORWARD, this);
						iNewDropIndex = IconTabBarDragAndDropUtil._increaseDropIndex(iBeginDragIndex, aItems, iMaxIndex);
						break;
					// Handles Ctrl + Arrow Up
					case KeyCodes.ARROW_UP:
						bPrevent = IconTabBarDragAndDropUtil.preventDragBetweenSubItems(oDraggedControl, DRAG_DIRECTION_BACKWARD, this);
						iNewDropIndex = IconTabBarDragAndDropUtil._decreaseDropIndex(iBeginDragIndex, aItems);
						break;
					default:
						return false;
				}

				if (bPrevent) {
					return false;
				}

				if (!this.isA("sap.m.IconTabFilter")) {
					var oDroppedControl = aItems[iNewDropIndex];
					IconTabBarDragAndDropUtil._insertControl(sInsertAfterBeforePosition, oDraggedControl, oDroppedControl, this._oTabFilter && this._oTabFilter._bIsOverflow);
				}

				IconTabBarDragAndDropUtil._handleConfigurationAfterDragAndDrop.call(this, oDraggedControl, iNewDropIndex);

				return true;
			},

			/**
			 * Adding aggregations for drag and drop.
			 * @param {object} context from which context function is called (sap.m.IconTabHeader or sap.m.IconTabSelectList)
			 * @param {string} sDropLayout Depending on the control we are dragging in, it could be Vertical or Horizontal
			 * @param {object} oDropPosition Depending on maxNestingLevel, value could be 'On' or 'Between'
			 */
			setDragDropAggregations: function (context, sDropLayout, oDropPosition) {
				var oIconTabHeader = context._oIconTabHeader ? context._oIconTabHeader : context;
				var sIconTabHeaderId = oIconTabHeader.getId();
				//Adding Drag&Drop configuration to the dragDropConfig aggregation if needed
				context.addDragDropConfig(new DragInfo({
					sourceAggregation: "items",
					groupName: DRAG_DROP_GROUP_NAME + sIconTabHeaderId
				}));
				context.addDragDropConfig(new DropInfo({
					targetAggregation: "items",
					dropPosition: oDropPosition,
					dropLayout: sDropLayout,
					drop: context._handleDragAndDrop.bind(context),
					groupName: DRAG_DROP_GROUP_NAME + sIconTabHeaderId
				}));
			},

			/**
			 * Prevents drag and drop to be executed between different level sub items in sap.m.IconTabBarSelectList.
			 * @param {object} oDraggedControl Control that is going to be moved
			 * @param {string} sDirection Depending on the direction of we are dragging in, it could be Forward or Backward
			 * @param {object} oContext from which context function is called (sap.m.IconTabHeader or sap.m.IconTabSelectList)
			 *
			 * @returns {boolean} returns true is scrolling will be needed
			 */
			preventDragBetweenSubItems: function (oDraggedControl, sDirection, oContext) {
				var bPrevent = false;
				if (oContext.isA("sap.m.IconTabBarSelectList")) {
					var oRealTab = oDraggedControl._getRealTab(),
						oParent = oRealTab.getParent(),
						aChildren = oParent.getItems();

					if ((aChildren.indexOf(oRealTab)  === 0 && sDirection === DRAG_DIRECTION_BACKWARD)
						|| (aChildren.indexOf(oRealTab) + 1 === aChildren.length && sDirection === DRAG_DIRECTION_FORWARD)
						|| aChildren.length === 1) {
						bPrevent = true;
					}
				}
				return bPrevent;
			}
		};

		return IconTabBarDragAndDropUtil;
	});
