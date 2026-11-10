// ============================================================================
// AmmoMaster — Validated Arma 3 & ACE 3.21.2 Ballistics, Armor & Medical Engine
// ============================================================================

const ACE_BLOOD_LOSS_COLORS = [
  [0.00, 0.00, 0.00, 1],
  [1.00, 0.95, 0.64, 1],
  [1.00, 0.87, 0.46, 1],
  [1.00, 0.80, 0.33, 1],
  [1.00, 0.72, 0.24, 1],
  [1.00, 0.63, 0.15, 1],
  [1.00, 0.54, 0.08, 1],
  [1.00, 0.43, 0.02, 1],
  [1.00, 0.30, 0.00, 1],
  [1.00, 0.00, 0.00, 1]
];

const ACE_DAMAGE_COLORS = [
  [0.00, 0.00, 0.00, 1],
  [0.75, 0.95, 1.00, 1],
  [0.62, 0.86, 1.00, 1],
  [0.54, 0.77, 1.00, 1],
  [0.48, 0.67, 1.00, 1],
  [0.42, 0.57, 1.00, 1],
  [0.37, 0.47, 1.00, 1],
  [0.31, 0.36, 1.00, 1],
  [0.22, 0.23, 1.00, 1],
  [0.00, 0.00, 1.00, 1]
];

// Weibull constants from ace_medical_engine/XEH_preInit.sqf
const WEIBULL_B1 = -Math.log(1 - 0.1);
const WEIBULL_B2 = -Math.log(1 - 0.9);
const FATAL_SUM_DAMAGE_WEIBULL_K = Math.log(WEIBULL_B1 / WEIBULL_B2) / Math.log(0.5 / 0.8); // ~6.5593
const FATAL_SUM_DAMAGE_WEIBULL_L = 0.5 / Math.pow(WEIBULL_B1, 1 / FATAL_SUM_DAMAGE_WEIBULL_K); // ~0.7041

const ACE_CONST = {
  PENETRATION_THRESHOLD: 0.35,
  HEAD_DAMAGE_THRESHOLD: 1.0,
  HEAD_KNOCKOUT_THRESHOLD: 0.5,
  BODY_KNOCKOUT_THRESHOLD: 1.0,
  ORGAN_DAMAGE_THRESHOLD: 0.6,
  HEART_HIT_CHANCE: 0.05,
  FRACTURE_DAMAGE_THRESHOLD: 0.50,
  LIMPING_DAMAGE_THRESHOLD: 0.30,
  PAIN_UNCONSCIOUS: 0.50,
  PAIN_UNCONSCIOUS_CHANCE: 0.10,
  BLOOD_LOSS_KNOCK_OUT_THRESHOLD: 0.50,
  BLOOD_LOSS_RED_THRESHOLD: 0.50,
  DAMAGE_BLUE_THRESHOLD: 0.80,
  DEFAULT_BLOOD_VOLUME: 6.0,
  FATAL_BLOOD_VOLUME: 3.0,
  HEALTHY_CARDIAC_OUTPUT_LPS: 0.095 * (80 / 60), // 0.12667 L/s (126.7 mL/s)
  MEAN_BLEEDOUT_CO_LPS: 0.082, // Average CO from 6.0L -> 3.0L as HR/SV adjust
  HEAD_BLEEDING_MAX: 0.9,
  BODY_BLEEDING_MAX: 1.0,
  ARM_BLEEDING_MAX: 0.3,
  LEG_BLEEDING_MAX: 0.5,
  ARMOR_PENETRABILITY: 0.015,
  DAMAGE_SCALING_FACTOR: 10.0,
  UNSCALED_BASE_ARMOR: 2.0,
  ARMOR_THICKNESS_RHA: [6, 15, 21, 40, 55] // Levels I, II, III, IV, V
};

// Exact GNU Exterior Ballistics retardation tables from ace_advanced_ballistics_fnc_calculateRetardation
const ACE_DRAG_TABLES = {
  1: [
    [4230, 0.0001477404177730177, 1.9565], [3680, 0.0001920339268755614, 1.925],
    [3450, 0.0002894751026819746, 1.875],  [3295, 0.0004349905111115636, 1.825],
    [3130, 0.0006520421871892662, 1.775],  [2960, 0.0009748073694078696, 1.725],
    [2830, 0.001453721560187286,  1.675],  [2680, 0.002162887202930376,  1.625],
    [2460, 0.003209559783129881,  1.575],  [2225, 0.003904368218691249,  1.55],
    [2015, 0.003222942271262336,  1.575],  [1890, 0.002203329542297809,  1.625],
    [1810, 0.001511001028891904,  1.675],  [1730, 0.0008609957592468259, 1.75],
    [1595, 0.0004086146797305117, 1.85],   [1520, 0.0001954473210037398, 1.95],
    [1420, 0.00005431896266462351, 2.125], [1360, 8.847742581674416e-6,  2.375],
    [1315, 1.456922328720298e-6,  2.625],  [1280, 2.419485191895565e-7,  2.875],
    [1220, 1.657956321067612e-8,  3.25],   [1185, 4.745469537157371e-10, 3.75],
    [1150, 1.379746590025088e-11, 4.25],   [1100, 4.070157961147882e-13, 4.75],
    [1060, 2.938236954847331e-14, 5.125],  [1025, 1.228597370774746e-14, 5.25],
    [980,  2.916938264100495e-14, 5.125],  [945,  3.855099424807451e-13, 4.75],
    [905,  1.185097045689854e-11, 4.25],   [860,  3.566129470974951e-10, 3.75],
    [810,  1.045513263966272e-8,  3.25],   [780,  1.291159200846216e-7,  2.875],
    [750,  6.824429329105383e-7,  2.625],  [700,  3.569169672385163e-6,  2.375],
    [640,  0.00001839015095899579, 2.125], [600,  0.0000571117468873424, 1.95],
    [550,  0.00009226557091973427, 1.875], [250,  0.00009337991957131389, 1.875],
    [100,  0.00007225247327590413, 1.925], [65,   0.00005792684957074546, 1.975],
    [0,    0.00005206214107320588, 2.0]
  ],
  2: [
    [1674, 0.0079470052136733,  1.36999902851493],
    [1172, 0.00100419763721974, 1.65392237010294],
    [1060, 7.15571228255369e-23, 7.91913562392361],
    [949,  1.39589807205091e-10, 3.81439537623717],
    [670,  0.000234364342818625, 1.71869536324748],
    [335,  0.000177962438921838, 1.76877550388679],
    [0,    0.0000518033561289704, 1.98160270524632]
  ],
  5: [
    [1730, 0.00724854775171929,  1.41538574492812],
    [1228, 0.0000350563361516117, 2.13077307854948],
    [1116, 1.84029481181151e-13, 4.81927320350395],
    [1004, 1.34713064017409e-22, 7.8100555281422],
    [837,  1.03965974081168e-7,  2.84204791809926],
    [335,  0.0001093015938698234, 1.81096361579504],
    [0,    0.0000351963178524273, 2.00477856801111]
  ],
  6: [
    [3236, 0.0455384883480781,   1.15997674041274],
    [2065, 0.07167261849653769,  1.10704436538885],
    [1311, 0.00166676386084348,  1.60085100195952],
    [1144, 1.01482730119215e-7,  2.9569674731838],
    [1004, 4.31542773103552e-18, 6.34106317069757],
    [670,  0.0000204835650496866, 2.11688446325998],
    [0,    0.0000750912466084823, 1.92031057847052]
  ],
  7: [
    [4200, 1.29081656775919e-9,  3.24121295355962],
    [3000, 0.0171422231434847,   1.27907168025204],
    [1470, 0.00233355948302505,  1.52693913274526],
    [1260, 0.000797592111627665, 1.67688974440324],
    [1110, 5.71086414289273e-12, 4.3212826264889],
    [960,  3.02865108244904e-17, 5.99074203776707],
    [670,  7.52285155782535e-6,  2.1738019851075],
    [540,  0.0000131766281225189, 2.08774690257991],
    [0,    0.0000134504843776525, 2.08702306738884]
  ],
  8: [
    [3571, 0.0112263766252305,   1.33207346655961],
    [1841, 0.0167252613732636,   1.28662041261785],
    [1120, 0.00220172456619625,  1.55636358091189],
    [1088, 2.0538037167098e-16,  5.80410776994789],
    [976,  5.92182174254121e-12, 4.29275576134191],
    [0,    0.000043917343795117, 1.99978116283334]
  ]
};

// Base wound types from ACE_Medical_Injuries.hpp
const ACE_WOUND_TYPES = {
  Abrasion:      { id: 0, name: "Abrasion",       bleeding: 0.001, pain: 0.4, causeLimping: 0, causeFracture: 0 },
  Avulsion:      { id: 1, name: "Avulsion",       bleeding: 0.100, pain: 1.0, causeLimping: 1, causeFracture: 0 },
  Contusion:     { id: 2, name: "Contusion",      bleeding: 0.000, pain: 0.3, causeLimping: 0, causeFracture: 0 },
  Crush:         { id: 3, name: "Crush Wound",    bleeding: 0.050, pain: 0.8, causeLimping: 1, causeFracture: 1 },
  Cut:           { id: 4, name: "Cut",            bleeding: 0.010, pain: 0.1, causeLimping: 0, causeFracture: 0 },
  Laceration:    { id: 5, name: "Laceration",     bleeding: 0.050, pain: 0.2, causeLimping: 0, causeFracture: 0 },
  VelocityWound: { id: 6, name: "Velocity Wound", bleeding: 0.200, pain: 0.9, causeLimping: 1, causeFracture: 1 },
  PunctureWound: { id: 7, name: "Puncture Wound", bleeding: 0.050, pain: 0.4, causeLimping: 1, causeFracture: 0 },
  ThermalBurn:   { id: 8, name: "Thermal Burn",   bleeding: 0.000, pain: 0.7, causeLimping: 0, causeFracture: 0 }
};

