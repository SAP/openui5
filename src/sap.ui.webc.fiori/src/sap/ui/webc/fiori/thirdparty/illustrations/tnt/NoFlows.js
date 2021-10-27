sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-NoFlows', './tnt-Scene-NoFlows', './tnt-Spot-NoFlows'], function (exports, Illustrations, tntDialogNoFlows, tntSceneNoFlows, tntSpotNoFlows) { 'use strict';

	const name = "NoFlows";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogNoFlows,
		sceneSvg: tntSceneNoFlows,
		spotSvg: tntSpotNoFlows,
		set,
	});

	exports.dialogSvg = tntDialogNoFlows;
	exports.sceneSvg = tntSceneNoFlows;
	exports.spotSvg = tntSpotNoFlows;

	Object.defineProperty(exports, '__esModule', { value: true });

});
