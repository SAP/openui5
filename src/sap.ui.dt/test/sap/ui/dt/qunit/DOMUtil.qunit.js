/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DOMUtil",
	"sap/m/Button",
	"sap/ui/core/HTML",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	DOMUtil,
	Button,
	HTML,
	HorizontalLayout,
	nextUIUpdate
) {
	"use strict";

	var style = document.createElement("style");
	document.head.appendChild(style);
	style.sheet.insertRule('\
		#left-part .withAfterElement::after {\
			content: ":";\
		}\
	');
	style.sheet.insertRule('\
		#left-part .withBeforeElement::before {\
			content: "Nr.";\
			color: white;\
		}\
	');
	style.sheet.insertRule('\
		#left-part .withBeforeElementAndAttrContent::before {\
			content: ":";\
		}\
	');
	style.sheet.insertRule("\
		.shrink {\
			transform: scale(0.1, 0.5);\
			-webkit-transform: scale(0.1, 0.5);\
			-moz-transform: scale(0.1, 0.5);\
			-ms-transform: scale(0.1, 0.5);\
			-o-transform: scale(0.1, 0.5);\
		}\
	");

	/**
	 * getOffsetFromParent
	 */
	QUnit.module("Given that a container is rendered with a bigger content element (for scrollbars)", {
		beforeEach() {
			this.oContent = document.createElement("div");
			this.oContent.style.background = "red";
			this.oContent.style.width = "200px";
			this.oContent.style.height = "200px";
			this.oContent.style.position = "relative";
			this.oContent.style.left = "30px";
			this.oContent.style.top = "40px";
			this.oContainer = document.createElement("div");
			this.oContainer.style.background = "blue";
			this.oContainer.style.width = "100px";
			this.oContainer.style.height = "100px";
			this.oContainer.style.overflow = "auto";
			this.oContainer.append(this.oContent);
			document.getElementById("qunit-fixture").append(this.oContainer);
		},
		afterEach() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getOffsetFromParent is called for the content without scrolling", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent);
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer).left,
				30,
				"the left offset is correct");
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer).top,
				40,
				"the top offset is correct");
		});

		QUnit.test("when getOffsetFromParent is called for the content after scrolling on the container", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent);
			this.oContainer.scrollLeft = 50;
			this.oContainer.scrollTop = 60;
			assert.strictEqual(
				Math.round(DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer).left),
				80,
				"the left offset is correct");
			assert.strictEqual(
				Math.round(DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer).top),
				100,
				"the top offset is correct");
		});
	});

	/**
	 * getZIndex
	 */
	QUnit.module("Given that a control is rendered", {
		beforeEach() {
			this.oButton = new Button({
				text: "Button"
			});

			this.oButton.placeAt("qunit-fixture");
			// Render Controls
			return nextUIUpdate();
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when the DOM reference is available", function(assert) {
			var oButtonDomRef = this.oButton.getDomRef();

			document.getElementById("qunit-fixture").style.zIndex = 1000;
			var zIndex = DOMUtil.getZIndex(oButtonDomRef);
			assert.equal(zIndex, "1000", 'and the static method "getZIndex" returns the right value');
		});

		QUnit.test("when a dom element has no z-index, but his parent ui5Element has", async function(assert) {
			const oButton = new Button();
			const oParentElement = new HorizontalLayout("ParentId", {
				content: [oButton]
			});
			oParentElement.placeAt("qunit-fixture");
			await nextUIUpdate();

			oParentElement.getDomRef().style.zIndex = "7";
			// Manipulate position to have a reliable test independent of control styles
			oParentElement.getDomRef().style.position = "relative";
			oButton.getDomRef().style.position = "static";

			const zIndex = DOMUtil.getZIndex(oButton.getDomRef());
			assert.strictEqual(zIndex, "auto", "the z-index is not taken from the parent");
			oParentElement.destroy();
		});

		QUnit.test("when a dom element has no z-index, but his parent non-ui5 element has", async function(assert) {
			const oParentElement = new HTML("ParentId", {
				content: "<div id='Container'></div>"
			});
			oParentElement.placeAt("qunit-fixture");
			await nextUIUpdate();
			const oContainerDIV = document.getElementById("Container");
			oContainerDIV.style.zIndex = "5";
			oContainerDIV.appendChild(this.oButton.getDomRef());
			const zIndex = DOMUtil.getZIndex(this.oButton.getDomRef());
			assert.strictEqual(zIndex, 5, "the z-index is taken from non ui5 parent");
			oParentElement.destroy();
		});
	});

	/**
	 * getDomRefForCSSSelector
	 */
	QUnit.module("Given that some DOM element with child nodes is rendered...", {
		beforeEach() {
			this.oDomElement = document.createElement("div");
			this.oDomElement.setAttribute("id", "parent");
			this.oDomElement.classList.add("parent");

			var oChild1 = document.createElement("div");
			oChild1.setAttribute("id", "first-child");
			oChild1.classList.add("child");
			this.oDomElement.append(oChild1);
			var oChild2 = document.createElement("div");
			oChild2.setAttribute("id", "second-child");
			oChild2.classList.add("child");
			this.oDomElement.append(oChild2);

			document.getElementById("qunit-fixture").append(this.oDomElement);
		},
		afterEach() {
			this.oDomElement.remove();
		}
	}, function() {
		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref");
			assert.ok(oDomRef, "one element found");
			assert.strictEqual(oDomRef.getAttribute("id"), "parent", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref > #first-child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref > #first-child");
			assert.ok(oDomRef, "one element found");
			assert.strictEqual(oDomRef.getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :first-child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":first-child");
			assert.ok(oDomRef, "one element found");
			assert.strictEqual(oDomRef.getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref > .child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref > .child");
			assert.strictEqual(oDomRef.id, "first-child", "then the first element is returned");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for '> #third-child,> #first-child'", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, "> #third-child, > #first-child");
			assert.ok(oDomRef, "one element found");
			assert.strictEqual(oDomRef.getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called without arguments", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector();
			assert.notOk(oDomRef, "then no element is returned");
		});
	});

	/**
	 * cloneDOMAndStyles
	 */
	QUnit.module("Given that some DOM element with child nodes is rendered...", {
		beforeEach() {
			// TODO: check why classes are not considered when using JS
			var oLeftPart = document.createElement("div");
			oLeftPart.style.cssText = "float: left; width: 50%; height: 100%;";
			oLeftPart.id = "left-part";
			document.getElementById("qunit-fixture").appendChild(oLeftPart);

			var oRightPart = document.createElement("div");
			oRightPart.style.cssText = "float: left; width: 50%; height: 100%;";
			oRightPart.id = "right-part";
			document.getElementById("qunit-fixture").appendChild(oRightPart);

			this.oDomElement = document.createElement("div");
			this.oDomElement.setAttribute("data-find", "div");
			this.oDomElement.className = "withBeforeElement";
			this.oDomElement.style.cssText = "width:200px; height: 200px;";

			var oSpanElement = document.createElement("span");
			oSpanElement.setAttribute("data-find", "span");
			oSpanElement.className = "withAfterElement";
			oSpanElement.style.color = "rgb(255, 0, 0)";
			oSpanElement.textContent = "Text";

			this.oDomElement.appendChild(oSpanElement);
			document.getElementById("left-part").appendChild(this.oDomElement);
		},
		afterEach() {
			this.oDomElement.remove();
			document.getElementById("qunit-fixture").innerHTML = "";
		}
	}, function() {
		QUnit.test("when this element, it's children and styling is copied", function(assert) {
			DOMUtil.cloneDOMAndStyles(this.oDomElement, document.getElementById("right-part"));

			var oCopyDiv = document.querySelector("#right-part > [data-find='div']");
			assert.ok(oCopyDiv, "element is copied");
			assert.strictEqual(oCopyDiv.style.width, "200px", "styles for element are also copied");

			var sBeforeDivContent = window.getComputedStyle(this.oDomElement, ":before").getPropertyValue("content").replace(/[\"\']/g, "");
			var sBeforeCopyDivContent = oCopyDiv.firstElementChild.innerHTML;
			assert.strictEqual(sBeforeCopyDivContent, sBeforeDivContent, "and the pseudoElements are also copied");

			var oCopySpan = oCopyDiv.querySelector("[data-find='span']");
			assert.ok(oCopySpan, "child element is copied");
			assert.strictEqual(window.getComputedStyle(oCopySpan).color, "rgb(255, 0, 0)", "styles for child element are also copied");

			var oOriginalSpan = this.oDomElement.querySelector("span");
			var sAfterSpanContent = window.getComputedStyle(oOriginalSpan, ":after").getPropertyValue("content").replace(/[\"\']/g, "");
			var sAfterCopySpanContent = oCopySpan.lastElementChild.innerHTML;
			assert.strictEqual(sAfterCopySpanContent, sAfterSpanContent, "and the pseudoElements are also copied");
		});
	});

	/**
	 * hasScrollBar
	 */
	QUnit.module("Given that a container and a content are rendered", {
		beforeEach() {
			this.oContent = document.createElement("div");
			this.oContent.style.background = "red";
			this.oContent.style.width = "200px";
			this.oContent.style.height = "200px";
			this.oContainer = document.createElement("div");
			this.oContainer.style.background = "blue";
			this.oContainer.style.width = "200px";
			this.oContainer.style.height = "200px";

			this.oContainer.append(this.oContent);
			document.getElementById("qunit-fixture").append(this.oContainer);
		},
		afterEach() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when the content is higher but container has no overflow property set", function(assert) {
			this.oContent.style.height = "400px";

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer), false, "no scroll");
		});

		QUnit.test("when the content is higher and container has overflow auto", function(assert) {
			this.oContent.style.height = "400px";
			this.oContainer.style.overflow = "auto";

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer), true, "scroll is shown");
		});

		QUnit.test("when the content is wider and container has overflow scroll", function(assert) {
			this.oContent.style.width = "400px";
			this.oContainer.style.overflowX = "scroll";

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer), true, "scroll is shown");
		});
	});

	QUnit.module("copyComputedStyle()", {
		beforeEach() {
			// TODO: check why classes are not considered when using JS
			this.oSrcDomElement = document.createElement("div");
			this.oSrcDomElement.className = "child";
			this.oSrcDomElement.id = "first-child";
			this.oSrcDomElement.style.cssText = "background: #000; width: 200px; height: 200px;";
			document.getElementById("qunit-fixture").appendChild(this.oSrcDomElement);

			this.oDestDomElement = document.createElement("div");
			this.oDestDomElement.className = "child";
			this.oDestDomElement.id = "second-child";
			document.getElementById("qunit-fixture").appendChild(this.oDestDomElement);
		}
	}, function() {
		QUnit.test("when copyComputedStyle is called and css-attribute display is set to none", function(assert) {
			this.oSrcDomElement.style.display = "none";
			DOMUtil.copyComputedStyle(this.oSrcDomElement, this.oDestDomElement);
			var mSrcStyles = window.getComputedStyle(this.oSrcDomElement);
			var mDestStyles = window.getComputedStyle(this.oDestDomElement);
			assert.strictEqual(mDestStyles.display, "none", "css-attribute display is copied to source dom element");
			assert.notEqual(mDestStyles["background-color"], mSrcStyles["background-color"],
				"css-attribute background on source and dest Element are not equal");
		});

		QUnit.test("when copyComputedStyle is called without pseudoElements", function(assert) {
			DOMUtil.copyComputedStyle(this.oSrcDomElement, this.oDestDomElement);
			var mSrcStyles = window.getComputedStyle(this.oSrcDomElement);
			var mDestStyles = window.getComputedStyle(this.oDestDomElement);
			assert.strictEqual(mDestStyles["background-color"], mSrcStyles["background-color"],
				"css styles of source and dest element are equal");
		});

		QUnit.test("when copyComputedStyle is called with pseudoElements", function(assert) {
			var oLeftPart = document.createElement("div");
			oLeftPart.style.cssText = "float: left; width: 50%; height: 100%;";
			oLeftPart.id = "left-part";
			document.getElementById("qunit-fixture").appendChild(oLeftPart);

			var oRightPart = document.createElement("div");
			oRightPart.style.cssText = "float: left; width: 50%; height: 100%;";
			oRightPart.id = "right-part";
			document.getElementById("qunit-fixture").appendChild(oRightPart);

			var oDomElement = document.createElement("div");
			oDomElement.setAttribute("data-find", "div");
			oDomElement.className = "withBeforeElementAndAttrContent";
			oDomElement.style.cssText = "width:200px; height: 200px;";

			var oSpanElement = document.createElement("span");
			oSpanElement.setAttribute("data-find", "span");
			oSpanElement.className = "withAfterElement";
			oSpanElement.style.color = "rgb(255, 0, 0)";
			oSpanElement.textContent = "Text";

			oDomElement.appendChild(oSpanElement);
			document.getElementById("left-part").appendChild(oDomElement);

			DOMUtil.copyComputedStyle(oDomElement, this.oDestDomElement);

			var oSpan = document.querySelector("#second-child span");
			assert.strictEqual(oSpan !== null, true, "oDestDomElement contains the span element");
		});
	});

	QUnit.module("getScrollLeft()", {
		beforeEach() {
			var oInnerDiv = document.createElement("div");
			oInnerDiv.style.width = "200px";
			oInnerDiv.style.height = "200px";
			this.oPanel = document.createElement("div");
			this.oPanel.style.width = "100px";
			this.oPanel.style.height = "100px";
			this.oPanel.style.overflow = "auto";
			this.oPanel.append(oInnerDiv);
			document.getElementById("qunit-fixture").append(this.oPanel);
		},
		afterEach() {
			this.oPanel.remove();
		}
	}, function() {
		QUnit.test("initial position", function(assert) {
			assert.strictEqual(DOMUtil.getScrollLeft(this.oPanel), 0);
		});
		QUnit.test("scrolled to the most right position", function(assert) {
			var iMaxScrollLeftValue = this.oPanel.scrollWidth - this.oPanel.clientWidth;

			this.oPanel.scrollLeft = iMaxScrollLeftValue;

			var iExpectedMaxScrollLeftLTRValue = DOMUtil.getScrollLeft(this.oPanel);
			assert.strictEqual(Math.round(iExpectedMaxScrollLeftLTRValue), iMaxScrollLeftValue);
		});
	});

	QUnit.module("hasHorizontalScrollBar()", {
		beforeEach() {
			this.oInnerPanel = document.createElement("div");
			this.oInnerPanel.style.width = "100px";
			this.oInnerPanel.style.backgroundColor = "blue";
			this.oOuterPanel = document.createElement("div");
			this.oOuterPanel.style.width = "100px";
			this.oOuterPanel.style.height = "100px";
			this.oOuterPanel.style.overflow = "auto";
			this.oOuterPanel.style.backgroundColor = "red";
			this.oOuterPanel.append(this.oInnerPanel);
			document.getElementById("qunit-fixture").append(this.oOuterPanel);
		}
	}, function() {
		QUnit.test("initial", function(assert) {
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.oOuterPanel), false);
		});
		QUnit.test("when there is only horizontal scrollbar", function(assert) {
			this.oInnerPanel.style.width = "200px";
			this.oInnerPanel.style.height = "100px";
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.oOuterPanel), true);
		});
		QUnit.test("when there is only vertical scrollbar", function(assert) {
			this.oInnerPanel.style.width = "100px";
			this.oInnerPanel.style.height = "200px";
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.oOuterPanel), false);
		});
		QUnit.test("when both vertical and horizontal scrolling are presented", function(assert) {
			this.oInnerPanel.style.width = "200px";
			this.oInnerPanel.style.height = "200px";
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.oOuterPanel), true);
		});
		QUnit.test("when called with null as parameter value", function(assert) {
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(null), false);
		});
	});

	QUnit.module("hasVerticalScrollBar()", {
		beforeEach() {
			this.oInnerPanel = document.createElement("div");
			this.oInnerPanel.style.width = "100px";
			this.oInnerPanel.style.height = "100px";
			this.oInnerPanel.style.backgroundColor = "blue";
			this.oOuterPanel = document.createElement("div");
			this.oOuterPanel.style.width = "100px";
			this.oOuterPanel.style.height = "100px";
			this.oOuterPanel.style.overflow = "auto";
			this.oOuterPanel.style.backgroundColor = "red";
			this.oOuterPanel.append(this.oInnerPanel);
			document.getElementById("qunit-fixture").append(this.oOuterPanel);
		}
	}, function() {
		QUnit.test("initial", function(assert) {
			assert.strictEqual(DOMUtil.hasVerticalScrollBar(this.oOuterPanel), false);
		});
		QUnit.test("when there is only vertical scrollbar", function(assert) {
			this.oInnerPanel.style.width = "100px";
			this.oInnerPanel.style.height = "200px";
			assert.strictEqual(DOMUtil.hasVerticalScrollBar(this.oOuterPanel), true);
		});
		QUnit.test("when there is only horizontal scrollbar", function(assert) {
			this.oInnerPanel.style.width = "200px";
			this.oInnerPanel.style.height = "100px";
			assert.strictEqual(DOMUtil.hasVerticalScrollBar(this.oOuterPanel), false);
		});
		QUnit.test("when both vertical and horizontal scrolling are presented", function(assert) {
			this.oInnerPanel.style.width = "200px";
			this.oInnerPanel.style.height = "200px";
			assert.strictEqual(DOMUtil.hasVerticalScrollBar(this.oOuterPanel), true);
		});
		QUnit.test("when called with null as parameter value", function(assert) {
			assert.strictEqual(DOMUtil.hasVerticalScrollBar(null), false);
		});
	});

	QUnit.module("appendChild()", {
		beforeEach() {
			var oChildInner = document.createElement("div");
			oChildInner.style.width = "1000px";
			oChildInner.style.height = "1000px";
			oChildInner.style.backgroundColor = "green";
			this.oChild = document.createElement("div");
			this.oChild.style.width = "500px";
			this.oChild.style.height = "300px";
			this.oChild.style.overflow = "auto";
			this.oChild.style.backgroundColor = "blue";
			this.oContainer = document.createElement("div");
			this.oContainer.style.width = "500px";
			this.oContainer.style.height = "500px";
			this.oContainer.style.overflow = "auto";
			this.oContainer.style.backgroundColor = "red";
			this.oChild.append(oChildInner);
			this.oContainer.append(this.oChild);
			document.getElementById("qunit-fixture").append(this.oContainer);
		}
	}, function() {
		QUnit.test("scrollTop/scrollLeft remain on the same positions", function(assert) {
			this.oChild.scrollTop = 300;
			this.oChild.scrollLeft = 200;
			DOMUtil.appendChild(this.oContainer, this.oChild);
			assert.strictEqual(this.oChild.scrollTop, 300);
			assert.strictEqual(this.oChild.scrollLeft, 200);
		});
	});

	QUnit.module("when isVisible is called with ", {
		beforeEach() {
			this.oNode = document.createElement("div");
			document.getElementById("qunit-fixture").appendChild(this.oNode);
		}
	}, function() {
		QUnit.test("a visible div", function(assert) {
			this.oNode.style.height = "10px";
			this.oNode.style.width = "10px";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), true, "with both offsetWidth and offsetHeight > 0 the domRef is visible");
		});

		QUnit.test("a div with 0 height", function(assert) {
			this.oNode.style.height = "0px";
			this.oNode.style.width = "10px";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with at least one part <= 0 the domRef is not visible");
		});

		QUnit.test("a div with 0 width", function(assert) {
			this.oNode.style.height = "10px";
			this.oNode.style.width = "0px";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with at least one part <= 0 the domRef is not visible");
		});

		QUnit.test("a div with 0 height and width", function(assert) {
			this.oNode.style.height = "0px";
			this.oNode.style.width = "0px";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with at least one part <= 0 the domRef is not visible");
		});

		QUnit.test("a div with height and width but visible none", function(assert) {
			this.oNode.style.height = "10px";
			this.oNode.style.width = "10px";
			this.oNode.style.display = "none";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with display:none the domRef is not visible");
		});
	});

	QUnit.module("when isVisible is called with svg", {
		beforeEach() {
			var ns = "http://www.w3.org/2000/svg";

			var svg01 = document.createElementNS(ns, "svg");
			svg01.id = "svg01";
			svg01.setAttribute("width", "100px");
			svg01.setAttribute("height", "100px");

			var g01 = document.createElementNS(ns, "g");
			g01.id = "g01";
			g01.setAttribute("width", "100px");
			g01.setAttribute("height", "100px");

			var rect01 = document.createElementNS(ns, "rect");
			rect01.id = "rect01";
			rect01.setAttribute("width", "100px");
			rect01.setAttribute("height", "100px");
			rect01.setAttribute("fill", "#f0ab00");

			g01.appendChild(rect01);
			svg01.appendChild(g01);

			this.oNode = svg01;
			document.getElementById("qunit-fixture").appendChild(this.oNode);
		}
	}, function() {
		QUnit.test("a visible svg", function(assert) {
			assert.strictEqual(DOMUtil.isVisible(this.oNode), true, "with both width and height > 0 the domRef is visible");
		});

		QUnit.test("a svg with 0 height", function(assert) {
			var g01 = this.oNode.querySelector("#g01");
			g01.setAttribute("height", "0px");
			var rect01 = this.oNode.querySelector("#rect01");
			rect01.setAttribute("height", "0px");
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with height 0 the domRef is not visible");
		});

		QUnit.test("a svg with 0 width", function(assert) {
			var g01 = this.oNode.querySelector("#g01");
			g01.setAttribute("width", "0px");
			var rect01 = this.oNode.querySelector("#rect01");
			rect01.setAttribute("width", "0px");
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with width 0 the domRef is not visible");
		});

		QUnit.test("a svg with 0 width and 0 height", function(assert) {
			var g01 = this.oNode.querySelector("#g01");
			g01.setAttribute("height", "0px");
			g01.setAttribute("width", "0px");
			var rect01 = this.oNode.querySelector("#rect01");
			rect01.setAttribute("height", "0px");
			rect01.setAttribute("width", "0px");
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with both height 0 and width 0 domRef is not visible");
		});

		QUnit.test("a svg with height and width but visible none", function(assert) {
			this.oNode.style.display = "none";
			assert.strictEqual(DOMUtil.isVisible(this.oNode), false, "with display:none the domRef is not visible");
		});
	});

	QUnit.module("contains()", function() {
		QUnit.test("when nodes are real relatives", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			// Create Node1
			var oNode1 = document.createElement("div");
			oNode1.id = "node1";
			oFixtureNode.appendChild(oNode1);

			// Create Node2
			var oNode2 = document.createElement("div");
			oNode1.appendChild(oNode2);

			assert.strictEqual(DOMUtil.contains("node1", oNode2), true);
		});

		QUnit.test("when provided id doesn't exist", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement("div");
			oFixtureNode.appendChild(oNode);

			assert.strictEqual(DOMUtil.contains("unknown-node-id", oNode), false);
		});

		QUnit.test("when both nodes are siblings", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			// Create Node1
			var oNode1 = document.createElement("div");
			oNode1.id = "node1";
			oFixtureNode.appendChild(oNode1);

			// Create Node2
			var oNode2 = document.createElement("div");
			oFixtureNode.appendChild(oNode2);

			assert.strictEqual(DOMUtil.contains("node1", oNode2), false);
		});
	});

	QUnit.module("syncScroll()", function() {
		QUnit.test("basic functionality", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			function createScrollableBlock() {
				var oOuterNode = document.createElement("div");
				oOuterNode.style.backgroundColor = "blue";
				oOuterNode.style.width = "200px";
				oOuterNode.style.height = "200px";
				oOuterNode.style.overflow = "scroll";
				var oInnerNodeNode = document.createElement("div");
				oInnerNodeNode.style.width = "500px";
				oInnerNodeNode.style.height = "500px";
				oOuterNode.appendChild(oInnerNodeNode);

				return oOuterNode;
			}

			var oNode1 = createScrollableBlock();
			var oNode2 = createScrollableBlock();

			oFixtureNode.appendChild(oNode1);
			oFixtureNode.appendChild(oNode2);

			oNode1.scrollTop = 100;
			oNode1.scrollLeft = 100;
			oNode2.scrollTop = 0;
			oNode2.scrollLeft = 0;

			assert.strictEqual(oNode1.scrollTop, 100);
			assert.strictEqual(oNode1.scrollLeft, 100);
			assert.strictEqual(oNode2.scrollTop, 0);
			assert.strictEqual(oNode2.scrollLeft, 0);

			// Sync
			DOMUtil.syncScroll(oNode1, oNode2);

			assert.strictEqual(oNode1.scrollTop, 100);
			assert.strictEqual(oNode1.scrollLeft, 100);
			assert.strictEqual(oNode2.scrollTop, 100);
			assert.strictEqual(oNode1.scrollLeft, 100);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});