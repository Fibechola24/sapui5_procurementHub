sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";

    var PurchaseRequestService = {
        // Storage key for localStorage
        _storageKey: "procurementHubPurchaseRequests",
        
        // Initialize the purchase requests model
        initModel: function() {
            // Try to load saved PRs from localStorage
            var savedPRs = this._loadFromStorage();
            
            // If no saved PRs, create initial mock data
            if (!savedPRs || savedPRs.length === 0) {
                savedPRs = this._generateMockData(15);
            }
            
            // Create the model
            var oModel = new JSONModel({
                purchaseRequests: savedPRs,
                nextPRNumber: this._getNextPRNumber(savedPRs)
            });
            
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        },
        
        // Load PRs from localStorage
        _loadFromStorage: function() {
            try {
                var savedData = localStorage.getItem(this._storageKey);
                if (savedData) {
                    return JSON.parse(savedData);
                }
            } catch (error) {
                console.error("Error loading PRs from storage:", error);
            }
            return [];
        },
        
        // Save PRs to localStorage
        saveToStorage: function(purchaseRequests) {
            try {
                localStorage.setItem(this._storageKey, JSON.stringify(purchaseRequests));
                return true;
            } catch (error) {
                console.error("Error saving PRs:", error);
                return false;
            }
        },
        
        // Add a new purchase request
        addPurchaseRequest: function(model, prData) {
            if (!model || !prData) return null;
            
            // Get current PRs
            var aPRs = model.getProperty("/purchaseRequests");
            
            // Generate PR number
            var nextPRNumber = model.getProperty("/nextPRNumber");
            var prNumber = "PR-" + new Date().getFullYear() + "-" + nextPRNumber.toString().padStart(5, '0');
            
            // Create complete PR object
            var newPR = {
                id: Date.now().toString(), // Unique ID
                prNumber: prNumber,
                prType: prData.requestType || "GOODS",
                description: prData.justification || "New Purchase Request",
                status: "DRAFT",
                priority: prData.priority || "MEDIUM",
                totalAmount: prData.totalAmount || 0,
                creationDate: new Date().toISOString().slice(0, 10),
                requiredDate: prData.requiredDate || new Date().toISOString().slice(0, 10),
                department: prData.department || "",
                costCenter: prData.costCenter || "",
                items: prData.items || [],
                attachments: prData.attachments || [],
                createdBy: prData.createdBy || "Current User",
                lastUpdated: new Date().toISOString(),
                workflowStatus: "Submitted",
                approver: "",
                approvalDate: "",
                comments: ""
            };
            
            // Add to array
            aPRs.unshift(newPR); // Add to beginning for newest first
            
            // Update model
            model.setProperty("/purchaseRequests", aPRs);
            model.setProperty("/nextPRNumber", nextPRNumber + 1);
            
            // Save to localStorage
            this.saveToStorage(aPRs);
            
            return newPR;
        },
        
        // Update a purchase request
        updatePurchaseRequest: function(model, prId, updatedData) {
            if (!model || !prId) return false;
            
            var aPRs = model.getProperty("/purchaseRequests");
            var prIndex = aPRs.findIndex(pr => pr.id === prId);
            
            if (prIndex !== -1) {
                // Merge updates
                aPRs[prIndex] = Object.assign({}, aPRs[prIndex], updatedData, {
                    lastUpdated: new Date().toISOString()
                });
                
                model.setProperty("/purchaseRequests", aPRs);
                this.saveToStorage(aPRs);
                return true;
            }
            
            return false;
        },
        
        // Delete a purchase request
        deletePurchaseRequest: function(model, prId) {
            if (!model || !prId) return false;
            
            var aPRs = model.getProperty("/purchaseRequests");
            var filteredPRs = aPRs.filter(pr => pr.id !== prId);
            
            if (filteredPRs.length !== aPRs.length) {
                model.setProperty("/purchaseRequests", filteredPRs);
                this.saveToStorage(filteredPRs);
                return true;
            }
            
            return false;
        },
        
        // Get purchase request by ID
        getPurchaseRequest: function(model, prId) {
            if (!model || !prId) return null;
            
            var aPRs = model.getProperty("/purchaseRequests");
            return aPRs.find(pr => pr.id === prId);
        },
        
        // Get purchase request by PR number
        getPurchaseRequestByNumber: function(model, prNumber) {
            if (!model || !prNumber) return null;
            
            var aPRs = model.getProperty("/purchaseRequests");
            return aPRs.find(pr => pr.prNumber === prNumber);
        },
        
        // Get all purchase requests
        getAllPurchaseRequests: function(model) {
            return model ? model.getProperty("/purchaseRequests") : [];
        },
        
        // Filter purchase requests
        filterPurchaseRequests: function(model, filters) {
            var aPRs = this.getAllPurchaseRequests(model);
            
            return aPRs.filter(pr => {
                var matches = true;
                
                if (filters.status && pr.status !== filters.status) matches = false;
                if (filters.priority && pr.priority !== filters.priority) matches = false;
                if (filters.department && pr.department !== filters.department) matches = false;
                if (filters.searchText) {
                    var search = filters.searchText.toLowerCase();
                    if (!pr.prNumber.toLowerCase().includes(search) && 
                        !pr.description.toLowerCase().includes(search)) {
                        matches = false;
                    }
                }
                
                return matches;
            });
        },
        
        // Get next PR number
        _getNextPRNumber: function(purchaseRequests) {
            if (!purchaseRequests || purchaseRequests.length === 0) return 1001;
            
            // Find highest PR number
            var highestNumber = 1000;
            purchaseRequests.forEach(pr => {
                if (pr.prNumber) {
                    var match = pr.prNumber.match(/PR-\d+-(\d+)/);
                    if (match && match[1]) {
                        var num = parseInt(match[1]);
                        if (num > highestNumber) highestNumber = num;
                    }
                }
            });
            
            return highestNumber + 1;
        },
        
        // Generate mock data
        _generateMockData: function(count) {
            var aStatuses = ["DRAFT", "SUBMITTED", "PENDING", "APPROVED", "REJECTED", "IN_PROGRESS"];
            var aPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
            var aTypes = ["GOODS", "SERVICES", "CAPEX", "OPEX"];
            var aDepartments = ["IT", "HR", "Finance", "Marketing", "Operations", "Procurement"];
            
            var aData = [];
            var dToday = new Date();
            
            for (var i = 1; i <= count; i++) {
                var iDaysAgo = Math.floor(Math.random() * 30);
                var iDaysFuture = Math.floor(Math.random() * 60) + 1;
                var dCreated = new Date(dToday);
                dCreated.setDate(dCreated.getDate() - iDaysAgo);
                
                var dRequired = new Date(dToday);
                dRequired.setDate(dRequired.getDate() + iDaysFuture);
                
                var fAmount = (Math.random() * 10000 + 100).toFixed(2);
                var prNumber = "PR-" + dToday.getFullYear() + "-" + (1000 + i).toString();
                var status = aStatuses[Math.floor(Math.random() * aStatuses.length)];
                
                aData.push({
                    id: "pr_" + Date.now() + "_" + i,
                    prNumber: prNumber,
                    prType: aTypes[Math.floor(Math.random() * aTypes.length)],
                    description: "Purchase request for " + aDepartments[Math.floor(Math.random() * aDepartments.length)] + " department",
                    status: status,
                    statusText: this._getStatusText(status),
                    priority: aPriorities[Math.floor(Math.random() * aPriorities.length)],
                    totalAmount: fAmount,
                    creationDate: dCreated.toISOString().slice(0, 10),
                    requiredDate: dRequired.toISOString().slice(0, 10),
                    department: aDepartments[Math.floor(Math.random() * aDepartments.length)],
                    costCenter: "CC-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    createdBy: "User " + (Math.floor(Math.random() * 5) + 1),
                    lastUpdated: dCreated.toISOString(),
                    workflowStatus: this._getWorkflowStatus(status),
                    approver: Math.random() > 0.5 ? "Manager " + (Math.floor(Math.random() * 3) + 1) : "",
                    approvalDate: Math.random() > 0.7 ? dCreated.toISOString().slice(0, 10) : "",
                    comments: Math.random() > 0.8 ? "Additional details required" : ""
                });
            }
            
            return aData;
        },
        
        _getStatusText: function(status) {
            var statusMap = {
                "DRAFT": "Draft",
                "SUBMITTED": "Submitted",
                "PENDING": "Pending Approval",
                "APPROVED": "Approved",
                "REJECTED": "Rejected",
                "IN_PROGRESS": "In Progress"
            };
            return statusMap[status] || status;
        },
        
        _getWorkflowStatus: function(status) {
            var workflowMap = {
                "DRAFT": "Created",
                "SUBMITTED": "Submitted for Approval",
                "PENDING": "Awaiting Approval",
                "APPROVED": "Approved",
                "REJECTED": "Rejected",
                "IN_PROGRESS": "Processing"
            };
            return workflowMap[status] || status;
        }
    };

    return PurchaseRequestService;
});