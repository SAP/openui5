/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	'sap/ui/mdc/util/loadModules',
	'sap/ui/mdc/valuehelp/base/ListContent',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	"sap/ui/mdc/enums/OperatorName",
	'sap/ui/mdc/util/Common',
	'sap/m/p13n/enums/PersistenceMode',
	'sap/m/p13n/Engine',
	'sap/base/util/merge',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/base/Log'
], (
	Library,
	loadModules,
	ListContent,
	Condition,
	ConditionValidated,
	OperatorName,
	Common,
	PersistenceMode,
	Engine,
	merge,
	StateUtil,
	FilterOperatorUtil,
	Log
) => {
	"use strict";

	/**
	 * Constructor for a new <code>FilterableListContent</code>.
	 *
	 * This is the basis for various types of value help content with filter functionality. It cannot be used directly.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element.
	 * @extends sap.ui.mdc.valuehelp.base.ListContent
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.base.FilterableListContent
	 */
	const FilterableListContent = ListContent.extend("sap.ui.mdc.valuehelp.base.FilterableListContent", /** @lends sap.ui.mdc.valuehelp.base.FilterableListContent.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The path of the key field in the content binding.
				 * If a table is used as content, this is the binding path of the key of the items.
				 */
				keyPath: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * The path of the description field in the content binding.
				 * If a table is used as content, this is the binding path of the description of the items.
				 */
				descriptionPath: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If set, all contents with the same group are arranged together on one tab.
				 *
				 * The label of the groups can be defined on the container via {@link sap.ui.mdc.valuehelp.Dialog#setGroupConfig setGroupConfig}.
				 */
				group: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * {@link sap.ui.mdc.valuehelp.FilterBar FilterBar} used for filtering.
				 */
				filterBar: {
					type: "sap.ui.mdc.valuehelp.FilterBar",
					multiple: false
				},
				/**
				 * Default {@link sap.ui.mdc.valuehelp.FilterBar FilterBar}, created internally if none given.
				 */
				_defaultFilterBar: {
					type: "sap.ui.mdc.valuehelp.FilterBar",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {},
			events: {}
		}
	});

	FilterableListContent.prototype.init = function() {
		ListContent.prototype.init.apply(this, arguments);
		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		this._oObserver.observe(this, {
			aggregations: ["_defaultFilterBar", "filterBar"]
		});

		Engine.getInstance().defaultProviderRegistry.attach(this, PersistenceMode.Transient);
		this.resetListBinding();
	};

	FilterableListContent.prototype.resetListBinding = function() {
		return this._addPromise("listBinding");
	};

	FilterableListContent.prototype.awaitListBinding = function() {
		return this._retrievePromise("listBinding");
	};

	FilterableListContent.prototype.resolveListBinding = function() {
		const oListBinding = this.getListBinding();
		if (oListBinding) {
			this._resolvePromise("listBinding", oListBinding);
			this._updateBasicSearchField();
			return oListBinding;
		}
	};

	FilterableListContent.prototype.handleFilterValueUpdate = function(oChanges) {
		if ((this.isContainerOpening() || this.isContainerOpen()) && this._bContentBound) {
			Promise.resolve(this.applyFilters()).finally(function() {
				ListContent.prototype.handleFilterValueUpdate.apply(this, arguments);
			}.bind(this));
		}
	};

	/**
	 * Applies the filter to the content control.
	 * @protected
	 */
	FilterableListContent.prototype.applyFilters = function() {

	};


	FilterableListContent.prototype._prettyPrintFilters = function(oFilter) {

		let sRes;
		if (!oFilter) {
			return "";
		}
		if (Array.isArray(oFilter)) {
			sRes = "";
			oFilter.forEach(function(oFilter, iIndex, aFilters) {
				sRes += this._prettyPrintFilters(oFilter);
				if (aFilters.length - 1 != iIndex) {
					sRes += " or ";
				}
			}, this);
			return "(" + sRes + ")";
		} else if (oFilter._bMultiFilter) {
			sRes = "";
			const { bAnd } = oFilter;
			oFilter.aFilters.forEach(function(oFilter, iIndex, aFilters) {
				sRes += this._prettyPrintFilters(oFilter);
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
	};

	FilterableListContent.prototype.getItemFromContext = function(oBindingContext, oOptions) {

		const sKeyPath = (oOptions && oOptions.keyPath) || this.getKeyPath();
		const sDescriptionPath = (oOptions && oOptions.descriptionPath) || this.getDescriptionPath();
		let vKey;
		let sDescription;
		//var sPath;

		if (!sKeyPath) {
			throw new Error("KeyPath missing"); // as we cannot determine key without keyPath
		}

		if (oBindingContext) {
			vKey = sKeyPath ? oBindingContext.getProperty(sKeyPath) : undefined;
			sDescription = sDescriptionPath ? oBindingContext.getProperty(sDescriptionPath) : undefined;
		}

		if (vKey === null || vKey === undefined) {
			return false;
		}

		const oPayload = this.createConditionPayload([vKey, sDescription], oBindingContext);


		return { key: vKey, description: sDescription, payload: oPayload };
	};

	/**
	 * Creates a payload for a value.
	 * @param {any[]} aValues Values (key, description)
	 * @param {any} vContext context
	 * @returns {object} payload
	 * @protected
	 */
	FilterableListContent.prototype.createConditionPayload = function(aValues, vContext) {
		let oConditionPayload;
		const oDelegate = this.getValueHelpDelegate();

		if (oDelegate) {
			const oValueHelp = this.getValueHelpInstance();
			oConditionPayload = {};
			oConditionPayload = oDelegate.createConditionPayload(oValueHelp, this, aValues, vContext);
		}
		return oConditionPayload;
	};

	FilterableListContent.prototype._isContextSelected = function(oContext, aConditions) {
		return !!oContext && !!this._findConditionsForContext(oContext, aConditions).length;
	};

	FilterableListContent.prototype._findConditionsForContext = function(oContext, aConditions) {
		const oDelegate = this.isValueHelpDelegateInitialized() && this.getValueHelpDelegate();
		if (oContext && oDelegate) {
			// <!-- Support for deprecated delegate method isFilterableListItemSelected
			if (oDelegate.isFilterableListItemSelected) {
				Log.warning("MDC.ValueHelp", "Delegate method 'isFilterableListItemSelected' is deprecated, please implement 'findConditionsForContext' instead.");

				const bRepresentsConditions = oDelegate.isFilterableListItemSelected(this.getValueHelpInstance(), this, {
					getBindingContext: function() {
						return oContext; // Dirty way to simulate listitem.getBindingContext()
					}
				}, aConditions);

				if (bRepresentsConditions) {
					const oValues = this.getItemFromContext(oContext);
					const oContextCondition = oValues && this.createCondition(oValues.key, oValues.description, oValues.payload);

					return aConditions.filter((oCondition) => {
						return FilterOperatorUtil.compareConditions(oCondition, oContextCondition);
					});
				}
				return [];
			}
			// -->
			return oDelegate.findConditionsForContext(this.getValueHelpInstance(), this, oContext, aConditions);
		}
		return [];
	};

	/**
	 * Creates the default <code>FilterBar</code> control.
	 * @returns {Promise<sap.ui.mdc.valuehelp.FilterBar>} FilterBar
	 */
	FilterableListContent.prototype._createDefaultFilterBar = function() {
		return loadModules([
			"sap/ui/mdc/valuehelp/FilterBar"
		]).then((aModules) => {
			if (this.isDestroyStarted()) {
				return null;
			}
			const FilterBar = aModules[0];
			const oFilterBar = new FilterBar(this.getId() + "-FB", {
				liveMode: false, // !oWrapper.isSuspended(), // if suspended, no live search
				showGoButton: true
			});
			this.setAggregation("_defaultFilterBar", oFilterBar, true);
			return oFilterBar;
		});
	};

	FilterableListContent.prototype._handleSearch = function(oEvent) {
		const oFilterBar = oEvent.getSource();
		this._setLocalFilterValue(oFilterBar.getSearch());
		this.applyFilters();

	};

	FilterableListContent.prototype._updateBasicSearchField = function() {
		const oFilterBar = this.getActiveFilterBar();
		if (oFilterBar) {
			const oExistingBasicSearchField = oFilterBar.getBasicSearchField();

			const bSearchSupported = this.isSearchSupported();
			const sSearchPath = "$search";

			if (!oExistingBasicSearchField && bSearchSupported) {
				if (!this._oSearchField) {
					return loadModules([
						"sap/ui/mdc/FilterField"
					]).then((aModules) => {
						if (!oFilterBar.isDestroyed()) {
							const FilterField = aModules[0];
							this._oSearchField = new FilterField(this.getId() + "-search", {
								conditions: "{$filters>/conditions/" + sSearchPath + "}",
								propertyKey: sSearchPath,
								placeholder: "{$i18n>filterbar.SEARCH}",
								label: "{$i18n>filterbar.SEARCH}", // TODO: do we want a label?
								maxConditions: 1,
								width: "50%"
							});
							this._oSearchField._bCreatedByValueHelp = true;
							this._updateBasicSearchField();
						}
					});
				}
				oFilterBar.setBasicSearchField(this._oSearchField);
				// oExistingBasicSearchField.setConditions([]);
			} else if (oExistingBasicSearchField) {
				if (bSearchSupported) {
					//oExistingBasicSearchField.setConditions([]); // initialize search field
				} else if (oExistingBasicSearchField._bCreatedByValueHelp) {
					oFilterBar.setBasicSearchField(); // remove to reuse on other FilterBar
				}
			}
		}
	};

	FilterableListContent.prototype.onContainerClose = function() {
		this._setLocalFilterValue(undefined);
	};

	/**
	 * Gets the currently used <code>FilterBar</code> control.
	 * @returns {sap.ui.mdc.valuehelp.FilterBar} FilterBar
	 *
	 * @since: 1.121.0
	 * @protected
	 */
	FilterableListContent.prototype.getActiveFilterBar = function() {
		return this.getFilterBar() || this.getAggregation("_defaultFilterBar");
	};

	FilterableListContent.prototype.observeChanges = function(oChanges) {
		if (oChanges.object == this) {
			let oFilterBar;

			if (["_defaultFilterBar", "filterBar"].indexOf(oChanges.name) !== -1) {
				oFilterBar = oChanges.child;
				let oDefaultFilterBar;
				if (oChanges.mutation === "insert") {
					this._updateBasicSearchField();
					this._assignCollectiveSearchSelect();
				} else { // remove case
					const oExistingBasicSearchField = oFilterBar.getBasicSearchField();
					if (oExistingBasicSearchField && oExistingBasicSearchField._bCreatedByValueHelp) {
						oFilterBar.setBasicSearchField(); // remove to reuse on other FilterBar
					}

					if (oChanges.name === "filterBar") {
						oDefaultFilterBar = this.getAggregation("_defaultFilterBar");
						if (!oDefaultFilterBar) {
							this._createDefaultFilterBar();
						}
					}
				}
			}
		}
		ListContent.prototype.observeChanges.apply(this, arguments);
	};

	FilterableListContent.prototype.getCollectiveSearchKey = function() {
		return this._oCollectiveSearchSelect && this._oCollectiveSearchSelect.getSelectedItemKey();
	};

	/**
	 * Gets the <code>BindingInfo</code> of the content.
	 * @returns {sap.ui.base.ManagedObject.AggregationBindingInfo} <code>ListBindingInfo</code>
	 * @protected
	 */
	FilterableListContent.prototype.getListBindingInfo = function() {
		throw new Error("FilterableListContent: Every filterable listcontent must implement this method.");
	};

	/**
	 * Gets the <code>BindingContext</code> for an item.
	 * @param {sap.ui.core.Element} oItem item
	 * @returns {sap.ui.model.Context} <code>BindingContext</code>
	 */
	FilterableListContent.prototype._getListItemBindingContext = function(oItem) {
		const sModelName = this.getListBindingInfo().model;
		return oItem && oItem.getBindingContext(sModelName);
	};

	/**
	 * Gets the control that holds the initial focus.
	 * @returns {sap.ui.core.control} control
	 */
	FilterableListContent.prototype.getInitialFocusedControl = function() {
		return this.getActiveFilterBar().getInitialFocusedControl();
	};

	/**
	 * Provides type information for listcontent filtering.
	 * @param {object} oConditions set of conditions to create filters for
	 * @returns {object} Returns a type map for property paths
	 */
	FilterableListContent.prototype._getTypesForConditions = function(oConditions) {
		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelpInstance();
		return oDelegate ? oDelegate.getTypesForConditions(oValueHelp, this, oConditions) : {};
	};

	/**
	 * Gets the formatted title based on the number of conditions.
	 * @param {int} iCount number of conditions
	 * @returns {string} formatted title
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	FilterableListContent.prototype.getFormattedTitle = function(iCount) {
		let sTitle = ListContent.prototype.getFormattedTitle.apply(this, arguments);
		if (!sTitle) {
			sTitle = this._oResourceBundle.getText(iCount ? "valuehelp.SELECTFROMLIST" : "valuehelp.SELECTFROMLISTNONUMBER", [iCount]);
		}
		return sTitle;
	};

	/**
	 * Gets the formatted short-title.
	 * @returns {string} formatted short-title
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	FilterableListContent.prototype.getFormattedShortTitle = function() {
		let sShortTitle = this.getShortTitle();
		if (!sShortTitle) {
			sShortTitle = this._oResourceBundle.getText("valuehelp.SELECTFROMLIST.Shorttitle");
		}
		return sShortTitle;
	};

	/**
	 * Gets the formatted tokenizer-title based on the number of conditions.
	 * @param {int} iCount number of conditions
	 * @returns {string} formatted tokenizer-title
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	FilterableListContent.prototype.getFormattedTokenizerTitle = function(iCount) {
		let sTokenizerTitle = this.getTokenizerTitle();
		if (!sTokenizerTitle) {
			sTokenizerTitle = this._oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitle" + (iCount === 0 ? "NoCount" : ""), [iCount]);
		}
		return sTokenizerTitle;
	};

	FilterableListContent.prototype.isSearchSupported = function() {
		return !!this.isValueHelpDelegateInitialized() && !!this.getValueHelpDelegate()?.isSearchSupported(this.getValueHelpInstance(), this, this.getListBinding());
	};

	/**
	 * Sets the collective Search to the <code>FilterBar</code>.
	 *
	 * @param {sap.ui.mdc.valuehelp.CollectiveSearchSelect} oCollectiveSearchSelect Collective search control
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.Dialog
	 */
	FilterableListContent.prototype.setCollectiveSearchSelect = function(oCollectiveSearchSelect) {
		this._oCollectiveSearchSelect = oCollectiveSearchSelect;
		this._assignCollectiveSearchSelect();
	};

	FilterableListContent.prototype._assignCollectiveSearchSelect = function() {
		const oFilterBar = this.getActiveFilterBar();
		if (oFilterBar.setCollectiveSearch) {
			oFilterBar.setCollectiveSearch(this._oCollectiveSearchSelect); // remove it if empty
		}
	};

	/**
	 * Executes logic before content is shown.
	 * @param {boolean} bInitial If <code>true</code> this is the first time the content is shown
	 * @returns {Promise} Promise resolved if content is ready to be shown
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	FilterableListContent.prototype.onBeforeShow = function(bInitial) {
		if (bInitial) {
			this._updateBasicSearchField();
			const oDelegate = this.getValueHelpDelegate();
			return Promise.resolve(oDelegate && oDelegate.getFilterConditions(this.getValueHelpInstance(), this)).then((oConditions) => {
				this._oInitialFilterConditions = oConditions;

				const oFilterBar = this.getActiveFilterBar();
				if (oFilterBar) {
					// apply initial conditions to filterbar if existing
					const sSearchPath = "$search";

					const oNewConditions = merge({}, this._oInitialFilterConditions);
					const pHandleConditions = Promise.resolve(!oNewConditions[sSearchPath] && StateUtil.retrieveExternalState(oFilterBar).then((oState) => {
						if (bInitial) {
							_addSearchConditionToConditionMap(oNewConditions, sSearchPath, this.getSearch());
							return StateUtil.diffState(oFilterBar, oState, { filter: oNewConditions });
						}
					})).then((oStateDiff) => {
						return StateUtil.applyExternalState(oFilterBar, oStateDiff);
					});

					oFilterBar.cleanUpAllFilterFieldsInErrorState();
					oFilterBar.attachSearch(this._handleSearch, this); // event only needed if shown
					oFilterBar._bAttached = true;

					return pHandleConditions.then(() => oFilterBar.awaitPendingModification());
				}
			});
		}
		return undefined;
	};

	FilterableListContent.prototype.onHide = function() {
		ListContent.prototype.onHide.apply(this, arguments);

		const oFilterBar = this.getActiveFilterBar();
		if (oFilterBar?._bAttached) {
			oFilterBar.detachSearch(this._handleSearch, this); // if hidden, event not needed
			oFilterBar._bAttached = false;
		}
	};

	/**
	 * Fires the {@link #event:select select} event.
	 * @param {object} oChange change object
	 */
	FilterableListContent.prototype._fireSelect = function(oChange) {
		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelpInstance();
		const oModifiedSelectionChange = oDelegate && oDelegate.modifySelectionBehaviour ? oDelegate.modifySelectionBehaviour(oValueHelp, this, oChange) : oChange;
		if (oModifiedSelectionChange) {
			this.fireSelect(oModifiedSelectionChange);
		}
	};

	FilterableListContent.prototype.exit = function() {

		Engine.getInstance().defaultProviderRegistry.detach(this);

		Common.cleanup(this, [
			"_oCollectiveSearchSelect", "_oInitialFilterConditions"
		]);

		if (this._oSearchField && !this._oSearchField.getParent()) {
			this._oSearchField.destroy();
			delete this._oSearchField;
		}


		ListContent.prototype.exit.apply(this, arguments);
	};

	FilterableListContent.prototype.getCount = function(aConditions, sGroup) {
		const oDelegate = this.isValueHelpDelegateInitialized() && this.getValueHelpDelegate();
		const oDelegatePayload = oDelegate && this.getValueHelpInstance();
		return oDelegate && oDelegate.getCount ? oDelegate.getCount(oDelegatePayload, this, aConditions, sGroup) : ListContent.prototype.getCount.apply(this, arguments);
	};

	FilterableListContent.prototype._getLocalFilterValue = function() {
		const oContainer = this.getParent();
		return oContainer && oContainer.getLocalFilterValue();
	};

	FilterableListContent.prototype._setLocalFilterValue = function(sValue) {
		const oContainer = this.getParent();
		return oContainer && oContainer.setLocalFilterValue(sValue);
	};

	/**
	 * Gets the currently used filter value.
	 * @returns {string} filter value
	 *
	 * @since: 1.121.0
	 * @protected
	 */
	FilterableListContent.prototype.getSearch = function() {
		const sLocalFilterValue = this._getLocalFilterValue();

		if (typeof sLocalFilterValue !== 'undefined') {
			return sLocalFilterValue;
		}

		return this.getFilterValue();
	};

	/**
	 * Gets the conditions that are selectable from list content.
	 *
	 * These are validated conditions as other conditions are shown in the {@link sap.ui.mdc.valuehelp.content.Conditions Conditions}.
	 * @returns {sap.ui.mdc.condition.ConditionObject[]} Conditions
	 * @protected
	 */
	FilterableListContent.prototype.getSelectableConditions = function() {
		return this.getConditions().filter((oCondition) => {
			return oCondition.validated === ConditionValidated.Validated;
		});
	};

	FilterableListContent.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		const oFilterBar = this.getActiveFilterBar();
		const bAttached = oFilterBar?._bAttached;
		if (bAttached) {
			oFilterBar.detachSearch(this._handleSearch, this);
			oFilterBar._bAttached = false;
		}

		const oClone = ListContent.prototype.clone.apply(this, arguments);

		if (bAttached) {
			oFilterBar.attachSearch(this._handleSearch, this);
			oFilterBar._bAttached = true;
		}

		return oClone;

	};

	function _addSearchConditionToConditionMap(oConditions, sSearchPath, sFilterValue) {
		oConditions[sSearchPath] = sFilterValue ? [Condition.createCondition(OperatorName.Contains, [sFilterValue], undefined, undefined, ConditionValidated.NotValidated)] : [];
		return;
	}

	return FilterableListContent;

});