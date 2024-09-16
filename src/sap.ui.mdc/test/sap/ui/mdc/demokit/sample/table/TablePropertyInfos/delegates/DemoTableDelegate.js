/* eslint-disable require-await */
sap.ui.define([
	"mdc/sample/delegate/JSONTableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/ObjectIdentifier",
	"mdc/sample/model/metadata/JSONPropertyInfo"
], function (
	JSONTableDelegate,
	Column,
	Text,
	ObjectIdentifier,
	JSONPropertyInfo
) {
	"use strict";

	const DemoTableDelegate = Object.assign({}, JSONTableDelegate);

	const _createColumn = (sId, oPropertyInfo) => {
		const oColumn = new Column(sId, {
			propertyKey: oPropertyInfo.key,
			header: oPropertyInfo.label,
			tooltip: oPropertyInfo.tooltip,
			template: new Text({
				text: {
					path: "mountains>" + oPropertyInfo.path,
					type: oPropertyInfo.dataType,
					formatOptions: oPropertyInfo.formatOptions
				}
			})
		});

		if (oPropertyInfo.key === "name_range") {
			oColumn.setTemplate(new ObjectIdentifier({
				title: "{mountains>name}",
				text: "{mountains>range}"
			}));
		} else if (oPropertyInfo.key === "height" || oPropertyInfo.key === "prominence") {
			oColumn.getTemplate().bindText({
				path: `mountains>${oPropertyInfo.path}`,
				type: oPropertyInfo.dataType,
				formatOptions: oPropertyInfo.formatOptions,
				formatter: (sValue) => {
					return sValue + " m";
				}
			});
		} else if (oPropertyInfo.key.endsWith("_ComplexWithText")) {
			oColumn.getTemplate().bindText({
				parts: oPropertyInfo.propertyInfos.map((sPropertyKey) => `mountains>${sPropertyKey}`),
				formatter: (sValue, sTextValue) => {
					return oPropertyInfo.exportSettings.template.replace("{0}", sValue).replace("{1}", sTextValue);
				}
			});
		}

		return oColumn;
	};

	DemoTableDelegate.addItem = async (oTable, sPropertyKey) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyKey);
		const sId = oTable.getId() + "---col-" + sPropertyKey;
		return await _createColumn(sId, oPropertyInfo);
	};

	return DemoTableDelegate;
}, /* bExport= */false);