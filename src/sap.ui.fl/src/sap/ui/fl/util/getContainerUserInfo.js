/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/Log"
], function(
	Utils,
	Log
) {
	"use strict";

	function emptify (vValue) {
		if (!vValue) {
			return "";
		}
		return vValue;
	}

	/**
	 * Use the shell service to get the current user information
	 *
	 * @return {object} Dictionary listing current user properties or empty object if no user or error
	 * @ui5-restricted sap.ui.fl
	 */
	return function () {
		return Utils.ifUShellContainerThen(function(aServices) {
			var oUserInfoService = aServices[0];
			if (!oUserInfoService) {
				return {};
			}
			var oUserInfo = oUserInfoService.getUser();
			if (!oUserInfo) {
				return {};
			}
			try {
				var sEmail = emptify(oUserInfo.getEmail());
				var sDomain;
				if (sEmail) {
					sDomain = emptify(/@(.*)/.exec(sEmail)[1]);
				} else {
					sDomain = "";
				}
				return {
					fullName: emptify(oUserInfo.getFullName()),
					firstName: emptify(oUserInfo.getFirstName()),
					lastName: emptify(oUserInfo.getLastName()),
					email: sEmail,
					domain: sDomain
				};
			} catch (oError) {
				Log.error("Unexpected exception when reading shell user info: " + oError.toString());
			}
		}, ["UserInfo"]) || {};
	};
});
