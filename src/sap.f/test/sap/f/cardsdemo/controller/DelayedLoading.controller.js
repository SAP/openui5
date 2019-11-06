sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var mCards = {
		listCard1:		"./cardcontent/delayedLoading/listManifest1.json",
		listCard2:		"./cardcontent/delayedLoading/listManifest2.json",
		tableCard1: 	"./cardcontent/delayedLoading/tableManifest.json",
		tableCard2: 	"./cardcontent/delayedLoading/tableManifest.json",
		donutCard:		"./cardcontent/delayedLoading/donutManifest.json",
		objectCard1:	"./cardcontent/delayedLoading/objectManifest.json",
		timelineCard:	"./cardcontent/delayedLoading/timelineManifest.json"
	};

	return Controller.extend("sap.f.cardsdemo.controller.DelayedLoading", {
		onInit: function () {
			var sPath;

			// create named json model for each card
			for (var sId in mCards) {
				sPath = mCards[sId];
				this.getView().setModel(new JSONModel(sPath), sId);
			}
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
			var iMin = parseInt(this.byId("loadingMinSeconds").getValue()),
				iMax = parseInt(this.byId("loadingMaxSeconds").getValue()),
				iNumberInRange;

			for (var sId in mCards) {
				iNumberInRange = Math.floor(Math.random() * (iMin - iMax) + iMax);
				this._delayCardMethods(this.getView().byId(sId), iNumberInRange, sId);
			}
		},

		_delayCardMethods: function (oCard, iDelay, sId) {
			var fnSetCardContent = oCard._setCardContent;

			// delay rendering of the content
			oCard._setCardContent = function () {
				setTimeout(function (args) {
					fnSetCardContent.apply(oCard, args);
					oCard._setCardContent = fnSetCardContent;
				}, iDelay * 1000, arguments);
			};
			oCard.setManifest(mCards[sId]);
		}
	});

});