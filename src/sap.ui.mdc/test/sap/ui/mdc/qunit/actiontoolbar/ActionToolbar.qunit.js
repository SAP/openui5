/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/ActionToolbar", "sap/m/Button", "sap/m/Title", "sap/m/Text", "sap/ui/mdc/actiontoolbar/ActionToolbarAction", "sap/ui/mdc/enums/ActionToolbarActionAlignment", "sap/ui/qunit/utils/nextUIUpdate"
], function(ActionToolbar, Button, Title, Text, ActionToolbarAction, ActionToolbarActionAlignment, nextUIUpdate) {
	"use strict";

	QUnit.module("sap.ui.mdc.ActionToolbar - General", {
		before: function (assert) {
			//
		},
		after: function () {
			//
		},
		beforeEach: function (assert) {
			this.oToolbar = new ActionToolbar();
		},
		afterEach: function () {
			if (this.oToolbar) {
				this.oToolbar.destroy();
			}
		}
	});

	function checkAggregation(assert, oToolbar, sAggregation, aExpectedContent, sText, oObj) {
		const oAggregation = oToolbar.getMetadata().getAggregation(sAggregation);
		const aContent = oToolbar[oAggregation._sGetter]();
		assert.strictEqual(aContent.length, aExpectedContent.length, sText + " - " + oAggregation._sGetter + "().length");
		for (let i = 0; i < aContent.length; i++) {
			assert.ok(aContent[i] === aExpectedContent[i], sText + " - " + sAggregation + " " + i);
		}
		if (oObj) {
			assert.strictEqual(oToolbar[oAggregation._sIndexGetter](oObj), aExpectedContent.indexOf(oObj), oAggregation._sIndexGetter);
		}
	}

	QUnit.test("Instantiation", function (assert) {
		assert.ok(this.oToolbar);
		checkAggregation(assert, this.oToolbar, "content", [
			this.oToolbar._oBeginSeparator, this.oToolbar._oSpacer, this.oToolbar._oEndActionsBeginSeparator, this.oToolbar._oEndActionsEndSeparator
		], "Default Content");
	});

	QUnit.test("Aggregations (content)", function (assert) {
		const oObj = new Button();

		try {
			this.oToolbar.addContent(oObj);
			assert.ok(false, "addContent");
		} catch (e) {
			assert.ok(true, "addContent");
		}

		try {
			this.oToolbar.insertContent(oObj, 2);
			assert.ok(false, "insertContent");
		} catch (e) {
			assert.ok(true, "insertContent");
		}

		try {
			this.oToolbar.removeContent(oObj);
			assert.ok(false, "removeContent");
		} catch (e) {
			assert.ok(true, "removeContent");
		}

		try {
			this.oToolbar.removeAllContent();
			assert.ok(false, "removeAllContent");
		} catch (e) {
			assert.ok(true, "removeAllContent");
		}

		try {
			this.oToolbar.destroyContent();
			assert.ok(false, "destroyContent");
		} catch (e) {
			assert.ok(true, "destroyContent");
		}
	});

	QUnit.test("Header CTX", function (assert) {
		assert.ok(this.oToolbar.getUseAsHeader(), "Default Header CTX");
		assert.ok(this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style applied");
		this.oToolbar.setUseAsHeader(false);
		assert.ok(!this.oToolbar.getUseAsHeader(), "No Header CTX");
		assert.ok(!this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style not applied");
		this.oToolbar.setUseAsHeader(true);
		assert.ok(this.oToolbar.getUseAsHeader(), "Header CTX");
		assert.ok(this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style applied");
	});

	QUnit.test("Title Separator", function (assert) {
		assert.ok(this.oToolbar._oBeginSeparator);
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), false);

		const t1 = new Title();
		this.oToolbar.addBegin(t1);

		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), false);

		const txt1 = new Text();
		this.oToolbar.addBetween(txt1);
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), true);

		t1.setVisible(false);
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), false);

		t1.setVisible(true);
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), true);

		t1.setWidth("0px");
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), false);

		t1.setWidth();
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), true);

		this.oToolbar.destroyBegin();
		assert.strictEqual(this.oToolbar._oBeginSeparator.getVisible(), false);
	});

	QUnit.test("Destroy", function (assert) {
		const oBeginSeparator = this.oToolbar._oBeginSeparator;
		const oSpacer = this.oToolbar._oSpacer;
		const oButtonBegin1 = new Button();
		this.oToolbar.addBegin(oButtonBegin1);
		const oButtonBetween1 = new Button();
		this.oToolbar.addBetween(oButtonBetween1);
		const oButtonEnd1 = new Button();
		this.oToolbar.addEnd(oButtonEnd1);
		const oAction1 = new ActionToolbarAction({
			action: new Button()
		});
		this.oToolbar.addAction(oAction1);
		checkAggregation(assert, this.oToolbar, "content", [
			oButtonBegin1, oBeginSeparator, oButtonBetween1, oSpacer, oAction1, this.oToolbar._oEndActionsBeginSeparator, oButtonEnd1, this.oToolbar._oEndActionsEndSeparator
		], "After creation");

		this.oToolbar.destroy();

		assert.ok(this.oToolbar.bIsDestroyed, "Toolbar destroyed");
		assert.ok(oBeginSeparator.bIsDestroyed, "Separator1 destroyed");
		assert.ok(oSpacer.bIsDestroyed, "Spacer destroyed");
		assert.ok(this.oToolbar._oEndActionsBeginSeparator.bIsDestroyed, "Action - Separator destroyed");
		assert.ok(this.oToolbar._oEndActionsEndSeparator.bIsDestroyed, "Action - Separator destroyed");
		assert.ok(oButtonBegin1.bIsDestroyed, "Begin destroyed");
		assert.ok(oButtonEnd1.bIsDestroyed, "End destroyed");
		assert.ok(oAction1.bIsDestroyed, "Actions destroyed");

		this.oToolbar.destroyAggregation("actions"); // see BCP 1980169751, should not lead to an error

		this.oToolbar = null;
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - addAggregations", {
		beforeEach: async function() {
			this.oToolbarAddAggregations = new ActionToolbar({
				width: "100%"
			});
			this.oToolbarAddAggregations.placeAt("content");
			this.oBeginSeparator = this.oToolbarAddAggregations._oBeginSeparator;
			this.oSpacer = this.oToolbarAddAggregations._oSpacer;
			this.oEndActionsBeginSeparator = this.oToolbarAddAggregations._oEndActionsBeginSeparator;
			this.oEndActionsEndSeparator = this.oToolbarAddAggregations._oEndActionsEndSeparator;
			await nextUIUpdate();
		},
		afterEach: function () {
			if (this.oToolbarAddAggregations) {
				this.oToolbarAddAggregations.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
			if (this.oEndActionsEndSeparator) {
				this.oEndActionsEndSeparator = undefined;
			}
		}
	});

	QUnit.test("addBegin", function (assert) {
		const oButtonBegin1 = new Button();
		const oButtonBegin2 = new Button();

		this.oToolbarAddAggregations.addBegin(oButtonBegin1);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			oButtonBegin1, this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After addBegin");
		checkAggregation(assert, this.oToolbarAddAggregations, "begin", [
			oButtonBegin1
		], "After addBegin", oButtonBegin1);

		this.oToolbarAddAggregations.addBegin(oButtonBegin2);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			oButtonBegin1, oButtonBegin2, this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After addBegin");
		checkAggregation(assert, this.oToolbarAddAggregations, "begin", [
			oButtonBegin1, oButtonBegin2
		], "After addBegin", oButtonBegin2);
	});

	QUnit.test("addBetween", function (assert) {
		const oButtonBetween1 = new Button();
		const oButtonBetween2 = new Button();

		this.oToolbarAddAggregations.addBetween(oButtonBetween1);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, oButtonBetween1, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After addBetween");
		checkAggregation(assert, this.oToolbarAddAggregations, "between", [
			oButtonBetween1
		], "After addBetween", oButtonBetween1);

		this.oToolbarAddAggregations.addBetween(oButtonBetween2);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, oButtonBetween1, oButtonBetween2, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After addBetween");
		checkAggregation(assert, this.oToolbarAddAggregations, "between", [
			oButtonBetween1, oButtonBetween2
		], "After addBetween", oButtonBetween2);
	});

	QUnit.test("addEnd", function (assert) {
		const oButtonEnd1 = new Button();
		const oButtonEnd2 = new Button();

		this.oToolbarAddAggregations.addEnd(oButtonEnd1);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After addEnd");
		checkAggregation(assert, this.oToolbarAddAggregations, "end", [
			oButtonEnd1
		], "After addEnd", oButtonEnd1);

		this.oToolbarAddAggregations.addEnd(oButtonEnd2);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd1, oButtonEnd2, this.oEndActionsEndSeparator
		], "After addEnd");
		checkAggregation(assert, this.oToolbarAddAggregations, "end", [
			oButtonEnd1, oButtonEnd2
		], "After addEnd", oButtonEnd2);
	});

	QUnit.test("addAction", function (assert) {
		const oButtonEnd1 = new Button();
		const oAction1 = new ActionToolbarAction({
			visible: true,
			action: new Button({
				text: "Action1"
			}),
			layoutInformation: {
				aggregationName: "end",
				alignment: ActionToolbarActionAlignment.End
			}
		});
		const oAction2 = new ActionToolbarAction({
			visible: true,
			action: new Button({
				text: "Action2"
			}),
			layoutInformation: {
				aggregationName: "end",
				alignment: ActionToolbarActionAlignment.Begin
			}
		});
		const oAction3 = new ActionToolbarAction({
			action: new Button({
				text: "Action3"
			}),
			layoutInformation: {
				aggregationName: "end",
				alignment: ActionToolbarActionAlignment.End
			}
		});
		const oAction4 = new ActionToolbarAction({
			action: new Button({
				text: "Action4"
			}),
			layoutInformation: {
				aggregationName: "end",
				alignment: ActionToolbarActionAlignment.Begin
			}
		});

		this.oToolbarAddAggregations.addEnd(oButtonEnd1);

		this.oToolbarAddAggregations.addAction(oAction1);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator, oAction1
		], "After addAction 'end' alignment 'right'");
		assert.deepEqual(this.oToolbarAddAggregations.getActions(), [oAction1], "After addAction 'end' alignment 'end' - getActions correct");
		checkAggregation(assert, this.oToolbarAddAggregations, "actions", [
			oAction1
		], "After addAction", oAction1);

		this.oToolbarAddAggregations.addAction(oAction2);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator, oAction1
		], "After addAction 'end' alignment 'left'");
		assert.deepEqual(this.oToolbarAddAggregations.getActions(), [oAction1, oAction2], "After addAction 'end' alignment 'begin' - getActions correct");
		checkAggregation(assert, this.oToolbarAddAggregations, "actions", [
			oAction1, oAction2
		], "After After addAction", oAction2);

		this.oToolbarAddAggregations.addAction(oAction3);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator, oAction1, oAction3
		], "After addAction 'end' alignment 'right'");
		assert.deepEqual(this.oToolbarAddAggregations.getActions(), [oAction1, oAction2, oAction3], "After addAction 'end' alignment 'end' - getActions correct");
		checkAggregation(assert, this.oToolbarAddAggregations, "actions", [
			oAction1, oAction2, oAction3
		], "After addAction", oAction2);

		this.oToolbarAddAggregations.addAction(oAction4);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, oAction4, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator, oAction1, oAction3
		], "After addAction 'end' alignment 'left'");
		assert.deepEqual(this.oToolbarAddAggregations.getActions(), [oAction1, oAction2, oAction3, oAction4], "After addAction 'end' alignment 'begin' - getActions correct");
		checkAggregation(assert, this.oToolbarAddAggregations, "actions", [
			oAction1, oAction2, oAction3, oAction4
		], "After addAction", oAction2);

		this.oToolbarAddAggregations.addAction(null);
		checkAggregation(assert, this.oToolbarAddAggregations, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, oAction4, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator, oAction1, oAction3
		], "After addAction of null");
		assert.deepEqual(this.oToolbarAddAggregations.getActions(), [oAction1, oAction2, oAction3, oAction4], "After addAction 'end' alignment 'begin' - getActions correct");
		checkAggregation(assert, this.oToolbarAddAggregations, "actions", [
			oAction1, oAction2, oAction3, oAction4
		], "After addAction", oAction2);
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - indexOfAggregations", {
		before: function (assert) {
			this.oToolbaIndexOfAggregations = new ActionToolbar();
			this.oBeginSeparator = this.oToolbaIndexOfAggregations._oBeginSeparator;
			this.oSpacer = this.oToolbaIndexOfAggregations._oSpacer;

			this.oButtonNotContainer = new Button();
			this.oButtonBegin = new Button();
			this.oButtonBetween = new Button();
			this.oAction = new ActionToolbarAction({
				action: new Button()
			});
			this.oButtonEnd = new Button();

			this.oToolbaIndexOfAggregations.addBegin(this.oButtonBegin);
			this.oToolbaIndexOfAggregations.addBetween(this.oButtonBetween);
			this.oToolbaIndexOfAggregations.addAction(this.oAction);
			this.oToolbaIndexOfAggregations.addEnd(this.oButtonEnd);
		},
		after: function () {
			if (this.oToolbaIndexOfAggregations) {
				this.oToolbaIndexOfAggregations.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
		}
	});

	QUnit.test("indexOfBegin", function (assert) {
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBegin(this.oButtonNotContainer), -1, "Index of Begin (Not contained)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBegin(this.oButtonBegin), 0, "Index of Begin (Begin Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBegin(this.oButtonBetween), -1, "Index of Begin (Between Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBegin(this.oAction), -1, "Index of Begin (Action Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBegin(this.oButtonEnd), -1, "Index of Begin (End Content)");
	});

	QUnit.test("indexOfBetween", function (assert) {
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBetween(this.oButtonNotContainer), -1, "Index of Between (Not contained)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBetween(this.oButtonBegin), -1, "Index of Between (Begin Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBetween(this.oButtonBetween), 0, "Index of Between (Between Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBetween(this.oAction), -1, "Index of Between (Action Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfBetween(this.oButtonEnd), -1, "Index of Between (End Content)");
	});

	QUnit.test("indexOfAction", function (assert) {
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfAction(this.oButtonNotContainer), -1, "Index of Action (Not contained)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfAction(this.oButtonBegin), -1, "Index of Action (Begin Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfAction(this.oButtonBetween), -1, "Index of Action (Between Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfAction(this.oAction), 0, "Index of Action (Action Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfAction(this.oButtonEnd), -1, "Index of Action (End Content)");
	});

	QUnit.test("indexOfEnd", function (assert) {
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfEnd(this.oButtonNotContainer), -1, "Index of End (Not contained)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfEnd(this.oButtonBegin), -1, "Index of End (Begin Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfEnd(this.oButtonBetween), -1, "Index of End (Between Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfEnd(this.oAction), -1, "Index of End (Action Content)");
		assert.strictEqual(this.oToolbaIndexOfAggregations.indexOfEnd(this.oButtonEnd), 0, "Index of End (End Content)");
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - insertAggregations", {
		beforeEach: function () {
			this.oToolbarInsertAggregation = new ActionToolbar();
			this.oBeginSeparator = this.oToolbarInsertAggregation._oBeginSeparator;
			this.oSpacer = this.oToolbarInsertAggregation._oSpacer;
			this.oEndActionsBeginSeparator = this.oToolbarInsertAggregation._oEndActionsBeginSeparator;
			this.oEndActionsEndSeparator = this.oToolbarInsertAggregation._oEndActionsEndSeparator;
		},
		afterEach: function () {
			if (this.oToolbarInsertAggregation) {
				this.oToolbarInsertAggregation.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
			if (this.oEndActionsEndSeparator) {
				this.oEndActionsEndSeparator = undefined;
			}
		}
	});

	QUnit.test("insertBegin", function (assert) {
		const oButtonBegin1 = new Button();
		this.oToolbarInsertAggregation.insertBegin(oButtonBegin1, 0);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			oButtonBegin1, this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "begin", [
			oButtonBegin1
		], "After insertBegin", oButtonBegin1);

		const oButtonBegin2 = new Button();
		this.oToolbarInsertAggregation.insertBegin(oButtonBegin2, -5);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			oButtonBegin2, oButtonBegin1, this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "begin", [
			oButtonBegin2, oButtonBegin1
		], "After insertBegin", oButtonBegin2);

		const oButtonBegin3 = new Button();
		this.oToolbarInsertAggregation.insertBegin(oButtonBegin3, 100);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			oButtonBegin2, oButtonBegin1, oButtonBegin3, this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "begin", [
			oButtonBegin2, oButtonBegin1, oButtonBegin3
		], "After insertBegin", oButtonBegin3);
	});

	QUnit.test("insertBetween", function (assert) {
		const oButtonBetween1 = new Button();
		this.oToolbarInsertAggregation.insertBetween(oButtonBetween1, 0);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, oButtonBetween1, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "between", [
			oButtonBetween1
		], "After insertBetween", oButtonBetween1);

		const oButtonBetween2 = new Button();
		this.oToolbarInsertAggregation.insertBetween(oButtonBetween2, -5);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, oButtonBetween2, oButtonBetween1, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "between", [
			oButtonBetween2, oButtonBetween1
		], "After insertBetween", oButtonBetween2);

		const oButtonBetween3 = new Button();
		this.oToolbarInsertAggregation.insertBetween(oButtonBetween3, 100);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, oButtonBetween2, oButtonBetween1, oButtonBetween3, this.oSpacer, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After insertBegin");
		checkAggregation(assert, this.oToolbarInsertAggregation, "between", [
			oButtonBetween2, oButtonBetween1, oButtonBetween3
		], "After insertBetween", oButtonBetween3);
	});

	QUnit.test("insertEnd", function (assert) {
		const oButtonEnd1 = new Button();
		this.oToolbarInsertAggregation.insertEnd(oButtonEnd1, 0);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertEnd");
		checkAggregation(assert, this.oToolbarInsertAggregation, "end", [
			oButtonEnd1
		], "After insertEnd", oButtonEnd1);

		const oButtonEnd2 = new Button();
		this.oToolbarInsertAggregation.insertEnd(oButtonEnd2, -5);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd2, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertEnd");
		checkAggregation(assert, this.oToolbarInsertAggregation, "end", [
			oButtonEnd2, oButtonEnd1
		], "After insertEnd", oButtonEnd2);

		const oButtonEnd3 = new Button();
		this.oToolbarInsertAggregation.insertEnd(oButtonEnd3, 100);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, this.oEndActionsBeginSeparator, oButtonEnd2, oButtonEnd1, oButtonEnd3, this.oEndActionsEndSeparator
		], "After insertEnd");
		checkAggregation(assert, this.oToolbarInsertAggregation, "end", [
			oButtonEnd2, oButtonEnd1, oButtonEnd3
		], "After insertEnd", oButtonEnd3);
	});

	QUnit.test("insertAction", function (assert) {
		const oButtonEnd1 = new Button();
		this.oToolbarInsertAggregation.addEnd(oButtonEnd1);
		const oAction1 = new ActionToolbarAction({
			action: new Button()
		});
		this.oToolbarInsertAggregation.insertAction(oAction1, 0);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, oAction1, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertAction");
		checkAggregation(assert, this.oToolbarInsertAggregation, "actions", [
			oAction1
		], "After insertAction", oAction1);

		const oAction2 = new ActionToolbarAction({
			action: new Button()
		});
		this.oToolbarInsertAggregation.insertAction(oAction2, -5);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, oAction1, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertAction");
		checkAggregation(assert, this.oToolbarInsertAggregation, "actions", [
			oAction2, oAction1
		], "After insertAction", oAction2);

		const oAction3 = new ActionToolbarAction({
			action: new Button()
		});
		this.oToolbarInsertAggregation.insertAction(oAction3, 100);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, oAction1, oAction3, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertAction");
		checkAggregation(assert, this.oToolbarInsertAggregation, "actions", [
			oAction2, oAction1, oAction3
		], "After insertAction", oAction3);

		this.oToolbarInsertAggregation.insertAction(null);
		checkAggregation(assert, this.oToolbarInsertAggregation, "content", [
			this.oBeginSeparator, this.oSpacer, oAction2, oAction1, oAction3, this.oEndActionsBeginSeparator, oButtonEnd1, this.oEndActionsEndSeparator
		], "After insertAction of nothing");
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - removeAggregations", {
		beforeEach: function () {
			this.oButtonBegin1 = new Button();
			this.oButtonBegin2 = new Button();
			this.oButtonBetween1 = new Button();
			this.oButtonBetween2 = new Button();
			this.oAction1 = new ActionToolbarAction({
				action: new Button()
			});
			this.oAction2 = new ActionToolbarAction({
				action: new Button()
			});
			this.oButtonEnd1 = new Button();
			this.oButtonEnd2 = new Button();

			this.oToolbarRemoveAggregation = new ActionToolbar({
				actions: [this.oAction1, this.oAction2],
				begin: [this.oButtonBegin1, this.oButtonBegin2],
				between: [this.oButtonBetween1, this.oButtonBetween2],
				end: [this.oButtonEnd1, this.oButtonEnd2]
			});
			this.oBeginSeparator = this.oToolbarRemoveAggregation._oBeginSeparator;
			this.oSpacer = this.oToolbarRemoveAggregation._oSpacer;
			this.oEndActionsBeginSeparator = this.oToolbarRemoveAggregation._oEndActionsBeginSeparator;
			this.oEndActionsEndSeparator = this.oToolbarRemoveAggregation._oEndActionsEndSeparator;
		},
		afterEach: function () {
			if (this.oToolbarRemoveAggregation) {
				this.oToolbarRemoveAggregation.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
			if (this.oEndActionsEndSeparator) {
				this.oEndActionsEndSeparator = undefined;
			}
		}
	});

	QUnit.test("removeBegin", function (assert) {
		const oResult = this.oToolbarRemoveAggregation.removeBegin(this.oButtonBegin1);
		checkAggregation(assert, this.oToolbarRemoveAggregation, "content", [
			this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeBegin");
		checkAggregation(assert, this.oToolbarRemoveAggregation, "begin", [
			this.oButtonBegin2
		], "After removeBegin", this.oButtonBegin1);
		assert.ok(oResult === this.oButtonBegin1, "After removeBegin - removed content");
	});

	QUnit.test("removeBetween", function (assert) {
		const oResult = this.oToolbarRemoveAggregation.removeBetween(this.oButtonBetween1);
		checkAggregation(assert, this.oToolbarRemoveAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeBegin");
		checkAggregation(assert, this.oToolbarRemoveAggregation, "between", [
			this.oButtonBetween2
		], "After removeBetween", this.oButtonBetween1);
		assert.ok(oResult === this.oButtonBetween1, "After removeBetween - removed content");
	});

	QUnit.test("removeAction", function (assert) {
		const oResult = this.oToolbarRemoveAggregation.removeAction(this.oAction1);
		checkAggregation(assert, this.oToolbarRemoveAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeAction");
		checkAggregation(assert, this.oToolbarRemoveAggregation, "actions", [
			this.oAction2
		], "After removeAction", this.oAction1);
		assert.ok(oResult === this.oAction1, "After removeAction - removed content");
	});

	QUnit.test("removeEnd", function (assert) {
		const oResult = this.oToolbarRemoveAggregation.removeEnd(this.oButtonEnd1);
		checkAggregation(assert, this.oToolbarRemoveAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeEnd");
		checkAggregation(assert, this.oToolbarRemoveAggregation, "end", [
			this.oButtonEnd2
		], "After removeEnd", this.oButtonEnd1);
		assert.ok(oResult === this.oButtonEnd1, "After removeEnd - removed content");
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - removeAllAggregations", {
		beforeEach: function () {
			this.oButtonBegin1 = new Button();
			this.oButtonBegin2 = new Button();
			this.oButtonBetween1 = new Button();
			this.oButtonBetween2 = new Button();
			this.oAction1 = new ActionToolbarAction({
				action: new Button()
			});
			this.oAction2 = new ActionToolbarAction({
				action: new Button()
			});
			this.oButtonEnd1 = new Button();
			this.oButtonEnd2 = new Button();

			this.oToolbarRemoveAllAggregation = new ActionToolbar({
				actions: [this.oAction1, this.oAction2],
				begin: [this.oButtonBegin1, this.oButtonBegin2],
				between: [this.oButtonBetween1, this.oButtonBetween2],
				end: [this.oButtonEnd1, this.oButtonEnd2]
			});
			this.oBeginSeparator = this.oToolbarRemoveAllAggregation._oBeginSeparator;
			this.oSpacer = this.oToolbarRemoveAllAggregation._oSpacer;
			this.oEndActionsBeginSeparator = this.oToolbarRemoveAllAggregation._oEndActionsBeginSeparator;
			this.oEndActionsEndSeparator = this.oToolbarRemoveAllAggregation._oEndActionsEndSeparator;
		},
		afterEach: function () {
			if (this.oToolbarRemoveAllAggregation) {
				this.oToolbarRemoveAllAggregation.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
			if (this.oEndActionsEndSeparator) {
				this.oEndActionsEndSeparator = undefined;
			}
		}
	});

	QUnit.test("removeAllBegin", function (assert) {
		const oResult = this.oToolbarRemoveAllAggregation.removeAllBegin();
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "content", [
			this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeAllBegin");
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "begin", [], "After removeAllBegin");
		assert.ok(oResult.length === 2, "After removeAllBegin - removed content");
	});

	QUnit.test("removeAllBetween", function (assert) {
		const oResult = this.oToolbarRemoveAllAggregation.removeAllBetween();
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeAllBetween");
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "between", [], "After removeAllBetween");
		assert.ok(oResult.length === 2, "After removeAllBetween - removed content");
	});

	QUnit.test("removeAllActions", function (assert) {
		const oResult = this.oToolbarRemoveAllAggregation.removeAllActions();
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After removeAllActions");
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "actions", [], "After removeAllActions");
		assert.ok(oResult.length === 2, "After removeAllActions - removed content");
	});

	QUnit.test("removeAllEnd", function (assert) {
		const oResult = this.oToolbarRemoveAllAggregation.removeAllEnd();
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After removeAllEnd");
		checkAggregation(assert, this.oToolbarRemoveAllAggregation, "end", [], "After removeAllEnd");
		assert.ok(oResult.length === 2, "After removeAllEnd - removed content");
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - destroyAggregation", {
		beforeEach: function () {
			this.oButtonBegin1 = new Button();
			this.oButtonBegin2 = new Button();
			this.oButtonBetween1 = new Button();
			this.oButtonBetween2 = new Button();
			this.oAction1 = new ActionToolbarAction({
				action: new Button()
			});
			this.oAction2 = new ActionToolbarAction({
				action: new Button()
			});
			this.oButtonEnd1 = new Button();
			this.oButtonEnd2 = new Button();

			this.oToolbarDestroyAggregation = new ActionToolbar({
				actions: [this.oAction1, this.oAction2],
				begin: [this.oButtonBegin1, this.oButtonBegin2],
				between: [this.oButtonBetween1, this.oButtonBetween2],
				end: [this.oButtonEnd1, this.oButtonEnd2]
			});
			this.oBeginSeparator = this.oToolbarDestroyAggregation._oBeginSeparator;
			this.oSpacer = this.oToolbarDestroyAggregation._oSpacer;
			this.oEndActionsBeginSeparator = this.oToolbarDestroyAggregation._oEndActionsBeginSeparator;
			this.oEndActionsEndSeparator = this.oToolbarDestroyAggregation._oEndActionsEndSeparator;
		},
		afterEach: function () {
			if (this.oToolbarDestroyAggregation) {
				this.oToolbarDestroyAggregation.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oSpacer) {
				this.oSpacer = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
			if (this.oEndActionsEndSeparator) {
				this.oEndActionsEndSeparator = undefined;
			}
		}
	});

	QUnit.test("destroyBegin", function (assert) {
		this.oToolbarDestroyAggregation.destroyBegin();
		checkAggregation(assert, this.oToolbarDestroyAggregation, "content", [
			this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After destroyBegin");
		checkAggregation(assert, this.oToolbarDestroyAggregation, "begin", [], "After destroyBegin");
	});

	QUnit.test("destroyBetween", function (assert) {
		this.oToolbarDestroyAggregation.destroyBetween();
		checkAggregation(assert, this.oToolbarDestroyAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After destroyBetween");
		checkAggregation(assert, this.oToolbarDestroyAggregation, "between", [], "After destroyBetween");
	});

	QUnit.test("destroyActions", function (assert) {
		this.oToolbarDestroyAggregation.destroyActions();
		checkAggregation(assert, this.oToolbarDestroyAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oEndActionsBeginSeparator, this.oButtonEnd1, this.oButtonEnd2, this.oEndActionsEndSeparator
		], "After destroyActions");
		assert.deepEqual(this.oToolbarDestroyAggregation.getActions(), [], "After destroyActions");
	});

	QUnit.test("destroyEnd", function (assert) {
		this.oToolbarDestroyAggregation.destroyEnd();
		checkAggregation(assert, this.oToolbarDestroyAggregation, "content", [
			this.oButtonBegin1, this.oButtonBegin2, this.oBeginSeparator, this.oButtonBetween1, this.oButtonBetween2, this.oSpacer, this.oAction1, this.oAction2, this.oEndActionsBeginSeparator, this.oEndActionsEndSeparator
		], "After destroyEnd");
		checkAggregation(assert, this.oToolbarDestroyAggregation, "end", [], "After destroyEnd");
	});

	QUnit.module("_endOrder Property");

	QUnit.test("aggregation order", async function(assert) {
		const sText = "ABCDEFGHI";
		const aOrder = [...sText];

		for (let i = 0; i < 10; i++) {
			const aRandomOrder1 = aOrder.slice().sort(() => Math.random() - 0.5);
			const oToolbar = new ActionToolbar({
				end: aRandomOrder1.map((sLetter) => new Button(sLetter, { text: sLetter }))
			});

			oToolbar.setProperty("_endOrder", aOrder);
			oToolbar.placeAt("qunit-fixture");
			await nextUIUpdate();
			assert.equal(oToolbar.getDomRef().textContent, sText, `End aggregation in the constructor: ${aRandomOrder1} => ${aOrder}`);
			oToolbar.destroyEnd();

			const aRandomOrder2 = aOrder.slice().sort(() => Math.random() - 0.5);
			aRandomOrder2.forEach((sLetter) => oToolbar.insertEnd(new Button(sLetter, { text: sLetter }), 0));
			await nextUIUpdate();
			assert.equal(oToolbar.getDomRef().textContent, sText, `End aggregation filled by insertEnd: ${aRandomOrder2} => ${aOrder}`);
			oToolbar.destroyEnd();

			const aRandomOrder3 = aOrder.concat("X").sort(() => Math.random() - 0.5);
			aRandomOrder3.forEach((sLetter) => oToolbar.addEnd(new Button(sLetter, { text: sLetter })));
			await nextUIUpdate();
			assert.equal(oToolbar.getDomRef().textContent, sText + "X", `Unknown button X is at the end: ${aRandomOrder3} => ${aOrder},X`);
			oToolbar.destroyEnd();

			const aRandomOrder4 = aOrder.slice().sort(() => Math.random() - 0.5);
			const sRemovedLetter = aRandomOrder4.pop();
			const sNewText = sText.replace(sRemovedLetter, "");
			aRandomOrder4.forEach((sLetter) => oToolbar.addEnd(new Button(sLetter, { text: sLetter })));
			await nextUIUpdate();
			assert.equal(oToolbar.getDomRef().textContent, sNewText, `Button ${sRemovedLetter} removed: ${aRandomOrder4} => ${sNewText}`);

			const aRandomOrder5 = aRandomOrder4.slice().sort(() => Math.random() - 0.5);
			const sRandomOrder5 = aRandomOrder5.join("");
			oToolbar.setProperty("_endOrder", aRandomOrder5);
			await nextUIUpdate();
			assert.equal(oToolbar.getDomRef().textContent, sRandomOrder5, `_endOrder changed without aggregation change: ${aRandomOrder5}`);
			oToolbar.destroy();
		}
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - _updateSeparators", {
		beforeEach: function () {
			this.oButtonBegin1 = new Button();
			this.oButtonBegin2 = new Button();
			this.oButtonBetween1 = new Button();
			this.oButtonBetween2 = new Button();
			this.oAction1 = new ActionToolbarAction({
				action: new Button()
			});
			this.oAction2 = new ActionToolbarAction({
				action: new Button()
			});
			this.oButtonEnd1 = new Button();
			this.oButtonEnd2 = new Button();

			this.oToolbarUpdateSeparators = new ActionToolbar({
				actions: [this.oAction1, this.oAction2],
				begin: [this.oButtonBegin1, this.oButtonBegin2],
				between: [this.oButtonBetween1, this.oButtonBetween2],
				end: [this.oButtonEnd1, this.oButtonEnd2]
			});
			this.oBeginSeparator = this.oToolbarUpdateSeparators._oBeginSeparator;
			this.oEndActionsBeginSeparator = this.oToolbarUpdateSeparators._oEndActionsBeginSeparator;
		},
		afterEach: function () {
			if (this.oToolbarUpdateSeparators) {
				this.oToolbarUpdateSeparators.destroy();
			}
			if (this.oBeginSeparator) {
				this.oBeginSeparator = undefined;
			}
			if (this.oEndActionsBeginSeparator) {
				this.oEndActionsBeginSeparator = undefined;
			}
		}
	});

	QUnit.test("called when 'visible' property of Begin aggregation changes", function (assert) {
		const oToolbar = this.oToolbarUpdateSeparators;
		const fnUpdateSeparatorsSpy = sinon.spy(oToolbar, "_updateSeparators");

		assert.ok(fnUpdateSeparatorsSpy.notCalled, "_updateSeparators not called yet.");
		assert.ok(this.oBeginSeparator.getVisible(), "Begin separator is visible.");

		assert.ok(this.oButtonBegin1.getVisible(), "ButtonBegin1 is visible.");
		assert.ok(this.oButtonBegin2.getVisible(), "ButtonBegin2 is visible.");

		this.oButtonBegin1.setVisible(false);
		assert.notOk(this.oButtonBegin1.getVisible(), "ButtonBegin1 is invisible.");
		assert.ok(fnUpdateSeparatorsSpy.calledOnce, "_updateSeparators called after setting visibility of ButtonBegin1.");
		assert.ok(this.oBeginSeparator.getVisible(), "Begin separator is still visible.");

		this.oButtonBegin2.setVisible(false);
		assert.notOk(this.oButtonBegin2.getVisible(), "ButtonBegin2 is invisible.");
		assert.notOk(this.oBeginSeparator.getVisible(), "Begin separator is invisible.");
		fnUpdateSeparatorsSpy.reset();
	});

	QUnit.test("called when 'visible' property of ActionToolbarAction changes", function (assert) {
		const oToolbar = this.oToolbarUpdateSeparators;
		const fnUpdateSeparatorsSpy = sinon.spy(oToolbar, "_updateSeparators");

		assert.ok(fnUpdateSeparatorsSpy.notCalled, "_updateSeparators not called yet.");
		assert.ok(this.oEndActionsBeginSeparator.getVisible(), "separator is visible.");

		// Set visibility of action aggregation directly
		assert.ok(this.oAction1.getVisible(), "Action1 is visible.");
		this.oAction1.setVisible(false);
		assert.notOk(this.oAction1.getVisible(), "Action 1 is invisible.");

		assert.ok(fnUpdateSeparatorsSpy.calledOnce, "_updateSeparators called after setting visibility directly.");
		assert.ok(this.oEndActionsBeginSeparator.getVisible(), "separator is visible.");

		// Set visiblity of action aggregation indirectly
		assert.ok(this.oAction2.getVisible(), "Action2 is visible.");
		this.oAction2.getAction().setVisible(false);
		assert.ok(this.oAction2.getVisible(), "Action 2 is visible.");
		assert.notOk(this.oAction2.getAction().getVisible(), "Action 2 inner action is visible.");

		assert.ok(fnUpdateSeparatorsSpy.calledTwice, "_updateSeparators called after setting visibility indirectly.");
		assert.notOk(this.oEndActionsBeginSeparator.getVisible(), "separator is invisible.");
		fnUpdateSeparatorsSpy.reset();
	});

	QUnit.test("called when 'action' aggregation of ActionToolbarAction changes", function (assert) {
		const oToolbar = this.oToolbarUpdateSeparators;
		const fnUpdateSeparatorsSpy = sinon.spy(oToolbar, "_updateSeparators");

		assert.ok(fnUpdateSeparatorsSpy.notCalled, "_updateSeparators not called yet.");
		assert.ok(this.oEndActionsBeginSeparator.getVisible(), "separator is visible.");

		// Remove action aggregation
		assert.ok(this.oAction1.getAction(), "Action1 has an 'action'.");
		this.oAction1.setAction(undefined);
		assert.notOk(this.oAction1.getAction(), "Action1 has no 'action'.");

		assert.ok(fnUpdateSeparatorsSpy.calledOnce, "_updateSeparators called after removing aggregation.");
		assert.ok(this.oEndActionsBeginSeparator.getVisible(), "separator is visible as there is another action.");

		// Remove action aggregation
		assert.ok(this.oAction2.getAction(), "Action2 has an 'action'.");
		this.oAction2.setAction(undefined);
		assert.notOk(this.oAction2.getAction(), "Action2 has no 'action'.");

		assert.ok(fnUpdateSeparatorsSpy.calledTwice, "_updateSeparators called after removing aggregation.");
		assert.notOk(this.oEndActionsBeginSeparator.getVisible(), "separator is invisible as there is no other action.");

		fnUpdateSeparatorsSpy.reset();
	});

	QUnit.module("sap.ui.mdc.ActionToolbar - _getEnabledFromDesignTime", {
		beforeEach: function () {
			this.oAction1 = new ActionToolbarAction({
				action: new Button()
			});
			this.oAction2 = new ActionToolbarAction({
				action: new Button()
			});

			this.oDesignTimeToolbar = new ActionToolbar({
				actions: [this.oAction1, this.oAction2]
			});
		},
		afterEach: function () {
			if (this.oDesignTimeToolbar) {
				this.oDesignTimeToolbar.destroy();
			}
		}
	});

	QUnit.test("returns true for undefined design time object", async function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = await this.oAction1.getAction().getMetadata().loadDesignTime(this.oAction1);

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.ok(bEnabled, "Enabled is true");
	});

	QUnit.test("returns true for missing 'actions' property", function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = { anyprop: "not-adaptable" };

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.ok(bEnabled, "Enabled is true");
	});

	QUnit.test("returns false not-adaptable property", function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = { actions: "not-adaptable" };

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.notOk(bEnabled, "Enabled is false");
	});

	QUnit.test("returns false for nullish 'reveal' property", function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = {
			actions: {
				reveal: null,
				remove: "anyData"
			}
		};

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.notOk(bEnabled, "Enabled is false");
	});

	QUnit.test("returns false for nullish 'remove' property", function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = {
			actions: {
				reveal: "anyData",
				remove: null
			}
		};

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.notOk(bEnabled, "Enabled is false");
	});

	QUnit.test("returns true if anything is correct", function (assert) {
		// arrange
		const oToolbar = this.oDesignTimeToolbar;
		const oDesignTimeData = {
			actions: {
				reveal: "anyData",
				remove: "anyData"
			}
		};

		// act
		const bEnabled = oToolbar._getEnabledFromDesignTime(oDesignTimeData);

		// assert
		assert.ok(bEnabled, "Enabled is true");
	});

});