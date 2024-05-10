sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/unified/library",
	"sap/m/PlanningCalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/Bar",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/MultiComboBox",
	"sap/m/MessageToast",
	"sap/m/Popover",
	"sap/m/library",
	"sap/m/PlanningCalendarRow",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/core/format/DateFormat",
	"sap/m/SearchField",
	"sap/m/ToggleButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/unified/DateTypeRange",
	"sap/m/PlanningCalendarView",
	"sap/ui/layout/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/DateTimePicker",
	"sap/ui/core/library",
	"sap/ui/core/ListItem",
	"sap/m/Title",
	"sap/m/Switch",
	"sap/m/ObjectListItem",
	"sap/m/PlanningCalendar",
	"sap/ui/core/CustomData",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/m/ToolbarSeparator",
	"sap/m/Page",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/base/Log",
	"sap/ui/core/date/UI5Date"
], function(
	Element,
	unifiedLibrary,
	PlanningCalendarLegend,
	CalendarLegendItem,
	Dialog,
	Button,
	App,
	Label,
	JSONModel,
	Bar,
	Input,
	Select,
	Item,
	MultiComboBox,
	MessageToast,
	Popover,
	mobileLibrary,
	PlanningCalendarRow,
	CalendarAppointment,
	DateFormat,
	SearchField,
	ToggleButton,
	OverflowToolbarLayoutData,
	DateTypeRange,
	PlanningCalendarView,
	layoutLibrary,
	SimpleForm,
	Title,
	DateTimePicker,
	coreLibrary,
	ListItem,
	MTitle,
	Switch,
	ObjectListItem,
	PlanningCalendar,
	CustomData,
	FlexBox,
	MText,
	Icon,
	ToolbarSeparator,
	Page,
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	Log,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.unified.GroupAppointmentsMode
	var GroupAppointmentsMode = unifiedLibrary.GroupAppointmentsMode;

	// shortcut for sap.ui.unified.CalendarAppointmentVisualization
	var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.unified.StandardCalendarLegendItem
	var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oLegend = new PlanningCalendarLegend("Legend1", {
		standardItems: [StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay, StandardCalendarLegendItem.Today],
		items: [
			new CalendarLegendItem("T1", {
				type: CalendarDayType.Type01,
				text: "Type 1 in Legend Calendar area"
			}),
			new CalendarLegendItem("T2", {
				type: CalendarDayType.Type02,
				text: "Type 2 in Legend Calendar area"
			}),
			new CalendarLegendItem("T3", {
				type: CalendarDayType.Type03,
				text: "Type 3 in Legend Calendar area"
			}),
			new CalendarLegendItem("T4", {
				type: CalendarDayType.Type04,
				text: "Type 4 in Legend Calendar area"
			}),
			new CalendarLegendItem("T5", {
				type: CalendarDayType.Type05,
				text: "Type 5 in Legend Calendar area"
			}),
			new CalendarLegendItem("T6", {
				type: CalendarDayType.Type06,
				text: "Type 6 in Legend Calendar area"
			}),
			new CalendarLegendItem("T7", {
				type: CalendarDayType.Type07,
				text: "Type 7 in Legend Calendar area"
			}),
			new CalendarLegendItem("T8", {
				type: CalendarDayType.Type08,
				text: "Type 8 in Legend Calendar area"
			}),
			new CalendarLegendItem("T9", {
				type: CalendarDayType.Type09,
				text: "Type 9 in Legend Calendar area"
			}),
			new CalendarLegendItem("T10", {
				type: CalendarDayType.Type10,
				text: "Type 10 in Legend Calendar area"
			})
		],
		appointmentItems: [
			new CalendarLegendItem("T31", {
				type: CalendarDayType.Type01,
				text: "Type Private Appointment"
			}),
			new CalendarLegendItem("T32", {
				type: CalendarDayType.Type02,
				text: "Type Face2Face Appointment"
			}),
			new CalendarLegendItem("T33", {
				type: CalendarDayType.Type12,
				text: "Type Public Appointment"
			})
		]
	});

	var oDialog = new Dialog("D1", {
		title: "Legend",
		content: [oLegend],
		endButton: new Button({
			text: "Close",
			press: function () {
				oDialog.close();
			}
		})
	});

	var app = new App("myApp");

	var oEventLabel = new Label({text: "Events log"});

	var oModel = new JSONModel();

	oModel.setData({
		headerContentBinding: [{
			name: "Edward II",
			text: "headerContent aggregation with binding"
		}]
	});

	function createFooter() {
		return new Bar({
			contentLeft: [
				new Label({labelFor: "inputFocusHelper", text: "Focus helper"}),
				new Input("inputFocusHelper", {value: "VisualTest focus helper, Don't remove."})
			],
			contentMiddle: [new Button({
				text: "PlanningCalendar",
				press: function () {
					app.to("page1");
				}
			})],
			contentRight: [
				oEventLabel,
				new Button({
					text: "Show empty interval headers",
					press: function () {
						var bSEIH = oPC1.getShowEmptyIntervalHeaders();
						oPC1.setShowEmptyIntervalHeaders(!bSEIH);
					}
				}),
				new Label({labelFor: "select_width", text: "Screen width"}),
				new Select('select_width', {
					items: [
						new Item('select_width_item_0', {
							text: '100%',
							key: '100%'
						}),
						new Item('select_width_item_1', {
							text: 'x < 600px',
							key: '500px'
						}),
						new Item('select_width_item_2', {
							text: '600px < x < 1024px',
							key: '700px'
						}),
						new Item('select_width_item_3', {
							text: '1024px < x',
							key: '1200px'
						})
					],
					change: function (oEvent) {
						var sSelectedWidth = oEvent.getParameter('selectedItem').getKey();
						Element.getElementById('PC1').setWidth(sSelectedWidth);
					}
				}),
				new Label({labelFor: "select_calendar_type", text: "Calendar type"}),
				new Select('select_calendar_type', {
					items: [
						new Item('select_calendar_type_item_0', {
							text: 'Gregorian',
							key: 'Gregorian'
						}),
						new Item('select_calendar_type_item_1', {
							text: 'Islamic',
							key: 'Islamic'
						}),
						new Item('select_calendar_typeh_item_2', {
							text: 'Japanese',
							key: 'Japanese'
						}),
						new Item('select_calendar_type_item_3', {
							text: 'Persian',
							key: 'Persian'
						}),
						new Item('select_calendar_type_item_4', {
							text: 'Buddhist',
							key: 'Buddhist'
						})
					],
					change: function (oEvent) {
						var sSelectedCalendarType = oEvent.getParameter('selectedItem').getKey();
						Element.getElementById('PC1').setPrimaryCalendarType(sSelectedCalendarType);
					}
				}),
				new Label({labelFor: "MCB1", text: "Built-in views"}),
				new MultiComboBox({
					id: "MCB1",
					width: "230px",
					placeholder: "Choose built-in views",
					items: [
						new Item({
							key: "Hour",
							text: "Hour"
						}),

						new Item({
							key: "Day",
							text: "Day"
						}),

						new Item({
							key: "Month",
							text: "Month"
						}),

						new Item({
							key: "Week",
							text: "1 week"
						}),

						new Item({
							key: "One Month",
							text: "1 month"
						})
					],
					selectionFinish: function () {
						var aSelectedKeys = this.getSelectedKeys();
						oPC1.setBuiltInViews(aSelectedKeys);
					}
				})
			]
		});
	}

	var handleIntervalSelect = function (oEvent) {
		new MessageToast.show("Interval Select was handled");
	};

	var handleAppointmentSelect = function (oEvent) {
		var oInput = Element.getElementById("I1"),
			oAppointment = oEvent.getParameter("appointment"),
			aAppointments,
			sValue,
			i;

		if (oAppointment) {
			oInput.setValue("Appointment selected: " + oAppointment.getId());
		} else {
			aAppointments = oEvent.getParameter("appointments");
			sValue = aAppointments.length + " Appointments selected: ";
			for (i = 1; i < aAppointments.length; i++) {
				sValue = sValue + aAppointments[i].getId() + " ";
			}
			oInput.setValue(sValue);
		}
		setEventLog("'appointmentSelect' for appointment: " + (oAppointment ? oAppointment.getTitle() : "<no app>"));
	};

	var handleAddRow = function () {
		var oPC = Element.getElementById("PC1");
		var oRow = new PlanningCalendarRow({
			icon: "sap-icon://employee",
			title: "new Row"
		});
		oPC.addRow(oRow);
	};

	var handleAddAppointment = function (oEvent) {
		var oPC = Element.getElementById("PC1");
		var sViewKey = oPC.getViewKey();
		var oEventStartDate = oEvent.getParameter("startDate");
		var oEventEndDate = oEvent.getParameter("endDate");
		var oEventRow = oEvent.getParameter("row");
		var oStartDate = oEventStartDate || oPC.getStartDate();
		var aSelectedRows = oPC.getSelectedRows();
		var iStartOffset = 3;
		var iEndOffset = 3;

		setEventLog("'intervalSelect': startDate=" + oEventStartDate + ", endDate=" + oEventEndDate);

		if (oEventStartDate) {
			// add appointment in selected interval
			iStartOffset = 0;
			iEndOffset = 1;
		}

		if (aSelectedRows.length > 0 || oEventRow) {
			var oRow = oEventRow || aSelectedRows[0];
			var oAppointmentStartDate = UI5Date.getInstance(oStartDate.getTime());
			var oAppointmentEndDate;
			if (oEventEndDate) {
				oAppointmentEndDate = UI5Date.getInstance(oEventEndDate);
			} else {
				oAppointmentEndDate = UI5Date.getInstance(oStartDate.getTime());

				switch (sViewKey) {
					case CalendarIntervalType.Hour:
						oAppointmentStartDate.setHours(oAppointmentStartDate.getHours() + iStartOffset);
						oAppointmentEndDate.setHours(oAppointmentStartDate.getHours() + iEndOffset);
						break;

					case CalendarIntervalType.Day:
						oAppointmentStartDate.setDate(oAppointmentStartDate.getDate() + iStartOffset);
						oAppointmentEndDate.setDate(oAppointmentStartDate.getDate() + iEndOffset);
						break;

					case CalendarIntervalType.Month:
						oAppointmentStartDate.setMonth(oAppointmentStartDate.getMonth() + iStartOffset);
						oAppointmentEndDate.setMonth(oAppointmentStartDate.getMonth() + iEndOffset);
						break;

					case CalendarIntervalType.Week:
						oAppointmentStartDate.setDate(oAppointmentStartDate.getDate() + iStartOffset);
						oAppointmentEndDate.setDate(oAppointmentStartDate.getDate() + iEndOffset);
						break;

					case CalendarIntervalType.OneMonth:
					case "OneMonth":
						oAppointmentStartDate.setDate(oAppointmentStartDate.getDate() + iStartOffset);
						oAppointmentEndDate.setDate(oAppointmentStartDate.getDate() + iEndOffset);
						break;
				}
				oAppointmentEndDate.setMinutes(oAppointmentEndDate.getMinutes() - 1);
			}

			var oAppointment = new CalendarAppointment({
				startDate: oAppointmentStartDate,
				endDate: oAppointmentEndDate,
				type: CalendarDayType.Type08,
				title: "New Appointment",
				text: sViewKey,
				icon: "sap-icon://sap-ui5"
			});
			oRow.addAppointment(oAppointment);
		} else {
			Log.warning("No row selected");
		}

	};

	var handleStartDateChange = function (oEvent) {
		var oDf = DateFormat.getTimeInstance("HH:mm:ss");
		setEventLog("startDateChange event at " + oDf.format(UI5Date.getInstance()) + " with params:" + JSON.stringify(oEvent.mParameters));
	};

	var handleRowSelectionChange = function (oEvent) {
		var oRows = oEvent.getParameter("rows"),
			sValue = oRows.length + " row(s) selected";
		setEventLog("rowSelectionChange:" + sValue);
	};

	//adds some event info to the event log label
	function setEventLog(sMessage) {
		oEventLabel.setText(sMessage);
		oEventLabel.$().attr('style', "background-color: rgb(" + Math.ceil(Math.random() * 255).toString() + "," + Math.ceil(Math.random() * 255).toString() + "," + Math.ceil(Math.random() * 255).toString() + ");");
	}

	var handleRowHeaderPress = function (oEvent) {
		var oRow = oEvent.getParameter("row"),
			sEmployeeInfo = oRow.getTitle() + " " + oRow.getText();
		setEventLog("'rowHeaderPress' on employee:\n'" + sEmployeeInfo + "'");
	};

	var handleLegend = function () {
		oDialog.open();
	};

	var oSearchField = new SearchField("SF1", {
		width: "10rem",
		search: function () {
			MessageToast.show("Search!");
		}
	});

	var oMultiAppsSelectButton = new ToggleButton("MultiSelect", {
		icon: "sap-icon://multi-select",
		tooltip: "Enable multiple appointments selection",
		layoutData: new OverflowToolbarLayoutData({
			priority: "NeverOverflow"
		}),
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			oPC.setMultipleAppointmentsSelection(!oPC.getMultipleAppointmentsSelection());
			if (oEvent.getParameter("pressed")) {
				this.setTooltip("Disable multiple appointments selection");
			} else {
				this.setTooltip("Enable multiple appointments selection");
			}
		}
	});

	var oButton1 = new Button("B1", {
		icon: "sap-icon://sap-ui5",
		type: ButtonType.Transparent,
		tooltip: "UI5 button",
		press: function () {
			MessageToast.show("UI5 Button pressed");
		}
	});

	var oButton2 = new ToggleButton("B2", {
		icon: "sap-icon://multi-select",
		type: ButtonType.Transparent,
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			if (oEvent.getParameter("pressed")) {
				oPC.setSingleSelection(false);
			} else {
				oPC.setSingleSelection(true);
			}
		}
	});

	var oDeleteRowsButton = new Button("B_DeleteAllRows", {
		icon: "sap-icon://delete",
		tooltip: "Delete all rows",
		press: function(oEvent) {
			var oPC = Element.getElementById("PC1");
			oPC.removeAllRows();
		}
	});

	var oButtonAddAppointment = new Button("B_AddAppointment", {
		icon: "sap-icon://add",
		tooltip: "Add appointment",
		type: ButtonType.Transparent,
		press: handleAddAppointment
	});

	var oButtonAddRow = new Button("B_AddRow", {
		icon: "sap-icon://add-contact",
		type: ButtonType.Transparent,
		press: handleAddRow
	});

	var oButtonShowIntervalHeaders = new ToggleButton("B_ShowIntHead", {
		icon: "sap-icon://header",
		type: ButtonType.Transparent,
		pressed: true,
		tooltip: "Toggle planning calendar showIntervalHeaders property",
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			var bPressed = oEvent.getParameter("pressed");
			oPC.setShowIntervalHeaders(bPressed);
		}
	});

	var oButtonShowRowHeaders = new ToggleButton("B_ShowRowHead", {
		icon: "sap-icon://person-placeholder",
		type: ButtonType.Transparent,
		tooltip: "Toggle planning calendar showRowHeaders property",
		pressed: true,
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			var bPressed = oEvent.getParameter("pressed");
			oPC.setShowRowHeaders(bPressed);
		}
	});

	var oButtonShowWeekNumbers = new ToggleButton("B_ShowWeekNumbers", {
		type: ButtonType.Transparent,
		text: "Weeks",
		tooltip: "Toggle week numbers",
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			var bPressed = oEvent.getParameter("pressed");
			oPC.setShowWeekNumbers(bPressed);
		}
	});

	var oButtonLegend = new Button("B_Legend", {
		icon: "sap-icon://legend",
		type: ButtonType.Transparent,
		tooltip: "Open PlanningCalendar legend",
		press: handleLegend
	});

	var oButtonReducedHeight = new ToggleButton("B_ReducedHeight", {
		icon: "sap-icon://resize-vertical",
		type: ButtonType.Transparent,
		pressed: false,
		tooltip: "Toggle appointmentsReducedHeight property",
		press: function (oEvent) {
			var oPC = Element.getElementById("PC1");
			var bPressed = oEvent.getParameter("pressed");
			oPC.setAppointmentsReducedHeight(bPressed);
		}
	});

	var oButtonToggleAlternatingRowColor = new ToggleButton({
		icon: "sap-icon://paging",
		tooltip: "Toggle Alternating Row Color",
		type: ButtonType.Transparent,
		pressed: true,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed")) {
				oPC1.removeStyleClass("sapMPlanCalSuppressAlternatingRowColors");
			} else {
				oPC1.addStyleClass("sapMPlanCalSuppressAlternatingRowColors");
			}
		}
	});

	var oButtonToggleSpecNoWork = new ToggleButton({
		icon: "sap-icon://date-time",
		tooltip: "Toggle Special Non-Working Dates",
		type: ButtonType.Transparent,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed")) {
				oPC1.addSpecialDate(new DateTypeRange({
					startDate: UI5Date.getInstance(2015, 0, 7),
					endDate: UI5Date.getInstance(2015, 0, 8),
					type: CalendarDayType.NonWorking
				}));
			} else {
				oPC1.getSpecialDates().forEach(function (oSpecialDate) {
					if (oSpecialDate.getType() === CalendarDayType.NonWorking) {
						oPC1.removeSpecialDate(oSpecialDate);
					}
				});
			}
		}
	});

	var oButtonToggleShowDayNamesLine = new ToggleButton({
		icon: "sap-icon://decrease-line-height",
		tooltip: "Toggle Day Names Line",
		type: ButtonType.Transparent,
		press: function (oEvent) {
			oPC1.setShowDayNamesLine(oEvent.getParameter("pressed"));
		}
	});

	var oButtonToggleCustomViews = new ToggleButton({
		icon: "sap-icon://chart-table-view",
		tooltip: "Toggle custom predefined custom views",
		type: ButtonType.Transparent,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed")) {
				oPC1.addView(
					new PlanningCalendarView({
						key: "customView1",
						intervalType: CalendarIntervalType.Day,
						description: "custom view 1",
						intervalsS: 7,
						intervalsM: 7,
						intervalsL: 7
					})
				);
				oPC1.addView(
					new PlanningCalendarView({
						key: "customView2",
						intervalType: CalendarIntervalType.Hour,
						description: "custom view 2",
						intervalsS: 5,
						intervalsM: 5,
						intervalsL: 5
					})
				);
				oPC1.setViewKey(oPC1.getViews()[0].getKey());
			} else {
				oPC1.destroyViews();

			}
		}
	});

	var oDialog2;
	var oButtonMinMax = new Button("B_MinMax", {
		tooltip: "Change view start/end date",
		icon: "sap-icon://group-2",
		type: ButtonType.Transparent,
		press: function () {
			if (!oDialog2) {
				sap.ui.getCore().loadLibrary("sap.ui.layout");
				var oForm = new SimpleForm("SimpleForm1", {
					layout: SimpleFormLayout.ResponsiveGridLayout,
					content: [
						new Label({text: "minimum date"}),
						new DateTimePicker("DTP-Min", {
							change: function (oEvent) {
								var oDTP = oEvent.getSource();
								if (oEvent.getParameter("valid")) {
									oDTP.setValueState(ValueState.None);
								} else {
									oDTP.setValueState(ValueState.Error);
								}
							}
						}),
						new Label({text: "maximum date"}),
						new DateTimePicker("DTP-Max", {
							change: function (oEvent) {
								var oDTP = oEvent.getSource();
								if (oEvent.getParameter("valid")) {
									oDTP.setValueState(ValueState.None);
								} else {
									oDTP.setValueState(ValueState.Error);
								}
							}
						})
					]
				});

				oDialog2 = new Dialog("D2", {
					title: "View's start/end date",
					content: [oForm],
					beginButton: new Button({
						text: "OK",
						press: function () {
							var oPC = Element.getElementById("PC1");
							var oDTP1 = Element.getElementById("DTP-Min");
							var oDTP2 = Element.getElementById("DTP-Max");
							oPC.setMinDate(oDTP1.getDateValue());
							oPC.setMaxDate(oDTP2.getDateValue());
							oDialog2.close();
						}
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							oDialog2.close();
						}
					})
				});
			}
			oDialog2.open();
		}
	});

	var oVisLabel = new Label({
		text: "Appointments Visualization:",
		labelFor: "Sel-Vis",
		layoutData: new OverflowToolbarLayoutData({
			group: 2
		})
	});
	var oVisSelect = new Select("Sel-Vis", {
		layoutData: new OverflowToolbarLayoutData({
			group: 2
		}),
		selectedKey: CalendarAppointmentVisualization.Standard,
		items: [
			new ListItem("I-1", {
				text: "Standard",
				key: CalendarAppointmentVisualization.Standard
			}),
			new ListItem("I-2", {
				text: "Filled",
				key: CalendarAppointmentVisualization.Filled
			})
		],
		change: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();
			oPC1.setAppointmentsVisualization(sKey);
		}
	});

	var oGroupModeLabel = new Label({
		text: "Group appointment mode",
		labelFor: "Sel-Group",
		layoutData: new OverflowToolbarLayoutData({
			group: 3
		})
	});
	var oGroupModeSelect = new Select("Sel-Group", {
		layoutData: new OverflowToolbarLayoutData({
			group: 3
		}),
		selectedKey: GroupAppointmentsMode.Collapsed,
		items: [
			new ListItem("GAM-I-1", {
				text: GroupAppointmentsMode.Collapsed,
				key: GroupAppointmentsMode.Collapsed
			}),
			new ListItem("GAM-I-2", {
				text: GroupAppointmentsMode.Expanded,
				key: GroupAppointmentsMode.Expanded
			})
		],
		change: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();
			oPC1.setGroupAppointmentsMode(sKey);
		}
	});

	var oTitle = new MTitle("Title1", {
		text: "Title"
	});


	var oButtonSwitchLegendAssociation = new Switch({
		state: true,
		change: function (oEvent) {
			var vLegend = oEvent.getParameter("state") ? oLegend : "";
			oPC1.setLegend(vLegend);
		},
		layoutData: new OverflowToolbarLayoutData({
			group: 1
		})
	});
	var oLegendLabel = new Label({
		text: "Legend Connected to PC",
		labelFor: oButtonSwitchLegendAssociation.getId(),
		layoutData: new OverflowToolbarLayoutData({
			group: 1
		})
	});

	var oOLI = new ObjectListItem({
		title: "{name}",
		intro: "{text}"
	});

	var oIMNoData = new IllustratedMessage({
		illustrationType: IllustratedMessageType.EmptyPlanningCalendar,
		illustrationSize: IllustratedMessageSize.Dialog,
		title: "No Data",
		description: "Try to add rows here"
	});

	var oPC1 = new PlanningCalendar("PC1", {
		startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
		rows: [
			new PlanningCalendarRow("Row1", {
				customData: new CustomData({key: "myKey", value: "myValue", writeToDom: true}),
				icon: "../ui/unified/images/m_01.png",
				title: "Max Mustermann",
				text: "Musterteam",
				tooltip: "Header tooltip",
				rowHeaderDescription: "Has popup",
				specialDates: [
					new DateTypeRange({
						startDate: UI5Date.getInstance(2015, 0, 7),
						endDate: UI5Date.getInstance(2015, 0, 8),
						type: CalendarDayType.NonWorking
					}),
					new DateTypeRange({
						startDate: UI5Date.getInstance(2015, 0, 3),
						endDate: UI5Date.getInstance(2015, 0, 4),
						type: CalendarDayType.Working
					})
				],
				intervalHeaders: [
					new CalendarAppointment("R1H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						type: CalendarDayType.Type02,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R1A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
						type: CalendarDayType.Type03,
						customContent: [
							new FlexBox({
								direction: "Column",
								items: [
									new MText({
										text: "TG2P11: Maintenance"
									}),
									new FlexBox({
										items: [
											new Icon({
												src: "sap-icon://pharmacy"
											}),
											new Icon({
												src: "sap-icon://add-product"
											}),
											new Icon({
												src: "sap-icon://employee-rejections"
											}),
											new Icon({
												src: "sap-icon://doctor"
											}),
											new Icon({
												src: "sap-icon://add-employee"
											})
										]
									})
								]
							})
						],
						title: "2 days meeting",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "2 days meeting",
						text: "Room 1"
					}),
					new CalendarAppointment("R1A2", {
						startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
						endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
						type: CalendarDayType.Type06,
						title: "Appointment 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home",
						tentative: true
					}),
					new CalendarAppointment("R1A3", {
						startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
						type: CalendarDayType.Type02,
						title: "Blocker 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R1A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
						type: CalendarDayType.Type09,
						title: "Meeting 4",
						tooltip: "Tooltip 4",
						selected: true
					})
				]
			}),
			new PlanningCalendarRow("Row2", {
				title: "This must not be shown",
				headerContent: {
					path: "/headerContentBinding",
					template: oOLI
				},
				intervalHeaders: [
					new CalendarAppointment("R2H1", {
						startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R2A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "Event 1",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "Tooltip 1",
						text: "Room 1"
					}),
					new CalendarAppointment("R2A2", {
						startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type02,
						title: "Event 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home"
					}),
					new CalendarAppointment("R2A3", {
						startDate: UI5Date.getInstance("2015", "0", "3", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "4", "23", "59"),
						type: CalendarDayType.Type03,
						title: "Event 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R2A4", {
						startDate: UI5Date.getInstance("2015", "1", "1", "00", "00"),
						endDate: UI5Date.getInstance("2015", "1", "28", "23", "59"),
						type: CalendarDayType.Type04,
						title: "Event 4",
						icon: "sap-icon://home",
						tooltip: "Tooltip 4"
					})
				]
			}),
			new PlanningCalendarRow("Row3", {
				icon: "sap-icon://palette",
				title: "Color Mixer",
				tooltip: "Colors",
				intervalHeaders: [
					new CalendarAppointment("R3H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						type: CalendarDayType.Type01,
						title: "Type01",
						tooltip: "Type01",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						type: CalendarDayType.Type02,
						title: "Type02",
						tooltip: "Type02",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						type: CalendarDayType.Type03,
						title: "Type03",
						tooltip: "Type03",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						type: CalendarDayType.Type04,
						title: "Type04",
						tooltip: "Type04",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						type: CalendarDayType.Type05,
						title: "Type05",
						tooltip: "Type05",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						type: CalendarDayType.Type06,
						title: "Type06",
						tooltip: "Type06",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						type: CalendarDayType.Type07,
						title: "Type07",
						tooltip: "Type07",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						type: CalendarDayType.Type08,
						title: "Type08",
						tooltip: "Type08",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						type: CalendarDayType.Type09,
						title: "Type09",
						tooltip: "Type09",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H10", {
						startDate: UI5Date.getInstance("2015", "0", "1", "17", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "17", "59"),
						type: CalendarDayType.Type10,
						title: "Type10",
						tooltip: "Type10",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H11", {
						startDate: UI5Date.getInstance("2015", "0", "1", "18", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "18", "59"),
						type: CalendarDayType.None,
						title: "None",
						tooltip: "None",
						icon: "sap-icon://palette"
					})
				],
				appointments: [
					new CalendarAppointment("R3A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						type: CalendarDayType.Type01,
						title: "Type01",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 1"
					}),
					new CalendarAppointment("R3A2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						type: CalendarDayType.Type02,
						title: "Type02",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 2"
					}),
					new CalendarAppointment("R3A3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						type: CalendarDayType.Type03,
						title: "Type03",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R3A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						type: CalendarDayType.Type04,
						title: "Type04",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 4"
					}),
					new CalendarAppointment("R3A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						type: CalendarDayType.Type05,
						title: "Type05",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 5"
					}),
					new CalendarAppointment("R3A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						type: CalendarDayType.Type06,
						title: "Type06",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 6"
					}),
					new CalendarAppointment("R3A7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						type: CalendarDayType.Type07,
						title: "Type07",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 7"
					}),
					new CalendarAppointment("R3A8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						type: CalendarDayType.Type08,
						title: "Type08",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 8"
					}),
					new CalendarAppointment("R3A9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						type: CalendarDayType.Type09,
						title: "Type09",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 9"
					}),
					new CalendarAppointment("R3A10", {
						startDate: UI5Date.getInstance("2015", "0", "1", "17", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "17", "59"),
						type: CalendarDayType.Type10,
						title: "Type10",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 10"
					}),
					new CalendarAppointment("R3A11", {
						startDate: UI5Date.getInstance("2015", "0", "1", "18", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "18", "59"),
						type: CalendarDayType.None,
						title: "None",
						icon: "sap-icon://palette",
						tooltip: "None"
					})
				]
			}),
			new PlanningCalendarRow("Row4", {
				title: "Custom Color",
				tooltip: "Custom Colors",
				intervalHeaders: [
					new CalendarAppointment("R4H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						color: "#c14646",
						title: "Red",
						tooltip: "Red",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4H2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						color: "#759421",
						title: "Green",
						tooltip: "Green",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4H3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						color: "#0092d1",
						title: "Blue",
						tooltip: "Blue",
						icon: "sap-icon://palette"
					})
				],
				appointments: [
					new CalendarAppointment("R4A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						color: "#e09d00",
						title: "#e09d00",
						tooltip: "#e09d00",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						color: "#e6600d",
						title: "#e6600d",
						tooltip: "#e6600d",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						color: "#c14646",
						title: "#c14646",
						tooltip: "#c14646",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						color: "#853808",
						title: "#853808",
						tooltip: "#853808",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						color: "#de54c1",
						title: "#de54c1",
						tooltip: "#de54c1",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						color: "#0092d1",
						title: "#0092d1",
						tooltip: "#0092d1",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						color: "#1a9898",
						title: "#1a9898",
						tooltip: "#1a9898",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						color: "#759421",
						title: "#759421",
						tooltip: "#759421",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						color: "#1fbbff",
						title: "#1fbbff",
						tooltip: "#1fbbff",
						icon: "sap-icon://palette"
					})
				]
			}),
			new PlanningCalendarRow("Row5", {
				icon: "sap-icon://employee",
				title: "Appointments of the same type",
				tooltip: "Header tooltip",
				intervalHeaders: [
					new CalendarAppointment("R5H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						type: CalendarDayType.Type02,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R5A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
						type: CalendarDayType.Type02,
						title: "2 days meeting",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "2 days meeting",
						text: "Room 1"
					}),
					new CalendarAppointment("R5A2", {
						startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
						endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
						type: CalendarDayType.Type02,
						title: "Appointment 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home",
						tentative: true
					}),
					new CalendarAppointment("R5A3", {
						startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
						type: CalendarDayType.Type02,
						title: "Blocker 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R5A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
						type: CalendarDayType.Type02,
						title: "Meeting 4",
						tooltip: "Tooltip 4",
						selected: true
					}),
					new CalendarAppointment("R5A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "30"),
						type: CalendarDayType.Type02,
						title: "Meeting 5",
						tooltip: "Tooltip 5",
						selected: true
					}),
					new CalendarAppointment("R5A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						type: CalendarDayType.Type02,
						title: "Meeting 5",
						tooltip: "Tooltip 5",
						selected: true
					})
				]
			})
		],
		specialDates: [
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 1, 12, 0),
				endDate: UI5Date.getInstance(2015, 0, 1, 14, 0),
				type: CalendarDayType.Type01,
				tooltip: "Lunch"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 6),
				type: CalendarDayType.Type02,
				tooltip: "Heilige 3 Könige"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 10),
				type: CalendarDayType.Type01,
				secondaryType: CalendarDayType.Working,
				tooltip: "Lunch"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 6),
				type: CalendarDayType.NonWorking
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 1, 1),
				endDate: UI5Date.getInstance(2015, 1, 3),
				type: CalendarDayType.Type03,
				tooltip: "Test",
				secondaryType: CalendarDayType.NonWorking
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 1, 4),
				endDate: UI5Date.getInstance(2015, 1, 4),
				type: CalendarDayType.Type03,
				color:"#4b0082",
				tooltip: "Test"
			})
		],
		toolbarContent: [
			oTitle,
			oSearchField,
			oMultiAppsSelectButton,
			oButton1,
			oButton2,
			oButtonAddAppointment,
			oButtonAddRow,
			oDeleteRowsButton,
			oButtonShowIntervalHeaders,
			oButtonShowRowHeaders,
			oButtonShowWeekNumbers,
			oButtonLegend,
			new ToolbarSeparator(),
			oLegendLabel,
			oButtonSwitchLegendAssociation,
			new ToolbarSeparator(),
			oButtonReducedHeight,
			oButtonToggleAlternatingRowColor,
			oButtonToggleSpecNoWork,
			oButtonMinMax,
			oButtonToggleShowDayNamesLine,
			oButtonToggleCustomViews,
			new ToolbarSeparator(),
			oVisLabel,
			oVisSelect,
			new ToolbarSeparator(),
			oGroupModeLabel,
			oGroupModeSelect
		],
		legend: oLegend,
		intervalSelect: handleIntervalSelect,
		appointmentSelect: handleAppointmentSelect,
		startDateChange: handleStartDateChange,
		rowHeaderPress: handleRowHeaderPress,
		rowSelectionChange: handleRowSelectionChange,
		noData: oIMNoData
	});

	var oLabel = new Label({
		labelFor: "I1", text: "Readonly"
	});

	var oInput = new Input("I1", {
		editable: false,
		width: "100%"
	});

	var page1 = new Page("page1", {
		title: "Mobile PlanningCalendar",
		titleLevel: TitleLevel.H1,
		content: [
			oPC1,
			oLabel,
			oInput
		],
		footer: createFooter()
	});

	app.setModel(oModel);
	app.addPage(page1);

	app.placeAt("body");
});
