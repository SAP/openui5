sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/f/cards/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4"
], function (Controller, JSONModel, RequestDataProvider, sinon) {
	"use strict";

	var mCards = {
		listCard1:		"./cardcontent/delayedLoading/listManifest1.json",
		listCard2:		"./cardcontent/delayedLoading/listManifest2.json",
		listCard3:		"./cardcontent/delayedLoading/listManifestAll.json",
		listCard4:		"./cardcontent/delayedLoading/listManifestDescriptionTitle.json",
		listCard5:		"./cardcontent/delayedLoading/listManifestIconTitle.json",
		listCard6:		"./cardcontent/delayedLoading/listManifestTitle.json",
		tableCard1: 	"./cardcontent/delayedLoading/tableManifest.json",
		analyticalCard: "./cardcontent/delayedLoading/analyticalManifest.json",
		objectCard1:	"./cardcontent/delayedLoading/objectManifest.json",
		calendarCard: "./cardcontent/delayedLoading/calendarManifest1.json",
		listError: "./cardcontent/delayedLoading/listManifestError.json"
	};

	return Controller.extend("sap.f.cardsdemo.controller.DelayedLoading", {
		onInit: function () {
			var sPath,
				that = this;

			// create named json model for each card
			for (var sId in mCards) {
				sPath = mCards[sId];
				this.getView().setModel(new JSONModel(sPath), sId);
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

		onSetManifestsPress: function () {
			var sPath;

			// give each card a path to manifest
			for (var sId in mCards) {
				sPath = mCards[sId];
				this.getView().byId(sId).setManifest(sPath);
			}
		},

		onSetPreloadedManifestsPress: function () {
			var oView = this.getView();

			// use already created json models to set data immediately
			for (var sId in mCards) {
				this.getView().byId(sId).setManifest(oView.getModel(sId).getData());
			}
		},

		onFormSubmit: function () {
			for (var sId in mCards) {
				var oCard = this.getView().byId(sId);

				if (oCard.getManifest()) {
					oCard.refresh();
				} else {
					oCard.setManifest(mCards[sId]);
				}
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
