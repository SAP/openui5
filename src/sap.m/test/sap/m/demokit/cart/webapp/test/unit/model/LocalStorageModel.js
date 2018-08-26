/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/demo/cart/model/LocalStorageModel",
	"sap/ui/util/Storage"
], function (LocalStorageModel, Storage) {
	"use strict";

	QUnit.module("LocalStorageModel - Defaults");

	QUnit.test("Should intialize the local storage model with its defaults", function (assert) {
		// act
		var oLocalStorageModel = new LocalStorageModel();

		// assert
		assert.strictEqual(oLocalStorageModel._STORAGE_KEY, "LOCALSTORAGE_MODEL", "Default storage key was set");

		// cleanup
		oLocalStorageModel.destroy();
	});

	QUnit.module("LocalStorageModel - Parameters", {
		beforeEach: function() {
			// stub the _loadData method called in the constructor
			this.fnLoadData = sinon.stub(LocalStorageModel.prototype, "_loadData");
			// stub the storage api
			this.oStorage = new Storage();
			this.fnPutStub = sinon.stub(this.oStorage, "put");
			this.fnGetStub = sinon.stub(this.oStorage, "get");
			// initialize the model with parameters and inject the stub
			this.oLocalStorageModel  = new LocalStorageModel("MY_KEY", {1: 2, 3: 4});
			this.oLocalStorageModel._storage = this.oStorage;
			this.oLocalStorageModel._bDataLoaded = true;
			this.fnLoadData.restore();
		},
		afterEach: function () {
			this.fnPutStub.restore();
			this.fnGetStub.restore();
			this.oLocalStorageModel.destroy();
		}
	});

	QUnit.test("Should intialize the local storage model properly", function (assert) {
		assert.ok(this.fnLoadData.calledOnce, " The data was read from the local storage by calling the constructor");
		assert.deepEqual(this.oLocalStorageModel.getData(), {1: 2, 3: 4}, "The initial data was set on the model");
		assert.strictEqual(this.oLocalStorageModel.iSizeLimit, 1000000, "The size limit on the model has been increased");
	});

	QUnit.test("Should read the data from the local storage", function (assert) {
		// act
		this.oLocalStorageModel._loadData();
		//Assert
		assert.ok(this.fnGetStub.calledOnce, "The data was read from the local storage");
		assert.ok(this.fnGetStub.calledWith("MY_KEY"), "The custom storage key was used");
	});

	QUnit.test("Should write the data to the local storage when calling \"setProperty\" on the model", function (assert) {
		//Assert
		this.oLocalStorageModel.setProperty("/foo", "bar");
		assert.ok(this.fnPutStub.calledOnce, "The data was written to the local storage");
		assert.ok(this.fnPutStub.calledWith("MY_KEY"), "The custom storage key was used");
	});

	QUnit.test("Should write the data to the local storage when calling \"setData\" on the model", function (assert) {
		//Assert
		this.oLocalStorageModel.setData({foo:"bar"});
		assert.ok(this.fnPutStub.calledOnce, "The data was written to the local storage");
		assert.ok(this.fnPutStub.calledWith("MY_KEY"), "The custom storage key was used");
	});

	QUnit.test("Should write the data to the local storage when calling \"refresh\" on the model", function (assert) {
		//Assert
		this.oLocalStorageModel.refresh(true);
		assert.ok(this.fnPutStub.calledOnce, "The data was written to the local storage");
		assert.ok(this.fnPutStub.calledWith("MY_KEY"), "The custom storage key was used");
	});
});
