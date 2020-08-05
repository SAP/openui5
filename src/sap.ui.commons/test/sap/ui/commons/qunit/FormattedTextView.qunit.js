/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/FormattedTextView",
	"sap/ui/commons/Link",
	"sap/ui/commons/Image",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Button"
], function(
	createAndAppendDiv,
	FormattedTextView,
	Link,
	Image,
	jQuery,
	Button
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4"]);



	var oHtmlText = 'If this does not work, please write an email to: <embed data-index=\"0\"><br>';
	oHtmlText += '&lt;i&gt;Here is an XSS attack that alerts "XSS attack"&lt;/i&gt;<br>';
	oHtmlText += '&lt;scr' + 'ipt&gt;alert("XSS attack");&lt;/scr' + 'ipt&gt;&lt;br&gt;';
	oHtmlText += '&lt;ul&gt;';
	oHtmlText += '&lt;li&gt;some list item here&lt;/li&gt;';
	oHtmlText += '&lt;li&gt;some image in here: <embed data-index=\"1\">&lt;/li&gt;';
	oHtmlText += '&lt;/ul&gt;<br><embed data-index=\"2\">';
	var code = oHtmlText.replace(/<br>/g, "");
	code = oHtmlText.replace(/&lt;/g, "<");
	code = code.replace(/&gt;/g, ">");

	var oFTV = new FormattedTextView("textView1", {htmlText: code});
	var oLink = new Link("l1", {
		text: "Test me",
		tooltip: "This will send a mail to test.me@sap.com",
		href: "mailto:test.me@sap.com"
	});
	oFTV.addControl(oLink);

	var oLink2 = new Link("l2", {
		text: "Test me too",
		tooltip: "This will send a mail to test.me@sap.com",
		href: "mailto:test.me@sap.com"
	});
	oFTV.addControl(oLink2);

	var oImage = new Image("i1", {
		src : "http://www.sap.com/global/images/SAPLogo.gif", // sap.ui.core.URI
		visible : true, // boolean
		decorative : false, // boolean
		alt : "SAP", // string
		tooltip : "SAP Logo" // sap.ui.core.TooltipBase
	});
	oFTV.addControl(oImage);

	oFTV.addControl(new Link("l3", {
		text: "Do not test me",
		tooltip: "This will not send anything anywhere because it should not appear",
		href: "mailto:test.me@sap.com"
		})
	);

	oFTV.placeAt("uiArea1");

	var oFTV2 = oFTV.clone();
	oFTV2.placeAt("uiArea2");
	oFTV2.setVisible(false);

	var oFTV3 = new FormattedTextView("textView3");
	oFTV3.placeAt("uiArea3");

	var oFTV4 = new FormattedTextView("textView4");
	oFTV4.placeAt('uiArea4');

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		// Visible
		assert.ok(jQuery("#textView1").get(0), "Visible, expected defined");
		assert.equal(jQuery("#textView1-__clone0").get(0), undefined, "Invisible");
	});

	QUnit.test("Placeholders", function(assert) {
		var placeHolderPattern = new RegExp("\<embed data-index=\"([0-9]*[0-9])\">", "gim");
		var oTVDom = document.getElementById('textView1');
		var renderedText = jQuery(oTVDom).text();
		assert.ok((placeHolderPattern.exec(renderedText) == null), "All placeholders correctly replaced");

	});

	QUnit.test("Sanitizing", function(assert) {
		var goodText = 'Within this formatted text view, sanitizing is tested. You should not see anything but empty space between START and END below this sentence.<br>';
		var evilText = goodText + 'START ' + '<img src="http://www.sap.com/global/images/SAPLogo.gif">'; // <p> is now alloed in FTV + '&lt;p&gt;Here is an XSS attack that alerts "XSS attack"&lt;/p&gt;';
		evilText  += '&lt;scr' + 'ipt&gt;alert("XSS attack");&lt;/scr' + 'ipt&gt;' + 'END';
		evilText = evilText.replace(/&lt;/g, "<");
		evilText = evilText.replace(/&gt;/g, ">");
		oFTV3.setHtmlText(evilText);
		sap.ui.getCore().applyChanges();
		goodText += 'START ' + 'END';
		var deliveredText = jQuery(document.getElementById('textView3')).html();
		assert.equal(deliveredText, goodText, "Text has been sanitized");
	});


	QUnit.test("Invalid Controls", function(assert) {
		var controlAdded = true;
		try {
			oFTV.addControl(new Button('b1',{ text: 'Button'}));
		} catch (e){
			controlAdded = false;
		}
		assert.ok(controlAdded, "Button is not an allowed control within FormattedTextView");
	});

	QUnit.test("Content with html and embed placeholder is rendered", function(assert) {
		var LinkToEmbed = new Link('lte', { text: 'LinkToEmbed', href:'www.sap.com'});
		oFTV4.setContent('<div>This div is a FormattedTextView Control</div><embed data-index="0">', [LinkToEmbed]);
		sap.ui.getCore().applyChanges();

		var renderedHTML = sap.ui.getCore().byId('textView4').getDomRef().innerHTML;
		assert.ok(~renderedHTML.indexOf('<div'), 'The div is rendered');
		assert.ok(~renderedHTML.indexOf('<a'), 'The link is rendered');
	});
});