#!/usr/bin/env python3
"""
Scrapes Arma 3 Vanilla, DLCs, and the exact mod list from RealishAntistasiGulfv0_3.html
(Aegis, Marines, Police, Atlas, OpFor, Athena, Revolución, AddGis, JCA Arsenal/Equipment/Land,
Project M [MCC/MIG/MPP/MSS/MHS], Quiggs Firearms, USMC 2035, USP Gear, MAAWS, ACE3,
Realish Combat Armoury Neo/Antiques/REDWEP, etc.) with ZERO RHS content.

Extracts all root and nested `config.bin`/`config.cpp` and `stringtable.xml`/`stringtable.bin`
files inside each PBO, resolves CfgAmmo, CfgMagazines, CfgWeapons, and CfgVehicles inheritance
trees, and exports `/home/kibb/projects/personal/ammomaster/arma_database.json`.
"""
import os
import re
import sys
import glob
import json
import struct
import subprocess
import tempfile
import xml.etree.ElementTree as ET

HEMTT = "/home/kibb/.cargo/bin/hemtt"
ARMA_DIR = "/home/kibb/.local/share/Steam/steamapps/common/Arma 3"
WS_DIR = "/home/kibb/.local/share/Steam/steamapps/workshop/content/107410"

VANILLA_LANGUAGE_PBOS = [
    f"{ARMA_DIR}/Addons/language_f.pbo",
    f"{ARMA_DIR}/Addons/language_f_beta.pbo",
    f"{ARMA_DIR}/Addons/language_f_gamma.pbo",
    f"{ARMA_DIR}/Addons/language_f_epa.pbo",
    f"{ARMA_DIR}/Addons/language_f_epb.pbo",
    f"{ARMA_DIR}/Addons/language_f_epc.pbo",
    f"{ARMA_DIR}/Addons/language_f_bootcamp.pbo",
    f"{ARMA_DIR}/Addons/language_f_mod.pbo",
    f"{ARMA_DIR}/Mark/Addons/language_f_mark.pbo",
    f"{ARMA_DIR}/Expansion/Addons/language_f_exp.pbo",
    f"{ARMA_DIR}/Jets/Addons/language_f_jets.pbo",
    f"{ARMA_DIR}/Orange/Addons/language_f_orange.pbo",
    f"{ARMA_DIR}/Tank/Addons/language_f_tank.pbo",
    f"{ARMA_DIR}/Enoch/Addons/language_f_enoch.pbo",
    f"{ARMA_DIR}/AoW/Addons/language_f_aow.pbo",
    f"{ARMA_DIR}/Argo/Addons/language_f_patrol.pbo",
]

VANILLA_CONFIG_PBOS = [
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_beta.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_gamma.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_epa.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_epb.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_epc.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_bootcamp.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_mod.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/weapons_f_decade.pbo"),
    ("Marksmen", f"{ARMA_DIR}/Mark/Addons/weapons_f_mark.pbo"),
    ("Apex", f"{ARMA_DIR}/Expansion/Addons/weapons_f_exp.pbo"),
    ("Jets", f"{ARMA_DIR}/Jets/Addons/weapons_f_jets.pbo"),
    ("Laws of War", f"{ARMA_DIR}/Orange/Addons/weapons_f_orange.pbo"),
    ("Tanks", f"{ARMA_DIR}/Tank/Addons/weapons_f_tank.pbo"),
    ("Contact", f"{ARMA_DIR}/Enoch/Addons/weapons_f_enoch.pbo"),
    ("Malden", f"{ARMA_DIR}/Argo/Addons/weapons_f_patrol.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_beta.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_gamma.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_epa.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_epb.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_epc.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_bootcamp.pbo"),
    ("Vanilla", f"{ARMA_DIR}/Addons/characters_f_decade.pbo"),
    ("Marksmen", f"{ARMA_DIR}/Mark/Addons/characters_f_mark.pbo"),
    ("Apex", f"{ARMA_DIR}/Expansion/Addons/characters_f_exp.pbo"),
    ("Apex", f"{ARMA_DIR}/Expansion/Addons/characters_f_oldman.pbo"),
    ("Jets", f"{ARMA_DIR}/Jets/Addons/characters_f_jets.pbo"),
    ("Laws of War", f"{ARMA_DIR}/Orange/Addons/characters_f_orange.pbo"),
    ("Tanks", f"{ARMA_DIR}/Tank/Addons/characters_f_tank.pbo"),
    ("Contact", f"{ARMA_DIR}/Enoch/Addons/characters_f_enoch.pbo"),
    ("Art of War", f"{ARMA_DIR}/AoW/Addons/characters_f_aow.pbo"),
    ("Malden", f"{ARMA_DIR}/Argo/Addons/characters_f_patrol.pbo"),
]

