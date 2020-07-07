sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		'./formatter'
	],
	function (Controller, JSONModel, MessageBox, Filter, formatter) {
		"use strict";

		return Controller.extend("sap.m.sample.PlanningCalendarPaging.Page", {

			myformatter: formatter,

			// Pagination configuration options
			_oPgConfig: {
				bShowCountSelect: true,						// show count select (dropdown with different rows per page)
				bShowNavSelect: true,						// show nav select (dropdown with pages)
				bShowNavButtons: true,						// show nav buttons (prev/next page)
				iRowsPerPage: 5,							// initial number of rows per page
				sPrevPageIcon: "sap-icon://sys-prev-page",	// icon for prev page button
				sNextPageIcon: "sap-icon://sys-next-page",	// icon for next page button
				aRowsPerPage: [0, 5, 10, 20]				// list of options for count select (0 = show all)
			},

			onInit: function() {
				this._oCalendar = this.byId("PC1");
				this._oModel = this.getView().getModel("calendar");

				// call pagination initialization
				this._oModel.dataLoaded().then(function() {
					this._pgInit();
				}.bind(this));
			},

			// Pagination controller methods

			/** Initializes Pagination */
			_pgInit: function() {
				// create pagination state properties in the configuration object in order to store runtime state
				this._oPgConfig._iCount = this._oModel.getProperty("/people").length;	// total number of rows
				this._oPgConfig._iPages = 1;											// number of pages
				this._oPgConfig._iPage = 1;												// current page

				// create pagination controls
				if (this._oPgConfig.iRowsPerPage !== undefined && this._oPgConfig.aRowsPerPage.length > 0
					&& this._oPgConfig.aRowsPerPage.indexOf(this._oPgConfig.iRowsPerPage) != -1) {
					// place count Select in PC header if necessary
					if (this._oPgConfig.bShowCountSelect && this._oPgConfig.aRowsPerPage.length > 0) {
						this._pgCreateCountSelect();
					}

					// place navigation Select in PC header
					if (this._oPgConfig.bShowNavSelect) {
						this._pgCreateNavSelect();
					}

					// place navigation Buttons in PC header
					if (this._oPgConfig.bShowNavButtons) {
						this._pgCreateNavButtons();
					}

					// calculate pages count
					this._pgSetPages();
				} else {
					// set proper PC rows to display
					this._oPgConfig.iRowsPerPage = 0;
					this._pgSetData();
				}

			},

			/** Creates count select */
			_pgCreateCountSelect: function() {
				var iIndex;

				this._oPgConfig._oCountSelect = new sap.m.Select({
					tooltip: "Rows per page",
					selectedKey: this._oPgConfig.iRowsPerPage,
					change: function (oEvent) {
						var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
						this._oPgConfig.iRowsPerPage = Number(sSelectedKey);
						this._pgSetPages();
					}.bind(this)
				});
				// add count Select Items
				if (this._oPgConfig.aRowsPerPage) {
					for (iIndex = 0; iIndex < this._oPgConfig.aRowsPerPage.length; iIndex++) {
						this._oPgConfig._oCountSelect.addItem(new sap.ui.core.Item({
							key: this._oPgConfig.aRowsPerPage[iIndex],
							text: this._oPgConfig.aRowsPerPage[iIndex] > 0 ?
								  this._oPgConfig.aRowsPerPage[iIndex] + " per page" : "Show all " + this._oPgConfig._iCount + " rows"
						}));
					}
				}
				this._oCalendar.addToolbarContent(this._oPgConfig._oCountSelect);
			},

			/** Creates nav select */
			_pgCreateNavSelect: function() {
				this._oPgConfig._oNavSelect = new sap.m.Select({
					tooltip: "Go to page",
					selectedKey: this._oPgConfig._iPage,
					visible: false,
					change: function (oEvent) {
						var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
						this._oPgConfig._iPage = Number(sSelectedKey);
						this._pgSetNavigation();
					}.bind(this)
				});
				this._oCalendar.addToolbarContent(this._oPgConfig._oNavSelect);
			},

			/** Creates nav buttons */
			_pgCreateNavButtons: function() {
				this._oPgConfig._oPrevButton = new sap.m.Button({
					icon: this._oPgConfig.sPrevPageIcon,
					type: "Ghost",
					visible: false,
					press: function () {
						this._oPgConfig._iPage--;
						this._pgSetNavigation();
					}.bind(this)
				});
				this._oPgConfig._oNextButton = new sap.m.Button({
					icon: this._oPgConfig.sNextPageIcon,
					type: "Ghost",
					visible: false,
					press: function () {
						this._oPgConfig._iPage++;
						this._pgSetNavigation();
					}.bind(this)
				});
				this._oCalendar.addToolbarContent(this._oPgConfig._oPrevButton);
				this._oCalendar.addToolbarContent(this._oPgConfig._oNextButton);
			},

			/** Calculates pages count */
			_pgSetPages: function() {
				this._oPgConfig._iPages = this._oPgConfig.iRowsPerPage ? Math.ceil(this._oPgConfig._iCount / this._oPgConfig.iRowsPerPage) : 1;
				if (this._oPgConfig._iPage > this._oPgConfig._iPages) {
					this._oPgConfig._iPage = this._oPgConfig._iPages;
				}
				// set pagination navigation
				this._pgSetNavigation();
			},

			/** Shows/hides pagination controls depending on situation */
			_pgSetNavigation: function() {
				var	iIndex;

				// show/hide/set tooltips of nav buttons
				if (this._oPgConfig.bShowNavButtons) {

					// show/hide/set tooltip of prev button when necessary
					if (this._oPgConfig._iPage > 1) {
						this._oPgConfig._oPrevButton.setTooltip("Go to page " + (this._oPgConfig._iPage - 1));
						this._oPgConfig._oPrevButton.setVisible(true);
					} else {
						this._oPgConfig._oPrevButton.setVisible(false);
					}

					// show/hide/set tooltip of next button when necessary
					if (this._oPgConfig._iPage < this._oPgConfig._iPages) {
						this._oPgConfig._oNextButton.setTooltip("Go to page " + (this._oPgConfig._iPage + 1));
						this._oPgConfig._oNextButton.setVisible(true);
					} else {
						this._oPgConfig._oNextButton.setVisible(false);
					}
				}

				// show/hide nav select and recreate its items when necessary
				if (this._oPgConfig.bShowNavSelect) {
					if (this._oPgConfig._iPages > 1) {
						this._oPgConfig._oNavSelect.removeAllItems();
						for (iIndex = 1; iIndex <= this._oPgConfig._iPages; iIndex++) {
							this._oPgConfig._oNavSelect.addItem(new sap.ui.core.Item({
								key: iIndex,
								text: "Page " + iIndex
							}));
						}
						this._oPgConfig._oNavSelect.setSelectedKey(this._oPgConfig._iPage);
						this._oPgConfig._oNavSelect.setVisible(true);
					} else {
						this._oPgConfig._oNavSelect.setVisible(false);
					}
				}

				// set proper PC rows to display
				setTimeout(function() {
					this._pgSetData();
				}.bind(this), 0);

			},

			/** Prepares a slice of data displayed as rows */
			_pgSetData: function() {
				this._oModel.setProperty("/peopleList",
					this._oPgConfig.iRowsPerPage === 0 ?
					this._oModel.getData().people :
					this._oModel.getData().people.slice((this._oPgConfig._iPage - 1) * this._oPgConfig.iRowsPerPage, this._oPgConfig._iPage * this._oPgConfig.iRowsPerPage)
				);
			},

			// Regular controller methods

			handleAppointmentSelect: function(oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					sSelected;
				if (oAppointment) {
					sSelected = oAppointment.getSelected() ? "selected" : "deselected";
					MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleSelectionFinish: function(oEvent) {
				var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				this.byId("PC1").setBuiltInViews(aSelectedKeys);
			}

		});

	});