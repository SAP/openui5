/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/util/loadModules',
	'sap/ui/mdc/valuehelp/base/ListContent',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/util/Common',
	'sap/m/p13n/enum/PersistenceMode',
	'sap/m/p13n/Engine',
	'sap/base/util/merge',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/base/Log'
], function(
	loadModules,
	ListContent,
	Condition,
	ConditionValidated,
	Common,
	PersistenceMode,
	Engine,
	merge,
	StateUtil,
	FilterOperatorUtil,
	Log
) {
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
	var FilterableListContent = ListContent.extend("sap.ui.mdc.valuehelp.base.FilterableListContent", /** @lends sap.ui.mdc.valuehelp.base.FilterableListContent.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties:	{
				/**
				 * The fields based on which the table data is filtered. For filtering, the value of the <code>filterValue</code> property is used.
				 *
				 * If set to <code>$search</code>, and if the used binding supports search requests, a $search request is used for filtering.
				 *
				 * If set to one or more properties, the filters for these properties are used for filtering.
				 * These filters are set on the <code>ListBinding</code> used.
				 * The properties need to be separated by commas and enclosed by "*" characters. (<code>"*Property1,Property2*"</code>)
				 *
				 * If it is empty, no suggestion is available.
				 */
				filterFields: {
					type: "string",
					defaultValue: ""
				},

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
				 * {@link sap.ui.mdc.filterbar.vh.FilterBar FilterBar} used for filtering.
				 */
				filterBar: {
					type: "sap.ui.mdc.filterbar.vh.FilterBar",
					multiple: false
				},
				/**
				 * Default {@link sap.ui.mdc.filterbar.vh.FilterBar FilterBar}, created internally if none given.
				 */
				_defaultFilterBar: {
					type: "sap.ui.mdc.filterbar.vh.FilterBar",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
			},
			events: {
			}
		}
	});

	FilterableListContent.prototype.init = function() {
		ListContent.prototype.init.apply(this, arguments);
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		this._oObserver.observe(this, {
			properties: ["filterFields"],
			aggregations: ["_defaultFilterBar", "filterBar"]
		});

		Engine.getInstance().defaultProviderRegistry.attach(this, PersistenceMode.Transient);

	};

	FilterableListContent.prototype.handleFilterValueUpdate = function (oChanges) {
		if ((this.isContainerOpening() || this.isContainerOpen()) && this._bContentBound) {
			Promise.resolve(this.applyFilters()).finally(function () {
				ListContent.prototype.handleFilterValueUpdate.apply(this, arguments);
			}.bind(this));
		}
	};

	/**
	 * Applies the filter to the content control.
	 * @protected
	 */
	FilterableListContent.prototype.applyFilters = function () {

	};


	FilterableListContent.prototype._prettyPrintFilters = function (oFilter) {

		var sRes;
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
			var bAnd = oFilter.bAnd;
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

	/**
	 * Gets an item for a <code>BindingContext</code>.
	 * @param {sap.ui.model.Context} oBindingContext BindingContext
	 * @param {object} [oOptions] Options
	 * @returns {object} Item object containing <code>key</code>, <code>description</code>, and <code>payload</code>
	 * @protected
	 */
	FilterableListContent.prototype.getItemFromContext = function (oBindingContext, oOptions) {

		var sKeyPath = (oOptions && oOptions.keyPath) || this.getKeyPath();
		var sDescriptionPath = (oOptions && oOptions.descriptionPath) || this.getDescriptionPath();
		var vKey;
		var sDescription;
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

		var oPayload = this.createConditionPayload([vKey, sDescription], oBindingContext);


		return {key: vKey, description: sDescription, payload: oPayload};
	};

	/**
	 * Creates a payload for a value.
	 * @param {any[]} aValues Values (key, description)
	 * @param {any} vContext context
	 * @returns {object} payload
	 * @protected
	 */
	FilterableListContent.prototype.createConditionPayload = function(aValues, vContext) {
		var oConditionPayload;
		var oDelegate = this.getValueHelpDelegate();

		if (oDelegate) {
			var oValueHelp = this.getValueHelpInstance();
			oConditionPayload = {};
			oConditionPayload = oDelegate.createConditionPayload(oValueHelp, this, aValues, vContext);
		}
		return oConditionPayload;
	};

	FilterableListContent.prototype._isContextSelected = function (oContext, aConditions) {
		return !!oContext && !!this._findConditionsForContext(oContext, aConditions).length;
	};

	FilterableListContent.prototype._findConditionsForContext = function (oContext, aConditions) {
		var oDelegate = this.isValueHelpDelegateInitialized() && this.getValueHelpDelegate();
		if (oContext && oDelegate) {
			// <!-- Support for deprecated delegate method isFilterableListItemSelected
			if (oDelegate.isFilterableListItemSelected) {
				Log.warning("MDC.ValueHelp", "Delegate method 'isFilterableListItemSelected' is deprecated, please implement 'findConditionsForContext' instead.");

				var bRepresentsConditions = oDelegate.isFilterableListItemSelected(this.getValueHelpInstance(), this, { getBindingContext: function () {
					return oContext; // Dirty way to simulate listitem.getBindingContext()
				} }, aConditions);

				if (bRepresentsConditions) {
					var oValues = this.getItemFromContext(oContext);
					var oContextCondition = oValues && this.createCondition(oValues.key, oValues.description, oValues.payload);

					return aConditions.filter(function (oCondition) {
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
	 * @returns {Promise<sap.ui.mdc.filterbar.vh.FilterBar>} FilterBar
	 */
	FilterableListContent.prototype._createDefaultFilterBar = function() {
		return loadModules([
			"sap/ui/mdc/filterbar/vh/FilterBar"
		]).then(function(aModules) {
			if (this.isDestroyStarted()) {
				return null;
			}
			var FilterBar = aModules[0];
			var oFilterBar = new FilterBar(this.getId() + "-FB", {
				liveMode: false, // !oWrapper.isSuspended(), // if suspended, no live search
				showGoButton: true
			});
			_setBasicSearch.call(this, oFilterBar);
			this.setAggregation("_defaultFilterBar", oFilterBar, true);
			return oFilterBar;
		}.bind(this));
	};

	FilterableListContent.prototype._handleSearch = function (oEvent) {
		var oFilterBar = oEvent.getSource();
		this._setLocalFilterValue(oFilterBar.getSearch());
		this.applyFilters();

	};

	function _setBasicSearch(oFilterBar) {
		var oExistingBasicSearchField = oFilterBar.getBasicSearchField();
		var sFilterFields =  this.getFilterFields();
		if (!oExistingBasicSearchField && sFilterFields) { // TODO: use isSearchSupported but here Delegate needs to be loaded
			if (!this._oSearchField) {
				return loadModules([
					"sap/ui/mdc/FilterField"
				]).then(function (aModules){
					if (!oFilterBar.isDestroyed()) {
						var FilterField = aModules[0];
						this._oSearchField = new FilterField(this.getId() + "-search", {
							conditions: "{$filters>/conditions/" + sFilterFields + "}",
							propertyKey: sFilterFields,
							placeholder:"{$i18n>filterbar.SEARCH}",
							label:"{$i18n>filterbar.SEARCH}", // TODO: do we want a label?
							maxConditions: 1,
							width: "50%"
						});
						this._oSearchField._bCreatedByValueHelp = true;
						_setBasicSearch.call(this, oFilterBar);
					}
				}.bind(this));
			}
			oFilterBar.setBasicSearchField(this._oSearchField);
		} else if (oExistingBasicSearchField) {
			if (sFilterFields) {
				oExistingBasicSearchField.setConditions([]); // initialize search field
			} else if (oExistingBasicSearchField._bCreatedByValueHelp) {
				oFilterBar.setBasicSearchField(); // remove to reuse on other FilterBar
			}
		}
	}

	FilterableListContent.prototype.onContainerClose = function () {
		this._setLocalFilterValue(undefined);
	};

	/**
	 * Gets the currently used <code>FilterBar</code> control.
	 * @returns {sap.ui.mdc.filterbar.vh.FilterBar} FilterBar
	 */
	FilterableListContent.prototype._getPriorityFilterBar = function () {
		return this.getFilterBar() || this.getAggregation("_defaultFilterBar");
	};

	FilterableListContent.prototype.observeChanges = function (oChanges) {
		if (oChanges.object == this) {
			var oFilterBar;

			if (["_defaultFilterBar", "filterBar"].indexOf(oChanges.name) !== -1) {
				oFilterBar = oChanges.child;
				var oDefaultFilterBar;
				if (oChanges.mutation === "insert") {
					_setBasicSearch.call(this, oFilterBar);
					this._assignCollectiveSearchSelect();

					if (oChanges.name !== "_defaultFilterBar" || !this.getFilterBar()) { // DefaultFilterBar only used if no other FilterBar assigned
						oFilterBar.attachSearch(this._handleSearch, this);
					}
					if (oChanges.name === "filterBar") {
						oDefaultFilterBar = this.getAggregation("_defaultFilterBar");
						if (oDefaultFilterBar) {
							oDefaultFilterBar.detachSearch(this._handleSearch, this);
						}
					}
				} else { // remove case
					var oExistingBasicSearchField = oFilterBar.getBasicSearchField();
					if (oExistingBasicSearchField && oExistingBasicSearchField._bCreatedByValueHelp) {
						oFilterBar.setBasicSearchField(); // remove to reuse on other FilterBar
					}

					oFilterBar.detachSearch(this._handleSearch, this);

					if (oChanges.name === "filterBar") {
						oDefaultFilterBar = this.getAggregation("_defaultFilterBar");
						if (oDefaultFilterBar) {
							oDefaultFilterBar.attachSearch(this._handleSearch, this);
						} else {
							this._createDefaultFilterBar();
						}
					}
				}
			} else if (oChanges.name === "filterFields") {
				// check if search fields needs to be removed or added
				oFilterBar = this._getPriorityFilterBar();
				if (oFilterBar) {
					_setBasicSearch.call(this, oFilterBar);
				}
			}
		}
		ListContent.prototype.observeChanges.apply(this, arguments);
	};

	FilterableListContent.prototype.getCollectiveSearchKey = function () {
		return this._oCollectiveSearchSelect && this._oCollectiveSearchSelect.getSelectedItemKey();
	};

	/**
	 * Gets the <code>BindingInfo</code> of the content.
	 * @returns {sap.ui.base.ManagedObject.AggregationBindingInfo} <code>ListBindingInfo</code>
	 * @protected
	 */
	FilterableListContent.prototype.getListBindingInfo = function () {
		throw new Error("FilterableListContent: Every filterable listcontent must implement this method.");
	};

	/**
	 * Gets the <code>BindingContext</code> for an item.
	 * @param {sap.ui.core.Element} oItem item
	 * @returns {sap.ui.model.Context} <code>BindingContext</code>
	 */
	FilterableListContent.prototype._getListItemBindingContext = function (oItem) {
		var sModelName = this.getListBindingInfo().model;
		return oItem && oItem.getBindingContext(sModelName);
	};

	/**
	 * Gets the control that holds the initial focus.
	 * @returns {sap.ui.core.control} control
	 */
	FilterableListContent.prototype.getInitialFocusedControl = function() {
		return this._getPriorityFilterBar().getInitialFocusedControl();
	};

	/**
	 * Provides type information for listcontent filtering.
	 * @param {object} oConditions set of conditions to create filters for
	 * @returns {object} Returns a type map for property paths
	 */
	FilterableListContent.prototype._getTypesForConditions = function (oConditions) {
		var oDelegate = this.getValueHelpDelegate();
		var oValueHelp = this.getValueHelpInstance();
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
		var sTitle = ListContent.prototype.getFormattedTitle.apply(this, arguments);
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
		var sShortTitle = this.getShortTitle();
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
		var sTokenizerTitle = this.getTokenizerTitle();
		if (!sTokenizerTitle) {
			sTokenizerTitle = this._oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitle" + (iCount === 0 ? "NoCount" : ""), [iCount]);
		}
		return sTokenizerTitle;
	};

	FilterableListContent.prototype.isSearchSupported = function () {

		var sFilterFields = this.getFilterFields();
		var bSearchSupported = !!sFilterFields;
		if (sFilterFields === "$search") {
			var oListBinding = this.getListBinding();
			var oDelegate = this.getValueHelpDelegate();
			var oDelegatePayload = this.getValueHelpInstance();
			bSearchSupported = oDelegate && oDelegate.isSearchSupported(oDelegatePayload, this, oListBinding);
		}

		return bSearchSupported;
	};

	/**
	 * Sets the collective Search to the <code>FilterBar</code>.
	 *
	 * @param {sap.ui.mdc.filterbar.vh.CollectiveSearchSelect} oCollectiveSearchSelect Collective search control
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.Dialog
	 */
	FilterableListContent.prototype.setCollectiveSearchSelect = function (oCollectiveSearchSelect) {
		this._oCollectiveSearchSelect = oCollectiveSearchSelect;
		this._assignCollectiveSearchSelect();
	};

	FilterableListContent.prototype._assignCollectiveSearchSelect = function () {
		var oFilterBar = this._getPriorityFilterBar();
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
			var oDelegate = this.getValueHelpDelegate();
			return Promise.resolve(oDelegate && oDelegate.getFilterConditions(this.getValueHelpInstance(), this)).then(function (oConditions) {
				this._oInitialFilterConditions = oConditions;

				var oFilterBar = this._getPriorityFilterBar();
				if (oFilterBar) { // apply initial conditions to filterbar if existing
					var sFilterFields = this.getFilterFields();
					var oNewConditions = merge({}, this._oInitialFilterConditions);
					return Promise.resolve(!oNewConditions[sFilterFields] && StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
						if (bInitial) {
							_addSearchConditionToConditionMap(oNewConditions, sFilterFields, this._getPriorityFilterValue());
							return StateUtil.diffState(oFilterBar, oState, {filter: oNewConditions});
						}
					}.bind(this))).then(function (oStateDiff) {
						return StateUtil.applyExternalState(oFilterBar, oStateDiff);
					});
				}
			}.bind(this));
		}
		return undefined;
	};

	/**
	 * Fires the {@link #event:select select} event.
	 * @param {object} oChange change object
	 */
	FilterableListContent.prototype._fireSelect = function (oChange) {
		var oDelegate = this.getValueHelpDelegate();
		var oValueHelp = this.getValueHelpInstance();
		var oModifiedSelectionChange = oDelegate && oDelegate.modifySelectionBehaviour ? oDelegate.modifySelectionBehaviour(oValueHelp, this, oChange) : oChange;
		if (oModifiedSelectionChange) {
			this.fireSelect(oModifiedSelectionChange);
		}
	};

	FilterableListContent.prototype.exit = function () {

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

	FilterableListContent.prototype.getCount = function (aConditions, sGroup) {
		var oDelegate = this.isValueHelpDelegateInitialized() && this.getValueHelpDelegate();
		var oDelegatePayload = oDelegate && this.getValueHelpInstance();
		return oDelegate && oDelegate.getCount ? oDelegate.getCount(oDelegatePayload, this, aConditions, sGroup) : ListContent.prototype.getCount.apply(this, arguments);
	};

	FilterableListContent.prototype._getLocalFilterValue = function() {
		var oContainer = this.getParent();
		return oContainer && oContainer.getLocalFilterValue();
	};

	FilterableListContent.prototype._setLocalFilterValue = function(sValue) {
		var oContainer = this.getParent();
		return oContainer && oContainer.setLocalFilterValue(sValue);
	};

	/**
	 * Gets the currently used filter value.
	 * @returns {string} filter value
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelpDelegate
	 */
	FilterableListContent.prototype._getPriorityFilterValue = function() {
		var sLocalFilterValue = this._getLocalFilterValue();

		if (typeof sLocalFilterValue !== 'undefined') {
			return sLocalFilterValue;
		}

		return this.getFilterValue();
	};

	/**
	 * Gets the conditions that are selectable from list content.
	 *
	 * These are validated conditions as other conditions are shown in the {@link sap.ui.mdc.valuehelp.content.Conditions Conditions}.
	 * @returns {sap.ui.base.ManagedObject.AggregationBindingInfo} ListBindingInfo
	 * @protected
	 */
	FilterableListContent.prototype.getSelectableConditions = function() {
		return this.getConditions().filter(function(oCondition) {
			return oCondition.validated === ConditionValidated.Validated;
		});
	};

	function _addSearchConditionToConditionMap(oConditions, sFilterFields, sFilterValue) {
		oConditions[sFilterFields] = sFilterValue ? [Condition.createCondition("Contains", [sFilterValue], undefined, undefined, ConditionValidated.NotValidated)] : [];
		return;
	}

	return FilterableListContent;

});

