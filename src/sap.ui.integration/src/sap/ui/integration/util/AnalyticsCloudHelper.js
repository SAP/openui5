/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/core/Theming",
	"sap/ui/dom/includeScript"
], function (
	Localization,
	Locale,
	Theming,
	includeScript
) {
	"use strict";

	/**
	 * Utility class helping with analytics cloud widget.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.AnalyticsCloudHelper
	 */
	const AnalyticsCloudHelper = { };

	/**
	 * The source for the analytics cloud widget.
	 * @const
	 */
	AnalyticsCloudHelper.WIDGET_SCRIPT_SRC = "https://assets.sapanalytics.cloud/production/api/widget/sac-widget-embed.js";

	/**
	 * Loads the widget code and calls initial setup.
	 * This method will do the loading and the setup only once.
	 * @param {sap.ui.integration.Host} oHost A host instance which can override the src of the script. Note that only the host of the first card will be taken into account.
	 * @returns {Promise} A promise which full fills when script is loaded.
	 */
	AnalyticsCloudHelper.loadWidget = function (oHost) {
		if (sap?.sac?.api?.widget) {
			// Already loaded on the page
			return Promise.resolve();
		}

		if (AnalyticsCloudHelper._pInitialize) {
			return AnalyticsCloudHelper._pInitialize;
		}

		let sScriptSrc = AnalyticsCloudHelper.WIDGET_SCRIPT_SRC;
		if (oHost && oHost.getAnalyticsCloudWidgetSrc) {
			sScriptSrc = oHost.getAnalyticsCloudWidgetSrc() || sScriptSrc;
		}

		const pInitialize = AnalyticsCloudHelper._includeScript(sScriptSrc)
			.then(
				() => {
					if (!sap?.sac?.api?.widget) {
						return Promise.reject("Object sap.sac.api.widget is undefined after the script was loaded.");
					}
					sap.sac.api.widget.setup(AnalyticsCloudHelper._getSettings());
					return Promise.resolve();
				},
				() => {
					return Promise.reject(`There was a problem loading the widget from '${sScriptSrc}'`);
				}
			);

		AnalyticsCloudHelper._pInitialize = pInitialize;

		return pInitialize;
	};

	/**
	 * Gets initial settings for the widget.
	 * @private
	 * @returns {object} A map with the widget settings for initial setup.
	 */
	AnalyticsCloudHelper._getSettings = function () {
		const oLocale = new Locale(Localization.getLanguageTag());
		const oSettings = {
			language: oLocale.toString(),
			dataAccessLanguage: oLocale.toString(),
			theme: Theming.getTheme()
		};

		return oSettings;
	};

	/**
	 * Wrapper for sap.ui.dom.includeScript.
	 * @param {string} sScriptSrc The widget script src.
	 * @returns {Promise} A promise which resolves when script is loaded.
	 */
	AnalyticsCloudHelper._includeScript = function (sScriptSrc) {
		return includeScript({ url: sScriptSrc });
	};

	return AnalyticsCloudHelper;
});