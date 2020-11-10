/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../utils/TableUtils",
	"sap/ui/unified/MenuItem"
], function(
	PluginBase,
	TableUtils,
	MenuItem
) {
	"use strict";

	function defaultGroupHeaderFormatter(oContext, sPropertyPath) {
		var vValue = oContext.getProperty(sPropertyPath),
			oMetaModel = oContext.getModel().getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oContext.getPath() + "/" + sPropertyPath),
			oValueType = oMetaModel.getUI5Type(sMetaPath);

		return oValueType.formatValue(vValue, "string");
	}

	/**
	 * Constructs an instance of sap.ui.table.plugins.V4Aggregation
	 *
	 * @class TODO
	 * @extends sap.ui.table.plugins.PluginBase
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.76
	 * @experimental
	 * @alias sap.ui.table.plugins.V4Aggregation
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var V4Aggregation = PluginBase.extend("sap.ui.table.plugins.V4Aggregation", /** @lends sap.ui.table.plugins.V4Aggregation.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {

			},
			events: {}
		}
	});

	V4Aggregation.prototype.init = function() {

	};

	V4Aggregation.prototype.isApplicable = function(oTable) {
		return oTable.getMetadata().getName() === "sap.ui.table.Table";
	};

	V4Aggregation.prototype.onActivate = function(oTable) {
		// Only activate if OData V4
		var oBinding = oTable.getBinding("rows");
		if (oBinding && !oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			return;
		}

		PluginBase.prototype.onActivate.apply(this, arguments);
		TableUtils.Grouping.setGroupMode(oTable);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Expand, this.expandRow, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Collapse, this.collapseRow, this);
	};

	V4Aggregation.prototype.onDeactivate = function(oTable) {
		PluginBase.prototype.onDeactivate.apply(this, arguments);
		TableUtils.Grouping.clearMode(oTable);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Expand, this.expandRow, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Collapse, this.collapseRow, this);

		var oBinding = oTable.getBinding("rows");
		if (oBinding) {
			oBinding.setAggregation();
		}
	};

	V4Aggregation.prototype.onTableRowsBound = function(oBinding) {
		// Activate if OData V4, otherwise deactivate
		if (oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			this.updateAggregation();
		} else {
			this.onDeactivate(this.getTable());
		}
	};

	V4Aggregation.prototype.updateRowState = function(oState) {
		var iLevel = oState.context.getValue("@$ui5.node.level");

		if (typeof oState.context.getValue("@$ui5.node.isExpanded") === "boolean") {
			oState.type = (iLevel === 0) ? oState.Type.Summary : oState.Type.GroupHeader;
		}

		oState.expandable = oState.type === oState.Type.GroupHeader;
		oState.expanded = oState.context.getValue("@$ui5.node.isExpanded") === true;
		oState.level = iLevel;

		if (oState.type === oState.Type.GroupHeader) {
			oState.title = this._aGroupLevelFormatters[iLevel - 1](oState.context, this._aGroupLevels[iLevel - 1]);
		}
	};

	V4Aggregation.prototype.setPropertyInfos = function(aPropertyInfos) {
		this._aPropertyInfos = aPropertyInfos;
	};

	V4Aggregation.prototype.getPropertyInfos = function() {
		return this._aPropertyInfos || [];
	};

	/**
	 * Retrieves a propertyInfo from its name.
	 *
	 * @param {string} sPropertyName name of the propertyInfo to be found
	 * @returns {object} the proprty info with the corresponding name, or null
	 *
	 * @private
	 */

	V4Aggregation.prototype.findPropertyInfo = function(sPropertyName) {
		return this.getPropertyInfos().find(function(oPropertyInfo) {
			return oPropertyInfo.name === sPropertyName;
		});
	};

	/**
	 * Sets aggregation info and derives the query options to be passed to the table list binding.
	 *
	 * @param {object} oAggregateInfo An object holding the information needed for data aggregation
	 * @param {Array} oAggregateInfo.visible An array of property info names, containing the list of visible properties
	 * @param {Array} oAggregateInfo.groupLevels An array of groupable property info names used to determine group levels (visual grouping).
	 * @param {Array} oAggregateInfo.subtotals  An array of aggregatable property info names for which the subtotals are displayed
	 * @param {Array} oAggregateInfo.grandTotal  An array of aggregatable property info names for which the grand total is displayed
	 */
	V4Aggregation.prototype.setAggregationInfo = function(oAggregateInfo) {
		if (!oAggregateInfo || !oAggregateInfo.visible) {
			this._mGroup = undefined;
			this._mAggregate = undefined;
			this._aGroupLevels = undefined;
		} else {
			// Always use keys in the properties to be grouped
			this._mGroup = this.getPropertyInfos().reduce(function(mGroup, oPropertyInfo) {
				if (oPropertyInfo.key) {
					mGroup[oPropertyInfo.path] = {};
				}
				return mGroup;
			}, {});

			this._mAggregate = {};

			// Find grouped and aggregated properties
			oAggregateInfo.visible.forEach(function(sVisiblePropertyName) {
				var oPropertyInfo = this.findPropertyInfo(sVisiblePropertyName);
				if (oPropertyInfo && oPropertyInfo.groupable) {
					this._mGroup[oPropertyInfo.path] = {};
				}

				if (oPropertyInfo && oPropertyInfo.aggregatable) {
					this._mAggregate[oPropertyInfo.path] = {
						grandTotal: oAggregateInfo.grandTotal && (oAggregateInfo.grandTotal.indexOf(sVisiblePropertyName) >= 0),
						subtotals: oAggregateInfo.subtotals && (oAggregateInfo.subtotals.indexOf(sVisiblePropertyName) >= 0)
					};

					if (oPropertyInfo.aggregationDetails) {
						if (oPropertyInfo.aggregationDetails.defaultMethod && oPropertyInfo.aggregationDetails.defaultMethod.unit) {
							var oUnitPropertyInfo = this.findPropertyInfo(oPropertyInfo.aggregationDetails.defaultMethod.unit);
							if (oUnitPropertyInfo) {
								this._mAggregate[oPropertyInfo.path].unit = oUnitPropertyInfo.path;
							}
						}
						if (oPropertyInfo.aggregationDetails.contextDefiningProperties) {
							oPropertyInfo.aggregationDetails.contextDefiningProperties.forEach(function(sContextDefiningPropertyName) {
								var oDefiningPropertyInfo = this.findPropertyInfo(sContextDefiningPropertyName);
								if (oDefiningPropertyInfo && oDefiningPropertyInfo.groupable) {
									this._mGroup[oDefiningPropertyInfo.path] = {};
								}
							}.bind(this));
						}
					}
				}
			}.bind(this));

			// Handle group levels
			this._aGroupLevels = [];
			this._aGroupLevelFormatters = [];
			if (oAggregateInfo.groupLevels) {
				oAggregateInfo.groupLevels.forEach(function(sGroupLevelName) {
					var oPropertyInfo = this.findPropertyInfo(sGroupLevelName);
					if (oPropertyInfo && oPropertyInfo.groupable) {
						this._aGroupLevels.push(oPropertyInfo.path);
						var fnFormatter = (oPropertyInfo.groupingDetails && oPropertyInfo.groupingDetails.formatter) || defaultGroupHeaderFormatter;
						this._aGroupLevelFormatters.push(fnFormatter);
					}
				}.bind(this));
			}
		}

		this.updateAggregation();
	};

	V4Aggregation.prototype.expandRow = function(oRow) {
		if (TableUtils.isA(oRow, "sap.ui.table.Row")) {
			var oRowBindingContext = oRow.getRowBindingContext();

			if (oRowBindingContext) {
				oRowBindingContext.expand();
			}
		}
	};

	V4Aggregation.prototype.collapseRow = function(oRow) {
		if (TableUtils.isA(oRow, "sap.ui.table.Row")) {
			var oRowBindingContext = oRow.getRowBindingContext();

			if (oRowBindingContext) {
				oRowBindingContext.collapse();
			}
		}
	};

	V4Aggregation.prototype.updateAggregation = function() {
		var oBinding = this.getTableBinding();
		var mAggregation = {
			aggregate: this._mAggregate,
			group: this._mGroup,
			groupLevels: this._aGroupLevels
		};

		if (oBinding) {
			oBinding.setAggregation(mAggregation);
		}
	};

	return V4Aggregation;
});