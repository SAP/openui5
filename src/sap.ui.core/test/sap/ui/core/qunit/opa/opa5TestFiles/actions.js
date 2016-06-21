sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/Opa",
	"sap/m/Button"
], function (Opa5, Opa, Button) {
	QUnit.module("Opa actions", {
		setup: function () {
			this.oButton = new Button("foo");
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			sinon.config.useFakeTimers = true;
		},
		teardown: function () {
			this.oButton.destroy();
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Should execute an action", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnActionSpy = this.spy(),
			start = assert.async();

		// Act
		oOpa5.waitFor({
			id: "foo",
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.calledOnce(fnActionSpy);
			start();
		});

		// empty the queue
		this.clock.tick(100);
	});

	QUnit.test("Should not execute an action on a busy button", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnActionSpy = this.spy(),
			start = assert.async();

		this.oButton.setBusy(true);

		// Act
		oOpa5.waitFor({
			id: "foo",
			// immediately time out
			timeout: -1,
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().fail(function () {
			// Assert
			sinon.assert.notCalled(fnActionSpy);
			start();
		});

		// empty the queue
		this.clock.tick(100);
	});

	QUnit.test("Should execute success on a busy button", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnSuccessSpy = this.spy(),
			start = assert.async();

		this.oButton.setBusy(true);

		// Act
		oOpa5.waitFor({
			id: "foo",
			// immediately time out
			timeout: -1,
			success: fnSuccessSpy
		});

		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.calledOnce(fnSuccessSpy);
			start();
		});

		// empty the queue
		this.clock.tick(100);
	});

	QUnit.test("Should execute success after an action", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnCheckStub = this.stub().returns(true),
			fnActionSpy = this.spy(),
			fnSuccessSpy = this.spy(),
			start = assert.async();

		// Act
		oOpa5.waitFor({
			id: "foo",
			check: fnCheckStub,
			actions: fnActionSpy,
			success: fnSuccessSpy
		});

		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.callOrder(fnCheckStub, fnActionSpy, fnSuccessSpy);
			start();
		});

		// empty the queue
		this.clock.tick(100);
	});

	QUnit.test("Should not execute an action before the check returns true", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			bCheckReturnValue = false,
			fnActionSpy = this.spy(),
			start = assert.async();

		// Act
		oOpa5.waitFor({
			id: "foo",
			check: function () {
				return bCheckReturnValue;
			},
			actions: fnActionSpy,
			pollingInterval: 0
		});


		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.calledOnce(fnActionSpy);
			start();
		});


		setTimeout(function () {
			bCheckReturnValue = true;
		}, 0);

		// set the check to true
		// and empty the queue
		this.clock.tick(100);
	});

	QUnit.test("Should catch exceptions in actions", function (assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnActionSpy = this.stub().throws(),
			queueEmptied = assert.async(),
			start = assert.async();

		// Act
		oOpa5.waitFor({
			id: "foo",
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().fail(function () {
			// Assert
			sinon.assert.calledOnce(fnActionSpy);
			queueEmptied();
		});

		// empty the queue
		assert.throws(function () {
			// triggers the exception
			this.clock.tick(100);
		}.bind(this));
		start();
	});

});