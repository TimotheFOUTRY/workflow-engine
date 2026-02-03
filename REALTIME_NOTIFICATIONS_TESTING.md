# Guide de Test - Notifications en Temps Réel

## 🧪 Tests à Effectuer

### 1. Test de Connexion SSE

**Objectif :** Vérifier que la connexion SSE s'établit correctement

**Étapes :**
1. Ouvrez l'application dans votre navigateur
2. Connectez-vous avec un compte utilisateur
3. Ouvrez la console du navigateur (F12)
4. Recherchez le message : `✅ Connected to notification stream`

**Résultat attendu :**
- ✅ Message de connexion dans la console
- ✅ Aucune erreur dans la console
- ✅ Dans les logs backend : `User {userId} subscribed to notification stream`

---

### 2. Test de Notification en Temps Réel

**Objectif :** Vérifier que les notifications arrivent instantanément

#### Option A : Via API Test (Recommandé)

**Étapes :**
1. Connectez-vous à l'application
2. Utilisez curl ou Postman pour envoyer une notification de test :

```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "Ceci est une notification de test",
    "type": "info"
  }'
```

**Pour obtenir votre token JWT :**
- Ouvrez la console du navigateur
- Tapez : `localStorage.getItem('token')`
- Copiez le token (sans les guillemets)

**Résultat attendu :**
- ✅ Badge de notification apparaît instantanément
- ✅ Icône de cloche s'anime (bounce)
- ✅ Notification navigateur apparaît (si permission accordée)
- ✅ Console affiche : `📬 New notification received:`
- ✅ Compteur s'incrémente

#### Option B : Via Assignation de Tâche

**Étapes :**
1. Ouvrez deux navigateurs (ou navigation privée)
2. Connectez-vous avec deux comptes différents (User1 et User2)
3. Avec User1 : Créez un workflow et assignez une tâche à User2
4. Démarrez le workflow
5. Observez le navigateur de User2

**Résultat attendu :**
- ✅ User2 reçoit instantanément la notification "Nouvelle tâche assignée"
- ✅ Badge apparaît sur l'icône de cloche
- ✅ Animation de l'icône
- ✅ Notification navigateur

---

### 3. Test du Badge et des Animations

**Objectif :** Vérifier les animations visuelles

**Étapes :**
1. Envoyez plusieurs notifications de test
2. Observez l'icône de notification dans la barre de navigation

**Résultat attendu :**
- ✅ Badge rouge affiche le bon nombre de notifications
- ✅ Icône change de gris à bleu quand il y a des notifications
- ✅ Icône utilise `BellAlertIcon` (solide) au lieu de `BellIcon` (outline)
- ✅ Animation bounce sur l'icône lors d'une nouvelle notification
- ✅ Animation pulse sur le badge
- ✅ Badge affiche "99+" si plus de 99 notifications

---

### 4. Test de Reconnexion

**Objectif :** Vérifier que la connexion se rétablit automatiquement

**Étapes :**
1. Connectez-vous à l'application
2. Vérifiez la connexion SSE dans la console
3. Stoppez le backend :
   ```bash
   docker compose stop backend
   # ou
   # Ctrl+C si lancé en mode dev
   ```
4. Observez les logs dans la console
5. Redémarrez le backend :
   ```bash
   docker compose start backend
   ```
6. Attendez 5 secondes

**Résultat attendu :**
- ✅ Console affiche : `❌ Notification stream error`
- ✅ Console affiche : `Reconnecting in 5 seconds...`
- ✅ Après redémarrage : `✅ Connected to notification stream`
- ✅ Connexion rétablie automatiquement

---

### 5. Test des Notifications Navigateur

**Objectif :** Vérifier les notifications natives du navigateur

**Étapes :**
1. Lors de la première connexion, accordez la permission pour les notifications
2. Envoyez une notification de test
3. Minimisez ou changez d'onglet

**Résultat attendu :**
- ✅ Notification native du système d'exploitation apparaît
- ✅ Titre et message correspondent à la notification
- ✅ Cliquer sur la notification peut ramener à l'application

**Si les notifications ne fonctionnent pas :**
- Vérifier les paramètres du navigateur
- Chrome : chrome://settings/content/notifications
- Firefox : about:preferences#privacy (section Permissions)

---

### 6. Test Multi-utilisateurs

**Objectif :** Vérifier l'isolation des notifications

**Configuration :**
- 2 navigateurs ou 2 fenêtres en navigation privée
- User1 et User2 connectés

**Étapes :**
1. Envoyez une notification de test pour User1
2. Vérifiez que User2 ne la reçoit pas
3. Envoyez une notification pour User2
4. Vérifiez que User1 ne la reçoit pas

**Résultat attendu :**
- ✅ Chaque utilisateur reçoit uniquement ses propres notifications
- ✅ Aucune fuite de données entre utilisateurs

---

### 7. Test de Performance

