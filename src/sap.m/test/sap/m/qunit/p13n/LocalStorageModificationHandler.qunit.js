/* global QUnit */
sap.ui.define([
	"sap/m/p13n/modification/LocalStorageModificationHandler",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/MetadataHelper"
], function (LocalStorageModificationHandler, Table, Column, Engine, SelectionController, MetadataHelper) {
	"use strict";

	QUnit.module("FlexModificationHandler API tests", {
		before: function(){
			this.oControl = new Table({
				columns: [
					new Column("myCol")
				]
			});
			this.oHandler = new LocalStorageModificationHandler();
			Engine.register(this.oControl, {
				modification: this.oHandler,
				helper: new MetadataHelper(),
				controller: {
					Selection: new SelectionController({
						targetAggregation: "columns",
						control: this.oControl
					})
				}
			});
		},
		after: function(){
			this.oControl.destroy();
			this.oControl = null;
			this.oHandler.destroy();
			this.oHandler = null;
		}
	});

	QUnit.test("instantiate LocalStorageModificationHandler", function(assert){
		assert.ok(this.oHandler.isA("sap.m.p13n.modification.LocalStorageModificationHandler"), "Singleton instance of a explicit local modification handler");
	});

	QUnit.test("Check LocalStorageModificationHandler processChanges", function(assert){

		var done = assert.async();
        var aChanges = [{
            selectorElement: this.oControl,
            changeSpecificData : {
                content: {
                    key: "testSort",
                    descending: true
                },
                changeType: "addSort"
            }
        }];

		//method call
		this.oHandler.processChanges(aChanges).then(function(){
            var oSavedState = JSON.parse(localStorage.getItem("$p13n.Engine.data--" + this.oControl.getId()));
            assert.deepEqual(oSavedState, {
				Selection: [
					{key: "myCol"}
				]
			});
			done();
        }.bind(this));

	});

});
