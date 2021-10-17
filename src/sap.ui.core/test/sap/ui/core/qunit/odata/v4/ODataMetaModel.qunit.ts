import Log from "sap/base/Log";
import JSTokenizer from "sap/base/util/JSTokenizer";
import uid from "sap/base/util/uid";
import SyncPromise from "sap/ui/base/SyncPromise";
import BindingMode from "sap/ui/model/BindingMode";
import ChangeReason from "sap/ui/model/ChangeReason";
import ClientListBinding from "sap/ui/model/ClientListBinding";
import BaseContext from "sap/ui/model/Context";
import ContextBinding from "sap/ui/model/ContextBinding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import MetaModel from "sap/ui/model/MetaModel";
import Model from "sap/ui/model/Model";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import Sorter from "sap/ui/model/Sorter";
import OperationMode from "sap/ui/model/odata/OperationMode";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import Context from "sap/ui/model/odata/v4/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ValueListType from "sap/ui/model/odata/v4/ValueListType";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import TestUtils from "sap/ui/test/TestUtils";
import URI from "sap/ui/thirdparty/URI";
var mMostlyEmptyScope = {
    "$Annotations": {},
    "$EntityContainer": "empty.DefaultContainer",
    "$Version": "4.0",
    "empty.": {
        "$kind": "Schema"
    },
    "empty.DefaultContainer": {
        "$kind": "EntityContainer"
    }
}, sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel", mProductScope = {
    "$EntityContainer": "tea_busi_product.v0001.DefaultContainer",
    "$Reference": {
        "../../../../default/iwbep/tea_busi_supplier/0001/$metadata": {
            "$Include": [
                "tea_busi_supplier.v0001."
            ]
        }
    },
    "$Version": "4.0",
    "tea_busi_product.v0001.": {
        "$kind": "Schema",
        "$Annotations": {
            "tea_busi_product.v0001.Category/CategoryName": {
                "@Common.Label": "CategoryName from tea_busi_product.v0001."
            }
        }
    },
    "tea_busi_product.v0001.Category": {
        "$kind": "EntityType",
        "CategoryName": {
            "$kind": "Property",
            "$Type": "Edm.String"
        }
    },
    "tea_busi_product.v0001.DefaultContainer": {
        "$kind": "EntityContainer"
    },
    "tea_busi_product.v0001.Product": {
        "$kind": "EntityType",
        "Name": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "PRODUCT_2_CATEGORY": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi_product.v0001.Category"
        },
        "PRODUCT_2_SUPPLIER": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi_supplier.v0001.Supplier"
        }
    }
}, sSampleServiceUrl = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/", mScope = {
    "$Annotations": {
        "name.space.EnumType": {
            "@Common.Label": "EnumType label"
        },
        "name.space.EnumType/A": {
            "@Common.Label": "Label of A"
        },
        "name.space.EnumType/B": {
            "@Common.Label": "Label of B"
        },
        "name.space.EnumType64/Z": {
            "@Common.Label": "Label of Z",
            "@Common.Text": {
                "$Path": "Z@Common.Label"
            }
        },
        "name.space.Id": {
            "@Common.Label": "ID"
        },
        "name.space.OverloadedAction/_it": {
            "@Common.Label": "_it's own label"
        },
        "name.space.OverloadedAction()": {
            "@Core.OperationAvailable": {
                "$Path": "parameter0/-1"
            },
            "@Core.OperationAvailable#1": {
                "$Path": "$ReturnType"
            },
            "@Core.OperationAvailable#2": false
        },
        "name.space.OverloadedAction()/parameter0": {
            "@Common.Label": "Zero"
        },
        "name.space.OverloadedAction(tea_busi.TEAM)": {
            "@Core.OperationAvailable": {
                "$Path": "_it/Name"
            }
        },
        "name.space.OverloadedAction(tea_busi.TEAM)/parameter1": {
            "@Common.Label": "My 1st label",
            "@Common.Text": {
                "$Path": "_it/Name"
            },
            "@Core.OperationAvailable": {
                "$Path": "_it/TEAM_2_CONTAINED_S/Id"
            }
        },
        "name.space.OverloadedBoundFunction/_it": {
            "@Common.Label": "_it's own label"
        },
        "name.space.OverloadedFunction": {
            "@Common.Label": "OverloadedFunction's label across all overloads"
        },
        "name.space.OverloadedFunction/A": {
            "@Common.Label": "A's own label"
        },
        "name.space.OverloadedFunction/B": {
            "@Common.Label": "B's own label",
            "@Common.Text": {
                "$Path": "A/Road_2_Nowhere"
            },
            "@Common.Text@UI.TextArrangement": {
                "$EnumMember": "UI.TextArrangementType/TextLast"
            }
        },
        "name.space.VoidAction": {
            "@Core.OperationAvailable": {
                "$Path": "$ReturnType"
            }
        },
        "name.space.VoidAction/$ReturnType": {
            "@Common.Label": "invalid annotation, there is no return type!"
        },
        "tea_busi.AcChangeManagerOfTeam()/ManagerID": {
            "@Common.Label": "New Manager ID"
        },
        "tea_busi.AcChangeManagerOfTeam()/$ReturnType": {
            "@Common.Label": "Hail to the Chief"
        },
        "tea_busi.ComplexType_Salary": {
            "@Common.Label": "Salary"
        },
        "tea_busi.DefaultContainer": {
            "@DefaultContainer": {}
        },
        "tea_busi.DefaultContainer/Me": {
            "@Singleton": {
                Age: {
                    "$Path": "AGE"
                },
                EMPLOYEE_2_TEAM: {
                    "$Path": "EMPLOYEE_2_TEAM"
                },
                Empty: {
                    "$Path": ""
                }
            }
        },
        "tea_busi.DefaultContainer/OverloadedAction": {
            "@Common.Label": "OverloadAction import's label"
        },
        "tea_busi.DefaultContainer/T\u20ACAMS": {
            "@Capabilities.DeleteRestrictions": {
                Deletable: {
                    "$Path": "TEAM_2_MANAGER/TEAM_ID"
                },
                Empty: {
                    "$Path": ""
                }
            },
            "@Session.StickySessionSupported": {
                NewAction: "tea_busi.NewAction",
                "NewAction@Common.Label": "New Team"
            },
            "@T\u20ACAMS": {}
        },
        "tea_busi.NewAction": {
            "@Common.Label": "n/a",
            "@Common.QuickInfo": "Hello, world!",
            "@Core.OperationAvailable": {
                "$PropertyPath": "n/a"
            }
        },
        "tea_busi.NewAction/Team_Id": {
            "@Common.Label": "n/a",
            "@Common.Text": {
                "$Path": "_it/Name"
            },
            "@Common.ValueListWithFixedValues": true
        },
        "tea_busi.NewAction/$ReturnType": {
            "@Common.Label": "Return type's label across all overloads"
        },
        "tea_busi.NewAction(Collection(tea_busi.TEAM))": {
            "@Common.Label": "Create New Team",
            "@Core.OperationAvailable": {
                "$Path": "_it/Name"
            }
        },
        "tea_busi.NewAction(Collection(tea_busi.TEAM))/Team_Id": {
            "@Common.Label": "New Team ID",
            "@Common.Text": {
                "$AnnotationPath": "_it/Name@Common.Label"
            }
        },
        "tea_busi.NewAction(Collection(tea_busi.TEAM))/$ReturnType": {
            "@Common.Label": "Return type's label for individual overload"
        },
        "tea_busi.NewAction(tea_busi.Worker)": {
            "@Common.Label": "Create New Employee"
        },
        "tea_busi.TEAM": {
            "@Common.Text": {
                "$Path": "Name"
            },
            "@Common.Text@UI.TextArrangement": {
                "$EnumMember": "UI.TextArrangementType/TextLast"
            },
            "@Session.StickySessionSupported#EntityType": {
                NewAction: "tea_busi.NewAction"
            },
            "@Type": {
                Empty: {
                    "$Path": ""
                }
            },
            "@UI.Badge": {
                "@Common.Label": "Label inside",
                "$Type": "UI.BadgeType",
                "HeadLine": {
                    "$Type": "UI.DataField",
                    "Value": {
                        "$Path": "Name"
                    }
                },
                "Title": {
                    "$Type": "UI.DataField",
                    "Value": {
                        "$Path": "Team_Id"
                    }
                }
            },
            "@UI.Badge@Common.Label": "Best Badge Ever!",
            "@UI.LineItem": [{
                    "@UI.Importance": {
                        "$EnumMember": "UI.ImportanceType/High"
                    },
                    "$Type": "UI.DataFieldWithNavigationPath",
                    "Label": "Team ID",
                    "Label@Common.Label": "Team ID's Label",
                    "Target": {
                        "$NavigationPropertyPath": "TEAM_2_EMPLOYEES"
                    },
                    "Value": {
                        "$Path": "Team_Id"
                    }
                }]
        },
        "tea_busi.TEAM/Name": {
            "@Common.Label": "Team Name"
        },
        "tea_busi.TEAM/TEAM_2_EMPLOYEES": {
            "@Common.MinOccurs": 1
        },
        "tea_busi.TEAM/Team_Id": {
            "@Common.Label": "Team ID",
            "@Common.Text": {
                "$Path": "Name"
            },
            "@Common.Text@UI.TextArrangement": {
                "$EnumMember": "UI.TextArrangementType/TextLast"
            }
        },
        "tea_busi.Worker": {
            "@Common.Text": {
                "$If": [true, {
                        "$Path": "Name"
                    }]
            },
            "@Type": {
                Empty: {
                    "$Path": ""
                }
            },
            "@UI.Facets": [{
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "@UI.LineItem"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "EMPLOYEE_2_TEAM@Common.Label"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "EMPLOYEE_2_TEAM/@UI.LineItem"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem"
                    }
                }],
            "@UI.LineItem": [{
                    "$Type": "UI.DataField",
                    "Label": "Team ID",
                    "Value": {
                        "$Path": "EMPLOYEE_2_TEAM/Team_Id"
                    }
                }]
        },
        "tea_busi.Worker/EMPLOYEE_2_TEAM": {
            "@Common.Label": "Employee's Team"
        }
    },
    "$EntityContainer": "tea_busi.DefaultContainer",
    "empty.": {
        "$kind": "Schema"
    },
    "name.space.": {
        "$kind": "Schema"
    },
    "tea_busi.": {
        "$kind": "Schema",
        "@Schema": {}
    },
    "empty.Container": {
        "$kind": "EntityContainer"
    },
    "name.space.BadContainer": {
        "$kind": "EntityContainer",
        "DanglingActionImport": {
            "$kind": "ActionImport",
            "$Action": "not.Found"
        },
        "DanglingFunctionImport": {
            "$kind": "FunctionImport",
            "$Function": "not.Found"
        }
    },
    "name.space.Broken": {
        "$kind": "Term",
        "$Type": "not.Found"
    },
    "name.space.BrokenFunction": [{
            "$kind": "Function",
            "$ReturnType": {
                "$Type": "not.Found"
            }
        }],
    "name.space.BrokenOverloads": [{
            "$kind": "Operation"
        }],
    "name.space.DerivedPrimitiveFunction": [{
            "$kind": "Function",
            "$ReturnType": {
                "$Type": "name.space.Id"
            }
        }],
    "name.space.EmptyOverloads": [],
    "name.space.EnumType": {
        "$kind": "EnumType",
        "A": 0,
        "B": 1
    },
    "name.space.EnumType64": {
        "$kind": "EnumType",
        "$UnderlyingType": "Edm.Int64",
        "Z": "0"
    },
    "name.space.Id": {
        "$kind": "TypeDefinition",
        "$UnderlyingType": "Edm.String",
        "$MaxLength": 10
    },
    "name.space.Term": {
        "$kind": "Term",
        "$Type": "tea_busi.Worker"
    },
    "name.space.OverloadedAction": [{
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.EQUIPMENT"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.EQUIPMENT"
            }
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.TEAM"
                }, {
                    "$Name": "parameter1",
                    "$Type": "Edm.String"
                }, {
                    "$Name": "parameter2",
                    "$Type": "Edm.Decimal"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.TEAM"
            }
        }, {
            "$kind": "Action",
            "$Parameter": [{
                    "$isCollection": true,
                    "$Name": "parameter0",
                    "$Type": "Edm.String"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.ComplexType_Salary"
            }
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.Worker"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.Worker"
            }
        }],
    "name.space.OverloadedBoundFunction": [{
            "$kind": "Function",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.Worker"
                }, {
                    "$Name": "A",
                    "$Type": "Edm.Boolean"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.Worker"
            }
        }, {
            "$kind": "Function",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.TEAM"
                }, {
                    "$Name": "B",
                    "$Type": "Edm.Date"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.TEAM"
            }
        }, {
            "$kind": "Function",
            "$Parameter": [{
                    "$Name": "C",
                    "$Type": "Edm.String"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.ComplexType_Salary"
            }
        }],
    "name.space.OverloadedFunction": [{
            "$kind": "Function",
            "$Parameter": [{
                    "$Name": "A",
                    "$Type": "Edm.String"
                }],
            "$ReturnType": {
                "$Type": "Edm.String"
            }
        }, {
            "$kind": "Function",
            "$Parameter": [{
                    "$Name": "B",
                    "$Type": "Edm.String"
                }],
            "$ReturnType": {
                "$Type": "Edm.String"
            }
        }],
    "name.space.VoidAction": [{
            "$kind": "Action"
        }],
    "tea_busi.AcChangeManagerOfTeam": [{
            "$kind": "Action",
            "$Parameter": [{
                    "$Name": "TEAM",
                    "$Type": "tea_busi.TEAM"
                }, {
                    "$Name": "ManagerID",
                    "$Type": "Edm.String"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.TEAM"
            }
        }],
    "tea_busi.ComplexType_Salary": {
        "$kind": "ComplexType",
        "AMOUNT": {
            "$kind": "Property",
            "$Type": "Edm.Decimal"
        },
        "CURRENCY": {
            "$kind": "Property",
            "$Type": "Edm.String"
        }
    },
    "tea_busi.ContainedC": {
        "$kind": "EntityType",
        "$Key": ["Id"],
        "Id": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "C_2_EMPLOYEE": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.Worker"
        },
        "C_2_S": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.ContainedS"
        }
    },
    "tea_busi.ContainedS": {
        "$kind": "EntityType",
        "$Key": ["Id"],
        "Id": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "S_2_C": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$isCollection": true,
            "$Type": "tea_busi.ContainedC"
        },
        "S_2_EMPLOYEE": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.Worker"
        }
    },
    "tea_busi.DefaultContainer": {
        "$kind": "EntityContainer",
        "ChangeManagerOfTeam": {
            "$kind": "ActionImport",
            "$Action": "tea_busi.AcChangeManagerOfTeam"
        },
        "EMPLOYEES": {
            "$kind": "EntitySet",
            "$NavigationPropertyBinding": {
                "EMPLOYEE_2_EQUIPM\u20ACNTS": "EQUIPM\u20ACNTS",
                "EMPLOYEE_2_TEAM": "T\u20ACAMS"
            },
            "$Type": "tea_busi.Worker"
        },
        "EQUIPM\u20ACNTS": {
            "$kind": "EntitySet",
            "$Type": "tea_busi.EQUIPMENT"
        },
        "GetEmployeeMaxAge": {
            "$kind": "FunctionImport",
            "$Function": "tea_busi.FuGetEmployeeMaxAge"
        },
        "MANAGERS": {
            "$kind": "EntitySet",
            "$Type": "tea_busi.MANAGER"
        },
        "Me": {
            "$kind": "Singleton",
            "$NavigationPropertyBinding": {
                "EMPLOYEE_2_TEAM": "T\u20ACAMS",
                "EMPLOYEE_2_EQUIPM\u20ACNTS": "EQUIPM\u20ACNTS"
            },
            "$Type": "tea_busi.Worker"
        },
        "OverloadedAction": {
            "$kind": "ActionImport",
            "$Action": "name.space.OverloadedAction"
        },
        "OverloadedFunctionImport": {
            "$kind": "FunctionImport",
            "$Function": "name.space.OverloadedBoundFunction"
        },
        "ServiceGroups": {
            "$kind": "EntitySet",
            "$Type": "tea_busi.ServiceGroup"
        },
        "TEAMS": {
            "$kind": "EntitySet",
            "$NavigationPropertyBinding": {
                "TEAM_2_CONTAINED_S/S_2_EMPLOYEE": "EMPLOYEES",
                "TEAM_2_CONTAINED_S/S_2_C/C_2_S/S_2_EMPLOYEE": "EMPLOYEES",
                "TEAM_2_EMPLOYEES": "EMPLOYEES",
                "TEAM_2_MANAGER": "MANAGERS"
            },
            "$Type": "tea_busi.TEAM"
        },
        "T\u20ACAMS": {
            "$kind": "EntitySet",
            "$NavigationPropertyBinding": {
                "TEAM_2_EMPLOYEES": "EMPLOYEES"
            },
            "$Type": "tea_busi.TEAM"
        },
        "VoidAction": {
            "$kind": "ActionImport",
            "$Action": "name.space.VoidAction"
        }
    },
    "tea_busi.EQUIPMENT": {
        "$kind": "EntityType",
        "$Key": ["ID"],
        "ID": {
            "$kind": "Property",
            "$Type": "Edm.Int32",
            "$Nullable": false
        }
    },
    "tea_busi.FuGetEmployeeMaxAge": [{
            "$kind": "Function",
            "$ReturnType": {
                "$Type": "Edm.Int16"
            }
        }],
    "tea_busi.MANAGER": {
        "$kind": "EntityType",
        "$Key": ["ID"],
        "ID": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 4
        },
        "TEAM_ID": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 10
        }
    },
    "tea_busi.NewAction": [{
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$isCollection": true,
                    "$Name": "_it",
                    "$Type": "tea_busi.EQUIPMENT"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.EQUIPMENT"
            }
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$isCollection": true,
                    "$Name": "_it",
                    "$Type": "tea_busi.TEAM"
                }, {
                    "$Name": "Team_Id",
                    "$Type": "name.space.Id"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.TEAM"
            }
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "tea_busi.Worker"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.Worker"
            }
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$isCollection": true,
                    "$Name": "_it",
                    "$Type": "tea_busi.Worker"
                }],
            "$ReturnType": {
                "$Type": "tea_busi.Worker"
            }
        }],
    "tea_busi.ServiceGroup": {
        "$kind": "EntityType",
        "DefaultSystem": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.System"
        }
    },
    "tea_busi.System": {
        "$kind": "EntityType",
        "SystemAlias": {
            "$kind": "Property",
            "$Type": "Edm.String"
        }
    },
    "tea_busi.TEAM": {
        "$kind": "EntityType",
        "$Key": ["Team_Id"],
        "Team_Id": {
            "$kind": "Property",
            "$Type": "name.space.Id",
            "$Nullable": false,
            "$MaxLength": 10
        },
        "Name": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 40
        },
        "TEAM_2_MANAGER": {
            "$kind": "NavigationProperty",
            "$ReferentialConstraint": {
                "foo": "bar",
                "foo@Common.Label": "Just a Gigolo",
                "Address/Country": "WorkAddress/Country",
                "Address/Country@Common.Label": "Common Country"
            },
            "$Type": "tea_busi.MANAGER"
        },
        "TEAM_2_EMPLOYEES": {
            "$kind": "NavigationProperty",
            "$isCollection": true,
            "$OnDelete": "None",
            "$OnDelete@Common.Label": "None of my business",
            "$Type": "tea_busi.Worker"
        },
        "TEAM_2_CONTAINED_S": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.ContainedS"
        },
        "TEAM_2_CONTAINED_C": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$isCollection": true,
            "$Type": "tea_busi.ContainedC"
        },
        "value": {
            "$kind": "Property",
            "$Type": "Edm.String"
        }
    },
    "tea_busi.Worker": {
        "$kind": "EntityType",
        "$Key": ["ID"],
        "ID": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 4
        },
        "AGE": {
            "$kind": "Property",
            "$Type": "Edm.Int16",
            "$Nullable": false
        },
        "EMPLOYEE_2_CONTAINED_S": {
            "$ContainsTarget": true,
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.ContainedS"
        },
        "EMPLOYEE_2_EQUIPM\u20ACNTS": {
            "$kind": "NavigationProperty",
            "$isCollection": true,
            "$Type": "tea_busi.EQUIPMENT",
            "$Nullable": false
        },
        "EMPLOYEE_2_TEAM": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.TEAM",
            "$Nullable": false
        },
        "SAL\u00C3RY": {
            "$kind": "Property",
            "$Type": "tea_busi.ComplexType_Salary"
        }
    },
    "$$Loop": "$$Loop/",
    "$$Term": "name.space.Term"
}, oContainerData = mScope["tea_busi.DefaultContainer"], aOverloadedAction = mScope["name.space.OverloadedAction"], aOverloadedBoundFunction = mScope["name.space.OverloadedBoundFunction"], mReducedPathScope = {
    "$Annotations": {},
    "$EntityContainer": "reduce.path.DefaultContainer",
    "reduce.path.": {
        "$kind": "Schema"
    },
    "reduce.path.A": {
        "$kind": "EntityType",
        "AValue": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "AtoB": {
            "$kind": "NavigationProperty",
            "$Partner": "BtoA",
            "$Type": "reduce.path.B"
        },
        "AtoC": {
            "$kind": "NavigationProperty",
            "$Partner": "CtoA",
            "$Type": "reduce.path.C"
        },
        "AtoDs": {
            "$isCollection": true,
            "$kind": "NavigationProperty",
            "$Partner": "DtoA",
            "$Type": "reduce.path.D"
        }
    },
    "reduce.path.B": {
        "$kind": "EntityType",
        "BValue": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "BtoA": {
            "$kind": "NavigationProperty",
            "$Partner": "AtoB",
            "$Type": "reduce.path.A"
        },
        "BtoC": {
            "$kind": "NavigationProperty",
            "$Partner": "CtoB",
            "$Type": "reduce.path.C"
        },
        "BtoD": {
            "$kind": "NavigationProperty",
            "$Partner": "DtoBs",
            "$Type": "reduce.path.D"
        }
    },
    "reduce.path.C": {
        "$kind": "EntityType",
        "CValue": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "CtoA": {
            "$kind": "NavigationProperty",
            "$Type": "reduce.path.A"
        },
        "CtoB": {
            "$kind": "NavigationProperty",
            "$Partner": "BtoC",
            "$Type": "reduce.path.B"
        }
    },
    "reduce.path.D": {
        "$kind": "EntityType",
        "DValue": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "DtoA": {
            "$kind": "NavigationProperty",
            "$Partner": "AtoDs",
            "$Type": "reduce.path.A"
        },
        "DtoBs": {
            "$isCollection": true,
            "$kind": "NavigationProperty",
            "$Partner": "BtoD",
            "$Type": "reduce.path.B"
        },
        "DtoCs": {
            "$isCollection": true,
            "$kind": "NavigationProperty",
            "$Type": "reduce.path.C"
        }
    },
    "reduce.path.Action": [{
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "reduce.path.A"
                }, {
                    "$Name": "foo",
                    "$Type": "Edm.String"
                }]
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "Value",
                    "$Type": "reduce.path.D"
                }]
        }, {
            "$kind": "Action",
            "$IsBound": true,
            "$Parameter": [{
                    "$isCollection": true,
                    "$Name": "_it",
                    "$Type": "reduce.path.B"
                }]
        }],
    "reduce.path.Function": [{
            "$kind": "Function",
            "$Parameter": [{
                    "$Name": "foo",
                    "$Type": "reduce.path.A"
                }]
        }, {
            "$kind": "Function",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "reduce.path.D"
                }]
        }, {
            "$kind": "Function",
            "$IsBound": true,
            "$Parameter": [{
                    "$Name": "_it",
                    "$Type": "reduce.path.D"
                }, {
                    "$Name": "Value",
                    "$Type": "Edm.Int"
                }]
        }],
    "reduce.path.DefaultContainer": {
        "$kind": "EntityContainer",
        "As": {
            "$kind": "EntitySet",
            "$Type": "reduce.path.A"
        },
        "Ds": {
            "$kind": "EntitySet",
            "$Type": "reduce.path.D"
        },
        "FunctionImport": {
            "$kind": "FunctionImport",
            "$Function": "reduce.path.Function"
        }
    }
}, mSupplierScope = {
    "$Version": "4.0",
    "tea_busi_supplier.v0001.": {
        "$kind": "Schema"
    },
    "tea_busi_supplier.v0001.Supplier": {
        "$kind": "EntityType",
        "Supplier_Name": {
            "$kind": "Property",
            "$Type": "Edm.String"
        }
    }
}, oTeamData = mScope["tea_busi.TEAM"], oTeamLineItem = mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"], oWorkerData = mScope["tea_busi.Worker"], mXServiceScope = {
    "$Version": "4.0",
    "$Annotations": {},
    "$EntityContainer": "tea_busi.v0001.DefaultContainer",
    "$Reference": {
        "../../../../default/iwbep/tea_busi_foo/0001/$metadata": {
            "$Include": [
                "tea_busi_foo.v0001."
            ]
        },
        "../../../../default/iwbep/tea_busi_product/0001/$metadata": {
            "$Include": [
                "ignore.me.",
                "tea_busi_product.v0001."
            ]
        },
        "/empty/$metadata": {
            "$Include": [
                "empty.",
                "I.still.haven't.found.what.I'm.looking.for."
            ]
        }
    },
    "tea_busi.v0001.": {
        "$kind": "Schema"
    },
    "tea_busi.v0001.DefaultContainer": {
        "$kind": "EntityContainer",
        "EQUIPM\u20ACNTS": {
            "$kind": "EntitySet",
            "$Type": "tea_busi.v0001.EQUIPMENT"
        }
    },
    "tea_busi.v0001.EQUIPMENT": {
        "$kind": "EntityType",
        "EQUIPMENT_2_PRODUCT": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi_product.v0001.Product"
        }
    }
}, aAllScopes = [
    mMostlyEmptyScope,
    mProductScope,
    mReducedPathScope,
    mScope,
    mSupplierScope,
    mXServiceScope
];
function checkGetAndRequest(oTestContext, assert, sMethodName, aArguments, bThrow) {
    var oExpectation, sGetMethodName = sMethodName.replace("fetch", "get"), oMetaModel = oTestContext.oMetaModel, oPromiseMock = oTestContext.mock(Promise), oReason = new Error("rejected"), oRejectedPromise = Promise.reject(oReason), sRequestMethodName = sMethodName.replace("fetch", "request"), oResult = {}, oSyncPromise = SyncPromise.resolve(oRejectedPromise);
    oExpectation = oTestContext.mock(oMetaModel).expects(sMethodName).exactly(4);
    oExpectation = oExpectation.withExactArgs.apply(oExpectation, aArguments);
    oExpectation.returns(SyncPromise.resolve(oResult));
    assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), oResult);
    oExpectation.returns(oSyncPromise);
    oPromiseMock.expects("resolve").withExactArgs(sinon.match.same(oSyncPromise)).returns(oRejectedPromise);
    assert.strictEqual(oMetaModel[sRequestMethodName].apply(oMetaModel, aArguments), oRejectedPromise);
    oPromiseMock.restore();
    if (bThrow) {
        assert.throws(function () {
            oMetaModel[sGetMethodName].apply(oMetaModel, aArguments);
        }, new Error("Result pending"));
    }
    else {
        assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), undefined, "pending");
    }
    return oSyncPromise.catch(function () {
        if (bThrow) {
            assert.throws(function () {
                oMetaModel[sGetMethodName].apply(oMetaModel, aArguments);
            }, oReason);
        }
        else {
            assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), undefined, "rejected");
        }
    });
}
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
function forEach(mFixture, fnTest) {
    var sPath;
    for (sPath in mFixture) {
        var i = sPath.indexOf("|"), sContextPath = "", sMetaPath = sPath.slice(i + 1), vValue = mFixture[sPath];
        if (i >= 0) {
            sContextPath = sPath.slice(0, i);
            sPath = sContextPath + "/" + sMetaPath;
        }
        fnTest(sPath, vValue, sContextPath, sMetaPath);
    }
}
QUnit.module("sap.ui.model.odata.v4.ODataMetaModel", {
    mOriginalScopes: clone(aAllScopes),
    afterEach: function (assert) {
        assert.deepEqual(aAllScopes, this.mOriginalScopes, "metadata unchanged");
    },
    allowWarnings: function (bWarn) {
        this.mock(Log).expects("isLoggable").atLeast(1).withExactArgs(sinon.match.number, sODataMetaModel).callsFake(function (iLogLevel) {
            switch (iLogLevel) {
                case Log.Level.DEBUG: return false;
                case Log.Level.WARNING: return bWarn;
                default: return true;
            }
        });
    },
    beforeEach: function () {
        var oMetadataRequestor = {
            read: function () { throw new Error(); }
        }, sUrl = "/a/b/c/d/e/$metadata";
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.oModel = {
            getReporter: function () { },
            reportError: function (_sLogMessage, _sReportingClassName, oError) {
                throw oError;
            },
            resolve: ODataModel.prototype.resolve
        };
        this.oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, undefined, this.oModel);
        this.oMetaModelMock = this.mock(this.oMetaModel);
    },
    expectDebug: function (bDebug, sMessage, sPath) {
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.DEBUG, sODataMetaModel).returns(bDebug);
        this.oLogMock.expects("debug").exactly(bDebug ? 1 : 0).withExactArgs(sMessage, sPath, sODataMetaModel);
    },
    expectFetchEntityContainer: function (mScope) {
        mScope = clone(mScope);
        this.oMetaModel.validate("n/a", mScope);
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
    },
    expects4FetchUI5Type: function (sPath, oProperty, oConstraints) {
        var oMetaContext = {
            getPath: function () { }
        }, sMetaPath = "/some/meta/path";
        this.oMetaModelMock.expects("getMetaContext").withExactArgs(sPath).returns(oMetaContext);
        this.oMetaModelMock.expects("fetchObject").withExactArgs(undefined, sinon.match.same(oMetaContext)).returns(SyncPromise.resolve(oProperty));
        this.mock(oMetaContext).expects("getPath").atLeast(0).withExactArgs().returns(sMetaPath);
        this.oMetaModelMock.expects("getConstraints").atLeast(0).withExactArgs(sinon.match.same(oProperty), sMetaPath).returns(oConstraints || {});
    }
});
QUnit.test("basics", function (assert) {
    var sAnnotationUri = "my/annotation.xml", aAnnotationUris = [sAnnotationUri, "uri2.xml"], oModel = {}, oMetadataRequestor = this.oMetaModel.oRequestor, sUrl = "/~/$metadata", oMetaModel;
    assert.strictEqual(ODataMetaModel.prototype.$$valueAsPromise, true);
    oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl);
    assert.ok(oMetaModel instanceof MetaModel);
    assert.strictEqual(oMetaModel.aAnnotationUris, undefined);
    assert.ok(oMetaModel.hasOwnProperty("aAnnotationUris"), "own property aAnnotationUris");
    assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
    assert.strictEqual(oMetaModel.sUrl, sUrl);
    assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
    assert.strictEqual(oMetaModel.toString(), "sap.ui.model.odata.v4.ODataMetaModel: /~/$metadata");
    oMetaModel.setDefaultBindingMode(BindingMode.OneWay);
    assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneWay);
    [
        FilterOperator.Contains,
        FilterOperator.EndsWith,
        FilterOperator.EQ,
        FilterOperator.GE,
        FilterOperator.GT,
        FilterOperator.LE,
        FilterOperator.LT,
        FilterOperator.NE,
        FilterOperator.NotContains,
        FilterOperator.NotEndsWith,
        FilterOperator.NotStartsWith,
        FilterOperator.StartsWith
    ].forEach(function (sFilterOperator) {
        oMetaModel.checkFilterOperation(new Filter("path", sFilterOperator, "bar"));
    });
    oMetaModel.checkFilterOperation(new Filter("path", FilterOperator.BT, "bar", "foo"));
    oMetaModel.checkFilterOperation(new Filter("path", FilterOperator.NB, "bar", "foo"));
    assert.throws(function () {
        oMetaModel.checkFilterOperation(new Filter({
            path: "path",
            operator: FilterOperator.Any
        }));
    }, /unsupported FilterOperator/, "ClientModel/ClientListBinding doesn't support \"Any\"");
    assert.throws(function () {
        oMetaModel.checkFilterOperation(new Filter({
            path: "path",
            operator: FilterOperator.All,
            variable: "foo",
            condition: new Filter({
                path: "foo/bar",
                operator: FilterOperator.GT,
                value1: 0
            })
        }));
    }, /unsupported FilterOperator/, "ClientModel/ClientListBinding doesn't support \"All\"");
    oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, aAnnotationUris);
    assert.strictEqual(oMetaModel.aAnnotationUris, aAnnotationUris, "arrays are passed");
    oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, sAnnotationUri);
    assert.deepEqual(oMetaModel.aAnnotationUris, [sAnnotationUri], "single annotation is wrapped");
    oMetaModel = new ODataMetaModel(null, null, null, oModel);
});
QUnit.test("forbidden", function (assert) {
    assert.throws(function () {
        this.oMetaModel.bindTree();
    }, new Error("Unsupported operation: v4.ODataMetaModel#bindTree"));
    assert.throws(function () {
        this.oMetaModel.getOriginalProperty();
    }, new Error("Unsupported operation: v4.ODataMetaModel#getOriginalProperty"));
    assert.throws(function () {
        this.oMetaModel.isList();
    }, new Error("Unsupported operation: v4.ODataMetaModel#isList"));
    assert.throws(function () {
        this.oMetaModel.refresh();
    }, new Error("Unsupported operation: v4.ODataMetaModel#refresh"));
    assert.throws(function () {
        this.oMetaModel.setLegacySyntax();
    }, new Error("Unsupported operation: v4.ODataMetaModel#setLegacySyntax"));
    assert.throws(function () {
        this.oMetaModel.setDefaultBindingMode(BindingMode.TwoWay);
    });
});
[
    undefined,
    ["/my/annotation.xml"],
    ["/my/annotation.xml", "/another/annotation.xml"]
].forEach(function (aAnnotationURI) {
    var title = "fetchEntityContainer - " + JSON.stringify(aAnnotationURI);
    QUnit.test(title, function (assert) {
        var oRequestorMock = this.mock(this.oMetaModel.oRequestor), aReadResults, mRootScope = {}, oSyncPromise, that = this;
        function expectReads(bPrefetch) {
            oRequestorMock.expects("read").withExactArgs(that.oMetaModel.sUrl, false, bPrefetch).resolves(mRootScope);
            aReadResults = [];
            (aAnnotationURI || []).forEach(function (sAnnotationUrl) {
                var oAnnotationResult = {};
                aReadResults.push(oAnnotationResult);
                oRequestorMock.expects("read").withExactArgs(sAnnotationUrl, true, bPrefetch).resolves(oAnnotationResult);
            });
        }
        this.oMetaModel.aAnnotationUris = aAnnotationURI;
        this.oMetaModelMock.expects("_mergeAnnotations").never();
        expectReads(true);
        assert.strictEqual(this.oMetaModel.fetchEntityContainer(true), null);
        expectReads(true);
        assert.strictEqual(this.oMetaModel.fetchEntityContainer(true), null);
        expectReads();
        this.oMetaModelMock.expects("_mergeAnnotations").withExactArgs(mRootScope, aReadResults);
        oSyncPromise = this.oMetaModel.fetchEntityContainer();
        assert.strictEqual(oSyncPromise.isPending(), true);
        assert.strictEqual(this.oMetaModel.fetchEntityContainer(), oSyncPromise);
        assert.strictEqual(this.oMetaModel.fetchEntityContainer(true), oSyncPromise, "now bPrefetch makes no difference");
        return oSyncPromise.then(function (mRootScope0) {
            assert.strictEqual(mRootScope0, mRootScope);
            assert.strictEqual(that.oMetaModel.fetchEntityContainer(), oSyncPromise);
        });
    });
});
QUnit.test("fetchEntityContainer: _mergeAnnotations fails", function (assert) {
    var oError = new Error();
    this.mock(this.oMetaModel.oRequestor).expects("read").withExactArgs(this.oMetaModel.sUrl, false, undefined).resolves({});
    this.oMetaModelMock.expects("_mergeAnnotations").throws(oError);
    return this.oMetaModel.fetchEntityContainer().then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("getMetaContext", function (assert) {
    var oMetaContext;
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/Foo($uid=id-1-23)/bar").returns("/Foo/bar");
    oMetaContext = this.oMetaModel.getMetaContext("/Foo($uid=id-1-23)/bar");
    assert.strictEqual(oMetaContext.getModel(), this.oMetaModel);
    assert.strictEqual(oMetaContext.getPath(), "/Foo/bar");
});
QUnit.test("getMetaPath", function (assert) {
    var sMetaPath = {}, sPath = {};
    this.mock(_Helper).expects("getMetaPath").withExactArgs(sinon.match.same(sPath)).returns(sMetaPath);
    assert.strictEqual(this.oMetaModel.getMetaPath(sPath), sMetaPath);
});
forEach({
    "/": "/",
    "/foo/bar|/": "/",
    "": undefined,
    "|foo/bar": undefined,
    "/|": "/",
    "/|foo/bar": "/foo/bar",
    "/foo|bar": "/foo/bar",
    "/foo/bar|": "/foo/bar",
    "/foo/|bar": "/foo/bar",
    "/foo/bar/": "/foo/bar/",
    "/foo|bar/": "/foo/bar/",
    "/foo/bar|./": "/foo/bar/",
    "/foo|./bar/": "/foo/bar/",
    "/foo/|./bar/": "/foo/bar/",
    "/foo/|.//bar/": "/foo//bar/",
    "/foo|@bar": "/foo@bar",
    "/foo/|@bar": "/foo/@bar",
    "/foo|./@bar": "/foo/@bar",
    "/foo/|./@bar": "/foo/@bar",
    "/foo|$kind": "/foo/$kind",
    "/foo/|$kind": "/foo/$kind",
    "/foo|./$kind": "/foo/$kind",
    "/foo/|./$kind": "/foo/$kind"
}, function (_sPath, sResolvedPath, sContextPath, sMetaPath) {
    QUnit.test("resolve: " + sContextPath + " > " + sMetaPath, function (assert) {
        var oContext = sContextPath && this.oMetaModel.getContext(sContextPath);
        assert.strictEqual(this.oMetaModel.resolve(sMetaPath, oContext), sResolvedPath);
    });
});
[".bar", ".@bar", ".$kind"].forEach(function (sPath) {
    QUnit.test("resolve: unsupported relative path " + sPath, function (assert) {
        var oContext = this.oMetaModel.getContext("/foo");
        assert.raises(function () {
            this.oMetaModel.resolve(sPath, oContext);
        }, new Error("Unsupported relative path: " + sPath));
    });
});
QUnit.test("resolve: undefined", function (assert) {
    assert.strictEqual(this.oMetaModel.resolve(undefined, this.oMetaModel.getContext("/")), "/");
});
forEach({
    "/$EntityContainer": "tea_busi.DefaultContainer",
    "/tea_busi./$kind": "Schema",
    "/tea_busi.DefaultContainer/$kind": "EntityContainer",
    "/": oContainerData,
    "/$EntityContainer/": oContainerData,
    "/T\u20ACAMS/": oTeamData,
    "/T\u20ACAMS/$Type/": oTeamData,
    "/$EntityContainer/$kind": "EntityContainer",
    "/$EntityContainer/T\u20ACAMS/$Type": "tea_busi.TEAM",
    "/$EntityContainer/T\u20ACAMS/$Type/Team_Id": oTeamData.Team_Id,
    "/tea_busi.": mScope["tea_busi."],
    "/tea_busi.DefaultContainer/EMPLOYEES/tea_busi.Worker/AGE": oWorkerData.AGE,
    "/T\u20ACAMS/Team_Id": oTeamData.Team_Id,
    "/T\u20ACAMS/TEAM_2_EMPLOYEES": oTeamData.TEAM_2_EMPLOYEES,
    "/T\u20ACAMS/TEAM_2_EMPLOYEES/AGE": oWorkerData.AGE,
    "/$$Term/AGE": oWorkerData.AGE,
    "/T\u20ACAMS": oContainerData["T\u20ACAMS"],
    "/T\u20ACAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/": oWorkerData,
    "/T\u20ACAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/$Type": "tea_busi.Worker",
    "/T\u20ACAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE": oWorkerData.AGE,
    "/TEAMS/$NavigationPropertyBinding/TEAM_2_CONTAINED_S%2FS_2_EMPLOYEE/AGE": oWorkerData.AGE,
    "/TEAMS/$NavigationPropertyBinding/TEAM_2_CONTAINED_S%2FS_2_C%2FC_2_S%2FS_2_EMPLOYEE/AGE": oWorkerData.AGE,
    "/TEAMS/TEAM_2_MANAGER/$ReferentialConstraint/Address%2FCountry": "WorkAddress/Country",
    "/TEAMS/TEAM_2_MANAGER/$ReferentialConstraint/Address%2FCountry@Common.Label": "Common Country",
    "/OverloadedAction": oContainerData["OverloadedAction"],
    "/OverloadedAction/$Action": "name.space.OverloadedAction",
    "/ChangeManagerOfTeam/": oTeamData,
    "/GetEmployeeMaxAge/$Function/0/$ReturnType": mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
    "/GetEmployeeMaxAge/value": mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
    "/GetEmployeeMaxAge/$ReturnType": mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
    "/GetEmployeeMaxAge/@$ui5.overload/0/$ReturnType": mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
    "/GetEmployeeMaxAge/value/$Type": "Edm.Int16",
    "/tea_busi.FuGetEmployeeMaxAge/value": mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
    "/name.space.DerivedPrimitiveFunction/value": mScope["name.space.DerivedPrimitiveFunction"][0].$ReturnType,
    "/ChangeManagerOfTeam/value": oTeamData.value,
    "/ChangeManagerOfTeam/$kind": "ActionImport",
    "/ChangeManagerOfTeam/$Action/0/$Parameter/0/$Name": "TEAM",
    "/ChangeManagerOfTeam/@$ui5.overload/0/$Parameter/0/$Name": "TEAM",
    "/ChangeManagerOfTeam/$Parameter/TEAM/$Name": "TEAM",
    "/OverloadedFunctionImport/$Parameter/C/$Type": "Edm.String",
    "/OverloadedAction/@$ui5.overload": sinon.match.array.deepEquals([aOverloadedAction[2]]),
    "/OverloadedAction/@$ui5.overload/0": aOverloadedAction[2],
    "/OverloadedAction/@$ui5.overload/0/$ReturnType": aOverloadedAction[2].$ReturnType,
    "/OverloadedAction/@$ui5.overload/0/$ReturnType/": aOverloadedAction[2].$ReturnType,
    "/OverloadedAction/@$ui5.overload/0/$ReturnType/$Type": "tea_busi.ComplexType_Salary",
    "/OverloadedAction/": mScope["tea_busi.ComplexType_Salary"],
    "/name.space.OverloadedAction": aOverloadedAction,
    "/T\u20ACAMS/NotFound/name.space.OverloadedAction": aOverloadedAction,
    "/name.space.OverloadedAction/1": aOverloadedAction[1],
    "/OverloadedAction/$Action/1": aOverloadedAction[1],
    "/OverloadedAction/@$ui5.overload/AMOUNT": mScope["tea_busi.ComplexType_Salary"].AMOUNT,
    "/OverloadedAction/AMOUNT": mScope["tea_busi.ComplexType_Salary"].AMOUNT,
    "/T\u20ACAMS/name.space.OverloadedAction/Team_Id": oTeamData.Team_Id,
    "/EMPLOYEES/EMPLOYEE_2_TEAM/name.space.OverloadedAction/Team_Id": oTeamData.Team_Id,
    "/T\u20ACAMS/name.space.OverloadedAction/@$ui5.overload": sinon.match.array.deepEquals([aOverloadedAction[1]]),
    "/name.space.OverloadedAction/@$ui5.overload": aOverloadedAction,
    "/name.space.BrokenOverloads": sinon.match.array.deepEquals(mScope["name.space.BrokenOverloads"]),
    "/T\u20ACAMS/name.space.OverloadedAction/_it@Common.Label": mScope.$Annotations["name.space.OverloadedAction/_it"]["@Common.Label"],
    "/T\u20ACAMS/name.space.OverloadedAction/_it": aOverloadedAction[1].$Parameter[0],
    "/T\u20ACAMS/name.space.OverloadedAction/parameter1": aOverloadedAction[1].$Parameter[1],
    "/T\u20ACAMS/name.space.OverloadedAction/parameter2": aOverloadedAction[1].$Parameter[2],
    "/T\u20ACAMS/name.space.OverloadedAction/$Parameter/parameter2": aOverloadedAction[1].$Parameter[2],
    "/T\u20ACAMS/tea_busi.NewAction/Name": oTeamData.Name,
    "/T\u20ACAMS/tea_busi.NewAction/_it": mScope["tea_busi.NewAction"][1].$Parameter[0],
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id": mScope["tea_busi.NewAction"][1].$Parameter[1],
    "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload/0/$ReturnType/$Type/Team_Id": oTeamData.Team_Id,
    "/T\u20ACAMS/tea_busi.NewAction//Team_Id": oTeamData.Team_Id,
    "/T\u20ACAMS/tea_busi.NewAction/$ReturnType/Team_Id": oTeamData.Team_Id,
    "/OverloadedFunctionImport/@$ui5.overload": sinon.match.array.deepEquals([aOverloadedBoundFunction[2]]),
    "/OverloadedFunctionImport/@$ui5.overload/0": aOverloadedBoundFunction[2],
    "/OverloadedFunctionImport/": mScope["tea_busi.ComplexType_Salary"],
    "/OverloadedFunctionImport/@$ui5.overload/AMOUNT": mScope["tea_busi.ComplexType_Salary"].AMOUNT,
    "/OverloadedFunctionImport/AMOUNT": mScope["tea_busi.ComplexType_Salary"].AMOUNT,
    "/T\u20ACAMS/name.space.OverloadedBoundFunction/Team_Id": oTeamData.Team_Id,
    "/EMPLOYEES/EMPLOYEE_2_TEAM/name.space.OverloadedBoundFunction/Team_Id": oTeamData.Team_Id,
    "/EMPLOYEES/name.space.OverloadedBoundFunction/_it": aOverloadedBoundFunction[0].$Parameter[0],
    "/T\u20ACAMS/name.space.OverloadedBoundFunction/@$ui5.overload": sinon.match.array.deepEquals([aOverloadedBoundFunction[1]]),
    "/T\u20ACAMS/name.space.OverloadedBoundFunction/_it@Common.Label": mScope.$Annotations["name.space.OverloadedBoundFunction/_it"]["@Common.Label"],
    "/T\u20ACAMS/name.space.OverloadedBoundFunction/B": aOverloadedBoundFunction[1].$Parameter[1],
    "/T\u20ACAMS/name.space.OverloadedBoundFunction/$Parameter/B": aOverloadedBoundFunction[1].$Parameter[1],
    "/@DefaultContainer": mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
    "/tea_busi.DefaultContainer@DefaultContainer": mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
    "/tea_busi.DefaultContainer/@DefaultContainer": mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
    "/$EntityContainer@DefaultContainer": mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
    "/$EntityContainer/@DefaultContainer": mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
    "/OverloadedAction@Common.Label": mScope.$Annotations["tea_busi.DefaultContainer/OverloadedAction"]["@Common.Label"],
    "/OverloadedAction/@Common.Label": mScope.$Annotations["tea_busi.ComplexType_Salary"]["@Common.Label"],
    "/T\u20ACAMS/$Type/@UI.LineItem": oTeamLineItem,
    "/T\u20ACAMS/@UI.LineItem": oTeamLineItem,
    "/T\u20ACAMS/@UI.LineItem/0/Label": oTeamLineItem[0].Label,
    "/T\u20ACAMS/@UI.LineItem/0/@UI.Importance": oTeamLineItem[0]["@UI.Importance"],
    "/T\u20ACAMS@T\u20ACAMS": mScope.$Annotations["tea_busi.DefaultContainer/T\u20ACAMS"]["@T\u20ACAMS"],
    "/T\u20ACAMS/@Common.Text": mScope.$Annotations["tea_busi.TEAM"]["@Common.Text"],
    "/T\u20ACAMS/@Common.Text@UI.TextArrangement": mScope.$Annotations["tea_busi.TEAM"]["@Common.Text@UI.TextArrangement"],
    "/T\u20ACAMS/Team_Id@Common.Text": mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
    "/T\u20ACAMS/Team_Id@Common.Text@UI.TextArrangement": mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text@UI.TextArrangement"],
    "/tea_busi./@Schema": mScope["tea_busi."]["@Schema"],
    "/name.space.EnumType@Common.Label": "EnumType label",
    "/name.space.EnumType/@Common.Label": "EnumType label",
    "/name.space.EnumType/A@Common.Label": "Label of A",
    "/name.space.EnumType/A/@Common.Label": "Label of A",
    "/name.space.EnumType/B@Common.Label": "Label of B",
    "/name.space.EnumType/B/@Common.Label": "Label of B",
    "/name.space.EnumType64/Z@Common.Label": "Label of Z",
    "/name.space.EnumType64/Z/@Common.Label": "Label of Z",
    "/name.space.EnumType64/Z@Common.Text/$Path/": "Label of Z",
    "/name.space.OverloadedAction/_it@Common.Label": mScope.$Annotations["name.space.OverloadedAction/_it"]["@Common.Label"],
    "/name.space.OverloadedFunction/A@Common.Label": mScope.$Annotations["name.space.OverloadedFunction/A"]["@Common.Label"],
    "/name.space.OverloadedFunction/B@Common.Label": mScope.$Annotations["name.space.OverloadedFunction/B"]["@Common.Label"],
    "/name.space.OverloadedFunction/B@Common.Text/$Path": "A/Road_2_Nowhere",
    "/name.space.OverloadedFunction/B@Common.Text@UI.TextArrangement": mScope.$Annotations["name.space.OverloadedFunction/B"]["@Common.Text@UI.TextArrangement"],
    "/tea_busi.NewAction/Team_Id@": mScope.$Annotations["tea_busi.NewAction/Team_Id"],
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id@Common.ValueListWithFixedValues": true,
    "/ChangeManagerOfTeam/ManagerID@Common.Label": "New Manager ID",
    "/OverloadedAction/parameter0@Common.Label": "Zero",
    "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Common.Label": "My 1st label",
    "/T\u20ACAMS/name.space.OverloadedAction/parameter1@": mScope.$Annotations["name.space.OverloadedAction(tea_busi.TEAM)/parameter1"],
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id@Common.Label": "New Team ID",
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id@": sinon.match(function (oActual) {
        QUnit.assert.deepEqual(oActual, {
            "@Common.Label": "New Team ID",
            "@Common.Text": {
                "$AnnotationPath": "_it/Name@Common.Label"
            },
            "@Common.ValueListWithFixedValues": true
        });
    }),
    "/name.space.OverloadedFunction@Common.Label": mScope.$Annotations["name.space.OverloadedFunction"]["@Common.Label"],
    "/name.space.OverloadedFunction@": mScope.$Annotations["name.space.OverloadedFunction"],
    "/T\u20ACAMS/tea_busi.NewAction@Common.QuickInfo": "Hello, world!",
    "/tea_busi.NewAction@Core.OperationAvailable": mScope.$Annotations["tea_busi.NewAction"]["@Core.OperationAvailable"],
    "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable": mScope.$Annotations["name.space.OverloadedAction(tea_busi.TEAM)"]["@Core.OperationAvailable"],
    "/T\u20ACAMS/name.space.OverloadedAction@": mScope.$Annotations["name.space.OverloadedAction(tea_busi.TEAM)"],
    "/T\u20ACAMS/tea_busi.NewAction@Common.Label": "Create New Team",
    "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload@Common.Label": "Create New Team",
    "/T\u20ACAMS/tea_busi.NewAction@": sinon.match(function (oActual) {
        QUnit.assert.deepEqual(oActual, {
            "@Common.Label": "Create New Team",
            "@Common.QuickInfo": "Hello, world!",
            "@Core.OperationAvailable": {
                "$Path": "_it/Name"
            }
        });
    }),
    "/OverloadedAction/@$ui5.overload@Core.OperationAvailable": mScope.$Annotations["name.space.OverloadedAction()"]["@Core.OperationAvailable"],
    "/OverloadedAction/@$ui5.overload@Core.OperationAvailable#2": false,
    "/T\u20ACAMS@Session.StickySessionSupported/NewAction@Core.OperationAvailable": mScope.$Annotations["tea_busi.NewAction(Collection(tea_busi.TEAM))"]["@Core.OperationAvailable"],
    "/T\u20ACAMS/@Session.StickySessionSupported#EntityType/NewAction@Core.OperationAvailable": mScope.$Annotations["tea_busi.NewAction(Collection(tea_busi.TEAM))"]["@Core.OperationAvailable"],
    "/T\u20ACAMS@Session.StickySessionSupported/NewAction@Common.Label": "New Team",
    "/ChangeManagerOfTeam/$ReturnType@Common.Label": "Hail to the Chief",
    "/EMPLOYEES/EMPLOYEE_2_EQUIPM\u20ACNTS/tea_busi.NewAction/$ReturnType@Common.Label": mScope.$Annotations["tea_busi.NewAction/$ReturnType"]["@Common.Label"],
    "/T\u20ACAMS/tea_busi.NewAction/$ReturnType@Common.Label": mScope.$Annotations["tea_busi.NewAction(Collection(tea_busi.TEAM))/$ReturnType"]["@Common.Label"],
    "/T\u20ACAMS/tea_busi.NewAction/Name@": mScope.$Annotations["tea_busi.TEAM/Name"],
    "/T\u20ACAMS/tea_busi.NewAction//Team_Id@": mScope.$Annotations["tea_busi.TEAM/Team_Id"],
    "/T\u20ACAMS/TEAM_2_EMPLOYEES/$OnDelete@Common.Label": "None of my business",
    "/T\u20ACAMS/TEAM_2_MANAGER/$ReferentialConstraint/foo@Common.Label": "Just a Gigolo",
    "/T\u20ACAMS/@UI.LineItem/0/Label@Common.Label": "Team ID's Label",
    "/T\u20ACAMS/@UI.Badge@Common.Label": "Best Badge Ever!",
    "/T\u20ACAMS/@UI.Badge/@Common.Label": "Label inside",
    "/T\u20ACAMS@": mScope.$Annotations["tea_busi.DefaultContainer/T\u20ACAMS"],
    "/T\u20ACAMS/@": mScope.$Annotations["tea_busi.TEAM"],
    "/T\u20ACAMS/Team_Id@": mScope.$Annotations["tea_busi.TEAM/Team_Id"],
    "/name.space.OverloadedAction/_it@": mScope.$Annotations["name.space.OverloadedAction/_it"],
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path@Common.Text": mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/@Common.Label": mScope.$Annotations["name.space.Id"]["@Common.Label"],
    "/EMPLOYEES/@UI.LineItem/0/Value/$Path@Common.Text": mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
    "/OverloadedAction/@$ui5.overload@Core.OperationAvailable#1/$Path/$": aOverloadedAction[2].$ReturnType,
    "/EMPLOYEES/@UI.Facets/0/Target/$AnnotationPath/": mScope.$Annotations["tea_busi.Worker"]["@UI.LineItem"],
    "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/": mScope.$Annotations["tea_busi.Worker/EMPLOYEE_2_TEAM"]["@Common.Label"],
    "/EMPLOYEES/@UI.Facets/2/Target/$AnnotationPath/": mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
    "/EMPLOYEES/@UI.Facets/3/Target/$AnnotationPath/": mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
    "/Me@Singleton/Age/$Path/$": oWorkerData.AGE,
    "/Me@Singleton/Empty/$Path/$": oContainerData.Me,
    "/Me@Singleton/Empty/$Path/$Type": "tea_busi.Worker",
    "/Me@Singleton/Empty/$Path/$Type/$": oWorkerData,
    "/Me@Singleton/Empty/$Path/@Type/Empty/$Path/$": oWorkerData,
    "/Me@Singleton/EMPLOYEE_2_TEAM/$Path/@Type/Empty/$Path/$": oTeamData,
    "/T\u20ACAMS@Capabilities.DeleteRestrictions/Deletable/$Path/$": mScope["tea_busi.MANAGER"].TEAM_ID,
    "/T\u20ACAMS@Capabilities.DeleteRestrictions/Empty/$Path/$": oContainerData["T\u20ACAMS"],
    "/@sapui.name": "tea_busi.DefaultContainer",
    "/tea_busi.DefaultContainer@sapui.name": "tea_busi.DefaultContainer",
    "/tea_busi.DefaultContainer/@sapui.name": "tea_busi.DefaultContainer",
    "/$EntityContainer/@sapui.name": "tea_busi.DefaultContainer",
    "/T\u20ACAMS@sapui.name": "T\u20ACAMS",
    "/T\u20ACAMS/@sapui.name": "tea_busi.TEAM",
    "/T\u20ACAMS/Team_Id@sapui.name": "Team_Id",
    "/T\u20ACAMS/TEAM_2_EMPLOYEES@sapui.name": "TEAM_2_EMPLOYEES",
    "/T\u20ACAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/@sapui.name": "tea_busi.Worker",
    "/T\u20ACAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE@sapui.name": "AGE",
    "/T\u20ACAMS@T\u20ACAMS@sapui.name": "@T\u20ACAMS",
    "/T\u20ACAMS@/@T\u20ACAMS@sapui.name": "@T\u20ACAMS",
    "/T\u20ACAMS@T\u20ACAMS/@sapui.name": "@T\u20ACAMS",
    "/T\u20ACAMS@/@T\u20ACAMS/@sapui.name": "@T\u20ACAMS",
    "/T\u20ACAMS/@UI.LineItem/0/@UI.Importance/@sapui.name": "@UI.Importance",
    "/T\u20ACAMS/Team_Id@/@Common.Label@sapui.name": "@Common.Label",
    "/T\u20ACAMS/name.space.OverloadedAction/$Parameter/parameter1@Common.Label@sapui.name": "@Common.Label",
    "/T\u20ACAMS/tea_busi.NewAction/@sapui.name": "tea_busi.TEAM",
    "/T\u20ACAMS/tea_busi.NewAction/Name@sapui.name": "Name",
    "/T\u20ACAMS/tea_busi.NewAction//Name@sapui.name": "Name",
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id@sapui.name": "Team_Id",
    "/T\u20ACAMS/tea_busi.NewAction/Team_Id/@sapui.name": "name.space.Id",
    "/name.space.OverloadedAction@sapui.name": "name.space.OverloadedAction",
    "/name.space.OverloadedAction/_it@sapui.name": "_it",
    "/$": mScope,
    "/T\u20ACAMS/$": oContainerData["T\u20ACAMS"],
    "/T\u20ACAMS/$@sapui.name": "T\u20ACAMS",
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/": mScope["name.space.Id"],
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/@sapui.name": "name.space.Id",
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/$": oTeamData.Team_Id,
    "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/$@sapui.name": "Team_Id",
    "/T\u20ACAMS/TEAM_2_EMPLOYEES@Common.MinOccurs": 1,
    "/T\u20ACAMS/@UI.LineItem/0/Target/$NavigationPropertyPath@Common.MinOccurs": 1,
    "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable/$Path/$": oTeamData.Name,
    "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Core.OperationAvailable/$Path/$": mScope["tea_busi.ContainedS"].Id,
    "/T\u20ACAMS/name.space.OverloadedAction/_it/@Common.Text/$Path/$": oTeamData.Name
}, function (sPath, vResult) {
    QUnit.test("fetchObject: " + sPath, function (assert) {
        var oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        if (vResult && typeof vResult === "object" && "test" in vResult) {
            assert.notStrictEqual(oSyncPromise.getResult(), undefined);
            vResult.test(oSyncPromise.getResult());
        }
        else {
            assert.strictEqual(oSyncPromise.getResult(), vResult);
        }
        assert.notStrictEqual(vResult, undefined, "use this test for defined results only!");
    });
});
[
    "/$missing",
    "/tea_busi.DefaultContainer/$missing",
    "/tea_busi.DefaultContainer/missing",
    "/tea_busi.FuGetEmployeeMaxAge/0/tea_busi.FuGetEmployeeMaxAge",
    "/tea_busi.TEAM/$Key/this.is.missing",
    "/tea_busi.Worker/missing",
    "/OverloadedAction/@$ui5.overload/0/@Core.OperationAvailable",
    "/ChangeManagerOfTeam/$Action/0/$ReturnType/@Common.Label",
    "/$EntityContainer/$missing",
    "/$EntityContainer/missing",
    "/T\u20ACAMS/$Key",
    "/T\u20ACAMS/missing",
    "/T\u20ACAMS/$missing",
    "/tea_busi.Worker@missing",
    "/tea_busi.Worker/@missing",
    "/tea_busi.Worker/@missing/foo",
    "/tea_busi.AcChangeManagerOfTeam/0/$ReturnType/@missing/foo",
    "/tea_busi.Worker/@Common.Text/$If/2/$Path",
    "/EMPLOYEES/name.space.OverloadedAction@missing",
    "/tea_busi.Worker/@/@missing",
    "/VoidAction/",
    "/$@Common.MinOccurs",
    "/T\u20ACAMS/@UI.LineItem/0/Target/$NavigationPropertyPath/$@Common.MinOccurs"
].forEach(function (sPath) {
    QUnit.test("fetchObject: " + sPath + " --> undefined", function (assert) {
        var oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        this.oLogMock.expects("isLoggable").never();
        this.oLogMock.expects("debug").never();
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
    });
});
QUnit.test("fetchObject: Invalid relative path w/o context", function (assert) {
    var sMetaPath = "some/relative/path", oSyncPromise;
    this.oLogMock.expects("error").withExactArgs("Invalid relative path w/o context", sMetaPath, sODataMetaModel);
    oSyncPromise = this.oMetaModel.fetchObject(sMetaPath, null);
    assert.strictEqual(oSyncPromise.isFulfilled(), true);
    assert.strictEqual(oSyncPromise.getResult(), null);
});
["/empty.Container/@", "/EMPLOYEES/AGE@"].forEach(function (sPath) {
    QUnit.test("fetchObject returns {} (anonymous empty object): " + sPath, function (assert) {
        var oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.deepEqual(oSyncPromise.getResult(), {});
    });
});
QUnit.test("fetchObject with empty $Annotations", function (assert) {
    var oSyncPromise;
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mMostlyEmptyScope));
    oSyncPromise = this.oMetaModel.fetchObject("/@DefaultContainer");
    assert.strictEqual(oSyncPromise.isFulfilled(), true);
    assert.strictEqual(oSyncPromise.getResult(), undefined);
});
[false, true].forEach(function (bWarn) {
    forEach({
        "/$$Loop/": "Invalid recursion at /$$Loop",
        "//$Foo": "Invalid empty segment",
        "/tea_busi./$Annotations": "Invalid segment: $Annotations",
        "/not.Found": "Unknown qualified name not.Found",
        "/Me/not.Found": "Unknown qualified name not.Found",
        "/not.Found@missing": "Unknown qualified name not.Found",
        "/.": "Unknown child . of tea_busi.DefaultContainer",
        "/Foo": "Unknown child Foo of tea_busi.DefaultContainer",
        "/$EntityContainer/$kind/": "Unknown child EntityContainer" + " of tea_busi.DefaultContainer at /$EntityContainer/$kind",
        "/name.space.VoidAction@Core.OperationAvailable/$Path/$": "Unknown child $ReturnType" + " of name.space.VoidAction" + " at /name.space.VoidAction@Core.OperationAvailable/$Path",
        "/name.space.BadContainer/DanglingActionImport/": "Unknown qualified name not.Found" + " at /name.space.BadContainer/DanglingActionImport/$Action",
        "/name.space.BadContainer/DanglingFunctionImport/": "Unknown qualified name not.Found" + " at /name.space.BadContainer/DanglingFunctionImport/$Function",
        "/name.space.Broken/": "Unknown qualified name not.Found at /name.space.Broken/$Type",
        "/name.space.BrokenFunction/": "Unknown qualified name not.Found" + " at /name.space.BrokenFunction/0/$ReturnType/$Type",
        "/GetEmployeeMaxAge/@sapui.name": "Unknown qualified name Edm.Int16" + " at /tea_busi.FuGetEmployeeMaxAge/0/$ReturnType/$Type",
        "/GetEmployeeMaxAge/value/@sapui.name": "Unknown qualified name Edm.Int16" + " at /tea_busi.FuGetEmployeeMaxAge/0/$ReturnType/$Type",
        "/name.space.Broken/$Type/": "Unknown qualified name not.Found at /name.space.Broken/$Type",
        "/tea_busi.DefaultContainer/$kind/@sapui.name": "Unknown child EntityContainer" + " of tea_busi.DefaultContainer at /tea_busi.DefaultContainer/$kind",
        "/tea_busi.NewAction@Core.OperationAvailable/$PropertyPath/$": "Unknown child n" + " of tea_busi.NewAction" + " at /tea_busi.NewAction@Core.OperationAvailable/$PropertyPath",
        "/$EntityContainer@sapui.name": "Unsupported path before @sapui.name",
        "/tea_busi.FuGetEmployeeMaxAge/0@sapui.name": "Unsupported path before @sapui.name",
        "/tea_busi.TEAM/$Key/not.Found/@sapui.name": "Unsupported path before @sapui.name",
        "/GetEmployeeMaxAge/value@sapui.name": "Unsupported path before @sapui.name",
        "/$@sapui.name": "Unsupported path before @sapui.name",
        "/@sapui.name/foo": "Unsupported path after @sapui.name",
        "/$EntityContainer/T\u20ACAMS/@sapui.name/foo": "Unsupported path after @sapui.name",
        "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath@@this.is.ignored/foo": "Unsupported path after @@this.is.ignored",
        "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/@@this.is.ignored@foo": "Unsupported path after @@this.is.ignored",
        "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath@@this.is.ignored@sapui.name": "Unsupported path after @@this.is.ignored",
        "/@@sap.ui.model.odata.v4.AnnotationHelper.invalid": "sap.ui.model.odata.v4.AnnotationHelper.invalid is not a function but: undefined",
        "/@@sap.ui.model.odata.v4.AnnotationHelper": "sap.ui.model.odata.v4.AnnotationHelper is not a function but: " + sap.ui.model.odata.v4.AnnotationHelper,
        "/@@requestCodeList": "requestCodeList is not a function but: undefined",
        "/@@.requestCurrencyCodes": ".requestCurrencyCodes is not a function but: undefined",
        "/@@.requestUnitsOfMeasure": ".requestUnitsOfMeasure is not a function but: undefined",
        "/name.space.EmptyOverloads/": "Expected a single overload, but found 0",
        "/name.space.OverloadedAction/": "Expected a single overload, but found 4",
        "/name.space.OverloadedAction/_it": "Expected a single overload, but found 4",
        "/name.space.OverloadedFunction/": "Expected a single overload, but found 2",
        "/ServiceGroups/name.space.OverloadedAction/parameter1@Common.Label": "Expected a single overload, but found 0",
        "/EMPLOYEES/tea_busi.NewAction/_it@Common.Label": "Expected a single overload, but found 2",
        "/ServiceGroups/name.space.OverloadedAction@Core.OperationAvailable": "Expected a single overload, but found 0",
        "/EMPLOYEES/tea_busi.NewAction@Common.Label": "Expected a single overload, but found 2",
        "/T\u20ACAMS/@UI.LineItem/0/$/Value": "Unsupported path after $",
        "/T\u20ACAMS/$/$Type": "Unsupported path after $",
        "/T\u20ACAMS/$/@@this.is.invalid": "Unsupported path after $"
    }, function (sPath, sWarning) {
        QUnit.test("fetchObject fails: " + sPath + ", warn = " + bWarn, function (assert) {
            var oSyncPromise;
            this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
            this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(bWarn);
            this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs(sWarning, sPath, sODataMetaModel);
            oSyncPromise = this.oMetaModel.fetchObject(sPath, null, { scope: {} });
            assert.strictEqual(oSyncPromise.isFulfilled(), true);
            assert.strictEqual(oSyncPromise.getResult(), undefined);
        });
    });
});
[false, true].forEach(function (bDebug) {
    forEach({
        "/$Foo/@bar": "Invalid segment: @bar",
        "/$Foo/$Bar": "Invalid segment: $Bar",
        "/$Foo/$Bar/$Baz": "Invalid segment: $Bar",
        "/$EntityContainer/T\u20ACAMS/Team_Id/$MaxLength/.": "Invalid segment: .",
        "/$EntityContainer/T\u20ACAMS/Team_Id/$Nullable/.": "Invalid segment: .",
        "/$EntityContainer/T\u20ACAMS/Team_Id/NotFound/Invalid": "Invalid segment: Invalid",
        "/T\u20ACAMS/@Common.Text/$Path/$Foo/$Bar": "Invalid segment: $Bar",
        "/name.space.VoidAction/$ReturnType@Common.Label": "Invalid segment: $ReturnType"
    }, function (sPath, sMessage) {
        QUnit.test("fetchObject fails: " + sPath + ", debug = " + bDebug, function (assert) {
            var oSyncPromise;
            this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
            this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.DEBUG, sODataMetaModel).returns(bDebug);
            this.oLogMock.expects("debug").exactly(bDebug ? 1 : 0).withExactArgs(sMessage, sPath, sODataMetaModel);
            oSyncPromise = this.oMetaModel.fetchObject(sPath);
            assert.strictEqual(oSyncPromise.isFulfilled(), true);
            assert.strictEqual(oSyncPromise.getResult(), undefined);
        });
    });
});
[{
        sPath: "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath",
        sSchemaChildName: "tea_busi.Worker"
    }, {
        sPath: "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/",
        sSchemaChildName: "tea_busi.Worker"
    }, {
        sPath: "/EMPLOYEES",
        sSchemaChildName: "tea_busi.DefaultContainer"
    }, {
        sPath: "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/$",
        sSchemaChildName: "tea_busi.TEAM"
    }].forEach(function (oFixture) {
    QUnit.test("fetchObject: " + oFixture.sPath + "@@...isMultiple", function (assert) {
        var oContext, oInput, fnIsMultiple = this.mock(AnnotationHelper).expects("isMultiple"), oResult = {}, oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        oInput = this.oMetaModel.getObject(oFixture.sPath);
        fnIsMultiple.withExactArgs(oInput, sinon.match({
            context: sinon.match.object,
            schemaChildName: oFixture.sSchemaChildName
        })).returns(oResult);
        oSyncPromise = this.oMetaModel.fetchObject(oFixture.sPath + "@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple");
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), oResult);
        oContext = fnIsMultiple.args[0][1].context;
        assert.ok(oContext instanceof BaseContext);
        assert.strictEqual(oContext.getModel(), this.oMetaModel);
        assert.strictEqual(oContext.getPath(), oFixture.sPath);
        assert.strictEqual(oContext.getObject(), oInput);
    });
});
["requestCurrencyCodes", "requestUnitsOfMeasure"].forEach(function (sName) {
    QUnit.test("fetchObject: @@" + sName, function (assert) {
        var oResult = {};
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        this.oMetaModelMock.expects(sName).on(this.oMetaModel).resolves(oResult);
        return this.oMetaModel.fetchObject("/T\u20ACAMS/@@" + sName).then(function (oResult0) {
            assert.strictEqual(oResult0, oResult);
        });
    });
    QUnit.test("fetchObject: @@" + sName + " from given scope wins", function (assert) {
        var oResult = {}, oScope = {};
        oScope[sName] = function () { };
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        this.mock(oScope).expects(sName).resolves(oResult);
        return this.oMetaModel.fetchObject("/T\u20ACAMS/@@" + sName, null, { scope: oScope }).then(function (oResult0) {
            assert.strictEqual(oResult0, oResult);
        });
    });
});
QUnit.test("fetchObject: computed annotation returns promise", function (assert) {
    var oResult = {};
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.mock(AnnotationHelper).expects("isMultiple").resolves(oResult);
    return this.oMetaModel.fetchObject("/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath" + "@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple").then(function (oResult0) {
        assert.strictEqual(oResult0, oResult);
    });
});
["@@computedAnnotation", "@@.computedAnnotation"].forEach(function (sSuffix) {
    var mPathPrefix2Overload = {
        "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable": aOverloadedAction[1],
        "/T\u20ACAMS/name.space.OverloadedAction/_it@Common.Label": aOverloadedAction[1],
        "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Common.Text": aOverloadedAction[1],
        "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Common.Text/": aOverloadedAction[1]
    }, mPathPrefix2SchemaChildName = {
        "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath": "tea_busi.Worker",
        "/OverloadedAction/@$ui5.overload": "name.space.OverloadedAction",
        "/T\u20ACAMS/@UI.LineItem/0/Value/$Path@Common.Label": "tea_busi.TEAM",
        "/T\u20ACAMS/@UI.LineItem/0/Value/$Path/@Common.Label": "name.space.Id",
        "/T\u20ACAMS/name.space.OverloadedAction": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction/@$ui5.overload": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction/_it@Common.Label": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Common.Text": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction/parameter1@Common.Text/": "name.space.OverloadedAction",
        "/T\u20ACAMS/name.space.OverloadedAction/parameter1": "name.space.OverloadedAction"
    };
    Object.keys(mPathPrefix2SchemaChildName).forEach(function (sPathPrefix) {
        var sPath = sPathPrefix + sSuffix, sSchemaChildName = mPathPrefix2SchemaChildName[sPathPrefix];
        QUnit.test("fetchObject: " + sPath, function (assert) {
            var $$valueAsPromise = {}, fnComputedAnnotation, oContext, oInput, oObject, oResult = {}, oScope = {
                computedAnnotation: function () { }
            }, oSyncPromise;
            this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
            oInput = this.oMetaModel.getObject(sPathPrefix);
            assert.notStrictEqual(oInput, undefined, "use this test for defined results only!");
            fnComputedAnnotation = this.mock(oScope).expects("computedAnnotation");
            fnComputedAnnotation.withExactArgs(oInput, sinon.match({
                $$valueAsPromise: sinon.match.same($$valueAsPromise),
                context: sinon.match.object,
                overload: sinon.match.same(mPathPrefix2Overload[sPathPrefix]),
                schemaChildName: sSchemaChildName
            })).returns(oResult);
            oSyncPromise = this.oMetaModel.fetchObject(sPath, null, {
                $$valueAsPromise: $$valueAsPromise,
                scope: oScope
            });
            assert.strictEqual(oSyncPromise.isFulfilled(), true);
            assert.strictEqual(oSyncPromise.getResult(), oResult);
            oContext = fnComputedAnnotation.args[0][1].context;
            assert.ok(oContext instanceof BaseContext);
            assert.strictEqual(oContext.getModel(), this.oMetaModel);
            assert.strictEqual(oContext.getPath(), sPathPrefix);
            oObject = oContext.getObject();
            if (Array.isArray(oInput)) {
                assert.deepEqual(oObject, oInput);
                assert.strictEqual(oObject[0], oInput[0]);
            }
            else {
                assert.strictEqual(oObject, oInput);
            }
        });
    });
});
[false, true].forEach(function (bWarn) {
    QUnit.test("fetchObject: ...@@... throws, bWarn = " + bWarn, function (assert) {
        var oError = new Error("This call failed intentionally"), sPath = "/@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple", oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        this.mock(AnnotationHelper).expects("isMultiple").throws(oError);
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(bWarn);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Error calling sap.ui.model.odata.v4.AnnotationHelper.isMultiple: " + oError, sPath, sODataMetaModel);
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
    });
});
["", "/"].forEach(function (sSeparator, i) {
    QUnit.test("AnnotationHelper.format and operation overloads, " + i, function (assert) {
        var sPath = "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable" + sSeparator, oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        this.mock(AnnotationHelper).expects("format").withExactArgs({ $Path: "_it/Name" }, sinon.match({
            $$valueAsPromise: undefined,
            context: sinon.match({
                oModel: this.oMetaModel,
                sPath: sPath
            }),
            overload: sinon.match.same(aOverloadedAction[1]),
            schemaChildName: "name.space.OverloadedAction"
        })).callThrough();
        oSyncPromise = this.oMetaModel.fetchObject(sPath + "@@sap.ui.model.odata.v4.AnnotationHelper.format");
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), "{path:'Name'" + ",type:'sap.ui.model.odata.type.String'" + ",constraints:{'maxLength':40,'nullable':false}" + ",formatOptions:{'parseKeepsEmptyString':true}}");
    });
});
QUnit.test("@@computedAnnotation with arguments", function (assert) {
    var aArguments = [], oScope = {
        computedAnnotation: function () { }
    }, oSyncPromise;
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
    this.mock(JSTokenizer).expects("parseJS").withExactArgs("[ 'abc}def{...}{xyz' ]").returns(aArguments);
    this.mock(oScope).expects("computedAnnotation").withExactArgs(sinon.match.same(oTeamData), sinon.match({
        $$valueAsPromise: undefined,
        arguments: sinon.match.same(aArguments),
        context: sinon.match({
            oModel: this.oMetaModel,
            sPath: "/T\u20ACAMS/"
        }),
        overload: undefined,
        schemaChildName: "tea_busi.TEAM"
    })).returns("~");
    oSyncPromise = this.oMetaModel.fetchObject("/T\u20ACAMS/@@computedAnnotation( 'abc$)def$(...$)$(xyz' )", null, { scope: oScope });
    assert.strictEqual(oSyncPromise.isFulfilled(), true);
    assert.strictEqual(oSyncPromise.getResult(), "~");
});
[false, true].forEach(function (bWarn) {
    QUnit.test("@@computedAnnotation with invalid arguments, bWarn = " + bWarn, function (assert) {
        var oError = {
            at: 2,
            message: "Unexpected 'u'",
            name: "SyntaxError",
            text: "[undefined]"
        }, sPath = "/T\u20ACAMS/@@computedAnnotation(undefined)", oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        this.mock(JSTokenizer).expects("parseJS").withExactArgs("[undefined]").throws(oError);
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(bWarn);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Unexpected 'u': u<--ndefined", sPath, sODataMetaModel);
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
    });
});
[false, true].forEach(function (bWarn) {
    QUnit.test("@@computedAnnotation with wrong ), bWarn = " + bWarn, function (assert) {
        var sPath = "/T\u20ACAMS/@@computedAnnotation() ", oSyncPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        this.mock(JSTokenizer).expects("parseJS").never();
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(bWarn);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Expected ')' instead of ' '", sPath, sODataMetaModel);
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
    });
});
[false, true].forEach(function (bDebug) {
    QUnit.test("fetchObject: cross-service reference, bDebug = " + bDebug, function (assert) {
        var mClonedProductScope = clone(mProductScope), aPromises = [], oRequestorMock = this.mock(this.oMetaModel.oRequestor), that = this;
        function expectDebug(sMessage, sPath) {
            that.expectDebug(bDebug, sMessage, sPath);
        }
        function codeUnderTest(sPath, vExpectedResult) {
            aPromises.push(that.oMetaModel.fetchObject(sPath).then(function (vResult) {
                assert.strictEqual(vResult, vExpectedResult);
            }));
        }
        this.expectFetchEntityContainer(mXServiceScope);
        oRequestorMock.expects("read").withExactArgs("/a/default/iwbep/tea_busi_product/0001/$metadata").resolves(mClonedProductScope);
        oRequestorMock.expects("read").withExactArgs("/a/default/iwbep/tea_busi_supplier/0001/$metadata").resolves(mSupplierScope);
        oRequestorMock.expects("read").withExactArgs("/empty/$metadata").resolves(mMostlyEmptyScope);
        expectDebug("Namespace tea_busi_product.v0001. found in $Include" + " of /a/default/iwbep/tea_busi_product/0001/$metadata" + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/Name");
        expectDebug("Reading /a/default/iwbep/tea_busi_product/0001/$metadata" + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/Name");
        expectDebug("Waiting for tea_busi_product.v0001." + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/Name");
        codeUnderTest("/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/Name", mClonedProductScope["tea_busi_product.v0001.Product"].Name);
        expectDebug("Waiting for tea_busi_product.v0001." + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_CATEGORY/CategoryName");
        codeUnderTest("/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_CATEGORY/CategoryName", mClonedProductScope["tea_busi_product.v0001.Category"].CategoryName);
        expectDebug("Waiting for tea_busi_product.v0001.", "/tea_busi_product.v0001.Category/CategoryName");
        codeUnderTest("/tea_busi_product.v0001.Category/CategoryName", mClonedProductScope["tea_busi_product.v0001.Category"].CategoryName);
        expectDebug("Waiting for tea_busi_product.v0001.", "/tea_busi_product.v0001.Category/CategoryName@Common.Label");
        codeUnderTest("/tea_busi_product.v0001.Category/CategoryName@Common.Label", "CategoryName from tea_busi_product.v0001.");
        expectDebug("Waiting for tea_busi_product.v0001." + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name");
        codeUnderTest("/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name", mSupplierScope["tea_busi_supplier.v0001.Supplier"].Supplier_Name);
        expectDebug("Namespace empty. found in $Include of /empty/$metadata", "/empty.DefaultContainer");
        expectDebug("Reading /empty/$metadata", "/empty.DefaultContainer");
        expectDebug("Waiting for empty.", "/empty.DefaultContainer");
        codeUnderTest("/empty.DefaultContainer", mMostlyEmptyScope["empty.DefaultContainer"]);
        expectDebug("Including tea_busi_product.v0001." + " from /a/default/iwbep/tea_busi_product/0001/$metadata" + " at /tea_busi.v0001.EQUIPMENT/EQUIPMENT_2_PRODUCT/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/Name");
        expectDebug("Including empty. from /empty/$metadata", "/empty.DefaultContainer");
        expectDebug("Namespace tea_busi_supplier.v0001. found in $Include" + " of /a/default/iwbep/tea_busi_supplier/0001/$metadata" + " at /tea_busi_product.v0001.Product/PRODUCT_2_SUPPLIER/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name");
        expectDebug("Reading /a/default/iwbep/tea_busi_supplier/0001/$metadata" + " at /tea_busi_product.v0001.Product/PRODUCT_2_SUPPLIER/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name");
        expectDebug("Waiting for tea_busi_supplier.v0001." + " at /tea_busi_product.v0001.Product/PRODUCT_2_SUPPLIER/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name");
        expectDebug("Including tea_busi_supplier.v0001." + " from /a/default/iwbep/tea_busi_supplier/0001/$metadata" + " at /tea_busi_product.v0001.Product/PRODUCT_2_SUPPLIER/$Type", "/EQUIPM\u20ACNTS/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name");
        return Promise.all(aPromises);
    });
});
[false, true].forEach(function (bWarn) {
    var sTitle = "fetchObject: missing cross-service reference, bWarn = " + bWarn;
    QUnit.test(sTitle, function (assert) {
        var sPath = "/not.found", oSyncPromise;
        this.expectFetchEntityContainer(mMostlyEmptyScope);
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(bWarn);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Unknown qualified name not.found", sPath, sODataMetaModel);
        oSyncPromise = this.oMetaModel.fetchObject(sPath);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
    });
});
[false, true].forEach(function (bWarn) {
    var sTitle = "fetchObject: referenced metadata does not contain included schema, bWarn = " + bWarn;
    QUnit.test(sTitle, function (assert) {
        var sSchemaName = "I.still.haven't.found.what.I'm.looking.for.", sQualifiedName = sSchemaName + "Child", sPath = "/" + sQualifiedName;
        this.expectFetchEntityContainer(mXServiceScope);
        this.mock(this.oMetaModel.oRequestor).expects("read").withExactArgs("/empty/$metadata").resolves(mMostlyEmptyScope);
        this.allowWarnings(bWarn);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("/empty/$metadata does not contain " + sSchemaName, sPath, sODataMetaModel);
        this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Unknown qualified name " + sQualifiedName, sPath, sODataMetaModel);
        return this.oMetaModel.fetchObject(sPath).then(function (vResult) {
            assert.strictEqual(vResult, undefined);
        });
    });
});
[false, true].forEach(function (bWarn) {
    var sTitle = "fetchObject: cross-service reference, respect $Include; bWarn = " + bWarn;
    QUnit.test(sTitle, function (assert) {
        var mScope0 = {
            "$Version": "4.0",
            "$Reference": {
                "../../../../default/iwbep/tea_busi_product/0001/$metadata": {
                    "$Include": [
                        "not.found.",
                        "tea_busi_product.v0001.",
                        "tea_busi_supplier.v0001."
                    ]
                }
            }
        }, mReferencedScope = {
            "$Version": "4.0",
            "must.not.be.included.": {
                "$kind": "Schema"
            },
            "tea_busi_product.v0001.": {
                "$kind": "Schema"
            },
            "tea_busi_supplier.v0001.": {
                "$kind": "Schema"
            }
        }, oRequestorMock = this.mock(this.oMetaModel.oRequestor), that = this;
        this.expectFetchEntityContainer(mScope0);
        oRequestorMock.expects("read").withExactArgs("/a/default/iwbep/tea_busi_product/0001/$metadata").resolves(mReferencedScope);
        this.allowWarnings(bWarn);
        return this.oMetaModel.fetchObject("/tea_busi_product.v0001.").then(function (vResult) {
            var oSyncPromise;
            assert.strictEqual(vResult, mReferencedScope["tea_busi_product.v0001."]);
            assert.ok(that.oMetaModel.mSchema2MetadataUrl["tea_busi_product.v0001."]["/a/default/iwbep/tea_busi_product/0001/$metadata"], "document marked as read");
            that.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Unknown qualified name must.not.be.included.", "/must.not.be.included.", sODataMetaModel);
            assert.strictEqual(that.oMetaModel.getObject("/must.not.be.included."), undefined, "must not include schemata which are not mentioned in edmx:Include");
            assert.strictEqual(that.oMetaModel.getObject("/tea_busi_supplier.v0001."), mReferencedScope["tea_busi_supplier.v0001."]);
            that.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("/a/default/iwbep/tea_busi_product/0001/$metadata" + " does not contain not.found.", "/not.found.", sODataMetaModel);
            that.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs("Unknown qualified name not.found.", "/not.found.", sODataMetaModel);
            oSyncPromise = that.oMetaModel.fetchObject("/not.found.");
            assert.strictEqual(oSyncPromise.isFulfilled(), true);
            assert.strictEqual(oSyncPromise.getResult(), undefined);
        });
    });
});
QUnit.test("fetchObject: cross-service reference - validation failure", function (assert) {
    var oError = new Error(), mReferencedScope = {}, sUrl = "/a/default/iwbep/tea_busi_product/0001/$metadata";
    this.expectFetchEntityContainer(mXServiceScope);
    this.mock(this.oMetaModel.oRequestor).expects("read").withExactArgs(sUrl).resolves(mReferencedScope);
    this.oMetaModelMock.expects("validate").withExactArgs(sUrl, mReferencedScope).throws(oError);
    return this.oMetaModel.fetchObject("/tea_busi_product.v0001.Product").then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("fetchObject: cross-service reference - document loaded from different URI", function (assert) {
    var sMessage = "A schema cannot span more than one document: schema is referenced by" + " following URLs: /a/default/iwbep/tea_busi_product/0001/$metadata," + " /second/reference", sSchema = "tea_busi_product.v0001.";
    this.expectFetchEntityContainer(mXServiceScope);
    this.mock(this.oModel).expects("reportError").withExactArgs(sMessage, sODataMetaModel, sinon.match({
        message: sSchema + ": " + sMessage,
        name: "Error"
    }));
    this.oMetaModel.mSchema2MetadataUrl["tea_busi_product.v0001."]["/second/reference"] = false;
    return this.oMetaModel.fetchObject("/tea_busi_product.v0001.Product").then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0.message, sSchema + ": " + sMessage);
    });
});
QUnit.test("fetchObject: cross-service reference - duplicate include", function (assert) {
    var oRequestorMock = this.mock(this.oMetaModel.oRequestor), mScope0 = {
        "$Version": "4.0",
        "$Reference": {
            "/A/$metadata": {
                "$Include": [
                    "A."
                ]
            },
            "/B/$metadata": {
                "$Include": [
                    "B."
                ]
            }
        }
    }, mScopeA = {
        "$Version": "4.0",
        "$Reference": {
            "/B/$metadata": {
                "$Include": [
                    "B.",
                    "B.B."
                ]
            }
        },
        "A.": {
            "$kind": "Schema"
        }
    }, mScopeB = {
        "$Version": "4.0",
        "B.": {
            "$kind": "Schema"
        },
        "B.B.": {
            "$kind": "Schema"
        }
    }, that = this;
    this.expectFetchEntityContainer(mScope0);
    oRequestorMock.expects("read").withExactArgs("/A/$metadata").resolves(mScopeA);
    oRequestorMock.expects("read").withExactArgs("/B/$metadata").resolves(mScopeB);
    return this.oMetaModel.fetchObject("/B.").then(function (vResult) {
        assert.strictEqual(vResult, mScopeB["B."]);
        return that.oMetaModel.fetchObject("/A.").then(function (vResult) {
            assert.strictEqual(vResult, mScopeA["A."]);
            return that.oMetaModel.fetchObject("/B.B.").then(function (vResult) {
                assert.strictEqual(vResult, mScopeB["B.B."]);
            });
        });
    });
});
[undefined, false, true].forEach(function (bSupportReferences) {
    var sTitle = "fetchObject: cross-service reference - supportReferences: " + bSupportReferences;
    QUnit.test(sTitle, function (assert) {
        var mClonedProductScope = clone(mProductScope), oModel = new ODataModel({
            serviceUrl: "/a/b/c/d/e/",
            supportReferences: bSupportReferences,
            synchronizationMode: "None"
        }), sPath = "/tea_busi_product.v0001.Product", sUrl = "/a/default/iwbep/tea_busi_product/0001/$metadata";
        this.oMetaModel = oModel.getMetaModel();
        this.oMetaModelMock = this.mock(this.oMetaModel);
        bSupportReferences = bSupportReferences !== false;
        assert.strictEqual(this.oMetaModel.bSupportReferences, bSupportReferences);
        this.expectFetchEntityContainer(mXServiceScope);
        this.mock(this.oMetaModel.oRequestor).expects("read").exactly(bSupportReferences ? 1 : 0).withExactArgs(sUrl).resolves(mClonedProductScope);
        this.allowWarnings(true);
        this.oLogMock.expects("warning").exactly(bSupportReferences ? 0 : 1).withExactArgs("Unknown qualified name " + sPath.slice(1), sPath, sODataMetaModel);
        return this.oMetaModel.fetchObject(sPath).then(function (vResult) {
            assert.strictEqual(vResult, bSupportReferences ? mClonedProductScope["tea_busi_product.v0001.Product"] : undefined);
        });
    });
});
QUnit.test("getObject, requestObject", function (assert) {
    return checkGetAndRequest(this, assert, "fetchObject", ["sPath", {}]);
});
[{
        $Type: "Edm.Boolean"
    }, {
        $Type: "Edm.Byte"
    }, {
        $Type: "Edm.Date"
    }, {
        $Type: "Edm.DateTimeOffset"
    }, {
        $Precision: 7,
        $Type: "Edm.DateTimeOffset",
        __constraints: { precision: 7 }
    }, {
        $Type: "Edm.Decimal"
    }, {
        $Precision: 20,
        $Scale: 5,
        $Type: "Edm.Decimal",
        __constraints: { maximum: "100.00", maximumExclusive: true, minimum: "0.00", precision: 20, scale: 5 }
    }, {
        $Precision: 20,
        $Scale: "variable",
        $Type: "Edm.Decimal",
        __constraints: { precision: 20, scale: "variable" }
    }, {
        $Type: "Edm.Double"
    }, {
        $Type: "Edm.Guid"
    }, {
        $Type: "Edm.Int16"
    }, {
        $Type: "Edm.Int32"
    }, {
        $Type: "Edm.Int64"
    }, {
        $Type: "Edm.SByte"
    }, {
        $Type: "Edm.Single"
    }, {
        $Type: "Edm.Stream"
    }, {
        $Type: "Edm.String"
    }, {
        $MaxLength: 255,
        $Type: "Edm.String",
        __constraints: { maxLength: 255 }
    }, {
        $Type: "Edm.String",
        __constraints: { isDigitSequence: true }
    }, {
        $Type: "Edm.TimeOfDay"
    }, {
        $Precision: 3,
        $Type: "Edm.TimeOfDay",
        __constraints: { precision: 3 }
    }].forEach(function (oProperty0) {
    [false, true].forEach(function (bNullable) {
        var oProperty = _Helper.merge({}, oProperty0), oConstraints = oProperty.__constraints;
        delete oProperty.__constraints;
        if (!bNullable) {
            oProperty.$Nullable = false;
            oConstraints = oConstraints || {};
            oConstraints.nullable = false;
        }
        QUnit.test("fetchUI5Type: " + JSON.stringify(oProperty0), function (assert) {
            var sPath = "/EMPLOYEES/0/ENTRYDATE", that = this;
            this.expects4FetchUI5Type(sPath, oProperty, oConstraints);
            return this.oMetaModel.fetchUI5Type(sPath).then(function (oType) {
                var sExpectedTypeName = "sap.ui.model.odata.type." + oProperty.$Type.slice(4), oTypeKeepsEmptyString;
                assert.strictEqual(oType.getName(), sExpectedTypeName);
                if (oConstraints && oConstraints.scale === "variable") {
                    oConstraints.scale = Infinity;
                }
                assert.deepEqual(oType.oConstraints, oConstraints);
                if (oProperty.$Type === "Edm.String") {
                    that.expects4FetchUI5Type(sPath, oProperty, oConstraints);
                    oTypeKeepsEmptyString = that.oMetaModel.getUI5Type(sPath, { parseKeepsEmptyString: true });
                    assert.strictEqual(oTypeKeepsEmptyString.parseValue(""), !bNullable && oConstraints && oConstraints.isDigitSequence ? "0" : "");
                    that.expects4FetchUI5Type(sPath, oProperty);
                    assert.strictEqual(that.oMetaModel.getUI5Type(sPath, {}), oType, "cached, even w/ empty mFormatOptions");
                }
                that.expects4FetchUI5Type(sPath, oProperty);
                assert.strictEqual(that.oMetaModel.getUI5Type(sPath), oType, "cached");
            });
        });
    });
});
[{
        style: "short"
    }, {
        parseKeepsEmptyString: true,
        style: "short"
    }].forEach(function (mFormatOptions) {
    var sFormatOptions = JSON.stringify(mFormatOptions), sTitle = "fetchUI5Type: ignore only parseKeepsEmptyString w/ " + sFormatOptions;
    QUnit.test(sTitle, function (assert) {
        var sPath = "/EMPLOYEES('0')/ENTRYDATE";
        this.expects4FetchUI5Type(sPath, { $Type: "Edm.Date" });
        return this.oMetaModel.fetchUI5Type(sPath, mFormatOptions).then(function (oType) {
            assert.strictEqual(JSON.stringify(mFormatOptions), sFormatOptions, "unchanged");
            assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Date");
            assert.deepEqual(oType.oFormatOptions, { style: "short" });
            if (!("parseKeepsEmptyString" in mFormatOptions)) {
                assert.strictEqual(oType.oFormatOptions, mFormatOptions, "no clone");
            }
        });
    });
});
[{}, { parseKeepsEmptyString: true }].forEach(function (mFormatOptions) {
    var sFormatOptions = JSON.stringify(mFormatOptions), sTitle = "fetchUI5Type: caching w/ mFormatOptions = " + sFormatOptions;
    QUnit.test(sTitle, function (assert) {
        var sPath = "/EMPLOYEES('0')/ENTRYDATE", oProperty = { $Type: "Edm.Date" }, that = this;
        this.expects4FetchUI5Type(sPath, oProperty);
        this.mock(Object).expects("assign").never();
        return this.oMetaModel.fetchUI5Type(sPath, mFormatOptions).then(function (oType) {
            assert.strictEqual(JSON.stringify(mFormatOptions), sFormatOptions, "unchanged");
            assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Date");
            assert.strictEqual(oType.oFormatOptions, undefined);
            that.expects4FetchUI5Type(sPath, oProperty);
            assert.strictEqual(that.oMetaModel.getUI5Type(sPath, mFormatOptions), oType, "cached");
        });
    });
});
QUnit.test("fetchUI5Type: fetchObject fails", function (assert) {
    var oError = new Error(), oMetaContext = {}, oPromise = SyncPromise.resolve(Promise.reject(oError)), fnReporter = sinon.spy();
    this.oMetaModelMock.expects("getMetaContext").withExactArgs("/Foo/bar").returns(oMetaContext);
    this.oMetaModelMock.expects("fetchObject").withExactArgs(undefined, sinon.match.same(oMetaContext)).returns(oPromise);
    this.mock(this.oModel).expects("getReporter").withExactArgs().returns(fnReporter);
    this.oLogMock.expects("warning").withExactArgs("No metadata for path '/Foo/bar', using sap.ui.model.odata.type.Raw", undefined, sODataMetaModel);
    return this.oMetaModel.fetchUI5Type("/Foo/bar").then(function (oType) {
        assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
        sinon.assert.calledOnce(fnReporter);
        sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
    });
});
QUnit.test("fetchUI5Type: $count", function (assert) {
    var sPath = "/T\u20ACAMS/$count", oType;
    oType = this.oMetaModel.fetchUI5Type(sPath).getResult();
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Int64");
    assert.strictEqual(this.oMetaModel.getUI5Type(sPath), oType, "cached");
});
QUnit.test("fetchUI5Type: collection", function (assert) {
    var sPath = "/EMPLOYEES/0/foo", that = this;
    this.oMetaModelMock.expects("fetchObject").thrice().withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath)).returns(SyncPromise.resolve({
        $isCollection: true,
        $Nullable: false,
        $Type: "Edm.String"
    }));
    this.oLogMock.expects("warning").withExactArgs("Unsupported collection type, using sap.ui.model.odata.type.Raw", sPath, sODataMetaModel);
    return Promise.all([
        this.oMetaModel.fetchUI5Type(sPath).then(function (oType) {
            assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
            assert.strictEqual(that.oMetaModel.getUI5Type(sPath), oType, "cached");
        }),
        this.oMetaModel.fetchUI5Type(sPath).then(function (oType) {
            assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
        })
    ]);
});
["acme.Type", "Edm.Duration", "Edm.GeographyPoint"].forEach(function (sQualifiedName) {
    QUnit.test("fetchUI5Type: unsupported type " + sQualifiedName, function (assert) {
        var sPath = "/EMPLOYEES/0/foo", that = this;
        this.oMetaModelMock.expects("fetchObject").twice().withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath)).returns(SyncPromise.resolve({
            $Nullable: false,
            $Type: sQualifiedName
        }));
        this.oLogMock.expects("warning").withExactArgs("Unsupported type '" + sQualifiedName + "', using sap.ui.model.odata.type.Raw", sPath, sODataMetaModel);
        return this.oMetaModel.fetchUI5Type(sPath).then(function (oType) {
            assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
            assert.strictEqual(that.oMetaModel.getUI5Type(sPath), oType, "cached");
        });
    });
});
QUnit.test("fetchUI5Type: invalid path", function (assert) {
    var sPath = "/EMPLOYEES/0/invalid", that = this;
    this.oMetaModelMock.expects("fetchObject").twice().withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath)).returns(SyncPromise.resolve());
    this.oLogMock.expects("warning").twice().withExactArgs("No metadata for path '" + sPath + "', using sap.ui.model.odata.type.Raw", undefined, sODataMetaModel);
    return this.oMetaModel.fetchUI5Type(sPath).then(function (oType) {
        assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
        assert.strictEqual(that.oMetaModel.getUI5Type(sPath), oType, "Type is cached");
    });
});
[{
        oProperty: { $Nullable: false, $Type: "Edm.Boolean" },
        oResult: { nullable: false }
    }, {
        oProperty: { $Nullable: true, $Type: "Edm.Boolean" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Boolean" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Byte" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Date" },
        oResult: undefined
    }, {
        oProperty: { $Precision: 7, $Type: "Edm.DateTimeOffset" },
        oResult: { precision: 7 }
    }, {
        oProperty: { $Nullable: false, $Precision: 7, $Type: "Edm.DateTimeOffset" },
        oResult: { nullable: false, precision: 7 }
    }, {
        oProperty: { $Nullable: false, $Type: "Edm.DateTimeOffset" },
        oResult: { nullable: false }
    }, {
        mGetObjectResults: {
            "/foo@Org.OData.Validation.V1.Minimum/$Decimal": "0.00",
            "/foo@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": undefined,
            "/foo@Org.OData.Validation.V1.Maximum/$Decimal": undefined,
            "/foo@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": undefined
        },
        oProperty: {
            $Scale: "variable",
            $Type: "Edm.Decimal"
        },
        oResult: { minimum: "0.00", scale: "variable" }
    }, {
        mGetObjectResults: {
            "/foo@Org.OData.Validation.V1.Minimum/$Decimal": "0.50",
            "/foo@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": true,
            "/foo@Org.OData.Validation.V1.Maximum/$Decimal": "100.00",
            "/foo@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": true
        },
        oProperty: {
            $Precision: 2,
            $Scale: 20,
            $Type: "Edm.Decimal"
        },
        oResult: {
            minimum: "0.50",
            minimumExclusive: true,
            maximum: "100.00",
            maximumExclusive: true,
            precision: 2,
            scale: 20
        }
    }, {
        oProperty: { $Type: "Edm.Double" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Guid" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Int16" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Int32" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Int64" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.SByte" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Single" },
        oResult: undefined
    }, {
        oProperty: { $Type: "Edm.Stream" },
        oResult: undefined
    }, {
        mGetObjectResults: {
            "/foo@com.sap.vocabularies.Common.v1.IsDigitSequence": undefined
        },
        oProperty: { $Type: "Edm.String" },
        oResult: undefined
    }, {
        mGetObjectResults: {
            "/foo@com.sap.vocabularies.Common.v1.IsDigitSequence": undefined
        },
        oProperty: { $Nullable: false, $MaxLength: 23, $Type: "Edm.String" },
        oResult: { nullable: false, maxLength: 23 }
    }, {
        mGetObjectResults: {
            "/foo@com.sap.vocabularies.Common.v1.IsDigitSequence": true
        },
        oProperty: {
            $MaxLength: 23,
            $Type: "Edm.String"
        },
        oResult: { isDigitSequence: true, maxLength: 23 }
    }, {
        oProperty: { $Precision: 23, $Type: "Edm.TimeOfDay" },
        oResult: { precision: 23 }
    }, {
        oProperty: { $Nullable: false, $Type: "acme.Type" },
        oResult: undefined
    }, {
        oProperty: { $Nullable: false, $Type: "Edm.Duration" },
        oResult: undefined
    }, {
        oProperty: { $Nullable: false, $Type: "Edm.GeographyPoint" },
        oResult: undefined
    }].forEach(function (oFixture) {
    QUnit.test("getConstraints: " + JSON.stringify(oFixture.oProperty), function (assert) {
        var sMetaContextPath = "/foo", that = this;
        if (oFixture.mGetObjectResults) {
            Object.keys(oFixture.mGetObjectResults).forEach(function (sConstraintPath) {
                that.oMetaModelMock.expects("getObject").withExactArgs(sConstraintPath).returns(oFixture.mGetObjectResults[sConstraintPath]);
            });
        }
        assert.deepEqual(this.oMetaModel.getConstraints(oFixture.oProperty, sMetaContextPath), oFixture.oResult);
    });
});
QUnit.test("getUI5Type, requestUI5Type", function (assert) {
    return checkGetAndRequest(this, assert, "fetchUI5Type", ["sPath"], true);
});
[{
        dataPath: "/TEAMS/0",
        canonicalUrl: "/TEAMS(~1)",
        requests: [{
                entityType: "tea_busi.TEAM",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/TEAMS($uid=id-1-23)",
        canonicalUrl: "/TEAMS(~1)",
        requests: [{
                entityType: "tea_busi.TEAM",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/TEAMS('4%3D2')",
        canonicalUrl: "/TEAMS('4%3D2')",
        requests: []
    }, {
        dataPath: "/Me",
        canonicalUrl: "/Me",
        requests: []
    }, {
        dataPath: "/TEAMS/0/TEAM_2_EMPLOYEES/1",
        canonicalUrl: "/EMPLOYEES(~1)",
        requests: [{
                entityType: "tea_busi.Worker",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/TEAMS('42')/TEAM_2_EMPLOYEES/1",
        canonicalUrl: "/EMPLOYEES(~1)",
        requests: [{
                entityType: "tea_busi.Worker",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/TEAMS('42')/TEAM_2_EMPLOYEES('23')",
        canonicalUrl: "/EMPLOYEES('23')",
        requests: []
    }, {
        dataPath: "/TEAMS/0/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM",
        canonicalUrl: "/T%E2%82%ACAMS(~1)",
        requests: [{
                entityType: "tea_busi.TEAM",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_S",
        canonicalUrl: "/TEAMS(~1)/TEAM_2_CONTAINED_S",
        requests: [{
                entityType: "tea_busi.TEAM",
                path: "/TEAMS/0",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/Me/EMPLOYEE_2_CONTAINED_S",
        canonicalUrl: "/Me/EMPLOYEE_2_CONTAINED_S",
        requests: []
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_C/1",
        canonicalUrl: "/TEAMS(~1)/TEAM_2_CONTAINED_C(~2)",
        requests: [{
                entityType: "tea_busi.TEAM",
                path: "/TEAMS/0",
                predicate: "(~1)"
            }, {
                entityType: "tea_busi.ContainedC",
                path: "/TEAMS/0/TEAM_2_CONTAINED_C/1",
                predicate: "(~2)"
            }]
    }, {
        dataPath: "/TEAMS('42')/TEAM_2_CONTAINED_C('foo')",
        canonicalUrl: "/TEAMS('42')/TEAM_2_CONTAINED_C('foo')",
        requests: []
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1",
        canonicalUrl: "/TEAMS(~1)/TEAM_2_CONTAINED_S/S_2_C(~2)",
        requests: [{
                entityType: "tea_busi.TEAM",
                path: "/TEAMS/0",
                predicate: "(~1)"
            }, {
                entityType: "tea_busi.ContainedC",
                path: "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1",
                predicate: "(~2)"
            }]
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_C/5/C_2_EMPLOYEE",
        canonicalUrl: "/TEAMS(~1)/TEAM_2_CONTAINED_C(~2)/C_2_EMPLOYEE",
        requests: [{
                entityType: "tea_busi.TEAM",
                path: "/TEAMS/0",
                predicate: "(~1)"
            }, {
                entityType: "tea_busi.ContainedC",
                path: "/TEAMS/0/TEAM_2_CONTAINED_C/5",
                predicate: "(~2)"
            }]
    }, {
        dataPath: "/TEAMS('42')/TEAM_2_CONTAINED_C/5/C_2_EMPLOYEE",
        canonicalUrl: "/TEAMS('42')/TEAM_2_CONTAINED_C(~1)/C_2_EMPLOYEE",
        requests: [{
                entityType: "tea_busi.ContainedC",
                path: "/TEAMS('42')/TEAM_2_CONTAINED_C/5",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/T%E2%82%ACAMS/0",
        canonicalUrl: "/T%E2%82%ACAMS(~1)",
        requests: [{
                entityType: "tea_busi.TEAM",
                predicate: "(~1)"
            }]
    }, {
        dataPath: "/EMPLOYEES('7')/EMPLOYEE_2_EQUIPM%E2%82%ACNTS(42)",
        canonicalUrl: "/EQUIPM%E2%82%ACNTS(42)",
        requests: []
    }].forEach(function (oFixture) {
    QUnit.test("fetchCanonicalPath: " + oFixture.dataPath, function (assert) {
        var oContext = Context.create(this.oModel, undefined, oFixture.dataPath), oContextMock = this.mock(oContext), oPromise;
        this.mock(_Helper).expects("getMetaPath").withExactArgs(oFixture.dataPath).returns("metapath");
        this.oMetaModelMock.expects("fetchObject").withExactArgs("metapath").returns(SyncPromise.resolve());
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        oFixture.requests.forEach(function (oRequest) {
            var oEntityInstance = { "@$ui5._": { "predicate": oRequest.predicate } };
            oContextMock.expects("fetchValue").withExactArgs(oRequest.path || oFixture.dataPath).returns(SyncPromise.resolve(oEntityInstance));
        });
        oPromise = this.oMetaModel.fetchCanonicalPath(oContext);
        assert.ok(!oPromise.isRejected());
        return oPromise.then(function (sCanonicalUrl) {
            assert.strictEqual(sCanonicalUrl, oFixture.canonicalUrl);
        });
    });
});
[{
        path: "/Me|ID",
        editUrl: "Me"
    }, {
        path: "/TEAMS('42')|Name",
        editUrl: "TEAMS('42')"
    }, {
        path: "/TEAMS/0|Name",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)"
    }, {
        path: "/EMPLOYEES/0|SAL%C3%83RY/CURRENCY",
        fetchPredicates: {
            "/EMPLOYEES/0": "tea_busi.Worker"
        },
        editUrl: "EMPLOYEES(~0)"
    }, {
        path: "/TEAMS/0/TEAM_2_EMPLOYEES/1|ID",
        fetchPredicates: {
            "/TEAMS/0/TEAM_2_EMPLOYEES/1": "tea_busi.Worker"
        },
        editUrl: "EMPLOYEES(~0)"
    }, {
        path: "/TEAMS('42')/TEAM_2_EMPLOYEES/1|ID",
        fetchPredicates: {
            "/TEAMS('42')/TEAM_2_EMPLOYEES/1": "tea_busi.Worker"
        },
        editUrl: "EMPLOYEES(~0)"
    }, {
        path: "/TEAMS('42')/TEAM_2_EMPLOYEES('23')|ID",
        editUrl: "EMPLOYEES('23')"
    }, {
        path: "/TEAMS/0/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM|Name",
        fetchPredicates: {
            "/TEAMS/0/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM": "tea_busi.TEAM"
        },
        editUrl: "T%E2%82%ACAMS(~0)"
    }, {
        path: "/TEAMS/0/TEAM_2_CONTAINED_S|Id",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)/TEAM_2_CONTAINED_S"
    }, {
        path: "/Me/EMPLOYEE_2_CONTAINED_S|Id",
        editUrl: "Me/EMPLOYEE_2_CONTAINED_S"
    }, {
        path: "/TEAMS/0/TEAM_2_CONTAINED_C/1|Id",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM",
            "/TEAMS/0/TEAM_2_CONTAINED_C/1": "tea_busi.ContainedC"
        },
        editUrl: "TEAMS(~0)/TEAM_2_CONTAINED_C(~1)"
    }, {
        path: "/TEAMS('42')/TEAM_2_CONTAINED_C('foo')|Id",
        editUrl: "TEAMS('42')/TEAM_2_CONTAINED_C('foo')"
    }, {
        path: "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1|Id",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM",
            "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1": "tea_busi.ContainedC"
        },
        editUrl: "TEAMS(~0)/TEAM_2_CONTAINED_S/S_2_C(~1)"
    }, {
        path: "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_EMPLOYEE|ID",
        fetchPredicates: {
            "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_EMPLOYEE": "tea_busi.Worker"
        },
        editUrl: "EMPLOYEES(~0)"
    }, {
        path: "/TEAMS('42')/TEAM_2_CONTAINED_C/5/C_2_EMPLOYEE|ID",
        fetchPredicates: {
            "/TEAMS('42')/TEAM_2_CONTAINED_C/5": "tea_busi.ContainedC"
        },
        editUrl: "TEAMS('42')/TEAM_2_CONTAINED_C(~0)/C_2_EMPLOYEE"
    }, {
        path: "/T%E2%82%ACAMS/0|Name",
        fetchPredicates: {
            "/T%E2%82%ACAMS/0": "tea_busi.TEAM"
        },
        editUrl: "T%E2%82%ACAMS(~0)"
    }, {
        path: "/EMPLOYEES('7')/EMPLOYEE_2_EQUIPM%E2%82%ACNTS(42)|ID",
        editUrl: "EQUIPM%E2%82%ACNTS(42)"
    }, {
        path: "/ServiceGroups('42')/DefaultSystem|SystemAlias",
        editUrl: "ServiceGroups('42')/DefaultSystem"
    }, {
        path: "/TEAMS($uid=id-1-23)|",
        fetchPredicates: {
            "/TEAMS($uid=id-1-23)": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)"
    }, {
        path: "/TEAMS($uid=id-1-23)/TEAM_2_CONTAINED_C($uid=id-1-24)|",
        fetchPredicates: {
            "/TEAMS($uid=id-1-23)": "tea_busi.TEAM",
            "/TEAMS($uid=id-1-23)/TEAM_2_CONTAINED_C($uid=id-1-24)": "tea_busi.ContainedC"
        },
        editUrl: "TEAMS(~0)/TEAM_2_CONTAINED_C(~1)"
    }, {
        path: "/TEAMS($uid=id-1-23)/TEAM_2_CONTAINED_S/S_2_EMPLOYEE|ID",
        fetchPredicates: {
            "/TEAMS($uid=id-1-23)/TEAM_2_CONTAINED_S/S_2_EMPLOYEE": "tea_busi.Worker"
        },
        editUrl: "EMPLOYEES(~0)"
    }, {
        path: "/T%E2%82%ACAMS($uid=id-1-23)|Name",
        fetchPredicates: {
            "/T%E2%82%ACAMS($uid=id-1-23)": "tea_busi.TEAM"
        },
        editUrl: "T%E2%82%ACAMS(~0)"
    }, {
        path: "/T%E2%82%ACAMS($uid=id-1-23)/TEAM_2_EMPLOYEES($uid=id-2)/EMPLOYEE_2_TEAM|Name",
        fetchPredicates: {
            "/T%E2%82%ACAMS($uid=id-1-23)/TEAM_2_EMPLOYEES($uid=id-2)/EMPLOYEE_2_TEAM": "tea_busi.TEAM"
        },
        editUrl: "T%E2%82%ACAMS(~0)"
    }, {
        path: "/TEAMS/0|Name@my.annotation",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)"
    }, {
        path: "/TEAMS/0|Name@complex/property",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)"
    }, {
        path: "/TEAMS/0|Name@my.annotation@annotation",
        fetchPredicates: {
            "/TEAMS/0": "tea_busi.TEAM"
        },
        editUrl: "TEAMS(~0)"
    }].forEach(function (oFixture) {
    QUnit.test("fetchUpdateData: " + oFixture.path, function (assert) {
        var i = oFixture.path.indexOf("|"), sContextPath = oFixture.path.slice(0, i), sPropertyPath = oFixture.path.slice(i + 1), oContext = Context.create(this.oModel, undefined, sContextPath), oContextMock = this.mock(oContext), sMetaPath = oFixture.path.replace("|", "/"), oPromise, that = this;
        if (sMetaPath.endsWith("/")) {
            sMetaPath = sMetaPath.slice(0, -1);
        }
        this.mock(_Helper).expects("getMetaPath").withExactArgs(sMetaPath).returns("~");
        this.oMetaModelMock.expects("fetchObject").withExactArgs("~").returns(SyncPromise.resolve(Promise.resolve()).then(function () {
            that.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
            Object.keys(oFixture.fetchPredicates || {}).forEach(function (sPath, i) {
                var oEntityInstance = { "@$ui5._": { "predicate": "(~" + i + ")" } };
                oContextMock.expects("fetchValue").withExactArgs(sPath).returns(SyncPromise.resolve(Promise.resolve(oEntityInstance)));
            });
        }));
        oPromise = this.oMetaModel.fetchUpdateData(sPropertyPath, oContext);
        assert.ok(!oPromise.isRejected());
        return oPromise.then(function (oResult) {
            assert.strictEqual(oResult.editUrl, oFixture.editUrl);
            assert.strictEqual(oResult.entityPath, sContextPath);
            assert.strictEqual(oResult.propertyPath, sPropertyPath);
        });
    });
});
QUnit.test("fetchUpdateData: transient entity", function (assert) {
    var oContext = Context.create(this.oModel, undefined, "/TEAMS($uid=id-1-23)");
    this.oMetaModelMock.expects("fetchEntityContainer").twice().returns(SyncPromise.resolve(mScope));
    this.mock(oContext).expects("fetchValue").withExactArgs("/TEAMS($uid=id-1-23)").returns(SyncPromise.resolve({ "@$ui5._": { "transient": "update" } }));
    return this.oMetaModel.fetchUpdateData("Name", oContext).then(function (oResult) {
        assert.deepEqual(oResult, {
            editUrl: undefined,
            entityPath: "/TEAMS($uid=id-1-23)",
            propertyPath: "Name"
        });
    });
});
QUnit.test("fetchUpdateData: bNoEditUrl", function (assert) {
    var oContext = Context.create(this.oModel, undefined, "/TEAMS('42')");
    this.oMetaModelMock.expects("fetchEntityContainer").twice().returns(SyncPromise.resolve(mScope));
    this.mock(oContext).expects("fetchValue").never();
    return this.oMetaModel.fetchUpdateData("/TEAMS('42')/TEAM_2_MANAGER/TEAM_ID", oContext, true).then(function (oResult) {
        assert.deepEqual(oResult, {
            editUrl: undefined,
            entityPath: "/TEAMS('42')/TEAM_2_MANAGER",
            propertyPath: "TEAM_ID"
        });
    });
});
QUnit.test("fetchUpdateData: fetchObject fails", function (assert) {
    var oModel = this.oModel, oContext = {
        getModel: function () { return oModel; }
    }, oExpectedError = new Error(), sPath = "some/invalid/path/to/a/property";
    this.mock(oModel).expects("resolve").withExactArgs(sPath, sinon.match.same(oContext)).returns("~1");
    this.mock(_Helper).expects("getMetaPath").withExactArgs("~1").returns("~2");
    this.oMetaModelMock.expects("fetchObject").withExactArgs("~2").returns(Promise.reject(oExpectedError));
    return this.oMetaModel.fetchUpdateData(sPath, oContext).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError, oExpectedError);
    });
});
[{
        dataPath: "/Foo/Bar",
        message: "Not an entity set: Foo",
        warning: "Unknown child Foo of tea_busi.DefaultContainer"
    }, {
        dataPath: "/TEAMS/0/Foo/Bar",
        message: "Not a (navigation) property: Foo"
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_S",
        instance: undefined,
        message: "No instance to calculate key predicate at /TEAMS/0"
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_S",
        instance: {},
        message: "No key predicate known at /TEAMS/0"
    }, {
        dataPath: "/TEAMS/0/TEAM_2_CONTAINED_S",
        instance: new Error("failed to load team"),
        message: "failed to load team at /TEAMS/0"
    }, {
        dataPath: "/TEAMS/0/Foo@$ui5.something",
        message: "Read-only path must not be updated"
    }].forEach(function (oFixture) {
    QUnit.test("fetchUpdateData: " + oFixture.message, function (assert) {
        var oContext = Context.create(this.oModel, undefined, oFixture.dataPath), oPromise;
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        if ("instance" in oFixture) {
            this.mock(oContext).expects("fetchValue").returns(oFixture.instance instanceof Error ? SyncPromise.reject(oFixture.instance) : SyncPromise.resolve(oFixture.instance));
        }
        if (oFixture.warning) {
            this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(true);
            this.oLogMock.expects("warning").withExactArgs(oFixture.warning, oFixture.dataPath, sODataMetaModel);
        }
        this.mock(this.oModel).expects("reportError").withExactArgs(oFixture.message, sODataMetaModel, sinon.match({
            message: oFixture.dataPath + ": " + oFixture.message,
            name: "Error"
        }));
        oPromise = this.oMetaModel.fetchUpdateData("", oContext);
        assert.ok(oPromise.isRejected());
        assert.strictEqual(oPromise.getResult().message, oFixture.dataPath + ": " + oFixture.message);
        oPromise.caught();
    });
});
QUnit.test("fetchCanonicalPath: success", function (assert) {
    var oContext = {};
    this.oMetaModelMock.expects("fetchUpdateData").withExactArgs("", sinon.match.same(oContext)).returns(SyncPromise.resolve(Promise.resolve({
        editUrl: "edit('URL')",
        propertyPath: ""
    })));
    return this.oMetaModel.fetchCanonicalPath(oContext).then(function (oCanonicalPath) {
        assert.strictEqual(oCanonicalPath, "/edit('URL')");
    });
});
QUnit.test("fetchCanonicalPath: not an entity", function (assert) {
    var oContext = {
        getPath: function () { return "/TEAMS('4711')/Name"; }
    };
    this.oMetaModelMock.expects("fetchUpdateData").withExactArgs("", sinon.match.same(oContext)).returns(SyncPromise.resolve(Promise.resolve({
        editUrl: "TEAMS('4711')",
        entityPath: "/TEAMS('4711')",
        propertyPath: "Name"
    })));
    return this.oMetaModel.fetchCanonicalPath(oContext).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Context " + oContext.getPath() + " does not point to an entity. It should be " + "/TEAMS('4711')");
    });
});
QUnit.test("fetchCanonicalPath: fetchUpdateData fails", function (assert) {
    var oContext = {}, oExpectedError = new Error();
    this.oMetaModelMock.expects("fetchUpdateData").withExactArgs("", sinon.match.same(oContext)).returns(SyncPromise.resolve(Promise.reject(oExpectedError)));
    return this.oMetaModel.fetchCanonicalPath(oContext).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError, oExpectedError);
    });
});
QUnit.test("fetchCanonicalPath: transient entity", function (assert) {
    var oContext = Context.create(this.oModel, undefined, "/T\u20ACAMS/-1/EMPLOYEES", -1);
    this.oMetaModelMock.expects("fetchUpdateData").returns(SyncPromise.resolve({
        editUrl: undefined,
        entityPath: "/T\u20ACAMS/-1/EMPLOYEES",
        propertyPath: ""
    }));
    return this.oMetaModel.fetchCanonicalPath(oContext).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "/T\u20ACAMS/-1/EMPLOYEES: No canonical path for transient entity");
    });
});
QUnit.test("getProperty = getObject", function (assert) {
    assert.strictEqual(this.oMetaModel.getProperty, this.oMetaModel.getObject);
});
QUnit.test("bindProperty", function (assert) {
    var oBinding, oContext = {}, mParameters = {}, sPath = "foo";
    oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
    assert.ok(oBinding instanceof PropertyBinding);
    assert.ok(oBinding.hasOwnProperty("vValue"));
    assert.strictEqual(oBinding.getContext(), oContext);
    assert.strictEqual(oBinding.getModel(), this.oMetaModel);
    assert.strictEqual(oBinding.getPath(), sPath);
    assert.strictEqual(oBinding.mParameters, mParameters, "mParameters available internally");
    assert.strictEqual(oBinding.getValue(), undefined);
    assert.strictEqual(oBinding.getExternalValue(), undefined);
    assert.throws(function () {
        oBinding.setExternalValue("foo");
    }, /Unsupported operation: ODataMetaPropertyBinding#setValue/);
});
[undefined, {}, { $$valueAsPromise: false }].forEach(function (mParameters, i) {
    QUnit.test("ODataMetaPropertyBinding#checkUpdate: " + i, function (assert) {
        var oBinding, oContext = {}, sPath = "foo", oValue = {}, oPromise = SyncPromise.resolve(Promise.resolve(oValue));
        oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
        this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters)).returns(oPromise);
        this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Change });
        oBinding.checkUpdate();
        assert.strictEqual(oBinding.getValue(), undefined);
        oPromise.then(function () {
            assert.strictEqual(oBinding.getValue(), oValue);
        });
        return oPromise;
    });
});
QUnit.test("ODataMetaPropertyBinding#checkUpdate: $$valueAsPromise=true, sync", function (assert) {
    var oBinding, oContext = {}, mParameters = { $$valueAsPromise: true }, sPath = "foo", oValue = {}, oPromise = SyncPromise.resolve(oValue);
    oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
    this.mock(SyncPromise.prototype).expects("unwrap").never();
    this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters)).returns(oPromise);
    this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Change });
    oBinding.checkUpdate();
    assert.strictEqual(oBinding.getValue(), oValue, "Value sync");
    return oPromise;
});
QUnit.test("ODataMetaPropertyBinding#checkUpdate: no event", function () {
    var oBinding, oContext = {}, mParameters = {}, sPath = "foo", oValue = {}, oPromise = SyncPromise.resolve(Promise.resolve(oValue));
    oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
    oBinding.vValue = oValue;
    this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters)).returns(oPromise);
    this.mock(oBinding).expects("_fireChange").never();
    oBinding.checkUpdate();
    return oPromise;
});
QUnit.test("ODataMetaPropertyBinding#checkUpdate: bForceUpdate, sChangeReason", function () {
    var oBinding, oContext = {}, mParameters = {}, sPath = "foo", oValue = {}, oPromise = SyncPromise.resolve(Promise.resolve(oValue));
    oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
    oBinding.vValue = oValue;
    this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters)).returns(oPromise);
    this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: "Foo" });
    oBinding.checkUpdate(true, "Foo");
    return oPromise;
});
QUnit.test("ODataMetaPropertyBinding#checkUpdate: $$valueAsPromise = true", function (assert) {
    var oBinding, oContext = {}, mParameters = {
        $$valueAsPromise: true
    }, sPath = "foo", oValue = {}, oPromise, oSyncPromise = SyncPromise.resolve(Promise.resolve(oValue));
    oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);
    this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters)).returns(oSyncPromise);
    this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Change }).twice().onFirstCall().callsFake(function () {
        oPromise = oBinding.getValue();
        assert.ok(oPromise instanceof Promise, "Value is a Promise");
    }).onSecondCall().callsFake(function () {
        assert.strictEqual(oBinding.getValue(), oValue, "Value resolved");
    });
    oBinding.initialize();
    assert.strictEqual(oBinding.getValue(), oPromise, "Value is the pending Promise");
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, oValue);
        assert.strictEqual(oBinding.getValue(), oValue);
    });
});
QUnit.test("ODataMetaPropertyBinding#checkUpdate: promise rejected", function (assert) {
    var oBinding, oContext = {}, oError = new Error("This call intentionally failed"), sPath = "foo", oSyncPromise = SyncPromise.reject(oError);
    oBinding = this.oMetaModel.bindProperty(sPath, oContext);
    this.oMetaModelMock.expects("fetchObject").withExactArgs(sPath, sinon.match.same(oContext), undefined).returns(oSyncPromise);
    this.mock(oBinding).expects("_fireChange").never();
    assert.throws(function () {
        oBinding.initialize();
    }, oError);
});
QUnit.test("ODataMetaPropertyBinding#setContext", function (assert) {
    var oBinding, oBindingMock, oContext = {};
    oBinding = this.oMetaModel.bindProperty("Foo", oContext);
    oBindingMock = this.mock(oBinding);
    oBindingMock.expects("checkUpdate").never();
    oBinding.setContext(oContext);
    oBindingMock.expects("checkUpdate").withExactArgs(false, ChangeReason.Context);
    oBinding.setContext(undefined);
    assert.strictEqual(oBinding.getContext(), undefined);
    oBinding = this.oMetaModel.bindProperty("/Foo");
    this.mock(oBinding).expects("checkUpdate").never();
    oBinding.setContext(oContext);
});
["ENTRYDATE", "/EMPLOYEES/ENTRYDATE"].forEach(function (sPath) {
    QUnit.test("bindContext: " + sPath, function (assert) {
        var bAbsolutePath = sPath[0] === "/", oBinding, oBoundContext, iChangeCount = 0, oContext = this.oMetaModel.getMetaContext("/EMPLOYEES"), oContextCopy = this.oMetaModel.getMetaContext("/EMPLOYEES"), oNewContext = this.oMetaModel.getMetaContext("/T\u20ACAMS");
        oBinding = this.oMetaModel.bindContext(sPath, null);
        assert.ok(oBinding instanceof ContextBinding);
        assert.strictEqual(oBinding.getModel(), this.oMetaModel);
        assert.strictEqual(oBinding.getPath(), sPath);
        assert.strictEqual(oBinding.getContext(), null);
        assert.strictEqual(oBinding.isInitial(), true);
        assert.strictEqual(oBinding.getBoundContext(), null);
        oBinding = this.oMetaModel.bindContext(sPath, oContextCopy);
        assert.ok(oBinding instanceof ContextBinding);
        assert.strictEqual(oBinding.getModel(), this.oMetaModel);
        assert.strictEqual(oBinding.getPath(), sPath);
        assert.strictEqual(oBinding.getContext(), oContextCopy);
        assert.strictEqual(oBinding.isInitial(), true);
        assert.strictEqual(oBinding.getBoundContext(), null);
        oBinding.attachChange(function (oEvent) {
            assert.strictEqual(oEvent.getId(), "change");
            iChangeCount += 1;
        });
        oBinding.setContext(oContext);
        assert.strictEqual(iChangeCount, 0, "still initial");
        assert.strictEqual(oBinding.isInitial(), true);
        assert.strictEqual(oBinding.getBoundContext(), null);
        assert.strictEqual(oBinding.getContext(), oContext);
        oBinding.initialize();
        assert.strictEqual(iChangeCount, 1, "ManagedObject relies on 'change' event!");
        assert.strictEqual(oBinding.isInitial(), false);
        oBoundContext = oBinding.getBoundContext();
        assert.strictEqual(oBoundContext.getModel(), this.oMetaModel);
        assert.strictEqual(oBoundContext.getPath(), bAbsolutePath ? sPath : oContext.getPath() + "/" + sPath);
        oBinding.setContext(oContext);
        assert.strictEqual(iChangeCount, 1, "context unchanged");
        assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
        oBinding.setContext(oContextCopy);
        assert.strictEqual(iChangeCount, 1, "context unchanged");
        assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
        oBinding.setContext(oNewContext);
        if (bAbsolutePath) {
            assert.strictEqual(iChangeCount, 1, "context unchanged");
            assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
        }
        else {
            assert.strictEqual(iChangeCount, 2, "context changed");
            oBoundContext = oBinding.getBoundContext();
            assert.strictEqual(oBoundContext.getModel(), this.oMetaModel);
            assert.strictEqual(oBoundContext.getPath(), oNewContext.getPath() + "/" + sPath);
        }
        oBinding.setContext(null);
        if (bAbsolutePath) {
            assert.strictEqual(iChangeCount, 1, "context unchanged");
            assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
        }
        else {
            assert.strictEqual(iChangeCount, 3, "context changed");
            assert.strictEqual(oBinding.isInitial(), false);
            assert.strictEqual(oBinding.getBoundContext(), null);
        }
    });
});
QUnit.test("bindList", function (assert) {
    var oBinding, oContext = this.oMetaModel.getContext("/EMPLOYEES"), aFilters = [], sPath = "@", aSorters = [];
    this.oMetaModelMock.expects("fetchObject").returns(SyncPromise.resolve());
    oBinding = this.oMetaModel.bindList(sPath, oContext, aSorters, aFilters);
    assert.ok(oBinding instanceof ClientListBinding);
    assert.strictEqual(oBinding.getModel(), this.oMetaModel);
    assert.strictEqual(oBinding.getPath(), sPath);
    assert.strictEqual(oBinding.getContext(), oContext);
    assert.strictEqual(oBinding.aSorters, aSorters);
    assert.strictEqual(oBinding.aApplicationFilters, aFilters);
});
QUnit.test("ODataMetaListBinding#setContexts", function (assert) {
    var oBinding, oBindingMock, oContext = this.oMetaModel.getContext("/EMPLOYEES"), aContexts = [], sPath = "path";
    this.oMetaModelMock.expects("fetchObject").returns(SyncPromise.resolve());
    oBinding = this.oMetaModel.bindList(sPath, oContext);
    oBindingMock = this.mock(oBinding);
    oBindingMock.expects("updateIndices").withExactArgs();
    oBindingMock.expects("applyFilter").withExactArgs();
    oBindingMock.expects("applySort").withExactArgs();
    oBindingMock.expects("_getLength").withExactArgs().returns(42);
    oBinding.setContexts(aContexts);
    assert.strictEqual(oBinding.oList, aContexts);
    assert.strictEqual(oBinding.iLength, 42);
});
QUnit.test("ODataMetaListBinding#update (sync)", function () {
    var oBinding, oBindingMock, oContext = this.oMetaModel.getContext("/EMPLOYEES"), aContexts = [{}], sPath = "path";
    this.oMetaModelMock.expects("fetchObject").returns(SyncPromise.resolve());
    oBinding = this.oMetaModel.bindList(sPath, oContext);
    oBindingMock = this.mock(oBinding);
    oBindingMock.expects("fetchContexts").withExactArgs().returns(SyncPromise.resolve(aContexts));
    oBindingMock.expects("setContexts").withExactArgs(sinon.match.same(aContexts));
    oBindingMock.expects("_fireChange").never();
    oBinding.update();
});
QUnit.test("ODataMetaListBinding#update (async)", function (assert) {
    var done = assert.async(), oBinding, oBindingMock, oContext = this.oMetaModel.getContext("/EMPLOYEES"), aContexts = [{}], sPath = "path", oFetchPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
        oBindingMock.expects("setContexts").withExactArgs(sinon.match.same(aContexts)).callThrough();
        oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Change }).callThrough();
        return aContexts;
    }), aResult;
    this.oMetaModelMock.expects("fetchObject").returns(SyncPromise.resolve());
    oBinding = this.oMetaModel.bindList(sPath, oContext);
    oBindingMock = this.mock(oBinding);
    oBindingMock.expects("fetchContexts").withExactArgs().returns(oFetchPromise);
    oBindingMock.expects("setContexts").withExactArgs(sinon.match(function (aContexts) {
        return aContexts.length === 0 && aContexts.dataRequested === true;
    })).callThrough();
    oBindingMock.expects("_fireChange").never();
    oBinding.update();
    aResult = oBinding.getContexts();
    assert.strictEqual(aResult.length, 0);
    assert.strictEqual(aResult.dataRequested, true);
    oBinding.attachEventOnce("change", function () {
        aResult = oBinding.getContexts();
        assert.strictEqual(aResult.length, 1);
        assert.strictEqual(aResult[0], aContexts[0]);
        assert.notOk("dataRequested" in aResult);
        done();
    });
});
QUnit.test("ODataMetaListBinding#checkUpdate", function () {
    var oBinding, oBindingMock, oContext = this.oMetaModel.getContext("/"), sPath = "";
    this.oMetaModelMock.expects("fetchObject").returns(SyncPromise.resolve());
    oBinding = this.oMetaModel.bindList(sPath, oContext);
    oBindingMock = this.mock(oBinding);
    this.mock(oBinding).expects("update").thrice().callsFake(function () {
        this.oList = [{}];
    });
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Change });
    oBinding.checkUpdate();
    oBinding.checkUpdate();
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Change });
    oBinding.checkUpdate(true);
});
QUnit.test("ODataMetaListBinding#getContexts, getCurrentContexts", function (assert) {
    var oBinding, oMetaModel = this.oMetaModel, oContext = oMetaModel.getMetaContext("/EMPLOYEES"), sPath = "";
    function assertContextPaths(aContexts, aPaths) {
        assert.notOk("diff" in aContexts, "extended change detection is ignored");
        assert.deepEqual(aContexts.map(function (oContext) {
            assert.strictEqual(oContext.getModel(), oMetaModel);
            return oContext.getPath().replace("/EMPLOYEES/", "");
        }), aPaths);
        assert.deepEqual(oBinding.getCurrentContexts(), aContexts);
    }
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
    oBinding = oMetaModel.bindList(sPath, oContext);
    oBinding.enableExtendedChangeDetection();
    assertContextPaths(oBinding.getContexts(0, 2), ["ID", "AGE"]);
    assertContextPaths(oBinding.getContexts(1, 2), ["AGE", "EMPLOYEE_2_CONTAINED_S"]);
    assertContextPaths(oBinding.getContexts(), ["ID", "AGE", "EMPLOYEE_2_CONTAINED_S", "EMPLOYEE_2_EQUIPM\u20ACNTS", "EMPLOYEE_2_TEAM", "SAL\u00C3RY"]);
    assertContextPaths(oBinding.getContexts(0, 10), ["ID", "AGE", "EMPLOYEE_2_CONTAINED_S", "EMPLOYEE_2_EQUIPM\u20ACNTS", "EMPLOYEE_2_TEAM", "SAL\u00C3RY"]);
    assertContextPaths(oBinding.getContexts(4, 10), ["EMPLOYEE_2_TEAM", "SAL\u00C3RY"]);
    oBinding.attachEvent("sort", function () {
        assert.ok(false, "unexpected sort event");
    });
    oBinding.sort(new Sorter("@sapui.name"));
    assertContextPaths(oBinding.getContexts(), ["AGE", "EMPLOYEE_2_CONTAINED_S", "EMPLOYEE_2_EQUIPM\u20ACNTS", "EMPLOYEE_2_TEAM", "ID", "SAL\u00C3RY"]);
    oBinding.attachEvent("filter", function () {
        assert.ok(false, "unexpected filter event");
    });
    oBinding.filter(new Filter("$kind", "EQ", "Property"));
    assertContextPaths(oBinding.getContexts(), ["AGE", "ID", "SAL\u00C3RY"]);
});
[{
        contextPath: undefined,
        metaPath: "@",
        result: []
    }, {
        contextPath: "/EMPLOYEES",
        metaPath: "",
        result: [
            "/EMPLOYEES/ID",
            "/EMPLOYEES/AGE",
            "/EMPLOYEES/EMPLOYEE_2_CONTAINED_S",
            "/EMPLOYEES/EMPLOYEE_2_EQUIPM\u20ACNTS",
            "/EMPLOYEES/EMPLOYEE_2_TEAM",
            "/EMPLOYEES/SAL\u00C3RY"
        ]
    }, {
        contextPath: "/",
        metaPath: "EMPLOYEES/",
        result: [
            "/EMPLOYEES/ID",
            "/EMPLOYEES/AGE",
            "/EMPLOYEES/EMPLOYEE_2_CONTAINED_S",
            "/EMPLOYEES/EMPLOYEE_2_EQUIPM\u20ACNTS",
            "/EMPLOYEES/EMPLOYEE_2_TEAM",
            "/EMPLOYEES/SAL\u00C3RY"
        ]
    }, {
        metaPath: "/",
        result: [
            "/ChangeManagerOfTeam",
            "/EMPLOYEES",
            "/EQUIPM\u20ACNTS",
            "/GetEmployeeMaxAge",
            "/MANAGERS",
            "/Me",
            "/OverloadedAction",
            "/OverloadedFunctionImport",
            "/ServiceGroups",
            "/TEAMS",
            "/T\u20ACAMS",
            "/VoidAction"
        ]
    }, {
        contextPath: "/T\u20ACAMS/Team_Id",
        metaPath: "@",
        result: [
            "/T\u20ACAMS/Team_Id@Common.Label",
            "/T\u20ACAMS/Team_Id@Common.Text",
            "/T\u20ACAMS/Team_Id@Common.Text@UI.TextArrangement"
        ]
    }, {
        contextPath: "/EMPLOYEES/AGE",
        metaPath: "@",
        result: []
    }, {
        contextPath: "/T\u20ACAMS/$Type/@UI.LineItem/0",
        metaPath: "./@",
        result: [
            "/T\u20ACAMS/$Type/@UI.LineItem/0/@UI.Importance"
        ]
    }, {
        contextPath: "/T\u20ACAMS/$Type/@UI.LineItem/0/@",
        metaPath: "",
        result: [
            "/T\u20ACAMS/$Type/@UI.LineItem/0/@UI.Importance"
        ]
    }, {
        contextPath: undefined,
        metaPath: "/Unknown",
        result: [],
        warning: ["Unknown child Unknown of tea_busi.DefaultContainer", "/Unknown/"]
    }, {
        contextPath: "/T\u20ACAMS/tea_busi.NewAction",
        metaPath: "@",
        result: [
            "/T\u20ACAMS/tea_busi.NewAction@Common.Label",
            "/T\u20ACAMS/tea_busi.NewAction@Common.QuickInfo",
            "/T\u20ACAMS/tea_busi.NewAction@Core.OperationAvailable"
        ]
    }, {
        contextPath: "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload",
        metaPath: "@",
        result: [
            "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload@Common.Label",
            "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload@Common.QuickInfo",
            "/T\u20ACAMS/tea_busi.NewAction/@$ui5.overload@Core.OperationAvailable"
        ]
    }].forEach(function (oFixture) {
    var sPath = oFixture.contextPath ? oFixture.contextPath + "|" + oFixture.metaPath : oFixture.metaPath;
    QUnit.test("ODataMetaListBinding#fetchContexts (sync): " + sPath, function (assert) {
        var oBinding, oMetaModel = this.oMetaModel, oContext = oFixture.contextPath && oMetaModel.getContext(oFixture.contextPath);
        if (oFixture.warning) {
            this.oLogMock.expects("isLoggable").twice().withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(true);
            this.oLogMock.expects("warning").twice().withExactArgs(oFixture.warning[0], oFixture.warning[1], sODataMetaModel);
        }
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mScope));
        oBinding = this.oMetaModel.bindList(oFixture.metaPath, oContext);
        this.mock(oBinding).expects("getResolvedPath").withExactArgs().callThrough();
        assert.deepEqual(oBinding.fetchContexts().getResult().map(function (oContext) {
            assert.strictEqual(oContext.getModel(), oMetaModel);
            return oContext.getPath();
        }), oFixture.result);
    });
});
QUnit.test("ODataMetaListBinding#fetchContexts (async)", function (assert) {
    var oBinding, oMetaModel = this.oMetaModel, sPath = "/foo";
    this.oMetaModelMock.expects("fetchObject").twice().withExactArgs(sPath + "/").returns(SyncPromise.resolve(Promise.resolve({ bar: "", baz: "" })));
    oBinding = this.oMetaModel.bindList(sPath);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().callThrough();
    return oBinding.fetchContexts().then(function (oResult) {
        assert.deepEqual(oResult.map(function (oContext) {
            assert.strictEqual(oContext.getModel(), oMetaModel);
            return oContext.getPath();
        }), ["/foo/bar", "/foo/baz"]);
    });
});
QUnit.test("events", function (assert) {
    assert.throws(function () {
        this.oMetaModel.attachParseError();
    }, new Error("Unsupported event 'parseError': v4.ODataMetaModel#attachEvent"));
    assert.throws(function () {
        this.oMetaModel.attachRequestCompleted();
    }, new Error("Unsupported event 'requestCompleted': v4.ODataMetaModel#attachEvent"));
    assert.throws(function () {
        this.oMetaModel.attachRequestFailed();
    }, new Error("Unsupported event 'requestFailed': v4.ODataMetaModel#attachEvent"));
    assert.throws(function () {
        this.oMetaModel.attachRequestSent();
    }, new Error("Unsupported event 'requestSent': v4.ODataMetaModel#attachEvent"));
});
QUnit.test("validate: mSchema2MetadataUrl", function (assert) {
    var mScope = {
        "$Version": "4.0",
        "$Reference": {
            "/A/$metadata": {
                "$Include": [
                    "A.",
                    "A.A."
                ]
            },
            "/B/$metadata": {
                "$Include": [
                    "B.",
                    "B.B."
                ]
            },
            "/C/$metadata": {
                "$Include": ["C."]
            },
            "../../../../default/iwbep/tea_busi_product/0001/$metadata": {
                "$Include": [
                    "tea_busi_product."
                ]
            }
        }
    }, sUrl = "/~/$metadata";
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {});
    this.oMetaModel.mSchema2MetadataUrl["A."] = { "/A/$metadata": false };
    this.oMetaModel.mSchema2MetadataUrl["B.B."] = { "/B/V2/$metadata": false };
    this.oMetaModel.mSchema2MetadataUrl["C."] = { "/C/$metadata": true };
    assert.strictEqual(this.oMetaModel.validate(sUrl, mScope), mScope);
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {
        "A.": { "/A/$metadata": false },
        "A.A.": { "/A/$metadata": false },
        "B.": { "/B/$metadata": false },
        "B.B.": {
            "/B/$metadata": false,
            "/B/V2/$metadata": false
        },
        "C.": { "/C/$metadata": true },
        "tea_busi_product.": { "/a/default/iwbep/tea_busi_product/0001/$metadata": false }
    });
});
QUnit.test("getLastModified", function (assert) {
    var mEmptyScope = {
        "$Version": "4.0"
    }, mNewScope = {
        "$Version": "4.0",
        "$Date": "Tue, 18 Apr 2017 14:40:29 GMT"
    }, iNow = Date.now(), mOldScope = {
        "$Version": "4.0",
        "$Date": "Tue, 18 Apr 2017 14:40:29 GMT",
        "$LastModified": "Fri, 07 Apr 2017 11:21:50 GMT"
    }, mOldScopeClone = clone(mOldScope), sUrl = "/~/$metadata";
    assert.strictEqual(this.oMetaModel.getLastModified().getTime(), 0, "initial value");
    assert.strictEqual(this.oMetaModel.validate(sUrl, mOldScope), mOldScope);
    assert.strictEqual(this.oMetaModel.getLastModified().toISOString(), "2017-04-07T11:21:50.000Z", "old $LastModified is used");
    assert.notOk("$LastModified" in mOldScope);
    assert.strictEqual(this.oMetaModel.validate(sUrl, mNewScope), mNewScope);
    assert.strictEqual(this.oMetaModel.getLastModified().toISOString(), "2017-04-18T14:40:29.000Z", "new $Date is used");
    assert.notOk("$Date" in mNewScope);
    assert.strictEqual(this.oMetaModel.validate(sUrl, mOldScopeClone), mOldScopeClone);
    assert.strictEqual(this.oMetaModel.getLastModified().toISOString(), "2017-04-18T14:40:29.000Z", "new $Date wins, old $LastModified is ignored");
    assert.notOk("$LastModified" in mOldScopeClone);
    assert.strictEqual(this.oMetaModel.validate(sUrl, mEmptyScope), mEmptyScope);
    assert.ok(this.oMetaModel.getLastModified().getTime() >= iNow, "missing $Date/$LastModified is like 'now': " + this.oMetaModel.getLastModified());
});
QUnit.test("getETags", function (assert) {
    var sETag = "W/\"...\"", mETags, that = this;
    function codeUnderTest(sUrl, mScope) {
        assert.strictEqual(that.oMetaModel.validate(sUrl, mScope), mScope);
        assert.notOk("$ETag" in mScope);
        assert.notOk("$LastModified" in mScope);
    }
    assert.deepEqual(this.oMetaModel.getETags(), {}, "initial value");
    codeUnderTest("/~/A", {
        "$Version": "4.0",
        "$LastModified": "Fri, 07 Apr 2017 11:21:50 GMT"
    });
    codeUnderTest("/~/B", {
        "$Version": "4.0",
        "$LastModified": "Tue, 18 Apr 2017 14:40:29 GMT"
    });
    codeUnderTest("/~/C", {
        "$Version": "4.0"
    });
    codeUnderTest("/~/D", {
        "$Version": "4.0",
        "$ETag": sETag
    });
    mETags = this.oMetaModel.getETags();
    assert.deepEqual(mETags, {
        "/~/A": new Date(Date.UTC(2017, 3, 7, 11, 21, 50)),
        "/~/B": new Date(Date.UTC(2017, 3, 18, 14, 40, 29)),
        "/~/C": null,
        "/~/D": sETag
    });
});
[{
        message: "Unsupported IncludeAnnotations",
        scope: {
            "$Version": "4.0",
            "$Reference": {
                "/A/$metadata": {
                    "$Include": [
                        "A."
                    ]
                },
                "/B/$metadata": {
                    "$IncludeAnnotations": [{
                            "$TermNamespace": "com.sap.vocabularies.Common.v1"
                        }]
                }
            }
        }
    }, {
        message: "A schema cannot span more than one document: tea_busi." + " - is both included and defined",
        scope: {
            "$Version": "4.0",
            "$Reference": {
                "/B/$metadata": {
                    "$Include": [
                        "foo.",
                        "tea_busi."
                    ]
                }
            },
            "tea_busi.": {
                "$kind": "Schema"
            }
        }
    }, {
        message: "A schema cannot span more than one document: existing." + " - expected reference URI /B/v1/$metadata but instead saw /B/v2/$metadata",
        scope: {
            "$Version": "4.0",
            "$Reference": {
                "/A/$metadata": {
                    "$Include": [
                        "foo.",
                        "bar."
                    ]
                },
                "/B/v2/$metadata": {
                    "$Include": [
                        "baz.",
                        "existing."
                    ]
                }
            }
        }
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bSupportReferences) {
        var sMessage = oFixture.message, sTitle = "validate: " + sMessage + ", supportReferences: " + bSupportReferences;
        QUnit.test(sTitle, function (assert) {
            var oError, sUrl = "/~/$metadata", that = this;
            function codeUnderTest() {
                var oResult = that.oMetaModel.validate(sUrl, oFixture.scope);
                assert.strictEqual(oResult, oFixture.scope);
            }
            this.oMetaModel.bSupportReferences = bSupportReferences;
            this.oMetaModel.mSchema2MetadataUrl = {
                "existing.": { "/B/v1/$metadata": true }
            };
            if (bSupportReferences) {
                oError = new Error(sUrl + ": " + sMessage);
                this.mock(this.oMetaModel.oModel).expects("reportError").withExactArgs(sMessage, sODataMetaModel, sinon.match({
                    message: oError.message,
                    name: "Error"
                }));
            }
            if (bSupportReferences) {
                assert.throws(codeUnderTest, oError);
            }
            else {
                codeUnderTest();
            }
        });
    });
});
QUnit.test("_mergeAnnotations: without annotation files", function (assert) {
    var mExpectedAnnotations = {
        "same.target": {
            "@Common.Description": "",
            "@Common.Label": {
                "old": true
            },
            "@Common.Text": ""
        },
        "another.target": {
            "@Common.Label": ""
        }
    }, mScope = {
        "A.": {
            "$kind": "Schema",
            "$Annotations": {
                "same.target": {
                    "@Common.Label": {
                        "old": true
                    },
                    "@Common.Text": ""
                }
            }
        },
        "B.": {
            "$kind": "Schema",
            "$Annotations": {
                "same.target": {
                    "@Common.Description": "",
                    "@Common.Label": {
                        "new": true
                    }
                },
                "another.target": {
                    "@Common.Label": ""
                }
            }
        },
        "B.B": {}
    };
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, mScope);
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {});
    this.oMetaModel._mergeAnnotations(mScope, []);
    assert.deepEqual(mScope.$Annotations, mExpectedAnnotations, "$Annotations have been shifted and merged from schemas to root");
    assert.notOk("$Annotations" in mScope["A."], "$Annotations removed from schema");
    assert.notOk("$Annotations" in mScope["B."], "$Annotations removed from schema");
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {
        "A.": { "/a/b/c/d/e/$metadata": false },
        "B.": { "/a/b/c/d/e/$metadata": false }
    });
});
QUnit.test("_mergeAnnotations: validation failure for $metadata", function (assert) {
    var oError = new Error(), mScope = {};
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, mScope).throws(oError);
    assert.throws(function () {
        this.oMetaModel._mergeAnnotations(mScope, []);
    }, oError);
});
QUnit.test("_mergeAnnotations: validation failure in annotation file", function (assert) {
    var oError = new Error(), mScope = {}, mAnnotationScope1 = {}, mAnnotationScope2 = {};
    this.oMetaModel.aAnnotationUris = ["n/a", "/my/annotation.xml"];
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, mScope);
    this.oMetaModelMock.expects("validate").withExactArgs("n/a", mAnnotationScope1);
    this.oMetaModelMock.expects("validate").withExactArgs("/my/annotation.xml", mAnnotationScope2).throws(oError);
    assert.throws(function () {
        this.oMetaModel._mergeAnnotations(mScope, [mAnnotationScope1, mAnnotationScope2]);
    }, oError);
});
QUnit.test("_mergeAnnotations: with annotation files (legacy)", function (assert) {
    var sNamespace = "com.sap.gateway.default.iwbep.tea_busi.v0001.", sWorker = sNamespace + "Worker/", sBasicSalaryCurr = sWorker + "SALARY/BASIC_SALARY_CURR", sBasicSalaryCurr2 = "another.schema.2.SALARY/BASIC_SALARY_CURR", sBonusCurr = sWorker + "SALARY/BONUS_CURR", sCommonLabel = "@com.sap.vocabularies.Common.v1.Label", sCommonQuickInfo = "@com.sap.vocabularies.Common.v1.QuickInfo", sCommonText = "@com.sap.vocabularies.Common.v1.Text", sBaseUrl = window.location.pathname.split(/\/(?:test-|)resources\//)[0] + "/test-resources/sap/ui/core/qunit/odata/v4/data/", oMetadata = getDataAsJson("metadata.json"), oExpectedResult = clone(oMetadata), oAnnotation = getDataAsJson("legacy_annotations.json"), oAnnotationCopy = clone(oAnnotation);
    function getDataAsJson(sFileName) {
        var oXHR = new XMLHttpRequest();
        oXHR.open("GET", sBaseUrl + sFileName, false);
        oXHR.send();
        return JSON.parse(oXHR.response);
    }
    this.oMetaModel.bSupportReferences = false;
    this.oMetaModel.aAnnotationUris = ["n/a"];
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, oMetadata);
    this.oMetaModelMock.expects("validate").withExactArgs("n/a", oAnnotation);
    oExpectedResult.$Annotations = oMetadata[sNamespace].$Annotations;
    delete oExpectedResult[sNamespace].$Annotations;
    oExpectedResult["my.schema.2.FuGetEmployeeMaxAge"] = oAnnotationCopy["my.schema.2.FuGetEmployeeMaxAge"];
    oExpectedResult["my.schema.2.Entity"] = oAnnotationCopy["my.schema.2.Entity"];
    oExpectedResult["my.schema.2.DefaultContainer"] = oAnnotationCopy["my.schema.2.DefaultContainer"];
    oExpectedResult["my.schema.2."] = oAnnotationCopy["my.schema.2."];
    oExpectedResult["another.schema.2."] = oAnnotationCopy["another.schema.2."];
    oExpectedResult.$Annotations[sBasicSalaryCurr][sCommonLabel] = oAnnotationCopy["my.schema.2."].$Annotations[sBasicSalaryCurr][sCommonLabel];
    oExpectedResult.$Annotations[sBasicSalaryCurr][sCommonQuickInfo] = oAnnotationCopy["my.schema.2."].$Annotations[sBasicSalaryCurr][sCommonQuickInfo];
    oExpectedResult.$Annotations[sBonusCurr][sCommonText] = oAnnotationCopy["my.schema.2."].$Annotations[sBonusCurr][sCommonText];
    oExpectedResult.$Annotations[sBasicSalaryCurr2] = oAnnotationCopy["another.schema.2."].$Annotations[sBasicSalaryCurr2];
    delete oExpectedResult["my.schema.2."].$Annotations;
    delete oExpectedResult["another.schema.2."].$Annotations;
    this.oMetaModel._mergeAnnotations(oMetadata, [oAnnotation]);
    assert.deepEqual(oMetadata, oExpectedResult, "merged metadata as expected");
});
QUnit.test("_mergeAnnotations: with annotation files", function (assert) {
    var mScope0 = {
        "$EntityContainer": "tea_busi.DefaultContainer",
        "$Reference": {
            "../../../../default/iwbep/tea_busi_foo/0001/$metadata": {
                "$Include": [
                    "tea_busi_foo.v0001."
                ]
            }
        },
        "$Version": "4.0",
        "tea_busi.": {
            "$kind": "Schema",
            "$Annotations": {
                "tea_busi.DefaultContainer": {
                    "@A": "from $metadata",
                    "@B": "from $metadata",
                    "@C": "from $metadata"
                },
                "tea_busi.TEAM": {
                    "@D": ["from $metadata"],
                    "@E": ["from $metadata"],
                    "@F": ["from $metadata"]
                }
            }
        },
        "tea_busi.DefaultContainer": {
            "$kind": "EntityContainer"
        },
        "tea_busi.EQUIPMENT": {
            "$kind": "EntityType"
        },
        "tea_busi.TEAM": {
            "$kind": "EntityType"
        },
        "tea_busi.Worker": {
            "$kind": "EntityType"
        }
    }, mScope1 = {
        "$Version": "4.0",
        "tea_busi_foo.v0001.": {
            "$kind": "Schema",
            "$Annotations": {
                "tea_busi_foo.v0001.Product/Name": {
                    "@Common.Label": "from $metadata"
                }
            }
        },
        "tea_busi_foo.v0001.Product": {
            "$kind": "EntityType",
            "Name": {
                "$kind": "Property",
                "$Type": "Edm.String"
            }
        }
    }, mAnnotationScope1 = {
        "$Version": "4.0",
        "foo.": {
            "$kind": "Schema",
            "$Annotations": {
                "tea_busi.DefaultContainer": {
                    "@B": "from annotation #1",
                    "@C": "from annotation #1"
                },
                "tea_busi.TEAM": {
                    "@E": ["from annotation #1"],
                    "@F": ["from annotation #1"]
                },
                "tea_busi.Worker": {
                    "@From.Annotation": {
                        "$Type": "some.Record",
                        "Label": "from annotation #1"
                    },
                    "@From.Annotation1": "from annotation #1"
                }
            }
        }
    }, mAnnotationScope2 = {
        "$Version": "4.0",
        "bar.": {
            "$kind": "Schema",
            "$Annotations": {
                "tea_busi.DefaultContainer": {
                    "@C": "from annotation #2"
                },
                "tea_busi.EQUIPMENT": {
                    "@From.Annotation2": "from annotation #2"
                },
                "tea_busi.TEAM": {
                    "@F": ["from annotation #2"]
                },
                "tea_busi.Worker": {
                    "@From.Annotation": {
                        "$Type": "some.Record",
                        "Value": "from annotation #2"
                    }
                },
                "tea_busi_foo.v0001.Product/Name": {
                    "@Common.Label": "from annotation #2"
                }
            }
        }
    }, mExpectedScope = {
        "$Annotations": {
            "tea_busi.DefaultContainer": {
                "@A": "from $metadata",
                "@B": "from annotation #1",
                "@C": "from annotation #2"
            },
            "tea_busi.EQUIPMENT": {
                "@From.Annotation2": "from annotation #2"
            },
            "tea_busi.TEAM": {
                "@D": ["from $metadata"],
                "@E": ["from annotation #1"],
                "@F": ["from annotation #2"]
            },
            "tea_busi.Worker": {
                "@From.Annotation": {
                    "$Type": "some.Record",
                    "Value": "from annotation #2"
                },
                "@From.Annotation1": "from annotation #1"
            },
            "tea_busi_foo.v0001.Product/Name": {
                "@Common.Label": "from annotation #2"
            }
        },
        "$EntityContainer": "tea_busi.DefaultContainer",
        "$Reference": {
            "../../../../default/iwbep/tea_busi_foo/0001/$metadata": {
                "$Include": [
                    "tea_busi_foo.v0001."
                ]
            }
        },
        "$Version": "4.0",
        "bar.": {
            "$kind": "Schema"
        },
        "foo.": {
            "$kind": "Schema"
        },
        "tea_busi.": {
            "$kind": "Schema"
        },
        "tea_busi.DefaultContainer": {
            "$kind": "EntityContainer"
        },
        "tea_busi.EQUIPMENT": {
            "$kind": "EntityType"
        },
        "tea_busi.TEAM": {
            "$kind": "EntityType"
        },
        "tea_busi.Worker": {
            "$kind": "EntityType"
        }
    };
    this.oMetaModel.aAnnotationUris = ["/URI/1", "/URI/2"];
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, mScope0);
    this.oMetaModelMock.expects("validate").withExactArgs("/URI/1", mAnnotationScope1);
    this.oMetaModelMock.expects("validate").withExactArgs("/URI/2", mAnnotationScope2);
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {});
    this.oMetaModel._mergeAnnotations(mScope0, [mAnnotationScope1, mAnnotationScope2]);
    assert.deepEqual(mScope0, mExpectedScope);
    assert.strictEqual(mScope0["tea_busi."].$Annotations, undefined);
    assert.strictEqual(mAnnotationScope1["foo."].$Annotations, undefined);
    assert.strictEqual(mAnnotationScope2["bar."].$Annotations, undefined);
    assert.deepEqual(this.oMetaModel.mSchema2MetadataUrl, {
        "bar.": { "/URI/2": false },
        "foo.": { "/URI/1": false },
        "tea_busi.": { "/a/b/c/d/e/$metadata": false }
    });
    this.oMetaModel.mSchema2MetadataUrl["tea_busi_foo.v0001."] = { "/a/default/iwbep/tea_busi_foo/0001/$metadata": false };
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope0));
    this.mock(this.oMetaModel.oRequestor).expects("read").withExactArgs("/a/default/iwbep/tea_busi_foo/0001/$metadata").resolves(mScope1);
    this.oMetaModelMock.expects("validate").withExactArgs("/a/default/iwbep/tea_busi_foo/0001/$metadata", mScope1).returns(mScope1);
    return this.oMetaModel.fetchObject("/tea_busi_foo.v0001.Product/Name@Common.Label").then(function (sLabel) {
        assert.strictEqual(sLabel, "from annotation #2", "not overwritten by $metadata");
    });
});
QUnit.test("_mergeAnnotations - error (legacy)", function (assert) {
    var oAnnotation1 = {
        "tea_busi.NewType1": {
            "$kind": "EntityType"
        }
    }, oAnnotation2 = {
        "tea_busi.NewType2": {
            "$kind": "EntityType"
        },
        "tea_busi.ExistingType": {
            "$kind": "EntityType"
        }
    }, sMessage = "A schema cannot span more than one document: tea_busi.ExistingType", oError = new Error("/my/annotation.xml: " + sMessage), oMetadata = {
        "tea_busi.ExistingType": {
            "$kind": "EntityType"
        }
    };
    this.oMetaModel.aAnnotationUris = ["n/a", "/my/annotation.xml"];
    this.oMetaModel.bSupportReferences = false;
    this.oMetaModelMock.expects("validate").withExactArgs(this.oMetaModel.sUrl, oMetadata);
    this.oMetaModelMock.expects("validate").withExactArgs("n/a", oAnnotation1);
    this.oMetaModelMock.expects("validate").withExactArgs("/my/annotation.xml", oAnnotation2);
    this.mock(this.oMetaModel.oModel).expects("reportError").withExactArgs(sMessage, sODataMetaModel, sinon.match({
        message: oError.message,
        name: "Error"
    }));
    assert.throws(function () {
        this.oMetaModel._mergeAnnotations(oMetadata, [oAnnotation1, oAnnotation2]);
    }, oError);
});
QUnit.test("_mergeAnnotations - a schema cannot span more than one document", function (assert) {
    var oAnnotation = {
        "$Version": "4.0",
        "tea_busi.": {
            "$kind": "Schema"
        }
    }, sMessage = "A schema cannot span more than one document: tea_busi.", oError = new Error("/my/annotation.xml: " + sMessage), oMetadata = {
        "$Version": "4.0",
        "tea_busi.": {
            "$kind": "Schema"
        }
    };
    this.oMetaModel.aAnnotationUris = ["n/a", "/my/annotation.xml"];
    this.mock(this.oMetaModel.oModel).expects("reportError").withExactArgs(sMessage, sODataMetaModel, sinon.match({
        message: oError.message,
        name: "Error"
    }));
    assert.throws(function () {
        this.oMetaModel._mergeAnnotations(oMetadata, [{ "$Version": "4.0" }, oAnnotation]);
    }, new Error("/my/annotation.xml: " + sMessage));
});
QUnit.test("getAbsoluteServiceUrl", function (assert) {
    var oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetaModel = oModel.getMetaModel();
    assert.strictEqual(oMetaModel.getAbsoluteServiceUrl("../ValueListService/$metadata"), "/Foo/ValueListService/");
    assert.strictEqual(oMetaModel.getAbsoluteServiceUrl("/Foo/ValueListService/$metadata"), "/Foo/ValueListService/");
    assert.strictEqual(oMetaModel.getAbsoluteServiceUrl("$metadata"), "/Foo/DataService/");
    assert.strictEqual(oMetaModel.getAbsoluteServiceUrl("$metadata?sap-context-token=XYZ&sap-client=123&sap-language=ABC"), "/Foo/DataService/?sap-context-token=XYZ&sap-client=123&sap-language=ABC");
});
QUnit.test("getAbsoluteServiceUrl: relative data service URL", function (assert) {
    var sRelativePath = "../../../DataService/", sAbsolutePath = new URI(sRelativePath).absoluteTo(document.baseURI).pathname().toString(), oModel = new ODataModel({
        serviceUrl: sRelativePath,
        synchronizationMode: "None"
    });
    assert.strictEqual(oModel.getMetaModel().getAbsoluteServiceUrl("../ValueListService/$metadata"), new URI("../ValueListService/").absoluteTo(sAbsolutePath).toString());
});
[true, false].forEach(function (bAutoExpandSelect) {
    QUnit.test("getOrCreateSharedModel, bAutoExpandSelect=" + bAutoExpandSelect, function (assert) {
        var mHeaders = { "Accept-Language": "ab-CD", "X-CSRF-Token": "xyz" }, oMapGetExpectation, oMapSetExpectation, oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oMetaModel = oModel.getMetaModel(), oMetaModelMock = this.mock(oMetaModel), oSharedModel;
        oMetaModelMock.expects("getAbsoluteServiceUrl").withExactArgs("../ValueListService/$metadata").returns("/Foo/ValueListService/");
        oMetaModelMock.expects("getAbsoluteServiceUrl").withExactArgs("/Foo/ValueListService/$metadata").returns("/Foo/ValueListService/");
        oMapGetExpectation = this.mock(Map.prototype).expects("get").twice().withExactArgs(bAutoExpandSelect + "/Foo/ValueListService/").callThrough();
        this.mock(oModel).expects("getHttpHeaders").withExactArgs().returns(mHeaders);
        oMapSetExpectation = this.mock(Map.prototype).expects("set").withArgs(bAutoExpandSelect + "/Foo/ValueListService/").callThrough();
        oSharedModel = oMetaModel.getOrCreateSharedModel("../ValueListService/$metadata", undefined, bAutoExpandSelect);
        assert.ok(oSharedModel instanceof ODataModel);
        assert.deepEqual(oSharedModel.mHeaders, mHeaders);
        assert.strictEqual(oSharedModel.sServiceUrl, "/Foo/ValueListService/");
        assert.strictEqual(oSharedModel.bSharedRequests, true);
        assert.strictEqual(oSharedModel.sOperationMode, OperationMode.Server);
        assert.strictEqual(oSharedModel.getGroupId(), "$auto");
        assert.strictEqual(oSharedModel.bAutoExpandSelect, !!bAutoExpandSelect);
        assert.strictEqual(oMetaModel.getOrCreateSharedModel("/Foo/ValueListService/$metadata", undefined, bAutoExpandSelect), oSharedModel);
        assert.ok(oMapGetExpectation.alwaysCalledOn(oMapSetExpectation.thisValues[0]));
    });
});
QUnit.test("getOrCreateSharedModel, undefined and false are the same in cache", function (assert) {
    var oModel = new ODataModel({
        serviceUrl: "/Foo1/DataService/",
        synchronizationMode: "None"
    }), oMetaModel = oModel.getMetaModel(), oMetaModelMock = this.mock(oMetaModel), oSharedModel;
    oModel.oRequestor.mHeaders["X-CSRF-Token"] = "xyz";
    oMetaModelMock.expects("getAbsoluteServiceUrl").twice().withExactArgs("../ValueListService/$metadata").returns("/Foo1/ValueListService/");
    this.mock(Map.prototype).expects("get").twice().withExactArgs(false + "/Foo1/ValueListService/").callThrough();
    this.mock(Map.prototype).expects("set").withArgs(false + "/Foo1/ValueListService/").callThrough();
    oSharedModel = oMetaModel.getOrCreateSharedModel("../ValueListService/$metadata", undefined, undefined);
    assert.strictEqual(oMetaModel.getOrCreateSharedModel("../ValueListService/$metadata", undefined, false), oSharedModel);
});
["$auto", "$direct"].forEach(function (sGroupId) {
    var sTitle = "getOrCreateSharedModel: relative data service URL: " + sGroupId;
    QUnit.test(sTitle, function (assert) {
        var sAbsolutePath = "/" + uid() + "/", oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oSharedModel;
        this.mock(oModel.getMetaModel()).expects("getAbsoluteServiceUrl").withExactArgs("../ValueListService/$metadata").returns(sAbsolutePath);
        oSharedModel = oModel.getMetaModel().getOrCreateSharedModel("../ValueListService/$metadata", sGroupId);
        assert.strictEqual(oSharedModel.sServiceUrl, sAbsolutePath);
        assert.strictEqual(oSharedModel.getGroupId(), sGroupId);
    });
});
QUnit.test("fetchValueListType: unknown property", function (assert) {
    var oContext = {}, sPath = "/Products('HT-1000')/Foo";
    this.oMetaModelMock.expects("getMetaContext").withExactArgs(sPath).returns(oContext);
    this.oMetaModelMock.expects("fetchObject").withExactArgs(undefined, sinon.match.same(oContext)).resolves();
    return this.oMetaModel.fetchValueListType(sPath).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.ok(oError.message, "No metadata for " + sPath);
    });
});
[{
        mAnnotations: {
            "@some.other.Annotation": true
        },
        sValueListType: ValueListType.None
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueListReferences": [],
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": true
        },
        sValueListType: ValueListType.Fixed
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueList": {},
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": true
        },
        sValueListType: ValueListType.Fixed
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueListMapping": {},
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": true
        },
        sValueListType: ValueListType.Fixed
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueListReferences": []
        },
        sValueListType: ValueListType.Standard
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueListReferences#foo": [],
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": false
        },
        sValueListType: ValueListType.Standard
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueList#foo": {},
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": false
        },
        sValueListType: ValueListType.Standard
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueListMapping#foo": {},
            "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": false
        },
        sValueListType: ValueListType.Standard
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueList#foo": {
                "SearchSupported": false
            }
        },
        sValueListType: ValueListType.Fixed
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueList#foo": {
                "SearchSupported": true
            }
        },
        sValueListType: ValueListType.Standard
    }, {
        mAnnotations: {
            "@com.sap.vocabularies.Common.v1.ValueList#foo": {}
        },
        sValueListType: ValueListType.Standard
    }].forEach(function (oFixture) {
    QUnit.test("fetchValueListType: " + JSON.stringify(oFixture.mAnnotations), function (assert) {
        var oContext = {}, sPropertyPath = "/ProductList('HT-1000')/Status";
        this.oMetaModelMock.expects("getMetaContext").withExactArgs(sPropertyPath).returns(oContext);
        this.oMetaModelMock.expects("fetchObject").withExactArgs(undefined, sinon.match.same(oContext)).returns(SyncPromise.resolve({}));
        this.oMetaModelMock.expects("getObject").withExactArgs("@", sinon.match.same(oContext)).returns(oFixture.mAnnotations);
        this.oMetaModel.fetchValueListType(sPropertyPath).then(function (sValueListType) {
            assert.strictEqual(sValueListType, oFixture.sValueListType);
        });
    });
});
QUnit.test("getValueListType, requestValueListType", function (assert) {
    return checkGetAndRequest(this, assert, "fetchValueListType", ["sPath"], true);
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    QUnit.test("fetchValueListMappings: " + sValueList + ", property", function (assert) {
        var oAnnotations = {}, oDefaultMapping = { CollectionPath: "default" }, oFooMapping = { CollectionPath: "foo" }, oProperty = {}, oValueListMetadata = {
            "$Annotations": {
                "zui5_epm_sample.Product/Category": oAnnotations,
                "some.other.Target": {}
            }
        }, oValueListModel = {
            getMetaModel: function () {
                return {
                    fetchEntityContainer: function () {
                        return Promise.resolve(oValueListMetadata);
                    }
                };
            }
        };
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList] = oDefaultMapping;
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = oFooMapping;
        this.oMetaModelMock.expects("getObject").withExactArgs("/zui5_epm_sample.Product/Category").returns(oProperty);
        return this.oMetaModel.fetchValueListMappings(oValueListModel, "zui5_epm_sample.Product", oProperty).then(function (oValueListMappings) {
            assert.deepEqual(oValueListMappings, {
                "": oDefaultMapping,
                "foo": oFooMapping
            });
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    [false, true].forEach(function (b401) {
        var sTitle = "fetchValueListMappings: " + sValueList + ", parameter, 4.01=" + b401;
        QUnit.test(sTitle, function (assert) {
            var oAnnotations = {}, oDefaultMapping = { CollectionPath: "default" }, oFooMapping = { CollectionPath: "foo" }, sTarget = b401 ? "name.space.Action()/Category" : "name.space.Action/Category", oValueListMetadata = {
                "$Annotations": {
                    "name.space.Action(name.space.DoNotUse)/Category": {},
                    "some.other.Target": {}
                }
            }, oValueListModel = {
                getMetaModel: function () {
                    return {
                        fetchEntityContainer: function () {
                            return Promise.resolve(oValueListMetadata);
                        }
                    };
                }
            };
            oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList] = oDefaultMapping;
            oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = oFooMapping;
            oValueListMetadata.$Annotations[sTarget] = oAnnotations;
            this.oMetaModelMock.expects("getObject").never();
            return this.oMetaModel.fetchValueListMappings(oValueListModel, "name.space.Action", { $Name: "Category" }, [{}]).then(function (oValueListMappings) {
                assert.deepEqual(oValueListMappings, {
                    "": oDefaultMapping,
                    "foo": oFooMapping
                });
            });
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    [{
            sIndividualOverloadTarget: "name.space.Action()/Category",
            oOverload: {}
        }, {
            sIndividualOverloadTarget: "name.space.Action(name.space.Entity)/Category",
            oOverload: {
                $IsBound: true,
                $Parameter: [{
                        $Type: "name.space.Entity"
                    }]
            }
        }, {
            sIndividualOverloadTarget: "name.space.Action(Collection(name.space.Entity))/Category",
            oOverload: {
                $IsBound: true,
                $Parameter: [{
                        $isCollection: true,
                        $Type: "name.space.Entity"
                    }]
            }
        }].forEach(function (oFixture) {
        var sTitle = "fetchValueListMappings: " + sValueList + ", 4.0 and 4.01, " + oFixture.sIndividualOverloadTarget;
        QUnit.test(sTitle, function (assert) {
            var oAnnotations4 = {}, oAnnotations401 = {}, oBarMapping = { CollectionPath: "bar" }, oDefaultMapping = { CollectionPath: "default" }, oFooMapping = { CollectionPath: "foo" }, oValueListMetadata = {
                "$Annotations": {
                    "name.space.Action/Category": oAnnotations4,
                    "name.space.Action(name.space.DoNotUse)/Category": {},
                    "some.other.Target": {}
                }
            }, sValueListMetadata, oValueListModel = {
                getMetaModel: function () {
                    return {
                        fetchEntityContainer: function () {
                            return Promise.resolve(oValueListMetadata);
                        }
                    };
                }
            };
            oAnnotations4["@com.sap.vocabularies.Common.v1." + sValueList] = { ignore: true };
            oAnnotations4["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = oFooMapping;
            oAnnotations401["@com.sap.vocabularies.Common.v1." + sValueList] = oDefaultMapping;
            oAnnotations401["@com.sap.vocabularies.Common.v1." + sValueList + "#bar"] = oBarMapping;
            oValueListMetadata.$Annotations[oFixture.sIndividualOverloadTarget] = oAnnotations401;
            sValueListMetadata = JSON.stringify(oValueListMetadata);
            this.oMetaModelMock.expects("getObject").never();
            return this.oMetaModel.fetchValueListMappings(oValueListModel, "name.space.Action", { $Name: "Category" }, [oFixture.oOverload]).then(function (oValueListMappings) {
                assert.deepEqual(oValueListMappings, {
                    "": oDefaultMapping,
                    "bar": oBarMapping,
                    "foo": oFooMapping
                });
                assert.strictEqual(JSON.stringify(oValueListMetadata), sValueListMetadata);
            });
        });
    });
});
[[], [{}, {}]].forEach(function (aOverloads) {
    var sTitle = "fetchValueListMappings: not a single overload, but " + aOverloads.length;
    QUnit.test(sTitle, function (assert) {
        var oValueListModel = {
            getMetaModel: function () {
                return {
                    fetchEntityContainer: function () {
                        return Promise.resolve({});
                    }
                };
            }
        };
        this.oMetaModelMock.expects("getObject").never();
        return this.oMetaModel.fetchValueListMappings(oValueListModel, "name.space.Action", { $Name: "Category" }, aOverloads).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, "Expected a single overload, but found " + aOverloads.length);
        });
    });
});
[{
        annotations: {
            "zui5_epm_sample.Product/CurrencyCode/type.cast": true
        },
        error: "Unexpected annotation target 'zui5_epm_sample.Product/CurrencyCode/type.cast' " + "with namespace of data service in /Foo/ValueListService"
    }, {
        annotations: {
            "zui5_epm_sample.Product/Category": {
                "@some.other.Term": true
            }
        },
        error: "Unexpected annotation 'some.other.Term' for target " + "'zui5_epm_sample.Product/Category' with namespace of data service " + "in /Foo/ValueListService"
    }, {
        annotations: {},
        error: "No annotation 'com.sap.vocabularies.Common.v1.ValueList' " + "in /Foo/ValueListService"
    }, {
        annotations: {
            "zui5_epm_sample.Product/Category": {
                "@com.sap.vocabularies.Common.v1.ValueList": {
                    "CollectionRoot": "/bar/$metadata"
                }
            }
        },
        error: "Property 'CollectionRoot' is not allowed in annotation " + "'com.sap.vocabularies.Common.v1.ValueList' for target " + "'zui5_epm_sample.Product/Category' in /Foo/ValueListService"
    }, {
        annotations: {
            "zui5_epm_sample.Product/Category": {
                "@com.sap.vocabularies.Common.v1.ValueList": {
                    "SearchSupported": false
                }
            }
        },
        error: "Property 'SearchSupported' is not allowed in annotation " + "'com.sap.vocabularies.Common.v1.ValueList' for target " + "'zui5_epm_sample.Product/Category' in /Foo/ValueListService"
    }].forEach(function (oFixture) {
    QUnit.test("fetchValueListMappings: " + oFixture.error, function (assert) {
        var oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oMetaModel = oModel.getMetaModel(), oMetaModelMock = this.mock(oMetaModel), oProperty = {}, oValueListMetadata = {
            "$Annotations": oFixture.annotations
        }, oValueListModel = {
            getMetaModel: function () {
                return {
                    fetchEntityContainer: function () {
                        return Promise.resolve(oValueListMetadata);
                    }
                };
            },
            sServiceUrl: "/Foo/ValueListService"
        }, sTarget = Object.keys(oFixture.annotations)[0];
        oMetaModelMock.expects("getObject").atLeast(0).withExactArgs("/" + sTarget).returns(sTarget === "zui5_epm_sample.Product/Category" ? oProperty : undefined);
        return oMetaModel.fetchValueListMappings(oValueListModel, "zui5_epm_sample.Product", oProperty).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, oFixture.error);
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    QUnit.test("fetchValueListMappings: " + sValueList + ", value list model is data model", function (assert) {
        var oAnnotations = {
            "@com.sap.vocabularies.Common.v1.Label": "Country"
        }, oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oMetaModelMock = this.mock(oModel.getMetaModel()), oMapping = {
            "CollectionPath": "VH_CountrySet",
            "Parameters": [{ "p1": "foo" }]
        }, oProperty = {
            "$kind": "Property"
        }, oMetadata = {
            "$EntityContainer": "value_list.Container",
            "value_list.VH_BusinessPartner": {
                "$kind": "Entity",
                "Country": oProperty
            },
            "$Annotations": {
                "value_list.VH_BusinessPartner/Country": oAnnotations,
                "value_list.VH_BusinessPartner/Foo": {}
            }
        };
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList] = oMapping;
        oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
        return oModel.getMetaModel().fetchValueListMappings(oModel, "value_list.VH_BusinessPartner", oProperty).then(function (oValueListMappings) {
            assert.deepEqual(oValueListMappings, {
                "": oMapping
            });
        });
    });
});
[{
        sPropertyPath: "/EMPLOYEES/unknown",
        sExpectedError: "No metadata"
    }, {
        sPropertyPath: "/EMPLOYEES/AGE",
        sExpectedError: "No annotation 'com.sap.vocabularies.Common.v1.ValueListReferences'"
    }].forEach(function (oFixture) {
    QUnit.test("requestValueListInfo: " + oFixture.sExpectedError, function (assert) {
        var oModel = new ODataModel({
            serviceUrl: "/~/",
            synchronizationMode: "None"
        });
        this.mock(oModel.getMetaModel()).expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        return oModel.getMetaModel().requestValueListInfo(oFixture.sPropertyPath).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, oFixture.sExpectedError + " for " + oFixture.sPropertyPath);
        });
    });
});
[false, true].forEach(function (bFixed) {
    [false, true].forEach(function (bError) {
        var bDuplicate = !bFixed && bError, sTitle = "requestValueListInfo: error=" + bError + "; ValueListWithFixedValues=" + bFixed;
        QUnit.test(sTitle, function (assert) {
            var oContext = {
                getBinding: function () { }
            }, sMappingUrl1 = "../ValueListService1/$metadata", sMappingUrl2 = "../ValueListService2/$metadata", sMappingUrlBar = "../ValueListServiceBar/$metadata", oModel = new ODataModel({
                serviceUrl: "/Foo/DataService/",
                synchronizationMode: "None"
            }), oMetaModelMock = this.mock(oModel.getMetaModel()), oProperty = {
                "$kind": "Property"
            }, sPropertyPath = "/ProductList('HT-1000')/Category", aValueListRelevantQualifiers = [], oMetadata = {
                "$EntityContainer": "zui5_epm_sample.Container",
                "zui5_epm_sample.Product": {
                    "$kind": "Entity",
                    "Category": oProperty
                },
                "$Annotations": {
                    "zui5_epm_sample.Product/Category": {
                        "@com.sap.vocabularies.Common.v1.ValueListReferences": [sMappingUrl1, sMappingUrl2],
                        "@com.sap.vocabularies.Common.v1.ValueListReferences#bar": [sMappingUrlBar],
                        "@com.sap.vocabularies.Common.v1.ValueListReferences#bar@an.Annotation": true,
                        "@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers": aValueListRelevantQualifiers,
                        "@some.other.Annotation": true
                    }
                },
                "zui5_epm_sample.Container": {
                    "ProductList": {
                        "$kind": "EntitySet",
                        "$Type": "zui5_epm_sample.Product"
                    }
                }
            }, mValueListByRelevantQualifiers = {
                qualifier: {
                    $model: "~model~",
                    CollectionPath: "/Collection"
                }
            }, oValueListMappings1 = {
                "": { CollectionPath: "" }
            }, oValueListMappings2 = {
                "foo": { CollectionPath: "foo" }
            }, oValueListMappingsBar = {}, oValueListModel1 = { sServiceUrl: sMappingUrl1 }, oValueListModel2 = { sServiceUrl: sMappingUrl2 }, oValueListModelBar = { sServiceUrl: sMappingUrlBar };
            if (bFixed) {
                oMetadata.$Annotations["zui5_epm_sample.Product/Category"]["@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = true;
                if (bError) {
                    delete mValueListByRelevantQualifiers.qualifier;
                }
            }
            oValueListMappingsBar[bDuplicate ? "" : "bar"] = { CollectionPath: "bar" };
            oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
            oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl1, undefined, undefined).returns(oValueListModel1);
            oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel1), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).resolves(oValueListMappings1);
            oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl2, undefined, undefined).returns(oValueListModel2);
            oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel2), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).resolves(oValueListMappings2);
            oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrlBar, undefined, undefined).returns(oValueListModelBar);
            oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModelBar), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).returns(SyncPromise.resolve(oValueListMappingsBar));
            oMetaModelMock.expects("filterValueListRelevantQualifiers").exactly(bDuplicate ? 0 : 1).withExactArgs({
                "": {
                    $model: oValueListModel1,
                    CollectionPath: ""
                },
                "foo": {
                    $model: oValueListModel2,
                    CollectionPath: "foo"
                },
                "bar": {
                    $model: oValueListModelBar,
                    CollectionPath: "bar"
                }
            }, sinon.match.same(aValueListRelevantQualifiers), "/ProductList/Category" + "@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers", sinon.match.same(oContext)).resolves(mValueListByRelevantQualifiers);
            return oModel.getMetaModel().requestValueListInfo(sPropertyPath, undefined, oContext).then(function (oResult) {
                assert.ok(!bError);
                if (bFixed) {
                    assert.deepEqual(oResult, {
                        "": {
                            $model: "~model~",
                            $qualifier: "qualifier",
                            CollectionPath: "/Collection"
                        }
                    });
                }
                else {
                    assert.strictEqual(oResult, mValueListByRelevantQualifiers);
                }
            }, function (oError) {
                assert.ok(bError);
                assert.strictEqual(oError.message, bFixed ? "Annotation 'com.sap.vocabularies.Common.v1.ValueListWithFixedValues'" + " but not exactly one 'com.sap.vocabularies.Common.v1.ValueList'" + " for property " + sPropertyPath : "Annotations 'com.sap.vocabularies.Common.v1.ValueList' with " + "identical qualifier '' for property " + sPropertyPath + " in " + sMappingUrl1 + " and " + sMappingUrlBar);
            });
        });
    });
});
[
    "/ProductList('HT-1000')/name.space.Action/Category",
    "/ProductList('HT-1000')/name.space.Action/$Parameter/Category"
].forEach(function (sPropertyPath) {
    QUnit.test("requestValueListInfo: bound action parameter " + sPropertyPath, function (assert) {
        var sMappingUrl = "../ValueListService/$metadata", oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oMetadata = {
            "$Annotations": {
                "name.space.Action/Category": {
                    "@com.sap.vocabularies.Common.v1.ValueListReferences": [sMappingUrl]
                }
            },
            "$EntityContainer": "zui5_epm_sample.Container",
            "name.space.Action": [{
                    "$kind": "Action",
                    "$IsBound": true,
                    "$Parameter": [{
                            "$Name": "_it",
                            "$Type": "zui5_epm_sample.Product"
                        }, {
                            "$Name": "Category"
                        }],
                    "$ReturnType": {
                        "$Type": "some.other.Type"
                    }
                }],
            "zui5_epm_sample.Product": {
                "$kind": "Entity"
            },
            "zui5_epm_sample.Container": {
                "ProductList": {
                    "$kind": "EntitySet",
                    "$Type": "zui5_epm_sample.Product"
                }
            }
        }, oMetaModelMock = this.mock(oModel.getMetaModel()), oValueListMappings = { "": { CollectionPath: "" } }, oValueListModel = { sServiceUrl: sMappingUrl };
        oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
        oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl, undefined, undefined).returns(oValueListModel);
        oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel), "name.space.Action", sinon.match.same(oMetadata["name.space.Action"][0].$Parameter[1]), oMetadata["name.space.Action"]).resolves(oValueListMappings);
        oMetaModelMock.expects("filterValueListRelevantQualifiers").never();
        return oModel.getMetaModel().requestValueListInfo(sPropertyPath, undefined, {}).then(function (oResult) {
            assert.deepEqual(oResult, {
                "": {
                    $model: oValueListModel,
                    CollectionPath: ""
                }
            });
        });
    });
});
QUnit.skip("requestValueListInfo: action import parameter", function (assert) {
    var sMappingUrl = "../ValueListService/$metadata", oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetadata = {
        "$Annotations": {
            "name.space.Action/Category": {
                "@com.sap.vocabularies.Common.v1.ValueListReferences": [sMappingUrl]
            }
        },
        "$EntityContainer": "zui5_epm_sample.Container",
        "name.space.Action": [{
                "$kind": "Action",
                "$Parameter": [{
                        "$Name": "Category"
                    }],
                "$ReturnType": {
                    "$Type": "some.other.Type"
                }
            }],
        "zui5_epm_sample.Container": {
            "ActionImport": {
                "$kind": "ActionImport",
                "$Action": "name.space.Action"
            }
        }
    }, oMetaModelMock = this.mock(oModel.getMetaModel()), oValueListMappings = { "": { CollectionPath: "" } }, oValueListModel = { sServiceUrl: sMappingUrl };
    oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
    oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl).returns(oValueListModel);
    oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel), "name.space.Action", sinon.match.same(oMetadata["name.space.Action"][0].$Parameter[0]), oMetadata["name.space.Action"]).resolves(oValueListMappings);
    return oModel.getMetaModel().requestValueListInfo("/ActionImport/Category").then(function (oResult) {
        assert.deepEqual(oResult, {
            "": {
                $model: oValueListModel,
                CollectionPath: ""
            }
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    QUnit.test("requestValueListInfo: " + sValueList + ", same model w/o reference", function (assert) {
        var oAnnotations = {}, oContext = {
            getBinding: function () { }
        }, oProperty = {
            "$kind": "Property"
        }, oValueListMappingFoo = { CollectionPath: "foo" }, oMetadata = {
            "$EntityContainer": "value_list.Container",
            "value_list.Container": {
                "$kind": "EntityContainer",
                "VH_BusinessPartnerSet": {
                    "$kind": "EntitySet",
                    "$Type": "value_list.VH_BusinessPartner"
                }
            },
            "value_list.VH_BusinessPartner": {
                "$kind": "Entity",
                "Country": oProperty
            },
            "$Annotations": {
                "value_list.VH_BusinessPartner/Country": oAnnotations
            }
        }, oModel = new ODataModel({
            serviceUrl: "/Foo/ValueListService/",
            synchronizationMode: "None"
        }), oMetaModelMock = this.mock(oModel.getMetaModel()), sPropertyPath = "/VH_BusinessPartnerSet('0100000000')/Country";
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = oValueListMappingFoo;
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#bar"] = { CollectionPath: "bar" };
        oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
        oMetaModelMock.expects("filterValueListRelevantQualifiers").never();
        return oModel.getMetaModel().requestValueListInfo(sPropertyPath, undefined, oContext).then(function (oResult) {
            assert.strictEqual(oResult.foo.$model, oModel);
            assert.strictEqual(oResult.bar.$model, oModel);
            assert.notOk("$model" in oValueListMappingFoo);
            delete oResult.foo.$model;
            delete oResult.bar.$model;
            assert.deepEqual(oResult, {
                "foo": { CollectionPath: "foo" },
                "bar": { CollectionPath: "bar" }
            });
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    [false, true].forEach(function (bDuplicate) {
        var sTitle = "requestValueListInfo: " + sValueList + ", fixed values: duplicate=" + bDuplicate;
        QUnit.test(sTitle, function (assert) {
            var oAnnotations = {
                "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": true
            }, oMetadata = {
                "$EntityContainer": "value_list.Container",
                "value_list.Container": {
                    "$kind": "EntityContainer",
                    "VH_BusinessPartnerSet": {
                        "$kind": "EntitySet",
                        "$Type": "value_list.VH_BusinessPartner"
                    }
                },
                "value_list.VH_BusinessPartner": {
                    "$kind": "Entity",
                    "Country": {}
                },
                "$Annotations": {
                    "value_list.VH_BusinessPartner/Country": oAnnotations
                }
            }, oModel = new ODataModel({
                serviceUrl: "/Foo/ValueListService/",
                synchronizationMode: "None"
            }), sPropertyPath = "/VH_BusinessPartnerSet('42')/Country";
            oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = { CollectionPath: "foo" };
            if (bDuplicate) {
                oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#bar"] = {};
            }
            this.mock(oModel.getMetaModel()).expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
            return oModel.getMetaModel().requestValueListInfo(sPropertyPath).then(function (oResult) {
                assert.notOk(bDuplicate);
                assert.strictEqual(oResult[""].$model, oModel);
                delete oResult[""].$model;
                assert.deepEqual(oResult, {
                    "": {
                        $qualifier: "foo",
                        CollectionPath: "foo"
                    }
                });
            }, function (oError) {
                assert.ok(bDuplicate);
                assert.strictEqual(oError.message, "Annotation " + "'com.sap.vocabularies.Common.v1.ValueListWithFixedValues' but not " + "exactly one 'com.sap.vocabularies.Common.v1.ValueList' for property " + sPropertyPath);
            });
        });
    });
});
QUnit.test("requestValueListInfo: property in cross-service reference", function (assert) {
    var sMappingUrl = "../ValueListService/$metadata", oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetaModelMock = this.mock(oModel.getMetaModel()), oProperty = {
        "$kind": "Property"
    }, oMetadata = {
        "$Version": "4.0",
        "$Reference": {
            "/Foo/EpmSample/$metadata": {
                "$Include": ["zui5_epm_sample."]
            }
        },
        "$EntityContainer": "base.Container",
        "base.Container": {
            "BusinessPartnerList": {
                "$kind": "EntitySet",
                "$Type": "base.BusinessPartner"
            }
        },
        "base.BusinessPartner": {
            "$kind": "EntityType",
            "BP_2_PRODUCT": {
                "$kind": "NavigationProperty",
                "$Type": "zui5_epm_sample.Product"
            }
        }
    }, oMetadataProduct = {
        "$Version": "4.0",
        "zui5_epm_sample.Product": {
            "$kind": "Entity",
            "Category": oProperty
        },
        "zui5_epm_sample.": {
            "$kind": "Schema",
            "$Annotations": {
                "zui5_epm_sample.Product/Category": {
                    "@com.sap.vocabularies.Common.v1.ValueListReferences": [sMappingUrl]
                }
            }
        }
    }, sPropertyPath = "/BusinessPartnerList('0100000000')/BP_2_PRODUCT('HT-1000')/Category", oRequestorMock = this.mock(oModel.oMetaModel.oRequestor), oValueListMappings = {
        "": { CollectionPath: "" }
    }, oValueListModel = { sServiceUrl: sMappingUrl };
    oRequestorMock.expects("read").withExactArgs("/Foo/DataService/$metadata", false, undefined).resolves(oMetadata);
    oRequestorMock.expects("read").withExactArgs("/Foo/EpmSample/$metadata").resolves(oMetadataProduct);
    oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl, undefined, true).returns(oValueListModel);
    oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).resolves(oValueListMappings);
    return oModel.getMetaModel().requestValueListInfo(sPropertyPath, true).then(function (oResult) {
        assert.deepEqual(oResult, {
            "": {
                $model: oValueListModel,
                CollectionPath: ""
            }
        });
    });
});
["ValueList", "ValueListMapping"].forEach(function (sValueList) {
    QUnit.test("requestValueListInfo: " + sValueList + ", same qualifier in reference and local", function (assert) {
        var sMappingUrl = "../ValueListService/$metadata", oAnnotations = {
            "@com.sap.vocabularies.Common.v1.ValueListReferences": [sMappingUrl]
        }, oProperty = {
            "$kind": "Property"
        }, oMetadata = {
            "$EntityContainer": "zui5_epm_sample.Container",
            "zui5_epm_sample.Container": {
                "$kind": "EntityContainer",
                "ProductList": {
                    "$kind": "EntitySet",
                    "$Type": "zui5_epm_sample.Product"
                }
            },
            "zui5_epm_sample.Product": {
                "$kind": "Entity",
                "Category": oProperty
            },
            "$Annotations": {
                "zui5_epm_sample.Product/Category": oAnnotations
            }
        }, oModel = new ODataModel({
            serviceUrl: "/Foo/ValueListService/",
            synchronizationMode: "None"
        }), oMetaModelMock = this.mock(oModel.getMetaModel()), sPropertyPath = "/ProductList('HT-1000')/Category", oValueListModel = {};
        oAnnotations["@com.sap.vocabularies.Common.v1." + sValueList + "#foo"] = {};
        oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
        oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl, undefined, undefined).returns(oValueListModel);
        oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).resolves({ "foo": {} });
        return oModel.getMetaModel().requestValueListInfo(sPropertyPath).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, "Annotations 'com.sap.vocabularies.Common.v1.ValueList' with identical " + "qualifier 'foo' for property " + sPropertyPath + " in " + sMappingUrl + " and " + oModel.sServiceUrl + "$metadata");
        });
    });
});
QUnit.test("requestValueListInfo: ValueList with CollectionRoot in data service", function (assert) {
    var sMappingUrl = "../ValueListService/$metadata", oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetaModelMock = this.mock(oModel.getMetaModel()), oProperty = {
        "$kind": "Property"
    }, sPropertyPath = "/ProductList('HT-1000')/Category", oMetadata = {
        "$EntityContainer": "zui5_epm_sample.Container",
        "zui5_epm_sample.Product": {
            "$kind": "Entity",
            "Category": oProperty
        },
        "$Annotations": {
            "zui5_epm_sample.Product/Category": {
                "@com.sap.vocabularies.Common.v1.ValueList#foo": {
                    "CollectionPath": "VH_CategorySet",
                    "CollectionRoot": sMappingUrl,
                    "SearchSupported": true
                }
            }
        },
        "zui5_epm_sample.Container": {
            "ProductList": {
                "$kind": "EntitySet",
                "$Type": "zui5_epm_sample.Product"
            }
        }
    }, oValueListModel = { "id": "ValueListModel" };
    oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
    oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sMappingUrl, undefined, undefined).returns(oValueListModel);
    return oModel.getMetaModel().requestValueListInfo(sPropertyPath).then(function (oResult) {
        assert.deepEqual(oResult, {
            "foo": {
                $model: oValueListModel,
                CollectionPath: "VH_CategorySet"
            }
        });
        assert.strictEqual(oMetadata.$Annotations["zui5_epm_sample.Product/Category"]["@com.sap.vocabularies.Common.v1.ValueList#foo"].CollectionRoot, sMappingUrl);
    });
});
[false, true].forEach(function (bOverride) {
    QUnit.test("requestValueListInfo: ValueList with CollectionRoot, same qualifier, " + (bOverride ? "override" : "collision"), function (assert) {
        var sCollectionRoot = "", oProperty = {
            "$kind": "Property"
        }, sValueListService = "../ValueListService/$metadata", oMetadata = {
            "$EntityContainer": "zui5_epm_sample.Container",
            "zui5_epm_sample.Product": {
                "$kind": "Entity",
                "Category": oProperty
            },
            "zui5_epm_sample.Container": {
                "ProductList": {
                    "$kind": "EntitySet",
                    "$Type": "zui5_epm_sample.Product"
                }
            },
            "$Annotations": {
                "zui5_epm_sample.Product/Category": {
                    "@com.sap.vocabularies.Common.v1.ValueList#bar": {
                        "CollectionPath": "foo",
                        "CollectionRoot": sCollectionRoot,
                        "Label": "from data service"
                    },
                    "@com.sap.vocabularies.Common.v1.ValueListReferences": [sValueListService],
                    "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": true
                }
            }
        }, oModel = new ODataModel({
            serviceUrl: "/Foo/DataService/",
            synchronizationMode: "None"
        }), oMetaModelMock = this.mock(oModel.getMetaModel()), sPropertyPath = "/ProductList('HT-1000')/Category", oValueListModel = { "id": "ValueListModel" }, oValueListModel2 = bOverride ? oValueListModel : {}, oValueListMapping = {
            "$model": oValueListModel,
            "CollectionPath": "foo",
            "Label": "from value list service"
        };
        oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
        oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sValueListService, undefined, true).returns(oValueListModel);
        oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sCollectionRoot, undefined, true).returns(oValueListModel2);
        oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).resolves({ "bar": oValueListMapping });
        return oModel.getMetaModel().requestValueListInfo(sPropertyPath, true).then(function (oResult) {
            assert.strictEqual(bOverride, true);
            assert.deepEqual(oResult, {
                "": {
                    $model: oValueListModel,
                    $qualifier: "bar",
                    CollectionPath: "foo",
                    Label: "from data service"
                }
            });
        }, function (oError) {
            assert.strictEqual(bOverride, false);
            assert.strictEqual(oError.message, "Annotations 'com.sap.vocabularies.Common.v1.ValueList' with " + "identical qualifier 'bar' for property " + sPropertyPath + " in " + sValueListService + " and /Foo/DataService/$metadata");
        });
    });
});
QUnit.test("requestValueListInfo: two ValueListReferences stay in order", function (assert) {
    var oProperty = {
        "$kind": "Property"
    }, sValueListService1 = "../FirstValueListService/$metadata", sValueListService2 = "../SecondValueListService/$metadata", oMetadata = {
        "$EntityContainer": "zui5_epm_sample.Container",
        "zui5_epm_sample.Product": {
            "$kind": "Entity",
            "Category": oProperty
        },
        "zui5_epm_sample.Container": {
            "ProductList": {
                "$kind": "EntitySet",
                "$Type": "zui5_epm_sample.Product"
            }
        },
        "$Annotations": {
            "zui5_epm_sample.Product/Category": {
                "@com.sap.vocabularies.Common.v1.ValueListReferences": [sValueListService1, sValueListService2]
            }
        }
    }, oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetaModelMock = this.mock(oModel.getMetaModel()), sPropertyPath = "/ProductList('HT-1000')/Category", fnResolve1, fnResolve2, oResultPromise, oValueListModel1 = { "id": "FirstValueListModel" }, oValueListModel2 = { "id": "SecondValueListModel" }, oValueListMapping1 = {
        "$model": oValueListModel1,
        "CollectionPath": "foo",
        "Label": "from first value list service"
    }, oValueListMapping2 = {
        "$model": oValueListModel2,
        "CollectionPath": "bar",
        "Label": "from second value list service"
    };
    oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
    oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sValueListService1, undefined, true).returns(oValueListModel1);
    oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sValueListService2, undefined, true).returns(oValueListModel2);
    oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel1), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).returns(new Promise(function (resolve) { fnResolve1 = resolve; }));
    oMetaModelMock.expects("fetchValueListMappings").withExactArgs(sinon.match.same(oValueListModel2), "zui5_epm_sample.Product", sinon.match.same(oProperty), undefined).returns(new Promise(function (resolve) { fnResolve2 = resolve; }));
    oResultPromise = oModel.getMetaModel().requestValueListInfo(sPropertyPath, true).then(function (oResult) {
        assert.deepEqual(Object.keys(oResult), ["foo", "bar"]);
        assert.deepEqual(oResult, {
            "foo": {
                $model: oValueListModel1,
                CollectionPath: "foo",
                Label: "from first value list service"
            },
            "bar": {
                $model: oValueListModel2,
                CollectionPath: "bar",
                Label: "from second value list service"
            }
        });
    });
    fnResolve2({ "bar": oValueListMapping2 });
    setTimeout(fnResolve1, 0, { "foo": oValueListMapping1 });
    return oResultPromise;
});
QUnit.test("requestValueListInfo: ValueListWithFixedValues and ValueList with SearchSupported", function (assert) {
    var oModel = new ODataModel({
        serviceUrl: "/Foo/DataService/",
        synchronizationMode: "None"
    }), oMetaModelMock = this.mock(oModel.getMetaModel()), oProperty = {
        "$kind": "Property"
    }, oMetadata = {
        "$EntityContainer": "zui5_epm_sample.Container",
        "zui5_epm_sample.Product": {
            "$kind": "Entity",
            "Category": oProperty
        },
        "$Annotations": {
            "zui5_epm_sample.Product/Category": {
                "@com.sap.vocabularies.Common.v1.ValueList#foo": {
                    "CollectionPath": "VH_CategorySet",
                    "SearchSupported": true
                },
                "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues": false
            }
        },
        "zui5_epm_sample.Container": {
            "ProductList": {
                "$kind": "EntitySet",
                "$Type": "zui5_epm_sample.Product"
            }
        }
    }, sPropertyPath = "/ProductList('HT-1000')/Category";
    oMetaModelMock.expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(oMetadata));
    return oModel.getMetaModel().requestValueListInfo(sPropertyPath).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Must not set 'SearchSupported' in annotation " + "'com.sap.vocabularies.Common.v1.ValueList' and annotation " + "'com.sap.vocabularies.Common.v1.ValueListWithFixedValues'");
    });
});
QUnit.test("fetchData", function (assert) {
    var oMetaData = {
        "some.schema.": {
            "$kind": "Schema"
        }
    };
    this.oMetaModelMock.expects("fetchEntityContainer").withExactArgs().resolves(oMetaData);
    return this.oMetaModel.fetchData().then(function (oResult) {
        assert.deepEqual(oResult, oMetaData);
        delete oResult["some.schema."].$kind;
        assert.strictEqual(oMetaData["some.schema."].$kind, "Schema", "original is unchanged");
    });
});
QUnit.test("getData, requestData", function (assert) {
    return checkGetAndRequest(this, assert, "fetchData");
});
[false, true].forEach(function (bEmptyResponse) {
    [false, true].forEach(function (bHasStandardCode) {
        [0, false, true].forEach(function (bHasAlternateKey) {
            var sTitle = "requestCodeList, empty response: " + bEmptyResponse + ", with alternate key: " + bHasAlternateKey + ", with standard code: " + bHasStandardCode;
            QUnit.test(sTitle, function (assert) {
                var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListBinding = {
                    destroy: function () { },
                    requestContexts: function () { }
                }, oCodeListMetaModel = {
                    getObject: function () { },
                    requestObject: function () { }
                }, oCodeListMetaModelMock = this.mock(oCodeListMetaModel), oCodeListModel = {
                    bindList: function () { },
                    getMetaModel: function () { },
                    sServiceUrl: "/foo/bar/default/iwbep/common/0001/"
                }, aData = [], oMapGetExpectation, oMapSetExpectation, aSelect = [
                    bHasAlternateKey ? "ExternalCode" : "UnitCode",
                    "DecimalPlaces",
                    "MyText"
                ], sUrl = "../../../../default/iwbep/common/0001/$metadata", that = this;
                function mock(aData) {
                    return aData.map(function (oData) {
                        var oContext = { getProperty: function () { } }, oContextMock = that.mock(oContext);
                        Object.keys(oData).forEach(function (sKey) {
                            oContextMock.expects("getProperty").withExactArgs(sKey).returns(oData[sKey]);
                        });
                        return oContext;
                    });
                }
                if (!bEmptyResponse) {
                    aData = bHasAlternateKey ? [{
                            DecimalPlaces: 0,
                            ExternalCode: "ONE",
                            MyText: "One"
                        }, {
                            DecimalPlaces: 2,
                            ExternalCode: "%",
                            MyText: "Percentage"
                        }, {
                            DecimalPlaces: 3,
                            ExternalCode: "%O",
                            MyText: "Per mille"
                        }, {
                            DecimalPlaces: null,
                            ExternalCode: "*",
                            MyText: "ignore!"
                        }] : [{
                            DecimalPlaces: 0,
                            UnitCode: "ONE",
                            MyText: "One"
                        }, {
                            DecimalPlaces: 2,
                            UnitCode: "%",
                            MyText: "Percentage"
                        }, {
                            DecimalPlaces: 3,
                            UnitCode: "%O",
                            MyText: "Per mille"
                        }, {
                            DecimalPlaces: null,
                            UnitCode: "*",
                            MyText: "ignore!"
                        }];
                    if (bHasStandardCode) {
                        aData[0].ISOCode = "ENO";
                        aData[1].ISOCode = "P/C";
                        aData[2].ISOCode = "P/M";
                        aData[3].ISOCode = "n/a";
                    }
                }
                if (bHasStandardCode) {
                    aSelect.push("ISOCode");
                }
                this.oMetaModelMock.expects("fetchEntityContainer").twice().returns(SyncPromise.resolve(mScope));
                this.oMetaModelMock.expects("requestObject").twice().withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
                    CollectionPath: "UnitsOfMeasure",
                    Url: sUrl
                });
                this.oMetaModelMock.expects("getAbsoluteServiceUrl").twice().withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
                oMapGetExpectation = this.mock(Map.prototype).expects("get").twice().withExactArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
                oMapSetExpectation = this.mock(Map.prototype).expects("set").withArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
                this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
                this.mock(oCodeListModel).expects("getMetaModel").withExactArgs().returns(oCodeListMetaModel);
                oCodeListMetaModelMock.expects("requestObject").withExactArgs("/UnitsOfMeasure/").resolves({
                    $Key: bHasAlternateKey === 0 ? [{ "MyAlias": "UnitCode" }] : ["UnitCode"]
                });
                oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys").returns(bHasAlternateKey ? [{
                        Key: [{
                                Name: { $PropertyPath: "ExternalCode" }
                            }]
                    }] : undefined);
                oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode" + "@com.sap.vocabularies.Common.v1.UnitSpecificScale/$Path").returns("DecimalPlaces");
                oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode" + "@com.sap.vocabularies.Common.v1.Text/$Path").returns("MyText");
                oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode" + "@com.sap.vocabularies.CodeList.v1.StandardCode/$Path").returns(bHasStandardCode ? "ISOCode" : undefined);
                this.mock(oCodeListModel).expects("bindList").withExactArgs("/UnitsOfMeasure", null, null, null, { $select: aSelect }).returns(oCodeListBinding);
                this.mock(oCodeListBinding).expects("destroy").withExactArgs();
                this.mock(oCodeListBinding).expects("requestContexts").withExactArgs(0, Infinity).resolves(mock(aData));
                this.oLogMock.expects("error").exactly(bEmptyResponse ? 1 : 0).withExactArgs("Customizing empty for ", "/foo/bar/default/iwbep/common/0001/UnitsOfMeasure", sODataMetaModel);
                this.oLogMock.expects("error").exactly(bEmptyResponse ? 0 : 1).withExactArgs("Ignoring customizing w/o unit-specific scale for code *" + " from UnitsOfMeasure", sUrl, sODataMetaModel);
                return Promise.all([
                    this.oMetaModel.requestCodeList("T\u20ACRM", mScope[mScope.$EntityContainer]),
                    this.oMetaModel.requestCodeList("T\u20ACRM")
                ]).then(function (aResults) {
                    var oExpectedCodeList = {};
                    if (!bEmptyResponse) {
                        oExpectedCodeList = bHasStandardCode ? {
                            "ONE": { StandardCode: "ENO", Text: "One", UnitSpecificScale: 0 },
                            "%": { StandardCode: "P/C", Text: "Percentage", UnitSpecificScale: 2 },
                            "%O": { StandardCode: "P/M", Text: "Per mille", UnitSpecificScale: 3 }
                        } : {
                            "ONE": { Text: "One", UnitSpecificScale: 0 },
                            "%": { Text: "Percentage", UnitSpecificScale: 2 },
                            "%O": { Text: "Per mille", UnitSpecificScale: 3 }
                        };
                    }
                    assert.deepEqual(aResults[0], oExpectedCodeList);
                    assert.strictEqual(aResults[1], aResults[0]);
                    assert.ok(oMapGetExpectation.alwaysCalledOn(oMapSetExpectation.thisValues[0]));
                });
            });
        });
    });
});
QUnit.test("requestCodeList, no code list", function (assert) {
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.oMetaModelMock.expects("requestObject").withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves();
    return this.oMetaModel.requestCodeList("T\u20ACRM").then(function (mUnits) {
        assert.strictEqual(mUnits, null);
    });
});
[{
        aAlternateKeys: [{
                Key: [{
                        Name: { $PropertyPath: "ExternalCode" }
                    }]
            }, {}, {}],
        sErrorMessage: "Single alternative expected: " + "/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys"
    }, {
        aAlternateKeys: [],
        sErrorMessage: "Single alternative expected: " + "/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys"
    }, {
        aAlternateKeys: [{
                Key: [{
                        Name: { $PropertyPath: "ExternalCode" }
                    }, {
                        Name: { $PropertyPath: "foo" }
                    }]
            }],
        sErrorMessage: "Single key expected: " + "/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys/0/Key"
    }, {
        aAlternateKeys: [{
                Key: []
            }],
        sErrorMessage: "Single key expected: " + "/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys/0/Key"
    }].forEach(function (oFixture, i) {
    QUnit.test("requestCodeList, alternate key error case #" + i, function (assert) {
        var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListMetaModel = {
            getObject: function () { },
            requestObject: function () { }
        }, oCodeListMetaModelMock = this.mock(oCodeListMetaModel), oCodeListModel = {
            bindList: function () { },
            getMetaModel: function () { }
        }, sUrl = "../../../../default/iwbep/common/0001/$metadata", that = this;
        this.oMetaModelMock.expects("fetchEntityContainer").twice().returns(SyncPromise.resolve(mScope));
        this.oMetaModelMock.expects("requestObject").twice().withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
            CollectionPath: "UnitsOfMeasure",
            Url: sUrl
        });
        this.oMetaModelMock.expects("getAbsoluteServiceUrl").twice().withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
        this.mock(Map.prototype).expects("get").twice().withExactArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
        this.mock(Map.prototype).expects("set").withArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
        this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
        this.mock(oCodeListModel).expects("getMetaModel").withExactArgs().returns(oCodeListMetaModel);
        oCodeListMetaModelMock.expects("requestObject").withExactArgs("/UnitsOfMeasure/").resolves({
            $Key: ["UnitCode"]
        });
        oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys").returns(oFixture.aAlternateKeys);
        return this.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
            assert.ok(false);
        }, function (oError) {
            TestUtils.checkError(assert, oError, Error, oFixture.sErrorMessage);
            return that.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
                assert.ok(false);
            }, function (oError1) {
                assert.strictEqual(oError1, oError);
            });
        });
    });
});
[["UnitCode", "InternalCode"], [], undefined].forEach(function (aKeys) {
    QUnit.test("requestCodeList, not a single key: " + aKeys, function (assert) {
        var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListMetaModel = {
            getObject: function () { },
            requestObject: function () { }
        }, oCodeListMetaModelMock = this.mock(oCodeListMetaModel), oCodeListModel = {
            bindList: function () { },
            getMetaModel: function () { }
        }, sUrl = "../../../../default/iwbep/common/0001/$metadata", that = this;
        this.oMetaModelMock.expects("fetchEntityContainer").twice().returns(SyncPromise.resolve(mScope));
        this.oMetaModelMock.expects("requestObject").twice().withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
            CollectionPath: "UnitsOfMeasure",
            Url: sUrl
        });
        this.oMetaModelMock.expects("getAbsoluteServiceUrl").twice().withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
        this.mock(Map.prototype).expects("get").twice().withExactArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
        this.mock(Map.prototype).expects("set").withArgs(sAbsoluteServiceUrl + "#UnitsOfMeasure").callThrough();
        this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
        this.mock(oCodeListModel).expects("getMetaModel").withExactArgs().returns(oCodeListMetaModel);
        oCodeListMetaModelMock.expects("requestObject").withExactArgs("/UnitsOfMeasure/").resolves({
            $Key: aKeys
        });
        return this.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
            assert.ok(false);
        }, function (oError0) {
            TestUtils.checkError(assert, oError0, Error, "Single key expected: /UnitsOfMeasure/");
            return that.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
                assert.ok(false);
            }, function (oError1) {
                assert.strictEqual(oError1, oError0);
            });
        });
    });
});
QUnit.test("requestCodeList: foreign context", function (assert) {
    var oMetaModel = new ODataMetaModel(this.oMetaModel.oRequestor, "/~/$metadata"), oContext = oMetaModel.createBindingContext("/"), that = this;
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    assert.throws(function () {
        that.oMetaModel.requestCodeList("T\u20ACRM", null, { context: oContext });
    }, new Error("Unsupported context: /"));
});
QUnit.test("requestCodeList: context does not point to raw value", function (assert) {
    var oContext = this.oMetaModel.createBindingContext("/empty.Container"), that = this;
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    assert.throws(function () {
        that.oMetaModel.requestCodeList("T\u20ACRM", null, { context: oContext });
    }, new Error("Unsupported context: /empty.Container"));
});
[null, { $kind: "EntityContainer" }].forEach(function (vRawValue) {
    QUnit.test("requestCodeList: unsupported raw value " + vRawValue, function (assert) {
        var oContext = this.oMetaModel.createBindingContext("/"), that = this;
        this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
        assert.throws(function () {
            that.oMetaModel.requestCodeList("T\u20ACRM", vRawValue, { context: oContext });
        }, new Error("Unsupported raw value: " + vRawValue));
    });
});
QUnit.test("requestCodeList: 1st requestObject fails", function (assert) {
    var oError = new Error("Could not load metadata");
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.oMetaModelMock.expects("requestObject").withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").rejects(oError);
    return this.oMetaModel.requestCodeList("T\u20ACRM", undefined, {}).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestCodeList: 2nd requestObject fails", function (assert) {
    var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListMetaModel = {
        getObject: function () { },
        requestObject: function () { }
    }, oCodeListModel = {
        bindList: function () { },
        getMetaModel: function () { }
    }, oError = new Error("A schema cannot span more than one document: ..."), sUrl = "../../../../default/iwbep/common/0001/$metadata";
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.oMetaModelMock.expects("requestObject").withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
        CollectionPath: "UnitsOfMeasure",
        Url: sUrl
    });
    this.oMetaModelMock.expects("getAbsoluteServiceUrl").withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
    this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
    this.mock(oCodeListModel).expects("getMetaModel").withExactArgs().returns(oCodeListMetaModel);
    this.mock(oCodeListMetaModel).expects("requestObject").withExactArgs("/UnitsOfMeasure/").rejects(oError);
    return this.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestCodeList, change handler fails", function (assert) {
    var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListBinding = {
        destroy: function () { },
        requestContexts: function () { }
    }, oCodeListMetaModel = {
        getObject: function () { },
        requestObject: function () { }
    }, oCodeListMetaModelMock = this.mock(oCodeListMetaModel), oCodeListModel = {
        bindList: function () { },
        getMetaModel: function () { return oCodeListMetaModel; }
    }, oError = new Error("Accessed value is not primitive: ..."), sUrl = "../../../../default/iwbep/common/0001/$metadata";
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.oMetaModelMock.expects("requestObject").withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
        CollectionPath: "UnitsOfMeasure",
        Url: sUrl
    });
    this.oMetaModelMock.expects("getAbsoluteServiceUrl").withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
    this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
    oCodeListMetaModelMock.expects("requestObject").withExactArgs("/UnitsOfMeasure/").resolves({
        $Key: ["UnitCode"]
    });
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys").returns(undefined);
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode@com.sap.vocabularies.Common.v1.UnitSpecificScale/$Path").returns("DecimalPlaces");
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode@com.sap.vocabularies.Common.v1.Text/$Path").returns("MyText");
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode" + "@com.sap.vocabularies.CodeList.v1.StandardCode/$Path").returns(undefined);
    this.mock(oCodeListModel).expects("bindList").withExactArgs("/UnitsOfMeasure", null, null, null, {
        $select: ["UnitCode", "DecimalPlaces", "MyText"]
    }).returns(oCodeListBinding);
    this.mock(oCodeListBinding).expects("destroy").withExactArgs();
    this.mock(oCodeListBinding).expects("requestContexts").withExactArgs(0, Infinity).resolves([{
            getProperty: function () { throw oError; }
        }]);
    return this.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestCodeList, data request fails", function (assert) {
    var sAbsoluteServiceUrl = "/" + uid() + "/", oCodeListBinding = {
        destroy: function () { },
        requestContexts: function () { }
    }, oCodeListMetaModel = {
        getObject: function () { },
        requestObject: function () { }
    }, oCodeListMetaModelMock = this.mock(oCodeListMetaModel), oCodeListModel = {
        bindList: function () { },
        getMetaModel: function () { return oCodeListMetaModel; }
    }, oError = new Error("500 Internal Server Error"), sUrl = "../../../../default/iwbep/common/0001/$metadata";
    this.oMetaModelMock.expects("fetchEntityContainer").returns(SyncPromise.resolve(mScope));
    this.oMetaModelMock.expects("requestObject").withExactArgs("/@com.sap.vocabularies.CodeList.v1.T\u20ACRM").resolves({
        CollectionPath: "UnitsOfMeasure",
        Url: sUrl
    });
    this.oMetaModelMock.expects("getAbsoluteServiceUrl").withExactArgs(sUrl).returns(sAbsoluteServiceUrl);
    this.oMetaModelMock.expects("getOrCreateSharedModel").withExactArgs(sUrl, "$direct").returns(oCodeListModel);
    oCodeListMetaModelMock.expects("requestObject").withExactArgs("/UnitsOfMeasure/").resolves({
        $Key: ["UnitCode"]
    });
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/@Org.OData.Core.V1.AlternateKeys").returns(undefined);
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode@com.sap.vocabularies.Common.v1.UnitSpecificScale/$Path").returns("DecimalPlaces");
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode@com.sap.vocabularies.Common.v1.Text/$Path").returns("MyText");
    oCodeListMetaModelMock.expects("getObject").withExactArgs("/UnitsOfMeasure/UnitCode" + "@com.sap.vocabularies.CodeList.v1.StandardCode/$Path").returns(undefined);
    this.mock(oCodeListModel).expects("bindList").withExactArgs("/UnitsOfMeasure", null, null, null, {
        $select: ["UnitCode", "DecimalPlaces", "MyText"]
    }).returns(oCodeListBinding);
    this.mock(oCodeListBinding).expects("destroy").withExactArgs();
    this.mock(oCodeListBinding).expects("requestContexts").withExactArgs(0, Infinity).rejects(oError);
    return this.oMetaModel.requestCodeList("T\u20ACRM").then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestCurrencyCodes", function (assert) {
    var oDetails = {}, oPromise = {}, vRawValue = {};
    this.oMetaModelMock.expects("requestCodeList").withExactArgs("CurrencyCodes", sinon.match.same(vRawValue), sinon.match.same(oDetails)).returns(oPromise);
    assert.strictEqual(this.oMetaModel.requestCurrencyCodes(vRawValue, oDetails), oPromise);
});
QUnit.test("requestUnitsOfMeasure", function (assert) {
    var oDetails = {}, oPromise = {}, vRawValue = {};
    this.oMetaModelMock.expects("requestCodeList").withExactArgs("UnitsOfMeasure", sinon.match.same(vRawValue), sinon.match.same(oDetails)).returns(oPromise);
    assert.strictEqual(this.oMetaModel.requestUnitsOfMeasure(vRawValue, oDetails), oPromise);
});
QUnit.test("getReducedPath", function (assert) {
    this.oMetaModelMock.expects("getAllPathReductions").withExactArgs("/path", "/base", true, true).returns("/reduced/path");
    assert.strictEqual(this.oMetaModel.getReducedPath("/path", "/base"), "/reduced/path");
});
forEach({
    "/As(1)|AValue": [],
    "/As(1)|#reduce.path.Action": [],
    "/As(1)|AtoB/BValue": [],
    "/As(1)|AtoB/BtoA": ["/As(1)"],
    "/As(1)|AtoB/BtoA/AValue": ["/As(1)/AValue"],
    "/As(1)|AtoC/CtoA/AValue": [],
    "/As(1)|AtoDs(42)/DtoA/AValue": ["/As(1)/AValue"],
    "/As(1)|AtoDs(42)/DtoA/AtoC/CValue": ["/As(1)/AtoC/CValue"],
    "/Ds(1)|DtoA/AtoDs(42)/DValue": [],
    "/As(1)|AtoDs/42/DtoA/AValue": ["/As(1)/AValue"],
    "/Ds(1)|DtoCs/42": [],
    "/Ds(1)|DtoA/AtoDs/42/DValue": [],
    "/As(1)|AtoDs(42)/DtoBs(7)/BtoD/DValue": ["/As(1)/AtoDs(42)/DValue"],
    "/As(1)/AtoB|BtoA/AValue": [],
    "/As(1)|AtoB/BtoC/CtoB/BtoA/AValue": ["/As(1)/AtoB/BtoA/AValue", "/As(1)/AValue"],
    "/As(1)|AtoB/BtoA/AtoDs(11)/DtoA/AValue": ["/As(1)/AtoDs(11)/DtoA/AValue", "/As(1)/AtoB/BtoA/AValue", "/As(1)/AValue"],
    "/As(1)|AtoDs/-2/DtoBs(7)/BtoD/DtoA/AValue": ["/As(1)/AtoDs/-2/DtoA/AValue", "/As(1)/AValue"],
    "/As(1)|AtoB/BtoA/AtoB/BtoA/AValue": ["/As(1)/AtoB/BtoA/AValue", "/As(1)/AValue"],
    "/As(1)|AtoDs(2)/DtoA/AtoDs(2)/DtoA/AValue": ["/As(1)/AtoDs(2)/DtoA/AValue", "/As(1)/AValue"],
    "/As(1)|AtoDs(42)/DtoA/AValue@Common.Label": ["/As(1)/AValue@Common.Label"],
    "/As(1)|AtoDs(42)/DtoA/@Common.Label": ["/As(1)/@Common.Label"],
    "/As(1)|AtoDs(42)/DtoA@Common.Label": [],
    "/As(1)|AtoDs(42)/DtoA/@$ui5._/predicate": ["/As(1)/@$ui5._/predicate"],
    "/As(1)|reduce.path.Action(...)/$Parameter/_it/Value": ["/As(1)/Value"],
    "/Ds(1)|reduce.path.Action(...)/$Parameter/Value/Value": ["/Ds(1)/Value"],
    "/As(1)|reduce.path.Action(...)/$Parameter/_it/AtoB/BtoA/Value": ["/As(1)/AtoB/BtoA/Value", "/As(1)/reduce.path.Action(...)/$Parameter/_it/Value", "/As(1)/Value"],
    "/As(1)|AtoB/BtoA/reduce.path.Action(...)/$Parameter/_it/Value": ["/As(1)/reduce.path.Action(...)/$Parameter/_it/Value", "/As(1)/AtoB/BtoA/Value", "/As(1)/Value"],
    "/As(1)|AtoB/reduce.path.Action(...)/$Parameter/_it/BtoA/Property": ["/As(1)/AtoB/BtoA/Property", "/As(1)/Property"],
    "/Ds(1)|reduce.path.Action(...)/Value/Value": [],
    "/As(1)|reduce.path.Action(...)/$Parameter/foo": [],
    "/FunctionImport(...)|$Parameter/foo": []
}, function (sPath, aReducedPaths, sRootPath) {
    QUnit.test("getAllPathReductions: " + sPath, function (assert) {
        aReducedPaths = [sPath].concat(aReducedPaths);
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
        assert.deepEqual(this.oMetaModel.getAllPathReductions(sPath, sRootPath), aReducedPaths, "collection");
        assert.deepEqual(this.oMetaModel.getAllPathReductions(sPath, sRootPath, true), aReducedPaths.pop(), "single");
    });
});
forEach({
    "/As(1)|AtoB/BtoA/AtoDs(42)/DValue": "/As(1)/AtoDs(42)/DValue",
    "/As(1)|AtoB/BtoA/AtoDs": "/As(1)/AtoDs"
}, function (sPath, sReducedPath, sRootPath) {
    QUnit.test("getAllPathReductions: (collections) " + sPath, function (assert) {
        this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
        assert.deepEqual(this.oMetaModel.getAllPathReductions(sPath, sRootPath, true, true), sPath);
        assert.deepEqual(this.oMetaModel.getAllPathReductions(sPath, sRootPath, true), sReducedPath);
    });
});
QUnit.test("getAllPathReductions: binding parameter is collection", function (assert) {
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
    assert.deepEqual(this.oMetaModel.getAllPathReductions("/Ds(1)/DtoBs/reduce.path.Action/$Parameter/_it/Value", "/Ds(1)", true, true), "/Ds(1)/DtoBs/reduce.path.Action/$Parameter/_it/Value");
});
QUnit.test("getAllPathReductions: !bSingle, bNoReduceBeforeCollection", function (assert) {
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
    assert.deepEqual(this.oMetaModel.getAllPathReductions("/As(1)/AtoB/BtoA/AtoDs(42)/DtoBs(23)/BtoD/DValue", "/As(1)", false, true), [
        "/As(1)/AtoB/BtoA/AtoDs(42)/DtoBs(23)/BtoD/DValue",
        "/As(1)/AtoB/BtoA/AtoDs(42)/DValue"
    ]);
});
QUnit.test("getAllPathReductions: invalid binding parameter", function (assert) {
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
    this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(true);
    this.oLogMock.expects("warning").withExactArgs("Expected a single overload, but found 0", "/As/AtoC/reduce.path.Action/$Parameter/_it", sODataMetaModel);
    assert.deepEqual(this.oMetaModel.getAllPathReductions("/As(1)/AtoC/reduce.path.Action(...)/$Parameter/_it", "/As(1)", true, true), "/As(1)/AtoC/reduce.path.Action(...)/$Parameter/_it");
});
QUnit.test("getAllPathReductions: multiple overloads", function (assert) {
    this.oMetaModelMock.expects("fetchEntityContainer").atLeast(0).returns(SyncPromise.resolve(mReducedPathScope));
    this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sODataMetaModel).returns(true);
    this.oLogMock.expects("warning").withExactArgs("Expected a single overload, but found 2", "/Ds/reduce.path.Function/$Parameter/_it", sODataMetaModel);
    assert.deepEqual(this.oMetaModel.getAllPathReductions("/Ds(1)/reduce.path.Function(...)/$Parameter/_it", "/Ds(1)"), ["/Ds(1)/reduce.path.Function(...)/$Parameter/_it"]);
});
QUnit.test("requestValue4Annotation: no edm:Path", function (assert) {
    var oContext = {
        getModel: function () { return null; }
    }, oMetaContext = {}, vRawValue = {};
    this.oMetaModelMock.expects("createBindingContext").withExactArgs("/meta/path").returns(oMetaContext);
    this.mock(AnnotationHelper).expects("value").withExactArgs(sinon.match.same(vRawValue), { context: sinon.match.same(oMetaContext) }).returns("foo");
    return this.oMetaModel.requestValue4Annotation(vRawValue, "/meta/path", oContext).then(function (sValue) {
        assert.strictEqual(sValue, "foo");
    });
});
QUnit.test("requestValue4Annotation: composite binding", function (assert) {
    var oModel = new Model(), oContext = Context.create(oModel, null, "/Entity(1)"), oBarBinding = new PropertyBinding(oModel, "bar", oContext), oFooBinding = new PropertyBinding(oModel, "foo", oContext), oMetaContext = {}, oModelMock = this.mock(oModel), vRawValue = {};
    oBarBinding.getValue = function () { };
    oBarBinding.requestValue = function () { };
    oFooBinding.getValue = function () { };
    oFooBinding.requestValue = function () { };
    oModel.bindProperty = function () { };
    this.oMetaModelMock.expects("createBindingContext").withExactArgs("/meta/path").returns(oMetaContext);
    this.mock(AnnotationHelper).expects("value").withExactArgs(sinon.match.same(vRawValue), { context: sinon.match.same(oMetaContext) }).returns("{foo} {bar}");
    oModelMock.expects("bindProperty").withExactArgs("foo", sinon.match.same(oContext), undefined).returns(oFooBinding);
    oModelMock.expects("bindProperty").withExactArgs("bar", sinon.match.same(oContext), undefined).returns(oBarBinding);
    this.mock(oFooBinding).expects("getValue").withExactArgs().atLeast(1).returns("foo-value");
    this.mock(oBarBinding).expects("getValue").withExactArgs().atLeast(1).returns("bar-value");
    this.mock(oFooBinding).expects("requestValue").withExactArgs().resolves();
    this.mock(oBarBinding).expects("requestValue").withExactArgs().resolves();
    return this.oMetaModel.requestValue4Annotation(vRawValue, "/meta/path", oContext).then(function (sValue) {
        assert.strictEqual(sValue, "foo-value bar-value");
    });
});
QUnit.test("requestValue4Annotation: async", function (assert) {
    var oModel = new Model(), oContext = Context.create(oModel, null, "/Entity(1)"), oFooBinding = new PropertyBinding(oModel, "foo", oContext), oMetaContext = {}, oModelMock = this.mock(oModel), vRawValue = {}, that = this;
    oFooBinding.getValue = function () { };
    oFooBinding.requestValue = function () { };
    oModel.bindProperty = function () { };
    this.oMetaModelMock.expects("createBindingContext").withExactArgs("/meta/path").returns(oMetaContext);
    this.mock(AnnotationHelper).expects("value").withExactArgs(sinon.match.same(vRawValue), { context: sinon.match.same(oMetaContext) }).returns("{foo}");
    oModelMock.expects("bindProperty").withExactArgs("foo", sinon.match.same(oContext), undefined).returns(oFooBinding);
    this.mock(oFooBinding).expects("requestValue").withExactArgs().callsFake(function () {
        that.mock(oFooBinding).expects("getValue").withExactArgs().returns("foo-value");
        oFooBinding._fireChange();
        return Promise.resolve();
    });
    return this.oMetaModel.requestValue4Annotation(vRawValue, "/meta/path", oContext).then(function (sValue) {
        assert.strictEqual(sValue, "foo-value");
    });
});
QUnit.test("filterValueListRelevantQualifiers", function (assert) {
    var oContext = {
        getModel: function () { return null; }
    }, sMetaPath = "/some/meta/path" + "@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers", aRawRelevantQualifiers = [], mValueListByQualifier = {
        "in": {
            $model: {}
        },
        maybe: {
            $model: {}
        }
    }, sJSON = JSON.stringify(mValueListByQualifier);
    this.oMetaModelMock.expects("requestValue4Annotation").withExactArgs(sinon.match.same(aRawRelevantQualifiers), sMetaPath, sinon.match.same(oContext)).resolves(["in", "N/A"]);
    return this.oMetaModel.filterValueListRelevantQualifiers(mValueListByQualifier, aRawRelevantQualifiers, sMetaPath, oContext).then(function (mFilteredValueListInfo) {
        assert.deepEqual(Object.keys(mFilteredValueListInfo), ["in"]);
        assert.strictEqual(mFilteredValueListInfo.in, mValueListByQualifier.in);
        assert.strictEqual(JSON.stringify(mValueListByQualifier), sJSON);
    });
});
if (TestUtils.isRealOData()) {
    QUnit.test("getValueListType, requestValueListInfo: realOData", function (assert) {
        var oModel = new ODataModel({
            serviceUrl: sSampleServiceUrl,
            synchronizationMode: "None"
        }), oMetaModel = oModel.getMetaModel(), sPropertyPath = "/ProductList('HT-1000')/Category";
        return oMetaModel.requestObject("/ProductList/").then(function () {
            assert.strictEqual(oMetaModel.getValueListType("/com.sap.gateway.default.zui5_epm_sample.v0002.Contact/Sex"), ValueListType.Fixed);
            assert.strictEqual(oMetaModel.getValueListType(sPropertyPath), ValueListType.Standard);
            return oMetaModel.requestValueListInfo(sPropertyPath).then(function (oResult) {
                var oValueListInfo = oResult[""];
                assert.strictEqual(oValueListInfo.CollectionPath, "H_EPM_PD_CATS_SH_Set");
            });
        });
    });
    QUnit.test("requestValueListInfo: same model w/o reference, realOData", function (assert) {
        var oModel = new ODataModel({
            serviceUrl: sSampleServiceUrl,
            synchronizationMode: "None"
        }), oMetaModel = oModel.getMetaModel(), sPropertyPath = "/ProductList/0/CurrencyCode", oValueListMetaModel;
        return oMetaModel.requestObject("/ProductList/").then(function () {
            assert.strictEqual(oMetaModel.getValueListType(sPropertyPath), ValueListType.Standard);
            return oMetaModel.requestValueListInfo(sPropertyPath);
        }).then(function (oValueListInfo) {
            var sPropertyPath2 = "/H_TCURC_SH_Set/1/WAERS";
            oValueListMetaModel = oValueListInfo[""].$model.getMetaModel();
            assert.strictEqual(oValueListMetaModel.getValueListType(sPropertyPath2), ValueListType.Standard);
            assert.strictEqual(oValueListInfo[""].CollectionPath, "H_TCURC_SH_Set");
            return oValueListMetaModel.requestValueListInfo(sPropertyPath2);
        }).then(function (oValueListInfo) {
            assert.strictEqual(oValueListInfo[""].$model.getMetaModel(), oValueListMetaModel);
            assert.strictEqual(oValueListInfo[""].CollectionPath, "TCURC_CT_Set");
        });
    });
}
[{
        mAnnotations: {},
        sExpectedPath: undefined,
        sPathInEntity: "Quantity"
    }, {
        mAnnotations: undefined,
        sExpectedPath: undefined,
        sPathInEntity: "@$ui5.foo"
    }, {
        mAnnotations: {
            "@Org.OData.Measures.V1.Unit": { $Path: "QuantityUnit" }
        },
        sExpectedPath: "QuantityUnit",
        sPathInEntity: "Quantity"
    }, {
        mAnnotations: {
            "@Org.OData.Measures.V1.ISOCurrency": { $Path: "CurrencyCode" }
        },
        sExpectedPath: "CurrencyCode",
        sPathInEntity: "GrossAmount"
    }, {
        mAnnotations: {
            "@Org.OData.Measures.V1.Unit": { $Path: "WeightUnit" }
        },
        sExpectedPath: "WeightUnit",
        sPathInEntity: "ProductInfo/WeightMeasure"
    }].forEach(function (oFixture, i) {
    QUnit.test("getUnitOrCurrencyPath, " + i, function (assert) {
        var oModel = new ODataModel({
            serviceUrl: sSampleServiceUrl,
            synchronizationMode: "None"
        }), oMetaModel = oModel.getMetaModel(), sPropertyPath = "/SalesOrderList('42')/SO_2_SOITEM('10')/" + oFixture.sPathInEntity, oMetaContext = {};
        this.mock(oMetaModel).expects("getMetaContext").withExactArgs(sPropertyPath).returns(oMetaContext);
        this.mock(oMetaModel).expects("getObject").withExactArgs("@", sinon.match.same(oMetaContext)).returns(oFixture.mAnnotations);
        assert.strictEqual(oMetaModel.getUnitOrCurrencyPath(sPropertyPath), oFixture.sExpectedPath);
    });
});