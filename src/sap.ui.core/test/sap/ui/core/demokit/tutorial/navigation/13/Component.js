sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.navigation.13.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/controller/employee/overview/EmployeeOverview.controller.js",
							"webapp/controller/employee/overview/EmployeeOverviewContent.controller.js",
							"webapp/controller/employee/Employee.controller.js",
							"webapp/controller/employee/EmployeeList.controller.js",
							"webapp/controller/employee/Resume.controller.js",
							"webapp/controller/App.controller.js",
							"webapp/controller/BaseController.js",
							"webapp/controller/Home.controller.js",
							"webapp/controller/NotFound.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/view/employee/overview/EmployeeOverview.view.xml",
							"webapp/view/employee/overview/EmployeeOverviewContent.view.xml",
							"webapp/view/employee/overview/EmployeeOverviewTop.view.xml",
							"webapp/view/employee/Employee.view.xml",
							"webapp/view/employee/EmployeeList.view.xml",
							"webapp/view/employee/Resume.view.xml",
							"webapp/view/employee/ResumeHobbies.view.xml",
							"webapp/view/employee/ResumeNotes.view.xml",
							"webapp/view/employee/ResumeProjects.view.xml",
							"webapp/view/App.view.xml",
							"webapp/view/Home.view.xml",
							"webapp/view/NotFound.view.xml",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/initMockServer.js",
							"webapp/manifest.json",
							"webapp/localService/mockdata/Employees.json",
							"webapp/localService/metadata.xml",
							"webapp/localService/mockdata/Resumes.json",
							"webapp/localService/mockserver.js",
							"ui5.yaml",
							"package.json"
						]
					}
				}
			}

		});

		return Component;
	});
