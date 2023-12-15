/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/m/Input",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/type/Float",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/model/xml/XMLPropertyBinding"
], function(Log, Localization, Input, ChangeReason, TypeFloat, XMLModel, XMLPropertyBinding) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	var testData =
		"<root>" +
			"<name>Peter</name>" +
			"<teamMembers>" +
				"<member firstName=\"Andreas\" lastName=\"Klark\" gender=\"male\">1</member>" +
				"<member firstName=\"Peter\" lastName=\"Miller\" gender=\"male\">2</member>" +
				"<member firstName=\"Gina\" lastName=\"Rush\" gender=\"female\">3</member>" +
				"<member firstName=\"Steave\" lastName=\"Ander\" gender=\"male\">4</member>" +
				"<member firstName=\"Michael\" lastName=\"Spring\" gender=\"male\">5</member>" +
				"<member firstName=\"Marc\" lastName=\"Green\" gender=\"male\">6</member>" +
				"<member firstName=\"Frank\" lastName=\"Wallace\" gender=\"male\">7</member>" +
			"</teamMembers>" +
			"<values>" +
				"<value value=\"3.55\"></value>" +
				"<value value=\"5.3324\"></value>" +
				"<value value=\"345.55\"></value>" +
				"<value value=\"44\"></value>" +
				"<value value=\"23\"></value>" +
				"<value value=\"22\"></value>" +
				"<value value=\"32\"></value>" +
			"</values>" +
		"</root>";

	QUnit.module("sap.ui.model.xml.XMLPropertyBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			// reset bindings
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
			Localization.setLanguage("en-US");
		},
		afterEach: function() {
			this.oModel.destroy();
			Localization.setLanguage(sDefaultLanguage);
		},
		createPropertyBindings: function(path, property, context) {
			// create bindings
			var bindings = [];
			for (var i = 0; i < 7; i++) {
				bindings[i] = this.oModel.bindProperty(path + "/" + i + "/" + property, context);
				//this.oModel.bindProperty(".teamMembers.lastName", entry.lastName);
			}
			return bindings;
		}
	});

	QUnit.test("PropertyBinding getValue", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers/member", "@lastName");

		assert.equal(bindings[0].getValue(), "Klark" , "Property binding value");
		assert.equal(bindings[1].getValue(), "Miller" , "Property binding value");
		assert.equal(bindings[2].getValue(), "Rush" , "Property binding value");
		assert.equal(bindings[3].getValue(), "Ander" , "Property binding value");
		assert.equal(bindings[4].getValue(), "Spring" , "Property binding value");
		assert.equal(bindings[5].getValue(), "Green" , "Property binding value");
		assert.equal(bindings[6].getValue(), "Wallace" , "Property binding value");
	});

	QUnit.test("PropertyBinding refresh", function(assert) {
		const oBinding = this.oModel.bindProperty("/name");
		let iChangeCount = 0;

		assert.strictEqual(oBinding.getValue(), "Peter", "Property Binding returns value");
		oBinding.attachChange(function() {
			iChangeCount += 1;
		});
		this.oModel.getData().firstChild.firstChild.firstChild.nodeValue = "Jonas";
		assert.strictEqual(iChangeCount, 0, "Property Binding fires change event when changed");

		// code under test
		oBinding.refresh();

		assert.strictEqual(oBinding.getValue(), "Jonas", "Property Binding returns changed value");
		assert.strictEqual(iChangeCount, 1, "Property Binding fires change event when changed");
	});

	QUnit.test("PropertyBinding async update", function(assert) {
		var oBinding1 = this.oModel.bindProperty("/name"),
			oBinding2 = this.oModel.bindProperty("/name");
		oBinding1.attachChange(function(){});
		oBinding2.attachChange(function(){});
		oBinding1.initialize();
		oBinding2.initialize();
		assert.equal(oBinding1.getValue(), "Peter", "Property Binding 1 returns value");
		oBinding1.setValue("Jonas");
		assert.equal(oBinding1.getValue(), "Jonas", "Property Binding 1 returns updated value");
		assert.equal(oBinding2.getValue(), "Peter", "Property Binding 2 returns old value");
		this.oModel.refresh();
		assert.equal(oBinding2.getValue(), "Jonas", "Property Binding 2 returns updated value after refresh");
	});

	QUnit.test("PropertyBinding getExternalValue", function(assert) {
		var bindings = this.createPropertyBindings("/values/value", "@value");

		assert.equal(bindings[0].getExternalValue(), "3.55" , "Property binding value");
		assert.equal(bindings[1].getExternalValue(), "5.3324" , "Property binding value");
		assert.equal(bindings[2].getExternalValue(), "345.55" , "Property binding value");
		assert.equal(bindings[3].getExternalValue(), "44" , "Property binding value");
		assert.equal(bindings[4].getExternalValue(), "23" , "Property binding value");
		assert.equal(bindings[5].getExternalValue(), "22" , "Property binding value");
		assert.equal(bindings[6].getExternalValue(), "32" , "Property binding value");

		bindings[0].setType(new TypeFloat(),"string");
		assert.equal(bindings[0].getExternalValue(), "3.55" , "Property binding value");
	});

	QUnit.test("PropertyBinding setExternalValue", function(assert) {
		var bindings = this.createPropertyBindings("/values/value", "@value");

		//var attach = false;
		//var detach = true;

		function callBackOnChange() {
			//attach = true;
			//detach = false;
		}

		bindings[0].attachChange(callBackOnChange);

		bindings[0].setType(new TypeFloat(), "string");
		bindings[0].setValue(55.555);
		assert.equal(bindings[0].getValue(), "55.555" , "Property binding value");
		assert.equal(bindings[0].getExternalValue(), "55.555" , "Property binding value");
		bindings[0].setExternalValue("2.13543");
		assert.equal(bindings[0].getValue(), "2.13543" , "Property binding value");
		assert.equal(bindings[0].getExternalValue(), "2.13543" , "Property binding value");

		bindings[0].detachChange(callBackOnChange);

	});

	QUnit.test("PropertyBinding suspend/resume with control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
		oInput.attachChange(function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");
			assert.equal(oInput.getValue(), "Peter", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		oBinding.suspend();
		oInput.setValue("Petre");
		assert.equal(oInput.getValue(), "Petre", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with control and model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		oInput.setValue("Petrus");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		oBinding.setValue("xxx");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with model and control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		oInput.setValue("Petrus");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		oBinding.resume();
	});

	QUnit.test("propertyChange event", function(assert){
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
		this.oModel.attachPropertyChange(this, function(oEvent){
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			assert.equal(sPath, "/name", "path check!");
			assert.equal(oContext, undefined, "context check!");
			assert.equal(oValue, "blubb", "property value check!");
			assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			oInput.destroy();
			done();
		});
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should not trigger event
		this.oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
		// should trigger event
		oInput.setValue("blubb");
	});

	QUnit.test("propertyChange event relative", function(assert){
		var done = assert.async();
		var oInput = new Input({
			value: "{@firstName}"
		});
		oInput.setModel(this.oModel);
		this.oModel.attachPropertyChange(this, function(oEvent){
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			assert.equal(sPath, "@firstName", "path check!");
			assert.equal(oContext.getPath(), "/teamMembers/member/1", "context check!");
			assert.equal(oValue, "blubb", "property value check!");
			assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			oInput.destroy();
			done();
		});
		oInput.bindObject("/teamMembers/member/1");
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should not trigger event
		this.oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
		// should trigger event
		oInput.setValue("blubb");
	});

	QUnit.test("propertyChange event reset", function(assert){
		var done = assert.async();
		var oInput = new Input({
			value: "{@firstName}"
		});
		var iCount = 0;
		oInput.setModel(this.oModel);
		this.oModel.attachPropertyChange(this, function(oEvent){
			iCount++;
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			if (iCount === 1) {
				assert.equal(sPath, "@firstName", "path check!");
				assert.equal(oContext.getPath(), "/teamMembers/member/1", "context check!");
				assert.equal(oValue, "blubb", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
				oInput.setValue("Andreas");

			} else if (iCount === 2) {
				assert.equal(sPath, "@firstName", "path check!");
				assert.equal(oContext.getPath(), "/teamMembers/member/1", "context check!");
				assert.equal(oValue, "Andreas", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			}
		});
		oInput.bindObject("/teamMembers/member/1");
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should trigger event
		oInput.setValue("blubb");
		oInput.destroy();
		done();
	});

	//**********************************************************************************************
	QUnit.test("checkUpdate: suspended", function () {
		// code under test - suspended binding is not updated
		XMLPropertyBinding.prototype.checkUpdate.call({bSuspended: true});
	});

	//**********************************************************************************************
	QUnit.test("checkUpdate: no update needed", function () {
		const oBinding = {
			oValue: "~value",
			_getValue() {}
		};
		this.mock(oBinding).expects("_getValue").withExactArgs().returns("~value");

		// code under test - values are equal, no force update
		XMLPropertyBinding.prototype.checkUpdate.call(oBinding);
	});

	//**********************************************************************************************
[{
	forceUpdate: undefined,
	newValue: "~newValue",
	test: "value changed"
}, {
	forceUpdate: true,
	newValue: "~value",
	test: "force update"
}].forEach((oFixture) => {
	QUnit.test(`checkUpdate: ${oFixture.test}`, function (assert) {
		const oBinding = {
			oValue: "~value",
			_fireChange() {},
			_getValue() {},
			checkDataState() {},
			getDataState() {}
		};
		this.mock(oBinding).expects("_getValue").withExactArgs().returns(oFixture.newValue);
		const oDataState = {
			setValue() {}
		};
		this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
		this.mock(oDataState).expects("setValue").withExactArgs(oFixture.newValue);
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Change});

		// code under test - values are different, no force update
		XMLPropertyBinding.prototype.checkUpdate.call(oBinding, oFixture.forceUpdate);

		assert.strictEqual(oBinding.oValue, oFixture.newValue);
	});
});
});