const ACE_DAMAGE_TYPES = {
  bullet: {
    thresholds: [[20, 10], [4.5, 2], [3, 1], [0, 1]],
    selectionSpecific: 1,
    armorPenetrationHandler: true,
    wounds: [
      { type: "Avulsion",      weighting: [[1.0, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Contusion",     weighting: [[0.35, 0], [0.35, 1]], dmgMult: 1, bleedMult: 1, sizeMult: 3.2, painMult: 2.2, fracMult: 1 },
      { type: "VelocityWound", weighting: [[1.5, 0], [1.5, 1], [0.35, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 0.9, painMult: 1.0, fracMult: 1 }
    ]
  },
  grenade: {
    thresholds: [[20, 10], [10, 5], [4, 3], [1.5, 2], [0.8, 2], [0.3, 1], [0, 0]],
    selectionSpecific: 0,
    armorPenetrationHandler: false,
    wounds: [
      { type: "Avulsion",      weighting: [[1.5, 1], [1.1, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "VelocityWound", weighting: [[1.5, 0], [1.1, 1], [0.7, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "PunctureWound", weighting: [[0.9, 0], [0.7, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Cut",           weighting: [[0.7, 0], [0.35, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Contusion",     weighting: [[0.5, 0], [0.35, 1]], dmgMult: 1, bleedMult: 1, sizeMult: 2.0, painMult: 0.9, fracMult: 1 }
    ]
  },
  explosive: {
    thresholds: [[20, 15], [8, 7], [2, 3], [1.2, 2], [0.4, 1], [0, 0]],
    selectionSpecific: 0,
    armorPenetrationHandler: false,
    wounds: [
      { type: "Avulsion",  weighting: [[1.0, 1], [0.8, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Cut",       weighting: [[1.5, 0], [0.35, 1], [0, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Contusion", weighting: [[0.5, 0], [0.35, 1]], dmgMult: 1, bleedMult: 1, sizeMult: 2.0, painMult: 0.9, fracMult: 1 }
    ]
  },
  shell: {
    thresholds: [[20, 10], [10, 5], [4.5, 2], [2, 2], [0.8, 1], [0.2, 1], [0, 0]],
    selectionSpecific: 0,
    armorPenetrationHandler: false,
    wounds: [
      { type: "Avulsion",      weighting: [[1.5, 1], [1.1, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "VelocityWound", weighting: [[1.5, 0], [1.1, 1], [0.7, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "PunctureWound", weighting: [[0.9, 0], [0.7, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Cut",           weighting: [[0.7, 0], [0.35, 1], [0.35, 0]], dmgMult: 1, bleedMult: 1, sizeMult: 1.0, painMult: 1.0, fracMult: 1 },
      { type: "Contusion",     weighting: [[0.5, 0], [0.35, 1]], dmgMult: 1, bleedMult: 1, sizeMult: 2.0, painMult: 0.9, fracMult: 1 }
    ]
  }
};

// All 11 character hitpoints in Arma 3 + ACE3 mapping
const HITZONES = [
  { id: "HitHead",      label: "Head (Cranial)", acePart: "head",     aceIndex: 0, gearSlot: "helmet", vitalVanilla: true },
  { id: "HitFace",      label: "Face",           acePart: "head",     aceIndex: 0, gearSlot: "helmet", vitalVanilla: true },
  { id: "HitNeck",      label: "Neck",           acePart: "head",     aceIndex: 0, gearSlot: "both",   vitalVanilla: true },
  { id: "HitChest",     label: "Chest",          acePart: "body",     aceIndex: 1, gearSlot: "vest",   vitalVanilla: true },
  { id: "HitDiaphragm", label: "Diaphragm",      acePart: "body",     aceIndex: 1, gearSlot: "vest",   vitalVanilla: true },
  { id: "HitAbdomen",   label: "Abdomen",        acePart: "body",     aceIndex: 1, gearSlot: "vest",   vitalVanilla: true },
  { id: "HitPelvis",    label: "Pelvis",         acePart: "body",     aceIndex: 1, gearSlot: "vest",   vitalVanilla: true },
  { id: "HitLeftArm",   label: "Left Arm",       acePart: "leftarm",  aceIndex: 2, gearSlot: "vest",   vitalVanilla: false },
  { id: "HitRightArm",  label: "Right Arm",      acePart: "rightarm", aceIndex: 3, gearSlot: "vest",   vitalVanilla: false },
  { id: "HitLeftLeg",   label: "Left Leg",       acePart: "leftleg",  aceIndex: 4, gearSlot: "none",   vitalVanilla: false },
  { id: "HitRightLeg",  label: "Right Leg",      acePart: "rightleg", aceIndex: 5, gearSlot: "none",   vitalVanilla: false }
];

const TORSO_HITPOINTS = ["HitChest", "HitDiaphragm", "HitAbdomen", "HitPelvis"];
const ACE_BODY_PARTS = ["head", "body", "leftarm", "rightarm", "leftleg", "rightleg"];
const ACE_BODY_LABELS = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];

function linearConversion(minFrom, maxFrom, val, minTo, maxTo, clip = true) {
  if (Math.abs(maxFrom - minFrom) < 1e-9) return minTo;
  let t = (val - minFrom) / (maxFrom - minFrom);
  if (clip) t = Math.max(0, Math.min(1, t));
  return minTo + t * (maxTo - minTo);
}

function aceInterpolatePoints(input, points, randomRound = false, deterministic = true) {
  if (!points || points.length === 0) return 0;
  if (points.length === 1) return points[0][1];
  const lowerIdx = points.findIndex(p => p[0] < input);
  let output = 0;
  if (lowerIdx === 0) {
    output = points[0][1];
  } else if (lowerIdx === -1) {
    output = points[points.length - 1][1];
  } else {
    const upper = points[lowerIdx - 1];
    const lower = points[lowerIdx];
    output = linearConversion(lower[0], upper[0], input, lower[1], upper[1], true);
  }
  if (randomRound) {
    if (deterministic) return output;
    output = Math.ceil(output - Math.random());
  }
  return output;
}

// Survival function P(V >= ratio) for SQF `random [0.9, 1, 1.1]` symmetric triangular distribution
function probTriangularExceeds(ratio) {
  if (ratio <= 0.9) return 1.0;
  if (ratio >= 1.1) return 0.0;
  if (ratio <= 1.0) {
    const u = (ratio - 0.9) / 0.1;
    return 1.0 - 0.5 * u * u;
  }
  const u = (1.1 - ratio) / 0.1;
  return 0.5 * u * u;
}

// Sample SQF `random [0.9, 1, 1.1]`
function sampleTriangularVariance() {
  return 0.9 + (Math.random() + Math.random()) * 0.1;
}

// Exact ACE3 blood loss calculation with per-limb & body caps (ace_medical_status_fnc_getBloodLoss)
function computeAceTotalBleedRate(partBleeds, tourniquets = [0, 0, 0, 0, 0, 0]) {
  const headB = Math.min(ACE_CONST.HEAD_BLEEDING_MAX, Math.max(0, partBleeds[0] || 0));
  const bodyB = Math.min(ACE_CONST.BODY_BLEEDING_MAX, Math.max(0, partBleeds[1] || 0));
  const bodyTotal = Math.min(1.0, headB + bodyB);

  const laB = tourniquets[2] ? 0 : Math.min(ACE_CONST.ARM_BLEEDING_MAX, Math.max(0, partBleeds[2] || 0));
  const raB = tourniquets[3] ? 0 : Math.min(ACE_CONST.ARM_BLEEDING_MAX, Math.max(0, partBleeds[3] || 0));
  const llB = tourniquets[4] ? 0 : Math.min(ACE_CONST.LEG_BLEEDING_MAX, Math.max(0, partBleeds[4] || 0));
  const rlB = tourniquets[5] ? 0 : Math.min(ACE_CONST.LEG_BLEEDING_MAX, Math.max(0, partBleeds[5] || 0));

  const limbTotal = Math.min(1.0, laB + raB + llB + rlB) * (1.0 - bodyTotal);
  return bodyTotal + limbTotal;
}

// ============================================================================
// Validated External Ballistics (Vanilla airFriction + ACE3 GNU G1–G8 Drag)
// ============================================================================
function aceCalculateRetardation(dragModel, bc, velocityMps) {
  const vFps = velocityMps * 3.2808399;
  if (vFps <= 0 || vFps >= 10000 || bc <= 0) return 0;
  const table = ACE_DRAG_TABLES[dragModel] || ACE_DRAG_TABLES[1];
  for (let i = 0; i < table.length; i++) {
    if (vFps > table[i][0]) {
      const A = table[i][1];
      const M = table[i][2];
      return (A * Math.pow(vFps, M) / bc) / 3.2808399;
    }
  }
  return 0;
}

function computeVelocityAtRange(round, distanceMeters, useAdvBallistics = false) {
  const v0 = Math.max(1, Number(round.initSpeed) || Number(round.typicalSpeed) || 800);
  if (distanceMeters <= 0) return { velocity: v0, tof: 0 };

  const af = Number(round.airFriction) || -0.001;
  const hasBC = Array.isArray(round.ACE_ballisticCoefficients)
    && round.ACE_ballisticCoefficients.length > 0
    && Number(round.ACE_ballisticCoefficients[0]) > 0.01;

  if (!useAdvBallistics || !hasBC) {
    const v = v0 * Math.exp(af * distanceMeters);
    const tof = Math.abs(af) > 1e-9 ? (Math.exp(-af * distanceMeters) - 1) / (-af * v0) : distanceMeters / v0;
    return { velocity: Math.max(1, v), tof };
  }

  // Exact ACE3 Advanced Ballistics GNU G1–G8 retardation integrated with RK2 midpoint
  const bc = Math.max(0.02, Number(round.ACE_ballisticCoefficients[0]));
  const dragModel = Number(round.ACE_dragModel) || 1;
  let x = 0;
  let v = v0;
  let t = 0;
  const dx = Math.min(1.5, Math.max(0.25, distanceMeters / 300));

  while (x < distanceMeters && v > 5) {
    const step = Math.min(dx, distanceMeters - x);
    const a1 = aceCalculateRetardation(dragModel, bc, v);
    const vMid = Math.max(5, v - 0.5 * step * (a1 / v));
    const aMid = aceCalculateRetardation(dragModel, bc, vMid);
    const vNext = Math.max(5, v - step * (aMid / vMid));
    t += step / (0.5 * (v + vNext));
    v = vNext;
    x += step;
  }
  return { velocity: v, tof: t };
}

function solveAirFrictionFromBC(v0, bc, dragModel) {
  const fitDist = 250;
  const { velocity: vFit } = computeVelocityAtRange({
    initSpeed: v0,
    typicalSpeed: v0,
    airFriction: -0.001,
    ACE_ballisticCoefficients: [Math.max(0.03, bc)],
    ACE_dragModel: dragModel
  }, fitDist, true);
  const clampedV = Math.max(15, Math.min(v0 - 0.2, vFit));
  return Math.log(clampedV / v0) / fitDist;
}

function solveBCFromDownrangeVelocity(v0, refDist, vRef, dragModel) {
  let lo = 0.025;
  let hi = 2.00;
  for (let i = 0; i < 24; i++) {
    const mid = 0.5 * (lo + hi);
    const { velocity } = computeVelocityAtRange({
      initSpeed: v0,
      typicalSpeed: v0,
      ACE_ballisticCoefficients: [mid],
      ACE_dragModel: dragModel
    }, refDist, true);
    if (velocity < vRef) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

// ============================================================================
// Validated Armor & Hitpoint Resolution (Exact ACE 3.21.2 fnc_getItemArmor)
// ============================================================================
function getEquipmentProtectionForHitpoint(gearProtection, hitpoint) {
  if (!gearProtection) return { armor: 0, passThrough: 1, covered: false, legacyHitArmsArmor: 0 };
  const entry = gearProtection[hitpoint];
  let legacyHitArmsArmor = 0;
  if (!entry && (hitpoint === "HitLeftArm" || hitpoint === "HitRightArm")) {
    const legacy = gearProtection["HitArms"] || gearProtection["HitHands"];
    if (legacy && Number(legacy.armor) > 0) legacyHitArmsArmor = Number(legacy.armor);
  }
  if (!entry) return { armor: 0, passThrough: 1, covered: false, legacyHitArmsArmor };
  const armor = Number(entry.armor) || 0;
  const passThrough = Math.min(1, Math.max(0.1, entry.passThrough !== undefined ? Number(entry.passThrough) : 1));
  return { armor, passThrough, covered: armor > 0, legacyHitArmsArmor: 0 };
}

// Exact port of ace_medical_engine_fnc_getItemArmor (#9063 over-capped vest/helmet log10 scaling)
function calcAceItemArmor(armor, passThrough, itemType) {
  if (itemType === "uniform" || armor <= 0) return armor;
  const armorLevelStep = itemType === "helmet" ? 2 : 4;
  if (armor > armorLevelStep * 6) {
    const passThroughEffect = itemType === "vest" ? 0.6 : 1.0;
    const pt = Math.min(1, Math.max(0.1, passThrough));
    return Math.log10(armor / Math.pow(pt, passThroughEffect)) * 10;
  }
  return armor;
}

function resolveHitpointArmor(armorLoadout, hitpoint) {
  const uni = (armorLoadout && armorLoadout.uniform) || { armor: 2.0, armorStructural: 4.0, hitpoints: {} };
  const vest = armorLoadout ? armorLoadout.vest : null;
  const helmet = armorLoadout ? armorLoadout.helmet : null;

  const unitBaseArmor = Math.max(0.1, Number(uni.armor) || 2.0);
  const unitStructural = Math.max(0.1, Number(uni.armorStructural) || 4.0);
  const hpEntry = (uni.hitpoints && uni.hitpoints[hitpoint]) || { armor: 1.0, passThrough: 1.0 };
  const hpArmorMult = Math.max(0.5, Number(hpEntry.armor) || 1.0);
  const hpBasePassThrough = Math.min(1.0, Math.max(0.1, Number(hpEntry.passThrough) || 1.0));

  const uniformArmor = unitBaseArmor * hpArmorMult;
  const vestProt = getEquipmentProtectionForHitpoint(vest ? vest.protection : null, hitpoint);
  const helmProt = getEquipmentProtectionForHitpoint(helmet ? helmet.protection : null, hitpoint);

  const vanillaVestArmor = vestProt.armor;
  const vanillaHelmArmor = helmProt.armor;
  const vanillaTotalArmor = Math.max(1.0, uniformArmor + vanillaVestArmor + vanillaHelmArmor);

  const aceVestArmor = calcAceItemArmor(vestProt.armor, vestProt.passThrough, "vest");
  const aceHelmArmor = calcAceItemArmor(helmProt.armor, helmProt.passThrough, "helmet");
  const aceTotalArmor = Math.max(1.0, uniformArmor + aceVestArmor + aceHelmArmor);

  let effectivePassThrough = hpBasePassThrough;
  if (vestProt.covered) effectivePassThrough *= vestProt.passThrough;
  if (helmProt.covered) effectivePassThrough *= helmProt.passThrough;

  return {
    hitpoint,
    unitBaseArmor,
    unitStructural,
    hpArmorMult,
    hpBasePassThrough,
    uniformArmor,
    vestArmorRaw: vanillaVestArmor,
    vestPassThrough: vestProt.passThrough,
    vestArmorAce: aceVestArmor,
    vestOverCapped: vanillaVestArmor > 24,
    helmArmorRaw: vanillaHelmArmor,
    helmPassThrough: helmProt.passThrough,
    helmArmorAce: aceHelmArmor,
    helmOverCapped: vanillaHelmArmor > 12,
    legacyHitArmsArmor: vestProt.legacyHitArmsArmor,
    vanillaTotalArmor,
    aceTotalArmor,
    effectivePassThrough
  };
}

// ============================================================================
// Full Shot Evaluation (Arma 3 Engine + ACE 3.21.2 Medical Damage Pipeline)
// ============================================================================
function evaluateShot(round, armorLoadout, hitpoint, rangeMeters, options = {}) {
  const impactAngleDeg = Number(options.impactAngleDeg) || 0;
  const useAdvBallistics = Boolean(options.useAdvBallistics);
  const alternateArmorPen = options.alternateArmorPen !== undefined ? Boolean(options.alternateArmorPen) : true;
  const damageThreshold = Math.max(0.1, Number(options.damageThreshold) || 1.0);
  const overridePlateRhaMM = options.overridePlateRhaMM !== undefined ? Number(options.overridePlateRhaMM) : null;

  const hzInfo = HITZONES.find(h => h.id === hitpoint) || HITZONES[3];
  const bodyPart = hzInfo.acePart;
  const bodyPartIndex = hzInfo.aceIndex;

  // 1. Velocity & Energy at Range
  const { velocity: impactSpeedRaw, tof } = computeVelocityAtRange(round, rangeMeters, useAdvBallistics);
  const angleRad = (impactAngleDeg * Math.PI) / 180;
  const cosAngle = Math.max(0.05, Math.cos(angleRad));
  const effectiveSpeed = impactSpeedRaw * cosAngle;

  const bulletMassGrams = Number(round.ACE_bulletMass) || 4.0;
  const kineticEnergyJ = 0.5 * (bulletMassGrams / 1000) * impactSpeedRaw * impactSpeedRaw;

  // 2. Base Arma 3 Penetration (RHAe mm)
  const caliber = Math.max(0.01, Number(round.caliber) || 1.0);
  const penFactor = caliber * ACE_CONST.ARMOR_PENETRABILITY;
  const rhaPenMM = effectiveSpeed * penFactor;
  const concretePenMM = rhaPenMM * (80 / 15);
  const meatPenMM = rhaPenMM * (250 / 15);
  const isRicochet = impactAngleDeg > (90 - (Number(round.deflecting) || 15));

  // 3. Base Arma 3 Raw Damage, Hitpoint & Structural Damage
  const hit = Math.max(0.1, Number(round.hit) || 8.0);
  const typicalSpeed = Math.max(1.0, Number(round.typicalSpeed) || Number(round.initSpeed) || 800);
  const explosive = Math.min(1, Math.max(0, Number(round.explosive) || 0));

  const speedRatio = effectiveSpeed / typicalSpeed;
  const rawDamage = hit * (1 - explosive) * speedRatio + hit * explosive;

  const armorInfo = resolveHitpointArmor(armorLoadout, hitpoint);

  // Vanilla Arma 3 damage: only vital hitpoints kill at hitpointDamage >= 1.0; limbs kill via structural transfer
  const vanillaHitpointDamage = rawDamage / armorInfo.vanillaTotalArmor;
  const vanillaStructuralDamage = (vanillaHitpointDamage * armorInfo.effectivePassThrough) / armorInfo.unitStructural;
  const vanillaSingleShotMax = hzInfo.vitalVanilla
    ? Math.max(vanillaHitpointDamage, vanillaStructuralDamage)
    : vanillaStructuralDamage;
  const vanillaIsLethal = vanillaSingleShotMax >= 1.0;
  const vanillaStk = vanillaSingleShotMax > 1e-6 ? Math.min(999, Math.ceil(1.0 / vanillaSingleShotMax)) : 999;

  // 4. ACE 3.21.2 handleDamage & woundsHandlerArmorPenetration
  const engineDamage = vanillaHitpointDamage;
  const aceRealDamage = engineDamage * armorInfo.aceTotalArmor;

  const dmgTypeKey = (round.ACE_damageType && ACE_DAMAGE_TYPES[round.ACE_damageType]) ? round.ACE_damageType : "bullet";
  const dmgTypeCfg = ACE_DAMAGE_TYPES[dmgTypeKey];

  const armorLevelStep = bodyPart === "body" ? 4 : 2;
  const netArmor = armorInfo.aceTotalArmor - ACE_CONST.UNSCALED_BASE_ARMOR;

  let aceArmorLevel = 0;
  let aceArmorThicknessMM = 0;
  let aceImpactSpeed = effectiveSpeed;
  let acePenDepth = rhaPenMM;
  let penRatio = 1.0;
  let aceFinalDamage = engineDamage;
  let usedArmorPenHandler = false;

  if (overridePlateRhaMM !== null) {
    if (overridePlateRhaMM > 0 && dmgTypeCfg.armorPenetrationHandler) {
      usedArmorPenHandler = true;
      aceArmorThicknessMM = overridePlateRhaMM;
      const stdIdx = ACE_CONST.ARMOR_THICKNESS_RHA.indexOf(overridePlateRhaMM);
      aceArmorLevel = stdIdx >= 0 ? stdIdx + 1 : 0;
      aceImpactSpeed = (rawDamage / hit) * Math.max(typicalSpeed, 1);
      acePenDepth = penFactor * aceImpactSpeed;
      penRatio = Math.min(1.0, acePenDepth / aceArmorThicknessMM);
      aceFinalDamage = (hit * penRatio) / ACE_CONST.DAMAGE_SCALING_FACTOR;
    } else {
      // Unarmored standard reference (uniformArmor = 2.0)
      aceFinalDamage = rawDamage / ACE_CONST.UNSCALED_BASE_ARMOR;
    }
  } else if (alternateArmorPen && dmgTypeCfg.armorPenetrationHandler && netArmor > armorLevelStep) {
    usedArmorPenHandler = true;
    const levelIdx = Math.max(0, Math.min(4, Math.round((netArmor - (armorLevelStep * 2)) / armorLevelStep)));
    aceArmorLevel = levelIdx + 1;
    aceArmorThicknessMM = ACE_CONST.ARMOR_THICKNESS_RHA[levelIdx];
    aceImpactSpeed = (aceRealDamage / hit) * Math.max(typicalSpeed, 1);
    acePenDepth = penFactor * aceImpactSpeed;
    penRatio = Math.min(1.0, acePenDepth / aceArmorThicknessMM);
    aceFinalDamage = (hit * penRatio) / ACE_CONST.DAMAGE_SCALING_FACTOR;
  }

  // 5. ACE 3.21.2 woundsHandlerBase (exact fractional wound distribution + triangular [0.9, 1, 1.1] variance)
  const nWoundsExpected = Math.max(0, aceInterpolatePoints(aceFinalDamage, dmgTypeCfg.thresholds, true, true));
  const kFloor = Math.floor(nWoundsExpected);
  const fracPart = nWoundsExpected - kFloor;
  const countCases = [];
  if (1 - fracPart > 1e-6) countCases.push({ count: kFloor, prob: 1 - fracPart });
  if (fracPart > 1e-6) countCases.push({ count: kFloor + 1, prob: fracPart });
  if (countCases.length === 0) countCases.push({ count: 0, prob: 1.0 });

  const nWoundsDisplay = nWoundsExpected > 0 ? Math.max(1, Math.round(nWoundsExpected)) : 0;
  const dmgPerWound = nWoundsDisplay > 0 ? aceFinalDamage / nWoundsDisplay : 0;

  function buildWoundsForCount(nInt) {
    if (nInt <= 0 || aceFinalDamage <= 0) return [];
    const dpw = aceFinalDamage / nInt;
    let wSum = 0;
    const list = [];
    for (const wSpec of dmgTypeCfg.wounds) {
      const weight = Math.max(0, aceInterpolatePoints(dpw, wSpec.weighting, false, true));
      if (weight > 0) {
        wSum += weight;
        const wBase = ACE_WOUND_TYPES[wSpec.type];
        const wDmgMean = dpw * wSpec.dmgMult;
        const woundSize = linearConversion(0.1, 2.0, wDmgMean * wSpec.sizeMult, Math.pow(0.5, 3), 1.0, true);
        const categoryIdx = Math.max(0, Math.min(2, 2 - Math.floor(Math.log(Math.max(1e-6, woundSize)) / Math.log(0.5))));
        const categoryName = ["Minor", "Medium", "Large"][categoryIdx];
        const pain = woundSize * wSpec.painMult * wBase.pain;
        const bleeding = woundSize * wSpec.bleedMult * wBase.bleeding;
        list.push({
          type: wSpec.type,
          wSpec,
          wBase,
          displayName: `${categoryName} ${wBase.name}`,
          categoryIdx,
          categoryName,
          weight,
          probability: 0,
          woundDamage: wDmgMean,
          woundSize,
          pain,
          bleeding,
          causeLimping: Boolean(wBase.causeLimping && bodyPartIndex > 3 && wDmgMean > ACE_CONST.LIMPING_DAMAGE_THRESHOLD),
          causeFracture: Boolean(wBase.causeFracture && bodyPartIndex > 1 && wDmgMean > ACE_CONST.FRACTURE_DAMAGE_THRESHOLD)
        });
      }
    }
    for (const item of list) item.probability = wSum > 0 ? item.weight / wSum : 0;
    return list;
  }

  const woundBreakdowns = buildWoundsForCount(nWoundsDisplay);

  let expectedRawPartBleed = 0;
  let expectedPain = 0;
  let expectedWoundDamage = 0;
  let expectedPenetratingBodyDamage = 0;
  let vitalFatalProb = 0;
  let weibullFatalProb = 0;
  let traumaKoProb = 0;
  let painKoProb = 0;

  const partTraumaThreshold = bodyPartIndex === 0
    ? 1.25 * damageThreshold
    : (bodyPartIndex === 1 ? 1.5 * damageThreshold : 5.0 * damageThreshold);

  for (const cc of countCases) {
    if (cc.count <= 0) continue;
    const wList = cc.count === nWoundsDisplay ? woundBreakdowns : buildWoundsForCount(cc.count);
    if (wList.length === 0) continue;

    let meanBleedSingle = 0;
    let meanPainSingle = 0;
    let meanDmgSingle = 0;
    let pSingleHeadFatal = 0;
    let pSingleHeartFatal = 0;

    for (const wb of wList) {
      meanBleedSingle += wb.probability * wb.bleeding;
      meanPainSingle += wb.probability * wb.pain;
      meanDmgSingle += wb.probability * wb.woundDamage;
      if (bodyPartIndex === 0) {
        pSingleHeadFatal += wb.probability * probTriangularExceeds(ACE_CONST.HEAD_DAMAGE_THRESHOLD / Math.max(1e-6, wb.woundDamage));
      } else if (bodyPartIndex === 1) {
        pSingleHeartFatal += wb.probability
          * probTriangularExceeds(ACE_CONST.ORGAN_DAMAGE_THRESHOLD / Math.max(1e-6, wb.woundDamage))
          * ACE_CONST.HEART_HIT_CHANCE;
      }
    }

    const totDmgMean = meanDmgSingle * cc.count;
    const totPainMean = Math.min(1.0, meanPainSingle * cc.count);
    const pPenTorsoSingle = bodyPartIndex === 1
      ? probTriangularExceeds(ACE_CONST.PENETRATION_THRESHOLD / Math.max(1e-6, meanDmgSingle))
      : 0;

    expectedRawPartBleed += cc.prob * meanBleedSingle * cc.count;
    expectedPain += cc.prob * totPainMean;
    expectedWoundDamage += cc.prob * totDmgMean;
    expectedPenetratingBodyDamage += cc.prob * totDmgMean * pPenTorsoSingle;

    if (bodyPartIndex === 0) {
      vitalFatalProb += cc.prob * (1 - Math.pow(1 - pSingleHeadFatal, cc.count));
      traumaKoProb += cc.prob * probTriangularExceeds((ACE_CONST.HEAD_KNOCKOUT_THRESHOLD * damageThreshold) / Math.max(1e-6, totDmgMean));
    } else if (bodyPartIndex === 1) {
      vitalFatalProb += cc.prob * (1 - Math.pow(1 - pSingleHeartFatal, cc.count));
      const reqTorsoKo = Math.max(ACE_CONST.PENETRATION_THRESHOLD, ACE_CONST.BODY_KNOCKOUT_THRESHOLD * damageThreshold / cc.count);
      traumaKoProb += cc.prob * probTriangularExceeds(reqTorsoKo / Math.max(1e-6, meanDmgSingle));
    }

    // Pain >= 0.50 triggers 10% roll for unconsciousness in ACE 3.21.2
    if (totPainMean > 0.01) {
      const pPainExceeds = probTriangularExceeds(ACE_CONST.PAIN_UNCONSCIOUS / Math.max(1e-6, meanPainSingle * cc.count));
      painKoProb += cc.prob * pPainExceeds * ACE_CONST.PAIN_UNCONSCIOUS_CHANCE;
    }

    // Weibull trauma lethality integrated over 3-point Gauss/Simpson quadrature of [0.9, 1.0, 1.1]
    if (bodyPartIndex <= 1 && totDmgMean * 1.1 > partTraumaThreshold) {
      const evalWeibull = mult => {
        const ex = Math.max(0, totDmgMean * mult - partTraumaThreshold);
        return ex > 0 ? 1 - Math.exp(-Math.pow(ex / FATAL_SUM_DAMAGE_WEIBULL_L, FATAL_SUM_DAMAGE_WEIBULL_K)) : 0;
      };
      const pW = 0.25 * evalWeibull(0.95) + 0.50 * evalWeibull(1.0) + 0.25 * evalWeibull(1.05);
      weibullFatalProb += cc.prob * pW;
    }
  }

  const partBleedsArr = [0, 0, 0, 0, 0, 0];
  partBleedsArr[bodyPartIndex] = expectedRawPartBleed;
  const expectedBleedRate = computeAceTotalBleedRate(partBleedsArr);

  const penetratedPlate = dmgPerWound > ACE_CONST.PENETRATION_THRESHOLD;
  const totalFatalProb = Math.min(1.0, 1 - (1 - vitalFatalProb) * (1 - weibullFatalProb));
  const koProb = Math.min(1.0, 1 - (1 - totalFatalProb) * (1 - traumaKoProb) * (1 - painKoProb));

  // Shots to guaranteed trauma kill & shots to guaranteed knockdown
  let shotsToGuaranteedTraumaKill = 999;
  if (expectedWoundDamage > 1e-5) {
    if (bodyPartIndex === 0 && dmgPerWound >= ACE_CONST.HEAD_DAMAGE_THRESHOLD) {
      shotsToGuaranteedTraumaKill = 1;
    } else if (bodyPartIndex <= 1) {
      shotsToGuaranteedTraumaKill = Math.min(999, Math.ceil((partTraumaThreshold + FATAL_SUM_DAMAGE_WEIBULL_L * 1.15) / expectedWoundDamage));
    } else {
      // Limb hits don't trigger Weibull fatal trauma directly; estimate bleedout / cumulative trauma
      shotsToGuaranteedTraumaKill = 999;
    }
  }

  let shotsToKO = 999;
  if (shotsToGuaranteedTraumaKill === 1 || traumaKoProb >= 0.99) {
    shotsToKO = 1;
  } else if (bodyPartIndex === 0 && expectedWoundDamage > 1e-5) {
    shotsToKO = Math.min(shotsToGuaranteedTraumaKill, Math.ceil((ACE_CONST.HEAD_KNOCKOUT_THRESHOLD * damageThreshold) / expectedWoundDamage));
  } else if (bodyPartIndex === 1 && expectedPenetratingBodyDamage > 1e-5) {
    shotsToKO = Math.min(shotsToGuaranteedTraumaKill, Math.ceil((ACE_CONST.BODY_KNOCKOUT_THRESHOLD * damageThreshold) / expectedPenetratingBodyDamage));
  } else if (painKoProb > 0.01) {
    // Only 10% roll per hit when non-penetrating or limb hit causes severe pain
    shotsToKO = Math.min(99, Math.round(1 / painKoProb));
  }

  return {
    hitpoint,
    hitzoneLabel: hzInfo.label,
    bodyPart,
    bodyPartIndex,
    rangeMeters,
    impactSpeedRaw,
    effectiveSpeed,
    tof,
    kineticEnergyJ,
    rhaPenMM,
    concretePenMM,
    meatPenMM,
    isRicochet,
    rawDamage,
    armorInfo,
    vanillaHitpointDamage,
    vanillaStructuralDamage,
    vanillaIsLethal,
    vanillaStk,
    engineDamage,
    aceRealDamage,
    netArmor,
    usedArmorPenHandler,
    aceArmorLevel,
    aceArmorThicknessMM,
    aceImpactSpeed,
    acePenDepth,
    penRatio,
    aceFinalDamage,
    nWoundsExpected,
    nWoundsInt: nWoundsDisplay,
    dmgPerWound,
    penetratedPlate,
    woundBreakdowns,
    expectedRawPartBleed,
    expectedBleedRate,
    expectedPain,
    expectedWoundDamage,
    expectedPenetratingBodyDamage,
    vitalFatalProb,
    weibullFatalProb,
    totalFatalProb,
    traumaKoProb,
    painKoProb,
    koProb,
    partTraumaThreshold,
    shotsToKO,
    shotsToGuaranteedTraumaKill
  };
}

// ============================================================================
// Unified Penetration Criterion & Exact Binary-Search Range / Caliber Solvers
// ============================================================================
function getMinHitForCriterion(criterion, damageThreshold = 1.0, bodyPartIndex = 1) {
  if (criterion === "ace_bleed") return 3.60;
  if (criterion === "ace_heart") return bodyPartIndex === 0 ? 10.05 : 6.05;
  if (criterion === "ace_ko") {
    const koThresh = bodyPartIndex === 0
      ? ACE_CONST.HEAD_KNOCKOUT_THRESHOLD * damageThreshold
      : Math.max(ACE_CONST.PENETRATION_THRESHOLD, ACE_CONST.BODY_KNOCKOUT_THRESHOLD * damageThreshold);
    return koThresh * ACE_CONST.DAMAGE_SCALING_FACTOR + 0.08;
  }
  return 0.5;
}

function evaluateCriterionMetric(round, targetSpec, rangeMeters, criterion, simOpts) {
  const opts = { ...simOpts };
  let loadout = targetSpec.loadout || null;
  let hitpoint = targetSpec.hitpoint || "HitChest";
  if (targetSpec.mode === "plate") {
    opts.overridePlateRhaMM = targetSpec.rhaMM;
    hitpoint = "HitChest";
  }
  const ev = evaluateShot(round, loadout, hitpoint, rangeMeters, opts);
  const plateMM = ev.aceArmorThicknessMM;
  if (plateMM <= 0) {
    // Unarmored hitzone
    if (criterion === "rha_100") return { passes: true, ratio: 999, ev };
    if (criterion === "ace_ko") {
      const thresh = ev.bodyPartIndex === 0 ? 0.5 * simOpts.damageThreshold : 1.0 * simOpts.damageThreshold;
      return { passes: ev.dmgPerWound > thresh, ratio: ev.dmgPerWound / Math.max(0.01, thresh), ev };
    }
    if (criterion === "ace_heart") {
      const thresh = ev.bodyPartIndex === 0 ? 1.0 : ACE_CONST.ORGAN_DAMAGE_THRESHOLD;
      return { passes: ev.dmgPerWound >= thresh, ratio: ev.dmgPerWound / thresh, ev };
    }
    return { passes: ev.dmgPerWound > ACE_CONST.PENETRATION_THRESHOLD, ratio: ev.dmgPerWound / ACE_CONST.PENETRATION_THRESHOLD, ev };
  }

  if (criterion === "rha_100") {
    const ratio = ev.acePenDepth / plateMM;
    return { passes: ratio >= 0.9995, ratio, ev };
  }
  if (criterion === "ace_ko") {
    const thresh = ev.bodyPartIndex === 0
      ? ACE_CONST.HEAD_KNOCKOUT_THRESHOLD * simOpts.damageThreshold
      : Math.max(ACE_CONST.PENETRATION_THRESHOLD + 0.001, ACE_CONST.BODY_KNOCKOUT_THRESHOLD * simOpts.damageThreshold);
    return { passes: ev.dmgPerWound > thresh, ratio: ev.dmgPerWound / thresh, ev };
  }
  if (criterion === "ace_heart") {
    const thresh = ev.bodyPartIndex === 0 ? ACE_CONST.HEAD_DAMAGE_THRESHOLD : ACE_CONST.ORGAN_DAMAGE_THRESHOLD;
    return { passes: ev.dmgPerWound >= thresh, ratio: ev.dmgPerWound / thresh, ev };
  }
  // Default: "ace_bleed" (dmgPerWound > 0.35)
  const ratio = ev.dmgPerWound / ACE_CONST.PENETRATION_THRESHOLD;
  return { passes: ev.dmgPerWound > ACE_CONST.PENETRATION_THRESHOLD + 1e-4, ratio, ev };
}

function computeMaxCriterionRange(round, targetSpec, criterion, simOpts) {
  if (!round) return 0;
  const check0 = evaluateCriterionMetric(round, targetSpec, 0, criterion, simOpts);
  if (check0.ev.aceArmorThicknessMM <= 0 && targetSpec.mode === "plate" && targetSpec.rhaMM <= 0) {
    return 2000;
  }
  if (!check0.passes) return 0;

  const checkMax = evaluateCriterionMetric(round, targetSpec, 2000, criterion, simOpts);
  if (checkMax.passes) return 2000;

  let lo = 0;
  let hi = 2000;
  for (let i = 0; i < 22; i++) {
    const mid = 0.5 * (lo + hi);
    if (evaluateCriterionMetric(round, targetSpec, mid, criterion, simOpts).passes) lo = mid;
    else hi = mid;
  }
  return Math.round(0.5 * (lo + hi));
}

function solveCaliberForTargetRange(baseRound, targetSpec, desiredDist, criterion, simOpts, allowHitBump = true) {
  const workRound = { ...baseRound };
  const checkSample = evaluateCriterionMetric(workRound, targetSpec, 0, criterion, simOpts);
  const bpIdx = checkSample.ev.bodyPartIndex;

  // Special case: Unarmored-only goal ("0") or Stop @ 0m (desiredDist <= 0)
  if (desiredDist <= 0) {
    const stopSpec = (targetSpec.mode === "plate" && targetSpec.rhaMM <= 0)
      ? { mode: "plate", rhaMM: ACE_CONST.ARMOR_THICKNESS_RHA[0] }
      : targetSpec;
    // Binary search caliber so ratio at 0m is ~0.85 (safely stopped even with +10% roll)
    let lo = 0.02;
    let hi = 25.0;
    for (let i = 0; i < 26; i++) {
      const mid = 0.5 * (lo + hi);
      workRound.caliber = mid;
      const m0 = evaluateCriterionMetric(workRound, stopSpec, 0, criterion, simOpts);
      if (m0.ratio < 0.85) lo = mid;
      else hi = mid;
    }
    return { caliber: Number((0.5 * (lo + hi)).toFixed(4)), hit: workRound.hit };
  }

  // Ensure `hit` is theoretically high enough to satisfy criterion at 100% RHA perforation
  const minHit = getMinHitForCriterion(criterion, simOpts.damageThreshold, bpIdx);
  let effectiveCriterion = criterion;
  if (workRound.hit < minHit) {
    if (allowHitBump) {
      workRound.hit = Number(minHit.toFixed(2));
    } else {
      // User is manually lowering hit with Lock Pen checked: fall back to rha_100 at desiredDist
      effectiveCriterion = "rha_100";
    }
  }

  let lo = 0.02;
  let hi = 30.0;
  for (let i = 0; i < 28; i++) {
    const mid = 0.5 * (lo + hi);
    workRound.caliber = mid;
    const res = evaluateCriterionMetric(workRound, targetSpec, desiredDist + 0.25, effectiveCriterion, simOpts);
    if (!res.passes) lo = mid;
    else hi = mid;
  }
  return { caliber: Number(Math.max(0.02, 0.5 * (lo + hi)).toFixed(4)), hit: workRound.hit };
}

// ============================================================================
// ACE 3.21.2 Medical Dummy Canvas Renderer & Patient State
// ============================================================================
const patientState = {
  mode: "preview", // "preview" (1-shot deterministic expectation) or "live" (stochastic multi-shot)
  shotsFired: 0,
  bodyPartDamage: [0, 0, 0, 0, 0, 0],
  penetratingBodyDamage: 0,
  bodyPartBloodLoss: [0, 0, 0, 0, 0, 0],
  fractures: [0, 0, 0, 0, 0, 0], // 0: none, 1: fractured, -1: splinted
  tourniquets: [0, 0, 0, 0, 0, 0],
  openWounds: { head: [], body: [], leftarm: [], rightarm: [], leftleg: [], rightleg: [] },
  bandagedWounds: { head: [], body: [], leftarm: [], rightarm: [], leftleg: [], rightleg: [] },
  pain: 0,
  bloodVolume: 6.0,
  isFatal: false,
  fatalReason: "",
  isUnconscious: false,
  koReason: "",
  limping: false
};

function aceBloodLossToRGBA(bloodLoss) {
  const fr = Math.max(0, Math.min(1, bloodLoss / ACE_CONST.BLOOD_LOSS_RED_THRESHOLD));
  const idx = Math.ceil(fr * (ACE_BLOOD_LOSS_COLORS.length - 1));
  return ACE_BLOOD_LOSS_COLORS[idx] || ACE_BLOOD_LOSS_COLORS[0];
}

function aceDamageToRGBA(damageNorm) {
  const fr = Math.max(0, Math.min(1, damageNorm / ACE_CONST.DAMAGE_BLUE_THRESHOLD));
  const idx = Math.ceil(fr * (ACE_DAMAGE_COLORS.length - 1));
  return ACE_DAMAGE_COLORS[idx] || ACE_DAMAGE_COLORS[0];
}

function resetPatientDummy() {
  patientState.shotsFired = 0;
  patientState.bodyPartDamage = [0, 0, 0, 0, 0, 0];
  patientState.penetratingBodyDamage = 0;
  patientState.bodyPartBloodLoss = [0, 0, 0, 0, 0, 0];
  patientState.fractures = [0, 0, 0, 0, 0, 0];
  patientState.tourniquets = [0, 0, 0, 0, 0, 0];
  patientState.openWounds = { head: [], body: [], leftarm: [], rightarm: [], leftleg: [], rightleg: [] };
  patientState.bandagedWounds = { head: [], body: [], leftarm: [], rightarm: [], leftleg: [], rightleg: [] };
  patientState.pain = 0;
  patientState.bloodVolume = 6.0;
  patientState.isFatal = false;
  patientState.fatalReason = "";
  patientState.isUnconscious = false;
  patientState.koReason = "";
  patientState.limping = false;
}

function addOrMergeWound(list, woundObj) {
  const existing = list.find(w => w.key === woundObj.key);
  if (existing) {
    const newAmt = existing.amountOf + woundObj.amountOf;
    existing.bleeding = (existing.amountOf * existing.bleeding + woundObj.amountOf * woundObj.bleeding) / newAmt;
    existing.damage = (existing.amountOf * existing.damage + woundObj.amountOf * woundObj.damage) / newAmt;
    existing.amountOf = newAmt;
  } else {
    list.push({ ...woundObj });
  }
}

function syncPreviewPatientFromShot(shotResult) {
  resetPatientDummy();
  patientState.shotsFired = 1;
  const pIdx = shotResult.bodyPartIndex;
  const partKey = ACE_BODY_PARTS[pIdx];

  patientState.bodyPartDamage[pIdx] = shotResult.expectedWoundDamage;
  patientState.penetratingBodyDamage = shotResult.expectedPenetratingBodyDamage || 0;
  patientState.bodyPartBloodLoss[pIdx] = shotResult.expectedRawPartBleed;
  patientState.pain = Math.min(1.0, shotResult.expectedPain);

  for (const wb of shotResult.woundBreakdowns) {
    const amt = wb.probability * shotResult.nWoundsExpected;
    if (amt > 0.01) {
      addOrMergeWound(patientState.openWounds[partKey], {
        key: `${wb.type}_${wb.categoryIdx}`,
        displayName: wb.displayName,
        amountOf: amt,
        bleeding: wb.bleeding,
        damage: wb.woundDamage
      });
    }
    if (wb.causeFracture && wb.probability >= 0.25) {
      patientState.fractures[pIdx] = 1;
    }
    if (wb.causeLimping && wb.probability >= 0.25) {
      patientState.limping = true;
    }
  }

  if (shotResult.totalFatalProb >= 0.5) {
    patientState.isFatal = true;
    patientState.fatalReason = shotResult.vitalFatalProb >= 0.5 ? "Lethal Vital Organ Shot" : "Fatal Cumulative Trauma";
  }
  if (patientState.isFatal || shotResult.koProb >= 0.5) {
    patientState.isUnconscious = true;
    patientState.koReason = patientState.isFatal
      ? patientState.fatalReason
      : (shotResult.traumaKoProb >= 0.5 ? "Critical Trauma (> KO Threshold)" : `Pain KO (${(shotResult.koProb * 100).toFixed(0)}%)`);
  }
}

function fireLiveShotOnPatient(shotResult, damageThreshold = 1.0) {
  patientState.mode = "live";
  patientState.shotsFired += 1;
  const pIdx = shotResult.bodyPartIndex;
  const partKey = ACE_BODY_PARTS[pIdx];

  // Exact ACE3 stochastic wound count: ceil(expected - random 1) — allows 0 when expected < 1
  const nWounds = shotResult.nWoundsExpected <= 0
    ? 0
    : Math.max(0, Math.ceil(shotResult.nWoundsExpected - Math.random()));

  let shotPainSum = 0;

  for (let i = 0; i < nWounds; i++) {
    if (shotResult.woundBreakdowns.length === 0) break;
    let r = Math.random();
    let chosen = shotResult.woundBreakdowns[shotResult.woundBreakdowns.length - 1];
    for (const wb of shotResult.woundBreakdowns) {
      if (r <= wb.probability) {
        chosen = wb;
        break;
      }
      r -= wb.probability;
    }
    // Exact SQF `random [0.9, 1, 1.1]` symmetric triangular distribution
    const variance = sampleTriangularVariance();
    const wDmg = chosen.woundDamage * variance;
    const wSpec = chosen.wSpec;
    const wBase = chosen.wBase;
    const woundSize = linearConversion(0.1, 2.0, wDmg * wSpec.sizeMult, Math.pow(0.5, 3), 1.0, true);
    const categoryIdx = Math.max(0, Math.min(2, 2 - Math.floor(Math.log(Math.max(1e-6, woundSize)) / Math.log(0.5))));
    const categoryName = ["Minor", "Medium", "Large"][categoryIdx];
    const pain = woundSize * wSpec.painMult * wBase.pain;
    const bleeding = woundSize * wSpec.bleedMult * wBase.bleeding;

    patientState.bodyPartDamage[pIdx] += wDmg;
    if (pIdx === 1 && wDmg >= ACE_CONST.PENETRATION_THRESHOLD) {
      patientState.penetratingBodyDamage += wDmg;
    }
    shotPainSum += pain;

    addOrMergeWound(patientState.openWounds[partKey], {
      key: `${chosen.type}_${categoryIdx}`,
      displayName: `${categoryName} ${wBase.name}`,
      amountOf: 1,
      bleeding,
      damage: wDmg
    });

    if (wBase.causeFracture && pIdx > 1 && wDmg > ACE_CONST.FRACTURE_DAMAGE_THRESHOLD) {
      patientState.fractures[pIdx] = 1;
    }
    if (wBase.causeLimping && pIdx > 3 && wDmg > ACE_CONST.LIMPING_DAMAGE_THRESHOLD) {
      patientState.limping = true;
    }

    if (pIdx === 0 && wDmg >= ACE_CONST.HEAD_DAMAGE_THRESHOLD) {
      patientState.isFatal = true;
      patientState.fatalReason = "Lethal Headshot (>= 1.0)";
    } else if (pIdx === 1 && wDmg >= ACE_CONST.ORGAN_DAMAGE_THRESHOLD && Math.random() < ACE_CONST.HEART_HIT_CHANCE) {
      patientState.isFatal = true;
      patientState.fatalReason = "Lethal Heart Shot (5% roll)";
    }
  }

  // Exact ace_medical_status_fnc_adjustPainLevel: MAX across separate shots, NOT sum!
  patientState.pain = Math.min(1.0, Math.max(patientState.pain, Math.min(1.0, shotPainSum)));

  for (let idx = 0; idx < 6; idx++) {
    const pk = ACE_BODY_PARTS[idx];
    patientState.bodyPartBloodLoss[idx] = patientState.tourniquets[idx] > 0
      ? 0
      : patientState.openWounds[pk].reduce((s, w) => s + w.bleeding * w.amountOf, 0);
  }

  // Check Weibull sum of trauma on Head + Torso
  const headThresh = 1.25 * damageThreshold;
  const bodyThresh = 1.50 * damageThreshold;
  const vitalDamage = Math.max(0, patientState.bodyPartDamage[0] - headThresh) +
                      Math.max(0, patientState.bodyPartDamage[1] - bodyThresh);
  if (vitalDamage > 0 && !patientState.isFatal) {
    const pFatal = 1 - Math.exp(-Math.pow(vitalDamage / FATAL_SUM_DAMAGE_WEIBULL_L, FATAL_SUM_DAMAGE_WEIBULL_K));
    if (Math.random() < pFatal) {
      patientState.isFatal = true;
      patientState.fatalReason = `Fatal Trauma Sum (Weibull P=${(pFatal * 100).toFixed(0)}%)`;
    }
  }

  // Exact ace_medical_status_fnc_handleIncapacitation unconsciousness check
  if (patientState.isFatal) {
    patientState.isUnconscious = true;
    patientState.koReason = patientState.fatalReason;
  } else if (patientState.bodyPartDamage[0] > ACE_CONST.HEAD_KNOCKOUT_THRESHOLD * damageThreshold) {
    patientState.isUnconscious = true;
    patientState.koReason = `Head Trauma (> ${(0.5 * damageThreshold).toFixed(2)})`;
  } else if (patientState.penetratingBodyDamage > ACE_CONST.BODY_KNOCKOUT_THRESHOLD * damageThreshold) {
    patientState.isUnconscious = true;
    patientState.koReason = `Penetrating Torso Trauma (> ${(1.0 * damageThreshold).toFixed(2)})`;
  } else if (patientState.pain >= ACE_CONST.PAIN_UNCONSCIOUS && Math.random() < ACE_CONST.PAIN_UNCONSCIOUS_CHANCE) {
    patientState.isUnconscious = true;
    patientState.koReason = "Pain Shock (10% roll)";
  }
}

const loadedAceTextures = {};
const offscreenTintCanvas = document.createElement("canvas");
offscreenTintCanvas.width = 256;
offscreenTintCanvas.height = 256;
const offscreenTintCtx = offscreenTintCanvas.getContext("2d");

function initAceTextures(callback) {
  if (typeof ACE_BODY_TEXTURES === "undefined") {
    if (callback) callback();
    return;
  }
  const keys = Object.keys(ACE_BODY_TEXTURES);
  let remaining = keys.length;
  if (remaining === 0 && callback) callback();
  for (const k of keys) {
    const img = new Image();
    img.onload = () => {
      loadedAceTextures[k] = img;
      remaining--;
      if (remaining === 0 && callback) callback();
    };
    img.onerror = () => {
      remaining--;
      if (remaining === 0 && callback) callback();
    };
    img.src = ACE_BODY_TEXTURES[k];
  }
}

function drawTintedTexture(ctx, texName, rgba, boostAlpha = 1.0) {
  const img = loadedAceTextures[texName];
  if (!img) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  offscreenTintCtx.clearRect(0, 0, w, h);
  offscreenTintCtx.globalCompositeOperation = "source-over";
  offscreenTintCtx.drawImage(img, 0, 0, w, h);

  offscreenTintCtx.globalCompositeOperation = "multiply";
  const r = Math.round(rgba[0] * 255);
  const g = Math.round(rgba[1] * 255);
  const b = Math.round(rgba[2] * 255);
  offscreenTintCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  offscreenTintCtx.fillRect(0, 0, w, h);

  offscreenTintCtx.globalCompositeOperation = "destination-in";
  offscreenTintCtx.drawImage(img, 0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = Math.min(1, rgba[3]);
  ctx.drawImage(offscreenTintCanvas, 0, 0, w, h);
  if (boostAlpha > 1.0 && (rgba[0] > 0 || rgba[1] > 0 || rgba[2] > 0)) {
    ctx.globalAlpha = Math.min(1, (boostAlpha - 1.0) * 0.85);
    ctx.drawImage(offscreenTintCanvas, 0, 0, w, h);
  }
  ctx.restore();
}

function renderAceBodyDummy(selectedPartIndex, damageThreshold = 1.0) {
  const canvas = document.getElementById("aceBodyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (loadedAceTextures["background"]) {
    ctx.drawImage(loadedAceTextures["background"], 0, 0, w, h);
  }

  const partConfigs = [
    { idx: 0, tex: "head",      sel: "head_s",      bone: null,          tq: null },
    { idx: 1, tex: "torso",     sel: "torso_s",     bone: null,          tq: null },
    { idx: 2, tex: "arm_left",  sel: "arm_left_s",  bone: "arm_left_b",  tq: "arm_left_t" },
    { idx: 3, tex: "arm_right", sel: "arm_right_s", bone: "arm_right_b", tq: "arm_right_t" },
    { idx: 4, tex: "leg_left",  sel: "leg_left_s",  bone: "leg_left_b",  tq: "leg_left_t" },
    { idx: 5, tex: "leg_right", sel: "leg_right_s", bone: "leg_right_b", tq: "leg_right_t" }
  ];

  for (const pc of partConfigs) {
    const bl = patientState.bodyPartBloodLoss[pc.idx] || 0;
    const dmg = patientState.bodyPartDamage[pc.idx] || 0;
    let rgba;
    if (bl > 0.0005) {
      rgba = aceBloodLossToRGBA(bl);
    } else {
      let partThresh = damageThreshold * 1.5;
      if (pc.idx === 0) partThresh = damageThreshold * 1.25;
      else if (pc.idx === 2 || pc.idx === 3) partThresh = ACE_CONST.FRACTURE_DAMAGE_THRESHOLD * 4;
      else if (pc.idx >= 4) partThresh = ACE_CONST.LIMPING_DAMAGE_THRESHOLD * 4;
      const normDmg = Math.min(1, dmg / Math.max(0.01, partThresh));
      rgba = aceDamageToRGBA(normDmg);
    }
    drawTintedTexture(ctx, pc.tex, rgba, 2.1);

    if (pc.bone && patientState.fractures[pc.idx] !== 0) {
      const boneColor = patientState.fractures[pc.idx] === 1 ? [1, 0.1, 0.1, 1] : [0.2, 0.4, 1, 1];
      drawTintedTexture(ctx, pc.bone, boneColor, 1.5);
    }
    if (pc.tq && patientState.tourniquets[pc.idx] > 0) {
      drawTintedTexture(ctx, pc.tq, [0.1, 0.35, 1.0, 1], 1.5);
    }
    if (pc.idx === selectedPartIndex) {
      drawTintedTexture(ctx, pc.sel, [1, 1, 1, 1], 1.2);
    }
  }
}

function updateAceInjuryListDOM(selectedPartIndex, shotResult, damageThreshold = 1.0) {
  const listEl = document.getElementById("aceInjuryList");
  const triageEl = document.getElementById("aceTriageBar");
  const modeLabelEl = document.getElementById("aceDummyModeLabel");
  const shotsLabelEl = document.getElementById("aceDummyShotsLabel");
  if (!listEl || !triageEl) return;

  if (modeLabelEl) {
    modeLabelEl.textContent = patientState.mode === "live" ? "LIVE MULTI-SHOT" : "1-SHOT PREVIEW";
    modeLabelEl.style.color = patientState.mode === "live" ? "#f97316" : "#eab308";
  }
  if (shotsLabelEl) {
    shotsLabelEl.textContent = `Shots: ${patientState.shotsFired}`;
  }

  const entries = [];
  const totalBleed = computeAceTotalBleedRate(patientState.bodyPartBloodLoss, patientState.tourniquets);
  const koThresh = ACE_CONST.BLOOD_LOSS_KNOCK_OUT_THRESHOLD;

  if (totalBleed > 0.0005) {
    if (totalBleed < koThresh * 0.1) {
      entries.push({ text: "Slowly losing blood", color: "#facc15" });
    } else if (totalBleed < koThresh * 0.5) {
      entries.push({ text: "Moderately losing blood", color: "#fb923c" });
    } else if (totalBleed < koThresh * 1.0) {
      entries.push({ text: "Severely losing blood", color: "#f97316" });
    } else {
      entries.push({ text: "Massively losing blood", color: "#ef4444" });
    }
    const initMlPerSec = totalBleed * (ACE_CONST.HEALTHY_CARDIAC_OUTPUT_LPS * 1000);
    const meanMlPerSec = totalBleed * (ACE_CONST.MEAN_BLEEDOUT_CO_LPS * 1000);
    const secToFatal = meanMlPerSec > 0 ? Math.round(3000 / meanMlPerSec) : 9999;
    entries.push({
      text: `Bleed: ${totalBleed.toFixed(3)} CO (${initMlPerSec.toFixed(1)} mL/s · ~${secToFatal}s fatal)`,
      color: "#fca5a5"
    });
  } else {
    entries.push({ text: "No bleeding", color: "rgba(255,255,255,0.35)" });
  }

  const pain = patientState.pain;
  if (pain > 0.001) {
    if (pain >= ACE_CONST.PAIN_UNCONSCIOUS) {
      entries.push({ text: `In severe pain (${(pain * 100).toFixed(0)}% · 10% KO roll)`, color: "#f87171" });
    } else if (pain > ACE_CONST.PAIN_UNCONSCIOUS / 5) {
      entries.push({ text: `In pain (${(pain * 100).toFixed(0)}%)`, color: "#fde047" });
    } else {
      entries.push({ text: `In mild pain (${(pain * 100).toFixed(0)}%)`, color: "#fef08a" });
    }
  } else {
    entries.push({ text: "No pain", color: "rgba(255,255,255,0.35)" });
  }

  const partName = ACE_BODY_LABELS[selectedPartIndex] || "Torso";
  const partKey = ACE_BODY_PARTS[selectedPartIndex] || "body";
  const partDmg = patientState.bodyPartDamage[selectedPartIndex] || 0;
  const penSub = selectedPartIndex === 1 ? ` · Pen: ${patientState.penetratingBodyDamage.toFixed(2)}` : "";
  entries.push({ text: `── ${partName.toUpperCase()} (Trauma: ${partDmg.toFixed(2)}${penSub}) ──`, color: "#eab308", bold: true });

  if (patientState.tourniquets[selectedPartIndex] > 0) {
    entries.push({ text: "[T] Tourniquet Applied", color: "#60a5fa" });
  }
  if (patientState.fractures[selectedPartIndex] === 1) {
    entries.push({ text: "Fractured Bone (> 0.50 limb dmg)", color: "#ef4444", bold: true });
  } else if (patientState.fractures[selectedPartIndex] === -1) {
    entries.push({ text: "[S] Splint Applied", color: "#60a5fa" });
  }
  if (selectedPartIndex >= 4 && patientState.limping) {
    entries.push({ text: "Limping (> 0.30 leg damage)", color: "#fb923c" });
  }

  const openW = patientState.openWounds[partKey] || [];
  const bandW = patientState.bandagedWounds[partKey] || [];
  if (openW.length === 0 && bandW.length === 0) {
    entries.push({ text: "No injuries on this body part", color: "rgba(255,255,255,0.35)" });
  } else {
    for (const w of openW) {
      const countStr = patientState.mode === "preview" && w.amountOf < 0.99
        ? `${(w.amountOf * 100).toFixed(0)}% chance:`
        : `${Math.ceil(w.amountOf)}x`;
      const isBruise = w.displayName.includes("Contusion");
      entries.push({
        text: `${countStr} ${w.displayName}`,
        color: isBruise ? "#67e8f9" : "#ffffff",
        bold: !isBruise
      });
    }
    for (const w of bandW) {
      entries.push({
        text: `[B] ${Math.ceil(w.amountOf)}x ${w.displayName}`,
        color: "#e0b2a6"
      });
    }
  }

  listEl.innerHTML = entries
    .map(e => `<li style="color:${e.color};${e.bold ? "font-weight:700;" : ""}">${e.text}</li>`)
    .join("");

  if (patientState.isFatal) {
    triageEl.style.background = "#991b1b";
    triageEl.style.color = "#fecaca";
    triageEl.textContent = `BLACK / DEAD — ${patientState.fatalReason}`;
  } else if (patientState.isUnconscious || totalBleed >= koThresh * 0.5) {
    triageEl.style.background = "#dc2626";
    triageEl.style.color = "#fff";
    triageEl.textContent = `IMMEDIATE (T1) — ${patientState.isUnconscious ? (patientState.koReason || "UNCONSCIOUS") : "SEVERE HEMORRHAGE"}`;
  } else if (totalBleed > 0.001 || patientState.fractures.some(f => f === 1)) {
    triageEl.style.background = "#d97706";
    triageEl.style.color = "#000";
    triageEl.textContent = "DELAYED (T2) — OPEN WOUNDS / FRACTURE";
  } else if (patientState.pain > 0) {
    triageEl.style.background = "#16a34a";
    triageEl.style.color = "#fff";
    triageEl.textContent = "MINIMAL (T3) — BLUNT CONTUSION ONLY (PLATE STOPPED)";
  } else {
    triageEl.style.background = "#1e293b";
    triageEl.style.color = "#94a3b8";
    triageEl.textContent = "NO INJURIES — PATIENT HEALTHY";
  }
}

// ============================================================================
// Application State & Reference Cartridge Library
// ============================================================================
const appState = {
  selectedHitpoint: "HitChest",
  rangeMeters: 100,
  impactAngleDeg: 0,
  useAdvBallistics: false,
  alternateArmorPen: true,
  damageThreshold: 1.0,
  dragMode: "bc", // "bc" | "vel"
  originalRound: null,
  currentRound: null,
  originalArmorLoadout: { uniform: null, vest: null, helmet: null },
  armorLoadout: { uniform: null, vest: null, helmet: null },
  pinnedVests: [],
  pinnedRounds: [],
  modifiedRounds: {},
  modifiedGear: { vest: {}, helmet: {} },
  showCustomRhaRow: false,
  rwUnits: "metric"
};

function cleanDisplayString(str) {
  if (!str) return "";
  let s = String(str).trim();
  if (s.startsWith("$STR_")) {
    s = s
      .replace(/^\$STR_A3_(?:A_)?(?:CfgMagazines_|CfgWeapons_|CfgAmmo_)/i, "")
      .replace(/^\$STR_[A-Za-z0-9]+_/, "")
      .replace(/0$/, "")
      .replace(/_/g, " ");
  }
  return s;
}

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : null;
}

function getSimOpts() {
  return {
    impactAngleDeg: appState.impactAngleDeg,
    useAdvBallistics: appState.useAdvBallistics,
    alternateArmorPen: appState.alternateArmorPen,
    damageThreshold: appState.damageThreshold
  };
}

const GRAINS_PER_GRAM = 15.432358;
const FPS_PER_MPS = 3.28084;
const MM_PER_INCH = 25.4;
const MATRIX_MAX_RANGE = 1000;
const CHART_MAX_RANGE = 1200;

// REAL_WORLD_CARTRIDGE_LIBRARY & findBestRealWorldSpec(round) are loaded from real_world_catalog.js

// ============================================================================
// Interactive Range Charts (Hover Crosshair + Click-to-Set-Range + Preset Curves)
// ============================================================================
const chartHoverState = {
  hoverRange: null,
  pad: { left: 46, right: 14, top: 13, bottom: 24 }
};

function drawRangeChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(280, Math.floor(rect.width || 400));
  const h = Math.max(155, Math.floor(rect.height || 178));
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const pad = chartHoverState.pad;
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const maxRange = config.maxRange || CHART_MAX_RANGE;
  const yMin = config.yMin !== undefined ? config.yMin : 0;
  let yMax = config.yMax || 10;
  for (const s of config.series) {
    for (const pt of s.points) {
      if (pt.y > yMax) yMax = pt.y * 1.08;
    }
  }
  if (config.thresholds) {
    for (const th of config.thresholds) {
      if (th.value > yMax) yMax = th.value * 1.12;
    }
  }
  if (yMax <= yMin) yMax = yMin + 1;

  const xToPx = x => pad.left + (x / maxRange) * pw;
  const yToPx = y => pad.top + ph - ((y - yMin) / (yMax - yMin)) * ph;

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.font = "9.5px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#64748b";

  for (let i = 0; i <= 4; i++) {
    const yVal = yMin + ((yMax - yMin) * i) / 4;
    const py = yToPx(yVal);
    ctx.beginPath();
    ctx.moveTo(pad.left, py);
    ctx.lineTo(w - pad.right, py);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(yVal >= 100 ? yVal.toFixed(0) : yVal.toFixed(2), pad.left - 5, py + 3);
  }

  for (let r = 0; r <= maxRange; r += 200) {
    const px = xToPx(r);
    ctx.beginPath();
    ctx.moveTo(px, pad.top);
    ctx.lineTo(px, h - pad.bottom);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(`${r}m`, px, h - 7);
  }

  if (config.thresholds) {
    for (const th of config.thresholds) {
      if (th.value < yMin || th.value > yMax) continue;
      const py = yToPx(th.value);
      ctx.save();
      ctx.strokeStyle = th.color || "#ef4444";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();
      ctx.fillStyle = th.color || "#ef4444";
      ctx.textAlign = "right";
      ctx.fillText(th.label, w - pad.right - 3, py - 3);
      ctx.restore();
    }
  }

  // Active Engagement Range vertical marker
  if (appState.rangeMeters <= maxRange) {
    const cx = xToPx(appState.rangeMeters);
    ctx.save();
    ctx.strokeStyle = "rgba(250, 204, 21, 0.72)";
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, pad.top);
    ctx.lineTo(cx, h - pad.bottom);
    ctx.stroke();
    ctx.restore();
  }

  // Series curves
  for (const s of config.series) {
    if (!s.points || s.points.length === 0) continue;
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.dashed ? 1.5 : 2.1;
    if (s.dashed) ctx.setLineDash([5, 3]);
    ctx.beginPath();
    s.points.forEach((pt, idx) => {
      const px = xToPx(pt.x);
      const py = Math.max(pad.top, Math.min(h - pad.bottom, yToPx(pt.y)));
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Interactive Hover Crosshair & Dot
  if (chartHoverState.hoverRange !== null && chartHoverState.hoverRange <= maxRange) {
    const hx = xToPx(chartHoverState.hoverRange);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, pad.top);
    ctx.lineTo(hx, h - pad.bottom);
    ctx.stroke();

    const mainSeries = config.series[config.series.length - 1];
    if (mainSeries && config.hoverY !== undefined) {
      const hy = Math.max(pad.top, Math.min(h - pad.bottom, yToPx(config.hoverY)));
      ctx.fillStyle = mainSeries.color;
      ctx.beginPath();
      ctx.arc(hx, hy, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#090c10";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function renderAllCharts() {
  if (!appState.currentRound) return;
  const maxR = CHART_MAX_RANGE;
  const step = 25;
  const opts = getSimOpts();

  const velPts = [];
  const origVelPts = [];
  const rhaPts = [];
  const origRhaPts = [];
  const aceDmgPts = [];
  const origAceDmgPts = [];
  const bleedPts = [];
  const origBleedPts = [];

  for (let r = 0; r <= maxR; r += step) {
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, r, opts);
    velPts.push({ x: r, y: ev.effectiveSpeed });
    rhaPts.push({ x: r, y: ev.acePenDepth });
    aceDmgPts.push({ x: r, y: ev.dmgPerWound });
    bleedPts.push({ x: r, y: ev.expectedBleedRate });

    if (appState.originalRound) {
      const origLoadout = appState.originalArmorLoadout.uniform ? appState.originalArmorLoadout : appState.armorLoadout;
      const origEv = evaluateShot(appState.originalRound, origLoadout, appState.selectedHitpoint, r, opts);
      origVelPts.push({ x: r, y: origEv.effectiveSpeed });
      origRhaPts.push({ x: r, y: origEv.acePenDepth });
      origAceDmgPts.push({ x: r, y: origEv.dmgPerWound });
      origBleedPts.push({ x: r, y: origEv.expectedBleedRate });
    }
  }

  const probeRange = chartHoverState.hoverRange !== null ? chartHoverState.hoverRange : appState.rangeMeters;
  const probeEv = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, probeRange, opts);
  const tagPrefix = chartHoverState.hoverRange !== null ? `@ ${Math.round(probeRange)}m` : `@ ${Math.round(probeRange)}m`;

  const setSub = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setSub("chtSubVel", `${tagPrefix}: ${probeEv.effectiveSpeed.toFixed(0)} m/s (${probeEv.kineticEnergyJ.toFixed(0)} J)`);
  setSub("chtSubPen", `${tagPrefix}: ${probeEv.acePenDepth.toFixed(1)} mm RHAe`);
  setSub("chtSubDmg", `${tagPrefix}: ${probeEv.dmgPerWound.toFixed(3)} dmg`);
  setSub("chtSubBleed", `${tagPrefix}: ${probeEv.expectedBleedRate.toFixed(3)} CO`);

  drawRangeChart("chartVelocity", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(900, Number(appState.currentRound.initSpeed) * 1.05),
    hoverY: probeEv.effectiveSpeed,
    thresholds: [{ value: 340.3, label: "Mach 1 (340 m/s)", color: "#64748b" }],
    series: [
      { points: origVelPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: velPts, color: "#38bdf8" }
    ]
  });

  const rhaThresholds = [];
  if (probeEv.aceArmorThicknessMM > 0) {
    rhaThresholds.push({
      value: probeEv.aceArmorThicknessMM,
      label: `Armor Lvl ${probeEv.aceArmorLevel} (${probeEv.aceArmorThicknessMM} mm)`,
      color: "#f97316"
    });
  }
  drawRangeChart("chartPenetration", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(25, rhaPts[0].y * 1.15, probeEv.aceArmorThicknessMM * 1.25),
    hoverY: probeEv.acePenDepth,
    thresholds: rhaThresholds,
    series: [
      { points: origRhaPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: rhaPts, color: "#eab308" }
    ]
  });

  const dmgThresholds = [
    { value: ACE_CONST.PENETRATION_THRESHOLD, label: "Penetrate / Bleed (0.35)", color: "#22c55e" }
  ];
  if (probeEv.bodyPartIndex === 0) {
    dmgThresholds.push({ value: 0.5 * appState.damageThreshold, label: `Head KO (${(0.5 * appState.damageThreshold).toFixed(2)})`, color: "#f97316" });
    dmgThresholds.push({ value: ACE_CONST.HEAD_DAMAGE_THRESHOLD, label: "Fatal Head (1.00)", color: "#ef4444" });
  } else if (probeEv.bodyPartIndex === 1) {
    dmgThresholds.push({ value: ACE_CONST.ORGAN_DAMAGE_THRESHOLD, label: "Heart 5% (0.60)", color: "#f97316" });
    dmgThresholds.push({ value: 1.0 * appState.damageThreshold, label: `Torso KO (${(1.0 * appState.damageThreshold).toFixed(2)})`, color: "#ef4444" });
  } else {
    dmgThresholds.push({ value: ACE_CONST.FRACTURE_DAMAGE_THRESHOLD, label: "Limb Fracture (0.50)", color: "#ef4444" });
  }

  drawRangeChart("chartAceDamage", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(1.4, aceDmgPts[0].y * 1.15),
    hoverY: probeEv.dmgPerWound,
    thresholds: dmgThresholds,
    series: [
      { points: origAceDmgPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: aceDmgPts, color: "#ef4444" }
    ]
  });

  drawRangeChart("chartBleed", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(0.25, bleedPts[0].y * 1.2),
    hoverY: probeEv.expectedBleedRate,
    thresholds: [
      { value: 0.25, label: "Severe Bleed (0.25 CO)", color: "#f97316" },
      { value: 0.50, label: "Massive Bleed (0.50 CO)", color: "#ef4444" }
    ],
    series: [
      { points: origBleedPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: bleedPts, color: "#f43f5e" }
    ]
  });
}

function bindInteractiveChartEvents() {
  const ids = ["chartVelocity", "chartPenetration", "chartAceDamage", "chartBleed"];
  const pxToRange = (canvas, clientX) => {
    const rect = canvas.getBoundingClientRect();
    const pad = chartHoverState.pad;
    const pw = Math.max(10, rect.width - pad.left - pad.right);
    const relX = clientX - rect.left - pad.left;
    return Math.round(Math.max(0, Math.min(CHART_MAX_RANGE, (relX / pw) * CHART_MAX_RANGE)) / 5) * 5;
  };

  ids.forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas.addEventListener("mousemove", e => {
      chartHoverState.hoverRange = pxToRange(canvas, e.clientX);
      renderAllCharts();
    });
    canvas.addEventListener("mouseleave", () => {
      chartHoverState.hoverRange = null;
      renderAllCharts();
    });
    canvas.addEventListener("click", e => {
      const r = pxToRange(canvas, e.clientX);
      setEngagementRange(r);
    });
  });
}

// ============================================================================
// Unified Round Balancer, Armor Tuner, Draggable Matrix & Comparison Tables
// ============================================================================
function buildTargetSpecFromGoal(goalId) {
  if (goalId === "active") {
    return { mode: "loadout", loadout: appState.armorLoadout, hitpoint: appState.selectedHitpoint };
  }
  if (goalId === "custom") {
    const mm = Math.max(1, parseFloat(document.getElementById("rwCustomRhaMM").value) || 28);
    return { mode: "plate", rhaMM: mm };
  }
  const lvl = parseInt(goalId, 10) || 0;
  if (lvl >= 1 && lvl <= 5) {
    return { mode: "plate", rhaMM: ACE_CONST.ARMOR_THICKNESS_RHA[lvl - 1] };
  }
  return { mode: "plate", rhaMM: 0 };
}

function getActiveCriterion() {
  const el = document.getElementById("rwPenCriterion");
  return (el && el.value) || "ace_bleed";
}

function getActiveGoalId() {
  const el = document.getElementById("rwArmorGoalLevel");
  return (el && el.value) || "active";
}

function computeCanonicalBIHit(massGrams, velocityMps, mult = 1.0) {
  const keJoules = 0.5 * (massGrams / 1000) * velocityMps * velocityMps;
  return Math.max(1.0, (Math.sqrt(keJoules) / 5.0) * mult);
}

function isRoundPairModified(r, o) {
  if (!r || !o) return false;
  return (
    Math.abs((r.hit || 0) - (o.hit || 0)) >= 0.02 ||
    Math.abs((r.caliber || 0) - (o.caliber || 0)) >= 0.002 ||
    Math.abs((r.initSpeed || 0) - (o.initSpeed || 0)) >= 0.5 ||
    Math.abs((r.typicalSpeed || 0) - (o.typicalSpeed || 0)) >= 0.5 ||
    Math.abs((r.airFriction || 0) - (o.airFriction || 0)) >= 0.00001 ||
    Math.abs((r.ACE_bulletMass || 0) - (o.ACE_bulletMass || 0)) >= 0.01 ||
    Math.abs((r.ACE_caliber || 0) - (o.ACE_caliber || 0)) >= 0.01 ||
    Math.abs(((r.ACE_ballisticCoefficients && r.ACE_ballisticCoefficients[0]) || 0) - ((o.ACE_ballisticCoefficients && o.ACE_ballisticCoefficients[0]) || 0)) >= 0.002 ||
    (r.ACE_dragModel || 1) !== (o.ACE_dragModel || 1) ||
    (r.ACE_damageType || "bullet") !== (o.ACE_damageType || "bullet") ||
    Math.abs((r.explosive || 0) - (o.explosive || 0)) >= 0.01 ||
    JSON.stringify(r.ACE_muzzleVelocities || []) !== JSON.stringify(o.ACE_muzzleVelocities || []) ||
    r.className !== o.className
  );
}

function isRoundModified() {
  return isRoundPairModified(appState.currentRound, appState.originalRound);
}

function isArmorModified() {
  return JSON.stringify(appState.armorLoadout) !== JSON.stringify(appState.originalArmorLoadout);
}

function syncAceBarrelMuzzleVelocities(round, origRound) {
  if (!round || !origRound || !Array.isArray(origRound.ACE_muzzleVelocities) || origRound.ACE_muzzleVelocities.length === 0) {
    return;
  }
  const newV0 = Number(round.initSpeed) || 0;
  if (newV0 <= 0) return;

  const origInit = Number(origRound.initSpeed) || 0;
  const origMvs = origRound.ACE_muzzleVelocities;
  const closeToInit = origInit > 0 && origMvs.some(v => Math.abs(Number(v) - origInit) / origInit <= 0.08);

  let refVel = origInit;
  if (!closeToInit) {
    if (Array.isArray(origRound.ACE_barrelLengths) && origRound.ACE_barrelLengths.length === origMvs.length) {
      let bestIdx = Math.floor(origMvs.length / 2);
      let bestDiff = Infinity;
      origRound.ACE_barrelLengths.forEach((bl, idx) => {
        const d = Math.abs(Number(bl) - 406.4);
        if (d < bestDiff) {
          bestDiff = d;
          bestIdx = idx;
        }
      });
      refVel = Number(origMvs[bestIdx]) || origInit;
    } else {
      refVel = Number(origMvs[Math.floor(origMvs.length / 2)]) || origInit;
    }
  }
  if (refVel <= 0) return;

  const scale = newV0 / refVel;
  round.ACE_muzzleVelocities = origMvs.map(v => Number((Number(v) * scale).toFixed(1)));
}

function syncActiveEditsToSession() {
  const prevSig = `${Object.keys(appState.modifiedRounds).sort().join(",")}|${Object.keys(appState.modifiedGear.vest).sort().join(",")}|${Object.keys(appState.modifiedGear.helmet).sort().join(",")}`;
  if (appState.originalRound && appState.currentRound) {
    const key = appState.originalRound.className;
    if (isRoundPairModified(appState.currentRound, appState.originalRound)) {
      appState.modifiedRounds[key] = {
        current: deepClone(appState.currentRound),
        original: deepClone(appState.originalRound)
      };
    } else {
      delete appState.modifiedRounds[key];
    }
  }
  ["vest", "helmet"].forEach(slot => {
    const cur = appState.armorLoadout[slot];
    const orig = appState.originalArmorLoadout[slot];
    const key = (orig && orig.className) || (cur && cur.className);
    if (!key) return;
    if (cur && JSON.stringify(cur) !== JSON.stringify(orig)) {
      appState.modifiedGear[slot][key] = {
        current: deepClone(cur),
        original: orig ? deepClone(orig) : null
      };
    } else {
      delete appState.modifiedGear[slot][key];
    }
  });
  const nextSig = `${Object.keys(appState.modifiedRounds).sort().join(",")}|${Object.keys(appState.modifiedGear.vest).sort().join(",")}|${Object.keys(appState.modifiedGear.helmet).sort().join(",")}`;
  if (prevSig !== nextSig && typeof document !== "undefined") {
    const ae = document.activeElement && document.activeElement.id;
    if (ae !== "roundSearch") filterAndPopulateRoundSelect();
    if (ae !== "vestSearch") filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
    if (ae !== "helmetSearch") filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true);
  }
}

function syncAllRoundPanesFromCurrent(skipGoalDistSync = false) {
  const r = appState.currentRound;
  const o = appState.originalRound || r;
  if (!r) return;

  const v0 = Number(r.initSpeed) || Number(r.typicalSpeed) || 850;
  const cal = Number(r.caliber) || 1.0;
  const hit = Number(r.hit) || 8.0;
  const massG = Number(r.ACE_bulletMass) || 4.02;
  const diamMM = Number(r.ACE_caliber) || 5.56;
  const af = Number(r.airFriction) || -0.0011;
  const dragModel = Number(r.ACE_dragModel) || 1;
  const bc = (r.ACE_ballisticCoefficients && Number(r.ACE_ballisticCoefficients[0]))
    || Math.max(0.05, Math.min(1.2, -0.00038 / Math.min(-0.00005, af)));

  // Always-visible top summary strip
  document.getElementById("rssHit").textContent = hit.toFixed(2);
  document.getElementById("rssCaliber").textContent = cal.toFixed(3);
  document.getElementById("rssVel").textContent = `${Math.round(v0)} m/s`;
  document.getElementById("rssRha0").textContent = `${(v0 * cal * ACE_CONST.ARMOR_PENETRABILITY).toFixed(1)} mm`;

  const modBadge = document.getElementById("roundModifiedBadge");
  if (modBadge) modBadge.style.display = isRoundModified() ? "inline-block" : "none";
  const rawModBadge = document.getElementById("rawModifiedCount");
  if (rawModBadge) rawModBadge.style.display = isRoundModified() ? "inline-block" : "none";

  const curProfVal = (document.getElementById("rwProjectileProfile") && document.getElementById("rwProjectileProfile").value) || "manual";
  document.querySelectorAll(".prof-pill[data-prof]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-prof") === curProfVal);
  });

  // Mode 1: Balance vs Armor controls
  document.getElementById("balSolvedCalBadge").textContent = `cal: ${cal.toFixed(3)}`;
  if (document.activeElement !== document.getElementById("rwHitInput")) {
    document.getElementById("rwHitInput").value = hit.toFixed(2);
  }
  if (document.activeElement !== document.getElementById("rwHitSlider")) {
    document.getElementById("rwHitSlider").value = Math.min(45, hit).toFixed(1);
  }

  // Unarmored torso hits to KO / Kill badge
  const evUnarm = evaluateShot(r, null, "HitChest", 10, { ...getSimOpts(), overridePlateRhaMM: 0 });
  document.getElementById("rwUnarmoredStkBadge").textContent =
    `Unarmored: ${evUnarm.shotsToKO} KO / ${evUnarm.shotsToGuaranteedTraumaKill} Kill (${evUnarm.dmgPerWound.toFixed(2)} dmg)`;

  const goalId = getActiveGoalId();
  const showCust = appState.showCustomRhaRow || goalId === "custom";
  const customWrap = document.getElementById("rwCustomRhaWrap");
  if (customWrap) customWrap.style.display = showCust ? "grid" : "none";
  const custToggleBtn = document.getElementById("btnToggleCustomRha");
  if (custToggleBtn) custToggleBtn.classList.toggle("active", showCust);

  if (!skipGoalDistSync) {
    const targetSpec = buildTargetSpecFromGoal(goalId);
    const curMaxD = goalId === "0" ? 0 : computeMaxCriterionRange(r, targetSpec, getActiveCriterion(), getSimOpts());
    if (document.activeElement !== document.getElementById("rwArmorMaxDist")) {
      document.getElementById("rwArmorMaxDist").value = curMaxD;
    }
    if (document.activeElement !== document.getElementById("rwArmorMaxDistSlider")) {
      document.getElementById("rwArmorMaxDistSlider").value = Math.min(1000, curMaxD);
    }
  }

  // Overview & Real-World Specs controls
  const muzzleKE = 0.5 * (massG / 1000) * v0 * v0;
  const ftLbs = muzzleKE * 0.737562;
  document.getElementById("rwMuzzleEnergyBadge").textContent = `KE: ${Math.round(muzzleKE)} J`;
  const ovSpecEl = document.getElementById("ovCartridgeSpecBadge");
  if (ovSpecEl) ovSpecEl.textContent = `${massG.toFixed(1)}g · ${diamMM.toFixed(2)}mm · G${dragModel} BC ${bc.toFixed(3)}`;
  const ovKeEl = document.getElementById("ovKineticBadge");
  if (ovKeEl) ovKeEl.textContent = `Muzzle KE: ${Math.round(muzzleKE)} J (${Math.round(ftLbs)} ft·lb)`;
  document.getElementById("rwSolvedAfLabel").textContent = `af: ${af.toFixed(6)} | G${dragModel} BC ${bc.toFixed(3)}`;

  // Auto-matched Real-World Cartridge suggestion & physics discrepancy detector
  const rwSuggestion = typeof findBestRealWorldSpec === "function" ? findBestRealWorldSpec(r) : null;
  appState.suggestedRwId = rwSuggestion ? rwSuggestion.preset.id : null;
  const sugBox = document.getElementById("ovSuggestedRwBox");
  const sugName = document.getElementById("ovRwMatchName");
  const sugWarn = document.getElementById("ovRwMismatchBadge");
  const sugDetail = document.getElementById("ovRwWarningDetail");
  const sugBtn = document.getElementById("btnApplySuggestedRw");
  if (sugBox && sugName) {
    if (rwSuggestion) {
      const p = rwSuggestion.preset;
      sugName.textContent = `RW Spec: ${p.name}`;
      sugName.title = `${p.name} — BC ${p.bc} (G${p.dragModel}) · Lvl ${p.armorLevel} @ ${p.maxPenDist}m`;
      if (sugBtn) sugBtn.style.display = "inline-flex";
      if (rwSuggestion.warnings.length > 0) {
        sugBox.classList.add("has-warning");
        if (sugWarn) {
          sugWarn.style.display = "inline-block";
          sugWarn.className = "badge badge-amber";
          sugWarn.textContent = `${rwSuggestion.warnings.length} Physics Diff${rwSuggestion.warnings.length > 1 ? "s" : ""}`;
          sugWarn.title = `Active round differs from real-world spec: ${rwSuggestion.warnings.join(", ")}`;
        }
        if (sugDetail) {
          sugDetail.style.display = "block";
          sugDetail.textContent = `Mod vs RW: ${rwSuggestion.warnings.join(" · ")}`;
        }
      } else {
        sugBox.classList.remove("has-warning");
        if (sugWarn) {
          sugWarn.style.display = "inline-block";
          sugWarn.className = "badge badge-green";
          sugWarn.textContent = "Spec Aligned";
          sugWarn.title = "Velocity, mass, diameter, BC & ACE barrel table align with real-world cartridge spec";
        }
        if (sugDetail) sugDetail.style.display = "none";
      }
    } else {
      sugBox.classList.remove("has-warning");
      sugName.textContent = `Non-cartridge / Submunition (${r.ACE_damageType || "bullet"})`;
      sugName.title = "";
      if (sugWarn) sugWarn.style.display = "none";
      if (sugDetail) sugDetail.style.display = "none";
      if (sugBtn) sugBtn.style.display = "none";
    }
  }

  const setValIfNotFocused = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val;
  };
  setValIfNotFocused("rwBulletMass", massG.toFixed(2));
  setValIfNotFocused("rwBulletGrains", (massG * GRAINS_PER_GRAM).toFixed(1));
  setValIfNotFocused("rwBulletDiam", diamMM.toFixed(2));
  setValIfNotFocused("rwBulletInches", (diamMM / MM_PER_INCH).toFixed(3));
  setValIfNotFocused("rwMuzzleVel", Math.round(v0));
  setValIfNotFocused("rwMuzzleFps", Math.round(v0 * FPS_PER_MPS));
  setValIfNotFocused("rwInputBC", Number(bc).toFixed(3));
  setValIfNotFocused("rwInputDragModel", String(dragModel));

  const refDist = Math.max(25, parseFloat(document.getElementById("rwRefDist").value) || 300);
  const { velocity: vRef } = computeVelocityAtRange(r, refDist, appState.useAdvBallistics);
  setValIfNotFocused("rwRefVel", Math.round(vRef));
  setValIfNotFocused("rwRefFps", Math.round(vRef * FPS_PER_MPS));

  // Render 6-column mini downrange trajectory table in Mode 2
  const trajBody = document.getElementById("rwTrajTableBody");
  if (trajBody) {
    const dists = [0, 100, 200, 300, 500, 800];
    trajBody.innerHTML = dists.map(d => {
      const { velocity, tof } = computeVelocityAtRange(r, d, appState.useAdvBallistics);
      const ke = 0.5 * (massG / 1000) * velocity * velocity;
      const rha = velocity * cal * ACE_CONST.ARMOR_PENETRABILITY;
      return `<tr>
        <td><strong>${d}m</strong></td>
        <td>${Math.round(velocity)}</td>
        <td style="color:var(--text-muted);">${Math.round(velocity * FPS_PER_MPS)}</td>
        <td>${Math.round(ke)} J</td>
        <td style="color:var(--accent-hi);">${rha.toFixed(1)}mm</td>
        <td>${tof.toFixed(2)}s</td>
      </tr>`;
    }).join("");
  }

  // Mode 3: Raw CfgAmmo inputs + modified highlight
  const setRawAndMark = (id, val, origVal, tol = 1e-4) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (document.activeElement !== el) el.value = val;
    const changed = typeof val === "string" && isNaN(Number(val))
      ? val !== origVal
      : Math.abs(Number(val) - Number(origVal)) > tol;
    el.classList.toggle("modified", changed);
  };

  setRawAndMark("inpRoundClass", r.className || "Custom_Ammo", o.className || "Custom_Ammo");
  setRawAndMark("inpDamageType", r.ACE_damageType || "bullet", o.ACE_damageType || "bullet");
  setRawAndMark("inpHit", Number(hit.toFixed(3)), o.hit || hit, 0.02);
  setRawAndMark("inpCaliber", Number(cal.toFixed(4)), o.caliber || cal, 0.002);
  setRawAndMark("inpInitSpeed", Number(v0.toFixed(1)), o.initSpeed || v0, 0.5);
  setRawAndMark("inpTypicalSpeed", Number((r.typicalSpeed || v0).toFixed(1)), o.typicalSpeed || v0, 0.5);
  setRawAndMark("inpAirFriction", Number(af.toFixed(7)), o.airFriction || af, 0.00001);
  setRawAndMark("inpDeflecting", Number((r.deflecting !== undefined ? r.deflecting : 15).toFixed(1)), o.deflecting !== undefined ? o.deflecting : 15, 0.2);
  setRawAndMark("inpAceMass", Number(massG.toFixed(3)), o.ACE_bulletMass || massG, 0.01);
  setRawAndMark("inpAceCaliber", Number(diamMM.toFixed(2)), o.ACE_caliber || diamMM, 0.01);
  setRawAndMark("inpAceBC", Number(bc.toFixed(3)), (o.ACE_ballisticCoefficients && o.ACE_ballisticCoefficients[0]) || bc, 0.002);
  setRawAndMark("inpAceDrag", String(dragModel), String(o.ACE_dragModel || 1));
  setRawAndMark("inpExplosive", Number((r.explosive || 0).toFixed(2)), o.explosive || 0, 0.01);

  // Barrel length velocity selector
  const barrelWrap = document.getElementById("barrelSelectWrap");
  const barrelSel = document.getElementById("barrelLengthSelect");
  if (barrelWrap && barrelSel) {
    if (r.ACE_barrelLengths && r.ACE_muzzleVelocities && r.ACE_barrelLengths.length === r.ACE_muzzleVelocities.length && r.ACE_barrelLengths.length > 0) {
      barrelWrap.style.display = "flex";
      const curInit = Math.round(v0);
      const defSpeed = o.initSpeed || v0;
      barrelSel.innerHTML = `<option value="${defSpeed}">Magazine Default (${defSpeed} m/s)</option>` +
        r.ACE_barrelLengths.map((bl, idx) => {
          const inches = (bl / 25.4).toFixed(1);
          const mv = r.ACE_muzzleVelocities[idx];
          const selAttr = Math.abs(mv - curInit) < 1 ? "selected" : "";
          return `<option value="${mv}" ${selAttr}>${bl} mm (${inches}") — ${mv} m/s</option>`;
        }).join("");
    } else {
      barrelWrap.style.display = "none";
    }
  }
}

function renderTunerArmorTierCards() {
  const grid = document.getElementById("rwArmorTierGrid");
  if (!grid || !appState.currentRound) return;
  const goalId = getActiveGoalId();
  const evEq = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, 0, getSimOpts());
  const hpShort = appState.selectedHitpoint.replace("Hit", "");
  const eqSub = evEq.aceArmorThicknessMM > 0
    ? `${hpShort}·L${evEq.aceArmorLevel} (${evEq.aceArmorThicknessMM}mm)`
    : `${hpShort}·0mm`;

  const customMM = Math.max(1, Math.round(parseFloat(document.getElementById("rwCustomRhaMM").value) || 28));

  const cards = [
    { id: "active", title: "Equipped", sub: eqSub, isEqCard: true },
    { id: "1", title: "Lvl I", sub: "6mm" },
    { id: "2", title: "Lvl II", sub: "15mm" },
    { id: "3", title: "Lvl III", sub: "21mm" },
    { id: "4", title: "Lvl IV", sub: "40mm" },
    { id: "5", title: "Lvl V", sub: "55mm" },
    { id: "custom", title: "Custom", sub: `${customMM}mm` },
    { id: "0", title: "Unarmored", sub: "0m" }
  ];

  grid.innerHTML = cards.map(c => {
    const activeCls = goalId === c.id ? "active" : "";
    const eqCls = c.isEqCard ? "equipped-card" : "";
    const eqDot = (!c.isEqCard && String(evEq.aceArmorLevel) === c.id)
      ? `<span class="tier-eq-dot" title="Matches your equipped ${hpShort} armor tier"></span>`
      : "";
    return `<div class="armor-tier-card ${eqCls} ${activeCls}" data-goal="${c.id}">
      ${eqDot}
      <span class="tier-title">${c.title}</span>
      <span class="tier-sub">${c.sub}</span>
    </div>`;
  }).join("");

  grid.querySelectorAll(".armor-tier-card").forEach(card => {
    card.addEventListener("click", () => {
      const gid = card.getAttribute("data-goal");
      document.getElementById("rwArmorGoalLevel").value = gid;
      if (gid === "0") {
        // Unarmored-only button immediately tunes round to stop at Lvl I @ 0m
        const solved = solveCaliberForTargetRange(appState.currentRound, { mode: "plate", rhaMM: 0 }, 0, getActiveCriterion(), getSimOpts(), true);
        appState.currentRound.caliber = solved.caliber;
      }
      updateAllViews();
    });
  });
}

function getPenMatrixRowsSpec() {
  const rows = [];
  const evEq = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, 0, getSimOpts());
  const hpShort = appState.selectedHitpoint.replace("Hit", "");

  if (evEq.aceArmorThicknessMM > 0) {
    const capNote = (evEq.armorInfo.vestOverCapped || evEq.armorInfo.helmOverCapped) ? " #9063" : "";
    rows.push({
      id: "active",
      label: `${hpShort} Gear (L${evEq.aceArmorLevel}·${evEq.aceArmorThicknessMM}mm${capNote})`,
      targetSpec: { mode: "loadout", loadout: appState.armorLoadout, hitpoint: appState.selectedHitpoint },
      isEquipped: true
    });
  }

  rows.push(
    { id: "1", label: "ACE Lvl I (6mm Soft)", targetSpec: { mode: "plate", rhaMM: 6 } },
    { id: "2", label: "ACE Lvl II (15mm IIIA)", targetSpec: { mode: "plate", rhaMM: 15 } },
    { id: "3", label: "ACE Lvl III (21mm Plate)", targetSpec: { mode: "plate", rhaMM: 21 } },
    { id: "4", label: "ACE Lvl IV (40mm ESAPI)", targetSpec: { mode: "plate", rhaMM: 40 } },
    { id: "5", label: "ACE Lvl V (55mm Heavy)", targetSpec: { mode: "plate", rhaMM: 55 } }
  );

  if (appState.showCustomRhaRow || getActiveGoalId() === "custom") {
    const cmm = Math.max(1, Math.round(parseFloat(document.getElementById("rwCustomRhaMM").value) || 28));
    rows.push({ id: "custom", label: `Custom Plate (${cmm}mm)`, targetSpec: { mode: "plate", rhaMM: cmm } });
  }
  return rows;
}

function renderTunerPenetrationMatrix() {
  const container = document.getElementById("rwPenMatrixContainer");
  if (!container || !appState.currentRound) return;

  const criterion = getActiveCriterion();
  const goalId = getActiveGoalId();
  const curRange = Math.max(0, Number(appState.rangeMeters) || 0);
  const markerPct = Math.max(0, Math.min(99.7, (curRange / MATRIX_MAX_RANGE) * 100));
  const opts = getSimOpts();

  const legendEl = document.getElementById("rwMatrixRangeLegend");
  if (legendEl) {
    legendEl.innerHTML = `&#9474; Test: ${Math.round(curRange)}m`;
  }

  const rowsSpec = getPenMatrixRowsSpec();
  const origRound = appState.originalRound || appState.currentRound;
  const origLoadout = appState.originalArmorLoadout.uniform ? appState.originalArmorLoadout : appState.armorLoadout;

  const focusedInp = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("pen-row-dist-inp")
    ? document.activeElement.getAttribute("data-row-id")
    : null;
  const focusedVal = focusedInp ? document.activeElement.value : null;

  container.innerHTML = rowsSpec.map(row => {
    const maxDist = computeMaxCriterionRange(appState.currentRound, row.targetSpec, criterion, opts);
    const origSpec = row.id === "active"
      ? { mode: "loadout", loadout: origLoadout, hitpoint: appState.selectedHitpoint }
      : row.targetSpec;
    const origDist = computeMaxCriterionRange(origRound, origSpec, criterion, opts);

    const pct = Math.max(0, Math.min(100, (maxDist / MATRIX_MAX_RANGE) * 100));
    const origPct = Math.max(0, Math.min(100, (origDist / MATRIX_MAX_RANGE) * 100));
    const delta = maxDist - origDist;
    const deltaStr = Math.abs(delta) >= 2
      ? `<span class="pen-row-delta" style="color:${delta > 0 ? "#4ade80" : "#f87171"};">${delta > 0 ? "+" : ""}${delta}m</span>`
      : `<span class="pen-row-delta" style="color:var(--text-muted);">&mdash;</span>`;

    const isTargetCls = row.id === goalId ? "active-target" : "";
    const eqCls = row.isEquipped ? "equipped-row" : "";

    let barColor = "#22c55e";
    if (maxDist <= 0) {
      barColor = "#38bdf8";
    } else if (maxDist < curRange) {
      barColor = "#f59e0b";
    }

    const inpVal = (focusedInp === row.id && focusedVal !== null) ? focusedVal : maxDist;

    return `<div class="pen-matrix-row ${isTargetCls} ${eqCls}" data-row-id="${row.id}">
      <span style="cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" class="pen-row-label" data-row-id="${row.id}" title="Click to lock ${row.label} when adjusting Flesh Lethality">${row.label}</span>
      <div class="pen-bar-track" data-row-id="${row.id}" title="Drag left/right to set penetration cutoff range for ${row.label}">
        <div class="pen-bar-fill" style="width:${pct.toFixed(1)}%;background:${barColor};"></div>
        <div class="pen-bar-orig-tick" style="left:${origPct.toFixed(1)}%;" title="Original Preset Cutoff: ${origDist}m"></div>
        <div class="pen-bar-handle" style="left:${pct.toFixed(1)}%;"></div>
        <div class="pen-bar-marker" style="left:${markerPct.toFixed(1)}%;"></div>
      </div>
      <div class="pen-row-dist-cell">
        <div class="pen-row-input-wrap">
          <input type="number" class="pen-row-dist-inp" data-row-id="${row.id}" value="${inpVal}" min="0" max="2000" step="5" title="Type desired penetration cutoff distance (m) for ${row.label}" />
          <span>m</span>
        </div>
        ${deltaStr}
      </div>
    </div>`;
  }).join("");

  if (focusedInp) {
    const restored = container.querySelector(`.pen-row-dist-inp[data-row-id="${focusedInp}"]`);
    if (restored) {
      restored.focus();
      if (restored.setSelectionRange) {
        const len = String(restored.value).length;
        try { restored.setSelectionRange(len, len); } catch (_) {}
      }
    }
  }
}

function renderRoundDiffPills() {
  const container = document.getElementById("rwDiffPills");
  const r = appState.currentRound;
  const orig = appState.originalRound || r;
  if (!container || !r) return;

  const rBc = (r.ACE_ballisticCoefficients && r.ACE_ballisticCoefficients[0]) || 0.3;
  const oBc = (orig.ACE_ballisticCoefficients && orig.ACE_ballisticCoefficients[0]) || 0.3;

  const diffs = [
    { label: "hit", oldVal: Number(orig.hit || 0).toFixed(2), newVal: Number(r.hit || 0).toFixed(2), changed: Math.abs((orig.hit || 0) - (r.hit || 0)) >= 0.02 },
    { label: "caliber", oldVal: Number(orig.caliber || 0).toFixed(3), newVal: Number(r.caliber || 0).toFixed(3), changed: Math.abs((orig.caliber || 0) - (r.caliber || 0)) >= 0.002 },
    { label: "initSpeed", oldVal: `${Math.round(orig.initSpeed || 0)}`, newVal: `${Math.round(r.initSpeed || 0)}m/s`, changed: Math.abs((orig.initSpeed || 0) - (r.initSpeed || 0)) >= 1 },
    { label: "airFriction", oldVal: Number(orig.airFriction || 0).toFixed(5), newVal: Number(r.airFriction || 0).toFixed(5), changed: Math.abs((orig.airFriction || 0) - (r.airFriction || 0)) >= 0.00002 },
    { label: "mass", oldVal: `${Number(orig.ACE_bulletMass || 0).toFixed(2)}`, newVal: `${Number(r.ACE_bulletMass || 0).toFixed(2)}g`, changed: Math.abs((orig.ACE_bulletMass || 0) - (r.ACE_bulletMass || 0)) >= 0.02 },
    { label: "BC", oldVal: Number(oBc).toFixed(3), newVal: Number(rBc).toFixed(3), changed: Math.abs(oBc - rBc) >= 0.003 }
  ];

  container.innerHTML = diffs.map(d => {
    const cls = d.changed ? "diff-pill changed" : "diff-pill";
    const body = d.changed ? `${d.oldVal}&rarr;<strong>${d.newVal}</strong>` : `<strong>${d.newVal}</strong>`;
    return `<span class="${cls}">${d.label}: ${body}</span>`;
  }).join("");
}

function renderVestCoverageAndCaveats(ev) {
  const covStrip = document.getElementById("vestCovStrip");
  const vest = appState.armorLoadout.vest;
  if (covStrip) {
    if (!vest || !vest.protection) {
      covStrip.innerHTML = `<span class="cov-chip">No Vest Equipped (0mm Torso)</span>`;
    } else {
      const chips = [];
      for (const hz of HITZONES) {
        const p = vest.protection[hz.id];
        if (p && Number(p.armor) > 0) {
          const aceArm = calcAceItemArmor(Number(p.armor), p.passThrough, "vest");
          const netA = (2.0 * (hz.id === "HitPelvis" ? 6 : 1)) + aceArm - 2.0;
          const step = hz.acePart === "body" ? 4 : 2;
          const lvl = netA > step ? Math.max(1, Math.min(5, Math.round((netA - step * 2) / step) + 1)) : 0;
          const activeCls = hz.id === appState.selectedHitpoint ? "active" : "";
          chips.push(`<span class="cov-chip ${activeCls}" data-hp="${hz.id}" title="Click to inspect ${hz.id} (raw armor=${p.armor}, passThrough=${p.passThrough})">${hz.id.replace("Hit", "")}: L${lvl} (${p.armor})</span>`);
        }
      }
      if (vest.protection["HitArms"] && Number(vest.protection["HitArms"].armor) > 0) {
        chips.push(`<span class="cov-chip" data-hp="HitLeftArm" style="border-style:dashed;color:#fdba74;" title="Vanilla HitArms=${vest.protection["HitArms"].armor} (Ignored by ACE3 on Left/Right Arm!)">HitArms: ${vest.protection["HitArms"].armor} (Van-Only)</span>`);
      }
      covStrip.innerHTML = chips.length > 0 ? chips.join("") : `<span class="cov-chip">Load-Bearing Rig Only (0 Ballistic Armor)</span>`;
      covStrip.querySelectorAll(".cov-chip[data-hp]").forEach(c => {
        c.addEventListener("click", () => {
          appState.selectedHitpoint = c.getAttribute("data-hp");
          syncArmorInputsFromState();
          updateAllViews();
        });
      });
    }
  }

  // Caveat banner for ACE3 armor quirks (#9063 over-cap, HitArms non-inheritance, HitPelvis base armor)
  const banner = document.getElementById("armorCaveatBanner");
  if (banner && ev) {
    const msgs = [];
    const ai = ev.armorInfo;
    if (ai.vestOverCapped || ai.helmOverCapped) {
      const rawA = ai.vestOverCapped ? ai.vestArmorRaw : ai.helmArmorRaw;
      const aceA = ai.vestOverCapped ? ai.vestArmorAce : ai.helmArmorAce;
      const speedScale = (ai.aceTotalArmor / ai.vanillaTotalArmor).toFixed(2);
      msgs.push(`<strong>ACE3 #9063 Over-Cap Active:</strong> Raw gear armor (<code>${rawA}</code>) exceeds ACE cap, compressing via <code>log10</code> to <code>${aceA.toFixed(2)}</code> and scaling ACE internal impactSpeed by <code>${speedScale}×</code> (${ev.acePenDepth.toFixed(1)}mm eff vs ${ev.rhaPenMM.toFixed(1)}mm raw RHAe)!`);
    }
    if (ai.legacyHitArmsArmor > 0) {
      msgs.push(`<strong>ACE3 HitArms Quirk:</strong> Vest defines <code>HitArms=${ai.legacyHitArmsArmor}</code>, but ACE 3.21.2 <code>fnc_getItemArmor</code> checks exact <code>${appState.selectedHitpoint}</code> — arms receive <strong>0 vest armor</strong> in ACE3.`);
    }
    if (appState.selectedHitpoint === "HitPelvis" && ai.vestArmorRaw === 0 && ai.uniformArmor >= 10) {
      msgs.push(`<strong>Pelvis Base Armor:</strong> Arma 3 units default to <code>HitPelvis.armor = 6</code> (<code>uniformArmor = ${ai.uniformArmor}</code>), which ACE3 maps to <strong>Level II (15mm RHAe)</strong> even without a vest!`);
    }
    if (msgs.length > 0) {
      banner.style.display = "block";
      banner.innerHTML = msgs.join("<br/>");
    } else {
      banner.style.display = "none";
    }
  }

  // Armor modified tag & live summary
  const modTag = document.getElementById("armorModifiedTag");
  if (modTag) {
    const mod = isArmorModified();
    modTag.textContent = mod ? "Custom Tuned" : "Scraped Loadout";
    modTag.style.color = mod ? "#fb923c" : "var(--accent)";
  }
  const isHead = ["HitHead", "HitFace", "HitNeck"].includes(appState.selectedHitpoint);
  const titleEl = document.getElementById("armorEditorTitle");
  if (titleEl) {
    titleEl.textContent = `${isHead ? "Helmet" : "Vest"} Protection (${appState.selectedHitpoint.replace("Hit", "")})`;
  }
  if (ev) {
    document.querySelectorAll("#armorArchetypeStrip .arch-btn").forEach(b => {
      b.classList.toggle("active", parseInt(b.getAttribute("data-arch"), 10) === ev.aceArmorLevel);
    });
  }
  const liveSum = document.getElementById("armorEditorLiveSummary");
  if (liveSum && ev) {
    const tierTxt = ev.aceArmorThicknessMM > 0
      ? `ACE Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm RHAe · Van ${ev.armorInfo.vanillaTotalArmor.toFixed(1)})`
      : `Unarmored (0mm Plate · Van ${ev.armorInfo.vanillaTotalArmor.toFixed(1)})`;
    liveSum.innerHTML = `<span>Active: ${ev.hitzoneLabel}</span><strong style="color:var(--accent-hi);">${tierTxt}</strong>`;
  }
}

function renderHitzoneButtons() {
  const container = document.getElementById("hitzoneGrid");
  if (!container || !appState.currentRound) return;
  const opts = getSimOpts();

  container.innerHTML = HITZONES.map(hz => {
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, hz.id, appState.rangeMeters, opts);
    const active = hz.id === appState.selectedHitpoint ? "active" : "";
    const tierShort = ev.aceArmorLevel > 0 ? `L${ev.aceArmorLevel}·${ev.aceArmorThicknessMM}mm` : "0mm";
    const dotColor = ev.aceArmorLevel === 0
      ? "#f97316"
      : (ev.penetratedPlate ? "#ef4444" : "#38bdf8");
    return `<button type="button" class="hz-btn ${active}" data-hp="${hz.id}">
      <span class="hz-status-dot" style="background:${dotColor};"></span>
      <span>${hz.id.replace("Hit", "")}</span>
      <small>${tierShort}</small>
    </button>`;
  }).join("");

  container.querySelectorAll(".hz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      appState.selectedHitpoint = btn.getAttribute("data-hp");
      syncArmorInputsFromState();
      updateAllViews();
    });
  });
}

function renderAllHitzonesComparisonTable() {
  const tbody = document.getElementById("allHitzonesTableBody");
  if (!tbody || !appState.currentRound) return;
  const opts = getSimOpts();
  const criterion = getActiveCriterion();

  tbody.innerHTML = HITZONES.map(hz => {
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, hz.id, appState.rangeMeters, opts);
    const maxPen = ev.aceArmorThicknessMM > 0
      ? `${computeMaxCriterionRange(appState.currentRound, { mode: "loadout", loadout: appState.armorLoadout, hitpoint: hz.id }, criterion, opts)}m`
      : "—";

    const isSelected = hz.id === appState.selectedHitpoint ? "selected-row" : "";
    const lvlBadge = ev.aceArmorLevel > 0
      ? `<span class="badge badge-amber">L${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm)</span>`
      : `<span class="badge badge-blue">Unarmored</span>`;

    const penBadge = ev.aceArmorThicknessMM === 0
      ? `<span class="badge badge-amber">FLESH</span>`
      : (ev.penetratedPlate ? `<span class="badge badge-red">PENETRATED</span>` : `<span class="badge badge-green">STOPPED</span>`);

    const primaryWound = ev.woundBreakdowns.length > 0
      ? ev.woundBreakdowns.slice().sort((a, b) => b.probability - a.probability)[0].displayName
      : "None";

    const stkStr = ev.shotsToGuaranteedTraumaKill < 999 ? `${ev.shotsToGuaranteedTraumaKill} Kill` : "Limb";

    return `<tr class="${isSelected}" style="cursor:pointer;" onclick="window.selectHitpointRow('${hz.id}')">
      <td><strong>${hz.id}</strong> <span style="color:var(--text-muted)">(${hz.acePart})</span></td>
      <td>${ev.armorInfo.vanillaTotalArmor.toFixed(1)} / ${ev.armorInfo.aceTotalArmor.toFixed(1)}</td>
      <td>${lvlBadge}</td>
      <td style="color:var(--accent-hi);">${maxPen}</td>
      <td>${ev.vanillaHitpointDamage.toFixed(2)} (${ev.vanillaStk}x)</td>
      <td><strong>${ev.dmgPerWound.toFixed(3)}</strong></td>
      <td>${penBadge}</td>
      <td style="text-align:left;">${ev.nWoundsInt}x ${primaryWound}</td>
      <td>${ev.expectedBleedRate.toFixed(3)}</td>
      <td>${(ev.koProb * 100).toFixed(0)}% KO · ${stkStr}</td>
    </tr>`;
  }).join("");
}

window.selectHitpointRow = function(hp) {
  appState.selectedHitpoint = hp;
  syncArmorInputsFromState();
  updateAllViews();
};

function renderMultiVestBenchmarkTable() {
  const tbody = document.getElementById("vestBenchmarkTableBody");
  if (!tbody || !appState.currentRound) return;
  const opts = getSimOpts();
  const baseUni = appState.armorLoadout.uniform || ARMA_DATABASE.uniforms[0];

  const benchTargets = [];

  // 1. Equipped Loadout (Chest)
  benchTargets.push({
    name: `Equipped: ${(appState.armorLoadout.vest && (appState.armorLoadout.vest.displayName || appState.armorLoadout.vest.className)) || "Unarmored"}`,
    tag: "EQUIPPED",
    loadout: appState.armorLoadout,
    overrideMM: null
  });

  // 2. Pinned Vests
  appState.pinnedVests.forEach((pv, idx) => {
    benchTargets.push({
      name: `Pinned #${idx + 1}: ${pv.label}`,
      tag: "PINNED",
      loadout: pv.loadout,
      overrideMM: null
    });
  });

  // 3. Standard ACE3 Levels I–V
  [
    { lvl: 1, mm: 6, name: "ACE Level I Standard (IIA Soft)" },
    { lvl: 2, mm: 15, name: "ACE Level II Standard (IIIA Soft)" },
    { lvl: 3, mm: 21, name: "ACE Level III Standard (NIJ III)" },
    { lvl: 4, mm: 40, name: "ACE Level IV Standard (ESAPI)" },
    { lvl: 5, mm: 55, name: "ACE Level V Standard (Heavy)" }
  ].forEach(s => {
    benchTargets.push({ name: s.name, tag: `STD L${s.lvl}`, loadout: { uniform: baseUni, vest: null, helmet: null }, overrideMM: s.mm });
  });

  // 4. Notable Scraped Vests from Database (including #9063 GL rig & modded vests)
  const wantedClasses = [
    "V_PlateCarrier1_rgr",
    "V_PlateCarrier2_rgr",
    "V_PlateCarrierSpec_rgr",
    "V_PlateCarrierGL_rgr",
    "AddGis_V_AssaultCarrier_Lite_rgr_F",
    "AddGis_V_RytsarCarrier_GL_ruflora_F"
  ];
  const addedClasses = new Set();
  for (const cls of wantedClasses) {
    const found = ARMA_DATABASE.vests.find(v => v.className === cls);
    if (found) {
      addedClasses.add(cls);
      benchTargets.push({
        name: `${found.displayName || found.className} [${found.mod}]`,
        tag: found.mod,
        loadout: { uniform: baseUni, vest: found, helmet: null },
        overrideMM: null,
        vestClass: found.className
      });
    }
  }
  // Also grab up to 3 additional distinct-mod armored vests from DB
  for (const v of ARMA_DATABASE.vests) {
    if (addedClasses.size >= 9) break;
    const chArm = v.protection && v.protection.HitChest ? Number(v.protection.HitChest.armor) : 0;
    if (chArm > 0 && !addedClasses.has(v.className) && !Array.from(addedClasses).some(c => v.mod === (ARMA_DATABASE.vests.find(x => x.className === c) || {}).mod)) {
      addedClasses.add(v.className);
      benchTargets.push({
        name: `${v.displayName || v.className} [${v.mod}]`,
        tag: v.mod,
        loadout: { uniform: baseUni, vest: v, helmet: null },
        overrideMM: null,
        vestClass: v.className
      });
    }
  }

  tbody.innerHTML = benchTargets.map(bt => {
    const evOpts = bt.overrideMM !== null ? { ...opts, overridePlateRhaMM: bt.overrideMM } : opts;
    const ev = evaluateShot(appState.currentRound, bt.loadout, "HitChest", appState.rangeMeters, evOpts);
    const spec = bt.overrideMM !== null
      ? { mode: "plate", rhaMM: bt.overrideMM }
      : { mode: "loadout", loadout: bt.loadout, hitpoint: "HitChest" };

    const maxBleed = ev.aceArmorThicknessMM > 0 ? `${computeMaxCriterionRange(appState.currentRound, spec, "ace_bleed", opts)}m` : "—";
    const maxKoDist = computeMaxCriterionRange(appState.currentRound, spec, "ace_ko", opts);
    const maxKoStr = maxKoDist > 0 ? `${maxKoDist}m` : "—";

    const rawArmStr = bt.overrideMM !== null
      ? `Std / ${bt.overrideMM}mm`
      : `${ev.armorInfo.vestArmorRaw.toFixed(0)} / ${ev.armorInfo.vestArmorAce.toFixed(1)}${ev.armorInfo.vestOverCapped ? " (#9063)" : ""}`;

    const tierBadge = ev.aceArmorThicknessMM > 0
      ? `<span class="badge badge-amber">Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm)</span>`
      : `<span class="badge badge-blue">Unarmored</span>`;

    const statusBadge = ev.aceArmorThicknessMM === 0
      ? `<span class="badge badge-amber">FLESH</span>`
      : (ev.penetratedPlate ? `<span class="badge badge-red">PENETRATES</span>` : `<span class="badge badge-green">STOPPED</span>`);

    const clickAttr = bt.vestClass ? `style="cursor:pointer;" title="Click to equip ${bt.vestClass}" onclick="window.equipBenchmarkVest('${bt.vestClass}')"` : "";

    return `<tr ${clickAttr} class="${bt.tag === "EQUIPPED" ? "selected-row" : ""}">
      <td><strong>${bt.name}</strong></td>
      <td>${rawArmStr}</td>
      <td>${tierBadge}</td>
      <td style="color:var(--accent-hi);font-weight:700;">${maxBleed}</td>
      <td>${maxKoStr}</td>
      <td><strong>${ev.dmgPerWound.toFixed(3)}</strong></td>
      <td>${statusBadge}</td>
      <td>${ev.shotsToKO < 99 ? `${ev.shotsToKO} (${(ev.koProb * 100).toFixed(0)}%)` : `10% pain`}</td>
      <td>${ev.shotsToGuaranteedTraumaKill} (${(ev.totalFatalProb * 100).toFixed(0)}%)</td>
    </tr>`;
  }).join("");
}

window.equipBenchmarkVest = function(vestClass) {
  const vestSel = document.getElementById("vestSelect");
  document.getElementById("vestModFilter").value = "ALL";
  document.getElementById("vestSearch").value = "";
  filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
  if (vestSel) vestSel.value = vestClass;
  selectGearByClass("vest", vestClass);
};

window.equipLineupRound = function(roundClass) {
  document.getElementById("roundModFilter").value = "ALL";
  document.getElementById("roundSearch").value = "";
  filterAndPopulateRoundSelect();
  const roundSel = document.getElementById("roundSelect");
  if (roundSel) roundSel.value = roundClass;
  selectRoundByClass(roundClass);
};

function syncZoneSwitcherUI() {
  const hp = appState.selectedHitpoint;
  const isHead = ["HitHead", "HitFace", "HitNeck"].includes(hp);
  const qTorso = document.getElementById("zoneQuickTorso");
  const qHead = document.getElementById("zoneQuickHead");
  const selAll = document.getElementById("zoneSelectAll");
  if (qTorso) qTorso.classList.toggle("active", TORSO_HITPOINTS.includes(hp));
  if (qHead) qHead.classList.toggle("active", isHead);
  if (selAll && selAll.value !== hp) selAll.value = hp;

  const vestPick = document.getElementById("primaryVestPickerWrap");
  const helmPick = document.getElementById("primaryHelmetPickerWrap");
  const vestRow = document.getElementById("vestArmorFieldsRow");
  const helmRow = document.getElementById("helmArmorFieldsRow");
  const wholeWrap = document.getElementById("wholeVestCheckWrap");

  if (vestPick) vestPick.style.display = isHead ? "none" : "flex";
  if (helmPick) helmPick.style.display = isHead ? "flex" : "none";
  if (vestRow) vestRow.style.display = isHead ? "none" : "grid";
  if (helmRow) helmRow.style.display = isHead ? "grid" : "none";
  if (wholeWrap) wholeWrap.style.display = isHead ? "none" : "inline-flex";
}

function renderCaliberLineupTable() {
  const tbody = document.getElementById("caliberLineupTableBody");
  if (!tbody || !appState.currentRound) return;
  const opts = getSimOpts();
  const targetHp = TORSO_HITPOINTS.includes(appState.selectedHitpoint) ? appState.selectedHitpoint : "HitChest";
  const spec = { mode: "loadout", loadout: appState.armorLoadout, hitpoint: targetHp };

  const lineup = [];

  // 1. Active Round
  lineup.push({
    label: `Active: ${appState.currentRound.className}${isRoundModified() ? " (Tuned)" : ""}`,
    round: appState.currentRound,
    isActive: true,
    roundClass: null
  });

  // 2. Original Scraped Preset (if modified)
  if (isRoundModified() && appState.originalRound) {
    lineup.push({
      label: `Original Preset: ${appState.originalRound.className}`,
      round: appState.originalRound,
      isActive: false,
      roundClass: null
    });
  }

  // 3. Other Session-Modified Rounds (click any row to switch back & continue tuning)
  Object.entries(appState.modifiedRounds).forEach(([origCls, pair]) => {
    if (appState.originalRound && origCls === appState.originalRound.className) return;
    lineup.push({
      label: `Session Tuned: ${pair.current.className}`,
      round: pair.current,
      isActive: false,
      roundClass: origCls
    });
  });

  // 4. Pinned Rounds
  appState.pinnedRounds.forEach((pr, idx) => {
    lineup.push({
      label: `Pinned #${idx + 1}: ${pr.label}`,
      round: pr.round,
      isActive: false,
      roundClass: null
    });
  });

  // 4. Representative Scraped Caliber Lineup (ACE3 + Project M + Vanilla)
  const candidateSpecs = [
    ["ACE_9x19_Ball", "B_9x21_Ball"],
    ["B_570x28_Ball", "B_45ACP_Ball"],
    ["B_545x39_Ball_F", "ACE_580x42_DBP88_Ball"],
    ["MCC_556_M855", "B_556x45_Ball"],
    ["MCC_556_M855A1", "ACE_556x45_Ball_Mk318"],
    ["MCC_556_M855A1_PLUS", "MCC_556_75GRHORN_HV"],
    ["ACE_556x45_Ball_M995_AP", "MCC_556_M995"],
    ["B_762x39_Ball_F"],
    ["B_762x51_Ball", "ACE_762x51_Ball_M118LR"],
    ["ACE_762x51_Ball_M993_AP", "B_65x39_Caseless"],
    ["ACE_338_Ball_API526", "B_338_Ball"],
    ["ACE_127x99_API", "B_127x99_Ball"]
  ];

  const seenClasses = new Set([appState.currentRound.className]);
  for (const group of candidateSpecs) {
    let picked = null;
    for (const cls of group) {
      const found = ARMA_DATABASE.rounds.find(r => r.className === cls);
      if (found && !seenClasses.has(found.className)) {
        picked = found;
        break;
      }
    }
    if (picked) {
      seenClasses.add(picked.className);
      const cleanMag = cleanDisplayString(picked.magName);
      const magHint = cleanMag ? ` — ${cleanMag}` : "";
      lineup.push({
        label: `${picked.className}${magHint} [${picked.mod}]`,
        round: picked,
        isActive: false,
        roundClass: picked.className
      });
    }
  }

  tbody.innerHTML = lineup.map(item => {
    const rnd = item.round;
    const ev = evaluateShot(rnd, appState.armorLoadout, targetHp, appState.rangeMeters, opts);
    const maxBleed = ev.aceArmorThicknessMM > 0 ? `${computeMaxCriterionRange(rnd, spec, "ace_bleed", opts)}m` : "—";
    const maxKoDist = computeMaxCriterionRange(rnd, spec, "ace_ko", opts);
    const maxKoStr = maxKoDist > 0 ? `${maxKoDist}m` : "—";
    const v0 = Math.round(Number(rnd.initSpeed) || Number(rnd.typicalSpeed) || 0);
    const rha0 = (v0 * (Number(rnd.caliber) || 1) * ACE_CONST.ARMOR_PENETRABILITY).toFixed(1);

    const statusBadge = ev.aceArmorThicknessMM === 0
      ? `<span class="badge badge-amber">FLESH</span>`
      : (ev.penetratedPlate ? `<span class="badge badge-red">PENETRATES</span>` : `<span class="badge badge-green">STOPPED</span>`);

    const clickAttr = item.roundClass
      ? `style="cursor:pointer;" title="Click to load ${item.roundClass} into editor" onclick="window.equipLineupRound('${item.roundClass}')"`
      : "";

    return `<tr ${clickAttr} class="${item.isActive ? "selected-row" : ""}">
      <td><strong>${item.label}</strong></td>
      <td>${Number(rnd.hit || 0).toFixed(1)} / ${Number(rnd.caliber || 0).toFixed(2)}</td>
      <td>${v0}m/s (${rha0}mm)</td>
      <td style="color:var(--accent-hi);font-weight:700;">${maxBleed}</td>
      <td>${maxKoStr}</td>
      <td><strong>${ev.dmgPerWound.toFixed(3)}</strong></td>
      <td>${statusBadge}</td>
      <td>${ev.shotsToKO < 99 ? `${ev.shotsToKO} (${(ev.koProb * 100).toFixed(0)}%)` : `10% pain`}</td>
      <td>${ev.shotsToGuaranteedTraumaKill} (${(ev.totalFatalProb * 100).toFixed(0)}%)</td>
    </tr>`;
  }).join("");
}

// ============================================================================
// Config Exporter, Master View Updater & Interactive Event Listeners
// ============================================================================
function formatCfgSection(sectionName, rawEntries) {
  if (!rawEntries || rawEntries.length === 0) return "";
  const entries = rawEntries.slice();
  const definedMap = new Map();
  for (const e of entries) {
    definedMap.set(e.className.toLowerCase(), e);
  }

  // Synthesize ItemInfo stub parent classes for external CfgWeapons bases when children inherit ItemInfo: ItemInfo
  for (const e of rawEntries) {
    if ((e.iiParent || "").toLowerCase() === "iteminfo" && e.parent) {
      const pk = e.parent.toLowerCase();
      if (!definedMap.has(pk)) {
        const pBase = e.parentBase || "";
        const stubEntry = {
          className: e.parent,
          parent: pBase,
          code: `    class ${e.parent}${pBase ? `: ${pBase}` : ""} {\n        class ItemInfo;\n    };`
        };
        definedMap.set(pk, stubEntry);
        entries.push(stubEntry);
      }
    }
  }

  // Topological sort so in-block parent definitions always precede children
  const ordered = [];
  const visited = new Set();
  const visit = e => {
    const k = e.className.toLowerCase();
    if (visited.has(k)) return;
    visited.add(k);
    const pk = (e.parent || "").toLowerCase();
    if (pk && pk !== k && definedMap.has(pk)) {
      visit(definedMap.get(pk));
    }
    ordered.push(e);
  };
  for (const e of entries) visit(e);

  // Only forward-declare external base classes & external ItemInfo bases (VestItem / HeadgearItem)
  const extParents = [];
  const seenExt = new Set();
  const addForwardDecl = clsName => {
    if (!clsName) return;
    const ck = clsName.toLowerCase();
    if (!definedMap.has(ck) && !seenExt.has(ck)) {
      seenExt.add(ck);
      extParents.push(`    class ${clsName};`);
    }
  };
  for (const e of ordered) {
    addForwardDecl(e.parent);
    if (e.iiParent && e.iiParent.toLowerCase() !== "iteminfo") {
      addForwardDecl(e.iiParent);
    }
  }
  const declBlock = extParents.length > 0 ? `${extParents.join("\n")}\n\n` : "";
  return `class ${sectionName} {\n${declBlock}${ordered.map(e => e.code).join("\n\n")}\n};`;
}

function buildExportConfigText() {
  if (!appState.currentRound) return "";
  syncActiveEditsToSession();

  const exportBatch = !document.getElementById("chkExportAllSession") || document.getElementById("chkExportAllSession").checked;
  const exportArmor = document.getElementById("chkExportArmorPatch") && document.getElementById("chkExportArmorPatch").checked;

  // Collect rounds to export (all modified session rounds when batch is enabled, always falling back to active round)
  let roundPairs = [];
  if (exportBatch && Object.keys(appState.modifiedRounds).length > 0) {
    roundPairs = Object.values(appState.modifiedRounds);
  } else {
    roundPairs = [{ current: appState.currentRound, original: appState.originalRound || appState.currentRound }];
  }

  const ammoEntries = [];
  const seenMagClasses = new Set();
  const magEntries = [];

  for (const { current: r, original: origRef } of roundPairs) {
    const orig = origRef || r;
    const parentCls = r.parent || "BulletBase";

    const bcArr = (r.ACE_ballisticCoefficients || [0.3]).map(x => Number(x).toFixed(3)).join(", ");
    const aceMvLines = [];
    if (Array.isArray(r.ACE_barrelLengths) && r.ACE_barrelLengths.length > 0 && Array.isArray(r.ACE_muzzleVelocities) && r.ACE_muzzleVelocities.length > 0) {
      aceMvLines.push(`        ACE_barrelLengths[] = {${r.ACE_barrelLengths.map(x => Number(x).toFixed(1)).join(", ")}};`);
      aceMvLines.push(`        ACE_muzzleVelocities[] = {${r.ACE_muzzleVelocities.map(x => Number(x).toFixed(1)).join(", ")}};`);
    }

    ammoEntries.push({
      className: r.className,
      parent: parentCls,
      code: `    class ${r.className}: ${parentCls} {
        hit = ${Number(r.hit).toFixed(3)};               // Original: ${Number(orig.hit || r.hit).toFixed(3)}
        indirectHit = ${Number(r.indirectHit || 0).toFixed(2)};
        indirectHitRange = ${Number(r.indirectHitRange || 0).toFixed(2)};
        explosive = ${Number(r.explosive || 0).toFixed(2)};
        caliber = ${Number(r.caliber).toFixed(4)};           // Original: ${Number(orig.caliber || r.caliber).toFixed(4)} (${(r.caliber * 0.015 * r.initSpeed).toFixed(1)} mm RHAe @ 0m)
        typicalSpeed = ${Number(r.typicalSpeed).toFixed(1)};     // Original: ${Number(orig.typicalSpeed || r.typicalSpeed).toFixed(1)} m/s
        airFriction = ${Number(r.airFriction).toFixed(7)};   // Original: ${Number(orig.airFriction || r.airFriction).toFixed(7)}
        deflecting = ${Number(r.deflecting !== undefined ? r.deflecting : 15).toFixed(1)};
        ACE_damageType = "${r.ACE_damageType || "bullet"}";
        ACE_caliber = ${Number(r.ACE_caliber || 5.56).toFixed(2)};
        ACE_bulletMass = ${Number(r.ACE_bulletMass || 4.0).toFixed(3)};
        ACE_dragModel = ${Number(r.ACE_dragModel || 1)};
        ACE_ballisticCoefficients[] = {${bcArr}};${aceMvLines.length ? "\n" + aceMvLines.join("\n") : ""}
    };`
    });

    // Emit real scraped CfgMagazines classes that chamber this round
    const magsList = Array.isArray(r.mags) && r.mags.length > 0
      ? r.mags
      : (r.magClass ? [{ c: r.magClass, p: r.magParent || "CA_Magazine" }] : []);

    for (const m of magsList) {
      if (!m.c || seenMagClasses.has(m.c.toLowerCase())) continue;
      seenMagClasses.add(m.c.toLowerCase());
      const mp = m.p || "CA_Magazine";
      magEntries.push({
        className: m.c,
        parent: mp,
        code: `    class ${m.c}: ${mp} {
        ammo = "${r.className}";
        initSpeed = ${Number(r.initSpeed).toFixed(1)};       // Original: ${Number(orig.initSpeed || r.initSpeed).toFixed(1)} m/s
    };`
      });
    }
  }

  let cfgText = `// Generated by AmmoMaster — Validated Arma 3 & ACE 3.21.2 Balancing Workbench\n`;
  cfgText += formatCfgSection("CfgAmmo", ammoEntries);

  if (magEntries.length > 0) {
    cfgText += `\n\n${formatCfgSection("CfgMagazines", magEntries)}`;
  }

  if (exportArmor) {
    const vestPairs = exportBatch
      ? Object.values(appState.modifiedGear.vest)
      : (appState.armorLoadout.vest && JSON.stringify(appState.armorLoadout.vest) !== JSON.stringify(appState.originalArmorLoadout.vest)
          ? [{ current: appState.armorLoadout.vest, original: appState.originalArmorLoadout.vest }]
          : []);
    const helmPairs = exportBatch
      ? Object.values(appState.modifiedGear.helmet)
      : (appState.armorLoadout.helmet && JSON.stringify(appState.armorLoadout.helmet) !== JSON.stringify(appState.originalArmorLoadout.helmet)
          ? [{ current: appState.armorLoadout.helmet, original: appState.originalArmorLoadout.helmet }]
          : []);

    const weapEntries = [];

    for (const { current: vest } of vestPairs) {
      if (!vest || !vest.protection) continue;
      const vParent = vest.parent || "Vest_Camo_Base";
      const vParentBase = vest.parentBase !== undefined ? vest.parentBase : "ItemCore";
      const vIiParent = vest.iiParent || "ItemInfo";
      const hpEntries = Object.entries(vest.protection)
        .filter(([, v]) => v && (Number(v.armor) > 0 || Number(v.passThrough) < 1))
        .map(([hpName, v]) => `                class ${hpName.replace("Hit", "")} {
                    hitpointName = "${hpName}";
                    armor = ${Number(v.armor || 0)};
                    passThrough = ${Number(v.passThrough !== undefined ? v.passThrough : 0.3).toFixed(2)};
                };`).join("\n");
      weapEntries.push({
        className: vest.className,
        parent: vParent,
        parentBase: vParentBase,
        iiParent: vIiParent,
        code: `    class ${vest.className}: ${vParent} {
        class ItemInfo: ${vIiParent} {
            class HitpointsProtectionInfo {
${hpEntries}
            };
        };
    };`
      });
    }

    for (const { current: helm } of helmPairs) {
      if (!helm || !helm.protection) continue;
      const hParent = helm.parent || "H_HelmetB";
      const hParentBase = helm.parentBase !== undefined ? helm.parentBase : "ItemCore";
      const hIiParent = helm.iiParent || "ItemInfo";
      const hpEntries = Object.entries(helm.protection)
        .filter(([, v]) => v && (Number(v.armor) > 0 || Number(v.passThrough) < 1))
        .map(([hpName, v]) => `                class ${hpName.replace("Hit", "")} {
                    hitpointName = "${hpName}";
                    armor = ${Number(v.armor || 0)};
                    passThrough = ${Number(v.passThrough !== undefined ? v.passThrough : 0.5).toFixed(2)};
                };`).join("\n");
      weapEntries.push({
        className: helm.className,
        parent: hParent,
        parentBase: hParentBase,
        iiParent: hIiParent,
        code: `    class ${helm.className}: ${hParent} {
        class ItemInfo: ${hIiParent} {
            class HitpointsProtectionInfo {
${hpEntries}
            };
        };
    };`
      });
    }

    if (weapEntries.length > 0) {
      cfgText += `\n\n// Custom Tuned Armor Patch\n${formatCfgSection("CfgWeapons", weapEntries)}`;
    }
  }
  return cfgText;
}

function renderConfigExporter() {
  const pre = document.getElementById("configExportPre");
  if (pre) pre.textContent = buildExportConfigText();

  const modRCount = Object.keys(appState.modifiedRounds).length;
  const modGCount = Object.keys(appState.modifiedGear.vest).length + Object.keys(appState.modifiedGear.helmet).length;
  const totalMod = modRCount + modGCount;

  const badge = document.getElementById("sessionExportBadge");
  if (badge) {
    if (totalMod > 0) {
      badge.className = "badge badge-amber";
      badge.textContent = `Session Patch: ${modRCount} Round${modRCount === 1 ? "" : "s"} · ${modGCount} Gear`;
    } else {
      badge.className = "badge badge-blue";
      badge.textContent = "Session: Unmodified (Previewing Active Round)";
    }
  }

  const hdrBtn = document.getElementById("btnHeaderCopyHpp");
  if (hdrBtn && hdrBtn.textContent !== "Copied!") {
    hdrBtn.textContent = totalMod > 0 ? `Copy .hpp (${totalMod} Tuned)` : "Copy .hpp Config";
  }
}

function formatSignedDelta(delta, decimals = 0, unit = "") {
  if (Math.abs(delta) < Math.pow(10, -decimals) * 0.6) return "";
  const sign = delta > 0 ? "+" : "";
  const color = delta > 0 ? "#4ade80" : "#f87171";
  return `<span style="color:${color};">${sign}${delta.toFixed(decimals)}${unit}</span>`;
}

function updateAllViews(skipGoalDistSync = false) {
  if (!appState.currentRound) return;
  syncActiveEditsToSession();
  const opts = getSimOpts();
  const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, opts);
  const origRound = appState.originalRound || appState.currentRound;
  const origLoadout = appState.originalArmorLoadout.uniform ? appState.originalArmorLoadout : appState.armorLoadout;
  const origEv = evaluateShot(origRound, origLoadout, appState.selectedHitpoint, appState.rangeMeters, opts);

  syncAllRoundPanesFromCurrent(skipGoalDistSync);
  renderVestCoverageAndCaveats(ev);

  // Matchup Verdict Banner
  const vBanner = document.getElementById("verdictBanner");
  const vPill = document.getElementById("verdictPill");
  const vHead = document.getElementById("verdictHeadline");
  const vSub = document.getElementById("verdictSub");

  const gearName = ev.bodyPartIndex === 0
    ? ((appState.armorLoadout.helmet && (appState.armorLoadout.helmet.displayName || appState.armorLoadout.helmet.className)) || "No Helmet")
    : ((appState.armorLoadout.vest && (appState.armorLoadout.vest.displayName || appState.armorLoadout.vest.className)) || "No Vest");
  const hpShort = appState.selectedHitpoint.replace("Hit", "");
  const primaryWound = ev.woundBreakdowns.length > 0
    ? ev.woundBreakdowns.slice().sort((a, b) => b.probability - a.probability)[0].displayName
    : "No Wound";

  if (vBanner && vPill && vHead && vSub) {
    vBanner.classList.remove("verdict-pen", "verdict-stop", "verdict-unarm");
    if (ev.aceArmorThicknessMM <= 0) {
      vBanner.classList.add("verdict-unarm");
      vPill.textContent = "UNARMORED HIT";
      vPill.style.background = "rgba(249, 115, 22, 0.22)";
      vPill.style.color = "#fdba74";
    } else if (ev.penetratedPlate) {
      vBanner.classList.add("verdict-pen");
      vPill.textContent = "PENETRATES ARMOR";
      vPill.style.background = "rgba(239, 68, 68, 0.25)";
      vPill.style.color = "#fca5a5";
    } else {
      vBanner.classList.add("verdict-stop");
      vPill.textContent = "STOPPED BY PLATE";
      vPill.style.background = "rgba(56, 189, 248, 0.22)";
      vPill.style.color = "#7dd3fc";
    }

    const tierLabel = ev.aceArmorThicknessMM > 0 ? `Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm)` : "0mm Flesh";
    vHead.textContent = `${appState.currentRound.className} vs ${gearName} [${hpShort} · ${tierLabel}] @ ${Math.round(appState.rangeMeters)}m`;
    vSub.textContent = `Vel: ${ev.effectiveSpeed.toFixed(0)} m/s · Pen: ${ev.acePenDepth.toFixed(1)}mm RHAe · ACE Dmg: ${ev.dmgPerWound.toFixed(3)} (${primaryWound})`;
  }

  const maxPenGear = ev.aceArmorThicknessMM > 0
    ? `${computeMaxCriterionRange(appState.currentRound, { mode: "loadout", loadout: appState.armorLoadout, hitpoint: appState.selectedHitpoint }, getActiveCriterion(), opts)}m`
    : "Unarmored";
  document.getElementById("vmMaxPenGear").textContent = maxPenGear;
  document.getElementById("vmHitsKO").textContent = ev.shotsToKO < 99
    ? `${ev.shotsToKO} hit${ev.shotsToKO > 1 ? "s" : ""} (${(ev.koProb * 100).toFixed(0)}%)`
    : `${(ev.koProb * 100).toFixed(0)}% / hit`;
  document.getElementById("vmHitsKill").textContent = ev.shotsToGuaranteedTraumaKill < 999
    ? `${ev.shotsToGuaranteedTraumaKill} hit${ev.shotsToGuaranteedTraumaKill > 1 ? "s" : ""} (${(ev.totalFatalProb * 100).toFixed(0)}%)`
    : "Bleedout";
  document.getElementById("vmVanillaStk").textContent = `${ev.vanillaStk} hit${ev.vanillaStk > 1 ? "s" : ""} (${ev.vanillaHitpointDamage.toFixed(2)})`;

  // 4 Telemetry KPIs + Deltas vs Original
  document.getElementById("kpiVelocity").textContent = `${ev.effectiveSpeed.toFixed(0)} m/s`;
  document.getElementById("kpiVelocitySub").textContent = `KE: ${ev.kineticEnergyJ.toFixed(0)} J | ToF: ${ev.tof.toFixed(2)}s`;
  document.getElementById("kpiVelDelta").innerHTML = formatSignedDelta(ev.effectiveSpeed - origEv.effectiveSpeed, 0, " m/s");

  document.getElementById("kpiRhaPen").textContent = `${ev.acePenDepth.toFixed(1)} mm`;
  document.getElementById("kpiRhaPenSub").textContent = ev.aceArmorThicknessMM > 0
    ? `vs Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm · ${(ev.penRatio * 100).toFixed(0)}% pen)`
    : `Raw RHAe: ${ev.rhaPenMM.toFixed(1)}mm | Flesh: ${ev.meatPenMM.toFixed(0)}mm`;
  document.getElementById("kpiRhaDelta").innerHTML = formatSignedDelta(ev.acePenDepth - origEv.acePenDepth, 1, "mm");

  document.getElementById("kpiAceDamage").textContent = ev.dmgPerWound.toFixed(3);
  document.getElementById("kpiAceDamage").style.color = ev.penetratedPlate ? "#ef4444" : "#38bdf8";
  document.getElementById("kpiAceDamageSub").textContent = ev.penetratedPlate
    ? `PENETRATES (> 0.35 · ${primaryWound})`
    : `STOPPED (<= 0.35 · Contusion)`;
  document.getElementById("kpiDmgDelta").innerHTML = formatSignedDelta(ev.dmgPerWound - origEv.dmgPerWound, 3, "");

  document.getElementById("kpiLethality").textContent = `${(ev.koProb * 100).toFixed(0)}% / ${(ev.totalFatalProb * 100).toFixed(0)}%`;
  document.getElementById("kpiLethality").style.color = ev.totalFatalProb >= 0.5 ? "#ef4444" : (ev.koProb >= 0.5 ? "#f97316" : "#eab308");
  document.getElementById("kpiLethalitySub").textContent = `1-Hit KO / 1-Hit Fatal (Trauma Mult ${appState.damageThreshold.toFixed(1)})`;
  document.getElementById("kpiFatalDelta").innerHTML = formatSignedDelta((ev.koProb - origEv.koProb) * 100, 0, "% KO");

  // Validated Step-by-Step Math Pipeline Cards
  const v0 = Number(appState.currentRound.initSpeed) || 0;
  const typ = Number(appState.currentRound.typicalSpeed) || v0;
  document.getElementById("fV0").textContent = `${v0.toFixed(1)} / ${typ.toFixed(1)} m/s`;
  document.getElementById("fVImpact").textContent = `${ev.effectiveSpeed.toFixed(1)} m/s (${appState.useAdvBallistics ? `ACE G${appState.currentRound.ACE_dragModel || 1}` : "af exp"})`;
  document.getElementById("fRhaPen").textContent = `${ev.rhaPenMM.toFixed(2)} mm (cal=${Number(appState.currentRound.caliber).toFixed(3)})`;
  document.getElementById("fRawHit").textContent = `${ev.rawDamage.toFixed(3)} (hit=${Number(appState.currentRound.hit).toFixed(2)} × ${(ev.effectiveSpeed / Math.max(1, typ)).toFixed(3)})`;
  document.getElementById("fVanArmor").textContent = `${ev.armorInfo.vanillaTotalArmor.toFixed(2)} (Uni ${ev.armorInfo.uniformArmor.toFixed(1)} + Gear ${(ev.armorInfo.vestArmorRaw + ev.armorInfo.helmArmorRaw).toFixed(1)})`;
  document.getElementById("fVanDmg").textContent = `${ev.vanillaHitpointDamage.toFixed(3)} HP / ${ev.vanillaStructuralDamage.toFixed(3)} Struct (${ev.vanillaStk} STK)`;

  document.getElementById("fAceArmor").textContent = `${ev.armorInfo.aceTotalArmor.toFixed(2)} (netArmor=${ev.netArmor.toFixed(2)})`;
  document.getElementById("fAceLevel").textContent = ev.usedArmorPenHandler
    ? `Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm) · v_ace=${ev.aceImpactSpeed.toFixed(0)}m/s (${ev.acePenDepth.toFixed(1)}mm)`
    : "Bypassed (Unarmored / Non-Bullet)";
  document.getElementById("fAceFinalDmg").textContent = `${ev.aceFinalDamage.toFixed(4)} (E[N]=${ev.nWoundsExpected.toFixed(2)} @ ${ev.dmgPerWound.toFixed(4)})`;
  document.getElementById("fAceWoundProbs").textContent = ev.woundBreakdowns
    .map(w => `${w.displayName}: ${(w.probability * 100).toFixed(0)}%`)
    .join(" | ") || "0 Wounds";
  const mlPerSec = ev.expectedBleedRate * (ACE_CONST.HEALTHY_CARDIAC_OUTPUT_LPS * 1000);
  document.getElementById("fAceBleedPain").textContent = `${ev.expectedBleedRate.toFixed(3)} CO (${mlPerSec.toFixed(1)} mL/s) | Pain ${(ev.expectedPain * 100).toFixed(0)}%`;
  document.getElementById("fAceFatal").textContent = `KO: ${(ev.koProb * 100).toFixed(1)}% | Vital: ${(ev.vitalFatalProb * 100).toFixed(1)}% | Weibull: ${(ev.weibullFatalProb * 100).toFixed(1)}%`;

  // Quick-range active highlight
  document.querySelectorAll(".quick-range-btn").forEach(btn => {
    const br = parseFloat(btn.getAttribute("data-range"));
    btn.classList.toggle("active", Math.abs(br - appState.rangeMeters) < 0.5);
  });

  syncZoneSwitcherUI();
  renderTunerArmorTierCards();
  renderTunerPenetrationMatrix();
  renderRoundDiffPills();
  renderHitzoneButtons();
  renderAllHitzonesComparisonTable();
  renderCaliberLineupTable();
  renderMultiVestBenchmarkTable();
  renderAllCharts();
  renderConfigExporter();

  if (patientState.mode === "preview") {
    syncPreviewPatientFromShot(ev);
  }
  renderAceBodyDummy(ev.bodyPartIndex, appState.damageThreshold);
  updateAceInjuryListDOM(ev.bodyPartIndex, ev, appState.damageThreshold);
}

// ============================================================================
// Selectors, Armor Sync & Interactive Workflows
// ============================================================================
function populateModFilters() {
  const fillModSelect = (id, items, includeModifiedFilter = false) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const mods = Array.from(new Set(items.map(x => x.mod))).sort();
    const modOpt = includeModifiedFilter ? `<option value="__MODIFIED__">★ Session Tuned</option>` : "";
    sel.innerHTML = `<option value="ALL">All Mods (${mods.length})</option>` +
      modOpt +
      mods.map(m => `<option value="${m}">${m}</option>`).join("");
  };
  fillModSelect("roundModFilter", ARMA_DATABASE.rounds, true);
  fillModSelect("vestModFilter", ARMA_DATABASE.vests, true);
  fillModSelect("helmetModFilter", ARMA_DATABASE.helmets, true);
  fillModSelect("uniformModFilter", ARMA_DATABASE.uniforms, false);
}

function populateRealWorldPresets() {
  const grpSel = document.getElementById("rwGroupFilter");
  if (grpSel) {
    const groups = Array.from(new Set(REAL_WORLD_CARTRIDGE_LIBRARY.map(x => x.group)));
    grpSel.innerHTML = `<option value="ALL">All Families (${REAL_WORLD_CARTRIDGE_LIBRARY.length})</option>` +
      groups.map(g => `<option value="${g}">${g}</option>`).join("");
  }
  filterAndPopulateRealWorldPresets("__ACTIVE__");
}

function filterAndPopulateRealWorldPresets(preferredId) {
  const sel = document.getElementById("rwPresetSelect");
  if (!sel) return;
  const grpEl = document.getElementById("rwGroupFilter");
  const searchEl = document.getElementById("rwPresetSearch");
  const grp = (grpEl && grpEl.value) || "ALL";
  const q = ((searchEl && searchEl.value) || "").toLowerCase().trim();

  const filtered = REAL_WORLD_CARTRIDGE_LIBRARY.filter(item => {
    if (grp !== "ALL" && item.group !== grp) return false;
    if (!q) return true;
    return `${item.id} ${item.group} ${item.name}`.toLowerCase().includes(q);
  });

  const countLbl = document.getElementById("rwCatalogCountLabel");
  if (countLbl) {
    countLbl.textContent = filtered.length === REAL_WORLD_CARTRIDGE_LIBRARY.length
      ? `${REAL_WORLD_CARTRIDGE_LIBRARY.length}`
      : `${filtered.length}/${REAL_WORLD_CARTRIDGE_LIBRARY.length}`;
  }

  const targetVal = preferredId !== undefined ? preferredId : (sel.value || "__ACTIVE__");
  const hasTarget = targetVal === "__ACTIVE__" || filtered.some(x => x.id === targetVal);
  const activeVal = hasTarget ? targetVal : "__ACTIVE__";

  let html = `<option value="__ACTIVE__" ${activeVal === "__ACTIVE__" ? "selected" : ""}>— Synced from Active Round —</option>`;
  if (grp === "ALL") {
    const groups = {};
    for (const item of filtered) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    for (const [gName, items] of Object.entries(groups)) {
      html += `<optgroup label="${gName} (${items.length})">` +
        items.map(x => `<option value="${x.id}" ${x.id === activeVal ? "selected" : ""}>${x.name}</option>`).join("") +
        `</optgroup>`;
    }
  } else {
    html += filtered.map(x => `<option value="${x.id}" ${x.id === activeVal ? "selected" : ""}>${x.name}</option>`).join("");
  }
  sel.innerHTML = html;
}

function filterAndPopulateRoundSelect() {
  const mod = document.getElementById("roundModFilter").value || "ALL";
  const q = (document.getElementById("roundSearch").value || "").toLowerCase().trim();
  const sel = document.getElementById("roundSelect");

  const filtered = ARMA_DATABASE.rounds.filter(r => {
    if (mod === "__MODIFIED__") {
      if (!appState.modifiedRounds[r.className]) return false;
    } else if (mod !== "ALL" && r.mod !== mod) {
      return false;
    }
    if (!q) return true;
    return `${r.className} ${r.magName || ""} ${r.magClass || ""} ${r.mod}`.toLowerCase().includes(q);
  });

  const currentCls = appState.originalRound
    ? appState.originalRound.className
    : (appState.currentRound ? appState.currentRound.className : "");
  const stillPresent = filtered.some(r => r.className === currentCls);
  const activeCls = stillPresent ? currentCls : (filtered[0] ? filtered[0].className : "");

  sel.innerHTML = filtered.map(r => {
    const cleanMag = cleanDisplayString(r.magName);
    const modMark = appState.modifiedRounds[r.className] ? "✎ " : "";
    const label = cleanMag ? `${modMark}${r.className} — ${cleanMag} [${r.mod}]` : `${modMark}${r.className} [${r.mod}]`;
    return `<option value="${r.className}" ${r.className === activeCls ? "selected" : ""}>${label}</option>`;
  }).join("");

  const modCount = Object.keys(appState.modifiedRounds).length;
  document.getElementById("roundCountBadge").textContent = modCount > 0
    ? `${filtered.length} rounds (${modCount} tuned)`
    : `${filtered.length} rounds`;
  if (!stillPresent && activeCls) {
    selectRoundByClass(activeCls);
  }
}

function filterAndPopulateGearSelect(cat, selectId, modFilterId, searchId, currentItem, includeNone = true) {
  const mod = document.getElementById(modFilterId).value || "ALL";
  const q = (document.getElementById(searchId).value || "").toLowerCase().trim();
  const sel = document.getElementById(selectId);
  const slot = cat === "vests" ? "vest" : (cat === "helmets" ? "helmet" : "uniform");
  const modMap = appState.modifiedGear[slot] || {};

  const items = ARMA_DATABASE[cat] || [];
  const filtered = items.filter(x => {
    if (mod === "__MODIFIED__") {
      if (!modMap[x.className]) return false;
    } else if (mod !== "ALL" && x.mod !== mod) {
      return false;
    }
    if (!q) return true;
    return `${x.className} ${x.displayName || ""} ${x.description || ""} ${x.mod}`.toLowerCase().includes(q);
  });

  const curCls = currentItem ? currentItem.className : "__NONE__";
  const stillPresent = curCls === "__NONE__" ? includeNone : filtered.some(x => x.className === curCls);
  const activeCls = stillPresent ? curCls : (filtered[0] ? filtered[0].className : (includeNone ? "__NONE__" : ""));

  let html = includeNone ? `<option value="__NONE__" ${activeCls === "__NONE__" ? "selected" : ""}>— None (Unarmored) —</option>` : "";
  html += filtered.map(x => {
    const desc = x.description ? ` (${x.description})` : "";
    const modMark = modMap[x.className] ? "✎ " : "";
    const label = `${modMark}${x.displayName || x.className}${desc} [${x.mod}] — ${x.className}`;
    return `<option value="${x.className}" ${x.className === activeCls ? "selected" : ""}>${label}</option>`;
  }).join("");
  sel.innerHTML = html;

  if (!stillPresent && activeCls) {
    selectGearByClass(slot, activeCls);
  }
}

function selectRoundByClass(className) {
  syncActiveEditsToSession();
  const found = ARMA_DATABASE.rounds.find(r => r.className === className) || ARMA_DATABASE.rounds[0];
  if (!found) return;
  appState.originalRound = deepClone(found);
  const saved = appState.modifiedRounds[found.className];
  appState.currentRound = saved ? deepClone(saved.current) : deepClone(found);
  document.getElementById("rwProjectileProfile").value = "manual";
  const rwSel = document.getElementById("rwPresetSelect");
  if (rwSel) rwSel.value = "__ACTIVE__";
  filterAndPopulateRoundSelect();
  updateAllViews();
}

function selectGearByClass(slot, className) {
  syncActiveEditsToSession();
  document.querySelectorAll("#armorArchetypeStrip .arch-btn").forEach(b => b.classList.remove("active"));
  if (className === "__NONE__") {
    appState.armorLoadout[slot] = null;
    appState.originalArmorLoadout[slot] = null;
  } else {
    const cat = slot === "vest" ? "vests" : (slot === "helmet" ? "helmets" : "uniforms");
    const found = ARMA_DATABASE[cat].find(x => x.className === className);
    if (found) {
      appState.originalArmorLoadout[slot] = deepClone(found);
      const saved = appState.modifiedGear[slot] && appState.modifiedGear[slot][found.className];
      appState.armorLoadout[slot] = saved ? deepClone(saved.current) : deepClone(found);
    }
  }
  syncArmorInputsFromState();
  updateAllViews();
}

function syncArmorInputsFromState() {
  const hp = appState.selectedHitpoint;
  const info = resolveHitpointArmor(appState.armorLoadout, hp);
  const origInfo = resolveHitpointArmor(appState.originalArmorLoadout.uniform ? appState.originalArmorLoadout : appState.armorLoadout, hp);

  const setArmInp = (id, val, oVal) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    el.classList.toggle("modified", Math.abs(Number(val) - Number(oVal)) > 0.01);
  };

  setArmInp("inpUnitBaseArmor", info.unitBaseArmor, origInfo.unitBaseArmor);
  setArmInp("inpUnitStructural", info.unitStructural, origInfo.unitStructural);
  setArmInp("inpHpMult", info.hpArmorMult, origInfo.hpArmorMult);
  setArmInp("inpHpPass", info.hpBasePassThrough, origInfo.hpBasePassThrough);
  setArmInp("inpVestHpArmor", info.vestArmorRaw, origInfo.vestArmorRaw);
  setArmInp("inpVestHpPass", info.vestPassThrough, origInfo.vestPassThrough);
  setArmInp("inpHelmHpArmor", info.helmArmorRaw, origInfo.helmArmorRaw);
  setArmInp("inpHelmHpPass", info.helmPassThrough, origInfo.helmPassThrough);
}

