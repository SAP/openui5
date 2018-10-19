/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/m/TablePersoController",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function(createAndAppendDiv, jQuery, TablePersoController, ComponentContainer, UIComponent, JSONModel) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");



	var viewContent =
		'<mvc:View' +
		'	controllerName="perso.qunit.controller"' +
		'	xmlns:core="sap.ui.core"' +
		'	xmlns:mvc="sap.ui.core.mvc"' +
		'	xmlns="sap.m">' +
		'	<App><Page title="Perso Migration Test">' +
		'		<Table id="myTable" items="{/items}">' +
		'			<headerToolbar>' +
		'				<Toolbar>' +
		'					<ToolbarSpacer />' +
		'					<Button' +
		'						id="idPersonalizationButton"' +
		'						icon="sap-icon://person-placeholder" />' +
		'				</Toolbar>' +
		'			</headerToolbar>' +
		'			<columns>' +
		'				<Column id="idName"><Label text="Name" /></Column>' +
		'				<Column id="idColor"><Label text="Color" /></Column>' +
		'				<Column id="idNumber"><Label text="Number" /></Column>' +
		'			</columns>' +
		'			<ColumnListItem>' +
		'				<cells>' +
		'					<Label text="{name}" />' +
		'					<Label text="{color}" />' +
		'					<Label text="{number}" />' +
		'				</cells>' +
		'			</ColumnListItem>' +
		'		</Table>' +
		'	</Page></App>' +
		'</mvc:View>';

	var oPersoService = {

		// Historic bundle, to be migrated
		_oBundle : {
			_persoSchemaVersion: "1.0",
			aColumns: [
				{
					id: "__xmlview0--idColor",
					order: 1,
					text: "Color",
					visible: true
				},
				{
					id: "__xmlview0--idName",
					order: 0,
					text: "Name",
					visible: false
				},
				{
					id: "__xmlview0--idNumber",
					order: 2,
					text: "Number",
					visible: true
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		}
	};

	sap.ui.controller("perso.qunit.controller", {

		onInit: function(oEvent) {

			var oView = this.getView();

			var oTPC = new TablePersoController({
				table: oView.byId("myTable"),
				persoService: oPersoService
			}).activate();

			oView.byId("idPersonalizationButton").attachPress(function(oEvent) {
				oTPC.openDialog();
			});
		}

	});

	var TestComp = UIComponent.extend("perso.qunit.Component", {
		createContent: function(oEvent) {

			var oView = sap.ui.xmlview({ viewContent: viewContent });
			oView.setModel(new JSONModel({
				items: [
						{ name: "Michelle", color: "orange", number: 3.14 },
						{ name: "Joseph", color: "blue", number: 1.618 },
						{ name: "David", color: "green", number: 0 }
				]
			}));
			return oView;

		}
	});

	var oComponentContainer = new ComponentContainer();
	oComponentContainer.setComponent(new TestComp());
	oComponentContainer.placeAt("content");

	QUnit.module("Migration");

	QUnit.test("Column order as in historic settings", function(assert) {

		var aColumns = sap.ui.getCore().byId("__xmlview0").byId("myTable").getColumns();
		assert.equal(aColumns[0].getHeader().getText(), "Name", "Column 1 is Number");
		assert.equal(aColumns[1].getHeader().getText(), "Color", "Column 2 is Color");
		assert.equal(aColumns[2].getHeader().getText(), "Number", "Column 3 is Number");

	});

	QUnit.test("Column visibility as in historic settings", function(assert) {

		var aColumns = sap.ui.getCore().byId("__xmlview0").byId("myTable").getColumns();
		assert.equal(aColumns[0].getVisible(), false, "Column 1 (Name) is not visible");
		assert.equal(aColumns[1].getVisible(), true, "Column 2 (Color) is visible");
		assert.equal(aColumns[2].getVisible(), true, "Column 3 (Number) is visible");

	});

});