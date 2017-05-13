/*global QUnit*/

QUnit.config.autostart = false;
sap.ui.test.qunit.delayTestStart();

sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/layout/AlignedFlowLayout"
], function(Control, Device, AlignedFlowLayout) {
	"use strict";

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
			oRm.write("></input>");
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
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<button");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("box-sizing", "border-box");
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
				minItemWidth: "15rem",
				maxItemWidth: "30rem"
			});
			this.oContentDomRef = document.getElementById(CONTENT_ID);

			// arrange
			this.oAlignedFlowLayout.placeAt(CONTENT_ID);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(assert) {

			// cleanup
			this.oAlignedFlowLayout.destroy();
			this.oAlignedFlowLayout = null;
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

		if (!Device.browser.phantomJS) {
			assert.strictEqual(oStyles.display, "flex", 'it should set the "display" CSS property to "flex"');
			assert.strictEqual(oStyles.flexWrap, "wrap", 'it should set the "flex-wrap" CSS property to "wrap"');
		}

		assert.strictEqual(oStyles.listStyleType, "none", 'it should set the "list-style-type" CSS property to "none"');
		assert.strictEqual(parseInt(oStyles.margin || 0, 10), 0, "it should not have margin by default");
		assert.strictEqual(parseInt(oStyles.padding || 0, 10), 0, "it should not have padding by default");
		assert.strictEqual(oDomRef.childElementCount, 0, "it should not have child elements");
	});

	QUnit.test("it should render a flow layout container with one item", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		sap.ui.getCore().applyChanges();
		var CSS_CLASS = this.oAlignedFlowLayout.getRenderer().CSS_CLASS + "Item",
			oItemDomRef = this.oAlignedFlowLayout.getDomRef().firstElementChild,
			oStyles = getComputedStyle(oItemDomRef);

		// assert
		assert.ok(oItemDomRef.classList.contains(CSS_CLASS));

		if (!Device.browser.phantomJS) {
			assert.strictEqual(oStyles.flexGrow, "1", 'it should set the "flex-grow" CSS property to "1"');
			assert.strictEqual(oStyles.flexShrink, "0", 'it should set the "flex-shrink" CSS property to "0"');
			assert.strictEqual(oItemDomRef.style.flexBasis, "15rem", 'it should set the "flex-basis" CSS property to "15rem"');
		}

		assert.strictEqual(oStyles.maxWidth, "480px", 'it should set the "max-width" CSS property to "480px"');
	});

	QUnit.test("the end item should not overflow its container", function(assert) {

		// system under test
		var oButton = new Button();

		// act
		this.oAlignedFlowLayout.addEndContent(oButton);

		// arrange
		this.oAlignedFlowLayout.addStyleClass("sapUiLargeMargin"); // add margin to detect overflow
		sap.ui.getCore().applyChanges();
		var oDomRef = this.oAlignedFlowLayout.getDomRef(),
			oItemDomRef = oButton.getDomRef().parentElement,
			oItemStyles = getComputedStyle(oItemDomRef);

		// assert
		assert.ok(oDomRef.offsetHeight > 0, 'it should set the height of the layout content area to a value greater than "0px"');
		assert.ok(oDomRef.offsetHeight === oItemDomRef.offsetHeight, "the end item should not overflow its container");
		assert.strictEqual(oItemDomRef.offsetTop, 0, "the end item should not overflow its container");
		assert.strictEqual(oItemDomRef.style.width, "", "it should not set the width to prevent a collisions when the end item is the only child");

		if (!Device.browser.phantomJS) {
			assert.strictEqual(oItemStyles.flexBasis, "auto", 'it should set the "flex-basis" CSS property to "auto"');
		}
	});

	if (!Device.browser.phantomJS) {
		QUnit.test("the end item should not overflow its container if its height is higher than the other items", function(assert) {

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
			sap.ui.getCore().applyChanges();
			var oItemDomRef = oTextArea.getDomRef().parentElement;

			// assert
			assert.strictEqual(oItemDomRef.offsetTop, 0, "the end item should not overflow its container");
		});
	}

	QUnit.test("it should set the maximum width of items", function(assert) {

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
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, iExpectedWidth);
		assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, iExpectedWidth);
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastVisibleDomRef() === this.oAlignedFlowLayout.getDomRef("endItem"));
	});

	QUnit.test("getLastVisibleDomRef should return the null empty object reference", function(assert) {

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastVisibleDomRef() === null);
	});

	QUnit.test("it should not throw an exception when the content is destroyed", function(assert) {

		// system under test
		var oButton = new Button();

		// arrange
		this.oAlignedFlowLayout.addEndContent(oButton);

		// act
		this.oAlignedFlowLayout.destroyContent();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.getContent().length, 0);
	});

	QUnit.module("wrapping", {
		beforeEach: function(assert) {

			// act
			this.oAlignedFlowLayout = new AlignedFlowLayout({
				minItemWidth: "15rem",
				maxItemWidth: "30rem"
			});
			this.oContentDomRef = document.getElementById(CONTENT_ID);
			this.CSS_CLASS_ONE_LINE = this.oAlignedFlowLayout.getRenderer().CSS_CLASS + "OneLine";
		},
		afterEach: function(assert) {

			// cleanup
			this.oAlignedFlowLayout.destroy();
			this.oContentDomRef.style.width = "";
			this.oContentDomRef = null;
			this.CSS_CLASS_ONE_LINE = "";
			this.oAlignedFlowLayout = null;
		}
	});

	QUnit.test("checkItemsWrapping should return false when no child controls are rendered", function(assert) {

		// arrange
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
	});

	QUnit.test("checkItemsWrapping should return false when the control is not rendered", function(assert) {

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
	});

	QUnit.test("it should not wrap the items onto multiple lines", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
	});

	if (!Device.browser.phantomJS) {

		QUnit.test("it should not wrap the items onto multiple lines", function(assert) {

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
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
		});

		QUnit.test("it should not wrap the items onto multiple lines", function(assert) {

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
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
			assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
		});

		QUnit.test("it should not wrap the items onto multiple lines", function(assert) {

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
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
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
			sap.ui.getCore().applyChanges();
			this.oContentDomRef.style.width = "1024px";
			sap.ui.getCore().attachIntervalTimer(fnAfterResize, this);

			function fnAfterResize() {

				// assert
				assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), false);
				assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput3.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oInput4.getDomRef().parentElement.offsetWidth, 206);
				assert.strictEqual(oButton.getDomRef().parentElement.offsetWidth, 200);
				assert.ok(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
				done();

				// cleanup
				sap.ui.getCore().detachIntervalTimer(fnAfterResize, this);
			}
		});

		QUnit.test("the end item should not overlap the items on the first line if its height is higher than the other items", function(assert) {

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
			sap.ui.getCore().applyChanges();
			var oItemDomRef = oTextArea.getDomRef().parentElement;

			assert.strictEqual(oItemDomRef.offsetTop, 20, "the end item should not overlap the items on the first line");
		});
	}

	QUnit.test("it should adapt the position of the absolute-positioned end item when a standard CSS padding class is added", function(assert) {

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
		sap.ui.getCore().applyChanges();
		var oEndItemComputedStyle = window.getComputedStyle(oButton.getDomRef().parentElement, null);

		// assert
		if (sap.ui.getCore().getConfiguration().getRTL()) {
			assert.strictEqual(oEndItemComputedStyle.getPropertyValue("left"), "30px");
		} else {
			assert.strictEqual(oEndItemComputedStyle.getPropertyValue("right"), "30px");
		}
		assert.strictEqual(oEndItemComputedStyle.getPropertyValue("bottom"), "30px");
	});

	QUnit.test("it should wrap the items onto multiple lines", function(assert) {

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
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oAlignedFlowLayout.checkItemsWrapping(), true);
	});

	QUnit.test('it should not set the "sapUiAFLayoutOneLine" CSS class', function(assert) {

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
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(this.oAlignedFlowLayout.getDomRef().classList.contains(this.CSS_CLASS_ONE_LINE));
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
		sap.ui.getCore().applyChanges();
		var iLayoutWidth = 300;
		this.oContentDomRef.style.width = iLayoutWidth + "px";
		sap.ui.getCore().attachIntervalTimer(fnAfterResize, this);

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

			// cleanup
			sap.ui.getCore().detachIntervalTimer(fnAfterResize, this);
		}
	});

	QUnit.test("it should arrange child controls evenly across the available horizontal space without exceeding its maximum width", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInput.getDomRef().parentElement.offsetWidth, 480);
	});

	QUnit.test("it should arrange child controls evenly across the available horizontal space without exceeding its maximum width", function(assert) {

		// system under test
		var oInput1 = new Input();
		var oInput2 = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput1);
		this.oAlignedFlowLayout.addContent(oInput2);

		// arrange
		this.oContentDomRef.style.width = "1024px";
		this.oAlignedFlowLayout.placeAt(CONTENT_ID);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInput1.getDomRef().parentElement.offsetWidth, 480);
		assert.strictEqual(oInput2.getDomRef().parentElement.offsetWidth, 480);
	});

	QUnit.test("getLastItemDomRef should not return the null empty object reference", function(assert) {

		// system under test
		var oInput = new Input();

		// act
		this.oAlignedFlowLayout.addContent(oInput);

		// assert
		assert.ok(this.oAlignedFlowLayout.getLastItemDomRef() === null);
	});
});