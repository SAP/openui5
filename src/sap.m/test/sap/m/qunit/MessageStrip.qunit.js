(function() {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.qunit.QUnitUtils");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
	sinon.config.useFakeTimers = false;
	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CLASS_CLOSE_BUTTON = ".sapMMsgStripCloseButton";
	var CLASS_TEXT_MESSAGE = ".sapMMsgStripMessage";
	var CLASS_ICON = ".sapMMsgStripIcon";

	QUnit.module("API", {
		setup: function() {
			this.oMessageStrip = new sap.m.MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oMessageStrip.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		// act
		this.oMessageStrip.setShowIcon(true);
		this.oMessageStrip.setShowCloseButton(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.oMessageStrip, "MessageStrip should be rendered");
		assert.strictEqual(jQuery(CLASS_CLOSE_BUTTON).length, 1, "Close Button should be rendered");
		assert.strictEqual(jQuery(CLASS_TEXT_MESSAGE).length, 1, "Text wrapper div should be rendered");
		assert.strictEqual(jQuery(CLASS_ICON).length, 1, "Icon div should be rendered");
	});

	QUnit.test("Default values", function(assert) {
		// assert
		assert.strictEqual(this.oMessageStrip.getText(), "", "text should be an empty string");
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "type should be Information");
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "", "icon should be null");
		assert.strictEqual(this.oMessageStrip.getShowIcon(), false, "showIcon should be false");
		assert.strictEqual(this.oMessageStrip.getShowCloseButton(), false, "showCloseButton should be false");
	});

	QUnit.test("Setting None type", function(assert) {
		// act
		this.oMessageStrip.setType("None");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "should forward to Information");
	});

	QUnit.test("Setting custom icon on Error state", function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		this.oMessageStrip.setCustomIcon("sap-icon://undo");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "sap-icon://undo", "icon should be undo");
	});

	QUnit.test("Custom icon should not be set by the type icon", function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "", "custom icon should not be defined");
	});

	QUnit.test("Link control via setLink", function(assert) {
		var linkText = "Link Text";

		this.oMessageStrip.setLink(new sap.m.Link({ text: linkText }));
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oMessageStrip.getLink().getText(), linkText,
			"should be set as an aggregation and have the specified text");
	});

	QUnit.test("Link control via setAggregation", function(assert) {
		// arrange
		var oLink = new sap.m.Link({
			text: "Link Text"
		});

		// act
		this.oMessageStrip.setAggregation("link", oLink, false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oMessageStrip.$().find(".sapMLnk").length, 1, "should be set as an aggregation");
	});

	QUnit.test("Setting the text", function(assert) {
		// arrange
		var oText = this.oMessageStrip.getAggregation("_text");
		// act
		this.oMessageStrip.setText("Test example");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oText.getText(), "Test example", "should set the text of the hiddent aggregation");
		assert.strictEqual(oText.getText(), this.oMessageStrip.getText(), "should set the same text on the MS and it's internal aggregation text");

	});

	QUnit.module("Data binding", {
		setup: function() {
			this.oMessageStrip = new sap.m.MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oMessageStrip.destroy();
		},
		generateData: function() {
			return {
				"text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
			};
		}
	});

	QUnit.test("JSON model text binding", function(assert) {
		// arrange
		var oModel = new sap.ui.model.json.JSONModel(this.generateData());
		var sData = this.generateData().text;

		// act
		this.oMessageStrip.setModel(oModel);
		this.oMessageStrip.bindProperty("text", "/text");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oMessageStrip.getText(), sData, "should work");
		assert.strictEqual(this.oMessageStrip.$().find('.sapMText').text(), sData, "should set the text to the internal aggregation");

	});


	QUnit.module("Events", {
		setup: function() {
			this.oMessageStrip = new sap.m.MessageStrip({
				text: "Test",
				showCloseButton: true
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			if (this.oMessageStrip) {
				this.oMessageStrip.destroy();
			}
		}
	});


	QUnit.test("Tapping on close button", 1, function(assert) {
		var done = assert.async();
		this.oMessageStrip.attachClose(function() {
			assert.ok(true, 'should trigger close event');
			done();
		});

		setTimeout(function() {
			sap.ui.test.qunit.triggerEvent("tap", jQuery(CLASS_CLOSE_BUTTON)[0]);
		}, 0);

	});

	QUnit.test("Pressing enter on close button", 1, function(assert) {
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			jQuery(CLASS_CLOSE_BUTTON)[0].focus();
			sap.ui.test.qunit.triggerKeydown(jQuery(CLASS_CLOSE_BUTTON)[0], jQuery.sap.KeyCodes.ENTER);
		}, 0);
	});

	QUnit.test("Pressing space on close button", 1, function(assert) {
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			jQuery(CLASS_CLOSE_BUTTON)[0].focus();
			sap.ui.test.qunit.triggerKeydown(jQuery(CLASS_CLOSE_BUTTON)[0], jQuery.sap.KeyCodes.SPACE);
		}, 0);
	});

	QUnit.module("ARIA Support", {
		setup: function() {
			this.oMessageStrip = new sap.m.MessageStrip({
				text: "Test",
				showCloseButton: true,
				link: new sap.m.Link({text: "Sample link"})
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			if (this.oMessageStrip) {
				this.oMessageStrip.destroy();
			}
		}
	});

	QUnit.test("Role note should be present", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			role = msgStripDom.getAttribute("role");

		assert.strictEqual(role, "note", "role=note is present");
	});

	QUnit.test("Live region with aria-live should be present", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			live = msgStripDom.getAttribute("aria-live");

		assert.strictEqual(live, "assertive", "aria-live=asserive is present");
	});

	QUnit.test("Labelledby attribute", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			labelledBy = msgStripDom.getAttribute("aria-labelledby");

		assert.strictEqual(labelledBy, this.oMessageStrip.getId(),
			"should point to the element's id");
	});

	QUnit.test("Invisible aria type text should be present in the root element", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			invisibleText = msgStripDom.querySelectorAll(".sapUiPseudoInvisibleText");

		assert.strictEqual(invisibleText.length, 1,
			"only one element with class .sapUiPseudoInvisibleText should be present");
	});

	QUnit.test("When link is set it should have aria-labelledby attribute", function (assert) {
		var linkDom = this.oMessageStrip.getLink().getDomRef(),
			labelledBy = linkDom.getAttribute("aria-labelledby");

		assert.strictEqual(labelledBy, this.oMessageStrip.getId(),
			"link aria-labelledby should point to the MessageStrip id");
	});

})();
