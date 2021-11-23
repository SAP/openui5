sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "add-photo";
	const pathData = "M395.5 433c14 0 23-10 23-23V293c0-14 10-23 23-23 14 0 24 9 24 23v117c0 39-30 69-70 69-14 0-23-9-23-23s9-23 23-23zm-325-279h37l39-39c5-5 10-7 17-7h93c14 0 23 9 23 23s-9 23-23 23h-84l-39 40c-5 4-10 6-17 6h-46c-14 0-23 10-23 24v186c0 13 9 23 23 23s23 9 23 23-9 23-23 23c-40 0-70-30-70-69V224c0-40 30-70 70-70zm23 70c13 0 23 10 23 23s-10 23-23 23-23-10-23-23 10-23 23-23zm139 23c65 0 117 51 117 116s-52 116-117 116-116-51-116-116 51-116 116-116zm0 186c40 0 70-30 70-70 0-39-30-70-70-70-39 0-69 31-69 70 0 40 30 70 69 70zm209-279v46c0 14-9 24-23 24s-23-10-23-24v-46h-46c-14 0-24-9-24-23s10-23 24-23h46V61c0-14 9-23 23-23s23 9 23 23v47h47c14 0 23 9 23 23s-9 23-23 23h-47z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ADD_PHOTO;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
