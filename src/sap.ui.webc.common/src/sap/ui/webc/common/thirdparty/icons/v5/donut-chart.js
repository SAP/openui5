sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "donut-chart";
	const pathData = "M256.5 1c140 0 255 115 255 256 0 140-115 255-255 255-141 0-256-115-256-255 0-141 115-256 256-256zm202 230c-10-92-85-166-176-176v77c51 10 89 48 99 99h77zm-202 103c43 0 77-34 77-77 0-44-34-77-77-77s-77 33-77 77c0 43 34 77 77 77zm-204-77c0 105 79 189 178 202v-77c-58-13-102-61-102-125s44-113 102-125V55c-99 13-178 97-178 202zm230 202c91-10 166-85 176-177h-77c-10 52-48 90-99 100v77z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
