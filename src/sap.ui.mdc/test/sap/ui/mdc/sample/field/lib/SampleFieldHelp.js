/*
 * ! ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * @version@
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/mdc/field/FieldHelpBase',
	'sap/ui/mdc/condition/Condition',
	'sap/m/VBox',
	'sap/m/Button'
], function(
		jQuery,
		FieldHelpBase,
		Condition,
		VBox,
		Button
		) {
	"use strict";

	var SampleFieldHelp = FieldHelpBase.extend("sap.ui.mdc.sample.field.lib.SampleFieldHelp", { // call the new Control type "my.SampleFieldHelp" and let it inherit from sap.ui.mdc.field.FieldHelpBase

		// the control API:
		metadata : {
			aggregations : {
				items : {type : "sap.ui.core.Item", multiple : true, singularName : "item"}
			},
			defaultAggregation: "items"
		},

		init: function(){
			FieldHelpBase.prototype.init.apply(this, arguments);
			this._oVBox = new VBox(this.getId() + "-VBox");
		},
		_createPopover: function() {
			var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

			if (oPopover) { // empty if loaded async
				this._setContent(this._oVBox);
			}

			return oPopover;
		},
		addItem: function(oItem){
			this.addAggregation("items", oItem);

			var oButton = new Button(oItem.getId() + "-button", {
				text: oItem.getText(),
				press: this._handleButtonPress.bind(this)
			});
			this._oVBox.addItem(oButton);

			return this;
		},
		insertItem: function(oItem, iIndex){
			this.insertAggregation("items", oItem, iIndex);

			var oButton = new Button(oItem.getId() + "-button", {
				text: oItem.getText(),
				press: this._handleButtonPress.bind(this)
			});
			this._oVBox.insertItem(oButton, iIndex);

			return this;
		},
		removeItem: function(oItem){
			var oRemovedItem = this.removeAggregation("items", oItem);

			if (oRemovedItem) {
				this._oVBox.removeItem(oRemovedItem.getId() + "-button");
			}

			return oRemovedItem;
		},
		removeAllItems: function(){
			var aRemovedItems = this.removeAllAggregation("items");

			this._oVBox.removeAllItems();

			return aRemovedItems;
		},
		destroyItems: function(){
			this.destroyAggregation("items");

			this._oVBox.destroyItems();

			return this;
		},
		_handleButtonPress: function(oEvent){
			var oButton = oEvent.oSource;
			var iIndex = this._oVBox.indexOfItem(oButton);
			var aItems = this.getItems();
			var oItem = aItems[iIndex];
			this.close();
			this.fireSelect({conditions: [Condition.createCondition("EQ", [oItem.getText()])]});
		}

	});

	return SampleFieldHelp;

});