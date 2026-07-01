import struct
import zlib
import json
import os

class BinReader:
    def __init__(self, data):
        self.data = data
        self.pos = 0

    def read_int(self):
        val = struct.unpack_from("<i", self.data, self.pos)[0]
        self.pos += 4
        return val

    def read_uint(self):
        val = struct.unpack_from("<I", self.data, self.pos)[0]
        self.pos += 4
        return val

    def read_ushort(self):
        val = struct.unpack_from("<H", self.data, self.pos)[0]
        self.pos += 2
        return val

    def read_utf(self):
        length = self.read_ushort()
        val = self.data[self.pos:self.pos+length].decode("utf-8", errors="ignore")
        self.pos += length
        return val

def unpack_packages():
    # 1. Unpack 0F000000.binPackage
    with open("0F000000.binPackage", "rb") as f:
        pkg0_data = f.read()
    _, bin_count0 = struct.unpack_from("<IH", pkg0_data, 0)
    offset = 6
    bins0 = {}
    for _ in range(bin_count0):
        bin_len = struct.unpack_from("<I", pkg0_data, offset)[0]
        offset += 4
        bin_bytes = pkg0_data[offset:offset+bin_len]
        offset += bin_len
        decomp = zlib.decompress(bin_bytes)
        res_id = struct.unpack_from("<I", decomp, 0)[0]
        bins0[res_id] = decomp

    # 2. Unpack 0F000001.binPackage
    with open("0F000001.binPackage", "rb") as f:
        pkg1_data = f.read()
    _, bin_count1 = struct.unpack_from("<IH", pkg1_data, 0)
    offset = 6
    bins1 = {}
    for _ in range(bin_count1):
        bin_len = struct.unpack_from("<I", pkg1_data, offset)[0]
        offset += 4
        bin_bytes = pkg1_data[offset:offset+bin_len]
        offset += bin_len
        decomp = zlib.decompress(bin_bytes)
        res_id = struct.unpack_from("<I", decomp, 0)[0]
        bins1[res_id] = decomp

    return bins0, bins1

def safe_json_loads(s):
    try:
        return json.loads(s) if s else None
    except:
        return s

def export_partner_changes(bins0):
    reader = BinReader(bins0[16777417])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        name = reader.read_utf()
        effect = safe_json_loads(reader.read_utf())
        hero_lv = reader.read_uint()
        rewards = safe_json_loads(reader.read_utf())
        desc = reader.read_utf()
        rows.append({
            "id": row_id,
            "name": name,
            "effect": effect,
            "hero_level": hero_lv,
            "rewards": rewards,
            "description": desc
        })
    return rows

def export_hero_change_attrs(bins1):
    reader = BinReader(bins1[16777420])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        tab_idx = reader.read_int()
        star = safe_json_loads(reader.read_utf())
        chip_id = reader.read_int()
        chip_val = reader.read_int()
        reborn_gold = safe_json_loads(reader.read_utf())
        reset_gold = safe_json_loads(reader.read_utf())
        start_time = safe_json_loads(reader.read_utf())
        end_time = safe_json_loads(reader.read_utf())
        is_open = reader.read_int()
        city_id = reader.read_int()
        rows.append({
            "id": row_id,
            "tab_index": tab_idx,
            "star": star,
            "chip_id": chip_id,
            "chip_val": chip_val,
            "reborn_gold": reborn_gold,
            "reset_gold": reset_gold,
            "start_time": start_time,
            "end_time": end_time,
            "is_open": is_open,
            "city_id": city_id
        })
    return rows

def export_related_partners(bins0):
    reader = BinReader(bins0[16777468])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        hero_id = reader.read_uint()
        ptype = reader.read_uint()
        connect_id = reader.read_uint()
        cond_point = reader.read_uint()
        cond_star = reader.read_uint()
        cond_id = reader.read_uint()
        rows.append({
            "id": row_id,
            "hero_id": hero_id,
            "type": ptype,
            "connect_id": connect_id,
            "condition_point": cond_point,
            "condition_star": cond_star,
            "condition_id": cond_id
        })
    return rows

def export_related_partner_types(bins0):
    reader = BinReader(bins0[16777469])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        ptype = reader.read_uint()
        name = reader.read_utf()
        level = reader.read_uint()
        mat_count = reader.read_uint()
        props = safe_json_loads(reader.read_utf())
        rows.append({
            "id": row_id,
            "type": ptype,
            "name": name,
            "level": level,
            "material_count": mat_count,
            "properties": props
        })
    return rows

def export_related_conditions(bins0):
    reader = BinReader(bins0[16777470])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        cond = reader.read_utf()
        cond_html = reader.read_utf()
        rows.append({
            "id": row_id,
            "condition": cond,
            "condition_html": cond_html
        })
    return rows

