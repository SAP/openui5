/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState"
], function(
	JsControlTreeModifier,
	Element,
	ManifestUtils,
	UIChangesState
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
		var aComponentContainers = document.querySelector(".sapUiComponentContainer");
		aComponentContainers = Array.isArray(aComponentContainers) ? aComponentContainers : [aComponentContainers];
		aComponentContainers.some(function(oComponentContainerDomRef) {
			var oComponentContainer = Element.getElementById(oComponentContainerDomRef.id);
			var oAppComponent = oComponentContainer && oComponentContainer.getComponentInstance();

			if (oAppComponent && ManifestUtils.getFlexReferenceForControl(oAppComponent) === sComponentName) {
				oCorrectAppComponent = oAppComponent;
				return true;
			}
		});

		return oCorrectAppComponent;
	}

	// TODO with regards to variants, what is the expected outcome here? All UI Changes, all vm-independent + current variant UI Changes,
	// all vm-independent + all vm-dependent UI Changes?
	// as of now, _mChangesEntries is extremely unreliable. After creating a variant it includes all variants and all vm-dependent changes,
	// after a reload only the initial vm-dependent change is available.
	function enhanceExportWithChangeData(oChangePersistence, oExport) {
		var oAppComponent = getAppComponentInstance(oExport.sComponentName);
		for (var sChangeId in oChangePersistence._mChangesEntries) {
			var oChange = oChangePersistence._mChangesEntries[sChangeId];
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange.convertToFileContent(),
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentSelectorList && oAppComponent) {
				oChange._aDependentSelectorList.forEach(function(oSelector) {
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

		enhanceExportWithDependencyData(oExport.sComponentName, oExport);
	}

	function enhanceExportWithDependencyData(sReference, oExport) {
		const mInitialDependencies = UIChangesState.getCompleteDependencyMap(sReference);
		for (var sChangeId in mInitialDependencies) {
			var mChangeSpecificDependencies = mInitialDependencies[sChangeId];
			oExport.mChangesEntries[sChangeId].aControlsDependencies = mChangeSpecificDependencies.controlsDependencies;
			oExport.mChangesEntries[sChangeId].aDependencies = mChangeSpecificDependencies.dependencies;
		}
	}

	function enhanceWithChangetypeSpecificData(oExport, sExportParameterName, mControlData, sControlDataParameterName, aCustomDataChanges) {
		if (aCustomDataChanges) {
			mControlData[sControlDataParameterName] = aCustomDataChanges;
			mControlData[sControlDataParameterName].map(function(sChangeId) {
				if (!(sChangeId in oExport[sExportParameterName])) {
					oExport[sExportParameterName].push(sChangeId);
				}
			});
		}
	}

	function getChangesForControlFromCustomData(oControl, sIdentifier) {
		var aCustomData = oControl.getCustomData();
		var aChangeIds = [];
		aCustomData.forEach(function(oCustomData) {
			var sKey = oCustomData.getKey();
			if (sKey.startsWith(sIdentifier)) {
				aChangeIds.push(sKey.replace(sIdentifier, ""));
			}
		});
		return aChangeIds;
	}

	function enhanceExportWithControlData(oChangePersistence, oExport) {
		// collect applied changes

		for (var sControlId in oChangePersistence.getDependencyMapForComponent().mChanges) {
			var mControlData = {
				bPresent: false,
				aAppliedChanges: [],
				aFailedChangesJs: [],
				aFailedChangesXml: [],
				aNotApplicableChanges: []
			};

			var oControl = Element.getElementById(sControlId);

			if (oControl) {
				mControlData.bPresent = true;
				enhanceWithChangetypeSpecificData(
					oExport,
					"aAppliedChanges",
					mControlData,
					"aAppliedChanges",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.appliedChanges.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesJs",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.js.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesXml",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.xml.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aNotApplicableChanges",
					mControlData,
					"aNotApplicableChanges",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.notApplicableChanges.")
				);
			}
			oExport.mControlData[sControlId] = mControlData;
		}
	}

	return function(oChangePersistence) {
		if (!oChangePersistence) {
			return;
		}

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
		enhanceExportWithControlData(oChangePersistence, oExport);

		return oExport;
	};
});