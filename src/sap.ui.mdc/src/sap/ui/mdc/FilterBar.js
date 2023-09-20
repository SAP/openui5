/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/p13n/subcontroller/FilterController', 'sap/ui/mdc/p13n/subcontroller/AdaptFiltersController', "sap/ui/mdc/filterbar/aligned/FilterContainer", "sap/ui/mdc/filterbar/aligned/FilterItemLayout", "sap/ui/mdc/filterbar/FilterBarBase", "sap/ui/mdc/filterbar/FilterBarBaseRenderer", 'sap/m/library', 'sap/m/Button', "sap/base/util/merge", 'sap/base/Log', "sap/ui/core/library", "sap/ui/mdc/enums/FilterBarP13nMode"
], function(FilterController, AdaptFiltersController, FilterContainer, FilterItemLayout, FilterBarBase, FilterBarBaseRenderer, mLibrary, Button, merge, Log, CoreLibrary, FilterBarP13nMode) {
	"use strict";

	const HasPopup = CoreLibrary.aria.HasPopup;

	/**
	 * Constructor for a new FilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FilterBar</code> control is used to display filter attrtibutes in a user-friendly manner to populate values for a query.
	 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
	 * The Go button triggers the search event, and the Adapt Filters button shows the filter dialog.<br>
	 * The <code>FilterBar</code> control creates and handles the filters based on the provided metadata information.
	 * The metadata information is provided via the {@link sap.ui.mdc.FilterBarDelegate FilterBarDelegate} implementation. This implementation has to be provided by the application.
	 * @extends sap.ui.mdc.filterbar.FilterBarBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBar
   	 * @experimental As of version 1.61.0
	 */
	const FilterBar = FilterBarBase.extend("sap.ui.mdc.FilterBar", {
		metadata: {
			designtime: "sap/ui/mdc/designtime/filterbar/FilterBar.designtime",
			properties: {
				/**
				 * Determines whether the Adapt Filters button is visible in the filter bar.<br>
				 * <b>Note</b>: If the <code>p13nMode</code> property does not contain the value <code>Item</code>, it is ignored.
				 */
				showAdaptFiltersButton: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Determines whether the Clear button is visible in the filter bar.
				 * @since 1.108
				 */
				showClearButton: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Specifies the personalization options for the filter bar.
				 *
				 * @since 1.74
				 */
				p13nMode: {
					type: "sap.ui.mdc.enums.FilterBarP13nMode[]"
				},
				/**
				 * Specifies if the personalization mode for filter items is supported.
				 */
				_p13nModeItem: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false
				}
			}
		},

		renderer: FilterBarBaseRenderer
	});

	const ButtonType = mLibrary.ButtonType;

	FilterBar.prototype._createInnerLayout = function() {
		this._cLayoutItem = FilterItemLayout;
		this._oFilterBarLayout = new FilterContainer();
		this._oFilterBarLayout.getInner().setParent(this);
		this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
		this.setAggregation("layout", this._oFilterBarLayout, true);
		this._addButtons();
	};

	FilterBar.prototype.setP13nMode = function(aMode) {
		this.setProperty("p13nMode", aMode || [], false);

		const oRegisterConfig = {
			helper: this.getPropertyHelper(),
			controller: {}
		};

		let bItemAssigned = false;
		aMode && aMode.forEach(function(sMode) {
			if (sMode == "Item") {
				bItemAssigned = true;
				oRegisterConfig.controller["Item"] = new AdaptFiltersController({control: this});
			}
		}.bind(this));

		this._setP13nModeItem(bItemAssigned);

		oRegisterConfig.controller["Filter"] = new FilterController({control: this});
		this.getEngine().register(this, oRegisterConfig);

		return this;
	};

	FilterBar.prototype.setFilterConditions = function(mValue, bSuppressInvalidate) {
		FilterController.checkConditionOperatorSanity(mValue);
		if (this._oP13nFB){
			this._oP13nFB.setFilterConditions(merge({},mValue));
		}
		this.setProperty("filterConditions", mValue, bSuppressInvalidate);
		return this;
	};

	FilterBar.prototype._getP13nModeItem = function() {
		return this._oModel.getProperty("/_p13nModeItem");
	};

	FilterBar.prototype._setP13nModeItem = function(bValue) {
		this._oModel.setProperty("/_p13nModeItem", bValue, true);
	};


	FilterBar.prototype._addButtons = function() {

		if (this._oFilterBarLayout) {

			this.setProperty("_filterCount", this._oRb.getText("filterbar.ADAPT"), false);

			this._btnAdapt = new Button(this.getId() + "-btnAdapt", {
				type: ButtonType.Transparent,
				text: "{" + FilterBarBase.INNER_MODEL_NAME + ">/_filterCount}",
				press: this.onAdaptFilters.bind(this)
			});
			this._btnAdapt.setAriaHasPopup(HasPopup.ListBox);
			this._btnAdapt.setModel(this._oModel, FilterBarBase.INNER_MODEL_NAME);

			this._btnAdapt.bindProperty("visible", {
				parts: [
					{
						path: '/showAdaptFiltersButton',
						model: FilterBarBase.INNER_MODEL_NAME
					}, {
						path: "/_p13nModeItem",
						model: FilterBarBase.INNER_MODEL_NAME
					}
				],
				formatter: function(bValue1, bValue2) {
					return bValue1 && bValue2;
				}
			});

			this._btnSearch = this._getSearchButton();
			this._btnSearch.setModel(this._oModel, FilterBarBase.INNER_MODEL_NAME);
			this._btnSearch.bindProperty("visible", {
				parts: [
					{
						path: '/showGoButton',
						model: FilterBarBase.INNER_MODEL_NAME
					}, {
						path: "/liveMode",
						model: FilterBarBase.INNER_MODEL_NAME
					}
				],
				formatter: function(bValue1, bValue2) {
					return bValue1 && ((this._isPhone()) ? true : !bValue2);
				}.bind(this)
			});
			this._btnSearch.addStyleClass("sapUiMdcFilterBarBaseButtonPaddingRight");

			this._btnClear = new Button(this.getId() + "-btnClear", {
				type: ButtonType.Transparent,
				visible: "{" + FilterBarBase.INNER_MODEL_NAME + ">/showClearButton}",
				text: this._oRb.getText("filterbar.CLEAR"),
				press: function(oEvent) {
					this.onClear();
				}.bind(this)
			});
			this._btnClear.setModel(this._oModel, FilterBarBase.INNER_MODEL_NAME);
			//this._btnClear.addStyleClass("sapUiMdcFilterBarBaseButtonPaddingRight");

			this._oFilterBarLayout.addButton(this._btnSearch);
			this._oFilterBarLayout.addButton(this._btnClear);
			this._oFilterBarLayout.addButton(this._btnAdapt);
		}
	};

	FilterBar.prototype.onClear = function() {
		this._btnClear.setEnabled(false);
		this.awaitControlDelegate().then(function(oDelegate) {
			oDelegate.clearFilters(this)
			.catch(function(oEx) {
				Log.error(oEx);
			})
			.finally(function() {
				this._btnClear.setEnabled(true);
			}.bind(this));

		}.bind(this));
	};

	FilterBar.prototype.retrieveInbuiltFilter = function() {
		const oInbuiltFilterPromise = FilterBarBase.prototype.retrieveInbuiltFilter.apply(this, arguments);
		return oInbuiltFilterPromise.then(function(oInnerFB){
			return oInnerFB;
		});
	};

	FilterBar.prototype.onAdaptFilters = function(oEvent) {

		return this._retrieveMetadata().then(function() {
			return this.getEngine().show(this, "Item", {
				reset: function(){
					this.getEngine().reset(this);
					this._getConditionModel().checkUpdate(true);
			}.bind(this)
		})
		.then(function(oPopup){
			return oPopup;
		});
		}.bind(this));

	};

	/**
	 * Returns the external conditions of the inner condition model.
	 * <b>Note:</b> This API returns only attributes related to the {@link sap.ui.mdc.FilterBar#setP13nMode p13nMode} property configuration.
	 * @public
	 * @returns {sap.ui.mdc.State} Object containing the current status of the <code>FilterBar</code>
	 */
	FilterBar.prototype.getCurrentState = function() {
		const oState = FilterBarBase.prototype.getCurrentState.apply(this, arguments);
		if (!this.getProperty("_p13nModeItem")) {
			delete oState.items;
		}

		return oState;
	};

	/**
	 * Sets the focus on the first filter in error state.
	 * @public
	 * @returns {sap.ui.mdc.FilterField | null} Returns the first filter field in error state
	 */
	FilterBar.prototype.setFocusOnFirstErroneousField = function() {
		return this._setFocusOnFirstErroneousField();
	};

	FilterBar.prototype.exit = function() {
		FilterBarBase.prototype.exit.apply(this, arguments);

		this._btnClear = undefined;
	};

	return FilterBar;

});