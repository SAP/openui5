/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/library"
	], function (jQuery, BaseController, JSONModel, library) {
		"use strict";

		var sNeoAppJsonPath = "neo-app.json",
			sSapUiVersionJsonPath = "resources/sap-ui-version.json";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ReleaseNotes", {

			onInit: function() {
				this._oView = this.getView();

				// Async resource handling
				this._requestResources();
				this._resourceAvailabilityHandler();

				// Setup models
				this._oModel = new JSONModel();
				this._oVersionModel = new JSONModel();

				this._oView.setModel(this._oModel);
				this._oView.setModel(this._oVersionModel, "select");

				library._loadAllLibInfo("", "_getLibraryInfoAndReleaseNotes", "", this._processLibInfo.bind(this));
				library._getAppInfo(this._processAppInfo.bind(this));

			},
			_processAppInfo: function (oAppInfo) {
				var oVersion,
					iMajor,
					iMinor,
					sVersion,
					oVersions;

				if (!(oAppInfo)) {
					return;
				}

				oVersion = jQuery.sap.Version(oAppInfo.version);
				iMajor = oVersion.getMajor();
				iMinor = oVersion.getMinor();

				if (oVersion.getSuffix() !== "") {
					if (iMinor % 2 !== 0) {
						iMinor = (iMinor + 1);
					}
				}

				sVersion = iMajor + "." + iMinor;
				oVersions = {
					items : []
				};

				while (iMinor >= 28) {
					sVersion = iMajor + "." + iMinor;
					oVersions.items.push({
						key : sVersion,
						value : sVersion
					});
					iMinor = iMinor - 2;
				}
				this._oVersionModel.setData(oVersions);
			},
			_processLibInfo: function (aLibs, oLibInfos) {
				var iReleaseNotes,
					aReturnLibs = [],
					iLength = aLibs.length,
					fnProcessLib,
					i;

				fnProcessLib = function(sVersion, oValue) {
					iReleaseNotes += oValue.notes.length;

					aLibs[i].versions.push({
						version : sVersion,
						notes : oValue.notes
					});

					aLibs[i].versions.sort(function(a, b) {
						return jQuery.sap.Version(b.version).compareTo(a.version);
					});
				};

				for (i = 0; i < iLength; i++) {

					aLibs[i] = oLibInfos[aLibs[i]];
					aLibs[i].versions = [];

					if (aLibs[i].relnotes) {
						iReleaseNotes = 0;
						jQuery.each(aLibs[i].relnotes, fnProcessLib);
						// We publish the library in the model only if there are release notes available
						if (iReleaseNotes > 0) {
							aReturnLibs.push(aLibs[i]);
						}
					}
				}
				this._oModel.setData({libs: aReturnLibs});
				this._hideBusyIndicator();
			},
			_requestResources: function () {
				this._oNeoAppJsonPromise = jQuery.ajax(sNeoAppJsonPath);
				this._oSapUiVersionJsonPromise = jQuery.ajax(sSapUiVersionJsonPath);
			},
			_resourceAvailabilityHandler: function () {
				jQuery.when(this._oNeoAppJsonPromise, this._oSapUiVersionJsonPromise).then(
					// Success
					function(oNeoAppJson, oSapUiVersionJson) {
						// Store needed data
						this._oNeoAppVersions = oNeoAppJson[0].routes;
						this._sSapUiVersion = oSapUiVersionJson[0].version;

						// Make version select visible
						this._oView.byId("VersionSelect").setVisible(true);
					}.bind(this),
					// Error
					function() {
						jQuery.sap.log.warning("No neo-app.json was detected");
					}
				);
			},
			/**
			 * Compares 2 UI5 version strings taking into account only major and minor version info
			 * @returns {boolean}
			 */
			_compareUI5Versions: function (sVersionA, sVersionB) {
				var oVA = jQuery.sap.Version(sVersionA),
					oVB = jQuery.sap.Version(sVersionB);

				return (oVA.getMajor() + "." + oVA.getMinor()) === (oVB.getMajor() + "." + oVB.getMinor());
			},
			_updateLastReleasedVersion: function (sVersion) {
				// If selected version is the same as release version check that last released version is not higher
				// than release version and if so set the release version as last
				if (this._compareUI5Versions(sVersion, this._sSapUiVersion) &&
					parseFloat(this._sLastReleasedVersion) > parseFloat(this._sSapUiVersion)) {

					this._sLastReleasedVersion = this._sSapUiVersion;
				}
			},
			_getLastVersionFromNeoAppJson: function(sSelectedItem){
				var iLength = this._oNeoAppVersions ? this._oNeoAppVersions.length : 0,
					sVersion,
					i;

				for (i = 0; i < iLength; i++) {
					sVersion = this._oNeoAppVersions[i].target.version;
					if (this._compareUI5Versions(sVersion, sSelectedItem)) {
						return sVersion;
					}
				}
			},
			handleVersionChange: function (oEvent) {
				var oItem = oEvent.getParameter("selectedItem"),
					sSelectedVersion = oItem.getKey(),
					sVersion;

				this._sLastReleasedVersion = this._getLastVersionFromNeoAppJson(sSelectedVersion);
				this._updateLastReleasedVersion(sSelectedVersion);

				// Fallback if there is no version info available in resource files
				sVersion = this._sLastReleasedVersion ? this._sLastReleasedVersion : sSelectedVersion;

				this._showBusyIndicator();
				library._loadAllLibInfo("", "_getLibraryInfoAndReleaseNotes", sVersion,
					this._processLibInfo.bind(this));
			},
			_showBusyIndicator: function () {
				this.byId("releaseNotesObjectPage").setBusy(true);
			},
			_hideBusyIndicator: function () {
				this.byId("releaseNotesObjectPage").setBusy(false);
			}
		});

	}
);
