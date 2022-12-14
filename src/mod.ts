import { DependencyContainer } from "tsyringe";

// SPT types
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderAssort, ITraderBase } from "@spt-aki/models/eft/common/tables/ITrader";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILocaleGlobalBase } from "@spt-aki/models/spt/server/ILocaleBase";

// The new trader config
import * as baseJson from "../db/base.json";
import * as presetsJson from "../db/presets.json";

class Mod implements IPreAkiLoadMod, IPostDBLoadMod
{

    mod: string
    databaseServer: DatabaseServer

    private cfg = require("../config.json");
    private presets = require("../db/presets.json");

    constructor()
    {
        this.mod = "AlexAIO-Reboot";
    }

    public preAkiLoad(container: DependencyContainer): void
    {
        this.registerProfileImage(container);
        
        this.setupTraderUpdateTime(container);
    }
    // DONE
    
    public postDBLoad(container: DependencyContainer): void
    {

        this.databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.cfg = require("../config.json")
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");

        // Keep a reference to the tables
        const tables = this.databaseServer.getTables();
        const items = this.databaseServer.getTables().templates.items;

        // Add the new trader to the trader lists in DatabaseServer
        function addToFilter(parent, child, slot)
        {
            items[parent]._props.Slots[slot]._props.filters[0].Filter.push(child);
        }

        function addArrayToFilter(parent, array, slot)
        {
            array.forEach((id) =>
            {
                items[parent]._props.Slots[slot]._props.filters[0].Filter.push(id);
            });
        }


        if (this.cfg.enabled)
        {
            if (this.cfg.operator)
            {
                tables.traders[baseJson._id] = {
                    assort: this.createAssortTable(),
                    base: jsonUtil.deserialize(jsonUtil.serialize(baseJson)) as ITraderBase,
                    questassort: undefined
                };
        
                // For each language, add locale for the new trader
                const locales = Object.values(tables.locales.global) as ILocaleGlobalBase[];
                for (const locale of locales)
                {
                    locale.trading[baseJson._id] = {
                        FullName: "***Redacted***",
                        FirstName: "***Redacted***",
                        Nickname: baseJson.nickname,
                        Location: "***Redacted***",
                        Description: "***Redacted***"
                    };
                }
            }

            if (this.cfg.gameplay_changes.enabled)
            {
                if (this.cfg.gameplay_changes.better_sicc_case)
                {
                    const sicc = items["5d235bb686f77443f4331278"]._props.Grids[0]._props.filters[0].Filter;
                    sicc.push("619cbf7d23893217ec30b689");
                    sicc.push("619cbf9e0a7c3a1a2731940a");
                    sicc.push("59fafd4b86f7745ca07e1232");
                    sicc.push("5c093e3486f77430cb02e593");
                    sicc.push("5783c43d2459774bbe137486");
                    sicc.push("60b0f6c058e0b0481a09ad11");
                    sicc.push("567849dd4bdc2d150f8b456e");
                }

                if (this.cfg.gameplay_changes.holster_smg)
                {
                    items["55d7217a4bdc2d86028b456d"]._props.Slots[2]._props.filters[0].Filter.push("5447b5e04bdc2d62278b4567");
                }

                if (this.cfg.gameplay_changes.thermal)
                {
                    const t7 = items["5c110624d174af029e69734c"]._props;
                    t7.IsMotionBlurred = false;
                    t7.Mask = "Anvis";
                    t7.MaskSize = 1.5;
                    t7.IsNoisy = false;
                    t7.NoiseIntensity = 0;
                    t7.RampShift = -0.1;
                    t7.MainTexColorCoef = 1.3;
                    t7.MinimumTemperatureValue = 0;
                    const thermal = items["5d21f59b6dbe99052b54ef83"]._props;
                    thermal.IsMotionBlurred = false;
                    thermal.IsNoisy = false;
                    thermal.NoiseIntensity = 0;
                }

                if (this.cfg.gameplay_changes.no_head_segments)
                {
                    const headSegments = ["Top", "Nape", "Ears", "Eyes", "Jaws"];
                    Object.values(items)
                        .filter((item) => item._props.headSegments)
                        .map((item) => 
                        {
                            item._props.headSegments = headSegments;
                        });
                }
                
                if (this.cfg.gameplay_changes.faster_ammo_load)
                {
                    tables.globals.config.BaseCheckTime = 0;
                    tables.globals.config.BaseLoadTime = 0.3;
                    tables.globals.config.BaseUnloadTime = 0.1;
                }

                if (this.cfg.gameplay_changes.ammo_stacks_multiplier)
                {
                    Object.values(items)
                        .filter((item) => item._parent === "5485a8684bdc2da71d8b4567")
                        .map((ammo) =>
                        {
                            ammo._props.StackMaxSize *=
                                this.cfg.gameplay_changes.ammo_stacks_multiplier;
                            ammo._props.Weight /= this.cfg.gameplay_changes.ammo_stacks_multiplier;
                        });
                }

                if (this.cfg.gameplay_changes.all_items_examined)
                {
                    Object.values(items).map((item) => 
                    {
                        item._props.ExaminedByDefault = true;
                    });
                }
            }
            
            if (this.cfg.gunsmith.enabled)
            {
                if (this.cfg.gunsmith.remove_conflicts)
                {
                    const allItems = Object.values(items).filter(
                        (item) => item._props.ConflictingItems
                    );
                    allItems.map((item) => 
                    {
                        item._props.ConflictingItems = [];
                    });
                }

                addArrayToFilter(
                    "6176aca650224f204c1da3fb",
                    [
                        "5947eab886f77475961d96c5",
                        "5947e98b86f774778f1448bc",
                        "591af10186f774139d495f0e",
                        "591aef7986f774139d495f03",
                        "5c793fb92e221644f31bfb64",
                        "5c793fc42e221600114ca25d"
                    ],
                    2
                );
                addArrayToFilter(
                    "5c793fb92e221644f31bfb64",
                    ["617155ee50224f204c1da3cd", "617154aa1cb55961fa0fdb3b"],
                    0
                );
                addArrayToFilter(
                    "5c793fc42e221600114ca25d",
                    ["617155ee50224f204c1da3cd", "617154aa1cb55961fa0fdb3b"],
                    0
                );
                //foregrip fix
                //vs combo
                addArrayToFilter(
                    "5d4aab30a4b9365435358c55",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    4
                );
                addArrayToFilter(
                    "5cf656f2d7f00c06585fb6eb",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    4
                );
                //casv
                addArrayToFilter(
                    "5b7bee755acfc400196d5383",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    0
                );
                addArrayToFilter(
                    "5b7bedd75acfc43d825283f9",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    0
                );
                //mpx midwest oem
                addArrayToFilter(
                    "5c5db5f22e2216000e5e47e8",
                    [
                        "57cffcdd24597763f5110006",
                        "57cffce524597763b31685d8",
                        "57cffb66245977632f391a99",
                        "57cffcd624597763133760c5"
                    ],
                    0
                );
                addArrayToFilter(
                    "5c5db5fc2e2216000f1b2842",
                    [
                        "57cffcdd24597763f5110006",
                        "57cffce524597763b31685d8",
                        "57cffb66245977632f391a99",
                        "57cffcd624597763133760c5"
                    ],
                    4
                );
                addArrayToFilter(
                    "5c5db6302e2216000e5e47f0",
                    [
                        "57cffcdd24597763f5110006",
                        "57cffce524597763b31685d8",
                        "57cffb66245977632f391a99",
                        "57cffcd624597763133760c5"
                    ],
                    4
                );
                addArrayToFilter(
                    "5c5db63a2e2216000f1b284a",
                    [
                        "57cffcdd24597763f5110006",
                        "57cffce524597763b31685d8",
                        "57cffb66245977632f391a99",
                        "57cffcd624597763133760c5"
                    ],
                    5
                );
                addArrayToFilter(
                    "5c59529a2e221602b177d160",
                    [
                        "57cffcdd24597763f5110006",
                        "57cffce524597763b31685d8",
                        "57cffb66245977632f391a99",
                        "57cffcd624597763133760c5"
                    ],
                    5
                );
                //lvoa
                addArrayToFilter(
                    "595cfa8b86f77427437e845b",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    2
                );
                addArrayToFilter(
                    "595cf16b86f77427440c32e2",
                    [
                        "615d8fd3290d254f5e6b2edc",
                        "5fc0f9b5d724d907e2077d82",
                        "5fc0f9cbd6fa9c00c571bb90"
                    ],
                    2
                );

                //M14 grip
                addArrayToFilter(
                    "5addc7ac5acfc400194dbd90",
                    [
                        "55d4b9964bdc2d1d4e8b456e",
                        "571659bb2459771fb2755a12",
                        "6113c3586c780c1e710c90bc",
                        "6113cc78d3a39d50044c065a",
                        "6113cce3d92c473c770200c7",
                        "5bb20e18d4351e00320205d5",
                        "57c55efc2459772d2c6271e7",
                        "57af48872459771f0b2ebf11",
                        "57c55f092459772d291a8463",
                        "57c55f112459772d28133310",
                        "57c55f172459772d27602381",
                        "5a339805c4a2826c6e06d73d",
                        "615d8faecabb9b7ad90f4d5d",
                        "5b07db875acfc40dc528a5f6"
                    ],
                    0
                );
                //sr25 modx
                addToFilter("5df8e4080b92095fd441e594", "5cde7afdd7f00c000d36b89d", 2);
                //asval sight
                addToFilter("57c44dd02459772d2e0ae249", "5649d9a14bdc2d79388b4580", 0);
                addToFilter("57838c962459774a1651ec63", "5649d9a14bdc2d79388b4580", 0);
                //TT_mpr
                addToFilter("5649d9a14bdc2d79388b4580", "5649a2464bdc2d91118b45a8", 0);
                //MK47
                addToFilter("606587a88900dc2d9a55b659", "5cde7afdd7f00c000d36b89d", 2);
                //rpk b30
                addToFilter("5beed0f50db834001c062b12", "5efaf417aeb21837e749c7f2", 5);
                //mosin
                addToFilter("5bfd4cbe0db834001b73449f", "5649d9a14bdc2d79388b4580", 1);
                addToFilter("5ae09bff5acfc4001562219d", "5649d9a14bdc2d79388b4580", 1);
                addToFilter("5bfd4cd60db834001c38f095", "5649d9a14bdc2d79388b4580", 1);
                //ak556-adapter
                addToFilter("5ac66d9b5acfc4001633997a", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("5644bd2b4bdc2d3b4c8b4572", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("5bf3e03b0db834001d2c4a9c", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("5ac4cd105acfc40016339859", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("57dc2fa62459775949412633", "5e21ca18e4d47f0da15e77dd", 4);
                addToFilter("583990e32459771419544dd2", "5e21ca18e4d47f0da15e77dd", 4);
                addToFilter("5ab8e9fcd8ce870019439434", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("5bf3e0490db83400196199af", "5e21ca18e4d47f0da15e77dd", 2);
                addToFilter("5839a40f24597726f856b511", "5e21ca18e4d47f0da15e77dd", 4);
                addToFilter("5beec1bd0db834001e6006f3", "5e21ca18e4d47f0da15e77dd", 0);
                addToFilter("5beec2820db834001b095426", "5e21ca18e4d47f0da15e77dd", 0);
                //MK47_drum
                addToFilter("606587252535c57a13424cfd", "5cfe8010d7ad1a59283b14c6", 1);
                //rsass
                addToFilter("5a367e5dc4a282000e49738f", "5df917564a9f347bc92edca3", 4);
                addToFilter("5a367e5dc4a282000e49738f", "60658776f2cb2e02a42ace2b", 4);
                addToFilter("5a367e5dc4a282000e49738f", "6065878ac9cf8012264142fd", 4);
                addToFilter("5a367e5dc4a282000e49738f", "5dfa397fb11454561e39246c", 4);
                addToFilter("5a367e5dc4a282000e49738f", "5cde7afdd7f00c000d36b89d", 3);
                //pistol foregrip
                const pic = [
                    "5c87ca002e221600114cb150",
                    "5c7fc87d2e221644f31c0298",
                    "59f8a37386f7747af3328f06",
                    "59fc48e086f77463b1118392",
                    "5fce0cf655375d18a253eff0",
                    "558032614bdc2de7118b4585",
                    "58c157be86f77403c74b2bb6",
                    "58c157c886f774032749fb06",
                    "591af28e86f77414a27a9e1d",
                    "5c1bc4812e22164bef5cfde7",
                    "5c1bc5612e221602b5429350",
                    "5c1bc5af2e221602b412949b",
                    "5c1bc5fb2e221602b1779b32",
                    "5c1bc7432e221602b412949d",
                    "5c1bc7752e221602b1779b34",
                    "5c1cd46f2e22164bef5cfedb",
                    "5cda9bcfd7f00c0c0b53e900",
                    "5cf4fb76d7f00c065703d3ac",
                    "5f6340d3ca442212f4047eb2"
                ];
                addArrayToFilter("5b1fa9b25acfc40018633c01", pic, 4);
                addArrayToFilter("5a7ae0c351dfba0017554310", pic, 4);
                addArrayToFilter("5cadc190ae921500103bb3b6", pic, 4);
                addArrayToFilter("5ef369b08cef260c0642acaf", pic, 0);
                addArrayToFilter("5f36a0e5fbf956000b716b65", pic, 7);
                addArrayToFilter("5d3eb3b0a4b93615055e84d2", pic, 3);
                addArrayToFilter("5d67abc1a4b93614ec50137f", pic, 3);
                addArrayToFilter("602a9740da11d6478d5a06dc", pic, 3);
                addArrayToFilter("56d59856d2720bd8418b456a", pic, 4);
                addArrayToFilter("5a27bad7c4a282000b15184b", pic, 0);
                addArrayToFilter("5a27b281c4a28200741e1e52", pic, 0);
                addArrayToFilter("576a7c512459771e796e0e17", pic, 0);
                addArrayToFilter("5a7ad74e51dfba0015068f45", pic, 0);
                addArrayToFilter("6196255558ef8c428c287d1c", pic, 0);
                addArrayToFilter("619624b26db0f2477964e6b0", pic, 0);
                //mp5kstock
                addToFilter("5d2f261548f03576f500e7b7", "5926d3c686f77410de68ebc8", 2);
                addToFilter("5d2f261548f03576f500e7b7", "5926d40686f7740f152b6b7e", 2);
                //416 buffer
                addToFilter("5bb2475ed4351e00853264e3", "5c793fc42e221600114ca25d", 3);
                addToFilter("5bb2475ed4351e00853264e3", "5c793fb92e221644f31bfb64", 3);
                addToFilter("5bb2475ed4351e00853264e3", "5a33ca0fc4a282000d72292f", 3);
                addToFilter("5bb2475ed4351e00853264e3", "5a33ca0fc4a282000d72292f", 3);
                addToFilter("5bb2475ed4351e00853264e3", "5a33ca0fc4a282000d72292f", 3);
                //specter mount
                addToFilter("57aca93d2459771f2c7e26db", "5a33b2c9c4a282000c5a9511", 0);
                addToFilter("57aca93d2459771f2c7e26db", "616442e4faa1272e43152193", 0);
                addToFilter("57aca93d2459771f2c7e26db", "58d2664f86f7747fec5834f6", 0);
                addToFilter("57ac965c24597706be5f975c", "5a33b2c9c4a282000c5a9511", 0);
                addToFilter("57ac965c24597706be5f975c", "616442e4faa1272e43152193", 0);
                addToFilter("57ac965c24597706be5f975c", "58d2664f86f7747fec5834f6", 0);
                //sig stocks
                const stocks = [
                    "5fbcc429900b1d5091531dd7",
                    "5fbcc437d724d907e2077d5c",
                    "58ac1bf086f77420ed183f9f",
                    "5894a13e86f7742405482982",
                    "5c5db6ee2e221600113fba54",
                    "5c5db6f82e2216003a0fe914"
                ];
                items["5fbcc1d9016cce60e8341ab3"]._props.Slots[3]._props.filters[0].Filter = stocks;
                items["58948c8e86f77409493f7266"]._props.Slots[3]._props.filters[0].Filter = stocks;
                //glock18
                addToFilter("5b1fa9b25acfc40018633c01", "5a6b5b8a8dc32e001207faf3", 0);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6b5e468dc32e001207faf5", 0);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6b60158dc32e000a31138b", 0);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6b5f868dc32e000a311389", 0);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6b5ed88dc32e000c52ec86", 0);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6f5e048dc32e00094b97da", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a9685b1a2750c0032157104", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a6f5f078dc32e00094b97dd", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a702d198dc32e000b452fc3", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a7033908dc32e000a311392", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a7afa25e899ef00135e31b0", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a71e22f8dc32e00094b97f4", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a71e4f48dc32e001207fb26", 2);
                addToFilter("5b1fa9b25acfc40018633c01", "5a7ad74e51dfba0015068f45", 4);
                //ak stocks
                const aks74u = "57dc2fa62459775949412633";
                const aks74ub = "5839a40f24597726f856b511";
                const aks74un = "583990e32459771419544dd2";
                const pp19 = "59984ab886f7743e98271174";
                const saiga9 = "59f9cabd86f7743a10721f46";
                const asval = "57c44b372459772d2b39b8ce";
                const aks74 = "5bf3e0490db83400196199af";
                const aks74n = "5ab8e9fcd8ce870019439434";
                const ak101 = "5ac66cb05acfc40198510a10";
                const ak102 = "5ac66d015acfc400180ae6e4";
                const ak103 = "5ac66d2e5acfc43b321d4b53";
                const ak104 = "5ac66d725acfc43b321d4b60";
                const ak105 = "5ac66d9b5acfc4001633997a";
                const ak74m = "5ac4cd105acfc40016339859";
                const rpktube = "5beec8b20db834001961942a";
                const ak74mStock = "5ac50c185acfc400163398d4";
                const aksStock = "5ab626e4d8ce87272e4c6e43";
                addToFilter(aks74u, rpktube, 1);
                addToFilter(aks74ub, rpktube, 1);
                addToFilter(aks74un, rpktube, 1);
                addToFilter(pp19, rpktube, 1);
                addToFilter(saiga9, rpktube, 1);
                addToFilter(asval, rpktube, 4);
                addToFilter(ak101, aksStock, 6);
                addToFilter(ak102, aksStock, 6);
                addToFilter(ak103, aksStock, 6);
                addToFilter(ak104, aksStock, 6);
                addToFilter(ak105, aksStock, 6);
                addToFilter(ak74m, aksStock, 6);
                addToFilter(aks74, ak74mStock, 6);
                addToFilter(aks74n, ak74mStock, 6);
                addToFilter(pp19, ak74mStock, 1);
                addToFilter(saiga9, ak74mStock, 1);
                addToFilter(aks74u, ak74mStock, 1);
                addToFilter(aks74ub, ak74mStock, 1);
                addToFilter(aks74un, ak74mStock, 1);
                items["5a69a2ed8dc32e000d46d1f1"]._props.ConflictingItems.push(
                    "5beec8b20db834001961942a"
                );
                //svd stock
                addToFilter("5c46fbd72e2216398b5a8c9c", "5df35ddddfc58d14537c2036", 2);
                //tacticals
                const mods = Object.values(items).filter((item) => item._props.Slots);
                mods.map((item) => 
                {
                    item._props.Slots.forEach((slot) => 
                    {
                        //mpr slot
                        if (slot._props.filters[0].Filter.includes("5649a2464bdc2d91118b45a8")) 
                        {
                            [
                                "558022b54bdc2dac148b458d",
                                "58491f3324597764bc48fa02",
                                "584924ec24597768f12ae244",
                                "6165ac8c290d254f5e6b2f6c",
                                "60a23797a37c940de7062d02",
                                "5d2da1e948f035477b1ce2ba",
                                "584984812459776a704a82a6",
                                "59f9d81586f7744c7506ee62",
                                "570fd721d2720bc5458b4596",
                                "57ae0171245977343c27bfcf",
                                "58d39d3d86f77445bb794ae7",
                                "616554fe50224f204c1da2aa",
                                "5c7d55f52e221644f31bff6a",
                                "616584766ef05c2ce828ef57",
                                "615d8d878004cc50514c3233",
                                "577d128124597739d65d0e56",
                                "58d2664f86f7747fec5834f6",
                                "5649a2464bdc2d91118b45a8",
                                "61714b2467085e45ef140b2c",
                                "5b31163c5acfc400153b71cb",
                                "5a33b652c4a28232996e407c",
                                "5a33b2c9c4a282000c5a9511"
                            ].forEach((sight) => 
                            {
                                if (!slot._props.filters[0].Filter.includes(sight)) 
                                {
                                    slot._props.filters[0].Filter.push(sight);
                                }
                            });
                        }
                        //alpha dog
                        if (slot._props.filters[0].Filter.includes("5c6165902e22160010261b28")) 
                        {
                            slot._props.filters[0].Filter.push("5a33a8ebc4a282000c5a950d");
                        }
                        //A2 frontsight
                        if (slot._props.filters[0].Filter.includes("5bc09a30d4351e00367fb7c8")) 
                        {
                            slot._props.filters[0].Filter.push("55d4af3a4bdc2d972f8b456f");
                        }
                        [
                            "544909bb4bdc2d6f028b4577",
                            "5d10b49bd7ad1a1a560708b0",
                            "5a800961159bd4315e3a1657",
                            "57fd23e32459772d0805bcf1",
                            "5c06595c0db834001a66af6c",
                            "5cc9c20cd7f00c001336c65d",
                            "5d2369418abbc306c62e0c80",
                            "5b07dd285acfc4001754240d",
                            "5a7b483fe899ef0016170d15",
                            "56def37dd2720bec348b456a",
                            "5a5f1ce64f39f90b401987bc",
                            "560d657b4bdc2da74d8b4572",
                            "5b3a337e5acfc4704b4a19a0",
                            "5c5952732e2216398b5abda2",
                            "57d17e212459775a1179a0f5",
                            "61605d88ffa6e502ac5e7eeb"
                        ].forEach((t) => 
                        {
                            if (slot._props.filters[0].Filter.includes(t)) 
                            {
                                [
                                    "544909bb4bdc2d6f028b4577",
                                    "5d10b49bd7ad1a1a560708b0",
                                    "5a800961159bd4315e3a1657",
                                    "57fd23e32459772d0805bcf1",
                                    "5c06595c0db834001a66af6c",
                                    "5cc9c20cd7f00c001336c65d",
                                    "5d2369418abbc306c62e0c80",
                                    "5b07dd285acfc4001754240d",
                                    "5a7b483fe899ef0016170d15",
                                    "56def37dd2720bec348b456a",
                                    "5a5f1ce64f39f90b401987bc",
                                    "560d657b4bdc2da74d8b4572",
                                    "5b3a337e5acfc4704b4a19a0",
                                    "5c5952732e2216398b5abda2",
                                    "57d17e212459775a1179a0f5",
                                    "61605d88ffa6e502ac5e7eeb"
                                ].forEach((tac) => 
                                {
                                    if (!slot._props.filters[0].Filter.includes(tac)) 
                                    {
                                        slot._props.filters[0].Filter.push(tac);
                                    }
                                });
                            }
                            if (
                                slot._props.filters[0].Filter.includes("5bc09a30d4351e00367fb7c8")
                            ) 
                            {
                                slot._props.filters[0].Filter.push("5649a2464bdc2d91118b45a8");
                            }
                        });
                    });
                });
                //mpr
                addArrayToFilter(
                    "5649a2464bdc2d91118b45a8",
                    [
                        "544909bb4bdc2d6f028b4577",
                        "5d10b49bd7ad1a1a560708b0",
                        "5a800961159bd4315e3a1657",
                        "57fd23e32459772d0805bcf1",
                        "5c06595c0db834001a66af6c",
                        "5cc9c20cd7f00c001336c65d",
                        "5d2369418abbc306c62e0c80",
                        "5b07dd285acfc4001754240d",
                        "5a7b483fe899ef0016170d15",
                        "56def37dd2720bec348b456a",
                        "5a5f1ce64f39f90b401987bc",
                        "560d657b4bdc2da74d8b4572",
                        "5b3a337e5acfc4704b4a19a0",
                        "5c5952732e2216398b5abda2",
                        "57d17e212459775a1179a0f5",
                        "61605d88ffa6e502ac5e7eeb"
                    ],
                    0
                );
                items["5a33e75ac4a2826c6e06d759"]._props.ConflictingItems = [
                    "5fc2369685fd526b824a5713",
                    "606587d11246154cad35d635",
                    "5a33ca0fc4a282000d72292f",
                    "5d120a10d7ad1a4e1026ba85",
                    "5b0800175acfc400153aebd4",
                    "602e620f9b513876d4338d9a",
                    "5a9eb32da2750c00171b3f9c",
                    "5bfe86df0db834001b734685",
                    "55d4ae6c4bdc2d8b2f8b456e",
                    "5c87a07c2e2216001219d4a2",
                    "5bb20e58d4351e00320205d7",
                    "5bb20e70d4351e0035629f8f",
                    "5beec8c20db834001d2c465c",
                    "5fbbaa86f9986c4cff3fe5f6",
                    "5fce16961f152d4312622bc9",
                    "5ae30c9a5acfc408fb139a03",
                    "5d135e83d7ad1a21b83f42d8",
                    "5d135ecbd7ad1a21c176542e",
                    "56eabf3bd2720b75698b4569",
                    "58d2946386f774496974c37e",
                    "58d2946c86f7744e271174b5",
                    "58d2947686f774485c6a1ee5",
                    "58d2947e86f77447aa070d53",
                    "5a33cae9c4a28232980eb086",
                    "5d44069ca4b9361ebd26fc37",
                    "5d4406a8a4b9361e4f6eb8b7",
                    "5947e98b86f774778f1448bc",
                    "5947eab886f77475961d96c5",
                    "5947c73886f7747701588af5",
                    "5c793fde2e221601da358614",
                    "591aef7986f774139d495f03",
                    "591af10186f774139d495f0e",
                    "5b39f8db5acfc40016387a1b"
                ];
                items["5c0e2ff6d174af02a1659d4a"]._props.ConflictingItems = [
                    "5fc2369685fd526b824a5713",
                    "606587d11246154cad35d635",
                    "5a33ca0fc4a282000d72292f",
                    "5d120a10d7ad1a4e1026ba85",
                    "5b0800175acfc400153aebd4",
                    "602e620f9b513876d4338d9a",
                    "5a9eb32da2750c00171b3f9c",
                    "5bfe86df0db834001b734685",
                    "55d4ae6c4bdc2d8b2f8b456e",
                    "5c87a07c2e2216001219d4a2",
                    "5bb20e58d4351e00320205d7",
                    "5bb20e70d4351e0035629f8f",
                    "5beec8c20db834001d2c465c",
                    "5fbbaa86f9986c4cff3fe5f6",
                    "5fce16961f152d4312622bc9",
                    "5ae30c9a5acfc408fb139a03",
                    "5d135e83d7ad1a21b83f42d8",
                    "5d135ecbd7ad1a21c176542e",
                    "56eabf3bd2720b75698b4569",
                    "58d2946386f774496974c37e",
                    "58d2946c86f7744e271174b5",
                    "58d2947686f774485c6a1ee5",
                    "58d2947e86f77447aa070d53",
                    "5a33cae9c4a28232980eb086",
                    "5d44069ca4b9361ebd26fc37",
                    "5d4406a8a4b9361e4f6eb8b7",
                    "5947e98b86f774778f1448bc",
                    "5947eab886f77475961d96c5",
                    "5947c73886f7747701588af5",
                    "5c793fde2e221601da358614",
                    "591aef7986f774139d495f03",
                    "591af10186f774139d495f0e",
                    "5b39f8db5acfc40016387a1b"
                ];
                //mags
                Object.values(items).map((item) => 
                {
                    if (item._parent === "5448bc234bdc2d3c308b4569") 
                    {
                        if (item._props.Height === 3) 
                        {
                            item._props.Height = 2;
                            item._props.ExtraSizeDown = 1;
                        }
                    }
                });
                //vector height
                items["5fc3f2d5900b1d5091531e57"]._props.Height = 1;
                items["5fb64bc92b1b027b1f50bcf2"]._props.Height = 1;
                //mp155 height
                items["606eef46232e5a31c233d500"]._props.ExtraSizeDown = 0;

            }
        }

    }

    private registerProfileImage(container: DependencyContainer): void
    {
        // Reference the mod "res" folder
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const imageFilepath = `./${preAkiModLoader.getModPath(this.mod)}res`;

        // Register route pointing to the profile picture
        const imageRouter = container.resolve<ImageRouter>("ImageRouter");
        imageRouter.addRoute(baseJson.avatar.replace(".png", ""), `${imageFilepath}/operator.png`);
    }

    private setupTraderUpdateTime(container: DependencyContainer): void
    {
        // Add refresh time in seconds when Config server allows to set configs
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const traderRefreshConfig: UpdateTime = { traderId: baseJson._id, seconds: 3600 }
        traderConfig.updateTime.push(traderRefreshConfig);
    }

    private createAssortTable(): ITraderAssort 
    {
        // Assort table
        const assortTable: ITraderAssort = {
            nextResupply: 0,
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        }
        const prices = this.databaseServer.getTables().templates.prices;
        Object.values(presetsJson).forEach((preset, index) =>
        {
            let price = 0;
            if (index != Object.values(presetsJson).length-1)
            {
                preset.items.forEach((item) =>
                {
                    if (item._id === preset.root)
                    {
                        assortTable.items.push({
                            _id: item._id,
                            _tpl: item._tpl,
                            parentId: "hideout",
                            slotId: "hideout",
                            upd: {
                                UnlimitedCount: true,
                                StackObjectsCount: 999999
                            }
                        });
                    }
                    else
                    {
                        assortTable.items.push({
                            _id: item._id,
                            _tpl: item._tpl,
                            parentId: item.parentId,
                            slotId: item.slotId,
                            upd: {
                                StackObjectsCount: 1
                            }
                        });
                    }
                    price += prices[item._tpl];
                });
            }
            assortTable.barter_scheme[preset.root] = [
                [
                    {
                        count: price * this.cfg.price_multiplier,
                        _tpl: "5449016a4bdc2d6f028b456f"
                    }
                ]
            ];
            assortTable.loyal_level_items[preset.root] = 1;
        })

        function addItem(name, id, loyalty, mult = 1)
        {
            assortTable.items.push({
                _id: name,
                _tpl: id,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: true,
                    StackObjectsCount: 999999
                }
            });
            assortTable.barter_scheme[name] = [
                [
                    {
                        count: prices[id] * mult,
                        _tpl: "5449016a4bdc2d6f028b456f"
                    }
                ]
            ];
            assortTable.loyal_level_items[name] = loyalty;
        }

        addItem("magnum12", "5d6e6806a4b936088465b17e", 1, this.cfg.price_multiplier);
        addItem("flechette", "5d6e6911a4b9361bd5780d52", 1, this.cfg.price_multiplier);
        addItem("ap20", "5d6e68a8a4b9360b6c0d54e2", 2, this.cfg.price_multiplier);
        addItem("zvezda", "5e85a9f4add9fe03027d9bf1", 2, this.cfg.price_multiplier);
        addItem("shrap10", "5e85a9a6eacf8c039e4e2ac1", 1, this.cfg.price_multiplier);
        addItem("shrap25", "5f647f31b6238e5dd066e196", 1, this.cfg.price_multiplier);
        addItem("barrikada", "5e85aa1a988a8701445df1f5", 2, this.cfg.price_multiplier);
        addItem("9x18pbm", "573719df2459775a626ccbc2", 1, this.cfg.price_multiplier);
        addItem("762x25pstgzh", "573603562459776430731618", 1, this.cfg.price_multiplier);
        addItem("9x19ap", "5c925fa22e221601da359b7b", 1, this.cfg.price_multiplier);
        addItem("9x19pbp", "5efb0da7a29a85116f6ea05f", 2, this.cfg.price_multiplier);
        addItem("45ap", "5efb0cabfb3e451d70735af5", 1, this.cfg.price_multiplier);
        addItem("45rip", "5ea2a8e200685063ec28c05a", 1, this.cfg.price_multiplier);
        addItem("9x21", "5a26ac0ec4a28200741e1e18", 2, this.cfg.price_multiplier);
        addItem("ss190", "5cc80f38e4a949001152b560", 2, this.cfg.price_multiplier);
        addItem("sb193", "5cc80f67e4a949035e43bbba", 1, this.cfg.price_multiplier);
        addItem("subsonicSX", "5ba26844d4351e00334c9475", 2, this.cfg.price_multiplier);
        addItem("APSX", "5ba26835d4351e0035628ff5", 3, this.cfg.price_multiplier);
        addItem("9x39sp5", "57a0dfb82459774d3078b56c", 2, this.cfg.price_multiplier);
        addItem("9x39sp6", "57a0e5022459774d1673f889", 3, this.cfg.price_multiplier);
        addItem("9x39bp", "5c0d688c86f77413ae3407b2", 4, this.cfg.price_multiplier);
        addItem("366ap", "5f0596629e22f464da6bbdd9", 1, this.cfg.price_multiplier);
        addItem("7N40", "61962b617c6c7b169525f168", 1, this.cfg.price_multiplier);
        addItem("igolnik", "5c0d5e4486f77478390952fe", 3, this.cfg.price_multiplier);
        addItem("m856a1", "59e6906286f7746c9f75e847", 1, this.cfg.price_multiplier);
        addItem("m855a1", "54527ac44bdc2d36668b4567", 3, this.cfg.price_multiplier);
        addItem("ssaap", "601949593ae8f707c4608daa", 4, this.cfg.price_multiplier);
        addItem("300whisper", "6196365d58ef8c428c287da1", 1, this.cfg.price_multiplier);
        addItem("300vmax", "6196364158ef8c428c287d9f", 2, this.cfg.price_multiplier);
        addItem("300ap", "5fd20ff893a8961fc660a954", 3, this.cfg.price_multiplier);
        addItem("762us", "59e4d24686f7741776641ac7", 1, this.cfg.price_multiplier);
        addItem("762bp", "59e0d99486f7744a32234762", 2, this.cfg.price_multiplier);
        addItem("762ap", "601aa3d2b2bcb34913271e6d", 3, this.cfg.price_multiplier);
        addItem("762x54bt", "5e023d34e8a400319a28ed44", 1, this.cfg.price_multiplier);
        addItem("762x54bs", "5e023d48186a883be655e551", 2, this.cfg.price_multiplier);
        addItem("338fmj", "5fc275cf85fd526b824a571a", 3, this.cfg.price_multiplier);
        addItem("338ap", "5fc382a9d724d907e2077dab", 4, this.cfg.price_multiplier);
        addItem("ps12b", "5cadf6eeae921500134b2799", 3, this.cfg.price_multiplier);
        addItem("m441", "5ede47405b097655935d7d16", 3, this.cfg.price_multiplier);
        addItem("m576", "5ede475339ee016e8c534742", 3, this.cfg.price_multiplier);
        addItem("vog17", "5e32f56fcb6d5863cc5e5ee4", 1, this.cfg.price_multiplier);
        addItem("rgn", "617fd91e5539a84ec44ce155", 3, this.cfg.price_multiplier);
        addItem("rgo", "618a431df1eb8e24b8741deb", 2, this.cfg.price_multiplier);
        addItem("m18", "617aa4dd8166f034d57de9c5", 1, this.cfg.price_multiplier);
        addItem("m7290", "619256e5f8af2c1a4e1f5d92", 1, this.cfg.price_multiplier);
        addItem("m61", "5a6086ea4f39f99cd479502f", 2, this.cfg.price_multiplier);
        addItem("m993", "5efb0c1bd79ff02a1f5e68d9", 3, this.cfg.price_multiplier);
        //mags
        addItem("417x20", "617131a4568c120fdd29482d", 2, this.cfg.price_multiplier);
        addItem("USPx12", "6193d3149fb0c665d5490e32", 1, this.cfg.price_multiplier);
        addItem("MK17x20", "6183d53f1cb55961fa0fdcda", 2, this.cfg.price_multiplier);
        addItem("MK17x20x", "618168dc8004cc50514c34fc", 2, this.cfg.price_multiplier);
        addItem("SKSx75", "61695095d92c473c7702147a", 1, this.cfg.price_multiplier);
        addItem("MPXx41", "5c5db6652e221600113fba51", 1, this.cfg.price_multiplier);
        addItem("MPXx50", "5c5db6742e2216000f1b2852", 2, this.cfg.price_multiplier);
        addItem("SVDx20", "5c88f24b2e22160bc12c69a6", 1, this.cfg.price_multiplier);
        addItem("AKx73", "5c6175362e221600133e3b94", 3, this.cfg.price_multiplier);
        addItem("MAG5x100", "5c6592372e221600133e47d7", 3, this.cfg.price_multiplier);
        addItem("vityazx30", "599860ac86f77436b225ed1a", 1, this.cfg.price_multiplier);
        addItem("C-10x30", "5c0548ae0db834001966a3c2", 1, this.cfg.price_multiplier);
        addItem("RPKx95", "5bed625c0db834001c062946", 2, this.cfg.price_multiplier);
        addItem("FALx30", "5b7d37845acfc400170e2f87", 2, this.cfg.price_multiplier);
        addItem("Falx30", "5b7bef5d5acfc43bca7067a3", 2, this.cfg.price_multiplier);
        addItem("X-14", "5addccf45acfc400185c2989", 3, this.cfg.price_multiplier);
        addItem("M14x30", "5addcce35acfc4001a5fc635", 2, this.cfg.price_multiplier);
        addItem("PMAGx30", "5aaa5dfee5b5b000140293d3", 1, this.cfg.price_multiplier);
        addItem("AKpmagx30", "59d6272486f77466146386ff", 1, this.cfg.price_multiplier);
        addItem("SR3M", "5a9e81fba2750c00164f6b11", 1, this.cfg.price_multiplier);
        addItem("545pmagx30", "5aaa4194e5b5b055d06310a5", 1, this.cfg.price_multiplier);
        addItem("SOK-12", "5a966f51a2750c00156aacf6", 2, this.cfg.price_multiplier);
        addItem("133x8", "55d485804bdc2d8c2f8b456b", 1, this.cfg.price_multiplier);
        addItem("545x45", "55d481904bdc2d8c2f8b456a", 2, this.cfg.price_multiplier);
        addItem("X-5", "5a351711c4a282000b1521a4", 2, this.cfg.price_multiplier);
        addItem("6L31", "55d482194bdc2d1d4e8b456b", 2, this.cfg.price_multiplier);
        addItem("palm1", "59fafc5086f7740dbe19f6c3", 3, this.cfg.price_multiplier);
        addItem("palm2", "59fafc9386f774067d462453", 3, this.cfg.price_multiplier);
        addItem("pmx84", "55d485be4bdc2d962f8b456f", 1, this.cfg.price_multiplier);
        addItem("d60", "59c1383d86f774290a37e0ca", 3, this.cfg.price_multiplier);
        addItem("pmagx40", "544a378f4bdc2d30388b4567", 2, this.cfg.price_multiplier);
        addItem("pmag308x20", "5a3501acc4a282000d72293a", 2, this.cfg.price_multiplier);
        addItem("SGMT", "5a718f958dc32e00094b97e7", 3, this.cfg.price_multiplier);
        addItem("X-FAL", "5b7bef9c5acfc43d102852ec", 3, this.cfg.price_multiplier);
        addItem("MMWx20", "5b7c2d1d5acfc43d1028532a", 2, this.cfg.price_multiplier);
        addItem("MP7x40", "5ba26586d4351e44f824b340", 3, this.cfg.price_multiplier);
        addItem("MP7x20", "5ba264f6d4351e0034777d52", 2, this.cfg.price_multiplier);
        addItem("X-47", "5cfe8010d7ad1a59283b14c6", 3, this.cfg.price_multiplier);
        addItem("FNx50", "5cc70093e4a949033c734312", 2, this.cfg.price_multiplier);
        addItem("700x20", "5cf12a15d7f00c05464b293f", 1, this.cfg.price_multiplier);
        addItem("SOK-12x20", "5cf8f3b0d7f00c00217872ef", 3, this.cfg.price_multiplier);
        addItem("ppshx71", "5ea034f65aad6446a939737e", 1, this.cfg.price_multiplier);
        addItem("umpx25", "5fc3e466187fea44d52eda90", 1, this.cfg.price_multiplier);
        addItem("glock45x30", "5fb651dc85f90547f674b6f4", 1, this.cfg.price_multiplier);
        addItem("glockx33", "5a7ad2e851dfba0016153692", 1, this.cfg.price_multiplier);
        //other
        addItem("ammobox", "5aafbde786f774389d0cbc0f", 1, this.cfg.price_multiplier);
        addItem("magbox", "5c127c4486f7745625356c13", 2, this.cfg.price_multiplier);
        addItem("weapon-case", "59fb023c86f7746d0d4b423c", 2, this.cfg.price_multiplier);
        addItem("THICC", "5c0a840b86f7742ffa4f2482", 4, this.cfg.price_multiplier);
        addItem("flir", "5d1b5e94d7ad1a2b865a96b0", 3, this.cfg.price_multiplier);
        addItem("reap", "5a1eaa87fcdbcb001865f75e", 4, this.cfg.price_multiplier);
        addItem("reap-eyecup", "5a1eacb3fcdbcb09800872be", 4, this.cfg.price_multiplier);
        addItem("reap-mount", "5a1ead28fcdbcb001912fa9f", 4, this.cfg.price_multiplier);
        addItem("vulcan-eyecup", "5b3cbc235acfc4001863ac44", 2, this.cfg.price_multiplier);
        addItem("vulcan", "5b3b6e495acfc4330140bd88", 2, this.cfg.price_multiplier);
        addItem("vulcan-mount", "5b3b6dc75acfc47a8773fb1e", 2, this.cfg.price_multiplier);

        return assortTable;
    }
}

module.exports = { mod: new Mod() }