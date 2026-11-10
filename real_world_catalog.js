// ============================================================================
// Comprehensive Real-World Small-Arms & Cannon Ballistics Catalogue
// Verified SAAMI / CIP / MIL-DTL / GRAU / Manufacturer (Hornady, Lapua, Berger,
// Sierra, Barnes, Federal, FN, HK, RUAG Swiss P, Nammo) specifications.
// Covers every caliber family across Arma 3, ACE3, Project M, Realish Armoury,
// Realish Antiques, Quiggs Firearms, JCA Arsenal & Aegis.
// ============================================================================
const REAL_WORLD_CARTRIDGE_LIBRARY = [
  // ==========================================================================
  // 1. Rimfire & Service Pistol (.22 LR – .50 AE)
  // ==========================================================================
  { id: "22lr_subsonic_40", group: "Rimfire & Pistol", name: ".22 LR CCI Subsonic HP — 40gr (2.59g @ 320 m/s)", massGrams: 2.59, diamMM: 5.66, muzzleVel: 320, bc: 0.120, dragModel: 1, profile: "1.12", armorLevel: "0", maxPenDist: 0, matchRe: /22lr.*sub/i },
  { id: "22lr_velocitor_40", group: "Rimfire & Pistol", name: ".22 LR CCI Velocitor CPHP — 40gr (2.59g @ 437 m/s)", massGrams: 2.59, diamMM: 5.66, muzzleVel: 437, bc: 0.132, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /22lr.*velocitor/i },
  { id: "22lr_minimag_36", group: "Rimfire & Pistol", name: ".22 LR CCI Mini-Mag CPHP — 36gr (2.33g @ 384 m/s)", massGrams: 2.33, diamMM: 5.66, muzzleVel: 384, bc: 0.125, dragModel: 1, profile: "1.12", armorLevel: "0", maxPenDist: 0, matchRe: /22lr.*minimag|22lr/i },

  { id: "9x19_98_frang", group: "Rimfire & Pistol", name: "9x19mm SinterFire Frangible — 98gr (6.35g @ 415 m/s)", massGrams: 6.35, diamMM: 9.02, muzzleVel: 415, bc: 0.105, dragModel: 1, profile: "1.12", armorLevel: "0", maxPenDist: 0, matchRe: /9x19.*98|frang/i },
  { id: "9x19_115_fmj", group: "Rimfire & Pistol", name: "9x19mm Parabellum 115gr FMJ — 4.5\" bbl (7.45g @ 360 m/s)", massGrams: 7.45, diamMM: 9.02, muzzleVel: 360, bc: 0.135, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 35, matchRe: /9x19.*115.*fmj/i },
  { id: "9x19_m1152_115", group: "Rimfire & Pistol", name: "9x19mm US Army M1152 Ball — M17 4.7\" (7.45g / 115gr @ 402 m/s)", massGrams: 7.45, diamMM: 9.02, muzzleVel: 402, bc: 0.138, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 55, matchRe: /m1152|p320|m17.*fmj/i },
  { id: "9x19_115_jhp", group: "Rimfire & Pistol", name: "9x19mm 115gr +P JHP Duty — 4.5\" bbl (7.45g @ 411 m/s)", massGrams: 7.45, diamMM: 9.02, muzzleVel: 411, bc: 0.130, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /9x19.*115.*hp/i },
  { id: "m882_9x19", group: "Rimfire & Pistol", name: "9x19mm NATO M882 Ball — 124gr FMJ (8.04g @ 385 m/s)", massGrams: 8.04, diamMM: 9.02, muzzleVel: 385, bc: 0.145, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 50, matchRe: /m882|9x19.*124.*fmj|ace_9x19|jca_b_9x19/i },
  { id: "9x19_124_jhp", group: "Rimfire & Pistol", name: "9x19mm Federal HST / Gold Dot 124gr +P JHP (8.04g @ 372 m/s)", massGrams: 8.04, diamMM: 9.02, muzzleVel: 372, bc: 0.140, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /9x19.*124.*hp/i },
  { id: "9x19_135_ftx", group: "Rimfire & Pistol", name: "9x19mm Hornady Critical Duty 135gr +P FTX (8.75g @ 338 m/s)", massGrams: 8.75, diamMM: 9.02, muzzleVel: 338, bc: 0.162, dragModel: 1, profile: "1.25", armorLevel: "1", maxPenDist: 20, matchRe: /9x19.*135.*ftx/i },
  { id: "9x19_147_fmj", group: "Rimfire & Pistol", name: "9x19mm 147gr Subsonic FMJ — Suppressor Load (9.53g @ 305 m/s)", massGrams: 9.53, diamMM: 9.02, muzzleVel: 305, bc: 0.175, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 25, matchRe: /9x19.*147.*fmj/i },
  { id: "9x19_147_jhp", group: "Rimfire & Pistol", name: "9x19mm M1153 / Federal HST 147gr JHP Subsonic (9.53g @ 305 m/s)", massGrams: 9.53, diamMM: 9.02, muzzleVel: 305, bc: 0.168, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /9x19.*147.*hp|m1153/i },
  { id: "7n21_9x19", group: "Rimfire & Pistol", name: "9x19mm 7N21 +P+ Hardened Steel AP (5.30g / 82gr @ 460 m/s)", massGrams: 5.30, diamMM: 9.02, muzzleVel: 460, bc: 0.135, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 60, matchRe: /7n21/i },
  { id: "7n31_9x19", group: "Rimfire & Pistol", name: "9x19mm 7N31 +P+ Overpressure Steel AP (4.15g / 64gr @ 600 m/s)", massGrams: 4.15, diamMM: 9.02, muzzleVel: 600, bc: 0.125, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 110, matchRe: /7n31/i },
  { id: "9x21_ball", group: "Rimfire & Pistol", name: "9x21mm IMI / SMG Ball — 124gr FMJ (8.04g @ 395 m/s)", massGrams: 8.04, diamMM: 9.02, muzzleVel: 395, bc: 0.145, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 60, matchRe: /b_9x21/i },
  { id: "9x21_7n29_ap", group: "Rimfire & Pistol", name: "9x21mm Gyurza SP-10 (7N29) Hardened Steel AP (6.70g / 103gr @ 410 m/s)", massGrams: 6.70, diamMM: 9.02, muzzleVel: 410, bc: 0.150, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 65, matchRe: /7n29|sp10/i },

  { id: "40sw_180_hst", group: "Rimfire & Pistol", name: ".40 S&W Federal HST 180gr JHP — 4\" bbl (11.66g @ 308 m/s)", massGrams: 11.66, diamMM: 10.16, muzzleVel: 308, bc: 0.166, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /40sw|hst/i },
  { id: "40sw_165_fmj", group: "Rimfire & Pistol", name: ".40 S&W 165gr FMJ Service Load (10.69g @ 345 m/s)", massGrams: 10.69, diamMM: 10.16, muzzleVel: 345, bc: 0.155, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 45, matchRe: /40sw.*fmj/i },

  { id: "45acp_185_fmj", group: "Rimfire & Pistol", name: ".45 ACP 185gr FMJ Target/Service — 5\" (11.99g @ 295 m/s)", massGrams: 11.99, diamMM: 11.48, muzzleVel: 295, bc: 0.148, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 15, matchRe: /45acp.*185.*fmj/i },
  { id: "45acp_185_jhp", group: "Rimfire & Pistol", name: ".45 ACP 185gr +P JHP / Hornady FTX — 5\" (11.99g @ 350 m/s)", massGrams: 11.99, diamMM: 11.48, muzzleVel: 350, bc: 0.152, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /45acp.*185.*(?:hp|ftx)/i },
  { id: "45acp_200_fmj", group: "Rimfire & Pistol", name: ".45 ACP 200gr FMJ — 5\" (12.96g @ 285 m/s)", massGrams: 12.96, diamMM: 11.48, muzzleVel: 285, bc: 0.168, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /45acp.*200.*fmj/i },
  { id: "45acp_200_jhp", group: "Rimfire & Pistol", name: ".45 ACP 200gr +P JHP — 5\" (12.96g @ 320 m/s)", massGrams: 12.96, diamMM: 11.48, muzzleVel: 320, bc: 0.165, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /45acp.*200.*hp/i },
  { id: "45acp_220_ftx", group: "Rimfire & Pistol", name: ".45 ACP Hornady Critical Duty 220gr +P FTX (14.26g @ 297 m/s)", massGrams: 14.26, diamMM: 11.48, muzzleVel: 297, bc: 0.186, dragModel: 1, profile: "1.25", armorLevel: "1", maxPenDist: 15, matchRe: /45acp.*220.*ftx/i },
  { id: "m1911_45acp", group: "Rimfire & Pistol", name: ".45 ACP M1911 230gr FMJ Ball — 5\" Pistol (14.90g @ 253 m/s)", massGrams: 14.90, diamMM: 11.48, muzzleVel: 253, bc: 0.195, dragModel: 1, profile: "1.05", armorLevel: "0", maxPenDist: 0, matchRe: /45acp.*230.*fmj|m1911|b_45acp/i },
  { id: "45acp_230_smg", group: "Rimfire & Pistol", name: ".45 ACP 230gr FMJ — 8\" SMG UMP/Vector (14.90g @ 285 m/s)", massGrams: 14.90, diamMM: 11.48, muzzleVel: 285, bc: 0.195, dragModel: 1, profile: "1.05", armorLevel: "1", maxPenDist: 20, matchRe: /jca_b_45acp/i },
  { id: "45acp_230_jhp", group: "Rimfire & Pistol", name: ".45 ACP Federal HST / Gold Dot 230gr +P JHP (14.90g @ 271 m/s)", massGrams: 14.90, diamMM: 11.48, muzzleVel: 271, bc: 0.185, dragModel: 1, profile: "1.25", armorLevel: "0", maxPenDist: 0, matchRe: /45acp.*230.*hp/i },

  { id: "45lc_250_rn", group: "Rimfire & Pistol", name: ".45 Colt (Long Colt) 250gr RN — 5.5\" Revolver (16.20g @ 260 m/s)", massGrams: 16.20, diamMM: 11.48, muzzleVel: 260, bc: 0.145, dragModel: 1, profile: "1.12", armorLevel: "0", maxPenDist: 0, matchRe: /45lc/i },
  { id: "44mag_240_jhp", group: "Rimfire & Pistol", name: ".44 Remington Magnum 240gr JHP — 6\" Revolver (15.55g @ 360 m/s)", massGrams: 15.55, diamMM: 10.90, muzzleVel: 360, bc: 0.172, dragModel: 1, profile: "1.25", armorLevel: "1", maxPenDist: 55, matchRe: /44rm|44mag/i },
  { id: "50ae_300_jhp", group: "Rimfire & Pistol", name: ".50 Action Express (12.7x33mm) 300gr JHP — 6\" Desert Eagle (19.44g @ 440 m/s)", massGrams: 19.44, diamMM: 12.70, muzzleVel: 440, bc: 0.155, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 25, matchRe: /127x33|50ae/i },

  // ==========================================================================
  // 2. PDW & Subgun (4.6x30mm HK & 5.7x28mm FN)
  // ==========================================================================
  { id: "dm11_mp7", group: "PDW (4.6x30 & 5.7x28)", name: "4.6x30mm HK DM11 Steel AP — MP7 7.1\" (2.00g / 31gr @ 720 m/s)", massGrams: 2.00, diamMM: 4.65, muzzleVel: 720, bc: 0.141, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 200, matchRe: /46x30.*dm11|^b_460x30/i },
  { id: "dm21_mp7", group: "PDW (4.6x30 & 5.7x28)", name: "4.6x30mm HK DM21 40gr FMJ Ball — MP7 7.1\" (2.59g @ 685 m/s)", massGrams: 2.59, diamMM: 4.65, muzzleVel: 685, bc: 0.168, dragModel: 1, profile: "1.00", armorLevel: "2", maxPenDist: 100, matchRe: /46x30.*fmj|jca_b_460x30/i },
  { id: "46x30_sub_42", group: "PDW (4.6x30 & 5.7x28)", name: "4.6x30mm RUAG 42gr Subsonic FMJ — MP7 (2.72g @ 320 m/s)", massGrams: 2.72, diamMM: 4.65, muzzleVel: 320, bc: 0.180, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 30, matchRe: /46x30.*sub/i },

  { id: "ss190_p90", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm FN SS190 Duty AP — P90 10.4\" (2.00g / 31gr @ 715 m/s)", massGrams: 2.00, diamMM: 5.70, muzzleVel: 715, bc: 0.162, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 200, matchRe: /570x28.*ss190|mpp_57_ss190|b_570x28_ball/i },
  { id: "ss190_57pistol", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm FN SS190 Duty AP — Five-seveN 4.8\" (2.00g / 31gr @ 650 m/s)", massGrams: 2.00, diamMM: 5.70, muzzleVel: 650, bc: 0.162, dragModel: 1, profile: "0.88", armorLevel: "2", maxPenDist: 100, matchRe: /ss190.*pistol/i },
  { id: "ss197sr_pistol", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm FN SS197SR 40gr V-MAX — Five-seveN 4.8\" (2.59g @ 520 m/s)", massGrams: 2.59, diamMM: 5.70, muzzleVel: 520, bc: 0.200, dragModel: 1, profile: "1.25", armorLevel: "1", maxPenDist: 50, matchRe: /ss197|ss196/i },
  { id: "ss198lf_pistol", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm FN SS198LF 27gr Hollow Point — Five-seveN (1.75g @ 640 m/s)", massGrams: 1.75, diamMM: 5.70, muzzleVel: 640, bc: 0.128, dragModel: 1, profile: "1.12", armorLevel: "2", maxPenDist: 35, matchRe: /ss198/i },
  { id: "sb193_p90", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm FN SB193 55gr Subsonic — P90 10.4\" (3.60g @ 305 m/s)", massGrams: 3.60, diamMM: 5.70, muzzleVel: 305, bc: 0.251, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 35, matchRe: /sb193/i },
  { id: "s4m_p90", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm Elite Ammo S4M 28gr Hyper-Vel — P90 (1.81g @ 915 m/s)", massGrams: 1.81, diamMM: 5.70, muzzleVel: 915, bc: 0.135, dragModel: 1, profile: "1.00", armorLevel: "2", maxPenDist: 230, matchRe: /57_s4m/i },
  { id: "t6b_p90", group: "PDW (4.6x30 & 5.7x28)", name: "5.7x28mm Elite Ammo T6B Solid Copper AP — P90 (1.81g / 28gr @ 930 m/s)", massGrams: 1.81, diamMM: 5.70, muzzleVel: 930, bc: 0.139, dragModel: 1, profile: "0.88", armorLevel: "3", maxPenDist: 55, matchRe: /570x28_t6b/i },

  // ==========================================================================
  // 3. Shotgun, Subsonic AP & Big-Bore AR (12ga, 9x39, 12.7x55, .458, .50 BW)
  // ==========================================================================
  { id: "12ga_no1buck_pellet", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge #1 Buckshot (Single Pellet: 40.5gr / 7.62mm @ 381 m/s)", massGrams: 2.62, diamMM: 7.62, muzzleVel: 381, bc: 0.059, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /no1_buck|no2_buck|no3_buck/i },
  { id: "12ga_no4buck_pellet", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge #4 Buckshot (Single Pellet: 20.7gr / 6.10mm @ 381 m/s)", massGrams: 1.34, diamMM: 6.10, muzzleVel: 381, bc: 0.048, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /no4_buck/i },
  { id: "12ga_birdshot_pellet", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge #4 Birdshot (Single Pellet: 3.2gr / 3.30mm @ 381 m/s)", massGrams: 0.21, diamMM: 3.30, muzzleVel: 381, bc: 0.026, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /no4_bird/i },
  { id: "12ga_00buck_pellet", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge #00 Buckshot (Single Pellet: 53.8gr / 8.38mm @ 404 m/s)", massGrams: 3.49, diamMM: 8.38, muzzleVel: 404, bc: 0.065, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /12gauge.*pellets|no0_buck/i },
  { id: "12ga_foster_slug", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge 1 oz (437gr) Foster Rifled Lead Slug (28.35g @ 480 m/s)", massGrams: 28.35, diamMM: 18.50, muzzleVel: 480, bc: 0.088, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 30, matchRe: /b_12gauge_slug/i },
  { id: "12ga_sabot_slug", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge 300gr Copper Sabot Rifled Slug (19.44g @ 610 m/s)", massGrams: 19.44, diamMM: 12.70, muzzleVel: 610, bc: 0.210, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 100, matchRe: /ace_12gauge_slug/i },
  { id: "12ga_flechette", group: "Shotgun, 9x39 & Big-Bore", name: "12 Gauge Steel Dart Flechette (Single Dart @ 580 m/s)", massGrams: 1.30, diamMM: 4.00, muzzleVel: 580, bc: 0.145, dragModel: 1, profile: "0.88", armorLevel: "1", maxPenDist: 65, matchRe: /flechette/i },
  { id: "410_buck_pellet", group: "Shotgun, 9x39 & Big-Bore", name: ".410 Bore #000 Buckshot (Single Pellet: 70gr / 9.1mm @ 345 m/s)", massGrams: 4.54, diamMM: 9.14, muzzleVel: 345, bc: 0.072, dragModel: 1, profile: "1.00", armorLevel: "0", maxPenDist: 0, matchRe: /b_410/i },

  { id: "9x39_sp5", group: "Shotgun, 9x39 & Big-Bore", name: "9x39mm SP-5 (7N8) Subsonic Sniper Ball — VSS (16.80g / 259gr @ 290 m/s)", massGrams: 16.80, diamMM: 9.25, muzzleVel: 290, bc: 0.440, dragModel: 1, profile: "1.05", armorLevel: "2", maxPenDist: 120, matchRe: /9x39.*sp5|7n8/i },
  { id: "9x39_sp6", group: "Shotgun, 9x39 & Big-Bore", name: "9x39mm SP-6 Subsonic Hardened Steel AP — AS Val (16.20g / 250gr @ 290 m/s)", massGrams: 16.20, diamMM: 9.25, muzzleVel: 290, bc: 0.435, dragModel: 1, profile: "0.95", armorLevel: "3", maxPenDist: 75, matchRe: /9x39.*sp6/i },
  { id: "9x39_7n9_spp", group: "Shotgun, 9x39 & Big-Bore", name: "9x39mm SPP (7N9) Subsonic Sniper Penetrator — VSS (15.70g / 242gr @ 310 m/s)", massGrams: 15.70, diamMM: 9.25, muzzleVel: 310, bc: 0.455, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 100, matchRe: /9x39.*7n9|rc_9x39/i },

  { id: "127x55_sts130", group: "Shotgun, 9x39 & Big-Bore", name: "12.7x55mm STs-130PT Heavy Subsonic Sniper — VKS (48.20g / 744gr @ 295 m/s)", massGrams: 48.20, diamMM: 13.01, muzzleVel: 295, bc: 0.570, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 160, matchRe: /b_127x54/i },
  { id: "127x55_ps12b", group: "Shotgun, 9x39 & Big-Bore", name: "12.7x55mm PS-12B Subsonic Hardened AP — ASh-12 (16.50g / 255gr @ 300 m/s)", massGrams: 16.50, diamMM: 13.01, muzzleVel: 300, bc: 0.310, dragModel: 1, profile: "0.95", armorLevel: "3", maxPenDist: 100, matchRe: /ps12b/i },

  { id: "458socom_86_alu", group: "Shotgun, 9x39 & Big-Bore", name: ".458 SOCOM Lehigh 86gr CQB Aluminum — 16\" (5.57g @ 760 m/s)", massGrams: 5.57, diamMM: 11.63, muzzleVel: 760, bc: 0.115, dragModel: 1, profile: "1.25", armorLevel: "1", maxPenDist: 80, matchRe: /458socom_86/i },
  { id: "458socom_275_hp", group: "Shotgun, 9x39 & Big-Bore", name: ".458 SOCOM Barnes 275gr TSX / HP — 16\" (17.82g @ 515 m/s)", massGrams: 17.82, diamMM: 11.63, muzzleVel: 515, bc: 0.254, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 120, matchRe: /458socom_275/i },
  { id: "458socom_500_sub", group: "Shotgun, 9x39 & Big-Bore", name: ".458 SOCOM 500gr Subsonic DGS RN — 16\" (32.40g @ 305 m/s)", massGrams: 32.40, diamMM: 11.63, muzzleVel: 305, bc: 0.430, dragModel: 1, profile: "1.05", armorLevel: "2", maxPenDist: 80, matchRe: /458socom_500/i },
  { id: "50bw_335_fmj", group: "Shotgun, 9x39 & Big-Bore", name: ".50 Beowulf (12.7x42mm) 335gr FMJ — 16\" (21.70g @ 570 m/s)", massGrams: 21.70, diamMM: 12.70, muzzleVel: 570, bc: 0.215, dragModel: 1, profile: "1.18", armorLevel: "2", maxPenDist: 150, matchRe: /b_50bw/i },

  // ==========================================================================
  // 4. 5.45x39, 5.56x45 & 5.8x42 Service Carbines
  // ==========================================================================
  { id: "7n6m_545", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.45x39mm 7N6M Mild Steel Core — AK-74M 16.3\" (3.43g / 53gr @ 880 m/s)", massGrams: 3.43, diamMM: 5.60, muzzleVel: 880, bc: 0.329, dragModel: 1, profile: "1.12", armorLevel: "2", maxPenDist: 350, matchRe: /b_545x39_ball|7n6/i },
  { id: "7n10_545", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.45x39mm 7N10 Enhanced Penetrator — AK-74M (3.62g / 56gr @ 880 m/s)", massGrams: 3.62, diamMM: 5.60, muzzleVel: 880, bc: 0.335, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 140, matchRe: /7n10/i },
  { id: "7n22_545", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.45x39mm 7N22 BP Hardened Steel AP — AK-74M (3.68g / 57gr @ 890 m/s)", massGrams: 3.68, diamMM: 5.60, muzzleVel: 890, bc: 0.335, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 250, matchRe: /545x39_ap|7n22/i },
  { id: "7n24_545", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.45x39mm 7N24 BS Tungsten AP — AK-12 (4.15g / 64gr @ 840 m/s)", massGrams: 4.15, diamMM: 5.60, muzzleVel: 840, bc: 0.355, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 80, matchRe: /7n24/i },
  { id: "7n39_545", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.45x39mm 7N39 Igolnik Tungsten Carbide AP (3.90g / 60gr @ 850 m/s)", massGrams: 3.90, diamMM: 5.60, muzzleVel: 850, bc: 0.345, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 150, matchRe: /7n39/i },

  { id: "m193_556_145", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M193 55gr FMJ — 14.5\" M4 (3.56g @ 930 m/s)", massGrams: 3.56, diamMM: 5.70, muzzleVel: 930, bc: 0.243, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 70, matchRe: /556.*m193/i },
  { id: "m193_556_20", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M193 55gr FMJ — 20\" M16A1/A2 (3.56g @ 990 m/s)", massGrams: 3.56, diamMM: 5.70, muzzleVel: 990, bc: 0.243, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 140, matchRe: /m193.*20/i },
  { id: "m196_556_tracer", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M196 / M856 Tracer — 14.5\" M4 (3.50g / 54gr @ 895 m/s)", massGrams: 3.50, diamMM: 5.70, muzzleVel: 895, bc: 0.230, dragModel: 1, profile: "1.00", armorLevel: "2", maxPenDist: 280, matchRe: /m196|mk301/i },
  { id: "m855_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm NATO M855 Green Tip — 14.5\" M4 (4.02g / 62gr @ 884 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 884, bc: 0.304, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 150, matchRe: /mcc_556_m855$|rc_b_556x45_m855$|b_556x45_ball/i },
  { id: "m855_556_20", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm NATO M855 Green Tip — 20\" M16A4 (4.02g / 62gr @ 948 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 948, bc: 0.304, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 230, matchRe: /mss_556_m855$/i },
  { id: "m855a1_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm US Army M855A1 EPR — 14.5\" M4A1 (4.02g / 62gr @ 910 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 910, bc: 0.307, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 350, matchRe: /556.*m855a1$/i },
  { id: "m855a1_plus_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M855A1 High-Pressure (+P / 20\" Rifle) (4.02g / 62gr @ 965 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 965, bc: 0.307, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 440, matchRe: /m855a1_plus|mss_556_m855a1/i },
  { id: "mk318_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm USMC Mk 318 Mod 0/1 SOST — 14.5\" (4.02g / 62gr @ 890 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 890, bc: 0.302, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 170, matchRe: /mk318/i },
  { id: "mk262_nas3_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm 77gr OTM NAS3 High-Pressure — 16\" (4.99g @ 895 m/s)", massGrams: 4.99, diamMM: 5.70, muzzleVel: 895, bc: 0.372, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 110, matchRe: /mk262_nas3|77gr_nas3|mss_556_mk262/i },
  { id: "mk262_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm Mk 262 Mod 1 77gr SMK OTM — 18\" SPR (4.99g @ 838 m/s)", massGrams: 4.99, diamMM: 5.70, muzzleVel: 838, bc: 0.372, dragModel: 1, profile: "1.15", armorLevel: "2", maxPenDist: 420, matchRe: /mk262$/i },
  { id: "556_underwater_dual", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm MEA / SDAR Dual-Purpose Underwater Dart (4.02g @ 270 m/s)", massGrams: 4.02, diamMM: 5.69, muzzleVel: 270, bc: 0.250, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 20, matchRe: /556x45_dual/i },
  { id: "556_antidrone_duplex", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm C-UAS Multi-Pellet Anti-Drone Sub-Load (4.02g @ 750 m/s)", massGrams: 4.02, diamMM: 5.70, muzzleVel: 750, bc: 0.160, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 120, matchRe: /antidrone|dronekiller/i },
  { id: "556_75_bthp", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm Hornady 75gr BTHP TAP T2 — 16\" (4.86g @ 850 m/s)", massGrams: 4.86, diamMM: 5.70, muzzleVel: 850, bc: 0.355, dragModel: 1, profile: "1.18", armorLevel: "2", maxPenDist: 430, matchRe: /75grhorn/i },
  { id: "556_70_tsx", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm Barnes 70gr TSX Solid Copper — 14.5\" (4.54g @ 835 m/s)", massGrams: 4.54, diamMM: 5.70, muzzleVel: 835, bc: 0.314, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 380, matchRe: /mcc_556_tsx/i },
  { id: "556_50_tsx", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm Barnes 45gr/50gr TSX Barrier — 14.5\" (2.92g @ 990 m/s)", massGrams: 2.92, diamMM: 5.70, muzzleVel: 990, bc: 0.197, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 300, matchRe: /rc_b_556x45_tsx/i },
  { id: "m995_556", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M995 Tungsten Carbide AP — 14.5\" M4 (3.37g / 52gr @ 960 m/s)", massGrams: 3.37, diamMM: 5.70, muzzleVel: 960, bc: 0.245, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 120, matchRe: /m995|556x45_ap/i },
  { id: "m995_556_20", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.56x45mm M995 Tungsten Carbide AP — 20\" Rifle (3.37g / 52gr @ 1030 m/s)", massGrams: 3.37, diamMM: 5.70, muzzleVel: 1030, bc: 0.245, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 185, matchRe: /rc_b_556x45_m995/i },

  { id: "dbp87_58x42", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.8x42mm PLA DBP87 / DBP95 Standard Ball — QBZ-95 (4.15g / 64gr @ 930 m/s)", massGrams: 4.15, diamMM: 6.00, muzzleVel: 930, bc: 0.338, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 230, matchRe: /dbp88|b_580x42/i },
  { id: "dbp10_58x42", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.8x42mm PLA DBP10 / DVX88 Universal Ball — QBZ-191 (4.60g / 71gr @ 915 m/s)", massGrams: 4.60, diamMM: 6.00, muzzleVel: 915, bc: 0.375, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 280, matchRe: /dvx88|dbp10/i },
  { id: "dvp88_58x42", group: "5.45 / 5.56 / 5.8x42 Carbine", name: "5.8x42mm PLA DVP88 Heavy Sniper/MG — QBU-88 (5.00g / 77gr @ 895 m/s)", massGrams: 5.00, diamMM: 6.00, muzzleVel: 895, bc: 0.418, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 340, matchRe: /dvp88/i },

  // ==========================================================================
  // 5. Modern Intermediate (.300 BLK, 6mm ARC, 6.5 LICC/Grendel, 6.8 SPC, 7.62x39)
  // ==========================================================================
  { id: "blk_78_cqb", group: "Modern Intermediate (.300–7.62x39)", name: ".300 AAC Blackout Lehigh 78gr High-Velocity CQB — 9\" (5.05g @ 805 m/s)", massGrams: 5.05, diamMM: 7.82, muzzleVel: 805, bc: 0.195, dragModel: 1, profile: "1.20", armorLevel: "2", maxPenDist: 250, matchRe: /300blk_78/i },
  { id: "blk_110_sup", group: "Modern Intermediate (.300–7.62x39)", name: ".300 AAC Blackout 110gr TAC-TX / V-MAX — 9\" (7.13g @ 675 m/s)", massGrams: 7.13, diamMM: 7.82, muzzleVel: 675, bc: 0.290, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 250, matchRe: /300blk.*110/i },
  { id: "blk_115_umc", group: "Modern Intermediate (.300–7.62x39)", name: ".300 AAC Blackout 115gr Remington UMC CTFB — 9\" (7.45g @ 655 m/s)", massGrams: 7.45, diamMM: 7.82, muzzleVel: 655, bc: 0.285, dragModel: 1, profile: "1.00", armorLevel: "2", maxPenDist: 240, matchRe: /300blk_115/i },
  { id: "blk_125_otm", group: "Modern Intermediate (.300–7.62x39)", name: ".300 AAC Blackout 125gr OTM Supersonic — 9\" (8.10g @ 620 m/s)", massGrams: 8.10, diamMM: 7.82, muzzleVel: 620, bc: 0.325, dragModel: 1, profile: "1.12", armorLevel: "2", maxPenDist: 230, matchRe: /300blk_125/i },
  { id: "blk_220_sub", group: "Modern Intermediate (.300–7.62x39)", name: ".300 AAC Blackout 220gr Sierra OTM Subsonic — 9\" (14.26g @ 310 m/s)", massGrams: 14.26, diamMM: 7.82, muzzleVel: 310, bc: 0.608, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 120, matchRe: /300blk_220|jca_b_300blk/i },

  { id: "6arc_80_eldvt", group: "Modern Intermediate (.300–7.62x39)", name: "6mm ARC Hornady 80gr ELD-VT — 18\" (5.18g @ 915 m/s)", massGrams: 5.18, diamMM: 6.18, muzzleVel: 915, bc: 0.410, dragModel: 1, profile: "1.20", armorLevel: "3", maxPenDist: 160, matchRe: /6arc_80/i },
  { id: "6arc_103_eldx", group: "Modern Intermediate (.300–7.62x39)", name: "6mm ARC Hornady 103gr ELD-X / GPR — 18\" (6.67g @ 835 m/s)", massGrams: 6.67, diamMM: 6.18, muzzleVel: 835, bc: 0.512, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 210, matchRe: /6arc_103|6arc_gpr/i },
  { id: "6arc_105_bthp", group: "Modern Intermediate (.300–7.62x39)", name: "6mm ARC Hornady 105gr BTHP Match — 18\" (6.80g @ 825 m/s)", massGrams: 6.80, diamMM: 6.18, muzzleVel: 825, bc: 0.530, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 210, matchRe: /6arc_105|6arc_bthp/i },
  { id: "6arc_108_eldm", group: "Modern Intermediate (.300–7.62x39)", name: "6mm ARC Hornady 108gr ELD-M / 109gr A-Tip — 18\" (7.00g @ 838 m/s)", massGrams: 7.00, diamMM: 6.18, muzzleVel: 838, bc: 0.536, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 230, matchRe: /6arc_108|6arc_atip/i },
  { id: "6arc_108_advap", group: "Modern Intermediate (.300–7.62x39)", name: "6mm ARC DoD ICM 108gr ADVAP Tungsten Core — 18\" (7.00g @ 845 m/s)", massGrams: 7.00, diamMM: 6.18, muzzleVel: 845, bc: 0.520, dragModel: 1, profile: "0.92", armorLevel: "4", maxPenDist: 220, matchRe: /6arc_advap/i },

  { id: "65licc_103", group: "Modern Intermediate (.300–7.62x39)", name: "6.5x43mm LICC (FN IWS) 103gr RR-LP — 14.5\" (6.67g @ 850 m/s)", massGrams: 6.67, diamMM: 6.71, muzzleVel: 850, bc: 0.435, dragModel: 1, profile: "1.10", armorLevel: "3", maxPenDist: 260, matchRe: /65x43_103/i },
  { id: "65licc_109", group: "Modern Intermediate (.300–7.62x39)", name: "6.5x43mm LICC (FN IWS) 109gr CMOT — 14.5\" (7.06g @ 845 m/s)", massGrams: 7.06, diamMM: 6.71, muzzleVel: 845, bc: 0.465, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 290, matchRe: /65x43_109/i },
  { id: "65licc_120", group: "Modern Intermediate (.300–7.62x39)", name: "6.5x43mm LICC (FN IWS) 120gr BMP/CMOT — 14.5\" (7.78g @ 825 m/s)", massGrams: 7.78, diamMM: 6.71, muzzleVel: 825, bc: 0.495, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 330, matchRe: /65x43_120/i },
  { id: "65licc_125_prt", group: "Modern Intermediate (.300–7.62x39)", name: "6.5x43mm LICC (FN IWS) 125gr EPR Penetrator — 14.5\" (8.10g @ 825 m/s)", massGrams: 8.10, diamMM: 6.71, muzzleVel: 825, bc: 0.505, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 140, matchRe: /65x43_125/i },
  { id: "65grendel_123", group: "Modern Intermediate (.300–7.62x39)", name: "6.5mm Grendel (6.5x39mm) 123gr ELD-M / MX Ref — 18\" (7.97g @ 790 m/s)", massGrams: 7.97, diamMM: 6.71, muzzleVel: 790, bc: 0.506, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 240, matchRe: /65x39/i },

  { id: "68spc_85_tsx", group: "Modern Intermediate (.300–7.62x39)", name: "6.8x43mm Rem SPC II Barnes 85gr TSX — 16\" (5.51g @ 875 m/s)", massGrams: 5.51, diamMM: 7.04, muzzleVel: 875, bc: 0.291, dragModel: 1, profile: "1.25", armorLevel: "3", maxPenDist: 150, matchRe: /68spc_85/i },
  { id: "68spc_100_cx", group: "Modern Intermediate (.300–7.62x39)", name: "6.8x43mm Rem SPC II Hornady 100gr CX — 16\" (6.48g @ 815 m/s)", massGrams: 6.48, diamMM: 7.04, muzzleVel: 815, bc: 0.335, dragModel: 1, profile: "1.22", armorLevel: "3", maxPenDist: 160, matchRe: /68spc_100/i },
  { id: "68spc_110_vmax", group: "Modern Intermediate (.300–7.62x39)", name: "6.8x43mm Rem SPC II Hornady 110gr V-MAX — 16\" (7.13g @ 792 m/s)", massGrams: 7.13, diamMM: 7.04, muzzleVel: 792, bc: 0.370, dragModel: 1, profile: "1.22", armorLevel: "2", maxPenDist: 380, matchRe: /68spc_110/i },
  { id: "68spc_120_sst", group: "Modern Intermediate (.300–7.62x39)", name: "6.8x43mm Rem SPC II Hornady 120gr SST — 16\" (7.78g @ 750 m/s)", massGrams: 7.78, diamMM: 7.04, muzzleVel: 750, bc: 0.400, dragModel: 1, profile: "1.20", armorLevel: "3", maxPenDist: 130, matchRe: /68spc_120/i },
  { id: "68spc_140_vld", group: "Modern Intermediate (.300–7.62x39)", name: "6.8x43mm Rem SPC II Berger 140gr VLD — 16\" (9.07g @ 715 m/s)", massGrams: 9.07, diamMM: 7.04, muzzleVel: 715, bc: 0.465, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 140, matchRe: /68spc_140/i },

  { id: "m43_762x39", group: "Modern Intermediate (.300–7.62x39)", name: "7.62x39mm 57-N-231 PS Mild Steel — AKM 16.3\" (7.90g / 122gr @ 718 m/s)", massGrams: 7.90, diamMM: 7.92, muzzleVel: 718, bc: 0.275, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 100, matchRe: /b_762x39_ball|762x39_123fmj/i },
  { id: "762x39_111_mflex", group: "Modern Intermediate (.300–7.62x39)", name: "7.62x39mm Hornady 111gr Monoflex — 16\" (7.19g @ 745 m/s)", massGrams: 7.19, diamMM: 7.92, muzzleVel: 745, bc: 0.295, dragModel: 1, profile: "1.25", armorLevel: "2", maxPenDist: 300, matchRe: /762x39_111/i },
  { id: "762x39_123_hp", group: "Modern Intermediate (.300–7.62x39)", name: "7.62x39mm 123gr JHP / SST Hunting — 16\" (7.97g @ 715 m/s)", massGrams: 7.97, diamMM: 7.92, muzzleVel: 715, bc: 0.285, dragModel: 1, profile: "1.22", armorLevel: "2", maxPenDist: 280, matchRe: /762x39_123hp/i },
  { id: "7n23_762x39", group: "Modern Intermediate (.300–7.62x39)", name: "7.62x39mm 7N23 BP Hardened Steel AP — AK-103 (7.90g / 122gr @ 730 m/s)", massGrams: 7.90, diamMM: 7.92, muzzleVel: 730, bc: 0.285, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 300, matchRe: /7n23/i },
  { id: "762x39_255_subx", group: "Modern Intermediate (.300–7.62x39)", name: "7.62x39mm Hornady 255gr Sub-X Subsonic — 16\" (16.52g @ 320 m/s)", massGrams: 16.52, diamMM: 7.92, muzzleVel: 320, bc: 0.290, dragModel: 1, profile: "1.18", armorLevel: "1", maxPenDist: 100, matchRe: /762x39_255/i },

  // ==========================================================================
  // 6. 6mm / 6.5mm / 6.8x51 / 7mm Full-Power Rifle
  // ==========================================================================
  { id: "6cm_80_eldvt", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6mm Creedmoor Hornady 80gr ELD-VT — 24\" (5.18g @ 1005 m/s)", massGrams: 5.18, diamMM: 6.18, muzzleVel: 1005, bc: 0.410, dragModel: 1, profile: "1.22", armorLevel: "3", maxPenDist: 250, matchRe: /6cm_80/i },
  { id: "6cm_103_eldx", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6mm Creedmoor Hornady 103gr ELD-X — 24\" (6.67g @ 930 m/s)", massGrams: 6.67, diamMM: 6.18, muzzleVel: 930, bc: 0.512, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 360, matchRe: /6cm_103/i },
  { id: "6cm_105_berger", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6mm Creedmoor Berger 105gr Hybrid Target — 24\" (6.80g @ 920 m/s)", massGrams: 6.80, diamMM: 6.18, muzzleVel: 920, bc: 0.536, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 360, matchRe: /6cm_105/i },
  { id: "6cm_108_eldm", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6mm Creedmoor 108gr ELD-M / 109gr Berger LRHT — 24\" (7.00g @ 902 m/s)", massGrams: 7.00, diamMM: 6.18, muzzleVel: 902, bc: 0.545, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 360, matchRe: /6cm_108|6cm_109/i },

  { id: "65x47_scenar", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5x47mm Lapua 139gr Scenar HPBT — 26\" (9.01g @ 850 m/s)", massGrams: 9.01, diamMM: 6.71, muzzleVel: 850, bc: 0.578, dragModel: 1, profile: "1.10", armorLevel: "3", maxPenDist: 380, matchRe: /65x47/i },
  { id: "65cm_130_berger", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm Creedmoor Federal 130gr Berger Hybrid OTM — 24\" (8.42g @ 876 m/s)", massGrams: 8.42, diamMM: 6.71, muzzleVel: 876, bc: 0.560, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 400, matchRe: /65cm_130/i },
  { id: "65cm_136_scenar", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm Creedmoor Lapua 136gr Scenar-L — 24\" (8.81g @ 850 m/s)", massGrams: 8.81, diamMM: 6.71, muzzleVel: 850, bc: 0.545, dragModel: 1, profile: "1.10", armorLevel: "3", maxPenDist: 390, matchRe: /65cm_136/i },
  { id: "65cm_m1200_140", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm Creedmoor USSOCOM M1200 / 140gr Berger OTM — 22\" (9.07g @ 855 m/s)", massGrams: 9.07, diamMM: 6.71, muzzleVel: 855, bc: 0.607, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 430, matchRe: /65cm_m1200|65cm_140berger|ace_65_creed/i },
  { id: "65cm_140_eldm", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm Creedmoor Hornady 140gr ELD-M / 143gr ELD-X — 24\" (9.07g @ 826 m/s)", massGrams: 9.07, diamMM: 6.71, muzzleVel: 826, bc: 0.615, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 400, matchRe: /65cm_140eldm|65cm_143/i },
  { id: "65cm_147_eldm", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm Creedmoor Hornady 147gr ELD-M — 24\" (9.53g @ 821 m/s)", massGrams: 9.53, diamMM: 6.71, muzzleVel: 821, bc: 0.697, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 450, matchRe: /65cm_147/i },

  { id: "65prc_143_eldx", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm PRC Hornady 143gr ELD-X — 24\" (9.27g @ 902 m/s)", massGrams: 9.27, diamMM: 6.71, muzzleVel: 902, bc: 0.625, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 520, matchRe: /65prc_143/i },
  { id: "65prc_147_eldm", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.5mm PRC Hornady 147gr ELD-M / 153gr A-Tip — 24\" (9.53g @ 887 m/s)", massGrams: 9.53, diamMM: 6.71, muzzleVel: 887, bc: 0.697, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 560, matchRe: /65prc_147|65prc_153/i },

  { id: "xm1186_68x51", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.8x51mm (.277 Fury) XM1186 GP — M7 13\" Hybrid Case (8.75g / 135gr @ 915 m/s)", massGrams: 8.75, diamMM: 7.04, muzzleVel: 915, bc: 0.488, dragModel: 1, profile: "1.12", armorLevel: "4", maxPenDist: 200, matchRe: /xm1186|277fury/i },
  { id: "xm1188_68x51_ap", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "6.8x51mm (.277 Fury) XM1188 Tungsten AP — M250 16\" Hybrid (8.75g @ 945 m/s)", massGrams: 8.75, diamMM: 7.04, muzzleVel: 945, bc: 0.488, dragModel: 1, profile: "0.92", armorLevel: "4", maxPenDist: 420, matchRe: /xm1188/i },

  { id: "7prc_154_sst", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "7mm PRC Hornady 154gr SST / 160gr CX — 24\" (9.98g @ 945 m/s)", massGrams: 9.98, diamMM: 7.21, muzzleVel: 945, bc: 0.560, dragModel: 1, profile: "1.22", armorLevel: "3", maxPenDist: 580, matchRe: /7prc_154/i },
  { id: "7prc_175_eldx", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "7mm PRC Hornady 175gr ELD-X Precision Hunter — 24\" (11.34g @ 914 m/s)", massGrams: 11.34, diamMM: 7.21, muzzleVel: 914, bc: 0.689, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 650, matchRe: /7prc_175/i },
  { id: "7prc_180_eldm", group: "6mm / 6.5mm / 6.8x51 / 7mm Rifle", name: "7mm PRC Hornady 180gr ELD-M Match — 24\" (11.66g @ 907 m/s)", massGrams: 11.66, diamMM: 7.21, muzzleVel: 907, bc: 0.796, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 720, matchRe: /7prc_180/i },

  // ==========================================================================
  // 7. 7.62x51, 7.62x54R, .303 British & 9.3x64 Battle Rifle
  // ==========================================================================
  { id: "m80_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm NATO M80 147gr FMJ Ball — 20\" (9.53g @ 838 m/s)", massGrams: 9.53, diamMM: 7.82, muzzleVel: 838, bc: 0.398, dragModel: 1, profile: "1.00", armorLevel: "3", maxPenDist: 200, matchRe: /^b_762x51_ball|762x51_tracer|762x51_minigun|m62/i },
  { id: "m80a1_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm US Army M80A1 130gr EPR — 20\" (8.42g @ 905 m/s)", massGrams: 8.42, diamMM: 7.82, muzzleVel: 905, bc: 0.390, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 450, matchRe: /308_m80a1/i },
  { id: "mk319_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm Mk 319 Mod 0 130gr SOST Barrier — 16\" SCAR-H (8.42g @ 890 m/s)", massGrams: 8.42, diamMM: 7.82, muzzleVel: 890, bc: 0.365, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 260, matchRe: /mk319/i },
  { id: "m852_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm M852 168gr Sierra MatchKing — 22\" (10.89g @ 792 m/s)", massGrams: 10.89, diamMM: 7.82, muzzleVel: 792, bc: 0.462, dragModel: 1, profile: "1.10", armorLevel: "3", maxPenDist: 220, matchRe: /308_m852/i },
  { id: "m118lr_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm M118LR / Mk 316 Mod 0 175gr SMK OTM — 20\" (11.34g @ 792 m/s)", massGrams: 11.34, diamMM: 7.82, muzzleVel: 792, bc: 0.505, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 250, matchRe: /m118lr|mk316/i },
  { id: "m993_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm M993 127gr Tungsten Carbide AP — 20\" (8.20g @ 910 m/s)", massGrams: 8.20, diamMM: 7.82, muzzleVel: 910, bc: 0.356, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 300, matchRe: /m993/i },
  { id: "m1158_762x51", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm US Army M1158 151gr ADVAP Tungsten AP — 20\" (9.80g @ 835 m/s)", massGrams: 9.80, diamMM: 7.82, muzzleVel: 835, bc: 0.440, dragModel: 1, profile: "0.92", armorLevel: "4", maxPenDist: 320, matchRe: /m1158/i },
  { id: "762x51_sub_200", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x51mm Lapua 200gr FMJBT Subsonic — Suppressed (12.96g @ 325 m/s)", massGrams: 12.96, diamMM: 7.82, muzzleVel: 325, bc: 0.520, dragModel: 1, profile: "1.00", armorLevel: "1", maxPenDist: 140, matchRe: /308_lapsub|762x51_ball_subsonic/i },

  { id: "762x54r_lps", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x54mmR 57-N-323S LPS Mild Steel Core — PKM/SVD (9.60g / 148gr @ 830 m/s)", massGrams: 9.60, diamMM: 7.92, muzzleVel: 830, bc: 0.415, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 280, matchRe: /762x54/i },
  { id: "762x54r_7n1", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x54mmR 7N1 / 7N14 Sniper Load — SVD 24.4\" (9.85g / 152gr @ 830 m/s)", massGrams: 9.85, diamMM: 7.92, muzzleVel: 830, bc: 0.435, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 310, matchRe: /7n1$|7n14/i },
  { id: "762x54r_7n26", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x54mmR 7N26 BP Hardened Steel AP — PKP/SVD (9.60g / 148gr @ 835 m/s)", massGrams: 9.60, diamMM: 7.92, muzzleVel: 835, bc: 0.420, dragModel: 1, profile: "0.95", armorLevel: "4", maxPenDist: 160, matchRe: /7n26/i },
  { id: "762x54r_7n37", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "7.62x54mmR 7N37 Tungsten Carbide AP — SVDM (10.75g / 166gr @ 815 m/s)", massGrams: 10.75, diamMM: 7.92, muzzleVel: 815, bc: 0.450, dragModel: 1, profile: "0.88", armorLevel: "4", maxPenDist: 310, matchRe: /7n37/i },

  { id: "303_mk7_ball", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: ".303 British (7.7x56mmR) Mk VII 174gr FMJ — Lee-Enfield No.4 (11.28g @ 744 m/s)", massGrams: 11.28, diamMM: 7.92, muzzleVel: 744, bc: 0.465, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 170, matchRe: /303_ball_w_mk7|303_ball_r_mk2|303_ball_g_mk6/i },
  { id: "303_mk8z_bt", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: ".303 British Mk VIIIz 175gr Boat-Tail MG/LR — 25\" (11.34g @ 777 m/s)", massGrams: 11.34, diamMM: 7.92, muzzleVel: 777, bc: 0.525, dragModel: 1, profile: "1.05", armorLevel: "3", maxPenDist: 230, matchRe: /303_ball_mk8/i },
  { id: "303_w_mk1_ap", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: ".303 British 'W' Mk Iz / B Mk IVz Hardened AP — 25\" (11.28g @ 745 m/s)", massGrams: 11.28, diamMM: 7.92, muzzleVel: 745, bc: 0.455, dragModel: 1, profile: "0.95", armorLevel: "4", maxPenDist: 100, matchRe: /303_ball_b_mk4/i },

  { id: "93x64_7n33", group: "7.62x51 / 7.62x54R / .303 / 9.3mm", name: "9.3x64mm 7N33 Sniper AP — SVDK 24.4\" (17.40g / 269gr @ 770 m/s)", massGrams: 17.40, diamMM: 9.28, muzzleVel: 770, bc: 0.510, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 240, matchRe: /93x64/i },

  // ==========================================================================
  // 8. .300 & .338 Precision Magnums
  // ==========================================================================
  { id: "300wm_mk248_mod0", group: ".300 & .338 Magnums", name: ".300 Win Mag (7.62x67mm) Mk 248 Mod 0 190gr SMK — 24\" (12.31g @ 899 m/s)", massGrams: 12.31, diamMM: 7.82, muzzleVel: 899, bc: 0.533, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 560, matchRe: /mk248_mod_?0/i },
  { id: "300wm_mk248_mod1", group: ".300 & .338 Magnums", name: ".300 Win Mag Mk 248 Mod 1 220gr SMK — 24\" (14.26g @ 869 m/s)", massGrams: 14.26, diamMM: 7.82, muzzleVel: 869, bc: 0.629, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 650, matchRe: /mk248_mod_?1/i },
  { id: "300wm_212_eldx", group: ".300 & .338 Magnums", name: ".300 Win Mag Hornady 212gr ELD-X / 230gr Berger OTM (13.74g @ 871 m/s)", massGrams: 13.74, diamMM: 7.82, muzzleVel: 871, bc: 0.673, dragModel: 1, profile: "1.15", armorLevel: "3", maxPenDist: 680, matchRe: /300wm_212|762x67_ball_berger/i },

  { id: "300prc_174_eldvt", group: ".300 & .338 Magnums", name: ".300 PRC Hornady 174gr ELD-VT — 24\" (11.28g @ 980 m/s)", massGrams: 11.28, diamMM: 7.82, muzzleVel: 980, bc: 0.535, dragModel: 1, profile: "1.20", armorLevel: "3", maxPenDist: 620, matchRe: /300prc_174/i },
  { id: "300prc_212_eldx", group: ".300 & .338 Magnums", name: ".300 PRC Hornady 212gr ELD-X Precision Hunter — 24\" (13.74g @ 872 m/s)", massGrams: 13.74, diamMM: 7.82, muzzleVel: 872, bc: 0.673, dragModel: 1, profile: "1.18", armorLevel: "3", maxPenDist: 680, matchRe: /300prc_212/i },
  { id: "300prc_225_eldm", group: ".300 & .338 Magnums", name: ".300 PRC Hornady 225gr ELD-M Match — 24\" (14.58g @ 856 m/s)", massGrams: 14.58, diamMM: 7.82, muzzleVel: 856, bc: 0.777, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 780, matchRe: /300prc_225/i },
  { id: "300prc_245_eol", group: ".300 & .338 Magnums", name: ".300 PRC Berger 245gr EOL / 250gr A-Tip — 26\" (15.88g @ 835 m/s)", massGrams: 15.88, diamMM: 7.82, muzzleVel: 835, bc: 0.830, dragModel: 1, profile: "1.12", armorLevel: "3", maxPenDist: 820, matchRe: /300prc_245|300prc_250/i },

  { id: "300nm_m1163_215", group: ".300 & .338 Magnums", name: ".300 Norma Magnum USSOCOM M1163 215gr Berger Hybrid — 26\" (13.93g @ 915 m/s)", massGrams: 13.93, diamMM: 7.82, muzzleVel: 915, bc: 0.691, dragModel: 1, profile: "1.12", armorLevel: "4", maxPenDist: 220, matchRe: /300nm_m1163/i },
  { id: "300nm_225_eldm", group: ".300 & .338 Magnums", name: ".300 Norma Magnum 225gr ELD-M / 230gr Berger Hybrid — 26\" (14.90g @ 895 m/s)", massGrams: 14.90, diamMM: 7.82, muzzleVel: 895, bc: 0.743, dragModel: 1, profile: "1.12", armorLevel: "4", maxPenDist: 240, matchRe: /300nm_225|300nm_230/i },
  { id: "300nm_250_atip", group: ".300 & .338 Magnums", name: ".300 Norma Magnum Hornady 250gr A-Tip Match — 26\" (16.20g @ 860 m/s)", massGrams: 16.20, diamMM: 7.82, muzzleVel: 860, bc: 0.878, dragModel: 1, profile: "1.12", armorLevel: "4", maxPenDist: 260, matchRe: /300nm_250/i },

  { id: "338lm_250_scenar", group: ".300 & .338 Magnums", name: ".338 Lapua Magnum Lapua 250gr Scenar GB488 — 27\" (16.20g @ 905 m/s)", massGrams: 16.20, diamMM: 8.59, muzzleVel: 905, bc: 0.648, dragModel: 1, profile: "1.08", armorLevel: "4", maxPenDist: 380, matchRe: /338lm_lap_250|jca_b_338lm|^b_338_ball/i },
  { id: "338lm_300_scenar", group: ".300 & .338 Magnums", name: ".338 Lapua Magnum Lapua 300gr Scenar GB528 — 27\" (19.44g @ 830 m/s)", massGrams: 19.44, diamMM: 8.59, muzzleVel: 830, bc: 0.736, dragModel: 1, profile: "1.10", armorLevel: "4", maxPenDist: 420, matchRe: /338lm_lap_300|ace_338_ball$/i },
  { id: "ap485_338lm", group: ".300 & .338 Magnums", name: ".338 Lapua Magnum RUAG Swiss P 250gr AP485 Tungsten AP (16.20g @ 905 m/s)", massGrams: 16.20, diamMM: 8.59, muzzleVel: 905, bc: 0.648, dragModel: 1, profile: "0.92", armorLevel: "4", maxPenDist: 650, matchRe: /ap485/i },
  { id: "ap529_338lm", group: ".300 & .338 Magnums", name: ".338 Lapua Magnum RUAG Swiss P 300gr AP529 Tungsten AP (19.44g @ 830 m/s)", massGrams: 19.44, diamMM: 8.59, muzzleVel: 830, bc: 0.750, dragModel: 1, profile: "0.92", armorLevel: "4", maxPenDist: 750, matchRe: /ap529/i },
  { id: "api526_338lm", group: ".300 & .338 Magnums", name: ".338 Lapua Magnum Nammo 253gr API526 Hard-Target API (16.39g @ 895 m/s)", massGrams: 16.39, diamMM: 8.59, muzzleVel: 895, bc: 0.650, dragModel: 1, profile: "0.95", armorLevel: "4", maxPenDist: 620, matchRe: /api526/i },

  { id: "338nm_250_otm", group: ".300 & .338 Magnums", name: ".338 Norma Magnum 250gr OTM / GTM — 26\" (16.20g @ 910 m/s)", massGrams: 16.20, diamMM: 8.59, muzzleVel: 910, bc: 0.655, dragModel: 1, profile: "1.10", armorLevel: "4", maxPenDist: 400, matchRe: /338nm_250/i },
  { id: "338nm_m1162_300", group: ".300 & .338 Magnums", name: ".338 Norma Magnum USSOCOM M1162 300gr SMK — LWMMG / Mk22 (19.44g @ 820 m/s)", massGrams: 19.44, diamMM: 8.59, muzzleVel: 820, bc: 0.768, dragModel: 1, profile: "1.10", armorLevel: "4", maxPenDist: 440, matchRe: /338nm_m1162|338nm_smk|b_338_nm/i },
  { id: "338nm_300_atip", group: ".300 & .338 Magnums", name: ".338 Norma Magnum Hornady 300gr A-Tip Match — 26\" (19.44g @ 845 m/s)", massGrams: 19.44, diamMM: 8.59, muzzleVel: 845, bc: 0.863, dragModel: 1, profile: "1.10", armorLevel: "4", maxPenDist: 500, matchRe: /338nm_300_atip/i },

  // ==========================================================================
  // 9. ELR & Anti-Materiel (.375, .408, .416 Barrett, .50 BMG, 12.7x108)
  // ==========================================================================
  { id: "375sp_350_fmj", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".375 Swiss P (9.5x70mm) RUAG 350gr FMJ Ball — 26\" (22.68g @ 800 m/s)", massGrams: 22.68, diamMM: 9.53, muzzleVel: 800, bc: 0.740, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 480, matchRe: /375sp_350/i },
  { id: "375sp_360_ap", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".375 Swiss P RUAG 360gr Tungsten Carbide AP / APIT — 26\" (23.33g @ 865 m/s)", massGrams: 23.33, diamMM: 9.53, muzzleVel: 865, bc: 0.755, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 550, matchRe: /375sp_360/i },

  { id: "375ct_350_smk", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".375 CheyTac (9.5x77mm) 350gr SMK Match — 29\" (22.68g @ 905 m/s)", massGrams: 22.68, diamMM: 9.53, muzzleVel: 905, bc: 0.805, dragModel: 1, profile: "1.08", armorLevel: "4", maxPenDist: 750, matchRe: /375ct_ball/i },
  { id: "375ct_390_atip", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".375 CheyTac 390gr Hornady A-Tip / 400gr Solid ELR — 29\" (25.27g @ 900 m/s)", massGrams: 25.27, diamMM: 9.53, muzzleVel: 900, bc: 0.960, dragModel: 1, profile: "1.08", armorLevel: "4", maxPenDist: 900, matchRe: /375ct_atip|375ct_bb|375ct_oep/i },
  { id: "375ct_390_ap", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".375 CheyTac 390gr Hard-Target AP — 29\" (25.34g @ 830 m/s)", massGrams: 25.34, diamMM: 9.53, muzzleVel: 830, bc: 0.840, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 650, matchRe: /375ct_ap/i },

  { id: "408ct_305_solid", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".408 CheyTac (10.4x77mm) 305gr Solid Copper — M200 29\" (19.76g @ 1067 m/s)", massGrams: 19.76, diamMM: 10.36, muzzleVel: 1067, bc: 0.690, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 850, matchRe: /ace_408_ball/i },
  { id: "408ct_419_solid", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".408 CheyTac 419gr Balanced Flight Solid — M200 29\" (27.15g @ 884 m/s)", massGrams: 27.15, diamMM: 10.36, muzzleVel: 884, bc: 0.945, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 950, matchRe: /408ct_ball|408ct_bb|408ct_dtm|408ct_oep|b_408_ball/i },
  { id: "408ct_450_ap", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".408 CheyTac 450gr Hard-Target Tungsten AP — 29\" (29.16g @ 820 m/s)", massGrams: 29.16, diamMM: 10.36, muzzleVel: 820, bc: 0.910, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 780, matchRe: /408ct_ap/i },

  { id: "416b_395_solid", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".416 Barrett (10.6x83mm) 395gr Solid Brass BT — 32\" (25.60g @ 960 m/s)", massGrams: 25.60, diamMM: 10.57, muzzleVel: 960, bc: 0.760, dragModel: 1, profile: "1.05", armorLevel: "4", maxPenDist: 950, matchRe: /416b_395/i },
  { id: "416b_452_mtac", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".416 Barrett Cutting Edge 452gr MTAC Solid — 32\" (29.29g @ 912 m/s)", massGrams: 29.29, diamMM: 10.57, muzzleVel: 912, bc: 0.910, dragModel: 1, profile: "1.05", armorLevel: "5", maxPenDist: 650, matchRe: /416b_452/i },
  { id: "416b_500_atip", group: "ELR & Anti-Materiel (.375–12.7mm)", name: ".416 Barrett Hornady 500gr A-Tip Match — 32\" (32.40g @ 855 m/s)", massGrams: 32.40, diamMM: 10.57, muzzleVel: 855, bc: 1.050, dragModel: 1, profile: "1.08", armorLevel: "5", maxPenDist: 600, matchRe: /416b_500/i },

  { id: "50bmg_m33_ball", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x99mm (.50 BMG) M33 660gr Ball / M17 Tracer — M107 29\" (42.80g @ 853 m/s)", massGrams: 42.80, diamMM: 12.95, muzzleVel: 853, bc: 0.670, dragModel: 1, profile: "1.00", armorLevel: "5", maxPenDist: 550, matchRe: /50_m33|50_m17|50_m1022|127x99_ball/i },
  { id: "m2ap_50bmg", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x99mm (.50 BMG) M2 AP / M8 API / M20 APIT — 45\" M2HB (42.80g @ 890 m/s)", massGrams: 42.80, diamMM: 12.95, muzzleVel: 890, bc: 0.670, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 850, matchRe: /ace_127x99_api|50bmg_m20/i },
  { id: "50bmg_mk211", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x99mm (.50 BMG) Mk 211 Mod 0 Raufoss 671gr MP-APHEI (43.48g @ 853 m/s)", massGrams: 43.48, diamMM: 12.95, muzzleVel: 853, bc: 0.685, dragModel: 1, profile: "1.25", armorLevel: "5", maxPenDist: 900, matchRe: /mk211|raufoss|127x99_heiap/i },
  { id: "50bmg_750_amax", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x99mm (.50 BMG) Hornady 750gr A-MAX / 800gr Lapua — 29\" (48.60g @ 860 m/s)", massGrams: 48.60, diamMM: 12.95, muzzleVel: 860, bc: 1.050, dragModel: 1, profile: "1.10", armorLevel: "5", maxPenDist: 750, matchRe: /750_amax|800_lap|127x99_ball_amax/i },
  { id: "50bmg_m903_slap", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x99mm (.50 BMG) M903 SLAP 355gr .30-Cal Tungsten Sabot (23.00g @ 1219 m/s)", massGrams: 23.00, diamMM: 7.82, muzzleVel: 1219, bc: 0.560, dragModel: 1, profile: "0.88", armorLevel: "5", maxPenDist: 1400, matchRe: /127x99_slap|127x99_apds|127x108_apds/i },

  { id: "127x108_b32", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x108mm Russian B-32 745gr API — Kord / DShK (48.30g @ 820 m/s)", massGrams: 48.30, diamMM: 12.98, muzzleVel: 820, bc: 0.710, dragModel: 1, profile: "0.98", armorLevel: "5", maxPenDist: 850, matchRe: /127x108_ball_kord|127x108_1sl/i },
  { id: "127x108_7n34", group: "ELR & Anti-Materiel (.375–12.7mm)", name: "12.7x108mm Russian 7N34 914gr Sniper AP — ASVK (59.20g @ 785 m/s)", massGrams: 59.20, diamMM: 12.98, muzzleVel: 785, bc: 0.850, dragModel: 1, profile: "1.02", armorLevel: "5", maxPenDist: 900, matchRe: /^b_127x108_ball$/i },

  // ==========================================================================
  // 10. Autocannon Reference (20mm – 40mm Vehicle Cannons)
  // ==========================================================================
  { id: "20x102_m53_api", group: "Autocannon (20mm–40mm)", name: "20x102mm M61 Vulcan M53 API (100g @ 1030 m/s)", massGrams: 100.0, diamMM: 20.00, muzzleVel: 1030, bc: 0.580, dragModel: 1, profile: "1.00", armorLevel: "5", maxPenDist: 1600, matchRe: /20\s?mm|m61a2/i },
  { id: "25x137_m791_apds", group: "Autocannon (20mm–40mm)", name: "25x137mm M242 Bushmaster M791 Tungsten APDS-T (134g @ 1345 m/s)", massGrams: 134.0, diamMM: 14.00, muzzleVel: 1345, bc: 0.720, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 2000, matchRe: /25_137|m791|m919|25\s?mm/i },
  { id: "30x165_3ubr8", group: "Autocannon (20mm–40mm)", name: "30x165mm 2A42 / GSh-30 3UBR8 APDS-T (222g @ 1120 m/s)", massGrams: 222.0, diamMM: 18.00, muzzleVel: 1120, bc: 0.800, dragModel: 1, profile: "1.00", armorLevel: "5", maxPenDist: 2000, matchRe: /30x165|30\s?mm_ap(?!fsds)|gun30mm/i },
  { id: "30x173_mk258", group: "Autocannon (20mm–40mm)", name: "30x173mm Bushmaster II Mk 258 APFSDS-T (160g @ 1430 m/s)", massGrams: 160.0, diamMM: 12.00, muzzleVel: 1430, bc: 0.980, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 2000, matchRe: /30mm_apfsds/i },
  { id: "35x228_oerlikon", group: "Autocannon (20mm–40mm)", name: "35x228mm Oerlikon KDA FAPDS / PMD060 (375g @ 1440 m/s)", massGrams: 375.0, diamMM: 22.00, muzzleVel: 1440, bc: 0.950, dragModel: 1, profile: "1.00", armorLevel: "5", maxPenDist: 2000, matchRe: /35\s?mm|gun35mm/i },
  { id: "40mm_cta_apfsds", group: "Autocannon (20mm–40mm)", name: "40mm CTA Cased-Telescoped Tungsten APFSDS-T (550g @ 1500 m/s)", massGrams: 550.0, diamMM: 16.00, muzzleVel: 1500, bc: 1.150, dragModel: 1, profile: "0.95", armorLevel: "5", maxPenDist: 2000, matchRe: /40mm_apfsds|40mm_sabot/i }
];

/**
 * Finds the best real-world cartridge specification for a given Arma 3 / ACE3 round.
 * 1. Exact regex match against className (excluding internal ACE spall/chaff tokens)
 * 2. Exact regex match against magName
 * 3. Nearest physical (diamMM, massGrams, muzzleVel) neighbor within 0.65mm bore tolerance
 */
function findBestRealWorldSpec(round) {
  if (!round) return null;
  const cls = String(round.className || "");
  if (/^ace_frag_|chaff|debris|spike_.*_ke/i.test(cls)) return null;
  if (round.ACE_damageType && round.ACE_damageType !== "bullet") return null;

  let matched = null;
  let matchType = "exact";

  for (const p of REAL_WORLD_CARTRIDGE_LIBRARY) {
    if (p.matchRe && p.matchRe.test(cls)) {
      matched = p;
      break;
    }
  }
  if (!matched && round.magName) {
    const mag = String(round.magName);
    for (const p of REAL_WORLD_CARTRIDGE_LIBRARY) {
      if (p.matchRe && p.matchRe.test(mag)) {
        matched = p;
        break;
      }
    }
  }

  // Nearest physical cartridge fallback for custom or unnamed bullet classes
  if (!matched && round.ACE_caliber && round.ACE_bulletMass) {
    const d = Number(round.ACE_caliber);
    const m = Number(round.ACE_bulletMass);
    const v = Number(round.initSpeed) || Number(round.typicalSpeed) || 800;
    let bestScore = Infinity;
    for (const p of REAL_WORLD_CARTRIDGE_LIBRARY) {
      const dd = Math.abs(p.diamMM - d);
      if (dd > 0.65) continue;
      const relM = Math.abs(p.massGrams - m) / Math.max(1.0, p.massGrams);
      const relV = Math.abs(p.muzzleVel - v) / Math.max(200, p.muzzleVel);
      const score = dd * 4.0 + relM * 2.5 + relV * 1.5;
      if (score < bestScore && score < 2.2) {
        bestScore = score;
        matched = p;
        matchType = "closest";
      }
    }
  }

  if (!matched) return null;

  // Check if the game round's physics significantly diverge from the real-world spec
  const warnings = [];
  const rVel = Number(round.initSpeed) || Number(round.typicalSpeed) || 0;
  const rTyp = Number(round.typicalSpeed) || rVel;
  const rMass = Number(round.ACE_bulletMass) || 0;
  const rDiam = Number(round.ACE_caliber) || 0;
  const rBc = (round.ACE_ballisticCoefficients && Number(round.ACE_ballisticCoefficients[0])) || 0;
  const rDrag = Number(round.ACE_dragModel) || 1;

  if (rDiam > 0 && Math.abs(rDiam - matched.diamMM) > 0.45) {
    warnings.push(`diam ${rDiam.toFixed(2)} vs ${matched.diamMM.toFixed(2)}mm`);
  }
  if (rMass > 0 && Math.abs(rMass - matched.massGrams) / Math.max(0.5, matched.massGrams) > 0.16) {
    warnings.push(`mass ${rMass.toFixed(2)} vs ${matched.massGrams.toFixed(2)}g`);
  }
  if (rVel > 0 && Math.abs(rVel - matched.muzzleVel) > Math.max(45, matched.muzzleVel * 0.09)) {
    warnings.push(`vel ${Math.round(rVel)} vs ${matched.muzzleVel} m/s`);
  }
  if (rBc > 0) {
    const rG1Eq = rDrag === 7 ? rBc * 1.98 : rBc;
    const pG1Eq = matched.dragModel === 7 ? matched.bc * 1.98 : matched.bc;
    if (Math.abs(rG1Eq - pG1Eq) / Math.max(0.10, pG1Eq) > 0.30) {
      warnings.push(`G${rDrag} BC ${rBc.toFixed(3)} vs G${matched.dragModel} ${matched.bc.toFixed(3)}`);
    }
  }
  if (Array.isArray(round.ACE_muzzleVelocities) && round.ACE_muzzleVelocities.length > 0) {
    const midMv = Number(round.ACE_muzzleVelocities[Math.floor(round.ACE_muzzleVelocities.length / 2)]) || 0;
    if (midMv > 0 && Math.abs(midMv - matched.muzzleVel) > Math.max(55, matched.muzzleVel * 0.12)) {
      warnings.push(`ACE bbl ${Math.round(midMv)} vs ${matched.muzzleVel} m/s`);
    }
  }
  if (rVel > 0 && rTyp > 0 && Math.abs(rTyp - rVel) / Math.max(100, rVel) > 0.12) {
    warnings.push(`typSpd ${Math.round(rTyp)} vs ${Math.round(rVel)} m/s`);
  }

  return { preset: matched, matchType, warnings };
}
