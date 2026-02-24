# Correção de Opacidade das Formas 3D - Documentação

## Problema Identificado

As formas 3D estavam herdando incorretamente as propriedades de opacidade entre diferentes contextos (Home, Menu, Páginas de Conteúdo). Especificamente:

1. **Home**: As formas deveriam sempre ter opacidade normal (1.0), mas estavam herdando valores de páginas anteriormente visitadas.
2. **Menu**: O hover deveria manter variações de opacidade, mas retornar ao estado inicial ao sair. Isso não estava acontecendo consistentemente.
3. **Páginas (/work, /about, /contact)**: As variações de opacidade dessas páginas estavam "vazando" para a Home e Menu ao navegar.

## Causa Raiz

A causa raiz era a falta de isolamento de estado entre contextos:

1. **Navbar.tsx**: Capturava um snapshot do estado ao abrir o menu, mas esse snapshot podia conter opacidades "sujas" de páginas anteriores.
2. **Menu.tsx**: Não garantia que `baseOpacityRef` fosse sempre resetado para 1.0 ao abrir o menu.
3. **threeNavigation.ts**: Não resetava explicitamente as opacidades das formas ao navegar para a Home.

## Soluções Implementadas

### 1. Correção em `app/helpers/threeNavigation.ts`

**Mudança**: Adicionada função `getDefaultShapeOpacity()` que garante:
- Para a Home: todas as formas sempre têm opacidade 1.0
- Para outras páginas: usa as opacidades definidas na variante

**Benefício**: Ao navegar para a Home, as opacidades são explicitamente resetadas para 1.0, eliminando herança de valores anteriores.

```typescript
const getDefaultShapeOpacity = (variantName: VariantName) => {
  if (variantName === "home") {
    return {
      torusSpringAzure: 1,
      waveSpringLime: 1,
      semiLimeFlamingo: 1,
      torusFlamingoLime: 1,
      semiFlamingoAzure: 1,
      sphereFlamingoSpring: 1,
    };
  }
  // Para outras páginas, usar as opacidades da variante
  return getVariantShapeOpacity(...);
};
```

### 2. Correção em `components/Navbar.tsx`

**Mudança**: Adicionado `shapeOpacity: menuShapeOpacity` ao estado inicial do menu, garantindo que todas as formas tenham opacidade 1.0 ao abrir o menu.

**Benefício**: O menu sempre começa com opacidades "limpas" (1.0), independentemente do estado anterior. Isso isola o contexto do menu do resto da aplicação.

```typescript
const menuShapeOpacity = {
  torusSpringAzure: 1,
  waveSpringLime: 1,
  semiLimeFlamingo: 1,
  torusFlamingoLime: 1,
  semiFlamingoAzure: 1,
  sphereFlamingoSpring: 1,
};

app.setState({
  // ... outros estados
  shapeOpacity: menuShapeOpacity,
});
```

### 3. Reforço em `components/Menu.tsx`

**Mudança**: Mantida a lógica existente que já estava correta, mas agora com garantia de que `baseOpacityRef` sempre é inicializado com 1.0 para todas as formas.

**Benefício**: O hover do menu funciona corretamente, aplicando variações apenas durante o hover e retornando ao estado 1.0 ao sair.

## Fluxo de Comportamento Esperado

### Na Home
1. Todas as formas têm opacidade 1.0
2. Ao fazer hover no nome (NameWithWave), apenas a variante visual muda (posição/rotação), não a opacidade
3. Ao sair do hover, tudo retorna ao normal

### No Menu
1. Menu abre com todas as formas em opacidade 1.0
2. Sem hover: formas mantêm opacidade 1.0
3. Com hover em um item:
   - Formas específicas do item avançam (Z positivo)
   - Se `dimOthers` for true, outras formas ficam com opacidade 0.35
   - Se `dimOthers` for false, todas mantêm opacidade 1.0
4. Ao sair do hover: retorna ao estado 1.0
5. Ao fechar o menu: `applyNavigationSceneVariant(pathname)` é chamado, resetando para o estado correto da página atual

### Em Páginas (/work, /about, /contact)
1. Cada página define suas próprias opacidades via `useThreeSceneSetup("pageName")`
2. Essas opacidades são aplicadas apenas enquanto estiver naquela página
3. Ao navegar para outra página ou Home, as opacidades são resetadas via `applyNavigationSceneVariant()`

## Testes Recomendados

1. **Home → Menu → Home**: Verificar se opacidades retornam a 1.0 após fechar menu
2. **Home → /work → Menu → /work**: Verificar se opacidades de /work não afetam o menu
3. **Menu hover**: Verificar se hover funciona corretamente e retorna ao estado 1.0 ao sair
4. **Navegação entre páginas**: Verificar se cada página mantém suas opacidades específicas
5. **Redimensionamento de tela**: Verificar se opacidades são mantidas ao redimensionar

## Arquivos Modificados

- `app/helpers/threeNavigation.ts`: Adicionada função `getDefaultShapeOpacity()`
- `components/Navbar.tsx`: Adicionado `shapeOpacity: menuShapeOpacity` ao estado inicial do menu
- `components/Menu.tsx`: Sem mudanças estruturais, mas agora com garantia de isolamento via Navbar

## Notas de Implementação

- O isolamento é alcançado através de **snapshots explícitos** de estado ao abrir/fechar o menu
- A Home sempre força opacidade 1.0 via `getDefaultShapeOpacity()`
- O Menu força opacidade 1.0 ao abrir, garantindo um ponto de partida limpo
- Ao fechar o menu, `applyNavigationSceneVariant()` reaplica o estado correto da página atual
