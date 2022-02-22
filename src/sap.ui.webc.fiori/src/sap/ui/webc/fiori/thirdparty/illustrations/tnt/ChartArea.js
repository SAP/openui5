sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartArea', './tnt-Scene-ChartArea', './tnt-Spot-ChartArea'], function (exports, Illustrations, tntDialogChartArea, tntSceneChartArea, tntSpotChartArea) { 'use strict';

	const name = "ChartArea";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartArea,
		sceneSvg: tntSceneChartArea,
		spotSvg: tntSpotChartArea,
		set,
	});

	exports.dialogSvg = tntDialogChartArea;
	exports.sceneSvg = tntSceneChartArea;
	exports.spotSvg = tntSpotChartArea;

	Object.defineProperty(exports, '__esModule', { value: true });

});
