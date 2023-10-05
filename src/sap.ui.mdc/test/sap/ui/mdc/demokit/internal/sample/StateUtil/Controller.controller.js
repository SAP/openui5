sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/m/Dialog",
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/Button",
	"sap/ui/core/Element"
], function(Controller, oCore, StateUtil, Dialog, CodeEditor, Button, Element) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.StateUtil.Controller", {

		onInit: function() {
			oCore.getMessageManager().registerObject(this.getView(), true);

			this.mState = {};

			Promise.all([
				StateUtil.retrieveExternalState(this.byId("mdcFilterBar")),
				StateUtil.retrieveExternalState(this.byId("mdcChart")),
				StateUtil.retrieveExternalState(this.byId("mdcTable"))
			]).then(function(aState){
				this.mState["mdcFilterBar"] = aState[0];
				this.mState["mdcChart"] = aState[1];
				this.mState["mdcTable"] = aState[2];
			}.bind(this));
		},

		changeFBItems: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oFilterBar = this.byId("mdcFilterBar");

			const oState = {
				items: [
					{name: "language_code", visible: bAdd}
				]
			};

			StateUtil.applyExternalState(oFilterBar, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		showFBDiff: function() {
			const oFilterBar = this.byId("mdcFilterBar");
			this.showDiff(oFilterBar, this.mState["mdcFilterBar"]);
		},

		showTableDiff: function() {
			const oTable = this.byId("mdcTable");
			this.showDiff(oTable, this.mState["mdcTable"]);
		},

		showChartDiff: function() {
			const oChart = this.byId("mdcChart");
			this.showDiff(oChart, this.mState["mdcChart"]);
		},

		showDiff: function(oControl, oStandardVariantState) {

			StateUtil.retrieveExternalState(oControl)
			.then(function(oNewState){
				return oNewState;
			})
			.then(function(oNewState){
				return StateUtil.diffState(oControl, oStandardVariantState, oNewState);
			})
			.then(function(oStateDiff){
				this._openEditor(oControl, oStateDiff);
			}.bind(this));

		},

		changeFBValues: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oFilterBar = this.byId("mdcFilterBar");

			const oState = {
				filter: {
					title: bAdd ? [
						{
							operator: "Contains",
							values: ["SomeValue"]
						}
					] : []
				}
			};

			StateUtil.applyExternalState(oFilterBar, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeChartItems: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oChart = this.byId("mdcChart");

			const oState = {
				items: [
					{name: "title", visible: bAdd}
				]
			};

			StateUtil.applyExternalState(oChart, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeChartSorting: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oChart = this.byId("mdcChart");

			const oState = {
				sorters: [
					{name: "language_code", descending: true, sorted: bAdd}
				]
			};

			StateUtil.applyExternalState(oChart, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeChartRole: function(oEvt) {

			const oChart = this.byId("mdcChart");

			const oState = {
				items: [
					{name: "language_code", role: "series"}
				]
			};

			StateUtil.applyExternalState(oChart, oState);

		},

		changeTableColumns: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oChart = this.byId("mdcTable");

			const oState = {
				items: [
					{name: "language_code", visible: bAdd}
				]
			};

			StateUtil.applyExternalState(oChart, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeTableSorting: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oTable = this.byId("mdcTable");

			const oState = {
				sorters: [
					{name: "title", descending: true, sorted: bAdd}
				]
			};

			StateUtil.applyExternalState(oTable, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeTableFiltering: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oTable = this.byId("mdcTable");

			const oState = {
				filter: {
					title: bAdd ? [
						{
							operator: "Contains",
							values: ["Pride"]
						}
					] : []
				}
			};

			StateUtil.applyExternalState(oTable, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeTableGrouping: function(oEvt) {

			const oButton = oEvt.getSource();
			const bAdd = oButton.getType() === "Success";

			const oTable = this.byId("mdcTable");

			const oState = {
				groupLevels: [
					{name: "language_code", grouped: bAdd}
				]
			};

			StateUtil.applyExternalState(oTable, oState);
			oButton.setType(bAdd ? "Negative" : "Success");

		},

		changeColumnWidth: function(oEvt) {

			const oTable = this.byId("mdcTable");

			const oState = {
				supplementaryConfig: {
					aggregations: {
						columns: {
							title: {
								width: Math.random() * 250 + "px"
							}
						}
					}
				}
			};

			StateUtil.applyExternalState(oTable, oState);

		},

		retrieveFilterBarState: function(oEvt) {
			this.retrieveState(this.byId("mdcFilterBar"));
		},
		retrieveChartState: function(oEvt) {
			this.retrieveState(this.byId("mdcChart"));
		},
		retrieveTableState: function(oEvt) {
			this.retrieveState(this.byId("mdcTable"));
		},

		retrieveState: function (oControl) {

			//use StateUtil#retrieveExternalState to check the current control state
			StateUtil.retrieveExternalState(oControl)
			.then(function(oState){
				this._openEditor(oControl, oState);
			}.bind(this));

		},

		applyState: function (oControl, oState) {
			//use StateUtil#applyExternalState to apply new state on a control instance
			StateUtil.applyExternalState(oControl, oState);
		},

		_openEditor: function (oControl, oState) {

			const oDialog = new Dialog({
				contentHeight: "30rem",
				contentWidth: "25rem",
				title: "Modify State",
				content: [
					new CodeEditor("stateEditor", {
						width:"100%",
						height: "30rem",
						type:"jsoniq",
						lineNumbers: false
					})
				],
				buttons: [
					new Button({
						text: "Confirm",
						press: function() {
							this.applyState(oControl, JSON.parse(Element.registry.get("stateEditor").getValue()));
							oDialog.close();
							oDialog.destroy();
						}.bind(this)
					}),
					new Button({
						text: "Cancel",
						press: function() {
							oDialog.close();
							oDialog.destroy();
						}
					})
				]
			});

			Element.registry.get("stateEditor").setValue(JSON.stringify(oState, null, "  "));

			oDialog.open();
		}

	});
});
