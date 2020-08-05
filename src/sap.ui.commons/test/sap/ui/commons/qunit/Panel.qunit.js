/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/RenderManager",
	"sap/ui/commons/Panel",
	"sap/ui/commons/ListBox",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Title",
	"sap/ui/commons/Title",
	"sap/ui/commons/Button",
	"sap/ui/Device",
	"sap/ui/commons/library",
	"sap/ui/commons/layout/VerticalLayout"
], function(
	createAndAppendDiv,
	coreLibrary,
	Element,
	HTML,
	RenderManager,
	Panel,
	ListBox,
	jQuery,
	CoreTitle,
	Title,
	Button,
	Device,
	commonsLibrary,
	VerticalLayout
) {
	"use strict";

	// shortcut for sap.ui.commons.enums.BorderDesign
	var BorderDesign = commonsLibrary.enums.BorderDesign;

	// shortcut for sap.ui.commons.enums.AreaDesign
	var AreaDesign = commonsLibrary.enums.AreaDesign;

	// shortcut for sap.ui.core.Scrolling
	var Scrolling = coreLibrary.Scrolling;

	// prepare DOM
	createAndAppendDiv("uiArea1");



	var sWidth = "500px",
		sHeight = "400px",
		oVerticalScrolling = Scrolling.Hidden,
		oHorizontalScrolling = Scrolling.Auto,
		bEnabled = true,
		bVisible = true,
		sScrollLeft = 10,
		sScrollTop = 20;

	var oCtrl = new Panel("Panel", {
		width:sWidth,
		height:sHeight,
		verticalScrolling:oVerticalScrolling,
		horizontalScrolling:oHorizontalScrolling,
		enabled:bEnabled,
		visible:bVisible,
		scrollLeft:sScrollLeft,
		scrollTop:sScrollTop
	});

	var oContent = new ListBox("l1", {
		width:"1000px",
		height:"1000px"
	});
	oCtrl.addContent(oContent);
	oCtrl.placeAt("uiArea1");

	QUnit.test("Initial Check", function(assert) {
		assert.ok(oCtrl, "Panel should exist after creating");

		var oDomRef = document.getElementById("Panel");
		assert.ok(oDomRef, "Panel div should exist");
	});


	QUnit.test("Scroll Left", function(assert) {
		assert.expect(6);
		assert.equal(oCtrl.getScrollLeft(), sScrollLeft, "scrollLeft should be like it was initially set");

		oCtrl.setScrollLeft(111);
		assert.equal(oCtrl.getScrollLeft(), 111, "scrollLeft should be like it was changed");

		var oDomRef = oCtrl.getDomRef("cont");
		assert.equal(oDomRef.scrollLeft, 111, "the container should be scrolled from the left by the set amount");

		oDomRef.scrollLeft = 87; // simulate scrollbar move
		assert.equal(oCtrl.getScrollLeft(), 87, "the container should be scrolled from the left by the set amount");

		oCtrl.setScrollLeft(sScrollLeft);
		assert.equal(oCtrl.getScrollLeft(), sScrollLeft, "scrollLeft should be like it was changed");
		oDomRef = oCtrl.getDomRef("cont");
		assert.equal(oDomRef.scrollLeft, sScrollLeft, "the container should be scrolled from the left by the set amount");
	});


	QUnit.test("Scroll Top", function(assert) {
		assert.expect(6);
		assert.equal(oCtrl.getScrollTop(), sScrollTop, "scrollTop should be like it was initially set");

		oCtrl.setScrollTop(111);
		assert.equal(oCtrl.getScrollTop(), 111, "scrollTop should be like it was changed");

		var oDomRef = oCtrl.getDomRef("cont");
		assert.equal(oDomRef.scrollTop, 111, "the container should be scrolled from the top by the set amount");

		oDomRef.scrollTop = 87; // simulate scrollbar move
		assert.equal(oCtrl.getScrollTop(), 87, "the container should be scrolled from the top by the set amount");

		oCtrl.setScrollTop(sScrollTop);
		assert.equal(oCtrl.getScrollTop(), sScrollTop, "scrollTop should be like it was changed");
		oDomRef = oCtrl.getDomRef("cont");
		assert.equal(oDomRef.scrollTop, sScrollTop, "the container should be scrolled from the top by the set amount");

		oContent.setWidth("100px");
		oContent.setHeight("200px");
		sap.ui.getCore().applyChanges();
	});


	// ==================================================
	//          test control methods
	// ==================================================

	/**
	 * Tests method setDimension of control Panel.
	 */
	QUnit.test("setDimensions", function(assert) {
		oCtrl.setDimensions("399px", "123px");
		sap.ui.getCore().applyChanges();
		assert.equal(oCtrl.getWidth(), "399px", "programmatic panel width should match the settings");
		assert.equal(oCtrl.getHeight(), "123px", "programmatic panel height should match the settings");

		var $DomRef = oCtrl.$();
		assert.equal($DomRef.outerWidth(), 399, "actual panel width should match the settings");
		assert.equal($DomRef.outerHeight(), 123, "actual panel height should match the settings");

		oCtrl.setDimensions(sWidth, sHeight);
		sap.ui.getCore().applyChanges();
		$DomRef = oCtrl.$();
		assert.equal($DomRef.outerWidth(), 500, "actual panel width should match the settings");
		assert.equal($DomRef.outerHeight(), 400, "actual panel height should match the settings");
	});

	QUnit.test("setCollapsed API", function (assert) {
		var panel = new Panel();

		assert.strictEqual(panel.getCollapsed(), false, "the panel should be expanded by default");

		panel.setCollapsed(true);

		assert.strictEqual(panel.getCollapsed(), true, "panel should be collapsible through API");

		panel.destroy();
		panel = null;
	});

	/**
	 * Test the changed DOM when dis-/enabling
	 */
	QUnit.test("DOM setCollapsed=true", function (assert) {
		var panel = new Panel().placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().hasClass("sapUiPanelColl"), false,
			"panel should NOT have sapUiPanelColl class by default");

		panel.setCollapsed(true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().hasClass("sapUiPanelColl"), true,
			"panel should have sapUiPanelColl class when collapsed through API");

		panel.destroy();
		panel = null;
	});

	QUnit.test("DOM setCollapsed=false", function (assert) {
		var panel = new Panel({
			collapsed: true
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().hasClass("sapUiPanelColl"), true,
			"panel should have sapUiPanelColl class when collapsed is set in constructor");

		panel.setCollapsed(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().hasClass("sapUiPanelColl"), false,
			"panel should NOT have sapUiPanelColl class when expanded through API");

		panel.destroy();
		panel = null;
	});

	QUnit.test("Enabled DOM", function(assert) {
		assert.expect(3);

		// first check the DOM / CSS classes of the enabled Panel
		var oDomRef = oCtrl.getDomRef();
		assert.equal(oDomRef.className.indexOf("sapUiPanelDis"), -1, "enabled Panel must not have the 'sapUiPanelDis' class");

		// disable the Panel
		oCtrl.setEnabled(false);
		var oDomRef2 = oCtrl.getDomRef();
		assert.ok(oDomRef2.className.indexOf("sapUiPanelDis") != -1, "disabled Panel must have the 'sapUiPanelDis' class");

		// re-enable the Panel
		oCtrl.setEnabled(true);
		var oDomRef3 = oCtrl.getDomRef();
		assert.equal(oDomRef3.className.indexOf("sapUiPanelDis"), -1, "enabled Panel must not have the 'sapUiPanelDis' class");
	});


	QUnit.test("Title Text", function(assert) {
		oCtrl.setTitle(new CoreTitle({text:"My Title"}));
		sap.ui.getCore().applyChanges();
		var oTitleDomRef = oCtrl.getDomRef("title");
		assert.equal(oTitleDomRef.innerHTML, "My Title", "title text must be 'My Title'");
		assert.equal(oCtrl.$("ico").length, 0, "icon may not be rendered, when not set");
	});


	QUnit.test("Title Icon", function(assert) {
		oCtrl.setTitle(new Title({text:"My New Title",icon:"rss-14x14.gif"})); /* use commons Title to test backward compatibility after moving Title to core */
		sap.ui.getCore().applyChanges();
		var oTitleDomRef = oCtrl.getDomRef("title");
		assert.equal(oTitleDomRef.innerHTML, "My New Title", "title text must be 'My New Title'");
		var $ico = oCtrl.$("ico");
		assert.equal($ico.length, 1, "icon must be rendered, when set");
		assert.equal($ico.attr("src"), "rss-14x14.gif", "icon URL must be 'rss-14x14.gif'.");
	});


	QUnit.test("Toolbar", function(assert) {
		assert.equal(oCtrl.$("tb").length, 0, "toolbar may not be rendered, when not set");

		// add Button to Toolbar
		oCtrl.addButton(new Button({text:"My Button",icon:"rss-14x14.gif"}));
		sap.ui.getCore().applyChanges();

		var $tb = oCtrl.$("tb");
		assert.equal($tb.length, 1, "toolbar must be rendered, when a button is added");
		assert.equal($tb.children().length, 1, "toolbar button must be rendered, when added");
	});

	QUnit.test("Toolbar Resizing behavior", function(assert) {
		var done = assert.async();
		// measure initial toolbar height
		var $tb = oCtrl.$("tb");
		var height = $tb.height();
		assert.ok(height > 18 && height < 30, "toolbar with one button should have a certain, reasonable height (between 18 and 30 px) - current height is: " + height);

		// add Buttons to Toolbar to cause wrapping
		oCtrl.addButton(new Button({text:"My second Button with a longer title"}));
		oCtrl.addButton(new Button({text:"My third Button with a longer title"}));
		sap.ui.getCore().applyChanges();

		$tb = oCtrl.$("tb");
		var newHeight = $tb.height();
		assert.ok(newHeight > height, "toolbar with three buttons should due to wrapping be taller than with one button only (current height: " + newHeight + ", previous height: " + height + ")");
		assert.ok(newHeight > 40 && newHeight < 60, "toolbar with three buttons should have a certain, reasonable height (between 40 and 60 px) - current height is: " + newHeight);

		// make the Panel smaller to cause additional wrapping
		oCtrl.setWidth("300px");
		// sap.ui.getCore().applyChanges();  not required, Panel should do it synchronously

		setTimeout(function() {
			var $hdr = oCtrl.$("hdr");
			var headerHeight = $hdr.outerHeight();
			$tb = oCtrl.$("tb");
			var newHeight2 = $tb.height();
			assert.ok(newHeight2 > newHeight, "toolbar with three buttons when made smaller should due to wrapping be taller than before (current height: " + newHeight2 + ", previous height: " + newHeight + ")");

			assert.ok(newHeight2 > 60 && newHeight2 < 85, "toolbar with three buttons should have a certain, reasonable height (between 60 and 85 px) - current height is: " + newHeight2);

			// ensure the toolbar fits into the Panel Header
			assert.ok(headerHeight > newHeight2, "toolbar must be smaller or equal in height compared wih the header (toolbar height: " + newHeight2 + ", header height: " + headerHeight + ")");

			// ensure the Panel has the original size
			var $panel = oCtrl.$();
			assert.equal($panel.outerHeight(), 400, "Panel should despite a taller header still have the original size");

			done();
		}, 500);

	});



	QUnit.test("Content Height Adaptation", function(assert) {
		var done = assert.async();
		assert.expect(1);
		setTimeout(function() {
			// ensure the content starts right below the header
			var $hdr = oCtrl.$("hdr");
			var headerHeight = $hdr.outerHeight();
			var $cont = oCtrl.$("cont");
			assert.equal($cont.css("top"), headerHeight + "px", "Panel content should be postioned exactly below the header");
			done();
		}, 500);
	});



	QUnit.test("Area Design", function(assert) {
		var oRootDomRef = oCtrl.getDomRef();
		var oContDomRef = oCtrl.getDomRef("cont");

		// make sure the initial design is "Fill"
		assert.ok(oRootDomRef.className.indexOf("sapUiPanelAreaDesignFill") > -1, "Panel must by default have AreaDesign.Fill");
		assert.equal(oRootDomRef.className.indexOf("sapUiPanelAreaDesignPlain"), -1, "Panel must by default not have AreaDesign.Plain");

		// make sure it is actually filled
		var sColor = jQuery(oContDomRef).css("backgroundColor");
		if (Device.browser.internet_explorer && (!document.documentMode || document.documentMode < 9)) {
			assert.ok(sColor === "#f2f2f2", "Panel must by default be filled with a white color (Actual: " + sColor + ")");
		} else {
			assert.equal(sColor, "rgba(255, 255, 255, 0.8)",	"Panel must by default be filled with a white color");
		}

		// now switch to "Plain" and do the same tests
		oCtrl.setAreaDesign(AreaDesign.Plain);
		sap.ui.getCore().applyChanges();
		var oRootDomRef2 = oCtrl.getDomRef();
		var oContDomRef2 = oCtrl.getDomRef("cont");

		assert.ok(oRootDomRef2.className.indexOf("sapUiPanelAreaDesignPlain") > -1, "Panel should now have AreaDesign.Plain");
		assert.equal(oRootDomRef2.className.indexOf("sapUiPanelAreaDesignFill"), -1, "Panel must not anymore have AreaDesign.Fill");
		sColor = jQuery(oContDomRef2).css("backgroundColor");
		if (Device.browser.internet_explorer && (!document.documentMode || document.documentMode < 9)) {
			assert.ok(sColor === "white" || sColor === "#ffffff", "Panel should now be filled with a white color (Actual: " + sColor + ")");
		} else {
			assert.equal(sColor, "rgb(255, 255, 255)", "Panel should now be filled with a white color");
		}

		// now switch to "transparent" and do the same tests
		oCtrl.setAreaDesign(AreaDesign.Transparent);
		sap.ui.getCore().applyChanges();
		var oRootDomRef3 = oCtrl.getDomRef();

		assert.ok(oRootDomRef3.className.indexOf("sapUiPanelAreaDesignTransparent") > -1, "Panel should now have AreaDesign.Transparent");
		assert.equal(oRootDomRef3.className.indexOf("sapUiPanelAreaDesignPlain"), -1, "Panel must not anymore have AreaDesign.Plain");
	});

	QUnit.test("Border Design", function(assert) {
		var oRootDomRef = oCtrl.getDomRef();

		// make sure the initial design is "Box"
		assert.ok(oRootDomRef.className.indexOf("sapUiPanelBorderDesignBox") > -1, "Panel must by default have BorderDesign.Box");
		assert.equal(oRootDomRef.className.indexOf("sapUiPanelBorderDesignNone"), -1, "Panel must by default not have BorderDesign.None");

		// make sure it is actually boxed
		assert.equal(jQuery(oRootDomRef).css("borderLeftStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef).css("borderRightStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef).css("borderTopStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef).css("borderBottomStyle"), "none", "Panel content must not have a border");

		// now switch to "Plain" and do the same tests
		oCtrl.setBorderDesign(BorderDesign.None);
		sap.ui.getCore().applyChanges();
		var oRootDomRef2 = oCtrl.getDomRef();

		assert.ok(oRootDomRef2.className.indexOf("sapUiPanelBorderDesignNone") > -1, "Panel must now have BorderDesign.None");
		assert.equal(oRootDomRef2.className.indexOf("sapUiPanelBorderDesignBox"), -1, "Panel must not anymore have BorderDesign.Box");
		assert.equal(jQuery(oRootDomRef2).css("borderLeftStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef2).css("borderRightStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef2).css("borderTopStyle"), "none", "Panel content must not have a border");
		assert.equal(jQuery(oRootDomRef2).css("borderBottomStyle"), "none", "Panel content must not have a border");
	});

	/**
	 * Test the content padding
	 */
	QUnit.test("Content Padding", function(assert) {
		assert.expect(4);
		var $ContDomRef = oCtrl.$("cont");

		// test initial padding
		assert.equal($ContDomRef.css("paddingLeft"), "6px", "Panel content must have left padding");
		assert.equal($ContDomRef.css("paddingBottom"), "6px", "Panel content must have bottom padding");

		oCtrl.setApplyContentPadding(false);
		assert.equal($ContDomRef.css("paddingLeft"), "0px", "Panel content must not have left padding");
		assert.equal($ContDomRef.css("paddingBottom"), "0px", "Panel content must not have bottom padding");

		// reset, so it looks ok in the end and the ListBox is not mistaken as Panel container which is too small
		oCtrl.setBorderDesign(BorderDesign.Box);
   });

	QUnit.test("Clone", function(assert) {
		oCtrl.setTitle(null);
		var n = Element.registry.size;
		var oClone1 = oCtrl.clone("-0");
		assert.ok(n < Element.registry.size, "Clone 1 created");
		oClone1.setText("Some Title");
		oClone1.setTitle(new CoreTitle({text:"Some other Title"}));
		oClone1.destroy();
		assert.equal(Element.registry.size, n, "Clone 1 destroyed");
		var oClone2 = oCtrl.clone("-0");
		assert.ok(n < Element.registry.size, "Clone 2 created");
		oClone2.destroy();
		assert.equal(Element.registry.size, n, "Clone 2 destroyed");
	});

	QUnit.test("Preserved Content & Collapse", function(assert) {
		var oHtml1 = new HTML({content: "<div></div>"}),
			oHtml2 = new HTML({content: "<div></div>"}),
			oPanel = new Panel({
			content: [
				oHtml1,
				new VerticalLayout({content: [oHtml2]})
			]
		});

		// initial rendering
		oPanel.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()));
		assert.equal(oHtml1.$().children().length, 0);
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()));
		assert.equal(oHtml2.$().children().length, 0);

		// act: modify dynamically
		oHtml1.$().append("<span/>"); // do some modification so that preserved content differs from static content
		oHtml1.$().append("<span/>");
		oHtml2.$().append("<span/>"); // do some modification so that preserved content differs from static content
		oHtml2.$().append("<span/>");
		oHtml2.$().append("<span/>");

		// assert: modifications
		assert.equal(oHtml1.$().children().length, 2);
		assert.equal(oHtml2.$().children().length, 3);

		// act: collapse
		oPanel.setCollapsed(true);
		oPanel.invalidate(); // enforce rerendering
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oHtml1.getDomRef() && RenderManager.isPreservedContent(oHtml1.getDomRef()));
		assert.equal(oHtml1.$().children().length, 2);
		assert.ok(oHtml2.getDomRef() && RenderManager.isPreservedContent(oHtml2.getDomRef()));
		assert.equal(oHtml2.$().children().length, 3);

		// act: expand
		oPanel.setCollapsed(false);
		oPanel.invalidate(); // enforce rerendering
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()));
		assert.equal(oHtml1.$().children().length, 2);
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()));
		assert.equal(oHtml2.$().children().length, 3);

		// cleanup
		oPanel.destroy();
	});
});
