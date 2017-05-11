/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
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
	'sap/m/library',
	"jquery.sap.global",
	"jquery.sap.storage"
], function (UI5Object, moduleTreeHelper, Device, Global, DateFormat, ResourceModel, JSONModel, URI, MessageBox, MessageToast, Support, SimpleType, ValidateException, mobileLibrary, jQuery) {
	"use strict";

	return {

		_MIN_UI5VERSION_SUPPORT_ASSISTANT: "1.47",
		_MIN_EXPAND_LEVEL_DEBUG_MODULES: 3,

		_storage : jQuery.sap.storage(jQuery.sap.storage.Type.local),

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
				this._oDialog = sap.ui.xmlfragment("technicalInfoDialog", "sap.ui.core.support.techinfo.TechnicalInfo", this);
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
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 *  Opens the support tools online help in a new tab
		 */
		onShowHelp: function () {
			mobileLibrary.URLHelper.redirect("https://sapui5.hana.ondemand.com/#docs/guide/37a34cc084014bcdb1d13e6c0976042a.html", true);
		},

		/**
		 * Opens the currently loaded UI5 version info file in a new tab
		 */
		onShowVersion: function () {
			mobileLibrary.URLHelper.redirect(sap.ui.resource("", "sap-ui-version.json"), true);
		},

		/**
		 * Copies the technical information shown in the dialog to the clipboard
		 * @param {string} sString The string to be copied
		 * @param {string} sConfirmTextPrefix The prefix for the i18n texts to be displayed on success/error
		 * @private
		 */
		_CopyToClipboard: function (sString, sConfirmTextPrefix) {
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
		 * Copies the technical information shown in the dialog to the clipboard
		 */
		onCopyTechnicalInfoToClipboard: function () {
			var oModel = this._oDialog.getModel("view"),
				sVersionString = oModel.getProperty("/ProductName") + ": " +
					oModel.getProperty("/ProductVersion") + " " +
					sap.ui.getCore().byId("technicalInfoDialog--versionBuiltAt").getText(),
				sVersionOpenUI5String = "OpenUI5 Version: " +
					oModel.getProperty("/OpenUI5ProductVersion") + " " +
					sap.ui.getCore().byId("technicalInfoDialog--versionOpenUI5BuiltAt").getText(),
				sString = sVersionString + "\r\n" +
					(oModel.getProperty("/OpenUI5ProductVersion") ? sVersionOpenUI5String + "\r\n" : "") +
					this._getText("TechInfo.UserAgent.Label") + ": " + oModel.getProperty("/UserAgent") + "\r\n" +
					this._getText("TechInfo.AppUrl.Label") + ": " + oModel.getProperty("/ApplicationURL") + "\r\n";

			this._CopyToClipboard(sString, "TechInfo.CopyToClipboard");
		},

		/**
		 * Copies the custom sap-ui-debug value to the clipboard
		 */
		onConfigureDebugModulesCopyToClipboard: function () {
			var oModel = this._oDialog.getModel("view"),
				oTree = oModel.getProperty("/DebugModules")[0],
				sString = "sap-ui-debug=" + this._treeHelper.toDebugInfo(oTree);

			this._CopyToClipboard(sString, "TechInfo.DebugModulesCopyToClipboard");
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
				this._oDebugPopover = sap.ui.xmlfragment("TechnicalInfoDialogDebugModules", "sap.ui.core.support.techinfo.TechnicalInfoDebugDialog", this);
				this._oDialog.addDependent(this._oDebugPopover);
				jQuery.sap.syncStyleClass(this._getContentDensityClass(), this._oDialog, this._oDebugPopover);

				// register message validation and trigger it once to validate the value coming from local storage
				var oCustomDebugValue = sap.ui.getCore().byId("TechnicalInfoDialogDebugModules--customDebugValue");
				sap.ui.getCore().getMessageManager().registerObject(oCustomDebugValue, true);
				var oBinding = oCustomDebugValue.getBinding("value");
				try {
					oBinding.getType().validateValue(oCustomDebugValue.getValue());
				} catch (oException) {
					oCustomDebugValue.setValueState("Error");
				}
			}

			// adopt tree depth to the deepest currently selected module
			sap.ui.getCore().byId("TechnicalInfoDialogDebugModules--tree").expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES, oTreeResults.depth));

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
		 * Updates the debug mode input field and the number of selected debug modules
		 * @private
		 */
		_updateTreeInfos: function () {
			var oModel = this._oDialog.getModel("view"),
				oTreeData = oModel.getProperty("/DebugModules")[0];

			oModel.setProperty("/CustomDebugMode", this._treeHelper.toDebugInfo(oTreeData));
			oModel.setProperty("/DebugModuleSelectionCount", this._treeHelper.getSelectionCount(oTreeData));
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
				oSubTreeData = oModel.getProperty(oNodePath);

			this._treeHelper.recursiveSelect(oSubTreeData, oListItem.getSelected());
			this._updateTreeInfos();
		},

		/**
		 * Sets the validated value from the input field and re-evaluates the module tree according to the input
		 */
		onChangeCustomDebugMode: function () {
			var oModel = this._oDialog.getModel("view"),
				oTreeResults;

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
			sap.ui.getCore().byId("TechnicalInfoDialogDebugModules--tree").expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES, oTreeResults.depth));

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
		 * Opens the support assistant with the given configuration
 		 */
		onOpenAssistant: function () {
			var oModel = this._oDialog.getModel("view"),
				sSelectedLocation = oModel.getProperty("/SelectedLocation"),
				sStandardUrl = oModel.getProperty("/StandardBootstrapURL"),
				sCustomUrl = oModel.getProperty("/CustomBootstrapURL"),
				sBootstrapURL;

			if (sSelectedLocation === "standard") {
				sBootstrapURL = sStandardUrl;
			} else	if (sCustomUrl) {
				// this checks if selected location is custom and CustomBootstrapURL is filed
				if (!sCustomUrl.match(/\/$/)) {
					// checks if custom URL is missing / at the end and adds it if missing
					sCustomUrl += "/";
				}
				this._storage.put("sap-ui-custom-bootstrap-URL", sCustomUrl);
				oModel.setProperty("/CustomBootstrapURL", this._storage.get("sap-ui-custom-bootstrap-URL"));
				sBootstrapURL = sCustomUrl;
			} else {
				// returns active location to standard when custom location is selected but input filed is empty
				sBootstrapURL = sStandardUrl;
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
			var sValue = oEvent.getParameter("selectedItem").getKey();
			this._storage.put("sap-ui-standard-bootstrap-URL", sValue);
		},

		/**
		 * Writes the custom bootstrap URL to local storage
		 * @param {sap.ui.base.Event} oEvent The input change event
		 */
		onChangeCustomBootstrapURL: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			this._storage.put("sap-ui-custom-bootstrap-URL", sValue);
		},

		/**
		 * Writes the option for opening in new window to local storage
		 * @param {sap.ui.base.event} oEvent The checkbox select event
		 */
		onChangeOpenInNewWindow: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this._storage.put("sap-ui-open-sa-in-new-window", bSelected);
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
				this._oAssistantPopover = sap.ui.xmlfragment("technicalInfoDialogAssistantPopover", "sap.ui.core.support.techinfo.TechnicalInfoAssistantPopover", this);
				this._oDialog.addDependent(this._oAssistantPopover);
				jQuery.sap.syncStyleClass(this._getContentDensityClass(), this._oDialog, this._oAssistantPopover);

				// register message validation and trigger it once to validate the value coming from local storage
				var oCustomBootstrapURL = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--customBootstrapURL");
				sap.ui.getCore().getMessageManager().registerObject(oCustomBootstrapURL, true);
				var oBinding = oCustomBootstrapURL.getBinding("value");
				try {
					oBinding.getType().validateValue(oCustomBootstrapURL.getValue());
				} catch (oException) {
					oCustomBootstrapURL.setValueState("Error");
				}
			}

			// enable or disable default option for version >= 1.48
			var oCurrentItem = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standardBootstrapURL").getItems()[0];
			if (sap.ui.getCore().getConfiguration().getVersion().compareTo(this._MIN_UI5VERSION_SUPPORT_ASSISTANT) >= 0) {
				var sAppVersion = sap.ui.getCore().getConfiguration().getVersion().toString();
				oCurrentItem.setText(oCurrentItem.getText().replace("[[version]]", sAppVersion));
				oCurrentItem.setEnabled(true);
			} else {
				oCurrentItem.setText(oCurrentItem.getText().replace("[[version]]", "not supported"));
				oCurrentItem.setEnabled(false);
			}

			var oModel = this._oDialog.getModel("view"),
				sSelectedLocation = oModel.getProperty("/SelectedLocation");

			if (sSelectedLocation === "custom" && !oModel.getProperty("/CustomBootstrapURL")) {
				this._setActiveLocations("standard");
			} else {
				this._setActiveLocations(sSelectedLocation);
			}

			// refresh configuration data and open dialog
			this._oAssistantPopover.openBy(oEvent.getSource());
		},

		/**
		 * This is a custom model type for validating a URL ending with sap/ui/support/
		 */
		CustomTypeURL : SimpleType.extend("URL", {
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				return oValue;
			},
			validateValue: function (oValue) {
				var oRegexpCoreURL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:.%_+~#=]{2,}(\.)?[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)\/sap\/ui\/support\/?$/;
				if (oValue && !oValue.match(oRegexpCoreURL)) {
					throw new ValidateException("'" + oValue + "' is not a valid URL");
				}
				return true;
			}
		}),

		/**
		 * This is a custom model type for validating a sap-ui-debug string.
		 * the sap-ui-debug value can be a
		 *  - boolean (x,X is also interpreted as true)
		 *  - list of modules separated with commas
		 * Each module can contain wildcards with * or ** and regular expression characters
		 */
		CustomTypeMode : SimpleType.extend("URL", {
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				return oValue;
			},
			validateValue: function (oValue) {
				var oRegexpMode = /^(true|false|x|X)$|^(([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+(,([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+)*)$/;
				if (oValue && !oValue.match(oRegexpMode)) {
					throw new ValidateException("'" + oValue + "' is not a valid sap-ui-debug value");
				}
				return true;
			}
		}),

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
			this.close();
		},

		/**
		 * Try to load Support Assistant with passed sUrl and aParams by making ajax request to Bootstrap.js.
		 * If Bootsrap.js is missing error occurs in the console otherwise starts Support Assistant.
		 * @param {string} sUrl Url where to load Support Assistant from.
		 * @param {object} oSettings Parameters that needs to be passed to Support Assistant.
		 * @private
		 */
		_loadAssistant: function (sUrl, oSettings) {
			jQuery.ajax({
				type: "HEAD",
				async: true,
				url: sUrl + "Bootstrap.js",
				success: function () {
					jQuery.sap.registerModulePath("sap.ui.support", sUrl);
					var oBootstrap = sap.ui.requireSync("sap/ui/support/Bootstrap");
					// Settings needs to be converted to array required by initSupportRules function
					var aSettings = [oSettings.support];
					if (oSettings.window) {
						aSettings.push("window");
					}
					oBootstrap.initSupportRules(aSettings);
				},
				error: function () {
					jQuery.sap.log.error("Support Assistant could not be loaded from the URL you entered");
				}
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
		 * Initalizes the view model with the current runtime information
		 * @private
		 * @return {JSONModel} Model with filled data.
		 */
		_createViewModel: function () {
			var sDefaultBootstrapURL = new URI(jQuery.sap.getResourcePath(""), window.location.href ) + "/sap/ui/support/",
				sDefaultSelectedLocation = "standard",
				sDefaultOpenInNewWindow = false;

			//check if storage is empty and sets default.
			this._saveLocalStorageDefault("sap-ui-standard-bootstrap-URL", sDefaultBootstrapURL);
			this._saveLocalStorageDefault("sap-ui-selected-location", sDefaultSelectedLocation);
			this._saveLocalStorageDefault("sap-ui-open-sa-in-new-window", sDefaultOpenInNewWindow);

			var oViewModel = new JSONModel({
				"ProductName": "SAPUI5",
				"StandardBootstrapURL": this._storage.get("sap-ui-standard-bootstrap-URL"),
				"CustomBootstrapURL": this._storage.get("sap-ui-custom-bootstrap-URL"),
				"OpenSupportAssistantInNewWindow": this._storage.get("sap-ui-open-sa-in-new-window"),
				"SelectedLocation": this._storage.get("sap-ui-selected-location"),
				"OpenUI5ProductVersion": null,
				"OpenUI5ProductTimestamp": null,
				"DebugModuleSelectionCount": 0
			});

			// load version info into view model
			var oVersionInfo;
			try {
				oVersionInfo = Global.getVersionInfo();
				oViewModel.setProperty("/ProductName", oVersionInfo.name);
				oViewModel.setProperty("/ProductVersion", oVersionInfo.version);
			} catch (oException) {
				oVersionInfo.version = "";
				jQuery.sap.log.error("failed to load global version info");
			}

			// convert build timestamp
			try {
				oViewModel.setProperty("/ProductTimestamp", this._convertBuildDate(oVersionInfo.buildTimestamp));
			} catch (oException) {
				jQuery.sap.log.error("failed to parse build timestamp from global version info");
			}

			if (!/openui5/i.test(oVersionInfo.name)) {
				oViewModel.setProperty("/OpenUI5ProductVersion", Global.version);
				// convert build timestamp
				try {
					oViewModel.setProperty("/OpenUI5ProductTimestamp", this._convertBuildDate(Global.buildinfo.buildtime));
				} catch (oException) {
					jQuery.sap.log.error("failed to parse OpenUI5 build timestamp from global version info");
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

			oViewModel.setProperty("/SupportAssistantPopoverURLs", aSupportedUrls);
			oViewModel.setProperty("/ApplicationURL", document.location.href);
			oViewModel.setProperty("/UserAgent", navigator.userAgent);
			oViewModel.setProperty("/DebugMode", sap.ui.getCore().getConfiguration().getDebug());
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
		 * Sets active location and toggle between "standard" and "custom" locations.
		 * Saves last active location.
		 * @param {string} sValue Possible values "standard" or "custom"
		 * @private
		 */
		_setActiveLocations: function (sValue) {
			var oModel = this._oDialog.getModel("view"),
				oRadioBtnStandart = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standard"),
				oRadioBtnCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--custom"),
				oCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--customBootstrapURL"),
				oStandard = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standardBootstrapURL"),
				bStandardLocationEnabled;

			if (sValue === "standard") {
				bStandardLocationEnabled = true;
				oModel.setProperty("/StandardBootstrapURL", this._storage.get("sap-ui-standard-bootstrap-URL"));
				oStandard.setSelectedKey(oModel.getProperty("/StandardBootstrapURL"));
			} else {
				bStandardLocationEnabled = false;
			}

			oStandard.setEnabled(bStandardLocationEnabled);
			oRadioBtnStandart.setSelected(bStandardLocationEnabled);
			oCustom.setEnabled(!bStandardLocationEnabled);
			oRadioBtnCustom.setSelected(!bStandardLocationEnabled);

			this._storage.put("sap-ui-selected-location", sValue);
			oModel.setProperty("/SelectedLocation", this._storage.get("sap-ui-selected-location"));
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
		}
	};
});