sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "checklist-item";
	const pathData = "M416 32q27 0 45.5 19T480 96v131q0 29-22 48L277 472q-8 8-21 8-12 0-20-8L55 275q-23-20-23-48V96q0-26 19-45t45-19h320zm32 64q0-13-9-22.5T416 64H96q-13 0-22.5 9.5T64 96v131q0 14 12 24l180 197 181-197q11-9 11-24V96z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var checklistItem = { pathData };

	return checklistItem;

});
