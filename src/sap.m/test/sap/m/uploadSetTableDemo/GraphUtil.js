sap.ui.define([
], function (){
    "use strict";
   var graphUtil = {
     getConnectedComponent: function(sSource,oAdjList,oVisited,aConnectedComponent){
            oVisited[sSource] = true;
            aConnectedComponent.push(sSource);
            oAdjList[sSource].forEach(function(sNeighbour){
                if (!oVisited[sNeighbour]){
                    this.getConnectedComponent(sNeighbour,oAdjList,oVisited,aConnectedComponent);
                }
            }.bind(this));
     },
     generateGraph: function(aEdgeList,aNodes,sAttr){
        var oAdjList = {};
        aNodes.forEach(function(oVal){
            oAdjList[oVal[sAttr]] = [];
        });
        aEdgeList.forEach(function(oVal){
            this.addEdge(oAdjList,oVal.node1,oVal.node2);
        }.bind(this));
        return oAdjList;
     },
     addEdge: function(oAdjList,sNode1,sNode2){
        if (!oAdjList[sNode1] || !oAdjList[sNode2]){
            return;
        }
        oAdjList[sNode1].push(sNode2);
        oAdjList[sNode2].push(sNode1);
     },
     removeConnectedComponent: function(sSource,oAdjList,oVisited){
        oVisited[sSource] = true;
        oAdjList[sSource].forEach(function(sNeighbour){
            if (!oVisited[sNeighbour]){
                this.removeConnectedComponent(sNeighbour,oAdjList,oVisited);
            }
        }.bind(this));
        delete oAdjList[sSource];
     },
     removeConnectedComponentConditional: function(sSource,oAdjList,oVisited,fnComparator){
        oVisited[sSource] = true;
        oAdjList[sSource].forEach(function(sNeighbour){
            if (!oVisited[sNeighbour] && fnComparator(sSource,sNeighbour)){
                this.removeConnectedComponentConditional(sSource,oAdjList,oVisited,fnComparator);
            }
        }.bind(this));
        delete oAdjList[sSource];
    },
    getConditionalNeigbours: function(sSource,oAdjList,oVisited,aConnectedComponent,fnComparator){
        oVisited[sSource] = true;
        aConnectedComponent.push(sSource);
        oAdjList[sSource].forEach(function(sNeighbour){
            if (!oVisited[sNeighbour] && fnComparator(sSource,sNeighbour)){
                this.getConditionalNeigbours(sNeighbour,oAdjList,oVisited,aConnectedComponent,fnComparator);
            }
        }.bind(this));
    }
};
    return graphUtil;

});