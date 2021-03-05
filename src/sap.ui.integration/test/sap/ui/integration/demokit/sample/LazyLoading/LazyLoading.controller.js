sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/f/GridContainerItemLayoutData"
], function (Controller, JSONModel, RequestDataProvider, sinon, Core, Card, GridContainerItemLayoutData) {
	"use strict";
	var aSamples = [
		{
			"key": "list1",
			"columns": 6,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/listManifest1.json"
		},
		{
			"key": "list2",
			"columns": 6,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/listManifest2.json"
		},
		{
			"key": "list3",
			"columns": 5,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/listManifestAll.json"
		},
		{
			"key": "list4",
			"columns": 4,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/listManifestDescriptionTitle.json"
		},
		{
			"key": "list5",
			"columns": 3,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/listManifestIconTitle.json"
		},
		{
			"key": "table1",
			"columns": 4,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/tableManifest.json"
		},
		{
			"key": "object1",
			"columns": 6,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/objectManifest.json"
		},
		{
			"key": "calendar1",
			"columns": 5,
			"manifest": "sap/ui/integration/sample/LazyLoading/manifests/calendarManifest1.json"
		}
	];

	return Controller.extend("sap.ui.integration.sample.LazyLoading.LazyLoading", {
		onInit: function () {
			var oView = this.getView(),
				that = this,
				oSample;

			// create delayed get data method
			this._fnGetDataStub = sinon.stub(RequestDataProvider.prototype, "_fetch");
			this._fnGetDataStub.callsFake(function (oRequestConfig) {
				var oRequestConfigAdapted = {
					"url": sap.ui.require.toUrl(oRequestConfig.url)
				};
				var fnOriginal = that._fnGetDataStub.wrappedMethod.bind(this, oRequestConfigAdapted);
				return that._delayedGetData(fnOriginal);
			});
			// preload manifests
			for (var iInd in aSamples) {
				oSample = aSamples[iInd];
				oView.setModel(new JSONModel(sap.ui.require.toUrl(oSample.manifest)), oSample.key);
			}
		},

		onExit: function () {
			this._fnGetDataStub.restore();
		},

		onFormSubmit: function () {
			var iNumberOfCards = parseInt(this.byId("numberOfCards").getValue()),
				oContainer = this.byId("cardsContainer"),
				oView = this.getView(),
				bDataModeAuto = this.byId("dataMode").getSelected(),
				oSample;

			oContainer.destroyItems();

			for (var i = 0; i < iNumberOfCards; i++) {
				oSample = aSamples[i % aSamples.length];

				oContainer.addItem(new Card({
					baseUrl: "./",
					manifest: oView.getModel(oSample.key).getData(),
					layoutData: new GridContainerItemLayoutData({
						columns: oSample.columns,
						minRows: 4
					}),
					dataMode: bDataModeAuto ? "Auto" : "Active"
				}));
			}
		},

		_delayedGetData: function (fnOriginal) {
			var iNumberInRange = parseInt(this.byId("loadingSeconds").getValue()) || 0;

			return new Promise(function (fnResolve, fnReject) {
				setTimeout(function () {
					fnOriginal().then(fnResolve, fnReject);
				}, iNumberInRange * 1000);
			});
		}
	});
});
