/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/CreationRow",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/Toolbar",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	CreationRow,
	Column,
	FixedRowMode,
	qutils,
	KeyCodes,
	Toolbar,
	oCore
) {
	"use strict";

	var TestControl = TableQUnitUtils.TestControl;
	var TestInputControl = TableQUnitUtils.TestInputControl;

	QUnit.module("Public API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column({
					id: "column1",
					template: new TestControl({text: "test"})
				}).setCreationTemplate(new TestControl({text: "test"})));

				oTable.addColumn(new Column({
					id: "column2",
					template: new TestControl({text: "test2"})
				}).setCreationTemplate(new TestInputControl({text: "test2"})));

				oTable.setCreationRow(new CreationRow());
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#resetFocus", function(assert) {
		var oCreationRow = this.oTable.getCreationRow();

		this.oTable.qunit.getDataCell(0, 0).focus();

		assert.strictEqual(oCreationRow.resetFocus(), true, "Returned true, because an element was focused");
		assert.strictEqual(document.activeElement, oCreationRow.getCells()[1].getDomRef(), "The first interactive element is focused");

		var oInput = oCreationRow.getCells()[1].getDomRef();
		assert.strictEqual(oInput.selectionStart, 0, "The selection starts from index 0");
		assert.strictEqual(oInput.selectionEnd, 5, "The selection ends as index 5");

		this.oTable.getColumns()[1].destroy();
		oCore.applyChanges();
		this.oTable.qunit.getDataCell(0, 0).focus();

		assert.strictEqual(oCreationRow.resetFocus(), false, "Returned false, because no element was focused");
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 0), "The focus was not changed");
	});

	QUnit.module("Private API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column({
					id: "column1",
					template: new TestControl({text: "test"})
				}).setCreationTemplate(new TestControl({text: "test"})));

				oTable.addColumn(new Column({
					id: "column2",
					template: new TestControl({text: "test2"})
				}).setCreationTemplate(new TestInputControl({text: "test2"})));

				oTable.setCreationRow(new CreationRow());
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#_fireApply", function(assert) {
		var oCreationRow = this.oTable.getCreationRow();
		var oApplySpy = sinon.spy();
		var oResetFocusSpy = sinon.spy(oCreationRow, "resetFocus");

		oCreationRow.attachApply(oApplySpy);

		assert.strictEqual(oCreationRow._fireApply(), true, "Returned true, because an element was focused");
		assert.ok(oApplySpy.calledOnce, "The CreationRow's \"apply\" event was called once");
		assert.ok(oResetFocusSpy.calledOnce, "CreationRow#resetFocus was called once");

		oApplySpy.resetHistory();
		oResetFocusSpy.resetHistory();

		oCreationRow.attachEventOnce("apply", function(oEvent) {
			oEvent.preventDefault();
		});

		assert.strictEqual(oCreationRow._fireApply(), false,
			"Returned false, because the default action was prevented and therefore no focus was set");
		assert.ok(oApplySpy.calledOnce, "The CreationRow's \"apply\" event was called once");
		assert.ok(oResetFocusSpy.notCalled, "CreationRow#resetFocus was not called");

		oApplySpy.resetHistory();
		oResetFocusSpy.resetHistory();
		this.oTable.getColumns()[1].destroy();
		oCore.applyChanges();

		assert.strictEqual(oCreationRow._fireApply(), false, "Returned false, because no element was focused");
		assert.ok(oApplySpy.calledOnce, "The CreationRow's \"apply\" event was called once");
		assert.ok(oResetFocusSpy.calledOnce, "CreationRow#resetFocus was called once");
	});

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oCreationRow = new CreationRow();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oCreationRow.destroy();
		}
	});

	QUnit.test("If child of a table", function(assert) {
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		assert.notEqual(this.oCreationRow.getDomRef(), null, "The creation row is rendered");
	});

	QUnit.test("If not child of a table", function(assert) {
		this.oCreationRow.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.equal(this.oCreationRow.getDomRef(), null, "The creation row did not render anything");
	});

	QUnit.test("Toolbar", function(assert) {
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		var oDefaultToolbar = this.oCreationRow.getAggregation("_defaultToolbar");

		assert.notEqual(oDefaultToolbar.getDomRef(), null, "No custom toolbar is set: The default toolbar is rendered");

		this.oCreationRow.setToolbar(new Toolbar());
		oCore.applyChanges();

		assert.notEqual(this.oCreationRow.getToolbar().getDomRef(), null, "Custom toolbar is set: The custom toolbar is rendered");
		assert.equal(oDefaultToolbar.getDomRef(), null, "Custom toolbar is set: The default toolbar is not rendered");

		this.oCreationRow.destroyToolbar();
		oCore.applyChanges();

		assert.notEqual(oDefaultToolbar.getDomRef(), null, "No custom toolbar is set: The default toolbar is rendered");
	});

	QUnit.test("Horizontal scrollbar position in the DOM", function(assert) {
		var sBusySection = "sapUiTableGridCnt";

		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();
		assert.notOk(this.oTable.getDomRef(sBusySection).contains(this.oTable._getScrollExtension().getHorizontalScrollbar()),
			"After rendering the table with a visible creation row,"
			+ " the horizontal scrollbar is rendered outside the element that is covered by the busy indicator.");

		this.oCreationRow.setVisible(false);
		oCore.applyChanges();
		assert.ok(this.oTable.getDomRef(sBusySection).contains(this.oTable._getScrollExtension().getHorizontalScrollbar()),
			"After making the creation row invisible,"
			+ " the horizontal scrollbar is rendered inside the element that is covered by the busy indicator.");

		this.oCreationRow.setVisible(true);
		oCore.applyChanges();
		assert.notOk(this.oTable.getDomRef(sBusySection).contains(this.oTable._getScrollExtension().getHorizontalScrollbar()),
			"After making the creation row visible,"
			+ " the horizontal scrollbar is rendered outside the element that is covered by the busy indicator.");

		this.oTable.setCreationRow();
		oCore.applyChanges();
		this.oCreationRow.setVisible(false);
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		assert.ok(this.oTable.getDomRef(sBusySection).contains(this.oTable._getScrollExtension().getHorizontalScrollbar()),
			"After rendering the table with an invisible creation row,"
			+ " the horizontal scrollbar is rendered inside the element that is covered by the busy indicator.");
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				fixedColumnCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column({
					id: "column1",
					template: new TestControl({text: "test"})
				}).setCreationTemplate(new TestControl({text: "test"})));

				oTable.addColumn(new Column({
					id: "column2",
					template: new TestControl({text: "test2"})
				}).setCreationTemplate(new TestControl({text: "test2"})));

				oTable.setCreationRow(new CreationRow());
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Root", function(assert) {
		var oRow = this.oTable.getCreationRow();
		var $Row = oRow.$();

		assert.strictEqual($Row.attr("role"), "form", "Aria Role of creation row root element");
		assert.strictEqual($Row.attr("aria-labelledby"), oRow.getId() + "-label", "Label of creation row root element");
	});

	QUnit.test("Default Toolbar", function(assert) {
		var oRow = this.oTable.getCreationRow();
		var oDefaultToolbar = oRow.getAggregation("_defaultToolbar");

		assert.strictEqual(oDefaultToolbar.getAriaLabelledBy()[0], oRow.getId() + "-label", "Default toolbar has correct label");
	});

	QUnit.test("Inner table elements", function(assert) {
		var oRow = this.oTable.getCreationRow();
		var $Row = oRow.$();

		assert.strictEqual($Row.find("table").attr("role"), "presentation", "Aria Role of creation row inner table element");
	});

	QUnit.test("Cells", function(assert) {
		var oRow = this.oTable.getCreationRow();
		var aCells = oRow.getCells();

		assert.strictEqual(aCells[0].getAriaLabelledBy()[0], "column1", "The first cell is labelled by the correct column");
		assert.strictEqual(aCells[1].getAriaLabelledBy()[0], "column2", "The first cell is labelled by the correct column");
	});

	QUnit.module("Keyboard", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				fixedColumnCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column({
					id: "column1",
					template: new TestControl({text: "test"})
				}).setCreationTemplate(new TestInputControl({text: "test"})));

				oTable.addColumn(new Column({
					id: "column2",
					template: new TestControl({text: "test2"})
				}).setCreationTemplate(new TestControl({text: "test2"})));

				oTable.addColumn(new Column({
					id: "column3",
					template: new TestControl({text: "test3"})
				}).setCreationTemplate(new TestInputControl({text: "test3"})));

				oTable.setCreationRow(new CreationRow());
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Fire apply with Enter, CTRL+Enter", function(assert) {
		var oTable = this.oTable;
		var oCreationRow = oTable.getCreationRow();
		var oInput = oCreationRow.getCells()[0];
		var oFormElement = oInput.getDomRef();
		var oFireApplySpy = sinon.spy(oCreationRow, "_fireApply");
		var aEvents = [];
		var oClock = sinon.useFakeTimers();

		function test(fnAct, fnAssert) {
			oFireApplySpy.resetHistory();
			aEvents = [];
			fnAct();

			return new Promise(function(resolve) {
				oClock.tick(1);
				fnAssert();
				resolve();
			});
		}

		function expectKeyboardEventMarked(sEventName, bExpectMarked) {
			TableQUnitUtils.addDelegateOnce(oTable, sEventName, function(oEvent) {
				assert.strictEqual(oEvent.isMarked(), bExpectMarked, "The event is" + (bExpectMarked ? " " : " not ") + "marked");
			});
		}

		oInput.addEventDelegate({
			onsapfocusleave: function() {
				aEvents.push("sapfocusleave");
			},
			onfocusin: function() {
				aEvents.push("focusin");
			}
		});
		oInput.setFieldGroupIds(["fieldGroup1"]);
		oInput.attachValidateFieldGroup(function() {
			aEvents.push("validateFieldGroup");
		});
		oCreationRow.attachEvent("apply", function() {
			aEvents.push("apply");
		});

		oFormElement.focus();
		oClock.tick(1);

		return test(function() {
				expectKeyboardEventMarked("onsapenter", true);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, false);
			}, function() {
				assert.ok(oFireApplySpy.calledOnce, "CreationRow#_fireApply was called once");
				assert.deepEqual(aEvents, ["sapfocusleave", "validateFieldGroup", "apply", "focusin"], "The events on the form element were correctly fired");
			}

		).then(function() {
			return test(function() {
				expectKeyboardEventMarked("onsapentermodifiers", true);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, true);
			}, function() {
				assert.ok(oFireApplySpy.calledOnce, "CreationRow#_fireApply was called once");
				assert.deepEqual(aEvents, ["sapfocusleave", "validateFieldGroup", "apply", "focusin"], "The events on the form element were correctly fired");

			});

		}).then(function() {
			return test(function() {
				oCreationRow.getCells()[0].attachBrowserEvent("keydown", function(oEvent) {
					if (oEvent.keyCode === KeyCodes.ENTER && !(oEvent.metaKey || oEvent.ctrlKey)) {
						oEvent.setMarked();
					}
				});
				expectKeyboardEventMarked("onsapenter", true);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, false);
			}, function() {
				assert.ok(oFireApplySpy.notCalled, "CreationRow#_fireApply was not called because the input control handles the keydown event");

			});

		}).then(function() {
			return test(function() {
				oCreationRow.attachEventOnce("apply", function(oEvent) {
					oEvent.preventDefault();
				});
				expectKeyboardEventMarked("onsapentermodifiers", true);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, true);
			}, function() {
				assert.ok(oFireApplySpy.calledOnce, "CreationRow#_fireApply was called once");
				assert.deepEqual(aEvents, ["sapfocusleave", "validateFieldGroup", "apply", "focusin"], "The events on the form element were correctly fired");

			});

		}).then(function() {
			return test(function() {
				oFormElement = oCreationRow.getCells()[2].getDomRef();
				oCreationRow.setApplyEnabled(false);
				expectKeyboardEventMarked("onsapenter", false);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, false);
			}, function() {
				assert.ok(oFireApplySpy.notCalled, "CreationRow#_fireApply was not called");
				assert.deepEqual(aEvents, [], "The events on the form element were not fired");

			});

		}).then(function() {
			return test(function() {
				oCreationRow.setApplyEnabled(false);
				expectKeyboardEventMarked("onsapentermodifiers", false);
				qutils.triggerKeydown(oFormElement, KeyCodes.ENTER, false, false, true);
			}, function() {
				assert.ok(oFireApplySpy.notCalled, "CreationRow#_fireApply was not called");
				assert.deepEqual(aEvents, [], "The events on the form element were not fired");
				oClock.restore();

			});

		});
	});

	QUnit.module("Cells", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column());
				oTable.addColumn(new Column()
					.setCreationTemplate(new TestControl({text: "Column2*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column3"})}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column4"})})
					.setCreationTemplate(new TestControl({text: "Column4*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column5"}), visible: false}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column6"}), visible: false})
					.setCreationTemplate(new TestControl({text: "Column6*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column7"})}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column8"})})
					.setCreationTemplate(new TestControl({text: "Column8*"})));

				oTable.setCreationRow(new CreationRow());
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertCells: function(assert) {
			var aActualCells = this.oTable.getCreationRow().getCells().map(function(oCell) {
				var sText = oCell.getText();
				return sText.substring(0, sText.length - 1);
			});
			var aExpectedCells = Array.prototype.slice.call(arguments, 1);

			assert.deepEqual(aActualCells, aExpectedCells, "The creation row has the correct cells");
		}
	});

	QUnit.test("Initial", function(assert) {
		this.assertCells(assert, "Column4", "Column8");
	});

	QUnit.test("After changing column visibility", function(assert) {
		this.oTable.getColumns()[2].setVisible(false);
		this.oTable.getColumns()[3].setVisible(false);
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[4].setVisible(true);
		this.oTable.getColumns()[5].setVisible(true);
		this.assertCells(assert, "Column6", "Column8");
	});

	QUnit.test("After setting column templates", function(assert) {
		this.oTable.getColumns()[0].setCreationTemplate(new TestControl({text: "Column1*"}));
		this.assertCells(assert, "Column4", "Column8");

		this.oTable.getColumns()[1].setTemplate(new TestControl({text: "Column2"}));
		this.assertCells(assert, "Column2", "Column4", "Column8");

		this.oTable.getColumns()[2].setCreationTemplate(new TestControl({text: "Column3*"}));
		this.assertCells(assert, "Column2", "Column3", "Column4", "Column8");
	});

	QUnit.test("After removing column templates", function(assert) {
		this.oTable.getColumns()[3].setTemplate(null);
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[7].setCreationTemplate(null);
		this.assertCells(assert);
	});

	QUnit.test("After destroying column templates", function(assert) {
		this.oTable.getColumns()[3].destroyTemplate();
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[7].destroyCreationTemplate();
		this.assertCells(assert);
	});

	QUnit.test("After changing column templates", function(assert) {
		this.oTable.getColumns()[3].getCreationTemplate().setText("Not Column4*");
		this.assertCells(assert, "Column4", "Column8");
	});

	QUnit.test("After removing columns", function(assert) {
		this.oTable.removeColumn(this.oTable.getColumns()[3]);
		this.assertCells(assert, "Column8");

		this.oTable.removeAllColumns();
		this.assertCells(assert);
	});

	QUnit.test("After destroying columns", function(assert) {
		this.oTable.getColumns()[3].destroy();
		this.assertCells(assert, "Column8");

		this.oTable.destroyColumns();
		this.assertCells(assert);
	});

	QUnit.test("After adding columns", function(assert) {
		this.oTable.addColumn(new Column({template: new TestControl({text: "Column9"})})
			.setCreationTemplate(new TestControl({text: "Column9*"})));
		this.assertCells(assert, "Column4", "Column8", "Column9");

		this.oTable.insertColumn(new Column({template: new TestControl({text: "Column0"})})
			.setCreationTemplate(new TestControl({text: "Column0*"})), 0);
		this.assertCells(assert, "Column0", "Column4", "Column8", "Column9");
	});

	QUnit.module("Default Toolbar", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oCreationRow = new CreationRow();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oCreationRow.destroy();
		}
	});

	QUnit.test("After initialization", function(assert) {
		assert.ok(this.oCreationRow.getToolbar() === null, "No custom toolbar is set");
		assert.ok(this.oCreationRow.getAggregation("_defaultToolbar") == null, "No default toolbar exists");
	});

	QUnit.test("Create if no custom toolbar is provided", function(assert) {
		this.oCreationRow.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.ok(this.oCreationRow.getToolbar() === null, "No custom toolbar is set");
		assert.ok(this.oCreationRow.getAggregation("_defaultToolbar") == null,
			"No default toolbar exists if rendered while not a child of the table");

		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		assert.ok(this.oCreationRow.getToolbar() === null, "No custom toolbar is set");
		assert.ok(this.oCreationRow.getAggregation("_defaultToolbar") != null,
			"The default toolbar is created if rendered as a child of a table");
	});

	QUnit.test("Do not create if a custom toolbar is provided", function(assert) {
		var oToolbar = new Toolbar();
		this.oCreationRow.setToolbar(oToolbar);
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		assert.ok(this.oCreationRow.getToolbar() === oToolbar, "A custom toolbar is set");
		assert.ok(this.oCreationRow.getAggregation("_defaultToolbar") == null, "The default toolbar is not created");
	});

	QUnit.test("Do not recreate", function(assert) {
		this.oCreationRow.placeAt("qunit-fixture");
		oCore.applyChanges();

		var oDefaultToolbar = this.oCreationRow.getAggregation("_defaultToolbar");

		this.oCreationRow.setToolbar(new Toolbar());
		oCore.applyChanges();

		this.oCreationRow.destroyToolbar();
		oCore.applyChanges();

		assert.strictEqual(oDefaultToolbar, this.oCreationRow.getAggregation("_defaultToolbar"), "The default toolbar is reused");
	});

	QUnit.test("Destroy when the CreationRow is destroyed", function(assert) {
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		var oToolbarDestroySpy = sinon.spy(this.oCreationRow.getAggregation("_defaultToolbar"), "destroy");

		this.oCreationRow.destroy();
		assert.ok(oToolbarDestroySpy.calledOnce, "The default toolbar is destroyed");
		assert.strictEqual(this.oCreationRow.getAggregation("_defaultToolbar"), null, "The \"_defaultToolbar\" aggregation is empty");
	});

	QUnit.test("Content", function(assert) {
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		var oApplyButton = this.oCreationRow.getAggregation("_defaultToolbar").getContent().slice(-1)[0];
		var oApplySpy = sinon.spy(this.oCreationRow, "_fireApply");

		oApplyButton.firePress();

		assert.ok(oApplyButton.isA("sap.m.Button"), "The last item is a button");
		assert.ok(oApplySpy.calledOnce, "CreationRow#_fireApply is called when pressing the apply button");
		assert.strictEqual(oApplyButton.getEnabled(), true, "The button is enabled");

		this.oCreationRow.destroy();
		this.oCreationRow = new CreationRow({
			applyEnabled: false
		});
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		assert.strictEqual(oApplyButton.getEnabled(), true, "The button is disabled");
	});

	QUnit.test("Update content", function(assert) {
		this.oTable.setCreationRow(this.oCreationRow);
		oCore.applyChanges();

		var oApplyButton = this.oCreationRow.getAggregation("_defaultToolbar").getContent().slice(-1)[0];
		var oApplyButtonAfterRendering = sinon.spy();

		oApplyButton.addEventDelegate({
			onAfterRendering: oApplyButtonAfterRendering
		});

		this.oCreationRow.setApplyEnabled(false);
		assert.strictEqual(oApplyButton.getEnabled(), false, "The button is disabled after setting \"applyEnabled\" of the CreationRow to \"false\"");

		oCore.applyChanges();
		assert.ok(oApplyButtonAfterRendering.calledOnce, "The button was re-rendered");
		oApplyButtonAfterRendering.resetHistory();

		this.oCreationRow.setApplyEnabled(true);
		assert.strictEqual(oApplyButton.getEnabled(), true, "The button is enabled after setting \"applyEnabled\" of the CreationRow to \"true\"");

		oCore.applyChanges();
		assert.ok(oApplyButtonAfterRendering.calledOnce, "The button was re-rendered");

		this.oCreationRow.setToolbar(new Toolbar());
		this.oCreationRow.setApplyEnabled(false);
		oCore.applyChanges();
		assert.strictEqual(oApplyButton.getEnabled(), true,
			"The button is still enabled after setting \"applyEnabled\" of the CreationRow to \"false\", if there is a custom toolbar");

		this.oCreationRow.destroyToolbar();
		oCore.applyChanges();
		assert.strictEqual(oApplyButton.getEnabled(), false, "The button is updated after removing the custom toolbar, and is disabled");
	});
});