**Objectif :** Vérifier que le système gère plusieurs notifications

**Étapes :**
1. Envoyez rapidement 10 notifications de test (script ou boucle)
2. Observez le comportement de l'interface

**Script de test (PowerShell) :**
```powershell
$token = "YOUR_JWT_TOKEN"
$url = "http://localhost:3001/api/notifications/test"

for ($i = 1; $i -le 10; $i++) {
    $body = @{
        title = "Test $i"
        message = "Notification numéro $i"
        type = "info"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri $url -Method POST `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -ContentType "application/json" `
        -Body $body
    
    Start-Sleep -Milliseconds 500
}
```

**Résultat attendu :**
- ✅ Toutes les notifications sont reçues
- ✅ Badge affiche le bon nombre (10)
- ✅ Aucun lag dans l'interface
- ✅ Animations fluides

---

### 8. Test de Heartbeat

**Objectif :** Vérifier que la connexion reste active

**Étapes :**
1. Connectez-vous à l'application
2. Laissez l'application ouverte pendant 2 minutes
3. Observez l'onglet Network dans les DevTools

**Résultat attendu :**
- ✅ Connexion SSE reste ouverte (statut "pending")
- ✅ Heartbeats envoyés toutes les 30 secondes
- ✅ Aucune déconnexion automatique

---

## 🐛 Problèmes Courants et Solutions

### Problème : "No token provided"

**Cause :** Token JWT manquant ou invalide

**Solution :**
1. Vérifiez que vous êtes bien connecté
2. Vérifiez le localStorage : `localStorage.getItem('token')`
3. Reconnectez-vous si nécessaire

---

### Problème : Notifications n'arrivent pas

**Diagnostic :**
1. Vérifiez que RabbitMQ est démarré :
   ```bash
   docker compose ps
   ```
2. Vérifiez les logs backend :
   ```bash
   docker compose logs backend | grep -i notification
   ```
3. Vérifiez la connexion SSE dans la console navigateur

**Solutions :**
- Redémarrez RabbitMQ : `docker compose restart rabbitmq`
- Redémarrez le backend : `docker compose restart backend`
- Rafraîchissez la page

---

### Problème : Badge ne se met pas à jour

**Cause :** React Query cache non invalidé

**Solution :**
1. Vérifiez que `invalidateQueries` est appelé dans `useNotificationStream`
2. Vérifiez la console pour les erreurs JavaScript
3. Essayez de rafraîchir la page manuellement

---

### Problème : Reconnexion en boucle

**Cause :** Token expiré ou utilisateur inactif

**Solution :**
1. Déconnectez-vous et reconnectez-vous
2. Vérifiez que le compte utilisateur est actif
3. Vérifiez les logs backend pour les erreurs d'authentification

---

## 📊 Métriques à Surveiller

### Backend Logs
```
✅ RabbitMQ connected successfully
✅ Notification service started
✅ Notification consumer service started
✅ User {userId} subscribed to notification stream
✅ Notification sent to user {userId}
```

### Frontend Console
```
✅ Connecting to notification stream...
✅ Connected to notification stream
✅ Notification stream ready: Connected to notification stream
📬 New notification received: {notification}
```

### Network Tab (DevTools)
- **Endpoint :** `/api/notifications/stream`
- **Type :** eventsource
- **Status :** 200 (pending)
- **Size :** Streaming

---

## ✅ Checklist de Validation

Avant de considérer le système comme fonctionnel, vérifiez :

- [ ] Connexion SSE s'établit automatiquement à la connexion
- [ ] Notifications arrivent en moins de 1 seconde
- [ ] Badge affiche le bon nombre de notifications non lues
- [ ] Icône s'anime lors de nouvelles notifications
- [ ] Notifications navigateur fonctionnent (si permission)
- [ ] Reconnexion automatique fonctionne
- [ ] Heartbeat maintient la connexion
- [ ] Isolation des notifications par utilisateur
- [ ] Aucune fuite mémoire (vérifier après 10+ minutes)
- [ ] Performance correcte avec 10+ notifications rapides

---

## 🎯 Tests Recommandés par Ordre de Priorité

1. **Test de Connexion SSE** (Critique)
2. **Test de Notification en Temps Réel - Option A** (Critique)
3. **Test du Badge et des Animations** (Important)
4. **Test de Reconnexion** (Important)
5. **Test Multi-utilisateurs** (Important)
6. **Test des Notifications Navigateur** (Nice to have)
7. **Test de Performance** (Nice to have)
8. **Test de Heartbeat** (Nice to have)

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. Vérifiez les logs backend et frontend
2. Consultez [REALTIME_NOTIFICATIONS.md](./REALTIME_NOTIFICATIONS.md) pour plus de détails
3. Vérifiez que tous les services Docker sont démarrés
4. Essayez de redémarrer l'application complète

---

**Dernière mise à jour :** $(date)
**Version :** 1.0.0
