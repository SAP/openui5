/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Bar,
	Button,
	DesignTime,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	ActionExtractor,
	AdditionalElementsPlugin,
	AdditionalElementsUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	let oDTMetadata = {};

	QUnit.module("Given DesignTime Metadata structures with valid and invalid actions...", {
		beforeEach() {
			this.fnLogErrorStub = sandbox.stub(Log, "error");
			sandbox.stub(ActionExtractor, "_getRevealActions").resolves();
			sandbox.stub(ActionExtractor, "_getAddViaDelegateActions").resolves();
			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				parentOverlay: {
					getDesignTimeMetadata() {
						return oDTMetadata;
					}
				}
			});
		},
		afterEach() {
			ActionExtractor.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getActions is called with DT Metadata containing valid actions", async function(assert) {
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

			await ActionExtractor.getActions(true, {});
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
			const done = assert.async();

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
			ActionExtractor.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control does not have a change handler for reveal", async function(assert) {
			sandbox.stub(this.oPlugin, "hasChangeHandler").resolves(false);

			const bIsEditable = await this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true);
			assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
		});

		QUnit.test("when the invisible button becomes invalid (destroyed) during the reveal check", async function(assert) {
			const oGetRevealActionsStub = sandbox.stub(ActionExtractor, "_getRevealActions");
			oGetRevealActionsStub.callThrough();

			oGetRevealActionsStub.onFirstCall().callsFake((...aArgs) => {
				this.oInvisibleLeftButton.destroy();
				return oGetRevealActionsStub.wrappedMethod.apply(this, aArgs);
			});

			const bIsEditable = await this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true);
			assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
