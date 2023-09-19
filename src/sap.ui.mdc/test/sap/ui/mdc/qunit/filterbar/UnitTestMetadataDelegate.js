sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate", 'sap/ui/mdc/FilterField', 'sap/ui/mdc/util/IdentifierUtil', 'sap/base/util/merge'
], function (FilterBarDelegate, FilterField, IdentifierUtil, merge) {
	"use strict";

	const UnitTestFilterBarDelegate = Object.assign({}, FilterBarDelegate);
	UnitTestFilterBarDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	UnitTestFilterBarDelegate.fetchProperties = function (oFilterBar) {
		return Promise.resolve([{name: "key1", label:"key1", dataType:"Edm.String"}, {name: "key2", label:"Key2",dataType:"Edm.String"}]);
	};

	UnitTestFilterBarDelegate._createFilterField = function(oProperty, oFilterBar) {
		let sVHId = null;

		const sFilterItemId = IdentifierUtil.getFilterFieldId(oFilterBar, IdentifierUtil.getPropertyKey(oProperty));

		const oFilterField = new FilterField(sFilterItemId, {
			label: oProperty.label,
			propertyKey: IdentifierUtil.getPropertyKey(oProperty),
			dataType: oProperty.type,
			dataTypeConstraints: merge({}, oProperty.constraints),
			dataTypeFormatOptions: merge({}, oProperty.formatOptions),
			maxConditions: oProperty.maxConditions,
			required: oProperty.required,
			visible: true //oProperty.visible
		});

		oFilterField.bindProperty("conditions", {
			path: oFilterBar._getConditionModelName() + ">/conditions/" + IdentifierUtil.getPropertyKey(oProperty)
		}, true);

		const aValues = oProperty.filterConditions;
		if (aValues && (aValues.length > 0)) {
			oFilterField.setConditions(aValues);
		}

		if (oProperty.filterOperators) {
			oFilterField.setProperty("operators", oProperty.filterOperators);
		}

		if (oProperty.tooltip) {
			oFilterField.setTooltip(oProperty.tooltip);
		}

		sVHId  = oProperty.fieldHelp;
		if (sVHId) {
			oFilterField.setValueHelp(IdentifierUtil.getView(oFilterBar).createId(sVHId));
		}

		const oModel = oFilterBar._getConditionModel();
		if (oModel) {
			oFilterField.setModel(oModel, oFilterBar._getConditionModelName());
		}

		return oFilterField;
	};

	UnitTestFilterBarDelegate._createFilter = function(sPropertyName, oFilterBar, mPropertyBag) {
		return this.fetchProperties(oFilterBar).then(function(aProperties) {
			const oPropertyInfo = aProperties.find(function(oCurrentProperty) {
				return ((oCurrentProperty.path === sPropertyName) || (oCurrentProperty.name === sPropertyName));
			});
			if (!oPropertyInfo) {
				return null;
			}
			return Promise.resolve(this._createFilterField(oPropertyInfo, oFilterBar, mPropertyBag));
		}.bind(this));
	};

	UnitTestFilterBarDelegate.addItem = function(oFilterBar, sPropertyName, mPropertyBag) {
		return Promise.resolve(this._createFilter(sPropertyName, oFilterBar, mPropertyBag));
	};

	return UnitTestFilterBarDelegate;
});