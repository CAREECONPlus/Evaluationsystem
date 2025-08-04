// careeconplus/evaluationsystem/Evaluationsystem-main/firestore.indexes.json

{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "role",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "qualitativeGoals",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "period",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "qualitativeGoals",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "evaluations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "evaluations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "evaluatorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "evaluations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "targetUserId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "period",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "evaluationStructures",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "jobTypeId",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "invitations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "used",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "expiresAt",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "invitations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
