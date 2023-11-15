/*global QUnit */
sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/core/Control'
], function(createAndAppendDiv, nextUIUpdate, Control) {
	"use strict";

	createAndAppendDiv("content");

	var SelectorControl = Control.extend("selectorTestControl", {
		metadata: {
			properties: {
				propIdOnly: {
					type: "string",
					selector: "#{id}"
				},
				propIdSuffix: {
					type: "string",
					selector: "#{id}-suffix"
				},
				propIdClass: {
					type: "string",
					selector: "#{id} .propClass"
				},
				propIdAttribute: {
					type: "string",
					selector: "#{id} [id='{id}-propAttribute']"
				},
				propIdDirectClass: {
					type: "string",
					selector: "#{id}.propDirectClass"
				},
				propDynamic: {
					type: "string",
					selector: "#{id}"
				}
			},
			aggregations: {
				multipleIdSuffix: {
					type: "sap.ui.core.Control",
					multiple: true,
					selector: "#{id}-aggSuffix"
				},
				multipleIdClass: {
					type: "sap.ui.core.Control",
					multiple: true,
					selector: "#{id} .aggClass"
				},
				multipleIdAttribute: {
					type: "sap.ui.core.Control",
					multiple: true,
					selector: "#{id} [id='{id}-aggAttribute']"
				},
				multipleIdDirectClass: {
					type: "sap.ui.core.Control",
					multiple: true,
					selector: "#{id}.aggDirectClass"
				},
				multipleDynamic: {
					type: "sap.ui.core.Control",
					multiple: true,
					selector: "#{id}"
				}
			}
		},
		getDomRefForSetting: function(sSettingsName) {
			var oDomRef = this.getDomRef();
			//adding a DOM ref for a property dynamically or finding it if a selector is not sufficient
			if (oDomRef) {
				if (sSettingsName === "propDynamic") {
					var oSpan = document.createElement("span");
					oSpan.setAttribute("testvalue", "propDynamic");
					oDomRef.appendChild(oSpan);
					return oSpan;
				}
				//adding a DOM ref for an aggregation dynamically or finding it if a selector is not sufficient
				if (sSettingsName === "multipleDynamic") {
					var oSpan = document.createElement("span");
					oSpan.setAttribute("testvalue", "multipleDynamic");
					oDomRef.appendChild(oSpan);
					return oSpan;
				}

			}
			return Control.prototype.getDomRefForSetting.apply(this, arguments);
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("propDirectClass");
				oRm.class("aggDirectClass");
				//property selector with direct class
				oRm.attr("testvalueProp", oControl.getMetadata().getProperty("propIdDirectClass").selector);
				//aggregation selector with direct class
				oRm.attr("testvalueAgg", oControl.getMetadata().getAggregation("multipleIdDirectClass").selector);
				oRm.openEnd();

				//property with id suffix
				oRm.openStart("span", oControl.getId() + "-suffix");
				//testvalue to check that the right DOM node was found
				oRm.attr("testvalue", oControl.getMetadata().getProperty("propIdSuffix").selector);
				oRm.openEnd().close("span");

				//property with class
				oRm.openStart("span");
				oRm.class("propClass");
				//testvalue to check that the right DOM node was found
				oRm.attr("testvalue", oControl.getMetadata().getProperty("propIdClass").selector);
				oRm.openEnd().close("span");

				//property with attribute
				oRm.openStart("span", oControl.getId() + "-propAttribute");
				//testvalue to check that the right DOM node was found
				oRm.attr("testvalue", oControl.getMetadata().getProperty("propIdAttribute").selector);
				oRm.openEnd().close("span");

				//aggregation with id suffix
				oRm.openStart("span", oControl.getId() + "-aggSuffix");
				//testvalue to check that the right DOM node was found
				oRm.attr("testvalue", oControl.getMetadata().getAggregation("multipleIdSuffix").selector);
				oRm.openEnd().close("span");

				//aggregation with class
				oRm.openStart("span");
				oRm.class("aggClass");
				//testvalue to check that the right DOM node was found
				oRm.attr("testvalue", oControl.getMetadata().getAggregation("multipleIdClass").selector);
				oRm.openEnd().close("span");

				//aggregation with attribute
				oRm.openStart("span", oControl.getId() + "-aggAttribute");
				oRm.attr("testvalue", oControl.getMetadata().getAggregation("multipleIdAttribute").selector);
				//testvalue to check that the right DOMnode was found
				oRm.openEnd().close("span");
				oRm.close("div");
			}
		}
	});

	QUnit.module("Member.selector metadata", {
		beforeEach: function() {
			this.element = new SelectorControl("testId:that:_needs-escaping");
			this.element.placeAt("content");
			this.element.invalidate();
			return nextUIUpdate();
		},
		afterEach: function() {
			this.element.destroy();
		}
	});

	QUnit.test("Negative Test", function(assert) {
		assert.strictEqual(this.element.getDomRefForSetting(""), null, "MemberDomRef for empty string === null");
		assert.strictEqual(this.element.getDomRefForSetting("doesNotExist"), null, "MemberDomRef for 'doesNotExist' === null");
	});

	QUnit.test("Existing Settings", function(assert) {
		assert.strictEqual(this.element.getDomRefForSetting("id"), null, "MemberDomRef for 'id' domref");
		assert.strictEqual(this.element.getDomRefForSetting("models"), null, "MemberDomRef for 'model' domref");
		assert.strictEqual(this.element.getDomRefForSetting("tooltip"), null, "MemberDomRef for 'tooltip' domref");
	});

	QUnit.test("Property Id Selector", function(assert) {
		assert.strictEqual(this.element.getDomRefForSetting("propIdOnly"), this.element.getDomRef(), "MemberDomRef for 'propIdOnly' domref");
	});

	QUnit.test("Property Id-suffix Selector", function(assert) {
		var sSettingsName = "propIdSuffix",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getProperty(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Property Id-class Selector", function(assert) {
		var sSettingsName = "propIdClass",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getProperty(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Property Id-attribute Selector", function(assert) {
		var sSettingsName = "propIdAttribute",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getProperty(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Property Id-directclass Selector", function(assert) {
		var sSettingsName = "propIdDirectClass",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getProperty(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalueProp"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Property dynamic Selector", function(assert) {
		var sSettingsName = "propDynamic",
			oDomRef = this.element.getDomRefForSetting(sSettingsName);
		assert.strictEqual(oDomRef.getAttribute("testvalue"), "propDynamic", "MemberDomRef for '" + sSettingsName + "' matched");
	});


	QUnit.test("Aggregation Id-suffix Selector", function(assert) {
		var sSettingsName = "multipleIdSuffix",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getAggregation(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Aggregation Id-class Selector", function(assert) {
		var sSettingsName = "multipleIdClass",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getAggregation(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Aggregation Id-attribute Selector", function(assert) {
		var sSettingsName = "multipleIdAttribute",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getAggregation(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalue"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Aggregation Id-directclass Selector", function(assert) {
		var sSettingsName = "multipleIdDirectClass",
			oDomRef = this.element.getDomRefForSetting(sSettingsName),
			sSelector = this.element.getMetadata().getAggregation(sSettingsName).selector;
		assert.strictEqual(oDomRef instanceof Element, true, "MemberDomRef for '" + sSettingsName + "' is Element");
		assert.strictEqual(oDomRef.getAttribute("testvalueAgg"), sSelector, "MemberDomRef for '" + sSettingsName + "' matched " + sSelector);
	});

	QUnit.test("Aggregation dynamic Selector", function(assert) {
		var sSettingsName = "multipleDynamic",
			oDomRef = this.element.getDomRefForSetting(sSettingsName);
		assert.strictEqual(oDomRef.getAttribute("testvalue"), "multipleDynamic", "MemberDomRef for '" + sSettingsName + "' matched");
	});

	QUnit.test("Control not in Dom", function(assert) {
		var oControlNotInDom = new SelectorControl();
		assert.strictEqual(oControlNotInDom.getDomRefForSetting("propIdOnly"), null, "MemberDomRef for a control that is not rendered is null");
		assert.strictEqual(oControlNotInDom.getDomRefForSetting("multipleDynamic"), null, "MemberDomRef for a control that is not rendered is null");
	});

});