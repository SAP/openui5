/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.util.IFrame
sap.ui.define([
	"../library",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"./getContainerUserInfo",
	"sap/base/util/extend",
	"sap/ui/core/library",
	"./IFrameRenderer"
], function(
	library,
	Control,
	JSONModel,
	getContainerUserInfo,
	extend
) {
	"use strict";

	function unbind (vValue) {
		if (vValue.parts && vValue.formatter) {
			return vValue.formatter.apply(null, vValue.parts.map(function (oPart) {
				if (oPart.model) {
					return "{" + oPart.model + ">" + oPart.path + "}";
				}
				return "{" + oPart.path + "}";
			}));
		}
		return vValue;
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
				height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},

				/**
				 * Backup of the initial settings for the dialogs
				 *
				 * @ui5-restricted sap.ui.fl
				 */
				_settings : {type : "object", group : "Data", defaultValue : null}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init: function () {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, arguments);
			}
			this._oUserModel = new JSONModel(getContainerUserInfo());
			this.setModel(this._oUserModel, "$user");
		},

		applySettings: function (mSettings) {
			Control.prototype.applySettings.apply(this, arguments);
			if (mSettings) {
				var mMergedSettings = this.getProperty("_settings") || {};
				if (mSettings._settings) {
					extend(mMergedSettings, mSettings._settings);
				} else {
					Object.keys(mSettings)
						.filter(function (sPropertyName) {
							return !!mSettings[sPropertyName];
						})
						.forEach(function (sPropertyName) {
							mMergedSettings[sPropertyName] = unbind(mSettings[sPropertyName]);
						});
				}
				this.setProperty("_settings", mMergedSettings);
			}
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
