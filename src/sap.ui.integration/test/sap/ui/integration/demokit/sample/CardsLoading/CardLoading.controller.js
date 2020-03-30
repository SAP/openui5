sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/cards/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function (Controller, JSONModel, RequestDataProvider, sinon, Core) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardsLoading.CardLoading", {
		onInit: function () {
			// create delayed get data method
			this._fnGetDataStub = sinon.stub(RequestDataProvider.prototype, "getData");

			this._fnGetDataStub.callsFake(function () {
				var fnOriginal = that._fnGetDataStub.wrappedMethod.bind(this);
				return that._delayedGetData(fnOriginal);
			});

			var cardManifests = new JSONModel(sap.ui.require.toUrl("sap/ui/integration/sample/CardsLoading/manifests/cardManifests.json")),
				that = this;

			this.getView().setModel(cardManifests, "manifests");

		},

		onExit: function () {
			this._fnGetDataStub.restore();
		},

		onFormSubmit: function () {
			var sGridId = this.getView().getId() + "--grd",
				oGridItems = Core.byId(sGridId).getItems(),
				oModelData = this.getView().getModel("manifests").getData();
			for (var i in oGridItems) {
				var oCard = oGridItems[i];

				for (var manifest in oModelData) {
					if (oCard.getId().indexOf(manifest) > -1) {
						if (oCard.getManifest()) {
							oCard.refresh();
						} else {
							oCard.setManifest(oModelData[manifest]);
						}
					}
				}
			}
		},

		_delayedGetData: function (fnOriginal) {
			var iMiliSeconds = parseInt(this.byId("loadingMinSeconds").getValue()) || 0;

			return new Promise(function (fnResolve, fnReject) {
				setTimeout(function () {
					fnOriginal().then(fnResolve, fnReject);
				}, iMiliSeconds * 1000);
			});
		}
	});
});
