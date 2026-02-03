# Exemples de Formulaires avec Assignation de Variables

Ce document contient des exemples de formulaires avec assignation de variables à des utilisateurs spécifiques.

## Exemple 1: Formulaire de demande de congé

Dans cet exemple, un employé remplit la demande, mais seul le manager peut approuver.

### Schéma du formulaire

```json
{
  "type": "object",
  "title": "Demande de congé",
  "required": ["startDate", "endDate", "reason"],
  "properties": {
    "startDate": {
      "type": "string",
      "format": "date",
      "title": "Date de début",
      "assignedUsers": []
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "title": "Date de fin",
      "assignedUsers": []
    },
    "reason": {
      "type": "string",
      "title": "Motif de la demande",
      "assignedUsers": []
    },
    "managerApproval": {
      "type": "boolean",
      "title": "Approbation du manager",
      "default": false,
      "assignedUsers": ["manager-uuid"]
    },
    "managerComments": {
      "type": "string",
      "title": "Commentaires du manager",
      "assignedUsers": ["manager-uuid"]
    }
  }
}
```

### UI Schema

```json
{
  "startDate": {
    "ui:widget": "date"
  },
  "endDate": {
    "ui:widget": "date"
  },
  "reason": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 5
    }
  },
  "managerComments": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 3
    }
  }
}
```

### Workflow

```json
{
  "steps": [
    {
      "id": "submit_request",
      "type": "form",
      "name": "Soumettre la demande",
      "formId": "leave-request-form-id",
      "assignedUsers": ["employee-uuid", "manager-uuid"],
      "assignedTo": "employee-uuid"
    }
  ]
}
```

**Comportement:**
- L'employé peut remplir: startDate, endDate, reason
- Le manager peut remplir: managerApproval, managerComments
- L'employé sauvegarde → notification au manager
- Le manager complète l'approbation → formulaire soumis

## Exemple 2: Formulaire de demande de budget

Un formulaire collaboratif où plusieurs personnes contribuent à différentes sections.

### Schéma du formulaire

```json
{
  "type": "object",
  "title": "Demande de budget projet",
  "required": ["projectName", "totalBudget"],
  "properties": {
    "projectName": {
      "type": "string",
      "title": "Nom du projet",
      "assignedUsers": []
    },
    "projectDescription": {
      "type": "string",
      "title": "Description du projet",
      "assignedUsers": []
    },
    "totalBudget": {
      "type": "number",
      "title": "Budget total demandé",
      "minimum": 0,
      "assignedUsers": ["project-manager-uuid"]
    },
    "budgetBreakdown": {
      "type": "object",
      "title": "Répartition du budget",
      "properties": {
        "personnel": {
          "type": "number",
          "title": "Personnel",
          "assignedUsers": ["hr-manager-uuid"]
        },
        "equipment": {
          "type": "number",
          "title": "Équipement",
          "assignedUsers": ["procurement-uuid"]
        },
        "services": {
          "type": "number",
          "title": "Services externes",
          "assignedUsers": ["project-manager-uuid"]
        }
      }
    },
    "financialAnalysis": {
      "type": "object",
      "title": "Analyse financière",
      "properties": {
        "roi": {
          "type": "number",
          "title": "ROI estimé (%)",
          "assignedUsers": ["finance-uuid"]
        },
        "paybackPeriod": {
          "type": "number",
          "title": "Période de retour (mois)",
          "assignedUsers": ["finance-uuid"]
        },
        "riskAssessment": {
          "type": "string",
          "title": "Évaluation des risques",
          "enum": ["Faible", "Moyen", "Élevé"],
          "assignedUsers": ["finance-uuid"]
        }
      }
    },
    "ceoApproval": {
      "type": "boolean",
      "title": "Approbation CEO",
      "assignedUsers": ["ceo-uuid"]
    }
  }
}
```

### Workflow

```json
{
  "steps": [
    {
      "id": "collaborative_budget_form",
      "type": "form",
      "name": "Remplir la demande de budget",
      "formId": "budget-request-form-id",
      "assignedUsers": [
        "project-manager-uuid",
        "hr-manager-uuid",
        "procurement-uuid",
        "finance-uuid",
        "ceo-uuid"
      ]
    }
  ]
}
```

**Comportement:**
- Chaque personne remplit sa section
- À chaque sauvegarde, tous les autres assignés reçoivent une notification
- La progression augmente au fur et à mesure
- Une fois toutes les sections remplies, n'importe qui peut soumettre

## Exemple 3: Formulaire d'évaluation d'employé

