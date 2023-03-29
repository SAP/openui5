sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	'sap/ui/core/mvc/Controller',
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/thirdparty/sinon-4"
], function(
	Core,
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
		onInit: function() {
			ContextBasedAdaptationsAPI.clearInstances();
			this.oRolesModel = new JSONModel();
			this.oRolesModel.loadData("./model/roles.json", "", false);
			this.sandbox = sinon.createSandbox();
			this.oToolbar = new Adaptation({
				textResources: Core.getLibraryResourceBundle("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					},
					rootControl: new Control()
				}
			});
			this.oManageAdaptationsDialog = new ManageAdapationsDialog({ toolbar: this.oToolbar });
			this.oAddAdaptationsDialog = new AddAdaptationDialog({ toolbar: this.oToolbar });
			var oTempAdaptationsModel = new JSONModel();
			oTempAdaptationsModel.loadData("./model/adaptations.json", "", false);
			this.oModel = ContextBasedAdaptationsAPI.createModel(oTempAdaptationsModel.getProperty("/adaptations"));
		},
		onManageAdaptations: function() {
			setStubsWithData.call(this);
			this.oManageAdaptationsDialog.openManageAdaptationDialog();
		},
		onManageAdaptationsWithBackendError: function() {
			setStubWithError.call(this);
			this.oManageAdaptationsDialog.openManageAdaptationDialog();
		},
		onAddAdaptation: function() {
			setStubsWithData.call(this);
			this.oAddAdaptationsDialog.openAddAdaptationDialog();
		},
		onAddAdaptationWithBackendError: function() {
			setStubWithError.call(this);
			this.oAddAdaptationsDialog.openAddAdaptationDialog();
		}
	});

	function initStubs() {
		this.createStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "create");
		this.loadStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "load");
		this.reorderStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "reorder");
		this.getContextsStub = this.sandbox.stub(WriteStorage, "getContexts");
		this.loadContextDescriptionStub = this.sandbox.stub(WriteStorage, "loadContextDescriptions");
		this.getAdaptationsModelStub = this.sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(this.oModel);
	}

	function setStubsWithData() {
		this.sandbox.restore();
		initStubs.call(this);
		this.getContextsStub.callsFake(function(args) {
			if (Object.keys(args).includes("$filter")) {
				var filterRoles = this.oRolesModel.getData().values.filter(function(element) {
					if (element.id.toLowerCase().includes(args["$filter"].toLowerCase()) ||
						element.description.toLowerCase().includes(args["$filter"].toLowerCase())) {
						return element;
					}
				});
				return Promise.resolve({ values: filterRoles, lastHitReached: true });
			}
			return Promise.resolve(this.oRolesModel.getData());
		}.bind(this));

		this.loadContextDescriptionStub.callsFake(function(mPropertyBag) {
			var aFilterRoles = this.oRolesModel.getProperty("/values").filter(function(oElement) {
				for (var i = 0; i < mPropertyBag["flexObjects"].role.length; i++) {
					var role = mPropertyBag["flexObjects"].role[i];
					if (role.toLowerCase() === oElement.id.toLowerCase()) {
						return oElement;
					}
				}
			});
			return Promise.resolve({ role: aFilterRoles });
		});

		this.loadStub.callsFake(function() {
			var oAdaptationsModel = new JSONModel();
			oAdaptationsModel.loadData("./model/adaptations.json", "", false);
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
					if (element.id.toLowerCase().includes(args["$filter"].toLowerCase()) ||
						element.description.toLowerCase().includes(args["$filter"].toLowerCase())) {
						return element;
					}
				});
				return Promise.resolve({ values: filterRoles, lastHitReached: true });
			}
			return Promise.resolve(this.oRolesModel.getData());
		}.bind(this));

		this.loadContextDescriptionStub.callsFake(function(mPropertyBag) {
			var aFilterRoles = this.oRolesModel.getProperty("/values").filter(function(oElement) {
				for (var i = 0; i < mPropertyBag["flexObjects"].role.length; i++) {
					var role = mPropertyBag["flexObjects"].role[i];
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