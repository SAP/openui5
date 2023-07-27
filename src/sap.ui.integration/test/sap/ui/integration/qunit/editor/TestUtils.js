/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils"
], function(
	qutils
) {
	"use strict";

	var TestUtils = {

		isReady: function(oEditor) {
			return new Promise(function(resolve) {
				oEditor.attachReady(function() {
					resolve();
				});
			});
		},

		openColumnMenu: function(oColumn) {
			return new Promise(function(resolve) {
				oColumn.attachEventOnce("columnMenuOpen", function() {
					resolve();
				});
				var oElement = oColumn.getDomRef();
				qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
				qutils.triggerMouseEvent(oElement, "click");
			});
		},

		tableUpdated: function(oField) {
			return new Promise(function(resolve) {
				oField.attachEventOnce("tableUpdated", function() {
					resolve();
				});
			});
		}
	};

	return TestUtils;
});