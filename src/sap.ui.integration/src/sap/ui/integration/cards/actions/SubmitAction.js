/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/base/Log",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils"
], function (
	BaseAction,
	Log,
	BindingHelper,
	BindingResolver,
	Utils
) {
	"use strict";

	var SubmitAction = BaseAction.extend("sap.ui.integration.cards.actions.SubmitAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	/**
	 * @override
	 */
	SubmitAction.prototype.execute = function () {
		var oCard = this.getCardInstance(),
			oSubmitActionHandler = this.getActionHandler();

		if (!oSubmitActionHandler) {
			return;
		}

		var oDataProviderFactory = this.getCardInstance()._oDataProviderFactory,
			oData = oCard.getModel("form").getData();

		this._onActionSubmitStart(oData);

		var oDataProvider = oDataProviderFactory.create({
			request: this._createRequest(oSubmitActionHandler, oData)
		});

		oDataProvider.getData()
			.then(function (oResponse) {
				this._onActionSubmitEnd(oResponse, null);
			}.bind(this), function (oError) {
				Log.error(oError);
				this._onActionSubmitEnd(null, {error: oError});
			}.bind(this))
			.finally(function () {
				// Cleanup the data provider
				oDataProviderFactory.remove(oDataProvider);
			});
	};

	SubmitAction.prototype._onActionSubmitStart = function (oData) {
		var oSource = this.getSourceInstance();

		if (oSource.isA("sap.ui.integration.cards.BaseContent")) {
			oSource.onActionSubmitStart(oData);
		}
	};

	SubmitAction.prototype._onActionSubmitEnd = function (oResponse, oError) {
		var oSource = this.getSourceInstance();

		if (oSource.isA("sap.ui.integration.cards.BaseContent")) {
			oSource.onActionSubmitEnd(oResponse, oError);
		}
	};

	SubmitAction.prototype._createRequest = function (oSubmitActionHandler, oData) {
		return {
			mode: oSubmitActionHandler.mode || "cors",
			url: oSubmitActionHandler.url,
			method: oSubmitActionHandler.method || "POST",
			parameters: this._resolveActionHandlerParams(oSubmitActionHandler.parameters) || oData,
			headers: oSubmitActionHandler.headers,
			xhrFields: {
				withCredentials: !!oSubmitActionHandler.withCredentials
			}
		};
	};

	SubmitAction.prototype._resolveActionHandlerParams = function (oActionHandlerParameters) {
		var oCard = this.getCardInstance();

		oActionHandlerParameters = BindingResolver.resolveValue(
			BindingHelper.createBindingInfos(oActionHandlerParameters, oCard.getBindingNamespaces()),
			this.getSourceInstance()
		);
		Utils.makeUndefinedValuesNull(oActionHandlerParameters);

		return oActionHandlerParameters;
	};

	return SubmitAction;
});