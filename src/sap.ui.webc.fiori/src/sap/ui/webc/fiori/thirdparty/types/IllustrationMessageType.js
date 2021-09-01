sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const IllustrationMessageTypes = {
		BeforeSearch: "BeforeSearch",
		NoActivities: "NoActivities",
		NoData: "NoData",
		NoEntries: "NoEntries",
		NoMail: "NoMail",
		NoNotifications: "NoNotifications",
		NoSavedItems: "NoSavedItems",
		NoSearchResults: "NoSearchResults",
		NoTasks: "NoTasks",
		UnableToLoad: "UnableToLoad",
		UnableToUpload: "UnableToUpload",
	};
	class IllustrationMessageType extends DataType__default {
		static isValid(value) {
			return !!IllustrationMessageTypes[value];
		}
	}
	IllustrationMessageType.generateTypeAccessors(IllustrationMessageTypes);

	return IllustrationMessageType;

});
