import struct
import zlib
import json
import os

class BinReader:
    def __init__(self, data):
        self.data = data
        self.pos = 0

    def read_uint(self):
        val = struct.unpack_from("<I", self.data, self.pos)[0]
        self.pos += 4
        return val

    def read_int(self):
        val = struct.unpack_from("<i", self.data, self.pos)[0]
        self.pos += 4
        return val

    def read_float(self):
        val = struct.unpack_from("<f", self.data, self.pos)[0]
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

def main():
    package_path = "0F000000.binPackage"
    if not os.path.exists(package_path):
        package_path = "../0F000000.binPackage"
    if not os.path.exists(package_path):
        print("Error: 0F000000.binPackage not found.")
        return

    print(f"Reading {package_path}...")
    with open(package_path, "rb") as f:
        package_data = f.read()

    package_id, bin_count = struct.unpack_from("<IH", package_data, 0)
    offset = 6
    
    bins = {}
    target_ids = {
        16777251: "military",
        16777558: "culling_magic",
        16777559: "culling_stage",
        16777531: "equip_forge",
        16777532: "equip_advance",
        16777481: "nightmare_point",
        16777483: "nightmare_city"
    }

    for _ in range(bin_count):
        bin_len = struct.unpack_from("<I", package_data, offset)[0]
        offset += 4
        bin_bytes = package_data[offset:offset+bin_len]
        offset += bin_len

        decompressed = zlib.decompress(bin_bytes)
        res_id = struct.unpack_from("<I", decompressed, 0)[0]
        if res_id in target_ids:
            bins[res_id] = decompressed

    output_dir = "game-database-tool/public/data"
    if not os.path.exists(output_dir):
        output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Military
    if 16777251 in bins:
        print("Parsing Military...")
        reader = BinReader(bins[16777251])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            name = reader.read_utf()
            prefix_befor = reader.read_utf()
            prefix_end = reader.read_utf()
            need_credit = reader.read_uint()
            reader.read_uint() # ignored
            salary_str = reader.read_utf()
            max_hero_num = reader.read_uint()
            fight_hero_num = reader.read_uint()
            add_other_str = reader.read_utf()

            try:
                salary = json.loads(salary_str)
            except Exception:
                salary = {"award": []}

            try:
                add_other = json.loads(add_other_str)
            except Exception:
                add_other = {"addOther": []}

            rows.append({
                "id": row_id,
                "name": name,
                "prefix_before": prefix_befor,
                "prefix_end": prefix_end,
                "need_credit": need_credit,
                "salary": salary,
                "max_hero_num": max_hero_num,
                "fight_hero_num": fight_hero_num,
                "add_other": add_other
            })
        out_path = os.path.join(output_dir, "military.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "military", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 2. CullingMagic
    if 16777558 in bins:
        print("Parsing CullingMagic...")
        reader = BinReader(bins[16777558])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            name = reader.read_utf()
            level = reader.read_int()
            c_type = reader.read_int()
            need_block = reader.read_int()
            need_exp = reader.read_int()
            exp_all = reader.read_int()
            need_silver = reader.read_int()
            silver_exp = reader.read_int()
            need_gold = reader.read_int()
            gold_exp = reader.read_int()
            need_item = reader.read_int()
            item_exp = reader.read_int()
            power = reader.read_int()
            agile = reader.read_int()
            intelligence = reader.read_int()
            life = reader.read_int()
            need_trans_lv = reader.read_int()
            next_id = reader.read_int()

            rows.append({
                "id": row_id,
                "name": name,
                "level": level,
                "type": c_type,
                "need_block": need_block,
                "need_exp": need_exp,
                "exp_all": exp_all,
                "need_silver": need_silver,
                "silver_exp": silver_exp,
                "need_gold": need_gold,
                "gold_exp": gold_exp,
                "need_item": need_item,
                "item_exp": item_exp,
                "power": power,
                "agile": agile,
                "intelligence": intelligence,
                "life": life,
                "need_trans_lv": need_trans_lv,
                "next_id": next_id
            })
        out_path = os.path.join(output_dir, "culling_magics.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "culling_magics", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 3. CullingStage
    if 16777559 in bins:
        print("Parsing CullingStage...")
        reader = BinReader(bins[16777559])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            name = reader.read_utf()
            location = reader.read_int()
            c_type = reader.read_int()
            army_id = reader.read_int()
            image = reader.read_int()
            award_str = reader.read_utf()
            award_ex_str = reader.read_utf()
            stage_clear = reader.read_int()
            need_level = reader.read_int()

            try:
                award = json.loads(award_str)
            except Exception:
                award = {}

            try:
                award_ex = json.loads(award_ex_str)
            except Exception:
                award_ex = {}

            rows.append({
                "id": row_id,
                "name": name,
                "location": location,
                "type": c_type,
                "army_id": army_id,
                "image": image,
                "award": award,
                "award_ex": award_ex,
                "stage_clear": stage_clear,
                "need_level": need_level
            })
        out_path = os.path.join(output_dir, "culling_stages.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "culling_stages", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 4. EquipForge
    if 16777531 in bins:
        print("Parsing EquipForge...")
        reader = BinReader(bins[16777531])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            p1 = reader.read_uint()
            p2 = reader.read_uint()

            rows.append({
                "id": row_id,
                "target_item_id": p1,
                "material_amount": p2
            })
        out_path = os.path.join(output_dir, "equip_forging.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "equip_forging", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 5. EquipAdvance
    if 16777532 in bins:
        print("Parsing EquipAdvance...")
        reader = BinReader(bins[16777532])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            p1 = reader.read_uint()
            p2 = reader.read_uint()

            rows.append({
                "id": row_id,
                "target_item_id": p1,
                "material_amount": p2
            })
        out_path = os.path.join(output_dir, "equip_advancement.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "equip_advancement", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 6. NightmarePoint
    if 16777481 in bins:
        print("Parsing NightmarePoint...")
        reader = BinReader(bins[16777481])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            name_desc = reader.read_utf()
            army_vec_str = reader.read_utf()
            battle_scene_id = reader.read_uint()
            role_model = reader.read_uint()
            condition_str = reader.read_utf()
            help_hero_id = reader.read_uint()
            help_hero_pos = reader.read_uint()
            coordinate_str = reader.read_utf()
            to_target_str = reader.read_utf()

            try:
                army_vec = json.loads(army_vec_str).get("army", [])
            except Exception:
                army_vec = []

            try:
                condition = json.loads(condition_str)
            except Exception:
                condition = []

            try:
                coordinate = json.loads(coordinate_str)
            except Exception:
                coordinate = {}

            try:
                to_target = json.loads(to_target_str)
            except Exception:
                to_target = []

            rows.append({
                "id": row_id,
                "name": name_desc,
                "army_ids": army_vec,
                "battle_scene": battle_scene_id,
                "role_model": role_model,
                "condition": condition,
                "help_hero_id": help_hero_id,
                "help_hero_pos": help_hero_pos,
                "coordinate": coordinate,
                "to_target": to_target
            })
        out_path = os.path.join(output_dir, "nightmare_points.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "nightmare_points", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    # 7. NightmareCity
    if 16777483 in bins:
        print("Parsing NightmareCity...")
        reader = BinReader(bins[16777483])
        reader.read_uint()
        count = reader.read_uint()
        rows = []
        for _ in range(count):
            row_id = reader.read_uint()
            award_vec_str = reader.read_utf()
            pass_award_vec_str = reader.read_utf()

            try:
                award_vec = json.loads(award_vec_str)
            except Exception:
                award_vec = []

            try:
                pass_award_vec = json.loads(pass_award_vec_str)
            except Exception:
                pass_award_vec = []

            rows.append({
                "id": row_id,
                "award_ids": award_vec,
                "pass_awards": pass_award_vec
            })
        out_path = os.path.join(output_dir, "nightmare_cities.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "nightmare_cities", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

if __name__ == "__main__":
    main()
