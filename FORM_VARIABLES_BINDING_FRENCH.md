# Form Variable Binding - Quick Start Guide (Français)

## Problème Résolu 🎯

Vous pouviez créer des formulaires, mais il n'y avait **aucun moyen** de lier les champs du formulaire à des variables. Maintenant, vous pouvez :

✅ Lier chaque champ à une variable nommée  
✅ Voir tous les paramètres du formulaire  
✅ Pre-remplir les formulaires avec des valeurs du workflow  

---

## Étape 1: Ouvrir l'éditeur de formulaire

1. Allez à **"Forms"** → **"Create New Form"** ou éditez un formulaire existant
2. Ajoutez des champs depuis la **"Field Palette"** (gauche)

---

## Étape 2: Lier un champ à une variable

### Dans le panneau **Field Configuration** (droite) :

1. **Cliquez sur un champ** dans votre formulaire
2. **Descendez** jusqu'à la section **"Variable Binding"**
3. **Remplissez les deux champs :**

```
┌─────────────────────────────────────────┐
│      Variable Binding                   │
├─────────────────────────────────────────┤
│                                         │
│ Bind to Variable                        │
│ [________________________]              │
│  e.g., user_email, product_name        │
│                                         │
│ Variable Type                           │
│ [▼ String          ]                   │
│   - String                              │
│   - Number                              │
│   - Boolean                             │
│   - Date                                │
│   - Array                               │
│   - Object                              │
│                                         │
│ 💡 Tip: Once you bind a field...       │
│                                         │
└─────────────────────────────────────────┘
```

4. **Cliquez sur "Update Field"** pour sauvegarder

---

## Étape 3: Voir les paramètres du formulaire

### Deux endroits affichent vos variables liées :

#### **A) Panneau "Form Parameters" (côté droit)**

```
┌─────────────────────────────────┐
│ λ Form Parameters               │
├─────────────────────────────────┤
│                                 │
│ ┌──────────────────────────┐   │
│ │ user_email         STRING │   │
│ │ Email address            │   │
│ └──────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐   │
│ │ user_age          NUMBER  │   │
│ │ Age                      │   │
│ └──────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐   │
│ │ subscribe_newsletter BOOL │   │
│ │ Newsletter subscription   │   │
│ └──────────────────────────┘   │
│                                 │
│ ℹ️ How to use:                  │
│ 1. Add fields and bind them    │
│ 2. Pass parameter values       │
│ 3. Fields will be pre-filled   │
│                                 │
└─────────────────────────────────┘
```

#### **B) Mode Preview**

Cliquez sur **"Show Preview"** pour voir :

```
┌─────────────────────────────────────────┐
│         Form Preview                    │
├─────────────────────────────────────────┤
│                                         │
│ Email address [user_email]              │
│ [_________________________]              │
│                                         │
│ Age [user_age]                          │
│ [_________________________]              │
│                                         │
│ Newsletter [ ] Subscribe                │
│              [subscribe_newsletter]     │
│                                         │
│             [Submit Form]               │
│                                         │
├─────────────────────────────────────────┤
│ λ Form Parameters (3)                   │
├─────────────────────────────────────────┤
│ user_email (string)                     │
│ Email address                           │
│                                         │
│ user_age (number)                       │
│ Age                                     │
│                                         │
│ subscribe_newsletter (boolean)          │
│ Newsletter subscription                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Exemple Complet : Formulaire d'Inscription

### 1️⃣ Créer le formulaire

| Champ | Type | Variable Liée | Type Variable |
|-------|------|---------------|---------------|
| Email | text | `user_email` | String |
| Prénom | text | `user_firstname` | String |
| Âge | number | `user_age` | Number |
| Accepte CGU | checkbox | `accept_terms` | Boolean |
| Date d'inscription | date | `signup_date` | Date |

### 2️⃣ Les paramètres du formulaire

```
Paramètres du formulaire:
- user_email: email@example.com
- user_firstname: Jean
- user_age: 25
- accept_terms: true
- signup_date: 2026-01-30
```

### 3️⃣ Utiliser dans le workflow

```
┌─────────────┐
│  Variable   │ Définit: user_email = "john@example.com"
│   Node      │          user_firstname = "John"
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Form     │ Pre-remplit le formulaire avec les valeurs
│   Node      │ L'utilisateur modifie et soumet
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Task      │ Reçoit les données du formulaire
│   Node      │ soumises pour traitement
└─────────────┘
```

---

## Points Clés à Retenir 💡

### ✅ À FAIRE

- Utilisez des noms significatifs (ex: `user_email`, `product_id`)
- Utilisez `snake_case` pour les noms de variables
- Définissez le bon type de variable
- Liez seulement les champs qui doivent être des paramètres
- Testez dans le workflow après binding

### ❌ À NE PAS FAIRE

- N'utilisez pas de caractères spéciaux (`user-email` ❌)
- Ne mélangez pas les types (String pour une date qui devrait être Date type ❌)
- N'essayez pas d'utiliser des noms vides
- N'oubliez pas de cliquer "Update Field" après modification

---

## Dépannage 🔧

### **Q: Je ne vois pas mes variables dans "Form Parameters"**
- **A:** Assurez-vous que vous avez rempli le champ "Bind to Variable"
- Cliquez "Update Field" pour sauvegarder
- Rechargez si nécessaire

### **Q: Les variables n'apparaissent pas quand j'utilise le formulaire dans un workflow**
- **A:** Assurez-vous que le formulaire est sauvegardé
- Rafraîchissez le concepteur de workflow
- Vérifiez que le nom de la variable est correctement saisi

### **Q: Mes données n'affichent pas le bon type**
- **A:** Vérifiez que le type de variable correspond au type de données
- `string` pour le texte
- `number` pour les nombres
- `boolean` pour les cases à cocher
- `date` pour les dates

---

## Cas d'Usage 📋

### 1. Formulaire de Contact
```
- sender_email (string)
- sender_name (string)
- subject (string)
- message (string)
```

### 2. Demande de Congés
```
- employee_id (string)
- start_date (date)
- end_date (date)
- reason (string)
- days_count (number)
```

### 3. Évaluation de Produit
```
- product_id (string)
- rating (number)
- review_text (string)
- verified_purchase (boolean)
```

---

## Intégration avec le Workflow 🔗

Dans le concepteur de workflow, quand vous utilisez ce formulaire :

1. Les variables du workflow peuvent être mappées aux paramètres du formulaire
2. Le formulaire sera pre-rempli avec les valeurs du workflow
3. Les soumissions du formulaire retournent les données au workflow

**Exemple:** 
```
Workflow Variable: customer_email = "alice@example.com"
         ↓ (mappé à)
Form Parameter: user_email
         ↓ (pre-remplit)
Form Field: Email = "alice@example.com"
         ↓ (l'utilisateur soumet)
Workflow reçoit: { user_email: "alice@example.com", ... }
```

---

## Résumé ✨

| Avant | Après |
|--------|-------|
| ❌ Impossible de lier des variables | ✅ Bind facile avec UI visuelle |
| ❌ Pas de visibilité sur les paramètres | ✅ Panneau dédié aux paramètres |
| ❌ Formulaires non-réutilisables | ✅ Formulaires réutilisables |
| ❌ Pas de pre-remplissage | ✅ Pre-remplissage automatique |

---

## Besoin d'aide ? 🤔

Consultez [FORM_VARIABLES_BINDING.md](FORM_VARIABLES_BINDING.md) pour la documentation complète.
