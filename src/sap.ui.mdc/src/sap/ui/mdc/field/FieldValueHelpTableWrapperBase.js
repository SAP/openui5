/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldValueHelpContentWrapperBase',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/FilterType',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterProcessor',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/strings/capitalize',
	'sap/m/library',
	'sap/base/util/deepEqual',
	'sap/base/Log',
	'sap/ui/base/SyncPromise'
	], function(
			FieldValueHelpContentWrapperBase,
			ChangeReason,
			Filter,
			FormatException,
			ParseException,
			FilterType,
			FilterOperator,
			FilterProcessor,
			ManagedObjectObserver,
			capitalize,
			mLibrary,
			deepEqual,
			Log,
			SyncPromise
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldValueHelpTableWrapperBase</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. This is an abstract wrapper to use a
	 * table/list-like control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Wrapper to use a table control as content of a <code>FieldValueHelp</code> element
	 * @extends sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @experimental As of version 1.88
	 * @since 1.88.0
	 * @alias sap.ui.mdc.field.FieldValueHelpTableWrapperBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpTableWrapperBase = FieldValueHelpContentWrapperBase.extend("sap.ui.mdc.field.FieldValueHelpTableWrapperBase", /** @lends sap.ui.mdc.field.FieldValueHelpTableWrapperBase.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				table: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			defaultAggregation: "table"
		}
	});

	FieldValueHelpTableWrapperBase.prototype.init = function() {

		FieldValueHelpContentWrapperBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["selectedItems"],
			aggregations: ["table"]
		});

		this._bTableResolved = false;
		this._oTablePromise = new Promise(function(fResolve) {
			this._oTablePromiseResolve = fResolve;
		}.bind(this));

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._oPromises = {};
		this._oTableDelegate = {/*onfocusin: this._handleTableEvent, */onsapprevious: this._handleTableEvent, onsapnext: this._handleTableEvent, cellClick: this._handleTableEvent};

		this._iRunningTableSelectionUpdates = 0;
	};

	FieldValueHelpTableWrapperBase.prototype.exit = function() {

		this._sTableWidth = null;

		this._oObserver.disconnect();
		this._oObserver = undefined;

		if (this._oTableModificationPromise) {
			this._oTableModificationPromise = null;
		}

		delete this._oTablePromise;
		delete this._oTablePromiseResolve;
		delete this._bTableResolved;

		this._iRunningTableSelectionUpdates = null;

		FieldValueHelpContentWrapperBase.prototype.exit.apply(this, arguments);
	};

	FieldValueHelpTableWrapperBase.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oTable = this._getWrappedTable();
			if (oTable && oOrigin === oTable) {
				if (oOrigin.bOutput && !this._bIsBeingDestroyed) {
					// Table changed but no UiArea found, this should not happen.
					// now invalidate parent to trigger re-rendering somehow.
					var oParent = this.getParent();
					if (oParent) {
						oParent.invalidate(this);
					}
				}
				return;
			}
		}

		FieldValueHelpContentWrapperBase.prototype.invalidate.apply(this, arguments);

	};

	FieldValueHelpTableWrapperBase.prototype.getDialogContent = function() {
		return this._getWrappedTable();
	};

	FieldValueHelpTableWrapperBase.prototype.getSuggestionContent = function() {
		return this._getWrappedTable();
	};

	FieldValueHelpTableWrapperBase.prototype.fieldHelpOpen = function(bSuggestion) {
		FieldValueHelpContentWrapperBase.prototype.fieldHelpOpen.apply(this, arguments);
		var oTable = this._getWrappedTable();
		if (oTable) {
			this._adjustTable(bSuggestion);
			this._updateSelectedItems(); // as selection mode might be changed
		}

		return this;

	};

	FieldValueHelpTableWrapperBase.prototype.fieldHelpClose = function() {
		FieldValueHelpContentWrapperBase.prototype.fieldHelpClose.apply(this, arguments);
		var oTable = this._getWrappedTable();
		if (oTable) {
			oTable.removeStyleClass("sapMListFocus");
		}

		return this;
	};

	FieldValueHelpTableWrapperBase.prototype.removeFocus = function() {
		FieldValueHelpContentWrapperBase.prototype.removeFocus.apply(this, arguments);
		var oTable = this._getWrappedTable();
		if (oTable) {
			oTable.removeStyleClass("sapMListFocus");
		}

		return this;
	};

	FieldValueHelpTableWrapperBase.prototype.navigate = function(iStep, bIsOpen) {

		var oTable = this._getWrappedTable();

		if (!this._isTableReady(oTable)) {
			if (oTable && !this._bTableResolved && !this._bNavigationDelayed) {
				this._bNavigationDelayed = true;
				this._oTablePromise.then(function () {
					this.fireNavigate({disableFocus: true});
					this._bNavigationDelayed = false;
				}.bind(this));
			}
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		var aSelectedItems = this.getSelectedItems();
		var oFirstSelectedItem = aSelectedItems && aSelectedItems[0];
		var oTableItemForFirstSelection = oFirstSelectedItem && this._getTableItemByKey(oFirstSelectedItem.key);

		if (this._getMaxConditions() !== 1) { // || (oFirstSelectedItem && !oTableItemForFirstSelection)  prevent navigation if selected item noch present in table?
			this._bShouldRebind = false;
			this.fireNavigate();
			oTable.focus();
			return;
		}

		oTable.addStyleClass("sapMListFocus"); // to show focus outline on navigated item

		var aItems = this._getTableItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;
		var bLeaveFocus = false;

		if (oTableItemForFirstSelection) {
			iSelectedIndex = aItems.indexOf(oTableItemForFirstSelection);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		var bSeachForNext;
		if (iSelectedIndex < 0) {
			iSelectedIndex = 0;
			bSeachForNext = true;
			bLeaveFocus = true;
		} else if (iSelectedIndex >= iItems - 1) {
			iSelectedIndex = iItems - 1;
			bSeachForNext = false;
		} else {
			bSeachForNext = iStep >= 0;
		}

		while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
			if (bSeachForNext) {
				iSelectedIndex++;
			} else {
				iSelectedIndex--;
			}
		}

		var oItem = aItems[iSelectedIndex];

		if (oItem) {
			var oValue = this._getDataFromItem(oItem);
			var bIsAlreadySelected = oItem === oTableItemForFirstSelection;

			if (!bIsAlreadySelected) {
				this._modifyTableSelection(aItems, oItem, true, undefined, true);
			}

			// Virtual tables should finish scrolling before navigation to make sure a rowItem using the desired context exists
			SyncPromise.resolve(this._handleScrolling(oItem)).then(function(bScrollSuccessful) {

				var sRowItemId = oItem.getId && oItem.getId();
				if (bIsAlreadySelected) {
					if (!this.getParent().isOpen()) {
						this.fireNavigate({key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters, itemId: sRowItemId, leave: bLeaveFocus});
					} else if (bLeaveFocus) {
						this.fireNavigate({key: undefined, value: undefined, condition: undefined, itemId: undefined, leave: bLeaveFocus});
					}
					return;
				}

				this._bNoTableUpdate = true;
				this.setSelectedItems([{key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters}]);
				this._bNoTableUpdate = false;
				if (!sRowItemId && oItem.isA("sap.ui.model.Context")) {
					var sRowItem = this._getTableItems(false, true).find(function (oRowControl) {
						return oRowControl.getBindingContext() === oItem;
					});
					sRowItemId = sRowItem && sRowItem.getId();
				}

				if (sRowItemId) {
					this.fireNavigate({key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters, itemId: sRowItemId, leave: bLeaveFocus});
				} else {
					this.fireNavigate({disableFocus: true}); // no item
				}
			}.bind(this));
		}
	};


	FieldValueHelpTableWrapperBase.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters, bNoRequest, bCaseSensitive) {

		return _checkTextOrKey.call(this, [vKey], ["key"], oInParameters, oOutParameters, bNoRequest, bCaseSensitive);

	};

	FieldValueHelpTableWrapperBase.prototype.getKeyForText = function(sText, oInParameters, bNoRequest, bCaseSensitive) {

		return _checkTextOrKey.call(this, [sText], ["description"], oInParameters, undefined, bNoRequest, bCaseSensitive);

	};

	FieldValueHelpTableWrapperBase.prototype.getKeyAndText = function(vKey, sText, oInParameters, oOutParameters, bCaseSensitive) {

		return _checkTextOrKey.call(this, [vKey, sText], ["key", "description"], oInParameters, oOutParameters, false, bCaseSensitive);

	};

	function _checkTextOrKey(aValues, aFields, oInParameters, oOutParameters, bNoRequest, bCaseSensitive) {

		if ((aValues[0] === null || aValues[0] === undefined || (aFields[0] === "description" && aValues[0] === "" )) && (aValues.length === 1 || !aValues[1])) { // TODO: support boolean?
			return null;
		}

		return _checkTablePending.call(this).then(function(bReady) {
			var Exception = aFields.length > 1 || aFields[0] === "description" ? ParseException : FormatException;
			var aGetFieldPath = [aFields[0] === "description" ? this._getDescriptionPath : this._getKeyPath];
			if (aFields.length > 1) {
				aGetFieldPath.push(aFields[1] === "description" ? this._getDescriptionPath : this._getKeyPath);
			}
			if (bReady && this._getKeyPath()) { // KeyPath needs to be known, if set late, wait until table Promise resolved in loadData
				var aItems = this._getTableItems();
				var oResult = _filterItems.call(this, aValues, aItems, aGetFieldPath, oInParameters, oOutParameters, Exception, bCaseSensitive);
				if (oResult) {
					return oResult;
				}
			}

			if (bNoRequest) {
				throw new Exception(this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [aValues[0]]));
			} else {
				// not in already loaded item -> ask the model
				return this.loadData(aGetFieldPath, aValues, oInParameters, oOutParameters, Exception, bCaseSensitive);
			}
		}.bind(this)).unwrap();

	}

	function _filterItems(aValues, aItems, aGetFieldPath, oInFilters, oOutFilters, Exception, bCaseSensitive) {

		var i = 0;
		var aFieldPaths = [];
		for (i = 0; i < aGetFieldPath.length; i++) {
			aFieldPaths.push(aGetFieldPath[i].call(this));
			if (!aFieldPaths[i]) {
				throw new Error("path for filter missing"); // as we cannot filter key or description without path
			}
		}

		var _getFilterValue = function(oItem, sPath) {
			var oBindingContext = oItem.isA("sap.ui.model.Context") ? oItem : oItem.getBindingContext();
			return oBindingContext.getProperty(sPath);
		};

		var oFilter;
		var aFilters = [];

		for (i = 0; i < aValues.length; i++) {
			aFilters.push(new Filter({path: aFieldPaths[i], operator: FilterOperator.EQ, value1: aValues[i], caseSensitive: bCaseSensitive}));
		}
		if (aFilters.length === 1) {
			oFilter = aFilters[0];
		} else {
			oFilter = new Filter({filters: aFilters, and: false}); // key OR description
		}

		if (oInFilters || oOutFilters) {
			aFilters = [oFilter];
			if (oInFilters) {
				aFilters.push(oInFilters);
			}
			if (oOutFilters) {
				aFilters.push(oOutFilters);
			}
			oFilter = new Filter({filters: aFilters, and: true});
		}

		var aFilteredItems = FilterProcessor.apply(aItems, oFilter, _getFilterValue);
		if (aFilteredItems.length === 1) {
			var oValue = this._getDataFromItem(aFilteredItems[0]);
			return {key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters};
		} else if (aFilteredItems.length > 1) {
			if (!bCaseSensitive) {
				// try with case sensitive search
				return _filterItems.call(this, aValues, aItems, aGetFieldPath, oInFilters, oOutFilters, Exception, true);
			}
			throw _createException.call(this, Exception, true, aValues[0]);
		}

	}

	FieldValueHelpTableWrapperBase.prototype.loadData = function (aGetFieldPath, aValues, oInParameters, oOutParameters, Exception, bCaseSensitive) {
		// provide fieldPath function as this could be set late when Table is ready

		// if already requested return existing promise. Do not request twice.
		var sFieldPath = "";
		var i = 0;
		for (i = 0; i < aGetFieldPath.length; i++) {
			sFieldPath = sFieldPath + aGetFieldPath[i].call(this);
		}
		if (this._oPromises[sFieldPath] && this._oPromises[sFieldPath][aValues[0]]) {
			return this._oPromises[sFieldPath][aValues[0]];
		}

		if (!this._oPromises[sFieldPath]) {
			this._oPromises[sFieldPath] = {};
		}

		this._oPromises[sFieldPath][aValues[0]] = new Promise(function(fResolve, fReject) {
			this._oTablePromise.then(function(oTable) {
				//FieldPath might not be set before Table was initialized -> in this case try it now
				var sOldFieldPath = sFieldPath;
				sFieldPath = "";
				for (i = 0; i < aGetFieldPath.length; i++) {
					sFieldPath = sFieldPath + aGetFieldPath[i].call(this);
				}

				if (!sFieldPath) {
					// without FieldPath filter will fail -> stop here
					fReject(new Error("missing FieldPath"));
					return;
				}
				if (sFieldPath !== sOldFieldPath) {
					if (!this._oPromises[sFieldPath]) {
						this._oPromises[sFieldPath] = {};
					}
					this._oPromises[sFieldPath][aValues[0]] = this._oPromises[sOldFieldPath][aValues[0]];
					delete this._oPromises[sOldFieldPath][aValues[0]];
				}

				var oListBinding = this.getListBinding();
				var oModel = oListBinding.getModel();
				var sPath = oListBinding.getPath();
				var oFilter;
				var oBindingContext = oListBinding.getContext();
				var aFilters = [];

				for (i = 0; i < aGetFieldPath.length; i++) {
					aFilters.push(new Filter({path: aGetFieldPath[i].call(this), operator: FilterOperator.EQ, value1: aValues[i], caseSensitive: bCaseSensitive}));
				}
				if (aFilters.length === 1) {
					oFilter = aFilters[0];
				} else {
					oFilter = new Filter({filters: aFilters, and: false}); // key OR description
				}
				aFilters = [];

				if (oInParameters) {
					// use in-parameters as additional filters
					aFilters.push(oInParameters);
				}
				if (oOutParameters) {
					// use out-parameters as additional filters (only if not already set by InParameter
					if (oInParameters) {
						var aOutFilters = oOutParameters.aFilters ? oOutParameters.aFilters : [oOutParameters];
						var aInFilters = oInParameters.aFilters ? oInParameters.aFilters : [oInParameters];
						for (i = 0; i < aOutFilters.length; i++) {
							var oOutFilter = aOutFilters[i];
							var bFound = false;
							for (var j = 0; j < aInFilters.length; j++) {
								var oInFilter = aInFilters[j];
								if (oInFilter.sPath === oOutFilter.sPath && oInFilter.oValue1 === oOutFilter.oValue1 && oInFilter.oValue2 === oOutFilter.oValue2) {
									bFound = true;
									break;
								}
							}
							if (!bFound) {
								aFilters.push(oOutFilter);
							}
						}
					} else {
						aFilters.push(oOutParameters);
					}
				}
				if (aFilters.length > 0) {
					aFilters.push(oFilter);
					oFilter = new Filter({filters: aFilters, and: true});
				}

				try {
					var oFilterListBinding = oModel.bindList(sPath, oBindingContext);
					var fnCheckData = function() {
						var aContexts = oFilterListBinding.getContexts();
						if (aContexts.length === 1) {
							var oValue = this._getDataFromContext(aContexts[0]);
							var oResult = {key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters};
							fResolve(oResult);
						} else if (aValues[0] === "" && aContexts.length === 0) {
							// nothing found for empty key -> this is not an error
							fResolve(null);
						} else {
							var oException = _createException.call(this, Exception, aContexts.length > 1, aValues[0]);
							fReject(oException);
						}

						setTimeout(function() { // as Binding might process other steps after event was fired - destroy it lazy
							oFilterListBinding.destroy();
						}, 0);
						delete this._oPromises[sFieldPath][aValues[0]];
					};

					var oDelegate = this._getDelegate();
					if (oDelegate.delegate){
						oDelegate.delegate.executeFilter(oDelegate.payload, oFilterListBinding, oFilter, fnCheckData.bind(this), 2);
					}
				} catch (oError) {
					fReject(oError);
				}
			}.bind(this));
		}.bind(this));

		return this._oPromises[sFieldPath][aValues[0]];

	};

	function _createException(Exception, bNotUnique, vValue) {

		var sError;
		if (bNotUnique) {
			sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_UNIQUE", [vValue]);
		} else {
			sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]);
		}
		var oException = new Exception(sError);
		oException._bNotUnique = bNotUnique; // TODO: better solution?
		return oException;

	}

	FieldValueHelpTableWrapperBase.prototype.getAsyncKeyText = function() {
		return true;
	};

	FieldValueHelpTableWrapperBase.prototype.applyFilters = function(aFilters, sSearch, oFilterBar) {

		var oListBinding = this.getListBinding();
		var oDelegate = this._getDelegate();

		if (!oListBinding) {
			this._oTablePromise.then(function(oTable) {
				if (!this._bIsBeingDestroyed) {
					this.applyFilters(aFilters, sSearch, oFilterBar);
				}
			}.bind(this));
			return;
		}


		var bUseFilter = true;
		var oFilterInfo;

		// TODO: Talk to Sebastian or Model guys why this does not work in this scenario (Cannot read property 'getAST' of undefined)
		try {
			oFilterInfo = oListBinding.getFilterInfo();
		} catch (error) {
			Log.info("ValueHelp-Filter: getFilterInfo threw error");
		}

		if (!aFilters) {
			aFilters = [];
		}

		if (aFilters.length === 0 && !oFilterInfo) {
			// no filter already exists and none should be set (Suggestion without In-Parameter)
			bUseFilter = false;
		}

		if (oDelegate.delegate && oDelegate.delegate.isSearchSupported(oDelegate.payload, oListBinding)){
			if (!oListBinding.isSuspended() && bUseFilter) {
				// as we trigger two changes this would result to two requests therefore we suspend the binding
				oListBinding.suspend();
			}

			sSearch = oDelegate.delegate.adjustSearch(oDelegate.payload, this._bSuggestion, sSearch);
			oDelegate.delegate.executeSearch(oDelegate.payload, oListBinding, sSearch);
			Log.info("ValueHelp-Search: " + sSearch);
		}

		if (bUseFilter) {
			oListBinding.filter(aFilters, FilterType.Application);
			Log.info("ValueHelp-Filter: " + _prettyPrintFilters.call(this, aFilters));
		}

		if (oListBinding.isSuspended()) {
			// if ListBinding is suspended resume it after filters are set
			oListBinding.resume();
		}

		//this.fireDataUpdate({contentChange: false});
	};

	FieldValueHelpTableWrapperBase.prototype.isSuspended = function() {

		var oListBinding = this.getListBinding();

		if (!oListBinding) {
			// handle non existing ListBinding as suspended. (To resume it after it is assigned)
			return true;
		}

		return oListBinding.isSuspended();

	};

	function _prettyPrintFilters(oFilter) {

		var sRes;
		if (!oFilter) {
			return "";
		}
		if (Array.isArray(oFilter)) {
			sRes = "";
			oFilter.forEach(function(oFilter, iIndex, aFilters) {
				sRes += _prettyPrintFilters.call(this, oFilter);
				if (aFilters.length - 1 != iIndex) {
					sRes += " or ";
				}
			}, this);
			return "(" + sRes + ")";
		} else if (oFilter._bMultiFilter) {
			sRes = "";
			var bAnd = oFilter.bAnd;
			oFilter.aFilters.forEach(function(oFilter, iIndex, aFilters) {
				sRes += _prettyPrintFilters.call(this, oFilter);
				if (aFilters.length - 1 != iIndex) {
					sRes += bAnd ? " and " : " or ";
				}
			}, this);
			return "(" + sRes + ")";
		} else {
			sRes = oFilter.sPath + " " + oFilter.sOperator + " '" + oFilter.oValue1 + "'";
			if (oFilter.sOperator === "BT") {
				sRes += "...'" + oFilter.oValue2 + "'";
			}
			return sRes;
		}

	}

	FieldValueHelpTableWrapperBase.prototype.clone = function(sIdSuffix, aLocalIds) {
		this._handleEvents();
		var oClone = FieldValueHelpContentWrapperBase.prototype.clone.apply(this, arguments);
		this._handleEvents(true);
		return oClone;
	};

	FieldValueHelpTableWrapperBase.prototype._observeChanges = function (oChanges) {

		if (oChanges.name === "table") {
			this._handleTableChanged.call(this, oChanges.mutation, oChanges.child);
		}

		if (oChanges.name === "selectedItems") {
			this._updateSelectedItems.call(this);
		}

	};

	FieldValueHelpTableWrapperBase.prototype._handleTableChanged = function (sMutation, oTable) {
		if (sMutation === "remove") {
			this._handleEvents();
			oTable.removeDelegate(this._oTableDelegate);
			oTable.removeStyleClass("sapMComboBoxList");
			oTable = undefined;
			this._oTablePromise = new Promise(function(fResolve) {
				this._oTablePromiseResolve = function() {
					fResolve();
					this._bTableResolved = true;
				};
			}.bind(this));
		} else {
			this._handleEvents(true);
			oTable.addDelegate(this._oTableDelegate, true, this);
			this._updateSelectedItems();

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
			}
			oTable.addStyleClass("sapMComboBoxList"); // to allow focus outline in navigation
		}

		this.fireDataUpdate({contentChange: true});

	};

	FieldValueHelpTableWrapperBase.prototype._handleModelContextChange = function (oEvent) {
		var oTable = this._getWrappedTable();

		if (this.getListBinding()) {
			this._oTablePromiseResolve(oTable);
		}
	};

	FieldValueHelpTableWrapperBase.prototype._adjustTable = function (bSuggestion) {
		var oTable = this.getTable();

		if (oTable && this.getParent()) {
			if (bSuggestion) {
				if (this._sTableWidth) {
					oTable.setWidth(this._sTableWidth);
				}
			} else if (oTable.getWidth() !== "100%") {
					this._sTableWidth = oTable.getWidth();
					oTable.setWidth("100%");
			}
		}
	};

	FieldValueHelpTableWrapperBase.prototype._fireSelectionChange = function (bItemPress) {

		var aItems = [];
		var oTable = this._getWrappedTable();
		if (oTable) {
			// first add all already selected items
			var aSelectedItems = this.getSelectedItems();
			var oTableItem;
			var oValue;
			// remove all items originating from the table
			if (aSelectedItems.length > 0) {
				var aTableItems = this._getTableItems();
				for (var n = 0; n < aTableItems.length; n++) {
					oTableItem = aTableItems[n];
					oValue = this._getDataFromItem(oTableItem);

					if (!oValue) {
						throw new Error("Key of item cannot be determined" + this);
					}
					for (var j = aSelectedItems.length - 1; j >= 0; j--) {
						var oSelectedItem = aSelectedItems[j];
						if (oSelectedItem.key === oValue.key
							&& (!oValue.inParameters || !oSelectedItem.inParameters || deepEqual(oSelectedItem.inParameters, oValue.inParameters))
							&& (!oValue.outParameters || !oSelectedItem.outParameters || deepEqual(oSelectedItem.outParameters, oValue.outParameters))) {
							aSelectedItems.splice(j, 1);
							break;
						}
					}

					if (!aSelectedItems.length) {
						break;
					}
				}
			}

			if (aSelectedItems.length > 0) {
				aItems = aSelectedItems;
			}

			// now add all currently selected table entries
			aSelectedItems = this._getTableItems(true);
			for (var i = 0; i < aSelectedItems.length; i++) {
				oTableItem = aSelectedItems[i];
				oValue = this._getDataFromItem(oTableItem);

				if (!oValue) {
					throw new Error("Key of item cannot be determined" + this);
				}

				aItems.push({
					key: oValue.key,
					description: oValue.description,
					inParameters: oValue.inParameters,
					outParameters: oValue.outParameters
				});
			}

		}

		this._bNoTableUpdate = true;
		this.setSelectedItems(aItems);
		this._bNoTableUpdate = false;
		this.fireSelectionChange({selectedItems: aItems, itemPress: bItemPress});

	};

	FieldValueHelpTableWrapperBase.prototype._handleUpdateFinished = function (oEvent) {
		if (!this.getParent()) {
			// if wrapper is not assigned to a FieldValueHelp the selection can not be updated, must be done if assigned
			return;
		}

		this._updateSelectedItems.call(this);

		if (this._bNavigate) {
			this._bNavigate = false;
			this.navigate(this._iStep);
		}

		if (oEvent.getParameter("reason") !== capitalize(ChangeReason.Filter)) {
			this.fireDataUpdate({contentChange: false});
		}
	};

	FieldValueHelpTableWrapperBase.prototype._handleBusyStateChanged = function (oEvent) {
        this._bBusy = oEvent.getParameter("busy");
    };


	FieldValueHelpTableWrapperBase.prototype._updateSelectedItems = function () {

		if (this._bNoTableUpdate) {
			return;
		}

		var aTableModifications = [];

		var oTable = this._getWrappedTable();
		if (this._isTableReady(oTable) && this._getKeyPath()) { //only if KeyPath already set key can be determined to select items
			// get all currently selected items
			var aSelectedItems = this.getSelectedItems();
			var aTableItems = this._getTableItems();
			var bUpdate = false;

			this._iRunningTableSelectionUpdates = this._iRunningTableSelectionUpdates + 1 || 1;

			for (var j = 0; j < aTableItems.length; j++) {
				var oTableItem = aTableItems[j];
				if (oTableItem) {
					var bSelected = false;
					if (aSelectedItems.length > 0) {
						var oValue = this._getDataFromItem(oTableItem);
						for (var i = 0; i < aSelectedItems.length; i++) {
							var oSelectedItem = aSelectedItems[i];
							if (oValue.key === oSelectedItem.key
									&& (!oValue.inParameters || !oSelectedItem.inParameters || deepEqual(oSelectedItem.inParameters, oValue.inParameters))
									&& (!oValue.outParameters || !oSelectedItem.outParameters || deepEqual(oSelectedItem.outParameters, oValue.outParameters))) {
								bSelected = true;
								// update the description of the selected items by sourcing it from the corresponding table counterpart
								if (oValue.description !== oSelectedItem.description) {
									oSelectedItem.description = oValue.description;
									bUpdate = true;
								}
								break;
							}
						}
					}
					// update the table selection state accordingly
					aTableModifications.push(this._modifyTableSelection(aTableItems, oTableItem, bSelected, j));
				}
			}

			if (bUpdate) {
				this._bNoTableUpdate = true;
				this.setSelectedItems(aSelectedItems);
				this._bNoTableUpdate = false;
			}

			this._oTableModificationPromise = Promise.all(aTableModifications).then(function () {
				this._iRunningTableSelectionUpdates = this._iRunningTableSelectionUpdates - 1;
			}.bind(this));
		}
	};

	FieldValueHelpTableWrapperBase.prototype._getDataFromItem = function (oItem, aInParameters, aOutParameters) {
		var oBindingContext = oItem.isA("sap.ui.model.Context") ? oItem : oItem.getBindingContext();
		return oBindingContext && this._getDataFromContext.call(this, oBindingContext, aInParameters, aOutParameters);
	};

	FieldValueHelpTableWrapperBase.prototype._getDataFromContext = function (oBindingContext, aInParameters, aOutParameters) {

		var sKeyPath = this._getKeyPath();
		var sDescriptionPath = this._getDescriptionPath();
		var vKey;
		var sDescription;

		if (!sKeyPath) {
			throw new Error("KeyPath missing"); // as we cannot determine key without keyPath
		}

		if (!aInParameters) {
			aInParameters = this._getInParameters();
		}
		if (!aOutParameters) {
			aOutParameters = this._getOutParameters();
		}
		var oInParameters = aInParameters.length > 0 ? {} : null;
		var oOutParameters = aOutParameters.length > 0 ? {} : null;
		var sPath;

		if (oBindingContext) {
			vKey = sKeyPath ? oBindingContext.getProperty(sKeyPath) : undefined;
			sDescription = sDescriptionPath ? oBindingContext.getProperty(sDescriptionPath) : undefined;
			var i = 0;
			for (i = 0; i < aInParameters.length; i++) {
				sPath = aInParameters[i];
				oInParameters[sPath] = oBindingContext.getProperty(sPath);
			}
			for (i = 0; i < aOutParameters.length; i++) {
				sPath = aOutParameters[i];
				oOutParameters[sPath] = oBindingContext.getProperty(sPath);
			}
		}

		if (vKey === null || vKey === undefined) {
			return false;
		}

		return {key: vKey, description: sDescription, inParameters: oInParameters, outParameters: oOutParameters};

	};

	FieldValueHelpTableWrapperBase.prototype._isTableReady = function () {
		var oTable = this._getWrappedTable();
		var oListBinding = oTable && this.getListBinding();

		if (!oTable || !oListBinding) {
			return false;
		}

		if (oListBinding && (oListBinding.isSuspended() || oListBinding.getLength() === 0)) {
			return false; // if no context exist, Table is not ready
		}

		return true;
	};

	function _checkTablePending() {

		return SyncPromise.resolve().then(function() {
			var oListBinding = this.getListBinding();
			var oListBindingInfo = this._getListBindingInfo();

			var oDelegate = this._getDelegate();
			if (oListBinding && oDelegate.delegate){
				return oDelegate.delegate.checkListBindingPending(oDelegate.payload, oListBinding, oListBindingInfo);
			} else {
				return false;
			}
		}.bind(this)).catch(function(oException) {
			throw oException; // just throw error
		});

	}

	FieldValueHelpTableWrapperBase.prototype._handleItemPress = function (oEvent) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._handleSelectionChange = function (oEvent, bForce) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._getTableItems = function (bSelectedOnly, bNoVirtual) {
		return [];
	};

	FieldValueHelpTableWrapperBase.prototype._getTableItemByKey = function (vKey, bNoVirtual) {
		var aItems = this._getTableItems(undefined, bNoVirtual);
		return aItems && aItems.find(function (oItem) {
			var oData = this._getDataFromItem(oItem);
			return oData.key === vKey;
		}.bind(this));
	};

	FieldValueHelpTableWrapperBase.prototype._handleTableEvent = function (oEvent) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._modifyTableSelection = function (aItems, oItem, bSelected, iItemIndex, bSuppressEvent) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._getWrappedTable = function () {
		return this.getTable();
	};

	FieldValueHelpTableWrapperBase.prototype._handleEvents = function (bAdd) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._handleScrolling = function (vItem) {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype.getListBinding = function() {
		// Defaults to no-op.
	};

	FieldValueHelpTableWrapperBase.prototype._getListBindingInfo = function() {
		// Defaults to no-op.
	};

	return FieldValueHelpTableWrapperBase;
});
