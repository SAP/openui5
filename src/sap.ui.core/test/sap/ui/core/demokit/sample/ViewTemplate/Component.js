/*!
 * ${copyright}
 */

/**
 * @fileOverview Base component which provides a custom extension point for proxy functionality.
 *
 * @version @version@
 */
sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/UIComponent'
	], function (MessageBox, UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ViewTemplate.Component", {
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
				MessageBox.alert("Cannot use a proxy for hosts other than localhost!", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error"});
				return sAbsolutePath;
			}

			// for local testing prefix with proxy
			return "proxy" + sAbsolutePath;
		}
	});

	return Component;
});
