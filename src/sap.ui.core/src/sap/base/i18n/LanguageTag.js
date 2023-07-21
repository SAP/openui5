/*!
 * ${copyright}
 */

//Provides the LanguageTag object module:sap/base/i18n/LanguageTag
sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * A regular expression that describes language tags according to BCP-47.
	 * @see BCP47 "Tags for Identifying Languages" (http://www.ietf.org/rfc/bcp/bcp47.txt)
	 *
	 * The matching groups are
	 *  0=all
	 *  1=language (shortest ISO639 code + ext. language sub tags | 4digits (reserved) | registered language sub tags)
	 *  2=script (4 letters)
	 *  3=region (2 letter language or 3 digits)
	 *  4=variants (separated by '-', Note: capturing group contains leading '-' to shorten the regex!)
	 *  5=extensions (including leading singleton, multiple extensions separated by '-'.Note: capturing group contains leading '-' to shorten the regex!)
	 *  6=private use section (including leading 'x', multiple sections separated by '-')
	 *
	 *              [-------------------- language ----------------------][--- script ---][------- region --------][------------- variants --------------][----------- extensions ------------][------ private use -------]
	 */
	var rLanguageTag = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

	/**
	 * Creates an LanguageTag instance.
	 *
	 * @class LanguageTag represents a BCP-47 language tag, consisting of a language, script, region, variants, extensions and private use section.
	 *
	 * @param {string} sLanguageTag the language tag identifier, in format en-US or en_US.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.core sap/base/i18n
	 * @alias module:sap/base/i18n/LanguageTag
	 */
	var LanguageTag = function(sLanguageTag) {
		var aResult = rLanguageTag.exec(sLanguageTag.replace(/_/g, "-"));
		// If the given language tag string cannot be parsed by the regular expression above,
		// we should at least tell the developer why the Core fails to load.
		if (aResult === null ) {
			throw new TypeError("The given language tag'" + sLanguageTag + "' does not adhere to BCP-47.");
		}

		/**
		 * Get the language.
		 *
		 * Note that the case might differ from the original script tag
		 * (Lower case is enforced as recommended by BCP47/ISO639).
		 *
		 * @type {string}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.language = aResult[1] || null;

		/**
		 * Get the script or <code>null</code> if none was specified.
		 *
		 * Note that the case might differ from the original language tag
		 * (Upper case first letter and lower case reminder enforced as
		 * recommended by BCP47/ISO15924)
		 *
		 * @type {string|null}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.script = aResult[2] || null;

		/**
		 * Get the region or <code>null</code> if none was specified.
		 *
		 * Note that the case might differ from the original script tag
		 * (Upper case is enforced as recommended by BCP47/ISO3166-1).
		 *
		 * @type {string}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.region = aResult[3] || null;

		/**
		 * Get the variants as a single string or <code>null</code>.
		 *
		 * Multiple variants are separated by a dash '-'.
		 *
		 * @type {string|null}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.variant = (aResult[4] && aResult[4].slice(1)) || null; // remove leading dash from capturing group

		/**
		 * Get the variants as an array of individual variants.
		 *
		 * The separating dashes are not part of the result.
		 * If there is no variant section in the language tag, an empty array is returned.
		 *
		 * @type {string[]}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.variantSubtags = this.variant ? this.variant.split('-') : [];

		/**
		 * Get the extension as a single string or <code>null</code>.
		 *
		 * The extension always consists of a singleton character (not 'x'),
		 * a dash '-' and one or more extension token, each separated
		 * again with a dash.
		 *
		 * @type {string|null}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.extension = (aResult[5] && aResult[5].slice(1)) || null; // remove leading dash from capturing group

		/**
		 * Get the extensions as an array of tokens.
		 *
		 * The leading singleton and the separating dashes are not part of the result.
		 * If there is no extensions section in the language tag, an empty array is returned.
		 *
		 * @type {string[]}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.extensionSubtags = this.variant ? this.variant.split('-') : [];

		/**
		 * Get the private use section or <code>null</code>.
		 *
		 * @type {string}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.privateUse = aResult[6] || null;

		/**
		 * Get the private use section as an array of tokens.
		 *
		 * The leading singleton and the separating dashes are not part of the result.
		 * If there is no private use section in the language tag, an empty array is returned.
		 *
		 * @type {string[]}
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		this.privateUseSubtags = this.privateUse ? this.privateUse.slice(2).split('-') : [];
		// convert subtags according to the BCP47 recommendations
		// - language: all lower case
		// - script: lower case with the first letter capitalized
		// - region: all upper case
		if ( this.language ) {
			this.language = this.language.toLowerCase();
		}
		if ( this.script ) {
			this.script = this.script.toLowerCase().replace(/^[a-z]/, function($) {
				return $.toUpperCase();
			});
		}
		if ( this.region ) {
			this.region = this.region.toUpperCase();
		}
		Object.freeze(this);
	};

	LanguageTag.prototype.toString = function() {
		return join(
			this.language,
			this.script,
			this.region,
			this.variant,
			this.extension,
			this.privateUse);
	};

	function join() {
		return Array.prototype.filter.call(arguments, Boolean).join("-");
	}

	return LanguageTag;
});