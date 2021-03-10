const axios = require("axios");
const _ = require("lodash");
const dateFns = require("date-fns");
const pt = require("date-fns/locale/pt-BR");
require("dotenv-safe").config();

const ROCKETCHAT_USER = process.env.ROCKETCHAT_USER;
const ROCKETCHAT_PASSWORD = process.env.ROCKETCHAT_PASSWORD;
const ROCKETCHAT_URL = process.env.ROCKETCHAT_URL;

const rocketchat = axios.create({
    baseURL: ROCKETCHAT_URL,
});

const formattedDate = (date) =>
    dateFns.format(date, "'Dia' dd 'de' MMMM' de 'yyyy', às ' HH:mm'h'", {
        locale: pt,
    });

const getUsersInfo = async () => {
    const rocketchat_response = await rocketchat.post("/api/v1/login", {
        user: ROCKETCHAT_USER,
        password: ROCKETCHAT_PASSWORD,
    });

    const rocketchat_getPermissionsAll = await rocketchat.get(
        "/api/v1/users.list",
        {
            headers: {
                "X-Auth-Token": rocketchat_response.data.data.authToken,
                "X-User-Id": rocketchat_response.data.data.userId,
            },
        }
    );

    const today = new Date();

    const users = _.filter(rocketchat_getPermissionsAll.data.users, (user) => {
        const lastLogin = new Date(user.lastLogin);

        return lastLogin < dateFns.subDays(today, DAYS);
    });
    console.log("\n---\n");
    users.forEach(({ _id, username, name, lastLogin, createdAt, roles }) => {
        const temp_lastLogin = formattedDate(new Date(lastLogin));
        const temp_createAt = formattedDate(new Date(createdAt));
        console.log({
            _id,
            username,
            name,
            lastLogin: temp_lastLogin,
            createAt: temp_createAt,
            roles,
        });
        console.log("\n---\n");
    });
};

getUsersInfo();
