sap.ui.define([
	'sap/ui/core/Control'
], function(Control) {

	"use strict";
	/*global QUnit*/
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
			//adding a dom ref for a property dynamically or finding it if a selector is not sufficient
			if (oDomRef) {
				if (sSettingsName === "propDynamic") {
					var oSpan = document.createElement("span");
					oSpan.setAttribute("testvalue", "propDynamic");
					oDomRef.appendChild(oSpan);
					return oSpan;
				}
				//adding a dom ref for an aggregation dynamically or finding it if a selector is not sufficient
				if (sSettingsName === "multipleDynamic") {
					var oSpan = document.createElement("span");
					oSpan.setAttribute("testvalue", "multipleDynamic");
					oDomRef.appendChild(oSpan);
					return oSpan;
				}

			}
			return Control.prototype.getDomRefForSetting.apply(this, arguments);
		},
		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.addClass("propDirectClass");
			oRm.addClass("aggDirectClass");
			//property selector with direct class
			oRm.writeAttributeEscaped("testvalueProp", oControl.getMetadata().getProperty("propIdDirectClass").selector);
			//aggregation selector with direct class
			oRm.writeAttributeEscaped("testvalueAgg", oControl.getMetadata().getAggregation("multipleIdDirectClass").selector);
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			//property with id suffix
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-suffix");
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getProperty("propIdSuffix").selector);
			oRm.write("></span>");

			//property with class
			oRm.write("<span");
			oRm.addClass("propClass");
			oRm.writeClasses();
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getProperty("propIdClass").selector);
			oRm.write("></span>");

			//property with attribute
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-propAttribute");
			oRm.writeClasses();
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getProperty("propIdAttribute").selector);
			oRm.write("></span>");

			//aggregation with id suffix
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-aggSuffix");
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getAggregation("multipleIdSuffix").selector);
			oRm.write("></span>");

			//aggregation with class
			oRm.write("<span");
			oRm.addClass("aggClass");
			oRm.writeClasses();
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getAggregation("multipleIdClass").selector);
			oRm.write("></span>");

			//aggregation with attribute
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-aggAttribute");
			//testvalue to check that the rigth dom node was found
			oRm.writeAttributeEscaped("testvalue", oControl.getMetadata().getAggregation("multipleIdAttribute").selector);
			oRm.write("></span>");
			oRm.write("</div>");
		}
	})
	QUnit.module("Element - Member.selector metadata", {
		beforeEach: function() {
			this.element = new SelectorControl("testId:that:_needs-escaping");
			this.element.placeAt("content");
			this.element.rerender();
			sap.ui.getCore().applyChanges();
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