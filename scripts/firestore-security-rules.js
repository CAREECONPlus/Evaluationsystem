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
      allow read: if isOwner(userId) || hasRole('developer');
      allow read: if (hasRole('admin') || hasRole('evaluator')) 
                  && isSameTenant(get(/databases/$(database)/documents/users/$(userId)).data.tenantId);
      allow create: if hasRole('developer');
      allow update: if hasRole('developer');
      allow update: if hasRole('admin') && isSameTenant(get(/databases/$(database)/documents/users/$(userId)).data.tenantId);
      allow update: if isOwner(userId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'updatedAt']);
    }
    
    // Tenants collection
    match /tenants/{tenantId} {
      allow read, write: if hasRole('developer');
      allow read: if hasRole('admin') && isSameTenant(tenantId);
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      allow read: if true;
      allow create: if hasRole('developer') || hasRole('admin');
      allow update: if true; // Simplified for user registration flow
    }
    
    // ★★★ 不足していたルールを追加 ★★★
    // Job Types, Periods, and Structures
    match /targetJobTypes/{id} {
      allow read, write: if hasRole('admin') && isSameTenant(request.resource.data.tenantId);
      allow read: if isActiveUser() && isSameTenant(get(/databases/$(database)/documents/targetJobTypes/$(id)).data.tenantId);
    }
    match /evaluationPeriods/{id} {
      allow read, write: if hasRole('admin') && isSameTenant(request.resource.data.tenantId);
      allow read: if isActiveUser() && isSameTenant(get(/databases/$(database)/documents/evaluationPeriods/$(id)).data.tenantId);
    }
    match /evaluationStructures/{id} {
      allow read, write: if hasRole('admin') && isSameTenant(request.resource.data.tenantId);
      allow read: if isActiveUser() && isSameTenant(get(/databases/$(database)/documents/evaluationStructures/$(id)).data.tenantId);
    }
    
    // Qualitative Goals collection
    match /qualitativeGoals/{goalId} {
      allow read, write: if isOwner(request.resource.data.userId);
      allow read, write: if hasRole('admin') && isSameTenant(request.resource.data.tenantId);
      allow read: if hasRole('evaluator') && isSameTenant(get(/databases/$(database)/documents/qualitativeGoals/$(goalId)).data.tenantId);
    }
    
    // Evaluations collection
    match /evaluations/{evaluationId} {
      allow read, write: if isOwner(request.resource.data.targetUserId) || isOwner(request.resource.data.evaluatorId);
      allow read, write: if hasRole('admin') && isSameTenant(request.resource.data.tenantId);
      allow read: if hasRole('developer');
    }
    
  }
}
`

console.log(firestoreRules);
module.exports = firestoreRules;
