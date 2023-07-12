sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/library",
	"sap/ui/integration/Host",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/unified/calendar/CalendarUtils",
	"sap/ui/unified/calendar/CalendarDate"

], function (Controller, JSONModel, SkeletonCard, library, Host, MessageToast, oCore, CalendarUtils, CalendarDate) {
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
				selectedManifest: aManifests[1].path,
				messageStripVisible: false
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
			var oCard = this.byId("demoCard"),
				oChangeDateButton = oCore.byId("cardsplayground---stateChangedEvent--dateChangeButton"),
				oChangeDateButton2 = oCore.byId("cardsplayground---stateChangedEvent--dateChangeButton2"),
				iFirstDateIndex = 13,
				iSecondDateIndex = 18,
				iSeptemberIndex = 8,
				iYear = 2019,
				sFirstDateText = "13th",
				sSecondDateText = "18th",

				sUnselectedDateName;


			if (this._oChangedDate && this._oChangedDate.getDate() === iFirstDateIndex) {
				this._oChangedDate = new Date(iYear, iSeptemberIndex, iSecondDateIndex);
				sUnselectedDateName = sFirstDateText;
			} else {
				this._oChangedDate = new Date(iYear, iSeptemberIndex, iFirstDateIndex);
				sUnselectedDateName = sSecondDateText;
			}

			this._oSkeletonCard.getCardContent().changeDate(this._oChangedDate);
			oCard.getCardContent().changeDate(this._oChangedDate);

			if (oChangeDateButton) {
				oChangeDateButton.setText("Change date to " + sUnselectedDateName);
			}
			if (oChangeDateButton2) {
				oChangeDateButton2.setText("Change date to " + sUnselectedDateName);
			}
		},

		onChangeMonth: function () {
			var iSeptemberIndex = 8,
				iAugustIndex = 7,
				sSeptemberName = "September",
				sAugustName = "August",
				oCard = this.byId("demoCard"),
				oChangeMonthButton = oCore.byId('cardsplayground---stateChangedEvent--monthChangeButton'),
				oChangeMonthButton2 = oCore.byId('cardsplayground---stateChangedEvent--monthChangeButton2'),
				sUnselectedMonthName;


			if (this._oViewedMonth && this._oViewedMonth === iAugustIndex) {
				this._oViewedMonth = iSeptemberIndex;
				sUnselectedMonthName = sAugustName;
			} else {
				this._oViewedMonth = iAugustIndex;
				sUnselectedMonthName = sSeptemberName;
			}

			this._oSkeletonCard.getCardContent().changeMonth(this._oViewedMonth);
			oCard.getCardContent().changeMonth(this._oViewedMonth);

			if (oChangeMonthButton) {
				oChangeMonthButton.setText("Change month to " + sUnselectedMonthName);
			}
			if (oChangeMonthButton2) {
				oChangeMonthButton2.setText("Change month to " + sUnselectedMonthName);
			}

			var oFocusedDate = new Date(2019, this._oViewedMonth, 15),
				oCalFocusedDate = CalendarDate.fromLocalJSDate(oFocusedDate),
				oCalFirstRenderedDate = CalendarUtils._getFirstDateOfWeek(CalendarUtils._getFirstDateOfMonth(oCalFocusedDate)),
				oCalLastDateInMonth = new CalendarDate(oFocusedDate.getFullYear(), oFocusedDate.getMonth() + 1, 1),
				oCardActions = oCard.getCardContent().getActions(),
				oSkeletonActions = this._oSkeletonCard.getCardContent().getActions(),
				sUnselectedMonthName,
				oCalLastRenderedDate;

			oCalLastDateInMonth.setDate(oCalLastDateInMonth.getDate() - 1); // move a day backwards
			oCalLastRenderedDate = CalendarUtils._getFirstDateOfWeek(oCalLastDateInMonth);
			oCalLastRenderedDate.setDate(oCalLastRenderedDate.getDate() + 6); // move to the end of the week

			oCardActions.fireAction(oCard.getCardContent(), "MonthChange", {
				"firstDate": oCalFirstRenderedDate.toLocalJSDate(),
				"lastDate": oCalLastRenderedDate.toLocalJSDate()
			});
			oSkeletonActions.fireAction(oCard.getCardContent(), "MonthChange", {
				"firstDate": oCalFirstRenderedDate.toLocalJSDate(),
				"lastDate": oCalLastRenderedDate.toLocalJSDate()
			});
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
			}, {
				"id": "duration",
				"value": "PT12H30M"
			}, {
				"id": "dateRange",
				"value": {
					"option": "date",
					"values": [
						"2023-05-20"
					]
				}
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
		},

		onShowMessage: function () {
			this._oSkeletonCard.showMessage("This is a demo message.", "Warning");
			this.byId("demoCard").showMessage("This is a demo message.", "Warning");
			this._getModel().setProperty("/messageStripVisible", true);
		},

		onHideMessage: function () {
			this._oSkeletonCard.hideMessage();
			this.byId("demoCard").hideMessage();
			this._getModel().setProperty("/messageStripVisible", false);
		}
	});
});