function readArmorInputsToState() {
  const hp = appState.selectedHitpoint;
  const wholeVest = document.getElementById("chkEditWholeVest") && document.getElementById("chkEditWholeVest").checked;

  const uni = appState.armorLoadout.uniform;
  if (uni) {
    uni.armor = Math.max(0.1, parseFloat(document.getElementById("inpUnitBaseArmor").value) || 2.0);
    uni.armorStructural = Math.max(0.1, parseFloat(document.getElementById("inpUnitStructural").value) || 4.0);
    if (!uni.hitpoints) uni.hitpoints = {};
    if (!uni.hitpoints[hp]) uni.hitpoints[hp] = {};
    uni.hitpoints[hp].armor = Math.max(0.5, parseFloat(document.getElementById("inpHpMult").value) || 1.0);
    uni.hitpoints[hp].passThrough = Math.min(1, Math.max(0.1, parseFloat(document.getElementById("inpHpPass").value) || 1.0));
  }

  const vestArmorVal = Math.max(0, parseFloat(document.getElementById("inpVestHpArmor").value) || 0);
  const vestPassVal = Math.min(1, Math.max(0.1, parseFloat(document.getElementById("inpVestHpPass").value) || 0.3));
  if (!appState.armorLoadout.vest && vestArmorVal > 0) {
    appState.armorLoadout.vest = { className: "Custom_Vest", displayName: "Custom Vest", mod: "Custom", protection: {} };
  }
  if (appState.armorLoadout.vest) {
    if (!appState.armorLoadout.vest.protection) appState.armorLoadout.vest.protection = {};
    if (wholeVest && TORSO_HITPOINTS.includes(hp)) {
      TORSO_HITPOINTS.forEach(thp => {
        appState.armorLoadout.vest.protection[thp] = { armor: vestArmorVal, passThrough: vestPassVal };
      });
    } else {
      appState.armorLoadout.vest.protection[hp] = { armor: vestArmorVal, passThrough: vestPassVal };
    }
  }

  const helmArmorVal = Math.max(0, parseFloat(document.getElementById("inpHelmHpArmor").value) || 0);
  const helmPassVal = Math.min(1, Math.max(0.1, parseFloat(document.getElementById("inpHelmHpPass").value) || 0.5));
  if (!appState.armorLoadout.helmet && helmArmorVal > 0) {
    appState.armorLoadout.helmet = { className: "Custom_Helmet", displayName: "Custom Helmet", mod: "Custom", protection: {} };
  }
  if (appState.armorLoadout.helmet) {
    if (!appState.armorLoadout.helmet.protection) appState.armorLoadout.helmet.protection = {};
    appState.armorLoadout.helmet.protection[hp] = { armor: helmArmorVal, passThrough: helmPassVal };
  }

  syncArmorInputsFromState();
  updateAllViews();
}

