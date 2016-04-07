/*!
 * ${copyright}
 */

/**
 * @fileOverview Base component which provides a custom extension point for proxy functionality.
 *
 * @version @version@
 */
sap.ui.define([
		'sap/ui/core/UIComponent',
		'sap/ui/thirdparty/sinon'
	], function (UIComponent, sinon) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.common.Component", {
		exit : function () {
			var i;

			for (i = 0; i < this.aMockServers.length; i++) {
				this.aMockServers[i].destroy();
			}
			this.oSandbox.restore();
		},

		init : function () {
			// initialization has to be done here because parent.init() calls createContent()
			this.aMockServers = [];
			this.oSandbox = sinon.sandbox.create();
			UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Default implementation to invoke a proxy for the given absolute path.
		 *
		 * <b>Custom extension point ("hook") intended to be overridden!</b>
		 *
		 * @param {string} sAbsolutePath
		 *   some absolute path
		 * @returns {string}
		 *   the absolute path transformed in a way that invokes a proxy
		 */
		proxy : function (sAbsolutePath) {
			if (location.hostname !== "localhost") {
				alert("Cannot use a proxy for hosts other than localhost!"); // eslint-disable-line
				return sAbsolutePath;
			}

			// for local testing prefix with proxy
			return "proxy" + sAbsolutePath;
		}
	});

	return Component;
});
