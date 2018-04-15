/*!
 * ${copyright}
 */

// Provides encoding functions for JavaScript.
sap.ui.define(['jquery.sap.global',
		'sap/base/encoding/encodeXML',
		'sap/base/encoding/encodeJS',
		'sap/base/encoding/encodeURL',
		'sap/base/encoding/encodeURLParameters',
		'sap/base/encoding/encodeCSS',
		'sap/base/util/URLWhiteList',
		'sap/base/encoding/sanitizeHTML'
	],
	function(jQuery, encodeXML, encodeJS, encodeURL, encodeURLParameters, encodeCSS, URLWhiteList, sanitizeHTML) {
	"use strict";

	/**
	 * Encode the string for inclusion into HTML content/attribute
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for HTML contexts
	 * @function
	 */
	jQuery.sap.encodeHTML = encodeXML;

	/**
	 * Encode the string for inclusion into XML content/attribute
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for XML contexts
	 * @function
	 */
	jQuery.sap.encodeXML = encodeXML;

	/**
	 * Encode the string for inclusion into HTML content/attribute.
	 * Old name "escapeHTML" kept for backward compatibility
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @deprecated As of version 1.4.0, has been renamed, use {@link jQuery.sap.encodeHTML} instead.
	 * @function
	 */
	jQuery.sap.escapeHTML = encodeXML;

	/**
	 * Encode the string for inclusion into a JS string literal
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for a JavaScript contexts
	 * @function
	 */
	jQuery.sap.encodeJS = encodeJS;

	/**
	 * Encode the string for inclusion into a JS string literal.
	 * Old name "escapeJS" kept for backward compatibility
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @deprecated Since 1.3.0. Has been renamed, use {@link jQuery.sap.encodeJS} instead.
	 * @function
	 */
	jQuery.sap.escapeJS = encodeJS;

	/**
	 * Encode the string for inclusion into a URL parameter
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for a URL context
	 * @function
	 */
	jQuery.sap.encodeURL = encodeURL;

	/**
	 * Encode a map of parameters into a combined URL parameter string
	 *
	 * @param {object} mParams The map of parameters to encode
	 * @return The URL encoded parameters
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for a CSS context
	 * @function
	 */
	jQuery.sap.encodeURLParameters =  encodeURLParameters;


	/**
	 * Encode the string for inclusion into CSS string literals or identifiers
	 *
	 * @param {string} sString The string to be escaped
	 * @return The escaped string
	 * @type {string}
	 * @public
	 * @SecValidate {0|return|XSS} validates the given string for a CSS context
	 * @function
	 */
	jQuery.sap.encodeCSS = encodeCSS;


	/**
	 * Clears the whitelist for URL validation
	 *
	 * @public
	 * @function
	 */
	jQuery.sap.clearUrlWhitelist = URLWhiteList.clear;

	/**
	 * Adds a whitelist entry for URL validation.
	 *
	 * @param {string} protocol The protocol of the URL
	 * @param {string} host The host of the URL
	 * @param {string} port The port of the URL
	 * @param {string} path the path of the URL
	 * @public
	 * @function
	 */
	jQuery.sap.addUrlWhitelist = URLWhiteList.add;

	/**
	 * Removes a whitelist entry for URL validation.
	 *
	 * @param {int} iIndex index of entry
	 * @public
	 * @function
	 */
	jQuery.sap.removeUrlWhitelist = function(iIndex) {
		URLWhiteList.delete(URLWhiteList.entries()[iIndex]);
	};

	/**
	 * Gets the whitelist for URL validation.
	 *
	 * @return {object[]} A copy of the whitelist
	 * @public
	 * @function
	 */
	jQuery.sap.getUrlWhitelist = URLWhiteList.entries;

	/**
	 * Validates a URL. Check if it's not a script or other security issue.
	 *
	 * By default the URL validation does only allow the http, https and ftp protocol. If
	 * other protocols are required, a whitelist of all allowed protocols needs to be defined.
	 *
	 * Split URL into components and check for allowed characters according to RFC 3986:
	 *
	 * <pre>
	 * authority     = [ userinfo "@" ] host [ ":" port ]
	 * userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
	 * host          = IP-literal / IPv4address / reg-name
	 *
	 * IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"
	 * IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
	 * IPv6address   =                            6( h16 ":" ) ls32
	 *               /                       "::" 5( h16 ":" ) ls32
	 *               / [               h16 ] "::" 4( h16 ":" ) ls32
	 *               / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
	 *               / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
	 *               / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
	 *               / [ *4( h16 ":" ) h16 ] "::"              ls32
	 *               / [ *5( h16 ":" ) h16 ] "::"              h16
	 *               / [ *6( h16 ":" ) h16 ] "::"
	 * ls32          = ( h16 ":" h16 ) / IPv4address
	 *               ; least-significant 32 bits of address
	 * h16           = 1*4HEXDIG
 	 *               ; 16 bits of address represented in hexadecimal
 	 *
	 * IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
	 * dec-octet     = DIGIT                 ; 0-9
	 *               / %x31-39 DIGIT         ; 10-99
	 *               / "1" 2DIGIT            ; 100-199
	 *               / "2" %x30-34 DIGIT     ; 200-249
	 *               / "25" %x30-35          ; 250-255
	 *
	 * reg-name      = *( unreserved / pct-encoded / sub-delims )
	 *
	 * pct-encoded   = "%" HEXDIG HEXDIG
	 * reserved      = gen-delims / sub-delims
	 * gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
	 * sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
	 *               / "*" / "+" / "," / ";" / "="
	 * unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
	 * pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
	 *
	 * path          = path-abempty    ; begins with "/" or is empty
	 *               / path-absolute   ; begins with "/" but not "//"
	 *               / path-noscheme   ; begins with a non-colon segment
	 *               / path-rootless   ; begins with a segment
	 *               / path-empty      ; zero characters
	 *
	 * path-abempty  = *( "/" segment )
	 * path-absolute = "/" [ segment-nz *( "/" segment ) ]
	 * path-noscheme = segment-nz-nc *( "/" segment )
	 * path-rootless = segment-nz *( "/" segment )
	 * path-empty    = 0<pchar>
	 * segment       = *pchar
	 * segment-nz    = 1*pchar
	 * segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
	 *               ; non-zero-length segment without any colon ":"
	 *
	 * query         = *( pchar / "/" / "?" )
	 *
	 * fragment      = *( pchar / "/" / "?" )
	 * </pre>
	 *
	 * For the hostname component, we are checking for valid DNS hostnames according to RFC 952 / RFC 1123:
	 *
	 * <pre>
	 * hname         = name *("." name)
	 * name          = let-or-digit ( *( let-or-digit-or-hyphen ) let-or-digit )
	 * </pre>
	 *
	 *
	 * When the URI uses the protocol 'mailto:', the address part is additionally checked
	 * against the most commonly used parts of RFC 6068:
	 *
	 * <pre>
	 * mailtoURI     = "mailto:" [ to ] [ hfields ]
	 * to            = addr-spec *("," addr-spec )
	 * hfields       = "?" hfield *( "&" hfield )
	 * hfield        = hfname "=" hfvalue
	 * hfname        = *qchar
	 * hfvalue       = *qchar
	 * addr-spec     = local-part "@" domain
	 * local-part    = dot-atom-text              // not accepted: quoted-string
	 * domain        = dot-atom-text              // not accepted: "[" *dtext-no-obs "]"
	 * dtext-no-obs  = %d33-90 / ; Printable US-ASCII
	 *                 %d94-126  ; characters not including
	 *                           ; "[", "]", or "\"
	 * qchar         = unreserved / pct-encoded / some-delims
	 * some-delims   = "!" / "$" / "'" / "(" / ")" / "*"
	 *               / "+" / "," / ";" / ":" / "@"
	 *
	 * Note:
	 * A number of characters that can appear in &lt;addr-spec> MUST be
	 * percent-encoded.  These are the characters that cannot appear in
	 * a URI according to [STD66] as well as "%" (because it is used for
	 * percent-encoding) and all the characters in gen-delims except "@"
	 * and ":" (i.e., "/", "?", "#", "[", and "]").  Of the characters
	 * in sub-delims, at least the following also have to be percent-
	 * encoded: "&", ";", and "=".  Care has to be taken both when
	 * encoding as well as when decoding to make sure these operations
	 * are applied only once.
	 *
	 * </pre>
	 *
	 * When a whitelist has been configured using {@link #.addUrlWhitelist addUrlWhitelist},
	 * any URL that passes the syntactic checks above, additionally will be tested against
	 * the content of the whitelist.
	 *
	 * @param {string} sUrl
	 * @return true if valid, false if not valid
	 * @public
	 * @function
	 */
	jQuery.sap.validateUrl = URLWhiteList.validate;

	/**
	 * Strips unsafe tags and attributes from HTML.
	 *
	 * @param {string} sHTML the HTML to be sanitized.
	 * @param {object} [mOptions={}] options for the sanitizer
	 * @return {string} sanitized HTML
	 * @private
	 * @name jQuery.sap._sanitizeHTML
	 * @function
	 */
	Object.defineProperty(jQuery.sap, "_sanitizeHTML", {
		get: function() {
			var _sanitizeHTML = sap.ui.requireSync('sap/base/encoding/sanitizeHTML');

			Object.defineProperty(this, "_sanitizeHTML", {
				value: _sanitizeHTML,
				writable: true, // TODO re-evaluate
				configurable: false
			});

			return _sanitizeHTML;
		},
		configurable: true
	});

	return jQuery;

});
