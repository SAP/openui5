/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nSelectionPanel.
sap.ui.define([
	'jquery.sap.global', './ColumnListItem', './P13nPanel', './P13nColumnsItem', './SearchField', './Table', './library', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel'
], function(jQuery, ColumnListItem, P13nPanel, P13nColumnsItem, SearchField, Table, library, Control, JSONModel) {
	"use strict";

	/**
	 * Constructor for a new P13nSelectionPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nSelectionPanel control is used to define selection settings like the visibility or the order of items.
	 * @extends sap.m.P13nPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44.0
	 * @alias sap.m.P13nSelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nSelectionPanel = P13nPanel.extend("sap.m.P13nSelectionPanel", /** @lends sap.m.P13nSelectionPanel.prototype */
	{
		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * List of columns that has been changed
				 *
				 * @since 1.44.0
				 */
				columnsItems: {
					type: "sap.m.P13nColumnsItem",
					multiple: true,
					singularName: "columnsItem",
					bindable: "bindable"
				},

				/**
				 * Internal aggregation for the toolbar
				 *
				 * @since 1.44.0
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMP13nColumnsPanel");
			oRm.writeClasses();
			oRm.write(">");

			var aContent = oControl.getAggregation("content");
			if (aContent) {
				aContent.forEach(function(oContent) {
					oRm.renderControl(oContent);
				});
			}
			oRm.write("</div>");
		}
	});

	P13nSelectionPanel.prototype.getOkPayload = function() {
		this._syncModel2Panel();
		return {
			// We have to return columnsItems as of the fact that new created or deleted columnsItems are not updated in the model via list
			// binding.
			columnsItems: this.getColumnsItems()
		};
	};

	// ----------------------- Overwrite Method -----------------

	P13nSelectionPanel.prototype.init = function() {
		this.setType(sap.m.P13nPanelType.selection);

		var that = this;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._bOnAfterRenderingFirstTimeExecuted = false;

		var oModel = new JSONModel({
			items: [],
			indexOfMarkedTableItem: -1,
			markedTableItem: null,
			isMoveDownButtonEnabled: false,
			isMoveUpButtonEnabled: false,
			showOnlySelectedItems: false,
			countOfSelectedItems: 0,
			countOfItems: 0
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapmP13nSelectionPanel");

		this._createTable();
		this._createToolbar();

		this.setVerticalScrolling(false);
		var oScrollContainer = new sap.m.ScrollContainer({
			horizontal: false,
			vertical: true,
			content: [
				this._oTable
			],
			width: '100%',
			height: '100%'
		});

		// Call-back for handling of resizing
		// TODO: make sure we optimize calculation and respect margins and borders, use e.g.
		// jQuery.outerHeight(true)
		this._fnHandleResize = function() {
			var bChangeResult = false, iScrollContainerHeightOld, iScrollContainerHeightNew;
			if (that.getParent) {
				var $dialogCont = null, iContentHeight, iHeaderHeight;
				var oParent = that.getParent();
				var oToolbar = that._getToolbar();
				if (oParent) {
					$dialogCont = jQuery("#" + oParent.getId() + "-cont");
					if ($dialogCont.children().length > 0 && oToolbar.$().length > 0) {
						iScrollContainerHeightOld = oScrollContainer.$()[0].clientHeight;

						iContentHeight = $dialogCont.children()[0].clientHeight;
						iHeaderHeight = oToolbar ? oToolbar.$()[0].clientHeight : 0;

						iScrollContainerHeightNew = iContentHeight - iHeaderHeight;

						if (iScrollContainerHeightOld !== iScrollContainerHeightNew) {
							oScrollContainer.setHeight(iScrollContainerHeightNew + 'px');
							bChangeResult = true;
						}
					}
				}
			}
			return bChangeResult;
		};
		this.addAggregation("content", oScrollContainer);
		this._sContainerResizeListener = sap.ui.core.ResizeHandler.register(oScrollContainer, this._fnHandleResize);
	};

	P13nSelectionPanel.prototype.onBeforeRendering = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		// Synchronize columnsItems and items
		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oModelItem || this._isColumnsItemEqualToModelItem(oColumnsItem, oModelItem)) {
				return;
			}

			// Take over columnsItem data
			oModelItem.persistentIndex = oColumnsItem.getIndex();
			oModelItem.persistentSelected = oColumnsItem.getVisible();
			// Sort the table items only by persistentIndex
			this._sortModelItemsByPersistentIndex(oData.items);
			// Re-Index only the tableIndex
			this._reindexModelItemsByTableIndex(oData);
		}, this);
		oModel.refresh();

		// Set marked item initially to the first table item
		if (!oData.markedTableItem) {
			var aVisibleTableItems = this._getVisibleTableItems();
			this._switchMarkedTableItemTo(aVisibleTableItems[0]);
		}
	};

	P13nSelectionPanel.prototype.onAfterRendering = function() {
		var that = this, iLiveChangeTimer = 0;

		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;
			window.clearTimeout(iLiveChangeTimer);
			iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();

// // following line is needed to get layout of OverflowToolbar rearranged IF it is used in a dialog
// that._getToolbar()._resetAndInvalidateToolbar();
			}, 0);
		}
	};

	// ----------------------- Overwrite Methods of Item Aggregation ----------------------

	P13nSelectionPanel.prototype.addItem = function(oItem) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		this.addAggregation("items", oItem);
		// Take over item data into model
		this._includeModelItem(oItem, -1);
		// Sort the table items when the item has been added programmatically (Note: columnsItems could be already existing)
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nSelectionPanel.prototype.insertItem = function(oItem, iIndex) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		this.insertAggregation("items", oItem, iIndex);
		// Take over item data into model
		this._includeModelItem(oItem, iIndex);
		// Sort the table items when the item has been added programmatically (Note: columnsItems could be already existing)
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nSelectionPanel.prototype.removeItem = function(oItem) {
		var iIndex = this.indexOfItem(oItem);
		if (iIndex > -1) {
			var oModel = this.getModel("$sapmP13nSelectionPanel");
			var oData = oModel.getData();

			// Remove item data from model
			oModel.getData().items.splice(iIndex, 1);
			// Sort the table items when the item has been removed programmatically (Note: columnsItems could be already existing)
			this._sortModelItemsByPersistentIndex(oData.items);
			// Re-Index the tableIndex
			this._reindexModelItemsByTableIndex(oData);
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nSelectionPanel.prototype.removeAllItems = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var aItems = this.removeAllAggregation("items");
		// Remove items data from model
		oModel.getData().items = [];
		return aItems;
	};

	P13nSelectionPanel.prototype.destroyItems = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		this.destroyAggregation("items");
		// Remove items data from model
		oModel.getData().items = [];
		return this;
	};

// ----------------------- Overwrite Methods of ColumnsItem Aggregation ---------------------

	P13nSelectionPanel.prototype.addColumnsItem = function(oColumnsItem) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		this.addAggregation("columnsItems", oColumnsItem);
		var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over columnsItem data
		oModelItem.persistentIndex = oColumnsItem.getIndex();
		oModelItem.persistentSelected = oColumnsItem.getVisible();
		oModelItem.persistentWidth = oColumnsItem.getWidth();
		// Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nSelectionPanel.prototype.insertColumnsItem = function(oColumnsItem, iIndex) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		this.insertAggregation("columnsItems", oColumnsItem, iIndex);
		var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over columnsItem data
		oModelItem.persistentIndex = oColumnsItem.getIndex();
		oModelItem.persistentSelected = oColumnsItem.getVisible();
		oModelItem.persistentWidth = oColumnsItem.getWidth();
		// Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nSelectionPanel.prototype.removeColumnsItem = function(oColumnsItem) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		oColumnsItem = this.removeAggregation("columnsItems", oColumnsItem);
		var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Remove columnsItem data
		oModelItem.persistentIndex = -1;
		oModelItem.persistentSelected = undefined;
		oModelItem.persistentWidth = undefined;
		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by columnsItems
		this._reindexModelItemsByTableIndex(oData);
		return oColumnsItem;
	};

	P13nSelectionPanel.prototype.removeAllColumnsItems = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		// Remove columnsItem data
		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.persistentWidth = undefined;
		}, this);
		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by columnsItems
		this._reindexModelItemsByTableIndex(oData);
		var aColumnsItems = this.removeAllAggregation("columnsItems");
		return aColumnsItems;
	};

	P13nSelectionPanel.prototype.destroyColumnsItems = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();

		// Remove columnsItem data
		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.persistentWidth = undefined;
		}, this);
		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by columnsItems
		this._reindexModelItemsByTableIndex(oData);
		this.destroyAggregation("columnsItems");
		return this;
	};

	// ----------------------- Overwrite Method of P13nPanel -----------------

	P13nSelectionPanel.prototype.onBeforeNavigationFrom = function() {
		this._syncModel2Panel();
		return P13nPanel.prototype.onBeforeNavigationFrom.apply(this, arguments);
	};

	P13nSelectionPanel.prototype.exit = function() {

		sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;

		this._getToolbar().destroy();

		this._oTable.destroy();
		this._oTable = null;

		// destroy model and its data
		if (this.getModel("$sapmP13nSelectionPanel")) {
			this.getModel("$sapmP13nSelectionPanel").destroy();
		}
	};

	// ----------------------- Private Methods -----------------------------------------

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._syncModel2Panel = function() {
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();

		// ColumnsItems
		oData.items.forEach(function(oModelItem) {
			var oColumnsItem = this._getColumnsItemByColumnKey(oModelItem.columnKey);
			if (oColumnsItem) {
				// Update existing columnsItem if some properties have been changed
				if (!this._isColumnsItemEqualToModelItem(oColumnsItem, oModelItem)) {
					oColumnsItem.setProperty("visible", oModelItem.persistentSelected, true);
					oColumnsItem.setProperty("index", oModelItem.persistentIndex, true);
				}
				return;
			}
			if (!oModelItem.persistentSelected) {
				// Nothing relevant has been changed as item is not selected
				return;
			}
			// Create a new columnsItem if an item have been changed to 'selected'
			oColumnsItem = new sap.m.P13nColumnsItem({
				columnKey: oModelItem.columnKey,
				visible: oModelItem.persistentSelected,
				index: oModelItem.persistentIndex,
				width: oModelItem.persistentWidth
			});
			this.addAggregation("columnsItems", oColumnsItem, true);
		}, this);
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._moveMarkedTableItem = function(sDirection) {
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();
		if (!oData.markedTableItem || oData.indexOfMarkedTableItem < 0) {
			// No table item is marked
			return;
		}

		var aVisibleTableItems = this._getVisibleTableItems();
		if (aVisibleTableItems.indexOf(oData.markedTableItem) < 0) {
			// Marked table item is currently not visible in the table
			return;
		}

		var fcalculateIndexTo = function() {
			switch (sDirection) {
				case "Down":
					return oData.indexOfMarkedTableItem + 1;
				case "Bottom":
					return aVisibleModelItems.length - 1;
				case "Up":
					return oData.indexOfMarkedTableItem - 1;
				case "Top":
					return 0;
			}
		};

		// Note: visible model items are in sync with visible table items. So we can use 'oData.indexOfMarkedTableItem'
		// in the same manner for visible model items as well as for visible table items.
		var aVisibleModelItems = this._getVisibleModelItems();
		var oModelItemFrom = aVisibleModelItems[oData.indexOfMarkedTableItem];
		var oModelItemTo = aVisibleModelItems[fcalculateIndexTo()];

		if (this._moveModelItems(this._getModelItemIndexByColumnKey(oModelItemFrom.columnKey), this._getModelItemIndexByColumnKey(oModelItemTo.columnKey))) {
			this._switchMarkedTableItemTo(aVisibleTableItems[fcalculateIndexTo()]);
		}
	};

	/**
	 * @param {string} sSearchText Table items are filtered by this text. <b>Note:</b> " " is a valid value. The table will be set back if
	 *        sSearchText="".
	 * @private
	 */
	P13nSelectionPanel.prototype._filterModelItemsBySearchText = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var sSearchText = this._getSearchText();

		// Replace white spaces at begin and end of the searchText. Leave white spaces in between.
		sSearchText = sSearchText.replace(/(^\s+)|(\s+$)/g, '');
		// Escape special characters entered by user
		sSearchText = sSearchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		// i = ignore case; g = global; m = multiline
		var oRegExp = new RegExp(sSearchText, 'igm');
		if (!oRegExp) {
			return;
		}

		this._getVisibleModelItems().forEach(function(oModelItem) {
			oModelItem.visible = false;
			// Search in item text
			if (oModelItem.text && oModelItem.text.match(oRegExp)) {
				oModelItem.visible = true;
			}
			// Search in tooltip
			if (oModelItem.tooltip && oModelItem.tooltip.match(oRegExp)) {
				oModelItem.visible = true;
			}
		});
		oModel.refresh();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._scrollToSelectedItem = function(oItem) {
		var oFocusedElement = null;
		if (oItem) {
			sap.ui.getCore().applyChanges();
			// oItem needs to be rendered, otherwise the necessary scroll calculations cannot be performed
			if (!!oItem.getDomRef()) {
				// get just focused DOM element
				oFocusedElement = document.activeElement;

				// focus actual item to get it into the scroll container viewport
				oItem.focus();

				// reset focus to previous DOM element
				if (oFocusedElement && oFocusedElement.focus) {
					oFocusedElement.focus();
				}
			}
		}
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._includeModelItem = function(oItem, iIndex) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();
		// TODO: unittest für den Fall, dass includeItem(oItem, i) mit i>oData.items.length

		if (iIndex < 0) {
			iIndex = oData.items.length;
		}
		var oModelItem = {
			columnKey: oItem.getColumnKey(),
			visible: true,
			text: oItem.getText(),
			tooltip: oItem.getTooltip(),

			originalIndex: iIndex,

			// default value
			persistentIndex: -1,
			persistentSelected: undefined,
			persistentWidth: undefined,

			tableIndex: undefined
		};

		oModel.getData().items.splice(iIndex, 0, oModelItem);
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._onItemPressed = function(oEvent) {
		this._switchMarkedTableItemTo(oEvent.getParameter('listItem'));
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._onSelectionChange = function(oEvent) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();
		var oTableItem = oEvent.getParameter("listItem");

		this._switchMarkedTableItemTo(oTableItem);

		// No update of model items is needed as it is already up-to-date due to binding of 'persistentSelected'

		// Do not sort after user interaction as the table should not be sorted once selected items has been rendered

// // Re-Index only the persistentIndex after user interaction
// this._reindexModelItemsByPersistentIndex(oData);
// oModel.refresh();
		// Check whether the 'persistentIndex' should be re-indexed or not
		var oModelItem = this._getModelItemByTableItem(oTableItem);
		var aSelectedModelItems = this._getSelectedModelItems();
		var iIndex = aSelectedModelItems.indexOf(oModelItem);
		aSelectedModelItems.splice(iIndex, 1);
		var oLastSelectedModelItem = aSelectedModelItems.slice(-1)[0];

		if (oModelItem.persistentSelected && oLastSelectedModelItem && oModelItem.originalIndex < oLastSelectedModelItem.originalIndex) {
			this._reindexModelItemsByPersistentIndex(oData);
			oModel.refresh();
		} else {
			oModelItem.persistentIndex = oModelItem.persistentSelected ? oModelItem.originalIndex : -1;
		}

		this._notifyChange();
	};

	/**
	 * Switches 'Show Selected' button to 'Show All' and back.
	 *
	 * @private
	 */
	P13nSelectionPanel.prototype._onSwitchButtonShowSelected = function() {
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();

		// Switch the button text
		oData.showOnlySelectedItems = !oData.showOnlySelectedItems;

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		this._scrollToSelectedItem(oData.markedTableItem);

		this._updateControlLogic();

		this._fnHandleResize(); // ER: TODO
	};

	/**
	 * Execute search by filtering columns list based on the given sValue
	 *
	 * @private
	 */
	P13nSelectionPanel.prototype._onExecuteSearch = function() {
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		this._scrollToSelectedItem(oData.markedTableItem);

		this._updateControlLogic();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getColumnsItemByColumnKey = function(sColumnKey) {
		for (var i = 0, aColumnsItems = this.getColumnsItems(), iColumnsItemsLength = aColumnsItems.length; i < iColumnsItemsLength; i++) {
			if (aColumnsItems[i].getColumnKey() === sColumnKey) {
				return aColumnsItems[i];
			}
		}
		return null;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getModelItemIndexByColumnKey = function(sColumnKey) {
		var iIndex = -1;
		this.getModel("$sapmP13nSelectionPanel").getData().items.some(function(oModelItem, iIndex_) {
			if (oModelItem.columnKey === sColumnKey) {
				iIndex = iIndex_;
				return true;
			}
		});
		return iIndex;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var oModelItem = null;
		this.getModel("$sapmP13nSelectionPanel").getData().items.some(function(oModelItem_) {
			if (oModelItem_.columnKey === sColumnKey) {
				oModelItem = oModelItem_;
				return true;
			}
		});
		return oModelItem;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getModelItemByTableItem = function(oTableItem) {
		var oModelItem = null;
		// Note: visible model items are in sync with visible table items.
		var iIndex = this._getVisibleTableItems().indexOf(oTableItem);
		this.getModel("$sapmP13nSelectionPanel").getData().items.some(function(oModelItem_, iIndex_) {
			if (iIndex === iIndex_) {
				oModelItem = oModelItem_;
				return true;
			}
		});
		return oModelItem;
	};

	/**
	 * Moves model item from <code>iIndexFrom</code> to <code>iIndexTo</code>.
	 *
	 * @param {int} iIndexFrom Model item at this index will be removed. Range: {0, length-1}
	 * @param {int} iIndexTo Model item at this index will be inserted. Range: {0, length-1}
	 * @return {boolean} <code>true</code> if table item has been moved, else <code>false</code>
	 * @private
	 */
	P13nSelectionPanel.prototype._moveModelItems = function(iIndexFrom, iIndexTo) {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();
		if (iIndexFrom < 0 || iIndexTo < 0 || iIndexFrom > oData.items.length - 1 || iIndexTo > oData.items.length - 1) {
			return false;
		}
		// Move items
		var aModelItems = oData.items.splice(iIndexFrom, 1);
		oData.items.splice(iIndexTo, 0, aModelItems[0]);

		// Do not sort after user action as the table should not be sorted once selected items has been rendered

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(oData);
		oModel.refresh();

		return true;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._switchVisibilityOfUnselectedModelItems = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var bShowOnlySelectedItems = this._isFilteredByShowSelected();
		oModel.getData().items.forEach(function(oModelItem) {
			if (oModelItem.persistentSelected) {
				oModelItem.visible = true;
				return;
			}
			oModelItem.visible = !bShowOnlySelectedItems;
		});
		oModel.refresh();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getVisibleTableItems = function() {
		var aVisibleTableItems = [];
		this._oTable.getItems().forEach(function(oTableItem) {
			if (oTableItem.getVisible()) {
				aVisibleTableItems.push(oTableItem);
			}
		});
		return aVisibleTableItems;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getVisibleModelItems = function() {
		var aVisibleModelItems = [];
		this.getModel("$sapmP13nSelectionPanel").getData().items.forEach(function(oModelItem) {
			if (oModelItem.visible) {
				aVisibleModelItems.push(oModelItem);
			}
		});
		return aVisibleModelItems;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._getSelectedModelItems = function() {
		var aSelectedModelItems = [];
		this.getModel("$sapmP13nSelectionPanel").getData().items.forEach(function(oModelItem) {
			if (oModelItem.persistentSelected) {
				aSelectedModelItems.push(oModelItem);
			}
		});
		return aSelectedModelItems;
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._reindexModelItemsByPersistentIndexAndTableIndex = function(oData) {
		var iPersistentIndex = -1;
		oData.countOfSelectedItems = 0;
		oData.countOfItems = 0;
		oData.items.forEach(function(oModelItem, iTableIndex) {
			oModelItem.persistentIndex = -1;
			if (oModelItem.persistentSelected) {
				oData.countOfSelectedItems++;
				iPersistentIndex++;
				oModelItem.persistentIndex = iPersistentIndex;
			}
			oModelItem.tableIndex = iTableIndex;
			oData.countOfItems++;
		});
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._reindexModelItemsByPersistentIndex = function(oData) {
		var iPersistentIndex = -1;
		oData.countOfSelectedItems = 0;
		oData.items.forEach(function(oModelItem) {
			oModelItem.persistentIndex = -1;
			if (oModelItem.persistentSelected) {
				oData.countOfSelectedItems++;
				iPersistentIndex++;
				oModelItem.persistentIndex = iPersistentIndex;
			}
		});
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._reindexModelItemsByTableIndex = function(oData) {
		oData.countOfSelectedItems = 0;
		oData.countOfItems = 0;
		oData.items.forEach(function(oModelItem, iTableIndex) {
			oModelItem.tableIndex = iTableIndex;
			oData.countOfItems++;
			if (oModelItem.persistentSelected) {
				oData.countOfSelectedItems++;
			}
		});
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._sortModelItemsByPersistentIndex = function(aModelItems) {
		aModelItems.sort(function(a, b) {
			if (a.persistentSelected === true && (b.persistentSelected === false || b.persistentSelected === undefined)) {
				return -1;
			} else if ((a.persistentSelected === false || a.persistentSelected === undefined) && b.persistentSelected === true) {
				return 1;
			} else if (a.persistentSelected === true && b.persistentSelected === true) {
				if (a.persistentIndex < b.persistentIndex) {
					return -1;
				} else if (a.persistentIndex > b.persistentIndex) {
					return 1;
				} else {
					return 0;
				}
			} else if ((a.persistentSelected === false || a.persistentSelected === undefined) && (b.persistentSelected === false || b.persistentSelected === undefined)) {
				if (a.text < b.text) {
					return -1;
				} else if (a.text > b.text) {
					return 1;
				} else {
					return 0;
				}
			}
		});
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._switchMarkedTableItemTo = function(oTableItem) {
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();

		if (oData.markedTableItem === oTableItem) {
			return;
		}

		// Remove highlighting from previous table item
		if (oData.markedTableItem) {
			oData.markedTableItem.removeStyleClass("sapMP13nColumnsPanelItemSelected");
		}

		// Set highlighting to new table item
		oData.indexOfMarkedTableItem = this._getVisibleTableItems().indexOf(oTableItem);
		oData.markedTableItem = oTableItem;
		if (oData.markedTableItem) {
			oData.markedTableItem.addStyleClass("sapMP13nColumnsPanelItemSelected");
		}

		this._scrollToSelectedItem(oData.markedTableItem);

		this._updateControlLogic();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._createTable = function() {
		var that = this;
		this._oTable = new Table({
			mode: sap.m.ListMode.MultiSelect,
			rememberSelections: false,
			itemPress: jQuery.proxy(this._onItemPressed, this),
			selectionChange: jQuery.proxy(this._onSelectionChange, this),
			columns: [
				new sap.m.Column({
					header: new sap.m.Text({
						text: {
							parts: [
								{
									path: '/countOfSelectedItems'
								}, {
									path: '/countOfItems'
								}
							],
							formatter: function(iCountOfSelectedItems, iCountOfItems) {
								return that._oRb.getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [
									iCountOfSelectedItems, iCountOfItems
								]);
							}
						}
					})
				})
			],
			items: {
				path: "/items",
				templateShareable: false,
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{text}"
						})
					],
					visible: "{visible}",
					selected: "{persistentSelected}",
					tooltip: "{tooltip}",
					type: sap.m.ListType.Active
				})
			}
		});
		this._oTable.setModel(this.getModel("$sapmP13nSelectionPanel"));
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._createToolbar = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var that = this;
		var oMoveDownButton = new sap.m.OverflowToolbarButton({
			icon: sap.ui.core.IconPool.getIconURI("slim-arrow-down"),
			text: this._oRb.getText('COLUMNSPANEL_MOVE_DOWN'),
			tooltip: this._oRb.getText('COLUMNSPANEL_MOVE_DOWN'),
			enabled: {
				path: '/isMoveDownButtonEnabled'
			},
			press: function() {
				that._moveMarkedTableItem("Down");
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.High,
				group: 1
			})
		});
		oMoveDownButton.setModel(oModel);

		var oMoveUpButton = new sap.m.OverflowToolbarButton({
			icon: sap.ui.core.IconPool.getIconURI("slim-arrow-up"),
			text: this._oRb.getText('COLUMNSPANEL_MOVE_UP'),
			tooltip: this._oRb.getText('COLUMNSPANEL_MOVE_UP'),
			enabled: {
				path: '/isMoveUpButtonEnabled'
			},
			press: function() {
				that._moveMarkedTableItem("Up");
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.High,
				group: 1
			})
		});
		oMoveUpButton.setModel(oModel);

		var oMoveToBottomButton = new sap.m.OverflowToolbarButton({
			icon: sap.ui.core.IconPool.getIconURI("expand-group"),
			text: this._oRb.getText('COLUMNSPANEL_MOVE_TO_BOTTOM'),
			tooltip: this._oRb.getText('COLUMNSPANEL_MOVE_TO_BOTTOM'),
			enabled: {
				path: '/isMoveDownButtonEnabled'
			},
			press: function() {
				that._moveMarkedTableItem("Bottom");
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.Low,
				group: 2
			})
		});
		oMoveToBottomButton.setModel(oModel);

		var oMoveToTopButton = new sap.m.OverflowToolbarButton({
			icon: sap.ui.core.IconPool.getIconURI("collapse-group"),
			text: this._oRb.getText('COLUMNSPANEL_MOVE_TO_TOP'),
			tooltip: this._oRb.getText('COLUMNSPANEL_MOVE_TO_TOP'),
			enabled: {
				path: '/isMoveUpButtonEnabled'
			},
			press: function() {
				that._moveMarkedTableItem("Top");
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.Low,
				group: 2
			})
		});
		oMoveToTopButton.setModel(oModel);

		var oShowSelectedButton = new sap.m.Button({
			text: {
				path: '/showOnlySelectedItems',
				formatter: function(bShowOnlySelectedItems) {
					return bShowOnlySelectedItems ? that._oRb.getText('COLUMNSPANEL_SHOW_ALL') : that._oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
				}
			},
			press: jQuery.proxy(this._onSwitchButtonShowSelected, this),
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.High
			})
		});
		oShowSelectedButton.setModel(oModel);

		var iLiveChangeTimer = 0;
		var oSearchField = new SearchField(this.getId() + "-searchField", {
			liveChange: function(oEvent) {
				var sValue = oEvent.getSource().getValue(), iDelay = (sValue ? 300 : 0); // no delay if value is empty
				// execute search after user stops typing for 300ms
				window.clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = window.setTimeout(function() {
						that._onExecuteSearch();
					}, iDelay);
				} else {
					that._onExecuteSearch();
				}
			},
			// execute the standard search
			search: jQuery.proxy(this._onExecuteSearch, this),
			layoutData: new sap.m.OverflowToolbarLayoutData({
				minWidth: "12.5rem",
				maxWidth: "23.077rem",
				shrinkable: true,
				moveToOverflow: true,
				priority: sap.m.OverflowToolbarPriority.High
			})
		});

		var oToolbar = new sap.m.OverflowToolbar(this.getId() + "-toolbar", {
			active: true,
			design: sap.m.ToolbarDesign.Solid, // Transparent,
			content: [
				new sap.m.ToolbarSpacer(), oSearchField, oShowSelectedButton, oMoveToTopButton, oMoveUpButton, oMoveDownButton, oMoveToBottomButton
			]
		});
		this.addAggregation("content", oToolbar);
	};

	P13nSelectionPanel.prototype._getToolbar = function() {
		return sap.ui.getCore().byId(this.getId() + "-toolbar") || null;
	};

	P13nSelectionPanel.prototype._getSearchField = function() {
		return sap.ui.getCore().byId(this.getId() + "-searchField") || null;
	};

	P13nSelectionPanel.prototype._getSearchText = function() {
		var oSearchField = this._getSearchField();
		return oSearchField ? oSearchField.getValue() : "";
	};

	P13nSelectionPanel.prototype._isFilteredBySearchText = function() {
		return !!this._getSearchText().length;
	};

	P13nSelectionPanel.prototype._isFilteredByShowSelected = function() {
		return this.getModel("$sapmP13nSelectionPanel").getData().showOnlySelectedItems;
	};

	P13nSelectionPanel.prototype._isColumnsItemEqualToModelItem = function(oColumnsItem, oModelItem) {
		return oModelItem.persistentIndex === oColumnsItem.getIndex() && oModelItem.persistentSelected === oColumnsItem.getVisible() && oModelItem.persistentWidth === oColumnsItem.getWidth();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._updateControlLogic = function() {
		var oModel = this.getModel("$sapmP13nSelectionPanel");
		var oData = oModel.getData();
		var bIsSearchActive = this._isFilteredBySearchText();
		var bShowOnlySelectedItems = this._isFilteredByShowSelected();
		var aVisibleTableItems = this._getVisibleTableItems();

		// Value in search field has been changed...
		oData.isMoveUpButtonEnabled = aVisibleTableItems.indexOf(oData.markedTableItem) > -1 && oData.indexOfMarkedTableItem > 0;
		oData.isMoveDownButtonEnabled = aVisibleTableItems.indexOf(oData.markedTableItem) > -1 && oData.indexOfMarkedTableItem < aVisibleTableItems.length - 1 && oData.indexOfMarkedTableItem > -1;

		// Switch off the "Select all (n/m)" checkbox if search
		var oTableCB = sap.ui.getCore().byId(this._oTable.getId() + '-sa');
		if (oTableCB) {
			oTableCB.setEnabled(!bIsSearchActive && !bShowOnlySelectedItems);
		}

		oModel.refresh();
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	/**
	 * @private
	 */
	P13nSelectionPanel.prototype._showAll = function() {
		jQuery.sap.log.info("ModelItems: columnKey originalIndex  tableIndex_isVisible  persistentIndex_isPersistent        TableItems: current");
		jQuery.sap.log.info("--------------------------------------------------------------");
		var oData = this.getModel("$sapmP13nSelectionPanel").getData();
		var aTableItems = this._oTable.getItems();
		var iLength = Math.max(oData.items.length, this._oTable.getItems().length);
		for (var i = 0; i < iLength; i++) {
			var oModelItem = oData.items[i];
			var oTableItem = aTableItems[i];
			jQuery.sap.log.info(oModelItem.columnKey + ": " + oModelItem.originalIndex + " " + oModelItem.tableIndex + "_" + oModelItem.visible + " " + oModelItem.persistentIndex + "_" + oModelItem.persistentSelected + ";  " + oTableItem.getCells()[0].getText() + ": " + oTableItem.getSelected());
		}
	};

	return P13nSelectionPanel;

}, /* bExport= */true);
