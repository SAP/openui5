/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nGroupPanel.
sap.ui.define([
	'jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'
], function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nGroupPanel.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nGroupPanel control is used to define group-specific settings for table personalization.
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.m.P13nGroupPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nGroupPanel = P13nPanel.extend("sap.m.P13nGroupPanel", /** @lends sap.m.P13nGroupPanel.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Defines the maximum number of groups.
				 * 
				 * @since 1.26
				 */
				maxGroups: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * Defines if <code>mediaQuery</code> or <code>ContainerResize</code> is used for a layout update. If <code>ConditionPanel</code>
				 * is used in a dialog, the property must be set to true.
				 * 
				 * @since 1.26
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
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
				 * Contains content for include and exclude panels.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				},

				/**
				 * Defined group items.
				 * 
				 * @since 1.26
				 */
				groupItems: {
					type: "sap.m.P13nGroupItem",
					multiple: true,
					singularName: "groupItem",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * Event raised if a <code>GroupItem</code> has been added.
				 * 
				 * @since 1.26
				 */
				addGroupItem: {
					parameters: {}
				},

				/**
				 * Removes a group item.
				 * 
				 * @since 1.26
				 */
				removeGroupItem: {},

				/**
				 * Updates a group item.
				 * 
				 * @since 1.26
				 */
				updateGroupItem: {}
			}
		}
	});

	P13nGroupPanel.prototype.setMaxGroups = function(sMax) {
		this.setProperty("maxGroups", sMax);

		if (this._oGroupPanel) {
			this._oGroupPanel.setMaxConditions(sMax);
		}
	};

	/**
	 * Returns the array of conditions.
	 * 
	 * @private
	 */
	P13nGroupPanel.prototype._getConditions = function() {
		return this._oGroupPanel.getConditions();
	};

	P13nGroupPanel.prototype.setContainerQuery = function(b) {
		this.setProperty("containerQuery", b);

		this._oGroupPanel.setContainerQuery(b);
	};

	P13nGroupPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oGroupPanel.setLayoutMode(sMode);
	};

	/**
	 * Checks if the entered or modified conditions are correct, marks invalid fields yellow (Warning) and opens a popup message dialog to let the
	 * user know that some values are not correct or missing.
	 * 
	 * @public
	 * @since 1.26
	 */
	P13nGroupPanel.prototype.validateConditions = function() {
		return this._oGroupPanel.validateConditions();
	};

	/**
	 * Removes all invalid group conditions.
	 * 
	 * @public
	 * @since 1.28
	 */
	P13nGroupPanel.prototype.removeInvalidConditions = function() {
		this._oGroupPanel.removeInvalidConditions();
	};

	/**
	 * Removes all errors/warning states from of all group conditions.
	 * 
	 * @public
	 * @since 1.28
	 */
	P13nGroupPanel.prototype.removeValidationErrors = function() {
		this._oGroupPanel.removeValidationErrors();
	};

	P13nGroupPanel.prototype.onBeforeNavigationFrom = function() {
		return this.validateConditions();
	};

	P13nGroupPanel.prototype.onAfterNavigationFrom = function() {
		return this.removeInvalidConditions();
	};

	/**
	 * Setter for the supported operations array.
	 * 
	 * @public
	 * @since 1.26
	 * @param {array} array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nGroupPanel.prototype.setOperations = function(aOperation) {
		this._aOperations = aOperation;

		if (this._oGroupPanel) {
			this._oGroupPanel.setOperations(this._aOperations);
		}
	};

	/**
	 * Initialize the control
	 * 
	 * @private
	 */
	P13nGroupPanel.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		jQuery.sap.require("sap.ui.layout.Grid");

		sap.ui.layout.Grid.prototype.init.apply(this);

		this._aKeyFields = [];
		this.addStyleClass("sapMGroupPanel");

		if (!this._aOperations) {
			this.setOperations([
				sap.m.P13nConditionOperation.GroupAscending, sap.m.P13nConditionOperation.GroupDescending
			]);
		}

		this._oGroupPanel = new P13nConditionPanel({
			maxConditions: this.getMaxGroups(),
			autoReduceKeyFieldItems: true,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange(),
			validationExecutor: jQuery.proxy(this._callValidationExecutor, this)
		});
		this._oGroupPanel.setOperations(this._aOperations);

		this.addAggregation("content", this._oGroupPanel);
	};

	P13nGroupPanel.prototype.exit = function() {
		this._aKeyFields = null;
		this._aOperations = null;
	};

	P13nGroupPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		var oKeyField = {
			key: oItem.getColumnKey(),
			text: oItem.getText(),
			tooltip: oItem.getTooltip()
		};

		this._aKeyFields.push(oKeyField);

		if (this._oGroupPanel) {
			this._oGroupPanel.addKeyField(oKeyField);
		}
	};

	// TODO ER:fast implementation, please check!
	P13nGroupPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");
		if (this._oGroupPanel) {
			this._oGroupPanel.removeAllKeyFields();
		}
		return this;
	};

	P13nGroupPanel.prototype.addGroupItem = function(oGroupItem) {
		this.addAggregation("groupItems", oGroupItem);

		var aConditions = [];

		this.getGroupItems().forEach(function(oGroupItem_) {
			aConditions.push({
				key: oGroupItem_.getKey(),
				keyField: oGroupItem_.getColumnKey(),
				operation: oGroupItem_.getOperation(),
				showIfGrouped: oGroupItem_.getShowIfGrouped()
			});
		});

		if (!this._bIgnoreBindCalls) {
			this._oGroupPanel.setConditions(aConditions);
		}
	};

	P13nGroupPanel.prototype.insertGroupItem = function(oGroupItem) {
		this.insertAggregation("groupItems", oGroupItem);
		// TODO: implement this
		return this;
	};

	P13nGroupPanel.prototype.updateGroupItems = function(sReason) {
		this.updateAggregation("groupItems");

		if (sReason !== "change") {
			return;
		}
		if (!this._bIgnoreBindCalls) {
			var aConditions = [];
			this.getGroupItems().forEach(function(oGroupItem_) {
				// Note: current implementation assumes that the length of sortItems aggregation is equal
				// to the number of corresponding model items.
				// Currently the model data is up-to-date so we need to resort to the Binding Context;
				// the "groupItems" aggregation data - obtained via getGroupItems() - has the old state !
				var oContext = oGroupItem_.getBindingContext();
				var oModelItem = oContext.getObject();
				aConditions.push({
					key: oGroupItem_.getKey(),
					keyField: oModelItem.columnKey,
					operation: oModelItem.operation,
					showIfGrouped: oModelItem.showIfGrouped
				});
			});
			this._oGroupPanel.setConditions(aConditions);
		}
	};

	P13nGroupPanel.prototype.removeGroupItem = function(oGroupItem) {
		oGroupItem = this.removeAggregation("groupItems", oGroupItem);

		return oGroupItem;
	};

	P13nGroupPanel.prototype.removeAllGroupItems = function() {
		var aGroupItems = this.removeAllAggregation("groupItems");

		this._oGroupPanel.setConditions([]);

		return aGroupItems;
	};

	P13nGroupPanel.prototype.destroyGroupItems = function() {
		this.destroyAggregation("groupItems");

		if (!this._bIgnoreBindCalls) {
			this._oGroupPanel.setConditions([]);
		}

		return this;
	};

	P13nGroupPanel.prototype._handleDataChange = function() {
		var that = this;

		return function(oEvent) {
			var oNewData = oEvent.getParameter("newData");
			var sOperation = oEvent.getParameter("operation");
			var sKey = oEvent.getParameter("key");
			var iIndex = oEvent.getParameter("index");

			var oGroupItemData = null;
			if (oNewData) {
				oGroupItemData = new sap.m.P13nGroupItem({
					key: sKey,
					columnKey: oNewData.keyField,
					operation: oNewData.operation,
					showIfGrouped: oNewData.showIfGrouped
				});
			}

			if (sOperation === "update") {
				var oGroupItem = that.getGroupItems()[iIndex];
				if (oGroupItem) {
					oGroupItem.setColumnKey(oNewData.keyField);
					oGroupItem.setOperation(oNewData.operation);
					oGroupItem.setShowIfGrouped(oNewData.showIfGrouped);
				}
				that.fireUpdateGroupItem({
					key: sKey,
					index: iIndex,
					groupItemData: oGroupItemData
				});
			}
			if (sOperation === "add") {
				that._bIgnoreBindCalls = true;
				that.fireAddGroupItem({
					key: sKey,
					index: iIndex,
					groupItemData: oGroupItemData
				});
				that._bIgnoreBindCalls = false;
			}
			if (sOperation === "remove") {
				that.fireRemoveGroupItem({
					key: sKey,
					index: iIndex
				});
			}
		};
	};

	P13nGroupPanel.prototype.getOkPayload = function() {
		if (!this.getModel()) {
			return null;
		}
		var aSelectedColumnKeys = [];
		// Create an up-to-date payload
		this._oGroupPanel._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			var oComboBox = oConditionGrid.keyField;
			aSelectedColumnKeys.push(oComboBox.getSelectedKey());
		});
		return {
			selectedColumnKeys: aSelectedColumnKeys
		};
	};

	P13nGroupPanel.prototype._callValidationExecutor = function() {
		var fValidate = this.getValidationExecutor();
		if (fValidate) {
			fValidate();
		}
	};

	P13nGroupPanel.prototype._updateValidationResult = function(aValidationResult) {
		this._oGroupPanel._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			var oComboBox = oConditionGrid.keyField;
			// Clear Value State
			oComboBox.setValueStateText("");
			oComboBox.setValueState("None");
			// Set new Value State according to validated result
			var sColumnKey = oComboBox.getSelectedKey();
			aValidationResult.forEach(function(oResult) {
				if (oResult.columnKey === sColumnKey) {
					oComboBox.setValueStateText(oResult.messageText);
					oComboBox.setValueState(oResult.messageType);
				}
			});
		});
	};

	P13nGroupPanel.prototype.setValidationListener = function(fListener) {
		// Register P13nGroupPanel as a validation listener. It means after every validation P13nGroupPanel will be notified about the validation
		// result.
		this.setProperty("validationListener", fListener);
		if (fListener) {
			fListener(this, jQuery.proxy(this._updateValidationResult, this));
		}
	};

	return P13nGroupPanel;

}, /* bExport= */true);
