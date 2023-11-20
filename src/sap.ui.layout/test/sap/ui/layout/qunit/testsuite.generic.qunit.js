sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/test/generic/GenericTestCollection"
], function(Core, GenericTestCollection) {
	"use strict";

	const fnRequire = function(aModules) {
		return Core.ready().then(() => {
			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require(aModules, function() {
					fnResolve(arguments);
				});
			});
		});
	};

	const oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.layout",
		objectCapabilities: {
			"sap.ui.layout.BlockLayoutRow": {
				rendererHasDependencies: true // renderer expects a parent with fn getBackground
			},
			"sap.ui.layout.form.ResponsiveGridLayoutPanel": {
				moduleName: "sap/ui/layout/form/ResponsiveGridLayout",
				rendererHasDependencies: true
			},
			"sap.ui.layout.form.ResponsiveLayoutPanel": {
				moduleName: "sap/ui/layout/form/ResponsiveLayout"
			},
			"sap.ui.layout.form.SimpleForm": {
				create: async (SimpleForm, mSettings) => {
					const aModules = await fnRequire(["sap/ui/core/Title", "sap/m/Label", "sap/m/Input", "sap/ui/layout/form/ColumnLayout"]);
					const Title = aModules[0];
					const Label = aModules[1];
					const Input = aModules[2];
					const sId = mSettings && mSettings.id;
					return new SimpleForm(sId, {
						layout: 'ColumnLayout',
						title: "Title",
						content: [
							new Title(sId + "T1", {text: "Title 1"}),
							new Label(sId + "L1", {text: "Label 1"}),
							new Input(sId + "I1", {}),
							new Label(sId + "L2", {text: "Label 2"}),
							new Input(sId + "I2", {}),
							new Title(sId + "T2", {text: "Title 2"}),
							new Label(sId + "L3", {text: "Label 3"}),
							new Input(sId + "I3", {}),
							new Label(sId + "L4", {text: "Label 4"}),
							new Input(sId + "I4", {})
						]
					});
				},
				properties: {
					layout: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				aggregations: {
					content: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // don't use senseless content
					title: GenericTestCollection.ExcludeReason.NotChangeableAfterInit, // we want to test creation of internal control
					toolbar: GenericTestCollection.ExcludeReason.NotChangeableAfterInit // we want to test with title
				}
			},
			"sap.ui.layout.form.Form": {
				create: async (Form, mSettings) => {
					const sId = mSettings && mSettings.id;
					const aModules = await fnRequire(["sap/ui/layout/form/FormLayout"]);
					const oLayout = new aModules[0](sId ? sId + "-Layout" : undefined);
					return _createForm(sId, oLayout);
				},
				aggregations: {
					layout: GenericTestCollection.ExcludeReason.NotChangeableAfterInit, // don't change layout
					title: GenericTestCollection.ExcludeReason.NotChangeableAfterInit, // we want to test creation of internal control
					toolbar: GenericTestCollection.ExcludeReason.NotChangeableAfterInit // we want to test with title
				}
			},
			"sap.ui.layout.form.FormLayout": {
				create: async (FormLayout, mSettings) => {
					const oLayout = new FormLayout(mSettings);
					await _createForm(oLayout.getId() + "Form", oLayout);
					return oLayout;
				}
			},
			"sap.ui.layout.form.ColumnLayout": {
				create: async (ColumnLayout, mSettings) => {
					const oLayout = new ColumnLayout(mSettings);
					await _createForm(oLayout.getId() + "Form", oLayout);
					return oLayout;
				}
			},
			"sap.ui.layout.form.GridLayout": {
				create: async (GridLayout, mSettings) => {
					const oLayout = new GridLayout(mSettings);
					await _createForm(oLayout.getId() + "Form", oLayout);
					return oLayout;
				}
			},
			"sap.ui.layout.form.ResponsiveLayout": {
				create: async (ResponsiveLayout, mSettings) => {
					const oLayout = new ResponsiveLayout(mSettings);
					await _createForm(oLayout.getId() + "Form", oLayout);
					return oLayout;
				}
			},
			"sap.ui.layout.form.ResponsiveGridLayout": {
				create: async (ResponsiveGridLayout, mSettings) => {
					const oLayout = new ResponsiveGridLayout(mSettings);
					await _createForm(oLayout.getId() + "Form", oLayout);
					return oLayout;
				}
			}
		}
	});

	async function _createForm(sId, oLayout) {
		const aModules = await fnRequire(["sap/ui/layout/form/Form", "sap/ui/layout/form/FormContainer", "sap/ui/layout/form/FormElement", "sap/ui/core/Title", "sap/m/Label", "sap/m/Input", "sap/m/Text", "sap/ui/base/ManagedObjectObserver", "sap/m/library"]);
		const Form = aModules[0];
		const FormContainer = aModules[1];
		const FormElement = aModules[2];
		const Title = aModules[3];
		const Label = aModules[4];
		const Input = aModules[5];
		const Text = aModules[6];
		const ManagedObjectObserver = aModules[7];

		// if Layout destroyed, destroy Form
		new ManagedObjectObserver(function(oChange) {
			const oLayout = oChange.object;
			if (!oLayout._oMyForm.isDestroyStarted()) {
				oLayout._oMyForm.destroy();
			}
			this.disconnect();
		}).observe(oLayout, {
			destroy: true
		});

		const oForm = new Form(sId, {
			title: new Title(sId + "-FormTitle", {text: "Form Title"}),
			editable: true,
			layout: oLayout,
			formContainers: [
				new FormContainer(sId + "-FC1", {
					title: new Title(sId + "-ContainerTitle1", {text: "Container Title 1"}),
					formElements: [
						new FormElement(sId + "-FE1", {
							label: new Label(sId + "L1", {text: "Label 1"}),
							fields: [new Input(sId + "I1"), new Input(sId + "I2")]
						}),
						new FormElement(sId + "-FE2", {
							label: "Label 2",
							fields: [new Text(sId + "T1", {text: "Text"})]
						})
					]
				}),
				new FormContainer(sId + "-FC2", {
					title: "Container Title 2",
					formElements: [
						new FormElement(sId + "-FE3", {
							label: new Label(sId + "L3", {text: "Label 3"}),
							fields: [new Input(sId + "I3"), new Input(sId + "I4")]
						}),
						new FormElement(sId + "-FE4", {
							label: "Label 4",
							fields: [new Text(sId + "T2", {text: "Text"})]
						})
					]
				})
			]
		});

		oLayout._oMyForm = oForm; // to destroy later on

		return oForm;
	}

	return oConfig;
});