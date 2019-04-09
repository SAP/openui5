sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/DND",
		defaults: {
			qunit: {
				version: 1
			},
			sinon: {
				version: 1
			}
		},
		tests: {
			DragAndDrop: {
				sinon: {
					version: 4
				},
				title: "QUnit tests 'DragAndDrop' of suite 'dnd'"
			},
			DragDropInfo: {
				title: "QUnit tests 'DragDropInfo' of suite 'dnd'"
			}
		}
	};
});
