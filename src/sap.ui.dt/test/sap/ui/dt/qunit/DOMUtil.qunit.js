/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DOMUtil",
	"sap/m/Button"
], function (
	DOMUtil,
	Button
) {
	"use strict";

	DOMUtil.insertStyles('\
		#left-part .withAfterElement::after {\
			content: ":";\
		}\
		#left-part .withBeforeElement::before {\
			content: "Nr.";\
			color: white;\
		}\
		#left-part .withBeforeElementAndAttrContent::before {\
			content: attr(data-sap-ui-icon-content);\
		}\
		.shrink {\
			transform: scale(0.1, 0.5);\
			-webkit-transform: scale(0.1, 0.5);\
			-moz-transform: scale(0.1, 0.5);\
			-ms-transform: scale(0.1, 0.5);\
			-o-transform: scale(0.1, 0.5);\
		}\
	', document.head);

	/**
	 * getSize
	 */
	QUnit.module("Given that a container is rendered", {
		beforeEach : function() {
			this.oContainer = jQuery("<div style='background: blue; width: 200px; height: 200px;'></div>");
			this.oContainer.appendTo("#qunit-fixture");
		},
		afterEach : function() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getSize is called for the container", function(assert) {
			var mExpectedSize = {
				width : 200,
				height : 200
			};
			assert.strictEqual(DOMUtil.getSize(this.oContainer.get(0)).width, mExpectedSize.width, "then the width is returned correctly");
			assert.strictEqual(DOMUtil.getSize(this.oContainer.get(0)).height, mExpectedSize.height, "then the height is returned correctly");
		});
	});

	/**
	 * getOffsetFromParent
	 */
	QUnit.module("Given that a container is rendered with a bigger content element (for scrollbars)", {
		beforeEach : function() {
			this.oContent = jQuery("<div style='background: red; width: 200px; height: 200px; position: relative; left: 30px; top: 40px;'></div>");
			this.oContainer = jQuery("<div style='background: blue; width: 100px; height: 100px; overflow: auto;'></div>");
			this.oContainer.append(this.oContent).appendTo("#qunit-fixture");
		},
		afterEach : function() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getOffsetFromParent is called for the content without scrolling", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0)).left,
				30,
				"the left offset is correct");
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0)).top,
				40,
				"the top offset is correct");
		});

		QUnit.test("when getOffsetFromParent is called for the content after scrolling on the container", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			this.oContainer.scrollLeft(50);
			this.oContainer.scrollTop(60);
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0)).left,
				80,
				"the left offset is correct");
			assert.strictEqual(
				DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0)).top,
				100,
				"the top offset is correct");
		});
	});

	/**
	 * getZIndex
	 */
	QUnit.module("Given that a control is rendered", {
		beforeEach : function() {
			this.iWidth = 100;
			this.iHeight = 48;
			this.oButton = new Button({
				width: this.iWidth + "px",
				text : "Button"
			});

			this.oButton.placeAt("qunit-fixture");
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when the DOM reference is available", function(assert) {
			var oButtonDomRef = this.oButton.getDomRef();
			var mSize = DOMUtil.getSize(oButtonDomRef);
			assert.deepEqual(mSize, {width: this.iWidth, height: this.iHeight}, 'then the static method "getSize" returns the right value');

			jQuery('#qunit-fixture').css('z-index', 1000);
			var zIndex = DOMUtil.getZIndex(oButtonDomRef);
			assert.equal(zIndex, "1000", 'and the static method "getZIndex" returns the right value');
		});

		QUnit.test("when a transition style is applied to the underlying element", function(assert) {
			this.oButton.addStyleClass("shrink");
			var oButtonDomRef = this.oButton.getDomRef();
			var mSizeAfterTransition = DOMUtil.getSize(oButtonDomRef);
			assert.deepEqual(mSizeAfterTransition, {width: 0.1 * this.iWidth, height: 0.5 * this.iHeight}, 'then the static method "getSize" returns the right value');
			this.oButton.removeStyleClass("shrink");
		});
	});

	/**
	 * getDomRefForCSSSelector
	 */
	QUnit.module("Given that some DOM element with child nodes is rendered...", {
		beforeEach : function() {
			this.oDomElement = jQuery("<div class='parent' id='parent'></div>");

			jQuery("<div class='child' id='first-child'></div>").appendTo(this.oDomElement);
			jQuery("<div class='child' id='second-child'></div>").appendTo(this.oDomElement);

			this.oDomElement.appendTo("#qunit-fixture");
		},
		afterEach : function() {
			this.oDomElement.remove();
		}
	}, function() {
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
			var $DomRef = DOMUtil.getDomRefForCSSSelector();
			assert.ok($DomRef instanceof jQuery);
		});
	});

	/**
	 * cloneDOMAndStyles
	 */
	QUnit.module("Given that some DOM element with child nodes is rendered...", {
		beforeEach : function() {
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='left-part'></div>").appendTo("#qunit-fixture");
			jQuery("<div style='float: left; width: 50%; height: 100%;' id='right-part'></div>").appendTo("#qunit-fixture");

			this.oDomElement = jQuery("<div data-find='div' class='withBeforeElement' style='width:200px; height: 200px;'><span data-find='span' class='withAfterElement' style='color: rgb(255, 0, 0);'>Text</span></div>");
			this.oDomElement.appendTo("#left-part");
		},
		afterEach : function() {
			this.oDomElement.remove();
			jQuery("#qunit-fixture").empty();
		}
	}, function() {
		QUnit.test("when this element, it's children and styling is copied", function(assert) {
			DOMUtil.cloneDOMAndStyles(this.oDomElement, jQuery("#right-part"));

			var oCopyDiv = jQuery("#right-part > [data-find=div]");
			assert.ok(oCopyDiv, "element is copied");
			assert.strictEqual(oCopyDiv.css("width"), "200px", "styles for element are also copied");

			var sBeforeDivContent = window.getComputedStyle(this.oDomElement.get(0), ':before').getPropertyValue('content').replace(/[\"\']/g, "");
			var sBeforeCopyDivContent = oCopyDiv.children().first().html();
			assert.strictEqual(sBeforeCopyDivContent, sBeforeDivContent, "and the pseudoElements are also copied");

			var oCopySpan = oCopyDiv.find("> [data-find=span]");
			assert.ok(oCopySpan, "child elemen is copied");
			assert.strictEqual(oCopySpan.css("color"), 'rgb(255, 0, 0)', "styles for child elemen are also copied");

			var sAfterSpanContent = window.getComputedStyle(this.oDomElement.find(">span").get(0), ':after').getPropertyValue('content').replace(/[\"\']/g, "");
			var sAfterCopySpanContent = oCopySpan.children().last().html();
			assert.strictEqual(sAfterCopySpanContent, sAfterSpanContent, "and the pseudoElements are also copied");
		});
	});

	/**
	 * hasScrollBar
	 */
	QUnit.module("Given that a container and a content are rendered", {
		beforeEach : function() {
			this.oContent = jQuery("<div style='background: red; width: 200px; height: 200px;'></div>");
			this.oContainer = jQuery("<div style='background: blue; width: 200px; height: 200px;'></div>");
			this.oContainer.append(this.oContent).appendTo("#qunit-fixture");
		},
		afterEach : function() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when the content is higher but container has no overflow property set", function(assert) {
			this.oContent.css({
				height: 400
			});

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer.get(0)), false, "no scroll");
		});

		QUnit.test("when the content is higher and container has overflow auto", function(assert) {
			this.oContent.css({
				height: 400
			});

			this.oContainer.css({
				overflow: "auto"
			});

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer.get(0)), true, "scroll is shown");
		});

		QUnit.test("when the content is wider and container has overflow scroll", function(assert) {
			this.oContent.css({
				width: 400
			});

			this.oContainer.css({
				"overflow-x": "scroll"
			});

			assert.strictEqual(DOMUtil.hasScrollBar(this.oContainer.get(0)), true, "scroll is shown");
		});
	});

	QUnit.module("copyComputedStyle()", {
		beforeEach : function() {
			this.oSrcDomElement = jQuery("<div class='child' id='first-child' " +
				"style='background: #000; width: 200px; height: 200px;'" +
				"></div>")
				.appendTo("#qunit-fixture");
			this.oDestDomElement = jQuery("<div class='child' id='second-child'></div>")
				.appendTo("#qunit-fixture");
		}
	}, function () {
		QUnit.test("when copyComputedStyle is called and css-attribute display is set to none", function(assert) {
			this.oSrcDomElement.css({
				display: "none"
			});
			DOMUtil.copyComputedStyle(this.oSrcDomElement, this.oDestDomElement);
			var mSrcStyles = window.getComputedStyle(this.oSrcDomElement.get(0));
			var mDestStyles = window.getComputedStyle(this.oDestDomElement.get(0));
			assert.strictEqual(mDestStyles["display"], "none", "css-attribute display is copied to source dom element");
			assert.notEqual(mDestStyles["background-color"], mSrcStyles["background-color"],
				"css-attribute background on source and dest Element are not equal");
		});

		QUnit.test("when copyComputedStyle is called without pseudoElements", function(assert) {
			DOMUtil.copyComputedStyle(this.oSrcDomElement, this.oDestDomElement);
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

			DOMUtil.copyComputedStyle(oDomElement, this.oDestDomElement);
			var oSpan = jQuery("#second-child").find("span");
			assert.strictEqual(oSpan.length, 1, "oDestDomElement contains a span element as well as the source oDomElement");
		});
	});

	QUnit.module("getScrollLeft()", {
		beforeEach: function() {
			this.$Panel = jQuery('<div/>').css({
				width: '100px',
				height: '100px',
				overflow: 'auto'
			}).appendTo("#qunit-fixture");
			jQuery('<div/>').css({
				width: '200px',
				height: '200px'
			}).appendTo(this.$Panel);
		},
		afterEach: function() {
			this.$Panel.remove();
		}
	}, function() {
		QUnit.test("initial position", function (assert) {
			assert.strictEqual(DOMUtil.getScrollLeft(this.$Panel.get(0)), 0);
		});
		QUnit.test("scrolled to the most right position", function (assert) {
			var iMaxScrollLeftValue = this.$Panel.get(0).scrollWidth - this.$Panel.get(0).clientWidth;

			this.$Panel.scrollLeft(iMaxScrollLeftValue);

			assert.strictEqual(DOMUtil.getScrollLeft(this.$Panel.get(0)), iMaxScrollLeftValue);
		});
		QUnit.test("called without argument", function (assert) {
			assert.throws(function () {
				DOMUtil.getScrollLeft();
			});
		});
	});

	QUnit.module("hasHorizontalScrollBar()", {
		beforeEach: function () {
			this.$OuterPanel = jQuery('<div/>').css({
				width: '100px',
				height: '100px',
				overflow: 'auto',
				'background-color': 'red'
			}).appendTo("#qunit-fixture");
			this.$InnerPanel = jQuery('<div/>').css({
				width: '100px',
				'background-color': 'blue'
			}).appendTo(this.$OuterPanel);
		}
	}, function () {
		QUnit.test("initial", function (assert) {
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.$OuterPanel.get(0)), false);
		});
		QUnit.test("when there is only horizontal scrollbar", function (assert) {
			this.$InnerPanel.css({
				width: '200px',
				height: '100px'
			});
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.$OuterPanel.get(0)), true);
		});
		QUnit.test("when there is only vertical scrollbar", function (assert) {
			this.$InnerPanel.css({
				width: '100px',
				height: '200px'
			});
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.$OuterPanel.get(0)), false);
		});
		QUnit.test("when both vertical and horizontal scrolling are presented", function (assert) {
			this.$InnerPanel.css({
				width: '200px',
				height: '200px'
			});
			assert.strictEqual(DOMUtil.hasHorizontalScrollBar(this.$OuterPanel.get(0)), true);
		});
	});

	QUnit.module("appendChild()", {
		beforeEach: function() {
			this.$Container = jQuery('<div/>').css({
				width: '500px',
				height: '500px',
				overflow: 'auto',
				'background-color': 'red'
			}).appendTo("#qunit-fixture");
			this.$Child = jQuery('<div/>').css({
				width: '500px',
				height: '300px',
				overflow: 'auto',
				'background-color': 'blue'
			}).appendTo(this.$Container);
			jQuery('<div/>').css({
				width: '1000px',
				height: '1000px',
				'background-color': 'green'
			}).appendTo(this.$Child);
		}
	}, function() {
		QUnit.test("scrollTop/scrollLeft remain on the same positions", function (assert) {
			this.$Child.scrollTop(300);
			this.$Child.scrollLeft(200);
			DOMUtil.appendChild(this.$Container.get(0), this.$Child.get(0));
			assert.strictEqual(this.$Child.scrollTop(), 300);
			assert.strictEqual(this.$Child.scrollLeft(), 200);
		});
	});

	QUnit.module("when isVisible is called with ", {
		beforeEach: function() {
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

	QUnit.module("insertStyles()", function () {
		QUnit.test("basic functionality", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement('div');
			oNode.classList.add("customClass");
			oNode.style.width = "300px";
			oNode.style.height = "300px";
			oNode.style.opacity = 1;
			oFixtureNode.appendChild(oNode);

			var oComputedStyle = window.getComputedStyle(oNode);
			assert.strictEqual(parseFloat(oComputedStyle.getPropertyValue("opacity")), 1);
			assert.strictEqual(parseInt(oComputedStyle.getPropertyValue("width")), 300);
			assert.strictEqual(parseInt(oComputedStyle.getPropertyValue("height")), 300);

			DOMUtil.insertStyles('\
				.customClass {\
					background-color: green;\
					width: 100px !important;\
					height: 100px !important;\
					opacity: 0.5 !important;\
				}\
			', oFixtureNode);

			oComputedStyle = window.getComputedStyle(oNode);
			assert.strictEqual(parseFloat(oComputedStyle.getPropertyValue("opacity")), 0.5);
			assert.strictEqual(parseInt(oComputedStyle.getPropertyValue("width")), 100);
			assert.strictEqual(parseInt(oComputedStyle.getPropertyValue("height")), 100);
		});
	});

	QUnit.module("contains()", function () {
		QUnit.test("when nodes are real relatives", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			// Create Node1
			var oNode1 = document.createElement('div');
			oNode1.id = "node1";
			oFixtureNode.appendChild(oNode1);

			// Create Node2
			var oNode2 = document.createElement('div');
			oNode1.appendChild(oNode2);

			assert.strictEqual(DOMUtil.contains("node1", oNode2), true);
		});

		QUnit.test("when provided id doesn't exist", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement('div');
			oFixtureNode.appendChild(oNode);

			assert.strictEqual(DOMUtil.contains("unknown-node-id", oNode), false);
		});

		QUnit.test("when both nodes are siblings", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			// Create Node1
			var oNode1 = document.createElement('div');
			oNode1.id = "node1";
			oFixtureNode.appendChild(oNode1);

			// Create Node2
			var oNode2 = document.createElement('div');
			oFixtureNode.appendChild(oNode2);

			assert.strictEqual(DOMUtil.contains("node1", oNode2), false);
		});
	});


	QUnit.module("setDraggable()", function () {
		QUnit.test("basic functionality", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement('div');
			oFixtureNode.appendChild(oNode);

			DOMUtil.setDraggable(oNode, false);
			assert.strictEqual(oNode.getAttribute("draggable"), "false");
			DOMUtil.setDraggable(oNode, true);
			assert.strictEqual(oNode.getAttribute("draggable"), "true");
		});
	});

	QUnit.module("getDraggable()", function () {
		QUnit.test("check boolean result", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement('div');
			oFixtureNode.appendChild(oNode);

			oNode.setAttribute("draggable", false);
			assert.strictEqual(DOMUtil.getDraggable(oNode), false);
			oNode.setAttribute("draggable", true);
			assert.strictEqual(DOMUtil.getDraggable(oNode), true);
		});

		QUnit.test("check undefined if there is no attribute defined", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");
			var oNode = document.createElement('div');
			oFixtureNode.appendChild(oNode);

			assert.strictEqual(DOMUtil.getDraggable(oNode), undefined);
		});
	});

	QUnit.module("syncScroll()", function () {
		QUnit.test("basic functionality", function (assert) {
			var oFixtureNode = document.getElementById("qunit-fixture");

			function createScrollableBlock() {
				var oOuterNode = document.createElement('div');
				oOuterNode.style.backgroundColor = "blue";
				oOuterNode.style.width = "200px";
				oOuterNode.style.height = "200px";
				oOuterNode.style.overflow = "scroll";
				var oInnerNodeNode = document.createElement('div');
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
			assert.strictEqual(oNode2.scrollLeft, 100);
		});
	});


	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});