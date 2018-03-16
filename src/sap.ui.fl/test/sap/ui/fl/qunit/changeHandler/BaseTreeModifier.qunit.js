/*global QUnit*/

QUnit.config.autostart = false;
sap.ui.require([
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/ui/fl/changeHandler/XmlTreeModifier',
	'sap/ui/fl/Utils'
],
function(
	BaseTreeModifier,
	JsControlTreeModifier,
	XmlTreeModifier,
	Utils
) {

	"use strict";
	QUnit.start();

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	QUnit.module("While handling xml views the BaseTreeModifier", {
		beforeEach: function () {

			var oMockedLrepResponse = {
				changes: [],
				contexts: [],
				settings: []
			};

			sap.ui.fl.Cache._entries["testComponent.Component"] = {
				file: oMockedLrepResponse,
				promise: Promise.resolve(oMockedLrepResponse)
			};

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

			this.oDOMParser = new DOMParser();
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:form="sap.ui.layout.form">' +
				'<form:SimpleForm id="testComponent---myView--myForm">' +
				'<Title id="testComponent---myView--myGroup" />' +
				'<Input id="testComponent---myView--myGroupElement" />' +
				'</form:SimpleForm>' +
				'</mvc:View>';
			this.oXmlView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			return this.oXmlView;
		},

		afterEach: function () {
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

		QUnit.test("can determine a targeted control for legacy changes with a global ID containing a flp prefix", function (assert) {
			var oSelector = {
				id: "application-LeaveRequest-create-component---myView--myGroupElement"
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
	});

	QUnit.module("While handling js views the BaseTreeModifier", {
		beforeEach: function () {

			var oMockedLrepResponse = {
				changes: [],
				contexts: [],
				settings: []
			};

			sap.ui.fl.Cache._entries["testComponent.Component"] = {
				file: oMockedLrepResponse,
				promise: Promise.resolve(oMockedLrepResponse)
			};

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

			this.oJsView = this.oComponent.byId("myView");
			return this.oJsView;
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

			var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);
			assert.ok(oControl);
		});

		QUnit.test("can determine a targeted control for legacy changes with a global ID containing a flp prefix", function (assert) {
			var oSelector = {
				id: "application-LeaveRequest-create-component---myView--myGroupElement"
			};

			var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);

			assert.ok(oControl);
		});

		QUnit.test("can determine a targeted control for changes with local IDs", function (assert) {
			var oSelector = {
				id: "myView--myGroupElement",
				idIsLocal: true
			};

			var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);
			assert.ok(oControl);
		});
	});

	QUnit.module("Given a BaseTreeModifier...", {
	}, function() {
		QUnit.test("when checkAndPrefixIdsInFragment is called with various fragments", function(assert) {
			var oXML1 = jQuery.sap.parseXML(
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

			var oXML2 = jQuery.sap.parseXML(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input />' +
					'<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML3 = jQuery.sap.parseXML(
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

			var oXML4 = jQuery.sap.parseXML(
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Label id="label123" text="These controls are within one multi-root Fragment:" />' +
					'<Input id="input123" />' +
					'<Button id="button123" text="Still in the same Fragment" />' +
					'<HBox xmlns="sap.m" id="hbox6">' +
						'<Button id="button456" text="Hello World" press="onButtonPress"></Button>' +
					'</HBox>' +
				'</core:FragmentDefinition>'
			);

			var oXML5 = jQuery.sap.parseXML(
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

			assert.throws(function() {
				BaseTreeModifier.checkAndPrefixIdsInFragment(oXML1, "foo");
			}, new Error("At least one control does not have a stable ID"), "missing stable ID error cought");

			assert.throws(function() {
				BaseTreeModifier.checkAndPrefixIdsInFragment(oXML2, "foo");
			}, new Error("At least one control does not have a stable ID"), "missing stable ID error cought");

			var sResult3 = BaseTreeModifier.checkAndPrefixIdsInFragment(oXML3, "foo");
			var aChildren = Utils.getElementNodeChildren(sResult3);
			aChildren.push(Utils.getElementNodeChildren(Utils.getElementNodeChildren(aChildren[3])[0])[0]);
			checkIdsOfAllChildren(aChildren, assert);

			var sResult4 = BaseTreeModifier.checkAndPrefixIdsInFragment(oXML4, "foo");
			aChildren = Utils.getElementNodeChildren(sResult4);
			aChildren.push(Utils.getElementNodeChildren(aChildren[3])[0]);
			checkIdsOfAllChildren(aChildren, assert);

			var sResult5 = BaseTreeModifier.checkAndPrefixIdsInFragment(oXML5, "foo");
			// get all controls which should be prefixed
			aChildren = Utils.getElementNodeChildren(sResult5);
			var oObjectPageLayout = aChildren[0];

			// headerTitle
			aChildren.push(Utils.getElementNodeChildren(Utils.getElementNodeChildren(aChildren[0])[0])[0]);

			// headerContent
			var oVerticalLayout = Utils.getElementNodeChildren(Utils.getElementNodeChildren(aChildren[0])[1])[0];
			aChildren.push(oVerticalLayout);
			var oFlexBox = Utils.getElementNodeChildren(oVerticalLayout)[0];
			aChildren.push(oFlexBox);
			oVerticalLayout = Utils.getElementNodeChildren(Utils.getElementNodeChildren(oFlexBox)[0])[0];
			aChildren.push(oVerticalLayout);
			aChildren.push(Utils.getElementNodeChildren(Utils.getElementNodeChildren(oVerticalLayout)[0])[0]);
			aChildren.push(Utils.getElementNodeChildren(oVerticalLayout)[1]);
			aChildren.push(Utils.getElementNodeChildren(oVerticalLayout)[2]);
			aChildren.push(Utils.getElementNodeChildren(oVerticalLayout)[3]);

			// sections
			var oSectionsAgg = Utils.getElementNodeChildren(oObjectPageLayout)[2];
			var oSection1 = Utils.getElementNodeChildren(oSectionsAgg)[0];
			aChildren.push(oSection1);
			var oSubSection1 = Utils.getElementNodeChildren(Utils.getElementNodeChildren(oSection1)[0])[0];
			aChildren.push(oSubSection1);
			var oHBox1 = Utils.getElementNodeChildren(Utils.getElementNodeChildren(oSubSection1)[0])[0];
			aChildren.push(oHBox1);
			aChildren.push(Utils.getElementNodeChildren(Utils.getElementNodeChildren(oHBox1)[0])[0]);

			var oSection2 = Utils.getElementNodeChildren(oSectionsAgg)[1];
			aChildren.push(oSection2);
			var oSubSection2 = Utils.getElementNodeChildren(Utils.getElementNodeChildren(oSection2)[0])[0];
			aChildren.push(oSubSection2);
			var oHBox2 = Utils.getElementNodeChildren(Utils.getElementNodeChildren(oSubSection2)[0])[0];
			aChildren.push(oHBox2);
			aChildren.push(Utils.getElementNodeChildren(Utils.getElementNodeChildren(oHBox2)[0])[0]);

			checkIdsOfAllChildren(aChildren, assert);
		});
	});
});
