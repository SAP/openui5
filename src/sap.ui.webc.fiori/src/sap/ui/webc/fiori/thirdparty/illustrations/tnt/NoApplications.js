sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-NoApplications', './tnt-Scene-NoApplications', './tnt-Spot-NoApplications'], function (exports, Illustrations, tntDialogNoApplications, tntSceneNoApplications, tntSpotNoApplications) { 'use strict';

	const name = "NoApplications";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogNoApplications,
		sceneSvg: tntSceneNoApplications,
		spotSvg: tntSpotNoApplications,
		set,
	});

	exports.dialogSvg = tntDialogNoApplications;
	exports.sceneSvg = tntSceneNoApplications;
	exports.spotSvg = tntSpotNoApplications;

	Object.defineProperty(exports, '__esModule', { value: true });

});
