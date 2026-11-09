#!/usr/bin/env python3
"""
Builds the standalone single-file HTML wizard (`index.html`) by combining:
  - wizard_styles.css
  - arma_database.json (scraped local Arma 3 + DLCs + RealishAntistasiGulfv0_3.html mod list, zero RHS)
  - ace_body_textures.json (authentic 21 ACE3 Medical GUI body dummy textures)
  - wizard_engine.js
"""
import json
import os

ROOT = "/home/kibb/projects/personal/ammomaster"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AmmoMaster — Arma 3 &amp; ACE3 Ballistics, Armor &amp; Medical Damage Wizard</title>
  <style>
__STYLES__
  </style>
</head>
<body>

  <!-- Top Header -->
  <header class="app-header">
    <div class="brand">
      <span class="brand-badge">AMMOMASTER // A3+ACE3</span>
      <h1>Arma 3 Ballistics, Armor &amp; ACE3 Medical Damage Wizard</h1>
      <span class="brand-sub">RealishAntistasiGulfv0_3 Mod List + Base Arma 3 &amp; DLCs (ACE3, Aegis, Atlas, Athena, Revolución, JCA, Project M, Quiggs, Realish Armoury)</span>
    </div>
    <div class="header-stats">
      <span class="stat-pill"><strong id="hdrRoundsCount">0</strong> Rounds</span>
      <span class="stat-pill"><strong id="hdrVestsCount">0</strong> Vests</span>
      <span class="stat-pill"><strong id="hdrHelmetsCount">0</strong> Helmets</span>
      <span class="stat-pill"><strong id="hdrUniformsCount">0</strong> Uniforms</span>
    </div>
  </header>

  <!-- Main 3-Column Workspace -->
  <main class="workspace">

    <!-- COLUMN 1: Round & Armor Loadout Configurator -->
    <section class="col">

      <!-- Round Config Panel -->
      <div class="panel">
        <div class="panel-header">
          <span>1. Round Configuration (CfgAmmo &amp; CfgMagazines)</span>
          <span class="tag" id="roundCountBadge">576 rounds</span>
        </div>
        <div class="panel-body">
          <div class="control-row">
            <div class="field">
              <label>Filter by Mod</label>
              <select id="roundModFilter"></select>
            </div>
            <div class="field">
              <label>Search Round / Caliber</label>
              <input type="text" id="roundSearch" placeholder="e.g. M855A1, 7N22, .338, AP..." />
            </div>
          </div>

          <div class="field">
            <label>Scraped Arma 3 Round Preset</label>
            <select id="roundSelect"></select>
          </div>

          <div class="field" id="barrelSelectWrap" style="display:none;">
            <label>ACE3 Barrel Length Velocity Override <code>ACE_barrelLengths</code></label>
            <select id="barrelLengthSelect"></select>
          </div>

          <div class="control-row">
            <div class="field">
              <label>Class Name <code>CfgAmmo</code></label>
              <input type="text" id="inpRoundClass" />
            </div>
            <div class="field">
              <label>ACE Damage Type <code>ACE_damageType</code></label>
              <select id="inpDamageType">
                <option value="bullet">bullet (Armor Pen + Velocity/Avulsion/Contusion)</option>
                <option value="grenade">grenade</option>
                <option value="explosive">explosive</option>
                <option value="shell">shell</option>
              </select>
            </div>
          </div>

          <div class="control-row-3">
            <div class="field">
              <label>Base Hit <code>hit</code></label>
              <input type="number" id="inpHit" step="0.1" />
            </div>
            <div class="field">
              <label>Pen Multiplier <code>caliber</code></label>
              <input type="number" id="inpCaliber" step="0.05" />
            </div>
            <div class="field">
              <label>Muzzle Vel (m/s) <code>initSpeed</code></label>
              <input type="number" id="inpInitSpeed" step="5" />
            </div>
          </div>

          <div class="control-row-3">
            <div class="field">
              <label>Ref Vel (m/s) <code>typicalSpeed</code></label>
              <input type="number" id="inpTypicalSpeed" step="5" />
            </div>
            <div class="field">
              <label>Drag <code>airFriction</code></label>
              <input type="number" id="inpAirFriction" step="0.00005" />
            </div>
            <div class="field">
              <label>DeflectDeg <code>deflecting</code></label>
              <input type="number" id="inpDeflecting" step="1" />
            </div>
          </div>

          <div class="control-row-3">
            <div class="field">
              <label>Bullet Mass (g) <code>ACE_bulletMass</code></label>
              <input type="number" id="inpAceMass" step="0.1" />
            </div>
            <div class="field">
              <label>Diameter (mm) <code>ACE_caliber</code></label>
              <input type="number" id="inpAceCaliber" step="0.05" />
            </div>
            <div class="field">
              <label>BC / Drag <code>ACE_BC</code></label>
              <div style="display:flex;gap:4px;">
                <input type="number" id="inpAceBC" step="0.01" style="width:62%;" />
                <select id="inpAceDrag" style="width:38%;">
                  <option value="1">G1</option>
                  <option value="7">G7</option>
                </select>
              </div>
            </div>
          </div>

          <input type="hidden" id="inpExplosive" value="0" />

          <div class="btn-row" style="justify-content:space-between;margin-top:2px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-dim);cursor:pointer;">
              <input type="checkbox" id="chkAdvBallistics" />
              Use ACE3 G1/G7 Drag Curve
            </label>
            <button type="button" id="btnResetRound">Reset to Scraped Preset</button>
          </div>
        </div>
      </div>

      <!-- Armor Config Panel -->
      <div class="panel">
        <div class="panel-header">
          <span>2. Target Armor Configuration (Vest, Helmet &amp; Uniform)</span>
          <span class="tag">CfgWeapons / CfgVehicles</span>
        </div>
        <div class="panel-body">

          <!-- Vest -->
          <div class="field">
            <label>Vest Preset (Filter by Mod &amp; Search)</label>
            <div class="control-row" style="margin-bottom:4px;">
              <select id="vestModFilter"></select>
              <input type="text" id="vestSearch" placeholder="Search vest (e.g. PlateCarrier, 6B45, Osprey)..." />
            </div>
            <select id="vestSelect"></select>
          </div>

          <!-- Helmet -->
          <div class="field">
            <label>Helmet / Headgear Preset</label>
            <div class="control-row" style="margin-bottom:4px;">
              <select id="helmetModFilter"></select>
              <input type="text" id="helmetSearch" placeholder="Search helmet (e.g. ECH, Altyn, OpsCore)..." />
            </div>
            <select id="helmetSelect"></select>
          </div>

          <!-- Uniform -->
          <div class="field">
            <label>Uniform / Base Soldier HitPoints Preset</label>
            <div class="control-row" style="margin-bottom:4px;">
              <select id="uniformModFilter"></select>
              <input type="text" id="uniformSearch" placeholder="Search uniform (e.g. Combat, Viper, Gorka)..." />
            </div>
            <select id="uniformSelect"></select>
          </div>

          <!-- Active Hitpoint Live Armor Override -->
          <div style="border-top:1px solid var(--border);padding-top:8px;margin-top:2px;">
            <div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:6px;">
              Selected Hitpoint Live Armor Editor (Overrides Active Hitzone)
            </div>
            <div class="control-row-3">
              <div class="field">
                <label>Vest <code>armor</code></label>
                <input type="number" id="inpVestHpArmor" step="1" />
              </div>
              <div class="field">
                <label>Vest <code>passThrough</code></label>
                <input type="number" id="inpVestHpPass" step="0.05" min="0.1" max="1" />
              </div>
              <div class="field">
                <label>Helm <code>armor</code></label>
                <input type="number" id="inpHelmHpArmor" step="1" />
              </div>
            </div>
            <div class="control-row-3" style="margin-top:6px;">
              <div class="field">
                <label>Helm <code>passThrough</code></label>
                <input type="number" id="inpHelmHpPass" step="0.05" min="0.1" max="1" />
              </div>
              <div class="field">
                <label>Unit <code>armor</code></label>
                <input type="number" id="inpUnitBaseArmor" step="0.5" />
              </div>
              <div class="field">
                <label>HP Mult <code>hp.armor</code></label>
                <input type="number" id="inpHpMult" step="0.5" />
              </div>
            </div>
            <input type="hidden" id="inpUnitStructural" value="4" />
            <input type="hidden" id="inpHpPass" value="0.8" />
          </div>

        </div>
      </div>

    </section>

    <!-- COLUMN 2: Engagement Range, Hitzone Selector & Authentic ACE3 Medical Dummy -->
    <section class="col">

      <!-- Range & Target Hitzone Panel -->
      <div class="panel">
        <div class="panel-header">
          <span>3. Engagement Range &amp; Target Hitzone</span>
          <span class="tag">Click Dummy or Hitzone</span>
        </div>
        <div class="panel-body">

          <div class="field">
            <label>
              <span>Engagement Distance (Meters)</span>
              <span style="display:flex;align-items:center;gap:6px;">
                <input type="number" id="rangeInput" value="100" min="0" max="2500" step="10" style="width:76px;padding:2px 6px;text-align:right;" /> m
              </span>
            </label>
            <input type="range" id="rangeSlider" min="0" max="1500" step="5" value="100" />
            <div class="quick-ranges">
              <button type="button" class="quick-range-btn" data-range="0">0m (PB)</button>
              <button type="button" class="quick-range-btn" data-range="50">50m</button>
              <button type="button" class="quick-range-btn" data-range="100">100m</button>
              <button type="button" class="quick-range-btn" data-range="200">200m</button>
              <button type="button" class="quick-range-btn" data-range="300">300m</button>
              <button type="button" class="quick-range-btn" data-range="500">500m</button>
              <button type="button" class="quick-range-btn" data-range="800">800m</button>
              <button type="button" class="quick-range-btn" data-range="1000">1000m</button>
            </div>
          </div>

          <div class="control-row">
            <div class="field">
              <label>Impact Obliquity Angle (deg)</label>
              <input type="number" id="inpImpactAngle" value="0" min="0" max="80" step="5" />
            </div>
            <div class="field">
              <label>ACE Trauma Threshold <code>playerDamageThreshold</code></label>
              <input type="number" id="inpDamageThreshold" value="1.0" min="0.2" max="10" step="0.1" />
            </div>
          </div>

          <div class="field">
            <label>
              <span>Arma 3 Character HitPoint (11 Engine HitPoints)</span>
              <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                <input type="checkbox" id="chkAceArmorPen" checked />
                <code>ACE_alternateArmorPenetration</code>
              </label>
            </label>
            <div class="hitzone-grid" id="hitzoneGrid"></div>
          </div>

        </div>
      </div>

      <!-- Authentic ACE3 Medical Menu Dummy Panel -->
      <div class="panel">
        <div class="panel-header">
          <span>4. ACE3 Medical Interface &amp; Interactive Wound Dummy</span>
          <span class="tag" id="aceDummyModeLabel">1-SHOT PREVIEW</span>
        </div>
        <div class="panel-body">

          <div class="ace-medical-container">
            <div class="ace-dummy-wrap" title="Click any body part on the ACE3 dummy to target that hitzone">
              <canvas id="aceBodyCanvas" width="256" height="256"></canvas>
              <div class="dummy-part-label">
                <span>ACE3 GUI</span>
                <span id="aceDummyShotsLabel">Shots: 1</span>
              </div>
            </div>

            <div class="ace-status-box">
              <div>
                <div class="ace-injury-header">PATIENT INJURIES &amp; VITALS</div>
                <ul class="ace-injury-list" id="aceInjuryList"></ul>
              </div>
              <div class="ace-triage-bar" id="aceTriageBar">NO INJURIES</div>
            </div>
          </div>

          <!-- Interactive Firing Range & Medical Controls -->
          <div class="btn-row" style="justify-content:space-between;">
            <button type="button" class="primary" id="btnFireShot" title="Simulate firing a live round with stochastic ACE wound rolls onto the dummy">
              Fire 1 Shot (Live Roll)
            </button>
            <button type="button" id="btnFireBurst" title="Simulate a 3-round burst onto the selected hitzone">
              Fire 3-Rnd Burst
            </button>
            <button type="button" id="btnApplyTourniquet" title="Toggle ACE Tourniquet on selected limb">
              Tourniquet
            </button>
            <button type="button" id="btnApplyBandage" title="Bandage open wounds &amp; splint fracture on selected body part">
              Bandage / Splint
            </button>
            <button type="button" class="danger" id="btnResetDummy" title="Return to deterministic 1-shot preview">
              Reset
            </button>
          </div>

        </div>
      </div>

    </section>

    <!-- COLUMN 3: Telemetry KPIs, Tabs (Charts, Real-World Tuner, All-Hitzones Table, Config Exporter) -->
    <section class="col">

      <!-- Top 4 KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-title">Impact Velocity &amp; KE</span>
          <span class="kpi-value" id="kpiVelocity">0 m/s</span>
          <span class="kpi-sub" id="kpiVelocitySub">KE: 0 J | ToF: 0.00s</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Arma 3 RHAe Penetration</span>
          <span class="kpi-value" id="kpiRhaPen" style="color:var(--accent);">0.0 mm</span>
          <span class="kpi-sub" id="kpiRhaPenSub">vs Armor Level</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">ACE3 Wound Damage</span>
          <span class="kpi-value" id="kpiAceDamage">0.000</span>
          <span class="kpi-sub" id="kpiAceDamageSub">Plate Threshold: 0.35</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">1-Shot Fatal Prob (ACE)</span>
          <span class="kpi-value" id="kpiLethality">0.0%</span>
          <span class="kpi-sub" id="kpiLethalitySub">Vanilla Dmg: 0.00</span>
        </div>
      </div>

      <!-- Tabbed Analysis & Tuning Panel -->
      <div class="panel" style="flex:1;display:flex;flex-direction:column;">
        <div class="tabs-nav">
          <button type="button" class="tab-btn active" data-tab="tabCharts">Ballistics &amp; Damage Curves</button>
          <button type="button" class="tab-btn" data-tab="tabTuner">Real-World Round Tuner</button>
          <button type="button" class="tab-btn" data-tab="tabHitzones">All 11 Hitzones Matrix</button>
          <button type="button" class="tab-btn" data-tab="tabExport">Export CfgAmmo (.hpp)</button>
        </div>

        <!-- TAB 1: Ballistics & Damage Curves + Step-by-Step Pipeline -->
        <div class="tab-pane active" id="tabCharts">
          <div class="charts-grid">
            <div class="chart-box">
              <div class="chart-title">
                <span>1. Velocity Decay vs Range (m/s)</span>
                <span style="color:#38bdf8;">Solid: Current | Dashed: Preset</span>
              </div>
              <canvas id="chartVelocity" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>2. RHAe Penetration vs ACE Plate Thickness (mm)</span>
                <span style="color:#eab308;">Orange Line: Target Plate RHAe</span>
              </div>
              <canvas id="chartPenetration" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>3. ACE Wound Damage vs Penetration Threshold (0.35)</span>
                <span style="color:#ef4444;">Red: ACE | Dashed Purple: Vanilla</span>
              </div>
              <canvas id="chartAceDamage" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>4. Expected ACE Bleeding Rate vs Range (Cardiac Output)</span>
                <span style="color:#f43f5e;">Drops to 0 when stopped by plate!</span>
              </div>
              <canvas id="chartBleed" class="chart-canvas"></canvas>
            </div>
          </div>

          <!-- Exact Engine & ACE3 Math Pipeline Breakdown -->
          <div class="pipeline-steps">
            <div class="step-card">
              <h4><span>Base Arma 3 Engine Pipeline</span> <span>CfgAmmo / HitPoints</span></h4>
              <div class="formula-line"><span>Muzzle Velocity (v0):</span> <strong id="fV0">-</strong></div>
              <div class="formula-line"><span>Impact Velocity (v_imp * cos θ):</span> <strong id="fVImpact">-</strong></div>
              <div class="formula-line"><span>RHAe Penetration (v * caliber * 15):</span> <strong id="fRhaPen">-</strong></div>
              <div class="formula-line"><span>Raw Kinetic Hit (hit * v / typicalSpeed):</span> <strong id="fRawHit">-</strong></div>
              <div class="formula-line"><span>Total Vanilla Hitpoint Armor:</span> <strong id="fVanArmor">-</strong></div>
              <div class="formula-line"><span>Vanilla Hitpoint / Structural Dmg:</span> <strong id="fVanDmg">-</strong></div>
            </div>
            <div class="step-card">
              <h4><span>ACE3 Medical Engine &amp; Damage Pipeline</span> <span>ace_medical_damage</span></h4>
              <div class="formula-line"><span>ACE Scaled Armor (#9063 log10 cap):</span> <strong id="fAceArmor">-</strong></div>
              <div class="formula-line"><span>ACE Armor Plate Level &amp; RHAe:</span> <strong id="fAceLevel">-</strong></div>
              <div class="formula-line"><span>Post-Armor Final Damage:</span> <strong id="fAceFinalDmg">-</strong></div>
              <div class="formula-line"><span>Wound Type Distribution:</span> <strong id="fAceWoundProbs">-</strong></div>
              <div class="formula-line"><span>Expected Bleed &amp; Pain:</span> <strong id="fAceBleedPain">-</strong></div>
              <div class="formula-line"><span>Fatal Organ / Weibull Trauma Prob:</span> <strong id="fAceFatal">-</strong></div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Real-World Performance Tuner -->
        <div class="tab-pane" id="tabTuner">

          <!-- Top Bar: Real-World Cartridge Library & Live Sync -->
          <div class="tuner-top-bar">
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:300px;">
              <label style="font-size:11.5px;font-weight:700;color:var(--accent);white-space:nowrap;">
                Real-World Reference Load:
              </label>
              <select id="rwPresetSelect" style="flex:1;"></select>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <label style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--text);cursor:pointer;">
                <input type="checkbox" id="chkRwLiveSync" checked />
                Live-Apply as You Tune
              </label>
              <button type="button" id="btnRwPullCurrent" title="Load values from the currently active Arma 3 round">
                Load Active Round
              </button>
            </div>
          </div>

          <div class="pipeline-steps">

            <!-- LEFT CARD: Projectile Specs & External Ballistics (Drag / Velocity) -->
            <div class="tuner-box">
              <h4>
                <span>1. Projectile &amp; External Ballistics (Velocity &amp; Drag)</span>
                <span class="badge badge-blue" id="rwMuzzleEnergyBadge">KE: 0 J (0 ft-lbs)</span>
              </h4>

              <!-- Dual-Unit Projectile Mass & Diameter -->
              <div class="control-row">
                <div class="field">
                  <label>Bullet Mass (Grams &#8596; Grains)</label>
                  <div class="dual-input-group">
                    <div class="unit-input-wrap">
                      <input type="number" id="rwBulletMass" value="4.02" step="0.05" min="0.2" />
                      <span class="unit-tag">g</span>
                    </div>
                    <div class="unit-input-wrap">
                      <input type="number" id="rwBulletGrains" value="62.0" step="1" min="3" />
                      <span class="unit-tag">gr</span>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <label>Bullet Diameter (mm &#8596; Caliber in)</label>
                  <div class="dual-input-group">
                    <div class="unit-input-wrap">
                      <input type="number" id="rwBulletDiam" value="5.70" step="0.05" min="2" />
                      <span class="unit-tag">mm</span>
                    </div>
                    <div class="unit-input-wrap">
                      <input type="number" id="rwBulletInches" value="0.224" step="0.002" min="0.08" />
                      <span class="unit-tag">in</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dual-Unit Muzzle Velocity -->
              <div class="field">
                <label>
                  <span>Muzzle Velocity <code>initSpeed</code> / <code>typicalSpeed</code></span>
                  <span id="rwVelocitySubLabel" style="font-family:var(--font-mono);color:var(--accent);">884 m/s</span>
                </label>
                <div class="dual-input-group">
                  <div class="unit-input-wrap">
                    <input type="number" id="rwMuzzleVel" value="884" step="5" min="50" max="2000" />
                    <span class="unit-tag">m/s</span>
                  </div>
                  <div class="unit-input-wrap">
                    <input type="number" id="rwMuzzleFps" value="2900" step="15" min="160" max="6500" />
                    <span class="unit-tag">fps</span>
                  </div>
                </div>
              </div>

              <!-- Drag Solver Mode Toggle: BC vs Downrange Velocity -->
              <div class="field">
                <label>How do you want to specify Downrange Drag (<code>airFriction</code>)?</label>
                <div class="mode-switch">
                  <button type="button" id="btnDragModeBC" class="active">From Ballistic Coefficient (G1 / G7)</button>
                  <button type="button" id="btnDragModeVel">From Known Downrange Velocity</button>
                </div>
              </div>

              <!-- Mode A: Published BC -->
              <div id="rwDragPanelBC" class="control-row">
                <div class="field">
                  <label>Published Ballistic Coefficient <code>ACE_BC</code></label>
                  <input type="number" id="rwInputBC" value="0.304" step="0.005" min="0.04" max="1.5" />
                </div>
                <div class="field">
                  <label>Drag Standard <code>ACE_dragModel</code></label>
                  <select id="rwInputDragModel">
                    <option value="1">G1 Standard (Flat-Base / Typical Factory Spec)</option>
                    <option value="7">G7 Long Boat-Tail (VLD / Match / Military FMJ-BT)</option>
                  </select>
                </div>
              </div>

              <!-- Mode B: Known Downrange Velocity -->
              <div id="rwDragPanelVel" class="control-row" style="display:none;">
                <div class="field">
                  <label>Reference Range (Meters)</label>
                  <div class="unit-input-wrap">
                    <input type="number" id="rwRefDist" value="200" step="25" min="25" max="1500" />
                    <span class="unit-tag">m</span>
                  </div>
                </div>
                <div class="field">
                  <label>Velocity @ Ref Range (m/s &#8596; fps)</label>
                  <div class="dual-input-group">
                    <div class="unit-input-wrap">
                      <input type="number" id="rwRefVel" value="690" step="5" min="30" />
                      <span class="unit-tag">m/s</span>
                    </div>
                    <div class="unit-input-wrap">
                      <input type="number" id="rwRefFps" value="2264" step="15" min="100" />
                      <span class="unit-tag">fps</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Solved Drag Summary + Mini Downrange Ballistics Table -->
              <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;padding:6px 8px;">
                <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:10.5px;margin-bottom:4px;">
                  <span>Solved <code>airFriction</code>: <strong id="rwSolvedAfLabel" style="color:var(--accent);">-0.001200</strong></span>
                  <span>Solved <code>BC</code>: <strong id="rwSolvedBcLabel" style="color:#38bdf8;">0.304 (G1)</strong></span>
                </div>
                <table class="mini-traj-table">
                  <thead>
                    <tr>
                      <th>Range</th>
                      <th>Velocity (m/s)</th>
                      <th>Velocity (fps)</th>
                      <th>Energy (J)</th>
                      <th>Flight Time</th>
                    </tr>
                  </thead>
                  <tbody id="rwTrajTableBody"></tbody>
                </table>
              </div>
            </div>

            <!-- RIGHT CARD: Armor Penetration & Terminal Lethality Solver -->
            <div class="tuner-box">
              <h4>
                <span>2. Armor Penetration &amp; Terminal Lethality</span>
                <span class="badge badge-amber" id="rwSolvedCalHitBadge">hit: 8.0 | cal: 1.00</span>
              </h4>

              <!-- Flesh / Base Hit Calibration -->
              <div class="field">
                <label>
                  <span>Unarmored Flesh Lethality (Base <code>hit</code>)</span>
                  <span id="rwUnarmoredStkBadge" class="badge badge-red">Unarmored Torso: ~2 shots</span>
                </label>
                <div class="control-row" style="margin-bottom:4px;">
                  <select id="rwProjectileProfile">
                    <option value="1.00">Auto from Muzzle Energy — Standard FMJ / Ball (1.00x)</option>
                    <option value="0.88">Auto from Muzzle Energy — Hard AP / Steel Penetrator (0.88x flesh)</option>
                    <option value="1.12">Auto from Muzzle Energy — EPR / Open-Tip / Tumbling (1.12x flesh)</option>
                    <option value="1.25">Auto from Muzzle Energy — JHP / Expanding / Fragmenting (1.25x flesh)</option>
                    <option value="manual">Manual 'hit' Override (Use Slider Below)</option>
                  </select>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <input type="range" id="rwHitSlider" min="2" max="35" step="0.2" value="8.5" style="flex:1;" />
                    <input type="number" id="rwHitInput" min="1" max="100" step="0.2" value="8.5" style="width:64px;text-align:right;" />
                  </div>
                </div>
              </div>

              <!-- Armor Penetration Goal Selector -->
              <div class="field">
                <label>Highest Armor Level This Round Should Penetrate</label>
                <select id="rwArmorGoalLevel">
                  <option value="0">Unarmored Only — Stopped by Level I Soft Armor @ 0m (Contusion Only)</option>
                  <option value="1">ACE Level I — Light Soft Armor / Pistol Vest (6 mm RHAe)</option>
                  <option value="2">ACE Level II — NIJ IIIA / CRISAT Soft + Titanium (15 mm RHAe)</option>
                  <option value="3" selected>ACE Level III — NIJ III Mild Steel Rifle Plate (21 mm RHAe)</option>
                  <option value="4">ACE Level IV — NIJ IV Ceramic ESAPI Plate (40 mm RHAe)</option>
                  <option value="5">ACE Level V — Heavy Spec-Ops / EOD Plate (55 mm RHAe)</option>
                  <option value="active">Equipped Vest / Helmet on Active Hitzone</option>
                </select>
              </div>

              <!-- Max Penetration Distance Slider -->
              <div class="field" id="rwMaxPenDistField">
                <label>
                  <span>Max Penetration Distance Against Selected Armor</span>
                  <span style="display:flex;align-items:center;gap:4px;">
                    <input type="number" id="rwArmorMaxDist" value="150" min="0" max="1500" step="10" style="width:68px;padding:2px 5px;text-align:right;" />
                    <span>m</span>
                  </span>
                </label>
                <input type="range" id="rwArmorMaxDistSlider" min="0" max="800" step="5" value="150" />
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
                  <span>0m (Point Blank)</span>
                  <span>100m</span>
                  <span>200m</span>
                  <span>400m</span>
                  <span>600m</span>
                  <span>800m</span>
                </div>
              </div>

              <!-- Penetration Criterion -->
              <div class="field">
                <label>Penetration Threshold Definition</label>
                <select id="rwPenCriterion">
                  <option value="ace_bleed" selected>ACE3 Plate Bleed Threshold (dmg &gt; 0.35 — Penetrates Plate &amp; Causes Bleeding out to Range)</option>
                  <option value="rha_100">100% Raw RHAe Match (v * caliber * 0.015 == Plate RHAe mm at Range)</option>
                </select>
              </div>

              <!-- Live 5-Level Armor Penetration Range Matrix -->
              <div style="margin-top:2px;">
                <div style="display:flex;justify-content:space-between;font-size:10.5px;font-weight:600;color:var(--text-dim);margin-bottom:4px;">
                  <span>Live ACE3 Armor Penetration Range Matrix</span>
                  <span style="font-family:var(--font-mono);color:var(--text-muted);">Max Range Before Plate Stops Round</span>
                </div>
                <div class="pen-matrix-list" id="rwPenMatrixContainer"></div>
              </div>

            </div>

          </div>

          <!-- Bottom Bar: Before vs After Config Diff & Quick Actions -->
          <div class="tuner-diff-bar">
            <div class="diff-pills" id="rwDiffPills"></div>
            <div class="btn-row">
              <button type="button" class="primary" id="btnRwApplyAll">Apply Tuned Values</button>
              <button type="button" id="btnRwJumpExport">View CfgAmmo (.hpp)</button>
              <button type="button" class="danger" id="btnRwReset">Reset to Scraped Preset</button>
            </div>
          </div>

        </div>

        <!-- TAB 3: All 11 Hitzones Matrix -->
        <div class="tab-pane" id="tabHitzones">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Arma 3 HitPoint (ACE Part)</th>
                  <th>Armor (Van / ACE)</th>
                  <th>ACE Plate Level</th>
                  <th>Vanilla Dmg</th>
                  <th>ACE Final Dmg</th>
                  <th>Plate Status</th>
                  <th style="text-align:left;">Primary ACE Wound</th>
                  <th>Bleed (CO)</th>
                  <th>1-Shot Fatal (STK)</th>
                </tr>
              </thead>
              <tbody id="allHitzonesTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- TAB 4: Export CfgAmmo / CfgMagazines -->
        <div class="tab-pane" id="tabExport">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:var(--text-dim);">
              Ready-to-use Arma 3 &amp; ACE3 <code>CfgAmmo</code> and <code>CfgMagazines</code> patch with original scraped values in comments:
            </span>
            <button type="button" class="primary" id="btnCopyConfig">Copy Config (.hpp)</button>
          </div>
          <pre class="config-export" id="configExportPre"></pre>
        </div>

      </div>

    </section>

  </main>

  <script>
const ARMA_DATABASE = __ARMA_DATABASE__;
const ACE_BODY_TEXTURES = __ACE_BODY_TEXTURES__;
__ENGINE_JS__
  </script>
</body>
</html>
"""

def main():
    with open(os.path.join(ROOT, "wizard_styles.css")) as f:
        styles = f.read()
    with open(os.path.join(ROOT, "wizard_engine.js")) as f:
        engine_js = f.read()
    with open(os.path.join(ROOT, "arma_database.json")) as f:
        db = json.load(f)
    with open(os.path.join(ROOT, "ace_body_textures.json")) as f:
        textures = json.load(f)

    db_min = json.dumps(db, separators=(",", ":"))
    tex_min = json.dumps(textures, separators=(",", ":"))

    html = (
        HTML_TEMPLATE
        .replace("__STYLES__", styles)
        .replace("__ARMA_DATABASE__", db_min)
        .replace("__ACE_BODY_TEXTURES__", tex_min)
        .replace("__ENGINE_JS__", engine_js)
    )

    out_path = os.path.join(ROOT, "index.html")
    with open(out_path, "w") as f:
        f.write(html)
    print(f"Built standalone wizard: {out_path} ({os.path.getsize(out_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    main()
