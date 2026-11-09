// ============================================================================
// AmmoMaster — Arma 3 & ACE3 Ballistics, Armor & Medical Damage Engine
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
  ORGAN_DAMAGE_THRESHOLD: 0.6,
  HEART_HIT_CHANCE: 0.05,
  FRACTURE_DAMAGE_THRESHOLD: 0.50,
  LIMPING_DAMAGE_THRESHOLD: 0.30,
  PAIN_UNCONSCIOUS: 0.50,
  BLOOD_LOSS_KNOCK_OUT_THRESHOLD: 0.50,
  BLOOD_LOSS_RED_THRESHOLD: 0.50,
  DAMAGE_BLUE_THRESHOLD: 0.80,
  DEFAULT_BLOOD_VOLUME: 6.0,
  ARMOR_PENETRABILITY: 0.015,
  DAMAGE_SCALING_FACTOR: 10.0,
  UNSCALED_BASE_ARMOR: 2.0,
  ARMOR_THICKNESS_RHA: [6, 15, 21, 40, 55] // Levels I, II, III, IV, V
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
  { id: "HitHead",      label: "Head (Cranial)", acePart: "head",     aceIndex: 0, gearSlot: "helmet" },
  { id: "HitFace",      label: "Face",           acePart: "head",     aceIndex: 0, gearSlot: "helmet" },
  { id: "HitNeck",      label: "Neck",           acePart: "head",     aceIndex: 0, gearSlot: "both"   },
  { id: "HitChest",     label: "Chest",          acePart: "body",     aceIndex: 1, gearSlot: "vest"   },
  { id: "HitDiaphragm", label: "Diaphragm",      acePart: "body",     aceIndex: 1, gearSlot: "vest"   },
  { id: "HitAbdomen",   label: "Abdomen",        acePart: "body",     aceIndex: 1, gearSlot: "vest"   },
  { id: "HitPelvis",    label: "Pelvis",         acePart: "body",     aceIndex: 1, gearSlot: "vest"   },
  { id: "HitLeftArm",   label: "Left Arm",       acePart: "leftarm",  aceIndex: 2, gearSlot: "vest"   },
  { id: "HitRightArm",  label: "Right Arm",      acePart: "rightarm", aceIndex: 3, gearSlot: "vest"   },
  { id: "HitLeftLeg",   label: "Left Leg",       acePart: "leftleg",  aceIndex: 4, gearSlot: "none"   },
  { id: "HitRightLeg",  label: "Right Leg",      acePart: "rightleg", aceIndex: 5, gearSlot: "none"   }
];

const ACE_BODY_PARTS = ["head", "body", "leftarm", "rightarm", "leftleg", "rightleg"];
const ACE_BODY_LABELS = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];

// Exact SQF linearConversion
function linearConversion(minFrom, maxFrom, val, minTo, maxTo, clip = true) {
  if (Math.abs(maxFrom - minFrom) < 1e-9) return minTo;
  let t = (val - minFrom) / (maxFrom - minFrom);
  if (clip) t = Math.max(0, Math.min(1, t));
  return minTo + t * (maxTo - minTo);
}

// Exact SQF ace_medical_damage_fnc_interpolatePoints
function aceInterpolatePoints(input, points, randomRound = false, deterministic = true) {
  if (!points || points.length === 0) return 0;
  if (points.length === 1) return points[0][1];
  let lowerIdx = points.findIndex(p => p[0] < input);
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
    if (deterministic) {
      return output; // keep expected float in deterministic breakdown
    }
    output = Math.ceil(output - Math.random());
  }
  return output;
}

// ============================================================================
// Ballistics Solver (Vanilla airFriction + ACE3 Advanced Ballistics G1/G7)
// ============================================================================
function computeVelocityAtRange(round, distanceMeters, useAdvBallistics = false) {
  const v0 = Math.max(1, Number(round.initSpeed) || Number(round.typicalSpeed) || 800);
  if (distanceMeters <= 0) return { velocity: v0, tof: 0 };

  const af = Number(round.airFriction) || -0.001;
  // Standard Arma 3 engine: dv/dt = af * v^2 => v(x) = v0 * exp(af * x)
  if (!useAdvBallistics || !round.ACE_ballisticCoefficients || !round.ACE_ballisticCoefficients.length) {
    const v = v0 * Math.exp(af * distanceMeters);
    const tof = Math.abs(af) > 1e-9 ? (Math.exp(-af * distanceMeters) - 1) / (-af * v0) : distanceMeters / v0;
    return { velocity: Math.max(1, v), tof };
  }

  // ACE3 Advanced Ballistics G1/G7 approximation using retardation integration
  const bc = Math.max(0.05, Number(round.ACE_ballisticCoefficients[0]) || 0.3);
  const dragModel = Number(round.ACE_dragModel) || 1;
  const speedOfSound = 340.3; // 15C ISA
  let x = 0;
  let v = v0;
  let t = 0;
  const dx = Math.min(2.0, Math.max(0.5, distanceMeters / 250));

  while (x < distanceMeters && v > 10) {
    const step = Math.min(dx, distanceMeters - x);
    const mach = v / speedOfSound;
    // Standard G1 / G7 drag coefficient curve approximation
    let cd;
    if (dragModel === 7) {
      if (mach < 0.8) cd = 0.12;
      else if (mach < 1.05) cd = 0.12 + (mach - 0.8) * 1.1;
      else cd = 0.395 * Math.pow(mach, -0.58);
    } else {
      if (mach < 0.8) cd = 0.22;
      else if (mach < 1.1) cd = 0.22 + (mach - 0.8) * 1.45;
      else cd = 0.655 * Math.pow(mach, -0.45);
    }
    // Retardation proportional to cd / bc (calibrated to ACE3 airFriction & ICAO ISA)
    const k = (cd / bc) * 0.00082;
    const dv = -k * v * step;
    const vMid = Math.max(10, v + 0.5 * dv);
    t += step / vMid;
    v = Math.max(10, v + dv);
    x += step;
  }
  return { velocity: v, tof: t };
}

// ============================================================================
// Armor & Hitpoint Resolution (Vanilla + ACE3 #9063 Scaling)
// ============================================================================
function getEquipmentProtectionForHitpoint(gearProtection, hitpoint) {
  if (!gearProtection) return { armor: 0, passThrough: 1, covered: false };
  let entry = gearProtection[hitpoint];
  // Vests in Arma 3 often define HitArms which protects HitLeftArm and HitRightArm
  if (!entry && (hitpoint === "HitLeftArm" || hitpoint === "HitRightArm")) {
    entry = gearProtection["HitArms"] || gearProtection["HitHands"];
  }
  if (!entry && (hitpoint === "HitLeftLeg" || hitpoint === "HitRightLeg")) {
    entry = gearProtection["HitLegs"];
  }
  if (!entry) return { armor: 0, passThrough: 1, covered: false };
  const armor = Number(entry.armor) || 0;
  const passThrough = Math.min(1, Math.max(0.1, entry.passThrough !== undefined ? Number(entry.passThrough) : 1));
  return { armor, passThrough, covered: armor > 0 };
}

// Exact port of ace_medical_engine_fnc_getItemArmor
function calcAceItemArmor(armor, passThrough, itemType) {
  // itemType: 'uniform' | 'vest' | 'helmet'
  if (itemType === "uniform" || armor <= 0) return armor;
  const armorLevelStep = itemType === "helmet" ? 2 : 4;
  if (armor > armorLevelStep * 6) {
    const passThroughEffect = itemType === "vest" ? 0.6 : 1.0;
    const pt = Math.min(1, Math.max(0.1, passThrough));
    // SQF `log` is base-10 logarithm!
    return Math.log10(armor / Math.pow(pt, passThroughEffect)) * 10;
  }
  return armor;
}

function resolveHitpointArmor(armorLoadout, hitpoint) {
  const uni = armorLoadout.uniform;
  const vest = armorLoadout.vest;
  const helmet = armorLoadout.helmet;

  const unitBaseArmor = Math.max(0.1, Number(uni.armor) || 2.0);
  const unitStructural = Math.max(0.1, Number(uni.armorStructural) || 4.0);
  const hpEntry = (uni.hitpoints && uni.hitpoints[hitpoint]) || { armor: 1.0, passThrough: 1.0 };
  const hpArmorMult = Math.max(1.0, Number(hpEntry.armor) || 1.0);
  const hpBasePassThrough = Math.min(1.0, Math.max(0.1, Number(hpEntry.passThrough) || 1.0));

  const uniformArmor = unitBaseArmor * hpArmorMult;

  const vestProt = getEquipmentProtectionForHitpoint(vest ? vest.protection : null, hitpoint);
  const helmProt = getEquipmentProtectionForHitpoint(helmet ? helmet.protection : null, hitpoint);

  const vanillaVestArmor = vestProt.armor;
  const vanillaHelmArmor = helmProt.armor;
  const vanillaTotalArmor = Math.max(1.0, uniformArmor + vanillaVestArmor + vanillaHelmArmor);

  const aceVestArmor = calcAceItemArmor(vestProt.armor, vestProt.passThrough, "vest");
  const aceHelmArmor = calcAceItemArmor(helmet ? helmProt.armor : 0, helmProt.passThrough, "helmet");
  const aceTotalArmor = Math.max(1.0, uniformArmor + aceVestArmor + aceHelmArmor);

  // Effective passThrough for vanilla structural damage calculation
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
    helmArmorRaw: vanillaHelmArmor,
    helmPassThrough: helmProt.passThrough,
    helmArmorAce: aceHelmArmor,
    vanillaTotalArmor,
    aceTotalArmor,
    effectivePassThrough
  };
}

