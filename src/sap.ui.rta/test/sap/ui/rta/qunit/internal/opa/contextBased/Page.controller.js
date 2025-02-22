sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/Control",
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/thirdparty/sinon-4"
], function(
	Lib,
	Control,
	Controller,
	Layer,
	WriteStorage,
	ContextBasedAdaptationsAPI,
	JSONModel,
	Adaptation,
	ManageAdapationsDialog,
	AddAdaptationDialog,
	sinon
) {
	"use strict";

	var PageController = Controller.extend("sap.ui.rta.contextBased.Page", {
		onInit() {
			this.oRolesModel = new JSONModel();
			this.sandbox = sinon.createSandbox();
			this.bDataInitialized = false;
			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					},
					rootControl: new Control()
				}
			});
		},
		onManageAdaptations() {
			(async () => {
				await setStubsWithData.call(this);
				this.oManageAdaptationsDialog.openManageAdaptationDialog();
			})();
		},
		onManageAdaptationsWithOnlyOneAdaptation() {
			(async () => {
				await setStubsWithData.call(this, "./model/onlyOneAdaptation.json");
				this.oManageAdaptationsDialog.openManageAdaptationDialog();
			})();
		},
		onManageAdaptationsWithTwoAdaptations() {
			(async () => {
				await setStubsWithData.call(this, "./model/twoAdaptations.json");
				this.oManageAdaptationsDialog.openManageAdaptationDialog();
			})();
		},
		onManageAdaptationsWithBackendError() {
			(async () => {
				await setStubWithError.call(this);
				this.oManageAdaptationsDialog.openManageAdaptationDialog();
			})();
		},
		onAddAdaptation() {
			(async () => {
				await setStubsWithData.call(this);
				this.oAddAdaptationsDialog.openAddAdaptationDialog();
			})();
		},
		onAddAdaptationWithBackendError() {
			(async () => {
				await setStubWithError.call(this);
				this.oAddAdaptationsDialog.openAddAdaptationDialog();
			})();
		}
	});

	function initStubs() {
		this.createStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "create");
		this.loadStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "load");
		this.reorderStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "reorder");
		this.getContextsStub = this.sandbox.stub(WriteStorage, "getContexts");
		this.loadContextDescriptionStub = this.sandbox.stub(WriteStorage, "loadContextDescriptions");
		this.getAdaptationsModelStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(this.oModel);
		this.removeStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "remove");
	}

	async function initData() {
		if (!this.bDataInitialized) {
			ContextBasedAdaptationsAPI.clearInstances();
			await this.oRolesModel.loadData("./model/roles.json", "");
			this.oManageAdaptationsDialog = new ManageAdapationsDialog({ toolbar: this.oToolbar });
			this.oAddAdaptationsDialog = new AddAdaptationDialog({ toolbar: this.oToolbar });
			const oTempAdaptationsModel = new JSONModel();
			await oTempAdaptationsModel.loadData("./model/adaptations.json", "");
			const aAdaptations = oTempAdaptationsModel.getProperty("/adaptations");
			this.oModel = ContextBasedAdaptationsAPI.createModel(aAdaptations, aAdaptations[0], true);
			this.bDataInitialized = true;
		}
	}

	async function setStubsWithData(sAdaptationsDataPath) {
		await initData.call(this);
		this.sandbox.restore();
		initStubs.call(this);
		this.getContextsStub.callsFake(function(args) {
			if (Object.keys(args).includes("$filter")) {
				var filterRoles = this.oRolesModel.getData().values.filter(function(element) {
					if (element.id.toLowerCase().includes(args.$filter.toLowerCase()) ||
						element.description.toLowerCase().includes(args.$filter.toLowerCase())) {
						return element;
					}
				});
				return Promise.resolve({ values: filterRoles, lastHitReached: true });
			}
			return Promise.resolve(this.oRolesModel.getData());
		}.bind(this));

		this.loadContextDescriptionStub.callsFake(function(mPropertyBag) {
			var aFilterRoles = this.oRolesModel.getProperty("/values").filter(function(oElement) {
				for (var i = 0; i < mPropertyBag.flexObjects.role.length; i++) {
					var role = mPropertyBag.flexObjects.role[i];
					if (role.toLowerCase() === oElement.id.toLowerCase()) {
						return oElement;
					}
				}
			});
			return Promise.resolve({ role: aFilterRoles });
		}.bind(this));

		this.loadStub.callsFake(async function() {
			var oAdaptationsModel = new JSONModel();
			var sAdaptationJsonModelPath;
			if (sAdaptationsDataPath === "./model/onlyOneAdaptation.json") {
				sAdaptationJsonModelPath = "./model/onlyOneAdaptation.json";
			} else if (sAdaptationsDataPath === "./model/twoAdaptations.json") {
				sAdaptationJsonModelPath = "./model/twoAdaptations.json";
			} else {
				sAdaptationJsonModelPath = "./model/adaptations.json";
			}
			await oAdaptationsModel.loadData(sAdaptationJsonModelPath, "");
			return Promise.resolve(oAdaptationsModel.getData());
		});

		this.createStub.callsFake(function(mPropertyBag) {
			sinon.assert.match(Object.keys(mPropertyBag).includes("layer"), true);
			sinon.assert.match(mPropertyBag.layer, "CUSTOMER");
			sinon.assert.match(Object.keys(mPropertyBag).includes("contextBasedAdaptation"), true);
			sinon.assert.match(Object.keys(mPropertyBag.contextBasedAdaptation).includes("contexts"), true);
			sinon.assert.match(Object.keys(mPropertyBag.contextBasedAdaptation).includes("priority"), true);
			sinon.assert.match(Object.keys(mPropertyBag.contextBasedAdaptation).includes("title"), true);
			return Promise.resolve();
		});

		this.reorderStub.callsFake(function(mPropertyBag) {
			return Promise.resolve(mPropertyBag);
		});

		this.removeStub.callsFake(function(mPropertyBag) {
			sinon.assert.match(Object.keys(mPropertyBag).includes("layer"), true);
			sinon.assert.match(mPropertyBag.layer, "CUSTOMER");
			sinon.assert.match(Object.keys(mPropertyBag).includes("adaptationId"), true);
			sinon.assert.match(Object.keys(mPropertyBag).includes("control"), true);
			return Promise.resolve();
		});
	}

	function setStubWithError() {
		this.sandbox.restore();
		initStubs.call(this);
		this.loadStub.rejects();
		this.reorderStub.rejects();
		this.createStub.rejects();

		this.getContextsStub.callsFake(function(args) {
			if (Object.keys(args).includes("$filter")) {
				var filterRoles = this.oRolesModel.getData().values.filter(function(element) {
					if (element.id.toLowerCase().includes(args.$filter.toLowerCase()) ||
						element.description.toLowerCase().includes(args.$filter.toLowerCase())) {
						return element;
					}
				});
				return Promise.resolve({ values: filterRoles, lastHitReached: true });
			}
			return Promise.resolve(this.oRolesModel.getData());
		}.bind(this));

		this.loadContextDescriptionStub.callsFake(function(mPropertyBag) {
			var aFilterRoles = this.oRolesModel.getProperty("/values").filter(function(oElement) {
				for (var i = 0; i < mPropertyBag.flexObjects.role.length; i++) {
					var role = mPropertyBag.flexObjects.role[i];
					if (role.toLowerCase() === oElement.id.toLowerCase()) {
						return oElement;
					}
				}
			});
			return Promise.resolve({ role: aFilterRoles });
		});
	}
	return PageController;
});