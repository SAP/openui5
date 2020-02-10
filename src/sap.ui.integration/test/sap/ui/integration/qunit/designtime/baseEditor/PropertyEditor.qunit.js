/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/designtime/baseEditor/PropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/ui/thirdparty/sinon-4"
],
function (
	BaseEditor,
	PropertyEditor,
	PropertyEditorFactory,
	StringEditor,
	sinon
) {
	"use strict";

	var mConfig = {
		"context": "/",
		"properties": {
			"foo": {
				"label": "Foo property",
				"path": "foo",
				"type": "string"
			},
			"bar": {
				"label": "Bar property",
				"path": "bar",
				"type": "string"
			}
		},
		"propertyEditors": {
			"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
		}
	};

	var mJson = {
		foo: "foo value",
		bar: "bar value",
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
		QUnit.test("when propertyName is set", function (assert) {
			var fnDone = assert.async();
			var oPropertyEditor = new PropertyEditor({
				propertyName: "foo"
			});

			oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.ok(
					oPropertyEditor.getDomRef() instanceof HTMLElement
					&& oPropertyEditor.getDomRef().offsetHeight > 0
					&& oPropertyEditor.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					oPropertyEditor.getAggregation("propertyEditor")
					&& oPropertyEditor.getAggregation("propertyEditor").isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");
				fnDone();
			});

			this.oBaseEditor.addContent(oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
		});

		QUnit.test("when config is set", function (assert) {
			var fnDone = assert.async();
			var oPropertyEditor = new PropertyEditor({
				config: {
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				}
			});

			oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.ok(
					oPropertyEditor.getDomRef() instanceof HTMLElement
					&& oPropertyEditor.getDomRef().offsetHeight > 0
					&& oPropertyEditor.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					oPropertyEditor.getAggregation("propertyEditor")
					&& oPropertyEditor.getAggregation("propertyEditor").isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");
				fnDone();
			});

			this.oBaseEditor.addContent(oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
		});

		QUnit.test("when both propertyName & config are set", function (assert) {
			var fnDone = assert.async();
			var oPropertyEditor = new PropertyEditor({
				propertyName: "foo",
				config: {
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				}
			});

			oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then priority is over config object");
				fnDone();
			});

			this.oBaseEditor.addContent(oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
		});
	});

	QUnit.module("Initialisation via setters", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());

			this.oPropertyEditor = new PropertyEditor();
			this.oBaseEditor.addContent(this.oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when propertyName is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.ok(
					this.oPropertyEditor.getDomRef() instanceof HTMLElement
					&& this.oPropertyEditor.getDomRef().offsetHeight > 0
					&& this.oPropertyEditor.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					this.oPropertyEditor.getAggregation("propertyEditor")
					&& this.oPropertyEditor.getAggregation("propertyEditor").isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when propertyName is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEvent(
					"propertyEditorChange",
					sandbox.stub()
						.onSecondCall().callsFake(function () {
							sap.ui.getCore().applyChanges();
							assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "bar value", "then internal property editor has a correct value");
							fnDone();
						}.bind(this))
				);

				this.oPropertyEditor.setPropertyName("bar");
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when propertyName is set several times at once (test for async flow cancellation)", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "bar value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("bar");
			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("bar");
		});

		QUnit.test("when config is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.ok(
					this.oPropertyEditor.getDomRef() instanceof HTMLElement
					&& this.oPropertyEditor.getDomRef().offsetHeight > 0
					&& this.oPropertyEditor.getDomRef().offsetWidth > 0,
					"then something is rendered"
				);
				assert.ok(
					this.oPropertyEditor.getAggregation("propertyEditor")
					&& this.oPropertyEditor.getAggregation("propertyEditor").isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"),
					"then internal property editor is created"
				);
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Foo property",
				"path": "/foo",
				"type": "string"
			});
		});

		QUnit.test("when config is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEvent(
					"propertyEditorChange",
					sandbox.stub()
						.onSecondCall().callsFake(function () {
							sap.ui.getCore().applyChanges();
							assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");
							fnDone();
						}.bind(this))
				);

				this.oPropertyEditor.setConfig({
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				});
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Foo property",
				"path": "/foo",
				"type": "string"
			});
		});

		QUnit.test("when config is set several times at once (test for async flow cancellation)", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Foo property",
				"path": "/foo",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Bar property",
				"path": "/bar",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Foo property",
				"path": "/foo",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Bar property",
				"path": "/bar",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
		});

		QUnit.test("when propertyName is set, then config is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEvent(
					"propertyEditorChange",
					sandbox.stub()
						.onSecondCall().callsFake(function () {
							sap.ui.getCore().applyChanges();
							assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then priority is over config object");
							fnDone();
						}.bind(this))
				);

				this.oPropertyEditor.setConfig({
					"label": "Baz property",
					"path": "/baz",
					"type": "string"
				});
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when config is set, then propertyName is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");

				var oSpy = sandbox.spy();
				this.oPropertyEditor.attachEventOnce("propertyEditorChange", oSpy);

				setTimeout(function () {
					assert.ok(oSpy.notCalled);
					assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then priority is over config object");
					fnDone();
				}.bind(this), 16);

				this.oPropertyEditor.setPropertyName("foo");
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
		});

		QUnit.test("when both config and propertyName are set, then propertyName is unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");

				var oSpy = sandbox.spy();
				this.oPropertyEditor.attachEventOnce("propertyEditorChange", oSpy);

				setTimeout(function () {
					assert.ok(oSpy.notCalled);
					assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "the unset of propertyName doesn't trigger re-rendering");
					fnDone();
				}.bind(this), 16);

				this.oPropertyEditor.setPropertyName(null);
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when both config and propertyName are set, then config is unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "baz value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEvent(
					"propertyEditorChange",
					sandbox.stub()
						.onSecondCall().callsFake(function () {
							sap.ui.getCore().applyChanges();
							assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then priority is over config object");
							fnDone();
						}.bind(this))
				);

				this.oPropertyEditor.setConfig(null);
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when editor is changed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");

				var oBaseEditor2 = new BaseEditor({
					config: {
						"properties": {
							"foo": {
								"label": "Foo2 property",
								"path": "/foo2",
								"type": "string"
							}
						},
						"propertyEditors": {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					},
					json: {
						foo2: "foo2 value"
					}
				});

				oBaseEditor2.attachEventOnce("propertyEditorsReady", function () {
					this.oPropertyEditor.attachEvent(
						"propertyEditorChange",
						sandbox.stub()
							.onSecondCall().callsFake(function () {
								sap.ui.getCore().applyChanges();
								assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo2 value", "then internal editor re-rendered and received correct value from new editor");
								oBaseEditor2.destroy();
								fnDone();
							}.bind(this))
					);

					oBaseEditor2.addContent(this.oPropertyEditor);
				}, this);
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when editor is set several times at once (test for async flow cancellation)", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");

				var oBaseEditor2 = new BaseEditor({
					config: {
						"properties": {
							"foo": {
								"label": "Foo2 property",
								"path": "/foo2",
								"type": "string"
							}
						},
						"propertyEditors": {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					},
					json: {
						foo2: "foo2 value"
					}
				});

				oBaseEditor2.attachEventOnce("propertyEditorsReady", function () {
					this.oPropertyEditor.attachEvent(
						"propertyEditorChange",
						sandbox.stub()
							.onSecondCall().callsFake(function () {
								sap.ui.getCore().applyChanges();
								assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo2 value", "then internal editor re-rendered and received correct value from new editor");
								oBaseEditor2.destroy();
								fnDone();
							}.bind(this))
					);

					oBaseEditor2.addContent(this.oPropertyEditor);
					this.oBaseEditor.addContent(this.oPropertyEditor);
					oBaseEditor2.addContent(this.oPropertyEditor);
					this.oBaseEditor.addContent(this.oPropertyEditor);
					oBaseEditor2.addContent(this.oPropertyEditor);
				}, this);
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when same propertyName is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditor.attachPropertyNameChange(oSpy);
			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("foo");

			assert.strictEqual(oSpy.callCount, 1);
		});

		QUnit.test("when same propertyName is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditor.attachEvent("propertyEditorChange", oSpy);

			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setPropertyName("foo");

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 16);
		});

		QUnit.test("when same config is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditor.attachConfigChange(oSpy);
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});

			assert.strictEqual(oSpy.callCount, 1);
		});

		QUnit.test("when same config is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditor.attachEvent("propertyEditorChange", oSpy);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 16);
		});

		QUnit.test("when config is set and later unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				var oInternalPropertyEditor = this.oPropertyEditor.getAggregation("propertyEditor");
				assert.strictEqual(oInternalPropertyEditor.getValue(), "baz value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
					sap.ui.getCore().applyChanges();
					assert.ok(!this.oPropertyEditor.getAggregation("propertyEditor"), "then internal editor is removed");
					assert.strictEqual(oInternalPropertyEditor.bIsDestroyed, true, "then custom property editor is destroyed");
					fnDone();
				}, this);

				this.oPropertyEditor.setConfig(null);
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
		});

		QUnit.test("when propertyName is set and later unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				var oInternalPropertyEditor = this.oPropertyEditor.getAggregation("propertyEditor");
				assert.strictEqual(oInternalPropertyEditor.getValue(), "foo value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
					sap.ui.getCore().applyChanges();
					assert.ok(!this.oPropertyEditor.getAggregation("propertyEditor"), "then internal editor is removed");
					assert.ok(oInternalPropertyEditor.bIsDestroyed, "then internal property editor is destroyed");
					fnDone();
				}, this);

				this.oPropertyEditor.setPropertyName(null);
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when editor is set and later unset", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				var oInternalPropertyEditor = this.oPropertyEditor.getAggregation("propertyEditor");
				assert.strictEqual(oInternalPropertyEditor.getValue(), "foo value", "then internal property editor has a correct value");

				this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
					sap.ui.getCore().applyChanges();
					assert.ok(!this.oPropertyEditor.getAggregation("propertyEditor"), "then internal editor is removed");
					assert.ok(oInternalPropertyEditor.bIsDestroyed, "then internal property editor is destroyed");
					fnDone();
				}, this);

				this.oPropertyEditor.setEditor(null);
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when setRenderLabel is called right after creation", function (assert) {
			var oPropertyEditor = new PropertyEditor({
				editor: this.oBaseEditor,
				propertyName: "foo"
			});

			this.oBaseEditor.placeAt("qunit-fixture");

			oPropertyEditor.setRenderLabel(false);

			return oPropertyEditor.ready().then(function () {
				assert.strictEqual(oPropertyEditor.getRenderLabel(), false, "then wrapper has a correct value");
				assert.strictEqual(oPropertyEditor.getAggregation("propertyEditor").getRenderLabel(), false, "then nested editor has a correct value");
			});
		});

		QUnit.test("when setRenderLabel is called with some delay", function (assert) {
			var oPropertyEditor = new PropertyEditor({
				editor: this.oBaseEditor,
				propertyName: "foo"
			});

			this.oBaseEditor.placeAt("qunit-fixture");

			return Promise.all([oPropertyEditor]).then(function (aPropertyEditors) {
				aPropertyEditors[0].setRenderLabel(false);

				return oPropertyEditor.ready().then(function () {
					assert.strictEqual(aPropertyEditors[0].getRenderLabel(), false, "then wrapper has a correct value");
					assert.strictEqual(aPropertyEditors[0].getAggregation("propertyEditor").getRenderLabel(), false, "then nested editor has a correct value");
				});
			});

		});
	});

	QUnit.module("PropertyEditor is not descendant of BaseEditor initially", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());
			this.oPropertyEditor = new PropertyEditor();
			this.oPropertyEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPropertyEditor.destroy();
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when propertyName is set, but there is no BaseEditor", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();
			this.oPropertyEditor.attachEventOnce("propertyEditorChange", oSpy);

			setTimeout(function () {
				assert.ok(oSpy.notCalled);
				assert.ok(!this.oPropertyEditor.getAggregation("propertyEditor"), "then internal editor is not created");
				fnDone();
			}.bind(this), 16);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when propertyName is set, then later BaseEditor is set", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.setEditor(this.oBaseEditor);
		});

		QUnit.test("when propertyName is set, then later BaseEditor is detected in hierarchy", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oPropertyEditor.getAggregation("propertyEditor").getValue(), "foo value", "then internal property editor has a correct value");
				fnDone();
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
			this.oBaseEditor.addContent(this.oPropertyEditor);
		});

		QUnit.test("when same editor is set several times (check for duplicate events for same value)", function (assert) {
			var oSpy = sandbox.spy();

			this.oPropertyEditor.attachEditorChange(oSpy);
			this.oPropertyEditor.setEditor(this.oBaseEditor);
			this.oPropertyEditor.setEditor(this.oBaseEditor);
			this.oPropertyEditor.setEditor(this.oBaseEditor);

			assert.strictEqual(oSpy.callCount, 1);
		});

		QUnit.test("when same editor is set several times (check for re-rendering)", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			this.oPropertyEditor.setPropertyName("foo");
			this.oPropertyEditor.attachEvent("propertyEditorChange", oSpy);

			this.oPropertyEditor.setEditor(this.oBaseEditor);
			this.oPropertyEditor.setEditor(this.oBaseEditor);
			this.oPropertyEditor.setEditor(this.oBaseEditor);

			setTimeout(function () {
				assert.strictEqual(oSpy.callCount, 1);
				fnDone();
			}, 16);
		});
	});

	QUnit.module("Ready handling", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());

			this.oPropertyEditor = new PropertyEditor();
			this.oBaseEditor.addContent(this.oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when there is no nested editor", function (assert) {
			assert.strictEqual(this.oPropertyEditor.isReady(), false);
		});

		QUnit.test("when the property name is set and nested editor is initialised", function (assert) {
			var fnDone = assert.async();
			this.oPropertyEditor.attachEventOnce("ready", function () {
				assert.strictEqual(
					this.oPropertyEditor.getAggregation("propertyEditor").isReady(),
					true,
					"Then the wrapper fires ready even if the original editor was already ready"
				);
				fnDone();
			}, this);
			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when the property name changes", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();
			var oFooEditor = this.oBaseEditor.getPropertyEditorsByNameSync("foo")[0];

			this.oPropertyEditor.attachReady(oSpy);

			this.oPropertyEditor.ready().then(function () {
				assert.strictEqual(oSpy.callCount, 1);

				this.oPropertyEditor.setPropertyName("bar");

				this.oPropertyEditor.ready().then(function () {
					assert.strictEqual(oSpy.callCount, 2);

					oFooEditor.fireReady();

					this.oPropertyEditor.ready().then(function () {
						assert.strictEqual(oSpy.callCount, 2);
						fnDone();
					});
				}.bind(this));
			}.bind(this));

			this.oPropertyEditor.setPropertyName("foo");
		});
	});

	QUnit.module("Destroy", {
		beforeEach: function (assert) {
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", assert.async());

			this.oPropertyEditor = new PropertyEditor();
			this.oBaseEditor.addContent(this.oPropertyEditor);
			this.oBaseEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when propertyName is set and object is destroyed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				var oInternalPropertyEditor = this.oPropertyEditor.getAggregation("propertyEditor");
				assert.strictEqual(oInternalPropertyEditor.getValue(), "foo value", "then internal property editor has a correct value");
				this.oPropertyEditor.destroy();
				assert.ok(oInternalPropertyEditor.bIsDestroyed, "then internal property editor is destroyed");
				fnDone();
			}, this);

			this.oPropertyEditor.setPropertyName("foo");
		});

		QUnit.test("when config is set and object is destroyed", function (assert) {
			var fnDone = assert.async();

			this.oPropertyEditor.attachEventOnce("propertyEditorChange", function () {
				sap.ui.getCore().applyChanges();
				var oInternalPropertyEditor = this.oPropertyEditor.getAggregation("propertyEditor");
				assert.strictEqual(oInternalPropertyEditor.getValue(), "baz value", "then internal property editor has a correct value");
				this.oPropertyEditor.destroy();
				assert.strictEqual(oInternalPropertyEditor.bIsDestroyed, true, "then custom property editor is destroyed");
				fnDone();
			}, this);

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
		});

		QUnit.test("When BaseEditor is destroyed during nested editor creation", function (assert) {
			var fnDone = assert.async();
			this.oBaseEditor.setConfig(Object.assign({}, mConfig, {properties: {}}));

			var oCreationStub = sandbox.stub(PropertyEditorFactory, "create");
			var oDeletionStub = sandbox.stub(StringEditor.prototype, "destroy");

			var oEditorInCreation;
			oCreationStub.callsFake(function () {
				return PropertyEditorFactory.create.wrappedMethod.apply(this, arguments).then(function (oEditor) {
					oEditorInCreation = oEditor;
					return oEditor;
				});
			});
			oDeletionStub.callsFake(function () {
				StringEditor.prototype.destroy.wrappedMethod.apply(this, arguments);
				assert.strictEqual(this.sId, oEditorInCreation.sId, "Then the created editor is cleaned up");
				fnDone();
			});

			this.oPropertyEditor.setConfig({
				"label": "Baz property",
				"path": "/baz",
				"type": "string"
			});
			this.oBaseEditor.destroy();
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