// ============================================================================
// Full Shot Evaluation (Base Arma 3 Engine + ACE3 Medical Damage Pipeline)
// ============================================================================
function evaluateShot(round, armorLoadout, hitpoint, rangeMeters, options = {}) {
  const impactAngleDeg = Number(options.impactAngleDeg) || 0;
  const useAdvBallistics = Boolean(options.useAdvBallistics);
  const alternateArmorPen = options.alternateArmorPen !== undefined ? Boolean(options.alternateArmorPen) : true;
  const damageThreshold = Number(options.damageThreshold) || 1.0;

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
  // In Arma 3 (\a3\Data_F\Penetration\armour_plate.bisurf) & ACE3 (ARMOR_PENETRABILITY = 0.015):
  // RHA penetration (mm) = impactSpeed (m/s) * caliber * 0.015
  const caliber = Math.max(0.01, Number(round.caliber) || 1.0);
  const penFactor = caliber * ACE_CONST.ARMOR_PENETRABILITY; // mm per (m/s)
  const rhaPenMM = effectiveSpeed * penFactor;
  const concretePenMM = rhaPenMM * (80 / 15);
  const meatPenMM = rhaPenMM * (250 / 15);
  const isRicochet = impactAngleDeg > (90 - (Number(round.deflecting) || 15));

  // 3. Base Arma 3 Raw Damage & Hitpoint Damage
  const hit = Math.max(0.1, Number(round.hit) || 8.0);
  const typicalSpeed = Math.max(1.0, Number(round.typicalSpeed) || Number(round.initSpeed) || 800);
  const explosive = Math.min(1, Math.max(0, Number(round.explosive) || 0));

  // Arma 3 engine kinetic scaling: hit * (v / typicalSpeed)
  const speedRatio = effectiveSpeed / typicalSpeed;
  const rawDamage = hit * (1 - explosive) * speedRatio + hit * explosive;

  const armorInfo = resolveHitpointArmor(armorLoadout, hitpoint);

  // Vanilla engine damage to this hitpoint:
  const vanillaHitpointDamage = rawDamage / armorInfo.vanillaTotalArmor;
  const vanillaStructuralDamage = (rawDamage * armorInfo.effectivePassThrough) / (armorInfo.unitBaseArmor * armorInfo.unitStructural);
  const vanillaIsLethal = vanillaHitpointDamage >= 1.0 && armorInfo.hpBasePassThrough >= 0.5 || vanillaStructuralDamage >= 1.0;

  // 4. ACE3 handleDamage & woundsHandlerArmorPenetration
  // Note: in ACE3 fnc_handleDamage, _newDamage comes from engine (rawDamage / vanillaTotalArmor),
  // and _realDamage = _newDamage * _aceArmor. When armor isn't over-capped (>24 vest / >12 helmet),
  // _aceArmor == _vanillaTotalArmor so _realDamage == rawDamage!
  const engineDamage = vanillaHitpointDamage;
  const aceRealDamage = engineDamage * armorInfo.aceTotalArmor;

  const dmgTypeKey = (round.ACE_damageType && ACE_DAMAGE_TYPES[round.ACE_damageType]) ? round.ACE_damageType : "bullet";
  const dmgTypeCfg = ACE_DAMAGE_TYPES[dmgTypeKey];

  const armorLevelStep = bodyPart === "body" ? 4 : 2;
  const netArmor = (aceRealDamage / Math.max(1e-6, engineDamage)) - ACE_CONST.UNSCALED_BASE_ARMOR;

  let aceArmorLevel = 0; // 0 = No Armor / Base, 1..5 = Level I..V
  let aceArmorThicknessMM = 0;
  let aceFinalDamage = engineDamage;
  let usedArmorPenHandler = false;

  if (alternateArmorPen && dmgTypeCfg.armorPenetrationHandler && netArmor > armorLevelStep) {
    usedArmorPenHandler = true;
    const levelIdx = Math.max(0, Math.min(4, Math.round((netArmor - (armorLevelStep * 2)) / armorLevelStep)));
    aceArmorLevel = levelIdx + 1; // 1..5 (Level I..V)
    aceArmorThicknessMM = ACE_CONST.ARMOR_THICKNESS_RHA[levelIdx];
    const aceImpactSpeed = (aceRealDamage / hit) * Math.max(typicalSpeed, 1);
    const acePenDepth = penFactor * aceImpactSpeed; // in RHA units matching [6, 15, 21, 40, 55]
    const penRatio = Math.min(1.0, acePenDepth / aceArmorThicknessMM);
    aceFinalDamage = (hit * penRatio) / ACE_CONST.DAMAGE_SCALING_FACTOR;
  }

  // 5. ACE3 woundsHandlerBase
  const nWoundsExpected = aceInterpolatePoints(aceFinalDamage, dmgTypeCfg.thresholds, true, true);
  const nWoundsInt = Math.max(1, Math.round(nWoundsExpected));
  const dmgPerWound = aceFinalDamage / nWoundsInt;

  // Calculate wound type weights at dmgPerWound
  let totalWeight = 0;
  const woundBreakdowns = [];

  for (const wSpec of dmgTypeCfg.wounds) {
    const weight = Math.max(0, aceInterpolatePoints(dmgPerWound, wSpec.weighting, false, true));
    if (weight > 0) {
      totalWeight += weight;
      const wBase = ACE_WOUND_TYPES[wSpec.type];
      const wDmg = dmgPerWound * wSpec.dmgMult; // mean (random [0.9, 1, 1.1] = 1.0)
      const woundSize = linearConversion(0.1, 2.0, wDmg * wSpec.sizeMult, Math.pow(0.5, 3), 1.0, true);
      const categoryIdx = Math.max(0, Math.min(2, 2 - Math.floor(Math.log(woundSize) / Math.log(0.5))));
      const categoryName = ["Minor", "Medium", "Large"][categoryIdx];
      const pain = woundSize * wSpec.painMult * wBase.pain;
      const bleeding = woundSize * wSpec.bleedMult * wBase.bleeding;

      woundBreakdowns.push({
        type: wSpec.type,
        displayName: `${categoryName} ${wBase.name}`,
        categoryIdx,
        categoryName,
        weight,
        probability: 0,
        woundDamage: wDmg,
        woundSize,
        pain,
        bleeding,
        causeLimping: Boolean(wBase.causeLimping && bodyPartIndex > 3 && wDmg > ACE_CONST.LIMPING_DAMAGE_THRESHOLD),
        causeFracture: Boolean(wBase.causeFracture && bodyPartIndex > 1 && wDmg > ACE_CONST.FRACTURE_DAMAGE_THRESHOLD)
      });
    }
  }

  for (const wb of woundBreakdowns) {
    wb.probability = totalWeight > 0 ? wb.weight / totalWeight : 0;
  }

  // Expected values per shot
  let expectedBleedRate = 0;
  let expectedPain = 0;
  let expectedWoundDamage = 0;
  for (const wb of woundBreakdowns) {
    expectedBleedRate += wb.probability * wb.bleeding * nWoundsInt;
    expectedPain += wb.probability * wb.pain * nWoundsInt;
    expectedWoundDamage += wb.probability * wb.woundDamage * nWoundsInt;
  }

  const penetratedPlate = dmgPerWound > ACE_CONST.PENETRATION_THRESHOLD;
  const isCriticalDamage = bodyPart === "head" || (bodyPart === "body" && expectedWoundDamage > ACE_CONST.PENETRATION_THRESHOLD);

  // Fatal injury probabilities (single shot)
  let vitalFatalProb = 0;
  if (bodyPartIndex === 0 && expectedWoundDamage >= ACE_CONST.HEAD_DAMAGE_THRESHOLD) {
    vitalFatalProb = 1.0;
  } else if (bodyPartIndex === 1 && expectedWoundDamage >= ACE_CONST.ORGAN_DAMAGE_THRESHOLD) {
    vitalFatalProb = 1 - Math.pow(1 - ACE_CONST.HEART_HIT_CHANCE, nWoundsInt);
  }

  // Trauma threshold & Weibull fatal probability
  const partTraumaThreshold = bodyPartIndex === 0
    ? 1.25 * damageThreshold
    : (bodyPartIndex === 1 ? 1.5 * damageThreshold : 5.0 * damageThreshold);
  const excessVitalDamage = (bodyPartIndex <= 1) ? Math.max(0, expectedWoundDamage - partTraumaThreshold) : 0;
  const weibullFatalProb = excessVitalDamage > 0
    ? 1 - Math.exp(-Math.pow(excessVitalDamage / FATAL_SUM_DAMAGE_WEIBULL_L, FATAL_SUM_DAMAGE_WEIBULL_K))
    : 0;

  const totalFatalProb = 1 - (1 - vitalFatalProb) * (1 - weibullFatalProb);
  const shotsToGuaranteedTraumaKill = expectedWoundDamage > 0
    ? Math.ceil((partTraumaThreshold + FATAL_SUM_DAMAGE_WEIBULL_L * 1.15) / expectedWoundDamage)
    : 999;

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
    engineDamage,
    aceRealDamage,
    netArmor,
    usedArmorPenHandler,
    aceArmorLevel,
    aceArmorThicknessMM,
    aceFinalDamage,
    nWoundsExpected,
    nWoundsInt,
    dmgPerWound,
    penetratedPlate,
    isCriticalDamage,
    woundBreakdowns,
    expectedBleedRate,
    expectedPain,
    expectedWoundDamage,
    vitalFatalProb,
    weibullFatalProb,
    totalFatalProb,
    partTraumaThreshold,
    shotsToGuaranteedTraumaKill
  };
}

