sap.ui.define([
	"delegates/odata/v4/TableDelegate"
], function (TableDelegate) {
	"use strict";

	var oCustomDelegate = Object.assign({}, TableDelegate);

	oCustomDelegate.fetchProperties = function(oTable) {
		return TableDelegate.fetchProperties(oTable).then(function(aProperties) {
			aProperties.push({
				name: "created_complex",
				label: "Created (Complex)",
				propertyInfos: ["createdAt", "createdBy"]
			});
			return aProperties;
		});
	};

	oCustomDelegate.addItem = function(sPropertyInfoName, oTable, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sId = mPropertyBag.id + "--" + sPropertyInfoName;

		if (oTable.isA === undefined) {

			return oModifier.createControl("sap.m.Text", mPropertyBag.appComponent, mPropertyBag.view, sId + "--text--" + sPropertyInfoName,{
				text: "{" + sPropertyInfoName + "}"
			}, true).then(function(oTemplate){
				var oColumn = oModifier.createControl("sap.ui.mdc.table.Column", mPropertyBag.appComponent, mPropertyBag.view, sId, {
					dataProperty: sPropertyInfoName,
					width:"150px",
					header: sPropertyInfoName
				});
				oColumn.appendChild(oTemplate);
				return oColumn;
			});
		} else {
			return this._createColumn(sPropertyInfoName, oTable);
		}

	};

	return oCustomDelegate;

});
