/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation topics from index.json files.
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/documentation/sdk/util/Resources", "sap/ui/documentation/sdk/controller/util/TreeUtil"],
	function (jQuery, ResourcesUtil, TreeUtil) {
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


		function _getDocumentTitle(sTopicId, oConfig) {
			return _getDocuIndexPromise(oConfig).then(function (oData) {
				var oTreeUtil = TreeUtil.getInstance(TreeUtil.treeTypes.Documentation, "key", "links");
				var oTopicInfo = oTreeUtil.getNodeById(sTopicId, oData);
				return oTopicInfo?.text;
			});
		}

		return {
			getDocuIndexPromise: _getDocuIndexPromise,
			getDocumentTitle: _getDocumentTitle
		};
	});