// ============================================================================
// ACE3 Medical Dummy Canvas Renderer & Patient State
// ============================================================================
const patientState = {
  mode: "preview", // "preview" (auto-updates from current single shot) or "live" (accumulates shots)
  shotsFired: 0,
  bodyPartDamage: [0, 0, 0, 0, 0, 0],
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
  patientState.bodyPartBloodLoss[pIdx] = shotResult.expectedBleedRate;
  patientState.pain = Math.min(1.0, shotResult.expectedPain);

  for (const wb of shotResult.woundBreakdowns) {
    const amt = wb.probability * shotResult.nWoundsInt;
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
  if (patientState.isFatal || shotResult.isCriticalDamage || patientState.pain > ACE_CONST.PAIN_UNCONSCIOUS) {
    patientState.isUnconscious = true;
  }
}

function fireLiveShotOnPatient(shotResult, damageThreshold = 1.0) {
  patientState.mode = "live";
  patientState.shotsFired += 1;
  const pIdx = shotResult.bodyPartIndex;
  const partKey = ACE_BODY_PARTS[pIdx];

  // Sample number of wounds using ACE's stochastic rounding
  const nWounds = Math.max(1, Math.ceil(shotResult.nWoundsExpected - Math.random()));

  for (let i = 0; i < nWounds; i++) {
    if (shotResult.woundBreakdowns.length === 0) break;
    // Weighted random selection
    let r = Math.random();
    let chosen = shotResult.woundBreakdowns[shotResult.woundBreakdowns.length - 1];
    for (const wb of shotResult.woundBreakdowns) {
      if (r <= wb.probability) {
        chosen = wb;
        break;
      }
      r -= wb.probability;
    }
    const variance = 0.9 + Math.random() * 0.2;
    const wDmg = chosen.woundDamage * variance;
    patientState.bodyPartDamage[pIdx] += wDmg;
    patientState.pain = Math.min(1.0, patientState.pain + chosen.pain * variance);

    addOrMergeWound(patientState.openWounds[partKey], {
      key: `${chosen.type}_${chosen.categoryIdx}`,
      displayName: chosen.displayName,
      amountOf: 1,
      bleeding: chosen.bleeding * variance,
      damage: wDmg
    });

    if (chosen.causeFracture) patientState.fractures[pIdx] = 1;
    if (chosen.causeLimping) patientState.limping = true;

    // Check vital organ lethality
    if (pIdx === 0 && wDmg >= ACE_CONST.HEAD_DAMAGE_THRESHOLD) {
      patientState.isFatal = true;
      patientState.fatalReason = "Lethal Headshot (>= 1.0)";
    } else if (pIdx === 1 && wDmg >= ACE_CONST.ORGAN_DAMAGE_THRESHOLD && Math.random() < ACE_CONST.HEART_HIT_CHANCE) {
      patientState.isFatal = true;
      patientState.fatalReason = "Lethal Heart Shot (5% roll)";
    }
  }

  // Recompute per-part blood loss
  for (let idx = 0; idx < 6; idx++) {
    const pk = ACE_BODY_PARTS[idx];
    if (patientState.tourniquets[idx] > 0) {
      patientState.bodyPartBloodLoss[idx] = 0;
    } else {
      patientState.bodyPartBloodLoss[idx] = patientState.openWounds[pk].reduce((s, w) => s + w.bleeding * w.amountOf, 0);
    }
  }

  // Check Weibull sum of trauma
  const headThresh = 1.25 * damageThreshold;
  const bodyThresh = 1.50 * damageThreshold;
  const vitalDamage = Math.max(0, patientState.bodyPartDamage[0] - headThresh) +
                      Math.max(0, patientState.bodyPartDamage[1] - bodyThresh);
  if (vitalDamage > 0) {
    const pFatal = 1 - Math.exp(-Math.pow(vitalDamage / FATAL_SUM_DAMAGE_WEIBULL_L, FATAL_SUM_DAMAGE_WEIBULL_K));
    if (Math.random() < pFatal) {
      patientState.isFatal = true;
      patientState.fatalReason = `Fatal Trauma Sum (Weibull P=${(pFatal * 100).toFixed(0)}%)`;
    }
  }

  if (patientState.isFatal || patientState.pain > ACE_CONST.PAIN_UNCONSCIOUS || shotResult.isCriticalDamage) {
    patientState.isUnconscious = true;
  }
}

// ============================================================================
// ACE3 Canvas Texture Loader & Compositor
// ============================================================================
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

  // Multiply RGB by color
  offscreenTintCtx.globalCompositeOperation = "multiply";
  const r = Math.round(rgba[0] * 255);
  const g = Math.round(rgba[1] * 255);
  const b = Math.round(rgba[2] * 255);
  offscreenTintCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  offscreenTintCtx.fillRect(0, 0, w, h);

  // Restore original alpha mask
  offscreenTintCtx.globalCompositeOperation = "destination-in";
  offscreenTintCtx.drawImage(img, 0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = Math.min(1, rgba[3]);
  ctx.drawImage(offscreenTintCanvas, 0, 0, w, h);
  // In ACE3 PAA, body part alpha is ~0.30 so musculature shows through;
  // drawing a second pass when colored makes the blue/red damage stand out vividly on dark UI
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

  // 1. Background musculature
  if (loadedAceTextures["background"]) {
    ctx.drawImage(loadedAceTextures["background"], 0, 0, w, h);
  }

  // 2. Body part overlays (Head, Torso, ArmLeft, ArmRight, LegLeft, LegRight)
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

    // Bone fracture overlay
    if (pc.bone && patientState.fractures[pc.idx] !== 0) {
      const boneColor = patientState.fractures[pc.idx] === 1 ? [1, 0.1, 0.1, 1] : [0.2, 0.4, 1, 1];
      drawTintedTexture(ctx, pc.bone, boneColor, 1.5);
    }

    // Tourniquet overlay
    if (pc.tq && patientState.tourniquets[pc.idx] > 0) {
      drawTintedTexture(ctx, pc.tq, [0.1, 0.35, 1.0, 1], 1.5);
    }

    // Selected white outline
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
  const totalBleed = patientState.bodyPartBloodLoss.reduce((a, b) => a + b, 0);
  const koThresh = ACE_CONST.BLOOD_LOSS_KNOCK_OUT_THRESHOLD; // 0.5

  // 1. Overall Bleeding Status (exact ace_medical_gui_fnc_updateInjuryList thresholds)
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
    const mlPerSec = totalBleed * 50; // ~3.0L / 60s cardiac scaling in ACE
    const secToBleedout = mlPerSec > 0 ? Math.round(3000 / mlPerSec) : 9999;
    entries.push({ text: `Bleed Rate: ${totalBleed.toFixed(3)} CO (~${secToBleedout}s to fatal)`, color: "#fca5a5" });
  } else {
    entries.push({ text: "No bleeding", color: "rgba(255,255,255,0.35)" });
  }

  // 2. Pain Status
  const pain = patientState.pain;
  if (pain > 0.001) {
    if (pain > ACE_CONST.PAIN_UNCONSCIOUS) {
      entries.push({ text: `In severe pain (${(pain * 100).toFixed(0)}%)`, color: "#f87171" });
    } else if (pain > ACE_CONST.PAIN_UNCONSCIOUS / 5) {
      entries.push({ text: `In pain (${(pain * 100).toFixed(0)}%)`, color: "#fde047" });
    } else {
      entries.push({ text: `In mild pain (${(pain * 100).toFixed(0)}%)`, color: "#fef08a" });
    }
  } else {
    entries.push({ text: "No pain", color: "rgba(255,255,255,0.35)" });
  }

  // 3. Selected Body Part Header
  const partName = ACE_BODY_LABELS[selectedPartIndex] || "Torso";
  const partKey = ACE_BODY_PARTS[selectedPartIndex] || "body";
  const partDmg = patientState.bodyPartDamage[selectedPartIndex] || 0;
  entries.push({ text: `── ${partName.toUpperCase()} (Trauma: ${partDmg.toFixed(2)}) ──`, color: "#eab308", bold: true });

  // 4. Tourniquet & Fracture Status
  if (patientState.tourniquets[selectedPartIndex] > 0) {
    entries.push({ text: "[T] Tourniquet Applied", color: "#f59e0b" });
  }
  if (patientState.fractures[selectedPartIndex] === 1) {
    entries.push({ text: "Fractured Bone (Limb)", color: "#ef4444", bold: true });
  } else if (patientState.fractures[selectedPartIndex] === -1) {
    entries.push({ text: "[S] Splint Applied", color: "#60a5fa" });
  }
  if (selectedPartIndex >= 4 && patientState.limping) {
    entries.push({ text: "Limping (> 0.30 leg damage)", color: "#fb923c" });
  }

  // 5. Open & Bandaged Wounds on Selected Part
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

  // Triage bar
  if (patientState.isFatal) {
    triageEl.style.background = "#991b1b";
    triageEl.style.color = "#fecaca";
    triageEl.textContent = `BLACK / DEAD — ${patientState.fatalReason}`;
  } else if (patientState.isUnconscious || totalBleed >= koThresh * 0.5) {
    triageEl.style.background = "#dc2626";
    triageEl.style.color = "#fff";
    triageEl.textContent = `IMMEDIATE (T1) — ${patientState.isUnconscious ? "UNCONSCIOUS / CRITICAL" : "SEVERE HEMORRHAGE"}`;
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
// Application State, Charts, Real-World Tuner & Config Exporter
// ============================================================================
const appState = {
  selectedHitpoint: "HitChest",
  rangeMeters: 100,
  impactAngleDeg: 0,
  useAdvBallistics: false,
  alternateArmorPen: true,
  damageThreshold: 1.0,
  originalRound: null,
  currentRound: null,
  armorLoadout: {
    uniform: null,
    vest: null,
    helmet: null
  }
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// Interactive Range Charts (Canvas)
// ============================================================================
function drawRangeChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(300, Math.floor(rect.width || 420));
  const h = Math.max(170, Math.floor(rect.height || 195));
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const pad = { left: 46, right: 16, top: 14, bottom: 26 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const maxRange = config.maxRange || 1200;
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

  // Grid lines
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.font = "10px 'JetBrains Mono', monospace";
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
    ctx.fillText(`${r}m`, px, h - 8);
  }

  // Horizontal threshold reference lines
  if (config.thresholds) {
    for (const th of config.thresholds) {
      if (th.value < yMin || th.value > yMax) continue;
      const py = yToPx(th.value);
      ctx.save();
      ctx.strokeStyle = th.color || "#ef4444";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();
      ctx.fillStyle = th.color || "#ef4444";
      ctx.textAlign = "right";
      ctx.fillText(th.label, w - pad.right - 4, py - 4);
      ctx.restore();
    }
  }

  // Current selected range vertical cursor
  if (appState.rangeMeters <= maxRange) {
    const cx = xToPx(appState.rangeMeters);
    ctx.save();
    ctx.strokeStyle = "rgba(234, 179, 8, 0.65)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cx, pad.top);
    ctx.lineTo(cx, h - pad.bottom);
    ctx.stroke();
    ctx.restore();
  }

  // Series lines
  for (const s of config.series) {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
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
}

function renderAllCharts() {
  const maxR = 1200;
  const step = 25;
  const velPts = [];
  const origVelPts = [];
  const rhaPts = [];
  const origRhaPts = [];
  const aceDmgPts = [];
  const vanDmgPts = [];
  const bleedPts = [];

  for (let r = 0; r <= maxR; r += step) {
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, r, {
      impactAngleDeg: appState.impactAngleDeg,
      useAdvBallistics: appState.useAdvBallistics,
      alternateArmorPen: appState.alternateArmorPen,
      damageThreshold: appState.damageThreshold
    });
    velPts.push({ x: r, y: ev.effectiveSpeed });
    rhaPts.push({ x: r, y: ev.rhaPenMM });
    aceDmgPts.push({ x: r, y: ev.dmgPerWound });
    vanDmgPts.push({ x: r, y: ev.vanillaHitpointDamage });
    bleedPts.push({ x: r, y: ev.expectedBleedRate });

    if (appState.originalRound) {
      const origEv = evaluateShot(appState.originalRound, appState.armorLoadout, appState.selectedHitpoint, r, {
        impactAngleDeg: appState.impactAngleDeg,
        useAdvBallistics: appState.useAdvBallistics,
        alternateArmorPen: appState.alternateArmorPen,
        damageThreshold: appState.damageThreshold
      });
      origVelPts.push({ x: r, y: origEv.effectiveSpeed });
      origRhaPts.push({ x: r, y: origEv.rhaPenMM });
    }
  }

  const curEv = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, {
    impactAngleDeg: appState.impactAngleDeg,
    useAdvBallistics: appState.useAdvBallistics,
    alternateArmorPen: appState.alternateArmorPen,
    damageThreshold: appState.damageThreshold
  });

  // 1. Velocity vs Range
  drawRangeChart("chartVelocity", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(900, Number(appState.currentRound.initSpeed) * 1.05),
    thresholds: [{ value: 340.3, label: "Mach 1 (340 m/s)", color: "#64748b" }],
    series: [
      { points: origVelPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: velPts, color: "#38bdf8" }
    ]
  });

  // 2. RHA Penetration vs ACE Armor Thickness
  const rhaThresholds = [];
  if (curEv.aceArmorThicknessMM > 0) {
    rhaThresholds.push({
      value: curEv.aceArmorThicknessMM,
      label: `Target Armor Level ${curEv.aceArmorLevel} (${curEv.aceArmorThicknessMM} mm RHAe)`,
      color: "#f97316"
    });
  }
  drawRangeChart("chartPenetration", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(30, rhaPts[0].y * 1.15, curEv.aceArmorThicknessMM * 1.25),
    thresholds: rhaThresholds,
    series: [
      { points: origRhaPts, color: "rgba(148, 163, 184, 0.45)", dashed: true },
      { points: rhaPts, color: "#eab308" }
    ]
  });

  // 3. ACE Wound Damage vs Penetration & Fatal Thresholds
  const dmgThresholds = [
    { value: ACE_CONST.PENETRATION_THRESHOLD, label: "Plate Penetrate / VelocityWound (0.35)", color: "#22c55e" }
  ];
  if (curEv.bodyPartIndex === 0) {
    dmgThresholds.push({ value: ACE_CONST.HEAD_DAMAGE_THRESHOLD, label: "Instant Fatal Headshot (1.00)", color: "#ef4444" });
  } else if (curEv.bodyPartIndex === 1) {
    dmgThresholds.push({ value: ACE_CONST.ORGAN_DAMAGE_THRESHOLD, label: "Vital Organ / Heart Threshold (0.60)", color: "#f97316" });
    dmgThresholds.push({ value: curEv.partTraumaThreshold, label: `Torso Trauma Threshold (${curEv.partTraumaThreshold.toFixed(2)})`, color: "#ef4444" });
  } else {
    dmgThresholds.push({ value: ACE_CONST.FRACTURE_DAMAGE_THRESHOLD, label: "Limb Fracture Threshold (0.50)", color: "#ef4444" });
  }

  drawRangeChart("chartAceDamage", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(1.6, aceDmgPts[0].y * 1.15),
    thresholds: dmgThresholds,
    series: [
      { points: vanDmgPts, color: "rgba(168, 85, 247, 0.55)", dashed: true },
      { points: aceDmgPts, color: "#ef4444" }
    ]
  });

  // 4. Expected Bleeding Rate vs Range
  drawRangeChart("chartBleed", {
    maxRange: maxR,
    yMin: 0,
    yMax: Math.max(0.25, bleedPts[0].y * 1.2),
    thresholds: [
      { value: 0.25, label: "Severe Bleed (0.25 CO)", color: "#f97316" },
      { value: 0.50, label: "Massive / Knock-Out Bleed (0.50 CO)", color: "#ef4444" }
    ],
    series: [
      { points: bleedPts, color: "#f43f5e" }
    ]
  });
}

