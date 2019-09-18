module.exports = {
    "create_biz": {
        description: "Создать бизнес. Маркер ставится по позиции игрока.<br/>Тип:<br/>1 - закусочная<br/>2 - бар<br/>3 - магазин одежды<br/>4 - барбершоп<br/>5 - АЗС<br/>6 - 24/7<br/>7 - тату салон<br/>8 - оружейный магазин<br/>9 - автосалон<br/>10 - LS Customs<br/>11 - СТО",
        minLevel: 5,
        syntax: "[цена]:n [тип]:n [имя]:s",
        handler: (player, args) => {
            var price = args[0];
            var type = args[1];
            args.splice(0, 2);
            var name = args.join(" ");
            mp.bizes.create(name, price, type, player.position);
            terminal.info(`${player.name} создал бизнес "${name}" (цена: ${price}$, тип: ${type})`);
        }
    },
    "delete_biz": {
        description: "Удалить бизнес",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n",
        handler: (player, args) => {
            mp.bizes.delete(args[0], (e) => {
                if (e) return terminal.error(e, player);
                terminal.info(`${player.name} удалил бизнес с ID: ${args[0]}`);
            });
        }
    },
    "set_biz_name": {
        description: "Изменить имя бизнеса",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [имя]:s",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил имя у бизнеса с ID: ${args[0]}`);
            args.splice(0, 1);
            biz.setName(args.join(" ").trim());
        }
    },
    "set_biz_owner": {
        description: "Изменить владельца бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [имя]:s [фамилия]:s",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            var name = `${args[1]} ${args[2]}`;
            DB.Characters.getSqlIdByName(name, (sqlId) => {
                if (!sqlId) return terminal.error(`Персонаж с именем ${name} не найден!`, player);

                biz.setOwner(sqlId, name);
                terminal.info(`${player.name} изменил владельца у бизнеса с ID: ${args[0]}`);
            });
        }
    },
    "delete_biz_owner": {
        description: "Удалить владельца бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setOwner(0, '');
            terminal.info(`${player.name} удалил владельца у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_price": {
        description: "Изменить стоимость бизнеса",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [цена]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setPrice(args[1]);
            terminal.info(`${player.name} изменил цену у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_products": {
        description: "Изменить количество товара на складе бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [товар]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setProducts(args[1]);
            terminal.info(`${player.name} изменил количество товара у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_maxproducts": {
        description: "Изменить вместимость товара на складе бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [вместимость]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setMaxProducts(args[1]);
            terminal.info(`${player.name} изменил вместимость склада у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_productprice": {
        description: "Изменить цену за 1 ед. товара у бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [цена]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setProductPrice(args[1]);
            terminal.info(`${player.name} изменил стоимость товара у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_balance": {
        description: "Изменить баланс бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [баланс]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setBalance(args[1]);
            terminal.info(`${player.name} изменил баланс у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_type": {
        description: "Изменить тип бизнеса.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [тип]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setType(args[1]);
            terminal.info(`${player.name} изменил тип у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_status": {
        description: "Изменить статус бизнеса.<br/>Статусы:<br/>0 - закрыт<br/>1- открыт",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n [статус]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setStatus(args[1]);
            terminal.info(`${player.name} изменил статус у бизнеса с ID: ${args[0]}`);
        }
    },
    "set_biz_position": {
        description: "Изменить позицию бизнеса. Позиция берется от игрока.",
        minLevel: 5,
        syntax: "[ид_бизнеса]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);

            biz.setPosition(player.position);
            terminal.info(`${player.name} изменил позицию у бизнеса с ID: ${args[0]}`);
        }
    },
    "tp_biz": {
        description: "Телепортироваться в бизнесу.",
        minLevel: 3,
        syntax: "[ид_бизнеса]:n",
        handler: (player, args) => {
            var biz = mp.bizes.getBySqlId(args[0]);
            if (!biz) return terminal.error(`Бизнес с ID: ${args[0]} не найден!`, player);
            biz.position.z += 1;
            player.position = biz.position;
            terminal.info(`Вы телепортировались к бизнесу с ID: ${args[0]}`, player);
        }
    },
}
