/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	CondenserClassification
) {
	"use strict";

	/**
	 * Default change handler for annotations.
	 * @alias sap.ui.fl.changeHandler.ChangeAnnotation
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.132
	 * @public
	 */
	const ChangeAnnotation = {};

	/**
	 * Returns the information that the model needs to apply the change.
	 * This does not actually apply the change.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.AnnotationChange} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @returns {object} Information for the model to apply the change
	 */
	ChangeAnnotation.applyChange = function(oChange) {
		const oContent = oChange.getContent();
		const oReturn = {
			path: oContent.annotationPath
		};

		const sValue = oChange.getText("annotationText") || oContent.value;

		const oObjectTemplateInfo = oContent.objectTemplateInfo;
		if (oObjectTemplateInfo) {
			oReturn.value = JSON.parse(oObjectTemplateInfo.templateAsString.replace(oObjectTemplateInfo.placeholder, sValue));
		} else {
			oReturn.value = sValue;
		}
		return oReturn;
	};

	/**
	 * This type of Flex change is not revertible, as the annotations are not modifiable after they are constructed.
	 */
	ChangeAnnotation.revertChange = function() {};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.AnnotationChange} oChange - Change object to be completed
	 * @param {object} oSpecificChangeInfo - Information needed to complete the change
	 * @param {string} oSpecificChangeInfo.content.annotationPath - Path of the annotation to be changed
	 * @param {string} oSpecificChangeInfo.content.value - Value of the annotation to be changed
	 * @param {string} oSpecificChangeInfo.content.text - Translatable value of the annotation. If given, the value is ignored
	 * @param {object} [oSpecificChangeInfo.content.objectTemplateInfo] - Object template to construct a return object
	 * @param {string} [oSpecificChangeInfo.content.objectTemplateInfo.templateAsString] - Stringified template to be used for constructing the return object
	 * @param {string} [oSpecificChangeInfo.content.objectTemplateInfo.placeholder] - Placeholder in the template string
	 */
	ChangeAnnotation.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		const oNewContent = {
			annotationPath: oSpecificChangeInfo.content.annotationPath
		};

		if (oSpecificChangeInfo.content.objectTemplateInfo) {
			oNewContent.objectTemplateInfo = oSpecificChangeInfo.content.objectTemplateInfo;
		}

		if (oSpecificChangeInfo.content.text) {
			oChange.setText("annotationText", oSpecificChangeInfo.content.text);
		} else {
			oNewContent.value = oSpecificChangeInfo.content.value;
		}
		oChange.setContent(oNewContent);
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.AnnotationChange} oChange - AnnotationChange instance
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @returns {object} Condenser-specific information
	 */
	ChangeAnnotation.getCondenserInfo = function(oChange, mPropertyBag) {
		return {
			affectedControl: mPropertyBag.appComponent,
			classification: CondenserClassification.LastOneWins,
			uniqueKey: `${oChange.getContent().annotationPath}_${oChange.getChangeType()}`
		};
	};

	return ChangeAnnotation;
});
