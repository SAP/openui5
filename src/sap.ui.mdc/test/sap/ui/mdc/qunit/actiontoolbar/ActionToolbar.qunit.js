/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/ActionToolbar", "sap/m/Button", "sap/m/Title", "sap/m/Text"
], function(ActionToolbar, Button, Title, Text) {
	"use strict";

	QUnit.module("sap.ui.mdc.ActionToolbar", {
		before: function(assert) {
			//
		},
		after: function() {
			//
		},
		beforeEach: function(assert) {
			this.oToolbar = new ActionToolbar();
		},
		afterEach: function() {
			if (this.oToolbar) {
				this.oToolbar.destroy();
			}
		}
	});

	function checkAggregation(assert, oToolbar, sAggregation, aExpectedContent, sText, oObj) {
		var oAggregation = oToolbar.getMetadata().getAggregation(sAggregation);
		var aContent = oToolbar[oAggregation._sGetter]();
		assert.strictEqual(aContent.length, aExpectedContent.length, sText + " - " + oAggregation._sGetter + "().length");
		for (var i = 0; i < aContent.length; i++) {
			assert.ok(aContent[i] === aExpectedContent[i], sText + " - " + sAggregation + " " + i);
		}
		if (oObj) {
			assert.strictEqual(oToolbar[oAggregation._sIndexGetter](oObj), aExpectedContent.indexOf(oObj), oAggregation._sIndexGetter);
		}
	}

	QUnit.test("Instantiation", function(assert) {
		assert.ok(this.oToolbar);
		checkAggregation(assert, this.oToolbar, "content", [
			this.oToolbar._oTitleSeparator, this.oToolbar._oSpacer, this.oToolbar._oActionSeparator
		], "Default Content");
	});

	QUnit.test("Aggregations (begin, end, actions)", function(assert) {
		var s0 = this.oToolbar._oTitleSeparator;
		var s1 = this.oToolbar._oSpacer;
		var s2 = this.oToolbar._oActionSeparator;
		var ext = new Button();

		var b1 = new Button();
		this.oToolbar.addBegin(b1);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, s0, s1, s2
		], "After addBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b1
		], "After addBegin", b1);

		var b2 = new Button();
		this.oToolbar.addBegin(b2);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, s1, s2
		], "After addBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b1, b2
		], "After addBegin", b2);

		var bw1 = new Button();
		this.oToolbar.addBetween(bw1);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, s1, s2
		], "After addBetween");
		checkAggregation(assert, this.oToolbar, "between", [
			bw1
		], "After addBetween", bw1);

		var bw2 = new Button();
		this.oToolbar.addBetween(bw2);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, s2
		], "After addBetween");
		checkAggregation(assert, this.oToolbar, "between", [
			bw1, bw2
		], "After addBetween", bw2);

		var e1 = new Button();
		this.oToolbar.addEnd(e1);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, s2, e1
		], "After addEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e1
		], "After addEnd", e1);

		var e2 = new Button();
		this.oToolbar.addEnd(e2);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, s2, e1, e2
		], "After addEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e1, e2
		], "After addEnd", e2);

		var a1 = new Button();
		this.oToolbar.addAction(a1);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, a1, s2, e1, e2
		], "After addAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a1
		], "After addAction", a1);

		var a2 = new Button();
		this.oToolbar.addAction(a2);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, a1, a2, s2, e1, e2
		], "After addAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a1, a2
		], "After addAction", a2);

		assert.strictEqual(this.oToolbar.indexOfBegin(ext), -1, "Index of Begin (Not contained)");
		assert.strictEqual(this.oToolbar.indexOfBetween(ext), -1, "Index of Between (Not contained)");
		assert.strictEqual(this.oToolbar.indexOfEnd(ext), -1, "Index of End (Not contained)");
		assert.strictEqual(this.oToolbar.indexOfAction(ext), -1, "Index of Action (Not contained)");

		assert.strictEqual(this.oToolbar.indexOfBegin(e2), -1, "Index of Begin (End Content)");
		assert.strictEqual(this.oToolbar.indexOfBetween(e2), -1, "Index of Between (End Content)");
		assert.strictEqual(this.oToolbar.indexOfAction(e2), -1, "Index of Action (End Content)");

		assert.strictEqual(this.oToolbar.indexOfBegin(a2), -1, "Index of Begin (Action Content)");
		assert.strictEqual(this.oToolbar.indexOfBetween(a2), -1, "Index of Between (Action Content)");
		assert.strictEqual(this.oToolbar.indexOfEnd(a2), -1, "Index of End (Action Content)");

		assert.strictEqual(this.oToolbar.indexOfEnd(b2), -1, "Index of End (Begin Content)");
		assert.strictEqual(this.oToolbar.indexOfBetween(b2), -1, "Index of Between (Begin Content)");
		assert.strictEqual(this.oToolbar.indexOfAction(b2), -1, "Index of Action (Begin Content)");

		assert.strictEqual(this.oToolbar.indexOfBegin(bw2), -1, "Index of Begin (Between Content)");
		assert.strictEqual(this.oToolbar.indexOfAction(bw2), -1, "Index of Action (Between Content)");
		assert.strictEqual(this.oToolbar.indexOfEnd(bw2), -1, "Index of End (Between Content)");

		this.oToolbar.addAction(null);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, a1, a2, s2, e1, e2
		], "After addAction of nothing");

		var a3 = e2;
		this.oToolbar.addAction(a3);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After addAction of existing content");
		checkAggregation(assert, this.oToolbar, "actions", [
			a1, a2, a3
		], "After addAction of existing content", a3);
		checkAggregation(assert, this.oToolbar, "end", [
			e1
		], "After addAction of existing content", a3);

		var b3 = new Button();
		this.oToolbar.insertBegin(b3, 0);
		checkAggregation(assert, this.oToolbar, "content", [
			b3, b1, b2, s0, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b3, b1, b2
		], "After insertBegin", b3);

		var b4 = new Button();
		this.oToolbar.insertBegin(b4, -5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, s0, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b4, b3, b1, b2
		], "After insertBegin", b4);

		var b5 = new Button();
		this.oToolbar.insertBegin(b5, 100);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b4, b3, b1, b2, b5
		], "After insertBegin", b5);

		var bw3 = new Button();
		this.oToolbar.insertBetween(bw3, 0);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw3, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "between", [
			bw3, bw1, bw2
		], "After insertBetween", bw3);

		var bw4 = new Button();
		this.oToolbar.insertBetween(bw4, -5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "between", [
			bw4, bw3, bw1, bw2
		], "After insertBetween", bw4);

		var bw5 = new Button();
		this.oToolbar.insertBetween(bw5, 100);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a1, a2, a3, s2, e1
		], "After insertBegin");
		checkAggregation(assert, this.oToolbar, "between", [
			bw4, bw3, bw1, bw2, bw5
		], "After insertBetween", bw5);

		var e3 = new Button();
		this.oToolbar.insertEnd(e3, 0);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a1, a2, a3, s2, e3, e1
		], "After insertEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e3, e1
		], "After insertEnd", e3);

		var e4 = new Button();
		this.oToolbar.insertEnd(e4, -5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a1, a2, a3, s2, e4, e3, e1
		], "After insertEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e4, e3, e1
		], "After insertEnd", e4);

		var e5 = new Button();
		this.oToolbar.insertEnd(e5, 100);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a1, a2, a3, s2, e4, e3, e1, e5
		], "After insertEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e4, e3, e1, e5
		], "After insertEnd", e5);

		var a4 = new Button();
		this.oToolbar.insertAction(a4, 0);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a4, a1, a2, a3, s2, e4, e3, e1, e5
		], "After insertAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a4, a1, a2, a3
		], "After insertAction", a4);

		var a5 = new Button();
		this.oToolbar.insertAction(a5, -5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a3, s2, e4, e3, e1, e5
		], "After insertAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a5, a4, a1, a2, a3
		], "After insertAction", a5);

		var a6 = new Button();
		this.oToolbar.insertAction(a6, 100);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a3, a6, s2, e4, e3, e1, e5
		], "After insertAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a5, a4, a1, a2, a3, a6
		], "After insertAction", a6);

		this.oToolbar.insertAction(null);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a3, a6, s2, e4, e3, e1, e5
		], "After insertAction of nothing");

		this.oToolbar.insertEnd(e2, 1);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a6, s2, e4, e2, e3, e1, e5
		], "After insertEnd of existing content");
		checkAggregation(assert, this.oToolbar, "actions", [
			a5, a4, a1, a2, a6
		], "After insertEnd of existing content", e2);
		checkAggregation(assert, this.oToolbar, "end", [
			e4, e2, e3, e1, e5
		], "After insertEnd of existing content", e2);

		this.oToolbar.insertEnd(e4, 100);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, b5, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a6, s2, e2, e3, e1, e5, e4
		], "After insertEnd of existing content");
		checkAggregation(assert, this.oToolbar, "end", [
			e2, e3, e1, e5, e4
		], "After insertEnd of existing content", e4);

		var res = this.oToolbar.removeBegin(b5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, s0, bw4, bw3, bw1, bw2, bw5, s1, a5, a4, a1, a2, a6, s2, e2, e3, e1, e5, e4
		], "After removeBegin");
		checkAggregation(assert, this.oToolbar, "begin", [
			b4, b3, b1, b2
		], "After removeBegin", b5);
		assert.ok(res === b5, "After removeBegin - removed content");

		var res = this.oToolbar.removeBetween(bw5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, s0, bw4, bw3, bw1, bw2, s1, a5, a4, a1, a2, a6, s2, e2, e3, e1, e5, e4
		], "After removeBegin");
		checkAggregation(assert, this.oToolbar, "between", [
			bw4, bw3, bw1, bw2
		], "After removeBetween", bw5);
		assert.ok(res === bw5, "After removeBetween - removed content");

		res = this.oToolbar.removeEnd(e5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, s0, bw4, bw3, bw1, bw2, s1, a5, a4, a1, a2, a6, s2, e2, e3, e1, e4
		], "After removeEnd");
		checkAggregation(assert, this.oToolbar, "end", [
			e2, e3, e1, e4
		], "After removeEnd", e5);
		assert.ok(res === e5, "After removeEnd - removed content");

		res = this.oToolbar.removeAction(a5);
		checkAggregation(assert, this.oToolbar, "content", [
			b4, b3, b1, b2, s0, bw4, bw3, bw1, bw2, s1, a4, a1, a2, a6, s2, e2, e3, e1, e4
		], "After removeAction");
		checkAggregation(assert, this.oToolbar, "actions", [
			a4, a1, a2, a6
		], "After removeAction", a5);
		assert.ok(res === a5, "After removeAction - removed content");

		res = this.oToolbar.removeAllBegin();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, bw4, bw3, bw1, bw2, s1, a4, a1, a2, a6, s2, e2, e3, e1, e4
		], "After removeAllBegin");
		checkAggregation(assert, this.oToolbar, "begin", [], "After removeAllBegin");
		assert.ok(res.length === 4, "After removeAllBegin - removed content");

		res = this.oToolbar.removeAllBetween();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, a4, a1, a2, a6, s2, e2, e3, e1, e4
		], "After removeAllBetween");
		checkAggregation(assert, this.oToolbar, "between", [], "After removeAllBetween");
		assert.ok(res.length === 4, "After removeAllBetween - removed content");

		res = this.oToolbar.removeAllEnd();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, a4, a1, a2, a6, s2
		], "After removeAllEnd");
		checkAggregation(assert, this.oToolbar, "end", [], "After removeAllEnd");
		assert.ok(res.length === 4, "After removeAllEnd - removed content");

		res = this.oToolbar.removeAllActions();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, s2
		], "After removeAllActions");
		checkAggregation(assert, this.oToolbar, "actions", [], "After removeAllActions");
		assert.ok(res.length === 4, "After removeAllActions - removed content");

		this.oToolbar.addBegin(b1);
		this.oToolbar.addBegin(b2);
		this.oToolbar.addBetween(bw1);
		this.oToolbar.addBetween(bw2);
		this.oToolbar.addAction(a1);
		this.oToolbar.addAction(a2);
		this.oToolbar.addEnd(e1);
		this.oToolbar.addEnd(e2);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, b2, s0, bw1, bw2, s1, a1, a2, s2, e1, e2
		], "After adding all aggregations");

		this.oToolbar.destroyBegin();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, bw1, bw2, s1, a1, a2, s2, e1, e2
		], "After destroyBegin");
		checkAggregation(assert, this.oToolbar, "begin", [], "After destroyBegin");

		this.oToolbar.destroyBetween();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, a1, a2, s2, e1, e2
		], "After destroyBetween");
		checkAggregation(assert, this.oToolbar, "between", [], "After destroyBetween");

		this.oToolbar.destroyEnd();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, a1, a2, s2
		], "After destroyEnd");
		checkAggregation(assert, this.oToolbar, "end", [], "After destroyEnd");

		this.oToolbar.destroyActions();
		checkAggregation(assert, this.oToolbar, "content", [
			s0, s1, s2
		], "After destroyActions");
		checkAggregation(assert, this.oToolbar, "actions", [], "After destroyActions");
	});

	QUnit.test("Aggregations (content)", function(assert) {
		var oObj = new Button();

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

	QUnit.test("Header CTX", function(assert) {
		assert.ok(this.oToolbar.getUseAsHeader(), "Default Header CTX");
		assert.ok(this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style applied");
		this.oToolbar.setUseAsHeader(false);
		assert.ok(!this.oToolbar.getUseAsHeader(), "No Header CTX");
		assert.ok(!this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style not applied");
		this.oToolbar.setUseAsHeader(true);
		assert.ok(this.oToolbar.getUseAsHeader(), "Header CTX");
		assert.ok(this.oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Header CTX Style applied");
	});

	QUnit.test("Title Separator", function(assert) {
		assert.ok(this.oToolbar._oTitleSeparator);
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), false);

		var t1 = new Title();
		this.oToolbar.addBegin(t1);

		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), false);

		var txt1 = new Text();
		this.oToolbar.addBetween(txt1);
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), true);

		t1.setVisible(false);
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), false);

		t1.setVisible(true);
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), true);

		t1.setWidth("0px");
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), false);

		t1.setWidth();
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), true);

		this.oToolbar.destroyBegin();
		assert.strictEqual(this.oToolbar._oTitleSeparator.getVisible(), false);
	});

	QUnit.test("Destroy", function(assert) {
		var s0 = this.oToolbar._oTitleSeparator;
		var s1 = this.oToolbar._oSpacer;
		var s2 = this.oToolbar._oActionSeparator;
		var b1 = new Button();
		this.oToolbar.addBegin(b1);
		var bw1 = new Button();
		this.oToolbar.addBetween(bw1);
		var e1 = new Button();
		this.oToolbar.addEnd(e1);
		var a1 = new Button();
		this.oToolbar.addAction(a1);
		checkAggregation(assert, this.oToolbar, "content", [
			b1, s0, bw1, s1, a1, s2, e1
		], "After creation");

		this.oToolbar.destroy();

		assert.ok(this.oToolbar.bIsDestroyed, "Toolbar destroyed");
		assert.ok(s0.bIsDestroyed, "Separator1 destroyed");
		assert.ok(s1.bIsDestroyed, "Spacer destroyed");
		assert.ok(s2.bIsDestroyed, "Separator2 destroyed");
		assert.ok(b1.bIsDestroyed, "Begin destroyed");
		assert.ok(e1.bIsDestroyed, "End destroyed");
		assert.ok(a1.bIsDestroyed, "Actions destroyed");

		this.oToolbar.destroyAggregation("actions"); // see BCP 1980169751, should not lead to an error

		this.oToolbar = null;
	});
});
