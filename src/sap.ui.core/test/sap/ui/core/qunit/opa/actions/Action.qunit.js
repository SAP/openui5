/*global QUnit, sinon */
/*eslint max-nested-callbacks: [2,4]*/

sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/core/Control",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Action, Control, nextUIUpdate){
	"use strict";

	var MyControl = Control.extend("my.Control", {
		renderer: {
			apiVersion: 2,
			render: function (rm, oControl) {
				rm.openStart("div", oControl).openEnd();

					rm.openStart("div", oControl.getId() + "-one");
					rm.attr("tabindex", "0");
					rm.openEnd();
					rm.close("div");

					rm.openStart("div", oControl.getId() + "-two");
					rm.openEnd();
					rm.close("div");

					rm.openStart("div", oControl.getId() + "-three");
					rm.openEnd();
					rm.close("div");

				rm.close("div");
			}
		},

		getFocusDomRef: function () {
			return this.getDomRef("one");
		}
	});

	QUnit.module("DomRef", {
		beforeEach: function () {
			var oMyControl = new MyControl("myId");
			oMyControl.placeAt("qunit-fixture");
			this.oMyControl = oMyControl;
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oMyControl.destroy();
		}
	});

	QUnit.test("Should request focus and trigger a 'press' event on a sap.m.Button control", function(assert) {
		// System under Test
		var oAction = new Action();

		assert.equal(oAction.$(this.oMyControl)[0].id, "myId-one", "by default the focus domref is taken");

		oAction.controlAdapters["my.Control"] = "two";

		assert.equal(oAction.$(this.oMyControl)[0].id, "myId-two", "if there is a control adapter, it takes priority");

		oAction.setIdSuffix("three");
		assert.equal(oAction.$(this.oMyControl)[0].id, "myId-three", "if there is a suffix then its taken");
	});

	QUnit.test("Should trigger focusout exactly twice when 2 actions are applied", function (assert) {
		var oAction = new Action();
		var async = assert.async();
		var oMyControl = this.oMyControl;

		this.oMyControl.onsapfocusleave = sinon.spy();

		setTimeout(function () {
			oAction._tryOrSimulateFocusin(oAction.$(oMyControl), oMyControl);
			oAction._simulateFocusout(oAction.$(oMyControl)[0], oMyControl);

			setTimeout(function () {
				sinon.assert.calledOnce(oMyControl.onsapfocusleave);
				oAction._tryOrSimulateFocusin(oAction.$(oMyControl), oMyControl);
				oAction._simulateFocusout(oAction.$(oMyControl)[0], oMyControl);
				setTimeout(function () {
					sinon.assert.calledTwice(oMyControl.onsapfocusleave);
					async();
				},0);

			}, 0);
		}, 0);

	});

	QUnit.test("Artificial focus should synchronously trigger focusout for the old focused", async function (assert) {
		var oAction = new Action();
		var async = assert.async();
		var oInitiallyFocused = this.oMyControl;
		var oNewlyFocused = new MyControl("myId2");

		oNewlyFocused.placeAt("qunit-fixture");
		await nextUIUpdate();

		oInitiallyFocused.focus();
		oInitiallyFocused.onsapfocusleave = sinon.spy();

		setTimeout(function () {
			oAction._tryOrSimulateFocusin(oAction.$(oNewlyFocused), oNewlyFocused);

			setTimeout(function () {
				sinon.assert.calledOnce(oInitiallyFocused.onsapfocusleave);
				async();
			}, 0);
		}, 0);

	});

});
