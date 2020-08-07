sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate", 'sap/ui/mdc/FilterField', 'sap/ui/mdc/util/IdentifierUtil', 'sap/base/util/merge'
], function (FilterBarDelegate, FilterField, IdentifierUtil, merge) {
	"use strict";

	var UnitTestFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	UnitTestFilterBarDelegate.fetchProperties = function (oFilterBar) {
		return Promise.resolve([{name: "key1"}, {name: "key2"}]);
	};

	UnitTestFilterBarDelegate._createFilterField = function(oProperty, oFilterBar) {
		var oFilterField, sVHId = null, sFilterItemId;

		sFilterItemId = IdentifierUtil.getFilterFieldId(oFilterBar, IdentifierUtil.getPropertyKey(oProperty));

		oFilterField = new FilterField(sFilterItemId, {
			label: oProperty.label,
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

		var aValues = oProperty.filterConditions;
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
			oFilterField.setFieldHelp(IdentifierUtil.getView(oFilterBar).createId(sVHId));
		}

		var oModel = oFilterBar._getConditionModel();
		if (oModel) {
			oFilterField.setModel(oModel, oFilterBar._getConditionModelName());
		}

		return oFilterField;
	};

	UnitTestFilterBarDelegate._createFilter = function(sPropertyName, oFilterBar, mPropertyBag) {
		return this.fetchProperties(oFilterBar).then(function(aProperties) {
			var oPropertyInfo = aProperties.find(function(oCurrentProperty) {
				return ((oCurrentProperty.path === sPropertyName) || (oCurrentProperty.name === sPropertyName));
			});
			if (!oPropertyInfo) {
				return null;
			}
			return Promise.resolve(this._createFilterField(oPropertyInfo, oFilterBar, mPropertyBag));
		}.bind(this));
	};

	UnitTestFilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve(this._createFilter(sPropertyName, oFilterBar, mPropertyBag));
	};

	return UnitTestFilterBarDelegate;
});