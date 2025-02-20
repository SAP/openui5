/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.util.IFrame
sap.ui.define([
	"../library",
	"sap/base/util/uid",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"./getContainerUserInfo",
	"sap/base/util/extend",
	"sap/base/security/URLWhitelist",
	"sap/base/Log",
	"./IFrameRenderer",
	"sap/ui/core/library"
], function(
	library,
	uid,
	Control,
	JSONModel,
	getContainerUserInfo,
	extend,
	URLWhitelist,
	Log,
	IFrameRenderer
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
				 * Defines the title of the item.
				 */
				title : {type : "string", group : "Misc", defaultValue : undefined},

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

		setUrl: function(sUrl) {
			// Could contain special characters from bindings that need to be encoded
			// Make sure that it was not encoded before
			var sEncodedUrl = decodeURI(sUrl) === sUrl ? encodeURI(sUrl) : sUrl;

			if (IFrame.isValidUrl(sEncodedUrl)) {
				// Set by replacing the last entry
				var oNewUrl = IFrame._toUrl(sEncodedUrl);
				var oOldUrl = IFrame._toUrl(this.getUrl() || "about:blank");
				if (oOldUrl.searchParams.has("sap-ui-xx-fl-forceEmbeddedContentRefresh")) {
					// Always keep the refresh parameter and update it to avoid false negatives
					// when the URL doesn't change except for the refresh parameter itself + hash
					oNewUrl.searchParams.set("sap-ui-xx-fl-forceEmbeddedContentRefresh", uid().substring(3));
				} else if (
					oOldUrl.origin === oNewUrl.origin
					&& oOldUrl.pathname === oNewUrl.pathname
					&& oOldUrl.search === oNewUrl.search
					&& oOldUrl.hash !== oNewUrl.hash
				) {
					// Only the hash changed, site is not going to reload automatically
					// Set an artificial search parameter to force a refresh
					oNewUrl.searchParams.append("sap-ui-xx-fl-forceEmbeddedContentRefresh", uid().substring(3));
				}
				this.setProperty("url", oNewUrl.toString());
			} else {
				Log.error("Provided URL is not valid as an IFrame src");
			}
			return this;
		},

		// Used for testing since retrieving or spying on the Iframe location
		// is not possible due to cross-origin restrictions
		_replaceIframeLocation: function (sNewUrl) {
			this.getDomRef().contentWindow.location.replace(sNewUrl);
		},

		onAfterRendering: function () {
			this._replaceIframeLocation(this.getUrl());

			// The contentWindow might change without causing a rerender, e.g.
			// when the parent element changes due to an appendChild call
			// This will cause the iframe src to change and we need to replace the
			// location again to ensure the correct content
			this._oLastContentWindow = this.getDomRef().contentWindow;
			this.getDomRef().addEventListener("load", function() {
				if (!this.getDomRef()) {
					// The iframe was removed before the load event was triggered
					return;
				}
				if (this._oLastContentWindow !== this.getDomRef().contentWindow) {
					this._oLastContentWindow = this.getDomRef().contentWindow;
					this._replaceIframeLocation(this.getUrl());
				}
			}.bind(this));
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
		},

		renderer: IFrameRenderer
	});

	// Used for test stubbing
	IFrame._getDocumentLocation = function() {
		return document.location;
	};

	IFrame._toUrl = function(sUrl) {
		var oDocumentLocation = IFrame._getDocumentLocation();
		return new window.URL(sUrl, oDocumentLocation.href);
	};

	IFrame.isValidUrl = function(sUrl) {
		try {
			var oUrl = IFrame._toUrl(sUrl);

			// Make sure that pseudo protocols are not allowed as IFrame src
			return (
				!/javascript/i.test(oUrl.protocol)
				&& (
					// Forbid unsafe http embedding within https to conform with mixed content security restrictions
					!/http(?!s)/.test(oUrl.protocol)
					// Exception: Host is using http, no protocol downgrade happening
					// Required for local testing and onPrem systems
					|| /http(?!s)/.test(IFrame._getDocumentLocation().protocol)
				)
				&& URLWhitelist.validate(sUrl)
			);
		} catch (error) {
			return false;
		}
	};

	return IFrame;
});
