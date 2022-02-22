sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartBPMNFlow', './tnt-Scene-ChartBPMNFlow', './tnt-Spot-ChartBPMNFlow'], function (exports, Illustrations, tntDialogChartBPMNFlow, tntSceneChartBPMNFlow, tntSpotChartBPMNFlow) { 'use strict';

	const name = "ChartBPMNFlow";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartBPMNFlow,
		sceneSvg: tntSceneChartBPMNFlow,
		spotSvg: tntSpotChartBPMNFlow,
		set,
	});

	exports.dialogSvg = tntDialogChartBPMNFlow;
	exports.sceneSvg = tntSceneChartBPMNFlow;
	exports.spotSvg = tntSpotChartBPMNFlow;

	Object.defineProperty(exports, '__esModule', { value: true });

});
