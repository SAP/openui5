/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../utils/TableUtils",
	"sap/base/util/deepClone"
], function(
	PluginBase,
	TableUtils,
	deepClone
) {
	"use strict";

	function defaultGroupHeaderFormatter(oContext, mGroupLevelInfo) {
		let sResourceKey = "TBL_ROW_GROUP_TITLE";
		const aValues = [mGroupLevelInfo.property.label, oContext.getProperty(mGroupLevelInfo.property.path, true)];

		if (mGroupLevelInfo.textProperty) {
			sResourceKey = "TBL_ROW_GROUP_TITLE_FULL";
			aValues.push(oContext.getProperty(mGroupLevelInfo.textProperty.path, true));
		}

		return TableUtils.getResourceText(sResourceKey, aValues);
	}

	/**
	 * Constructs an instance of sap.ui.table.plugins.V4Aggregation
	 *
	 * @class TODO (don't forget to document fixed row count restrictions because fixed rows are set by this plugin)
	 * @extends sap.ui.table.plugins.PluginBase
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.76
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.table.plugins.V4Aggregation
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const V4Aggregation = PluginBase.extend("sap.ui.table.plugins.V4Aggregation", /** @lends sap.ui.table.plugins.V4Aggregation.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				// None, Top, FixedTop, Bottom, FixedBottom, TopAndBottom, FixedTopAndBottom, TopAndFixedBottom, FixedTopAndFixedBottom
				//totalSummary: {type: "string", defaultValue: "FixedBottom"},
				totalSummaryOnTop: {type: "string", defaultValue: "Off"}, // On, Off, Fixed
				totalSummaryOnBottom: {type: "string", defaultValue: "Fixed"}, // On, Off, Fixed
				groupSummary: {type: "string", defaultValue: "Bottom"}, // None, Top, Bottom, TopAndBottom
				//groupSummaryOnTop: {type: "string", defaultValue: "On"}, // On, Off
				//groupSummaryOnBottom: {type: "string", defaultValue: "Off"}, // On, Off

				/**
				 * If the formatter returns undefined, the default group header title is set.
				 *
				 * Parameters: Binding context (sap.ui.model.Context), Name of the grouped property (string)
				 * Returns: The group header title or undefined
				 */
				groupHeaderFormatter: {type: "function"}
			}
		}
	});

	V4Aggregation.findOn = PluginBase.findOn;

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.isApplicable = function(oControl) {
		return PluginBase.prototype.isApplicable.apply(this, arguments) && oControl.getMetadata().getName() === "sap.ui.table.Table";
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.activate = function() {
		const oBinding = this.getTableBinding();

		if (oBinding && !oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
			return;
		}

		PluginBase.prototype.activate.apply(this, arguments);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onActivate = function(oTable) {
		this.setRowCountConstraints({
			fixedTop: false,
			fixedBottom: false
		});
		TableUtils.Grouping.setToDefaultGroupMode(oTable);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onDeactivate = function(oTable) {
		this._mGroup = undefined;
		this._mAggregate = undefined;
		this._aGroupLevels = undefined;
		this._mColumnState = undefined;
		this.setRowCountConstraints();
		resetCellContentVisibilitySettings(this);

		TableUtils.Grouping.setToDefaultFlatMode(oTable);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);

		const oBinding = oTable.getBinding();
		if (oBinding) {
			oBinding.setAggregation();
		}
	};

	/**
	 * Resets the cell content visibility settings of the columns in the table to the defaults.
	 *
	 * @param {sap.ui.table.plugins.V4Aggregation} oPlugin The instance of the plugin.
	 */
	function resetCellContentVisibilitySettings(oPlugin) {
		const oTable = oPlugin.getTable();

		if (oTable) {
			oTable.getColumns().forEach(function(oColumn) {
				oColumn._setCellContentVisibilitySettings();
			});
		}
	}

	/**
	 * Updates the cell content visibility settings of the columns in the table.
	 *
	 * @param {sap.ui.table.plugins.V4Aggregation} oPlugin The instance of the plugin.
	 */
	function updateCellContentVisibilitySettings(oPlugin) {
		const oTable = oPlugin.getTable();
		const sGroupSummary = oPlugin.getGroupSummary();

		if (!oTable || !oPlugin._mColumnState) {
			return;
		}

		oTable.getColumns().forEach(function(oColumn) {
			const mColumnState = oPlugin._mColumnState[oColumn.getId()];

			if (mColumnState) {
				oColumn._setCellContentVisibilitySettings({
					groupHeader: {
						expanded: !!mColumnState.subtotals && (sGroupSummary === "Top" || sGroupSummary === "TopAndBottom"),
						collapsed: !!mColumnState.subtotals && (sGroupSummary === "Bottom" || sGroupSummary === "TopAndBottom")
					},
					summary: {
						group: !!mColumnState.subtotals,
						total: !!mColumnState.grandTotal
					}
				});
			} else {
				oColumn._setCellContentVisibilitySettings();
			}
		});
	}

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onTableRowsBound = function(oBinding) {
		// TODO: Check whether the plugin is correctly (de)activated in all possible cases and write tests.
		//  For example:
		//   - if the plugin is not active because there is no ODataV4 model yet, it won't be activated if that model is added later
		//   - on unbind
		//  Consider calling binding-related hooks also on inactive plugins for this purpose (check usage in selection plugins).
		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			this.deactivate();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onTableBindRows = function(oBindingInfo) {
		oBindingInfo.parameters = oBindingInfo.parameters || {};
		oBindingInfo.parameters.$$aggregation = this.getAggregationInfo();
	};

	V4Aggregation.prototype.updateRowState = function(oState) {
		const iLevel = oState.context.getProperty("@$ui5.node.level");
		const bContainsTotals = oState.context.getProperty("@$ui5.node.isTotal");
		const bIsLeaf = oState.context.getProperty("@$ui5.node.isExpanded") === undefined;
		const bIsGrandTotal = iLevel === 0 && bContainsTotals;
		const bIsGroupHeader = iLevel > 0 && !bIsLeaf;
		const bIsGroupTotal = !bIsGroupHeader && bContainsTotals;

		oState.level = iLevel;
		oState.expandable = bIsGroupHeader;
		oState.expanded = oState.context.getProperty("@$ui5.node.isExpanded") === true;

		if (bIsGrandTotal || bIsGroupTotal) {
			oState.type = oState.Type.Summary;
			oState.level++;
		} else if (bIsGroupHeader) {
			oState.type = oState.Type.GroupHeader;
		}

		if (bIsGroupHeader) {
			const mGroupLevelInfo = this._aGroupLevels[iLevel - 1];
			const fnGroupHeaderFormatter = this.getGroupHeaderFormatter();
			const sCustomGroupHeaderTitle = fnGroupHeaderFormatter ? fnGroupHeaderFormatter(oState.context, mGroupLevelInfo.property.key) : undefined;

			if (sCustomGroupHeaderTitle === undefined) {
				oState.title = defaultGroupHeaderFormatter(oState.context, mGroupLevelInfo);
			} else if (typeof sCustomGroupHeaderTitle !== "string") {
				throw new Error("The group header title must be a string or undefined");
			} else {
				oState.title = sCustomGroupHeaderTitle;
			}
		}
	};

	V4Aggregation.prototype.setPropertyInfos = function(aPropertyInfos) {
		this._aPropertyInfos = aPropertyInfos;
	};

	V4Aggregation.prototype.getPropertyInfos = function() {
		return this._aPropertyInfos || [];
	};

	/**
	 * Retrieves a propertyInfo by its key.
	 *
	 * @param {string} sPropertyKey key of the propertyInfo to be found
	 * @returns {object|undefined} the property info with the corresponding key, or undefined
	 */
	V4Aggregation.prototype.findPropertyInfo = function(sPropertyKey) {
		return this.getPropertyInfos().find(function(oPropertyInfo) {
			return oPropertyInfo.key === sPropertyKey;
		});
	};

	/**
	 * Sets aggregation info and derives the query options to be passed to the table list binding.
	 *
	 * @param {object} oAggregateInfo An object holding the information needed for data aggregation
	 * @param {string[]} oAggregateInfo.visible An array of property info names, containing the list of visible properties
	 * @param {string[]} oAggregateInfo.groupLevels An array of groupable property info names used to determine group levels (visual grouping).
	 * @param {string[]} oAggregateInfo.subtotals An array of aggregatable property info names for which the subtotals are displayed
	 * @param {string[]} oAggregateInfo.grandTotal An array of aggregatable property info names for which the grand total is displayed
	 * @param {object} [oAggregateInfo.columnState]
	 *     A key-value map, where the key is the column id, and the value is the column's state information.
	 *     The state is an object with the following keys:
	 *     - subtotals: boolean - Whether the cell content should be visible in subtotal rows
	 *     - grandTotal: boolean - Whether the cell content should be visible in grand total rows
	 * @param {string} [oAggregateInfo.search] A search string used to search transformation (see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}) for details..
	 */
	V4Aggregation.prototype.setAggregationInfo = function(oAggregateInfo) {
		oAggregateInfo = Object.assign({
			columnState: {}
		}, oAggregateInfo);

		if (!Array.isArray(oAggregateInfo.visible)) {
			this._mGroup = undefined;
			this._mAggregate = undefined;
			this._aGroupLevels = undefined;
			this._sSearch = undefined;
		} else {
			const aAllUnitProperties = [];
			let aAllAdditionalProperties = [];
			let aAdditionalProperties;

			// Always use keys in the properties to be grouped
			this._mGroup = this.getPropertyInfos().reduce(function(mGroup, oPropertyInfo) {
				if (oPropertyInfo.isKey) {
					mGroup[oPropertyInfo.path] = {};
					aAdditionalProperties = getAdditionalPropertyPaths(this, oPropertyInfo);
					if (aAdditionalProperties) {
						mGroup[oPropertyInfo.path].additionally = aAdditionalProperties;
						aAllAdditionalProperties.concat(aAdditionalProperties);
					}
				}
				return mGroup;
			}.bind(this), {});

			this._mAggregate = {};

			// Find grouped and aggregated properties
			const aVisible = oAggregateInfo.visible.concat();	// Copy
			if (oAggregateInfo.groupLevels) {
				// We need to consider groupLevels as visible properties, to add them in the query properly if they have an 'additionally' property
				oAggregateInfo.groupLevels.forEach(function(sGroupLevelName) {
					if (aVisible.indexOf(sGroupLevelName) < 0) {
						aVisible.push(sGroupLevelName);
					}
				});
			}
			aVisible.forEach(function(sVisiblePropertyName) {
				const oPropertyInfo = this.findPropertyInfo(sVisiblePropertyName);

				if (!oPropertyInfo) {
					return;
				}

				if (oPropertyInfo.groupable) {
					this._mGroup[oPropertyInfo.path] = {};
					aAdditionalProperties = getAdditionalPropertyPaths(this, oPropertyInfo);
					if (aAdditionalProperties) {
						this._mGroup[oPropertyInfo.path].additionally = aAdditionalProperties;
						aAllAdditionalProperties = aAllAdditionalProperties.concat(aAdditionalProperties);
					}
				}

				if (oPropertyInfo.aggregatable) {
					this._mAggregate[oPropertyInfo.path] = {};

					if (oAggregateInfo.grandTotal && (oAggregateInfo.grandTotal.indexOf(sVisiblePropertyName) >= 0)) {
						this._mAggregate[oPropertyInfo.path].grandTotal = true;
					}

					if (oAggregateInfo.subtotals && (oAggregateInfo.subtotals.indexOf(sVisiblePropertyName) >= 0)) {
						this._mAggregate[oPropertyInfo.path].subtotals = true;
					}

					if (oPropertyInfo.unit) {
						const oUnitPropertyInfo = this.findPropertyInfo(oPropertyInfo.unit);
						if (oUnitPropertyInfo) {
							this._mAggregate[oPropertyInfo.path].unit = oUnitPropertyInfo.path;
							aAllUnitProperties.push(oUnitPropertyInfo.path);
						}
					}

					if (oPropertyInfo.aggregationDetails &&
						oPropertyInfo.aggregationDetails.customAggregate &&
						oPropertyInfo.aggregationDetails.customAggregate.contextDefiningProperties) {

						oPropertyInfo.aggregationDetails.customAggregate.contextDefiningProperties.forEach(function(sContextDefiningPropertyName) {
							const oDefiningPropertyInfo = this.findPropertyInfo(sContextDefiningPropertyName);
							if (oDefiningPropertyInfo) {
								this._mGroup[oDefiningPropertyInfo.path] = {};
								aAdditionalProperties = getAdditionalPropertyPaths(this, oPropertyInfo);
								if (aAdditionalProperties) {
									this._mGroup[oDefiningPropertyInfo.path].additionally = aAdditionalProperties;
									aAllAdditionalProperties = aAllAdditionalProperties.concat(aAdditionalProperties);
								}
							}
						}.bind(this));
					}
				}
			}.bind(this));

			// Handle group levels
			this._aGroupLevels = [];
			if (oAggregateInfo.groupLevels) {
				oAggregateInfo.groupLevels.forEach(function(sGroupLevelName) {
					const oGroupedPropertyInfo = this.findPropertyInfo(sGroupLevelName);
					if (oGroupedPropertyInfo) {
						this._aGroupLevels.push({
							property: oGroupedPropertyInfo,
							textProperty: this.findPropertyInfo(oGroupedPropertyInfo.text)
						});
					}
				}.bind(this));
			}

			// Sanitize the aggregation info
			Object.keys(this._mGroup).forEach(function(sKey) {
				// A property may not be in both "group" and "aggregate".
				if (this._mAggregate.hasOwnProperty(sKey)) {
					if (this._mAggregate[sKey].grandTotal || this._mAggregate[sKey].subtotals) {
						delete this._mGroup[sKey];
						return;
					} else {
						delete this._mAggregate[sKey];
					}
				}

				// A property may not be in "group.additionally" if it is in "aggregation.unit".
				if (this._mGroup[sKey].additionally) {
					this._mGroup[sKey].additionally = this._mGroup[sKey].additionally.filter(function(sAdditionalProperty) {
						return aAllUnitProperties.indexOf(sAdditionalProperty) === -1;
					});
				}

				// A property may not be in "group" if it is in "group.additionally".
				if (aAllAdditionalProperties.indexOf(sKey) > -1) {
					delete this._mGroup[sKey];
				}
			}.bind(this));

			this._sSearch = oAggregateInfo.search;
		}

		this._mColumnState = oAggregateInfo.columnState;
		updateCellContentVisibilitySettings(this);

		this.updateAggregation();
	};

	V4Aggregation.prototype.getAggregationInfo = function() {
		if (!Object.keys(this._mGroup || {}).length && !Object.keys(this._mAggregate || {}).length) {
			return;
		}

		const mAggregation = {
			aggregate: deepClone(this._mAggregate),
			group: deepClone(this._mGroup),
			groupLevels: this._aGroupLevels ? this._aGroupLevels.map(function(mGroupLevelInfo) {
				return mGroupLevelInfo.property.path;
			}) : undefined,
			search: this._sSearch
		};

		if (mAggregation.aggregate) {
			handleGrandTotals(this, mAggregation);
			handleGroupTotals(this, mAggregation);
		}

		return mAggregation;
	};

	function getAdditionalPropertyPaths(oPlugin, oPropertyInfo) {
		if (oPropertyInfo.text) {
			const oTextPropertyInfo = oPlugin.findPropertyInfo(oPropertyInfo.text);
			if (oTextPropertyInfo) {
				return [oTextPropertyInfo.path];
			}
		}

		return null;
	}

	function expandRow(oRow) {
		const oBindingContext = oRow.getRowBindingContext();

		if (oBindingContext) {
			oBindingContext.expand();
		}
	}

	function collapseRow(oRow) {
		const oBindingContext = oRow.getRowBindingContext();

		if (oBindingContext) {
			oBindingContext.collapse();
		}
	}

	V4Aggregation.prototype.setTotalSummaryOnTop = function(sValue) {
		this.setProperty("totalSummaryOnTop", sValue, true);
		this.updateAggregation();
	};

	V4Aggregation.prototype.setTotalSummaryOnBottom = function(sValue) {
		this.setProperty("totalSummaryOnBottom", sValue, true);
		this.updateAggregation();
	};

	V4Aggregation.prototype.setGroupSummary = function(sValue) {
		this.setProperty("groupSummary", sValue, true);
		updateCellContentVisibilitySettings(this);
		this.updateAggregation();
	};

	V4Aggregation.prototype.updateAggregation = function() {
		const oBinding = this.getTableBinding();
		if (oBinding) {
			oBinding.setAggregation(this.getAggregationInfo());
		}
	};

	function handleGrandTotals(oPlugin, mAggregation) {
		const sTotalSummaryOnTop = oPlugin.getTotalSummaryOnTop();
		const sTotalSummaryOnBottom = oPlugin.getTotalSummaryOnBottom();
		const bShowTotalSummaryOnTop = sTotalSummaryOnTop === "On" || sTotalSummaryOnTop === "Fixed";
		const bShowTotalSummaryOnBottom = sTotalSummaryOnBottom === "On" || sTotalSummaryOnBottom === "Fixed";
		const bHasGrandTotals = Object.keys(mAggregation.aggregate).some(function(sKey) {
			return mAggregation.aggregate[sKey].grandTotal;
		});

		if (bShowTotalSummaryOnTop && bShowTotalSummaryOnBottom) {
			mAggregation.grandTotalAtBottomOnly = false;
		} else if (bShowTotalSummaryOnBottom) {
			mAggregation.grandTotalAtBottomOnly = true;
		} else if (bShowTotalSummaryOnTop) {
			mAggregation.grandTotalAtBottomOnly = undefined;
		} else {
			Object.keys(mAggregation.aggregate).forEach(function(sKey) {
				delete mAggregation.aggregate[sKey].grandTotal;
			});
		}

		oPlugin.setRowCountConstraints({
			fixedTop: sTotalSummaryOnTop === "Fixed" && bHasGrandTotals,
			fixedBottom: sTotalSummaryOnBottom === "Fixed" && bHasGrandTotals
		});
	}

	function handleGroupTotals(oPlugin, mAggregation) {
		const sGroupSummary = oPlugin.getGroupSummary();

		if (sGroupSummary === "Top") {
			mAggregation.subtotalsAtBottomOnly = undefined;
		} else if (sGroupSummary === "Bottom") {
			mAggregation.subtotalsAtBottomOnly = true;
		} else if (sGroupSummary === "TopAndBottom") {
			mAggregation.subtotalsAtBottomOnly = false;
		} else {
			Object.keys(mAggregation.aggregate).forEach(function(sKey) {
				delete mAggregation.aggregate[sKey].subtotals;
			});
		}
	}

	return V4Aggregation;
});