/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/documentation/sdk/model/models",
	"sap/ui/documentation/sdk/controller/ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/CookiesConsentManager",
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/ui/documentation/sdk/controller/util/ConfigUtil",
	"sap/ui/documentation/sdk/controller/util/URLUtil",
	"sap/base/util/Version",
	"sap/ui/documentation/sdk/util/Resources",
	// used via manifest.json
	"sap/ui/documentation/sdk/util/DocumentationRouter",
	// implements sap.m.TablePopin
	"sap/m/ColumnListItem"
], function(
	jQuery,
	UIComponent,
	Device,
	models,
	ErrorHandler,
	JSONModel,
	CookiesConsentManager,
	UsageTracker,
	ConfigUtil,
	DemokitURLUtil,
	Version,
	ResourcesUtil /*, DocumentationRouter, ColumnListItem*/
) {
		"use strict";

		return UIComponent.extend("sap.ui.documentation.sdk.Component", {

			metadata : {
				manifest : "json",
				includes : [
					"css/style.css"
				]
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this method, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {

				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// set the global libs data
				this.setModel(new JSONModel(), "libsData");

				// set the global version data
				this.setModel(new JSONModel(), "versionData");

				// set the data for the global search
				this.setModel(new JSONModel({ includeDeprecated: false }), "searchData");

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// Load VersionInfo model promise
				this.loadVersionInfo();

				// create the views based on the url/hash
				this.getRouter().initialize();

			},

			getCookiesConsentManager: function() {
				if (!this._oCookiesConsentManager) {
					const oConfig = {
						defaultConsentDialogComponentId: "sap.ui.documentation.sdk.cookieSettingsDialog"
					};
					this._oCookiesConsentManager = CookiesConsentManager.create(this, oConfig);
				}
				return this._oCookiesConsentManager;
			},

			getUsageTracker: function() {
				if (!this._oUsageTracker) {
					this._oUsageTracker = new UsageTracker(this);
				}
				return this._oUsageTracker;
			},

			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ListSelector and ErrorHandler are destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this._oErrorHandler.destroy();
				this._oConfigUtil.destroy();
				this._oConfigUtil = null;
				this._oCookiesConsentManager?.destroy();
				this._oCookiesConsentManager = null;
				this._oUsageTracker?.destroy();
				this._oUsageTracker = null;
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
			 */
			getContentDensityClass : function () {
				if (!this._sContentDensityClass) {
					if (!Device.support.touch) {
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			},
			getConfigUtil: function() {
				if (!this._oConfigUtil) {
					this._oConfigUtil = new ConfigUtil(this);
				}
				return this._oConfigUtil;
			},

			getConfig : function () {
				return this.getManifestEntry("/sap.ui5/config") || {};
			},


			// MODELS
			loadVersionInfo: function () {
				if (!this._oVersionInfoPromise) {
					this._oVersionInfoPromise = new Promise(function (resolve, reject) {
						jQuery.ajax({
							async: true,
							url : ResourcesUtil.getResourceOriginPath("resources/sap-ui-version.json"),
							dataType : 'json',
							success : function(oResponse) {
								this._bindVersionModel(oResponse);
								resolve(oResponse);
							}.bind(this),
							error : function (err) {
								reject(err);
							}
						});
					}.bind(this));
				}
				return this._oVersionInfoPromise;
			},

			loadMessagesInfo: function () {
				if (!this.oMessagesInfo) {
					this.oMessagesInfo = fetch(sap.ui.require.toUrl('sap/ui/documentation/sdk/model/messagesData.json'))
					.then((resp) => {
						const jsonResp = resp.json();
						this.oMessagesInfo = jsonResp;
						return Promise.resolve(jsonResp);
					})
					.catch((e) => {
						return Promise.reject(e);
					});
				}
				return this.oMessagesInfo;
			},

			_bindVersionModel : function (oVersionInfo) {
				var oVersion,
					bSnapshot,
					bOpenUI5,
					sVersionSuffix,
					bIsInternal,
					sVersionPrefixPath = ResourcesUtil.getResourcesVersion();

				this.aAllowedMembers = ["public", "protected"];

				if (!oVersionInfo) {
					return;
				}

				oVersion = Version(oVersionInfo.version);
				sVersionSuffix = oVersion.getSuffix();
				bSnapshot = /-SNAPSHOT$/i.test(sVersionSuffix);
				bOpenUI5 = oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav);

				// We show restricted members for internal versions
				if (ResourcesUtil.isInternal(oVersionInfo)) {
					bIsInternal = true;
					this.aAllowedMembers.push("restricted");
				}

				this.getModel("versionData").setData({
					enableAdvancedCookieSettings: false, // this flag is left for eventual future advanced cookie settings
					versionGav: oVersionInfo.gav,
					versionName: oVersionInfo.name,
					version: [oVersion.getMajor(), oVersion.getMinor(), oVersion.getPatch()].join("."),
					fullVersion: oVersionInfo.version,
					openUi5Version: sVersionPrefixPath || oVersionInfo.version,
					isOpenUI5: bOpenUI5,
					isSnapshotVersion: bSnapshot,
					isDevVersion: bSnapshot,
					isBetaVersion: !bOpenUI5 && !bSnapshot && /-beta$/i.test(sVersionSuffix),
					isURLVersioned: !!DemokitURLUtil.parseVersion(document.location.href),
					isInternal: !!bIsInternal,
					isDevEnv: /testsuite/.test(oVersionInfo.name),
					libraries: oVersionInfo.libraries,
					allowedMembers: this.aAllowedMembers
				});
			}
		});
	}
);