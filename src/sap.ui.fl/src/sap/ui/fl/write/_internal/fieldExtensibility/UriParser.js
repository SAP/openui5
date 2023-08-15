/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var mServiceType = {
		v2: "v2",
		v4: "v4"
	};

	/**
	 * Extracts ServiceName and ServiceVersion out of Service URI
	 *
	 * @param {string} sServiceUri - URI to an OData v2 service document
	 * @returns {object} An object with serviceName, serviceVersion and serviceType
	 * @private
	 */
	function parseV2ServiceUri(sServiceUri) {
		/**
		 * 1.) Case
		 * If and only if a service URI contains "sap/opu/odata" and the subsequent segment (namespace) is not "sap"
		 * than the result is defined as "/<namespace>/<ServiceName>". The segment MUST not contain a slash.
		 * Both "sap/opa/odata" and the namespace are considered case insensitive because ABAP does not respect
		 * case sensitivity.
		 * 2.) Case
		 * If the namespace is "sap" the result is defined as "<ServiceName>".
		 * 3.) Case
		 * If a service URI does not contain "sap/opu/odata" the result is defined as the last segement of the resource
		 * path without a leading slash.
		 *
		 * Note: A service URI may contain a service version. Service versions have to specified as matrix parameter "v"
		 * of the resource segment which represents the service name. e.g. sap/opu/odata/MyService;v=0002. Only
		 * numerical characters are allowed. Default version is '0001'.
		 */

		// 1. Capture group => Namespace    2.) Capture group => Service Name
		var oRegexService = /.*sap\/opu\/odata\/([^\/]+)\/([^\/]+)/i;
		var oRegexServiceVersion = /([^;]+);v=(\d{1,4})/i;

		var sODataPath = "sap/opu/odata";
		var sServiceNameWithVersion;

		// First extract namespace and service
		if (sServiceUri.toLowerCase().indexOf(sODataPath) !== -1) {
			// 1. and 2. Case
			var aServiceSegments = sServiceUri.match(oRegexService);
			if (!aServiceSegments || aServiceSegments.length !== 3) {
				throw new Error("sap.ui.fl.fieldExt.UriParser.parseV2ServiceUri: Malformed service URI (Invalid service name)");
			}
			if (aServiceSegments[1].toLowerCase() !== "sap") { // 1.) Case
				sServiceNameWithVersion = `/${aServiceSegments[1]}/${aServiceSegments[2]}`;
			} else { // 2.) Case
				sServiceNameWithVersion = aServiceSegments[2];
			}
		} else { // 3. Case
			// Remove last slash
			if (sServiceUri.length > 0 && sServiceUri.lastIndexOf("/") + 1 === sServiceUri.length) {
				sServiceUri = sServiceUri.substring(0, sServiceUri.length - 1);
			}
			sServiceNameWithVersion = sServiceUri.substring(sServiceUri.lastIndexOf("/") + 1);
		}

		// Check if a service version has been specified
		if (sServiceNameWithVersion.indexOf(";v=") !== -1) {
			var aVersionSegments = sServiceNameWithVersion.match(oRegexServiceVersion);
			if (!aVersionSegments || aVersionSegments.length !== 3) {
				throw new Error("sap.ui.fl.fieldExt.UriParser.parseV2ServiceUri: Malformed service URI (Invalid version)");
			}

			return {
				serviceName: aVersionSegments[1],
				serviceVersion: aVersionSegments[2],
				serviceType: mServiceType.v2
			};
		}
		return {
			serviceName: sServiceNameWithVersion,
			serviceVersion: "0001",
			serviceType: mServiceType.v2
		};
	}

	/**
	 * Extracts ServiceName and ServiceVersion out of Service URI
	 *
	 * @private
	 * @param {string} sServiceUri - URI to an OData v4 service document
	 * @returns {object} An object with serviceName and serviceVersion
	 */
	function parseV4ServiceUri(sServiceUri) {
		/**
		 * a SAP Gateway OData V4 service URI looks as follows:
		 * /sap/opu/odata4/<service group namespace>/<service group id>/<repository id>/<service namespace>/<service id>/<service version>/
		 * Examples:
		 * /sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/
		 * /sap/opu/odata4/sap/aivs_mdbu_read_app/sadl_srvd/sap/aivs_mdbu_read/0001/
		 * /sap/opu/odata4/sap/aps_integration_test/sadl/sap/i_cfd_tsm_so_core/0001/
		 * The service group is only used for administration purpose. The combination of <repository id>, <service namespace> and <service id> identifies a service uniquely.
		 * Therefore the part /<repository id>/<service namespace>/<service id> will be handled as serviceName
		 */

		// refer to ABAP gateway lib implementation (/IWCOR/CL_OD_HDLR_ROOT=>GET_SERVICE_NAME)
		// 1st Capture group => service group, repository, service
		// 2nd Capture group => service version segment
		// 3nd Capture group => resource path
		var oRegexService = /^\/?sap\/opu\/odata4((?:\/[^/]+){5})(\/[^/]+){1}(\/.*)?/i;
		var aServiceSegments = sServiceUri.match(oRegexService);
		if (!aServiceSegments || aServiceSegments.length !== 4) {
			throw new Error("sap.ui.fl.fieldExt.UriParser.parseV4ServiceUri: Malformed service URI");
		}

		// extract service name
		var aNameSegments = aServiceSegments[1].split("/");
		aNameSegments.splice(0, 3); // remove leading "/", group namespace and group name

		// extract service version
		var oRegexServiceVersion = /(\d{1,4})/i;
		var aVersionSegments = aServiceSegments[2].match(oRegexServiceVersion);

		return {
			serviceName: aNameSegments.join("/"),
			serviceVersion: aVersionSegments[1],
			serviceType: mServiceType.v4
		};
	}

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.UriParser
	 * @since 1.87.0
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var UriParser = {};

	/**
	 * Defines the service types or protocol types, which are supported
	 *
	 * @enum {map}
	 * @public
	 */
	UriParser.mServiceType = mServiceType;

	/**
	 * Defines the URI prefix for services using OData protocol version 4
	 *
	 * @enum {string}
	 * @public
	 */
	UriParser.sODataV4ResourcePathPrefix = "sap/opu/odata4/";

	/**
	 * Extracts ServiceName and ServiceVersion out of Service URI
	 *
	 * serviceInfo: {
	 *      "serviceName":      "<string>",
	 *      "serviceVersion":   "<string>",
	 *      "serviceType":      "<string>"
	 * }
	 *
	 * @param {string} sServiceUri - URI to an OData service document
	 * @returns {object} A serviceInfo object
	 * @public
	 */
	UriParser.parseServiceUri = function(sServiceUri) {
		if (sServiceUri.toLowerCase().indexOf(this.sODataV4ResourcePathPrefix) !== -1) {
			return parseV4ServiceUri(sServiceUri);
		}

		return parseV2ServiceUri(sServiceUri);
	};

	return UriParser;
});