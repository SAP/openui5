/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONTableFilterDelegate"
], function (
	TableDelegate,
	Column,
	Text,
	JSONPropertyInfo,
	JSONTableFilterDelegate
) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.key !== "$search");

	JSONTableDelegate.getFilterDelegate = () => JSONTableFilterDelegate;

	const _createColumn = (sId, oPropertyInfo) => {
		return new Column(sId, {
			propertyKey: oPropertyInfo.key,
			header: oPropertyInfo.label,
			template: new Text({
				text: {
					path: "mountains>" + oPropertyInfo.path,
					type: oPropertyInfo.dataType
				}
			})
		});
	};

	JSONTableDelegate.addItem = async (oTable, sPropertyKey) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyKey);
		const sId = oTable.getId() + "---col-" + sPropertyKey;
		return await _createColumn(sId, oPropertyInfo);
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	return JSONTableDelegate;
});