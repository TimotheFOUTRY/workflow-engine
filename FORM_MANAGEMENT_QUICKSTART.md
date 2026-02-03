# Guide Rapide - Gestion de Formulaires Collaboratifs

## Pour les développeurs Frontend

### 1. Ouvrir un formulaire pour édition

```javascript
// Étape 1: Vérifier si l'utilisateur peut éditer
const response = await fetch(`/api/tasks/${taskId}/form-access`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

if (!data.canEdit) {
  // Formulaire verrouillé ou pas de permission
  console.log('Raison:', data.reason);
  if (data.lockedBy) {
    alert(`Formulaire verrouillé par ${data.lockedBy.username}`);
  }
  return;
}

// Étape 2: Verrouiller le formulaire
const lockResponse = await fetch(`/api/tasks/${taskId}/lock`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (!lockResponse.ok) {
  const error = await lockResponse.json();
  alert(error.message);
  return;
}

// Étape 3: Afficher le formulaire avec les champs éditables
const editableFields = data.editableFields;
const currentFormData = data.formData;
const progress = data.formProgress;
```

### 2. Auto-save (sauvegarde automatique)

```javascript
// Auto-save toutes les 60 secondes
let autoSaveTimer;

const startAutoSave = (taskId, getFormData) => {
  autoSaveTimer = setInterval(async () => {
    const formData = getFormData();
    const progress = calculateProgress(formData);
    
    try {
      await fetch(`/api/tasks/${taskId}/save-draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData, progress })
      });
      console.log('Auto-save réussi');
    } catch (error) {
      console.error('Erreur auto-save:', error);
    }
  }, 60000); // 60 secondes
};

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }
};

// Calculer la progression
const calculateProgress = (formData) => {
  const totalFields = Object.keys(formSchema.properties).length;
  const filledFields = Object.values(formData)
    .filter(v => v != null && v !== '').length;
  return Math.round((filledFields / totalFields) * 100);
};
```

### 3. Sauvegarder manuellement

```javascript
const saveFormDraft = async (taskId, formData, progress) => {
  const response = await fetch(`/api/tasks/${taskId}/save-draft`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ formData, progress })
  });

  if (response.ok) {
    alert('Brouillon sauvegardé avec succès');
    // Le formulaire est automatiquement déverrouillé
    // Les notifications sont envoyées automatiquement
  }
};
```

### 4. Soumettre le formulaire complet

```javascript
const submitForm = async (taskId, formData) => {
  const response = await fetch(`/api/tasks/${taskId}/submit-form`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ formData })
  });

  if (response.ok) {
    alert('Formulaire soumis avec succès');
    // La tâche est complétée automatiquement
    // Rediriger vers la liste des tâches
    window.location.href = '/tasks';
  }
};
```

### 5. Gérer la fermeture du formulaire

```javascript
// Quand l'utilisateur annule ou ferme le formulaire
const cancelEditing = async (taskId) => {
  // Déverrouiller le formulaire
  await fetch(`/api/tasks/${taskId}/unlock`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Arrêter l'auto-save
  stopAutoSave();
  
  // Rediriger
  window.location.href = '/tasks';
};

// Gérer la fermeture de la fenêtre/tab
window.addEventListener('beforeunload', (e) => {
  if (formHasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
    
    // Tenter de déverrouiller (peut ne pas fonctionner dans tous les navigateurs)
    navigator.sendBeacon(`/api/tasks/${taskId}/unlock`, '');
  }
});
```

### 6. Composant React complet

```jsx
import { useState, useEffect } from 'react';

const FormEditor = ({ taskId, onComplete }) => {
  const [formData, setFormData] = useState({});
  const [editableFields, setEditableFields] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
    return () => {
      // Cleanup: déverrouiller à la fermeture
      if (isLocked) {
        fetch(`/api/tasks/${taskId}/unlock`, { method: 'POST' });
      }
    };
  }, [taskId]);

  const loadForm = async () => {
    try {
      // Charger les informations d'accès
      const accessRes = await fetch(`/api/tasks/${taskId}/form-access`);
      const { data } = await accessRes.json();

      if (!data.canEdit) {
        alert(data.reason);
        return;
      }

      setEditableFields(data.editableFields);
      setFormData(data.formData);
      setProgress(data.formProgress);

      // Verrouiller
      const lockRes = await fetch(`/api/tasks/${taskId}/lock`, {
        method: 'POST'
      });

      if (lockRes.ok) {
        setIsLocked(true);
        startAutoSave();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAutoSave = () => {
    setInterval(() => {
      handleSaveDraft();
    }, 60000);
  };

  const handleSaveDraft = async () => {
    const newProgress = calculateProgress();
    
    await fetch(`/api/tasks/${taskId}/save-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData, progress: newProgress })
    });
  };

  const handleSubmit = async () => {
    await fetch(`/api/tasks/${taskId}/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });
    
    onComplete();
  };

  const calculateProgress = () => {
    const total = editableFields.length;
    const filled = editableFields.filter(f => formData[f]).length;
    return Math.round((filled / total) * 100);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Formulaire - {progress}% complété</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {editableFields.map(field => (
          <div key={field}>
            <label>{field}</label>
            <input
              value={formData[field] || ''}
              onChange={(e) => setFormData({
                ...formData,
                [field]: e.target.value
              })}
            />
          </div>
        ))}
        
        <button type="button" onClick={handleSaveDraft}>
          Sauvegarder brouillon
        </button>
        <button type="submit">
          Soumettre
        </button>
      </form>
    </div>
  );
};
```

## Pour les administrateurs système

### Créer un formulaire avec assignation

```bash
curl -X POST http://localhost:3001/api/forms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demande de congé",
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
          "title": "Approbation manager",
          "assignedUsers": ["manager-uuid-here"]
        }
      }
    }
  }'