L'employé fait son auto-évaluation, puis le manager complète.

### Schéma du formulaire

```json
{
  "type": "object",
  "title": "Évaluation annuelle",
  "properties": {
    "employeeName": {
      "type": "string",
      "title": "Nom de l'employé",
      "readOnly": true
    },
    "selfEvaluation": {
      "type": "object",
      "title": "Auto-évaluation",
      "properties": {
        "achievements": {
          "type": "string",
          "title": "Réalisations principales",
          "assignedUsers": ["employee-uuid"]
        },
        "challenges": {
          "type": "string",
          "title": "Défis rencontrés",
          "assignedUsers": ["employee-uuid"]
        },
        "selfRating": {
          "type": "integer",
          "title": "Note personnelle (1-5)",
          "minimum": 1,
          "maximum": 5,
          "assignedUsers": ["employee-uuid"]
        }
      }
    },
    "managerEvaluation": {
      "type": "object",
      "title": "Évaluation du manager",
      "properties": {
        "strengths": {
          "type": "string",
          "title": "Points forts",
          "assignedUsers": ["manager-uuid"]
        },
        "areasForImprovement": {
          "type": "string",
          "title": "Axes d'amélioration",
          "assignedUsers": ["manager-uuid"]
        },
        "managerRating": {
          "type": "integer",
          "title": "Note du manager (1-5)",
          "minimum": 1,
          "maximum": 5,
          "assignedUsers": ["manager-uuid"]
        },
        "promotionRecommendation": {
          "type": "boolean",
          "title": "Recommandation de promotion",
          "assignedUsers": ["manager-uuid"]
        }
      }
    },
    "developmentPlan": {
      "type": "string",
      "title": "Plan de développement",
      "assignedUsers": ["employee-uuid", "manager-uuid"]
    }
  }
}
```

**Comportement:**
1. L'employé remplit selfEvaluation
2. L'employé sauvegarde → notification au manager
3. Le manager remplit managerEvaluation
4. Ensemble, ils remplissent developmentPlan
5. Le manager soumet le formulaire final

## Exemple 4: Workflow séquentiel avec formulaire partagé

Un formulaire qui passe par plusieurs départements, chacun remplissant sa partie.

### Définition du workflow

```json
{
  "id": "procurement-workflow",
  "name": "Processus d'achat",
  "steps": [
    {
      "id": "request_form",
      "type": "form",
      "name": "Formulaire de demande d'achat",
      "formId": "procurement-form-id",
      "assignedUsers": [
        "requester-uuid",
        "it-approver-uuid",
        "finance-approver-uuid",
        "procurement-officer-uuid"
      ],
      "variables": {
        "formData": {
          "requesterInfo": {
            "requesterName": "",
            "department": "",
            "itemDescription": ""
          },
          "itApproval": {
            "technicalFeasibility": null,
            "itComments": ""
          },
          "financeApproval": {
            "budgetAvailable": null,
            "costCenter": ""
          },
          "procurement": {
            "supplier": "",
            "estimatedDelivery": ""
          }
        }
      }
    }
  ]
}
```

### Schéma du formulaire

```json
{
  "type": "object",
  "title": "Demande d'achat",
  "properties": {
    "requesterInfo": {
      "type": "object",
      "title": "Informations du demandeur",
      "properties": {
        "requesterName": {
          "type": "string",
          "title": "Nom",
          "assignedUsers": ["requester-uuid"]
        },
        "department": {
          "type": "string",
          "title": "Département",
          "assignedUsers": ["requester-uuid"]
        },
        "itemDescription": {
          "type": "string",
          "title": "Description de l'article",
          "assignedUsers": ["requester-uuid"]
        },
        "estimatedCost": {
          "type": "number",
          "title": "Coût estimé",
          "assignedUsers": ["requester-uuid"]
        }
      }
    },
    "itApproval": {
      "type": "object",
      "title": "Approbation IT",
      "properties": {
        "technicalFeasibility": {
          "type": "boolean",
          "title": "Faisabilité technique",
          "assignedUsers": ["it-approver-uuid"]
        },
        "itComments": {
          "type": "string",
          "title": "Commentaires IT",
          "assignedUsers": ["it-approver-uuid"]
        }
      }
    },
    "financeApproval": {
      "type": "object",
      "title": "Approbation Finance",
      "properties": {
        "budgetAvailable": {
          "type": "boolean",
          "title": "Budget disponible",
          "assignedUsers": ["finance-approver-uuid"]
        },
        "costCenter": {
          "type": "string",
          "title": "Centre de coûts",
          "assignedUsers": ["finance-approver-uuid"]
        }
      }
    },
    "procurement": {
      "type": "object",
      "title": "Traitement par les achats",
      "properties": {
        "supplier": {
          "type": "string",
          "title": "Fournisseur sélectionné",
          "assignedUsers": ["procurement-officer-uuid"]
        },
        "estimatedDelivery": {
          "type": "string",
          "format": "date",
          "title": "Livraison estimée",
          "assignedUsers": ["procurement-officer-uuid"]
        }
      }
    }
  }
}
```