function applyArmorArchetype(levelNum) {
  const vestArmors = [0, 8, 12, 16, 20, 24];
  const vestPts = [1.0, 0.5, 0.4, 0.3, 0.2, 0.1];
  const helmArmors = [0, 4, 6, 8, 10, 12];
  const helmPts = [1.0, 0.6, 0.5, 0.4, 0.3, 0.2];
  const mmLabels = [0, 6, 15, 21, 40, 55];

  const hp = appState.selectedHitpoint;
  const isHead = ["HitHead", "HitFace", "HitNeck"].includes(hp);

  if (appState.armorLoadout.uniform && appState.armorLoadout.uniform.hitpoints && appState.armorLoadout.uniform.hitpoints.HitPelvis) {
    appState.armorLoadout.uniform.hitpoints.HitPelvis.armor = levelNum <= 1 ? 1.0 : 6.0;
  }

  if (isHead) {
    if (levelNum === 0) {
      if (appState.armorLoadout.helmet && appState.armorLoadout.helmet.protection) {
        appState.armorLoadout.helmet.protection[hp] = { armor: 0, passThrough: 1.0 };
      }
    } else {
      if (!appState.armorLoadout.helmet) {
        appState.armorLoadout.helmet = {
          className: `Custom_Helmet_Lvl${levelNum}`,
          displayName: `Custom Helmet Lvl ${levelNum}`,
          mod: "Custom",
          protection: {}
        };
      }
      if (!appState.armorLoadout.helmet.protection) appState.armorLoadout.helmet.protection = {};
      appState.armorLoadout.helmet.protection[hp] = { armor: helmArmors[levelNum], passThrough: helmPts[levelNum] };
    }
  } else {
    const wholeVest = document.getElementById("chkEditWholeVest") && document.getElementById("chkEditWholeVest").checked;
    const targets = (wholeVest && TORSO_HITPOINTS.includes(hp)) ? TORSO_HITPOINTS : [hp];
    if (levelNum === 0) {
      if (appState.armorLoadout.vest && appState.armorLoadout.vest.protection) {
        targets.forEach(t => {
          appState.armorLoadout.vest.protection[t] = { armor: 0, passThrough: 1.0 };
        });
      }
    } else {
      if (!appState.armorLoadout.vest) {
        appState.armorLoadout.vest = {
          className: `Custom_Vest_Lvl${levelNum}`,
          displayName: `Custom Vest Lvl ${levelNum} (${mmLabels[levelNum]}mm)`,
          mod: "Custom",
          protection: {}
        };
      }
      if (!appState.armorLoadout.vest.protection) appState.armorLoadout.vest.protection = {};
      targets.forEach(t => {
        appState.armorLoadout.vest.protection[t] = { armor: vestArmors[levelNum], passThrough: vestPts[levelNum] };
      });
    }
  }
  syncArmorInputsFromState();
  updateAllViews();
}

