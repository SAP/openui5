/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	// validation regexes
	var rBasicUrl = /^(?:([^:\/?#]+):)?((?:[\/\\]{2,}((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/;
	var rCheckPath = /^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;
	var rCheckQuery = /^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;
	var rCheckFragment = rCheckQuery;
	var rCheckMail = /^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
	var rCheckIPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
	var rCheckValidIPv4 = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
	var rCheckIPv6 = /^\[[^\]]+\]$/;
	var rCheckValidIPv6 = /^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;
	var rCheckHostName = /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;
	var rSpecialSchemeURLs = /^((?:ftp|https?|wss?):)([\s\S]+)$/;

	/* eslint-disable no-control-regex */
	var rCheckWhitespaces = /[\u0009\u000A\u000D]/;

	/**
	 * Registry to manage allowed URLs and validate against them.
	 *
	 * @namespace
	 * @since 1.85
	 * @alias module:sap/base/security/URLListValidator
	 * @public
	 */
	var oURLListValidator = {};

	/**
	 * Creates a new URLListValidator.Entry object
	 *
	 * @param {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
	 * @param {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
	 * @param {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
	 * @param {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
	 * @returns {module:sap/base/security/URLListValidator.Entry|object}
	 * @private
	 */
	oURLListValidator._createEntry = function (protocol, host, port, path) {
		return new URLListValidatorEntry(protocol, host, port, path);
	};

	/**
	 * Entry object of the URLListValidator.
	 *
	 * @public
	 * @typedef {object} module:sap/base/security/URLListValidator.Entry
	 * @property {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
	 * @property {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
	 * @property {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
	 * @property {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
	 */
	function URLListValidatorEntry(protocol, host, port, path){
		Object.defineProperties(this, {
			protocol: {
				value: protocol && protocol.toUpperCase(),
				enumerable: true
			},
			host: {
				value: host && host.toUpperCase(),
				enumerable: true
			},
			port: {
				value: port,
				enumerable: true
			},
			path: {
				value: path,
				enumerable: true
			}
		});
	}

	/**
	 * The internally managed allowed entries.
	 * @private
	 */
	var aAllowedEntries = [];

	/**
	 * Clears the allowed entries for URL validation.
	 * This makes all URLs allowed.
	 *
	 * @public
	 */
	oURLListValidator.clear = function() {
		aAllowedEntries = [];
	};

	/**
	 * Adds an allowed entry.
	 *
	 * Note:
	 * Adding the first entry to the list of allowed entries will disallow all URLs but the ones matching the newly added entry.
	 *
	 * <b>Note</b>:
	 * It is strongly recommended to set a path only in combination with an origin (never set a path alone).
	 * There's almost no case where checking only the path of a URL would allow to ensure its validity.
	 *
	 * @param {string} [protocol] The protocol of the URL, can be falsy to allow all protocols for an entry e.g. "", "http", "mailto"
	 * @param {string} [host] The host of the URL, can be falsy to allow all hosts. A wildcard asterisk can be set at the beginning, e.g. "examples.com", "*.example.com"
	 * @param {string} [port] The port of the URL, can be falsy to allow all ports, e.g. "", "8080"
	 * @param {string} [path] the path of the URL, path of the url, can be falsy to allow all paths. A wildcard asterisk can be set at the end, e.g. "/my-example*", "/my-news"
	 * @public
	 */
	oURLListValidator.add = function(protocol, host, port, path) {
		var oEntry = this._createEntry(protocol, host, port, path);
		aAllowedEntries.push(oEntry);
	};

	/**
	 * Deletes an entry from the allowed entries.
	 *
	 * Note:
	 * Deleting the last entry from the list of allowed entries will allow all URLs.
	 *
	 * @param {module:sap/base/security/URLListValidator.Entry} oEntry The entry to be deleted
	 * @private
	 */
	oURLListValidator._delete = function(oEntry) {
		aAllowedEntries.splice(aAllowedEntries.indexOf(oEntry), 1);
	};

	/**
	 * Gets the list of allowed entries.
	 *
	 * @returns {module:sap/base/security/URLListValidator.Entry[]} The allowed entries
	 * @public
	 */
	oURLListValidator.entries = function() {
		return aAllowedEntries.slice();
	};

	/**
	 * Validates a URL. Check if it's not a script or other security issue.
	 *
	 * <b>Note</b>:
	 * It is strongly recommended to validate only absolute URLs. There's almost no case
	 * where checking only the path of a URL would allow to ensure its validity.
	 * For compatibility reasons, this API cannot automatically resolve URLs relative to
	 * <code>document.baseURI</code>, but callers should do so. In that case, and when the
	 * allow list is not empty, an entry for the origin of <code>document.baseURI</code>
	 * must be added to the allow list.
	 *
	 * <h3>Details</h3>
	 * Splits the given URL into components and checks for allowed characters according to RFC 3986:
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
	 * When a list of allowed entries has been configured using {@link #add},
	 * any URL that passes the syntactic checks above, additionally will be tested against
	 * the content of this list.
	 *
	 * @param {string} sUrl URL to be validated
	 * @return {boolean} true if valid, false if not valid
	 * @public
	 */
	oURLListValidator.validate = function(sUrl) {

		// Test for not allowed whitespaces
		if (typeof sUrl === "string") {
			if (rCheckWhitespaces.test(sUrl)) {
				return false;
			}
		}

		// for 'special' URLs without a given base URL, the whatwg spec allows any number of slashes.
		// As the rBasicUrl regular expression cannot handle 'special' URLs, the URL is modified upfront,
		// if it wouldn't be recognized by the regex.
		// See https://url.spec.whatwg.org/#scheme-state (case 2.6.)
		var result = rSpecialSchemeURLs.exec(sUrl);
		if (result && !/^[\/\\]{2}/.test(result[2])) {
			sUrl = result[1] + "//" + result[2];
		}

		result = rBasicUrl.exec(sUrl);
		if (!result) {
			return false;
		}

		var sProtocol = result[1],
			sBody = result[2],
			sHost = result[3],
			sPort = result[4],
			sPath = result[5],
			sQuery = result[6],
			sHash = result[7];

		// protocol
		if (sProtocol) {
			sProtocol = sProtocol.toUpperCase();
			if (aAllowedEntries.length <= 0) {
				// no allowed entries -> check for default protocols
				if (!/^(https?|ftp)/i.test(sProtocol)) {
					return false;
				}
			}
		}

		// Host -> validity check for IP address or hostname
		if (sHost) {
			if (rCheckIPv4.test(sHost)) {
				if (!rCheckValidIPv4.test(sHost)) {
					//invalid ipv4 address
					return false;
				}
			} else if (rCheckIPv6.test(sHost)) {
				if (!rCheckValidIPv6.test(sHost)) {
					//invalid ipv6 address
					return false;
				}
			} else if (!rCheckHostName.test(sHost)) {
				// invalid host name
				return false;
			}
			sHost = sHost.toUpperCase();
		}

		// Path -> split for "/" and check if forbidden characters exist
		if (sPath) {
			if (sProtocol === "MAILTO") {
				var aAddresses = sBody.split(",");
				for ( var i = 0; i < aAddresses.length; i++) {
					if (!rCheckMail.test(aAddresses[i])) {
						// forbidden character found
						return false;
					}
				}
			} else {
				var aComponents = sPath.split("/");
				for ( var i = 0; i < aComponents.length; i++) {
					if (!rCheckPath.test(aComponents[i])) {
						// forbidden character found
						return false;
					}
				}
			}
		}

		// query
		if (sQuery) {
			if (!rCheckQuery.test(sQuery)) {
				// forbidden character found
				return false;
			}
		}

		// hash
		if (sHash) {
			if (!rCheckFragment.test(sHash)) {
				// forbidden character found
				return false;
			}
		}

		//filter allowed entries
		if (aAllowedEntries.length > 0) {
			var bFound = false;
			for (var i = 0; i < aAllowedEntries.length; i++) {
				if (!sProtocol || !aAllowedEntries[i].protocol || sProtocol == aAllowedEntries[i].protocol) {
					// protocol OK
					var bOk = false;
					if (sHost && aAllowedEntries[i].host && /^\*/.test(aAllowedEntries[i].host)) {
						// check for wildcard search at begin
						if (!aAllowedEntries[i]._hostRegexp) {
							var sHostEscaped = aAllowedEntries[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
							aAllowedEntries[i]._hostRegexp = RegExp(sHostEscaped + "$");
						}
						var rFilter = aAllowedEntries[i]._hostRegexp;
						if (rFilter.test(sHost)) {
							bOk = true;
						}
					} else if (!sHost || !aAllowedEntries[i].host || sHost == aAllowedEntries[i].host) {
						bOk = true;
					}
					if (bOk) {
						// host OK
						if ((!sHost && !sPort) || !aAllowedEntries[i].port || sPort == aAllowedEntries[i].port) {
							// port OK
							if (aAllowedEntries[i].path && /\*$/.test(aAllowedEntries[i].path)) {
								// check for wildcard search at end
								if (!aAllowedEntries[i]._pathRegexp) {
									var sPathEscaped = aAllowedEntries[i].path.slice(0, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
									aAllowedEntries[i]._pathRegexp = RegExp("^" + sPathEscaped);
								}
								var rFilter = aAllowedEntries[i]._pathRegexp;
								if (rFilter.test(sPath)) {
									bFound = true;
								}
							} else if (!aAllowedEntries[i].path || sPath == aAllowedEntries[i].path) {
								// path OK
								bFound = true;
							}
						}
					}
				}
				if (bFound) {
					break;
				}
			}
			if (!bFound) {
				return false;
			}
		}

		return true;
	};

	return oURLListValidator;
});
