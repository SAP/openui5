sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Tools', './tnt-Scene-Tools', './tnt-Spot-Tools'], function (exports, Illustrations, tntDialogTools, tntSceneTools, tntSpotTools) { 'use strict';

	const name = "Tools";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogTools,
		sceneSvg: tntSceneTools,
		spotSvg: tntSpotTools,
		set,
	});

	exports.dialogSvg = tntDialogTools;
	exports.sceneSvg = tntSceneTools;
	exports.spotSvg = tntSpotTools;

	Object.defineProperty(exports, '__esModule', { value: true });

});
