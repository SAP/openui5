/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/UIComponent',
	"sap/ui/core/XMLTemplateProcessor",
	"jquery.sap.xml",
	"sap/ui/core/mvc/View",
	"sap/m/InstanceManager",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView"
], function(Component, UIComponent, XMLTemplateProcessor, jQuery, View,
	InstanceManager, Log, merge, JSONModel, XMLView) {
	"use strict";

	var TESTDATA_PREFIX = "testdata.xml-require";

	var createView = function (sViewName, additionalViewSettings, bAsync) {
		var oSettings = {
			viewName: TESTDATA_PREFIX + sViewName,
			type: "XML"
		};

		if (additionalViewSettings) {
			merge(oSettings, additionalViewSettings);
		}

		return bAsync ? View.create(oSettings) : sap.ui.xmlview(oSettings).loaded();
	};

	var createAsyncView = function (sViewName, additionalViewSettings) {
		return createView(sViewName, additionalViewSettings, true);
	};

	var createSyncView = function (sViewName, additionalViewSettings) {
		return createView(sViewName, additionalViewSettings, false);
	};

	function createSpies(mSpies, oScope) {
		return Object.keys(mSpies).reduce(function(oSpyObject, sName) {
			oSpyObject[sName] = oScope.spy.apply(oScope, mSpies[sName]);
			return oSpyObject;
		}, {});
	}

	QUnit.module("core:require validation");

	QUnit.test("Throw error if core:require is defined with non-object", function(assert) {
		var sView =
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">' +
				'<Panel id="panel" core:require="true">' +
				'</Panel>' +
			'</mvc:View>';

		return XMLView.create({
			definition: sView
		}).catch(function(oError) {
			assert.equal(oError.message, "core:require in XMLView can't be parsed to a valid object on Node: Panel");
		});
	});

	QUnit.test("Throw error if core:require contains invalid identifier", function(assert) {
		var aViews = [
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">' +
				'<Panel id="panel" core:require="{\'nested.name\': \'some/nested/path\'}">' +
				'</Panel>' +
			'</mvc:View>',
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">' +
				'<Panel id="panel" core:require="{\'nested/name\': \'some/nested/path\'}">' +
				'</Panel>' +
			'</mvc:View>',
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">' +
				'<Panel id="panel" core:require="{\'nested;name\': \'some/nested/path\'}">' +
				'</Panel>' +
			'</mvc:View>'
		];

		return aViews.reduce(function(oChain, sView) {
			return oChain.then(function() {
				return XMLView.create({
					definition: sView
				}).catch(function(oError) {
					assert.ok(/^core:require in XMLView contains invalid identifier: 'nested[./;]name' on Node: Panel$/.test(oError.message));
				});
			});
		}, Promise.resolve());
	});

	QUnit.test("Throw error if core:require contains non-string value", function(assert) {
		var sView =
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">' +
				'<Panel id="panel" core:require="{\'module\': {path: \'some/good/path\'}}">' +
				'</Panel>' +
			'</mvc:View>';

		return XMLView.create({
			definition: sView
		}).catch(function(oError) {
			assert.equal(oError.message, "core:require in XMLView contains invalide value '[object Object]'under key 'module' on Node: Panel");
		});
	});

	QUnit.module("core:require in XMLView");

	[{
		testDescription: "Parsing core:require in XMLView",
		viewName: ".view.XMLTemplateProcessorAsync_require",
		settings: {
			async: {
				create: createAsyncView
			},
			sync: {
				create: createSyncView
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

			var oBoxButton = oView.byId("boxButton");
			var oToastButton = oView.byId("toastButton");
			var oGlobalToastButton = oView.byId("globalToastButton");
			var oOuterButton = oView.byId("outerButton");
			var oHelperButton = oView.byId("helperButton");
			var oNewButton = oView.byId("newBoxButton");
			var oFunctionControl = oView.byId("functionControl");

			var oBoxShowSpy = this.spy(MessageBox, "show");
			var oToastShowSpy = this.spy(MessageToast, "show");
			var oBusyIndicatorShowSpy = this.spy(BusyIndicator, "show");
			var oHelperSpy = this.spy(Helper.groupA, "upperCase");

			assert.strictEqual(oFunctionControl.getHandler().toString(),
				Helper.groupA.lowerCase.bind(Helper.groupA).toString(), "The function property is resolved correctly");

			oBoxButton.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method is called once");
			assert.ok(oBusyIndicatorShowSpy.notCalled, "show method from other require isn't called");
			assert.equal(oBoxShowSpy.getCall(0).args[0], "Boxed", "The method is called with correct argument");

			oToastButton.fireEvent("press");
			assert.ok(oToastShowSpy.calledOnce, "show method is called once");
			assert.equal(oToastShowSpy.getCall(0).args[0], "Show Toast", "The method is called with correct argument");

			oGlobalToastButton.fireEvent("press");
			assert.ok(oToastShowSpy.calledTwice, "show method is called twice");

			oOuterButton.fireEvent("press");
			assert.ok(oBoxShowSpy.calledOnce, "show method from other require isn't called");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called");
			assert.equal(oBusyIndicatorShowSpy.getCall(0).args[0], "100", "The method is called with correct argument");

			oHelperButton.fireEvent("press");
			assert.ok(oHelperSpy.calledOnce, "The helper function is called");

			oBoxShowSpy.reset();
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
		testDescription: "Parsing core:require in fragment",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require",
		settings: {
			async: {
				create: createAsyncView
			},
			sync: {
				create: createSyncView
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
		testDescription: "Parsing core:require in fragment without fragment node",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require_control_root",
		settings: {
			async: {
				create: createAsyncView
			},
			sync: {
				create: createSyncView
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
			async: {
				create: createAsyncView,
				additionalViewSettings: {
					preprocessors: {
						xml: {}
					}
				}
			},
			sync: {
				create: createSyncView,
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
			async: {
				create: createAsyncView,
				spies: {
					warning: [Log, "warning"]
				}
			},
			sync: {
				create: createSyncView,
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;
			sinon.assert.calledWith(oWarningSpy, "Event handler name 'Toast.show('This is a toast')' could not be resolved to an event handler function");
		}
	}, {
		testDescription: "Parsing core:require in XMLView with fragment with missing definition in require context with preprocessors enabled",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_insufficient_require",
		settings: {
			async: {
				create: createAsyncView,
				additionalViewSettings: {
					preprocessors: {
						xml: {}
					}
				},
				spies: {
					warning: [Log, "warning"]
				}
			},
			sync: {
				create: createSyncView,
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
			sinon.assert.neverCalledWith(oWarningSpy, "Event handler name 'Toast.show('This is a toast')' could not be resolved to an event handler function");
		}
	}, {
		testDescription: "Parsing core:require in XMLView with fragment w/o require context",
		viewName: ".view.XMLTemplateProcessorAsync_fragment_require_noRequire",
		settings: {
			async: {
				create: createAsyncView,
				spies: {
					warning: [Log, "warning"]
				}
			},
			sync: {
				create: createSyncView,
				spies: {
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oWarningSpy = mSpies.warning;
			sinon.assert.calledWith(oWarningSpy, "Event handler name 'Toast.show('Problem occurred')' could not be resolved to an event handler function");
		}
	}, {
		testDescription: "Parsing core:require in XMLView with nested view and the require context isn't forwarded to nested view",
		viewName: ".view.XMLTemplateProcessorAsync_require_nested",
		settings: {
			async: {
				create: createAsyncView,
				spies: {
					legacyCreate: [View, "_legacyCreate"],
					warning: [Log, "warning"]
				}
			},
			sync: {
				create: createSyncView,
				spies: {
					legacyCreate: [View, "_legacyCreate"],
					warning: [Log, "warning"]
				}
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var oLegacyCreateSpy = mSpies.legacyCreate;
			var oWarningSpy = mSpies.warning;
			assert.ok(oLegacyCreateSpy.calledOnce, "legacy create is called for the nested view");

			return oLegacyCreateSpy.getCall(0).returnValue.loaded().then(function() {
				return sinon.assert.calledWith(oWarningSpy, "Event handler name 'Box.show('MessageBox')' could not be resolved to an event handler function");
			});
		}
	}, {
		testDescription: "Parsing core:require in ExtensionPoint",
		settings: {
			async: {
				create: function () {
					return Component.create({
						name: TESTDATA_PREFIX + ".extension-points.Child"
					}).then(function (oComponent) {
						return oComponent.getRootControl().loaded();
					});
				},
				spies: {
					warning: [Log, "warning"]
				}
			},
			sync: {
				create: function () {
					return sap.ui.component({
						name: TESTDATA_PREFIX + ".extension-points.Child",
						manifestUrl: sap.ui.require.toUrl("testdata/xml-require/extension-points/Parent/") + "manifest-sync-rootview.json",
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

			sinon.assert.calledWith(oWarningSpy, "Event handler name 'Toast.show('Do you really want to close?')' could not be resolved to an event handler function");

			return new Promise(function(resolve, reject) {
				InstanceManager.closeAllDialogs();
				resolve();
			});
		}
	}, {
		testDescription: "Parsing core:require in ExpressionBinding",
		viewName: ".view.XMLTemplateProcessorAsync_require_expression",
		settings: {
			async: {
				create: createAsyncView,
				spies: {}
			},
			sync: {
				create: createSyncView,
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
			assert.strictEqual(oView.byId("type").getText(), "123.457", "text is formatted with correct type");
		}
	}].forEach(function (oConfig) {
		// Run async variant
		QUnit.test(oConfig.testDescription + " - async", function(assert) {
			var that = this,
				bAsync = true,
				mSpies;

			if (oConfig.settings.async.spies) {
				mSpies = createSpies(oConfig.settings.async.spies, this);
			}

			return oConfig.settings.async.create(oConfig.viewName, oConfig.settings.async.additionalViewSettings)
				.then(function (oView) {
					return oConfig.runAssertions.call(that, oView, mSpies, assert, bAsync);
				});
		});

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
				});
		});
	});
});
