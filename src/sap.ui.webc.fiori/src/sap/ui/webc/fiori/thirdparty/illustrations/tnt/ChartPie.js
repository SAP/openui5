sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartPie', './tnt-Scene-ChartPie', './tnt-Spot-ChartPie'], function (exports, Illustrations, tntDialogChartPie, tntSceneChartPie, tntSpotChartPie) { 'use strict';

	const name = "ChartPie";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartPie,
		sceneSvg: tntSceneChartPie,
		spotSvg: tntSpotChartPie,
		set,
	});

	exports.dialogSvg = tntDialogChartPie;
	exports.sceneSvg = tntSceneChartPie;
	exports.spotSvg = tntSpotChartPie;

	Object.defineProperty(exports, '__esModule', { value: true });

});
