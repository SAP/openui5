(function ($, QUnit) {

	jQuery.sap.registerModulePath("view", "view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");


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

	var iLoadingDelay = 5000;
	var oConfigModel = new sap.ui.model.json.JSONModel(
		"model/ObjectPageConfig.json");
	var oDataModel = new sap.ui.model.json.JSONModel("model/HRData.json");

	var oView = sap.ui.xmlview("UxAP-27_ObjectPageConfig", {
		viewName: "view.UxAP-27_ObjectPageConfig"
	});
	oView.setModel(oConfigModel, "objectPageLayoutMetadata");
	oView.placeAt('content');
	sap.ui.getCore().applyChanges();

	module("ObjectPageConfig");

	QUnit.test("#1 objectPageLifeCycle: creation", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();

		assert.notEqual(oObjectPageLayout, undefined,
			"objectPageLayout created");
	});

	QUnit.test("#2 objectPageLifeCycle: initial configuration", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();

		assert.strictEqual(oObjectPageLayout.getSections().length, 7,
			"configured successfully: sections are "
			+ oObjectPageLayout.getSections().length);
	});

	QUnit
		.test(
		"#3 objectPageLifeCycle: initial c rendering",
		function (assert) {

			var oComponentContainer = oView
				.byId("objectPageContainer");
			var oObjectPageLayout = oComponentContainer
				.getObjectPageLayoutInstance();

			var oData = oConfigModel.getData();

			_loadBlocksData(oData);
			oConfigModel.setData(oData);

			sap.ui.getCore().applyChanges();

			assert
				.strictEqual(oObjectPageLayout.$().find(".sapUxAPObjectPageSection").length,
				7,
				"configured successfully: rendered sections are "
				+ jQuery("#"
				+ oObjectPageLayout
					.getId()
				+ " .sapUxAPObjectPageSection").length);
		});

	QUnit.test("#4 objectPageLifeCycle: block data loading", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();

		oView.setModel(oDataModel, "objectPageData");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		setTimeout(function() {
			var oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
			assert.strictEqual(oFirstSubSection.$().find(".sapUxAPBlockBase .sapMImg").length > 0, true, "block data loaded successfully");
			done();
		}, iLoadingDelay)

	});

	QUnit.test("#5 objectPageLifeCycle: adding by binding", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var aCurrentSubSection = oConfigModel.getProperty("/sections/0/subSections");

		//make sure this is the first visible so it causes lazy loading issue
		aCurrentSubSection.unshift({
			"title": "subSection 1.0.1 by binding",
			"mode": "Collapsed",
			blocks: [
				_getOneBlock()
			]
		});

		oConfigModel.setProperty("/sections/0/subSections", aCurrentSubSection);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oObjectPageLayout.getSections()[0].getSubSections().length, 3, "subsection added by binding successfully");
	});

	QUnit.test("#6 objectPageLifeCycle: adding by API", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var oFirstSection = oObjectPageLayout.getSections()[0];
		var iSubSections = oFirstSection.getSubSections().length;

		var oNewSubSection = new sap.uxap.ObjectPageSubSection({
			title: "subSection 1.0.0 by api",
			mode: "Collapsed"
		});

		oNewSubSection.addBlock(new sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob({
			mappings: [
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/0",
					"internalModelName": "emp1"
				}),
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/1",
					"internalModelName": "emp2"
				}),
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/2",
					"internalModelName": "emp3"
				}),
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/3",
					"internalModelName": "emp4"
				}),
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/4",
					"internalModelName": "emp5"
				}),
				new sap.uxap.ModelMapping({
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/5",
					"internalModelName": "emp6"
				})
			]
		}));

		oFirstSection.insertSubSection(oNewSubSection, 0);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFirstSection.getSubSections().length, (iSubSections + 1), "adding subsection by api successfully");
	});

	QUnit.test("#7 objectPageLifeCycle: updating by binding", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var aCurrentSubSection = oConfigModel.getProperty("/sections/0/subSections");

		oConfigModel.setProperty("/headerTitle/isObjectIconAlwaysVisible", false);
		oConfigModel.setProperty("/headerTitle/isObjectTitleAlwaysVisible", false);
		oConfigModel.setProperty("/headerTitle/isObjectSubtitleAlwaysVisible", false);
		oConfigModel.setProperty("/headerTitle/isActionAreaAlwaysVisible", false);
		oConfigModel.refresh(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery("#" + oObjectPageLayout.getId() + " .sapUxApObjectPageHeaderIdentifier").is(":visible"), false, "headerTitle hidden");
	});

	QUnit.test("#8 objectPageLifeCycle: removing by binding", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var oFirstSection = oObjectPageLayout.getSections()[0];

		oConfigModel.setProperty("/sections/0/subSections", []);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFirstSection.$().is(":visible"), false, "removing by binding");
	});

	QUnit.test("#9 objectPageLifeCycle: updating by API", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var oBlock = oObjectPageLayout.getSections()[6].getSubSections()[0].getBlocks()[0];
		oBlock.setVisible(false);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oObjectPageLayout.getSections()[6].$().is(":visible"), false, "hiding by api cascading up");
		assert.strictEqual(oBlock._oParentObjectPageSubSection.getParent().$().is(":visible"), false, "hiding by api cascading up");
	});

	QUnit.test("#10 objectPageLifeCycle: removing by API", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		oBlock = oObjectPageLayout.getSections()[5].getSubSections()[0].getBlocks()[0];
		oObjectPageLayout.getSections()[5].getSubSections()[0].removeBlock(oBlock);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oObjectPageLayout.getSections()[5].$().is(":visible"), false, "removing by api cascading up");
		assert.strictEqual(oBlock._oParentObjectPageSubSection.getParent().$().is(":visible"), false, "removing by api cascading up");
	});

	QUnit.test("#11 objectPageLifeCycle: lazy loading by api", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var oLastSection = oObjectPageLayout.getSections()[oObjectPageLayout.getSections().length - 3];
		oLastSection.connectToModels();

		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery("#" + oLastSection.getId() + " .sapUxAPBlockBaseCollapsed:eq(0) .sapMImg").length, 2, "lazy loading by api");
	});

	QUnit.test("#12 objectPageLifeCycle: external model replaced", function (assert) {

		var oComponentContainer = oView.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance();
		var oLastSection = oObjectPageLayout.getSections()[oObjectPageLayout.getSections().length - 3];

		//change model
		var oNewModel = new sap.ui.model.json.JSONModel({
			"Employee": [
				{
					"name": "Michael Adams",
					"picture": "../qunit/img/person.png",
					"job": "Scrum master"
				},
				{
					"name": "John Miller",
					"picture": "../qunit/img/person.png",
					"job": "Product Owner"
				},
				{
					"name": "Richard Wilson",
					"picture": "../qunit/img/person.png",
					"job": "Ux designer"
				},
				{
					"name": "Julie Armstrong",
					"picture": "../qunit/img/person.png",
					"job": "Quality Engineer"
				},
				{
					"name": "Denise Smith",
					"picture": "../qunit/img/person.png",
					"job": "Team member"
				},
				{
					"name": "Richard Adams",
					"picture": "../qunit/img/person.png",
					"job": "Team member"
				}
			]
		});

		oView.setModel(oNewModel, "objectPageData");

		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery("#" + oLastSection.getId() + " .sapUxAPBlockBaseCollapsed:eq(0) label:eq(0)").text(), "James Smith Changed", "bound values are updated");
	});

}(jQuery, QUnit));
