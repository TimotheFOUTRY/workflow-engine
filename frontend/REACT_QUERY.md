# React Query Integration - Guide Complet

## 📦 Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## 🏗️ Architecture

### Structure des fichiers
```
frontend/src/
├── lib/
│   └── queryClient.js          # Configuration du QueryClient
├── hooks/
│   ├── index.js                # Export central de tous les hooks
│   ├── useAuth.js              # Hooks d'authentification
│   ├── useUsers.js             # Hooks de gestion utilisateurs
│   ├── useTasks.js             # Hooks de gestion des tâches
│   ├── useWorkflows.js         # Hooks de gestion des workflows
│   └── useForms.js             # Hooks de gestion des formulaires
```

## ⚙️ Configuration

### QueryClient (lib/queryClient.js)

```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      cacheTime: 1000 * 60 * 30,     // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### App.jsx

```javascript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Routes */}
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 🎣 Hooks Disponibles

### Authentication (useAuth.js)

#### useLogin()
```javascript
const loginMutation = useLogin();

// Utilisation
await loginMutation.mutateAsync({ email, password });

// États
loginMutation.isLoading
loginMutation.isError
loginMutation.error
```

#### useRegister()
```javascript
const registerMutation = useRegister();
await registerMutation.mutateAsync({ username, email, password, ... });
```

#### useLogout()
```javascript
const logoutMutation = useLogout();
await logoutMutation.mutateAsync();
```

#### useCurrentUser()
```javascript
const { data: user, isLoading, error } = useCurrentUser();
```

### Users Management (useUsers.js)

#### useUsers(filters)
```javascript
const { data, isLoading } = useUsers({ 
  search: 'john', 
  status: 'approved', 
  role: 'user' 
});

// data.data.users contient le tableau d'utilisateurs
```

#### usePendingUsers()
```javascript
const { data: users, isLoading } = usePendingUsers();
```

#### useUser(userId)
```javascript
const { data: user, isLoading } = useUser(userId);
```

#### useCreateUser()
```javascript
const createMutation = useCreateUser();
await createMutation.mutateAsync(userData);
```

#### useUpdateUser()
```javascript
const updateMutation = useUpdateUser();
await updateMutation.mutateAsync({ 
  userId: 'id', 
  data: { role: 'admin' } 
});
```

#### useDeleteUser()
```javascript
const deleteMutation = useDeleteUser();
await deleteMutation.mutateAsync(userId);
```

#### useApproveUser() / useRejectUser()
```javascript
const approveMutation = useApproveUser();
await approveMutation.mutateAsync(userId);

const rejectMutation = useRejectUser();
await rejectMutation.mutateAsync(userId);
```

#### useUserStatistics()
```javascript
const { data: stats } = useUserStatistics();
```

### Tasks Management (useTasks.js)

#### useMyTasks(params)
```javascript
const { data, isLoading } = useMyTasks({ 
  status: 'pending', 
  limit: 10 
});
```

#### useTask(taskId)
```javascript
const { data: task } = useTask(taskId);
```

#### useTaskStatistics()
```javascript
const { data: stats } = useTaskStatistics();
```

#### useCompleteTask()
```javascript
const completeMutation = useCompleteTask();
await completeMutation.mutateAsync({ 
  taskId, 
  decision: 'approve', 
  data: {} 
});
```

#### useReassignTask()
```javascript
const reassignMutation = useReassignTask();
await reassignMutation.mutateAsync({ taskId, userId });
```

#### useUpdateTaskStatus()
```javascript
const updateMutation = useUpdateTaskStatus();
await updateMutation.mutateAsync({ taskId, status: 'completed' });
```

### Workflows Management (useWorkflows.js)

#### useWorkflows()
```javascript
const { data: workflows, isLoading } = useWorkflows();
```

#### useWorkflow(workflowId)
```javascript
const { data: workflow } = useWorkflow(workflowId);
```

#### useCreateWorkflow()
```javascript
const createMutation = useCreateWorkflow();
await createMutation.mutateAsync(workflowData);
```

#### useUpdateWorkflow()
```javascript
const updateMutation = useUpdateWorkflow();
await updateMutation.mutateAsync({ workflowId, data });
```

#### useDeleteWorkflow()
```javascript
const deleteMutation = useDeleteWorkflow();
await deleteMutation.mutateAsync(workflowId);
```

#### useStartWorkflow()
```javascript
const startMutation = useStartWorkflow();
await startMutation.mutateAsync({ workflowId, data });
```

