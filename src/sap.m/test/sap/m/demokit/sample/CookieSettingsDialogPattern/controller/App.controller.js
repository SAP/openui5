sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function(
	Core,
	Fragment,
	Controller,
	JSONModel,
	ResourceModel
) {
	'use strict';

	return Controller.extend('sap.m.sample.CookieSettingsDialogPattern.controller.App', {

		onInit: function() {
			this._oModel = new JSONModel();
			this._oView = this.getView();

			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "sap.m.sample.CookieSettingsDialogPattern.i18n.i18n"
			});
			this._oView.setModel(i18nModel, "i18n");
		},

		openCookieSettingsDialog: function() {
			// for the sample, we force cookie details to be hidden on opening of the dialog
			this._oModel.setProperty("/showCookieDetails", false);

			this.getCookieSettingsDialog().then(function(oDialog) {
				oDialog.open();
			});
		},

		getCookieSettingsDialog: function() {
			return new Promise(function(resolve, reject) {
				if (this._oCookieSettingsDialog) {
					resolve(this._oCookieSettingsDialog);
				} else {
					Fragment.load({
						name: "sap.m.sample.CookieSettingsDialogPattern.view.fragments.CookieSettingsDialog",
						controller: this
					}).then(this._initDialog.bind(this))
						.then(function(oDialog) {
							this._oCookieSettingsDialog = oDialog;
							resolve(this._oCookieSettingsDialog);
						}.bind(this));
				}
			}.bind(this));
		},

		onOCSDButtonPress: function() {
			this.openCookieSettingsDialog();
		},

		_initDialog: function(oDialog) {
			oDialog.setModel(this._oModel, "cookieData");

			// connect dialog to the root view of this component (models, lifecycle)
			this._oView.addDependent(oDialog);

			oDialog.attachBeforeOpen(function() {
				this._oCookieSettingsDialog.toggleStyleClass("cookiesDetailedView",
					this._oModel.getProperty("/showCookieDetails"));
			}, this);

			oDialog.attachAfterOpen(function() {
				Core.byId("btnSetPreferences").$().focus();
			});

			return oDialog;
		},

		onAcceptAllCookies: function () {
			// insert your accept all logic here

			this._oCookieSettingsDialog.close();
		},

		onRejectAllCookies: function () {
			// insert your reject all logic here

			this._oCookieSettingsDialog.close();
		},

		onSaveCookies: function() {
			// var bHasConsentRequiredCookies = Core.byId("requiredCookiesSwitch").getState(),
			// bHasConsentFunctionalCookies = Core.byId("functionalCookiesSwitch").getState();

			// insert your save cookies logic here according to the user input

			this._oCookieSettingsDialog.close();
		},

		showCookieDetails: function() {
			this._oModel.setProperty("/showCookieDetails", true);
			this._oCookieSettingsDialog.addStyleClass("cookiesDetailedView");

			this._focusButton(Core.byId("btnSavePreferences"));
		},

		onCancelPress: function() {
			if (!this._oModel.getProperty("/showCookieDetails")) {
				// full details were shown upon opening the dialog
				// => the cancel action should ignore all changes and close the dialog
				this.onCancelEditCookies();
			} else {
				// *no details* were shown upon opening the dialog
				// => the cancel action should navigate back to the preview
				this.hideCookieDetails();
			}
		},

		hideCookieDetails: function() {
			this._oModel.setProperty("/showCookieDetails", false);
			this._oCookieSettingsDialog.removeStyleClass("cookiesDetailedView");

			this._focusButton(Core.byId("btnSetPreferences"));
		},

		onCancelEditCookies: function() {
			this._oCookieSettingsDialog.close();

			// revert user input
		},

		_focusButton: function(oButton) {
			if (oButton.$().length) {
				oButton.$().focus();
				return;
			}

			oButton.addEventDelegate({
				"onAfterRendering": function() {
					oButton.$().focus();
					oButton.removeEventDelegate(this);
				}
			});
		}

	});
}
);