/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/model/json/JSONModel",
    "sap/ui/ux3/DataSet",
    "sap/ui/ux3/DataSetItem",
    "sap/ui/ux3/DataSetSimpleView",
    "sap/ui/commons/TextField",
    "sap/ui/thirdparty/jquery",
    "sap/ui/qunit/utils/waitForThemeApplied"
], function(
    createAndAppendDiv,
	JSONModel,
	DataSet,
	DataSetItem,
	DataSetSimpleView,
	TextField,
	jQuery,
	waitForThemeApplied
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");



	// Initialize the Model

	var data = {products:[]};
	var aTitles = ["Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS",
				   "Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				   "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				   "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				   "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				   "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS"];

	for (var i = 0; i < aTitles.length; i++){
		var sTitle = aTitles[i];
		var oProduct = {id: "" + i, price: Math.floor((Math.random() * 1000)) + 1 + " $", category: "PC",
				title: sTitle, rating: Math.floor((Math.random() * 5)) + 1};
		if (sTitle.indexOf("Notebook") >= 0){
			oProduct.category = "Notebook";
		} else if (sTitle.indexOf("Cellphone") >= 0 || sTitle.indexOf("PDA") >= 0){
			oProduct.category = "Mobile";
		}
		data.products.push(oProduct);
	}

	var oModel = new JSONModel();
	oModel.setData(data);

	var oDataSet = new DataSet({
		items: {
			path: "/products",
			template: new DataSetItem({
				title : "{title}"
			})
		},
		views: [
			new DataSetSimpleView({
				name: "Floating, non-responsive Card View",
				icon: "test-resources/sap/ui/ux3/images/thumbnails.png",
				iconHovered: "test-resources/sap/ui/ux3/images/thumbnails_hover.png",
				iconSelected: "test-resources/sap/ui/ux3/images/thumbnails_hover.png",
				floating: false,
				responsive: false,
				itemMinWidth: 0,
				template: new TextField({value: "{category}", editable: false}),
				initialItemCount: 10,
				reloadItemCount: 5,
				height: "495px"
			})
		]
	});
	oDataSet.setModel(oModel);
	oDataSet.placeAt("content");


	QUnit.module("Pagination");
	QUnit.test("Initial item count", function(assert) {
		assert.equal(sap.ui.getCore().byId(oDataSet.getSelectedView()).getInitialItemCount(), 10, "Initial item count");
		assert.equal(oDataSet.getItems().length, 27, "Item count after inital reload (fill scrollarea)");
	});

	QUnit.test("Scrolling", function(assert) {
		var done = assert.async();
		var $scrollArea = jQuery(".sapUiUx3DSSVSA");
		$scrollArea.scrollTop($scrollArea.height());
		setTimeout(function() {
			assert.equal(oDataSet.getItems().length, 32, "Item count after scrolling to the very bottom");
			done();
		}, 1000);
	});

	QUnit.test("Scrolling 2", function(assert) {
		var done = assert.async();
		var $scrollArea = jQuery(".sapUiUx3DSSVSA");
		$scrollArea.scrollTop($scrollArea.height() + $scrollArea.scrollTop());
		setTimeout(function() {
			assert.equal(oDataSet.getItems().length, 37, "Item count after scrolling to the very bottom");
			done();
		}, 1000);
	});

	return waitForThemeApplied();
});