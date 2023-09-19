/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/json/FilterBarDelegate",
	'sap/ui/mdc/util/IdentifierUtil',
	'sap/ui/mdc/DefaultTypeMap',
	'sap/ui/model/type/Boolean',
	'sap/ui/model/type/String',
	'sap/ui/model/type/Integer',
	'sap/ui/model/type/Date',
	'sap/ui/model/type/DateTime',
	'sap/ui/model/type/Time',
	'sap/ui/model/type/Float'
], function (FilterBarDelegate, IdentifierUtil, DefaultTypeMap, BooleanType, StringType, IntegerType, DateType, DateTimeType, TimeType, FloatType) {
	"use strict";

	const FilterBarTestDelegate = Object.assign({}, FilterBarDelegate);
	FilterBarTestDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	FilterBarTestDelegate.fetchProperties = function (oFilterBar) {
		const aProperties = [];

		aProperties.push({
			name: "prop1",
			label: "Boolean",
			required: false,
			dataType : 'sap.ui.model.type.Boolean',
			maxConditions: 1
		});

		aProperties.push({
			name: "prop2",
			label: "String single",
			required: true,
			dataType : 'sap.ui.model.type.String',
			maxConditions: 1
			//,display: "Description"
		});

		aProperties.push({
			name: "prop3",
			label: "String multi",
			required: false,
			dataType : 'sap.ui.model.type.String',
			maxConditions: -1
		});

		aProperties.push({
			name: "prop4",
			label: "Integer",
			required: false,
			dataType : 'sap.ui.model.type.Integer'
		});

		aProperties.push({
			name: "prop5",
			label: "Date",
			required: false,
			dataType : 'sap.ui.model.type.Date'
		});

		aProperties.push({
			name: "prop6",
			label: "DateTime",
			required: false,
			dataType : 'sap.ui.model.type.DateTime'
		});

		aProperties.push({
			name: "prop7",
			label: "Time",
			required: false,
			dataType : 'sap.ui.model.type.Time'
		});

		aProperties.push({
			name: "prop8",
			label: "Float",
			required: false,
			dataType : 'sap.ui.model.type.Float'
		});

		return Promise.resolve(aProperties);
	};


	FilterBarTestDelegate.addItem = function(oFilterBar, sPropertyName, mPropertyBag) {

		return FilterBarTestDelegate.fetchProperties(oFilterBar).then(function(aProperties) {

			let oProperty = null;
			aProperties.some(function(oPropertyInfo) {
				if (sPropertyName === IdentifierUtil.getPropertyKey(oPropertyInfo)) {
					oProperty = oPropertyInfo;
				}

				return oProperty !== null;
			});

			if (oProperty) {
				return FilterBarTestDelegate._createFilterField(oFilterBar, oProperty, mPropertyBag);
			}
		});
	};

	return FilterBarTestDelegate;
});
