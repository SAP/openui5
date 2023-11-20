/*!
 * ${copyright}
 */

/**
 * @fileOverview Base component which provides a custom extension point for mocking functionality.
 *
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon"
], function (UIComponent, sinon) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.common.Component", {
		exit : function () {
			var i;

			for (i = 0; i < this.aMockServers.length; i += 1) {
				this.aMockServers[i].destroy();
			}
			this.oSandbox.restore();
		},

		init : function () {
			// initialization has to be done here because parent.init() calls createContent()
			this.aMockServers = [];
			this.oSandbox = sinon.sandbox.create();
			UIComponent.prototype.init.apply(this, arguments);
		}
	});

	return Component;
});
