/*
 * ! ${copyright}
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
	'sap/base/Log'
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
			Log
	) {
	"use strict";

	var ListMode = mLibrary.ListMode;
	var Sticky = mLibrary.Sticky;
	var ScrollContainer;

	/**
	 * Constructor for a new <code>FieldValueHelpMTableWrapper</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. This is a wrapper to use a
	 * {@link sap.m.Table Table} control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Wrapper to use a {@link sap.m.Table Table} control as content of a {@link sap.ui.mdc.field.FieldValueHelp FieldValueHelp} element.
	 * @extends sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.60.0
	 * @alias sap.ui.mdc.field.FieldValueHelpMTableWrapper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpMTableWrapper = FieldValueHelpContentWrapperBase.extend("sap.ui.mdc.field.FieldValueHelpMTableWrapper", /** @lends sap.ui.mdc.field.FieldValueHelpMTableWrapper.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				/**
				 * Table of the field help.
				 *
				 * As the <code>FieldValueHelp</code> element cannot know the semantic of the items,
				 * the caller is responsible for the item handling.
				 * The items must be active to allow interaction and selection.
				 *
				 * This can be handled automatically if the following applies:
				 * <ul>
				 * <li>No <code>keyPath</code> or <code>descriptionPath</code> is specified for the <code>FieldValueHelp</code> element</li>
				 * <li>Table has no paging </li>
				 * <li>Table uses <code>ColumnListItem</code> as item </li>
				 * <li>The first column if the table contains the key and the second column the description, using a <code>Text</code> control </li>
				 * </ul>
				 *
				 * For everything else the application has to implement the logic.
				 *
				 * If the <code>ListBinding</code> of the table is initially created to be suspended, no filtering or selection is triggered. So the table is empty.
				 * Upon user interaction (type ahead, search request, or search from <code>FilterBar</code>) the <code>ListBinding</code> is resumed so the filter
				 * is executed.
				 * If <code>FilterBar</code> is in <code>LiveMode</code>, and <code>InParameters</code> are used, this also triggers filtering.
				 */
				table: {
					type: "sap.m.Table",
					multiple: false
				}
			},
			defaultAggregation: "table"
		}
	});

	// private function to initialize globals for qUnit tests
	FieldValueHelpMTableWrapper._init = function() {

		ScrollContainer = undefined;

	};

	FieldValueHelpMTableWrapper.prototype.init = function() {

		FieldValueHelpContentWrapperBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["selectedItems"],
			aggregations: ["table"]
		});

		this._oTablePromise = new Promise(function(fResolve) {
			this._oTablePromiseResolve = fResolve;
		}.bind(this));

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._oPromises = {};
		this._oTableDelegate = {/*onfocusin: _handleTableEvent, */onsapprevious: _handleTableEvent};

	};

	FieldValueHelpMTableWrapper.prototype.exit = function() {

		FieldValueHelpContentWrapperBase.prototype.exit.apply(this, arguments);

		if (this._oScrollContainer) {
			this._oScrollContainer.destroy();
			delete this._oScrollContainer;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

		delete this._oTablePromise;
		delete this._oTablePromiseResolve;

	};

	FieldValueHelpMTableWrapper.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oTable = this.getTable();
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

	FieldValueHelpMTableWrapper.prototype.initialize = function(bSuggestion) {

		if (bSuggestion || this._oScrollContainer) {
			return this;
		}

		if (!ScrollContainer && !this._bScrollContainerRequested) {
			ScrollContainer = sap.ui.require("sap/m/ScrollContainer");
			if (!ScrollContainer) {
				sap.ui.require(["sap/m/ScrollContainer"], _ScrollContainerLoaded.bind(this));
				this._bScrollContainerRequested = true;
			}
		}
		if (ScrollContainer && !this._bScrollContainerRequested) {
			this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
				height: "100%",
				width: "100%",
				vertical: true
			});

			this._oScrollContainer._oWrapper = this;
			this._oScrollContainer.getContent = function() {
				var aContent = [];
				var oTable = this._oWrapper && this._oWrapper.getTable();
				if (oTable) {
					aContent.push(oTable);
				}
				return aContent;
			};
		}

		return this;

	};

	function _ScrollContainerLoaded(fnScrollContainer) {

		ScrollContainer = fnScrollContainer;
		this._bScrollContainerRequested = false;

		if (!this._bIsBeingDestroyed) {
			this.initialize();
			this.fireDataUpdate({contentChange: true});
		}

	}

	FieldValueHelpMTableWrapper.prototype.getDialogContent = function() {

		return this._oScrollContainer;

	};

	FieldValueHelpMTableWrapper.prototype.getSuggestionContent = function() {

		return this.getTable();

	};

	FieldValueHelpMTableWrapper.prototype.fieldHelpOpen = function(bSuggestion) {

		FieldValueHelpContentWrapperBase.prototype.fieldHelpOpen.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable) {
			_adjustTable.call(this, oTable, bSuggestion);
			_updateSelectedItems.call(this); // as selection mode might be changed
			if (bSuggestion && this.getScrollDelegate()) { // if Popover not already rendered no ScrollDelegate exists -> is called afterOpen
				var oSelectedItem = oTable.getSelectedItem();
				if (oSelectedItem) {
					oTable.scrollToIndex(oTable.indexOfItem(oSelectedItem));
				}
			}
		}

		return this;

	};

	FieldValueHelpMTableWrapper.prototype.navigate = function(iStep) {

		var oTable = this.getTable();

		if (!_checkTableReady(oTable)) {
			// Table not assigned right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		if (this._getMaxConditions() !== 1) {
			// in multiSelect case just focus table
			oTable.focus();
			this.fireNavigate(); // no item
			return;
		}

		var oSelectedItem = oTable.getSelectedItem();
		var aItems = oTable.getItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;

		if (oSelectedItem) {
			iSelectedIndex = oTable.indexOfItem(oSelectedItem);
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
		if (oItem && oItem !== oSelectedItem) {
			oItem.setSelected(true);
			var oValue = _getDataFromItem.call(this, oItem);

			if (this.getScrollDelegate()) { // if Popover not already rendered no ScrollDelegate exists -> is called afterOpen
				oTable.scrollToIndex(iSelectedIndex);
			}

			this._bNoTableUpdate = true;
			this.setSelectedItems([{key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters}]);
			this._bNoTableUpdate = false;
			this.fireNavigate({key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters, itemId: oItem.getId()});
		}

	};

	FieldValueHelpMTableWrapper.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters, bNoRequest) {

		return _checkTextOrKey.call(this, vKey, "key", oInParameters, oOutParameters, bNoRequest);

	};

	FieldValueHelpMTableWrapper.prototype.getKeyForText = function(sText, oInParameters, bNoRequest) {

		return _checkTextOrKey.call(this, sText, "description", oInParameters, undefined, bNoRequest);

	};

	function _checkTextOrKey(vValue, sField, oInParameters, oOutParameters, bNoRequest) {

		if (vValue === null || vValue === undefined || (sField === "description" && vValue === "" )) { // TODO: support boolean?
			return null;
		}

		var Exception = sField === "description" ? ParseException : FormatException;
		var fnFieldPath = sField === "description" ? this._getDescriptionPath : this._getKeyPath;
		var oTable = this.getTable();
		if (_checkTableReady(oTable)) {
			var oResult;
			var aItems = oTable.getItems();

			if (this._getKeyPath() && oTable.getBinding("items")) {
				oResult = _filterItems.call(this, vValue, aItems, fnFieldPath.call(this), oInParameters, oOutParameters, Exception);
				if (oResult) {
					return oResult;
				}
			} else { // if no keyPath assigned, In/OutParameters are not supported, should never happen (only very old case)
				var bFound = false;
				for (var i = 0; i < aItems.length; i++) {
					var oItem = aItems[i];
					var oValue = _getDataFromItem.call(this, oItem);
					if (oValue[sField] === vValue){
						if (bFound) { // not unique
							throw _createException.call(this, Exception, true, vValue);
						}
						oResult = oValue;
						bFound = true;
					}
				}
				if (bFound) {
					return oResult;
				}
			}
		}

		if (bNoRequest) {
			throw new Exception(this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]));
		} else {
			// not in already loaded item -> ask the model
			return _loadData.call(this, fnFieldPath, vValue, oInParameters, oOutParameters, Exception);
		}

	}

	function _filterItems(vValue, aItems, sPath, oInFilters, oOutFilters, Exception) {

		var oFilter = new Filter({path: sPath, operator: FilterOperator.EQ, value1: vValue});
		var _getFilterValue = function(oItem, sPath) {
			var oBindingContext = oItem.getBindingContext();
			var oDataModelRow = oBindingContext.getObject();
			if (oDataModelRow.hasOwnProperty(sPath)) {
				return oDataModelRow[sPath];
			} else {
				return undefined;
			}
		};

		if (oInFilters || oOutFilters) {
			var aFilters = [oFilter];
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
			var oValue = _getDataFromItem.call(this, aFilteredItems[0]);
			return {key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters};
		} else if (aFilteredItems.length > 1) {
			throw _createException.call(this, Exception, true, vValue);
		}

	}

	function _loadData(fnFieldPath, vValue, oInParameters, oOutParameters, Exception) {
		// provide fieldPath function as this could be set late when Table is ready

		// if already requested return existing promise. Do not request twice.
		var sFieldPath = fnFieldPath.call(this);
		if (this._oPromises[sFieldPath] && this._oPromises[sFieldPath][vValue]) {
			return this._oPromises[sFieldPath][vValue];
		}

		if (!this._oPromises[sFieldPath]) {
			this._oPromises[sFieldPath] = {};
		}

		this._oPromises[sFieldPath][vValue] = new Promise(function(fResolve, fReject) {
			this._oTablePromise.then(function(oTable) {
				//FieldPath might not be set before Table was initialized -> in this case try it now
				var sOldFieldPath = sFieldPath;
				sFieldPath = fnFieldPath.call(this);

				if (!sFieldPath) {
					// without FieldPath filter will fail -> stop here
					fReject(new Error("missing FieldPath"));
					return;
				}
				if (sFieldPath !== sOldFieldPath) {
					if (!this._oPromises[sFieldPath]) {
						this._oPromises[sFieldPath] = {};
					}
					this._oPromises[sFieldPath][vValue] = this._oPromises[sOldFieldPath][vValue];
					delete this._oPromises[sOldFieldPath][vValue];
				}

				var oListBinding = this.getListBinding();
				var oModel = oListBinding.getModel();
				var sPath = oListBinding.getPath();
				var oFilter = new Filter(sFieldPath, "EQ", vValue);
				var oBindingContext = oListBinding.getContext();
				var aFilters = [];

				if (oInParameters) {
					// use in-parameters as additional filters
					aFilters.push(oInParameters);
				}
				if (oOutParameters) {
					// use out-parameters as additional filters (only if not already set by InParameter
					if (oInParameters) {
						var aOutFilters = oOutParameters.aFilters ? oOutParameters.aFilters : [oOutParameters];
						var aInFilters = oInParameters.aFilters ? oInParameters.aFilters : [oInParameters];
						for (var i = 0; i < aOutFilters.length; i++) {
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
							var oValue = _getDataFromContext.call(this, aContexts[0]);
							var oResult = {key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters};
							fResolve(oResult);
						} else if (vValue === "" && aContexts.length === 0) {
							// nothing found for empty key -> this is not an error
							fResolve(null);
						} else {
							var oException = _createException.call(this, Exception, aContexts.length > 1, vValue);
							fReject(oException);
						}

						setTimeout(function() { // as Binding might process other steps after event was fired - destroy it lazy
							oFilterListBinding.destroy();
						}, 0);
						delete this._oPromises[sFieldPath][vValue];
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

		return this._oPromises[sFieldPath][vValue];

	}

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

	FieldValueHelpMTableWrapper.prototype.getListBinding = function() {

		var oTable = this.getTable();
		var oListBinding;
		if (oTable) {
			oListBinding = oTable.getBinding("items");
		}

		return oListBinding;

	};

	FieldValueHelpMTableWrapper.prototype.getAsyncKeyText = function() {

		return true;

	};

	FieldValueHelpMTableWrapper.prototype.applyFilters = function(aFilters, sSearch) {

		var oListBinding = this.getListBinding();

		if (!oListBinding) {
			// wait for table finished (promise resolved)
			this._oTablePromise.then(function(oTable) {
				if (!this._bIsBeingDestroyed) {
					this.applyFilters(aFilters, sSearch);
				}
			}.bind(this));
			return;
		}

		var oDelegate = this._getDelegate();
		var bUseFilter = true;
		var oFilterInfo = oListBinding.getFilterInfo();

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

	};

	FieldValueHelpMTableWrapper.prototype.isSuspended = function() {

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

	FieldValueHelpMTableWrapper.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		var oTable = this.getTable();

		if (oTable) {
			oTable.detachEvent("itemPress", _handleItemPress, this);
			oTable.detachEvent("selectionChange", _handleSelectionChange, this);
			oTable.detachEvent("updateFinished", _handleUpdateFinished, this);
		}

		var oClone = FieldValueHelpContentWrapperBase.prototype.clone.apply(this, arguments);

		if (oTable) {
			oTable.attachEvent("itemPress", _handleItemPress, this);
			oTable.attachEvent("selectionChange", _handleSelectionChange, this);
			oTable.attachEvent("updateFinished", _handleUpdateFinished, this);
		}

		return oClone;

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "table") {
			_tableChanged.call(this, oChanges.mutation, oChanges.child);
		}

		if (oChanges.name === "selectedItems") {
			_updateSelectedItems.call(this);
		}

	}

	function _tableChanged(sMutation, oTable) {

		if (sMutation === "remove") {
			oTable.detachEvent("itemPress", _handleItemPress, this);
			oTable.detachEvent("selectionChange", _handleSelectionChange, this);
			oTable.detachEvent("updateFinished", _handleUpdateFinished, this);
			oTable.detachEvent("modelContextChange", _tableModelContextChange, this);
			oTable.removeDelegate(this._oTableDelegate);
			oTable = undefined;
			this._oTablePromise = new Promise(function(fResolve) {
				this._oTablePromiseResolve = fResolve;
			}.bind(this));
		} else {
			oTable.setMode(ListMode.SingleSelectMaster); // to allow selection before opening
			oTable.setRememberSelections(false);
			oTable.attachEvent("itemPress", _handleItemPress, this);
			oTable.attachEvent("selectionChange", _handleSelectionChange, this);
			oTable.attachEvent("updateFinished", _handleUpdateFinished, this);
			oTable.addDelegate(this._oTableDelegate, true, this);
			_adjustTable.call(this, oTable, this._bSuggestion);
			_updateSelectedItems.call(this);

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
			}

			if (this.getListBinding()) {
				this._oTablePromiseResolve(oTable);
			} else {
				oTable.attachEvent("modelContextChange", _tableModelContextChange, this);
			}

		}

		this.fireDataUpdate({contentChange: true});

	}

	function _tableModelContextChange(oEvent) {

		if (this.getListBinding()) {
			var oTable = oEvent.getSource();
			this._oTablePromiseResolve(oTable);
			oTable.detachEvent("modelContextChange", _tableModelContextChange, this);
		}

	}

	function _adjustTable(oTable, bSuggestion) {

		if (oTable && this.getParent()) { // only possible if assigned to a FieldValueHelp
			if (bSuggestion) {
				if (this._sTableWidth) {
					oTable.setWidth(this._sTableWidth); // TODO
				}
				if (this._getMaxConditions() === 1) {
					oTable.setMode(ListMode.SingleSelectMaster);
				} else {
					oTable.setMode(ListMode.MultiSelect);
				}
			} else {
				if (oTable.getWidth() !== "100%") {
					this._sTableWidth = oTable.getWidth();
					oTable.setWidth("100%"); // TODO
				}
				if (this._getMaxConditions() === 1) {
					oTable.setMode(ListMode.SingleSelectLeft);
				} else {
					oTable.setMode(ListMode.MultiSelect);
				}
			}

			var aSticky = oTable.getSticky();
			if (!aSticky || aSticky.length === 0) {
				// make headers sticky
				oTable.setSticky([Sticky.ColumnHeaders]);
			}
		}

	}

	function _handleItemPress(oEvent) {

		var oItem = oEvent.getParameter("listItem");

		if (!this._bSuggestion || this._getMaxConditions() !== 1) {
			// in Dialog mode or multi-suggestion select item
			oItem.setSelected(!oItem.getSelected());
		}

		_fireSelectionChange.call(this, true);

	}

	function _handleSelectionChange(oEvent) {

		if (!this._bSuggestion || this._getMaxConditions() !== 1) {
			// single-suggestion handled in _handleItemPress
			_fireSelectionChange.call(this, false);
		}

	}

	function _fireSelectionChange(bItemPress) {

		var aItems = [];
		var oTable = this.getTable();
		if (oTable) {
			// first add all already selected items that are not in the table right now (because of filtering)
			var aSelectedItems = this.getSelectedItems();
			var aTableItems = oTable.getItems();
			var i = 0;
			var oItem;
			var oValue;
			if (aSelectedItems.length > 0) {
				for (i = 0; i < aTableItems.length; i++) {
					oItem = aTableItems[i];
					oValue = _getDataFromItem.call(this, oItem);

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
				}
			}

			if (aSelectedItems.length > 0) {
				aItems = aSelectedItems;
			}

			// now add all currently selected items
			aSelectedItems = oTable.getSelectedItems();
			for (i = 0; i < aSelectedItems.length; i++) {
				oItem = aSelectedItems[i];
				oValue = _getDataFromItem.call(this, oItem);

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

	}

	function _handleUpdateFinished(oEvent) {

		if (!this.getParent()) {
			// if wrapper is not assigned to a FieldValueHelp the selection can not be updated, must be done if assigned
			return;
		}

		_updateSelectedItems.call(this);

		if (this._bNavigate) {
			this._bNavigate = false;
			this.navigate(this._iStep);
		}

		if (oEvent.getParameter("reason") !== capitalize(ChangeReason.Filter)) {
			this.fireDataUpdate({contentChange: false});
		}

	}

	function _updateSelectedItems() {

		if (this._bNoTableUpdate) {
			return;
		}

		var oTable = this.getTable();
		if (_checkTableReady(oTable)) {
			var aSelectedItems = this.getSelectedItems();
			var aItems = oTable.getItems();
			var bUpdate = false;
			for (var j = 0; j < aItems.length; j++) {
				var oItem = aItems[j];
				var bSelected = false;
				if (aSelectedItems.length > 0) {
					var oValue = _getDataFromItem.call(this, oItem);
					for (var i = 0; i < aSelectedItems.length; i++) {
						var oSelectedItem = aSelectedItems[i];
						if (oValue.key === oSelectedItem.key
								&& (!oValue.inParameters || !oSelectedItem.inParameters || deepEqual(oSelectedItem.inParameters, oValue.inParameters))
								&& (!oValue.outParameters || !oSelectedItem.outParameters || deepEqual(oSelectedItem.outParameters, oValue.outParameters))) {
							bSelected = true;
							if (oValue.description !== oSelectedItem.description) {
								// description was missing - update it now (to have it if later select is fired)
								oSelectedItem.description = oValue.description;
								bUpdate = true;
							}
							break;
						}
					}
				}
				if (oItem.getSelected() !== bSelected) {
					oItem.setSelected(bSelected);
				}
			}
		}

		if (bUpdate) {
			this._bNoTableUpdate = true;
			this.setSelectedItems(aSelectedItems);
			this._bNoTableUpdate = false;
		}

	}

	function _getDataFromItem(oItem, aInParameters, aOutParameters) {

		var oValue;
		var oBindingContext = oItem.getBindingContext();

		if (oBindingContext) {
			oValue = _getDataFromContext.call(this, oBindingContext, aInParameters, aOutParameters);
		}

		if (!oValue) {
			// try to get from item
			var sKeyPath = this._getKeyPath();
			var vKey;
			var sDescription;

			if (!sKeyPath && oItem.getCells) {
				var aCells = oItem.getCells();
				if (aCells.length > 0 && aCells[0].getText) {
					vKey = aCells[0].getText();
				}
				if (aCells.length > 1 && aCells[1].getText) {
					sDescription = aCells[1].getText();
				}
				if (vKey !== undefined) {
					oValue = {key: vKey, description: sDescription};
				}
			}
		}

		if (!oValue) {
			throw new Error("Key could not be determined from item " + this);
		}

		return oValue;

	}

	function _getDataFromContext(oBindingContext, aInParameters, aOutParameters) {

		var sKeyPath = this._getKeyPath();
		var sDescriptionPath = this._getDescriptionPath();
		var oDataModelRow = oBindingContext.getObject();
		var vKey;
		var sDescription;

		if (!aInParameters) {
			aInParameters = this._getInParameters();
		}
		if (!aOutParameters) {
			aOutParameters = this._getOutParameters();
		}
		var oInParameters = aInParameters.length > 0 ? {} : null;
		var oOutParameters = aOutParameters.length > 0 ? {} : null;
		var sPath;

		if (oDataModelRow) {
			if (sKeyPath && oDataModelRow.hasOwnProperty(sKeyPath)) {
				vKey = oDataModelRow[sKeyPath];
			}
			if (sDescriptionPath && oDataModelRow.hasOwnProperty(sDescriptionPath)) {
				sDescription = oDataModelRow[sDescriptionPath];
			}
			var i = 0;
			for (i = 0; i < aInParameters.length; i++) {
				sPath = aInParameters[i];
				if (oDataModelRow.hasOwnProperty(sPath)) {
					oInParameters[sPath] = oDataModelRow[sPath];
				}
			}
			for (i = 0; i < aOutParameters.length; i++) {
				sPath = aOutParameters[i];
				if (oDataModelRow.hasOwnProperty(sPath)) {
					oOutParameters[sPath] = oDataModelRow[sPath];
				} else {
					Log.error("FieldValueHelpMTableWrapper", "cannot find out-parameter '" + sPath + "' in item data!");
				}
			}
		}

		if (vKey === null || vKey === undefined) {
			return false;
		}

		return {key: vKey, description: sDescription, inParameters: oInParameters, outParameters: oOutParameters};

	}

	function _checkTableReady(oTable) {

		if (!oTable) {
			return false;
		}

		var oBinding = oTable.getBinding("items");
		if (oBinding && (oBinding.isSuspended() || oBinding.getLength() === 0)) {
			return false; // if no context exist, Table is not ready
		}

		return true;

	}

	function _handleTableEvent(oEvent) {

//		Log.info("TableEvent " + oEvent.type + ": " + oEvent.target.id);

		if (!this._bSuggestion) {
			return; // only in suggestion popover
		}

		var oTable = this.getTable();
		var oItem = jQuery(oEvent.target).control(0);

		switch (oEvent.type) {
		case "sapprevious":
			if (oItem.isA("sap.m.ListItemBase")) {
				if (oTable.indexOfItem(oItem) === 0) {
					// focus Field
					this.fireNavigate({key: undefined, description: undefined, leave: true});
					oEvent.preventDefault();
					oEvent.stopPropagation();
					oEvent.stopImmediatePropagation(true);
				}
			}
			break;

//		case "focusin":
//			if (oItem.isA("sap.m.ListItemBase")) {
//				// handle navigation for multiselect
//			}
//
//			break;
		default:
			break;
		}

	}

	return FieldValueHelpMTableWrapper;

});
