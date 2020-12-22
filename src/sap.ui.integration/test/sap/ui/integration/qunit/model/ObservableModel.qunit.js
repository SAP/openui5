/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/model/ObservableModel"
],
function (
	ObservableModel
) {
	"use strict";

	QUnit.module("Creating instance");

	QUnit.test("Create an instance of the model and destroy it", function (assert) {
		// act
		var oModel = new ObservableModel();

		// assert
		assert.ok(oModel, "The model is created.");

		// cleanup
		oModel.destroy();
	});

	QUnit.module("Change event", {
		beforeEach: function () {
			this._fnChangeStub = sinon.stub();
			this._oModel = new ObservableModel();

			this._oModel.attachEvent("change", this._fnChangeStub);
		},
		afterEach:  function () {
			this._oModel.destroy();
			this._fnChangeStub.reset();
		}
	});

	QUnit.test("Change event is fired when data is changed", function (assert) {
		// act
		this._oModel.setData({"test": "test"});
		this.clock.tick(100);

		// assert
		assert.strictEqual(this._fnChangeStub.callCount, 1, "Change event is fired once.");
	});

	QUnit.test("Change is not fired if data was not changed", function (assert) {
		// arrange
		this._oModel.setData({"test": "test"});
		this.clock.tick(100);
		this._fnChangeStub.reset();

		// act
		this._oModel.setProperty("/test", "test");
		this.clock.tick(100);

		// assert
		assert.ok(this._fnChangeStub.notCalled, "Change event is not fired when data is not changed.");
	});

	QUnit.test("Change is not fired multiple times if changes happen in the same tick", function (assert) {
		// act
		this._oModel.setData({"test": "test"});
		this._oModel.setData({"test": "new test"});
		this.clock.tick(100);

		// assert
		assert.strictEqual(this._fnChangeStub.callCount, 1, "Change event is fired once if changes happen in same tick.");
	});

	QUnit.test("Change is fired twice when there are 2 separate changes", function (assert) {
		// arrange
		this._oModel.setData({"test": "test"});
		this.clock.tick(100);
		this._fnChangeStub.reset();

		// act
		this._oModel.setData({"test": "new test"});
		this.clock.tick(100);

		// assert
		assert.ok(this._fnChangeStub.calledOnce, "Change event is fired when data is changed.");
	});

	QUnit.test("Change is fired when change is done with setProperty", function (assert) {
		// arrange
		this._oModel.setData({"test": "test"});
		this.clock.tick(100);
		this._fnChangeStub.reset();

		// act
		this._oModel.setProperty("/test", "new test");
		this.clock.tick(100);

		this._oModel.setProperty("/test", "more test");
		this.clock.tick(100);

		// assert
		assert.strictEqual(this._fnChangeStub.callCount, 2, "Change event is fired each time setProperty changes the data.");
	});

	QUnit.test("Change is fired when change is done in depth", function (assert) {
		// arrange
		this._oModel.setData({
			"level1": {
				"level2": {
					"level3": "test"
				}
			}
		});
		this.clock.tick(100);
		this._fnChangeStub.reset();

		// act
		this._oModel.setProperty("/level1/level2/level3", "new test");
		this.clock.tick(100);

		// assert
		assert.ok(this._fnChangeStub.calledOnce, "Change event is fired.");
	});
});