/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define(['./ComponentMetadata'], function(ComponentMetadata) {
	"use strict";

	/**
	 * Creates a new metadata object for a UIComponent subclass.
	 *
	 * @param {string} sClassName Fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo Static info to construct the metadata from
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.15.1
	 * @alias sap.ui.core.UIComponentMetadata
	 * @extends sap.ui.core.ComponentMetadata
	 * @private
	 */
	var UIComponentMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		ComponentMetadata.apply(this, arguments);

	};

	//chain the prototypes
	UIComponentMetadata.prototype = Object.create(ComponentMetadata.prototype);
	UIComponentMetadata.prototype.constructor = UIComponentMetadata;


	/**
	 * Converts the legacy metadata into the new manifest format
	 *
	 * @param {object} oStaticInfo Static info containing the legacy metadata
	 * @param {object} oManifest The new manifest
	 * @private
	 */
	UIComponentMetadata.prototype._convertLegacyMetadata = function(oStaticInfo, oManifest) {
		ComponentMetadata.prototype._convertLegacyMetadata.call(this, oStaticInfo, oManifest);

		// add the old information on component metadata to the manifest info
		// if no manifest entry exists otherwise the metadata entry will be
		// ignored by the converter
		var oUI5Manifest = oManifest["sap.ui5"];
		var oRootView = oUI5Manifest["rootView"] || oStaticInfo["rootView"];
		if (oRootView) {
			oUI5Manifest["rootView"] = oRootView;
		}
		var oRouting = oUI5Manifest["routing"] || oStaticInfo["routing"];
		if (oRouting) {
			oUI5Manifest["routing"] = oRouting;
		}
	};

	return UIComponentMetadata;
});
