sap.ui.define([
	"delegates/odata/v4/TableDelegate"
], function (TableDelegate) {
	"use strict";

	var oCustomDelegate = Object.assign({}, TableDelegate);

	oCustomDelegate.fetchProperties = function(oTable) {
		return TableDelegate.fetchProperties(oTable).then(function(aProperties) {

			aProperties.forEach(function(oProperty){
				oProperty.groupable = true;

				if (oProperty.name == "cityOfOrigin_city"){
					oProperty.label = "City of Origin";
				}
			});

			aProperties.push({
				name: "created_complex",
				label: "Created (Complex)",
				propertyInfos: ["createdAt", "createdBy"]
			});

			if (oTable.data){
				oTable.data("$tablePropertyInfo", aProperties);
			}

			return aProperties;
		});
	};

	oCustomDelegate.addItem = function(sPropertyInfoName, oTable, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sId = mPropertyBag.id + "--" + sPropertyInfoName;

		var aInfo = oTable.data("$tablePropertyInfo");

		var aFoundValue = [];
		if (aInfo){
			aFoundValue = aInfo.find(function(oProp){
				return oProp.name == sPropertyInfoName;
			});
		}

		var sLabel = aFoundValue && aFoundValue.length > 0 ? aFoundValue[0].label : sPropertyInfoName;
		var oTemplate;

		if (oTable.isA === undefined) {
			return oModifier.createControl("sap.m.Text", mPropertyBag.appComponent, mPropertyBag.view, sId + "--text--" + sPropertyInfoName,{
				text: "{" + sPropertyInfoName + "}"
			}).then(function(oCreatedTemplate){
				oTemplate = oCreatedTemplate;
				return oModifier.createControl("sap.ui.mdc.table.Column", mPropertyBag.appComponent, mPropertyBag.view, sId, {
					dataProperty: sPropertyInfoName,
					width: "150px",
					header: sLabel
				});
			}).then(function(oColumn) {
				oColumn.appendChild(oTemplate);
				return oColumn;
			});
		} else {
			return TableDelegate.addItem.apply(this, arguments);
		}
	};

	return oCustomDelegate;

});
