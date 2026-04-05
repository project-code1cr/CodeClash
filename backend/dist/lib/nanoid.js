"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomId = void 0;
const nanoid_1 = require("nanoid");
const constants_1 = require("./constants");
const generate = (0, nanoid_1.customAlphabet)(constants_1.ROOM_ID.ALPHABET, constants_1.ROOM_ID.SIZE);
const generateRoomId = () => generate();
exports.generateRoomId = generateRoomId;
//# sourceMappingURL=nanoid.js.map