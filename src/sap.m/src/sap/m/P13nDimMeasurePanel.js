/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nDimMeasurePanel.
sap.ui.define([
	'jquery.sap.global', './ColumnListItem', './P13nPanel', './P13nColumnsItem', './SearchField', './Table', './library', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel'
], function(jQuery, ColumnListItem, P13nPanel, P13nColumnsItem, SearchField, Table, library, Control, JSONModel) {
	"use strict";

	/**
	 * Constructor for a new P13nDimMeasurePanel.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nDimMeasurePanel control is used to define chart-specific settings like dimensions and measures for table personalization.
	 * @extends sap.m.P13nPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.P13nDimMeasurePanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nDimMeasurePanel = P13nPanel.extend("sap.m.P13nDimMeasurePanel", /** @lends sap.m.P13nDimMeasurePanel.prototype */
	{
		metadata: {
			library: "sap.m",
			properties: {				

				/**
				 * Specifies a threshold of visible items.
				 * 
				 * @since 1.34.0
				 */
				visibleItemsThreshold: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Specifies a chart type key.
				 * 
				 * @since 1.34.0
				 */
				chartTypeKey: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * List of columns that has been changed.
				 * 
				 * @since 1.34.0
				 */
				columnsItems: {
					type: "sap.m.P13nColumnsItem",
					multiple: true,
					singularName: "columnsItem",
					bindable: "bindable"
				},

				/**
				 * Internal aggregation for the toolbar.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				},

				/**
				 * Specifies available chart types.
				 * 
				 * @since 1.34.0
				 */
				availableChartTypes: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "availableChartType"
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMP13nColumnsPanel");
			oRm.writeClasses();
			oRm.write(">"); // div element

			var aContent = oControl.getAggregation("content");
			if (aContent) {
				aContent.forEach(function(oContent) {
					oRm.renderControl(oContent);
				});
			}

			oRm.write("</div>");
		}
	});

	/**
	 * Initialization hook.
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype.init = function() {
		var that = this;		
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._bOnAfterRenderingFirstTimeExecuted = false;

		this._oTableModel = new JSONModel({
			availableChartTypes: [],
			selectedChartTypeKey: null,
			items: [],
			indexOfMarkedTableItem: -1,
			markedTableItem: null,
			isMoveDownButtonEnabled: false,
			isMoveUpButtonEnabled: false,
			selectedItemsSwitchedOn: false,
			isSearchFilterActive: false,
			countOfSelectedItems: 0
		});
		this._oTableModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

		this.setType(sap.m.P13nPanelType.dimeasure);
		
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
				var oParent = null, $dialogCont = null, iContentHeight, iHeaderHeight;
				oParent = that.getParent();
				if (oParent) {
					$dialogCont = jQuery("#" + oParent.getId() + "-cont");
					if ($dialogCont.children().length > 0 && that._oToolbar.$().length > 0) {
						iScrollContainerHeightOld = oScrollContainer.$()[0].clientHeight;

						iContentHeight = $dialogCont.children()[0].clientHeight;
						iHeaderHeight = that._oToolbar ? that._oToolbar.$()[0].clientHeight : 0;

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

	P13nDimMeasurePanel.prototype._moveMarkedTableItem = function(sDirection) {
		var oData = this._oTableModel.getData();
		if (!oData.markedTableItem || oData.indexOfMarkedTableItem < 0) {
			// No table item is marked
			return;
		}

		var aVisibleTableItems = this._getVisibleTableItems();
		if (aVisibleTableItems.indexOf(oData.markedTableItem) < 0) {
			// Marked table item is currently not visible in the table
			return;
		}

		var fcalculateIndex = function() {
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
		var oModelItemTo = aVisibleModelItems[fcalculateIndex()];

		if (this._moveModelItems(this._getModelItemIndexByColumnKey(oModelItemFrom.columnKey), this._getModelItemIndexByColumnKey(oModelItemTo.columnKey))) {
			this._switchMarkedTableItemTo(aVisibleTableItems[fcalculateIndex()]);
		}
	};

	/**
	 * Switches 'Show Selected' button to 'Show All' and back.
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype._switchSelectedItems = function() {
		var oData = this._oTableModel.getData();

		// Switch the button text
		oData.selectedItemsSwitchedOn = !oData.selectedItemsSwitchedOn;

		this._changeEnableProperty4SelectAll(); // ER: TODO

		// this._filterItems();
		this._switchVisibilityOfTableItems(oData.selectedItemsSwitchedOn);

		if (oData.markedTableItem && oData.markedTableItem.getVisible() === false) {
			this._deactivateSelectedItem();
		}

		this._scrollToSelectedItem(oData.markedTableItem);

		this._updateControlLogic();

		this._fnHandleResize();
	};

	/**
	 * Filters items by its selection status
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype._filterItems = function() {
		var oData = this._oTableModel.getData();
		var aSelectedItems = null, aTableItems = null;
		var iLength = 0, jLength = 0, i = 0, j = 0;
		var oItem = null, oItemTemplate = null;
		var bItemVisibleBySearchText, bItemVisibleBySelection;
		var sItemText = null, sSearchText = null, regExp = null;
		var fEscapeRegExp = function(sToEscape) {
			// Escapes special characters
			if (sToEscape) {
				return sToEscape.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			}
		};

		// Get table items according "Show Selected" button status
		if (oData.selectedItemsSwitchedOn) {
			aSelectedItems = this._oTable.getSelectedItems();
		} else {
			aSelectedItems = this._oTable.getItems();
		}

		// Get search filter value
		if (oData.isSearchFilterActive) {
			sSearchText = this._oSearchField.getValue();

			// replace white-spaces at BEGIN & END of the searchText, NOT IN BETWEEN!!
			if (sSearchText) {
				sSearchText = sSearchText.replace(/(^\s+)|(\s+$)/g, '');
			}
			// create RegEx for search only if a searchText exist!!
			if (sSearchText !== null && sSearchText !== undefined) {// " " is a VALID value!!!
				sSearchText = fEscapeRegExp(sSearchText); // escape user input
				sSearchText = regExp = new RegExp(sSearchText, 'igm'); // i = ignore case; g = global; m = multiline
			}
		}

		aTableItems = this._oTable.getItems();
		iLength = aTableItems.length;
		for (i = 0; i < iLength; i++) {
			oItem = aTableItems[i];
			bItemVisibleBySearchText = true;
			bItemVisibleBySelection = false;

			// Is filtering via search text active
			if (oData.isSearchFilterActive) {
				bItemVisibleBySearchText = false;

				// search in item text
				sItemText = oItem.getCells()[0].getText();
				if (sItemText && regExp !== null && sItemText.match(regExp) !== null) {
					bItemVisibleBySearchText = true;
				}

				if (oItem.getCells()[1] && oItem.getCells()[1].getText) {
					// search in type text
					sItemText = oItem.getCells()[1].getText();
					if (sItemText && regExp !== null && sItemText.match(regExp) !== null) {
						bItemVisibleBySearchText = true;
					}
				}

				// search in tooltip text of actual item
				if (bItemVisibleBySearchText !== true && oItem.getTooltip_Text) {
					sItemText = (oItem.getTooltip() instanceof sap.ui.core.TooltipBase ? oItem.getTooltip().getTooltip_Text() : oItem.getTooltip_Text());
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
	P13nDimMeasurePanel.prototype._changeEnableProperty4SelectAll = function() {
		var oTableCB = sap.ui.getCore().byId(this._oTable.getId() + '-sa');
		if (oTableCB) {
			oTableCB.setEnabled(!this._oTableModel.getData().isSearchFilterActive && !this._oTableModel.getData().selectedItemsSwitchedOn);
		}
	};

	/**
	 * Execute search by filtering columns list based on the given sValue
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype._executeSearch = function() {
		var oData = this._oTableModel.getData();
		var iLength = this._oSearchField.getValue().length || 0;

		// change search filter status
		oData.isSearchFilterActive = iLength > 0 ? true : false;

		// De-Activate table header checkBox
		this._changeEnableProperty4SelectAll();

		// filter table items based on user selections
		this._filterItems();

		// check, whether actual selected item is still visible after filterItems -> if not -> deactivate selected
		// item
		if (oData.markedTableItem && oData.markedTableItem.getVisible() === false) {
			this._deactivateSelectedItem();
		}

		this._updateControlLogic();

		this._scrollToSelectedItem(oData.markedTableItem);
	};

	P13nDimMeasurePanel.prototype._tableItemPressed = function(oEvent) {
		this._switchMarkedTableItemTo(oEvent.getParameter('listItem'));
	};

	P13nDimMeasurePanel.prototype._deactivateSelectedItem = function() {
		this._switchMarkedTableItemTo(null);
	};

	P13nDimMeasurePanel.prototype._scrollToSelectedItem = function(oItem) {
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

	/* =========================================================== */
	/* Lifecycle methods */
	/* =========================================================== */
	/**
	 * Required adaptations before rendering
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype.onBeforeRendering = function() {
		// Synchronize columnsItems and items
		this.getColumnsItems().forEach(function(oColumnsItem) {
			this._applyColumnsItem(oColumnsItem);
		}, this);
	};

	/**
	 * Required adaptations after rendering
	 * 
	 * @private
	 */
	P13nDimMeasurePanel.prototype.onAfterRendering = function() {
		var that = this, iLiveChangeTimer = 0;

		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;
			window.clearTimeout(iLiveChangeTimer);
			iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();

				// following line is needed to get layout of OverflowToolbar rearranged IF it is used in a dialog
				that._oToolbar._resetAndInvalidateToolbar();
			}, 0);
		}
	};

	/**
	 * This method is executed before navigation, to provide validation result(s) for columnsPanel
	 * 
	 * @returns {boolean} true if it is allowed to navigate away from this panel, false if it is not allowed
	 * @public
	 * @since 1.34.0
	 */
	P13nDimMeasurePanel.prototype.onBeforeNavigationFrom = function() {
		var bResult = true;
		var aSelectedItems = this._oTable.getSelectedItems();
		var iVisibleItemsThreshold = this.getVisibleItemsThreshold();

		if (aSelectedItems && iVisibleItemsThreshold !== -1 && aSelectedItems.length > iVisibleItemsThreshold) {
			bResult = false;
		}

		return bResult;
	};

	/**
	 * Delivers a payload for columnsPanel that can be used at consumer side
	 * 
	 * @public
	 * @since 1.34.0
	 * @returns {object} oPayload, which contains useful information
	 */
	P13nDimMeasurePanel.prototype.getOkPayload = function() {
		var oData = this._oTableModel.getData();

		// ChartTypeKey
		var bChartTypeChanged = this.getChartTypeKey() !== oData.selectedChartTypeKey;
		if (bChartTypeChanged) {
			this.setChartTypeKey(oData.selectedChartTypeKey);
		}

		// ColumnsItems
		var bColumnsItemsChanged = this._syncModel2ColumnsItems();

		return {
			// We have to return columnsItems as of the fact that new created or deleted columnsItems are not updated in the model via list binding.
			columnsItems: this.getColumnsItems(),
			chartTypeChanged: bChartTypeChanged,
			columnsItemsChanged: bColumnsItemsChanged
		};
	};

	P13nDimMeasurePanel.prototype._syncModel2ColumnsItems = function() {
		var bColumnsItemsChanged = false;
		var oData = this._oTableModel.getData();

		// ColumnsItems
		oData.items.forEach(function(oModelItem) {
			var oColumnsItem = this._getColumnsItemByColumnKey(oModelItem.columnKey);
			if (oColumnsItem) {
				if (oColumnsItem && oColumnsItem.getVisible() && !oModelItem.persistentSelected) {
					// Remove columnsItem as the item selection has been unselected
					this.removeAggregation("columnsItems", oColumnsItem, true);
					oModelItem.persistentIndex = -1;
					oModelItem.persistentSelected = undefined;
					oModelItem.role = undefined;
					bColumnsItemsChanged = true;
					return;
				}
			} else {
				if (oModelItem.persistentSelected) {
					// Add new columnsItem as relevant changes (selected=true) has been done at item
					oColumnsItem = new sap.m.P13nColumnsItem({
						columnKey: oModelItem.columnKey,
						visible: oModelItem.persistentSelected
					});
					this.addAggregation("columnsItems", oColumnsItem, true);
					bColumnsItemsChanged = true;
					// oModelItem.persistentIndex = oColumnsItem.getIndex();
					// oModelItem.persistentSelected = oColumnsItem.getVisible();
					// oModelItem.role = oColumnsItem.getRole();
					// oModelItem.tableIndex = oColumnsItem.getIndex();
				} else {
					// Do nothing as no relevant changes has been done
					return;
				}
			}

			if (oModelItem.persistentIndex > -1 && oModelItem.persistentIndex !== oColumnsItem.getIndex()) {
				oColumnsItem.setIndex(oModelItem.persistentIndex);
				bColumnsItemsChanged = true;
			}

			if (oModelItem.role !== undefined && oModelItem.role !== oColumnsItem.getRole()) {
				oColumnsItem.setRole(oModelItem.role);
				bColumnsItemsChanged = true;
			}

			// Re-Index only the persistentIndex
			this._reindexModelItemsByPersistentIndex(this._oTableModel.getData().items);

		}, this);
		this._oTableModel.refresh();
		return bColumnsItemsChanged;
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @public
	 */
	P13nDimMeasurePanel.prototype.exit = function() {

		sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;

		this._oToolbar.destroy();
		this._oToolbar = null;

		this._oTable.destroy();
		this._oTable = null;

		// destroy model and its data
		if (this._oTableModel) {
			this._oTableModel.destroy();
			this._oTableModel = null;
		}
	};

	// ----------------------- chartTypeKey -----------------------------

	P13nDimMeasurePanel.prototype.setChartTypeKey = function(sChartTypeKey) {
		this.setProperty("chartTypeKey", sChartTypeKey);
		// Update model in order to notify the chartTypeKey to ComboBox control
		this._oTableModel.getData().selectedChartTypeKey = sChartTypeKey;
		this._oTableModel.refresh();
		return this;
	};

	// ----------------------- AvailableChartType -----------------------------

	P13nDimMeasurePanel.prototype.addAvailableChartType = function(oItem) {
		this.addAggregation("availableChartTypes", oItem);
		this._oTableModel.getData().availableChartTypes.push({
			key: oItem.getKey(),
			text: oItem.getText()
		});
		this._oTableModel.refresh();
		return this;
	};

	P13nDimMeasurePanel.prototype.insertAvailableChartType = function(oItem, iIndex) {
		this.insertAggregation("availableChartTypes", oItem, iIndex);

		this._oTableModel.getData().availableChartTypes.splice(iIndex, 0, {
			key: oItem.getKey(),
			text: oItem.getText()
		});
		this._oTableModel.refresh();
		return this;
	};

	P13nDimMeasurePanel.prototype.removeAvailableChartType = function(oItem) {
		var iIndex = this.indexOfAvailableChartTypes(oItem);
		if (iIndex > -1) {
			this._oTableModel.getData().availableChartTypes.splice(iIndex, 1);
			this._oTableModel.refresh();
		}
		oItem = this.removeAggregation("availableChartTypes", oItem);
		return oItem;
	};

	P13nDimMeasurePanel.prototype.removeAllAvailableChartType = function() {
		var aItems = this.removeAllAggregation("availableChartTypes");
		this._oTableModel.getData().availableChartTypes = [];
		this._oTableModel.refresh();
		return aItems;
	};

	P13nDimMeasurePanel.prototype.destroyAvailableChartType = function() {
		this.destroyAggregation("availableChartTypes");
		this._oTableModel.getData().availableChartTypes = [];
		this._oTableModel.refresh();
		return this;
	};

	// ----------------------- Item -----------------------------------------

	P13nDimMeasurePanel.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem);
		// Take over item data into model
		this._includeModelItem(oItem, -1);
		// Sort the table items when the item has been added programmatically (Note: columnsItems could be already existing)
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);
		// Re-Index the tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();
		return this;
	};

	P13nDimMeasurePanel.prototype.insertItem = function(oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex);
		// Take over item data into model
		this._includeModelItem(oItem, iIndex);
		// Sort the table items when the item has been added programmatically (Note: columnsItems could be already existing)
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);
		// Re-Index the tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();
		return this;
	};

	P13nDimMeasurePanel.prototype.removeItem = function(oItem) {
		var iIndex = this.indexOfItem(oItem);
		if (iIndex > -1) {
			// Remove item data from model
			this._oTableModel.getData().items.splice(iIndex, 1);
			// Sort the table items when the item has been removed programmatically (Note: columnsItems could be already existing)
			this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);
			// Re-Index the tableIndex
			this._reindexModelItemsByTableIndex(this._oTableModel.getData().items);
			this._oTableModel.refresh();
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nDimMeasurePanel.prototype.removeAllItems = function() {
		var aItems = this.removeAllAggregation("items");
		// Remove items data from model
		this._oTableModel.getData().items = [];
		this._oTableModel.refresh();
		return aItems;
	};

	P13nDimMeasurePanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");
		// Remove items data from model
		this._oTableModel.getData().items = [];
		this._oTableModel.refresh();
		return this;
	};

