/* global QUnit */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/util/serializer/Serializer',
	'sap/ui/core/util/serializer/delegate/HTML',
	'sap/ui/core/util/serializer/delegate/XML'
], function(Control, Serializer, HTMLDelegate, XMLDelegate) {
	"use strict";

	var TestControl = Control.extend("sap.test.TestControl", {
		metadata: {
			properties: {
				text: "string"
			},
			associations: {
				ariaDescribedBy: { type: 'sap.ui.core.Control', multiple: true }
			}
		}
	});

	var TestContainer = Control.extend("sap.test.TestContainer", {
		metadata: {
			aggregations: {
				content: 'sap.ui.core.Control',
				title: { type: 'sap.test.TestControl', altTypes: [ 'string' ], multiple: false }
			}
		},
		init: function() {
			this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
		}
	});

	var TestSpecialControl = Control.extend("sap.test.TestSpecialControl", {
		metadata: {
			properties: {
				// a default value of 'null' means: use default value of type (which is 0 for 'int')
				defaultNullProp: { type: 'int', defaultValue: null },

				// a default value of 'undefined' means: default value === undefined
				defaultUndefinedProp: { type: 'int', defaultValue: undefined },

				// a non-empty default value (emptyvalues must be written)
				nonEmptyDefault: { type: 'string', defaultValue: "hello world!" }
			}
		}
	});

	function unescapeSpace(s) {
		return s.replace("&#x20;", " ");
	}

	QUnit.module("Simple", {
		beforeEach : function() {
			this.oTestContainer = new TestContainer({
				content: [
					new TestControl({id:"myTitleSimple1"}),
					new TestControl({id:"myTitleSimple2", fieldGroupIds:["Test1,Test2"]}),
					new TestControl({id:"myTitleSimple3", fieldGroupIds:null})
				]
			});
		},

		afterEach : function() {
			this.oTestContainer.destroy();
		}
	});

	/**
	 * @deprecated As of 1.108
	 */
	QUnit.test("Generate & Call Delegate HTML Serializing", function(assert) {
		var oHTML = new HTMLDelegate();
		var aExpectedResults = [
			"<div id=\"myTitleSimple1\" data-sap-ui-type=\"sap.test.TestControl\"></div>",
			"<div id=\"myTitleSimple2\" data-sap-ui-type=\"sap.test.TestControl\" data-field-group-ids=\"Test1,Test2\"></div>",
			"<div id=\"myTitleSimple3\" data-sap-ui-type=\"sap.test.TestControl\"></div>"
		];

		var aContent = this.oTestContainer.getContent();
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oHTML, false);
			var s = oControlSerializer.serialize();
			assert.equal(s, aExpectedResults[i], "The generated string is right for control " + aContent[i].getId());
		}

	});

	QUnit.test("Generate & Call Delegate XML Serializing", function(assert) {
		var oXML = new XMLDelegate();
		var aExpectedResults = [
			"<sap.test:TestControl id=\"myTitleSimple1\"></sap.test:TestControl>",
			"<sap.test:TestControl id=\"myTitleSimple2\" fieldGroupIds=\"Test1,Test2\"></sap.test:TestControl>",
			"<sap.test:TestControl id=\"myTitleSimple3\"></sap.test:TestControl>"
		];

		var aContent = this.oTestContainer.getContent();
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oXML, false);
			var s = oControlSerializer.serialize();
			assert.equal(unescapeSpace(s), aExpectedResults[i], "The generated string is right for control " + aContent[i].getId());
		}
	});

	QUnit.test("XML Serializing generates escaped attributes", function(assert) {
		var oXML = new XMLDelegate();
		var oControl = new TestControl({id:"mySpecial", text: "text with \" and with <"});
		var oControlSerializer = new Serializer(oControl, oXML, false);
		var s = oControlSerializer.serialize();
		assert.equal(s, "<sap.test:TestControl id=\"mySpecial\" text=\"text&#x20;with&#x20;&quot;&#x20;and&#x20;with&#x20;&lt;\"></sap.test:TestControl>");
	});

	QUnit.module("Complex", {
		beforeEach : function() {
			var oTestControl = new TestControl({id:"myTitle", text:"My TestContainer"});
			this.oTestContainer = new TestContainer({id:"myTestContainer", title:oTestControl});
			oTestControl = new TestControl({id:"myTestButton"});
			oTestControl.data("myCustomData", "myValue");
			this.oTestControl2 = new TestControl({id:"myTestButton2"});
			oTestControl.addAriaDescribedBy(this.oTestControl2);
			this.oTestContainer.addContent(oTestControl);
			this.oTestContent = [this.oTestContainer];
		},

		afterEach : function() {
			this.oTestContainer.destroy();
			this.oTestControl2.destroy();
		}
	});

	/**
	 * @deprecated As of 1.108
	 */
	QUnit.test("Complex HTML Serializing", function(assert) {
		var oHTML = new HTMLDelegate();

		var sExpectedResult = [
			'<div id=\"myTestContainer\" data-sap-ui-type=\"sap.test.TestContainer\">',
				'<div data-sap-ui-aggregation=\"customData\">',
					'<div data-sap-ui-type=\"sap.ui.core.CustomData\" data-key=\"sap-ui-fastnavgroup\" data-value=\"true\" data-write-to-dom=\"true\"></div>',
				'</div>',
				'<div data-sap-ui-aggregation=\"content\">',
					'<div id=\"myTestButton\" data-sap-ui-type=\"sap.test.TestControl\" data-aria-described-by=\"myTestButton2\">',
						'<div data-sap-ui-aggregation=\"customData\">',
							'<div data-sap-ui-type=\"sap.ui.core.CustomData\" data-key=\"myCustomData\" data-value=\"myValue\"></div>',
						'</div>',
					'</div>',
				'</div>',
				'<div data-sap-ui-aggregation=\"title\">',
					'<div id=\"myTitle\" data-sap-ui-type=\"sap.test.TestControl\" data-text=\"My TestContainer\"></div>',
				'</div>',
			'</div>'
		].join('');

		var aCode = [];
		var aContent = this.oTestContent;
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oHTML, false);
			aCode.push(oControlSerializer.serialize());
		}
		assert.equal(unescapeSpace(aCode.join("")), sExpectedResult, "The generated string is right");
	});

	QUnit.test("Complex XML Serializing", function(assert) {
		var oXML = new XMLDelegate();

		var sExpectedResult = [
			'<sap.test:TestContainer id=\"myTestContainer\">',
				'<sap.test:customData>',
					'<sap.ui.core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\"></sap.ui.core:CustomData>',
				'</sap.test:customData>',
				'<sap.test:content>',
					'<sap.test:TestControl id=\"myTestButton\" ariaDescribedBy=\"myTestButton2\">',
						'<sap.test:customData>',
							'<sap.ui.core:CustomData key=\"myCustomData\" value=\"myValue\"></sap.ui.core:CustomData>',
						'</sap.test:customData>',
					'</sap.test:TestControl>',
				'</sap.test:content>',
				'<sap.test:title>',
					'<sap.test:TestControl id=\"myTitle\" text=\"My TestContainer\"></sap.test:TestControl>',
				'</sap.test:title>',
			'</sap.test:TestContainer>'
		].join('');

		var aCode = [];
		var aContent = this.oTestContent;
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oXML, false);
			aCode.push(oControlSerializer.serialize());
		}
		assert.equal(unescapeSpace(aCode.join("")), sExpectedResult, "The generated string is right");
	});

	QUnit.test("Complex XML Serializing with excluding children using callback", function(assert) {
		var oXML = new XMLDelegate();
		var sExpectedResult = [
			'<sap.test:TestContainer id=\"myTestContainer\">',
				'<sap.test:content>',
					'<sap.test:TestControl id=\"myTestButton\" ariaDescribedBy=\"myTestButton2\">',
					'</sap.test:TestControl>',
				'</sap.test:content>',
				'<sap.test:title>',
					'<sap.test:TestControl id=\"myTitle\" text=\"My TestContainer\"></sap.test:TestControl>',
				'</sap.test:title>',
			'</sap.test:TestContainer>'
		].join('');

		var aCode = [];
		var aContent = this.oTestContent;
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oXML, false, window,
					undefined, function (oObject) {
						return oObject.getMetadata().getName() === "sap.ui.core.CustomData";
					});
			aCode.push(oControlSerializer.serialize());
		}
		assert.equal(unescapeSpace(aCode.join("")), sExpectedResult, "The generated string is right");
	});

	QUnit.test("Complex XML Serializing with excluding aggregations using callback", function(assert) {
		var oXML = new XMLDelegate();
		var sExpectedResult = [
			'<sap.test:TestContainer id=\"myTestContainer\">',
				'<sap.test:content>',
					'<sap.test:TestControl id=\"myTestButton\" ariaDescribedBy=\"myTestButton2\">',
					'</sap.test:TestControl>',
				'</sap.test:content>',
				'<sap.test:title>',
					'<sap.test:TestControl id=\"myTitle\" text=\"My TestContainer\"></sap.test:TestControl>',
				'</sap.test:title>',
			'</sap.test:TestContainer>'
		].join('');

		var aCode = [];
		var aContent = this.oTestContent;
		for (var i = 0; i < aContent.length; i++) {
			var oControlSerializer = new Serializer(aContent[i], oXML, false, window,
					function (oControl, sName) {
						return sName === "customData";
					});
			aCode.push(oControlSerializer.serialize());
		}
		assert.equal(unescapeSpace(aCode.join("")), sExpectedResult, "The generated string is right");
	});



	QUnit.module("Special Cases", {
		beforeEach : function() {
			this._oXMLDelegate = new XMLDelegate();
			this.serializeXML = function(oControl) {
				return new Serializer(oControl, this._oXMLDelegate, false).serialize();
			};
		}
	});

	QUnit.test("Property with 'null' defaultValue", function(assert) {

		// first ensure that the prop is written at all
		var oControlWithNonDefault = new TestSpecialControl({ defaultNullProp: 42 });
		assert.equal(
			this.serializeXML( oControlWithNonDefault ),
			'<sap.test:TestSpecialControl defaultNullProp="42"></sap.test:TestSpecialControl>', "write prop values with non-default value");
		oControlWithNonDefault.destroy();

		var oControlWithDefault = new TestSpecialControl({ defaultNullProp: 0 });
		assert.equal(
			this.serializeXML( oControlWithDefault ),
			'<sap.test:TestSpecialControl></sap.test:TestSpecialControl>', "don't write prop values that equal the default value");
		oControlWithDefault.destroy();

	});

	QUnit.test("Property with 'undefined' defaultValue", function(assert) {

		// first ensure that the prop is written at all
		var oControlWithNonDefault = new TestSpecialControl({ defaultUndefinedProp: 42 });
		assert.equal(
			this.serializeXML( oControlWithNonDefault ),
			'<sap.test:TestSpecialControl defaultUndefinedProp="42"></sap.test:TestSpecialControl>', "write prop values with non-default value");
		oControlWithNonDefault.destroy();

		var oControlWithTypeDefault = new TestSpecialControl({ defaultUndefinedProp: 0 });
		assert.equal(
			this.serializeXML( oControlWithTypeDefault ),
			'<sap.test:TestSpecialControl defaultUndefinedProp="0"></sap.test:TestSpecialControl>', "write prop value with type default (which is different from prop default)");
		oControlWithTypeDefault.destroy();

		var oControlWithDefault = new TestSpecialControl({ defaultUndefinedProp: undefined });
		assert.equal(
			this.serializeXML( oControlWithDefault ),
			'<sap.test:TestSpecialControl></sap.test:TestSpecialControl>', "don't write prop values that equal the default value");
		oControlWithDefault.destroy();

	});

	QUnit.test("Property with 'non-empty' defaultValue", function(assert) {

		// first ensure that the prop is written at all
		var oControlWithNonDefault = new TestSpecialControl({ nonEmptyDefault: "test" });
		assert.equal(
			this.serializeXML( oControlWithNonDefault ),
			'<sap.test:TestSpecialControl nonEmptyDefault="test"></sap.test:TestSpecialControl>', "write prop values with non-default value");
		oControlWithNonDefault.destroy();

		var oControlWithEmptyValue = new TestSpecialControl({ nonEmptyDefault: "" });
		assert.equal(
			this.serializeXML( oControlWithEmptyValue ),
			'<sap.test:TestSpecialControl nonEmptyDefault=""></sap.test:TestSpecialControl>', "write prop with empty value");
		oControlWithEmptyValue.destroy();

		var oControlWithDefault = new TestSpecialControl({ nonEmptyDefault: "hello world!" });
		assert.equal(
			this.serializeXML( oControlWithDefault ),
			'<sap.test:TestSpecialControl></sap.test:TestSpecialControl>', "don't write prop values that equal the default value");
		oControlWithDefault.destroy();

	});
});