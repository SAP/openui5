/* global QUnit */

QUnit.config.autostart = false;
sap.ui.test.qunit.delayTestStart();

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/ui/dom/units/Rem",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/ResizeHandler"
], function(
	Core,
	Control,
	Device,
	AlignedFlowLayout,
	Rem,
	IntervalTrigger,
	ResizeHandler
) {
	"use strict";

	/* global ResizeObserver */

	var CONTENT_ID = "content";

	var Input = Control.extend("Input", {
		metadata: {
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<input");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());

			// normalize user agent stylesheet
			oRm.addStyle("border-width", "2px");
			oRm.addStyle("box-sizing", "border-box");
			oRm.addStyle("vertical-align", "top");
			oRm.writeStyles();
			oRm.write(">");
		}
	});

	var Button = Control.extend("Button", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "lorem ipsum"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<button");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.addStyle("box-sizing", "border-box");
			oRm.addStyle("vertical-align", "top");
			oRm.writeStyles();
			oRm.write(">");
			oRm.writeEscaped(oControl.getText());
			oRm.write("</button>");
		}
	});

	var TextArea = Control.extend("TextArea", {
		metadata: {
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<textarea");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());

			// normalize user agent stylesheet
			oRm.addStyle("box-sizing", "border-box");
			oRm.addStyle("vertical-align", "top");
			oRm.addStyle("margin", "0");
			oRm.addStyle("padding", "0");
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("</textarea>");
		}
	});

	QUnit.module("", {
		beforeEach: function(assert) {

			// act
			this.oAlignedFlowLayout = new AlignedFlowLayout({
				minItemWidth: "240px", // 15rem
				maxItemWidth: "480px"  // 30rem
			});
			this.oContentDomRef = document.getElementById(CONTENT_ID);

			// arrange
			this.oAlignedFlowLayout.placeAt(CONTENT_ID);
			Core.applyChanges();
		},
		afterEach: function(assert) {

			// cleanup
			if (this.oAlignedFlowLayout) {
				this.oAlignedFlowLayout.destroy();
				this.oAlignedFlowLayout = null;
			}

			Core.applyChanges();
			this.oContentDomRef.style.width = "";
			this.oContentDomRef.style.height = "";
			this.oContentDomRef = null;
		}
	});

	QUnit.test("it should render a flow layout container without items", function(assert) {

		// arrange
		var CSS_CLASS = this.oAlignedFlowLayout.getRenderer().CSS_CLASS,
			oDomRef = this.oAlignedFlowLayout.getDomRef(),
			oStyles = getComputedStyle(oDomRef);

		// assert
		assert.ok(oDomRef.classList.contains(CSS_CLASS), "it should set the CSS class");
		assert.strictEqual(oStyles.position, "relative", 'it should set the "position" CSS property to "relative"');
		assert.strictEqual(oStyles.display, "flex", 'it should set the "display" CSS property to "flex"');
		assert.strictEqual(oStyles.flexWrap, "wrap", 'it should set the "flex-wrap" CSS property to "wrap"');
		assert.strictEqual(parseInt(oStyles.margin || 0), 0, "it should not have margin by default");
		assert.strictEqual(parseInt(oStyles.padding || 0), 0, "it should not have padding by default");
		assert.strictEqual(oDomRef.childElementCount, 0, "it should not have child elements");
	});

	QUnit.test("it should render a flow layout container with one item", function(assert) {

		// arrange
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		Core.applyChanges();
		var CSS_CLASS = this.oAlignedFlowLayout.getRenderer().CSS_CLASS + "Item",
			oItemDomRef = this.oAlignedFlowLayout.getDomRef().firstElementChild,
			oStyles = getComputedStyle(oItemDomRef),
			sItemMaxWidth = oStyles.maxWidth;

		// assert
		assert.ok(oItemDomRef.classList.contains(CSS_CLASS));
		assert.strictEqual(oStyles.flexGrow, "1", 'it should set the "flex-grow" CSS property to "1"');
		assert.strictEqual(oStyles.flexShrink, "0", 'it should set the "flex-shrink" CSS property to "0"');
		assert.strictEqual(oItemDomRef.style.flexBasis, "240px", 'it should set the "flex-basis" CSS property to "240px"');
		assert.strictEqual(sItemMaxWidth, "480px", 'it should set the "max-width" CSS property to "480px"');
	});

	QUnit.test("the end item should not overflow its container", function(assert) {
		var done = assert.async();

		// arrange
		var oButton = new Button();

		// act
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		this.oAlignedFlowLayout.addStyleClass("sapUiLargeMargin"); // add margin to detect overflow
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {
			var oDomRef = this.oAlignedFlowLayout.getDomRef(),
				oItemDomRef = oButton.getDomRef().parentElement,
				oItemStyles = getComputedStyle(oItemDomRef);

			// assert
			assert.ok(oDomRef.offsetHeight > 0, 'it should set the height of the layout content area to a value greater than "0px"');
			assert.ok(oDomRef.offsetHeight === oItemDomRef.offsetHeight, "the end item should not overflow its container");
			assert.strictEqual(oItemDomRef.offsetTop, 0, "the end item should not overflow its container");
			assert.strictEqual(oItemDomRef.style.width, "", "it should not set the width to prevent a collisions when the end item is the only child");
			assert.strictEqual(oItemStyles.flexBasis, "auto", 'it should set the "flex-basis" CSS property to "auto"');
			done();
		}.bind(this));
	});

	QUnit.test("the end item should not overflow its container if its height is higher than the other items", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oTextArea = new TextArea({
			height: "250px"
		});

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oTextArea);

		// arrange
		this.oContentDomRef.style.width = "1280px";
		this.oAlignedFlowLayout.addStyleClass("sapUiLargeMargin"); // add margin to detect overflow
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {
			var oItemDomRef = oTextArea.getDomRef().parentElement;

			// assert
			assert.strictEqual(oItemDomRef.offsetTop, 0, "the end item should not overflow its container");
			done();
		});
	});

	// BCP: 1970272412
	QUnit.test("it should align the end item correctly", function(assert) {

		// arrange
		var oButton = new Button();
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oContentDomRef.style.width = "400px";
		Core.applyChanges();
		var oItemDomRef = oButton.getDomRef().parentElement;

		// assert
		if (Core.getConfiguration().getRTL()) {
			assert.strictEqual(oItemDomRef.offsetLeft, 0, "the end item should be left aligned");
		} else {
			assert.strictEqual(oItemDomRef.offsetLeft + oItemDomRef.offsetWidth, 400, "the end item should be right aligned");
		}
	});

	QUnit.test("it should set the maximum width of items", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// arrange
		this.oContentDomRef.style.width = "1000px";
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		var iExpectedWidth = 500;

		// act
		this.oAlignedFlowLayout.setMaxItemWidth(iExpectedWidth + "px");
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, iExpectedWidth);
			assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, iExpectedWidth);
			done();
		});
	});

	QUnit.test("the maximum width win over the minimum width", function(assert) {

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// arrange
		this.oContentDomRef.style.width = "1000px";
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		var iExpectedWidth = 500;

		// act
		this.oAlignedFlowLayout.setMaxItemWidth(iExpectedWidth + "px");
		this.oAlignedFlowLayout.setMinItemWidth((iExpectedWidth + 10) + "px");
		Core.applyChanges();

		// assert
		assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, iExpectedWidth);
		assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, iExpectedWidth);
	});

	QUnit.test("getLastItemDomRef should return the last item DOM reference", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		Core.applyChanges();

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastItemDomRef() === this.oAlignedFlowLayout.getContent()[0].getDomRef().parentElement);
	});

	QUnit.test("getLastItemDomRef should not return the null empty object reference", function(assert) {

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastItemDomRef() === null);
	});

	QUnit.test("getLastVisibleDomRef should return the last visible DOM reference", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		Core.applyChanges();

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastVisibleDomRef() === this.oAlignedFlowLayout.getLastItemDomRef());
	});

	QUnit.test("getLastVisibleDomRef should return the last visible DOM reference", function(assert) {

		// system under test
		var oInput = new Input();
		var oButton = new Button();

		// act
		this.oAlignedFlowLayout.addContent(oInput);
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		Core.applyChanges();

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastVisibleDomRef() === this.oAlignedFlowLayout.getDomRef("endItem"));
	});

	QUnit.test("getLastVisibleDomRef should return the null empty object reference", function(assert) {

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastVisibleDomRef() === null);
	});

	QUnit.test("it should not raise an exception when the content is destroyed", function(assert) {

		// system under test
		var oButton = new Button();

		// arrange
		this.oAlignedFlowLayout.addEndContent(oButton);

		// act
		this.oAlignedFlowLayout.destroyContent();
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.getContent().length, 0);
	});

	QUnit.test("it should not set maximum width to the end item", function(assert) {

		// system under test
		var oButton = new Button({
			width: "60rem"
		});

		// act
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		Core.applyChanges();
		var oEndItem = oButton.getDomRef().parentElement;
		var sMaxItemWidth = "60rem";

		// assert
		assert.strictEqual(oEndItem.style.maxWidth, "");
		assert.strictEqual(Rem.fromPx(oEndItem.offsetWidth) + "rem", sMaxItemWidth);
	});

	// BCP: 1880394379
	QUnit.test("it should not raise an exception", function(assert) {

		// system under test
		var oInput = new Input();
		var oButton = new Button();

		// arrange
		this.oAlignedFlowLayout.addContent(oInput);
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.stub(this.oAlignedFlowLayout, "getLastItemDomRef").returns(null);

		// act
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// assert
		assert.ok(true);
	});

	if (typeof ResizeObserver === "function") {

		QUnit.test("it should invoke the .disconnect() method of the resize observer object " +
					"when the control is destroyed", function(assert) {

			// system under test
			var oAlignedFlowLayout = new AlignedFlowLayout();

			// arrange
			oAlignedFlowLayout.placeAt(CONTENT_ID);
			Core.applyChanges();
			var oDisconnectSpy = this.spy(oAlignedFlowLayout.oResizeObserver, "disconnect");

			// act + cleanup
			oAlignedFlowLayout.destroy();

			// assert
			assert.strictEqual(oDisconnectSpy.callCount, 1);
			assert.ok(oAlignedFlowLayout.oResizeObserver === null, "the resize observer object should refer to null");
		});

		QUnit.test("it should not trigger unnecessary function calls to the .reflow() method to" +
					" (prevent cyclic dependencies (test case 1))", function(assert) {

			var done = assert.async();

			// system under test
			var oAlignedFlowLayout = new AlignedFlowLayout({
				content: [
					new Input()
				],
				endContent: [
					new Button({
						text: "Lorem ipsum"
					})
				]
			});

			// arrange
			oAlignedFlowLayout.placeAt(CONTENT_ID);

			// enforces a sync rendering of the AlignedFlowLayout control
			Core.applyChanges();

			var spy = this.spy;

			// wait some time until the browser layout is finished
			window.requestAnimationFrame(function() {
				var oLayoutDomRef = oAlignedFlowLayout.getDomRef(),
					oEndItemDomRef = oAlignedFlowLayout.getDomRef("endItem"),
					oReflowSpy = spy(oAlignedFlowLayout, "reflow"),
					fLayoutWidth = oLayoutDomRef.offsetWidth,
					fEndItemWidth = oEndItemDomRef.offsetWidth;

				// override the AlignedFlowLayout's internal field member named
				// "fLayoutWidth", so that no width change is detected by the control
				oAlignedFlowLayout.fLayoutWidth = fLayoutWidth;

				// override the AlignedFlowLayout's internal field member named
				// "fEndItemWidth", so that no width change is detected by the control
				oAlignedFlowLayout.fEndItemWidth = fEndItemWidth;

				// act + arrange, update height of the AlignedFlowLayout control,
				// this should not trigger a function call to the .reflow() method
				oLayoutDomRef.style.height = "100px";

				// wait some time until the browser layout is finished
				setTimeout(fnAfterBrowserReflow, 100);

				function fnAfterBrowserReflow() {

					// assert
					var sMessage = "a function call to the .reflow() method should not be" +
					" triggered when the height of the layout control changes";

					if (oReflowSpy.callCount) {
						assert.strictEqual(window.devicePixelRatio, 1, "Test will fail because of unexpected devicePixelRatio");
					}


					assert.strictEqual(oReflowSpy.callCount, 0, sMessage);

					// cleanup
					oReflowSpy.restore();
					oAlignedFlowLayout.destroy();
					done();
				}
			});
		});

		QUnit.test("it should not trigger unnecessary function calls to the .reflow() method to" +
					" (prevent cyclic dependencies (test case 2))", function(assert) {

			var done = assert.async();

			// system under test
			var oAlignedFlowLayout = new AlignedFlowLayout("lorem", {
				content: [
					new Input()
				],
				endContent: [
					new Button({
						width: "100px", // set a fixed width for reliable testing
						height: "20px", // set a fixed height for reliable testing
						text: "Lorem ipsum"
					})
				]
			});

			// arrange
			oAlignedFlowLayout.placeAt(CONTENT_ID);

			// enforces a sync rendering of the AlignedFlowLayout control
			Core.applyChanges();

			var spy = this.spy;

			// wait some time until the browser layout is finished
			window.requestAnimationFrame(function() {
				var oLayoutDomRef = oAlignedFlowLayout.getDomRef(),
					oEndItemDomRef = oAlignedFlowLayout.getDomRef("endItem"),
					oReflowSpy = spy(oAlignedFlowLayout, "reflow"),
					fLayoutWidth = oLayoutDomRef.offsetWidth,
					fEndItemWidth = oEndItemDomRef.offsetWidth;

				// override the AlignedFlowLayout's internal field member named
				// "fLayoutWidth", so that no width change is detected by the control
				oAlignedFlowLayout.fLayoutWidth = fLayoutWidth;

				// override the AlignedFlowLayout's internal field member named
				// "fEndItemWidth", so that no width change is detected by the control
				oAlignedFlowLayout.fEndItemWidth = fEndItemWidth;

				// act + arrange, update height of the item holding the `endContent`
				// aggregation, this should not trigger a function call to the .reflow()
				// method
				oEndItemDomRef.style.height = "40px";

				// wait some time until the browser layout is finished
				setTimeout(fnAfterBrowserReflow, 100);

				function fnAfterBrowserReflow() {

					// assert
					var sMessage = "a function call to the .reflow() method should not be" +
					" triggered when the height of the item holding the `endContent` aggregation" +
					" changes";

					if (oReflowSpy.callCount) {
						assert.strictEqual(window.devicePixelRatio, 1, "Test will fail because of unexpected devicePixelRatio");
					}

					assert.strictEqual(oReflowSpy.callCount, 0, sMessage);

					// cleanup
					oReflowSpy.restore();
					oAlignedFlowLayout.destroy();
					done();
				}
			});
		});
	}

	QUnit.module("wrapping", {
		beforeEach: function(assert) {

			// act
			this.oAlignedFlowLayout = new AlignedFlowLayout({
				minItemWidth: "240px", // 15rem
				maxItemWidth: "480px"  // 30rem
			});
			this.oContentDomRef = document.getElementById(CONTENT_ID);
			this.CSS_CLASS_ONE_LINE = this.oAlignedFlowLayout.getRenderer().CSS_CLASS + "OneLine";
		},
		afterEach: function(assert) {

			// cleanup
			if (this.oAlignedFlowLayout) {
				this.oAlignedFlowLayout.destroy();
				this.oAlignedFlowLayout = null;
			}

			this.oContentDomRef.style.width = "";
			this.oContentDomRef = null;
			this.CSS_CLASS_ONE_LINE = "";
		}
	});

	QUnit.test("checkItemsWrapping should return false when no child controls are rendered (test case 1)", function(assert) {

		// arrange
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
	});

	QUnit.test("checkItemsWrapping should return false when no child controls are rendered (test case 2)", function(assert) {
		var done = assert.async();

		// arrange
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			done();
		}.bind(this));
	});

	QUnit.test("checkItemsWrapping should return false when the control is not rendered", function(assert) {

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
	});

	QUnit.test("it should not wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			done();
		}.bind(this));
	});

	QUnit.test("it should not wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oButton = new Button({
			width: "200px"
		});

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
			done();
		}.bind(this));
	});

	QUnit.test("it should not wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oButton = new Button({
			width: "200px",
			text: "" /* notice no text */
		});

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
			done();
		}.bind(this));
	});

	QUnit.test("it should not wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);

		// arrange
		this.oContentDomRef.style.width = "200px";
		this.oAlignedFlowLayout.setMinItemWidth("100px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			done();
		}.bind(this));
	});

	QUnit.test("it should not wrap the items onto multiple lines and arrange the items evenly across the available horizontal space", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oButton = new Button({
			width: "200px"
		});

		// arrange
		this.oContentDomRef.style.width = "300px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();
		this.oContentDomRef.style.width = "1024px";

		// wait some time until the browser layout finished
		setTimeout(fnAfterResize.bind(this), 200);

		function fnAfterResize() {

			window.requestAnimationFrame(function() {

				// assert
				assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
				assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput3.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput4.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oButton.getDomRef().parentElement.offsetWidth, 200);
				assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
				done();
			}.bind(this));
		}
	});

	QUnit.test("the end item should not overlap the items on the first line if its height is higher than the other items", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input({
			height: "20px"
		});
		var oInput2 = new Input({
			height: "20px"
		});
		var oInput3 = new Input({
			height: "20px"
		});
		var oInput4 = new Input({
			height: "20px"
		});
		var oTextArea = new TextArea({
			height: "40px"
		});

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oTextArea);

		// arrange
		this.oContentDomRef.style.width = "600px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {
			var oItemDomRef = oTextArea.getDomRef().parentElement;

			// assert
			assert.strictEqual(oItemDomRef.offsetTop, 20, "the end item should not overlap the items on the first line");
			done();
		});
	});

	// BCP: 1980003456
	QUnit.test("the end item should not overlap other items (first line mode)", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oButton = new Button({
			text: "Adapt Filters",
			width: "200px"
		});

		// arrange
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.setMaxItemWidth("400rem");
		this.oContentDomRef.style.width = "1000px";

		// make the AlignedFlowLayout control's parent DOM element hidden before the control
		// is initially rendered
		this.oContentDomRef.style.display = "none";

		// puts the AlignFlowLayout control into the specified parent DOM element (container)
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// After the AlignedFlowLayout control is initially rendered, make it visible,
		// by making its parent DOM element visible.
		// This should change the size of the AlignedFlowLayout control and subsequently
		// triggers a resize event.
		this.oContentDomRef.style.display = "";

		// Attach an event listener to the central core interval timeout timer to wait
		// for the first resize event after the layout is made visible.
		IntervalTrigger.addListener(fnAfterResize, this);

		function fnAfterResize() {
			IntervalTrigger.removeListener(fnAfterResize, this);

			// wait some time until the browser layout is finished
			window.requestAnimationFrame(function() {

				var oEndItemDomRef = oButton.getDomRef().parentElement,
					oPreviousItemDomRef = oInput4.getDomRef().parentElement,
					bOverlapX;

				if (Core.getConfiguration().getRTL()) {
					bOverlapX = oPreviousItemDomRef.offsetLeft < (oEndItemDomRef.offsetLeft + oEndItemDomRef.offsetWidth);
				} else {
					bOverlapX = oEndItemDomRef.offsetLeft < (oPreviousItemDomRef.offsetLeft + oPreviousItemDomRef.offsetWidth);
				}

				// assert
				assert.strictEqual(bOverlapX, false);
				done();
			});
		}
	});

	// BCP: 1970364898
	QUnit.test("the end item should not overlap other items (first line mode)", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1;
		var oInput2;
		var oInput3;
		var oAdaptFiltersButton;
		var oAlignedFlowLayout = new AlignedFlowLayout({
			minItemWidth: "192px", // default 12rem
			maxItemWidth: "384px", // default 24rem
			content: [
				oInput1 = new Input({
					width: "100%"
				}),

				oInput2 = new Input({
					width: "100%"
				}),

				oInput3 = new Input({
					width: "100%"
				})
			],
			endContent: [
				oAdaptFiltersButton = new Button({
					text: "Dostosowanie filtrów (1)",
					width: "135px" // set a fixed width for reliable testing
				}),

				new Button({
					text: "Rozpoczęcie",
					width: "80px" // set a fixed width for reliable testing
				})
			]
		});

		// set the container's width of the AlignedFlowLayout control
		this.oContentDomRef.style.width = "791px";

		// puts the AlignFlowLayout control into the specified parent DOM element (container)
		oAlignedFlowLayout.placeAt(CONTENT_ID);

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// Attach an event listener to the central core interval timeout timer to wait
		// for the first resize event after the layout is made visible.
		IntervalTrigger.addListener(fnAfterResize, this);

		function fnAfterResize() {
			IntervalTrigger.removeListener(fnAfterResize, this);

			// wait some time until the browser layout is finished
			window.requestAnimationFrame(function() {
				var oItemDomRef1 = oInput1.getDomRef().parentElement,
					oItemDomRef2 = oInput2.getDomRef().parentElement,
					oItemDomRef3 = oInput3.getDomRef().parentElement,
					oEndContendItemDomRef = oAdaptFiltersButton.getDomRef().parentElement,
					bOverlapX;

				if (Core.getConfiguration().getRTL()) {
					bOverlapX = oItemDomRef3.offsetLeft < (oEndContendItemDomRef.offsetLeft + oEndContendItemDomRef.offsetWidth);
				} else {
					bOverlapX = oEndContendItemDomRef.offsetLeft < (oItemDomRef3.offsetLeft + oItemDomRef3.offsetWidth);
				}

				// - the available container width is 791px
				// - the min item width is set to 192px (default) and there are 3 flexible item (192 * 3) = 576px
				// - the the end content item width is set to 135px + 80px = 215px
				// So, it should be possible to display all items in the first line without overlapping
				var iItemsComputedWidth = oItemDomRef1.offsetWidth + oItemDomRef2.offsetWidth + oItemDomRef3.offsetWidth + oEndContendItemDomRef.offsetWidth;

				// assert
				assert.strictEqual(oItemDomRef1.offsetWidth, 192, "the item should have the minimum specified width");
				assert.strictEqual(oItemDomRef2.offsetWidth, 192, "the item should have the minimum specified width");
				assert.strictEqual(oItemDomRef3.offsetWidth, 192, "the item should have the minimum specified width");
				assert.strictEqual(oEndContendItemDomRef.offsetWidth, 215, "the end content item should have the specified width");
				assert.strictEqual(iItemsComputedWidth, 791, "the computed width of the items should be equal to the container width");
				assert.strictEqual(oAlignedFlowLayout.checkItemsWrapping(), false, "the items should fit into a single line (no wrapping onto multiple lines)");
				assert.strictEqual(bOverlapX, false, "the last two items should not overlap");

				// cleanup
				oAlignedFlowLayout.destroy();
				done();
			});
		}
	});

	// BCP: 2080119767
	QUnit.test("the item in the end content area should not overlap other items when its size changes" +
				" after the initial rendering", function(assert) {
		var done = assert.async();

		// system under test
		var oAdaptFiltersButton;
		var oAlignedFlowLayout = new AlignedFlowLayout({
			minItemWidth: "192px", // default 12rem
			maxItemWidth: "384px", // default 24rem
			content: [
				new Input({
					width: "100%"
				}),

				new Input({
					width: "100%"
				}),

				new Input({
					width: "100%"
				})
			],
			endContent: [
				oAdaptFiltersButton = new Button({
					text: "Adapt Filters",
					width: "100px" // set a fixed width for reliable testing
				}),

				new Button({
					text: "Go",
					width: "34px" // set a fixed width for reliable testing
				})
			]
		});

		// arrange
		// set the container's width of the AlignedFlowLayout control
		this.oContentDomRef.style.width = "710px";

		// puts the AlignFlowLayout control into the specified parent DOM element (container)
		oAlignedFlowLayout.placeAt(CONTENT_ID);

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// increase the width of the the item in the end content area
		oAdaptFiltersButton.setText("Adapt Filters (1)");
		oAdaptFiltersButton.setWidth("200px");

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// wait some time until the browser layout finished
		setTimeout(fnAfterReflow.bind(this), 200);

		// assert
		function fnAfterReflow() {

			// - the available container width is 710px
			// - the min item width is set to 192px (default) and there are 3 flexible item (192 * 3) = 576px
			// - the the end content item width is set to 200px + 34px = 234px
			assert.strictEqual(oAlignedFlowLayout.checkItemsWrapping(), true);

			// cleanup
			oAlignedFlowLayout.destroy();
			done();
		}
	});

	QUnit.test("the end item should not overlap other items (multiple lines mode)", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1;
		var oInput2;
		var oInput3;
		var oAdaptFiltersButton;
		var oAlignedFlowLayout = new AlignedFlowLayout({
			minItemWidth: "192px", // default 12rem
			maxItemWidth: "384px", // default 24rem
			content: [
				oInput1 = new Input({
					width: "100%",
					height: "20px"
				}),

				oInput2 = new Input({
					width: "100%",
					height: "20px"
				}),

				oInput3 = new Input({
					width: "100%",
					height: "20px"
				})
			],
			endContent: [
				oAdaptFiltersButton = new Button({
					text: "Dostosowanie filtrów (1)",
					width: "135px", // set a fixed width for reliable testing
					height: "20px"
				}),

				new Button({
					text: "Rozpoczęcie",
					width: "80px", // set a fixed width for reliable testing
					height: "20px"
				})
			]
		});

		// set the container's width of the AlignedFlowLayout control
		this.oContentDomRef.style.width = "390px";

		// puts the AlignFlowLayout control into the specified parent DOM element (container)
		oAlignedFlowLayout.placeAt(CONTENT_ID);

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// Attach an event listener to the central core interval timeout timer to wait
		// for the first resize event after the layout is made visible.
		IntervalTrigger.addListener(fnAfterResize, this);

		function fnAfterResize() {
			IntervalTrigger.removeListener(fnAfterResize, this);

			// wait some time until the browser layout is finished
			window.requestAnimationFrame(function() {
				var oItemDomRef1 = oInput1.getDomRef().parentElement,
					oItemDomRef2 = oInput2.getDomRef().parentElement,
					oItemDomRef3 = oInput3.getDomRef().parentElement,
					oEndContendItemDomRef = oAdaptFiltersButton.getDomRef().parentElement;

				// assert
				assert.strictEqual(oItemDomRef1.offsetWidth, 195, "the item should have a computed width of 195px");
				assert.strictEqual(oItemDomRef1.offsetTop, 0, "the item should be in the first line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oItemDomRef1.offsetLeft, 195, "the item should be aligned to the upper right corner");
				} else {
					assert.strictEqual(oItemDomRef1.offsetLeft, 0, "the item should be aligned to the upper left corner");
				}

				assert.strictEqual(oItemDomRef2.offsetWidth, 195, "the item should have a computed width of 195px");
				assert.strictEqual(oItemDomRef2.offsetTop, 0, "the item should be in the first line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oItemDomRef2.offsetLeft, 0, "the item should be aligned to the left of the first item");
				} else {
					assert.strictEqual(oItemDomRef2.offsetLeft, 195, "the item should be aligned to the right of the first item");
				}

				assert.strictEqual(oItemDomRef3.offsetWidth, 195, "the item should have a computed width of 195px");
				assert.strictEqual(oItemDomRef3.offsetTop, 20, "the item should be in the second line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oItemDomRef3.offsetLeft, 195, "the item should be aligned to the right corner");
				} else {
					assert.strictEqual(oItemDomRef3.offsetLeft, 0, "the item should be aligned to the left corner");
				}

				assert.strictEqual(oEndContendItemDomRef.offsetWidth, 215, "the end content item should have the specified width");
				assert.strictEqual(oEndContendItemDomRef.offsetTop, 40, "the end content item should be in the third line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oEndContendItemDomRef.offsetLeft, 0, "the item should be aligned to the right");
				} else {
					assert.strictEqual(oEndContendItemDomRef.offsetLeft, 175, "the item should be aligned to the left");
				}

				// cleanup
				oAlignedFlowLayout.destroy();
				done();
			});
		}
	});

	QUnit.test("the end item should not overlap other items (multiple lines mode)", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1;
		var oInput2;
		var oInput3;
		var oAdaptFiltersButton;
		var oAlignedFlowLayout = new AlignedFlowLayout({
			minItemWidth: "192px", // default 12rem
			maxItemWidth: "384px", // default 24rem
			content: [
				oInput1 = new Input({
					width: "100%",
					height: "20px"
				}),

				oInput2 = new Input({
					width: "100%",
					height: "20px"
				}),

				oInput3 = new Input({
					width: "100%",
					height: "20px"
				})
			],
			endContent: [
				oAdaptFiltersButton = new Button({
					text: "Dostosowanie filtrów (1)",
					width: "500px", // set a fixed width for reliable testing
					height: "20px"
				}),

				new Button({
					text: "Rozpoczęcie",
					width: "500px", // set a fixed width for reliable testing
					height: "20px"
				})
			]
		});

		// set the container's width of the AlignedFlowLayout control
		this.oContentDomRef.style.width = "960px";

		// puts the AlignFlowLayout control into the specified parent DOM element (container)
		oAlignedFlowLayout.placeAt(CONTENT_ID);

		// enforces a sync rendering of the AlignedFlowLayout control
		Core.applyChanges();

		// Attach an event listener to the central core interval timeout timer to wait
		// for the first resize event after the layout is made visible.
		IntervalTrigger.addListener(fnAfterResize, this);

		function fnAfterResize() {
			IntervalTrigger.removeListener(fnAfterResize, this);

			window.requestAnimationFrame(function() {
				var oItemDomRef1 = oInput1.getDomRef().parentElement,
					oItemDomRef2 = oInput2.getDomRef().parentElement,
					oItemDomRef3 = oInput3.getDomRef().parentElement,
					oEndContendItemDomRef = oAdaptFiltersButton.getDomRef().parentElement;

				// assert
				assert.strictEqual(oItemDomRef1.offsetWidth, 320, "the item should have a computed width of 320px");
				assert.strictEqual(oItemDomRef1.offsetTop, 0, "the item should be in the first line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oItemDomRef1.offsetLeft, 640, "the item should be aligned to the upper right corner");
				} else {
					assert.strictEqual(oItemDomRef1.offsetLeft, 0, "the item should be aligned to the upper left corner");
				}

				assert.strictEqual(oItemDomRef2.offsetWidth, 320, "the item should have a computed width of 320px");
				assert.strictEqual(oItemDomRef2.offsetTop, 0, "the item should be in the first line");
				assert.strictEqual(oItemDomRef2.offsetLeft, 320, "the item should be aligned to the left of the first item");

				assert.strictEqual(oItemDomRef3.offsetWidth, 320, "the item should have a computed width of 320px");
				assert.strictEqual(oItemDomRef3.offsetTop, 0, "the item should be in the first line");

				if (Core.getConfiguration().getRTL()) {
					assert.strictEqual(oItemDomRef3.offsetLeft, 0, "the item should be aligned to the upper left corner");
				} else {
					assert.strictEqual(oItemDomRef3.offsetLeft, 640, "the item should be aligned to the upper right corner");
				}

				assert.strictEqual(oEndContendItemDomRef.offsetLeft + oEndContendItemDomRef.offsetWidth, 960, "the end content item should be aligned to the right corner");
				assert.strictEqual(oEndContendItemDomRef.offsetTop, 20, "the end content item should be in the second line");

				// cleanup
				oAlignedFlowLayout.destroy();
				done();
			});
		}
	});

	QUnit.test("it should adapt the position of the absolute-positioned end item when a standard CSS padding class is added", function(assert) {
		var done = assert.async();

		// system under test
		var oInput = new Input();
		var oButton = new Button({
			text: "lorem ipsum"
		});

		// arrange
		this.oContentDomRef.style.width = "600px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.addContent(oInput);
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oAlignedFlowLayout.addStyleClass("sapUiAFLayoutWithPadding"); // add a padding of 30px
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {
			var oEndItemComputedStyle = window.getComputedStyle(oButton.getDomRef().parentElement, null);

			// assert
			if (Core.getConfiguration().getRTL()) {
				assert.strictEqual(oEndItemComputedStyle.getPropertyValue("left"), "30px");
			} else {
				assert.strictEqual(oEndItemComputedStyle.getPropertyValue("right"), "30px");
			}

			assert.strictEqual(oEndItemComputedStyle.getPropertyValue("bottom"), "30px");
			done();
		});
	});

	QUnit.test("it should wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);

		// arrange
		this.oContentDomRef.style.width = "199px";
		this.oAlignedFlowLayout.setMinItemWidth("100px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), true);
			done();
		}.bind(this));
	});

	QUnit.test("it should wrap the items onto multiple lines", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var oButton = new Button({
			width: "200px"
		});

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		this.oContentDomRef.style.width = "800px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();
		var oItemDomRef1 = oInput1.getDomRef().parentElement,
			oItemDomRef2 = oInput2.getDomRef().parentElement,
			oItemDomRef3 = oInput3.getDomRef().parentElement,
			oItemDomRef4 = oInput3.getDomRef().parentElement,
			oEndContendItemDomRef = oButton.getDomRef().parentElement;

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(oItemDomRef1.offsetWidth, 200, "the item should have the minimum specified width");
			assert.strictEqual(oItemDomRef2.offsetWidth, 200, "the item should have the minimum specified width");
			assert.strictEqual(oItemDomRef3.offsetWidth, 200, "the item should have the minimum specified width");
			assert.strictEqual(oItemDomRef4.offsetWidth, 200, "the item should have the minimum specified width");
			assert.strictEqual(oEndContendItemDomRef.offsetWidth, 200, "the end content item should have the specified width");
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), true, "the items should wraps onto multiple lines");
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(undefined, { excludeEndItem: true }), false, "the items (excluding the end content item) should fit into a single line (no wrapping onto multiple lines)");
			done();
		}.bind(this));
	});

	QUnit.test("it should wrap the items onto multiple lines and the end item should not overlap other items", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oInput3 = new Input();
		var oInput4 = new Input();
		var iButtonWidth = 200;
		var oButton = new Button({
			width: iButtonWidth + "px"
		});

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.setMinItemWidth("200px");
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);
		this.oAlignedFlowLayout.addContent(oInput3);
		this.oAlignedFlowLayout.addContent(oInput4);
		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();
		var iLayoutWidth = 300;
		this.oContentDomRef.style.width = iLayoutWidth + "px";

		// wait some time until the browser layout finished
		setTimeout(fnAfterResize.bind(this), 200);

		function fnAfterResize() {

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), true);
			assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, iLayoutWidth);
			assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, iLayoutWidth);
			assert.strictEqual(oInput3.getDomRef().parentElement.offsetWidth, iLayoutWidth);
			assert.strictEqual(oInput4.getDomRef().parentElement.offsetWidth, iLayoutWidth);
			assert.strictEqual(oButton.getDomRef().parentElement.offsetWidth, iButtonWidth);
			assert.notOk(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
			done();
		}
	});

	QUnit.test("it should arrange child controls evenly across the available horizontal space without exceeding its maximum width", function(assert) {
		var done = assert.async();

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(oInput.getDomRef().parentElement.offsetWidth, 480);
			done();
		});
	});

	QUnit.test("it should arrange child controls evenly across the available horizontal space without exceeding its maximum width", function(assert) {
		var done = assert.async();

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// assert
			assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, 480);
			assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, 480);
			done();
		});
	});

	QUnit.test("getLastItemDomRef should return the null empty object reference", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastItemDomRef() === null);
	});

	// BCP: 2070317759
	QUnit.test("it should not raise an exception when the unobserveSizeChanges() method " +
				"is invoked with null/undefined as an argument", function(assert) {

		// act
		try {
			this.oAlignedFlowLayout.unobserveSizeChanges(null);
			this.oAlignedFlowLayout.unobserveSizeChanges();
		} catch (oException) {
			assert.notOk(true);
		}

		assert.ok(true);
	});

	QUnit.test("considers marginRight usage for layoutItems and endItem", function(assert) {

		var done = assert.async();

		this.oContentDomRef.style.display = "";
		this.oContentDomRef.style.width = "600px";

		var oInput1 = new Input();
		var oInput2 = new Input();
		this.oAlignedFlowLayout.addContent(oInput1);

		this.oAlignedFlowLayout.addContent(oInput2);
		var oButton = new Button({
			width: "200px", // set a fixed width for reliable testing
			height: "20px" // set a fixed height for reliable testing);
		});

		this.oAlignedFlowLayout.addEndContent(oButton);
		this.oAlignedFlowLayout.setMinItemWidth(200 + "px"); // leave room for margin
		this.oAlignedFlowLayout.setMaxItemWidth(200 + "px");

		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		Core.applyChanges();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {
			assert.equal(this.oAlignedFlowLayout.checkItemsWrapping(), false, "items fit without margins");

			var aItems = this.oAlignedFlowLayout.getDomRef().querySelectorAll(".sapUiAFLayoutItem");
			this.oContentDomRef.style.width = "624px";

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].style.marginRight = "12px";
			}

			window.requestAnimationFrame(function() {
				assert.equal(this.oAlignedFlowLayout.checkItemsWrapping(), false, "items with margin still fit");
				this.oContentDomRef.style.width = "636px";
				this.oAlignedFlowLayout.getDomRef("endItem").style.marginRight = "16px";
				this.oAlignedFlowLayout.getDomRef().querySelector(".sapUiAFLayoutSpacer").style.marginRight = "16px";
				window.requestAnimationFrame(function() {
					assert.equal(this.oAlignedFlowLayout.checkItemsWrapping(), true, "endItem margin too large");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("suspend", {
		beforeEach: function(assert) {

			// arrange
			this.oAlignedFlowLayout = new AlignedFlowLayout({
				minItemWidth: "240px", // 15rem
				maxItemWidth: "480px",  // 30rem
				content: [
					new Input(),
					new Input()
				],
				endContent: [
					new Button()
				]
			});

			this.oContentDomRef = document.getElementById(CONTENT_ID);
			this.oAlignedFlowLayout.placeAt(CONTENT_ID);
			Core.applyChanges();
		},
		afterEach: function(assert) {

			// cleanup
			if (this.oAlignedFlowLayout) {
				this.oAlignedFlowLayout.destroy();
				this.oAlignedFlowLayout = null;
			}

			this.oContentDomRef.style.width = "";
			this.oContentDomRef = null;
			Core.applyChanges();
		}
	});

	QUnit.test("it should unobserve size changes after the resize handler is suspended", function(assert) {
		var done = assert.async(),
			spy = this.spy;

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// arrange
			var oDomRef = this.oAlignedFlowLayout.getDomRef();
			ResizeHandler.suspend(oDomRef);
			var oReflowSpy = spy(this.oAlignedFlowLayout, "reflow");

			// act
			this.oAlignedFlowLayout.onResize();

			// assert
			window.requestAnimationFrame(function() {
				assert.ok(this.oAlignedFlowLayout.bReflowSuspended, "the reflow suspended flag should be set to true");
				assert.strictEqual(oReflowSpy.callCount, 0, "the reflow method should not be called if the resize handler is suspended");
				oReflowSpy.restore();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("it should call the .reflow() method after the layout was suspended and " +
				"resumed from resizing changes notifications", function(assert) {

		var done = assert.async();

		// wait some time until the browser layout is finished
		window.requestAnimationFrame(function() {

			// arrange
			var oDomRef = this.oAlignedFlowLayout.getDomRef();

			// act
			ResizeHandler.suspend(oDomRef);
			this.oAlignedFlowLayout.onResize();
			var bReflowSuspended = this.oAlignedFlowLayout.bReflowSuspended;
			ResizeHandler.resume(oDomRef);

			// assert
			assert.ok(bReflowSuspended, true, "the reflow suspended flag should be set to true after suspend");
			assert.strictEqual(this.oAlignedFlowLayout.bReflowSuspended, false, "the reflow suspended flag should be set to false after resume");

			done();
		}.bind(this));
	});

});
