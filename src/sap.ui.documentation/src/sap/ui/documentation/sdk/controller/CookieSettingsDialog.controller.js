/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
	"	sap/ui/documentation/sdk/model/formatter",
		"sap/m/library",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/ui/core/Core"
	], function (BaseController, globalFormatter, mobileLibrary, JSONModel, Fragment, Core) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.CookieSettingsDialog", {

			formatter: globalFormatter,

			constructor: function() {
				this._oConfigUtil = null;
				this._oRootView = null;
				this._oInitOptions = null;
				this._oModel = new JSONModel();
			},

			openCookieSettingsDialog: function(oConfigUtil, oRootView, oOptions) {
				this._oInitOptions = oOptions;
				this._oModel.setData(oOptions, true /* merge */);

				if (this._oCookieSettingsDialog) {
					this._oCookieSettingsDialog.open();
				} else {
					this._initData(oConfigUtil, oRootView);
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.CookieSettingsDialog",
						controller: this
					}).then(this._initDialog.bind(this))
						.then(function(oDialog) {
							this._oCookieSettingsDialog = oDialog;
							this._oCookieSettingsDialog.open();
						}.bind(this));
				}
			},

			_initDialog: function(oDialog) {
				oDialog.setModel(this._oModel, "cookieData");

				// connect dialog to the root view of this component (models, lifecycle)
				this._oRootView.addDependent(oDialog);


				oDialog.attachBeforeOpen(function() {
					this._oCookieSettingsDialog.toggleStyleClass("cookiesDetailedView",
						this._oModel.getProperty("/showCookieDetails"));
				}, this);


				oDialog.attachAfterOpen(function() {
					Core.byId("btnSetPreferences").$().focus();
				});


				if (!this._bAlreadyRequestedCookiesApproval) {
					oDialog.attachEventOnce("afterClose", function() {
						this._bAlreadyRequestedCookiesApproval = true;
						this._oConfigUtil.setCookie(this._oConfigUtil.COOKIE_NAMES.APPROVAL_REQUESTED, "1");
					}, this);
				}

				return oDialog;
			},

			onAcceptAllCookies: function () {
				this._saveCookiePreference(this._oCookieNames.ALLOW_REQUIRED_COOKIES, true);
				this._saveCookiePreference(this._oCookieNames.ALLOW_USAGE_TRACKING, this._oModel.getProperty("/supportsUsageTracking"));

				this._oCookieSettingsDialog.close();
			},

			onRejectAllCookies: function () {
				this._saveCookiePreference(this._oCookieNames.ALLOW_REQUIRED_COOKIES, false);
				this._saveCookiePreference(this._oCookieNames.ALLOW_USAGE_TRACKING, false);

				this._oCookieSettingsDialog.close();
			},

			onSaveCookies: function() {
				var bHasConsentRequiredCookies = Core.byId("requiredCookiesSwitch").getState(),
					bHasConsentFunctionalCookies = Core.byId("functionalCookiesSwitch").getState();

				this._saveCookiePreference(this._oCookieNames.ALLOW_REQUIRED_COOKIES, bHasConsentRequiredCookies);
				this._saveCookiePreference(this._oCookieNames.ALLOW_USAGE_TRACKING, bHasConsentFunctionalCookies);

				this._oCookieSettingsDialog.close();
			},

			showCookieDetails: function() {
				this._oModel.setProperty("/showCookieDetails", true);
				this._oCookieSettingsDialog.addStyleClass("cookiesDetailedView");

				this._focusButton(Core.byId("btnSavePreferences"));
			},

			onCancelPress: function() {
				if (this._oInitOptions.showCookieDetails === true) {
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
				Core.byId("requiredCookiesSwitch").setState(this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1");
				Core.byId("functionalCookiesSwitch").setState(this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_USAGE_TRACKING) === "1");
			},

			_saveCookiePreference: function(sCookieName, bEnable) {
				var sValue = bEnable ? "1" : "0",
					sOldValue;

				if (sCookieName === this._oCookieNames.ALLOW_USAGE_TRACKING) {
					sOldValue = this._oConfigUtil.getCookieValue(sCookieName);

					if (sOldValue !== sValue) {
						bEnable && this._oConfigUtil.enableUsageTracking();
						!bEnable && this._oConfigUtil.disableUsageTracking();
					}
				}

				this._oConfigUtil.setCookie(sCookieName, sValue);
				this._oModel.setProperty("/" + sCookieName, sValue);
			},

			_initData: function (oConfigUtil, oRootView) {

				this._oConfigUtil = oConfigUtil;
				this._oRootView = oRootView;
				this._oCookieNames = this._oConfigUtil.COOKIE_NAMES;
				this._bAlreadyRequestedCookiesApproval = this._oConfigUtil.getCookieValue(this._oCookieNames.APPROVAL_REQUESTED) === "1";

				this._setInitialCookieValues();
			},

			_setInitialCookieValues: function() {
				var oData = {};
				if (!this._bAlreadyRequestedCookiesApproval) {
					// when the user opens the edit dialog for a first time, show the cookies enabled
					// the user will then edit and save his choice
					oData[this._oCookieNames.ALLOW_REQUIRED_COOKIES] = "1";
					oData[this._oCookieNames.ALLOW_USAGE_TRACKING] = "1";
				} else {
					oData[this._oCookieNames.ALLOW_REQUIRED_COOKIES] = this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES);
					oData[this._oCookieNames.ALLOW_USAGE_TRACKING] = this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_USAGE_TRACKING);
				}

				this._oModel.setData(oData, true /* merge */);
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