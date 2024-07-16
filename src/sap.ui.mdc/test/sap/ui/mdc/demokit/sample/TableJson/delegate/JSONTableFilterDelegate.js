/* eslint-disable require-await */
sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/mdc/FilterField",
    "mdc/sample/model/metadata/JSONPropertyInfo",
    "sap/ui/core/Element"
], function (
    FilterBarDelegate,
    FilterField,
    JSONPropertyInfo,
    Element
) {
	"use strict";

	const JSONTableFilterDelegate = Object.assign({}, FilterBarDelegate);

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sPropertyKey = oProperty.key;
		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyKey + '}',
			propertyKey: sPropertyKey,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		return oFilterField;
	};

	JSONTableFilterDelegate._createFilter = async function(sPropertyKey, oFilterBar, mPropertyBag) {
        const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyKey);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyKey;
		return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar));
	};

	JSONTableFilterDelegate.addItem = function(oFilterBar, sPropertyKey, mPropertyBag) {
		return Promise.resolve(this._createFilter(sPropertyKey, oFilterBar, mPropertyBag));
	};

	return JSONTableFilterDelegate;
});