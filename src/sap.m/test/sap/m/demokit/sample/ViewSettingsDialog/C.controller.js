sap.ui.define([
		'sap/m/MessageToast',
		'sap/m/ViewSettingsItem',
		'sap/ui/core/CustomData',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter'
	], function(MessageToast, ViewSettingsItem, CustomData, Fragment, Controller, Filter) {
	"use strict";

	// shortcut for sap.ui.model.FilterOperator
	var FilterOperator = sap.ui.model.FilterOperator;

	return Controller.extend("sap.m.sample.ViewSettingsDialog.C", {

		// View Setting Dialog opener
		_openDialog : function (sName, sPage, fInit) {

			// creates dialog list if not yet created
			if (!this._oDialogs) {
				this._oDialogs = {};
			}

			// creates requested dialog if not yet created
			if (!this._oDialogs[sName]) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialog." + sName,
					controller: this
				}).then(function(oDialog){
					this._oDialogs[sName] = oDialog;
					this.getView().addDependent(this._oDialogs[sName]);
					if (fInit) {
						fInit(this._oDialogs[sName]);
					}
					// opens the dialog
					this._oDialogs[sName].open(sPage);
				}.bind(this));
			} else {
				// opens the requested dialog
				this._oDialogs[sName].open(sPage);
			}
		},

		// onExit - destroy created dialogs
		onExit: function () {
			if (this._oDialogs) {
				for (var oDialog in this._oDialogs) {
					this._oDialogs[oDialog].destroy();
					delete this._oDialogs[oDialog];
				}
				this._oDialogs = null;
			}
		},

		// Opens View Settings Dialog
		handleOpenDialog: function () {
			this._openDialog("Dialog");
		},

		// Opens View Settings Dialog on Filter page
		handleOpenDialogFilter: function () {
			this._openDialog("Dialog", "filter");
		},

		// Opens View Settings Dialog with pre-selected filters on Filter page
		handleOpenDialogFilterPreselected: function () {
			this._openDialog("DialogPreselected", "filter");
		},

		// Opens View Settings Dialog with presetFilterItems on Filter page
		handleOpenDialogPresetFilterItems: function () {
			this._openDialog("DialogPreset", "filter", this._presetFiltersInit);
		},

		// adds presetFilters to the View Settings Dialog
		_presetFiltersInit : function (oDialog) {

			// definition of preset filters
			var presetFilters1 = [
				new Filter("limit", FilterOperator.BT, 10, 100),
				new Filter("name", FilterOperator.Contains, "o"),
				new Filter("status", FilterOperator.EQ, "D")
			],
				presetFilters2 = [
				new Filter("name", FilterOperator.Contains, "e"),
				new Filter("status", FilterOperator.EQ, "A")
			],
				presetFilters3 = new Filter("price", FilterOperator.GT, 50);

			// add preset filters
			oDialog.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter1",
				text: "A very complex filter",
				customData: new CustomData({
					key: "filter",
					value: presetFilters1
				})
			}));
			oDialog.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter2",
				text: "Ridiculously complex filter",
				customData: new CustomData({
					key: "filter",
					value: presetFilters2
				})
			}));
			oDialog.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter3",
				text: "Expensive stuff",
				customData: new CustomData({
					key: "filter",
					value: presetFilters3
				})
			}));
		},

		// shows selected filters
		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});

});
