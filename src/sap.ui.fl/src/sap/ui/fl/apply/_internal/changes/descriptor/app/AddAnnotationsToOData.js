
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	DescriptorChangeCheck
) {
	"use strict";

	var SUPPORTED_INSERT_POSITION = ["BEGINNING", "END"];

	function isDataSourceIdExistingInManifest(oManifestDataSources, sDataSourceId) {
		return Object.keys(oManifestDataSources).indexOf(sDataSourceId) >= 0;
	}

	function isDataSourceTypeOData(oManifestDataSources, sDataSource) {
		return !oManifestDataSources[sDataSource].type || oManifestDataSources[sDataSource].type === "OData";
	}

	function isAnnotationExisting(oManifestDataSources, oChangeDataSource, sAnnotation) {
		return ((oManifestDataSources[sAnnotation] && oManifestDataSources[sAnnotation].type === "ODataAnnotation") || oChangeDataSource[sAnnotation]);
	}

	function isAnnotationTypeOfOdataAnnotation(oChangeDataSource, sAnnotation) {
		return oChangeDataSource[sAnnotation].type && oChangeDataSource[sAnnotation].type === "ODataAnnotation";
	}

	function isAnnotationPartOfAnnotationsArray(aChangeAnnotations, sAnnotation) {
		return aChangeAnnotations.indexOf(sAnnotation) >= 0;
	}

	function checkingDataSourceId (oManifestDataSources, sChangeDataSourceId) {
		if (sChangeDataSourceId) {
			if (Object.keys(oManifestDataSources).length > 0) {
				if (!isDataSourceIdExistingInManifest(oManifestDataSources, sChangeDataSourceId)) {
					throw new Error("There is no dataSource '" + sChangeDataSourceId + "' existing in the manifest. You can only add annotations to already existing dataSources in the manifest");
				}

				if (!isDataSourceTypeOData(oManifestDataSources, sChangeDataSourceId)) {
					throw new Error("The dataSource '" + sChangeDataSourceId + "' is existing in the manifest but is not type of 'OData'. The type of the dataSource in the manifest is '" + oManifestDataSources[sChangeDataSourceId].type + "'");
				}
			} else {
				throw new Error("There are no dataSources in the manifest at all");
			}
		} else {
			throw new Error("Invalid change format: The mandatory 'dataSourceId' is not defined. Please define the mandatory property 'dataSourceId' and refer it to an existing OData");
		}
	}

	function checkingAnnotationArray (aChangeAnnotations) {
		if (aChangeAnnotations) {
			if (aChangeAnnotations.length === 0) {
				throw new Error("Invalid change format: The 'annotations' array property is empty");
			}
		} else {
			throw new Error("Invalid change format: The mandatory 'annotations' array property is not defined. Please define the 'annotations' array property");
		}
	}

	function checkingAnnotationsInsertPosition (sChangeAnnotationsInsertPosition) {
		if (!(SUPPORTED_INSERT_POSITION.indexOf(sChangeAnnotationsInsertPosition) >= 0) && !(sChangeAnnotationsInsertPosition === undefined)) { // default is 'BEGINNING'
			throw new Error("The defined insert position '" + sChangeAnnotationsInsertPosition + "' is not supported. The supported insert positions are: " + SUPPORTED_INSERT_POSITION.join("|"));
		}
	}

	function checkingAnnotationDataSource(oChangeDataSource, aChangeAnnotations, oChange) {
		if (oChangeDataSource) {
			if (Object.keys(oChangeDataSource).length === 0) {
				throw new Error("The 'dataSource' object is empty");
			}

			Object.keys(oChangeDataSource).forEach(function(sAnnotation) {
				DescriptorChangeCheck.checkIdNamespaceCompliance(sAnnotation, oChange);

				if (!isAnnotationTypeOfOdataAnnotation(oChangeDataSource, sAnnotation)) {
					throw new Error("The dataSource annotation '" + sAnnotation + "' is type of '" + oChangeDataSource[sAnnotation].type + "'. Only dataSource annotations of type 'ODataAnnotation' is supported");
				}

				if (!isAnnotationPartOfAnnotationsArray(aChangeAnnotations, sAnnotation)) {
					throw new Error("The annotation '" + sAnnotation + "' is not part of 'annotations' array property. Please add the annotation '" + sAnnotation + "' in the 'annotations' array property");
				}
			});
		} else {
			throw new Error("Invalid change format: The mandatory 'dataSource' object is not defined. Please define the mandatory 'dataSource' object");
		}
	}

	function merge(oManifestDataSources, sChangeDataSourceId, aChangeAnnotations, sChangeAnnotationsInsertPosition, oChangeDataSource) {
		mergeAnnotationArray(oManifestDataSources[sChangeDataSourceId], aChangeAnnotations, sChangeAnnotationsInsertPosition);
		mergeAnnotationDataSources(oManifestDataSources, oChangeDataSource);
	}

	function mergeAnnotationArray(oManifestDataSourceId, aChangeAnnotations, sChangeAnnotationsInsertPosition) {
		if (!oManifestDataSourceId["settings"]) {
			oManifestDataSourceId["settings"] = {};
		}

		if (!oManifestDataSourceId["settings"].annotations) {
			oManifestDataSourceId["settings"].annotations = [];
		}

		var aNotExistingAnnotationsInChange = oManifestDataSourceId["settings"].annotations.filter(function(annotation) {
			return (aChangeAnnotations.indexOf(annotation) < 0);
		});

		oManifestDataSourceId["settings"].annotations = aNotExistingAnnotationsInChange;

		if (sChangeAnnotationsInsertPosition === "END") {
			oManifestDataSourceId["settings"].annotations = oManifestDataSourceId["settings"].annotations.concat(aChangeAnnotations);
		} else {
			oManifestDataSourceId["settings"].annotations = aChangeAnnotations.concat(oManifestDataSourceId["settings"].annotations);
		}
	}

	function mergeAnnotationDataSources(oManifestDataSources, oChangeDataSource) {
		Object.assign(oManifestDataSources, oChangeDataSource);
	}

	function postChecks (oManifestDataSources, oChangeDataSource, aChangeAnnotations) {
		// Further checks after main checks
		aChangeAnnotations.forEach(function(sAnnotation) {
			if (!isAnnotationExisting(oManifestDataSources, oChangeDataSource, sAnnotation)) {
				throw new Error("The annotation '" + sAnnotation + "' is part of 'annotations' array property but does not exists in the change property 'dataSource' and in the manifest (or it is not type of 'ODataAnnotation' in the manifest)");
			}
		});
	}

	/**
	 * Descriptor change merger for change type <code>appdescr_app_addAnnotationsToOData</code>.
	 * Adds new annotations to an existing OData data source in the manifest.json under path sap.app.dataSources.
	 *
	 * Available only for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.AddAnnotationsToOData
	 * @experimental
	 * @since 1.87
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var AddAnnotationsToOData = {

		/**
		 * Method to apply the <code>appdescr_app_addAnnotationsToOData</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {object} oChange - Change with type <code>appdescr_app_addAnnotationsToOData</code>
		 * @param {string} oChange.content.dataSourceId - ID of <code>sap.app/dataSource</code> that is being changed
		 * @param {Array<string>} oChange.content.annotations - Array of annotations in OData dataSource <code>sap.app/dataSource/settings/annotations</code> that is being changed
		 * @param {string} oChange.content.annotationsInsertPosition - Insert position operation that is performed under annotations. Allowed values: <code>BEGINNING</code> and <code>END</code> default: (<code>BEGINNING</code)
		 * @param {object} oChange.content.dataSource - New annotations of <code>sap.app/dataSource</code> which is also referenced by the existing OData <code>sap.app/dataSource/settings/annotations</code>
		 * @returns {object} Updated manifest with changed <code>sap.app/dataSource</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			var sChangeDataSourceId = oChange.getContent().dataSourceId;
			var aChangeAnnotations = oChange.getContent().annotations;
			var sChangeAnnotationsInsertPosition = oChange.getContent().annotationsInsertPosition;
			var oChangeDataSource = oChange.getContent().dataSource;

			checkingDataSourceId(oManifest["sap.app"].dataSources, sChangeDataSourceId);
			checkingAnnotationArray(aChangeAnnotations);
			checkingAnnotationsInsertPosition(sChangeAnnotationsInsertPosition);
			checkingAnnotationDataSource(oChangeDataSource, aChangeAnnotations, oChange);
			postChecks(oManifest["sap.app"]["dataSources"], oChangeDataSource, aChangeAnnotations);

			merge(oManifest["sap.app"]["dataSources"], sChangeDataSourceId, aChangeAnnotations, sChangeAnnotationsInsertPosition, oChangeDataSource);

			return oManifest;
		}

	};

	return AddAnnotationsToOData;
});