**Flux:**
1. Requester remplit requesterInfo (25% de progression)
2. IT approver remplit itApproval (50% de progression)
3. Finance approver remplit financeApproval (75% de progression)
4. Procurement officer remplit procurement (100% de progression)
5. Soumission finale du formulaire

## Bonnes pratiques

### 1. Planification des assignations

- **Identifiez les rôles** : Qui doit remplir quoi?
- **Séquence vs Parallèle** : Les champs peuvent-ils être remplis simultanément?
- **Dépendances** : Certains champs dépendent-ils d'autres?

### 2. Communication

- Utilisez des titres de champs clairs
- Ajoutez des descriptions pour expliquer ce qui est attendu
- Indiquez visuellement qui peut éditer quoi

### 3. Validation

```json
{
  "properties": {
    "managerApproval": {
      "type": "boolean",
      "title": "Approbation",
      "assignedUsers": ["manager-uuid"],
      "description": "À remplir par le manager uniquement"
    }
  }
}
```

### 4. Valeurs par défaut

Pré-remplissez les champs avec des variables de workflow:

```json
{
  "properties": {
    "employeeName": {
      "type": "string",
      "title": "Employé",
      "default": "{{workflow.initiator.name}}",
      "readOnly": true
    }
  }
}
```

### 5. Progression calculée

```javascript
// Frontend: Calculer la progression basée sur les champs remplis
const calculateProgress = (formData, schema) => {
  const totalFields = Object.keys(schema.properties).length;
  const filledFields = Object.values(formData).filter(v => v != null && v !== '').length;
  return Math.round((filledFields / totalFields) * 100);
};
```

## API pour créer des formulaires avec assignation

### 1. Créer le formulaire

```javascript
POST /api/forms

{
  "name": "Demande de congé",
  "description": "Formulaire de demande de congé avec approbation",
  "schema": {
    "type": "object",
    "properties": {
      "startDate": {
        "type": "string",
        "format": "date",
        "title": "Date de début",
        "assignedUsers": []
      },
      "managerApproval": {
        "type": "boolean",
        "title": "Approbation",
        "assignedUsers": ["manager-uuid"]
      }
    }
  },
  "uiSchema": {
    "startDate": {
      "ui:widget": "date"
    }
  }
}
```

### 2. Créer le workflow avec le formulaire

```javascript
POST /api/workflows

{
  "name": "Workflow de congé",
  "description": "Gestion des demandes de congé",
  "definition": {
    "steps": [
      {
        "id": "leave_request",
        "type": "form",
        "name": "Demande de congé",
        "formId": "form-uuid-from-step-1",
        "assignedUsers": ["employee-uuid", "manager-uuid"]
      }
    ]
  }
}
```

### 3. Démarrer une instance de workflow

```javascript
POST /api/workflows/:id/start

{
  "data": {
    "employeeId": "employee-uuid",
    "managerId": "manager-uuid"
  }
}
```

### 4. Vérifier les accès au formulaire

```javascript
GET /api/tasks/:taskId/form-access

Response:
{
  "success": true,
  "data": {
    "canEdit": true,
    "editableFields": ["startDate", "endDate", "reason"],
    "formData": {
      "startDate": "2026-03-01"
    },
    "formProgress": 30
  }
}
```

### 5. Sauvegarder le formulaire

```javascript
POST /api/tasks/:taskId/save-draft

{
  "formData": {
    "startDate": "2026-03-01",
    "endDate": "2026-03-10",
    "reason": "Vacances familiales"
  },
  "progress": 60
}
```

## Conclusion

Le système d'assignation de variables permet de créer des formulaires collaboratifs sophistiqués où:
- Chaque utilisateur ne peut éditer que ses champs assignés
- Les sauvegardes partielles sont supportées
- Les notifications maintiennent tout le monde informé
- Le verrouillage prévient les conflits d'édition

Cette fonctionnalité est particulièrement utile pour les processus d'approbation multi-niveaux et les formulaires nécessitant l'input de plusieurs départements ou rôles.
