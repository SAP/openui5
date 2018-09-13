/* global QUnit */
sap.ui.define(['require'],function (require) {
	"use strict";

	QUnit.test("invisible iframe returns null", function (assert) {

		var fnDone = assert.async();

		var bThrowedError = false;
		window.onerror = function(){
			bThrowedError = true;
		};

		var oIFrame = document.createElement("iframe");
		oIFrame.setAttribute("src", require.toUrl("./ComputedStyle-IFrame.html"));
		oIFrame.style.display = 'none';
		document.body.appendChild(oIFrame);

		oIFrame.onload = function(){
			assert.ok(!bThrowedError, "The returned Object Type of getComputedStyle has to match the CSS2Properties Object");
			fnDone();
		};
	});
});