// ----------------------- ColumnsItem -----------------------------------------

// P13nDimMeasurePanel.prototype._addColumnsItem = function(oColumnsItem) {
// this.addAggregation("columnsItems", oColumnsItem, true);
//
// var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
// if (!oModelItem || (oModelItem.persistentIndex === oColumnsItem.getIndex() && oModelItem.persistentSelected === oColumnsItem.getVisible())) {
// return;
// }
//
// // Take over columnsItem data
// oModelItem.persistentIndex = oColumnsItem.getIndex();
// oModelItem.persistentSelected = oColumnsItem.getVisible();
// oModelItem.role = oColumnsItem.getRole();
// oModelItem.tableIndex = oColumnsItem.getIndex();
//
// // Do not sort after user action as the table should not be sorted once selected items has been rendered
//
// // Re-Index only the persistentIndex
// this._reindexModelItemsByPersistentIndex(this._oTableModel.getData().items);
// this._oTableModel.refresh();
// };

	P13nDimMeasurePanel.prototype.addColumnsItem = function(oColumnsItem) {
		this.addAggregation("columnsItems", oColumnsItem);
		this._applyColumnsItem(oColumnsItem);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertColumnsItem = function(oColumnsItem, iIndex) {
		this.insertAggregation("columnsItems", oColumnsItem, iIndex);
		this._applyColumnsItem(oColumnsItem);
		return this;
	};

// P13nDimMeasurePanel.prototype._removeColumnsItem = function(oColumnsItem) {
// oColumnsItem = this.removeAggregation("columnsItems", oColumnsItem, true);
// var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
// if (!oModelItem) {
// return;
// }
// // Remove columnsItem data
// oModelItem.persistentIndex = -1;
// oModelItem.persistentSelected = undefined;
// oModelItem.role = undefined;
//
// // Do not sort after user action as the table should not be sorted once selected items has been rendered
//
// // Re-Index only the persistentIndex
// this._reindexModelItemsByPersistentIndex(this._oTableModel.getData().items);
// this._oTableModel.refresh();
// };

	P13nDimMeasurePanel.prototype.removeColumnsItem = function(oColumnsItem) {
		oColumnsItem = this.removeAggregation("columnsItems", oColumnsItem);
		var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Remove columnsItem data
		oModelItem.persistentIndex = -1;
		oModelItem.persistentSelected = undefined;
		oModelItem.role = undefined;

		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();

		return oColumnsItem;
	};

	P13nDimMeasurePanel.prototype.removeAllColumnsItems = function() {
		// Remove columnsItem data
		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);

		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();

		var aColumnsItems = this.removeAllAggregation("columnsItems");
		return aColumnsItems;
	};

	P13nDimMeasurePanel.prototype.destroyColumnsItems = function() {
		// Remove columnsItem data
		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);

		// Sort the table items when the columnsItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();

		this.destroyAggregation("columnsItems");
		return this;
	};

	// ----------------------- Private Methods -----------------------------------------

	P13nDimMeasurePanel.prototype._includeModelItem = function(oItem, iIndex) {
		if (iIndex < 0) {
			iIndex = this._oTable.getItems().length;
		}
		var that = this;
		var fGetAvailableRoleTypes = function() {
			if (oItem.getAggregationRole() === "Dimension") {
				return [
					{
						key: "category",
						text: that._oRb.getText('COLUMNSPANEL_CHARTROLE_CATEGORY')
					}, {
						key: "series",
						text: that._oRb.getText('COLUMNSPANEL_CHARTROLE_SERIES')
					}
				];
			}
			if (oItem.getAggregationRole() === "Measure") {
				return [
					{
						key: "axis1",
						text: that._oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS1')
					}, {
						key: "axis2",
						text: that._oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS2')
					}
				];
			}
			return [];
		};
		var oModelItem = {
			columnKey: oItem.getColumnKey(),
			visible: true, // oItem.getVisible(),
			text: oItem.getText(),
			tooltip: oItem.getTooltip(),
			aggregationRole: oItem.getAggregationRole(),
			availableRoleTypes: fGetAvailableRoleTypes(),

			// originIndex: iIndex,
			// originSelected: undefined,
			persistentIndex: -1,
			persistentSelected: undefined,
			role: undefined,
			tableIndex: undefined
		};
		this._oTableModel.getData().items.splice(iIndex, 0, oModelItem);
		this._oTableModel.refresh();
	};

	P13nDimMeasurePanel.prototype._applyColumnsItem = function(oColumnsItem) {
		var oModelItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
		if (!oModelItem || oModelItem.persistentIndex === oColumnsItem.getIndex() && oModelItem.persistentSelected === oColumnsItem.getVisible()) {
			return;
		}

		// Take over columnsItem data
		oModelItem.persistentIndex = oColumnsItem.getIndex();
		oModelItem.persistentSelected = oColumnsItem.getVisible();
		oModelItem.role = oColumnsItem.getRole();
		oModelItem.tableIndex = oColumnsItem.getIndex();

		// Sort the table items when the columnsItem has been added programmatically
		this._sortModelItemsByPersistentIndex(this._oTableModel.getData().items);

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();
	};

	P13nDimMeasurePanel.prototype._onTableItemSelectionChange = function(oEvent) {

		// No update of model items is needed as it is already up-to-date due to binding

		// Do not sort after user action as the table should not be sorted once selected items has been rendered

		// Re-Index only the persistentIndex
		this._reindexModelItemsByPersistentIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();
	};

	P13nDimMeasurePanel.prototype._determinePersistentIndex = function(sColumnKey) {
		var aModelItemsCopy = jQuery.extend(true, [], this._oTableModel.getData().items);
		var oModelItemCopy = aModelItemsCopy[this._getModelItemIndexByColumnKey(sColumnKey)];

		// Model Item is already up-to-date.
		// oModelItemCopy.persistentSelected = true;

		// Do not sort after user action as the table should not be sorted once selected items has been rendered

		// Re-Index only the persistentIndex
		this._reindexModelItemsByPersistentIndex(aModelItemsCopy);

		return oModelItemCopy.persistentIndex;
	};

	P13nDimMeasurePanel.prototype._getColumnsItemByColumnKey = function(sColumnKey) {
		for (var i = 0, aColumnsItems = this.getColumnsItems(), iColumnsItemsLength = aColumnsItems.length; i < iColumnsItemsLength; i++) {
			if (aColumnsItems[i].getColumnKey() === sColumnKey) {
				return aColumnsItems[i];
			}
		}
		return null;
	};

	P13nDimMeasurePanel.prototype._getModelItemIndexByColumnKey = function(sColumnKey) {
		var iIndex = -1;
		this._oTableModel.getData().items.some(function(oModelItem, iIndex_) {
			if (oModelItem.columnKey === sColumnKey) {
				iIndex = iIndex_;
				return true;
			}
		});
		return iIndex;
	};

	P13nDimMeasurePanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var oModelItem = null;
		this._oTableModel.getData().items.some(function(oModelItem_) {
			if (oModelItem_.columnKey === sColumnKey) {
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
	P13nDimMeasurePanel.prototype._moveModelItems = function(iIndexFrom, iIndexTo) {
		var oData = this._oTableModel.getData();
		if (iIndexFrom < 0 || iIndexTo < 0 || iIndexFrom > oData.items.length - 1 || iIndexTo > oData.items.length - 1) {
			return false;
		}
		// Move items
		var aModelItems = oData.items.splice(iIndexFrom, 1);
		oData.items.splice(iIndexTo, 0, aModelItems[0]);

		// Do not sort after user action as the table should not be sorted once selected items has been rendered

		// Re-Index the persistentIndex and tableIndex
		this._reindexModelItemsByPersistentIndexAndTableIndex(this._oTableModel.getData().items);
		this._oTableModel.refresh();

		return true;
	};

	P13nDimMeasurePanel.prototype._switchVisibilityOfTableItems = function(bSelectedItemsSwitchedOn) {
		this._oTableModel.getData().items.forEach(function(oModelItem) {
			if (!oModelItem.persistentSelected) {
				oModelItem.visible = !bSelectedItemsSwitchedOn;
			}
		});
		this._oTableModel.refresh();
	};

	P13nDimMeasurePanel.prototype._getVisibleTableItems = function() {
		var aVisibleTableItems = [];
		this._oTable.getItems().forEach(function(oTableItem) {
			if (oTableItem.getVisible()) {
				aVisibleTableItems.push(oTableItem);
			}
		});
		return aVisibleTableItems;
	};

	P13nDimMeasurePanel.prototype._getVisibleModelItems = function() {
		var aVisibleModelItems = [];
		this._oTableModel.getData().items.forEach(function(oModelItem) {
			if (oModelItem.visible) {
				aVisibleModelItems.push(oModelItem);
			}
		});
		return aVisibleModelItems;
	};

	P13nDimMeasurePanel.prototype._getModelItemByTableItem = function(oTableItem) {
		// Note: visible model items are in sync with visible table items.
		var iIndex = this._getVisibleTableItems().indexOf(oTableItem);
		return this._getVisibleModelItems()[iIndex];
	};

	P13nDimMeasurePanel.prototype._reindexModelItemsByPersistentIndexAndTableIndex = function(aModelItems) {
		var iPersistentIndex = -1;
		aModelItems.forEach(function(oModelItem, iTableIndex) {
			if (oModelItem.persistentSelected) {
				iPersistentIndex++;
				oModelItem.persistentIndex = iPersistentIndex;
				// Note: the update into columnsItem is done all at once in _syncModel2ColumnsItems()
				// var oColumnsItem = this._getColumnsItemByColumnKey(oModelItem.columnKey);
				// if (oColumnsItem) {
				// oColumnsItem.setProperty("index", iPersistentIndex, true);
				// }
			}
			oModelItem.tableIndex = iTableIndex;
		}, this);
		this._oTableModel.getData().countOfSelectedItems = iPersistentIndex + 1;
	};

	P13nDimMeasurePanel.prototype._reindexModelItemsByPersistentIndex = function(aModelItems) {
		var iPersistentIndex = -1;
		aModelItems.forEach(function(oModelItem) {
			if (oModelItem.persistentSelected) {
				iPersistentIndex++;
				oModelItem.persistentIndex = iPersistentIndex;
				// Note: the update into columnsItem is done all at once in _syncModel2ColumnsItems()
				// var oColumnsItem = this._getColumnsItemByColumnKey(oModelItem.columnKey);
				// if (oColumnsItem) {
				// oColumnsItem.setProperty("index", iPersistentIndex, true);
				// }
			}
		}, this);
		this._oTableModel.getData().countOfSelectedItems = iPersistentIndex + 1;
	};

	P13nDimMeasurePanel.prototype._reindexModelItemsByTableIndex = function(aModelItems) {
		aModelItems.forEach(function(oModelItem, iTableIndex) {
			oModelItem.tableIndex = iTableIndex;
		}, this);
	};

	P13nDimMeasurePanel.prototype._sortModelItemsByPersistentIndex = function(aModelItems) {
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

	P13nDimMeasurePanel.prototype._switchMarkedTableItemTo = function(oTableItem) {
		var oData = this._oTableModel.getData();

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

		this._updateControlLogic();
	};

	P13nDimMeasurePanel.prototype._createTable = function() {
		var that = this;
		this._oTable = new Table({
			mode: sap.m.ListMode.MultiSelect,
			rememberSelections: false,
			itemPress: jQuery.proxy(this._tableItemPressed, this),
			selectionChange: jQuery.proxy(this._onTableItemSelectionChange, this),
			columns: [
				new sap.m.Column({
					header: new sap.m.Text({
						text: {
							path: '/countOfSelectedItems',
							formatter: function(iCountOfSelectedItems) {
								return that._oRb.getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [
									iCountOfSelectedItems, that._oTable.getItems().length
								]);
							}
						}
					})
				}), new sap.m.Column({
					header: new sap.m.Text({
						text: this._oRb.getText('COLUMNSPANEL_COLUMN_TYPE')
					})
				}), new sap.m.Column({
					header: new sap.m.Text({
						text: this._oRb.getText('COLUMNSPANEL_COLUMN_ROLE')
					})
				})
			],
			items: {
				path: "/items",
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{text}"
						}), new sap.m.Text({
							text: {
								path: '',
								formatter: function(oModelItem) {
									if (oModelItem.aggregationRole === "Dimension") {
										return that._oRb.getText('COLUMNSPANEL_TYPE_DIMENSION');
									}
									if (oModelItem.aggregationRole === "Measure") {
										return that._oRb.getText('COLUMNSPANEL_TYPE_MEASURE');
									}
								}
							}
						}), new sap.m.Select({
							selectedKey: "{role}",
							items: {
								path: 'availableRoleTypes',
// sorter: [
// new sap.ui.model.Sorter("/text", false)
// ],
								factory: function(sId, oBindingContext) {
									var oAvailableRoleType = oBindingContext.getObject();
									return new sap.ui.core.Item({
										key: oAvailableRoleType.key,
										text: oAvailableRoleType.text
									});
								}
							}
						})
					],
					visible: "{visible}",
					selected: "{persistentSelected}",
					tooltip: "{tooltip}",
					type: sap.m.ListType.Active
				})
			}
		});
		this._oTable.setModel(this._oTableModel);
	};

	P13nDimMeasurePanel.prototype._createToolbar = function() {
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
				"moveToOverflow": true
			})
		});
		oMoveDownButton.setModel(this._oTableModel);

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
				"moveToOverflow": true
			})
		});
		oMoveToBottomButton.setModel(this._oTableModel);

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
				"moveToOverflow": true
			})
		});
		oMoveUpButton.setModel(this._oTableModel);

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
				"moveToOverflow": true
			})
		});
		oMoveToTopButton.setModel(this._oTableModel);

		var oShowSelectedButton = new sap.m.Button({
			text: {
				path: '/selectedItemsSwitchedOn',
				formatter: function(bSelectedItemsSwitchedOn) {
					return bSelectedItemsSwitchedOn ? that._oRb.getText('COLUMNSPANEL_SHOW_ALL') : that._oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
				}
			},
			press: jQuery.proxy(this._switchSelectedItems, this),
			layoutData: new sap.m.OverflowToolbarLayoutData({
				"moveToOverflow": true
			})
		});
		oShowSelectedButton.setModel(this._oTableModel);

		this._oChartTypeComboBox = new sap.m.ComboBox({
			selectedKey: {
				path: '/selectedChartTypeKey'
			},
			items: {
				path: '/availableChartTypes',
				template: new sap.ui.core.Item({
					key: "{key}",
					text: "{text}"
				})
			}
		});
		this._oChartTypeComboBox.setModel(this._oTableModel);

		var iLiveChangeTimer = 0;
		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			liveChange: function(oEvent) {
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
			search: jQuery.proxy(this._executeSearch, this),
			layoutData: new sap.m.OverflowToolbarLayoutData({
				"minWidth": "12.5rem",
				"maxWidth": "23.077rem",
				"shrinkable": true,
				"moveToOverflow": false,
				"stayInOverflow": false

			})
		});

		this._oToolbar = new sap.m.OverflowToolbar({
			active: true,
			design: sap.m.ToolbarDesign.Solid, // Transparent,
			content: [
				this._oChartTypeComboBox, new sap.m.ToolbarSpacer(), this._oSearchField, oShowSelectedButton, oMoveToTopButton, oMoveUpButton, oMoveDownButton, oMoveToBottomButton
			]
		});
		this.addAggregation("content", this._oToolbar);
	};

	P13nDimMeasurePanel.prototype._updateControlLogic = function() {
		var oData = this._oTableModel.getData();
		var iLength = this._getVisibleTableItems().length;

		// Value in search field has been changed...
		oData.isMoveUpButtonEnabled = oData.indexOfMarkedTableItem > 0 && oData.isSearchFilterActive === false;
		oData.isMoveDownButtonEnabled = oData.indexOfMarkedTableItem < iLength - 1 && oData.indexOfMarkedTableItem > -1 && oData.isSearchFilterActive === false;

		this._oTableModel.refresh();
	};

	P13nDimMeasurePanel.prototype._showAll = function() {
		jQuery.sap.log.info("ModelItems: table persistent        TableItems: current");
		jQuery.sap.log.info("--------------------------------------------------------------");
		var oData = this._oTableModel.getData();
		var aTableItems = this._oTable.getItems();
		var iLength = Math.max(oData.items.length, this._oTable.getItems().length);
		for (var i = 0; i < iLength; i++) {
			var oModelItem = oData.items[i];
			var oTableItem = aTableItems[i];
			jQuery.sap.log.info(oModelItem.columnKey + ": " + oModelItem.tableIndex + " " + oModelItem.persistentSelected + "_" + oModelItem.persistentIndex + ";    " + oTableItem.getId() + " " + oTableItem.getCells()[0].getText() + ": " + oTableItem.getSelected() + " " + oTableItem.getCells()[1].getText());
		}
	};

	return P13nDimMeasurePanel;

}, /* bExport= */true);
