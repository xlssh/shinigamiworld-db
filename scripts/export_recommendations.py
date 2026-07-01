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

def parse_recommendations():
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

    rec_bin = decompressed_bins[16777298]
    reader = BinReader(rec_bin)
    res_id = reader.read_uint()
    row_count = reader.read_uint()
    print(f"Resource: {res_id}, Row Count: {row_count}")

    recs = []
    for _ in range(row_count):
        row_id = reader.read_uint()
        ability = reader.read_utf()
        if_recommend = reader.read_int()
        get_rode = reader.read_utf()
        friends_str = reader.read_utf()
        sort_id = reader.read_int()

        friends = json.loads(friends_str) if friends_str else []

        recs.append({
            "id": row_id,
            "ability": ability,
            "if_recommend": if_recommend,
            "get_rode": get_rode,
            "friends": friends,
            "sort_id": sort_id
        })

    # Write output to JSON
    out_path = "game-database-tool/public/data/recommend_heroes.json"
    with open(out_path, "w", encoding="utf-8") as out_f:
        json.dump({"table": "recommend_heroes", "rowCount": len(recs), "generatedAt": "2026-07-01", "rows": recs}, out_f, indent=2, ensure_ascii=False)
    print(f"Exported {len(recs)} recommendations to {out_path}")

if __name__ == "__main__":
    parse_recommendations()
