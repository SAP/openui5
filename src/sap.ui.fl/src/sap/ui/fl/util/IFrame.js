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
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/security/URLListValidator",
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
	CancelablePromise,
	URLListValidator,
	Log,
	IFrameRenderer
) {
	"use strict";

	function unbind(vValue) {
		if (vValue.parts && vValue.formatter) {
			return vValue.formatter.apply(null, vValue.parts.map(function(oPart) {
				if (oPart.model) {
					return `{${oPart.model}>${oPart.path}}`;
				}
				return `{${oPart.path}}`;
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
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "50vh"},

				/**
				 * Defines the title of the item.
				 */
				title: {type: "string", group: "Misc", defaultValue: undefined},

				/**
				 * Defines whether the <code>IFrame</code> was added as a new container.
				 */
				asContainer: {type: "boolean", group: "Misc", defaultValue: undefined},

				/**
				 * Defines the information required for handling rename of <code>IFrame</code> containers.
				 */
				renameInfo: {type: "object", group: "Data", defaultValue: null},

				/**
				 * Define whether to set the URL by creating a new history entry (legacy) or replacing the current one.
				 */
				useLegacyNavigation: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Backup of the initial settings for the dialogs.
				 *
				 *  @private
				 *  @ui5-restricted sap.ui.fl
				 */
				_settings: {type: "object", group: "Data", defaultValue: null}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init(...aArgs) {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, aArgs);
			}
			this._oInitializePromise = getContainerUserInfo()
			.then(function(oUserInfo) {
				this._oUserModel = new JSONModel(oUserInfo);
				this.setModel(this._oUserModel, "$user");
			}.bind(this));
		},

		waitForInit() {
			return this._oInitializePromise ? this._oInitializePromise : Promise.reject();
		},

		_setUrlLegacy(sEncodedUrl) {
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

			this._oSetUrlPromise = new CancelablePromise(function(fnResolve, fnReject, onCancel) {
				onCancel.shouldReject = false;
				// Use a timeout here to avoid issues with browser caching in Chrome
				// that seem to lead to a mismatch between IFrame content and src,
				// see Chromium issue 324102
				setTimeout(fnResolve, 0);
			});

			this._oSetUrlPromise.then(function() {
				delete this._oSetUrlPromise;
				this.setProperty("url", sEncodedUrl);
			}.bind(this));
		},

		setUrl(sUrl) {
			// Could contain special characters from bindings that need to be encoded
			// Make sure that it was not encoded before
			var sEncodedUrl = decodeURI(sUrl) === sUrl ? encodeURI(sUrl) : sUrl;

			if (IFrame.isValidUrl(sEncodedUrl)) {
				if (this.getUseLegacyNavigation()) {
					// Set by pushing to the history
					this._setUrlLegacy(sEncodedUrl);
				} else {
					// Set by replacing the last entry
					const oNewUrl = IFrame._toUrl(sEncodedUrl);
					const oOldUrl = IFrame._toUrl(this.getUrl() || "about:blank");
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
				}
			} else {
				Log.error("Provided URL is not valid as an IFrame src");
			}
			return this;
		},

		// Used for testing since retrieving or spying on the Iframe location
		// is not possible due to cross-origin restrictions
		_replaceIframeLocation(sNewUrl) {
			this.getDomRef().contentWindow.location.replace(sNewUrl);
		},

		onAfterRendering() {
			if (!this.getUseLegacyNavigation()) {
				this._replaceIframeLocation(this.getUrl());
			}
		},

		applySettings(mSettings, ...aOtherArgs) {
			const { url, ...mOtherSettings } = mSettings || {};
			Control.prototype.applySettings.apply(this, [mOtherSettings, ...aOtherArgs]);
			Control.prototype.applySettings.apply(this, [{ url }, ...aOtherArgs]);
			if (mSettings) {
				var mMergedSettings = this.getProperty("_settings") || {};
				if (mSettings._settings) {
					extend(mMergedSettings, mSettings._settings);
				} else {
					Object.keys(mSettings)
					.filter(function(sPropertyName) {
						return mSettings[sPropertyName] !== undefined;
					})
					.forEach(function(sPropertyName) {
						mMergedSettings[sPropertyName] = unbind(mSettings[sPropertyName]);
					});
				}
				this.setProperty("_settings", mMergedSettings);
			}
		},

		exit() {
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
		const oDocumentLocation = IFrame._getDocumentLocation();
		return new URL(sUrl, oDocumentLocation.href);
	};

	IFrame.isValidUrl = function(sUrl) {
		try {
			const oUrl = IFrame._toUrl(sUrl);
			return (
				// Forbid dangerous javascript pseudo protocol
				!/javascript/i.test(oUrl.protocol)
				&& (
					// Forbid unsafe http embedding within https to conform with mixed content security restrictions
					!/http(?!s)/.test(oUrl.protocol)
					// Exception: Host is using http, no protocol downgrade happening
					// Required for local testing and onPrem systems
					|| /http(?!s)/.test(IFrame._getDocumentLocation().protocol)
				)
				// Take further customer restrictions into account
				&& URLListValidator.validate(sUrl)
			);
		} catch {
			return false;
		}
	};

	return IFrame;
});
