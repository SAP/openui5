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
		TextOnly: "TextOnly",
		TextFirst: "TextFirst",
		IDOnly: "IDOnly",
		IDFirst: "IDFirst"
	};

	const oTextArrangementLabels = {
		[oTextArrangementTypes.TextOnly]: "Text Only",
		[oTextArrangementTypes.TextFirst]: "Text First",
		[oTextArrangementTypes.IDOnly]: "ID Only",
		[oTextArrangementTypes.IDFirst]: "ID First"
	};

	const oTestDelegate = {
		getAnnotationsChangeInfo: () => {
			return {
				serviceUrl: "testServiceUrl",
				properties: [
					{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: oTextArrangementTypes.TextOnly
					},
					{
						propertyName: "My Other Test Label",
						annotationPath: "path/to/second/test/label",
						currentValue: oTextArrangementTypes.IDFirst
					}
				],
				possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
					key: sKey,
					text: oTextArrangementLabels[sKey]
				}))
			};
		}
	};

	return {
		actions: {
			annotation: {
				textArrangement: {
					changeType: "textArrangement_Test",
					title: () => "Change Text Arrangement",
					type: AnnotationTypes.ValueListType,
					delegate: oTestDelegate

				},
				potatoChange: {
					changeType: "anotherChange_Test",
					title: () => "Another Annotation Action",
					icon: "sap-icon://endoscopy",
					type: AnnotationTypes.ValueListType,
					delegate: oTestDelegate
				}
			}
		}
	};
});