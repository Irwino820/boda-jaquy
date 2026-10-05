# Fix: galería scroll horizontal en móvil

## Plan
- [x] Confirmar causa: Lenis + flex `min-width:auto` + transform en motion.div
- [x] Aplicar `data-lenis-prevent` (docs oficiales Lenis nested scroll)
- [x] `min-w-0` + `touch-pan-x` en la tira móvil
- [x] Separar contenedor nativo (móvil) vs motion.div (desktop)
- [x] Verificar en viewport móvil

## Review
- Overflow solo no bastaba en móvil real / DevTools.
- Fix final: drag por Pointer Events (`scrollLeft`) + `touch-action: pan-y` + `data-lenis-prevent(-touch)`.
- Verificado: mouse drag 234px y touch CDP 234px en viewport 390.
