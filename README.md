# AmmoMaster — Arma 3 & ACE3 Ballistics, Armor & Medical Damage Wizard

**Live Wizard (GitHub Pages):** [https://jkbbwr.github.io/ammomaster/](https://jkbbwr.github.io/ammomaster/)

A standalone, zero-dependency interactive ballistics, armor penetration, and ACE3 medical damage simulator & real-world round tuner built for the **Realish Antistasi Gulf (`RealishAntistasiGulfv0_3`)** mod stack plus Base Arma 3 and DLCs.

## Features

- **Scraped Local Mod Database (`arma_database.json` — Zero RHS)**:
  - **832 Rounds (`CfgAmmo` & `CfgMagazines`)**: Base Arma 3 & DLCs, ACE3, Project M, Realish Combat Armoury (Neo / Antiques / REDWEP), Arma 3 Aegis / Atlas / AddGis, JCA Arsenal, Quiggs Firearms, RKSL, QAV, USAF, AH-64D, and TBD Mortars.
  - **287 Vests (`CfgWeapons`)**: Aegis, Atlas, Project M (Ferro FCPC, Bison, JPC, TYR), JCA Equipment, AddGis, Vanilla & DLCs, Revolución, Athena.
  - **262 Helmets (`CfgWeapons`)**: Aegis, Atlas, Project M (Airframe, FTHS, Galvion, SFHC), AddGis, JCA Equipment, Vanilla & DLCs, Athena, Revolución, ACE3.
  - **168 Uniforms (`CfgWeapons` -> `CfgVehicles` `HitPoints`)**: Full 11-hitpoint character armor and passThrough configurations.
- **Validated Base Arma 3 + ACE 3.21.2 Ballistics & Medical Pipeline**:
  - Exact GNU Exterior Ballistics G1–G8 retardation curves (`ace_advanced_ballistics_fnc_calculateRetardation`) alongside vanilla exponential `airFriction`.
  - Exact `ace_medical_engine` (`fnc_getItemArmor` strict hitpoint matching & `#9063` `log10` over-cap scaling), `ace_medical_damage` (`fnc_woundsHandlerArmorPenetration` Levels I–V `[6, 15, 21, 40, 55] mm` RHAe, `0.35` plate penetration threshold, fractional wound counts, symmetric triangular `random [0.9, 1, 1.1]` wound variance), and `ace_medical_status` (`fnc_handleIncapacitation` head/penetrating-torso KO thresholds + 10% pain KO roll, `fnc_adjustPainLevel` max rule, per-limb bleeding caps, healthy `126.7 mL/s` cardiac output, and Weibull trauma fatality).
- **Interactive ACE3 Medical Menu Body Dummy**:
  - Uses authentic 256×256 textures extracted from `ace_medical_gui.pbo` with live blood-loss/trauma tinting, bone fractures, tourniquets, and both deterministic 1-shot preview and stochastic multi-shot live firing range modes.
- **Streamlined 3-Card Round & Custom Vest Balancing Workbench**:
  - **Balance vs Armor**: Target your equipped vest/helmet, standard ACE Levels I–V, or a custom mm RHAe plate; set penetration cutoff distance across 4 criteria (ACE bleed, 100% RHAe, 1-shot torso KO, heart-shot capable) and lock penetration distance while tuning terminal flesh `hit` (with Bohemia Interactive `√KE / 5` energy profiles).
  - **181-Load Real-World Cartridge Catalogue (`real_world_catalog.js`)**: Verified SAAMI/CIP/MIL-DTL/GRAU/manufacturer specs across 10 caliber families with automatic physics discrepancy detection (`initSpeed`, `typicalSpeed`, `ACE_muzzleVelocities[]`, bullet mass, G1/G7 BC), dual-unit linked inputs (`g ↔ gr`, `mm ↔ in`, `m/s ↔ fps`), and 1-click **Apply RW Spec**.
  - **Session Persistence & HEMTT-Verified Batch `.hpp` Exporter**: Drag any armor row's bar directly (`0–1000m`) to live-solve `caliber`, tune multiple rounds/vests/helmets in a single session, scale `ACE_muzzleVelocities[]` proportionally, and export topologically sorted `CfgAmmo`, real `CfgMagazines`, and `CfgWeapons` (`ItemInfo >> HitpointsProtectionInfo`) patches.

## Rebuilding Locally

```bash
# 1. Re-scrape configs from local Steam Arma 3 + Workshop installation
python3 scrape_arma_configs.py

# 2. Bundle styles, database, textures, and engine into standalone index.html
python3 build_wizard.py
```
