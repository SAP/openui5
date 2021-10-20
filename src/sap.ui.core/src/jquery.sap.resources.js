/*!
 * ${copyright}
 */

// Provides access to Java-like resource bundles in properties file format
sap.ui.define([
	'sap/base/i18n/ResourceBundle',
	'jquery.sap.global'
], function(ResourceBundle, jQuery) {
	"use strict";

	/**
	 * Creates and returns a new instance of {@link jQuery.sap.util.ResourceBundle}
	 * using the given URL and locale to determine what to load.
	 *
	 * @public
	 * @function
	 * @name jQuery.sap.resources
	 * @param {object} [mParams] Parameters used to initialize the resource bundle
	 * @param {string} [mParams.url=''] URL pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "mybundle.properties")
	 * @param {string} [mParams.locale] Optional language (aka 'locale') to load the texts for.
	 *     Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB" or "fr");
	 *     Defaults to the current session locale if <code>sap.ui.getCore</code> is available, otherwise to 'en'
	 * @param {boolean} [mParams.includeInfo=false] Whether to include origin information into the returned property values
	 * @param {boolean} [mParams.async=false] Whether the first bundle should be loaded asynchronously
	 *     Note: Fallback bundles loaded by {@link #getText} are always loaded synchronously.
	 * @returns {jQuery.sap.util.ResourceBundle|Promise} A new resource bundle or a Promise on that bundle (in asynchronous case)
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 * @deprecated since 1.58. Use {@link module:sap/base/i18n/ResourceBundle} instead.
	 */
	jQuery.sap.resources = function() {
		// Do not directly assign new API to jQuery.sap.resources
		// as "isBundle" and "_getFallbackLocales" would get assigned to
		// the new API as well (e.g. ResourceBundle.create.isBundle)
		return ResourceBundle.create.apply(ResourceBundle, arguments);
	};

	/**
	 * Checks if the given object is an instance of {@link jQuery.sap.util.ResourceBundle}.
	 *
	 * @param {jQuery.sap.util.ResourceBundle} oBundle object to check
	 * @returns {boolean} true, if the object is a {@link jQuery.sap.util.ResourceBundle}
	 * @public
	 * @function
	 * @name jQuery.sap.resources.isBundle
	 * @deprecated since 1.58. Use the instanceof operator together with the class {@link module:sap/base/i18n/ResourceBundle} instead.
	 */
	jQuery.sap.resources.isBundle = function (oBundle) {
		return oBundle instanceof ResourceBundle;
	};

	/**
	 * Determine sequence of fallback locales, starting from the given locale and
	 * optionally taking the list of supported locales into account.
	 *
	 * Callers can use the result to limit requests to a set of existing locales.
	 *
	 * @param {string} sLocale Locale to start the fallback sequence with, should be a BCP47 language tag
	 * @param {string[]} [aSupportedLocales] List of supported locales (in JDK legacy syntax, e.g. zh_CN, iw)
	 * @returns {string[]} Sequence of fallback locales in JDK legacy syntax, decreasing priority
	 *
	 * @private
	 * @ui5-restricted sap.fiori, sap.support launchpad
	 * @deprecated since 1.58. Use {@link module:sap/base/i18n/ResourceBundle._getFallbackLocales} instead.
	 */
	jQuery.sap.resources._getFallbackLocales = ResourceBundle._getFallbackLocales;

	/**
	 * @interface  Contains locale-specific texts.
	 *
	 * If you need a locale-specific text within your application, you can use the
	 * resource bundle to load the locale-specific file from the server and access
	 * the texts of it.
	 *
	 * Use {@link jQuery.sap.resources} to create an instance of jQuery.sap.util.ResourceBundle.
	 * There you have to specify the URL to the base .properties file of a bundle
	 * (.properties without any locale information, e.g. "mybundle.properties"), and optionally
	 * a locale. The locale is defined as a string of the language and an optional country code
	 * separated by underscore (e.g. "en_GB" or "fr"). If no locale is passed, the default
	 * locale is "en" if the SAPUI5 framework is not available. Otherwise the default locale is taken from
	 * the SAPUI5 configuration.
	 *
	 * With the getText() method of the resource bundle, a locale-specific string value
	 * for a given key will be returned.
	 *
	 * With the given locale, the ResourceBundle requests the locale-specific properties file
	 * (e.g. "mybundle_fr_FR.properties"). If no file is found for the requested locale or if the file
	 * does not contain a text for the given key, a sequence of fall back locales is tried one by one.
	 * First, if the locale contains a region information (fr_FR), then the locale without the region is
	 * tried (fr). If that also can't be found or doesn't contain the requested text, the English file
	 * is used (en - assuming that most development projects contain at least English texts).
	 * If that also fails, the file without locale (base URL of the bundle) is tried.
	 *
	 * If none of the requested files can be found or none of them contains a text for the given key,
	 * then the key itself is returned as text.
	 *
	 * Exception: Fallback for "zh_HK" is "zh_TW" before zh.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 0.9.0
	 * @name jQuery.sap.util.ResourceBundle
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/base/i18n/ResourceBundle} instead
	 */

	/**
	 * Returns a locale-specific string value for the given key sKey.
	 *
	 * The text is searched in this resource bundle according to the fallback chain described in
	 * {@link jQuery.sap.util.ResourceBundle}. If no text could be found, the key itself is used as text.
	 *
	 * If the second parameter <code>aArgs</code> is given, then any placeholder of the form "{<i>n</i>}"
	 * (with <i>n</i> being an integer) is replaced by the corresponding value from <code>aArgs</code>
	 * with index <i>n</i>.  Note: This replacement is applied to the key if no text could be found.
	 * For more details on the replacement mechanism refer to {@link jQuery.sap.formatMessage}.
	 *
	 * @param {string} sKey Key to retrieve the text for
	 * @param {string[]} [aArgs] List of parameter values which should replace the placeholders "{<i>n</i>}"
	 *     (<i>n</i> is the index) in the found locale-specific string value. Note that the replacement is done
	 *     whenever <code>aArgs</code> is given, no matter whether the text contains placeholders or not
	 *     and no matter whether <code>aArgs</code> contains a value for <i>n</i> or not.
	 * @returns {string} The value belonging to the key, if found; otherwise the key itself.
	 *
	 * @function
	 * @name jQuery.sap.util.ResourceBundle#getText
	 * @public
	 */

	/**
	 * Checks whether a text for the given key can be found in the first loaded
	 * resource bundle or not. Neither the custom resource bundles nor the
	 * fallback chain will be processed.
	 *
	 * This method allows to check for the existence of a text without triggering
	 * requests for the fallback locales.
	 *
	 * When requesting the resource bundle asynchronously this check must only be
	 * used after the resource bundle has been loaded.
	 *
	 * @param {string} sKey Key to check
	 * @returns {boolean} true if the text has been found in the concrete bundle
	 *
	 * @function
	 * @name jQuery.sap.util.ResourceBundle#hasText
	 * @public
	 */

	return jQuery;
});
