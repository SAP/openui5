/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/InstanceManager",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(View, InstanceManager, Log, merge, JSONModel, HashChanger, nextUIUpdate) {
	"use strict";

	var TESTDATA_PREFIX = "testdata.xml-require";

	var createView = function (sViewName, additionalViewSettings) {
		var oSettings = {
			viewName: TESTDATA_PREFIX + sViewName,
			type: "XML"
		};

		if (additionalViewSettings) {
			merge(oSettings, additionalViewSettings);
		}

		return Promise.resolve().then(function() {
			return sap.ui.xmlview(oSettings).loaded();
		});
	};

	function createSpies(mSpies, oScope) {
		return Object.keys(mSpies).reduce(function(oSpyObject, sName) {
			oSpyObject[sName] = oScope.spy.apply(oScope, mSpies[sName]);
			return oSpyObject;
		}, {});
	}

	QUnit.module("core:require in XMLView");

	[{
		testDescription: "Parsing core:require in XMLView",
		viewName: ".view.XMLTemplateProcessorAsync_require",
		settings: {
			sync: {
				create: createView,
				spies: {
					getInstance: [HashChanger, "getInstance"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var AnnotationHelper = sap.ui.require("sap/ui/model/odata/AnnotationHelper");
			var MessageBox = sap.ui.require("sap/m/MessageBox");
			var BusyIndicator = sap.ui.require("sap/ui/core/BusyIndicator");
			var MessageToast = sap.ui.require("sap/m/MessageToast");
			var Helper = sap.ui.require("testdata/xml-require/helper/Formatter");

			assert.ok(AnnotationHelper, "Class is loaded");
			assert.ok(MessageToast, "Class is loaded");
			assert.ok(MessageBox, "Class is loaded");
			assert.ok(BusyIndicator, "Class is loaded");
			assert.ok(Helper, "Class is loaded");

			assert.equal(mSpies.getInstance.callCount, 1, "event handler on view instance is called");

			var oPage = oView.byId("page");
			var oBoxButton = oView.byId("boxButton");
			var oToastButton = oView.byId("toastButton");
			var oOuterButton = oView.byId("outerButton");
			var oHelperButton = oView.byId("helperButton");
			var oNewButton = oView.byId("newBoxButton");
			var oFunctionControl = oView.byId("functionControl");

			var oBoxShowSpy = this.spy(MessageBox, "show");
			var oToastShowSpy = this.spy(MessageToast, "show");
			var oBusyIndicatorShowSpy = this.spy(BusyIndicator, "show");
			var oHelperSpy = this.spy(Helper.groupA, "upperCase");

			assert.equal(oPage.data("data1"), "abc", "core:require module in custom data is resolved correctly");
			assert.equal(oPage.data("data2"), "foo", "core:require module in custom data is resolved correctly");

			assert.strictEqual(oFunctionControl.getHandler().toString(),
				Helper.groupA.lowerCase.bind(Helper.groupA).toString(), "The function property is resolved correctly");

			oBoxButton.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.ok(oBusyIndicatorShowSpy.notCalled, "show method from other require isn't called");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Boxed", "The method is called with correct argument");

			oToastButton.fireEvent("press");
			assert.ok(oToastShowSpy.calledOnce, "show method is called once");
			assert.equal(oToastShowSpy.getCall(0).args[0], "Show Toast", "The method is called with correct argument");

			oOuterButton.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method from other require isn't called");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called");
			assert.equal(oBusyIndicatorShowSpy.getCall(0).args[0], "100", "The method is called with correct argument");

			oHelperButton.fireEvent("press");
			assert.ok(oHelperSpy.calledOnce, "The helper function is called");

			oBoxShowSpy.resetHistory();
			oNewButton.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Boxed", "The method is called with correct argument");

			return new Promise(function(resolve, reject) {
				BusyIndicator.attachOpen(function() {
					InstanceManager.closeAllDialogs();
					InstanceManager.closeAllPopovers();
					BusyIndicator.hide();
					resolve();
				});
			});
		}
	}, {
		testDescription: "Parsing core:require in XMLView where required module is used in the bound 'content' aggregation",
		viewName: ".view.XMLTemplateProcessorAsync_require_bind_content",
		settings: {
			sync: {
				create: createView
			}
		},
		runAssertions: async function (oView, mSpies, assert, bAsync) {
			oView.placeAt("qunit-fixture");
			await nextUIUpdate();

			var aContent = oView.getContent();
			var aDependents = oView.getDependents();
			var oBindingTemplate = oView.byId("template");

			assert.equal(aContent.length, 0, "No content exists before model is available");
			assert.equal(aDependents.length, 1, "The dependent control is created");
			assert.ok(oBindingTemplate, "Binding template instance is created");
			assert.notOk(oBindingTemplate.getDomRef(), "Binding template isn't rendered");

			var oModel = new JSONModel({
				names: [{
					name: "name1"
				}, {
					name: "name2"
				}]
			});

			oView.setModel(oModel);
			await nextUIUpdate();

			aContent = oView.getContent();
			assert.equal(aContent.length, 2, "content under binding is created");
			assert.equal(aContent[0].getText(), "NAME1", "The bound value is formatted by the given formatter");
			assert.ok(aContent[0].hasListeners("press"), "The 'press' event handler is resolved correctly");

			assert.ok(aContent[0].getDomRef(), "The control created from binding template should be rendered");
			assert.ok(aContent[1].getDomRef(), "The control created from binding template should be rendered");

			assert.notOk(oView.getDomRef().hasAttribute("data-sap-ui-preserve"),
				"The rendering is done by using 'renderControl' with the content aggregation, " +
				"the view itself shouldn't have the preserve attribute set.");

			oModel.setData({
				names: [{
					name: "name1"
				}, {
					name: "name2"
				}, {
					name: "name3"
				}]
			});

			aContent = oView.getContent();
			assert.equal(aContent.length, 3, "content under binding is created");
			assert.equal(aContent[2].getText(), "NAME3", "The bound value is formatted by the given formatter");
			await nextUIUpdate();

			assert.ok(aContent[0].getDomRef(), "The control created from binding template should be rendered");
			assert.ok(aContent[1].getDomRef(), "The control created from binding template should be rendered");
			assert.ok(aContent[2].getDomRef(), "The control created from binding template should be rendered");

			assert.notOk(oView.getDomRef().hasAttribute("data-sap-ui-preserve"),
				"The rendering is done by using 'renderControl' with the content aggregation, " +
				"the view itself shouldn't have the preserve attribute set.");
		}
	}, {
		testDescription: "Error should be thrown when HTML nodes exist in the binding template of the bound 'content' aggregation",
		viewName: ".view.XMLTemplateProcessorAsync_require_bind_content_html",
		settings: {
			sync: {
				create: createView,
				additionalViewSettings: {
					id: "viewWithBoundContentHTML"
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			assert.notOk(true, "The promise should NOT resolve");
		},
		onRejection: function(assert, oError) {
			assert.equal(oError.message,
				"Error found in View (id: 'viewWithBoundContentHTML').\nXML node: '<html:div xmlns:html=\"http://www.w3.org/1999/xhtml\"></html:div>':\nNo XHTML or SVG node is allowed because the 'content' aggregation is bound.",
				"Error message is correct");
		}
	}, {
		testDescription: "Parsing core:require in fragment",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require",
		settings: {
			sync: {
				create: createView
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var MessageBox = sap.ui.require("sap/m/MessageBox");
			var MessageToast = sap.ui.require("sap/m/MessageToast");

			assert.ok(MessageBox, "Class is loaded");
			assert.ok(MessageToast, "Class is loaded");

			var oButton1 = oView.byId("button1");
			var oButton2 = oView.byId("button2");

			var oBoxShowSpy = this.spy(MessageBox, "show");
			var oToastShowSpy = this.spy(MessageToast, "show");

			assert.equal(oButton1.data("data1"), "abc", "core:require is resolved correctly in custom data");
			assert.equal(oButton1.data("data2"), "foo", "core:require is resolved correctly in custom data");

			oButton1.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.ok(oToastShowSpy.notCalled, "show method from other require isn't called");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Do you really want to close?", "The method is called with correct argument");

			oButton2.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is still called once");
			assert.ok(oToastShowSpy.calledOnce, "show method from MessageToast is called once");
			assert.equal(oToastShowSpy.getCall(0).args[0], "This is a toast", "The method is called with correct argument");

			InstanceManager.closeAllDialogs();
			InstanceManager.closeAllPopovers();
		}
	}, {
		testDescription: "Parsing core:require in fragment without fragment node",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require_control_root",
		settings: {
			sync: {
				create: createView
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var MessageBox = sap.ui.require("sap/m/MessageBox");
			var MessageToast = sap.ui.require("sap/m/MessageToast");

			assert.ok(MessageBox, "Class is loaded");
			assert.ok(MessageToast, "Class is loaded");

			var oButton1 = oView.byId("button1");
			var oButton2 = oView.byId("button2");

			var oBoxShowSpy = this.spy(MessageBox, "show");
			var oToastShowSpy = this.spy(MessageToast, "show");

			oButton1.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.ok(oToastShowSpy.notCalled, "show method from other require isn't called");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Do you really want to close?", "The method is called with correct argument");

			oButton2.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is still called once");
			assert.ok(oToastShowSpy.calledOnce, "show method from MessageToast is called once");
			assert.equal(oToastShowSpy.getCall(0).args[0], "This is a toast", "The method is called with correct argument");

			InstanceManager.closeAllDialogs();
			InstanceManager.closeAllPopovers();
		}
	}, {
		testDescription: "Parsing core:require in fragment with preprocessor enabled",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require_control_root",
		settings: {
			sync: {
				create: createView,
				additionalViewSettings: {
					preprocessors: {
						xml: {}
					}
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var MessageBox = sap.ui.require("sap/m/MessageBox");
			var MessageToast = sap.ui.require("sap/m/MessageToast");

			assert.ok(MessageBox, "Class is loaded");
			assert.ok(MessageToast, "Class is loaded");

			var oButton1 = oView.byId("button1");
			var oButton2 = oView.byId("button2");

			var oBoxShowSpy = this.spy(MessageBox, "show");
			var oToastShowSpy = this.spy(MessageToast, "show");

			oButton1.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.ok(oToastShowSpy.notCalled, "show method from other require isn't called");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Do you really want to close?", "The method is called with correct argument");

			oButton2.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is still called once");
			assert.ok(oToastShowSpy.calledOnce, "show method from MessageToast is called once");
			assert.equal(oToastShowSpy.getCall(0).args[0], "This is a toast", "The method is called with correct argument");

			InstanceManager.closeAllDialogs();
			InstanceManager.closeAllPopovers();
		}
	}, {
		testDescription: "Parsing core:require in XMLView with fragment with missing definition in require context",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_insufficient_require",
		settings: {
			sync: {
				create: createView,
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;
			assert.ok(oWarningSpy.calledWith(sinon.match(/Event handler name 'Toast.show\('This is a toast'\)' could not be resolved to an event handler function/)));
		}
	}, {
		testDescription: "Parsing core:require in XMLView with fragment with missing definition in require context with preprocessors enabled",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_insufficient_require",
		settings: {
			sync: {
				create: createView,
				additionalViewSettings: {
					preprocessors: {
						xml: {}
					}
				},
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;
			sinon.assert.neverCalledWith(oWarningSpy, "Variable: Toast isn't defined in the require context of the current XMLView/Fragment");
			assert.ok(oWarningSpy.neverCalledWith(sinon.match(/Event handler name 'Toast.show\('This is a toast'\)' could not be resolved to an event handler function/)));
		}
	}, {
		testDescription: "Parsing core:require in XMLView with fragment w/o require context",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require_noRequire",
		settings: {
			sync: {
				create: createView,
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;
			assert.ok(oWarningSpy.calledWith(sinon.match(/Event handler name 'Toast.show\('Problem occurred'\)' could not be resolved to an event handler function/)));
		}
	}, {
		testDescription: "Parsing core:require in XMLView with nested view and the require context isn't forwarded to nested view",
		viewName: ".view.XMLTemplateProcessorAsync_require_nested",
		settings: {
			sync: {
				create: createView,
				spies: {
					_create: [View, "_create"],
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oCreateSpy = mSpies._create;
			var oWarningSpy = mSpies.warning;
			assert.ok(oCreateSpy.calledOnce, "generic create is called for the nested view");

			return oCreateSpy.getCall(0).returnValue.loaded().then(function() {
				return assert.ok(oWarningSpy.calledWith(sinon.match(/Event handler name 'Box.show\('MessageBox'\)' could not be resolved to an event handler function/)));
			});
		}
	}, {
		testDescription: "Parsing core:require in ExtensionPoint",
		settings: {
			sync: {
				create: function () {
					return sap.ui.component({
						name: TESTDATA_PREFIX + ".extension-points.Child",
						manifestUrl: sap.ui.require.toUrl("testdata/xml-require/extension-points/Child/manifest-sync-rootview_legacyAPIs.json"),
						async: false
					}).getRootControl().loaded();
				},
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;

			var MessageBox = sap.ui.require("sap/m/MessageBox");
			assert.ok(MessageBox, "Class is loaded");
			var oBoxShowSpy = this.spy(MessageBox, "show");

			var oMessageBoxButton = oView.getContent()[0].byId("requireBtn");
			oMessageBoxButton.fireEvent("press");

			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Do you really want to close?", "The method is called with correct argument");

			var MessageToast = sap.ui.require("sap/m/MessageToast");
			assert.ok(MessageToast, "Class is loaded");
			var oToastShowSpy = this.spy(MessageToast, "show");

			var oMessageToastButton = oView.getContent()[2].byId("noRequireBtn");
			oMessageToastButton.fireEvent("press");
			assert.equal(oToastShowSpy.callCount, 0, "Toast.show isn't called because the core:require is missing");

			assert.ok(oWarningSpy.calledWith(sinon.match(/Event handler name 'Toast.show\('Do you really want to close\?'\)' could not be resolved to an event handler function/)));

			return new Promise(function(resolve, reject) {
				InstanceManager.closeAllDialogs();
				resolve();
			});
		}
	}, {
		testDescription: "Parsing core:require in ExpressionBinding",
		viewName: ".view.XMLTemplateProcessorAsync_require_expressionFaulty",
		settings: {
			sync: {
				create: createView,
				spies: {
					error: [Log, "error"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {

			var oModel = new JSONModel({
				amount: 1001,
				foobar: "bar",
				test: "test",
				begin: false,
				exist: false,
				text1: "text1",
				text2: "text2",
				number: 123.45678,
				items: [{
					title: "item1"
				}, {
					title: "item2"
				}, {
					title: "item3"
				}, {
					title: "item4"
				}]
			});

			oView.setModel(oModel);

			var oList = oView.byId("list");
			assert.equal(oList.getItems().length, 4, "The Aggregation binding factory works as expected");
			assert.strictEqual(oList.getItems()[0].getTitle(), "item1", "The title is set in list item");

			assert.strictEqual(oView.byId("foo").getText(), "foo", "foo is set");
			assert.strictEqual(oView.byId("bar").getVisible(), false, "visible is set");
			assert.strictEqual(oView.byId("formatter").getText(), "test", "text is set");
			assert.strictEqual(oView.byId("formatterGlobal").getText(), "test", "text is set");
			assert.strictEqual(oView.byId("formatterLocal").getText(), "TEST", "text is set");
			assert.strictEqual(oView.byId("text").getText(), "text2", "text2 is set");
			assert.strictEqual(oView.byId("type").getText(), "123.45678", "text is formatted with correct type");
		}
	}].forEach(function (oConfig) {
		// Run sync variant
		QUnit.test(oConfig.testDescription + " - sync", function(assert) {
			var that = this,
				bAsync = false,
				mSpies;

			if (oConfig.settings.sync.spies) {
				mSpies = createSpies(oConfig.settings.sync.spies, this);
			}

			return oConfig.settings.sync.create(oConfig.viewName, oConfig.settings.sync.additionalViewSettings)
				.then(function (oView) {
					return oConfig.runAssertions.call(that, oView, mSpies, assert, bAsync);
				}, function(oError) {
					if (oConfig.onRejection) {
						oConfig.onRejection(assert, oError);
					}
				});
		});
	});
});
