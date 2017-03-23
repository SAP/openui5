/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nChartSelectionPanel.
sap.ui.define([
	'jquery.sap.global', './ColumnListItem', './P13nSelectionPanel', './P13nChartSelectionItem', './SearchField', './Table', './library', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel'
], function(jQuery, ColumnListItem, P13nSelectionPanel, P13nChartSelectionItem, SearchField, Table, library, Control, JSONModel) {
	"use strict";

	/**
	 * Constructor for a new P13nChartSelectionPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nChartSelectionPanel control is used to define chart-specific settings like chart type, the visibility, the order and roles of
	 *        dimensions and measures for table personalization.
	 * @extends sap.m.P13nSelectionPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46.0
	 * @alias sap.m.P13nChartSelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nChartSelectionPanel = P13nSelectionPanel.extend("sap.m.P13nChartSelectionPanel", /** @lends sap.m.P13nChartSelectionPanel.prototype */
	{
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Specifies a chart type key.
				 */
				chartTypeKey: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * Specifies available chart types.
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

	// Overwrite P13nSelectionPanel method
	P13nChartSelectionPanel.prototype.getOkPayload = function() {
		this._syncModel2Panel();
		return {
			// We have to return selectionItems as of the fact that new created or deleted selectionItems are not updated in the model via list
			// binding.
			selectionItems: this.getSelectionItems(),
			chartTypeKey: this.getChartTypeKey()
		};
	};

	// ----------------------- Overwrite Method -----------------

	P13nChartSelectionPanel.prototype.init = function() {
		P13nSelectionPanel.prototype.init.apply(this, arguments);

		// Enhance internal model with chart specific attributes
		var oData = this._getInternalModel().getData();
		oData.availableChartTypes = [];
		oData.selectedChartTypeKey = null;

		this.setType(sap.m.P13nPanelType.dimeasure);
		this.setTitle(this._oRb.getText("CHARTPANEL_TITLE"));
	};

	P13nChartSelectionPanel.prototype.getConfig = function() {
		return {
			isEnabledSelectedItemsSorting: true,
			isEnabledSelectedButton: true,
			isEnabledMoveButtons: true
		};
	};

	// ----------------------- Overwrite Method of chartTypeKey Property --------------------------

	P13nChartSelectionPanel.prototype.setChartTypeKey = function(sChartTypeKey) {
		var oModel = this._getInternalModel();
		this.setProperty("chartTypeKey", sChartTypeKey);
		// Update model in order to notify the chartTypeKey to ComboBox control
		oModel.getData().selectedChartTypeKey = sChartTypeKey;
		return this;
	};

	// ----------------------- Overwrite Methods of SelectionItem Aggregation ---------------------

	P13nChartSelectionPanel.prototype.addSelectionItem = function(oSelectionItem) {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		this.addAggregation("selectionItems", oSelectionItem);
		var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over dimMeasureItem data
		oModelItem.persistentIndex = oSelectionItem.getIndex();
		oModelItem.persistentSelected = oSelectionItem.getSelected();
		oModelItem.role = oSelectionItem.getRole();
		// 1. Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// 2. Re-Index only the tableIndex
		this._updateModelItemsTableIndex(oData);
		this._updateCounts(oData);
		return this;
	};

	P13nChartSelectionPanel.prototype.insertSelectionItem = function(oSelectionItem, iIndex) {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		this.insertAggregation("selectionItems", oSelectionItem, iIndex);
		var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Take over dimMeasureItem data
		oModelItem.persistentIndex = oSelectionItem.getIndex();
		oModelItem.persistentSelected = oSelectionItem.getSelected();
		oModelItem.role = oSelectionItem.getRole();
		// 1. Sort the table only by persistentIndex
		this._sortModelItemsByPersistentIndex(oData.items);
		// 2. Re-Index only the tableIndex
		this._updateModelItemsTableIndex(oData);
		this._updateCounts(oData);
		return this;
	};

	P13nChartSelectionPanel.prototype.removeSelectionItem = function(oSelectionItem) {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		oSelectionItem = this.removeAggregation("selectionItems", oSelectionItem);
		var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
		if (!oModelItem) {
			return;
		}
		// Remove dimMeasureItem data
		oModelItem.persistentIndex = -1;
		oModelItem.persistentSelected = undefined;
		oModelItem.role = undefined;
		// 1. Sort the table items when the selectionItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// 2. Re-Index only tableIndex, keep persistentIndex given by selectionItems
		this._updateModelItemsTableIndex(oData);
		this._updateCounts(oData);
		return oSelectionItem;
	};

	P13nChartSelectionPanel.prototype.removeAllSelectionItems = function() {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		// Remove dimMeasureItem data
		this.getSelectionItems().forEach(function(oSelectionItem) {
			var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);
		// 1. Sort the table items when the selectionItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// 2. Re-Index only tableIndex, keep persistentIndex given by selectionItems
		this._updateModelItemsTableIndex(oData);
		this._updateCounts(oData);
		var aSelectionItems = this.removeAllAggregation("selectionItems");
		return aSelectionItems;
	};

	P13nChartSelectionPanel.prototype.destroySelectionItems = function() {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		// Remove dimMeasureItem data
		this.getSelectionItems().forEach(function(oSelectionItem) {
			var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			oModelItem.persistentIndex = -1;
			oModelItem.persistentSelected = undefined;
			oModelItem.role = undefined;
		}, this);
		// 1. Sort the table items when the selectionItem has been removed programmatically
		this._sortModelItemsByPersistentIndex(oData.items);
		// 2. Re-Index only tableIndex, keep persistentIndex given by selectionItems
		this._updateModelItemsTableIndex(oData);
		this._updateCounts(oData);
		this.destroyAggregation("selectionItems");
		return this;
	};

	// ----------------------- Overwrite Methods of AvailableChartType Aggregation -----------------

	P13nChartSelectionPanel.prototype.addAvailableChartType = function(oItem) {
		var oModel = this._getInternalModel();
		this.addAggregation("availableChartTypes", oItem);
		oModel.getData().availableChartTypes.push({
			key: oItem.getKey(),
			text: oItem.getText()
		});
		return this;
	};

	P13nChartSelectionPanel.prototype.insertAvailableChartType = function(oItem, iIndex) {
		var oModel = this._getInternalModel();
		this.insertAggregation("availableChartTypes", oItem, iIndex);
		oModel.getData().availableChartTypes.splice(iIndex, 0, {
			key: oItem.getKey(),
			text: oItem.getText()
		});
		return this;
	};

	P13nChartSelectionPanel.prototype.removeAvailableChartType = function(oItem) {
		var iIndex = this.indexOfAvailableChartTypes(oItem);
		if (iIndex > -1) {
			var oModel = this._getInternalModel();
			oModel.getData().availableChartTypes.splice(iIndex, 1);
		}
		oItem = this.removeAggregation("availableChartTypes", oItem);
		return oItem;
	};

	P13nChartSelectionPanel.prototype.removeAllAvailableChartType = function() {
		var oModel = this._getInternalModel();
		var aItems = this.removeAllAggregation("availableChartTypes");
		oModel.getData().availableChartTypes = [];
		return aItems;
	};

	P13nChartSelectionPanel.prototype.destroyAvailableChartType = function() {
		var oModel = this._getInternalModel();
		this.destroyAggregation("availableChartTypes");
		oModel.getData().availableChartTypes = [];
		return this;
	};

	// ----------------------- Overwrite Method of P13nSelectionPanel -----------------

	P13nChartSelectionPanel.prototype.onBeforeNavigationFrom = function() {
		// Check if chart type fits selected dimensions and measures, before we can leave the panel.
		var sChartType = this.getChartTypeKey();
		var aDimensionItems = [];
		var aMeasureItems = [];

		this.getSelectionItems().forEach(function(oSelectionItem) {
			var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
			if (!oModelItem) {
				return;
			}
			if (oModelItem.aggregationRole === "Dimension") {
				aDimensionItems.push(oSelectionItem);
			} else if (oModelItem.aggregationRole === "Measure") {
				aMeasureItems.push(oSelectionItem);
			}
		}, this);

		aDimensionItems = aDimensionItems.filter(function(oItem) {
			return oItem.getSelected();
		}).map(function(oItem) {
			return {
				name: oItem.getColumnKey()
			};
		});
		aMeasureItems = aMeasureItems.filter(function(oItem) {
			return oItem.getSelected();
		}).map(function(oItem) {
			return {
				name: oItem.getColumnKey()
			};
		});

		sap.ui.getCore().loadLibrary("sap.chart");
		var oResult;
		try {
			oResult = sap.chart.api.getChartTypeLayout(sChartType, aDimensionItems, aMeasureItems);
		} catch (oException) {
			return false;
		}
		return oResult.errors.length === 0;
	};

	// ----------------------- Private Methods -----------------------------------------

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._syncPanel2Model = function() {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		// Synchronize selectionItems and items
		this.getSelectionItems().forEach(function(oSelectionItem) {
			var oModelItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
			if (!oModelItem || this._isSelectionItemEqualToModelItem(oSelectionItem, oModelItem)) {
				return;
			}

			// Take over selectionItem data
			oModelItem.persistentIndex = oSelectionItem.getIndex();
			oModelItem.persistentSelected = oSelectionItem.getSelected();
            oModelItem.role = oSelectionItem.getRole();
			// 1. Sort the table items only by persistentIndex
			this._sortModelItemsByPersistentIndex(oData.items);
			// 2. Re-Index only the tableIndex
			this._updateModelItemsTableIndex(oData);
			this._updateCounts(oData);
		}, this);
		oModel.refresh();
	};

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._syncModel2Panel = function() {
		if (!this._bOnBeforeRenderingFirstTimeExecuted) {
			// The renderer has not been executed (the dimeasure tab has not been shown in panel). So there is no need to synchronize model to panel.
			// Keep panel aggregations as it is.
			return;
		}
		var oData = this._getInternalModel().getData();

		// ChartTypeKey
		this.setChartTypeKey(oData.selectedChartTypeKey);

		// SelectionItems
		oData.items.forEach(function(oModelItem) {
			var oSelectionItem = this._getSelectionItemByColumnKey(oModelItem.columnKey);
			if (oSelectionItem) {
				// Update existing dimMeasureItem if some properties have been changed
				if (!this._isSelectionItemEqualToModelItem(oSelectionItem, oModelItem)) {
					oSelectionItem.setSelected(oModelItem.persistentSelected);
					oSelectionItem.setIndex(oModelItem.persistentIndex);
					oSelectionItem.setRole(oModelItem.role);
				}
				return;
			}
			if (!oModelItem.persistentSelected) {
				// Nothing relevant has been changed as item is not selected
				return;
			}
			// Create a new dimMeasureItem if an item have been changed to 'selected'
			oSelectionItem = new sap.m.P13nChartSelectionItem({
				columnKey: oModelItem.columnKey,
				selected: oModelItem.persistentSelected,
				index: oModelItem.persistentIndex,
				role: oModelItem.role
			});
			this.addAggregation("selectionItems", oSelectionItem, true);
		}, this);
	};

	/**
	 * @param {string} sSearchText Table items are filtered by this text. <b>Note:</b> " " is a valid value. The table will be set back if
	 *        sSearchText="".
	 * @private
	 */
	P13nChartSelectionPanel.prototype._filterModelItemsBySearchText = function() {
		var oModel = this._getInternalModel();
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
	P13nChartSelectionPanel.prototype._includeModelItem = function(oItem, iIndex) {
		var oModel = this._getInternalModel();
		var oData = oModel.getData();

		if (iIndex < 0) {
			iIndex = oData.items.length;
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

		oData.items.splice(iIndex, 0, oModelItem);
	};

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._getTableColumns = function() {
		var that = this;
		return [
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
		];
	};

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._getTableTemplate = function() {
		var that = this;
		return new sap.m.ColumnListItem({
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
					},
					change: jQuery.proxy(that.notifyChange, that)
				})
			],
			visible: "{visible}",
			selected: "{persistentSelected}",
			tooltip: "{tooltip}",
			type: sap.m.ListType.Active
		});
	};

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._createToolbar = function() {
		P13nSelectionPanel.prototype._createToolbar.apply(this, arguments);

		var oModel = this._getInternalModel();

		var oInvisibleChartTypeText = new sap.ui.core.InvisibleText({
			text: this._oRb.getText('COLUMNSPANEL_CHARTTYPE')
		});
		var oChartTypeComboBox = new sap.m.ComboBox({
			placeholder: this._oRb.getText('COLUMNSPANEL_CHARTTYPE'),
			selectedKey: {
				path: '/selectedChartTypeKey'
			},
			ariaLabelledBy: oInvisibleChartTypeText,
			items: {
				path: '/availableChartTypes',
				templateShareable: false,
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

		this._getToolbar().insertContent(oInvisibleChartTypeText, 0).insertContent(oChartTypeComboBox, 1);
	};

	P13nChartSelectionPanel.prototype._isSelectionItemEqualToModelItem = function(oSelectionItem, oModelItem) {
		return oModelItem.persistentIndex === oSelectionItem.getIndex() && oModelItem.persistentSelected === oSelectionItem.getSelected() && oModelItem.role === oSelectionItem.getRole();
	};

	/**
	 * @private
	 */
	P13nChartSelectionPanel.prototype._showAll = function() {
		jQuery.sap.log.info("ModelItems: visible tableIndex isPersistent        TableItems: current");
		jQuery.sap.log.info("--------------------------------------------------------------");
		var oData = this._getInternalModel().getData();
		var aTableItems = this._oTable.getItems();
		var iLength = Math.max(oData.items.length, this._oTable.getItems().length);
		for (var i = 0; i < iLength; i++) {
			var oModelItem = oData.items[i];
			var oTableItem = aTableItems[i];
			jQuery.sap.log.info(oModelItem.columnKey + ": " + oModelItem.visible + " " + oModelItem.tableIndex + " " + oModelItem.persistentSelected + "_" + oModelItem.persistentIndex + ";    " + oTableItem.getId() + " " + oTableItem.getCells()[0].getText() + ": " + oTableItem.getSelected() + " " + oTableItem.getCells()[1].getText());
		}
	};

	return P13nChartSelectionPanel;

}, /* bExport= */true);
