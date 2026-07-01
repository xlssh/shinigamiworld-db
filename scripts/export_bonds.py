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

def parse_related_partner(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"RelatedPartner Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        hero_id = reader.read_uint()
        rtype = reader.read_uint()
        connect_id = reader.read_uint()
        cond_point = reader.read_uint()
        cond_star = reader.read_uint()
        cond_id = reader.read_uint()

        rows.append({
            "id": row_id,
            "hero_id": hero_id,
            "type": rtype,
            "connect_id": connect_id,
            "condition_point": cond_point,
            "condition_star": cond_star,
            "condition_id": cond_id
        })
    return rows

def parse_related_partner_type(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"RelatedPartnerType Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        rtype = reader.read_uint()
        name = reader.read_utf()
        level = reader.read_uint()
        material_count = reader.read_uint()
        properties_str = reader.read_utf()
        
        properties = json.loads(properties_str) if properties_str else []

        rows.append({
            "id": row_id,
            "type": rtype,
            "name": name,
            "level": level,
            "material_count": material_count,
            "properties": properties
        })
    return rows

def parse_related_condition(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"RelatedCondition Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        desc = reader.read_utf()
        html = reader.read_utf()

        rows.append({
            "id": row_id,
            "description": desc,
            "condition_html": html
        })
    return rows

def parse_related_partner_point(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"RelatedPartnerPoint Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        name = reader.read_utf()
        is_boss = reader.read_uint() == 1
        army_str = reader.read_utf()
        army = json.loads(army_str) if army_str else {}
        battle_scene = reader.read_uint()
        
        stars = []
        for _ in range(3):
            star_str = reader.read_utf()
            star = json.loads(star_str) if star_str else []
            stars.append(star)

        rows.append({
            "id": row_id,
            "name": name,
            "is_boss": is_boss,
            "army": army,
            "battle_scene": battle_scene,
            "stars": stars
        })
    return rows

def parse_knife_strengthen(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"KnifeStrengthen Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        effect_id_str = reader.read_utf()
        heros_str = reader.read_utf()
        attribute_str = reader.read_utf()

        effect_ids = json.loads(effect_id_str) if effect_id_str else []
        heros = json.loads(heros_str) if heros_str else []
        attributes = json.loads(attribute_str) if attribute_str else []

        rows.append({
            "id": row_id,
            "effect_ids": effect_ids,
            "heros": heros,
            "attributes": attributes
        })
    return rows

def parse_skill_config(bin_data):
    reader = BinReader(bin_data)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"SkillConfig Resource: {res_id}, Row Count: {row_count}")

    rows = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        skill_id = reader.read_uint()
        name = reader.read_utf()
        desc = reader.read_utf()
        icon = reader.read_uint()
        sort_id = reader.read_uint()

        rows.append({
            "id": row_id,
            "skill_id": skill_id,
            "name": name,
            "description": desc,
            "icon": icon,
            "sort_id": sort_id
        })
    return rows

def main():
    with open("0F000000.binPackage", "rb") as f:
        package_data = f.read()

    package_id, bin_count = struct.unpack_from("<IH", package_data, 0)
    offset = 6
    decompressed_bins = {}
    for _ in range(bin_count):
        bin_len = struct.unpack_from("<I", package_data, offset)[0]
        offset += 4
        bin_bytes = package_data[offset:offset+bin_len]
        offset += bin_len
        
        decompressed = zlib.decompress(bin_bytes)
        res_id = struct.unpack_from("<I", decompressed, 0)[0]
        decompressed_bins[res_id] = decompressed

    output_dir = "game-database-tool/public/data"
    os.makedirs(output_dir, exist_ok=True)

    bonds_data = {
        16777468: ("related_partners", parse_related_partner),
        16777469: ("related_partner_types", parse_related_partner_type),
        16777470: ("related_conditions", parse_related_condition),
        16777471: ("related_partner_points", parse_related_partner_point),
        16777485: ("knife_strengthens", parse_knife_strengthen),
        16777279: ("skills", parse_skill_config)
    }

    for res_id, (file_name, parse_func) in bonds_data.items():
        if res_id in decompressed_bins:
            parsed_rows = parse_func(decompressed_bins[res_id])
            out_path = os.path.join(output_dir, f"{file_name}.json")
            with open(out_path, "w", encoding="utf-8") as out_f:
                json.dump({
                    "table": file_name,
                    "rowCount": len(parsed_rows),
                    "generatedAt": "2026-07-01",
                    "rows": parsed_rows
                }, out_f, indent=2, ensure_ascii=False)
            print(f"Exported {len(parsed_rows)} rows to {out_path}")

if __name__ == "__main__":
    main()
