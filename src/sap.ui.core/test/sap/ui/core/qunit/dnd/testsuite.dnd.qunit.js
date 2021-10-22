sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/DND",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			DragAndDrop: {
				title: "QUnit tests 'DragAndDrop' of suite 'dnd'"
			},
			DragDropInfo: {
				title: "QUnit tests 'DragDropInfo' of suite 'dnd'"
			}
		}
	};
});
