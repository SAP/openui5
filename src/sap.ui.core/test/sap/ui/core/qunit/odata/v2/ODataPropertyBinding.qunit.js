/*global QUnit, sinon*/
sap.ui.define([
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService",
	"sap/m/Text",
	'sap/ui/model/ChangeReason',
	"sap/ui/model/odata/ODataPropertyBinding",
	"sap/ui/model/odata/v2/ODataModel"
], function(fakeService, Text, ChangeReason, ODataPropertyBinding, ODataModel) {

	"use strict";
	// time to wait for server responses
	var oModel;
	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
		sURI = "/proxy/http/" + sURI.replace("http://","");

	function removeSharedMetadata() {
		var sServiceURI = sURI.replace(/\/$/, "");
		if (ODataModel.mServiceData
				&& ODataModel.mServiceData[sServiceURI]) {
			delete ODataModel.mServiceData[sServiceURI].oMetadata;
		}
	}

	function initModel(bJSON) {
		return new ODataModel(sURI, {
			json: bJSON,
			useBatch: true
		});
	}
	// Request security token to avoid later HEAD requests
	initModel().refreshSecurityToken();

	QUnit.module("v2.ODataPropertyBinding", {
		beforeEach : function() {
			oModel = initModel(false);
			this.oText = new Text();
		},
		afterEach : function() {
			oModel = undefined;
			this.oText.destroy();
			removeSharedMetadata();
		}
	});

	QUnit.test("PropertyBinding refresh model with forced flag", function(assert){
		var done = assert.async();
		var that = this;
		var handlerSpy = sinon.spy(function() {
			if (handlerSpy.callCount === 4) {
				assert.equal(that.oText.getText(), "2");
				done();
			} else if (handlerSpy.callCount === 3) {
				assert.equal(that.oText.getText(), "changed");
			}
		});
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindProperty("/Products(2)/ProductID");
			//oModel.addBinding(oBinding);
			oBinding.attachChange(handlerSpy);
			// 1 call to change
			oBinding.initialize();

			// use text
			that.oText.setModel(oModel);
			that.oText.bindElement("/Products(2)");
			that.oText.bindProperty("text", {path: "ProductID", mode: "OneWay"});


			// 2 calls to change
			oModel.refresh(true);
			that.oText.setText("changed");
			oModel.refresh(true);
		});
	});

	QUnit.test("PropertyBinding get value", function(assert){
		var done = assert.async();
		var that = this;
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindProperty("/Products(2)/ProductID");
			// 1 call to change
			oBinding.initialize();

			// use text
			that.oText.setModel(oModel);
			that.oText.bindElement("/Products(2)");
			that.oText.bindProperty("text", {path: "ProductID", mode: "OneWay"});

			oBinding.attachChange(function() {

				assert.equal(oBinding.getValue(), 2);
				done();
			});
		});
	});

	QUnit.test("PropertyBinding set value", function(assert){
		var done = assert.async();
		var that = this;
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindProperty("/Products(2)/ProductID");
			// 1 call to change
			oBinding.initialize();

			// use text
			that.oText.setModel(oModel);
			that.oText.bindElement("/Products(2)");
			that.oText.bindProperty("text", {path: "ProductID", mode: "OneWay"});

			oBinding.attachChange(function() {

				assert.equal(oBinding.getValue(), 2);
				// 2 calls to change
				oBinding.setValue(4711);

				assert.equal(oBinding.getValue(), 4711);
				done();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("setValue: bSuspended = true", function(assert) {
		const oBinding = {bSuspended: true};

		// code under test
		ODataPropertyBinding.prototype.setValue.call(oBinding, "~vValue");

		assert.strictEqual(oBinding.oValue, undefined);
	});

	//*********************************************************************************************
["~sValue", 1, {"ms": 12345}, undefined].forEach(function(vValue, i) {
	QUnit.test("setValue: new value = old value " + i, function(assert) {
		const oBinding = {oValue: vValue};

		// code under test
		ODataPropertyBinding.prototype.setValue.call(oBinding, vValue);

		assert.strictEqual(oBinding.oValue, vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("setValue: ODataModel#setProperty returns false", function(assert) {
		const oBinding = {
			oContext: "~oContext",
			oModel: {
				setProperty() {}
			},
			sPath: "~sPath",
			oValue: "~oOldValue"
		};
		this.mock(oBinding.oModel).expects("setProperty")
			.withExactArgs("~sPath", "~oNewValue", "~oContext", true)
			.returns(false);

		// code under test
		ODataPropertyBinding.prototype.setValue.call(oBinding, "~oNewValue");

		assert.strictEqual(oBinding.oValue, "~oOldValue");
	});

	//*********************************************************************************************
	QUnit.test("setValue", function(assert) {
		const oBinding = {
			oContext: "~oContext",
			oModel: {
				firePropertyChange() {},
				setProperty() {}
			},
			sPath: "~sPath",
			oValue: "~oValue",
			getDataState() {}
		};
		const oModelMock = this.mock(oBinding.oModel);
		oModelMock.expects("setProperty").withExactArgs("~sPath", "~oNewValue", "~oContext", true).returns(true);
		const oDataState = {setValue() {}};
		this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
		this.mock(oDataState).expects("setValue").withExactArgs("~oNewValue");
		oModelMock.expects("firePropertyChange")
			.withExactArgs({
				reason: ChangeReason.Binding,
				path: "~sPath",
				context: "~oContext",
				value: "~oNewValue"
			});

		// code under test
		ODataPropertyBinding.prototype.setValue.call(oBinding, "~oNewValue");

		assert.strictEqual(oBinding.oValue, "~oNewValue");
	});
});