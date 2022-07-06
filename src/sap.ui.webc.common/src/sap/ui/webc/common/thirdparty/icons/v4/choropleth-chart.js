sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (exports, Icons) { 'use strict';

	const name = "choropleth-chart";
	const pathData = "M32.5 252V32h191v56l-64 104v37l-37-37h-53v49l154 47v55l-63 137-34-31-15-95-46-87zm265-56v-55l36-32h37l73-77h36v146l-36-37v37h-19l-18-37h-36l-37 55h-36zm54-164v53h-37zm-55 192h183v63l-32 65-64 96-50 32V361l-74-74z";
	const ltr = true;
	const accData = null;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var choroplethChart = "choropleth-chart";

	exports.accData = accData;
	exports.default = choroplethChart;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
