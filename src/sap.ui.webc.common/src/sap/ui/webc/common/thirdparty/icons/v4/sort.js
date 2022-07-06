sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "sort";
	const pathData = "M253.515 110.353q5.965 5.965 5.965 11.93 0 4.971-5.965 10.936-4.971 4.971-11.433 4.971t-11.433-4.97l-86.494-86.494v319.13q0 15.907-15.906 15.907t-15.907-15.907V48.715l-84.505 84.504q-4.971 4.971-10.936 4.971t-10.936-4.97Q0 127.253 0 122.282q0-5.965 5.965-11.93L107.371 9.942Q116.318 0 129.243 0t22.866 9.942zm151.114 387.729q-9.942 9.941-22.866 9.941t-21.872-9.941L258.485 397.67q-5.965-5.965-5.965-11.93t5.965-10.936q4.971-4.971 10.936-4.971t10.936 4.97l84.505 84.506V142.167q0-15.907 15.907-15.907t15.907 15.907v319.13l86.493-86.493q5.965-5.965 10.936-5.965 5.965 0 11.93 5.965Q512 379.774 512 385.74t-5.965 11.93z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var sort = "sort";

	exports.accData = accData;
	exports.default = sort;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
