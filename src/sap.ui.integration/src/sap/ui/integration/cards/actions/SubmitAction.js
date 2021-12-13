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
		var oSource = this.getSourceInstance(),
			oSubmitActionHandler = this.getActionHandler();

		if (!oSubmitActionHandler || !oSource.isA("sap.ui.integration.cards.BaseContent")) {
			return;
		}

		var oDataProviderFactory = this.getCardInstance()._oDataProviderFactory,
			oParameters = this.getParameters();

		oSource.onActionSubmitStart(oParameters);

		var oDataProvider = oDataProviderFactory.create({
			request: this._createRequest(oSubmitActionHandler, oParameters)
		});

		oDataProvider.getData()
			.then(function (oResponse) {
				oSource.onActionSubmitEnd(oResponse, null);
			}, function (oError) {
				Log.error(oError);
				oSource.onActionSubmitEnd(null, {error: oError});
			})
			.finally(function () {
				// Cleanup the data provider
				oDataProviderFactory.remove(oDataProvider);
			});

	};

	SubmitAction.prototype._createRequest = function (oSubmitActionHandler, oDefaultParameters) {
		return {
			mode: oSubmitActionHandler.mode || "cors",
			url: oSubmitActionHandler.url,
			method: oSubmitActionHandler.method || "POST",
			parameters: this._resolveActionHandlerParams(oSubmitActionHandler.parameters, oDefaultParameters) || oDefaultParameters,
			headers: oSubmitActionHandler.headers,
			xhrFields: {
				withCredentials: !!oSubmitActionHandler.withCredentials
			}
		};
	};

	SubmitAction.prototype._resolveActionHandlerParams = function (oActionHandlerParameters, oDefaultParameters) {
		var oCard = this.getCardInstance();

		oCard.getModel("form").setProperty("/", oDefaultParameters.data);

		oActionHandlerParameters = BindingResolver.resolveValue(
			BindingHelper.createBindingInfos(oActionHandlerParameters, oCard.getBindingNamespaces()),
			this.getSourceInstance()
		);
		Utils.makeUndefinedValuesNull(oActionHandlerParameters);

		return oActionHandlerParameters;
	};

	return SubmitAction;
});