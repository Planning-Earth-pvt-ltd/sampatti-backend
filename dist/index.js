"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const prisma_1 = __importDefault(require("./prisma"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
// dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: "*" }));
app.get("/", (req, res) => {
    res.send("Backend working");
});
// Middleware
app.use("/api/v1/user", user_route_1.default);
app.use('/api/v1/property', propertyRoutes_1.default);
// Server and database starting
async function startServer() {
    try {
        const PORT = process.env.PORT || 5000;
        await prisma_1.default.$connect();
        console.log("Database Connected");
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    }
    catch (error) {
        console.log("error");
    }
}
;
startServer();
