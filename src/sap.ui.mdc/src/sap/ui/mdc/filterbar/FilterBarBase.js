/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/core/Element",
		"sap/ui/core/Lib",
		'sap/ui/mdc/p13n/subcontroller/FilterController',
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
		'sap/ui/mdc/condition/FilterOperatorUtil',
		'sap/ui/mdc/util/IdentifierUtil',
		'sap/ui/mdc/util/FilterUtil',
		"sap/ui/mdc/filterbar/PropertyHelper",
		"sap/ui/mdc/enums/ReasonMode",
		"sap/ui/mdc/enums/FilterBarValidationStatus",
		"sap/ui/mdc/enums/OperatorName",
		"sap/m/library",
		"sap/m/Button",
		"./FilterBarBaseRenderer",
		"sap/ui/mdc/FilterField",
		"sap/ui/mdc/filterbar/PropertyInfoValidator",
		"sap/ui/core/InvisibleText",
		"sap/ui/core/Messaging",
		"sap/ui/core/message/Message",
		"sap/ui/core/message/MessageType"
	],
	(
		Element,
		Library,
		FilterController,
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
		FilterOperatorUtil,
		IdentifierUtil,
		FilterUtil,
		PropertyHelper,
		ReasonMode,
		FilterBarValidationStatus,
		OperatorName,
		mLibrary,
		Button,
		FilterBarBaseRenderer,
		FilterField,
		PropertyInfoValidator,
		InvisibleText,
		Messaging,
		Message,
		MessageType
	) => {
		"use strict";

		// sap.ui.fl-related classes (loaded async after library load)
		let FlexApplyAPI;

		const SEARCH_CONDITION = "$search";

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
					 * The object has the following properties (see {@link sap.ui.mdc.DelegateConfig DelegateConfig}):
					 * <ul>
					 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module. The used delegate module must inherit from
				 	 *       {@link module:sap/ui/mdc/FilterBarDelegate FilterBarDelegate}.</li>
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
						},
						bindable: false
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
						defaultValue: {},
						bindable: false
					},

					/**
					 * Specifies the filter metadata.<br>
					 * The format is the same as the return type of the {@link module:sap/ui/mdc/FilterBarDelegate.fetchProperties fetchProperties} delegate function.<br>
					 * Properties specified here must be consistent with properties returned by the {@link module:sap/ui/mdc/FilterBarDelegate.fetchProperties fetchProperties} callback, otherwise validation errors might occur.<br>
					 * Metadata for initially rendered {@link sap.ui.mdc.FilterField FilterFields} (those in the <code>filterItems</code> aggregation) should be specified here, rather than in the <code>FilterField</code> configuration.<br>
					 * <b>Note</b>: This property must not be bound.<br>
					 * <b>Node</b>: Please check {@link sap.ui.mdc.filterbar.PropertyInfo} for more information about the supported inner elements.
					 * <b>Note</b>: Existing properties (set via {@link #setPropertyInfo setPropertyInfo}) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/FilterBarDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
					 *
					 * @since 1.97
					 */
					propertyInfo: {
						type: "object",
						defaultValue: [],
						bindable: false
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
					 * Also, the <code>conditions</code> property of <code>filterItems</code> is managed by the control.
					 */
					filterItems: {
						type: "sap.ui.mdc.FilterField",
						multiple: true
					},

					/**
					 * Contains the optional basic search field.
					 * <b>Note:</b> The <code>conditions</code> property of this field is managed by the control.
					 * The <code>propertyKey</code> property of this field has to be <code>$search</code> and is enforced by this control.
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
					},

					/**
					 * Internal aggregation that stores invisible texts for accessibility.
					 *
					 * @since 1.142
					 */
					invisibleTexts: {
						type: "sap.ui.core.InvisibleText",
						multiple: true,
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
				controller: this.getEngineControllers()
			});

			this._fResolveInitialFiltersApplied = undefined;
			this._oInitialFiltersAppliedPromise = new Promise((resolve) => {
				this._fResolveInitialFiltersApplied = resolve;
			});

			this._bIgnoreChanges = false;
			this._aOngoingChangeAppliance = [];
			this._bSearchTriggered = false;
			this._bIgnoreQueuing = false; // used to overrule the default behaviour of suspendSelection
			this._mEnhancedFilterFields = new WeakMap();
		};

		/**
		 * Returns the map of engine controller instances for registration.
		 *
		 * @returns {Object<string, sap.ui.mdc.p13n.subcontroller.Controller>} Map of controller key to controller instance
		 */
		FilterBarBase.prototype.getEngineControllers = function() {
			return {
				Filter: new FilterController({control: this})
			};
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

				const oInvisibleText = new InvisibleText({
					id: this.getId() + "-btnSearch-description",
					text: this._oRb.getText("filterbar.GO_DESCRIPTION")
				});
				this.addInvisibleText(oInvisibleText);
				this._btnSearch.addAriaDescribedBy(oInvisibleText);
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
			// mSettings.filterItems can also be a binding, therefore check if it's an array
			if (mSettings?.propertyInfo && mSettings?.filterItems && Array.isArray(mSettings.filterItems)) {
				this._validatePropertyInfos(mSettings.propertyInfo, mSettings.filterItems);
			}
			this._applySettings(mSettings, oScope);
			Promise.all([this.awaitPropertyHelper()]).then(async () => {
				if (!this._bIsBeingDestroyed) {
					if (this.isInPropertyKeysMode?.()) {
						await this.initializeItemsFromPropertyKeys();
					}
					await this._applyInitialFilterConditions();
					this.getFilterItems().forEach((oFilterField) => {
						this._enhanceFilterField(oFilterField);
					});

					const oBasicSearchField = this.getBasicSearchField();
					if (oBasicSearchField) {
						this._enhanceBasicSearchField(oBasicSearchField);
					}
				}
			});
		};

		FilterBarBase.prototype._validatePropertyInfos = function(aPropertyInfos, aFilterItems) {
			this._bHasMetadataPropertiesOnFilterFields = false; // If any FilterField sets metadata properties, this should be done on every FilterField
			aFilterItems.forEach((oFilterItem) => {
				const sPropertyKey = oFilterItem.getPropertyKey();
				const fnIsPropertyInfo = (oPropertyInfo) => {
					/**
					 * @deprecated As of version 1.121
					 */
					if ("name" in oPropertyInfo) {
						return oPropertyInfo.name === sPropertyKey;
					}
					return oPropertyInfo.key === sPropertyKey;
				};
				if (sPropertyKey) {
					const oPropertyInfo = aPropertyInfos.find(fnIsPropertyInfo);
					PropertyInfoValidator.comparePropertyInfoWithControl(oFilterItem, oPropertyInfo);
				}
				this._bHasMetadataPropertiesOnFilterFields ||= PropertyInfoValidator.hasPropertiesOnControl(oFilterItem);
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

			if (this.isInPropertyKeysMode?.()) {
				oState.items = this.getPropertyKeys().map((sKey) => ({
					key: sKey,
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: sKey
				}));
			} else {
				oState.items = this.getFilterItems().map((oFilterField) => {
					const sPropertyKey = oFilterField.getPropertyKey();
					return {
						key: sPropertyKey,
						/**
						 * @deprecated As of version 1.124.0
						 */
						name: sPropertyKey
					};
				});
			}

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

				const aConditions = oModel.getConditions(SEARCH_CONDITION);
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
						if (!(((sFieldPath === SEARCH_CONDITION) && this.getAggregation("basicSearchField")) || this._getFilterField(sFieldPath))) {
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
		 * @param {object} mReportSettings.recheckMissingRequired Indicates if a check for required fields needs to be triggered
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

					const sFieldPath = sPath.substring("/conditions/".length);

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
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);

			if (oOperator?.useDefaultValues) {
				oConditionExternal.values = [];
			} else {
				oConditionExternal = ConditionConverter.toString(oConditionExternal, oProperty.typeConfig.typeInstance, this.getTypeMap());
			}

			this._cleanupCondition(oConditionExternal);

			this._convertInOutParameters(oCondition, oConditionExternal, "inParameters", ConditionConverter.toString);
			this._convertInOutParameters(oCondition, oConditionExternal, "outParameters", ConditionConverter.toString);

			return oConditionExternal;
		};

		FilterBarBase.prototype._toInternal = function(oProperty, oCondition) {
			let oConditionInternal = merge({}, oCondition);
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			const oTypeMap = this.getTypeMap();

			if (oOperator?.useDefaultValues) {
				const aDefaultConditions = this.getDefaultValues(oProperty.key);
				oConditionInternal.values.push([]);
				aDefaultConditions.forEach((oDefaultCondition) => {
					oDefaultCondition = ConditionConverter.toType(oDefaultCondition, oProperty.typeConfig.typeInstance, oTypeMap);
					oConditionInternal.values[0].push(oDefaultCondition);
				});
			} else {
				oConditionInternal = ConditionConverter.toType(oConditionInternal, oProperty.typeConfig.typeInstance, oTypeMap);
			}

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

					const sText = this.getAdaptFiltersButtonText(aFilterNames.length);

					this.setProperty("_filterCount", sText, false);
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

		/**
		 * Updates the Adapt Filters button text based on the number of assigned filters.
		 * @param {int} iFilterCount number of assigned filters
		 * @returns {string} text for the Adapt Filters button
		 * @protected
		 */
		FilterBarBase.prototype.getAdaptFiltersButtonText = function(iFilterCount) {
			return this._oRb.getText(iFilterCount ? "filterbar.ADAPT_NONZERO" : "filterbar.ADAPT", [iFilterCount]);
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

		FilterBarBase.prototype._getRequiredFilterFieldValueText = function(oProperty) {
			if (!oProperty) {
				return "";
			}
			const label = oProperty.label ?? oProperty.getLabel?.();
			if (label) {
				return this._oRb.getText("filterbar.REQUIRED_FILTER_VALUE_MISSING", [label]);
			} else {
				return "";
			}
		};

		FilterBarBase.prototype._recheckMissingRequiredFields = function() {
			this.getPropertyInfoSet().forEach((oProperty) => {
				let aReqFiltersWithoutValue;
				if (oProperty) {
					const sPropertyKey = IdentifierUtil.getPropertyKey(oProperty);
					const aMessages = this.getMessages(sPropertyKey);
					if (aMessages.some((msg) => msg.type !== MessageType.None && msg.message === this._getRequiredFilterFieldValueText(oProperty))) {
						if (!aReqFiltersWithoutValue) {
							aReqFiltersWithoutValue = FilterUtil.getRequiredFieldNamesWithoutValues(this);
						}

						if (aReqFiltersWithoutValue.indexOf(sPropertyKey) < 0) {
							this.removeMessages(sPropertyKey);
						}
					}
				}
			});
		};

		FilterBarBase.prototype._checkRequiredFields = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			const aReqFiltersWithoutValue = FilterUtil.getRequiredFieldNamesWithoutValues(this);
			aReqFiltersWithoutValue.forEach((sName) => {
				const oProperty = FilterUtil.getPropertyByKey(this.getPropertyInfoSet(), sName);
				if (oProperty) {
					if (this.getMessages(IdentifierUtil.getPropertyKey(oProperty)).length === 0) {
						this.addMessage(IdentifierUtil.getPropertyKey(oProperty), this._getRequiredFilterFieldValueText(oProperty), MessageType.Error);
					}
				} else {
					Log.error("Mandatory filter field '" + sName + "' not visible on FilterBarBase has no value.");
				}

				vRetErrorState = FilterBarValidationStatus.RequiredHasNoValue;
			});

			return vRetErrorState;
		};

		/**
		 * Adds a message to the {@link sap.ui.model.message.MessageModel MessageModel} for a <code>propertyKey</code>.
		 * The message is displayed on the corresponding {@link sap.ui.mdc.FilterField FilterField}.
		 *
		 * @param {string} sPropertyKey The <code>propertyKey</code> of the {@link sap.ui.mdc.FilterField FilterField}
		 * @param {string} sMessage The message text
		 * @param {sap.ui.core.MessageType} sMessageType The message type
		 * @returns {sap.ui.core.message.Message} The created message object
		 * @since 1.147
		 * @public
		 */
		FilterBarBase.prototype.addMessage = function(sPropertyKey, sMessage, sMessageType) {
			const sConditionPath = `/conditions/${sPropertyKey}`;
			const oConditionsModel = this._getConditionModel();

			const oMessage = new Message({
				message: sMessage,
				type: sMessageType,
				target: sConditionPath,
				fullTarget: sConditionPath,
				processor: oConditionsModel
			});

			Messaging.addMessages(oMessage);
			return oMessage;
		};

		/**
		 * Removes a given message from the {@link sap.ui.model.message.MessageModel MessageModel}.
		 * The message is removed from the corresponding {@link sap.ui.mdc.FilterField FilterField}.
		 *
		 * @param {sap.ui.core.Message} oMessage The message to remove
		 * @since 1.147
		 * @public
		 */
		FilterBarBase.prototype.removeMessage = function(oMessage) {
			Messaging.removeMessages(oMessage);
		};

		/**
		 * Removes all messages for the given <code>propertyKey</code> from the {@link sap.ui.model.message.MessageModel MessageModel}.
		 * Clears the messages from the corresponding {@link sap.ui.mdc.FilterField FilterField}.
		 *
		 * @param {string} sPropertyKey The <code>propertyKey</code> of the {@link sap.ui.mdc.FilterField FilterField}
		 * @since 1.147
		 * @public
		 */
		FilterBarBase.prototype.removeMessages = function(sPropertyKey) {
			const aMessagesForProperty = this.getMessages(sPropertyKey);
			Messaging.removeMessages(aMessagesForProperty);
		};

		/**
		 * Returns all messages associated with the given <code>propertyKey</code> from the {@link sap.ui.model.message.MessageModel MessageModel}.
		 *
		 * @param {string} sPropertyKey The <code>propertyKey</code> of the {@link sap.ui.mdc.FilterField FilterField}
		 * @returns {sap.ui.core.message.Message[]} Array of messages for the given <code>propertyKey</code>
		 * @since 1.147
		 * @public
		 */
		FilterBarBase.prototype.getMessages = function(sPropertyKey) {
			const oMessageModel = Messaging.getMessageModel();
			const sFilterFieldId = this._getFilterField(sPropertyKey)?.getId();
			return oMessageModel.getProperty("/").filter((oMessage) => {
				const bIsFilterBarMessage = oMessage.processor === this._getConditionModel();
				const bIsTargetingProperty = oMessage.aTargets.some((sTarget) => sTarget === `/conditions/${sPropertyKey}`);
				// Messages set by the field due to e.g. parse errors don't use the FilterBar's condition model as processor.
				const bIsTargetingOwnFilterField = oMessage.aTargets.some((sTarget) => sTarget === `${sFilterFieldId}/conditions`);
				return (bIsFilterBarMessage && bIsTargetingProperty) || bIsTargetingOwnFilterField;
			});
		};

		FilterBarBase.prototype._checkFieldsInErrorState = function() {
			let vRetErrorState = FilterBarValidationStatus.NoError;

			if (this._bFieldInErrorState) {
				return FilterBarValidationStatus.FieldInErrorState;
			}

			this.getFilterItems().some((oFilterField) => {
				if (oFilterField && oFilterField.isInvalidInput && oFilterField.isInvalidInput()) {
					vRetErrorState = FilterBarValidationStatus.FieldInErrorState;
				}

				const sPropertyKey = oFilterField.getPropertyKey();
				const aErrorMessages = this.getMessages(sPropertyKey).filter((msg) => msg.type === MessageType.Error);
				const oProperty = FilterUtil.getPropertyByKey(this.getPropertyInfoSet(), sPropertyKey);
				if (aErrorMessages.length > 0 && aErrorMessages.some((msg) => msg.message !== this._getRequiredFilterFieldValueText(oProperty))) {
					vRetErrorState = FilterBarValidationStatus.FieldInErrorState;
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

			if (oFilterField.getRequired() && (this.getMessages(oFilterField.getPropertyKey()).length > 0) && oEvent.getParameter("valid")) {
				this.removeMessages(oFilterField.getPropertyKey());
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

			const oFieldChange = { name: sFilterName, promise: oEvent.getParameter("promise") };
			this._aFIChanges.push(oFieldChange);

			const oPromise = oEvent.getParameter("promise");
			const bValid = oEvent.getParameter("valid");
			if (oPromise) {
				oPromise.then((aConditions) => {
					// Remove this change from the pending changes array
					const nIndex = this._aFIChanges ? this._aFIChanges.indexOf(oFieldChange) : -1;
					if (nIndex >= 0) {
						this._aFIChanges.splice(nIndex, 1);
					}

					// Clear error state if the field is now valid
					// Check if field has valid input based on conditions: empty array means cleared field
					const aErrorMessages = this.getMessages(oFilterField.getPropertyKey()).filter((msg) => msg.type === MessageType.Error);
					if (aErrorMessages.length > 0) {
						if (bValid || (aConditions && aConditions.length === 0)) {
							aErrorMessages.forEach((msg) => this.removeMessage(msg));
						}
					}

					// After successful change, re-validate to update lock state
					this._updateLockStateFromValidation();
				}).catch(() => {
					// Remove this change from the pending changes array
					const nIndex = this._aFIChanges ? this._aFIChanges.indexOf(oFieldChange) : -1;
					if (nIndex >= 0) {
						this._aFIChanges.splice(nIndex, 1);
					}
					// After failed change (error state), re-validate to update lock state
					this._updateLockStateFromValidation();
				});
			} else {
				// Synchronous change, immediately update lock state
				this._updateLockStateFromValidation();
			}
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
			const oFilterField = this.getFilterItems().find((oFilterItem) => {
				const aMessages = this.getMessages(oFilterItem.getPropertyKey());
				if (aMessages.some(({type}) => type !== MessageType.None)) {
					return oFilterItem;
				}
				return null;
			});

			oFilterField?.focus();
			return oFilterField;
		};

		/**
		 * Sets the focus on the first filter in error state.
		 * @public
		 * @returns {sap.ui.mdc.FilterField | null} The first filter field in error state
		 */
		FilterBarBase.prototype.setFocusOnFirstErroneousField = function() {
			return this._setFocusOnFirstErroneousField();
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
							if (oFF && oFF.getRequired() && (this.getMessages(oFF.getPropertyKey()).length > 0)) {
								this.removeMessages(oFF.getPropertyKey()); //valid existing value -> clear missing required error
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
			if (this.isInPropertyKeysMode?.() && aAffectedControllers?.indexOf("PropertyInfo") >= 0) {
				this.getFilterItems().forEach((oFilterField) => {
					this._updateFilterField(oFilterField);
				});
			}

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
			const oLayoutItem = new LayoutItem(this.getId() + "-item-" + oFilterItem.getId());
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
				let oFilterField = oChanges.child;
				if (oChanges.name === "filterItems") {
					switch (oChanges.mutation) {
						case "insert":
							oFilterField = this._enhanceFilterField(oFilterField);
							oFilterField.attachChange(this._handleFilterItemChanges, this);
							oFilterField.attachSubmit(this._handleFilterItemSubmit, this);

							this._filterItemInserted(oFilterField);
							break;
						case "remove":
							oFilterField.detachChange(this._handleFilterItemChanges, this);
							oFilterField.detachSubmit(this._handleFilterItemSubmit, this);

							this._filterItemRemoved(oFilterField);
							this._mEnhancedFilterFields.delete(oFilterField);
							break;
						default:
							Log.error("operation " + oChanges.mutation + " not yet implemented");
					}
				} else if (oChanges.name === "basicSearchField") {
					switch (oChanges.mutation) {
						case "insert":
							oFilterField.attachSubmit(this._handleFilterItemSubmit, this);

							this._insertFilterFieldtoContent(oFilterField, 0);
							break;
						case "remove":
							oFilterField.detachSubmit(this._handleFilterItemSubmit, this);

							this._removeFilterFieldFromContent(oFilterField);
							this._mEnhancedFilterFields.delete(oFilterField);
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
			if (oFilterField && !this._mEnhancedFilterFields.get(oFilterField)) {
				const sPropertyKey = oFilterField.getPropertyKey();

				if (!sPropertyKey) {
					Log.error("filter field with the id = '" + oFilterField.getId() + "' should have an assigned 'propertyKey'");
					return oFilterField;
				}

				if (!oFilterField.getBindingInfo("conditions")) {
					oFilterField.bindProperty("conditions",{
						path: `/conditions/${sPropertyKey}`,
						model: "$filters"
					});
				}

				const oFilterFieldPropertyInfo = this._getPropertyByName(sPropertyKey, true);

				if (this._bHasMetadataPropertiesOnFilterFields && !PropertyInfoValidator.hasPropertiesOnControl(oFilterField)) {
					// If any FilterField has explicitly set properties, this should be the case on all FilterFields
					Log.warning("Filter field with the id = '" + oFilterField.getId() + "' has no metadata properties although another FilterField has.");
				}

				if (!oFilterFieldPropertyInfo) {
					if (!this.isA("sap.ui.mdc.valuehelp.FilterBar") && this._bHasMetadataPropertiesOnFilterFields && sPropertyKey !== "$search") { // vh.FB does not support 'propertyInfo'...
						Log.warning("Property '" + sPropertyKey + "' does not exist for filter field with the id = '" + oFilterField.getId() + "' on filter bar='" + this.getId() + "'");
					}
					PropertyInfoValidator.checkMandatoryProperties(oFilterField);

					return oFilterField;
				}

				PropertyInfoValidator.compareControlWithPropertyInfo(oFilterField, oFilterFieldPropertyInfo);
				// no display, no valueHelp, no additionalDataType, no tooltip, no operators, no defaultOperator, no caseSensitive

				this._mEnhancedFilterFields.set(oFilterField, true);

				oFilterField.triggerCheckCreateInternalContent();
			}

			return oFilterField;
		};

		FilterBarBase.prototype._updateFilterField = function(oFilterField) {
			const sPropertyKey = oFilterField.getPropertyKey();

			const oFilterFieldPropertyInfo = this._getPropertyByName(sPropertyKey, true);

			if (!oFilterFieldPropertyInfo.isActive) {
				return oFilterField; // only for dynamic properties
			}

			if (!oFilterFieldPropertyInfo) {
				if (!this.isA("sap.ui.mdc.valuehelp.FilterBar") && this._bHasMetadataPropertiesOnFilterFields && sPropertyKey !== "$search") { // vh.FB does not support 'propertyInfo'...
					Log.warning("Property '" + sPropertyKey + "' does not exist for filter field with the id = '" + oFilterField.getId() + "' on filter bar='" + this.getId() + "'");
				}

				return oFilterField;
			}

			PropertyInfoValidator.updateControlFromPropertyInfo(oFilterField, oFilterFieldPropertyInfo);
			// no display, no valueHelp, no additionalDataType, no tooltip, no operators, no defaultOperator, no caseSensitive

			return oFilterField;
		};

		FilterBarBase.prototype.setBasicSearchField = function(oBasicSearchField) {

			const oOldBasicSearchField = this.getAggregation("basicSearchField");
			if (oOldBasicSearchField) {
				this.removeAggregation("basicSearchField", oOldBasicSearchField);
			}

			this.setAggregation("basicSearchField", oBasicSearchField);

			if (oBasicSearchField) {
				this._enhanceBasicSearchField(oBasicSearchField);
				if (!this._oObserver.isObserved(oBasicSearchField, { properties: ["visible"] })) {
					this._oObserver.observe(oBasicSearchField, { properties: ["visible"] });
				}
			}

			return this;
		};

		FilterBarBase.prototype._enhanceBasicSearchField = function(oBasicSearchField) {
			const sPropertyKey = oBasicSearchField.getPropertyKey();
			if (sPropertyKey !== SEARCH_CONDITION) {
				if (sPropertyKey || sPropertyKey === "") {
					Log.warning(`sap.ui.mdc.FilterBar: BasicSearchField has incorrect 'propertyKey' '${sPropertyKey}'. Overriding to default '${SEARCH_CONDITION}'`);
				}
				oBasicSearchField.setPropertyKey(SEARCH_CONDITION);
			}

			this._enhanceFilterField(oBasicSearchField);
		};

		FilterBarBase.prototype._getNonHiddenPropertyInfoSet = function() {
			const aVisibleProperties = [];
			this.getPropertyInfoSet().every((oProperty) => {
				if (!oProperty.hiddenFilter) {

					if (IdentifierUtil.getPropertyKey(oProperty) !== SEARCH_CONDITION) {
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
		FilterBarBase.prototype.cleanUpAllFilterFieldsInErrorState = async function() {

			this._getConditionModel().checkUpdate(true);

			const aFilterFields = this.getFilterItems();
			const oDelegate = await this.awaitControlDelegate();
			aFilterFields.forEach((oFilterField) => {
				oDelegate.cleanUpFilterFieldState(this, oFilterField);
			});
		};

		FilterBarBase.prototype._applyInitialFilterConditions = function() {

			this._bIgnoreChanges = true;

			return this._applyFilterConditionsChanges().then(() => {
				this._bIgnoreChanges = false;
				this._reportModelChange({
					triggerFilterUpdate: true,
					triggerSearch: false
				});
				this._bInitialFiltersApplied = true;
				this._fResolveInitialFiltersApplied?.();
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

				// Clear internally tracked changes of FilterFields for async validation
				this._aFIChanges = null;

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
			if (mConditions && mConditions[SEARCH_CONDITION]) {
				delete mConditions[SEARCH_CONDITION];
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
			const aSearchConditions = this._getConditionModel() ? this._getConditionModel().getConditions(SEARCH_CONDITION) : [];
			return aSearchConditions[0] ? aSearchConditions[0].values[0] : "";
		};

		/**
		 * Adds an <code>InvisibleText</code> to the <code>FilterBar</code> that can be used for accessibility purposes.
		 *
		 * @param {sap.ui.core.InvisibleText} oInvisibleText The invisible text to be added
		 * @protected
		 * @since 1.142
		 */
		FilterBarBase.prototype.addInvisibleText = function(oInvisibleText) {
			this.addAggregation("invisibleTexts", oInvisibleText);
		};

		/**
		 * Retrieves an <code>InvisibleText</code> by ID.
		 *
		 * @param {string} sId ID of the invisible text to be retrieved
		 * @returns {sap.ui.core.InvisibleText} The invisible text with the given ID
		 * @protected
		 * @since 1.142
		 */
		FilterBarBase.prototype.getInvisibleText = function(sId) {
			return this.getAggregation("invisibleTexts")?.find((oInvisibleText) => oInvisibleText.getId() === sId);
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

			this._mEnhancedFilterFields = null;
		};

		/**
		 * Adds a {@link sap.ui.mdc.FilterField FilterField} to the {@link #getFilterItems filterItems} aggregation.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#addFilterItem
		 * @function
		 * @param {sap.ui.mdc.FilterField} oFilterItem The filter item to be added
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Destroys all {@link sap.ui.mdc.FilterField FilterFields} in the {@link #getFilterItems filterItems} aggregation.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#destroyFilterItems
		 * @function
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Inserts a {@link sap.ui.mdc.FilterField FilterField} into the {@link #getFilterItems filterItems} aggregation.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#insertFilterItem
		 * @function
		 * @param {sap.ui.mdc.FilterField} oFilterItem The filter item to be inserted
		 * @param {int} iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
		 * value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
		 * greater than the current size of the aggregation, <code>oObject</code> is inserted at
		 * the last position
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Removes a {@link sap.ui.mdc.FilterField FilterField} from the {@link #getFilterItems filterItems} aggregation.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#removeFilterItem
		 * @function
		 * @param {int|string|sap.ui.mdc.FilterField} oFilterItem The filter item to be removed or its index or id
		 * @returns {sap.ui.mdc.FilterField} The removed filter item or <code>null</code>
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Removes all {@link sap.ui.mdc.FilterField FilterFields} from the {@link #getFilterItems filterItems} aggregation.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#removeAllFilterItems
		 * @function
		 * @returns {sap.ui.mdc.FilterField[]} An array of the removed filter items or an empty array
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Sets a new value for the {@link #getFilterConditions filterConditions} property.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#setFilterConditions
		 * @function
		 * @param {object} oFilterConditions FilterConditions set on the filter bar
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Gets the current value of the {@link #getFilterConditions filterConditions} property.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#getFilterConditions
		 * @function
		 * @returns {object} The filter conditions set on the filter bar
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Sets a new value for the {@link #getPropertyInfo propertyInfo} property.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#setPropertyInfo
		 * @function
		 * @param {sap.ui.mdc.filterbar.PropertyInfo[]} aPropertyInfo The property info objects containing the metadata for filter fields
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Gets the current value of the {@link #getPropertyInfo propertyInfo} property.
		 *
		 * @name sap.ui.mdc.filterbar.FilterBarBase#getPropertyInfo
		 * @function
		 * @returns {sap.ui.mdc.filterbar.PropertyInfo[]} The property info objects containing the metadata for a filter field
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * Triggers lock by firing filtersChanged event to inform connected components.
		 * @private
		 */
		FilterBarBase.prototype._triggerLock = function() {
			const mTexts = this._getAssignedFiltersText();
			this.fireFiltersChanged({
				conditionsBased: true,
				filtersText: mTexts.filtersText,
				filtersTextExpanded: mTexts.filtersTextExpanded
			});
		};

		/**
		 * Updates lock state based on current validation state of all fields.
		 * Checks all fields for errors and locks/unlocks the table accordingly.
		 * @private
		 */
		FilterBarBase.prototype._updateLockStateFromValidation = function() {
			// Check current validation state
			const vValidationStatus = this._checkFieldsInErrorState();
			const bHasErrors = vValidationStatus === FilterBarValidationStatus.FieldInErrorState;

			if (bHasErrors) {
				this._triggerLock();
			}

			// Update lock state

			if (!bHasErrors && this.getLiveMode()) {
				this.triggerSearch();
			}
		};

		/**
		 * Returns default values for a property.
		 *
		 * This function is called when a user adds a condition representing default values or a variant using such a condition is applied.
		 *
		 * As this function might be called multiple times, the default values should be cached and not be determined again for each call.
		 *
		 * @param {string} sPropertyKey Property key of the filter field
		 * @returns {sap.ui.mdc.condition.ConditionObject[]} Array of default value conditions in external format
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.149
		 */
		FilterBarBase.prototype.getDefaultValues = function(sPropertyKey) {

			const oDelegate = this.getControlDelegate();
			return oDelegate.getDefaultValues(this, sPropertyKey);

		};

		return FilterBarBase;

	});