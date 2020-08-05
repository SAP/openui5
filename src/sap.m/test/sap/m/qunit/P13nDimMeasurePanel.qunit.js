/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils", "sap/ui/qunit/utils/createAndAppendDiv", "sap/m/P13nDimMeasurePanel", "sap/m/library", "sap/m/P13nItem", "sap/m/P13nDimMeasureItem", "sap/ui/model/json/JSONModel", "sap/ui/events/jquery/EventExtension"
], function(qutils, createAndAppendDiv, P13nDimMeasurePanel, mobileLibrary, P13nItem, P13nDimMeasureItem, JSONModel, EventExtension) {
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

	QUnit.module("API");

	// ------------------------------ //
	// tests for default values       //
	// ------------------------------ //
	QUnit.test("constructor - items: []", function(assert) {

		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: []
		});

		// assertions
		assert.strictEqual(oDimMeasurePanel.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CHARTPANEL_TITLE"));
		assert.strictEqual(oDimMeasurePanel.getTitleLarge(), "");
		assert.strictEqual(oDimMeasurePanel.getType(), P13nPanelType.dimeasure);
		assert.strictEqual(oDimMeasurePanel.getChartTypeKey(), "");
		assert.deepEqual(oDimMeasurePanel.getAvailableChartTypes(), []);
		assert.deepEqual(oDimMeasurePanel.getItems(), []);
		assert.deepEqual(oDimMeasurePanel.getDimMeasureItems(), []);
		assert.deepEqual(oDimMeasurePanel._getInternalModel().getData().items, []);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems]", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				oItemC = new P13nItem({
					columnKey: "keyC",
					text: "C",
					visible: true
				}), oItemB = new P13nItem({
					columnKey: "keyB",
					text: "B",
					visible: false
				}), oItemA = new P13nItem({
					columnKey: "keyA",
					text: "A",
					visible: true
				})
			]
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oDimMeasurePanel.getItems().length, 3);
		assert.deepEqual(oDimMeasurePanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - [], addItem", function(assert) {

		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel();
		var oItemA = new P13nItem({
			columnKey: "keyA",
			text: "A"
		}), oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B",
			visible: false
		}), oItemC = new P13nItem({
			columnKey: "keyC",
			text: "C"
		});
		oDimMeasurePanel.addItem(oItemC);
		oDimMeasurePanel.addItem(oItemB);
		oDimMeasurePanel.addItem(oItemA);

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oDimMeasurePanel.getItems().length, 3);
		assert.deepEqual(oDimMeasurePanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], insertItem", function(assert) {

		// system under test
		var oItemA, oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B"
		}), oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
		oDimMeasurePanel.insertItem(oItemB, 1);

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oDimMeasurePanel.getItems().length, 3);
		assert.deepEqual(oDimMeasurePanel.getItems(), [
			oItemC, oItemB, oItemA
		]);
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], removeItem", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
		var oItem = oDimMeasurePanel.removeItem(oItemB);

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oItem, oItemB);
		assert.strictEqual(oDimMeasurePanel.getItems().length, 2);
		assert.deepEqual(oDimMeasurePanel.getItems(), [
			oItemC, oItemA
		]);
		// The table items order has been changed to: A, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], removeItem dummy", function(assert) {

		// system under test
		var oItemA, oItemB = new P13nItem({
			columnKey: "keyB",
			text: "B"
		}), oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
		var oItem = oDimMeasurePanel.removeItem(oItemB);

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oItem, null);
		assert.strictEqual(oDimMeasurePanel.getItems().length, 2);
		assert.deepEqual(oDimMeasurePanel.getItems(), [
			oItemC, oItemA
		]);
		// The table items order has been changed to: A, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], removeAllItems", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
		var aItems = oDimMeasurePanel.removeAllItems();

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(aItems, [
			oItemC, oItemB, oItemA
		]);
		assert.strictEqual(oDimMeasurePanel.getItems().length, 0);
		// The table items order has been changed to: []
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items.length, 0);
		// The table selection is: []

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], destroyItems", function(assert) {

		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
		oDimMeasurePanel.destroyItems();

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oDimMeasurePanel.getItems().length, 0);
		// The table items order has been changed to: []
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items.length, 0);
		// The table selection is: []

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], dimMeasureItems: [aDimMeasureItems]", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
			dimMeasureItems: [
				new P13nDimMeasureItem({
					columnKey: "keyC",
					index: 1,
					visible: true
				})
			]
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order has been changed to: C, A, B
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemB.getColumnKey());
		// The table selection is: C=on, A=off, B=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, true);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);
		// Index of DimMeasureItem has not been changed
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), 1);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - dimMeasureItems: [aDimMeasureItems], items: [aItems]", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			dimMeasureItems: [
				new P13nDimMeasureItem({
					columnKey: "keyC",
					visible: true,
					index: 1
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
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order has been changed to: C, A, B
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemC.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemB.getColumnKey());
		// The table selection is: C=on, A=off, B=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, true);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);
		// Index of DimMeasureItem has not been changed
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), 1);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("constructor - items: [aItems], dimMeasureItems: [aDimMeasureItems]", function(assert) {

		// system under test
		var oItemA, oItemB, oItemC;
		var oDimMeasureItemC;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
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
			dimMeasureItems: [
				oDimMeasureItemC = new P13nDimMeasureItem({
					columnKey: "keyC",
					index: 1,
					visible: true
				})
			]
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oDimMeasurePanel.removeDimMeasureItem(oDimMeasureItemC);
		sap.ui.getCore().applyChanges();

		// assertions
		// The table items order has been changed to: A, B, C
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].columnKey, oItemA.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].columnKey, oItemB.getColumnKey());
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].columnKey, oItemC.getColumnKey());
		// The table selection is: A=off, B=off, C=off
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[0].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[1].persistentSelected, undefined);
		assert.strictEqual(oDimMeasurePanel._getInternalModel().getData().items[2].persistentSelected, undefined);
		// Index of DimMeasureItem has not been changed
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 0);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: â0 -> a0", function(assert) {
		// system under test
		var oDimMeasureItemA;
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			],
			dimMeasureItems: [
				oDimMeasureItemA = new P13nDimMeasureItem({
					columnKey: "keyA",
					index: 0,
					visible: true
				})
			],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				oDimMeasurePanel.getDimMeasureItems()[0].setVisible(oEvent.getParameter("items")[0].visible);
				oDimMeasurePanel.getDimMeasureItems()[0].setIndex(oEvent.getParameter("items")[0].index);
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		qutils.triggerTouchEvent("tap", oDimMeasurePanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: oDimMeasurePanel
		});
		this.clock.tick(500);

		oDimMeasurePanel.getOkPayload();

		// assertions
		assert.equal(oDimMeasurePanel._oTable.getItems()[0].$().find("input:CheckBox")[0].checked, false);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0], oDimMeasureItemA);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getColumnKey(), "keyA");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getVisible(), false);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), -1);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: a0 -> â0", function(assert) {
		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				})
			],
			dimMeasureItems: [],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				oDimMeasurePanel.addDimMeasureItem(new P13nDimMeasureItem({
					columnKey: oEvent.getParameter("items")[0].columnKey,
					visible: oEvent.getParameter("items")[0].visible,
					index: oEvent.getParameter("items")[0].index
				}));
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		qutils.triggerTouchEvent("tap", oDimMeasurePanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: oDimMeasurePanel
		});
		this.clock.tick(500);

		oDimMeasurePanel.getOkPayload();

		// assertions
		assert.equal(oDimMeasurePanel._oTable.getItems()[0].$().find("input:CheckBox")[0].checked, true);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getColumnKey(), "keyA");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getVisible(), true);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), 0);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: a0 -> a1", function(assert) {
		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				}), new P13nItem({
					columnKey: "keyB",
					text: "B"
				})
			],
			dimMeasureItems: [],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				oDimMeasurePanel.addDimMeasureItem(new P13nDimMeasureItem({
					columnKey: oEvent.getParameter("items")[0].columnKey,
					visible: oEvent.getParameter("items")[0].visible,
					index: oEvent.getParameter("items")[0].index
				}));
				oDimMeasurePanel.addDimMeasureItem(new P13nDimMeasureItem({
					columnKey: oEvent.getParameter("items")[1].columnKey,
					visible: oEvent.getParameter("items")[1].visible,
					index: oEvent.getParameter("items")[1].index
				}));
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		oDimMeasurePanel.onPressButtonMoveDown();
		this.clock.tick(500);

		oDimMeasurePanel.getOkPayload();

		// assert
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 2);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: a0 -> â1", function(assert) {
		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				}), new P13nItem({
					columnKey: "keyB",
					text: "B"
				})
			],
			dimMeasureItems: [],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				this.destroyDimMeasureItems();
				oEvent.getParameter("items").forEach(function(oMItem) {
					this.addDimMeasureItem(new P13nDimMeasureItem({
						columnKey: oMItem.columnKey,
						visible: oMItem.visible,
						index: oMItem.index
					}));
				}, this);
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		qutils.triggerTouchEvent("tap", oDimMeasurePanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: oDimMeasurePanel
		});
		oDimMeasurePanel.onPressButtonMoveDown();
		this.clock.tick(500);

		oDimMeasurePanel.getOkPayload();

		// asserts
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 2);

		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getColumnKey(), "keyB");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getVisible(), undefined);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), -1); // default value of P13nDimMeasureItem

		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getColumnKey(), "keyA");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getVisible(), true);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getIndex(), 0);

		//            // test
		//            var oDimMeasurePanelT = new sap.m.P13nDimMeasurePanel({
		//                items: [
		//                    new sap.m.P13nItem({
		//                        columnKey: "keyA",
		//                        text: "A"
		//                    }),
		//                    new sap.m.P13nItem({
		//                        columnKey: "keyB",
		//                        text: "B"
		//                    })
		//                ],
		//                dimMeasureItems: oDimMeasurePanel.getDimMeasureItems()
		//            });
		//            oDimMeasurePanel.destroy();
		//            oDimMeasurePanelT.placeAt("content");
		//            sap.ui.getCore().applyChanges();
		//            this.clock.tick(500);
		//            // test end

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: â0 -> â1", function(assert) {
		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				}), new P13nItem({
					columnKey: "keyB",
					text: "B"
				})
			],
			dimMeasureItems: [
				new P13nDimMeasureItem({
					columnKey: "keyA",
					index: 0,
					visible: true
				})
			],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				this.destroyDimMeasureItems();
				oEvent.getParameter("items").forEach(function(oMItem) {
					this.addDimMeasureItem(new P13nDimMeasureItem({
						columnKey: oMItem.columnKey,
						visible: oMItem.visible,
						index: oMItem.index
					}));
				}, this);
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		oDimMeasurePanel.onPressButtonMoveDown();
		this.clock.tick(500);

		oDimMeasurePanel.getOkPayload();

		// assertions
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 2);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getColumnKey(), "keyB");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getVisible(), undefined);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), -1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getColumnKey(), "keyA");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getVisible(), true);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getIndex(), 0);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.test("getOkPayload: â0 -> a1", function(assert) {
		// system under test
		var oDimMeasurePanel = new P13nDimMeasurePanel({
			items: [
				new P13nItem({
					columnKey: "keyA",
					text: "A"
				}), new P13nItem({
					columnKey: "keyB",
					text: "B"
				})
			],
			dimMeasureItems: [
				new P13nDimMeasureItem({
					columnKey: "keyA",
					index: 0,
					visible: true
				})
			],
			changeDimMeasureItems: function(oEvent) {
				// At least enough for this test!
				this.destroyDimMeasureItems();
				oEvent.getParameter("items").forEach(function(oMItem) {
					this.addDimMeasureItem(new P13nDimMeasureItem({
						columnKey: oMItem.columnKey,
						visible: oMItem.visible,
						index: oMItem.index
					}));
				}, this);
			}
		});

		// arrange
		oDimMeasurePanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// act
		qutils.triggerTouchEvent("tap", oDimMeasurePanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: oDimMeasurePanel
		});
		oDimMeasurePanel.onPressButtonMoveDown();
		this.clock.tick(500);

		// assertions
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems().length, 2);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getColumnKey(), "keyB");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getVisible(), undefined);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[0].getIndex(), -1);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getColumnKey(), "keyA");
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getVisible(), false);
		assert.strictEqual(oDimMeasurePanel.getDimMeasureItems()[1].getIndex(), -1);

		// cleanup
		oDimMeasurePanel.destroy();
	});

	QUnit.module("sap.m.P13nDimMeasurePanel: FIX", {
		beforeEach: function() {
			this.oPanel = new P13nDimMeasurePanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}",
						aggregationRole: "{aggregationRole}"
					})
				},
				dimMeasureItems: {
					path: "/dimMeasureItems",
					template: new P13nDimMeasureItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				},
				changeDimMeasureItems: function(oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/dimMeasureItems", oEvent.getParameter("items"));
				}
			});
			this.oDataInitial = {
				items: [
					{
						columnKey: "keyC",
						text: "C",
						aggregationRole: "Measure"
					}, {
						columnKey: "keyB",
						text: "B",
						aggregationRole: "Dimension"
					}, {
						columnKey: "keyA",
						text: "A",
						aggregationRole: "Dimension"
					}
				],
				dimMeasureItems: [
					{
						columnKey: "keyA",
						index: 0,
						visible: true
					}, {
						columnKey: "keyB",
						index: 1,
						visible: true
					}
				]
			};
			this.oPanel.setModel(new JSONModel(jQuery.extend(true, {}, this.oDataInitial)));

			this.oPanel.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	QUnit.test("Reset after entered search text", function(assert) {
		// arrange: deselect first item "A", move it down, enter search text and click 'search'
		qutils.triggerTouchEvent("tap", this.oPanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: this.oPanel
		});
		this.oPanel.onPressButtonMoveDown();
		this.oPanel._getSearchField().setValue("dim");
		qutils.triggerTouchEvent("touchend", this.oPanel._getSearchField().$().find(".sapMSFS")[0], {
			srcControl: this.oPanel._getSearchField()
		});
		this.clock.tick(500);

		// asserts before act
		assert.equal(this.oPanel.$().find("table").length, 1);
		assert.equal(this.oPanel.$().find("tr").length, 4); //header + 3 items
		assert.equal(this.oPanel.$().find("tr")[0].style.display, ""); // header
		assert.equal(this.oPanel.$().find("tr")[1].style.display, "");
		assert.equal(this.oPanel.$().find("tr")[2].style.display, "");
		assert.equal(this.oPanel.$().find("tr").eq(3).css("display"), "none");

		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox").length, 3); // visible checkboxes - header + 2 items
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[0].checked, false); // header
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[1].checked, true);
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[2].checked, false);

		assert.equal(this.oPanel.$().find("tr").find("span").length, 15); // 3 header cells + 3 cells * 2 items (each item in sap.m.Select has 2 span/placeholders more for text and icon)
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "B");
		assert.equal(this.oPanel.$().find("tr").find("span")[9].textContent, "A");

		// act: Reset
		this.oPanel.getModel().setProperty("/", this.oDataInitial);
		this.clock.tick(500);

		// asserts after act
		assert.equal(this.oPanel.$().find("table").length, 1);
		assert.equal(this.oPanel.$().find("tr").length, 4); //header + 3 items
		assert.equal(this.oPanel.$().find("tr")[0].style.display, ""); // header
		assert.equal(this.oPanel.$().find("tr")[1].style.display, "");
		assert.equal(this.oPanel.$().find("tr")[2].style.display, "");
		assert.equal(this.oPanel.$().find("tr").eq(3).css("display"), "none");

		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox").length, 3); // visible checkboxes - header + 2 items
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[0].checked, false); // header
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[1].checked, true);
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[2].checked, true);

		assert.equal(this.oPanel.$().find("tr").find("span").length, 15); // 3 header cells + 3 cells * 2 items (each item in sap.m.Select has 2 span/placeholders more for text and icon)
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "A");
		assert.equal(this.oPanel.$().find("tr").find("span")[9].textContent, "B");
	});

	QUnit.test("Reset after 'Show Selected' clicked", function(assert) {
		// arrange: deselect first item "A", move it down and click 'Show Selected'
		qutils.triggerTouchEvent("tap", this.oPanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: this.oPanel
		});
		this.oPanel.onPressButtonMoveDown();
		// As the toolbar can be overflowed, no 'Show Selected' button can not have a dom reference
		var oEvent = jQuery.Event("ontap");
		var oButton = this.oPanel._getToolbar().getContent()[4];
		oButton.ontap.apply(oButton, [
			oEvent
		]);
		this.clock.tick(500);

		// asserts before act
		assert.equal(this.oPanel.$().find("table").length, 1);
		assert.equal(this.oPanel.$().find("tr").length, 4); //header + 3 (visible and invisible) items
		assert.equal(this.oPanel.$().find("tr")[0].style.display, ""); // header
		assert.equal(this.oPanel.$().find("tr")[1].style.display, "");
		assert.equal(this.oPanel.$().find("tr").eq(2).css("display"), "none");
		assert.equal(this.oPanel.$().find("tr").eq(3).css("display"), "none");

		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox").length, 2); // visible checkboxes - header + 1 items
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[0].checked, false); // header
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[1].checked, true);

		assert.equal(this.oPanel.$().find("tr").find("span").length, 9); // 3 header cells + 3 cells * 2 items (each item in sap.m.Select has 2 span/placeholders more for text and icon)
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "B");

		// act: Reset
		this.oPanel.getModel().setProperty("/", this.oDataInitial);
		this.clock.tick(500);

		// asserts after act
		assert.equal(this.oPanel.$().find("table").length, 1);
		assert.equal(this.oPanel.$().find("tr").length, 4); //header + 3 (visible and invisible) items
		assert.equal(this.oPanel.$().find("tr")[0].style.display, ""); // header
		assert.equal(this.oPanel.$().find("tr")[1].style.display, "");
		assert.equal(this.oPanel.$().find("tr")[2].style.display, "");
		assert.equal(this.oPanel.$().find("tr").eq(3).css("display"), "none");

		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox").length, 3); // visible checkboxes - header + 2 items
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[0].checked, false); // header
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[1].checked, true);
		assert.equal(this.oPanel.$().find("tr").find("input:CheckBox")[2].checked, true);

		assert.equal(this.oPanel.$().find("tr").find("span").length, 15); // 3 header cells + 3 cells * 2 items (each item in sap.m.Select has 2 span/placeholders more for text and icon)
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "A");
		assert.equal(this.oPanel.$().find("tr").find("span")[9].textContent, "B");
	});

	QUnit.module("sap.m.P13nDimMeasurePanel: FIX 0020751294 0000593415 2018", {
		beforeEach: function() {
			this.oPanel = new sap.m.P13nDimMeasurePanel({
				items: {
					path: "/items",
					template: new sap.m.P13nItem({
						columnKey: "{columnKey}",
						text: "{text}",
						aggregationRole: "{aggregationRole}"
					})
				},
				dimMeasureItems: {
					path: "/dimMeasureItems",
					template: new sap.m.P13nDimMeasureItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				},
				changeDimMeasureItems: function(oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/dimMeasureItems", oEvent.getParameter("items"));
				}
			});
			this.oDataInitial = {
				items: [
					{
						columnKey: "key01",
						text: "É",
						aggregationRole: "Measure"
					}, {
						columnKey: "key02",
						text: "D",
						aggregationRole: "Dimension"
					}, {
						columnKey: "key03",
						text: "F",
						aggregationRole: "Dimension"
					}, {
						columnKey: "key04",
						text: "E",
						aggregationRole: "Dimension"
					}
				]
			};
			this.oPanel.setModel(new sap.ui.model.json.JSONModel(jQuery.extend(true, {}, this.oDataInitial)));

			this.oPanel.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	QUnit.test("Sorting of invisible dimensions and measures", function(assert) {
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "D");
		assert.equal(this.oPanel.$().find("tr").find("span")[9].textContent, "E");
		assert.equal(this.oPanel.$().find("tr").find("span")[15].textContent, "É");
		assert.equal(this.oPanel.$().find("tr").find("span")[21].textContent, "F");
	});
});
