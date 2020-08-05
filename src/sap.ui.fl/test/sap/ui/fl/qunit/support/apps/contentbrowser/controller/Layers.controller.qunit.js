/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/Layers.controller",
	"sap/ui/fl/Layer",
	"sap/ui/core/routing/Router",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	Layers,
	Layer,
	Router,
	UIComponent,
	ErrorUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oController;

	QUnit.module("Layers", {
		beforeEach: function () {
			oController = new Layers();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a layer is selected", function (assert) {
			var oEvent = {
				getSource : function () {
					return {
						getBindingContextPath : function () {
							return {
								substring : function () {
									return "layer";
								}
							};
						}
					};
				}
			};
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						getData: function () {
							return {
								layer : {
									name : Layer.VENDOR
								}
							};
						}
					};
				}
			});
			var oRouter = new Router();
			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

			oController.onLayerSelected(oEvent);

			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "with correct target");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, Layer.VENDOR, "with correct layer");
		});

		QUnit.test("when MessagePopover is press", function (assert) {
			var oEvent = {
				getSource : function () {
					return "source";
				}
			};
			var oStubbedMessagePressed = sandbox.stub(ErrorUtils, "handleMessagePopoverPress");

			oController.handleMessagePopoverPress(oEvent);

			assert.ok(oStubbedMessagePressed.calledOnce, "then handleMessagePopoverPress called one");
			assert.equal(oStubbedMessagePressed.getCall(0).args[0], "source", "with correct source");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});