/* global QUnit */
sap.ui.require([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery"
], function(createAndAppendDiv, jQuery) {
	"use strict";

	QUnit.module("jQuery.fn.width/height/...");

	QUnit.test("returns integer instead of float", function(assert) {
		var oElement = createAndAppendDiv("testWidth");
		var $Element = jQuery(oElement);

		$Element.height("100.2px");

		assert.equal($Element.height(), 100, "The height should be rounded");
		$Element.remove();
	});

	QUnit.test("returns null instead of undefined when the jQuery set contains 0 element", function(assert) {
		var $NoElement = jQuery("#some-non-existing-id");

		assert.strictEqual($NoElement.width(), null, "The return value from width() should be null");
	});


	QUnit.module("Restore deleted APIs");

	QUnit.test("jQuery.fn.size()", function(assert) {
		var $Head = jQuery("head");

		assert.equal($Head.size(), $Head.length, "size() function should return the same value as .length");
	});

	QUnit.test("jQuery.fn.context", function(assert) {
		var oElement = createAndAppendDiv("testContext");

		assert.equal(jQuery(oElement).context, oElement, "context is set correctly");
		assert.equal(jQuery("foo").context, window.document, "context is set correctly");
		assert.equal(jQuery("#testContext").context, window.document, "context is set correctly");
		assert.strictEqual(jQuery("<div></div>").context, undefined, "context is set correctly");
		assert.strictEqual(jQuery("<div>").context, undefined, "context is set correctly");
		assert.strictEqual(jQuery("").context, undefined, "context is set correctly");
		assert.strictEqual(jQuery(314).context, undefined, "context is set correctly");
		assert.strictEqual(jQuery().context, undefined, "context is set correctly");
		assert.strictEqual(jQuery(null).context, undefined, "context is set correctly");

		jQuery(oElement).remove();
	});

	QUnit.test("jQuery.fn.andSelf()", function(assert) {
		var oElement1 = createAndAppendDiv("andSelf1");
		createAndAppendDiv("andSelf2");

		var $TwoElements = jQuery(oElement1).next().andSelf();

		assert.equal($TwoElements.length, 2, "andSelf() works as expected");

		$TwoElements.remove();
	});

	QUnit.test("jQuery.event.props", function(assert) {
		assert.ok(jQuery.event.props, "jQuery.event.props is there");
	});

	QUnit.test("jQuery.event.fixHooks", function(assert) {
		assert.ok(jQuery.event.fixHooks, "jQuery.event.fixHooks is there");
	});


	QUnit.module("jQuery.fn.offset");

	QUnit.test("doesn't throw exceptions when the jQuery set is empty", function(assert) {
		var $NoElement = jQuery("#some-non-existing-id");

		try {
			assert.strictEqual($NoElement.offset(), undefined);
		} catch (e) {
			assert.ok(false, "no error should be thrown");
		}
	});


	QUnit.module("jQuery.Deferred");

	QUnit.test(".then(some_function), some_function should be called synchronously with the resolve of the Deferred", function(assert) {
		var oDeferred = jQuery.Deferred();
		var oSpy = this.spy();

		oDeferred.then(oSpy);

		oDeferred.resolve();
		assert.equal(oSpy.callCount, 1, "The 'then' callback is called");
	});


	QUnit.test(".then(some_function), some_function should be called with jQuery.Deferred.promise as 'this' context", function(assert) {
		var oDeferred = jQuery.Deferred();
		var oPromise = oDeferred.promise();
		var oSpy = this.spy();

		oDeferred.then(oSpy);

		oDeferred.resolve();
		assert.equal(oSpy.callCount, 1, "The 'then' callback is called");
		assert.ok(oSpy.calledOn(oPromise), "'this' context is set to the promise");
	});

	QUnit.test(".then(some_function), some_function should be called with the same 'this context' as the resolve function when it's called with a specific context", function(assert) {
		var oDeferred = jQuery.Deferred();
		var oSpy = this.spy();
		var oContext = Object.create(null);

		oDeferred.then(oSpy);

		oDeferred.resolve.call(oContext);
		assert.equal(oSpy.callCount, 1, "The 'then' callback is called");
		assert.ok(oSpy.calledOn(oContext), "'this' context is set to the same as the resolve function");
	});

	QUnit.module("Warning to the usage of deprecated APIs", {
		beforeEach: function(assert) {
			this.oWarningSpy = this.spy(console, "warn");
			this.checkWarnMessage = function(sExpectedMessage) {
				assert.equal(this.oWarningSpy.callCount, 1, "A warning is written");
				assert.ok(this.oWarningSpy.getCall(0).args[0].indexOf(sExpectedMessage) !== -1);
				assert.ok(this.oWarningSpy.getCall(0).args[0].indexOf("removed") === -1);

				this.oWarningSpy.resetHistory();
			};
		}
	});

	QUnit.test("jQXHR.success()/error()/complete()", function(assert) {
		var $XHR = jQuery.ajax({
			url: "some-url-to-test"
		});

		$XHR.success(function() {});
		this.checkWarnMessage("jQXHR.success is deprecated");

		$XHR.error(function() {});
		this.checkWarnMessage("jQXHR.error is deprecated");

		$XHR.complete(function() {});
		this.checkWarnMessage("jQXHR.complete is deprecated");
	});

	QUnit.test("jQuery.fn.error()/load()/unload()", function(assert) {
		var $Image = jQuery("<img></img>");
		jQuery("body").append($Image);

		$Image.load();
		this.checkWarnMessage("jQuery.fn.load() is deprecated");

		$Image.unload();
		this.checkWarnMessage("jQuery.fn.unload() is deprecated");

		$Image.error();
		this.checkWarnMessage("jQuery.fn.error() is deprecated");
	});

	QUnit.test("deferred.pipe()", function(assert) {
		var oDeferred = jQuery.Deferred();

		oDeferred.then(function() {});
		assert.equal(this.oWarningSpy.callCount, 0, "no warning is written");

		oDeferred.pipe(function() {}, function() {});
		this.checkWarnMessage("deferred.pipe() is deprecated");
	});

	QUnit.test("jQuery.fx.interval", function(assert) {
		jQuery.fx.interval = 100;
		this.checkWarnMessage("jQuery.fx.interval is deprecated");
	});

	QUnit.test("jQuery.fn.bind()/unbind()/delegate()/undelegate()", function(assert) {
		var $Div = jQuery("<div></div>"),
			$Body = jQuery("body");

		$Body.append($Div);

		var fnClick = function() {};

		$Div.bind("click", fnClick);
		this.checkWarnMessage("jQuery.fn.bind() is deprecated");

		$Div.unbind("click", fnClick);
		this.checkWarnMessage("jQuery.fn.unbind() is deprecated");

		$Body.delegate("div", "click", fnClick);
		this.checkWarnMessage("jQuery.fn.delegate() is deprecated");

		$Body.undelegate("div", "click", fnClick);
		this.checkWarnMessage("jQuery.fn.undelegate() is deprecated");

		$Div.remove();
	});

	QUnit.test("Event 'ready'on document", function(assert) {
		jQuery(document).on("ready", function() {});
		this.checkWarnMessage("'ready' event is deprecated");
	});

	QUnit.test("jQuery.parseJSON()", function(assert) {
		jQuery.parseJSON("{}");
		this.checkWarnMessage("jQuery.parseJSON is deprecated");
	});

	QUnit.test("jQuery.isNumeric()", function(assert) {
		jQuery.isNumeric("123");
		this.checkWarnMessage("jQuery.isNumeric() is deprecated");
	});

	QUnit.test("jQuery.type()", function(assert) {
		jQuery.type("123");
		this.checkWarnMessage("jQuery.type is deprecated");
	});

	QUnit.test("jQuery.unique()", function(assert) {
		jQuery.unique(jQuery("body"));
		this.checkWarnMessage("jQuery.unique is deprecated");
	});

	QUnit.test("jQuery.expr[':'] and jQuery.expr.filters", function(assert) {
		jQuery.expr[':'];
		this.checkWarnMessage("jQuery.expr[':'] is deprecated");

		jQuery.expr.filters;
		this.checkWarnMessage("jQuery.expr.filters is deprecated");
	});

	QUnit.test("jQuery.fn.toggleClass([boolean])", function(assert) {
		jQuery("body").toggleClass(true);
		this.checkWarnMessage("jQuery.fn.toggleClass( boolean ) is deprecated");
	});

	QUnit.test("jQuery.fn.removeAttr on boolean attribute", function(assert) {
		var $Input = jQuery("<input readonly='true'></input>");
		jQuery("body").append($Input);

		$Input.removeAttr("readonly");
		this.checkWarnMessage("jQuery.fn.removeAttr no longer sets boolean properties");

		$Input.remove();
	});

	QUnit.test("jQuery.event.props, jQuery.event.props.concat(), jQuery.event.fixHooks", function(assert) {
		var oEvent = document.createEvent("MouseEvent");
		oEvent.initEvent("mousedown", true, true);

		jQuery.event.props = ["pageX"];
		jQuery.event.fix(oEvent);
		this.checkWarnMessage("jQuery.event.props are deprecated");


		jQuery.event.fixHooks = {
			mousedown: {
				props: ["pageY"]
			}
		};

		jQuery.event.fix(oEvent);
		this.checkWarnMessage("jQuery.event.fixHooks are deprecated");
	});

	QUnit.test("jQuery.holdReady()", function(assert) {
		jQuery.holdReady(true);
		this.checkWarnMessage("jQuery.holdReady is deprecated");
		jQuery.holdReady(false);
	});

	QUnit.test("jQuery.isFunction()", function(assert) {
		jQuery.isFunction(jQuery.fn.size);
		this.checkWarnMessage("jQuery.isFunction() is deprecated");
	});

	QUnit.test("jQuery.isWindow()", function(assert) {
		jQuery.isWindow(window);
		this.checkWarnMessage("jQuery.isWindow() is deprecated");
	});

	QUnit.test("jQuery.fn.click() and etc. event shorthand", function(assert) {
		var $Button = jQuery("<button></button>");
		jQuery("body").append($Button);

		$Button.click(function() {});
		this.checkWarnMessage("jQuery.fn.click() event shorthand is deprecated");

		$Button.remove();
	});

	QUnit.test("jQuery.trim()", function(assert) {
		jQuery.trim("");
		this.checkWarnMessage("jQuery.trim is deprecated; use String.prototype.trim");
	});

	QUnit.test("jQuery.nodeName()", function(assert) {
		jQuery.nodeName(jQuery("body"));
		this.checkWarnMessage("jQuery.nodeName is deprecated");
	});

	QUnit.test("jQuery.cssProps", function(assert) {
		jQuery.cssProps.float = "cssFloat";
		this.checkWarnMessage("jQuery.cssProps is deprecated");
	});

	QUnit.test("jQuery.isArray", function(assert) {
		jQuery.isArray([]);
		this.checkWarnMessage("jQuery.isArray is deprecated");
	});

	QUnit.test("jQuery.fn.css with number-typed value", function(assert) {
		var $Div = jQuery("<div></div>");
		jQuery("body").append($Div);

		$Div.css("fake-property", 200);
		this.checkWarnMessage("Number-typed values are deprecated for jQuery.fn.css");
	});

	QUnit.test("jQuery - automatic <tbody> creation when adding <tr> elements to a <table> element", function(assert) {
		var $table = jQuery("<table></table>");
		$table.append("<tr><td>lorem ipsum</td></tr>");

		this.checkWarnMessage(
			"Trying to add a <tr> element to a <table> without a <tbody>. " +
			"At this point, jQuery version 2 would have inserted a <tbody> element for you. " +
			"Since jQuery version 3, jQuery does not automatically create a <tbody> element anymore. " +
			"Please add the <tbody> on your own, if your code or CSS expects it."
		);
	});

	QUnit.test("jQuery fluent interfaces", function(assert) {
		// existing element width/height
		var w = jQuery("<div></div>").width("100px").width();
		assert.strictEqual(w, 100, "No error occured. jQuery width() function can correctly be chained.");
		var h = jQuery("<div></div>").height("200px").height();
		assert.strictEqual(h, 200, "No error occured. jQuery height() function can correctly be chained.");

		// existing element outerWidth/outerHeight
		var ow = jQuery("<div></div>").outerWidth("100px").outerWidth();
		assert.strictEqual(ow, 100, "No error occured. jQuery outerWidth() function can correctly be chained.");
		var oh = jQuery("<div></div>").outerHeight("200px").outerHeight();
		assert.strictEqual(oh, 200, "No error occured. jQuery outerHeight() function can correctly be chained.");

		// existing element outerWidth/outerHeight (getter argument: 'true')
		var owTrue = jQuery("<div></div>").outerWidth("100px").outerWidth(true);
		assert.strictEqual(owTrue, 100, "No error occured. jQuery outerWidth() function can correctly be chained.");
		var ohTrue = jQuery("<div></div>").outerHeight("200px").outerHeight(true);
		assert.strictEqual(ohTrue, 200, "No error occured. jQuery outerHeight() function can correctly be chained.");

		// existing element innerWidth/innerHeight
		var iw = jQuery("<div></div>").innerWidth("100px").innerWidth();
		assert.strictEqual(iw, 100, "No error occured. jQuery innerWidth() function can correctly be chained.");
		var ih = jQuery("<div></div>").innerHeight("200px").innerHeight();
		assert.strictEqual(ih, 200, "No error occured. jQuery innerHeight() function can correctly be chained.");

		// missing element width/height
		var mw = jQuery("#missing").width("100px").width();
		assert.strictEqual(mw, null, "Missing Element: No error occured. jQuery width() function can correctly be chained and returns null for empty jQuery element sets.");
		var mh = jQuery("#missing").height("200px").height();
		assert.strictEqual(mh, null, "Missing Element: No error occured. jQuery height() function can correctly be chained and returns null for empty jQuery element sets.");

		// missing element outerWidth/outerHeight
		var mow = jQuery("#missing").outerWidth("100px").outerWidth();
		assert.strictEqual(mow, null, "Missing Element: No error occured. jQuery outerWidth() function can correctly be chained and returns null for empty jQuery element sets.");
		var moh = jQuery("#missing").outerHeight("200px").outerHeight();
		assert.strictEqual(moh, null, "Missing Element: No error occured. jQuery outerHeight() function can correctly be chained and returns null for empty jQuery element sets.");

		// missing element outerWidth/outerHeight (getter argument: 'true')
		var mowTrue = jQuery("#missing").outerWidth("100px").outerWidth(true);
		assert.strictEqual(mowTrue, null, "Missing Element: No error occured. jQuery outerWidth() function can correctly be chained and returns null for empty jQuery element sets.");
		var mohTrue = jQuery("#missing").outerHeight("200px").outerHeight(true);
		assert.strictEqual(mohTrue, null, "Missing Element: No error occured. jQuery outerHeight() function can correctly be chained and returns null for empty jQuery element sets.");

		// missing element innerWidth/innerHeight
		var miw = jQuery("#missing").innerWidth("100px").innerWidth();
		assert.strictEqual(miw, null, "Missing Element: No error occured. jQuery innerWidth() function can correctly be chained and returns null for empty jQuery element sets.");
		var mih = jQuery("#missing").innerHeight("200px").innerHeight();
		assert.strictEqual(mih, null, "Missing Element: No error occured. jQuery innerHeight() function can correctly be chained and returns null for empty jQuery element sets.");
	});
});
