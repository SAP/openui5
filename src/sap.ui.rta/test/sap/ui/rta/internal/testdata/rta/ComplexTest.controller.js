sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/json/JSONModel"
], function(
	Controller,
	MockServer,
	ODataModel,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.ComplexTest", {

		onInit : function () {
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/");
			var sManifestUrl = this._sResourcePath + "/manifest.json";
			var oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data;
			var oUriParameters = jQuery.sap.getUriParameters();

			var iAutoRespond = (oUriParameters.get("serverDelay") || 1000);
			var oMockServer;
			var dataSource;
			var sMockServerPath;
			var sMetadataUrl;
			var aEntities = [];
			var oDataSources = oManifest["sap.app"]["dataSources"];

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: iAutoRespond
			});

			for (var property in oDataSources) {
				if (oDataSources.hasOwnProperty(property)) {
					dataSource = oDataSources[property];

					//do we have a mock url in the app descriptor
					if (dataSource.settings && dataSource.settings.localUri) {
						if (typeof dataSource.type === "undefined" || dataSource.type === "OData") {
							oMockServer = new MockServer({
								rootUri: dataSource.uri
							});
							sMetadataUrl = this._sResourcePath + dataSource.settings.localUri;
							sMockServerPath = sMetadataUrl.slice(0, sMetadataUrl.lastIndexOf("/") + 1);
							aEntities = dataSource.settings.aEntitySetsNames ? dataSource.settings.aEntitySetsNames : [];
							oMockServer.simulate(sMetadataUrl, {
								sMockdataBaseUrl: sMockServerPath,
								bGenerateMissingMockData: true,
								aEntitySetsNames : aEntities
							});
						}
						//else if *Other types can be inserted here, like Annotations*
						oMockServer.start();
						jQuery.sap.log.info("Running the app with mock data for " + property);

						if (property === "mainService") {
							var oModel;
							var oView;

							oModel = new ODataModel(dataSource.uri, {
								json: true,
								loadMetadataAsync: true
							});

							oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
							oModel.setCountSupported(false);
							this._oModel = oModel;

							oView = this.getView();
							oView.setModel(oModel);

							var data = {
								readonly: false,
								mandatory: false,
								visible: true,
								enabled: true
							};

							var oStateModel = new JSONModel();
							oStateModel.setData(data);
							oView.setModel(oStateModel, "state");
							oView.bindElement("/Headers(AccountingDocument='100015012',CompanyCode='0001',FiscalYear='2015')");
						} else if (property === "smartFilterService") {
							//smartfilterbar bind
							var oSmartFilterModel = new ODataModel("/foo", true);
							oSmartFilterModel.setCountSupported(false);
							var oSmartFilterLayout = this.byId("smartFilterLayout");
							if (oSmartFilterLayout) {
								oSmartFilterLayout.unbindElement();
								oSmartFilterLayout.setModel(oSmartFilterModel);
							}
						}
					} else {
						jQuery.sap.log.error("Running the app with mock data for " + property);
					}
				}
			}
		},

		toggleUpdateMode: function() {
			var oSmartFilterbar = this.byId("smartFilterBar");
			var oButton = this.byId("toggleUpdateMode");

			if (!oSmartFilterbar || !oButton) {
				return;
			}

			var bLiveMode = oSmartFilterbar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}

			oSmartFilterbar.setLiveMode(!bLiveMode);
		},

		_setButtonText: function() {
			var oSmartFilterbar = this.byId("smartFilterBar");
			var oButton = this.byId("toggleUpdateMode");

			if (!oSmartFilterbar || !oButton) {
				return;
			}

			var bLiveMode = oSmartFilterbar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}
		},

		_getUrlParameter : function(sParam) {
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

		_undoRedoStack : function(oStack) {
			function undo(oStack) {
				if (oStack.canUndo()) {
					return oStack.undo().then(function() {
						return undo(oStack);
					});
				}
				return Promise.resolve();
			}
			function redo(oStack) {
				if (oStack.canRedo()) {
					return oStack.redo().then(function() {
						return redo(oStack);
					});
				}
				return Promise.resolve();
			}

			undo(oStack)
				.then(function() {
					sap.m.MessageToast.show("All changes undone", {duration : 1000});

					return redo(oStack);
				})
				.then(function() {
					sap.m.MessageToast.show("All changes redone", {duration : 1000});
				});
		},

		switchToAdaptionMode : function() {
			sap.ui.require([
				"sap/ui/rta/RuntimeAuthoring",
				"sap/ui/rta/command/Stack",
				"sap/ui/fl/FakeLrepLocalStorage",
				"sap/m/MessageToast"
			], function(
				RuntimeAuthoring,
				Stack,
				FakeLrepLocalStorage,
				MessageToast
			) {
				var aFileNames = [];

				FakeLrepLocalStorage.getChanges().forEach(function(oChange) {
					if (
						oChange.fileType !== "ctrl_variant_change" &&
						oChange.fileType !== "ctrl_variant" &&
						oChange.fileType !== "ctrl_variant_management_change" &&
						oChange.projectId === "sap.ui.rta.test"
					) {
						aFileNames.push(oChange.fileName);
					}
				});

				Stack.initializeWithChanges(sap.ui.getCore().byId("Comp1---idMain1"), aFileNames)
				.then(function(oStack) {
					//expose undo/redo test function to console
					window.undoRedoStack = this._undoRedoStack.bind(this, oStack);

					var oRta = new RuntimeAuthoring({
						rootControl : this.getOwnerComponent(),
						commandStack: oStack,
						flexSettings: {
							developerMode: false
						}
					});
					oRta.attachEvent('stop', function() {
						oRta.destroy();
					});
					oRta.attachEvent('start', function() {
						MessageToast.show("Rta is started with all changes from local storage added to the command stack. Undo might already by enabled.\n To test the visual editor usage of our stack, there is a undoRedoStack() function in console available", {duration : 10000});
					});

					oRta.start();
				}.bind(this));
			}.bind(this));
		},

		openSmartFormDialog : function() {
			sap.ui.require([
				"sap/ui/core/mvc/XMLView",
				"sap/m/Dialog"
			], function(
				XMLView,
				Dialog
			) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oDialog || !sap.ui.getCore().byId(this._oDialog.getId())) {
						this._oDialogForm = sap.ui.xmlfragment(this.getView().createId("SmartFormDialog"), "sap.ui.rta.test.fragment.Popup", {});

						this._oDialog = new Dialog({
							id: oComponent.createId("SmartFormDialog"),
							showHeader: false,
							content: this._oDialogForm,
							contentHeight: "85%"
						});
						this.getView().addDependent(this._oDialog);

						this._oDialog.removeStyleClass("sapUiPopupWithPadding");
						this._oDialog.addStyleClass("sapUiSizeCompact");
					}
					this._oDialog.open();
				}.bind(this));
			}.bind(this));
		},

		createOrDeleteContent : function(oEvent) {
			var oTargetControl = oEvent.getSource();
			sap.ui.require([
				"sap/ui/core/mvc/XMLView",
				"sap/m/Dialog",
				"sap/ui/comp/smartform/SmartForm",
				"sap/ui/comp/smartform/Group",
				"sap/ui/comp/smartform/GroupElement",
				"sap/ui/comp/smartfield/SmartField"
			], function(
				XMLView,
				Dialog,
				SmartForm,
				Group,
				GroupElement,
				SmartField
			) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oDialog || !sap.ui.getCore().byId(this._oDialog.getId())) {
						this._oDialogForm = new XMLView(
							this.getView().createId("SmartFormDialog"),
							{
								viewName: "sap.ui.rta.test.Popup"
							}
						);

						this._oDialog = new Dialog({
							id: oComponent.createId("SmartFormDialog"),
							showHeader: false,
							content: this._oDialogForm
						});
						this.getView().addDependent(this._oDialog);

						this._oDialog.removeStyleClass("sapUiPopupWithPadding");
						this._oDialog.addStyleClass("sapUiSizeCompact");
					}
					this._oDialog.open();
				}.bind(this));

				if (this.byId("newForm")) {
					this.byId("newForm").destroy();
				} else {
					var oLayout = oTargetControl.getParent();
					var oSmartForm = new SmartForm(this.getView().createId("newForm"), {
						groups: [
							new Group("newGroup", {
								groupElements: [
									new GroupElement("newGroupElement0", {
										elements: [
											new SmartField("smartField0", {
												value: "{CreatedByUserName}"
											})
										]
									}),
									new GroupElement("newGroupElement1", {
										elements: [
											new SmartField("smartField1", {
												value: "{CompanyAdress}"
											})
										],
										visible: false
									}),
									new GroupElement("newGroupElement2", {
										elements: [
											new SmartField("smartField2", {
												value: "{ExpirationDate}"
											})
										],
										visible: false
									}),
									new GroupElement("newGroupElement3", {
										elements: [
											new SmartField("smartField3", {
												value: "{ValidityFrom}"
											})
										],
										visible: false
									})
								]
							})
						]
					});
					oLayout.insertContent(oSmartForm, 3);
				}
			}.bind(this));
		},

		openSmartFormPopover : function(oEvent) {
			var oTargetButton = oEvent.getSource();
			return sap.ui.require([
				"sap/m/Popover"
			], function(Popover) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oPopover || !sap.ui.getCore().byId(this._oPopover.getId())) {
						this._oPopoverForm = sap.ui.xmlfragment(this.getView().createId("FormPopover"), "sap.ui.rta.test.fragment.Popup", {});

						this._oPopover = new Popover({
							id: oComponent.createId("SmartFormPopover"),
							showHeader: false,
							content: this._oPopoverForm
						});
						this.getView().addDependent(this._oPopover);

						this._oPopover.removeStyleClass("sapUiPopupWithPadding");
						this._oPopover.addStyleClass("sapUiSizeCompact");
					}
					this._oPopover.openBy(oTargetButton);
				}.bind(this));
			}.bind(this));
		}
	});
});

