/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils"
], function(
	merge,
	BaseConnector,
	BrowserStorageUtils
) {
	"use strict";

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BrowserStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var BrowserStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.BrowserStorageConnector */ {
		/**
		 * can be either window.sessionStorage or window.localStorage
		 */
		oStorage: undefined,

		saveChange: function(sId, oChange) {
			var sChangeKey;
			var sChange;

			if (sId && oChange) {
				if (oChange.fileType === "ctrl_variant" && oChange.variantManagementReference) {
					sChangeKey = BrowserStorageUtils.createVariantKey(sId);
				} else {
					sChangeKey = BrowserStorageUtils.createChangeKey(sId);
				}
				sChange = JSON.stringify(oChange);
				this.oStorage.setItem(sChangeKey, sChange);
				return sChangeKey;
			}
		}
	});

	return BrowserStorageConnector;
}, true);
