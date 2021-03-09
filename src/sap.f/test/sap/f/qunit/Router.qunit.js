/*global QUnit*/
sap.ui.define([
	"sap/f/routing/Router",
	"sap/f/routing/TargetHandler",
	"sap/m/NavContainer",
	"sap/m/Page"
],
function (
	Router,
	TargetHandler,
	NavContainer,
	Page
) {
	"use strict";

	var fnCreateRouter = function() {
		var args = Array.prototype.slice.call(arguments);

		args.unshift(Router);

		if (args.length < 3) {
			args[2] = {};
		}
		if (args[2] === null) {
			args[2] = {};
		}
		args[2].async = true;

		return new (Function.prototype.bind.apply(Router, args));
	};


	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	function createViewAndController(sName, oContent) {
		sap.ui.controller(sName, {});
		sap.ui.jsview(sName, {
			createContent: function () {
				if (oContent) {
					return oContent;
				}
			},
			getController: function () {
				return sap.ui.controller(sName);
			}
		});

		return sap.ui.jsview(sName);
	}


	QUnit.test("Targets should navigate to child view with no error", function (assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
				oInnerPage = new Page("innerPage"),
				oRouter = fnCreateRouter(
						{
							"route": {
								pattern: "anyPattern",
								target: ["first"]
							}
						},
						{
							viewType: "JS",
							controlAggregation:"pages",
							controlId: oNavContainer.getId()
						},
						null,
						{
							first: {
								viewName: "first",
								viewLevel: 1
							},
							second: {
								parent: "first",
								viewName: "second",
								controlId: "innerPage",
								controlAggregation: "content"
							}
						});

		// views
		createViewAndController("first", oInnerPage);
		createViewAndController("second");

		assert.expect(1);

		return oRouter.getTargets().display("second").then(function() {
			assert.strictEqual(oInnerPage.getContent().length, 1, "the dependent view inserted with no error");
		});
	});
});