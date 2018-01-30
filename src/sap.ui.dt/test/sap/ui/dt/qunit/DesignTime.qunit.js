/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	// external:
	'jquery.sap.global',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/layout/HorizontalLayout',
	'sap/m/Page',
	'sap/ui/base/ManagedObjectMetadata',
	// internal:
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/AggregationOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/plugin/TabHandling',
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/plugin/DragDrop',
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/Util",
	"qunit/MetadataTestUtil",
	// should be last:
	'sap/ui/thirdparty/sinon'
],
function(
	jQuery,
	Button,
	VerticalLayout,
	HorizontalLayout,
	Page,
	ManagedObjectMetadata,
	Overlay,
	ElementOverlay,
	AggregationOverlay,
	OverlayRegistry,
	DesignTime,
	ElementUtil,
	TabHandling,
	ContextMenu,
	DragDrop,
	ElementDesignTimeMetadata,
	Util,
	MetadataTestUtil,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that the DesignTime is created for a root control", {
		beforeEach : function(assert) {
			this.oDesignTime = new DesignTime();
		},
		afterEach : function(assert) {
			this.oDesignTime.destroy();
		}
	},
		function() {

		QUnit.test("when the DesignTime is created for a root control ", function(assert) {
			var fnDone = assert.async();

			this.oButton = new Button();

			var bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			this.oDesignTime.addRootElement(this.oButton);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(bSyncingCalled, "then syncing event was called initially");
				assert.ok("and synced event was called");

				assert.ok(OverlayRegistry.getOverlay(this.oButton), "overlay for button exists");
				var oButtonDTMetadata = OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
				assert.equal(oButtonDTMetadata.getLibraryName(), "sap.m", "the DesignTimeMetadata containing the libraryName");

				fnDone();
			}.bind(this));
		});

		QUnit.test("when empty composite control is added to root followed by a button which is added to the composite control", function(assert) {
			var fnDone = assert.async(),
				oOuterLayout, oInnerLayout, oButton;

			oOuterLayout = new VerticalLayout("outer-layout");
			oOuterLayout.placeAt("qunit-fixture");
			this.oDesignTime.addRootElement(oOuterLayout);

			this.oDesignTime.attachEventOnce("synced", function() {
				oInnerLayout = new VerticalLayout("inner-layout");
				oButton = new Button("button1");
				oInnerLayout.addContent(oButton);

				this.oDesignTime.attachEventOnce("synced", function() {
					OverlayRegistry.getOverlay(oOuterLayout).applyStyles();

					var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
					var oInnerOverlay = oButtonOverlay.getParentElementOverlay();
					assert.equal(oInnerOverlay.getElement().getId(), "inner-layout", "then the button overlay is inside in inner-layout overlay");
					var oOuterOverlay = oInnerOverlay.getParentElementOverlay();
					assert.equal(oOuterOverlay.getElement().getId(), "outer-layout", "then the inner-layout overlay is chained at outer-layout overlay");
					assert.ok(oOuterOverlay.$().is(":visible"), "then the outer-layout overlay is visible");
					assert.ok(oInnerOverlay.$().is(":visible"), "then the inner-layout overlay is visible");
					assert.ok(oButtonOverlay.$().is(":visible"), "then the button-layout overlay is visible");

					oOuterLayout.destroy();
					fnDone();
				});

				oOuterLayout.addContent(oInnerLayout);
				sap.ui.getCore().applyChanges();
			}.bind(this));
		});

	});

	QUnit.module("Given that the DesignTime is created for a root control", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oInnerLayout = new VerticalLayout({
				content : [
					this.oButton1,
					this.oButton2
				]
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oInnerLayout]
			});

			this.oOuterLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oOuterLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				fnDone();
			});
		},
		afterEach : function(assert) {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){

		QUnit.test("when the DesignTime is initialized ", function(assert) {
			var aOverlays = OverlayRegistry.getOverlays();

			assert.strictEqual(aOverlays.length, 6, "6 Overlays are created: 4 elements + 2 aggregations");

			assert.ok(OverlayRegistry.getOverlay(this.oOuterLayout), "overlay for outer layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oInnerLayout), "overlay for inner layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton2), "overlay for button2 exists");

			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0, "and a new selection is created and initially empty");
		});

		QUnit.test("when '_onAddAggregation' is called and a foreign error occurs during overlay creation", function(assert){
			var fnDone = assert.async();

			sandbox.stub(this.oDesignTime, "createOverlay", function(){
				return Promise.reject("Error");
			});

			sandbox.stub(Util, "isForeignError").returns(true);

			var oNewButton = new Button();

			var spyLog = sandbox.stub(jQuery.sap.log, "error", function(){
				assert.equal(spyLog.callCount, 1, "then an error is raised");
				assert.ok(spyLog.args[0][0].indexOf("Error in sap.ui.dt.DesignTime#_onAddAggregation") > -1, "and the error has the correct text");
				fnDone();
			});

			this.oDesignTime._onAddAggregation(oNewButton, this.oInnerLayout, "content");
		});

		QUnit.test("when a new control without overlay is added to a root control aggregation", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var oLayout = new VerticalLayout({content : [oButton]});

			var bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			var iElementOverlaysCreated = 0;
			this.oDesignTime.attachEvent("elementOverlayCreated", function() {
				iElementOverlaysCreated++;
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(bSyncingCalled, true, "syncing event was called");
				assert.strictEqual(iElementOverlaysCreated, 2, "two element overlays created events were called");

				assert.ok(OverlayRegistry.getOverlay(oButton), "overlay for the button exists");
				assert.ok(OverlayRegistry.getOverlay(oLayout), "overlay for the layout exists");

				fnDone();
			});

			this.oOuterLayout.addContent(oLayout);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when a control is destroyed while loading design time metadata", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();

			//simulate control being destroyed
			var fnOldLoadDTM = ElementOverlay.prototype._loadDesignTimeMetadata;
			ElementOverlay.prototype._loadDesignTimeMetadata = function(){
				return fnOldLoadDTM.apply(this, arguments).then(function(oDesignTimeMetadata){
					oButton.destroy();
					return oDesignTimeMetadata;
				});
			};

			var fnElementOverlayCreatedSpy = sinon.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.equal(fnElementOverlayCreatedSpy.callCount, 0, "then overlay is not published to be created");
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(!oButtonOverlay, "and overlay of destroyed control is also destroyed");

				ElementOverlay.prototype._loadDesignTimeMetadata = fnOldLoadDTM;
				fnDone();
			});

			this.oOuterLayout.addContent(oButton);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when an overlay is created via API function 'createOverlay' directly with an element as an only argument", function(assert) {
			var oButton = new Button();

			return this.oDesignTime.createOverlay(oButton).then(function(oOverlay){
				oOverlay.render();
				assert.ok(oOverlay.getDomRef(), "then an overlay is created");
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created via API function 'createOverlay' with params objects as an argument", function(assert) {
			var oButton = new Button();

			return this.oDesignTime.createOverlay({ element: oButton }).then(function(oOverlay){
				oOverlay.render();
				assert.ok(oOverlay.getDomRef(), "then an overlay is created");
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created for a control that already has an Overlay", function(assert) {
			var fnDone = assert.async();
			this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			this.oDesignTime.createOverlay(this.oButton1).then(function(oOverlay){
				assert.deepEqual(oOverlay, this.oButton1Overlay, "then the returned overlay is the previously existing overlay");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when 'initFailed' is fired with a foreign error by a created Overlay", function(assert) {
			var fnDone = assert.async();

			sandbox.stub(ElementOverlay.prototype, "asyncInit", function(){
				return Promise.reject("Error");
			});

			//Avoid having errors on the console during test execution
			sandbox.stub(jQuery.sap.log, "error");

			sandbox.stub(Util, "isForeignError").returns(true);

			var oButton = new Button();

			this.oDesignTime.createOverlay(oButton).catch(function(oError){
				assert.equal(oError.name, 'Error in sap.ui.dt.DesignTime#createOverlay', "then the correct error message is raised");
				fnDone();
			});
		});

		QUnit.test("when a new control triggers the creation of an overlay but an error happens within the loadDesignTimeMetadata promise chain", function(assert) {
			var fnDone = assert.async();
			var fnDone2 = assert.async();

			var oButton = new Button();
			var someError = new Error("some Error occured");
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").returns(Promise.reject(someError));
			var spyLog = sandbox.stub(jQuery.sap.log, "error", function() {
				assert.equal(spyLog.callCount, 1, "then an error is raised");
				spyLog.restore();
				fnDone2();
			});

			this.oDesignTime.createOverlay(oButton).catch(function(oError){
				sap.ui.getCore().applyChanges();
				assert.ok(true, "then createOverlay returns a rejected promise");
				fnDone();
			});
		});

		QUnit.test("when a control is moved inside of root element", function(assert) {
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			var oOldButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);

			sap.ui.getCore().applyChanges();

			var oNewButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			assert.strictEqual(oOldButtonOverlay, oNewButtonOverlay, "overlay for button1 is not changed");

			assert.deepEqual(oNewButtonOverlay.getParentElementOverlay(), oOuterLayoutOverlay, "the control has the correct new parent overlay");
		});

		QUnit.test("when a control is removed from root element", function(assert) {
			var fnDone = assert.async();

			this.oInnerLayout.removeContent(this.oButton1);

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("overlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
				this.oButton1.destroy();
			}.bind(this));
		});

		QUnit.test("when a plugin is added, a new Overlay is created and the DesignTime is destroyed", function(assert) {
			var fnDone = assert.async();
			var oTabHandlingPlugin = new TabHandling();
			var oRegisterPluginSpy = sandbox.spy(oTabHandlingPlugin, "registerElementOverlay");
			var oDeregisterPluginSpy = sandbox.spy(oTabHandlingPlugin, "deregisterElementOverlay");

			this.oDesignTime.addPlugin(oTabHandlingPlugin);
			assert.strictEqual(oRegisterPluginSpy.called, true, "then the registerElementOverlay method for the plugin was called");

			var oPluginSpy = sandbox.spy(oTabHandlingPlugin, "callElementOverlayRegistrationMethods");

			var oButton = new Button();
			this.oOuterLayout.addContent(oButton);
			sap.ui.getCore().applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.deepEqual(oPluginSpy.args[0][0], oButtonOverlay, "then after adding a new overlay the plugin calls its registration method with the overlay");
				this.oDesignTime.destroy();
				assert.notOk(OverlayRegistry.getOverlay(this.oOuterLayout), "and after destroying DesignTime overlay for layout destroyed");
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "and overlay for button1 is destroyed");
				assert.notOk(OverlayRegistry.getOverlay(this.oButton2), "and overlay for button2 is destroyed");
				assert.strictEqual(oDeregisterPluginSpy.called, true, "and the deregisterElementOverlay method for the plugin was called after destroy");
				fnDone();
			}.bind(this));

		});

		QUnit.test("when plugins are inserted and removed", function(assert) {
			var oTabHandlingPlugin = new TabHandling();
			var oContextMenuPlugin = new ContextMenu();
			var oDragDropPlugin = new DragDrop();

			assert.equal(this.oDesignTime.getPlugins().length, 0, "initially there are no plugins on the design time");

			this.oDesignTime.addPlugin(oTabHandlingPlugin);
			this.oDesignTime.insertPlugin(oContextMenuPlugin, 0);
			this.oDesignTime.insertPlugin(oDragDropPlugin, 1);

			assert.equal(this.oDesignTime.getPlugins().length, 3, "then three plugins are present in design time");
			assert.strictEqual(this.oDesignTime.getPlugins()[0], oContextMenuPlugin, "the ContextMenu plugin was inserted in the right position of the aggregation");
			assert.strictEqual(this.oDesignTime.getPlugins()[1], oDragDropPlugin, "the ElementMover plugin was inserted in the right position of the aggregation");

			this.oDesignTime.removePlugin(oDragDropPlugin);

			assert.equal(this.oDesignTime.getPlugins().length, 2, "after removing one, two plugins remain in design time");
			assert.strictEqual(this.oDesignTime.getPlugins()[1], oTabHandlingPlugin, "the TabHandlingPlugin plugin is in the right position of the aggregation");

			this.oDesignTime.removeAllPlugins();

			assert.equal(this.oDesignTime.getPlugins().length, 0, "after calling 'removeAllPlugins' the are no more plugins on the design time");
		});

		QUnit.test("when the element inside of the DesignTime is destroyed", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 destroyed");

				fnDone();
			}, this);

			this.oButton1.destroy();
		});

		QUnit.test("when the element inside of the DesignTime is moved to 'dependents' aggregation", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("overlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
			}, this);

			this.oInnerLayout.addDependent(this.oButton1);
		});

		// TODO: check after DesignTime API Enhancement
		QUnit.test("when the overlay is selected inside of the DesignTime", function(assert) {
			var fnDone = assert.async();
			var oOverlay = OverlayRegistry.getOverlay(this.oButton1);

			this.oDesignTime.attachEventOnce("selectionChange", function(oEvent) {
				var aSelection = oEvent.getParameter("selection");
				assert.strictEqual(aSelection.length, 1, "selection is just one overlay");
				assert.strictEqual(aSelection[0], oOverlay, "selection is correct");
				fnDone();
			});

			oOverlay.setSelectable(true);
			oOverlay.setSelected(true);
		});

		QUnit.test("when 'setSelectionMode is called", function(assert) {
			var oSelectionMode = sap.ui.dt.SelectionMode.Single;

			this.oDesignTime.setSelectionMode(oSelectionMode);

			assert.equal(this.oDesignTime.getSelectionMode(), oSelectionMode, "then 'SelectionMode' property is properly set");
			assert.equal(this.oDesignTime.getSelectionManager().getMode(), oSelectionMode, "then 'Mode' property of Selection Plugin is properly set");
		});

		QUnit.test("when the DesignTime is disabled and then enabled again", function(assert) {
			this.oDesignTime.setEnabled(false);
			assert.strictEqual(
				jQuery(Overlay.getOverlayContainer()).filter(':visible').length,
				0,
				'then the overlay container has been hidden'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				false,
				'then the outer overlay has been disabled'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).isVisible(),
				false,
				'then the outer overlay is not visible'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				false,
				'then the aggregation overlay of outer overlay is disabled'
			);

			this.oDesignTime.setEnabled(true);
			assert.strictEqual(
				jQuery(Overlay.getOverlayContainer()).filter(':visible').length,
				1,
				'then after enabling it again the overlay container is displayed'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				true,
				'and the outer overlay is visible'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				true,
				'and the aggregation overlay of outer overlay is visible'
			);
		});

		QUnit.test("when inner layout is destroyed and then _createChildren is called for the outer layout", function(assert){
			var fnDone = assert.async();
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			oInnerLayoutOverlay.destroy();

			var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			assert.notOk(oButton1Overlay, "then the children Overlays of the inner layout are also destroyed and de-registered");

			var fnSpy = sandbox.spy(DesignTime.prototype, "_createChildren");

			this.oDesignTime._createChildren(oOuterLayoutOverlay).then(function(){
				oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oOuterLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oOuterLayout).getAggregationOverlay("content");
				var oInnerLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oInnerLayout).getAggregationOverlay("content");
				assert.ok(oButton1Overlay, "then after _createChildren is called the children Overlays are created and registered again");
				assert.ok(oOuterLayoutAggregationOverlay, "and the outer layout 'content' aggregation overlay is also created");
				assert.ok(oInnerLayoutAggregationOverlay, "and the inner layout 'content' aggregation overlay is also created");
				assert.equal(fnSpy.callCount, 4, "and _createChildren was called exactly 4 times - once for the outer layout and once for each child element");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when oInnerLayout is extended by new button element without existing overlay", function(assert) {
			var fnDone = assert.async();
			var oParentOfNewOverlay,
				oButton = new Button("button3"),
				oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);

			this.oDesignTime.attachEventOnce("elementOverlayCreated", function(oEvent) {
				oParentOfNewOverlay = oEvent.getParameter("elementOverlay").getParentElementOverlay();
				assert.strictEqual(oParentOfNewOverlay.getId(), oInnerLayoutOverlay.getId(), "then the parent overlay of the new button is the oInnerLayoutOverlay");
				oParentOfNewOverlay.destroy();
				fnDone();
			});

			this.oInnerLayout.insertAggregation("content", oButton, 2);
		});

	});

	QUnit.module("Given a layout and a button", {
		beforeEach : function(assert) {
			this.oButton1 = new Button();

			this.oLayout1 = new VerticalLayout({
				content : [this.oButton1]
			});
			this.oLayout1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oLayout1.destroy();
			if (this.oDesignTime) {
				this.oDesignTime.destroy();
			}
			sandbox.restore();
		}
	}, function(){

		QUnit.test("when the content of the layout behaves like an association and DesignTime is created", function(assert){
			var fnDone = assert.async();
			sandbox.stub(AggregationOverlay.prototype, "isAssociation").returns(true);
			sandbox.stub(ElementUtil, "getAssociationInstances").returns([this.oButton1]);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oButton1Overlay, "then the button overlay is still created properly");
				assert.deepEqual(oButton1Overlay.getParentElementOverlay(), oLayout1Overlay, "and it has the correct parent");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the button is an invalid element for the layout and DesignTime is created", function(assert){
			var fnDone = assert.async();
			var fnOriginalIsElementValid = ElementUtil.isElementValid;

			// TODO: stub.withArgs doesn't work in sinon 1.14.1, replace after update to sinon-4
			ElementUtil.isElementValid = function (oElement) {
				return oElement === this.oButton1 ? false : fnOriginalIsElementValid(oElement);
			}.bind(this);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oLayout1Overlay, "then the layout overlay is created");
				assert.notOk(oButton1Overlay, "but the button overlay is not created");
				ElementUtil.isElementValid = fnOriginalIsElementValid;
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the design time is initialized", function(assert){
			var fnDone = assert.async();

			var oSpy = sandbox.spy(DesignTime.prototype, "_createElementOverlay");

			this.oLayout1.getMetadata().loadDesignTime().then(function(mDesignTimeMetadata){
				this.oDesignTime = new DesignTime({
					rootElements : [this.oLayout1]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					sap.ui.getCore().applyChanges();

					var aSpyCalls = oSpy.getCalls();

					assert.equal(aSpyCalls.length, 2, "then _createElementOverlay is called once for the layout and once for the button");

					assert.equal(aSpyCalls[0].args[0].element, this.oLayout1, "the first call is for the layout");
					assert.equal(aSpyCalls[1].args[0].element, this.oButton1, "the second call is for the button");
					assert.deepEqual(aSpyCalls[1].args[0].parentMetadata.actions, mDesignTimeMetadata.aggregations.content.actions,
						"the second call is made with the correct parent aggregation designtime metadata");

					fnDone();
				}.bind(this));
			}.bind(this));
		});

	});

	QUnit.module("Given that the DesignTime is initalized for two root controls", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			this.oLayout1 = new VerticalLayout({
				content : []
			});
			this.oLayout2 = new VerticalLayout({
				content : []
			});
			this.oLayout3 = new VerticalLayout({
				content : []
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oLayout1, this.oLayout2, this.oLayout3]
			});
			this.oOuterLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1, this.oLayout3]
			});
			sap.ui.getCore().applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				fnDone();
			});
		},
		afterEach : function() {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){

		QUnit.test("when getting the created overlays", function(assert) {
			assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.ok(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 exists");
		});

		QUnit.test("when 'getRootElements' is called", function(assert) {
			assert.ok(this.oDesignTime.getRootElements(), [this.oLayout1, this.oLayout3], "then layout1 and layout3 are returned");
		});

		QUnit.test("when one root element is removed", function(assert) {
			this.oDesignTime.removeRootElement(this.oLayout3);
			assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 doesn't exist");
		});

		QUnit.test("when all root elements are removed", function(assert) {
			this.oDesignTime.removeAllRootElement();
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 doesn't exist");
		});

		QUnit.test("when one root element is added", function(assert) {
			var fnDone = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 exists");
				fnDone();
			}, this);
			this.oDesignTime.addRootElement(this.oLayout2);
		});

		QUnit.test("when the overlay for a root element cannot be created", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(DesignTime.prototype, "createOverlay", function(){
				return Promise.reject("Error");
			});

			var spyLog = sandbox.stub(jQuery.sap.log, "error", function(){
				assert.equal(spyLog.callCount, 1, "then an error is raised");
				fnDone();
			});

			this.oDesignTime.addRootElement(this.oLayout2);
		});

	});

	QUnit.module("Given that the DesignTime is initialized with custom DesignTime Metadata for sap.m.Page", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oPage = new Page();
			this.oPage.getMetadata().loadDesignTime().then(function() {
				this.oDesignTime = new DesignTime({
					designTimeMetadata : {
						"sap.m.Page" : {
							testField : "testValue"
						}
					},
					rootElements : [this.oPage]
				});
				this.oDesignTime.attachEventOnce('synced', function () {
					this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
					fnDone();
				}, this);
			}.bind(this));
		},
		afterEach : function() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting the metadata for the sap.m.Page control from DesignTime", function(assert) {
			var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor(this.oPage);
			assert.strictEqual(oDTMetadata.testField, "testValue", "then the expected custom value is returned");
		});

		QUnit.test("when getting the metadata for sap.m.Page from DesignTime (using control name - backwards compatibility)", function(assert) {
			var spyLog = sandbox.stub(jQuery.sap.log, "error", function(){
				assert.equal(spyLog.callCount, 1, "an error is raised telling how the method should be called now");
			});
			var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor("sap.m.Page");
			assert.strictEqual(oDTMetadata.testField, "testValue", "but the expected custom value is returned anyway");
		});

		QUnit.test("when getting the metadata from the created overlay", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oPage);
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getData().testField, "testValue", "then DTMetadata from the DT is merged correctly");
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getAggregation("content").domRef, ":sap-domref > section", "UI5 DTMetadata is merged correctly");
		});

		QUnit.test("When the overlay and its aggregations are rendered", function(assert) {
			var oContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
			var oHeaderOverlay = this.oPageOverlay.getAggregationOverlay("customHeader");

			var aAggregationOverlays = this.oPageOverlay.getAggregationOverlays();
			var iIndexOfContentOverlay = aAggregationOverlays.indexOf(oContentOverlay);
			var iIndexOfHeaderOverlay = aAggregationOverlays.indexOf(oHeaderOverlay);
			var iIndexOfContentOverlayInDom = this.oPageOverlay.$().find('>.sapUiDtOverlayChildren > *').index(oContentOverlay.$());
			var iIndexOfHeaderOverlayInDom = this.oPageOverlay.$().find('>.sapUiDtOverlayChildren > *').index(oHeaderOverlay.$());

			assert.ok(
				(iIndexOfContentOverlay < iIndexOfHeaderOverlay && iIndexOfContentOverlayInDom < iIndexOfHeaderOverlayInDom)
				|| (iIndexOfContentOverlay > iIndexOfHeaderOverlay && iIndexOfContentOverlayInDom > iIndexOfHeaderOverlayInDom),
				'then aggregations are on the correct positions'
			);
		});
	});

	QUnit.module("Given that the DesignTime is created with hidden layout", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({ text: 'Button1' });
			this.oLayout1 = new VerticalLayout({
				content: [this.oButton1]
			});
			this.oLayoutOuter = new VerticalLayout({
				content: [this.oLayout1]
			});
			this.oLayoutOuter.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout" : {
						aggregations: {
							content: {
								domRef: function() {}
							}
						}
					}
				},
				rootElements: [this.oLayoutOuter]
			});

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayoutOuter = OverlayRegistry.getOverlay(this.oLayout1);
				fnDone();
			}, this);
		},
		afterEach : function() {
			this.oDesignTime.destroy();
		}
	}, function(){

		QUnit.test("when hidden layout becomes visible", function(assert) {
			var fnDone = assert.async();
			this.oButton2 = new Button({ text: 'Button2' });
			this.oLayout2 = new VerticalLayout({
				content : [this.oButton2]
			});
			this.oLayout2.addStyleClass('hidden');

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				assert.ok(!!this.oOverlayLayout2, 'then layout2 overlay is created');
				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(!!this.oOverlayButton2, 'then button2 overlay is created');
				fnDone();
			}, this);

			this.oLayoutOuter.removeContent(this.oLayout1);
			this.oLayoutOuter.addContent(this.oLayout2);
			this.oLayout2.removeStyleClass('hidden');
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when switching between layouts", function(assert) {
			var fnDone = assert.async();
			this.oButton2 = new Button({ text: 'Button2' });
			this.oLayout2 = new VerticalLayout({
				content : [this.oButton2]
			});
			this.oLayout2.addStyleClass('hidden');

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				assert.ok(!!this.oOverlayLayout2, 'layout2 overlay is created');
				this.oLayout2.removeStyleClass('hidden');

				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(!!this.oOverlayButton2, 'then button2 overlay is created');

				this.oDesignTime.attachEventOnce('synced', function () {
					this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
					assert.ok(!!this.oOverlayButton1, 'then button1 overlay is created');
					fnDone();
				}, this);

				setTimeout(function () {
					this.oLayoutOuter.removeContent(this.oLayout2);
					this.oLayoutOuter.addContent(this.oLayout1);
					this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oLayout2);
					assert.ok(!!this.oOverlayLayout1, 'then layout1 overlay is created');
					this.oLayout1.removeStyleClass('hidden');
					sap.ui.getCore().applyChanges();
				}.bind(this), 0);

			}, this);

			this.oLayout1.addStyleClass('hidden');
			this.oLayoutOuter.removeContent(this.oLayout1);
			this.oLayoutOuter.addContent(this.oLayout2);
			sap.ui.getCore().applyChanges();
		});

	});

	QUnit.module("Given independent controls consisting of vertical layout and buttons", {
		beforeEach: function(assert){
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oLayout1 = new VerticalLayout("vertlay");

			this.oMtDtFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
			this.oElemDtMetaDt = new ElementDesignTimeMetadata(MetadataTestUtil.buildMetadataObject({}));
			this.oRelevantContainerFunction = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				var oElementOverlay = OverlayRegistry.getOverlay("vertlay");
				var oAggregationOverlay = oElementOverlay.getAggregationOverlay("content");
				var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();
				var oAggregationData = oAggregationDtMetadata.getData();
				oAggregationData.propagationInfos = [MetadataTestUtil.createPropagationInfoObject(this.oRelevantContainerFunction.propagateRelevantContainer, this.oLayout1, this.oMtDtFunction.propagateMetadata)];
				oAggregationDtMetadata.setData(oAggregationData);
				this.oDesignTime.createOverlay(this.oButton1).then(function(oElementOverlay) {
					this.oOverlayButton1 = oElementOverlay;
					this.mMetadata = this.oOverlayButton1.getDesignTimeMetadata().getData();
					fnDone();
				}.bind(this));
			}.bind(this));

		},
		afterEach: function(assert){
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oLayout1.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){

		QUnit.test("when existing element is added and element overlay already exists", function(assert) {
			var mData = this.oMtDtFunction.propagateMetadata(this.oButton1);

			this.oLayout1.addContent(this.oButton1);
			assert.deepEqual(
				this.oOverlayButton1.getDesignTimeMetadata().getData().aggregations.content,
				mData.aggregations.content,
				"designtime metadata was set successfully after adding the element with an existing overlay"
			);
			assert.equal(
				this.oOverlayButton1.getDesignTimeMetadata().getData().designtimeModule,
				this.mMetadata.designtimeModule,
				"designtime metadata from the button is preserved (only extended)"
			);
		});

		QUnit.test("when existing element is added and element overlay does not exist yet", function(assert) {
			var fnDone = assert.async();
			var mData = this.oMtDtFunction.propagateMetadata(this.oButton2);

			this.oDesignTime.attachElementOverlayCreated(function(oEvent){
				assert.deepEqual(oEvent.getParameter("elementOverlay").getDesignTimeMetadata().getData().aggregations.content, mData.aggregations.content,
					"designtime metadata was set successfully after adding the element without an existing overlay");
				fnDone();
			});

			this.oLayout1.addContent(this.oButton2);
		});

	});

	QUnit.module("Given two verticalLayouts with different designTimeMetadata", {
		beforeEach: function(assert){
			var fnDone = assert.async();

			this.oPropagateMetadataFunctionForLayout1 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout1");
			this.oPropagateMetadataFunctionForLayout2 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout2");

			var oLayoutMetadata1 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout1);
			var oLayoutMetadata2 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout2);

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oVerticalLayout1 = new VerticalLayout("layout1", {
				content: [this.oButton1]
			});

			this.oHorizontalLayout1 = new HorizontalLayout("layout2");
			this.oPage = new Page({
				content: [this.oVerticalLayout1, this.oHorizontalLayout1, this.oButton2]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPage],
				designTimeMetadata : {
					"sap.ui.layout.VerticalLayout" : oLayoutMetadata1.data,
					"sap.ui.layout.HorizontalLayout" : oLayoutMetadata2.data
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				fnDone();
			}.bind(this));

		},
		afterEach: function(assert){
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){
		QUnit.test("when button1 is moved from verticalLayout1 to verticalLayout2", function(assert) {
			this.oVerticalLayout1.removeContent(this.oButton1);
			assert.deepEqual(
				this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout1.propagateMetadata(this.oButton1).aggregations.content,
				"then initially verticalLayout1 property is propagated"
			);
			this.oHorizontalLayout1.addContent(this.oButton1);
			assert.deepEqual(
				this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout2.propagateMetadata(this.oButton1).aggregations.content,
				"then after move horizontalLayout1 property is propagated"
			);
		});
		QUnit.test("when button2 is moved into verticalLayout1, then removed from it", function(assert) {
			this.oPage.removeContent(this.oButton2);
			this.oVerticalLayout1.addContent(this.oButton2);
			assert.deepEqual(
				this.oButton2Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout1.propagateMetadata(this.oButton2).aggregations.content,
				"then verticalLayout1 property is propagated when the button is moved into it"
			);
			this.oVerticalLayout1.removeContent(this.oButton2);
			this.oPage.insertContent(this.oButton2);
			assert.notOk(
				this.oButton2Overlay.getDesignTimeMetadata().getData().aggregations.content,
				"after removing the button from the layout the 'content' aggregation is no longer on the button DT"
			);
		});
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});