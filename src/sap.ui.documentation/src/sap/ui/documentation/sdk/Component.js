/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/UIComponent",
	"sap/ui/VersionInfo",
	"sap/ui/Device",
	"sap/ui/documentation/sdk/model/models",
	"sap/ui/documentation/sdk/controller/ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/ConfigUtil",
	"sap/base/util/Version",
	"sap/ui/documentation/sdk/util/Resources",
	"sap/base/Log",
	// used via manifest.json
	"sap/ui/documentation/sdk/util/DocumentationRouter",
	// implements sap.m.TablePopin
	"sap/m/ColumnListItem"
], function(
	jQuery,
	UIComponent,
	VersionInfo,
	Device,
	models,
	ErrorHandler,
	JSONModel,
	ConfigUtil,
	Version,
	ResourcesUtil,
	Log /*, DocumentationRouter, ColumnListItem*/
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
				this.loadVersionInfo().then(this._bindVersionModel.bind(this));

				// create the views based on the url/hash
				this.getRouter().initialize();

			},

			getCookiesManagement: function() {
				var sId = "sap.ui.documentation.sdk.cookieSettingsDialog";

				if (!this._oCookiesComponent) {
					this._oCookiesComponent = this.runAsOwner(function() {
						this._oCookiesComponent = sap.ui.getCore().createComponent({
							id: 'cookiesComp-' + sId,
							name: sId
						});

						return this._oCookiesComponent;
					}.bind(this));
				}

				return this._oCookiesComponent;
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
				this._oCookiesComponent && this._oCookiesComponent.destroy();
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


			// MODELS

			loadVersionInfo: function () {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						async: true,
						url : ResourcesUtil.getResourceOriginPath("resources/sap-ui-version.json"),
						dataType : 'json',
						success : function(oResponse) {
							resolve(oResponse);
						},
						error : function (err) {
							reject(err);
						}
					});
				});
			},

			loadMessagesInfo: function () {
				var oComponent = this;

				if (this.oMessagesInfo) {
					return this.oMessagesInfo;
				}

				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						async: true,
						url : sap.ui.require.toUrl('sap/ui/documentation/sdk/model/messagesData.json'),
						dataType : 'json',
						success : function(oResponse) {
							resolve(oResponse);
							oComponent.oMessagesInfo = oResponse;
						},
						error : function (err) {
							reject(err);
						}
					});
				});
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
				if (/internal/i.test(oVersionInfo.name)) {
					bIsInternal = true;
					this.aAllowedMembers.push("restricted");
				}

				this.getModel("versionData").setData({
					enableAdvancedCookieSettings: false, // this flag is left for eventual future advanced cookie settings
					versionGav: oVersionInfo.gav,
					versionName: oVersionInfo.name,
					version: [oVersion.getMajor(), oVersion.getMinor(), oVersion.getPatch()].join("."),
					fullVersion: oVersionInfo.version,
					openUi5Version: sVersionPrefixPath || sap.ui.version,
					isOpenUI5: bOpenUI5,
					isSnapshotVersion: bSnapshot,
					isDevVersion: bSnapshot,
					isBetaVersion: !bOpenUI5 && !bSnapshot && /-beta$/i.test(sVersionSuffix),
					isInternal: !!bIsInternal,
					libraries: oVersionInfo.libraries,
					allowedMembers: this.aAllowedMembers
				});
			}
		});
	}
);