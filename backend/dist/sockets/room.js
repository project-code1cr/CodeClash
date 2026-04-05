"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoomSockets = setupRoomSockets;
const room_1 = __importDefault(require("../models/room"));
const constants_1 = require("../lib/constants");
const helper_1 = require("./helper");
const nanoid_1 = require("../lib/nanoid");
function setupRoomSockets(io) {
    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);
        // Create Room
        socket.on("create_room", async ({ isPrivate } = {}, callback) => {
            try {
                const room = new room_1.default({
                    creatorId: socket.id,
                    status: constants_1.ROOM_STATUS.WAITING,
                    isPrivate: Boolean(isPrivate),
                });
                const roomCode = (0, nanoid_1.generateRoomId)();
                room.roomCode = roomCode;
                await room.save();
                socket.join(roomCode);
                console.log(`Room created ${room._id} by ${socket.id}`);
                callback({
                    roomId: room._id,
                    creatorId: socket.id,
                    roomCode,
                    isPrivate: room.isPrivate,
                });
            }
            catch (error) {
                console.error("Create room error:", error);
                callback({ error: "Failed to create room" });
            }
        });
        // Get room info
        socket.on("get_room_info", async ({ roomId }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room) {
                    return callback({ error: "Room not found" });
                }
                // Backfill missing room codes for older/incomplete room documents.
                if (!room.roomCode) {
                    room.roomCode = (0, nanoid_1.generateRoomId)();
                    await room.save();
                }
                const users = room.joinedUser
                    ? [room.creatorId, room.joinedUser]
                    : [room.creatorId];
                let timeRemaining = null;
                if (room.status === constants_1.ROOM_STATUS.ACTIVE && room.startTime) {
                    const time = Math.floor((Date.now() - room.startTime) / 1000);
                    timeRemaining = Math.max(0, room.duration - time);
                }
                const isCreator = socket.id === room.creatorId;
                const hasSubmitted = isCreator
                    ? room.submissions?.creator?.submitted
                    : room.submissions?.joiner?.submitted;
                callback({
                    roomId: room._id,
                    users,
                    roomCode: room.roomCode,
                    isPrivate: room.isPrivate,
                    privateQuestionCount: room.privateQuestionCount,
                    privateCurrentQuestion: room.privateCurrentQuestion,
                    privateSolvedCount: room.privateSolvedCount,
                    status: room.status,
                    creatorId: room.creatorId,
                    problem: room.status === constants_1.ROOM_STATUS.ACTIVE ? room.problem : null,
                    startTime: room.startTime,
                    duration: room.duration,
                    timeRemaining,
                    hasSubmitted,
                    winner: room.winner,
                    submissions: room.status === constants_1.ROOM_STATUS.FINISHED ? room.submissions : null,
                    endTime: room.endTime,
                });
            }
            catch (error) {
                console.error("Get room info error:", error);
                callback({ error: "Failed to get room info" });
            }
        });
        // Join Room
        socket.on("join_room", async ({ roomCode }, callback) => {
            try {
                const room = await room_1.default.findOne({ roomCode });
                if (!room)
                    return callback({ error: "Room not found" });
                if (room.isPrivate) {
                    return callback({ error: "This is a private solo match" });
                }
                if (room.joinedUser)
                    return callback({ error: "Room full" });
                room.joinedUser = socket.id;
                await room.save();
                socket.join(roomCode);
                socket.to(roomCode).emit("user_joined", socket.id);
                let timeRemaining = null;
                if (room.status === constants_1.ROOM_STATUS.ACTIVE && room.startTime) {
                    const time = Math.floor((Date.now() - room.startTime) / 1000);
                    timeRemaining = Math.max(0, room.duration - time);
                }
                callback({
                    roomId: room._id,
                    users: [room.creatorId, room.joinedUser],
                    isPrivate: room.isPrivate,
                    status: room.status,
                    creatorId: room.creatorId,
                    problem: room.status === constants_1.ROOM_STATUS.ACTIVE ? room.problem : null,
                    startTime: room.startTime,
                    duration: room.duration,
                    timeRemaining,
                    hasSubmitted: false,
                    winner: room.winner,
                    submissions: room.status === constants_1.ROOM_STATUS.FINISHED ? room.submissions : null,
                    endTime: room.endTime,
                });
                console.log(`User ${socket.id} joined room ${roomCode}`);
            }
            catch (error) {
                console.error("Join room error:", error);
                callback({ error: "Failed to join room" });
            }
        });
        // Start Match
        socket.on("start_match", async ({ roomId, questionCount, durationMinutes }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room)
                    return callback({ error: "Room not found" });
                if (room.creatorId !== socket.id)
                    return callback({ error: "Only creator can start match" });
                if (!room.joinedUser && !room.isPrivate)
                    return callback({ error: "Waiting for opponent" });
                if (room.status !== constants_1.ROOM_STATUS.WAITING)
                    return callback({ error: "Match already started" });
                const isPrivate = Boolean(room.isPrivate);
                const parsedQuestionCount = Number(questionCount);
                const safeQuestionCount = Number.isFinite(parsedQuestionCount)
                    ? Math.min(10, Math.max(1, Math.floor(parsedQuestionCount)))
                    : 1;
                const parsedDurationMinutes = Number(durationMinutes);
                const safeDurationMinutes = Number.isFinite(parsedDurationMinutes)
                    ? Math.min(120, Math.max(1, Math.floor(parsedDurationMinutes)))
                    : 15;
                room.status = constants_1.ROOM_STATUS.ACTIVE;
                room.problem = isPrivate ? (0, constants_1.getRandomPracticeProblem)() : constants_1.HARDCODED_PROBLEM;
                room.privateQuestionCount = isPrivate ? safeQuestionCount : 1;
                room.privateCurrentQuestion = 1;
                room.privateSolvedCount = 0;
                if (isPrivate) {
                    room.duration = safeDurationMinutes * 60;
                }
                room.submissions = {
                    creator: { submitted: false },
                    joiner: { submitted: false },
                };
                room.startTime = Date.now() + 3000; // 3 sec for countdown
                await room.save();
                const matchData = {
                    problem: room.problem,
                    isPrivate: room.isPrivate,
                    privateQuestionCount: room.privateQuestionCount,
                    privateCurrentQuestion: room.privateCurrentQuestion,
                    privateSolvedCount: room.privateSolvedCount,
                    startTime: room.startTime,
                    duration: room.duration,
                    endTime: room.startTime + room.duration * 1000,
                };
                io.to(room.roomCode).emit("match_started", matchData);
                callback({ success: true });
                console.log(`Match started in room ${roomId}`);
                setTimeout(() => {
                    (0, helper_1.checkMatchEnd)(io, roomId);
                }, room.duration * 1000);
            }
            catch (error) {
                console.error("Start match error:", error);
                callback({ error: "Failed to start match" });
            }
        });
        // Private: move to next question
        socket.on("next_private_question", async ({ roomId }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room)
                    return callback({ error: "Room not found" });
                if (!room.isPrivate)
                    return callback({ error: "Not a private match" });
                if (room.creatorId !== socket.id)
                    return callback({ error: "Only creator can move to next question" });
                if (room.status !== constants_1.ROOM_STATUS.ACTIVE)
                    return callback({ error: "Match is not active" });
                if ((room.privateCurrentQuestion || 1) >= (room.privateQuestionCount || 1)) {
                    return callback({ done: true });
                }
                room.privateCurrentQuestion = (room.privateCurrentQuestion || 1) + 1;
                room.problem = (0, constants_1.getRandomPracticeProblem)();
                room.submissions = {
                    creator: { submitted: false },
                    joiner: { submitted: false },
                };
                await room.save();
                const payload = {
                    roomId: room._id,
                    problem: room.problem,
                    privateQuestionCount: room.privateQuestionCount,
                    privateCurrentQuestion: room.privateCurrentQuestion,
                    privateSolvedCount: room.privateSolvedCount,
                };
                socket.emit("private_question_updated", payload);
                callback({ success: true, ...payload });
            }
            catch (error) {
                console.error("Next private question error:", error);
                callback({ error: "Failed to move to next question" });
            }
        });
        // Private: end match early
        socket.on("end_private_match", async ({ roomId }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room)
                    return callback({ error: "Room not found" });
                if (!room.isPrivate)
                    return callback({ error: "Not a private match" });
                if (room.creatorId !== socket.id)
                    return callback({ error: "Only creator can end match" });
                room.status = constants_1.ROOM_STATUS.FINISHED;
                room.endTime = Date.now();
                room.winner = room.privateSolvedCount ? room.creatorId : "draw";
                await room.save();
                socket.emit("private_match_ended", {
                    roomId: room._id,
                    solvedCount: room.privateSolvedCount,
                    totalQuestions: room.privateQuestionCount,
                });
                callback({
                    success: true,
                    solvedCount: room.privateSolvedCount,
                    totalQuestions: room.privateQuestionCount,
                });
            }
            catch (error) {
                console.error("End private match error:", error);
                callback({ error: "Failed to end private match" });
            }
        });
        // End active match early (forfeit)
        socket.on("forfeit_match", async ({ roomId }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room)
                    return callback({ error: "Room not found" });
                if (room.status !== constants_1.ROOM_STATUS.ACTIVE)
                    return callback({ error: "Match is not active" });
                const isCreator = socket.id === room.creatorId;
                const isJoiner = socket.id === room.joinedUser;
                if (!isCreator && !isJoiner) {
                    return callback({ error: "You are not in this room" });
                }
                room.status = constants_1.ROOM_STATUS.FINISHED;
                room.endTime = Date.now();
                if (room.isPrivate) {
                    room.winner = room.privateSolvedCount ? room.creatorId : "draw";
                }
                else {
                    if (isCreator && room.joinedUser) {
                        room.winner = room.joinedUser;
                    }
                    else if (isJoiner) {
                        room.winner = room.creatorId;
                    }
                    else {
                        room.winner = "draw";
                    }
                }
                await room.save();
                io.to(room.roomCode).emit("match_ended", {
                    winner: room.winner,
                    endedBy: socket.id,
                    reason: "forfeit",
                    endTime: room.endTime,
                });
                callback({ success: true, winner: room.winner });
            }
            catch (error) {
                console.error("Forfeit match error:", error);
                callback({ error: "Failed to end match" });
            }
        });
        // Submit Code
        socket.on("submit_code", async ({ roomId, code }, callback) => {
            try {
                const room = await room_1.default.findById(roomId);
                if (!room)
                    return callback({ error: "Room not found" });
                if (room.status !== constants_1.ROOM_STATUS.ACTIVE) {
                    return callback({ error: "Match is not active" });
                }
                const isCreator = socket.id === room.creatorId;
                const isJoiner = socket.id === room.joinedUser;
                if (!isCreator && !isJoiner) {
                    return callback({ error: "You are not in this room" });
                }
                // Check if already submitted
                const alreadySubmitted = isCreator
                    ? room.submissions?.creator?.submitted
                    : room.submissions?.joiner?.submitted;
                if (alreadySubmitted) {
                    return callback({ error: "You have already submitted" });
                }
                // Record submission
                const submissionTime = Date.now();
                if (!room.submissions) {
                    room.submissions = {
                        creator: { submitted: false },
                        joiner: { submitted: false },
                    };
                }
                if (isCreator) {
                    room.submissions.creator = {
                        submitted: true,
                        submissionTime,
                        code,
                    };
                    if (room.isPrivate) {
                        const solved = room.privateSolvedCount || 0;
                        const current = room.privateCurrentQuestion || 1;
                        room.privateSolvedCount = Math.max(solved, current);
                    }
                }
                else {
                    room.submissions.joiner = {
                        submitted: true,
                        submissionTime,
                        code,
                    };
                }
                await room.save();
                socket.to(roomId).emit("opponent_submitted", {
                    userId: socket.id,
                });
                callback({
                    success: true,
                    submissionTime,
                });
                console.log(`User ${socket.id} submitted in room ${roomId}`);
                // Check if match should end
                await (0, helper_1.checkMatchEnd)(io, roomId);
            }
            catch (error) {
                console.error("Submit code error:", error);
                callback({ error: "Failed to submit code" });
            }
        });
        socket.on("disconnect", async () => {
            console.log("Client Disconnected", socket.id);
        });
    });
}
//# sourceMappingURL=room.js.map