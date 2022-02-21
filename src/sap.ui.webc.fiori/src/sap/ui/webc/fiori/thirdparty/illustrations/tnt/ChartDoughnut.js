sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartDoughnut', './tnt-Scene-ChartDoughnut', './tnt-Spot-ChartDoughnut'], function (exports, Illustrations, tntDialogChartDoughnut, tntSceneChartDoughnut, tntSpotChartDoughnut) { 'use strict';

	const name = "ChartDoughnut";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartDoughnut,
		sceneSvg: tntSceneChartDoughnut,
		spotSvg: tntSpotChartDoughnut,
		set,
	});

	exports.dialogSvg = tntDialogChartDoughnut;
	exports.sceneSvg = tntSceneChartDoughnut;
	exports.spotSvg = tntSpotChartDoughnut;

	Object.defineProperty(exports, '__esModule', { value: true });

});
