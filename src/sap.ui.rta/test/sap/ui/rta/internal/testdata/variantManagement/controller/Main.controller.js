sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/rta/api/startKeyUserAdaptation"
], function(
	Log,
	MessageBox,
	Controller,
	LayerUtils,
	ControlPersonalizationWriteAPI,
	startKeyUserAdaptation
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.variantManagement.controller.Main", {
		_data: [],

		onInit: function() {
			this.iCounter = 0;
			var oView = this.getView();
			oView.addStyleClass("sapUiSizeCompact");
			this._data.push(
				new Promise(function(resolve) {
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

				new Promise(function(resolve) {
					if (oView.byId("MainForm")) {
						oView.byId("MainForm").bindElement({
							path: "/EntityTypes2(EntityType02_Property01='EntityType02Property01Value')",
							events: {
								dataReceived: resolve
							},
							parameters: {
								expand: "to_EntityType02Nav"
							}
						});
					} else {
						resolve();
					}
				})
			);
		},

		switchToAdaptionMode: function() {
			startKeyUserAdaptation({rootControl: this.getOwnerComponent()});
		},

		createChanges: function(oEvent) {
			var oButton = oEvent.getSource();
			var mChangeSpecificData = {};

			Object.assign(mChangeSpecificData, {
				developerMode: false,
				layer: LayerUtils.getCurrentLayer()
			});

			MessageBox.confirm("Do you want to create personalization changes?", {
				onClose: function(oAction) {
					if (oAction === MessageBox.Action.OK) {
						// there need to be some controls available in order to create the changes
						if (!this.byId("ObjectPageLayout") || !this.byId("ObjectPageSectionWithSmartForm")) {
							Log.error("No changes created, Controls missing.");
							return;
						}

						if (this.iCounter === 0) {
							// on first press of "Personalization Changes button"
							// add dirty changes2
							// change1: move sections with simple form
							var oMoveChangeData = {
								selectorElement: this.byId("ObjectPageLayout"),
								changeSpecificData: {
									changeType: "moveControls",
									movedElements: [{
										id: this.createId("ObjectPageSectionWithForm"),
										sourceIndex: 0,
										targetIndex: 1
									}],
									source: {
										id: this.createId("ObjectPageLayout"),
										aggregation: "sections"
									},
									target: {
										id: this.createId("ObjectPageLayout"),
										aggregation: "sections"
									}
								}
							};
							// change2: remove section with smart form
							var oRemoveChangeData = {
								selectorElement: this.byId("ObjectPageSectionWithSmartForm"),
								changeSpecificData: {
									changeType: "stashControl"
								}
							};
							ControlPersonalizationWriteAPI.add({changes: [oMoveChangeData, oRemoveChangeData]});
							this.iCounter++;
						} else if (this.iCounter === 1) {
							// on second press of "Personalization Changes button"
							var oMoveChangeData2 = {
								selectorElement: this.byId("ObjectPageLayout"),
								changeSpecificData: {
									changeType: "moveControls",
									movedElements: [{
										id: this.createId("ObjectPageSectionWithVM"),
										sourceIndex: 2,
										targetIndex: 0
									}],
									source: {
										id: this.createId("ObjectPageLayout"),
										aggregation: "sections"
									},
									target: {
										id: this.createId("ObjectPageLayout"),
										aggregation: "sections"
									}
								}
							};

							ControlPersonalizationWriteAPI.add({changes: [oMoveChangeData2]});

							oButton.setEnabled(false);
							this.iCounter++;
						}
					}
				}.bind(this)
			});
		},

		isDataReady: function() {
			return Promise.all(this._data);
		}
	});
});
