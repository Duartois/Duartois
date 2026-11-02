# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não lançado]

### Navegação contínua

- O fundo 3D é o mesmo canvas durante todo o uso e só se reajusta a cada página: as formas seguem uma mola amortecida (`components/three/motion.ts`) em vez de interpolação por frame, retomam de onde estão se o destino muda no meio do caminho e não dão mais "snap" na troca de rota (`useThreeSceneSetup` só ajusta direto no primeiro paint e no resize).
- Opacidade e blur das formas agora fazem transição junto com o movimento, em vez de trocar de uma vez.
- Materiais sempre `transparent` (visual idêntico com alpha 1) para nunca trocar de programa de shader durante a navegação; formas com opacidade 0 deixam de ser desenhadas.
- O estado de saída só é liberado quando a nova rota realmente monta (`APP_ROUTE_COMMIT_EVENT`), com limite de 4 s. Antes era 2 frames após o `router.push`, e com resposta lenta a página antiga voltava a aparecer antes da nova.
- Prefetch por intenção (`prefetchRoute`): sem prefetch automático nos links de projeto, home, menu e logo; as rotas principais são pré-carregadas uma vez, em idle. Ao abrir `/work` caíram de 17 para 6 requisições RSC e abrir o menu deixou de disparar uma renderização de servidor por projeto.
- Corrigido vazamento de listeners em `useMenuFallAnimation` (o cleanup registrava em vez de remover).
- `resize` da cena não puxa mais as formas para o layout da Home.

### Presets de animação

- `app/helpers/motionPresets.ts` concentra o que muda entre os níveis `high` e `low` (tempo de transição da cena, ritmo de frames, resolução, geometria, blur nos itens que caem, `will-change`). O nível é exposto em `<html data-motion>` e o CSS leve (sem blur animado nas imagens de projeto) o segue.
- Se os frames continuarem lentos, a cena avisa e o app inteiro passa para o preset `low` pelo resto da sessão.
- Lenis agora só roda `requestAnimationFrame` enquanto há rolagem, em vez de um loop permanente.

### Desempenho

- Geometria 3D indexada e com tesselação por nível de dispositivo (`components/three/geometry.ts`): de ~374 mil triângulos / 1,12 milhão de vértices / 47 MB para ~40 mil triângulos / ~22 mil vértices / ~1 MB no nível `low`, sem mudança visível nas formas e cores.
- Loop de renderização 3D com ritmo adaptativo: ~60 fps só enquanto algo se move, batida lenta (~20 fps) quando a Home está parada e nenhum frame nas páginas com blur de 60px (About, Contact, Work, Project) quando a cena assenta.
- Resolução do canvas reduzida para 1× nas páginas com blur (o blur esconde o detalhe), teto de 1,5× no nível `low` e redução automática de resolução se os frames ficarem lentos.
- Camada de grão (`.noise`) passou de 600% × 600% da tela para tela + 200px, com o filtro de contraste embutido nas texturas `noise-light.png` / `noise-dark.png` (6 KB cada, antes 107 KB) e animação pausada onde o blur a esconde.
- Cursor customizado deixa de rodar `requestAnimationFrame` quando alcança o ponteiro.
- `materialOpacity` só pede recompilação de shader quando `transparent` realmente muda.

## [1.1.0] - 2026-02-23

### Adicionado

- Configuração de ESLint e Prettier para automação de qualidade.
- Husky e lint-staged para verificações pré-commit.
- Arquivos de documentação: LICENSE, CONTRIBUTING.md e CHANGELOG.md.

### Alterado

- Atualizada a documentação da stack tecnológica no README.md.
- Alinhadas as versões de tipos do Three.js.
- Melhorado o arquivo .gitignore.

### Removido

- Dependência inutilizada `next-cloudinary`.
