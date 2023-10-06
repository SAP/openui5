/*!
 * ${copyright}
 */

sap.ui.define([
	"./Toolbar",
	"./Button",
	"./Dialog",
	"./Popover",
	"./SuggestionsList",
	"./SuggestionItem",
	"sap/ui/Device",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText"
], function (
	Toolbar,
	Button,
	Dialog,
	Popover,
	SuggestionsList,
	SuggestionItem,
	Device,
	library,
	Core,
	InvisibleText
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	/**
	 * <code>sap.m.Suggest</code> provides the functionality to display suggestion lists for the user entry
	 * in a search field.
	 *
	 * This function is part of the sap.m.SearchField functionality.
	 * It should not be used in application programming as a stand alone unit.
	 *
	 * @author SAP SE
	 * @since 1.34
	 *
	 * @private
	 * @alias sap.m.Suggest
	 *
	 * @param {sap.ui.core.Control} oInput the search/input control to which this suggestion belongs
	 *
	 * @constructor
	 */
	function Suggest(oInput) {

		var parent = oInput, 		// the parent search field/input
			picker, 				// either or popover or a dialog with the list of suggestion items
			list,					// SuggestionsList with suggestions
			listUpdateTimeout,		// list is updated after a timeout to accumulate simultaneous updates
			bUseDialog = Device.system.phone,
			self = this;

		/* =========================================================== */
		/* events processing                                           */
		/* =========================================================== */

		// Process tap over a list item in a picker
		function ontap(oEvent) {
			var item = oEvent.srcControl;
			var value;
			if (item instanceof SuggestionItem ) {
				value = item.getSuggestionText();
				self._suggestionItemTapped = true;
				picker.close();
				window.setTimeout(function() {
					oInput._updateValue(value);
					oInput._fireChangeEvent();
					oInput.fireSearch({
						query: value,
						suggestionItem: item,
						refreshButtonPressed: false,
						clearButtonPressed: false
					});
				}, 0);
			}
		}

		/* =========================================================== */
		/* internal helper functions                                   */
		/* =========================================================== */

		function createDialog() {
			var dialog,
				originalValue,
				dialogSearchField,
				customHeader,
				okButton,
				closeButton;

			// use sap.ui.require to avoid circular dependency between the SearchField and Suggest
			dialogSearchField = new (sap.ui.require('sap/m/SearchField'))({
				liveChange : function (oEvent) {
					var value = oEvent.getParameter("newValue");
					oInput._updateValue(value);
					oInput.fireLiveChange({newValue: value});
					oInput.fireSuggest({suggestValue: value});
					self.update();
				},
				search : function (oEvent) {
					if (!oEvent.getParameter("clearButtonPressed")) {
						dialog.close();
					}
				}
			});

			closeButton = new Button({
				icon : "sap-icon://decline",
				press : function() {
					self._cancelButtonTapped = true;
					dialog._oCloseTrigger = true;
					dialog.close();

					oInput._updateValue(originalValue);
				}
			});

			customHeader = new Toolbar({
				content: [dialogSearchField, closeButton]
			});

			okButton = new Button({
				text : Core.getLibraryResourceBundle("sap.m").getText("MSGBOX_OK"),
				press : function() {
					dialog.close();
				}
			});

			dialog = new Dialog({
				stretch: true,
				customHeader: customHeader,
				content: getList(),
				beginButton : okButton,
				beforeClose: function () {
					oInput._bSuggestionSuppressed = true;
				},
				beforeOpen: function() {
					originalValue = oInput.getValue();
					dialogSearchField._updateValue(originalValue);
				},
				afterClose: function(oEvent) {
					if (!self._cancelButtonTapped  // fire the search event if not cancelled
						&& !self._suggestionItemTapped) { // and if not closed from item tap
						oInput._fireChangeEvent();
						oInput.fireSearch({
							query: oInput.getValue(),
							refreshButtonPressed: false,
							clearButtonPressed: false
						});
					}
				}
			});
			dialog.addEventDelegate({
				ontap: ontap
			}, oInput);
			return dialog;
		}

		function createPopover() {
			var popover = self._oPopover = new Popover({
				showArrow: false,
				showHeader: false,
				horizontalScrolling: false,
				placement: PlacementType.Vertical,
				offsetX: 0,
				offsetY: 0,
				initialFocus: parent,
				bounce: false,
				ariaLabelledBy: InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"),
				afterOpen: function () {
					oInput._applySuggestionAcc();
				},
				beforeClose: function() {
					oInput.$("I").removeAttr("aria-activedescendant");
					oInput.$("SuggDescr").text("");
				},
				content: getList()
			})
				.addStyleClass("sapMSltPicker")
				.addStyleClass("sapMSltPicker-CTX");

			popover.open = function(){
				return this.openBy(parent);
			};

			popover.addEventDelegate({
					onAfterRendering: self.setPopoverMinWidth.bind(self),
					ontap: ontap
				}, oInput);

			return popover;
		}

		function getList() {
			if (!list) {
				list = new SuggestionsList({ parentInput: parent });
			}
			return list;
		}

		function getPicker() {
			if (picker === undefined) {
				picker = bUseDialog ? createDialog() : createPopover();
			}
			return picker;
		}

		/* =========================================================== */
		/* API functions                                               */
		/* =========================================================== */

		this.setPopoverMinWidth = function() {
			var oPopoverDomRef = self._oPopover.getDomRef();
			if (oPopoverDomRef) {
				var w = (oInput.$().outerWidth() / parseFloat(library.BaseFontSize)) + "rem";
				oPopoverDomRef.style.minWidth = w;
			}
		};

		this.destroy = function() {
			if (picker) {
				picker.close();
				picker.destroy();
				picker = null;
			}
			if (list) {
				list.destroy();
				list = null;
			}
		};

		/**
		 * Hide suggestions on desktop and tablets.
		 *
		 * Note: This function does nothing on phone devices where a full screen dialog is opened.
		 * Only the user may close the full screen dialog. There is no possibility to do it from the application code.
		 *
		 * @private
		 */
		this.close = function() {
			if (!bUseDialog && this.isOpen()) {
				picker.close();
			}
		};

		/**
		 * Show suggestions.
		 *
		 * @private
		 */
		this.open = function() {
			if (!this.isOpen()) {
				this.setSelected(-1); // clear selection before open
				this._suggestionItemTapped = false;
				this._cancelButtonTapped = false;
				getPicker().open();
			}
		};

		/**
		 * Update the suggestions list display.
		 *
		 * @private
		 */
		this.update = function() {
			var list = getList();
			window.clearTimeout(listUpdateTimeout);
			if (this.isOpen()) { // redraw the list only if it is visible
				listUpdateTimeout = window.setTimeout(list.update.bind(list), 50);
				oInput._applySuggestionAcc();
			}
		};

		/**
		 * @returns {boolean} true if the suggestions list is visible.
		 * @private
		 */
		this.isOpen = function() {
			return !!picker && picker.isOpen();
		};

		/**
		 * Getter for the selected item index.
		 *
		 * @returns {int} Index of the selected item or -1
		 * @private
		 */
		this.getSelected = function() {
			return getList().getSelectedItemIndex();
		};

		/**
		 * Setter for the selected item index.
		 *
		 * @param {int} index Index of the item to select or -1 to remove selection
		 * @private
		 */
		this.setSelected = function(index, bRelative) {
			return getList().selectByIndex(index, bRelative);
		};

	}/* Suggest */

	return Suggest;

}, /* bExport= */ true);
