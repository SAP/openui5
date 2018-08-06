/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/core/Control"
], function(Action, Control){
	"use strict";

	var MyControl = Control.extend("my.Control", {
		renderer: function (rm, oControl) {
			rm.write("<div");
			rm.writeControlData(oControl);
			rm.write(">");

			rm.write("<div");
			rm.writeAttribute('id', oControl.getId() + "-one");
			rm.writeAttribute("tabindex", "0");
			rm.write(">");
			rm.write("</div>");

			rm.write("<div");
			rm.writeAttribute('id', oControl.getId() + "-two");
			rm.write(">");
			rm.write("</div>");

			rm.write("<div");
			rm.writeAttribute('id', oControl.getId() + "-three");
			rm.write(">");
			rm.write("</div>");

			rm.write("</div>");
		},

		getFocusDomRef: function () {
			return this.getDomRef("one");
		}
	});

	QUnit.module("DomRef", {
		beforeEach: function () {
			var oMyControl = new MyControl("myId");
			oMyControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oMyControl = oMyControl;
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

});
