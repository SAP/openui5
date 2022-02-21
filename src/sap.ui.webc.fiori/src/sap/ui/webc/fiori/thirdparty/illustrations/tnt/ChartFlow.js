sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartFlow', './tnt-Scene-ChartFlow', './tnt-Spot-ChartFlow'], function (exports, Illustrations, tntDialogChartFlow, tntSceneChartFlow, tntSpotChartFlow) { 'use strict';

	const name = "ChartFlow";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartFlow,
		sceneSvg: tntSceneChartFlow,
		spotSvg: tntSpotChartFlow,
		set,
	});

	exports.dialogSvg = tntDialogChartFlow;
	exports.sceneSvg = tntSceneChartFlow;
	exports.spotSvg = tntSpotChartFlow;

	Object.defineProperty(exports, '__esModule', { value: true });

});
