/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldValueHelpTableWrapperBase',
	"sap/ui/mdc/util/loadModules",
	"sap/base/util/deepEqual",
	"sap/ui/mdc/library",
	"sap/ui/mdc/enum/PersistenceMode",
	"sap/ui/mdc/p13n/Engine",
	'sap/ui/mdc/condition/FilterConverter',
	"sap/ui/thirdparty/jquery"
	], function(
		FieldValueHelpTableWrapperBase,
		loadModules,
		deepEqual,
		library,
		PersistenceMode,
		Engine,
		FilterConverter,
		jQuery
	) {
	"use strict";

	var SelectionMode = library.SelectionMode;

	var _mTableModules = {
		"Table": "sap/ui/mdc/field/FieldValueHelpUITableWrapper",
		"ResponsiveTable": "sap/ui/mdc/field/FieldValueHelpMTableWrapper"
	};

	/**
	 * Constructor for a new <code>FieldValueHelpMdcTableWrapper</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. This is a wrapper to use a
	 * <code>sap.ui.mdc.Table</code> control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Wrapper to use a <code>sap.m.Table</code> control as content of a <code>FieldValueHelp</code> element
	 * @extends sap.ui.mdc.field.FieldValueHelpTableWrapperBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
 	 * @experimental
	 * @since 1.88.0
	 * @alias sap.ui.mdc.field.FieldValueHelpMdcTableWrapper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpMdcTableWrapper = FieldValueHelpTableWrapperBase.extend("sap.ui.mdc.field.FieldValueHelpMdcTableWrapper", /** @lends sap.ui.mdc.field.FieldValueHelpMdcTableWrapper.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				table: {
					type: "sap.ui.mdc.Table",
					multiple: false
				}
			},
			defaultAggregation: "table"
		}
	});



	FieldValueHelpMdcTableWrapper.prototype.init = function() {
		FieldValueHelpTableWrapperBase.prototype.init.apply(this, arguments);
		this.OInnerWrapperClass = null; // wrapper class for internal table type;
	};

	FieldValueHelpMdcTableWrapper.prototype.setParent = function(oParent, sAggregationName) {
		/* MDC.Table personalization inside ValueHelps should never be persisted,
		 * therefore we add the Fieldhelp to a PersistenceProvider with transient configuration.
		 */
		if (oParent) {
			Engine.getInstance().defaultProviderRegistry.attach(oParent, PersistenceMode.Transient);
		}
		FieldValueHelpTableWrapperBase.prototype.setParent.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._getStringType = function() {
		var oTable = this.getTable();
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

	FieldValueHelpMdcTableWrapper.prototype.fieldHelpOpen = function(bSuggestion) {
		var oTable = this.getTable();
		if (oTable) {
			if (this.OInnerWrapperClass) {
				return this.OInnerWrapperClass.prototype.fieldHelpOpen.call(this, bSuggestion);
			}
		}
		return this;
	};

	FieldValueHelpMdcTableWrapper.prototype.fieldHelpClose = function() {
		this._bSearchTriggered = false;
		FieldValueHelpTableWrapperBase.prototype.fieldHelpClose.apply(this, arguments);
		return this;
	};


	/*
	* Provides a table wrapper class for dealing with specifics of mdc.tables inner table whenever the wrappers table aggregation or a given mdc.tables _content aggregation receive a new table.
	* The wrapper classes initialize method is applied to the current outer wrapper instance and cleanup is done for an eventually already existing wrapper.
	*/
	FieldValueHelpMdcTableWrapper.prototype._updateInnerWrapperClass = function () {

		var sTableType = this._getStringType();
		var sModule = _mTableModules[sTableType];

		if (sModule && this._sInnerWrapperType !== sTableType) {
			this._sInnerWrapperType = sTableType;

			if (this.OInnerWrapperClass) {
				this.OInnerWrapperClass.prototype.dispose.apply(this);
				this.OInnerWrapperClass = null;
			}

			this._oInnerWrapperClassPromise = loadModules(sModule).then(function (aModules) {
				this.OInnerWrapperClass = aModules[0];
				this.OInnerWrapperClass.prototype.initialize.apply(this);
			}.bind(this));
		}
	};

	/*
	* Adjust the tables layout depending on fields maxConditions and suggestion/dialog mode. Additionally uses inner wrapper class to adjust inner table
	*/
	FieldValueHelpMdcTableWrapper.prototype._adjustTable = function (bSuggestion) {

		var oTable = this.getTable();

		if (oTable) {

			var oParent = this.getParent();

			if (oParent) {
				oTable.setHeight("100%");
				oTable.setSelectionMode(this._getMaxConditions() === 1 ? SelectionMode.Single : SelectionMode.Multi);

				var oFieldHelp = this._getFieldHelp();
				var oFilterBar = oFieldHelp._getFilterBar();
				var bFilterChange = oFilterBar && oTable.getFilter() !== oFilterBar.getId();
				if (bFilterChange) {
					oTable.setFilter(oFilterBar);
				}

			}

			if (this.OInnerWrapperClass) {
				this.OInnerWrapperClass.prototype._adjustTable.call(this, bSuggestion);
			}
		}
	};

	FieldValueHelpMdcTableWrapper.prototype.exit = function() {
		var oParent = this.getParent();
		if (oParent) {
			Engine.getInstance().defaultProviderRegistry.detach(oParent);
		}

		this._oCurrentConditions = null;
		this._bSuggestion = null;

		if (this._oInnerWrapperClassPromise) {
			this._oInnerWrapperClassPromise = null;
		}
		if (this.OInnerWrapperClass) {
			this.OInnerWrapperClass.prototype.dispose.apply(this);
			this.OInnerWrapperClass = null;
		}

		this._sInnerWrapperType = null;
		this._bSearchTriggered = null;

		FieldValueHelpTableWrapperBase.prototype.exit.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype.isSuspended = function() {
		var oTable = this.getTable();
		var oListBinding = this.getListBinding();
		return oListBinding ? oListBinding.isSuspended() : oTable && !oTable.getAutoBindOnInit();
	};

	FieldValueHelpMdcTableWrapper.prototype.getListBinding = function() {
		var oTable = this.getTable();
		return oTable && oTable.getRowBinding();
	};

	// TODO: This is a hack to make the m.Table itemPress work as it seems to be suppressed in mdc.Table for some reason.

	var oMDCTableDelegate = {
		onmouseover: function (oEvent) {
			var oItem = jQuery(oEvent.target).control(0);
			if (oItem && oItem.isA("sap.m.ColumnListItem")) {
				oItem.setType("Active");
			}
		}
	};
	var _handleOuterDelegate = function (oTable, bAdd) {
		if (bAdd) {
			oTable.addDelegate(oMDCTableDelegate, true, this);
			return;
		}
		oTable.removeDelegate(oMDCTableDelegate);
	};

	// ------ >

	FieldValueHelpMdcTableWrapper.prototype._handleTableChanged = function (sMutation, oTable) {
		var oInnerTable;
		if (sMutation === "insert") {
			this._updateInnerWrapperClass();
			_handleOuterDelegate.call(this, oTable, true);

			oInnerTable = this._getWrappedTable();
			if (oInnerTable) {
				this._handleInnerTableChanged("insert", oInnerTable);
			}
			this._oObserver.observe(oTable, {aggregations: ["_content"]});
		} else {
			_handleOuterDelegate.call(this, oTable);
			oInnerTable = oTable._oTable; // as _getWrappedTable will not return a table right now
			if (oInnerTable) {
				this._handleInnerTableChanged(sMutation, oInnerTable);
			}
			this._oObserver.unobserve(oTable);
		}
	};

	/*
	* Hide toolbar for now
	*/
	FieldValueHelpMdcTableWrapper.prototype._handleToolbarExtensions = function (oInnerTable) {

		if (oInnerTable.mAggregations["extension"] && oInnerTable.mAggregations["extension"].length) {
			oInnerTable.getAggregation("extension").forEach(function (oExt) {
				oExt.setVisible(false);
			});
		}

		if (oInnerTable.mAggregations["headerToolbar"]) {
			var oToolbar = oInnerTable.getAggregation("headerToolbar");
			oToolbar.setVisible(false);
		}
	};

	FieldValueHelpMdcTableWrapper.prototype._handleInnerTableChanged = function (sMutation, oInnerTable) {
		if (sMutation === "insert") {
			this._updateInnerWrapperClass();
			this._handleToolbarExtensions(oInnerTable);
			this._oObserver.observe(oInnerTable, {bindings: ["rows"]});
		}

		this._oInnerWrapperClassPromise.then(function() {
			this.OInnerWrapperClass.prototype._handleTableChanged.call(this, sMutation, oInnerTable);
			this.getTable().initialized().then(function () {
				this.fireDataUpdate({contentChange: true});
			}.bind(this));
		}.bind(this));
	};

	FieldValueHelpMdcTableWrapper.prototype.applyFilters = function(aFilters, sSearch, oFilterBar) {

		var oTable = this.getTable();

		if (oTable && oFilterBar) {
			var oListBinding = this.getListBinding();
			var bListBindingSuspended = oListBinding && oListBinding.isSuspended();
			var oFieldHelp = this._getFieldHelp();

			if (oListBinding && !bListBindingSuspended && !this._bSearchTriggered) {
				var sFBSearch = oFilterBar.getSearch() || "";
				var sBindingSearch = oListBinding.mParameters.$search || "";
				var oCurrentFilterBarConditions = oFilterBar.getConditions();
				var oConditionTypes = oFieldHelp._getTypesForConditions(oCurrentFilterBarConditions);
				var oCreatedFBFilters = oCurrentFilterBarConditions && oConditionTypes && FilterConverter.createFilters(oCurrentFilterBarConditions, oConditionTypes, undefined, oFieldHelp.getCaseSensitive());
				var aFBFilters = oCreatedFBFilters ? [].concat(oCreatedFBFilters) : [];
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
				this._oTablePromise.then(function () {
					if (!this._bIsBeingDestroyed) {
						this.applyFilters(aFilters, sSearch, oFilterBar);
					}
				}.bind(this));
			}
		}
	};

	FieldValueHelpMdcTableWrapper.prototype._observeChanges = function (oChanges, bNoSelection) {

		if (oChanges.name === "_content") {
			this._handleInnerTableChanged(oChanges.mutation, oChanges.child);
		}

		if (this.OInnerWrapperClass) {
			this.OInnerWrapperClass.prototype._observeChanges.call(this, oChanges, true);
		} else {
			FieldValueHelpTableWrapperBase.prototype._observeChanges.call(this, oChanges, true);
		}
	};

	FieldValueHelpMdcTableWrapper.prototype._handleUpdateFinished = function (oEvent) {
		this._bSearchTriggered = false;
		return this.OInnerWrapperClass.prototype._handleUpdateFinished.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._handleEvents = function (oEvent) {
		if (this.OInnerWrapperClass) {
			return this.OInnerWrapperClass.prototype._handleEvents.apply(this, arguments);
		}
	};

	FieldValueHelpMdcTableWrapper.prototype._handleItemPress = function (oEvent) {
		return this.OInnerWrapperClass.prototype._handleItemPress.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._handleSelectionChange = function (oEvent) {
		var bIsTableReady = this._isTableReady();
		return this._iRunningTableSelectionUpdates || !bIsTableReady || this._bBusy ? undefined : this._fireSelectionChange.call(this, false);
	};

	FieldValueHelpMdcTableWrapper.prototype._getTableItems = function (bSelectedOnly, bNoVirtual) {
		return this.OInnerWrapperClass.prototype._getTableItems.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._modifyTableSelection = function (aItems, oItem, bSelected, iItemIndex) {
		return this.OInnerWrapperClass.prototype._modifyTableSelection.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._getDataFromItem = function (oItem, aInParameters, aOutParameters) {
		return this.OInnerWrapperClass.prototype._getDataFromItem.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._handleTableEvent = function (oEvent) {
		return this.OInnerWrapperClass.prototype._handleTableEvent.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._isTableReady = function () {

		var oTable = this._getWrappedTable();

		if (oTable && oTable._bInvalid) {
			return false;
		}

		return FieldValueHelpTableWrapperBase.prototype._isTableReady.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype._getWrappedTable = function () {
		var oTable = this.getTable();
		return oTable && oTable._oTable;
	};

	FieldValueHelpMdcTableWrapper.prototype._handleScrolling = function () {
		return this.OInnerWrapperClass.prototype._handleScrolling.apply(this, arguments);
	};

	FieldValueHelpMdcTableWrapper.prototype.getDialogContent = function() {
		if (this.OInnerWrapperClass) {
			return this.OInnerWrapperClass.prototype.getDialogContent.apply(this, arguments);
		}
	};

	FieldValueHelpMdcTableWrapper.prototype.initialize = function() {
		if (this.OInnerWrapperClass) {
			return this.OInnerWrapperClass.prototype.initialize.apply(this, arguments);
		}
	};

	FieldValueHelpMdcTableWrapper.prototype.getSuggestionContent = function() {
		return this.getTable();
	};

	return FieldValueHelpMdcTableWrapper;
});