```

### Créer un workflow avec formulaire

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Workflow de congé",
    "definition": {
      "steps": [
        {
          "id": "leave_form",
          "type": "form",
          "formId": "form-uuid-from-previous-step",
          "assignedUsers": ["employee-uuid", "manager-uuid"]
        }
      ]
    }
  }'
```

### Nettoyer les verrous expirés

Le nettoyage automatique peut être ajouté à un cron job:

```javascript
// Dans un script de maintenance
const formLockService = require('./services/formLockService');

// Nettoyer les verrous expirés
const cleanupLocks = async () => {
  const result = await formLockService.cleanExpiredLocks();
  console.log(`${result.cleaned} verrous nettoyés`);
};

// Exécuter toutes les heures
setInterval(cleanupLocks, 60 * 60 * 1000);
```

## Endpoints API disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/tasks/:id/lock` | Verrouiller un formulaire |
| POST | `/api/tasks/:id/unlock` | Déverrouiller un formulaire |
| POST | `/api/tasks/:id/save-draft` | Sauvegarder un brouillon |
| POST | `/api/tasks/:id/submit-form` | Soumettre le formulaire |
| GET | `/api/tasks/:id/form-access` | Vérifier les accès |
| GET | `/api/tasks/:id/lock-status` | Statut du verrouillage |

## Notifications reçues

Les utilisateurs reçoivent des notifications pour:

1. **Sauvegarde de brouillon** (`form_draft_saved`)
   - Quand quelqu'un sauvegarde le formulaire
   - Inclut le pourcentage de complétion

2. **Complétion de formulaire** (`task_completed`)
   - Quand le formulaire est soumis
   - La tâche est complétée

## Dépannage

### Le formulaire ne se déverrouille pas

Si un utilisateur ne peut pas éditer car le formulaire est verrouillé:
- Attendre 15 minutes (timeout automatique)
- Ou demander à un admin de forcer le déverrouillage

### Les champs ne sont pas éditables

Vérifier:
1. L'utilisateur est-il dans `assignedUsers` de la tâche?
2. Le champ a-t-il des `assignedUsers` spécifiques?
3. La tâche est-elle en statut 'pending' ou 'in_progress'?

### Les notifications ne sont pas envoyées

Les notifications sont envoyées de manière asynchrone et leur échec ne bloque pas la sauvegarde. Vérifier:
- Les logs du service de notification
- La connexion à RabbitMQ

## Bonnes pratiques

✅ **DO:**
- Implémenter l'auto-save pour éviter la perte de données
- Déverrouiller le formulaire lors de la fermeture
- Afficher clairement qui peut éditer quoi
- Valider les données côté client avant soumission

❌ **DON'T:**
- Ne pas oublier de déverrouiller en cas d'erreur
- Ne pas modifier les champs protégés côté client (validation serveur de toute façon)
- Ne pas soumettre un formulaire incomplet

## Support

Pour plus d'informations:
- Documentation complète: `FORM_MANAGEMENT_SYSTEM.md`
- Exemples: `FORM_ASSIGNMENT_EXAMPLES.md`
- Résumé: `FORM_MANAGEMENT_IMPLEMENTATION.md`
