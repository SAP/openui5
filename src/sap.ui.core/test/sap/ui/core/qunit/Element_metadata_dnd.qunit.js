/*global QUnit*/
sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {

	"use strict";

	QUnit.module("DragAndDrop");

	QUnit.test("Default dragDropInfo", function(assert) {
		var TestElement = Element.extend("my.TestElement1", {
			metadata: {
				aggregations : {
					items: { type: "sap.ui.core.Control", multiple: true },
					header : {type : "sap.ui.core.Control", multiple : false },
					_hiddenM : {type : "sap.ui.core.Control", multiple : true, visibility : "hidden" },
					_hiddenS : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden" }
				}
			}
		});
		var TestElementMetadata = TestElement.getMetadata();

		assert.deepEqual(TestElementMetadata.getDragDropInfo(), {draggable: false, droppable: false});
		assert.deepEqual(TestElementMetadata.getDragDropInfo("items"), {draggable: false, droppable: false, layout: "Vertical"});
		assert.deepEqual(TestElementMetadata.getDragDropInfo("header"), {draggable: false, droppable: false, layout: "Vertical"});
		assert.deepEqual(TestElementMetadata.getDragDropInfo("_hiddenM"), {draggable: false, droppable: false, layout: "Vertical"});
		assert.deepEqual(TestElementMetadata.getDragDropInfo("_hiddenS"), {draggable: false, droppable: false, layout: "Vertical"});
		assert.deepEqual(TestElementMetadata.getDragDropInfo("nonexisting"), {});
	});

	QUnit.test("Custom dragDropInfo", function(assert) {
		var TestElement = Element.extend("my.TestElement2", {
			metadata: {
				dnd : { draggable: false, droppable: true },
				aggregations : {
					items : { type: "sap.ui.core.Control", multiple: true, dnd : { draggable: true, droppable: false, layout: "Horizontal" } },
					content : { type: "sap.ui.core.Control", multiple: true, dnd : true },
					header : {type : "sap.ui.core.Control", multiple : false, dnd : false },
					_hidden : {type : "sap.ui.core.Control", multiple : true, visibility : "hidden", dnd : { draggable: false, droppable: true, layout: "Horizontal" }}
				}
			}
		});
		var TestElementMetadata = TestElement.getMetadata();

		assert.deepEqual(TestElementMetadata.getDragDropInfo(), { draggable: false, droppable: true });
		assert.deepEqual(TestElementMetadata.getDragDropInfo("items"), { draggable: true, droppable: false, layout: "Horizontal" } );
		assert.deepEqual(TestElementMetadata.getDragDropInfo("header"), { draggable: false, droppable: false, layout: "Vertical" } );
		assert.deepEqual(TestElementMetadata.getDragDropInfo("content"), { draggable: true, droppable: true, layout: "Vertical" } );
		assert.deepEqual(TestElementMetadata.getDragDropInfo("_hidden"), { draggable: false, droppable: true, layout: "Horizontal" } );
	});

});