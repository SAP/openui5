sap.ui.define([
  "sap/m/PlanningCalendarLegend",
  "sap/ui/unified/library",
  "sap/ui/unified/CalendarLegendItem",
  "sap/m/App",
  "sap/m/Label",
  "sap/m/HBox",
  "sap/m/library",
  "sap/m/Input",
  "sap/m/Page",
  "sap/m/Panel",
  "sap/m/Button",
  "sap/m/Dialog",
  "sap/m/Popover",
  "sap/m/Bar"
], function(
  PlanningCalendarLegend,
  unifiedLibrary,
  CalendarLegendItem,
  App,
  Label,
  HBox,
  mobileLibrary,
  Input,
  Page,
  Panel,
  Button,
  Dialog,
  Popover,
  Bar
) {
  "use strict";

  // shortcut for sap.m.FlexAlignItems
  const FlexAlignItems = mobileLibrary.FlexAlignItems;

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // shortcut for sap.ui.unified.StandardCalendarLegendItem
  const StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;

  // Note: the HTML page 'PlanningCalendarLegend.html' loads this module via data-sap-ui-on-init

  var oPCLegendAll = new PlanningCalendarLegend({
	  standardItems: [StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay],
	  items: [
		  (function () { //creates items for all 20 values in CalendarDayType
			  var aAllItems = [], iMax = 20, sType = "";
			  for (var i = 1; i<=iMax; i++) {
				  sType = "Type" + (i < 10 ? "0" + i : i);
				  aAllItems.push(new CalendarLegendItem({
					  type: CalendarDayType[sType],
					  text: sType + ": calendar date related"
				  }));
			  }
			  return aAllItems;
		  })()
	  ],
	  appointmentItems: [
		  new CalendarLegendItem("T31", {
			  type: CalendarDayType.Type01,
			  text: "Type 1: calendar appointment related"
		  }),
		  new CalendarLegendItem("T32", {
			  type: CalendarDayType.Type02,
			  text: "Type 2: calendar appointment related"
		  }),
		  new CalendarLegendItem("T33", {
			  type: CalendarDayType.Type12,
			  text: "Type 12: calendar appointment related"
		  })
	  ]
  });

  var oPCLegendStandardItemsOnly = new PlanningCalendarLegend();
  var oPCLegendCustomStandardItemsOnly = new PlanningCalendarLegend({
	  standardItems: [StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay]
  });
  var oPCLegendDefaultStandardItemsAndCustomItems = new PlanningCalendarLegend({
	  items: [
		  new CalendarLegendItem("T1", {
			  type: CalendarDayType.Type01,
			  text: "Type 1 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T2", {
			  type: CalendarDayType.Type02,
			  text: "Type 2 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T3", {
			  type: CalendarDayType.Type03,
			  text: "Type 3 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T4", {
			  type: CalendarDayType.Type04,
			  text: "Type 4 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T5", {
			  type: CalendarDayType.Type05,
			  text: "Type 5 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T6", {
			  type: CalendarDayType.Type06,
			  text: "Type 6 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T7", {
			  type: CalendarDayType.Type07,
			  text: "Type 7 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T8", {
			  type: CalendarDayType.Type08,
			  text: "Type 8 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T9", {
			  type: CalendarDayType.Type09,
			  text: "Type 9 app developers can set the text to whatever they want"
		  }),
		  new CalendarLegendItem("T10", {
			  type: CalendarDayType.Type20,
			  text: "Type 20 app developers can set the text to whatever they want"
		  })
	  ]
  });
  //
  var oPCLegendCustomStandardItemsAndCustomItems = new PlanningCalendarLegend({
	  standardItems: [StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay],
	  items: [
		  new CalendarLegendItem("T11", {
			  type: CalendarDayType.Type01,
			  text: "Type 1"
		  }),
		  new CalendarLegendItem("T12", {
			  type: CalendarDayType.Type02,
			  text: "Type 2"
		  }),
		  new CalendarLegendItem("T13", {
			  type: CalendarDayType.Type03,
			  text: "Type 3"
		  }),
		  new CalendarLegendItem("T14", {
			  type: CalendarDayType.Type04,
			  text: "Type 4"
		  }),
		  new CalendarLegendItem("T15", {
			  type: CalendarDayType.Type05,
			  text: "Type 5"
		  }),
		  new CalendarLegendItem("T16", {
			  type: CalendarDayType.Type06,
			  text: "Type 6"
		  }),
		  new CalendarLegendItem("T17", {
			  type: CalendarDayType.Type07,
			  text: "Type 7"
		  }),
		  new CalendarLegendItem("T18", {
			  type: CalendarDayType.Type08,
			  text: "Type 8"
		  }),
		  new CalendarLegendItem("T19", {
			  type: CalendarDayType.Type09,
			  text: "Type 9"
		  }),
		  new CalendarLegendItem("T20", {
			  type: CalendarDayType.Type20,
			  text: "Type 20"
		  })
	  ]
  });

  var app = new App("myApp");

  var oEventLabel = new Label({text: "Events log"});


  function createChangeWidthInput(oPCLegend) {
	  return new HBox({
		  alignItems: FlexAlignItems.Center,
		  items: [
			  new Label({text: "columnWidth:"}),
			  new Input({
				  value: "auto",
				  width: "100px",
				  change: function (oEvent) {
					  oPCLegend.setColumnWidth(oEvent.getParameter("newValue"));
				  }
			  })]
	  });
  }
  const oPCLCompact = oPCLegendAll.clone().addStyleClass("sapUiSizeCompact");
  var oPage = new Page("oPlanningCalendarLegendPage", {
	  title: "PlanningCalendarLegend",
	  content: [
		  new HBox({
			  items: [
				  new Panel({
					  headerText: "PlanningCalendarLegend with custom standard items & custom items & appointment items",
					  content: [createChangeWidthInput(oPCLegendAll), oPCLegendAll]
				  }),
				  new Panel({
					  headerText: "PlanningCalendarLegend in compact mode",
					  content: [createChangeWidthInput(oPCLCompact), oPCLCompact]
				  }),
				  new Panel({
					  headerText: "PlanningCalendarLegend with default standard items & custom items",
					  content: [createChangeWidthInput(oPCLegendDefaultStandardItemsAndCustomItems), oPCLegendDefaultStandardItemsAndCustomItems]
				  })
			  ]
		  }),
		  new HBox({
			  items: [
				  new Panel({
					  headerText: "PlanningCalendarLegend with default standard items only",
					  content: [createChangeWidthInput(oPCLegendStandardItemsOnly), oPCLegendStandardItemsOnly]
				  }),
				  new Panel({
					  headerText: "PlanningCalendarLegend with custom standard items only",
					  content: [createChangeWidthInput(oPCLegendCustomStandardItemsOnly), oPCLegendCustomStandardItemsOnly]
				  }),
			  ]
		  }),
		  new HBox({
			  items: [
				  new Panel({
					  headerText: "PlanningCalendarLegend with custom standard items & custom items",
					  content: [createChangeWidthInput(oPCLegendCustomStandardItemsAndCustomItems), oPCLegendCustomStandardItemsAndCustomItems]
				  }),
				  new Panel({
					  headerText: "PlanningCalendarLegend in Dialog and Popover",
					  content: [
						  new Button({text: "Open Legend in Dialog", press: function() {
						  if (!this._oDialog) {
							  this._oDialog = new Dialog({
								  title: "PlanningCalendar Legend in sap.m.Dialog",
								  content: [oPCLegendDefaultStandardItemsAndCustomItems.clone()],
								  endButton: new Button({
									  text: "Close",
									  press: function() {
										  this.getParent().close();
									  }
								  })
							  });
						  }
						  this._oDialog.open();
					  }}),
						  new Button({text: "Open Legend as Popover", press: function() {
							  if (!this._oPopover) {
								  this._oPopover = new Popover({
									  content: [oPCLegendDefaultStandardItemsAndCustomItems.clone()],
									  showHeader: false
								  });
							  }
							  this._oPopover.openBy(this);
						  }}),
					  ]
				  }),
			  ]
		  }),
	  ],
	  footer: new Bar({contentMiddle: [oEventLabel]})
  });

  app.addPage(oPage);
  app.placeAt("body");
});