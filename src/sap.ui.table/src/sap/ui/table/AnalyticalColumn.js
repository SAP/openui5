/*!
 * ${copyright}
 */

// Provides control sap.ui.table.AnalyticalColumn.
sap.ui.define([
	'./Column',
	'./library',
	'sap/ui/core/Element',
	'sap/ui/model/type/Boolean',
	'sap/ui/model/type/DateTime',
	'sap/ui/model/type/Float',
	'sap/ui/model/type/Integer',
	'sap/ui/model/type/Time',
	'./utils/TableUtils',
	"sap/base/Log"
], function(
	Column,
	library,
	Element,
	BooleanType,
	DateTime,
	Float,
	Integer,
	Time,
	TableUtils,
	Log
) {
	"use strict";

	const GroupEventType = library.GroupEventType;

	function isInstanceOfAnalyticalTable(oControl) {
		return TableUtils.isA(oControl, "sap.ui.table.AnalyticalTable");
	}

	/**
	 * Constructor for a new AnalyticalColumn.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This column adds additional properties to the table column which are needed for the analytical binding and table
	 * @extends sap.ui.table.Column
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.AnalyticalColumn
	 */
	const AnalyticalColumn = Column.extend("sap.ui.table.AnalyticalColumn", /** @lends sap.ui.table.AnalyticalColumn.prototype */ {metadata: {

		library: "sap.ui.table",
		properties: {

			/**
			 * Defines the primary model property which is used inside the Column. In case of the analytical extension this means the property which is grouped by for dimensions or the property which is summed for measures.
			 */
			leadingProperty: {type: "string", group: "Misc", defaultValue: null},

			/**
			 * If defined a sum for this column is calculated
			 */
			summed: {type: "boolean", group: "Misc", defaultValue: false},

			/**
			 * Specifies that the dimension referred to by the column shall be included in the granularity of the data result. It allows a finer distinction between a visible/grouped/(included)inResult column.
			 */
			inResult: {type: "boolean", group: "Misc", defaultValue: false},

			/**
			 * Specifies whether the column is displayed within the table even if it is grouped or not. A grouped column has the same value for every rows within the group.
			 */
			showIfGrouped: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * If the column is grouped, this formatter is used to format the value in the group header
			 */
			groupHeaderFormatter: {type: "function", group: "Appearance", defaultValue: null},

			/**
			 * Indicates if the column is grouped.
			 * @since 1.118
			 */
			grouped: {type: "boolean", group: "Appearance", defaultValue: false}

		}
	}});

	/**
	 * map of filtertypes for re-use in getFilterType
	 * @private
	 */
	AnalyticalColumn._DEFAULT_FILTERTYPES = {
		"Time": new Time({UTC: true}),
		"DateTime": new DateTime({UTC: true}),
		"Float": new Float(),
		"Integer": new Integer(),
		"Boolean": new BooleanType()
	};

	AnalyticalColumn.prototype._setGrouped = function(bGrouped) {
		const oTable = this._getTable();
		const sGroupEventType = bGrouped ? GroupEventType.group : GroupEventType.ungroup;

		this.setGrouped(bGrouped);
		oTable.fireGroup({column: this, groupedColumns: oTable._aGroupedColumns, type: sGroupEventType});
	};

	AnalyticalColumn.prototype._isAggregatableByMenu = function() {
		const oTable = this._getTable();
		const oBinding = oTable.getBinding();
		const oResultSet = oBinding && oBinding.getAnalyticalQueryResult();

		return oTable && oResultSet && oResultSet.findMeasureByPropertyName(this.getLeadingProperty());
	};

	AnalyticalColumn.prototype.setGrouped = function(bGrouped) {
		const oParent = this.getParent();

		if (isInstanceOfAnalyticalTable(oParent)) {
			if (bGrouped) {
				oParent._addGroupedColumn(this.getId());
			} else {
				oParent._removeGroupedColumn(this.getId());
			}
		}

		const bReturn = this.setProperty("grouped", bGrouped);
		this._updateColumns();

		return bReturn;
	};

	AnalyticalColumn.prototype.setSummed = function(bSummed) {
		const bReturn = this.setProperty("summed", bSummed, true);
		this._updateTableAnalyticalInfo();
		return bReturn;
	};

	AnalyticalColumn.prototype.setVisible = function(bVisible) {
		Column.prototype.setVisible.call(this, bVisible);
		this._updateColumns();
		return this;
	};

	AnalyticalColumn.prototype.getLabel = function() {
		let oLabel = this.getAggregation("label");
		try {
			if (!oLabel) {
				if (!this._oBindingLabel) {
					const oParent = this.getParent();
					if (isInstanceOfAnalyticalTable(oParent)) {
						const oBinding = oParent.getBinding();
						if (oBinding) {
							this._oBindingLabel = TableUtils._getTableTemplateHelper().createLabel();
							this.addDependent(this._oBindingLabel);
							TableUtils.Binding.metadataLoaded(oParent).then(function() {
								this._oBindingLabel.setText(oBinding.getPropertyLabel(this.getLeadingProperty()));
							}.bind(this));
						}
					}
				}
				oLabel = this._oBindingLabel;
			}
		} catch (e) {
			Log.warning(e);
		}
		return oLabel;
	};

	AnalyticalColumn.prototype.getFilterProperty = function() {
		let sProperty = this.getProperty("filterProperty");
		if (!sProperty) {
			const oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				const oBinding = oParent.getBinding();
				const sLeadingProperty = this.getLeadingProperty();
				if (oBinding && oBinding.getFilterablePropertyNames().indexOf(sLeadingProperty) > -1) {
					sProperty = sLeadingProperty;
				}
			}
		}
		return sProperty;
	};

	AnalyticalColumn.prototype.getSortProperty = function() {
		let sProperty = this.getProperty("sortProperty");
		if (!sProperty) {
			const oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				const oBinding = oParent.getBinding();
				const sLeadingProperty = this.getLeadingProperty();
				if (oBinding && oBinding.getSortablePropertyNames().indexOf(sLeadingProperty) > -1) {
					sProperty = sLeadingProperty;
				}
			}
		}
		return sProperty;
	};

	AnalyticalColumn.prototype.getFilterType = function() {
		let vFilterType = this.getProperty("filterType");
		if (!vFilterType) {
			const oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				const oBinding = oParent.getBinding();
				const sLeadingProperty = this.getLeadingProperty();
				const oProperty = oBinding && oBinding.getProperty(sLeadingProperty);
				if (oProperty) {
					switch (oProperty.type) {
						case "Edm.Time":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Time"];
							break;
						case "Edm.DateTime":
						case "Edm.DateTimeOffset":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["DateTime"];
							break;
						case "Edm.Single":
						case "Edm.Double":
						case "Edm.Decimal":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Float"];
							break;
						case "Edm.SByte":
						case "Edm.Int16":
						case "Edm.Int32":
						case "Edm.Int64":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Integer"];
							break;
						case "Edm.Boolean":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Boolean"];
							break;
					}
				}
			}
		}
		return vFilterType;
	};

	AnalyticalColumn.prototype._updateColumns = function(bSupressRefresh, bForceChange) {
		const oParent = this.getParent();
		if (isInstanceOfAnalyticalTable(oParent)) {
			oParent._updateColumns(bSupressRefresh, bForceChange);
		}
	};

	AnalyticalColumn.prototype._updateTableAnalyticalInfo = function(bSupressRefresh) {
		const oParent = this.getParent();
		if (oParent && isInstanceOfAnalyticalTable(oParent) && !oParent._bSuspendUpdateAnalyticalInfo) {
			oParent.updateAnalyticalInfo(bSupressRefresh);
		}
	};

	AnalyticalColumn.prototype._updateTableColumnDetails = function() {
		const oParent = this.getParent();
		if (oParent && isInstanceOfAnalyticalTable(oParent) && !oParent._bSuspendUpdateAnalyticalInfo) {
			oParent._updateTableColumnDetails();
		}
	};

	AnalyticalColumn.prototype.shouldRender = function() {
		if (!this.getVisible() || !this.getTemplate()) {
			return false;
		}
		return (!this.getGrouped() || this._bLastGroupAndGrouped || this.getShowIfGrouped()) && (!this._bDependendGrouped || this._bLastGroupAndGrouped);
	};

	/**
	 * This function checks whether a filter column menu item will be created. This function considers
	 * several column properties and evaluates metadata to determine whether filtering for a column is applicable.
	 * Since for the AnalyticalBinding metadata is very important to determine whether the column can be filtered it
	 * is required to have a binding. If there is no binding, this function will return false.
	 *
	 * For Analytical Columns the following applies:
	 * - filterProperty must be defined or it must be possible to derive it from the leadingProperty + filterable = true in the metadata
	 * - showFilterMenuEntry must be true (which is the default)
	 * - The filter property must be a property of the bound collection however it may differ from the leading property
	 * - The analytical column must be a child of an AnalyticalTable
	 *
	 * @returns {boolean}
	 */
	AnalyticalColumn.prototype.isFilterableByMenu = function() {
		const sFilterProperty = this.getFilterProperty();
		if (!sFilterProperty || !this.getShowFilterMenuEntry()) {
			// not required to get binding and do addtional checks if there is no filterProperty set or derived
			// or if the filter menu entry shall not be displayed at all
			return false;
		}

		const oParent = this.getParent();
		if (isInstanceOfAnalyticalTable(oParent)) {
			const oBinding = oParent.getBinding();
			// metadata must be evaluated which can only be done when the collection is known and the metadata is loaded
			// this is usually the case when a binding exists.
			if (oBinding) {
				// The OData4SAP specification defines in section 3.3.3.2.2.3 how a filter condition on a measure property has to be used for data selection at runtime:
				// “Conditions on measure properties refer to the aggregated measure value based on the selected dimensions”
				// Although the generic OData providers (BW, SADL) do not support filtering measures, there may be specialized implementations that do support it.
				// Conclusion for a fix therefore is to make sure that the AnalyticalTable solely checks sap:filterable=”false” for providing the filter function.
				// Check for measure is hence removed. For more details, see BCP: 1770355530
				if (oBinding.getFilterablePropertyNames().indexOf(sFilterProperty) > -1 &&
					oBinding.getProperty(sFilterProperty)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Returns the information whether the column is groupable.
	 *
	 * The column is groupable only if the following conditions are fulfilled:
	 * <ul>
	 *   <li>The column must be child of an <code>AnalyticalTable</code>.</li>
	 *   <li>The <code>rows</code> aggregation of the table must be bound.</li>
	 *   <li>The metadata of the model must be loaded.</li>
	 *   <li>The column's <code>leadingProperty</code> must be a sortable and filterable dimension.</li>
	 * </ul>
	 *
	 * @private
	 * @ui5-restricted sap.ui.comp
	 * @return {boolean} <code>true</code> if the column is groupable
	 */
	AnalyticalColumn.prototype.isGroupableByMenu = function() {
		const oParent = this.getParent();

		if (isInstanceOfAnalyticalTable(oParent)) {
			const oBinding = oParent.getBinding();
			if (oBinding) {
				const oResultSet = oBinding.getAnalyticalQueryResult();
				if (oResultSet && oResultSet.findDimensionByPropertyName(this.getLeadingProperty())
					&& oBinding.getSortablePropertyNames().indexOf(this.getLeadingProperty()) > -1
					&& oBinding.getFilterablePropertyNames().indexOf(this.getLeadingProperty()) > -1) {
					return true;
				}
			}
		}

		return false;
	};

	AnalyticalColumn.prototype._isGroupableByMenu = function() {
		return this.isGroupableByMenu();
	};

	// This column sets its own cell content visibility settings.
	AnalyticalColumn.prototype._setCellContentVisibilitySettings = function() {};

	AnalyticalColumn.prototype._applySorters = function() {
		// The analytical info must be updated before sorting via the binding. The request will still be correct, but the binding
		// will create its internal data structure based on the analytical info. We also do not need to get the contexts right
		// now (therefore "true" is passed"), this will be done later in refreshRows.
		this._updateTableAnalyticalInfo(true);
		Column.prototype._applySorters.apply(this, arguments);
	};

	return AnalyticalColumn;
});