/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Link",
	"sap/ui/core/Control"
], function(createAndAppendDiv, Link, Control) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var sText = "Hello",
		sTooltip = "abc",
		sHelpId = "12345",
		sPressMessage = "foo",
		bEnabled = false,
		bVisible = true,
		sHref = "http://www.sap.com",
		sTarget = "_blank";

	function pressEventHandler() {
		throw sPressMessage;
	}

	var oLink1 = new Link("l1");
	oLink1.setText(sText);
	oLink1.setEnabled(bEnabled);
	oLink1.setVisible(bVisible);
	oLink1.setTooltip(sTooltip);
	oLink1.setHelpId(sHelpId);
	oLink1.setHref(sHref);
	oLink1.setTarget(sTarget);
	oLink1.attachPress(pressEventHandler);
	oLink1.placeAt("uiArea1");

	var oLink2 = new Link("l2", {
		text : sText,
		enabled : bEnabled,
		visible : bVisible,
		tooltip : sTooltip,
		helpId : sHelpId,
		href : sHref,
		target : sTarget,
		press : pressEventHandler
	});
	oLink2.placeAt("uiArea2");

	var l1, l2;

	QUnit.module("Basic", {
		beforeEach: function(assert) {
			l1 = sap.ui.getCore().getControl("l1");
			l2 = sap.ui.getCore().getControl("l2");

			l1.setVisible(true);
			l2.setVisible(true);

			sap.ui.getCore().applyChanges();

			assert.ok(l1, "l1 should not be null");
			assert.ok(l2, "l2 should not be null");
		},
		afterEach : function() {
			l1 = null;
			l2 = null;
		}
	});

	// test property accessor methods

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(l1.getText(), sText, "l1.getText()");
		assert.strictEqual(l2.getText(), sText, "l2.getText()");
	});

	QUnit.test("EnabledOk", function(assert) {
		assert.strictEqual(l1.getEnabled(), bEnabled, "l1.getEnabled()");

		assert.strictEqual(l2.getEnabled(), bEnabled, "l2.getEnabled()");
	});

	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(l1.getVisible(), bVisible, "l1.getVisible()");
		assert.strictEqual(l2.getVisible(), bVisible, "l2.getVisible()");
	});

	QUnit.test("TooltipOk", function(assert) {
		assert.strictEqual(l1.getTooltip(), sTooltip, "l1.getTooltip()");
		assert.strictEqual(l2.getTooltip(), sTooltip, "l2.getTooltip()");
	});

	QUnit.test("HelpIdOk", function(assert) {
		assert.strictEqual(l1.getHelpId(), sHelpId, "l1.getHelpId()");
		assert.strictEqual(l2.getHelpId(), sHelpId, "l2.getHelpId()");
	});

	QUnit.test("HrefOk", function(assert) {
		assert.strictEqual(l1.getHref(), sHref, "l1.getHref()");
		assert.strictEqual(l2.getHref(), sHref, "l2.getHref()");
	});

	QUnit.test("TargetOk", function(assert) {
		assert.strictEqual(l1.getTarget(), sTarget, "l1.getTarget()");
		assert.strictEqual(l2.getTarget(), sTarget, "l2.getTarget()");
	});

	// test event handlers

	// TODO: event handler using Event parameters

	QUnit.test("PressOk", function(assert) {
		try {
			l1.firePress();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.strictEqual(e, sPressMessage, "l1.firePress()");
		}

		try {
			l2.firePress();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.strictEqual(e, sPressMessage, "l2.firePress()");
		}
	});

	QUnit.test("DetachPressOk", function(assert) {
		l1.detachPress(pressEventHandler);
		try {
			l1.firePress();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		l1.attachPress(pressEventHandler);
	});

	// test methods

	// TODO


	// test misc (control interaction, metadata, styles, etc.)

	function isEmpty(oObject) {
		for (var i in oObject) { // eslint-disable-line no-unused-vars
			return false;
		}
		return true;
	}

	QUnit.test("MetadataOk", function(assert) {
		var oMetadata = l1.getMetadata();
		assert.ok(oMetadata, "l1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent(), "l1.getMetadata().getParent() should not be null");
		assert.ok(oMetadata.getParent() === Control.getMetadata());
		assert.strictEqual(oMetadata.getProperties()["text"]["type"], "string");
		assert.ok(isEmpty(oMetadata.getAggregations()));
		var oAssociations = oMetadata.getAssociations();
		assert.strictEqual(oAssociations["ariaDescribedBy"]["type"], "sap.ui.core.Control", "ariaDescribedBy type");
		assert.ok(oAssociations["ariaDescribedBy"]["multiple"], "ariaDescribedBy multiple");
		assert.strictEqual(oAssociations["ariaLabelledBy"]["type"], "sap.ui.core.Control", "ariaLabelledBy type");
		assert.ok(oAssociations["ariaLabelledBy"]["multiple"], "ariaLabelledBy multiple");
	});
});