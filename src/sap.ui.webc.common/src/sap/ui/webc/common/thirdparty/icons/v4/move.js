sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "move";
	const pathData = "M41.5 232l61-52q5-5 11-5t11 5q6 5 6 11t-6 12l-44 37h160V80l-36 43q-5 5-11 5-4 0-12-5-5-6-5-11 0-6 5-11l53-60q11-9 23-9 14 0 23 9l52 60q6 5 6 11 0 5-6 11-5 5-11 5-4 0-12-5l-37-43v160h160l-43-37q-5-6-5-12t5-11 11-5 11 5l60 52q9 10 9 23t-9 23l-60 53q-5 5-11 5-3 0-11-5-5-6-5-12t5-11l43-36h-160v160l37-44q5-5 12-5 6 0 11 5 6 5 6 11 0 5-6 11l-52 61q-9 9-23 9-12 0-23-9l-53-61q-5-6-5-11 0-6 5-11t12-5q6 0 11 5l36 44V272h-160l44 36q6 5 6 11t-6 12q-5 5-11 5-3 0-11-5l-61-53q-9-10-9-23t9-23z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MOVE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var move = "move";

	exports.accData = accData;
	exports.default = move;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
