sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/meeting-room', './v4/meeting-room'], function (exports, Theme, meetingRoom$1, meetingRoom$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? meetingRoom$1.pathData : meetingRoom$2.pathData;
	var meetingRoom = "meeting-room";

	exports.accData = meetingRoom$1.accData;
	exports.ltr = meetingRoom$1.ltr;
	exports.default = meetingRoom;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
