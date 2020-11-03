/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation topics from index.json files.
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/documentation/sdk/util/Resources"],
	function (jQuery, ResourcesUtil) {
		"use strict";

		var oCachedData;

		function _getDocuIndexPromise(oConfig) {
			if (oCachedData) {
				return Promise.resolve(oCachedData);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url: ResourcesUtil.getResourceOriginPath(oConfig.docuPath + "index.json"),
					dataType: 'json',
					success: function (oData) {
						oCachedData = oData;
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});

		}

		return {
			getDocuIndexPromise: _getDocuIndexPromise
		};
	});