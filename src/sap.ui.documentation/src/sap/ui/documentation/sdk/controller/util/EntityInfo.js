/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from metamodel entities
sap.ui.define([
    './APIInfo',
    "sap/base/util/ObjectPath"
],
	function(APIInfo, ObjectPath) {
	"use strict";

	function findLibraryFromEntityName(sEntityName) {
		var oVersionInfo = sap.ui.getVersionInfo(),
			oLibrary,
			iLen,
			i;

		if ( oVersionInfo && Array.isArray(oVersionInfo.libraries) ) {
			iLen = oVersionInfo.libraries.length;
			for (i = 0; i < iLen; i++) {
				oLibrary = oVersionInfo.libraries[i];
				if ( sEntityName === oLibrary.name || sEntityName.indexOf(oLibrary.name + ".") === 0 ) {
					return oLibrary.name;
				}
			}
		}

		// fallback to core (this ensures that the extraordinary packages of sap.ui.core are found, but doesn't work as
		// soon as other libs do the same)
		return "sap.ui.core";
	}

	function getAsync(sEntityName, sLibraryName) {
		var oEntityDoc;

		if (!sLibraryName) {
			var oClass = ObjectPath.get(sEntityName || "");
			if (oClass && oClass.getMetadata) {
				var oMetadata = oClass.getMetadata();
				if (oMetadata.getLibraryName) {
					sLibraryName = oMetadata.getLibraryName();
				} else {
					sLibraryName = "sap.ui.core";
				}
			} else {
				sLibraryName = findLibraryFromEntityName(sEntityName);
			}
		}

		// If we have APIInfo json file we return a new promise which will return the oEntityDoc
		return APIInfo.getLibraryElementsJSONPromise(sLibraryName).then(function (oEntityCollection) {
			var oEntity;

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