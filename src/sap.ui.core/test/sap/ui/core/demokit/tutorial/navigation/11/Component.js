sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.navigation.11.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"/webapp/controller/employees/overview/EmployeesOverview.controller.js",
							"/webapp/controller/employees/overview/EmployeesOverviewContent.controller.js",
							"/webapp/controller/employees/Employee.controller.js",
							"/webapp/controller/employees/EmployeeList.controller.js",
							"/webapp/controller/employees/Resume.controller.js",
							"/webapp/controller/App.controller.js",
							"/webapp/controller/BaseController.js",
							"/webapp/controller/Home.controller.js",
							"/webapp/controller/NotFound.controller.js",
							"/webapp/i18n/i18n.properties",
							"/webapp/view/employees/overview/EmployeesOverview.view.xml",
							"/webapp/view/employees/overview/EmployeesOverviewContent.view.xml",
							"/webapp/view/employees/overview/EmployeesOverviewTop.view.xml",
							"/webapp/view/employees/Employee.view.xml",
							"/webapp/view/employees/EmployeeList.view.xml",
							"/webapp/view/employees/Resume.view.xml",
							"/webapp/view/employees/ResumeHobbies.view.xml",
							"/webapp/view/employees/ResumeNotes.view.xml",
							"/webapp/view/employees/ResumeProjects.view.xml",
							"/webapp/view/App.view.xml",
							"/webapp/view/Home.view.xml",
							"/webapp/view/NotFound.view.xml",
							"/webapp/Component.js",
							"/webapp/index.html",
							"/webapp/manifest.json",
							"/webapp/localService/mockdata/Employees.json",
							"/webapp/localService/metadata.xml",
							"/webapp/localService/mockdata/Resumes.json",
							"/webapp/localService/mockserver.js"
						]
					}
				}
			}

		});

		return Component;
	});
