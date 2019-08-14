sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover"
], function(Controller, View, JSONModel, Popover) {
	"use strict";

	var aDateNodes = ["dueDate","createdAt","lastChangedAt", "completedAt", "completedAt"];

	function createDate(o, key, ob) {
		if ( o !== null && typeof o == "object" ) {
			if (!Array.isArray(o)) {
				for (var n in o) {
					createDate(o[n], n, o);
				}
			} else {
				for (var i = 0; i < o.length; i++) {
					createDate(o[i], i, o);
				}
			}
		} else if (aDateNodes.indexOf(key) > -1 && typeof o === "string") {
			ob[key] = new Date(o);
		}
	}

	return Controller.extend("sap.my.test.widget.wfviz.controller.Widget", {
		selectedHTask: -1,
		selectedVTask: [],
		onInit: function() {
			this._configuration = this.getView().getModel("sap.widget").getData() || {};
			this._wfdata = this._configuration.sample || {};
			createDate(this._wfdata, null, null);
			var oModel = new JSONModel(this._wfdata);
			this.selectedHTask = this.getLastPossibleTaskIndex(this._wfdata.tasks);
			this.selectedVTask = new Array(this._wfdata.tasks.length);
			for (var i = 0; i < this._wfdata.tasks.length; i++) {
				var oTask = this._wfdata.tasks[i];
				if (oTask.form && !oTask.tasks) {
					oTask.tasks = [oTask];
				}
				if (oTask.tasks) {
					this.selectedVTask[i] = this.getLastPossibleTaskIndex(oTask.tasks);
				}
			}
			var oCurrentModel = new JSONModel(this._wfdata.tasks[this.selectedHTask]);
			this.getView().setModel(oModel, "wfdata");
			this.getView().setModel(oCurrentModel, "wfdatacurrent");
		},
		getLastPossibleTaskIndex: function(aTasks) {
			if (aTasks) {
				var i;
				for (i = 0; i < aTasks.length; i++) {
					if (aTasks[i].status === "READY" && !aTasks[i].completedAt) {
						return i;
					}
				}
				return -1;
			}
			return -2;
		},
		selectVTask: function(iIndex) {
			//change the VTask to the last task that is ready
			this.selectedHTask = iIndex;
			var oControl = this.byId("hsteps");
			oControl.setSelectedIndex(this.selectedHTask);
			var oModel = this.getView().getModel("wfdatacurrent");
			var oVData = this._wfdata.tasks[this.selectedHTask];
			if (oVData.tasks) {
				oModel.setData(oVData);
			} else {
				oVData.tasks = [oVData];
				oModel.setData(oVData);
			}
		},
		onHorizontalBarSelectionChange: function(oEvent) {
			this.selectVTask(oEvent.getParameter("index"));
		},
		onVerticalLaneSelectionChange: function(oEvent) {
			this.selectedVTask[this.selectedHTask] = oEvent.getParameter("index");
			var oControl = oEvent.getSource();
			oControl.setSelectedIndex(this.selectedVTask[this.selectedHTask]);
		},
		selectedHIndexFormatter: function(oData) {
			return this.selectedHTask;
		},
		selectedVIndexFormatter: function(oData) {
			return this.selectedVTask[this.selectedHTask];
		},
		stepStatusFormatter: function(oData) {
			var bReady = oData.status === "READY";
			var dCompletedAt = oData.completedAt;
			if (bReady && dCompletedAt) {
				return "Completed";
			} else if (bReady) {
				return "Ready";
			} else if (!bReady) {
				return "Disabled";
			}
		},
		stepVContentFormatter: function(oData) {
			var oModel = this.getView().getModel("wfdatacurrent");
			var aTasks = oModel.getProperty("/tasks");
			var iIndex = aTasks.indexOf(oData);
			var oTaskData = aTasks[iIndex];
			return function() {
				if (oTaskData) {
					return this.getStepContent(iIndex, oTaskData);
				}
			}.bind(this);
		},
		stepVDescriptionFormatter: function(oData) {
			if (oData.completedAt && oData.message) {
				return oData.message;
			}
			if (oData.description) {
				return oData.description;
			}
		},
		openComplexVStepContent: function(iIndex, oSource) {
			var oControl = this.byId("stepVComplex" + iIndex + "_" + this.selectedHTask);
			var oModel = this.getView().getModel("wfdatacurrent");
			var aTasks = oModel.getProperty("/tasks");
			var oTaskData = aTasks[iIndex];
			if (!this.oPopover) {
				this.oPopover = new Popover({
					modal: true,
					placement: "PreferredTopOrFlip",
					afterClose: function() {
						this.oPopover.removeAllContent();
					}.bind(this)
				});
				this.getView().addDependent(this.oPopover);
			}
			this.oPopover.setTitle(oTaskData.subject);
			var oDefModel;
			if (!oControl) {
				oDefModel = new JSONModel(oTaskData);
				View.create({
					async : true,
					preprocessors : {
						xml : {
							bindingContexts : {
								meta : oDefModel.createBindingContext("/form"),
								main : oDefModel.createBindingContext("/form")
							},
							models : {
								meta : oDefModel
							}
						}
					},
				type : "XML",
				id: this.getView().createId("stepVComplex" + iIndex + "_" + this.selectedHTask),
				viewName : "sap.my.test.widget.wfviz.view.ComplexFormTemplate"
				}).then(
					function (oTemplateView) {
						this.getView().addDependent(oTemplateView);
						this.oPopover.addContent(oTemplateView);
						oTemplateView.setModel(new JSONModel({}), "context");
						this.oPopover.openBy(oSource.getParent());
					}.bind(this)
				);
			} else {
				this.oPopover.addContent(oControl);
				this.oPopover.openBy(oSource.getParent());
			}
		},
		getStepContent: function(iIndex, oTaskData) {
			var oControl = this.byId("stepV" + iIndex + "_" + this.selectedHTask);
			var oDefModel;
			if (!oControl) {
				if (oTaskData.form && (oTaskData.form.content && oTaskData.form.content.length < 3) || !oTaskData.form.content) {
					//inplace forms should have only 2 fields
					//create the simple form content dynamically
					oDefModel = new JSONModel(oTaskData);
					View.create({
						async : true,
						preprocessors : {
							xml : {
								bindingContexts : {
									meta : oDefModel.createBindingContext("/form")
								},
								models : {
									meta : oDefModel
								}
							}
						},
					type : "XML",
					id: this.getView().createId("stepV" + iIndex + "_" + this.selectedHTask),
					viewName : "sap.my.test.widget.wfviz.view.SimpleFormTemplate"
					}).then(
						function (oTemplateView) {
							this.getView().addDependent(oTemplateView);
							this.byId("vsteps").rerender();
						}.bind(this)
					);
				} else if (oTaskData.form && oTaskData.form.decisions) {
					//inplace forms should have only 2 fields
					//create the simple form content dynamically
					var aContent = oTaskData.form.content,
						aNewContent = [],
						bTooManyMandatoryFields = false;
					if (aContent) {
						for (var i = 0; i < aContent.length; i++) {
							var o = aContent[i];
							if (o && o.constraints && o.constraints.required) {
								aNewContent.push(o);
							}
							if (aNewContent.length > 2) {
								bTooManyMandatoryFields = true;
								break;
							}
						}
					}
					if (bTooManyMandatoryFields) {
						oDefModel = new JSONModel({
							form:{
								dwp: {
									"type" : "button",
									"required" : true,
									"index": iIndex,
									"text": "Enter form data"
								},
								content: [
									{
										"id": "dwpMessage",
										"text": "Please fill out the required form data.",
										"readOnly": false
									}
								],
								decisions: oTaskData.form.decisions
							}
						});
					} else {
						oDefModel = new JSONModel({
							form:{
								dwp: {
									"type" : "button",
									"required" : false,
									"text": "Additional form data",
									"index": iIndex
								},
								content: aNewContent,
								decisions: oTaskData.form.decisions
							}
						});
					}

					View.create({
						async : true,
						preprocessors : {
							xml : {
								bindingContexts : {
									meta : oDefModel.createBindingContext("/form")
								},
								models : {
									meta : oDefModel
								}
							}
						},
					type : "XML",
					id: this.getView().createId("stepV" + iIndex + "_" + this.selectedHTask),
					viewName : "sap.my.test.widget.wfviz.view.SimpleFormTemplate"
					}).then(
						function (oTemplateView) {
							this.getView().addDependent(oTemplateView);
							this.byId("vsteps").rerender();
						}.bind(this)
					);
				}
			}
			return oControl;
		},
		updateContext: function() {
			return null;
		}
	});
});
