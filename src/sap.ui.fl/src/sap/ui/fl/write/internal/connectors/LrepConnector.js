/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/Utils",
	"sap/ui/fl/Utils"
], function(
	merge,
	BaseConnector,
	ApplyUtils,
	FlexUtils
) {
	"use strict";

	var ROUTES = {
		FLEX_INFO: "/flex/info/",
		PUBLISH: "/actions/make_changes_transportable/",
		RESET: "/changes/"
	};

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write.internal.connectors.LrepConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var LrepConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write.internal.connectors.LrepConnector */ {

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			var mParameters = {};

			var sClient = FlexUtils.getUrlParameter("sap-client");
			sClient && (mParameters["sap-client"] = sClient);

			mParameters.reference = mPropertyBag.reference;
			delete mPropertyBag.reference;

			mPropertyBag.layer && (mParameters.layer = mPropertyBag.layer);
			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);
			mPropertyBag.changelist && (mParameters.changelist = mPropertyBag.changelist);
			mPropertyBag.generator && (mParameters.generator = mPropertyBag.generator);
			mPropertyBag.selectorIds && (mParameters.selector = mPropertyBag.selectorIds);
			mPropertyBag.changeTypes && (mParameters.changeType = mPropertyBag.changeTypes);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.RESET, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "DELETE");
		},

		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.package] ABAP package (mandatory when layer is 'VENDOR')
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as the publish has completed
		 */
		publish: function (mPropertyBag) {
			var mParameters = {};

			var sClient = FlexUtils.getUrlParameter("sap-client");
			sClient && (mParameters["sap-client"] = sClient);

			mParameters.reference = mPropertyBag.reference;
			delete mPropertyBag.reference;

			mPropertyBag.layer && (mParameters.layer = mPropertyBag.layer);
			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);
			mPropertyBag.changelist && (mParameters.changelist = mPropertyBag.changelist);
			mPropertyBag.package && (mParameters.package = mPropertyBag.package);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.PUBLISH, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "POST");
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo: function (mPropertyBag) {
			var mParameters = {};

			var sClient = FlexUtils.getUrlParameter("sap-client");
			sClient && (mParameters["sap-client"] = sClient);

			mPropertyBag.layer && (mParameters.layer = mPropertyBag.layer);
			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl);
		}

	});

	return LrepConnector;
}, true);
