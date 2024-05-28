/*global sinon QUnit */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/m/Button",
	'sap/ui/core/Component',
	'sap/ui/core/UIComponent',
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/mvc/XMLProcessingMode",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/DesignTime"
], function(future, Log, Button, Component, UIComponent, XMLTemplateProcessor, XMLProcessingMode, XMLView, JSONModel, jQuery, DesignTime) {
	"use strict";

	QUnit.module("enrichTemplateIdsPromise", {
		beforeEach: function(assert) {
			return Promise.all([
				XMLView.create({
					id: "root",
					viewName: "testdata/view/XMLTemplateProcessorAsync_root"
				}),
				XMLView.create({
					id: "view",
					viewName: "testdata/view/XMLTemplateProcessorAsync"
				})
			]).then(function(aViews) {
				this.oRootView = aViews[0];
				this.oView = aViews[1];
				this.xView = this.oView._xContent;
			}.bind(this));
		},
		afterEach: function() {
			this.oRootView.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("create IDs", function(assert) {
		assert.expect(6);
		var done = assert.async();

		assert.ok(jQuery.isXMLDoc(this.xView), "valid xml document as input");
		XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function(xml) {
			assert.ok(jQuery.isXMLDoc(xml), "valid xml document returned");
			assert.strictEqual(xml, this.xView, "no copying");
			var node = jQuery(this.xView).find("#root--button")[0];
			assert.ok(node, "control was found by full id");
			assert.equal(node.nodeName, "Button", "button is a button");
			assert.equal(
					node.getAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id"),
					"true",
					"full id flag is set to true"
			);
			done();
		}.bind(this));
	});

	QUnit.test("create Controls", function(assert) {
		assert.expect(2);
		var done = assert.async();
		XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function() {
			assert.ok(!this.oRootView.byId("button"), "no control has been created yet");
			XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function() {
				assert.ok(this.oRootView.byId("button"), "button control is created");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("do not create stashed Controls", function(assert) {
		assert.expect(2);
		var done = assert.async();
		XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView,true).then(function() {
			assert.ok(!this.oRootView.byId("stashedButton"), "no stashed control has been created yet");
			XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function() {
				assert.ok(this.oRootView.byId("stashedButton"), "stashed button control is created");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("do not process ExtensionPoints", function(assert) {
		assert.expect(2);
		var done = assert.async();

		// Preferrably we should test with a spy on "ExtensionPoint", but due
		// to the AMD module handling it is not possible to place one
		var node = jQuery(this.xView).find("#extensionButton")[0];
		XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function() {
			assert.equal(node.getAttribute("id"), "extensionButton", "id was not enriched");
			XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function() {
				assert.ok(this.oRootView.byId("extensionButton"), "extension button is created");
				done();
			}.bind(this));
		}.bind(this));
	});



	QUnit.module("General");

	QUnit.test("on design mode create Controls and fragment with correct declarativeSourceInfo", function (assert) {
		assert.expect(7);

		// Arrange
		this.stub(DesignTime, "isDesignModeEnabled").returns(true);

		// Act
		return XMLView.create({
			viewName: "my.View"
		}).then(function(oView) {
			// Assert
			var oButton = oView.byId("button");
			assert.ok(oButton, "button control is created");
			assert.equal(oButton._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "Button");
			var xmlRootNode = oButton._sapui_declarativeSourceInfo.xmlRootNode;
			assert.equal(xmlRootNode.getAttribute("controllerName"), "my.View");
			var oLabel = oView.byId("namedName");
			assert.equal(oLabel._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "{named>name}");
			assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.fragmentName, "my.Fragment");
			assert.equal(oLabel._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);
			assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);

			// Cleanup
			oView.destroy();
		});
	});

	QUnit.test("on regular mode create Controls and fragment with no declarativeSourceInfo", function (assert) {
		assert.expect(3);

		// Arrange
		this.stub(DesignTime, "isDesignModeEnabled").returns(false);

		// Act
		return XMLView.create({
			viewName: "my.View"
		}).then(function(oView) {
			// Assert
			var oButton = oView.byId("button");
			assert.ok(oButton, "button control is created");
			assert.notOk(oButton.hasOwnProperty("_sapui_declarativeSourceInfo"));
			var oLabel = oView.byId("namedName");
			assert.notOk(oLabel.hasOwnProperty("_sapui_declarativeSourceInfo"));

			// Cleanup
			oView.destroy();
		});
	});



	QUnit.module("Metadata Contexts");

	QUnit.test("On regular controls with metadataContexts the XMLTemplateProcessorAsync._preprocessMetadataContexts is called", function (assert) {
		assert.expect(2);

		// Arrange
		this.stub(XMLTemplateProcessor, "_preprocessMetadataContexts").value(this.stub());

		// Act
		return XMLView.create({
			viewName: "my.View"
		}).then(function (oView) {

			// Assert
			var oButton = oView.byId("button");
			assert.ok(oButton instanceof Button, "Button found.");
			assert.ok(XMLTemplateProcessor._preprocessMetadataContexts.called, "XMLTemplateProcessorAsync._preprocessMetadataContexts is called");

			// Cleanup
			oView.destroy();
		});
	});

	QUnit.test("The named model map is built correctly", function (assert) {
		var sError;
		var mMap = XMLTemplateProcessor._calculatedModelMapping("{/path}", null, true);

		assert.ok(mMap,"The map is build for {/path}");
		assert.ok(mMap[undefined],"The map contains an entry keyed by the undefined model");
		assert.equal(mMap[undefined].length,1,"The keyed model is an array of length one");
		assert.equal(mMap[undefined][0].path,'/path',"The resulting path is '/path'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model>/path}", null, true);

		assert.ok(mMap,"The map is build for {model>/path}");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].length,1,"The keyed model is an array of length one");
		assert.equal(mMap["model"][0].path,'/path',"The resulting path is '/path'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, true);

		assert.ok(mMap,"The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} allowing multiple contexts");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].length,1,"The keyed 'model' model is an array of length one");
		assert.equal(mMap["model"][0].path,'/path',"The 'model' resulting path is '/path'");
		assert.equal(mMap[undefined].length,2,"The 'undefined' model entry is an array of length two");
		assert.equal(mMap[undefined][0].path,'/path',"The resulting path is '/path'");
		assert.equal(mMap[undefined][0].name,'context1',"The resulting context name is 'context1'");
		assert.equal(mMap[undefined][1].path,'/any',"The resulting path is '/any'");
		assert.equal(mMap[undefined][1].name,'context2',"The resulting context name is 'context2'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);

		assert.ok(mMap,"The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} not allowing multiple contexts");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].path,'/path',"The 'model' resulting path is '/path'");
		assert.ok(mMap[undefined],"The 'undefined' model entry is an object");
		assert.equal(mMap[undefined].path,'/any',"The resulting path is '/any', i.e. the first binding gets overrulled");
		assert.equal(mMap[undefined].name,'context2',"The resulting context name is 'context2', i.e. the first binding gets overrulled");

		try {
			XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Wrong delimiter in {model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
		sError = null;

		try {
			XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Missing , in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
		sError = null;

		try {
			XMLTemplateProcessor._calculatedModelMapping("huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Not starting with binding in huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} detected");
		sError = null;

		try {
			XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}uhuhuh", null, false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Not ending with binding in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}huhuhuh is detected");
	});


	/**
	 * @deprecated because the mode 'Sequential' will be the only mode that is supported in the next major release
	 */
	QUnit.module("Propagation of processingMode: 'Sequential'", {
		beforeEach: function() {
			this.loadTemplatePromiseSpy = sinon.spy(XMLTemplateProcessor, "loadTemplatePromise");
		},
		afterEach: function() {
			this.loadTemplatePromiseSpy.restore();
		}
	});

	QUnit.test("Async rootView & childView", function(assert) {
		var done = assert.async();

		sap.ui.define("test/XMLTemplateProcessor/Component", function() {
			return UIComponent.extend("test.XMLTemplateProcessor", {
				metadata: {
					rootView: {
						viewName: "testdata/view/XMLTemplateProcessorAsync_nested",
						type: "XML",
						async: true
					}
				}
			});
		});

		Component.create({
			name: "test.XMLTemplateProcessor",
			manifest: false
		}).then(function(oComponent) {
			var oRootView = oComponent.getRootControl();

			oRootView.loaded().then(function(oView) {
				assert.ok(oView, "View is loaded.");
				assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

				oView.getContent()[0].loaded().then(function(oView) {
					assert.ok(oView, "View is loaded.");
					assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
					done();
				});
			});
		});
	});

	QUnit.test("Async rootView & (auto) async childView", function(assert) {
		var done = assert.async();

		sap.ui.define("test/XMLTemplateProcessor2/Component", function() {
			return UIComponent.extend("test.XMLTemplateProcessor2", {
				metadata: {
					rootView: {
						viewName: "testdata/view/XMLTemplateProcessorAsync_nested_2",
						type: "XML",
						async: true
					}
				}
			});
		});

		Component.create({
			name: "test.XMLTemplateProcessor2",
			manifest: false
		}).then(function(oComponent) {
			var oRootView = oComponent.getRootControl();

			oRootView.loaded().then(function(oView) {
				assert.ok(oView, "View is loaded.");
				assert.ok(oView.oAsyncState, "View is an async view.");
				assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

				oView.getContent()[0].loaded().then(function(oChildView1) {
					assert.ok(oChildView1, "View is loaded.");
					assert.ok(oChildView1.oAsyncState, "View is an async view.");
					assert.equal(oChildView1._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oChildView1.getViewName());

					oChildView1.getContent()[0].loaded().then(function(oChildView2) {
						assert.ok(oChildView2, "View is loaded.");
						assert.ok(oChildView2.oAsyncState, "View is an async view.");
						assert.equal(oChildView2._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oChildView2.getViewName());
						done();
					});
				});
			});
		});
	});

	/**
	 * @deprecated As of version 1.110
	 *
	 * @TODO copy and remove sync Views/Fragments inside!
	 *       Use Views/Fragments from testdata/fragments/... not "fragments_legacyAPIs"
	 */
	QUnit.test("Async rootView & nested fragments", function(assert) {
		var done = assert.async();

		sap.ui.define("test/XMLTemplateProcessor3/Component", function() {
			return UIComponent.extend("test.XMLTemplateProcessor3", {
				metadata: {
					rootView: {
						viewName: "testdata/fragments_legacyAPIs/XMLViewWithXMLFragment",
						type: "XML",
						async: true
					}
				}
			});
		});

		Component.create({
			name: "test.XMLTemplateProcessor3",
			manifest: false
		}).then(function(oComponent) {
			var oRootView = oComponent.getRootControl();

			oRootView.loaded().then(function(oView) {
				assert.ok(oView, "View is loaded.");
				assert.ok(oView.oAsyncState, "View is an async view.");
				assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
				assert.equal(this.loadTemplatePromiseSpy.callCount, 3, "loadTemplatePromiseSpy should be called once");

				var oXMLView = oView.byId("xmlViewInsideFragment");
				assert.ok(oXMLView, "View is loaded.");
				assert.ok(oXMLView.oAsyncState, "View is an async view.");
				assert.equal(oXMLView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oXMLView.getViewName());

				assert.deepEqual(Component.getOwnerComponentFor(oXMLView), oComponent, "Should be the same owner component.");

				sap.ui.require(["sap/ui/core/Fragment"], function(Fragment) {
					Fragment.load({
						name: "testdata/fragments/XMLFragment",
						containingView: oView
					}).then(function (oFragment) {
						assert.deepEqual(Component.getOwnerComponentFor(oFragment), oComponent, "Should be the same owner component.");
						done();
					});
				});
			}.bind(this));
		}.bind(this));
	});

	/**
	 * @deprecated As of version 1.110
	 *
	 * @TODO copy and remove sync Views/Fragments inside!
	 *       Use Views/Fragments from testdata/fragments/... not "fragments_legacyAPIs"
	 */
	QUnit.test("Async XML rootView with HTML tags with nested XML view", function(assert) {
		var done = assert.async();

		sap.ui.define("test/XMLTemplateProcessor4/Component", function() {
			return UIComponent.extend("test.XMLTemplateProcessor4", {
				metadata: {
					rootView: {
						viewName: "testdata/fragments_legacyAPIs/XMLViewWithHTML",
						type: "XML",
						async: true
					}
				}
			});
		});

		Component.create({
			name: "test.XMLTemplateProcessor4",
			manifest: false
		}).then(function(oComponent) {
			var oRootView = oComponent.getRootControl();

			oRootView.loaded().then(function(oView) {
				assert.ok(oView, "View is loaded.");
				assert.ok(oView.oAsyncState, "View is an async view.");
				assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

				var xmlViewInHtml = oView.byId("xmlViewInHTML");
				xmlViewInHtml.loaded().then(function(oView) {
					assert.ok(oView, "View is loaded.");
					assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

					done();
				});
			});
		});
	});

	/**
	 * @deprecated As of version 1.110
	 *
	 * @TODO copy and remove sync Views/Fragments inside!
	 *       Use Views/Fragments from testdata/fragments/... not "fragments_legacyAPIs"
	 */
	QUnit.test("Async XML rootView with HTML fragment with nested XML view", function(assert) {
		var done = assert.async();

		sap.ui.define("test/XMLTemplateProcessor5/Component", function() {
			return UIComponent.extend("test.XMLTemplateProcessor4", {
				metadata: {
					rootView: {
						viewName: "testdata/fragments_legacyAPIs/XMLViewWithHTMLFragments",
						type: "XML",
						async: true
					}
				}
			});
		});

		Component.create({
			name: "test.XMLTemplateProcessor5",
			manifest: false
		}).then(function(oComponent) {
			var oRootView = oComponent.getRootControl();

			oRootView.loaded().then(function(oView) {
				assert.ok(oView, "View is loaded.");
				assert.ok(oView.oAsyncState, "View is an async view.");
				assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

				var xmlView = oView.byId("XVwithFrags");
				xmlView.loaded().then(function(oView) {
					assert.ok(oView, "View is loaded.");
					assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());

					done();
				});
			});
		});
	});

	QUnit.module("Databinding", {
		beforeEach: function() {
			/**
			 * @deprecated As of version 1.120
			 */
			this.syncLoadingSpy = sinon.spy(sap.ui, "requireSync");
			this.logErrorSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			/**
			 * @deprecated As of version 1.120
			 */
			this.syncLoadingSpy.restore();
			this.logErrorSpy.restore();
		}
	});

	/**
	 * @deprecated
	 */
	QUnit.test("[Simple Binding] Async loading of data types (future=false)", function(assert) {
		future.active = false;
		var oModel = new JSONModel({
			value: 1234,
			customDataValue: "#FF06B5",
			amount: 12.345,
			date: 1682600768240
		});

		var oView;

		return XMLView.create({
			viewName: "testdata/mvc/XMLViewWithTypesFailure",
			models: {"undefined": oModel}
		}).then(function (oFinishedView) {
			oView = oFinishedView;
			oFinishedView.placeAt("qunit-fixture");

			/**
			 * Sync call tests
			 * @deprecated As of version 1.120
			 */
			(() => {
				// check that no sync XHRs are sent
				assert.equal(this.syncLoadingSpy.callCount, 0, "No sync XHR sent.");
				assert.notOk(this.syncLoadingSpy.calledWith("sap/ui/model/type/Integer"), "No sync XHR sent for 'sap/ui/model/type/Integer'.");
				assert.notOk(this.syncLoadingSpy.calledWith("sap/ui/model/type/String"), "No sync XHR sent for 'sap/ui/model/type/String'.");
				assert.notOk(this.syncLoadingSpy.calledWith("sap/ui/model/type/Float"), "No sync XHR sent for 'sap/ui/model/type/Float'.");
				assert.notOk(this.syncLoadingSpy.calledWith("sap/ui/model/type/Date"), "No sync XHR sent for 'sap/ui/model/type/Date'.");
			})();

			// test binding values
			var oInput = oView.byId("inputField");
			assert.equal(oInput.getValue(), "1.234", "Input field has correct value '1.234'");

			var oInputInvalidType = oView.byId("inputField_invalidType");
			assert.equal(oInputInvalidType.getValue(), "1234", "Input field has correct unformatted(!) value '1234'.");

			// test error log for invalid/missing type
			assert.ok(this.logErrorSpy.calledWith(sinon.match(/Failed to resolve type 'sap.ui.non.existing.Type'. Maybe not loaded or a typo\?/)), "Error message for missing type is logged.");

			// test CustomData binding values
			var oPanel = oView.byId("panel");
			var oCustomData = oPanel.getCustomData().find(function(oCustomData) {
				return oCustomData.getKey() === "myColor";
			});
			assert.equal(oCustomData.getValue(), "#FF06B5", "CustomData is correctly bound: myColor value = #FF06B5.");

			var oLabel = oView.byId("label");
			assert.equal(oLabel.getText(), "12.3 EUR on 2023-04-27", "Composite binding is resolved correctly");
		}.bind(this)).finally(function(){
			if (oView) {
				oView.destroy();
			}
			future.active = undefined;
		});
	});

	QUnit.test("[Simple Binding] Async loading of data types (future=true)", async function(assert) {
		future.active = true;
		var oModel = new JSONModel({
			value: 1234,
			customDataValue: "#FF06B5",
			amount: 12.345,
			date: 1682600768240
		});

		var oView;

		await assert.rejects(XMLView.create({
			viewName: "testdata/mvc/XMLViewWithTypesFailure",
			models: {"undefined": oModel}
		})).then(() => {
			return XMLView.create({
				viewName: "testdata/mvc/XMLViewWithTypes",
				models: {"undefined": oModel}
			});
		}).then(function (oFinishedView) {
			oView = oFinishedView;
			oFinishedView.placeAt("qunit-fixture");



			// test binding values
			var oInput = oView.byId("inputField");
			assert.equal(oInput.getValue(), "1.234", "Input field has correct value '1.234'");

			var oInputInvalidType = oView.byId("inputField_invalidType");
			assert.equal(oInputInvalidType.getValue(), "1234", "Input field has correct unformatted(!) value '1234'.");

			// test CustomData binding values
			var oPanel = oView.byId("panel");
			var oCustomData = oPanel.getCustomData().find(function(oCustomData) {
				return oCustomData.getKey() === "myColor";
			});
			assert.equal(oCustomData.getValue(), "#FF06B5", "CustomData is correctly bound: myColor value = #FF06B5.");

			var oLabel = oView.byId("label");
			assert.equal(oLabel.getText(), "12.3 EUR on 2023-04-27", "Composite binding is resolved correctly");
		}).finally(function(){
			if (oView) {
				oView.destroy();
			}
			future.active = undefined;
		});
	});
});