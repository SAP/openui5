sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/ManifestResolver",
	"sap/ui/integration/library",
	"sap/ui/integration/Host",
	"sap/m/MessageToast"
], function (Controller, JSONModel, ManifestResolver, library, Host, MessageToast) {
	"use strict";

	var Submit = library.CardActionType.Submit;

	return Controller.extend("sap.f.cardsdemo.controller.StateChangedEvent", {

		onInit: function () {
			var oHost = new Host();
			oHost.getContextValue = function (sPath) {
				return new Promise(function (resolve, reject) {
					setTimeout(function () {
						if (sPath === "cardExplorer/stateChangedEvent/country") {
							resolve("France");
							return;
						}
						reject("Host context parameter " + sPath + " doesn't exist");
					}, 1000);
				});
			};
			this.byId("card1").setHost(oHost);

			var aManifests = [
				{
					key: "filter",
					text: "Filter example",
					path: "cardcontent/mobileSdk/filter.json"
				},
				{
					key: "form",
					text: "Form example",
					path: "cardcontent/mobileSdk/form.json"
				}
			];
			this._setModel({
				manifests: aManifests,
				selectedKey: aManifests[1].key,
				selectedManifest: aManifests[1].path
			});
		},

		_setModel: function (oData) {
			this.getView().setModel(new JSONModel(oData), "stateChangedEventPage"); // explicitly set model name because cards cant access the default unnamed model
		},

		_getModel: function () {
			return this.getView().getModel("stateChangedEventPage");
		},

		onStateChanged: function () {
			MessageToast.show("State changed", {
				duration: 1000
			});

			this.resolveManifest();
		},

		resolveManifest: function () {
			var oCard = this.byId("card1"),
				oCodeEditor = this.byId("output");

			ManifestResolver.resolveCard(oCard).then(function (oRes) {
				oCodeEditor.setValue(JSON.stringify(oRes, null, "\t"));
			});
		},

		onChangeManifest: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();

			var oManifest = this._getModel().getProperty("/manifests").find(function (oManifestData) {
				return sKey === oManifestData.key;
			});

			this._getModel().setProperty("/selectedManifest", oManifest.path);
		},

		onRefresh: function () {
			this.byId("card1").refresh();
		},

		onRefreshData: function () {
			this.byId("card1").refreshData();
		},

		onPreviousPage: function () {
			var oCard = this.byId("card1");
			oCard.getCardFooter().getPaginator().previous();
		},

		onNextPage: function () {
			var oCard = this.byId("card1");
			oCard.getCardFooter().getPaginator().next();
		},

		onChangeSelectFilter: function () {
			var oCard = this.byId("card1");
			oCard.setFilterValue("shipper", "2");
		},

		onInitialSelectFilter: function () {
			var oCard = this.byId("card1");
			oCard.setFilterValue("shipper", "3");
		},

		onSimulateLiveInput: function () {
			var oCard = this.byId("card1");
			var iTimerDelay = 1000;

			this.byId("output").getInternalEditorInstance().scrollToLine(Infinity); // scroll to last

			setTimeout(function() {
				var aFirstUpdate = [{
					"id": "activity",
					"key": "activity2"
				}];
				oCard.setFormValues(aFirstUpdate);
			}, iTimerDelay);

			function fnWrite(sText) {
				var aSecondUpdate = [{
					"id": "email",
					"value": sText
				}];
				oCard.setFormValues(aSecondUpdate);
			}

			var sInput;
			var iKeyboardTypingDelay = 40;
			iTimerDelay = 2000;
			var sText = "address".repeat(3) + "@sap.com";
			for (var i = 1; i <= sText.length; i++) {
				sInput = sText.substring(0, i);

				setTimeout(fnWrite, iTimerDelay, sInput);
				iTimerDelay = iTimerDelay + iKeyboardTypingDelay;
			}
		},

		onEnterValidInput: function () {
			var oCard = this.byId("card1");

			oCard.setFormValues([{
				"id": "activity",
				"key": "activity2"
			},{
				"id": "notes",
				"value": "1. first \n2. second"
			}, {
				"id": "email",
				"value": "testaddress@sap.com"
			}]);
		},

		onEnterInvalidInput: function () {
			var oCard = this.byId("card1");

			oCard.setFormValues([{
				"id": "activity",
				"value": "invalid value"
			},{
				"id": "notes",
				"value": ""
			}, {
				"id": "email",
				"value": "no"
			}]);
		},

		onSimulateSubmit: function () {
			var oCard = this.byId("card1");
			oCard.triggerAction({ type: Submit });
		}

	});
});