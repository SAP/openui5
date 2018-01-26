/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global Promise */
sap.ui.define(["sap/ui/Device", "sap/ui/dom/appendHead", "sap/ui/thirdparty/URI", "sap/base/assert"],
	function(Device, appendHead, URI, assert) {
	"use strict";

	var Device = sap.ui.Device; // @evo-todo

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
				if (fnErrorCallback) {
					fnErrorCallback();
				}
			};

			var fnLoad = function() {
				jQuery(oLink).attr("data-sap-ui-ready", "true").off("load");
				if (fnLoadCallback) {
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
		var oLink = _createLink(sUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		var oOld = document.getElementById(mAttributes && mAttributes.id);
		if (oOld && oOld.tagName === "LINK" && oOld.rel === "stylesheet") {
			// link exists, so we replace it - but only if a callback has to be attached or if the href will change. Otherwise don't touch it
			if (fnLoadCallback || fnErrorCallback || oOld.href !== URI(String(sUrl), URI().search("") /* returns current URL without search params */ ).toString()) {
				jQuery(oOld).replaceWith(oLink);
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
		if (typeof vUrl === "string") {
			var mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeStyleSheet(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			if (vUrl.id) {
				vUrl.attributes = vUrl.attributes || {};
				vUrl.attributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeStyleSheet(vUrl.url, vUrl.attributes, fnResolve, fnReject);
			});
		}
	};

});
