/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/util/File",
	"sap/m/MessageBox"
], function(JSONModel, ChangePersistenceFactory, File, MessageBox) {
	"use strict";

	var Extractor = {};

	Extractor.extractData = function (oChangePersistence) {
		var oExport = {
			bIsInvestigationExport: true,
			mControlData : {},
			aAppliedChanges : [],
			aFailedChanges : [],
			mChangesEntries: {},
			mVariantsChanges: {},
			sComponentName: oChangePersistence._sComponentName
		};

		this._enhanceExportWithChangeData(oChangePersistence, oExport);
		this._enhanceExportWithVariantChangeData(oChangePersistence, oExport);
		this._enhanceExportWithControlData(oChangePersistence, oExport);

		return oExport;
	};

	Extractor._enhanceExportWithChangeData = function (oChangePersistence, oExport) {
		jQuery.each(oChangePersistence._mChangesEntries, function (sChangeId, oChange) {
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange._oDefinition,
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentIdList) {
				oChange._aDependentIdList.forEach(function (sDependentControlId) {
					var mControlData = {
						bPresent : !!sap.ui.getCore().byId(sDependentControlId),
						aAppliedChanges : [],
						aFailedChangesJs : [],
						aFailedChangesXml : []
					};

					oExport.mControlData[sDependentControlId] = mControlData;
				});
			}
		});

		this._enhanceExportWithDependencyData(oChangePersistence, oExport);
	};

	Extractor._enhanceExportWithDependencyData = function (oChangePersistence, oExport) {
		jQuery.each(oChangePersistence._mChangesInitial.mDependencies, function (sChangeId, mChangeSpecificDependencies) {
			oExport.mChangesEntries[sChangeId].aControlsDependencies = mChangeSpecificDependencies.controlsDependencies;
			oExport.mChangesEntries[sChangeId].aDependencies = mChangeSpecificDependencies.dependencies;
		});
	};
	Extractor._enhanceExportWithVariantChangeData = function (oChangePersistence, oExport) {
		jQuery.each(oChangePersistence._mVariantsChanges, function (sChangeId, oChange) {
			oExport.mVariantsChanges[sChangeId] = {
				mDefinition: oChange._oDefinition
			};
		});
	};


	Extractor._enhanceExportWithControlData = function (oChangePersistence, oExport) {
		// collect applied changes
		jQuery.each(oChangePersistence._mChanges.mChanges, function (sControlId, aChangesOnControl) {
			var mControlData = {
				bPresent : false,
				aAppliedChanges : [],
				aFailedChangesJs : [],
				aFailedChangesXml : []
			};

			var oControl = sap.ui.getCore().byId(sControlId);

			if (oControl) {
				mControlData.bPresent = true;

				if (oControl.data("sap.ui.fl.appliedChanges")) {
					mControlData.aAppliedChanges = oControl.data("sap.ui.fl.appliedChanges").split(",");
					mControlData.aAppliedChanges.map(function (sChangeId) {
						if (!(sChangeId in oExport.aAppliedChanges)) {
							oExport.aAppliedChanges.push(sChangeId);
						}
					});
				}
				if (oControl.data("sap.ui.fl.failedChanges.js")) {
					var aFailedJsChanges = oControl.data("sap.ui.fl.failedChanges.js").split(",");
					mControlData.aFailedChangesJs = aFailedJsChanges;
					mControlData.aFailedChangesJs.map(function (sChangeId) {
						if (!(sChangeId in oExport.aFailedChanges)) {
							oExport.aFailedChanges.push(sChangeId);
						}
					});
				}
				if (oControl.data("sap.ui.fl.failedChanges.xml")) {
					var aFailedXmlChanges = oControl.data("sap.ui.fl.failedChanges.xml").split(",");
					mControlData.aFailedChangesXml = aFailedXmlChanges;
					mControlData.aFailedChangesXml.map(function (sChangeId) {
						if (!(sChangeId in oExport.aFailedChanges)) {
							oExport.aFailedChanges.push(sChangeId);
						}
					});
				}
			}
			oExport.mControlData[sControlId] = mControlData;
		});
	};

	Extractor.createDownloadFile = function (oExport) {
		try {
			var sExportString = JSON.stringify(oExport);
			File.save(sExportString, "flexibilityDataExtraction", "json");
		} catch (e) {
			MessageBox.error(
				"The export of the flexibility data was not successful.\n" + e.message
			);
		}
	};

	return Extractor;
});