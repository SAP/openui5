sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "checklist-item";
	const pathData = "M437.5 1c33 0 60 27 60 61v265c0 33-18 63-45 78l-181 103c-9 6-21 6-30 0l-181-103c-27-15-45-45-45-78V62c0-34 27-61 60-61h362zm0 326V62h-362v265c0 12 6 21 15 27l166 94 166-94c9-6 15-15 15-27zm-232-33l-60-61c-12-12-12-30 0-42s30-12 42 0l39 39 99-99c13-12 31-12 43 0s12 30 0 42l-121 121c-12 12-30 12-42 0z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