function setEngagementRange(r) {
  const clamped = Math.max(0, Math.min(2500, Math.round(r)));
  appState.rangeMeters = clamped;
  document.getElementById("rangeInput").value = clamped;
  document.getElementById("rangeSlider").value = Math.min(1500, clamped);
  updateAllViews();
}

function applyRealWorldPhysicalEdits() {
  const r = appState.currentRound;
  if (!r) return;
  const massG = Math.max(0.2, parseFloat(document.getElementById("rwBulletMass").value) || 4.0);
  const diamMM = Math.max(2.0, parseFloat(document.getElementById("rwBulletDiam").value) || 5.56);
  const v0 = Math.max(50, parseFloat(document.getElementById("rwMuzzleVel").value) || 850);
  const dragModel = parseInt(document.getElementById("rwInputDragModel").value, 10) || 1;
  const syncTyp = document.getElementById("chkSyncTypicalSpeed") && document.getElementById("chkSyncTypicalSpeed").checked;

  r.ACE_bulletMass = Number(massG.toFixed(3));
  r.ACE_caliber = Number(diamMM.toFixed(2));
  r.initSpeed = Number(v0.toFixed(1));
  if (syncTyp) r.typicalSpeed = Number(v0.toFixed(1));
  syncAceBarrelMuzzleVelocities(r, appState.originalRound);
  r.ACE_dragModel = dragModel;

  const refDist = Math.max(25, parseFloat(document.getElementById("rwRefDist").value) || 300);
  if (appState.dragMode === "bc") {
    const bc = Math.max(0.03, parseFloat(document.getElementById("rwInputBC").value) || 0.30);
    r.ACE_ballisticCoefficients = [Number(bc.toFixed(3))];
    r.airFriction = Number(solveAirFrictionFromBC(v0, bc, dragModel).toFixed(7));
  } else {
    const vRef = Math.max(15, Math.min(v0 - 1, parseFloat(document.getElementById("rwRefVel").value) || v0 * 0.7));
    r.airFriction = Number((Math.log(vRef / v0) / refDist).toFixed(7));
    const solvedBC = solveBCFromDownrangeVelocity(v0, refDist, vRef, dragModel);
    r.ACE_ballisticCoefficients = [Number(solvedBC.toFixed(3))];
  }

  const profileVal = document.getElementById("rwProjectileProfile").value;
  if (profileVal !== "manual") {
    r.hit = Number(computeCanonicalBIHit(massG, v0, parseFloat(profileVal) || 1.0).toFixed(2));
  }
  updateAllViews();
}

