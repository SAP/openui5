(function ($, QUnit, sinon, Importance) {

	function createPage(key) {

		var oOPL = new sap.uxap.ObjectPageLayout(key,{
			headerTitle:new sap.uxap.ObjectPageHeader({
				objectTitle:key,
				actions:[
					new sap.uxap.ObjectPageHeaderActionButton({
						icon:'sap-icon://refresh'
					}),
					new sap.uxap.ObjectPageHeaderActionButton({
						icon:'sap-icon://sys-help',
						tooltip:'Show help'
					})
				]
			}),
			headerContent:[
				new sap.m.Toolbar({
					content:[
						new sap.m.Button({
							text:'Button 1',
							type:sap.m.ButtonType.Emphasized
						}),
						new sap.m.Button({
							text:'Button 2',
							type:sap.m.ButtonType.Emphasized
						})
					]
				}).addStyleClass('borderless')
			],
			sections:[
				new sap.uxap.ObjectPageSection({
					showTitle:false,
					subSections:[
						new sap.uxap.ObjectPageSubSection({
							blocks:[
								new sap.m.Text({text:'Page ' + key}),
								new sap.m.Text({text:'More to come...'})
							]
						})
					]
				})
			]
		});

		return oOPL;
	}


    QUnit.test("Show/Hide Page", function (assert) {

		var oPage1 = createPage("page1"),
			oPage2 = createPage("page2"),
			oApp = new sap.m.App({pages: [oPage1, oPage2],
									initialPage: oPage1});
		oApp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oPage1._bStickyAnchorBar === false, "page is expanded");

		var done = assert.async();
		oApp.attachAfterNavigate(function(oEvent) {
			assert.ok(oPage1._bStickyAnchorBar === false, "page is still expanded");
			if (oApp.getCurrentPage().getId() === "page1") {
				done();
			}
		});

		oApp.to(oPage2); //hide page1
		oApp.to(oPage1); //back page1
    });

}(jQuery, QUnit, sinon, sap.uxap.Importance));
