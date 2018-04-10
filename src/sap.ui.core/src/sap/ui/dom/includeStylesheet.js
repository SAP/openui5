/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global Promise, document */
sap.ui.define(["sap/ui/Device", "sap/ui/dom/appendHead", "sap/base/assert"],
	function(Device, appendHead, assert) {
	"use strict";

	var Device = sap.ui.Device; // @evo-todo

	// @evo-todo: Move into separate module? Also used within "./includeScript.js"
	function cloneMap(oSource) {
		var oObject = {};
		if (oSource) {
			for (var sKey in oSource) {
				if (oSource.hasOwnProperty(sKey)) {
					oObject[sKey] = oSource[sKey];
				}
			}
		}
		return oObject;
	}

	function _includeStyleSheet(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {

		var _createLink = function(sUrl, mAttributes, fnLoadCallback, fnErrorCallback){

			// create the new link element
			var oLink = document.createElement("link");
			oLink.type = "text/css";
			oLink.rel = "stylesheet";
			oLink.href = sUrl;
			if (mAttributes && typeof mAttributes === "object") {
				Object.keys(mAttributes).forEach(function(sKey) {
					if (mAttributes[sKey] != null) {
						oLink.setAttribute(sKey, mAttributes[sKey]);
					}
				});
			}

			var fnError = function() {
				jQuery(oLink).attr("data-sap-ui-ready", "false").off("error");
				if (typeof fnErrorCallback === "function") {
					fnErrorCallback();
				}
			};

			var fnLoad = function() {
				jQuery(oLink).attr("data-sap-ui-ready", "true").off("load");
				if (typeof fnLoadCallback === "function") {
					fnLoadCallback();
				}
			};

			// for IE / Edge we will check if the stylesheet contains any rule and then
			// either trigger the load callback or the error callback
			if ( Device.browser.msie || Device.browser.edge ) {
				var fnLoadOrg = fnLoad;
				fnLoad = function(oEvent) {
					var aRules;
					try {
						// in cross-origin scenarios IE / Edge can still access the rules of the stylesheet
						// if the stylesheet has been loaded properly
						aRules = oEvent.target && oEvent.target.sheet && oEvent.target.sheet.rules;
						// in cross-origin scenarios now the catch block will be executed because we
						// cannot access the rules of the stylesheet but for non cross-origin stylesheets
						// we will get an empty rules array and finally we cannot differ between
						// empty stylesheet or loading issue correctly => documented in JSDoc!
					} catch (ex) {
						// exception happens when the stylesheet could not be loaded from the server
						// we now ignore this and know that the stylesheet doesn't exists => trigger error
					}
					// no rules means error
					if (aRules && aRules.length > 0) {
						fnLoadOrg();
					} else {
						fnError();
					}
				};
			}

			jQuery(oLink).load(fnLoad);
			jQuery(oLink).error(fnError);
			return oLink;

		};

		// check for existence of the link
		var oOld = document.getElementById(mAttributes && mAttributes.id);
		var oLink = _createLink(sUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		if (oOld && oOld.tagName === "LINK" && oOld.rel === "stylesheet") {
			// link exists, so we replace it - but only if a callback has to be attached or if the href will change. Otherwise don't touch it
			if (typeof fnLoadCallback === "function" || typeof fnErrorCallback === "function" ||
				oOld.href !== oLink.href) {
				// if the attribute "data-sap-ui-foucmarker" exists and the value
				// matches the id of the new link the new link will be put
				// before the old link into the document and the id attribute
				// will be removed from the old link (to avoid FOUC)
				// => sap/ui/core/ThemeCheck removes these old links again once
				//    the new theme has been fully loaded
				if (oOld.getAttribute("data-sap-ui-foucmarker") === oLink.id) {
					jQuery(oOld).removeAttr("id").before(oLink);
				} else {
					jQuery(oOld).replaceWith(oLink);
				}
			} else {
				// in case of using without callbacks and applying the same URL
				// the foucmarker has to be removed as the link will not be
				// replaced with another link - otherwise the ThemeCheck would
				// remove this link
				if (oOld.getAttribute("data-sap-ui-foucmarker") === oLink.id) {
					oOld.removeAttribute("data-sap-ui-foucmarker");
				}
			}
		} else {
			oOld = jQuery('#sap-ui-core-customcss');
			if (oOld.length > 0) {
				oOld.first().before(oLink);
			} else {
				appendHead(oLink);
			}
		}

	}

	return function includeStyleSheet(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		var mAttributes;
		if (typeof vUrl === "string") {
			mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeStyleSheet(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			mAttributes = cloneMap(vUrl.attributes);
			if (vUrl.id) {
				mAttributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeStyleSheet(vUrl.url, mAttributes, fnResolve, fnReject);
			});
		}
	};

});
