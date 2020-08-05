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
    "sap/ui/documentation/sdk/controller/util/ConfigUtil",
    "sap/base/util/Version",
    "sap/ui/VersionInfo",
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
	ConfigUtil,
	Version,
	VersionInfo /*, DocumentationRouter, ColumnListItem*/
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

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// Load VersionInfo model promise
				this.loadVersionInfo();

				// create the views based on the url/hash
				this.getRouter().initialize();
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
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					}
					// The default density class for the sap.ui.documentation project will be compact
					this._sContentDensityClass = "sapUiSizeCompact";
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
				if (!this._oVersionInfoPromise) {
					this._oVersionInfoPromise = VersionInfo.load().then(this._bindVersionModel.bind(this));
				}

				return this._oVersionInfoPromise;
			},

			_bindVersionModel : function (oVersionInfo) {
				var oVersion,
					bSnapshot,
					bOpenUI5,
					sVersionSuffix,
					bIsInternal;

				this.aAllowedMembers = ["public", "protected"];

				if (!oVersionInfo) {
					return;
				}

				oVersion = Version(oVersionInfo.version);
				sVersionSuffix = oVersion.getSuffix();
				bSnapshot = /-SNAPSHOT$/i.test(sVersionSuffix);
				bOpenUI5 = oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav);

				// We show restricted members for internal versions and if the documentation is in preview mode
				if (/internal/i.test(oVersionInfo.name) || !!window['sap-ui-documentation-preview']) {
					bIsInternal = true;
					this.aAllowedMembers.push("restricted");
				}

				this.getModel("versionData").setData({
					versionGav: oVersionInfo.gav,
					versionName: oVersionInfo.name,
					version: [oVersion.getMajor(), oVersion.getMinor(), oVersion.getPatch()].join("."),
					fullVersion: oVersionInfo.version,
					openUi5Version: sap.ui.version,
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