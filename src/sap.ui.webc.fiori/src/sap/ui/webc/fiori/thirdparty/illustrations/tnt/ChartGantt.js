sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartGantt', './tnt-Scene-ChartGantt', './tnt-Spot-ChartGantt'], function (exports, Illustrations, tntDialogChartGantt, tntSceneChartGantt, tntSpotChartGantt) { 'use strict';

	const name = "ChartGantt";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartGantt,
		sceneSvg: tntSceneChartGantt,
		spotSvg: tntSpotChartGantt,
		set,
	});

	exports.dialogSvg = tntDialogChartGantt;
	exports.sceneSvg = tntSceneChartGantt;
	exports.spotSvg = tntSpotChartGantt;

	Object.defineProperty(exports, '__esModule', { value: true });

});
