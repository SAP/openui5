/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

//Provides the locale object sap.ui.core.Locale
jQuery.sap.declare("sap.ui.core.Locale");
jQuery.sap.require("sap.ui.base.Object");

(function() {

	/**
	 * A regular expression that describes language tags according to BCP-47.
	 * @see BCP47 "Tags for Identifying Languages" (http://www.ietf.org/rfc/bcp/bcp47.txt)
	 *
	 * The matching groups are
	 *  0=all
	 *  1=language (shortest ISO639 code + ext. language sub tags | 4digits (reserved) | registered language sub tags)
	 *  2=script (4 letters)
	 *  3=region (2letter language or 3 digits)
	 *  4=variants (separated by '-', Note: capturing group contains leading '-' to shorten the regex!)
	 *  5=extensions (including leading singleton, multiple extensions separated by '-')
	 *  6=private use section (including leading 'x', multiple sections separated by '-')
	 *  
	 *            [-------------------- language ----------------------][--- script ---][------- region --------][------------ variants --------------][--------- extensions --------------][------ private use -------]
	 */
	var rLocale=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?(-[0-9A-Z]{5,8}|(?:[0-9][0-9A-Z]{3}))*(?:-([0-9A-WYZ](?:-[0-9A-Z]{2,8})+))*(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

	/**
	 * Creates an instance of the Locale.
	 *
	 * @class Locale represents a locale setting, consisting of a language, script, region, variants, extensions and private use section
	 *
	 * @param {string} sLocaleId the locale identifier, in format en_US
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP AG
	 * @version 1.9.1-SNAPSHOT
	 * @constructor
	 * @public
	 * @name sap.ui.core.Locale
	 */
	sap.ui.base.Object.extend("sap.ui.core.Locale", /** @lends sap.ui.core.Locale.prototype */ {

		constructor : function(sLocaleId) {
			sap.ui.base.Object.apply(this);
			var aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
			this.sLocaleId = sLocaleId;
			this.sLanguage = aResult[1] || null;
			this.sScript = aResult[2] || null;
			this.sRegion = aResult[3] || null;
			this.sVariant = (aResult[4] && aResult[4].slice(1)) || null; // remove leading dash from capturing group
			this.sExtension = aResult[5] || null;
			this.sPrivateUse = aResult[6] || null;

			// normalization according to BCP47:
			if ( this.sLanguage ) {
				this.sLanguage = this.sLanguage.toLowerCase();
			}
			if ( this.sScript ) {
				this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, function($) { return $.toUpperCase(); });
			} 
			if ( this.sRegion ) {
				this.sRegion = this.sRegion.toUpperCase();
			} 
		},

		/**
		 * Get the locale language.
		 *
		 * Note that the case might differ from the original script tag 
		 * (Lower case is enforced as recommended by BCP47/ISO639).
		 * 
		 * @return {string} the language code
		 * @public
		 */
		getLanguage : function() {
			return this.sLanguage;
		},

		/**
		 * Get the locale script or null if none was specified.
		 * 
		 * Note that the case might differ from the original language tag
		 * (Upper case first letter and lower case reminder enforced as 
		 * recommended by BCP47/ISO15924)  
		 * 
		 * @return {string} the script code or null
		 * @public
		 */
		getScript : function() {
			return this.sScript;
		},

		/**
		 * Get the locale region or null if none was specified.
		 *
		 * Note that the case might differ from the original script tag 
		 * (Upper case is enforced as recommended by BCP47/ISO3166-1).
		 * 
		 * @return {string} the ISO3166-1 region code (2-letter or 3-digits)
		 * @public
		 */
		getRegion : function() {
			return this.sRegion;
		},

		/**
		 * Get the locale variants as a single string or null.
		 * 
		 * Multiple variants are separated by a dash '-'.
		 * 
		 * @return {string} the variant or null
		 * @public
		 */
		getVariant : function() {
			return this.sVariant;
		},

		/**
		 * Get the locale variants as an array of individual variants.
		 * 
		 * The separating dashes are not part of the result.
		 * If there is no variant section in the locale tag, an empty array is returned.
		 * 
		 * @return {string[]} the individual variant sections 
		 * @public
		 */
		getVariantSubtags : function() {
			return this.sVariant ? this.sVariant.split('-') : [];
		},

		/**
		 * Get the locale extension as a single string or null.
		 * 
		 * The extension always consists of a singleton character (not 'x'), 
		 * a dash '-' and one or more extension token, each separated 
		 * again with a dash.
		 * 
		 * Use {@link #getExtensions} to get the individual extension tokens as an array.
		 * 
		 * @return {string} the extension
		 * @public
		 */
		getExtension : function() {
			return this.sExtension;
		},

		/**
		 * Get the locale extensions as an array of tokens.
		 * 
		 * The leading singleton and the separating dashes are not part of the result.
		 * If there is no extensions section in the locale tag, an empty array is returned.
		 * 
		 * @return {string[]} the individual extension sections
		 * @public
		 */
		getExtensionSubtags : function() {
			return this.sExtension ? this.sExtension.slice(2).split('-') : [];
		},

		/**
		 * Get the locale private use section or null.
		 *
		 * @return {string} the private use section
		 * @public
		 */
		getPrivateUse : function() {
			return this.sPrivateUse;
		},

		/**
		 * Get the locale private use section
		 *
		 * @return {string} the private use section
		 * @public
		 */
		getPrivateUseSubtags : function() {
			return this.sPrivateUse ? this.sPrivateUse.slice(2).split('-') : [];
		},

		hasPrivateUseSubtag : function(sSubtag) {
			jQuery.sap.assert(sSubtag && sSubtag.match(/^[0-9A-Z]{1,8}$/i), "subtag must be a valid BCP47 private use tag");
			return jQuery.inArray(sSubtag, this.getPrivateUseSubtags()) >= 0;
		},

		toString : function() {
			var r=[this.sLanguage];
			if ( this.sScript ) {
				r.push(this.sScript);
			}
			if ( this.sRegion ) {
				r.push(this.sRegion);
			}
			if ( this.sVariant ) {
				r.push(this.sVariant);
			}
			if ( this.sExtension ) {
				r.push(this.sExtension );
			}
			if ( this.sPrivateUse ) {
				r.push(this.sPrivateUse );
			}
			return r.join("-");
		}

	});

}());
