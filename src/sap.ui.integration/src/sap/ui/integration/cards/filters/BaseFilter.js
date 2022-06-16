/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText",
	"sap/base/Log",
	"sap/ui/core/Icon",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/integration/util/LoadingProvider"
], function (
	Control,
	Core,
	InvisibleText,
	Log,
	Icon,
	HBox,
	Text,
	ObservableModel,
	LoadingProvider
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
				config: { type: "object", defaultValue: "null" },

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
				_label: { type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden" }
			},
			associations: {

				/**
				 * Association with the parent Card that contains this filter.
				 */
				card: { type: "sap.ui.integration.widgets.Card", multiple: false }
			}

		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oFilter) {
				var bLoading = oFilter.isLoading();

				oRM.openStart("div", oFilter).class("sapFCardFilter");

				if (bLoading) {
					oRM.class("sapFCardFilterLoading");
				}

				oRM.openEnd();

				if (oFilter._hasError()) {
					oRM.renderControl(oFilter._getErrorMessage());
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

		return !oLoadingProvider.isDataProviderJson() && oLoadingProvider.getLoading();
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
		this.getAggregation("_loadingProvider").setLoading(true);
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseFilter.prototype.hideLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(false);
	};

	BaseFilter.prototype.onDataChanged = function () { };

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
		return Core.byId(this.getCard());
	};

	BaseFilter.prototype._hasError = function () {
		return !!this._bError;
	};

	BaseFilter.prototype._getErrorMessage = function () {
		var sMessage = "Unable to load the filter.";

		return new HBox({
			justifyContent: "Center",
			alignItems: "Center",
			items: [
				new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
				new Text({ text: sMessage })
			]
		});
	};

	BaseFilter.prototype._handleError = function (sLogMessage) {
		Log.error(sLogMessage);

		this._bError = true;
		this.invalidate();
	};

	BaseFilter.prototype._onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
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

		this.getAggregation("_loadingProvider").setDataProvider(this._oDataProvider);

		if (oDataConfig.name) {
			oModel = oCard.getModel(oDataConfig.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			this.setModel(oModel);
		}

		oModel.attachEvent("change", function () {
			this.onDataChanged();
		}.bind(this));

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
		}.bind(this));

		this._oDataProvider.triggerDataUpdate();
	};

	BaseFilter.prototype._setValue = function () {
		var oValueForModel = this.getValueForModel(),
			oCard = this.getCardInstance(),
			mParams = {},
			sManifestKey;

		this.setValue(oValueForModel);

		if (oCard) {
			sManifestKey = "/sap.card/configuration/filters/" + this.getKey() + "/value";
			mParams[sManifestKey] = oValueForModel.value;
			this.getCardInstance()._fireConfigurationChange(mParams);
		}
	};

	return BaseFilter;
});