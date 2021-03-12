/*!
 * ${copyright}
 */

// Provides encoding functions for JavaScript.
sap.ui.define(['jquery.sap.global',
		'sap/base/security/encodeXML',
		'sap/base/security/encodeJS',
		'sap/base/security/encodeURL',
		'sap/base/security/encodeURLParameters',
		'sap/base/security/encodeCSS',
		'sap/base/security/URLListValidator',
		'sap/base/security/URLWhitelist',
		'sap/base/security/sanitizeHTML'
	],
	function(jQuery, encodeXML, encodeJS, encodeURL, encodeURLParameters, encodeCSS, URLListValidator, URLWhitelist, sanitizeHTML) {
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeXML} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeXML} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeXML} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeJS} instead
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
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeJS} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeURL} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeURLParameters} instead
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
	 * @deprecated since 1.58 use {@link module:sap/base/security/encodeCSS} instead
	 */
	jQuery.sap.encodeCSS = encodeCSS;


	/**
	 * Clears the allowlist for URL validation.
	 *
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/URLListValidator.clear} instead.
	 * SAP strives to replace insensitive terms with inclusive language,
	 * but APIs cannot be renamed or immediately removed for compatibility reasons.
	 */
	jQuery.sap.clearUrlWhitelist = URLListValidator.clear;

	/**
	 * Adds an allowlist entry for URL validation.
	 *
	 * @param {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
	 * @param {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
	 * @param {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
	 * @param {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/URLListValidator.add} instead.
	 * SAP strives to replace insensitive terms with inclusive language,
	 * but APIs cannot be renamed or immediately removed for compatibility reasons.
	 */
	jQuery.sap.addUrlWhitelist = URLListValidator.add.bind(URLWhitelist);

	/**
	 * Removes an allowlist entry for URL validation.
	 *
	 * @param {int} iIndex index of entry
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/URLListValidator.clear} and {@link module:sap/base/security/URLListValidator.add} instead.
	 * SAP strives to replace insensitive terms with inclusive language,
	 * but APIs cannot be renamed or immediately removed for compatibility reasons.
	 */
	jQuery.sap.removeUrlWhitelist = function(iIndex) {
		URLListValidator._delete(URLListValidator.entries()[iIndex]);
	};

	/**
	 * Gets the allowlist for URL validation.
	 *
	 * @return {object[]} A copy of the allowlist
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/URLListValidator.entries} instead.
	 * SAP strives to replace insensitive terms with inclusive language,
	 * but APIs cannot be renamed or immediately removed for compatibility reasons.
	 */
	jQuery.sap.getUrlWhitelist = URLListValidator.entries;

	/**
	 * Validates a URL. Check if it's not a script or other security issue.
	 *
	 * By default the URL validation does only allow the http, https and ftp protocol. If
	 * other protocols are required, an allowlist of all allowed protocols needs to be defined.
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
	 * When an allowlist has been configured using {@link module:sap/base/security/URLListValidator.add add},
	 * any URL that passes the syntactic checks above, additionally will be tested against
	 * the content of the allowlist.
	 *
	 * @param {string} sUrl
	 * @return true if valid, false if not valid
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/URLListValidator.validate} instead.
	 */
	jQuery.sap.validateUrl = URLListValidator.validate;

	/**
	 * Strips unsafe tags and attributes from HTML.
	 *
	 * @param {string} sHTML the HTML to be sanitized.
	 * @param {object} [mOptions={}] options for the sanitizer
	 * @return {string} sanitized HTML
	 * @private
	 * @name jQuery.sap._sanitizeHTML
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/security/sanitizeHTML} instead
	 */
	jQuery.sap._sanitizeHTML = sanitizeHTML;

	return jQuery;

});