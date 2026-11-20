# Đảo Đèn Lồng

- Phase 2 requirements: docs/spec/ticket_02_phase_2.md (supersedes Phase 1 tuning); exact contract v1.1: game.contract.json.
- Runtime: Node.js >= 22; browser WebGL. `npm ci`, `npm run build`, `npm start`.
- Simulation is src/game.mjs, shared by browser and headless. 60 fixed steps/second; no renderer imports in simulation.
- Keep runtime tuning identical to game.contract.json; tests enforce this.
- `npm test` checks mechanics/CLI; `npm run verify` records actual tests and reproducibility evidence.
- Before completing any change, run `npm run verify` and `npm run build`. Never mark passing when commands fail.
- Preserve scenario tick-zero state, sticky inputs and rising-edge actions. Use XZ distances and inclusive radii.
- Phase 2 exceptions: pickups/hits have height gates; pulse uses 3D distance from feet +0.8. Enforce the 12-stage tick order in Ticket 02.
- Pause advances tick only; all gameplay counters/spawn use sim_tick. Never drive simulation with wall-clock time.
- Maps and terrain: src/maps.mjs. Controls must follow actual camera axes; test projected A/D at multiple headings.
- Preserve phase-1 evidence. Record changed old tests and reasons in docs/notes/phase-2.md; store fresh proof under phase-2.
- UI checks must distinguish user feedback from agent observation. Measure actual FPS at 1280x720; never infer FPS from headless speed.
- No fake evidence, manual output edits, secrets, or unlicensed assets. Do not alter past phase tags.
- Review changes against requirements and record unverified items honestly in docs/notes/phase-2.md.
