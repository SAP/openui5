sap.ui.define([
	"./TableQUnitUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer"
], function(
	TableQUnitUtils, ODataModel, MockServer
) {
	"use strict";

	const TableQUnitUtilsODataV2 = Object.assign({}, TableQUnitUtils);
	const sServiceURI = "/service/";
	const fnODataModelGetSharedData = ODataModel._getSharedData;

	/**
	 * Creates an ODataModel.
	 *
	 * @param {string} [sURL="/service/"] Service URL.
	 * @param {boolean} [bIgnoreMetadataCache=false] Whether the metadata should be requested, even if already available.
	 * @returns {sap.ui.model.odata.v2.ODataModel} The created ODataModel.
	 */
	TableQUnitUtilsODataV2.createODataModel = function(sURL, bIgnoreMetadataCache) {
		if (bIgnoreMetadataCache === true) {
			TableQUnitUtilsODataV2.disableMetadataCache();
		}

		const oDataModel = new ODataModel(sURL == null ? sServiceURI : sURL, {
			json: true
		});

		if (bIgnoreMetadataCache === true) {
			TableQUnitUtilsODataV2.enableMetadataCache();
		}

		return oDataModel;
	};

	/**
	 * Disables the metadata cache, so that the metadata is always requested, even if already available.
	 */
	TableQUnitUtilsODataV2.disableMetadataCache = function() {
		ODataModel._getSharedData = function() { return {}; };
	};

	/**
	 * Enables the metadata cache.
	 */
	TableQUnitUtilsODataV2.enableMetadataCache = function() {
		ODataModel._getSharedData = fnODataModelGetSharedData;
	};

	/**
	 * Creates a mock server and starts it.
	 *
	 * @param {int} [iResponseTime=10] Delay in milliseconds after which the mock server sends the response.
	 * @return {sap.ui.core.util.MockServer} The created mock server.
	 */
	TableQUnitUtilsODataV2.startMockServer = function(iResponseTime) {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseTime == null ? 10 : iResponseTime
		});

		const oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		const sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", sURLPrefix + "/mockdata/");
		oMockServer.start();

		return oMockServer;
	};

	return TableQUnitUtilsODataV2;
});