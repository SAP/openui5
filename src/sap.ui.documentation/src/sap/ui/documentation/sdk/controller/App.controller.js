/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/SearchUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/base/util/UriParameters",
	"sap/ui/documentation/library",
	"sap/ui/core/IconPool",
	"sap/m/MessageBox",
	"sap/m/library",
	"sap/base/Log",
	"sap/base/util/Version",
	"sap/ui/core/syncStyleClass",
	"sap/ui/documentation/WebPageTitleUtil",
	"sap/ui/core/Core"
], function(
	jQuery,
	BaseController,
	SearchUtil,
	JSONModel,
	ResizeHandler,
	Device,
	Fragment,
	Locale,
	LocaleData,
	UriParameters,
	library,
	IconPool,
	MessageBox,
	mobileLibrary,
	Log,
	Version,
	syncStyleClass,
	WebPageTitleUtil,
	Core
) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		var MAIN_WEB_PAGE_TITLE = "Demo Kit - SAPUI5 SDK";

		var WEB_PAGE_TITLE = {
			home: "Home - " + MAIN_WEB_PAGE_TITLE,
			topic: "Documentation - " + MAIN_WEB_PAGE_TITLE,
			api: "API Reference - " + MAIN_WEB_PAGE_TITLE,
			controls: "Samples - " + MAIN_WEB_PAGE_TITLE,
			demoapps: "Demo Apps - " + MAIN_WEB_PAGE_TITLE,
			tools: "Tools - " + MAIN_WEB_PAGE_TITLE
		};

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper,
			sNeoAppJsonPath = "/neo-app.json", /* Load neo-app.json always from root URL */
			ABOUT_TEXT = "about",
			FEEDBACK_TEXT = "feedback",
			CHANGE_VERSION_TEXT = "change_version",
			CHANGE_SETTINGS_TEXT = "settings",
			DEMOKIT_DEFAULT_LANGUAGE = "en",
			DEMOKIT_COOKIE_NAME = "dkc",
			DEMOKIT_CONFIGURATION_LANGUAGE = "language";

		// We need to hardcode theme depending height of Toolbar to calculate ScrollContainer
		// height more precisely on the home page
		var oToolbarHeights = {
			sap_belize: {
				iMobileHeight: "5rem",
				iDesktopHeight: "3rem"
			},
			sap_fiori_3: {
				iMobileHeight: "4.75rem",
				iDesktopHeight: "2.75rem"
			}
		};

		function setCookie(sCookieName, sValue) {
			var sExpiresDate,
				oDate = new Date();

			oDate.setTime(oDate.getTime() + (356 * 24 * 60 * 60 * 1000)); // one year
			sExpiresDate = "expires=" + oDate.toUTCString();

			document.cookie = sCookieName + "=" + sValue + ";" + sExpiresDate + ";path=/";
		}

		function getCookieValue(sCookieName) {
			var aCookies = document.cookie.split(';'),
				sCookie;

			sCookieName = sCookieName + "=";

			for (var i = 0; i < aCookies.length; i++) {
				sCookie = aCookies[i].trim();

				if (sCookie.indexOf(sCookieName) === 0) {
					return sCookie.substring(sCookieName.length, sCookie.length);
				}
			}

			return "";
		}

		return BaseController.extend("sap.ui.documentation.sdk.controller.App", {
			onInit : function () {
				BaseController.prototype.onInit.call(this);

				var	oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					bPhoneSize: false,
					bShowVersionSwitchInHeader: false,
					bShowVersionSwitchInMenu: false,
					bLandscape: Device.orientation.landscape,
					bHasMaster: false,
					bSearchMode: false,
					bHideTopicSection: !!window['sap-ui-documentation-hideTopicSection'],
					bHideApiSection: !!window['sap-ui-documentation-hideApiSection'],
					sAboutInfoSAPUI5: "Looking for the Demo Kit for a specific SAPUI5 version? " +
					"Check at <a href = 'https://sapui5.hana.ondemand.com/versionoverview.html'>https://sapui5.hana.ondemand.com/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://sapui5.hana.ondemand.com/1.52.4/'>https://sapui5.hana.ondemand.com/1.52.4/</a>",
					sAboutInfoOpenUI5: "Looking for the Demo Kit for a specific OpenUI5 version? " +
					"Check at <a href = 'https://openui5.hana.ondemand.com/versionoverview.html'>https://openui5.hana.ondemand.com/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://openui5.hana.ondemand.com/1.52.4/'>https://openui5.hana.ondemand.com/1.52.4/</a>",
					oThemeScrollContainerHeight: oToolbarHeights[this.extractThemeSettings()]
				});

				this.MENU_LINKS_MAP = {
					"legal": "https://www.sap.com/corporate/en/legal/impressum.html",
					"privacy": "https://www.sap.com/corporate/en/legal/privacy.html",
					"terms_of_use": "https://www.sap.com/corporate/en/legal/terms-of-use.html",
					"copyright": "https://www.sap.com/corporate/en/legal/copyright.html",
					"trademark": "https://www.sap.com/corporate/en/legal/trademark.html",
					"disclaimer": "https://help.sap.com/viewer/disclaimer",
					"license": "LICENSE.txt"
				};

				this.getOwnerComponent().loadVersionInfo().then(function () {
					if (this.getModel("versionData").getProperty("/isOpenUI5")) {
						this.MENU_LINKS_MAP["Terms of Use"] = "TermsOfUse.txt";
					}
				}.bind(this));

				this.FEEDBACK_SERVICE_URL = "https://feedback-sapuisofiaprod.hana.ondemand.com:443/api/v2/apps/5bb7d7ff-bab9-477a-a4c7-309fa84dc652/posts";

				// Cache view reference
				this._oSupportedLangModel = new JSONModel({
					"langs": this._prepareSupportedLangModelData()
				});

				this.setModel(this._oSupportedLangModel, "supportedLanguages");

				this._oView = this.getView();

				this.setModel(oViewModel, "appView");

				this.oHeader = this._oView.byId("headerToolbar");

				this._oMessageStrip = this._oView.byId("cookieMessageStrip");

				this.oRouter = this.getRouter();

				this._selectHeader = this._oView.byId("selectHeader");
				this._tabHeader = this._oView.byId("tabHeader");

				this._oWebPageTitleUtil = new WebPageTitleUtil();

				ResizeHandler.register(this.oHeader, this.onHeaderResize.bind(this));
				this.oRouter.attachRouteMatched(this.onRouteChange.bind(this));
				this.oRouter.attachBypassed(this.onRouteNotFound.bind(this));

				// register Feedback rating icons
				this._registerFeedbackRatingIcons();

				this._requestVersionInfo();

				// attach to the afterMasterClose event of the splitApp to be able to toggle the hamburger button state on clicking anywhere
				this.byId("splitApp").attachEvent("afterMasterClose", function (oEvent) {
					oViewModel.setProperty("/bIsShownMaster", false);
				}, this);

				this.bus = Core.getEventBus();
				this.bus.subscribe("themeChanged", "onDemoKitThemeChanged", this.onDemoKitThemeChanged, this);

				this._createConfigurationBasedOnURIInput();

				if (getCookieValue(DEMOKIT_COOKIE_NAME) === "1" && this._aConfiguration.length > 0) {
					this._applyCookiesConfiguration(this._aConfiguration);
				} else {
					this._applyDefaultConfiguration(this._aConfiguration);
				}
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);

				this._oMessageStrip.setVisible(getCookieValue(DEMOKIT_COOKIE_NAME) !== "1");
			},

			onAfterRendering: function() {
				// apply content density mode to the body tag
				// in order to get the controls in the static area styled correctly,
				// such as Dialog and Popover.
				jQuery(document.body).addClass(this.getOwnerComponent().getContentDensityClass());

				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			onCookieDialogAccept: function () {
				setCookie(DEMOKIT_COOKIE_NAME, "1");

				this._oMessageStrip.close();
			},

			onExit: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onRouteChange: function (oEvent) {

				if (!this.oRouter.getRoute(oEvent.getParameter("name"))._oConfig.target) {
					return;
				}

				var sRouteName = oEvent.getParameter("name"),
					sTabId = this.oRouter.getRoute(sRouteName)._oConfig.target[0] + "Tab",
					oTabToSelect = this._oView.byId(sTabId),
					sKey = oTabToSelect ? oTabToSelect.getKey() : "home",
					oViewModel = this.getModel("appView"),
					bPhoneSize = oViewModel.getProperty("/bPhoneSize"),
					bSearchMode = oViewModel.getProperty("/bSearchMode"),
					bPhone = Device.system.phone,
					bHasMaster = this.getOwnerComponent().getConfigUtil().hasMasterView(sRouteName),
					oMasterView,
					sMasterViewId;

				this._setHeaderSelectedKey(sKey);
				this._oWebPageTitleUtil.setTitle(WEB_PAGE_TITLE[sKey]);

				oViewModel.setProperty("/bHasMaster", bHasMaster);

				if (bPhoneSize && !bSearchMode) {
					this._selectHeader.setVisible(true);
				}

				if (bPhone && bHasMaster) { // on phone we need the id of the master view (for navigation)
					oMasterView = this.getOwnerComponent().getConfigUtil().getMasterView(sRouteName);
					sMasterViewId = oMasterView && oMasterView.getId();
					oViewModel.setProperty("/sMasterViewId", sMasterViewId);
				}

				// hide master on route change
				this.byId("splitApp").hideMaster();
				oViewModel.setProperty("/bIsShownMaster", false);
			},

			onRouteNotFound: function () {
				this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
				return;
			},

			toggleMaster: function(oEvent) {
				var bPressed = oEvent.getParameter("pressed"),
					bPhone = Device.system.phone,
					oSplitApp = this.byId("splitApp"),
					isShowHideMode = oSplitApp.getMode() === SplitAppMode.ShowHideMode,
					isHideMode = oSplitApp.getMode() === SplitAppMode.HideMode,
					sMasterViewId = this.getModel("appView").getProperty("/sMasterViewId"),
					fnToggle;

				if (!bPhone && (isShowHideMode || isHideMode)) {
					fnToggle = (bPressed) ? oSplitApp.showMaster : oSplitApp.hideMaster;
					fnToggle.call(oSplitApp);
					return;
				}

				/* on phone there is no master-detail pair, but a single navContainer => so navigate within this navContainer: */
				if (bPhone) {
					if (bPressed) {
						oSplitApp.to(sMasterViewId);
					} else {
						oSplitApp.backDetail();
					}
				}
			},

			navigateToSection : function (oEvent) {
				var sKey = oEvent.getParameter("key"),
					oItem;

				if (!sKey) {
					oItem = oEvent.getParameter("selectedItem");
					oItem && (sKey = oItem.getKey());
				}

				oEvent.preventDefault();
				if (sKey && sKey !== "home") {
					this.getRouter().navTo(sKey, {});
				} else {
					this.getRouter().navTo("welcome", {});

					this._setHeaderSelectedKey("home");
				}
			},

			handleMenuItemClick: function (oEvent) {
				var sTargetText = oEvent.getParameter("item").getKey(),
					sTarget = this.MENU_LINKS_MAP[sTargetText];

				if (sTargetText === ABOUT_TEXT) {
					this.aboutDialogOpen();
				} else if (sTargetText === FEEDBACK_TEXT) {
					this.feedbackDialogOpen();
				} else if (sTargetText === CHANGE_SETTINGS_TEXT) {
					this.settingsDialogOpen();
				} else if (sTargetText === CHANGE_VERSION_TEXT) {
					this.onChangeVersionButtonPress();
				} else if (sTarget) {
					URLHelper.redirect(sTarget, true);
				}
			},

			/**
			 * Creates configuration for the application regarding the URI input.
			 * @private
			 */
			_createConfigurationBasedOnURIInput: function () {
				var oUriParams = UriParameters.fromQuery(window.location.search);
				this._aConfiguration = [];

				if (!(oUriParams.has('sap-ui-language') || oUriParams.has('sap-language'))) {
					this._aConfiguration.push(DEMOKIT_CONFIGURATION_LANGUAGE);
				}
			},

			/**
			 * Applies configuration for the application regarding the default values.
			 * @private
			 */
			_applyDefaultConfiguration: function () {
				this._aConfiguration.forEach(function(sConf){
					if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
						Core.getConfiguration().setLanguage(DEMOKIT_DEFAULT_LANGUAGE);
					}
				}, this);

				this._oSupportedLangModel.setProperty("/selectedLang", Core.getConfiguration().getLanguage());
			},

			/**
			 * Applies configuration for the application regarding the cookies.
			 * @private
			 */
			_applyCookiesConfiguration: function () {
				var sCookieValue, sConf, i;

				for (i = 0; i < this._aConfiguration.length; i++) {
					sConf = this._aConfiguration[i];
					sCookieValue = getCookieValue(sConf);

					if (sCookieValue !== "") {
						if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
							this._setSelectedLanguage(sCookieValue);
						}

						// If we have available value for the given cookie we remove it from the configuration array.
						this._aConfiguration.splice(i, 1);
						i--;
					}
				}

				// If we still have configurations which are not set by their cookie values, we apply their default values.
				if (this._aConfiguration.length > 0) {
					this._applyDefaultConfiguration();
				}
			},

			/*
			 * Helper for function for preparing the data for the SupportedLangModel.
			 * @private
			 * @returns {Array[Object]} Array of objects containg the needed data for the SupportedLangModel
			 */
			_prepareSupportedLangModelData: function () {
				return Core.getConfiguration().getLanguagesDeliveredWithCore().reduce(function(result, sLangAbbreviation) {
					var langName;
					if (typeof sLangAbbreviation === "string" && sLangAbbreviation.length > 0) {

						switch (sLangAbbreviation) {
							case "iw": // Israel
								// Hebrew
								langName = new LocaleData(new Locale("he")).getLanguages()["he"];
								break;
							case "zh_TW": // Taiwan
								// Chinese Traditional
								langName = new LocaleData(new Locale(sLangAbbreviation)).getLanguages()["zh_Hant"];
								break;
							case "zh_CN": // People's Republic of China
								// Chinese Simplified
								langName = new LocaleData(new Locale(sLangAbbreviation)).getLanguages()["zh_Hans"];
								break;
							default:
								langName = new LocaleData(new Locale(sLangAbbreviation)).getLanguages()[sLangAbbreviation];
						}

						result.push({
							"text": typeof langName === 'string' ? langName.charAt(0).toUpperCase() + langName.substring(1) : "Unknown",
							"key": sLangAbbreviation
						});
					}

					return result;
				}, []);
			},

			/**
			 * Sets the selected language code abbreviation
			 * @param {string} sLanguage language code abbreviation
			 * @private
			 */
			_setSelectedLanguage: function(sLanguage) {
				this._oSupportedLangModel.setProperty("/selectedLang", sLanguage);
				Core.getConfiguration().setLanguage(sLanguage);
				if (getCookieValue(DEMOKIT_COOKIE_NAME) === "1") {
					setCookie(DEMOKIT_CONFIGURATION_LANGUAGE, sLanguage);
				}
			},

			/**
			 * Gets the selected language code abbreviation
			 * @private
			 * @returns {string} sLanguage language code abbreviation
			 */
			_getSelectedLanguage: function() {
				return this._oSupportedLangModel.getProperty("/selectedLang");
			},

			/**
			 * Opens the settings dialog
			 * @public
			 */
			settingsDialogOpen: function () {
				if (!this._oSettingsDialog) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.globalSettingsDialog",
						controller: this
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						this._oView.addDependent(oDialog);
						this._oSettingsDialog = oDialog;
						Core.byId("LanguageSelect").setSelectedKey(this._getSelectedLanguage());
						this._oSettingsDialog.open();
					}.bind(this));
				} else {
					this._oSettingsDialog.open();
				}
			},

			/**
			 * Closes the settings dialog
			 * @public
			 */
			handleCloseAppSettings: function () {
				this._oSettingsDialog.close();
			},

			/**
			 * Saves settings from the settings dialog
			 * @public
			 */
			handleSaveAppSettings: function () {
				var sLanguage = Core.byId('LanguageSelect').getSelectedKey();

				this._oSettingsDialog.close();

				// handle settings change
				this._applyAppConfiguration(sLanguage);
			},

			/**
			 * Apply content configuration
			 * @param {string} sLanguage language code abbreviation
			 * @private
			 */
			_applyAppConfiguration: function(sLanguage){
				this._setSelectedLanguage(sLanguage);
			},

			aboutDialogOpen: function () {
				if (!this._oAboutDialog) {
					this._oAboutDialog = new sap.ui.xmlfragment("aboutDialogFragment", "sap.ui.documentation.sdk.view.AboutDialog", this);
					this._oView.addDependent(this._oAboutDialog);
				} else {
					this._oAboutDialog.getContent()[0].backToTop(); // reset the nav container to the first page
				}
				this._oAboutDialog.open();
			},

			aboutDialogClose: function (oEvent) {
				this._oAboutDialog.close();
			},

			onAboutVersionDetails: function (oEvent) {
				var oViewModel = this.getModel("appView"),
					oViewModelData = oViewModel.getData(),
					that = this;

				library._loadAllLibInfo("", "_getLibraryInfo","", function(aLibs, oLibInfos) {
					var data = {};
					var oLibInfo = library._getLibraryInfoSingleton();

					for (var i = 0, l = aLibs.length; i < l; i++) {
						aLibs[i] = oLibInfos[aLibs[i]];
						aLibs[i].libDefaultComponent = oLibInfo._getDefaultComponent(aLibs[i]);
					}

					data.libs = aLibs;
					oViewModelData.oVersionInfo = data;
					oViewModel.setData(oViewModelData);
					that.setModel(oViewModel, "appView");
				});

				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
					oDetailPage = Fragment.byId("aboutDialogFragment", "aboutDetail");
				oNavCon.to(oDetailPage);
			},

			onAboutThirdParty: function (oEvent) {
				var oViewModel = this.getModel("appView"),
					oViewModelData = oViewModel.getData(),
					that = this;

				library._loadAllLibInfo("", "_getThirdPartyInfo", function(aLibs, oLibInfos){
					if (!aLibs){
						return;
					}
					var data = {};
					data.thirdparty = [];
					for (var j = 0; j < aLibs.length; j++) {
						var oData = oLibInfos[aLibs[j]];
						for (var i = 0; i < oData.libs.length; i++) {
							var oOpenSourceLib = oData.libs[i];
							oOpenSourceLib._lib = aLibs[j];
							data.thirdparty.push(oOpenSourceLib);
						}
					}

					data.thirdparty.sort(function(a,b){
						var aName = (a.displayName || "").toUpperCase();
						var bName = (b.displayName || "").toUpperCase();

						if (aName > bName){
							return 1;
						} else if (aName < bName){
							return -1;
						} else {
							return 0;
						}
					});

					oViewModelData.oThirdPartyInfo = data;
					oViewModel.setData(oViewModelData);
					that.setModel(oViewModel, "appView");
				});

				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
					oDetailPage = Fragment.byId("aboutDialogFragment", "aboutThirdParty");
				oNavCon.to(oDetailPage);
			},

			onReleaseDialogOpen: function (oEvent) {
				var oLibInfo = library._getLibraryInfoSingleton(),
					sVersion = oEvent.getSource().data("version"),
					sLibrary = oEvent.getSource().data("library"),
					oNotesModel = new JSONModel(),
					oDialogModel = new JSONModel(),
					that = this;

				if (!this._oReleaseDialog) {
					this._oReleaseDialog = new sap.ui.xmlfragment("releaseDialogFragment", "sap.ui.documentation.sdk.view.ReleaseDialog", this);
					this._oView.addDependent(this._oReleaseDialog);
				}

				if (!this._oNotesView) {
					this._oNotesView = sap.ui.view({id:"notesView", viewName:"sap.ui.documentation.sdk.view.ReleaseNotesView", type:"Template"});
					this._oNotesView.setModel(oNotesModel);
				}

				oLibInfo._getReleaseNotes(sLibrary, sVersion, function(oRelNotes, sVersion) {
					var oDialogData = {};

					if (oRelNotes && oRelNotes[sVersion] && oRelNotes[sVersion].notes && oRelNotes[sVersion].notes.length > 0) {
						that._oNotesView.getModel().setData(oRelNotes);
						that._oNotesView.bindObject("/" + sVersion);
					} else {
						oDialogData.noData = true;
					}
					oDialogData.library = sLibrary;
					oDialogModel.setData(oDialogData);
				});

				this._oReleaseDialog.setModel(oDialogModel);
				this._oReleaseDialog.addContent(this._oNotesView);
				this._oReleaseDialog.open();
			},

			onReleaseDialogClose: function (oEvent) {
				this._oReleaseDialog.close();
			},

			onAboutNavBack: function (oEvent) {
				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon");
				oNavCon.back();
			},

			onChangeVersionButtonPress: function () {
				this.getVersionSwitchDialog().open();
			},

			onCloseVersionDialog: function () {
				this.getVersionSwitchDialog().close();
			},

			onChangeVersionDialogSearch: function (oEvent) {
				var sSearchedValue = oEvent.getParameter("newValue"),
					oFilter = new sap.ui.model.Filter("version", sap.ui.model.FilterOperator.Contains, sSearchedValue),
					oBinding = Core.byId("versionList").getBinding("items");

				oBinding.filter([oFilter]);
			},

			onLogoIconPress: function () {
				this.oRouter.navTo("welcome", {});
			},

			onVersionItemPress: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("listItem"),
					oCustomData = oSelectedItem.getCustomData()[0];

				if (oCustomData && oCustomData.getKey() === "path") {
					window.location.href = oCustomData.getValue(); // Domain relative redirect
				}
			},

			getVersionSwitchDialog: function () {
				if (!this._oChangeVersionDialog) {
					this._createVersionDialog();
				}

				return this._oChangeVersionDialog;
			},

			/**
			 * Custom comparison function, which is used when sorting group titles by minor version in the change version dialog
			 *
			 * @param sGroupTitleA
			 * @param sGroupTitleB
			 * @returns {number}
			 */
			versionSwitchCustomComparator: function (sGroupTitleA, sGroupTitleB) {
				return Version(sGroupTitleA).compareTo(Version(sGroupTitleB));
			},

			/**
			 * Determines whether or not to show the version change button.
			 *
			 * @private
			 */
			_updateVersionSwitchVisibility: function() {
				var oViewModel = this.getModel("appView"),
					bPhoneSize = oViewModel.getProperty("/bPhoneSize");

				// Version switch should not be shown on phone sizes or when no versions are found
				oViewModel.setProperty("/bShowVersionSwitchInHeader", !bPhoneSize && !!this._aNeoAppVersions);
				oViewModel.setProperty("/bShowVersionSwitchInMenu", bPhoneSize && !!this._aNeoAppVersions);
			},

			_createVersionDialog: function () {
				this._oChangeVersionDialog = new sap.ui.xmlfragment("sap.ui.documentation.sdk.view.ChangeVersionDialog", this);
				this._oChangeVersionDialog.setModel(this._buildVersionDialogModel());
				this._oView.addDependent(this._oChangeVersionDialog);
			},

			_buildVersionDialogModel: function() {
				var oChangeVersionDialogModel = new JSONModel();

				oChangeVersionDialogModel.setSizeLimit(1000);
				oChangeVersionDialogModel.setData(this._aNeoAppVersions);

				return oChangeVersionDialogModel;
			},

			/**
			 * Opens a dialog to give feedback on the demo kit
			 */
			feedbackDialogOpen: function () {
				var that = this;
				var oResourceBundle;

				if (!this._oFeedbackDialog) {
					oResourceBundle = this.getModel("i18n").getResourceBundle();

					this._oFeedbackDialog = new sap.ui.xmlfragment("feedbackDialogFragment", "sap.ui.documentation.sdk.view.FeedbackDialog", this);
					this._oView.addDependent(this._oFeedbackDialog);

					this._oFeedbackDialog.textInput = Fragment.byId("feedbackDialogFragment", "feedbackInput");
					this._oFeedbackDialog.contextCheckBox = Fragment.byId("feedbackDialogFragment", "pageContext");
					this._oFeedbackDialog.contextData = Fragment.byId("feedbackDialogFragment", "contextData");
					this._oFeedbackDialog.ratingStatus = Fragment.byId("feedbackDialogFragment", "ratingStatus");
					this._oFeedbackDialog.ratingStatus.value = 0;
					this._oFeedbackDialog.sendButton = Fragment.byId("feedbackDialogFragment", "sendButton");
					this._oFeedbackDialog.ratingBar = [
						{
							button : Fragment.byId("feedbackDialogFragment", "excellent"),
							status : "Excellent",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_EXCELLENT")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "good"),
							status : "Good",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_GOOD")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "average"),
							status : "Average",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_AVERAGE")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "poor"),
							status : "Poor",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_POOR")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "veryPoor"),
							status : "Very Poor",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_VERY_POOR")
						}
					];
					this._oFeedbackDialog.reset = function () {
						this.sendButton.setEnabled(false);
						this.textInput.setValue("");
						this.contextCheckBox.setSelected(true);
						this.ratingStatus.setText("");
						this.ratingStatus.setState("None");
						this.ratingStatus.value = 0;
						this.contextData.setVisible(false);
						this.ratingBar.forEach(function(oRatingBarElement){
							if (oRatingBarElement.button.getPressed()) {
								oRatingBarElement.button.setPressed(false);
							}
						});
					};
					this._oFeedbackDialog.updateContextData = function() {
						var sVersion = that._getUI5Version(),
							sUI5Distribution = that._getUI5Distribution();

						if (this.contextCheckBox.getSelected()) {
							this.contextData.setValue("Location: " + that._getCurrentPageRelativeURL() + "\n" + sUI5Distribution + " Version: " + sVersion);
						} else {
							this.contextData.setValue(sUI5Distribution + " Version: " + sVersion);
						}
					};

					this._oFeedbackDialog.updateContextData();
				}
				this._oFeedbackDialog.updateContextData();
				if (!this._oFeedbackDialog.isOpen()) {
					syncStyleClass("sapUiSizeCompact", this.getView(), this._oFeedbackDialog);
					this._oFeedbackDialog.open();
				}
			},

			/**
			 * Event handler for the send feedback button
			 */
			onFeedbackDialogSend: function() {
				var data = {},
					oResourceBundle = this.getModel("i18n").getResourceBundle();

				if (this._oFeedbackDialog.contextCheckBox.getSelected()) {
					data = {
						"texts": {
							"t1": this._oFeedbackDialog.textInput.getValue()
						},
						"ratings":{
							"r1": {"value" : this._oFeedbackDialog.ratingStatus.value}
						},
						"context": {"page": this._getCurrentPageRelativeURL(), "attr1": this._getUI5Distribution() + ":" + sap.ui.version}
					};
				} else {
					data = {
						"texts": {
							"t1": this._oFeedbackDialog.textInput.getValue()
						},
						"ratings":{
							"r1": {"value" : this._oFeedbackDialog.ratingStatus.value}
						},
						"context": {"attr1": this._getUI5Distribution() + ":" + sap.ui.version}
					};
				}

				// send feedback
				this._oFeedbackDialog.setBusyIndicatorDelay(0);
				this._oFeedbackDialog.setBusy(true);

				jQuery.ajax({
					url: this.FEEDBACK_SERVICE_URL,
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify(data)
				}).
				done(
					function () {
						MessageBox.success(oResourceBundle.getText("FEEDBACK_DIALOG_TEXT_SUCCESS"), {
							title: oResourceBundle.getText("FEEDBACK_DIALOG_TITLE_SUCCESS")
						});
						this._oFeedbackDialog.reset();
						this._oFeedbackDialog.close();
						this._oFeedbackDialog.setBusy(false);
					}.bind(this)
				).
				fail(
					function (oRequest, sStatus, sError) {
						var sErrorDetails = sError; // + "\n" + oRequest.responseText;
						MessageBox.error(oResourceBundle.getText("FEEDBACK_DIALOG_TEXT_ERROR") + sErrorDetails, {
							title: oResourceBundle.getText("FEEDBACK_DIALOG_TITLE_ERROR")
						});
						this._oFeedbackDialog.setBusy(false);
					}.bind(this)
				);

			},

			/**
			 * Event handler for the cancel feedback button
			 */
			onFeedbackDialogCancel: function () {
				this._oFeedbackDialog.reset();
				this._oFeedbackDialog.close();
			},

			/**
			 * Event handler for the toggle context link
			 */
			onShowHideContextData: function () {
				this._oFeedbackDialog.contextData.setVisible(!this._oFeedbackDialog.contextData.getVisible());
			},

			/**
			 * Event handler for the context selection checkbox
			 */
			onContextSelect: function() {
				this._oFeedbackDialog.updateContextData();
			},

			/**
			 * Event handler for the rating to update the label and the data
			 * @param {sap.ui.base.Event}
			 */
			onPressRatingButton: function(oEvent) {
				var that = this;
				var oPressedButton = oEvent.getSource();

				that._oFeedbackDialog.ratingBar.forEach(function(oRatingBarElement) {
					if (oPressedButton !== oRatingBarElement.button) {
						oRatingBarElement.button.setPressed(false);
					} else {
						if (!oRatingBarElement.button.getPressed()) {
							setRatingStatus("None", "", 0);
						} else {
							switch (oRatingBarElement.status) {
								case "Excellent":
									setRatingStatus("Success", oRatingBarElement.displayStatus, 5);
									break;
								case "Good":
									setRatingStatus("Success", oRatingBarElement.displayStatus, 4);
									break;
								case "Average":
									setRatingStatus("None", oRatingBarElement.displayStatus, 3);
									break;
								case "Poor":
									setRatingStatus("Warning", oRatingBarElement.displayStatus, 2);
									break;
								case "Very Poor":
									setRatingStatus("Error", oRatingBarElement.displayStatus, 1);
							}
						}
					}
				});

				function setRatingStatus(sState, sText, iValue) {
					that._oFeedbackDialog.ratingStatus.setState(sState);
					that._oFeedbackDialog.ratingStatus.setText(sText);
					that._oFeedbackDialog.ratingStatus.value = iValue;
					if (iValue) {
						that._oFeedbackDialog.sendButton.setEnabled(true);
					} else {
						that._oFeedbackDialog.sendButton.setEnabled(false);
					}
				}
			},

			onSearch : function (oEvent) {
				var sQuery = oEvent.getParameter("query");
				if (!sQuery) {
					return;
				}
				this.getRouter().navTo("search", {searchParam: sQuery}, false);
			},

			onHeaderResize: function (oEvent) {
				var iWidth = oEvent.size.width,
					bPhoneSize = Device.system.phone || iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0],
					oViewModel = this.getModel("appView"),
					bSearchMode = oViewModel.getProperty("/bSearchMode");

				// Check for a change in "bPhoneSize" property in order to
				// reduce number of method calls
				if (bPhoneSize !== oViewModel.getProperty("/bPhoneSize")) {
					oViewModel.setProperty("/bPhoneSize", bPhoneSize);
					this._updateVersionSwitchVisibility();
					this._tabHeader.setVisible(!bPhoneSize);
					this._selectHeader.setVisible(bPhoneSize);
				}

				// The select should be first set to visible on phone size, and after that
				// set to false if search is opened for correct calculation of the search width.
				if (bSearchMode) {
					this._selectHeader.setVisible(false);
				}
			},

			_onOrientationChange: function() {
				this.getModel("appView").setProperty("/bLandscape", Device.orientation.landscape);
			},

			onToggleSearchMode : function(oEvent) {
				var bSearchMode = oEvent.getParameter("isOpen"),
				oViewModel = this.getModel("appView"),
				bPhoneSize = oViewModel.getProperty("/bPhoneSize");
				oViewModel.setProperty("/bSearchMode", bSearchMode);

				if (bSearchMode) {
					// Init is called *before* the user entered a search term
					// in order to start the download of the search index
					// in the *earliest* point in time
					SearchUtil.init();

					setTimeout(function () {
						this._oView.byId("searchControl").getAggregation("_searchField").getFocusDomRef().focus();
					}.bind(this), 0);

					if (bPhoneSize) {
						this._selectHeader.setVisible(false);
					}
				} else if (bPhoneSize) {
					this._selectHeader.setVisible(true);
				}
			},

			/**
			 * Register Feedback rating icons
			 * @private
			 */
			_registerFeedbackRatingIcons: function () {
				IconPool.addIcon("icon-face-very-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E086",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E087",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-neutral", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E089",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08B",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-very-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08C",
					suppressMirroring: true
				});
			},

			_requestVersionInfo: function () {
				Promise.resolve(jQuery.ajax(sNeoAppJsonPath)).then(
					// Success
					function(oNeoAppJson) {
						var oVersionModel = this.getModel("versionData"),
							bIsInternal = oVersionModel.getProperty("/isInternal"),
							bIsSnapshotVersion = oVersionModel.getProperty("/isSnapshotVersion");

						if (!(oNeoAppJson && oNeoAppJson.routes)) {
							Log.warning("No versions were found");
							return;
						}

						// Current version would be displayed for a second time as the last element,
						// therefore we should skip it to avoid duplicate items in the dialog.
						oNeoAppJson.routes.pop();

						this._aNeoAppVersions = oNeoAppJson.routes;

						// Store needed data
						if (!bIsInternal && !bIsSnapshotVersion) {
							this._aNeoAppVersions = this._aNeoAppVersions.filter(function(oRoute) {
								return oRoute.target.version.indexOf("-beta") === -1;
							});
						}

						this._aNeoAppVersions = this._aNeoAppVersions.map(function(oRoute) {
							var oVersion = Version(oRoute.target.version),
								oVersionSummary = {};

							// Add the following properties, in order use them for grouping later
							oVersionSummary.patchVersion = oVersion.getPatch(); // E.g: Extract 5 from "1.52.5"
							oVersionSummary.groupTitle = oVersion.getMajor() + "." + oVersion.getMinor(); // E.g: Extract "1.52" from "1.52.5"
							oVersionSummary.version = oVersion.toString();
							oVersionSummary.path = oRoute.path;

							return oVersionSummary;
						});

						// Make version select visible
						this._updateVersionSwitchVisibility();
					}.bind(this),
					// Error
					function() {
						Log.warning("No neo-app.json was detected");
					}
				);
			},


			onDemoKitThemeChanged: function() {
				this.getModel("appView").setProperty("/oThemeScrollContainerHeight",
					oToolbarHeights[this.extractThemeSettings()]);
			},

			extractThemeSettings: function() {
				return Core.getConfiguration().getTheme() === "sap_fiori_3" ?
					"sap_fiori_3" : "sap_belize";
			},

			_getUI5Version: function () {
				return this.getModel("versionData").getProperty("/version");
			},

			_getUI5VersionGav: function () {
				return this.getModel("versionData").getProperty("/versionGav");
			},

			_getUI5Distribution: function () {
				var sVersionGav = this._getUI5VersionGav();
				var sUI5Distribution = "SAPUI5";
				if (sVersionGav && /openui5/i.test(sVersionGav)) {
					sUI5Distribution = "OpenUI5";
				}
				return sUI5Distribution;
			},

			_getCurrentPageRelativeURL: function () {
				var parser = window.location;
				return parser.pathname + parser.hash + parser.search;
			},

			_setHeaderSelectedKey: function(sKey) {
				this._selectHeader.setSelectedKey(sKey);
				this._tabHeader.setSelectedKey(sKey);
			}

		});
	}
);