# Mods from RealishAntistasiGulfv0_3.html in load order (content mods first, then ACE3 & Realish Armoury patches)
WORKSHOP_MODS = [
    ("949252631",  "Aegis"),
    ("2225864448", "Aegis Marines"),
    ("2225865544", "Aegis Police"),
    ("2225873516", "Atlas"),
    ("1873244913", "Atlas OpFor"),
    ("2843094358", "Athena"),
    ("2684335735", "Revolución"),
    ("3375426996", "AddGis"),
    ("3333302397", "JCA Arsenal"),
    ("3473383676", "JCA Equipment"),
    ("3668969444", "JCA Land Systems"),
    ("3615039550", "Project M"),
    ("3557431447", "Quiggs Firearms"),
    ("3505099041", "USMC 2035"),
    ("2044374502", "USP Gear"),
    ("2049719091", "USP Gear"),
    ("2589302544", "MAAWS Ammo"),
    ("3283642267", "Speshal Core"),
    ("3283645995", "Breach"),
    ("2087221377", "Starstreak HVM"),
    ("3612124287", "RKSL Vehicle Weapons"),
    ("3058335345", "TBD Mortars"),
    ("3183189354", "2B9 Vasilek"),
    ("3203941036", "120-PM-43"),
    ("3356373534", "D-20 M1955"),
    ("3513865313", "AZP S-60"),
    ("3233638297", "M119A3"),
    ("2472780935", "M224 Mortar"),
    ("3251627825", "MT-12 Rapira"),
    ("3210473909", "Grad-P"),
    ("3382728502", "Type 63 MLRS"),
    ("2170387941", "ToH Characters"),
    ("1351428303", "AH-64D Official"),
    ("1745501605", "Hatchet H-60"),
    ("2397360831", "USAF Mod"),
    ("2226368165", "USAF AC-130"),
    ("3342284397", "EMB 312 Tucano"),
    ("3392051103", "F-16V"),
    ("3370159358", "F-22A"),
    ("3517620967", "F-35B"),
    ("3083645332", "F-35C"),
    ("3460981677", "GX Drones"),
    ("3338336690", "Realish Drones"),
    ("3355618886", "QAV Vehicles"),
    ("3365663203", "QAV Vehicles"),
    ("3438106991", "QAV Vehicles"),
    ("3348478765", "QAV Vehicles"),
    ("3549724950", "QAV Vehicles"),
    ("3388436328", "QAV Vehicles"),
    ("3393857173", "QAV Vehicles"),
    # Patch / Ballistics / Overhaul mods from preset
    ("463939057",  "ACE3"),
    ("3503164508", "Aegis ACEAX"),
    ("3726123141", "Realish Antiques"),
    ("3726126346", "Realish REDWEP"),
    ("3605272144", "Realish Armoury"),
]

PATCH_MOD_NAMES = {"ACE3", "Aegis ACEAX", "Realish Armoury"}

SKIP_PBO_SUBSTRINGS = (
    "rhs", "cup_", "cwr3", "_gm", "_sog", "_spe", "anims_", "sounds_", "music_",
    "dubbing_", "editorpreviews_", "missions_", "structures_", "props_", "animals_"
)


def scan_pbo_entries(pbo_path):
    """
    Fast pure-Python PBO header parser.
    Returns list of (rel_path, mime, data_offset, data_size) for config and stringtable files.
    """
    try:
        with open(pbo_path, "rb") as f:
            data = f.read(1048576)
        pos = 0
        raw_entries = []
        while pos < len(data):
            end = data.find(b"\x00", pos)
            if end == -1:
                break
            fname = data[pos:end].decode("utf-8", errors="ignore")
            pos = end + 1
            if pos + 20 > len(data):
                break
            mime, orig, res, ts, size = struct.unpack_from("<5I", data, pos)
            pos += 20
            if mime == 0x56657273:  # Vers header block
                while pos < len(data):
                    e2 = data.find(b"\x00", pos)
                    if e2 == -1:
                        break
                    s = data[pos:e2]
                    pos = e2 + 1
                    if not s:
                        break
            elif fname == "" and mime == 0 and size == 0:
                break
            else:
                raw_entries.append((fname, mime, orig, size))

        data_start = pos
        cur_offset = data_start
        matched = []
        for fname, mime, orig, size in raw_entries:
            base = fname.replace("\\", "/").split("/")[-1].lower()
            if base in ("config.bin", "config.cpp", "stringtable.xml", "stringtable.bin"):
                matched.append((fname, base, mime, cur_offset, size))
            cur_offset += size
        return matched
    except Exception:
        return []


