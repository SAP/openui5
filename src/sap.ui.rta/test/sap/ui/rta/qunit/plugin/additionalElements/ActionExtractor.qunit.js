/* global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	ActionExtractor,
	AdditionalElementsUtils,
	ElementDesignTimeMetadata,
	DesignTime,
	OverlayRegistry,
	CommandFactory,
	AdditionalElementsPlugin,
	Bar,
	Button,
	VerticalLayout,
	Log,
	nextUIUpdate,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oDTMetadata = {};

	QUnit.module("Given DesignTime Metadata structures with valid and invalid actions...", {
		beforeEach() {
			this.fnLogErrorStub = sandbox.stub(Log, "error");
			sandbox.stub(ActionExtractor, "_getRevealActions").returns(Promise.resolve());
			sandbox.stub(ActionExtractor, "_getAddViaDelegateActions").returns(Promise.resolve());
			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				parentOverlay: {
					getDesignTimeMetadata() {
						return oDTMetadata;
					}
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getActions is called with DT Metadata containing valid actions", function(assert) {
			oDTMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						dummyAggregation: {
							actions: {
								add: {
									delegate: "addViaDelegateAction"
								},
								reveal: "revealAction"
							}
						}
					}
				}
			});

			ActionExtractor.getActions(true, {});
			assert.notOk(this.fnLogErrorStub.called, "then no error is raised on the log");
		});
	});

	// 	oBar (Bar)
	//  	contentLeft
	//      	[oVisibleLeftButton, oInvisibleLeftButton]
	async function givenBarWithButtons() {
		this.oVisibleLeftButton = new Button({id: "VisibleLeftButton", visible: true, text: "VisibleLeft"});
		this.oInvisibleLeftButton = new Button({id: "InvisibleLeftButton", visible: false, text: "InvisibleLeft"});
		this.oBar = new Bar({
			id: "bar",
			contentLeft: [this.oVisibleLeftButton, this.oInvisibleLeftButton]
		});

		this.oPseudoPublicParent = new VerticalLayout({
			id: "pseudoParent",
			content: [this.oBar],
			width: "100%"
		});

		this.oPseudoPublicParent.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	QUnit.module("Given a bar with a visible and invisible buttons", {
		async before(assert) {
			await givenBarWithButtons.call(this);
			var done = assert.async();

			this.oPlugin = new AdditionalElementsPlugin({
				commandFactory: new CommandFactory()
			});
			this.oDialog = this.oPlugin.getDialog();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPseudoPublicParent],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVisibleLeftButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleLeftButton);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control does not have a change handler for reveal", function(assert) {
			sandbox.stub(this.oPlugin, "hasChangeHandler").resolves(false);

			return this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
			});
		});

		QUnit.test("when the invisible button becomes invalid (destroyed) during the reveal check", function(assert) {
			var oGetRevealActionsStub = sandbox.stub(ActionExtractor, "_getRevealActions");
			oGetRevealActionsStub.callThrough();

			oGetRevealActionsStub.onFirstCall().callsFake(function(...aArgs) {
				var oHasChangeHandlerStub = sandbox.stub(this.oPlugin, "hasChangeHandler");
				oHasChangeHandlerStub.callThrough();
				oHasChangeHandlerStub.onFirstCall().callsFake(function(...aArgs) {
					this.oInvisibleLeftButton.destroy();
					return oHasChangeHandlerStub.wrappedMethod.apply(this.oPlugin, aArgs);
				}.bind(this));
				return oGetRevealActionsStub.wrappedMethod.apply(this, aArgs);
			}.bind(this));

			return this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
