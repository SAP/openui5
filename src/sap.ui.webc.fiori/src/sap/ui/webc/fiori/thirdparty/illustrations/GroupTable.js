sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-GroupTable', './sapIllus-Scene-GroupTable', './sapIllus-Spot-GroupTable', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogGroupTable, sapIllusSceneGroupTable, sapIllusSpotGroupTable, i18nDefaults) { 'use strict';

	const name = "GroupTable";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_GROUPTABLE;
	const subtitle = i18nDefaults.IM_SUBTITLE_GROUPTABLE;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogGroupTable,
		sceneSvg: sapIllusSceneGroupTable,
		spotSvg: sapIllusSpotGroupTable,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogGroupTable;
	exports.sceneSvg = sapIllusSceneGroupTable;
	exports.spotSvg = sapIllusSpotGroupTable;

	Object.defineProperty(exports, '__esModule', { value: true });

});
