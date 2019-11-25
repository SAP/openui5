/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.util.IFrame
sap.ui.define([
	"../library",
	"sap/ui/core/Control",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"./IFrameRenderer"
], function(
	library,
	Control,
	Utils,
	JSONModel
) {
	"use strict";

	function getContainerUserInfo () {
		var oShellContainer = Utils.getUshellContainer();
		if (oShellContainer) {
			var oUserInfoService = oShellContainer.getService("UserInfo");
			if (!oUserInfoService) {
				return;
			}
			var oUserInfo = oUserInfoService.getUser();
			if (!oUserInfo) {
				return;
			}
			var sEmail = oUserInfo.getEmail();
			var sDomain = /@(.*)/.exec(sEmail)[1];
			return {
				fullName: oUserInfo.getFullName(),
				firstName: oUserInfo.getFirstName(),
				lastName: oUserInfo.getLastName(),
				email: sEmail,
				domain: sDomain
			};
		}
	}

	/**
	 * Constructor for a new <code>IFrame</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables integration of external applications using IFrames.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.fl.IFrame
	 */
	var IFrame = Control.extend("sap.ui.fl.util.IFrame", /** @lends ap.ui.fl.util.IFrame.prototype */ {

		metadata : {
			library : "sap.ui.fl",

			properties : {
				/**
				 * Determines the url of the content.
				 */
				url : {type : "sap.ui.core.URI", group : "Misc", defaultValue: "" },

				/**
				 * Defines the <code>IFrame</code> width.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},

				/**
				 * Defines the <code>IFrame</code> height.
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init: function () {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, arguments);
			}
			var oUserData = getContainerUserInfo() || {};
			this._oUserModel = new JSONModel(oUserData);
			this.setModel(this._oUserModel, "$user");
		},

		exit: function () {
			if (this._oUserModel) {
				this._oUserModel.destroy();
				delete this._oUserModel;
			}
		}

	});

	return IFrame;
});
