/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/core/util/File"
], function (constants, storage, SharedModel, File) {
	"use strict";

	var fnNumericSortAscending = function fnNumericSortAscending(a, b) {
		return a - b;
	};

	var SelectionUtils = {
		model: SharedModel,
		/**
		 * @param {Object} oRow the row to check
		 * @returns {boolean} true if the row is a library
		 */
		isRowAGroup: function (oRow) {
			if (!oRow) {
				return false;
			}

			var oRowModel = oRow.getModel();

			if (!oRowModel) {
				return false;
			}

			var oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath();

			return oRowModel.getProperty(sPath + "/rules") !== undefined;
		},



		/**
		 * Calculates the indices of the child nodes of the library row.
		 *
		 * @param {Object} oRow from which the rules will be taken
		 * @param {int} iRowIndex the index of the library row
		 * @returns {Object | null} a range to be used for selection
		 */
		getChildIndicesRange: function (oRow, iRowIndex) {
			var oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				iFrom = iRowIndex + 1,
				iTo = iRowIndex,
				sKey;

			for (sKey in mRules) {
				if (Number.isInteger(Number.parseInt(sKey, 10))) {
					iTo++;
				}
			}

			if (iFrom > iTo) {
				return null;
			}

			return {
				from: iFrom,
				to: iTo
			};
		},

		/**
		 * Selects/Deselects all rules and libraries in the model and stores the selection.
		 *
		 * @param {boolean} bSelectAll Wether to select or deselect all rows
		 */
		selectAllRows: function (bSelectAll) {
			var oModel = this.model,
				oTreeViewModel = oModel.getProperty("/treeViewModel/"),
				oLibrary;

			// Set selected flag for each library node in the TreeTable
			for (var i in oTreeViewModel) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					oModel.setProperty("/treeViewModel/" + i + "/selected", bSelectAll);
					oLibrary = oModel.getProperty("/treeViewModel/" + i);

					// Set selected flag for each rule node in the TreeTable
					for (var k in oLibrary) {
						if (Number.isInteger(Number.parseInt(k, 10))) {
							oModel.setProperty("/treeViewModel/" + i + "/" + k + "/selected", bSelectAll);
						}
					}
				}
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},

		/**
		 * From the rule row index search for the library in the list.
		 * After it finds the correct library it selects/deselects it and update the model.
		 *
		 * @param {int} sPath The row index of the selected rule
		 * @param {boolean} bSelected If the rule row was selected or deselected
		 */
		updateLibrarySelection: function (sPath, bSelected) {
			var oModel = this.model,
				iRowIndex = this.getRowContextIndexByPath(sPath),
				oLibrary,
				rowContext;

			// Find the library object and index from the selected rule index
			while (iRowIndex >= 0) {
				rowContext = this.treeTable.getContextByIndex(iRowIndex);
				sPath = rowContext.getPath();
				oLibrary = oModel.getProperty(sPath);

				if (oLibrary.type === "lib") {
					break;
				}

				iRowIndex--;
			}

			// Select / Deselect the library row
			if (bSelected) {
				for (var i in oLibrary) {
					if (Number.isInteger(Number.parseInt(i, 10)) && !oLibrary[i].selected) {
						return;
					}
				}

				this.treeTable.addSelectionInterval(iRowIndex, iRowIndex);
			} else {
				this.treeTable.removeSelectionInterval(iRowIndex, iRowIndex);
			}

			oModel.setProperty(sPath + "/selected", bSelected);
		},

		updateTreeViewTempRulesSelection: function (treeTableTempLibrary) {
			this.treeTable.expand(0);

			var bAllSelected = true;

			for (var ruleIndex in treeTableTempLibrary) {

				var iRuleIndex = Number.parseInt(ruleIndex, 10);

				if (!Number.isInteger(iRuleIndex)) {
					continue;
				}

				iRuleIndex++;

				var rule = treeTableTempLibrary[ruleIndex];

				var bMatchingSelectionInfo = false;
				var persistedSelectedRules = storage.getSelectedRules();

				for (var i = 0; i < persistedSelectedRules.length; i++) {
					var selection = persistedSelectedRules[i];
					if (rule.id === selection.ruleId && rule.libName === selection.libName) {
						bMatchingSelectionInfo = true;
						break;
					}
				}

				if (bMatchingSelectionInfo) {
					this.treeTable.addSelectionInterval(iRuleIndex, iRuleIndex);
				} else {
					bAllSelected = false;
					this.treeTable.removeSelectionInterval(iRuleIndex, iRuleIndex);
				}
			}

			if (bAllSelected) {
				this.model.setProperty("/treeViewModel/0/selected", true);
				this.treeTable.addSelectionInterval(0, 0);
			}
		},

		/**
		 * Finds the index of the row, which matches a specific path.
		 *
		 * @param {String} sPath model path
		 * @returns {int} the index of the row, which matches the path
		 */
		getRowContextIndexByPath: function (sPath) {
			var iRowIndex = 0,
				oRowContext = this.treeTable.getContextByIndex(iRowIndex);

			while (oRowContext) {
				if (oRowContext.getPath() == sPath) {
					return iRowIndex;
				}
				iRowIndex++;
				oRowContext = this.treeTable.getContextByIndex(iRowIndex);
			}
		},

		/**
		 *
		 * Apply "selected" flags to the libraries and rules of the new tree table view model by using the old one.
		 *
		 * @param {Object} oNewTreeModel The new tree table view model which needs to be updated with the "selected" flags
		 */
		_syncSelections: function (oNewTreeModel) {
			// Build an index based on the old TreeViewModel
			var mIndex = this._buildTreeTableIndex(),
				aLibrariesToUpdate = [],
				mLibrariesToUpdate = {},
				mNewIndex;

			// Update the "selected" flag of the new model based on the old one.
			for (var i in oNewTreeModel) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					for (var k in oNewTreeModel[i]) {
						var oRule = mIndex[oNewTreeModel[i][k].id];

						if (Number.isInteger(Number.parseInt(k, 10)) && oRule && oRule.selected) {
							oNewTreeModel[i][k].selected = oRule.selected;

							if (aLibrariesToUpdate.indexOf(oNewTreeModel[i][k].libName) < 0) {
								aLibrariesToUpdate.push(oNewTreeModel[i][k].libName);
							}
						}
					}
				}
			}

			this.model.setProperty("/treeViewModel", oNewTreeModel);

			// Build an index based on the new TreeViewModel
			mNewIndex = this._buildTreeTableIndex();

			aLibrariesToUpdate.forEach(function (sLibName) {
				if (mNewIndex[sLibName]) {
					mLibrariesToUpdate[sLibName] = mNewIndex[sLibName];
				}
			});

			// Check for newly loaded libraries and add them to the map for selection update.
			for (var sKey in mNewIndex) {
				if (mNewIndex[sKey].type === "lib" && !mIndex[sKey]) {
					mLibrariesToUpdate[sKey] = mNewIndex[sKey];
				}
			}

			this.updateLibrariesSelection(mLibrariesToUpdate);
		},

		/**
		 * For every passed library check if it's rules are selected. If they are, select the row of the library.
		 *
		 * @param {Object} mLibrariesToUpdate A map with the libraries which row selection should be checked
		 */
		updateLibrariesSelection: function (mLibrariesToUpdate) {
			var oModel = this.model,
				oLibrary,
				bLibrarySelected;

			for (var sLibName in mLibrariesToUpdate) {
				oLibrary = oModel.getProperty(mLibrariesToUpdate[sLibName].path);
				bLibrarySelected = true;

				for (var i in oLibrary) {
					if (Number.isInteger(Number.parseInt(i, 10))) {
						if (!oLibrary[i].selected) {
							bLibrarySelected = false;
							break;
						}
					}
				}

				this.updateLibrarySelection(mLibrariesToUpdate[sLibName].path, bLibrarySelected);
			}
		},

		/**
		 * Creates the initial selection of the TreeTable rows.
		 *
		 * @param {boolean} bInitialLoading Signifies wether this is executed on initial load
		 */
		initializeSelection: function (bInitialLoading) {
			var bPersistingSettings = this.model.getProperty("/persistingSettings"),
				oModel = this.model,
				mIndex = {},
				mLibrariesToUpdate = [],
				aSelectedRules;

			if (bPersistingSettings) {
				aSelectedRules = storage.getSelectedRules() || [];

				if (aSelectedRules.length === 0) {
					return;
				}

				mIndex = this._buildTreeTableIndex();

				aSelectedRules.forEach(function (oRuleDescriptor) {
					var oRuleInfo = mIndex[oRuleDescriptor.ruleId];

					if (oRuleInfo) {
						oModel.setProperty(oRuleInfo.path + "/selected", true);

						this.treeTable.addSelectionInterval(oRuleInfo.index, oRuleInfo.index);

						if (mIndex[oRuleInfo.libName]) {
							mLibrariesToUpdate[oRuleInfo.libName] = mIndex[oRuleInfo.libName];
						}
					}
				}, this);

				// Only update the libraries which have selected rules.
				this.updateLibrariesSelection(mLibrariesToUpdate);
			} else if (bInitialLoading) {
				this.treeTable.selectAll();
			}
		},

		/**
		 * Workaround for temp rule issue method
		 */
		initializeModelSelection: function () {
			var oTreeViewModel = this.model.getProperty("/treeViewModel");
			var aRuleSelections = storage.getSelectedRules();
			var oTreeTable = this.treeTable;

			oTreeTable.expandToLevel(1);

			var i = -1;
			Object
				.keys(oTreeViewModel)

				.map(function (sNum) {
					return Number.parseInt(sNum, 10);
				})
				.sort(fnNumericSortAscending)

				.forEach(function (sLibKey, iLibIndex) {
					i += 1;

					var iTableLibIndex = i;
					var bAllSelected = true;

					Object
						.keys(oTreeViewModel[sLibKey])
						// we first need to get the numeric keys in the library, i.e. rules
						.filter(function (sRuleKeyToFilter) {
							return Number.isInteger(Number.parseInt(sRuleKeyToFilter, 10));
						})

						.map(function (sNum) {
							return Number.parseInt(sNum, 10);
						})
						.sort(fnNumericSortAscending)

						.forEach(function (sRuleKey, iRuleIndex) {
							i += 1;

							var oRule = oTreeViewModel[sLibKey][sRuleKey];

							aRuleSelections.forEach(function (oRuleSelection) {
								if (oRule.id === oRuleSelection.ruleId && oRule.libName === oRuleSelection.libName) {
									oRule.selected = true;
								}
							});

							if (oRule.selected === true) {
								oTreeTable.addSelectionInterval(i, i);
							} else {
								oTreeTable.removeSelectionInterval(i, i);
								bAllSelected = false;
							}
						});

					// if no rules in library number won't be incremented
					if (i === iTableLibIndex) {
						bAllSelected = false;
					}

					oTreeViewModel[sLibKey].selected = bAllSelected;
					if (bAllSelected) {
						oTreeTable.addSelectionInterval(iTableLibIndex, iTableLibIndex);
					} else {
						oTreeTable.removeSelectionInterval(iTableLibIndex, iTableLibIndex);
					}
			 });
		},

		/**
		 *
		 * Create a map which returns all rows of the tree table from the binding.
		 *
		 * @returns {Object} All rows of the TreeTable
		 */
		_buildTreeTableIndex: function () {
			var iIndex = 0,
				sPath = this.treeTable.getBinding().getPath() + '/',
				oModel = this.model,
				mIndex = {},
				oLibContext = oModel.getProperty(sPath + iIndex),
				iSubIndex = 0,
				iGlobalIndex = 0,
				oRuleContext;

			// As the binding of the TreeTable has no API for all rows or all rows indices
			// (getRows returns the visible rows only) we have to discover them in the binding
			// and make an index map for better performance.
			while (oLibContext) {

				mIndex[oLibContext.name] = {
					index: iGlobalIndex,
					path: sPath + iIndex,
					libName: oLibContext.name,
					type: "lib",
					selected: oLibContext.selected
				};

				iGlobalIndex++;

				oRuleContext = oModel.getProperty(sPath + iIndex + '/' + iSubIndex);

				while (oRuleContext) {

					mIndex[oRuleContext.id] = {
						index: iGlobalIndex,
						path: sPath + iIndex + '/' + iSubIndex,
						libName: oRuleContext.libName,
						type: "rule",
						selected: oRuleContext.selected
					};

					iSubIndex++;
					iGlobalIndex++;
					oRuleContext = oModel.getProperty(sPath + iIndex + '/' + iSubIndex);
				}

				iIndex++;
				oLibContext = oModel.getProperty(sPath + iIndex);
			}

			return mIndex;
		},

		/**
		 * Finds the visual index of the rowContext.
		 *
		 * @param {Object} oRowContext the rowContext to check
		 * @returns {int} the visible index of the row
		 */
		getVisualIndex: function (oRowContext) {
			var aRows = this.treeTable.getRows(),
				oRow,
				i;

			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];

				if (oRow.getBindingContext() == oRowContext) {
					return i;
				}
			}
		},

		selectionChangeHandler: function (oEvent) {
			var iIndex = oEvent.getParameter("rowIndex"),
				oRowContext = oEvent.getParameter("rowContext"),
				aRowIndices = oEvent.getParameter("rowIndices"),
				bUserInteraction = oEvent.getParameter("userInteraction");

			if (oEvent.getParameter("selectAll")) {
				this.selectAllRows(true);
				return;
			}

			if (iIndex === -1) {
				this.selectAllRows(false);
				return;
			}

			if (!bUserInteraction ||
				aRowIndices.length != 1 ||
				aRowIndices[0] != iIndex) {
				return;
			}

			var oTreeTable = this.treeTable,
				aRows = oTreeTable.getRows(),
				iVisualIndex = this.getVisualIndex(oRowContext),
				oRow = aRows[iVisualIndex],
				oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				bSelected = !oRowModel.getProperty(sPath + "/selected"),
				oChildIndicesRange,
				sKey;

			oRowModel.setProperty(sPath + "/selected", bSelected);

			if (this.isRowAGroup(oRow)) {
				oChildIndicesRange = this.getChildIndicesRange(oRow, iIndex);

				if (!oChildIndicesRange) {
					return;
				}

				for (sKey in mRules) {
					if (Number.isInteger(Number.parseInt(sKey, 10))) {
						oRowModel.setProperty(sPath + "/" + sKey + "/selected", bSelected);
					}
				}

				if (oTreeTable.isExpanded(iIndex)) {
					if (bSelected) {
						oTreeTable.addSelectionInterval(oChildIndicesRange.from, oChildIndicesRange.to);
					} else {
						oTreeTable.removeSelectionInterval(oChildIndicesRange.from, oChildIndicesRange.to);
					}
				}
			} else {
				this.updateLibrarySelection(sPath, bSelected);
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},

		toggleOpenStateHandler: function (oEvent) {
			var iIndex = oEvent.getParameter("rowIndex"),
				oRowContext = oEvent.getParameter("rowContext"),
				bExpanded = oEvent.getParameter("expanded"),
				oTreeTable = this.treeTable,
				aRows = oTreeTable.getRows(),
				iVisualIndex = this.getVisualIndex(oRowContext),
				oRow = aRows[iVisualIndex],
				oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				sKey,
				bSelected,
				iRuleIndex = iIndex + 1;

			if (!bExpanded) {
				return;
			}

			for (sKey in mRules) {
				if (Number.isInteger(Number.parseInt(sKey, 10))) {
					bSelected = oRowModel.getProperty(sPath + "/" + sKey + "/selected");

					if (bSelected) {
						oTreeTable.addSelectionInterval(iRuleIndex, iRuleIndex);
					} else {
						oTreeTable.removeSelectionInterval(iRuleIndex, iRuleIndex);
					}

					iRuleIndex++;
				}
			}
		},

		/**
		 * Traverses the model and creates a rule descriptor for every selected rule
		 *
		 * @returns {Array} Rule selections array
		 */
		getSelectedRulesPlain: function () {
			var oModel = this.model,
				aSelectedRules = [],
				oRule;

			for (var i in oModel.getProperty("/treeViewModel/")) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					for (var k in oModel.getProperty("/treeViewModel/" + i)) {
						oRule = oModel.getProperty("/treeViewModel/" + i + "/" + k);

						if (Number.isInteger(Number.parseInt(k, 10)) && oRule && oRule.selected) {
							aSelectedRules.push({
								ruleId: oRule.id,
								libName: oRule.libName
							});
						}
					}
				}
			}

			return aSelectedRules;
		},

		/**
		 * Saves rule selections to the local storage
		 */
		persistSelection: function () {
			var aSelectedRules = this.getSelectedRulesPlain();

			storage.setSelectedRules(aSelectedRules);
		},

		exportSelectedRules: function (title, description) {
			var aSelectedRules = this.getSelectedRulesPlain();
			var oRulesToExport = {
				title: title,
				description: description,
				selections: aSelectedRules
			};

			var oExportObject = JSON.stringify(oRulesToExport);

			File.save(oExportObject, constants.RULE_SELECTION_EXPORT_FILE_NAME, 'json', 'text/plain');
		},

		isValidSelectionImport: function (oImport) {
			var bIsFileValid = true;

			if (!oImport.hasOwnProperty("title")) {
				bIsFileValid = false;
			}

			if (!oImport.hasOwnProperty("description")) {
				bIsFileValid = false;
			}

			if (!oImport.hasOwnProperty("selections")) {
				bIsFileValid = false;
			} else if (!Array.isArray(oImport.selections)) {
				bIsFileValid = false;
			} else {
				for (var i = 0; i < oImport.selections.length; i++) {
					var oRuleSelection = oImport.selections[i];
					if (!oRuleSelection.hasOwnProperty("ruleId") || !oRuleSelection.hasOwnProperty("libName")) {
						bIsFileValid = false;
						break;
					}
				}
			}

			return bIsFileValid;
		}
	};

	return SelectionUtils;
});