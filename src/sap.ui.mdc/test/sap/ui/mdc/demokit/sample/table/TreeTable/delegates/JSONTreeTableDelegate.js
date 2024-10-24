/* eslint-disable require-await */
sap.ui.define([
	"mdc/sample/delegate/JSONTableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"mdc/sample/model/metadata/JSONPropertyInfo"
], function (
	JSONTableDelegate,
	Column,
	Text,
	JSONPropertyInfo
) {
	"use strict";

	const JSONTreeTableDelegate = Object.assign({}, JSONTableDelegate);

	const _createColumn = (sId, oPropertyInfo) => {
		let oTextBindingInfo = {
			path: "clothing>" + oPropertyInfo.path,
			type: oPropertyInfo.dataType
		};

		if (oPropertyInfo.key === "price") {
			oTextBindingInfo = {
				parts: ['clothing>amount', 'clothing>currency'],
				type: 'sap.ui.model.type.Currency'
			};
		}

		return new Column(sId, {
			propertyKey: oPropertyInfo.key,
			header: oPropertyInfo.label,
			template: new Text({oTextBindingInfo})
		});
	};

	JSONTreeTableDelegate.addItem = async (oTable, sPropertyKey) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyKey);
		const sId = oTable.getId() + "---col-" + sPropertyKey;
		return await _createColumn(sId, oPropertyInfo);
	};

	return JSONTreeTableDelegate;
});