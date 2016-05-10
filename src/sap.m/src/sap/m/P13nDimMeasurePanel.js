/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nDimMeasurePanel.
sap.ui.define([
	'jquery.sap.global', './ColumnListItem', './P13nPanel', './P13nDimMeasureItem', './SearchField', './Table', './library', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel'
], function(jQuery, ColumnListItem, P13nPanel, P13nDimMeasureItem, SearchField, Table, library, Control, JSONModel) {
	"use strict";

	/**
	 * Constructor for a new P13nDimMeasurePanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nDimMeasurePanel control is used to define chart-specific settings like chart type, the visibility, the order and roles of
	 *        dimensions and measures for table personalization.
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
				dimMeasureItems: {
					type: "sap.m.P13nDimMeasureItem",
					multiple: true,
					singularName: "dimMeasureItem",
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

	P13nDimMeasurePanel.prototype.init = function() {
		var that = this;
		this._iLiveChangeTimer = 0;
		this._iSearchTimer = 0;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._bOnAfterRenderingFirstTimeExecuted = false;
		this._bOnBeforeRenderingFirstTimeExecuted = false;

		var oModel = new JSONModel({
			availableChartTypes: [],
			selectedChartTypeKey: null,
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
		this.setModel(oModel, "$sapmP13nDimMeasurePanel");

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

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._moveMarkedTableItem = function(sDirection) {
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();
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
	 * *
	 *
	 * @param {string} sSearchText Table items are filtered by this text. <b>Note:</b> " " is a valid value. The table will be set back if
	 *        sSearchText="".
	 * @private
	 */
	P13nDimMeasurePanel.prototype._filterModelItemsBySearchText = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
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
			// Search in aggregationRole
			if (oModelItem.aggregationRole && oModelItem.aggregationRole.match(oRegExp)) {
				oModelItem.visible = true;
			}
			// Search in role
			if (oModelItem.role && oModelItem.role.match(oRegExp)) {
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
	P13nDimMeasurePanel.prototype.onBeforeRendering = function() {
		// Synchronize dimMeasureItems and items when the panel is rendered first time
		if (!this._bOnBeforeRenderingFirstTimeExecuted) {
			this._bOnBeforeRenderingFirstTimeExecuted = true;
			this._syncPanel2Model();
		}

		// Set marked item initially to the first table item
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();
		if (!oData.markedTableItem) {
			var aVisibleTableItems = this._getVisibleTableItems();
			this._switchMarkedTableItemTo(aVisibleTableItems[0]);
		}
	};

	P13nDimMeasurePanel.prototype.onAfterRendering = function() {
		var that = this;

		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;
			window.clearTimeout(this._iLiveChangeTimer);
			this._iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();

				// following line is needed to get layout of OverflowToolbar rearranged IF it is used in a dialog
				that._getToolbar()._resetAndInvalidateToolbar();
			}, 0);
		}
	};

	P13nDimMeasurePanel.prototype.getOkPayload = function() {
		this._syncModel2Panel();
		return {
			// We have to return dimMeasureItems as of the fact that new created or deleted dimMeasureItems are not updated in the model via list
			// binding.
			dimMeasureItems: this.getDimMeasureItems(),
			chartTypeKey: this.getChartTypeKey()
		};
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._syncModel2Panel = function() {
		if (!this._bOnBeforeRenderingFirstTimeExecuted) {
			// The renderer has not been executed (the dimeasure tab has not been shown in panel). So there is no need to synchronize model to panel.
			// Keep panel aggregations as it is.
			return;
		}
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();

		// ChartTypeKey
		this.setChartTypeKey(oData.selectedChartTypeKey);

		// DimMeasureItems
		oData.items.forEach(function(oModelItem) {
			var oDimMeasureItem = this._getDimMeasureItemByColumnKey(oModelItem.columnKey);
			if (oDimMeasureItem) {
				// Update existing dimMeasureItem if some properties have been changed
				if (!this._isDimMeasureItemEqualToModelItem(oDimMeasureItem, oModelItem)) {
					oDimMeasureItem.setVisible(oModelItem.persistentSelected);
					oDimMeasureItem.setIndex(oModelItem.persistentIndex);
					oDimMeasureItem.setRole(oModelItem.role);
				}
				return;
			}
			if (!oModelItem.persistentSelected) {
				// Nothing relevant has been changed as item is not selected
				return;
			}
			// Create a new dimMeasureItem if an item have been changed to 'selected'
			oDimMeasureItem = new sap.m.P13nDimMeasureItem({
				columnKey: oModelItem.columnKey,
				visible: oModelItem.persistentSelected,
				index: oModelItem.persistentIndex,
				role: oModelItem.role
			});
			this.addAggregation("dimMeasureItems", oDimMeasureItem, true);
		}, this);
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._syncPanel2Model = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		this.getDimMeasureItems().forEach(function(oDimMeasureItem) {
			var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
			if (!oModelItem || this._isDimMeasureItemEqualToModelItem(oDimMeasureItem, oModelItem)) {
				return;
			}

			// Take over dimMeasureItem data
			oModelItem.persistentIndex = oDimMeasureItem.getIndex();
			oModelItem.persistentSelected = oDimMeasureItem.getVisible();
			oModelItem.role = oDimMeasureItem.getRole();
			// Sort the table items only by persistentIndex
			this._sortModelItemsByPersistentIndex(oData.items);
			// Re-Index only the tableIndex
			this._reindexModelItemsByTableIndex(oData);
		}, this);
		oModel.refresh();
	};

	P13nDimMeasurePanel.prototype.exit = function() {

		sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;

		this._getToolbar().destroy();

		this._oTable.destroy();
		this._oTable = null;

		// destroy model and its data
		if (this.getModel("$sapmP13nDimMeasurePanel")) {
			this.getModel("$sapmP13nDimMeasurePanel").destroy();
		}

		window.clearTimeout(this._iLiveChangeTimer);
		window.clearTimeout(this._iSearchTimer);
	};

	// ----------------------- Overwrite Method of chartTypeKey Property --------------------------

	P13nDimMeasurePanel.prototype.setChartTypeKey = function(sChartTypeKey) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this.setProperty("chartTypeKey", sChartTypeKey);
		// Update model in order to notify the chartTypeKey to ComboBox control
		oModel.getData().selectedChartTypeKey = sChartTypeKey;
		return this;
	};

	// ----------------------- Overwrite Methods of AvailableChartType Aggregation -----------------

	P13nDimMeasurePanel.prototype.addAvailableChartType = function(oItem) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this.addAggregation("availableChartTypes", oItem);
		oModel.getData().availableChartTypes.push({
			key: oItem.getKey(),
			text: oItem.getText()
		});
		return this;
	};

	P13nDimMeasurePanel.prototype.insertAvailableChartType = function(oItem, iIndex) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this.insertAggregation("availableChartTypes", oItem, iIndex);

		oModel.getData().availableChartTypes.splice(iIndex, 0, {
			key: oItem.getKey(),
			text: oItem.getText()
		});
		return this;
	};

	P13nDimMeasurePanel.prototype.removeAvailableChartType = function(oItem) {
		var iIndex = this.indexOfAvailableChartTypes(oItem);
		if (iIndex > -1) {
			var oModel = this.getModel("$sapmP13nDimMeasurePanel");
			oModel.getData().availableChartTypes.splice(iIndex, 1);
		}
		oItem = this.removeAggregation("availableChartTypes", oItem);
		return oItem;
	};

	P13nDimMeasurePanel.prototype.removeAllAvailableChartType = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var aItems = this.removeAllAggregation("availableChartTypes");
		oModel.getData().availableChartTypes = [];
		return aItems;
	};

	P13nDimMeasurePanel.prototype.destroyAvailableChartType = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this.destroyAggregation("availableChartTypes");
		oModel.getData().availableChartTypes = [];
		return this;
	};

	// ----------------------- Overwrite Methods of Item Aggregation -----------------

	P13nDimMeasurePanel.prototype.addItem = function(oItem) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();
		this._bOnBeforeRenderingFirstTimeExecuted = false;

		this.addAggregation("items", oItem);
		// Take over item data into model
		this._includeModelItem(oItem, -1);
		// Sort the table items when the item has been added programmatically (Note: dimMeasureItems could be already existing)
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertItem = function(oItem, iIndex) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();
		this._bOnBeforeRenderingFirstTimeExecuted = false;

		this.insertAggregation("items", oItem, iIndex);
		// Take over item data into model
		this._includeModelItem(oItem, iIndex);
		// Sort the table items when the item has been added programmatically (Note: dimMeasureItems could be already existing)
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nDimMeasurePanel.prototype.removeItem = function(oItem) {
		var iIndex = this.indexOfItem(oItem);
		if (iIndex > -1) {
			var oModel = this.getModel("$sapmP13nDimMeasurePanel");
			var oData = oModel.getData();
			this._bOnBeforeRenderingFirstTimeExecuted = false;

			// Remove item data from model
			oModel.getData().items.splice(iIndex, 1);
			// Sort the table items when the item has been removed programmatically (Note: dimMeasureItems could be already existing)
			this._sortModelItemsByPersistentIndex(oData.items);
			// Re-Index the tableIndex
			this._reindexModelItemsByTableIndex(oData);
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nDimMeasurePanel.prototype.removeAllItems = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this._bOnBeforeRenderingFirstTimeExecuted = false;
		var aItems = this.removeAllAggregation("items");
		// Remove items data from model
		oModel.getData().items = [];
		return aItems;
	};

	P13nDimMeasurePanel.prototype.destroyItems = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		this._bOnBeforeRenderingFirstTimeExecuted = false;
		this.destroyAggregation("items");
		// Remove items data from model
		oModel.getData().items = [];
		return this;
	};

	// ----------------------- Overwrite Methods of DimMeasureItem Aggregation -----------------

	P13nDimMeasurePanel.prototype.addDimMeasureItem = function(oDimMeasureItem) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		this.addAggregation("dimMeasureItems", oDimMeasureItem);
		var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over dimMeasureItem data
		oModelItem.persistentIndex = oDimMeasureItem.getIndex();
		oModelItem.persistentSelected = oDimMeasureItem.getVisible();
		oModelItem.role = oDimMeasureItem.getRole();
		// Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertDimMeasureItem = function(oDimMeasureItem, iIndex) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		this.insertAggregation("dimMeasureItems", oDimMeasureItem, iIndex);
		var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over dimMeasureItem data
		oModelItem.persistentIndex = oDimMeasureItem.getIndex();
		oModelItem.persistentSelected = oDimMeasureItem.getVisible();
		oModelItem.role = oDimMeasureItem.getRole();
		// Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only the tableIndex
		this._reindexModelItemsByTableIndex(oData);
		return this;
	};

	P13nDimMeasurePanel.prototype.removeDimMeasureItem = function(oDimMeasureItem) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		oDimMeasureItem = this.removeAggregation("dimMeasureItems", oDimMeasureItem);
		var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Remove dimMeasureItem data
		oModelItem.persistentIndex = -1;
		oModelItem.persistentSelected = undefined;
		oModelItem.role = undefined;
		// Sort the table items when the dimMeasureItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by dimMeasureItems
		this._reindexModelItemsByTableIndex(oData);
		return oDimMeasureItem;
	};

	P13nDimMeasurePanel.prototype.removeAllDimMeasureItems = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		// Remove dimMeasureItem data
		this.getDimMeasureItems().forEach(function(oDimMeasureItem) {
			var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);
		// Sort the table items when the dimMeasureItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by dimMeasureItems
		this._reindexModelItemsByTableIndex(oData);
		var aDimMeasureItems = this.removeAllAggregation("dimMeasureItems");
		return aDimMeasureItems;
	};

	P13nDimMeasurePanel.prototype.destroyDimMeasureItems = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();

		// Remove dimMeasureItem data
		this.getDimMeasureItems().forEach(function(oDimMeasureItem) {
			var oModelItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);
		// Sort the table items when the dimMeasureItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// Re-Index only tableIndex, keep persistentIndex given by dimMeasureItems
		this._reindexModelItemsByTableIndex(oData);
		this.destroyAggregation("dimMeasureItems");
		return this;
	};

	// ----------------------- Private Methods -----------------------------------------

	/**
	 * @private
	 */
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
			visible: true,
			text: oItem.getText(),
			tooltip: oItem.getTooltip(),
			aggregationRole: oItem.getAggregationRole(),
			availableRoleTypes: fGetAvailableRoleTypes(),

			// default value
			persistentIndex: -1,
			persistentSelected: undefined,
			role: undefined,

			tableIndex: undefined
		};
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		oModel.getData().items.splice(iIndex, 0, oModelItem);
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._onItemPressed = function(oEvent) {
		this._switchMarkedTableItemTo(oEvent.getParameter('listItem'));
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._onSelectionChange = function(oEvent) {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
		var oData = oModel.getData();
		var oTableItem = oEvent.getParameter("listItem");

		this._switchMarkedTableItemTo(oTableItem);

		// No update of model items is needed as it is already up-to-date due to binding

		// Do not sort after user interaction as the table should not be sorted once selected items has been rendered

		// Re-Index only the persistentIndex after user interaction
		this._reindexModelItemsByPersistentIndex(oData);
		oModel.refresh();

		this._notifyChange();
	};

	/**
	 * Switches 'Show Selected' button to 'Show All' and back.
	 *
	 * @private
	 */
	P13nDimMeasurePanel.prototype._onSwitchButtonShowSelected = function() {
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();

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
	P13nDimMeasurePanel.prototype._onExecuteSearch = function() {
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		this._scrollToSelectedItem(oData.markedTableItem);

		this._updateControlLogic();
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._getDimMeasureItemByColumnKey = function(sColumnKey) {
		for (var i = 0, aDimMeasureItems = this.getDimMeasureItems(), iDimMeasureItemsLength = aDimMeasureItems.length; i < iDimMeasureItemsLength; i++) {
			if (aDimMeasureItems[i].getColumnKey() === sColumnKey) {
				return aDimMeasureItems[i];
			}
		}
		return null;
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._getModelItemIndexByColumnKey = function(sColumnKey) {
		var iIndex = -1;
		this.getModel("$sapmP13nDimMeasurePanel").getData().items.some(function(oModelItem, iIndex_) {
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
	P13nDimMeasurePanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var oModelItem = null;
		this.getModel("$sapmP13nDimMeasurePanel").getData().items.some(function(oModelItem_) {
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
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
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
	P13nDimMeasurePanel.prototype._switchVisibilityOfUnselectedModelItems = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
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
	P13nDimMeasurePanel.prototype._getVisibleTableItems = function() {
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
	P13nDimMeasurePanel.prototype._getVisibleModelItems = function() {
		var aVisibleModelItems = [];
		this.getModel("$sapmP13nDimMeasurePanel").getData().items.forEach(function(oModelItem) {
			if (oModelItem.visible) {
				aVisibleModelItems.push(oModelItem);
			}
		});
		return aVisibleModelItems;
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._getSelectedModelItems = function() {
		var aSelectedModelItems = [];
		this.getModel("$sapmP13nDimMeasurePanel").getData().items.forEach(function(oModelItem) {
			if (oModelItem.persistentSelected) {
				aSelectedModelItems.push(oModelItem);
			}
		});
		return aSelectedModelItems;
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._getModelItemByTableItem = function(oTableItem) {
		// Note: visible model items are in sync with visible table items.
		var iIndex = this._getVisibleTableItems().indexOf(oTableItem);
		return this._getVisibleModelItems()[iIndex];
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._reindexModelItemsByPersistentIndexAndTableIndex = function(oData) {
		var iPersistentIndex = -1;
		oData.countOfSelectedItems = 0;
		oData.countOfItems = 0;
		oData.items.forEach(function(oModelItem, iTableIndex) {
			oModelItem.persistentIndex = -1;
			if (oModelItem.persistentSelected) {
				iPersistentIndex++;
				oData.countOfSelectedItems++;
				oModelItem.persistentIndex = iPersistentIndex;
			}
			oModelItem.tableIndex = iTableIndex;
			oData.countOfItems++;
		});
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._reindexModelItemsByPersistentIndex = function(oData) {
		var iPersistentIndex = -1;
		oData.countOfSelectedItems = 0;
		oData.items.forEach(function(oModelItem) {
			oModelItem.persistentIndex = -1;
			if (oModelItem.persistentSelected) {
				iPersistentIndex++;
				oData.countOfSelectedItems++;
				oModelItem.persistentIndex = iPersistentIndex;
			}
		});
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._reindexModelItemsByTableIndex = function(oData) {
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

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._switchMarkedTableItemTo = function(oTableItem) {
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();

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

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._createTable = function() {
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
// this._oTable.selectAll = function() {
// // var oData = that.getModel("$sapmP13nDimMeasurePanel").getData();
// that._getVisibleTableItems().forEach(function(oTableItem) {
// if (!oTableItem.getSelected()) {
// that._oTable.setSelectedItem(oTableItem, true, true);
// // oData.countOfSelectedItems++;
// }
// });
// this.updateSelectAllCheckbox();
// };
// this._oTable.removeSelections = function() {
// // var oData = that.getModel("$sapmP13nDimMeasurePanel").getData();
// that._getVisibleTableItems().forEach(function(oTableItem) {
// if (oTableItem.getSelected()) {
// that._oTable.setSelectedItem(oTableItem, false, true);
// // oData.countOfSelectedItems--;
// }
// });
// this.updateSelectAllCheckbox();
// };
		this._oTable.setModel(this.getModel("$sapmP13nDimMeasurePanel"));
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._createToolbar = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
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

		var oSearchField = new SearchField(this.getId() + "-searchField", {
			liveChange: function(oEvent) {
				var sValue = oEvent.getSource().getValue(), iDelay = (sValue ? 300 : 0); // no delay if value is empty
				// execute search after user stops typing for 300ms
				window.clearTimeout(that._iSearchTimer);
				if (iDelay) {
					that._iSearchTimer = window.setTimeout(function() {
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

		var oChartTypeComboBox = new sap.m.ComboBox({
			selectedKey: {
				path: '/selectedChartTypeKey'
			},
			items: {
				path: '/availableChartTypes',
				template: new sap.ui.core.Item({
					key: "{key}",
					text: "{text}"
				})
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow: false,
				stayInOverflow: false
			})
		});
		oChartTypeComboBox.setModel(oModel);

		var oToolbar = new sap.m.OverflowToolbar(this.getId() + "-toolbar", {
			design: sap.m.ToolbarDesign.Solid, // Transparent,
			content: [
				oChartTypeComboBox, new sap.m.ToolbarSpacer(), oSearchField, oShowSelectedButton, oMoveToTopButton, oMoveUpButton, oMoveDownButton, oMoveToBottomButton
			]
		});
		this.addAggregation("content", oToolbar);
	};

	P13nDimMeasurePanel.prototype._getToolbar = function() {
		return sap.ui.getCore().byId(this.getId() + "-toolbar") || null;
	};

	P13nDimMeasurePanel.prototype._getSearchField = function() {
		return sap.ui.getCore().byId(this.getId() + "-searchField") || null;
	};

	P13nDimMeasurePanel.prototype._getSearchText = function() {
		var oSearchField = this._getSearchField();
		return oSearchField ? oSearchField.getValue() : "";
	};

	P13nDimMeasurePanel.prototype._isFilteredBySearchText = function() {
		return !!this._getSearchText().length;
	};

	P13nDimMeasurePanel.prototype._isFilteredByShowSelected = function() {
		return this.getModel("$sapmP13nDimMeasurePanel").getData().showOnlySelectedItems;
	};

	P13nDimMeasurePanel.prototype._isDimMeasureItemEqualToModelItem = function(oDimMeasureItem, oModelItem) {
		return oModelItem.persistentIndex === oDimMeasureItem.getIndex() && oModelItem.persistentSelected === oDimMeasureItem.getVisible() && oModelItem.role === oDimMeasureItem.getRole();
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._updateControlLogic = function() {
		var oModel = this.getModel("$sapmP13nDimMeasurePanel");
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

	P13nDimMeasurePanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._showAll = function() {
		jQuery.sap.log.info("ModelItems: visible tableIndex isPersistent        TableItems: current");
		jQuery.sap.log.info("--------------------------------------------------------------");
		var oData = this.getModel("$sapmP13nDimMeasurePanel").getData();
		var aTableItems = this._oTable.getItems();
		var iLength = Math.max(oData.items.length, this._oTable.getItems().length);
		for (var i = 0; i < iLength; i++) {
			var oModelItem = oData.items[i];
			var oTableItem = aTableItems[i];
			jQuery.sap.log.info(oModelItem.columnKey + ": " + oModelItem.visible + " " + oModelItem.tableIndex + " " + oModelItem.persistentSelected + "_" + oModelItem.persistentIndex + ";    " + oTableItem.getId() + " " + oTableItem.getCells()[0].getText() + ": " + oTableItem.getSelected() + " " + oTableItem.getCells()[1].getText());
		}
	};

	return P13nDimMeasurePanel;

}, /* bExport= */true);
