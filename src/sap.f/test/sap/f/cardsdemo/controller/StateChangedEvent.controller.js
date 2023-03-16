sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/library",
	"sap/ui/integration/Host",
	"sap/m/MessageToast"
], function (Controller, JSONModel, SkeletonCard, library, Host, MessageToast) {
	"use strict";

	var Submit = library.CardActionType.Submit;

	return Controller.extend("sap.f.cardsdemo.controller.StateChangedEvent", {

		onInit: function () {
			this._oSkeletonCard = new SkeletonCard({
				stateChanged: this.onStateChanged.bind(this)
			});

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
			this.byId("demoCard").setHost(oHost);
			this._oSkeletonCard.setHost(oHost);

			var aManifests = [
				{
					key: "filter",
					text: "Filter example",
					path: sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/mobileSdk/filter.json")
				},
				{
					key: "form",
					text: "Form example",
					path: sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/mobileSdk/form.json")
				},
				{
					key: "calendar",
					text: "Calendar example",
					path: sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/mobileSdk/calendar.json")
				},
				{
					key: "calendarExtended",
					text: "Calendar example with extension",
					path: sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/mobileSdk/calendarExtension/manifest.json")
				}
			];

			this._setModel({
				manifests: aManifests,
				selectedKey: aManifests[1].key,
				selectedManifest: aManifests[1].path
			});

			this._oSkeletonCard.setManifest(aManifests[1].path);
			this._oSkeletonCard.startManifestProcessing();
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

		onChangeDate: function () {
			var oCard = this.byId("demoCard");

			if (this._oChangedDate && this._oChangedDate.getDate() === 13) {
				this._oChangedDate = new Date(2019, 8, 18);
			} else {
				this._oChangedDate = new Date(2019, 8, 13);
			}

			this._oSkeletonCard.getCardContent().changeDate(this._oChangedDate);
			oCard.getCardContent().changeDate(this._oChangedDate);
		},

		onChangeMonth: function () {
			var oCard = this.byId("demoCard");

			if (this._oViewedMonth && this._oViewedMonth === 7) {
				this._oViewedMonth = 8;
			} else {
				this._oViewedMonth = 7;
			}

			this._oSkeletonCard.getCardContent().changeMonth(this._oViewedMonth);
			oCard.getCardContent().changeMonth(this._oViewedMonth);
		},

		resolveManifest: function () {
			var oCodeEditor = this.byId("output");

			this._oSkeletonCard.resolveManifest()
				.then(function (oRes) {
					oCodeEditor.setValue(JSON.stringify(oRes, null, "\t"));
				});
		},

		onChangeManifest: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();

			var oManifest = this._getModel().getProperty("/manifests").find(function (oManifestData) {
				return sKey === oManifestData.key;
			});

			this._getModel().setProperty("/selectedManifest", oManifest.path);

			this._oSkeletonCard.setManifest(oManifest.path);
			this._oSkeletonCard.startManifestProcessing();
		},

		onRefresh: function () {
			this._oSkeletonCard.refresh();
			this.byId("demoCard").refresh();
		},

		onRefreshData: function () {
			this._oSkeletonCard.refreshData();
			this.byId("demoCard").refreshData();
		},

		onPreviousPage: function () {
			this._oSkeletonCard.getCardFooter().getPaginator().previous();
			this.byId("demoCard").getCardFooter().getPaginator().previous();
		},

		onNextPage: function () {
			this._oSkeletonCard.getCardFooter().getPaginator().next();
			this.byId("demoCard").getCardFooter().getPaginator().next();
		},

		onChangeSelectFilter: function () {
			this._oSkeletonCard.setFilterValue("shipper", "2");
			this.byId("demoCard").setFilterValue("shipper", "2");
		},

		onInitialSelectFilter: function () {
			this._oSkeletonCard.setFilterValue("shipper", "3");
			this.byId("demoCard").setFilterValue("shipper", "3");
		},

		onSimulateLiveInput: function () {
			var oCard = this.byId("demoCard");
			var iTimerDelay = 1000;

			this.byId("output").getInternalEditorInstance().scrollToLine(Infinity); // scroll to last

			setTimeout(function() {
				var aFirstUpdate = [{
					"id": "activity",
					"key": "activity2"
				}];
				this._oSkeletonCard.setFormValues(aFirstUpdate);
				oCard.setFormValues(aFirstUpdate);
			}.bind(this), iTimerDelay);

			function fnWrite(sText) {
				var aSecondUpdate = [{
					"id": "email",
					"value": sText
				}];
				this._oSkeletonCard.setFormValues(aSecondUpdate);
				oCard.setFormValues(aSecondUpdate);
			}

			var sInput;
			var iKeyboardTypingDelay = 40;
			iTimerDelay = 2000;
			var sText = "address".repeat(3) + "@sap.com";
			for (var i = 1; i <= sText.length; i++) {
				sInput = sText.substring(0, i);

				setTimeout(fnWrite.bind(this), iTimerDelay, sInput);
				iTimerDelay = iTimerDelay + iKeyboardTypingDelay;
			}
		},

		onEnterValidInput: function () {
			var aFormValues = [{
				"id": "activity",
				"key": "activity2"
			},{
				"id": "notes",
				"value": "1. first \n2. second"
			}, {
				"id": "email",
				"value": "testaddress@sap.com"
			}];

			this._oSkeletonCard.setFormValues(aFormValues);
			this.byId("demoCard").setFormValues(aFormValues);
		},

		onEnterInvalidInput: function () {
			var aFormValues = [{
				"id": "activity",
				"value": "invalid value"
			},{
				"id": "notes",
				"value": ""
			}, {
				"id": "email",
				"value": "no"
			}];

			this._oSkeletonCard.setFormValues(aFormValues);
			this.byId("demoCard").setFormValues(aFormValues);
		},

		onSimulateSubmit: function () {
			this._oSkeletonCard.triggerAction({ type: Submit });
			this.byId("demoCard").triggerAction({ type: Submit });
		}

	});
});