// ============================================================================
// Real-World Performance Tuner & Reference Cartridge Library
// ============================================================================
const REAL_WORLD_CARTRIDGE_LIBRARY = [
  // PDW & Pistol
  {
    id: "ss190_p90",
    group: "PDW & Pistol",
    name: "5.7x28mm FN SS190 Duty AP — P90 10.4\" bbl (2.0g / 31gr @ 715 m/s)",
    massGrams: 2.00,
    diamMM: 5.70,
    muzzleVel: 715,
    bc: 0.162,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "2",
    maxPenDist: 200
  },
  {
    id: "ss190_57pistol",
    group: "PDW & Pistol",
    name: "5.7x28mm FN SS190 Duty AP — Five-seveN 4.8\" bbl (2.0g / 31gr @ 650 m/s)",
    massGrams: 2.00,
    diamMM: 5.70,
    muzzleVel: 650,
    bc: 0.162,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "2",
    maxPenDist: 100
  },
  {
    id: "t6b_p90",
    group: "PDW & Pistol",
    name: "5.7x28mm Elite Ammo T6B Solid Copper AP — P90 10.4\" bbl (1.81g / 28gr @ 930 m/s)",
    massGrams: 1.81,
    diamMM: 5.70,
    muzzleVel: 930,
    bc: 0.139,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "3",
    maxPenDist: 55
  },
  {
    id: "sb193_p90",
    group: "PDW & Pistol",
    name: "5.7x28mm FN SB193 Subsonic — P90 10.4\" bbl (3.6g / 55gr @ 305 m/s)",
    massGrams: 3.60,
    diamMM: 5.70,
    muzzleVel: 305,
    bc: 0.251,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "1",
    maxPenDist: 50
  },
  {
    id: "dm11_mp7",
    group: "PDW & Pistol",
    name: "4.6x30mm HK DM11 Penetrator — MP7 7.1\" bbl (2.0g / 31gr @ 720 m/s)",
    massGrams: 2.00,
    diamMM: 4.60,
    muzzleVel: 720,
    bc: 0.141,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "2",
    maxPenDist: 200
  },
  {
    id: "m882_9x19",
    group: "PDW & Pistol",
    name: "9x19mm NATO M882 Ball — Service Pistol (8.04g / 124gr @ 385 m/s)",
    massGrams: 8.04,
    diamMM: 9.02,
    muzzleVel: 385,
    bc: 0.145,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "1",
    maxPenDist: 50
  },
  {
    id: "7n21_9x19",
    group: "PDW & Pistol",
    name: "9x19mm 7N21 +P+ Hardened Steel AP (5.3g / 82gr @ 460 m/s)",
    massGrams: 5.30,
    diamMM: 9.02,
    muzzleVel: 460,
    bc: 0.135,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "2",
    maxPenDist: 60
  },
  {
    id: "m1911_45acp",
    group: "PDW & Pistol",
    name: ".45 ACP M1911 Ball — 5\" bbl (14.9g / 230gr @ 253 m/s)",
    massGrams: 14.90,
    diamMM: 11.48,
    muzzleVel: 253,
    bc: 0.195,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "0",
    maxPenDist: 0
  },
  // Intermediate Rifle
  {
    id: "m855_556",
    group: "Intermediate Rifle",
    name: "5.56x45mm NATO M855 Green Tip — 14.5\" M4 (4.02g / 62gr @ 884 m/s)",
    massGrams: 4.02,
    diamMM: 5.70,
    muzzleVel: 884,
    bc: 0.304,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "3",
    maxPenDist: 150
  },
  {
    id: "m855a1_556",
    group: "Intermediate Rifle",
    name: "5.56x45mm US Army M855A1 EPR — 14.5\" M4A1 (4.02g / 62gr @ 910 m/s)",
    massGrams: 4.02,
    diamMM: 5.70,
    muzzleVel: 910,
    bc: 0.307,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "3",
    maxPenDist: 350
  },
  {
    id: "mk262_556",
    group: "Intermediate Rifle",
    name: "5.56x45mm Mk 262 Mod 1 OTM — 18\" SPR (4.99g / 77gr @ 838 m/s)",
    massGrams: 4.99,
    diamMM: 5.70,
    muzzleVel: 838,
    bc: 0.372,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "2",
    maxPenDist: 400
  },
  {
    id: "m995_556",
    group: "Intermediate Rifle",
    name: "5.56x45mm M995 Tungsten Carbide AP — 14.5\" (3.37g / 52gr @ 960 m/s)",
    massGrams: 3.37,
    diamMM: 5.70,
    muzzleVel: 960,
    bc: 0.245,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "4",
    maxPenDist: 120
  },
  {
    id: "7n6m_545",
    group: "Intermediate Rifle",
    name: "5.45x39mm 7N6M Mild Steel Core — AK-74M (3.43g / 53gr @ 880 m/s)",
    massGrams: 3.43,
    diamMM: 5.60,
    muzzleVel: 880,
    bc: 0.329,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "2",
    maxPenDist: 350
  },
  {
    id: "7n22_545",
    group: "Intermediate Rifle",
    name: "5.45x39mm 7N22 BP Hardened Steel AP — AK-74M (3.68g / 57gr @ 890 m/s)",
    massGrams: 3.68,
    diamMM: 5.60,
    muzzleVel: 890,
    bc: 0.335,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "3",
    maxPenDist: 250
  },
  {
    id: "7n39_545",
    group: "Intermediate Rifle",
    name: "5.45x39mm 7N39 Igolnik Tungsten AP — AK-12 (3.90g / 60gr @ 850 m/s)",
    massGrams: 3.90,
    diamMM: 5.60,
    muzzleVel: 850,
    bc: 0.345,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "4",
    maxPenDist: 150
  },
  {
    id: "blk_110_sup",
    group: "Intermediate Rifle",
    name: ".300 AAC Blackout 110gr Supersonic — 9\" bbl (7.13g / 110gr @ 670 m/s)",
    massGrams: 7.13,
    diamMM: 7.82,
    muzzleVel: 670,
    bc: 0.290,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "3",
    maxPenDist: 60
  },
  {
    id: "blk_220_sub",
    group: "Intermediate Rifle",
    name: ".300 AAC Blackout 220gr Subsonic OTM — 9\" bbl (14.26g / 220gr @ 310 m/s)",
    massGrams: 14.26,
    diamMM: 7.82,
    muzzleVel: 310,
    bc: 0.608,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "2",
    maxPenDist: 50
  },
  {
    id: "m43_762x39",
    group: "Intermediate Rifle",
    name: "7.62x39mm 57-N-231 PS Mild Steel — AKM (7.90g / 122gr @ 718 m/s)",
    massGrams: 7.90,
    diamMM: 7.92,
    muzzleVel: 718,
    bc: 0.275,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "3",
    maxPenDist: 100
  },
  {
    id: "7n23_762x39",
    group: "Intermediate Rifle",
    name: "7.62x39mm 7N23 BP Hardened Steel AP — AK-103 (7.90g / 122gr @ 730 m/s)",
    massGrams: 7.90,
    diamMM: 7.92,
    muzzleVel: 730,
    bc: 0.285,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "3",
    maxPenDist: 300
  },
  // Full-Power / Next-Gen / Sniper
  {
    id: "xm1186_68x51",
    group: "Full-Power & Sniper",
    name: "6.8x51mm (.277 Fury) XM1186 GP — M7 13\" Hybrid (8.75g / 135gr @ 915 m/s)",
    massGrams: 8.75,
    diamMM: 7.04,
    muzzleVel: 915,
    bc: 0.488,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "4",
    maxPenDist: 200
  },
  {
    id: "m80_762x51",
    group: "Full-Power & Sniper",
    name: "7.62x51mm NATO M80 Ball — 20\" bbl (9.53g / 147gr @ 838 m/s)",
    massGrams: 9.53,
    diamMM: 7.82,
    muzzleVel: 838,
    bc: 0.398,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "3",
    maxPenDist: 200
  },
  {
    id: "m80a1_762x51",
    group: "Full-Power & Sniper",
    name: "7.62x51mm US Army M80A1 EPR — 20\" bbl (8.42g / 130gr @ 905 m/s)",
    massGrams: 8.42,
    diamMM: 7.82,
    muzzleVel: 905,
    bc: 0.390,
    dragModel: 1,
    profile: "1.12",
    armorLevel: "3",
    maxPenDist: 450
  },
  {
    id: "m993_762x51",
    group: "Full-Power & Sniper",
    name: "7.62x51mm M993 Tungsten Carbide AP — 20\" bbl (8.20g / 127gr @ 910 m/s)",
    massGrams: 8.20,
    diamMM: 7.82,
    muzzleVel: 910,
    bc: 0.356,
    dragModel: 1,
    profile: "0.88",
    armorLevel: "4",
    maxPenDist: 300
  },
  {
    id: "ap485_338lm",
    group: "Full-Power & Sniper",
    name: ".338 Lapua Magnum AP485 / Scenar — 27\" bbl (16.20g / 250gr @ 900 m/s)",
    massGrams: 16.20,
    diamMM: 8.58,
    muzzleVel: 900,
    bc: 0.648,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "4",
    maxPenDist: 600
  },
  {
    id: "m2ap_50bmg",
    group: "Full-Power & Sniper",
    name: "12.7x99mm (.50 BMG) M33 / M2 AP — 45\" bbl (42.80g / 660gr @ 890 m/s)",
    massGrams: 42.80,
    diamMM: 12.95,
    muzzleVel: 890,
    bc: 0.670,
    dragModel: 1,
    profile: "1.00",
    armorLevel: "5",
    maxPenDist: 800
  }
];

const tunerState = {
  dragMode: "bc", // "bc" or "vel"
  lastSolvedRound: null
};

const GRAINS_PER_GRAM = 15.432358;
const FPS_PER_MPS = 3.28084;
const MM_PER_INCH = 25.4;

function populateRealWorldPresets() {
  const sel = document.getElementById("rwPresetSelect");
  if (!sel) return;
  const groups = {};
  for (const item of REAL_WORLD_CARTRIDGE_LIBRARY) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  let html = `<option value="__ACTIVE__">— Synced from Active Scraped Arma 3 Round —</option>`;
  for (const [gName, items] of Object.entries(groups)) {
    html += `<optgroup label="${gName}">` +
      items.map(x => `<option value="${x.id}">${x.name}</option>`).join("") +
      `</optgroup>`;
  }
  sel.innerHTML = html;
}

function solveAirFrictionFromBC(v0, bc, dragModel) {
  const tempRound = {
    initSpeed: v0,
    typicalSpeed: v0,
    airFriction: -0.001,
    ACE_ballisticCoefficients: [Math.max(0.04, bc)],
    ACE_dragModel: dragModel
  };
  const fitDist = 250;
  const { velocity: vFit } = computeVelocityAtRange(tempRound, fitDist, true);
  const clampedV = Math.max(20, Math.min(v0 - 0.5, vFit));
  return Math.log(clampedV / v0) / fitDist;
}

