/*!
 * ${copyright}
 */

/**
 * Load boot manifest chain
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/util/LoaderExtensions"
], function(
	config,
	LoaderExtensions
) {
	"use strict";

	function mergeManifest(oParentManifest, oChildManifest) {
		var oMergedManifest = Object.assign({}, oParentManifest);
		delete oChildManifest.boot;
		oMergedManifest.preBoot = oMergedManifest.preBoot ? oMergedManifest.preBoot : [];
		oMergedManifest.preBoot = oMergedManifest.preBoot.concat(oChildManifest.preBoot || []);
		oChildManifest.postBoot = oChildManifest.postBoot ? oChildManifest.postBoot : [];
		oMergedManifest.postBoot = oChildManifest.postBoot.concat(oMergedManifest.postBoot || []);
		return oMergedManifest;
	}

	function _loadManifest(sManifest) {
		var pManifest = LoaderExtensions.loadResource(sManifest, {async: true})
			.then(function(oManifest){
				if (oManifest.extends) {
					return _loadManifest(oManifest.extends)
						.then(function(oParentManifest) {
							return mergeManifest(oParentManifest, oManifest);
						});
				}
				return oManifest;
			});
		return pManifest;
	}

	function loadManifest() {
		var sBootManifest = config.get({
			name: "sapUiBootManifest",
			type: config.Type.String
		});
		return _loadManifest(sBootManifest);
	}

	return loadManifest;
});