sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/cards/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/integration/widgets/Card",
	"sap/f/GridContainerItemLayoutData"
], function (Controller, JSONModel, RequestDataProvider, sinon, Card, GridContainerItemLayoutData) {
	"use strict";

	var aSamples = [
		{
			"key": "list1",
			"columns": 6,
			"manifest": "./cardcontent/delayedLoading/listManifest1.json"
		},
		{
			"key": "list2",
			"columns": 6,
			"manifest": "./cardcontent/delayedLoading/listManifest2.json"
		},
		{
			"key": "list3",
			"columns": 5,
			"manifest": "./cardcontent/delayedLoading/listManifestAll.json"
		},
		{
			"key": "list4",
			"columns": 4,
			"manifest": "./cardcontent/delayedLoading/listManifestDescriptionTitle.json"
		},
		{
			"key": "list5",
			"columns": 3,
			"manifest": "./cardcontent/delayedLoading/listManifestIconTitle.json"
		},
		{
			"key": "list6",
			"columns": 2,
			"manifest": "./cardcontent/delayedLoading/listManifestTitle.json"
		},
		{
			"key": "table1",
			"columns": 4,
			"manifest": "./cardcontent/delayedLoading/tableManifest.json"
		},
		{
			"key": "analytical1",
			"columns": 6,
			"manifest": "./cardcontent/delayedLoading/analyticalManifest.json"
		},
		{
			"key": "object1",
			"columns": 6,
			"manifest": "./cardcontent/delayedLoading/objectManifest.json"
		},
		{
			"key": "calendar1",
			"columns": 5,
			"manifest": "./cardcontent/delayedLoading/calendarManifest1.json"
		},
		{
			"key": "listError",
			"columns": 5,
			"manifest": "./cardcontent/delayedLoading/listManifestError.json"
		}
	];

	return Controller.extend("sap.f.cardsdemo.controller.DelayedLoading", {
		onInit: function () {
			var oView = this.getView(),
				oSample,
				that = this;

			// preload manifests
			for (var iInd in aSamples) {
				oSample = aSamples[iInd];
				oView.setModel(new JSONModel(oSample.manifest), oSample.key);
			}

			// create delayed get data method
			this._fnGetDataStub = sinon.stub(RequestDataProvider.prototype, "getData");

			this._fnGetDataStub.callsFake(function () {
				var fnOriginal = that._fnGetDataStub.wrappedMethod.bind(this);
				return that._delayedGetData(fnOriginal);
			});
		},

		onExit: function () {
			this._fnGetDataStub.restore();
		},

		onFormSubmit: function () {
			this._generateCards();
		},

		_generateCards: function () {
			var oView = this.getView(),
				iNumberOfCards = parseInt(this.byId("numberOfCards").getValue()),
				oContainer = this.byId("cardsContainer"),
				bPreloadManifests = this.byId("preloadManifests").getSelected(),
				oSample,
				vManifest;

			oContainer.destroyItems();

			for (var i = 0; i < iNumberOfCards; i++) {
				oSample = aSamples[i % aSamples.length];

				if (bPreloadManifests) {
					vManifest = oView.getModel(oSample.key).getData();
				} else {
					vManifest = oSample.manifest;
				}

				oContainer.addItem(new Card({
					baseUrl: "./",
					manifest: vManifest,
					layoutData: new GridContainerItemLayoutData({
						columns: oSample.columns
					})
				}));
			}
		},

		_delayedGetData: function (fnOriginal) {
			var iMin = parseInt(this.byId("loadingMinSeconds").getValue()) || 0,
				iMax = Math.max(parseInt(this.byId("loadingMaxSeconds").getValue()) || 0, iMin),
				iNumberInRange = Math.floor(Math.random() * (iMin - iMax) + iMax);

			return new Promise(function (fnResolve, fnReject) {
				setTimeout(function () {
					fnOriginal().then(fnResolve, fnReject);
				}, iNumberInRange * 1000);
			});
		}
	});
});
