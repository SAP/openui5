/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DOMUtil",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	DOMUtil,
	Button,
	jQuery,
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
	style.sheet.insertRule("\
		#left-part .withBeforeElementAndAttrContent::before {\
			content: attr(data-sap-ui-icon-content);\
		}\
	");
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
	 * getSize
	 */
	QUnit.module("Given that a container is rendered", {
		beforeEach() {
			this.oContainer = document.createElement("div");
			this.oContainer.style.background = "blue";
			this.oContainer.style.width = "200px";
			this.oContainer.style.height = "200px";
			document.getElementById("qunit-fixture").append(this.oContainer);
		},
		afterEach() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getSize is called for the container", function(assert) {
			var mExpectedSize = {
				width: 200,
				height: 200
			};
			assert.strictEqual(DOMUtil.getSize(this.oContainer).width, mExpectedSize.width, "then the width is returned correctly");
			assert.strictEqual(DOMUtil.getSize(this.oContainer).height, mExpectedSize.height, "then the height is returned correctly");
		});
	});

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
			var oBoundingClientRect = oButtonDomRef.getBoundingClientRect();
			var oExpected = {
				width: Math.round(oBoundingClientRect.width),
				height: Math.round(oBoundingClientRect.height)
			};
			var mSize = DOMUtil.getSize(oButtonDomRef);
			mSize.width = Math.round(mSize.width);
			mSize.height = Math.round(mSize.height);
			assert.deepEqual(mSize, oExpected, "then the static method getSize returns the right value");

			document.getElementById("qunit-fixture").style.zIndex = 1000;
			var zIndex = DOMUtil.getZIndex(oButtonDomRef);
			assert.equal(zIndex, "1000", 'and the static method "getZIndex" returns the right value');
		});

		QUnit.test("when a transition style is applied to the underlying element", function(assert) {
			var oButtonDomRef = this.oButton.getDomRef();
			var oBoundingClientRect = oButtonDomRef.getBoundingClientRect();
			var oExpected = {
				width: Math.round(0.1 * oBoundingClientRect.width),
				height: Math.round(0.5 * oBoundingClientRect.height)
			};
			this.oButton.addStyleClass("shrink");
			var mSizeAfterTransition = DOMUtil.getSize(oButtonDomRef);
			mSizeAfterTransition.width = Math.round(mSizeAfterTransition.width);
			mSizeAfterTransition.height = Math.round(mSizeAfterTransition.height);
			assert.deepEqual(mSizeAfterTransition, oExpected, 'then the static method "getSize" returns the right value');
			this.oButton.removeStyleClass("shrink");
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
		// TODO: change when getDomRefForCSSSelector does not return jQuery Object any more
		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref");
			assert.strictEqual(oDomRef.length, 1, "one element found");
			assert.strictEqual(oDomRef.get(0).getAttribute("id"), "parent", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref > #first-child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref > #first-child");
			assert.strictEqual(oDomRef.length, 1, "one element found");
			assert.strictEqual(oDomRef.get(0).getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :first-child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":first-child");
			assert.strictEqual(oDomRef.length, 1, "one element found");
			assert.strictEqual(oDomRef.get(0).getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for :sap-domref > .child", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, ":sap-domref > .child");
			assert.strictEqual(oDomRef.length, 2, "two elements found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called for '> #third-child,> #first-child'", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector(this.oDomElement, "> #third-child, > #first-child");
			assert.strictEqual(oDomRef.length, 1, "one element found");
			assert.strictEqual(oDomRef.get(0).getAttribute("id"), "first-child", "right element found");
		});

		QUnit.test("when the getDomRefForCSSSelector is called without arguments", function(assert) {
			var oDomRef = DOMUtil.getDomRefForCSSSelector();
			assert.ok(oDomRef instanceof jQuery);
		});
	});

	/**
	 * cloneDOMAndStyles
	 */
	QUnit.module("Given that some DOM element with child nodes is rendered...", {
		beforeEach() {
			// TODO: check why classes are not considered when using JS
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='left-part'></div>").appendTo("#qunit-fixture");
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='right-part'></div>").appendTo("#qunit-fixture");

			this.oDomElement = jQuery("<div data-find='div' class='withBeforeElement' style='width:200px; height: 200px;'><span data-find='span' class='withAfterElement' style='color: rgb(255, 0, 0);'>Text</span></div>");
			this.oDomElement.appendTo("#left-part");
		},
		afterEach() {
			this.oDomElement.remove();
			jQuery("#qunit-fixture").empty();
		}
	}, function() {
		QUnit.test("when this element, it's children and styling is copied", function(assert) {
			DOMUtil.cloneDOMAndStyles(this.oDomElement.get(0), jQuery("#right-part").get(0));

			var oCopyDiv = jQuery("#right-part > [data-find=div]");
			assert.ok(oCopyDiv, "element is copied");
			assert.strictEqual(oCopyDiv.css("width"), "200px", "styles for element are also copied");

			var sBeforeDivContent = window.getComputedStyle(this.oDomElement.get(0), ":before").getPropertyValue("content").replace(/[\"\']/g, "");
			var sBeforeCopyDivContent = oCopyDiv.children().first().html();
			assert.strictEqual(sBeforeCopyDivContent, sBeforeDivContent, "and the pseudoElements are also copied");

			var oCopySpan = oCopyDiv.find("> [data-find=span]");
			assert.ok(oCopySpan, "child elemen is copied");
			assert.strictEqual(oCopySpan.css("color"), "rgb(255, 0, 0)", "styles for child elemen are also copied");

			var sAfterSpanContent = window.getComputedStyle(jQuery(this.oDomElement).find(">span").get(0), ":after").getPropertyValue("content").replace(/[\"\']/g, "");
			var sAfterCopySpanContent = oCopySpan.children().last().html();
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
			this.oSrcDomElement = jQuery("<div class='child' id='first-child' " +
				"style='background: #000; width: 200px; height: 200px;'" +
				"></div>")
			.appendTo("#qunit-fixture");
			this.oDestDomElement = jQuery("<div class='child' id='second-child'></div>")
			.appendTo("#qunit-fixture");
		}
	}, function() {
		QUnit.test("when copyComputedStyle is called and css-attribute display is set to none", function(assert) {
			this.oSrcDomElement.css({
				display: "none"
			});
			DOMUtil.copyComputedStyle(this.oSrcDomElement.get(0), this.oDestDomElement.get(0));
			var mSrcStyles = window.getComputedStyle(this.oSrcDomElement.get(0));
			var mDestStyles = window.getComputedStyle(this.oDestDomElement.get(0));
			assert.strictEqual(mDestStyles.display, "none", "css-attribute display is copied to source dom element");
			assert.notEqual(mDestStyles["background-color"], mSrcStyles["background-color"],
				"css-attribute background on source and dest Element are not equal");
		});

		QUnit.test("when copyComputedStyle is called without pseudoElements", function(assert) {
			DOMUtil.copyComputedStyle(this.oSrcDomElement.get(0), this.oDestDomElement.get(0));
			var mSrcStyles = window.getComputedStyle(this.oSrcDomElement.get(0));
			var mDestStyles = window.getComputedStyle(this.oDestDomElement.get(0));
			assert.strictEqual(mDestStyles["background-color"], mSrcStyles["background-color"],
				"css styles of source and dest element are equal");
		});

		QUnit.test("when copyComputedStyle is called with pseudoElements", function(assert) {
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='left-part'></div>").appendTo("#qunit-fixture");
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='right-part'></div>").appendTo("#qunit-fixture");

			var oDomElement = jQuery("<div data-find='div' class='withBeforeElementAndAttrContent' style='width:200px; height: 200px;'>" +
				"<span data-find='span' class='withAfterElement' style='color: rgb(255, 0, 0);'>Text</span></div>");
			oDomElement.appendTo("#left-part");

			DOMUtil.copyComputedStyle(oDomElement.get(0), this.oDestDomElement.get(0));
			var oSpan = jQuery("#second-child").find("span");
			assert.strictEqual(oSpan.length, 1, "oDestDomElement contains a span element as well as the source oDomElement");
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

	QUnit.module("setDraggable()", function() {
		QUnit.test("basic functionality", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement("div");
			oFixtureNode.appendChild(oNode);

			DOMUtil.setDraggable(oNode, false);
			assert.strictEqual(oNode.getAttribute("draggable"), "false");
			DOMUtil.setDraggable(oNode, true);
			assert.strictEqual(oNode.getAttribute("draggable"), "true");
		});
	});

	QUnit.module("getDraggable()", function() {
		QUnit.test("check boolean result", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement("div");
			oFixtureNode.appendChild(oNode);

			oNode.setAttribute("draggable", false);
			assert.strictEqual(DOMUtil.getDraggable(oNode), false);
			oNode.setAttribute("draggable", true);
			assert.strictEqual(DOMUtil.getDraggable(oNode), true);
		});

		QUnit.test("check undefined if there is no attribute defined", function(assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement("div");
			oFixtureNode.appendChild(oNode);

			assert.strictEqual(DOMUtil.getDraggable(oNode), undefined);
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