/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/m/Slider",
	"sap/m/Token",
	"sap/m/SegmentedButtonItem",
	"../controls/CustomSegmentedButton",
	"../controls/CustomMultiInput"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, Slider, Token, SegmentedButtonItem, CustomSegmentedButton, CustomMultiInput) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sPropertyName = oProperty.key;
		let oContentEdit;

		if (sId.includes("numberWords")) {
			oContentEdit = new Slider({
				value: "{path: '$field>/conditions', type: 'sap.ui.mdc.field.ConditionsType'}",
				min: 0,
				max: 100000
			});
		} else if (sId.includes("descr")) {
			oContentEdit = new CustomMultiInput({
				value: "{path: '$field>/conditions', type: 'sap.ui.mdc.field.ConditionsType'}",
				tokens: {
					path: '$field>/conditions',
					template: new Token({
						text: "{path: '$field>', type: 'sap.ui.mdc.field.ConditionType'}",
						key: "{path: '$field>', type: 'sap.ui.mdc.field.ConditionType'}"
					})
				}
			});

		} else if (sId.includes("status")) {
			const oPlanningButton = new SegmentedButtonItem({ text: "Planning", key: "planning" });
			const oInProcessButton = new SegmentedButtonItem({ text: "In Process", key: "inProcess" });
			const oDoneButton = new SegmentedButtonItem({ text: "Done", key: "done" });

			oContentEdit = new CustomSegmentedButton({
				conditions: "{path: '$field>/conditions'}",
				items: [
					oPlanningButton,
					oInProcessButton,
					oDoneButton
				]
			});
		}

		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyName + '}',
			propertyKey: sPropertyName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
		});

		if (oContentEdit) {
			oFilterField.setContentEdit(oContentEdit);
		}

		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return await _createFilterField(sId, oProperty, oFilterBar);
	};

	return JSONFilterBarDelegate;
});