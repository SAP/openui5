/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Button",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool"
], function(qutils, createAndAppendDiv, Button, Control, IconPool) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);


	var b1, b2, msg;

	var sText = "Hello",
	sTooltip = "abc",
	sWidth = "111px",
	sIcon = "test-resources/sap/ui/commons/images/help.gif",
	sHelpId = "12345",
	sPressMessage = "Button Pressed Event!",
	bEnabled = false,
	bVisible = true,
	bIconFirst = false;

	function pressEventHandler1() {
		throw sPressMessage + " - Exception";
	}

	function pressEventHandler2() {
		msg = sPressMessage;
	}

	var aEvents = [];
	function pressEventHandler3(oEvent, oData) {
		QUnit.config.current.assert.ok(oEvent != null, "event should not be null");
		QUnit.config.current.assert.ok(oData != null, "additional event data should not be null");
		aEvents.push({event: oEvent, addData: oData});
	}
	var listener = {
			listen: pressEventHandler3
		};

	var oButton1 = new Button("b1");
	oButton1.setText(sText);
	oButton1.setWidth(sWidth);
	oButton1.setEnabled(!bEnabled);
	oButton1.setVisible(bVisible);
	oButton1.setTooltip(sTooltip);
	oButton1.setIconFirst(bIconFirst);
	oButton1.setIcon(sIcon);
	oButton1.setHelpId(sHelpId);
	oButton1.attachPress(pressEventHandler1);
	oButton1.placeAt("uiArea1");

	var oButton2 = new Button("b2", {
		text : sText,
		width : sWidth,
		enabled : bEnabled,
		visible : bVisible,
		tooltip : sTooltip,
		iconFirst : !bIconFirst,
		icon : sIcon,
		helpId : sHelpId,
		press : pressEventHandler2
	});
	oButton2.placeAt("uiArea2");

	// Due to not having the 'init3rd' option for constructors anymore, this is not relevant!
	var oButton3 = new Button("b3", pressEventHandler2);
	oButton3.placeAt("uiArea3");

	// button for advanced event handler tests
	var oButton4 = new Button("b4", {text : sText});
	oButton4.placeAt("uiArea4");

	// button for advanced event handler tests, using initialization parameters
	var oButton5 = new Button("b5", {text : sText, press: [{my: "TestdataFromConstructor"}, listener.listen, listener]});
	oButton5.placeAt("uiArea5");


	QUnit.module("SAPUI5 Button - test property accessor methods", {
		beforeEach: function() {
			b1 = sap.ui.getCore().getControl("b1");
			b2 = sap.ui.getCore().getControl("b2");
		},
		afterEach: function() {
			b1 = null;
			b2 = null;
		}
	 });
	QUnit.test("TextOk", function(assert) {
	   b1.detachPress(pressEventHandler1);
	   jQuery("#b1").trigger("focus").trigger("click").trigger("mousedown").trigger("mouseup").trigger("mouseleave").trigger("blur");
	   b1.attachPress(pressEventHandler1);
	   jQuery("#b2").trigger("focus").trigger("click").trigger("mousedown").trigger("mouseup").trigger("mouseleave").trigger("blur");

	   assert.equal(b1.getText(),sText,"Text for button1 is correct using 'equals()'!");
	   assert.equal(b2.getText(),sText,"Text for button2 is correct using 'equals()'!");
	});
	QUnit.test("WidthOk", function(assert) {
	   assert.equal(b1.getWidth(),sWidth,"Width for button1 is correct using 'equals()'!");
	   assert.equal(b2.getWidth(),sWidth,"Width for button2 is correct using 'equals()'!");
	});
	QUnit.test("EnabledOk", function(assert) {
		   assert.equal(b1.getEnabled(),true,"Enabled state for button1 is correct using 'equals()'!");
		   assert.equal(b2.getEnabled(),false,"Enabled state for button2 is correct using 'equals()'!");
		});
	QUnit.test("VisibleOk", function(assert) {
	  assert.equal(b1.getVisible(),true,"Visible state for button1 is correct using 'equals()'!");
	  assert.equal(b2.getVisible(),true,"Visible state for button2 is correct using 'equals()'!");
   });
	QUnit.test("TooltipOk", function(assert) {
	   assert.equal(b1.getTooltip(),sTooltip,"Tooltip state for button1 is correct using 'equals()'!");
	   assert.equal(b2.getTooltip(),sTooltip,"Tooltip state for button2 is correct using 'equals()'!");
	});
	QUnit.test("IconFirstOk", function(assert) {
	   assert.equal(b1.getIconFirst(),false,"IconFirst state for button1 is correct using 'equals()'!");
	   assert.equal(b2.getIconFirst(),true,"IconFirst state for button2 is correct using 'equals()'!");
	});
	QUnit.test("IconOk", function(assert) {
	   assert.equal(b1.getIcon(),sIcon,"Icon for button1 is correct using 'equals()'!");
	   assert.equal(b2.getIcon(),sIcon,"Icon for button2 is correct using 'equals()'!");
	});
	QUnit.test("HelpIdOk", function(assert) {
	   assert.equal(b1.getHelpId(),sHelpId,"HelpId for button1 is correct using 'equals()'!");
	   assert.equal(b2.getHelpId(),sHelpId,"HelpId for button2 is correct using 'equals()'!");
	});

	QUnit.module("SAPUI5 Button - test event handlers", {
		beforeEach: function() {
			b1 = sap.ui.getCore().getControl("b1");
			b2 = sap.ui.getCore().getControl("b2");
		},
		afterEach: function() {
			b1 = null;
			b2 = null;
		}
	 });
	QUnit.test("PressOk", function(assert) {
	   try {
		   b1.firePress();
		   assert.ok(false,"Exception should have been thrown!");
	   } catch (e) {
		   assert.ok(e == sPressMessage + " - Exception","Exception was thrown correctly!");
		   assert.equal(e,sPressMessage + " - Exception","Exception was thrown correctly!");
	   }
	   b2.firePress();
	   assert.ok(msg == sPressMessage,"Event was fired correctly!");
	   assert.equal(msg,sPressMessage,"Event was fired correctly!!");
   });

	QUnit.test("Press event should not be fired when the button is set to invisible", function(assert) {
		// Arrange
		var oRenderSpy;

		// System under Test
		var oButton = sap.ui.getCore().getControl("b1");

		oRenderSpy = this.spy(oButton, "firePress");

		// Act
		oButton.setVisible(false);
		oButton.onclick({ preventDefault:  jQuery.noop, stopPropagation:  jQuery.noop });

		// Assert
		assert.strictEqual(oRenderSpy.callCount, 0, "Press event not fired");

		// Cleanup
		oButton.setVisible(true);
	});

	QUnit.test("PressDetachOk", function (assert) {
		   b1.detachPress(pressEventHandler1);
		   try {
			   b1.firePress();
			   assert.ok(true,"No event and thus no exception should be triggered!");
			   assert.equal(!sPressMessage,false,"No event and thus no exception should be triggered!");
		   } catch (e) {
			   assert.ok(e != sPressMessage + " - Exception","Exception shouldn't have been thrown!");
			   assert.equal(e,!sPressMessage,"Exception shouldn't have been thrown!");
		   }
		   // cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		   b1.attachPress(pressEventHandler1);
	   });

	QUnit.module("SAPUI5 Button - test methods", {
		beforeEach: function() {
			b1 = sap.ui.getCore().getControl("b1");
			b2 = sap.ui.getCore().getControl("b2");
		},
		afterEach: function() {
			b1 = null;
			b2 = null;
		}
	 });

	QUnit.test("MetadataOk", function(assert) {
		var oMetadata = b1.getMetadata();
		assert.ok(oMetadata != null,"b1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent() != null,"b1.getMetadata().getParent() should not be null");
		assert.ok(Control.getMetadata() == oMetadata.getParent(), "");
		assert.ok(oMetadata.getProperties()["text"]["type"] == "string" ,"Text type is 'string'!");
		assert.equal(oMetadata.getProperties()["text"]["type"],"string" ,"Text type is 'string'!");
		assert.ok(oMetadata.getAggregations().richTooltip != "undefined","Richtooltip is not 'null'");
		assert.equal(oMetadata.getAggregations().richTooltip ==  "undefined",false,"Richtooltip is not 'null'");
		var oAssociations = oMetadata.getAssociations();
		assert.strictEqual(oAssociations["ariaDescribedBy"]["type"], "sap.ui.core.Control", "ariaDescribedBy type");
		assert.ok(oAssociations["ariaDescribedBy"]["multiple"], "ariaDescribedBy multiple");
		assert.strictEqual(oAssociations["ariaLabelledBy"]["type"], "sap.ui.core.Control", "ariaLabelledBy type");
		assert.ok(oAssociations["ariaLabelledBy"]["multiple"], "ariaLabelledBy multiple");
	});

	QUnit.test("OffsetWidthOk", function(assert) {
		//test the pixel perfect width of the control
		var oDomRef = window.document.getElementById("b1");
		assert.ok(parseInt(b1.getWidth()) == oDomRef.offsetWidth,"b1.offsetWidth == parseInt(b1.getWidth())");
		assert.equal(oDomRef.offsetWidth,parseInt(b1.getWidth()),"b1.offsetWidth == parseInt(b1.getWidth())");
		b2.setWidth("500px");
		sap.ui.getCore().applyChanges();
		oDomRef = window.document.getElementById("b2");
		assert.ok(parseInt(oDomRef.offsetWidth) == 500,"b2.offsetWidth == 500)");
		assert.equal(parseInt(oDomRef.offsetWidth),500,"b2.offsetWidth == 500");
	});

	QUnit.test("eventWithAdditionalDataOk", function(assert){
		var oBtn = sap.ui.getCore().byId("b4");
		aEvents = [];
		oBtn.attachPress({my: "Testdata1"}, listener.listen);
		oBtn.focus();
		qutils.triggerEvent("click", oBtn.getId());
		assert.equal(aEvents.length, 1, "there should be one event in the log");
		oBtn.detachPress(listener.listen);
		aEvents = [];
		oBtn.attachPress({my: "Testdata2"}, listener.listen, listener);
		oBtn.focus();
		qutils.triggerEvent("click", oBtn.getId());
		assert.equal(aEvents.length, 1, "there should be one event in the log");
		oBtn.detachPress(listener.listen, listener);
	});

	QUnit.test("eventWithAdditionalDataInitViaConstructorOk", function(assert){
		// and now ensure also the event handler attachment via constructor works
		var oBtn = sap.ui.getCore().byId("b5");
		aEvents = [];
		oBtn.focus();
		qutils.triggerEvent("click", oBtn.getId());
		assert.equal(aEvents.length, 1, "there should be one event in the log");
	});
	QUnit.test("Button's tooltip is preserved when there is icon only", function(assert) {
		var sTooltip = "My tooltip",
			oButton = new Button("btnTooltipWithIconOnly", {
			icon : "sap-icon://undo",
			tooltip: sTooltip
		});
		oButton.placeAt("uiArea5");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#btnTooltipWithIconOnly").attr("title"), sTooltip, "Tooltip should be preserved");

		var $IconSpan = jQuery("#btnTooltipWithIconOnly>span");
		assert.strictEqual($IconSpan.attr("aria-label"), undefined, "aria-label shouldn't exist");
		assert.strictEqual($IconSpan.attr("title"), undefined, "The sap icon should not have tooltip");
		assert.equal($IconSpan.attr("aria-hidden"), "true", "The icon should be hidden for the assistive technology");
		oButton.destroy();
	});

	QUnit.test("When there's an icon and no tooltip set, the technical name of the icon is set as a tooltip", function(assert) {
		var oButton = new Button("btnDeleteIcon", {
			icon : "sap-icon://delete"
		});
		oButton.placeAt("uiArea5");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#btnDeleteIcon").attr("title"), IconPool.getIconInfo(oButton.getIcon()).name,
				"Tooltip is set to the icon's technical name");

		oButton.destroy();
	});
});