
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialogController",
	"sap/ui/rta/Utils"
], function(
	ManagedObject,
	Fragment,
	PersistenceWriteAPI,
	JSONModel,
	ResourceModel,
	AnnotationChangeDialogController,
	RtaUtils
) {
	"use strict";

	/**
	 * @class Constructor for a new sap.ui.rta.plugin.annotations.AnnotationChangeDialog.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.132
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const AnnotationChangeDialog = ManagedObject.extend("sap.ui.rta.plugin.annotations.AnnotationChangeDialog");

	function replaceObjectKeysWithStrings(aDelegateProperties, aPossibleValues) {
		aPossibleValues.forEach((oPossibleValue) => {
			oPossibleValue.key = JSON.stringify(oPossibleValue.key);
		});
		aDelegateProperties.forEach((oProperty) => {
			oProperty.currentValue = JSON.stringify(oProperty.currentValue);
		});
	}

	AnnotationChangeDialog.prototype._createDialog = async function() {
		this._oController = new AnnotationChangeDialogController();
		const oDialog = await Fragment.load({
			name: "sap.ui.rta.plugin.annotations.AnnotationChangeDialog",
			controller: this._oController
		});
		oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
		this.oChangeAnnotationModel = new JSONModel();
		oDialog.setModel(this.oChangeAnnotationModel);
		const oI18nModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		oDialog.setModel(oI18nModel, "i18n");
		return oDialog;
	};

	AnnotationChangeDialog.prototype._openDialog = function() {
		this._oDialog.open();
		return this._oController.initialize();
	};

	/**
	 * Annotation change info
	 *
	 * @typedef {object} sap.ui.rta.plugin.annotations.AnnotationChangeInfo
	 * @property {string} serviceUrl - Url of the OData service
	 * @property {object[]} properties - Array of properties
	 * @property {string} properties.annotationPath - Path of the property
	 * @property {string} properties.propertyName - Name of the property
	 * @property {string} properties.currentValue - Current value of the property
	 * @property {object[]} possibleValues - Array of possible values for value list type properties
	 * @property {string} possibleValues.key - Key of the option
	 * @property {string} possibleValues.text - Text of the option
	 * @property {string} [preSelectedProperty] - Name of the property that should be filtered for initially
	 * @public
	 */

	/**
	 * @callback  sap.ui.rta.plugin.annotations.getAnnotationChangeInfo
	 * @property {sap.ui.core.Control} oControl - Control for which the annotation change is made
	 * @property {string} sAnnotation - Annotation name
	 * @returns {sap.ui.rta.plugin.annotations.AnnotationChangeInfo} - Annotation change info
	 * @public
	 */

	/**
	 * Annotation change definition
	 *
	 * @typedef {object} sap.ui.rta.plugin.annotations.AnnotationChangeDefinition
	 * @property {string} annotationChangeType - Change type
	 * @property {object} content - Change content
	 * @property {string} content.annotationPath - Path of the property
	 * @property {string} content.value - New value
	 * @property {string} serviceUrl - Url of the OData service
	 * @public
	 */

	/**
	 * Opens the annotation change dialog and returns the changes made by the user.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.title - Title of the dialog
	 * @param {string} mPropertyBag.type - Value type of the annotation, see {@link sap.ui.rta.plugin.annotations.AnnotationTypes}
	 * @param {object} mPropertyBag.delegate - Annotation change info provider delegate
	 * @param {sap.ui.rta.plugin.annotations.getAnnotationChangeInfo} mPropertyBag.delegate.getAnnotationsChangeInfo - Delegate function to get annotation change info
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the annotation change is made
	 * @param {string} mPropertyBag.annotation - Annotation name
	 * @param {string} [mPropertyBag.description] - Description of the dialog
	 * @returns {Promise<sap.ui.rta.plugin.annotations.AnnotationChangeDefinition[]>} - Array of changes made by the user
	 */
	AnnotationChangeDialog.prototype.openDialogAndHandleChanges = async function(mPropertyBag) {
		const {
			title: sAnnotationTitle,
			type: sAnnotationValueType,
			delegate: oDelegate,
			control: oControl,
			annotation: sAnnotation,
			description: sAnnotationDescription = ""
		} = mPropertyBag;
		const {
			serviceUrl: sServiceUrl,
			properties: aDelegateProperties,
			possibleValues: aPossibleValues,
			preSelectedProperty: sPreSelectedPropertyKey
		} = await oDelegate.getAnnotationsChangeInfo(oControl, sAnnotation);

		// the key could be an object which does not work as property for the Select control
		// therefore the key must be stringified and later parsed
		const bObjectAsKey = !!aPossibleValues?.some((oPossibleValue) => typeof oPossibleValue.key === "object");
		if (bObjectAsKey) {
			replaceObjectKeysWithStrings(aDelegateProperties, aPossibleValues);
		}

		const aProperties = aDelegateProperties.map((oProperty) => ({
			...oProperty,
			originalValue: oProperty.currentValue
		}));

		aProperties.sort((oProperty1, oProperty2) => oProperty1.propertyName.localeCompare(oProperty2.propertyName));

		const aExistingChanges = PersistenceWriteAPI._getAnnotationChanges({
			control: oControl
		});
		const aChangedAnnotations = aExistingChanges
		.map((oChange) => {
			return oChange.getContent().annotationPath;
		});

		this._oDialog ||= await this._createDialog();

		const sFilterText = sPreSelectedPropertyKey
			? aProperties.find((oProperty) => oProperty.annotationPath === sPreSelectedPropertyKey).propertyName
			: "";
		this.oChangeAnnotationModel.setData({
			objectAsKey: bObjectAsKey,
			title: sAnnotationTitle,
			description: sAnnotationDescription,
			properties: aProperties, // all properties
			changedProperties: aProperties.filter(({ annotationPath }) => aChangedAnnotations.includes(annotationPath)),
			propertiesToDisplay: aProperties, // switches dynamically between all properties and changed properties
			showChangedPropertiesOnly: false,
			filterText: sFilterText,
			possibleValues: aPossibleValues,
			valueType: sAnnotationValueType,
			serviceUrl: sServiceUrl
		});
		if (sFilterText) {
			this._oController.filterProperties(sFilterText);
		}
		// Ensure that the model is fully refreshed before opening the dialog
		this.oChangeAnnotationModel.refresh(true);
		const aChangedProperties = await this._openDialog();
		this._oDialog.close();
		return aChangedProperties;
	};

	AnnotationChangeDialog.prototype.destroy = function(...aArgs) {
		ManagedObject.prototype.destroy.apply(this, aArgs);
		if (this._oDialog) {
			this._oDialog.destroy();
		}
		if (this._oController) {
			this._oController.destroy();
		}
	};

	return AnnotationChangeDialog;
});