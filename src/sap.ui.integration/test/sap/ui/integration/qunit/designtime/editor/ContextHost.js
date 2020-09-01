sap.ui.define(["sap/ui/integration/Host"], function (Host) {
	"use strict";
	return function (id) {
		var oHost = new Host(id, {
			resolveDestination: function (name) {
				return Promise.resolve("https://" + name);
			}
		});

		oHost.getDestinations = function () {
			return Promise.resolve([
				{
					"name": "products"
				},
				{
					"name": "JAM"
				},
				{
					"name": "portal"
				},
				{
					"name": "SF"
				}
			]);
		};

		oHost.getContextValue = function (sPath) {
			return this.getContext().then(function (oNode) {
				var aParts = sPath.split("/"),
					iIndex = 0;
				while (oNode && aParts[iIndex]) {
					oNode = oNode[aParts[iIndex]];
					iIndex++;
				}
				return oNode;
			});
		};

		oHost.getContext = function (bDesigntime) {
			var context = {
				"sap.workzone": {
					currentUser: {
						id: {
							label: "Id of the Work Zone user",
							placeholder: "Work Zone user id",
							description:
								"The value will change based on the logged on user. The current value for your user is {1}",
							value: "MyCurrentUserId"
						},
						name: {
							label: "Name of the Work Zone user",
							placeholder: "Work Zone user name",
							description:
								"The value will change based on the logged on user. The current value for your user is {1}",
							value: "My Full Name"
						},
						email: {
							label:
								"Email address of current Work Zone user",
							placeholder: "Work Zone user email",
							description:
								"The value will change based on the logged on user. The current value for your user is {1}",
							value: "my.mail@company.com"
						}
					},
					currentWorkspace: {
						id: {
							label: "Id of this workspace",
							placeholder: "Workspace id",
							description:
								"The value will change based on the current workspace a widget is included. The current value is: {1}",
							value: "workspaceId"
						},
						name: {
							label: "Name of this Workspace",
							placeholder: "Workspace name",
							description:
								"The value will change based on the current workspace a widget is included. The current value is: {1}",
							value: "Workspace Name"
						}
					},
					currentCompany: {
						id: {
							label: "Id of the company",
							description:
								"The value will change in case a different company is used. The current value is: {1}",
							placeholder: "Workspace name",
							value: "CompanyId"
						},
						name: {
							label: "Name of the company",
							description:
								"The value will change in case a different company is used. The current value is: {1}",
							value: "Company Nice Name"
						},
						webHost: {
							label: "Work Zone Host",
							description:
								"The value will change in case a different company is used. The current value is: {1}",
							value: "wz.host.name.ondemand.com"
						}
					}
				},
				"sap.successfactors": {
					currentUser: {
						id: {
							description:
								"The value will change based on the logged on user. The current value is: {1}",
							value: "SFUserId"
						}
					},
					currentCompany: {
						id: {
							label: "Success Factors Company Id",
							description:
								"The value will change in case a different company is used. The current value is: {1}",
							value: "SFCompanyId"
						},
						webHost: {
							label: "Success Factors Host",
							description:
								"The value will change in case a different company is used. The current value is: {1}",
							value: "sf.host.name.ondemand.com"
						}
					}
				}
			};
			return Promise.resolve(context);
		};
		return oHost;
	};
});