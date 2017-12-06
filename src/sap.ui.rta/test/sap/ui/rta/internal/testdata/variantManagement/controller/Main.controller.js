sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/fl/Utils"
], function(Controller, MockServer, ResourceModel, ODataModel, JSONModel, RuntimeAuthoring, Utils) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.variantManagement.controller.Main", {
		_data: [],

		onInit: function () {
			this.iCounter = 0;
			var oView = this.getView();
			this._data.push(
				new Promise(function (resolve, reject) {
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

				new Promise(function (resolve, reject) {
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

			//TO scroll to Vertical Layout - Causes Flicker
			//var oView = this.getView()
			//jQuery.sap.delayedCall(ObjectPageLayout.HEADER_CALC_DELAY + 1, this, function() {
			//	oView.byId("page").scrollToElement(oView.byId("OutsideObjectPageForm"));
			//	oView.byId("page").setEnableScrolling(false);
			//});
		},

		_getUrlParameter: function (sParam) {
			var sReturn = "";
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) {
					sReturn = sParameterName[1];
				}
			}
			return sReturn;
		},

		switchToAdaptionMode: function () {

			if (this.getView().getModel("app").getProperty("/showAdaptButton"))	{

				jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
				var oRta = new RuntimeAuthoring({
					rootControl: this.getOwnerComponent().getAggregation("rootControl"),
					flexSettings: {
						developerMode: false
					}
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			}
		},

		createChanges: function(oEvent) {
			var oButton = oEvent.getSource();
			var oAppComponent = Utils.getAppComponentForControl(sap.ui.core.Component.getOwnerComponentFor(this.getView()));
			var oModel = oAppComponent.getModel("$FlexVariants");

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
					onClose: function(oAction) {
						if (oAction === "YES") {
							if (this.iCounter === 0) {
								var mBaseChangeData1  = {
									changeType: "moveControls",
									movedElements: [{
										"id": oAppComponent.createId("idMain1--ObjectPageSectionWithForm"),
										"sourceIndex": 0,
										"targetIndex": 1
									}],
									source: {
										"id": oAppComponent.createId("idMain1--ObjectPageLayout"),
										"aggregation": "sections"
									},
									target: {
										"id": oAppComponent.createId("idMain1--ObjectPageLayout"),
										"aggregation": "sections"
									}
								};
								var mBaseChangeData2  = {
									changeType: "rename",
									renamedElement: {
										id: oAppComponent.createId("idMain1--ObjectPageSectionWithForm")
									},
									value : "Personalization Test"
								};

								var oMoveChange = oModel.oFlexController.createChange(
									jQuery.extend(mChangeSpecificData, mBaseChangeData1),
									sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageLayout")),
									oAppComponent);
								var oRenameChange = oModel.oFlexController.createChange(
									jQuery.extend(mChangeSpecificData, mBaseChangeData2),
									sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageSectionWithForm")),
									oAppComponent);

								oModel.addControlChangesToVariant([oMoveChange, oRenameChange], oAppComponent.createId("idMain1--variantManagementOrdersTable"));

								this.iCounter++;
							} else if (this.iCounter === 1) {
								var mBaseChangeData3  = {
									changeType: "rename",
									renamedElement: {
										id: oAppComponent.createId("idMain1--ObjectPageSectionWithForm")
									},
									value : "Personalization Test (2. Change)"
								};

								var oRenameChange2 = oModel.oFlexController.createChange(
									jQuery.extend(mChangeSpecificData, mBaseChangeData3),
									sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageSectionWithForm")),
									oAppComponent);

								oModel.addControlChangesToVariant([oRenameChange2], oAppComponent.createId("idMain1--variantManagementOrdersTable"));

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
