/*!
 * ${copyright}
 */

sap.ui.define([

], (

) => {
	"use strict";

	const pLoaded = new Promise((res, rej) => {
		sap.ui.require(["sap/ui/core/Lib"], function(Library) {
			Library.load({
				name: "sap.ui.testlib",
				url: "test-resources/sap/ui/core/qunit/testdata/uilib"
			}).then(() => {
				res();
			});
		});
	});
	return {
		run: () => {
			return pLoaded;
		}
	};
});