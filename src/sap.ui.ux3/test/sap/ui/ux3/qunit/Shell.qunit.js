/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Button",
	"sap/ui/ux3/Shell",
	"sap/ui/thirdparty/jquery",
	"sap/ui/ux3/library",
	"sap/ui/ux3/NavigationItem",
	"sap/ui/core/Item",
	"sap/ui/ux3/ShellRenderer",
	"sap/ui/commons/ListBox",
	"sap/ui/ux3/ToolPopup",
	"sap/ui/core/RenderManager"
], function(
	qutils,
	createAndAppendDiv,
	Button,
	Shell,
	jQuery,
	ux3Library,
	NavigationItem,
	Item,
	ShellRenderer,
	ListBox,
	ToolPopup,
	RenderManager
) {
	"use strict";

	// shortcut for sap.ui.ux3.ShellDesignType
	var ShellDesignType = ux3Library.ShellDesignType;

	// shortcut for sap.ui.ux3.ShellHeaderType
	var ShellHeaderType = ux3Library.ShellHeaderType;

	// prepare DOM
	document.body.insertBefore(createAndAppendDiv("uiArea1"), document.body.firstChild);
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#myShell > .sapUiUx3ShellBg," +
		"#myShell > .sapUiUx3ShellBgImg {" +
		"	z-index: -10;" +
		"}" +
		".sapUiUx3ShellCanvasBackground#myShell-canvasBackground {" +
		"	z-index: -10;" +
		"}" +
		".sapUiUx3ShellCanvas#myShell-canvas {" +
		"	z-index: -9;" +
		"}" +
		"#myShell.CustomPadding .sapUiUx3ShellCanvas .sapUiUx3ShellContent {" +
		"	padding-left: 10px;" +
		"	padding-right: 10px;" +
		"	padding-top: 10px;" +
		"	padding-bottom: 10px;" +
		"}";
	document.head.appendChild(styleElement);



	var oShell;

	function worksetItemSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "This text means the event handler has been executed."); // this test tests by just being counted in the respective test
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, "wi_so", "Workset item 'wi_so' should be selected");
	}
	function paneBarItemSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "This text means the event handler has been executed."); // this test tests by just being counted in the respective test
		oShell.setPaneContent(new Button("paneContent", {text:"Pane Content"}));
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, "pb_people", "PaneBar item 'pb_people' should be selected");
	}
	function logoutEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "This text means the event handler has been executed."); // this test tests by just being counted in the respective test
	}
	function searchEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "This text means the event handler has been executed."); // this test tests by just being counted in the respective test
		var text = oEvent.getParameter("text");
		QUnit.config.current.assert.equal(text, "ABC", "Search text should be 'ABC'");
	}
	function feedSubmitEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "This text means the event handler has been executed."); // this test tests by just being counted in the respective test
		//var text = oEvent.getParameter("text");
		//assert.equal(text, "my feed entry", "Feed text should be 'my feed entry'");
	}


	QUnit.test("Render Basic Shell", function(assert) {
		oShell = new Shell("myShell", {showLogoutButton:false});
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		var jRef = oShell.$();
		assert.ok(jRef.length == 1, "Rendered Shell should exist in the page");
		assert.ok(jRef.hasClass("sapUiUx3Shell"), "Rendered Shell should have the class 'sapUiUx3Shell'");
		assert.ok(jRef.hasClass("sapUiUx3ShellHeadStandard"), "Rendered Shell should have the class 'sapUiUx3ShellHeadStandard'");
	});


	QUnit.test("Rendered Parts", function(assert) {
		assert.equal(jQuery(".sapUiUx3ShellHeader-logout").length, 0, "There should be no logout button");
		assert.equal(jQuery(".sapUiUx3ShellHeaderSep").length, 0, "There should be no header item separator");

		var oDomRef = oShell.getId() + "-tool-" + oShell.getId() + "-searchTool" ? window.document.getElementById(oShell.getId() + "-tool-" + oShell.getId() + "-searchTool") : null;
		assert.ok(oDomRef, "Search tool should exist in the page");
		oDomRef = oShell.getId() + "-tool-" + oShell.getId() + "-feederTool" ? window.document.getElementById(oShell.getId() + "-tool-" + oShell.getId() + "-feederTool") : null;
		assert.ok(oDomRef, "Feeder tool should exist in the page");

		assert.equal(jQuery(".sapUiUx3ShellToolPaletteArea").children().children().length, 3, "There should be two tools (plus an accessibility description)");

		assert.equal(jQuery(".sapUiUx3ShellToolSep").length, 0, "There should be no tool separator");

		assert.ok(window.document.getElementById("myShell-wsBar-list"), "Workset item navigation area should exist in the page");
		assert.equal(jQuery(document.getElementById("myShell-wsBar-list")).children().length, 2, "There should not be any workset items, just the arrow and the dummy");
	});

	QUnit.test("Timeout for _checkPaneBarOverflow cleared on destroy", function(assert) {
		// Arrange
		oShell.destroy();

		var oClearTimeoutSpy,
			iDelayCallId;

		oShell = new Shell("myShell");
		oShell.addPaneBarItem(new Item("pane_feed",{text:"Feed"}));
		oShell.addPaneBarItem(new Item("pane_news",{text:"News"}));
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		// Act
		oShell._checkPaneBarOverflow();

		oClearTimeoutSpy = sinon.spy(window, "clearTimeout");

		// Assert
		iDelayCallId = oShell._checkPaneBarOverflowDelayId;
		assert.ok(iDelayCallId, "Timeout for _checkPaneBarOverflow is created");

		// Act
		oShell.destroy();

		// Assert
		// due to Interaction handling a new Timeout was introduced. The cleartimeout gets catched by the spy as well
		assert.equal(oClearTimeoutSpy.callCount, 2, "Cleared delayedCall count is correct.");
		assert.equal(oClearTimeoutSpy.firstCall.args[0], iDelayCallId, "ClearTimeout is called with correct ID.");
		assert.ok(!oShell._checkPaneBarOverflowDelayId, "Timeout for _checkPaneBarOverflow was cleared after destroy");

		// Cleanup
		oClearTimeoutSpy.restore();
	});

	QUnit.test("Destroy and remove control", function(assert) {
		oShell.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = oShell.getId() ? window.document.getElementById(oShell.getId()) : null;
		assert.ok(!oDomRef, "Rendered Shell should not exist in the page after destruction");
	});


	QUnit.test("Content Padding / Full Height", function(assert) {
		oShell.destroy();
		oShell = new Shell("myShell");
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		if (jQuery("html").attr("data-sap-ui-browser") == "ie8"){
			assert.ok(true, "Checks skipped for IE8");
			return; //Skip check for IE8
		}

		function checkSettings(){
			var oSettings = oShell._settings;
			if (oSettings.customClass){
				oShell.addStyleClass(oSettings.customClass);
			}
			oShell.setFullHeightContent(oSettings.fullHeightContent);
			oShell.setApplyContentPadding(oSettings.enablePadding);

			var $canvas = jQuery(document.getElementById("myShell-canvas"));
			var $content = jQuery(document.getElementById("myShell-content"));

			if ($canvas.height() > 0){ //Skip check when test window too small
				if (oShell.getFullHeightContent()){
					assert.ok($content.height() > 0, "Height of Content when fullHeight==true");
				} else {
					assert.equal($content.height(), 0, "Height of Content when fullHeight==false");
				}
			}

			var iTop = oSettings.contentPadding ? oSettings.contentPadding.top : 0;
			var iBottom = oSettings.contentPadding ? oSettings.contentPadding.bottom : 0;
			var iLeft = oSettings.contentPadding ? oSettings.contentPadding.left : (oSettings.enablePadding ? 20 : 0); // eslint-disable-line no-nested-ternary
			var iRight = oSettings.contentPadding ? oSettings.contentPadding.right : (oSettings.enablePadding ? 20 : 0); // eslint-disable-line no-nested-ternary
			var pad;

			if (oShell.getFullHeightContent()){
				pad = $canvas.outerHeight() - $content.height();
			} else {
				pad = $content.outerHeight();
			}

			assert.equal(pad, iTop + iBottom,
					"Padding Top/Bottom of Canvas when padding enabled==" + oShell.getApplyContentPadding() + ", fullHeight==" + oShell.getFullHeightContent() + ", padding-top==" + iTop + ", padding-bottom==" + iBottom);

			pad = $canvas.outerWidth() - $content.width();
			assert.equal(pad, iLeft + iRight,
					"Padding Left/Right of Canvas when padding enabled==" + oShell.getApplyContentPadding() + ", fullHeight==" + oShell.getFullHeightContent() + ", padding-left==" + iLeft + ", padding-right==" + iRight);

			if (oSettings.customClass){
				oShell.removeStyleClass(oSettings.customClass);
			}
		}

		var oSetting0 = {fullHeightContent: false, enablePadding: true}; //Default
		var oSetting1 = {fullHeightContent: false, enablePadding: false}; //No default padding
		var oSetting2 = {fullHeightContent: false, contentPadding: {top: 10, left: 10, right: 10, bottom: 10}, customClass: "CustomPadding"}; //Custom padding

		oShell._settings = oSetting0;
		checkSettings();
		oShell._settings = oSetting1;
		checkSettings();
		oShell._settings = oSetting2;
		checkSettings();

		oSetting0.fullHeightContent = true;
		oSetting1.fullHeightContent = true;
		oSetting2.fullHeightContent = true;

		oShell._settings = oSetting0;
		checkSettings();
		oShell._settings = oSetting1;
		checkSettings();
		oShell._settings = oSetting2;
		checkSettings();
	});


	QUnit.test("HeaderTypes", function(assert) {
		oShell.destroy();
		oShell = new Shell("myShell", {
		});
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		var $Shell = oShell.$();
		for (var key in ShellHeaderType){
			oShell.setHeaderType(key);
			assert.ok($Shell.hasClass("sapUiUx3ShellHead" + key), "Shell with header type " + key + " should have the class 'sapUiUx3ShellHead" + key + "'");
		}
	});


	QUnit.test("Show / Hide Tools or Pane", function(assert) {
		oShell.destroy();
		oShell = new Shell("myShell", {
		});
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		var $canvas = jQuery(document.getElementById("myShell-canvas"));

		function check(sProp){
			var sVal = $canvas.css(sProp);
			return sVal == "0" || sVal == 0 || sVal == "0px";
		}

		assert.ok(!check("left"), "Tools are shown");
		oShell.setShowTools(false);
		assert.ok(check("left"), "Tools are not shown");

		assert.ok(!check("right"), "Pane Bar is shown");
		oShell.setShowPane(false);
		assert.ok(check("right"), "Pane Bar is not shown");
	});


	QUnit.test("Render Populated Shell", function(assert) {
		oShell.destroy();
		oShell = new Shell("myShell", {
	  appIcon:"http://www.sap.com/global/images/SAPLogo.gif", // put the SAP logo into the header
	  appTitle:"My First UX3 App",                 // give a title
	  showInspectorTool:false,
	  worksetItems:[                                          // add some items to the top navigation
		  new NavigationItem("wi_home",{text:"H",subItems:[  // the "Home" workcenter also gets three sub-items
			  new NavigationItem("wi_home_overview",{text:"Overview"}),
			  new NavigationItem("wi_home_inbox",{text:"Inbox"}),
			  new NavigationItem("wi_home_news",{text:"News"})
		  ]}),
		  new NavigationItem("wi_so",{text:"S"}),
		  new NavigationItem("wi_analyze",{text:"A"})
	  ],
	  paneBarItems:[  // add also one item to the right-side PaneBar
		  new Item("pb_people",{text:"People"})
	  ],
	  worksetItemSelected:worksetItemSelectedEventHandler,
	  paneBarItemSelected:paneBarItemSelectedEventHandler,
	  logout:logoutEventHandler,
	  search:searchEventHandler,
	  feedSubmit:feedSubmitEventHandler
	});
		oShell.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		var jRef = jQuery(document.getElementById(oShell.getId()));
		assert.ok(jRef.length == 1, "Rendered Shell should exist in the page");
		assert.ok(jRef.hasClass("sapUiUx3Shell"), "Rendered Shell should have the class 'sapUiUx3Shell'");
		assert.ok(jRef.hasClass("sapUiUx3ShellHeadStandard"), "Rendered Shell should have the class 'sapUiUx3ShellHeadStandard'");
	});


	QUnit.test("Advanced Content", function(assert) {
		var header = jQuery(".sapUiUx3ShellHeader")[0];
		assert.ok(header.innerHTML.indexOf("") > -1, "Application Title must be present");
		assert.equal(jQuery(document.getElementById(oShell.getId() + "-logoImg")).attr("src"), "http://www.sap.com/global/images/SAPLogo.gif", "Application Logo must be displayed");

		assert.equal(jQuery(".sapUiUx3ShellHeader-logout").length, 1, "There should be a logout button");
		assert.equal(jQuery(".sapUiUx3ShellHeaderSep").length, 0, "There should be no header item separator");

		var $wi = jQuery(document.getElementById(oShell.getId() + "-wsBar-list"));
		assert.equal($wi.length, 1, "WorksetItem holder should exist");
		assert.equal($wi.children().length, 5, "There should be three WorksetItems plus dummy plus arrow");
		assert.ok($wi.children(":eq(1)").hasClass("sapUiUx3NavBarItemSel"), "First workset item should be selected");
		assert.ok(!$wi.children(":eq(2)").hasClass("sapUiUx3NavBarItemSel"), "Second workset item should NOT be selected");
		assert.ok(!$wi.children(":eq(3)").hasClass("sapUiUx3NavBarItemSel"), "Third workset item should NOT be selected");

		// if window is wide enough, there should be no overflow icons visible
		if ($wi.width() > 250) {
			var $wiofL = jQuery(document.getElementById(oShell.getId() + "-wsBar-ofb"));
			assert.equal($wiofL.css("display"), "none", "Left workset item overflow button should be invisible");
			var $wiofR = jQuery(document.getElementById(oShell.getId() + "-wsBar-off"));
			assert.equal($wiofR.css("display"), "none", "Right workset item overflow button should be invisible");
		}

		var oDomRef = oShell.getId() + "-tool-" + oShell.getId() + "-searchTool" ? window.document.getElementById(oShell.getId() + "-tool-" + oShell.getId() + "-searchTool") : null;
		assert.ok(!!oDomRef, "Search tool should exist in the page");
		oDomRef = oShell.getId() + "-tool-" + oShell.getId() + "-inspectorTool" ? window.document.getElementById(oShell.getId() + "-tool-" + oShell.getId() + "-inspectorTool") : null;
		assert.ok(!oDomRef, "Inspector tool should NOT exist in the page");
		oDomRef = oShell.getId() + "-tool-" + oShell.getId() + "-feederTool" ? window.document.getElementById(oShell.getId() + "-tool-" + oShell.getId() + "-feederTool") : null;
		assert.ok(!!oDomRef, "Feeder tool should exist in the page");
	});

	QUnit.test("WorksetItemSelected Event", function(assert) {
		assert.expect(5);

		qutils.triggerMouseEvent("wi_so", "click", 1, 1, 1, 1);

		var $wi = jQuery(document.getElementById(oShell.getId() + "-wsBar-list"));
		assert.ok(!$wi.children(":eq(1)").hasClass("sapUiUx3NavBarItemSel"), "First workset item should NOT be selected");
		assert.ok($wi.children(":eq(2)").hasClass("sapUiUx3NavBarItemSel"), "Second workset item should be selected");
		assert.ok(!$wi.children(":eq(3)").hasClass("sapUiUx3NavBarItemSel"), "Third workset item should NOT be selected");

	});

	QUnit.test("Logout Event", function(assert) {
		assert.expect(1);
		var $logout = jQuery(".sapUiUx3ShellHeader-logout");
		qutils.triggerMouseEvent($logout[0], "click", 1, 1, 1, 1);
	});



	var renderCount = 0;
	QUnit.test("Forced Re-rendering", function(assert) {
		var done = assert.async();

		// overwrite the Shell renderer to count the calls
		var realRender = ShellRenderer.render;
		sap.ui.ux3.ShellRenderer.render = function(oRenderManager, oControl) {
			renderCount++;
			realRender(oRenderManager, oControl);
		};

		assert.expect(1);
		oShell.forceInvalidation();
		setTimeout(function() {
			assert.equal(renderCount, 1, "ONE re-rendering should have happened after forced invalidation");
			done();
		}, 10);
	});

	QUnit.test("No Re-rendering on Content Modification", function(assert) {
		var done = assert.async();
		assert.expect(2);
		oShell.addContent(new Button("newContentBtn", {text:"new content"}));
		setTimeout(function() {
			assert.ok(window.document.getElementById("newContentBtn"), "The new content should now be present in the page");
			assert.equal(renderCount, 1, "Still, only ONE re-rendering should have happened after adding more content");
			done();
		}, 10);
	});

	QUnit.test("OnAfterRendering Called on Added Content", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var newLbx = new ListBox("newContentLbx");

		// overwrite ListBox onAfterRendering to log calls
		var realOnAfterRendering = newLbx.onAfterRendering;
		var onAfterRenderingCount = 0;
		newLbx.onAfterRendering = function() {
			onAfterRenderingCount++;
			jQuery.proxy(realOnAfterRendering, newLbx)();
		};

		oShell.addContent(newLbx);
		setTimeout(function() {
			assert.ok(window.document.getElementById("newContentLbx"), "The new content should now be present in the page");
			assert.equal(onAfterRenderingCount, 1, "ListBox.onAfterRendering should have been called once");
			done();
		}, 10);
	});



	/* TODO: feeder has issues in IE with trim()

		QUnit.test("FeedSubmit Event", function(assert) {
			var done = assert.async();
			qutils.triggerMouseEvent("myShell-tool-myShell-feederTool", "click", 1, 1, 1, 1);
			setTimeout(function() {
				// check whether popup is open
				var $tp = jQuery.sap.byId("myShell-feederTool");
				assert.equal($tp.css("display"), "block", "Feeder tool popup should be visible now");

				var btn = $tp.find("button")[0];
				// trigger a feed TODO: add text and check it
				qutils.triggerMouseEvent(btn, "click", 1, 1, 1, 1);

				setTimeout(function() {
					assert.equal($tp.css("display"), "none", "Feeder tool popup should be invisible now");
					done();
				}, 3000);
			}, 300);
	});
	*/


	QUnit.test("Search Event", function(assert) {
		var done = assert.async();
		assert.expect(4);

		// open the search tool
		qutils.triggerMouseEvent("myShell-tool-myShell-searchTool", "click", 1, 1, 1, 1);

		setTimeout(function() {
			// check whether popup is open
			var oTP = sap.ui.getCore().byId("myShell-searchTool");
			var $tp = oTP.$();
			assert.equal($tp.css("display"), "block", "Search tool popup should be visible now");

			// enter text
			var sf = oShell.getSearchField();
			sf.setValue("ABC");

			setTimeout(function() {
				// Enter on the search field
				qutils.triggerKeydown(sf.getFocusDomRef(), "ENTER");

				// close tool popup
				qutils.triggerMouseEvent("myShell-tool-myShell-searchTool", "click", 1, 1, 1, 1);
				oTP.oPopup.attachClosed(function() {
					// make sure the popup is closed again
					assert.equal($tp.css("display"), "none", "Search tool popup should not be visible now");
					done();
				});
			}, 300);
		}, 300);
	});


	QUnit.test("PaneBarItemSelected Event", function(assert) {
		var done = assert.async();
		assert.expect(8);

		// pane should be closed
		assert.equal(jQuery(document.getElementById(oShell.getId() + "-paneBar")).hasClass("sapUiUx3ShellPaneBarOpen"), false, "Pane bar should be closed");
		assert.equal(jQuery(document.getElementById("paneContent")).length, 0, "Pane content should not yet exist");

		// open pane
		qutils.triggerMouseEvent("pb_people", "click", 1, 1, 1, 1);

		setTimeout(function() {
			// check whether pane is open now
			assert.equal(jQuery(document.getElementById(oShell.getId() + "-paneBar")).hasClass("sapUiUx3ShellPaneBarOpen"), true, "Pane bar should be open");
			assert.equal(jQuery(document.getElementById("paneContent")).length, 1, "Pane content should exist");

			assert.equal(document.activeElement.id, "paneContent", "Pane content has focus after opening");

			// close again
			qutils.triggerMouseEvent("pb_people", "click", 1, 1, 1, 1);

			setTimeout(function() {
				// check whether pane is closed
				assert.equal(jQuery(document.getElementById(oShell.getId() + "-paneBar")).hasClass("sapUiUx3ShellPaneBarOpen"), false, "Pane bar should be closed");
				done();
			}, 3000);
		}, 3000);
	});

	QUnit.test("No Further Re-rendering", function(assert) {
		assert.expect(1);
		assert.equal(renderCount, 1, "Still, only ONE re-rendering should have happened after further tests");
	});


	QUnit.test("PaneClosed Event", function(assert) {
		var done = assert.async();
		// The number of times this test opens and closes the side pane
		// Don't set this one too high or the test might time out...
		var iRepetitions = 5;


		// Callback functions
		var openPane = function() {
			qutils.triggerMouseEvent("pane_feed", "click", 1, 1, 1, 1);
		};
		var closePane = openPane; // Same action to close the pane
		var openAndClosePane = function() {
			setTimeout(openPane, 300);
			setTimeout(closePane, 600);
		};

		// Begin testing
        QUnit.config.testTimeout = (iRepetitions + 2) * 1000;
		assert.expect(iRepetitions);

		// Clean up the shell and make it ready for testing...
		try {
			oShell.destroy();
		} catch (e) {/* ignore if undefined... */}
		oShell = new Shell("myShell");
		oShell.addPaneBarItem(new Item("pane_feed",{text:"Feed"}));
		oShell.addPaneBarItem(new Item("pane_news",{text:"News"}));
		oShell.placeAt("uiArea1");

		// Apply changes immediately
		sap.ui.getCore().applyChanges();

		// Keep track of the number of repetitions
		var iRepetitionsLeft = iRepetitions;

		// Congregation, settle in your seats, the test is about to begin...
		openAndClosePane();
		oShell.attachPaneClosed(function(oEvent) {
			iRepetitionsLeft--;
			assert.ok(true, "Pane closed: " + iRepetitionsLeft);

			if (iRepetitionsLeft > 0) {
				openAndClosePane();
			} else {
				done(); // All done...
				// clear timeout setting to avoid timeouts in later tests (e.g Toolpalette)
				delete QUnit.config.testTimeout;
			}
		});
	});

	QUnit.test("Change Design", function(assert) {
		// Configure the test...

		// Number of times the test will run
		var iRepetitions = 30;

		// Available designs
		var aDesigns = {};
		aDesigns[ShellDesignType.Standard] = {
			classes    : ["sapUiUx3ShellDesignStandard"],
			notClasses : ["sapUiUx3ShellDesignLight", "sapUiUx3ShellDesignCrystal"],
			isLight    : false
		};
		aDesigns[ShellDesignType.Light] = {
			classes    : ["sapUiUx3ShellDesignLight"],
			notClasses : ["sapUiUx3ShellDesignStandard", "sapUiUx3ShellDesignCrystal"],
			isLight    : true
		};
		aDesigns[ShellDesignType.Crystal] = {
			classes    : ["sapUiUx3ShellDesignCrystal", "sapUiUx3ShellDesignLight"],
			notClasses : ["sapUiUx3ShellDesignStandard"],
			isLight    : true
		};


		// Now run the test...

		// Clean up the shell and make it ready for testing
		try {
			oShell.destroy();
		} catch (e) {/* ignore if undefined... */}
		oShell = new Shell("myShell");
		oShell.addToolPopup(new ToolPopup("testPopup", {
			title : "ToolPopup for testing purposes"
		}));
		oShell.placeAt("uiArea1");

		// Apply changes immediately
		sap.ui.getCore().applyChanges();

		// Standard Design is Standard. ;-)
		assert.ok(
			oShell.getDesignType() === ShellDesignType.Standard,
			"Shell design Standard should be selected in the beginning"
		);
		assert.ok(
			oShell.$().hasClass("sapUiUx3ShellDesignStandard"),
			"Shell DOM-Element should have CSS class sapUiUx3ShellDesignStandard"
		);
		assert.ok(
			!oShell.$().hasClass("sapUiUx3ShellDesignLight"),
			"Shell DOM-Element must not have CSS class sapUiUx3ShellDesignLight"
		);
		assert.ok(
			!oShell.$().hasClass("sapUiUx3ShellDesignCrystal"),
			"Shell DOM-Element must not have CSS class sapUiUx3ShellDesignLight"
		);


		var aDesignKeys = [];
		for (var key in aDesigns) {
			aDesignKeys.push(key);
		}

		var i,n;

		for (i = 0; i < iRepetitions; ++i) {
			// Switch design every iteration...

			// Choose a design randomly
			var sDesign = aDesignKeys[Math.floor(Math.random() * aDesignKeys.length)];
			var oDesign = aDesigns[sDesign];

			// Set the design
			oShell.setDesignType(sDesign);
			sap.ui.getCore().applyChanges();

			for (n = 0; n < oDesign.classes.length; ++n) {
				assert.ok(
					oShell.$().hasClass(oDesign.classes[n]),
					"Design \"" + sDesign + "\" has class \"" + oDesign.classes[n] + "\""
				);
			}

			for (n = 0; n < oDesign.notClasses.length; ++n) {
				assert.ok(
					!oShell.$().hasClass(oDesign.notClasses[n]),
					"Design \"" + sDesign + "\" does not have class \"" + oDesign.notClasses[n] + "\""
				);
			}

			// Check for ToolPopups and whether their inverted-property is set correctly
			var aToolPopups = oShell.getToolPopups();
			for (n = 0; n < aToolPopups.length; ++n) {
				assert.ok(
					aToolPopups[n].getInverted() == !oDesign.isLight,
					"ToolPopup \"" + aToolPopups[n].getId() + "\" is " +
					  (oDesign.isLight ? "not " : " ") + "inverted."
				);
			}


		}

	});


	QUnit.test("PaneBar Overflow", function(assert) {

		try {
			oShell.destroy();
		} catch (e) {/* ignore if undefined... */}
		oShell = new Shell("myShell");
		oShell.addToolPopup(new ToolPopup("testPopup", {
			title : "ToolPopup for testing purposes"
		}));
		oShell.placeAt("uiArea1");

		// Apply changes immediately
		sap.ui.getCore().applyChanges();

		var $OverflowButton = jQuery(".sapUiUx3ShellPaneOverflowButton");

		assert.ok(
			$OverflowButton.length == 1,
			"Overflow button was rendered."
		);

		assert.ok(
			$OverflowButton.css("display") == "none",
			"Overflow button is not displayed initially."
		);

		var i;

		for (i = 0; i < 20; ++i) {
			oShell.addPaneBarItem(new Item(
				"pane_" + i, { text : "Pane Item " + i }
			));
			sap.ui.getCore().applyChanges();
			// Make sure the overflow is checked now and not after several items have been
			// added to the pane
			oShell._delayedCheckPaneBarOverflow();
		}

		assert.ok($OverflowButton.css(
			"display") != "none",
			"Overflow button visible after adding a ****load of items to the pane."
		);

		// The overflow Menu should contain _ALL_ entries but only the ones not in the
		// shell pane should be visible

		var oMenu = oShell._getPaneOverflowMenu();
		var aMenuItems = oMenu.getItems();

		var bAllHiddenItemsInPane = true;
		for (i = 0; i < aMenuItems.length; ++i) {
			if (!aMenuItems[i].getVisible()) {
				// Invisible menu items can be found in the pane and the other way around.
				var sPaneId = aMenuItems[i].getId().replace("-overflow", "");
				var oPaneItem = jQuery(".sapUiUx3ShellPaneEntries").children("#" + sPaneId);

				if (oPaneItem.length !== 1) {
					bAllHiddenItemsInPane = false;
				}
			}
		}

		assert.ok(
			bAllHiddenItemsInPane,
			"All hidden overflow menu items are in the pane."
		);
	});

	QUnit.test("ToolPalette Overflow", function(assert) {
		var done = assert.async();
		try {
			oShell.destroy();
		} catch (e) {/* ignore if undefined... */}
		oShell = new Shell("myShell");
		oShell.placeAt("uiArea1");

		// Apply changes immediately
		sap.ui.getCore().applyChanges();

		var $PaletteArea = jQuery(".sapUiUx3ShellToolPaletteArea");

		assert.ok($PaletteArea.length == 1, "Palette area was rendered.");



		var iLastWidth = $PaletteArea.width();
		var i = 0;
		var fnGrowPalette = function() {
			++i;
			oShell.addToolPopup(new ToolPopup(
				"palette_" + i, {
					title : "ToolPopup for overflow testing No. " + i,
					icon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAHWlUWHRDb21tZW50AAAAAABDcmVhdGVkIHdpdGggR0lNUGQuZQcAAAFFSURBVFjD7ZWxSgNBEIa/3RxpIqlSphFiZauNhSRgI4qVBLGy0DfwAfIUEjCxsgiHpLsgFjmxEFHbdBYWKimsAjbB27GQgIKH2U3gmv3K3Zn5/xmYXfB4PBmj0i7iWIJChT2dYw0oOdZ/Nwm3H090ajX1+VdAkJa5sMS+0mzP2GBJ59gpVAA4tzKAYh3AJJw9j+jXl9XYRjkcSH6xyIbKcaA01TQDOlVfUQTotbmyFQeoL6tx1ObyZy0rAxMaDWVc5z9Nrs56C7wBb2CKLRDtvgX/56YGiDAC2Dyk6iIeDiS/dfT9kk5qWf0FDy+yqzT1eYxZDOFqWV1YTSBq0TUJHRGGzsLC0CR0ohZd6wlMw+ObhL8ODP2VsmpmsgVGuLYVn5sBEW56pzRdcoPZW+cuanEyy6flzP2rHMexBGRFpuIez7z4Atp7ZA1vyiIaAAAAAElFTkSuQmCC"
				}
			));
			sap.ui.getCore().applyChanges();
			// Make sure the overflow is checked now and not after several items have been
			// added to the pane
			oShell._checkToolPaletteSize();
			RenderManager.forceRepaint(document.getElementsByTagName("body")[0]);

			if ($PaletteArea.width() > iLastWidth) {
				assert.ok(true, "Palette area grew");
			}
			iLastWidth = $PaletteArea.width();

			if (i < 500) {
				if ($PaletteArea.width() >= Shell.SIDE_BAR_BASE_WIDTH * 4) {
					assert.ok(
						true,
						"Palette width grew to five times its basic size after ading a ****load of "
						+ "Toolpopups to the pane."
					);
					oShell.removeAllToolPopups();
					done();
				} else {
					window.setTimeout(fnGrowPalette, 20);
				}
			} else {
				assert.ok(
					false,
					"Palette area did not grow enough, even after 500 Toolpopups were added."
				);
				done();
			}
		};
		window.setTimeout(fnGrowPalette, 10);
	});

	QUnit.done(function() {
		oShell.destroy();
	});
});