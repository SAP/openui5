/* global QUnit*/

sap.ui.define([
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/base/ManagedObject",
	"sap/ui/util/XMLHelper",
	"sap/ui/thirdparty/sinon-4"
], function(
	BaseTreeModifier,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	Control,
	UIComponent,
	XMLView,
	ManagedObject,
	XMLHelper,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var XML_VIEW =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:form="sap.ui.layout.form">' +
			'<form:SimpleForm id="testComponent---myView--myForm" layout="ColumnLayout">' +
				'<Title id="testComponent---myView--myGroup" />' +
				'<Input id="testComponent---myView--myGroupElement" />' +
			'</form:SimpleForm>' +
		'</mvc:View>';

	var XML_VIEW2 =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
		'<HBox id="hbox1">' +
			'<items>' +
				'<Button id="button1" text="Button1" />' +
				'<Button id="button2" text="Button2" />' +
				'<Button id="button3" text="Button3" />' +
				'<core:ExtensionPoint name="ExtensionPoint1" />' +
				'<Label id="label1" text="TestLabel1" />' +
			'</items>' +
		'</HBox>' +
		'<Panel id="panel">' +
				'<core:ExtensionPoint name="ExtensionPoint2" />' +
				'<Label id="label2" text="TestLabel2" />' +
				'<core:ExtensionPoint name="ExtensionPoint3" />' +
		'</Panel>' +
		'<HBox id="hbox2">' +
			'<Button id="button4" text="Button4" />' +
			'<Button id="button5" text="Button5" />' +
			'<core:ExtensionPoint name="ExtensionPoint3" />' +
			'<Label id="label3" text="TestLabel3" />' +
		'</HBox>' +
	'</mvc:View>';

	var fnMockNodeId = function(sToBeReplacedInId, sReplacementInId, oXmlNode) {
		var sFormNodeId = oXmlNode.getAttribute("id").replace(sToBeReplacedInId, sReplacementInId);
		oXmlNode.setAttribute("id", sFormNodeId);
	};

	QUnit.module("While handling xml views, the BaseTreeModifier", {
		beforeEach: function () {
			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oDOMParser = new DOMParser();
				this.oXmlView = this.oDOMParser.parseFromString(XML_VIEW, "application/xml").documentElement;
				this.oXmlView2 = this.oDOMParser.parseFromString(XML_VIEW2, "application/xml").documentElement;
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("can determine a targeted control for legacy changes with global IDs", function (assert) {
			var oSelector = {
				id: "testComponent---myView--myGroupElement"
			};

			var oControl = XmlTreeModifier.bySelector(oSelector, this.oComponent, this.oXmlView);
			assert.ok(oControl);
		});

		QUnit.test("can determine a targeted control for changes with local IDs", function (assert) {
			var oSelector = {
				id: "myView--myGroupElement",
				idIsLocal: true
			};

			var oControl = XmlTreeModifier.bySelector(oSelector, this.oComponent, this.oXmlView);
			assert.ok(oControl);
		});

		QUnit.test("can determine a targeted control for extension point changes with local IDs", function (assert) {
			var oSelector = {
				name: "ExtensionPoint1",
				viewSelector: {
					id: "myView",
					idIsLocal: true
				}
			};

			return XmlTreeModifier.bySelectorTypeIndependent(oSelector, this.oComponent, this.oXmlView2)
				.then(function (oControl) {
					assert.ok(oControl);
				});
		});

		QUnit.test("can determine a selector for a given node", function (assert) {
			var oFormNode = XmlTreeModifier._children(this.oXmlView)[0];
			var oFormSelector = {
					id: "myView--myForm",
					idIsLocal: true
				};

			var oSelector = XmlTreeModifier.getSelector(oFormNode, this.oComponent);
			assert.propEqual(oSelector, oFormSelector, "ok");
		});

		QUnit.test("will return a selector for a node inside an embedded component", function (assert) {
			var oFormNode = XmlTreeModifier._children(this.oXmlView)[0];
			//fake the node belonging to an embedded component
			fnMockNodeId("testComponent", "embeddedComponent", oFormNode);

			var oFormSelector = {
				id: "embeddedComponent---myView--myForm",
				idIsLocal: false
			};

			var oSelector = XmlTreeModifier.getSelector(oFormNode, this.oComponent);
			assert.propEqual(oSelector, oFormSelector, "ok");
			// restore node
			fnMockNodeId("embeddedComponent", "testComponent", oFormNode);
		});

		QUnit.test("when getSelector is called with a non-stable node id", function (assert) {
			var oFormNode = XmlTreeModifier._children(this.oXmlView)[0];
			//fake the node with an unstable id
			fnMockNodeId("testComponent", "__unstableId", oFormNode);
			var oAppComponent = {
				getLocalId: function() { return null; }
			};

			assert.throws(function () {
					XmlTreeModifier.getSelector(oFormNode, oAppComponent);
				}, new Error("Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 " + oFormNode.getAttribute("id")),
				"then the correct error was thrown");
			// restore node
			fnMockNodeId("__unstableId", "testComponent", oFormNode);
		});
	});

	QUnit.module("While handling js views the BaseTreeModifier", {
		beforeEach: function () {
			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;

				return XMLView.create({
					definition : XML_VIEW,
					id : this.oComponent.createId("myView")
				});
			}.bind(this)).then(function(oView) {
				this.oJsView = oView;
			}.bind(this));
		},
		afterEach: function () {
			this.oComponent.destroy();
			this.oJsView.destroy();
		}
	}, function() {
		QUnit.test("can determine a targeted control for legacy changes with global IDs", function (assert) {
			var oSelector = {
				id: "testComponent---myView--myGroupElement"
			};

			var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent);
			assert.ok(oControl);
		});

		QUnit.test("can determine a targeted control for changes with local IDs", function (assert) {
			var oSelector = {
				id: "myView--myGroupElement",
				idIsLocal: true
			};

			var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent);
			assert.ok(oControl);
		});

		QUnit.test("when called with an embedded component's control", function (assert) {
			var oManagedObject = new ManagedObject("embeddedComponent---mockControl");
			var oControlSelector = {
				id: "embeddedComponent---mockControl",
				idIsLocal: false
			};

			var oSelector = JsControlTreeModifier.getSelector(oManagedObject, this.oComponent);

			assert.propEqual(oSelector, oControlSelector, "then a selector with control's global id and 'isIsLocal' false is returned");
			oManagedObject.destroy();
		});

		QUnit.test("when called with a control containing a non-stable id", function (assert) {
			var oManagedObject = new ManagedObject("__embeddedComponent---mockControl");

			assert.throws(function () {
					JsControlTreeModifier.getSelector(oManagedObject, this.oComponent);
				}, new Error("Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 " + oManagedObject.getId()),
				"then the correct error was thrown");
			oManagedObject.destroy();
		});
	});

	QUnit.module("While handling js views (with extension points) the BaseTreeModifier", {
		beforeEach: function () {
			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;

				return XMLView.create({
					definition : XML_VIEW2,
					id : this.oComponent.createId("myView")
				});
			}.bind(this)).then(function(oView) {
				this.oJsView = oView;
				this.oHBox1 = this.oJsView.getContent()[0];
			}.bind(this));
		},
		afterEach: function () {
			this.oComponent.destroy();
			this.oJsView.destroy();
		}
	}, function() {
		QUnit.test("can determine a targeted control for changes with extension point selector", function (assert) {
			var oSelector = {
				name: "ExtensionPoint1",
				viewSelector: {
					id: "testComponent---myView",
					idIsLocal: false
				}
			};
			return JsControlTreeModifier.bySelectorTypeIndependent(oSelector, this.oComponent)
				.then(function (oControl) {
					assert.strictEqual(oControl.getId(), this.oHBox1.getId(), "then the correct parent control for the extension point selector is returned");
				}.bind(this));
		});
	});

	QUnit.module("Given a BaseTreeModifier...", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when checkAndPrefixIdsInFragment is called with various fragments", function(assert) {
			var fnDone = assert.async(5);

			var oXML1 = XMLHelper.parse(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					// '<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input />' +
					// '<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<items>' +
							'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
						'</items>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML2 = XMLHelper.parse(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input />' +
					'<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML3 = XMLHelper.parse(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input id="input123" />' +
					'<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<items>' +
							'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
						'</items>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML4 = XMLHelper.parse(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input id="input123" />' +
					'<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML5 = XMLHelper.parse(
				'<core:FragmentDefinition xmlns:m="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.uxap" xmlns:core="sap.ui.core">' +
					'<ObjectPageLayout id="ProductDetailLayout" subSectionLayout="{ConfigModel>/subSectionLayout}" flexEnabled="true">' +
						'<headerTitle>' +
							'<ObjectPageHeader id="DetailHeader" objectTitle="DetailHeader" objectSubtitle="DetailHeader" >' +
							'</ObjectPageHeader>' +
						'</headerTitle>' +
						'<headerContent>' +
							'<layout:VerticalLayout id="DetailHeaderContent" >' +
								'<m:FlexBox id="headerLine" fitContainer="true" renderType="Bare" wrap="Wrap">' +
									'<m:items>' +
										'<layout:VerticalLayout id="headerCategoryBlock" class="sapUiSmallMarginEnd sapUiSmallMarginBottom">' +
											'<layout:layoutData>' +
												'<m:FlexItemData id="flexItemData" growFactor="10" minWidth="250px"/>' +
											'</layout:layoutData>' +
											'<m:ObjectStatus id="headerMainCategory" title="headerMainCategory" text="headerMainCategory"/>' +
											'<m:ObjectStatus id="headerProductCategory" title="headerProductCategory" text="headerProductCategory"/>' +
											'<m:ObjectStatus id="headerSupplierName" title="headerSupplierName" text="headerSupplierName"/>' +
										'</layout:VerticalLayout>' +
									'</m:items>' +
								'</m:FlexBox>' +
							'</layout:VerticalLayout>' +
						'</headerContent>' +
						'<sections>' +
							'<ObjectPageSection id="ObjectSectionGeneral" title="ObjectSectionGeneral">' +
								'<subSections>' +
									'<ObjectPageSubSection id="SubSectionGeneral" title="SubSectionGeneral" mode="Expanded">' +
										'<blocks>' +
											'<m:HBox id="hbox6">' +
												'<m:items>' +
													'<m:Button id="button456" text="Hello World" press="onButtonPress" />' +
												'</m:items>' +
											'</m:HBox>' +
										'</blocks>' +
									'</ObjectPageSubSection>' +
								'</subSections>' +
							'</ObjectPageSection>' +
							'<ObjectPageSection id="ObjectSectionTechnical" title="{i18n>xtit.techData}" visible="false">' +
								'<subSections>' +
									'<ObjectPageSubSection id="SubSectionTechnical" title="{i18n>xtit.techData}" mode="Expanded">' +
										'<blocks>' +
											'<m:HBox id="hbox7">' +
												'<m:items>' +
													'<m:Button id="button789" text="Hello World" press="onButtonPress" />' +
												'</m:items>' +
											'</m:HBox>' +
										'</blocks>' +
									'</ObjectPageSubSection>' +
								'</subSections>' +
							'</ObjectPageSection>' +
						'</sections>' +
					'</ObjectPageLayout>' +
				'</core:FragmentDefinition>'
			);

			function checkIdsOfAllChildren(aChildren, assert) {
				aChildren.forEach(function(oChild) {
					assert.notEqual(oChild.getAttribute("id").indexOf("foo."), -1, "the ID '" + oChild.getAttribute("id") + "' got prefixed");
				});
			}

			BaseTreeModifier._checkAndPrefixIdsInFragment(oXML1, "foo").catch(function (vError) {
				assert.strictEqual(vError.message, "At least one control does not have a stable ID",
					"missing stable ID error cought");
				fnDone();
			});

			BaseTreeModifier._checkAndPrefixIdsInFragment(oXML2, "foo").catch(function (vError) {
				assert.strictEqual(vError.message, "At least one control does not have a stable ID",
					"missing stable ID error cought");
				fnDone();
			});

			BaseTreeModifier._checkAndPrefixIdsInFragment(oXML3, "foo").then(function (sResult3) {
				var aChildren = BaseTreeModifier._getElementNodeChildren(sResult3);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(aChildren[3])[0])[0]);
				checkIdsOfAllChildren(aChildren, assert);
				fnDone();
			});

			BaseTreeModifier._checkAndPrefixIdsInFragment(oXML4, "foo").then(function (sResult4) {
				var aChildren = BaseTreeModifier._getElementNodeChildren(sResult4);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(aChildren[3])[0]);
				checkIdsOfAllChildren(aChildren, assert);
				fnDone();
			});

			BaseTreeModifier._checkAndPrefixIdsInFragment(oXML5, "foo").then(function (sResult5) {
				// get all controls which should be prefixed
				var aChildren = BaseTreeModifier._getElementNodeChildren(sResult5);
				var oObjectPageLayout = aChildren[0];

				// headerTitle
				aChildren.push(BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(aChildren[0])[0])[0]);

				// headerContent
				var oVerticalLayout = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(aChildren[0])[1])[0];
				aChildren.push(oVerticalLayout);
				var oFlexBox = BaseTreeModifier._getElementNodeChildren(oVerticalLayout)[0];
				aChildren.push(oFlexBox);
				oVerticalLayout = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oFlexBox)[0])[0];
				aChildren.push(oVerticalLayout);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oVerticalLayout)[0])[0]);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(oVerticalLayout)[1]);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(oVerticalLayout)[2]);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(oVerticalLayout)[3]);

				// sections
				var oSectionsAgg = BaseTreeModifier._getElementNodeChildren(oObjectPageLayout)[2];
				var oSection1 = BaseTreeModifier._getElementNodeChildren(oSectionsAgg)[0];
				aChildren.push(oSection1);
				var oSubSection1 = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oSection1)[0])[0];
				aChildren.push(oSubSection1);
				var oHBox1 = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oSubSection1)[0])[0];
				aChildren.push(oHBox1);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oHBox1)[0])[0]);

				var oSection2 = BaseTreeModifier._getElementNodeChildren(oSectionsAgg)[1];
				aChildren.push(oSection2);
				var oSubSection2 = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oSection2)[0])[0];
				aChildren.push(oSubSection2);
				var oHBox2 = BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oSubSection2)[0])[0];
				aChildren.push(oHBox2);
				aChildren.push(BaseTreeModifier._getElementNodeChildren(BaseTreeModifier._getElementNodeChildren(oHBox2)[0])[0]);

				checkIdsOfAllChildren(aChildren, assert);
				fnDone();
			});
		});

		QUnit.test("when getPropertyBindingOrProperty is called", function(assert) {
			sandbox.stub(BaseTreeModifier, "getPropertyBinding")
				.onCall(0).returns(undefined)
				.onCall(1).returns("propertyBinding")
				.onCall(2).returns("propertyBinding");
			sandbox.stub(BaseTreeModifier, "getProperty")
				.onCall(0).resolves("property")
				.onCall(1).resolves(undefined)
				.onCall(2).resolves("property");

			return BaseTreeModifier.getPropertyBindingOrProperty()
				.then(function (oPropertyOrBinding) {
					assert.equal(oPropertyOrBinding, "property", "without propertyBinding the property is returned");
					return BaseTreeModifier.getPropertyBindingOrProperty();
				})
				.then(function (oPropertyOrBinding) {
					assert.equal(oPropertyOrBinding, "propertyBinding", "without property the propertyBinding is returned");
					return BaseTreeModifier.getPropertyBindingOrProperty();
				})
				.then(function (oPropertyOrBinding) {
					assert.equal(oPropertyOrBinding, "propertyBinding", "with both returning something the propertyBinding is returned");
				});
		});

		QUnit.test("when setPropertyBindingOrProperty is called", function(assert) {
			var oPropertyBindingStub = sandbox.stub(BaseTreeModifier, "setPropertyBinding");
			var oPropertyStub = sandbox.stub(BaseTreeModifier, "setProperty");

			// control and propertyName are not needed in this test
			var vBindingOrValue;
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 0, "the propertyBindingStub was not called");
			assert.equal(oPropertyStub.callCount, 1, "the propertyBindingStub was called");

			vBindingOrValue = "";
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 0, "the propertyBindingStub was not called");
			assert.equal(oPropertyStub.callCount, 2, "the propertyBindingStub was called");

			vBindingOrValue = "property";
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 0, "the propertyBindingStub was not called");
			assert.equal(oPropertyStub.callCount, 3, "the propertyBindingStub was called");

			vBindingOrValue = "{property}";
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 1, "the propertyBindingStub was called");
			assert.equal(oPropertyStub.callCount, 3, "the propertyBindingStub was not called");

			vBindingOrValue = {
				path: "foo"
			};
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 2, "the propertyBindingStub was called");
			assert.equal(oPropertyStub.callCount, 3, "the propertyBindingStub was not called");

			vBindingOrValue = {
				parts: "foo"
			};
			BaseTreeModifier.setPropertyBindingOrProperty(undefined, undefined, vBindingOrValue);
			assert.equal(oPropertyBindingStub.callCount, 3, "the propertyBindingStub was called");
			assert.equal(oPropertyStub.callCount, 3, "the propertyBindingStub was not called");
		});

		QUnit.test("when getControlIdBySelector is called with a string", function(assert) {
			const sAppComponentId = "myAppComponentId";
			const oSelector = {
				idIsLocal: true,
				id: "myLocalId"
			};
			const sId = BaseTreeModifier.getControlIdBySelector(oSelector, sAppComponentId);
			assert.strictEqual(sId, `${sAppComponentId}---${oSelector.id}`, "the Id is correctly calculated");
		});
	});


	QUnit.module("checkControlId and hasLocalIdSuffix", {
		beforeEach: function () {
			this.oComponent = new UIComponent();
			this.oControlWithGeneratedId = new Control();
			this.oControlWithPrefix = new Control(this.oComponent.createId("myButton"));
			this.oControlWithoutPrefix = new Control("myButtonWithoutAppPrefix");
		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oControlWithGeneratedId.destroy();
			this.oControlWithPrefix.destroy();
			this.oControlWithoutPrefix.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("checkControlId shall return false if the ID was generated", function (assert) {
			assert.equal(BaseTreeModifier.checkControlId(this.oControlWithGeneratedId, this.oComponent), false);
		});

		QUnit.test("checkControlId shall return true if control ID was not generated", function (assert) {
			assert.equal(BaseTreeModifier.checkControlId(this.oControlWithPrefix, this.oComponent), true);
		});

		QUnit.test("checkControlId shall return true if the ID is a stable ID not containing the ComponentId", function (assert) {
			assert.equal(BaseTreeModifier.checkControlId(this.oControlWithoutPrefix, this.oComponent), true);
		});

		QUnit.test("hasLocalIdSuffix can determine that a control has a local ID", function(assert) {
			assert.ok(BaseTreeModifier.hasLocalIdSuffix(this.oControlWithPrefix, this.oComponent));
		});

		QUnit.test("hasLocalIdSuffix can determine that a control has no local ID", function(assert) {
			assert.notOk(BaseTreeModifier.hasLocalIdSuffix(this.oControlWithoutPrefix, this.oComponent));
		});

		QUnit.test("hasLocalIdSuffix returns false if no app component can be found", function(assert) {
			assert.notOk(BaseTreeModifier.hasLocalIdSuffix(this.oControlWithoutPrefix, this.oComponent));
		});
	});
});