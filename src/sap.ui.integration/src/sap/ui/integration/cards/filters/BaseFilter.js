/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/core/Icon",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/ui/core/Lib",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/BindingHelper"
], function(
	Control,
	Element,
	InvisibleText,
	Log,
	merge,
	Icon,
	HBox,
	Text,
	Library,
	ObservableModel,
	LoadingProvider,
	BindingHelper
) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseFilter</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.96
	 * @alias sap.ui.integration.cards.filters.BaseFilter
	 */
	var BaseFilter = Control.extend("sap.ui.integration.cards.filters.BaseFilter", {
		metadata: {
			"abstract" : true,
			library: "sap.ui.integration",
			properties: {
				/**
				 * Filter's key as it's defined in the manifest.
				 */
				key: { type: "string", defaultValue: "" },

				/**
				 * The configuration object, defined in the manifest.
				 */
				config: { type: "object", defaultValue: {} },

				/**
				 * The value of the filter that can be used in the manifest.
				 */
				value: { type: "object", defaultValue: null }
			},
			aggregations: {
				/**
				 * The internally used LoadingProvider.
				 */
				_loadingProvider: { type: "sap.ui.core.Element", multiple: false, visibility: "hidden" },

				/**
				 * The hidden label for this control
				 */
				_label: { type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden" },

				_error: { type: "sap.m.HBox", multiple: false, visibility: "hidden" }
			},
			associations: {

				/**
				 * Association with the parent Card that contains this filter.
				 */
				card: { type: "sap.ui.integration.widgets.Card", multiple: false }
			},
			events: {
				change: {
					parameters: {
						key: { type: "string"},
						value: { type: "string"}
					}
				}
			}

		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oFilter) {
				const oError = oFilter.getAggregation("_error");

				oRM.openStart("div", oFilter).class("sapFCardFilter");

				if (oFilter.isLoading()) {
					oRM.class("sapFCardFilterLoading");
				}

				oRM.openEnd();

				if (oError) {
					oRM.renderControl(oError);
				} else {
					oRM.renderControl(oFilter.getField());
				}

				oRM.close("div");
			}
		}
	});

	BaseFilter.prototype.init = function () {
		this.setAggregation("_loadingProvider", new LoadingProvider());

		this.attachEventOnce("_dataReady", function () {
			this.fireEvent("_ready");
		});
	};

	BaseFilter.prototype.exit = function () {
		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}
	};

	BaseFilter.prototype.isLoading = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider");

		return oLoadingProvider.getLoading();
	};

	BaseFilter.prototype.getField = function () {
		return null;
	};

	BaseFilter.prototype.createLabel = function (oConfig) {
		if (oConfig.label) {
			this.setAggregation("_label", new InvisibleText({
				text: oConfig.label
			}).toStatic());
			return this.getAggregation("_label");
		}
		return null;
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseFilter.prototype.showLoadingPlaceholders = function () {
		if (!this._isDataProviderJson()) {
			this.getAggregation("_loadingProvider").setLoading(true);
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseFilter.prototype.hideLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(false);
	};

	BaseFilter.prototype.onDataChanged = function () { };

	/**
	 * @private
	 * @ui5-restricted
	 * @param vValue value to set
	 */
	BaseFilter.prototype.setValueFromOutside = function (vValue) { };

	BaseFilter.prototype.getValueForModel = function () { };

	BaseFilter.prototype.refreshData = function () {
		if (this._oDataProvider) {
			this._oDataProvider.triggerDataUpdate();
		}
	};

	/**
	 * Gets the card instance of which this element is part of.
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.integration.widgets.Card} The card instance.
	 */
	BaseFilter.prototype.getCardInstance = function () {
		return Element.getElementById(this.getCard());
	};

	BaseFilter.prototype.getParsedConfiguration = function () {
		var oResult = merge({}, this.getConfig()),
			oDataSettings = oResult.data;

		// do not create binding info for data
		delete oResult.data;
		oResult = BindingHelper.createBindingInfos(oResult, this.getCardInstance().getBindingNamespaces());

		if (oDataSettings) {
			oResult.data = oDataSettings;
		}

		return oResult;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration.delegate.Paginator
	 * @param {object} oConfiguration Filter configuration where the value will be written.
	 */
	BaseFilter.prototype.writeValueToConfiguration = function (oConfiguration) { };

	BaseFilter.prototype._showError = function () {
		var sMessage = Library.getResourceBundleFor("sap.ui.integration").getText("CARD_FILTER_DATA_LOAD_ERROR");

		this.destroyAggregation("_error");
		this.setAggregation("_error", new HBox({
			justifyContent: "Center",
			alignItems: "Center",
			items: [
				new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
				new Text({ text: sMessage })
			]
		}));
	};

	BaseFilter.prototype._handleError = function (sLogMessage) {
		Log.error(sLogMessage);
		this._showError();
	};

	BaseFilter.prototype._onDataRequestComplete = function () {
		this.hideLoadingPlaceholders();
	};

	/**
	 * Uses the Card's own DataProvider and the provided oDataConfig object to populate the Filter's data.
	 * @private
	 * @param {object} oDataConfig Data configuration
	 */
	BaseFilter.prototype._setDataConfiguration = function (oDataConfig) {
		var oCard = this.getCardInstance(),
			oModel;

		if (!oDataConfig) {
			this.fireEvent("_dataReady");
			return;
		}

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = oCard.getDataProviderFactory().create(oDataConfig, null, true);

		if (oDataConfig.name) {
			oModel = oCard.getModel(oDataConfig.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			oModel.setSizeLimit(oCard.getModelSizeLimit());
			this.setModel(oModel);
		}

		if (!oModel) {
			this.fireEvent("_dataReady");
			return;
		}

		oModel.attachEvent("change", () => {
			this.onDataChanged();
			// wait for the binding update to finish
			setTimeout(() => {
				this.fireEvent("_dataReady");
			}, 0);
		});

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this.showLoadingPlaceholders();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				oModel.setData(oEvent.getParameter("data"));
				this._onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
				this._onDataRequestComplete();
				this.fireEvent("_dataReady");
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_dataReady");
		}
	};

	BaseFilter.prototype._syncValue = function () {
		const oValueForModel = this.getValueForModel();

		this.setValue(oValueForModel);
		this.fireChange({
			key: this.getKey(),
			value: oValueForModel.value
		});
	};

	BaseFilter.prototype._isDataProviderJson = function () {
		return !!this._oDataProvider?.getConfiguration()?.json;
	};

	return BaseFilter;
});