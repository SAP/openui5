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
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/security/URLListValidator",
	"sap/base/Log",
	"sap/ui/core/library",
	"./IFrameRenderer"
], function(
	library,
	Control,
	JSONModel,
	getContainerUserInfo,
	extend,
	CancelablePromise,
	URLListValidator,
	Log
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
	 * @alias sap.ui.fl.util.IFrame
	 */
	var IFrame = Control.extend("sap.ui.fl.util.IFrame", /** @lends sap.ui.fl.util.IFrame.prototype */ {

		metadata: {
			library: "sap.ui.fl",

			properties: {
				/**
				 * Determines the URL of the content.
				 */
				url: {type: "sap.ui.core.URI", group: "Misc", defaultValue: "" },

				/**
				 * Defines the <code>IFrame</code> width.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "100%"},

				/**
				 * Defines the <code>IFrame</code> height.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "100%"},

				/**
				 * Defines the title of the item.
				 */
				title: {type: "string", group: "Misc", defaultValue: undefined},

				/**
				 * Backup of the initial settings for the dialogs
				 *
				 * @ui5-restricted sap.ui.fl
				 */
				_settings: {type: "object", group: "Data", defaultValue: null}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init: function () {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, arguments);
			}
			this._oInitializePromise = getContainerUserInfo()
				.then(function(oUserInfo) {
					this._oUserModel = new JSONModel(oUserInfo);
					this.setModel(this._oUserModel, "$user");
				}.bind(this));
		},

		waitForInit: function () {
			return this._oInitializePromise ? this._oInitializePromise : Promise.reject();
		},

		setUrl: function(sUrl) {
			// Could contain special characters from bindings that need to be encoded
			// Make sure that it was not encoded before
			var sEncodedUrl = decodeURI(sUrl) === sUrl ? encodeURI(sUrl) : sUrl;

			if (IFrame.isValidUrl(sEncodedUrl)) {
				// Setting the url of the IFrame directly can lead to issues
				// if the change doesn't result in a reload of the embedded page
				// e.g. when a navigation parameter is changed
				// To avoid problems with the ushell and the embedded apps, it is safer
				// to unload the iframe content first and thus force a full browser reload

				if (this._oSetUrlPromise) {
					this._oSetUrlPromise.cancel();
					delete this._oSetUrlPromise;
				}

				this.setProperty("url", "");

				this._oSetUrlPromise = new CancelablePromise(function (fnResolve, fnReject, onCancel) {
					onCancel.shouldReject = false;
					// Use a timeout here to avoid issues with browser caching in Chrome
					// that seem to lead to a mismatch between IFrame content and src,
					// see Chromium issue 324102
					setTimeout(fnResolve, 0);
				});

				this._oSetUrlPromise.then(function() {
					this.setProperty("url", sEncodedUrl);
				}.bind(this));
			} else {
				Log.error("Provided URL is not valid as an IFrame src");
			}
			return this;
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

	IFrame.isValidUrl = function(sUrl) {
		// Make sure that pseudo protocols are not allowed as IFrame src
		return (
			!URLListValidator.entries().some(function(oValidatorEntry) {
				return /javascript/i.test(oValidatorEntry.protocol);
			})
			&& URLListValidator.validate(sUrl)
		);
	};

	return IFrame;
});
