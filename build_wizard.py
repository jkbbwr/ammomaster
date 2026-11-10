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
  <title>AmmoMaster — Arma 3 &amp; ACE3 Ballistics &amp; Armor Balancing Workbench</title>
  <style>
__STYLES__
  </style>
</head>
<body>

  <!-- Slim Sticky Global Header -->
  <header class="app-header">
    <div class="brand">
      <span class="brand-badge">AMMOMASTER</span>
      <div class="brand-titles">
        <h1>Arma 3 &amp; ACE 3.21.2 Ammo vs. Armor Balancing Workbench</h1>
        <span class="brand-sub">Pick a round &amp; vest &rarr; drag penetration or lethality &rarr; copy ready-to-paste .hpp</span>
      </div>
    </div>

    <div class="header-controls">
      <label class="hdr-toggle" title="Toggle ACE3 woundsHandlerArmorPenetration (Levels I–V: 6, 15, 21, 40, 55 mm RHAe)">
        <input type="checkbox" id="chkAceArmorPen" checked />
        <span>ACE3 Armor Pen</span>
      </label>
      <label class="hdr-toggle" title="Use exact ACE3 Advanced Ballistics GNU G1–G8 drag tables instead of vanilla exponential airFriction">
        <input type="checkbox" id="chkAdvBallistics" />
        <span>ACE3 G1–G8 Drag</span>
      </label>
      <div class="hdr-inline-num" title="ACE3 playerDamageThreshold / AIDamageThreshold">
        <span>Trauma Mult</span>
        <input type="number" id="inpDamageThreshold" value="1.0" min="0.2" max="10" step="0.1" />
      </div>
      <div class="header-stats">
        <span class="stat-pill"><strong id="hdrRoundsCount">0</strong> Rnds</span>
        <span class="stat-pill"><strong id="hdrVestsCount">0</strong> Vests</span>
        <span style="display:none;"><strong id="hdrHelmetsCount">0</strong><strong id="hdrUniformsCount">0</strong></span>
      </div>
      <button type="button" class="danger" id="btnGlobalReset" title="Revert both round and gear to their scraped presets">
        Reset All
      </button>
      <button type="button" class="primary" id="btnHeaderCopyHpp" title="Copy CfgAmmo / CfgMagazines / CfgWeapons .hpp patch to clipboard">
        Copy .hpp Config
      </button>
    </div>
  </header>

  <main class="page-shell">

    <!-- =================================================================== -->
    <!-- TOP STAGE: [1. AMMUNITION]  ->  [2. LIVE MATCHUP]  <-  [3. ARMOR]   -->
    <!-- =================================================================== -->
    <section class="top-stage">

      <!-- ================================================================= -->
      <!-- CARD 1 (LEFT): THE ROUND                                          -->
      <!-- ================================================================= -->
      <div class="panel card-round">
        <div class="panel-header">
          <div class="step-heading">
            <span class="step-num">1</span>
            <span>Ammunition (The Round)</span>
            <span id="roundModifiedBadge" class="badge badge-amber" style="display:none;">MODIFIED</span>
          </div>
          <span class="tag" id="roundCountBadge">0 rounds</span>
        </div>

        <div class="panel-body">
          <!-- Clean Search + Mod Filter + Round Select -->
          <div class="field">
            <div class="control-row-search">
              <select id="roundModFilter" title="Filter rounds by Mod"></select>
              <input type="text" id="roundSearch" placeholder="Search round (M855A1, 7N22, .338, AP)..." />
            </div>
            <select id="roundSelect" class="hero-select" style="margin-top:4px;"></select>
          </div>

          <div class="field" id="barrelSelectWrap" style="display:none;">
            <label><span>Barrel Length Velocity</span> <code>ACE_barrelLengths</code></label>
            <select id="barrelLengthSelect"></select>
          </div>

          <!-- Live 4-Stat Round Strip -->
          <div class="round-summary-strip">
            <div class="rss-item">
              <span>Flesh Hit</span>
              <strong id="rssHit">8.00</strong>
            </div>
            <div class="rss-item">
              <span>Pen Caliber</span>
              <strong id="rssCaliber">1.000</strong>
            </div>
            <div class="rss-item">
              <span>Muzzle Vel</span>
              <strong id="rssVel">884 m/s</strong>
            </div>
            <div class="rss-item">
              <span>0m Pen (RHAe)</span>
              <strong id="rssRha0" style="color:var(--accent-hi);">13.3 mm</strong>
            </div>
          </div>

          <!-- Clean 3-Mode Sub-Tabs inside Round Card -->
          <div class="card-subtabs">
            <button type="button" class="round-tab-btn active" data-rpane="roundPaneOverview">Trajectory</button>
            <button type="button" class="round-tab-btn" data-rpane="roundPaneRealWorld">Real-World Spec</button>
            <button type="button" class="round-tab-btn" data-rpane="roundPaneRaw">
              Raw CfgAmmo <span id="rawModifiedCount" class="badge badge-amber" style="display:none;padding:0 4px;margin-left:3px;">!</span>
            </button>
          </div>

          <!-- PANE 1 (DEFAULT): Calm Overview & Downrange Ballistics -->
          <div class="round-pane active sub-card" id="roundPaneOverview">
            <div class="sub-card-hdr">
              <span>Downrange Ballistics &amp; RHAe Decay</span>
              <span class="badge badge-blue" id="ovCartridgeSpecBadge">4.0g · G7 BC 0.151</span>
            </div>
            <table class="mini-traj-table">
              <thead>
                <tr><th>Range</th><th>Vel (m/s)</th><th>fps</th><th>Energy</th><th>RHAe</th><th>ToF</th></tr>
              </thead>
              <tbody id="rwTrajTableBody"></tbody>
            </table>
            <div class="rw-match-strip" id="ovSuggestedRwBox">
              <div class="rw-match-top">
                <span class="rw-match-title" id="ovRwMatchName">Real-World Match: —</span>
                <span class="badge badge-amber" id="ovRwMismatchBadge" style="display:none;">Physics Diff</span>
              </div>
              <div id="ovRwWarningDetail" style="display:none;font-size:10px;color:#fdba74;font-family:var(--font-mono);line-height:1.35;"></div>
              <div class="rw-match-actions">
                <span style="font-size:10.5px;color:var(--text-muted);" id="ovKineticBadge">Muzzle KE: 0 J</span>
                <div style="display:flex;gap:5px;align-items:center;">
                  <button type="button" class="xs primary" id="btnApplySuggestedRw" title="Apply matched SAAMI/MIL real-world ballistics &amp; armor penetration goal in 1 click">Apply RW Spec</button>
                  <button type="button" class="xs subtle-blue" id="btnJumpRealWorld">Catalogue &rarr;</button>
                </div>
              </div>
            </div>
          </div>

          <!-- PANE 2: Real-World Cartridge Reference & Single-Unit Converter -->
          <div class="round-pane sub-card" id="roundPaneRealWorld">
            <div class="sub-card-hdr">
              <span>Real-World Cartridge Specs</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <span class="badge badge-blue" id="rwMuzzleEnergyBadge">KE: 0 J</span>
                <div class="mode-switch">
                  <button type="button" id="btnUnitsMetric" class="active">Metric</button>
                  <button type="button" id="btnUnitsImperial">Imperial</button>
                </div>
              </div>
            </div>

            <div class="field">
              <label>
                <span>Reference Catalogue (<strong id="rwCatalogCountLabel" style="color:var(--accent-hi);">180+</strong> Verified Loads)</span>
                <div style="display:flex;gap:4px;">
                  <button type="button" class="xs subtle-blue" id="btnRwAutoMatch" title="Find &amp; apply the closest real-world spec for the active round">Auto-Match</button>
                  <button type="button" class="xs" id="btnRwPullCurrent" title="Re-sync inputs from active round">Sync</button>
                </div>
              </label>
              <div class="control-row-search">
                <select id="rwGroupFilter" title="Filter real-world catalogue by caliber family"></select>
                <input type="text" id="rwPresetSearch" placeholder="Search loads (M855A1, 6ARC, .338, SP6, HST)..." />
              </div>
              <select id="rwPresetSelect" class="hero-select" style="margin-top:4px;"></select>
              <label style="justify-content:flex-start;gap:6px;margin-top:2px;cursor:pointer;font-size:11px;">
                <input type="checkbox" id="chkRwApplyPenGoal" checked />
                <span>Also apply preset's real-world armor penetration range</span>
              </label>
            </div>

            <div class="control-row-3" id="rwMetricFields">
              <div class="field">
                <label>Muzzle Vel</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwMuzzleVel" value="884" step="5" min="50" max="2200" />
                  <span class="unit-tag">m/s</span>
                </div>
              </div>
              <div class="field">
                <label>Bullet Mass</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwBulletMass" value="4.02" step="0.05" min="0.2" />
                  <span class="unit-tag">g</span>
                </div>
              </div>
              <div class="field">
                <label>Diameter</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwBulletDiam" value="5.70" step="0.05" min="2" />
                  <span class="unit-tag">mm</span>
                </div>
              </div>
            </div>

            <div class="control-row-3" id="rwImperialFields" style="display:none;">
              <div class="field">
                <label>Muzzle Vel</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwMuzzleFps" value="2900" step="15" min="160" max="7200" />
                  <span class="unit-tag">fps</span>
                </div>
              </div>
              <div class="field">
                <label>Bullet Mass</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwBulletGrains" value="62.0" step="1" min="3" />
                  <span class="unit-tag">gr</span>
                </div>
              </div>
              <div class="field">
                <label>Diameter</label>
                <div class="unit-input-wrap">
                  <input type="number" id="rwBulletInches" value="0.224" step="0.002" min="0.08" />
                  <span class="unit-tag">in</span>
                </div>
              </div>
            </div>

            <div class="field">
              <label>
                <span>Ballistic Drag</span>
                <div class="mode-switch">
                  <button type="button" id="btnDragModeBC" class="active">By BC</button>
                  <button type="button" id="btnDragModeVel">By Vel @ Range</button>
                </div>
              </label>
              <div id="rwDragPanelBC" class="control-row">
                <div class="unit-input-wrap">
                  <input type="number" id="rwInputBC" value="0.304" step="0.005" min="0.03" max="2.0" />
                  <span class="unit-tag">BC</span>
                </div>
                <select id="rwInputDragModel">
                  <option value="1">G1 Standard</option>
                  <option value="7">G7 Boat-Tail</option>
                  <option value="2">G2</option>
                  <option value="5">G5</option>
                  <option value="6">G6</option>
                  <option value="8">G8</option>
                </select>
              </div>
              <div id="rwDragPanelVel" class="control-row" style="display:none;">
                <div class="unit-input-wrap">
                  <input type="number" id="rwRefDist" value="300" step="25" min="25" max="1500" />
                  <span class="unit-tag">m</span>
                </div>
                <div class="unit-input-wrap" id="rwRefVelWrapMetric">
                  <input type="number" id="rwRefVel" value="625" step="5" min="30" />
                  <span class="unit-tag">m/s</span>
                </div>
                <div class="unit-input-wrap" id="rwRefVelWrapImp" style="display:none;">
                  <input type="number" id="rwRefFps" value="2051" step="15" min="100" />
                  <span class="unit-tag">fps</span>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);" id="rwSolvedAfLabel">af: -0.00115</span>
                <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-size:10.5px;color:var(--text-dim);">
                  <input type="checkbox" id="chkSyncTypicalSpeed" checked />
                  <span>Sync <code>typicalSpeed</code></span>
                </label>
              </div>
            </div>
          </div>

          <!-- PANE 3: Direct Raw CfgAmmo Overrides -->
          <div class="round-pane sub-card" id="roundPaneRaw">
            <div class="control-row">
              <div class="field">
                <label>Class Name <code>CfgAmmo</code></label>
                <input type="text" id="inpRoundClass" />
              </div>
              <div class="field">
                <label>ACE Type <code>ACE_damageType</code></label>
                <select id="inpDamageType">
                  <option value="bullet">bullet (Armor Pen)</option>
                  <option value="grenade">grenade</option>
                  <option value="explosive">explosive</option>
                  <option value="shell">shell</option>
                </select>
              </div>
            </div>
            <div class="control-row-3">
              <div class="field"><label><code>hit</code></label><input type="number" id="inpHit" step="0.1" /></div>
              <div class="field"><label><code>caliber</code></label><input type="number" id="inpCaliber" step="0.02" /></div>
              <div class="field"><label><code>initSpeed</code></label><input type="number" id="inpInitSpeed" step="5" /></div>
            </div>
            <div class="control-row-3">
              <div class="field"><label><code>typicalSpeed</code></label><input type="number" id="inpTypicalSpeed" step="5" /></div>
              <div class="field"><label><code>airFriction</code></label><input type="number" id="inpAirFriction" step="0.00005" /></div>
              <div class="field"><label><code>deflecting</code></label><input type="number" id="inpDeflecting" step="1" /></div>
            </div>
            <div class="control-row-3">
              <div class="field"><label><code>ACE_mass</code></label><input type="number" id="inpAceMass" step="0.1" /></div>
              <div class="field"><label><code>ACE_caliber</code></label><input type="number" id="inpAceCaliber" step="0.05" /></div>
              <div class="field">
                <label><code>BC / Model</code></label>
                <div style="display:flex;gap:3px;">
                  <input type="number" id="inpAceBC" step="0.005" style="width:58%;" />
                  <select id="inpAceDrag" style="width:42%;padding:5px 2px;">
                    <option value="1">G1</option><option value="7">G7</option><option value="2">G2</option>
                    <option value="5">G5</option><option value="6">G6</option><option value="8">G8</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="control-row">
              <div class="field"><label><code>explosive</code> (0–1)</label><input type="number" id="inpExplosive" step="0.05" min="0" max="1" value="0" /></div>
              <div class="field"><label>Sync Speeds</label><button type="button" id="btnMatchTypicalToInit">typicalSpeed = initSpeed</button></div>
            </div>
          </div>

        </div>
      </div>

      <!-- ================================================================= -->
      <!-- CARD 2 (CENTER): LIVE MATCHUP & 2-SLIDER BALANCING WORKBENCH      -->
      <!-- ================================================================= -->
      <div class="panel card-center stage-center" id="modeBalance">
        <div class="panel-header">
          <div class="step-heading">
            <span class="step-num">2</span>
            <span>Live Matchup &amp; Balancing Controls</span>
          </div>
          <div class="btn-row">
            <button type="button" class="xs subtle-blue" id="btnPinActiveRound" title="Pin this round to the Caliber Lineup comparison table below">+ Pin Round</button>
            <button type="button" class="xs danger" id="btnResetRound" title="Reset round to scraped preset">Reset Round</button>
          </div>
        </div>

        <div class="panel-body">

          <!-- Big Unmistakable Verdict Banner -->
          <div class="verdict-banner" id="verdictBanner">
            <div class="verdict-top-row">
              <span class="verdict-pill" id="verdictPill">PENETRATES</span>
              <div class="verdict-title-wrap">
                <span class="verdict-headline" id="verdictHeadline">Round vs Armor @ 100m</span>
                <span class="verdict-sub" id="verdictSub">Loading telemetry...</span>
              </div>
            </div>
            <div class="verdict-metrics">
              <div class="v-metric">
                <span>Max Pen vs Gear</span>
                <strong id="vmMaxPenGear" style="color:var(--accent-hi);">-</strong>
              </div>
              <div class="v-metric">
                <span>Hits to KO (ACE)</span>
                <strong id="vmHitsKO">-</strong>
              </div>
              <div class="v-metric">
                <span>Hits to Kill (ACE)</span>
                <strong id="vmHitsKill">-</strong>
              </div>
              <div class="v-metric">
                <span>Vanilla STK</span>
                <strong id="vmVanillaStk">-</strong>
              </div>
            </div>
          </div>

          <!-- Clean Test Engagement Range Bar -->
          <div class="range-scrubber-box">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:11.5px;font-weight:600;color:var(--text-dim);">Test Engagement Distance:</span>
              <div class="quick-ranges" style="flex:1;max-width:340px;">
                <button type="button" class="quick-range-btn" data-range="0">0m</button>
                <button type="button" class="quick-range-btn" data-range="50">50m</button>
                <button type="button" class="quick-range-btn active" data-range="100">100m</button>
                <button type="button" class="quick-range-btn" data-range="200">200m</button>
                <button type="button" class="quick-range-btn" data-range="300">300m</button>
                <button type="button" class="quick-range-btn" data-range="500">500m</button>
                <button type="button" class="quick-range-btn" data-range="800">800m</button>
              </div>
              <div class="unit-input-wrap" style="width:86px;">
                <input type="number" id="rangeInput" value="100" min="0" max="2500" step="10" style="text-align:right;" />
                <span class="unit-tag">m</span>
              </div>
            </div>
            <input type="range" id="rangeSlider" min="0" max="1500" step="5" value="100" />
          </div>

          <!-- CONTROL A: UNIFIED DRAGGABLE ARMOR PENETRATION MATRIX + INLINE INPUTS -->
          <div class="tuner-hero-card" id="rwMaxPenDistField">
            <div class="tuner-hero-hdr">
              <div class="tuner-hero-title">
                <span>A. Armor Penetration Cutoff</span>
                <span class="badge badge-blue" id="balSolvedCalBadge">cal: 1.000</span>
              </div>
              <div class="btn-row">
                <button type="button" class="xs" id="btnStopAtZero" title="Tune round so Equipped Gear stops it even at 0m point-blank">Stop @ 0m</button>
                <button type="button" class="xs subtle-blue" id="btnRwMatchEquipped" title="Tune round so it penetrates Equipped Gear right out to the current Test Distance">Match Test Dist</button>
                <button type="button" class="xs" id="btnToggleCustomRha" title="Add or hide a custom plate thickness (mm RHAe) row">+ Custom mm</button>
              </div>
            </div>

            <!-- Hidden state backing for locked goal level & distance -->
            <div style="display:none;">
              <div id="rwArmorTierGrid"></div>
              <select id="rwArmorGoalLevel">
                <option value="active" selected>Equipped Gear</option>
                <option value="0">Unarmored Only</option>
                <option value="1">Level I</option>
                <option value="2">Level II</option>
                <option value="3">Level III</option>
                <option value="4">Level IV</option>
                <option value="5">Level V</option>
                <option value="custom">Custom mm</option>
              </select>
              <input type="number" id="rwArmorMaxDist" value="150" />
              <input type="range" id="rwArmorMaxDistSlider" min="0" max="1000" step="5" value="150" />
            </div>

            <div id="rwCustomRhaWrap" class="control-row" style="display:none;">
              <div class="unit-input-wrap">
                <input type="number" id="rwCustomRhaMM" value="28" min="1" max="200" step="1" />
                <span class="unit-tag">mm RHAe</span>
              </div>
              <div class="btn-row">
                <button type="button" class="xs" data-customrha="10">10mm</button>
                <button type="button" class="xs" data-customrha="28">28mm (III+)</button>
                <button type="button" class="xs" data-customrha="48">48mm (IV+)</button>
              </div>
            </div>

            <!-- Unified Draggable Penetration Range Bars + Inline Meter Inputs -->
            <div class="pen-matrix-wrap">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:10.5px;color:var(--text-dim);">
                  <strong>&#8596; Drag any bar</strong> or type meters (<span style="color:#94a3b8;">&#9474; Gray = Original</span> · <span style="color:#facc15;" id="rwMatrixRangeLegend">&#9474; Test: 100m</span>)
                </span>
                <select id="rwPenCriterion" style="width:auto;padding:2px 6px;font-size:10.5px;">
                  <option value="ace_bleed" selected>Goal: Penetrate &amp; Bleed (&gt; 0.35)</option>
                  <option value="ace_ko">Goal: 1-Shot Knockdown</option>
                  <option value="ace_heart">Goal: Heart-Shot (&ge; 0.60)</option>
                  <option value="rha_100">Goal: 100% Raw RHAe</option>
                </select>
              </div>
              <div class="pen-matrix-axis">
                <span>Armor Target</span>
                <div class="pen-axis-ticks">
                  <span>0m</span><span>200m</span><span>400m</span><span>600m</span><span>800m</span><span>1000m</span>
                </div>
                <span style="text-align:right;">Cutoff (&Delta;)</span>
              </div>
              <div class="pen-matrix-list" id="rwPenMatrixContainer"></div>
            </div>
          </div>

          <!-- CONTROL B: TERMINAL FLESH DAMAGE (hit) -->
          <div class="tuner-hero-card">
            <div class="tuner-hero-hdr">
              <div class="tuner-hero-title">
                <span>B. Flesh Lethality (<code>hit</code>)</span>
                <span id="rwUnarmoredStkBadge" class="badge badge-red">Unarmored: 2 KO / 2 Kill</span>
              </div>
              <label style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--accent-hi);cursor:pointer;" title="Automatically compensates caliber when you change hit so your armor penetration cutoff distances stay locked!">
                <input type="checkbox" id="chkLockPenOnHit" checked />
                <span>Lock Armor Pen Range</span>
              </label>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
              <div class="btn-row">
                <span style="font-size:10.5px;color:var(--text-muted);">Energy Profile:</span>
                <button type="button" class="xs prof-pill active" data-prof="manual">Manual</button>
                <button type="button" class="xs prof-pill" data-prof="0.88" title="Sub-caliber AP penetrator (0.88 × √KE/5)">AP 0.88×</button>
                <button type="button" class="xs prof-pill" data-prof="1.00" title="Standard FMJ / Ball (1.00 × √KE/5)">FMJ 1.0×</button>
                <button type="button" class="xs prof-pill" data-prof="1.12" title="Yawing / EPR / OTM (1.12 × √KE/5)">EPR 1.12×</button>
                <button type="button" class="xs prof-pill" data-prof="1.25" title="Expanding JHP / Fragmenting (1.25 × √KE/5)">JHP 1.25×</button>
              </div>
              <select id="rwProjectileProfile" style="display:none;">
                <option value="manual" selected>Manual</option>
                <option value="0.88">0.88</option>
                <option value="1.00">1.00</option>
                <option value="1.12">1.12</option>
                <option value="1.25">1.25</option>
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <input type="range" id="rwHitSlider" min="2" max="45" step="0.1" value="8.5" style="flex:1;" />
              <div class="unit-input-wrap" style="width:82px;">
                <input type="number" id="rwHitInput" min="0.5" max="200" step="0.1" value="8.5" style="text-align:right;" />
                <span class="unit-tag">hit</span>
              </div>
            </div>
          </div>

          <!-- Compact Parameter Delta Footer -->
          <div class="diff-bar">
            <div class="diff-pills" id="rwDiffPills"></div>
            <button type="button" class="subtle-blue xs" id="btnQuickCopyHpp">Copy .hpp</button>
          </div>

        </div>
      </div>

      <!-- ================================================================= -->
      <!-- CARD 3 (RIGHT): TARGET ARMOR & CUSTOM VEST TUNER                  -->
      <!-- ================================================================= -->
      <div class="panel card-armor">
        <div class="panel-header">
          <div class="step-heading">
            <span class="step-num">3</span>
            <span>Target Armor (Vest / Helmet)</span>
          </div>
          <span class="tag" id="armorModifiedTag">Scraped Loadout</span>
        </div>

        <div class="panel-body">

          <!-- Simple 3-Way Target Zone Switcher -->
          <div class="field">
            <label><span>Target Body Zone</span></label>
            <div class="zone-switcher">
              <button type="button" id="zoneQuickTorso" class="active">Torso (Vest)</button>
              <button type="button" id="zoneQuickHead">Head (Helm)</button>
              <select id="zoneSelectAll" title="Select any specific anatomical hitpoint"></select>
            </div>
          </div>

          <!-- Primary Vest Selector (Shown for Torso / Limbs) -->
          <div class="field" id="primaryVestPickerWrap">
            <label>
              <span>Equipped Vest Preset (287 Vests)</span>
              <button type="button" class="xs subtle-blue" id="btnPinVestCompare" title="Pin current vest to Multi-Vest Benchmark table">+ Pin Vest</button>
            </label>
            <div class="control-row-search">
              <select id="vestModFilter" title="Filter vests by Mod"></select>
              <input type="text" id="vestSearch" placeholder="Search vest (FCPC, Carrier, 6B45)..." />
            </div>
            <select id="vestSelect" class="hero-select" style="margin-top:4px;"></select>
            <div class="cov-strip" id="vestCovStrip"></div>
          </div>

          <!-- Primary Helmet Selector (Swaps into focus when Head is selected) -->
          <div class="field" id="primaryHelmetPickerWrap" style="display:none;">
            <label><span>Equipped Helmet Preset (262 Helmets)</span></label>
            <div class="control-row-search">
              <select id="helmetModFilter" title="Filter helmets by Mod"></select>
              <input type="text" id="helmetSearch" placeholder="Search helmet (FAST, ECH, Altyn)..." />
            </div>
            <select id="helmetSelect" class="hero-select" style="margin-top:4px;"></select>
          </div>

          <!-- Smart ACE3 Armor Quirk Banner (Only visible when relevant) -->
          <div id="armorCaveatBanner" class="warn-banner" style="display:none;"></div>

          <!-- Single Clean Protection Tier & Custom Values Box -->
          <div class="sub-card">
            <div class="sub-card-hdr">
              <span id="armorEditorTitle">Vest Protection (Chest)</span>
              <div class="btn-row">
                <button type="button" class="xs subtle-blue" id="btnVestStopRound" title="Automatically set armor tier to stop the active round at the current Test Distance!">
                  Stop Round @ Dist
                </button>
                <button type="button" class="xs danger" id="btnResetArmor" title="Reset gear to scraped preset">Reset</button>
              </div>
            </div>

            <div class="field">
              <label><span>Set ACE3 Protection Tier</span></label>
              <div class="archetype-strip" id="armorArchetypeStrip">
                <button type="button" class="arch-btn" data-arch="0"><span>Unarm</span><small>0 mm</small></button>
                <button type="button" class="arch-btn" data-arch="1"><span>Lvl I</span><small>6 mm</small></button>
                <button type="button" class="arch-btn" data-arch="2"><span>Lvl II</span><small>15 mm</small></button>
                <button type="button" class="arch-btn" data-arch="3"><span>Lvl III</span><small>21 mm</small></button>
                <button type="button" class="arch-btn" data-arch="4"><span>Lvl IV</span><small>40 mm</small></button>
                <button type="button" class="arch-btn" data-arch="5"><span>Lvl V</span><small>55 mm</small></button>
              </div>
            </div>

            <div class="control-row" id="vestArmorFieldsRow">
              <div class="field">
                <label>Vest <code>armor</code></label>
                <input type="number" id="inpVestHpArmor" step="1" min="0" />
              </div>
              <div class="field">
                <label>Vest <code>passThrough</code></label>
                <input type="number" id="inpVestHpPass" step="0.05" min="0.1" max="1" />
              </div>
            </div>

            <div class="control-row" id="helmArmorFieldsRow" style="display:none;">
              <div class="field">
                <label>Helmet <code>armor</code></label>
                <input type="number" id="inpHelmHpArmor" step="1" min="0" />
              </div>
              <div class="field">
                <label>Helmet <code>passThrough</code></label>
                <input type="number" id="inpHelmHpPass" step="0.05" min="0.1" max="1" />
              </div>
            </div>

            <div id="armorEditorLiveSummary" style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-dim);display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;">
              <span>Active: Chest</span>
              <strong style="color:var(--accent-hi);">ACE Lvl III (21mm RHAe)</strong>
            </div>
            <label id="wholeVestCheckWrap" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--text-dim);cursor:pointer;">
              <input type="checkbox" id="chkEditWholeVest" checked />
              <span>Apply edits across all Torso hitpoints (Chest / Diaphragm / Abdomen / Pelvis)</span>
            </label>
          </div>

          <!-- Tucked-away Base Unit & Angle Overrides -->
          <details class="adv-drawer" id="advGearDrawer">
            <summary>
              <span>Advanced: Base Unit &amp; Impact Obliquity</span>
            </summary>
            <div class="drawer-body">
              <div class="field">
                <label>Base Unit / Uniform (168 Units)</label>
                <div class="control-row-search">
                  <select id="uniformModFilter"></select>
                  <input type="text" id="uniformSearch" placeholder="Search uniform..." />
                </div>
                <select id="uniformSelect" style="margin-top:3px;"></select>
              </div>
              <div class="control-row-3">
                <div class="field"><label>Unit <code>armor</code></label><input type="number" id="inpUnitBaseArmor" step="0.5" min="0.5" /></div>
                <div class="field"><label>HP <code>armor</code></label><input type="number" id="inpHpMult" step="0.5" min="0.5" /></div>
                <div class="field"><label>Obliquity (deg)</label><input type="number" id="inpImpactAngle" value="0" min="0" max="80" step="5" /></div>
              </div>
              <input type="hidden" id="inpUnitStructural" value="4" />
              <input type="hidden" id="inpHpPass" value="0.8" />
            </div>
          </details>

        </div>
      </div>

    </section>

    <!-- =================================================================== -->
    <!-- BOTTOM DEEP-DIVE WORKSPACE: [ACE3 MEDICAL DUMMY] + [ANALYSIS TABS]  -->
    <!-- =================================================================== -->
    <section class="bottom-stage">

      <!-- Left: Interactive ACE3 Medical Body Dummy & Live Firing Range -->
      <div class="panel">
        <div class="panel-header">
          <div class="step-heading">
            <span>ACE3 Medical Dummy &amp; Live Firing Range</span>
          </div>
          <span class="tag" id="aceDummyModeLabel">1-SHOT PREVIEW</span>
        </div>
        <div class="panel-body">
          <div class="field">
            <label>
              <span>Click Any HitPoint or Dummy Limb</span>
              <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">&#9679; Red=Pen &#9679; Blue=Stop</span>
            </label>
            <div class="hitzone-grid" id="hitzoneGrid"></div>
          </div>

          <div class="ace-medical-container">
            <div class="ace-dummy-wrap" title="Click body part to inspect">
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

          <div class="btn-row" style="justify-content:space-between;">
            <button type="button" class="primary" id="btnFireShot">Fire 1 Shot</button>
            <button type="button" id="btnFireBurst">3-Rnd Burst</button>
            <button type="button" id="btnApplyTourniquet">Tourniquet</button>
            <button type="button" id="btnApplyBandage">Bandage</button>
            <button type="button" class="danger" id="btnResetDummy">Reset</button>
          </div>
        </div>
      </div>

      <!-- Right: Deep Telemetry, Caliber/Vest Lineup Benchmarks, 11-Hitzone Matrix & Export -->
      <div class="panel">
        <div class="tabs-nav">
          <button type="button" class="tab-btn active" data-tab="tabVestBench">Vest &amp; Caliber Benchmarks</button>
          <button type="button" class="tab-btn" data-tab="tabCharts">Ballistics Curves &amp; Math Pipeline</button>
          <button type="button" class="tab-btn" data-tab="tabHitzones">All 11 Hitzones</button>
          <button type="button" class="tab-btn" data-tab="tabExport">Export Config (.hpp)</button>
        </div>

        <!-- TAB 1 (DEFAULT): Multi-Round vs Active Vest + Active Round vs Multi-Vest -->
        <div class="tab-pane active" id="tabVestBench">
          <!-- Section A: Caliber Lineup vs Active Vest (Ideal when tuning custom vests!) -->
          <div class="sub-card">
            <div class="sub-card-hdr">
              <span>How Common Calibers Perform Against Your Equipped / Custom Vest (Chest)</span>
              <div class="btn-row">
                <button type="button" class="xs" id="btnClearPinnedRounds">Clear Pinned Rounds</button>
              </div>
            </div>
            <div style="overflow-x:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Ammunition / Caliber</th>
                    <th>Hit / Cal</th>
                    <th>Muzzle (0m RHAe)</th>
                    <th>Max Pen Range</th>
                    <th>Max 1-Hit KO</th>
                    <th>Wound Dmg @ Dist</th>
                    <th>Status @ Dist</th>
                    <th>Hits to KO</th>
                    <th>Hits to Kill</th>
                  </tr>
                </thead>
                <tbody id="caliberLineupTableBody"></tbody>
              </table>
            </div>
          </div>

          <!-- Section B: Active Round vs Multi-Vest Benchmark -->
          <div class="sub-card">
            <div class="sub-card-hdr">
              <span>How Your Active Round Performs Across Vests &amp; ACE3 Tiers (Chest)</span>
              <div class="btn-row">
                <button type="button" class="xs subtle-blue" id="btnPinActiveVest2">+ Pin Equipped Vest</button>
                <button type="button" class="xs" id="btnClearPinnedVests">Clear Pinned Vests</button>
              </div>
            </div>
            <div style="overflow-x:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Armor / Vest Target (Chest)</th>
                    <th>Raw / ACE Armor</th>
                    <th>ACE Plate Tier</th>
                    <th>Max Pen Range</th>
                    <th>Max 1-Hit KO</th>
                    <th>Wound Dmg @ Dist</th>
                    <th>Status @ Dist</th>
                    <th>Hits to KO</th>
                    <th>Hits to Kill</th>
                  </tr>
                </thead>
                <tbody id="vestBenchmarkTableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 2: Ballistics & Damage Curves + Validated Math Pipeline -->
        <div class="tab-pane" id="tabCharts">
          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-title"><span>Impact Velocity &amp; KE</span> <span class="kpi-delta" id="kpiVelDelta"></span></span>
              <span class="kpi-value" id="kpiVelocity">0 m/s</span>
              <span class="kpi-sub" id="kpiVelocitySub">KE: 0 J | ToF: 0.00s</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-title"><span>Effective RHAe Pen</span> <span class="kpi-delta" id="kpiRhaDelta"></span></span>
              <span class="kpi-value" id="kpiRhaPen" style="color:var(--accent-hi);">0.0 mm</span>
              <span class="kpi-sub" id="kpiRhaPenSub">vs Armor Level</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-title"><span>ACE3 Wound Damage</span> <span class="kpi-delta" id="kpiDmgDelta"></span></span>
              <span class="kpi-value" id="kpiAceDamage">0.000</span>
              <span class="kpi-sub" id="kpiAceDamageSub">Plate Threshold: 0.35</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-title"><span>1-Shot KO / Fatal</span> <span class="kpi-delta" id="kpiFatalDelta"></span></span>
              <span class="kpi-value" id="kpiLethality">0% / 0%</span>
              <span class="kpi-sub" id="kpiLethalitySub">KO Prob / Fatal Prob</span>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
            <span>Hover charts to inspect exact telemetry &middot; Click any chart to set Test Distance</span>
            <span>Solid = Current Tuned &middot; Dashed = Scraped Preset</span>
          </div>

          <div class="charts-grid">
            <div class="chart-box">
              <div class="chart-title">
                <span>1. Velocity Decay vs Range (m/s)</span>
                <span id="chtSubVel" style="color:#38bdf8;font-family:var(--font-mono);"></span>
              </div>
              <canvas id="chartVelocity" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>2. RHAe Penetration vs Plate Thickness (mm)</span>
                <span id="chtSubPen" style="color:#eab308;font-family:var(--font-mono);"></span>
              </div>
              <canvas id="chartPenetration" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>3. ACE Wound Damage vs Thresholds (0.35 / KO / Fatal)</span>
                <span id="chtSubDmg" style="color:#ef4444;font-family:var(--font-mono);"></span>
              </div>
              <canvas id="chartAceDamage" class="chart-canvas"></canvas>
            </div>
            <div class="chart-box">
              <div class="chart-title">
                <span>4. Expected Bleed Rate vs Range (% Cardiac Output)</span>
                <span id="chtSubBleed" style="color:#f43f5e;font-family:var(--font-mono);"></span>
              </div>
              <canvas id="chartBleed" class="chart-canvas"></canvas>
            </div>
          </div>

          <div class="pipeline-steps">
            <div class="step-card">
              <h4><span>Base Arma 3 Engine Pipeline</span> <span>ShotBullet / HitPoints</span></h4>
              <div class="formula-line"><span>Muzzle / Ref Speed (v0 / typ):</span> <strong id="fV0">-</strong></div>
              <div class="formula-line"><span>Impact Velocity (v &times; cos &theta;):</span> <strong id="fVImpact">-</strong></div>
              <div class="formula-line"><span>RHAe Pen (v &times; cal &times; 0.015):</span> <strong id="fRhaPen">-</strong></div>
              <div class="formula-line"><span>Raw Kinetic Hit (hit &times; v / typ):</span> <strong id="fRawHit">-</strong></div>
              <div class="formula-line"><span>Vanilla Hitpoint Armor:</span> <strong id="fVanArmor">-</strong></div>
              <div class="formula-line"><span>Vanilla HP / Structural Dmg:</span> <strong id="fVanDmg">-</strong></div>
            </div>
            <div class="step-card">
              <h4><span>ACE 3.21.2 Medical Damage Pipeline</span> <span>ace_medical_damage</span></h4>
              <div class="formula-line"><span>ACE Armor (#9063 log10 cap):</span> <strong id="fAceArmor">-</strong></div>
              <div class="formula-line"><span>ACE Plate Tier &amp; RealDmg Speed:</span> <strong id="fAceLevel">-</strong></div>
              <div class="formula-line"><span>Post-Armor Wound Damage:</span> <strong id="fAceFinalDmg">-</strong></div>
              <div class="formula-line"><span>Wound Type Distribution:</span> <strong id="fAceWoundProbs">-</strong></div>
              <div class="formula-line"><span>Bleed (CO &amp; mL/s) &amp; Pain:</span> <strong id="fAceBleedPain">-</strong></div>
              <div class="formula-line"><span>KO / Vital / Weibull Fatal Prob:</span> <strong id="fAceFatal">-</strong></div>
            </div>
          </div>
        </div>

        <!-- TAB 3: All 11 Hitzones Matrix -->
        <div class="tab-pane" id="tabHitzones">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>HitPoint (ACE Part)</th>
                  <th>Armor (Van/ACE)</th>
                  <th>ACE Tier</th>
                  <th>Max Pen</th>
                  <th>Van Dmg</th>
                  <th>ACE Dmg</th>
                  <th>Plate Status</th>
                  <th style="text-align:left;">Primary Wound</th>
                  <th>Bleed (CO)</th>
                  <th>KO / Fatal (STK)</th>
                </tr>
              </thead>
              <tbody id="allHitzonesTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- TAB 4: Export Config (.hpp) -->
        <div class="tab-pane" id="tabExport">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <span class="badge badge-blue" id="sessionExportBadge">Session: Active Round</span>
              <label style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--accent-hi);cursor:pointer;">
                <input type="checkbox" id="chkExportAllSession" checked />
                <span>Batch Export All Modified Session Rounds &amp; Gear</span>
              </label>
              <label style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-dim);cursor:pointer;">
                <input type="checkbox" id="chkExportArmorPatch" checked />
                <span>Include Tuned Vests/Helmets</span>
              </label>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button type="button" class="xs danger" id="btnClearSessionEdits" title="Clear all saved round &amp; armor modifications across this session">Clear Session</button>
              <button type="button" class="primary" id="btnCopyConfig">Copy Config (.hpp)</button>
            </div>
          </div>
          <pre class="config-export" id="configExportPre"></pre>
        </div>

      </div>

    </section>

  </main>

  <script>
const ARMA_DATABASE = __ARMA_DATABASE__;
const ACE_BODY_TEXTURES = __ACE_BODY_TEXTURES__;
__RW_CATALOG_JS__
__ENGINE_JS__
  </script>
</body>
</html>
"""

def main():
    with open(os.path.join(ROOT, "wizard_styles.css")) as f:
        styles = f.read()
    with open(os.path.join(ROOT, "real_world_catalog.js")) as f:
        rw_catalog_js = f.read()
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
        .replace("__RW_CATALOG_JS__", rw_catalog_js)
        .replace("__ENGINE_JS__", engine_js)
    )

    out_path = os.path.join(ROOT, "index.html")
    with open(out_path, "w") as f:
        f.write(html)
    print(f"Built standalone wizard: {out_path} ({os.path.getsize(out_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    main()
