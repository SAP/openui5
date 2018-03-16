/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

// Provides access to Java-like properties files
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/base/util/extend'], function(jQuery, Device, extend) {
	"use strict";

	// Javadoc for private inner class "Properties" - this list of comments is intentional!
	/**
	 * @interface Represents a collection of string properties (key/value pairs).
	 *
	 * Each key and its corresponding value in the collection is a string, keys are case-sensitive.
	 *
	 * Use {@link sap.ui.Properties} to create an instance of <code>sap.ui.Properties</code>.
	 *
	 * The {@link #getProperty} method can be used to retrieve a value from the collection,
	 * {@link #setProperty} to store or change a value for a key and {@link #getKeys}
	 * can be used to retrieve an array of all keys that are currently stored in the collection.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @name sap.ui.Properties
	 * @private
	 */

	/**
	 * Returns the value for the given key or <code>null</code> if the collection has no value for the key.
	 *
	 * Optionally, a default value can be given which will be returned if the collection does not contain
	 * a value for the key; only non-empty default values are supported.
	 *
	 * @param {string} sKey Key to return the value for
	 * @param {string} [sDefaultValue=null] Optional, a default value that will be returned
	 *    if the requested key is not in the collection
	 * @returns {string} Value for the given key or the default value or <code>null</code>
	 *    if no default value or a falsy default value was given
	 * @private
	 *
	 * @function
	 * @name sap.ui.Properties.prototype.getProperty
	 */
	/**
	 * Returns an array of all keys in the property collection.
	 * @returns {string[]} All keys in the property collection
	 * @private
	 *
	 * @function
	 * @name sap.ui.Properties.prototype.getKeys
	 */
	/**
	 * Stores or changes the value for the given key in the collection.
	 *
	 * If the given value is not a string, the collection won't be modified.
	 * The key is always cast to a string.
	 *
	 * @param {string} sKey Key of the property
	 * @param {string} sValue String value for the key
	 * @private
	 *
	 * @function
	 * @name sap.ui.Properties.prototype.setProperty
	 */
	/**
	 * Creates and returns a clone of the property collection.
	 * @returns {sap.ui.Properties} A clone of the property collection
	 * @private
	 *
	 * @function
	 * @name sap.ui.Properties.prototype.clone
	 */

	/*
	 * Implements sap.ui.Properties
	 */
	var Properties = function() {
		this.mProperties = {};
		this.aKeys = null;
	};

	/*
	 * Implements sap.ui.Properties.prototype.getProperty
	 */
	Properties.prototype.getProperty = function(sKey, sDefaultValue) {
		var sValue = this.mProperties[sKey];
		if (typeof (sValue) == "string") {
			return sValue;
		} else if (sDefaultValue) {
			return sDefaultValue;
		}
		return null;
	};

	/*
	 * Implements sap.ui.Properties.prototype.getKeys
	 */
	Properties.prototype.getKeys = function() {
		return this.aKeys || (this.aKeys = Object.keys(this.mProperties));
	};

	/*
	 * Implements sap.ui.Properties.prototype.setProperty
	 */
	Properties.prototype.setProperty = function(sKey, sValue) {
		if (typeof (sValue) != "string") {
			return;
		}
		if (typeof (this.mProperties[sKey]) != "string" && this.aKeys ) {
			this.aKeys.push(String(sKey));
		}
		this.mProperties[sKey] = sValue;
	};

	/*
	 * Implements sap.ui.Properties.prototype.clone
	 */
	Properties.prototype.clone = function() {
		var oClone = new Properties();
		oClone.mProperties = extend({}, this.mProperties);
		return oClone;
	};

	// helper to create a memory-optimized version of the given string, depending on the number of concat operations (V8 only)
	var flatstr = Device.browser.chrome ? function (s, iConcatOps) {
		if ( iConcatOps > 2 && 40 * iConcatOps > s.length ) {
			Number(s); // cast to number on V8 has the side effect of creating a flat version of concat strings
		}
		return s;
	} : function(s) { return s; };

	/**
	 * RegExp used to split file into lines, also removes leading whitespace.
	 * Note: group must be non-capturing, otherwise the line feeds will be part of the split result.
	 */
	var rLines = /(?:\r\n|\r|\n|^)[ \t\f]*/;

	/**
	 * Regular expressions to detect escape sequences (unicode or special) and continuation line markers
	 * in a single line of a properties file. The first expression also detects key/value separators and is used
	 * as long as no key has been found. The second one is used for the remainder of the line.
	 *
	 *                         [---unicode escape--] [esc] [cnt] [---key/value separator---]
	 */
	var rEscapesOrSeparator = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)|([ \t\f]*[ \t\f:=][ \t\f]*)/g;
	var rEscapes            = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)/g;

	/**
	 * Special escape characters as supported by properties format.
	 * @see JDK API doc for java.util.Properties
	 */
	var mEscapes = {
		'\\f' : '\f',
		'\\n' : '\n',
		'\\r' : '\r',
		'\\t' : '\t'
	};

	/*
	 * Parses the given text sText and sets the properties
	 * in the properties object oProp accordingly.
	 * @param {string} sText the text to parse
	 * @param oProp the properties object to fill
	 * @private
	 */
	function parse(sText, oProp) {

		var aLines = sText.split(rLines), // split file into lines
			sLine,rMatcher,sKey,sValue,i,m,iLastIndex,iConcatOps;

		function append(s) {
			if ( sValue ) {
				sValue = sValue + s;
				iConcatOps++;
			} else {
				sValue = s;
				iConcatOps = 0;
			}
		}

		oProp.mProperties = {};

		for (i = 0; i < aLines.length; i++) {
			sLine = aLines[i];
			// ignore empty lines
			if (sLine === "" || sLine.charAt(0) === "#" || sLine.charAt(0) === "!" ) {
				continue;
			}

			// start with the full regexp incl. key/value separator
			rMatcher = rEscapesOrSeparator;
			rMatcher.lastIndex = iLastIndex = 0;
			sKey = null;
			sValue = "";

			while ( (m = rMatcher.exec(sLine)) !== null ) {
				// handle any raw, unmatched input
				if ( iLastIndex < m.index ) {
					append(sLine.slice(iLastIndex, m.index));
				}
				iLastIndex = rMatcher.lastIndex;
				if ( m[1] ) {
					// unicode escape
					if ( m[1].length !== 6 ) {
						throw new Error("Incomplete Unicode Escape '" + m[1] + "'");
					}
					append(String.fromCharCode(parseInt(m[1].slice(2), 16)));
				} else if ( m[2] ) {
					// special or simple escape
					append(mEscapes[m[2]] || m[2].slice(1));
				} else if ( m[3] ) {
					// continuation line marker
					sLine = aLines[++i];
					rMatcher.lastIndex = iLastIndex = 0;
				} else if ( m[4] ) { // only occurs in full regexp
					// key/value separator detected
					// -> remember key and switch to simplified regexp
					sKey = sValue;
					sValue = "";
					rMatcher = rEscapes;
					rMatcher.lastIndex = iLastIndex;
				}
			}
			if ( iLastIndex < sLine.length ) {
				append(sLine.slice(iLastIndex));
			}
			if ( sKey == null ) {
				sKey = sValue;
				sValue = "";
			}

			oProp.mProperties[sKey] = flatstr(sValue, sValue ? iConcatOps : 0); // Note: empty sValue implies iConcatOps == 0

		}

	}

	/**
	 * Creates and returns a new instance of {@link sap.ui.Properties}.
	 *
	 * If option 'url' is passed, immediately a load request for the given target is triggered.
	 * A property file that is loaded can contain comments with a leading ! or #.
	 * The loaded property list does not contain any comments.
	 *
	 * <b>Example for loading a property file:</b>
	 * <pre>
	 *  sap.ui.require(["sap/ui/Properties"], function (Properties) {
	 *     Properties({url : "../myProperty.properties"});
	 *  });
	 * </pre>
	 *
	 * <b>Example for creating an empty properties instance:</b>
	 * <pre>
	 *  sap.ui.require(["sap/ui/Properties"], function (Properties) {
	 *     Properties({url : "../myProperty.properties"});
	 *  });
	 * </pre>
	 *
	 * <b>Examples for getting and setting properties:</b>
	 * <pre>
	 *  sap.ui.require(["sap/ui/Properties"], function (Properties) {
	 *    var oProperties = Properties();
	 *    oProperties.setProperty("KEY_1","Test Key");
	 *    var sValue1 = oProperties.getProperty("KEY_1");
	 *    var sValue2 = oProperties.getProperty("KEY_2","Default");
	 *   });
	 * </pre>
	 *
	 * @param {object} [mParams] Parameters used to initialize the property list
	 * @param {string} [mParams.url] The URL to the .properties file which should be loaded
	 * @param {boolean} [mParams.async=false] Whether the .properties file should be loaded asynchronously or not
	 * @param {object} [mParams.headers] A map of additional header key/value pairs to send along with
	 *    the request (see <code>headers</code> option of <code>jQuery.ajax</code>)
	 * @param {object} [mParams.returnNullIfMissing=false] Whether <code>null</code> should be returned
	 *    for a missing properties file; by default an empty collection is returned
	 * @return {sap.ui.Properties|null|Promise} A new property collection (synchronous case)
	 *    or <code>null</code> if the file could not be loaded and <code>returnNullIfMissing</code>
	 *    was set; in case of asynchronous loading, always a Promise is returned, which resolves with
	 *    the property collection or with <code>null</code> if the file could not be loaded and
	 *    <code>returnNullIfMissing</code> was set to true
	 * @throws {Error} When the file has syntax issues (e.g. incomplete unicode escapes);
	 *    in async mode, the error is not thrown but the returned Promise will be rejected
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 * @private
	 */
	var fnProperties = function (mParams) {
		mParams = extend({url: undefined, headers: {}}, mParams);

		var bAsync = !!mParams.async,
			oProp = new Properties(),
			vResource;

		function _parse(sText){
			if ( typeof sText === "string" ) {
				parse(sText, oProp);
				return oProp;
			}
			return mParams.returnNullIfMissing ? null : oProp;
		}

		if ( typeof mParams.url === "string" ) {
			// @evo-todo: dependency on loadResource implementation in compat layer
			vResource = jQuery.sap.loadResource({
				url: mParams.url,
				dataType: 'text',
				headers: mParams.headers,
				failOnError: false,
				async: bAsync
			});
		}

		if (bAsync) {
			if ( !vResource ) {
				return Promise.resolve( _parse(null) );
			}

			return vResource.then(function(oVal) {
				return _parse(oVal);
			}, function(oVal) {
				throw (oVal instanceof Error ? oVal : new Error("Problem during loading of property file '" + mParams.url + "': " + oVal));
			});
		}

		return _parse( vResource );
	};

	return fnProperties;
});