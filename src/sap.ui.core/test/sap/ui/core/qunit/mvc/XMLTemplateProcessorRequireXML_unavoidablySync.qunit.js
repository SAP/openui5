/*global QUnit*/
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/base/util/merge"
], function(View, merge) {
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

		return View.create(oSettings);
	};

	function createSpies(mSpies, oScope) {
		return Object.keys(mSpies).reduce(function(oSpyObject, sName) {
			oSpyObject[sName] = oScope.spy.apply(oScope, mSpies[sName]);
			return oSpyObject;
		}, {});
	}


	QUnit.module("core:require in XMLView");

	[{
		testDescription: "Error should be thrown when HTML nodes exist in the binding template of the bound 'content' aggregation",
		viewName: ".view.XMLTemplateProcessorAsync_require_bind_content_html",
		settings: {
			async: {
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
		testDescription: "Parsing core:require and forward it to XHTML",
		viewName: ".view.XMLTemplateProcessorAsync_require_in_html",
		settings: {
			async: {
				create: createView
			}
		},
		runAssertions: function (oView, mSpies, assert, bAsync) {
			var BusyIndicator = sap.ui.require("sap/ui/core/BusyIndicator");
			var MessageBox = sap.ui.require("sap/m/MessageBox");

			assert.ok(BusyIndicator, "Class is loaded");
			assert.ok(MessageBox, "Class is loaded");

			var oButton = oView.byId("button");
			var oNestedButton = oView.byId("nestedButton");

			var oBusyIndicatorShowSpy = this.spy(BusyIndicator, "show");

			oButton.fireEvent("press");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called once");
			BusyIndicator.hide();
			oBusyIndicatorShowSpy.resetHistory();

			var sText = oNestedButton.getText();
			assert.equal(sText, "NESTED BUTTON", "The button text is formatted to upper case");
			oNestedButton.fireEvent("press");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called once again");
			BusyIndicator.hide();
			oBusyIndicatorShowSpy.resetHistory();

			var oButtonInPanel = oView.byId("buttonInPanel");
			var oNestedButtonInPanel = oView.byId("nestedButtonInPanel");

			sText = oButtonInPanel.getText();
			assert.equal(sText, "Click Me", "The button text is formatted by the updated formatter");
			oButtonInPanel.fireEvent("press");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called once again");
			BusyIndicator.hide();
			oBusyIndicatorShowSpy.resetHistory();

			sText = oNestedButtonInPanel.getText();
			assert.equal(sText, "OK", "The button text is formatted by the updated formatter");
			oNestedButtonInPanel.fireEvent("press");
			assert.ok(oBusyIndicatorShowSpy.calledOnce, "show method is called once again");
			BusyIndicator.hide();
			oBusyIndicatorShowSpy.resetHistory();
		}
	}].forEach(function (oConfig) {
		QUnit.test(oConfig.testDescription + " - with sync processing", function(assert) {
			var that = this,
				bAsync = true,
				mSpies;

			if (oConfig.settings.async.spies) {
				mSpies = createSpies(oConfig.settings.async.spies, this);
			}

			return oConfig.settings.async.create(oConfig.viewName, oConfig.settings.async.additionalViewSettings)
				.then(function (oView) {
					return oConfig.runAssertions.call(that, oView, mSpies, assert, bAsync);
				}, function(oError) {
					if (oConfig.onRejection) {
						oConfig.onRejection(assert, oError);
					} else {
						throw oError;
					}
				});
		});
	});
});
