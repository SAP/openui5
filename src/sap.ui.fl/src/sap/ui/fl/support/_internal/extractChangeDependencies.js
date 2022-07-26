/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	JsControlTreeModifier,
	ManifestUtils
) {
	"use strict";

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
	function getAppComponentInstance(sComponentName) {
		var oCorrectAppComponent;
		var aComponentContainers = jQuery.find(".sapUiComponentContainer");
		aComponentContainers.some(function(oComponentContainerDomRef) {
			var oComponentContainer = sap.ui.getCore().byId(oComponentContainerDomRef.id);
			var oAppComponent = oComponentContainer && oComponentContainer.getComponentInstance();

			if (oAppComponent && ManifestUtils.getFlexReferenceForControl(oAppComponent) === sComponentName) {
				oCorrectAppComponent = oAppComponent;
				return true;
			}
		});

		return oCorrectAppComponent;
	}

	function enhanceExportWithChangeData(oChangePersistence, oExport) {
		var oAppComponent = getAppComponentInstance(oExport.sComponentName);
		for (var sChangeId in oChangePersistence._mChangesEntries) {
			var oChange = oChangePersistence._mChangesEntries[sChangeId];
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange._oDefinition,
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentSelectorList) {
				oChange._aDependentSelectorList.forEach(function (oSelector) {
					var mControlData = {
						bPresent: !!JsControlTreeModifier.bySelector(oSelector, oAppComponent),
						aAppliedChanges: [],
						aFailedChangesJs: [],
						aFailedChangesXml: [],
						aNotApplicableChanges: []
					};

					oExport.mControlData[oSelector.id] = mControlData;
				});
			}
		}

		enhanceExportWithDependencyData(oChangePersistence, oExport);
	}

	function enhanceExportWithDependencyData(oChangePersistence, oExport) {
		for (var sChangeId in oChangePersistence._mChangesInitial.mDependencies) {
			var mChangeSpecificDependencies = oChangePersistence._mChangesInitial.mDependencies[sChangeId];
			oExport.mChangesEntries[sChangeId].aControlsDependencies = mChangeSpecificDependencies.controlsDependencies;
			oExport.mChangesEntries[sChangeId].aDependencies = mChangeSpecificDependencies.dependencies;
		}
	}

	function enhanceExportWithVariantChangeData (oChangePersistence, oExport) {
		jQuery.each(oChangePersistence._mVariantsChanges, function (sChangeId, oChange) {
			oExport.mVariantsChanges[sChangeId] = {
				mDefinition: oChange._oDefinition
			};
		});
	}

	function enhanceWithChangetypeSpecificData(oExport, sExportParameterName, mControlData, sControlDataParameterName, aCustomDataChanges) {
		if (aCustomDataChanges) {
			mControlData[sControlDataParameterName] = aCustomDataChanges;
			mControlData[sControlDataParameterName].map(function (sChangeId) {
				if (!(sChangeId in oExport[sExportParameterName])) {
					oExport[sExportParameterName].push(sChangeId);
				}
			});
		}
	}

	function getChangesForControlFromCustomData (oControl, sIdentifier) {
		var aCustomData = oControl.getCustomData();
		var aChangeIds = [];
		aCustomData.forEach(function (oCustomData) {
			var sKey = oCustomData.getKey();
			if (sKey.startsWith(sIdentifier)) {
				aChangeIds.push(sKey.replace(sIdentifier, ""));
			}
		});
		return aChangeIds;
	}

	function enhanceExportWithControlData (oChangePersistence, oExport) {
		// collect applied changes

		for (var sControlId in oChangePersistence._mChanges.mChanges) {
			var mControlData = {
				bPresent: false,
				aAppliedChanges: [],
				aFailedChangesJs: [],
				aFailedChangesXml: [],
				aNotApplicableChanges: []
			};

			var oControl = sap.ui.getCore().byId(sControlId);

			if (oControl) {
				mControlData.bPresent = true;
				enhanceWithChangetypeSpecificData(oExport, "aAppliedChanges", mControlData, "aAppliedChanges", getChangesForControlFromCustomData(oControl, "sap.ui.fl.appliedChanges."));
				enhanceWithChangetypeSpecificData(oExport, "aFailedChanges", mControlData, "aFailedChangesJs", getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.js."));
				enhanceWithChangetypeSpecificData(oExport, "aFailedChanges", mControlData, "aFailedChangesXml", getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.xml."));
				enhanceWithChangetypeSpecificData(oExport, "aNotApplicableChanges", mControlData, "aNotApplicableChanges", getChangesForControlFromCustomData(oControl, "sap.ui.fl.notApplicableChanges."));
			}
			oExport.mControlData[sControlId] = mControlData;
		}
	}

	return function (oChangePersistence) {
		var oExport = {
			sVersion: "1",
			bIsInvestigationExport: true,
			mControlData: {},
			aAppliedChanges: [],
			aFailedChanges: [],
			aNotApplicableChanges: [],
			mChangesEntries: {},
			mVariantsChanges: {},
			sComponentName: oChangePersistence._mComponent.name
		};

		enhanceExportWithChangeData(oChangePersistence, oExport);
		enhanceExportWithVariantChangeData(oChangePersistence, oExport);
		enhanceExportWithControlData(oChangePersistence, oExport);

		return oExport;
	};
});