(function(){
	"use strict";

	sap.ui.controller("sap.ui.rta.test.ComplexTest", {

		onInit : function () {

			jQuery.sap.require("sap.ui.core.util.MockServer");
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/");
			var sManifestUrl = this._sResourcePath + "/manifest.json",
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oUriParameters = jQuery.sap.getUriParameters();

			var iAutoRespond = (oUriParameters.get("serverDelay") || 1000),
				oMockServer, dataSource, sMockServerPath, sMetadataUrl, aEntities = [],
				oDataSources = oManifest["sap.app"]["dataSources"],
				MockServer = sap.ui.core.util.MockServer;

			sap.ui.core.util.MockServer.config({
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
							oMockServer.simulate(sMetadataUrl , {
								sMockdataBaseUrl: sMockServerPath,
								bGenerateMissingMockData: true,
								aEntitySetsNames : aEntities
							});
						}
						//else if *Other types can be inserted here, like Annotations*
						oMockServer.start();
						jQuery.sap.log.info("Running the app with mock data for " + property);

						if (property === "mainService") {
							var oModel, oView;

							oModel = new sap.ui.model.odata.ODataModel(dataSource.uri, {
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

							var oStateModel = new sap.ui.model.json.JSONModel();
							oStateModel.setData(data);
							oView.setModel(oStateModel, "state");
							oView.bindElement("/Headers(AccountingDocument='100015012',CompanyCode='0001',FiscalYear='2015')");

						} else if (property === "smartFilterService") {
							//smartfilterbar bind
							var oSmartFilterModel = new sap.ui.model.odata.ODataModel("/foo", true);
							oSmartFilterModel.setCountSupported(false);
							var oSmartFilterLayout = this.byId("smartFilterLayout");
							oSmartFilterLayout.unbindElement();
							oSmartFilterLayout.setModel(oSmartFilterModel);
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

		_getUrlParameter : function(sParam){
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

		switchToAdaptionMode : function() {

			jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
			var oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : sap.ui.getCore().byId("Comp1---idMain1"),
				customFieldUrl : this._sResourcePath + "/testdata/rta/CustomField.html",
				showCreateCustomField : (this._getUrlParameter("sap-ui-xx-ccf") == "true"),
				flexSettings: {
					developerMode: false
				}
			});
			oRta.attachEvent('stop', function() {
				oRta.destroy();
			});
			oRta.start();
		},

		openSmartFormDialog : function() {
			var oComponent = this.getOwnerComponent();
			oComponent.runAsOwner(function() {
				if (!this._oDialog || !sap.ui.getCore().byId(this._oDialog.getId())) {
					this._oDialogForm = sap.ui.xmlfragment(this.getView().createId("SmartFormDialog"), "sap.ui.rta.test.fragment.Popup", {});

					this._oDialog = new sap.m.Dialog({
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
		},

		createOrDeleteContent : function(oEvent) {
			if (this.byId("newForm")) {
				this.byId("newForm").destroy();
			} else {
				var oLayout = oEvent.getSource().getParent();
				var oSmartForm = new sap.ui.comp.smartform.SmartForm(this.getView().createId("newForm"), {
					groups: [
						new sap.ui.comp.smartform.Group("newGroup", {
							groupElements: [
								new sap.ui.comp.smartform.GroupElement("newGroupElement0", {
									elements: [
										new sap.ui.comp.smartfield.SmartField("smartField0", {
											value: "{CreatedByUserName}"
										})
									]
								}),
								new sap.ui.comp.smartform.GroupElement("newGroupElement1", {
									elements: [
										new sap.ui.comp.smartfield.SmartField("smartField1", {
											value: "{CompanyAdress}"
										})
									],
									visible: false
								}),
								new sap.ui.comp.smartform.GroupElement("newGroupElement2", {
									elements: [
										new sap.ui.comp.smartfield.SmartField("smartField2", {
											value: "{ExpirationDate}"
										})
									],
									visible: false
								}),
								new sap.ui.comp.smartform.GroupElement("newGroupElement3", {
									elements: [
										new sap.ui.comp.smartfield.SmartField("smartField3", {
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
		},

		openSmartFormPopover : function(oEvent) {
			var oComponent = this.getOwnerComponent();
			oComponent.runAsOwner(function() {
				if (!this._oPopover || !sap.ui.getCore().byId(this._oPopover.getId())) {
					this._oPopoverForm = sap.ui.xmlfragment(this.getView().createId("FormPopover"), "sap.ui.rta.test.fragment.Popup", {});

					this._oPopover = new sap.m.Popover({
						id: oComponent.createId("SmartFormPopover"),
						showHeader: false,
						content: this._oPopoverForm
					});
					this.getView().addDependent(this._oPopover);

					this._oPopover.removeStyleClass("sapUiPopupWithPadding");
					this._oPopover.addStyleClass("sapUiSizeCompact");
				}
				this._oPopover.openBy(oEvent.getSource());
			}.bind(this));
		}
	});
})();

