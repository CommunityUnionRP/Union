module.exports = {
    "getBizInfo": (player) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        var values = [biz.sqlId, biz.name, biz.bizType, biz.ownerName, biz.products, biz.maxProducts,
            biz.productPrice, biz.balance, biz.status, biz.staff.length, biz.price
        ];
        player.call("infoTable.show", ["biz_info", values]);
    },
    "biz.balance.get": (player) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        player.utils.bank("Финансовый отчет", `На кассе ~y~${biz.name}~g~ ${biz.balance}$`);
    },
    "biz.balance.add": (player, value) => {
        //debug(`biz.balance.add: ${value}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        value = Math.clamp(value, 0, player.money);
        player.utils.bank(`Отчет бизнеса`, `Касса ~y~${biz.name}~w~ пополнена на ~g~${value}$. ~w~Всего: ~g~${biz.balance + value}$.`);
        biz.setBalance(biz.balance + value);
        player.utils.setMoney(player.money - value);
    },
    "biz.balance.take": (player, value) => {
        //debug(`biz.balance.take: ${value}`)
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        value = Math.clamp(value, 0, biz.balance);
        player.utils.bank(`Отчет бизнеса`, `С кассы ~y~${biz.name}~w~ снято ~g~${value}$. ~w~Всего: ~g~${biz.balance - value}$.`);
        biz.setBalance(biz.balance - value);
        player.utils.setMoney(player.money + value);
    },
    "biz.getStats": (player, offset) => {
        //debug(`biz.getStats: ${offset}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        if (offset < 0) offset = 0;
        DB.Handle.query("SELECT * FROM logs_bizes WHERE bizId=? ORDER BY id DESC LIMIT ?,30", [biz.sqlId, offset], (e, result) => {
            for (var i = 0; i < result.length; i++) {
                delete result[i].bizId;
                delete result[i].playerId;
            }
            //console.log(result);
            player.call("bizLogs.init", [result, offset]);
        });
    },
    "biz.products.buy": (player, products) => {
        //debug(`biz.products.buy: ${products}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);
        if (biz.products == biz.maxProducts) return player.utils.error(`Склад полный!`);

        products = Math.clamp(products, 1, biz.maxProducts - biz.products);
        var sum = products * mp.economy[`product_price_biz_${biz.bizType}`].value;
        if (sum > player.money) return player.utils.error(`У Вас недостаточно наличных!`);

        player.utils.bank("Отчет бизнеса", `Склад ~y~${biz.name}~w~ пополнен на ~g~${products}~w~ ед. товара. Всего: ~g~${biz.products + products}/${biz.maxProducts}~w~ ед.`);
        biz.setProducts(biz.products + products);
        player.utils.setMoney(player.money - sum);
    },
    "biz.products.sell": (player, products) => {
        //debug(`biz.products.sell: ${products}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);
        if (biz.products == 0) return player.utils.error(`На складе нет товара!`);

        products = Math.clamp(products, 1, biz.products);
        var sum = products * mp.economy[`product_price_biz_${biz.bizType}`].value * mp.economy.product_price_biz_sell.value;

        player.utils.bank("Отчет бизнеса", `Со склада ~y~${biz.name}~w~ списано ~g~${products}~w~ ед. товара. Всего: ~g~${biz.products - products}/${biz.maxProducts}~w~ ед.`);
        biz.setProducts(biz.products - products);
        player.utils.setMoney(player.money + sum);
    },
    "biz.products.price": (player, productPrice) => {
        //debug(`biz.products.price: ${productPrice}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);
        if (mp.economy[`product_price_biz_${biz.bizType}`].value > productPrice || 10 < productPrice) return player.utils.error(`Доступно от $${mp.economy[`product_price_biz_${biz.bizType}`].value} до $10`);
        productPrice = Math.clamp(productPrice, mp.economy[`product_price_biz_${biz.bizType}`].value, 10);

        biz.setProductPrice(productPrice);
        player.utils.bank("Отчет бизнеса", `Новая цена товара: ${biz.productPrice}$`);
    },
    "biz.setStatus": (player, status) => {
        //debug(`biz.setStatus: ${status}`)
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        if (biz.status == status) {
            if (biz.status == 0) return player.utils.error(`Бизнес уже закрыт!`);
            else return player.utils.error(`Бизнес уже открыт!`);
        }
        biz.setStatus(status);
        //player.utils.addBiz(biz);
        if (status == 0) player.utils.bank("Отчет бизнеса", `Бизнес ~y~${biz.name} ~r~закрыт~w~!`);
        else player.utils.bank("Отчет бизнеса", `Бизнес ~y~${biz.name} ~g~открыт~w~!`);

    },
    "biz.sellToGov": (player) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        biz.setOwner(0);
        player.utils.setMoney(player.money + biz.price * mp.economy.biz_sell.value);
        player.utils.removeBiz(biz);
        player.utils.success(`Вы продали бизнес государству!`);
        mp.logs.addLog(`${player.name} продал бизнес ${biz.sqlId} государству. Цена: ${biz.price}`, 'biz', player.account.id, player.sqlId, { bizId: biz.sqlId, price: biz.price });
    },
    "biz.sell": (player, values) => {
        //debug(`biz.sell: ${values}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (!biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        values = JSON.parse(values);
        var buyerName = values[0];
        var price = values[1];
        if (price < 1) price = 1;
        var invitePlayer = mp.players.getByName(buyerName);
        const bizes = mp.bizes.getArrayByOwner(invitePlayer.sqlId);
        if (bizes.length >= buyerName.donateBizes) return player.utils.error(`Игрок имеет максимальное количество бизнесов`);
        if (buyerName == player.name) return player.utils.error(`Нельзя продать бизнес самому себе!`);

        var buyer;
        mp.players.forEachInRange(player.position, 5, (rec) => {
            if (rec.name == buyerName) buyer = rec;
        });
        if (!buyer) return player.utils.error(`${buyerName} не рядом с Вами!`);

        buyer.buyBiz = {
            seller: player,
            biz: biz,
            price: price
        };

        player.utils.success(`Предложение создано!`);
        buyer.call("modal.hide");
        buyer.call("choiceMenu.show", ["accept_sell_biz", {
            owner: player.name,
            type: mp.bizes.getNameByType(biz.bizType),
            price: price
        }]);
    },
    "biz.sell.accept": (player) => {
        if (!player.buyBiz) return player.utils.error(`Предложение о покупке бизнеса истекло!`);
        var seller = player.buyBiz.seller;
        var biz = player.buyBiz.biz;
        var price = player.buyBiz.price;
        delete player.buyBiz;
        if (!seller || player.dist(seller.position) > 5) return player.utils.error(`Продавец не рядом с Вами!`);
        if (!biz.isOwner(seller)) return player.utils.error(`Продавец уже не владеет бизнесом!`);
        if (player.money < price) return player.utils.error(`Недостаточно средств!`);

        player.utils.setMoney(player.money - price);
        seller.utils.setMoney(seller.money + price);

        player.utils.success(`Вы купили бизнес!`);
        seller.utils.success(`Вы продали бизнес!`);

        mp.logs.addLog(`${seller.name} продал бизнес ${biz.sqlId} игроку ${player.name}. Цена: ${price}`, 'biz', seller.account.id, seller.sqlId, { bizId: biz.sqlId, price: price });
        mp.logs.addLog(`${player.name} купил бизнес ${biz.sqlId} у игрока ${seller.name}. Цена: ${price}`, 'biz', player.account.id, player.sqlId, { bizId: biz.sqlId, price: price });

        seller.utils.removeBiz(biz);
        player.utils.addBiz(biz);

        biz.setOwner(player.sqlId, player.name);
    },
    "biz.sell.cancel": (player) => {
        if (player.buyBiz.seller) player.buyBiz.seller.utils.warning(`Предложение отклонено!`);
        delete player.buyBiz;
        player.utils.info(`Предложение отклонено!`);
    },
    "biz.buy": (player) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.owner != 0) return player.utils.error(`Бизнес уже имеет владельца!`);
        const bizes = mp.bizes.getArrayByOwner(player.sqlId);
        if (bizes.length >= player.donateBizes) return player.utils.error(`Вы имеете максимальное количество бизнесов`);
        if (player.money < biz.price) return player.utils.error(`Недостаточно средств!`);

        player.utils.setMoney(player.money - biz.price);
        biz.setOwner(player.sqlId, player.name);
        player.utils.addBiz(biz);
        mp.logs.addLog(`${player.name} купил бизнес ${biz.sqlId}. Цена: ${biz.price}`, 'biz', player.account.id, player.sqlId, { bizId: biz.sqlId, price: biz.price });
        player.utils.success(`Вы купили бизнес!`);
    },
    "biz.show": (player, name) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        var whiteList = ["biz_buy"]; // for all players
        if (whiteList.indexOf(name) == -1 && !biz.isOwner(player)) return player.utils.error(`Вы не являетесь владельцем бизнеса!`);

        var values;
        var names = {
            "biz_sell_to_player": () => {
                values = {
                    type: mp.bizes.getNameByType(biz.bizType),
                    balance: biz.balance,
                    staff: biz.staff.length,
                    products: biz.products,
                    maxProducts: biz.maxProducts
                };
            },
            "biz_sell_to_gov": () => {
                values = {
                    type: mp.bizes.getNameByType(biz.bizType),
                    balance: biz.balance,
                    staff: biz.staff.length,
                    products: biz.products,
                    maxProducts: biz.maxProducts,
                    price: biz.price,
                    ratio: mp.economy.biz_sell.value
                };
            },
            "biz_products_buy": () => {
                values = {
                    productPrice: mp.economy[`product_price_biz_${biz.bizType}`].value,
                    products: biz.products,
                    maxProducts: biz.maxProducts
                };
            },
            "biz_products_sell": () => {
                values = {
                    productPriceSell: mp.economy.product_price_biz_sell.value,
                    productPrice: mp.economy[`product_price_biz_${biz.bizType}`].value,
                    products: biz.products,
                    maxProducts: biz.maxProducts
                };
            },
            "biz_products_price": () => {
                values = {
                    productPrice: biz.productPrice,
                };
            },
            "biz_buy": () => {
                values = {
                    type: mp.bizes.getNameByType(biz.bizType),
                    staff: biz.staff.length,
                    products: biz.products,
                    maxProducts: biz.maxProducts,
                    price: biz.price
                };
            }
        };

        if (names[name]) {
            names[name]();
            player.call("modal.show", [name, values]);
        }
    },

    /* Магазин одежды */
    "biz_3.clearItems": (player) => {
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 3) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);

        player.body.clearItems();
    },

    "biz_3.buyItem": (player, type, index, texture) => {
        // debug(`biz_3.buyItem: ${player.name} ${type} ${index} ${texture}`)
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 3) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);

        var clothes = mp.clothes[type][player.sex][index];
        if (!clothes) return player.utils.error(`Одежда ${index} не найдена!`);
        if (clothes.textures[texture] == null) return player.utils.error(`Текстура ${texture} одежды ${index} не найдена!`);

        // TODO: Подобрать расход продуктов бизнеса для магазина одежды.
        var products = parseInt(clothes.price / 10);
        if (player.money < clothes.price) return player.utils.error(`Необходимо ${clothes.price}$`);
        if (biz.products < products) return player.utils.error(`У бизнеса недостаточно товара!`);
        // console.log(clothes);

        var types = ["top","legs","feets","hats","glasses","bracelets","ears","masks","ties","watches"];
        var itemIds = [7,8,9,6,1,12,10,14,2,11];
        var itemId = itemIds[types.indexOf(type)];

        var params = {
            sex: player.sex,
            owner: player.sqlId,
            variation: clothes.variation,
            texture: clothes.textures[texture]
        };
        if (type == "top") {
            params.rows = clothes.rows;
            params.cols = clothes.cols;
            params.torso = clothes.torso;
        } else if (type == "legs") {
            params.rows = clothes.rows;
            params.cols = clothes.cols;
        }

        player.inventory.add(itemId, params, {}, (e) => {
            if (e) return player.utils.error(e);

            if(player.admin <= 0) {
                biz.setProducts(biz.products - products);
                biz.setBalance(biz.balance + clothes.price);
            }

            player.utils.setMoney(player.money - clothes.price);
            player.utils.success(`Вы купили ${mp.inventory.getItem(itemId).name}!`);
            biz.log(player.id, `${player.name} купил ${mp.inventory.getItem(itemId).name}`, clothes.price, products);
        });

    },

    /* АЗС */
    "biz_5.buyItem": (player, index, fuel) => {
        //debug(`biz_5.buyItem: ${player.name} ${index} ${fuel}`)
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 5) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);

        if (index == 0) { // заправить авто
            var veh = mp.getNearVehicle(biz.position, Config.gasRange)
            if (!veh) return player.utils.error(`Подгоните авто!`);
            fuel = Math.clamp(fuel, 0, veh.vehPropData.maxFuel - veh.vehPropData.fuel);
            if (!fuel) return player.utils.error(`Бак полный!`);
            var price = fuel * biz.productPrice;
            if (player.money < price) return player.utils.error(`Необходимо ${price}$`);
            if (biz.products < fuel) return player.utils.error(`У бизнеса недостаточно товара!`);

            if(player.admin <= 0) {
                biz.setProducts(biz.products - fuel);
                biz.setBalance(biz.balance + price);
            }

            veh.utils.setFuel(veh.vehPropData.fuel + fuel);
            player.utils.setMoney(player.money - price);
            player.utils.success(`Заправлено ${veh.vehPropData.fuel}/${veh.vehPropData.maxFuel} л.`);
            biz.log(player.id, `${player.name} заправил ${veh.name}`, price, fuel);

        } else if (index == 1) { //заправить канистру
            var canisters = player.inventory.getArrayByItemId(36);
            if (!Object.keys(canisters).length) return player.utils.error(`Необходима канистра!`);
            for (var key in canisters) {
                var item = canisters[key];
                var fuel = item.params.maxCount - item.params.count;
                if (fuel > 0) {
                    var price = fuel * biz.productPrice;
                    if (player.money < price) return player.utils.error(`Необходимо ${price}$`);
                    if (biz.products < fuel) return player.utils.error(`У бизнеса недостаточно товара!`);

                    if(player.admin <= 0) {
                        biz.setProducts(biz.products - fuel);
                        biz.setBalance(biz.balance + price);
                    }

                    item.params.count = item.params.maxCount;
                    player.inventory.updateParams(item.id, item);
                    player.utils.setMoney(player.money - price);
                    player.utils.success(`Канистра заправлена!`);
                    biz.log(player.id, `${player.name} заправил канистру`, price, fuel);
                    return;
                }
            }
            player.utils.error(`Канистры уже полные!`);
        }
    },

    /* Магазин 24/7 */
    "biz_6.buyItem": (player, itemId) => {
        //debug(`biz_6.buyItem: ${player.name} ${itemId}`)
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 6) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);
        // При смене продуктов меняем их в OnPlayerEnterColshape | 68 строка - biz6INfo
        var biz6INfo = {
            30: {
                products: 10,
                params: {
                    satiety: 10,
                    thirst: 50,
                },
            },
            31: {
                products: 8,
                params: {
                    satiety: 25,
                    thirst: -30,
                },
            },
            32: {
                products: 12,
                params: {
                    satiety: 35,
                    thirst: -25,
                },
            },
            33: {
                products: 5,
                params: {
                    satiety: 35,
                    thirst: -15,
                },
            },
            34: {
                products: 15,
                params: {
                    count: 20
                },
            },
            35: {
                products: 20,
                params: {
                    satiety: 10,
                    thirst: 30,
                },
            },
            15: {
                products: 40,
                params: {
                    owner: player.sqlId
                },
            },
            13: {
                products: 20,
                params: {
                    sex: player.sex,
                    variation: 45,
                    texture: 0,
                    rows: 5,
                    cols: 10
                },
            },
            36: {
                products: 30,
                params: {
                    count: 0,
                    maxCount: 20
                },
            },
            25: {
                products: 20,
                params: {
                    count: 15,
                },
            },
        };
        if (!biz6INfo[itemId]) return player.utils.error(`Предмет не найден!`);
        var info = biz6INfo[itemId];
        var price = info.products * biz.productPrice;
        if (player.money < price) return player.utils.error(`Необходимо ${price}$`);
        if (biz.products < info.products) return player.utils.error(`У бизнеса недостаточно товара!`);
        if (player.waitOperation) return player.utils.error(`Дождитесь выполнения предыдущей операции!`);
        player.inventory.add(itemId, info.params, {}, (e) => {
            if (e) return player.utils.error(e);

            if(player.admin <= 0) {
                biz.setProducts(biz.products - info.products);
                biz.setBalance(biz.balance + price);
            }

            player.utils.setMoney(player.money - price);
            player.utils.success(`Вы купили ${mp.inventory.getItem(itemId).name}`);
            biz.log(player.id, `${player.name} купил ${mp.inventory.getItem(itemId).name}`, price, info.products);
        });
    },

    /* Оружейный магазин. */
    "biz_8.buyItem": (player, itemId) => {
        //debug(`biz_8.buyItem: ${player.name} ${itemId}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 8) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);
        // При смене продуктов меняем их в OnPlayerEnterColshape | 68 строка - biz8INfo
        var biz8INfo = {
            41: {
                products: 60,
                params: {
                    weaponHash: mp.joaat("weapon_bat"),
                },
            },
            42: {
                products: 50,
                params: {
                    weaponHash: mp.joaat("weapon_knuckle"),
                },
            },
            43: {
                products: 70,
                params: {
                    weaponHash: mp.joaat("weapon_knife"),
                },
            },
            44: {
                products: 180,
                params: {
                    weaponHash: mp.joaat("weapon_pistol"),
                },
            },
            45: {
                products: 240,
                params: {
                    weaponHash: mp.joaat("weapon_appistol"),
                },
            },
            47: {
                products: 280,
                params: {
                    weaponHash: mp.joaat("weapon_microsmg"),
                },
            },
            48: {
                products: 300,
                params: {
                    weaponHash: mp.joaat("weapon_smg"),
                },
            },
            49: {
                products: 350,
                params: {
                    weaponHash: mp.joaat("weapon_sawnoffshotgun"),
                },
            },
        };
        if (!biz8INfo[itemId]) return player.utils.error(`Оружие не найдено!`);
        var info = biz8INfo[itemId];
        var price = info.products * biz.productPrice;
        if (player.money < price) return player.utils.error(`Необходимо ${price}$`);
        if (biz.products < info.products) return player.utils.error(`У бизнеса недостаточно товара!`);
        if (player.waitOperation) return player.utils.error(`Дождитесь выполнения предыдущей операции!`);
        info.params.owner = player.sqlId;
        info.params.ammo = 0;


        player.inventory.add(itemId, info.params, {}, (e) => {
            if (e) return player.utils.error(e);

            if(player.admin <= 0) {
                biz.setProducts(biz.products - info.products);
                biz.setBalance(biz.balance + price);
            }

            player.utils.setMoney(player.money - price);
            player.utils.success(`Вы купили ${mp.inventory.getItem(itemId).name}`);
            biz.log(player.id, `${player.name} купил ${mp.inventory.getItem(itemId).name}`, price, info.products);
        });
    },

    "biz_8.buyAmmo": (player, index, ammo) => {
        // debug(`biz_8.takeAmmo: ${index} ${ammo}`);
        if (!player.colshape || !player.colshape.biz) return player.utils.error(`Вы не у бизнеса!`);
        var biz = player.colshape.biz;
        if (biz.bizType != 8) return player.utils.error(`Неверный тип бизнеса!`);
        if (!biz.status) return player.utils.error(`Бизнес закрыт!`);

        var itemIds = [37, 38, 40, 39];
        var index = Math.clamp(index, 0, itemIds.length - 1);
        var price = ammo * biz.productPrice;
        if (player.money < price) return player.utils.error(`Необходимо ${price}$`);
        if (biz.products < ammo) return player.utils.error(`У бизнеса недостаточно товара!`);
        if (player.waitOperation) return player.utils.error(`Дождитесь выполнения предыдущей операции!`);

        var params = {
            ammo: ammo,
        };
        player.inventory.add(itemIds[index], params, {}, (e) => {
            if (e) return player.utils.error(e);

            if(player.admin <= 0) {
                biz.setProducts(biz.products - ammo);
                biz.setBalance(biz.balance + price);
            }

            player.utils.setMoney(player.money - price);
            player.utils.success(`Вы купили ${mp.inventory.getItem(itemIds[index]).name}!`);
            biz.log(player.id, `${player.name} купил ${mp.inventory.getItem(itemIds[index]).name}`, price, ammo);

        });
    },
}
