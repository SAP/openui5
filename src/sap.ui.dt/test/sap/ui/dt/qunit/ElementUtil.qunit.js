/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/dt/ElementUtil",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/IconTabFilter",
	"sap/m/IconTabBar",
	"sap/m/InputListItem",
	"sap/m/ObjectAttribute",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/dt/Util",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon"
	],
function(
	jQuery,
	ElementUtil,
	Button,
	Input,
	Text,
	Label,
	IconTabFilter,
	IconTabBar,
	InputListItem,
	ObjectAttribute,
	VerticalLayout,
	HorizontalLayout,
	Form,
	FormContainer,
	FormElement,
	Component,
	ComponentContainer,
	Element,
	DtUtil,
	ManagedObject,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var fnCreateMinimumControls = function(){
		this.oButton = new Button("testButton1", {text : "Button"});
		this.oIconTabFilter = new IconTabFilter("icontabfilter",{
			text : "Orders"
		});
		this.oIconTabBar = new IconTabBar({
		});
	};

	var fnDestroyMinimumControls = function(){
		this.oButton.destroy();
		this.oIconTabFilter.destroy();
		this.oIconTabBar.destroy();
	};

	var fnCreateControls = function(){
		fnCreateMinimumControls.call(this);
		this.oHorizontalLayoutChild = new HorizontalLayout({
			content : [
				new Button({text : "Button"}),
				this.oButton
			]
		});
		this.oVerticalLayout = new VerticalLayout("verticalLayout",{
			content : [
				new Button({text : "Button"}),
				new Button({text : "Button"}),
				new Button({text : "Button"}),
				new Button({text : "Button"}),
				this.oHorizontalLayoutChild
			]
		});
		this.oVerticalLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	};

	var fnDestroyControls = function(){
		fnDestroyMinimumControls.call(this);
		this.oVerticalLayout.destroy();
	};

	var fnCreateMoreControls = function(){
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
	};

	var fnDestroyMoreControls = function(){
		this.oVerticalLayout2.destroy();
	};

	var fnCreateComponent = function(){
		var CustomComponent = Component.extend("sap.ui.dt.test.Component", {
			createContent: function() {
				return new VerticalLayout("Root",{
					content: [
						new Button({ text: "Text" })
						]
				});
			}
		});

		this.oComponent = new CustomComponent("Component");
		this.oCompContainer = new ComponentContainer("CompCont1");
	};

	var fnDestroyComponent = function(){
		this.oComponent.destroy();
		this.oCompContainer.destroy();
	};

	var fnCreateForm = function(){
		this.oForm = new Form("form1", {
			formContainers : [
				new FormContainer("group1"),
				new FormContainer("group2")
			]
		});
		this.oFormContainer1 = sap.ui.getCore().byId("group1");
	};

	var fnDestroyForm = function(){
		this.oForm.destroy();
		this.oFormContainer1.destroy();
	};

	var fnCreateCustomControl = function(){
		var CustomControl = Element.extend("CustomControl", {
			metadata: {
				associations : {
		      elements : { type: 'sap.ui.core.Control', multiple : true }
		    }
			}
		});
		this.oCustomControl = new CustomControl();
	};

	var fnDestroyCustomControl = function(){
		this.oCustomControl.destroy();
	};

	QUnit.module("hasInterface()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
		}
	}, function(){
		QUnit.test("when the hasInterface is called with an interface", function(assert) {
			assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, "sap.m.IconTab"), true, 'then the static method "hasInterface" returns true, if control implements this interface');
			assert.equal(ElementUtil.hasInterface(this.oButton, "sap.m.IconTab"), false, 'then the static method "hasInterface" returns false, if control does not implement this interface');
		});

		QUnit.test("when the hasInterface is called with an empty interface", function(assert) {
			assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, ""), false, 'then the static method "hasInterface" returns false');
		});

		QUnit.test("when the hasInterface is called with an undefined interface", function(assert) {
			assert.equal(ElementUtil.hasInterface(this.oIconTabFilter), false, 'then the static method "hasInterface" returns false');
		});
	});

	QUnit.module("isInstanceOf()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
		}
	}, function(){
		QUnit.test("when the type of the instance is checked based on the control type", function(assert) {
			assert.equal(ElementUtil.isInstanceOf(this.oButton, "sap.m.Button"), true, 'then the static method "isInstanceOf" returns true');
		});

		QUnit.test("when the type of the instance is checked based on the base type", function(assert) {
			assert.equal(ElementUtil.isInstanceOf(this.oButton, "sap.ui.core.Control"), true, 'then the static method "isInstanceOf" returns true');
		});

		QUnit.test("when the type of the instance is checked based on a wrong type", function(assert) {
			assert.equal(ElementUtil.isInstanceOf(this.oButton, "sap.ui.layout.VerticalLayout"), false, 'then the static method "isInstanceOf" returns false');
		});
	});

	QUnit.module("getElementInstance()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function(){
		QUnit.test("when getElementInstance() is called with a control-Id", function(assert) {
			assert.equal(ElementUtil.getElementInstance(this.oButton.getId()), this.oButton, 'then the static method "getElementInstance" returns the control');
		});
		QUnit.test("when getElementInstance() is called with a control instance", function(assert) {
			assert.equal(ElementUtil.getElementInstance(this.oButton), this.oButton, 'then the static method "getElementInstance" returns the control');
		});
		QUnit.test("when getElementInstance() is called with a Component-Id", function(assert) {
			assert.equal(ElementUtil.getElementInstance(this.oComponent.getId()), this.oComponent, 'then the static method "getElementInstance" returns the Component');
		});
	});

	QUnit.module("getClosestElementForNode()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
		QUnit.test("when getClosestElementForNode() is called with the main DOM-node of the control", function(assert) {
			var oNode = this.oButton.getDomRef();
			assert.equal(ElementUtil.getClosestElementForNode(oNode), this.oButton, 'then the static method "getClosestElementForNode" returns the control');
		});
		QUnit.test("when getClosestElementForNode() is called with a DOM-node of the control", function(assert) {
			var oNode = this.oButton.getDomRef().children[0];
			assert.equal(ElementUtil.getClosestElementForNode(oNode), this.oButton, 'then the static method "getClosestElementForNode" returns the control');
		});
		QUnit.test("when getClosestElementForNode() is called with a DOM-node not belonging to any control", function(assert) {
			jQuery("#qunit-fixture").append("<div id='testdiv'>TEST</DIV>");
			var oNode = jQuery("#testdiv");
			assert.equal(ElementUtil.getClosestElementForNode(oNode), undefined, 'then the static method "getClosestElementForNode" returns undefined');
		});
	});

	QUnit.module("fixComponentParent()", {
		beforeEach : function() {
			fnCreateControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function(){
		QUnit.test("when fixComponentParent() is called with a Component within a container", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			this.oVerticalLayout.addContent(this.oCompContainer);
			assert.equal(ElementUtil.fixComponentParent(this.oComponent), this.oVerticalLayout, 'then the static method "fixComponentParent" returns the Parent of the Component Container');
		});
		QUnit.test("when fixComponentParent() is called with a Component without a container", function(assert) {
			assert.equal(ElementUtil.fixComponentParent(this.oComponent), undefined, 'then the static method "fixComponentParent" returns undefined');
		});
		QUnit.test("when fixComponentParent() is called with another Control", function(assert) {
			assert.equal(ElementUtil.fixComponentParent(this.oVerticalLayout), this.oVerticalLayout, 'then the static method "fixComponentParent" returns the control itself');
		});
	});

	QUnit.module("fixComponentContainerElement()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function(){
		QUnit.test("when fixComponentContainerElement() is called with a ComponentContainer with a Component", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			var oRootControl = sap.ui.getCore().byId("Root");
			assert.equal(ElementUtil.fixComponentContainerElement(this.oCompContainer), oRootControl, 'then the static method "fixComponentContainerElement" returns the Root Control of the Component');
		});
		QUnit.test("when fixComponentContainerElement() is called with a ComponentContainer without a Component", function(assert) {
			assert.equal(ElementUtil.fixComponentContainerElement(this.oCompContainer), undefined, 'then the static method "fixComponentContainerElement" returns undefined');
		});
		QUnit.test("when fixComponentContainerElement() is called with another Control", function(assert) {
			assert.equal(ElementUtil.fixComponentContainerElement(this.oButton), this.oButton, 'then the static method "fixComponentContainerElement" returns the control itself');
		});
	});

	QUnit.module("getDomRef()", {
		beforeEach : function() {
			fnCreateControls.call(this);
			fnCreateForm.call(this);
			this.oVerticalLayout.addContent(this.oForm);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
			fnDestroyForm.call(this);
		}
	}, function(){
		QUnit.test("when it is rendered and the DOM reference is available", function(assert) {
			var oDomRef = this.oVerticalLayout.getDomRef();
			var oDomRefTest = ElementUtil.getDomRef(this.oVerticalLayout);
			assert.deepEqual(oDomRefTest, oDomRef, 'then the static method "getDomRef" returns the right value');
		});
		QUnit.test("when it is rendered and the RenderedDOM reference is available", function(assert) {
			var oDomRef = this.oFormContainer1.getRenderedDomRef();
			var oDomRefTest = ElementUtil.getDomRef(this.oFormContainer1);
			assert.deepEqual(oDomRefTest, oDomRef, 'then the static method "getDomRef" returns the right value');
		});
		QUnit.test("when getDomRef() is not available for this Element", function(assert) {
			var oDomRefTest = ElementUtil.getDomRef(this.oHorizontalLayoutChild.getContent());
			assert.deepEqual(oDomRefTest, undefined, 'then the static method "getDomRef" returns undefined');
		});
	});

	QUnit.module("hasAncestor()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
		QUnit.test("when a control is a successor of another control", function(assert) {
			assert.equal(ElementUtil.hasAncestor(this.oButton, this.oVerticalLayout), true, 'then static method "hasAncestor" returns true');
		});

		QUnit.test("when a control is not a successor of another control", function(assert) {
			var oButton = new Button({text:"Button"});
			assert.equal(ElementUtil.hasAncestor(oButton, this.oVerticalLayout), false, 'then static method "hasAncestor" returns false');
		});
	});

	QUnit.module("findAllSiblingsInContainer()", {
		beforeEach : function() {
			fnCreateControls.call(this);
			fnCreateMoreControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
			fnDestroyMoreControls.call(this);
		}
	}, function(){
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
	});

	QUnit.module("getAggregationAccessors()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
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
	});

	QUnit.module("getAssociationAccessors()", {
		beforeEach : function() {
			fnCreateCustomControl.call(this);
		},
		afterEach : function() {
			fnDestroyCustomControl.call(this);
		}
	}, function(){
		QUnit.test("when the control has associations", function(assert) {
			var mAccessors = ElementUtil.getAssociationAccessors(this.oCustomControl, "elements");
			assert.deepEqual(mAccessors, {
				"get":"getElements",
				"add":"addElement",
				"remove":"removeElement",
				"insert": undefined,
				"removeAll": "removeAllElement"
			}, 'then the static method "getAssociationAccessors" returns all accessors of an existing association');
		});

		QUnit.test("when the control has associations", function(assert) {
			var mAccessors = ElementUtil.getAssociationAccessors(this.oCustomControl, "nonexisting");
			assert.deepEqual(mAccessors, {}, 'then the static method "getAssociationAccessors" returns an empty object for an non existing association');
		});
	});

	QUnit.module("getAssociation()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function(){
		QUnit.test("when the control has associations", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var mResult = [this.oButton.getId(),this.oIconTabFilter.getId()];
			var mAssociationElements = ElementUtil.getAssociation(this.oCustomControl, "elements");
			assert.deepEqual(mAssociationElements, mResult, 'then the static method "getAssociation" returns the ids of the association');
		});
		QUnit.test("when the control has associations", function(assert) {
			var mAssociationElements = ElementUtil.getAssociation(this.oCustomControl, "nonexisting");
			assert.deepEqual(mAssociationElements, undefined, 'then the static method "getAssociation" returns undefined for non existing association');
		});
	});

	QUnit.module("getAssociationInstances()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function(){
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "elements");
			assert.deepEqual(mAssociationElements, [this.oButton,this.oIconTabFilter], 'then the static method "getAssociationInstances" returns an array of elements if more elements are associated');
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "elements");
			assert.deepEqual(mAssociationElements, [this.oButton], 'then the static method "getAssociationInstances" returns an array with one elenement if only one element is associated');
		});
		QUnit.test("when the control has associations", function(assert) {
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "nonexisting");
			assert.deepEqual(mAssociationElements, [], 'then the static method "getAssociationInstances" returns an empty array for non existing association');
		});
	});

	QUnit.module("getIndexInAssociation()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function(){
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oIconTabFilter, this.oCustomControl, "elements");
			assert.deepEqual(nAssociationIndex, 1, 'then the static method "getIndexInAssociation" returns the correct index position in association for multiple elements');
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oButton, this.oCustomControl, "elements");
			assert.deepEqual(nAssociationIndex, 0, 'then the static method "getIndexInAssociation" returns zero if only one element is in an association');
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oIconTabFilter, this.oCustomControl, "elements");
			assert.deepEqual(nAssociationIndex, -1, 'then the static method "getIndexInAssociation" returns -1 if element is not in an association');
		});
		QUnit.test("when the control has associations", function(assert) {
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oButton, this.oCustomControl, "nonexisting");
			assert.deepEqual(nAssociationIndex, -1, 'then the static method "getIndexInAssociation" returns -1 for non existing association');
		});
	});

	QUnit.module("addAggregation()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
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

		QUnit.test("when there is no AggregationMutator", function(assert) {
			var oStub = sandbox.stub(ElementUtil, "getAggregationAccessors").returns({});
			ElementUtil.addAggregation(this.oHorizontalLayoutChild, "content", this.oButton);
			assert.ok(this.oHorizontalLayoutChild.getContent().indexOf(this.oButton) !== -1 , "then Button is added to the content");
			oStub.restore();
		});
	});

	QUnit.module("insertAggregation()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
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

		QUnit.test("when insertAggregation method is called to insert existing button into horizontalLayout", function(assert) {
			var oRemoveSpy = sinon.spy(this.oHorizontalLayoutChild, "removeContent");
			var oInsertSpy = sinon.spy(this.oHorizontalLayoutChild, "insertContent");
			ElementUtil.insertAggregation(this.oHorizontalLayoutChild, "content", this.oButton, 1);
			assert.strictEqual(oRemoveSpy.callCount, 1, "then 'removeContent' method should be called once on horizontalLayout");
			assert.strictEqual(oInsertSpy.callCount, 1, "then 'insertContent' method should be called once on horizontalLayout");
		});

		QUnit.test("when there is no AggregationMutator", function(assert) {
			var oStub = sandbox.stub(ElementUtil, "getAggregationAccessors").returns({});
			ElementUtil.insertAggregation(this.oHorizontalLayoutChild, "content", this.oButton, 1);
			assert.ok(this.oHorizontalLayoutChild.getContent().indexOf(this.oButton) !== -1 , "then Button is added to the content");
			oStub.restore();
		});
	});

	QUnit.module("removeAggregation()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
		QUnit.test("when a child control is removed from an aggregation of the control", function(assert) {
			var iLengthBefore = this.oVerticalLayout.getContent().length;
			ElementUtil.removeAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild);
			this.oHorizontalLayoutChild.destroy();
			var iLengthAfter = this.oVerticalLayout.getContent().length;
			assert.equal(iLengthAfter, iLengthBefore - 1, 'then the number of controls is right');
		});
		QUnit.test("when there is no AggregationMutator", function(assert) {
			var oStub = sandbox.stub(ElementUtil, "getAggregationAccessors").returns({});
			ElementUtil.removeAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild);
			assert.ok(this.oVerticalLayout.getContent().indexOf(this.oHorizontalLayoutChild) === -1 , "then HorizontalLayoutChild is removed from the content");
			oStub.restore();
			this.oHorizontalLayoutChild.destroy();
		});
	});

	QUnit.module("isValidForAggregation()", {
		beforeEach : function() {
			fnCreateControls.call(this);
		},
		afterEach : function() {
			fnDestroyControls.call(this);
		}
	}, function(){
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
	});

	QUnit.module("getParent()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function(){
		QUnit.test("when getParent() is called for oButton", function(assert) {
			assert.equal(ElementUtil.getParent(this.oButton), this.oHorizontalLayoutChild, 'then the right parent is returned');
		});

		QUnit.test("when getParent() is called for a Component", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			assert.equal(ElementUtil.getParent(this.oComponent), this.oCompContainer, 'then the ComponentContainer is returned');
		});
	});

	QUnit.module("isElementValid()", {
		beforeEach : function() {
			fnCreateMinimumControls.call(this);
		},
		afterEach : function() {
			fnDestroyMinimumControls.call(this);
		}
	}, function(){
		QUnit.test("when isElementValid() is called for a Control", function(assert) {
			assert.equal(ElementUtil.isElementValid(this.oButton), true, 'then it returns true');
		});

		QUnit.test("when isElementValid() is called for a destroyed Control", function(assert) {
			this.oButton.destroy();
			assert.equal(ElementUtil.isElementValid(this.oButton), false, 'then it returns false');
		});
	});

	QUnit.module("Given getLabelForElement()", {
		beforeEach : function() {
		},
		afterEach : function() {
			if (this.oLabelControl) {
				this.oLabelControl.destroy();
			}
		}
	}, function() {
		QUnit.test("when getLabelForElement is called with a function", function (assert) {
			var fnFunction = function (oElement) {
				return oElement.getId();
			};
			var oButton = new Button("testButton");
			assert.equal(ElementUtil.getLabelForElement(oButton, fnFunction), "testButton", "then it executes the function with the desired return value");
			oButton.destroy();
		});

		QUnit.test("when getLabelForElement is called with a label", function (assert) {
			this.oLabelControl = new Label("id", {
				text: "label"
			});
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "label", "then it returns the label (getText())");
		});

		QUnit.test("when getLabelForElement is called with a Button", function (assert) {
			this.oLabelControl = new Button("id", {
				text: "Button text"
			});
			this.oLabelControl.getLabelText = function(){
				return this.getText();
			};
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "Button text", "then it returns the label (getLabelText())");
		});

		QUnit.test("when getLabelForElement is called with a Group", function (assert) {
			this.oLabelControl = new InputListItem("id", {
				label: "Input list item label"
			});
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "Input list item label", "then it returns the label (getLabel())");
		});

		QUnit.test("when getLabelForElement is called with a SimpleForm", function (assert) {
			this.oLabelControl = new ObjectAttribute("id", {
				title: "Object attribute title"
			});
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "Object attribute title", "then it returns the label (getTitle())");
		});

		QUnit.test("when getLabelForElement is called with a ManagedObject", function (assert) {
			this.oLabelControl = new ManagedObject("managedObjectId");
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "managedObjectId", "then it returns the Id for a managed object");
		});

		QUnit.test("when getLabelForElement is called with a Label without text property set", function (assert) {
			this.oLabelControl = new Label("id");
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "id", "then it returns the Id (getId())");
		});

		QUnit.test("when getLabelForElement is called with a form element (withouth getLabelText) with Label as control", function (assert) {
			this.oLabelControl = new FormElement("id", {
				label: new Label({
					text: "label"
				})
			});
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "label", "then it returns the labels text (getLabel().getText())");
		});

		QUnit.test("when getLabelForElement is called with an object which is not a managed object", function (assert) {
			assert.throws(
				ElementUtil.getLabelForElement.bind(null, {}),
				DtUtil.createError("ElementUtil#getLabelForElement", "A valid managed object instance should be passed as parameter", "sap.ui.dt"),
				"then the correct error is thrown"
			);
		});

		QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
		});
	});

});