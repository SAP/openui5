sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-AddPeople', './sapIllus-Scene-AddPeople', './sapIllus-Spot-AddPeople', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogAddPeople, sapIllusSceneAddPeople, sapIllusSpotAddPeople, i18nDefaults) { 'use strict';

	const name = "AddPeople";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_ADDPEOPLE;
	const subtitle = i18nDefaults.IM_SUBTITLE_ADDPEOPLE;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogAddPeople,
		sceneSvg: sapIllusSceneAddPeople,
		spotSvg: sapIllusSpotAddPeople,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogAddPeople;
	exports.sceneSvg = sapIllusSceneAddPeople;
	exports.spotSvg = sapIllusSpotAddPeople;

	Object.defineProperty(exports, '__esModule', { value: true });

});
