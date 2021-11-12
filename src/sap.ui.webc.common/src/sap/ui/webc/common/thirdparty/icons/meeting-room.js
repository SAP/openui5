sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/meeting-room', './v4/meeting-room'], function (Theme, meetingRoom$2, meetingRoom$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? meetingRoom$1 : meetingRoom$2;
	var meetingRoom = { pathData };

	return meetingRoom;

});
