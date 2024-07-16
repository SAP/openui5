/*global QUnit, sinon */
sap.ui.define([
	"sap/base/future",
	'sap/base/Log',
	"sap/base/i18n/Localization",
	'sap/base/i18n/ResourceBundle',
	"sap/ui/core/Element",
	'sap/ui/core/library',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/RenderManager',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/util/XMLHelper',
	'./AnyView.qunit',
	'sap/ui/thirdparty/jquery',
	"sap/ui/test/utils/nextUIUpdate"
], function(future, Log, Localization, ResourceBundle, Element, coreLibrary, Controller, View, XMLView, RenderManager, JSONModel, ResourceModel, XMLHelper, testsuite, jQuery, nextUIUpdate) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// load the XML without parsing
	var sViewXML;
	var pViewXMLLoaded = Promise.resolve(
		jQuery.ajax({
			url: sap.ui.require.toUrl("example/mvc/test.view.xml"),
			dataType: "text"
		})
	).then(function(sResult) {
		sViewXML = sResult;
	});

	var oConfig = {
		viewClass : XMLView,
		viewClassName : XMLView.getMetadata().getName(),
		idsToBeChecked : ["myPanel", "Button1", "Button2", "Button3"]
	};

	var fnWaitForNestedViews = function(oView) {
		var pNestedView1 = oView.byId("MyJSView").loaded();
		var pNestedView2 = oView.byId("MyXMLView").loaded();
		var pNestedView3 = oView.byId("MyHTMLView").loaded();

		return Promise.all([pNestedView1, pNestedView2, pNestedView3]).then(function () {
			return oView;
		});
	};

	// run the full testset for a view loaded from a file
	testsuite(oConfig, "XMLView creation loading from file", function() {
		return XMLView.create({
			viewName: "example.mvc.test"
		}).then(fnWaitForNestedViews);
	});

	// run the full testset for a view created from a string
	testsuite(oConfig, "XMLView creation via XML string", function() {
		// let the XMLView parse the XML string
		return XMLView.create({
			definition: sViewXML
		}).then(fnWaitForNestedViews);
	});

	// run the full testset for a view created from an XML document
	testsuite(oConfig, "XMLView creation via XML document", function() {
		// parse the XML string and pass the XML document
		return XMLView.create({
			definition: XMLHelper.parse(sViewXML)
		}).then(fnWaitForNestedViews);
	});

	// run the full testset for a view created from the root element of an XML document
	testsuite(oConfig, "XMLView creation via XML node", function() {
		// parse the XML string and pass the XML root element
		return XMLView.create({
			xmlNode: XMLHelper.parse(sViewXML).documentElement
		}).then(fnWaitForNestedViews);
	});

	// run the full testset for a view created via the generic factory method
	testsuite(oConfig, "XMLView creation using generic view factory", function() {
		return View.create({
			type: ViewType.XML,
			viewName: "example.mvc.test",
			viewData: {test:"testdata"}
		}).then(fnWaitForNestedViews);
	}, /* bCheckViewData = */ true);

	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Apply settings", {
		beforeEach : function () {
			Localization.setLanguage("en-US");
		},
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	// Settings can be provided at the constructor call or in the according view source. View source wins.
	QUnit.test("async loading", function(assert) {
		return XMLView.create({
			viewName: 'example.mvc.test',
			displayBlock: false
		}).then(function(oView) {
			assert.equal(oView.getDisplayBlock(), true, "DisplayBlock should be true for the resolved async view");
			oView.destroy();
		});
	});

	QUnit.test("Using native HTML in XMLViews (future=true)", async function (assert) {
		future.active = true;
		await assert.rejects(XMLView.create({
			viewName: 'example.mvc.HtmlOnRoot'
		}), "View creation rejects because XMLView contains HTML content on root.");
		future.active = false;
	});

	QUnit.test("async loading new Factory with resource bundle", function(assert) {
		var oResourceBundleCreateSpy = sinon.spy(ResourceBundle, "create");
		var oViewPromise = XMLView.create({definition: "" +
				"<mvc:View resourceBundleName=\"testdata.mvc.text\"\n" +
				"\t\t   resourceBundleAlias=\"i18n\"\n" +
				"\t\t   xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">\n" +
				"\t<Panel id=\"aPanel\">\n" +
				"\t\t<Button id=\"Button1\" text=\"{i18n>TEXT_CLOSE}\"></Button>\n" +
				"\t</Panel>\n" +
				"</mvc:View>" +
				""});

		return oViewPromise.then(function(oView) {
			var oCreateCall = oResourceBundleCreateSpy.getCall(0);
			assert.ok(oCreateCall.args[0].async, "async call");
			oResourceBundleCreateSpy.restore();
			assert.ok(oView.getModel("i18n") instanceof ResourceModel, "has model with the expected alias");
			oView.destroy();
		});
	});

	QUnit.module("Error handling", {
		before: function() {
			this.logSpyError = sinon.spy(Log, "error");
			this.logSpyWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logSpyError.resetHistory();
			this.logSpyWarning.resetHistory();
		},
		after: function() {
			this.logSpyError.restore();
			this.logSpyWarning.restore();
		}
	});

	QUnit.test("[XMLView.create] broken binding string", function(assert) {
		var oViewPromise = XMLView.create({
			id: "asyncView1",
			definition:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel id='aPanel'>" +
			"       <m:Button id=\"Button1\" text=\"{This should cause a parse error\"></m:Button>" +
			"    </m:Panel>" +
			"</mvc:View>"
		});

		return oViewPromise.then(function(oView) {
			assert.ok(false, "should not succeed");
		}, function(err) {
			assert.strictEqual(
				err.message,
				"Error found in View (id: 'asyncView1').\n" +
				"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"Button1\" text=\"{This should cause a parse error\"/>':\n" +
				"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
				"SyntaxError is thrown during parsing of binding string."
			);
		});
	});

	QUnit.test("[XMLView.create] broken binding string, error in nested Fragment", function(assert) {
		var oViewPromise = XMLView.create({
			id: "asyncView2",
			definition:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel id='aPanel'>" +
			"       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" +
			"    </m:Panel>" +
			"</mvc:View>"
		});

		return oViewPromise.then(function(oView) {
			assert.ok(false, "should not succeed");
		}, function(err) {
			assert.strictEqual(
				err.message,
				"Error found in Fragment (id: 'asyncView2--innerFragment').\n" +
				"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" +
				"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
				"SyntaxError is thrown during parsing of binding string."
			);
		});
	});

	QUnit.test("[XMLView.create] error caused by missing function reference (property-type 'function')", function(assert) {
		var oViewPromise = XMLView.create({
			id: "asyncView3",
			definition:
			'<mvc:View xmlns="sap.m" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">' +
			'<Dialog id="dialog" title="XML Fragment Dialog" escapeHandler="closeDialog">' +
			'   <Text text="title" />                         ' +
			'   <Text text="nope" />                         ' +
			'   <buttons>                                              ' +
			'      <Button text="action!" press="doSomething" /> ' +
			'      <Button text="stuff" /> ' +
			'   </buttons>                                             ' +
			'</Dialog>                                                 ' +
			'</mvc:View>'
		});

		return oViewPromise.then(function(oView) {
			assert.ok(false, "should not succeed");
		}, function(err) {
			assert.strictEqual(
				err.message,
				"Error found in View (id: 'asyncView3').\n" +
				"XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" +
				"TypeError: The string 'closeDialog' couldn't be resolved to a function",
				"TypeError is thrown for missing function reference on Dialog."
			);
		});
	});

	QUnit.module("Nested XMLViews");

	QUnit.test("Directly Nested XMLViews (async)", function(assert) {
		var expectedControls = [
			"outer",
				"outer--before",
				"outer--middle",
					"outer--middle--before",
					"outer--middle--vbox",
						"outer--middle--indirect-inner",
							"outer--middle--indirect-inner--inside",
					"outer--middle--direct-inner",
						"outer--middle--direct-inner--inside",
					"outer--middle--after",
				"outer--after"
		];

		// load and place view, force rendering
		return XMLView.create({
			id: "outer",
			viewName: "example.mvc.outer"
		}).then(async function(oView) {
			const oMiddleView = await oView.byId("middle").loaded();
			await oMiddleView.byId("indirect-inner").loaded();
			await oMiddleView.byId("direct-inner").loaded();

			oView.placeAt("content");
			await nextUIUpdate();

			expectedControls.forEach(function(sId) {
				var oControl = Element.getElementById(sId);
				assert.ok(oControl, "control with id '" + sId + "' should exist");
				assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
			});

			// install delegates on each control to assert later that all have been rendered
			var count = 0;
			expectedControls.forEach(function(sId) {
				var oControl = Element.getElementById(sId);
				oControl.addDelegate({
					onBeforeRendering: function() {
						count += 100;
					},
					onAfterRendering: function() {
						count += 1;
					}
				});
			});

			// Act: force a re-rerendering of the outer view
			oView.invalidate();
			await nextUIUpdate();

			// Assert: everythging has been rendered again
			assert.equal(count, 101 * expectedControls.length, "all controls should have participated in the rendering");
			expectedControls.forEach(function(sId) {
				var oControl = Element.getElementById(sId);
				assert.ok(oControl, "control with id '" + sId + "' should exist");
				assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
				assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Dummy + sId), "there should be no more Dummy-Element for id '" + sId + "'");
				assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Temporary + sId), "there should be no more Temporary-Element for id '" + sId + "'");
			});

			oView.destroy();
			expectedControls.forEach(function(sId) {
				var oControl = Element.getElementById(sId);
				assert.notOk(oControl, "control with id '" + sId + "' should no longer exist");
				assert.notOk(document.getElementById(sId), "there should be no more DOM with id '" + sId + "'");
			});
		});
	});

	QUnit.module("Rendering", {
		before: function() {
			sap.ui.define("testdata/mvc/EmptyControl", ["sap/ui/core/Control"], function (Control) {
				return Control.extend("testdata.mvc.EmptyControl", {
					metadata: {},
					renderer: {
						render: function() { /* empty renderer is intentional */ }
					}
				});
			});
		}
	});

	QUnit.test("Empty Control in XMLView", function(assert) {
		var sXML =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:test="testdata.mvc">' +
			'<Button id="Benjamin" text="DJ Ben Jammin"></Button>' +
			'<test:EmptyControl></test:EmptyControl>' +
			// If the XMLViewRenderer does not correctly close it's placeholder <div> for the empty control,
			// the DOM of this button will slide into the DOM of the placeholder
			'<Button id="Jenson" text="Jenson"></Button>' +
		'</mvc:View>';

		return XMLView.create({
			definition: sXML
		}).then(async function (oView) {
			oView.placeAt("content");
			await nextUIUpdate();

			var oButtonDomRef = oView.byId("Jenson").getDomRef();
			assert.ok(oButtonDomRef.parentNode === oView.getDomRef(), "Button is a direct DOM child of the View.");

			oView.destroy();
		});
	});

	QUnit.module("Additional tests:");

	// error
	QUnit.test("Error in template - no default aggregation defined", function(assert) {
		var sXml = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
				'	<test:TestButton>',
				'		<test:Error/>',
				'	</test:TestButton>',
				'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_1').\n" +
					"XML node: '<test:Error xmlns:test=\"sap.ui.testlib\"/>':\n" +
					"Cannot add direct child without default aggregation defined for control sap.ui.testlib.TestButton";

		return XMLView.create({
			id: "erroneous_view_1",
			definition: sXml
		}).catch(function(oError) {
			assert.ok(oError, "Must reject with an error");
			assert.equal(oError.message, sError, "Error with correct error message");
		});
	});

	QUnit.test("Error in template - text in aggregation", function(assert) {
		var sXml = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
				'	<test:TestButton>',
				'		Error',
				'	</test:TestButton>',
				'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_2').\n" +
					"XML node: '\t\tError\t':\n" +
					"Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed.";

		return XMLView.create({
			id: "erroneous_view_2",
			definition: sXml
		}).catch(function(oError) {
			assert.ok(oError, "Must reject with an error");
			assert.equal(oError.message, sError, "Error with correct error message");
		});
	});

	QUnit.test("Error in controller", function(assert) {
		var sXml = [
				'<mvc:View controllerName="example.mvc.test.error" xmlns:mvc="sap.ui.core.mvc">',
				'</mvc:View>'
			].join('');

		// define erroneous controller
		Controller.extend("example.mvc.test.error", {
			onInit: function() {
				throw new Error("Controller error");
			}
		});

		return XMLView.create({
			id: "erroneous_view_3",
			definition: sXml
		}).catch(function(oError) {
			assert.ok(oError, "Must reject with an error");
		});
	});


	QUnit.test("DataBinding", function(assert) {
		var oModel1 = new JSONModel({
			booleanValue : true,
			integerValue: 8015,
			stringValue : 'Text1',
			data: {
				booleanValue: false,
				integerValue: 4242,
				stringValue: 'Text2'
			}
		});
		var oModel2 = new JSONModel({
			booleanValue : false,
			integerValue: 4711,
			stringValue : '1txeT'
		});

		var xmlWithBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" enabled="{/booleanValue}" text="{/stringValue}" width="{/integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithNamedBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" enabled="{model2>/booleanValue}" text="{model1>/stringValue}" width="{/integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithElementBinding = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" binding="{/data}" enabled="{booleanValue}" text="{stringValue}" width="{integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithoutBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn1" enabled="true" text="The following set is empty: \\{\\}" width="67" />',
			'  <test:TestButton id="btn2" enabled="false" text="\\{\\} is an empty set" width="42" />',
			'  <test:TestButton id="btn3" enabled="true" text="The following array is empty: []" width="67" />',
			'  <test:TestButton id="btn4" enabled="false" text="[] is an empty array" width="42" />',
			'</mvc:View>'
		].join('');

		return XMLView.create({
			definition: xmlWithBindings
		}).then(function (oViewWithBindings1) {
			oViewWithBindings1.setModel(oModel1);
			assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
			assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
			assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");
		})
		.then(function() {
			return XMLView.create({
				definition: xmlWithBindings
			}).then(function (oViewWithBindings2) {
				oViewWithBindings2.setModel(oModel2);
				assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
				assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
				assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");
			});
		}).then(function() {
			return XMLView.create({
				definition: xmlWithNamedBindings
			}).then(function (oViewWithNamedBindings) {
				oViewWithNamedBindings.setModel(oModel2);
				oViewWithNamedBindings.setModel(oModel1, "model1");
				oViewWithNamedBindings.setModel(oModel2, "model2");
				assert.equal(oViewWithNamedBindings.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
				assert.equal(oViewWithNamedBindings.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
				assert.equal(oViewWithNamedBindings.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");
			});
		}).then(function() {
			return XMLView.create({
				definition: xmlWithElementBinding
			}).then(function (oViewWithElementBinding) {
				oViewWithElementBinding.setModel(oModel1);
				assert.equal(oViewWithElementBinding.byId("btn").getEnabled(), oModel1.getData().data.booleanValue, "Check 'enabled' property of button 'btn'");
				assert.equal(oViewWithElementBinding.byId("btn").getText(), oModel1.getData().data.stringValue, "Check 'text' property of button 'btn'");
				assert.equal(oViewWithElementBinding.byId("btn").getWidth(), oModel1.getData().data.integerValue, "Check 'width' property of button 'btn'");
			});
		}).then(function() {
			return XMLView.create({
				definition: xmlWithoutBindings
			}).then(function (oViewWithoutBindings) {
				oViewWithoutBindings.setModel(oModel1);
				oViewWithoutBindings.setModel(oModel1, "model1");
				oViewWithoutBindings.setModel(oModel2, "model2");
				assert.equal(oViewWithoutBindings.byId("btn1").getText(), "The following set is empty: {}", "Check 'text' property of button 'btn1'");
				assert.equal(oViewWithoutBindings.byId("btn2").getText(), "{} is an empty set", "Check 'text' property of button 'btn2'");
				assert.equal(oViewWithoutBindings.byId("btn3").getText(), "The following array is empty: []", "Check 'text' property of button 'btn3'");
				assert.equal(oViewWithoutBindings.byId("btn4").getText(), "[] is an empty array", "Check 'text' property of button 'btn4'");
			});
		});
	});

	QUnit.test("Custom Data", function(assert) {
		var oModel = new JSONModel({
			value : 'myValue'
		});

		var xmlWithBindings = [
			'<mvc:View controllerName="example.mvc.test" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">',
			'  <test:TestButton id="btn" app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}" />',
			'</mvc:View>'
		].join('');

		return XMLView.create({
			definition: xmlWithBindings
		}).then(function(oView) {
			oView.setModel(oModel);
			assert.equal(oView.byId("btn").data("myKey1"), "myValue1", "Check CustomData 'myKey1' of button 'btn'");
			assert.equal(oView.byId("btn").data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of button 'btn'");
			assert.equal(oView.byId("btn").data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of button 'btn'");
		});
	});

	QUnit.module("View's root level settings");

	QUnit.test("Custom Data", function(assert) {
		var oModel = new JSONModel({
			value : 'myValue'
		});

		var xmlWithBindings = [
			'<mvc:View controllerName="example.mvc.test"',
			'  xmlns:mvc="sap.ui.core.mvc"',
			'  xmlns:test="sap.ui.testlib"',
			'  xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"',
			'  app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}">',
			'  <test:TestButton id="btn" app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}" />',
			'</mvc:View>'
		].join('');

		return XMLView.create({
			definition: xmlWithBindings
		}).then(function(oView) {
			oView.setModel(oModel);

			assert.equal(oView.data("myKey1"), "myValue1", "Check CustomData 'myKey1' of the View");
			assert.equal(oView.data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of the View");
			assert.equal(oView.data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of the View");
			assert.equal(oView.byId("btn").data("myKey1"), "myValue1", "Check CustomData 'myKey1' of button 'btn'");
			assert.equal(oView.byId("btn").data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of button 'btn'");
			assert.equal(oView.byId("btn").data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of button 'btn'");
		});
	});

	QUnit.test("Named Aggregation", function(assert) {
		var sXmlWithNamedAggregations = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" controllerName="example.mvc.test">',
			'  <mvc:content>',
			'    <test:TestButton id="contentButton" />',
			'  </mvc:content>',
			'  <mvc:dependents>',
			'    <test:TestButton id="dependentButton" />',
			'    <core:Fragment id="innerFragment" fragmentName="testdata.fragments.XMLFragmentDialog" type="XML"/>',
			'  </mvc:dependents>',
			'</mvc:View>'
		].join('');

		var sXmlWithNamedDependents = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" controllerName="example.mvc.test">',
			'  <test:TestButton id="contentButton" />',
			'  <mvc:dependents>',
			'    <test:TestButton id="dependentButton" />',
			'    <core:Fragment id="innerFragment" fragmentName="testdata.fragments.XMLFragmentDialog" type="XML"/>',
			'  </mvc:dependents>',
			'</mvc:View>'
		].join('');

		var sXmlWithWrongAggregation = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" controllerName="example.mvc.test">',
			'  <test:TestButton id="contentButton" />',
			'  <mvc:wrong>',
			'    <test:TestButton id="dependentButton" />',
			'  </mvc:wrong>',
			'</mvc:View>'
		].join('');

		return XMLView.create({
			id: "viewWithNamedAggregations",
			definition: sXmlWithNamedAggregations
		}).then(async function(oView) {
			oView.placeAt("content");
			await nextUIUpdate();

			assert.strictEqual(oView.getContent()[0].getId(),"viewWithNamedAggregations--contentButton", "viewWithNamedAggregations: The button was added correctly to content aggregation");

			var oDependentButton = oView.byId("dependentButton");
			assert.notOk(oDependentButton.getDomRef(), "controls that aren't in the content aggregation of the view shouldn't be rendered");
			assert.strictEqual(oView.getDependents()[0].getId(),"viewWithNamedAggregations--dependentButton", "viewWithNamedAggregations: The dependent button was added correctly to dependents aggregation");
			assert.strictEqual(oView.getDependents()[1].getId(),"viewWithNamedAggregations--innerFragment--xmlDialog", "viewWithNamedAggregations: The dialog control from the dependent fragment was added correctly to dependents aggregation");

			oView.destroy();
		}).then(function() {
			return XMLView.create({
				id: "xmlWithNamedDependents",
				definition: sXmlWithNamedDependents
			});
		}).then(function(oView) {
			assert.strictEqual(oView.byId("contentButton").getId(),"xmlWithNamedDependents--contentButton", "xmlWithNamedDependents: The button was added correctly");
			assert.strictEqual(oView.getContent()[0].getId(),"xmlWithNamedDependents--contentButton", "xmlWithNamedDependents: The button was added correctly to content aggregation");
			assert.strictEqual(oView.byId("dependentButton").getId(),"xmlWithNamedDependents--dependentButton", "xmlWithNamedDependents: The dependent button was added correctly");
			assert.strictEqual(oView.getDependents()[0].getId(),"xmlWithNamedDependents--dependentButton", "xmlWithNamedDependents: The dependent button was added correctly to dependents aggregation");
			assert.strictEqual(oView.getDependents()[1].getId(),"xmlWithNamedDependents--innerFragment--xmlDialog", "viewWithNamedAggregations: The dialog control from the dependent fragment was added correctly to dependents aggregation");
			oView.destroy();
		}).then(function() {
			return XMLView.create({
				id: "xmlWithWrongAggregation",
				definition: sXmlWithWrongAggregation
			});
		}).then(function() {
			assert.notOK(true, "The XMLView.create promise shouldn't resolve");
		}, function(oError) {
			assert.ok(oError.message.match(/failed to load .{1}sap\/ui\/core\/mvc\/wrong\.js/), "xmlWithWrongAggregation: Error thrown for unknown aggregation");
		});
	});

	QUnit.module("Preprocessor API", {
		beforeEach: function() {
			// reset global preprocessors
			View._mPreprocessors = {};
			this.sViewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc"/>';
			this.runPreprocessorSpy = sinon.spy(View.prototype, "runPreprocessor");
			this.fnGetConfig = function(fnPreprocessor, bSyncSupport) {
				return {
					preprocessor: fnPreprocessor,
					_syncSupport: !!bSyncSupport
				};
			};
			this.fnChangeSourcePreprocessor = function(xml) {
				this.xml = XMLHelper.parse(this.sViewContent).documentElement;
				return this.xml;
			}.bind(this);
			this.createView = function() {
				var preprocessor = {
					preprocessor: this.fnChangeSourcePreprocessor,
					_syncSupport: true
				};
				return XMLView.create({
					definition: this.sViewContent,
					preprocessors: {
						xml: preprocessor,
						viewxml: preprocessor
					}
				});
			}.bind(this);
		},
		afterEach: function() {
			this.runPreprocessorSpy.restore();
			delete this.xml;
		}
	});

	QUnit.test("registration (future=true)", function(assert) {
		future.active = true;
		var logSpyError = this.spy(Log, "error");

		var noop = function() {};
		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, noop, false);
		XMLView.registerPreprocessor(XMLView.PreprocessorType.VIEWXML, noop, false);
		XMLView.registerPreprocessor(XMLView.PreprocessorType.CONTROLS, noop, false);

		assert.strictEqual(View._mPreprocessors["XML"]["xml"][0].preprocessor, noop, "Registration for xml successful");
		assert.strictEqual(View._mPreprocessors["XML"]["viewxml"][0].preprocessor, noop, "Registration for viewxml successful");
		assert.strictEqual(View._mPreprocessors["XML"]["controls"][0].preprocessor, noop, "Registration for content successful");

		logSpyError.resetHistory();
		let sExpectedMessage = 'Preprocessor could not be registered due to unknown sType "UNKNOWN"';
		assert.throws(() => XMLView.registerPreprocessor("unknown", noop, false, {type: "unknown"}),
			new Error(sExpectedMessage),
			"Error logged when registering invalid type");
		assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");

		logSpyError.resetHistory();
		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, noop, false, true);
		sExpectedMessage = 'Registration for "xml" failed, only one on-demand-preprocessor allowed';
		assert.throws(() => XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, noop, false, true),
			new Error(sExpectedMessage),
			"Error logged when registering more than one ondemand pp");
		assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");

		// explicitly providing view type "XML" does not fail
		var fnUniquePP = function() {};
		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "XML", false);
		assert.ok(Array.isArray(View._mPreprocessors["XML"]["xml"]) &&
			View._mPreprocessors["XML"]["xml"].some(function(entry) {
				return entry.preprocessor === fnUniquePP;
			}), "Preprocessor call passed through to View");

		// explicitly providing an unsupported type fails
		assert.throws(function() {
			XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "YAML", false);
		}, TypeError, "TypeError thrown when registering for a view type other than XML");
		future.active = undefined;
	});

	QUnit.test("async: assignment of preprocessor results", function(assert) {
		assert.expect(1);
		return this.createView().then(function(oView) {
			assert.strictEqual(oView._xContent, this.xml, "Result was correctly assigned");
		}.bind(this));
	});

	/*
	 * @param {boolean} bSync view loading mode
	 * @param {string} sType preprocessor type
	 * @param {int} [iCount] number of preprocessors, if not set the legacy version is tested
	 * @return {undefined|Promise} view promise in async mode
	 */
	function testPreprocessor(assert, bSync, sType, iCount) {
		var oView, oPreprocessors = {},
			preprocessorSpy = sinon.spy(function(vSource) {
				return bSync ? vSource : Promise.resolve(vSource);
			}),
			fnAssert = function() {
				if (sType === "viewxml") {
					sinon.assert.calledThrice(this.runPreprocessorSpy);
				} else {
					sinon.assert.calledTwice(this.runPreprocessorSpy);
				}
				sinon.assert.calledWith(this.runPreprocessorSpy, sType);
				sinon.assert.callCount(preprocessorSpy, iCount);
			}.bind(this);

		assert.expect(3);

		if (!iCount) {
			// compatible / legacy version with single preprocessor declaration
			iCount = 1;
			oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);
		} else {
			oPreprocessors[sType] = [];
			for (var i = 0; i < iCount; i++) {
				oPreprocessors[sType][i] = this.fnGetConfig(preprocessorSpy, true);
			}
		}

		oView = XMLView.create({
			definition: this.sViewContent,
			preprocessors: oPreprocessors
		});

		return bSync ? fnAssert() : oView.then(fnAssert);
	}

	function testPreprocessorError(assert, sType) {
		var oPreprocessors = {},
			oError = new Error("preprocessor failed"),
			preprocessorSpy = sinon.spy(function(vSource) {
				throw oError;
			}),
			fnAssert = function(e) {
				assert.strictEqual(e, oError, "error was processed");
			};

		oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);
		return XMLView.create({
			definition: this.sViewContent,
			preprocessors: oPreprocessors
		}).catch(fnAssert);
	}

	jQuery.each(XMLView.PreprocessorType, function(sProp, sType) {
		QUnit.test("async - single preprocessor " + sType + " (compatible)", function(assert) {
			return testPreprocessor.call(this, assert, false, sType);
		});
		QUnit.test("async - multiple preprocessors " + sType, function(assert) {
			return testPreprocessor.call(this, assert, false, sType, 2);
		});

		QUnit.test("async - preprocessor error " + sType, function(assert) {
			assert.expect(1);
			return testPreprocessorError.call(this, assert, sType);
		});
	});

	QUnit.module("Compatibility");

	QUnit.test("XMLView with wrong root node name should still be parsed correctly (future=true)", async function(assert) {
		future.active = true;
		var sContent = [
			'<mvc:view xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">',
			'  <m:Panel id="panel">',
			'  </m:Panel>',
			'</mvc:view>'
		].join('');

		await assert.rejects(XMLView.create({
			id: "wrongRootNodeName",
			definition: sContent
		}),
		new Error("XMLView's root node must be 'View' or 'XMLView' and have the namespace 'sap.ui.core.mvc'"),
		"View creation rejects with correct error");
	});


	// let test starter wait for the XML to be loaded
	return pViewXMLLoaded;
});