function solveBCFromDownrangeVelocity(v0, refDist, vRef, dragModel) {
  let lo = 0.03;
  let hi = 1.60;
  for (let i = 0; i < 22; i++) {
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

function computeMaxPlatePenRange(round, plateThicknessMM, criterion = "ace_bleed") {
  if (plateThicknessMM <= 0) return 2000;
  const hit = Math.max(0.1, Number(round.hit) || 8.0);
  const caliber = Math.max(0.01, Number(round.caliber) || 1.0);
  const penFactor = caliber * ACE_CONST.ARMOR_PENETRABILITY; // mm per m/s

  // Required impact velocity to meet criterion against plateThicknessMM:
  let reqPenDepthMM = plateThicknessMM;
  if (criterion === "ace_bleed") {
    // In ACE3: aceFinalDamage = (hit * min(1, penDepth / plateThicknessMM)) / 10 > 0.35
    const reqPenRatio = (ACE_CONST.PENETRATION_THRESHOLD * ACE_CONST.DAMAGE_SCALING_FACTOR) / hit;
    if (reqPenRatio > 1.0) {
      return 0; // Even at 100% RHA penetration, hit <= 3.5 cannot exceed 0.35 ACE threshold
    }
    reqPenDepthMM = reqPenRatio * plateThicknessMM;
  }

  const reqVelocity = reqPenDepthMM / Math.max(1e-6, penFactor);
  const v0 = Math.max(10, Number(round.initSpeed) || Number(round.typicalSpeed) || 800);
  if (reqVelocity > v0) return 0; // Stopped at 0m point-blank!

  // Binary search range in [0, 2000] where velocity(range) == reqVelocity
  let lo = 0;
  let hi = 2000;
  for (let i = 0; i < 20; i++) {
    const mid = 0.5 * (lo + hi);
    const { velocity } = computeVelocityAtRange(round, mid, appState.useAdvBallistics);
    if (velocity >= reqVelocity) lo = mid;
    else hi = mid;
  }
  return Math.round(0.5 * (lo + hi));
}

function loadTunerFromRound(round) {
  if (!round) return;
  const massG = Number(round.ACE_bulletMass) || 4.02;
  const diamMM = Number(round.ACE_caliber) || 5.56;
  const v0 = Number(round.initSpeed) || Number(round.typicalSpeed) || 850;
  const dragModel = Number(round.ACE_dragModel) || 1;
  const af = Number(round.airFriction) || -0.0012;
  const bc = (round.ACE_ballisticCoefficients && round.ACE_ballisticCoefficients[0])
    || Math.max(0.06, Math.min(1.2, -0.00038 / af));

  document.getElementById("rwBulletMass").value = massG.toFixed(2);
  document.getElementById("rwBulletGrains").value = (massG * GRAINS_PER_GRAM).toFixed(1);
  document.getElementById("rwBulletDiam").value = diamMM.toFixed(2);
  document.getElementById("rwBulletInches").value = (diamMM / MM_PER_INCH).toFixed(3);
  document.getElementById("rwMuzzleVel").value = Math.round(v0);
  document.getElementById("rwMuzzleFps").value = Math.round(v0 * FPS_PER_MPS);

  document.getElementById("rwInputBC").value = Number(bc).toFixed(3);
  document.getElementById("rwInputDragModel").value = String(dragModel);

  const refDist = Number(document.getElementById("rwRefDist").value) || 200;
  const { velocity: vRef } = computeVelocityAtRange(round, refDist, false);
  document.getElementById("rwRefVel").value = Math.round(vRef);
  document.getElementById("rwRefFps").value = Math.round(vRef * FPS_PER_MPS);

  document.getElementById("rwProjectileProfile").value = "manual";
  document.getElementById("rwHitSlider").value = Number(round.hit || 8).toFixed(1);
  document.getElementById("rwHitInput").value = Number(round.hit || 8).toFixed(2);

  // Detect highest armor level this round currently penetrates at 0m and set slider to its max distance
  const criterion = document.getElementById("rwPenCriterion").value || "ace_bleed";
  let bestLevel = 0;
  let bestDist = 0;
  for (let lvl = 5; lvl >= 1; lvl--) {
    const rha = ACE_CONST.ARMOR_THICKNESS_RHA[lvl - 1];
    const maxD = computeMaxPlatePenRange(round, rha, criterion);
    if (maxD > 0) {
      bestLevel = lvl;
      bestDist = maxD;
      break;
    }
  }
  document.getElementById("rwArmorGoalLevel").value = String(bestLevel);
  document.getElementById("rwArmorMaxDist").value = bestDist;
  document.getElementById("rwArmorMaxDistSlider").value = Math.min(800, bestDist);

  updateTunerPreviewAndOutputs(false);
}

function setDragSolverMode(mode) {
  tunerState.dragMode = mode;
  document.getElementById("btnDragModeBC").classList.toggle("active", mode === "bc");
  document.getElementById("btnDragModeVel").classList.toggle("active", mode === "vel");
  document.getElementById("rwDragPanelBC").style.display = mode === "bc" ? "grid" : "none";
  document.getElementById("rwDragPanelVel").style.display = mode === "vel" ? "grid" : "none";
}

function applyRealWorldPreset(presetId) {
  if (presetId === "__ACTIVE__") {
    loadTunerFromRound(appState.currentRound);
    return;
  }
  const preset = REAL_WORLD_CARTRIDGE_LIBRARY.find(p => p.id === presetId);
  if (!preset) return;

  document.getElementById("rwBulletMass").value = preset.massGrams.toFixed(2);
  document.getElementById("rwBulletGrains").value = (preset.massGrams * GRAINS_PER_GRAM).toFixed(1);
  document.getElementById("rwBulletDiam").value = preset.diamMM.toFixed(2);
  document.getElementById("rwBulletInches").value = (preset.diamMM / MM_PER_INCH).toFixed(3);
  document.getElementById("rwMuzzleVel").value = preset.muzzleVel;
  document.getElementById("rwMuzzleFps").value = Math.round(preset.muzzleVel * FPS_PER_MPS);

  setDragSolverMode("bc");
  document.getElementById("rwInputBC").value = preset.bc.toFixed(3);
  document.getElementById("rwInputDragModel").value = String(preset.dragModel);

  document.getElementById("rwProjectileProfile").value = preset.profile;
  document.getElementById("rwArmorGoalLevel").value = preset.armorLevel;
  document.getElementById("rwArmorMaxDist").value = preset.maxPenDist;
  document.getElementById("rwArmorMaxDistSlider").value = Math.min(800, preset.maxPenDist);

  updateTunerPreviewAndOutputs(document.getElementById("chkRwLiveSync").checked);
}

function updateTunerPreviewAndOutputs(applyToActiveRound = false) {
  const massGrams = Math.max(0.2, parseFloat(document.getElementById("rwBulletMass").value) || 4.0);
  const diamMM = Math.max(2.0, parseFloat(document.getElementById("rwBulletDiam").value) || 5.56);
  const v0 = Math.max(50, parseFloat(document.getElementById("rwMuzzleVel").value) || 850);
  const dragModel = parseInt(document.getElementById("rwInputDragModel").value, 10) || 1;

  // Muzzle Kinetic Energy
  const muzzleKE = 0.5 * (massGrams / 1000) * v0 * v0;
  const ftLbs = muzzleKE * 0.737562;
  document.getElementById("rwMuzzleEnergyBadge").textContent = `KE: ${Math.round(muzzleKE)} J (${Math.round(ftLbs)} ft-lbs)`;
  document.getElementById("rwVelocitySubLabel").textContent = `${Math.round(v0)} m/s (${Math.round(v0 * FPS_PER_MPS)} fps)`;

  // 1. Solve Drag (airFriction & BC)
  let solvedAirFriction = -0.0012;
  let solvedBC = 0.300;
  const refDist = Math.max(25, parseFloat(document.getElementById("rwRefDist").value) || 200);

  if (tunerState.dragMode === "bc") {
    solvedBC = Math.max(0.04, parseFloat(document.getElementById("rwInputBC").value) || 0.30);
    solvedAirFriction = solveAirFrictionFromBC(v0, solvedBC, dragModel);
    const vRefAtDist = v0 * Math.exp(solvedAirFriction * refDist);
    document.getElementById("rwRefVel").value = Math.round(vRefAtDist);
    document.getElementById("rwRefFps").value = Math.round(vRefAtDist * FPS_PER_MPS);
  } else {
    const vRef = Math.max(20, Math.min(v0 - 1, parseFloat(document.getElementById("rwRefVel").value) || (v0 * 0.75)));
    solvedAirFriction = Math.log(vRef / v0) / refDist;
    solvedBC = solveBCFromDownrangeVelocity(v0, refDist, vRef, dragModel);
    document.getElementById("rwInputBC").value = solvedBC.toFixed(3);
  }

  document.getElementById("rwSolvedAfLabel").textContent = solvedAirFriction.toFixed(6);
  document.getElementById("rwSolvedBcLabel").textContent = `${solvedBC.toFixed(3)} (G${dragModel})`;

  // 2. Solve Base 'hit' (Unarmored Flesh Lethality)
  const profileVal = document.getElementById("rwProjectileProfile").value;
  let solvedHit = parseFloat(document.getElementById("rwHitInput").value) || 8.0;
  if (profileVal !== "manual") {
    const mult = parseFloat(profileVal) || 1.0;
    solvedHit = Math.max(2.0, 2.15 * Math.pow(muzzleKE / 100, 0.49) * mult);
    document.getElementById("rwHitSlider").value = Math.min(35, solvedHit).toFixed(1);
    document.getElementById("rwHitInput").value = solvedHit.toFixed(2);
  }

  // Unarmored torso shots-to-kill estimate (against base armor = 2.0)
  const unarmoredTorsoDmg = solvedHit / 2.0 / 10.0 * 2.0; // engineDamage = solvedHit / 2.0
  const unarmoredStk = Math.max(1, Math.ceil(1.5 / Math.max(0.1, solvedHit / 2.0)));
  document.getElementById("rwUnarmoredStkBadge").textContent = `Unarmored Torso: ~${unarmoredStk} shot${unarmoredStk > 1 ? "s" : ""} (hit=${solvedHit.toFixed(1)})`;

  // 3. Solve 'caliber' from Armor Penetration Goal & Max Distance
  const goalLevelStr = document.getElementById("rwArmorGoalLevel").value;
  const maxPenDist = Math.max(0, parseFloat(document.getElementById("rwArmorMaxDist").value) || 0);
  const criterion = document.getElementById("rwPenCriterion").value || "ace_bleed";

  const maxDistField = document.getElementById("rwMaxPenDistField");
  if (maxDistField) {
    maxDistField.style.opacity = goalLevelStr === "0" ? "0.45" : "1.0";
  }

  // Build temporary round with solved external ballistics to get velocity at maxPenDist
  const previewRound = {
    ...(appState.currentRound || {}),
    initSpeed: Number(v0.toFixed(1)),
    typicalSpeed: Number(v0.toFixed(1)),
    airFriction: Number(solvedAirFriction.toFixed(7)),
    ACE_bulletMass: Number(massGrams.toFixed(3)),
    ACE_caliber: Number(diamMM.toFixed(2)),
    ACE_ballisticCoefficients: [Number(solvedBC.toFixed(3))],
    ACE_dragModel: dragModel,
    hit: Number(solvedHit.toFixed(2))
  };

  let targetPlateMM = 0;
  if (goalLevelStr === "active") {
    const evActive = evaluateShot(previewRound, appState.armorLoadout, appState.selectedHitpoint, 0, {
      alternateArmorPen: true
    });
    targetPlateMM = evActive.aceArmorThicknessMM || 15;
  } else {
    const lvlNum = parseInt(goalLevelStr, 10) || 0;
    targetPlateMM = lvlNum > 0 ? ACE_CONST.ARMOR_THICKNESS_RHA[lvlNum - 1] : 0;
  }

  let solvedCaliber = 0.5;
  if (goalLevelStr === "0" || targetPlateMM <= 0) {
    // Stopped by Level I (6mm) even at 0m: aceFinalDamage(0m, 6mm) = 0.28 <= 0.35
    const reqPenRatio = Math.min(0.9, (0.28 * ACE_CONST.DAMAGE_SCALING_FACTOR) / Math.max(3.6, solvedHit));
    const targetPenMM = reqPenRatio * ACE_CONST.ARMOR_THICKNESS_RHA[0]; // 6mm
    solvedCaliber = targetPenMM / (ACE_CONST.ARMOR_PENETRABILITY * v0);
  } else {
    // Ensure solvedHit is at least 3.7 if user wants ACE bleed penetration (since hit/10 must be able to exceed 0.35)
    if (criterion === "ace_bleed" && previewRound.hit < 3.7) {
      previewRound.hit = 3.8;
      solvedHit = 3.8;
      document.getElementById("rwHitInput").value = "3.80";
      document.getElementById("rwHitSlider").value = "3.8";
    }
    const { velocity: vAtDist } = computeVelocityAtRange(previewRound, maxPenDist, appState.useAdvBallistics);
    const effVel = Math.max(15, vAtDist);

    if (criterion === "ace_bleed") {
      // At maxPenDist, aceFinalDamage = (hit * penRatio) / 10 == 0.353 (just above 0.35 threshold)
      const reqPenRatio = Math.min(1.0, (0.353 * ACE_CONST.DAMAGE_SCALING_FACTOR) / Math.max(3.55, solvedHit));
      const reqPenDepthMM = reqPenRatio * targetPlateMM;
      solvedCaliber = reqPenDepthMM / (ACE_CONST.ARMOR_PENETRABILITY * effVel);
    } else {
      // 100% RHAe match at maxPenDist: effVel * caliber * 0.015 == targetPlateMM
      solvedCaliber = targetPlateMM / (ACE_CONST.ARMOR_PENETRABILITY * effVel);
    }
  }

  previewRound.caliber = Number(Math.max(0.05, solvedCaliber).toFixed(4));
  tunerState.lastSolvedRound = previewRound;

  document.getElementById("rwSolvedCalHitBadge").textContent =
    `hit: ${previewRound.hit.toFixed(2)} | caliber: ${previewRound.caliber.toFixed(3)} (${(previewRound.caliber * 0.015 * v0).toFixed(1)}mm @ 0m)`;

  // Render Downrange Trajectory Table (0m, 100m, 200m, 300m, 500m)
  const trajBody = document.getElementById("rwTrajTableBody");
  if (trajBody) {
    const dists = [0, 100, 200, 300, 500];
    trajBody.innerHTML = dists.map(d => {
      const { velocity, tof } = computeVelocityAtRange(previewRound, d, appState.useAdvBallistics);
      const ke = 0.5 * (massGrams / 1000) * velocity * velocity;
      return `<tr>
        <td><strong>${d}m</strong></td>
        <td>${Math.round(velocity)} m/s</td>
        <td style="color:var(--text-muted);">${Math.round(velocity * FPS_PER_MPS)} fps</td>
        <td>${Math.round(ke)} J</td>
        <td>${tof.toFixed(2)}s</td>
      </tr>`;
    }).join("");
  }

  // Render Live 5-Level Armor Penetration Matrix & Diff Bar
  renderTunerPenetrationMatrix(previewRound);
  renderTunerDiffBar(previewRound);

  if (applyToActiveRound && appState.currentRound) {
    Object.assign(appState.currentRound, previewRound);
    syncRoundInputsFromState();
    updateAllViews();
  }
}

function renderTunerPenetrationMatrix(roundToEval) {
  const container = document.getElementById("rwPenMatrixContainer");
  if (!container || !roundToEval) return;

  const criterion = (document.getElementById("rwPenCriterion") && document.getElementById("rwPenCriterion").value) || "ace_bleed";
  const goalLevelStr = (document.getElementById("rwArmorGoalLevel") && document.getElementById("rwArmorGoalLevel").value) || "3";

  const rowsSpec = [
    { id: "1", label: "ACE Lvl I (6mm Soft)", rha: 6 },
    { id: "2", label: "ACE Lvl II (15mm IIIA)", rha: 15 },
    { id: "3", label: "ACE Lvl III (21mm Steel)", rha: 21 },
    { id: "4", label: "ACE Lvl IV (40mm ESAPI)", rha: 40 },
    { id: "5", label: "ACE Lvl V (55mm Heavy)", rha: 55 }
  ];

  // Also add the currently equipped armor on active hitzone
  const evActive0 = evaluateShot(roundToEval, appState.armorLoadout, appState.selectedHitpoint, 0, {
    alternateArmorPen: true
  });
  if (evActive0.aceArmorThicknessMM > 0) {
    rowsSpec.push({
      id: "active",
      label: `${appState.selectedHitpoint.replace("Hit", "")} Gear (${evActive0.aceArmorThicknessMM}mm)`,
      rha: evActive0.aceArmorThicknessMM
    });
  }

  container.innerHTML = rowsSpec.map(row => {
    const maxDist = computeMaxPlatePenRange(roundToEval, row.rha, criterion);
    const pct = Math.max(0, Math.min(100, (maxDist / 800) * 100));
    const isTarget = row.id === goalLevelStr ? "active-target" : "";

    let barColor = "#22c55e";
    let statusText = `<span style="color:#4ade80;font-weight:700;">Penetrates to ${maxDist}m</span>`;
    if (maxDist <= 0) {
      barColor = "#38bdf8";
      statusText = `<span style="color:#38bdf8;">STOPPED @ 0m (Bruise)</span>`;
    } else if (maxDist < 100) {
      barColor = "#f59e0b";
      statusText = `<span style="color:#fbbf24;font-weight:700;">Penetrates to ${maxDist}m</span>`;
    }

    return `<div class="pen-matrix-row ${isTarget}" style="cursor:pointer;" title="Click to target ${row.label} in the tuner" onclick="window.selectTunerArmorLevel('${row.id}')">
      <span>${row.label}</span>
      <div class="pen-bar-track">
        <div class="pen-bar-fill" style="width:${pct.toFixed(1)}%;background:${barColor};"></div>
      </div>
      <div style="text-align:right;">${statusText}</div>
    </div>`;
  }).join("");
}

window.selectTunerArmorLevel = function(lvlId) {
  const sel = document.getElementById("rwArmorGoalLevel");
  if (!sel) return;
  sel.value = String(lvlId);
  const distInp = document.getElementById("rwArmorMaxDist");
  if (distInp && (parseFloat(distInp.value) || 0) <= 0) {
    distInp.value = "50";
    document.getElementById("rwArmorMaxDistSlider").value = "50";
  }
  updateTunerPreviewAndOutputs(document.getElementById("chkRwLiveSync").checked);
};

function renderTunerDiffBar(previewRound) {
  const container = document.getElementById("rwDiffPills");
  if (!container || !previewRound) return;
  const orig = appState.originalRound || previewRound;

  const diffs = [
    {
      label: "initSpeed",
      oldVal: `${Math.round(orig.initSpeed || 0)}`,
      newVal: `${Math.round(previewRound.initSpeed || 0)} m/s`,
      changed: Math.abs((orig.initSpeed || 0) - (previewRound.initSpeed || 0)) >= 1
    },
    {
      label: "airFriction",
      oldVal: Number(orig.airFriction || 0).toFixed(5),
      newVal: Number(previewRound.airFriction || 0).toFixed(5),
      changed: Math.abs((orig.airFriction || 0) - (previewRound.airFriction || 0)) >= 0.00002
    },
    {
      label: "hit",
      oldVal: Number(orig.hit || 0).toFixed(2),
      newVal: Number(previewRound.hit || 0).toFixed(2),
      changed: Math.abs((orig.hit || 0) - (previewRound.hit || 0)) >= 0.05
    },
    {
      label: "caliber",
      oldVal: Number(orig.caliber || 0).toFixed(3),
      newVal: Number(previewRound.caliber || 0).toFixed(3),
      changed: Math.abs((orig.caliber || 0) - (previewRound.caliber || 0)) >= 0.005
    },
    {
      label: "ACE_bulletMass",
      oldVal: `${Number(orig.ACE_bulletMass || 0).toFixed(2)}`,
      newVal: `${Number(previewRound.ACE_bulletMass || 0).toFixed(2)}g`,
      changed: Math.abs((orig.ACE_bulletMass || 0) - (previewRound.ACE_bulletMass || 0)) >= 0.02
    }
  ];

  container.innerHTML = diffs.map(d => {
    const cls = d.changed ? "diff-pill changed" : "diff-pill";
    const body = d.changed ? `${d.oldVal} &rarr; <strong>${d.newVal}</strong>` : `<strong>${d.newVal}</strong>`;
    return `<span class="${cls}">${d.label}: ${body}</span>`;
  }).join("");
}

// ============================================================================
// UI Synchronization, Preset Selectors, Tables & Config Exporter
// ============================================================================
function populateModFilters() {
  const roundMods = Array.from(new Set(ARMA_DATABASE.rounds.map(r => r.mod))).sort();
  const vestMods = Array.from(new Set(ARMA_DATABASE.vests.map(v => v.mod))).sort();
  const helmMods = Array.from(new Set(ARMA_DATABASE.helmets.map(h => h.mod))).sort();
  const uniMods = Array.from(new Set(ARMA_DATABASE.uniforms.map(u => u.mod))).sort();

  const fillModSelect = (id, mods) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="ALL">All Mods (${mods.length})</option>` +
      mods.map(m => `<option value="${m}">${m}</option>`).join("");
  };

  fillModSelect("roundModFilter", roundMods);
  fillModSelect("vestModFilter", vestMods);
  fillModSelect("helmetModFilter", helmMods);
  fillModSelect("uniformModFilter", uniMods);
}

function filterAndPopulateRoundSelect() {
  const mod = document.getElementById("roundModFilter").value;
  const q = (document.getElementById("roundSearch").value || "").toLowerCase().trim();
  const sel = document.getElementById("roundSelect");

  const filtered = ARMA_DATABASE.rounds.filter(r => {
    if (mod !== "ALL" && r.mod !== mod) return false;
    if (!q) return true;
    const text = `${r.className} ${r.magName || ""} ${r.mod}`.toLowerCase();
    return text.includes(q);
  });

  const currentCls = appState.currentRound ? appState.currentRound.className : "";
  const stillPresent = filtered.some(r => r.className === currentCls);
  const activeCls = stillPresent ? currentCls : (filtered[0] ? filtered[0].className : "");

  sel.innerHTML = filtered.map(r => {
    const label = r.magName ? `${r.className} — ${r.magName} [${r.mod}]` : `${r.className} [${r.mod}]`;
    const isSel = r.className === activeCls ? "selected" : "";
    return `<option value="${r.className}" ${isSel}>${label}</option>`;
  }).join("");

  document.getElementById("roundCountBadge").textContent = `${filtered.length} rounds`;
  if (!stillPresent && activeCls) {
    selectRoundByClass(activeCls);
  }
}

function filterAndPopulateGearSelect(cat, selectId, modFilterId, searchId, currentItem, includeNone = true) {
  const mod = document.getElementById(modFilterId).value;
  const q = (document.getElementById(searchId).value || "").toLowerCase().trim();
  const sel = document.getElementById(selectId);

  const items = ARMA_DATABASE[cat] || [];
  const filtered = items.filter(x => {
    if (mod !== "ALL" && x.mod !== mod) return false;
    if (!q) return true;
    const text = `${x.className} ${x.displayName || ""} ${x.description || ""} ${x.mod}`.toLowerCase();
    return text.includes(q);
  });

  const curCls = currentItem ? currentItem.className : "__NONE__";
  let html = includeNone ? `<option value="__NONE__" ${curCls === "__NONE__" ? "selected" : ""}>— None (Unarmored) —</option>` : "";
  html += filtered.map(x => {
    const desc = x.description ? ` (${x.description})` : "";
    const label = `${x.displayName || x.className}${desc} [${x.mod}] — ${x.className}`;
    const isSel = x.className === curCls ? "selected" : "";
    return `<option value="${x.className}" ${isSel}>${label}</option>`;
  }).join("");
  sel.innerHTML = html;
}

function selectRoundByClass(className) {
  const found = ARMA_DATABASE.rounds.find(r => r.className === className) || ARMA_DATABASE.rounds[0];
  if (!found) return;
  appState.originalRound = deepClone(found);
  appState.currentRound = deepClone(found);
  syncRoundInputsFromState();
  const rwSel = document.getElementById("rwPresetSelect");
  if (rwSel) rwSel.value = "__ACTIVE__";
  loadTunerFromRound(found);
  updateAllViews();
}

function selectGearByClass(slot, className) {
  if (className === "__NONE__") {
    appState.armorLoadout[slot] = null;
  } else {
    const cat = slot === "vest" ? "vests" : (slot === "helmet" ? "helmets" : "uniforms");
    const found = ARMA_DATABASE[cat].find(x => x.className === className);
    if (found) appState.armorLoadout[slot] = deepClone(found);
  }
  syncArmorInputsFromState();
  updateAllViews();
}

function syncRoundInputsFromState() {
  const r = appState.currentRound;
  if (!r) return;
  document.getElementById("inpRoundClass").value = r.className || "Custom_Ammo";
  document.getElementById("inpHit").value = r.hit !== undefined ? r.hit : 8;
  document.getElementById("inpCaliber").value = r.caliber !== undefined ? r.caliber : 1;
  document.getElementById("inpTypicalSpeed").value = r.typicalSpeed !== undefined ? r.typicalSpeed : 850;
  document.getElementById("inpInitSpeed").value = r.initSpeed !== undefined ? r.initSpeed : 850;
  document.getElementById("inpAirFriction").value = r.airFriction !== undefined ? r.airFriction : -0.001;
  document.getElementById("inpDeflecting").value = r.deflecting !== undefined ? r.deflecting : 15;
  document.getElementById("inpExplosive").value = r.explosive !== undefined ? r.explosive : 0;
  document.getElementById("inpDamageType").value = r.ACE_damageType || "bullet";
  document.getElementById("inpAceMass").value = r.ACE_bulletMass !== undefined ? r.ACE_bulletMass : 4.0;
  document.getElementById("inpAceCaliber").value = r.ACE_caliber !== undefined ? r.ACE_caliber : 5.56;
  document.getElementById("inpAceBC").value = (r.ACE_ballisticCoefficients && r.ACE_ballisticCoefficients[0]) || 0.30;
  document.getElementById("inpAceDrag").value = r.ACE_dragModel || 1;

  // Barrel length velocity selector if round has ACE_barrelLengths & ACE_muzzleVelocities
  const barrelWrap = document.getElementById("barrelSelectWrap");
  const barrelSel = document.getElementById("barrelLengthSelect");
  if (r.ACE_barrelLengths && r.ACE_muzzleVelocities && r.ACE_barrelLengths.length === r.ACE_muzzleVelocities.length && r.ACE_barrelLengths.length > 0) {
    barrelWrap.style.display = "flex";
    barrelSel.innerHTML = `<option value="">Magazine Default (${r.initSpeed} m/s)</option>` +
      r.ACE_barrelLengths.map((bl, idx) => {
        const inches = (bl / 25.4).toFixed(1);
        const mv = r.ACE_muzzleVelocities[idx];
        return `<option value="${mv}">${bl} mm (${inches}") — ${mv} m/s</option>`;
      }).join("");
  } else {
    barrelWrap.style.display = "none";
  }
}

