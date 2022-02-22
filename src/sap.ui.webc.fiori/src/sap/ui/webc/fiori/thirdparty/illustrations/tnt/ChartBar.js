sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartBar', './tnt-Scene-ChartBar', './tnt-Spot-ChartBar'], function (exports, Illustrations, tntDialogChartBar, tntSceneChartBar, tntSpotChartBar) { 'use strict';

	const name = "ChartBar";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartBar,
		sceneSvg: tntSceneChartBar,
		spotSvg: tntSpotChartBar,
		set,
	});

	exports.dialogSvg = tntDialogChartBar;
	exports.sceneSvg = tntSceneChartBar;
	exports.spotSvg = tntSpotChartBar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
