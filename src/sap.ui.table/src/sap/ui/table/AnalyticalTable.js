/*!
 * ${copyright}
 */

// Provides control sap.ui.table.AnalyticalTable.
sap.ui.define(['jquery.sap.global', 'sap/ui/model/analytics/TreeBindingAdapter', './AnalyticalColumn', './Table', './library', 'sap/ui/model/analytics/ODataModelAdapter'],
	function(jQuery, TreeBindingAdapter, AnalyticalColumn, Table, library, ODataModelAdapter) {
	"use strict";



	/**
	 * Constructor for a new AnalyticalTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Table which handles analytical OData backends
	 * @extends sap.ui.table.Table
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.21.
	 * The AnalyticalTable will be productized soon.
	 * @alias sap.ui.table.AnalyticalTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalyticalTable = Table.extend("sap.ui.table.AnalyticalTable", /** @lends sap.ui.table.AnalyticalTable.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Specifies if the total values should be displayed in the group headers or on bottom of the row. Does not affact the total sum.
			 */
			sumOnTop : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Number of levels, which should be opened initially (on first load of data).
			 */
			numberOfExpandedLevels : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Functions which is used to sort the column visibility menu entries e.g.: function(ColumnA, ColumnB) { return 0 = equals, <0 lower, >0 greater }; Other values than functions will be ignored.
			 */
			columnVisibilityMenuSorter : {type : "any", group : "Appearance", defaultValue : null},

			/**
			 * If dirty the content of the Table will be overlayed.
			 * @deprecated Since version 1.21.2.
			 * Please use setShowOverlay instead.
			 */
			dirty : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true}
		}
	}});


	// =====================================================================
	// WE START WITH A COPY OF THE TREETABLE AND REFACTOR THE CODING!
	// =====================================================================


	/**
	 * Initialization of the AnalyticalTable control
	 * @private
	 */
	AnalyticalTable.prototype.init = function() {
		Table.prototype.init.apply(this, arguments);

		this.addStyleClass("sapUiAnalyticalTable");

		this.attachBrowserEvent("contextmenu", this._onContextMenu);

		// defaulting properties
		this.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
		this.setShowColumnVisibilityMenu(true);
		this.setEnableColumnFreeze(true);
		this.setEnableCellFilter(true);
		this._aGroupedColumns = [];

		// adopting properties and load icon fonts for bluecrystal
		if (sap.ui.getCore().getConfiguration().getTheme() === "sap_bluecrystal") {

			// add the icon fonts
			jQuery.sap.require("sap.ui.core.IconPool");
			sap.ui.core.IconPool.insertFontFaceStyle();

			// defaulting the rowHeight -> is set via CSS
		}

		this._bBindingAttachedListener = false;

	};

	AnalyticalTable.prototype.setFixedRowCount = function() {
		jQuery.sap.log.error("The property fixedRowCount is not supported by the AnalyticalTable and must not be set!");
		return this;
	};

	AnalyticalTable.prototype.setFixedBottomRowCount = function() {
		jQuery.sap.log.error("The property fixedBottomRowCount is managed by the AnalyticalTable and must not be set!");
		return this;
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	AnalyticalTable.prototype.onAfterRendering = function() {
		Table.prototype.onAfterRendering.apply(this, arguments);
		this.$().find("[role=grid]").attr("role", "treegrid");
	};

	AnalyticalTable.prototype.setDirty = function(bDirty) {
		jQuery.sap.log.error("The property \"dirty\" is deprecated. Please use \"showOverlay\".");
		this.setProperty("dirty", bDirty, true);
		this.setShowOverlay(this.getDirty());
		return this;
	};

	AnalyticalTable.prototype.getModel = function(oModel, sName) {
		var oModel = Table.prototype.getModel.apply(this, arguments);
		// apply the ODataModelAdapter if necessary
		if (oModel && sap.ui.model.odata && oModel instanceof sap.ui.model.odata.ODataModel) {
			jQuery.sap.require("sap.ui.model.analytics.ODataModelAdapter");
			sap.ui.model.analytics.ODataModelAdapter.apply(oModel);
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

	AnalyticalTable.prototype.bindRows = function(oBindingInfo) {
		// Sanitize the arguments for API Compatibility: sName, sPath, oTemplate, oSorter, aFilters
		var oBindingInfoSanitized = this._sanitizeBindingInfo.apply(this, arguments);
		
		var vReturn = this.bindAggregation("rows", oBindingInfoSanitized);
		this._bSupressRefresh = true;
		this._updateColumns();
		this._bSupressRefresh = false;
		
		this._bBindingAttachedListener = false;
		
		return vReturn;
	};

	/**
	 * _bindAggregation is overwritten, and will be called by either ManagedObject.prototype.bindAggregation 
	 * or ManagedObject.prototype.setModel
	 */
	AnalyticalTable.prototype._bindAggregation = function(sName, sPath, oTemplate, oSorter, aFilters) {
		if (sName === "rows") {
			// make sure to reset the first visible row (currently needed for the analytical binding)
			// TODO: think about a boundary check to reset the firstvisiblerow if out of bounds
			this.setProperty("firstVisibleRow", 0, true);
			
			// The current syntax for _bindAggregation is sPath can be an object wrapping the other parameters
			// in this case we have to sanitize the parameters, so the ODataModelAdapter will instantiate the correct binding.
			this._sanitizeBindingInfo.call(this, sPath, oTemplate, oSorter, aFilters);
		}
		return Table.prototype._bindAggregation.apply(this, arguments);
	};
	
	AnalyticalTable.prototype._sanitizeBindingInfo = function (oBindingInfo) {
		var sPath,
			oTemplate,
			aSorters,
			aFilters;
		
		// Old API compatibility
		// previously the bind* functions were called in this pattern: sName, sPath, oTemplate, oSorter, aFilters
		if (typeof oBindingInfo == "string") {
			sPath = arguments[0];
			oTemplate = arguments[1];
			aSorters = arguments[2];
			aFilters = arguments[3];
			oBindingInfo = {path: sPath, sorter: aSorters, filters: aFilters};
			// allow either to pass the template or the factory function as 3rd parameter
			if (oTemplate instanceof sap.ui.base.ManagedObject) {
				oBindingInfo.template = oTemplate;
			} else if (typeof oTemplate === "function") {
				oBindingInfo.factory = oTemplate;
			}
		}
		
		// extract the sorters from the columns (TODO: reconsider this!)
		var aColumns = this.getColumns();
		for (var i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getSorted()) {
				oBindingInfo.sorter = oBindingInfo.sorter || [];
				oBindingInfo.sorter.push(new sap.ui.model.Sorter(aColumns[i].getSortProperty() || aColumns[i].getLeadingProperty(), aColumns[i].getSortOrder() === sap.ui.table.SortOrder.Descending));
			}
		}
		
		// Make sure all necessary parameters are given.
		// The ODataModelAdapter (via bindList) needs these properties to determine if an AnalyticalBinding should be instantiated.
		// This is the default for the AnalyticalTable.
		oBindingInfo.parameters = oBindingInfo.parameters || {};
		oBindingInfo.parameters.analyticalInfo = this._getColumnInformation();
		oBindingInfo.parameters.sumOnTop = this.getSumOnTop();
		oBindingInfo.parameters.numberOfExpandedLevels = this.getNumberOfExpandedLevels();
		
		// This may fail, in case the model is not yet set.
		// If this case happens, the ODataModelAdapter is added by the overriden _bindAggregation, which is called during setModel(...)
		var oModel = this.getModel(oBindingInfo.model);
		if (oModel) {
			ODataModelAdapter.apply(oModel);
		}
		
		return oBindingInfo;
	};
	
	/**
	 * @param {Boolean} bSuppressRefresh Suppress Refresh
	 * @returns {sap.ui.table.AnalyticalTable} this
	 * @private
 	 */
	AnalyticalTable.prototype._setSuppressRefresh = function (bSuppressRefresh) {
		this._bSupressRefresh = bSuppressRefresh;
		return this;
	};

	AnalyticalTable.prototype._attachBindingListener = function() {
		if (!this._bBindingAttachedListener) {
			this._bBindingAttachedListener = true;

			var oBinding = this.getBinding("rows");
			var that = this;
			// The "contextChange" event is idiosyncratic for the TreeBindingAdapter.
			// Neither the TreeBinding, nor the AnalyticalBinding know this event.
			// Also make sure, the contextChange handler is only attached once, otherwise the selection is messed up.
			if (oBinding && !oBinding.hasListeners("contextChange")) {
				oBinding.attachContextChange(function(oEvent) {
					if (!that._oSelection) {
						return;
					}
					var oParameters = oEvent.getParameters(),
						sType = oParameters.type,
						iIndex = oParameters.index,
						iLength = oParameters.length;

					if (sType === "remove") {
						that._oSelection.sliceSelectionInterval(iIndex, Math.max(iIndex, iIndex + iLength - 1));
					} else {
						that._oSelection.moveSelectionInterval(iIndex, iLength);
					}
				});
			}
		}

		Table.prototype._attachDataRequestedListeners.apply(this);
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

			if (jQuery.inArray(oColumn.getId(), this._aGroupedColumns) > -1) {
				continue;
			}
			if (!oColumn instanceof AnalyticalColumn) {
				jQuery.sap.log.error("You have to use AnalyticalColumns for the Analytical table");
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

	AnalyticalTable.prototype._updateTableContent = function() {
		Table.prototype._updateTableContent.apply(this, arguments);

		var oBinding = this.getBinding("rows"),
			iFirstRow = this.getFirstVisibleRow(),
			iFixedBottomRowCount = this.getFixedBottomRowCount(),
			iCount = this.getVisibleRowCount(),
			aCols = this.getColumns();
		
		//check if the table has columns
		if (!oBinding) {
			return;
		}
		
		var iFirstLabelWidth = 0;

		var aRows = this.getRows();
		for (var iRow = 0, l = Math.min(iCount, aRows.length); iRow < l; iRow++) {
			var bIsFixedRow = iRow > (iCount - iFixedBottomRowCount - 1) && oBinding.getLength() > iCount,
				iRowIndex = bIsFixedRow ? (oBinding.getLength() - 1 - (iCount - 1 - iRow)) : iFirstRow + iRow,
				oContextInfo = this.getContextInfoByIndex(iRowIndex),
				oRow = aRows[iRow],
				$row = oRow.$(),
				$fixedRow = oRow.$("fixed"),
				$rowHdr = this.$().find("div[data-sap-ui-rowindex=" + $row.attr("data-sap-ui-rowindex") + "]"),
				iLevel = oContextInfo ? oContextInfo.level : 0,
				iFirstThPos = 0;

				var $FirstCellLabel = $row.find(".sapUiTableTdFirst .sapUiTableCell > *");
				$FirstCellLabel.width('auto');
				// 40 is standard space between the group header content and the sum label
				iFirstLabelWidth = $FirstCellLabel.outerWidth() + 40;
				$FirstCellLabel.width('');

			if (!oContextInfo || !oContextInfo.context) {
				$row.removeAttr("data-sap-ui-level");
				$row.removeAttr('aria-level');
				$row.removeAttr('aria-expanded');
				$row.removeClass("sapUiTableGroupHeader sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");
				$fixedRow.removeAttr("data-sap-ui-level");
				$fixedRow.removeAttr('aria-level');
				$fixedRow.removeAttr('aria-expanded');
				$fixedRow.removeClass("sapUiTableGroupHeader");
				$rowHdr.html("");
				$rowHdr.removeAttr("data-sap-ui-level");
				$rowHdr.removeClass("sapUiTableGroupHeader sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");
				if (oContextInfo && !oContextInfo.context) {
					$row.addClass("sapUiAnalyticalTableDummy");
					$rowHdr.addClass("sapUiAnalyticalTableDummy");
					$rowHdr.html('<div class="sapUiAnalyticalTableLoading">' + this._oResBundle.getText("TBL_CELL_LOADING") + '</div>');
				}
				continue;
			}
			
			var iGroupHeaderBoundColumnIndex = 0;
			// If group header is expanded, we grant the whole row space
			if (oContextInfo.expanded && !this.getSumOnTop()) {
				iFirstLabelWidth = 0;
				iGroupHeaderBoundColumnIndex = this._getVisibleColumnCount() - 1;
			}
			
			// if first measure column index is not the first column, we don't need to shrink the size about the sum text
			if (this._getFirstMeasureColumnIndex() !== 0) {
				iFirstLabelWidth = 0;
			}
			
			if (iGroupHeaderBoundColumnIndex > -1) {
				var bHasRowHeader = this.getSelectionMode() !== sap.ui.table.SelectionMode.None && this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;
				var $ths = this.$().find(".sapUiTableCtrlFirstCol > th");
				if (bHasRowHeader) {
					$ths = $ths.not(":nth-child(1)");
				}
				var $firstTh = $ths.get(iGroupHeaderBoundColumnIndex);
				if (!$firstTh) {
					//it might happen, that the first TH is not defined, because the table did not yet render any columns
					//columns can be added asynchronously after the table was instantiated
					return;
				}

				if (this._bRtlMode) {
					iFirstThPos = $firstTh.getBoundingClientRect().left;
				} else {
					iFirstThPos = $firstTh.getBoundingClientRect().right;
				}
			}

			if (oBinding.indexHasChildren && oBinding.indexHasChildren(iRowIndex)) {
				// modify the rows
				$row.addClass("sapUiTableGroupHeader");
				$fixedRow.addClass("sapUiTableGroupHeader");
				
				$row.attr('aria-expanded', oContextInfo.expanded);
				$fixedRow.attr('aria-expanded', oContextInfo.expanded);
				var sGroupHeaderText = oBinding.getGroupName(oContextInfo.context, oContextInfo.level);

				var sClass = oContextInfo.expanded ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";

				if (oContextInfo.expanded && !this.getSumOnTop()) {
					$row.addClass("sapUiTableRowHidden");
					$rowHdr.addClass("sapUiTableRowHidden");
				}

				$rowHdr.html("<div class=\"sapUiTableGroupIcon " + sClass + "\" tabindex=\"-1\" title=\"" + sGroupHeaderText + "\">" + sGroupHeaderText + "</div>");
				
				$row.removeClass("sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");
				$rowHdr.removeClass("sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");
				$rowHdr.addClass("sapUiTableGroupHeader").removeAttr("title");
			} else {
				$row.attr('aria-expanded', false);
				$row.removeClass("sapUiTableGroupHeader sapUiTableRowHidden sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");

				$fixedRow.attr('aria-expanded', false);
				$fixedRow.removeClass("sapUiTableGroupHeader");

				$rowHdr.html("");
				$rowHdr.removeClass("sapUiTableGroupHeader sapUiAnalyticalTableDummy sapUiAnalyticalTableSum");

				if (oContextInfo.sum && oContextInfo.context && oContextInfo.context.getObject()) {
					$row.addClass("sapUiAnalyticalTableSum");
					$rowHdr.addClass("sapUiAnalyticalTableSum");
				}
			}
			$row.attr("data-sap-ui-level", iLevel);
			$fixedRow.attr("data-sap-ui-level", iLevel);
			$rowHdr.attr("data-sap-ui-level", iLevel);
			$row.attr('aria-level', iLevel + 1);
			$fixedRow.attr('aria-level', iLevel + 1);
			
			// Shrink GroupIcon width from left bound to right bound of first column.

			var iRowHeaderOffset, iRowHdrWidth;

			// -2 because of Border
			if (this._bRtlMode) {
				iRowHeaderOffset = $rowHdr[0].getBoundingClientRect().right;
				iRowHdrWidth = iRowHeaderOffset - iFirstThPos - iFirstLabelWidth - 2;
			} else {
				iRowHeaderOffset = $rowHdr[0].getBoundingClientRect().left;
				iRowHdrWidth = iFirstThPos - iRowHeaderOffset - iFirstLabelWidth - 2;
			}

			$rowHdr.find(".sapUiTableGroupIcon").width(iRowHdrWidth + "px");

			// show or hide the totals if not enabled - needs to be done by Table
			// control since the model could be reused and thus the values cannot
			// be cleared in the model - and the binding has no control over the
			// value mapping - this happens directly via the context!
			var aCells = oRow.getCells();
			for (var i = 0, lc = aCells.length; i < lc; i++) {
				var iCol = aCells[i].data("sap-ui-colindex");
				var oCol = aCols[iCol];
				var $td = jQuery(aCells[i].$().closest("td"));
				if (oBinding.isMeasure(oCol.getLeadingProperty())) {
					$td.addClass("sapUiTableMeasureCell");
					if (!oContextInfo.sum || oCol.getSummed()) {
						$td.removeClass("sapUiTableCellHidden");
					} else {
						$td.addClass("sapUiTableCellHidden");
					}
				} else {
					$td.removeClass("sapUiTableMeasureCell");
				}
			}
		}
	};

	AnalyticalTable.prototype.onclick = function(oEvent) {
		if (jQuery(oEvent.target).hasClass("sapUiTableGroupIcon")) {
			this._onNodeSelect(oEvent);
		} else if (jQuery(oEvent.target).hasClass("sapUiAnalyticalTableSum")) {
			// Sums cannot be selected
			oEvent.preventDefault();
			return;
		} else {
			if (Table.prototype.onclick) {
				Table.prototype.onclick.apply(this, arguments);
			}
		}
	};

	AnalyticalTable.prototype.onsapselect = function(oEvent) {
		if (jQuery(oEvent.target).hasClass("sapUiTableGroupIcon")) {
			this._onNodeSelect(oEvent);
		} else if (jQuery(oEvent.target).hasClass("sapUiAnalyticalTableSum")) {
			//Summs connot be selected
			oEvent.preventDefault();
			return;
		} else {
			var $Target = jQuery(oEvent.target),
				$TargetDIV = $Target.closest('div.sapUiTableRowHdr');
			if ($TargetDIV.hasClass('sapUiTableGroupHeader') && $TargetDIV.hasClass('sapUiTableRowHdr')) {
				var iRowIndex = this.getFirstVisibleRow() + parseInt($TargetDIV.attr("data-sap-ui-rowindex"), 10);
				var oBinding = this.getBinding("rows");
				oBinding.toggleIndex(iRowIndex);
				return;
			}
			if (Table.prototype.onsapselect) {
				Table.prototype.onsapselect.apply(this, arguments);
			}
		}
	};

	AnalyticalTable.prototype._onNodeSelect = function(oEvent) {

		var $parent = jQuery(oEvent.target).parent();
		if ($parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			oBinding.toggleIndex(iRowIndex);
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	AnalyticalTable.prototype._onContextMenu = function(oEvent) {
		if (jQuery(oEvent.target).closest('tr').hasClass('sapUiTableGroupHeader') ||
				jQuery(oEvent.target).closest('.sapUiTableRowHdr.sapUiTableGroupHeader').length > 0) {
			this._iGroupedLevel = jQuery(oEvent.target).closest('[data-sap-ui-level]').data('sap-ui-level');
			var oMenu = this._getGroupHeaderMenu();
			var eDock = sap.ui.core.Popup.Dock;
			oMenu.open(false, oEvent.target, eDock.LeftTop, eDock.LeftTop, document, (oEvent.pageX - 2) + " " + (oEvent.pageY - 2));

			oEvent.preventDefault();
			oEvent.stopPropagation();
			return;
		}

		return true;
	};

	AnalyticalTable.prototype._getGroupHeaderMenu = function() {

		var that = this;
		function getGroupColumnInfo() {
			var iIndex = that._iGroupedLevel - 1;
			if (that._aGroupedColumns[iIndex]) {
				var oGroupedColumn = that.getColumns().filter(function(oColumn){
					if (that._aGroupedColumns[iIndex] == oColumn.getId()) {
						return true;
					}
				})[0];

				return {
					column: oGroupedColumn,
					index: iIndex
				};
			}else {
				return undefined;
			}
		}

		if (!this._oGroupHeaderMenu) {
			this._oGroupHeaderMenu = new sap.ui.unified.Menu();
			this._oGroupHeaderMenuVisibilityItem = new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_SHOW_COLUMN"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column,
							bShowIfGrouped = oColumn.getShowIfGrouped();
						oColumn.setShowIfGrouped(!bShowIfGrouped);

						that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type:( !bShowIfGrouped ? sap.ui.table.GroupEventType.showGroupedColumn : sap.ui.table.GroupEventType.hideGroupedColumn )});
					}
				}
			});
			this._oGroupHeaderMenu.addItem(this._oGroupHeaderMenuVisibilityItem);
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_UNGROUP"),
				select: function() {
					var aColumns = that.getColumns(),
						iFoundGroups = 0,
						iLastGroupedIndex = -1,
						iUngroudpedIndex = -1,
						oColumn;
					for (var i = 0; i < aColumns.length; i++) {
						oColumn = aColumns[i];
						if (oColumn.getGrouped()) {
							iFoundGroups++;
							if (iFoundGroups == that._iGroupedLevel) {
								oColumn._bSkipUpdateAI = true;

								// relaying the ungrouping to the AnalyticalBinding,
								// the numberOfExpandedLevels must be reset through the TreeBindingAdapter.
								var oBinding = that.getBinding("rows");
								oBinding.setNumberOfExpandedLevels(0);
								// setGrouped(false) leads to an invalidation of the Column -> rerender
								// and this will result in new requests from the AnalyticalBinding,
								//because the initial grouping is lost (can not be restored!)
								oColumn.setGrouped(false);

								oColumn._bSkipUpdateAI = false;
								iUngroudpedIndex = i;
								that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type: sap.ui.table.GroupEventType.ungroup});
							} else {
								iLastGroupedIndex = i;
							}
						}
					}
					if (iLastGroupedIndex > -1 && iUngroudpedIndex > -1 && iUngroudpedIndex < iLastGroupedIndex) {
						var oUngroupedColumn = aColumns[iUngroudpedIndex];
						var iHeaderSpan = oUngroupedColumn.getHeaderSpan();
						if (jQuery.isArray(iHeaderSpan)) {
							iHeaderSpan = iHeaderSpan[0];
						}
						var aRemovedColumns = [];
						for (var i = iUngroudpedIndex; i < iUngroudpedIndex + iHeaderSpan; i++) {
							aRemovedColumns.push(aColumns[i]);
						}
						jQuery.each(aRemovedColumns, function(iIndex, oColumn) {
							that.removeColumn(oColumn);
							that.insertColumn(oColumn, iLastGroupedIndex);
						});
					}
					that._updateTableColumnDetails();
					that.updateAnalyticalInfo();
				}
			}));
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_UNGROUP_ALL"),
				select: function() {
					var aColumns = that.getColumns();
					for (var i = 0; i < aColumns.length; i++) {
						aColumns[i]._bSkipUpdateAI = true;

						// same as with single "ungrouping" (see above)
						var oBinding = that.getBinding("rows");
						oBinding.setNumberOfExpandedLevels(0);

						aColumns[i].setGrouped(false);
						aColumns[i]._bSkipUpdateAI = false;
					}
					that._bSupressRefresh = true;
					that._updateTableColumnDetails();
					that.updateAnalyticalInfo();
					that._bSupressRefresh = false;
					that.fireGroup({column: undefined, groupedColumns: [], type: sap.ui.table.GroupEventType.ungroupAll});
				}
			}));
			this._oGroupHeaderMoveUpItem = new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_MOVE_UP"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						var iIndex = jQuery.inArray(oColumn.getId(), that._aGroupedColumns);
						if (iIndex > 0) {
							that._aGroupedColumns[iIndex] = that._aGroupedColumns.splice(iIndex - 1, 1, that._aGroupedColumns[iIndex])[0];
							that.updateAnalyticalInfo();
							that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type: sap.ui.table.GroupEventType.moveUp});
						}
					}
				},
				icon: "sap-icon://arrow-top"
			});
			this._oGroupHeaderMenu.addItem(this._oGroupHeaderMoveUpItem);
			this._oGroupHeaderMoveDownItem = new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_MOVE_DOWN"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;
						var iIndex = jQuery.inArray(oColumn.getId(), that._aGroupedColumns);
						if (iIndex < that._aGroupedColumns.length) {
							that._aGroupedColumns[iIndex] = that._aGroupedColumns.splice(iIndex + 1, 1, that._aGroupedColumns[iIndex])[0];
							that.updateAnalyticalInfo();
							that.fireGroup({column: oColumn, groupedColumns: oColumn.getParent()._aGroupedColumns, type: sap.ui.table.GroupEventType.moveDown});
						}
					}
				},
				icon: "sap-icon://arrow-bottom"
			});
			this._oGroupHeaderMenu.addItem(this._oGroupHeaderMoveDownItem);
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_SORT_ASC"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;

						oColumn.sort(false); //update Analytical Info triggered by aftersort in column
					}
				},
				icon: "sap-icon://up"
			}));
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_SORT_DESC"),
				select: function() {
					var oGroupColumnInfo = getGroupColumnInfo();

					if (oGroupColumnInfo) {
						var oColumn = oGroupColumnInfo.column;

						oColumn.sort(true); //update Analytical Info triggered by aftersort in column
					}
				},
				icon: "sap-icon://down"
			}));
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_COLLAPSE_LEVEL"),
				select: function() {
					that.getBinding("rows").collapseAll(that._iGroupedLevel);
					that._oSelection.clearSelection();
				}
			}));
			this._oGroupHeaderMenu.addItem(new sap.ui.unified.MenuItem({
				text: this._oResBundle.getText("TBL_COLLAPSE_ALL"),
				select: function() {
					that.getBinding("rows").collapseAll();
					that._oSelection.clearSelection();
				}
			}));
		}

		var oGroupColumnInfo = getGroupColumnInfo();
		if (oGroupColumnInfo) {
			var oColumn = oGroupColumnInfo.column;
			if (oColumn.getShowIfGrouped()) {
				this._oGroupHeaderMenuVisibilityItem.setText(this._oResBundle.getText("TBL_HIDE_COLUMN"));
			} else {
				this._oGroupHeaderMenuVisibilityItem.setText(this._oResBundle.getText("TBL_SHOW_COLUMN"));
			}
			this._oGroupHeaderMoveUpItem.setEnabled(oGroupColumnInfo.index > 0);
			this._oGroupHeaderMoveDownItem.setEnabled(oGroupColumnInfo.index < this._aGroupedColumns.length - 1);
		} else {
			this._oGroupHeaderMoveUpItem.setEnabled(true);
			this._oGroupHeaderMoveDownItem.setEnabled(true);
		}

		return this._oGroupHeaderMenu;

	};

	AnalyticalTable.prototype.expand = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			oBinding.expand(iRowIndex);
		}
	};

	AnalyticalTable.prototype.collapse = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			oBinding.collapse(iRowIndex);
		}
	};

	AnalyticalTable.prototype.isExpanded = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return oBinding.isExpanded(iRowIndex);
		}
		return false;
	};

	AnalyticalTable.prototype.selectAll = function() {
		Table.prototype.selectAll.apply(this);
		var oSelMode = this.getSelectionMode();
		if (!this.getEnableSelectAll() || (oSelMode != "Multi" && oSelMode != "MultiToggle")) {
			return this;
		}
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var iLength = (oBinding.getLength() || 0);
			for (var i = 0; i < iLength; i++) {
				var oContextInfo = this.getContextInfoByIndex(i);
				if (oContextInfo.sum || oBinding.indexHasChildren(i)) {
					this._oSelection.removeSelectionInterval(i,i);
				}
			}
			this.$("selall").attr('title',this._oResBundle.getText("TBL_DESELECT_ALL")).removeClass("sapUiTableSelAll");
		}
		return this;
	};

	AnalyticalTable.prototype.getContextInfoByIndex = function(iIndex) {
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getContextInfo(iIndex) : null;
	};

	AnalyticalTable.prototype._onColumnMoved = function(oEvent) {
		Table.prototype._onColumnMoved.apply(this, arguments);
		this.updateAnalyticalInfo();
	};

	AnalyticalTable.prototype.addColumn = function(vColumn, bSuppressInvalidate) {
		var oColumn = this._getColumn(vColumn);
		if (oColumn.getGrouped()) {
			this._addGroupedColumn(oColumn.getId());
		}
		Table.prototype.addColumn.call(this, oColumn, bSuppressInvalidate);
		this._updateTableColumnDetails();
		this.updateAnalyticalInfo(bSuppressInvalidate);
		return this;
	};

	AnalyticalTable.prototype.insertColumn = function(vColumn, iIndex, bSuppressInvalidate) {
		var oColumn = this._getColumn(vColumn);
		if (oColumn.getGrouped()) {
			this._addGroupedColumn(oColumn.getId());
		}
		Table.prototype.insertColumn.call(this, oColumn, iIndex, bSuppressInvalidate);
		this._updateTableColumnDetails();
		this.updateAnalyticalInfo(bSuppressInvalidate);
		return this;
	};

	AnalyticalTable.prototype.removeColumn = function(vColumn, bSuppressInvalidate) {
		Table.prototype.removeColumn.apply(this, arguments);
		
		//TODO: Make sure vColumn is really an AnalyticalColumn instance
		this._aGroupedColumns = jQuery.grep(this._aGroupedColumns, function(sValue) {
			//check if vColum is an object with getId function
			if (vColumn.getId) {
				return sValue != vColumn.getId();
			} else {
				return sValue == vColumn;
			}
		});
		
		this.updateAnalyticalInfo(bSuppressInvalidate);

		return this;
	};

	AnalyticalTable.prototype.removeAllColumns = function(bSuppressInvalidate) {
		this._aGroupedColumns = [];
		Table.prototype.removeColumn.apply(this, arguments);
		
		this._updateTableColumnDetails();
		this.updateAnalyticalInfo(bSuppressInvalidate);

		return this;
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

	AnalyticalTable.prototype._updateColumns = function() {
		this._updateTableColumnDetails();
		this.updateAnalyticalInfo();
	};

	AnalyticalTable.prototype.updateAnalyticalInfo = function(bSupressRefresh) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var aColumnInfo = this._getColumnInformation();
			oBinding.updateAnalyticalInfo(aColumnInfo);
			this._updateTotalRow(aColumnInfo, bSupressRefresh);
			if (bSupressRefresh || this._bSupressRefresh) {
				return;
			}
			this.refreshRows();
		}
	};

	AnalyticalTable.prototype._updateTotalRow = function(aColumnInfo, bSuppressInvalidate) {

		var bHasTotal = false;
		for (var i = 0, l = aColumnInfo ? aColumnInfo.length : 0; i < l; i++) {
			if (aColumnInfo[i].visible && aColumnInfo[i].total) {
				bHasTotal = true;
				break;
			}
		}

		var oBinding = this.getBinding("rows");
		if (oBinding && (!oBinding.providesGrandTotal() || !oBinding.hasTotaledMeasures())) {
			bHasTotal = false;
		}

		var iFixedBottomRowCount = this.getFixedBottomRowCount();
		if (bHasTotal) {
			if (iFixedBottomRowCount !== 1) {
				this.setProperty("fixedBottomRowCount", 1, bSuppressInvalidate);
			}
		} else {
			if (iFixedBottomRowCount !== 0) {
				this.setProperty("fixedBottomRowCount", 0, bSuppressInvalidate);
			}
		}

	};

	AnalyticalTable.prototype._updateTableColumnDetails = function() {
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
					if (oColumn.getGrouped() && jQuery.inArray(sDimensionName, aGroupedDimensions) == -1) {
						aGroupedDimensions.push(sDimensionName);
					}

					if (jQuery.inArray(sDimensionName, aDimensions) == -1) {
						aDimensions.push(sDimensionName);
					}
				}
			}

			aUngroupedDimensions = jQuery.grep(aDimensions, function (s) {
				return (jQuery.inArray(s, aGroupedDimensions) == -1);
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
	 * @type int
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

	AnalyticalTable.prototype._hasData = function() {
		var oBinding = this.getBinding("rows"),
			iLength = oBinding && (oBinding.getLength() || 0),
			bHasTotal = oBinding && (oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures());

		if (!oBinding || (bHasTotal && iLength < 2) || (!bHasTotal && iLength === 0)) {
			return false;
		}
		return true;
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
		this._updateTableColumnDetails();
		this.updateAnalyticalInfo();
	};

	AnalyticalTable.prototype._addGroupedColumn = function(sColumn) {
		if (jQuery.inArray(sColumn, this._aGroupedColumns) < 0) {
			this._aGroupedColumns.push(sColumn);
		}
	};

    AnalyticalTable.prototype.getGroupedColumns = function () {
        return this._aGroupedColumns;
    };

	/**
	 * returns the count of rows which can ca selected when bound or 0
	 * @private
	 */
	AnalyticalTable.prototype._getSelectableRowCount = function() {
		var oBinding = this.getBinding("rows");

		if (oBinding) {
			var iCount = oBinding.getLength() || 0;

			for (var i = 0, l = iCount; i < l; i++) {
				var oContextInfo = this.getContextInfoByIndex(i);
				if (oContextInfo.sum || oBinding.indexHasChildren(i)) {
					iCount--;
				}
			}

			return iCount;
		} else {
			return 0;
		}
	};

	AnalyticalTable.prototype._isRowSelectable = function(iRowIndex) {
		return !this.getBinding("rows").indexHasChildren(iRowIndex);
	};

	return AnalyticalTable;

}, /* bExport= */ true);