function readRoundInputsToState() {
  const r = appState.currentRound;
  if (!r) return;
  r.className = document.getElementById("inpRoundClass").value.trim() || "Custom_Ammo";
  r.hit = parseFloat(document.getElementById("inpHit").value) || 0;
  r.caliber = parseFloat(document.getElementById("inpCaliber").value) || 0.1;
  r.typicalSpeed = parseFloat(document.getElementById("inpTypicalSpeed").value) || 1;
  r.initSpeed = parseFloat(document.getElementById("inpInitSpeed").value) || 1;
  r.airFriction = parseFloat(document.getElementById("inpAirFriction").value) || 0;
  r.deflecting = parseFloat(document.getElementById("inpDeflecting").value) || 0;
  r.explosive = parseFloat(document.getElementById("inpExplosive").value) || 0;
  r.ACE_damageType = document.getElementById("inpDamageType").value;
  r.ACE_bulletMass = parseFloat(document.getElementById("inpAceMass").value) || 4.0;
  r.ACE_caliber = parseFloat(document.getElementById("inpAceCaliber").value) || 5.56;
  r.ACE_ballisticCoefficients = [parseFloat(document.getElementById("inpAceBC").value) || 0.3];
  r.ACE_dragModel = parseInt(document.getElementById("inpAceDrag").value, 10) || 1;
  updateAllViews();
}

function syncArmorInputsFromState() {
  const hp = appState.selectedHitpoint;
  const info = resolveHitpointArmor(appState.armorLoadout, hp);

  document.getElementById("inpUnitBaseArmor").value = info.unitBaseArmor;
  document.getElementById("inpUnitStructural").value = info.unitStructural;
  document.getElementById("inpHpMult").value = info.hpArmorMult;
  document.getElementById("inpHpPass").value = info.hpBasePassThrough;

  document.getElementById("inpVestHpArmor").value = info.vestArmorRaw;
  document.getElementById("inpVestHpPass").value = info.vestPassThrough;
  document.getElementById("inpHelmHpArmor").value = info.helmArmorRaw;
  document.getElementById("inpHelmHpPass").value = info.helmPassThrough;
}

function readArmorInputsToState() {
  const hp = appState.selectedHitpoint;
  const uni = appState.armorLoadout.uniform;
  if (uni) {
    uni.armor = parseFloat(document.getElementById("inpUnitBaseArmor").value) || 2.0;
    uni.armorStructural = parseFloat(document.getElementById("inpUnitStructural").value) || 4.0;
    if (!uni.hitpoints) uni.hitpoints = {};
    if (!uni.hitpoints[hp]) uni.hitpoints[hp] = {};
    uni.hitpoints[hp].armor = parseFloat(document.getElementById("inpHpMult").value) || 1.0;
    uni.hitpoints[hp].passThrough = parseFloat(document.getElementById("inpHpPass").value) || 1.0;
  }

  const vestArmorVal = parseFloat(document.getElementById("inpVestHpArmor").value) || 0;
  const vestPassVal = parseFloat(document.getElementById("inpVestHpPass").value) || 1.0;
  if (!appState.armorLoadout.vest && vestArmorVal > 0) {
    appState.armorLoadout.vest = { className: "Custom_Vest", displayName: "Custom Vest", mod: "Custom", protection: {} };
  }
  if (appState.armorLoadout.vest) {
    if (!appState.armorLoadout.vest.protection) appState.armorLoadout.vest.protection = {};
    appState.armorLoadout.vest.protection[hp] = { armor: vestArmorVal, passThrough: vestPassVal };
  }

  const helmArmorVal = parseFloat(document.getElementById("inpHelmHpArmor").value) || 0;
  const helmPassVal = parseFloat(document.getElementById("inpHelmHpPass").value) || 1.0;
  if (!appState.armorLoadout.helmet && helmArmorVal > 0) {
    appState.armorLoadout.helmet = { className: "Custom_Helmet", displayName: "Custom Helmet", mod: "Custom", protection: {} };
  }
  if (appState.armorLoadout.helmet) {
    if (!appState.armorLoadout.helmet.protection) appState.armorLoadout.helmet.protection = {};
    appState.armorLoadout.helmet.protection[hp] = { armor: helmArmorVal, passThrough: helmPassVal };
  }

  updateAllViews();
}

