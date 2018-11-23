/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/Feeder",
    "sap/ui/ux3/library",
    "sap/ui/Device",
    "sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, Feeder, ux3Library, Device, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.ux3.FeederType
	var FeederType = ux3Library.FeederType;

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "width:80%;");
	createAndAppendDiv("uiArea2").setAttribute("style", "width:80%;");
	createAndAppendDiv("uiArea3").setAttribute("style", "width:80%;");



	var sSubmitId = '';
	var sSubmitText = '';
	var sTextTest = 'Test';
	var sPlaceholderText = "Feedback geben...";

	// XSS Test
	var bPlaceholderXSSPossible = true;
	var sPlaceholderTextXSS = '<script>bPlaceholderXSSPossible = false;<\/script><h1>XSS possible!</h1>';

	function handleSubmit(oEvent){
		sSubmitId = oEvent.oSource.getId();
		sSubmitText = oEvent.getParameter('text');
	}

	//feeders
	var oFeeder1 = new Feeder("Feeder1",{
		thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		submit: handleSubmit,
		placeholderText: sPlaceholderText
		}).placeAt("uiArea1");

	var oFeeder2 = new Feeder("Feeder2",{
		type: FeederType.Medium,
		text: sTextTest,
		submit: handleSubmit
		}).placeAt("uiArea2");

	var oFeeder3 = new Feeder("Feeder3",{
		type: FeederType.Comment,
		submit: handleSubmit,
		placeholderText: sPlaceholderTextXSS
		}).placeAt("uiArea3");

	QUnit.module("Appearance");

	QUnit.test("Feeder styles", function(assert) {

		assert.ok(oFeeder1.$().height() > oFeeder2.$().height(), "Large feeder higher than medium feeder");
		assert.ok(oFeeder2.$().height() > oFeeder3.$().height(), "Medium feeder higher than comment feeder");

	});

	QUnit.test("Output of Attribute", function(assert) {
		// image must be rendered
		assert.equal(oFeeder1.$("thumb").attr("src"), "test-resources/sap/ui/ux3/images/feeder/m_01.png", "Image rendered");

		// no given image - default image?

		// placeholder text for empty feeder
		assert.ok(oFeeder1.$("input").find(".sapUiFeederEmptyText").get(0), "Placeholder rendered");

		// placeholder text as set in the feeder attribute
		assert.equal(oFeeder1.$("input").find(".sapUiFeederEmptyText").get(0).innerHTML, sPlaceholderText, "Placeholder text rendered");

		// placeholdertext is escaped
		assert.equal(bPlaceholderXSSPossible, true, "Placeholder text escaped");

		// disabled button for empty feeder
		assert.ok(oFeeder1.$("send").hasClass('sapUiBtnDsbl'), "Send button is disabled if no text entered");

		// given Text must be rendered - no placeholder
		assert.equal(oFeeder2.$("input").text(), sTextTest, "given text rendered");
		assert.ok(!oFeeder2.$("input").find(".sapUiFeederEmptyText").get(0), "no text placeholder rendered");

		// if text is given Buttom must be enabled
		assert.ok(!oFeeder2.$("send").hasClass('sapUiBtnDsbl'), "Send button is enabled if text entered");

	});

	QUnit.module("Behaviour");

	QUnit.test("Focus handling1", function(assert) {
		var done = assert.async();
		// click in empty text - placeholder must disapear
		oFeeder1.getDomRef("input").focus();
		var delayedCall = function() {
			assert.ok(!oFeeder1.$("input").find(".sapUiFeederEmptyText").get(0), "After Focus in Input area no text placeholder rendered");
		done();
		};
		setTimeout(delayedCall, 0);

	});

	QUnit.test("Focus handling2", function(assert) {
		var done = assert.async();
		// click in empty text - placeholder must disapear
		oFeeder3.getDomRef("input").focus();
		var delayedCall = function() {
			assert.ok(oFeeder1.$("input").find(".sapUiFeederEmptyText").get(0), "After focus out of Input area no text placeholder rendered");
		done();
		};
		setTimeout(delayedCall, 0);

	});

	QUnit.test("Mouse navigation", function(assert) {
		var done = assert.async();
		// click on button must submit text
		qutils.triggerMouseEvent("Feeder2-send", "click");
		var delayedCall = function() {
			assert.equal(sSubmitId, "Feeder2","Click on Submit button fires submit event.");
			assert.equal(sSubmitText, sTextTest,"Submit event returns submitted text.");
			assert.equal(oFeeder2.getText(), "","Text of feeder must be cleared after submit");
			assert.ok(oFeeder2.$("input").find(".sapUiFeederEmptyText").get(0),"Text placeholder rendered after submit");
			sSubmitId = "";
			sSubmitText = "";
			done();
		};
		setTimeout(delayedCall, 0);

		// similar test on disabled button not possible because bwrowser fires no click event for disabled buttons
		// but our qutil event trigger don't cares about this

	});

	QUnit.test("Keyboard Navigation", function(assert) {
		var done = assert.async();
		// by typing text button must be enabled
		oFeeder1.getDomRef("input").focus();
		oFeeder1.$("input").text("A");
		qutils.triggerKeyup("Feeder1-input", KeyCodes.A, true, false, false);
		assert.ok(!oFeeder1.$("send").attr('disabled'), "After text is entered button must be enabled");

		// focus out - set text property
		oFeeder2.getDomRef("input").focus();
		var delayedCall = function() {
			assert.equal(oFeeder1.getText(), "A", "After focus out the text must be in text-property");

			// on deleting text button must be disabled
			oFeeder1.getDomRef("input").focus();
			oFeeder1.$("input").text("");
			qutils.triggerKeyup("Feeder1-input", KeyCodes.BACKSPACE, false, false, false);
			var delayedCall2 = function() {
				assert.ok(oFeeder1.$("send").hasClass('sapUiBtnDsbl'), "After text is deleted button must be disabled");
				done();
			};
			setTimeout(delayedCall2, 0);
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.test('Multiline Text', function(assert) {

		// Helper function which allows to test the multiline text method using different input code per browser/engine
		function testInput(expected, inputValues) {

			var input = '';

			if (Device.browser.webkit) {
				input = inputValues.webkit;
			} else if (Device.browser.msie || Device.browser.edge) {
				input = inputValues.msie;
			} else if (Device.browser.firefox) {
				input = inputValues.firefox;
			}

			oFeeder1.oInput.html(input);
			assert.equal(oFeeder1.getMultilineText(oFeeder1.oInput), expected, "Expected text: '" + expected + "'. Input: '" + input + "'");
			oFeeder1.oInput.html('');
		}

		// Normally typed
		testInput('Multi\nLine\n\nText', {
			webkit: 'Multi<div>Line</div><div><br></div><div>Text</div>',
			firefox: 'Multi<br>Line<br><br>Text<br type="_moz">',
			msie: '<P>Multi</P><P>Line</P><P>&nbsp;</P><P>Text</P>'
		});

		// Copied from Outlook #1
		testInput('&@$!Ööaaaaâaãāacc', {
			webkit: '<span>&amp;@$!</span><b><span>Ö</span></b><span>öaaaaâaãāacc</span>',
			firefox: '<span>&amp;@$!</span><b><span>Ö</span></b><span>öaaaaâaãāacc</span>',
			msie: '<SPAN>&amp;@$!</SPAN><B><SPAN>Ö</SPAN></B><SPAN>öaaaaâaãāacc</SPAN>'
		});

		// Copied from Outlook #2
		testInput('Formatted Text\nFrom Outlook', {
			webkit: '<p class="MsoNormal"><b><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">Fo</span></sup></u></b><i><sup><span style="font-size:18.0pt;\n' +
				'mso-bidi-font-size:11.0pt">rmatte</span></sup></i><b><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">d </span></sup></u></b><b><sup><span style="font-size:18.0pt;\n' +
				'mso-bidi-font-size:11.0pt">Text<u><o:p></o:p></u></span></sup></b></p><p class="MsoNormal">\n\n' +
				'</p><p class="MsoNormal"><b><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">' +
				'From </span></sup></u></b><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">Ou<b>tlook</b>' +
				'</span></sup></u><b><s><u><sup><span style="font-size:26.0pt;mso-bidi-font-size:11.0pt"><o:p></o:p></span></sup></u></s></b></p>',
			firefox: '<!--comment\n-->\n\n<p class="MsoNormal"><b style="mso-bidi-font-weight:normal"><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">' +
				'Fo</span></sup></u></b><i style="mso-bidi-font-style:normal"><sup><span style="font-size:18.0pt;\n' +
				'mso-bidi-font-size:11.0pt">rmatte</span></sup></i><b style="mso-bidi-font-weight:\n' +
				'normal"><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">d </span></sup></u></b><b style="mso-bidi-font-weight:normal">' +
				'<sup><span style="font-size:18.0pt;\nmso-bidi-font-size:11.0pt">Text</span></sup></b></p>\n\n<p class="MsoNormal"><b style="mso-bidi-font-weight:normal">' +
				'<u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">From </span></sup></u></b><u><sup><span style="font-size:18.0pt;mso-bidi-font-size:11.0pt">' +
				'Ou<b style="mso-bidi-font-weight:\nnormal">tlook</b></span></sup></u><b style="mso-bidi-font-weight:normal"><s><u><sup><span style="font-size:26.0pt;' +
				'mso-bidi-font-size:11.0pt"></span></sup></u></s></b></p>\n\n<!--comment-->',
			msie: '<P style="MARGIN: 0cm 0cm 0pt" class=MsoNormal><FONT face=Calibri><B style="mso-bidi-font-weight: normal"><U><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">' +
				'Fo</SPAN></SUP></U></B><I style="mso-bidi-font-style: normal"><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">rmatte</SPAN></SUP></I>' +
				'<B style="mso-bidi-font-weight: normal"><U><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">d </SPAN></SUP></U></B><B style="mso-bidi-font-weight: ' +
				'normal"><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">Text<U><?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" />' +
				'<o:p></o:p></U></SPAN></SUP></B></FONT></P>\n<P style="MARGIN: 0cm 0cm 0pt" class=MsoNormal><FONT face=Calibri><B style="mso-bidi-font-weight: normal">' +
				'<U><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">From </SPAN></SUP></U></B><U><SUP><SPAN style="FONT-SIZE: 18pt; mso-bidi-font-size: 11.0pt">' +
				'Ou<B style="mso-bidi-font-weight: normal">tlook</B></SPAN></SUP></U></FONT><B style="mso-bidi-font-weight: normal"><S><U><SUP><SPAN style="FONT-SIZE: 26pt; ' +
				'mso-bidi-font-size: 11.0pt"><o:p></o:p></SPAN></SUP></U></S></B></P>'
		});

		// Copied from Word
		testInput('Text\nFrom\nWord', {
			webkit: '<p class="MsoNoSpacing">Text<o:p></o:p></p>\n\n<p class="MsoNoSpacing">From<o:p></o:p></p>\n\n<p class="MsoNoSpacing">Word<o:p></o:p></p>',
			firefox: '<!--comment-->\n\n<p class="MsoNoSpacing">Text</p>\n\n<p class="MsoNoSpacing">From</p>\n\n<p class="MsoNoSpacing">Word</p>\n\n<!--comment-->',
			msie: '<P style="MARGIN: 0cm 0cm 0pt" class=MsoNoSpacing><FONT size=3><FONT face=Calibri>Text<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></FONT></FONT></P>' +
				'<P style="MARGIN: 0cm 0cm 0pt" class=MsoNoSpacing><FONT size=3><FONT face=Calibri>From<o:p></o:p></FONT></FONT></P>' +
				'<P style="MARGIN: 0cm 0cm 0pt" class=MsoNoSpacing><FONT size=3><FONT face=Calibri>Word<o:p></o:p></FONT></FONT></P>'
		});

	});
});