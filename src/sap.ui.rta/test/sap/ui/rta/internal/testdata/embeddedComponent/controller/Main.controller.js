sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/m/MessageBox",
	"sap/ui/core/Component"
], function(
	Controller,
	MockServer,
	ResourceModel,
	ODataModel,
	JSONModel,
	RuntimeAuthoring,
	Utils,
	ControlPersonalizationAPI,
	MessageBox,
	Component
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.embeddedComponent.controller.Main", {
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
					oView.byId("page").bindElement({
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

		onComponentCreated: function(oEvent) {
			var oComponentContainer = oEvent.getSource();
			var oModel = oComponentContainer .getModel();
			oComponentContainer.getComponentInstance().setModel(oModel);
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

			if (this.getView().getModel("app").getProperty("/showOuterAdaptButton"))	{

				var oRta = new RuntimeAuthoring({
					rootControl: this.getOwnerComponent(),
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
			var oAppComponent = Utils.getAppComponentForControl(Component.getOwnerComponentFor(this.getView()));
			var mChangeSpecificData = {};

			jQuery.extend(mChangeSpecificData, {
				developerMode: false,
				layer: Utils.getCurrentLayer()
			});

			MessageBox.show(
				"Do you want to create personalization changes?", {
					icon: MessageBox.Icon.INFORMATION,
					title: "Personalization Dialog",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function(oAction) {
						if (oAction === "YES") {
							if (this.iCounter === 0) {
								var mMoveChangeData  = {
									selectorControl : sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageLayout")),
									changeSpecificData: {
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
									}
								};
								var mRenameChangeData1  = {
									selectorControl : sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageSectionWithForm")),
									changeSpecificData: {
										changeType: "rename",
										renamedElement: {
											id: oAppComponent.createId("idMain1--ObjectPageSectionWithForm")
										},
										value : "Personalization Test"
									}
								};
								var mRenameChangeData2  = {
									selectorControl : sap.ui.getCore().byId(oAppComponent.createId("idMain1--TitleForVM1")),
									changeSpecificData: {
										changeType: "rename",
										renamedElement: {
											id: oAppComponent.createId("idMain1--TitleForVM1")
										},
										value : "Change for the inner variant"
									}
								};
								ControlPersonalizationAPI.addPersonalizationChanges([mMoveChangeData, mRenameChangeData1, mRenameChangeData2]);

								this.iCounter++;
							} else if (this.iCounter === 1) {
								var mRenameChangeData3  = {
									selectorControl : sap.ui.getCore().byId(oAppComponent.createId("idMain1--ObjectPageSectionWithForm")),
									changeSpecificData: {
										changeType: "rename",
										renamedElement: {
											id: oAppComponent.createId("idMain1--ObjectPageSectionWithForm")
										},
										value : "Personalization Test (2. Change)"
									}
								};
								ControlPersonalizationAPI.addPersonalizationChanges([mRenameChangeData3]);

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
