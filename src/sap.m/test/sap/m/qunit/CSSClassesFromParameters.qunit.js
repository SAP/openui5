/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	QUnit.test("Check Blue Crystal theme", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			var cell = jQuery.sap.domById("cell1");
			assert.equal(window.getComputedStyle(cell).color, "rgb(0, 0, 0)", "the text color of cell 1 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgb(242, 242, 242)", "the background color of cell 1 should be correct");

			cell = jQuery.sap.domById("cell2");
			assert.equal(window.getComputedStyle(cell).color, "rgb(242, 242, 242)", "the text color of cell 2 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgb(0, 0, 0)", "the background color of cell 2 should be correct");

			cell = jQuery.sap.domById("cell3");
			assert.equal(window.getComputedStyle(cell).color, "rgb(102, 102, 102)", "the text color of cell 3 should be correct");
			assert.equal(window.getComputedStyle(cell).backgroundColor, "rgb(242, 242, 242)", "the background color of cell 3 should be correct");
			done();
		}, 1000);
	});

});