/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/util/Manifest",
	"./Merger"
], function (
	BaseManifest,
	Merger
) {
	"use strict";
	/*
	 *
	 * @extends sap.ui.integration.util.Manifest
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.94
	 * @private
	 * @param {Object} oManifestJson A manifest JSON.
	 * @alias sap.ui.integration.editor.Manifest
	 */
	var Manifest = BaseManifest.extend("sap.ui.integration.editor.Manifest");

	Manifest.prototype.mergeDeltaChanges = function (oManifestJson) {
		return Merger.mergeDelta(oManifestJson, this._aChanges, this._sSection);
	};

	return Manifest;
});
