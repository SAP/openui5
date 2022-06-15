/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/FilterableListContent',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterConverter',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/util/loadModules',
	'sap/m/library',
	'sap/ui/model/FilterType',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterProcessor',
	'sap/ui/mdc/util/Common',
	'sap/base/strings/formatMessage',
	'sap/base/util/merge',
	'sap/ui/mdc/enum/SelectType',
	'sap/base/Log',
	'sap/ui/thirdparty/jquery'
], function(
	FilterableListContent,
	Condition,
	FilterConverter,
	ConditionValidated,
	loadModules,
	library,
	FilterType,
	Filter,
	FilterOperator,
	FilterProcessor,
	Common,
	formatMessage,
	merge,
	SelectType,
	Log,
	jQuery
) {
	"use strict";

	var ListMode = library.ListMode;
	var Sticky = library.Sticky;

	/**
	 * Constructor for a new <code>MTable</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element using a {@link sap.m.Table}.
	 * @extends sap.ui.mdc.valuehelp.base.FilterableListContent
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.content.MTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MTable = FilterableListContent.extend("sap.ui.mdc.valuehelp.content.MTable", /** @lends sap.ui.mdc.valuehelp.content.MTable.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContent",
				"sap.ui.mdc.valuehelp.IDialogContent"
			],
			properties: {

			},
			aggregations: {
				/**
				 * Table to be used in value help
				 *
				 * <b>Note:</b> Set the right selection mode (multiple selection or single selection) as it cannot be determined automatically
				 * for every case. (In type-ahead also for multi-value {@link sap.ui.mdc.FilterField FilterField} controls only single selection from table might be wanted.)
				 */
				table: {
					type: "sap.m.Table",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired if the content of the table is updated
				 */
				contentUpdated: {} // TODO: Better way to solve missing popover maxheight? Part of ITypeahead? Or is this explicitly for IPopoverContent?
			},
			defaultAggregation: "table"
		}
	});

	MTable.prototype.init = function() {
		FilterableListContent.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			aggregations: ["table"]
		});

		this._addPromise("listBinding");
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		this._oMResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	};

	MTable.prototype.getValueHelpIcon = function() {

		if (this.getUseAsValueHelp()) {
			return "sap-icon://slim-arrow-down";
		} else {
			return null;
		}

	};


	function _updateSelection () {
		if (this._oTable) {
			var aItems = this._oTable.getItems();
			var aConditions = this.getConditions();
			var bHideSelection = this._isSingleSelect() && !FilterableListContent.prototype._isSingleSelect.apply(this); // if table is in single selection but Fild allows multiple values, don't select items

			for (var iId in aItems) {
				var oItem = aItems[iId];
				var bSelected = bHideSelection ? false : this._isItemSelected(oItem, aConditions);
				oItem.setSelected(bSelected);
			}
		}
	}
	MTable.prototype.applyFilters = function(sFieldSearch) {
		var oListBinding = this.getListBinding();
		var bValueHelpDelegateInitialized = this._isValueHelpDelegateInitialized();

		if ((!oListBinding || !bValueHelpDelegateInitialized)/* && (this.isContainerOpening() || this.isTypeahead())*/) {
				Promise.all([this._retrievePromise("listBinding"), this._awaitValueHelpDelegate()]).then(function () {
					if (!this.bIsDestroyed) {
						this.applyFilters(sFieldSearch);
					}
				}.bind(this));
			return;
		}

		if (!bValueHelpDelegateInitialized || (!this.isTypeahead() && !this.isContainerOpen() && oListBinding.isSuspended())) {
			return;
		}

		var oDelegate = this._getValueHelpDelegate();
		var oDelegatePayload = this._getValueHelpDelegatePayload();

		var sFilterFields = this.getFilterFields();
		var oFilterBar = this._getPriorityFilterBar();
		var oConditions = oFilterBar ? oFilterBar.getInternalConditions() : this._oInitialFilterConditions || {};

		if (!oFilterBar && sFieldSearch && sFilterFields && sFilterFields !== "$search") {
			// add condition for Search value
			var oCondition = Condition.createCondition("Contains", [sFieldSearch], undefined, undefined, ConditionValidated.NotValidated);
			oConditions[sFilterFields] = [oCondition];
		}

		var oConditionTypes = oConditions && this._getTypesForConditions(oConditions);
		var oFilter = oConditions && FilterConverter.createFilters( oConditions, oConditionTypes, undefined, this.getCaseSensitive());
		var aFilters = oFilter && [oFilter];
		var sSearch = this.isTypeahead() ? sFieldSearch : oFilterBar && oFilterBar.getSearch();

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

		if (sFilterFields === "$search" && oDelegate && oDelegate.isSearchSupported(oDelegatePayload, this, oListBinding)){
			if (!oListBinding.isSuspended() && bUseFilter) {
				// as we trigger two changes this would result to two requests therefore we suspend the binding
				oListBinding.suspend();
			}

			sSearch = oDelegate.adjustSearch(oDelegatePayload, this.isTypeahead(), sSearch);
			oDelegate.executeSearch(oDelegatePayload, oListBinding, sSearch);
			Log.info("ValueHelp-Search: " + sSearch);
		}

		if (bUseFilter) {
			oListBinding.filter(aFilters, FilterType.Application);
			Log.info("ValueHelp-Filter: " + this._prettyPrintFilters.call(this, aFilters));
		}

		if (oListBinding.isSuspended()) {
			// if ListBinding is suspended resume it after filters are set
			oListBinding.resume();
		}
	};

	MTable.prototype._handleSelectionChange = function (oEvent) {
		var sModelName = oEvent.getSource().getBindingInfo("items").model;
		var bIsTypeahead = this.isTypeahead();
		if (!bIsTypeahead || !this._isSingleSelect()) {
			var oParams = oEvent.getParameters();
			var aListItems = oParams.listItems || oParams.listItem && [oParams.listItem];
			var aConditions = aListItems.map(function (oItem) {
				var oItemContext = oItem.getBindingContext(sModelName);
				var oValues = this._getItemFromContext(oItemContext);
				return oValues && this._createCondition(oValues.key, oValues.description, oValues.payload);
			}.bind(this));
			this._fireSelect({type: oParams.selected ? SelectType.Add : SelectType.Remove, conditions: aConditions});
			if (bIsTypeahead) {
				this.fireConfirm();
			}
		}
	};

	MTable.prototype._handleItemPress = function (oEvent) {
		var sModelName = oEvent.getSource().getBindingInfo("items").model;
		var oItem = oEvent.getParameter("listItem");
		var oItemContext = oItem.getBindingContext(sModelName);
		var oValues = this._getItemFromContext(oItemContext);
		var bIsSingleSelect = this._isSingleSelect();
		var bSelected = bIsSingleSelect ? true : !oItem.getSelected();
		var sSelectType = SelectType.Set;

		if (!bIsSingleSelect) {
			oItem.setSelected(bSelected);
			sSelectType = bSelected ? SelectType.Add : SelectType.Remove;
		}
		var oCondition = this._createCondition(oValues.key, oValues.description, oValues.payload);
		this._fireSelect({type: sSelectType, conditions: [oCondition]});
		if (this.isTypeahead()) {
			this.fireConfirm({close: true});
		}
	};

	MTable.prototype._handleUpdateFinished = function () {
		_updateSelection.apply(this);
		this.fireContentUpdated();
	};

	MTable.prototype._getTable = function () {
		return this._oTable;
	};

	MTable.prototype.onShow = function () {
		var oTable = this._getTable();
		if (oTable) {
			if (!oTable.hasStyleClass("sapMComboBoxList")) { // TODO: only in typeahead case?
				oTable.addStyleClass("sapMComboBoxList"); // to allow focus outline in navigation
			}
			// check if selection mode is fine
			var sSelectionMode = this.isTypeahead() ? ListMode.SingleSelectMaster : ListMode.SingleSelectLeft;
			if (!FilterableListContent.prototype._isSingleSelect.apply(this) && oTable.getMode() !== sSelectionMode) { // if in multi-select mode only single-selection on table is allowed this is also OK
				sSelectionMode = ListMode.MultiSelect;
			}
			if (oTable.getMode() === ListMode.None) { // only set automatically if not provided from outside (and do it only once)
				oTable.setMode(sSelectionMode);
			}
			if (oTable.getMode() !== sSelectionMode) {
				throw new Error("Table selection mode needs to be " + sSelectionMode);
			}
		}

		FilterableListContent.prototype.onShow.apply(this, arguments);
	};

	MTable.prototype.onHide = function () {
		FilterableListContent.prototype.onHide.apply(this, arguments);
		var oTable = this.getTable();
		if (oTable) {
			this.removeFocus();
			if (oTable.hasStyleClass("sapMComboBoxList")) {
				oTable.removeStyleClass("sapMComboBoxList");
			}
		}
	};

	MTable.prototype._handleConditionsUpdate = function(oChanges) {
		_updateSelection.call(this);
	};

	MTable.prototype.getContent = function () {
		if (!this.isTypeahead()) {
			return this._retrievePromise("wrappedContent", function () {
				return loadModules([
					"sap/ui/layout/FixFlex",
					"sap/m/VBox",
					"sap/m/Panel",
					"sap/m/ScrollContainer",
					"sap/ui/model/resource/ResourceModel"
				]).then(function(aModules) {

					var FixFlex = aModules[0];
					var VBox = aModules[1];
					var Panel = aModules[2];
					var ScrollContainer = aModules[3];
					var ResourceModel = aModules[4];

					if (!this._oContentLayout) {

						this._oFilterBarVBox = new VBox(this.getId() + "-FilterBarBox");
						this._oFilterBarVBox.addStyleClass("sapMdcValueHelpPanelFilterbar");
						this._oFilterBarVBox._oWrapper = this;
						this._oFilterBarVBox.getItems = function () {
							return [this._oWrapper._getPriorityFilterBar.call(this._oWrapper)];
						};

						this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
						var _formatTableTitle = function (sText) {
							var iItems = 0; //TODO from where do we get the count
							if (iItems === 0) {
								sText = this.getModel("$i18n").getResourceBundle().getText("valuehelp.TABLETITLENONUMBER");
							}
							return formatMessage(sText, iItems);
						};

						this._oTablePanel = new Panel(this.getId() + "-TablePanel", { expanded: true, height: "100%", headerText: {parts: ['$i18n>valuehelp.TABLETITLE'], formatter: _formatTableTitle}});
						this._oTablePanel.addStyleClass("sapMdcTablePanel");

						this._oContentLayout = new FixFlex(this.getId() + "-FF", {minFlexSize: 200, fixContent: this._oFilterBarVBox, flexContent: this._oTablePanel});

						this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
							height: "100%",
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

						this._oTablePanel.addContent(this._oScrollContainer);
					}

					this.setAggregation("displayContent", this._oContentLayout);

					var oFilterBar = this._getPriorityFilterBar();
					if (!oFilterBar) {
						return this._createDefaultFilterBar().then(function () {
							return this._oContentLayout;
						}.bind(this));
					}
					return this._oContentLayout;
				}.bind(this));
			}.bind(this));
		}
		return this._oTable;
	};

	MTable.prototype.getItemForValue = function (oConfig) {

		if (!oConfig.checkKey && oConfig.parsedValue && !oConfig.checkDescription) {
			return null;
		}
		if (oConfig.checkKey && !this.getKeyPath()) {
			throw new Error("MTable: KeyPath missing! " + this.getId());
		}
		if (oConfig.checkDescription && !this.getDescriptionPath()) {
			throw new Error("MTable: DescriptionPath missing! " + this.getId());
		}

		/* load data from model if nothing is found in the current items / contexts
		/  steps:
			0. determine if key or desc entered ??
			1. wait for table binding
			2. consider existing inparameters
		*/
		oConfig.caseSensitive = oConfig.caseSensitive || this.getCaseSensitive();

		var oPromise1 = _checkListBindingPending.call(this);
		var oDelegate = this._getValueHelpDelegate();
		var oDelegatePayload = this._getValueHelpDelegatePayload();
		var oPromise2 = oDelegate && oDelegate.getInitialFilterConditions(oDelegatePayload, this, oConfig.control);

		return Promise.all([oPromise1, oPromise2]).then(function(aResult) {
			var bPending = aResult[0];
			var oInitialConditions = aResult[1];
			var oResult;

			if (!bPending) {
				var oTable = this.getTable();
				oResult = _filterItems.call(this, oConfig, oTable.getItems(), oInitialConditions);
			}

			if (!oResult) {
				oResult = this._loadItemForValue(oConfig, oInitialConditions);
			}

			return oResult;
		}.bind(this));

	};

	function _filterItems(oConfig, aItems, oInitialConditions) {

		if (aItems.length === 0) {
			return;
		}

		var oBindingInfo = this._getListBindingInfo();
		var sModelName = oBindingInfo.model;

		var _getFilterValue = function(oItem, sPath) {
			var oBindingContext = oItem.isA("sap.ui.model.Context") ? oItem : oItem.getBindingContext(sModelName);
			return oBindingContext.getProperty(sPath);
		};

		var aInParameters;
		var aOutParameters;

		var oFilter = _createItemFilters.call(this, oConfig, oInitialConditions);

		var aFilteredItems = FilterProcessor.apply(aItems, oFilter, _getFilterValue);
		if (aFilteredItems.length === 1) {
			var oBindingContext = aFilteredItems[0].getBindingContext(sModelName);
			var oValue = this._getItemFromContext(oBindingContext, {inParameters: aInParameters, outParameters: aOutParameters});
			return {key: oValue.key, description: oValue.description, payload: oValue.payload};
		} else if (aFilteredItems.length > 1) {
			if (!oConfig.caseSensitive) {
				// try with case sensitive search
				var oNewConfig = merge({}, oConfig);
				oNewConfig.caseSensitive = true;
				return _filterItems.call(this, oNewConfig, aItems, oInitialConditions);
			}
			throw _createException.call(this, oConfig.exception, true, oConfig.parsedValue || oConfig.value);
		}

	}

	function _createItemFilters(oConfig, oInitialConditions) {

		var bCaseSensitive = oConfig.caseSensitive;
		var sKeyPath = this.getKeyPath();
		var sDescriptionPath = this.getDescriptionPath();
		var aFilters = [];
		if (oConfig.checkKey && oConfig.hasOwnProperty("parsedValue")) { // empty string or false could be key too
			aFilters.push(new Filter({ path: sKeyPath, operator: FilterOperator.EQ, value1: oConfig.parsedValue, caseSensitive: bCaseSensitive}));
		}
		if (oConfig.checkDescription && oConfig.value) {
			aFilters.push(new Filter({path: sDescriptionPath, operator: FilterOperator.EQ, value1: oConfig.value, caseSensitive: bCaseSensitive}));
		}

		var oFilter = aFilters.length > 1 ? new Filter({filters: aFilters, and: false}) : aFilters[0];

		if (oInitialConditions) {
			var oConditionTypes = this._getTypesForConditions(oInitialConditions);
			var oConditionsFilter = FilterConverter.createFilters(oInitialConditions, oConditionTypes, undefined, this.getCaseSensitive());
			if (oConditionsFilter) {
				oFilter = new Filter({filters: [oFilter, oConditionsFilter], and: true});
			}
		}

		return 	oFilter;

	}

	function _checkListBindingPending() {
		return this._retrievePromise("listBinding").then(function (oListBinding) {
			var oDelegate = this._getValueHelpDelegate();
			var oDelegatePayload = this._getValueHelpDelegatePayload();
			var oListBindingInfo = this._getListBindingInfo();
			if (oListBinding && oDelegate){
				return oDelegate.checkListBindingPending(oDelegatePayload, oListBinding, oListBindingInfo);
			} else {
				return true;
			}
		}.bind(this));
	}

	MTable.prototype.getListBinding = function () {
		var oTable = this._getTable();
		return oTable && oTable.getBinding("items");
	};

	MTable.prototype._getListBindingInfo = function () {
		var oTable = this._getTable();
		return oTable && oTable.getBindingInfo("items");
	};

	MTable.prototype._loadItemForValue = function (oConfig, oInitialConditions) {

		if (!oConfig.checkKey && oConfig.parsedValue && !oConfig.checkDescription) {
			return null;
		}

		/*  steps:
			TODO: 1. wait for table binding
			2. consider existing inparameters
		*/
		var sKeyPath = this.getKeyPath();
		var sDescriptionPath = this.getDescriptionPath();
		var bUseFirstMatch = this.getUseFirstMatch();

		var oTable = this._getTable();
		var oListBinding = oTable && oTable.getBinding("items"); //this.getListBinding();
		var oBindingContext = oListBinding && oListBinding.getContext();
		var oModel = oListBinding && oListBinding.getModel();
		var sPath = oListBinding && oListBinding.getPath();

		var oDelegate = this._getValueHelpDelegate();
		var oDelegatePayload = this._getValueHelpDelegatePayload();

		var sPromiseKey = ["loadItemForValue", sPath, sKeyPath, oConfig.parsedValue || oConfig.value].join("_");

		return this._retrievePromise(sPromiseKey, function () {
			var oFilter = _createItemFilters.call(this, oConfig, oInitialConditions);
			var oFilterListBinding = oModel.bindList(sPath, oBindingContext);

			return oDelegate.executeFilter(oDelegatePayload, oFilterListBinding, oFilter, 2).then(function (oBinding) {
				var aContexts = oBinding.getContexts();

				setTimeout(function() { // as Binding might process other steps after event was fired - destroy it lazy
					oFilterListBinding.destroy();
				}, 0);

				if (aContexts.length && (aContexts.length < 2 || bUseFirstMatch)) {
					return this._getItemFromContext(aContexts[0], {keyPath: sKeyPath, descriptionPath: sDescriptionPath, inParameters: undefined});
				} else if (oConfig.checkKey && oConfig.parsedValue === "" && aContexts.length === 0) {
					// nothing found for empty key -> this is not an error
					return null;
				} else {
					var oException = _createException.call(this, oConfig.exception, aContexts.length > 1, oConfig.value);
					throw oException;
				}
			}.bind(this));
		}.bind(this));
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

	MTable.prototype.isValidationSupported = function(oConfig) {
		return true;
	};

	MTable.prototype.navigate = function (iStep) {

		var oListBinding = this.getListBinding();

		if (!oListBinding || !oListBinding.getLength()) {
			return _checkListBindingPending.call(this).then(function (bPending) {
				if (!bPending && oListBinding.getLength() !== 0) { // if no items - no navigation is possible
					return this.navigate(iStep);
				}
				return false;
			}.bind(this));
		}

		var oTable = this._getTable();
		oTable.addStyleClass("sapMListFocus"); // to show focus outline on navigated item

		var aItems = this._oTable.getItems();
		var oSelectedItem = oTable.getSelectedItem();
		var iItems = aItems.length;
		var iSelectedIndex = 0;
		var bLeaveFocus = false;

		if (oSelectedItem) {
			iSelectedIndex = aItems.indexOf(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		if (this._getMaxConditions() !== 1) { // || (oFirstSelectedItem && !oTableItemForFirstSelection)  prevent navigation if selected item noch present in table?
			if (this.getParent().isOpen()) {
				oTable.focus();
				return;
			}
		}

		var bSearchForNext;
		if (iSelectedIndex < 0) {
			iSelectedIndex = 0;
			bSearchForNext = true;
			bLeaveFocus = true;
		} else if (iSelectedIndex >= iItems - 1) {
			iSelectedIndex = iItems - 1;
			bSearchForNext = false;
		} else {
			bSearchForNext = iStep >= 0;
		}

		while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
			if (bSearchForNext) {
				iSelectedIndex++;
			} else {
				iSelectedIndex--;
			}
		}
		if (iSelectedIndex < 0 || iSelectedIndex > iItems - 1) {
			// find last not groupable item
			bSearchForNext = !bSearchForNext;
			bLeaveFocus = iSelectedIndex < 0;
			iSelectedIndex = iSelectedIndex < 0 ? 0 : iItems - 1;
			while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
				if (bSearchForNext) {
					iSelectedIndex++;
				} else {
					iSelectedIndex--;
				}
			}
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem) {
			var oCondition;
			if (oItem !== oSelectedItem) {
				oItem.setSelected(true);

				var oBindingInfo = this._getListBindingInfo();
				var sModelName = oBindingInfo.model;
				var oItemContext = oItem.getBindingContext(sModelName);
				var oValues = this._getItemFromContext(oItemContext);
				oCondition = oValues && this._createCondition(oValues.key, oValues.description, oValues.payload);
				this.setProperty("conditions", [oCondition], true);

				if (this._bVisible) {
					this._handleScrolling(oItem);
				}
				this.fireNavigated({condition: oCondition, itemId: oItem.getId(), leaveFocus: false});
			} else if (bLeaveFocus) {
				this.fireNavigated({condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus});
			}
		}
	};

	MTable.prototype._handleScrolling = function (oItem) {
		var oScrollDelegate = this.getScrollDelegate();
		if (oScrollDelegate) {
			var oTable = this._getTable();
			var iIndex = !isNaN(oItem) ? oItem : oTable.indexOfItem(oItem);
			oTable.scrollToIndex(iIndex).catch(function (oError) {
				// TODO: Handle scroll error?
			});
			return true;
		}
		return false;
	};

	// Table needs to know the ScrollDelegate of the parent, so we provide it here.
	MTable.prototype.getScrollDelegate = function() {
		if (/* !this.isTypeahead()  && */ this._oScrollContainer) {
			return this._oScrollContainer.getScrollDelegate();
		}
		return FilterableListContent.prototype.getScrollDelegate.apply(this, arguments);
	};


	MTable.prototype.removeFocus = function() {

		var oTable = this.getTable();
		if (oTable) {
			oTable.removeStyleClass("sapMListFocus");
		}

	};

	MTable.prototype.getAriaAttributes = function(iMaxConditions) {

		var oTable = this.getTable();

		return { // return default values, but needs to be implemented by specific content
			contentId: oTable && oTable.getId(), // if open, table should be there; if closed, not needed
			ariaHasPopup: "listbox",
			roleDescription: null // TODO: no multi-selection
		};
	};

	MTable.prototype.getContainerConfig = function () {
		return {
			'sap.ui.mdc.valuehelp.Popover': {
				getContentHeight: function () {
					var oTable = this._getTable();
					var oDomRef = oTable && oTable.getDomRef();
					return oDomRef && Math.round(oDomRef.getBoundingClientRect().height);
				}.bind(this),
				getFooter: function () {
					return this._retrievePromise("footer", function () {
						return this._retrievePromise("listBinding").then(function (oListBinding) {
							var oBindingInfo = this._getListBindingInfo();
							if (oBindingInfo && oBindingInfo.length) {
								return loadModules(["sap/m/Button", "sap/m/Toolbar", "sap/m/ToolbarSpacer"]).then(function (aModules) {
									var Button = aModules[0];
									var Toolbar = aModules[1];
									var ToolbarSpacer = aModules[2];
									var oShowAllItemsButton = new Button(this.getId() + "-showAllItems", {
										text: this._oMResourceBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
										press: function () {
											this.fireRequestSwitchToDialog();
										}.bind(this)
									});
									var aToolbarContent = [new ToolbarSpacer(this.getId() + "-Spacer")].concat(oShowAllItemsButton);
									var oFooter = new Toolbar(this.getId() + "-TB", {
										content: aToolbarContent
									});
									return oFooter;
								}.bind(this));
							}
						}.bind(this));
					}.bind(this));
				}.bind(this)
			}
		};
	};

	function _adjustTable () {
		if (this._oTable && this.getParent()) {

			var aSticky = this._oTable.getSticky();
			if (!aSticky || aSticky.length === 0) {
				// make headers sticky
				this._oTable.setSticky([Sticky.ColumnHeaders]);
			}
		}
	}
	MTable.prototype.setParent = function(oParent) {
		FilterableListContent.prototype.setParent.apply(this, arguments);
		_adjustTable.call(this);
	};

	MTable.prototype._handleSearch = function (oEvent) {
		return this.applyFilters(this.getFilterValue());
	};

	MTable.prototype._observeChanges = function (oChanges) {

		if (oChanges.name === "config") {
			_adjustTable.call(this);
		}

		if (oChanges.name === "items" && oChanges.mutation === "ready") {
			this._resolvePromise("listBinding", oChanges.bindingInfo.binding);
		}

		if (oChanges.name === "table") {
			var oTable = oChanges.child;

			if (oChanges.mutation === "remove") {
				this._oObserver.unobserve(oTable);
				oTable.removeDelegate(this._oTableDelegate);
				this._oTable.detachItemPress(this._handleItemPress, this);
				this._oTable.detachSelectionChange(this._handleSelectionChange, this);
				this._oTable.detachUpdateFinished(this._handleUpdateFinished, this);
				this._oTable = null;
				this._removePromise("footer");
				this._addPromise("listBinding");
			} else {
				this._oTable = oTable;
				_adjustTable.call(this);
				this._oTable.attachItemPress(this._handleItemPress, this);
				this._oTable.attachSelectionChange(this._handleSelectionChange, this);
				this._oTable.attachUpdateFinished(this._handleUpdateFinished, this);
				this._oTableDelegate = this._oTableDelegate || {
					onsapprevious: this._handleTableEvent,
					onsapnext: this._handleTableEvent,
					cellClick: this._handleTableEvent
				};
				oTable.addDelegate(this._oTableDelegate, true, this);

				var oListBinding = oTable.getBinding("items");	// TODO: wait for binding ready??
				if (oListBinding) {
					this._resolvePromise("listBinding", oListBinding);
				} else {
					this._oObserver.observe(oChanges.child, {bindings: ["items"]});
				}
			}
		}

		FilterableListContent.prototype._observeChanges.apply(this, arguments);
	};

	MTable.prototype._handleTableEvent = function (oEvent) {

		if (!this.isTypeahead()) {
			return;
		}

		var oTable = this._getTable();
		var oItem = jQuery(oEvent.target).control(0);

		switch (oEvent.type) {
			case "sapprevious":
				if (oItem.isA("sap.m.ListItemBase")) {
					if (oTable.indexOfItem(oItem) === 0) {
						this.fireNavigated({condition: undefined, itemId: undefined, leaveFocus: true});
						oEvent.preventDefault();
						oEvent.stopPropagation();
						oEvent.stopImmediatePropagation(true);
					}
				}
				break;
			default:
				break;
		}
	};

	MTable.prototype.isQuickSelectSupported = function() {
		return true;
	};

	MTable.prototype.shouldOpenOnNavigate = function() {
		return true;
	};

	MTable.prototype._isSingleSelect = function() {

		// use selection mode of table if set
		var oTable = this._getTable();
		if (oTable) {
			if (oTable.getMode() === ListMode.MultiSelect) {
				return false;
			} else {
				return true;
			}
		} else {
			return FilterableListContent.prototype._isSingleSelect.apply(this, arguments);
		}

	};

	MTable.prototype.exit = function () {

		Common.cleanup(this, [
			"_sTableWidth", "_oTable", "_oScrollContainer", "_oContentLayout", "_oTablePanel", "_oFilterBarVBox", "_oMResourceBundle", "_oResourceBundle", "_oTableDelegate"
		]);

		FilterableListContent.prototype.exit.apply(this, arguments);
	};

	return MTable;
});
