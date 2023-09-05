sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONBaseDelegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment"
], function (FilterBarDelegate, JSONPropertyInfo, JSONBaseDelegate, FilterField, Core, Fragment) {
	"use strict";

	var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate);

	JSONFilterBarDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo);
	};

	JSONFilterBarDelegate.addItem = function(oFilterBar, sPropertyName) {
		var oProperty = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return _addFilterField(oProperty, oFilterBar);
	};

	JSONFilterBarDelegate.removeItem = function(oFilterBar, oFilterField) {
		oFilterField.destroy();
		return Promise.resolve(true);
	};

	function _addFilterField(oProperty, oFilterBar) {
		var sName = oProperty.name;
		var sFilterFieldId = oFilterBar.getId() + "--filter--" + sName;
		var oFilterField = Core.byId(sFilterFieldId);
		var pFilterField;

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

			if (sName === "name" || sName === "range") {
				pFilterField = _addValueHelp(oFilterBar, oFilterField, sName);
			} else {
				pFilterField = Promise.resolve(oFilterField);
			}
		}
		return pFilterField;
	}

	function _addValueHelp(oFilterBar, oFilterField, sName) {
		var oValueHelp = oFilterBar.getDependents().find((oD) => oD.getId().includes(sName));
		var pFieldWithVH;

		if (oValueHelp) {
			oFilterField.setValueHelp(oValueHelp);
			pFieldWithVH = Promise.resolve(oFilterField);
		} else {
			var sPath = "mdc.sample.view.fragment.";
			pFieldWithVH = Fragment.load({
				name: sPath + (sName.charAt(0).toUpperCase() + sName.slice(1)) + "ValueHelp"
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