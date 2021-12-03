/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/base/Log"
], function (
	BaseAction,
	Log
) {
	"use strict";

	var SubmitAction = BaseAction.extend("sap.ui.integration.cards.actions.SubmitAction");

	SubmitAction.prototype.execute = function () {
		var oSource = this.getSourceInstance();

		if (!oSource.isA("sap.ui.integration.cards.BaseContent")) {
			return;
		}

		var oDataProvider,
			oDataProviderFactory = this.getCardInstance()._oDataProviderFactory,
			oParameters = this.getParameters();

		if (!oParameters.configuration) {
			return;
		}

		oSource.onActionSubmitStart(oParameters);
		oDataProvider = oDataProviderFactory.create({
			request: oParameters.configuration
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

	return SubmitAction;
});