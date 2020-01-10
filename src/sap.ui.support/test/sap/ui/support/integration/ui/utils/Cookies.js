/*!
 * ${copyright}
 */
sap.ui.define([], function () {
		"use strict";

		/**
		 * Helper class for working with cookies.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @alias sap.ui.support.integration.ui.utils.Cookies
		 */
		var Cookies = {};

		/**
		 * Deletes a cookie. Sets its expiration date in the past
		 * @param {string} sName The cookie name
		 * @param {string} sPath The path of the cookie
		 */
		Cookies.delete = function (sName, sPath) {
			document.cookie = sName + '=; path=' + sPath + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		};

		/**
		 * Resolves "sap/ui/support/supportRules/ui" to "/resources/sap/ui/support/supportRules/ui" or "/testsuite/resources/sap/ui/support/supportRules/ui" depending on the loader config.
		 * @param {string} sPath The path to resolve
		 * @return {string} Resolved path
		 */
		Cookies.resolvePath = function (sPath) {
			var sResourcePath = sap.ui.require.toUrl(sPath), // "sap/ui/support/supportRules/ui" -> "resources/sap/ui/test/starter/../../../../sap/ui/support/supportRules/ui"
				sFullResolvedPath = sap.ui.loader._.resolveURL(sResourcePath), // "resources/sap/ui/test/starter/../../../../sap/ui/support/supportRules/ui" -> "http://localhost:8080/testsuite/resources/sap/ui/support/supportRules/ui"
				sRelativePath = sFullResolvedPath.replace(location.origin, ""); // "http://localhost:8080/testsuite/resources/sap/ui/support/supportRules/ui" -> "/testsuite/resources/sap/ui/support/supportRules/ui"

			return sRelativePath;
		};

		return Cookies;
	});

