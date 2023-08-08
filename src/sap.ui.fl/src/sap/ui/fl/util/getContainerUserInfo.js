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

	function emptify(vValue) {
		if (!vValue) {
			return "";
		}
		return vValue;
	}

	/**
	 * Use the shell service to get the current user information
	 *
	 * @return {Promise<object>} Resolving to dictionary listing current user properties or empty object if no user or error
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return function() {
		var oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			return Utils.getUShellService("UserInfo")
			.then(function(oUserInfoService) {
				if (!oUserInfoService) {
					return {};
				}
				var oUserInfo = oUserInfoService.getUser();
				if (!oUserInfo) {
					return {};
				}
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
			})
			.catch(function(vError) {
				Log.error("Unexpected exception when reading shell user info: " + vError.toString());
				return {};
			});
		}
		return Promise.resolve({});
	};
});
