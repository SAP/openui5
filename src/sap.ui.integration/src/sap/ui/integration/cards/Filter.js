/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/ui/core/Icon",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/LoadingProvider"
], function (
	Control,
	Core,
	Log,
	Icon,
	HBox,
	Text,
	Select,
	ListItem,
	JSONModel,
	LoadingProvider
) {
	"use strict";

	var Filter = Control.extend("sap.ui.integration.cards.Filter", {
		metadata: {

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
				 * The currently selected filter value.
				 */
				value: { type: "string", defaultValue: "" }
			},

			aggregations: {
				/**
				 * The internally used sap.m.Select control instance.
				 */
				_select: { type: "sap.m.Select", multiple: false, visibility: "hidden" }
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
					oRM.renderControl(oFilter._getSelect());
				}

				oRM.close("div");
			}
		}
	});

	Filter.prototype.init = function () {
		this._oLoadingProvider = new LoadingProvider();

		this.attachEventOnce("_dataReady", function () {
			this.fireEvent("_ready");
		});
	};

	Filter.prototype.exit = function () {
		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
		}
	};

	Filter.prototype.isLoading = function () {
		return !this._oLoadingProvider.getDataProviderJSON() && this._oLoadingProvider.getLoadingState();
	};

	Filter.prototype._getSelect = function () {
		var oControl = this.getAggregation("_select");
		if (!oControl) {
			oControl = this._createSelect();
			this.setAggregation("_select", oControl);
		}

		return oControl;
	};

	Filter.prototype._hasError = function () {
		return !!this._bError;
	};

	Filter.prototype._getErrorMessage = function () {
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

	Filter.prototype._handleError = function (sLogMessage) {
		Log.error(sLogMessage);

		this._bError = true;
		this.invalidate();
	};

	Filter.prototype._onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
		this._oLoadingProvider.setLoading(false);
		this.invalidate();
	};

	Filter.prototype._onDataRequested = function () {
		this._oLoadingProvider.createLoadingState(this._oDataProvider);
	};

	Filter.prototype._updateModel = function (oData) {
		var oSelect = this._getSelect(),
			oModel = this.getModel();

		oModel.setData(oData);

		oSelect.setSelectedKey(this.getValue());
		this._updateSelected(oSelect.getSelectedItem());
	};

	/**
	 * Uses the Card's own DataProvider and the provided oDataConfig object to populate the Filter's data.
	 * @private
	 * @param {object} oDataConfig Data configuration
	 */
	Filter.prototype._setDataConfiguration = function (oDataConfig) {
		if (!oDataConfig) {
			this.fireEvent("_dataReady");
			return;
		}

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		var oCard = Core.byId(this.getCard());
		this._oDataProvider = oCard._oDataProviderFactory.create(oDataConfig, null, true);

		// If a data provider is created: use own model.
		this.setModel(new JSONModel());

		this._oDataProvider.attachDataRequested(function () {
			this._onDataRequested();
		}.bind(this));

		this._oDataProvider.attachDataChanged(function (oEvent) {
			this._updateModel(oEvent.getParameter("data"));
			this._onDataRequestComplete();
		}.bind(this));

		this._oDataProvider.attachError(function (oEvent) {
			this._handleError(oEvent.getParameter("message"));
			this._onDataRequestComplete();
		}.bind(this));

		this._oDataProvider.triggerDataUpdate();
	};

	Filter.prototype._updateSelected = function (oSelectedItem) {
		var oFiltersModel = this.getModel("filters"),
			sFilterKey = this.getKey();

		oFiltersModel.setProperty("/" + sFilterKey, {
			"value": oSelectedItem.getKey(),
			"selectedItem": {
				"title": oSelectedItem.getText(),
				"key": oSelectedItem.getKey()
			}
		});
	};

	/**
	 * Constructs a Select control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.Select} configured instance
	 */
	Filter.prototype._createSelect = function () {
		var oSelect = new Select(),
			sItemTemplateKey,
			sItemTemplateTitle,
			sItemsPath = "/",
			oConfig = this.getConfig();

		oSelect.attachChange(function (oEvent) {
			var sValue = oEvent.getParameter("selectedItem").getKey();
			this.setValue(sValue);
			this._updateSelected(oEvent.getParameter("selectedItem"));
		}.bind(this));

		if (oConfig && oConfig.item) {
			sItemsPath = oConfig.item.path || sItemsPath;
		}

		if (oConfig && oConfig.item && oConfig.item.template) {
			sItemTemplateKey = oConfig.item.template.key;
			sItemTemplateTitle = oConfig.item.template.title;
		}

		if (oConfig && oConfig.items) {
			sItemTemplateKey = "{key}";
			sItemTemplateTitle = "{title}";
			this.setModel(new JSONModel(oConfig.items));
		}

		oSelect.bindItems({
			path: sItemsPath,
			template: new ListItem({ key: sItemTemplateKey, text: sItemTemplateTitle })
		});
		oSelect.setSelectedKey(this.getValue());

		return oSelect;
	};

	return Filter;
});