/* global QUnit */

sap.ui.define([
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/IconTabFilter",
	"sap/m/IconTabBar",
	"sap/m/Input",
	"sap/m/InputListItem",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/ObjectAttribute",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Util",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	DynamicPage,
	DynamicPageTitle,
	Button,
	CustomListItem,
	IconTabFilter,
	IconTabBar,
	Input,
	InputListItem,
	Label,
	List,
	ObjectAttribute,
	Select,
	Text,
	VBox,
	ManagedObject,
	ComponentContainer,
	Element,
	Item,
	UIComponent,
	ElementUtil,
	DtUtil,
	HorizontalLayout,
	VerticalLayout,
	Form,
	FormContainer,
	FormElement,
	JSONModel,
	nextUIUpdate,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var fnCreateMinimumControls = function() {
		this.oButton = new Button("testButton1", {text: "Button"});
		this.oIconTabFilter = new IconTabFilter("icontabfilter", {
			text: "Orders"
		});
		this.oIconTabBar = new IconTabBar();
	};

	var fnDestroyMinimumControls = function() {
		this.oButton.destroy();
		this.oIconTabFilter.destroy();
		this.oIconTabBar.destroy();
	};

	var fnCreateControls = async function() {
		fnCreateMinimumControls.call(this);
		this.oHorizontalLayoutChild = new HorizontalLayout({
			content: [
				new Button({text: "Button"}),
				this.oButton
			]
		});
		this.oVerticalLayout = new VerticalLayout("verticalLayout", {
			content: [
				new Button({text: "Button"}),
				new Button({text: "Button"}),
				new Button({text: "Button"}),
				new Button({text: "Button"}),
				this.oHorizontalLayoutChild
			]
		});
		this.oVerticalLayout.placeAt("qunit-fixture");
		await nextUIUpdate();
	};

	var fnDestroyControls = function() {
		fnDestroyMinimumControls.call(this);
		this.oVerticalLayout.destroy();
	};

	var fnCreateMoreControls = function() {
		this.oHorizontalLayoutChild1 = new HorizontalLayout({
			content: [
				new Input({value: "11"}),
				new Button({text: "12"})
			]
		});
		this.oHorizontalLayoutChild2 = new HorizontalLayout({
			content: [
				new Button({text: "21"}),
				new Text({text: "22"})
			]
		});
		this.oVerticalLayout2 = new VerticalLayout({
			content: [
				new Button({text: "Button"}),
				this.oHorizontalLayoutChild1,
				new Button({text: "Button"}),
				this.oHorizontalLayoutChild2,
				new Button({text: "Button"})
			]
		});
	};

	var fnDestroyMoreControls = function() {
		this.oVerticalLayout2.destroy();
	};

	var fnCreateComponent = function() {
		var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
			createContent() {
				return new VerticalLayout("Root", {
					content: [
						new Button({ text: "Text" })
					]
				});
			}
		});

		this.oComponent = new CustomComponent("Component");
		this.oCompContainer = new ComponentContainer("CompCont1");
	};

	var fnDestroyComponent = function() {
		this.oComponent.destroy();
		this.oCompContainer.destroy();
	};

	var fnCreateForm = function() {
		this.oForm = new Form("form1", {
			formContainers: [
				new FormContainer("group1"),
				new FormContainer("group2")
			]
		});
		this.oFormContainer1 = Element.getElementById("group1");
	};

	var fnDestroyForm = function() {
		this.oForm.destroy();
		this.oFormContainer1.destroy();
	};

	var fnCreateCustomControl = function() {
		var CustomControl = Element.extend("CustomControl", {
			metadata: {
				associations: {
					elements: { type: "sap.ui.core.Control", multiple: true }
				}
			}
		});
		this.oCustomControl = new CustomControl();
	};

	var fnDestroyCustomControl = function() {
		this.oCustomControl.destroy();
	};

	QUnit.module("hasInterface()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
		}
	}, function() {
		QUnit.test("when the hasInterface is called with an interface", function(assert) {
			assert.equal(
				ElementUtil.hasInterface(this.oIconTabFilter, "sap.m.IconTab"),
				true,
				"then the static method 'hasInterface' returns true, if control implements this interface"
			);
			assert.equal(
				ElementUtil.hasInterface(this.oButton, "sap.m.IconTab"),
				false,
				"then the static method 'hasInterface' returns false, if control does not implement this interface"
			);
		});

		QUnit.test("when the hasInterface is called with an empty interface", function(assert) {
			assert.equal(ElementUtil.hasInterface(this.oIconTabFilter, ""), false, "then the static method 'hasInterface' returns false");
		});

		QUnit.test("when the hasInterface is called with an undefined interface", function(assert) {
			assert.equal(ElementUtil.hasInterface(this.oIconTabFilter), false, "then the static method 'hasInterface' returns false");
		});
	});

	QUnit.module("getElementInstance()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function() {
		QUnit.test("when getElementInstance() is called with a control-Id", function(assert) {
			assert.equal(
				ElementUtil.getElementInstance(this.oButton.getId()),
				this.oButton,
				"then the static method 'getElementInstance' returns the control"
			);
		});
		QUnit.test("when getElementInstance() is called with a control instance", function(assert) {
			assert.equal(
				ElementUtil.getElementInstance(this.oButton),
				this.oButton,
				"then the static method 'getElementInstance' returns the control"
			);
		});
		QUnit.test("when getElementInstance() is called with a Component-Id", function(assert) {
			assert.equal(
				ElementUtil.getElementInstance(this.oComponent.getId()),
				this.oComponent,
				"then the static method 'getElementInstance' returns the Component"
			);
		});
	});

	QUnit.module("getClosestElementForNode()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when getClosestElementForNode() is called with the main DOM-node of the control", function(assert) {
			var oNode = this.oButton.getDomRef();
			assert.equal(
				ElementUtil.getClosestElementForNode(oNode),
				this.oButton,
				"then the static method 'getClosestElementForNode' returns the control"
			);
		});
		QUnit.test("when getClosestElementForNode() is called with a DOM-node of the control", function(assert) {
			var oNode = this.oButton.getDomRef().children[0];
			assert.equal(
				ElementUtil.getClosestElementForNode(oNode),
				this.oButton,
				"then the static method 'getClosestElementForNode' returns the control"
			);
		});
		QUnit.test("when getClosestElementForNode() is called with a DOM-node not belonging to any control", function(assert) {
			var oNode = document.createElement("div");
			oNode.setAttribute("id", "testdiv");
			oNode.innerHTML = "TEST";
			document.querySelector("#qunit-fixture").append(oNode);
			assert.equal(
				ElementUtil.getClosestElementForNode(oNode),
				undefined,
				"then the static method 'getClosestElementForNode' returns undefined"
			);
		});
	});

	QUnit.module("fixComponentParent()", {
		async beforeEach() {
			await fnCreateControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function() {
		QUnit.test("when fixComponentParent() is called with a Component within a container", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			this.oVerticalLayout.addContent(this.oCompContainer);
			assert.equal(
				ElementUtil.fixComponentParent(this.oComponent),
				this.oVerticalLayout,
				"then the static method 'fixComponentParent' returns the Parent of the Component Container"
			);
		});
		QUnit.test("when fixComponentParent() is called with a Component without a container", function(assert) {
			assert.equal(
				ElementUtil.fixComponentParent(this.oComponent),
				undefined,
				"then the static method 'fixComponentParent' returns undefined"
			);
		});
		QUnit.test("when fixComponentParent() is called with another Control", function(assert) {
			assert.equal(
				ElementUtil.fixComponentParent(this.oVerticalLayout),
				this.oVerticalLayout,
				"then the static method 'fixComponentParent' returns the control itself"
			);
		});
	});

	QUnit.module("fixComponentContainerElement()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function() {
		QUnit.test("when fixComponentContainerElement() is called with a ComponentContainer with a Component", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			var oRootControl = Element.getElementById("Root");
			assert.equal(
				ElementUtil.fixComponentContainerElement(this.oCompContainer),
				oRootControl,
				"then the static method 'fixComponentContainerElement' returns the Root Control of the Component"
			);
		});
		QUnit.test("when fixComponentContainerElement() is called with a ComponentContainer without a Component", function(assert) {
			assert.equal(
				ElementUtil.fixComponentContainerElement(this.oCompContainer),
				undefined,
				"then the static method 'fixComponentContainerElement' returns undefined"
			);
		});
		QUnit.test("when fixComponentContainerElement() is called with another Control", function(assert) {
			assert.equal(
				ElementUtil.fixComponentContainerElement(this.oButton),
				this.oButton,
				"then the static method 'fixComponentContainerElement' returns the control itself"
			);
		});
	});

	QUnit.module("getDomRef()", {
		async beforeEach() {
			await fnCreateControls.call(this);
			fnCreateForm.call(this);
			this.oVerticalLayout.addContent(this.oForm);
		},
		afterEach() {
			fnDestroyControls.call(this);
			fnDestroyForm.call(this);
		}
	}, function() {
		QUnit.test("when it is rendered and the DOM reference is available", function(assert) {
			var oDomRef = this.oVerticalLayout.getDomRef();
			var oDomRefTest = ElementUtil.getDomRef(this.oVerticalLayout);
			assert.deepEqual(oDomRefTest, oDomRef, "then the static method 'getDomRef' returns the right value");
		});
		QUnit.test("when it is rendered and the RenderedDOM reference is available", function(assert) {
			var oDomRef = this.oFormContainer1.getRenderedDomRef();
			var oDomRefTest = ElementUtil.getDomRef(this.oFormContainer1);
			assert.deepEqual(oDomRefTest, oDomRef, "then the static method 'getDomRef' returns the right value");
		});
		QUnit.test("when getDomRef() is not available for this Element", function(assert) {
			var oDomRefTest = ElementUtil.getDomRef(this.oHorizontalLayoutChild.getContent());
			assert.deepEqual(oDomRefTest, undefined, "then the static method 'getDomRef' returns undefined");
		});
	});

	QUnit.module("hasAncestor()", {
		async beforeEach() {
			await fnCreateControls.call(this);
			fnCreateComponent.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
			fnDestroyComponent.call(this);
		}
	}, function() {
		QUnit.test("when a control is a successor of another control", function(assert) {
			assert.equal(
				ElementUtil.hasAncestor(this.oButton, this.oVerticalLayout),
				true,
				"then static method 'hasAncestor' returns true"
			);
		});

		QUnit.test("when a control is not a successor of another control", function(assert) {
			var oButton = new Button({text: "Button"});
			assert.equal(ElementUtil.hasAncestor(oButton, this.oVerticalLayout), false, "then static method 'hasAncestor' returns false");
		});

		QUnit.test("when the reference control is a UIComponent", function(assert) {
			var oButton = this.oComponent.getRootControl().getContent()[0];
			assert.equal(ElementUtil.hasAncestor(oButton, this.oComponent), true, "then static method 'hasAncestor' returns true");
		});

		QUnit.test("when the reference control is a layout that includes a UIComponent", function(assert) {
			this.oCompContainer.setComponent(this.oComponent);
			this.oVerticalLayout.addContent(this.oCompContainer);
			var oButton = this.oComponent.getRootControl().getContent()[0];
			assert.equal(ElementUtil.hasAncestor(oButton, this.oVerticalLayout), true, "then static method 'hasAncestor' returns true");
		});
	});

	QUnit.module("findAllSiblingsInContainer()", {
		async beforeEach() {
			await fnCreateControls.call(this);
			fnCreateMoreControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
			fnDestroyMoreControls.call(this);
		}
	}, function() {
		QUnit.test("when asking for the siblings in a container, where the container is the direct parent", function(assert) {
			var aSiblings = ElementUtil.findAllSiblingsInContainer(this.oButton, this.oHorizontalLayoutChild);
			assert.equal(aSiblings.length, 2, " then both controls are found (including the original control)");
			assert.equal(
				aSiblings[0].getId(),
				this.oHorizontalLayoutChild.getContent()[0].getId(),
				"and the sibling is the right control "
			);
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
			assert.equal(
				aSiblings.length,
				4,
				" then all controls in the same aggregation at the lowest level found (including the original control)"
			);
			assert.deepEqual(aSiblings, aChildren1.concat(aChildren2), " and the controls are the same");
		});

		QUnit.test("when calling without an element", function(assert) {
			var aSiblings = ElementUtil.findAllSiblingsInContainer(undefined, this.oHorizontalLayoutChild);
			assert.equal(aSiblings.length, 0, " then the siblings array is empty");
		});

		QUnit.test("when calling with an element which has no parent", function(assert) {
			sandbox.stub(this.oButton, "getParent").returns(undefined);
			var aSiblings = ElementUtil.findAllSiblingsInContainer(this.oButton, this.oHorizontalLayoutChild);
			assert.equal(aSiblings.length, 0, " then the siblings array is empty");
		});
	});

	QUnit.module("getAggregationAccessors()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when the control has aggregations", function(assert) {
			var mAccessors = ElementUtil.getAggregationAccessors(this.oVerticalLayout, "content");
			assert.deepEqual(mAccessors, {
				get: "getContent",
				add: "addContent",
				remove: "removeContent",
				insert: "insertContent",
				removeAll: "removeAllContent"
			}, "then the static method 'getAggregationAccessors' returns all accessors of an aggregation");

			var aFoundAggregations = [];
			ElementUtil.iterateOverAllPublicAggregations(this.oVerticalLayout, function(oAggregation) {
				aFoundAggregations.push(oAggregation.name);
			});
			assert.deepEqual(
				aFoundAggregations,
				["tooltip", "customData", "layoutData", "dependents", "dragDropConfig", "content"],
				"then the static method 'iterateOverAllPublicAggregations' finds all public aggregations"
			);
		});
	});

	QUnit.module("getAssociationAccessors()", {
		beforeEach() {
			fnCreateCustomControl.call(this);
		},
		afterEach() {
			fnDestroyCustomControl.call(this);
		}
	}, function() {
		QUnit.test("when the control has associations", function(assert) {
			var mAccessors = ElementUtil.getAssociationAccessors(this.oCustomControl, "elements");
			assert.deepEqual(mAccessors, {
				get: "getElements",
				add: "addElement",
				remove: "removeElement",
				insert: undefined,
				removeAll: "removeAllElements"
			}, "then the static method 'getAssociationAccessors' returns all accessors of an existing association");
		});

		QUnit.test("when the control has associations", function(assert) {
			var mAccessors = ElementUtil.getAssociationAccessors(this.oCustomControl, "nonexisting");
			assert.deepEqual(
				mAccessors,
				{},
				"then the static method 'getAssociationAccessors' returns an empty object for an non existing association"
			);
		});
	});

	QUnit.module("getAssociation()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function() {
		QUnit.test("when the control has associations", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var mResult = [this.oButton.getId(), this.oIconTabFilter.getId()];
			var mAssociationElements = ElementUtil.getAssociation(this.oCustomControl, "elements");
			assert.deepEqual(mAssociationElements, mResult, "then the static method 'getAssociation' returns the ids of the association");
		});
		QUnit.test("when the control has associations", function(assert) {
			var mAssociationElements = ElementUtil.getAssociation(this.oCustomControl, "nonexisting");
			assert.deepEqual(
				mAssociationElements,
				undefined,
				"then the static method 'getAssociation' returns undefined for non existing association"
			);
		});
	});

	QUnit.module("getAssociationInstances()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function() {
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "elements");
			assert.deepEqual(
				mAssociationElements,
				[this.oButton, this.oIconTabFilter],
				"then the static method 'getAssociationInstances' returns an array of elements if more elements are associated"
			);
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "elements");
			assert.deepEqual(
				mAssociationElements,
				[this.oButton],
				"then the static method 'getAssociationInstances' returns an array with one elenement if only one element is associated"
			);
		});
		QUnit.test("when the control has associations", function(assert) {
			var mAssociationElements = ElementUtil.getAssociationInstances(this.oCustomControl, "nonexisting");
			assert.deepEqual(
				mAssociationElements,
				[],
				"then the static method 'getAssociationInstances' returns an empty array for non existing association"
			);
		});
	});

	QUnit.module("getIndexInAssociation()", {
		beforeEach() {
			fnCreateMinimumControls.call(this);
			fnCreateCustomControl.call(this);
		},
		afterEach() {
			fnDestroyMinimumControls.call(this);
			fnDestroyCustomControl.call(this);
		}
	}, function() {
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			this.oCustomControl.addElement(this.oIconTabFilter);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oIconTabFilter, this.oCustomControl, "elements");
			assert.deepEqual(
				nAssociationIndex,
				1,
				"then the static method 'getIndexInAssociation' returns the correct index position in association for multiple elements"
			);
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oButton, this.oCustomControl, "elements");
			assert.deepEqual(
				nAssociationIndex,
				0,
				"then the static method 'getIndexInAssociation' returns zero if only one element is in an association"
			);
		});
		QUnit.test("when the control has association", function(assert) {
			this.oCustomControl.addElement(this.oButton);
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oIconTabFilter, this.oCustomControl, "elements");
			assert.deepEqual(
				nAssociationIndex,
				-1,
				"then the static method 'getIndexInAssociation' returns -1 if element is not in an association"
			);
		});
		QUnit.test("when the control has associations", function(assert) {
			var nAssociationIndex = ElementUtil.getIndexInAssociation(this.oButton, this.oCustomControl, "nonexisting");
			assert.deepEqual(
				nAssociationIndex,
				-1,
				"then the static method 'getIndexInAssociation' returns -1 for non existing association"
			);
		});
	});

	QUnit.module("addAggregation()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when a child control is added to an aggregation", function(assert) {
			var oButton = new Button({text: "Button"});
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
			assert.ok(this.oHorizontalLayoutChild.getContent().indexOf(this.oButton) !== -1, "then Button is added to the content");
			oStub.restore();
		});
	});

	QUnit.module("insertAggregation()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when a child control is added to an aggregation at a certain position", function(assert) {
			var oButton = new Button({text: "Button"});
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
			assert.strictEqual(
				this.oVerticalLayout.getContent()[1],
				this.oHorizontalLayoutChild,
				"and the control is at the right position"
			);
		});

		QUnit.test("when the control is added into a child of itself at a certain position", function(assert) {
			var that = this;
			assert.throws(function() {
				ElementUtil.insertAggregation(that.oHorizontalLayoutChild, "content", this.oVerticalLayout, 1);
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
			assert.ok(this.oHorizontalLayoutChild.getContent().indexOf(this.oButton) !== -1, "then Button is added to the content");
			oStub.restore();
		});
	});

	QUnit.module("removeAggregation()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when a child control is removed from an aggregation of the control", function(assert) {
			var iLengthBefore = this.oVerticalLayout.getContent().length;
			ElementUtil.removeAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild);
			this.oHorizontalLayoutChild.destroy();
			var iLengthAfter = this.oVerticalLayout.getContent().length;
			assert.equal(iLengthAfter, iLengthBefore - 1, "then the number of controls is right");
		});
		QUnit.test("when there is no AggregationMutator", function(assert) {
			var oStub = sandbox.stub(ElementUtil, "getAggregationAccessors").returns({});
			ElementUtil.removeAggregation(this.oVerticalLayout, "content", this.oHorizontalLayoutChild);
			assert.ok(
				this.oVerticalLayout.getContent().indexOf(this.oHorizontalLayoutChild) === -1,
				"then HorizontalLayoutChild is removed from the content"
			);
			oStub.restore();
			this.oHorizontalLayoutChild.destroy();
		});
	});

	QUnit.module("isValidForAggregation()", {
		async beforeEach() {
			await fnCreateControls.call(this);
		},
		afterEach() {
			fnDestroyControls.call(this);
		}
	}, function() {
		QUnit.test("when an element is checked if it is valid for an aggregation of a parent", function(assert) {
			assert.equal(
				ElementUtil.isValidForAggregation(this.oVerticalLayout, "content", new Button({text: "Button"})),
				true,
				"then the static method 'isValidForAggregation' returns true"
			);
		});

		QUnit.test("when an element is checked if it is valid for an aggregation of itself", function(assert) {
			assert.equal(
				ElementUtil.isValidForAggregation(this.oVerticalLayout, "content", this.oVerticalLayout),
				false,
				"then the static method 'isValidForAggregation' returns false"
			);
		});

		QUnit.test("when an element is checked if it is valid for an aggregation of one of its children", function(assert) {
			assert.equal(
				ElementUtil.isValidForAggregation(this.oHorizontalLayoutChild, "content", this.oVerticalLayout),
				false,
				"then the static method 'isValidForAggregation' returns false"
			);
		});

		QUnit.test("when an element is checked if it is valid for an aggregation, which type is an interface", function(assert) {
			assert.equal(
				ElementUtil.isValidForAggregation(this.oIconTabBar, "items", this.oIconTabFilter),
				true,
				"then the static method 'isValidForAggregation' returns true"
			);
		});

		QUnit.test("when a control has non-multiple aggregations with existing items", function(assert) {
			var oFormElement = new FormElement({label: "InputLabel"});
			var oLabel = new Label();
			assert.equal(ElementUtil.isValidForAggregation(oFormElement, "label", oLabel), false,
				"then the static method 'isValidForAggregation' returns false");
		});

		QUnit.test("when a control has non-multiple aggregations without an existing item", function(assert) {
			var oFormElement = new FormElement();
			var oLabel = new Label();
			assert.equal(ElementUtil.isValidForAggregation(oFormElement, "label", oLabel), true,
				"then the static method 'isValidForAggregation' returns true");
		});
	});

	QUnit.module("isElementValid()", {
		afterEach() {
			if (this.oObject) {
				this.oObject.destroy();
			}
		}
	}, function() {
		QUnit.test("when isElementValid() is called for a Control", function(assert) {
			this.oObject = new Button({
				text: "Button"
			});
			assert.equal(ElementUtil.isElementValid(this.oObject), true);
		});

		QUnit.test("when isElementValid() is called for a destroyed Control", function(assert) {
			this.oObject = new Button({
				text: "Button"
			});
			this.oObject.destroy();
			assert.equal(ElementUtil.isElementValid(this.oObject), false);
		});

		QUnit.test("when isElementValid() is called with Component instance", function(assert) {
			fnCreateComponent.call(this);
			assert.equal(ElementUtil.isElementValid(this.oComponent), true);
			fnDestroyComponent.call(this);
		});

		QUnit.test("when isElementValid() is called with invalid ManagedObject (non-Element and non-Component descendant)", function(assert) {
			var CustomObject = ManagedObject.extend("customObject");
			this.oObject = new CustomObject();
			assert.equal(ElementUtil.isElementValid(this.oObject), false);
		});
	});

	QUnit.module("Given getLabelForElement()", {
		beforeEach() {
		},
		afterEach() {
			if (this.oLabelControl) {
				this.oLabelControl.destroy();
			}
		}
	}, function() {
		QUnit.test("when getLabelForElement is called with a function", function(assert) {
			var fnFunction = function(oElement) {
				return oElement.getId();
			};
			var oButton = new Button("testButton");
			assert.equal(
				ElementUtil.getLabelForElement(oButton, fnFunction),
				"testButton",
				"then it executes the function with the desired return value"
			);
			oButton.destroy();
		});

		QUnit.test("when getLabelForElement is called with a label", function(assert) {
			this.oLabelControl = new Label("id", {
				text: "label"
			});
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "label", "then it returns the label (getText())");
		});

		QUnit.test("when getLabelForElement is called with a Button", function(assert) {
			this.oLabelControl = new Button("id", {
				text: "Button text"
			});
			this.oLabelControl.getLabelText = function() {
				return this.getText();
			};
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "Button text", "then it returns the label (getLabelText())");
		});

		QUnit.test("when getLabelForElement is called with a Group", function(assert) {
			this.oLabelControl = new InputListItem("id", {
				label: "Input list item label"
			});
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"Input list item label",
				"then it returns the label (getLabel())"
			);
		});

		QUnit.test("when getLabelForElement is called with a SimpleForm", function(assert) {
			this.oLabelControl = new ObjectAttribute("id", {
				title: "Object attribute title"
			});
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"Object attribute title",
				"then it returns the label (getTitle())"
			);
		});

		QUnit.test("when getLabelForElement is called with a Component", function(assert) {
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent() {}
			});

			this.oLabelControl = new CustomComponent("componentObjectId");
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"componentObjectId",
				"then it returns the Id for a component object"
			);
		});

		QUnit.test("when getLabelForElement is called with a Label without text property set", function(assert) {
			this.oLabelControl = new Label("id");
			assert.equal(ElementUtil.getLabelForElement(this.oLabelControl), "id", "then it returns the Id (getId())");
		});

		QUnit.test("when getLabelForElement is called with a form element (withouth getLabelText) with Label as control", function(assert) {
			this.oLabelControl = new FormElement("id", {
				label: new Label({
					text: "label"
				})
			});
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"label",
				"then it returns the labels text (getLabel().getText())"
			);
		});

		QUnit.test("when getLabelForElement is called with a sap.f.DynamicPage (containing an sap.f.DynamicPageTitle, further containing an sap.m.Text)", function(assert) {
			this.oLabelControl = new DynamicPage({
				title: new DynamicPageTitle({
					heading: new Text({
						text: "label"
					})
				})
			});
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"label",
				"then it returns the dynamic page's title (getTitle().getHeading().getText())"
			);
		});

		QUnit.test("when getLabelForElement is called with a sap.f.DynamicPage (containing an sap.f.DynamicPageTitle, further containing an sap.m.Label)", function(assert) {
			this.oLabelControl = new DynamicPage({
				title: new DynamicPageTitle({
					heading: new Label({
						text: "label"
					})
				})
			});
			assert.equal(
				ElementUtil.getLabelForElement(this.oLabelControl),
				"label",
				"then it returns the dynamic page's title (getTitle().getHeading().getLabel().getText())"
			);
		});

		QUnit.test("when getLabelForElement is called with an object which is not a managed object", function(assert) {
			assert.throws(
				ElementUtil.getLabelForElement.bind(null, {}),
				DtUtil.createError(
					"ElementUtil#getLabelForElement", "A valid managed object instance should be passed as parameter", "sap.ui.dt"
				),
				"then the correct error is thrown"
			);
		});
	});

	QUnit.module("Given adjustIndexForMove()", {
	}, function() {
		QUnit.test("when adjustIndexForMove is called with non-similar source and target containers", function(assert) {
			assert.strictEqual(ElementUtil.adjustIndexForMove({value: "sourceContainer"}, {value: "targetContainer"}, 5, 10)
				, 10, "then the passed target index is returned");
		});
		QUnit.test("when adjustIndexForMove is called with similar source and target containers, and source index lower than the target index", function(assert) {
			var oContainer = {value: "sameContainer"};
			assert.strictEqual(
				ElementUtil.adjustIndexForMove(oContainer, oContainer, 5, 10),
				9,
				"then the passed target index is returned decremented by 1"
			);
		});
		QUnit.test("when adjustIndexForMove is called with similar source and target containers, and source index greater than the target index", function(assert) {
			var oContainer = {value: "sameContainer"};
			assert.strictEqual(
				ElementUtil.adjustIndexForMove(oContainer, oContainer, 15, 10),
				10,
				"then the passed target index is returned"
			);
		});
		QUnit.test("when adjustIndexForMove is called with similar source and target containers, and source index is not greater than -1", function(assert) {
			var oContainer = {value: "sameContainer"};
			assert.strictEqual(
				ElementUtil.adjustIndexForMove(oContainer, oContainer, -1, 10),
				10,
				"then the passed target index is returned"
			);
		});
	});

	QUnit.module("Given a bound list control", {
		async beforeEach() {
			var aTexts = [{text: "Text 1"}, {text: "Text 2"}, {text: "Text 3"}];
			var oModel = new JSONModel({
				texts: aTexts
			});

			this.oItemTemplate = new CustomListItem("item", {
				content: [
					new VBox("vbox1", {
						items: [
							new VBox("vbox2", {
								items: [
									new VBox("vbox3", {
										items: [
											new Text("text", {text: "{text}"})
										]
									})
								]
							})
						]
					})
				]
			});
			this.oList = new List("list", {
				items: {
					path: "/texts",
					template: this.oItemTemplate
				}
			}).setModel(oModel);

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			[this.oVBox1] = this.oList.getItems()[1].getContent();
			[this.oListItem0] = this.oList.getItems();
			[this.oText1] = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems();
		},
		afterEach() {
			this.oList.destroy();
			this.oItemTemplate.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when extractTemplateId() is called for control on the 1st level of the template hierarchy", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oVBox1);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"vbox1",
				"... then the id of the bound template control is returned"
			);
		});

		QUnit.test("when extractTemplateId() is called for control on the 4th level of the template hierarchy", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oText1);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"text",
				"... then the id of the bound template control is returned"
			);
		});

		QUnit.test("when extractTemplateId() is called for template's root control", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oListItem0);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"item",
				"... then the id of the bound template control is returned"
			);
		});

		QUnit.test("when extractTemplateId() is called with an empty object", function(assert) {
			assert.equal(ElementUtil.extractTemplateId({}), undefined, "... then undefined is returned");
		});

		QUnit.test("when extractTemplateId() is called without parameters", function(assert) {
			assert.equal(ElementUtil.extractTemplateId(), undefined, "... then undefined is returned");
		});

		QUnit.test("when getAggregationBindingTemplate() is called for control with aggregation binding template attached", function(assert) {
			assert.equal(
				ElementUtil.getAggregationBindingTemplate(this.oList, "items"),
				this.oItemTemplate,
				"then the bound template is returned"
			);
		});

		QUnit.test("when getAggregationBindingTemplate() is called for control without aggregation binding template attached", function(assert) {
			assert.equal(ElementUtil.getAggregationBindingTemplate(this.oVBox1, "content"), undefined, "then undefined is returned");
		});

		QUnit.test("when getAggregationBindingTemplate() is called for control and aggregation name without binding attached", function(assert) {
			assert.equal(ElementUtil.getAggregationBindingTemplate(this.oList, "infoToolbar"), undefined, "then undefined is returned");
		});

		QUnit.test("when getAggregationBindingTemplate() is called for control with invalid aggregation paramter", function(assert) {
			assert.equal(ElementUtil.getAggregationBindingTemplate(this.oList, "invalid"), undefined, "then undefined is returned");
		});

		QUnit.test("when getAggregationBindingTemplate() is called without parameters", function(assert) {
			assert.equal(ElementUtil.getAggregationBindingTemplate(), undefined, "then undefined is returned");
		});

		QUnit.test("when isElementDirectTemplateChild() is called for the list item (direct clone)", function(assert) {
			assert.ok(ElementUtil.isElementDirectTemplateChild(this.oListItem0), "... then true is returned");
		});

		QUnit.test("when isElementDirectTemplateChild() is called for the text inside the template", function(assert) {
			assert.notOk(ElementUtil.isElementDirectTemplateChild(this.oText1), "... then false is returned");
		});
	});

	QUnit.module("Given a bound list control and a control inside of the list which is not in the template", {
		async beforeEach() {
			var aTexts = [{text: "Text 1"}, {text: "Text 2"}, {text: "Text 3"}];
			var oModel = new JSONModel({
				texts: aTexts
			});

			this.oItemTemplate = new CustomListItem("item", {
				content: [
					new VBox("vbox1", {
						items: [
							new VBox("vbox2", {
								items: [
									new VBox("vbox3", {
										items: []
									})
								]
							})
						]
					})
				]
			});
			this.oList = new List("list", {
				items: {
					path: "/texts",
					template: this.oItemTemplate
				}
			}).setModel(oModel);

			// adding a whole list item to the list (not via template)
			this.oList.addItem(new CustomListItem("unboundlist-0", {
				content: [
					new VBox("vbox4", {
						items: [
							new VBox("vbox5", {
								items: [
									new VBox("vbox6", {
										items: [
											new Button("evil-btn1", {text: "{text}"})
										]
									})
								]
							})
						]
					})
				]
			}));

			// adding a control to an aggregation of the template
			this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].addItem(new Button("evil-btn2"));

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			[this.oButton1] = this.oList.getItems()[3].getContent()[0].getItems()[0].getItems()[0].getItems();
			[this.oButton2] = this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems();
		},
		afterEach() {
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oButton1.destroy();
			this.oButton2.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when extractTemplateId() is called for control which is not in the template hierarchy", function(assert) {
			var mAggregationInfo1 = ElementUtil.getAggregationInformation(this.oButton1);
			var mAggregationInfo2 = ElementUtil.getAggregationInformation(this.oButton2);
			assert.equal(ElementUtil.extractTemplateId(mAggregationInfo1), undefined, "... then undefined is returned");
			assert.equal(ElementUtil.extractTemplateId(mAggregationInfo2), undefined, "... then undefined is returned");
		});

		QUnit.test("when isElementInTemplate() is called for control which is not in the template hierarchy", function(assert) {
			var bValid1 = ElementUtil.isElementInTemplate(this.oButton1);
			var bValid2 = ElementUtil.isElementInTemplate(this.oButton2);
			assert.notOk(bValid1, "... then false is returned");
			assert.notOk(bValid2, "... then false is returned");
		});
	});

	QUnit.module("Given a List with bound items and a List with unbound items", {
		async beforeEach() {
			// create list with bound items
			var oData = [
				{text: "item1-bound"},
				{text: "item2-bound"}
			];
			var oModel = new JSONModel(oData);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: new CustomListItem("item", {content: [new Button("item-btn", {text: "{text}"})]}),
				templateShareable: false
			});

			this.oFactoryBoundList = new List("factoryboundlist").setModel(oModel);
			this.oFactoryBoundList.bindAggregation("items", {
				path: "/",
				factory(sId) {
					return new CustomListItem(sId, {content: [new Button(`${sId}-btn`, {text: "{text}"})]});
				}
			});

			// create list with unbound items
			this.oUnboundList = new List("unboundlist");
			this.oUnboundList.addItem(new CustomListItem("unboundlist-0", {content: [new Button("item1-btn", {text: "item1-unbound"})]}));
			this.oUnboundList.addItem(new CustomListItem("unboundlist-1", {content: [new Button("item2-btn", {text: "item2-unbound"})]}));

			// create a HorizontalLayout containing the two lists
			this.oVerticalLayout = new VerticalLayout("verticalLayout0", {
				content: [this.oBoundList, this.oUnboundList, this.oFactoryBoundList]
			});
			this.oVerticalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			[this.oBound, this.oAnotherBound] = this.oBoundList.getItems();
			[this.oBoundChild] = this.oBoundList.getItems()[0].getContent();
			[this.oAnotherBoundChild] = this.oBoundList.getItems()[1].getContent();
			[this.oUnbound] = this.oUnboundList.getItems();
			[this.oUnboundChild] = this.oUnboundList.getItems()[0].getContent();
			[this.oFactoryBound] = this.oFactoryBoundList.getItems();
		},
		afterEach() {
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getAggregationInformation() is called for a bound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oBound);
			assert.equal(mAggregationInfo.elementId, "boundlist", "... then for the bound Item it returns the id of the bound control");
			assert.equal(mAggregationInfo.aggregation, "items", "... and the bound aggregation name");
			assert.equal(mAggregationInfo.templateId, "item", "... and the template id is set");
			assert.equal(mAggregationInfo.stack.length, 1, "... and the traversed stack containing 2 objects");
			assert.equal(mAggregationInfo.stack[0].element, "item-boundlist-0", "... with the element id");
			assert.equal(mAggregationInfo.stack[0].type, "sap.m.CustomListItem", "... with the element type");
			assert.equal(mAggregationInfo.stack[0].aggregation, "items", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[0].index, 0, "... with the index of the element in the aggregation");
		});

		QUnit.test("when getAggregationInformation() is called for another bound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oAnotherBound);
			assert.equal(mAggregationInfo.elementId, "boundlist", "... then for the bound Item it returns the id of the bound control");
			assert.equal(mAggregationInfo.aggregation, "items", "... and the bound aggregation name");
			assert.equal(mAggregationInfo.templateId, "item", "... and the template id is set");
			assert.equal(mAggregationInfo.stack.length, 1, "... and the traversed stack containing 2 objects");
			assert.equal(mAggregationInfo.stack[0].element, "item-boundlist-1", "... with the element id");
			assert.equal(mAggregationInfo.stack[0].type, "sap.m.CustomListItem", "... with the element type");
			assert.equal(mAggregationInfo.stack[0].aggregation, "items", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[0].index, 1, "... with the index of the element in the aggregation");
		});

		QUnit.test("when getAggregationInformation() is called for a child element in a bound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oBoundChild);
			assert.equal(
				mAggregationInfo.elementId,
				"boundlist",
				"... then for the bound Item content it returns the id of the bound control"
			);
			assert.equal(mAggregationInfo.aggregation, "items", "... and the bound aggregation name");
			assert.equal(mAggregationInfo.templateId, "item", "... and the template id is set");
			assert.equal(mAggregationInfo.stack.length, 2, "... and the traversed stack containing 3 objects");
			assert.equal(mAggregationInfo.stack[0].element, "item-btn-boundlist-0", "... with the element id");
			assert.equal(mAggregationInfo.stack[0].type, "sap.m.Button", "... with the element type");
			assert.equal(mAggregationInfo.stack[0].aggregation, "content", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[0].index, 0, "... with the index of the element in the aggregation");
			assert.equal(mAggregationInfo.stack[1].element, "item-boundlist-0", "... with the element id");
			assert.equal(mAggregationInfo.stack[1].type, "sap.m.CustomListItem", "... with the element type");
			assert.equal(mAggregationInfo.stack[1].aggregation, "items", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[1].index, 0, "... with the index of the element in the aggregation");
		});

		QUnit.test("when getAggregationInformation() is called for another child element in a bound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oAnotherBoundChild);
			assert.equal(
				mAggregationInfo.elementId,
				"boundlist",
				"... then for the bound Item content it returns the id of the bound control"
			);
			assert.equal(mAggregationInfo.aggregation, "items", "... and the bound aggregation name");
			assert.equal(mAggregationInfo.templateId, "item", "... and the template id is set");
			assert.equal(mAggregationInfo.stack.length, 2, "... and the traversed stack containing 3 objects");
			assert.equal(mAggregationInfo.stack[0].element, "item-btn-boundlist-1", "... with the element id");
			assert.equal(mAggregationInfo.stack[0].type, "sap.m.Button", "... with the element type");
			assert.equal(mAggregationInfo.stack[0].aggregation, "content", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[0].index, 0, "... with the index of the element in the aggregation");
			assert.equal(mAggregationInfo.stack[1].element, "item-boundlist-1", "... with the element id");
			assert.equal(mAggregationInfo.stack[1].type, "sap.m.CustomListItem", "... with the element type");
			assert.equal(mAggregationInfo.stack[1].aggregation, "items", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[1].index, 1, "... with the index of the element in the aggregation");
		});

		QUnit.test("when getAggregationInformation() is called for bound list with factory function", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oFactoryBound);
			assert.equal(
				mAggregationInfo.elementId,
				"factoryboundlist",
				"... then for the bound Item it returns the id of the bound control"
			);
			assert.equal(mAggregationInfo.aggregation, "items", "... and the bound aggregation name");
			assert.equal(mAggregationInfo.templateId, undefined, "... and the template id is not set");
			assert.equal(mAggregationInfo.stack.length, 1, "... and the traversed stack containing 2 objects");
			assert.equal(mAggregationInfo.stack[0].element, "factoryboundlist-0", "... with the element id");
			assert.equal(mAggregationInfo.stack[0].type, "sap.m.CustomListItem", "... with the element type");
			assert.equal(mAggregationInfo.stack[0].aggregation, "items", "... with the aggregation name");
			assert.equal(mAggregationInfo.stack[0].index, 0, "... with the index of the element in the aggregation");
		});

		QUnit.test("when getAggregationInformation() is called for unbound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oUnbound);
			assert.equal(mAggregationInfo.elementId, undefined, "... then for the unbound Item it returns undefined as id");
			assert.equal(mAggregationInfo.aggregation, undefined, "... and undefined as bound aggregation name");
			assert.equal(mAggregationInfo.templateId, undefined, "... and the template id is not set");
			assert.equal(mAggregationInfo.stack.length, 3, "... and the traversed stack containing 3 objects");
		});

		QUnit.test("when getAggregationInformation() is called for a child element in an unbound list", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oUnboundChild);
			assert.equal(mAggregationInfo.elementId, undefined, "... then for the unbound Item content it returns undefined as id");
			assert.equal(mAggregationInfo.aggregation, undefined, "... and undefined as bound aggregation name");
			assert.equal(mAggregationInfo.templateId, undefined, "... and the template id is not set");
			assert.equal(mAggregationInfo.stack.length, 4, "... and the traversed stack containing 4 objects");
		});
	});

	QUnit.module("Given a bound list control with a bound Select control inside it", {
		async beforeEach() {
			var aTexts = [{text: "Text 1"}, {text: "Text 2"}, {text: "Text 3"}];
			var aItemTexts = [
				{key: "item1", text: "Item Text 1"},
				{key: "item2", text: "Item Text 2"},
				{key: "item3", text: "Item Text 3"}
			];
			var oModel = new JSONModel({
				texts: aTexts,
				itemTexts: aItemTexts
			});

			this.oSelectItemTemplate = new Item("selectItem", {
				key: "{key}",
				text: "{text}"
			});

			this.oItemTemplate = new CustomListItem("item", {
				content: [
					new VBox("vbox1", {
						items: [
							new Button("button", {text: "{text}"}),
							new Select("select", {items: {
								path: "/itemTexts",
								template: this.oSelectItemTemplate,
								templateShareable: false
							}})
						]
					})
				]
			});

			this.oList = new List("list", {
				items: {
					path: "/texts",
					template: this.oItemTemplate
				}
			}).setModel(oModel);

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			[this.oVBox1] = this.oList.getItems()[1].getContent();
			[this.oVBox2] = this.oList.getItems()[2].getContent();
			[this.oButton] = this.oVBox1.getItems();
			[this.oItem1Select1, this.oItem2Select1] = this.oVBox1.getItems()[1].getSelectableItems();
			[this.oItem1Select2] = this.oVBox2.getItems()[1].getSelectableItems();
		},
		afterEach() {
			this.oList.destroy();
			this.oItemTemplate.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when extractTemplateId() is called for a control on the list template", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oButton);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"button",
				"... then the id of the bound template control is returned"
			);
		});

		QUnit.test("when extractTemplateId() and isElementInTemplate() are called for the first item inside the first Select", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oItem1Select1);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"selectItem-list-1",
				"... then the id of the first bound template control is returned"
			);
			assert.ok(ElementUtil.isElementInTemplate(this.oItem1Select1), "... then the element is found in the template");
		});

		QUnit.test("when extractTemplateId() and isElementInTemplate() are called for the second item inside the first Select", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oItem2Select1);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"selectItem-list-1",
				"... then the id of the first bound template control is returned"
			);
			assert.ok(ElementUtil.isElementInTemplate(this.oItem2Select1), "... then the element is found in the template");
		});

		QUnit.test("when extractTemplateId() and isElementInTemplate() are called for the first item inside the second Select", function(assert) {
			var mAggregationInfo = ElementUtil.getAggregationInformation(this.oItem1Select2);
			assert.equal(
				ElementUtil.extractTemplateId(mAggregationInfo),
				"selectItem-list-2",
				"... then the id of the second bound template control is returned"
			);
			assert.ok(ElementUtil.isElementInTemplate(this.oItem1Select2), "... then the element is found in the template");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});