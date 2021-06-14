sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "move";
	const pathData = "M41.5 232l61-52q5-5 11-5t11 5q12 11 0 23l-44 37h160V80l-36 43q-5 5-11 5-4 0-12-5-11-11 0-22l53-60q11-9 23-9 14 0 23 9l52 60q11 11 0 22-5 5-11 5-4 0-12-5l-37-43v160h160l-43-37q-11-12 0-23 5-5 11-5t11 5l60 52q9 10 9 23t-9 23l-60 53q-5 5-11 5-3 0-11-5-11-12 0-23l43-36h-160v160l37-44q5-5 12-5 6 0 11 5 11 11 0 22l-52 61q-9 9-23 9-12 0-23-9l-53-61q-11-11 0-22 5-5 12-5 6 0 11 5l36 44V272h-160l44 36q12 11 0 23-5 5-11 5-3 0-11-5l-61-53q-9-10-9-23t9-23z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MOVE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var move = { pathData, accData };

	return move;

});
