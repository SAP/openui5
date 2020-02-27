/*!
 * ${copyright}
 */

// Provides control sap.ui.table.AnalyticalTable.
sap.ui.define([
	'./AnalyticalColumn',
	'./Table',
	'./TreeTable',
	"./TableRenderer",
	'./library',
	'sap/ui/model/analytics/ODataModelAdapter',
	'sap/ui/model/SelectionModel',
	'sap/ui/model/Sorter',
	'sap/ui/unified/Menu',
	'sap/ui/unified/MenuItem',
	'./utils/TableUtils',
	"./plugins/BindingSelectionPlugin",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/UriParameters"
],
	function(
		AnalyticalColumn,
		Table,
		TreeTable,
		TableRenderer,
		library,
		ODataModelAdapter,
		SelectionModel,
		Sorter,
		Menu,
		MenuItem,
		TableUtils,
		BindingSelectionPlugin,
		Log,
		assert,
		jQuery,
		UriParameters
	) {
	"use strict";

	// shortcuts
	var GroupEventType = library.GroupEventType,
		SortOrder = library.SortOrder,
		TreeAutoExpandMode = library.TreeAutoExpandMode;

	/**
	 * Constructor for a new AnalyticalTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Table which handles analytical OData backends. The AnalyticalTable only works with an AnalyticalBinding and
	 * correctly annotated OData services. Please check on the SAP Annotations for OData Version 2.0 documentation for further details.
	 * @see http://scn.sap.com/docs/DOC-44986
	 *
	 * @extends sap.ui.table.Table
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.AnalyticalTable
	 * @see {@link topic:08197fa68e4f479cbe30f639cc1cd22c sap.ui.table}
	 * @see {@link fiori:/analytical-table-alv/ Analytical Table}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalyticalTable = Table.extend("sap.ui.table.AnalyticalTable", /** @lends sap.ui.table.AnalyticalTable.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Specifies if the total values should be displayed in the group headers or on bottom of the row. Does not affect the total sum.
			 *
			 * The value of the property is only taken into account if no parameter is given in the binding information. Changes to this property
			 * after the table is bound do not have any effect unless an explicit (re-)bind of the <code>rows</code> aggregation is done.
			 *
			 * Example:
			 * <pre>
			 *   oTable.bindRows({
			 *     path: "...",
			 *     parameters: {
			 *       sumOnTop: true
			 *     }
			 *   });
			 * </pre>
			 *
			 * @deprecated As of 1.44. Use the binding parameter <code>sumOnTop</code> instead.
			 */
			sumOnTop : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true},

			/**
			 * Number of levels, which should be opened initially (on first load of data).
			 *
			 * The value of the property is only taken into account if no parameter is given in the binding information. Changes to this property
			 * after the table is bound do not have any effect unless an explicit (re-)bind of the <code>rows</code> aggregation is done.
			 *
			 * Example:
			 * <pre>
			 *   oTable.bindRows({
			 *     path: "...",
			 *     parameters: {
			 *       numberOfExpandedLevels: 1
			 *     }
			 *   });
			 * </pre>
			 *
			 * @deprecated As of 1.44. Use the binding parameter <code>numberOfExpandedLevels</code> instead.
			 */
			numberOfExpandedLevels : {type : "int", group : "Misc", defaultValue : 0, deprecated: true},

			/**
			 * The kind of auto expansion algorithm, e.g. optimized filter conditions, per level requests, ...
			 * Must be a value of <code>sap.ui.table.TreeAutoExpandMode</code>.
			 *
			 * The value of the property is only taken into account if no parameter is given in the binding information. Changes to this property
			 * after the table is bound do not have any effect unless an explicit (re-)bind of the <code>rows</code> aggregation is done.
			 *
			 * Example:
			 * <pre>
			 *   oTable.bindRows({
			 *     path: "...",
			 *     parameters: {
			 *       autoExpandMode: "Bundled"
			 *     }
			 *   });
			 * </pre>
			 *
			 * @deprecated As of 1.44. Use the binding parameter <code>autoExpandMode</code> instead.
			 */
			autoExpandMode: {type: "string", group: "Misc", defaultValue: "Bundled", deprecated: true},

			/**
			 * Functions which is used to sort the column visibility menu entries e.g.: function(ColumnA, ColumnB) { return 0 = equals, <0 lower, >0
			 * greater }; Other values than functions will be ignored.
			 */
			columnVisibilityMenuSorter : {type : "any", group : "Appearance", defaultValue : null},

			/**
			 * Setting collapseRecursive to true means, that when collapsing a node all subsequent child nodes will also be collapsed.
			 *
			 * Calling the setter of this property only has an effect when the tables <code>rows</code> aggregation is already bound and
			 * the binding supports this feature.
			 *
			 * Example:
			 * <pre>
			 *   oTable.bindRows({
			 *     path: "...",
			 *     parameters: {
			 *       collapseRecursive: true
			 *     }
			 *   });
			 * </pre>
			 *
			 * @deprecated As of 1.76. Use the binding parameter <code>collapseRecursive</code> instead.
			 */
			collapseRecursive : {type: "boolean", defaultValue: true},

			/**
			 * If dirty the content of the Table will be overlayed.
			 * @deprecated As of version 1.21.2, replaced by {@link sap.ui.table.Table#setShowOverlay}
			 */
			dirty : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true}
		},
		designtime: "sap/ui/table/designtime/AnalyticalTable.designtime"
	}, renderer: "sap.ui.table.TableRenderer"});

	/**
	 * This function retrieves the grand total context, in case of an analytical table
	 * Overidden from Table.js
	 * @overrides
	 */
	AnalyticalTable.prototype._getFixedBottomRowContexts = function() {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return [oBinding.getGrandTotalNode()];
		}
	};

	AnalyticalTable.prototype._getContexts = TreeTable.prototype._getContexts;

	/**
	 * Initialization of the AnalyticalTable control
	 * @private
	 */
	AnalyticalTable.prototype.init = function() {
		Table.prototype.init.apply(this, arguments);

		this.addStyleClass("sapUiAnalyticalTable");

		// defaulting properties
		this.setShowColumnVisibilityMenu(true);
		this.setEnableColumnFreeze(true);
		this.setEnableCellFilter(true);
		this._aGroupedColumns = [];
		this._bSuspendUpdateAnalyticalInfo = false;
		this._mGroupHeaderMenuItems = null;
		TableUtils.Grouping.setGroupMode(this);
		TableUtils.Hook.register(this, TableUtils.Hook.Keys.Row.UpdateState, this._updateRowState, this);
		TableUtils.Hook.register(this, TableUtils.Hook.Keys.Table.OpenMenu, this._onOpenTableContextMenu, this);
	};

	AnalyticalTable.prototype.exit = function() {
		Table.prototype.exit.apply(this, arguments);
		this._cleanupGroupHeaderMenuItems();
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.UpdateState, this._updateRowState, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Table.OpenMenu, this._onOpenTableContextMenu, this);
	};

	AnalyticalTable.prototype._adaptLocalization = function(bRtlChanged, bLangChanged) {
		return Table.prototype._adaptLocalization.apply(this, arguments).then(function() {
			if (bLangChanged) {
				this._cleanupGroupHeaderMenuItems();
			}
		}.bind(this));
	};

	AnalyticalTable.prototype.setFixedRowCount = function() {
		Log.error("The property fixedRowCount is not supported by control sap.ui.table.AnalyticalTable!");
		return this;
	};

	AnalyticalTable.prototype.setFixedBottomRowCount = function() {
		Log.error("The property fixedBottomRowCount is managed by control sap.ui.table.AnalyticalTable!");
		return this;
	};

	AnalyticalTable.prototype.setDirty = function(bDirty) {
		Log.error("The property dirty of control sap.ui.table.AnalyticalTable is deprecated. Please use showOverlay instead.");
		this.setProperty("dirty", bDirty, true);
		this.setShowOverlay(this.getDirty());
		return this;
	};

	/**
	 * The property <code>enableGrouping</code> is not supported by the <code>AnalyticalTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @public
	 * @name sap.ui.table.AnalyticalTable#getEnableGrouping
	 * @function
	 */

	/**
	 * The property <code>enableGrouping</code> is not supported by the <code>AnalyticalTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	AnalyticalTable.prototype.setEnableGrouping = function() {
		Log.error("The property enableGrouping is not supported by the sap.ui.table.AnalyticalTable control");
		return this;
	};

	/**
	 * The <code>groupBy</code> association is not supported by the <code>AnalyticalTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @public
	 * @name sap.ui.table.AnalyticalTable#getGroupBy
	 * @function
	 */

	/**
	 * The <code>groupBy</code> association is not supported by the <code>AnalyticalTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	AnalyticalTable.prototype.setGroupBy = function() {
		Log.warning("The groupBy association is not supported by the sap.ui.table.AnalyticalTable control");
		return this;
	};

	AnalyticalTable.prototype.getModel = function(sName) {
		var oModel = Table.prototype.getModel.apply(this, arguments);
		var oRowBindingInfo = this.getBindingInfo("rows");
		if (oModel && oRowBindingInfo && oRowBindingInfo.model == sName) {
			ODataModelAdapter.apply(oModel);
		}
		return oModel;
	};

	/**
	 * handler for change events of the binding
	 * @param {sap.ui.base.Event} oEvent change event
	 * @private
	 */
	AnalyticalTable.prototype._onBindingChange = function(oEvent) {
		Table.prototype._onBindingChange.apply(this, arguments);
		// the column menus have to be invalidated when the amount
		// of data changes in the Table; this happens on normal changes
		// of the Table as well as when filtering
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;
		if (sReason !== "sort") {
			this._invalidateColumnMenus();
		}
	};

	/**
	 * @inheritDoc
	 */
	AnalyticalTable.prototype._bindRows = function(oBindingInfo) {
		this._applyAnalyticalBindingInfo(oBindingInfo);
		Table.prototype._bindRows.call(this, oBindingInfo);
	};

	/**
	 * This function will be called by either by {@link sap.ui.base.ManagedObject#bindAggregation} or {@link sap.ui.base.ManagedObject#setModel}.
	 *
	 * @override {@link sap.ui.table.Table#_bindAggregation}
	 */
	AnalyticalTable.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			// If only the model has been changed, the ManagedObject only calls _bindAggregation while bindAggregation / bindRows is not called.
			this._invalidateColumnMenus(); // Metadata might change.
			this._applyODataModelAnalyticalAdapter(oBindingInfo.model);

			// make sure to reset the first visible row (currently needed for the analytical binding)
			// TODO: think about a boundary check to reset the firstvisiblerow if out of bounds
			this.setProperty("firstVisibleRow", 0, true);
		}

		// Create the binding.
		Table.prototype._bindAggregation.call(this, sName, oBindingInfo);

		if (sName === "rows") {
			this._updateTotalRow(true);
			TableUtils.Binding.metadataLoaded(this).then(function() {
				this._updateColumns(true);
			}.bind(this));
		}
	};

	AnalyticalTable.prototype._applyAnalyticalBindingInfo = function(oBindingInfo) {
		// extract the sorters from the columns (TODO: reconsider this!)
		var aColumns = this.getColumns();
		for (var i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getSorted()) {
				oBindingInfo.sorter = oBindingInfo.sorter || [];
				oBindingInfo.sorter.push(new Sorter(aColumns[i].getSortProperty() || aColumns[i].getLeadingProperty(), aColumns[i].getSortOrder() === SortOrder.Descending));
			}
		}

		// Make sure all necessary parameters are given.
		// The ODataModelAdapter (via bindList) needs these properties to determine if an AnalyticalBinding should be instantiated.
		// This is the default for the AnalyticalTable.
		oBindingInfo.parameters = oBindingInfo.parameters || {};
		oBindingInfo.parameters.analyticalInfo = this._getColumnInformation();

		if (!oBindingInfo.parameters.hasOwnProperty("sumOnTop")) {
			oBindingInfo.parameters.sumOnTop = this.getSumOnTop();
		}

		if (!oBindingInfo.parameters.hasOwnProperty("numberOfExpandedLevels")) {
			oBindingInfo.parameters.numberOfExpandedLevels = this.getNumberOfExpandedLevels();
		}

		// The binding does not support the number of expanded levels to be bigger than the number of grouped columns.
		if (oBindingInfo.parameters.numberOfExpandedLevels > this._aGroupedColumns.length) {
			oBindingInfo.parameters.numberOfExpandedLevels = 0;
		}

		if (!oBindingInfo.parameters.hasOwnProperty("autoExpandMode")) {
			var sExpandMode = this.getAutoExpandMode();
			if (sExpandMode != TreeAutoExpandMode.Bundled && sExpandMode != TreeAutoExpandMode.Sequential) {
				sExpandMode = TreeAutoExpandMode.Bundled;
			}
			oBindingInfo.parameters.autoExpandMode = sExpandMode;
		}
	};

	AnalyticalTable.prototype._applyODataModelAnalyticalAdapter = function(oModel) {
		if (oModel) {
			ODataModelAdapter.apply(oModel);
		}
	};

	AnalyticalTable.prototype._getColumnInformation = function() {
		var aColumns = [],
			aTableColumns = this.getColumns();

		for (var i = 0; i < this._aGroupedColumns.length; i++) {
			var oColumn = sap.ui.getCore().byId(this._aGroupedColumns[i]);

			if (!oColumn) {
				continue;
			}

			aColumns.push({
				name: oColumn.getLeadingProperty(),
				visible: oColumn.getVisible(),
				grouped: oColumn.getGrouped(),
				total: oColumn.getSummed(),
				sorted: oColumn.getSorted(),
				sortOrder: oColumn.getSortOrder(),
				inResult: oColumn.getInResult(),
				formatter: oColumn.getGroupHeaderFormatter()
			});
		}

		for (var i = 0; i < aTableColumns.length; i++) {
			var oColumn = aTableColumns[i];

			if (this._aGroupedColumns.indexOf(oColumn.getId()) > -1) {
				continue;
			}
			if (!oColumn instanceof AnalyticalColumn) {
				Log.error("You have to use AnalyticalColumns for the Analytical table");
			}

			aColumns.push({
				name: oColumn.getLeadingProperty(),
				visible: oColumn.getVisible(),
				grouped: oColumn.getGrouped(),
				total: oColumn.getSummed(),
				sorted: oColumn.getSorted(),
				sortOrder: oColumn.getSortOrder(),
				inResult: oColumn.getInResult(),
				formatter: oColumn.getGroupHeaderFormatter()
			});
		}

		return aColumns;
	};

	AnalyticalTable.prototype._updateRowState = function(oState) {
		var oBinding = this.getBinding("rows");
		var oBindingInfo = this.getBindingInfo("rows");
		var oNode = oState.context;

		if (!oBinding || !oNode) {
			return;
		}

		oState.context = oNode.context ? oNode.context : null; // The AnalyticalTable requests nodes from the binding.
		if (oBinding.nodeHasChildren && oBinding.nodeHasChildren(oNode)) {
			oState.type = oState.Type.GroupHeader;
		} else if (oNode.nodeState.sum) {
			oState.type = oState.Type.Summary;
		}
		oState.level = oNode.level + (oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures() ? 1 : 0);
		oState.expandable = oState.type === oState.Type.GroupHeader;
		oState.expanded = oState.expandable ? oNode.nodeState.expanded : false;
		oState.contentHidden = oState.expanded && !oBindingInfo.parameters.sumOnTop;
		oState.title = oState.type === oState.Type.GroupHeader ? oBinding.getGroupName(oNode.context, oNode.level) : "";
	};

	AnalyticalTable.prototype.onRowsUpdated = function(mParameters) {
		Table.prototype.onRowsUpdated.apply(this, arguments);

		var aRows = this.getRows();
		var oBinding = this.getBinding("rows");
		var oFirstVisibleColumn = this._getVisibleColumns()[0];

		for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
			var oRow = aRows[iRowIndex];
			var iLevel = oRow.getLevel();
			var iIndent = 0;

			iLevel -= oBinding && oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures() ? 1 : 0;
			iLevel = !oRow.isGroupHeader() && !oRow.isSummary() ? iLevel - 1 : iLevel;

			for (var j = 1; j < iLevel; j++) {
				if (j === 1) {
					iIndent = 24;
				} else if (j === 2) {
					iIndent += 12;
				} else {
					iIndent += 8;
				}
			}

			TableUtils.Grouping.setGroupIndent(oRow, iIndent);

			// show or hide the totals if not enabled - needs to be done by Table
			// control since the model could be reused and thus the values cannot
			// be cleared in the model - and the binding has no control over the
			// value mapping - this happens directly via the context!
			var aCells = oRow.getCells();
			var iCellCount = aCells.length;

			for (var iCellIndex = 0; iCellIndex < iCellCount; iCellIndex++) {
				var oAnalyticalColumn = AnalyticalColumn.ofCell(aCells[iCellIndex]);
				var bIsMeasureCell = oBinding ? oBinding.isMeasure(oAnalyticalColumn.getLeadingProperty()) : false;
				var $td = jQuery(aCells[iCellIndex].$().closest("td"));
				var bHideCellContent = false;

				if (oRow.isSummary() && bIsMeasureCell) {
					bHideCellContent = !oAnalyticalColumn.getSummed();
				} else if (oRow.isGroupHeader() && oAnalyticalColumn === oFirstVisibleColumn) {
					bHideCellContent = !bIsMeasureCell;
				}

				$td.toggleClass("sapUiTableCellHidden", bHideCellContent);
			}
		}
	};

	AnalyticalTable.prototype._onOpenTableContextMenu = function(oCellInfo, oMenu) {
		var oRow = oCellInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL) ? this.getRows()[oCellInfo.rowIndex] : null;

		if (!oRow || !oRow.isGroupHeader()) {
			this._removeGroupHeaderMenuItems(oMenu);
			return;
		}

		var oBinding = this.getBinding("rows");

		this._iGroupedLevel = oRow.getLevel() - (oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures() ? 1 : 0);
		this._addGroupHeaderMenuItems(oMenu);
	};

	AnalyticalTable.prototype._addGroupHeaderMenuItems = function(oMenu) {
		var that = this;

		function getGroupColumnInfo() {
			var iIndex = that._iGroupedLevel - 1;

			if (that._aGroupedColumns[iIndex]) {
				var oGroupedColumn = that.getColumns().filter(function(oColumn){
					return that._aGroupedColumns[iIndex] === oColumn.getId();
				})[0];

				return {
					column: oGroupedColumn,
					index: iIndex
				};
			} else {
				return undefined;
			}
		}

		if (!this._mGroupHeaderMenuItems) {
			this._mGroupHeaderMenuItems = {};
		}

		if (!this._mGroupHeaderMenuItems["visibility"]) {
			this._mGroupHeaderMenuItems["visibility"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_SHOW_COLUMN"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column,
							bShowIfGrouped = oColumn.getShowIfGrouped();
						oColumn.setShowIfGrouped(!bShowIfGrouped);

						that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type:( !bShowIfGrouped ? GroupEventType.showGroupedColumn : GroupEventType.hideGroupedColumn )});
					}
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["visibility"]);

		if (!this._mGroupHeaderMenuItems["ungroup"]) {
			this._mGroupHeaderMenuItems["ungroup"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_UNGROUP"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo && oGroupColumnInfo.column) {
						var oUngroupedColumn = oGroupColumnInfo.column;

						oUngroupedColumn.setGrouped(false);
						that.fireGroup({column: oUngroupedColumn, groupedColumns: that._aGroupedColumns, type: GroupEventType.ungroup});
					}
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["ungroup"]);

		if (!this._mGroupHeaderMenuItems["ungroupall"]) {
			this._mGroupHeaderMenuItems["ungroupall"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_UNGROUP_ALL"),
				select: function() {
					var aColumns = that.getColumns();

					that.suspendUpdateAnalyticalInfo();

					for (var i = 0; i < aColumns.length; i++) {
						aColumns[i].setGrouped(false);
					}

					that.resumeUpdateAnalyticalInfo();
					that.fireGroup({column: undefined, groupedColumns: [], type: GroupEventType.ungroupAll});
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["ungroupall"]);

		if (!this._mGroupHeaderMenuItems["moveup"]) {
			this._mGroupHeaderMenuItems["moveup"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_MOVE_UP"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						var iIndex = that._aGroupedColumns.indexOf(oColumn.getId());
						if (iIndex > 0) {
							that._aGroupedColumns[iIndex] = that._aGroupedColumns.splice(iIndex - 1, 1, that._aGroupedColumns[iIndex])[0];
							that.updateAnalyticalInfo();
							that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type: GroupEventType.moveUp});
						}
					}
				},
				icon: "sap-icon://arrow-top"
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["moveup"]);

		if (!this._mGroupHeaderMenuItems["movedown"]) {
			this._mGroupHeaderMenuItems["movedown"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_MOVE_DOWN"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						var iIndex = that._aGroupedColumns.indexOf(oColumn.getId());
						if (iIndex < that._aGroupedColumns.length) {
							that._aGroupedColumns[iIndex] = that._aGroupedColumns.splice(iIndex + 1, 1, that._aGroupedColumns[iIndex])[0];
							that.updateAnalyticalInfo();
							that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type: GroupEventType.moveDown});
						}
					}
				},
				icon: "sap-icon://arrow-bottom"
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["movedown"]);

		if (!this._mGroupHeaderMenuItems["sortasc"]) {
			this._mGroupHeaderMenuItems["sortasc"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_SORT_ASC"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						oColumn.sort(false); //update Analytical Info triggered by aftersort in column
					}
				},
				icon: "sap-icon://up"
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["sortasc"]);

		if (!this._mGroupHeaderMenuItems["sortdesc"]) {
			this._mGroupHeaderMenuItems["sortdesc"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_SORT_DESC"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						oColumn.sort(true); //update Analytical Info triggered by aftersort in column
					}
				},
				icon: "sap-icon://down"
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["sortdesc"]);

		if (!this._mGroupHeaderMenuItems["collapse"]) {
			this._mGroupHeaderMenuItems["collapse"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"),
				select: function() {
					// Why -1? Because the "Collapse Level" Menu Entry should collapse TO the given level - 1
					// So collapsing level 1 means actually all nodes up TO level 0 will be collapsed.
					// Potential negative values are handled by the binding.
					that.getBinding("rows").collapseToLevel(that._iGroupedLevel - 1);
					that.setFirstVisibleRow(0); //scroll to top after collapsing (so no rows vanish)
					that._getSelectionPlugin().clearSelection();
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["collapse"]);

		if (!this._mGroupHeaderMenuItems["collapseall"]) {
			this._mGroupHeaderMenuItems["collapseall"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_COLLAPSE_ALL"),
				select: function() {
					that.getBinding("rows").collapseToLevel(0);
					that.setFirstVisibleRow(0); //scroll to top after collapsing (so no rows vanish)
					that._getSelectionPlugin().clearSelection();
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["collapseall"]);

		if (!this._mGroupHeaderMenuItems["expand"]) {
			this._mGroupHeaderMenuItems["expand"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_EXPAND_LEVEL"),
				select: function() {
					that.getBinding("rows").expandToLevel(that._iGroupedLevel);
					that.setFirstVisibleRow(0);
					that._getSelectionPlugin().clearSelection();
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["expand"]);

		if (!this._mGroupHeaderMenuItems["expandall"]) {
			this._mGroupHeaderMenuItems["expandall"] = new MenuItem({
				text: TableUtils.getResourceText("TBL_EXPAND_ALL"),
				select: function() {
					that.expandAll();
				}
			});
		}
		oMenu.addItem(this._mGroupHeaderMenuItems["expandall"]);

		var oGroupColumnInfo = getGroupColumnInfo();
		if (oGroupColumnInfo) {
			var oColumn = oGroupColumnInfo.column;
			if (oColumn.getShowIfGrouped()) {
				this._mGroupHeaderMenuItems["visibility"].setText(TableUtils.getResourceText("TBL_HIDE_COLUMN"));
			} else {
				this._mGroupHeaderMenuItems["visibility"].setText(TableUtils.getResourceText("TBL_SHOW_COLUMN"));
			}
			this._mGroupHeaderMenuItems["moveup"].setEnabled(oGroupColumnInfo.index > 0);
			this._mGroupHeaderMenuItems["movedown"].setEnabled(oGroupColumnInfo.index < this._aGroupedColumns.length - 1);
		} else {
			this._mGroupHeaderMenuItems["moveup"].setEnabled(true);
			this._mGroupHeaderMenuItems["movedown"].setEnabled(true);
		}
	};

	AnalyticalTable.prototype._removeGroupHeaderMenuItems = function(oMenu) {
		if (!this._mGroupHeaderMenuItems) {
			return;
		}

		for (var sItemKey in this._mGroupHeaderMenuItems) {
			oMenu.removeItem(this._mGroupHeaderMenuItems[sItemKey]);
		}
	};

	AnalyticalTable.prototype._cleanupGroupHeaderMenuItems = function() {
		for (var sItemKey in this._mGroupHeaderMenuItems) {
			this._mGroupHeaderMenuItems[sItemKey].destroy();
		}
		this._mGroupHeaderMenuItems = null;
	};

	/**
	 * Returns the context of a row by its index.
	 *
	 * @param {int} iIndex
	 *         Index of the row to return the context from.
	 * @returns {object} The context of a row by its index
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	AnalyticalTable.prototype.getContextByIndex = function(iIndex) {
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getContextByIndex(iIndex) : null;
	};

	AnalyticalTable.prototype.getContextInfoByIndex = function(iIndex) {
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getNodeByIndex(iIndex) : null;
	};

	/**
	 * This function is used by some composite controls to avoid updating the AnalyticalInfo when several column are added to the table.
	 * In order to finally update the AnalyticalInfo and request data, resumeUpdateAnalyticalInfo must be called.
	 * @protected
	 */
	AnalyticalTable.prototype.suspendUpdateAnalyticalInfo = function() {
		this._bSuspendUpdateAnalyticalInfo = true;
	};

	/**
	 * This function is used by some composite controls to force updating the AnalyticalInfo
	 * @param {boolean} bSuppressRefresh binding shall not refresh data
	 * @param {boolean} bForceChange forces the binding to fire a change event
	 * @protected
	 */
	AnalyticalTable.prototype.resumeUpdateAnalyticalInfo = function(bSuppressRefresh, bForceChange) {
		this._bSuspendUpdateAnalyticalInfo = false;
		// the binding needs to fire a change event to force the table to request new contexts
		// only if the callee explicitly don't request a change event, it can be omitted.
		this._updateColumns(bSuppressRefresh, bForceChange);
	};

	AnalyticalTable.prototype.addColumn = function(vColumn, bSuppressInvalidate) {
		//@TODO: Implement addColumn(Column[] || oColumn)
		var oColumn = this._getColumn(vColumn);
		if (oColumn.getGrouped()) {
			this._addGroupedColumn(oColumn.getId());
		}
		Table.prototype.addColumn.call(this, oColumn, bSuppressInvalidate);

		this._updateColumns(bSuppressInvalidate);
		return this;
	};

	AnalyticalTable.prototype.insertColumn = function(vColumn, iIndex, bSuppressInvalidate) {
		var oColumn = this._getColumn(vColumn);
		if (oColumn.getGrouped()) {
			this._addGroupedColumn(oColumn.getId());
		}
		Table.prototype.insertColumn.call(this, oColumn, iIndex, bSuppressInvalidate);
		this._updateColumns(bSuppressInvalidate);
		return this;
	};

	AnalyticalTable.prototype.removeColumn = function(vColumn, bSuppressInvalidate) {
		var oResult = Table.prototype.removeColumn.apply(this, arguments);

		// only remove from grouped columns if not caused by column move.
		if (!this._bReorderInProcess) {
			this._aGroupedColumns = jQuery.grep(this._aGroupedColumns, function(sValue) {
				//check if vColum is an object with getId function
				if (vColumn.getId) {
					return sValue != vColumn.getId();
				} else {
					return sValue == vColumn;
				}
			});
		}

		this.updateAnalyticalInfo(bSuppressInvalidate);

		return oResult;
	};

	AnalyticalTable.prototype.removeAllColumns = function(bSuppressInvalidate) {
		this._aGroupedColumns = [];
		var aResult = Table.prototype.removeAllColumns.apply(this, arguments);

		this._updateColumns(bSuppressInvalidate);

		return aResult;
	};

	AnalyticalTable.prototype._getColumn = function(vColumn) {
		if (typeof vColumn === "string") {
			var oColumn =  new AnalyticalColumn({
				leadingProperty: vColumn,
				template: vColumn,
				managed: true
			});
			return oColumn;
		} else if (vColumn instanceof AnalyticalColumn) {
			return vColumn;
		} else {
			throw new Error("Wrong column type. You need to define a string (property) or pass an AnalyticalColumnObject");
		}
	};

	AnalyticalTable.prototype._updateColumns = function(bSuppressRefresh, bForceChange) {
		if (!this._bSuspendUpdateAnalyticalInfo) {
			this._updateTableColumnDetails();
			this.updateAnalyticalInfo(bSuppressRefresh, bForceChange);

			if (this.bOutput) {
				// If the table was already rendered if the column information has been updated, it needs to be invalidated. The necessity to render
				// certain columns might have changed.
				this.invalidate();
			}
		}
	};

	AnalyticalTable.prototype.updateAnalyticalInfo = function(bSuppressRefresh, bForceChange) {
		if (this._bSuspendUpdateAnalyticalInfo) {
			return;
		}

		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var aColumnInfo = this._getColumnInformation();
			var iNumberOfExpandedLevels = oBinding.getNumberOfExpandedLevels() || 0;

			// The binding does not support the number of expanded levels to be bigger than the number of grouped columns.
			if (iNumberOfExpandedLevels > this._aGroupedColumns.length) {
				oBinding.setNumberOfExpandedLevels(0);
			}

			oBinding.updateAnalyticalInfo(aColumnInfo, bForceChange);
			this._updateTotalRow(bSuppressRefresh);

			// An update of the contexts must be initiated manually.
			if (!bSuppressRefresh) {
				this._getRowContexts();
			}
		}
	};

	AnalyticalTable.prototype.refreshRows = function() {
		Table.prototype.refreshRows.apply(this, arguments);
		// make sure we have a sum row displayed if necessary
		// check is performed after the metadata was loaded
		this._updateTotalRow();
	};

	AnalyticalTable.prototype._updateTotalRow = function(bSuppressInvalidate) {
		var oBinding = this.getBinding("rows");
		var iNewFixedBottomRowCount = 0;
		var oRowMode = this.getRowMode();

		if (oBinding && (oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures())) {
			iNewFixedBottomRowCount = 1;
		}

		if (oRowMode) {
			oRowMode.setProperty("fixedBottomRowCount", iNewFixedBottomRowCount, bSuppressInvalidate);
		} else {
			this.setProperty("fixedBottomRowCount", iNewFixedBottomRowCount, bSuppressInvalidate);
		}
	};

	AnalyticalTable.prototype._updateTableColumnDetails = function() {
		if (this._bSuspendUpdateAnalyticalInfo) {
			return;
		}

		var oBinding = this.getBinding("rows"),
			oResult = oBinding && oBinding.getAnalyticalQueryResult();

		if (oResult) {
			var aColumns = this.getColumns(),
				aGroupedDimensions = [],
				aUngroupedDimensions = [],
				aDimensions = [],
				oDimensionIndex = {},
				oColumn,
				oDimension;

			// calculate an index of all dimensions and their columns. Grouping is done per dimension.
			for (var i = 0; i < aColumns.length; i++) {
				oColumn = aColumns[i];
				oColumn._isLastGroupableLeft = false;
				oColumn._bLastGroupAndGrouped = false;
				oColumn._bDependendGrouped = false;

				// ignore invisible columns
				if (!oColumn.getVisible()) {
					continue;
				}

				var sLeadingProperty = oColumn.getLeadingProperty();
				oDimension = oResult.findDimensionByPropertyName(sLeadingProperty);

				if (oDimension) {
					var sDimensionName = oDimension.getName();
					if (!oDimensionIndex[sDimensionName]) {
						oDimensionIndex[sDimensionName] = {dimension: oDimension, columns: [oColumn]};
					} else {
						oDimensionIndex[sDimensionName].columns.push(oColumn);
					}

					// if one column of a dimension is grouped, the dimension is considered as grouped.
					// all columns which are not explicitly grouped will be flagged as dependendGrouped in the next step
					if (oColumn.getGrouped() && aGroupedDimensions.indexOf(sDimensionName) == -1) {
						aGroupedDimensions.push(sDimensionName);
					}

					if (aDimensions.indexOf(sDimensionName) == -1) {
						aDimensions.push(sDimensionName);
					}
				}
			}

			aUngroupedDimensions = jQuery.grep(aDimensions, function(s) {
				return aGroupedDimensions.indexOf(aGroupedDimensions, s) == -1;
			});

			// for all grouped dimensions
			if (aGroupedDimensions.length > 0) {
				// calculate and flag the dependendly grouped columns of the dimension
				jQuery.each(aGroupedDimensions, function(i, s) {
					jQuery.each(oDimensionIndex[s].columns, function(j, o) {
						if (!o.getGrouped()) {
							o._bDependendGrouped = true;
						}
					});
				});

				// if there is only one dimension left, their columns must remain visible even though they are grouped.
				// this behavior is controlled by the flag _bLastGroupAndGrouped
				if (aGroupedDimensions.length == aDimensions.length) {
					oDimension = oResult.findDimensionByPropertyName(sap.ui.getCore().byId(this._aGroupedColumns[this._aGroupedColumns.length - 1]).getLeadingProperty());
					var aGroupedDimensionColumns = oDimensionIndex[oDimension.getName()].columns;
					jQuery.each(aGroupedDimensionColumns, function(i, o) {
						o._bLastGroupAndGrouped = true;
					});
				}
			}

			if (aUngroupedDimensions.length == 1) {
				jQuery.each(oDimensionIndex[aUngroupedDimensions[0]].columns, function(j, o) {
					o._isLastGroupableLeft = true;
				});
			}
		}
	};

	AnalyticalTable.prototype._getFirstMeasureColumnIndex = function() {
		var oBinding = this.getBinding("rows"),
			oResultSet = oBinding && oBinding.getAnalyticalQueryResult(),
			aColumns = this._getVisibleColumns();

		if (!oResultSet) {
			return -1;
		}

		for (var i = 0; i < aColumns.length; i++) {
			var oColumn = aColumns[i],
				sLeadingProperty = oColumn.getLeadingProperty();

			if (oResultSet.findMeasureByName(sLeadingProperty) || oResultSet.findMeasureByPropertyName(sLeadingProperty)) {
				return i;
			}
		}
	};

	/**
	 * Returns the total size of the data entries.
	 *
	 * @returns {int} The total size of the data entries
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	AnalyticalTable.prototype.getTotalSize = function() {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return oBinding.getTotalSize();
		}
		return 0;
	};

	AnalyticalTable.prototype._onPersoApplied = function() {
		Table.prototype._onPersoApplied.apply(this, arguments);
		this._aGroupedColumns = [];
		var aColumns = this.getColumns();
		for (var i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getGrouped()) {
				this._addGroupedColumn(aColumns[i].getId());
			}
		}
		this._updateColumns();
	};

	AnalyticalTable.prototype._addGroupedColumn = function(sColumnId) {
		if (this._aGroupedColumns.indexOf(sColumnId) === -1) {
			this._aGroupedColumns.push(sColumnId);
		}
	};

	AnalyticalTable.prototype._removeGroupedColumn = function(sColumnId) {
		var iIndex = this._aGroupedColumns.indexOf(sColumnId);

		if (iIndex >= 0) {
			this._aGroupedColumns.splice(iIndex, 1);
		}
	};

	AnalyticalTable.prototype.getGroupedColumns = function() {
		return this._aGroupedColumns;
	};

	/*
	 * Sets the node hierarchy to collapse recursive. When set to true, all child nodes will get collapsed as well.
	 * This setting has only effect when the binding is already initialized.
	 * @param {boolean} bCollapseRecursive
	 */
	AnalyticalTable.prototype.setCollapseRecursive = function(bCollapseRecursive) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			assert(oBinding.setCollapseRecursive, "Collapse Recursive is not supported by the used binding");
			if (oBinding.setCollapseRecursive) {
				oBinding.setCollapseRecursive(bCollapseRecursive);
			}
		}
		this.setProperty("collapseRecursive", !!bCollapseRecursive, true);
		return this;
	};

	/* *************************************************
	 *              Selection of Table Rows            *
	 ***************************************************/

	/**
	 * Checks if the row at the given index is selected.
	 *
	 * @param {int} iRowIndex The row index for which the selection state should be retrieved
	 * @returns {boolean} true if the index is selected, false otherwise
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#isIndexSelected
	 */

	/**
	 * In an <code>AnalyticalTable</code> control you can only select indices, which correspond to the currently visualized tree.
	 * Invisible nodes (e.g. collapsed child nodes) cannot be selected via Index, because they do not
	 * correspond to an <code>AnalyticalTable</code> row.
	 *
	 * @param {int} iRowIndex The row index which will be selected (in case it exists)
	 * @returns {sap.ui.table.AnalyticalTable} a reference to the <code>AnalyticalTable</code> control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#setSelectedIndex
	 */

	/**
	 * Returns an array containing the row indices of all selected tree nodes (in ascending order).
	 *
	 * Please be aware of the following:
	 * Due to performance/network traffic reasons, the getSelectedIndices function returns only all indices
	 * of actually selected rows/tree nodes. Unknown rows/nodes (as in "not yet loaded" to the client), will not be
	 * returned.
	 *
	 * @returns {int[]} an array containing all selected indices
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#getSelectedIndices
	 */

	/**
	 * Sets the selection of the <code>AnalyticalTable</code> control to the given range (including boundaries).
	 *
	 * <b>Note:</b> The previous selection will be lost/overridden. If this is not the required behavior,
	 * please use <code>addSelectionInterval</code> and <code>removeSelectionInterval</code>.
	 *
	 * @param {int} iFromIndex the start index of the selection range
	 * @param {int} iToIndex the end index of the selection range
	 * @returns {sap.ui.table.AnalyticalTable} a reference to the <code>AnalyticalTable</code> control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#setSelectionInterval
	 */

	/**
	 * Marks a range of tree nodes as selected, starting with iFromIndex going to iToIndex.
	 * The nodes are referenced via their absolute row index.
	 * Please be aware that the absolute row index only applies to the tree which is visualized by the <code>AnalyticalTable</code> control.
	 * Invisible nodes (collapsed child nodes) will not be taken into account.
	 *
	 * Please also take notice of the fact, that "addSelectionInterval" does not change any other selection.
	 * To override the current selection, please use "setSelctionInterval" or for a single entry use "setSelectedIndex".
	 *
	 * @param {int} iFromIndex The starting index of the range which will be selected.
	 * @param {int} iToIndex The starting index of the range which will be selected.
	 * @returns {sap.ui.table.AnalyticalTable} a reference to the <code>AnalyticalTable</code> control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#addSelectionInterval
	 */

	/**
	 * All rows/tree nodes inside the range (including boundaries) will be deselected.
	 * The nodes are referenced with their absolute row index.
	 * Please be aware that the absolute row index only applies to the tree which is visualized by the <code>AnalyticalTable</code> control.
	 * Invisible nodes (collapsed child nodes) will not be taken into account.
	 *
	 * @param {int} iFromIndex The starting index of the range which will be deselected.
	 * @param {int} iToIndex The starting index of the range which will be deselected.
	 * @returns {sap.ui.table.AnalyticalTable} a reference to the <code>AnalyticalTable</code> control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#removeSelectionInterval
	 */

	/**
	 * Selects all available nodes/rows.
	 *
	 * Explanation of the SelectAll function and what to expect from its behavior:
	 * All rows/nodes stored locally on the client are selected.
	 * In addition all subsequent rows/tree nodes, which will be paged into view are also immediately selected.
	 * However, due to obvious performance/network traffic reasons, the SelectAll function will NOT retrieve any data from the backend.
	 *
	 * @returns {sap.ui.table.AnalyticalTable} a reference to the <code>AnalyticalTable</code> control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#selectAll
	 */

	/**
	 * Retrieves the lead selection index. The lead selection index is, among other things, used to determine the
	 * start/end of a selection range, when using Shift-Click to select multiple entries at once.
	 *
	 * @returns {int[]} an array containing all selected indices (ascending ordered integers)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 * @name sap.ui.table.AnalyticalTable#getSelectedIndex
	 */

	/**
	 * Expands one or more rows.
	 *
	 * @param {int|int[]} vRowIndex A single index or an array of indices of the rows to be expanded
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 */
	AnalyticalTable.prototype.expand = TreeTable.prototype.expand;

	/**
	 * Collapses one or more rows.
	 *
	 * @param {int|int[]} vRowIndex A single index, or an array of indices of the rows to be collapsed
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 */
	AnalyticalTable.prototype.collapse = TreeTable.prototype.collapse;

	/**
	 * Expands all nodes. The current selection is removed, and the table scrolls back to the top.
	 * If this method is called, not all groups might be loaded. If the user then scrolls to the bottom of the table,
	 * additional groups are loaded, which increases the scroll range, and the scroll thumb moves up.
	 *
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.70
	 */
	AnalyticalTable.prototype.expandAll = function() {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			oBinding.expandToLevel(this._aGroupedColumns.length);
			this.setFirstVisibleRow(0);
			this._getSelectionPlugin().clearSelection();
		}
		return this;
	};

	/**
	 * Collapses all nodes (and their child nodes if collapseRecursive is activated).
	 *
	 * @returns {sap.ui.table.AnalyticalTable} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 */
	AnalyticalTable.prototype.collapseAll = TreeTable.prototype.collapseAll;

	/**
	 * Checks whether the row is expanded or collapsed.
	 *
	 * @param {int} iRowIndex The index of the row to be checked
	 * @returns {boolean} <code>true</code> if the row is expanded, <code>false</code> if it is collapsed
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @function
	 */
	AnalyticalTable.prototype.isExpanded = TreeTable.prototype.isExpanded;

	/**
	 * Returns the current analytical information of the given row or <code>null</code> if no information is available
	 * (for example, if the table is not bound or the given row has no binding context).
	 *
	 * The returned object provides the following information:
	 * <ul>
	 * <li><code>grandTotal</code> of type <code>boolean</code> Indicates whether the row is the grand total row</li>
	 * <li><code>group</code> of type <code>boolean</code> Indicates whether the row is a group header</li>
	 * <li><code>groupTotal</code> of type <code>boolean</code> Indicates whether the row is a totals row of a group</li>
	 * <li><code>level</code> of type <code>integer</code> Level information (<code>-1</code> if no level information is available)</li>
	 * <li><code>context</code> of type <code>sap.ui.model.Context</code> The binding context of the row</li>
	 * <li><code>groupedColumns</code> of type <code>string[]</code> IDs of the grouped columns (only available for <code>group</code> and
	 * <code>groupTotal</code>)</li>
	 * </ul>
	 *
	 * @param {sap.ui.table.Row} oRow The row for which the analytical information is returned
	 * @returns {object | null} The analytical information of the given row
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	AnalyticalTable.prototype.getAnalyticalInfoOfRow = function(oRow) {
		var oBinding = this.getBinding("rows");
		var oContext = oRow ? oRow.getRowBindingContext() : null;

		if (!TableUtils.isA(oRow, "sap.ui.table.Row") || oRow.getParent() !== this || !oBinding || !oContext) {
			return null;
		}

		var bIsGrandTotal = oContext === oBinding.getGrandTotalContext();
		var oContextInfo = null;
		var iLevel = -1;
		if (bIsGrandTotal) {
			oContextInfo = oBinding.getGrandTotalContextInfo();
			iLevel = 0;
		} else {
			oContextInfo = this.getContextInfoByIndex(oRow.getIndex());
			if (oContextInfo) {
				iLevel = oContextInfo.level;
			}
		}

		var bIsGroup = oContextInfo && oBinding.nodeHasChildren && oBinding.nodeHasChildren(oContextInfo);
		var bIsGroupTotal = !bIsGroup && !bIsGrandTotal && oContextInfo && oContextInfo.nodeState && oContextInfo.nodeState.sum;

		var aGroupedColumns = [];

		if (bIsGroupTotal || bIsGroup) {
			var aAllGroupedColumns = this.getGroupedColumns();
			if (aAllGroupedColumns.length > 0 && iLevel > 0 && iLevel <= aAllGroupedColumns.length) {
				for (var i = 0; i < iLevel; i++) {
					aGroupedColumns.push(aAllGroupedColumns[i]);
				}
			}
		}

		return {
			grandTotal: bIsGrandTotal, // Whether the row is a grand total row
			group: bIsGroup, // Whether the row is a group row
			groupTotal: bIsGroupTotal, // Whether the row is a sum row belonging to a group
			level: iLevel, // The level
			context: oContext, // The row binding context
			groupedColumns: aGroupedColumns // relevant columns (ids) for grouping (group and groupTotal only)
		};
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalTable.prototype.setRowMode = function(oRowMode) {
		Table.prototype.setRowMode.apply(this, arguments);
		this._getRowMode().disableFixedRows(); // The AnalyticalTable does not support fixed top rows and manages the fixed bottom rows itself.
	};

	AnalyticalTable.prototype._initLegacyRowMode = function(oRowMode) {
		Table.prototype._initLegacyRowMode.apply(this, arguments);
		this._getRowMode().disableFixedRows(); // The AnalyticalTable does not support fixed top rows and manages the fixed bottom rows itself.
	};

	AnalyticalTable.prototype._createLegacySelectionPlugin = function() {
		return new BindingSelectionPlugin();
	};

	return AnalyticalTable;

});