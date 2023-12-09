
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/StateUtil",
	"test-resources/sap/ui/mdc/qunit/util/V4ServerHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function(Element, Controller, Fragment, Library, StateUtil, V4ServerHelper, ODataModel) {
	"use strict";
	return Controller.extend("view.Main", {

		onInit: function () {
			const oParams = new URLSearchParams(window.location.search);
			const sSubView = oParams.get("view") || "Explicit";

			const mViews = {
				Explicit: "AppUnderTestTable.view.Explicit",
				Implicit: "AppUnderTestTable.view.Implicit",
				Transient: "AppUnderTestTable.view.Transient",
				AutoImplicit: "AppUnderTestTable.view.AutoImplicit",
				State: "AppUnderTestTable.view.State"
			};

			V4ServerHelper.requestServerURLForTenant("MDCTableP13nOpaTestApplication", true).then(function(tenantBaseUrl) {

				const oModel = new ODataModel({
					serviceUrl: tenantBaseUrl + "music/",
					groupId: "$direct",
					autoExpandSelect: true,
					operationMode: "Server"
				 });

				 this.getView().setModel(oModel);
				 this.setFragment(mViews[sSubView]);
			 }.bind(this));
		},

		setFragment: function (sFragment) {
			const oPage = this.getView().byId('FlexTestPage');
			Fragment.load({
				name: sFragment,
				controller: this
			}).then(function name(oFragment) {
				oPage.addContent(oFragment);
			});
		},

		onPressRTA: function() {
			const oOwnerComponent = this.getOwnerComponent();
			Library.load({name: "sap/ui/rta"}).then(function () {
				sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
					startKeyUserAdaptation({
						rootControl: oOwnerComponent.getAggregation("rootControl")
					});
				});
			});
		},

		onRetrieveState: function(oEvent) {
			const oControl =  Element.getElementById(oEvent.getSource().getId() == "tblRetrieve" ? "IDTableOfInternalSampleApp_01" : "IDFilterBar");
			if (oControl) {
				StateUtil.retrieveExternalState(oControl).then(function(oState) {
					const oOutput = Element.getElementById("CEState");
					if (oOutput) {
						oOutput.setValue(JSON.stringify(oState, null, "  "));
					}
				});
			}
		},

		onApplyState: function(oEvt) {
			const oControl =  Element.getElementById(oEvt.getSource().getId() == "tblApply" ? "IDTableOfInternalSampleApp_01" : "IDFilterBar");
			const oCE = Element.getElementById("CEState");
			let oState;
			if (oCE) {
				oState = JSON.parse(oCE.getValue());
			}
			if (oControl) {
				StateUtil.applyExternalState(oControl, oState).then(function(){

				});
			}
		}

	});
});