function renderHitzoneButtons() {
  const container = document.getElementById("hitzoneGrid");
  if (!container) return;
  container.innerHTML = HITZONES.map(hz => {
    const info = resolveHitpointArmor(appState.armorLoadout, hz.id);
    const active = hz.id === appState.selectedHitpoint ? "active" : "";
    return `<button type="button" class="hz-btn ${active}" data-hp="${hz.id}">
      <span>${hz.id.replace("Hit", "")}</span>
      <small>Arm: ${info.aceTotalArmor.toFixed(1)}</small>
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
  if (!tbody) return;
  const rows = HITZONES.map(hz => {
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, hz.id, appState.rangeMeters, {
      impactAngleDeg: appState.impactAngleDeg,
      useAdvBallistics: appState.useAdvBallistics,
      alternateArmorPen: appState.alternateArmorPen,
      damageThreshold: appState.damageThreshold
    });

    const isSelected = hz.id === appState.selectedHitpoint ? "selected-row" : "";
    const lvlBadge = ev.aceArmorLevel > 0
      ? `<span class="badge badge-amber">Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM}mm)</span>`
      : `<span class="badge badge-blue">Unarmored</span>`;

    const penBadge = ev.penetratedPlate
      ? `<span class="badge badge-red">PENETRATED</span>`
      : `<span class="badge badge-green">STOPPED (Bruise)</span>`;

    const primaryWound = ev.woundBreakdowns.length > 0
      ? ev.woundBreakdowns.slice().sort((a, b) => b.probability - a.probability)[0].displayName
      : "None";

    return `<tr class="${isSelected}" style="cursor:pointer;" onclick="window.selectHitpointRow('${hz.id}')">
      <td><strong>${hz.id}</strong> <span style="color:var(--text-muted)">(${hz.acePart})</span></td>
      <td>${ev.armorInfo.vanillaTotalArmor.toFixed(1)} / ${ev.armorInfo.aceTotalArmor.toFixed(1)}</td>
      <td>${lvlBadge}</td>
      <td>${ev.vanillaHitpointDamage.toFixed(2)} ${ev.vanillaIsLethal ? '<span class="badge badge-red">KILL</span>' : ""}</td>
      <td><strong>${ev.aceFinalDamage.toFixed(3)}</strong></td>
      <td>${penBadge}</td>
      <td style="text-align:left;">${ev.nWoundsInt}x ${primaryWound}</td>
      <td>${ev.expectedBleedRate.toFixed(3)}</td>
      <td>${(ev.totalFatalProb * 100).toFixed(0)}% (${ev.shotsToGuaranteedTraumaKill} shots)</td>
    </tr>`;
  });
  tbody.innerHTML = rows.join("");
}

window.selectHitpointRow = function(hp) {
  appState.selectedHitpoint = hp;
  syncArmorInputsFromState();
  updateAllViews();
};

function renderConfigExporter() {
  const r = appState.currentRound;
  const orig = appState.originalRound || r;
  if (!r) return;

  const parentCls = r.parent || "BulletBase";
  const bcArr = (r.ACE_ballisticCoefficients || [0.3]).join(", ");

  const cfgText = `// Generated by AmmoMaster — Arma 3 & ACE3 Ballistics & Medical Damage Wizard
class CfgAmmo {
    class ${parentCls};
    class ${r.className}: ${parentCls} {
        hit = ${Number(r.hit).toFixed(3)};               // Original: ${Number(orig.hit).toFixed(3)}
        indirectHit = ${Number(r.indirectHit || 0).toFixed(2)};
        indirectHitRange = ${Number(r.indirectHitRange || 0).toFixed(2)};
        caliber = ${Number(r.caliber).toFixed(4)};           // Original: ${Number(orig.caliber).toFixed(4)} (RHAe = ${(r.caliber * 0.015 * r.initSpeed).toFixed(1)} mm @ 0m)
        typicalSpeed = ${Number(r.typicalSpeed).toFixed(1)};     // Original: ${Number(orig.typicalSpeed).toFixed(1)} m/s
        airFriction = ${Number(r.airFriction).toFixed(7)};   // Original: ${Number(orig.airFriction).toFixed(7)}
        deflecting = ${Number(r.deflecting || 15).toFixed(1)};
        ACE_damageType = "${r.ACE_damageType || "bullet"}";
        ACE_caliber = ${Number(r.ACE_caliber || 5.56).toFixed(2)};
        ACE_bulletMass = ${Number(r.ACE_bulletMass || 4.0).toFixed(3)};
        ACE_dragModel = ${Number(r.ACE_dragModel || 1)};
        ACE_ballisticCoefficients[] = {${bcArr}};
    };
};

class CfgMagazines {
    class CA_Magazine;
    class ${r.className}_Mag: CA_Magazine {
        ammo = "${r.className}";
        initSpeed = ${Number(r.initSpeed).toFixed(1)};       // Original: ${Number(orig.initSpeed).toFixed(1)} m/s
    };
};`;

  const pre = document.getElementById("configExportPre");
  if (pre) pre.textContent = cfgText;
}

function updateAllViews() {
  const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, {
    impactAngleDeg: appState.impactAngleDeg,
    useAdvBallistics: appState.useAdvBallistics,
    alternateArmorPen: appState.alternateArmorPen,
    damageThreshold: appState.damageThreshold
  });

  // Top KPIs
  document.getElementById("kpiVelocity").textContent = `${ev.effectiveSpeed.toFixed(0)} m/s`;
  document.getElementById("kpiVelocitySub").textContent = `KE: ${ev.kineticEnergyJ.toFixed(0)} J | ToF: ${ev.tof.toFixed(2)}s`;

  document.getElementById("kpiRhaPen").textContent = `${ev.rhaPenMM.toFixed(1)} mm`;
  document.getElementById("kpiRhaPenSub").textContent = ev.aceArmorThicknessMM > 0
    ? `vs Armor Lvl ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM} mm RHAe)`
    : `Concrete: ${ev.concretePenMM.toFixed(0)}mm | Flesh: ${ev.meatPenMM.toFixed(0)}mm`;

  document.getElementById("kpiAceDamage").textContent = ev.aceFinalDamage.toFixed(3);
  document.getElementById("kpiAceDamage").style.color = ev.penetratedPlate ? "#ef4444" : "#38bdf8";
  document.getElementById("kpiAceDamageSub").textContent = ev.penetratedPlate
    ? `PENETRATES PLATE (> 0.35)`
    : `STOPPED BY PLATE (<= 0.35 Contusion)`;

  document.getElementById("kpiLethality").textContent = `${(ev.totalFatalProb * 100).toFixed(1)}%`;
  document.getElementById("kpiLethality").style.color = ev.totalFatalProb >= 0.5 ? "#ef4444" : "#eab308";
  document.getElementById("kpiLethalitySub").textContent = `Vanilla Dmg: ${ev.vanillaHitpointDamage.toFixed(2)} | ~${ev.shotsToGuaranteedTraumaKill} shots kill`;

  // Step-by-Step Pipeline Breakdown
  document.getElementById("fV0").textContent = `${Number(appState.currentRound.initSpeed).toFixed(1)} m/s`;
  document.getElementById("fVImpact").textContent = `${ev.effectiveSpeed.toFixed(1)} m/s`;
  document.getElementById("fRhaPen").textContent = `${ev.rhaPenMM.toFixed(2)} mm RHAe`;
  document.getElementById("fRawHit").textContent = `${ev.rawDamage.toFixed(3)} (hit=${appState.currentRound.hit} * ${(ev.effectiveSpeed / Math.max(1, appState.currentRound.typicalSpeed)).toFixed(3)})`;
  document.getElementById("fVanArmor").textContent = `${ev.armorInfo.vanillaTotalArmor.toFixed(2)} (Uni ${ev.armorInfo.uniformArmor.toFixed(1)} + Gear ${(ev.armorInfo.vestArmorRaw + ev.armorInfo.helmArmorRaw).toFixed(1)})`;
  document.getElementById("fVanDmg").textContent = `${ev.vanillaHitpointDamage.toFixed(3)} HP / ${ev.vanillaStructuralDamage.toFixed(3)} Struct`;

  document.getElementById("fAceArmor").textContent = `${ev.armorInfo.aceTotalArmor.toFixed(2)} (Net Armor: ${ev.netArmor.toFixed(2)})`;
  document.getElementById("fAceLevel").textContent = ev.usedArmorPenHandler
    ? `Level ${ev.aceArmorLevel} (${ev.aceArmorThicknessMM} mm RHAe)`
    : "Bypassed (No Plate / Base Armor)";
  document.getElementById("fAceFinalDmg").textContent = `${ev.aceFinalDamage.toFixed(4)} (${ev.nWoundsInt}x wound @ ${ev.dmgPerWound.toFixed(4)})`;
  document.getElementById("fAceWoundProbs").textContent = ev.woundBreakdowns
    .map(w => `${w.displayName}: ${(w.probability * 100).toFixed(0)}%`)
    .join(" | ") || "None";
  document.getElementById("fAceBleedPain").textContent = `Bleed: ${ev.expectedBleedRate.toFixed(4)} CO | Pain: ${(ev.expectedPain * 100).toFixed(0)}%`;
  document.getElementById("fAceFatal").textContent = `Vital: ${(ev.vitalFatalProb * 100).toFixed(1)}% | Weibull Trauma: ${(ev.weibullFatalProb * 100).toFixed(1)}%`;

  renderHitzoneButtons();
  renderAllHitzonesComparisonTable();
  renderAllCharts();
  renderConfigExporter();
  renderTunerPenetrationMatrix(tunerState.lastSolvedRound || appState.currentRound);
  renderTunerDiffBar(tunerState.lastSolvedRound || appState.currentRound);

  if (patientState.mode === "preview") {
    syncPreviewPatientFromShot(ev);
  }
  renderAceBodyDummy(ev.bodyPartIndex, appState.damageThreshold);
  updateAceInjuryListDOM(ev.bodyPartIndex, ev, appState.damageThreshold);
}

// ============================================================================
// Initialization & Event Listeners
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {
  // Header stats
  document.getElementById("hdrRoundsCount").textContent = ARMA_DATABASE.rounds.length;
  document.getElementById("hdrVestsCount").textContent = ARMA_DATABASE.vests.length;
  document.getElementById("hdrHelmetsCount").textContent = ARMA_DATABASE.helmets.length;
  document.getElementById("hdrUniformsCount").textContent = ARMA_DATABASE.uniforms.length;

  populateModFilters();
  populateRealWorldPresets();

  // Default selections: M855A1 or 5.56x45, Carrier Rig (V_PlateCarrier2_rgr), Combat Helmet (H_HelmetB), Combat Fatigues (U_B_CombatUniform_mcam)
  const defaultRound = ARMA_DATABASE.rounds.find(r => r.className === "ACE_556x45_Ball_M855A1")
    || ARMA_DATABASE.rounds.find(r => r.className === "B_556x45_Ball")
    || ARMA_DATABASE.rounds[0];
  const defaultVest = ARMA_DATABASE.vests.find(v => v.className === "V_PlateCarrier2_rgr") || ARMA_DATABASE.vests[0];
  const defaultHelmet = ARMA_DATABASE.helmets.find(h => h.className === "H_HelmetB") || ARMA_DATABASE.helmets[0];
  const defaultUniform = ARMA_DATABASE.uniforms.find(u => u.className === "U_B_CombatUniform_mcam") || ARMA_DATABASE.uniforms[0];

  appState.originalRound = deepClone(defaultRound);
  appState.currentRound = deepClone(defaultRound);
  appState.armorLoadout.vest = deepClone(defaultVest);
  appState.armorLoadout.helmet = deepClone(defaultHelmet);
  appState.armorLoadout.uniform = deepClone(defaultUniform);

  filterAndPopulateRoundSelect();
  filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true);
  filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true);
  filterAndPopulateGearSelect("uniforms", "uniformSelect", "uniformModFilter", "uniformSearch", appState.armorLoadout.uniform, false);

  syncRoundInputsFromState();
  syncArmorInputsFromState();

  // Filter & Select listeners
  ["roundModFilter", "roundSearch"].forEach(id => {
    document.getElementById(id).addEventListener("input", filterAndPopulateRoundSelect);
  });
  document.getElementById("roundSelect").addEventListener("change", e => selectRoundByClass(e.target.value));

  ["vestModFilter", "vestSearch"].forEach(id => {
    document.getElementById(id).addEventListener("input", () =>
      filterAndPopulateGearSelect("vests", "vestSelect", "vestModFilter", "vestSearch", appState.armorLoadout.vest, true)
    );
  });
  document.getElementById("vestSelect").addEventListener("change", e => selectGearByClass("vest", e.target.value));

  ["helmetModFilter", "helmetSearch"].forEach(id => {
    document.getElementById(id).addEventListener("input", () =>
      filterAndPopulateGearSelect("helmets", "helmetSelect", "helmetModFilter", "helmetSearch", appState.armorLoadout.helmet, true)
    );
  });
  document.getElementById("helmetSelect").addEventListener("change", e => selectGearByClass("helmet", e.target.value));

  ["uniformModFilter", "uniformSearch"].forEach(id => {
    document.getElementById(id).addEventListener("input", () =>
      filterAndPopulateGearSelect("uniforms", "uniformSelect", "uniformModFilter", "uniformSearch", appState.armorLoadout.uniform, false)
    );
  });
  document.getElementById("uniformSelect").addEventListener("change", e => selectGearByClass("uniform", e.target.value));

  // Barrel length select
  document.getElementById("barrelLengthSelect").addEventListener("change", e => {
    if (e.target.value) {
      document.getElementById("inpInitSpeed").value = parseFloat(e.target.value);
      readRoundInputsToState();
    }
  });

  // Live Round inputs
  [
    "inpRoundClass", "inpHit", "inpCaliber", "inpTypicalSpeed", "inpInitSpeed",
    "inpAirFriction", "inpDeflecting", "inpExplosive", "inpDamageType",
    "inpAceMass", "inpAceCaliber", "inpAceBC", "inpAceDrag"
  ].forEach(id => {
    document.getElementById(id).addEventListener("input", readRoundInputsToState);
  });

  document.getElementById("btnResetRound").addEventListener("click", () => {
    if (appState.originalRound) {
      appState.currentRound = deepClone(appState.originalRound);
      syncRoundInputsFromState();
      updateAllViews();
    }
  });

  // Live Armor inputs
  [
    "inpUnitBaseArmor", "inpUnitStructural", "inpHpMult", "inpHpPass",
    "inpVestHpArmor", "inpVestHpPass", "inpHelmHpArmor", "inpHelmHpPass"
  ].forEach(id => {
    document.getElementById(id).addEventListener("input", readArmorInputsToState);
  });

  // Engagement Range & Angle controls
  const rangeSlider = document.getElementById("rangeSlider");
  const rangeInput = document.getElementById("rangeInput");
  rangeSlider.addEventListener("input", e => {
    appState.rangeMeters = parseFloat(e.target.value) || 0;
    rangeInput.value = appState.rangeMeters;
    updateAllViews();
  });
  rangeInput.addEventListener("input", e => {
    appState.rangeMeters = Math.max(0, Math.min(2500, parseFloat(e.target.value) || 0));
    rangeSlider.value = Math.min(1500, appState.rangeMeters);
    updateAllViews();
  });

  document.querySelectorAll(".quick-range-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const r = parseFloat(btn.getAttribute("data-range")) || 0;
      appState.rangeMeters = r;
      rangeInput.value = r;
      rangeSlider.value = r;
      updateAllViews();
    });
  });

  document.getElementById("inpImpactAngle").addEventListener("input", e => {
    appState.impactAngleDeg = Math.max(0, Math.min(85, parseFloat(e.target.value) || 0));
    updateAllViews();
  });

  document.getElementById("chkAdvBallistics").addEventListener("change", e => {
    appState.useAdvBallistics = e.target.checked;
    updateAllViews();
  });

  document.getElementById("chkAceArmorPen").addEventListener("change", e => {
    appState.alternateArmorPen = e.target.checked;
    updateAllViews();
  });

  document.getElementById("inpDamageThreshold").addEventListener("input", e => {
    appState.damageThreshold = Math.max(0.1, parseFloat(e.target.value) || 1.0);
    updateAllViews();
  });

  // ACE Dummy Interactive Canvas Click (selects body part)
  const aceCanvas = document.getElementById("aceBodyCanvas");
  aceCanvas.addEventListener("click", e => {
    const rect = aceCanvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    let targetHp = "HitChest";
    if (ny < 0.21) {
      targetHp = "HitHead";
    } else if (ny < 0.54) {
      if (nx < 0.37) targetHp = "HitLeftArm";   // Viewer's left on ACE dummy is arm_left
      else if (nx > 0.63) targetHp = "HitRightArm";
      else if (ny < 0.36) targetHp = "HitChest";
      else if (ny < 0.45) targetHp = "HitAbdomen";
      else targetHp = "HitPelvis";
    } else {
      if (nx < 0.5) targetHp = "HitLeftLeg";
      else targetHp = "HitRightLeg";
    }
    appState.selectedHitpoint = targetHp;
    syncArmorInputsFromState();
    updateAllViews();
  });

  // ACE Dummy Live Firing Range & Medical Treatment buttons
  document.getElementById("btnFireShot").addEventListener("click", () => {
    if (patientState.mode === "preview") resetPatientDummy();
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, {
      impactAngleDeg: appState.impactAngleDeg,
      useAdvBallistics: appState.useAdvBallistics,
      alternateArmorPen: appState.alternateArmorPen,
      damageThreshold: appState.damageThreshold
    });
    fireLiveShotOnPatient(ev, appState.damageThreshold);
    renderAceBodyDummy(ev.bodyPartIndex, appState.damageThreshold);
    updateAceInjuryListDOM(ev.bodyPartIndex, ev, appState.damageThreshold);
  });

  document.getElementById("btnFireBurst").addEventListener("click", () => {
    if (patientState.mode === "preview") resetPatientDummy();
    const ev = evaluateShot(appState.currentRound, appState.armorLoadout, appState.selectedHitpoint, appState.rangeMeters, {
      impactAngleDeg: appState.impactAngleDeg,
      useAdvBallistics: appState.useAdvBallistics,
      alternateArmorPen: appState.alternateArmorPen,
      damageThreshold: appState.damageThreshold
    });
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

  // Tabs navigation
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

  // Real-World Tuner Interactive Listeners
  const triggerTuner = () => {
    const live = document.getElementById("chkRwLiveSync").checked;
    updateTunerPreviewAndOutputs(live);
  };

  document.getElementById("rwPresetSelect").addEventListener("change", e => {
    applyRealWorldPreset(e.target.value);
  });

  document.getElementById("btnRwPullCurrent").addEventListener("click", () => {
    document.getElementById("rwPresetSelect").value = "__ACTIVE__";
    loadTunerFromRound(appState.currentRound);
  });

  // Dual-unit linked inputs: Mass (g <-> gr)
  document.getElementById("rwBulletMass").addEventListener("input", e => {
    const g = Math.max(0.1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletGrains").value = (g * GRAINS_PER_GRAM).toFixed(1);
    triggerTuner();
  });
  document.getElementById("rwBulletGrains").addEventListener("input", e => {
    const gr = Math.max(1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletMass").value = (gr / GRAINS_PER_GRAM).toFixed(2);
    triggerTuner();
  });

  // Dual-unit linked inputs: Diameter (mm <-> in)
  document.getElementById("rwBulletDiam").addEventListener("input", e => {
    const mm = Math.max(1, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletInches").value = (mm / MM_PER_INCH).toFixed(3);
    triggerTuner();
  });
  document.getElementById("rwBulletInches").addEventListener("input", e => {
    const inches = Math.max(0.05, parseFloat(e.target.value) || 0);
    document.getElementById("rwBulletDiam").value = (inches * MM_PER_INCH).toFixed(2);
    triggerTuner();
  });

  // Dual-unit linked inputs: Muzzle Velocity (m/s <-> fps)
  document.getElementById("rwMuzzleVel").addEventListener("input", e => {
    const mps = Math.max(20, parseFloat(e.target.value) || 0);
    document.getElementById("rwMuzzleFps").value = Math.round(mps * FPS_PER_MPS);
    triggerTuner();
  });
  document.getElementById("rwMuzzleFps").addEventListener("input", e => {
    const fps = Math.max(60, parseFloat(e.target.value) || 0);
    document.getElementById("rwMuzzleVel").value = Math.round(fps / FPS_PER_MPS);
    triggerTuner();
  });

  // Drag Mode Toggle (BC vs Downrange Velocity)
  document.getElementById("btnDragModeBC").addEventListener("click", () => {
    setDragSolverMode("bc");
    triggerTuner();
  });
  document.getElementById("btnDragModeVel").addEventListener("click", () => {
    setDragSolverMode("vel");
    triggerTuner();
  });

  document.getElementById("rwInputBC").addEventListener("input", triggerTuner);
  document.getElementById("rwInputDragModel").addEventListener("change", triggerTuner);
  document.getElementById("rwRefDist").addEventListener("input", triggerTuner);

  document.getElementById("rwRefVel").addEventListener("input", e => {
    const mps = Math.max(20, parseFloat(e.target.value) || 0);
    document.getElementById("rwRefFps").value = Math.round(mps * FPS_PER_MPS);
    triggerTuner();
  });
  document.getElementById("rwRefFps").addEventListener("input", e => {
    const fps = Math.max(60, parseFloat(e.target.value) || 0);
    document.getElementById("rwRefVel").value = Math.round(fps / FPS_PER_MPS);
    triggerTuner();
  });

  // Flesh / Base Hit controls
  document.getElementById("rwProjectileProfile").addEventListener("change", triggerTuner);
  document.getElementById("rwHitSlider").addEventListener("input", e => {
    document.getElementById("rwProjectileProfile").value = "manual";
    document.getElementById("rwHitInput").value = parseFloat(e.target.value).toFixed(2);
    triggerTuner();
  });
  document.getElementById("rwHitInput").addEventListener("input", e => {
    document.getElementById("rwProjectileProfile").value = "manual";
    document.getElementById("rwHitSlider").value = Math.min(35, parseFloat(e.target.value) || 8);
    triggerTuner();
  });

  // Armor Penetration Goal & Max Range Slider
  document.getElementById("rwArmorGoalLevel").addEventListener("change", triggerTuner);
  document.getElementById("rwArmorMaxDistSlider").addEventListener("input", e => {
    document.getElementById("rwArmorMaxDist").value = e.target.value;
    triggerTuner();
  });
  document.getElementById("rwArmorMaxDist").addEventListener("input", e => {
    const d = Math.max(0, parseFloat(e.target.value) || 0);
    document.getElementById("rwArmorMaxDistSlider").value = Math.min(800, d);
    triggerTuner();
  });
  document.getElementById("rwPenCriterion").addEventListener("change", triggerTuner);
  document.getElementById("chkRwLiveSync").addEventListener("change", e => {
    if (e.target.checked) updateTunerPreviewAndOutputs(true);
  });

  // Bottom Tuner Action Buttons
  document.getElementById("btnRwApplyAll").addEventListener("click", () => {
    updateTunerPreviewAndOutputs(true);
  });
  document.getElementById("btnRwReset").addEventListener("click", () => {
    if (appState.originalRound) {
      appState.currentRound = deepClone(appState.originalRound);
      syncRoundInputsFromState();
      document.getElementById("rwPresetSelect").value = "__ACTIVE__";
      loadTunerFromRound(appState.currentRound);
      updateAllViews();
    }
  });
  document.getElementById("btnRwJumpExport").addEventListener("click", () => {
    updateTunerPreviewAndOutputs(true);
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    const expBtn = document.querySelector('.tab-btn[data-tab="tabExport"]');
    if (expBtn) expBtn.classList.add("active");
    document.getElementById("tabExport").classList.add("active");
  });

  document.getElementById("btnCopyConfig").addEventListener("click", () => {
    const pre = document.getElementById("configExportPre");
    navigator.clipboard.writeText(pre.textContent).then(() => {
      const btn = document.getElementById("btnCopyConfig");
      const old = btn.textContent;
      btn.textContent = "Copied to Clipboard!";
      setTimeout(() => { btn.textContent = old; }, 1600);
    });
  });

  window.addEventListener("resize", () => renderAllCharts());

  // Initialize ACE3 textures and render
  initAceTextures(() => {
    selectRoundByClass(defaultRound.className);
  });
});
