import struct
import zlib
import json

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

def parse_knives():
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

    knife_bin = decompressed_bins[16777296]
    reader = BinReader(knife_bin)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"Resource: {res_id}, Row Count: {row_count}")

    knives = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        name = reader.read_utf()
        bind_skill_id = reader.read_int()
        type_id = reader.read_int()
        handbook_id = reader.read_uint()
        appraise = reader.read_utf()
        get_road = reader.read_utf()
        attack_attr = reader.read_int()
        defense_attr = reader.read_int()
        recovery_attr = reader.read_int()
        resistance_attr = reader.read_int()
        speed_attr = reader.read_int()
        direction = reader.read_int()
        
        # JSON fields
        attr_type_str = reader.read_utf()
        base_val_str = reader.read_utf()
        growth_val_str = reader.read_utf()
        active_effects_str = reader.read_utf()

        attr_type = json.loads(attr_type_str) if attr_type_str else []
        base_val = json.loads(base_val_str) if base_val_str else []
        growth_val = json.loads(growth_val_str) if growth_val_str else []
        active_effects = json.loads(active_effects_str) if active_effects_str else []

        knives.append({
            "id": row_id,
            "name": name,
            "bind_skill_id": bind_skill_id,
            "type_id": type_id,
            "handbook_id": handbook_id,
            "appraise": appraise,
            "get_road": get_road,
            "attack_attr": attack_attr,
            "defense_attr": defense_attr,
            "recovery_attr": recovery_attr,
            "resistance_attr": resistance_attr,
            "speed_attr": speed_attr,
            "direction": direction,
            "attribute_type": attr_type,
            "base_value": base_val,
            "growth_value": growth_val,
            "active_effects": active_effects
        })

    # Write output to JSON
    out_path = "game-database-tool/public/data/knives.json"
    with open(out_path, "w", encoding="utf-8") as out_f:
        json.dump({"table": "knives", "rowCount": len(knives), "generatedAt": "2026-07-01", "rows": knives}, out_f, indent=2, ensure_ascii=False)
    print(f"Exported {len(knives)} knives to {out_path}")

if __name__ == "__main__":
    parse_knives()
