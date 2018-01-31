sap.ui.define([
	'sap/ui/core/library',
	'./AnyView.qunit'
], function(coreLibrary, testsuite) {

	var ViewType = coreLibrary.mvc.ViewType;

	var oConfig = {
		viewClassName : "sap.ui.core.mvc.HTMLView",
		idsToBeChecked : ["myPanel", "Button1", "Button2"]
	};

	testsuite(oConfig, "HTMLView creation loading from file", function() {
		return sap.ui.htmlview("example.mvc.test");
	});

	testsuite(oConfig, "HTMLView creation via HTML string", function() {
		var sHtml = '<template data-controller-name="example.mvc.test"><div class="test test2 test3" data-sap-ui-type="sap.ui.commons.Panel" id="myPanel">	<div class="test test2 test3" data-sap-ui-type="sap.ui.commons.Button" id="Button1" data-text="Hello World" data-press="doIt"></div>	<div data-sap-ui-type="sap.ui.commons.Button" id="Button2" data-text="Hello"></div>	<div data-sap-ui-type="sap.ui.commons.Button" id="ButtonX" data-text="Another Hello" data-press=".sap.doIt"></div>	<div data-sap-ui-type="sap.ui.core.mvc.HTMLView" id="MyHTMLView" data-view-name="example.mvc.test2"></div>	<div data-sap-ui-type="sap.ui.core.mvc.JSView" id="MyJSView" data-view-name="example.mvc.test2"></div>	<div data-sap-ui-type="sap.ui.core.mvc.JSONView" id="MyJSONView" data-view-name="example.mvc.test2"></div>	<div data-sap-ui-type="sap.ui.core.mvc.XMLView" id="MyXMLView" data-view-name="example.mvc.test2"></div></div></template>';
		return sap.ui.htmlview({viewContent:sHtml});
	});

	testsuite(oConfig, "HTMLView creation via generic view factory", function() {
		return sap.ui.view({type:ViewType.HTML,viewName:"example.mvc.test", viewData:{test:"testdata"}});
	}, true);

	QUnit.module("Custom Tests");

	QUnit.test("Embedded HTML", function(assert) {
		assert.expect(13);
		var oView = sap.ui.view({type:ViewType.HTML,viewName:"example.mvc.test", viewData:{test:"testdata"}});
		oView.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#htmlRoot").html(), "THIS IS A TEST" , "HTML at root level rendered");
		assert.equal(jQuery("#htmlNested").html(), "NESTED WORKS AS WELL",   "HTML at nested level rendered");
		assert.ok(jQuery("#htmlEmbeddedTable")[0], "HTML at embedded level rendered");
		oView.destroy();
	});

	QUnit.test("Assocations", function(assert) {
		assert.expect(13);
		var oView = sap.ui.view({type:ViewType.HTML,viewName:"example.mvc.test", viewData:{test:"testdata"}});
		oView.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oLabel = oView.byId("MyLabel");
	 	assert.equal(oLabel.getLabelFor(), oView.byId("message").getId(), "Assocation id is set right");
	 	var oNavigationBar = oView.byId("MyNavigationBar");
	 	assert.equal(oNavigationBar.getAssociatedItems().length, 3, "Number of associated controls is right");
	 	assert.deepEqual(oNavigationBar.getAssociatedItems(), [oView.byId("navitem1").getId(), oView.byId("navitem2").getId(), oView.byId("navitem3").getId()],"Number of associated controls is right", "Assocation IDs are set right");
		oView.destroy();
	});

	QUnit.test("Custom Data", function(assert) {
		assert.expect(12);
		var oView = sap.ui.view({type:ViewType.HTML,viewName:"example.mvc.test", viewData:{test:"testdata"}});
		oView.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.equal(oView.byId("Button2").data("myData1"), "myvalue1", "Custom Data set properly");
		assert.equal(oView.byId("Button2").data("myData2"), "formatted-value", "Custom Data Formatter works properly");
		oView.destroy();
	});

	QUnit.test("DataBinding", function(assert) {

		var oModel1 = new sap.ui.model.json.JSONModel({
			booleanValue : true,
			integerValue: 8015,
			stringValue : 'Text1',
			data: {
				booleanValue : true,
				integerValue: 8015,
				stringValue : 'Text1'
			}
		});
		var oModel2 = new sap.ui.model.json.JSONModel({
			booleanValue : false,
			integerValue: 4711,
			stringValue : '1txeT'
		});

		var htmlWithBindings = [
			'<template data-controller-name="example.mvc.test">',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn" data-enabled="{/booleanValue}" data-text="{/stringValue}" data-width="{/integerValue}"></div>',
			'</template>'
		].join('');

		var htmlWithNamedBindings = [
			'<template data-controller-name="example.mvc.test">',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn" data-enabled="{model2>/booleanValue}" data-text="{model1>/stringValue}" data-width="{/integerValue}"></div>',
			'</template>'
		].join('');

		var htmlWithElementBinding = [
			'<template data-controller-name="example.mvc.test">',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn" data-sap-ui-binding="{/data}" data-enabled="{booleanValue}" data-text="{stringValue}" data-width="{integerValue}"></div>',
			'</template>'
		].join('');

		var htmlWithoutBindings = [
			'<template data-controller-name="example.mvc.test">',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn1" data-enabled="true" data-text="The following set is empty: \\{\\}" data-width="67"></div>',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn2" data-enabled="false" data-text="\\{\\} is an empty set" data-width="42"></div>',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn3" data-enabled="true" data-text="The following array is empty: []" data-width="67"></div>',
			'  <div data-sap-ui-type="sap.ui.testlib.TestButton" id="btn4" data-enabled="false" data-text="[] is an empty array" data-width="42"></div>',
			'</template>'
		].join('');

		var oViewWithBindings1 = sap.ui.htmlview({viewContent:htmlWithBindings});
		oViewWithBindings1.setModel(oModel1);
		assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithBindings2 = sap.ui.htmlview({viewContent:htmlWithBindings});
		oViewWithBindings2.setModel(oModel2);
		assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithNamedBindings = sap.ui.htmlview({viewContent:htmlWithNamedBindings});
		oViewWithNamedBindings.setModel(oModel1, "model1");
		oViewWithNamedBindings.setModel(oModel2, "model2");
		assert.equal(oViewWithNamedBindings.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithNamedBindings.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithElementBinding = sap.ui.htmlview({viewContent:htmlWithElementBinding});
		oViewWithElementBinding.setModel(oModel1);
		assert.equal(oViewWithElementBinding.byId("btn").getEnabled(), oModel1.getData().data.booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithElementBinding.byId("btn").getText(), oModel1.getData().data.stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithElementBinding.byId("btn").getWidth(), oModel1.getData().data.integerValue, "Check 'width' property of button 'btn'");

		var oViewWithoutBindings = sap.ui.htmlview({viewContent:htmlWithoutBindings});
		oViewWithoutBindings.setModel(oModel1);
		oViewWithoutBindings.setModel(oModel1, "model1");
		oViewWithoutBindings.setModel(oModel2, "model2");
		assert.equal(oViewWithoutBindings.byId("btn1").getText(), "The following set is empty: {}", "Check 'text' property of button 'btn1'");
		assert.equal(oViewWithoutBindings.byId("btn2").getText(), "{} is an empty set", "Check 'text' property of button 'btn2'");
		assert.equal(oViewWithoutBindings.byId("btn3").getText(), "The following array is empty: []", "Check 'text' property of button 'btn3'");
		assert.equal(oViewWithoutBindings.byId("btn4").getText(), "[] is an empty array", "Check 'text' property of button 'btn4'");
	});

});