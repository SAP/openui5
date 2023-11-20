sap.ui.define(["sap/ui/integration/Host"], function (Host) {
	"use strict";
	return function (id) {
		var oHost = new Host(id, {
			resolveDestination: function (name) {
				if (name === "local") {
					//resolve local to local path
					return "./";
				}
				if (name === "Northwind") {
					return "https://services.odata.org/V3/Northwind/Northwind.svc";
				}
				if (name === "mock_request") {
					return "/mock_request";
				}
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
				},
				{
					"name": "Northwind"
				},
				{
					"name": "mock_request"
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

		oHost.getContext = function () {
			var context = {
				"sap.workzone": {
					label: "SAP Work Zone",
					currentUser: {
						label: "Current User",
						id: {
							label: "Id of the Work Zone user",
							type: "string",
							tags: ["technical"],
							placeholder: "Work Zone user id",
							description:
								"Id of the current user. The value will change based on the logged on user. To show the users name, use 'Name of the Work Zone user'",
							value: "MyCurrentUserId"
						},
						name: {
							label: "Name of the Work Zone user",
							type: "string",
							placeholder: "Work Zone user name",
							description:
								"Name of the current user with first, middle and last name. The middle name will be abbreviated. The value will change based on the logged on user",
							value: "Mary J. O'Anna"
						},
						email: {
							label:
								"Email address of current Work Zone user",
							type: "string",
							placeholder: "Work Zone user email",
							description:
								"Email address of current Work Zone user. The value will change based on the logged on user.",
							value: "mary.oanna@company.com"
						}
					},
					currentWorkspace: {
						label: "Current Workspace",
						id: {
							label: "Id of a workspace",
							type: "string",
							tags: ["technical"],
							placeholder: "Workspace Id",
							description:
								"Id of a workspace where the card is added by a page administrator.",
							value: "workspaceId"
						},
						name: {
							label: "Name of a Workspace",
							type: "string",
							placeholder: "Workspace Name",
							description:
								"Name of a workspace where the card is added by a page administrator.",
							value: null
						}
					},
					currentCompany: {
						label: "Current Company",
						id: {
							label: "Id of the current company",
							type: "string",
							tags: ["technical"],
							placeholder: "Id of the company",
							description:
								"Id of the company where the card is added by a page administrator.",
							value: "CompanyId"
						},
						name: {
							label: "Name of the company",
							type: "string",
							placeholder: "Name of the company",
							description:
								"Name of the company where the card is added by a page administrator.",
							value: "Company Nice Name"
						},
						webHost: {
							label: "Work Zone Hostname",
							type: "string",
							tags: ["technical"],
							placeholder: "Work Zone Hostname",
							description:
								"The host name of your Work Zone system.",
							value: "wz.host.name.ondemand.com"
						}
					}
				},
				"sap.successfactors": {
					label: "SAP SucessFactors",
					currentUser: {
						label: "Current User",
						id: {
							label: "Success Factors User Id",
							type: "string",
							tags: ["technical"],
							placeholder: "Success Factors User Id",
							description:
								"The user id of the connected Success Factors system. The value will change based on the logged on user.",
							value: "SFUserId"
						}
					},
					currentCompany: {
						label: "Current Company",
						id: {
							label: "Success Factors Company Id",
							type: "string",
							tags: ["technical"],
							placeholder: "Success Factors Company Id",
							description:
								"The company id the connected Success Factors system. The value will change in case a different SF company is used.",
							value: "SFCompanyId"
						},
						webHost: {
							label: "Success Factors Hostname",
							type: "string",
							placeholder: "Success Factors Hostname",
							tags: ["technical"],
							description:
								"The hostname of the connected Success Factors system. The value will change in case a different SF host is used.",
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