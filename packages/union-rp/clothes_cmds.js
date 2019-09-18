module.exports = {
    "clothes_variation": {
        description: "Сменить variation одежды. Type:<br/>bracelets,ears,feets,glasses,hats,legs,masks,ties,top,watches",
        minLevel: 5,
        syntax: "[clothes_id]:n [type]:s [variation]:n",
        handler: (player, args) => {
            var names = ["bracelets", "ears", "feets", "glasses", "hats", "legs", "masks", "ties", "top", "watches"];
            if (names.indexOf(args[1]) == -1) return terminal.error(`Неверный тип одежды!`);
            var com = mp.getClothes(args[1], args[0]);
            if (!com) return terminal.error(`Компонент одежды не найден!`, player);

            com.variation = args[2];
            DB.Handle.query(`UPDATE store_${args[1]} SET variation=? WHERE id=?`, [args[2], args[0]]);
            terminal.info(`${player.name} обновил variation у одежды с ID: ${args[0]}`);
        }
    },
    "clothes_price": {
        description: "Сменить price одежды. Type:<br/>bracelets,ears,feets,glasses,hats,legs,masks,ties,top,watches",
        minLevel: 5,
        syntax: "[clothes_id]:n [type]:s [price]:n",
        handler: (player, args) => {
            var names = ["bracelets", "ears", "feets", "glasses", "hats", "legs", "masks", "ties", "top", "watches"];
            if (names.indexOf(args[1]) == -1) return terminal.error(`Неверный тип одежды!`);
            var com = mp.getClothes(args[1], args[0]);
            if (!com) return terminal.error(`Компонент одежды не найден!`, player);

            com.price = args[2];
            DB.Handle.query(`UPDATE store_${args[1]} SET price=? WHERE id=?`, [args[2], args[0]]);
            terminal.info(`${player.name} обновил price у одежды с ID: ${args[0]}`);
        }
    },
    "clothes_size": {
        description: "Сменить rows и cols. Эти параметры определяют, сколько может хранить предметов одежда. Type:<br/>legs,top",
        minLevel: 5,
        syntax: "[clothes_id]:n [type]:s [rows]:n [cols]:n",
        handler: (player, args) => {
            var names = ["legs", "top"];
            if (names.indexOf(args[1]) == -1) return terminal.error(`Неверный тип одежды!`);
            var com = mp.getClothes(args[1], args[0]);
            if (!com) return terminal.error(`Компонент одежды не найден!`, player);

            com.rows = Math.clamp(args[2], 1, 10);
            com.cols = Math.clamp(args[3], 1, 10);
            DB.Handle.query(`UPDATE store_${args[1]} SET rows=?,cols=? WHERE id=?`, [com.rows, com.cols, args[0]]);
            terminal.info(`${player.name} обновил rows и cols у верхней одежды с ID: ${args[0]}`);
        }
    },
    "clothes_addtexture": {
        description: "Добавить texture одежды. Type:<br/>bracelets,ears,feets,glasses,hats,legs,masks,ties,top,watches",
        minLevel: 5,
        syntax: "[clothes_id]:n [type]:s [texture]:n",
        handler: (player, args) => {
            var names = ["bracelets", "ears", "feets", "glasses", "hats", "legs", "masks", "ties", "top", "watches"];
            if (names.indexOf(args[1]) == -1) return terminal.error(`Неверный тип одежды!`);
            var com = mp.getClothes(args[1], args[0]);
            if (!com) return terminal.error(`Компонент одежды не найден!`, player);
            if (com.textures.indexOf(args[2]) != -1) terminal.error(`Данная текстура у компонента уже имеется!`, player);

            com.textures.push(args[2]);
            DB.Handle.query(`UPDATE store_${args[1]} SET textures=? WHERE id=?`, [JSON.stringify(com.textures), args[0]]);
            terminal.info(`${player.name} обновил textures у ${args[1]} одежды с ID: ${args[0]}`);
        }
    },
    "clothes_deletetexture": {
        description: "Удалить texture одежды. Type:<br/>bracelets,ears,feets,glasses,hats,legs,masks,ties,top,watches",
        minLevel: 5,
        syntax: "[clothes_id]:n [type]:s [texture]:n",
        handler: (player, args) => {
            var names = ["bracelets", "ears", "feets", "glasses", "hats", "legs", "masks", "ties", "top", "watches"];
            if (names.indexOf(args[1]) == -1) return terminal.error(`Неверный тип одежды!`);
            var com = mp.getClothes(args[1], args[0]);
            if (!com) return terminal.error(`Компонент одежды не найден!`, player);
            var tIndex = com.textures.indexOf(args[2]);
            if (tIndex == -1) terminal.error(`Данная текстура у компонента не найдена!`, player);

            com.textures.splice(tIndex, 1);
            DB.Handle.query(`UPDATE store_${args[1]} SET textures=? WHERE id=?`, [JSON.stringify(com.textures), args[0]]);
            terminal.info(`${player.name} обновил textures у ${args[1]} одежды с ID: ${args[0]}`);
        }
    },
}
