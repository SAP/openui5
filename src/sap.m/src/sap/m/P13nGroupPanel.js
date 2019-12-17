/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nGroupPanel.
sap.ui.define([
	'./library',
	'./P13nConditionPanel',
	'./P13nPanel',
	'./P13nGroupItem',
	"sap/ui/thirdparty/jquery"
], function(library, P13nConditionPanel, P13nPanel, P13nGroupItem, jQuery) {
	"use strict";

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = library.P13nPanelType;

	// shortcut for sap.m.P13nConditionOperation TODO: use enum in library.js or official API
	var P13nConditionOperation = library.P13nConditionOperation;

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
	 * @since 1.26.0
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
				 */
				maxGroups: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * Defines if <code>mediaQuery</code> or <code>ContainerResize</code> is used for a layout update. If <code>ConditionPanel</code>
				 * is used in a dialog, the property must be set to true.
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
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
				 */
				addGroupItem: {
					parameters: {}
				},

				/**
				 * Event raised if a <code>GroupItem</code> has been removed.
				 */
				removeGroupItem: {},

				/**
				 * Event raised if a <code>GroupItem</code> has been updated.
				 */
				updateGroupItem: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("section", oControl);
				oRm.class("sapMGroupPanel");
				oRm.openEnd();

				oRm.openStart("div");
				oRm.class("sapMGroupPanelContent");
				oRm.class("sapMGroupPanelBG");
				oRm.openEnd();

				oControl.getAggregation("content").forEach(function(oChildren){
					oRm.renderControl(oChildren);
				});

				oRm.close("div");
				oRm.close("section");
			}
		}
	});

	P13nGroupPanel.prototype.setMaxGroups = function(sMax) {
		this.setProperty("maxGroups", sMax);

		if (this._oGroupPanel) {
			this._oGroupPanel.setMaxConditions(sMax);
		}
		return this;
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
		return this;
	};

	P13nGroupPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oGroupPanel.setLayoutMode(sMode);
		return this;
	};

	/**
	 * Checks if the entered or modified conditions are correct, marks invalid fields yellow (Warning) and opens a popup message dialog to let the
	 * user know that some values are not correct or missing.
	 *
	 * @public
	 * @returns {boolean} <code>True</code> if all conditions are valid, <code>false</code> otherwise.
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
	 * @param {array} aOperations array of operations <code>[sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]</code>
	 */
	P13nGroupPanel.prototype.setOperations = function(aOperation) {
		this._aOperations = aOperation;

		if (this._oGroupPanel) {
			this._oGroupPanel.setOperations(this._aOperations);
		}
	};

	P13nGroupPanel.prototype.init = function() {
		this.setType(P13nPanelType.group);
		this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("GROUPPANEL_TITLE"));

		sap.ui.getCore().loadLibrary("sap.ui.layout");

		this._aKeyFields = [];

		if (!this._aOperations) {
			this.setOperations([
				P13nConditionOperation.GroupAscending, P13nConditionOperation.GroupDescending
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
		this._oGroupPanel._sAddRemoveIconTooltipKey = "GROUP";

		this.addAggregation("content", this._oGroupPanel);
	};

	P13nGroupPanel.prototype.exit = function() {

		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};

		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aOperations = destroyHelper(this._aOperations);
	};

	P13nGroupPanel.prototype.onBeforeRendering = function() {
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
			this._oGroupPanel.setKeyFields(aKeyFields);

			var aConditions = [];
			sModelName = (this.getBindingInfo("groupItems") || {}).model;
			this.getGroupItems().forEach(function(oGroupItem_) {
				// the "groupItems" aggregation data - obtained via getGroupItems() - has the old state !
				var oContext = oGroupItem_.getBindingContext(sModelName);
				// Update key of model (in case of 'restore' the key in model gets lost because it is overwritten by Restore Snapshot)
				if (oGroupItem_.getBinding("key")) {
					oContext.getObject()[oGroupItem_.getBinding("key").getPath()] = oGroupItem_.getKey();
				}
				aConditions.push({
					key: oGroupItem_.getKey(),
					keyField: fGetValueOfProperty("columnKey", oContext, oGroupItem_),
					operation: fGetValueOfProperty("operation", oContext, oGroupItem_),
					showIfGrouped: fGetValueOfProperty("showIfGrouped", oContext, oGroupItem_)
				});
			});
			this._oGroupPanel.setConditions(aConditions);
		}
	};

	P13nGroupPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nGroupPanel.prototype.removeItem = function(oItem) {
		var oRemoved = P13nPanel.prototype.removeItem.apply(this, arguments);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return oRemoved;
	};

	P13nGroupPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nGroupPanel.prototype.addGroupItem = function(oGroupItem) {
		this.addAggregation("groupItems", oGroupItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nGroupPanel.prototype.insertGroupItem = function(oGroupItem, iIndex) {
		this.insertAggregation("groupItems", oGroupItem, iIndex, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nGroupPanel.prototype.updateGroupItems = function(sReason) {
		this.updateAggregation("groupItems");

        if (sReason === "change" && !this._bIgnoreBindCalls) {
            this._bUpdateRequired = true;
            this.invalidate();
        }
	};

	P13nGroupPanel.prototype.removeGroupItem = function(oGroupItem) {
		oGroupItem = this.removeAggregation("groupItems", oGroupItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return oGroupItem;
	};

	P13nGroupPanel.prototype.removeAllGroupItems = function() {
		var aGroupItems = this.removeAllAggregation("groupItems", true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return aGroupItems;
	};

	P13nGroupPanel.prototype.destroyGroupItems = function() {
		this.destroyAggregation("groupItems");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
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
			var oGroupItem;

			if (sOperation === "update") {
				oGroupItem = that.getGroupItems()[iIndex];
				if (oGroupItem) {
					oGroupItem.setColumnKey(oNewData.keyField);
					oGroupItem.setOperation(oNewData.operation);
					oGroupItem.setShowIfGrouped(oNewData.showIfGrouped);
				}
				that.fireUpdateGroupItem({
					key: sKey,
					index: iIndex,
					groupItemData: oGroupItem
				});
				that._notifyChange();
			}
			if (sOperation === "add") {
				oGroupItem = new P13nGroupItem({
					key: sKey,
					columnKey: oNewData.keyField,
					operation: oNewData.operation,
					showIfGrouped: oNewData.showIfGrouped
				});
				that._bIgnoreBindCalls = true;
				that.fireAddGroupItem({
					key: sKey,
					index: iIndex,
					groupItemData: oGroupItem
				});
				that._bIgnoreBindCalls = false;
				that._notifyChange();
			}
			if (sOperation === "remove") {
				that._bIgnoreBindCalls = true;
				that.fireRemoveGroupItem({
					key: sKey,
					index: iIndex
				});
				that._bIgnoreBindCalls = false;
				that._notifyChange();
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
		return this;
	};

	P13nGroupPanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	return P13nGroupPanel;

});