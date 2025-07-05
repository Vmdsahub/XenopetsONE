# Sistema de Pontos Interativos dos Mundos

Este sistema permite que administradores adicionem pontos clicáveis invisíveis nas imagens dos planetas que podem ativar diferentes ações quando os usuários clicam neles.

## 📋 Funcionalidades

### Para Usuários Normais

- **Pontos invisíveis**: Os pontos são completamente invisíveis aos usuários
- **Clicáveis**: Ao clicar em um ponto, uma ação é executada (dialog, loja, etc.)
- **Feedback visual sutil**: Hover leve indica área clicável

### Para Administradores

- **Modo Admin**: Toggle para ativar/desativar modo de edição
- **Visualização dos pontos**: Pontos ficam visíveis como círculos coloridos
- **Adicionar pontos**: Click na imagem para criar novos pontos
- **Editar pontos**: Click em pontos existentes para editar
- **Controle de estado**: Ativar/desativar pontos individuais
- **Exclusão**: Remover pontos desnecessários

## 🗄️ Estrutura do Banco de Dados

### Tabela: `world_interactive_points`

```sql
- id: UUID (Primary Key)
- world_id: TEXT (Foreign Key para world_positions)
- x_percent: REAL (Posição X em percentual 0-100)
- y_percent: REAL (Posição Y em percentual 0-100)
- title: TEXT (Título do ponto)
- description: TEXT (Descrição opcional)
- action_type: TEXT (Tipo: dialog, shop, minigame, quest, teleport)
- action_data: JSONB (Dados específicos da ação)
- is_active: BOOLEAN (Se o ponto está ativo)
- created_at/updated_at: TIMESTAMP
- created_by: UUID (Quem criou o ponto)
```

## 🔧 Como Usar

### Para Administradores

1. **Entrar no planeta**: Navegue até um planeta
2. **Ativar modo admin**: Click no botão "Modo Admin"
3. **Adicionar pontos**:
   - Click em "Adicionar Ponto"
   - Click na imagem onde deseja o ponto
   - O ponto será criado automaticamente
4. **Editar pontos**:
   - Click em um ponto existente
   - Edite título, descrição, ative/desative
   - Salve as alterações
5. **Gerenciar pontos**:
   - Pontos verdes: Ativos (visíveis aos usuários)
   - Pontos vermelhos: Inativos (invisíveis aos usuários)

### Para Usuários

1. **Explorar planetas**: Entre em qualquer planeta
2. **Procurar por áreas clicáveis**: Passe o mouse pela imagem
3. **Interagir**: Click em áreas que mostram feedback visual
4. **Aproveitar o conteúdo**: Cada ponto pode ter ações diferentes

## 🎯 Tipos de Ação Suportados

- **dialog**: Exibe uma mensagem/diálogo
- **shop**: Abre uma loja específica
- **minigame**: Inicia um mini-jogo
- **quest**: Começa uma missão
- **teleport**: Transporta para outro local

## 📁 Arquivos Relacionados

### Componentes

- `src/components/Screens/PlanetScreen.tsx` - Interface principal
- `src/services/worldInteractivePointsService.ts` - Lógica de backend

### Migração

- `supabase/migrations/20250109000001_create_world_interactive_points.sql`

## 🚀 Aplicando a Migração

**Importante**: Para que o sistema funcione, é necessário aplicar a migração do banco de dados.

### Opção 1: Supabase CLI Local (se Docker estiver disponível)

```bash
cd supabase
npx supabase db reset
```

### Opção 2: Dashboard do Supabase

1. Acesse seu projeto no dashboard do Supabase
2. Vá em "SQL Editor"
3. Execute o conteúdo do arquivo `supabase/migrations/20250109000001_create_world_interactive_points.sql`

### Opção 3: Comando direto (se configurado)

```bash
npx supabase db push
```

## 🔒 Segurança

- **RLS (Row Level Security)** ativo na tabela
- **Usuários normais**: Apenas leitura de pontos ativos
- **Administradores**: Controle total sobre pontos
- **Validação**: Posições limitadas a 0-100%

## 🎨 Customização

### Estilos dos Pontos (Admin)

```css
/* Pontos ativos - Verde */
.admin-point-active {
  background: #10b981;
  border: 2px solid white;
}

/* Pontos inativos - Vermelho */
.admin-point-inactive {
  background: #ef4444;
  border: 2px solid white;
}
```

### Feedback Visual (Usuário)

```css
/* Hover sutil para usuários */
.user-point-hover {
  background: rgba(59, 130, 246, 0.2);
}
```

## 🔮 Expansões Futuras

- **Animações**: Pontos com efeitos visuais
- **Condições**: Pontos que aparecem baseado em progresso
- **Agendamento**: Pontos que ficam ativos em horários específicos
- **Recompensas**: Sistema de pontos com premiações
- **Mapas de calor**: Analytics de cliques dos usuários

---

**Sistema desenvolvido para aprimorar a experiência interativa dos mundos em Xenopets** 🌍✨
