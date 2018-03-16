sap.ui.define([
	'sap/ui/core/library',
	'./AnyView.qunit'
], function(coreLibrary, testsuite) {

	var ViewType = coreLibrary.mvc.ViewType;

	var oConfig = {
		viewClassName : "sap.ui.core.mvc.JSONView",
		idsToBeChecked : ["myPanel", "Button1"]
	};

	testsuite(oConfig, "JSONView creation loading from file", function() {
		return sap.ui.jsonview("example.mvc.test");
	});

	testsuite(oConfig, "JSONView creation via JSON string", function() {
		var json = '{	"Type": "sap.ui.core.JSONView",	"controllerName":"example.mvc.test",	"content": [{		"Type":"sap.ui.commons.Panel",		"id":"myPanel",		"content":[{			"Type":"sap.ui.commons.Button",			"id":"Button1",			"text":"Hello World!",			"press": "doIt"		},		{			"Type":"sap.ui.commons.Button",			"id":"Button2",			"text":"Hello"		},		{			"Type":"sap.ui.commons.Button",			"id":"ButtonX",			"text":"Another Hello",			"press": ".sap.doIt"		},		{			"Type":"sap.ui.core.mvc.JSONView",			"viewName":"example.mvc.test2",			"id":"MyJSONView"		},				{			"Type":"sap.ui.core.mvc.JSView",			"viewName":"example.mvc.test2",			"id":"MyJSView"		},				{			"Type":"sap.ui.core.mvc.XMLView",			"viewName":"example.mvc.test2",			"id":"MyXMLView"		},		{			"Type":"sap.ui.core.mvc.HTMLView",			"viewName":"example.mvc.test2",			"controllerName":"example.mvc.test",			"id":"MyHTMLView"		}]	}]}';
		return sap.ui.jsonview({viewContent:json});
	});

	testsuite(oConfig, "JSONView creation via generic view factory", function() {
		return sap.ui.view({type:ViewType.JSON,viewName:"example.mvc.test", viewData:{test:"testdata"}});
	}, true);

	QUnit.test("JSONView should be able to resolve controller methods", function(assert) {
		var oView = sap.ui.jsonview("example.mvc.test");
		var oButtonWithBinding = oView.byId("ButtonWithBinding");
		assert.ok(oButtonWithBinding, "button could be found");
		var oBindingInfo = oButtonWithBinding.getBindingInfo("text");
		assert.ok(oBindingInfo, "there should be a binding info for property 'text'");
		assert.ok(typeof oBindingInfo.formatter === 'function', "formatter should have been resolved");
		assert.ok(oBindingInfo.formatter(42) === 'formatted-42', "formatter should be the one form the controller"); // TODO test should involve instance
		oView.destroy();
	});

});