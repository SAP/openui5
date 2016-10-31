(function ($, QUnit) {
	"use strict";
	sinon.config.useFakeTimers = true;
	QUnit.module("set context (and rebind) with property 'showTitleInHeaderContent' doesn't work", {
		beforeEach : function() {
			this.oPageLayout = new sap.uxap.ObjectPageLayout({
				id:"ObjectPageLayout",
				showTitleInHeaderContent:true,
				headerTitle: [
					new sap.uxap.ObjectPageHeader({
						id:"header",
						objectImageURI:"{src}",
						objectTitle:"{name}",
						objectSubtitle:"{group}",
						isObjectIconAlwaysVisible:false,
						isObjectTitleAlwaysVisible:false,
						isObjectSubtitleAlwaysVisible:false,
						isActionAreaAlwaysVisible:false,
					})
				]
			}).placeAt('qunit-fixture');

			// test data
			var oMock = [
				{
					src: '../qunit/img/imageID_273624.png',
					name: 'Denise Smith',
					group: 'Junior Developer'
				},
				{
					src: '../qunit/img/imageID_275314.png',
					name: 'Denise Smith-Jones',
					group: 'Senior Developer'
				}
			];

			// didn't set context for properties objectImageURI, objectTitle, objectSubtitle
			this.oJSONModel = new sap.ui.model.json.JSONModel(oMock);
			this.oPageLayout.setModel(this.oJSONModel);

			this.oPageLayout.bindObject('/0');

			this.clock = sinon.clock.create();

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oPageLayout.destroy();
			this.oPageLayout = null;
		}
	});
	QUnit.test("Rebind properties objectImageURI, objectTitle, objectSubtitle", function(assert) {
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		// check if all right
		// objectImageURI
		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper .sapUxAPObjectPageHeaderContentImageContainer > img").attr('src'),
			this.oJSONModel.getProperty('/0/src'),
			"objectImageURI successfully inited");
		// objectTitle
		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper #header-innerTitle").text(),
			this.oJSONModel.getProperty('/0/name'),
			"objectTitle successfully inited");
		// objectSubtitle
		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper #header-subtitle").text(),
			this.oJSONModel.getProperty('/0/group'),
			"objectSubtitle successfully inited");


		// rebind
		this.oPageLayout.bindObject('/1');
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper .sapUxAPObjectPageHeaderContentImageContainer > img").attr('src'),
			this.oJSONModel.getProperty('/1/src'),
			"objectImageURI successfully changed");
		// objectTitle
		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper #header-innerTitle").text(),
			this.oJSONModel.getProperty('/1/name'),
			"objectTitle successfully changed");
		// objectSubtitle
		assert.equal(this.oPageLayout.$().find("#ObjectPageLayout-opwrapper #header-subtitle").text(),
			this.oJSONModel.getProperty('/1/group'),
			"objectSubtitle successfully changed");


	});
}(jQuery, QUnit));
