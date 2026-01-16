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
                id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9),
                prNumber: prNumber,
                prType: prData.requestType || "GOODS",
                description: prData.justification || "New Purchase Request",
                status: "SUBMITTED", // Default status when submitted
                statusText: "Submitted for Approval",
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
                workflowStatus: "Submitted for Manager Approval",
                workflowStep: "Manager Review",
                approver: "",
                approvalDate: "",
                approvalComment: "",
                rejectionDate: "",
                rejectionComment: "",
                canApprove: true,
                dueDate: this._calculateDueDate(prData.priority),
                dueStatus: this._calculateDueStatus(new Date(), this._calculateDueDate(prData.priority)),
                daysLeft: this._calculateDaysLeft(new Date(), this._calculateDueDate(prData.priority)),
                requestor: prData.createdBy || "Current User",
                requestorTitle: "Requester",
                attachmentsCount: prData.attachments ? prData.attachments.length : 0,
                totalItems: prData.items ? prData.items.length : 0
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
                
                // Update calculated fields if dueDate changed
                if (updatedData.dueDate) {
                    aPRs[prIndex].dueStatus = this._calculateDueStatus(new Date(), updatedData.dueDate);
                    aPRs[prIndex].daysLeft = this._calculateDaysLeft(new Date(), updatedData.dueDate);
                }
                
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
        
        // ========== APPROVAL METHODS ==========
        
        // Get pending approvals for a user
        getPendingApprovals: function(model, userId) {
            var allPRs = this.getAllPurchaseRequests(model);
            
            // Filter for PRs with status "SUBMITTED" or "PENDING"
            return allPRs.filter(pr => 
                (pr.status === "SUBMITTED" || pr.status === "PENDING") &&
                pr.canApprove !== false
            ).map(pr => {
                // Enhance with approval-specific data
                return Object.assign({}, pr, {
                    dueDate: pr.dueDate || this._calculateDueDate(pr.priority),
                    dueStatus: pr.dueStatus || this._calculateDueStatus(new Date(pr.creationDate), pr.dueDate || this._calculateDueDate(pr.priority)),
                    daysLeft: pr.daysLeft || this._calculateDaysLeft(new Date(), pr.dueDate || this._calculateDueDate(pr.priority)),
                    attachments: pr.attachmentsCount || 0,
                    workflowStep: pr.workflowStep || "Manager Approval"
                });
            });
        },
        
        // Get urgent approvals (HIGH or URGENT priority)
        getUrgentApprovals: function(model) {
            var pending = this.getPendingApprovals(model);
            return pending.filter(pr => 
                pr.priority === "URGENT" || pr.priority === "HIGH"
            );
        },
        
        // Get overdue approvals
        getOverdueApprovals: function(model) {
            var pending = this.getPendingApprovals(model);
            return pending.filter(pr => 
                pr.dueStatus === "OVERDUE"
            );
        },
        
        // Approve a purchase request
        approvePurchaseRequest: function(model, prId, approver, comment) {
            var pr = this.getPurchaseRequest(model, prId);
            if (!pr) return false;
            
            var updatedData = {
                status: "APPROVED",
                statusText: "Approved",
                workflowStatus: "Approved",
                workflowStep: "Completed",
                approver: approver || "Current User",
                approvalDate: new Date().toISOString().slice(0, 10),
                approvalComment: comment || "",
                canApprove: false,
                lastUpdated: new Date().toISOString()
            };
            
            return this.updatePurchaseRequest(model, prId, updatedData);
        },
        
        // Reject a purchase request
        rejectPurchaseRequest: function(model, prId, approver, comment) {
            var pr = this.getPurchaseRequest(model, prId);
            if (!pr) return false;
            
            var updatedData = {
                status: "REJECTED",
                statusText: "Rejected",
                workflowStatus: "Rejected",
                workflowStep: "Completed",
                approver: approver || "Current User",
                rejectionDate: new Date().toISOString().slice(0, 10),
                rejectionComment: comment || "Rejected by approver",
                canApprove: false,
                lastUpdated: new Date().toISOString()
            };
            
            return this.updatePurchaseRequest(model, prId, updatedData);
        },
        
        // Delegate a purchase request to another approver
        delegatePurchaseRequest: function(model, prId, delegateTo, comment) {
            var pr = this.getPurchaseRequest(model, prId);
            if (!pr) return false;
            
            var updatedData = {
                status: "DELEGATED",
                statusText: "Delegated",
                workflowStatus: "Delegated to " + delegateTo,
                approver: delegateTo,
                delegationDate: new Date().toISOString().slice(0, 10),
                delegationComment: comment || "",
                lastUpdated: new Date().toISOString()
            };
            
            return this.updatePurchaseRequest(model, prId, updatedData);
        },
        
        // Add comment to purchase request
        addCommentToPR: function(model, prId, comment, commenter) {
            var pr = this.getPurchaseRequest(model, prId);
            if (!pr) return false;
            
            // Initialize comments array if it doesn't exist
            if (!pr.comments) {
                pr.comments = [];
            }
            
            var newComment = {
                id: "comment_" + Date.now(),
                comment: comment,
                commenter: commenter || "Current User",
                timestamp: new Date().toISOString(),
                type: "APPROVAL_COMMENT"
            };
            
            pr.comments.push(newComment);
            
            return this.updatePurchaseRequest(model, prId, {
                comments: pr.comments,
                lastUpdated: new Date().toISOString()
            });
        },
        
        // Bulk approve multiple purchase requests
        bulkApprovePurchaseRequests: function(model, prIds, approver, comment) {
            if (!prIds || prIds.length === 0) return 0;
            
            var successCount = 0;
            prIds.forEach(prId => {
                if (this.approvePurchaseRequest(model, prId, approver, comment)) {
                    successCount++;
                }
            });
            
            return successCount;
        },
        
        // Bulk reject multiple purchase requests
        bulkRejectPurchaseRequests: function(model, prIds, approver, comment) {
            if (!prIds || prIds.length === 0) return 0;
            
            var successCount = 0;
            prIds.forEach(prId => {
                if (this.rejectPurchaseRequest(model, prId, approver, comment)) {
                    successCount++;
                }
            });
            
            return successCount;
        },
        
        // Get approval history
        getApprovalHistory: function(model, days) {
            var allPRs = this.getAllPurchaseRequests(model);
            var cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - (days || 30));
            
            return allPRs
                .filter(pr => 
                    (pr.status === "APPROVED" || pr.status === "REJECTED" || pr.status === "DELEGATED") &&
                    new Date(pr.lastUpdated) > cutoffDate
                )
                .map(pr => ({
                    id: pr.id,
                    prNumber: pr.prNumber,
                    action: pr.status === "APPROVED" ? "Approved" : 
                            pr.status === "REJECTED" ? "Rejected" : "Delegated",
                    approver: pr.approver || "System",
                    approvalDate: pr.approvalDate || pr.rejectionDate || pr.delegationDate || pr.lastUpdated,
                    comment: pr.approvalComment || pr.rejectionComment || pr.delegationComment || "",
                    timestamp: pr.lastUpdated
                }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by date descending
        },
        
        // Get approval statistics
        getApprovalStatistics: function(model) {
            var allPRs = this.getAllPurchaseRequests(model);
            var pending = this.getPendingApprovals(model);
            var urgent = this.getUrgentApprovals(model);
            var overdue = this.getOverdueApprovals(model);
            
            return {
                totalPending: pending.length,
                urgentCount: urgent.length,
                overdueCount: overdue.length,
                totalProcessed: allPRs.filter(pr => 
                    pr.status === "APPROVED" || pr.status === "REJECTED"
                ).length,
                approvalRate: this._calculateApprovalRate(allPRs),
                avgProcessingTime: this._calculateAvgProcessingTime(allPRs)
            };
        },
        
        // ========== PRIVATE HELPER METHODS ==========
        
        // Calculate due date based on priority
        _calculateDueDate: function(priority) {
            var dueDate = new Date();
            switch (priority) {
                case "URGENT":
                    dueDate.setDate(dueDate.getDate() + 1); // 1 day
                    break;
                case "HIGH":
                    dueDate.setDate(dueDate.getDate() + 2); // 2 days
                    break;
                case "MEDIUM":
                    dueDate.setDate(dueDate.getDate() + 5); // 5 days
                    break;
                case "LOW":
                default:
                    dueDate.setDate(dueDate.getDate() + 10); // 10 days
                    break;
            }
            return dueDate.toISOString().slice(0, 10);
        },
        
        // Calculate due status
        _calculateDueStatus: function(currentDate, dueDate) {
            if (!dueDate) return "ON_TIME";
            
            var due = new Date(dueDate);
            var current = new Date(currentDate);
            var diffDays = Math.floor((due - current) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return "OVERDUE";
            if (diffDays < 2) return "DUE_SOON";
            return "ON_TIME";
        },
        
        // Calculate days left
        _calculateDaysLeft: function(currentDate, dueDate) {
            if (!dueDate) return "N/A";
            
            var due = new Date(dueDate);
            var current = new Date(currentDate);
            var diffDays = Math.floor((due - current) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return "Overdue " + Math.abs(diffDays) + " days";
            return (diffDays + 1) + " days"; // +1 to include current day
        },
        
        // Calculate approval rate
        _calculateApprovalRate: function(purchaseRequests) {
            var approved = purchaseRequests.filter(pr => pr.status === "APPROVED").length;
            var rejected = purchaseRequests.filter(pr => pr.status === "REJECTED").length;
            var totalProcessed = approved + rejected;
            
            if (totalProcessed === 0) return 0;
            return Math.round((approved / totalProcessed) * 100);
        },
        
        // Calculate average processing time
        _calculateAvgProcessingTime: function(purchaseRequests) {
            var processedPRs = purchaseRequests.filter(pr => 
                pr.status === "APPROVED" || pr.status === "REJECTED"
            );
            
            if (processedPRs.length === 0) return 0;
            
            var totalDays = 0;
            processedPRs.forEach(pr => {
                var created = new Date(pr.creationDate);
                var processed = new Date(pr.approvalDate || pr.rejectionDate || pr.lastUpdated);
                var diffDays = Math.floor((processed - created) / (1000 * 60 * 60 * 24));
                totalDays += Math.max(diffDays, 0); // Ensure non-negative
            });
            
            return (totalDays / processedPRs.length).toFixed(1);
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
            var aStatuses = ["SUBMITTED", "PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "DRAFT"];
            var aPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
            var aTypes = ["GOODS", "SERVICES", "CAPEX", "OPEX"];
            var aDepartments = ["IT", "HR", "Finance", "Marketing", "Operations", "Procurement"];
            var aRequestors = ["John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis", "Robert Wilson"];
            var aTitles = ["Manager", "Director", "Senior Analyst", "Team Lead", "Specialist"];
            
            var aData = [];
            var dToday = new Date();
            
            for (var i = 1; i <= count; i++) {
                var iDaysAgo = Math.floor(Math.random() * 30);
                var iDaysDue = Math.floor(Math.random() * 14) - 2; // -2 to 11 days
                var dCreated = new Date(dToday);
                dCreated.setDate(dCreated.getDate() - iDaysAgo);
                
                var dDue = new Date(dToday);
                dDue.setDate(dDue.getDate() + iDaysDue);
                
                var fAmount = (Math.random() * 10000 + 100).toFixed(2);
                var sStatus = aStatuses[Math.floor(Math.random() * aStatuses.length)];
                var sPriority = aPriorities[Math.floor(Math.random() * aPriorities.length)];
                var sDueStatus = this._calculateDueStatus(dCreated, dDue.toISOString().slice(0, 10));
                var sDaysLeft = this._calculateDaysLeft(dCreated, dDue.toISOString().slice(0, 10));
                
                aData.push({
                    id: "pr_" + Date.now() + "_" + i,
                    prNumber: "PR-" + dToday.getFullYear() + "-" + (1000 + i).toString(),
                    prType: aTypes[Math.floor(Math.random() * aTypes.length)],
                    description: "Purchase request for " + aDepartments[Math.floor(Math.random() * aDepartments.length)] + " department",
                    status: sStatus,
                    statusText: this._getStatusText(sStatus),
                    priority: sPriority,
                    totalAmount: fAmount,
                    creationDate: dCreated.toISOString().slice(0, 10),
                    requiredDate: dDue.toISOString().slice(0, 10),
                    department: aDepartments[Math.floor(Math.random() * aDepartments.length)],
                    costCenter: "CC-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    createdBy: "User " + (Math.floor(Math.random() * 5) + 1),
                    requestor: aRequestors[Math.floor(Math.random() * aRequestors.length)],
                    requestorTitle: aTitles[Math.floor(Math.random() * aTitles.length)],
                    lastUpdated: dCreated.toISOString(),
                    workflowStatus: this._getWorkflowStatus(sStatus),
                    workflowStep: this._getWorkflowStep(sStatus),
                    approver: sStatus === "APPROVED" || sStatus === "REJECTED" ? "Manager " + (Math.floor(Math.random() * 3) + 1) : "",
                    approvalDate: sStatus === "APPROVED" ? dCreated.toISOString().slice(0, 10) : "",
                    rejectionDate: sStatus === "REJECTED" ? dCreated.toISOString().slice(0, 10) : "",
                    approvalComment: sStatus === "APPROVED" ? "Approved per policy" : "",
                    rejectionComment: sStatus === "REJECTED" ? "Budget constraints" : "",
                    canApprove: sStatus === "SUBMITTED" || sStatus === "PENDING",
                    dueDate: dDue.toISOString().slice(0, 10),
                    dueStatus: sDueStatus,
                    daysLeft: sDaysLeft,
                    attachmentsCount: Math.floor(Math.random() * 5),
                    totalItems: Math.floor(Math.random() * 10) + 1,
                    comments: Math.random() > 0.8 ? [{comment: "Please review budget", commenter: "Finance", timestamp: dCreated.toISOString()}] : []
                });
            }
            
            return aData;
        },
        
        _getStatusText: function(status) {
            var statusMap = {
                "DRAFT": "Draft",
                "SUBMITTED": "Submitted for Approval",
                "PENDING": "Pending Approval",
                "APPROVED": "Approved",
                "REJECTED": "Rejected",
                "IN_PROGRESS": "In Progress",
                "DELEGATED": "Delegated"
            };
            return statusMap[status] || status;
        },
        
        _getWorkflowStatus: function(status) {
            var workflowMap = {
                "DRAFT": "Draft Saved",
                "SUBMITTED": "Submitted for Approval",
                "PENDING": "Awaiting Approval",
                "APPROVED": "Approved",
                "REJECTED": "Rejected",
                "IN_PROGRESS": "Processing",
                "DELEGATED": "Delegated to Another Approver"
            };
            return workflowMap[status] || status;
        },
        
        _getWorkflowStep: function(status) {
            var stepMap = {
                "DRAFT": "Draft Creation",
                "SUBMITTED": "Manager Review",
                "PENDING": "Finance Approval",
                "APPROVED": "Completed",
                "REJECTED": "Completed",
                "IN_PROGRESS": "PO Generation",
                "DELEGATED": "Delegated Review"
            };
            return stepMap[status] || status;
        },
        // Update the getApprovalStatistics method:
getApprovalStatistics: function(model) {
    var allPRs = this.getAllPurchaseRequests(model);
    var pending = this.getPendingApprovals(model);
    var urgent = this.getUrgentApprovals(model);
    var overdue = this.getOverdueApprovals(model);
    var delegated = allPRs.filter(pr => pr.status === "DELEGATED");
    
    return {
        totalPending: pending.length,
        urgentCount: urgent.length,
        overdueCount: overdue.length,
        delegatedCount: delegated.length,
        totalProcessed: allPRs.filter(pr => 
            pr.status === "APPROVED" || pr.status === "REJECTED"
        ).length,
        approvalRate: this._calculateApprovalRate(allPRs),
        avgProcessingTime: this._calculateAvgProcessingTime(allPRs)
    };
},
    };

    return PurchaseRequestService;
});