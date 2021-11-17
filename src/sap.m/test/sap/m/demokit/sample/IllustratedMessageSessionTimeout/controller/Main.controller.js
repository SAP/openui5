sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/resource/ResourceModel'
], function (Controller, Fragment, JSONModel, ResourceModel) {
	"use strict";

	return Controller.extend("sap.m.sample.IllustratedMessageSessionTimeout.controller.Main", {

		onInit: function () {
			var oView = this.getView();

			this.oModel = new JSONModel({
				bIsExpiring: true,
				iSecondsLeft: 99
			});

			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "sap.m.sample.IllustratedMessageSessionTimeout.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");
			oView.setModel(this.oModel);
		},

		handleOpenDialog : function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.IllustratedMessageSessionTimeout.view.fragments.Dialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;

					this.getView().addDependent(this._oDialog);

					this.onDialogOpen();
				}.bind(this));
			} else {
				this.onDialogOpen();
			}
		},

		onDialogOpen : function () {
			this._oDialog.open();
			this._startCounter();
		},

		onDialogClose : function () {
			this._oDialog.close();
			this._stopCounter();
		},

		onSignIn: function () {
			this.onDialogClose();

			// Insert your Sign In Logic here...

		},

		onExit: function () {
			this._stopCounter();
		},

		_decrementCounter : function () {
			this._onUpdateStatus();
			if (this.iSeconds === 0) {
				this._stopCounter();
				this._onCounterEnd();
				return;
			}
			this.iSeconds--;
		},

		_startCounter : function () {
			this.iSeconds = this.getView().byId("expirationInput").getValue();
			this._onCounterStart();
			clearInterval(this.oTimer);
			this.oTimer = setInterval(this._decrementCounter.bind(this), 1000);
		},

		_stopCounter : function () {
			clearInterval(this.oTimer);
			this.oTimer = null;
		},

		_onUpdateStatus : function () {
			this.oModel.setProperty('/iSecondsLeft', this.iSeconds);
		},

		_onCounterStart : function () {
			this.oModel.setProperty('/bIsExpiring', true);
			this.oModel.setProperty('/iSecondsLeft', this.iSeconds);
			this.iSeconds--;
		},

		_onCounterEnd : function () {
			this.oModel.setProperty('/bIsExpiring', false);
		}
	});
});