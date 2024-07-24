/*!
 * ${copyright}
 */
sap.ui.define(
	[
		"sap/m/library",
		"sap/ui/mdc/filterbar/FilterBarBase",
		"sap/ui/mdc/filterbar/FilterBarBaseRenderer",
		"sap/ui/mdc/filterbar/aligned/FilterItemLayout",
		"sap/ui/mdc/valuehelp/FilterContainer",
		"sap/m/Button",
		"sap/m/p13n/enums/PersistenceMode",
		"sap/m/OverflowToolbarLayoutData"
	],
	(
		mLibrary,
		FilterBarBase,
		FilterBarBaseRenderer,
		FilterItemLayout,
		FilterContainer,
		Button,
		PersistenceMode,
		OverflowToolbarLayoutData
	) => {
		"use strict";
		const {OverflowToolbarPriority} = mLibrary;

		/**
		 * Constructor for a new <code>FilterBar</code> for a value help dialog.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class The <code>FilterBar</code> control is used to display filter properties in a user-friendly manner to populate values for a query.
		 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
		 * The Go button triggers the search event, and the Show Filters button shows the additional filter field.<br>
		 * The <code>FilterBar</code> control creates and handles the filters based on the provided metadata information.
		 * The metadata information is provided via the {@link module:sap/ui/mdc/FilterBarDelegate FilterBarDelegate} implementation. This implementation has to be provided by the application.<br>
		 * <b>Note:</b> The <code>FilterBar</code> can only be used for a {@link sap.ui.mdc.valuehelp.Dialog Dialog} and not on its own.
		 * @extends sap.ui.mdc.filterbar.FilterBarBase
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @public
		 * @since 1.124.0
		 * @alias sap.ui.mdc.valuehelp.FilterBar
		 */
		const FilterBar = FilterBarBase.extend(
			"sap.ui.mdc.valuehelp.FilterBar", {
				metadata: {
					library: "sap.ui.mdc",
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
								name: "sap/ui/mdc/valuehelp/FilterBarDelegate",
								payload: {
									modelName: undefined,
									collectionName: ""
								}
							}
						},
						/**
						 * Determines whether the Show/Hide Filters button is in the state show or hide.<br>
						 */
						expandFilterFields: {
							type: "boolean",
							defaultValue: true
						},
						/**
						 * Number of FilterItems which will be shown via Show Filters.<br>
						 */
						filterFieldThreshold: {
							type: "int",
							defaultValue: 8
						}
					},
					aggregations: {}
				},

				renderer: FilterBarBaseRenderer
			}
		);

		const { ButtonType } = mLibrary;

		FilterBar.prototype._createInnerLayout = function() {
			this._cLayoutItem = FilterItemLayout;

			this._oFilterBarLayout = new FilterContainer(this.getId() + "-innerLayout", {});
			this.setAggregation("layout", this._oFilterBarLayout, true);


			this._oBtnFilters = new Button(this.getId() + "-btnShowFilters", {
				type: ButtonType.Transparent,
				press: this._onToggleFilters.bind(this)
			});
			this._oBtnFilters.bindProperty("text", {
				model: FilterBarBase.INNER_MODEL_NAME,
				path: "/expandFilterFields",
				formatter: function(bExpandFilterFields) {
					return this._oRb.getText("valuehelp." + (bExpandFilterFields ? "HIDE" : "SHOW") + "ADVSEARCH");
				}.bind(this)
			});
			this._oBtnFilters.bindProperty("visible", {
				model: FilterBarBase.INNER_MODEL_NAME,
				path: "/filterItems",
				formatter: function(aItems) {
					return aItems.length > 0;
				}
			});

			this._oFilterBarLayout.addControl(
				this._getSearchButton().bindProperty("visible", {
					parts: [{
						path: '/showGoButton',
						model: FilterBarBase.INNER_MODEL_NAME
					}, {
						path: "/liveMode",
						model: FilterBarBase.INNER_MODEL_NAME
					}],
					formatter: function(bShowGoButton, bLiveMode) {
						return bShowGoButton && ((this._isPhone()) ? true : !bLiveMode);
					}.bind(this)
				})
			);

			this._oFilterBarLayout.addControl(this._oBtnFilters);

			this._oShowAllFiltersBtn = new Button(this.getId() + "-btnShowAllFilters", {
				type: ButtonType.Transparent,
				press: this._onShowAllFilters.bind(this),
				text: this._oRb.getText("valuehelp.SHOWALLFILTERS"),
				visible: false
			});

			this._oFilterBarLayout.addEndContent(this._oShowAllFiltersBtn);
		};


		FilterBar.prototype.init = function() {
			FilterBarBase.prototype.init.apply(this, arguments);
			this.getEngine().defaultProviderRegistry.attach(this, PersistenceMode.Transient);
		};

		FilterBar.prototype.exit = function() {
			this.getEngine().defaultProviderRegistry.detach(this);
			if (this._oCollectiveSearch) { // do not destroy CollectiveSearch as it is owned by value help and might be reused there
				this._oFilterBarLayout.removeControl(this._oCollectiveSearch);
				this._oCollectiveSearch = null;
			}
			FilterBarBase.prototype.exit.apply(this, arguments);
			this._oBasicSearchField = null;
			this._oBtnFilters = null;
			this._oShowAllFiltersBtn = null;
		};

		FilterBar.prototype._onToggleFilters = function(oEvent) {
			this.setExpandFilterFields(!this.getExpandFilterFields());
		};

		FilterBar.prototype._onShowAllFilters = function(oEvent) {
			this._oFilterBarLayout._updateFilterBarLayout(true);
		};

		/**
		 * Sets the {@link sap.ui.mdc.valuehelp.CollectiveSearchSelect CollectiveSearchSelect} control.
		 *
		 * <b>Note:</b> This must only be done by the corresponding value help, not from outside.
		 *
		 * @param {sap.ui.mdc.valuehelp.CollectiveSearchSelect} oCollectiveSearch Instance of the {@link sap.ui.mdc.valuehelp.CollectiveSearchSelect CollectiveSearchSelect} control
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc.valuehelp.content.FilterableListContent
		 */
		FilterBar.prototype.setCollectiveSearch = function(oCollectiveSearch) {
			if (this._oCollectiveSearch) {
				const oLD = this._oCollectiveSearch.getLayoutData();
				if (oLD && oLD._bSetByFilterBar) {
					// remove internal LayoutData
					this._oCollectiveSearch.setMaxWidth(oLD.getMaxWidth());
					this._oCollectiveSearch.destroyLayoutData();
				}
				if (this._oFilterBarLayout) {
					this._oFilterBarLayout.removeControl(this._oCollectiveSearch);
				}
			}
			this._oCollectiveSearch = oCollectiveSearch;
			if (this._oCollectiveSearch) {
				if (!this._oCollectiveSearch.getLayoutData()) {
					// set LayouData to have better overflow behaviour in toolbar
					const oLD = new OverflowToolbarLayoutData(this._oCollectiveSearch.getId() + "--LD", {priority: OverflowToolbarPriority.NeverOverflow, shrinkable: true, minWidth: "5rem", maxWidth: this._oCollectiveSearch.getMaxWidth()});
					oLD._bSetByFilterBar = true;
					this._oCollectiveSearch.setLayoutData(oLD);
					this._oCollectiveSearch.setMaxWidth(); // move to layoutData
				}

				if (this._oFilterBarLayout) {
					this._oFilterBarLayout.insertControl(this._oCollectiveSearch, 0);
				}
			}

			return this;
		};

		/**
		 * Gets the {@link sap.ui.mdc.valuehelp.CollectiveSearchSelect CollectiveSearchSelect} control
		 *
		 * <b>Note:</b> This must only be used by the corresponding value help, not from outside.
		 *
		 * @returns {sap.ui.mdc.valuehelp.CollectiveSearchSelect} Instance of the {@link sap.ui.mdc.valuehelp.CollectiveSearchSelect CollectiveSearchSelect} control
		 * @private
		 * @ui5-restricted sap.ui.mdc.valuehelp.content.FilterableListContent
		 */
		FilterBar.prototype.getCollectiveSearch = function() {
			return this._oCollectiveSearch;
		};

		/**
		 * Destroys the {@link sap.ui.mdc.valuehelp.CollectiveSearchSelect CollectiveSearchSelect} control.
		 *
		 * <b>Note:</b> This must only be used by the corresponding value help, not from outside.
		 *
		 * @returns {this} Reference to <code>this</code> to allow method chaining
		 * @private
		 * @ui5-restricted sap.ui.mdc.valuehelp.content.FilterableListContent
		 */
		FilterBar.prototype.destroyCollectiveSearch = function() {
			if (this._oCollectiveSearch && this._oFilterBarLayout) {
				this._oFilterBarLayout.removeControl(this._oCollectiveSearch);
				this._oCollectiveSearch.destroy();
				this._oCollectiveSearch = undefined;
			}

			return this;
		};

		FilterBar.prototype.setBasicSearchField = function(oBasicSearchField) {
			if (this._oBasicSearchField) {
				const oLD = this._oBasicSearchField.getLayoutData();
				if (oLD && oLD._bSetByFilterBar) {
					// remove internal LayoutData
					this._oBasicSearchField.destroyLayoutData();
				}
				if (this._oFilterBarLayout) {
					this._oFilterBarLayout.removeControl(this._oBasicSearchField);
				}
				this._oBasicSearchField.detachSubmit(this._handleFilterItemSubmit, this);
			}
			this._oBasicSearchField = oBasicSearchField;

			if (oBasicSearchField) {
				if (!this._oBasicSearchField.getLayoutData()) {
					// set LayouData to have better overflow behaviour in toolbar
					const oLD = new OverflowToolbarLayoutData(this._oBasicSearchField.getId() + "--LD", {shrinkable: true, minWidth: "6rem", maxWidth: this._oBasicSearchField.getWidth()});
					oLD._bSetByFilterBar = true;
					this._oBasicSearchField.setLayoutData(oLD);
				}

				if (this.isPropertyInitial("expandFilterFields")) {
					this.setExpandFilterFields(false);
				}

				if (this._oFilterBarLayout) {
					this._oFilterBarLayout.insertControl(oBasicSearchField, this._oCollectiveSearch ? 1 : 0);
				}

				oBasicSearchField.attachSubmit(this._handleFilterItemSubmit, this);
				if (!this._oObserver.isObserved(oBasicSearchField, { properties: ["visible"] })) {
					this._oObserver.observe(oBasicSearchField, { properties: ["visible"] });
				}
			}

			return this;
		};

		FilterBar.prototype.getBasicSearchField = function() {
			return this._oBasicSearchField;
		};

		FilterBar.prototype.destroyBasicSearchField = function() {
			if (this._oBasicSearchField && this._oFilterBarLayout) {
				this._oFilterBarLayout.removeControl(this._oBasicSearchField);
				this._oBasicSearchField.detachSubmit(this._handleFilterItemSubmit, this);
				if (this._oObserver.isObserved(this._oBasicSearchField, { properties: ["visible"] })) {
					this._oObserver.unobserve(this._oBasicSearchField);
				}
				this._oBasicSearchField.destroy();
				this._oBasicSearchField = undefined;
			}

			return this;
		};

		/**
		 * Getter for the initial focusable <code>control</code> on the <code>FilterBar</code>.
		 *
		 * @returns {sap.ui.core.Control} Control instance which could get the focus.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		FilterBar.prototype.getInitialFocusedControl = function() {
			let oCtrl = this.getBasicSearchField();
			if (!oCtrl && this.getShowGoButton()) {
				oCtrl = this._btnSearch;
			}
			return oCtrl;
		};

		return FilterBar;
	}
);