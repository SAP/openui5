sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "bar-code";
	const pathData = "M0 105q0-31 21-52 5-4 10.5-7.5T44 38q14-6 29-6h312l127 127v249q0 14-6 28-3 5-7 11t-9 12q-10 10-24 15-12 6-28 6H73q-28 0-52-21-9-11-15-24t-6-27V105zm38 0v303q0 15 9.5 25T73 443h365q16 0 26-10t10-25V192h-86q-15 0-25.5-10.5T352 156V69H73q-16 0-25.5 10T38 105zm236 23v193h-37V128h37zM110 321V128h34v193h-34zm218-107h35v107h-35V214zm-146-86v193h-18V128h18zm109 193V128h18v193h-18zm-218 0V128h17v193H73zm128 0V128h17v193h-17zm181 0V214h17v107h-17zm37-107h16v107h-16V214zM164 415v-64h18v64h-18zm145-64v64h-18v-64h18zm-108 64v-64h17v64h-17zm198-64v64h-17v-64h17zm-71 0h17v64h-17v-64zm-201 0v64h-17v-64h17zm110 0h17v64h-17v-64zm-147 0v64H73v-64h17zm329 0h16v64h-16v-64z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var barCode = { pathData };

	return barCode;

});
