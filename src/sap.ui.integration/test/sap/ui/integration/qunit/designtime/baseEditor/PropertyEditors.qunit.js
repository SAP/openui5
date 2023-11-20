/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/designtime/baseEditor/PropertyEditors",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/base/util/deepClone",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function (
	BaseEditor,
	PropertyEditors,
	PropertyEditorFactory,
	StringEditor,
	deepClone,
	sinon,
	oCore
) {
	"use strict";

	var mConfig = {
		"properties": {
			"foo1": {
				"tags": ["foo"],
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			},
			"foo2": {
				"tags": ["foo"],
				"label": "Foo2 property",
				"path": "/foo2",
				"type": "string"
			},
			"bar1": {
				"tags": ["bar"],
				"label": "Bar1 property",
				"path": "/bar1",
				"type": "string"
			},
			"bar2": {
				"tags": ["bar"],
				"label": "Bar2 property",
				"path": "/bar2",
				"type": "string"
			}
		},
		"propertyEditors": {
			"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
			"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
		}
	};

	var mJson = {
		foo1: "foo1 value",
		foo2: "foo2 value",
		bar1: "bar1 value",
		bar2: "bar2 value",
		baz: "baz value"
	};

	var sandbox = sinon.sandbox.create();

	QUnit.module("Initialisation via constructor", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when tags parameter is set", function (assert) {
			var fnDone = assert.async();
			var oPropertyEditors = new PropertyEditors({
				tags: "foo"
			});

			this.oBaseEditor.addContent(oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");

			return oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.ok(
					oPropertyEditors.getDomRef() instanceof HTMLElement
					&& oPropertyEditors.getDomRef().offsetHeight > 0
					&& oPropertyEditors.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					oPropertyEditors._getPropertyEditors()
					&& oPropertyEditors._getPropertyEditors().every(function (oPropertyEditor) {
						return oPropertyEditor.isA("sap.ui.integration.designtime.baseEditor.PropertyEditor");
					}),
					"then internal property editors are created"
				);
				assert.strictEqual(oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");
				fnDone();
			});
		});

		QUnit.test("when config is set", function (assert) {
			var oPropertyEditors = new PropertyEditors({
				config: [{
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				}]
			});

			this.oBaseEditor.addContent(oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");

			return oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.ok(
					oPropertyEditors.getDomRef() instanceof HTMLElement
					&& oPropertyEditors.getDomRef().offsetHeight > 0
					&& oPropertyEditors.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					oPropertyEditors._getPropertyEditors()
					&& oPropertyEditors._getPropertyEditors()[0].isA("sap.ui.integration.designtime.baseEditor.PropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");
			});
		});

		QUnit.test("when both tags & config are set", function (assert) {
			var oPropertyEditors = new PropertyEditors({
				tags: "foo",
				config: [{
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				}]
			});

			this.oBaseEditor.addContent(oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");

			return oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.strictEqual(oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then priority is over config object");
			});
		});

		QUnit.test("when the layout is changed", function (assert) {
			var oPropertyEditors = new PropertyEditors({
				tags: "foo"
			});

			this.oBaseEditor.addContent(oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");

			return oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				var oOldContent = oPropertyEditors.getContent();
				oPropertyEditors.setLayout("form");
				assert.strictEqual(
					oOldContent.bIsDestroyed || oOldContent._bIsBeingDestroyed,
					true,
					"then the old layout is properly cleaned up"
				);
			});
		});
	});

	QUnit.module("Initialisation via setters", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());

			this.oPropertyEditors = new PropertyEditors();
			this.oBaseEditor.addContent(this.oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when tags parameter is set", function (assert) {
			this.oPropertyEditors.setTags("foo");

			return this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.ok(
					this.oPropertyEditors.getDomRef() instanceof HTMLElement
					&& this.oPropertyEditors.getDomRef().offsetHeight > 0
					&& this.oPropertyEditors.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					this.oPropertyEditors._getPropertyEditors()
					&& this.oPropertyEditors._getPropertyEditors().every(function (oPropertyEditor) {
						return oPropertyEditor.isA("sap.ui.integration.designtime.baseEditor.PropertyEditor");
					}),
					"then internal property editor is created"
				);
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");
			}.bind(this));
		});

		QUnit.test("when tags parameter is set, they have to be stored sorted", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("tagsChange", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("tags"), "bar,foo");
				fnDone();
			});

			this.oPropertyEditors.setTags("foo,bar");
		});

		QUnit.test("when tags parameter is set, then same tags in different order are set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("tagsChange", function () {
				var oSpy = sandbox.spy();
				this.oPropertyEditors.attachEventOnce("tagsChange", oSpy);
				this.oPropertyEditors.setTags("bar,foo,baz");
				setTimeout(function () {
					assert.strictEqual(oSpy.callCount, 0);
				});
				fnDone();
			}, this);

			this.oPropertyEditors.setTags("foo,bar,baz");
		});

		QUnit.test("when tags parameter is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				this.oPropertyEditors.attachEvent(
					"propertyEditorsChange",
					sandbox.stub()
						.onSecondCall().callsFake(function () {
							oCore.applyChanges();

							assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "bar1 value", "then internal property editor has a correct value");
							assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "bar2 value", "then internal property editor has a correct value");
							fnDone();
						}.bind(this))
				);

				this.oPropertyEditors.setTags("bar");
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when config is set", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			return this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.ok(
					this.oPropertyEditors.getDomRef() instanceof HTMLElement
					&& this.oPropertyEditors.getDomRef().offsetHeight > 0
					&& this.oPropertyEditors.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					this.oPropertyEditors._getPropertyEditors()
					&& this.oPropertyEditors._getPropertyEditors()[0].isA("sap.ui.integration.designtime.baseEditor.PropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");
			}.bind(this));
		});

		QUnit.test("when number of config items is changed", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			}]);

			return this.oPropertyEditors.ready().then(function () {
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");

				this.oPropertyEditors.setConfig([
					{
						"label": "Baz property",
						"path": "/baz",
						"type": "string"
					},
					{
						"label": "Foo1 property",
						"path": "/foo1",
						"type": "string"
					}
				]);

				return this.oPropertyEditors.ready().then(function () {
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");
				}.bind(this));

			}.bind(this));
		});

		QUnit.test("when config is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.setConfig([{
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			}]);

			this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");

				var oSpy = sandbox.spy();
				this.oPropertyEditors.attachEvent("propertyEditorsChange", oSpy);

				this.oPropertyEditors.setConfig([
					{
						"label": "Baz property",
						"path": "/baz",
						"type": "string"
					}
				]);

				setTimeout(function () {
					assert.ok(oSpy.notCalled);
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");
					fnDone();
				}.bind(this));
			}.bind(this));

		});

		QUnit.test("when config is set several times at once (test for async flow cancellation)", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Bar2 property",
				"path": "/bar2",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Bar1 property",
				"path": "/bar1",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			return this.oPropertyEditors.ready().then(function () {
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");
			}.bind(this));
		});

		QUnit.test("when the type of a config property is changed (check for wrapper re-creation)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachEvent("propertyEditorsChange", oSpy);

			this.oPropertyEditors.setConfig([{
				"label": "Foo1 property",
				"path": "/foo1",
				"type": "string"
			}]);

			this.oPropertyEditors.ready().then(function () {
				this.oPropertyEditors.setConfig([{
					"label": "Foo1 property",
					"path": "/foo1",
					"type": "number"
				}]);

				setTimeout(function () {
					assert.strictEqual(oSpy.callCount, 1, "Then no re-rendering is triggered");
					fnDone();
				}, 1000);
			}.bind(this));
		});

		QUnit.test("when tags parameter is set, then config is set", function (assert) {
			this.oPropertyEditors.setTags("foo");

			return this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				this.oPropertyEditors.setConfig([{
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				}]);

				return this.oPropertyEditors.ready().then(function () {
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then priority is over config object");
				}.bind(this));
			}.bind(this));

		});

		QUnit.test("when config is set, then tags parameter is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");

				var oSpy = sandbox.spy();
				this.oPropertyEditors.attachEventOnce("propertyEditorsChange", oSpy);

				setTimeout(function () {
					assert.ok(oSpy.notCalled);
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then priority is over config object");
					fnDone();
				}.bind(this), 1000);

				this.oPropertyEditors.setTags("foo");
			}.bind(this));

		});

		QUnit.test("when both config and tags are set, then tags parameter is unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setTags("foo");

			this.oPropertyEditors.ready().then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");

				var oSpy = sandbox.spy();
				this.oPropertyEditors.attachEventOnce("propertyEditorsChange", oSpy);

				setTimeout(function () {
					assert.ok(oSpy.notCalled);
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "the unset of propertyName doesn't trigger re-rendering");
					fnDone();
				}.bind(this), 1000);

				this.oPropertyEditors.setTags(null);
			}.bind(this));
		});

		QUnit.test("when both config and tags are set, then config is unset", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setTags("foo");

			return this.oPropertyEditors.ready().then(function () {
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "baz value", "then internal property editor has a correct value");

				this.oPropertyEditors.setConfig(null);

				return this.oPropertyEditors.ready().then(function () {
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then priority is over config object");
					assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then priority is over config object");
				}.bind(this));
			}.bind(this));

		});

		QUnit.test("when editor is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				var oBaseEditor2 = new BaseEditor({
					config: {
						"properties": {
							"foo1": {
								"tags": ["foo"],
								"label": "Foo1_2 property",
								"path": "/foo1_2",
								"type": "string"
							},
							"foo2": {
								"tags": ["foo"],
								"label": "Foo2_2 property",
								"path": "/foo2_2",
								"type": "string"
							}
						},
						"propertyEditors": {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					},
					json: {
						foo1_2: "foo1_2 value",
						foo2_2: "foo2_2 value"
					}
				});

				oBaseEditor2.attachEventOnce("propertyEditorsReady", function () {
					this.oPropertyEditors.attachEvent(
						"propertyEditorsChange",
						sandbox.stub()
							.onSecondCall().callsFake(function () {
								oCore.applyChanges();
								assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1_2 value", "then internal editor re-rendered and received correct value from new editor");
								assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2_2 value", "then internal editor re-rendered and received correct value from new editor");

								// Async destroy is needed to avoid error message in ManagedObject while destroying
								// the instance in a sequence of "propagationListener" calls. "propertyEditorsChange" event
								// is called in the middle of "addContent" operation, see ManagedObject@L2642-2672.
								setTimeout(function () {
									oBaseEditor2.destroy();
									fnDone();
								});
							}.bind(this))
					);

					oBaseEditor2.addContent(this.oPropertyEditors);
				}, this);
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when editor is set several times at once (test for async flow cancellation)", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				var oBaseEditor2 = new BaseEditor({
					config: {
						"properties": {
							"foo1": {
								"tags": ["foo"],
								"label": "Foo1_2 property",
								"path": "/foo1_2",
								"type": "string"
							},
							"foo2": {
								"tags": ["foo"],
								"label": "Foo2_2 property",
								"path": "/foo2_2",
								"type": "string"
							}
						},
						"propertyEditors": {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					},
					json: {
						foo1_2: "foo1_2 value",
						foo2_2: "foo2_2 value"
					}
				});

				oBaseEditor2.attachEventOnce("propertyEditorsReady", function () {
					this.oPropertyEditors.attachEvent(
						"propertyEditorsChange",
						sandbox.stub()
							.onSecondCall().callsFake(function () {
								oCore.applyChanges();
								assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1_2 value", "then internal editor re-rendered and received corrent value from new editor");
								assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2_2 value", "then internal editor re-rendered and received corrent value from new editor");

								// Async destroy is needed to avoid error message in ManagedObject while destroying
								// the instance in a sequence of "propagationListener" calls. "propertyEditorsChange" event
								// is called in the middle of "addContent" operation, see ManagedObject@L2642-2672.
								setTimeout(function () {
									oBaseEditor2.destroy();
									fnDone();
								});
							}.bind(this))
					);

					oBaseEditor2.addContent(this.oPropertyEditors);
					this.oBaseEditor.addContent(this.oPropertyEditors);
					oBaseEditor2.addContent(this.oPropertyEditors);
					this.oBaseEditor.addContent(this.oPropertyEditors);
					oBaseEditor2.addContent(this.oPropertyEditors);
				}, this);
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when same tags parameter is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachTagsChange(oSpy);
			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.setTags("foo");

			assert.strictEqual(oSpy.callCount, 1);
		});

		QUnit.test("when same tags parameter is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachEvent("propertyEditorsChange", oSpy);

			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.setTags("foo");

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 1000);
		});

		QUnit.test("when same config is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachConfigChange(oSpy);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			// Avoid destroy before the editor is ready
			return this.oPropertyEditors.ready().then(function () {
				assert.strictEqual(oSpy.callCount, 1);
			});
		});

		QUnit.test("when same config is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachEvent("propertyEditorsChange", oSpy);

			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 1000);
		});

		QUnit.test("when config is set and later unset", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			return this.oPropertyEditors.ready().then(function () {
				var aPropertyEditors = this.oPropertyEditors._getPropertyEditors();
				assert.strictEqual(aPropertyEditors[0].getValue(), "baz value", "then internal property editor has a correct value");

				this.oPropertyEditors.setConfig(null);

				return this.oPropertyEditors.ready().then(function () {
					assert.ok(!this.oPropertyEditors._getPropertyEditors(), "then internal editor is removed");
					assert.strictEqual(aPropertyEditors[0].bIsDestroyed, true, "then custom property editor is destroyed");
				}.bind(this));
			}.bind(this));

		});

		QUnit.test("when tags parameter is set and later unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				var aPropertyEditors = this.oPropertyEditors._getPropertyEditors();
				assert.strictEqual(aPropertyEditors[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(aPropertyEditors[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
					oCore.applyChanges();
					assert.ok(!this.oPropertyEditors._getPropertyEditors(), "then internal editor is removed");
					assert.ok(aPropertyEditors[0].bIsDestroyed, "then internal property editor is destroyed");
					assert.ok(aPropertyEditors[1].bIsDestroyed, "then internal property editor is destroyed");
					fnDone();
				}, this);

				this.oPropertyEditors.setTags(null);
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when editor is set and later unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				var aPropertyEditors = this.oPropertyEditors._getPropertyEditors();
				assert.strictEqual(aPropertyEditors[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(aPropertyEditors[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
					oCore.applyChanges();
					assert.ok(!this.oPropertyEditors._getPropertyEditors(), "then internal editor is removed");
					assert.ok(aPropertyEditors[0].bIsDestroyed, "then internal property editor is destroyed");
					assert.ok(aPropertyEditors[1].bIsDestroyed, "then internal property editor is destroyed");
					fnDone();
				}, this);

				this.oPropertyEditors.setEditor(null);
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when a nested editor has an error", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.setConfig([
				{
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				},
				{
					"label": "Foo1 property",
					"path": "/foo1",
					"type": "string"
				}
			]);

			this.oPropertyEditors.ready().then(function () {
				this.oPropertyEditors.attachValidationErrorChange(function(oEvent) {
					assert.ok(
						oEvent.getParameter("hasError"),
						"then the error event is fired"
					);
					fnDone();
				});
				this.oPropertyEditors._getPropertyEditors()[0].setValue("{foo");
				assert.ok(
					this.oPropertyEditors.hasError(),
					"then the error bubbles up"
				);
			}.bind(this));
		});
	});

	QUnit.module("PropertyEditor is not descendant of BaseEditor initially", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());
			this.oPropertyEditors = new PropertyEditors();
			this.oPropertyEditors.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oPropertyEditors.destroy();
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when tags parameter is set, but there is no BaseEditor", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();
			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", oSpy);

			setTimeout(function () {
				assert.ok(oSpy.notCalled);
				assert.ok(!this.oPropertyEditors._getPropertyEditors(), "then internal editor is not created");
				fnDone();
			}.bind(this), 1000);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when tags parameter is set, then later BaseEditor is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.setEditor(this.oBaseEditor);
		});

		QUnit.test("when tags parameter is set, then later BaseEditor is detected in hierarchy", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(this.oPropertyEditors._getPropertyEditors()[1].getValue(), "foo2 value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditors.setTags("foo");
			this.oBaseEditor.addContent(this.oPropertyEditors);
		});

		QUnit.test("when same editor is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditors.attachEditorChange(oSpy);
			this.oPropertyEditors.setEditor(this.oBaseEditor);
			this.oPropertyEditors.setEditor(this.oBaseEditor);
			this.oPropertyEditors.setEditor(this.oBaseEditor);

			assert.strictEqual(oSpy.callCount, 1);
		});

		QUnit.test("when same editor is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditors.setTags("foo");
			this.oPropertyEditors.attachEvent("propertyEditorsChange", oSpy);

			this.oPropertyEditors.setEditor(this.oBaseEditor);
			this.oPropertyEditors.setEditor(this.oBaseEditor);
			this.oPropertyEditors.setEditor(this.oBaseEditor);

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 1000);
		});
	});

	QUnit.module("Destroy", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());

			this.oPropertyEditors = new PropertyEditors();
			this.oBaseEditor.addContent(this.oPropertyEditors);
			this.oBaseEditor.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when tags parameter is set and object is destroyed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditors.attachEventOnce("propertyEditorsChange", function () {
				oCore.applyChanges();
				var aPropertyEditors = this.oPropertyEditors._getPropertyEditors();

				assert.strictEqual(aPropertyEditors[0].getValue(), "foo1 value", "then internal property editor has a correct value");
				assert.strictEqual(aPropertyEditors[1].getValue(), "foo2 value", "then internal property editor has a correct value");

				this.oPropertyEditors.destroy();

				assert.ok(aPropertyEditors[0].bIsDestroyed, "then internal property editor is destroyed");
				assert.ok(aPropertyEditors[1].bIsDestroyed, "then internal property editor is destroyed");

				fnDone();
			}, this);

			this.oPropertyEditors.setTags("foo");
		});

		QUnit.test("when config is set and object is destroyed", function (assert) {
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			return this.oPropertyEditors.ready().then(function () {
				var aPropertyEditors = this.oPropertyEditors._getPropertyEditors();

				assert.strictEqual(aPropertyEditors[0].getValue(), "baz value", "then internal property editor has a correct value");

				this.oPropertyEditors.destroy();

				assert.strictEqual(aPropertyEditors[0].bIsDestroyed, true, "then custom property editor is destroyed");
			}.bind(this));
		});

		QUnit.test("When setConfig is called again before the nested editors were created", function (assert) {
			var fnDone = assert.async();

			var oCreationStub = sandbox.stub(PropertyEditorFactory, "create");
			var oDeletionStub = sandbox.stub(StringEditor.prototype, "destroy");

			// Fallback if creation of editor 1 is never triggered
			var iCreationTimeout = setTimeout(function() {
				assert.strictEqual(oCreationStub.callCount, 1, "Then only one editor was created");
				fnDone();
			}, 1000);

			var oEditorInCreation;
			oCreationStub.onFirstCall().callsFake(function (sType) {
				var bIsStringEditor = sType === "string";
				if (bIsStringEditor) {
					clearTimeout(iCreationTimeout);
				}
				return PropertyEditorFactory.create.wrappedMethod.apply(this, arguments).then(function (oEditor) {
					if (bIsStringEditor) {
						oEditorInCreation = oEditor;
					}
					return oEditor;
				});
			});
			oCreationStub.callThrough();
			oDeletionStub.callsFake(function () {
				StringEditor.prototype.destroy.wrappedMethod.apply(this, arguments);
				if (oEditorInCreation && this.sId === oEditorInCreation.sId) {
					assert.ok(true, "Then the created editor is cleaned up");
					fnDone();
				}
			});

			// Editor 1 - Should be cleaned up
			this.oPropertyEditors.setConfig([{
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			}]);

			// Editor 2
			this.oPropertyEditors.setConfig([{
				"label": "FooBar property",
				"path": "/foobar",
				"type": "number"
			}]);
		});

		QUnit.test("When PropertyEditors is destroyed before the nested editors were created", function (assert) {
			var fnDone = assert.async();

			var oCreationStub = sandbox.stub(PropertyEditorFactory, "create");
			var oDeletionStub = sandbox.stub(StringEditor.prototype, "destroy");

			// Fallback if creation of editor is never triggered
			var iCreationTimeout = setTimeout(function() {
				assert.strictEqual(oCreationStub.callCount, 0, "Then no editor was created");
				fnDone();
			}, 1000);

			var oEditorInCreation;
			oCreationStub.callsFake(function () {
				clearTimeout(iCreationTimeout);
				return PropertyEditorFactory.create.wrappedMethod.apply(this, arguments).then(function (oEditor) {
					oEditorInCreation = oEditor;
					return oEditor;
				});
			});
			oDeletionStub.callsFake(function () {
				StringEditor.prototype.destroy.wrappedMethod.apply(this, arguments);
				if (oEditorInCreation && this.sId === oEditorInCreation.sId) {
					assert.ok(true, "Then the created editor is cleaned up");
					fnDone();
				}
			});

			this.oPropertyEditors.setConfig([{
				label: "Baz property",
				path: "baz",
				type: "string"
			}]);
			this.oBaseEditor.destroy();
		});
	});

	QUnit.module("Ready handling", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			if (this.oPropertyEditors) {
				this.oPropertyEditors.destroy();
			}
		}
	}, function () {
		QUnit.test("When a PropertyEditors wrapper is created", function (assert) {
			var fnDone = assert.async();

			var fnRegisterWrapper = function (oEvent) {
				assert.strictEqual(
					oEvent.getSource(),
					this.oPropertyEditors,
					"Then the wrapper registers via the provided callback"
				);
				fnDone();
			};

			this.oPropertyEditors = new PropertyEditors({
				init: fnRegisterWrapper.bind(this)
			});
			this.oBaseEditor.addContent(this.oPropertyEditors);
			oCore.applyChanges();
		});

		QUnit.test("When a PropertyEditors wrapper has no nested editors", function (assert) {
			this.oPropertyEditors = new PropertyEditors({
				config: []
			});
			this.oBaseEditor.addContent(this.oPropertyEditors);
			oCore.applyChanges();

			return this.oPropertyEditors.ready().then(function () {
				assert.strictEqual(
					this.oPropertyEditors.isReady(),
					true,
					"The wrapper ready check is successful"
				);
			}.bind(this));
		});

		QUnit.test("When a PropertyEditors wrapper has nested editors", function (assert) {
			this.oPropertyEditors = new PropertyEditors({
				config: [
					{
						label: "foo",
						path: "/foo",
						type: "string",
						value: "bar"
					}
				]
			});

			return this.oBaseEditor.ready().then(function() {
				this.oBaseEditor.addContent(this.oPropertyEditors);
				oCore.applyChanges();

				return this.oPropertyEditors.ready();
			}.bind(this)).then(function () {
				assert.strictEqual(
					this.oPropertyEditors._getPropertyEditors()[0].isReady(),
					true,
					"Then it is ready when its nested editors are"
				);
			}.bind(this));
		});
	});

	QUnit.module("Form layout", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				config: {
					"layout": {
						"form": {
							"groups": [
								{
									"label": "Foo 1 group",
									"items": [
										{
											type: "propertyName",
											value: "foo1"
										}
									]
								},
								{
									"label": "All foos group",
									"items": [
										{
											type: "tag",
											value: "foo"
										}
									]
								}
							]
						}
					},
					"properties": {
						"foo1": {
							"tags": [],
							"label": "Foo1 property",
							"path": "/foo1",
							"type": "string"
						},
						"foo2": {
							"tags": ["foo"],
							"label": "Foo2 property",
							"path": "/foo2",
							"type": "string",
							"visible": false
						},
						"foo3": {
							"tags": ["foo"],
							"label": "Foo3 property",
							"path": "/foo3",
							"type": "string",
							"visible": false
						}
					},
					"propertyEditors": {
						"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					}
				},
				json: mJson,
				layout: 'form'
			});
			this.oBaseEditor.placeAt("qunit-fixture");
			return this.oBaseEditor.getPropertyEditorsByTag("foo").then(function (aPropertyEditors) {
				oCore.applyChanges();
				this.oFoo1LayoutGroup = this.oBaseEditor.getContent()[0].getContent().getFormContainers()[0];
				this.oFooTagLayoutGroup = this.oBaseEditor.getContent()[0].getContent().getFormContainers()[1];
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a group contains at least one visible element", function (assert) {
			assert.ok(
				this.oFoo1LayoutGroup.getVisible(),
				"Then the group is visible"
			);
		});

		QUnit.test("When a group contains only invisible elements", function (assert) {
			assert.notOk(
				this.oFooTagLayoutGroup.getVisible(),
				"Then the group is not visible"
			);
		});

		QUnit.test("When an element of an invsible group becomes visible", function (assert) {
			var oRootWrapper = this.oBaseEditor.getContent()[0];
			var oConfig = deepClone(oRootWrapper.getConfig());
			oConfig[1].visible = true;
			oRootWrapper.setConfig(oConfig);

			return oRootWrapper.ready().then(function () {
				assert.ok(
					this.oFooTagLayoutGroup.getVisible(),
					"Then the group becomes visible"
				);
			}.bind(this));
		});

		QUnit.test("When all elements of a visible group become invisible", function (assert) {
			var oRootWrapper = this.oBaseEditor.getContent()[0];
			var oConfig = deepClone(oRootWrapper.getConfig());
			oConfig[0].visible = false;
			oRootWrapper.setConfig(oConfig);

			return oRootWrapper.ready().then(function () {
				assert.notOk(
					this.oFoo1LayoutGroup.getVisible(),
					"Then the group becomes invisible"
				);
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
