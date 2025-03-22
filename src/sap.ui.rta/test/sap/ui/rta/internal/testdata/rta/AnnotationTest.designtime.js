/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for an sap.m.Button control instance with annotation actions.
sap.ui.define([
	"sap/ui/rta/plugin/annotations/AnnotationTypes"
], function(
	AnnotationTypes
) {
	"use strict";

	const oTextArrangementTypes = {
		TextOnly: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"},
		TextFirst: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"},
		IDOnly: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDOnly"},
		IDFirst: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDFirst"}
	};

	const oTextArrangementLabels = {
		TextOnly: "Text Only",
		TextFirst: "Text First",
		IDOnly: "ID Only",
		IDFirst: "ID First"
	};

	function createDelegate(bSingleAction) {
		return {
			getAnnotationsChangeInfo: () => {
				return {
					serviceUrl: "testServiceUrl",
					properties: [
						{
							propertyName: "TechnicalName",
							annotationPath: "path/to/test/label",
							currentValue: oTextArrangementTypes.TextOnly,
							tooltip: "My Test Tooltip"
						},
						{
							propertyName: "MyOtherTechnicalName",
							annotationPath: "path/to/second/test/label",
							currentValue: oTextArrangementTypes.IDFirst,
							label: "My Other Test Label",
							tooltip: "My Other Test Tooltip"
						}
					],
					preSelectedProperty: bSingleAction && "path/to/test/label",
					possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
						key: oTextArrangementTypes[sKey],
						text: oTextArrangementLabels[sKey]
					}))
				};
			}
		};
	}

	return {
		actions: {
			annotation: {
				textArrangement: {
					changeType: "textArrangement_Test",
					title: () => "Change Text Arrangement",
					type: AnnotationTypes.ValueListType,
					delegate: createDelegate()
				},
				label: {
					changeType: "labelChange_Test",
					title: () => "Change Label",
					type: AnnotationTypes.StringType,
					delegate: createDelegate()
				},
				textArrangementSingle: {
					changeType: "textArrangement_Test",
					title: () => "Change Text Arrangement - Single",
					type: AnnotationTypes.ValueListType,
					delegate: createDelegate(true)
				},
				labelSingle: {
					changeType: "anotherChange_Test",
					title: () => "Change Label - Single",
					icon: "sap-icon://endoscopy",
					type: AnnotationTypes.StringType,
					delegate: createDelegate(true),
					controlBasedRenameChangeType: "rename",
					singleRename: true
				}
			}
		}
	};
});