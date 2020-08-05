/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/Device"
], function(
	createAndAppendDiv,
	JSONModel,
	jQuery,
	UIComponent,
	ComponentContainer,
	Device
) {
	createAndAppendDiv("content");
	var sMarginQUnitView =
		"<mvc:View" +
		"    id=\"testView\"" +
		"    height=\"100%\"" +
		"    controllerName=\"margin.qunit.controller\"" +
		"    xmlns:f=\"sap.ui.layout.form\"" +
		"    xmlns:l=\"sap.ui.layout\"" +
		"    xmlns:core=\"sap.ui.core\"" +
		"    xmlns:mvc=\"sap.ui.core.mvc\"" +
		"    xmlns:u=\"sap.ui.unified\"" +
		"    xmlns=\"sap.m\">" +
		"    <Page" +
		"        id=\"page\"" +
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
		"                        text=\"Info\">" +
		"                        <f:SimpleForm" +
		"                            minWidth=\"1024\"" +
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
		"                        text=\"Attachments\">" +
		"                        <List headerText=\"A List\" showSeparators=\"Inner\" >" +
		"                        </List>" +
		"                    </IconTabFilter>" +
		"                    <IconTabFilter" +
		"                        text=\"Notes\">" +
		"                        <FeedInput />" +
		"                    </IconTabFilter>" +
		"                </items>" +
		"            </IconTabBar>" +
		"            <f:SimpleForm" +
		"                id=\"simpleForm\"" +
		"                minWidth=\"1024\"" +
		"                maxContainerCols=\"2\">" +
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
		"            <u:SplitContainer id=\"splitContainer\" showSecondaryContent=\"true\">" +
		"                <u:secondaryContent>" +
		"                    <Text text=\"Hello World!\" />" +
		"                </u:secondaryContent>" +
		"                <u:content>" +
		"                    <List headerText=\"An Empty List\" backgroundDesign=\"Translucent\"/>" +
		"                </u:content>" +
		"            </u:SplitContainer>" +
		"        </content>" +
		"    </Page>" +
		"</mvc:View>";


	sap.ui.controller("margin.qunit.controller", {

		onInit: function(oEvent) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));

			this.getView().setModel(oModel);
			this.getView().byId("page").bindElement("/ProductCollection/0");
		}

	});

	UIComponent.extend("margin.qunit.Component", {
		createContent: function(oEvent) {
			return sap.ui.xmlview({ viewContent: sMarginQUnitView });
		}
	});


	QUnit.module("Apply pre-defined css classes");

	var fnTest = function(sCssProperty, sMarginClass, sExpectedMarginValue, bHorizontal) {
		assert.ok( true, " " ); //Group tests
		assert.ok( true, "TESTING MARGIN CLASS '" + sMarginClass + "'" );
		var oComponentContainer = new ComponentContainer();
		oComponentContainer.setComponent(new margin.qunit.Component());
		oComponentContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oTestView = sap.ui.getCore().byId("__xmlview" + iCount),
			aControls = [
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
				oSplitContainer = oTestView.byId('splitContainer')];
		//add css classes
		aControls.forEach(function(oControl) {
			if (bHorizontal) {
				if (!oControl.setWidth || oControl == oRestrictedWidthPanel) {
					//if the control has no width property, we need our special width class
					oControl.addStyleClass('sapUiForceWidthAuto');
				} else {
					//if the control has a width property, we'll set it to 'auto'
					oControl.setWidth('auto');
				}
			}
			oControl.addStyleClass(sMarginClass);
		});
		sap.ui.getCore().applyChanges();

		//check values
		assert.equal(oPage.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Page " +  sExpectedMarginValue);
		assert.equal(oObjectHeader.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " ObjectHeader " +  sExpectedMarginValue);
		assert.equal(oIconTabBar.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " IconTabBar " +  sExpectedMarginValue);
		assert.equal(oSimpleForm.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Simple Form " +  sExpectedMarginValue);
		assert.equal(oTable.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Table "  +  sExpectedMarginValue);
		assert.equal(oPanel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Panel "  +  sExpectedMarginValue);
		assert.equal(oRestrictedWidthPanel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Panel "  +  sExpectedMarginValue);
		if (bHorizontal) {
			//Check if 'sapUiForceWidthAuto' changes the width property as expected
			assert.notEqual(oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");
			oRestrictedWidthPanel.removeStyleClass('sapUiForceWidthAuto');
			assert.equal(oRestrictedWidthPanel.$().css('width'), '200px', "width Panel 200px");

		}
		assert.equal(oList.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " List " +  sExpectedMarginValue );
		assert.equal(oScrollCont.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Scroll Container " +  sExpectedMarginValue );
		assert.equal(oCarousel.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Carousel " +  sExpectedMarginValue );
		assert.equal(oSplitContainer.$().css(sCssProperty), sExpectedMarginValue, sCssProperty + " Split Containe " +  sExpectedMarginValue );
		//Can not check 'auto' because there is no way to  ask for it. Even 'oControl.getDomRef().style.width'
		//does not deliver the correct result: the inline style is returned even though it is not what
		//is used for determining the width

		//Clean up
		oComponentContainer.destroy();
		iCount++;
	};

	//Needed to identify the views which are created during test
	var iCount = 0;

	QUnit.test("Test static margin classes", function(assert) {
		//Currently only works under chrome
		if (Device.browser.chrome) {
			//Test Margins all around
			fnTest.call(this, 'margin', 'sapUiTinyMargin', '8px', true);
			fnTest.call(this, 'margin', 'sapUiSmallMargin', '16px', true);
			fnTest.call(this, 'margin', 'sapUiMediumMargin', '32px', true);
			fnTest.call(this, 'margin', 'sapUiLargeMargin', '48px', true);

			//Test Two-side margins
			fnTest.call(this, 'margin-left', 'sapUiTinyMarginBeginEnd', '8px', true);
			fnTest.call(this, 'margin-right', 'sapUiTinyMarginBeginEnd', '8px', true);
			fnTest.call(this, 'margin-left', 'sapUiSmallMarginBeginEnd', '16px', true);
			fnTest.call(this, 'margin-right', 'sapUiSmallMarginBeginEnd', '16px', true);
			fnTest.call(this, 'margin-left', 'sapUiMediumMarginBeginEnd', '32px', true);
			fnTest.call(this, 'margin-right', 'sapUiMediumMarginBeginEnd', '32px', true);
			fnTest.call(this, 'margin-left', 'sapUiLargeMarginBeginEnd', '48px', true);
			fnTest.call(this, 'margin-right', 'sapUiLargeMarginBeginEnd', '48px', true);
			fnTest.call(this, 'margin-top', 'sapUiTinyMarginTopBottom', '8px');
			fnTest.call(this, 'margin-bottom', 'sapUiTinyMarginTopBottom', '8px');
			fnTest.call(this, 'margin-top', 'sapUiSmallMarginTopBottom', '16px');
			fnTest.call(this, 'margin-bottom', 'sapUiSmallMarginTopBottom', '16px');
			fnTest.call(this, 'margin-top', 'sapUiMediumMarginTopBottom', '32px');
			fnTest.call(this, 'margin-bottom', 'sapUiMediumMarginTopBottom', '32px');
			fnTest.call(this, 'margin-top', 'sapUiLargeMarginTopBottom', '48px');
			fnTest.call(this, 'margin-bottom', 'sapUiLargeMarginTopBottom', '48px');

			//Test Single-sided margins
			fnTest.call(this, 'margin-top', 'sapUiTinyMarginTop', '8px');
			fnTest.call(this, 'margin-bottom', 'sapUiTinyMarginBottom', '8px');
			fnTest.call(this, 'margin-left', 'sapUiTinyMarginBegin', '8px', true);
			fnTest.call(this, 'margin-right', 'sapUiTinyMarginEnd', '8px', true);

			fnTest.call(this, 'margin-top', 'sapUiSmallMarginTop', '16px');
			fnTest.call(this, 'margin-bottom', 'sapUiSmallMarginBottom', '16px');
			fnTest.call(this, 'margin-left', 'sapUiSmallMarginBegin', '16px', true);
			fnTest.call(this, 'margin-right', 'sapUiSmallMarginEnd', '16px', true);

			fnTest.call(this, 'margin-top', 'sapUiMediumMarginTop', '32px');
			fnTest.call(this, 'margin-bottom', 'sapUiMediumMarginBottom', '32px');
			fnTest.call(this, 'margin-left', 'sapUiMediumMarginBegin', '32px', true);
			fnTest.call(this, 'margin-right', 'sapUiMediumMarginEnd', '32px', true);

			fnTest.call(this, 'margin-top', 'sapUiLargeMarginTop', '48px');
			fnTest.call(this, 'margin-bottom', 'sapUiLargeMarginBottom', '48px');
			fnTest.call(this, 'margin-left', 'sapUiLargeMarginBegin', '48px', true);
			fnTest.call(this, 'margin-right', 'sapUiLargeMarginEnd', '48px', true);

			//Test No Margins: add margin classes AND use our No Margins at the same time:
			//the No Margins classes should be stronger
			fnTest.call(this, 'margin', 'sapUiLargeMargin sapUiNoMargin', '0px');
			fnTest.call(this, 'margin-right', 'sapUiLargeMargin sapUiNoMarginEnd', '0px');
			fnTest.call(this, 'margin-top', 'sapUiLargeMargin sapUiNoMarginTop sapUiNoMarginBottom', '0px');
			fnTest.call(this, 'margin-bottom', 'sapUiNoMarginTop sapUiNoMarginBottom sapUiLargeMargin', '0px');
		} else {
			//Write a comment into the test protocol that static
			//tests can not be executed.
			assert.ok(true, "Static test not available yet for browser '" + Device.browser.name + "'");
		}
	});
});