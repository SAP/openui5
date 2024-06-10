/*global QUnit*/
sap.ui.define([
	"sap/f/routing/Router",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/ui/core/mvc/View"
],
function (
	Router,
	NavContainer,
	Page,
	View
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

		// eslint-disable-next-line new-parens
		return new (Function.prototype.bind.apply(Router, args));
	};


	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	function createViewAndController(sName, oContent) {
		var oView = View.create({viewName: "f.test.views." + sName, type: "XML"
		});

		return oView;
	}


	QUnit.test("Targets should navigate to child view with no error", function (assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
				oInnerPage = new Page("innerPage"),
				done = assert.async(),
				oRouter = fnCreateRouter(
						{
							"route": {
								pattern: "anyPattern",
								target: ["first"]
							}
						},
						{
							viewType: "XML",
							controlAggregation:"pages",
							controlId: oNavContainer.getId(),
							async: true
						},
						null,
						{
							first: {
								viewName: "f.test.views.first",
								viewLevel: 1
							},
							second: {
								parent: "first",
								viewName: "f.test.views.second",
								controlId: "innerPage",
								controlAggregation: "content"
							}
						});

			assert.expect(1);
		// views
		createViewAndController("first", oInnerPage).then(function(oFirstView){
			createViewAndController("second").then(function() {
				oRouter.getTargets().display("second").then(function() {
					assert.strictEqual(oInnerPage.getContent().length, 1, "the dependent view inserted with no error");
					done();
				});
			});
		});
	});
});