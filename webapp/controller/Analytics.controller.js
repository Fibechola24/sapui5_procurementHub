sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Analytics", {
        
        formatter: {
            statusState: function(sStatus) {
                switch (sStatus) {
                    case "APPROVED": return "Success";
                    case "PENDING": return "Warning";
                    case "REJECTED": return "Error";
                    case "DRAFT": return "None";
                    case "IN_PROGRESS": return "Information";
                    default: return "None";
                }
            }
        },

        onInit: function() {
            // Initialize analytics model with sample data
            var oModel = new JSONModel(this._generateAnalyticsData());
            this.getView().setModel(oModel, "analytics");
            
            // Store chart references for later updates
            this._charts = {};
        },

        _generateAnalyticsData: function() {
            // Generate sample analytics data
            return {
                timePeriod: "THIS_MONTH",
                dateFrom: new Date().toISOString().slice(0, 10),
                dateTo: new Date().toISOString().slice(0, 10),
                lastUpdated: new Date().toLocaleString(),
                
                kpis: {
                    totalSpend: {
                        value: "124,850",
                        unit: "USD",
                        trend: "+8.5% vs last month",
                        trendState: "Success"
                    },
                    avgProcessingTime: {
                        value: "3.2",
                        unit: "days",
                        trend: "-0.5 days",
                        trendState: "Success"
                    },
                    approvalRate: {
                        value: "92.5",
                        unit: "%",
                        trend: "+2.3%",
                        trendState: "Success"
                    },
                    costSavings: {
                        value: "18,450",
                        unit: "USD",
                        trend: "+12.1%",
                        trendState: "Success"
                    }
                },
                
                monthlySpend: this._generateMonthlySpendData(),
                departmentSpend: this._generateDepartmentSpendData(),
                prStatus: this._generatePRStatusData(),
                topSuppliers: this._generateTopSuppliersData(),
                transactions: this._generateTransactionData(),
                
                processNodes: [
                    {
                        id: "node1",
                        lane: "lane1",
                        title: "PR Created",
                        abbr: "CR",
                        state: "Positive",
                        stateText: "Completed"
                    },
                    {
                        id: "node2", 
                        lane: "lane1",
                        title: "Manager Review",
                        abbr: "MR",
                        state: "Positive",
                        stateText: "Completed"
                    },
                    {
                        id: "node3",
                        lane: "lane1", 
                        title: "Finance Approval",
                        abbr: "FA",
                        state: "Positive",
                        stateText: "Completed"
                    },
                    {
                        id: "node4",
                        lane: "lane1",
                        title: "PO Generation", 
                        abbr: "PO",
                        state: "Planned",
                        stateText: "Next Step"
                    }
                ],
                
                processLanes: [
                    {
                        id: "lane1",
                        icon: "sap-icon://business-objects-experience",
                        text: "Standard Procurement Process",
                        position: 1
                    }
                ]
            };
        },

        _generateMonthlySpendData: function() {
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var data = [];
            
            for (var i = 0; i < 6; i++) {
                data.push({
                    month: months[i],
                    amount: Math.floor(Math.random() * 50000) + 20000
                });
            }
            
            return data;
        },

        _generateDepartmentSpendData: function() {
            var departments = ["IT", "Marketing", "HR", "Finance", "Operations", "Sales", "R&D"];
            var data = [];
            
            departments.forEach(dept => {
                data.push({
                    department: dept,
                    amount: Math.floor(Math.random() * 40000) + 10000
                });
            });
            
            return data;
        },

        _generatePRStatusData: function() {
            return [
                { status: "Approved", count: 142 },
                { status: "Pending", count: 23 },
                { status: "Rejected", count: 8 },
                { status: "Draft", count: 15 },
                { status: "In Progress", count: 42 }
            ];
        },

        _generateTopSuppliersData: function() {
            var suppliers = ["Tech Supplies Inc.", "Office Solutions Co.", "Global Electronics", "Supply Chain Partners", "Innovative Materials"];
            var data = [];
            
            suppliers.forEach(supplier => {
                data.push({
                    supplier: supplier,
                    amount: Math.floor(Math.random() * 50000) + 20000
                });
            });
            
            return data;
        },

        _generateTransactionData: function() {
            var data = [];
            var statuses = ["APPROVED", "PENDING", "REJECTED", "IN_PROGRESS"];
            var departments = ["IT", "Marketing", "HR", "Finance", "Operations"];
            var suppliers = ["Tech Supplies Inc.", "Office Solutions Co.", "Global Electronics"];
            
            for (var i = 1; i <= 20; i++) {
                var status = statuses[Math.floor(Math.random() * statuses.length)];
                var date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30));
                
                data.push({
                    prNumber: "PR-2023-" + (1000 + i),
                    date: date.toISOString().slice(0, 10),
                    department: departments[Math.floor(Math.random() * departments.length)],
                    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
                    amount: (Math.random() * 10000 + 1000).toFixed(2),
                    status: status,
                    processingTime: (Math.random() * 7 + 1).toFixed(1) + " days"
                });
            }
            
            return data;
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

        onRefresh: function() {
            MessageToast.show("Refreshing analytics data...");
            
            // Simulate data refresh
            var oModel = this.getView().getModel("analytics");
            var currentData = oModel.getData();
            currentData.lastUpdated = new Date().toLocaleString();
            oModel.setData(currentData);
            
            MessageToast.show("Data refreshed successfully");
        },

        onExport: function() {
            MessageBox.information("This would export the current analytics view as PDF/Excel");
        },

        onOpenFilter: function() {
            MessageBox.information("Advanced filter dialog would open here");
        },

        onTimePeriodChange: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Time period changed to: " + sSelectedKey);
            
            // In real implementation, fetch data for selected period
        },

        onApplyFilter: function() {
            var oModel = this.getView().getModel("analytics");
            var sPeriod = oModel.getProperty("/timePeriod");
            
            if (sPeriod === "CUSTOM") {
                var sFrom = oModel.getProperty("/dateFrom");
                var sTo = oModel.getProperty("/dateTo");
                
                if (!sFrom || !sTo) {
                    MessageBox.error("Please select both from and to dates");
                    return;
                }
                
                MessageToast.show("Applying custom filter: " + sFrom + " to " + sTo);
            } else {
                MessageToast.show("Applying period filter: " + sPeriod);
            }
            
            // Simulate data refresh with filter
            this.onRefresh();
        },

        onSearchTransactions: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                MessageToast.show("Searching for: " + sQuery);
                // In real implementation, filter the transactions table
            }
        },

        onExportFullReport: function() {
            MessageBox.confirm("Export full analytics report including all charts and data?", {
                title: "Export Report",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageBox.success("Report exported successfully. Download will start shortly.");
                        // In real implementation, generate and download report
                    }
                }
            });
        },

        onAfterRendering: function() {
            // Initialize charts if needed
            this._initializeCharts();
        },

        _initializeCharts: function() {
            // Store references to chart controls for programmatic updates
            var oView = this.getView();
            this._charts = {
                monthlySpend: oView.byId("monthlySpendChart"),
                departmentSpend: oView.byId("departmentSpendChart"),
                prStatus: oView.byId("prStatusChart"),
                topSuppliers: oView.byId("topSuppliersChart"),
                processFlow: oView.byId("processFlow")
            };
        },

        onExit: function() {
            // Clean up chart references
            this._charts = null;
        }
    });
});