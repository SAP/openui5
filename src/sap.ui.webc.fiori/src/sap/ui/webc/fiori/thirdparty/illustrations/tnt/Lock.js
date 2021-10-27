sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Lock', './tnt-Scene-Lock', './tnt-Spot-Lock'], function (exports, Illustrations, tntDialogLock, tntSceneLock, tntSpotLock) { 'use strict';

	const name = "Lock";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogLock,
		sceneSvg: tntSceneLock,
		spotSvg: tntSpotLock,
		set,
	});

	exports.dialogSvg = tntDialogLock;
	exports.sceneSvg = tntSceneLock;
	exports.spotSvg = tntSpotLock;

	Object.defineProperty(exports, '__esModule', { value: true });

});
