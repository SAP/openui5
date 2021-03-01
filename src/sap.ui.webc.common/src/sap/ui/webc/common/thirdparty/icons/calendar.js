sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "calendar";
	const pathData = "M325 378h-95v-37l95-129h38v129h38v37h-38v47h-38v-47zm-57-37h57v-76zm-108-67q-16 10-37 10v-38q16 0 26.5-9.5T160 212h38v216h-38V274zM448 32q14 0 23 9.5t9 22.5v416q0 14-9 23t-23 9H64q-14 0-23-9t-9-23V64q0-13 9-22.5T64 32h64V0h32v32h192V0h32v32h64zm-96 64h32V64h-32v32zm-224 0h32V64h-32v32zm320 32H64v352h384V128z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var calendar = { pathData };

	return calendar;

});
