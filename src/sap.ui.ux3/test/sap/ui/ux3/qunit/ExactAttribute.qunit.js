/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/ExactAttribute",
	"sap/ui/ux3/library"
], function(createAndAppendDiv, ExactAttribute, ux3Library) {
	"use strict";

	// shortcut for sap.ui.ux3.ExactOrder
	var ExactOrder = ux3Library.ExactOrder;

	// prepare DOM
	createAndAppendDiv("uiArea1");



	QUnit.module("sap.ui.ux3.ExactAttribute");

	QUnit.test("API - Attribute Default Values", function(assert) {
		var oAtt = new ExactAttribute();
		assert.equal(oAtt.getText(), "", "Default 'text':");
		assert.equal(oAtt.getSelected(), false, "Default 'selected':");
		assert.equal(oAtt.getShowSubAttributesIndicator(), true, "Default 'showSubAttributesIndicator':");
		assert.equal(oAtt.getAdditionalData(), null, "Default 'additionalData':");
		assert.equal(oAtt.getTooltip(), null, "Default 'tooltip':");
		assert.equal(oAtt.getSupplyActive(), true, "Default 'supplyActive':");
		assert.equal(oAtt.getAutoActivateSupply(), false, "Default 'autoActivateSupply':");
		assert.equal(oAtt.getWidth(), 168, "Default 'width':");
		assert.equal(oAtt.getListOrder(), ExactOrder.Select, "Default 'listOrder':");
	 });

	QUnit.test("API - Attribute Custom Values", function(assert) {
		var oAtt = new ExactAttribute(
				{text: "Hallo", selected: true, showSubAttributesIndicator: false, additionalData: {text: "Hallo"},
				tooltip: "Hallo", supplyActive: false, autoActivateSupply: true, width: 200, listOrder: ExactOrder.Fixed});
		assert.equal(oAtt.getText(), "Hallo", "Custom 'text':");
		assert.equal(oAtt.getSelected(), true, "Custom 'selected':");
		assert.equal(oAtt.getShowSubAttributesIndicator(), false, "Custom 'showSubAttributesIndicator':");
		assert.equal(oAtt.getAdditionalData().text, "Hallo", "Custom 'additionalData':");
		assert.equal(oAtt.getTooltip(), "Hallo", "Custom 'tooltip':");
		assert.equal(oAtt.getSupplyActive(), false, "Custom 'supplyActive':");
		assert.equal(oAtt.getAutoActivateSupply(), true, "Custom 'autoActivateSupply':");
		assert.equal(oAtt.getWidth(), 200, "Custom 'width':");
		assert.equal(oAtt.getListOrder(), ExactOrder.Fixed, "Custom 'listOrder':");

		oAtt.setWidth(ExactAttribute._MINWIDTH - 10);
		assert.equal(oAtt.getWidth(), ExactAttribute._MINWIDTH, "Custom 'width' (check Min):");
		oAtt.setWidth(ExactAttribute._MAXWIDTH + 10);
		assert.equal(oAtt.getWidth(), ExactAttribute._MAXWIDTH, "Custom 'width' (check Max):");
	 });

	QUnit.test("API - Aggregation 'attributes'", function(assert) {
		var oAtt = new ExactAttribute();
		assert.equal(oAtt.getAttributes().length, 0, "Initial number of sub attributes");
		oAtt.addAttribute(new ExactAttribute("aggtest1"));
		assert.equal(oAtt.getAttributes().length, 1, "Number of sub attributes after add");
		oAtt.insertAttribute(new ExactAttribute("aggtest2"), 0);
		assert.equal(oAtt.getAttributes().length, 2, "Number of sub attributes after insert");
		assert.equal(oAtt.getAttributes()[0].getId(), "aggtest2", "First Attribute");
		assert.equal(oAtt.getAttributes()[1].getId(), "aggtest1", "Second Attribute");
		oAtt.removeAttribute(0);
		assert.equal(oAtt.getAttributes().length, 1, "Number of sub attributes after remove");
		assert.equal(oAtt.getAttributes()[0].getId(), "aggtest1", "First Attribute");
		oAtt.removeAllAttributes();
		assert.equal(oAtt.getAttributes().length, 0, "Number of sub attributes after removeAll");
	});

	QUnit.test("API - Function 'getShowSubAttributesIndicator_Computed'", function(assert) {
		var fDummyHandler = function(){};
		var aTestAttributes = [];

		var getExpected = function(bHasSubAtts, bSupplyActive, bHasHandler, bShowSubAttributesIndicator){
			if (bSupplyActive && bHasHandler) {return bShowSubAttributesIndicator;}
			return bHasSubAtts;
		};

		var i,j,k;

		for (i = 0; i < 2; i++){ //attributes.length
			for (j = 0; j < 2; j++){ //supplyActive
				for (k = 0; k < 2; k++){ //handler
					var oAtt = new ExactAttribute({showSubAttributesIndicator : true});
					if (i == 1) {oAtt.addAttribute(new ExactAttribute());}
					oAtt.setSupplyActive(j == 0);
					if (k == 1) {oAtt.attachSupplyAttributes(fDummyHandler);}
					aTestAttributes.push({
						attr : oAtt,
						text : "attributes.length == " + (i == 1 ? "1" : "0") + " && supplyActive == " + (j == 0) + " && " +
							   (k == 1 ? "" : "!") + "handler -> " + (k == 1 && j == 0 ? "showSubAttributesIndicator" : "computed"),
						expected : getExpected(i == 1, j == 0, k == 1, true)
					});
				}
			}
		}

		for (i = 0; i < aTestAttributes.length; i++){
			assert.equal(aTestAttributes[i].attr.getShowSubAttributesIndicator_Computed(), aTestAttributes[i].expected, aTestAttributes[i].text);
		}
	});

	QUnit.test("API - Supply function mechanism", function(assert) {
		var bSupplyFunctionCallExpected = false;
		var oAtt;
		var fSupply = function(oEvent){
			var oAttribute = oEvent.getParameter("attribute");
			if (bSupplyFunctionCallExpected){
				assert.ok(oAtt.getSupplyActive(), "supplyActive must be set to true");
				assert.equal(oAtt.getId(), oAttribute.getId(), "Parameter attribute of supply event is correct.");
			} else {
				assert.ok(false, "Supply function must not be called");
			}
		};

		var fCheckSupply = function(fCallback){
			bSupplyFunctionCallExpected = true;
			fCallback();
			assert.ok(!oAtt.getSupplyActive(), "supplyActive must be set to false");
			bSupplyFunctionCallExpected = false;
			oAtt.getAttributes(); //No supply function should be called
		};

		assert.ok(1, "--- SUPPLY DISABLED ---");
		//There should be no further checks be visible in the result
		oAtt = new ExactAttribute({supplyActive: false});
		oAtt.attachSupplyAttributes(fSupply);
		oAtt.setSelected(true);

		assert.ok(1, "--- SUPPLY ON GETATTRIBUTES ---");
		oAtt = new ExactAttribute({selected: false});
		oAtt.attachSupplyAttributes(fSupply);
		fCheckSupply(function(){ oAtt.getAttributes(); });

		assert.ok(1, "--- SUPPLY ON ATTACH ---");
		oAtt = new ExactAttribute({selected: true});
		fCheckSupply(function(){ oAtt.attachSupplyAttributes(fSupply); });

		assert.ok(1, "--- SUPPLY ON SELECT ---");
		oAtt = new ExactAttribute({selected: false});
		oAtt.attachSupplyAttributes(fSupply);
		fCheckSupply(function(){ oAtt.setSelected(true); });

		assert.ok(1, "--- NO AUTO SUPPLY ---");
		oAtt = new ExactAttribute({selected: false});
		oAtt.attachSupplyAttributes(fSupply);
		fCheckSupply(function(){ oAtt.setSelected(true); });
		oAtt.setSelected(false);
		oAtt.setSelected(true);

		assert.ok(1, "--- AUTO SUPPLY ---");
		oAtt = new ExactAttribute({selected: false, autoActivateSupply: true});
		oAtt.attachSupplyAttributes(fSupply);
		fCheckSupply(function(){ oAtt.setSelected(true); });
		oAtt.setSelected(false);
		fCheckSupply(function(){ oAtt.setSelected(true); });
	});

	QUnit.test("Internal - ChangeListener", function(assert) {
		var fCurrentTestFunction;
		var oTestChangeListener = {id : "myListener", _bActive: true, _notifyOnChange: function(sType, oAttribute){
			fCurrentTestFunction(oTestChangeListener, sType, oAttribute);
		}};
		var oAtt = new ExactAttribute("att1");
		var oSubAtt = new ExactAttribute("att1_1");
		oAtt.addAttribute(oSubAtt);

		var sExpectedType = "";
		var fDefaultTestFunction = function(oTestChangeListener, sType, oAttribute){
			assert.equal(sType, sExpectedType, "Expected change type");
			assert.equal(oAttribute.getId(), oAtt.getId(), "Expected changed attribute");
		};
		fCurrentTestFunction = fDefaultTestFunction;
		var fFailTestFunction = function(oTestChangeListener, sType, oAttribute){
			assert.ok(false, "Change listener must not be called");
		};

		assert.ok(1, "--- INIT ---");
		assert.ok(!oAtt.getChangeListener(), "Initially no change listener is used");
		assert.ok(!oSubAtt.getChangeListener(), "Initially no change listener is used (Sub-Attribute)");

		oAtt.setChangeListener(oTestChangeListener);

		assert.ok(oTestChangeListener === oAtt.getChangeListener(), "Change listener is used");
		assert.ok(!oSubAtt.getChangeListener(), "Sub attribute still uses no change listener");

		//Check attribute changes
		assert.ok(1, "--- ATTRIBUTES ---");
		sExpectedType = "text";
		oAtt.setText("X");
		sExpectedType = "tooltip";
		oAtt.setTooltip("X");
		sExpectedType = "selected";
		oAtt.setSelected(false);

		fCurrentTestFunction = fFailTestFunction;

		oAtt.setShowSubAttributesIndicator(true);
		oAtt.setAdditionalData({});
		oAtt.setSupplyActive(true);
		oAtt.setAutoActivateSupply(true);

		//Check aggregation changes
		assert.ok(1, "--- ADD/INSERT ---");
		sExpectedType = "attributes";
		fCurrentTestFunction = fDefaultTestFunction;

		oAtt.addAttribute(new ExactAttribute("att1_2"));
		oAtt.insertAttribute(new ExactAttribute("att1_3"), 1);

		assert.ok(1, "--- REMOVE ---");
		fCurrentTestFunction = fDefaultTestFunction;
		sExpectedType = "attributes";
		oAtt.removeAttribute(2);
		oAtt.removeAttribute(1);
		oAtt.removeAllAttributes();

		assert.ok(1, "--- GETATTRIBUTES ---");
		fCurrentTestFunction = fFailTestFunction;
		oAtt.getAttributes();

		oAtt.setSupplyActive(true);
		oAtt.attachSupplyAttributes(function(){
			sExpectedType = "attributes";
			fCurrentTestFunction = function(oTestChangeListener, sType, oAttribute){
				assert.ok(!oTestChangeListener._bActive, "Change listener is not active");
				assert.equal(sType, sExpectedType, "Expected change type");
				assert.equal(oAttribute.getId(), oAtt.getId(), "Expected changed attribute");
			};
			oAtt.addAttribute(new ExactAttribute("att1_4"));
			assert.ok(!oAtt.getAttributes()[0].getChangeListener(), "Sub attribute uses no change listener");
			fCurrentTestFunction = fDefaultTestFunction;
		});
		oAtt.getAttributes();

		//Bubbling
		assert.ok(1, "--- BUBBLING ---");
		oSubAtt = oAtt.getAttributes()[0];
		fCurrentTestFunction = function(oTestChangeListener, sType, oAttribute){
			assert.equal(sType, sExpectedType, "Expected change type");
			assert.equal(oAttribute.getId(), oSubAtt.getId(), "Expected changed attribute");
		};
		sExpectedType = "text";
		assert.ok(!oSubAtt.getChangeListener(), "Sub attribute still uses no change listener");
		oSubAtt.setText("X");

		//Check exit
		assert.ok(1, "--- EXIT ---");
		oAtt.setChangeListener();
		assert.ok(!oAtt.getChangeListener(), "No change listener is used");
		assert.ok(!oSubAtt.getChangeListener(), "Sub attribute uses also no change listener");
	});
});