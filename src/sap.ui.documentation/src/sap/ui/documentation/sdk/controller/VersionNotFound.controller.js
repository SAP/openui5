/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/thirdparty/URI",
	"sap/m/library"
], function (
	BaseController,
	URI,
	mLib
) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.VersionNotFound", {
		onInit: function () {
			// Load VersionInfo model promise
			this._loadVersionInfo()
				.then(this._onVersionInfo.bind(this))
				.catch(this._onError.bind(this));
		},

		onReadMore: function () {
			mLib.URLHelper.redirect("https://blogs.sap.com/2021/01/26/removing-outdated-ui5-versions-from-ui5-cdn/");
		},

		onHomePress: function () {
			// initialize the UI component
			mLib.URLHelper.redirect("/");
		},

		_onError: function () {
			var oMessagePage = this.getView().byId("page");

			oMessagePage.setBusy(false);
			oMessagePage.setText(this._getLibraryResourceBundle().getText("NOT_FOUND_UNAVAILABLE_TEXT"));
		},

		_onVersionInfo: function (oVersionInfo) {
			var oMessagePage = this.getView().byId("page"),
				oReadMoreBtn = this.getView().byId("readMoreButton"),
				reVersion = new RegExp("^([0-9]+)(?:\\.([0-9]+)(?:\\.([0-9]+))?)?(.+)?"),
				oURI = new URI(document.location.href),
				aSegments = oURI.segment(),
				sVersion,
				isRemoved = false;

			oMessagePage.setBusy(false);

			for (var i = 0, l = aSegments.length; i < l; i++) {
				if (reVersion.test(aSegments[i])) {
					sVersion = aSegments[i];
					break;
				}
			}

			isRemoved = this._isVersionRemoved(oVersionInfo, sVersion);

			if (isRemoved) {
				// show removed message
				oMessagePage.setText(this._getLibraryResourceBundle().getText("NOT_FOUND_REMOVED_TEXT"));
				oReadMoreBtn.setVisible(true);
			} else {
				// show unavailable message
				oReadMoreBtn.setVisible(false);
				oMessagePage.setText(this._getLibraryResourceBundle().getText("NOT_FOUND_UNAVAILABLE_TEXT"));
			}
		},

		_isVersionRemoved: function (oVersionInfo, sVersion) {
			var aPatches = oVersionInfo.patches,
				iVersionIndex,
				reVersion;

			iVersionIndex = aPatches.findIndex(function (oData) {
				reVersion = new RegExp(oData.version);
				return oData.removed && reVersion.test(sVersion);
			});

			return iVersionIndex > -1;
		},

		_getLibraryResourceBundle: function () {
			return sap.ui.getCore().getLibraryResourceBundle("sap.ui.documentation");
		},

		_loadVersionInfo: function () {
			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url: "/versionoverview.json",
					dataType: 'json',
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (err) {
						reject(err);
					}
				});
			});
		}
	});
});