/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/api/AnnotationChangeHandlerAPI",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/thirdparty/sinon-4"
], function(
	AnnotationChangeHandlerAPI,
	ChangeHandlerRegistration,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("AnnotationChangeHandlerAPI", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When 'registerAnnotationChangeHandler' is called", function(assert) {
			const mPropertyBag = {
				changeType: "someChangeType",
				changeHandler: "someChangeHandler"
			};

			const oChangeHandlerRegistrationStub = sandbox.stub(ChangeHandlerRegistration, "registerAnnotationChangeHandler");
			AnnotationChangeHandlerAPI.registerAnnotationChangeHandler(mPropertyBag);
			assert.ok(
				oChangeHandlerRegistrationStub.calledOnceWithExactly(mPropertyBag),
				"then 'registerAnnotationChangeHandler' is called with the correct parameters"
			);
		});

		QUnit.test("When 'registerAnnotationChangeHandler' is called without the required properties", function(assert) {
			assert.throws(
				function() {
					AnnotationChangeHandlerAPI.registerAnnotationChangeHandler({});
				},
				/properties are required for registration/,
				"then an error is thrown"
			);
		});

		QUnit.test("When 'registerAnnotationChangeHandler' is called with isDefaultChangeHandler set to true", function(assert) {
			assert.throws(
				function() {
					AnnotationChangeHandlerAPI.registerAnnotationChangeHandler({
						isDefaultChangeHandler: true, changeType: "someChangeType", changeHandler: {}
					});
				},
				/The API is not allowed to register default change handlers!/,
				"then an error is thrown"
			);
		});

		QUnit.test("When 'getAnnotationChangeHandler' is called", function(assert) {
			const mPropertyBag = {
				changeType: "someChangeType"
			};

			const oGetAnnotationChangeHandlerStub = sandbox.stub(ChangeHandlerRegistration, "getAnnotationChangeHandler");
			AnnotationChangeHandlerAPI.getAnnotationChangeHandler(mPropertyBag);
			assert.ok(
				oGetAnnotationChangeHandlerStub.calledOnceWithExactly(mPropertyBag),
				"then 'getAnnotationChangeHandler' is called with the correct parameters"
			);
		});

		QUnit.test("When 'getAnnotationChangeHandler' is called without the required properties", function(assert) {
			assert.throws(
				function() {
					AnnotationChangeHandlerAPI.getAnnotationChangeHandler({});
				},
				/property is required/,
				"then an error is thrown"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});