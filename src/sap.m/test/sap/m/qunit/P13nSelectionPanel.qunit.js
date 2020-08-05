/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nSelectionPanel",
	"sap/m/library",
	"sap/m/P13nItem",
	"sap/m/P13nSelectionItem",
	"sap/ui/model/json/JSONModel"
], function(
	qutils,
	createAndAppendDiv,
	P13nSelectionPanel,
	mobileLibrary,
	P13nItem,
	P13nSelectionItem,
	JSONModel
) {
	"use strict";

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = mobileLibrary.P13nPanelType;


	// prepare DOM
	createAndAppendDiv("content");



	// =========================================================== //
	// Check UX requirements on                                    //
	// =========================================================== //

	// =========================================================== //
	// API module                                                  //
	// =========================================================== //

	QUnit.module("sap.m.P13nSelectionPanel: constructor - items", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	// ------------------------------ //
	// tests for default values       //
	// ------------------------------ //
	QUnit.test("[]", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel({
			items: []
		});

		// assertions
		assert.strictEqual(oSelectionPanel.getTitle(), "");
		assert.strictEqual(oSelectionPanel.getTitleLarge(), "");
		assert.strictEqual(oSelectionPanel.getType(), P13nPanelType.selection);
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oSelectionPanel.getItems().length, 3);
		assert.deepEqual(oSelectionPanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[]; addItem", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel();
		var oItemA = new P13nItem({
			columnKey: "keyA",
			text: "A"
		}), oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B"
		}), oItemC = new P13nItem({
			columnKey: "keyC",
			text: "C"
		});
		oSelectionPanel.addItem(oItemC);
		oSelectionPanel.addItem(oItemB);
		oSelectionPanel.addItem(oItemA);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oSelectionPanel.getItems().length, 3);
		assert.deepEqual(oSelectionPanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]; insertItem", function (assert) {
		// system under test
		var oItemA, oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B"
		}), oItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// act
		oSelectionPanel.insertItem(oItemB, 1);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oSelectionPanel.getItems().length, 3);
		assert.deepEqual(oSelectionPanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]; removeItem", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// act
		var oItem = oSelectionPanel.removeItem(oItemB);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oItem, oItemB);
		assert.strictEqual(oSelectionPanel.getItems().length, 2);
		assert.deepEqual(oSelectionPanel.getItems(), [
			oItemC, oItemA
		]);
		// The table items order has been changed to: A, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]; removeItem dummy", function (assert) {
		// system under test
		var oItemA, oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B"
		}), oItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// act
		var oItem = oSelectionPanel.removeItem(oItemB);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oItem, null);
		assert.strictEqual(oSelectionPanel.getItems().length, 2);
		assert.deepEqual(oSelectionPanel.getItems(), [
			oItemC, oItemA
		]);
		// The table items order has been changed to: A, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]; removeAllItems", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// act
		var aItems = oSelectionPanel.removeAllItems();

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(aItems, [
			oItemC, oItemB, oItemA
		]);
		assert.strictEqual(oSelectionPanel.getItems().length, 0);
		// The table items order has been changed to: []
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items").length, 0);
		// The table selection is: []

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems]; destroyItems", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// act
		oSelectionPanel.destroyItems();

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oSelectionPanel.getItems().length, 0);
		// The table items order has been changed to: []
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items").length, 0);
		// The table selection is: []

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.module("sap.m.P13nSelectionPanel: constructor - selectionItems", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("[]", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: []
		});

		// assertions
		assert.strictEqual(oSelectionPanel.getTitle(), "");
		assert.strictEqual(oSelectionPanel.getTitleLarge(), "");
		assert.strictEqual(oSelectionPanel.getType(), P13nPanelType.selection);
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems]", function (assert) {
		// system under test
		var oSelectionItem;
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				oSelectionItem = new P13nSelectionItem({
					columnKey: "keyA",
					selected: true
				})
			]
		});

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItem]);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[]; addSelectionItem", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel();
		var oSelectionItem = new P13nSelectionItem({
			columnKey: "keyA",
			selected: true
		});
		oSelectionPanel.addSelectionItem(oSelectionItem);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItem]);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[]; insertSelectionItem", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel();
		var oSelectionItem = new P13nSelectionItem({
			columnKey: "keyA",
			selected: true
		});
		oSelectionPanel.insertSelectionItem(oSelectionItem);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItem]);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems]; removeSelectionItem", function (assert) {
		// system under test
		var oSelectionItemA;
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				oSelectionItemA = new P13nSelectionItem({
					columnKey: "keyA",
					selected: true
				})
			]
		});

		//act
		var oSelectionItem = oSelectionPanel.removeSelectionItem(oSelectionItemA);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oSelectionItem, oSelectionItemA);
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems]; removeSelectionItem dummy", function (assert) {
		// system under test
		var oSelectionItemA = new P13nSelectionItem({
			columnKey: "keyA",
			selected: true
		}), oSelectionItemB;
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				oSelectionItemB = new P13nSelectionItem({
					columnKey: "keyB",
					selected: true
				})
			]
		});

		//act
		var oSelectionItem = oSelectionPanel.removeSelectionItem(oSelectionItemA);

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oSelectionItem, null);
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItemB]);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems]; removeAllSelectionItems", function (assert) {
		// system under test
		var oSelectionItemA;
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				oSelectionItemA = new P13nSelectionItem({
					columnKey: "keyA",
					selected: true
				})
			]
		});

		//act
		var aSelectionItems = oSelectionPanel.removeAllSelectionItems();

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(aSelectionItems, [oSelectionItemA]);
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems]; destroySelectionItems", function (assert) {
		// system under test
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				new P13nSelectionItem({
					columnKey: "keyA",
					selected: true
				})
			]
		});

		//act
		oSelectionPanel.destroySelectionItems();

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oSelectionPanel.getItems(), []);
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);
		assert.deepEqual(oSelectionPanel._getInternalModel().getProperty("/items"), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.module("sap.m.P13nSelectionPanel: constructor - items and selectionItems", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("[aItems], [aSelectionItems]", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC, oSelectionItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			],
			selectionItems: [
				oSelectionItemC = new P13nSelectionItem({
					columnKey: "keyC",
					selected: true
				})
			]
		});

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order is: C, B, A
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: C=on, B=off, A=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, true);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// SelectionItem has not been changed
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItemC]);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aSelectionItems], [aItems]", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC, oSelectionItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			selectionItems: [
				oSelectionItemC = new P13nSelectionItem({
					columnKey: "keyC",
					selected: true
				})
			],
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			]
		});

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order is: C, B, A
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: C=on, B=off, A=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, true);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// SelectionItem has not been changed
		assert.deepEqual(oSelectionPanel.getSelectionItems(), [oSelectionItemC]);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.test("[aItems], [aSelectionItems]; removeSelectionItem", function (assert) {
		// system under test
		var oItemA, oItemB, oItemC;
		var oSelectionItemC;
		var oSelectionPanel = new P13nSelectionPanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C"
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B"
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			],
			selectionItems: [
				oSelectionItemC = new P13nSelectionItem({
					columnKey: "keyC",
					selected: true
				})
			]
		});

		// arrange
		oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectionPanel.removeSelectionItem(oSelectionItemC);
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].columnKey, oItemA.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[0].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[1].persistentSelected, false);
		assert.strictEqual(oSelectionPanel._getInternalModel().getProperty("/items")[2].persistentSelected, false);

		// SelectionItem has been changed
		assert.deepEqual(oSelectionPanel.getSelectionItems(), []);

		// cleanup
		oSelectionPanel.destroy();
	});

	QUnit.module("sap.m.P13nSelectionPanel: select", {
		beforeEach: function () {
			this.oSelectionPanel = new P13nSelectionPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				selectionItems: {
					path: "/selectionItems",
					template: new P13nSelectionItem({
						columnKey: "{columnKey}",
						selected: "{selected}"
					})
				},
				changeSelectionItems: function (oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/selectionItems", oEvent.getParameter("items"));
				}
			});
		},
		afterEach: function () {
			this.oSelectionPanel.destroy();
		}
	});

	QUnit.test("â0 -> a0", function (assert) {
		this.oSelectionPanel.setModel(new JSONModel({
			items: [{
				columnKey: "keyA",
				text: "A"
			}],
			selectionItems: [{
				columnKey: "keyA",
				selected: true
			}]
		}));

		// arrange
		this.oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oCheckbox = this.oSelectionPanel._oTable.getItems()[0].$().find("input[type=checkbox]")[0];
		assert.ok(oCheckbox, "Columns A shall contain a CheckBox");
		sap.ui.test.qunit.triggerTouchEvent("tap", oCheckbox, {
			srcControl: this.oSelectionPanel
		});

		// assertions
		assert.strictEqual(this.oSelectionPanel.getSelectionItems().length, 1);
		assert.strictEqual(this.oSelectionPanel.getSelectionItems()[0].getSelected(), false);
	});

	QUnit.test("a0 -> â0", function (assert) {
		this.oSelectionPanel.setModel(new JSONModel({
			items: [{
				columnKey: "keyA",
				text: "A"
			}],
			selectionItems: []
		}));

		// arrange
		this.oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oCheckbox = this.oSelectionPanel._oTable.getItems()[0].$().find("input[type=checkbox]")[0];
		assert.ok(oCheckbox, "Columns A shall contain a CheckBox");
		sap.ui.test.qunit.triggerTouchEvent("tap", oCheckbox, {
			srcControl: this.oSelectionPanel
		});

		// assertions
		assert.strictEqual(this.oSelectionPanel.getSelectionItems().length, 1);
		assert.strictEqual(this.oSelectionPanel.getSelectionItems()[0].getSelected(), true);
	});

	// ER: move is not supported in P13nSelectionPanel
	//        QUnit.test("a0 -> a1", function (assert) {
	//        QUnit.test("a0 -> â1", function (assert) {
	//        QUnit.test("â0 -> â1", function (assert) {
	//        QUnit.test("â0 -> a1", function (assert) {

	QUnit.module("sap.m.P13nSelectionPanel: search", {
		beforeEach: function () {
			this.oSelectionPanel = new P13nSelectionPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				selectionItems: {
					path: "/selectionItems",
					template: new P13nSelectionItem({
						columnKey: "{columnKey}",
						selected: "{selected}"
					})
				},
				changeSelectionItems: function (oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/selectionItems", oEvent.getParameter("items"));
				}
			});
		},
		afterEach: function () {
			this.oSelectionPanel.destroy();
		}
	});

	QUnit.test("enter text", function (assert) {
		this.oSelectionPanel.setModel(new JSONModel({
			items: [{
				columnKey: "keyA",
				text: "A foo"

			}, {
				columnKey: "keyB",
				text: "B foo"
			}, {
				columnKey: "keyC",
				text: "C"
			}],
			selectionItems: [{
				columnKey: "keyA",
				selected: true
			}, {
				columnKey: "keyB",
				selected: true
			}]
		}));

		// arrange
		this.oSelectionPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		this.oSelectionPanel._getSearchField().setValue("foo");
		sap.ui.test.qunit.triggerTouchEvent("touchend", this.oSelectionPanel._getSearchField().$().find(".sapMSFS")[0], {
			srcControl: this.oSelectionPanel._getSearchField()
		});
		this.clock.tick(500);

		// assertions
		assert.equal(this.oSelectionPanel.$().find("table").length, 1);
		assert.equal(this.oSelectionPanel.$().find("tr").length, 4); //header + 3 items
		assert.equal(this.oSelectionPanel.$().find("tr")[0].style.display, ""); // header
		assert.equal(this.oSelectionPanel.$().find("tr")[1].style.display, "");
		assert.equal(this.oSelectionPanel.$().find("tr")[2].style.display, "");
		assert.equal(this.oSelectionPanel.$().find("tr").eq(3).css("display"), "none");

		assert.equal(this.oSelectionPanel.$().find("tr").find("input:CheckBox").length, 3); // visible checkboxes - header + 2 items
		assert.equal(this.oSelectionPanel.$().find("tr").find("input:CheckBox")[0].checked, false); // header
		assert.equal(this.oSelectionPanel.$().find("tr").find("input:CheckBox")[1].checked, true);
		assert.equal(this.oSelectionPanel.$().find("tr").find("input:CheckBox")[2].checked, true);

		assert.equal(this.oSelectionPanel.$().find("tr").find("a").length, 2); // 1 cell * 2 items
		assert.equal(this.oSelectionPanel.$().find("tr").find("a")[0].textContent, "A foo");
		assert.equal(this.oSelectionPanel.$().find("tr").find("a")[1].textContent, "B foo");
	});

	QUnit.module("sap.m.P13nSelectionPanel: structure of getOkPayload and 'changeSelectionItems' event", {
		beforeEach: function () {
			this.oSelectionPanel = new P13nSelectionPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				selectionItems: {
					path: "/selectionItems",
					template: new P13nSelectionItem({
						columnKey: "{columnKey}",
						selected: "{selected}"
					})
				}
			});
			this.oSelectionPanel.setModel(new JSONModel({
				items: [{
					columnKey: "keyA",
					text: "A foo"

				}, {
					columnKey: "keyB",
					text: "B foo"
				}, {
					columnKey: "keyC",
					text: "C"
				}],
				selectionItems: [{
					columnKey: "keyA",
					selected: true
				}, {
					columnKey: "keyB",
					selected: true
				}]
			}));

			// arrange
			this.oSelectionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

		},
		afterEach: function () {
			this.oSelectionPanel.destroy();
		}
	});

	QUnit.test("getOkPayload", function (assert) {
		// act
		var oCheckbox = this.oSelectionPanel._oTable.getItems()[0].$().find("input[type=checkbox]")[0];
		assert.ok(oCheckbox, "Columns A shall contain a CheckBox");
		sap.ui.test.qunit.triggerTouchEvent("tap", oCheckbox, {
			srcControl: this.oSelectionPanel
		});

		// assert
		assert.deepEqual(this.oSelectionPanel.getOkPayload().selectionItems, [{
			columnKey: "keyA",
			selected: false
		}, {
			columnKey: "keyB",
			selected: true
		}, {
			columnKey: "keyC",
			selected: false
		}]);
	});

	QUnit.test("'changeSelectionItems' event", function (assert) {
		this.oSelectionPanel.attachChangeSelectionItems(function (oEvent) {
			// assert
			assert.deepEqual(oEvent.getParameter("items"), [{
				columnKey: "keyA",
				selected: false
			}, {
				columnKey: "keyB",
				selected: true
			}, {
				columnKey: "keyC",
				selected: false
			}]);
		});

		// act
		var oCheckbox = this.oSelectionPanel._oTable.getItems()[0].$().find("input[type=checkbox]")[0];
		assert.ok(oCheckbox, "Columns A shall contain a CheckBox");
		sap.ui.test.qunit.triggerTouchEvent("tap", oCheckbox, {
			srcControl: this.oSelectionPanel
		});
	});
});