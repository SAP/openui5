/*global QUnit*/

jQuery.sap.require("sap.m.FormattedTextAnchorGenerator");
(function (QUnit, AnchorGenerator) {
	"use strict";

	var oStandardSetup = {
		beforeEach: function () {
			this.sStrategy = sap.m.LinkConversion.ProtocolOnly;
			this.sTarget = "_blank";
		},
		afterEach: function () {
			this.sStrategy = null;
			this.sTarget = null;
		}
	};

	var oAllLinksSetup = {
		beforeEach: function () {
			this.sStrategy = sap.m.LinkConversion.All;
			this.sTarget = "_self";
		},
		afterEach: function () {
			this.sStrategy = null;
			this.sTarget = null;
		}
	};

	QUnit.module("AnchorGenerator - Anchor generation of links that have a protocol", oStandardSetup);

	QUnit.test("it should convert potential links starting with starting with http", function (assert) {
		var sInputHtml = '<pre> http://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="http://sapui5.hana.ondemand.com"' +
			' target="_blank">http://sapui5.hana.ondemand.com</a> <h3>www.sap.com</h3></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget)
			.indexOf(this.sTarget), 56);
	});

	QUnit.test("it should convert potential links starting with starting with https", function (assert) {
		var sInputHtml = '<pre> https://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="https://sapui5.hana.ondemand.com"' +
			' target="_blank">https://sapui5.hana.ondemand.com</a> <h3>www.sap.com</h3></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget)
			.indexOf(this.sTarget), 57);
	});

	QUnit.test("it should convert potential links starting with starting with ftp", function (assert) {
		var sInputHtml = '<pre> ftp://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="ftp://sapui5.hana.ondemand.com" ' +
			'target="_blank">ftp://sapui5.hana.ondemand.com</a> <h3>www.sap.com</h3></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget)
			.indexOf(this.sTarget), 55);
	});

	QUnit.test("it should convert potential links using the provided target", function (assert) {
		var sInputHtml = '<pre> http://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="http://sapui5.hana.ondemand.com" ' +
			'target="_blank">http://sapui5.hana.ondemand.com</a> <h3>www.sap.com</h3></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget)
			.indexOf(this.sTarget), 56);
	});

	QUnit.test("it should convert potential links using the provided target when it changes at run time", function (assert) {
		var sInputHtml = '<pre> https://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="https://sapui5.hana.ondemand.com" ' +
				'target="_self">https://sapui5.hana.ondemand.com</a> <h3>www.sap.com</h3></pre>',
			sTarget = "_self";

		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, sTarget).indexOf(sTarget), 57);
	});

	QUnit.test("it shouldn't touching existing anchors", function (assert) {
		var sInputHtml = '<h1><a href="http://sapui5.hana.ondemand.com" target="_blank">http://sapui5.hana.ondemand.com</a></h1>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sInputHtml);

		sInputHtml = '<h1><a href="ftp://sapui5.hana.ondemand.com" target="_blank">ftp://sapui5.hana.ondemand.com</a></h1>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sInputHtml);

		sInputHtml = '<h1><a href="https://sapui5.hana.ondemand.com" target="_blank">https://sapui5.hana.ondemand.com</a></h1>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sInputHtml);
	});

	QUnit.test("links starting protocol in html attribute shouldn't create anchor tags", function (assert) {
		var sInputHtml = '<pre class="http://sapui5.hana.ondemand.com"></pre>';
		var sExpectedOutput = '<pre class="http://sapui5.hana.ondemand.com"></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
	});

	QUnit.module("AnchorGenerator - Anchor generation of links that have protocol and www", oAllLinksSetup);

	QUnit.test("it should convert potential links starting with starting with www and links with protocols as well", function (assert) {
		var sInputHtml = '<pre> http://sapui5.hana.ondemand.com <h3>www.sap.com</h3></pre>';
		var sExpectedOutput = '<pre> <a href="http://sapui5.hana.ondemand.com" target="_self">http://sapui5.hana.ondemand.com</a> ' +
			'<h3><a href="//www.sap.com" target="_self">www.sap.com</a></h3></pre>';

		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget).indexOf(this.sTarget), 56);
	});

	QUnit.test("it should convert potential links starting with starting with www and links with leaving existing anchors untouched", function (assert) {
		var sInputHtml = '<pre> http://sapui5.hana.ondemand.com <h3>www.sap.com</h3> <h4><a href="//www.sap.com" target="_self">www.sap.com</a></h4></pre>';
		var sExpectedOutput = '<pre> <a href="http://sapui5.hana.ondemand.com" target="_self">http://sapui5.hana.ondemand.com</a> <h3><a href="//www.sap.com"' +
			' target="_self">www.sap.com</a></h3> <h4><a href="//www.sap.com" target="_self">www.sap.com</a></h4></pre>';

		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget).indexOf(this.sTarget), 56);

		sInputHtml = '<h3>www.sap.com</h3><h4><a href="//www.sap.com" target="_self">www.sap.com</a></h4>';
		sExpectedOutput = '<h3><a href="//www.sap.com" target="_self">www.sap.com</a></h3><h4><a href="//www.sap.com" target="_self">www.sap.com</a></h4>';

		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget).indexOf(this.sTarget), 36);
	});

	QUnit.test("links starting with www in html attribute shouldn't create anchor tags", function (assert) {
		var sInputHtml = '<pre data-url="http://sapui5.hana.ondemand.com">www.sap.com</pre>';
		var sExpectedOutput = '<pre data-url="http://sapui5.hana.ondemand.com"><a href="//www.sap.com" target="_self">www.sap.com</a></pre>';
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
	});

	QUnit.module("Mixing it all in", oAllLinksSetup);

	QUnit.test("it should work with all of the stuff at once", function (assert) {
		var sInputHtml = '<www.my.tag.com> Imaginary tags that seemingly contain links while containing real links www.my-very-real-webside.info.biz' +
			' is here </www.my.tag.com><h1>Header 1</h1><h3>Header 3</h3><p><a href="//www.sap.com" target="_top" style="color:green;' +
			' font-weight:600;">www.sap.com</a> - opens in a new window.<p><a href="javascript:alert(\'You have clicked a link!\');void(0);">' +
			'script link</a>\n - <code>href=&lt;javascript:..&gt;</code> is not allowed.<ul><li class="https://sapui5.hana.ondemand.com">' +
			'&lt;ul&gt; - &lt;li&gt;</li><li>Span <span class="foo">span class="foo"</span> &bull; <strong>strong</strong> &bull; <em>em</em>' +
			'&bull; <u>u</u></li><li style="background-color: rgb(255, 255, 255);">white background</li></ul>' +
			'<pre www.even.imaginary-attributes_will_not.trick.me.com.biz.info="www.sap.com">https://sapui5.hana.ondemand.com ' +
			'<h3>www.sap.com</h3><h4 class="www.sap.com">Something else https://sapui5.hana.ondemand.com</h4></pre>' +
			'<dl data="https://sapui5.hana.ondemand.com"><dt>dl - dt - de:</dt><dd>Definition list <code>&lt;dl&gt;</code>' +
			' of terms <code>&lt;dt&gt;</code> and descriptions <code>&lt;dd&gt;</code></dd><br><cite>Cite: a reference to a source</cite>' +
			'<pre data-url="http://sapui5.hana.ondemand.com"><a href="//www.sap.com" target="_self">www.sap.com</a></pre>';

		var sExpectedOutput = '<www.my.tag.com> Imaginary tags that seemingly contain links while containing real links ' +
			'<a href=\"//www.my-very-real-webside.info.biz\" target=\"_self\">www.my-very-real-webside.info.biz</a> is here </www.my.tag.com>' +
			'<h1>Header 1</h1><h3>Header 3</h3><p><a href="//www.sap.com" target="_top" style="color:green; font-weight:600;">' +
			'www.sap.com</a> - opens in a new window.<p><a href="javascript:alert(\'You have clicked a link!\');void(0);">script link</a>\n - ' +
			'<code>href=&lt;javascript:..&gt;</code> is not allowed.<ul><li class="https://sapui5.hana.ondemand.com">&lt;ul&gt; - &lt;li&gt;</li>' +
			'<li>Span <span class="foo">span class="foo"</span> &bull; <strong>strong</strong> &bull; <em>em</em>&bull; <u>u</u></li>' +
			'<li style="background-color: rgb(255, 255, 255);">white background</li></ul>' +
			'<pre www.even.imaginary-attributes_will_not.trick.me.com.biz.info="www.sap.com">' +
			'<a href="https://sapui5.hana.ondemand.com" target="_self">https://sapui5.hana.ondemand.com</a> ' +
			'<h3><a href="//www.sap.com" target="_self">www.sap.com</a></h3><h4 class="www.sap.com">Something else ' +
			'<a href="https://sapui5.hana.ondemand.com" target="_self">https://sapui5.hana.ondemand.com</a></h4>' +
			'</pre><dl data="https://sapui5.hana.ondemand.com"><dt>dl - dt - de:</dt><dd>Definition list ' +
			'<code>&lt;dl&gt;</code> of terms <code>&lt;dt&gt;</code> and descriptions <code>&lt;dd&gt;</code></dd><br>' +
			'<cite>Cite: a reference to a source</cite>' +
			'<pre data-url="http://sapui5.hana.ondemand.com"><a href="//www.sap.com" target="_self">www.sap.com</a></pre>';

		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
	});

	QUnit.test("It should convert potential links containing allowed URL special characters. BCP: 1870166773", function (assert) {
		// Arrange
		var sInputHtml = "https://some.domain.sap.com/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN " +
			"<br> https://some.domain.sap.com/sap/bc/bsp/sap/crm_ui_start/default.htm$sap-language=EN";

		var sExpectedOutput = '<a href="https://some.domain.sap.com/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN" target="_self">https://some.domain.sap.com/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN</a> <br> <a href="https://some.domain.sap.com/sap/bc/bsp/sap/crm_ui_start/default.htm$sap-language=EN" target="_self">https://some.domain.sap.com/sap/bc/bsp/sap/crm_ui_start/default.htm$sap-language=EN</a>';

		// Assert
		assert.strictEqual(AnchorGenerator.generateAnchors(sInputHtml, this.sStrategy, this.sTarget), sExpectedOutput);
	});

}(QUnit, sap.m.FormattedTextAnchorGenerator));
