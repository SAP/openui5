/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/assert"], function(assert) {

	"use strict";

	/**
	 * @exports sap/base/util/URLWhiteList
	 */
	var oURLWhiteList = {};

	/**
	 * Entry object of the URLWhitelist
	 * @typedef {object} sap/base/util/URLWhitelistEntry
	 * @property {string} protocol The protocol of the URL
	 * @property {string} host The host of the URL
	 * @property {string} port The port of the URL
	 * @property {string} path the path of the URL
	 */

	 /**
	  * @private
	  */
	function URLWhitelistEntry(protocol, host, port, path){
		if (protocol) {
			this.protocol = protocol.toUpperCase();
		}
		if (host) {
			this.host = host.toUpperCase();
		}
		this.port = port;
		this.path = path;
	}

	/**
	 * The internally managed whitelist array
	 * @private
	 */
	var aWhitelist = [];

	/**
	 * Clears the whitelist for URL validation
	 *
	 * @private
	 */
	oURLWhiteList.clear = function() {
		aWhitelist.splice(0,aWhitelist.length);
	};

	/**
	 * Adds a whitelist entry
	 *
	 * @param {string} protocol The protocol of the URL
	 * @param {string} host The host of the URL
	 * @param {string} port The port of the URL
	 * @param {string} path the path of the URL
	 * @private
	 */
	oURLWhiteList.add = function(protocol, host, port, path) {
		var oEntry = new URLWhitelistEntry(protocol, host, port, path);
		var iIndex = aWhitelist.length;
		aWhitelist[iIndex] = oEntry;
	};

	/**
	 * Deletes an entry from the whitelist entry
	 *
	 * @param {sap/base/util/URLWhitelistEntry} oEntry The entry to be deleted
	 * @private
	 */
	oURLWhiteList.delete = function(oEntry) {
		aWhitelist.splice(aWhitelist.indexOf(oEntry), 1);
	};

	/**
	 * Gets an array with the whitelist entries
	 *
	 * @returns {sap/base/util/URLWhitelistEntry[]} An array with whitelist entries
	 * @private
	 */
	oURLWhiteList.entries = function() {
		return aWhitelist.slice();
	};

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
	 * When a whitelist has been configured using {@link #.addUrlWhitelist addUrlWhitelist},
	 * any URL that passes the syntactic checks above, additionally will be tested against
	 * the content of the whitelist.
	 *
	 * @exports sap/base/util/validate
	 * @param {string} sUrl URL to be validated
	 * @return {boolean} true if valid, false if not valid
	 * @private
	 */
	oURLWhiteList.validate = function(sUrl) {

		var result = /^(?:([^:\/?#]+):)?((?:\/\/((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/.exec(sUrl);
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

		var rCheckPath = /^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;
		var rCheckQuery = /^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;
		var rCheckFragment = rCheckQuery;
		var rCheckMail = /^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
		var rCheckIPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
		var rCheckValidIPv4 = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
		var rCheckIPv6 = /^\[[^\]]+\]$/;
		var rCheckValidIPv6 = /^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;
		var rCheckHostName = /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;

		// protocol
		if (sProtocol) {
			sProtocol = sProtocol.toUpperCase();
			if (aWhitelist.length <= 0) {
				// no whitelist -> check for default protocols
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

		//filter whitelist
		if (aWhitelist.length > 0) {
			var bFound = false;
			for (var i = 0; i < aWhitelist.length; i++) {
				assert(aWhitelist[i] instanceof URLWhitelistEntry, "whitelist entry type wrong");
				if (!sProtocol || !aWhitelist[i].protocol || sProtocol == aWhitelist[i].protocol) {
					// protocol OK
					var bOk = false;
					if (sHost && aWhitelist[i].host && /^\*/.test(aWhitelist[i].host)) {
						// check for wildcard search at begin
						var sHostEscaped = aWhitelist[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
						var rFilter = RegExp(sHostEscaped + "$");
						if (rFilter.test(sHost)) {
							bOk = true;
						}
					} else if (!sHost || !aWhitelist[i].host || sHost == aWhitelist[i].host) {
						bOk = true;
					}
					if (bOk) {
						// host OK
						if ((!sHost && !sPort) || !aWhitelist[i].port || sPort == aWhitelist[i].port) {
							// port OK
							if (aWhitelist[i].path && /\*$/.test(aWhitelist[i].path)) {
								// check for wildcard search at end
								var sPathEscaped = aWhitelist[i].path.slice(0, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
								var rFilter = RegExp("^" + sPathEscaped);
								if (rFilter.test(sPath)) {
									bFound = true;
								}
							} else if (!aWhitelist[i].path || sPath == aWhitelist[i].path) {
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

	return oURLWhiteList;
});
