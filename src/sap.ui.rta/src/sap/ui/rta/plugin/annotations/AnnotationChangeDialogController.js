
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/Input",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/layout/form/FormElement",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/annotations/AnnotationTypes"
], function(
	Input,
	Select,
	Switch,
	Controller,
	Element,
	Item,
	FormElement,
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

	AnnotationChangeDialogController.prototype.switchDisplayMode = function(oEvent) {
		const bShowChangedPropertiesOnly = oEvent.getParameter("state");
		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		oList.getModel().setProperty("/showChangedPropertiesOnly", bShowChangedPropertiesOnly);
		oList.getModel().setProperty(
			"/propertiesToDisplay",
			bShowChangedPropertiesOnly
				? oList.getModel().getProperty("/changedProperties")
				: oList.getModel().getProperty("/properties")
		);
	};

	AnnotationChangeDialogController.prototype.onSavePress = function(oEvent) {
		const oModelData = oEvent.getSource().getModel().getData();
		const aChanges = oModelData.properties
		.map((oProperty) => {
			if (oProperty.originalValue === oProperty.currentValue) {
				return null;
			}
			const oChangeSpecificData = {
				serviceUrl: oModelData.serviceUrl,
				content: {
					annotationPath: oProperty.annotationPath
				}
			};
			oChangeSpecificData.content[oModelData.valueType === AnnotationTypes.StringType ? "text" : "value"] = oProperty.currentValue;
			return oChangeSpecificData;
		})
		.filter(Boolean);
		this._fnResolveAfterClose(aChanges);
	};

	AnnotationChangeDialogController.prototype.onCancelPress = function() {
		this._fnResolveAfterClose([]);
	};

	function createEditorField(sValueType) {
		const onChange = () => {
			// Property updates are handled via two-way binding
			// However, the binding of the save button doesn't detect changes
			// within nested object properties, so it has to be refreshed explicitly
			const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
			oSaveButton.getBinding("enabled").refresh(true);
		};

		if (sValueType === AnnotationTypes.ValueListType) {
			const oSelect = new Select({
				selectedKey: "{currentValue}",
				change: onChange
			});

			const oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			oSelect.bindItems({
				path: "/possibleValues",
				template: oItemTemplate,
				templateShareable: false
			});

			return oSelect;
		}

		if (sValueType === AnnotationTypes.StringType) {
			return new Input({
				value: "{currentValue}",
				change: onChange
			});
		}

		if (sValueType === AnnotationTypes.BooleanType) {
			return new Switch({
				state: "{currentValue}",
				change: onChange
			});
		}

		throw new Error(`Unsupported value type: ${sValueType}`);
	}

	AnnotationChangeDialogController.prototype.editorFactory = function(sId, oContext) {
		const sValueType = oContext.getProperty("/valueType");

		return new FormElement({
			id: sId,
			label: "{propertyName}",
			fields: [
				createEditorField.call(this, sValueType)
			]
		});
	};

	AnnotationChangeDialogController.prototype.hasChangesFormatter = function(aProperties) {
		return aProperties?.some((oProperty) => oProperty.originalValue !== oProperty.currentValue);
	};

	return AnnotationChangeDialogController;
});