/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/util/URLUtil",
	"sap/m/library"
], function (
	BaseController,
	jQuery,
	DemokitURLUtil,
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
				sUrl = document.location.href,
				sRedirectUrl,
				sVersion = DemokitURLUtil.parseVersion(sUrl),
				isRemoved = false;

			oMessagePage.setBusy(false);

			isRemoved = this._isVersionRemoved(oVersionInfo, sVersion);

			if (isRemoved && DemokitURLUtil.requestsDemokitView(sUrl)) {
				// redirect to the latest (version-less) URL
				sRedirectUrl = DemokitURLUtil.removeVersion(sUrl);
				mLib.URLHelper.redirect(sRedirectUrl);
				return;
			}

			if (DemokitURLUtil.hasSEOOptimizedFormat(sUrl)) {
				// 404 may be due to server not supporting SEO-optimized urls =>
				// redirect to the corresponding non-optimized URL
				sRedirectUrl = DemokitURLUtil.convertToNonSEOFormat(sUrl);
				mLib.URLHelper.redirect(sRedirectUrl);
				return;
			}

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