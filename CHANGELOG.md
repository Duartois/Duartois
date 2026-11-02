# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não lançado]

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
