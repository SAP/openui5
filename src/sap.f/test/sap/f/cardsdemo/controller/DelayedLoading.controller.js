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
			for (var id in mCards) {
				sPath = mCards[id];
				this.getView().setModel(new JSONModel(sPath), id);
			}
		},
		onSetManifestsPress: function () {
			var sPath;

			// give each card a path to manifest
			for (var id in mCards) {
				sPath = mCards[id];
				this.getView().byId(id).setManifest(sPath);
			}
		},
		onSetPreloadedManifestsPress: function () {
			var oView = this.getView();

			// use already created json models to set data immediately
			for (var id in mCards) {
				this.getView().byId(id).setManifest(oView.getModel(id).getData());
			}
		}
	});

});