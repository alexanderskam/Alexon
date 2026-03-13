import { model, Schema, Types } from 'mongoose';

const MessageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    body: { type: String },
    isChecked: { type: Boolean },
    createdAt: { type: Date },
});

export const Message = model('Message', MessageSchema);
