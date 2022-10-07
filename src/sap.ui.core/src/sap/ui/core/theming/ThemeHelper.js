/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/Log'
], function (Log) {
	"use strict";

	// TODO reset map onThemeChanged
	var mLibThemeMetadata = {};

	/**
	 *
	 * @since 1.92.0
	 * @alias sap.ui.core.theming.ThemeHelper
	 * @static
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var ThemeHelper = {};

	ThemeHelper.reset = function () {
		mLibThemeMetadata = {};
	};

	ThemeHelper.getMetadata = function (sLibId) {
		if (!sLibId) {
			return null;
		}

		var sLibName = sLibId.replace("sap-ui-theme-", "").replace(/\./g, "-");
		if (mLibThemeMetadata[sLibName]) {
			return mLibThemeMetadata[sLibName];
		}

		var oMetadataElement = document.createElement("span");
		oMetadataElement.classList.add("sapThemeMetaData-UI5-" + sLibName);
		document.documentElement.appendChild(oMetadataElement);
		var sDataUri = window.getComputedStyle(oMetadataElement).getPropertyValue("background-image");
		document.documentElement.removeChild(oMetadataElement);

		var aDataUriMatch = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)/i.exec(sDataUri);
		if (!aDataUriMatch || aDataUriMatch.length < 2) {
			return null;
		}

		var sMetaData = aDataUriMatch[1];

		// [COMPATIBILITY]: The following lines of code are moved unchanged from ThemeManager in order to not introduce any regressions but
		// neverteheless it's not fully clear if detection of URI encoding and URI decoding itself (especially manual encoding of spaces)
		// is necessary

		// Try to detect URI encoding by checking for first and last character for not encoded characters
		if (sMetaData.charAt(0) !== "{" && sMetaData.charAt(sMetaData.length - 1) !== "}") {
			try {
				sMetaData = decodeURI(sMetaData);
			} catch (ex) {
				// ignore
			}
		}

		// Remove superfluous escaping of double quotes
		sMetaData = sMetaData.replace(/\\"/g, '"');

		// Replace encoded spaces => not clear if this is really necessary and if there is any valid case where spaces are URI encoded
		//							 but we could not detect URI encoding. Keep coding in order to avoid regression.
		var sMetadataJSON = sMetaData.replace(/%20/g, " ");

		var oMetadata;
		try {
			oMetadata = JSON.parse(sMetadataJSON);
			mLibThemeMetadata[sLibName] = oMetadata;
		} catch (ex) {
			Log.error("Could not parse theme metadata for library " + sLibName + ".");
		}
		return oMetadata;
	};

	ThemeHelper.checkStyle = function(sId, bLog) {
		var oStyle = document.getElementById(sId);

		try {

			var bNoLinkElement = false,
				bLinkElementFinishedLoading = false,
				bSheet = false,
				bInnerHtml = false;

			// Check if <link> element is missing (e.g. misconfigured library)
			bNoLinkElement = !oStyle;

			// Check if <link> element has finished loading (see sap/ui/dom/includeStyleSheet)
			bLinkElementFinishedLoading = !!(oStyle && (oStyle.getAttribute("data-sap-ui-ready") === "true" || oStyle.getAttribute("data-sap-ui-ready") === "false"));

			// Check for "sheet" object and if rules are available
			bSheet = !!(oStyle && oStyle.sheet && oStyle.sheet.href === oStyle.href && ThemeHelper.hasSheetCssRules(oStyle.sheet));

			// Check for "innerHTML" content
			bInnerHtml = !!(oStyle && oStyle.innerHTML && oStyle.innerHTML.length > 0);

			// One of the previous four checks need to be successful
			var bResult = bNoLinkElement || bSheet || bInnerHtml || bLinkElementFinishedLoading;

			if (bLog) {
				Log.debug("ThemeHelper: " + sId + ": " + bResult + " (noLinkElement: " + bNoLinkElement + ", sheet: " + bSheet + ", innerHtml: " + bInnerHtml + ", linkElementFinishedLoading: " + bLinkElementFinishedLoading + ")");
			}

			return bResult;

		} catch (e) {
			if (bLog) {
				Log.error("ThemeHelper: " + sId + ": Error during check styles '" + sId + "'", e);
			}
		}

		return false;
	};
	ThemeHelper.safeAccessSheetCssRules = function(sheet) {
		try {
			return sheet.cssRules;
		} catch (e) {
			// Firefox throws a SecurityError or InvalidAccessError if "sheet.cssRules"
			// is accessed on a stylesheet with 404 response code.
			// Most browsers also throw when accessing from a different origin (CORS).
			return null;
		}
	};

	ThemeHelper.hasSheetCssRules = function(sheet) {
		var aCssRules = ThemeHelper.safeAccessSheetCssRules(sheet);
		return !!aCssRules && aCssRules.length > 0;
	};

	return ThemeHelper;
});
