/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/File",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/jquery"
], function(File, JsControlTreeModifier, MessageBox, jQuery) {
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
			sComponentName: oChangePersistence._mComponent.name
		};

		this._enhanceExportWithChangeData(oChangePersistence, oExport);
		this._enhanceExportWithVariantChangeData(oChangePersistence, oExport);
		this._enhanceExportWithControlData(oChangePersistence, oExport);

		return oExport;
	};

	/**
	 * Searches for a component instance on the UI with the same name as given in the parameter
	 * The instance is searched via a styleclass search on the UI and comparison of the component name
	 * Currently there is no proper way to retrieve component instance by name
	 * THIS IS ONLY A WORKAROUND! Should be changed as soon as there is an API for this
	 *
	 * @param {string} sComponentName name of the component
	 * @returns {sap.ui.core.Component} Returns an instance of the component
	 * @private
	 * @restricted sap.ui.fl
	 */
	Extractor.getAppComponentInstance = function (sComponentName) {
		var oCorrectAppComponent;
		var aComponentContainers = jQuery.find(".sapUiComponentContainer");
		aComponentContainers.some(function(oComponentContainerDomRef) {
			var oComponentContainer = sap.ui.getCore().byId(oComponentContainerDomRef.id);
			var oAppComponent = oComponentContainer && oComponentContainer.getComponentInstance();

			if (oAppComponent && oAppComponent.getMetadata().getName() === sComponentName) {
				oCorrectAppComponent = oAppComponent;
				return true;
			}
		});

		return oCorrectAppComponent;
	};

	Extractor._enhanceExportWithChangeData = function (oChangePersistence, oExport) {
		var oAppComponent = Extractor.getAppComponentInstance(oExport.sComponentName);
		jQuery.each(oChangePersistence._mChangesEntries, function (sChangeId, oChange) {
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange._oDefinition,
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentSelectorList) {
				oChange._aDependentSelectorList.forEach(function (oSelector) {
					var mControlData = {
						bPresent : !!JsControlTreeModifier.bySelector(oSelector, oAppComponent),
						aAppliedChanges : [],
						aFailedChangesJs : [],
						aFailedChangesXml : []
					};

					oExport.mControlData[oSelector.id] = mControlData;
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