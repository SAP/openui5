/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nSortPanel.
sap.ui.define([
	'jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'
], function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nSortPanel.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nSortPanel control is used to define settings for sorting in table personalization.
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.m.P13nSortPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nSortPanel = P13nPanel.extend("sap.m.P13nSortPanel", /** @lends sap.m.P13nSortPanel.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * defines if the mediaQuery or a ContainerResize will be used for layout update. When the ConditionPanel is used on a dialog the
				 * property should be set to true!
				 * 
				 * @since 1.26
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
				 * or"Phone" you can set a fixed layout.
				 * 
				 * @since 1.26
				 */
				layoutMode: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			aggregations: {

				/**
				 * content for include and exclude panels
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				},

				/**
				 * defined Sort Items
				 * 
				 * @since 1.26
				 */
				sortItems: {
					type: "sap.m.P13nSortItem",
					multiple: true,
					singularName: "sortItem",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * event raised when a SortItem was added
				 * 
				 * @since 1.26
				 */
				addSortItem: {},

				/**
				 * remove a sort item
				 * 
				 * @since 1.26
				 */
				removeSortItem: {},

				/**
				 * update a sort item
				 * 
				 * @since 1.26
				 */
				updateSortItem: {}
			}
		}
	});

	/**
	 * returns the array of conditions.
	 * 
	 * @private
	 */
	P13nSortPanel.prototype._getConditions = function() {
		return this._oSortPanel.getConditions();
	};

	P13nSortPanel.prototype.setContainerQuery = function(b) {
		this.setProperty("containerQuery", b);

		this._oSortPanel.setContainerQuery(b);
	};

	P13nSortPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oSortPanel.setLayoutMode(sMode);
	};

	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and opens a popup message dialog to give the
	 * user the feedback that some values are wrong or missing.
	 * 
	 * @public
	 * @since 1.26
	 */
	P13nSortPanel.prototype.validateConditions = function() {
		return this._oSortPanel.validateConditions();
	};

	/**
	 * removes all invalid sort conditions.
	 * 
	 * @public
	 * @since 1.28
	 */
	P13nSortPanel.prototype.removeInvalidConditions = function() {
		this._oSortPanel.removeInvalidConditions();
	};

	/**
	 * removes all errors/warning states from of all sort conditions.
	 * 
	 * @public
	 * @since 1.28
	 */
	P13nSortPanel.prototype.removeValidationErrors = function() {
		this._oSortPanel.removeValidationErrors();
	};

	P13nSortPanel.prototype.onBeforeNavigationFrom = function() {
		return this.validateConditions();
	};

	P13nSortPanel.prototype.onAfterNavigationFrom = function() {
		return this.removeInvalidConditions();
	};

	/**
	 * setter for the supported operations array
	 * 
	 * @public
	 * @since 1.26
	 * @param {array} array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nSortPanel.prototype.setOperations = function(aOperation) {
		this._aOperations = aOperation;

		if (this._oSortPanel) {
			this._oSortPanel.setOperations(this._aOperations);
		}
	};

	/**
	 * Initialize the control
	 * 
	 * @private
	 */
	P13nSortPanel.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		jQuery.sap.require("sap.ui.layout.Grid");

		sap.ui.layout.Grid.prototype.init.apply(this);

		this._aKeyFields = [];
		this.addStyleClass("sapMSortPanel");

		if (!this._aOperations) {
			this.setOperations([
				sap.m.P13nConditionOperation.Ascending, sap.m.P13nConditionOperation.Descending
			]);
		}

		this._oSortPanel = new P13nConditionPanel({
			autoReduceKeyFieldItems: true,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oSortPanel.setOperations(this._aOperations);

		this.addAggregation("content", this._oSortPanel);
	};

	P13nSortPanel.prototype.exit = function() {

		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};

		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aOperations = destroyHelper(this._aOperations);
	};

	P13nSortPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		var oKeyField = {
			key: oItem.getColumnKey(),
			text: oItem.getText(),
			tooltip: oItem.getTooltip()
		};

		this._aKeyFields.push(oKeyField);

		if (this._oSortPanel) {
			this._oSortPanel.addKeyField(oKeyField);
		}
	};

	P13nSortPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");
		if (this._oSortPanel) {
			this._oSortPanel.removeAllKeyFields();
		}
		return this;
	};

	P13nSortPanel.prototype.addSortItem = function(oSortItem) {
		this.addAggregation("sortItems", oSortItem);

		if (!this._bIgnoreBindCalls) {
			var aConditions = [];
			this.getSortItems().forEach(function(oSortItem_) {
				aConditions.push({
					key: oSortItem_.getKey(),
					keyField: oSortItem_.getColumnKey(),
					operation: oSortItem_.getOperation()
				});
			});
			this._oSortPanel.setConditions(aConditions);
		}
	};

	P13nSortPanel.prototype.insertSortItem = function(oSortItem) {
		this.insertAggregation("sortItems", oSortItem);
		// TODO: implement this
		return this;
	};

	P13nSortPanel.prototype.updateSortItems = function(sReason) {
		this.updateAggregation("sortItems");

		if (sReason !== "change") {
			return;
		}
		if (!this._bIgnoreBindCalls) {
			var aConditions = [];
			this.getSortItems().forEach(function(oSortItem_) {
				// Note: current implementation assumes that the length of sortItems aggregation is equal
				// to the number of corresponding model items.
				// Currently the model data is up-to-date so we need to resort to the Binding Context;
				// the "sortItems" aggregation data - obtained via getSortItems() - has the old state !
				var oContext = oSortItem_.getBindingContext();
				var oModelItem = oContext.getObject();
				aConditions.push({
					key: oSortItem_.getKey(),
					keyField: oModelItem.columnKey,
					operation: oModelItem.operation
				});
			});
			this._oSortPanel.setConditions(aConditions);
		}
	};

	P13nSortPanel.prototype.removeSortItem = function(oSortItem) {
		oSortItem = this.removeAggregation("sortItems", oSortItem);

		return oSortItem;
	};

	P13nSortPanel.prototype.removeAllSortItems = function() {
		var aSortItems = this.removeAllAggregation("sortItems");

		this._oSortPanel.setConditions([]);

		return aSortItems;
	};

	P13nSortPanel.prototype.destroySortItems = function() {
		this.destroyAggregation("sortItems");

		if (!this._bIgnoreBindCalls) {
			this._oSortPanel.setConditions([]);
		}

		return this;
	};

	P13nSortPanel.prototype._handleDataChange = function() {
		var that = this;

		return function(oEvent) {
			var oNewData = oEvent.getParameter("newData");
			var sOperation = oEvent.getParameter("operation");
			var sKey = oEvent.getParameter("key");
			var iIndex = oEvent.getParameter("index");

			var oSortItemData = null;
			if (oNewData) {
				var oSortItemData = new sap.m.P13nSortItem({
					key: sKey,
					columnKey: oNewData.keyField,
					operation: oNewData.operation
				});
			}

			if (sOperation === "update") {
				var oSortItem = that.getSortItems()[iIndex];
				if (oSortItem) {
					oSortItem.setColumnKey(oNewData.keyField);
					oSortItem.setOperation(oNewData.operation);
				}
				that.fireUpdateSortItem({
					key: sKey,
					index: iIndex,
					sortItemData: oSortItemData
				});
			}
			if (sOperation === "add") {
				that._bIgnoreBindCalls = true;
				that.fireAddSortItem({
					key: sKey,
					index: iIndex,
					sortItemData: oSortItemData
				});
				that._bIgnoreBindCalls = false;
			}
			if (sOperation === "remove") {
				that.fireRemoveSortItem({
					key: sKey,
					index: iIndex
				});
			}
		};
	};

	return P13nSortPanel;

}, /* bExport= */true);
