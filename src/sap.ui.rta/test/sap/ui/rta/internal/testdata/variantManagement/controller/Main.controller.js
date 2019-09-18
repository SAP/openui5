sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/rta/api/startKeyUserAdaptation"
], function (
	Controller,
	Utils,
	ControlPersonalizationAPI,
	startKeyUserAdaptation
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.variantManagement.controller.Main", {
		_data: [],

		onInit: function () {
			this.iCounter = 0;
			var oView = this.getView();
			oView.addStyleClass("sapUiSizeCompact");
			this._data.push(
				new Promise(function (resolve) {
					oView.bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType01Nav"
						}
					});
				}),

				new Promise(function (resolve) {
					oView.byId("MainForm").bindElement({
						path: "/EntityTypes2(EntityType02_Property01='EntityType02Property01Value')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType02Nav"
						}
					});
				})
			);
		},

		_getUrlParameter: function (sParam) {
			var sReturn = "";
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] === sParam) {
					sReturn = sParameterName[1];
				}
			}
			return sReturn;
		},

		switchToAdaptionMode: function () {
			startKeyUserAdaptation({rootControl: this.getOwnerComponent()});
		},

		createChanges: function (oEvent) {
			var oButton = oEvent.getSource();
			var oAppComponent = Utils.getAppComponentForControl(sap.ui.core.Component.getOwnerComponentFor(this.getView()));
			var mChangeSpecificData = {};

			jQuery.extend(mChangeSpecificData, {
				developerMode: false,
				layer: sap.ui.fl.Utils.getCurrentLayer()
			});

			sap.m.MessageBox.show(
				"Do you want to create personalization changes?", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Personalization Dialog",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === "YES") {
							if (this.iCounter === 0) {
								// on first press of "Personalization Changes button"
								// add dirty changes2
								// change1: move sections with simple form
								var oMoveChangeData = {
									selectorControl: sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageLayout")),
									changeSpecificData: {
										changeType: "moveControls",
										movedElements: [{
											id: oAppComponent.createId("idMain1--ObjectPageSectionWithForm"),
											sourceIndex: 0,
											targetIndex: 1
										}],
										source: {
											id: oAppComponent.createId("idMain1--ObjectPageLayout"),
											aggregation: "sections"
										},
										target: {
											id: oAppComponent.createId("idMain1--ObjectPageLayout"),
											aggregation: "sections"
										}
									}
								};
								// change2: remove section with smart form
								var oRemoveChangeData = {
									selectorControl: sap.ui.getCore().byId("application-masterDetail-display-component---idMain1--ObjectPageSectionWithSmartForm"),
									changeSpecificData: {
										changeType: "stashControl"
									}
								};
								ControlPersonalizationAPI.addPersonalizationChanges({controlChanges: [oMoveChangeData, oRemoveChangeData]});
								this.iCounter++;
							} else if (this.iCounter === 1) {
								// on second press of "Personalization Changes button"
								var oMoveChangeData2 = {
									selectorControl: sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageLayout")),
									changeSpecificData: {
										changeType: "moveControls",
										movedElements: [{
											id: oAppComponent.createId("idMain1--ObjectPageSectionWithVM"),
											sourceIndex: 2,
											targetIndex: 0
										}],
										source: {
											id: oAppComponent.createId("idMain1--ObjectPageLayout"),
											aggregation: "sections"
										},
										target: {
											id: oAppComponent.createId("idMain1--ObjectPageLayout"),
											aggregation: "sections"
										}
									}
								};

								ControlPersonalizationAPI.addPersonalizationChanges({
									controlChanges: [oMoveChangeData2]
								});

								oButton.setEnabled(false);
								this.iCounter++;
							}
						}
					}.bind(this)
				}
			);
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}
	});
});
