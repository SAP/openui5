/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/FilterableListContent',
	'sap/ui/mdc/util/loadModules',
	'sap/base/util/deepEqual',
	'sap/ui/mdc/enum/SelectType',
	'sap/ui/mdc/library',
	'sap/m/library',
	"sap/ui/table/library",
	"sap/ui/thirdparty/jquery",
	// "sap/ui/mdc/p13n/Engine",
	// "sap/ui/mdc/enum/PersistenceMode",
	'sap/ui/mdc/condition/FilterConverter',
	'sap/base/util/restricted/_throttle',
	'sap/ui/mdc/util/Common'

], function(
	FilterableListContent,
	loadModules,
	deepEqual,
	SelectType,
	library,
	mLibrary,
	uiTableLibrary,
	jQuery,
	// Engine,
	// PersistenceMode,
	FilterConverter,
	throttle,
	Common
) {
	"use strict";

	var ListMode = mLibrary.ListMode;
	var Sticky = mLibrary.Sticky;
	var MDCSelectionMode = library.SelectionMode;

	var UITableVisibleRowCountMode = uiTableLibrary.VisibleRowCountMode;
	var UITableSelectionMode = uiTableLibrary.SelectionMode;
	var UITableSelectionBehavior = uiTableLibrary.SelectionBehavior;

	var _getMDCTableType = function(oTable) {
		var sType, oType = sType = oTable && oTable.getType();
		if (!oType) {
			sType = "Table"; // back to the default behaviour
		} else if (typeof oType === "object") {
			if (oType.isA("sap.ui.mdc.table.ResponsiveTableType")) {
				sType = "ResponsiveTable";
			} else {
				sType = "Table";
			}
		}
		return sType;
	};

	var _setupTableHelper = function () {
		var oTable = this._getTable();
		var oInnerTable = oTable && oTable._oTable;
		var oListBinding = oTable.getRowBinding();

		var _getUITableSelectionHandler = function () {
			return this._oUITableSelectionPlugin || oInnerTable;
		}.bind(this);

		var _fireSelect = function (aConditions, bSelected) {
			var sMultiSelectType = bSelected ? SelectType.Add : SelectType.Remove;

			if (!bSelected && this._isSingleSelect()) {
				sMultiSelectType = SelectType.Add;
			}

			this._fireSelect({type: sMultiSelectType, conditions: aConditions});
		};


		var MDCTableHelperConfig = {
			"ResponsiveTable": {
				getListBindingInfo: function () {
					return oInnerTable && oInnerTable.getBindingInfo("items");
				},
				getItems: function () {
					return oInnerTable.getItems();
				},
				getSelectedItems: function () {
					return oInnerTable.getSelectedItems();
				},
				modifySelection: function (oItem, bSelected) {
					if (oItem.getSelected() !== bSelected) {
						oItem.setSelected(bSelected);
					}
				},
				handleItemPress: function (oEvent) {
					var oItem = oEvent.getParameter("listItem");
					if (!this.isTypeahead() || !this._isSingleSelect()) {
						oItem.setSelected(!oItem.getSelected());
					}

					var sModelName = this._getListBindingInfo().model;
					var oItemContext = oItem.getBindingContext(sModelName);
					var oValues = this._getItemFromContext(oItemContext);
					var oCondition = oValues && this._createCondition(oValues.key, oValues.description, oValues.payload);

					_fireSelect.call(this, [oCondition], oItem.getSelected());

				},
				handleSelectionChange: function (oEvent) {
					if (!this.isTypeahead() || !this._isSingleSelect()) { // single-suggestion handled in this._handleItemPress
						var oParams = oEvent.getParameters();
						var aListItems = oParams.listItems || oParams.listItem && [oParams.listItem];
						var sModelName = this._getListBindingInfo().model;
						var aConditions = aListItems.map(function (oItem) {
							var oItemContext = oItem.getBindingContext(sModelName);
							var oValues = this._getItemFromContext(oItemContext);
							return oValues && this._createCondition(oValues.key, oValues.description, oValues.payload);
						}.bind(this));
						_fireSelect.call(this, aConditions, oParams.selected);
					}
				},
				adjustTable: function () {
					var aSticky = oInnerTable.getSticky();
					if (!aSticky || aSticky.length === 0) {
						// make headers sticky
						oInnerTable.setSticky([Sticky.ColumnHeaders]);
					}
					if (this._isSingleSelect()) {
						oInnerTable.setMode(ListMode.SingleSelectLeft);
					} else {
						oInnerTable.setMode(ListMode.MultiSelect);
					}
				},
				handleScrolling: function (iIndex) {
					var oScrollDelegate = this.getScrollDelegate();
					if (oScrollDelegate) {
						oInnerTable.scrollToIndex(iIndex).catch(function (oError) {
							// TODO: Handle scroll error?
						});
						return true;
					}
				},
				handleListBinding: function () {

				}
			},
			"Table": {
				getListBindingInfo: function () {
					return oInnerTable && oInnerTable.getBindingInfo("rows");
				},
				getItems: function () {
					return oInnerTable.getRows().filter(function (oRow) {
						var oRowBindingContext = oRow.getBindingContext();
						return oRowBindingContext && oRowBindingContext.getObject();	// don't return empty rows
					});
				},
				getSelectedItems: function () {
					var aSelectedIndices = _getUITableSelectionHandler().getSelectedIndices();
					var aSelectedContexts = aSelectedIndices.reduce(function(aResult, iCurrent) {
						var oContext = oInnerTable.getContextByIndex(iCurrent);
						return oContext ? aResult.concat(oContext) : aResult;
					}, []);
					return MDCTableHelperConfig["Table"].getItems().filter(function (oRow) {
						return aSelectedContexts.indexOf(oRow.getBindingContext()) >= 0;
					});
				},
				modifySelection: function (oItem, bSelected) {
					var oContext = oItem.getBindingContext();
					var iContextIndex = MDCTableHelperConfig["Table"].getContexts().indexOf(oContext);
					var bInSelectedIndices = _getUITableSelectionHandler().getSelectedIndices().indexOf(iContextIndex) >= 0;
					if (bSelected && !bInSelectedIndices) {
						return this._isSingleSelect() ? _getUITableSelectionHandler().setSelectedIndex(iContextIndex) : _getUITableSelectionHandler().addSelectionInterval(iContextIndex,iContextIndex);
					} else if (!bSelected && bInSelectedIndices) {
						return _getUITableSelectionHandler().removeSelectionInterval(iContextIndex,iContextIndex);
					}
				},
				handleItemPress: function (oEvent) {
				},
				handleSelectionChange: function (oEvent) {

					if (this._bScrolling || this._bBusy) {
						return;
					}

					var aRowIndices = oEvent.getParameter("rowIndices"); // rowIndices are actually context indices
					var aContexts = MDCTableHelperConfig["Table"].getContexts().filter(function (oContext, iIndex) {
						return aRowIndices.indexOf(iIndex) >= 0;
					});
					var aRows = MDCTableHelperConfig["Table"].getItems().filter(function (oRow, iIndex) {
						return aContexts.indexOf(oRow.getBindingContext()) >= 0;
					});
					var aAddConditions = [], aRemoveConditions = [];
					var aSelectedRows = MDCTableHelperConfig["Table"].getSelectedItems();
					var aCurrentConditions = this.getConditions();
					aRows.forEach(function (oRow, i) {
						var bIsInSelectedConditions = this._isItemSelected(oRow, aCurrentConditions);
						var bIsRowSelected = aSelectedRows.indexOf(oRow) !== -1;
						if (bIsInSelectedConditions !== bIsRowSelected) {
							var aBucket = aSelectedRows.indexOf(oRow) !== -1 ? aAddConditions : aRemoveConditions;
							var oValues = this._getItemFromContext(oRow.getBindingContext());
							var oCondition = oValues && this._createCondition(oValues.key, oValues.description, oValues.payload);
							aBucket.push(oCondition);
						}
					}.bind(this));

					var bSingle = this._isSingleSelect();

					if (aAddConditions.length) {
						_fireSelect.call(this, aAddConditions, true);
						if (bSingle) {
							return;
						}
					}

					if (aRemoveConditions.length) {
						_fireSelect.call(this, aRemoveConditions, false);
					}
				},
				adjustTable: function () {
					var oRowMode = oInnerTable.getRowMode();
					if (!oRowMode) {
						oInnerTable.setVisibleRowCountMode(UITableVisibleRowCountMode.Auto);
						oInnerTable.setMinAutoRowCount(3);
					} else if (oRowMode.isA("sap.ui.table.rowmodes.AutoRowMode")) {
						oRowMode.setMinRowCount(3);
					}
					var sSelectionMode = this._isSingleSelect() ? UITableSelectionMode.Single : UITableSelectionMode.MultiToggle;
					oInnerTable.setSelectionBehavior(UITableSelectionBehavior.Row);
					_getUITableSelectionHandler().setSelectionMode(sSelectionMode);
				},
				handleScrolling: function (iIndex) {
					var iFirstVisibleRowIndex = oInnerTable.getFirstVisibleRow();
					if (typeof iIndex === "undefined" || iIndex < 0) {
						iIndex = iFirstVisibleRowIndex - 1;
					}
					if (iIndex >= 0 && iIndex != iFirstVisibleRowIndex) {
						oInnerTable.setFirstVisibleRow(iIndex);
						return Promise.resolve();
					}
					return false;
				},
				getContexts: function () {
					return oListBinding && oListBinding.getAllCurrentContexts();
				},
				handleListBinding: function () {
					oListBinding.attachEvent("change", this._handleUpdateFinished.bind(this));
				}
			}
		};

		return MDCTableHelperConfig[this._sTableType];
	};

	function _updateSelection () {
		if (this._oTableHelper && !this._bSelectionIsUpdating) {
			this._bSelectionIsUpdating = true;
			var aItems = this._oTableHelper.getItems();
			var aConditions = this.getConditions();
			var aModifications = [];
			for (var iId in aItems) {
				var oItem = aItems[iId];
				var bSelected = this._isItemSelected(oItem, aConditions);
				aModifications.push(this._oTableHelper.modifySelection.call(this, oItem, bSelected));
			}
			Promise.all(aModifications).then(function() {
				this._bSelectionIsUpdating = false;
			}.bind(this));
		}
	}

	var _updateSelectionThrottled = throttle(_updateSelection, 100, {leading: true});

	/**
	 * Constructor for a new <code>MDCTable</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element using a {@link sap.ui.mdc.Table}.
	 * @extends sap.ui.mdc.valuehelp.base.FilterableListContent
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.content.MDCTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MDCTable = FilterableListContent.extend("sap.ui.mdc.valuehelp.content.MDCTable", /** @lends sap.ui.mdc.valuehelp.content.MDCTable.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.IDialogContent"
			],
			properties: {
			},
			aggregations: {
				/**
				 * Table to be used in value help
				 *
				 * <b>Note:</b> Set the right selection mode (multiple selection or single selection) as it cannot be determined automatically
				 * for every case. (Maybe for multi-value {@link sap.ui.mdc.FilterField FilterField} controls only single selection from table might be wanted.)
				 */
				table: {
					type: "sap.ui.mdc.Table",
					multiple: false
				}
			},
			events: {

			},
			defaultAggregation: "table"
		}
	});

	MDCTable.prototype.init = function () {
		FilterableListContent.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			aggregations: ["table"]
		});

		this._addPromise("listBinding");
	};

	var handleListBinding = function () {
		var oListBinding = this._getTable().getRowBinding();
		if (oListBinding) {
			this._oTableHelper = _setupTableHelper.call(this);
			this._oTableHelper.handleListBinding.call(this);
			_adjustTable.call(this);
			this._resolvePromise("listBinding", oListBinding);
		}
	};

	var handleTableHeader = function () {
		if (this._oTable && !this._oTable.getHeader()) {
			this._oTable.setHeader( this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER"));
		}
	};

	MDCTable.prototype._handleConditionsUpdate = function() {
		_updateSelectionThrottled.call(this);
	};
	MDCTable.prototype._handleUpdateFinished = function (oEvent) {

		this._bScrolling = false;
		this._bSearchTriggered = false;
		_updateSelectionThrottled.call(this);
	};


	MDCTable.prototype._handleFirstVisibleRowChanged = function (oEvent) {
		this._bScrolling = true;
		_updateSelectionThrottled.call(this);
	};

	MDCTable.prototype._handleBusyStateChanged = function (oEvent) {
		this._bBusy = oEvent.getParameter("busy");
	};

	var handleInnerTable = function (oInnerTable, sMutation) {

		if (!oInnerTable) {
			return;
		}

		if (sMutation === "remove") {
			if (this._sTableType === "Table") {
				oInnerTable.detachEvent("cellClick", this._handleItemPress, this);
				oInnerTable.detachEvent("rowSelectionChange", this._handleSelectionChange, this);
				oInnerTable.detachEvent("rowsUpdated", this._handleUpdateFinished, this);
				oInnerTable.detachEvent("firstVisibleRowChanged", this._handleFirstVisibleRowChanged, this);
				oInnerTable.detachEvent("busyStateChanged", this._handleBusyStateChanged, this);
				if (this._oUITableSelectionPlugin) {
					this._oUITableSelectionPlugin.detachEvent("selectionChange", this._handleSelectionChange, this);
				}
				this._oUITableSelectionPlugin = undefined;
			} else if (this._sTableType === "ResponsiveTable") {
				oInnerTable.detachEvent("itemPress", this._handleItemPress, this);
				oInnerTable.detachEvent("selectionChange", this._handleSelectionChange, this);
				oInnerTable.detachEvent("updateFinished", this._handleUpdateFinished, this);
			}
			this._oObserver.unobserve(oInnerTable);
		} else {
			// eslint-disable-next-line no-lonely-if
			if (this._sTableType === "Table") {
				this._oObserver.observe(oInnerTable, {bindings: ["rows"], aggregations: ["plugins"]});
				oInnerTable.attachEvent("cellClick", this._handleItemPress, this);
				oInnerTable.attachEvent("rowSelectionChange", this._handleSelectionChange, this);
				oInnerTable.attachEvent("rowsUpdated", this._handleUpdateFinished, this);
				oInnerTable.attachEvent("firstVisibleRowChanged", this._handleFirstVisibleRowChanged, this);
				oInnerTable.attachEvent("busyStateChanged", this._handleBusyStateChanged, this);
				this._oUITableSelectionPlugin = oInnerTable.getPlugins().find(function (oPlugin) {
					return oPlugin.isA("sap.ui.table.plugins.SelectionPlugin");
				});
				if (this._oUITableSelectionPlugin) {
					this._oUITableSelectionPlugin.attachEvent("selectionChange", this._handleSelectionChange, this);
				}
			} else if (this._sTableType === "ResponsiveTable") {
				this._oObserver.observe(oInnerTable, {bindings: ["items"]});
				oInnerTable.attachEvent("itemPress", this._handleItemPress, this);
				oInnerTable.attachEvent("selectionChange", this._handleSelectionChange, this);
				oInnerTable.attachEvent("updateFinished", this._handleUpdateFinished, this);
			}
		}
	};

	MDCTable.prototype._handleSearch = function (oEvent) {
		var sFilterFields = this.getFilterFields();
		var oFilterBar = oEvent.getSource();
		var oConditions = oFilterBar.getInternalConditions();
		var oCondition = sFilterFields && oConditions[sFilterFields] && oConditions[sFilterFields][0];
		var sFilterValue = oCondition && oCondition.values[0];
		this.setFilterValue(sFilterValue);
	};

	MDCTable.prototype._observeChanges = function (oChanges) {

		if (["_defaultFilterBar", "filterBar"].indexOf(oChanges.name) !== -1) {
			_updateTableFilter.call(this);
		}

		if (oChanges.name === "table") { // outer table
			var oTable = oChanges.child;
			if (oChanges.mutation === "remove") {
				this._oObserver.unobserve(oTable);
				this._oTable = null;
				this._oTableHelper = null;
				this._addPromise("listBinding");
			} else {
				this._oTable = oTable;
				this._oObserver.observe(oTable, {aggregations: ["_content"]});
				this._sTableType = _getMDCTableType(oTable);
				oTable.addDelegate({ onmouseover: function (oEvent) {	// Fix m.Table itemPress
					var oItem = jQuery(oEvent.target).control(0);
					if (oItem && oItem.isA("sap.m.ColumnListItem")) {
						oItem.setType("Active");
					}
				}});
				handleInnerTable.call(this, this._oTable._oTable, "insert");
				handleListBinding.call(this);
				handleTableHeader.call(this);
				_updateTableFilter.call(this);
			}
			return;
		}

		if (oChanges.name === "_content") {	// inner table
			handleInnerTable.call(this, oChanges.child, oChanges.mutation);
			return;
		}

		if (["rows", "items"].indexOf(oChanges.name) !== -1 && oChanges.mutation === "ready") {	// inner table's binding
			handleListBinding.call(this);
			return;
		}

		if (oChanges.name === "config") {
			_adjustTable.call(this);
		}

		if (oChanges.name === "plugins") {
			this._oUITableSelectionPlugin = oChanges.mutation === "remove" || !oChanges.child.isA("sap.ui.table.plugins.SelectionPlugin") ? undefined :  oChanges.child;
			if (this._oUITableSelectionPlugin) {
				this._oUITableSelectionPlugin.attachEvent("selectionChange", this._handleSelectionChange, this);
			}
		}

		FilterableListContent.prototype._observeChanges.apply(this, arguments);
	};

	MDCTable.prototype._getTable = function () {
		return this._oTable;
	};

	function _updateTableFilter () {
		var oFilterBar = this._getPriorityFilterBar();

		if (this._oTable && oFilterBar && this._oTable.getFilter() !== oFilterBar.getId()) {
			this._oTable.setFilter(oFilterBar);
		}
	}

	function _adjustTable () {
		if (this._oTableHelper) {
			this._oTableHelper.adjustTable.call(this);
		}
	}

	MDCTable.prototype.getContent = function () {
		return this._retrievePromise("wrappedContent", function () {
			return loadModules([
				"sap/ui/layout/FixFlex",
				"sap/m/VBox",
				"sap/m/ScrollContainer"
			]).then(function(aModules) {

				var FixFlex = aModules[0];
				var VBox = aModules[1];
				var ScrollContainer = aModules[2];

				if (!this._oContentLayout) {

					this._oFilterBarVBox = new VBox(this.getId() + "-FilterBarBox", {visible: "{$this>/_filterBarVisible}"});
					this._oFilterBarVBox.addStyleClass("sapMdcValueHelpPanelFilterbar");
					this._oFilterBarVBox._oWrapper = this;
					this._oFilterBarVBox.getItems = function () {
						var oFilterBar = this._oWrapper._getPriorityFilterBar.call(this._oWrapper);
						var aItems = oFilterBar ? [oFilterBar] : [];
						return aItems;
					};

					this._oTableBox = new VBox(this.getId() + "-TB", {height: "100%"});
					this._oTableBox.addStyleClass("sapMdcValueHelpPanelTableBox");
					this._oTableBox._oWrapper = this;
					this._oTableBox.getItems = function () {
						var oTable = this._oWrapper._sTableType === "ResponsiveTable" ? this._oWrapper._oScrollContainer : this._oWrapper._oTable;
						var aItems = oTable ? [oTable] : [];
						return aItems;
					};

					this._oContentLayout = new FixFlex(this.getId() + "-FF", {minFlexSize: 200, fixContent: this._oFilterBarVBox, flexContent: this._oTableBox});

					this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
						height: "calc(100% - 0.5rem)",
						width: "100%",
						vertical: true
					});

					this._oScrollContainer._oWrapper = this;
					this._oScrollContainer.getContent = function() {
						var aContent = [];
						var oTable = this._oWrapper && this._oWrapper._oTable;
						if (oTable) {
							aContent.push(oTable);
						}
						return aContent;
					};
				}

				this.setAggregation("displayContent", this._oContentLayout);

				if (!this._getPriorityFilterBar()) {
					return this._createDefaultFilterBar().then(function () {
						this._oFilterBarVBox.invalidate(); // to rerender if FilterBar added
						return this._oContentLayout;
					}.bind(this));
				}
				return this._oContentLayout;
			}.bind(this));
		}.bind(this));
	};

	MDCTable.prototype.getListBinding = function() {
		var oTable = this.getTable();
		return oTable && oTable.getRowBinding();
	};

	MDCTable.prototype._getListBindingInfo = function () {
		return this._oTableHelper && this._oTableHelper.getListBindingInfo();
	};

	MDCTable.prototype.onShow = function () {
		if (this._oTable) {
			// check if selection mode is fine
			var sSelectionMode = FilterableListContent.prototype._isSingleSelect.apply(this) ? MDCSelectionMode.Single : MDCSelectionMode.Multi;
			if (this._oTable.getSelectionMode() === MDCSelectionMode.None) { // only set automatically if not provided from outside (and do it only once)
				this._oTable.setSelectionMode(sSelectionMode);
			}
			if (this._oTable.getSelectionMode() !== sSelectionMode) {
				throw new Error("Table selectionMode needs to be " + sSelectionMode);
			}
		}

		FilterableListContent.prototype.onShow.apply(this, arguments);
	};

	MDCTable.prototype.onHide = function () {
		this._bSearchTriggered = false;
		FilterableListContent.prototype.onHide.apply(this, arguments);
	};

	MDCTable.prototype._createFiltersFromBarConditions = function (oConditions) {
		var oConditionTypes = this._getTypesForConditions(oConditions);
		var oCreatedFBFilters = oConditions && oConditionTypes && FilterConverter.createFilters(oConditions, oConditionTypes, undefined, this.getCaseSensitive());
		return oCreatedFBFilters && [].concat(oCreatedFBFilters);
	};

	MDCTable.prototype.applyFilters = function(sSearch) { // TODO the arguments are not passed as expected.


		var oTable = this.getTable();
		var oFilterBar = this._getPriorityFilterBar();

		if (oTable && oFilterBar) {
			var oListBinding = this.getListBinding();
			var bListBindingSuspended = oListBinding && oListBinding.isSuspended();

			if (oListBinding && !bListBindingSuspended && !this._bSearchTriggered) {
				var sFBSearch = oFilterBar.getSearch() || "";
				var sBindingSearch = oListBinding.mParameters.$search || "";
				var aFBFilters = this._createFiltersFromBarConditions(oFilterBar.getConditions());
				var aBindingFilters = oListBinding.aApplicationFilters.reduce(function (aResult, oFilter) {
					return aResult.concat(oFilter._bMultiFilter ? oFilter.aFilters : oFilter);
				}, []);
				var bFiltersChanged = !deepEqual(aFBFilters, aBindingFilters);
				var bSearchChanged = sFBSearch !== sBindingSearch;
				var bTableHasOverlay = oTable._oTable && oTable._oTable.getShowOverlay && oTable._oTable.getShowOverlay();


				if (bFiltersChanged || bSearchChanged || bTableHasOverlay) {
					this._handleScrolling();
					oFilterBar.triggerSearch();
					this._bSearchTriggered = true;
				}
			}

			if (bListBindingSuspended) {
				oListBinding.resume();
			}

			if (!oListBinding && oTable.getAutoBindOnInit()) {
				this._retrievePromise("listBinding").then(function () {
					this.applyFilters(sSearch);
				}.bind(this));
			}
		}
	};

	MDCTable.prototype._handleScrolling = function (oItem) {
		return this._oTableHelper && this._oTableHelper.handleScrolling.call(this, oItem);
	};

	MDCTable.prototype.getScrollDelegate = function() {
		if (!this.isTypeahead() && this._oScrollContainer) {
			return this._oScrollContainer.getScrollDelegate();
		}
		return FilterableListContent.prototype.getScrollDelegate.apply(this, arguments);
	};

	MDCTable.prototype._handleItemPress = function (oEvent) {
		this._oTableHelper.handleItemPress.call(this, oEvent);
	};

	MDCTable.prototype._handleSelectionChange = function (oEvent) {
		if (!this._bSelectionIsUpdating) {
			this._oTableHelper.handleSelectionChange.call(this, oEvent);
		}
	};

	MDCTable.prototype.isQuickSelectSupported = function() {
		return true;
	};

	MDCTable.prototype.setParent = function(oParent) {
		FilterableListContent.prototype.setParent.apply(this, arguments);
		_adjustTable.call(this);
	};

	MDCTable.prototype._isSingleSelect = function() {

		// use selection mode of table if set
		if (this._oTable) {
			if (this._oTable.getSelectionMode() === MDCSelectionMode.Multi) {
				return false;
			} else {
				return true;
			}
		} else {
			return FilterableListContent.prototype._isSingleSelect.apply(this, arguments);
		}

	};

	MDCTable.prototype.exit = function name(params) {
		Common.cleanup(this, [
			"_oContentLayout",
			"_oFilterBarVBox",
			"_oTableBox",
			"_oResourceBundle",
			"_oScrollContainer",
			"_oTableHelper",
			"_bSelectionIsUpdating",
			"_bScrolling",
			"_bBusy",
			"_sTableType",
			"_oUITableSelectionPlugin",
			"_oTable"
		]);

		FilterableListContent.prototype.exit.apply(this, arguments);
	};

	return MDCTable;
});