#### useWorkflowInstances(workflowId)
```javascript
const { data: instances } = useWorkflowInstances(workflowId);
```

#### useWorkflowInstance(instanceId)
```javascript
const { data: instance } = useWorkflowInstance(instanceId);
```

#### useCancelWorkflowInstance()
```javascript
const cancelMutation = useCancelWorkflowInstance();
await cancelMutation.mutateAsync(instanceId);
```

### Forms Management (useForms.js)

#### useForms()
```javascript
const { data: forms } = useForms();
```

#### useForm(formId)
```javascript
const { data: form } = useForm(formId);
```

#### useCreateForm() / useUpdateForm() / useDeleteForm()
```javascript
const createMutation = useCreateForm();
const updateMutation = useUpdateForm();
const deleteMutation = useDeleteForm();
```

#### useValidateForm()
```javascript
const validateMutation = useValidateForm();
await validateMutation.mutateAsync({ formId, data });
```

## 📊 Exemples d'utilisation

### Composant avec Query
```javascript
import { useUsers } from '../hooks/useUsers';

function UserList() {
  const { data, isLoading, error } = useUsers({ status: 'approved' });
  
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  
  const users = data?.data?.users || [];
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.username}</li>
      ))}
    </ul>
  );
}
```

### Composant avec Mutation
```javascript
import { useCreateUser } from '../hooks/useUsers';
import { useNavigate } from 'react-router-dom';

function CreateUserForm() {
  const navigate = useNavigate();
  const createMutation = useCreateUser();
  
  const handleSubmit = async (data) => {
    await createMutation.mutateAsync(data);
    navigate('/users');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button 
        type="submit" 
        disabled={createMutation.isLoading}
      >
        {createMutation.isLoading ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}
```

### Invalidation de cache
```javascript
import { useQueryClient } from '@tanstack/react-query';

function Component() {
  const queryClient = useQueryClient();
  
  const handleSuccess = () => {
    // Invalide toutes les queries users
    queryClient.invalidateQueries({ queryKey: ['users'] });
    
    // Invalide une query spécifique
    queryClient.invalidateQueries({ queryKey: ['users', userId] });
  };
}
```

## 🔧 DevTools

Les React Query DevTools sont disponibles en développement. Cliquez sur l'icône flottante en bas de page pour ouvrir le panel de débogage.

**Fonctionnalités :**
- Visualiser toutes les queries et leurs états
- Voir le cache et les données
- Forcer le refetch
- Invalider le cache manuellement
- Inspecter les timers de stale/cache

## 🎯 Avantages

1. **Cache automatique** - Les données sont mises en cache et réutilisées
2. **Refetch intelligent** - Mise à jour automatique quand nécessaire
3. **Loading states** - États de chargement gérés automatiquement
4. **Error handling** - Gestion d'erreurs intégrée
5. **Optimistic updates** - Possibilité de mise à jour optimiste
6. **Deduplication** - Évite les requêtes redondantes
7. **Background refetch** - Mise à jour en arrière-plan
8. **Pagination & Infinite queries** - Support natif
9. **DevTools** - Outils de débogage puissants
10. **TypeScript** - Support TypeScript complet

## 📝 Bonnes pratiques

1. **Query Keys** - Utilisez des clés descriptives et cohérentes
   ```javascript
   ['users']                    // Liste de tous les utilisateurs
   ['users', filters]           // Liste filtrée
   ['users', userId]            // Un utilisateur spécifique
   ['users', 'statistics']      // Statistiques
   ```

2. **Invalidation** - Invalidez les queries après les mutations
   ```javascript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
   }
   ```

3. **Error handling** - Gérez les erreurs au niveau des hooks
   ```javascript
   onError: (error) => {
     toast.error(error.error || 'Une erreur est survenue');
   }
   ```

4. **Loading states** - Utilisez `isLoading` pour l'UI
   ```javascript
   if (isLoading) return <Spinner />;
   ```

5. **Enabled queries** - Désactivez les queries conditionnelles
   ```javascript
   const { data } = useUser(userId, { enabled: !!userId });
   ```

## 🚀 Migration depuis les appels API directs

### Avant (avec useState/useEffect)
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.getData();
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Après (avec React Query)
```javascript
const { data, isLoading } = useData();
```

## 📚 Ressources

- [Documentation officielle](https://tanstack.com/query/latest/docs/react/overview)
- [Exemples](https://tanstack.com/query/latest/docs/react/examples/react/simple)
- [DevTools](https://tanstack.com/query/latest/docs/react/devtools)
