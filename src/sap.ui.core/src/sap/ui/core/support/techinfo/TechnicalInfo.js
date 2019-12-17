/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/support/techinfo/moduleTreeHelper",
	"sap/ui/Device",
	"sap/ui/Global",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/URI",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/support/Support",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/m/library",
	"sap/ui/util/Storage",
	"sap/ui/core/syncStyleClass",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(
	moduleTreeHelper,
	Device,
	Global,
	DateFormat,
	ResourceModel,
	JSONModel,
	URI,
	MessageBox,
	MessageToast,
	Support,
	SimpleType,
	ValidateException,
	mobileLibrary,
	Storage,
	syncStyleClass,
	Log,
	jQuery
) {
	"use strict";

	return {

		_MIN_UI5VERSION_SUPPORT_ASSISTANT: "1.47",
		_MIN_EXPAND_LEVEL_DEBUG_MODULES: 3,
		_SUPPORT_ASSISTANT_POPOVER_ID:"technicalInfoDialogAssistantPopover",
		_DEBUG_MODULES_ID:"TechnicalInfoDialogDebugModules",
		_TECHNICAL_INFO_DIALOG_ID:"technicalInfoDialog",
		_LOCAL_STORAGE_KEYS: {
			STANDARD_URL: "sap-ui-standard-bootstrap-URL",
			CUSTOM_URL: "sap-ui-custom-bootstrap-URL",
			LOCATION: "sap-ui-selected-location",
			OPEN_IN_NEW_WINDOW: "sap-ui-open-sa-in-new-window"
		},

		_storage : new Storage(Storage.Type.local),

		_treeHelper: moduleTreeHelper,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Opens the technical information dialog
		 * @param{function} fnCallback Callback that can be executed to fetch library and module information
		 */
		open: function (fnCallback) {
			// early out if already open
			if (this._oDialog && this._oDialog.isOpen()) {
				return;
			}

			// set module info passed in from jquery.sap.global
			this._oModuleSystemInfo = fnCallback() || {};

			// create dialog lazily
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._TECHNICAL_INFO_DIALOG_ID, "sap.ui.core.support.techinfo.TechnicalInfo", this);
			}

			// refresh configuration data and open dialog
			this._initialize();
			this._oDialog.open();
		},

		/**
		 * Closes the technical information dialog
		 */
		close: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;

			if (this._oAssistantPopover) {
				this._oAssistantPopover.destroy();
				this._oAssistantPopover = null;
			}

			if (this._oDebugPopover) {
				this._oDebugPopover.destroy();
				this._oDebugPopover = null;
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 *  Opens the support tools online help in a new tab
		 */
		onShowHelp: function () {
			mobileLibrary.URLHelper.redirect("https://ui5.sap.com/#/topic/616a3ef07f554e20a3adf749c11f64e9.html#loio616a3ef07f554e20a3adf749c11f64e9", true);
		},

		/**
		 * Opens the currently loaded UI5 version info file in a new tab
		 */
		onShowVersion: function () {
			mobileLibrary.URLHelper.redirect(sap.ui.resource("", "sap-ui-version.json"), true);
		},

		/**
		 * Copies the technical information shown in the dialog to the clipboard
		 */
		onCopyTechnicalInfoToClipboard: function () {
			var oModel = this._oDialog.getModel("view"),
				sVersionString = oModel.getProperty("/ProductName") + ": " +
					oModel.getProperty("/ProductVersion") + " " +
					this._getControl("versionBuiltAt", this._TECHNICAL_INFO_DIALOG_ID).getText(),
				sVersionOpenUI5String = "OpenUI5 Version: " +
					oModel.getProperty("/OpenUI5ProductVersion") + " " +
					this._getControl("versionOpenUI5BuiltAt", this._TECHNICAL_INFO_DIALOG_ID).getText(),
				sString = sVersionString + "\r\n" +
					(oModel.getProperty("/OpenUI5ProductVersion") ? sVersionOpenUI5String + "\r\n" : "") +
					this._getText("TechInfo.UserAgent.Label") + ": " + oModel.getProperty("/UserAgent") + "\r\n" +
					this._getText("TechInfo.AppUrl.Label") + ": " + oModel.getProperty("/ApplicationURL") + "\r\n";

			this._copyToClipboard(sString, "TechInfo.CopyToClipboard");
		},

		/**
		 * Copies the custom sap-ui-debug value to the clipboard
		 */
		onConfigureDebugModulesCopyToClipboard: function () {
			var oModel = this._oDialog.getModel("view"),
				oTree = oModel.getProperty("/DebugModules")[0],
				sString = "sap-ui-debug=" + this._treeHelper.toDebugInfo(oTree);

			this._copyToClipboard(sString, "TechInfo.DebugModulesCopyToClipboard");
		},

		/**
		 * Enables/Disables debug mode globally with a confirmation dialog
		 * @param {sap.ui.base.event} oEvent The checkbox select event
		 */
		onDebugSources: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this._confirmReload(function () {
				this._reloadWithParameter("sap-ui-debug", bSelected);
			}.bind(this), function () {
				var oModel = this._oDialog.getModel("view");
				oModel.setProperty("/DebugMode", !oModel.getProperty("/DebugMode"));
			}.bind(this));
		},

		/**
		 * Opens a dialog with debug package selection options
		 */
		onConfigureDebugModules: function () {
			var oModel = this._oDialog.getModel("view"),
				oTreeResults;

			// early out if already open
			if (this._oDebugPopover && this._oDebugPopover.isOpen()) {
				return;
			}

			// fill and bind the tree structure from the currently loaded modules
			oTreeResults = this._treeHelper.toTreeModel(this._oModuleSystemInfo);
			oModel.setProperty("/DebugModules", [oTreeResults.tree]);
			this._updateTreeInfos();

			// create dialog lazily
			if (!this._oDebugPopover) {
				this._oDebugPopover = sap.ui.xmlfragment(this._DEBUG_MODULES_ID, "sap.ui.core.support.techinfo.TechnicalInfoDebugDialog", this);
				this._oDialog.addDependent(this._oDebugPopover);
				syncStyleClass(this._getContentDensityClass(), this._oDialog, this._oDebugPopover);
				var oControl = this._getControl("customDebugValue", this._DEBUG_MODULES_ID);
				try {
					this._validateCustomDebugValue(oControl.getValue());
				} catch (oException)  {
					this._showError(oControl, oException.message);
					return;
				}
			}

			// adopt tree depth to the deepest currently selected module
			this._getControl("tree", this._DEBUG_MODULES_ID).expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES, oTreeResults.depth));

			// open dialog
			this._oDebugPopover.open();
		},

		/**
		 * Shows a confirmation dialog and triggers the custom debug parameter by reloading
		 */
		onConfigureDebugModulesConfirm: function () {
			this._confirmReload(function () {
				var oModel = this._oDialog.getModel("view");

				this._reloadWithParameter("sap-ui-debug", oModel.getProperty("/CustomDebugMode"));
			}.bind(this));
		},

		/**
		 * Closes the configure debug modules dialog without applying the changes
		 */
		onConfigureDebugModulesClose: function () {
			this.onConfigureDebugModulesReset();
			this._oDebugPopover.close();
		},

		/**
		 * Selects/Deselects a node including its tree branch
		 * @param {sap.ui.base.Event} oEvent The tree select event
		 */
		onConfigureDebugModuleSelect: function (oEvent) {
			var oModel = this._oDialog.getModel("view"),
				oListItem = oEvent.getParameter("listItem"),
				oContext = oListItem.getItemNodeContext(),
				oNodePath = oContext.context.getPath(),
				oSubTreeData = oModel.getProperty(oNodePath),
				oControl = this._getControl("customDebugValue", this._DEBUG_MODULES_ID);

			this._resetValueState(oControl);
			this._treeHelper.recursiveSelect(oSubTreeData, oListItem.getSelected());
			this._updateTreeInfos();
		},

		/**
		 * Sets the validated value from the input field and re-evaluates the module tree according to the input
		 */
		onChangeCustomDebugMode: function () {
			var oModel = this._oDialog.getModel("view"),
				oControl = this._getControl("customDebugValue", this._DEBUG_MODULES_ID),
				oTreeResults;

			try {
				this._validateCustomDebugValue(oControl.getValue());
			} catch (oException)  {
				this._showError(oControl, oException.message);
				return;
			}

			// convert boolean string to boolean value
			if (oModel.getProperty("/CustomDebugMode") === "true") {
				oModel.setProperty("/CustomDebugMode", true);
			}
			if (oModel.getProperty("/CustomDebugMode") === "false") {
				oModel.setProperty("/CustomDebugMode", false);
			}

			// set validated value and update tree accordingly
			window["sap-ui-debug"] = oModel.getProperty("/CustomDebugMode");
			oTreeResults = this._treeHelper.toTreeModel(this._oModuleSystemInfo);
			oModel.setProperty("/DebugModules", [oTreeResults.tree]);

			// adopt tree depth to the deepest currently selected module
			this._getControl("tree", this._DEBUG_MODULES_ID).expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES, oTreeResults.depth));

			this._updateTreeInfos();
		},

		/**
		 * Resets the debug module tree
		 */
		onConfigureDebugModulesReset: function () {
			var oModel = this._oDialog.getModel("view"),
				oTreeData = oModel.getProperty("/DebugModules")[0];

			this._treeHelper.recursiveSelect(oTreeData, false);
			this._updateTreeInfos();
		},

		/**
		 * Opens the diagnostics window
		 */
		onOpenDiagnostics: function () {
			var oSupport = Support.getStub();
			if (oSupport.getType() != Support.StubType.APPLICATION) {
				return;
			}
			oSupport.openSupportTool();
			this.close();
		},

		/**
		 * Opens the test recorder iframe
		 */
		onOpenTestRecorderInIFrame: function () {
			this.close();
			sap.ui.require(["sap/ui/testrecorder/Bootstrap"], function (oBootstrap) {
				oBootstrap.init(["true"]);
			}, function (oError) {
				Log.error("Could not load module 'sap/ui/testrecorder/Bootstrap'! Details: " + oError);
			});
		},

		/**
		 * Opens the support assistant with the given configuration
		 */
		onOpenAssistant: function () {
			var oModel = this._oDialog.getModel("view"),
				sSelectedLocation = oModel.getProperty("/SelectedLocation"),
				sStandardUrl = oModel.getProperty("/StandardBootstrapURL"),
				sCustomUrl = oModel.getProperty("/CustomBootstrapURL"),
				aSupportedUrls = [],
				sBootstrapURL;

			oModel.getProperty("/SupportAssistantPopoverURLs").forEach(function (element) {
				aSupportedUrls.push(element.Value);
			});

			if (aSupportedUrls.indexOf(sStandardUrl) === -1 && sSelectedLocation === "standard") {
				sSelectedLocation = "custom";
				sCustomUrl = sStandardUrl;
				oModel.setProperty("/SelectedLocation", sSelectedLocation);
				this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL, aSupportedUrls[0]);
				oModel.setProperty("/StandardBootstrapURL", this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL));
			}

			if (sSelectedLocation === "standard") {
				sBootstrapURL = sStandardUrl;
			} else if (sCustomUrl) {
				// this checks if selected location is custom and CustomBootstrapURL is filed
				if (!sCustomUrl.match(/\/$/)) {
					// checks if custom URL is missing / at the end and adds it if missing
					sCustomUrl += "/";
				}
				this._storage.put(this._LOCAL_STORAGE_KEYS.CUSTOM_URL, sCustomUrl);
				oModel.setProperty("/CustomBootstrapURL", this._storage.get(this._LOCAL_STORAGE_KEYS.CUSTOM_URL));
				sBootstrapURL = sCustomUrl;
			}
			this._startAssistant(sBootstrapURL);
		},

		/**
		 * Event handler for the two radio buttons in the configuration popover
		 * @param {sap.ui.base.Event} oEvent The button press event
		 */
		onSelectBootstrapOption: function (oEvent) {
			var sKey = oEvent.getSource().getId().split("--").pop();
			this._setActiveLocations(sKey);
		},

		/**
		 * Writes the custom bootstrap URL to local storage
		 * @param {sap.ui.base.Event} oEvent The select change event
		 */
		onChangeStandardBootstrapURL: function (oEvent) {
			var sValue = oEvent.getParameter("selectedItem").getKey(),
				oControl = oEvent.getSource();
			this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL, sValue);
			this._resetValueState(oControl);
			this._pingUrl(sValue, oControl)
				.then(function success() {
					oControl.setValueState("Success");
				}, function error() {
					var sMessage = this._getText("TechInfo.SupportAssistantConfigPopup.NotAvailableAtTheMoment");
					this._showError(oControl, sMessage);
					Log.error("Support Assistant could not be loaded from the URL you entered");
				});
		},

		/**
		 *  Handler for liveChange event fired by custom bootstrap URL.
		 * @param oEvent
		 */
		onLiveChangeCustomBootstrapURL:function (oEvent) {
			var sValue = oEvent.getParameter("value"),
				oControl = oEvent.getSource();
			this._storage.put(this._LOCAL_STORAGE_KEYS.CUSTOM_URL, sValue);
			try {
				this._validateValue(oControl.getValue());
				this._resetValueState(oControl);
			} catch (oException) {
				this._showError(oControl, oException.message);
			}
		},

		/**
		 * Writes the option for opening in new window to local storage
		 * @param {sap.ui.base.event} oEvent The checkbox select event
		 */
		onChangeOpenInNewWindow: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this._storage.put(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW, bSelected);
		},

		/**
		 * Opens a popover with extended configuration options
		 * @param {sap.ui.base.Event} oEvent The button press event
		 */
		onConfigureAssistantBootstrap: function (oEvent) {
			// early out if already open
			if (this._oAssistantPopover && this._oAssistantPopover.isOpen()) {
				return;
			}
			// create dialog lazily
			if (!this._oAssistantPopover) {
				this._oAssistantPopover = sap.ui.xmlfragment(this._SUPPORT_ASSISTANT_POPOVER_ID, "sap.ui.core.support.techinfo.TechnicalInfoAssistantPopover", this);
				this._oAssistantPopover.attachAfterOpen(this._onAssistantPopoverOpened, this);
				this._oDialog.addDependent(this._oAssistantPopover);
				syncStyleClass(this._getContentDensityClass(), this._oDialog, this._oAssistantPopover);

				// register message validation and trigger it once to validate the value coming from local storage
				var oCustomBootstrapURL =  this._getControl("customBootstrapURL", this._SUPPORT_ASSISTANT_POPOVER_ID);
				sap.ui.getCore().getMessageManager().registerObject(oCustomBootstrapURL, true);

			}

			// enable or disable default option for version >= 1.48
			var oCurrentItem = this._getControl("standardBootstrapURL", this._SUPPORT_ASSISTANT_POPOVER_ID).getItems()[0];
			if (this._isVersionBiggerThanMinSupported()) {
				var sAppVersion = sap.ui.getCore().getConfiguration().getVersion().toString();
				oCurrentItem.setText(oCurrentItem.getText().replace("[[version]]", sAppVersion));
				oCurrentItem.setEnabled(true);
			} else {
				oCurrentItem.setText(oCurrentItem.getText().replace("[[version]]", "not supported"));
				oCurrentItem.setEnabled(false);
			}

			var oModel = this._oDialog.getModel("view"),
				sSelectedLocation = oModel.getProperty("/SelectedLocation");

			this._setActiveLocations(sSelectedLocation);

			var oSupportAssistantSettingsButton = this._getControl("supportAssistantSettingsButton", this._TECHNICAL_INFO_DIALOG_ID);
			this._oAssistantPopover.openBy(oSupportAssistantSettingsButton);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Returns the locale-dependent text for the given key. Fetches the resource bundle
		 * and stores it in the type if necessary.
		 *
		 * @param {string} sKey Property key
		 * @param {any[]} aParameters Parameters to replace placeholders in the text
		 * @returns {string} Locale-dependent text for the key
		 */
		_getText: function (sKey, aParameters) {
			return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParameters);
		},

		/**
		 * This is a custom model type for validating a URL ending with sap/ui/support/
		 */
		_validateValue: function (sValue) {
			var oRegexpCoreURL = /^https?:\/\/(www\.)?([-a-zA-Z0-9.%_+~#=]{2,})([-a-zA-Z0-9@:%_+.~#?&/=]*)\/sap\/ui\/support\/?$/,
				sApplicationProtocol = window.location.protocol;

			if (sValue && !sValue.match(oRegexpCoreURL)) {
				throw new ValidateException(this._getText("TechInfo.SupportAssistantConfigPopup.URLValidationMessage"));
			}
			if (sValue && sApplicationProtocol === "https:" && !sValue.match(sApplicationProtocol)) {
				throw new ValidateException(this._getText("TechInfo.SupportAssistantConfigPopup.ProtocolError"));
			}
			return true;
		},

		/**
		 * This is a custom validating a sap-ui-debug string.
		 * the sap-ui-debug value can be a
		 *  - boolean (x,X is also interpreted as true)
		 *  - list of modules separated with commas
		 * Each module can contain wildcards with * or ** and regular expression characters
		 */
		_validateCustomDebugValue: function (sValue) {
			var oRegexpMode = /^(true|false|x|X)$|^(([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+(,([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+)*)$/;

			if (sValue && !sValue.match(oRegexpMode)) {
				throw new ValidateException(this._getText("TechInfo.DebugModulesConfigPopup.ModeValidationMessage"));
			}
			return true;
		},

		/**
		 * Converts the build date retrieved by the gloabl version info to a date object
		 * @param {string} sDate the date in a proprietary format "yyyyMMdd-HHmmss" (the dash is optional)
		 * @private
		 * @return {Date} Date object with the build timestamp
		 */
		_convertBuildDate: function (sDate) {
			var oData = DateFormat.getInstance({
				pattern: "yyyyMMdd-HHmmss"
			});
			return oData.parse(sDate);
		},

		_getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		/**
		 * Start the support assistant with the given bootstrap URL
		 * By default, it is started with the current version for >=1.48 release or SAPUI5 CDN version for lower releases.
		 * This behavior can be overridden by specifying a custom bootstrap URL where the support assistant is loaded from
		 * @param {string} [sBootstrapURL] If specified, the support assistant will be started with a custom bootstrap URL.
		 * @private
		 */
		_startAssistant: function (sBootstrapURL) {
			var oModel = this._oDialog.getModel("view"),
				oSettings = {
					// start the application in support mode
					support: "true",
					// open in new window
					window: oModel.getProperty("/OpenSupportAssistantInNewWindow")
				};

			this._loadAssistant(sBootstrapURL, oSettings);
		},

		/**
		 * Try to load Support Assistant with passed sUrl and aParams by making ajax request to Bootstrap.js.
		 * If Bootsrap.js is missing error occurs in the console otherwise starts Support Assistant.
		 * @param {string} sUrl Url where to load Support Assistant from.
		 * @param {object} oSettings Parameters that needs to be passed to Support Assistant.
		 * @private
		 */
		_loadAssistant: function (sUrl, oSettings) {
			this._pingUrl(sUrl)
				.then(function success() {
					this.close();
					var aSettings = [oSettings.support];
					sap.ui.getCore().loadLibrary("sap.ui.support", { async: true, url: sUrl })
						.then(function () {
							if (oSettings.window) {
								aSettings.push("window");
							}

							if (aSettings[0].toLowerCase() === "true" || aSettings[0].toLowerCase() === "silent") {
								sap.ui.require(["sap/ui/support/Bootstrap"], function (oBootstrap) {
									oBootstrap.initSupportRules(aSettings);
								});
							}
						});
				}, function error(jqXHR, exception) {
					var msg = this._getText("TechInfo.SupportAssistantConfigPopup.SupportAssistantNotFound");
					if (jqXHR.status === 0) {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.ErrorTryingToGetRecourse");
					} else if (jqXHR.status === 404) {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.ErrorNotFound");
					} else if (jqXHR.status === 500) {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.InternalServerError");
					} else if (exception === 'parsererror') {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.ErrorOnJsonParse");
					} else if (exception === 'timeout') {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.ErrorOnTimeout");
					} else if (exception === 'abort') {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.ErrorWhenAborted");
					} else {
						msg += this._getText("TechInfo.SupportAssistantConfigPopup.UncaughtError") + jqXHR.responseText;
					}
					this._sErrorMessage = msg;
					this.onConfigureAssistantBootstrap();
					Log.error("Support Assistant could not be loaded from the URL you entered");
				});
		},

		/**
		 * Initalizes the technical information dialog
		 * @private
		 */
		_initialize: function () {
			// create i18n model
			var oI18nModel = new ResourceModel({
				bundleName: "sap.ui.core.messagebundle"
			});
			this._oDialog.setModel(oI18nModel, "i18n");
			this._oDialog.setModel(this._createViewModel(), "view");

			// set compact/cozy style class
			this._oDialog.addStyleClass(this._getContentDensityClass());
		},

		/**
		 * Initializes the view model with the current runtime information
		 * @private
		 * @return {JSONModel} Model with filled data.
		 */
		_createViewModel: function () {
			var sDefaultBootstrapURL = new URI(sap.ui.require.toUrl(""), window.location.origin + window.location.pathname) + "/sap/ui/support/",
				sDefaultSelectedLocation = "standard",
				sDefaultOpenInNewWindow = false;

			this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.STANDARD_URL, sDefaultBootstrapURL);
			this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.LOCATION, sDefaultSelectedLocation);
			this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW, sDefaultOpenInNewWindow);

			var oViewModel = new JSONModel({
				"ProductName": "SAPUI5",
				"StandardBootstrapURL": this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL),
				"CustomBootstrapURL": this._storage.get(this._LOCAL_STORAGE_KEYS.CUSTOM_URL),
				"OpenSupportAssistantInNewWindow": this._storage.get(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW),
				"SelectedLocation": this._storage.get(this._LOCAL_STORAGE_KEYS.LOCATION),
				"OpenUI5ProductVersion": null,
				"OpenUI5ProductTimestamp": null,
				"DebugModuleSelectionCount": 0
			});

			// load version info into view model
			var oVersionInfo = {};
			try {
				oVersionInfo = Global.getVersionInfo();
				oViewModel.setProperty("/ProductName", oVersionInfo.name);
				oViewModel.setProperty("/ProductVersion", oVersionInfo.version);
			} catch (oException) {
				oVersionInfo.version = "";
				Log.error("failed to load global version info");
			}

			try {
				oViewModel.setProperty("/ProductTimestamp", this._generateLocalizedBuildDate(oVersionInfo.buildTimestamp));
			} catch (oException) {
				Log.error("failed to parse build timestamp from global version info");
			}

			if (!/openui5/i.test(oVersionInfo.name)) {
				oViewModel.setProperty("/OpenUI5ProductVersion", Global.version);
				// convert build timestamp
				try {
					oViewModel.setProperty("/OpenUI5ProductTimestamp", this._generateLocalizedBuildDate(Global.buildinfo.buildtime));
				} catch (oException) {
					Log.error("failed to parse OpenUI5 build timestamp from global version info");
				}
			}

			var sAppVersion;
			try {
				sAppVersion = this._getText("TechInfo.SupportAssistantConfigPopup.AppVersionOption", oVersionInfo.version);
			} catch (oException) {
				sAppVersion = "Application";
			}

			var aSupportedUrls = [
				{
					"DisplayName": sAppVersion,
					"Value": sDefaultBootstrapURL
				},
				{
					"DisplayName": "OpenUI5 CDN",
					"Value": "https://openui5.hana.ondemand.com/resources/sap/ui/support/"
				},
				{
					"DisplayName": "OpenUI5 (Nightly)",
					"Value": "https://openui5nightly.hana.ondemand.com/resources/sap/ui/support/"
				},
				{
					"DisplayName": "OpenUI5 (Beta)",
					"Value": "https://openui5beta.hana.ondemand.com/resources/sap/ui/support/"
				},
				{
					"DisplayName": "SAPUI5 CDN",
					"Value": "https://sapui5.hana.ondemand.com/resources/sap/ui/support/"
				}
			];
			var sDebugModulesTitle = this._getText("TechInfo.DebugModulesConfigPopup.SelectionCounter", oViewModel.DebugModuleSelectionCount);
			oViewModel.setProperty("/DebugModulesTitle", sDebugModulesTitle);
			oViewModel.setProperty("/SupportAssistantPopoverURLs", aSupportedUrls);
			oViewModel.setProperty("/ApplicationURL", document.location.href);
			oViewModel.setProperty("/UserAgent", navigator.userAgent);
			oViewModel.setProperty("/DebugMode", sap.ui.getCore().getConfiguration().getDebug());

			// If ui version is smaller than 1.48 this sets the default location from where the SA will be loaded
			// to OpenUI5 (Nightly) because the SA is not available in 1.44 or lower version
			if (!this._isVersionBiggerThanMinSupported()) {
				oViewModel.setProperty("/StandardBootstrapURL",aSupportedUrls[2].Value);
				this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL,aSupportedUrls[2].Value);
			}
			oViewModel.setSizeLimit(100000);
			return oViewModel;
		},

		/**
		 * Checks if variable is set in local storage. If the variable is empty
		 * function sets its default value. If variable is already set it continues.
		 * @param {string} sParameter Name of the variable that needs to be checked.
		 * @param {string} sDefault Default value of the sNameOfVar
		 * @private
		 */
		_saveLocalStorageDefault: function (sParameter,sDefault) {
		if (!this._storage.get(sParameter)) {
				this._storage.put(sParameter, sDefault);
			}
		},

		/**
		 * Checks if current version of UI5 is equal or higher than minimum UI5 version
		 * that Support Assistant is available at.
		 * @returns {boolean}
		 * @private
		 */
		_isVersionBiggerThanMinSupported: function () {
			var oVersion = sap.ui.getCore().getConfiguration().getVersion();
			if (oVersion && oVersion.compareTo(this._MIN_UI5VERSION_SUPPORT_ASSISTANT) >= 0) {
				return true;
			}
			return false;
		},

		/**
		 * Generates formatted and localized text from passed timestamp
		 * @param {string} sBuildTimestamp Timestamp as string
		 * @private
		 */
		_generateLocalizedBuildDate: function (sBuildTimestamp) {
			var oDateFormat = DateFormat.getDateInstance({pattern: "dd.MM.yyyy HH:mm:ss"}),
				sBuildDate = oDateFormat.format(this._convertBuildDate(sBuildTimestamp));

			return this._getText("TechInfo.VersionBuildTime.Text", sBuildDate);
		},

		/**
		 * Sets active location and toggle between "standard" and "custom" locations.
		 * Saves last active location.
		 * @param {string} sValue Possible values "standard" or "custom"
		 * @private
		 */
		_setActiveLocations: function (sValue) {
			var oModel = this._oDialog.getModel("view"),
				oRadioBtnStandart = this._getControl("standard", this._SUPPORT_ASSISTANT_POPOVER_ID),
				oRadioBtnCustom = this._getControl("custom", this._SUPPORT_ASSISTANT_POPOVER_ID),
				oCustom = this._getControl("customBootstrapURL", this._SUPPORT_ASSISTANT_POPOVER_ID),
				oStandard = this._getControl("standardBootstrapURL", this._SUPPORT_ASSISTANT_POPOVER_ID),
				bStandardLocationEnabled;

				this._resetValueState(oCustom);
				this._resetValueState(oStandard);

			if (sValue === "standard") {
				bStandardLocationEnabled = true;
				oModel.setProperty("/StandardBootstrapURL", this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL));
				oStandard.setSelectedKey(oModel.getProperty("/StandardBootstrapURL"));
			} else {
				bStandardLocationEnabled = false;
			}

			oStandard.setEnabled(bStandardLocationEnabled);
			oRadioBtnStandart.setSelected(bStandardLocationEnabled);
			oCustom.setEnabled(!bStandardLocationEnabled);
			oRadioBtnCustom.setSelected(!bStandardLocationEnabled);

			this._storage.put(this._LOCAL_STORAGE_KEYS.LOCATION, sValue);
			oModel.setProperty("/SelectedLocation", this._storage.get(this._LOCAL_STORAGE_KEYS.LOCATION));
		},

		/**
		 * Called after OK action is triggered
		 * @name confirmActionCallback
		 * @function
		 * @private
		 */

		/**
		 * Called after CANCEL action is triggered
		 * @name cancelActionCallback
		 * @function
		 * @private
		 */

		/**
		 * Displays a confirmation message to reload the current page
		 * @param {confirmActionCallback} fnConfirm Callback function to be executed after the "ok" action is triggered
		 * @param {cancelActionCallback} [fnCancel] Callback function to be executed after the "cancel" action is triggered
		 * @private
		 */
		_confirmReload: function (fnConfirm, fnCancel) {
			MessageBox.confirm(
				this._getText("TechInfo.DebugSources.ConfirmMessage"), {
					title: this._getText("TechInfo.DebugSources.ConfirmTitle"),
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							fnConfirm();
						} else if (fnCancel) {
							fnCancel();
						}
					}
				}
			);
		},
		/**
		 * Handler for onAfterOpen event from popover
		 * @private
		 */
		_onAssistantPopoverOpened: function () {
			var oModel = this._oDialog.getModel("view"),
				sSelectedLocation = oModel.getProperty("/SelectedLocation"),
				oControl;

			if (sSelectedLocation === "custom") {
				oControl = this._getControl("customBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID);
				var sValue = oControl.getValue();
				try {
					this._validateValue(sValue);
				} catch (oException) {
					this._showError(oControl, oException.message);
					if (this._sErrorMessage) {
						this._sErrorMessage = null;
					}
					return;
				}
			} else {
				oControl = this._getControl("standardBootstrapURL", this._SUPPORT_ASSISTANT_POPOVER_ID);
			}

			if (this._sErrorMessage) {
				this._showError(oControl, this._sErrorMessage);
				this._sErrorMessage = null;
			}
		},

		/**
		 * Display passed message as error state for the control.
		 * @param oControl Control that should display the message.
		 * @param sMessage Error message as text.
		 * @private
		 */
		_showError : function (oControl, sMessage) {
			oControl.setValueStateText(sMessage);
			oControl.setValueState("Error");
			oControl.openValueStateMessage();
		},
		/**
		 * Resets the valueState to "None" and close value State message if its opened.
		 * @param oControl Control that should display the message.
		 * @private
		 */
		_resetValueState : function (oControl) {
			oControl.setValueState("None");
			oControl.closeValueStateMessage();
		},
		/**
		 * Pings specific Url to get the status.
		 * @param sUrl {string} URL that needs to be ping
		 * @returns {Promise}
		 * @private
		 */
		_pingUrl: function (sUrl) {
			return jQuery.ajax({
				type: "HEAD",
				async: true,
				context: this,
				url: sUrl + "Bootstrap.js"
			});
		},
		/**
		 * Gets the instance of the control. If context such as fragment is provided the
		 * function will search for id in provided context. If context is not provided the standard
		 * @param {string} sControlId The id of the searched control.
		 * @param {string} sFragmentId The id of the context where the searched control is located.
		 * @private
		 */
		_getControl:function (sControlId, sFragmentId) {
			if (sFragmentId) {
				return sap.ui.getCore().byId(sFragmentId + "--" + sControlId);
			}
			return sap.ui.getCore().byId(sControlId);
		},

		/**
		 * Replaces the URL parameter and triggers a reload of the current page
		 * @param {string} sParameter Parameter name
		 * @param {any} vValue Parameter value
		 * @private
		 */
		_reloadWithParameter: function(sParameter, vValue) {
			// fetch current parameters from URL
			var sSearch = window.location.search,
				sURLParameter = sParameter + "=" + vValue;

			/// replace or append the new URL parameter
			if (sSearch && sSearch !== "?") {
				var oRegExp = new RegExp("(?:^|\\?|&)" + sParameter + "=[^&]+");
				if (sSearch.match(oRegExp)) {
					sSearch = sSearch.replace(oRegExp, sURLParameter);
				} else {
					sSearch += "&" + sURLParameter;
				}
			} else {
				sSearch = "?" + sURLParameter;
			}

			// reload the page by setting the new parameters
			window.location.search = sSearch;
		},

		/**
		 * Copies the technical information shown in the dialog to the clipboard
		 * @param {string} sString The string to be copied
		 * @param {string} sConfirmTextPrefix The prefix for the i18n texts to be displayed on success/error
		 * @private
		 */
		_copyToClipboard: function (sString, sConfirmTextPrefix) {
			var $temp = jQuery("<textarea>");

			try {
				jQuery("body").append($temp);
				$temp.val(sString).select();
				document.execCommand("copy");
				$temp.remove();
				MessageToast.show(this._getText(sConfirmTextPrefix + ".Success"));
			} catch (oException) {
				MessageToast.show(this._getText(sConfirmTextPrefix + ".Error"));
			}
		},

		/**
		 * Updates the debug mode input field and the number of selected debug modules
		 * @private
		 */
		_updateTreeInfos: function () {
			var oModel = this._oDialog.getModel("view"),
				oTreeData = oModel.getProperty("/DebugModules")[0],
				sDisplayCount;
			oModel.setProperty("/CustomDebugMode", this._treeHelper.toDebugInfo(oTreeData));
			oModel.setProperty("/DebugModuleSelectionCount", this._treeHelper.getSelectionCount(oTreeData));
			sDisplayCount = oModel.getProperty("/DebugModuleSelectionCount").toString();
			oModel.setProperty("/DebugModulesTitle", this._getText("TechInfo.DebugModulesConfigPopup.SelectionCounter", sDisplayCount));
		}
	};
});