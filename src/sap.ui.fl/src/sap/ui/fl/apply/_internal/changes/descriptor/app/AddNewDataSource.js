
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	DescriptorChangeCheck
) {
	"use strict";

	const MANDATORY_PROPERTIES = ["uri"];
	const SUPPORTED_PROPERTIES = [...MANDATORY_PROPERTIES, "type", "settings", "customType"];
	const PROPERTIES_PATTERNS = {
		type: "^(OData|ODataAnnotation|INA|XML|JSON|FHIR|WebSocket|http)$",
		customType: "^false$"
	};
	const SUPPORTED_TYPES = {
		uri: "string",
		type: "string",
		settings: typeof {},
		dataSourceCustom: "boolean",
		annotations: typeof []
	};

	function isDataSourceIdExistingInManifest(oManifestDataSources, sDataSourceId) {
		return Object.keys(oManifestDataSources).includes(sDataSourceId);
	}

	function getDataSourceType(oDataSource) {
		return oDataSource.type || "OData";
	}

	function getDataSourceNameByType(oChangeDataSource, sType) {
		const [sDataSourceName] = Object.entries(oChangeDataSource).find(([, oDataSource]) => getDataSourceType(oDataSource) === sType) || [];
		return sDataSourceName;
	}

	function checkDefinedAnnotationsExistInManifest(oManifestDataSources, sDataSourceOfTypeOData, aToBeCheckedInManifestAnnotations) {
		aToBeCheckedInManifestAnnotations.forEach(function(sAnnotation) {
			if (!isDataSourceIdExistingInManifest(oManifestDataSources, sAnnotation)) {
				throw new Error(`Referenced annotation '${sAnnotation}' in the annotation array of data source '${sDataSourceOfTypeOData}' does not exist in the manifest.`);
			}
		});
	}

	function checksWhenAddingTwoDataSources(oManifestDataSources, oChangeDataSource) {
		const sDataSourceOfTypeOData = getDataSourceNameByType(oChangeDataSource, "OData");
		const sDataSourceOfTypeODataAnnotation = getDataSourceNameByType(oChangeDataSource, "ODataAnnotation");

		if (!(sDataSourceOfTypeOData && sDataSourceOfTypeODataAnnotation)) {
			throw new Error(`When adding two data sources it is only allwoed to add a data source with type 'OData' and the other one must be of type 'ODataAnnotation'.`);
		}

		if (!oChangeDataSource[sDataSourceOfTypeOData]?.settings?.annotations?.includes(sDataSourceOfTypeODataAnnotation)) {
			throw new Error(`Data source '${sDataSourceOfTypeOData}' does not include annotation '${sDataSourceOfTypeODataAnnotation}' under 'settings/annotations' array.`);
		}

		const aToBeCheckedInManifestAnnotations = oChangeDataSource[sDataSourceOfTypeOData].settings.annotations.filter(function(sAnnotation) {
			return sAnnotation !== sDataSourceOfTypeODataAnnotation;
		});
		checkDefinedAnnotationsExistInManifest(oManifestDataSources, sDataSourceOfTypeOData, aToBeCheckedInManifestAnnotations);
	}

	function checksWhenAddingOneDataSource(oManifestDataSources, oChangeDataSource) {
		const sDataSourceOfTypeOData = getDataSourceNameByType(oChangeDataSource, "OData");
		if (oChangeDataSource[sDataSourceOfTypeOData].settings?.annotations) {
			checkDefinedAnnotationsExistInManifest(oManifestDataSources, sDataSourceOfTypeOData, oChangeDataSource[sDataSourceOfTypeOData].settings.annotations);
		}
	}

	function postChecks(oManifestDataSources, oChangeDataSource, aDataSources) {
		aDataSources.forEach(function(sDataSource) {
			if (isDataSourceIdExistingInManifest(oManifestDataSources, sDataSource)) {
				throw new Error(`There is already a dataSource '${sDataSource}' existing in the manifest.`);
			}

			checkIfAnnotationsPropertyIsAnArray(oChangeDataSource, sDataSource);
		});
		if (aDataSources.length === 1) {
			checksWhenAddingOneDataSource(oManifestDataSources, oChangeDataSource);
		}
		if (aDataSources.length === 2) {
			checksWhenAddingTwoDataSources(oManifestDataSources, oChangeDataSource);
		}
	}

	function checkIfAnnotationsPropertyIsAnArray(oChangeDataSource, sDataSource) {
		const sDataSourceType = getDataSourceType(oChangeDataSource[sDataSource]);

		if (oChangeDataSource[sDataSource].settings?.annotations) {
			if (sDataSourceType !== "OData") {
				throw new Error(`Data source '${sDataSource}' which is of type '${sDataSourceType}' contains the annotations array. Only data sources with type 'OData' could contain the 'settings/annotations' array.`);
			}

			if (!Array.isArray(oChangeDataSource[sDataSource].settings.annotations)) {
				throw new Error(`Property 'annotations' must be of type 'array'.`);
			}
		}
	}

	/**
	 * Descriptor change merger for change type <code>appdescr_app_addNewDataSource</code>.
	 * Adds a new data source to the manifest.json file under the path sap.app.dataSources.
	 *
	 * Available only for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.app.AddNewDataSource
	 * @since 1.87
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const AddNewDataSource = {

		/**
		 * Applies the <code>appdescr_app_addNewDataSource</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_addNewDataSource</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {object} oChange.content.dataSource - Data source of <code>sap.app/dataSource</code> that is being changed
		 * @returns {object} Updated manifest with changed <code>sap.app/dataSource</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			oManifest["sap.app"].dataSources ||= {};
			const oChangeContent = oChange.getContent();

			const aDataSources = DescriptorChangeCheck.getAndCheckContentObject(oChangeContent, "dataSource", oChange.getChangeType(), MANDATORY_PROPERTIES, SUPPORTED_PROPERTIES, PROPERTIES_PATTERNS, SUPPORTED_TYPES);

			aDataSources.forEach(function(sDataSource) {
				DescriptorChangeCheck.checkIdNamespaceCompliance(sDataSource, oChange);
			});

			postChecks(oManifest["sap.app"].dataSources, oChangeContent.dataSource, aDataSources);

			Object.assign(oManifest["sap.app"].dataSources, oChangeContent.dataSource);

			return oManifest;
		}

	};

	return AddNewDataSource;
});