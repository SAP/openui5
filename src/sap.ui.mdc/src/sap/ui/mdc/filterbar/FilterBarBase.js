/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/core/Element",
		"sap/ui/core/Lib",
		'sap/ui/mdc/p13n/subcontroller/FilterController',
		'sap/ui/core/library',
		'sap/ui/core/ShortcutHintsMixin',
		'sap/ui/Device',
		'sap/ui/mdc/Control',
		'sap/base/Log',
		'sap/base/util/merge',
		'sap/ui/model/base/ManagedObjectModel',
		'sap/ui/base/ManagedObjectObserver',
		'sap/ui/mdc/condition/ConditionModel',
		'sap/ui/mdc/condition/Condition',
		'sap/ui/mdc/condition/ConditionConverter',
		'sap/ui/mdc/util/IdentifierUtil',
		'sap/ui/mdc/util/FilterUtil',
		"sap/ui/mdc/filterbar/PropertyHelper",
		"sap/ui/mdc/enums/ReasonMode",
		"sap/ui/mdc/enums/FilterBarValidationStatus",
		"sap/ui/mdc/enums/OperatorName",
		"sap/m/library",
		"sap/m/Button",
		"./FilterBarBaseRenderer"
	],
	(
		Element,
		Library,
		FilterController,
		coreLibrary,
		ShortcutHintsMixin,
		Device,
		Control,
		Log,
		merge,
		ManagedObjectModel,
		ManagedObjectObserver,
		ConditionModel,
		Condition,
		ConditionConverter,
		IdentifierUtil,
		FilterUtil,
		PropertyHelper,
		ReasonMode,
		FilterBarValidationStatus,
		OperatorName,
		mLibrary,
		Button,
		FilterBarBaseRenderer
	) => {
		"use strict";

		// sap.ui.fl-related classes (loaded async after library load)
		let FlexApplyAPI;
		const { ValueState } = coreLibrary;

		/**
		 * Constructor for a new <code>FilterBarBase</code> control.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 * @class The <code>FilterBarBase</code> control is the base for filter displaying controls in MDC.
		 * @extends sap.ui.mdc.Control
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @public
		 * @since 1.80.0
		 * @alias sap.ui.mdc.filterbar.FilterBarBase
		 */
		const FilterBarBase = Control.extend("sap.ui.mdc.filterbar.FilterBarBase", /** @lends sap.ui.mdc.filterbar.FilterBarBase.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				designtime: "sap/ui/mdc/designtime/filterbar/FilterBarBase.designtime",
				defaultAggregation: "filterItems",
				interfaces: [
					"sap.ui.mdc.IFilterSource", "sap.ui.mdc.IFilter", "sap.ui.mdc.IxState"
				],
				properties: {

					/**
					 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
					 * The object has the following properties:
					 * <ul>
					 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module</li>
					 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
					 * </ul>
					 * <i>Sample delegate object:</i>
					 * <pre><code>{
					 * 	name: "sap/ui/mdc/BaseDelegate",
					 * 	payload: {}
					 * }</code></pre>
					 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
					 * Do not bind or modify the module. This property can only be configured during control initialization.
					 */
					delegate: {
						type: "object",
						defaultValue: {
							name: "sap/ui/mdc/FilterBarDelegate",
							payload: {
								modelName: undefined,
								collectionName: ""
							}
						}
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
					 * Indicates whether possible errors during the search in a message box are displayed.
					 * @since 1.74
					 * Since version 1.111 replaced by the new validation handling of {@link module:sap/ui/mdc/FilterBarDelegate.determineValidationState determineValidationState} and {@link module:sap/ui/mdc/FilterBarDelegate.visualizeValidationState visualizeValidationState}.
					 */
					showMessages: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					},

					/**
					 * Indicates whether the Go button is visible in the {@link sap.ui.mdc.FilterBar FilterBar} control.<br>
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
					 * Specifies the filter metadata.<br>
					 * <b>Note</b>: This property must not be bound.<br>
					 * <b>Note</b>: This property is used exclusively for SAPUI5 flexibility/ Fiori Elements. Do not use it otherwise.<br>
					 * <b>Node</b>: Please check {@link sap.ui.mdc.filterbar.PropertyInfo} for more information about the supported inner elements.
					 * <b>Note</b>: Existing properties (set via <code>sap.ui.mdc.filterbar.FilterBarBase#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/FilterBarDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
					 *
					 * @since 1.97
					 */
					propertyInfo: {
						type: "object",
						defaultValue: []
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
					 *
					 * <b>Note:</b>
					 * This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not bindable.
					 * Any changes of the initial aggregation content might result in undesired effects.
					 * Changes of the aggregation have to be made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
					 */
					filterItems: {
						type: "sap.ui.mdc.FilterField",
						multiple: true
					},

					/**
					 * Contains the optional basic search field.
					 * <b>Note:</b> This field has to be bound against the <code>$search</code> property.
					 */
					basicSearchField: {
						type: "sap.ui.mdc.FilterField",
						multiple: false
					},

					/**
					 * Contains the internal hidden aggregation to hold the inner layout.
					 */
					layout: {
						type: "sap.ui.mdc.filterbar.IFilterContainer",
						multiple: false,
						visibility: "hidden"
					}
				},
				associations: {
					/**
					 *  {@link sap.ui.fl.variants.VariantManagement VariantManagement} control for the {@link sap.ui.mdc.FilterBar FilterBar} control.
					 * <b>Note</b>: This association is only required to get information from {@link topic:a8e55aa2f8bc4127923b20685a6d1621 SAPUI5 Flexibility}
					 * whenever a variant was applied, with 'apply automatically' set to <code>true</code>.
					 * <b>Note</b>: This association must only be assigned once.
					 */
					variantBackreference: {
						type: "sap.ui.fl.variants.VariantManagement",
						multiple: false
					}
				},
				events: {

					/**
					 * This event is fired when the Go button is pressed or after a condition change, when <code>liveMode</code> is active.
					 * <b>Note</b>: This event should never be executed programmatically. It is triggered internally by the {@link sap.ui.mdc.FilterBar FilterBar} after the <code>triggerSearch</code> function has been executed.
					 */
					search: {
						parameters: {
							/**
							 * Indicates the initial reason for the search. This can either be:<br>
							 * <ul>
							 *     <li><code>{@link sap.ui.mdc.enums.ReasonMode.Variant}</code>: Search is triggered based on variant settings</li>
							 *     <li><code>{@link sap.ui.mdc.enums.ReasonMode.Enter}</code>: Search is triggered based on pressing Enter in a filter field</li>
							 *     <li><code>{@link sap.ui.mdc.enums.ReasonMode.Go}</code>: Search is triggered based on pressing the Go button</li>
							 *     <li><code>{@link sap.ui.mdc.enums.ReasonMode.Unclear}</code>: Any other reasons for the search</li>
							 * </ul>
							 *
							 * @since 1.111.0
							 */
							reason: {
								type: "sap.ui.mdc.enums.ReasonMode"
							}
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
						parameters: {
							/**
							 * Indicates if the event is based on condition changes
							 */
							conditionsBased: {
								type: "boolean"
							},
							/**
							 * Display text for a collapsed header
							 */
							filtersText: {
								type: "string"
							},
							/**
							 * Display text for an expanded header
							 */
							filtersTextExpanded: {
								type: "string"
							}
						}
					}
				}
			},

			renderer: FilterBarBaseRenderer
		});

		const { ButtonType } = mLibrary;

		FilterBarBase.INNER_MODEL_NAME = "$sap.ui.filterbar.mdc.FilterBarBase";
		FilterBarBase.CONDITION_MODEL_NAME = "$filters";

		FilterBarBase.prototype.init = function() {

			Control.prototype.init.apply(this, arguments);

			this._oRb = Library.getResourceBundleFor("sap.ui.mdc");

			this._createInnerModel();

			this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

			this._oObserver.observe(this, {
				aggregations: [
					"filterItems", "basicSearchField"
				]
			});

			this._createInnerLayout();

			this.getEngine().register(this, {
				controller: {
					Filter: new FilterController({ control: this })
				}
			});

			this._fResolveInitialFiltersApplied = undefined;
			this._oInitialFiltersAppliedPromise = new Promise((resolve) => {
				this._fResolveInitialFiltersApplied = resolve;
			});

			this._bIgnoreChanges = false;
			this._aOngoingChangeAppliance = [];
			this._bSearchTriggered = false;
			this._bIgnoreQueuing = false; // used to overrule the default behaviour of suspendSelection
		};

		/**
		 * Interface for inner layout creation.
		 * Three variables must be provided for the <code>FilterBarBase</code> derivation:
		 * <ul>
		 * <li>_cLayoutItem, the class that is used to create FilterItems</li>
		 * <li>_oFilterBarLayout, instance of the layout that needs to be a IFilterContainer derivation</li>
		 * <li>_btnAdapt, instance of the Adapt Filters button that shows the filter dialog</li>
		 * </ul>
		 * In addition, the <code>layout<code> aggregation of the <code>FilterBarBase</code> derivation should be set to the created instance of <code>_oFilterBarLayout<code> variable.
		 */
		FilterBarBase.prototype._createInnerLayout = function() {
			this._cLayoutItem = null;
			this._oFilterBarLayout = null;
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
			if (!this._btnSearch) {
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
				}, this);
			}

			return this._btnSearch;
		};

		/**
		 * Returns the name of the inner condition model of the <code>FilterBarBase</code> control.
		 * @returns {string} Name of the inner condition model of the <code>FilterBarBase</code> control
		 */
		FilterBarBase.prototype.getConditionModelName = function() {
			return this._getConditionModelName();
		};

		FilterBarBase.prototype._getConditionModelName = function() {
			return FilterBarBase.CONDITION_MODEL_NAME;
		};

		FilterBarBase.prototype._createConditionModel = function() {
			this._oConditionModel = new ConditionModel();
			this.setModel(this._oConditionModel, this._getConditionModelName());
		};

		FilterBarBase.prototype.applySettings = function(mSettings, oScope) {
			this._setPropertyHelperClass(PropertyHelper);
			this._setupPropertyInfoStore("propertyInfo");
			this._applySettings(mSettings, oScope);
			Promise.all([this.awaitPropertyHelper()]).then(() => {
				if (!this._bIsBeingDestroyed) {
					this._applyInitialFilterConditions();
				}
			});
		};

		FilterBarBase.prototype._applySettings = function(mSettings, oScope) {
			Control.prototype.applySettings.apply(this, arguments);

			this._createConditionModel();

			this._oConditionModel.attachPropertyChange(this._handleConditionModelPropertyChange, this);
		};

		FilterBarBase.prototype._waitForMetadata = function() {
			return this._retrieveMetadata().then(() => {
				this._applyInitialFilterConditions();
			});
		};

		/**
		 * Determines whether the default behavior of the <code>suspendSelection</code> property is overruled.
		 * This can only happen during the suspension of the selection.
		 * If this property is set to <code>true</code>, a possible queue of search requests is ignored during the final <code>suspendSelection</code> operation.
		 * Once the suspension of the selection is over, this value will be set to <code>false</code>.
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 * @param {boolean} bValue If set to <code>true</code> the default behavior is ignored
		 */
		FilterBarBase.prototype.setIgnoreQueuing = function(bValue) {
			this._bIgnoreQueuing = bValue;
		};

		/**
		 * Indicates whether the default behavior of the <code>suspendSelection</code> property is overruled.
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 * @returns {boolean} Indicates whether the default behavior of the <code>suspendSelection</code> property is overruled
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
		 * Gets the external conditions of the inner condition model.
		 * <b>Note:</b> This API returns only attributes related to the {@link sap.ui.mdc.FilterBar#setP13nMode p13nMode} property configuration.
		 *
		 * @public
		 * @returns {sap.ui.mdc.State} Object containing the current status of the <code>FilterBarBase</code>
		 */
		FilterBarBase.prototype.getCurrentState = function() {
			const oState = {};

			oState.filter = merge({}, this.getFilterConditions());

			const aFilterItems = this.getFilterItems();
			const aItems = [];
			aFilterItems.forEach((oFilterField) => {
				const sPropertyKey = oFilterField.getPropertyKey();
				aItems.push({
					key: sPropertyKey,
					name: sPropertyKey
				});
			});

			oState.items = aItems;

			return oState;
		};

		/**
		 * Gets the labels of all filters with a value assignment.
		 *
		 * <b>Note:</b> Filters annotated with <code>hiddenFilters</code> will not be considered.
		 *
		 * @returns {string[]} Array of labels of filters with value assignment
		 * @public
		 */
		FilterBarBase.prototype.getAssignedFilterNames = function() {
			let sName, aFilterNames = null;
			const oModel = this._getConditionModel();
			if (oModel) {
				aFilterNames = [];

				const aConditions = oModel.getConditions("$search");
				if (aConditions && aConditions.length > 0) {
					aFilterNames.push(this._oRb.getText("filterbar.ADAPT_SEARCHTERM"));
				}

				this._getNonHiddenPropertyInfoSet().forEach((oProperty) => {
					sName = IdentifierUtil.getPropertyKey(oProperty);
					const aConditions = oModel.getConditions(sName);
					if (aConditions && aConditions.length > 0) {
						aFilterNames.push(oProperty.label || sName);
					}
				});
			}

			return aFilterNames;
		};


		FilterBarBase.prototype._getAssignedFiltersText = function() {
			const mTexts = {};

			mTexts.filtersText = this._getAssignedFiltersCollapsedText(this.getAssignedFilterNames());
			mTexts.filtersTextExpanded = this._getAssignedFiltersExpandedText();

			return mTexts;
		};

		FilterBarBase.prototype._getAssignedFiltersExpandedText = function() {

			let nActive = 0,
				nNonVisible = 0;
			const oModel = this._getConditionModel();
			if (oModel) {
				const aAllConditions = oModel.getAllConditions();
				for (const sFieldPath in aAllConditions) {
					const oProperty = this._getPropertyByName(sFieldPath);
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
			let sAssignedFiltersList;

			aFilterNames = aFilterNames || [];

			if (aFilterNames.length) {
				sAssignedFiltersList = Object.keys(aFilterNames).map((i) => { return aFilterNames[i]; }).join(", ");

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
		 * Gets a summary string that contains information about the filters currently assigned.
		 * The method returns the text summary for the expanded and collapsed states of the {@link sap.ui.mdc.FilterBar FilterBar} control.<br>
		 * <br>
		 * @example
		 * <b>Example for the collapsed <code>FilterBar<code> control</b>:<br>
		 * <i>3 filters active: Company Code, Fiscal Year, Customer</i>
		 *
		 * <b>Example for the expanded <code>FilterBar<code> control</b>:<br>
		 * <i>3 filters active (1 hidden)</i>
		 *
		 * @public
		 * @returns {map} A map containing the text information
		 * @returns {map.filtersText} A string that is displayed if the {@link sap.ui.mdc.FilterBar FilterBar} control is collapsed
		 * @returns {map.filtersTextExpanded} A string that is displayed if the {@link sap.ui.mdc.FilterBar FilterBar} control is expanded
		 */
		FilterBarBase.prototype.getAssignedFiltersText = function() {
			return this._getAssignedFiltersText();
		};

		/**
		 * Triggers updates for the assigned filters, such as the <code>text</code> and <code>count</code> properties of active filters.
		 * Orchestrates the central events of the <code>FilterBarBase</code> control in addition.
		 * @private
		 * @param {object} mReportSettings Settings to control specific events
		 * @param {object} mReportSettings.triggerFilterUpdate Indicates if a filtersChange event is fired
		 * @param {object} mReportSettings.triggerSearch Indicates if a search event is fired
		 */
		FilterBarBase.prototype._reportModelChange = function(mReportSettings) {

			if (mReportSettings.triggerFilterUpdate) {
				this._handleAssignedFilterNames(false);
			}

			if (this.getLiveMode() || mReportSettings.triggerSearch || this._bExecuteOnSelect) {
				this._bExecuteOnSelect = false;
				this.triggerSearch();
			} else if (mReportSettings.recheckMissingRequired) {
				this._recheckMissingRequiredFields();
			}
		};

		/**
		 * @returns {sap.ui.mdc.util.PropertyInfo[]}
		 */
		FilterBarBase.prototype.getPropertyInfoSet = function() {
			return this.getPropertyHelper() ? this.getPropertyHelper().getProperties() : [];
		};

		FilterBarBase.prototype._addConditionChange = function(pConditionState) {
			this._aOngoingChangeAppliance.push(this.getEngine().createChanges({
				control: this,
				applySequentially: true,
				applyAbsolute: true,
				key: "Filter",
				state: pConditionState
			}));
		};

		FilterBarBase.prototype._handleConditionModelPropertyChange = function(oEvent) {

			let pConditionState;

			const fAddConditionChange = function(sFieldPath, aConditions) {
				const mOrigConditions = {};
				mOrigConditions[sFieldPath] = this._stringifyConditions(sFieldPath, merge([], aConditions));
				this._cleanupConditions(mOrigConditions[sFieldPath]);
				return mOrigConditions;
			}.bind(this);

			if (!this._bIgnoreChanges && !oEvent.getParameter("_descriptionOnly")) {

				const sPath = oEvent.getParameter("path");
				if (sPath.indexOf("/conditions/") === 0) {

					const sFieldPath = sPath.substring(12);

					const aConditions = oEvent.getParameter("value");

					if (this._getPropertyByName(sFieldPath)) {
						pConditionState = fAddConditionChange(sFieldPath, aConditions);
					} else {
						pConditionState = this._retrieveMetadata().then(() => {
							return fAddConditionChange(sFieldPath, aConditions);
						});
					}

				}
			}

			if (pConditionState) {
				this._addConditionChange(pConditionState);
			}

		};

		FilterBarBase.prototype._toExternal = function(oProperty, oCondition) {
			let oConditionExternal = merge({}, oCondition);
			oConditionExternal = ConditionConverter.toString(oConditionExternal, oProperty.typeConfig.typeInstance, this.getTypeMap());

			this._cleanupCondition(oConditionExternal);

			this._convertInOutParameters(oCondition, oConditionExternal, "inParameters", ConditionConverter.toString);
			this._convertInOutParameters(oCondition, oConditionExternal, "outParameters", ConditionConverter.toString);

			return oConditionExternal;
		};

		FilterBarBase.prototype._toInternal = function(oProperty, oCondition) {
			let oConditionInternal = merge({}, oCondition);

			oConditionInternal = ConditionConverter.toType(oConditionInternal, oProperty.typeConfig.typeInstance, this.getTypeMap());

			this._convertInOutParameters(oCondition, oConditionInternal, "inParameters", ConditionConverter.toType);
			this._convertInOutParameters(oCondition, oConditionInternal, "outParameters", ConditionConverter.toType);

			return oConditionInternal;
		};

		FilterBarBase.prototype._convertInOutParameters = function(oCondition, oConditionConverted, sParameterName, fnConverter) {
			if (oCondition[sParameterName] && (Object.keys(oCondition[sParameterName]).length > 0)) {
				Object.keys(oCondition[sParameterName]).forEach((sKey) => {
					const sName = sKey.startsWith("conditions/") ? sKey.slice(11) : sKey; // just use field name
					const oProperty = this._getPropertyByName(sName);
					if (oProperty) {
						const oOutCondition = Condition.createCondition(OperatorName.EQ, [oCondition[sParameterName][sKey]]);
						const vValue = fnConverter(oOutCondition, oProperty.typeConfig.typeInstance, this.getTypeMap());
						if (!oConditionConverted[sParameterName]) {
							oConditionConverted[sParameterName] = {};
						}
						if (!sKey.startsWith("conditions/")) { // old condition (from variant)
							delete oConditionConverted[sParameterName][sKey]; // transform to new name
							sKey = "conditions/" + sName;
						}
						oConditionConverted[sParameterName][sKey] = vValue.values[0];
					} else {
						Log.error("mdc.FilterBar._convertInOutParameters: could not find property for '" + sName + "'");
					}
				});
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
				aConditions.forEach(function(oCondition) {
					this._cleanupCondition(oCondition);
				}, this);
			}
		};

		FilterBarBase.prototype._stringifyCondition = function(oProperty, oCondition) {
			let oResultCondition = oCondition;
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
			const oProperty = this._getPropertyByName(sFieldPath);
			let aResultConditions = aConditions;

			if (oProperty && aConditions) {
				aResultConditions = [];

				aConditions.forEach(function(oCondition) {
					aResultConditions.push(this._stringifyCondition(oProperty, oCondition));
				}, this);
			}

			return aResultConditions;
		};

		FilterBarBase.prototype._internalizeConditions = function(mConditionExternal) {
			const mConditionsInternal = merge({}, mConditionExternal);

			Object.keys(mConditionsInternal).forEach(function(sKey) {
				mConditionsInternal[sKey].forEach(function(oCondition, iConditionIndex) {
					const oProperty = this._getPropertyByName(sKey);
					if (oProperty) {
						try {
							mConditionsInternal[sKey][iConditionIndex] = this._toInternal(oProperty, oCondition);
						} catch (ex) {
							Log.error(ex.message);
						}
					} else {
						Log.error("Property '" + sKey + "' does not exist");
					}

				}, this);
			}, this);

			return mConditionsInternal;
		};

		FilterBarBase.prototype._handleAssignedFilterNames = function(bFiltersAggregationChanged) {
			if (this._bIsBeingDestroyed) {
				return;
			}

			if (!bFiltersAggregationChanged) {
				if (this._btnAdapt) {
					const aFilterNames = this.getAssignedFilterNames();
					this.setProperty("_filterCount", this._oRb.getText(aFilterNames.length ? "filterbar.ADAPT_NONZERO" : "filterbar.ADAPT", [aFilterNames.length]), false);
				}
			}

			const mTexts = this._getAssignedFiltersText();
			const oObj = {
				conditionsBased: (!bFiltersAggregationChanged && !this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch),
				filtersText: mTexts.filtersText,
				filtersTextExpanded: mTexts.filtersTextExpanded
			};

			this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = false;
			this.fireFiltersChanged(oObj);

		};

		FilterBarBase.prototype.onReset = function(oEvent) {
			this._getConditionModel().removeAllConditions();
		};

		FilterBarBase.prototype.onSearch = function(oEvent) {
			if (!this._bSearchPressed) {
				this._bSearchPressed = true;

				this._sReason = ReasonMode.Go;

				this.triggerSearch().then(() => {
					this._bSearchPressed = false;
				}, () => {
					this._bSearchPressed = false;
				});
			}
		};

		/**
		 * Triggers the search.
		 * @public
		 * @returns {Promise} If the {@link sap.ui.mdc.filterbar.FilterBarBase#setSuspendSelection suspendSelection} property is set to <code>true</code>, the method will be immediately resolved, otherwise it returns the result of the {@link sap.ui.mdc.filterbar.FilterBarBase#validate} call.
		 */
		FilterBarBase.prototype.triggerSearch = function() {
			if (this.getSuspendSelection()) {
				this._bSearchTriggered = true;
				return Promise.resolve();
			}
			this._bFireSearch = true;
			return this.validate();
		};

		FilterBarBase.prototype._hasRetrieveMetadataToBeCalled = function() {
			return ((this.getPropertyHelper() === null) || ((this.getPropertyHelper().getProperties().length === 0) && !this.isPropertyHelperFinal()));
		};

		/**
		 * Returns a <code>Promise</code> for the asynchronous validation of filters.
		 *
		 * @public
		 * @param {boolean} bSuppressSearch Indicates whether the <code>search</code> event is triggered after successful validation
		 * @returns {Promise} Returns a <code>Promise</code> that resolves after the validation of erroneous fields has been propagated.
		 *
		 */
		FilterBarBase.prototype.validate = function(bSuppressSearch) {

			const bFireSearch = !bSuppressSearch;
			this._bFireSearch = this._bFireSearch || bFireSearch;

			const fValidateFc = function() {
				if (!this._oValidationPromise) {

					this._oValidationPromise = new Promise((resolve, reject) => {
						this._fResolvedSearchPromise = resolve;
						this._fRejectedSearchPromise = reject;
					});

					const fDelayedFunction = function() {
						this._validate(bFireSearch);
					};
					setTimeout(fDelayedFunction.bind(this), 0);
				}

				return this._oValidationPromise;
			}.bind(this);

			return this.waitForInitialization().then(() => {
				if (this._hasRetrieveMetadataToBeCalled()) {
					return this._retrieveMetadata().then(() => {
						return fValidateFc();
					});
				} else {
					return fValidateFc();
				}
			});
		};

		FilterBarBase.prototype._clearDelayedSearch = function() {
			if (this._iDelayedSearchId) {
				clearTimeout(this._iDelayedSearchId);
				this._iDelayedSearchId = null;
			}
		};

		FilterBarBase.prototype._checkAsyncValidation = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			if (this._aFIChanges && this._aFIChanges.length > 0) {
				vRetErrorState = FilterBarValidationStatus.AsyncValidation;
			}

			return vRetErrorState;
		};

		FilterBarBase.prototype._checkOngoingChangeAppliance = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			if (this._aOngoingChangeAppliance && this._aOngoingChangeAppliance.length > 0) {
				vRetErrorState = FilterBarValidationStatus.OngoingChangeAppliance;
			}

			return vRetErrorState;
		};

		FilterBarBase.prototype._getRequiredFilterFieldValueText = function(oFilterField) {
			if (oFilterField) {
				return this._oRb.getText("filterbar.REQUIRED_FILTER_VALUE_MISSING", [oFilterField.getLabel()]);
			} else {
				return "";
			}
		};

		FilterBarBase.prototype._recheckMissingRequiredFields = function() {
			this.getFilterItems().forEach((oFilterField) => {
				let aReqFiltersWithoutValue;
				if (oFilterField) {
					if ((oFilterField.getValueState() !== ValueState.None) &&
						(oFilterField.getValueStateText() === this._getRequiredFilterFieldValueText(oFilterField))) {

						if (!aReqFiltersWithoutValue) {
							aReqFiltersWithoutValue = FilterUtil.getRequiredFieldNamesWithoutValues(this);
						}

						if (aReqFiltersWithoutValue.indexOf(oFilterField.getPropertyKey()) < 0) {
							oFilterField.setValueState(ValueState.None);
						}
					}
				}
			});
		};

		FilterBarBase.prototype._checkRequiredFields = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			const aReqFiltersWithoutValue = FilterUtil.getRequiredFieldNamesWithoutValues(this);
			aReqFiltersWithoutValue.forEach((sName) => {
				const oFilterField = this._getFilterField(sName);
				if (oFilterField) {
					if (oFilterField.getValueState() === ValueState.None) {
						oFilterField.setValueState(ValueState.Error);
						oFilterField.setValueStateText(this._getRequiredFilterFieldValueText(oFilterField));
					}
				} else {
					Log.error("Mandatory filter field '" + sName + "' not visible on FilterBarBase has no value.");
				}

				vRetErrorState = FilterBarValidationStatus.RequiredHasNoValue;
			});

			return vRetErrorState;
		};

		FilterBarBase.prototype._checkFieldsInErrorState = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			if (this._bFieldInErrorState) {
				return FilterBarValidationStatus.FieldInErrorState;
			}

			this.getFilterItems().some((oFilterField) => {
				if (oFilterField && (oFilterField.getValueState() !== ValueState.None)) {
					if (oFilterField.getValueStateText() !== this._getRequiredFilterFieldValueText(oFilterField)) {
						vRetErrorState = FilterBarValidationStatus.FieldInErrorState;
					}
				}

				return vRetErrorState !== FilterBarValidationStatus.NoError;
			});

			return vRetErrorState;
		};

		FilterBarBase.prototype._hasAppliancePromises = function() {
			return (this._aOngoingChangeAppliance && (this._aOngoingChangeAppliance.length > 0)) ? this._aOngoingChangeAppliance.slice() : null;
		};

		FilterBarBase.prototype._handleFilterItemSubmit = function(oEvent) {

			const oPromise = oEvent.getParameter("promise");
			if (oPromise) {

				this._sReason = ReasonMode.Enter;

				oPromise.then(() => {
					const aWaitPromises = this._hasAppliancePromises();
					if (!aWaitPromises) { // no changes
						this.triggerSearch();
					} else {
						Promise.all(aWaitPromises).then(() => {
							if (!this.getLiveMode()) { // changes in livemode will triggerSearch via onModification
								this.triggerSearch();
							}
						});
					}
				}).catch((oEx) => {
					Log.error(oEx);
					this.triggerSearch().catch((oEx) => {}); // catch rejected and do nothing
				});
			}
		};

		FilterBarBase.prototype._handleFilterItemChanges = function(oEvent) {

			if (this._bIgnoreChanges) {
				return;
			}

			const oFilterField = oEvent.oSource;
			if (oFilterField.getRequired() && (oFilterField.getValueState() === ValueState.Error) && oEvent.getParameter("valid")) {
				oFilterField.setValueState(ValueState.None);
				return;
			}

			if (!this._aFIChanges) {
				this._aFIChanges = [];
			}

			const sFilterName = oFilterField.getPropertyKey();
			this._aFIChanges.some((oFieldInfo, nIdx) => {
				if (oFieldInfo.name === sFilterName) {
					this._aFIChanges.splice(nIdx, 1); //this entry will be replaced with the latest values
					return true;
				}
				return false;
			});

			this._aFIChanges.push({ name: sFilterName, promise: oEvent.getParameter("promise") });
		};

		/**
		 * Checks the validation status of the filter fields.
		 * <b>Note:</b>
		 * This method returns the current inner state of the {@link sap.ui.mdc.FilterBar FilterBar}.
		 * @public
		 * @returns {sap.ui.mdc.enums.FilterBarValidationStatus} Contains the validation status
		 */
		FilterBarBase.prototype.checkFilters = function() {
			let vRetErrorState = this._checkAsyncValidation();
			if (vRetErrorState !== FilterBarValidationStatus.NoError) {
				return vRetErrorState;
			}

			vRetErrorState = this._checkOngoingChangeAppliance();
			if (vRetErrorState !== FilterBarValidationStatus.NoError) {
				return vRetErrorState;
			}

			vRetErrorState = this._checkFieldsInErrorState();
			if (vRetErrorState !== FilterBarValidationStatus.NoError) {
				return vRetErrorState;
			}

			vRetErrorState = this._checkRequiredFields();
			if (vRetErrorState !== FilterBarValidationStatus.NoError) {
				return vRetErrorState;
			}

			return vRetErrorState;
		};

		FilterBarBase.prototype._setFocusOnFirstErroneousField = function() {
			let oFilterField = null;
			this.getFilterItems().some((oFilterItem) => {
				if (oFilterItem.getValueState() !== ValueState.None) {
					oFilterField = oFilterItem;
					setTimeout(oFilterItem["focus"].bind(oFilterItem), 0);
				}
				return oFilterField != null;
			});

			return oFilterField;
		};

		FilterBarBase.prototype._handleAsyncValidation = function(bFireSearch, fnCallBack) {

			if (!fnCallBack) {
				fnCallBack = this._validate.bind(this);
			}

			if (this._aFIChanges && (this._aFIChanges.length > 0)) {

				const aNamePromisesArray = this._aFIChanges.slice();
				this._aFIChanges = null;

				const aChangePromises = [];
				aNamePromisesArray.forEach((oNamePromise) => {
					aChangePromises.push(oNamePromise.promise);
				});

				Promise.all(aChangePromises).then((aConditionsArray) => {

						aConditionsArray.forEach(function(aConditions, nIdx) {
							const oFF = this._getFilterField(aNamePromisesArray[nIdx].name);
							if (oFF && oFF.getRequired() && (oFF.getValueState() === ValueState.Error)) {
								oFF.setValueState(ValueState.None); //valid existing value -> clear missing required error
							}
						}, this);
						fnCallBack(bFireSearch);
					},
					() => {
						this._bFieldInErrorState = true;
						fnCallBack(bFireSearch);
					}).catch((oEx) => {
					this._bFieldInErrorState = true;
					fnCallBack(bFireSearch);
				});
			}
		};

		FilterBarBase.prototype._handleOngoingChangeAppliance = function(bFireSearch, fnCallBack) {

			if (!fnCallBack) {
				fnCallBack = this._validate.bind(this);
			}

			if (this._aOngoingChangeAppliance && (this._aOngoingChangeAppliance.length > 0)) {

				const aChangePromises = this._aOngoingChangeAppliance.slice();
				this._aOngoingChangeAppliance = [];

				Promise.all(aChangePromises).then(() => {
						const pWait = this._oApplyingChanges ? this._oApplyingChanges : Promise.resolve();
						pWait.then(() => fnCallBack(bFireSearch));
					},
					() => {
						this._bFieldInErrorState = true;
						fnCallBack(bFireSearch);
					}).catch((oEx) => {
						this._bFieldInErrorState = true;
						fnCallBack(bFireSearch);
				});
			}
		};

		FilterBarBase.prototype._determineValidationState = function() {
			return this.awaitControlDelegate().then((oDelegate) => {
				return oDelegate.determineValidationState(this, this.checkFilters());
			});
		};

		FilterBarBase.prototype._visualizeValidationState = function(nValidationStatus) {
			if (this._oDelegate) {
				this._oDelegate.visualizeValidationState(this, { status: nValidationStatus });
			}
		};

		/**
		 * Gets the corresponding library text.
		 * @private
		 * @param {string} sKey Key of the text
		 * @param {array} args Arguments for the message creation
		 * @returns {string} Relevant text from the message bundle
		 */
		FilterBarBase.prototype.getResourceFileText = function(sKey, args) {
			return sKey ? this._oRb.getText(sKey, args) : "";
		};

		FilterBarBase.prototype._restartCheckAndNotify = function(bFireSearch) {
			const vRetErrorState = this.checkFilters();
			this._checkAndNotify(bFireSearch, vRetErrorState);
		};

		FilterBarBase.prototype._checkAndNotify = function(bFireSearch, vRetErrorState) {
			const fnCheckAndFireSearch = function() {
				if (bFireSearch || this._bFireSearch) {
					const oObj = {
						reason: this._sReason ? this._sReason : ReasonMode.Unclear
					};
					this._sReason = ReasonMode.Unclear;

					this.fireSearch(oObj);
				}
			}.bind(this);

			const fnCleanup = function() {
				this._bFieldInErrorState = false;
				this._oValidationPromise = null;
				this._fRejectedSearchPromise = null;
				this._fResolvedSearchPromise = null;
				this._bFireSearch = false;
			}.bind(this);

			if (vRetErrorState === FilterBarValidationStatus.AsyncValidation) {
				this._handleAsyncValidation(bFireSearch, this._restartCheckAndNotify.bind(this));
				return;
			}

			if (vRetErrorState === FilterBarValidationStatus.OngoingChangeAppliance) {
				this._handleOngoingChangeAppliance(bFireSearch, this._restartCheckAndNotify.bind(this));
				return;
			}

			if (vRetErrorState === FilterBarValidationStatus.NoError) {
				if (this._fResolvedSearchPromise) {
					fnCheckAndFireSearch();
					this._fResolvedSearchPromise();
				}
			} else if (this._fRejectedSearchPromise) {
				this._setFocusOnFirstErroneousField();
				this._fRejectedSearchPromise();
			}

			this._visualizeValidationState(vRetErrorState);
			fnCleanup();
		};

		FilterBarBase.prototype._validate = function(bFireSearch) {
			const fnCleanup = function() {
				this._oValidationPromise = null;
				this._fRejectedSearchPromise = null;
				this._fResolvedSearchPromise = null;
			}.bind(this);

			if (this.bIsDestroyed) {
				fnCleanup();
				return;
			}

			this._determineValidationState().then((vRetErrorState) => {
				this._checkAndNotify(bFireSearch, vRetErrorState);
			});
		};

		/**
		 * Sets conditions to the inner condition model.
		 * <br><b>Note:</b>
		 * This method is only called for filling in the parameters for value help scenarios.
		 * @private
		 * @param {map} mConditions A map containing the conditions
		 */
		FilterBarBase.prototype.setInternalConditions = function(mConditions) {
			const oModel = this._getConditionModel();
			if (oModel) {
				oModel.setConditions(mConditions);
			}
		};

		/**
		 * Gets the conditions of the inner condition model.
		 *
		 * <b>Note:</b> This method returns a map of conditions in an internalized format which is NOT suitable for control state application.
		 *
		 * @returns {map} A map containing the conditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.fe
		 */
		FilterBarBase.prototype.getInternalConditions = function() {
			return this._getModelConditions(this._getConditionModel(), true);
		};

		/**
		 * Gets the state of initialization.
		 * This method does not trigger the retrieval of the metadata.
		 * @private
		 * @returns {Promise} Resolves after the initial filters have been applied
		 */
		FilterBarBase.prototype.waitForInitialization = function() {
			return Promise.all([this._oInitialFiltersAppliedPromise, this._oMetadataAppliedPromise]);
		};

		/**
		 * Gets the state of initialization.
		 * This method does not trigger the retrieval of the metadata.
		 * @public
		 * @returns {Promise} Resolves after the initial filters have been applied
		 */
		FilterBarBase.prototype.initialized = function() {
			return this.waitForInitialization();
		};


		/**
		 * Gets the state of initialization.
		 * This method triggers the retrieval of the metadata.
		 * @public
		 * @returns {Promise} Resolves after the initial filters have been applied and the metadata has been obtained
		 */
		FilterBarBase.prototype.initializedWithMetadata = function() {

			if (!this._oMetadataAppliedPromise) {
				this._retrieveMetadata();
			}
			return this.waitForInitialization();
		};

		/**
		 * Gets the conditions of the inner condition model.
		 * @private
		 * @param {object} oModel Contains the conditions
		 * @param {boolean} bDoNotExternalize Indicates if the returned conditions are in an external format
		 * @param {boolean} bKeepAllValues Indicates if the returned conditions include empty arrays rather then removing them
		 * @returns {map} A map containing the conditions
		 */
		FilterBarBase.prototype._getModelConditions = function(oModel, bDoNotExternalize, bKeepAllValues) {
			const mConditions = {};
			if (oModel) {
				const aAllConditions = merge({}, oModel.getAllConditions());
				for (const sFieldPath in aAllConditions) {
					if (aAllConditions[sFieldPath] && (bKeepAllValues || aAllConditions[sFieldPath].length > 0)) {
						mConditions[sFieldPath] = aAllConditions[sFieldPath];
						if (!bDoNotExternalize) {
							this._cleanupConditions(mConditions[sFieldPath]);
							const aFieldConditions = this._stringifyConditions(sFieldPath, mConditions[sFieldPath]);
							mConditions[sFieldPath] = aFieldConditions;
						}
					}
				}
			}

			return mConditions;
		};

		FilterBarBase.prototype._isPathKnown = function(sFieldPath, oXCondition) {
			let sKey, sName;

			if (!this._getPropertyByName(sFieldPath)) {
				return false;
			}

			for (sKey in oXCondition["inParameters"]) {
				sName = sKey.startsWith("conditions/") ? sKey.slice(11) : sKey; // just use field name
				if (!this._getPropertyByName(sName)) {
					return false;
				}
			}
			for (sKey in oXCondition["outParameters"]) {
				sName = sKey.startsWith("conditions/") ? sKey.slice(11) : sKey; // just use field name
				if (!this._getPropertyByName(sName)) {
					return false;
				}
			}

			return true;
		};


		/**
		 * Called whenever modification occured through personalization change appliance
		 *
		 * @param {string[]} aAffectedControllers Array of affected engine controllers during appliance
		 * @returns {Promise} Resolves after modification changes have been processed by the <code>FilterBarBase</code>
		 * @private
		 */
		FilterBarBase.prototype._onModifications = function(aAffectedControllers) {
			if (aAffectedControllers && aAffectedControllers.indexOf("Filter") === -1) {
				// optimized executions in case nothing needs to be done
				// --> no filter changes have been done
				return Promise.resolve();
			}

			let fResolveApplyingChanges;

			if (!this._oApplyingChanges) {
				this._oApplyingChanges = new Promise((resolve) => {
					fResolveApplyingChanges = resolve;
				});
			}

			return this._setXConditions(this.getFilterConditions()).then(() => {
				this._reportModelChange({
					triggerSearch: false,
					triggerFilterUpdate: true,
					recheckMissingRequired: true
				});

				fResolveApplyingChanges();
				this._oApplyingChanges = null;

			});
		};

		FilterBarBase.prototype._setXConditions = function(mConditionsData) {
			if (mConditionsData) {

				let bAllPropertiesKnown = true;
				for (const sFieldPath in mConditionsData) {
					const aConditions = mConditionsData[sFieldPath];

					if (!this._isPathKnown(sFieldPath, aConditions)) {
						bAllPropertiesKnown = false;
						break;
					}
				}

				const pBeforeSet = bAllPropertiesKnown ? Promise.resolve() : this._retrieveMetadata();
				const oConditionModel = this._getConditionModel();

				return pBeforeSet.then(() => {

					const mNewInternal = this._internalizeConditions(mConditionsData);
					const mCurrentInternal = this._getModelConditions(oConditionModel, true);

					oConditionModel.detachPropertyChange(this._handleConditionModelPropertyChange, this);

					try {
						return this.getEngine().diffState(this, { Filter: mCurrentInternal }, { Filter: mNewInternal }).then((oStateDiff) => {
							Object.keys(oStateDiff.Filter).forEach((sDiffPath) => {
								oStateDiff.Filter[sDiffPath].forEach((oCondition) => {
									if (oCondition.filtered !== false) {
										oConditionModel.addCondition(sDiffPath, oCondition);
									} else {
										oConditionModel.removeCondition(sDiffPath, oCondition);
									}
								});
							});
							oConditionModel.attachPropertyChange(this._handleConditionModelPropertyChange, this);
						});

					} catch (ex) {
						Log.error(ex.message);
						oConditionModel.attachPropertyChange(this._handleConditionModelPropertyChange, this);
					}

				});

			} else {
				return Promise.resolve();
			}
		};

		FilterBarBase.prototype._getXConditions = function() {
			return this._getModelConditions(this._getConditionModel(), false);
		};

		FilterBarBase.prototype._getRequiredPropertyNames = function() {
			const aReqFilterNames = [];

			this._getNonHiddenPropertyInfoSet().forEach((oProperty) => {
				if (oProperty.required) {
					aReqFilterNames.push(IdentifierUtil.getPropertyKey(oProperty));
				}
			});

			return aReqFilterNames;
		};

		FilterBarBase.prototype._getNonRequiredPropertyNames = function() {
			const aNonReqFilterNames = [];

			this._getNonHiddenPropertyInfoSet().forEach((oProperty) => {
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

			const LayoutItem = this._cLayoutItem;
			const oLayoutItem = new LayoutItem();
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
			let iIndex;

			iIndex = this.indexOfAggregation("filterItems", oFilterField);
			if (this.getAggregation("basicSearchField")) {
				iIndex++;
			}

			const nIndex = iIndex;
			const aFilterFields = this.getFilterItems();
			for (let i = 0; i < nIndex; i++) {
				if (!aFilterFields[i].getVisible()) {
					iIndex--;
				}
			}

			this._handleAddedFilterField(oFilterField);

			this._insertFilterFieldtoContent(oFilterField, iIndex);

			if (!this._oObserver.isObserved(oFilterField, { properties: ["visible"] })) {
				this._oObserver.observe(oFilterField, { properties: ["visible"] });
			}
		};

		FilterBarBase.prototype._filterItemRemoved = function(oFilterItem) {

			this._handleRemovedFilterField(oFilterItem);

			this._applyFilterItemRemoved(oFilterItem.getPropertyKey());

			this._handleAssignedFilterNames(true);
		};

		FilterBarBase.prototype._applyFilterItemRemoved = function(sFieldPath) {
			this._removeFilterFieldFromContentByName(sFieldPath);
		};

		FilterBarBase.prototype._removeFilterFieldFromContent = function(oFilterItem) {
			this._removeFilterFieldFromContentByName(oFilterItem.getPropertyKey());
		};

		FilterBarBase.prototype._removeFilterFieldFromContentByName = function(sFieldPath) {
			const oLayoutItem = this._getFilterItemLayoutByName(sFieldPath);

			if (oLayoutItem) {
				this._oFilterBarLayout.removeFilterField(oLayoutItem);
				oLayoutItem.destroy();
			}
		};

		FilterBarBase.prototype._handleAddedFilterField = function(oFilterField) {
			// only relevant for the mdc.FB
		};
		FilterBarBase.prototype._handleRemovedFilterField = function(oFilterField) {
			// only relevant for the mdc.FB
		};

		FilterBarBase.prototype._observeChanges = function(oChanges) {
			let oFilterField;

			if (oChanges.type === "aggregation") {

				if (oChanges.name === "filterItems") {
					switch (oChanges.mutation) {
						case "insert":
							oFilterField = this._enhanceFilterField(oChanges.child);
							oFilterField.attachChange(this._handleFilterItemChanges, this);
							oFilterField.attachSubmit(this._handleFilterItemSubmit, this);
							this._filterItemInserted(oFilterField);
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

				if (oChanges.object.isA && oChanges.object.isA("sap.ui.mdc.FilterField")) { // only visible is considered
					oFilterField = oChanges.object;
					if (oFilterField) {
						if (oChanges.current) {
							this._filterItemInserted(oFilterField);
						} else {
							this._filterItemRemoved(oFilterField);
						}

						this._oFilterBarLayout.invalidate();
					}
				}
			}
		};

		FilterBarBase.prototype._getFilterItemLayout = function(oFilterField) {
			return this._getFilterItemLayoutByName(oFilterField.getPropertyKey());
		};

		FilterBarBase.prototype._getFilterItemLayoutByName = function(sFieldPath) {
			let oFilterItemLayout = null;

			if (this._oFilterBarLayout) {
				this._oFilterBarLayout.getFilterFields().some((oItemLayout) => {
					if (oItemLayout._getFieldPath() === sFieldPath) {
						oFilterItemLayout = oItemLayout;
					}

					return oFilterItemLayout !== null;
				});
			}

			return oFilterItemLayout;
		};

		FilterBarBase.prototype._getFilterField = function(sName) {
			let oFilterField = null;
			this.getFilterItems().some((oFilterItem) => {
				if (oFilterItem && (oFilterItem.getPropertyKey() === sName)) {
					oFilterField = oFilterItem;
				}

				return oFilterField !== null;
			});

			return oFilterField;
		};

		FilterBarBase.prototype._retrieveMetadata = function() {

			if (this.isPropertyHelperFinal()) {
				return Promise.resolve();
			}

			if (this._oMetadataAppliedPromise) {
				return this._oMetadataAppliedPromise;
			}

			this._fResolveMetadataApplied = undefined;
			this._oMetadataAppliedPromise = new Promise((resolve, reject) => {
				this._fResolveMetadataApplied = resolve;
				this._fRejectMetadataApplied = reject;
			});


			this.initControlDelegate().then(() => {
				if (!this._bIsBeingDestroyed) {

					const fnResolveMetadata = function(bFlag) {
						bFlag ? this._fResolveMetadataApplied() : this._fRejectMetadataApplied();
						this._fResolveMetadataApplied = null;
						this._fRejectMetadataApplied = null;
					}.bind(this);

					if (this.isControlDelegateInitialized()) {
						this.finalizePropertyHelper().then(() => {
							fnResolveMetadata(true);
						});
					} else {
						Log.error("Delegate not initialized.");
						fnResolveMetadata(false);
					}
				}
			});

			return this._oMetadataAppliedPromise;
		};

		FilterBarBase.prototype._enhanceFilterField = function(oFilterField) {
			let sPropertyKey, oProperty;

			if (oFilterField) {
				sPropertyKey = oFilterField.getPropertyKey();

				if (!sPropertyKey) {
					Log.error("filter field with the id = '" + oFilterField.getId() + "' should have an assigned 'propertyKey'");
					return oFilterField;
				}

// is default
//				if (!oFilterField.getDelegate()) {
//					oFilterField.setDelegate({name: "sap/ui/mdc/field/FieldBaseDelegate"});
//				}
				if (!oFilterField.getBindingInfo("conditions")) {
					oFilterField.bindProperty("conditions",{
						path: '/conditions/' + sPropertyKey,
						model: "$filters"});
				}
				oProperty = this._getPropertyByName(sPropertyKey);
				if (!oProperty && this.getPropertyInfo().length > 0) { //the data in propertyInfo may still not be propagated to property helper, so we check also directly
					this.getPropertyInfo().some((oPropertyInfo) => {
						if ((oPropertyInfo.key === sPropertyKey) || (oPropertyInfo.name === sPropertyKey)) {
							oProperty = oPropertyInfo;
						}
						return oProperty;
					});
				}
				if (!oProperty) {
					if (!this.isA("sap.ui.mdc.valuehelp.FilterBar")) { // vh.FB does not support 'propertyInfo'...
						Log.warning("Property '" + sPropertyKey + "' does not exist for filter field with the id = '" + oFilterField.getId() + "' on filter bar='" + this.getId() + "'");
					}
					return oFilterField;
				}

				if (oFilterField.isPropertyInitial("dataType") && oProperty.hasOwnProperty("dataType") && oProperty.dataType) {
					oFilterField.setDataType(oProperty.dataType);
				}
				if (oFilterField.isPropertyInitial("required") && oProperty.hasOwnProperty("required")) {
					oFilterField.setRequired(oProperty.required);
				}
				if (oFilterField.isPropertyInitial("maxConditions") && oProperty.hasOwnProperty("maxConditions") && oProperty.maxConditions) {
					oFilterField.setMaxConditions(oProperty.maxConditions);
				}
				if (!oFilterField.getLabel() && oProperty.hasOwnProperty("label") && oProperty.label) {
					oFilterField.setLabel(oProperty.label);
				}
				if (!oFilterField.getDataTypeConstraints() && oProperty.hasOwnProperty("constraints") && oProperty.constraints) {
					oFilterField.setDataTypeConstraints(oProperty.constraints);
				}
				if (!oFilterField.getDataTypeFormatOptions() && oProperty.hasOwnProperty("formatOptions") && oProperty.formatOptions) {
					oFilterField.setDataTypeFormatOptions(oProperty.formatOptions);
				}
				// no display, no valueHelp, no additionalDataType, no tooltip, no operators, no defaultOperator, no caseSensitive

				oFilterField.triggerCheckCreateInternalContent();
			}

			return oFilterField;
		};


		FilterBarBase.prototype.setBasicSearchField = function(oBasicSearchField) {

			const oOldBasicSearchField = this.getAggregation("basicSearchField");
			if (oOldBasicSearchField) {
				this.removeAggregation("basicSearchField", oOldBasicSearchField);
			}

			this.setAggregation("basicSearchField", oBasicSearchField);

			if (oBasicSearchField) {
				if (!this._oObserver.isObserved(oBasicSearchField, { properties: ["visible"] })) {
					this._oObserver.observe(oBasicSearchField, { properties: ["visible"] });
				}
			}

			return this;
		};

		FilterBarBase.prototype._getNonHiddenPropertyInfoSet = function() {
			const aVisibleProperties = [];
			this.getPropertyInfoSet().every((oProperty) => {
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
			let oProperty = null;
			this._getNonHiddenPropertyInfoSet().some((oProp) => {
				if (IdentifierUtil.getPropertyKey(oProp) === sName) {
					oProperty = oProp;
				}

				return oProperty != null;
			});

			return oProperty;
		};

		FilterBarBase.prototype._cleanUpFilterFieldInErrorStateByName = function(sFieldName) {
			let oFilterField = null;
			const aFilterFields = this.getFilterItems();
			aFilterFields.some((oFF) => {
				if (oFF.getPropertyKey() === sFieldName) {
					oFilterField = oFF;
				}

				return oFilterField != null;
			});

			if (oFilterField) {
				this._cleanUpFilterFieldInErrorState(oFilterField);
			}

		};

		/**
		 * Clears non-model value for any filter field and resets the value state to none.
		 *
		 * @public
		 */
		FilterBarBase.prototype.cleanUpAllFilterFieldsInErrorState = function() {

			this._getConditionModel().checkUpdate(true);

			const aFilterFields = this.getFilterItems();
			aFilterFields.forEach((oFilterField) => {
				this._cleanUpFilterFieldInErrorState(oFilterField);
			});
		};

		FilterBarBase.prototype._cleanUpFilterFieldInErrorState = function(oFilterField) {

			if (oFilterField && (oFilterField.getValueState() !== ValueState.None)) {
				oFilterField.setValueState(ValueState.None);
			}
		};

		FilterBarBase.prototype._applyInitialFilterConditions = function() {

			this._bIgnoreChanges = true;

			this._applyFilterConditionsChanges().then(() => {
				this._bIgnoreChanges = false;
				this._reportModelChange({
					triggerFilterUpdate: true,
					triggerSearch: false
				});
				this._bInitialFiltersApplied = true;
				this._fResolveInitialFiltersApplied();
				this._fResolveInitialFiltersApplied = null;
			});
		};

		FilterBarBase.prototype._applyFilterConditionsChanges = function() {

			let mConditionsData;

			const mSettings = this.getProperty("filterConditions");
			if (Object.keys(mSettings).length > 0) {
				mConditionsData = merge({}, mSettings);
				return this._setXConditions(mConditionsData);
			}

			return Promise.resolve();
		};

		FilterBarBase.prototype._loadFlex = function() {

			return new Promise((fResolve) => {
				Library.load({name: 'sap.ui.fl'}).then(() => {
					sap.ui.require([
						"sap/ui/fl/apply/api/ControlVariantApplyAPI"
					], (ControlVariantApplyAPI) => {
						fResolve(ControlVariantApplyAPI);
					});
				}).catch((oEx) => {
					Log.error(oEx);
					fResolve(null);
				});
			});

		};

		FilterBarBase.prototype.setVariantBackreference = function(oVariantManagement) {
			if (!this._hasAssignedVariantManagement()) {
				this.setAssociation("variantBackreference", oVariantManagement);
				this._loadFlex().then((ControlVariantApplyAPI) => {
					FlexApplyAPI = ControlVariantApplyAPI;
					FlexApplyAPI.attachVariantApplied({
						selector: this,
						vmControlId: this.getVariantBackreference(),
						callback: this._handleVariantSwitch.bind(this),
						callAfterInitialVariant: true
					});
				});
			} else {
				Log.error("the association 'variantBackreference' may only be assigned once and may not change afterwards.");
			}

			return this;
		};

		FilterBarBase.prototype._handleVariantSwitch = function(oVariant) {

			this._bExecuteOnSelect = this._getExecuteOnSelectionOnVariant(oVariant);

			this._sReason = this._bExecuteOnSelect ? ReasonMode.Variant : ReasonMode.Unclear;

			this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = false;
			if (oVariant.hasOwnProperty("createScenario") && (oVariant.createScenario === "saveAs")) {
				//during SaveAs a switch occurs but the processing of related variants based changes may still be ongoing
				this._bDoNotTriggerFiltersChangeEventBasedOnVariantSwitch = true;
			}

			return this.awaitPendingModification().then((aAffectedControllers) => {
				//clean-up fields in error state
				this.cleanUpAllFilterFieldsInErrorState();

				// ensure that the initial filters are applied --> only trigger search & validate when no filterbar changes exists.
				// Filterbar specific changes will be handled via _onModifications.
				if (this._bInitialFiltersApplied && ((aAffectedControllers.indexOf("Filter") === -1))) {
					this._reportModelChange({
						triggerFilterUpdate: false,
						triggerSearch: this._bExecuteOnSelect
					});
				}
			});

		};

		FilterBarBase.prototype._getExecuteOnSelectionOnVariant = function(oVariant) {
			let bExecuteOnSelect = false;
			const oVariantManagement = this._getAssignedVariantManagement();
			if (oVariantManagement) {
				bExecuteOnSelect = oVariantManagement.getApplyAutomaticallyOnVariant(oVariant);
			}

			return bExecuteOnSelect;
		};

		FilterBarBase.prototype._hasAssignedVariantManagement = function() {
			return this._getAssignedVariantManagement() ? true : false;
		};

		FilterBarBase.prototype._getAssignedVariantManagement = function() {
			const sVariantControlId = this.getVariantBackreference();

			if (sVariantControlId) {
				const oVariantManagement = Element.getElementById(sVariantControlId);
				if (oVariantManagement && oVariantManagement.isA("sap.ui.fl.variants.VariantManagement")) {
					return oVariantManagement;
				}
			}

			return null;
		};

		FilterBarBase.prototype._getView = function() {
			return IdentifierUtil.getView(this);
		};

		/**
		 * Gets the external conditions.
		 *
		 * @public
		 * @returns {map} Map containing the external conditions
		 */
		FilterBarBase.prototype.getConditions = function() {
			const mConditions = this.getCurrentState().filter;
			if (mConditions && mConditions["$search"]) {
				delete mConditions["$search"];
			}

			return mConditions;
		};

		/**
		 * Gets the value of the basic search condition.
		 *
		 * @public
		 * @returns {string} Value of search condition or empty
		 */
		FilterBarBase.prototype.getSearch = function() {
			const aSearchConditions = this._getConditionModel() ? this._getConditionModel().getConditions("$search") : [];
			return aSearchConditions[0] ? aSearchConditions[0].values[0] : "";
		};

		FilterBarBase.prototype.exit = function() {

			if (this._hasAssignedVariantManagement() && FlexApplyAPI) {
				FlexApplyAPI.detachVariantApplied({
					selector: this,
					vmControlId: this.getVariantBackreference()
				});
				FlexApplyAPI = undefined;
			}

			if (this.isControlDelegateInitialized() && this.getControlDelegate().cleanup) {
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

			this._oDelegate = null;

			this._oFlexPromise = null;

			this._fResolveMetadataApplied = undefined;
			this._oMetadataAppliedPromise = null;

			this._oInitialFiltersAppliedPromise = null;

			this._oValidationPromise = null;

			this._aBindings = null;

			this._aFIChanges = null;

			this._aOngoingChangeAppliance = null;
		};

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#addFilterItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#destroyFilterItems
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#insertFilterItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#removeFilterItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#removeAllFilterItems
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#setFilterConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#getFilterConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#setPropertyInfo
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.filterbar.FilterBarBase#getPropertyInfo
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		return FilterBarBase;

	});