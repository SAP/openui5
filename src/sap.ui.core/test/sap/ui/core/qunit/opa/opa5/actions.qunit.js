/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/m/Button",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (Opa5, opaTest, _timeoutWaiter, Button, _autoWaiter, nextUIUpdate) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	QUnit.module("Opa actions", {
		beforeEach: function () {
			this.oButton = new Button("foo");
			this.oButton.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oButton.destroy();
		}
	});

	QUnit.test("Should execute an action", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnActionSpy = this.spy(),
			done = assert.async();

		// Act
		oOpa5.waitFor({
			id: "foo",
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.calledOnce(fnActionSpy);
			done();
		});
	});

	QUnit.test("Should not execute an action on a busy button", function(assert) {
		var oOpa5 = new Opa5(),
			fnActionSpy = this.spy(),
			done = assert.async();

		oOpa5.waitFor({
			id: "foo",
			success: function () {
				this.oButton.setBusy(true);
			}.bind(this)
		});

		oOpa5.waitFor({
			id: "foo",
			timeout: 1,
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().fail(function () {
			sinon.assert.notCalled(fnActionSpy);
			this.oButton.setBusy(false);
			done();
		}.bind(this));
	});

	QUnit.test("Should execute success after an action", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			fnCheckStub = this.stub().returns(true),
			fnActionSpy = this.spy(),
			fnSuccessSpy = this.spy(),
			done = assert.async();

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
			done();
		});
	});

	QUnit.test("Should not execute an action before the check returns true", function(assert) {
		// Arrange
		var oOpa5 = new Opa5(),
			bCheckReturnValue = false,
			fnActionSpy = this.spy(),
			done = assert.async();

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
			done();
		});


		setTimeout(function () {
			bCheckReturnValue = true;
		}, 0);
	});

	QUnit.module("Async actions", {
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			Opa5.extendConfig({
				pollingInterval: 20
			});
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oButton.destroy();
			Opa5.resetConfig();
			return nextUIUpdate();
		}
	});

	opaTest("Should execute success of a waitFor added by an action before the success of waitFor", function (oOpa, when) {
		var fnSuccessSpy = sinon.spy(),
			fnInnerSuccessSpy = sinon.spy(),
			fnActionSpy = sinon.spy(function () {
				when.waitFor({
					success: fnInnerSuccessSpy
				});
			});

		oOpa.waitFor({
			id: this.oButton.getId(),
			actions: fnActionSpy,
			success: fnSuccessSpy
		});

		oOpa.waitFor({
			success: function () {
				sinon.assert.calledOnce(fnActionSpy);
				sinon.assert.calledOnce(fnSuccessSpy);
				sinon.assert.calledOn(fnSuccessSpy, oOpa);
				sinon.assert.calledOnce(fnInnerSuccessSpy);
				sinon.assert.calledOn(fnInnerSuccessSpy, when);
				sinon.assert.callOrder(fnActionSpy, fnInnerSuccessSpy, fnSuccessSpy);
			}
		});
	});

	[true, false].forEach(function (bAutoWait) {
		QUnit.test("Should autowait again when a success gets delayed after an waitFor added by an action for autowait:" + bAutoWait, function (assert) {
			var oStub, fnDone = assert.async(), oOpa = new Opa5();
			oOpa.waitFor({
				actions: function () {
					oOpa.waitFor({
						success: function () {
							// always skip the waiting just see if it is called, since the last success would be blocked
							oStub = sinon.stub(_autoWaiter, "hasToWait").returns(false);
						}
					});
				},
				autoWait: bAutoWait,
				success: function () {
					if (bAutoWait) {
						sinon.assert.called(oStub);
					} else {
						sinon.assert.notCalled(oStub);
					}
				}
			});

			Opa5.emptyQueue().always(function () {
				oStub.restore();
				fnDone();
			});
		});
	});

	opaTest("Should execute all success functions if waitFors added by actions before the waitFors success", function (oOpa) {
		var fnSuccessSpy = sinon.spy(),
			fnAction1WaitFor1 = sinon.spy(),
			fnAction1WaitFor2 = sinon.spy(),
			fnAction2WaitFor1 = sinon.spy(),
			fnAction2WaitFor2 = sinon.spy(),
			fnActionSpy = sinon.spy(function () {
				oOpa.waitFor({
					success: fnAction1WaitFor1
				});
				oOpa.waitFor({
					success: fnAction1WaitFor2
				});
			}),
			fnSecondActionSpy = sinon.spy(function () {
				oOpa.waitFor({
					success: fnAction2WaitFor1
				});
				oOpa.waitFor({
					success: fnAction2WaitFor2
				});
			});

		oOpa.waitFor({
			id: this.oButton.getId(),
			actions: [fnActionSpy, fnSecondActionSpy],
			success: fnSuccessSpy
		});

		oOpa.waitFor({
			success: function () {
				sinon.assert.callOrder(fnActionSpy,
					// first execute both actions
					fnSecondActionSpy,
					// start with the waitFors added by the first action
					fnAction1WaitFor1,
					fnAction1WaitFor2,
					// wait fors of the second actions
					fnAction2WaitFor1,
					fnAction2WaitFor2,
					// finally call the success of the waitFor adding all those
					fnSuccessSpy
				);
				sinon.assert.calledOnce(fnSuccessSpy);
				sinon.assert.calledWith(fnSuccessSpy, this.oButton);
			}.bind(this)
		});
	});

	QUnit.module("Actions - exceptions in actions", {
		beforeEach: function () {
			Opa5.extendConfig({
				pollingInterval: 1
			});
		}
	});

	QUnit.test("Should not execute any subsequent successes as soon as an exception gets thrown in an inner actions", function (assert) {
		var oOpa = new Opa5(),
			// make sure no waitFors are in the queue
			fnSuccessSpy = sinon.spy(),
			fnDone = assert.async();

		oOpa.waitFor({
			actions: function () {
				oOpa.waitFor({
					actions: function () {
						throw new Error("something wrong");
					},
					success: fnSuccessSpy
				});
			},
			success: fnSuccessSpy
		});

		oOpa.emptyQueue().fail(function () {
			sinon.assert.notCalled(fnSuccessSpy);
			fnDone();
		});
	});

	QUnit.module("Async actions 2 controls", {
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			this.oButton2 = new Button();
			this.oButton2.placeAt("qunit-fixture");
			Opa5.extendConfig({
				pollingInterval: 20
			});
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton2.destroy();
			Opa5.resetConfig();
			return nextUIUpdate();
		}
	});

	opaTest("Should execute all success functions if waitFors added by actions before the waitFors success", function (oOpa) {
		var oButton = this.oButton,
			oButton2 = this.oButton2,
			fnSuccessSpy = sinon.spy(),
			fnAction1 = sinon.spy(),
			fnAction2 = sinon.spy(),
			fnActionSpy = sinon.spy(function (oButton) {
				oOpa.waitFor({
					id: oButton.getId(),
					success: fnAction1
				});
			}),
			fnSecondActionSpy = sinon.spy(function (oButton) {
				oOpa.waitFor({
					id: oButton.getId(),
					success: fnAction2
				});
			});

		oOpa.waitFor({
			id: [oButton.getId(), oButton2.getId()],
			actions: [fnActionSpy, fnSecondActionSpy],
			success: fnSuccessSpy
		});

		oOpa.waitFor({
			success: function () {
				sinon.assert.callOrder(fnActionSpy,
					// first execute both actions
					fnSecondActionSpy,
					// start with the waitFors added by the first action
					fnAction1,
					fnAction1,
					// wait fors of the second actions
					fnAction2,
					fnAction2,
					// finally call the success of the waitFor adding all those
					fnSuccessSpy
				);
				// check if they where called for the different Buttons
				sinon.assert.calledTwice(fnAction1);
				sinon.assert.calledWith(fnAction1, oButton);
				sinon.assert.calledWith(fnAction1, oButton2);
				sinon.assert.calledTwice(fnAction2);
				sinon.assert.calledWith(fnAction2, oButton);
				sinon.assert.calledWith(fnAction2, oButton2);
				sinon.assert.calledOnce(fnSuccessSpy);
				sinon.assert.calledWithMatch(fnSuccessSpy, function (aButtons) {
					return aButtons.indexOf(oButton) !== -1 &&
						aButtons.indexOf(oButton2) !== -1 &&
						aButtons.length === 2;
				});
			}
		});
	});

	opaTest("Should be able to double nest actions", function (oOpa) {
		var oButton1 = this.oButton,
			oButton2 = this.oButton2,
			fnInnerAction = sinon.spy(),
			fnInnerSuccess = sinon.spy(),
			fnNestedSuccess = sinon.spy(),
			fnNestedAction = sinon.spy(function () {
				oOpa.waitFor({
					id: oButton1.getId(),
					actions: fnInnerAction,
					success: fnInnerSuccess
				});
			}),
			fnAction = sinon.spy(function () {
				oOpa.waitFor({
					id: oButton2.getId(),
					actions: fnNestedAction,
					success: fnNestedSuccess
				});
			});

		oOpa.waitFor({
			id: oButton1.getId(),
			actions: fnAction,
			success: function () {
				sinon.assert.calledWith(fnInnerAction, oButton1);
				sinon.assert.calledWith(fnNestedAction, oButton2);
				sinon.assert.calledWith(fnAction, oButton1);

				sinon.assert.callOrder(
					// first all the actions
					fnAction,
					fnNestedAction,
					fnInnerAction,
					// then the successes from inner to outer
					fnInnerSuccess,
					fnNestedSuccess);
			}
		});
	});

	opaTest("Should be able to add 2 waitFors in an action", function (oOpa) {
		var oButton1 = this.oButton,
			oButton2 = this.oButton2,
			fnAddedAction1 = sinon.spy(),
			fnAddedAction2 = sinon.spy();

		oOpa.waitFor({
			id: oButton1.getId(),
			actions: function () {
				oOpa.waitFor({
					id: oButton1.getId(),
					actions: fnAddedAction1
				});

				oOpa.waitFor({
					id: oButton2.getId(),
					actions: fnAddedAction2
				});
			},
			success: function () {
				sinon.assert.calledWith(fnAddedAction1, oButton1);
				sinon.assert.calledWith(fnAddedAction2, oButton2);

				sinon.assert.callOrder(fnAddedAction1, fnAddedAction2);
			}
		});
	});

});
