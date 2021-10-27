sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Fingerprint', './tnt-Scene-Fingerprint', './tnt-Spot-Fingerprint'], function (exports, Illustrations, tntDialogFingerprint, tntSceneFingerprint, tntSpotFingerprint) { 'use strict';

	const name = "Fingerprint";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogFingerprint,
		sceneSvg: tntSceneFingerprint,
		spotSvg: tntSpotFingerprint,
		set,
	});

	exports.dialogSvg = tntDialogFingerprint;
	exports.sceneSvg = tntSceneFingerprint;
	exports.spotSvg = tntSpotFingerprint;

	Object.defineProperty(exports, '__esModule', { value: true });

});
