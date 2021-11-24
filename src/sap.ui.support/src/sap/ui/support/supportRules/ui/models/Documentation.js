/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Version",
	"sap/ui/thirdparty/jquery",
	"sap/m/library",
	"sap/ui/VersionInfo"
], function (Log, Version, jQuery, mLibrary, VersionInfo) {
	"use strict";

	var Documentation = {
		/**
		 * Opens the given topic
		 * @param {string} sTopicId The ID of the topic to open
		 */
		openTopic: function (sTopicId) {
			VersionInfo.load({ library: "sap.ui.core" }).then(function (oCoreLibInfo) {
				var sUrl = "",
					sVersion = "",
					sFullVersion = oCoreLibInfo.version,
					iMajorVersion = Version(sFullVersion).getMajor(),
					iMinorVersion = Version(sFullVersion).getMinor(),
					sOrigin = window.location.origin;

				//This check is to make sure that version is even. Example: 1.53 will back down to 1.52
				// This is used to generate the correct path to demokit
				if (iMinorVersion % 2 !== 0) {
					iMinorVersion--;
				}

				sVersion += String(iMajorVersion) + "." + String(iMinorVersion);

				if (sOrigin.indexOf("veui5infra") !== -1) {
					sUrl = sOrigin + "/sapui5-sdk-internal/#/topic/" + sTopicId;
				} else {
					sUrl = sOrigin + "/demokit-" + sVersion + "/#/topic/" + sTopicId;
				}

				this._redirectToUrlWithFallback(sUrl, sTopicId);
			}.bind(this));
		},

		/**
		 * Pings the given URL to check that this is a valid path.
		 * If the ping is successful - redirects to the given URL.
		 * If something goes wrong - falls back to a default public URL.
		 * @private
		 * @param {string} sUrl URL that needs to be pinged and redirected to
		 * @param {string} sTopicId The ID of the topic to open
		 */
		_redirectToUrlWithFallback:function (sUrl, sTopicId) {
			this._pingUrl(sUrl).then(function success() {
				mLibrary.URLHelper.redirect(sUrl, true);
			}, function error() {
				Log.info("Support Assistant tried to load documentation link in " + sUrl + "but fail");
				sUrl = "https://ui5.sap.com/#/topic/" + sTopicId;
				mLibrary.URLHelper.redirect(sUrl, true);
			});
		},

		/**
		 * Pings a URL
		 * @private
		 * @param {string} sUrl The URL to ping
		 */
		_pingUrl: function (sUrl) {
			return jQuery.ajax({
				type: "HEAD",
				async:true,
				context: this,
				url: sUrl
			});
		}
	};

	return Documentation;
});