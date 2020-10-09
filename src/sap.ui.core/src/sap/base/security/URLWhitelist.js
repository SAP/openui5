/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/security/URLListValidator"], function(URLListValidator) {

	"use strict";

	/**
	 * Registry to manage allowed URLs and validate against them.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/base/security/URLWhitelist
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator} instead.
	 * SAP strives to replace insensitive terms with inclusive language.
	 * Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
	 */

	/**
	 * Entry object of the URLWhitelist.
	 *
	 * @public
	 * @typedef {object} module:sap/base/security/URLWhitelist.Entry
	 * @property {string} protocol The protocol of the URL
	 * @property {string} host The host of the URL
	 * @property {string} port The port of the URL
	 * @property {string} path the path of the URL
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.Entry} instead.
	 */

	/**
	 * Clears the entries in the list.
	 *
	 * @name module:sap/base/security/URLWhitelist.clear
	 * @function
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.clear} instead.
	 */

	/**
	 * Adds an entry.
	 *
	 * Note:
	 * Adding the first entry to the list of allowed entries will disallow all URLs but the ones matching the newly added entry.
	 *
	 * @param {string} protocol The protocol of the URL
	 * @param {string} host The host of the URL
	 * @param {string} port The port of the URL
	 * @param {string} path the path of the URL
	 * @name module:sap/base/security/URLWhitelist.add
	 * @function
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.add} instead.
	 */


	/**
	 * Deletes an entry from the list.
	 *
	 * Note:
	 * Deleting the last entry from the list of allowed entries will allow all URLs.
	 *
	 * @param {module:sap/base/security/URLWhitelist.Entry} oEntry The entry to be deleted
	 * @name module:sap/base/security/URLWhitelist.delete
	 * @function
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.clear} and {@link module:sap/base/security/URLListValidator.add} instead.
	 */

	/**
	 * Gets the list of allowed entries.
	 *
	 * @returns {module:sap/base/security/URLWhitelist.Entry[]} The allowed entries
	 * @name module:sap/base/security/URLWhitelist.entries
	 * @function
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.entries} instead.
	 */

	/**
	 * Validates a URL. Check if it's not a script or other security issue.
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
	 * When a allowlist has been configured using {@link #add and @link #delete},
	 * any URL that passes the syntactic checks above, additionally will be tested against
	 * the content of the allowlist.
	 *
	 * @param {string} sUrl URL to be validated
	 * @return {boolean} true if valid, false if not valid
	 * @name module:sap/base/security/URLWhitelist.validate
	 * @function
	 * @public
	 * @deprecated Since 1.85 use {@link module:sap/base/security/URLListValidator.validate} instead
	 */

	return {
		"add": URLListValidator.add,
		"delete": URLListValidator._delete,
		"clear": URLListValidator.clear,
		"entries": URLListValidator.entries,
		"validate": URLListValidator.validate,
		"_createEntry": function (protocol, host, port, path) {
			return {
				protocol: protocol && protocol.toUpperCase(),
				host: host && host.toUpperCase(),
				port: port,
				path: path
			};
		}
	};
});
