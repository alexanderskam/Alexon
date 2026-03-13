import { model, Schema, Types } from 'mongoose';

const ChatSchema = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    participantsKey: { type: String, unique: true },
});

export const Chat = model('Chat', ChatSchema);
