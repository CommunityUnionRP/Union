$(document).ready(() => {
    var houseMenu = new Vue({
        el: "#houseMenu",
        data: {
            render: false,
            houseId: 2,
            houseOwner: "",
            houseAddress: "",
            houseLock: "",
            houseLockAction: "",
            lockIcon: "",
            housePrice: 1,
            houseRooms: 1,
            houseGarage: "",
            houseGaragePlace: "",
            houseStatus: "Свободен",
            houseClass: "",
            houseSquare: 13
        },
        methods: {
            active: function() {
                return $("#houseMenu").css("display") != "none";
            },
            showMenu: function(id, interior, owner, address, type, lock, rooms, garage, garagecount, price, rooms, square) {
                this.$data.houseId = id;
                this.$data.houseOwner = owner;
                this.$data.houseAddress = address + ", дом №" + id;
                this.$data.houseClass = globalConstants.houseClasses[type];

                /*if (interior === 1) {
                    this.$data.houseRooms = 2;
                    this.$data.houseSquare = 65;
                } else if (interior === 2) {
                    this.$data.houseRooms = 1;
                    this.$data.houseSquare = 35;
                } else if (interior === 3) {
                    this.$data.houseRooms = 3;
                    this.$data.houseSquare = 90;
                } else if (interior === 4) {
                    this.$data.houseRooms = 4;
                    this.$data.houseSquare = 160;
                }*/
                this.$data.houseRooms = rooms;
                this.$data.houseSquare = square;


                if (lock) this.$data.houseLock = "Закрыт";
                else this.$data.houseLock = "Открыт";

                if (owner.length > 3) this.$data.houseStatus = "Занят";
                else this.$data.houseStatus = "Свободен";

                this.$data.houseGarage = garage;

                if (garagecount) this.$data.houseGaragePlace = "1";
                else this.$data.houseGaragePlace = "Отсутствует";

                this.$data.housePrice = price;

                $("#houseMenu .img-class").attr("src", `img/houseMenu/classes/${this.$data.houseClass}.jpg`);

                $(".house-menu-header").hide();
                $(".house-menu").hide();

                $("#houseMenu").show();
                $(".house-header").show();
                $(".house-info").show();

                mp.trigger(`setHouseMenuActive`, true);
            },
            showOwnerMenu: function(lock) {

                if (lock) {
                    this.$data.houseLockAction = "Открыть";
                    this.$data.lockIcon = "img/houseMenu/lock-lock.png";
                } else {
                    this.$data.houseLockAction = "Закрыть";
                    this.$data.lockIcon = "img/houseMenu/open-lock.png";
                }

                $(".house-header").hide();
                $(".house-info").hide();

                $("#houseMenu").show();
                $(".house-menu-header").show();
                $(".house-menu").show();

                mp.trigger(`setHouseMenuActive`, true);
            },
            hideOwnerMenu: function() {
                $("#houseMenu").hide();
                $(".house-menu-header").hide();
                $(".house-menu").hide();

                mp.trigger(`setHouseMenuActive`, false);
            },
            lockUnlockHouse: function() {
                mp.trigger("lockUnlockHouse");
            },
            inspectHouse: function() {
                mp.trigger("inspectHouse");
            },
            enterHouse: function() {
                mp.trigger("enterHouse");
            },
            enterGarage: function() {
                mp.trigger("enterGarage");
            },
            sellHouseToGov: function() {
                mp.trigger("sellHouseToGov");
            },
            sellHouseToPlayer: function() {
                mp.trigger("sellHouseToPlayer");
            },
            showHousePlan: function() {
                $(".house-info").hide();
                $(".house-plan").show();
            },
            backToMenu: function() {
                $(".house-plan").hide();
                $(".house-info").show();
            },
            buyHouse: function() {
                mp.trigger("buyHouse");
            },
            invitePlayer: function() {
                mp.trigger("invitePlayer");
            },
            exitMenu: function() {
                $("#houseMenu").hide();
                $(".house-header").hide();
                $(".house-plan").hide();
                $(".house-info").hide();
                $(".house-menu-header").hide();
                $(".house-menu").hide();
                mp.trigger("exitHouseMenu", false);
                mp.trigger(`setHouseMenuActive`, false);
            }
        }
    });
});