function applyRealWorldPreset(presetId) {
  if (presetId === "__ACTIVE__") {
    updateAllViews();
    return;
  }
  const preset = REAL_WORLD_CARTRIDGE_LIBRARY.find(p => p.id === presetId);
  if (!preset || !appState.currentRound) return;

  const r = appState.currentRound;
  const syncTyp = document.getElementById("chkSyncTypicalSpeed") && document.getElementById("chkSyncTypicalSpeed").checked;

  r.ACE_bulletMass = preset.massGrams;
  r.ACE_caliber = preset.diamMM;
  r.initSpeed = preset.muzzleVel;
  if (syncTyp) r.typicalSpeed = preset.muzzleVel;
  syncAceBarrelMuzzleVelocities(r, appState.originalRound);
  r.ACE_dragModel = preset.dragModel;
  r.ACE_ballisticCoefficients = [preset.bc];
  r.airFriction = Number(solveAirFrictionFromBC(preset.muzzleVel, preset.bc, preset.dragModel).toFixed(7));

  document.getElementById("rwProjectileProfile").value = preset.profile;
  r.hit = Number(computeCanonicalBIHit(preset.massGrams, preset.muzzleVel, parseFloat(preset.profile) || 1.0).toFixed(2));

  if (document.getElementById("chkRwApplyPenGoal") && document.getElementById("chkRwApplyPenGoal").checked) {
    document.getElementById("rwArmorGoalLevel").value = preset.armorLevel;
    const spec = buildTargetSpecFromGoal(preset.armorLevel);
    const solved = solveCaliberForTargetRange(r, spec, preset.maxPenDist, getActiveCriterion(), getSimOpts(), true);
    r.caliber = solved.caliber;
    r.hit = solved.hit;
  }
  updateAllViews();
}