def read_pbo_entry_bytes(pbo_path, fname, mime, offset, size, tmpdir, uid):
    # If uncompressed (mime == 0), read directly from file in 0.05ms!
    if mime == 0 and size > 0:
        try:
            with open(pbo_path, "rb") as f:
                f.seek(offset)
                return f.read(size)
        except Exception:
            pass
    # Otherwise use hemtt utils pbo extract (handles Mikero Cprs LZO compression)
    out_file = os.path.join(tmpdir, f"ext_{uid}")
    r = subprocess.run([HEMTT, "utils", "pbo", "extract", pbo_path, fname, out_file], capture_output=True)
    if r.returncode == 0 and os.path.exists(out_file):
        with open(out_file, "rb") as f:
            b = f.read()
        try:
            os.remove(out_file)
        except OSError:
            pass
        return b
    return None


def parse_blmx(data):
    res = {}
    if not data or not data.startswith(b"BLMX"):
        return res
    try:
        pos = 4
        num_langs = struct.unpack_from("<I", data, pos)[0]
        pos += 4
        langs = []
        for _ in range(num_langs):
            end = data.index(b"\x00", pos)
            langs.append(data[pos:end].decode("utf-8", errors="replace"))
            pos = end + 1
        eng_idx = 0
        for i, l in enumerate(langs):
            if l.lower() == "english":
                eng_idx = i
                break
        n_offsets = struct.unpack_from("<I", data, pos)[0]
        pos += 4
        offsets = [struct.unpack_from("<I", data, pos + 4 * i)[0] for i in range(n_offsets)]
        pos += 4 * n_offsets
        num_keys = struct.unpack_from("<I", data, pos)[0]
        pos += 4
        keys = []
        for _ in range(num_keys):
            end = data.index(b"\x00", pos)
            keys.append(data[pos:end].decode("utf-8", errors="replace").lower())
            pos = end + 1
        eng_pos = offsets[eng_idx]
        num_vals = struct.unpack_from("<I", data, eng_pos)[0]
        eng_pos += 4
        for i in range(min(num_keys, num_vals)):
            end = data.index(b"\x00", eng_pos)
            val = data[eng_pos:end].decode("utf-8", errors="replace")
            eng_pos = end + 1
            res[keys[i]] = val
    except Exception:
        pass
    return res


def parse_xml(data):
    res = {}
    if not data:
        return res
    try:
        text = data.decode("utf-8", errors="replace")
        root = ET.fromstring(text)
        for key_elem in root.iter("Key"):
            kid = key_elem.attrib.get("ID", "").lower()
            if not kid:
                continue
            eng = key_elem.find("English")
            orig = key_elem.find("Original")
            val = None
            if eng is not None and eng.text:
                val = eng.text
            elif orig is not None and orig.text:
                val = orig.text
            if val:
                res[kid] = val.strip()
    except Exception:
        pass
    return res


def localize(val, strings):
    if not isinstance(val, str):
        return ""
    v = val.strip()
    if v.startswith("$"):
        k = v[1:].lower()
        return strings.get(k, v)
    return v


def deep_merge_class(base_dict, override_dict, mod_name):
    if not isinstance(override_dict, dict):
        return
    ci_map = {k.lower(): k for k in base_dict.keys()}
    for k, v in override_dict.items():
        if v is None:
            continue
        kl = k.lower()
        target_k = ci_map.get(kl, k)
        if isinstance(v, dict):
            non_meta = [pk for pk in v.keys() if not pk.startswith("__") and v[pk] is not None]
            if target_k not in base_dict or not isinstance(base_dict[target_k], dict):
                base_dict[target_k] = dict(v)
                ci_map[kl] = target_k
                if len(non_meta) > 0:
                    base_dict[target_k]["__mod"] = mod_name
            else:
                if len(non_meta) == 0:
                    continue
                parent = v.get("__parent") or base_dict[target_k].get("__parent")
                deep_merge_class(base_dict[target_k], v, mod_name)
                if parent:
                    base_dict[target_k]["__parent"] = parent
                if "__mod" not in base_dict[target_k]:
                    base_dict[target_k]["__mod"] = mod_name
                elif mod_name not in PATCH_MOD_NAMES:
                    base_dict[target_k]["__mod"] = mod_name
        else:
            base_dict[target_k] = v
            ci_map[kl] = target_k


