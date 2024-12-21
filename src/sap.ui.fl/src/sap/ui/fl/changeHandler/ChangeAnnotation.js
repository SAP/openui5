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
		return {
			path: oChange.getContent().annotationPath,
			value: oChange.getContent().value
		};
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
	 * @param {string} oSpecificChangeInfo.annotationPath - Path of the annotation to be changed
	 * @param {string} oSpecificChangeInfo.value - Value of the annotation to be changed
	 */
	ChangeAnnotation.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		oChange.setContent({
			annotationPath: oSpecificChangeInfo.annotationPath,
			value: oSpecificChangeInfo.value
		});
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
