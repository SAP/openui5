/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	'sap/ui/mdc/valuehelp/base/FilterableListContent',
	'sap/ui/mdc/condition/FilterConverter',
	'sap/ui/mdc/util/loadModules',
	'sap/m/library',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterProcessor',
	'sap/ui/mdc/util/Common',
	'sap/base/strings/formatMessage',
	'sap/base/util/merge',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/base/Log',
	'sap/base/util/isEmptyObject',
	'sap/ui/core/Element',
	'sap/ui/Device',
	'sap/ui/dom/containsOrEquals',
	"sap/m/table/Util"
], (
	Library,
	FilterableListContent,
	FilterConverter,
	loadModules,
	library,
	Filter,
	FilterOperator,
	FilterProcessor,
	Common,
	formatMessage,
	merge,
	ValueHelpSelectionType,
	Log,
	isEmptyObject,
	Element,
	Device,
	containsOrEquals,
	MTableUtil
) => {
	"use strict";

	const { ListMode } = library;
	const { Sticky } = library;

	/**
	 * Constructor for a new <code>MTable</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element using a {@link sap.m.Table}.
	 * @extends sap.ui.mdc.valuehelp.base.FilterableListContent
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.content.MTable
	 */
	const MTable = FilterableListContent.extend("sap.ui.mdc.valuehelp.content.MTable", /** @lends sap.ui.mdc.valuehelp.content.MTable.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.base.ITypeaheadContent", "sap.ui.mdc.valuehelp.base.IDialogContent"
			],
			aggregations: {
				/**
				 * Table that is used in the value help.
				 *
				 * <b>Note:</b> Set the right selection mode (multiple selection or single selection) as it cannot be determined automatically
				 * for every case. (For type-ahead and also for multi-value {@link sap.ui.mdc.FilterField FilterField} controls, only single selection from the table might be wanted.)
				 *
				 * <b>Note:</b> In phone mode, the popover or dialog might be rendered differently than in desktop mode.
				 * So here the configuration for column sizes or table sizes might be different. Please configure sizes depending on the used device.
				 */
				table: {
					type: "sap.m.Table",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when the content of the table is updated.
				 * @deprecated since 1.118.0 - This event is not fired or consumed anymore
				 */
				contentUpdated: {}
			},
			defaultAggregation: "table"
		}
	});

	MTable.prototype.init = function() {
		FilterableListContent.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			aggregations: ["table"]
		});

		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		this._oMResourceBundle = Library.getResourceBundleFor("sap.m");

		this._iNavigateIndex = -1; // initially nothing is navigated

		this._sHighlightId = undefined;

		this._bAnnounceTableUpdate = false;
	};

	MTable.prototype.getValueHelpIcon = function() {

		if (this.getUseAsValueHelp()) {
			return "sap-icon://slim-arrow-down";
		} else {
			return null;
		}

	};


	function _updateSelection() {
		const oTable = this._getTable();
		if (oTable) {
			const aItems = oTable.getItems();
			const aConditions = this.getConditions();
			const bHideSelection = this.isSingleSelect() && !FilterableListContent.prototype.isSingleSelect.apply(this); // if table is in single selection but Field allows multiple values, don't select items
			const bIsOpen = this.getParent().isOpen();

			aItems.forEach((oItem) => {
				const oItemContext = this._getListItemBindingContext(oItem);
				if (bHideSelection && oTable.indexOfItem(oItem) !== this._iNavigateIndex) { // let navigated item be selected
					oItem.setSelected(false);
				} else {
					oItem.setSelected(this._isContextSelected(oItemContext, aConditions));
				}

				// special focus handling for dropdown boxes - in some cases visual (not real) focus must be in item
				if (this.isTypeahead()) { // only happens in typeahead dropdown (on Dialog real focus must stay there)
					if (this.isSingleSelect()) {
						if (oTable.indexOfItem(oItem) === this._iNavigateIndex || (oItem.getSelected() && (!this._sHighlightId || oItem.getId() === this._sHighlightId))) { // navigated or selected item is shown selected and focused (but if another one is highligted use taht one)
							if (bIsOpen && !oItem.hasStyleClass("sapMLIBFocused")) {
								oTable.setFakeFocus(oItem);
							}
						} else if (oItem.getId() === this._sHighlightId) { // matching item of typeahead is shown selected, but focus stays in field
							oItem.addStyleClass("sapMLIBSelected").updateSelectedDOM(true, oItem.$()); // as StyleClassSupport don't recognizes DOM changes
						} else {
							if (bIsOpen && oItem.hasStyleClass("sapMLIBFocused")) {
								oTable.setFakeFocus(); // as navigation could be removed in closed state
							}
							if ((!oItem.getSelected() || (this._sHighlightId && oItem.getId() !== this._sHighlightId)) && oItem.hasStyleClass("sapMLIBSelected")) { // if the highlighted item is shown as selected don't show another one as selected
								oItem.removeStyleClass("sapMLIBSelected").updateSelectedDOM(false, oItem.$()); // as StyleClassSupport don't recognizes DOM changes
							}
						}
					// } else { // multi-select
						// in multi-select case focus is on table and first match is not highlighted
					}
				}
			});
		}

		_stopUpdateSelectionAsync.call(this); // if called sync. Async-call is not needed anymore
	}

	function _updateSelectionAsync() {

		// prevent multiple selection updates if called directly in one task (update highlightId and Conditions....)
		if (!this._oUpdateSelectionPromise && !this.isDestroyed()) {
			this._oUpdateSelectionPromise = new Promise((resolve) => {
				this._iUpdateSelectionTimeout = setTimeout(() => {
					if (!this.isDestroyed()) {
						_updateSelection.call(this);
					}
					resolve();
				}, 0);
			});
		}

		return this._oUpdateSelectionPromise;

	}

	function _stopUpdateSelectionAsync() {

		if (this._iUpdateSelectionTimeout) { // if called sync. Async-call is not needed anymore
			clearTimeout(this._iUpdateSelectionTimeout);
			this._iUpdateSelectionTimeout = null;
			delete this._oUpdateSelectionPromise;
		}

	}

	MTable.prototype.onBeforeShow = function(bInitial) {

		return Promise.resolve(FilterableListContent.prototype.onBeforeShow.apply(this, arguments)).then(() => {
			if (!this._bNavigateInitialize) {
				const oTable = this._getTable();
				_attachTableEvents.call(this, oTable);
			}

			if (bInitial) {
				const oListBinding = this.getListBinding();
				const oListBindingInfo = this.getListBindingInfo();
				const bBindingSuspended = oListBinding && oListBinding.isSuspended();
				const bBindingWillBeSuspended = !oListBinding && oListBindingInfo && oListBindingInfo.suspended;

				if ((bBindingSuspended || bBindingWillBeSuspended) && !this.isTypeahead()) { // in dialog case do not resume suspended table on opening
					return undefined;
				}

				return this.applyFilters();
			}
		});

	};

	MTable.prototype.applyFilters = function() {

		// only announce updates for MTable in dialog if user triggers applyFilters
		this._bAnnounceTableUpdate = !this.isTypeahead() && this.isContainerOpen();

		if (this._iNavigateIndex >= 0 && this.getParent().isOpen()) { // initialize navigation (only if filter updated while open)
			this._iNavigateIndex = -1;
			this.removeVisualFocus(); // on new items it needs to be determined if there is a focusable item
			if (this.isSingleSelect()) {
				this.setProperty("conditions", [], true);
			}
		}

		this._sHighlightId = undefined;

		const applyAfterPromise = function() {
			if (!this.isDestroyed()) {
				return this.applyFilters();
			}
		}.bind(this);

		const oListBinding = this.getListBinding();
		const bValueHelpDelegateInitialized = this.isValueHelpDelegateInitialized();

		/*
		// Should we try to run all binding updates in sequence to prevent cache invalidation errors on the binding?

		var oRunningFilterApplicationPromise = this._retrievePromise("applyFilters");
		var oRunningInternalFilterPromise = oRunningFilterApplicationPromise && oRunningFilterApplicationPromise.isPending() && oRunningFilterApplicationPromise.getInternalPromise();

		if (oRunningInternalFilterPromise) {
			return oRunningInternalFilterPromise.then(applyAfterPromise);
		}
		*/

		let oFilterApplicationPromise;



		if ((!oListBinding || !bValueHelpDelegateInitialized) /* && (this.isContainerOpening() || this.isTypeahead())*/ ) {
			oFilterApplicationPromise = Promise.all([this.awaitListBinding(), this.awaitValueHelpDelegate()]).then(applyAfterPromise);
		}

		if (!bValueHelpDelegateInitialized || (!this.isTypeahead() && !this.isContainerOpen() && oListBinding.isSuspended())) {
			return undefined;
		}

		if (!oFilterApplicationPromise) {
			const oDelegate = this.getValueHelpDelegate();
			const oValueHelp = this.getValueHelpInstance();

			const oListBindingInfo = this.getListBindingInfo();
			const iLength = oListBindingInfo && oListBindingInfo.length;
			oDelegate.updateBindingInfo(oValueHelp, this, oListBindingInfo);
			oDelegate.updateBinding(oValueHelp, oListBinding, oListBindingInfo, this);
			oFilterApplicationPromise = Promise.resolve(oDelegate.checkListBindingPending(oValueHelp, oListBinding, iLength));
		}

		this._addPromise("applyFilters", oFilterApplicationPromise); // cancels and replaces existing ones


		return oFilterApplicationPromise.finally(() => {
			const oLatestApplyFiltersPromise = this._retrievePromise("applyFilters");
			oLatestApplyFiltersPromise?.getInternalPromise().then((bApplyFilters) => {
				this._handleFirstMatchSuggest(this._oTable.getItems());
			});
			return oLatestApplyFiltersPromise && oLatestApplyFiltersPromise.getInternalPromise(); // re-fetching the applyFilters promise, in case filterValue was changed during the filtering and a parallel run was triggered
		});
	};

	MTable.prototype._handleSelectionChange = function(oEvent) {
		const bIsTypeahead = this.isTypeahead();
		if (!bIsTypeahead || !this.isSingleSelect()) {
			const oParams = oEvent.getParameters();
			const aListItems = oParams.listItems || oParams.listItem && [oParams.listItem];

			if (bIsTypeahead && aListItems.length === 1 && containsOrEquals(aListItems[0].getDomRef(), document.activeElement) && aListItems[0].getDomRef() !== document.activeElement) {
				aListItems[0].focus(); // if CheckBox clicked focus whole row, as Checkox must not get the Focus inside dropdown
			}

			const aConditions = aListItems.map((oItem) => {
				const oItemContext = this._getListItemBindingContext(oItem);
				const oValues = this.getItemFromContext(oItemContext);
				return oValues && this.createCondition(oValues.key, oValues.description, oValues.payload);
			});
			this._fireSelect({ type: oParams.selected ? ValueHelpSelectionType.Add : ValueHelpSelectionType.Remove, conditions: aConditions });
			if (bIsTypeahead) {
				this.fireConfirm();
			}
		}
	};

	MTable.prototype._handleItemPress = function(oEvent) {
		const oItem = oEvent.getParameter("listItem");
		const oItemContext = this._getListItemBindingContext(oItem);
		const oValues = this.getItemFromContext(oItemContext);
		const oTable = this._getTable();
		const bSingleSelectMaster = oTable.getMode() === ListMode.SingleSelectMaster; // Only in this mode the item will already have the desired selection state.
		const bSelected = bSingleSelectMaster ? oItem.getSelected() : !oItem.getSelected();
		oItem.setSelected(bSelected);
		const sSelectType = bSelected ? ValueHelpSelectionType.Add : ValueHelpSelectionType.Remove;

		const oCondition = this.createCondition(oValues.key, oValues.description, oValues.payload);
		this._fireSelect({ type: sSelectType, conditions: [oCondition] });
		if (this.isTypeahead()) {
			this.fireConfirm({ close: true });
		}
	};

	MTable.prototype._updateHeaderText = function(bAllowAnnounce) {
		const oListBinding = this.getListBinding();
		if (!this.isTypeahead() && this._oTablePanel && oListBinding) {
			const sNoNumberText = this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER");
			const iRowCount = this.getListBinding()?.getCount?.() || 0;
			const sHeaderText = iRowCount > 0 ? this._oResourceBundle.getText("valuehelp.TABLETITLE", [iRowCount]) : sNoNumberText;
			this._oTablePanel.setHeaderText(sHeaderText);
			if (bAllowAnnounce && this._bAnnounceTableUpdate) {
				MTableUtil.announceTableUpdate(sNoNumberText, iRowCount);
				this._bAnnounceTableUpdate = false;
			}
		}
	};

	MTable.prototype._handleUpdateFinished = function() {
		if (this.getParent().isOpen()) { // if not open header and selection are updated in onShow
			this._updateHeaderText(true);

			_updateSelectionAsync.apply(this).then(() => {
				if (this._bScrollToSelectedItem) {
					const oTable = this._getTable();
					if (oTable && this.isTypeahead() && this.isSingleSelect()) { // if Typeahed and SingleSelect (ComboBox case) scroll to selected item
						const oSelectedItem = this._iNavigateIndex >= 0 ? oTable.getItems()[this._iNavigateIndex] : oTable.getSelectedItem();
						if (oSelectedItem) {
							this._handleScrolling(oSelectedItem);
						}
					}
					this._bScrollToSelectedItem = false;
				}
			});
		}
	};

	MTable.prototype._getTable = function() {
		return this._oTable;
	};

	/*
	 * For non-typeahead multi-select content, 'SingleSelectMaster', 'SingleSelectLeft' and 'MultiSelect' are considered valid.
	 * For typeahead content, 'SingleSelectLeft' is considered invalid.
	 * For single-select content, 'MultiSelect' mode is considered invalid.
	 */
	function _getValidTableSelectModes(bTypeahead, bEnforceSingleSelect) {
		return [
			ListMode.SingleSelectMaster,
			...bTypeahead ? [] : [ListMode.SingleSelectLeft],
			...bEnforceSingleSelect ? [] : [ListMode.MultiSelect]
		];
	}

	MTable.prototype.onShow = function(bInitial) {
		const oTable = this._getTable();
		if (oTable) {
			if (!oTable.hasStyleClass("sapMComboBoxList")) { // TODO: only in typeahead case?
				oTable.addStyleClass("sapMComboBoxList"); // to allow focus outline in navigation
			}

			const bTypeahead = this.isTypeahead();
			const bEnforceSingleSelect = FilterableListContent.prototype.isSingleSelect.apply(this);
			const sTableSelectMode = oTable.getMode();

			if (sTableSelectMode === ListMode.None) { // set selection mode, if none is given
				const sPreferredSingleSelectMode = bTypeahead ? ListMode.SingleSelectMaster : ListMode.SingleSelectLeft;
				oTable.setMode(bEnforceSingleSelect ? sPreferredSingleSelectMode : ListMode.MultiSelect);
			} else { // check if selection mode is fine
				const aValidSelectModes = _getValidTableSelectModes(bTypeahead, bEnforceSingleSelect);
				if (!aValidSelectModes.includes(sTableSelectMode)) {
					throw new Error(`Table selection mode needs to be '${aValidSelectModes.join("' or '")}'`);
				}
			}
		}

		this._updateHeaderText(); // to have initial text sync

		return FilterableListContent.prototype.onShow.apply(this, arguments).then((oResult) => {
			return Promise.resolve(this._oUpdateSelectionPromise).then(() => { // wrap in Promise to handle no running async selection update
				const bSingleSelect = this.isSingleSelect();
				if (oTable && this.isTypeahead()) {
					if (bSingleSelect) { // if Typeahed and SingleSelect (ComboBox case) scroll to selected item
						let oSelectedItem;
						if (this._iNavigateIndex >= 0) {
							oSelectedItem = oTable.getItems()[this._iNavigateIndex];
						} else if (this._sHighlightId) {
							oSelectedItem = oTable.getItems().find((oItem) => oItem.getId() === this._sHighlightId);
						} else {
							oSelectedItem = oTable.getSelectedItem();
						}
						if (oSelectedItem) {
							this._handleScrolling(oSelectedItem);
							oResult.itemId = oSelectedItem.getId();
						} else {
							this._bScrollToSelectedItem = true;

							if (oTable.getItems().length === 0 && oTable.getShowNoData()) { // if no items return no-data text to announce it on field
								oResult.itemId = oTable.getId("nodata-text");
							}
						}
					}

					oResult.items = _getItemCount.call(this);
				}

				return oResult;
			});
		});
	};

	MTable.prototype.onHide = function() {
		FilterableListContent.prototype.onHide.apply(this, arguments);
		const oTable = this.getTable();
		if (oTable) {
			this.removeVisualFocus();
			oTable?.setFakeFocus(); // to add it again if reopened
			if (oTable.hasStyleClass("sapMComboBoxList")) {
				oTable.removeStyleClass("sapMComboBoxList");
			}
			_detachTableEvents.call(this, oTable);
		}

		this._iNavigateIndex = -1; // initialize after closing
		this._bScrollToSelectedItem = false;
		this._sHighlightId = undefined;
	};

	MTable.prototype.handleConditionsUpdate = function(oChanges) {
		if (this._iNavigateIndex >= 0 && !this._bConditionSetByNavigate) { // if conditions updated initialize navigation
			const aConditions = this.getConditions();
			const oTable = this._getTable();
			const aItems = oTable.getItems();
			const oItemContext = this._getListItemBindingContext(aItems[this._iNavigateIndex]);
			if (!this._isContextSelected(oItemContext, aConditions)) {
				this._iNavigateIndex = -1;
			}
		}

		_updateSelectionAsync.call(this);
	};

	MTable.prototype.getContent = function() {
		if (!this.isTypeahead()) {
			return this._retrievePromise("wrappedContent", () => {
				return loadModules([
					"sap/ui/layout/FixFlex",
					"sap/m/VBox",
					"sap/m/Panel",
					"sap/m/ScrollContainer",
					"sap/ui/model/resource/ResourceModel"
				]).then((aModules) => {

					if (this.isDestroyStarted()) {
						return null;
					}

					const [FixFlex, VBox, Panel, ScrollContainer, ResourceModel] = aModules;

					if (!this._oContentLayout && !this.isDestroyed()) {

						this._oFilterBarVBox = new VBox(this.getId() + "-FilterBarBox");
						this._oFilterBarVBox.addStyleClass("sapMdcValueHelpPanelFilterbar");
						this._oFilterBarVBox._oWrapper = this;
						this._oFilterBarVBox.getItems = function() {
							return [this._oWrapper.getActiveFilterBar.call(this._oWrapper)];
						};

						if (!this.getModel("$i18n")) {
							// if ResourceModel not provided from outside create own one
							this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: true}), "$i18n");
						}

						this._oTablePanel = new Panel(this.getId() + "-TablePanel", { expanded: true, height: "100%", headerText: this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER") });
						this._oTablePanel.addStyleClass("sapMdcTablePanel");

						this._oContentLayout = new FixFlex(this.getId() + "-FF", { minFlexSize: 200, fixContent: this._oFilterBarVBox, flexContent: this._oTablePanel });

						this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
							height: "100%",
							width: "100%",
							vertical: true
						});

						this._oScrollContainer._oWrapper = this;
						this._oScrollContainer.getContent = function() {
							const aContent = [];
							const oTable = this._oWrapper && this._oWrapper._oTable;
							if (oTable) {
								aContent.push(oTable);
							}
							return aContent;
						};

						this._oTablePanel.addContent(this._oScrollContainer);
					}

					this.setAggregation("displayContent", this._oContentLayout);

					const oFilterBar = this.getActiveFilterBar();
					if (!oFilterBar) {
						return this._createDefaultFilterBar().then(() => {
							return this._oContentLayout;
						});
					}
					return this._oContentLayout;
				});
			});
		}
		return this._oTable;
	};

	MTable.prototype.getItemForValue = function(oConfig) {

		if (!oConfig.checkKey && !oConfig.checkDescription) {
			return null;
		}

		if (oConfig.checkKey && !oConfig.hasOwnProperty("parsedValue")) {
			throw new Error("MTable: Cannot check key without a given parsedValue! " + this.getId());
		}

		if (oConfig.checkDescription && !oConfig.hasOwnProperty("parsedDescription")) {
			throw new Error("MTable: Cannot check description without a given parsedDescription! " + this.getId());
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

		const oPromise1 = _checkListBindingPending.call(this);
		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelpInstance();
		const oPromise2 = oDelegate && oDelegate.getFilterConditions(oValueHelp, this, oConfig);

		return Promise.all([oPromise1, oPromise2]).then((aResult) => {
			const [bPending, oConditions] = aResult;

			let oResult;

			if (!bPending) {
				const oTable = this.getTable();
				if (!oResult) {
					oResult = _filterItems.call(this, oConfig, oTable.getItems(), oConditions);
				}
			}

			if (!oResult) {
				oResult = this._loadItemForValue(oConfig, oConditions);
			}

			return oResult;
		});

	};

	function _filterItems(oConfig, aItems, oConditions) {

		if (aItems.length === 0) {
			return;
		}

		const _getFilterValue = function(oItem, sPath) {
			const oBindingContext = oItem.isA("sap.ui.model.Context") ? oItem : this._getListItemBindingContext(oItem);
			return oBindingContext && oBindingContext.getProperty(sPath);
		}.bind(this);

		let aInParameters;
		let aOutParameters;

		const oFilter = _createItemFilters.call(this, oConfig, oConditions);

		const aFilteredItems = FilterProcessor.apply(aItems, oFilter, _getFilterValue);
		if (aFilteredItems.length === 1 || ( aFilteredItems.length > 1 && this.getUseFirstMatch())) {
			const oBindingContext = this._getListItemBindingContext(aFilteredItems[0]);
			const oValue = this.getItemFromContext(oBindingContext, { inParameters: aInParameters, outParameters: aOutParameters });
			return { key: oValue.key, description: oValue.description, payload: oValue.payload };
		} else if (aFilteredItems.length > 1) {
			if (!oConfig.caseSensitive) {
				// try with case sensitive search
				const oNewConfig = merge({}, oConfig);
				oNewConfig.caseSensitive = true;
				return _filterItems.call(this, oNewConfig, aItems, oConditions);
			}
			throw _createException.call(this, oConfig.exception, true, oConfig.parsedValue || oConfig.value);
		}

	}

	function _createItemFilters(oConfig, oConditions) {

		const bCaseSensitive = oConfig.caseSensitive;
		const sKeyPath = this.getKeyPath();
		const sDescriptionPath = this.getDescriptionPath();
		const aFilters = [];
		if (oConfig.checkKey && oConfig.hasOwnProperty("parsedValue")) { // empty string or false could be key too
			aFilters.push(new Filter({ path: sKeyPath, operator: FilterOperator.EQ, value1: oConfig.parsedValue, caseSensitive: bCaseSensitive }));
		}
		if (oConfig.checkDescription) {
			if (oConfig.hasOwnProperty("parsedDescription") && oConfig.parsedDescription !== undefined) {
				aFilters.push(new Filter({ path: sDescriptionPath, operator: FilterOperator.EQ, value1: oConfig.parsedDescription, caseSensitive: bCaseSensitive }));
			} else if (oConfig.value) { // TODO: do we need this fallback?
				aFilters.push(new Filter({ path: sDescriptionPath, operator: FilterOperator.EQ, value1: oConfig.value, caseSensitive: bCaseSensitive }));
			}
		}

		let oFilter = aFilters.length > 1 ? new Filter({ filters: aFilters, and: false }) : aFilters[0];

		if (oFilter && oConditions && !isEmptyObject(oConditions)) {
			const oConditionTypes = this._getTypesForConditions(oConditions);
			const oConditionsFilter = FilterConverter.createFilters(oConditions, oConditionTypes, undefined, this.getCaseSensitive());
			if (oConditionsFilter) {
				oFilter = new Filter({ filters: [oFilter, oConditionsFilter], and: true });
			}
		}

		return oFilter;

	}

	function _checkListBindingPending() {
		return this.awaitListBinding().then((oListBinding) => {
			const oDelegate = this.getValueHelpDelegate();
			const oValueHelp = this.getValueHelpInstance();
			const oListBindingInfo = this.getListBindingInfo();
			const iLength = oListBindingInfo && oListBindingInfo.length;
			if (oListBinding && oDelegate) {
				return oDelegate.checkListBindingPending(oValueHelp, oListBinding, iLength);
			} else {
				return true;
			}
		});
	}

	MTable.prototype.getListBinding = function() {
		const oTable = this._getTable();
		return oTable && oTable.getBinding("items");
	};

	MTable.prototype.getListBindingInfo = function() {
		const oTable = this._getTable();
		return oTable && oTable.getBindingInfo("items");
	};

	MTable.prototype._loadItemForValue = function(oConfig, oConditions) {

		if (!oConfig.checkKey && oConfig.parsedValue && !oConfig.checkDescription) {
			return null;
		}

		const sKeyPath = this.getKeyPath();
		const sDescriptionPath = this.getDescriptionPath();
		const bUseFirstMatch = this.getUseFirstMatch();

		const oTable = this._getTable();
		const oListBinding = oTable && oTable.getBinding("items"); //this.getListBinding();
		const sPath = oListBinding && oListBinding.getPath();

		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelpInstance();

		const oFilter = _createItemFilters.call(this, oConfig, oConditions);
		const oFilterListBinding = oListBinding.getModel().bindList(sPath, oListBinding.getContext(), undefined, oFilter);
		oFilterListBinding.initialize();

		return oDelegate.executeFilter(oValueHelp, oFilterListBinding, 2).then((oBinding) => {
			const aContexts = oBinding.getContexts();

			setTimeout(() => { // as Binding might process other steps after event was fired - destroy it lazy
				oFilterListBinding.destroy();
			}, 0);

			if (aContexts.length && (aContexts.length < 2 || bUseFirstMatch)) {
				return this.getItemFromContext(aContexts[0], { keyPath: sKeyPath, descriptionPath: sDescriptionPath, inParameters: undefined });
			} else if (oConfig.checkKey && oConfig.parsedValue === "" && aContexts.length === 0) {
				// nothing found for empty key -> this is not an error
				return null;
			} else {
				const oException = _createException.call(this, oConfig.exception, aContexts.length > 1, oConfig.value);
				throw oException;
			}
		});
	};

	function _createException(Exception, bNotUnique, vValue) {

		let sError;
		if (bNotUnique) {
			sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_UNIQUE", [vValue]);
		} else {
			sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]);
		}
		const oException = new Exception(sError);
		oException._bNotUnique = bNotUnique; // TODO: better solution?
		return oException;

	}

	MTable.prototype.isValidationSupported = function(oConfig) {
		return true;
	};

	MTable.prototype.navigate = function(iStep) {

		const bIsOpen = this.getParent().isOpen();

		if (!bIsOpen && this._iNavigateIndex < 0 && !this._bNavigateInitialize) {
			this._bNavigateInitialize = true;
			this.onBeforeShow(true).then(() => { // to determine intial filters, update bindings and load data
				this.onShow(true).then((oResult) => {
					this.navigate(iStep);
				});
			});
			return;
		}

		this._bNavigateInitialize = false;

		const oListBinding = this.getListBinding();

		if (!oListBinding || !oListBinding.getLength()) {
			_checkListBindingPending.call(this).then((bPending) => {
				if (!bPending && oListBinding.getLength() !== 0) { // if no items - no navigation is possible
					this.navigate(iStep);
				}
			});
			return;
		}

		const bSingleSelect = this.isSingleSelect();
		const oTable = this._getTable();
		const aItems = oTable.getItems();
		const iNavigateIndex = this._iNavigateIndex < 0 && this._sHighlightId ? aItems.findIndex((oItem) => oItem.getId() === this._sHighlightId) : this._iNavigateIndex;  // use highlight item as initial entry
		const oSelectedItem = iNavigateIndex >= 0 ? aItems[iNavigateIndex] : bSingleSelect && oTable.getSelectedItem(); // in MultiSelect, selected item makes no sense
		const iItems = aItems.length;
		let iSelectedIndex = 0;
		let bLeaveFocus = false;

		if (iStep === 9999) {
			// this will only move the selection to the last known item
			iSelectedIndex = iItems - 1;
		} else if (iStep === -9999) {
			iSelectedIndex = 0;
		} else if (oSelectedItem) {
			iSelectedIndex = aItems.indexOf(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0) {
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		let bSearchForNext;
		let bEndReached = false;
		if (iSelectedIndex < 0) { //TODO on a single value mTable we only navigate up to index 0. We can not set the focus on the captions/header
			iSelectedIndex = 0;
			bSearchForNext = true;
			bLeaveFocus = true;
		} else if (iSelectedIndex >= iItems - 1) {
			if (iSelectedIndex >= iItems) {
				bEndReached = true;
			}
			iSelectedIndex = iItems - 1;
			bSearchForNext = false;
		} else {
			bSearchForNext = iStep >= 0;
		}

		this.setHighlightId();

		if (!bIsOpen) { // if closed, ignore headers
			const fSkipGroupHeader = function() {
				while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
					if (bSearchForNext) {
						iSelectedIndex++;
					} else {
						iSelectedIndex--;
					}
				}
			};
			const fSkipSelected = () => {
				const aConditions = this.getConditions();
				while (aItems[iSelectedIndex] && this._isContextSelected(this._getListItemBindingContext(aItems[iSelectedIndex]), aConditions)) { // ignore selected items
					if (bSearchForNext) {
						iSelectedIndex++;
					} else {
						iSelectedIndex--;
					}
				}
			};

			fSkipGroupHeader();
			if (!bSingleSelect) { // on multi-selection skip already selected items
				fSkipSelected();
			}
			if (iSelectedIndex < 0 || iSelectedIndex > iItems - 1) {
				// find last not groupable item
				bSearchForNext = !bSearchForNext;
				bLeaveFocus = iSelectedIndex < 0;
				iSelectedIndex = iSelectedIndex < 0 ? 0 : iItems - 1;
				fSkipGroupHeader();
				if (!bSingleSelect) { // on multi-selection skip already selected items
					fSkipSelected();
				}
			}
		} else if (!bSingleSelect) {
			// in case of multiToken field the focus can be set to the table and the navigation will be handled by the focused table control.
			if (aItems[iSelectedIndex]) {
				aItems[iSelectedIndex].focus();
			} else {
				oTable.focus();
			}
			return;
		} else if (bEndReached && this._oShowAllItemsButton) { // got to "show all items"
			if (oSelectedItem) {
				oSelectedItem.setSelected(false);
				oTable.setFakeFocus();
				oSelectedItem.removeStyleClass("sapMLIBSelected");
			}
			this._iNavigateIndex = -1;
			this.setProperty("conditions", [], true);
			this.fireNavigated({ condition: undefined, itemId: undefined, leaveFocus: false });
			this._oShowAllItemsButton.focus();
			return;
		}

		const oItem = aItems[iSelectedIndex];
		if (oItem) {

			if (oItem !== oSelectedItem || (this._iNavigateIndex !== iSelectedIndex && !bLeaveFocus)) { // new item or already selected or highlighted item is navigated (focus set on dropdown)
				let oCondition;
				const aConditions = [];
				const oValueHelpDelegate = this.getValueHelpDelegate();
				const bCaseSensitive = oValueHelpDelegate.isFilteringCaseSensitive(this.getValueHelpInstance(), this);

				this._iNavigateIndex = iSelectedIndex;

				// in case of a single value field fake the focus on the new selected item to update the screenreader invisible text
				if (bIsOpen) {
					this._handleScrolling(oItem);
					oTable.setFakeFocus(oItem);
					this.setVisualFocus(); // to show focus outline on navigated item
					this.fireVisualFocusSet();
				}

				if (!oItem.isA("sap.m.GroupHeaderListItem")) { // for GroupHeader no condition navigated
					const oItemContext = this._getListItemBindingContext(oItem);
					const oValues = this.getItemFromContext(oItemContext);
					oCondition = oValues && this.createCondition(oValues.key, oValues.description, oValues.payload);
					aConditions.push(oCondition);
				}
				if (bSingleSelect) {
					this._bConditionSetByNavigate = true;
					this.setProperty("conditions", aConditions, true); // update item-selection async to do it after Field sets aria-activedescendant to new item to prevent reading of old item
					_updateSelectionAsync.call(this); // as condition property might be set to the previous value what don't trigger Observer
					delete this._bConditionSetByNavigate;
				}
				this.fireNavigated({ condition: oCondition, itemId: oItem.getId(), leaveFocus: false, caseSensitive: bCaseSensitive });
			} else if (bLeaveFocus) {
				if (bSingleSelect) { // in multiSelection navigation only in closed mode possible - so no focus issues will happen
					this._iNavigateIndex = -1; // initialize navigation but keep coditions to show last navigated one as selected
				}
				this.fireNavigated({ condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus });
			}
		}
	};

	MTable.prototype.isNavigationEnabled = function(iStep) {

		if (iStep === 1 || iStep === -1) {
			if (iStep === 1 || (iStep === -1 && (this.isSingleSelect() || !this.getParent().isOpen()))) { // prevent arrow-up navigation to end on multi-selection on opened table
				return true;
			} else {
				return false;
			}
		} else if (this.isSingleSelect()) { // prevent Home/End navigation to end on multi-selection on opened and closed table
			const oListBinding = this.getListBinding();
			const oBindingInfo = this.getListBindingInfo();
			if ((oListBinding?.isLengthFinal() || oBindingInfo.length) && !oListBinding?.isSuspended()) { // if all relevant items known, allow Home/End...
				// TODO: what if ListBinding pending?
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}

	};

	MTable.prototype._handleScrolling = function(oItem) {
		const oScrollDelegate = this.getScrollDelegate();
		if (oScrollDelegate) {
			const oTable = this._getTable();
			const iIndex = !isNaN(oItem) ? oItem : oTable.indexOfItem(oItem);
			oTable.scrollToIndex(iIndex).catch((oError) => {
				// TODO: Handle scroll error?
			});
			return true;
		}
		return false;
	};

	// Table needs to know the ScrollDelegate of the parent, so we provide it here.
	MTable.prototype.getScrollDelegate = function() {
		if ( /* !this.isTypeahead()  && */ this._oScrollContainer) {
			return this._oScrollContainer.getScrollDelegate();
		}
		return FilterableListContent.prototype.getScrollDelegate.apply(this, arguments);
	};


	MTable.prototype.removeVisualFocus = function() {

		const oTable = this.getTable();
		oTable?.removeStyleClass("sapMListFocus");
		// don't remove FakeFocus here as focus can be moved to field, but selected item is still visible

	};

	MTable.prototype.setVisualFocus = function() {

		const oTable = this.getTable();
		if (oTable && this.isTypeahead()) { // Opened via F4 should set the focus to table
			if (this.isSingleSelect()) {
				if (!oTable.hasStyleClass("sapMListFocus")) {
					oTable.addStyleClass("sapMListFocus");
				}
			} else { // in multi-select real focus is needed
				oTable.focus();
			}
		}

	};

	MTable.prototype.getAriaAttributes = function(iMaxConditions) {

		const oTable = this.getTable();
		const bIsTypeahead = this.isTypeahead();
		const bUseAsValueHelp = this.getUseAsValueHelp();
		let sRoleDescription = null;

		if (iMaxConditions !== 1 && ((bIsTypeahead && bUseAsValueHelp) || !bIsTypeahead)) {
			const sapMResourceBundle = _getSAPMResourceBundle.apply(this);
			sRoleDescription = sapMResourceBundle.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION");
		}

		return { // return default values, but needs to be implemented by specific content
			contentId: oTable && oTable.getId(), // if open, table should be there; if closed, not needed
			ariaHasPopup: "listbox",
			roleDescription: sRoleDescription,
			valueHelpEnabled: !bIsTypeahead, // a dropdown on a popover is not seen as value help
			autocomplete: this.getUseFirstMatch() ? "both" : "none" // first match is used for autocomplete
		};
	};

	MTable.prototype._handleFirstMatchSuggest = function () {
		const bTypeahead = this.isTypeahead();
		const aItems = this._oTable?.getItems();
		const sFilterValue = this.getFilterValue();
		const bUseFirstMatch = this.getUseFirstMatch();

		if (bTypeahead && bUseFirstMatch && sFilterValue && !this._bNavigateInitialize) {
			const oValueHelpDelegate = this.getValueHelpDelegate();
			const bCaseSensitive = oValueHelpDelegate.isFilteringCaseSensitive(this.getValueHelpInstance(), this);
			let oFirstMatchContext;
			let iItems = 0;

			if (aItems?.length) {
				const aConditions = this.getConditions();
				if (aConditions.length === 1 && this.isSingleSelect()) { // In single selection show selected condition on reopening
					for (let i = 0; i < aItems.length; i++) {
						const oItemContext = this._getListItemBindingContext(aItems[i]);
						if (this._isContextSelected(oItemContext, aConditions)) {
							oFirstMatchContext = oItemContext;
							break;
						}
					}
				}
				if (!oFirstMatchContext) {
					oFirstMatchContext = oValueHelpDelegate.getFirstMatch(this.getValueHelpInstance(), this, {
						value: this.getFilterValue(),
						checkDescription: !!this.getDescriptionPath(),
						control: this.getControl(),
						caseSensitive: this.getCaseSensitive()
					});
				}
				iItems = _getItemCount.call(this);
			}

			if (oFirstMatchContext) {
				const oValueHelpItem = this.getItemFromContext(oFirstMatchContext);
				const oCondition = this.createCondition(oValueHelpItem.key, oValueHelpItem.description, oValueHelpItem.payload);
				const oListItem = aItems.find((oItem) => this._getListItemBindingContext(oItem) === oFirstMatchContext);
				this.fireTypeaheadSuggested({ condition: oCondition, filterValue: sFilterValue, itemId: oListItem?.getId(), items: iItems, caseSensitive: bCaseSensitive });
			} else { // nothing found for autocomplete
				this.fireTypeaheadSuggested({ condition: null, filterValue: sFilterValue, itemId: null, items: iItems, caseSensitive: bCaseSensitive });
			}
		}
	};

	function _getSAPMResourceBundle() {
		if (!this._oResourceBundleM) {
			this._oResourceBundleM = Library.getResourceBundleFor("sap.m"); // sap.m is always loaded
		}
		return this._oResourceBundleM;
	}

	MTable.prototype.getContainerConfig = function() {
		return {
			'sap.ui.mdc.valuehelp.Popover': {
				getContentHeight: function() {
					const oTable = this._getTable();
					const oDomRef = oTable && oTable.getDomRef();
					return oDomRef && Math.round(oDomRef.getBoundingClientRect().height);
				}.bind(this),
				getFooter: function() {
					return this._retrievePromise("footer", () => {
						return this.awaitListBinding().then((oListBinding) => {
							const oBindingInfo = this.getListBindingInfo();
							const bDialogExist = this.getParent().hasDialog();

							if (bDialogExist && oBindingInfo && oBindingInfo.length && !Device.system.phone) {
								return loadModules(["sap/m/Button", "sap/m/Toolbar", "sap/m/ToolbarSpacer"]).then((aModules) => {

									if (this.isDestroyStarted()) {
										return null;
									}

									const [Button, Toolbar, ToolbarSpacer] = aModules;

									const oShowAllButtonDelegate = {
										onsapup(oEvent) {
											const oTable = this._getTable();
											if (oTable.getMode() === ListMode.MultiSelect) {
												// in Multi-Select mode, focus last item
												const aItems = oTable.getItems();
												if (aItems.length > 0) {
													oEvent.stopPropagation();
													oEvent.stopImmediatePropagation(true);
													oEvent.preventDefault();
													this._bFocusTable = true;
													aItems[aItems.length - 1].focus();
												}
											} else {
												// in Single-Select mode, navigate back to last item
												oEvent.stopPropagation();
												oEvent.stopImmediatePropagation(true);
												oEvent.preventDefault();
												this.navigate(9999);
											}
										},
										onsapfocusleave(oEvent) {
											const oFocusedControl = oEvent.relatedControlId && Element.getElementById(oEvent.relatedControlId);
											const oContainer = this.getParent();
											if (oContainer && oFocusedControl && containsOrEquals(oContainer.getDomRef(), oFocusedControl.getFocusDomRef())) { // focus still on Popover
												oEvent.stopPropagation();
												oEvent.stopImmediatePropagation(true);
												oEvent.preventDefault();
												const oTable = this._getTable();
												if (oTable.getMode() === ListMode.MultiSelect) {
													// go back to field (to break out of the focus-cycle on popover)
													if (!this._bFocusTable) { // not focused via arrow-up
														this.fireNavigated({ condition: undefined, itemId: undefined, leaveFocus: true }); // to restore autocomplete
													}
													delete this._bFocusTable;
												} else {
													// Single-Select mode -> navigate to first item
													this.navigate(-9999);
												}
											}
										}
									};

									this._oShowAllItemsButton = new Button(this.getId() + "-showAllItems", {
										text: this._oMResourceBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
										press: function() {
											this.fireRequestSwitchToDialog();
										}.bind(this)
									});
									this._oShowAllItemsButton.addDelegate(oShowAllButtonDelegate, true, this);
									const aToolbarContent = [new ToolbarSpacer(this.getId() + "-Spacer")].concat(this._oShowAllItemsButton);
									const oFooter = new Toolbar(this.getId() + "-TB", {
										content: aToolbarContent
									});
									return oFooter;
								});
							}
						});
					});
				}.bind(this)
			}
		};
	};

	function _adjustTable() {
		if (this._oTable && this.getParent()) {

			const aSticky = this._oTable.getSticky();
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

	MTable.prototype.observeChanges = function(oChanges) {

		if (oChanges.name === "config") {
			_adjustTable.call(this);
		}

		if (oChanges.name === "items" && oChanges.mutation === "ready") {
			this.resolveListBinding();
		}

		if (oChanges.name === "table") {
			this._sHighlightId = undefined;
			const oTable = oChanges.child;

			if (oChanges.mutation === "remove") {
				this._oObserver.unobserve(oTable);
				_detachTableEvents.call(this, oTable);
				this._oTable = null;
				this._removePromise("footer");
				this.resetListBinding();
			} else {
				this._oTable = oTable;
				this._oTable.addStyleClass("sapMdcValueHelpMTable");
				_adjustTable.call(this);

				if (!this.resolveListBinding()) {
					this._oObserver.observe(oChanges.child, { bindings: ["items"] });
				}
			}
		}

		FilterableListContent.prototype.observeChanges.apply(this, arguments);
	};

	MTable.prototype._handleTableEvent = function(oEvent) {

		if (!this.isTypeahead()) {
			return;
		}

		const oTable = this._getTable();
		const oItem = Element.closestTo(oEvent.target);

		switch (oEvent.type) {
			case "sapprevious":
				if (oItem.isA("sap.m.ListItemBase")) {
					if (oTable.indexOfItem(oItem) === 0) {
						this.fireNavigated({ condition: undefined, itemId: undefined, leaveFocus: true });
						oEvent.preventDefault();
						oEvent.stopPropagation();
						oEvent.stopImmediatePropagation(true);
					}
				}
				break;
			case "sapnext":
				if (oItem.isA("sap.m.ListItemBase") && this._oShowAllItemsButton) {
					const aItems = oTable.getItems();
					if (aItems.indexOf(oItem) === aItems.length - 1) { // end reached, focus show-all to behave similar to single-select
						oEvent.preventDefault();
						oEvent.stopPropagation();
						oEvent.stopImmediatePropagation(true);
						this._oShowAllItemsButton.focus();
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

	MTable.prototype.isSingleSelect = function() {

		// use selection mode of table if set
		const oTable = this._getTable();
		if (oTable && oTable.getMode() !== ListMode.None) { // as automatic determination happens later in onShow
			if (oTable.getMode() === ListMode.MultiSelect) {
				return false;
			} else {
				return true;
			}
		} else {
			return FilterableListContent.prototype.isSingleSelect.apply(this, arguments);
		}

	};

	MTable.prototype.onConnectionChange = function() {
		this._sHighlightId = undefined;
		this._iNavigateIndex = -1; // initially nothing is navigated
	};

	MTable.prototype.exit = function() {
		_stopUpdateSelectionAsync.call(this); // if destroyed Async-call is not needed anymore

		Common.cleanup(this, [
			"_sTableWidth",
			"_oTable",
			"_oScrollContainer",
			"_oContentLayout",
			"_oTablePanel",
			"_oFilterBarVBox",
			"_oMResourceBundle",
			"_oResourceBundle",
			"_oTableDelegate",
			"_sHighlightId",
			"_bAnnounceTableUpdate"
		]);

		FilterableListContent.prototype.exit.apply(this, arguments);
	};

	MTable.prototype.setHighlightId = function (sHighlightId) {
		if (this._sHighlightId !== sHighlightId) {
			this._sHighlightId = sHighlightId;
			_updateSelectionAsync.call(this);
		}
	};

	MTable.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		const oTable = this._getTable();
		const bAttached = oTable?._bAttached;
		if (bAttached) {
			_detachTableEvents.call(this, oTable);
		}

		const oClone = FilterableListContent.prototype.clone.apply(this, arguments);

		if (bAttached) {
			_attachTableEvents.call(this, oTable);
		}

		return oClone;

	};

	function _attachTableEvents(oTable) {

		if (!oTable._bAttached) {
			oTable.attachItemPress(this._handleItemPress, this);
			oTable.attachSelectionChange(this._handleSelectionChange, this);
			oTable.attachUpdateFinished(this._handleUpdateFinished, this);
			this._oTableDelegate = this._oTableDelegate || {
				onsapprevious: this._handleTableEvent,
				onsapnext: this._handleTableEvent,
				cellClick: this._handleTableEvent
			};
			oTable.addDelegate(this._oTableDelegate, true, this);
			oTable._bAttached = true;
		}

	}

	function _detachTableEvents(oTable) {

		if (oTable._bAttached) {
			oTable.removeDelegate(this._oTableDelegate);
			this._oTable.detachItemPress(this._handleItemPress, this);
			this._oTable.detachSelectionChange(this._handleSelectionChange, this);
			this._oTable.detachUpdateFinished(this._handleUpdateFinished, this);
			oTable._bAttached = false;
		}

	}

	function _getItemCount() {

		const oListBinding = this.getListBinding();
		const oBindingInfo = this.getListBindingInfo();
		let iCount = oListBinding?.getCount(); // on oData V4 only defined if $count ist used or all items are known.

		if (iCount === undefined && (oListBinding?.isLengthFinal() || oBindingInfo.length)) { // there are no additional unread items or shown items are limited.
			const aRelevantContexts = this.getListBinding().getCurrentContexts();
			iCount = aRelevantContexts?.length;
		}

		return iCount;

	}

	return MTable;
});