# Cleanup Audit

## Índice de limpeza de ambiente

- Exportações órfãs removidas: **6**.
- Arquivos removidos: **0** (nenhum arquivo estava 100% morto após validação de imports/uso).
- Escopo da varredura: `app/`, `components/`, `scripts/`, `reports/`.

## Qualidade de código

- Removidos hooks Redux não utilizados (`useAppSelector`, `useAppStore`) para reduzir superfície de API interna.
- Removido mapeamento reverso de projetos não utilizado (`projectKeyBySlug`).
- Removidos utilitários de runtime e placeholders de imagem sem consumidores no código atual.

## Testes

- `npm run type-check` executado com sucesso após limpeza.
- `npm test` executado com sucesso após limpeza.

## Documentação

- Este relatório registra o racional de limpeza e os indicadores usados para tomada de decisão.

## Métricas de desenvolvimento

- Testes unitários: **32/32** passando.
- Build safety gate mantido (script de verificação Three.js continua no projeto).
- Débito técnico reduzido por remoção de APIs internas sem uso.
