/*!
 * ${copyright}
 */

// Provides control sap.m.P13nFilterPanel.
sap.ui.define([
	'jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'
], function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nFilterPanel.
	 * 
	 * @param {string}
	 *            [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *            [mSettings] initial settings for the new control
	 * 
	 * @class The FilterPanel Control can be used to...
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * 
	 * @constructor
	 * @public
	 * @alias sap.m.P13nFilterPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime
	 *                metamodel
	 */
	var P13nFilterPanel = P13nPanel.extend("sap.m.P13nFilterPanel", /** @lends sap.m.P13nFilterPanel.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * defines the max number of include filter.
				 * @since 1.26
				 */
				maxIncludes: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * defines the max number of exclude filter
				 * @since 1.26
				 */
				maxExcludes: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * defines if the mediaQuery or a ContainerResize will be used for layout update. When
				 * the ConditionPanel is used on a dialog the property should be set to true!
				 * @since 1.26
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically
				 * change the layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
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
				 * defined Filter Items
				 * @since 1.26
				 */
				filterItems: {
					type: "sap.m.P13nFilterItem",
					multiple: true,
					singularName: "filterItem",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * event raised when a filterItem was added
				 * @since 1.26
				 */
				addFilterItem: {},

				/**
				 * remove a filter item
				 * @since 1.26
				 */
				removeFilterItem: {},

				/**								 
				 * update a filter item
				 * @since 1.26
				 */
				updateFilterItem: {}
			}
		}
	});

	// EXC_ALL_CLOSURE_003

	/**
	 * sets the array of conditions.
	 * 
	 * @public
	 * @since 1.26
	 * @param {object[]}
	 *            aConditions the complete list of conditions
	 */
	P13nFilterPanel.prototype.setConditions = function(aConditions) {
		var aIConditions = [];
		var aEConditions = [];

		if (aConditions.length) {
			for (var i = 0; i < aConditions.length; i++) {
				var oConditionData = aConditions[i];
				if (!oConditionData.exclude) {
					aIConditions.push(oConditionData);
				} else {
					aEConditions.push(oConditionData);
				}
			}
		}

		this._oIncludeFilterPanel.setConditions(aIConditions);
		this._oExcludeFilterPanel.setConditions(aEConditions);
		if (aEConditions.length > 0) {
			this._oExcludePanel.setExpanded(true);
		}
	};

	/**
	 * add a new condition object 
	 * 
	 * @private
	 * @param {object}
	 *            oCondition the new condition
	 */
	P13nFilterPanel.prototype._addCondition = function(oCondition) {
		if (!oCondition.exclude) {
			this._oIncludeFilterPanel.addCondition(oCondition);
		} else {
			this._oExcludeFilterPanel.addCondition(oCondition);
		}

		if (this._oExcludeFilterPanel.getConditions().length > 0) {
			this._oExcludePanel.setExpanded(true);
		}
	};

	/**
	 * returns the array of conditions.
	 * 
	 * @public
	 * @since 1.26
	 */
	P13nFilterPanel.prototype.getConditions = function() {
		var aIConditions = this._oIncludeFilterPanel.getConditions();
		var aEConditions = this._oExcludeFilterPanel.getConditions();

		return aIConditions.concat(aEConditions);
	};

	P13nFilterPanel.prototype.setContainerQuery = function(bContainerQuery) {
		this.setProperty("containerQuery", bContainerQuery);

		this._oIncludeFilterPanel.setContainerQuery(bContainerQuery);
		this._oExcludeFilterPanel.setContainerQuery(bContainerQuery);
	};

	P13nFilterPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oIncludeFilterPanel.setLayoutMode(sMode);
		this._oExcludeFilterPanel.setLayoutMode(sMode);
	};

	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state)
	 * 
	 * @public
	 * @since 1.26
	 * @returns {boolean}
	 * 			false, if there is an invalid condition 
	 */
	P13nFilterPanel.prototype.validateConditions = function() {
		return this._oIncludeFilterPanel.validateConditions() && this._oExcludeFilterPanel.validateConditions();
	};

	/**
	 * removes all invalid conditions.					 
	 *  
	 * @public
	 * @since 1.28
	 */
	P13nFilterPanel.prototype.removeInvalidConditions = function() {
		this._oIncludeFilterPanel.removeInvalidConditions();
		this._oExcludeFilterPanel.removeInvalidConditions();
	};

	/**
	 * removes all errors/warning states from of all filter conditions.
	 * 
	 * @public
	 * @since 1.28
	 */
	P13nFilterPanel.prototype.removeValidationErrors = function() {
		this._oIncludeFilterPanel.removeValidationErrors();
		this._oExcludeFilterPanel.removeValidationErrors();
	};

	P13nFilterPanel.prototype.onBeforeNavigationFrom = function() {
		return this.validateConditions();
	};

	P13nFilterPanel.prototype.onAfterNavigationFrom = function() {
		return this.removeInvalidConditions();
	};

	/**
	 * setter for the supported Include operations array
	 * 
	 * @public
	 * @since 1.26
	 * @param {array}
	 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.setIncludeOperations = function(aOperation) {
		this._aIncludeOperations = aOperation;

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setOperations(this._aIncludeOperations);
		}
	};

	/**
	 * getter for the Include operations 
	 * 
	 * @public
	 * @since 1.26
	 * @returns {array}
	 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.getIncludeOperations = function() {
		if (this._oIncludeFilterPanel) {
			return this._oIncludeFilterPanel.getOperations();
		}
	};

	/**
	 * setter for the supported Exclude operations array
	 * 
	 * @public
	 * @since 1.26
	 * @param {array}
	 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.setExcludeOperations = function(aOperation) {
		this._aExcludeOperations = aOperation;

		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setOperations(this._aExcludeOperations);
		}
	};

	/**
	 * getter for the Exclude operations 
	 * 
	 * @public
	 * @since 1.26
	 * @returns {array}
	 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.getExcludeOperations = function() {
		if (this._oExcludeFilterPanel) {
			return this._oExcludeFilterPanel.getOperations();
		}
	};

	/**
	 * setter for a KeyFields array
	 * 
	 * @public
	 * @since 1.26
	 * @param {array}
	 *            array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text :
	 *            "Name"}]
	 */
	P13nFilterPanel.prototype.setKeyFields = function(aKeyFields) {
		this._aKeyFields = aKeyFields;

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setKeyFields(this._aKeyFields);
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setKeyFields(this._aKeyFields);
		}

	};

	P13nFilterPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};

	P13nFilterPanel.prototype.setMaxIncludes = function(sMax) {
		this.setProperty("maxIncludes", sMax);

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setMaxConditions(sMax);
		}
		this._updatePanel();
	};

	P13nFilterPanel.prototype.setMaxExcludes = function(sMax) {
		this.setProperty("maxExcludes", sMax);

		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setMaxConditions(sMax);
		}
		this._updatePanel();
	};

	P13nFilterPanel.prototype._updatePanel = function() {
		var iMaxIncludes = this.getMaxIncludes() === "-1" ? 1000 : parseInt(this.getMaxIncludes(), 10);
		var iMaxExcludes = this.getMaxExcludes() === "-1" ? 1000 : parseInt(this.getMaxExcludes(), 10);

		if (iMaxIncludes > 0) {
			if (iMaxExcludes <= 0) {
				// in case we do not show the exclude panel remove the include panel header text and add an extra top margin
				this._oIncludePanel.setHeaderText(null);
				this._oIncludePanel.setExpandable(false);
				this._oIncludePanel.addStyleClass("panelTopMargin");
			}
		}

		if (iMaxExcludes === 0) {
			this._oExcludePanel.setHeaderText(null);
			this._oExcludePanel.setExpandable(false);
		}

	};

	/**
	 * Initialize the control
	 * 
	 * @private
	 */
	P13nFilterPanel.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		jQuery.sap.require("sap.ui.layout.Grid");

		sap.ui.layout.Grid.prototype.init.apply(this);

		this._aKeyFields = [];
		this.addStyleClass("sapMFilterPanel");

		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		if (!this._aIncludeOperations) {
			this.setIncludeOperations([
			                           sap.m.P13nConditionOperation.Contains, sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.StartsWith, sap.m.P13nConditionOperation.EndsWith, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
			]);
		}

		if (!this._aExcludeOperations) {
			this.setExcludeOperations([
				sap.m.P13nConditionOperation.EQ
			]);
		}

		this._oIncludePanel = new sap.m.Panel({
			expanded: true,
			expandable: true,
			headerText: this._oRb.getText("FILTERPANEL_INCLUDES"),
			width: "auto"
		}).addStyleClass("sapMFilterPadding");

		this._oIncludeFilterPanel = new P13nConditionPanel({
			maxConditions: this.getMaxIncludes(),
			autoAddNewRow: true,
			alwaysShowAddIcon: false,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oIncludeFilterPanel.setOperations(this._aIncludeOperations);
		this._oIncludeFilterPanel.setOperations([
			sap.m.P13nConditionOperation.Contains, sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.StartsWith, sap.m.P13nConditionOperation.EndsWith, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
		], "string");
		this._oIncludeFilterPanel.setOperations([
			sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
		], "date");
		this._oIncludeFilterPanel.setOperations([
			sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
		], "numeric");

		this._oIncludePanel.addContent(this._oIncludeFilterPanel);

		this.addAggregation("content", this._oIncludePanel);

		this._oExcludePanel = new sap.m.Panel({
			expanded: false,
			expandable: true,
			headerText: this._oRb.getText("FILTERPANEL_EXCLUDES"),
			width: "auto"
		}).addStyleClass("sapMFilterPadding");

		this._oExcludeFilterPanel = new P13nConditionPanel({
			exclude: true,
			maxConditions: this.getMaxExcludes(),
			autoAddNewRow: true,
			alwaysShowAddIcon: false,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oExcludeFilterPanel.setOperations(this._aExcludeOperations);

		this._oExcludePanel.addContent(this._oExcludeFilterPanel);

		this.addAggregation("content", this._oExcludePanel);

		this._updatePanel();
	};

	P13nFilterPanel.prototype.exit = function() {

		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};

		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aIncludeOperations = destroyHelper(this._aIncludeOperations);
		this._aExcludeOperations = destroyHelper(this._aExcludeOperations);

		this._oRb = destroyHelper(this._oRb);
	};

	P13nFilterPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		var oKeyField = {
			key: oItem.getColumnKey(),
			text: oItem.getText(),
			tooltip: oItem.getTooltip(),
			maxLength: oItem.getMaxLength(),
			type: oItem.getType(),
			precision: oItem.getPrecision(),
			scale: oItem.getScale(),
			isDefault: oItem.getIsDefault()
		};

		this._aKeyFields.push(oKeyField);

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.addKeyField(oKeyField);
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.addKeyField(oKeyField);
		}
	};

	P13nFilterPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");
		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.removeAllKeyFields();
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.removeAllKeyFields();
		}
		return this;
	};

	P13nFilterPanel.prototype.addFilterItem = function(oFilterItem) {
		this.addAggregation("filterItems", oFilterItem);

		if (!this._bIgnoreBindCalls) {
			var oCondition = {
				exclude: oFilterItem.getExclude(),
				key: oFilterItem.getKey(),
				keyField: oFilterItem.getColumnKey(),
				operation: oFilterItem.getOperation(),
				value1: oFilterItem.getValue1(),
				value2: oFilterItem.getValue2()
			}; 

			this._addCondition(oCondition);
		}
	};

	P13nFilterPanel.prototype.insertFilterItem = function(oFilterItem) {
		this.insertAggregation("filterItems", oFilterItem);
		//TODO: implement this
		return this;
	};

	P13nFilterPanel.prototype.removeFilterItem = function(oFilterItem) {
		oFilterItem = this.removeAggregation("filterItems", oFilterItem);

		return oFilterItem;
	};

	P13nFilterPanel.prototype.removeAllFilterItems = function() {
		var aFilterItems = this.removeAllAggregation("filterItems");

		if (!this._bIgnoreBindCalls) {
			this.setConditions([]);
		}
		
		return aFilterItems;
	};

	P13nFilterPanel.prototype.destroyFilterItems = function() {
		this.destroyAggregation("filterItems");

		if (!this._bIgnoreBindCalls) {
			this.setConditions([]);
		}

		return this;
	};

	P13nFilterPanel.prototype._handleDataChange = function() {
		var that = this;

		return function(oEvent) {
			var oNewData = oEvent.getParameter("newData");
			var sOperation = oEvent.getParameter("operation");
			var sKey = oEvent.getParameter("key");
			var iIndex = oEvent.getParameter("index");

			var oFilterItemData = null;
			if (oNewData) {
				oFilterItemData = {
					key: sKey,
					exclude: oNewData.exclude,
					columnKey: oNewData.keyField,
					operation: oNewData.operation,
					value1: oNewData.value1,
					value2: oNewData.value2
				};
			}
			if (sOperation === "update") {
				var oFilterItem = that.getFilterItems()[iIndex];
				if (oFilterItem) {
					oFilterItem.setExclude(oNewData.exclude);
					oFilterItem.setColumnKey(oNewData.keyField);
					oFilterItem.setOperation(oNewData.operation);
					oFilterItem.setValue1(oNewData.value1);
					oFilterItem.setValue2(oNewData.value2);
				}
				that.fireUpdateFilterItem({
					key: sKey,
					index: iIndex,
					filterItemData: oFilterItemData
				});
			}
			if (sOperation === "add") {
				that._bIgnoreBindCalls = true;
				that.fireAddFilterItem({
					key: sKey,
					index: iIndex,
					filterItemData: oFilterItemData
				});
				that._bIgnoreBindCalls = false;
			}
			if (sOperation === "remove") {
				that._bIgnoreBindCalls = true;
				that.fireRemoveFilterItem({
					key: sKey,
					index: iIndex
				});
				that._bIgnoreBindCalls = false;
			}
		};
	};

	return P13nFilterPanel;

}, /* bExport= */true);
