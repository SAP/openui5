/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from metamodel entities
sap.ui.define([
    './APIInfo',
    "sap/base/util/ObjectPath",
    "sap/ui/VersionInfo"
],
	function(APIInfo, ObjectPath, VersionInfo) {
	"use strict";

	function findLibraryFromEntityName(sEntityName) {
		return VersionInfo.load().catch(function() {}).then(function(oVersionInfo) {
			if ( oVersionInfo && Array.isArray(oVersionInfo.libraries) ) {
				var iLen = oVersionInfo.libraries.length;
				for (var i = 0; i < iLen; i++) {
					var oLibrary = oVersionInfo.libraries[i];
					if ( sEntityName === oLibrary.name || sEntityName.indexOf(oLibrary.name + ".") === 0 ) {
						return oLibrary.name;
					}
				}
			}

			// fallback to core (this ensures that the extraordinary packages of sap.ui.core are found, but doesn't work as
			// soon as other libs do the same)
			return "sap.ui.core";
		});
	}

	function findLibraryName(sEntityName, sLibraryName) {

		// if library name is provided, go with it
		if (sLibraryName) {
			return Promise.resolve(sLibraryName);
		}

		// check if sEntityName represents a subclass of BaseObject and if so, use the metadata
		// TODO this relies on global names and needs to be refactored
		var oClass = ObjectPath.get(sEntityName || "");
		if (oClass && oClass.getMetadata) {
			var oMetadata = oClass.getMetadata();
			if (oMetadata.getLibraryName) {
				sLibraryName = oMetadata.getLibraryName();
			} else {
				sLibraryName = "sap.ui.core";
			}
			return Promise.resolve(sLibraryName);
		}

		return findLibraryFromEntityName(sEntityName);
	}

	function getAsync(sEntityName, sLibraryName) {

		return findLibraryName(sEntityName, sLibraryName).then(function(sLibraryName) {
			// If we have APIInfo json file, we return a new promise which will return the oEntityDoc
			return APIInfo.getLibraryElementsJSONPromise(sLibraryName);
		}).then(function (oEntityCollection) {
			var oEntity,
				oEntityDoc;

			// Find single entity entry
			for (var i = 0, iLen = oEntityCollection.length; i < iLen; i++) {
				if (oEntityCollection[i].name === sEntityName) {
					oEntity = oEntityCollection[i];
					break;
				}
			}

			if (oEntity) {
				// Create oEntityDoc
				oEntityDoc = {
					baseType: oEntity.extends,
					deprecation: oEntity.deprecatedText ? oEntity.deprecatedText : null,
					doc: oEntity.description,
					module: oEntity.module,
					name: oEntity.name,
					since: oEntity.since,
					values: oEntity.properties,
					uxGuidelinesLink: oEntity.uxGuidelinesLink,
					uxGuidelinesLinkText: oEntity.uxGuidelinesLinkText,
					docuLink: oEntity.docuLink,
					docuLinkText: oEntity.docuLinkText
				};
			}

			return oEntityDoc;
		});
	}

	return {
		getEntityDocuAsync : function (sEntityName, sLibraryName) {
			return getAsync(sEntityName, sLibraryName);
		}

	};

}, /* bExport= */ true);