function bindDraggablePenMatrix() {
  const container = document.getElementById("rwPenMatrixContainer");
  if (!container) return;

  let dragState = null;

  const applyDragClientX = clientX => {
    if (!dragState || !appState.currentRound) return;
    const rel = Math.max(0, Math.min(1, (clientX - dragState.left) / Math.max(10, dragState.width)));
    const targetDist = Math.round((rel * MATRIX_MAX_RANGE) / 5) * 5;
    document.getElementById("rwArmorGoalLevel").value = dragState.rowId;
    document.getElementById("rwArmorMaxDist").value = targetDist;
    document.getElementById("rwArmorMaxDistSlider").value = targetDist;

    const spec = buildTargetSpecFromGoal(dragState.rowId);
    const solved = solveCaliberForTargetRange(appState.currentRound, spec, targetDist, getActiveCriterion(), getSimOpts(), true);
    appState.currentRound.caliber = solved.caliber;
    appState.currentRound.hit = solved.hit;
    updateAllViews(true);
  };

  container.addEventListener("input", e => {
    const inp = e.target.closest && e.target.closest(".pen-row-dist-inp");
    if (!inp || !appState.currentRound) return;
    const rid = inp.getAttribute("data-row-id");
    const targetDist = Math.max(0, Math.min(2000, parseFloat(inp.value) || 0));
    document.getElementById("rwArmorGoalLevel").value = rid;
    document.getElementById("rwArmorMaxDist").value = targetDist;
    document.getElementById("rwArmorMaxDistSlider").value = Math.min(1000, targetDist);
    const spec = buildTargetSpecFromGoal(rid);
    const solved = solveCaliberForTargetRange(appState.currentRound, spec, targetDist, getActiveCriterion(), getSimOpts(), true);
    appState.currentRound.caliber = solved.caliber;
    appState.currentRound.hit = solved.hit;
    updateAllViews(true);
  });

  container.addEventListener("pointerdown", e => {
    if (e.target.closest && e.target.closest(".pen-row-dist-inp")) return;
    const labelEl = e.target.closest(".pen-row-label");
    if (labelEl) {
      const rid = labelEl.getAttribute("data-row-id");
      document.getElementById("rwArmorGoalLevel").value = rid;
      updateAllViews();
      return;
    }
    const track = e.target.closest(".pen-bar-track");
    if (!track) return;
    e.preventDefault();
    const rect = track.getBoundingClientRect();
    dragState = {
      rowId: track.getAttribute("data-row-id"),
      left: rect.left,
      width: rect.width
    };
    applyDragClientX(e.clientX);
  });

  window.addEventListener("pointermove", e => {
    if (!dragState) return;
    applyDragClientX(e.clientX);
  });

  window.addEventListener("pointerup", () => {
    if (dragState) {
      dragState = null;
      updateAllViews(false);
    }
  });
}

function pinCurrentVestLoadout() {
  const v = appState.armorLoadout.vest;
  const label = v ? `${v.displayName || v.className}${isArmorModified() ? " (Tuned)" : ""}` : "Unarmored Custom";
  appState.pinnedVests.push({
    label,
    loadout: deepClone(appState.armorLoadout)
  });
  updateAllViews();
}

