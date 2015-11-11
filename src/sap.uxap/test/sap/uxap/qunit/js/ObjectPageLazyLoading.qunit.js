(function ($, QUnit) {

	jQuery.sap.registerModulePath("view", "view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

	var oController = sap.ui.controller("viewController", {
		onInit: function () {
		}
	});

	// utility function that will be used in these tests
	var _getOneBlock = function () {
		return {
			Type: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob",

			mappings: [{
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/0",
				"internalModelName": "emp1"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/1",
				"internalModelName": "emp2"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/2",
				"internalModelName": "emp3"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/3",
				"internalModelName": "emp4"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/4",
				"internalModelName": "emp5"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/5",
				"internalModelName": "emp6"
			}

			]
		}
	};

	var _loadBlocksData = function (oData) {
		jQuery.each(oData.sections, function (iIndexSection, oSection) {
			jQuery.each(oSection.subSections, function (iIndex, oSubSection) {
				oSubSection.blocks = [_getOneBlock()];
				if (iIndexSection <= 4) {
					oSubSection.mode = "Collapsed";
					oSubSection.moreBlocks = [_getOneBlock()];
				}
			});
		});
	};

	var iLoadingDelay = 500;
	var oConfigModel = new sap.ui.model.json.JSONModel(
		"model/ObjectPageConfig.json");

	var oView = sap.ui.xmlview("UxAP-27_ObjectPageConfig", {
		viewName: "view.UxAP-27_ObjectPageConfig",
		controller: oController
	});
	oView.setModel(oConfigModel, "objectPageLayoutMetadata");
	oView.placeAt('content');
	sap.ui.getCore().applyChanges();

	module("ObjectPageConfig");

	QUnit
		.test(
		"load first visible sections",
		function (assert) {

			var oComponentContainer = oView
				.byId("objectPageContainer");
			var oObjectPageLayout = oComponentContainer
				.getObjectPageLayoutInstance();

			var oData = oConfigModel.getData();
			_loadBlocksData(oData);

			oConfigModel.setData(oData);
			sap.ui.getCore().applyChanges();
			
			var done = assert.async();
			setTimeout(function() {
				var oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oFirstSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");
				
				var oSecondSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oSecondSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");
				
				var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
				assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
				done();
			}, iLoadingDelay);
	});
	
	QUnit
	.test(
	"load scrolled sections",
	function (assert) {

		var oComponentContainer = oView
			.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();

		oObjectPageLayout.scrollToSection(oObjectPageLayout.getSections()[5].getId());
		sap.ui.getCore().applyChanges();
		
		var done = assert.async();
		setTimeout(function() {
			
			var oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];
			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
			
			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, true, "block data if target section loaded");
			done();
		}, iLoadingDelay);
});
	
	QUnit
	.test(
	"model mapping for scrolled sections",
	function (assert) {

		var oComponentContainer = oView
			.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();
		
		var oDataModel = new sap.ui.model.json.JSONModel("model/HRData.json");
		oView.setModel(oDataModel, "objectPageData");

		sap.ui.getCore().applyChanges();
		
		var done = assert.async();
		setTimeout(function() {
			
			var oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];
			assert.strictEqual(oThirdSubSection.$().find(".sapUxAPBlockBase .sapMImg").length > 0, false, "data of disconnected blocks is not loaded");
			
			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.$().find(".sapUxAPBlockBase .sapMImg").length > 0, true, "data of last connected blocks is loaded");
			done();
		}, iLoadingDelay);
});


}(jQuery, QUnit));
