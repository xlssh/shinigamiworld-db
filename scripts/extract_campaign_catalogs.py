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

    def read_float(self):
        val = struct.unpack_from("<f", self.data, self.pos)[0]
        self.pos += 4
        return val

    def read_double(self):
        val = struct.unpack_from("<d", self.data, self.pos)[0]
        self.pos += 8
        return val

    def read_utf(self):
        length = self.read_ushort()
        val = self.data[self.pos:self.pos+length].decode("utf-8", errors="ignore")
        self.pos += length
        return val

def try_json_load(val):
    if not val:
        return []
    try:
        return json.loads(val)
    except:
        return val

def scan_package(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return {}
    
    with open(file_path, "rb") as f:
        data = f.read()
    
    package_id, bin_count = struct.unpack_from("<IH", data, 0)
    
    offset = 6
    decompressed_bins = {}
    for i in range(bin_count):
        bin_len = struct.unpack_from("<I", data, offset)[0]
        offset += 4
        bin_bytes = data[offset:offset+bin_len]
        offset += bin_len
        try:
            decomp = zlib.decompress(bin_bytes)
            res_id = struct.unpack_from("<I", decomp, 0)[0]
            decompressed_bins[res_id] = decomp
        except Exception as e:
            pass
    return decompressed_bins

def main():
    pkg0 = scan_package("0F000000.binPackage")
    pkg1 = scan_package("0F000001.binPackage")
    all_bins = {**pkg0, **pkg1}

    out_dir = "game-database-tool/public/data"
    os.makedirs(out_dir, exist_ok=True)

    active_enemy_ids = set()

    # 1. Parse EnemyArmy first (16777239)
    if 16777239 in all_bins:
        reader = BinReader(all_bins[16777239])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            name = reader.read_utf()
            
            front_raw = try_json_load(reader.read_utf())
            front_lvs = front_raw.get("front", []) if isinstance(front_raw, dict) else front_raw
            
            middle_raw = try_json_load(reader.read_utf())
            middle_lvs = middle_raw.get("middle", []) if isinstance(middle_raw, dict) else middle_raw
            
            back_raw = try_json_load(reader.read_utf())
            back_lvs = back_raw.get("back", []) if isinstance(back_raw, dict) else back_raw
            
            leader_id = reader.read_uint()
            award_id = reader.read_uint()
            text = reader.read_utf()

            # Collect active enemy IDs
            for eid in front_lvs + middle_lvs + back_lvs:
                active_enemy_ids.add(eid)

            rows.append({
                "id": row_id,
                "name": name,
                "front": front_lvs,
                "middle": middle_lvs,
                "back": back_lvs,
                "leader_id": leader_id,
                "award_id": award_id,
                "text": text
            })
        with open(os.path.join(out_dir, "enemy_armies.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "enemy_armies", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted enemy_armies.json: {len(rows)} rows. Active enemy IDs: {len(active_enemy_ids)}")

    # 2. Parse Enemy with optimization (16777238)
    if 16777238 in all_bins:
        reader = BinReader(all_bins[16777238])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            name = reader.read_utf()
            is_boss = reader.read_int() != 0
            etype = reader.read_uint()
            profession = reader.read_uint()
            hero_icon = reader.read_uint()
            quality = reader.read_uint()
            level = reader.read_uint()
            sex = reader.read_uint()
            hp = reader.read_uint()
            speed = reader.read_uint()
            anger = reader.read_uint()
            state = reader.read_uint()
            attacks = try_json_load(reader.read_utf())
            defenses = try_json_load(reader.read_utf())
            rates = try_json_load(reader.read_utf())
            normal = reader.read_uint()
            skill = reader.read_uint()
            effects = reader.read_utf()
            talent_id = reader.read_uint()
            sound = reader.read_uint()
            
            skill_desc = try_json_load(reader.read_utf())
            attr_power = reader.read_uint()
            attack_effect = reader.read_uint()

            # Filter optimization: Only write active enemies to save disk/bundle space!
            if row_id in active_enemy_ids:
                rows.append({
                    "id": row_id,
                    "name": name,
                    "is_boss": is_boss,
                    "type": etype,
                    "profession": profession,
                    "hero_icon": hero_icon,
                    "quality": quality,
                    "level": level,
                    "sex": sex,
                    "hp": hp,
                    "speed": speed,
                    "anger": anger,
                    "state": state,
                    "attacks": attacks,
                    "defenses": defenses,
                    "rates": rates,
                    "normal": normal,
                    "skill": skill,
                    "effects": effects,
                    "talent_id": talent_id,
                    "sound": sound,
                    "skill_desc": skill_desc,
                    "attr_power": attr_power,
                    "attack_effect": attack_effect
                })
        with open(os.path.join(out_dir, "enemies.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "enemies", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted enemies.json (optimized): {len(rows)} rows.")

    # 3. Parse Award (16777219)
    if 16777219 in all_bins:
        reader = BinReader(all_bins[16777219])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            fixed_raw = try_json_load(reader.read_utf())
            fixed = fixed_raw.get("fixed", []) if isinstance(fixed_raw, dict) else fixed_raw
            
            random_raw = try_json_load(reader.read_utf())
            random = random_raw.get("rewards", []) if isinstance(random_raw, dict) else random_raw
            
            rows.append({
                "id": row_id,
                "fixed": fixed,
                "rewards": random
            })
        with open(os.path.join(out_dir, "awards.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "awards", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted awards.json: {len(rows)} rows.")

    # 4. ConfigValue (16777232)
    if 16777232 in all_bins:
        reader = BinReader(all_bins[16777232])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            val = reader.read_utf()
            val_type = reader.read_utf()
            is_client = reader.read_int() != 0
            if is_client:
                # Try decode val as JSON
                val_decoded = try_json_load(val)
                rows.append({
                    "id": row_id,
                    "value": val_decoded,
                    "value_type": val_type
                })
        with open(os.path.join(out_dir, "config_values.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "config_values", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted config_values.json: {len(rows)} rows.")

    # 5. OrganizationBase (16777258)
    if 16777258 in all_bins:
        reader = BinReader(all_bins[16777258])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            org_level = reader.read_uint()
            day_max_act = reader.read_uint()
            guild_max_act = reader.read_uint()
            org_max_num = reader.read_uint()
            get_more_siv = reader.read_uint()
            get_more_exp = reader.read_uint()
            camp_upgrade_money = reader.read_uint()
            muyebattle_upgrade_money = reader.read_uint()
            muyebattle_upgrade_addition = reader.read_uint()
            muyeguard_upgrade_money = reader.read_uint()
            muyeguard_upgrade_addition = reader.read_uint()
            rows.append({
                "id": row_id,
                "org_level": org_level,
                "day_max_activity": day_max_act,
                "guild_max_activity": guild_max_act,
                "org_max_number": org_max_num,
                "get_more_siv": get_more_siv,
                "get_more_exp": get_more_exp,
                "camp_upgrade_money": camp_upgrade_money,
                "muyebattle_upgrade_money": muyebattle_upgrade_money,
                "muyebattle_upgrade_addition": muyebattle_upgrade_addition,
                "muyeguard_upgrade_money": muyeguard_upgrade_money,
                "muyeguard_upgrade_addition": muyeguard_upgrade_addition
            })
        with open(os.path.join(out_dir, "org_base.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "org_base", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted org_base.json: {len(rows)} rows.")

    # 6. OrganizationAddition (16777257)
    if 16777257 in all_bins:
        reader = BinReader(all_bins[16777257])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            org_level = reader.read_uint()
            atk_addition = reader.read_uint()
            atk_consume = reader.read_uint()
            phys_def_addition = reader.read_uint()
            phys_def_consume = reader.read_uint()
            mag_def_addition = reader.read_uint()
            mag_def_consume = reader.read_uint()
            life_addition = reader.read_uint()
            life_consume = reader.read_uint()
            speed_addition = reader.read_uint()
            speed_consume = reader.read_uint()
            rows.append({
                "id": row_id,
                "org_level": org_level,
                "atk_addition": atk_addition,
                "atk_consume": atk_consume,
                "phys_def_addition": phys_def_addition,
                "phys_def_consume": phys_def_consume,
                "mag_def_addition": mag_def_addition,
                "mag_def_consume": mag_def_consume,
                "life_addition": life_addition,
                "life_consume": life_consume,
                "speed_addition": speed_addition,
                "speed_consume": speed_consume
            })
        with open(os.path.join(out_dir, "org_additions.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "org_additions", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted org_additions.json: {len(rows)} rows.")

    # 7. OrganizationDevotion (16777259)
    if 16777259 in all_bins:
        reader = BinReader(all_bins[16777259])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            player_level = reader.read_uint()
            devotion_siv_max = reader.read_uint()
            rows.append({
                "id": row_id,
                "player_level": player_level,
                "devotion_siv_max": devotion_siv_max
            })
        with open(os.path.join(out_dir, "org_devotions.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "org_devotions", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted org_devotions.json: {len(rows)} rows.")

    # 8. VipConfig (16777292)
    if 16777292 in all_bins:
        reader = BinReader(all_bins[16777292])
        reader.read_uint()
        row_count = reader.read_uint()
        rows = []
        for _ in range(row_count):
            row_id = reader.read_uint()
            charge_count = reader.read_uint()
            daily_ticket = reader.read_uint()
            free_look = reader.read_uint()
            block_time = reader.read_uint()
            stone_percent = reader.read_uint()
            skip_block = reader.read_uint()
            bag_count = reader.read_uint()
            action_limit = reader.read_uint()
            buy_action_limit = reader.read_uint()
            daily_single_reset = reader.read_uint()
            daily_cha_reset = reader.read_uint()
            skip_charge_fight = reader.read_uint()
            one_wine = reader.read_uint()
            one_win_wine = reader.read_uint()
            more_change = reader.read_uint()
            daily_change_num = reader.read_uint()
            arena_skip = reader.read_uint()
            one_time_pet = reader.read_uint()
            one_water = reader.read_uint()
            auto_buy_act = reader.read_uint()
            boss_fight_up = reader.read_uint()
            one_time_wash = reader.read_uint()
            monster_one_time = reader.read_uint()
            stone_one_time = reader.read_uint()
            digging = reader.read_uint()
            no_clear_time = reader.read_uint()
            day_buy_count = reader.read_uint()
            seven_hero_count = reader.read_uint()
            seven_hero_one_key = reader.read_uint()
            skip_seven_hero_fight = reader.read_uint()
            auto_join_activity = reader.read_uint()
            teamer_expand = reader.read_uint()
            akey_bable_tower = reader.read_uint()
            resources_backvip = reader.read_uint()
            change_hero_enter_buy = reader.read_uint()
            change_hero_reset = reader.read_uint()
            vain_travel_buy = reader.read_int()
            vain_travel_free = reader.read_int()
            vain_travel_relive_time = reader.read_int()
            pet_interaction_count = reader.read_uint()
            pet_train_clear_cd = reader.read_uint()
            can_auto_fight = reader.read_int()
            related_daily_award = reader.read_uint()
            lottery_recruit_num = reader.read_uint()
            
            rows.append({
                "id": row_id,
                "charge_count": charge_count,
                "daily_ticket": daily_ticket,
                "free_look": free_look,
                "block_time": block_time,
                "stone_percent": stone_percent,
                "skip_block": skip_block,
                "bag_count": bag_count,
                "action_limit": action_limit,
                "buy_action_limit": buy_action_limit,
                "daily_single_reset": daily_single_reset,
                "daily_cha_reset": daily_cha_reset,
                "skip_charge_fight": skip_charge_fight,
                "one_wine": one_wine,
                "one_win_wine": one_win_wine,
                "more_change": more_change,
                "daily_change_num": daily_change_num,
                "arena_skip": arena_skip,
                "one_time_pet": one_time_pet,
                "one_water": one_water,
                "auto_buy_act": auto_buy_act,
                "boss_fight_up": boss_fight_up,
                "one_time_wash": one_time_wash,
                "monster_one_time": monster_one_time,
                "stone_one_time": stone_one_time,
                "digging": digging,
                "no_clear_time": no_clear_time,
                "day_buy_count": day_buy_count,
                "seven_hero_count": seven_hero_count,
                "seven_hero_one_key": seven_hero_one_key,
                "skip_seven_hero_fight": skip_seven_hero_fight,
                "auto_join_activity": auto_join_activity,
                "teamer_expand": teamer_expand,
                "akey_bable_tower": akey_bable_tower,
                "resources_backvip": resources_backvip,
                "change_hero_enter_buy": change_hero_enter_buy,
                "change_hero_reset": change_hero_reset,
                "vain_travel_buy": vain_travel_buy,
                "vain_travel_free": vain_travel_free,
                "vain_travel_relive_time": vain_travel_relive_time,
                "pet_interaction_count": pet_interaction_count,
                "pet_train_clear_cd": pet_train_clear_cd,
                "can_auto_fight": can_auto_fight,
                "related_daily_award": related_daily_award,
                "lottery_recruit_num": lottery_recruit_num
            })
        with open(os.path.join(out_dir, "vip_configs.json"), "w", encoding="utf-8") as f:
            json.dump({"table": "vip_configs", "rowCount": len(rows), "rows": rows}, f, indent=2)
        print(f"Extracted vip_configs.json: {len(rows)} rows.")

    print("\nExtraction of all 8 campaign & system database tables is successfully complete!")

if __name__ == "__main__":
    main()
