# Đảo Đèn Lồng

- Phase 1 requirements: docs/spec/prd_0_phase_1.md; exact contract: game.contract.json.
- Runtime: Node.js >= 22; browser WebGL. `npm ci`, `npm run build`, `npm start`.
- Simulation is src/game.mjs, shared by browser and headless. 60 fixed steps/second; no renderer imports in simulation.
- Keep runtime tuning identical to game.contract.json; tests enforce this.
- `npm test` checks mechanics/CLI; `npm run verify` records actual tests and reproducibility evidence.
- Before completing any change, run `npm run verify` and `npm run build`. Never mark passing when commands fail.
- Preserve scenario tick-zero state, sticky inputs and rising-edge actions. Use XZ distances and inclusive radii.
- No fake evidence, manual output edits, secrets, or unlicensed assets. Do not alter past phase tags.
- Review changes against requirements and record unverified items honestly in docs/notes/phase-1.md.
