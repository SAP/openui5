/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils", "sap/ui/qunit/utils/createAndAppendDiv", "sap/m/P13nColumnsPanel", "sap/m/P13nColumnsItem", "sap/m/P13nItem", "sap/ui/model/json/JSONModel", "sap/ui/events/jquery/EventExtension"
], function(qutils, createAndAppendDiv, P13nColumnsPanel, P13nColumnsItem, P13nItem, JSONModel, EventExtension) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");

	QUnit.module("sap.ui.mdc.experimental.P13nColumnPanel: simple", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Instantiate panel", function(assert) {
		var oPanel = new P13nColumnsPanel();
		assert.ok(oPanel, "Could not instantiate P13nColumnsPanel");
		oPanel.destroy();
	});

	QUnit.test("Show panel", function(assert) {
		var oPanel = new P13nColumnsPanel();
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.ok(oPanel.getDomRef());
		oPanel.destroy();
	});

	QUnit.module("sap.m.P13nColumnPanel: via constructor", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Initial columns order: 'items' then 'columnsItems'", function(assert) {
		var oPanel = new P13nColumnsPanel({
			items: [
				new P13nItem({
					columnKey: "A",
					text: "A"
				}), new P13nItem({
					columnKey: "B",
					text: "B"
				})
			],
			columnsItems: [
				new P13nColumnsItem({
					columnKey: "A",
					index: 0,
					visible: false
				}), new P13nColumnsItem({
					columnKey: "B",
					index: 1,
					visible: true
				})
			]
		});
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oPanel.$().find("table"));
		assert.equal(oPanel.$().find("td").find("span").length, 2);
		assert.equal(oPanel.$().find("td").find("span")[0].textContent, "B");
		assert.equal(oPanel.$().find("td").find("span")[1].textContent, "A");

		assert.deepEqual(oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(oPanel._getMarkedTableItem());
		assert.deepEqual(oPanel._getMarkedTableItem(), jQuery(oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		oPanel.destroy();
	});

	QUnit.test("Initial columns order: 'columnsItems' then 'items'", function(assert) {
		var oPanel = new P13nColumnsPanel({
			columnsItems: [
				new P13nColumnsItem({
					columnKey: "A",
					index: 0,
					visible: false
				}), new P13nColumnsItem({
					columnKey: "B",
					index: 1,
					visible: true
				})
			],
			items: [
				new P13nItem({
					columnKey: "A",
					text: "A"
				}), new P13nItem({
					columnKey: "B",
					text: "B"
				})
			]
		});
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oPanel.$().find("table"));
		assert.equal(oPanel.$().find("td").find("span").length, 2);
		assert.equal(oPanel.$().find("td").find("span")[0].textContent, "B");
		assert.equal(oPanel.$().find("td").find("span")[1].textContent, "A");

		assert.deepEqual(oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(oPanel._getMarkedTableItem());
		assert.deepEqual(oPanel._getMarkedTableItem(), jQuery(oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		oPanel.destroy();
	});

	QUnit.module("sap.m.P13nColumnPanel: via binding", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Initial 2 columns order: 'items' then 'columnsItems'", function(assert) {
		var oPanel = new P13nColumnsPanel({
			items: {
				path: "/items",
				template: new P13nItem({
					columnKey: "{columnKey}",
					text: "{text}"
				})
			},
			columnsItems: {
				path: "/columnsItems",
				template: new P13nColumnsItem({
					columnKey: "{columnKey}",
					index: "{index}",
					visible: "{visible}"
				})
			}
		});
		oPanel.setModel(new JSONModel({
			items: [
				{
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "B",
					text: "B"
				}
			],
			columnsItems: [
				{
					columnKey: "A",
					index: 0,
					visible: false
				}, {
					columnKey: "B",
					index: 1,
					visible: true
				}
			]
		}));
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oPanel.$().find("table"));
		assert.equal(oPanel.$().find("td").find("span").length, 2);
		assert.equal(oPanel.$().find("td").find("span")[0].textContent, "B");
		assert.equal(oPanel.$().find("td").find("span")[1].textContent, "A");

		assert.deepEqual(oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(oPanel._getMarkedTableItem());
		assert.deepEqual(oPanel._getMarkedTableItem(), jQuery(oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		//		assert.equal(oPanel.getModel().getProperty("/items/0/columnKey"), "A");
		//		assert.equal(oPanel.getModel().getProperty("/items/1/columnKey"), "B");
		//		assert.equal(oPanel.getModel().getProperty("/columnsItems/0/index"), 0);
		//		assert.equal(oPanel.getModel().getProperty("/columnsItems/1/index"), 1);

		oPanel.destroy();
	});

	QUnit.test("Initial 3 columns order: 'columnsItems' then 'items'", function(assert) {
		var oPanel = new P13nColumnsPanel({
			columnsItems: {
				path: "/columnsItems",
				template: new P13nColumnsItem({
					columnKey: "{columnKey}",
					index: "{index}",
					visible: "{visible}"
				})
			},
			items: {
				path: "/items",
				template: new P13nItem({
					columnKey: "{columnKey}",
					text: "{text}"
				})
			}
		});
		oPanel.setModel(new JSONModel({
			items: [
				{
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "B",
					index: 0,
					visible: true
				}, {
					columnKey: "A",
					index: 1,
					visible: true
				}, {
					columnKey: "C",
					index: 2,
					visible: false
				}
			]
		}));
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oPanel.$().find("table"));
		assert.equal(oPanel.$().find("td").find("span").length, 3);
		assert.equal(oPanel.$().find("td").find("span")[0].textContent, "B");
		assert.equal(oPanel.$().find("td").find("span")[1].textContent, "A");
		assert.equal(oPanel.$().find("td").find("span")[2].textContent, "C");

		assert.deepEqual(oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(oPanel._getMarkedTableItem());
		assert.deepEqual(oPanel._getMarkedTableItem(), jQuery(oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		//		assert.equal(oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(oPanel.getModel().getProperty("/columnsItems/0/index"), 0);
		//		assert.equal(oPanel.getModel().getProperty("/columnsItems/1/index"), 1);
		//		assert.equal(oPanel.getModel().getProperty("/columnsItems/2/index"), 2);

		oPanel.destroy();
	});

	QUnit.module("sap.m.P13nColumnPanel: move down", {
		beforeEach: function() {
			this.oPanel = new P13nColumnsPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				}
			});
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	var fnSetModel = function(oPanel) {
		oPanel.setModel(new JSONModel({
			items: [
				{
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "B",
					index: 0,
					visible: true
				}, {
					columnKey: "A",
					index: 1,
					visible: true
				}, {
					columnKey: "C",
					index: 2,
					visible: false
				}
			]
		}));
		oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();
	};

	QUnit.test("check item focus - move to top", function(assert){
		fnSetModel(this.oPanel);

		var iLastItem = this.oPanel._oTable.getItems().length - 1;
		var oLastItem = this.oPanel._oTable.getItems()[iLastItem];

		sinon.stub(this.oPanel, "_getMarkedTableItem").returns(oLastItem);
		this.oPanel.onPressButtonMoveToTop();

		assert.equal(sap.ui.getCore().getCurrentFocusedControlId(), this.oPanel.getId() + "-showSelected", "Show selected button focused");
	});

	QUnit.test("check item focus - move down", function(assert){
		fnSetModel(this.oPanel);

		var oFirstItem = this.oPanel._oTable.getItems()[0];

		sinon.stub(this.oPanel, "_getMarkedTableItem").returns(oFirstItem);
		this.oPanel.onPressButtonMoveDown();

		assert.notEqual(sap.ui.getCore().getCurrentFocusedControlId(), this.oPanel.getId() + "-showSelected", "Show selected button is not focused");
	});

	QUnit.test("check item focus - move bottom", function(assert){
		fnSetModel(this.oPanel);

		var oFirstItem = this.oPanel._oTable.getItems()[0];

		sinon.stub(this.oPanel, "_getMarkedTableItem").returns(oFirstItem);
		this.oPanel.onPressButtonMoveToBottom();

		assert.equal(sap.ui.getCore().getCurrentFocusedControlId(), this.oPanel.getId() + "-showSelected", "Show selected button is not focused");
	});

	QUnit.test("selected B after selected A", function(assert) {
		fnSetModel(this.oPanel);

		// act: B, A, C -> A, B, C
		this.oPanel.onPressButtonMoveDown();

		assert.deepEqual(this.oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(this.oPanel._getMarkedTableItem());
		assert.deepEqual(this.oPanel._getMarkedTableItem(), jQuery(this.oPanel.$().find("td").find("span")[1].parentNode).control()[0]);
		assert.deepEqual(this.oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], this.oPanel.$().find("td").find("span")[1].parentNode.parentNode);

		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/columnsItems/0/index"), 1);
		//		assert.equal(this.oPanel.getModel().getProperty("/columnsItems/1/index"), 0);
		//		assert.equal(this.oPanel.getModel().getProperty("/columnsItems/2/index"), 2);
	});

	QUnit.test("selected B after unselected C", function(assert) {
		fnSetModel(this.oPanel);

		// act: B, A, C -> A, C, B
		this.oPanel.onPressButtonMoveToBottom();

		assert.deepEqual(this.oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "B");
		assert.ok(this.oPanel._getMarkedTableItem());
		assert.deepEqual(this.oPanel._getMarkedTableItem(), jQuery(this.oPanel.$().find("td").find("span")[2].parentNode).control()[0]);
		assert.deepEqual(this.oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], this.oPanel.$().find("td").find("span")[2].parentNode.parentNode);

		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/position"), 1);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/position"), 0);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/position"), 2);
	});

	QUnit.test("unselected A after unselected C", function(assert) {
		this.oPanel._setColumnKeyOfMarkedItem("A");
		fnSetModel(this.oPanel);

		// act: B, A, C -> A, C, B
		this.oPanel.onPressButtonMoveToBottom();

		assert.deepEqual(this.oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "A");
		assert.ok(this.oPanel._getMarkedTableItem());
		assert.deepEqual(this.oPanel._getMarkedTableItem(), jQuery(this.oPanel.$().find("td").find("span")[2].parentNode).control()[0]);
		assert.deepEqual(this.oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], this.oPanel.$().find("td").find("span")[2].parentNode.parentNode);

		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/position"), 1);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/position"), 0);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/position"), 2);
	});

	QUnit.module("sap.m.P13nColumnPanel: move up", {
		beforeEach: function() {
			this.oPanel = new P13nColumnsPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				}
			});
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	QUnit.test("selected A after selected B", function(assert) {
		this.oPanel._setColumnKeyOfMarkedItem("A");
		this.oPanel.setModel(new JSONModel({
			items: [
				{
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "B",
					index: 0,
					visible: true
				}, {
					columnKey: "A",
					index: 1,
					visible: true
				}, {
					columnKey: "C",
					index: 2,
					visible: false
				}
			]
		}));
		this.oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act: B, A, C -> A, B, C
		this.oPanel.onPressButtonMoveUp();

		assert.deepEqual(this.oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "A");
		assert.ok(this.oPanel._getMarkedTableItem());
		assert.deepEqual(this.oPanel._getMarkedTableItem(), jQuery(this.oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(this.oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], this.oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/position"), 1);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/position"), 0);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/position"), 2);
	});

	QUnit.test("unselected C after selected B", function(assert) {
		this.oPanel._setColumnKeyOfMarkedItem("C");
		this.oPanel.setModel(new JSONModel({
			items: [
				{
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "B",
					index: 0,
					visible: true
				}, {
					columnKey: "A",
					index: 1,
					visible: true
				}, {
					columnKey: "C",
					index: 2,
					visible: false
				}
			]
		}));
		this.oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act: B, A, C -> C, B, A
		this.oPanel.onPressButtonMoveToTop();

		assert.deepEqual(this.oPanel._getInternalModel().getProperty("/columnKeyOfMarkedItem"), "C");
		assert.ok(this.oPanel._getMarkedTableItem());
		assert.deepEqual(this.oPanel._getMarkedTableItem(), jQuery(this.oPanel.$().find("td").find("span")[0].parentNode).control()[0]);
		assert.deepEqual(this.oPanel.$().find(".sapMP13nColumnsPanelItemSelected")[0], this.oPanel.$().find("td").find("span")[0].parentNode.parentNode);

		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "A");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/position"), 1);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/position"), 2);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/position"), 0);
	});

	QUnit.module("sap.m.P13nColumnPanel: _selectTableItem aggregation ^D, C, ^B", {
		beforeEach: function() {
			this.oPanel = new P13nColumnsPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				}
			});
			this.oPanel.setModel(new JSONModel({
				items: [
					{
						columnKey: "D",
						text: "D"
					}, {
						columnKey: "C",
						text: "C"
					}, {
						columnKey: "B",
						text: "B"
					}
				],
				columnsItems: [
					{
						columnKey: "D",
						index: 0,
						visible: true
					}, {
						columnKey: "C",
						index: 1,
						visible: false
					}, {
						columnKey: "B",
						index: 2,
						visible: true
					}
				]
			}));
			this.oPanel.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	QUnit.test("1. Model: ^D, ^B, C", function(assert) {
		var oTableItem = jQuery(this.oPanel.$().find("td").find("span")[2].parentNode.parentNode).control()[0];
		oTableItem.setVisible(true);
		this.oPanel._selectTableItem();

		assert.equal(this.oPanel._getColumnKeyByTableItem(oTableItem), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/columnKey"), "D");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/columnKey"), "C");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/columnKey"), "B");
		//		assert.equal(this.oPanel.getModel().getProperty("/items/0/position"), 0);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/1/position"), 2);
		//		assert.equal(this.oPanel.getModel().getProperty("/items/2/position"), 1);
	});

	QUnit.module("sap.m.P13nColumnPanel: visibleItemsThreshold", {
		beforeEach: function() {
			this.oPanel = new P13nColumnsPanel({
				visibleItemsThreshold: "{/threshold}",
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				}
			});
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("Shall check onBeforeNavigationFrom", function(assert) {
		this.oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.onBeforeNavigationFrom(), true, "navigation validation shall not be influenced");
		assert.strictEqual(this.oPanel.getVisibleItemsThreshold(), -1, "Getter for visible items threshold shall return -1 = default value, which was not overwritten)");
	});

	QUnit.test("Shall check onBeforeNavigationFromAsync", function(assert) {
		this.oPanel.setModel(new JSONModel({
			threshold: 2,
			items: [
				{
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "A",
					visible: true
				}, {
					columnKey: "B",
					visible: true
				}, {
					columnKey: "C",
					visible: false
				}
			]
		}));
		this.oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oPanel.onBeforeNavigationFrom(), true, "navigation validation shall not be influenced as threshold is not reached");
	});

	QUnit.test("Shall check onBeforeNavigationFromAsync", function(assert) {
		this.oPanel.setModel(new JSONModel({
			threshold: 2,
			items: [
				{
					columnKey: "A",
					text: "A"
				}, {
					columnKey: "B",
					text: "B"
				}, {
					columnKey: "C",
					text: "C"
				}
			],
			columnsItems: [
				{
					columnKey: "A",
					visible: true
				}, {
					columnKey: "B",
					visible: true
				}, {
					columnKey: "C",
					visible: true
				}
			]
		}));
		this.oPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.onBeforeNavigationFrom(), false, "navigation validation shall be influenced as threshold is reached");
	});

	QUnit.module("sap.m.P13nColumnsPanel: FIX", {
		beforeEach: function() {
			this.oPanel = new P13nColumnsPanel({
				items: {
					path: "/items",
					template: new P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				},
				changeColumnsItems: function(oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/columnsItems", oEvent.getParameter("items"));
				}
			});
			this.oDataInitial = {
				items: [
					{
						columnKey: "keyC",
						text: "C"
					}, {
						columnKey: "keyB",
						text: "B foo"
					}, {
						columnKey: "keyA",
						text: "A foo"
					}
				],
				columnsItems: [
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
		this.oPanel._getSearchField().setValue("foo");
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

		assert.equal(this.oPanel.$().find("tr").find("span").length, 3); // 1 header cell + 1 cell * 2 items
		assert.equal(this.oPanel.$().find("tr").find("span")[1].textContent, "B foo");
		assert.equal(this.oPanel.$().find("tr").find("span")[2].textContent, "A foo");

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

		assert.equal(this.oPanel.$().find("tr").find("span").length, 3); // 1 header cell + 1 cell * 2 items
		assert.equal(this.oPanel.$().find("tr").find("span")[1].textContent, "A foo");
		assert.equal(this.oPanel.$().find("tr").find("span")[2].textContent, "B foo");
	});

	QUnit.test("Reset after 'Show Selected' clicked", function(assert) {
		// arrange: deselect first item "A", move it down and click 'Show Selected'
		qutils.triggerTouchEvent("tap", this.oPanel._oTable.getItems()[0].$().find(".sapMCbMark")[0], {
			srcControl: this.oPanel
		});
		this.oPanel.onPressButtonMoveDown();
		// As the toolbar can be overflowed, no 'Show Selected' button can not have a dom reference
		var oEvent = jQuery.Event("ontap");
		var oButton = this.oPanel._getToolbar().getContent()[2];
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

		assert.equal(this.oPanel.$().find("tr").find("span").length, 2); // 1 header cell + 1 cell * 1 items
		assert.equal(this.oPanel.$().find("tr").find("span")[1].textContent, "B foo");

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

		assert.equal(this.oPanel.$().find("tr").find("span").length, 3); // 1 header cell + 1 cell * 2 items
		assert.equal(this.oPanel.$().find("tr").find("span")[1].textContent, "A foo");
		assert.equal(this.oPanel.$().find("tr").find("span")[2].textContent, "B foo");
	});

	QUnit.module("sap.m.P13nColumnsPanel: _sortModelItemsByPersistentIndex", {
		beforeEach: function() {
			this.oPanel = new sap.m.P13nColumnsPanel();
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});

	QUnit.test("BCP 0020751295 0000514259 2018", function(assert) {
		var aModelItems = JSON.parse('[' + '{"columnKey":"Project>Name","visible":true,"text":"Name","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtA2","visible":true,"text":"Actuals Feb","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtA12","visible":true,"text":"Actuals Dec","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>CreatedByName","visible":true,"text":"Created By","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>CreatedTime","visible":true,"text":"Created At","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>ChangedByName","visible":true,"text":"Changed By","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>ChangedTime","visible":true,"text":"Changed At","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>MaxValueC","visible":true,"text":"Project Cap","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>MaxValueB","visible":true,"text":"Plan","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtLeTot","visible":true,"text":"Actuals+Plan to Go","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>DemographicsDesc","visible":true,"text":"Demographics","tooltip":null,"persistentIndex":-1,"persistentSelected":true}]');
		var aModelItems_ = JSON.parse('[' + '{"columnKey":"Project>Name","visible":true,"text":"Name","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtA2","visible":true,"text":"Actuals Feb","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtA12","visible":true,"text":"Actuals Dec","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>CreatedByName","visible":true,"text":"Created By","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>CreatedTime","visible":true,"text":"Created At","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>ChangedByName","visible":true,"text":"Changed By","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>ChangedTime","visible":true,"text":"Changed At","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>MaxValueC","visible":true,"text":"Project Cap","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>MaxValueB","visible":true,"text":"Plan","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>AmtLeTot","visible":true,"text":"Actuals+Plan to Go","tooltip":null,"persistentIndex":-1,"persistentSelected":true},' + '{"columnKey":"Project>DemographicsDesc","visible":true,"text":"Demographics","tooltip":null,"persistentIndex":-1,"persistentSelected":true}]');

		this.oPanel._sortModelItemsByPersistentIndex(aModelItems_);
		assert.deepEqual(aModelItems_, aModelItems);
	});
	QUnit.module("sap.m.P13nColumnsPanel: _sortModelItemsByPersistentIndex", {
		beforeEach: function() {
			this.oPanel = new sap.m.P13nColumnsPanel({
				items: {
					path: "/items",
					template: new sap.m.P13nItem({
						columnKey: "{columnKey}",
						text: "{text}"
					})
				},
				columnsItems: {
					path: "/columnsItems",
					template: new sap.m.P13nColumnsItem({
						columnKey: "{columnKey}",
						index: "{index}",
						visible: "{visible}"
					})
				},
				changeColumnsItems: function(oEvent) {
					// At least enough for this test!
					this.getModel().setProperty("/columnsItems", oEvent.getParameter("items"));
				}
			});
			this.oDataInitial = {
				items: [
					{
						columnKey: "key01",
						text: "É"
					}, {
						columnKey: "key02",
						text: "D"
					}, {
						columnKey: "key03",
						text: "F"
					}, {
						columnKey: "key04",
						text: "E"
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

	QUnit.test("BCP 0020751294 0000593415 2018", function(assert) {
		assert.equal(this.oPanel.$().find("tr").find("span").length, 5);
		assert.equal(this.oPanel.$().find("tr").find("span")[1].textContent, "D");
		assert.equal(this.oPanel.$().find("tr").find("span")[2].textContent, "E");
		assert.equal(this.oPanel.$().find("tr").find("span")[3].textContent, "É");
		assert.equal(this.oPanel.$().find("tr").find("span")[4].textContent, "F");
	});
});
