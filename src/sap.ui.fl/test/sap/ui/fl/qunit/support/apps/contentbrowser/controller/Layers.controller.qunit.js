sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/Layers.controller",
	"sap/ui/core/routing/Router",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils"
], function (Layers, Router, UIComponent, ErrorUtils){
	"use strict";

	var oController;

	QUnit.module("Layers", {
		beforeEach: function () {
			oController = new Layers();
		}
	});

	QUnit.test("when a layer is selected", function (assert) {
		var oEvent = {
			getSource : function (){
				return {
					getBindingContextPath : function (){
						return {
							substring : function (){
								return "layer";
							}
						};
					}
				};
			}
		};
		this.stub(oController, "getView").returns({
			getModel: function () {
				return {
					getData: function () {
						return {
							layer : {
								name : "VENDOR",
							}
						}
					}
				};
			}
		});
		var oRouter = new Router();
		var oStubbedGetRouterFor = this.stub(UIComponent, "getRouterFor").returns(oRouter);
		var oStubbedNavTo = this.stub(oRouter, "navTo");

		oController.onLayerSelected(oEvent);

		assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
		assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
		assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "with correct target");
		assert.equal(oStubbedNavTo.getCall(0).args[1].layer, "VENDOR", "with correct layer");
	});

	QUnit.test("when MessagePopover is press", function (assert) {
		var oEvent = {
			getSource : function (){
				return "source";
			}
		};
		var oStubbedMessagePressed = this.stub(ErrorUtils, "handleMessagePopoverPress");

		oController.handleMessagePopoverPress(oEvent);

		assert.ok(oStubbedMessagePressed.calledOnce, "then handleMessagePopoverPress called one");
		assert.equal(oStubbedMessagePressed.getCall(0).args[0], "source", "with correct source");
	});
});