sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function(Controller, History, MessageToast, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.MyPRs", {
        
        formatter: {
            statusState: function(sStatus) {
                switch (sStatus) {
                    case "Approved": return "Success";
                    case "Pending": return "Warning";
                    case "Rejected": return "Error";
                    case "In Progress": return "Information";
                    default: return "None";
                }
            },
            
            priorityState: function(sPriority) {
                switch (sPriority) {
                    case "HIGH": return "Error";
                    case "MEDIUM": return "Warning";
                    case "LOW": return "Success";
                    default: return "None";
                }
            }
        },

        onInit: function() {
            // Mock data for purchase requests
            var oModel = new JSONModel({
                purchaseRequests: this._generateMockData(25)
            });
            
            this.getView().setModel(oModel);
            this._oTable = this.byId("prTable");
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("home", {}, true);
            }
        },

        onCreateNew: function() {
            this.getOwnerComponent().getRouter().navTo("createPR");
        },

        onExport: function() {
            MessageToast.show("Export functionality would download Excel file");
            // In real implementation, export to Excel
        },

        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oTable = this.byId("prTable");
            var oBinding = oTable.getBinding("items");
            
            if (sQuery) {
                var aFilters = [
                    new Filter([
                        new Filter("prNumber", FilterOperator.Contains, sQuery),
                        new Filter("description", FilterOperator.Contains, sQuery),
                        new Filter("prType", FilterOperator.Contains, sQuery)
                    ], false)
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        },

        onLiveSearch: function(oEvent) {
            // Optional: Implement live search if needed
        },

        onOpenFilter: function() {
            MessageToast.show("Filter dialog would open here");
            // In real implementation, open filter dialog
        },

        onOpenSort: function() {
            MessageToast.show("Sort dialog would open here");
            // In real implementation, open sort dialog
        },

        onRefresh: function() {
            MessageToast.show("Refreshing data...");
            // In real implementation, refresh from backend
        },

        onSelectionChange: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext();
                var sPRNumber = oContext.getProperty("prNumber");
                MessageToast.show("Selected: " + sPRNumber);
            }
        },

        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var sPRNumber = oContext.getProperty("prNumber");
            
            // Navigate to detail view
            this.getOwnerComponent().getRouter().navTo("prDetail", {
                prNumber: sPRNumber
            });
        },

        onEditPress: function(oEvent) {
            oEvent.stopPropagation();
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            var oContext = oRow.getBindingContext();
            var sPRNumber = oContext.getProperty("prNumber");
            
            MessageToast.show("Editing PR: " + sPRNumber);
            // In real implementation, navigate to edit view
        },

        onDuplicatePress: function(oEvent) {
            oEvent.stopPropagation();
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            var oContext = oRow.getBindingContext();
            var sPRNumber = oContext.getProperty("prNumber");
            
            MessageToast.show("Duplicating PR: " + sPRNumber);
            // In real implementation, duplicate functionality
        },

        onViewAll: function() {
            var oTable = this.byId("prTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter([]);
            MessageToast.show("Showing all requests");
        },

        onUpdateFinished: function(oEvent) {
            var oTable = this.byId("prTable");
            var oTitle = this.byId("tableHeader");
            var iTotalItems = oEvent.getParameter("total");
            
            if (oTitle) {
                oTitle.setText("Purchase Requests (" + iTotalItems + ")");
            }
        },

        _generateMockData: function(iCount) {
            var aStatuses = ["Pending", "Approved", "Rejected", "In Progress"];
            var aPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
            var aTypes = ["GOODS", "SERVICES", "CAPEX", "OPEX"];
            var aDepartments = ["IT", "HR", "Finance", "Marketing", "Operations"];
            
            var aData = [];
            var dToday = new Date();
            
            for (var i = 1; i <= iCount; i++) {
                var iDaysAgo = Math.floor(Math.random() * 30);
                var iDaysFuture = Math.floor(Math.random() * 60) + 1;
                var dCreated = new Date(dToday);
                dCreated.setDate(dCreated.getDate() - iDaysAgo);
                
                var dRequired = new Date(dToday);
                dRequired.setDate(dRequired.getDate() + iDaysFuture);
                
                var fAmount = (Math.random() * 10000 + 100).toFixed(2);
                
                aData.push({
                    prNumber: "PR-2023-" + i.toString().padStart(5, '0'),
                    description: "Purchase request for " + aDepartments[Math.floor(Math.random() * aDepartments.length)] + " department",
                    status: aStatuses[Math.floor(Math.random() * aStatuses.length)],
                    priority: aPriorities[Math.floor(Math.random() * aPriorities.length)],
                    prType: aTypes[Math.floor(Math.random() * aTypes.length)],
                    totalAmount: fAmount,
                    creationDate: dCreated.toISOString().slice(0, 10),
                    requiredDate: dRequired.toISOString().slice(0, 10),
                    department: aDepartments[Math.floor(Math.random() * aDepartments.length)]
                });
            }
            
            return aData;
        }
    });
});