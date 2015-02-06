/*!
 * ${copyright}
 */

// Provides control sap.m.P13nGroupPanel.
sap.ui.define([
	'jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'
], function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nGroupPanel.
	 * 
	 * @param {string}
	 *            [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *            [mSettings] initial settings for the new control
	 * 
	 * @class The GroupPanel Control can be used to...
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * 
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
				 * defines the max number of groups.
				 * @since 1.26
				 */
				maxGroups: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * defines if the mediaQuery or a ContainerResize will be used for layout update. When the
				 * ConditionPanel is used on a dialog the property should be set to true!
				 * @since 1.26
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically change the
				 * layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
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
				 * defined group Items
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
				 * event raised when a GroupItem was added
				 * @since 1.26
				 */
				addGroupItem: {
					parameters: {}
				},

				/**
				 * remove a group item
				 * @since 1.26
				 */
				removeGroupItem: {},

				/**								 
				 * update a group item
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
	 * returns the array of conditions.
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
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and
	 * opens a popup message dialog to give the user the feedback that some values are wrong or missing.
	 * 
	 * @public
	 * @since 1.26
	 */
	P13nGroupPanel.prototype.validateConditions = function() {
		return this._oGroupPanel.validateConditions();
	};

	/**
	 * removes all invalid Group conditions.					 
	 *  
	 * @public
	 * @since 1.28
	 */
	P13nGroupPanel.prototype.removeInvalidConditions = function() {
		this._oGroupPanel.removeInvalidConditions();
	};

	/**
	 * removes all errors/warning states from of all group conditions.
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
	 * setter for the supported operations array
	 * 
	 * @public
	 * @since 1.26
	 * @param {array}
	 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
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
			dataChange: this._handleDataChange()
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
		//TODO: implement this
		return this;
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

	return P13nGroupPanel;

}, /* bExport= */true);
