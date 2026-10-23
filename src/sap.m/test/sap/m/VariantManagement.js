sap.ui.define([
	"sap/m/VariantManagement",
	"sap/m/VariantItem",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Input",
	"sap/m/Select",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item"
], (VariantManagement, VariantItem, Page, App, VBox, Text, Button, CheckBox, Table, Column, ColumnListItem, Input, Select, Title, Toolbar, ToolbarSpacer, MessageToast, JSONModel, Item) => {
	"use strict";

	// --- JSON Model Data ---
	const oData = {
		selectedKey: "variant1",
		defaultKey: "variant1",
		variants: [
			{
				key: "variant1",
				title: "Standard",
				visible: true,
				favorite: true,
				executeOnSelect: false,
				sharing: "Public",
				contexts: { role: [] },
				author: "SAP",
				remove: false,
				rename: false,
				changeable: false
			},
			{
				key: "variant2",
				title: "My Custom View",
				visible: true,
				favorite: true,
				executeOnSelect: true,
				sharing: "Private",
				contexts: { role: [] },
				author: "John Doe",
				remove: true,
				rename: true,
				changeable: true
			},
			{
				key: "variant3",
				title: "Compact Layout",
				visible: true,
				favorite: false,
				executeOnSelect: false,
				sharing: "Private",
				contexts: { role: ["ADMIN", "MANAGER"] },
				author: "Jane Smith",
				remove: true,
				rename: true,
				changeable: true
			},
			{
				key: "variant4",
				title: "Manager Report",
				visible: true,
				favorite: true,
				executeOnSelect: false,
				sharing: "Public",
				contexts: { role: ["MANAGER"] },
				author: "Admin",
				remove: true,
				rename: false,
				changeable: false
			}
		]
	};

	const oModel = new JSONModel(oData);

	// --- Lazy Loading: Simulated dynamic variants ---
	// These variants will be loaded dynamically when the Manage Views dialog is opened
	const aDynamicVariants = [
		{
			key: "variantLazy1",
			title: "Lazy Loaded View 1",
			visible: true,
			favorite: false,
			executeOnSelect: false,
			sharing: "Private",
			contexts: { role: [] },
			author: "Dynamic User",
			remove: true,
			rename: true,
			changeable: true
		},
		{
			key: "variantLazy2",
			title: "Lazy Loaded View 2",
			visible: true,
			favorite: true,
			executeOnSelect: false,
			sharing: "Public",
			contexts: { role: ["ADMIN"] },
			author: "Dynamic User",
			remove: true,
			rename: true,
			changeable: true
		}
	];

	let bDynamicVariantsLoaded = false;

	// --- Status Text (shows current selection) ---
	const oStatusText = new Text("statusText", { text: "Selected variant: Standard (variant1)" });

	// --- Lazy Loading Status Text ---
	const oLazyLoadStatusText = new Text("lazyLoadStatusText", {
		text: "Lazy Loading: Not triggered yet. Open 'Manage Views' dialog to load additional variants."
	}).addStyleClass("sapUiSmallMarginTop");

	// --- Mock Roles Component Container ---
	// The VariantManagement control expects _oRolesComponentContainer to be a UI control
	// with getComponentInstance() returning an object that has:
	//   - getSelectedContexts() -> {role: [...]}
	//   - setSelectedContexts({role: [...]})
	//   - hasErrorsAndShowErrorMessage() -> boolean
	// We create a VBox with role checkboxes that duck-types this interface.
	const aAvailableRoles = ["ADMIN", "MANAGER", "USER", "ANALYST", "DEVELOPER"];

	let _iRolesContainerCount = 0;
	const createRolesComponentContainer = () => {
		let _selectedContexts = { role: [] };
		const sPrefix = "roles-" + (_iRolesContainerCount++) + "-";

		// Build UI: a VBox with checkboxes for each available role
		const aCheckBoxes = aAvailableRoles.map((sRole, i) => {
			return new CheckBox(sPrefix + "CB-" + i, {
				text: sRole,
				selected: false,
				select: () => {
					// Update internal state from checkbox selections
					_selectedContexts.role = aCheckBoxes
						.filter((cb) => cb.getSelected())
						.map((cb) => cb.getText());
				}
			});
		});

		const oContainer = new VBox(sPrefix + "container", {
			items: [
				new Text(sPrefix + "hint", { text: "Select roles that should see this variant:" }).addStyleClass("sapUiSmallMarginBottom")
			].concat(aCheckBoxes)
		}).addStyleClass("sapUiSmallMargin");

		// Duck-type the ComponentContainer interface
		oContainer.getComponentInstance = () => {
			return {
				getSelectedContexts: () => {
					return { role: _selectedContexts.role.slice() };
				},
				setSelectedContexts: (mContexts) => {
					_selectedContexts = mContexts || { role: [] };
					const aRoles = (_selectedContexts.role || []);
					aCheckBoxes.forEach((cb) => {
						cb.setSelected(aRoles.indexOf(cb.getText()) >= 0);
					});
				},
				hasErrorsAndShowErrorMessage: () => {
					return false; // no validation errors in this mock
				}
			};
		};

		return oContainer;
	};

	// --- Roles container cleanup ---
	let _oCurrentRolesContainer = null;

	const cleanupRolesDialog = (oVariantManagement) => {
		if (_oCurrentRolesContainer) {
			_oCurrentRolesContainer.destroy();
			_oCurrentRolesContainer = null;
		}
		oVariantManagement.setSupportContexts(false);
	};

	// --- VariantManagement Control ---
	const oVariantManagement = new VariantManagement("variantManagement", {
		selectedKey: "{/selectedKey}",
		defaultKey: "{/defaultKey}",
		supportDefault: true,
		supportFavorites: true,
		supportApplyAutomatically: true,
		supportPublic: true,
		supportContexts: false,
		showSaveAs: true,
		creationAllowed: true,
		// Lazy loading callback: loads additional variants dynamically when Manage Views dialog is opened
		dynamicVariantsLoadedCallback: () => {
			// Simulate async loading with a Promise
			return new Promise((resolve) => {
				oLazyLoadStatusText.setText("Lazy Loading: Loading additional variants... (simulating network delay)");
				setTimeout(() => {
					if (!bDynamicVariantsLoaded) {
						// Add dynamic variants to the model
						const aVariants = oModel.getProperty("/variants");
						aVariants.splice(1, 0, aDynamicVariants[0]);
						aVariants.push(aDynamicVariants[1]);
						oModel.setProperty("/variants", aVariants);
						bDynamicVariantsLoaded = true;

						// Force model refresh to update the management table binding
						oModel.refresh(true);

						oLazyLoadStatusText.setText("Lazy Loading: ✓ Successfully loaded 2 additional variants!");
						MessageToast.show("Lazy loaded 2 additional variants!");
					} else {
						oLazyLoadStatusText.setText("Lazy Loading: ✓ Already loaded (callback called again)");
					}
					resolve();
				}, 1500); // Simulate 1.5 second loading delay
			});
		},
		items: {
			path: "/variants",
			template: new VariantItem({
				key: "{key}",
				title: "{title}",
				visible: "{visible}",
				favorite: "{favorite}",
				executeOnSelect: "{executeOnSelect}",
				sharing: "{sharing}",
				contexts: "{contexts}",
				author: "{author}",
				remove: "{remove}",
				rename: "{rename}",
				changeable: "{changeable}"
			})
		},
		select: (oEvent) => {
			const sKey = oEvent.getParameter("key");
			const aVariants = oModel.getProperty("/variants");
			const oSelected = aVariants.find((v) => v.key === sKey);
			const sTitle = oSelected ? oSelected.title : sKey;
			oStatusText.setText("Selected variant: " + sTitle + " (" + sKey + ")");
			oVariantManagement.setModified(false);
			MessageToast.show("Variant selected: " + sTitle);
		},
		save: (oEvent) => {
			const oParams = oEvent.getParameters();
			oVariantManagement.setModified(false);
			MessageToast.show("Save triggered \u2013 Name: " + (oParams.name || "(default)") + ", overwrite: " + !!oParams.overwrite);

			if (!oParams.overwrite) {
				// "Save As": add a new variant to the model
				const aVariants = oModel.getProperty("/variants");
				const sNewKey = "variant" + (aVariants.length + 1);
				aVariants.push({
					key: sNewKey,
					title: oParams.name,
					visible: true,
					favorite: !!oParams.favorite,
					executeOnSelect: !!oParams.execute,
					sharing: oParams["public"] ? "Public" : "Private",
					contexts: oParams.contexts || { role: [] },
					author: "Current User",
					remove: true,
					rename: true,
					changeable: true
				});
				oModel.setProperty("/variants", aVariants);
				oModel.setProperty("/selectedKey", sNewKey);
				oStatusText.setText("Selected variant: " + oParams.name + " (" + sNewKey + ")");
			}
		},
		manage: (oEvent) => {
			const oParams = oEvent.getParameters();
			let aVariants = oModel.getProperty("/variants");

			// Helper to find a variant by key
			const findVariant = (sKey) => aVariants.find((v) => v.key === sKey);

			// Apply deletions
			if (oParams.deleted && oParams.deleted.length) {
				aVariants = aVariants.filter((v) => oParams.deleted.indexOf(v.key) < 0);
			}

			// Apply renames
			if (oParams.renamed) {
				oParams.renamed.forEach((oEntry) => {
					const oVariant = findVariant(oEntry.key);
					if (oVariant) {
						oVariant.title = oEntry.name;
					}
				});
			}

			// Apply favorite changes
			if (oParams.fav) {
				oParams.fav.forEach((oEntry) => {
					const oVariant = findVariant(oEntry.key);
					if (oVariant) {
						oVariant.favorite = oEntry.visible;
					}
				});
			}

			// Apply executeOnSelect changes
			if (oParams.exe) {
				oParams.exe.forEach((oEntry) => {
					const oVariant = findVariant(oEntry.key);
					if (oVariant) {
						oVariant.executeOnSelect = oEntry.exe;
					}
				});
			}

			// Apply default change
			if (oParams.def) {
				oModel.setProperty("/defaultKey", oParams.def);
			}

			// Apply context/role changes
			if (oParams.contexts) {
				oParams.contexts.forEach((oEntry) => {
					const oVariant = findVariant(oEntry.key);
					if (oVariant) {
						oVariant.contexts = oEntry.contexts;
					}
				});
			}

			// Write back the updated variants array
			oModel.setProperty("/variants", aVariants);
			// Force refresh so formatter-based bindings (e.g. Roles column) re-evaluate
			oModel.refresh(true);

			MessageToast.show("Manage changes applied to model");

			// Destroy the manage dialog and clean up roles container
			setTimeout(() => {
				oVariantManagement.destroyManageDialog();
				cleanupRolesDialog(oVariantManagement);
			}, 0);
		},
		manageCancel: () => {
			// Clean up roles container on cancel as well
			setTimeout(() => {
				oVariantManagement.destroyManageDialog();
				cleanupRolesDialog(oVariantManagement);
			}, 0);
		}
	});

	// --- Open Manage Dialog Button (with visibility/roles column) ---
	const oOpenManageButton = new Button("openManageBtn", {
		text: "Open Manage Dialog (with Visibility)",
		icon: "sap-icon://action-settings",
		press: () => {
			// Use the openManagementDialog API parameters to pass style class and roles component
			oVariantManagement.setSupportContexts(true);
			_oCurrentRolesContainer = createRolesComponentContainer();
			oVariantManagement.openManagementDialog(true, "sapUiDemoStyleClass", _oCurrentRolesContainer);
		}
	});

	// --- Open SaveAs Dialog Button (with roles information) ---
	const oOpenSaveAsButton = new Button("openSaveAsBtn", {
		text: "Open SaveAs Dialog (with Roles)",
		icon: "sap-icon://save",
		press: () => {
			// Use the openSaveAsDialog API parameters to pass style class and roles component
			oVariantManagement.setSupportContexts(true);
			_oCurrentRolesContainer = createRolesComponentContainer();
			oVariantManagement.openSaveAsDialog("sapUiDemoStyleClass", _oCurrentRolesContainer);
		}
	});

	// --- Dirty Button ---
	const oDirtyButton = new Button("dirtyButton", {
		text: "Mark Variant as Modified",
		press: () => {
			oVariantManagement.setModified(true);
			MessageToast.show("Variant marked as dirty (modified)");
		}
	});

	// --- Reset Lazy Loading Button ---
	const oResetLazyLoadButton = new Button("resetLazyLoadBtn", {
		text: "Reset Lazy Loading Demo",
		icon: "sap-icon://refresh",
		press: () => {
			// Remove lazy-loaded variants
			const aVariants = oModel.getProperty("/variants");
			const aFiltered = aVariants.filter((v) => !v.key.startsWith("variantLazy"));
			oModel.setProperty("/variants", aFiltered);
			bDynamicVariantsLoaded = false;
			oLazyLoadStatusText.setText("Lazy Loading: Reset complete. Open 'Manage Views' dialog to load additional variants.");
			MessageToast.show("Lazy loading demo reset - open Manage Views dialog to load variants again");
		}
	});

	// --- Model Data Table ---
	const oDataTable = new Table("dataTable", {
		headerToolbar: new Toolbar("dataTable-toolbar", {
			content: [
				new Title("dataTable-title", { text: "Model Data (editable)" }),
				new ToolbarSpacer("dataTable-spacer"),
				new Button("dataTable-addBtn", {
					text: "Add Variant",
					icon: "sap-icon://add",
					press: () => {
						const aVariants = oModel.getProperty("/variants");
						const sNewKey = "variant" + (aVariants.length + 1);
						aVariants.push({
							key: sNewKey,
							title: "New Variant",
							visible: true,
							favorite: false,
							executeOnSelect: false,
							sharing: "Private",
							contexts: { role: [] },
							author: "Current User",
							remove: true,
							rename: true,
							changeable: true
						});
						oModel.setProperty("/variants", aVariants);
					}
				})
			]
		}),
		columns: [
			new Column("col-key", { header: new Text("colHeader-key", { text: "Key" }), width: "8rem" }),
			new Column("col-title", { header: new Text("colHeader-title", { text: "Title" }), width: "10rem" }),
			new Column("col-author", { header: new Text("colHeader-author", { text: "Author" }), width: "8rem" }),
			new Column("col-sharing", { header: new Text("colHeader-sharing", { text: "Sharing" }), width: "7rem" }),
			new Column("col-visible", { header: new Text("colHeader-visible", { text: "Visible" }), width: "5rem" }),
			new Column("col-favorite", { header: new Text("colHeader-favorite", { text: "Favorite" }), width: "5.5rem" }),
			new Column("col-executeOnSelect", { header: new Text("colHeader-executeOnSelect", { text: "Execute On Select" }), width: "5.5rem" }),
			new Column("col-rename", { header: new Text("colHeader-rename", { text: "Rename" }), width: "5rem" }),
			new Column("col-changeable", { header: new Text("colHeader-changeable", { text: "Changeable" }), width: "5.5rem" }),
			new Column("col-remove", { header: new Text("colHeader-remove", { text: "Remove" }), width: "5rem" }),
			new Column("col-roles", { header: new Text("colHeader-roles", { text: "Roles" }), width: "10rem" }),
			new Column("col-actions", { header: new Text("colHeader-actions", { text: "Actions" }), width: "5rem" })
		],
		items: {
			path: "/variants",
			template: new ColumnListItem("dataTable-row", {
				cells: [
					new Input("cell-key", { value: "{key}", editable: false }),
					new Input("cell-title", { value: "{title}" }),
					new Input("cell-author", { value: "{author}" }),
					new Select("cell-sharing", {
						selectedKey: "{sharing}",
						items: [
							new Item("cell-sharing-public", { key: "Public", text: "Public" }),
							new Item("cell-sharing-private", { key: "Private", text: "Private" })
						]
					}),
					new CheckBox("cell-visible", { selected: "{visible}" }),
					new CheckBox("cell-favorite", { selected: "{favorite}" }),
					new CheckBox("cell-executeOnSelect", { selected: "{executeOnSelect}" }),
					new CheckBox("cell-rename", { selected: "{rename}" }),
					new CheckBox("cell-changeable", { selected: "{changeable}" }),
					new CheckBox("cell-remove", { selected: "{remove}" }),
					new Text("cell-roles", { text: { path: "contexts", formatter: (mCtx) => {return mCtx && mCtx.role && mCtx.role.length > 0 ? mCtx.role.join(", ") : "Unrestricted";} } }),
					new Button("cell-deleteBtn", {
						icon: "sap-icon://delete",
						type: "Transparent",
						press: (oEvent) => {
							const sPath = oEvent.getSource().getBindingContext().getPath();
							const nIndex = parseInt(sPath.split("/").pop());
							const aVariants = oModel.getProperty("/variants");
							aVariants.splice(nIndex, 1);
							oModel.setProperty("/variants", aVariants);
						}
					})
				]
			})
		}
	});

	// --- Page Layout ---
	const oPage = new Page("page", {
		title: "sap.m.VariantManagement \u2013 JSONModel Sample with Lazy Loading",
		content: [
			new VBox("layout", {
				items: [
					oVariantManagement,
					oOpenManageButton,
					oOpenSaveAsButton,
					oDirtyButton,
					oResetLazyLoadButton,
					oStatusText,
					oLazyLoadStatusText
				],
				alignItems: "Start"
			}).addStyleClass("sapUiMediumMargin"),
			oDataTable
		]
	});

	oPage.setModel(oModel);
	new App("app", { pages: [oPage] }).placeAt("content");
});