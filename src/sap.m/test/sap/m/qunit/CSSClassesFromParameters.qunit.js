/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	QUnit.test("Check Horizon theme", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			var cell = document.getElementById("cell1");
			assert.equal(window.getComputedStyle(cell).color, "rgb(29, 45, 62)", "the text color of cell 1 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgb(245, 246, 247)", "the background color of cell 1 should be correct");

			cell = document.getElementById("cell2");
			assert.equal(window.getComputedStyle(cell).color, "rgb(245, 246, 247)", "the text color of cell 2 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgb(29, 45, 62)", "the background color of cell 2 should be correct");

			cell = document.getElementById("cell3");
			assert.equal(window.getComputedStyle(cell).color, "rgb(255, 0, 0)", "the text color of cell 3 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgba(0, 0, 0, 0)", "the background color of cell 3 should be correct");
			done();
		}, 1000);
	});

});