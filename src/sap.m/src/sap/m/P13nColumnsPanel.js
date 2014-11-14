/*!
 * ${copyright}
 */

// Provides control sap.m.P13nColumnsPanel.
sap.ui.define(['jquery.sap.global', './ColumnListItem', './P13nPanel', './P13nColumnsItem', './SearchField', './Table',
		'./library', 'sap/ui/core/Control'], function(jQuery, ColumnListItem, P13nPanel, P13nColumnsItem, SearchField,
		Table, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nColumnsPanel.
	 * 
	 * @param {string}
	 *          [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new control
	 * @class The ColumnsPanel can be used for personalization of the table to define column specific settings
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * @constructor
	 * @public
	 * @name sap.m.P13nColumnsPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nColumnsPanel = P13nPanel.extend("sap.m.P13nColumnsPanel", /** @lends sap.m.P13nColumnsPanel.prototype */
	{
		metadata : {
			library : "sap.m",
			aggregations : {
				/**
				 * list of columns that has been changed
				 */
				columnsItems : {
					type : "sap.m.P13nColumnsItem",
					multiple : true,
					singularName : "columnsItem",
					bindable : "bindable"
				}
			},
			events : {

				/**
				 * event raised when a columnsItem was added
				 */
				addColumnsItem : {
					parameters : {
						/**
						 * item added
						 */
						newItem : {
							type : "sap.m.P13nColumnsItem"
						}
					}
				},

				/**
				 * event raised when a columnsItem was removed
				 */
				removeColumnsItem : {
					/**
					 * item removed
					 */
					item : {
						type : "sap.m.P13nColumnsItem"
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the ColumnsPanel control,
	// */

	/* =========================================================== */
	/* Private methods and properties */
	/* =========================================================== */

	/**
	 * Move selected item to begin of the item list
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveToTop = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1, sItemKey = null, aTableItems = null;

		if (this._oSelectedItem) {

			// Determine new and old item index
			sItemKey = this._oSelectedItem.data('P13nColumnKey');
			aTableItems = this._oTable.getItems();
			iOldItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);

			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex > 0) {
				iNewItemIndex = 0;
			}

			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};

	/**
	 * Move selected item one position up
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveUp = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1, sItemKey = null, aTableItems = null;

		if (this._oSelectedItem) {

			// Determine new and old item index
			sItemKey = this._oSelectedItem.data('P13nColumnKey');
			aTableItems = this._oTable.getItems();
			iOldItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);

			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex > 0) {
				if (this._bShowSelected === true) {
					// Table items are filtered by "Show Selected" --> determine previous table item that is selected
					iNewItemIndex = this._getPreviousSelectedItemIndex(iOldItemIndex);
				} else {
					iNewItemIndex = iOldItemIndex - 1;
				}
			}

			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};

	/**
	 * Move selected item one position down
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveDown = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1, sItemKey = null, aTableItems = null;
		var iTableMaxIndex = null;

		if (this._oSelectedItem) {
			iTableMaxIndex = this._oTable.getItems().length;

			// Determine new and old item index
			sItemKey = this._oSelectedItem.data('P13nColumnKey');
			aTableItems = this._oTable.getItems();
			iOldItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);

			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex < iTableMaxIndex - 1) {
				if (this._bShowSelected === true) {
					// Table items are filtered by "Show Selected" --> determine previous table item that is selected
					iNewItemIndex = this._getNextSelectedItemIndex(iOldItemIndex);
				} else {
					iNewItemIndex = iOldItemIndex + 1;
				}
			}

			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};

	/**
	 * Move selected item to end of the item list
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveToBottom = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1, sItemKey = null, aTableItems = null;
		var iTableMaxIndex = null;

		if (this._oSelectedItem) {
			iTableMaxIndex = this._oTable.getItems().length;

			// Determine new and old item index
			sItemKey = this._oSelectedItem.data('P13nColumnKey');
			aTableItems = this._oTable.getItems();
			iOldItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);

			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex < iTableMaxIndex) {
				iNewItemIndex = iTableMaxIndex - 1;
			}

			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};

	/**
	 * Moves a given table item from old table index to a new given table index
	 * 
	 * @private
	 * @param {integer}
	 *          iOldIndex is the item start index
	 * @param {integer}
	 *          iNewIndex is the item target index
	 */
	P13nColumnsPanel.prototype._moveItem = function(iOldIndex, iNewIndex) {
		var aModelItems = null;
		var iLength = -1;

		if (iOldIndex !== null && iNewIndex !== null && iOldIndex != iNewIndex) {
			aModelItems = this._oTable.getItems();
			if (aModelItems && aModelItems.length) {
				iLength = aModelItems.length;

				// Boundary check
				if (iOldIndex > -1 && iOldIndex <= iLength - 1 && iNewIndex > -1 && iNewIndex <= iLength - 1) {
					this._handleMoveItem(this._oSelectedItem, aModelItems[iNewIndex]);
				}
			}
		}
	};

	/**
	 * Handles the direct item move
	 * 
	 * @private
	 * @param {object}
	 *          oOldItem is the first item for content swop
	 * @param {object}
	 *          oNewItem is the second item for content swop
	 */
	P13nColumnsPanel.prototype._handleMoveItem = function(oOldItem, oNewItem) {
		var aTableItems, i = 0;
		var iOldIndex = null, iNewIndex = null;
		var oSwopTableItem1 = null, oSwopTableItem2 = null;

		if (oNewItem === null || oOldItem === null) {
			return;
		}

		if (this._oTable !== null) {
			iOldIndex = this._oTable.indexOfItem(oOldItem);
			iNewIndex = this._oTable.indexOfItem(oNewItem);
		}

		// Items are direct neighbors -> just swop it
		if (iOldIndex !== null && iNewIndex !== null && (Math.abs(iOldIndex - iNewIndex) == 1)) {
			this._handleItemIndexChanged(oOldItem, iNewIndex);
			this._handleItemIndexChanged(oNewItem, iOldIndex);
		} else {
			// Items are NO direct neighbors -> just swop item by item as long as item did reach the new position
			aTableItems = this._oTable.getItems();
			if (aTableItems && aTableItems.length) {
				if (iOldIndex > iNewIndex) {
					for (i = iOldIndex; i > iNewIndex; i--) {
						oSwopTableItem1 = this._oTable.getItems()[i];
						oSwopTableItem2 = this._oTable.getItems()[i - 1];

						this._handleItemIndexChanged(oSwopTableItem1, i - 1);
						this._handleItemIndexChanged(oSwopTableItem2, i);
					}
				} else {
					for (i = iOldIndex; i < iNewIndex; i++) {
						oSwopTableItem1 = this._oTable.getItems()[i];
						oSwopTableItem2 = this._oTable.getItems()[i + 1];

						this._handleItemIndexChanged(oSwopTableItem1, i + 1);
						this._handleItemIndexChanged(oSwopTableItem2, i);
					}
				}
			}
		}
		this._afterMoveItem();
	};

	/**
	 * After an items was moved renewal selected items instance and it's selection
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._afterMoveItem = function() {
		this._scrollToSelectedItem(this._oSelectedItem);
		this._calculateMoveButtonAppearance();
	};

	/**
	 * Swop "Show Selected" button to "Show All"
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._swopShowSelectedButton = function() {
		var sNewButtonText;

		// Swop the button text
		this._bShowSelected = !this._bShowSelected;
		if (this._bShowSelected) {
			sNewButtonText = this._oRb.getText('COLUMNSPANEL_SHOW_ALL');
		} else {
			sNewButtonText = this._oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
		}
		this._oShowSelectedButton.setText(sNewButtonText);

		this._filterItems();
		if (this._oSelectedItem && this._oSelectedItem.getVisible() !== true) {
			this._deactivateSelectedItem();
		}
		this._fnHandleResize();
	};

	/**
	 * Filters items by its selection status
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._filterItems = function() {
		var aSelectedItems = null, aTableItems = null;
		var iLength = 0, jLength = 0, i = 0, j = 0;
		var oItem = null, oItemTemplate = null;
		var bItemVisibleBySearchText, bItemVisibleBySelection;
		var sItemText = null, sSearchText = null, regExp = null;

		// Get table items according "Show Selected" button status
		if (this._bShowSelected) {
			aSelectedItems = this._oTable.getSelectedItems();
		} else {
			aSelectedItems = this._oTable.getItems();
		}

		// Get search filter value
		if (this._bSearchFilterActive) {
			sSearchText = this._oSearchField.getValue();
			if (sSearchText !== null) {
				regExp = new RegExp(sSearchText, 'igm'); // i = ignore case; g = global; m = multiline
			}
		}

		aTableItems = this._oTable.getItems();
		iLength = aTableItems.length;
		for (i = 0; i < iLength; i++) {
			oItem = aTableItems[i];
			bItemVisibleBySearchText = true;
			bItemVisibleBySelection = false;

			// Is filtering via search text active
			if (this._bSearchFilterActive) {
				bItemVisibleBySearchText = false;

				// search in item text
				sItemText = oItem.getCells()[0].getText();
				if (sItemText && regExp !== null && sItemText.match(regExp) !== null) {
					bItemVisibleBySearchText = true;
				}

				// search in tooltip text of actual item
				if (bItemVisibleBySearchText !== true && oItem.getTooltip_Text) {
					sItemText = (oItem.getTooltip() instanceof sap.ui.core.TooltipBase
							? oItem.getTooltip().getTooltip_Text()
							: oItem.getTooltip_Text());
					if (sItemText && regExp !== null && sItemText.match(regExp) !== null) {
						bItemVisibleBySearchText = true;
					}
				}
			}
			// Is filtering via selection active
			jLength = aSelectedItems.length;
			for (j = 0; j < jLength; j++) {
				oItemTemplate = aSelectedItems[j];
				if (oItemTemplate) {
					if (oItemTemplate.getId() == oItem.getId()) {
						bItemVisibleBySelection = true;
						break;
					}
				}
			}
			oItem.setVisible(bItemVisibleBySelection && bItemVisibleBySearchText);
		}
	};

	/**
	 * Execute search by filtering columns list based on the given sValue
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._executeSearch = function() {
		var sValue = this._oSearchField.getValue();
		var iLength = sValue.length || 0;

		if (iLength > 0) {
			this._bSearchFilterActive = true;
			this._deactivateSelectedItem();
		} else {
			this._bSearchFilterActive = false;
		}

		this._filterItems();
	};

	/**
	 * Determine the previous selected table item index to that position, which is coming via iStartIndex
	 * 
	 * @private
	 * @param {inteter}
	 *          iStartIndex is the table index from where the search start
	 * @returns {integer} is the index of the previous items that is selected; if no item is found it will be returned -1
	 */
	P13nColumnsPanel.prototype._getPreviousSelectedItemIndex = function(iStartIndex) {
		var iResult = -1, i = 0;
		var aTableItems = this._oTable.getItems(), oTableItem = null;

		if (iStartIndex !== null && iStartIndex !== undefined && iStartIndex > 0) {
			if (aTableItems && aTableItems.length > 0) {
				for (i = iStartIndex - 1; i >= 0; i--) {
					oTableItem = aTableItems[i];
					if (oTableItem && oTableItem.getSelected() === true) {
						iResult = i;
						break;
					}
				}
			}
		}

		return iResult;
	};

	/**
	 * Determine the next selected table item index to that position, which is coming via iStartIndex
	 * 
	 * @private
	 * @param {inteter}
	 *          iStartIndex is the table index from where the search start
	 * @returns {integer} is the index of the next items to that, which is selected; if no item is found it will be
	 *          returned -1
	 */
	P13nColumnsPanel.prototype._getNextSelectedItemIndex = function(iStartIndex) {
		var iResult = -1, i = 0, iLength = null;
		var aTableItems = this._oTable.getItems(), oTableItem = null;

		if (aTableItems && aTableItems.length > 0) {
			iLength = aTableItems.length;
			if (iStartIndex !== null && iStartIndex !== undefined && iStartIndex >= 0 && iStartIndex < iLength - 1) {
				for (i = iStartIndex + 1; i < iLength; i++) {
					oTableItem = aTableItems[i];
					if (oTableItem && oTableItem.getSelected() === true) {
						iResult = i;
						break;
					}
				}
			}
		}

		return iResult;
	};

	/**
	 * Update Select All column count information
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._updateSelectAllDescription = function(oEvent) {
		var iTableItems = this._oTable.getItems().length;
		var iSelectedContexts = this._oTable.getSelectedContexts(true).length;
		var sSelectAllText = null;

		// update the selection label
		var oColumn = this._oTable.getColumns()[0];
		if (oColumn) {
			sSelectAllText = this._oRb.getText('COLUMNSPANEL_SELECT_ALL');
			if (iSelectedContexts && iSelectedContexts > 0) {
				sSelectAllText = this._oRb.getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [iSelectedContexts, iTableItems]);
			}
			oColumn.getHeader().setText(sSelectAllText);
		}

		if (this._bShowSelected) {
			this._filterItems();
		}
	};

	/**
	 * Item press behavior is called as soon as a table item is selected
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._itemPressed = function(oEvent) {
		var oNewSelectedItem = null;

		if (this._bSearchFilterActive === true) {
			return;
		}

		// Remove highlighting from previous item
		if (this._oSelectedItem !== null && this._oSelectedItem !== undefined) {
			this._removeHighLightingFromItem(this._oSelectedItem);
		}

		// Set highlighting to just selected item (only in case it is not already selected -> then do nothing)
		oNewSelectedItem = oEvent.getParameter('listItem');
		if (oNewSelectedItem != this._oSelectedItem) {
			this._oSelectedItem = oNewSelectedItem;
			this._setHighLightingToItem(this._oSelectedItem);
		} else {
			this._oSelectedItem = null;
		}

		// Calculate move button appearance
		this._calculateMoveButtonAppearance();
	};

	/**
	 * Calculates the Appearance of the move button depending of selected item instance
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._calculateMoveButtonAppearance = function() {
		var sItemKey = null, aTableItems = null;
		var iLength = -1, iItemIndex = -1;
		var bMoveUp = false, bMoveDown = false;

		// Calculate appearance status of the MOVE buttons
		if (this._oSelectedItem !== null && this._oSelectedItem !== undefined) {
			sItemKey = this._oSelectedItem.data('P13nColumnKey');

			// Determine displayed table items dependent of "Show Selected" filter status
			if (this._bShowSelected === true) {
				aTableItems = this._oTable.getSelectedItems();
			} else {
				aTableItems = this._oTable.getItems();
			}
			iItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);

			if (iItemIndex !== -1) {
				if (aTableItems && aTableItems.length) {
					iLength = aTableItems.length;
				}

				// Minimum border
				if (iItemIndex === 0) {
					bMoveDown = true;
				} else if (iItemIndex === iLength - 1) {
					// Maximum border
					bMoveUp = true;
				} else if (iItemIndex > 0 && iItemIndex < iLength - 1) {
					bMoveDown = true;
					bMoveUp = true;
				}
			}
		} else {
			bMoveUp = bMoveDown = false;
		}

		// Now change real appearance of the buttons
		if (this._oMoveToTopButton.getEnabled() !== bMoveUp) {
			this._oMoveToTopButton.setEnabled(bMoveUp);
			this._oMoveToTopButton.rerender();
		}
		if (this._oMoveUpButton.getEnabled() !== bMoveUp) {
			this._oMoveUpButton.setEnabled(bMoveUp);
			this._oMoveUpButton.rerender();
		}
		if (this._oMoveDownButton.getEnabled() !== bMoveDown) {
			this._oMoveDownButton.setEnabled(bMoveDown);
			this._oMoveDownButton.rerender();
		}
		if (this._oMoveToBottomButton.getEnabled() !== bMoveDown) {
			this._oMoveToBottomButton.setEnabled(bMoveDown);
			this._oMoveToBottomButton.rerender();
		}
	};

	/**
	 * Set highlighting to an item
	 * 
	 * @private
	 * @param {object}
	 *          oItem is that item that shall be highlighted
	 */
	P13nColumnsPanel.prototype._setHighLightingToItem = function(oItem) {
		if (oItem !== null && oItem !== undefined && oItem.addStyleClass) {
			oItem.addStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};

	/**
	 * Remove highlighting from an item
	 * 
	 * @private
	 * @param {object}
	 *          oItem is that item that where highlighting shall be removed from
	 */
	P13nColumnsPanel.prototype._removeHighLightingFromItem = function(oItem) {
		if (oItem !== null && oItem !== undefined && oItem.removeStyleClass) {
			oItem.removeStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};

	/**
	 * Deactivate selected items for any movements & all move buttons
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._deactivateSelectedItem = function() {
		if (this._oSelectedItem) {
			this._removeHighLightingFromItem(this._oSelectedItem);
			this._oSelectedItem = null;
			this._calculateMoveButtonAppearance();
		}
	};

	/**
	 * Delivers the index of an item in the given array identified by its key
	 * 
	 * @private
	 * @param {string}
	 *          sItemKey is the key for that item for that the index shall be found in the array
	 * @param {array}
	 *          aItems is the array in that the item will be searched
	 * @returns {integer} is the index of the identified item
	 */
	P13nColumnsPanel.prototype._getArrayIndexByItemKey = function(sItemKey, aItems) {
		var iResult = -1;
		var iLength = 0, i = 0;
		var oItem = null, sItemKeyTemp = null;

		if (sItemKey !== null && sItemKey !== undefined && sItemKey !== "") {
			if (aItems && aItems.length > 0) {
				iLength = aItems.length;
				for (i = 0; i < iLength; i++) {
					sItemKeyTemp = null;
					oItem = aItems[i];
					if (oItem) {

						if (oItem.getColumnKey) {
							sItemKeyTemp = oItem.getColumnKey();
						} else {
							sItemKeyTemp = oItem.data('P13nColumnKey');
						}

						if (sItemKeyTemp !== null && sItemKeyTemp !== undefined && sItemKeyTemp !== "") {
							if (sItemKeyTemp === sItemKey) {
								iResult = i;
								break;
							}
						}
					}
				}
			}
		}

		return iResult;
	};

	/**
	 * Scroll table content to given item
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._scrollToSelectedItem = function(oItem) {
		var iElementOffset;
		if (oItem) {
			sap.ui.getCore().applyChanges();
			// oItem needs to be rendered, otherwise we cannot perform necessary calculations
			if (!!oItem.getDomRef()) {
				iElementOffset = oItem.$().position().top;
				this._oScrollContainer.scrollTo(0, iElementOffset);
			}
		}
	};

	/**
	 * * react on item visibility changes
	 * 
	 * @private
	 * @param {object}
	 *          oItem is the item for that the visibility was changed
	 * @param {int}
	 *          iNewIndex is the item index where the item shall be inserted
	 */
	P13nColumnsPanel.prototype._handleItemIndexChanged = function(oItem, iNewIndex) {
		var sItemKey = null, iColumnsItemIndex = null;
		var aColumnsItems, oColumnsItem = null;

		sItemKey = oItem.data('P13nColumnKey');
		aColumnsItems = this.getColumnsItems();
		iColumnsItemIndex = this._getArrayIndexByItemKey(sItemKey, aColumnsItems);
		if (iColumnsItemIndex !== null && iColumnsItemIndex !== undefined && iColumnsItemIndex !== -1) {
			oColumnsItem = aColumnsItems[iColumnsItemIndex];
		}

		if (oColumnsItem === null) {
			oColumnsItem = this._createNewColumnsItem(sItemKey);
			oColumnsItem.setIndex(iNewIndex);
			this.fireAddColumnsItem({
				newItem : oColumnsItem
			});
		} else {
			oColumnsItem.setIndex(iNewIndex);
			this._updateTableItems(oColumnsItem);
		}

		this._condenseColumnsItem(oColumnsItem);
	};

	/**
	 * react on item visibility changes
	 * 
	 * @private
	 * @param {object}
	 *          oItem is the item for that the visibility was changed
	 */
	P13nColumnsPanel.prototype._handleItemVisibilityChanged = function(oItem) {
		var sItemKey = null, iColumnsItemIndex = null;
		var aColumnsItems, oColumnsItem = null;

		sItemKey = oItem.data('P13nColumnKey');
		aColumnsItems = this.getColumnsItems();
		iColumnsItemIndex = this._getArrayIndexByItemKey(sItemKey, aColumnsItems);
		if (iColumnsItemIndex !== null && iColumnsItemIndex !== undefined && iColumnsItemIndex !== -1) {
			oColumnsItem = aColumnsItems[iColumnsItemIndex];
		}

		if (oColumnsItem === null) {
			oColumnsItem = this._createNewColumnsItem(sItemKey);
			oColumnsItem.setVisible(oItem.getSelected());
			this.fireAddColumnsItem({
				newItem : oColumnsItem
			});
		} else {
			oColumnsItem.setVisible(oItem.getSelected());
			this._updateTableItems(oColumnsItem);
		}

		this._condenseColumnsItem(oColumnsItem);
	};

	/**
	 * get ColumnsItem by a given ColumnsKey
	 * 
	 * @private
	 * @param {string}
	 *          sItemKey is the columns key with that a ColumnsItem can be identified
	 * @param {boolean}
	 *          bCreateIfNotFound determines whether a ColumnsItems will be created if no ColumnsItem was found by the
	 *          given key
	 * 
	 * @returns {object} ColumnsItem that was found by the key or created if required
	 */
	P13nColumnsPanel.prototype._createNewColumnsItem = function(sItemKey) {
		var oNewColumnsItem = new sap.m.P13nColumnsItem({
			"columnKey" : sItemKey
		});
		return oNewColumnsItem;
	};

	/**
	 * get ColumnsItem by a given ColumnsKey
	 * 
	 * @private
	 * @param {string}
	 *          sItemKey is the columns key with that a ColumnsItem can be identified
	 * @returns {object} ColumnsItem that was found by the key or created if required
	 */
	P13nColumnsPanel.prototype._getColumnsItemByKey = function(sItemKey) {
		var aColumnsItems = null;
		var iColumnsItemIndex = -1, oColumnsItem = null;

		if (sItemKey !== null && sItemKey !== undefined && sItemKey !== "") {
			aColumnsItems = this.getColumnsItems();
			iColumnsItemIndex = this._getArrayIndexByItemKey(sItemKey, aColumnsItems);

			if (iColumnsItemIndex !== null && iColumnsItemIndex > -1) {
				oColumnsItem = aColumnsItems[iColumnsItemIndex];
			}
		}

		return oColumnsItem;
	};

	/**
	 * Condense ColumnsItems
	 * 
	 * @private
	 * @param {object}
	 *          oColumnsItem is the ColumnsItem that shall be checked whether it is still valid or whether it can be
	 *          removed from ColumnsItems aggregation
	 */
	P13nColumnsPanel.prototype._condenseColumnsItem = function(oColumnsItem) {
		var aPanelItems = null;
		var oPanelItem = null, sItemKey = null, iPanelItemIndex = null, bRemoveColumsItem = false;

		if (oColumnsItem !== null) {
			aPanelItems = this.getItems();
			sItemKey = oColumnsItem.getColumnKey();
			iPanelItemIndex = this._getArrayIndexByItemKey(sItemKey, aPanelItems);
			if (iPanelItemIndex !== null && iPanelItemIndex !== undefined && iPanelItemIndex > -1) {

				oPanelItem = aPanelItems[iPanelItemIndex];
				if (oPanelItem !== null) {
					bRemoveColumsItem = this._isColumnsItemEqualToPanelItem(oColumnsItem, oPanelItem);
					if (bRemoveColumsItem) {
						// this.removeColumnsItem(oColumnsItem);
						this.fireRemoveColumnsItem({
							item : oColumnsItem
						});
					}
				}
			}
		}
	};

	/**
	 * Checks whether a ColumnsItem is equal to a PanelItem based on its content (well defined properties)
	 * 
	 * @private
	 * @param {object}
	 *          oColumnsItem is an item from columnsItems aggregation
	 * @param {object}
	 *          oPanelItem is an item from item aggregation
	 * @returns {boolean} describes whether both items are equal by its properties
	 */
	P13nColumnsPanel.prototype._isColumnsItemEqualToPanelItem = function(oColumnsItem, oPanelItem) {
		var bVisibilityIsEqual = false, bIndexIsEqual = false, iPanelItemIndex = null;
		var oParent = null;

		if (oColumnsItem !== null && oPanelItem !== null) {
			/*
			 * Check visible property
			 */
			if (oColumnsItem.getVisible() === undefined || oColumnsItem.getVisible() === null) {
				// Initial state of visibility (if it wasn't touched)
				bVisibilityIsEqual = true;
			} else {
				// Visibility was changed
				if (oColumnsItem.getVisible() === oPanelItem.getVisible()) {
					bVisibilityIsEqual = true;
					delete oColumnsItem.mProperties.visible; // set it back to initial state (undefined) in case the ColumnItem
					// instance will not be removed
				}
			}

			/*
			 * Check index property
			 */
			if (oColumnsItem.getIndex() === undefined || oColumnsItem.getIndex() === null) {
				// Initial state of index (if it wasn't touched)
				bIndexIsEqual = true;
			} else {
				// Index was changed --> now check the difference
				if (oPanelItem.getParent) {
					oParent = oPanelItem.getParent();
					if (oParent && oParent.indexOfItem) {
						iPanelItemIndex = oParent.indexOfItem(oPanelItem);
					}
				}

				if (iPanelItemIndex != null && iPanelItemIndex != undefined && oColumnsItem.getIndex() === iPanelItemIndex) {
					bIndexIsEqual = true;
					delete oColumnsItem.mProperties.index; // set it back to initial state (undefined) in case the ColumnItem
					// instance will not be removed
				}
			}
		}

		return bVisibilityIsEqual && bIndexIsEqual;
	};

	/**
	 * Updates table items based on content of ColumnsItem(s)
	 * 
	 * @private
	 * @param {object}
	 *          oColumnsItem is an item from columnsItems aggregation
	 */
	P13nColumnsPanel.prototype._updateTableItems = function(oColumnsItem) {
		var aTableItems = null, iTableItemIndex, oTableItem = null;
		var aColumnsItems = null, sColumnsKey = null;

		/*
		 * If no direct ColumnsItem is passed in take all existing ColumnsItems for update
		 */
		if (oColumnsItem) {
			aColumnsItems = [];
			aColumnsItems.push(oColumnsItem);
		} else {
			aColumnsItems = this.getColumnsItems();
		}

		// determine existing table items to that ColumnsItems can be applied
		aTableItems = this._oTable.getItems();
		if (aTableItems && aTableItems.length > 0) {
			aColumnsItems.forEach(function(oColumnsItem) {
				sColumnsKey = oColumnsItem.getColumnKey();
				iTableItemIndex = this._getArrayIndexByItemKey(sColumnsKey, aTableItems);
				if (iTableItemIndex !== -1) {
					oTableItem = aTableItems[iTableItemIndex];
					this._applyColumnsItem2TableItem(oColumnsItem, oTableItem);
				}
			}, this);
		}

	};

	/**
	 * Apply all ColumnsItem changes (that are stored in its properties) to the proper table item (if it already exist)
	 * 
	 * @private
	 * @param {object}
	 *          oColumnsItem is an item from columnsItems aggregation
	 * @param {object}
	 *          oTableItem is that item (in this._oTable) where all ColumnsItem changes will be applied to
	 */
	P13nColumnsPanel.prototype._applyColumnsItem2TableItem = function(oColumnsItem, oTableItem) {
		var aTableItems = this._oTable.getItems();
		var iMaxTableIndex = 0, oRemovedItem = null, iTableItemIndex;

		if (oColumnsItem && oTableItem && aTableItems && aTableItems.length > 0) {
			iMaxTableIndex = aTableItems.length;
			iTableItemIndex = aTableItems.indexOf(oTableItem);

			// apply index property
			if (oColumnsItem.getIndex() !== undefined && iTableItemIndex !== oColumnsItem.getIndex()
					&& oColumnsItem.getIndex() <= iMaxTableIndex) {

				oRemovedItem = this._oTable.removeItem(oTableItem);
				this._oTable.insertItem(oRemovedItem, oColumnsItem.getIndex());
			}

			// apply visible property
			if (oColumnsItem.getVisible() !== undefined && oTableItem.getSelected() !== oColumnsItem.getVisible()) {
				oTableItem.setSelected(oColumnsItem.getVisible());
			}
		}
	};

	/* =========================================================== */
	/* Lifecycle methods */
	/* =========================================================== */

	/**
	 * Initialization hook.
	 * 
	 * @private
	 * @name sap.m.ColumnsPanel#init
	 * @function
	 */
	P13nColumnsPanel.prototype.init = function() {
		var iLiveChangeTimer = 0;
		var that = this;
		this._bOnAfterRenderingFirstTimeExecuted = false;
		this.setVerticalScrolling(false);

		// Call-back for handling of resizing
		// TODO: make sure we optimize calculation and respect margins and borders, use e.g. jQuery.outerHeight(true)
		this._fnHandleResize = function() {
			if (that.getParent) {
				var oParent = null, $dialogCont = null, iContentHeight, iHeaderHeight;
				oParent = that.getParent();
				if (oParent) {
					$dialogCont = jQuery("#" + oParent.getId() + "-cont");
					if ($dialogCont.children().length > 0 && that._oToolbar.$().length > 0) {
						iContentHeight = $dialogCont.children()[0].clientHeight;
						iHeaderHeight = that._oToolbar ? that._oToolbar.$()[0].clientHeight : 0;
						that._oScrollContainer.setHeight((iContentHeight - iHeaderHeight) + 'px');
					}
				}
			}
		};

		// Resource bundle, for texts
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._oMoveToTopButton = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("collapse-group"),
			tooltip : this._oRb.getText('COLUMNSPANEL_MOVE_TO_TOP'),
			press : function() {
				that._ItemMoveToTop();
			}
		});

		this._oMoveUpButton = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("slim-arrow-up"),
			tooltip : this._oRb.getText('COLUMNSPANEL_MOVE_UP'),
			press : function() {
				that._ItemMoveUp();
			}
		});

		this._oMoveDownButton = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("slim-arrow-down"),
			tooltip : this._oRb.getText('COLUMNSPANEL_MOVE_DOWN'),
			press : function() {
				that._ItemMoveDown();
			}
		});

		this._oMoveToBottomButton = new sap.m.Button({
			icon : sap.ui.core.IconPool.getIconURI("expand-group"),
			tooltip : this._oRb.getText('COLUMNSPANEL_MOVE_TO_BOTTOM'),
			press : function() {
				that._ItemMoveToBottom();
			}
		});

		this._oShowSelectedButton = new sap.m.Button({
			text : this._oRb.getText('COLUMNSPANEL_SHOW_SELECTED'),
			press : function() {
				that._swopShowSelectedButton();
			}
		});
		this._bShowSelected = false;
		this._bSearchFilterActive = false;

		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			width : "100%",
			liveChange : function(oEvent) {
				var sValue = oEvent.getSource().getValue(), iDelay = (sValue ? 300 : 0); // no delay if value is empty

				// execute search after user stops typing for 300ms
				window.clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = window.setTimeout(function() {
						that._executeSearch();
					}, iDelay);
				} else {
					that._executeSearch();
				}
			},
			// execute the standard search
			search : function(oEvent) {
				that._executeSearch();
			}
		});

		this._oToolbar = new sap.m.Toolbar({
			active : true,
			design : sap.m.ToolbarDesign.Solid, // Transparent,
			content : [this._oMoveToTopButton, this._oMoveUpButton, this._oMoveDownButton, this._oMoveToBottomButton,
					this._oSearchField, this._oShowSelectedButton]
		});

		this._oTable = new Table({
			// growing: false,
			// growingScrollToLoad: true,
			mode : sap.m.ListMode.MultiSelect,
			rememberSelections : false,
			itemPress : function(oEvent) {
				that._itemPressed(oEvent);
			},
			selectionChange : function(oEvent) {
				var oTableItem = oEvent.getParameter('listItem');
				that._handleItemVisibilityChanged(oTableItem);
				that._updateSelectAllDescription(oEvent);
			},
			columns : [new sap.m.Column({
				header : new sap.m.Text({
					text : this._oRb.getText('COLUMNSPANEL_SELECT_ALL')
				})
			})]
		});

		this._oScrollContainer = new sap.m.ScrollContainer({
			horizontal : false,
			vertical : true,
			content : [this._oTable],
			width : '100%',
			height : '100%'
		});

		this._oScrollContainer.setParent(this);
	};

	/**
	 * Required adaptations after rendering
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype.onAfterRendering = function() {
		var iLiveChangeTimer = 0;
		var that = this;

		// Execute following lines only if this control is started the first time!
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;

			this._calculateMoveButtonAppearance();

			// Register call-back function for re-sizing
			sap.ui.Device.resize.attachHandler(this._fnHandleResize);
		}

		// Re-size visible part of scroll container - we have always to recalculate the scrollContainerHeight
		window.clearTimeout(iLiveChangeTimer);
		iLiveChangeTimer = window.setTimeout(function() {
			that._fnHandleResize();
		}, 0);

		this._updateSelectAllDescription();
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 * @name ColumnsPanel#exit
	 * @function
	 */
	P13nColumnsPanel.prototype.exit = function() {

		sap.ui.Device.resize.detachHandler(this._fnHandleResize);

		this._oMoveToTopButton.destroy();
		this._oMoveToTopButton = null;

		this._oMoveDownButton.destroy();
		this._oMoveDownButton = null;

		this._oMoveUpButton.destroy();
		this._oMoveUpButton = null;

		this._oMoveToBottomButton.destroy();
		this._oMoveToBottomButton = null;

		this._oSearchField.destroy();
		this._oSearchField = null;

		this._oToolbar.destroy();
		this._oToolbar = null;

		this._oTable.destroy();
		this._oTable = null;
	};

	/**
	 * Add item to items aggregation
	 * 
	 * @function
	 * @public
	 * @name ColumnsPanel#addItem
	 * @param {object}
	 *          oItem is the new item that shall be added
	 */
	P13nColumnsPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		var oColumnsItem = null;
		var oNewTableItem = null, sColumnKeys = null;

		if (oItem) {
			sColumnKeys = oItem.getColumnKey();
			oColumnsItem = this._getColumnsItemByKey(sColumnKeys);

			oNewTableItem = new sap.m.ColumnListItem({
				cells : [new sap.m.Text({
					text : oItem.getText()
				})],
				visible : true,
				selected : oItem.getVisible(),
				tooltip : oItem.getTooltip(),
				type : sap.m.ListType.Active
			});
			oNewTableItem.data('P13nColumnKey', sColumnKeys);

			// Add or insert the new item according to found ColumnsItem information
			if (oColumnsItem) {
				oNewTableItem.setVisible(oColumnsItem.getVisible());
				this._oTable.insertItem(oNewTableItem, oColumnsItem.getIndex());
			} else {
				this._oTable.addItem(oNewTableItem);
			}
		}
	};

	/**
	 * Remove item from items aggregation
	 * 
	 * @function
	 * @public
	 * @name ColumnsPanel#addItem
	 * @param {object}
	 *          oItem is the item that shall be removed
	 */
	P13nColumnsPanel.prototype.removeItem = function(oItem) {
		P13nPanel.prototype.removeItem.apply(this, arguments);

		var oTableItemToBeRemoved = null, iItemIndex = null, aTableItems = null, sItemKey = null;

		if (oItem) {
			sItemKey = oItem.getColumnKey();
			aTableItems = this._oTable.getItems();

			if (aTableItems && aTableItems.length > 0 && sItemKey !== null && sItemKey !== "") {
				iItemIndex = this._getArrayIndexByItemKey(sItemKey, aTableItems);
				if (iItemIndex !== null && iItemIndex !== -1) {
					oTableItemToBeRemoved = aTableItems[iItemIndex];
					if (oTableItemToBeRemoved) {
						this._oTable.removeItem(oTableItemToBeRemoved);
					}
				}
			}
		}
	};

	/**
	 * Add ColumnsItem to columnsItems aggregation
	 * 
	 * @function
	 * @public
	 * @name ColumnsPanel#addColumnsItem
	 * @param {object}
	 *          oColumnsItem is the new ColumnsItem that shall be added
	 */
	P13nColumnsPanel.prototype.addColumnsItem = function(oColumnsItem) {
		this.addAggregation("columnsItems", oColumnsItem);
		this._updateTableItems(oColumnsItem);
	};

	/**
	 * Remove ColumnsItem from columnsItems aggregation
	 * 
	 * @function
	 * @public
	 * @name ColumnsPanel#addColumnsItem
	 * @param {object}
	 *          oColumnsItem is the ColumnsItem that shall be removed
	 */
	P13nColumnsPanel.prototype.removeColumnsItem = function(oColumnsItem) {
		var aItems = null;

		this.removeAggregation("columnsItems", oColumnsItem);

		// First: Remove all existing table items
		this._oTable.removeAllItems();

		// Second: Insert items again from items aggregation
		aItems = this.getItems();
		aItems.forEach(function(oItem) {
			this._oTable.addItem(oItem);
		}, this);

		// Last: Apply remain columnsItems again
		this._updateTableItems();
	};

	return P13nColumnsPanel;

}, /* bExport= */true);
