sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (exports, Icons) { 'use strict';

	const name = "timeseries-waterfall-chart";
	const pathData = "M96 0v432H32V0h64zm128 0v160h-64V0h64zm194 0q40 0 67 26.5T512 97q0 41-27 68t-67 27q-42 0-70-27.5T320 97q0-44 28-70.5T418 0zm-2 168q15 0 28-6t23-15.5 16-22.5 6-27q0-31-22-52t-51-21-50 21q-22 19-22 52 0 28 22 49.5t50 21.5zM393 56h24v36h48v24h-72V56zm-41 136v144h-64V192h64zm64 80h64v160h-64V272zM0 512v-32h512v32H0z";
	const ltr = false;
	const accData = null;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var timeseriesWaterfallChart = "timeseries-waterfall-chart";

	exports.accData = accData;
	exports.default = timeseriesWaterfallChart;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
