
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/annotations/AnnotationTypes"
], function(
	Controller,
	Element,
	Filter,
	FilterOperator,
	AnnotationTypes
) {
	"use strict";

	/**
	 * @class Controller for the AnnotationChangeDialog.
	 * @extends sap.ui.core.mvc.Controller
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.132
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const AnnotationChangeDialogController = Controller.extend("sap.ui.rta.plugin.annotations.AnnotationChangeDialogController");

	AnnotationChangeDialogController.prototype.initialize = function() {
		this._oChangedProperties = {};
		return new Promise((resolve) => {
			this._fnResolveAfterClose = resolve;
		});
	};

	AnnotationChangeDialogController.prototype.filterProperties = function(sQuery) {
		const aFilters = [];
		if (sQuery && sQuery.length > 0) {
			const filter = new Filter("propertyName", FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}

		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const oBinding = oList.getBinding("formElements");
		oBinding.filter(aFilters);
	};

	AnnotationChangeDialogController.prototype.onFilterProperties = function(oEvent) {
		const sQuery = oEvent.getSource().getValue();
		this.filterProperties(sQuery);
	};

	AnnotationChangeDialogController.prototype.switchDisplayMode = function() {
		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const bShowChangedPropertiesOnly = !oList.getModel().getProperty("/showChangedPropertiesOnly");
		oList.getModel().setProperty("/showChangedPropertiesOnly", bShowChangedPropertiesOnly);
		oList.getModel().setProperty(
			"/propertiesToDisplay",
			bShowChangedPropertiesOnly
				? oList.getModel().getProperty("/changedProperties")
				: oList.getModel().getProperty("/properties")
		);
	};

	AnnotationChangeDialogController.prototype.onValueListChange = function(oEvent) {
		const sPath = oEvent.getSource().getBindingContext().getObject().annotationPath;
		const sSelectedKey = oEvent.getParameters().selectedItem.getKey();
		this._oChangedProperties[sPath] = sSelectedKey;
	};

	AnnotationChangeDialogController.prototype.onBooleanChange = function(oEvent) {
		const sPath = oEvent.getSource().getBindingContext().getObject().annotationPath;
		const bSelected = oEvent.getParameters().selected;
		this._oChangedProperties[sPath] = bSelected;
	};

	AnnotationChangeDialogController.prototype.onStringChange = function(oEvent) {
		const sPath = oEvent.getSource().getBindingContext().getObject().annotationPath;
		const sValue = oEvent.getParameters().value;
		this._oChangedProperties[sPath] = sValue;
	};

	AnnotationChangeDialogController.prototype.onSavePress = function() {
		this._fnResolveAfterClose(this._oChangedProperties);
	};

	AnnotationChangeDialogController.prototype.onCancelPress = function() {
		this._fnResolveAfterClose({});
	};

	AnnotationChangeDialogController.prototype.formatters = {
		isValueList(sType) {
			return sType === AnnotationTypes.ValueListType;
		},
		isBoolean(sType) {
			return sType === AnnotationTypes.BooleanType;
		},
		isString(sType) {
			return sType === AnnotationTypes.StringType;
		}
	};

	return AnnotationChangeDialogController;
});