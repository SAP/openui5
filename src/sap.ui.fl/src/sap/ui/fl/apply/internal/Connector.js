/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	ConnectorUtils
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistencies like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.apply.internal.Connector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl
	 */

	/* Default responses for not implemented functions / needed response on error handling. */
	var RESPONSES = {
		FLEX_DATA : {
			changes : [],
			variantSection : {}
		}
	};

	function loadFlexDataFromConnectors (mPropertyBag, aConnectors) {
		mPropertyBag.urls = {};
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			if (oConnectorConfig.url) {
				mPropertyBag.urls[oConnectorConfig.connectorName] = oConnectorConfig.url;
			}
			return new Promise(function (resolve) {
				oConnectorConfig.connector.loadFlexData(mPropertyBag)
					.then(resolve, ConnectorUtils.logAndResolveDefault.bind(null, resolve, RESPONSES.FLEX_DATA, oConnectorConfig, "loadFlexData"));
			});
		});

		return Promise.all(aConnectorPromises);
	}

	var Connector = {};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {map} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.appVersion] version of the application for which the flex data is requested
	 * @param {string} mPropertyBag.cacheKey cacheKey which can be used to etag / cachebuster the request
	 * @returns {Promise<Object>}
	 */
	Connector.loadFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("loadFlexData: No reference was provided.");
		}

		return ConnectorUtils.getApplyConnectors()
			.then(loadFlexDataFromConnectors.bind(this, mPropertyBag))
			.then(ConnectorUtils.mergeResults);
	};

	return Connector;
}, true);