def export_knives(bins0):
    reader = BinReader(bins0[16777296])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        name = reader.read_utf()
        bind_skill_id = reader.read_int()
        type_id = reader.read_int()
        handbook_id = reader.read_uint()
        appraise = reader.read_utf()
        get_road = reader.read_utf()
        att = reader.read_int()
        defense = reader.read_int()
        recovery = reader.read_int()
        resistance = reader.read_int()
        speed = reader.read_int()
        direction = reader.read_int()
        attr_type = safe_json_loads(reader.read_utf())
        base_val = safe_json_loads(reader.read_utf())
        grow_val = safe_json_loads(reader.read_utf())
        active_eff = safe_json_loads(reader.read_utf())
        rows.append({
            "id": row_id,
            "name": name,
            "bind_skill_id": bind_skill_id,
            "type_id": type_id,
            "handbook_id": handbook_id,
            "appraise": appraise,
            "get_road": get_road,
            "attack": att,
            "defense": defense,
            "recovery": recovery,
            "resistance": resistance,
            "speed": speed,
            "direction": direction,
            "attribute_type": attr_type,
            "base_value": base_val,
            "growth_value": grow_val,
            "active_effects": active_eff
        })
    return rows

def export_knife_expands(bins0):
    reader = BinReader(bins0[16777297])
    reader.read_uint()
    row_count = reader.read_uint()
    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        rel_id = reader.read_uint()
        lvl = reader.read_int()
        skill_id = reader.read_int()
        turns = safe_json_loads(reader.read_utf())
        effects = safe_json_loads(reader.read_utf())
        soul_lv_need = reader.read_int()
        quality = reader.read_int()
        soul_added = reader.read_int()
        front = safe_json_loads(reader.read_utf())
        mid = safe_json_loads(reader.read_utf())
        back = safe_json_loads(reader.read_utf())
        normal_exp = reader.read_uint()
        gold_exp = reader.read_uint()
        need_exp = reader.read_uint()
        rows.append({
            "id": row_id,
            "relation_id": rel_id,
            "level": lvl,
            "skill_id": skill_id,
            "turns": turns,
            "effects": effects,
            "soul_level_need": soul_lv_need,
            "quality": quality,
            "soul_added": soul_added,
            "added_front": front,
            "added_middle": mid,
            "added_back": back,
            "normal_exp": normal_exp,
            "gold_exp": gold_exp,
            "need_exp": need_exp
        })
    return rows

def main():
    bins0, bins1 = unpack_packages()
    
    out_dir = "game-database-tool/public/data"
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. PartnerChange
    pc = export_partner_changes(bins0)
    with open(f"{out_dir}/partner_changes.json", "w", encoding="utf-8") as f:
        json.dump({"table": "partner_changes", "rowCount": len(pc), "rows": pc}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(pc)} partner changes.")
    
    # 2. HeroChangeAttr
    hca = export_hero_change_attrs(bins1)
    with open(f"{out_dir}/hero_change_attrs.json", "w", encoding="utf-8") as f:
        json.dump({"table": "hero_change_attrs", "rowCount": len(hca), "rows": hca}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(hca)} hero change attrs.")
    
    # 3. RelatedPartner
    rp = export_related_partners(bins0)
    with open(f"{out_dir}/related_partners.json", "w", encoding="utf-8") as f:
        json.dump({"table": "related_partners", "rowCount": len(rp), "rows": rp}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(rp)} related partners.")
    
    # 4. RelatedPartnerType
    rpt = export_related_partner_types(bins0)
    with open(f"{out_dir}/related_partner_types.json", "w", encoding="utf-8") as f:
        json.dump({"table": "related_partner_types", "rowCount": len(rpt), "rows": rpt}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(rpt)} related partner types.")
    
    # 5. RelatedCondition
    rc = export_related_conditions(bins0)
    with open(f"{out_dir}/related_conditions.json", "w", encoding="utf-8") as f:
        json.dump({"table": "related_conditions", "rowCount": len(rc), "rows": rc}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(rc)} related conditions.")
    
    # 6. Knives
    kn = export_knives(bins0)
    with open(f"{out_dir}/knives.json", "w", encoding="utf-8") as f:
        json.dump({"table": "knives", "rowCount": len(kn), "rows": kn}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(kn)} knives.")
    
    # 7. KnifeExpands
    ke = export_knife_expands(bins0)
    with open(f"{out_dir}/knife_expands.json", "w", encoding="utf-8") as f:
        json.dump({"table": "knife_expands", "rowCount": len(ke), "rows": ke}, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(ke)} knife expands.")

if __name__ == "__main__":
    main()