function copyTextWithButtonFeedback(btnId, text) {
  const btn = document.getElementById(btnId);
  const done = () => {
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = prev; }, 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {});
  } else {
    done();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hdrRoundsCount").textContent = ARMA_DATABASE.rounds.length;
  document.getElementById("hdrVestsCount").textContent = ARMA_DATABASE.vests.length;
  document.getElementById("hdrHelmetsCount").textContent = ARMA_DATABASE.helmets.length;
  document.getElementById("hdrUniformsCount").textContent = ARMA_DATABASE.uniforms.length;

  // Sanitize any raw $STR_... localization strings in scraped database
  ARMA_DATABASE.rounds.forEach(r => { if (r.magName) r.magName = cleanDisplayString(r.magName); });
  ARMA_DATABASE.vests.forEach(v => { if (v.displayName) v.displayName = cleanDisplayString(v.displayName); });
  ARMA_DATABASE.helmets.forEach(h => { if (h.displayName) h.displayName = cleanDisplayString(h.displayName); });
  ARMA_DATABASE.uniforms.forEach(u => { if (u.displayName) u.displayName = cleanDisplayString(u.displayName); });

  populateModFilters();
  populateRealWorldPresets();

  const defaultRound = ARMA_DATABASE.rounds.find(r => r.className === "MCC_556_M855A1_PLUS")
    || ARMA_DATABASE.rounds.find(r => r.className === "ACE_556x45_Ball_M995_AP")
    || ARMA_DATABASE.rounds.find(r => r.className === "B_556x45_Ball")
    || ARMA_DATABASE.rounds[0];
  const defaultVest = ARMA_DATABASE.vests.find(v => v.className === "V_PlateCarrier1_rgr")
    || ARMA_DATABASE.vests.find(v => v.className === "V_PlateCarrier2_rgr")
    || ARMA_DATABASE.vests[0];
  const defaultHelmet = ARMA_DATABASE.helmets.find(h => h.className === "H_HelmetB") || ARMA_DATABASE.helmets[0];
  const defaultUniform = ARMA_DATABASE.uniforms.find(u => u.className === "U_B_CombatUniform_mcam") || ARMA_DATABASE.uniforms[0];

  appState.originalRound = deepClone(defaultRound);
  appState.currentRound = deepClone(defaultRound);
  appState.armorLoadout = {
    vest: deepClone(defaultVest),
    helmet: deepClone(defaultHelmet),
    uniform: deepClone(defaultUniform)
  };
  appState.originalArmorLoadout = deepClone(appState.armorLoadout);

  filterAndPopulateRoundSelect();
  filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
  filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true);
  filterAndPopulateGearSelect("uniforms", "uniformSelect", "uniformModFilter", "uniformSearch", appState.armorLoadout.uniform, false);

  syncArmorInputsFromState();

  // Header Global Controls
  document.getElementById("chkAceArmorPen").addEventListener("change", e => {
    appState.alternateArmorPen = e.target.checked;
    updateAllViews();
  });
  document.getElementById("chkAdvBallistics").addEventListener("change", e => {
    appState.useAdvBallistics = e.target.checked;
    updateAllViews();
  });
  document.getElementById("inpDamageThreshold").addEventListener("input", e => {
    appState.damageThreshold = Math.max(0.2, parseFloat(e.target.value) || 1.0);
    updateAllViews();
  });
  const resetEntireSession = () => {
    appState.modifiedRounds = {};
    appState.modifiedGear = { vest: {}, helmet: {} };
    if (appState.originalRound) appState.currentRound = deepClone(appState.originalRound);
    if (appState.originalArmorLoadout.uniform) appState.armorLoadout = deepClone(appState.originalArmorLoadout);
    document.querySelectorAll("#armorArchetypeStrip .arch-btn").forEach(b => b.classList.remove("active"));
    ["roundModFilter", "vestModFilter", "helmetModFilter"].forEach(fid => {
      const fel = document.getElementById(fid);
      if (fel && fel.value === "__MODIFIED__") fel.value = "ALL";
    });
    patientState.mode = "preview";
    filterAndPopulateRoundSelect();
    filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
    filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true);
    syncArmorInputsFromState();
    updateAllViews();
  };

  document.getElementById("btnGlobalReset").addEventListener("click", resetEntireSession);
  const btnClearSess = document.getElementById("btnClearSessionEdits");
  if (btnClearSess) btnClearSess.addEventListener("click", resetEntireSession);
  document.getElementById("btnHeaderCopyHpp").addEventListener("click", () => {
    copyTextWithButtonFeedback("btnHeaderCopyHpp", buildExportConfigText());
  });

  // Target Body Zone 3-Way Switcher (Torso | Head | All 11 Hitpoints)
  const zoneSelAll = document.getElementById("zoneSelectAll");
  if (zoneSelAll) {
    zoneSelAll.innerHTML = HITZONES.map(hz =>
      `<option value="${hz.id}">${hz.label} (${hz.acePart})</option>`
    ).join("");
    zoneSelAll.value = appState.selectedHitpoint;
    zoneSelAll.addEventListener("change", e => {
      appState.selectedHitpoint = e.target.value;
      syncArmorInputsFromState();
      updateAllViews();
    });
  }
  document.getElementById("zoneQuickTorso").addEventListener("click", () => {
    appState.selectedHitpoint = "HitChest";
    syncArmorInputsFromState();
    updateAllViews();
  });
  document.getElementById("zoneQuickHead").addEventListener("click", () => {
    appState.selectedHitpoint = "HitHead";
    syncArmorInputsFromState();
    updateAllViews();
  });

  // Column 1: Round Picker & 3-Pane Sub-Tabs
  ["roundModFilter", "roundSearch"].forEach(id => {
    document.getElementById(id).addEventListener("input", filterAndPopulateRoundSelect);
    document.getElementById(id).addEventListener("change", filterAndPopulateRoundSelect);
  });
  document.getElementById("roundSelect").addEventListener("change", e => selectRoundByClass(e.target.value));

  document.getElementById("barrelLengthSelect").addEventListener("change", e => {
    const mv = parseFloat(e.target.value);
    if (mv > 0 && appState.currentRound) {
      appState.currentRound.initSpeed = mv;
      if (document.getElementById("chkSyncTypicalSpeed").checked) {
        appState.currentRound.typicalSpeed = mv;
      }
      updateAllViews();
    }
  });

  const switchRoundPane = paneId => {
    document.querySelectorAll(".round-tab-btn[data-rpane]").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-rpane") === paneId);
    });
    document.querySelectorAll(".round-pane").forEach(p => {
      p.classList.toggle("active", p.id === paneId);
    });
    updateAllViews();
  };
  document.querySelectorAll(".round-tab-btn[data-rpane]").forEach(btn => {
    btn.addEventListener("click", () => switchRoundPane(btn.getAttribute("data-rpane")));
  });
  document.getElementById("btnJumpRealWorld").addEventListener("click", () => {
    switchRoundPane("roundPaneRealWorld");
  });

  const setRwUnits = unitMode => {
    appState.rwUnits = unitMode;
    const isImp = unitMode === "imperial";
    document.getElementById("btnUnitsMetric").classList.toggle("active", !isImp);
    document.getElementById("btnUnitsImperial").classList.toggle("active", isImp);
    document.getElementById("rwMetricFields").style.display = isImp ? "none" : "grid";
    document.getElementById("rwImperialFields").style.display = isImp ? "grid" : "none";
    document.getElementById("rwRefVelWrapMetric").style.display = isImp ? "none" : "flex";
    document.getElementById("rwRefVelWrapImp").style.display = isImp ? "flex" : "none";
  };
  document.getElementById("btnUnitsMetric").addEventListener("click", () => setRwUnits("metric"));
  document.getElementById("btnUnitsImperial").addEventListener("click", () => setRwUnits("imperial"));

  // Mode 1: Balance vs Armor Listeners
  document.getElementById("btnToggleCustomRha").addEventListener("click", () => {
    appState.showCustomRhaRow = !appState.showCustomRhaRow;
    if (appState.showCustomRhaRow) {
      document.getElementById("rwArmorGoalLevel").value = "custom";
    } else if (getActiveGoalId() === "custom") {
      document.getElementById("rwArmorGoalLevel").value = "active";
    }
    updateAllViews();
  });

  document.getElementById("btnRwMatchEquipped").addEventListener("click", () => {
    document.getElementById("rwArmorGoalLevel").value = "active";
    const targetDist = Math.max(0, Math.round(appState.rangeMeters));
    document.getElementById("rwArmorMaxDist").value = targetDist;
    document.getElementById("rwArmorMaxDistSlider").value = Math.min(1000, targetDist);
    const spec = buildTargetSpecFromGoal("active");
    const solved = solveCaliberForTargetRange(appState.currentRound, spec, targetDist, getActiveCriterion(), getSimOpts(), true);
    appState.currentRound.caliber = solved.caliber;
    appState.currentRound.hit = solved.hit;
    updateAllViews(true);
  });

  document.getElementById("rwCustomRhaMM").addEventListener("input", () => {
    const d = Math.max(0, parseFloat(document.getElementById("rwArmorMaxDist").value) || 0);
    const spec = buildTargetSpecFromGoal("custom");
    const solved = solveCaliberForTargetRange(appState.currentRound, spec, d, getActiveCriterion(), getSimOpts(), true);
    appState.currentRound.caliber = solved.caliber;
    appState.currentRound.hit = solved.hit;
    updateAllViews(true);
  });

  document.querySelectorAll("[data-customrha]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("rwCustomRhaMM").value = btn.getAttribute("data-customrha");
      document.getElementById("rwArmorGoalLevel").value = "custom";
      updateAllViews();
    });
  });

  document.getElementById("rwPenCriterion").addEventListener("change", () => {
    updateAllViews(false);
  });

  const applyDesiredPenDistance = distVal => {
    const d = Math.max(0, parseFloat(distVal) || 0);
    let gid = getActiveGoalId();
    if (gid === "0" && d > 0) {
      gid = "active";
      document.getElementById("rwArmorGoalLevel").value = "active";
    }
    const spec = buildTargetSpecFromGoal(gid);
    const solved = solveCaliberForTargetRange(appState.currentRound, spec, d, getActiveCriterion(), getSimOpts(), true);
    appState.currentRound.caliber = solved.caliber;
    appState.currentRound.hit = solved.hit;
    updateAllViews(true);
  };

  document.getElementById("rwArmorMaxDistSlider").addEventListener("input", e => {
    document.getElementById("rwArmorMaxDist").value = e.target.value;
    applyDesiredPenDistance(e.target.value);
  });
  document.getElementById("rwArmorMaxDist").addEventListener("input", e => {
    const d = Math.max(0, parseFloat(e.target.value) || 0);
    document.getElementById("rwArmorMaxDistSlider").value = Math.min(1000, d);
    applyDesiredPenDistance(d);
  });
  document.getElementById("btnStopAtZero").addEventListener("click", () => {
    document.getElementById("rwArmorGoalLevel").value = "active";
    document.getElementById("rwArmorMaxDist").value = 0;
    document.getElementById("rwArmorMaxDistSlider").value = 0;
    applyDesiredPenDistance(0);
  });

  const applyNewHitValue = newHit => {
    const r = appState.currentRound;
    if (!r) return;
    const lockPen = document.getElementById("chkLockPenOnHit").checked;
    const gid = getActiveGoalId();
    const spec = buildTargetSpecFromGoal(gid);
    const prevDist = gid === "0" ? 0 : computeMaxCriterionRange(r, spec, getActiveCriterion(), getSimOpts());
    r.hit = Number(Math.max(0.5, newHit).toFixed(3));
    if (lockPen) {
      const solved = solveCaliberForTargetRange(r, spec, prevDist, getActiveCriterion(), getSimOpts(), false);
      r.caliber = solved.caliber;
    }
    updateAllViews(lockPen);
  };

  document.getElementById("rwProjectileProfile").addEventListener("change", e => {
    if (e.target.value === "manual") {
      updateAllViews();
      return;
    }
    const r = appState.currentRound;
    const mult = parseFloat(e.target.value) || 1.0;
    const autoHit = computeCanonicalBIHit(r.ACE_bulletMass || 4.0, r.initSpeed || 850, mult);
    applyNewHitValue(autoHit);
  });

  document.querySelectorAll(".prof-pill[data-prof]").forEach(btn => {
    btn.addEventListener("click", () => {
      const prof = btn.getAttribute("data-prof");
      document.getElementById("rwProjectileProfile").value = prof;
      if (prof === "manual") {
        updateAllViews();
        return;
      }
      const r = appState.currentRound;
      const mult = parseFloat(prof) || 1.0;
      const autoHit = computeCanonicalBIHit(r.ACE_bulletMass || 4.0, r.initSpeed || 850, mult);
      applyNewHitValue(autoHit);
    });
  });

  document.getElementById("rwHitSlider").addEventListener("input", e => {
    document.getElementById("rwProjectileProfile").value = "manual";
    const h = parseFloat(e.target.value) || 8;
    document.getElementById("rwHitInput").value = h.toFixed(2);
    applyNewHitValue(h);
  });
  document.getElementById("rwHitInput").addEventListener("input", e => {
    document.getElementById("rwProjectileProfile").value = "manual";
    const h = parseFloat(e.target.value) || 8;
    document.getElementById("rwHitSlider").value = Math.min(45, h).toFixed(1);
    applyNewHitValue(h);
  });

  // Mode 2: Real-World Specs Listeners
  ["rwGroupFilter", "rwPresetSearch"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => filterAndPopulateRealWorldPresets());
      el.addEventListener("change", () => filterAndPopulateRealWorldPresets());
    }
  });
  document.getElementById("rwPresetSelect").addEventListener("change", e => applyRealWorldPreset(e.target.value));

  const applySuggestedRealWorldMatch = () => {
    if (!appState.currentRound || typeof findBestRealWorldSpec !== "function") return;
    const match = findBestRealWorldSpec(appState.currentRound);
    if (!match) return;
    const grpEl = document.getElementById("rwGroupFilter");
    const searchEl = document.getElementById("rwPresetSearch");
    if (grpEl) grpEl.value = "ALL";
    if (searchEl) searchEl.value = "";
    filterAndPopulateRealWorldPresets(match.preset.id);
    applyRealWorldPreset(match.preset.id);
  };

  const btnApplySug = document.getElementById("btnApplySuggestedRw");
  if (btnApplySug) btnApplySug.addEventListener("click", applySuggestedRealWorldMatch);
  const btnAutoMatch = document.getElementById("btnRwAutoMatch");
  if (btnAutoMatch) btnAutoMatch.addEventListener("click", applySuggestedRealWorldMatch);

  document.getElementById("btnRwPullCurrent").addEventListener("click", () => {
    document.getElementById("rwPresetSelect").value = "__ACTIVE__";
    updateAllViews();
  });

  document.getElementById("rwBulletMass").addEventListener("input", e => {
    const g = Math.max(0.1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletGrains").value = (g * GRAINS_PER_GRAM).toFixed(1);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwBulletGrains").addEventListener("input", e => {
    const gr = Math.max(1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletMass").value = (gr / GRAINS_PER_GRAM).toFixed(2);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwBulletDiam").addEventListener("input", e => {
    const mm = Math.max(1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletInches").value = (mm / MM_PER_INCH).toFixed(3);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwBulletInches").addEventListener("input", e => {
    const inches = Math.max(0.05, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletDiam").value = (inches * MM_PER_INCH).toFixed(2);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwMuzzleVel").addEventListener("input", e => {
    const mps = Math.max(20, parseFloat(e.target.value) || 0);
    document.getElementById("rwMuzzleFps").value = Math.round(mps * FPS_PER_MPS);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwMuzzleFps").addEventListener("input", e => {
    const fps = Math.max(60, parseFloat(e.target.value) || 0);
    document.getElementById("rwMuzzleVel").value = Math.round(fps / FPS_PER_MPS);
    applyRealWorldPhysicalEdits();
  });

  document.getElementById("btnDragModeBC").addEventListener("click", () => {
    appState.dragMode = "bc";
    document.getElementById("btnDragModeBC").classList.add("active");
    document.getElementById("btnDragModeVel").classList.remove("active");
    document.getElementById("rwDragPanelBC").style.display = "grid";
    document.getElementById("rwDragPanelVel").style.display = "none";
  });
  document.getElementById("btnDragModeVel").addEventListener("click", () => {
    appState.dragMode = "vel";
    document.getElementById("btnDragModeVel").classList.add("active");
    document.getElementById("btnDragModeBC").classList.remove("active");
    document.getElementById("rwDragPanelBC").style.display = "none";
    document.getElementById("rwDragPanelVel").style.display = "grid";
  });

  document.getElementById("rwInputBC").addEventListener("input", applyRealWorldPhysicalEdits);
  document.getElementById("rwInputDragModel").addEventListener("change", applyRealWorldPhysicalEdits);
  document.getElementById("rwRefDist").addEventListener("input", () => updateAllViews());
  document.getElementById("rwRefVel").addEventListener("input", e => {
    const mps = Math.max(20, parseFloat(e.target.value) || 0);
    document.getElementById("rwRefFps").value = Math.round(mps * FPS_PER_MPS);
    applyRealWorldPhysicalEdits();
  });
  document.getElementById("rwRefFps").addEventListener("input", e => {
    const fps = Math.max(60, parseFloat(e.target.value) || 0);
    document.getElementById("rwRefVel").value = Math.round(fps / FPS_PER_MPS);
    applyRealWorldPhysicalEdits();
  });

  // Mode 3: Raw CfgAmmo Direct Listeners
  const readRawCfgInputs = e => {
    const r = appState.currentRound;
    if (!r) return;
    const prevInit = r.initSpeed;
    r.className = document.getElementById("inpRoundClass").value.trim() || "Custom_Ammo";
    r.ACE_damageType = document.getElementById("inpDamageType").value;
    r.hit = Math.max(0.1, parseFloat(document.getElementById("inpHit").value) || 0.1);
    r.caliber = Math.max(0.01, parseFloat(document.getElementById("inpCaliber").value) || 0.01);
    r.initSpeed = Math.max(1, parseFloat(document.getElementById("inpInitSpeed").value) || 1);
    if (e && e.target && e.target.id === "inpInitSpeed" && Math.abs(r.initSpeed - prevInit) >= 0.5) {
      syncAceBarrelMuzzleVelocities(r, appState.originalRound);
    }
    r.typicalSpeed = Math.max(1, parseFloat(document.getElementById("inpTypicalSpeed").value) || 1);
    r.airFriction = parseFloat(document.getElementById("inpAirFriction").value) || 0;
    r.deflecting = parseFloat(document.getElementById("inpDeflecting").value) || 0;
    r.ACE_bulletMass = Math.max(0.1, parseFloat(document.getElementById("inpAceMass").value) || 4.0);
    r.ACE_caliber = Math.max(1, parseFloat(document.getElementById("inpAceCaliber").value) || 5.56);
    r.ACE_ballisticCoefficients = [Math.max(0.02, parseFloat(document.getElementById("inpAceBC").value) || 0.3)];
    r.ACE_dragModel = parseInt(document.getElementById("inpAceDrag").value, 10) || 1;
    r.explosive = Math.min(1, Math.max(0, parseFloat(document.getElementById("inpExplosive").value) || 0));
    document.getElementById("rwProjectileProfile").value = "manual";
    updateAllViews();
  };

  [
    "inpRoundClass", "inpDamageType", "inpHit", "inpCaliber", "inpInitSpeed",
    "inpTypicalSpeed", "inpAirFriction", "inpDeflecting", "inpAceMass",
    "inpAceCaliber", "inpAceBC", "inpAceDrag", "inpExplosive"
  ].forEach(id => {
    document.getElementById(id).addEventListener("input", readRawCfgInputs);
  });

  document.getElementById("btnMatchTypicalToInit").addEventListener("click", () => {
    if (appState.currentRound) {
      appState.currentRound.typicalSpeed = appState.currentRound.initSpeed;
      updateAllViews();
    }
  });

  // Footer Actions
  document.getElementById("btnQuickCopyHpp").addEventListener("click", () => {
    copyTextWithButtonFeedback("btnQuickCopyHpp", buildExportConfigText());
  });
  document.getElementById("btnResetRound").addEventListener("click", () => {
    if (appState.originalRound) {
      appState.currentRound = deepClone(appState.originalRound);
      document.getElementById("rwProjectileProfile").value = "manual";
      document.getElementById("rwPresetSelect").value = "__ACTIVE__";
      updateAllViews();
    }
  });

  // Column 2: Armor Selectors, Archetypes & Custom Vest Tuner
  document.querySelectorAll("#armorArchetypeStrip .arch-btn").forEach(btn => {
    btn.addEventListener("click", () => applyArmorArchetype(parseInt(btn.getAttribute("data-arch"), 10)));
  });

  ["vestModFilter", "vestSearch"].forEach(id => {
    const fn = () => filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
    document.getElementById(id).addEventListener("input", fn);
    document.getElementById(id).addEventListener("change", fn);
  });
  document.getElementById("vestSelect").addEventListener("change", e => selectGearByClass("vest", e.target.value));

  ["helmetModFilter", "helmetSearch"].forEach(id => {
    const fn = () => filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true);
    document.getElementById(id).addEventListener("input", fn);
    document.getElementById(id).addEventListener("change", fn);
  });
  document.getElementById("helmetSelect").addEventListener("change", e => selectGearByClass("helmet", e.target.value));

  ["uniformModFilter", "uniformSearch"].forEach(id => {
    const fn = () => filterAndPopulateGearSelect("uniforms", "uniformSelect", "uniformModFilter", "uniformSearch", appState.armorLoadout.uniform, false);
    document.getElementById(id).addEventListener("input", fn);
    document.getElementById(id).addEventListener("change", fn);
  });
  document.getElementById("uniformSelect").addEventListener("change", e => selectGearByClass("uniform", e.target.value));

  [
    "inpUnitBaseArmor", "inpUnitStructural", "inpHpMult", "inpHpPass",
    "inpVestHpArmor", "inpVestHpPass", "inpHelmHpArmor", "inpHelmHpPass"
  ].forEach(id => {
    document.getElementById(id).addEventListener("input", readArmorInputsToState);
  });

  document.querySelectorAll(".vest-tier-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const varm = parseFloat(btn.getAttribute("data-varm")) || 0;
      const vpt = parseFloat(btn.getAttribute("data-vpt")) || 0.3;
      if (!TORSO_HITPOINTS.includes(appState.selectedHitpoint)) {
        appState.selectedHitpoint = "HitChest";
      }
      document.getElementById("inpVestHpArmor").value = varm;
      document.getElementById("inpVestHpPass").value = vpt;
      readArmorInputsToState();
    });
  });

  document.getElementById("btnResetArmor").addEventListener("click", () => {
    if (appState.originalArmorLoadout.uniform) {
      appState.armorLoadout = deepClone(appState.originalArmorLoadout);
    }
    document.querySelectorAll("#armorArchetypeStrip .arch-btn").forEach(b => b.classList.remove("active"));
    syncArmorInputsFromState();
    updateAllViews();
  });

  document.getElementById("btnPinActiveRound").addEventListener("click", () => {
    if (!appState.currentRound) return;
    appState.pinnedRounds.push({
      label: `${appState.currentRound.className}${isRoundModified() ? " (Tuned)" : ""}`,
      round: deepClone(appState.currentRound)
    });
    updateAllViews();
  });
  document.getElementById("btnClearPinnedRounds").addEventListener("click", () => {
    appState.pinnedRounds = [];
    updateAllViews();
  });

  document.getElementById("btnVestStopRound").addEventListener("click", () => {
    if (!appState.currentRound) return;
    const isHead = ["HitHead", "HitFace", "HitNeck"].includes(appState.selectedHitpoint);
    const targetHp = isHead
      ? appState.selectedHitpoint
      : (TORSO_HITPOINTS.includes(appState.selectedHitpoint) ? appState.selectedHitpoint : "HitChest");
    appState.selectedHitpoint = targetHp;

    if (isHead) {
      const helmTiers = [[4, 0.6], [6, 0.5], [8, 0.4], [10, 0.3], [12, 0.2]];
      let chosen = helmTiers[helmTiers.length - 1];
      for (const cand of helmTiers) {
        const testLoadout = deepClone(appState.armorLoadout);
        if (!testLoadout.helmet) testLoadout.helmet = { className: "Custom_Helmet", displayName: "Custom Helmet", mod: "Custom", protection: {} };
        if (!testLoadout.helmet.protection) testLoadout.helmet.protection = {};
        testLoadout.helmet.protection[targetHp] = { armor: cand[0], passThrough: cand[1] };
        const ev = evaluateShot(appState.currentRound, testLoadout, targetHp, appState.rangeMeters, getSimOpts());
        if (!ev.penetratedPlate) {
          chosen = cand;
          break;
        }
      }
      document.getElementById("inpHelmHpArmor").value = chosen[0];
      document.getElementById("inpHelmHpPass").value = chosen[1];
      readArmorInputsToState();
    } else {
      const vestTiers = [[8, 0.5], [12, 0.4], [16, 0.3], [20, 0.2], [24, 0.1]];
      let chosen = vestTiers[vestTiers.length - 1];
      for (const cand of vestTiers) {
        const testLoadout = deepClone(appState.armorLoadout);
        if (!testLoadout.vest) testLoadout.vest = { className: "Custom_Vest", displayName: "Custom Vest", mod: "Custom", protection: {} };
        if (!testLoadout.vest.protection) testLoadout.vest.protection = {};
        testLoadout.vest.protection[targetHp] = { armor: cand[0], passThrough: cand[1] };
        const ev = evaluateShot(appState.currentRound, testLoadout, targetHp, appState.rangeMeters, getSimOpts());
        if (!ev.penetratedPlate) {
          chosen = cand;
          break;
        }
      }
      document.getElementById("inpVestHpArmor").value = chosen[0];
      document.getElementById("inpVestHpPass").value = chosen[1];
      readArmorInputsToState();
    }
  });

  document.getElementById("btnPinVestCompare").addEventListener("click", pinCurrentVestLoadout);
  document.getElementById("btnPinActiveVest2").addEventListener("click", pinCurrentVestLoadout);
  document.getElementById("btnClearPinnedVests").addEventListener("click", () => {
    appState.pinnedVests = [];
    updateAllViews();
  });

  // Engagement Range & ACE3 Dummy Controls
  document.getElementById("rangeSlider").addEventListener("input", e => setEngagementRange(parseFloat(e.target.value) || 0));
  document.getElementById("rangeInput").addEventListener("input", e => {
    appState.rangeMeters = Math.max(0, Math.min(2500, parseFloat(e.target.value) || 0));
    document.getElementById("rangeSlider").value = Math.min(1500, appState.rangeMeters);
    updateAllViews();
  });
  document.querySelectorAll(".quick-range-btn").forEach(btn => {
    btn.addEventListener("click", () => setEngagementRange(parseFloat(btn.getAttribute("data-range")) || 0));
  });
  document.getElementById("inpImpactAngle").addEventListener("input", e => {
    appState.impactAngleDeg = Math.max(0, Math.min(80, parseFloat(e.target.value) || 0));
    updateAllViews();
  });

  const aceCanvas = document.getElementById("aceBodyCanvas");
  aceCanvas.addEventListener("click", e => {
    const rect = aceCanvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    let targetHp = "HitChest";
    if (ny < 0.21) targetHp = "HitHead";
    else if (ny < 0.54) {
      if (nx < 0.37) targetHp = "HitLeftArm";
      else if (nx > 0.63) targetHp = "HitRightArm";
      else if (ny < 0.36) targetHp = "HitChest";
      else if (ny < 0.45) targetHp = "HitAbdomen";
      else targetHp = "HitPelvis";
    } else {
      targetHp = nx < 0.5 ? "HitLeftLeg" : "HitRightLeg";
    }
    appState.selectedHitpoint = targetHp;
    syncArmorInputsFromState();
    updateAllViews();
  });

  document.getElementById("btnFireShot").addEventListener("click", () => {
    if (patientState.mode === "preview") resetPatientDummy();
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, getSimOpts());
    fireLiveShotOnPatient(ev, appState.damageThreshold);
    renderAceBodyDummy(ev.bodyPartIndex, appState.damageThreshold);
    updateAceInjuryListDOM(ev.bodyPartIndex, ev, appState.damageThreshold);
  });

  document.getElementById("btnFireBurst").addEventListener("click", () => {
    if (patientState.mode === "preview") resetPatientDummy();
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, getSimOpts());
    for (let i = 0; i < 3; i++) fireLiveShotOnPatient(ev, appState.damageThreshold);
    renderAceBodyDummy(ev.bodyPartIndex, appState.damageThreshold);
    updateAceInjuryListDOM(ev.bodyPartIndex, ev, appState.damageThreshold);
  });

  document.getElementById("btnApplyTourniquet").addEventListener("click", () => {
    const hz = HITZONES.find(h => h.id === appState.selectedHitpoint) || HITZONES[3];
    if (hz.aceIndex >= 2) {
      patientState.mode = "live";
      patientState.tourniquets[hz.aceIndex] = patientState.tourniquets[hz.aceIndex] ? 0 : 1;
      const pk = ACE_BODY_PARTS[hz.aceIndex];
      patientState.bodyPartBloodLoss[hz.aceIndex] = patientState.tourniquets[hz.aceIndex]
        ? 0
        : patientState.openWounds[pk].reduce((s, w) => s + w.bleeding * w.amountOf, 0);
      updateAllViews();
    }
  });

  document.getElementById("btnApplyBandage").addEventListener("click", () => {
    const hz = HITZONES.find(h => h.id === appState.selectedHitpoint) || HITZONES[3];
    const pk = ACE_BODY_PARTS[hz.aceIndex];
    patientState.mode = "live";
    for (const w of patientState.openWounds[pk]) {
      addOrMergeWound(patientState.bandagedWounds[pk], w);
    }
    patientState.openWounds[pk] = [];
    patientState.bodyPartBloodLoss[hz.aceIndex] = 0;
    if (patientState.fractures[hz.aceIndex] === 1) patientState.fractures[hz.aceIndex] = -1;
    updateAllViews();
  });

  document.getElementById("btnResetDummy").addEventListener("click", () => {
    patientState.mode = "preview";
    updateAllViews();
  });

  // Column 3: Tabs, Charts, Draggable Matrix & Config Copy
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(target).classList.add("active");
      renderAllCharts();
    });
  });

  const chkBatch = document.getElementById("chkExportAllSession");
  if (chkBatch) chkBatch.addEventListener("change", renderConfigExporter);
  document.getElementById("chkExportArmorPatch").addEventListener("change", renderConfigExporter);
  document.getElementById("btnCopyConfig").addEventListener("click", () => {
    copyTextWithButtonFeedback("btnCopyConfig", buildExportConfigText());
  });

  bindDraggablePenMatrix();
  bindInteractiveChartEvents();
  window.addEventListener("resize", () => renderAllCharts());

  initAceTextures(() => {
    selectRoundByClass(defaultRound.className);
  });
});
