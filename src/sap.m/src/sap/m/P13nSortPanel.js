/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nSortPanel.
sap.ui.define([
	'./library',
	'./P13nConditionPanel',
	'./P13nPanel',
	'./P13nSortItem'
], function(library, P13nConditionPanel, P13nPanel, P13nSortItem) {
	"use strict";

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = library.P13nPanelType;

	// shortcut for sap.m.P13nConditionOperation TODO: use enum in library.js or official API
	var P13nConditionOperation = library.P13nConditionOperation;

	/**
	 * Constructor for a new P13nSortPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nSortPanel control is used to define settings for sorting in table personalization.
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
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
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
				 * or "Phone" you can set a fixed layout.
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
				 */
				addSortItem: {},

				/**
				 * event raised when a SortItem was removed
				 */
				removeSortItem: {},

				/**
				 * event raised when a SortItem was updated
				 */
				updateSortItem: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("section", oControl);
				oRm.class("sapMSortPanel");
				oRm.openEnd();

				oRm.openStart("div");
				oRm.class("sapMSortPanelContent");
				oRm.class("sapMSortPanelBG");
				oRm.openEnd();

				oControl.getAggregation("content").forEach(function(oChildren){
					oRm.renderControl(oChildren);
				});

				oRm.close("div");
				oRm.close("section");
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
		return this;
	};

	P13nSortPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oSortPanel.setLayoutMode(sMode);
		return this;
	};

	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and opens a popup message dialog to give the
	 * user the feedback that some values are wrong or missing.
	 *
	 * @public
	 * @returns {boolean} <code>True</code> if all conditions are valid, <code>false</code> otherwise.
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
	 * @param {array} aOperations - array of operations <code>[sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]</code>
	 * @returns {sap.m.P13nSortPanel} this for chaining
	 */
	P13nSortPanel.prototype.setOperations = function(aOperations) {
		this._aOperations = aOperations;

		if (this._oSortPanel) {
			this._oSortPanel.setOperations(this._aOperations);
		}
		return this;
	};

	/**
	 * Initialize the control
	 *
	 * @private
	 */
	P13nSortPanel.prototype.init = function() {
		this.setType(P13nPanelType.sort);
		this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SORTPANEL_TITLE"));

		sap.ui.getCore().loadLibrary("sap.ui.layout");

		this._aKeyFields = [];

		if (!this._aOperations) {
			this.setOperations([
				P13nConditionOperation.Ascending, P13nConditionOperation.Descending
			]);
		}

		this._oSortPanel = new P13nConditionPanel({
			autoReduceKeyFieldItems: true,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oSortPanel.setOperations(this._aOperations);
		this._oSortPanel._sAddRemoveIconTooltipKey = "SORT";

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

	P13nSortPanel.prototype.onBeforeRendering = function() {
		// P13nPanel.prototype.onBeforeRendering.apply(this, arguments); does not exist!!!!

		if (this._bUpdateRequired) {
			this._bUpdateRequired = false;

			var aKeyFields = [];
			var sModelName = (this.getBindingInfo("items") || {}).model;
			var fGetValueOfProperty = function(sName, oContext, oItem) {
				var oBinding = oItem.getBinding(sName);
				if (oBinding && oContext) {
					return oContext.getObject()[oBinding.getPath()];
				}
				return oItem.getMetadata().getProperty(sName) ? oItem.getProperty(sName) : oItem.getAggregation(sName);
			};
			this.getItems().forEach(function(oItem_) {
				var oContext = oItem_.getBindingContext(sModelName);
				// Update key of model (in case of 'restore' the key in model gets lost because it is overwritten by Restore Snapshot)
				if (oItem_.getBinding("key")) {
					oContext.getObject()[oItem_.getBinding("key").getPath()] = oItem_.getKey();
				}
				aKeyFields.push({
					key: oItem_.getColumnKey(),
					text: fGetValueOfProperty("text", oContext, oItem_),
					tooltip: fGetValueOfProperty("tooltip", oContext, oItem_)
				});
			});
			aKeyFields.splice(0, 0, {
				key: null,
				text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_SELECTION_NONE")
			});
			this._oSortPanel.setKeyFields(aKeyFields);

			var aConditions = [];
			sModelName = (this.getBindingInfo("sortItems") || {}).model;
			this.getSortItems().forEach(function(oSortItem_) {
				// the "sortItems" aggregation data - obtained via getSortItems() - has the old state !
				var oContext = oSortItem_.getBindingContext(sModelName);
				// Update key of model (in case of 'restore' the key in model gets lost because it is overwritten by Restore Snapshot)
				if (oSortItem_.getBinding("key")) {
					oContext.getObject()[oSortItem_.getBinding("key").getPath()] = oSortItem_.getKey();
				}
				aConditions.push({
					key: oSortItem_.getKey(),
					keyField: fGetValueOfProperty("columnKey", oContext, oSortItem_),
					operation: fGetValueOfProperty("operation", oContext, oSortItem_)
				});
			});
			this._oSortPanel.setConditions(aConditions);
		}
	};

	P13nSortPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nSortPanel.prototype.removeItem = function(oItem) {
		var oRemove = P13nPanel.prototype.removeItem.apply(this, arguments);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return oRemove;
	};

	P13nSortPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nSortPanel.prototype.addSortItem = function(oSortItem) {
		this.addAggregation("sortItems", oSortItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nSortPanel.prototype.insertSortItem = function(oSortItem, iIndex) {
		this.insertAggregation("sortItems", oSortItem, iIndex, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nSortPanel.prototype.updateSortItems = function(sReason) {
		this.updateAggregation("sortItems");

		if (sReason === "change" && !this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
            this.invalidate();
		}
	};

	P13nSortPanel.prototype.removeSortItem = function(oSortItem) {
		oSortItem = this.removeAggregation("sortItems", oSortItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return oSortItem;
	};

	P13nSortPanel.prototype.removeAllSortItems = function() {
		var aSortItems = this.removeAllAggregation("sortItems", true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return aSortItems;
	};

	P13nSortPanel.prototype.destroySortItems = function() {
		this.destroyAggregation("sortItems");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
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
			var oSortItem;

			if (sOperation === "update") {
				oSortItem = that.getSortItems()[iIndex];
				if (oSortItem) {
					oSortItem.setColumnKey(oNewData.keyField);
					oSortItem.setOperation(oNewData.operation);
				}
				that.fireUpdateSortItem({
					key: sKey,
					index: iIndex,
					sortItemData: oSortItem
				});
				that._notifyChange();
			}
			if (sOperation === "add") {
				oSortItem = new P13nSortItem({
					key: sKey,
					columnKey: oNewData.keyField,
					operation: oNewData.operation
				});
				that._bIgnoreBindCalls = true;
				that.fireAddSortItem({
					key: sKey,
					index: iIndex,
					sortItemData: oSortItem
				});
				that._bIgnoreBindCalls = false;
				that._notifyChange();
			}
			if (sOperation === "remove") {
				that._bIgnoreBindCalls = true;
				that.fireRemoveSortItem({
					key: sKey,
					index: iIndex
				});
				that._bIgnoreBindCalls = false;
				that._notifyChange();
			}
		};
	};

	P13nSortPanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	return P13nSortPanel;

});
