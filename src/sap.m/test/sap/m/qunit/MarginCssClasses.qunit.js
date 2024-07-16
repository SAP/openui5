/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/Device",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(createAndAppendDiv,
	Component,
	ComponentContainer,
	Device,
	nextUIUpdate
) {
	"use strict";

	createAndAppendDiv("content");
	var sMarginQUnitView =
		"<mvc:View" +
		"    height=\"100%\"" +
		"    xmlns:f=\"sap.ui.layout.form\"" +
		"    xmlns:l=\"sap.ui.layout\"" +
		"    xmlns:core=\"sap.ui.core\"" +
		"    xmlns:mvc=\"sap.ui.core.mvc\"" +
		"    xmlns=\"sap.m\">" +
		"    <Page" +
		"        id=\"page\"" +
		"        binding=\"{/ProductCollection/0}\"" +
		"        title=\" Product XY\" >" +
		"        <content>" +
		"            <ObjectHeader" +
		"                id=\"objectHeader\"" +
		"                title=\"{Name}\"" +
		"                number=\"{Price}\"" +
		"                numberUnit=\"{CurrencyCode}\" >" +
		"                <attributes>" +
		"                    <ObjectAttribute title=\"Weight\" text=\"{WeightMeasure} {WeightUnit}\" />" +
		"                    <ObjectAttribute title=\"Dimensions\" text=\"{Width} x {Depth} X {Height} {DimUnit}\" />" +
		"                </attributes>" +
		"                <statuses>" +
		"                    <ObjectStatus title=\"Status\" text=\"In Stock\" state=\"Success\" />" +
		"                </statuses>" +
		"            </ObjectHeader>" +
		"            <IconTabBar" +
		"                id=\"iconTabBar\"" +
		"                expanded=\"{device>/isNoPhone}\">" +
		"                <items>" +
		"                    <IconTabFilter" +
		"                        key=\"info\"" +
		"                        text=\"Info\">" +
		"                        <f:SimpleForm" +
		"                            maxContainerCols=\"2\"" +
		"                            layout=\"ResponsiveGridLayout\" >" +
		"                            <f:title>" +
		"                                <core:Title text=\"A Form\" />" +
		"                            </f:title>" +
		"                            <Label text=\"Label\"/>" +
		"                            <Text text=\"Value\"/>" +
		"                        </f:SimpleForm>" +
		"                    </IconTabFilter>" +
		"                    <IconTabFilter" +
		"                        key=\"attachments\"" +
		"                        text=\"Attachments\">" +
		"                        <List headerText=\"A List\" showSeparators=\"Inner\" >" +
		"                        </List>" +
		"                    </IconTabFilter>" +
		"                    <IconTabFilter" +
		"                        key=\"notes\"" +
		"                        text=\"Notes\">" +
		"                        <FeedInput />" +
		"                    </IconTabFilter>" +
		"                </items>" +
		"            </IconTabBar>" +
		"            <f:SimpleForm" +
		"                id=\"simpleForm\"" +
		"                maxContainerCols=\"2\"" +
		"                layout=\"ResponsiveGridLayout\" >" +
		"                <f:title>" +
		"                    <core:Title text=\"A Form\" />" +
		"                </f:title>" +
		"                <Label text=\"Label\"/>" +
		"                <Text text=\"Value\"/>" +
		"            </f:SimpleForm>" +
		"            <List id=\"list\" headerText=\"A List\" backgroundDesign=\"Translucent\"/>" +
		"            <Table id=\"table\" headerText=\"A Table\"/>" +
		"            <Panel id=\"panel\" headerText=\"A Panel\"/>" +
		"            <Panel id=\"restrictedWidthPanel\" width=\"200px\" headerText=\"A Panel\"/>" +
		"            <ScrollContainer" +
		"                id=\"scrollCont\"" +
		"                height=\"200px\"" +
		"                width=\"100%\"" +
		"                horizontal=\"true\"" +
		"                vertical=\"true\"" +
		"                focusable=\"true\">" +
		"                <Image" +
		"                    src=\"../../../../test-resources/sap/ui/documentation/sdk/images/large_HT-6100.jpg\" />" +
		"            </ScrollContainer>" +
		"            <Carousel id=\"carousel\">" +
		"                <pages>" +
		"                    <l:VerticalLayout>" +
		"                        <Image src=\"test-resources/sap/ui/documentation/sdk/images/large_HT-6100.jpg\" />" +
		"                    </l:VerticalLayout>" +
		"                    <Image src=\"test-resources/sap/ui/documentation/sdk/images/HT-1073.jpg\" />" +
		"                    <Text class=\"sapUiSmallMargin\"" +
		"                        text=\"Lorem ipsum dolor st amet, consetetur ssadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat\" />" +
		"                    <ScrollContainer height=\"100%\" width=\"100%\"" +
		"                        horizontal=\"false\" vertical=\"true\">" +
		"                        <List headerText=\"Some List Content 1\"" +
		"                            items=\"{" +
		"                                        path: '/ProductCollection'" +
		"                                      }\">" +
		"                            <StandardListItem title=\"{Name}\" description=\"{ProductId}\"" +
		"                                icon=\"{ProductPicUrl}\" iconDensityAware=\"false\" iconInset=\"false\" />" +
		"                        </List>" +
		"                    </ScrollContainer>" +
		"                    <Image src=\"test-resources/sap/ui/documentation/sdk/images/HT-1112.jpg\" />" +
		"                </pages>" +
		"            </Carousel>" +
		"            <SplitContainer id=\"splitContainer\">" +
		"                <detailPages>" +
		"                    <Text text=\"Hello World!\" />" +
		"                </detailPages>" +
		"                <masterPages>" +
		"                    <List headerText=\"An Empty List\" backgroundDesign=\"Translucent\"/>" +
		"                </masterPages>" +
		"            </SplitContainer>" +
		"        </content>" +
		"    </Page>" +
		"</mvc:View>";


	sap.ui.define("test/sap/m/margin/Component", [
		"sap/ui/core/UIComponent",
		"sap/ui/core/mvc/XMLView",
		"sap/ui/model/json/JSONModel"
	], function(UIComponent, XMLView, JSONModel) {
		return UIComponent.extend("test.sap.m.margin.Component", {
			metadata: {
				interfaces: [ "sap.ui.core.IAsyncContentCreation" ]
			},
			createContent: function(oEvent) {
				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));

				return XMLView.create({
					definition: sMarginQUnitView,
					models: oModel
				});
			}
		});
	});

	// Currently only works under chrome
	if (!Device.browser.chrome) {
		QUnit.test("Browser '" + Device.browser.name + "'...", function(assert) {
			//Write a comment into the test protocol that static tests can not be executed.
			assert.ok(true, "Static test not available yet for browser '" + Device.browser.name + "'");
		});
		return;
	}

	QUnit.module("Apply pre-defined css classes", {
		beforeEach: function() {
			return Component.create({
				name: "test.sap.m.margin"
			}).then(function(oComponent) {
				this.oComponentContainer =
					new ComponentContainer()
						.setComponent(oComponent)
						.placeAt("content");

				var oTestView = oComponent.getRootControl();
				this.aControls = [
					this.oPage = oTestView.byId('page'),
					this.oObjectHeader = oTestView.byId('objectHeader'),
					this.oIconTabBar = oTestView.byId('iconTabBar'),
					this.oSimpleForm = oTestView.byId('simpleForm'),
					this.oList = oTestView.byId('list'),
					this.oTable = oTestView.byId('table'),
					this.oPanel = oTestView.byId('panel'),
					this.oRestrictedWidthPanel = oTestView.byId('restrictedWidthPanel'),
					this.oScrollCont = oTestView.byId('scrollCont'),
					this.oCarousel = oTestView.byId('carousel'),
					this.oSplitContainer = oTestView.byId('splitContainer')
				];
			}.bind(this));
		},
		afterEach: function() {
			// clean up
			this.oComponentContainer.destroy();
		}
	});

	[
		{cssProperty: 'margin', marginClass: 'sapUiTinyMargin', expected: '8px', horizontal: true},
		{cssProperty: 'margin', marginClass: 'sapUiSmallMargin', expected: '16px', horizontal: true},
		{cssProperty: 'margin', marginClass: 'sapUiMediumMargin', expected: '32px', horizontal: true},
		{cssProperty: 'margin', marginClass: 'sapUiLargeMargin', expected: '48px', horizontal: true},

		//Test Two-side margins
		{cssProperty: 'margin-left', marginClass: 'sapUiTinyMarginBeginEnd', expected: '8px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiTinyMarginBeginEnd', expected: '8px', horizontal: true},
		{cssProperty: 'margin-left', marginClass: 'sapUiSmallMarginBeginEnd', expected: '16px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiSmallMarginBeginEnd', expected: '16px', horizontal: true},
		{cssProperty: 'margin-left', marginClass: 'sapUiMediumMarginBeginEnd', expected: '32px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiMediumMarginBeginEnd', expected: '32px', horizontal: true},
		{cssProperty: 'margin-left', marginClass: 'sapUiLargeMarginBeginEnd', expected: '48px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiLargeMarginBeginEnd', expected: '48px', horizontal: true},
		{cssProperty: 'margin-top', marginClass: 'sapUiTinyMarginTopBottom', expected: '8px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiTinyMarginTopBottom', expected: '8px'},
		{cssProperty: 'margin-top', marginClass: 'sapUiSmallMarginTopBottom', expected: '16px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiSmallMarginTopBottom', expected: '16px'},
		{cssProperty: 'margin-top', marginClass: 'sapUiMediumMarginTopBottom', expected: '32px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiMediumMarginTopBottom', expected: '32px'},
		{cssProperty: 'margin-top', marginClass: 'sapUiLargeMarginTopBottom', expected: '48px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiLargeMarginTopBottom', expected: '48px'},

		//Test Single-sided margins
		{cssProperty: 'margin-top', marginClass: 'sapUiTinyMarginTop', expected: '8px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiTinyMarginBottom', expected: '8px'},
		{cssProperty: 'margin-left', marginClass: 'sapUiTinyMarginBegin', expected: '8px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiTinyMarginEnd', expected: '8px', horizontal: true},

		{cssProperty: 'margin-top', marginClass: 'sapUiSmallMarginTop', expected: '16px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiSmallMarginBottom', expected: '16px'},
		{cssProperty: 'margin-left', marginClass: 'sapUiSmallMarginBegin', expected: '16px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiSmallMarginEnd', expected: '16px', horizontal: true},

		{cssProperty: 'margin-top', marginClass: 'sapUiMediumMarginTop', expected: '32px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiMediumMarginBottom', expected: '32px'},
		{cssProperty: 'margin-left', marginClass: 'sapUiMediumMarginBegin', expected: '32px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiMediumMarginEnd', expected: '32px', horizontal: true},

		{cssProperty: 'margin-top', marginClass: 'sapUiLargeMarginTop', expected: '48px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiLargeMarginBottom', expected: '48px'},
		{cssProperty: 'margin-left', marginClass: 'sapUiLargeMarginBegin', expected: '48px', horizontal: true},
		{cssProperty: 'margin-right', marginClass: 'sapUiLargeMarginEnd', expected: '48px', horizontal: true},

		//Test No Margins: add margin classes AND use our No Margins at the same time:
		//the No Margins classes should be stronger
		{cssProperty: 'margin', marginClass: 'sapUiLargeMargin sapUiNoMargin', expected: '0px'},
		{cssProperty: 'margin-right', marginClass: 'sapUiLargeMargin sapUiNoMarginEnd', expected: '0px'},
		{cssProperty: 'margin-top', marginClass: 'sapUiLargeMargin sapUiNoMarginTop sapUiNoMarginBottom', expected: '0px'},
		{cssProperty: 'margin-bottom', marginClass: 'sapUiNoMarginTop sapUiNoMarginBottom sapUiLargeMargin', expected: '0px'}
	].forEach(function(oConfig) {

		QUnit.test("Testing margin class '" + oConfig.marginClass + "'", async function(assert) {

			// add css classes to each control
			this.aControls.forEach(function(oControl) {
				if (oConfig.horizontal) {
					if (!oControl.setWidth || oControl == this.oRestrictedWidthPanel) {
						//if the control has no width property, we need our special width class
						oControl.addStyleClass('sapUiForceWidthAuto');
					} else {
						//if the control has a width property, we'll set it to 'auto'
						oControl.setWidth('auto');
					}
				}
				oControl.addStyleClass(oConfig.marginClass);
			}.bind(this));

			// render
			await nextUIUpdate();

			//check values
			assert.equal(this.oPage.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Page " +  oConfig.expected);
			assert.equal(this.oObjectHeader.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " ObjectHeader " +  oConfig.expected);
			assert.equal(this.oIconTabBar.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " IconTabBar " +  oConfig.expected);
			assert.equal(this.oSimpleForm.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Simple Form " +  oConfig.expected);
			assert.equal(this.oTable.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Table "  +  oConfig.expected);
			assert.equal(this.oPanel.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Panel "  +  oConfig.expected);
			assert.equal(this.oRestrictedWidthPanel.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Panel "  +  oConfig.expected);
			if (oConfig.horizontal) {
				//Check if 'sapUiForceWidthAuto' changes the width property as expected
				assert.notEqual(this.oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");
				this.oRestrictedWidthPanel.removeStyleClass('sapUiForceWidthAuto');
				assert.equal(this.oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");
			}
			assert.equal(this.oList.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " List " +  oConfig.expected );
			assert.equal(this.oScrollCont.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Scroll Container " +  oConfig.expected );
			assert.equal(this.oCarousel.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Carousel " +  oConfig.expected );
			assert.equal(this.oSplitContainer.$().css(oConfig.cssProperty), oConfig.expected, oConfig.cssProperty + " Split Containe " +  oConfig.expected );
			//Cannot check 'auto' because there is no way to  ask for it. Even 'oControl.getDomRef().style.width'
			//does not deliver the correct result: the inline style is returned even though it is not what
			//is used for determining the width
		});
	});
});