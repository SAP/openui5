/*global QUnit */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/layout/form/ResponsiveGridLayout" // form layout used by SimpleForm
], function(Component, ComponentContainer, oCore) {
	"use strict";

	sap.ui.define("margin/qunit/controller.controller", [
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel"
	], function(Controller, JSONModel) {
		return Controller.extend("margin.qunit.controller", {

			onInit: function(oEvent) {
				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
				this.getView().setModel(oModel);
				this.getView().byId("page").bindElement("/ProductCollection/0");
			}

		});
	});

	sap.ui.define("margin/qunit/Component", [
		"sap/ui/core/UIComponent",
		"sap/ui/core/mvc/XMLView"
	], function(UIComponent, XMLView) {
		return UIComponent.extend("margin.qunit.Component", {
			metadata: {
				interfaces: [ "sap.ui.core.IAsyncContentCreation" ]
			},
			createContent: function(oEvent) {
				return XMLView.create({
					definition: document.getElementById("marginQUnitView").textContent
				});
			}
		});
	});

	QUnit.module("Apply pre-defined css classes");

	QUnit.test("Test responsive margin classes", function(assert) {
		// Test Responsive Margins: resize the containing page and check how the elements respond.
		var oUriParams = new URLSearchParams(window.location.search),
			sExpectedMarginValue = oUriParams.get('sap-ui-expect');

		if (!sExpectedMarginValue) {
			assert.ok( false, "Test Url " + window.location.href + " does not contain parameter 'sap-ui-expected'.");
			return undefined;
		}

		var sCssProperty = 'margin',
			sMarginClass = 'sapUiResponsiveMargin',
			bHorizontal = true;

		assert.ok( true, " " ); //Group tests
		assert.ok( true, "TESTING MARGIN CLASS '" + sMarginClass + "'" );

		return Component.create({
			name: "margin.qunit"
		}).then(function(oComponent) {

			var oComponentContainer = new ComponentContainer();
			oComponentContainer.setComponent(oComponent);
			oComponentContainer.placeAt("content");
			oCore.applyChanges();

			var oTestView = oComponent.getRootControl(),
				oPage = oTestView.byId('page'),
				oObjectHeader = oTestView.byId('objectHeader'),
				oIconTabBar = oTestView.byId('iconTabBar'),
				oSimpleForm = oTestView.byId('simpleForm'),
				oList = oTestView.byId('list'),
				oTable = oTestView.byId('table'),
				oPanel = oTestView.byId('panel'),
				oRestrictedWidthPanel = oTestView.byId('restrictedWidthPanel'),
				oScrollCont = oTestView.byId('scrollCont'),
				oCarousel = oTestView.byId('carousel'),
				oSplitContainer = oTestView.byId('splitContainer'),
				aControls = [
					oPage, oObjectHeader, oIconTabBar, oSimpleForm, oList, oTable,
					oPanel, oRestrictedWidthPanel, oScrollCont, oCarousel, oSplitContainer
				];

			// add CSS classes
			aControls.forEach(function(oControl) {
				if (bHorizontal) {
					if (!oControl.setWidth || oControl == oRestrictedWidthPanel) {
						// if the control has no width property, we need our special width class
						oControl.addStyleClass('sapUiForceWidthAuto');
					} else {
						// if the control has a width property, we'll set it to 'auto'
						oControl.setWidth('auto');
					}
				}
				oControl.addStyleClass(sMarginClass);
			});
			oCore.applyChanges();

			// Check values
			assert.equal(oPage.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Page " +  sExpectedMarginValue);
			assert.equal(oObjectHeader.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " ObjectHeader " +  sExpectedMarginValue);
			assert.equal(oIconTabBar.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " IconTabBar " +  sExpectedMarginValue);
			assert.equal(oSimpleForm.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Simple Form " +  sExpectedMarginValue);
			assert.equal(oTable.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Table "  +  sExpectedMarginValue);
			assert.equal(oPanel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Panel "  +  sExpectedMarginValue);
			assert.equal(oRestrictedWidthPanel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Panel "  +  sExpectedMarginValue);
			if (bHorizontal) {
				// Check if 'sapUiForceWidthAuto' changes the width property as expected
				assert.notEqual(oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");
				oRestrictedWidthPanel.removeStyleClass('sapUiForceWidthAuto');
				assert.equal(oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");

			}
			assert.equal(oList.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " List " +  sExpectedMarginValue );
			assert.equal(oScrollCont.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Scroll Container " +  sExpectedMarginValue );
			assert.equal(oCarousel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Carousel " +  sExpectedMarginValue );
			assert.equal(oSplitContainer.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Split Container " +  sExpectedMarginValue );
			// Cannot check 'auto' because there is no way to ask for it. Even 'oControl.getDomRef().style.width'
			// does not deliver the correct result: the inline style is returned even though it is not what
			// is used for determining the width

			// Clean up
			oComponentContainer.destroy();
		});
	});

});
