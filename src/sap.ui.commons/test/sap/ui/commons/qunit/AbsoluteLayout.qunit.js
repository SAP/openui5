/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/layout/AbsoluteLayout",
	"sap/ui/commons/layout/PositionContainer",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position" // jQuery.fn.position
], function(
	createAndAppendDiv,
	Control,
	jQuery,
	AbsoluteLayout,
	PositionContainer
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("class", "testUIArea");
	(function(){
		var elem = document.createElement("DIV");
		elem.setAttribute("id", "uiArea2");
		elem.setAttribute("class", "testUIArea");
		elem.setAttribute("style", "height:50px;");
		document.body.appendChild(elem);
	}());
	createAndAppendDiv("uiArea3").setAttribute("class", "testUIArea");
	createAndAppendDiv("uiArea4").setAttribute("class", "testUIArea");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"html, body {" +
		"	height: 100%;" +
		"}" +
		".testUIArea {" +
		"	height: 500px;" +
		"	position: relative;" +
		"	overflow: auto;" +
		"	border: 1px solid black;" +
		"}" +
		".testCtrl{" +
		"	width: 20px;" +
		"	height: 10px;" +
		"	display: inline-block;" +
		"}";
	document.head.appendChild(styleElement);


	function createControl(sName, bWithWidth, bWithHeight, sBgColor, sTag) {
		var properties = {};
		if ( bWithWidth ) {
			properties.width = {type : "sap.ui.core.CSSSize", group : "", defaultValue : null};
		}
		if ( bWithHeight ) {
			properties.height = {type : "sap.ui.core.CSSSize", group : "", defaultValue : null};
		}

		return Control.extend("test." + sName, {
			metadata: {
				properties: properties
			},
			sBgColor : sBgColor,
			sTag: sTag ? sTag : "div",
			renderer: function(rm, ctrl) {
				rm.write("<", ctrl.sTag);
				rm.writeControlData(ctrl);
				rm.addClass("testCtrl");
				rm.writeClasses();
				var style = "background-color:" + ctrl.sBgColor + ";";
				if (ctrl.getWidth && ctrl.getWidth()) {style = style + "width:" + ctrl.getWidth() + ";";}
				if (ctrl.getHeight && ctrl.getHeight()) {style = style + "height:" + ctrl.getHeight() + ";";}
				rm.writeAttribute("style", style);
				rm.write("></", ctrl.sTag, ">");
			}
		});
	}

	var NoWidthHeight = createControl("NoWidthHeight", false, false, "red");
	var WidthHeight   = createControl("WidthHeight", true, true, "green");
	var Input         = createControl("Input", true, false, "yellow", "input");
	var Button        = createControl("Button", true, false, "blue", "button");
	var TextArea      = createControl("TextArea", true, true, "gray", "textarea");
	var Image         = createControl("Image", true, true, "black", "img");

	var layout1 = new AbsoluteLayout("layout1");
	layout1.placeAt("uiArea1");
	layout1.addContent(new NoWidthHeight("test1")); //Defaults
	layout1.addContent(new NoWidthHeight("test2"), {top: "30px", left: "20px", right: "30px", bottom: "40px"});
	layout1.addContent(new NoWidthHeight("test3"), {right: "3px", bottom: "3px"});
	layout1.addContent(new NoWidthHeight("test4"), {right: "3px"});
	layout1.addContent(new NoWidthHeight("test5"), {bottom: "3px"});
	layout1.addContent(new WidthHeight("test6", {width: "40px", height: "20px"}), {top: "60px", left: "20px", right: "30px", bottom: "40px"});
	layout1.addContent(new WidthHeight("test7", {width: "40px", height: "auto"}), {top: "60px", left: "80px", right: "30px", bottom: "40px"});
	layout1.addContent(new WidthHeight("test8", {width: "auto", height: "20px"}), {top: "60px", left: "140px", right: "30px", bottom: "40px"});
	layout1.addContent(new WidthHeight("test9", {width: "auto", height: "auto"}), {top: "100px", left: "140px", right: "30px", bottom: "40px"});

	var layout2 = new AbsoluteLayout("layout2");
	layout2.placeAt("uiArea2");

	var layout3 = new AbsoluteLayout("layout3");
	layout3.placeAt("uiArea3");
	layout3.addContent(new Input("test10", {width: "auto"}), {top: "10px", left: "20px", right: "30px"});
	layout3.addContent(new Button("test11", {width: "auto"}), {top: "40px", left: "20px", right: "30px"});
	layout3.addContent(new TextArea("test12", {width: "auto", height: "auto"}), {top: "70px", left: "20px", right: "30px", bottom: "370px"});
	layout3.addContent(new Image("test13"), {top: "140px", left: "20px", right: "30px", bottom: "250px"});

	var layout4 = new AbsoluteLayout("layout4");
	layout4.placeAt("uiArea4");



	var checkControl = function(assert, sId, sExpWidth, sExpHeight, sExpLeft, sExpRight, sExpTop, sExpBottom) {
		var ctrl = jQuery("#" + sId);
		if (sExpWidth) { assert.equal(ctrl.width() + "", sExpWidth, "Check 'width' of child '" + sId + "':");}
		if (sExpHeight) { assert.equal(ctrl.height() + "", sExpHeight, "Check 'height' of child '" + sId + "':");}

		if (sExpLeft) { assert.equal(ctrl.parent().css("left"), sExpLeft + "px", "Check 'left' of child '" + sId + "':");}
		if (sExpRight) { assert.equal(ctrl.parent().css("right"), sExpRight + "px", "Check 'right' of child '" + sId + "':");}
		if (sExpTop) { assert.equal(ctrl.parent().css("top"), sExpTop + "px", "Check 'top' of child '" + sId + "':");}
		if (sExpBottom) { assert.equal(ctrl.parent().css("bottom"), sExpBottom + "px", "Check 'bottom' of child '" + sId + "':");}
	};

	var setupRerenderingCheck = function(assert) {
		layout4.destroyPositions();
		layout4.addPosition(new PositionContainer({top: "10px", left: "10px"}));
		layout4.addContent(new WidthHeight("test14"), {top: "5px", left: "5px"});
		sap.ui.getCore().applyChanges();
		layout4._originalRerender = layout4.rerender;
		layout4.rerender = function() {
			this._originalRerender.apply(this);
			assert.ok(false, "Rerender should never be called");
		};

		assert.equal(layout4.getContent().length, 2, "Initial # of children:");
		assert.equal(layout4.getContent()[0], null, "First child is undefined:");
		assert.equal(layout4.getContent()[1].getId(), "test14", "Id of second child:");
		checkControl(assert, "test14", null, null, "5", null, "5", null);

		var done = assert.async();
		setTimeout(function(){
			if (layout4._originalRerender) {
				layout4.rerender = layout4._originalRerender;
				layout4._originalRerender = undefined;
			}
			var oCtrl = sap.ui.getCore().byId("test14");
			if (oCtrl) {
				oCtrl.destroy();
			}
			done();
		}, 100);
	};



	QUnit.module("Control API");

	QUnit.test("Property Defaults", function(assert) {
		assert.equal(layout2.getVisible(), true, "Default 'visible':");
		assert.equal(layout2.getWidth(), "100%", "Default 'width':");
		assert.equal(layout2.getHeight(), "100%", "Default 'height':");
	});

	QUnit.test("Property Custom Values", function(assert) {
		layout2.setVisible(false);
		layout2.setWidth("300px");
		layout2.setHeight("20px");
		assert.equal(layout2.getVisible(), false, "Custom 'visible':");
		assert.equal(layout2.getWidth(), "300px", "Custom 'width':");
		assert.equal(layout2.getHeight(), "20px", "Custom 'height':");

		//Reset after test
		layout2.setVisible(true);
		layout2.setWidth(null);
		layout2.setHeight(null);
	});

	QUnit.test("placeAt", function(assert) {
		assert.equal(layout2.getContent().length, 0, "Default # of children:");
		var oControl = new NoWidthHeight();
		oControl.placeAt(layout2);
		assert.equal(layout2.getContent().length, 1, "# of children after placeAt:");
		layout2.removeAllContent();
		assert.equal(layout2.getContent().length, 0, "# of children after remove all:");
	});

	QUnit.test("Aggregation Content", function(assert) {
		assert.equal(layout2.getContent().length, 0, "Default # of children:");

		var oPos = {top: "60px", left: "20px", right: "30px", bottom: "40px"};
		layout2.addContent(new NoWidthHeight("aggCh1"), oPos);
		var child = new NoWidthHeight("aggCh3");
		layout2.insertContent(child, 0, oPos);
		var child2 = new WidthHeight("aggCh2", {width: "40px", height: "20px"});
		layout2.addContent(child2, oPos);

		assert.equal(layout2.getContent().length, 3, "# of children after add:");
		assert.equal(layout2.indexOfContent(child), 0, "Idx of child after add:");

		assert.equal(layout2.getPositionOfChild(child2).bottom, undefined, "Ignored bottom Position of child with height:");
		assert.equal(layout2.getPositionOfChild(child2).right, undefined, "Ignored right Position of child with width:");

		layout2.setPositionOfChild(child, {top: "0px"});

		assert.equal(layout2.getPositionOfChild(child).top, "0px", "Changed Position of child:");

		layout2.removeContent(0);

		assert.equal(layout2.getContent().length, 2, "# of children after remove:");
		assert.equal(layout2.indexOfContent(child), -1, "Idx of child after remove:");

		var bErrorThrown = false;
		try {
			layout2.addContent(new NoWidthHeight("aggCh4"), {top: "Karl-Otto"});
		} catch (e){
			bErrorThrown = true;
		}
		assert.ok(bErrorThrown, "Error thrown when given position attribute is no CSS size.");

		layout2.removeAllContent();

		assert.equal(layout2.getContent().length, 0, "# of children after remove all:");
	});


	QUnit.module("Rendering");

	QUnit.test("Visibility", function(assert) {
		var done = assert.async();
		assert.equal(jQuery("#layout2").length, 1, "Visible Control is rendered:");

		layout2.setVisible(false);
		layout2.rerender();
		setTimeout(function(){
			assert.equal(jQuery("#layout2").length, 0, "Invisible Control is not rendered:");

			//Reset
			layout2.setVisible(true);
			done();
		}, 100);
	});

	QUnit.test("Controls", function(assert) {
		checkControl(assert, "test1", "20", "10", "0", null, "0", null);
		checkControl(assert, "test2", "" + (jQuery("#layout1").width() - 50), "10", "20", null, "30", null);
		checkControl(assert, "test3", "20", "10", null, "3", null, "3");
		checkControl(assert, "test4", "20", "10", null, "3", "0", null);
		checkControl(assert, "test5", "20", "10", "0", null, null, "3");
		checkControl(assert, "test6", "40", "20", "20", null, "60", null);
		checkControl(assert, "test7", "40", "400"/*500-100*/, "80", null, "60", "40");
		checkControl(assert, "test8", "" + (jQuery("#layout1").width() - 170), "20", "140", "30", "60", null);
		checkControl(assert, "test9", "" + (jQuery("#layout1").width() - 170), "360"/*500-140*/, "140", "30", "100", "40");
	});

	QUnit.test("Stretching Form Controls", function(assert) {
		for (var i = 10; i < 14; i++){
			assert.ok(jQuery("#test" + i).width() > jQuery("#layout3").width() - 50 - 50/*left+right+some buffer*/, "Control test" + i + " is stretched: " + jQuery("#test" + i).width());
		}
	});

	QUnit.test("Suppressed Rerendering - Position changes", function(assert) {
		setupRerenderingCheck(assert);

		var oPosition = layout4.getPositions()[1];
		oPosition.setTop("10px");
		checkControl(assert, "test14", null, null, "5", null, "10", null);
		oPosition.setLeft("10px");
		checkControl(assert, "test14", null, null, "10", null, "10", null);
		oPosition.setRight("10px");
		checkControl(assert, "test14", null, null, "10", "10", "10", null);
		oPosition.setBottom("10px");
		checkControl(assert, "test14", null, null, "10", "10", "10", "10");

		layout4.setPositionOfChild(sap.ui.getCore().byId("test14"), {top: "20px", left: "20px", right: "20px", bottom: "20px"});
		checkControl(assert, "test14", null, null, "20", "20", "20", "20");

		var oControl = sap.ui.getCore().byId("test14");
		oControl.setWidth("200px");
		oControl.setHeight("100px");
		sap.ui.getCore().applyChanges();

		oPosition.setCenterHorizontally(true);
		var jContainer = jQuery(oPosition.getDomRef());
		assert.equal(jContainer.css("margin-left"), "-100px", "Margin of horizontally centered Position container:");
		assert.ok(Math.abs(jContainer.parent().width() / 2 - jContainer.position().left) <= 1, "Correct top position of horizontally centered Position container.");

		oPosition.setCenterVertically(true);
		assert.equal(jContainer.css("margin-top"), "-50px", "Margin of vertically centered Position container:");
		assert.ok(Math.abs(jContainer.parent().height() / 2 - jContainer.position().top) <= 1, "Correct top position of vertically centered Position container.");
	});

	QUnit.test("Suppressed Rerendering - Container.setControl", function(assert) {
		setupRerenderingCheck(assert);

		var oPosition = layout4.getPositions()[1];

		assert.equal(oPosition.$().length, 1, "Position container is in Dom before setControl(<someControl>)");
		oPosition.setControl(new WidthHeight("test14a"));
		assert.equal(oPosition.$().length, 1, "Position container is in Dom after setControl(<someControl>)");
		checkControl(assert, "test14a", null, null, "5", null, "5", null);

		oPosition = layout4.getPositions()[0];

		assert.equal(oPosition.$().length, 0, "Position container is not in Dom before setControl(null)");
		oPosition.setControl(null);
		assert.equal(oPosition.$().length, 0, "Position container is not in Dom after setControl(null)");

		assert.equal(oPosition.$().length, 0, "Position container is not in Dom before setControl(<someControl>)");
		oPosition.setControl(new WidthHeight("test14b"));
		assert.equal(oPosition.$().length, 1, "Position container is in Dom after setControl(<someControl>)");
		checkControl(assert, "test14b", null, null, "10", null, "10", null);
		assert.ok(layout4.$().children()[0] === oPosition.$()[0], "Position container was added at the right location.");

		oPosition = layout4.getPositions()[1];

		assert.equal(oPosition.$().length, 1, "Position container is in Dom before setControl(null)");
		oPosition.setControl(null);
		assert.equal(oPosition.$().length, 0, "Position container is not in Dom after setControl(null)");
	});

	QUnit.test("Suppressed Rerendering - Layout position aggregation", function(assert) {
		setupRerenderingCheck(assert);

		assert.equal(layout4.$().children().length, 1, "Initial # of containers in layout");
		layout4.removeAllPositions();
		assert.equal(layout4.$().children().length, 0, "# of containers in layout after removeAll");

		var oPosition = new PositionContainer({top: "5px", bottom: "5px"});
		layout4.addPosition(oPosition);
		assert.equal(layout4.$().children().length, 0, "# of containers in layout after addPosition with position without control");

		oPosition = new PositionContainer({top: "5px", bottom: "5px", control: new WidthHeight("test14c")});
		layout4.addPosition(oPosition);
		assert.equal(layout4.$().children().length, 1, "# of containers in layout after addPosition with position with control");
		checkControl(assert, "test14c", null, null, "0", null, "5", "5");

		oPosition = new PositionContainer({top: "10px", bottom: "10px", control: new WidthHeight("test14d")});
		layout4.addPosition(oPosition);
		assert.equal(layout4.$().children().length, 2, "# of containers in layout after addPosition with position with control");
		checkControl(assert, "test14d", null, null, "0", null, "10", "10");

		oPosition = new PositionContainer({top: "5px", bottom: "5px"});
		layout4.insertPosition(oPosition, 1);
		assert.equal(layout4.$().children().length, 2, "# of containers in layout after insertPosition with position without control");

		oPosition = new PositionContainer({top: "15px", bottom: "15px", control: new WidthHeight("test14e")});
		layout4.insertPosition(oPosition, 2);
		assert.equal(layout4.$().children().length, 3, "# of containers in layout after insertPosition with position with control");
		checkControl(assert, "test14e", null, null, "0", null, "15", "15");
		assert.ok(layout4.$().children()[0] === oPosition.$()[0], "Position container was added at the right location.");

		oPosition = new PositionContainer({top: "20px", bottom: "20px", control: new WidthHeight("test14f")});
		layout4.insertPosition(oPosition, 3);
		assert.equal(layout4.$().children().length, 4, "# of containers in layout after insertPosition with position with control");
		checkControl(assert, "test14f", null, null, "0", null, "20", "20");
		assert.ok(layout4.$().children()[1] === oPosition.$()[0], "Position container was added at the right location.");

		layout4.removePosition(1);
		assert.equal(layout4.$().children().length, 4, "# of containers in layout after removePosition of position without control");

		layout4.removePosition(2);
		assert.equal(layout4.$().children().length, 3, "# of containers in layout after removePosition of position with control");

		layout4.destroyPositions();
		assert.equal(layout4.$().children().length, 0, "# of containers in layout after destroyAll");
	});

	QUnit.test("Suppressed Rerendering - Layout attributes", function(assert) {
		setupRerenderingCheck(assert);

		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwXHidden"), "Horizontal Scrolling Mode 'Hidden' of the layout before setVerticalScrolling");
		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwYHidden"), "Vertical Scrolling Mode 'Hidden' of the layout before setVerticalScrolling");
		layout4.setVerticalScrolling("Scroll");
		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwXHidden"), "Horizontal Scrolling Mode 'Hidden' of the layout after setVerticalScrolling");
		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwYScroll"), "Vertical Scrolling Mode 'Scroll' of the layout after setVerticalScrolling");
		layout4.setHorizontalScrolling("Scroll");
		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwXScroll"), "Horizontal Scrolling Mode 'Scroll' of the layout after setHorizontalScrolling");
		assert.ok(layout4.$().hasClass("sapUiLayoutAbsOvrflwYScroll"), "Vertical Scrolling Mode 'Scroll' of the layout after setHorizontalScrolling");

		assert.equal(layout4.$().outerWidth() /* include scrollbar width */, jQuery("#uiArea4").width(), "Height of the layout before setWidth");
		assert.equal(layout4.$().outerHeight(), jQuery("#uiArea4").height(), "Height of the layout before setWidth");
		layout4.setWidth("100px");
		assert.equal(layout4.$().outerWidth(), "100", "Height of the layout after setWidth");
		assert.equal(layout4.$().outerHeight(), jQuery("#uiArea4").height(), "Height of the layout after setWidth");
		layout4.setHeight("100px");
		assert.equal(layout4.$().outerWidth(), "100", "Height of the layout after setHeight");
		assert.equal(layout4.$().outerHeight(), "100", "Height of the layout after setHeight");
	});

	QUnit.test("Center Positioning", function(assert) {
		var done = assert.async();
		layout4.setWidth(null);
		layout4.setHeight(null);
		layout4.setVerticalScrolling("Hidden");
		layout4.setHorizontalScrolling("Hidden");
		layout4.destroyPositions();
		var oControl = new WidthHeight("test15", {width: "200px", height:"100px"});
		layout4.addContent(oControl, {top: "5px", left: "5px"});
		sap.ui.getCore().applyChanges();
		var oPosition = layout4.getPositions()[0];
		var jContainer = jQuery(oPosition.getDomRef());

		checkControl(assert, "test15", "200", "100", "5", null, "5", null);

		oPosition.setCenterHorizontally(true);
		assert.equal(jContainer.css("margin-left"), "-100px", "Margin of horizontally centered Position container:");
		assert.ok(Math.abs(jContainer.parent().width() / 2 - jContainer.position().left) <= 1, "Correct top position of horizontally centered Position container.");

		oPosition.setCenterVertically(true);
		assert.equal(jContainer.css("margin-top"), "-50px", "Margin of vertically centered Position container:");
		assert.ok(Math.abs(jContainer.parent().height() / 2 - jContainer.position().top) <= 1, "Correct top position of vertically centered Position container.");

		oControl.setWidth("400px");
		oControl.setHeight("200px");

		setTimeout(function(){
			assert.equal(jContainer.css("margin-left"), "-200px", "Margin of horizontally centered Position container:");
			assert.ok(Math.abs(jContainer.parent().width() / 2 - jContainer.position().left) <= 1, "Correct top position of horizontally centered Position container.");

			assert.equal(jContainer.css("margin-top"), "-100px", "Margin of vertically centered Position container:");
			assert.ok(Math.abs(jContainer.parent().height() / 2 - jContainer.position().top) <= 1, "Correct top position of vertically centered Position container.");
			done();
		}, 1000);
	});
});
