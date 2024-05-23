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
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/boot/_resourceRoots"
], (
	config,
	LoaderExtensions,
	_resourceRoots
) => {
	"use strict";

	_resourceRoots.register();

	function _mergeBootManifest(oParentManifest, oChildManifest) {
		const oMergedManifest = Object.assign({}, oParentManifest);
		delete oChildManifest.boot;
		oMergedManifest.config = oMergedManifest.config ? oMergedManifest.config : [];
		oMergedManifest.config = oMergedManifest.config.concat(oChildManifest.config || []);
		oMergedManifest.preBoot = oMergedManifest.preBoot ? oMergedManifest.preBoot : [];
		oMergedManifest.preBoot = oMergedManifest.preBoot.concat(oChildManifest.preBoot || []);
		oMergedManifest.postBoot = oMergedManifest.postBoot ? oMergedManifest.postBoot : [];
		oMergedManifest.postBoot = oMergedManifest.postBoot.concat(oChildManifest.postBoot || []);
		return oMergedManifest;
	}

	function _loadBootManifest(sManifest) {
		return LoaderExtensions.loadResource(sManifest, {async: true})
			.then((oManifest) => {
				if (oManifest.extends) {
					return _loadBootManifest(oManifest.extends)
						.then((oParentManifest) => {
							return _mergeBootManifest(oParentManifest, oManifest);
						});
				} else {
					return oManifest;
				}
			});
	}

	function loadBootManifest() {
		let sBootManifest = config.get({
			name: "sapUiBootManifest",
			type: config.Type.String
		});
		const aParts = sBootManifest.split("@");
		sBootManifest = aParts[0];
		const aResult = /.*(?=\/)/.exec(sBootManifest);
		if (aResult) {
			const paths = {};
			paths[aResult[0]] = aParts[1];
			sap.ui.loader.config({
				paths: paths
			});
		}
		return _loadBootManifest(sBootManifest);
	}

	return loadBootManifest;
});