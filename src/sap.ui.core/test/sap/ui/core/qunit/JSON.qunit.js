/* global QUnit */
sap.ui.define(["sap/m/Button"], function(Button) {
	"use strict";
	QUnit.module("JSON Native Support basics");
	QUnit.test("JSON object", function(assert) {
		assert.ok(JSON, "JSON object exists");
		assert.ok(JSON.stringify, "JSON.stringify is defined");
		assert.ok(JSON.parse, "JSON.parse is defined");
	});

	QUnit.module("JSON Stringify/Parse");
	QUnit.test("JSON Stringification", function(assert) {
		var s = JSON.stringify(['e', {
			pluribus: 'unum'
		}]);
		var result = '["e",{"pluribus":"unum"}]';
		assert.equal(s, result, "Simple stringify");

		var o = {};
		o.att1 = "att1";
		o.att2 = "att2";
		o.att3 = "att3";
		o.func = function() { /*a function*/ };

		s = JSON.stringify(o);
		result = '{"att1":"att1","att2":"att2","att3":"att3"}';
		assert.equal(s, result, "Stringify on object");

		s = JSON.stringify(o, /*replacer*/ ["att1", "att3"]);
		result = '{"att1":"att1","att3":"att3"}';
		assert.equal(s, result, "Stringify with replacer");
	});
	QUnit.test("JSON Parsing", function(assert) {
		var s = '{"att1":"att1","att2":"att2","att3":"att3"}';
		var result = {};
		result.att1 = "att1";
		result.att2 = "att2";
		result.att3 = "att3";

		var o = JSON.parse(s);
		assert.deepEqual(o, result, "Simple parse");

		result = {};
		result.att1 = "att1";
		result.att3 = "att3";

		o = JSON.parse(s, function(key, value) {
			if (key == "att2") {
				return undefined;
			}
			return value;
		});
		assert.deepEqual(o, result, "Parse with reviver");
	});
	QUnit.test("JSON Stringify/Parse piped", function(assert) {
		var result = {};
		result.att1 = "att1";
		result.att2 = "att2";
		result.att3 = "att3";
		result.enabled = true;
		result.visible = true;
		result.att4 = {};
		result.att4.foo = "foo";

		var s = JSON.stringify(result);
		var o = JSON.parse(s);
		assert.deepEqual(o, result, "Piped stringify/parse");
	});

	QUnit.module("JSON toJSON method");
	QUnit.test("JSON toJSON method", function(assert) {
		var o = {};
		o.att1 = "public"; /* only public attribute */
		o.att2 = "att2";
		o.att3 = "att3";
		o.att4 = {};
		o.att4.foo = "foo";
		o.toJSON = function(key) {
			return {
				att1: this.att1
			};
		};

		var s = JSON.stringify(o);
		assert.equal(s, '{"att1":"public"}', "Stringify on an object having toJSON()");

	});
	QUnit.module("JSON on SAPUI5 Control");
	QUnit.test("JSON Button", function(assert) {
		var sText = "Hello",
			sTooltip = "abc",
			sWidth = "111px",
			sIcon = "../images/help.gif",
			sPressMessage = "Button Pressed Event!",
			bEnabled = false,
			bVisible = false,
			bIconFirst = false;

		function pressEventHandler1() {
			throw sPressMessage + " - Exception";
		}

		var oButton = new Button("b1");
		oButton.setText(sText);
		oButton.setWidth(sWidth);
		oButton.setEnabled(bEnabled);
		oButton.setVisible(bVisible);
		oButton.setTooltip(sTooltip);
		oButton.setIconFirst(bIconFirst);
		oButton.setIcon(sIcon);
		oButton.attachPress(pressEventHandler1);

		var s = JSON.stringify(oButton);
		var oButtonJSONed = JSON.parse(s);
		assert.equal(oButtonJSONed.sId, oButton.sId, "Retained sId property");
		assert.equal(oButtonJSONed.mProperties.icon, oButton.mProperties.icon, "Retained icon property");
		assert.equal(oButtonJSONed.mProperties.iconFirst, oButton.mProperties.iconFirst, "Retained iconFirst property");
		assert.equal(oButtonJSONed.mProperties.text, oButton.mProperties.text, "Retained text property");
		assert.equal(oButtonJSONed.mProperties.width, oButton.mProperties.width, "Retained width property");
		assert.equal(oButtonJSONed.mProperties.enabled, oButton.mProperties.enabled, "Retained enabled property");
		assert.equal(oButtonJSONed.mProperties.visible, oButton.mProperties.visible, "Retained visible property");

	});

});