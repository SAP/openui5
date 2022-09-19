/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/json/FilterBarDelegate", 'sap/ui/mdc/util/IdentifierUtil', 'sap/ui/mdc/util/TypeUtil'
], function (FilterBarDelegate, IdentifierUtil, TypeUtil) {
	"use strict";

	var FilterBarTestDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarTestDelegate.fetchProperties = function (oFilterBar) {
		var sType, aProperties = [];

		sType = 'sap.ui.model.type.Boolean';
		aProperties.push({
			name: "prop1",
			label: "Boolean",
			required: false,
			dataType : sType,
			maxConditions: 1,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, null)
			}
		});

		sType = 'sap.ui.model.type.String';
		aProperties.push({
			name: "prop2",
			label: "String single",
			required: true,
			dataType : sType,
			maxConditions: 1,
			display: "Description",
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, { maxLength: 3})
			}
		});

		sType = 'sap.ui.model.type.String';
		aProperties.push({
			name: "prop3",
			label: "String multi",
			required: false,
			dataType : sType,
			maxConditions: -1,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, null)
			}
		});

		sType = 'sap.ui.model.type.Integer';
		aProperties.push({
			name: "prop4",
			label: "Integer",
			required: false,
			dataType : sType,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, null)
			}
		});

		sType = 'sap.ui.model.type.Date';
		aProperties.push({
			name: "prop5",
			label: "Date",
			required: false,
			dataType : sType,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, null)
			}
		});

		sType = 'sap.ui.model.type.DateTime';
		aProperties.push({
			name: "prop6",
			label: "DateTime",
			required: false,
			dataType : sType,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, {precision: 7})
			}
		});

		sType = 'sap.ui.model.type.Time';
		aProperties.push({
			name: "prop7",
			label: "Time",
			required: false,
			dataType : sType,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, null)
			}
		});

		sType = 'sap.ui.model.type.Float';
		aProperties.push({
			name: "prop8",
			label: "Float",
			required: false,
			dataType : sType,
			typeConfig : {
				className : sType,
				typeInstance :	TypeUtil._normalizeType(sType, null, { precision : 5, scale : 2})
			}
		});

		return Promise.resolve(aProperties);
	};


	FilterBarTestDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {

		return FilterBarTestDelegate.fetchProperties(oFilterBar).then(function(aProperties) {

			var oProperty = null;
			aProperties.some(function(oPropertyInfo) {
				if (sPropertyName === IdentifierUtil.getPropertyKey(oPropertyInfo)) {
					oProperty = oPropertyInfo;
				}

				return oProperty !== null;
			});

			if (oProperty) {
				return FilterBarTestDelegate._createFilterField(oProperty, oFilterBar, mPropertyBag);
			}
		});
	};

	return FilterBarTestDelegate;
});
