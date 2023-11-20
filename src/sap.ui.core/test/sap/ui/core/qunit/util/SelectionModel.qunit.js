/* global QUnit */

sap.ui.define([
	"sap/ui/model/SelectionModel"
], function (SelectionModel) {
	"use strict";

	var oSelectionModel;

	function check(sCaption, fnChange, aIndices, iLeadSelection, bEvent, bAll) {

		QUnit.test(sCaption, function(assert) {

			var oEventParams;
			var aDiff;
			var aIndicesAfter;
			var aIndicesBefore;

			function listener(oEvent) {
				oEventParams = Object.assign({}, oEvent.getParameters());
			}

			if ( fnChange ) {

				aIndicesBefore = oSelectionModel.getSelectedIndices().slice();

				oSelectionModel.attachSelectionChanged(listener);
				fnChange.apply(oSelectionModel);
				oSelectionModel.detachSelectionChanged(listener);

				aIndicesAfter = oSelectionModel.getSelectedIndices().slice();

				aDiff = [];
				for (var i = 0; i < aIndicesBefore.length; i++) {
					if ( aIndicesAfter.indexOf(aIndicesBefore[i]) < 0 ) {
						aDiff.push(aIndicesBefore[i]);
					}
				}
				for (var i = 0; i < aIndicesAfter.length; i++) {
					if ( aIndicesBefore.indexOf(aIndicesAfter[i]) < 0 ) {
						aDiff.push(aIndicesAfter[i]);
					}
				}
				aDiff = aDiff.sort(function(a, b) { return a - b; });

			}

			assert.equal(oSelectionModel.getMinSelectionIndex(), aIndices.length ? aIndices[0] : -1, "expected min value");
			assert.equal(oSelectionModel.getMaxSelectionIndex(), aIndices.length ? aIndices[aIndices.length - 1] : -1, "expected max value");
			assert.deepEqual(aIndices, oSelectionModel.getSelectedIndices(), "expected final indices");
			assert.equal(oSelectionModel.getLeadSelectedIndex(), iLeadSelection, "expected lead selection");

			if ( fnChange ) {
				if ( bEvent === true ) {
					assert.ok(!!oEventParams, "a SelectionChanged event should have been fired");
					assert.deepEqual(oEventParams.rowIndices, aDiff, "rowindices should match the difference between before and after");
					assert.equal(oEventParams.selectAll, bAll, "selectAll indicator");
				} else if ( Array.isArray(bEvent) && bEvent.length === 0 ) {
					assert.ok(!!oEventParams, "a SelectionChanged event should have been fired");
					assert.deepEqual(oEventParams.rowIndices, aDiff, "rowindices should match the difference between before and after");
					assert.deepEqual(aDiff, [], "difference should be empty (lead selection change)");
				} else {
					assert.ok(!oEventParams, "no SelectionChanged event should have been fired");
					assert.deepEqual([], aDiff, "diff should be empty");
				}
			}
		});
	}


	QUnit.module("multi selection");

	oSelectionModel = new SelectionModel(SelectionModel.MULTI_SELECTION);

	check("initial selection", null, [], -1, false);

	check("set interval initially (12,15)", function() {
		this.setSelectionInterval(12, 15);
	}, [12,13,14,15], 15, true);

	check("set interval, non overlapping (2,10)", function() {
		this.setSelectionInterval(2, 10);
	}, [2,3,4,5,6,7,8,9,10], 10, true);

	check("set interval (left part 2,8)", function() {
		this.setSelectionInterval(2, 8);
	}, [2,3,4,5,6,7,8], 8, true);

	check("set interval (right part, 4,8)", function() {
		this.setSelectionInterval(4, 8);
	}, [4,5,6,7,8], 8, true);

	check("set interval (inner part 5,7)", function() {
		this.setSelectionInterval(5, 7);
	}, [5,6,7], 7, true);

	check("set interval, ext. to left (3,7)", function() {
		this.setSelectionInterval(3, 7);
	}, [3,4,5,6,7], 7, true);

	check("set interval, ext. to right (3,9)", function() {
		this.setSelectionInterval(3, 9);
	}, [3,4,5,6,7,8,9], 9, true);

	check("set interval, ext. both (1,12)", function() {
		this.setSelectionInterval(1, 12);
	}, [1,2,3,4,5,6,7,8,9,10,11,12], 12, true);

	check("set interval, no change", function() {
		this.setSelectionInterval(1, 12);
	}, [1,2,3,4,5,6,7,8,9,10,11,12], 12, false);

	check("selectAll", function() {
		this.selectAll(12);
	}, [0,1,2,3,4,5,6,7,8,9,10,11,12], 0, true, true);

	check("clearSelection", function() {
		this.clearSelection();
	}, [], -1, true);

	check("add interval initially (12,15)", function() {
		this.addSelectionInterval(12, 15);
	}, [12,13,14,15], 15, true);

	check("add interval, non overlapping (2,10)", function() {
		this.addSelectionInterval(2, 10);
	}, [2,3,4,5,6,7,8,9,10,12,13,14,15], 10, true);

	check("add interval, overlapping (6,13)", function() {
		this.addSelectionInterval(6, 13);
	}, [2,3,4,5,6,7,8,9,10,11,12,13,14,15], 13, true);

	check("add interval, contained (11,13)", function() {
		this.addSelectionInterval(11, 13);
	}, [2,3,4,5,6,7,8,9,10,11,12,13,14,15], 13, false);

	check("add interval, contained + lead sel. (6,9)", function() {
		this.addSelectionInterval(6,9);
	}, [2,3,4,5,6,7,8,9,10,11,12,13,14,15], 9, []);

	check("rem. inner interval (6,8)", function() {
		this.removeSelectionInterval(6,8);
	}, [2,3,4,5,9,10,11,12,13,14,15], 9, true);

	check("rem. left interval (2,4)", function() {
		this.removeSelectionInterval(2,4);
	}, [5,9,10,11,12,13,14,15], 9, true);

	check("rem. right interval (12,15)", function() {
		this.removeSelectionInterval(12,15);
	}, [5,9,10,11], 9, true);

	check("rem. lead selection (9,9)", function() {
		this.removeSelectionInterval(9,9);
	}, [5,10,11], -1, true);

	check("rem. non exist. interval (12,20)", function() {
		this.removeSelectionInterval(12,20);
	}, [5,10,11], -1, false);

	check("clearSelection", function() {
		this.clearSelection();
	}, [], -1, true);

	check("add interval initially (0,15)", function() {
		this.addSelectionInterval(0, 15);
	}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,13,14,15], 15, true);

	check("slice exist. interval (5,8)", function() {
		this.sliceSelectionInterval(5,8);
	}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 11, true);

	check("slice non exist. interval (13,15)", function() {
		this.sliceSelectionInterval(13,15);
	}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 11, false);

	check("slice inversed interval (5,0)", function() {
		this.sliceSelectionInterval(5,0);
	}, [0, 1, 2, 3, 4, 5], 5, true);

	check("slice end overlapping (4,8)", function() {
		this.sliceSelectionInterval(4,8);
	}, [0, 1, 2, 3], -1, true);

	check("clearSelection", function() {
		this.clearSelection();
	}, [], -1, true);

	check("add interval initially (0,3)", function() {
		this.addSelectionInterval(0, 3);
	}, [0, 1, 2, 3], 3, true);

	check("add interval initially (20,25)", function() {
		this.addSelectionInterval(20, 25);
	}, [0, 1, 2, 3, 20, 21, 22, 23, 24, 25], 25, true);

	check("slice middle (2,22)", function() {
		this.sliceSelectionInterval(2,22);
	}, [0, 1, 2, 3, 4], 4, true);

	check("move interval", function() {
		this.moveSelectionInterval(1,4);
	}, [0, 5, 6, 7, 8], 8, true);
});