/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/RichTooltip",
	"sap/ui/commons/Button",
	"sap/ui/commons/TextField",
	"sap/ui/core/ValueStateSupport",
	"sap/ui/model/json/JSONModel"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	RichTooltip,
	Button,
	TextField,
	ValueStateSupport,
	JSONModel
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	function openRtt(sId, bWithKeyboard) {
		if (bWithKeyboard){
			qutils.triggerKeydown(sId, "I", false, false, true);
		} else {
			qutils.triggerMouseEvent(sId, "mouseover");
		}
	}

	function closeRtt(sId, bWithKeyboard) {
		if (bWithKeyboard){
			qutils.triggerKeydown(sId, "ESCAPE");
		} else {
			qutils.triggerMouseEvent(sId, "mouseout");
		}
	}

	function isRttVisible(sId){
		return jQuery(sId ? document.getElementById(sId) : null).filter(":visible").length > 0;
	}

	var sText, sTitle, sDefaultTitle, sImageSrc, oRtt0, oRtt1, oButton1, sRtt2Offset, sRtt2HtmlText,
		sRtt2ValueStateText, oRtt2, oTextField1;

	function _setup() {
		sText = "This is the correct long text";
		sTitle = "This is the expected title";
		sDefaultTitle = "this tooltip must be gone";
		sImageSrc = "test-resources/sap/ui/commons/images/SAPLogo.gif";


		//RichTooltip with default values
		oRtt0 = new RichTooltip("rtt0");

		//RichTooltip with standard positioning and animation
		oRtt1 = new RichTooltip("rtt1", {
			text: sText,
			title: sTitle,
			imageSrc: sImageSrc,
			collision: "none" //just to avoid positioning issues during test
		});

		oButton1 = new Button("c1", {
			text: "Show RichTooltip 1",
			tooltip: sDefaultTitle
		});
		oButton1.setTooltip(oRtt1);
		oButton1.placeAt("uiArea1");

		//RichTooltip with custom positioning and animation

		sRtt2Offset = "10 8";

		sRtt2HtmlText = "Make it <strong>strong</strong>";
		sRtt2ValueStateText = "This is an individual message";

		oRtt2 = new RichTooltip("rtt2", {
			text: sText,
			title: sTitle,
			imageSrc: sImageSrc,
			openDuration: 600,
			closeDuration: 600,
			myPosition: "begin bottom",
			atPosition: "begin top",
			offset: sRtt2Offset,
			collision: "none"
		});

		oTextField1 = new TextField("c2", {
			tooltip: oRtt2,
			valueState: "Warning"
		});
		oTextField1.placeAt("uiArea2");

		sap.ui.getCore().applyChanges();
	}

	function _teardown() {
		sText = null;
		sTitle = null;
		sDefaultTitle = null;
		sImageSrc = null;
		sRtt2Offset = null;

		oRtt0.destroy();
		oRtt0 = null;

		oRtt1.destroy();
		oRtt1 = null;

		oButton1.destroy();
		oButton1 = null;

		sRtt2HtmlText = null;
		sRtt2ValueStateText = null;

		oRtt2.destroy();
		oRtt2 = null;

		oTextField1.destroy();
		oTextField1 = null;
	}



	QUnit.module("API", {beforeEach: _setup, afterEach: _teardown});

	QUnit.test("Default Values", function(assert) {
		assert.equal(oRtt0.getTitle(), "", "Default 'title':");
		assert.equal(oRtt0.getImageSrc(), "", "Default 'imageSrc':");
		assert.equal(oRtt0.getText(), "", "Default 'text':");
		assert.equal(oRtt0.getOpenDuration(), 200, "Default 'openDuration':");
		assert.equal(oRtt0.getCloseDuration(), 200, "Default 'closeDuration':");
		assert.equal(oRtt0.getMyPosition(), "begin top", "Default 'myPosition':");
		assert.equal(oRtt0.getAtPosition(), "begin bottom", "Default 'atPosition':");
		assert.equal(oRtt0.getOffset(), "10 3", "Default 'offset':");
		assert.equal(oRtt0.getCollision(), "flip", "Default 'collision':");
	});

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oRtt2.getTitle(), sTitle, "Custom 'title':");
		assert.equal(oRtt2.getImageSrc(), sImageSrc, "Custom 'imageSrc':");
		assert.equal(oRtt2.getText(), sText, "Custom 'text':");
		assert.equal(oRtt2.getOpenDuration(), 600, "Custom 'openDuration':");
		assert.equal(oRtt2.getCloseDuration(), 600, "Custom 'closeDuration':");
		assert.equal(oRtt2.getMyPosition(), "begin bottom", "Custom 'myPosition':");
		assert.equal(oRtt2.getAtPosition(), "begin top", "Custom 'atPosition':");
		assert.equal(oRtt2.getOffset(), sRtt2Offset, "Custom 'offset':");
		assert.equal(oRtt2.getCollision(), "none", "Custom 'collision':");
	});

	QUnit.test("Control Attachment", function (assert) {
		assert.ok(!oButton1.$().attr("title"), "No default tooltip set when RichTooltip is attached");

		oButton1.setTooltip(sDefaultTitle);
		sap.ui.getCore().applyChanges();

		assert.equal(oButton1.$().attr("title"), sDefaultTitle, "Default tooltip set when no RichTooltip is attached");
	});

	QUnit.module("Open and Close", {beforeEach: _setup, afterEach: _teardown});

	function checkOpenClose(iTestSet, bWithKeyboard, iOpenTimeout, iCloseTimeout, fCheckOpen, fCheckClose) {
		if (bWithKeyboard){
			sap.ui.getCore().byId("c" + iTestSet).focus();
		}
		setTimeout(function() {
			openRtt("c" + iTestSet, bWithKeyboard);
			setTimeout(function() {
				if (fCheckOpen){
					fCheckOpen(isRttVisible("rtt" + iTestSet));
				}
				closeRtt("c" + iTestSet, bWithKeyboard);
				setTimeout(function() {
					if (fCheckClose){
						fCheckClose(isRttVisible("rtt" + iTestSet));
					}
				}, iCloseTimeout);
			}, iOpenTimeout);
		}, 10);
	}

	QUnit.test("Default Position", function(assert) {
		var done = assert.async();
		checkOpenClose(1, true, 400, undefined, function() {
			var jCtrl = oButton1.$();
			var oCtrlOffset = jCtrl.offset();
			var jRtt = oRtt1.$();
			var oRttOffset = jRtt.offset();

			var result = Math.abs(oCtrlOffset.left - oRttOffset.left + 10);
			assert.ok(oRtt1._getPopup().isOpen());
			assert.ok(result <= 2, "Position from left is less than 2: " + result);
			result = Math.abs((oCtrlOffset.top + jCtrl.outerHeight()) - oRttOffset.top + 3);
			assert.ok(result <= 2, "Position from top is less than 5: " + result);
			done();
		});
	});

	QUnit.test("Open/Close via mouse hover", function(assert) {
		var done = assert.async();
		checkOpenClose(1, false, 2500 /*500 delay + 200 duration + 1800 buffer*/, 2500, function(bOpen) {
			assert.ok(bOpen, "RichTooltip is visible after mouseover");
		}, function(bOpen) {
			assert.ok(!bOpen, "RichTooltip is not visible after mouseout");
			done();
		});
	});

	QUnit.test("Open/Close via keyboard", function(assert) {
		var done = assert.async();
		checkOpenClose(1, true, 400 /*200 duration + 200 buffer (no delay)*/, 400, function(bOpen) {
			assert.ok(bOpen, "RichTooltip is visible after press Ctrl+I");
		}, function(bOpen) {
			assert.ok(!bOpen, "RichTooltip is visible after press Escape");
			done();
		});
	});

	QUnit.test("Not Visible tooltip", function(assert) {
		var done = assert.async();
		oRtt2.setVisible(false);
		sap.ui.getCore().byId("c2").focus();
		setTimeout(function() {
			openRtt("c2", true);
			setTimeout(function() {
				assert.strictEqual(oRtt2.getDomRef(), null, "Tooltip should not be rendered");
				closeRtt("c2", true);
				setTimeout(function() {
					oRtt2.setVisible(true);
					done();
				}, 600);
			}, 600);
		}, 600);
	});

	QUnit.module("Content", {beforeEach: _setup, afterEach: _teardown});

	function checkContent(assert, bTitleExpected, bIconExpected) {
		var done = assert.async();
		sap.ui.getCore().applyChanges();
		checkOpenClose(1, true, 400, undefined, function() {
			var jRtt1 = jQuery("#rtt1");

			var jObj = jRtt1.find(".sapUiRttText");
			assert.ok(jObj.length == 1, "RichTooltip text section is available");
			assert.equal(jObj.text(), sText, "Text in text section ok:");

			jObj = jRtt1.find(".sapUiRttImage");
			assert.ok(jObj.length == bIconExpected ? 1 : 0, "RichTooltip image section is " + (bIconExpected ? "" : "not ") + "available");
			if (bIconExpected){
				assert.equal(jObj.attr("src"), sImageSrc, "Image Source ok:");
			}

			jObj = jRtt1.find(".sapUiRttTitle");
			assert.ok(jObj.length == bTitleExpected ? 1 : 0, "RichTooltip title section is " + (bTitleExpected ? "" : "not ") + "available");
			if (bTitleExpected){
				assert.equal(jObj.text(), sTitle, "Text in title section ok:");
			}

			assert.ok(jRtt1.find(".sapUiRttSep").length == bTitleExpected ? 1 : 0, "RichTooltip title seperator section is " + (bTitleExpected ? "" : "not ") + "available");
			done();
		});
	}

	QUnit.test("RichTooltip with Title, Icon and Text", function(assert) {
		checkContent(assert, true, true);
	});

	QUnit.test("RichTooltip with Title and Text (no Icon)", function(assert) {
		oRtt1.setImageSrc(null);
		checkContent(assert, true, false);
	});

	QUnit.test("RichTooltip with Text (no Title and Icon)", function(assert) {
		oRtt1.setTitle(null);
		oRtt1.setImageSrc(null);
		checkContent(assert, false, false);
	});

	QUnit.test("RichTooltip with Icon and Text (no Title)", function(assert) {
		oRtt1.setTitle(null);
		oRtt1.setImageSrc(sImageSrc);
		checkContent(assert, false, true);
	});

	QUnit.test("RichTooltip Text for control with Value State", function(assert) {
		var done = assert.async();
		assert.expect(4);

		checkOpenClose(2, true, 400, undefined, function() {
			var jObjValueStateText = jQuery("#rtt2").find(".sapUiRttValueStateText");
			var jObjText = jQuery("#rtt2").find(".sapUiRttText");

			assert.ok(jObjValueStateText.length == 1, "ValueState text section is available");
			assert.ok(jObjText.length == 1, "RichTooltip text section is available");

			// fetch the default text to prevent any wrongly set language
			var valueStateText = ValueStateSupport.getAdditionalText(oRtt2.getParent());

			assert.ok(jObjValueStateText.text() === valueStateText, "ValueState text contains default state information.");
			assert.ok(jObjText.text() === sText, "RichTooltip text section is the original text.");
			done();
		});
	});

	QUnit.test("RichTooltip with individual ValueState text and html text", function(assert) {
		var done = assert.async();
		assert.expect(2);
		oRtt2.setText(sRtt2HtmlText);
		oRtt2.setValueStateText(sRtt2ValueStateText);
		oRtt2.invalidate();
		sap.ui.getCore().applyChanges();

		setTimeout(function(){
			checkOpenClose(2, true, 800, undefined, function() {
				var jObjText = jQuery("#rtt2").find(".sapUiRttText");

				// since IE8 transforms all tags into upper case it has to be transfered back into lower case
				var sText = jObjText.html().toLowerCase();
				var sLowerOriginal = sRtt2HtmlText.toLowerCase();

				assert.ok(sText === sLowerOriginal, "HTML text as content text");

				var jObjValueStateText = jQuery("#rtt2").find(".sapUiRttValueStateText");
				assert.ok(jObjValueStateText.html() === sRtt2ValueStateText, "Custom 'ValueStateMessage':");
				done();
			});
		}, 400);
	});

	QUnit.module("Data binding");

	QUnit.test("Should bind properly values with curly braces", function (assert) {
		var sText = "Title 1{<br>Id 1";
		var oModel = new JSONModel();
		oModel.setData({
			text: sText
		});

		var oRTT = new RichTooltip({
			text: "{/text}"
		}).setModel(oModel);

		assert.strictEqual(oRTT.getText(), sText, "text should equal " + sText);

		oRTT.destroy();
		oModel.destroy();
	});
});