/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/util/URLUtil",
	"sap/m/library"
], function (
	BaseController,
	Library,
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
			var oPage = this.getView().byId("page");

			oPage.setBusy(false);
			oPage.setDescription(this._getLibraryResourceBundle().getText("NOT_FOUND_UNAVAILABLE_TEXT"));
		},

		_onVersionInfo: function (oVersionInfo) {
			var oPage = this.getView().byId("page"),
				oReadMoreBtn = this.getView().byId("readMoreButton"),
				sUrl = document.location.href,
				sRedirectUrl,
				sVersion = DemokitURLUtil.parseVersion(sUrl),
				oPatchInfo = this._getPatchInfo(oVersionInfo, sVersion),
				isRemoved = oPatchInfo && oPatchInfo.removed,
				isRuntimeOnly = oPatchInfo && oPatchInfo.runtimeOnly;

			oPage.setBusy(false);

			if ((isRemoved || isRuntimeOnly) && DemokitURLUtil.requestsDemokitView(sUrl)) {
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
				oPage.setDescription(this._getLibraryResourceBundle().getText("NOT_FOUND_REMOVED_TEXT"));
				oReadMoreBtn.setVisible(true);
			} else if (isRuntimeOnly) {
				// show removed message
				oPage.setDescription(this._getLibraryResourceBundle().getText("NOT_FOUND_DK_REMOVED_TEXT"));
				oReadMoreBtn.setVisible(true);
			} else {
				// show unavailable message
				oReadMoreBtn.setVisible(false);
				oPage.setDescription(this._getLibraryResourceBundle().getText("NOT_FOUND_UNAVAILABLE_TEXT"));
			}
		},

		_getPatchInfo: function (oVersionInfo, sVersion) {
			var aPatches = oVersionInfo.patches;
			return aPatches.find(function (oData) {
				return sVersion === oData.version;
			});
		},

		_getLibraryResourceBundle: function () {
			return Library.getResourceBundleFor("sap.ui.documentation");
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