def resolve_tree(d):
    ci = {k.lower(): k for k in d.keys() if isinstance(d[k], dict)}
    resolved = {}
    visiting = set()

    def get_resolved(cname):
        cl = cname.lower()
        if cl in resolved:
            return resolved[cl]
        if cl not in ci:
            return {}
        if cl in visiting:
            return d[ci[cl]]
        visiting.add(cl)
        actual_key = ci[cl]
        raw = d[actual_key]
        if not isinstance(raw, dict):
            visiting.remove(cl)
            return {}
        parent_name = raw.get("__parent")
        res = {}
        if parent_name and isinstance(parent_name, str) and parent_name.lower() != cl:
            parent_res = get_resolved(parent_name)
            res = json.loads(json.dumps(parent_res))

        def merge_into(dst, src):
            dst_ci = {dk.lower(): dk for dk in dst.keys()}
            for k, v in src.items():
                if v is None:
                    continue
                tk = dst_ci.get(k.lower(), k)
                if isinstance(v, dict) and tk in dst and isinstance(dst[tk], dict):
                    merge_into(dst[tk], v)
                else:
                    dst[tk] = json.loads(json.dumps(v)) if isinstance(v, (dict, list)) else v
                    dst_ci[k.lower()] = tk

        merge_into(res, raw)
        res["__class"] = actual_key
        chain = [actual_key]
        if parent_name and isinstance(parent_name, str) and parent_name.lower() in ci and parent_name.lower() != cl:
            p_res = get_resolved(parent_name)
            chain.extend(p_res.get("__chain", [parent_name]))
        elif parent_name and isinstance(parent_name, str):
            chain.append(parent_name)
        res["__chain"] = chain
        visiting.remove(cl)
        resolved[cl] = res
        return res

    for k in list(ci.values()):
        get_resolved(k)
    return {v["__class"]: v for v in resolved.values() if "__class" in v}


def to_float(val, default=0.0):
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = re.sub(r"[^0-9eE.+\-]", "", val)
        try:
            return float(cleaned) if cleaned else default
        except ValueError:
            return default
    return default


def to_int(val, default=0):
    return int(round(to_float(val, default)))


def get_ci(d, key, default=None):
    if not isinstance(d, dict):
        return default
    kl = key.lower()
    for k, v in d.items():
        if k.lower() == kl:
            return v
    return default


def discover_all_pbos():
    pbos = []
    for p in VANILLA_LANGUAGE_PBOS:
        if os.path.exists(p):
            pbos.append(("Vanilla", p, True))
    for mod, p in VANILLA_CONFIG_PBOS:
        if os.path.exists(p):
            pbos.append((mod, p, False))

    for mid, mname in WORKSHOP_MODS:
        mdir = os.path.join(WS_DIR, mid)
        if not os.path.exists(mdir):
            continue
        for pbo in sorted(glob.glob(os.path.join(mdir, "**", "*.pbo"), recursive=True)):
            bname = os.path.basename(pbo).lower()
            if any(skip in bname for skip in SKIP_PBO_SUBSTRINGS):
                continue
            # For ACE3, only include relevant ballistics/medical/weapons/names PBOs and stringtables
            if mid == "463939057":
                if not any(k in bname for k in [
                    "ballistics", "medical", "smallarms", "realisticnames", "compat_ws",
                    "compat_rf", "grenades", "explosives", "nlaw", "javelin", "spike",
                    "metis", "dragon", "missile", "hellfire", "maverick", "hot", "xm157", "frag"
                ]):
                    continue
            pbos.append((mname, pbo, False))
    return pbos


