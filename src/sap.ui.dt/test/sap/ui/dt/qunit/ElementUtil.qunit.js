/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/ElementUtil",
	// controls
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/IconTabFilter",
	"sap/m/IconTabBar",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/form/FormElement",
	// should be last
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-ie",
	"sap/ui/thirdparty/sinon-qunit",
	"sap/ui/qunit/qunit-coverage"],
function(
	ElementUtil,
	Button,
	Input,
	Text,
	Label,
	IconTabFilter,
	IconTabBar,
	VerticalLayout,
	HorizontalLayout,
	FormElement,
	sinon
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given that a control is created", {

		beforeEach : function() {
			this.oButton = new Button("testButton1", {text : "Button"});

			this.oIconTabFilter = new IconTabFilter({
				text : "Orders"
			});

			this.oIconTabBar = new IconTabBar({
			});

			this.oHorizontalLayoutChild = new HorizontalLayout({
				content : [
					new Button({text : "Button"}),
					this.oButton
				]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [
					new Button({text : "Button"}),
					new Button({text : "Button"}),
					new Button({text : "Button"}),
					new Button({text : "Button"}),
					this.oHorizontalLayoutChild
				]
			});

			this.oVerticalLayout.placeAt("content");

			this.oHorizontalLayoutChild1 = new HorizontalLayout({
				content : [
					new Input({value : "11"}),
					new Button({text : "12"})
				]
			});
			this.oHorizontalLayoutChild2 = new HorizontalLayout({
				content : [
					new Button({text : "21"}),
					new Text({text : "22"})
				]
			});
			this.oVerticalLayout2 = new VerticalLayout({
				content : [
					new Button({text : "Button"}),
					this.oHorizontalLayoutChild1,
					new Button({text : "Button"}),
					this.oHorizontalLayoutChild2,
					new Button({text : "Button"})
				]
			});
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oVerticalLayout.destroy();
			this.oVerticalLayout2.destroy();
		}
	});

	QUnit.test("when the hasInterface is called with a valid interface", function(assert) {
		assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, "sap.m.IconTab"), true, 'then the static method "hasInterface" returns true, if control implements this interface');
		assert.equal(ElementUtil.hasInterface(this.oButton, "sap.m.IconTab"), false, 'then the static method "hasInterface" returns true, if control does not implements this interface');
	});

	QUnit.test("when the hasInterface is called with an invalid interface", function(assert) {
		assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, "sap.m.IconTabBar"), false, 'then the static method "hasInterface" returns true');
	});

	QUnit.test("when the hasInterface is called with an invalid interface", function(assert) {
		assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, "sap.m.IconTabBar"), false, 'then the static method "hasInterface" returns true');
	});

	QUnit.test("when the type of the instance is checked based on the control type", function(assert) {
		assert.equal(ElementUtil.isInstanceOf(this.oVerticalLayout, "sap.ui.layout.VerticalLayout"), true, 'then the static method "isInstanceOf" returns true');
	});


	QUnit.test("when the type of the instance is checked based on the base type", function(assert) {
		assert.equal(ElementUtil.isInstanceOf(this.oVerticalLayout, "sap.ui.core.Control"), true, 'then the static method "isInstanceOf" returns true');
	});

	QUnit.test("when the type of the instance is checked based on a wrong type", function(assert) {
		assert.equal(ElementUtil.isInstanceOf(this.oVerticalLayout, "sap.m.Button"), false, 'then the static method "isInstanceOf" returns false');
	});

	QUnit.test("when the element of given type is asked", function(assert) {
		assert.equal(ElementUtil.getClosestElementOfType(this.oButton, "sap.ui.layout.HorizontalLayout"), this.oHorizontalLayoutChild, 'closest element to button of type horizontal layout -> found');
		assert.equal(ElementUtil.getClosestElementOfType(this.oButton, "sap.ui.layout.VerticalLayout"), this.oVerticalLayout, 'closest element to button of type vertical layout -> found');
		assert.equal(ElementUtil.getClosestElementOfType(this.oHorizontalLayoutChild, "sap.ui.layout.HorizontalLayout"), this.oHorizontalLayoutChild, 'closest element to vertical of type vertical layout -> same element');
	});

	QUnit.test("when it is rendered and the DOM reference is available", function(assert) {
		var oDomRef = this.oVerticalLayout.getDomRef();
		var oDomRefTest = ElementUtil.getDomRef(this.oVerticalLayout);
		assert.deepEqual(oDomRefTest, oDomRef, 'then the static method "getDomRef" returns the right value');
	});

	QUnit.test("when the control has children", function(assert) {
		var aChildren = ElementUtil.findAllPublicChildren(this.oVerticalLayout);
		assert.equal(aChildren.length, 7, 'then the static method "findAllPublicChildren" returns all children');

		var aChildren = ElementUtil.findAllPublicElements(this.oVerticalLayout);
		assert.equal(aChildren.length, 8, 'then the static method "findAllPublicElements" returns all public elements');

		var aChildren = ElementUtil.getAggregation(this.oVerticalLayout, "content");
		assert.equal(aChildren.length, 5, 'then static method "getAggregation" returns the content of the aggregation');
	});


	QUnit.test("when a control is an successor of another control", function(assert) {
		assert.equal(ElementUtil.hasAncestor(this.oButton, this.oVerticalLayout), true, 'then static method "hasAncestor" returns true');
	});

	QUnit.test("when a control is not an successor of another control", function(assert) {
		var oButton = new Button({text:"Button"});
		assert.equal(ElementUtil.hasAncestor(oButton, this.oVerticalLayout), false, 'then static method "hasAncestor" returns false');
	});

	QUnit.test("when asking for the siblings in a container, where the container is the direct parent", function(assert) {
		var aSiblings = ElementUtil.findAllSiblingsInContainer(this.oButton, this.oHorizontalLayoutChild);
		assert.equal(aSiblings.length, 2, " then both controls are found (including the original control)");
		assert.equal(aSiblings[0].getId(), this.oHorizontalLayoutChild.getContent()[0].getId(), "and the sibling is the right control ");
		assert.equal(aSiblings[1].getId(), this.oButton.getId(), "and the sibling is the right control ");
		this.oHorizontalLayoutChild.removeContent(this.oButton);
		this.oButton.destroy();
		aSiblings = ElementUtil.findAllSiblingsInContainer(this.oButton, this.oHorizontalLayoutChild);
		assert.strictEqual(aSiblings.length, 0, "and the siblings array is empty, if control doesn't have parent");
	});

	QUnit.test("when asking for the siblings in a container, where the container is on higher levels", function(assert) {
		var aChildren1 = this.oHorizontalLayoutChild1.getContent();
		var aChildren2 = this.oHorizontalLayoutChild2.getContent();

		var aSiblings = ElementUtil.findAllSiblingsInContainer(aChildren2[0], this.oVerticalLayout2);

		assert.equal(aSiblings.length, 4, " then all controls in the same aggregation at the lowest level found (including the original control)");
		assert.deepEqual(aSiblings, aChildren1.concat(aChildren2), " and the controls are the same");
	});

	QUnit.test("when the control has aggregations", function(assert) {
		var mAccessors = ElementUtil.getAggregationAccessors(this.oVerticalLayout, "content");
		assert.deepEqual(mAccessors, {
			"get":"getContent",
			"add":"addContent",
			"remove":"removeContent",
			"insert":"insertContent",
			"removeAll": "removeAllContent"
		}, 'then the static method "getAggregationAccessors" returns all accessors of an aggregation');

		var aFoundAggregations = [];
		ElementUtil.iterateOverAllPublicAggregations(this.oVerticalLayout, function(oAggregation) {
			aFoundAggregations.push(oAggregation.name);
		});
		assert.deepEqual(aFoundAggregations, ["tooltip","customData","layoutData","dependents", "content"], 'then the static method "iterateOverAllPublicAggregations" finds all public aggregations');
	});

	QUnit.test("when a child control is added to an aggregation", function(assert) {
		var oButton = new Button({text:"Button"});
		var iLengthBefore = this.oVerticalLayout.getContent().length;
		ElementUtil.addAggregation(this.oVerticalLayout, "content", oButton);
		var iLengthAfter = this.oVerticalLayout.getContent().length;
		assert.equal(iLengthAfter, iLengthBefore + 1, "then the number of controls in the aggregation is right");
	});


	QUnit.test("when the control is added into an aggregation of itself", function(assert) {
		var that = this;
		assert.throws(function() {
			ElementUtil.addAggregation(that.oVerticalLayout, "content", this.oVerticalLayout);
		}, /Trying to add an element to itself or its successors/, "then an Exception is thrown");
	});

	QUnit.test("when the control is added into a child of itself", function(assert) {
		var that = this;
		assert.throws(function() {
			ElementUtil.addAggregation(that.oHorizontalLayoutChild, "content", this.oVerticalLayout);
		}, /Trying to add an element to itself or its successors/, "then an Exception is thrown");
	});

	QUnit.test("when a child control is added to an aggregation at a certain position", function(assert) {
		var oButton = new Button({text:"Button"});
		var iLengthBefore = this.oVerticalLayout.getContent().length;
		ElementUtil.insertAggregation(this.oVerticalLayout, "content", oButton, 3);
		var iLengthAfter = this.oVerticalLayout.getContent().length;
		assert.equal(iLengthAfter, iLengthBefore + 1, "then the number of controls in the aggregation is right");
		assert.strictEqual(this.oVerticalLayout.getContent()[3], oButton, "and the control is at the right position");
	});


	QUnit.test("when a control is added to an aggregation at a certain position which is already added", function(assert) {
		var iLengthBefore = this.oVerticalLayout.getContent().length;
		ElementUtil.insertAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild, 1);
		var iLengthAfter = this.oVerticalLayout.getContent().length;
		assert.equal(iLengthAfter, iLengthBefore, "then the number of controls in the aggregation is right");
		assert.strictEqual(this.oVerticalLayout.getContent()[1], this.oHorizontalLayoutChild, "and the control is at the right position");
	});


	QUnit.test("when the control is added into a child of itself at a certain position", function(assert) {
		var that = this;
		assert.throws(function() {
			ElementUtil.insertAggregation(that.oHorizontalLayoutChild, "content", this.oVerticalLayout,1);
		}, /Trying to add an element to itself or its successors/, "then an Exception is thrown");
	});

	QUnit.test("when the control is added into an aggregation of itself at a certain position", function(assert) {
		var that = this;
		assert.throws(function() {
			ElementUtil.insertAggregation(that.oVerticalLayout, "content", this.oVerticalLayout, 1);
		}, /Trying to add an element to itself or its successors/, "then an Exception is thrown");
	});

	QUnit.test("when a child control is removed from an aggregation of the control", function(assert) {
		var iLengthBefore = this.oVerticalLayout.getContent().length;
		ElementUtil.removeAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild);
		this.oHorizontalLayoutChild.destroy();
		var iLengthAfter = this.oVerticalLayout.getContent().length;
		assert.equal(iLengthAfter, iLengthBefore - 1, 'then the number of controls is right');
	});

	QUnit.test("when an element is checked if it is valid for an aggregation of a parent", function(assert) {
		assert.equal(ElementUtil.isValidForAggregation(this.oVerticalLayout, "content", new Button({text:"Button"})), true, 'then the static method "isValidForAggregation" returns true');
	});

	QUnit.test("when an element is checked if it is valid for an aggregation of itself", function(assert) {
		assert.equal(ElementUtil.isValidForAggregation(this.oVerticalLayout, "content", this.oVerticalLayout), false, 'then the static method "isValidForAggregation" returns false');
	});

	QUnit.test("when an element is checked if it is valid for an aggregation of one of its children", function(assert) {
		assert.equal(ElementUtil.isValidForAggregation(this.oHorizontalLayoutChild, "content", this.oVerticalLayout), false, 'then the static method "isValidForAggregation" returns false');
	});

	QUnit.test("when an element is checked if it is valid for an aggregation, which type is an interface", function(assert) {
		assert.equal(ElementUtil.isValidForAggregation(this.oIconTabBar, "items", this.oIconTabFilter), true, 'then the static method "isValidForAggregation" returns true');
	});

	QUnit.test("when a button is moved from an inner horizontal layout to an outer vertical layout", function(assert) {
		var aActions = [];
		aActions.push({
			'element' : this.oButton.getId(),
			'source' : {
				'index': 0,
				'parent' : this.oHorizontalLayoutChild.getId(),
				'aggregation' : 'content'
			},
			'target' : {
				'index': 4,
				'parent' : this.oVerticalLayout.getId(),
				'aggregation' : 'content'
			},
			'changeType' : ElementUtil.sACTION_MOVE
		});
		var aChildren = ElementUtil.getAggregation(this.oVerticalLayout, "content");
		assert.equal(aChildren.length, 5, 'and the vertical layout has at begin 5 children');
		ElementUtil.executeActions(aActions);
		assert.equal(ElementUtil.hasAncestor(this.oButton, this.oHorizontalLayoutChild), false, 'then afterwards the button is no longer an ancestor of the horizontal layout');
		assert.equal(ElementUtil.hasAncestor(this.oButton, this.oVerticalLayout), true, 'and the button is still an ancestor of the vertical layout');
		aChildren = ElementUtil.getAggregation(this.oVerticalLayout, "content");
		assert.equal(aChildren.length, 6, 'then the vertical layout has now 6 children');
	});

	QUnit.test("when a control has non-multiple aggregations with existing items", function(assert) {
		var oFormElement = new FormElement({label : "InputLabel"});
		var oLabel = new Label();
		assert.equal(ElementUtil.isValidForAggregation(oFormElement, "label", oLabel), false,
			'then the static method "isValidForAggregation" returns false');
	});

	QUnit.test("when a control has non-multiple aggregations without an existing item", function(assert) {
		var oFormElement = new FormElement();
		var oLabel = new Label();
		assert.equal(ElementUtil.isValidForAggregation(oFormElement, "label", oLabel), true,
			'then the static method "isValidForAggregation" returns true');
	});

	QUnit.test("when insertAggregation method is called to insert existing button into horizontalLayout", function(assert) {
		var oRemoveSpy = sinon.spy(this.oHorizontalLayoutChild, "removeContent");
		var oInsertSpy = sinon.spy(this.oHorizontalLayoutChild, "insertContent");
		ElementUtil.insertAggregation(this.oHorizontalLayoutChild, "content", this.oButton, 1);
		assert.strictEqual(oRemoveSpy.callCount, 1, "then 'removeContent' method should be called once on horizontalLayout");
		assert.strictEqual(oInsertSpy.callCount, 1, "then 'insertContent' method should be called once on horizontalLayout");
	});


	QUnit.test("when calling 'isVisible'", function(assert) {
		var oButtons = this.oVerticalLayout.getContent();

		// modify first 3 buttons to be invisible;
		oButtons[0].getDomRef().style.visibility = "hidden";
		oButtons[1].getDomRef().style.opacity = 0;
		oButtons[2].getDomRef().style.filter = "blur(5px) opacity(0) grayscale(100%)";

		assert.notOk(ElementUtil.isVisible(jQuery(oButtons[0].getDomRef())), "the first button is not visible due to 'visibility hidden'");
		assert.notOk(ElementUtil.isVisible(jQuery(oButtons[1].getDomRef())), "the second button is not visible due to 'opacity 0'");
		// css property filter not supported by phantomJS & Internet Explorer!
		if (!sap.ui.Device.browser.phantomJS && !sap.ui.Device.browser.msie) {
			assert.notOk(ElementUtil.isVisible(jQuery(oButtons[2].getDomRef())), "the third button is not visible due to 'filter opacity(0)'");
		}
		assert.ok(ElementUtil.isVisible(jQuery(oButtons[3].getDomRef())), "the fourth button is visible");
		assert.ok(ElementUtil.isVisible(jQuery('button')), "at least one of the buttons is visible");
	});
});