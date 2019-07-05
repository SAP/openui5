/*global QUnit, exactTestData */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/ExactBrowser",
    "sap/ui/commons/Menu",
    "sap/ui/ux3/library",
    "sap/ui/ux3/ExactAttribute",
    "sap/ui/thirdparty/jquery",
    "sap/ui/Device",
    "sap/base/util/UriParameters",
    "sap/ui/dom/containsOrEquals",
    "sap/ui/events/KeyCodes",
    "sap/ui/core/Element",
    "../resources/ExactData"
], function(
    qutils,
	createAndAppendDiv,
	ExactBrowser,
	Menu,
	ux3Library,
	ExactAttribute,
	jQuery,
	Device,
	UriParameters,
	containsOrEquals,
	KeyCodes,
	Element
) {
	"use strict";

	// shortcut for sap.ui.ux3.ExactOrder
	var ExactOrder = ux3Library.ExactOrder;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);


	function fnGetElementIds() {
		var aResult = [];
		Element.registry.forEach(function(oElement, sId) {
			aResult.push(sId);
		});
		return aResult;
	}
	var aElementsBefore = fnGetElementIds();



	var oExactBrowser1,
		oExactBrowser2,
		oExactBrowser3;


	sap.ui.getCore().attachInit(function() {
		oExactBrowser1 = new ExactBrowser("exactBrowser1", {title: "Hello", tooltip: "Tooltip", enableListClose: true, headerTitle: "Header", showHeader: true});
		oExactBrowser1.setOptionsMenu(new Menu("myMenu"));
		exactTestData.initAttributesForQUnit(oExactBrowser1);
		oExactBrowser1.placeAt("uiArea1");
		oExactBrowser2 = new ExactBrowser("exactBrowser2", {visible: false, listHeight: 300, enableReset: false});
		oExactBrowser2.placeAt("uiArea2");
		oExactBrowser3 = new ExactBrowser("exactBrowser3", {title: "Hello", tooltip: "Tooltip", headerTitle: "Header", showHeader: true, topListWidth: 200, topListOrder: ExactOrder.Fixed});
		oExactBrowser3.setOptionsMenu(new Menu("myMenu2"));
		exactTestData.initAttributesForQUnit(oExactBrowser3, "_");
		oExactBrowser3.placeAt("uiArea3");

	});



	function getListItemRefs(oListBox) {
		return jQuery(jQuery("#" + oListBox.getId()).children()[0]).children();
	}

	function calculateSelectionCount(oAtt) {
		var iCount = oAtt.getSelected() ? 1 : 0;
		var aAttrs = oAtt.getAttributes();
		for (var i = 0; i < aAttrs.length; i++){
			iCount = iCount + calculateSelectionCount(aAttrs[i]);
		}
		return iCount;
	}

	function testSelection(assert, sAttId, bSelected, iTotalSelectedAtts, aVisibleFirstLevelLists) {
		var done = assert.async();

		function handler(oControlEvent) {
			if (!sAttId) {
				assert.ok(!oControlEvent.getParameter("attribute"), "No selected attribute:");
			} else {
				assert.equal(oControlEvent.getParameter("attribute").getId(), sAttId, "Id of (de-)selected attribute:");
				assert.equal(oControlEvent.getParameter("attribute").getSelected(), bSelected, "Selection state of selected attribute:");
			}
			assert.equal(oControlEvent.getParameter("allAttributes").length, iTotalSelectedAtts, "Number of selected attributes (Event):");
			assert.equal(calculateSelectionCount(oExactBrowser1._attributeRoot), iTotalSelectedAtts, "Number of selected attributes (Attributes):");

			setTimeout(function(){
				var aSubLists = oExactBrowser1._rootList.getSubLists();
				assert.equal(aSubLists.length, aVisibleFirstLevelLists.length, "Number of visible 1st level lists:");
				for (var i = 0; i < aVisibleFirstLevelLists.length; i++){
					assert.equal(aSubLists[i].getData(), aVisibleFirstLevelLists[i], "List at position " + i + ":");
				}
				done();
			}, 1000);

			oExactBrowser1.detachAttributeSelected(handler);
		}
		oExactBrowser1.attachAttributeSelected(handler);

		return getListItemRefs(oExactBrowser1._rootList._lb);
	}



	//

	QUnit.module("API");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oExactBrowser2.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.ux3").getText("EXACT_BRWSR_LST_TITLE"), "Default 'title':");
		assert.equal(oExactBrowser2.getOptionsMenu(), null, "Default 'optionsMenu':");
		assert.equal(oExactBrowser2.getTooltip(), null, "Default 'tooltip':");
		assert.equal(oExactBrowser1.getVisible(), true, "Default 'visible':");
		assert.equal(oExactBrowser2.getEnableListClose(), false, "Default 'enableListClose':");
		assert.equal(oExactBrowser2.getHeaderTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.ux3").getText("EXACT_BRWSR_TITLE"), "Default 'headerTitle':");
		assert.equal(oExactBrowser1.getListHeight(), 290, "Default 'listHeight':");
		assert.equal(oExactBrowser2.getShowHeader(), false, "Default 'showHeader':");
		assert.equal(oExactBrowser1.getEnableReset(), true, "Default 'enableReset':");
		assert.equal(oExactBrowser2.getTopListWidth(), 168, "Default 'topListwidth':");
		assert.equal(oExactBrowser2.getTopListOrder(), ExactOrder.Select, "Default 'topListOrder':");
		assert.equal(oExactBrowser2.getShowTopList(), true, "Default 'showTopList':");
	});

	QUnit.test("Custom Values", function(assert) {
		oExactBrowser2.setShowTopList(false);

		assert.equal(oExactBrowser1.getTitle(), "Hello", "Custom 'title':");
		assert.equal(oExactBrowser1.getOptionsMenu().getId(), "myMenu", "Custom 'optionsMenu':");
		assert.equal(oExactBrowser1.getTooltip(), "Tooltip", "Custom 'tooltip':");
		assert.equal(oExactBrowser2.getVisible(), false, "Custom 'visible':");
		assert.equal(oExactBrowser1.getEnableListClose(), true, "Custom 'enableListClose':");
		assert.equal(oExactBrowser1.getHeaderTitle(), "Header", "Custom 'headerTitle':");
		assert.equal(oExactBrowser2.getListHeight(), 300, "Custom 'listHeight':");
		assert.equal(oExactBrowser1.getShowHeader(), true, "Custom 'showHeader':");
		assert.equal(oExactBrowser2.getEnableReset(), false, "Custom 'enableReset':");
		assert.equal(oExactBrowser3.getTopListWidth(), 200, "Custom 'topListwidth':");
		assert.equal(oExactBrowser3.getTopListOrder(), ExactOrder.Fixed, "Custom 'topListOrder':");
		assert.equal(oExactBrowser2.getShowTopList(), false, "Custom 'showTopList':");
	});

	QUnit.test("Aggregation 'attributes'", function(assert) {
		assert.equal(oExactBrowser2.getAttributes().length, 0, "Initial number of attributes");
		oExactBrowser2.addAttribute(new ExactAttribute("aggtest1"));
		assert.equal(oExactBrowser2.getAttributes().length, 1, "Number of attributes after add");
		oExactBrowser2.insertAttribute(new ExactAttribute("aggtest2"), 0);
		assert.equal(oExactBrowser2.getAttributes().length, 2, "Number of attributes after insert");
		assert.equal(oExactBrowser2.getAttributes()[0].getId(), "aggtest2", "First Attribute");
		assert.equal(oExactBrowser2.getAttributes()[1].getId(), "aggtest1", "Second Attribute");
		var oAttAt0 = oExactBrowser2.removeAttribute(0);
		oAttAt0.destroy();
		assert.equal(oExactBrowser2.getAttributes().length, 1, "Number of attributes after remove");
		assert.equal(oExactBrowser2.getAttributes()[0].getId(), "aggtest1", "First Attribute");
		var aAttRest = oExactBrowser2.removeAllAttributes();
		jQuery.each(aAttRest, function(i,$) { $.destroy();});
		assert.equal(oExactBrowser2.getAttributes().length, 0, "Number of attributes after removeAll");
	});

	QUnit.module("Visual appearence");

	QUnit.test("Visiblity", function(assert) {
		assert.ok(oExactBrowser1.getDomRef(), "Visible Control rendered");
		assert.ok(!oExactBrowser2.getDomRef(), "Invisible Control not rendered");
	});

	QUnit.test("Options Menu", function(assert) {
		assert.ok(oExactBrowser1._rootList.$().hasClass("sapUiUx3ExactLstTopActive"), "Header menu visible");
		oExactBrowser1.destroyOptionsMenu();
		sap.ui.getCore().applyChanges();
		assert.ok(!oExactBrowser1._rootList.$().hasClass("sapUiUx3ExactLstTopActive"), "Header menu not visible");
	});

	QUnit.test("Level", function(assert) {
		assert.expect(4);
		function checkLevel(oList, iLevel){
			assert.equal(oList._iLevel, iLevel, "Level (" + iLevel + ") of List " + oList.getId());
			var aLists = oList.getSubLists();
			for (var i = 0; i < aLists.length; i++){
				checkLevel(aLists[i], iLevel + 1);
			}
		}
		checkLevel(oExactBrowser3._rootList, 0);
	});

	QUnit.test("Width", function(assert) {
		assert.ok(Math.abs(jQuery(document.getElementById(oExactBrowser1._rootList.getId() + "-lst")).width() - 168) < 5, "Default List Width");
		assert.ok(Math.abs(jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-lst")).width() - 200) < 5, "Custom List Width");
	});

	QUnit.module("List Interaction");

	QUnit.test("Initial State", function(assert) {
		assert.equal(oExactBrowser1.getAttributes().length, 4, "Number of top level attributes:");
		var aSubLists = oExactBrowser1._rootList.getSubLists();
		assert.equal(aSubLists.length, 2, "Number of visible 1st level lists:");
		assert.equal(aSubLists[0].getData(), "att1", "List at position 0:");
		assert.equal(aSubLists[1].getData(), "att2", "List at position 1:");
		for (var i = 0; i < aSubLists.length; i++){
			var aSubSubLists = aSubLists[i].getSubLists();
			if (i === 0){
				assert.ok(aSubSubLists.length == 1, "List " + aSubLists[i].getData() + " contains 1 sub list.");
				assert.equal(aSubSubLists[0].getData(), "att1-1", "Sub-List at position 0:");
			} else {
				assert.ok(aSubSubLists.length == 0, "List " + aSubLists[i].getData() + " contains no sub lists.");
			}
		}
	});

	QUnit.test("Reset via Button", function(assert) {
		assert.ok(oExactBrowser1._resetButton.getDomRef(), "Reset Button visible");
		testSelection(assert, null, false, 0, []);
		qutils.triggerMouseEvent(oExactBrowser1._resetButton.getDomRef(), "click");
	});


	QUnit.test("Reset via API (Control rendered)", function(assert) {
		var done = assert.async();
		var aRootListItemRefs = getListItemRefs(oExactBrowser1._rootList._lb);
		qutils.triggerMouseEvent(aRootListItemRefs[3], "click");

		setTimeout(function(){
			oExactBrowser1.reset();
			setTimeout(function(){
				var aSubLists = oExactBrowser1._rootList.getSubLists();
				assert.equal(aSubLists.length, 0, "Number of visible 1st level lists after API reset:");
				assert.equal(calculateSelectionCount(oExactBrowser1._attributeRoot), 0, "Number of selected attributes (Attributes) after API reset:");
				done();
			}, 1000);
		}, 1000);

	});


	QUnit.test("Reset via API (Control not rendered)", function(assert) {
		var done = assert.async();
		var aRootListItemRefs = getListItemRefs(oExactBrowser1._rootList._lb);
		qutils.triggerMouseEvent(aRootListItemRefs[3], "click");

		setTimeout(function(){
			oExactBrowser1.getUIArea().removeAllContent();
			setTimeout(function(){
				oExactBrowser1.reset();
				oExactBrowser1.placeAt("uiArea1");
				setTimeout(function(){
					var aSubLists = oExactBrowser1._rootList.getSubLists();
					assert.equal(aSubLists.length, 0, "Number of visible 1st level lists after API reset:");
					assert.equal(calculateSelectionCount(oExactBrowser1._attributeRoot), 0, "Number of selected attributes (Attributes) after API reset:");
					done();
				}, 1000);
			}, 1000);
		}, 1000);

	});


	QUnit.test("Select with click", function(assert) {
		var aRootListItemRefs = testSelection(assert, "att4", true, 1, ["att4"]);
		qutils.triggerMouseEvent(aRootListItemRefs[3], "click");
	});


	QUnit.test("Select with keyboard (ENTER)", function(assert) {
		var aRootListItemRefs = testSelection(assert, "att3", true, 2, ["att4", "att3"]);
		qutils.triggerKeydown(aRootListItemRefs[3], "ARROW_UP");
		qutils.triggerKeydown(aRootListItemRefs[2], "ARROW_UP");
		qutils.triggerKeydown(aRootListItemRefs[1], "ARROW_DOWN");
		qutils.triggerKeydown(aRootListItemRefs[2], "ENTER");
	});


	QUnit.test("Select with keyboard (SPACE)", function(assert) {
		var aRootListItemRefs = testSelection(assert, "att4-1", true, 3, ["att4", "att3"]);
		qutils.triggerKeydown(aRootListItemRefs[2], "TAB");
		var a1stListItemRefs = getListItemRefs(oExactBrowser1._rootList.getSubLists()[0]._lb);
		qutils.triggerKeydown(a1stListItemRefs[0], "SPACE");
	});


	QUnit.test("Deselect with keyboard (SPACE)", function(assert) {
		testSelection(assert, "att4-1", false, 2, ["att4", "att3"]);
		var a1stListItemRefs = getListItemRefs(oExactBrowser1._rootList.getSubLists()[0]._lb);
		qutils.triggerKeydown(a1stListItemRefs[0], "SPACE");
	});


	//Disabled on UX request
	//		QUnit.test("Expand / Collapse vertically with keyboard (CTRL + PLUS, CTRL + MINUS)", function(assert) {
	//			var done = assert.async();
	//			var oListBox = oExactBrowser1._rootList.getSubLists()[0]._lb;
	//			var aItemRefs = getListItemRefs(oListBox);
	//			var iInitialHeight = jQuery(oListBox.getDomRef()).height();
	//
	//			stop(3000);
	//			setTimeout(function(){
	//				assert.ok(iInitialHeight != jQuery(oListBox.getDomRef()).height(), "List height increased ("+iInitialHeight+" != "+(jQuery(oListBox.getDomRef()).height())+")"
	//				setTimeout(function(){
	//					done();
	//					assert.ok(iInitialHeight == jQuery(oListBox.getDomRef()).height(), "List height back to normal again"
	//				}, 1000);
	//				qutils.triggerKeydown(aItemRefs[0], "NUMPAD_MINUS", false, false, true);
	//			}, 1000);
	//			qutils.triggerKeydown(aItemRefs[0], "NUMPAD_PLUS", false, false, true);
	//		});


	QUnit.test("Expand / Collapse vertically with click", function(assert) {
		var done = assert.async();
		var oListBox = oExactBrowser1._rootList.getSubLists()[0]._lb;
		var sExpanderId = oExactBrowser1._rootList.getSubLists()[0].getId() + "-exp";
		var iInitialHeight = jQuery(oListBox.getDomRef()).height();

		setTimeout(function(){
			assert.ok(
				iInitialHeight != jQuery(oListBox.getDomRef()).height(),
				"List height increased (" + iInitialHeight + " != " + (jQuery(oListBox.getDomRef()).height()) + ")"
			);
			setTimeout(function(){
				if (navigator.userAgent.indexOf("Windows") >= 0 && Device.browser.safari){
					if (UriParameters.fromQuery(window.location.search).get("runExpandCheck") != "X"){
						done();
						return;
					}
				}
				assert.ok(
					iInitialHeight == jQuery(oListBox.getDomRef()).height(),
					"List height back to normal again (" + iInitialHeight + " == " + (jQuery(oListBox.getDomRef()).height()) + ")"
				);
				done();
			}, 2000);
			qutils.triggerMouseEvent(sExpanderId, "click");
		}, 1000);
		qutils.triggerMouseEvent(sExpanderId, "click");
	});


	QUnit.test("Deselect with click", function(assert) {
		var aRootListItemRefs = testSelection(assert, "att4", false, 1, ["att3"]);
		qutils.triggerMouseEvent(aRootListItemRefs[3], "click");
	});


	QUnit.test("Resize horizontally with keyboard (SHIFT + PLUS, SHIFT + MINUS)", function(assert) {
		var done = assert.async();
		var oListBox = oExactBrowser1._rootList.getSubLists()[0]._lb;
		var aItemRefs = getListItemRefs(oListBox);
		var iInitialWidth = jQuery(oListBox.getDomRef()).width();

		setTimeout(function(){
			assert.ok(
				iInitialWidth != jQuery(oListBox.getDomRef()).width(),
				"List width increased (" + iInitialWidth + " != " + (jQuery(oListBox.getDomRef()).width()) + ")"
			);
			setTimeout(function(){
				assert.ok(iInitialWidth == jQuery(oListBox.getDomRef()).width(), "List width back to normal again");
				done();
			}, 1000);
			qutils.triggerKeydown(aItemRefs[0], "NUMPAD_MINUS", true, false, false);
		}, 1000);
		qutils.triggerKeydown(aItemRefs[0], "NUMPAD_PLUS", true, false, false);
	});


	QUnit.test("Expand / Collapse horizontally with keyboard (ALT + PLUS, ALT + MINUS)", function(assert) {
		var done = assert.async();
		var oSubList = oExactBrowser1._rootList.getSubLists()[0];
		var aItemRefs = getListItemRefs(oSubList._lb);
		assert.ok(!jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is not collapsed");

		setTimeout(function(){
			assert.ok(jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is collapsed");
			setTimeout(function(){
				assert.ok(!jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is not collapsed");
				done();
			}, 1000);
			qutils.triggerKeydown(aItemRefs[0], "NUMPAD_PLUS", false, true, false);
		}, 1000);
		qutils.triggerKeydown(aItemRefs[0], "NUMPAD_MINUS", false, true, false);
	});


	QUnit.test("Expand / Collapse horizontally with click", function(assert) {
		var done = assert.async();
		var oSubList = oExactBrowser1._rootList.getSubLists()[0];
		var sExpanderId = oSubList.getId() + "-hide";
		assert.ok(!jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is not collapsed");

		setTimeout(function(){
			assert.ok(jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is collapsed");
			setTimeout(function(){
				assert.ok(!jQuery(oSubList.getDomRef()).hasClass("sapUiUx3ExactLstCollapsed"), "List is not collapsed");
				done();
			}, 1000);
			qutils.triggerMouseEvent(sExpanderId, "click");
		}, 1000);
		qutils.triggerMouseEvent(sExpanderId, "click");
	});


	QUnit.test("Deselect with keyboard (DELETE)", function(assert) {
		testSelection(assert, "att3", false, 0, []);
		var oListBox = oExactBrowser1._rootList.getSubLists()[0]._lb;
		var aItemRefs = getListItemRefs(oListBox);
		qutils.triggerKeydown(aItemRefs[0], "DELETE");
	});


	QUnit.test("Select with click", function(assert) {
		var aRootListItemRefs = testSelection(assert, "att4", true, 1, ["att4"]);
		qutils.triggerMouseEvent(aRootListItemRefs[3], "click");
	});


	QUnit.test("Deselect with click (Close)", function(assert) {
		var sExpanderId = oExactBrowser1._rootList.getSubLists()[0].getId() + "-close";
		testSelection(assert, "att4", false, 0, []);
		qutils.triggerMouseEvent(sExpanderId, "click");
	});


	QUnit.test("Select via API", function(assert) {
		var done = assert.async();
		var oAtt = oExactBrowser1.getAttributes()[1];
		oAtt.setSelected(true);
		oAtt.getAttributes()[0].setSelected(true);

		setTimeout(function(){
			assert.equal(calculateSelectionCount(oExactBrowser1._attributeRoot), 2, "Number of selected attributes (Attributes):");
			var aSubLists = oExactBrowser1._rootList.getSubLists();
			assert.equal(aSubLists.length, 1, "Number of visible 1st level lists:");
			done();
		}, 1000);
	});


	QUnit.test("Deselect via API", function(assert) {
		var done = assert.async();
		var oAtt = oExactBrowser1.getAttributes()[1];
		oAtt.setSelected(false);

		setTimeout(function(){
			assert.equal(calculateSelectionCount(oExactBrowser1._attributeRoot), 0, "Number of selected attributes (Attributes):");
			var aSubLists = oExactBrowser1._rootList.getSubLists();
			assert.equal(aSubLists.length, 0, "Number of visible 1st level lists:");
			done();
		}, 1000);
	});


	QUnit.module("Keyboard Navigation");

	function checkNav(assert, oList){
		assert.ok(
			containsOrEquals(oList.getFocusDomRef(), document.activeElement) &&
			!containsOrEquals(oList.getDomRef("cntnt"), document.activeElement),
			oList.getId() + " has focus."
		);
	}

	QUnit.test("Tab", function(assert) {
		var done = assert.async();
		var aLists = [oExactBrowser3._rootList, oExactBrowser3._rootList.getSubLists()[0], oExactBrowser3._rootList.getSubLists()[1]];
		var idx = 0;

		var oCurrentList = aLists[idx];
		oCurrentList.focus();
		checkNav(assert, oCurrentList);

		function tab(bNext, fAfter){
			setTimeout(function(){
				var sKey = KeyCodes.TAB;
				qutils.triggerKeydown(oCurrentList._lb.getItems()[0].getId(), sKey, !bNext);
				idx = idx + (bNext ? 1 : -1);
				oCurrentList = aLists[idx];
				checkNav(assert, oCurrentList);
				fAfter();
			}, 100);
		}

		tab(true, function(){ //TAB
			tab(true, function(){ //TAB
				tab(false, function(){ //SHIFT+TAB
					tab(false, function(){ //SHIFT+TAB
						tab(true, function(){ //TAB
							done();
						});
					});
				});
			});
		});
	});

	QUnit.test("Arrow", function(assert) {
		var done = assert.async();
		var aLists = [oExactBrowser3._rootList.getSubLists()[0], oExactBrowser3._rootList.getSubLists()[0].getSubLists()[0], oExactBrowser3._rootList.getSubLists()[1]];
		var idx = 0;

		var oCurrentList = aLists[idx];
		oCurrentList.focus();
		checkNav(assert, oCurrentList);

		function arrow(bNext, fAfter){
			setTimeout(function(){
				var sKey = bNext ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				qutils.triggerKeydown(oCurrentList._lb.getItems()[0].getId(), sKey);
				idx = idx + (bNext ? 1 : -1);
				oCurrentList = aLists[idx];
				checkNav(assert, oCurrentList);
				fAfter();
			}, 100);
		}

		arrow(true, function(){ //ARROW_RIGHT
			arrow(false, function(){ //ARROW_LEFT
				arrow(true, function(){ //ARROW_RIGHT
					qutils.triggerKeydown(oCurrentList._lb.getItems()[0].getId(), KeyCodes.ARROW_RIGHT);
					checkNav(assert, oCurrentList); //Still on the same list!
					done();
				});
			});
		});
	});


	QUnit.module("List Order");

	QUnit.test("Fixed", function(assert) {
		var done = assert.async();
		var aItemRefs = getListItemRefs(oExactBrowser3._rootList._lb);
		qutils.triggerMouseEvent(aItemRefs[3], "click");
		qutils.triggerMouseEvent(aItemRefs[2], "click");
		qutils.triggerMouseEvent(aItemRefs[1], "click");
		qutils.triggerMouseEvent(aItemRefs[0], "click");
		setTimeout(function(){
			var aSubLists = oExactBrowser3._rootList.getSubLists();
			assert.equal(aSubLists[0].getData(), "_att3", "Attribute 3 on index 0");
			assert.equal(aSubLists[1].getData(), "_att4", "Attribute 4 on index 1");
			done();
		}, 500);
	});

	QUnit.test("Select", function(assert) {
		var done = assert.async();
		var aItemRefs = getListItemRefs(oExactBrowser1._rootList._lb);
		qutils.triggerMouseEvent(aItemRefs[3], "click");
		qutils.triggerMouseEvent(aItemRefs[2], "click");
		setTimeout(function(){
			var aSubLists = oExactBrowser1._rootList.getSubLists();
			assert.equal(aSubLists[0].getData(), "att4", "Attribute 4 on index 0");
			assert.equal(aSubLists[1].getData(), "att3", "Attribute 3 on index 1");
			done();
		}, 500);
	});


	QUnit.module("Hidden Top List", {
		beforeEach: function() {
			oExactBrowser3.setShowTopList(false);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Hidden Elements", function(assert) {
		assert.ok(!jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-lst")).is(":visible"), "Listbox is not visible.");
		assert.ok(!jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-rsz")).is(":visible"), "ResizeHandle is not visible.");
		assert.ok(!jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-head")).is(":visible"), "Header is not visible.");
	});

	QUnit.test("Visible Elements", function(assert) {
		assert.ok(jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-cntnt")).is(":visible"), "Content Area is visible.");
		assert.ok(jQuery(document.getElementById(oExactBrowser3._rootList.getId() + "-foc")).length == 1, "Focus Handle exists.");
	});


	QUnit.module("Lifecycle");

	QUnit.test("Destroy", function(assert) {
		oExactBrowser1.destroy();
		oExactBrowser2.destroy();
		oExactBrowser3.destroy();
		assert.equal(fnGetElementIds().length, aElementsBefore.length, "Number of controls after destroy must match number before creation");
	});
});