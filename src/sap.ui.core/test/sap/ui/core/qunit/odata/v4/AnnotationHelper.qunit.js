/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/test/TestUtils"
], function (jQuery, BaseContext, AnnotationHelper, _SyncPromise, ODataMetaModel, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mScope = {
			"$Annotations" : {
				"tea_busi.Worker" : {
					"@UI.Facets" : [{
						"$Type" : "UI.ReferenceFacet",
						"Target" : {
							// term cast
							"$AnnotationPath" : "@UI.LineItem"
						}
					}, {
						"$Type" : "UI.ReferenceFacet",
						"Target" : {
							// term cast at navigation property itself
							"$AnnotationPath" : "EMPLOYEE_2_TEAM@Common.Label"
						}
					}, {
						"$Type" : "UI.ReferenceFacet",
						"Target" : {
							// navigation property and term cast
							"$AnnotationPath" : "EMPLOYEE_2_TEAM/@UI.LineItem"
						}
					}, {
						"$Type" : "UI.ReferenceFacet",
						"Target" : {
							// type cast, navigation properties and term cast (at its type)
							"$AnnotationPath"
								: "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem"
						}
					}]
				}
			},
			"$EntityContainer" : "tea_busi.DefaultContainer",
			// tea_busi := com.sap.gateway.iwbep.tea_busi.v0001
			"tea_busi." : {
				"$kind" : "Schema",
				"@Schema" : {}
			},
			"tea_busi.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"EMPLOYEES" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "TEAMS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"TEAMS" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "tea_busi.TEAM"
				}
			},
			"tea_busi.TEAM" : {
				"$kind" : "EntityType",
				"$Key" : ["Team_Id"],
				"Team_Id" : {
					"$kind" : "Property",
					"$Type" : "name.space.Id",
					"$Nullable" : false,
					"$MaxLength" : 10
				},
				"TEAM_2_EMPLOYEES" : {
					"$kind" : "NavigationProperty",
					"$isCollection" : true,
					"$Type" : "tea_busi.Worker"
				}
			},
			"tea_busi.Worker" : {
				"$kind" : "EntityType",
				"$Key" : ["ID"],
				"ID" : {
					"$kind" : "Property",
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 4
				},
				"EMPLOYEE_2_TEAM" : {
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.TEAM",
					"$Nullable" : false
				}
			}
		};

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.AnnotationHelper", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("isMultiple", function (assert) {
		var mFixture = {
				"" : false,
				"@UI.LineItem" : false,
				"EMPLOYEE_2_TEAM@Common.Label" : false,
				"EMPLOYEE_2_TEAM/@UI.LineItem" : false,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$count" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/@UI.LineItem" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES@Common.Label" : true,
				"tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem" : false
			},
			oMetaModel = new ODataMetaModel(),
			oContext = new BaseContext(oMetaModel), // Note: path does not matter
			sPath;

		this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1)
			.returns(_SyncPromise.resolve(mScope));

		for (sPath in mFixture) {
			assert.strictEqual(
				AnnotationHelper.isMultiple(sPath, {
					context : oContext,
					schemaChildName : "tea_busi.Worker"
				}),
				mFixture[sPath], sPath);
		}
	});
	//TODO later: if details are missing, loop back via oContext
	//TODO error handling? if path is wrong in annotation, a warning might be helpful --> later!
	//TODO multi-valued structural or navigation property "in between" are not recognized; maybe
	// add such checks only in case warnings would be logged?
});
//TODO can we avoid the export to the global namespace? ODataMetaModel needs jQuery.sap.getObject()!
