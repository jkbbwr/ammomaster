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
      <label class="hdr-toggle" id="lblColorblindToggle" title="Okabe–Ito colorblind-safe high-contrast palette (Cyan / Gold / Magenta + shape &amp; pattern cues)">
        <input type="checkbox" id="chkColorblindMode" />
        <span>CB Safe</span>
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
      <div class="hdr-doc-btns">
        <button type="button" class="subtle-blue" id="btnOpenTutorialModal" title="Interactive step-by-step walkthrough of the AmmoMaster balancing workflow">
          ? Tutorial
        </button>
        <button type="button" class="subtle-blue" id="btnOpenMathsModal" title="Complete Arma 3 &amp; ACE 3.21.2 ballistics, armor &amp; medical equations reference">
          &Sigma; Maths &amp; Physics
        </button>
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

  <!-- ===================================================================== -->
  <!-- MODAL 1: INTERACTIVE WORKBENCH TUTORIAL                               -->
  <!-- ===================================================================== -->
  <div class="modal-backdrop" id="tutorialModal" role="dialog" aria-modal="true" aria-labelledby="tutorialModalTitle">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon-badge">GUIDE</span>
          <div>
            <h2 id="tutorialModalTitle">How to Use AmmoMaster — 6-Step Balancing Walkthrough</h2>
            <p>Ground rounds in real-world ballistics, tune armor cutoffs &amp; flesh lethality independently, and export HEMTT-ready <code>.hpp</code> patches.</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" data-close-modal="tutorialModal" title="Close (Esc)">&times; Esc</button>
      </div>

      <div class="modal-subnav" id="tutorialStepsNav">
        <button type="button" class="modal-pill-btn active" data-tut-step="0"><span class="modal-pill-num">1</span> Pick &amp; Ground Round</button>
        <button type="button" class="modal-pill-btn" data-tut-step="1"><span class="modal-pill-num">2</span> Equip Target Armor</button>
        <button type="button" class="modal-pill-btn" data-tut-step="2"><span class="modal-pill-num">3</span> Drag Armor Cutoffs</button>
        <button type="button" class="modal-pill-btn" data-tut-step="3"><span class="modal-pill-num">4</span> Flesh Lethality (<code>hit</code>)</button>
        <button type="button" class="modal-pill-btn" data-tut-step="4"><span class="modal-pill-num">5</span> ACE3 Dummy &amp; Charts</button>
        <button type="button" class="modal-pill-btn" data-tut-step="5"><span class="modal-pill-num">6</span> Session &amp; <code>.hpp</code> Export</button>
      </div>

      <div class="modal-body">

        <!-- STEP 1 -->
        <div class="modal-pane active" data-tut-pane="0">
          <div class="tut-hero">
            <div>
              <h3>Step 1: Select Ammunition &amp; Align Real-World Ballistics (Card 1)</h3>
              <p>Start in the left-hand <strong>Ammunition</strong> card. Filter by modpack or search across 832 scraped rounds, then inspect how the mod's config compares against real SAAMI / CIP / MIL-DTL / GRAU cartridge specifications.</p>
            </div>
            <button type="button" class="xs primary" data-spotlight=".card-round">Highlight Card 1 &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span>Search, Mod Filter &amp; Barrel Length</span> <span class="badge badge-blue">Card 1 Top</span></h4>
              <ul>
                <li>Use the mod dropdown (<code>Vanilla</code>, <code>ACE3</code>, <code>Project M</code>, <code>Aegis</code>, or <code>&#9733; Session Tuned</code>) and search box to pick any round.</li>
                <li>If the round defines <code>ACE_barrelLengths[]</code>, a barrel selector appears automatically so you can test carbine vs. SBR vs. DMR velocities.</li>
                <li>Toggle <strong>ACE3 G1–G8 Drag</strong> in the top header to switch between vanilla <code>airFriction</code> and GNU Exterior Ballistics drag curves.</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>1-Click Real-World Spec Alignment (181 Loads)</span> <span class="badge badge-amber">Physics Diff</span></h4>
              <ul>
                <li>The <strong>Real-World Match</strong> box automatically pairs your round with its closest real-world load and flags discrepancies in <code>initSpeed</code>, <code>typicalSpeed</code>, <code>ACE_muzzleVelocities[]</code>, bullet mass, or <code>G1</code>/<code>G7</code> BC.</li>
                <li>Click <strong>Apply RW Spec</strong> to synchronize velocity, barrel tables, bullet mass, drag model, and <code>airFriction</code> in one click—or browse all 181 presets under the <strong>Real-World Spec</strong> sub-tab.</li>
              </ul>
            </div>
          </div>
          <div class="tut-tip">
            <strong>Pro Tip:</strong> Grounding flight ballistics first (velocity, mass, BC, <code>typicalSpeed</code>) means downrange energy decay is physically realistic before you touch armor penetration or damage.
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="modal-pane" data-tut-pane="1">
          <div class="tut-hero">
            <div>
              <h3>Step 2: Pick Target Armor, Hitzone &amp; Custom Plate Tiers (Card 3)</h3>
              <p>Use the right-hand <strong>Target Armor</strong> card to choose what your round is shooting at—any of 287 vests, 262 helmets, and 168 base uniforms across 11 anatomical hitpoints.</p>
            </div>
            <button type="button" class="xs primary" data-spotlight=".card-armor">Highlight Card 3 &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span>Body Zone &amp; Gear Presets</span> <span class="badge badge-blue">Card 3 Top</span></h4>
              <ul>
                <li>Click <strong>Torso (Vest)</strong> or <strong>Head (Helm)</strong>, or pick a specific hitzone (<code>Chest</code>, <code>Diaphragm</code>, <code>Abdomen</code>, <code>Pelvis</code>, <code>Arms</code>, <code>Legs</code>).</li>
                <li>Coverage pills under the vest selector show which torso sub-zones are armored vs. exposed soft tissue.</li>
                <li>Warning banners automatically alert you when a vest triggers ACE3's <code>#9063</code> logarithmic over-cap (<code>armor &gt; 24</code> on vests or <code>&gt; 12</code> on helmets).</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>Custom Vest / Helmet Tuning</span> <span class="badge badge-green">Lvl I–V</span></h4>
              <ul>
                <li>Click <strong>Lvl I</strong> through <strong>Lvl V</strong> (<code>6, 15, 21, 40, 55 mm RHAe</code>) or edit <code>armor</code> &amp; <code>passThrough</code> directly to rebalance a vest or helmet.</li>
                <li>Click <strong>Stop Round @ Dist</strong> to immediately set the vest/helmet to the minimum ACE tier needed to stop the active round at your current Test Engagement Distance.</li>
              </ul>
            </div>
          </div>
          <div class="tut-tip">
            <strong>Pro Tip:</strong> Keep <em>Apply edits across all Torso hitpoints</em> checked when tuning a plate carrier so <code>HitChest</code>, <code>HitDiaphragm</code>, and <code>HitAbdomen</code> stay consistent.
          </div>
        </div>

        <!-- STEP 3 -->
        <div class="modal-pane" data-tut-pane="2">
          <div class="tut-hero">
            <div>
              <h3>Step 3: Set Armor Penetration Cutoffs Visually (Card 2 &middot; Control A)</h3>
              <p>Instead of guessing abstract <code>CfgAmmo &gt;&gt; caliber</code> numbers, drag the horizontal range bars directly in meters and let AmmoMaster inverse-solve <code>caliber</code> for you.</p>
            </div>
            <button type="button" class="xs primary" data-spotlight="#rwMaxPenDistField">Highlight Penetration Matrix &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span>Draggable Penetration Matrix (0–1000m)</span> <span class="badge badge-blue">Control A</span></h4>
              <ul>
                <li>Grab any bar—<strong>Equipped Gear</strong>, <strong>ACE Levels I–V</strong>, or <strong>+ Custom mm</strong>—and drag left/right (or type an exact meter cutoff in the right-hand input box).</li>
                <li>The gray tick mark (<code>&#9474;</code>) shows the round's original scraped cutoff; the glowing yellow line shows your current <strong>Test Engagement Distance</strong>.</li>
                <li>Use quick buttons <strong>Stop @ 0m</strong> (defeated point-blank) or <strong>Match Test Dist</strong> for instant alignment.</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>4 Tactical Cutoff Criteria</span> <span class="badge badge-amber">Goal Selector</span></h4>
              <ul>
                <li><strong>Penetrate &amp; Bleed (&gt; 0.35):</strong> Exact ACE3 boundary where blunt <code>Contusion</code> turns into bleeding <code>VelocityWound</code> / <code>Avulsion</code>.</li>
                <li><strong>1-Shot Knockdown:</strong> Distance out to which 1 torso/head hit exceeds ACE3's trauma unconsciousness threshold.</li>
                <li><strong>Heart-Shot (&ge; 0.60):</strong> Distance where torso wounds can trigger ACE3's 5% instant fatal heart-hit check.</li>
                <li><strong>100% Raw RHAe:</strong> Pure kinetic steel perforation (<code>v &times; cal &times; 0.015 &ge; plate mm</code>).</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- STEP 4 -->
        <div class="modal-pane" data-tut-pane="3">
          <div class="tut-hero">
            <div>
              <h3>Step 4: Tune Unarmored Flesh Lethality Independently (Card 2 &middot; Control B)</h3>
              <p>In ACE3, changing <code>hit</code> normally shifts armor penetration ranges too—making balancing frustrating. AmmoMaster solves this with automatic decoupled locking.</p>
            </div>
            <button type="button" class="xs primary" data-spotlight=".card-center">Highlight Card 2 &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span><code>Lock Armor Pen Range</code> (Decoupled Solver)</span> <span class="badge badge-green">Key Feature</span></h4>
              <ul>
                <li>When <strong>Lock Armor Pen Range</strong> is checked (default), dragging the <strong>Flesh Lethality (<code>hit</code>)</strong> slider automatically compensates <code>caliber</code> in real time so your armor penetration cutoff meter mark stays pinned!</li>
                <li>Uncheck it anytime if you want raw <code>hit</code> edits to leave <code>caliber</code> untouched and shift both flesh and plate performance together.</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>BI Kinetic Energy Profiles (<code>&radic;KE / 5</code>)</span> <span class="badge badge-blue">Control B</span></h4>
              <ul>
                <li>Click <strong>AP 0.88&times;</strong>, <strong>FMJ 1.0&times;</strong>, <strong>EPR 1.12&times;</strong>, or <strong>JHP 1.25&times;</strong> to derive <code>hit</code> from muzzle kinetic energy using Bohemia Interactive's empirical formula, scaled by projectile terminal behavior.</li>
                <li>Watch the <strong>Unarmored KO / Kill</strong> badge and top <strong>Verdict Banner</strong> update live as you tune.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- STEP 5 -->
        <div class="modal-pane" data-tut-pane="4">
          <div class="tut-hero">
            <div>
              <h3>Step 5: Verify on the ACE3 Medical Dummy, Firing Range &amp; Charts</h3>
              <p>Scroll to the bottom workspace to test real ACE3 wound trauma, stochastic multi-shot bursts, side-by-side caliber/vest lineups, and 0–1500m ballistics curves.</p>
            </div>
            <button type="button" class="xs primary" data-spotlight=".ace-medical-container">Highlight ACE3 Dummy &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span>1-Shot Preview vs. Live Firing Range</span> <span class="badge badge-red">ACE3 GUI</span></h4>
              <ul>
                <li><strong>1-Shot Preview:</strong> Shows exact analytical expectation (fractional wound counts, mL/s cardiac-output bleeding, pain, KO %, and Weibull fatality %).</li>
                <li><strong>Fire 1 Shot / 3-Rnd Burst:</strong> Switches to stochastic simulation using ACE3's exact <code>random [0.9, 1.0, 1.1]</code> triangular roll, fractures, limping, <strong>Tourniquet</strong>, and <strong>Bandage</strong> actions.</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>Lineups, 4 Interactive Charts &amp; 11 Hitzones</span> <span class="badge badge-blue">Bottom Tabs</span></h4>
              <ul>
                <li>Click <strong>+ Pin Round</strong> (Card 2) or <strong>+ Pin Vest</strong> (Card 3) to benchmark multiple calibers and carriers side-by-side.</li>
                <li>Hover any of the 4 downrange charts to compare <strong>Dashed (Original Preset)</strong> vs. <strong>Solid (Tuned)</strong> curves across 0–1500m, or inspect <strong>Step-by-Step Math</strong> and <strong>All 11 Hitzones</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- STEP 6 -->
        <div class="modal-pane" data-tut-pane="5">
          <div class="tut-hero">
            <div>
              <h3>Step 6: Multi-Item Session Persistence &amp; Batch <code>.hpp</code> Export</h3>
              <p>Tune an entire caliber family and vest lineup in one sitting, then export a single clean, topologically sorted Arma 3 config patch.</p>
            </div>
            <button type="button" class="xs primary" data-open-export-tab="1">Open Export .hpp Tab &rarr;</button>
          </div>
          <div class="tut-grid">
            <div class="tut-card">
              <h4><span>Automatic Session Memory (<code>&#9998;</code>)</span> <span class="badge badge-amber">Multi-Item</span></h4>
              <ul>
                <li>Every round, vest, or helmet you modify is automatically saved in session memory when you switch items—nothing is lost.</li>
                <li>Modified items display a <code>&#9998;</code> prefix in dropdowns, appear in the <code>&#9733; Session Tuned</code> mod filter, and are pinned at the top of the Caliber Lineup table.</li>
              </ul>
            </div>
            <div class="tut-card">
              <h4><span>HEMTT-Ready Config Generation</span> <span class="badge badge-green">CfgAmmo / Mags / Weapons</span></h4>
              <ul>
                <li>Exports <code>CfgAmmo</code> with proportionally scaled <code>ACE_muzzleVelocities[]</code> so ACE3 Advanced Ballistics respects your velocity changes in-game.</li>
                <li>Emits real scraped <code>CfgMagazines</code> classes and properly nested <code>CfgWeapons &gt;&gt; ItemInfo &gt;&gt; HitpointsProtectionInfo</code> blocks, topologically ordered so parent classes always precede derived camo variants.</li>
              </ul>
            </div>
          </div>
          <div class="tut-tip">
            <strong>Want to see every equation under the hood?</strong> Click <strong>Open &Sigma; Maths &amp; Physics Reference</strong> in the footer below!
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);" id="tutorialStepCounter">Step 1 of 6 &middot; Use &larr; / &rarr; keys</span>
          <button type="button" class="xs subtle-blue" id="btnSwitchTutToMaths">Open &Sigma; Maths &amp; Physics Reference</button>
        </div>
        <div class="btn-row">
          <button type="button" id="btnTutPrev">&larr; Previous</button>
          <button type="button" class="primary" id="btnTutNext">Next Step &rarr;</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- MODAL 2: COMPLETE ARMA 3 & ACE 3.21.2 MATHEMATICS REFERENCE           -->
  <!-- ===================================================================== -->
  <div class="modal-backdrop" id="mathsModal" role="dialog" aria-modal="true" aria-labelledby="mathsModalTitle">
    <div class="modal-dialog modal-wide">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon-badge">&Sigma; MATHS</span>
          <div>
            <h2 id="mathsModalTitle">Validated Arma 3 &amp; ACE 3.21.2 Ballistics, Armor &amp; Medical Mathematics</h2>
            <p>Exact closed-form &amp; numerical equations implemented in <code>wizard_engine.js</code>, verified against RV4 Engine formulas and ACE 3.21.2 source SQF.</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" data-close-modal="mathsModal" title="Close (Esc)">&times; Esc</button>
      </div>

      <div class="modal-subnav" id="mathsChaptersNav">
        <button type="button" class="modal-pill-btn active" data-math-chap="0"><span class="modal-pill-num">1</span> Exterior Ballistics &amp; Drag</button>
        <button type="button" class="modal-pill-btn" data-math-chap="1"><span class="modal-pill-num">2</span> RHAe Pen &amp; Vanilla RV4</button>
        <button type="button" class="modal-pill-btn" data-math-chap="2"><span class="modal-pill-num">3</span> ACE3 Armor Quantization</button>
        <button type="button" class="modal-pill-btn" data-math-chap="3"><span class="modal-pill-num">4</span> Wounds &amp; Triangular Roll</button>
        <button type="button" class="modal-pill-btn" data-math-chap="4"><span class="modal-pill-num">5</span> KO, Weibull &amp; Bleedout</button>
        <button type="button" class="modal-pill-btn" data-math-chap="5"><span class="modal-pill-num">6</span> Inverse Balancing Solvers</button>
      </div>

      <div class="modal-body">

        <!-- Live Active-Shot Telemetry Strip -->
        <div class="math-live-ribbon">
          <div class="math-live-hdr">
            <span id="mathLiveTitle">LIVE ACTIVE SHOT TELEMETRY: —</span>
            <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-dim);" id="mathLiveModeTag">Mode: ACE3 Armor Pen</span>
          </div>
          <div class="math-live-cells">
            <div class="math-live-cell"><span>Impact v(x)</span><strong id="mlVel">-</strong></div>
            <div class="math-live-cell"><span>Bullet RHAe</span><strong id="mlRha">-</strong></div>
            <div class="math-live-cell"><span>ACE Plate / r_pen</span><strong id="mlPlate">-</strong></div>
            <div class="math-live-cell"><span>ACE D_final / d_w</span><strong id="mlFinalDmg">-</strong></div>
            <div class="math-live-cell"><span>Bleed Rate</span><strong id="mlBleed">-</strong></div>
            <div class="math-live-cell"><span>P(KO) / P(Fatal)</span><strong id="mlKoFatal">-</strong></div>
          </div>
        </div>

        <!-- CHAPTER 1: EXTERIOR BALLISTICS -->
        <div class="modal-pane active" data-math-pane="0">
          <div class="math-section">
            <h3><span>1A. Vanilla Arma 3 Exponential Drag ODE</span> <span class="math-src-tag">RV4 ShotBullet &middot; airFriction</span></h3>
            <p>In base Arma 3 (when ACE3 Advanced Ballistics is disabled or a projectile lacks <code>ACE_ballisticCoefficients[]</code>), deceleration is strictly proportional to velocity squared with constant <code>k = airFriction &lt; 0</code> (units of m<sup>&minus;1</sup>):</p>
            <div class="math-eq">dv/dt = k &middot; v&sup2;   &rArr;   dv/dx = (dv/dt) / v = k &middot; v

v(x)   = v&#8320; &middot; exp(k &middot; x)
ToF(x) = (exp(&minus;k &middot; x) &minus; 1) / (&minus;k &middot; v&#8320;)
KE(x)  = &frac12; &middot; (m_grams / 1000) &middot; v(x)&sup2;        <span class="eq-comment">// Joules (J)</span></div>
          </div>

          <div class="math-section">
            <h3><span>1B. ACE 3.21.2 GNU Exterior Ballistics G1–G8 Drag</span> <span class="math-src-tag">ace_advanced_ballistics_fnc_calculateRetardation</span></h3>
            <p>When <strong>ACE3 G1–G8 Drag</strong> is active, AmmoMaster evaluates the exact piecewise Mach/velocity power-law tables <code>(v_min_fps, A_i, M_i)</code> from GNU Exterior Ballistics for models <strong>G1, G2, G5, G6, G7, G8</strong> under ICAO standard sea-level atmosphere (15&deg;C, 1013.25 hPa) and integrates spatially via 2nd-order Runge-Kutta (RK2 midpoint):</p>
            <div class="math-eq">v_fps = v_mps &times; 3.2808399
a_drag(v) = [ A_i &middot; (v_fps ^ M_i) / BC ] / 3.2808399    <span class="eq-comment">// Retardation in m/s&sup2; for table bracket v_fps &gt; v_min_i</span>

<span class="eq-comment">// Spatial ODE dv/dx = &minus;a_drag(v) / v integrated over adaptive step &Delta;x &isin; [0.25m, 1.5m]:</span>
v_mid  = v &minus; 0.5 &middot; &Delta;x &middot; (a_drag(v) / v)
v_next = v &minus; &Delta;x &middot; (a_drag(v_mid) / v_mid)
&Delta;t     = &Delta;x / [ 0.5 &middot; (v + v_next) ]</div>
            <ul>
              <li><strong>BC &rarr; Vanilla <code>airFriction</code> Fitting:</strong> Whenever you edit BC or apply a Real-World Spec, <code>solveAirFrictionFromBC</code> integrates G1/G7 flight to <code>x = 250 m</code> and sets <code>airFriction = ln(v_250 / v&#8320;) / 250</code> so AI and non-AB sessions match downrange trajectory.</li>
              <li><strong><code>ACE_muzzleVelocities[]</code> Scaling:</strong> When <code>initSpeed</code> changes, <code>syncAceBarrelMuzzleVelocities</code> scales the barrel velocity array by <code>v&#8320;_new / v_ref_orig</code> (anchoring to the ~16" / 406.4 mm barrel entry if the mod's original <code>initSpeed</code> and barrel array differed by &gt;8%).</li>
            </ul>
          </div>
        </div>

        <!-- CHAPTER 2: KINETIC PENETRATION & VANILLA DAMAGE -->
        <div class="modal-pane" data-math-pane="1">
          <div class="math-section">
            <h3><span>2A. Kinetic RHAe Penetration &amp; Ricochet</span> <span class="math-src-tag">RV4 Engine &middot; ARMOR_PENETRABILITY = 0.015</span></h3>
            <p>Both Real Virtuality 4 fire-geometry penetration and ACE3's armor penetration handler compute rolled homogeneous armor equivalency (mm RHAe) linearly from normal impact speed and dimensionless <code>CfgAmmo &gt;&gt; caliber</code>:</p>
            <div class="math-eq">v_eff       = v(x) &middot; max(0.05, cos &theta;)                <span class="eq-comment">// &theta; = impact obliquity angle (deg)</span>
RHAe_mm     = v_eff &times; caliber &times; 0.015                <span class="eq-comment">// 15 mm RHAe per 1000 m/s at caliber = 1.0</span>
Concrete_mm = RHAe_mm &times; (80 / 15)                    <span class="eq-comment">// 80 mm per 1000 m/s at caliber = 1.0</span>
Meat_mm     = RHAe_mm &times; (250 / 15)                   <span class="eq-comment">// 250 mm tissue channel reference</span>
isRicochet  = (&theta; &gt; 90&deg; &minus; deflecting)</div>
          </div>

          <div class="math-section">
            <h3><span>2B. Base Arma 3 Hitpoint &amp; Structural Damage</span> <span class="math-src-tag">CAManBase HitPoints</span></h3>
            <p>Note that Arma 3 scales kinetic bullet damage <strong>linearly</strong> with <code>v_eff / typicalSpeed</code> (kinetic energy scales with <code>v&sup2;</code>, while raw engine hit scales with <code>v</code>):</p>
            <div class="math-eq">D_raw    = hit &middot; (1 &minus; explosive) &middot; (v_eff / typicalSpeed) + hit &middot; explosive
A_uni    = unitBaseArmor &times; hitpointArmorMult          <span class="eq-comment">// Typically 2.0 &times; 1.0 = 2.0 on CAManBase</span>
A_van    = max(1.0, A_uni + A_vest_raw + A_helm_raw)
PT_eff   = PT_hitpoint &times; PT_vest &times; PT_helm

D_hp     = D_raw / A_van                              <span class="eq-comment">// Passed into HandleDamage event handler!</span>
D_struct = (D_hp &times; PT_eff) / armorStructural          <span class="eq-comment">// Global total-damage transfer (default structural = 4.0)</span></div>
            <ul>
              <li>In vanilla Arma 3 (without ACE Medical), vital hitpoints (Head, Face, Neck, Chest, Diaphragm, Abdomen, Pelvis) kill immediately at <code>max(D_hp, D_struct) &ge; 1.0</code>, whereas limb hits only kill via cumulative <code>D_struct &ge; 1.0</code>.</li>
            </ul>
          </div>
        </div>

        <!-- CHAPTER 3: ACE3 ARMOR QUANTIZATION & PENETRATION -->
        <div class="modal-pane" data-math-pane="2">
          <div class="math-section">
            <h3><span>3A. Over-Capped Armor Logarithmic Scaling (#9063)</span> <span class="math-src-tag">ace_medical_engine_fnc_getItemArmor</span></h3>
            <p>To prevent extreme modded vest/helmet configs from making units invincible, ACE 3.21.2 compresses item armor logarithmically whenever raw armor exceeds 6 tier steps (<code>armor &gt; 24</code> for vests where <code>step = 4</code>, or <code>armor &gt; 12</code> for helmets where <code>step = 2</code>):</p>
            <div class="math-eq">&Delta;_step = 4 (vest)  |  2 (helmet)
&alpha;_pt   = 0.6 (vest) | 1.0 (helmet)
PT_c   = clamp(passThrough, 0.1, 1.0)

A_item_ace = (A_raw &gt; 6 &middot; &Delta;_step)
           ? 10 &middot; log10( A_raw / (PT_c ^ &alpha;_pt) )
           : A_raw

A_total_ace = max(1.0, A_uni + A_vest_ace + A_helm_ace)
D_real      = D_hp &times; A_total_ace                      <span class="eq-comment">// Reconstructs unarmored raw damage inside ACE</span></div>
          </div>

          <div class="math-section">
            <h3><span>3B. Discrete ACE Armor Levels I–V &amp; Post-Plate Damage</span> <span class="math-src-tag">ace_medical_damage_fnc_woundsHandlerArmorPenetration</span></h3>
            <p>For <code>ACE_damageType = "bullet"</code>, when net armor above base skin (<code>A_net = A_total_ace &minus; 2.0</code>) exceeds one step (<code>&gt; 4</code> on torso, <code>&gt; 2</code> on head), ACE quantizes protection into 5 discrete RHAe plate thicknesses:</p>
            <table class="math-table">
              <thead>
                <tr><th>ACE Tier</th><th>Level I</th><th>Level II</th><th>Level III</th><th>Level IV</th><th>Level V</th></tr>
              </thead>
              <tbody>
                <tr><td>Plate RHAe (T_plate)</td><td>6 mm</td><td>15 mm</td><td>21 mm</td><td>40 mm</td><td>55 mm</td></tr>
                <tr><td>Torso A_net Bracket (&Delta;=4)</td><td>4.1 – 10</td><td>10 – 14</td><td>14 – 18</td><td>18 – 22</td><td>&gt; 22</td></tr>
                <tr><td>Head A_net Bracket (&Delta;=2)</td><td>2.1 – 5</td><td>5 – 7</td><td>7 – 9</td><td>9 – 11</td><td>&gt; 11</td></tr>
              </tbody>
            </table>
            <div class="math-eq">idx     = clamp( round( (A_net &minus; 2&middot;&Delta;_step) / &Delta;_step ), 0, 4 )
T_plate = [6, 15, 21, 40, 55][idx]                    <span class="eq-comment">// mm RHAe</span>

v_ace   = (D_real / hit) &times; max(typicalSpeed, 1)
d_pen   = v_ace &times; caliber &times; 0.015                     <span class="eq-comment">// Bullet RHAe mm at impact</span>
r_pen   = min(1.0, d_pen / T_plate)                   <span class="eq-comment">// Fraction of plate perforated &isin; [0, 1]</span>
D_final = (hit &times; r_pen) / 10.0                        <span class="eq-comment">// DAMAGE_SCALING_FACTOR = 10.0</span></div>
            <p>When unarmored (<code>A_net &le; &Delta;_step</code>), the armor penetration handler is bypassed and <code>D_final = D_hp = D_raw / A_van</code> directly (so for base uniform <code>A_van = 2.0</code>, an unarmored muzzle hit yields <code>D_final &approx; hit / 2</code>, which is <strong>5&times; higher</strong> than the armored <code>hit / 10</code> ceiling!).</p>
          </div>
        </div>

        <!-- CHAPTER 4: WOUND GENERATION & TRIANGULAR VARIANCE -->
        <div class="modal-pane" data-math-pane="3">
          <div class="math-section">
            <h3><span>4A. Fractional Wound Count &amp; The 0.35 Penetration Threshold</span> <span class="math-src-tag">ACE_Medical_Injuries.hpp</span></h3>
            <p>ACE interpolates expected wound count <code>E[N]</code> from <code>D_final</code> across <code>bullet</code> thresholds <code>[[20, 10], [4.5, 2], [3, 1], [0, 1]]</code> (so for <code>0 &lt; D_final &le; 3.0</code>, exactly <code>N = 1</code> wound is created and <code>d_wound = D_final</code>):</p>
            <div class="math-eq">d_wound = D_final / N                                 <span class="eq-comment">// Per-wound damage driving wound type weights:</span>

&bull; d_wound &le; 0.35 : 100% Contusion      (bleed=0.00, pain=0.3&times;2.2, sizeMult=3.2) &rarr; STOPPED (Blunt Bruise)
&bull; 0.35 &lt; d_wound &lt; 1.0 : VelocityWound (bleed=0.20, pain=0.9, sizeMult=0.9) + Avulsion (bleed=0.10, pain=1.0)
&bull; d_wound &ge; 1.50 : 100% Avulsion       (severe tissue cavitary wound)</div>
            <p>Notice the mathematical consequence when <code>N = 1</code>: penetrating an ACE plate requires <code>d_wound &gt; 0.35 &hArr; (hit &times; r_pen) / 10 &gt; 0.35 &hArr; r_pen &gt; 3.5 / hit</code>! For a rifle round with <code>hit = 9.5</code>, bleeding begins at <code>r_pen = 36.8%</code> of plate thickness; if <code>hit &le; 3.5</code>, a bullet can <em>never</em> exceed <code>0.35</code> through armor even at <code>r_pen = 100%</code>.</p>
          </div>

          <div class="math-section">
            <h3><span>4B. Wound Sizing &amp; Exact SQF Triangular Variance</span> <span class="math-src-tag">random [0.9, 1.0, 1.1]</span></h3>
            <p>In live SQF execution, ACE multiplies incoming damage by <code>random [0.9, 1, 1.1]</code>—the sum of two uniform variables, forming a symmetric triangular distribution on <code>[0.9, 1.1]</code>. Rather than noisy Monte Carlo approximations, AmmoMaster computes exact analytical survival probabilities using the closed-form complementary CDF:</p>
            <div class="math-eq">woundSize = clamp_lerp(0.1 &rarr; 2.0,  d_wound &times; sizeMult,  0.125 &rarr; 1.0)
bleed_w   = woundSize &times; bleedMult &times; baseBleeding      <span class="eq-comment">// Fraction of cardiac output</span>
pain_w    = woundSize &times; painMult  &times; basePain

P(V &ge; r) = | 1.0                          if r &le; 0.9
           | 1.0 &minus; 0.5 &middot; ((r &minus; 0.9)/0.1)&sup2; if 0.9 &lt; r &le; 1.0
           | 0.5 &middot; ((1.1 &minus; r)/0.1)&sup2;       if 1.0 &lt; r &lt; 1.1
           | 0.0                          if r &ge; 1.1</div>
          </div>
        </div>

        <!-- CHAPTER 5: MEDICAL STATUS, KO, WEIBULL & BLEEDOUT -->
        <div class="modal-pane" data-math-pane="4">
          <div class="math-section">
            <h3><span>5A. Vital Organ Death, Weibull Trauma &amp; Unconsciousness</span> <span class="math-src-tag">ace_medical_damage &amp; status</span></h3>
            <p>Let <code>M_th</code> be the mission's <code>ACE_medical_playerDamageThreshold</code> (header <strong>Trauma Mult</strong>, default <code>1.0</code>):</p>
            <div class="math-eq"><span class="eq-comment">// 1. Immediate Vital Organ / Cranial Fatality (per-wound check):</span>
Head Fatal  : V &middot; d_wound &ge; 1.00                      <span class="eq-comment">// Instant lethal cranial destruction</span>
Heart Fatal : V &middot; d_wound &ge; 0.60  with 5% roll        <span class="eq-comment">// HEART_HIT_CHANCE = 0.05 on Torso</span>

<span class="eq-comment">// 2. Cumulative Part Trauma Weibull Fatality (XEH_preInit.sqf: 10% @ +0.5, 90% @ +0.8):</span>
k = ln(ln(0.9)/ln(0.1)) / ln(0.5/0.8) &approx; 6.5593,   &lambda; = 0.5 / (&minus;ln 0.9)^(1/k) &approx; 0.7041
T_part = 1.25 &middot; M_th (Head)  |  1.50 &middot; M_th (Torso)
P_weibull(D_part) = 1 &minus; exp( &minus;( max(0, D_part &minus; T_part) / &lambda; )^k )

<span class="eq-comment">// 3. Unconsciousness (fnc_handleIncapacitation):</span>
Head Trauma KO  : D_head &ge; 0.50 &middot; M_th
Torso Trauma KO : (d_wound &ge; 0.35) AND (D_body &ge; 1.00 &middot; M_th)
Pain Shock KO   : (Pain &ge; 0.50) triggers a 10% roll per hit (PAIN_UNCONSCIOUS_CHANCE = 0.10)</div>
          </div>

          <div class="math-section">
            <h3><span>5B. Regional Hemorrhage Caps &amp; Time to Cardiac Arrest</span> <span class="math-src-tag">ace_medical_status_fnc_getBloodLoss</span></h3>
            <p>ACE caps raw bleeding per limb before multiplying by instantaneous Cardiac Output (<code>CO&#8320; = 0.095 L &times; 80 BPM / 60 = 0.12667 L/s = 126.7 mL/s</code>). Fatal exsanguination occurs when blood volume drops from <code>6.0 L</code> to <code>3.0 L</code> (mean decaying CO &approx; <code>82 mL/s</code>):</p>
            <div class="math-eq">B_core  = min(1.0,  min(0.9, B_head) + min(1.0, B_body))
B_limbs = min(1.0,  min(0.3, B_LA) + min(0.3, B_RA) + min(0.5, B_LL) + min(0.5, B_RL)) &times; (1 &minus; B_core)
B_total = B_core + B_limbs                            <span class="eq-comment">// Tourniquet sets limb B_i = 0</span>

Initial Flow (mL/s) = B_total &times; 126.67 mL/s
Est. Time to Arrest = 3.0 L / (B_total &times; 0.082 L/s)   <span class="eq-comment">// Seconds from 6.0 L &rarr; 3.0 L</span></div>
          </div>
        </div>

        <!-- CHAPTER 6: INVERSE SOLVERS & BI KINETIC PROFILES -->
        <div class="modal-pane" data-math-pane="5">
          <div class="math-section">
            <h3><span>6A. Bisection Cutoff &amp; Inverse <code>caliber</code> Solvers</span> <span class="math-src-tag">computeMaxCriterionRange / solveCaliberForTargetRange</span></h3>
            <p>Because G1–G8 velocity decay and multi-wound ACE thresholds are non-invertible algebraically, AmmoMaster uses fast monotonic bisection:</p>
            <ul>
              <li><strong>Max Cutoff Range (<code>computeMaxCriterionRange</code>):</strong> 22 bisection steps on <code>[0, 2000] m</code> (&plusmn;0.0005 m precision) testing whether the chosen goal passes at distance <code>x</code>.</li>
              <li><strong>Inverse <code>caliber</code> Solver (<code>solveCaliberForTargetRange</code>):</strong> 28 bisection steps on <code>caliber &isin; [0.02, 30.0]</code> so the target plate transitions from <em>passing</em> to <em>stopped</em> right at <code>desiredDist + 0.25 m</code> (or targets <code>ratio = 0.85</code> at <code>0 m</code> for <strong>Stop @ 0m</strong> so even a <code>+10%</code> roll cannot penetrate).</li>
              <li><strong>Minimum Viable <code>hit</code> Guard:</strong> If a user requests a cutoff &gt; 0m for <code>ace_bleed</code> (requires <code>hit &gt; 3.52</code>), <code>ace_heart</code> (<code>hit &ge; 6.0</code>), or <code>ace_ko</code> (<code>hit &ge; 10.0 &middot; M_th</code>), the solver automatically bumps <code>hit</code> to the mathematical minimum when dragging the penetration bar.</li>
            </ul>
          </div>

          <div class="math-section">
            <h3><span>6B. Decoupled <code>Lock Armor Pen Range</code> &amp; BI Energy Profiles</span> <span class="math-src-tag">Ammunition Balancing Invariants</span></h3>
            <div class="math-eq"><span class="eq-comment">// Invariant maintaining constant post-armor wound damage D_final at cutoff distance x_c:</span>
D_final(x_c) = [ hit &times; v(x_c) &times; caliber &times; 0.015 ] / (10 &times; T_plate) = const
  &rArr;  caliber_new = caliber_old &times; (hit_old / hit_new)   <span class="eq-comment">(refined via full 28-step bisection for N &gt; 1 wounds)</span>

<span class="eq-comment">// Bohemia Interactive empirical hit baseline from muzzle kinetic energy KE&#8320; (Joules):</span>
hit_BI = k_profile &times; (&radic;KE&#8320; / 5.0)
  where k_profile = 0.88 (Sub-caliber AP) | 1.00 (FMJ Ball) | 1.12 (Yawing EPR/OTM) | 1.25 (Expanding JHP)</div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);" id="mathsChapterCounter">Chapter 1 of 6 &middot; Validated against Arma 3 2.18 &amp; ACE 3.21.2</span>
          <button type="button" class="xs subtle-blue" id="btnSwitchMathsToTut">Open ? Step-by-Step Tutorial</button>
        </div>
        <div class="btn-row">
          <button type="button" id="btnMathPrev">&larr; Previous</button>
          <button type="button" class="primary" id="btnMathNext">Next Chapter &rarr;</button>
        </div>
      </div>
    </div>
  </div>

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
