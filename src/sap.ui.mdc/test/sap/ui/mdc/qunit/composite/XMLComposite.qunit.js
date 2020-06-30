/*!
 * ${copyright}
 */
setBlanketFilters("sap/ui/mdc/XMLComposite.js");

/**
 * setBlanketFilters
 * @param {string} sFilters comma separated strings to filter the paths for blanket
 */
function setBlanketFilters(sFilters) {
	"use strict";
	if (top === window) { //only in local environment
		top["blanket.filter.only"] = sFilters;
	}
}

sap.ui.loader.config({
	paths: {
		"composites": location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/composites",
		"bundles": location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/bundles"
	}
});

/*global QUnit, sinon */
QUnit.config.autostart = false;
QUnit.config.reorder = false;

sap.ui.require([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/ui/mdc/XMLComposite",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"composites/RuntimeField",
	"composites/Table",
	"composites/LabelButtonTemplate",
	"composites/LabelButtonsTemplate",
	"composites/Column",
	"composites/Cell",
	"composites/MDCCell"
], function (ComponentContainer, XMLPreprocessor, XMLComposite, Controller, JSONModel, RuntimeField, CompositesTable) {
	/*eslint no-warning-comments: 0 */
	"use strict";


	function registerPlugin(oNode, oVisitor) {
		return oVisitor.visitAttributes(oNode).then(function () {
			return XMLComposite.initialTemplating(oNode, oVisitor, this);
		}.bind(this));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.XMLComposite: templating", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************
	sap.ui.define("composites/TestComponent", [
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		return Controller.extend("composites.TestComponent", {});
	});
	sap.ui.define("my/composite/Component", [
		"sap/ui/core/UIComponent"
	], function (UIComponent) {
		return UIComponent.extend("my.composite.Component", {
			metadata: {
				rootView: "composites.TestComponent"
			},
			createContent: function () {
				XMLPreprocessor.plugIn(function (oNode, oVisitor) {
					return XMLComposite.initialTemplating(oNode, oVisitor, "composites.LabelButtonTemplate");
				}, "composites", "LabelButtonTemplate");

				// For pre-templating we use here metadata model called "models.preprocessor". Via binding to
				// the property 'labelFirst' we can control if-condition in templating.
				return sap.ui.xmlview({
					async: true,
					viewContent: '<View height="100%" xmlns:m="sap.m" xmlns="sap.ui.core" xmlns:f="composites"> <m:VBox> <f:LabelButtonTemplate id="IDLabelButtonTemplate" label="{/label}" value="{/value}" labelFirst="{preprocessor>/labelFirst}"/></m:VBox></View>',
					preprocessors: {
						xml: {
							models: {
								preprocessor: new JSONModel({
									labelFirst: false,
									value: "preprocessor"
								})
							}
						}
					}
				});
			}
		});
	});
	sap.ui.define("my/aggregations/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
		return UIComponent.extend("my.aggregations.Component", {
			metadata: {
				rootView: "composites.TestComponent"
			},
			constructor: function(sId, mSettings) {
				this.oController = mSettings ? mSettings.controller : null;
				UIComponent.prototype.constructor.apply(this,arguments);
			},
			createContent: function () {
				XMLPreprocessor.plugIn(registerPlugin.bind("composites.Table"), "composites", "Table");
				XMLPreprocessor.plugIn(registerPlugin.bind("composites.Cell"), "composites", "Cell");
				var oConfig = {}, oController = this.oController;

				return sap.ui.xmlview({
					viewContent: document.getElementById('view').textContent,
					id: "comp",
					async: true,
					controller: oController,
					preprocessors: { xml: oConfig }
				});
			}
		});
	});
	sap.ui.define("my/clone/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
		return UIComponent.extend("my.clone.Component", {
			metadata: {
				rootView: "composites.TestComponent"
			},
			constructor: function(sId, mSettings) {
				this.oController = mSettings ? mSettings.controller : null;
				UIComponent.prototype.constructor.apply(this,arguments);
			},
			createContent: function () {
				XMLPreprocessor.plugIn(registerPlugin.bind("composites.Cell"), "composites", "Cell");
				XMLPreprocessor.plugIn(registerPlugin.bind("composites.MDCCell"), "composites", "MDCCell");

				return sap.ui.xmlview({
					viewContent: document.getElementById('clone').textContent,
					id: "comp",
					async: true,
					preprocessors: {
						xml: {
							models: {
								prep: new JSONModel({
									columns: [
										{
											asLink: true,
											editable:false
										}, {
											asLink: false,
											editable:true
										}
									]
								})
							}
						}
					}
				});
			}
		});
	});
	QUnit.test("property", function (assert) {
		var fnInitialTemplatingSpy = sinon.spy(XMLComposite, "initialTemplating");
		var done = assert.async();

		sap.ui.require(["my/composite/Component"], function(MyCompositeComponent) {
			var oComponentContainer = new ComponentContainer({
				component: new MyCompositeComponent()
			}).placeAt("content");

			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oView = oComponentContainer.getComponentInstance().getRootControl();
				assert.ok(oView);

				oView.loaded().then(function() {
					assert.ok(fnInitialTemplatingSpy.calledOnce);

					var oXMLComposite = oView.byId("IDLabelButtonTemplate");

					var fnFragmentRetemplatingSpy = sinon.spy(oXMLComposite, "fragmentRetemplating");

					// Now we define another model in order to fill properties in the XMLComposite control
					oView.setModel(new JSONModel({
						label: "Click",
						value: "Me"
					}));

					assert.equal(fnFragmentRetemplatingSpy.called, false);
					// act: change the order to 'label' after 'button'
					oXMLComposite.setLabelFirst(false);

					setTimeout(function() {
						sap.ui.getCore().applyChanges();
						assert.ok(fnFragmentRetemplatingSpy.calledOnce);

						assert.equal(oView.$().find("div").find("span.sapMLabel" || "label.sapMLabel")[0].textContent, "Click");
						assert.equal(oView.$().find("div").find("button.sapMBtn")[0].textContent, "Me");

						assert.equal(oView.$().find(".IDLabelButtonTemplate").children().length, 2);
						assert.equal(oView.$().find(".IDLabelButtonTemplate").children()[0].firstChild.nodeName, "BUTTON");
						assert.ok(oView.$().find(".IDLabelButtonTemplate").children()[1].firstChild.nodeName, "LABEL" || "SPAN");
						// act: change the order to 'label' before 'button'
						oXMLComposite.setLabelFirst(true);

						setTimeout(function() {
							sap.ui.getCore().applyChanges();
							assert.equal(oView.$().find("div").find("span.sapMLabel" || "label.sapMLabel")[0].textContent, "Click");
							assert.equal(oView.$().find("div").find("button.sapMBtn")[0].textContent, "Me");

							assert.equal(oView.$().find(".IDLabelButtonTemplate").children().length, 2);
							assert.ok(oView.$().find(".IDLabelButtonTemplate").children()[0].firstChild.nodeName, "LABEL" || "SPAN");
							assert.equal(oView.$().find(".IDLabelButtonTemplate").children()[1].firstChild.nodeName, "BUTTON");

							oComponentContainer.destroy();
							done();
						}, 0);
					}, 0);
				});
			}, 0);
		});
	});

	sap.ui.define("composites/TestComponent2", [
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		return Controller.extend("composites.TestComponent2", {});
	});
	sap.ui.define("my/composite2/Component", [
		"sap/ui/core/UIComponent", 'composites/Helper'
	], function (UIComponent, Helper) {
		return UIComponent.extend("my.composite2.Component", {
			Helper: Helper,
			metadata: {
				rootView: "composites.TestComponent2"
			},
			createContent: function () {
				XMLPreprocessor.plugIn(function (oNode, oVisitor) {
					XMLComposite.initialTemplating(oNode, oVisitor, "composites.LabelButtonsTemplate");
				}, "composites", "LabelButtonsTemplate");

				return sap.ui.xmlview({
					async: false,
					viewContent: '<View height="100%" xmlns:m="sap.m" xmlns="sap.ui.core" xmlns:f="composites"><m:VBox><f:LabelButtonsTemplate id="IDLabelButtonsTemplate" items="{path:&quot;preprocessor>/items&quot;}"/></m:VBox></View>',
					preprocessors: {
						xml: {
							models: {
								preprocessor: new JSONModel({
									items: [
										{
											text: "first"
										}, {
											text: 'second'
										}
									]
								})
							}
						}
					}
				});
			}
		});
	});

	//we want to use metadataContexts so we should still dicuss here
	/*	QUnit.test("aggregation with pretemplating model only", function(assert) {
			var oComponentContainer = new ComponentContainer({
				component: new my.composite2.Component()
			}).placeAt("content");
			sap.ui.getCore().applyChanges();
			this.clock.tick(500);

			var oView = oComponentContainer.getComponentInstance().getRootControl();

			assert.ok(oView);
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children().length, 4);
			assert.ok(oView.$().find(".IDLabelButtonsTemplate").children()[0].firstChild.nodeName === "LABEL" || "SPAN");
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[1].firstChild.nodeName, "BUTTON");
			assert.ok(oView.$().find(".IDLabelButtonsTemplate").children()[2].firstChild.nodeName === "LABEL" || "SPAN");
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[3].firstChild.nodeName, "BUTTON");

			// ER: this 'act' should work in the future

			// // act: change the order to 'label' after 'button'
			// oView.byId("IDLabelButtonsTemplate").setLabelFirst(false);
			// this.clock.tick(500);
			//
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children().length, 4);
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[0].firstChild.nodeName, "BUTTON");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[1].firstChild.nodeName, "LABEL");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[2].firstChild.nodeName, "BUTTON");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[3].firstChild.nodeName, "LABEL");

			oComponentContainer.destroy();
		});
	*/

	QUnit.module("Runtime creation");

	QUnit.test("Creation at runtime - Composite w/o aggregations", function (assert) {
		var done = assert.async();

		var oRuntimeField = new RuntimeField({
			label: "Hello",
			value: "Managed Object Model" }
		);

		setTimeout(function() {
			assert.ok(oRuntimeField, "the runtime field is created");
			assert.equal(oRuntimeField.getEditable(),false,"the edit mode of the field is false");
			var sValue = oRuntimeField.getValue();
			var oInnerControl = oRuntimeField.byId("control");
			assert.ok(oInnerControl.isA("sap.m.Text"), "the inner control is a text");
			assert.equal(oInnerControl.getText(), sValue, "the inner text control has the value as text");

			var fnFragmentRetemplatingSpy = sinon.spy(oRuntimeField, "fragmentRetemplating");
			assert.equal(fnFragmentRetemplatingSpy.called, false);
			// act: change the order to 'label' after 'button'
			oRuntimeField.setEditable(true);

			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oRuntimeField.getEditable(),true,"the edit mode of the field is now true");
				assert.ok(fnFragmentRetemplatingSpy.calledOnce, "this yield to a retemplating of the fragment");
				oInnerControl = oRuntimeField.byId("control");
				assert.ok(oInnerControl.isA("sap.m.Input"), "the inner control is an input");
				assert.equal(oInnerControl.getValue(), sValue, "the inner input control has the value as value");
				done();
			}, 0);

		}, 0);
	});


	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.XMLComposite: template aggregations", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	//*********************************************************************************************
	QUnit.test("inner Aggregations", function (assert) {
		var done = assert.async();
		sap.ui.require(["my/aggregations/Component"], function(MyAggregationsComponent) {
			var oComponentContainer = new ComponentContainer({
				component: new MyAggregationsComponent("aggregations")
			}).placeAt("content");

			setTimeout(function(){
				var oView = oComponentContainer.getComponentInstance().getRootControl();

				oView.loaded().then(function() {
					var oTable = oView.byId("table");
					assert.ok(oTable, "The table is there");
					//multiple aggegations
					var aColumns = oTable.getColumns();
					assert.equal(aColumns.length,4,"The table has 4 columns");

					var oColumn = oTable.byId("OWN");
					assert.notOk(oColumn,"The user-defined column can not be be accessed bye the composite");
					oColumn = oTable.byId("template2");
					assert.ok(oColumn,"The templated column can be accessed");
					assert.equal(oColumn.getId(), "comp--table--template2","The corresponding Id is correct");

					//Use the Managed Object model
					var oTableModel = oTable._getManagedObjectModel();
					var oColumn2 = oTableModel.getProperty("/#template2");
					assert.ok(oColumn2,"The templated column can be accessed");
					assert.equal(oColumn2.getId(), "comp--table--template2","The corresponding Id is correct");
					assert.equal(oColumn, oColumn,"The column from byId and from the managed object model are equal");

					//single aggregations
					var oHeader = oTable.getHeader();//should be the templating header
					assert.equal(oHeader.getText(), "My header fragment", "The table gets the header from templating");

					var oFooter = oTable.getFooter();//should be the on defined footer in the view
					assert.equal(oFooter.getText(), "My own footer", "The table gets the header from templating");

					//unknown fragments are not processed robustness
					var oUnknown = oTable.byId("so_unknown");
					assert.notOk(oUnknown, "As unknown is no aggregation although there is a fragment this gets never processed");

					oComponentContainer.destroy();
					done();
				});
			}, 0);
		});
	});
	//*********************************************************************************************
	QUnit.test("event forwarding", function (assert) {
		var done = assert.async(), oAction;
		sap.ui.require(["my/aggregations/Component"], function(MyAggregationsComponent) {
			var ControllerClass = Controller.extend("test", {
				handler: function(oEvent) {
					oAction = oEvent.getSource();
					oAction.setText("controller");
				}
			});

			var oController = new ControllerClass();
			var fnControllerSpy = sinon.spy(oController, "handler");
			var fnCompositeSpy = sinon.spy(CompositesTable.prototype, "handler");

			var oComponentContainer = new ComponentContainer({
				component: new MyAggregationsComponent("events", {controller: oController})
			}).placeAt("content");

			setTimeout(function() {
				var oView = oComponentContainer.getComponentInstance().getRootControl();

				oView.loaded().then(function() {
					var oTable = oView.byId("table");
					assert.ok(oTable, "The table is there");
					var aActions = oTable.getActions();
					assert.equal(aActions.length,2,"The table has 2 actions");

					//press the outer action
					var oOuterAction = oTable.byId("button--outer");
					oOuterAction.firePress();
					assert.ok(oAction, "The action from outside fires the event");
					assert.equal(oAction.getId(), "comp--outer", "It is the correct action");
					assert.equal(oAction.getText(),"controller","The action from the view controller is called");
					assert.ok(fnControllerSpy.calledOnce,"The controller handles the event");
					assert.equal(fnCompositeSpy.callCount, 0, "The composite method is not called");

					var oInnerAction = oTable.byId("button--table--inner");
					oInnerAction.firePress();
					oAction = oTable.byId("inner");
					assert.equal(oAction.getText(),"composite","The action from the control is called");
					assert.ok(fnCompositeSpy.calledOnce,"The composite handles the event");
					assert.equal(fnControllerSpy.callCount, 1, "The controller method is not called any more");
					oComponentContainer.destroy();
					done();
				});
			}, 0);
		});
	});
	//************************************************************************************************
	QUnit.test("nesting composites", function (assert) {
		var done = assert.async();
		sap.ui.require(["my/aggregations/Component"], function(MyAggregationsComponent) {
			var oComponentContainer = new ComponentContainer({
				component: new MyAggregationsComponent("aggregations")
			}).placeAt("content");

			setTimeout(function(){
				var oView = oComponentContainer.getComponentInstance().getRootControl();

				oView.loaded().then(function() {
					var oTable = oView.byId("table");
					assert.ok(oTable, "The table is there");

					var oCellTemp1 = oTable.byId("cell-temp1");
					assert.ok(oCellTemp1,"the first templating cell is there");
					assert.ok(oCellTemp1.isA("composites.Cell"), "the cell is a composite cell");
					assert.equal(oCellTemp1.getAsLink(), false, "the cells property 'asLink' is set to false");
					var oInnerCell = oCellTemp1.getAggregation("_content");
					assert.ok(oInnerCell, "The cell has an inner content");
					assert.ok(oInnerCell.isA("sap.m.Text"), "that is a text");

					var oCellTemp2 = oTable.byId("cell-temp2");
					assert.ok(oCellTemp2,"the second templating cell is there");
					assert.ok(oCellTemp2.isA("composites.Cell"), "the cell is a composite cell");
					assert.equal(oCellTemp2.getAsLink(), true, "the cells property 'asLink' is set to true");
					oInnerCell = oCellTemp2.getAggregation("_content");
					assert.ok(oInnerCell, "The cell has an inner content");
					assert.ok(oInnerCell.isA("sap.m.Link"), "that is a link");

					oComponentContainer.destroy();
					done();
				});
			}, 0);
		});
	});

	var fnFragmentRetemplatingSpy;
	QUnit.module("clone", {
		before: function() {
			fnFragmentRetemplatingSpy = sinon.spy(XMLComposite.prototype, "fragmentRetemplating");
		},
		after: function() {
			fnFragmentRetemplatingSpy.reset();
		}
	});

	QUnit.test("Preprocessed cell without medatadata contexts", function (assert) {
		var done = assert.async();
		sap.ui.require(["my/clone/Component"], function(MyCloneComponent) {
			var oComponentContainer = new ComponentContainer({
				component: new MyCloneComponent("noMDC")
			}).placeAt("content");

			setTimeout(function(){
				var oView = oComponentContainer.getComponentInstance().getRootControl();

				oView.loaded().then(function() {
					var oPlainCell = oView.byId("asLink");
					assert.ok(oPlainCell,"There is a cell");

					var oInnerCell = oPlainCell._getCompositeAggregation();
					assert.ok(oInnerCell.isA("sap.m.Link"), "The inner control is a link");
					var fnPopulateTemplate = oPlainCell.getProperty("_fnPopulateTemplate");
					assert.ok(fnPopulateTemplate, "The populate Template function is created");
					assert.ok(oPlainCell._fragmentContent, "There is fragment content stored");

					var oPlainCellClone = oPlainCell.clone();
					setTimeout(function() {
						assert.ok(oPlainCellClone,"the clone is there");
						assert.ok(oPlainCellClone._bIsClone,"The template has been populated");
						assert.ok(fnFragmentRetemplatingSpy.notCalled,"Retemplating has not been triggered");
						assert.equal(oPlainCell._fragmentContent, oPlainCellClone._fragmentContent, "The fragment contents are equal");
						oInnerCell =  oPlainCellClone._getCompositeAggregation();
						assert.ok(oInnerCell.isA("sap.m.Link"), "Also the created control is of same type");
						oComponentContainer.destroy();
						done();
					}, 0);
				});
			}, 0);
		});
	});

	QUnit.test("Preprocessed cells with medatadata contexts", function (assert) {
		var done = assert.async();
		sap.ui.require(["my/clone/Component"], function(MyCloneComponent) {
			var oComponentContainer = new ComponentContainer({
				component: new MyCloneComponent("clone2")
			}).placeAt("content");

			setTimeout(function(){
				var oView = oComponentContainer.getComponentInstance().getRootControl();

				oView.loaded().then(function() {
					var oMDCCell0 = oView.byId("column0");
					assert.ok(oMDCCell0,"There is a cell");

					var oInnerCell =  oMDCCell0._getCompositeAggregation();
					assert.ok(oInnerCell.isA("sap.m.Link"), "The inner control is a link");

					var fnPopulateTemplate = oMDCCell0.getProperty("_fnPopulateTemplate");
					assert.ok(fnPopulateTemplate, "The populate Template function is created");
					assert.ok(oMDCCell0._fragmentContent, "There is fragment content stored");

					var oMDCCell0Clone = oMDCCell0.clone();
					setTimeout(function() {
						assert.ok(oMDCCell0Clone,"the clone is there");
						assert.ok(oMDCCell0Clone._bIsClone,"The template has been populated");
						assert.ok(fnFragmentRetemplatingSpy.notCalled,"Retemplating has not been triggered");
						assert.equal(oMDCCell0._fragmentContent, oMDCCell0Clone._fragmentContent, "The fragment contents are equal");
						oInnerCell =  oMDCCell0Clone._getCompositeAggregation();
						assert.ok(oInnerCell.isA("sap.m.Link"), "Also the created control is of same type");

						var oMDCCell1 = oView.byId("column1");
						oInnerCell =  oMDCCell1._getCompositeAggregation();
						assert.ok(oInnerCell.isA("sap.m.Input"), "The inner control is a link");
						assert.ok(oMDCCell0,"There is a cell");
						var fnPopulateTemplate = oMDCCell1.getProperty("_fnPopulateTemplate");
						assert.ok(fnPopulateTemplate, "The populate Template function is created");

						assert.ok(oMDCCell1._fragmentContent, "There is fragment content stored");
						var oMDCCell1Clone = oMDCCell1.clone();
						setTimeout(function() {
							assert.ok(oMDCCell1Clone,"the clone is there");
							assert.ok(oMDCCell1Clone._bIsClone,"The template has been populated");
							assert.ok(fnFragmentRetemplatingSpy.notCalled,"Retemplating has not been triggered");
							assert.equal(oMDCCell1._fragmentContent, oMDCCell1Clone._fragmentContent, "The fragment contents are equal");
							oInnerCell =  oMDCCell1Clone._getCompositeAggregation();
							assert.ok(oInnerCell.isA("sap.m.Input"), "Also the created control is of same type");
							oComponentContainer.destroy();
							done();
						}, 0);
					}, 0);
				});
			}, 0);
		});
	});

	QUnit.test("Javascript created field  with medatadata contexts", function (assert) {
		var done = assert.async();

		var oRuntimeField = new RuntimeField({
			label: "Hello",
			value: "Managed Object Model" }
		);

		setTimeout(function() {
			assert.ok(oRuntimeField, "the runtime field is created");
			assert.ok(fnFragmentRetemplatingSpy.calledOnce,"Retemplating has been triggered during creation");
			var oInnerControl = oRuntimeField.byId("control");
			assert.ok(oInnerControl.isA("sap.m.Text"), "the inner control is a text");

			var fnPopulateTemplate = oRuntimeField.getProperty("_fnPopulateTemplate");
			assert.ok(fnPopulateTemplate, "The populate Template function is created");
			assert.ok(oRuntimeField._fragmentContent, "There is fragment content stored");

			var oRuntimeFieldClone = oRuntimeField.clone();
			setTimeout(function() {
				assert.ok(oRuntimeFieldClone,"the clone is there");
				assert.ok(oRuntimeFieldClone._bIsClone,"The template has been populated");
				assert.ok(fnFragmentRetemplatingSpy.calledOnce,"Retemplating has not been triggered again for the clone");
				assert.equal(oRuntimeField._fragmentContent, oRuntimeFieldClone._fragmentContent, "The fragment contents are equal");
				oInnerControl =  oRuntimeFieldClone.byId("control");
				assert.ok(oInnerControl.isA("sap.m.Text"), "Also the created control is of same type");
				done();
			}, 0);
		});
	});

	QUnit.start();

});