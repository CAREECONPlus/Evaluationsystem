/**
 * Firestore Security Rules for Construction Evaluation System
 * 建設業評価管理システム用Firestoreセキュリティルール
 */

const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      return isAuthenticated() && getUserData().role == role;
    }
    
    function isSameTenant(tenantId) {
      return isAuthenticated() && getUserData().tenantId == tenantId;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isActiveUser() {
      return isAuthenticated() && getUserData().status == 'active';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if isOwner(userId);
      
      // Developers can read all users
      allow read: if hasRole('developer');
      
      // Admins and evaluators can read users in their tenant
      allow read: if (hasRole('admin') || hasRole('evaluator')) 
                  && isSameTenant(resource.data.tenantId);
      
      // Users can update their own profile (limited fields)
      allow update: if isOwner(userId) 
                    && isActiveUser()
                    && request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['name', 'updatedAt']);
      
      // Developers can create and update any user
      allow create, update: if hasRole('developer');
      
      // Admins can update user status in their tenant
      allow update: if hasRole('admin') 
                    && isSameTenant(resource.data.tenantId)
                    && request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['status', 'updatedAt']);
    }
    
    // Tenants collection
    match /tenants/{tenantId} {
      // Only developers can manage tenants
      allow read, write: if hasRole('developer');
      
      // Admins can read their own tenant
      allow read: if hasRole('admin') && isSameTenant(tenantId);
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      // Anyone can read invitations (for registration)
      allow read: if true;
      
      // Developers can create admin invitations
      allow create: if hasRole('developer') && resource.data.type == 'admin';
      
      // Admins can create user invitations for their tenant
      allow create: if hasRole('admin') 
                    && resource.data.type == 'user'
                    && isSameTenant(resource.data.tenantId);
      
      // System can update invitations (mark as used)
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['used', 'usedAt', 'usedBy']);
    }
    
    // Evaluation Structures collection
    match /evaluationStructures/{structureId} {
      // Admins can manage evaluation structures for their tenant
      allow read, write: if hasRole('admin') && isSameTenant(resource.data.tenantId);
      
      // Evaluators and workers can read structures for their tenant
      allow read: if (hasRole('evaluator') || hasRole('worker')) 
                  && isSameTenant(resource.data.tenantId);
    }
    
    // Qualitative Goals collection
    match /qualitativeGoals/{goalId} {
      // Workers can create and read their own goals
      allow create, read: if hasRole('worker') 
                          && isOwner(resource.data.userId)
                          && isSameTenant(resource.data.tenantId);
      
      // Workers can update their own draft goals
      allow update: if hasRole('worker') 
                    && isOwner(resource.data.userId)
                    && resource.data.status == 'draft';
      
      // Admins can read and update goals in their tenant
      allow read, update: if hasRole('admin') && isSameTenant(resource.data.tenantId);
      
      // Evaluators can read goals in their tenant
      allow read: if hasRole('evaluator') && isSameTenant(resource.data.tenantId);
    }
    
    // Evaluations collection
    match /evaluations/{evaluationId} {
      // Evaluators can create evaluations for users in their tenant
      allow create: if hasRole('evaluator') 
                    && isOwner(resource.data.evaluatorId)
                    && isSameTenant(resource.data.tenantId);
      
      // Evaluators can read and update their own evaluations
      allow read, update: if hasRole('evaluator') 
                          && isOwner(resource.data.evaluatorId);
      
      // Workers can read evaluations where they are the target
      allow read: if hasRole('worker') 
                  && isOwner(resource.data.targetUserId);
      
      // Admins can read all evaluations in their tenant
      allow read: if hasRole('admin') && isSameTenant(resource.data.tenantId);
      
      // Developers can read all evaluations
      allow read: if hasRole('developer');
    }
    
    // Activity Logs collection (optional)
    match /activityLogs/{logId} {
      // Only system can write logs
      allow create: if isAuthenticated();
      
      // Users can read logs related to them
      allow read: if isAuthenticated() 
                  && (isOwner(resource.data.userId) 
                      || resource.data.relatedUsers.hasAny([request.auth.uid]));
      
      // Admins can read logs in their tenant
      allow read: if hasRole('admin') && isSameTenant(resource.data.tenantId);
      
      // Developers can read all logs
      allow read: if hasRole('developer');
    }
    
    // Job Types collection
    match /jobTypes/{jobTypeId} {
      // Admins can manage job types for their tenant
      allow read, write: if hasRole('admin') && isSameTenant(resource.data.tenantId);
      
      // Other users can read job types in their tenant
      allow read: if isActiveUser() && isSameTenant(resource.data.tenantId);
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`

console.log("Firestore Security Rules for Construction Evaluation System:")
console.log(firestoreRules)

// Export for use in Firebase project
if (typeof module !== "undefined" && module.exports) {
  module.exports = firestoreRules
}
