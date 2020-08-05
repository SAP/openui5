/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/filterbar/aligned/FilterContainer", "sap/ui/mdc/filterbar/aligned/FilterItemLayout", "sap/ui/mdc/filterbar/FilterBarBase", "sap/ui/mdc/filterbar/FilterBarBaseRenderer", 'sap/m/library', 'sap/m/Button'
], function(FilterContainer, FilterItemLayout, FilterBarBase, FilterBarBaseRenderer, mLibrary, Button) {
	"use strict";


	/**
	 * Constructor for a new FilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FilterBar</code> control is used to display filter properties in a user-friendly manner to populate values for a query.
	 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
	 * The Go button triggers the search event, and the Advanced Filters button shows the filter dialog.<br>
	 * The <code>FilterBar</code> control creates and handles the filters based on the provided metadata information.
	 * The metadata information is provided via the {@link sap.ui.mdc.FilterBarDelegate FilterBarDelegate} implementation. This implementation has to be provided by the application.
	 * @extends sap.ui.mdc.filterbar.FilterBarBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterBar = FilterBarBase.extend("sap.ui.mdc.FilterBar", {
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
				 * Determines whether the Go button is visible in the filter bar.<br>
				 * <b>Note</b>: If the <code>liveMode</code> property is set to <code>true</code>, it is ignored.
				 */
				showGoButton: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Specifies the personalization options for the filter bar.
				 *
				 * @since 1.74
				 */
				p13nMode: {
					type: "sap.ui.mdc.FilterBarP13nMode[]"
				},
				/**
				 * Specifies if the personalization mode for filter items is supported.
				 */
				_p13nModeItem: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false
				},
				/**
				 * Specifies if the personalization mode for filter conditions is supported.
				 */
				_p13nModeValue: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false
				}
			}
		},

		renderer: FilterBarBaseRenderer
	});

	var ButtonType = mLibrary.ButtonType;

	FilterBar.prototype._createInnerLayout = function() {
		this._cLayoutItem = FilterItemLayout;
		this._oFilterBarLayout = new FilterContainer();
		this._oFilterBarLayout.getInner().setParent(this);
		this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
		this.setAggregation("layout", this._oFilterBarLayout, true);
		this._addButtons();
	};

	FilterBar.prototype.setP13nMode = function(aMode) {
		var aOldMode = this.getP13nMode();
		this.setProperty("p13nMode", aMode || [], false);

		aMode && aMode.forEach(function(sMode) {
			if (!aOldMode || aOldMode.indexOf(sMode) < 0) {
				this._setP13nMode(sMode, true);
			}
		}.bind(this));
		aOldMode && aOldMode.forEach(function(sMode) {
			if (!aMode || aMode.indexOf(sMode) < 0) {
				this._setP13nMode(sMode, false);
			}
		}.bind(this));

		return this;
	};

	FilterBar.prototype._setP13nMode = function(sMode, bValue) {
		switch (sMode) {
			case "Item":  this._setP13nModeItem(bValue); break;
			case "Value": this._setP13nModeValue(bValue); break;
		}
	};

	FilterBar.prototype._getP13nModeItem = function() {
		return this._oModel.getProperty("/_p13nModeItem");
	};

	FilterBar.prototype._setP13nModeItem = function(bValue) {
		this._oModel.setProperty("/_p13nModeItem", bValue, true);
	};

	FilterBar.prototype._getP13nModeValue = function() {
		return this._oModel.getProperty("/_p13nModeValue");
	};

	FilterBar.prototype._setP13nModeValue = function(bValue) {
		this._oModel.setProperty("/_p13nModeValue", bValue, false);
		this._bPersistValues = bValue;
	};

	FilterBar.prototype._addButtons = function() {

		if (this._oFilterBarLayout) {

			this.setProperty("_filterCount", this._oRb.getText("filterbar.ADAPT"), false);

			this._btnAdapt = new Button(this.getId() + "-btnAdapt", {
				type: ButtonType.Transparent,
				text: "{" + FilterBarBase.INNER_MODEL_NAME + ">/_filterCount}",
				press: this.onAdaptFilters.bind(this)
			});
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
			this._btnAdapt.addStyleClass("sapUiMdcFilterBarBaseButtonPaddingRight");

			this._oFilterBarLayout.addButton(this._btnAdapt);

			this._btnSearch = new Button(this.getId() + "-btnSearch", {
				text: this._oRb.getText("filterbar.GO"),
				press: this.onSearch.bind(this),
				type: ButtonType.Emphasized
			});
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
			this._oFilterBarLayout.addButton(this._btnSearch);
		}
	};

	FilterBar.prototype.onAdaptFilters = function(oEvent) {
		return this._oMetadataAppliedPromise.then(function() {
			return this.retrieveAdaptationController().then(function (oAdaptationController) {
				return oAdaptationController.showP13n(this._btnAdapt, "Item");
			}.bind(this));
		}.bind(this));
	};

	FilterBar.prototype.getCurrentState = function() {
		var oState = FilterBarBase.prototype.getCurrentState.apply(this, arguments);
		if (!this.getProperty("_p13nModeItem")) {
			delete oState.items;
		}
		return oState;
	};

	return FilterBar;

});
