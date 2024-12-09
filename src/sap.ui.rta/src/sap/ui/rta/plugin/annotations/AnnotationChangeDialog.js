
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialogController"
], function(
	ManagedObject,
	Fragment,
	FlexRuntimeInfoAPI,
	PersistenceWriteAPI,
	JSONModel,
	ResourceModel,
	AnnotationChangeDialogController
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

	AnnotationChangeDialog.prototype._createDialog = async function() {
		this._oController = new AnnotationChangeDialogController();
		const oPopover = await Fragment.load({
			name: "sap.ui.rta.plugin.annotations.AnnotationChangeDialog",
			controller: this._oController
		});
		this.oChangeAnnotationModel = new JSONModel();
		oPopover.setModel(this.oChangeAnnotationModel);
		const oI18nModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		oPopover.setModel(oI18nModel, "i18n");
		return oPopover;
	};

	AnnotationChangeDialog.prototype._openDialog = function() {
		this._oPopover.open();
		return this._oController.initialize();
	};

	/**
	 * Annotation change info
	 *
	 * @typedef {object} sap.ui.rta.plugin.annotations.AnnotationChangeInfo
	 * @property {string} serviceUrl - Url of the OData service
	 * @property {object[]} properties - Array of properties
	 * @property {string} properties.path - Path of the property
	 * @property {string} properties.propertyName - Name of the property
	 * @property {string} properties.currentValue - Current value of the property
	 * @property {object[]} possibleValues - Array of possible values for value list type properties
	 * @property {string} possibleValues.key - Key of the option
	 * @property {string} possibleValues.text - Text of the option
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * @callback  sap.ui.rta.plugin.annotations.getAnnotationChangeInfo
	 * @property {sap.ui.core.Control} oControl - Control for which the annotation change is made
	 * @property {string} sAnnotation - Annotation name
	 * @returns {sap.ui.rta.plugin.annotations.AnnotationChangeInfo} - Annotation change info
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Annotation change definition
	 *
	 * @typedef {object} sap.ui.rta.plugin.annotations.AnnotationChangeDefinition
	 * @property {string} annotationChangeType - Change type
	 * @property {object} content - Change content
	 * @property {string} content.propertyPath - Path of the property
	 * @property {string} content.value - New value
	 * @property {string} serviceUrl - Url of the OData service
	 * @private
	 * @ui5-restricted
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
			properties: aProperties,
			possibleValues: aPossibleValues,
			preSelectedProperty: sPreSelectedPropertyKey
		} = oDelegate.getAnnotationsChangeInfo(oControl, sAnnotation);

		const aExistingChanges = PersistenceWriteAPI._getAnnotationChanges({
			control: oControl
		});
		const aChangedAnnotations = aExistingChanges
		.map((oChange) => {
			return oChange.getContent().propertyPath;
		});

		this._oPopover ||= await this._createDialog();

		const oOriginalProperties = {};
		aProperties.forEach(({ path, currentValue }) => {
			oOriginalProperties[path] = currentValue;
		});

		const sFilterText = sPreSelectedPropertyKey
			? aProperties.find((oProperty) => oProperty.path === sPreSelectedPropertyKey).propertyName
			: "";
		this.oChangeAnnotationModel.setData({
			title: sAnnotationTitle,
			description: sAnnotationDescription,
			properties: aProperties, // all properties
			changedProperties: aProperties.filter(({ path }) => aChangedAnnotations.includes(path)),
			propertiesToDisplay: aProperties, // switches dynamcially between all properties and changed properties
			showChangedPropertiesOnly: false,
			filterText: sFilterText,
			possibleValues: aPossibleValues,
			valueType: sAnnotationValueType
		});
		if (sFilterText) {
			this._oController.filterProperties(sFilterText);
		}
		const oChangedProperties = await this._openDialog();
		this._oPopover.close();
		return Object.entries(oChangedProperties).map(([sPath, vNewValue]) => {
			if (oOriginalProperties[sPath] === vNewValue) {
				return null;
			}
			return {
				annotationChangeType: "changeAnnotation",
				content: {
					propertyPath: sPath,
					value: vNewValue
				},
				serviceUrl: sServiceUrl
			};
		}).filter(Boolean);
	};

	AnnotationChangeDialog.prototype.destroy = function(...aArgs) {
		ManagedObject.prototype.destroy.apply(this, aArgs);
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		if (this._oController) {
			this._oController.destroy();
		}
	};

	return AnnotationChangeDialog;
});