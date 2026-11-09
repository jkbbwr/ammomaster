# AmmoMaster — Arma 3 & ACE3 Ballistics, Armor & Medical Damage Wizard

**Live Wizard (GitHub Pages):** [https://jkbbwr.github.io/ammomaster/](https://jkbbwr.github.io/ammomaster/)

A standalone, zero-dependency interactive ballistics, armor penetration, and ACE3 medical damage simulator & real-world round tuner built for the **Realish Antistasi Gulf (`RealishAntistasiGulfv0_3`)** mod stack plus Base Arma 3 and DLCs.

## Features

- **Scraped Local Mod Database (`arma_database.json` — Zero RHS)**:
  - **832 Rounds (`CfgAmmo` & `CfgMagazines`)**: Base Arma 3 & DLCs, ACE3, Project M, Realish Combat Armoury (Neo / Antiques / REDWEP), Arma 3 Aegis / Atlas / AddGis, JCA Arsenal, Quiggs Firearms, RKSL, QAV, USAF, AH-64D, and TBD Mortars.
  - **287 Vests (`CfgWeapons`)**: Aegis, Atlas, Project M (Ferro FCPC, Bison, JPC, TYR), JCA Equipment, AddGis, Vanilla & DLCs, Revolución, Athena.
  - **262 Helmets (`CfgWeapons`)**: Aegis, Atlas, Project M (Airframe, FTHS, Galvion, SFHC), AddGis, JCA Equipment, Vanilla & DLCs, Athena, Revolución, ACE3.
  - **168 Uniforms (`CfgWeapons` -> `CfgVehicles` `HitPoints`)**: Full 11-hitpoint character armor and passThrough configurations.
- **Authentic Base Arma 3 + ACE3 Medical Damage Pipeline**:
  - Models Vanilla Arma 3 RHAe penetration (`v_impact * caliber * 0.015 mm`), hitpoint armor, and structural damage alongside `ace_medical_engine` (`#9063` logarithmic armor scaling) and `ace_medical_damage` (`fnc_woundsHandlerArmorPenetration` Levels I–V `[6, 15, 21, 40, 55] mm` RHAe, `0.35` plate penetration threshold, wound type weighting, bleeding cardiac output, pain, fractures, vital organ hits, and Weibull trauma fatality).
- **Interactive ACE3 Medical Menu Body Dummy**:
  - Uses authentic 256×256 textures extracted from `ace_medical_gui.pbo` with live blood-loss/trauma tinting, bone fractures, tourniquets, and both deterministic 1-shot preview and stochastic multi-shot live firing range modes.
- **Intuitive Real-World Round Tuner**:
  - Built-in library of 24 real-world military/duty loads (`5.7x28mm SS190`, `M855A1`, `M80A1`, `7N22`, `7N39`, `XM1186`, `.338 LM`, etc.) with dual-unit linked inputs (`g ↔ gr`, `mm ↔ in`, `m/s ↔ fps`).
  - Solves `airFriction` and `ACE_ballisticCoefficients` from either published G1/G7 BC or downrange velocity.
  - Interactive max armor penetration distance slider with a live 5-level ACE3 armor penetration range matrix and ready-to-paste `CfgAmmo` / `CfgMagazines` `.hpp` config exporter.

## Rebuilding Locally

```bash
# 1. Re-scrape configs from local Steam Arma 3 + Workshop installation
python3 scrape_arma_configs.py

# 2. Bundle styles, database, textures, and engine into standalone index.html
python3 build_wizard.py
```
