"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_ID = exports.ROOM_STATUS = void 0;
var ROOM_STATUS;
(function (ROOM_STATUS) {
    ROOM_STATUS["WAITING"] = "waiting";
    ROOM_STATUS["ACTIVE"] = "active";
    ROOM_STATUS["FINISHED"] = "finished";
})(ROOM_STATUS || (exports.ROOM_STATUS = ROOM_STATUS = {}));
exports.ROOM_ID = {
    ALPHABET: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    SIZE: 6,
};
//# sourceMappingURL=enum.js.map