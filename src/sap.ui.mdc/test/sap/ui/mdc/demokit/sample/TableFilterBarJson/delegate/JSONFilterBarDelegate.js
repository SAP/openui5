sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONBaseDelegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment",
	"sap/ui/core/Element"
], function(FilterBarDelegate, JSONPropertyInfo, JSONBaseDelegate, FilterField, Core, Fragment, Element) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate);

	JSONFilterBarDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo);
	};

	JSONFilterBarDelegate.addItem = function(oFilterBar, sPropertyName) {
		const oProperty = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return _addFilterField(oProperty, oFilterBar);
	};

	JSONFilterBarDelegate.removeItem = function(oFilterBar, oFilterField) {
		oFilterField.destroy();
		return Promise.resolve(true);
	};

	function _addFilterField(oProperty, oFilterBar) {
		const sName = oProperty.name;
		const sFilterFieldId = oFilterBar.getId() + "--filter--" + sName;
		let oFilterField = Element.registry.get(sFilterFieldId);
		let pFilterField;

		if (oFilterField) {
			pFilterField = Promise.resolve(oFilterField);
		} else {
			oFilterField = new FilterField(sFilterFieldId, {
				dataType: oProperty.dataType,
				conditions: "{$filters>/conditions/" + sName + '}',
				propertyKey: sName,
				required: oProperty.required,
				label: oProperty.label,
				maxConditions: oProperty.maxConditions,
				delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
			});

			if (oFilterBar.getPayload().valueHelp[sName]) {
				pFilterField = _addValueHelp(oFilterBar, oFilterField, sName);
			} else {
				pFilterField = Promise.resolve(oFilterField);
			}
		}
		return pFilterField;
	}

	function _addValueHelp(oFilterBar, oFilterField, sName) {
		const oValueHelp = oFilterBar.getDependents().find((oD) => oD.getId().includes(sName));
		let pFieldWithVH;

		if (oValueHelp) {
			oFilterField.setValueHelp(oValueHelp);
			pFieldWithVH = Promise.resolve(oFilterField);
		} else {
			const sPath = "mdc.sample.view.fragment.";
			pFieldWithVH = Fragment.load({
				name: sPath + oFilterBar.getPayload().valueHelp[sName]
			}).then(function(oValueHelp) {
				oFilterBar.addDependent(oValueHelp);
				oFilterField.setValueHelp(oValueHelp);
				return oFilterField;
			});
		}

		return pFieldWithVH;
	}

	return JSONFilterBarDelegate;
}, /* bExport= */false);