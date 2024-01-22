/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Fragment"
], function (Element, FilterBarDelegate, JSONPropertyInfo, FilterField, Fragment) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sPropertyName = oProperty.key;
		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyName + '}',
			propertyKey: sPropertyName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar));
	};

	JSONFilterBarDelegate.removeItem = async (oFilterBar, oFilterField) => {
		oFilterField.destroy();
		return true; // allow default handling
	};

	return JSONFilterBarDelegate;
}, /* bExport= */false);