def main():
    all_pbos = discover_all_pbos()
    print(f"Discovered {len(all_pbos)} non-RHS PBOs across Vanilla, DLCs, and RealishAntistasiGulfv0_3.html.")

    strings = {}
    cfg_ammo = {}
    cfg_magazines = {}
    cfg_weapons = {}
    cfg_vehicles = {}

    with tempfile.TemporaryDirectory() as tmpdir:
        uid = 0
        config_count = 0
        for mod, pbo, lang_only in all_pbos:
            entries = scan_pbo_entries(pbo)
            for fname, base, mime, offset, size in entries:
                uid += 1
                if base in ("stringtable.bin", "stringtable.xml"):
                    b = read_pbo_entry_bytes(pbo, fname, mime, offset, size, tmpdir, uid)
                    if b:
                        if base.endswith(".bin"):
                            strings.update(parse_blmx(b))
                        else:
                            strings.update(parse_xml(b))
                elif not lang_only and base in ("config.bin", "config.cpp"):
                    b = read_pbo_entry_bytes(pbo, fname, mime, offset, size, tmpdir, uid)
                    if not b:
                        continue
                    in_file = os.path.join(tmpdir, f"cfg_{uid}.{base.split('.')[-1]}")
                    json_path = os.path.join(tmpdir, f"cfg_{uid}.json")
                    with open(in_file, "wb") as f:
                        f.write(b)
                    cmd = "derapify" if base.endswith(".bin") else "convert"
                    subprocess.run([HEMTT, "utils", "config", cmd, "-f", "json", in_file, json_path], capture_output=True)
                    if os.path.exists(json_path):
                        config_count += 1
                        try:
                            with open(json_path) as f:
                                data = json.load(f)
                            for tk, tv in data.items():
                                if not isinstance(tv, dict):
                                    continue
                                tkl = tk.lower()
                                if tkl == "cfgammo":
                                    deep_merge_class(cfg_ammo, tv, mod)
                                elif tkl == "cfgmagazines":
                                    deep_merge_class(cfg_magazines, tv, mod)
                                elif tkl == "cfgweapons":
                                    deep_merge_class(cfg_weapons, tv, mod)
                                elif tkl == "cfgvehicles":
                                    deep_merge_class(cfg_vehicles, tv, mod)
                        except Exception:
                            pass
                        try:
                            os.remove(json_path)
                        except OSError:
                            pass
                    try:
                        os.remove(in_file)
                    except OSError:
                        pass

        print(f"1. Loaded {len(strings)} localized strings and parsed {config_count} config files.")
        print("2. Resolving inheritance trees...")
        res_ammo = resolve_tree(cfg_ammo)
        res_mag = resolve_tree(cfg_magazines)
        res_weap = resolve_tree(cfg_weapons)
        res_veh = resolve_tree(cfg_vehicles)

        # Map ammo -> primary magazine info + all scope=2 magazine classes using that ammo
        ammo_to_mag = {}
        ammo_to_all_mags = {}
        for mname, mdata in res_mag.items():
            if not isinstance(mdata, dict):
                continue
            if "rhs" in mname.lower():
                continue
            ammo_cls = get_ci(mdata, "ammo")
            if not ammo_cls or not isinstance(ammo_cls, str):
                continue
            init_spd = to_float(get_ci(mdata, "initSpeed"), 0)
            disp = localize(get_ci(mdata, "displayName", ""), strings)
            scope = to_int(get_ci(mdata, "scope"), 0)
            mparent = mdata.get("__parent", "CA_Magazine")
            if not isinstance(mparent, str) or not mparent:
                mparent = "CA_Magazine"
            al = ammo_cls.lower()
            if al not in ammo_to_mag or (scope == 2 and ammo_to_mag[al]["scope"] != 2) or (disp and not ammo_to_mag[al]["magName"]):
                ammo_to_mag[al] = {
                    "magClass": mname,
                    "magParent": mparent,
                    "magName": disp,
                    "initSpeed": init_spd,
                    "scope": scope,
                    "mod": mdata.get("__mod", "Vanilla")
                }
            if scope >= 1 and not mname.lower().endswith("_base"):
                lst = ammo_to_all_mags.setdefault(al, [])
                if len(lst) < 12 and not any(x["c"] == mname for x in lst):
                    lst.append({"c": mname, "p": mparent, "s": scope})

        # Extract rounds
        rounds_out = []
        bullet_Ancestors = {"bulletbase", "b_556x45_ball", "b_762x51_ball", "b_65x39_caseless", "b_9x21_ball", "b_127x99_ball", "shotgunbase", "shellbase", "rocketbase", "missilebase", "grenadebase", "submunitionbase"}
        for cname, cdata in res_ammo.items():
            if not isinstance(cdata, dict):
                continue
            if "rhs" in cname.lower():
                continue
            chain_lower = [x.lower() for x in cdata.get("__chain", [])]
            if not any(anc in chain_lower for anc in bullet_Ancestors):
                continue
            hit = to_float(get_ci(cdata, "hit"), 0)
            caliber = to_float(get_ci(cdata, "caliber"), 0)
            typ_speed = to_float(get_ci(cdata, "typicalSpeed"), 0)
            air_fric = to_float(get_ci(cdata, "airFriction"), 0)
            ace_dmg_type = get_ci(cdata, "ACE_damageType", "")
            sim = str(get_ci(cdata, "simulation", "")).lower()

            is_bullet = ("bulletbase" in chain_lower or "shotgunbase" in chain_lower or ace_dmg_type == "bullet" or sim == "shotbullet")
            if not is_bullet and hit <= 0:
                continue
            if is_bullet and (hit <= 0 or (typ_speed <= 0 and caliber <= 0)):
                continue
            if cname.lower() in {"bulletbase", "bulletcore", "shotgunbase", "shellbase", "shellcore", "grenadebase", "rocketbase", "missilebase"}:
                continue
            # Filter out fake/dummy/submunition/casings/flare/smoke/laser rounds for kinetic wizard unless valid bullet/anti-armor
            if any(bad in cname.lower() for bad in ["casing", "fx", "dummy", "deploy", "smoke", "flare", "illum", "laser", " IR", "chem", "flashbang", "breach"]):
                continue
            if not is_bullet and cname.lower() not in ammo_to_mag:
                continue

            mag_info = ammo_to_mag.get(cname.lower(), {})
            init_speed = mag_info.get("initSpeed", 0) or typ_speed or 800.0
            if is_bullet and init_speed <= 15:
                continue

            mod_label = cdata.get("__mod", "Vanilla")
            if mod_label == "Vanilla" and mag_info.get("mod") and mag_info["mod"] != "Vanilla":
                mod_label = mag_info["mod"]

            all_mags = ammo_to_all_mags.get(cname.lower(), [])
            scope2_mags = [m for m in all_mags if m["s"] == 2]
            chosen_mags = scope2_mags if scope2_mags else all_mags[:4]

            entry = {
                "className": cname,
                "mod": mod_label,
                "parent": cdata.get("__parent", "BulletBase"),
                "magClass": mag_info.get("magClass", ""),
                "magParent": mag_info.get("magParent", "CA_Magazine"),
                "magName": mag_info.get("magName", ""),
                "hit": round(hit, 4),
                "indirectHit": round(to_float(get_ci(cdata, "indirectHit"), 0), 4),
                "indirectHitRange": round(to_float(get_ci(cdata, "indirectHitRange"), 0), 4),
                "caliber": round(caliber if caliber > 0 else 1.0, 4),
                "typicalSpeed": round(typ_speed if typ_speed > 0 else init_speed, 2),
                "initSpeed": round(init_speed, 2),
                "airFriction": round(air_fric if air_fric != 0 else -0.001, 7),
                "deflecting": round(to_float(get_ci(cdata, "deflecting"), 15.0), 2),
                "explosive": round(to_float(get_ci(cdata, "explosive"), 0.0), 3),
                "ACE_damageType": ace_dmg_type if isinstance(ace_dmg_type, str) and ace_dmg_type else ("bullet" if is_bullet else "explosive"),
            }

            for ace_num in ["ACE_caliber", "ACE_bulletLength", "ACE_bulletMass", "ACE_dragModel"]:
                v = get_ci(cdata, ace_num)
                if v is not None:
                    entry[ace_num] = round(to_float(v), 4) if ace_num != "ACE_dragModel" else to_int(v, 1)

            for ace_arr in ["ACE_ballisticCoefficients", "ACE_muzzleVelocities", "ACE_barrelLengths"]:
                arr = get_ci(cdata, ace_arr)
                if isinstance(arr, list) and len(arr) > 0:
                    entry[ace_arr] = [round(to_float(x), 4) for x in arr if to_float(x) > 0]

            if chosen_mags:
                entry["mags"] = [{"c": m["c"], "p": m["p"]} for m in chosen_mags[:8]]

            rounds_out.append(entry)

        # Extract Vests, Helmets, Uniforms
        vests_out = []
        helmets_out = []
        uniforms_out = []

        def extract_hpi(item_info):
            hpi = get_ci(item_info, "HitpointsProtectionInfo")
            if not isinstance(hpi, dict):
                return {}
            out = {}
            for k, v in hpi.items():
                if k.startswith("__") or not isinstance(v, dict):
                    continue
                hp_name = get_ci(v, "hitpointName", k)
                if not isinstance(hp_name, str) or not hp_name:
                    hp_name = k
                arm = to_float(get_ci(v, "armor"), 0)
                pt = to_float(get_ci(v, "passThrough"), 1.0)
                if arm > 0 or pt < 1.0:
                    out[hp_name] = {
                        "armor": round(arm, 3),
                        "passThrough": round(pt, 3)
                    }
            return out

        for cname, cdata in res_weap.items():
            if not isinstance(cdata, dict) or "rhs" in cname.lower():
                continue
            scope = to_int(get_ci(cdata, "scope"), 0)
            if scope < 2:
                continue
            ii_raw = get_ci(cdata, "ItemInfo")
            if not isinstance(ii_raw, dict):
                continue
            ii = json.loads(json.dumps(ii_raw))
            ii_parent = ii.get("__parent")
            if isinstance(ii_parent, str) and ii_parent.lower() != "iteminfo":
                ii_base = get_ci(res_weap, ii_parent)
                if isinstance(ii_base, dict):
                    merged_ii = json.loads(json.dumps(ii_base))
                    deep_merge_class(merged_ii, ii, cdata.get("__mod", "Vanilla"))
                    ii = merged_ii
            itype = to_int(get_ci(ii, "type"), 0)
            chain_lower = [x.lower() for x in cdata.get("__chain", [])]
            dname = localize(get_ci(cdata, "displayName", ""), strings)
            if not dname or dname.startswith("$"):
                dname = cname
            desc = localize(get_ci(cdata, "descriptionShort", ""), strings)
            desc = re.sub(r"<br\s*/?>", " | ", desc, flags=re.I)
            desc = re.sub(r"<[^>]+>", "", desc).strip()
            mass_val = round(to_float(get_ci(ii, "mass"), 0), 2)
            mod_name = cdata.get("__mod", "Vanilla")
            w_parent = cdata.get("__parent", "")
            p_res = get_ci(res_weap, w_parent) if w_parent else None
            parent_base = p_res.get("__parent", "") if isinstance(p_res, dict) else ""
            if not isinstance(parent_base, str):
                parent_base = ""
            parent_has_ii = isinstance(get_ci(p_res, "ItemInfo") if isinstance(p_res, dict) else None, dict)
            raw_cls = get_ci(cfg_weapons, cname)
            raw_ii = get_ci(raw_cls, "ItemInfo") if isinstance(raw_cls, dict) else None
            raw_ii_p = raw_ii.get("__parent") if isinstance(raw_ii, dict) else None

            if itype == 701 or any(x in chain_lower for x in ["vest_camo_base", "vest_nocamo_base", "vest_base"]):
                hpi = extract_hpi(ii)
                if hpi or itype == 701:
                    ii_p_out = raw_ii_p if (isinstance(raw_ii_p, str) and raw_ii_p and raw_ii_p.lower() != "iteminfo") else ("ItemInfo" if parent_has_ii else "VestItem")
                    vests_out.append({
                        "className": cname,
                        "parent": w_parent or "Vest_Camo_Base",
                        "parentBase": parent_base,
                        "iiParent": ii_p_out,
                        "displayName": dname,
                        "mod": mod_name,
                        "description": desc,
                        "mass": mass_val,
                        "protection": hpi
                    })
            if itype == 605 or any(x in chain_lower for x in ["h_helmetb", "helmetbase"]):
                hpi = extract_hpi(ii)
                if hpi or cname.upper().startswith(("H_HELMET", "MIG_", "JCA_H_")):
                    ii_p_out = raw_ii_p if (isinstance(raw_ii_p, str) and raw_ii_p and raw_ii_p.lower() != "iteminfo") else ("ItemInfo" if parent_has_ii else "HeadgearItem")
                    helmets_out.append({
                        "className": cname,
                        "parent": w_parent or "H_HelmetB",
                        "parentBase": parent_base,
                        "iiParent": ii_p_out,
                        "displayName": dname,
                        "mod": mod_name,
                        "description": desc,
                        "mass": mass_val,
                        "protection": hpi
                    })
            if itype == 801 or "uniform_base" in chain_lower or cname.upper().startswith("U_"):
                u_cls = get_ci(ii, "uniformClass", "")
                if not isinstance(u_cls, str) or not u_cls:
                    continue
                veh = get_ci(res_veh, u_cls, {})
                if not isinstance(veh, dict) or not veh:
                    veh = get_ci(res_veh, "CAManBase", {})
                base_armor = to_float(get_ci(veh, "armor"), 2.0)
                base_struct = to_float(get_ci(veh, "armorStructural"), 4.0)
                hps_raw = get_ci(veh, "HitPoints", {})
                hps_out = {}
                target_hps = [
                    "HitFace", "HitNeck", "HitHead", "HitPelvis", "HitAbdomen",
                    "HitDiaphragm", "HitChest", "HitBody", "HitArms", "HitHands",
                    "HitLegs", "HitLeftArm", "HitRightArm", "HitLeftLeg", "HitRightLeg"
                ]
                for thp in target_hps:
                    hp_entry = get_ci(hps_raw, thp)
                    if not isinstance(hp_entry, dict):
                        hp_entry = {}
                    fallback = {}
                    if thp in ["HitLeftArm", "HitRightArm"]:
                        fallback = get_ci(hps_raw, "HitHands") or get_ci(hps_raw, "HitArms") or {}
                    elif thp in ["HitLeftLeg", "HitRightLeg"]:
                        fallback = get_ci(hps_raw, "HitLegs") or {}
                    if not isinstance(fallback, dict):
                        fallback = {}
                    hp_a = to_float(get_ci(hp_entry, "armor", get_ci(fallback, "armor", 1.0)), 1.0)
                    hp_pt = to_float(get_ci(hp_entry, "passThrough", get_ci(fallback, "passThrough", 1.0)), 1.0)
                    hp_es = to_float(get_ci(hp_entry, "explosionShielding", get_ci(fallback, "explosionShielding", 1.0)), 1.0)
                    hps_out[thp] = {
                        "armor": round(hp_a, 3),
                        "passThrough": round(hp_pt, 3),
                        "explosionShielding": round(hp_es, 3)
                    }
                sig = (mod_name, round(base_armor, 2), round(base_struct, 2), json.dumps(hps_out, sort_keys=True))
                if len([u for u in uniforms_out if u["sig"] == sig]) < 6 or cname in ["U_BasicBody", "U_B_CombatUniform_mcam", "U_O_CombatUniform_ocamo", "U_O_V_Soldier_Viper_F", "U_I_CombatUniform"]:
                    uniforms_out.append({
                        "className": cname,
                        "displayName": dname,
                        "uniformClass": u_cls,
                        "mod": mod_name,
                        "armor": round(base_armor, 3),
                        "armorStructural": round(base_struct, 3),
                        "hitpoints": hps_out,
                        "sig": sig
                    })

        for u in uniforms_out:
            u.pop("sig", None)

        def dedup_gear(items, max_per_sig=8):
            counts = {}
            out = []
            for x in items:
                sig = (x["mod"], json.dumps(x["protection"], sort_keys=True))
                c = counts.get(sig, 0)
                if c < max_per_sig:
                    counts[sig] = c + 1
                    out.append(x)
            return out

        rounds_out.sort(key=lambda x: (x["mod"], x["className"]))
        vests_out = sorted(dedup_gear(vests_out, 8), key=lambda x: (x["mod"], x["displayName"], x["className"]))
        helmets_out = sorted(dedup_gear(helmets_out, 8), key=lambda x: (x["mod"], x["displayName"], x["className"]))
        uniforms_out.sort(key=lambda x: (x["mod"], x["displayName"], x["className"]))

        print(f"3. Extracted {len(rounds_out)} rounds, {len(vests_out)} vests, {len(helmets_out)} helmets, {len(uniforms_out)} uniforms.")

        db = {
            "rounds": rounds_out,
            "vests": vests_out,
            "helmets": helmets_out,
            "uniforms": uniforms_out
        }
        out_file = "/home/kibb/projects/personal/ammomaster/arma_database.json"
        with open(out_file, "w") as f:
            json.dump(db, f, indent=2)
        print(f"4. Saved database to {out_file} ({os.path.getsize(out_file)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
