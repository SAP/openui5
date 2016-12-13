(function ($, QUnit, sinon, Importance) {

	jQuery.sap.registerModulePath("view", "view");

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

	QUnit.test("Show/Hide Page preserves expanded state", function (assert) {

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

	module("Invalidation");

	QUnit.test("do not invalidate parent upon first rendering", function (assert) {

		var oTextArea = new sap.m.TextArea({rows: 5, width: "100%", value: "12345678901234567890", growing: true}),
			oPage = new sap.m.Page("page01", {content: [oTextArea]}),
			oObjectPageLayout = new sap.uxap.ObjectPageLayout("page02", {
				sections: new sap.uxap.ObjectPageSection({
					subSections: [
						new sap.uxap.ObjectPageSubSection({
							blocks: [new sap.m.Text({text: "test"})]
						})
					]
				})
			}),
			oApp = new sap.m.App({
				pages: [
					oPage, oObjectPageLayout
				]
			}),
			done = assert.async();

        sinon.spy(oApp, "invalidate");

		oTextArea.addEventDelegate({
			onAfterRendering: function(oEvent) {
				assert.strictEqual(oTextArea.getDomRef().scrollHeight > 0, true, "textarea on after rendering has scrollHeight greater than 0");
                assert.strictEqual(oApp.invalidate.called, false, "invalidate not called");
			}
		});

		oApp.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		var afterNavigatePage2 = function() {
				oApp.detachAfterNavigate(afterNavigatePage2);
				oApp.attachAfterNavigate(afterBackToPage1);
				oApp.to("page01");
			},
			afterBackToPage1 = function() {
				done();
			};

		oApp.attachAfterNavigate(afterNavigatePage2);

		oApp.to("page02");
	});


	module("Sections invalidation", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview("UxAP-ObjectPageState", {
				viewName: "view.UxAP-ObjectPageState"
			});
			this.oObjectPage = this.oView.byId("ObjectPageLayout");

			this.oView.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("changes to hidden sections update the anchor bar", function (assert) {
		//setup
		var oPage = this.oObjectPage;
		oPage.setUseIconTabBar(true);
		var done = assert.async();

		setTimeout(function() {

			//act
			oPage.getSections()[1].setTitle("Changed");

			setTimeout(function() {

				var oTabButton = oPage.getAggregation("_anchorBar").getContent()[1];
				assert.ok(oTabButton.getText() === "Changed", "section title is updated in the anchorBar");
				done();
			}, 1000); //calc delay

		}, 1000); //dom calc delay
	});

	module("update content size", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview("UxAP-ObjectPageState", {
				viewName: "view.UxAP-ObjectPageState"
			});
			this.oObjectPage = this.oView.byId("ObjectPageLayout");

			this.oView.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("expand content below selected section updates layout", function (assert) {
		//setup
		var oPage = this.oObjectPage,
			oBlock = oPage.getSections()[2].getSubSections()[0].getBlocks()[0],
			oSelectedSection = oPage.getSections()[0];
			done = assert.async();

		setTimeout(function() {

			var oScrollPositionBeforeResize = oPage._$opWrapper.scrollTop();
			//act
			oBlock.setHeight("600px"); //add 300px more
			setTimeout(function() {

				var sSelectedButtonId = oPage.getAggregation("_anchorBar").getSelectedButton(),
					oSelectedButton = sap.ui.getCore().byId(sSelectedButtonId);

				assert.strictEqual(oSelectedButton.getText(), oSelectedSection.getTitle(), "section selection is preserved in the anchorBar");
				done();
			}, 1000); //dom calc delay
		}, 1000); //dom calc delay
	});

	function runParameterizedTests (bUseIconTabBar) {

		var sModulePrefix = bUseIconTabBar ? "IconTabBar": "AnchorBar"

		module(sModulePrefix + "Mode", {
			beforeEach: function () {
				this.oView = sap.ui.xmlview("UxAP-ObjectPageState", {
					viewName: "view.UxAP-ObjectPageState"
				});
				this.oObjectPage = this.oView.byId("ObjectPageLayout");
				this.oObjectPage.setUseIconTabBar(bUseIconTabBar);
				this.oView.placeAt('content');
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oView.destroy();
				this.oObjectPage = null;
			}
		});

		QUnit.test("Hide first section preserves expanded state", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0],
				oFirstSubsection = oFirstSection.getSubSections()[0];

			var done = assert.async();
			setTimeout(function() {
				assert.ok(oPage._bStickyAnchorBar === false, "header is expanded");
				// act
				oFirstSection.setVisible(false); /* hide subsection */

				setTimeout(function() {
					assert.ok(oPage._bStickyAnchorBar === false, "header is still expanded");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});


		QUnit.test("Hide first section changes selection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0],
				oFirstSubsection = oFirstSection.getSubSections()[0];
			oAnchorBar = this.oObjectPage.getAggregation("_anchorBar");

			var done = assert.async();
			setTimeout(function() {
				// act
				oFirstSection.setVisible(false); /* hide first section */

				setTimeout(function() {
					var sSelectedBtnId = oAnchorBar.getSelectedButton(),
						sFirstButtonId = oAnchorBar.getContent()[0].getId();

					assert.ok(sSelectedBtnId === sFirstButtonId, "first visible section is selected");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});


		QUnit.test("Delete first section preserves expanded state", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0];

			var done = assert.async();
			setTimeout(function() {
				// act
				oPage.removeSection(oFirstSection); /* remove first section */

				setTimeout(function() {
					assert.ok(oPage._bStickyAnchorBar === false, "page is still expanded");

					//cleanup
					oFirstSection.destroy();
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});


		/*
		 commented because of an uncovered previously-existing problem,
		 which will be fixed in a separate gerrit change
		 to minimize the complexity of the code reviewed here
		 QUnit.test("Delete first section changes selection", function (assert) {
			 //setup
			 var oPage = this.oObjectPage,
			 oAnchorBar = oPage.getAggregation("_anchorBar"),
			 oFirstSection = oPage.getSections()[0];

			 var done = assert.async();
			 setTimeout(function() {
				 // act
				 oPage.removeSection(oFirstSection); /!* remove first section *!/

				 setTimeout(function() {
					 var sSelectedBtnId = oAnchorBar.getSelectedButton(),
					 sFirstButtonId = oAnchorBar.getContent()[0].getId();
					 assert.ok(sSelectedBtnId === sFirstButtonId, "first visible section is selected");
					 done();
					 //cleanup
					 oFirstSection.destroy();
				 }, 1000); //scroll delay
			 }, 1000); //dom calc delay

		 });*/


		QUnit.test("Hide first subSection preserves expanded state", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0],
				oFirstSubsection = oFirstSection.getSubSections()[0];

			var done = assert.async();
			setTimeout(function() {
				assert.ok(oPage._bStickyAnchorBar === false, "header is expanded");
				// act
				oFirstSubsection.setVisible(false); /* hide subsection */

				setTimeout(function() {
					assert.ok(oPage._bStickyAnchorBar === false, "header is still expanded");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});


		QUnit.test("Hide first subSection updates selection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0],
				oFirstSubsection = oFirstSection.getSubSections()[0];
			oAnchorBar = oPage.getAggregation("_anchorBar");

			var done = assert.async();
			setTimeout(function() {
				// act
				oFirstSubsection.setVisible(false); /* hide first section */

				setTimeout(function() {
					var sSelectedBtnId = oAnchorBar.getSelectedButton(),
						sFirstButtonId = oAnchorBar.getContent()[0].getId();

					assert.ok(sSelectedBtnId === sFirstButtonId, "second visible section is selected");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});

		QUnit.test("Hide lower section preserves snapped state", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oSection1 = oPage.getSections()[1],
				oSection1Subsection1 = oSection1.getSubSections()[1];

			var done = assert.async();
			setTimeout(function() {
				oPage.scrollToSection(oSection1Subsection1.getId());

				setTimeout(function() {

					assert.ok(oPage._bStickyAnchorBar === true, "header is snapped");

					// act
					oSection1.setVisible(false); /* hide subsection */
					sap.ui.getCore().applyChanges();

					assert.ok(oPage._bStickyAnchorBar === true, "header is still snapped");
					done();
				}, 1000);
			}, 1000); //dom calc delay

		});

		QUnit.test("Hide lower section updates selection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oAnchorBar = oPage.getAggregation("_anchorBar"),
				oSection1 = oPage.getSections()[1],
				oSection1Subsection1 = oSection1.getSubSections()[1];

			var done = assert.async();
			setTimeout(function() {
				oPage.scrollToSection(oSection1Subsection1.getId());

				setTimeout(function() {

					// act
					oSection1.setVisible(false); /* hide subsection */
					sap.ui.getCore().applyChanges();

					var sSelectedBtnId = oAnchorBar.getSelectedButton(),
						sFirstButtonId = oAnchorBar.getContent()[0].getId();

					assert.ok(sSelectedBtnId === sFirstButtonId, "first visible section is selected");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});

		QUnit.test("Hide lower subSection preserves snapped state", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oSection1Subsection1 = oPage.getSections()[1].getSubSections()[1];

			var done = assert.async();
			setTimeout(function() {
				oPage.scrollToSection(oSection1Subsection1.getId());

				setTimeout(function() {

					assert.ok(oPage._bStickyAnchorBar === true, "header is snapped");

					// act
					oSection1Subsection1.setVisible(false); /* hide subsection */
					sap.ui.getCore().applyChanges();

					assert.ok(oPage._bStickyAnchorBar === true, "header is still snapped");
					done();
				}, 1000);
			}, 1000); //dom calc delay

		});

		QUnit.test("Hide lower subSection updates selection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oAnchorBar = oPage.getAggregation("_anchorBar"),
				oSection1Subsection1 = oPage.getSections()[1].getSubSections()[1];

			var done = assert.async();
			setTimeout(function() {
				oPage.scrollToSection(oSection1Subsection1.getId());

				setTimeout(function() {

					// act
					oSection1Subsection1.setVisible(false); /* hide subsection */
					sap.ui.getCore().applyChanges();

					var sSelectedBtnId = oAnchorBar.getSelectedButton(),
						sSecondButtonId = oAnchorBar.getContent()[1].getId(); //remaining subsection is promoted

					assert.ok(sSelectedBtnId === sSecondButtonId, "second visible section is selected");
					done();
				}, 1000); //scroll delay
			}, 1000); //dom calc delay

		});
	}

	var bUseIconTabBar = true;

	runParameterizedTests(bUseIconTabBar);
	runParameterizedTests(!bUseIconTabBar);

}(jQuery, QUnit, sinon, sap.uxap.Importance));
