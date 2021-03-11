/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/p13n/subcontroller/FilterController', 'sap/ui/core/library', 'sap/ui/mdc/p13n/FlexUtil', 'sap/ui/Device', 'sap/ui/mdc/Control', 'sap/base/util/merge', 'sap/base/util/deepEqual', 'sap/ui/model/base/ManagedObjectModel', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/mdc/condition/ConditionModel', 'sap/ui/mdc/condition/Condition', 'sap/ui/mdc/util/IdentifierUtil', 'sap/ui/mdc/condition/ConditionConverter', 'sap/m/MessageBox', "sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/mdc/p13n/StateUtil", "sap/ui/mdc/condition/FilterConverter", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/util/FilterUtil", "sap/m/Button", "sap/m/library", "sap/ui/core/ShortcutHintsMixin"
], function(FilterController, coreLibrary, FlexUtil, Device, Control, merge, deepEqual, ManagedObjectModel, ManagedObjectObserver, Log, ConditionModel, Condition, IdentifierUtil, ConditionConverter, MessageBox, ControlPersonalizationWriteAPI, StateUtil, FilterConverter, ControlVariantApplyAPI, FilterUtil, Button, mLibrary, ShortcutHintsMixin) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new FilterBarBase.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FilterBarBase</code> control is used as a faceless base class for common functionality of any MDC FilterBar derivation.
	 * @extends sap.ui.mdc.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.FilterBarBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterBarBase = Control.extend("sap.ui.mdc.filterbar.FilterBarBase", /** @lends sap.ui.mdc.filterbar.FilterBarBase.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "filterItems",
			interfaces : [
				"sap.ui.mdc.IFilter",
				"sap.ui.mdc.IxState"
			],
			properties: {

				/**
				 * Defines the path to the metadata retrieval class for the <code>FilterBarBase</code> control.
				 * It basically identifies the {@link sap.ui.mdc.FilterBarDelegate FilterBarDelegate} file that provides the required APIs to create the filter bar content.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * <b>Note:</b> This property must not be bound.
				 * @since 1.74
				 */
				delegate: {
					type: "object",
					defaultValue: {

						/**
						 * Contains the class name which implements the {@link sap.ui.mdc.FilterBarDelegate FilterBarDelegate} class.
						 */
						name: "sap/ui/mdc/FilterBarDelegate",

						/**
						 * Contains the mandatory information about the metamodel name <code>modelName</code> and the main data part in its <code>collectionName</code>.<br>
						 * <b>Note:</b> Additional information relevant for the specific {@link sap.ui.mdc.FilterBarDelegate FilterBarDelegate} implementation might be included but is of no relevance for the filter bar itself.
						 */
						payload: {
							modelName: undefined,
							collectionName: ""
						}}
				},

				/**
				 * Triggers a search automatically after a filter value has been changed.<br>
				 * <b>Note:</b> The <code>liveMode</code> property only operates in non-mobile scenarios.<br>
				 * Additionally, if the <code>liveMode</code> property is active, the following applies:<br>
				 * The error message box is not displayed, and the <code>showMessages</code> property is ignored.
				 * @since 1.74
				 */
				liveMode: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Displays possible errors during the search in a message box.
				 * @since 1.74
				 */
				showMessages: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines whether the Go button is visible in the filter bar.<br>
				 * <b>Note</b>: If the <code>liveMode</code> property is set to <code>true</code>, it is ignored.
				 */
				showGoButton: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Specifies the filter conditions.<br>
				 * <b>Note</b>: This property must not be bound.<br>
				 * <b>Note</b>: This property is used exclusively for SAPUI5 flexibility. Do not use it otherwise.
				 *
				 * @since 1.66.0
				 */
				filterConditions: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
				 * a search is triggered immediately if one or more search requests have been triggered in the meantime
				 * but were ignored based on the setting.
				 *
				 * @since 1.79.0
				 */
				suspendSelection: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Binds the text of the Adapt Filters button.
				 */
				_filterCount: {
					type: "string",
					visibility: "hidden"
				}
			},
			aggregations: {

				/**
				 * Contains all the displayed {@link sap.ui.mdc.FilterField filter fields} of the <code>FilterBarBase</code> control.
				 */
				filterItems: {
					type: "sap.ui.mdc.FilterField",
					multiple: true
				},

				/**
				 * Contains the optional basic search field.
				 */
				basicSearchField: {
					type: "sap.ui.mdc.FilterField",
					multiple: false
				},

				/**
				 * Internal hidden aggregation to hold the inner layout.
				 */
				layout: {
					type: "sap.ui.mdc.filterbar.IFilterContainer",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 *  {@link sap.ui.fl.variants.VariantManagement VariantManagement} control for the filter bar.
				 * <b>Note</b>: this association is only required, for being able to get information from {@link topic:a8e55aa2f8bc4127923b20685a6d1621 SAPUI5 Flexibility}
				 * whenever a variant was applied, with 'apply automatically' set to <code>true</code>.
				 * <b>Note</b>: this association may only be assigned once.
				 */
				variantBackreference: {
					type: "sap.ui.fl.variants.VariantManagement",
					multiple: false
				}
			},
			events: {

				/**
				 * This event is fired when the Go button is pressed or after a condition change, when <code>liveMode</code> is active.
				 * <b>Note</b>: this event should never be executed programmatically. It is triggered internally by the filter bar after a <code>triggerSearch</code> is executed
				 */
				search: {
					conditions: {
						type: "object"
					}
				},

				/**
				 * This event is fired after either a filter value or the visibility of a filter item has been changed.
				 *
				 * @name sap.ui.mdc.FilterBar#filtersChanged
				 * @event
				 * @param {object} oControlEvent.getParameters
				 * @param {boolean} oControlEvent.getParameters.conditionChange Indicates if the event was triggered by a condition change
				 * @param {string} oControlEvent.getParameters.filtersText Contains the filter summary text for the collapsed scenario
				 * @param {string} oControlEvent.getParameters.filtersTextExpanded Contains the filter summary text for the expanded scenario
				 */
				filtersChanged: {
					conditionsBased: {
						type: "boolean"
					},
					filtersText: {
						type: "string"
					},
					filtersTextExpanded: {
						type: "string"
					}
				}
			}
		}
	});

	var ButtonType = mLibrary.ButtonType;

	FilterBarBase.INNER_MODEL_NAME = "$sap.ui.filterbar.mdc.FilterBarBase";
	FilterBarBase.CONDITION_MODEL_NAME = "$filters";

	var ErrorState = {
			NoError: -1,
			RequiredHasNoValue: 0,
			FieldInErrorState: 1,
			AsyncValidation: 2
	};

	FilterBarBase.prototype.init = function() {

		Control.prototype.init.apply(this, arguments);

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._createInnerModel();

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			aggregations: [
				"filterItems",
				"basicSearchField"
			]
		});

		this._createInnerLayout();

		this._bPersistValues = false;

		this._aProperties = null;

		this._fResolveInitialFiltersApplied = undefined;
		this._oInitialFiltersAppliedPromise = new Promise(function(resolve) {
			this._fResolveInitialFiltersApplied  = resolve;
		}.bind(this));

		this._bIgnoreChanges = false;

		this._bSearchTriggered = false;
		this._bIgnoreQueuing = false;     // used to overrule the default behaviour of suspendSelection
	};

	//TODO: consider to restructure the approach _createInnerLayout to properties or seperate methods
	/**
	 * Interface for inner layout creation, needs to: provide three variables on the FilterBarBase derivation:
	 *
	 * _cLayoutItem, the class which is being used to create FilterItems
	 * _oFilterBarLayout, instance of the layout which needs to be a IFilterContainer derivation
	 * _bPersistValues should be used to control the persistence of filter conditions
	 *
	 * In addition the aggregation "layout" of the FilterBarBase derivation should be set to the created instance of _oFilterBarLayout
	 */
	FilterBarBase.prototype._createInnerLayout = function() {
		this._cLayoutItem = null;
		this._oFilterBarLayout = null;
		this._bPersistValues = false;
		this._btnAdapt = null;
		this.setAggregation("layout", this._oFilterBarLayout, true);
	};

	FilterBarBase.prototype._isPhone = function() {
		return (Device.system.phone) ? true : false;
	};

	FilterBarBase.prototype._isLiveMode = function() {
		if (this._isPhone()) {
			return false;
		}

		return this.getLiveMode();
	};

	FilterBarBase.prototype._getConditionModel = function() {
		return this._oConditionModel;
	};

	FilterBarBase.prototype._getSearchButton = function() {
		if (!this._btnSearch){
			this._btnSearch = new Button(this.getId() + "-btnSearch", {
				text: this._oRb.getText("filterbar.GO"),
				press: this.onSearch.bind(this),
				type: ButtonType.Emphasized
			});

			ShortcutHintsMixin.addConfig(this._btnSearch, {
					addAccessibilityLabel: true,
					// setting messageBundleKey does not work for controls which are not in the root folder.
					// vh/FilterBar is not in the root folder, so use the message property instead
					message: this._oRb.getText("filterbar.GoBtnShortCutHint")
				},
				this
			);

		}

		return this._btnSearch;
	};

	/**
	 * Returns the name of the inner <code>FilterBarBase</code> condition model.
	 * @returns {string} Name of the inner <code>FilterBarBase</code> condition model
	 */
	FilterBarBase.prototype.getConditionModelName = function() {
		return this._getConditionModelName();
	};

	FilterBarBase.prototype._getConditionModelName = function() {
		return  FilterBarBase.CONDITION_MODEL_NAME;
	};

	FilterBarBase.prototype._createConditionModel = function() {
		this._oConditionModel = new ConditionModel();
		this.setModel(this._oConditionModel, this._getConditionModelName());
	};

	FilterBarBase.prototype.applySettings = function(mSettings, oScope) {
		Control.prototype.applySettings.apply(this, arguments);

		this._createConditionModel();

		this._oConditionModel.attachPropertyChange(this._handleConditionModelPropertyChange, this);

		//this._retrieveMetadata();
		this._retrieveMetadata().then(function() {
			this._applyInitialFilterConditions();
		}.bind(this));
	};

	/**
	 * Determines whether the default behavior of the <code>suspendSelection</code> property is overruled. This can only happen during the suspension of the selection.
	 * If this property is set to <code>true</code>, a possible queue of search requests is ignored during the final <code>suspendSelection</code> operation.
	 * Once the suspension of the selection is over, this value will be set to <code>false</code>.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @param {boolean} bValue Indicates if set to <code>true</code> that the default behavior is to be ignored
	 *
	 */
	FilterBarBase.prototype.setIgnoreQueuing = function(bValue) {
		this._bIgnoreQueuing = bValue;
	};

	/**
	 * Determines whether the default behavior of the <code>suspendSelection</code> property is overruled.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {boolean} Indicator that determines if default behavior of  <code>suspendSelection</code> is overruled
	 */
	FilterBarBase.prototype.getIgnoreQueuing = function() {
		return this._bIgnoreQueuing;
	};


	FilterBarBase.prototype.setSuspendSelection = function(bValue) {

		this.setProperty("suspendSelection", bValue);

		if (!bValue) {
			if (this._bSearchTriggered && !this.getIgnoreQueuing()) {
				this.triggerSearch();
			}

			this._bSearchTriggered = false;
			this.setIgnoreQueuing(false);
		}

		return this;
	};

	FilterBarBase.prototype._createInnerModel = function() {
		this._oModel = new ManagedObjectModel(this);
		this.setModel(this._oModel, FilterBarBase.INNER_MODEL_NAME);
		return this;
	};

	/**
	 * Returns the externalized conditions of the inner condition model.
	 * This method may only be called, once the <code>initialzed</code> is resolved.
	 * <b>Note:</b> This API may return attributes corresponding to the <code>p13nMode</code> property configuration.
	 * @protected
	 * @returns {object} object containing the current status of the FilterBarBase
	 */
	FilterBarBase.prototype.getCurrentState = function() {
		//return this.initialized().then(function() {

			var oState = {};

			if (this._bPersistValues) {
				var aIgnoreFieldNames = [];
				var mConditions = merge({}, this.getFilterConditions());
				for (var sKey in mConditions) {
					if (!this._getPropertyByName(sKey)) {
						aIgnoreFieldNames.push(sKey);
					}
				}

				aIgnoreFieldNames.forEach(function(sKey) {
					delete mConditions[sKey];
				});

				oState.filter = mConditions;
			}

			var aFilterItems = this.getFilterItems();
			var aItems = [];
			aFilterItems.forEach(function(oFilterField, iIndex){
				aItems.push({
					name: oFilterField.getFieldPath()
				});
			});

			oState.items = aItems;

			return oState;
		//}.bind(this));
	};

	/**
	 * Returns the labels of all filters with a value assignment.
	 *
	 * Note: filters annotated with hiddenFilters will not be considered
	 *
	 * @returns {Array} array of labels of filters with value assignment
	 * @private
	 * @ui5-restricted sap.fe
	 */
	FilterBarBase.prototype.getAssignedFilterNames = function() {
		var sName, aFilterNames = null, oModel = this._getConditionModel();
		if (oModel) {
			aFilterNames = [];

			var aConditions = oModel.getConditions("$search");
			if (aConditions && aConditions.length > 0) {
				aFilterNames.push(this._oRb.getText("filterbar.ADAPT_SEARCHTERM"));
			}

			this._getNonHiddenPropertyInfoSet().forEach(function(oProperty) {
				sName = IdentifierUtil.getPropertyKey(oProperty);
				var aConditions = oModel.getConditions(sName);
				if (aConditions && aConditions.length > 0) {
					aFilterNames.push(oProperty.label || sName);
				}
			});
		}

		return aFilterNames;
	};



	FilterBarBase.prototype._getAssignedFiltersText = function() {
		var mTexts = {};

		mTexts.filtersText = this._getAssignedFiltersCollapsedText(this.getAssignedFilterNames());
		mTexts.filtersTextExpanded = this._getAssignedFiltersExpandedText();

		return mTexts;
	};

	FilterBarBase.prototype._getAssignedFiltersExpandedText = function() {

		var nActive = 0, nNonVisible = 0, oModel = this._getConditionModel();
		if (oModel) {
			var aAllConditions = oModel.getAllConditions();
			for (var sFieldPath in aAllConditions) {
				var oProperty = this._getPropertyByName(sFieldPath);
				if (oProperty && !oProperty.hiddenFilter && (aAllConditions[sFieldPath].length > 0)) {
					++nActive;
					if (!(((sFieldPath === "$search") && this.getAggregation("basicSearchField")) || this._getFilterField(sFieldPath))) {
						++nNonVisible;
					}
				}
			}
		}

		if (!nActive && !nNonVisible) {
			return this._oRb.getText("filterbar.ADAPT_NOTFILTERED");
		}

		if (!nNonVisible) {
			if (nActive === 1) {
				return this._oRb.getText("filterbar.ADAPT_FILTER_WITH_NON_HIDDEN", [
					nActive
				]);
			}
			return this._oRb.getText("filterbar.ADAPT_FILTERS_WITH_NON_HIDDEN", [
				nActive
			]);
		}

		if ((nActive === 1)) {
			return this._oRb.getText("filterbar.ADAPT_FILTER_WITH_HIDDEN", [
				nActive, nNonVisible
			]);
		}

		return this._oRb.getText("filterbar.ADAPT_FILTERS_WITH_HIDDEN", [
			nActive, nNonVisible
		]);

	};

	FilterBarBase.prototype._getAssignedFiltersCollapsedText = function(aFilterNames) {
		var sAssignedFiltersList;

		aFilterNames = aFilterNames || [];

		if (aFilterNames.length) {
			sAssignedFiltersList = Object.keys(aFilterNames).map(function(i) {return aFilterNames[i];}).join(", ");

			if (aFilterNames.length === 1) {
				return this._oRb.getText("filterbar.ADAPT_FILTER_COLLAPSED", [
					aFilterNames.length, sAssignedFiltersList
				]);
			}

			return this._oRb.getText("filterbar.ADAPT_FILTERS_COLLAPSED", [
				aFilterNames.length, sAssignedFiltersList
			]);
		}

		return this._oRb.getText("filterbar.ADAPT_NOTFILTERED");
	};


	/**
	 * Returns a summary string that contains information about the filters currently assigned.
	 * The method returns the text summary for the expanded and collapsed states of the filter bar.<br>
	 * <br>
	 * <b>Example for collapsed filter bar</b>:<br>
	 * <i>3 filters active: Company Code, Fiscal Year, Customer</i>
	 *
	 * <b>Example for expanded filter bar</b>:<br>
	 * <i>3 filters active (1 hidden)</i>
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {map} A map containing the text information
	 * @returns {map.filtersText} A string that is displayed if the filter bar is collapsed
	 * @returns {map.filtersTextExpanded} A string that is displayed if the filter bar is expanded
	 */
	FilterBarBase.prototype.getAssignedFiltersText = function() {
		return this._getAssignedFiltersText();
	};

	FilterBarBase.prototype._reportModelChange = function(bTriggerSearch, bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch) {
		this._handleAssignedFilterNames(false, bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch);

		if (this.getLiveMode() || bTriggerSearch) {
			this.triggerSearch();
		}
	};

	FilterBarBase.prototype._isPersistenceSupported = function(oEvent) {
		return this.getEngine().isModificationSupported(this);
	};

	FilterBarBase.prototype._handleConditionModelPropertyChange = function(oEvent) {

		if (!this._bIgnoreChanges) {

			var sPath = oEvent.getParameter("path");
			if (sPath.indexOf("/conditions/") === 0) {

				var sFieldPath = sPath.substring("/conditions/".length);

				if (this._bPersistValues && this._isPersistenceSupported()) {
					var mOrigConditions = {};
					mOrigConditions[sFieldPath] = this._stringifyConditions(sFieldPath, oEvent.getParameter("value"));
					this._cleanupConditions(mOrigConditions[sFieldPath]);
					this.getEngine().createChanges({
						control: this,
						key: "Filter",
						state: mOrigConditions
					});
				} else {
					this._reportModelChange(false);
				}
			}
		}
	};


	FilterBarBase.prototype._toExternal = function(oProperty, oCondition) {
		var oConditionExternal = merge({}, oCondition);
		oConditionExternal = ConditionConverter.toString(oConditionExternal, oProperty.typeConfig, this.getTypeUtil());

		this._cleanupCondition(oConditionExternal);

		this. _convertInOutParameters(oCondition, oConditionExternal, "inParameters", ConditionConverter.toString);
		this. _convertInOutParameters(oCondition, oConditionExternal, "outParameters", ConditionConverter.toString);

		return oConditionExternal;
	};

	FilterBarBase.prototype._toInternal = function(oProperty, oCondition) {
		var oConditionInternal = merge({}, oCondition);
		oConditionInternal = ConditionConverter.toType(oConditionInternal, oProperty.typeConfig, this.getTypeUtil());

		this. _convertInOutParameters(oCondition, oConditionInternal, "inParameters", ConditionConverter.toType);
		this. _convertInOutParameters(oCondition, oConditionInternal, "outParameters", ConditionConverter.toType);

		return oConditionInternal;
	};

	FilterBarBase.prototype._convertInOutParameters = function(oCondition, oConditionConverted, sParameterName, fnConverter) {
		if (oCondition[sParameterName] && (Object.keys(oCondition[sParameterName]).length > 0)) {
			Object.keys(oCondition[sParameterName]).forEach(function(sKey) {
				var sName = sKey.startsWith("conditions/") ? sKey.slice(11) : sKey; // just use field name
				var oProperty = this._getPropertyByName(sName);
				if (oProperty) {
					var oOutCondition = Condition.createCondition("EQ", [oCondition[sParameterName][sKey]]);
					var vValue = fnConverter(oOutCondition, oProperty.typeConfig, this.getTypeUtil());
					if (!oConditionConverted[sParameterName]) {
						oConditionConverted[sParameterName] = {};
					}
					if (!sKey.startsWith("conditions/")) { // old condition (from variant)
						delete oConditionConverted[sParameterName][sKey]; // transform to new name
						sKey = "conditions/" + sName;
					}
					oConditionConverted[sParameterName][sKey] = vValue.values[0];
				} else {
					Log.error("mdc.FilterBar._convertInOutParameters: could not find property info for " + sName);
				}
			}.bind(this));
		}
	};

	FilterBarBase.prototype._cleanupCondition = function(oCondition) {
		if (oCondition) {
			if (oCondition.hasOwnProperty("isEmpty")) {
				delete oCondition.isEmpty;
			}
		}
	};

	FilterBarBase.prototype._cleanupConditions = function(aConditions) {
		if (aConditions) {
			aConditions.forEach( function(oCondition) {
				this._cleanupCondition(oCondition);
			}, this);
		}
	};

	FilterBarBase.prototype._stringifyCondition = function(oProperty, oCondition) {
		var oResultCondition = oCondition;
		if (oCondition && oCondition.values) {
			if (oCondition.values.length > 0) {
				oResultCondition = this._toExternal(oProperty, oCondition);
			} else {
				oResultCondition = merge({}, oCondition);
				this._cleanupCondition(oResultCondition);
			}
		}

		return oResultCondition;
	};


	FilterBarBase.prototype._stringifyConditions = function(sFieldPath, aConditions) {
		var oProperty = this._getPropertyByName(sFieldPath);
		var aResultConditions = aConditions;

		if (oProperty && aConditions) {
			aResultConditions = [];

			aConditions.forEach( function(oCondition) {
				aResultConditions.push(this._stringifyCondition(oProperty, oCondition));
			}, this);
		}

		return aResultConditions;
	};

	FilterBarBase.prototype._handleAssignedFilterNames = function(bFiltersAggregationChanged, bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch) {
		if (!this._oMetadataAppliedPromise) {
			return;  // may occure when filterItems are added during pre processing.
		}

		this._oMetadataAppliedPromise.then(function() {

			if (this._bIsBeingDestroyed) {
				return;
			}

			if (!bFiltersAggregationChanged) {
				if (this._btnAdapt) {
					var aFilterNames = this.getAssignedFilterNames();
					this.setProperty("_filterCount", this._oRb.getText(aFilterNames.length ? "filterbar.ADAPT_NONZERO" : "filterbar.ADAPT", aFilterNames.length), false);
				}
			}

			var mTexts = this._getAssignedFiltersText();
			var oObj = {
				conditionsBased: (!bFiltersAggregationChanged && !bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch),
				filtersText: mTexts.filtersText,
				filtersTextExpanded: mTexts.filtersTextExpanded
			};

			this.fireFiltersChanged(oObj);
		}.bind(this));
	};

	FilterBarBase.prototype.onReset = function(oEvent) {
		this._getConditionModel().oConditionModel.removeAllConditions();
	};
	FilterBarBase.prototype.onSearch = function(oEvent) {
		this.triggerSearch();
	};

	/**
	 * Triggers the search.
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {Promise} Returns a Promise which resolves after the validation of erroneous fields has been propagated.
	 */
	FilterBarBase.prototype.triggerSearch = function() {
		return this.valid(true);
	};

	/**
	 * Used for IFilter interface consuming controls
	 *
	 * @param {boolean} bFireSearch Determines whether a search should be fired once the Promise has been resolved
	 * @returns {Promise} Returns a Promise which resolves after the validation of erroneous fields has been propagated.
	 *
	 * @ui5-restricted sap.ui.mdc
	 */
	FilterBarBase.prototype.valid = function(bFireSearch) {

		bFireSearch = typeof bFireSearch == "boolean" ? bFireSearch : true;

		if (this.getSuspendSelection() && bFireSearch) {
			this._bSearchTriggered = true;
			return Promise.resolve();
		}

		return this.initialized().then(function() {
			if (!this._oSearchPromise) {

				this._oSearchPromise = new Promise(function(resolve, reject) {
					this._fResolvedSearchPromise = resolve;
					this._fRejectedSearchPromise = reject;
				}.bind(this));

				var fDelayedFunction = function() {
					this._validate(bFireSearch);
					this._oSearchPromise = null;
				};
				setTimeout(fDelayedFunction.bind(this), 0);
			}

			return this._oSearchPromise;

		}.bind(this));
	};

	FilterBarBase.prototype._clearDelayedSearch = function() {
		if (this._iDelayedSearchId) {
			clearTimeout(this._iDelayedSearchId);
			this._iDelayedSearchId = null;
		}
	};


	FilterBarBase.prototype._getRequiredFieldsWithoutValues = function() {
		var aReqFiltersWithoutValue = [];
		this._getRequiredPropertyNames().forEach(function(sName) {
			var aConditions = this._getConditionModel().getConditions(sName);
			if (!aConditions || aConditions.length === 0) {
				aReqFiltersWithoutValue.push(sName);
			}
		}.bind(this));

		return aReqFiltersWithoutValue;
	};

	FilterBarBase.prototype._checkAsyncValidation = function() {
		var vRetErrorState = ErrorState.NoError;

		if (this._aFIChanges && this._aFIChanges.length > 0) {
			vRetErrorState = ErrorState.AsyncValidation;
		}

		return vRetErrorState;
	};


	FilterBarBase.prototype._checkRequiredFields = function() {
		var vRetErrorState = ErrorState.NoError;

		var aReqFiltersWithoutValue = this._getRequiredFieldsWithoutValues();
		aReqFiltersWithoutValue.forEach(function(sName) {
			var oFilterField = this._getFilterField(sName);
			if (oFilterField) {
				if (oFilterField.getValueState() === ValueState.None) {
					oFilterField.setValueState(ValueState.Error);
					oFilterField.setValueStateText(this._oRb.getText("filterbar.REQUIRED_FILTER_VALUE_MISSING"));
				}
			} else {
				Log.error("Mandatory filter field '" + sName + "' not visible on FilterBarBase has no value.");
			}

			vRetErrorState = ErrorState.RequiredHasNoValue;
		}.bind(this));

		return vRetErrorState;
	};

	FilterBarBase.prototype._checkFieldsInErrorState = function() {
		var vRetErrorState = ErrorState.NoError;

		this._getNonRequiredPropertyNames().some(function(sName) {
			var oFilterField = this._getFilterField(sName);
			if (oFilterField && (oFilterField.getValueState() !== ValueState.None)) {
				vRetErrorState = ErrorState.FieldInErrorState;
			}

			return vRetErrorState !== ErrorState.NoError;
		}.bind(this));

		return vRetErrorState;
	};

	FilterBarBase.prototype._handleFilterItemSubmit = function(oEvent) {

		var oPromise = oEvent.getParameter("promise");
		if (oPromise) {
			oPromise.then(function() {
				this.triggerSearch();
			}.bind(this));
		}
	};

	FilterBarBase.prototype._handleFilterItemChanges = function(oEvent) {

		if (this._bIgnoreChanges) {
			return;
		}

		var oFilterField = oEvent.oSource;
		if (oFilterField.getRequired() && (oFilterField.getValueState() === ValueState.Error) && oEvent.getParameter("valid")) {
			oFilterField.setValueState(ValueState.None);
			return;
		}

		if (!this._aFIChanges) {
			this._aFIChanges = [];
		}

		this._aFIChanges.push({ name: oFilterField.getFieldPath(), promise: oEvent.getParameter("promise")});
	};

	FilterBarBase.prototype._checkFilters = function() {
		var vRetErrorState = this._checkAsyncValidation();
		if (vRetErrorState !== ErrorState.NoError) {
			return vRetErrorState;
		}

		vRetErrorState = this._checkRequiredFields();
		if (vRetErrorState !== ErrorState.NoError) {
			return vRetErrorState;
		}

		vRetErrorState = this._checkFieldsInErrorState();
		if (vRetErrorState !== ErrorState.NoError) {
			return vRetErrorState;
		}

		return vRetErrorState;
	};

	FilterBarBase.prototype._setFocusOnFirstErroneousField = function() {
		this.getFilterItems().some(function(oFilterItem) {
			if (oFilterItem.getValueState() !== ValueState.None) {
				setTimeout(oFilterItem["focus"].bind(oFilterItem), 0);
				return true;
			}
			return false;
		});
	};

	FilterBarBase.prototype._handleAsyncValidation = function(bFireSearch) {
		if (this._aFIChanges && (this._aFIChanges.length > 0)) {

			var aNamePromisesArray = this._aFIChanges.slice();
			this._aFIChanges = null;

			var aChangePromises = [];
			aNamePromisesArray.forEach(function(oNamePromise) {
				aChangePromises.push(oNamePromise.promise);
			});

			Promise.all(aChangePromises).then(function(aConditionsArray) {

				aConditionsArray.forEach(function(aConditions, nIdx) {
					var oFF = this._getFilterField(aNamePromisesArray[nIdx].name);
					if (oFF && oFF.getRequired() && (oFF.getValueState() === ValueState.Error)) {
						oFF.setValueState(ValueState.None); //valid existing value -> clear missing required error
					}
				}, this);
				this._validate(bFireSearch);
			}.bind(this), function(aConditionsArray) {
				this._validate(bFireSearch);
			}.bind(this));
		}
	};

	/**
	 * Executes the search.
	 * @private
	 */
	 FilterBarBase.prototype._validate = function(bFireSearch) {
		var sErrorMessage, vRetErrorState;

		// First check for validation errors or if search should be prevented
		vRetErrorState = this._checkFilters();

		if (vRetErrorState === ErrorState.AsyncValidation) {
			this._handleAsyncValidation(bFireSearch);
			return;
		}

		var fnCleanup = function() {
			this._fRejectedSearchPromise = null;
			this._fResolvedSearchPromise = null;
		}.bind(this);

		if (vRetErrorState === ErrorState.NoError) {
			if (bFireSearch) {
				this.fireSearch();
			}
			this._fResolvedSearchPromise();
			fnCleanup();
		} else {
			if (vRetErrorState === ErrorState.RequiredHasNoValue) {
				sErrorMessage = this._oRb.getText("filterbar.REQUIRED_CONDITION_MISSING");
			} else {
				sErrorMessage = this._oRb.getText("filterbar.VALIDATION_ERROR");
			}

			if (this.getShowMessages() && !this._isLiveMode()) {
				try {
					MessageBox.error(sErrorMessage, {
						styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : "",
						onClose: this._setFocusOnFirstErroneousField.bind(this)
					});
				} catch (x) {
					Log.error(x.message);
				}
			} else {
				Log.warning("search was not triggered. " + sErrorMessage);
			}
			this._fRejectedSearchPromise();
			fnCleanup();
		}
	};

	/**
	 * Assigns conditions to the inner condition model.
	 * This method is only called for filling the in parameters for value help scenarios.
	 * @protected
	 * @param {map} mConditions A map containing the conditions
	 */
	FilterBarBase.prototype.setInternalConditions = function(mConditions) {
		var oModel = this._getConditionModel();
		if (oModel) {
			oModel.setConditions(mConditions);
		}
	};

	/**
	 * Returns the conditions of the inner condition model.<br>
	 * <b>Note:</b>This method must only be used for value help scenarios.
	 * @protected
	 * @returns {map} A map containing the conditions
	 */
	FilterBarBase.prototype.getInternalConditions = function() {
		return this._getModelConditions(this._getConditionModel(), true);
	};

	FilterBarBase.prototype.hasProperty = function(sName) {
		return this._getPropertyByName(sName);
	};

	FilterBarBase.prototype.waitForInitialization = function() {
		return Promise.all([this._oInitialFiltersAppliedPromise, this._oMetadataAppliedPromise]);
	};

	FilterBarBase.prototype.initialized = function() {
		return this.waitForInitialization();
	};

	/**
	 * Returns the conditions of the inner condition model.
	 * @private
	 * @param {object} oModel containing the conditions.
	 * @param {boolean} bDoNotExternalize Indicates if the returned conditions are in an external format
	 * @param {boolean} bKeepAllValues Indicates if the returned conditions include empty arrays rather then removing them
	 * @returns {map} A map containing the conditions
	 */
	FilterBarBase.prototype._getModelConditions = function(oModel, bDoNotExternalize, bKeepAllValues) {
		var mConditions = {};
		if (oModel) {
			var aAllConditions = oModel.getAllConditions();
			for (var sFieldPath in aAllConditions) {
				if (aAllConditions[sFieldPath] && (bKeepAllValues || aAllConditions[sFieldPath].length > 0)) {
					mConditions[sFieldPath] = merge([], aAllConditions[sFieldPath]);
					if (!bDoNotExternalize) {
						this._cleanupConditions(mConditions[sFieldPath]);
						var aFieldConditions = this._stringifyConditions(sFieldPath, mConditions[sFieldPath]);
						mConditions[sFieldPath] = aFieldConditions;
					}
				}
			}
		}

		return mConditions;
	};

	// Normalization is currently only done for IsDigitSequence Types
	var _fnNormalizeCondition = function (oProperty) {
		var oTypeInstance = oProperty.typeConfig.typeInstance;
		var oConstraints = oTypeInstance.getConstraints();
		return oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.String" && oConstraints && oConstraints.isDigitSequence && oConstraints.maxLength ? function (oCondition) {
			return this._toExternal(oProperty, oCondition, this.getTypeUtil());
		}.bind(this) : undefined;
	};

	FilterBarBase.prototype.removeCondition = function(sFieldPath, oXCondition) {
		return this.initialized().then(function() {
			var oCM = this._getConditionModel();
			if (oCM) {
				var oProperty = this._getPropertyByName(sFieldPath);
				if (oProperty) {
					var oCondition = this._toInternal(oProperty, oXCondition);
					if (oCM.indexOf(sFieldPath, oCondition, _fnNormalizeCondition.call(this, oProperty)) >= 0) {
						oCM.removeCondition(sFieldPath, oCondition);
					}
				}
			}
		}.bind(this));
	};

	FilterBarBase.prototype.addCondition = function(sFieldPath, oXCondition) {
		return this.initialized().then(function() {
			var oCM = this._getConditionModel();
			if (oCM) {
				var oProperty = this._getPropertyByName(sFieldPath);
				if (oProperty) {
					var oCondition = this._toInternal(oProperty, oXCondition);
					if (oCM.indexOf(sFieldPath, oCondition, _fnNormalizeCondition.call(this, oProperty)) < 0) {
						var aCondition = [{sFieldPath: oProperty}];
						FilterController.checkConditionOperatorSanity(aCondition); //check if the single condition's operator is valid
						if (aCondition && aCondition.length > 0){
							this._cleanUpFilterFieldInErrorStateByName(sFieldPath);
							oCM.addCondition(sFieldPath, oCondition);
						}
					}
				}
			}
		}.bind(this));

	};

	FilterBarBase.prototype._setXConditions = function(aConditionsData, bRemoveBeforeApplying) {
		var oProperty, aConditions, oConditionModel = this._getConditionModel();

		if (bRemoveBeforeApplying) {
			oConditionModel.removeAllConditions();
		}

		if (aConditionsData) {
			for ( var sFieldPath in aConditionsData) {
				aConditions = aConditionsData[sFieldPath];

				oProperty = this._getPropertyByName(sFieldPath);
				if (oProperty) {

					if (aConditions.length === 0) {
						oConditionModel.removeAllConditions(sFieldPath);
					} else {
						/* eslint-disable no-loop-func */
						aConditions.forEach(function(oCondition) {
							if (oProperty.maxConditions !== -1) {
								oConditionModel.removeAllConditions(sFieldPath);
							}

							var oNewCondition = this._toInternal(oProperty, oCondition);
							oConditionModel.addCondition(sFieldPath, oNewCondition);
						}.bind(this));
						/* eslint-enabled no-loop-func */
					}
				}
			}
		}
	};

	FilterBarBase.prototype._getXConditions = function () {
		return this._getModelConditions(this._getConditionModel(), false);
	};


	FilterBarBase.prototype._getRequiredPropertyNames = function() {
		var aReqFilterNames = [];

		this._getNonHiddenPropertyInfoSet().forEach(function(oProperty) {
			if (oProperty.required) {
				aReqFilterNames.push(IdentifierUtil.getPropertyKey(oProperty));
			}
		});

		return aReqFilterNames;
	};


	FilterBarBase.prototype._getNonRequiredPropertyNames = function() {
		var aNonReqFilterNames = [];

		this._getNonHiddenPropertyInfoSet().forEach(function(oProperty) {
			if (!oProperty.required) {
				aNonReqFilterNames.push(IdentifierUtil.getPropertyKey(oProperty));
			}
		});

		return aNonReqFilterNames;
	};

	FilterBarBase.prototype._insertFilterFieldtoContent = function(oFilterItem, nIdx) {

		if (!this._cLayoutItem) {
			return;
		}

		var LayoutItem = this._cLayoutItem;
		var oLayoutItem = new LayoutItem();
		oLayoutItem.setFilterField(oFilterItem);

		this._oFilterBarLayout.insertFilterField(oLayoutItem, nIdx);
	};

	FilterBarBase.prototype._filterItemInserted = function(oFilterField) {

		if (!oFilterField.getVisible()) {
			return;
		}

		if (oFilterField.setWidth) {
			oFilterField.setWidth("");
		}

		this._applyFilterItemInserted(oFilterField);

		this._handleAssignedFilterNames(true);
	};

	FilterBarBase.prototype._applyFilterItemInserted = function(oFilterField) {
		var nIndex, iIndex;

		iIndex = this.indexOfAggregation("filterItems", oFilterField);
		if (this.getAggregation("basicSearchField")) {
			iIndex++;
		}

		nIndex = iIndex;
		var aFilterFields = this.getFilterItems();
		for (var i = 0; i < nIndex; i++) {
			if (!aFilterFields[i].getVisible()) {
				iIndex--;
			}
		}

		this._insertFilterFieldtoContent(oFilterField, iIndex);

		if (!this._oObserver.isObserved(oFilterField, {properties: ["visible"]})) {
			this._oObserver.observe(oFilterField, {properties: ["visible"]});
		}
	};

	FilterBarBase.prototype._filterItemRemoved = function(oFilterItem) {
		this._applyFilterItemRemoved(oFilterItem.getFieldPath());

		this._handleAssignedFilterNames(true);
	};

	FilterBarBase.prototype._applyFilterItemRemoved = function(sFieldPath) {
		this._removeFilterFieldFromContentByName(sFieldPath);
	};

	FilterBarBase.prototype._removeFilterFieldFromContent = function(oFilterItem) {
		this._removeFilterFieldFromContentByName(oFilterItem.getFieldPath());
	};

	FilterBarBase.prototype._removeFilterFieldFromContentByName = function(sFieldPath) {
		var oLayoutItem = this._getFilterItemLayoutByName(sFieldPath);

		if (oLayoutItem) {
			this._oFilterBarLayout.removeFilterField(oLayoutItem);
			oLayoutItem.destroy();
		}
	};

	FilterBarBase.prototype._observeChanges = function(oChanges) {

		if (oChanges.type === "aggregation") {

			if (oChanges.name === "filterItems") {
				switch (oChanges.mutation) {
					case "insert":
						oChanges.child.attachChange(this._handleFilterItemChanges, this);
						oChanges.child.attachSubmit(this._handleFilterItemSubmit, this);
						this._filterItemInserted(oChanges.child);
						break;
					case "remove":
						oChanges.child.detachChange(this._handleFilterItemChanges, this);
						oChanges.child.detachSubmit(this._handleFilterItemSubmit, this);
						this._filterItemRemoved(oChanges.child);
						break;
					default:
						Log.error("operation " + oChanges.mutation + " not yet implemented");
				}
			} else if (oChanges.name === "basicSearchField") {
				switch (oChanges.mutation) {
					case "insert":
						oChanges.child.attachSubmit(this._handleFilterItemSubmit, this);
						this._insertFilterFieldtoContent(oChanges.child, 0);
						break;
					case "remove":
						oChanges.child.detachSubmit(this._handleFilterItemSubmit, this);
						this._removeFilterFieldFromContent(oChanges.child);
						break;
					default:
						Log.error("operation " + oChanges.mutation + " not yet implemented");
				}
			}
		} else if (oChanges.type === "property") {
			var oFilterField;

			if (oChanges.object.isA && oChanges.object.isA("sap.ui.mdc.FilterField")) { // only visible is considered
				oFilterField = oChanges.object; //this._getFilterField(oChanges.object.getFieldPath());
				if (oFilterField) {
					if (oChanges.current) {
						this._filterItemInserted(oFilterField);
					} else {
						this._filterItemRemoved(oFilterField);
					}

					this._oFilterBarLayout.rerender();
				}
			}
		}
	};

	FilterBarBase.prototype._getFilterItemLayout = function(oFilterField) {
		return this._getFilterItemLayoutByName(oFilterField.getFieldPath());
	};
	FilterBarBase.prototype._getFilterItemLayoutByName = function(sFieldPath) {
		var oFilterItemLayout = null;

		if (this._oFilterBarLayout) {
			this._oFilterBarLayout.getFilterFields().some(function(oItemLayout) {
				if (oItemLayout._getFieldPath() === sFieldPath) {
					oFilterItemLayout = oItemLayout;
				}

				return oFilterItemLayout !== null;
			});
		}

		return oFilterItemLayout;
	};

	FilterBarBase.prototype._getFilterField = function(sName) {
		var oFilterField = null;
		this.getFilterItems().some(function(oFilterItem) {
			if (oFilterItem && oFilterItem.getFieldPath && (oFilterItem.getFieldPath() === sName)) {
				oFilterField = oFilterItem;
			}

			return oFilterField !== null;
		});

		return oFilterField;
	};


	FilterBarBase.prototype._retrieveMetadata = function() {

		if (this._oMetadataAppliedPromise) {
			return this._oMetadataAppliedPromise;
		}

		this._fResolveMetadataApplied = undefined;
		this._oMetadataAppliedPromise = new Promise(function(resolve) {
			this._fResolveMetadataApplied = resolve;
		}.bind(this));


		this.initControlDelegate().then(function() {
			if (!this._bIsBeingDestroyed) {

				this._aProperties = [];

				var fnResolveMetadata = function() {
					this._fResolveMetadataApplied();
					this._fResolveMetadataApplied = null;
				}.bind(this);

				if (this.bDelegateInitialized && this.getControlDelegate().fetchProperties) {
					try {
						this.getControlDelegate().fetchProperties(this).then(function(aProperties) {
							this._aProperties = aProperties;
							fnResolveMetadata();
						}.bind(this), function(sMsg) {
							Log.error(sMsg);
							fnResolveMetadata();
						});
					} catch (ex) {
						Log.error("Exception during fetchProperties occured: " + ex.message);
						fnResolveMetadata();
					}
				} else {
					Log.error("Provided delegate '" + this.getDelegate().path + "' not valid.");
					fnResolveMetadata();
				}
			}
		}.bind(this));

		return this._oMetadataAppliedPromise;
	};

	FilterBarBase.prototype.setBasicSearchField = function(oBasicSearchField) {

		var oOldBasicSearchField = this.getAggregation("basicSearchField");
		if (oOldBasicSearchField) {
			this.removeAggregation("basicSearchField", oOldBasicSearchField);
		}

		this.setAggregation("basicSearchField", oBasicSearchField);

		if (oBasicSearchField) {
			if (!this._oObserver.isObserved(oBasicSearchField, {properties: ["visible"]})) {
				this._oObserver.observe(oBasicSearchField, {properties: ["visible"]});
			}
		}

		return this;
	};


	FilterBarBase.prototype.getPropertyInfoSet = function() {
		return this._aProperties || [];
	};

	FilterBarBase.prototype._getNonHiddenPropertyInfoSet = function() {
		var aVisibleProperties = [];
		this.getPropertyInfoSet().every(function(oProperty) {
			if (!oProperty.hiddenFilter) {

				if (IdentifierUtil.getPropertyKey(oProperty) !== "$search") {
					aVisibleProperties.push(oProperty);
				}
			}

			return true;
		});

		return aVisibleProperties;
	};


	FilterBarBase.prototype._getNonHiddenPropertyByName = function(sName) {
		var oProperty = null;
		this._getNonHiddenPropertyInfoSet().some(function(oProp) {
			if (IdentifierUtil.getPropertyKey(oProp) === sName) {
				oProperty = oProp;
			}

			return oProperty != null;
		});

		return oProperty;
	};

	FilterBarBase.prototype._getPropertyByName = function(sName) {
		return FilterUtil.getPropertyByKey(this.getPropertyInfoSet(), sName);
	};

	FilterBarBase.prototype._cleanUpFilterFieldInErrorStateByName = function(sFieldName) {
		var oFilterField = null;
		var aFilterFields = this.getFilterItems();
		aFilterFields.some( function(oFF) {
			if (oFF.getFieldPath() === sFieldName) {
				oFilterField = oFF;
			}

			return oFilterField != null;
		});

		if (oFilterField) {
			this._cleanUpFilterFieldInErrorState(oFilterField);
		}

	};

	FilterBarBase.prototype._cleanUpAllFilterFieldsInErrorState = function() {

		var aFilterFields = this.getFilterItems();
		aFilterFields.forEach( function(oFilterField) {
			this._cleanUpFilterFieldInErrorState(oFilterField);
		}.bind(this));
	};

	FilterBarBase.prototype._cleanUpFilterFieldInErrorState = function(oFilterField) {

		if (oFilterField.getRequired() && (oFilterField.getValueState() !== ValueState.None)) {
			oFilterField.setValueState(ValueState.None);
		}

	};

	FilterBarBase.prototype.applyConditionsAfterChangesApplied = function() {
		if (this._isChangeApplying()) {
			return;
		}
		this._bIgnoreChanges = true;

		// Wait until all changes have been applied
		this._oFlexPromise = this._getWaitForChangesPromise();

		Promise.all([this._oFlexPromise, this._oInitialFiltersAppliedPromise, this._oMetadataAppliedPromise]).then(function(vArgs) {

			this._oFlexPromise = null;

			//wait for changes not based on variant switch
			this._changesApplied();

		}.bind(this));
	};

	FilterBarBase.prototype._getWaitForChangesPromise = function() {
		return this.getEngine().waitForChanges(this);
	};

	FilterBarBase.prototype._suspendBinding = function(oFilterField) {

		if (oFilterField) {
			var oBinding = oFilterField.getBinding("conditions");
			if (oBinding) {
				if (!this._aBindings) {
					this._aBindings = [];
				}
				oBinding.suspend();
				this._aBindings.push(oFilterField);
			}
		}
	};

	FilterBarBase.prototype._resumeBindings = function() {
		if (this._aBindings) {
			this._aBindings.forEach(function(oFilterField) {
				if (!oFilterField.bIsDestroyed) {
					var oBinding = oFilterField.getBinding("conditions");
					if (oBinding) {
						oBinding.resume();
					}
				}
			});

			this._aBindings = null;
		}
	};


	FilterBarBase.prototype._isChangeApplying = function() {
		return  !!this._oFlexPromise;
	};

	FilterBarBase.prototype._applyInitialFilterConditions = function() {

		this._bIgnoreChanges = true;

		this._applyFilterConditionsChanges();

		this._changesApplied();

		this._bInitialFiltersApplied = true;
		this._fResolveInitialFiltersApplied();
		this._fResolveInitialFiltersApplied = null;
	};

	FilterBarBase.prototype._applyFilterConditionsChanges = function() {

		var aConditionsData;

		var mSettings = this.getProperty("filterConditions");
		if (Object.keys(mSettings).length > 0) {

			aConditionsData = merge([], mSettings);
			this._setXConditions(aConditionsData, true, true);
		}
	};

	FilterBarBase.prototype.setVariantBackreference = function(oVariant) {
		if (!this._hasAssignedVariantManagement()) {
			this.setAssociation("variantBackreference", oVariant);

			ControlVariantApplyAPI.attachVariantApplied({
				selector: this,
				vmControlId: this.getVariantBackreference(),
				callback: this._handleVariantSwitch.bind(this),
				callAfterInitialVariant: true
			});
		} else {
			Log.error("the association 'variant' may only be assigned once and may not change afterwards.");
		}
	};

	FilterBarBase.prototype._handleVariantSwitch = function(oVariant) {
		//clean-up fields in error state
		this._cleanUpAllFilterFieldsInErrorState();

		this._bExecuteOnSelect = false;
		if (oVariant.hasOwnProperty("executeOnSelect") && oVariant.executeOnSelect) {
			this._bExecuteOnSelect = true;
		}

		this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = undefined;
		if (oVariant.hasOwnProperty("createScenario") && (oVariant.createScenario === "saveAs")) {
			//during SaveAs a switch occurs but the processing of related variants based changes may still be ongoing
			this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = true;
		}

		// no changes exists, but variant switch occurs
		// not relevant for applied default variant
		if (!this._isChangeApplying() && this._bInitialFiltersApplied) {
			this._changesApplied();
		}
	};


	FilterBarBase.prototype._hasAssignedVariantManagement = function() {
		var sVariantControlId = this.getVariantBackreference();

		if (sVariantControlId && sap.ui.getCore().byId(sVariantControlId) && sap.ui.getCore().byId(sVariantControlId).isA("sap.ui.fl.variants.VariantManagement")) {
			return true;
		}

		return false;
	};


	FilterBarBase.prototype._changesApplied = function() {

		this._bIgnoreChanges = false;

		this._reportModelChange(this._bExecuteOnSelect, this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch);
		this._bExecuteOnSelect = undefined;
		this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = undefined;
	};

	FilterBarBase.prototype._getView = function() {
		return IdentifierUtil.getView(this);
	};

	/**
	 * Returns the external conditions.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {map} Map containing the external conditions.
	 */
	FilterBarBase.prototype.getConditions = function() {
		//return this.initialized().then(function() {
			var mConditions = this._bPersistValues ? this.getCurrentState().filter : this._getXConditions();
			if (mConditions && mConditions["$search"]) {
				delete mConditions["$search"];
			}

			return mConditions;
		//}.bind(this));
	};

	/**
	 * Returns the value of the basic search condition.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {string} Value of search condition or empty
	 */
	FilterBarBase.prototype.getSearch = function() {
		var aSearchConditions = this._getConditionModel() ? this._getConditionModel().getConditions("$search") : [];
		return aSearchConditions[0] ? aSearchConditions[0].values[0] : "";
	};

	FilterBarBase.prototype.exit = function() {

		if (this._hasAssignedVariantManagement()) {
			ControlVariantApplyAPI.detachVariantApplied({
				selector: this,
				vmControlId: this.getVariantBackreference()
			});
		}

		if (this.bDelegateInitialized && this.getControlDelegate().cleanup) {
			this.getControlDelegate().cleanup(this);
		}

		Control.prototype.exit.apply(this, arguments);

		this._clearDelayedSearch();

		this._oFilterBarLayout = null;
		this._cLayoutItem = null;
		this._btnAdapt = undefined;
		this._btnSearch = undefined;

		this._oRb = null;

		if (this._oModel) {
			this._oModel.destroy();
			this._oModel = null;
		}

		if (this._oConditionModel) {
			this._oConditionModel.detachPropertyChange(this._handleConditionModelPropertyChange, this);
			this._oConditionModel.destroy();
			this._oConditionModel = null;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

		this._bPersistValues = null;

		this._oDelegate = null;
		this._aProperties = null;

		this._oFlexPromise = null;

		this._fResolveMetadataApplied = undefined;
		this._oMetadataAppliedPromise = null;

		this._oInitialFiltersAppliedPromise = null;

		this._oSearchPromise = null;

		this._aBindings = null;
	};

	return FilterBarBase;

});
