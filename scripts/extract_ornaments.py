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
    ornament_value_bin = None
    ornament_upgrade_bin = None

    for _ in range(bin_count):
        bin_len = struct.unpack_from("<I", package_data, offset)[0]
        offset += 4
        bin_bytes = package_data[offset:offset+bin_len]
        offset += bin_len

        decompressed = zlib.decompress(bin_bytes)
        res_id = struct.unpack_from("<I", decompressed, 0)[0]
        if res_id == 16777370: # RESOURCEID_OrnamentValue
            ornament_value_bin = decompressed
        elif res_id == 16777371: # RESOURCEID_OrnamentUpgrade
            ornament_upgrade_bin = decompressed

    output_dir = "game-database-tool/public/data"
    if not os.path.exists(output_dir):
        output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)

    if ornament_value_bin:
        print("Parsing OrnamentValue...")
        reader = BinReader(ornament_value_bin)
        res_id = reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            item_id_str = reader.read_utf()
            level = reader.read_uint()
            cost_items_str = reader.read_utf()
            add_value = reader.read_uint()

            # Parse item_id and sub_id
            parts = item_id_str.split(":")
            item_id = int(parts[0])
            sub_id = int(parts[1]) if len(parts) > 1 else 0

            # Parse cost items JSON
            try:
                cost_items = json.loads(cost_items_str)
            except Exception:
                cost_items = []

            rows.append({
                "item_id": item_id,
                "sub_id": sub_id,
                "level": level,
                "cost_items": cost_items,
                "add_value": add_value
            })

        # Sort values by item_id and level
        rows.sort(key=lambda x: (x["item_id"], x["level"]))

        # Add serial ids back
        for idx, row in enumerate(rows):
            row["id"] = idx + 1

        out_path = os.path.join(output_dir, "ornament_values.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "ornament_values", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

    if ornament_upgrade_bin:
        print("Parsing OrnamentUpgrade...")
        reader = BinReader(ornament_upgrade_bin)
        res_id = reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            old_item_id = reader.read_uint()
            cost_items_str = reader.read_utf()
            new_item_id = reader.read_uint()

            # Parse cost items JSON
            try:
                cost_items = json.loads(cost_items_str)
            except Exception:
                cost_items = []

            rows.append({
                "id": row_id,
                "old_item_id": old_item_id,
                "cost_items": cost_items,
                "new_item_id": new_item_id
            })

        out_path = os.path.join(output_dir, "ornament_upgrades.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"table": "ornament_upgrades", "rowCount": len(rows), "rows": rows}, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(rows)} rows to {out_path}")

if __name__ == "__main__":
    main()
