/*global QUnit */
sap.ui.define([
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
], function(
	IconTabBar,
	IconTabFilter,
	Button,
	KeyCodes,
	Core,
	jQuery
) {
	"use strict";

	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function() {
		return Date.now();
	};

	QUnit.module("Drag&Drop: RTL", {
		beforeEach: function() {
			this.oIconTabBar = new IconTabBar({
				enableTabReordering: true,
				items: [
					new IconTabFilter({
						id: 'tabReorder1',
						text: "First tab",
						count: "3",
						content: [
							new Button({ text: "Text 1" })
						]
					}),
					new IconTabFilter({
						id: 'tabReorder2',
						text: "Second tab",
						count: "1",
						content: [
							new Button({ text: "Text 2" })
						]
					}),
					new IconTabFilter({
						id: 'tabReorder3',
						text: "Third tab",
						count: "Count",
						content: [
							new Button({ text: "Text 3" })
						]
					})
				]
			});

			this.oIconTabBar1 = new IconTabBar({
				items: [
					new IconTabFilter({
						id: 'tab1',
						text: "First tab",
						count: "3",
						content: [
							new Button({ text: "Text 1" })
						]
					}),
					new IconTabFilter({
						id: 'tab2',
						text: "Second tab",
						count: "1",
						content: [
							new Button({ text: "Text 2" })
						]
					})
				]
			});

			this.oIconTabBar.placeAt('qunit-fixture');
			this.oIconTabBar1.placeAt('qunit-fixture');
			Core.applyChanges();

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  Core.byId("tabReorder1");
						case "droppedControl" :
							return Core.byId("tabReorder3");
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  Core.byId("tabReorder1");
						case "droppedControl" :
							return Core.byId("tabReorder3");
					}
				}
			};

			this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: Core.byId(sId)
				};

				return oMockEventTest;
			};
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oIconTabHeader1 = this.oIconTabBar1.getAggregation("_header");
		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oIconTabBar1.destroy();
			this.oIconTabHeader1.destroy();
			this.oIconTabBar = null;
			this.oIconTabHeader = null;
			this.oIconTabBar1 = null;
			this.oIconTabHeader1 = null;
			this.returnMockEvent = null;
			this.oMockEvent = null;
			this.oMockEvent2 = null;
		}
	});

	QUnit.test("Drag&Drop dropPosition: 'After' RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", "'Firs tab' is at last position");
	});

	QUnit.test("Drag&Drop dropPosition: 'Before' RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", "'First tab' is at the middle");
	});

	QUnit.test("Drag&Drop accessibility: RTL", function(assert) {
		// Assert
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT,"tabReorder2"));
		this.oIconTabHeader1.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT,"tab2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right of last element RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT,"tabReorder3"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Second tab", 'Third Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left of first element RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", 'Second Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'Fisrt Tab is "Fisrt Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Home RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.HOME,"tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", 'Second Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + End RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.END,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", 'First Tab is "Last Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});

});